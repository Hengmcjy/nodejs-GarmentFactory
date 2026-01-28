import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Subscription } from 'rxjs';
import { GBC } from 'src/app/global/const-global';
import { Company } from 'src/app/models/app.model';
import { RepQTYEditList } from 'src/app/models/report.model';
import { OrderService } from 'src/app/services/order.service';
import { ReportService } from 'src/app/services/report.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-smd-rep-process-edit-qty',
  templateUrl: './smd-rep-process-edit-qty.component.html',
  styleUrls: ['./smd-rep-process-edit-qty.component.scss']
})
export class SmdRepProcessEditQtyComponent implements OnInit, AfterViewInit, OnDestroy {
    @ViewChild('input1', { static: false }) scanInputBox!: ElementRef;

    data: any;
    company: Company = GBC.clrCompany();

    seasonYear = '';
    orderID = '';
    newQTY = 0;
    editType = '';
    setName = '';
    dataRQTYE = GBC.clrDataRQTYE();

    productStatus: string[] = [];
    orderStatus: string[] = [];
    // repQTYEditList: RepQTYEditList[] = [];


    private repQTYEditSub: Subscription = new Subscription;

    constructor(
        public config: DynamicDialogConfig,
        public ref: DynamicDialogRef,

        public userService: UserService,
        private orderService: OrderService,
        // private productService: ProductService,
        // private socketService: SocketIOService,
        // public nsService: NodeStationService,
        private repService: ReportService
    ) {}

    ngOnInit(): void {
        this.data = this.config.data;
        // console.log(this.data);
        this.seasonYear = this.data.seasonYear;
        this.editType = this.data.editType;
        this.orderID = this.data.orderID;
        this.setName = this.data.setName;
        this.productStatus = this.data.productStatus;
        this.orderStatus = this.data.orderStatus;
        this.newQTY = this.data.newQTY===0?null:this.data.newQTY;
        this.company = this.userService.getCompany();

        this.dataRQTYE = GBC.clrDataRQTYE();
        this.dataRQTYE = {
            datetime: new Date(),
            orderID: this.orderID,
            color: this.data.color,
            fromNode: this.data.fromNode,
            productColor: this.data.productColor,

            productSize: this.data.productSize,
            size: this.data.size,
            sizeSeq: this.data.sizeSeq,
            sumProductQty: this.newQTY === null?-1:this.newQTY,
            targetPlaceID: this.data.targetPlaceID,
            targetPlaceSeq: this.data.targetPlaceSeq,
            createBy: this.userService.getCreateBy()
        };
        // if (this.data.repActive === '') {
        //     this.editType = '';
        // } else if (this.data.repActive === '') {
        //     this.editType = '';
        // } else {
        //     this.editType = '';
        // }

    }

    ngAfterViewInit(): void {
        this.scanInputBox.nativeElement.focus(); // ## input setfocus
        this.scanInputBox.nativeElement.select();
    }

    postRepCompanyOrderZonePeriod() {
        // postRepCompanyOrderZonePeriod(companyID: string, editType: string, seasonYear: string, orderID: string, setName: string,
        //         dataRQTYE: DataRQTYE)
        const companyID = this.company.companyID;
        this.repService.postRepCompanyOrderZonePeriod(
            companyID, this.editType, this.seasonYear, this.orderID, this.setName, this.dataRQTYE);

        if (this.repQTYEditSub) { this.repQTYEditSub.unsubscribe(); }
        this.repQTYEditSub = this.repService.getRepQTYEditListener().subscribe((data) => {
            if (data.success) {
                // this.repService.getRepCurrentProductionZonePeriod(
                //     this.company.companyID, this.productStatus, this.orderStatus, this.seasonYear);
                this.closeDialog(data.success);
            }
        });
    }

    closeDialog(success: boolean) {
        this.ref.close(success);
    }

    saveEditQTY() {
        // console.log('saveEditQTY ', this.newQTY);
        if (this.newQTY === null) {
            this.dataRQTYE.sumProductQty = -1;
        } else {
            this.dataRQTYE.sumProductQty = this.newQTY;
            this.postRepCompanyOrderZonePeriod();
        }

    }

    newQTYChange() {
        // console.log('newQTYChange ', this.newQTY);
        // this.newQTY = +this.newQTY + 0;
    }

    ngOnDestroy(): void {
        if (this.repQTYEditSub) { this.repQTYEditSub.unsubscribe(); }
        // if (this.repCurrentProductionBundleStateSub) { this.repCurrentProductionBundleStateSub.unsubscribe(); }
        // if (this.customer1CompanySub) { this.customer1CompanySub.unsubscribe(); }
        // if (this.dataAroundAppSub) { this.dataAroundAppSub.unsubscribe(); }

        // if (this.langSub) { this.langSub.unsubscribe(); }
    }
}
