import { Component, OnDestroy, OnInit } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Subscription } from 'rxjs';
import { GBC } from 'src/app/global/const-global';
import { Company } from 'src/app/models/app.model';
import { Order, OrderProduction, ProductBarcodeNoReserve } from 'src/app/models/order.model';
import { User } from 'src/app/models/user.model';
import { OrderService } from 'src/app/services/order.service';
import { UserService } from 'src/app/services/user.service';

@Component({
    selector: 'app-s-qrcode-manage',
    templateUrl: './s-qrcode-manage.component.html',
    styleUrls: ['./s-qrcode-manage.component.scss'],
    providers: [ConfirmationService,MessageService]
})
export class SQrcodeManageComponent implements OnInit, OnDestroy {

    company: Company = GBC.clrCompany();
    user: User = GBC.clrUser();
    order: Order = GBC.clrOrder();
    orderProduction: OrderProduction = GBC.clrOrderProduction();
    productBarcodeNoInput = '';
    setName = '';

    productBarcodeNoReplace = '';

    mode = 'product-scan'; // ##
    data: any = {
        style: '',
        zone: '',
        country: '',
        year: '',
        color1: '',
        color2: '',
        color3: '',
        color4: '',
        color5: '',
        size: '',
        no: ''
    };

    private dataAroundAppSub: Subscription = new Subscription;

    constructor(
        private confirmationService: ConfirmationService,
        private messageService: MessageService,

        public userService: UserService,
        private orderService: OrderService,
    ) {}

    ngOnInit(): void {
        this.company = this.userService.getCompany();
        this.user = this.userService.getUser();
        this.order = this.orderService.getOrder();
        this.orderProduction = this.userService.getOrderProduction();
        this.productBarcodeNoInput = this.orderProduction.productBarcodeNo;

        if (this.order.orderColor.length > 0) {
            this.setName = this.order.orderColor[0].setName;
        }

        // ## get DataAroundApp
        // ## user auth  isAuthenticated / dataAroundApp

        this.dataAroundAppSub = this.userService.getDataAroundAppStatusListener().subscribe((dataAroundApp) => {
            this.orderProduction = dataAroundApp.orderProductionInfo.orderProduction;
            this.productBarcodeNoInput = this.orderProduction.productBarcodeNo;
            // console.log(this.orderProduction);
            // getDataFromBarcodeNo(barcodeNo: string)
            this.data = this.userService.getDataFromBarcodeNo(this.orderProduction.productBarcodeNoReal);
        });
        // console.log(this.orderProduction);
    }

    confirmReplace() {
        this.confirmationService.confirm({
            message: 'Are you sure that you want to replace QRcode?',
            accept: () => {
                this.messageService.add({severity:'info', summary:'Confirmed', detail:'You have accepted'});
                this.putOrderProductionQrcodeReplacement();
            }
        });
    }

    putOrderProductionQrcodeReplacement() {
        // putOrderProductionQrcodeReplacement(userID: string, companyID: string, factoryID: string, orderID: string,
        //     productBarcodeNo: string, productBarcodeNoNew: string,
        //     productBarcodeNoReserve: ProductBarcodeNoReserve)
        const nodeID = this.orderProduction.productionNode[this.orderProduction.productionNode.length-1].toNode;
        const productBarcodeNoReserve: ProductBarcodeNoReserve = {
            productBarcodeNo: this.productBarcodeNoReplace,
            datetime: new Date(),
            nodeID: nodeID,
            createBy: this.userService.getCreateBy()
        };
        this.orderService.putOrderProductionQrcodeReplacement(
            this.user.userID,
            this.company.companyID,
            this.userService.getFactory().factoryID,
            this.orderProduction.orderID,
            this.orderProduction.productBarcodeNoReal,
            this.productBarcodeNoReplace,
            productBarcodeNoReserve
        );
    }

    changeMode(mode: string) {
        this.mode = mode;
    }

    ngOnDestroy(): void {
        if (this.dataAroundAppSub) { this.dataAroundAppSub.unsubscribe(); }
        // if (this.qrCodeListProductStyleCFNSub) { this.qrCodeListProductStyleCFNSub.unsubscribe(); }
        // if (this.dataAroundNodeAppSub) { this.dataAroundNodeAppSub.unsubscribe(); }
        // if (this.repCurrentProductQtyCFNSub) { this.repCurrentProductQtyCFNSub.unsubscribe(); }

        // if (this.errSub) { this.errSub.unsubscribe(); }
        // if (this.langSub) { this.langSub.unsubscribe(); }
        // if (this.langListSub) { this.langListSub.unsubscribe(); }

        // this.userService.setOrderProduction(this.userService.clrOrderProduction());
    }
}
