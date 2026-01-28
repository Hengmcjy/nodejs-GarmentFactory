import { Component, OnDestroy, OnInit } from '@angular/core';
import { MessageService } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import { Subscription } from 'rxjs';
import { GBC } from 'src/app/global/const-global';
import { Company, Factory } from 'src/app/models/app.model';
import { OrderProduction } from 'src/app/models/order.model';
import { ProductionRepairCount } from 'src/app/models/report.model';
import { User } from 'src/app/models/user.model';
import { NodeFlow, NodeStation } from 'src/app/models/workstation.model';
import { NodeStationService } from 'src/app/services/node-station.service';
import { UserService } from 'src/app/services/user.service';

@Component({
    selector: 'app-s-node-product-repair',
    templateUrl: './s-node-product-repair.component.html',
    styleUrls: ['./s-node-product-repair.component.scss'],
    providers: [DialogService, MessageService],
})
export class SNodeProductRepairComponent implements OnInit, OnDestroy {
    pageActive = 'production-repair';
    // @ViewChild('input1', {static: false}) scanInputBox: ElementRef;

    staff: User = GBC.clrUser();
    nodeStation: NodeStation = GBC.clrNodeStation();
    company: Company = GBC.clrCompany();
    factory: Factory = GBC.clrFactory();
    stationID = '';
    nodeFlows: NodeFlow[] = [];
    nodeFlow: NodeFlow = GBC.clrNodeFlow();
    toNode = '';
    orderProduction: OrderProduction = GBC.clrOrderProduction();

    productionRepairCount: ProductionRepairCount[] = [];
    // productionProblemCount: ProductionRepairCount[] = [];
    currentProductAllDetailCFN: any[] = [];
    // currentProductRepair: any[] = [];
    productBarcodeNoInput = '';
    limit = 20;
    countProductionsRepair = 0;

    private getRepairProductCFNSub: Subscription = new Subscription;

    constructor(
        public dialogService: DialogService,
        public messageService: MessageService,

        public userService: UserService,
        public nsService: NodeStationService,
    ) {}

    ngOnInit(): void {
        this.nsService.setMenuActive(this.pageActive);
        this.nsService.setDataAroundNodeApp('isOutsourceMode', false);

        this.staff = this.nsService.staff;
        this.nodeStation = this.nsService.nodeStation;
        this.company = this.userService.getCompany();
        this.factory = this.userService.getFactory();
        this.stationID = this.nsService.stationID;
        this.nodeFlows = this.nsService.nodeFlows;
        this.nodeFlow = this.nsService.nodeFlow;

        // console.log(this.nsService.staff);
        this.getRepairProductCFN(1);
    }

    getRepairProductCFN(page: number) {
        const productStatus = ['problem'];
        // getProblemProductCFN(companyID: string, factoryID: string, nodeID: string, productStatus: string[], page: number, limit: number)
        this.nsService.getRepairProductCFN(
            this.company.companyID, this.factory.factoryID, this.nodeStation.nodeID, productStatus, page, this.limit
        );
        if (this.getRepairProductCFNSub) { this.getRepairProductCFNSub.unsubscribe(); }
        this.getRepairProductCFNSub = this.nsService.getProblemProductCFNUpdatedListener().subscribe((data) => {
            // console.log(data);
            this.currentProductAllDetailCFN = data.currentProductAllDetailCFN;
            this.productionRepairCount = data.productionCount;
            if (this.productionRepairCount.length > 0) {
                this.countProductionsRepair = this.productionRepairCount[0].countProductQty;
            } else { this.countProductionsRepair = 0;}
            // this.countProductionsAll = data.countProductionsAll;

        });
    }

    // getDatarecordProductBarcodeNo() {
    //     this.putScanOrderProductionBarcodeNo(this.productBarcodeNoInput);
    // }

    // putScanOrderProductionBarcodeNo(productBarcodeNo: string) {
    //     // putScanOrderProductionBarcodeNo(userID: string, companyID: string, factoryID: string,
    //     //                                  productBarcodeNo: string, nodeID: string, stationID: string)
    //     // console.log(productBarcodeNo);
    //     this.orderProduction = this.userService.clrOrderProduction();
    //     this.nsService.putScanOrderProductionBarcodeNo(
    //         this.staff.userID, this.company.companyID, this.factory.factoryID, productBarcodeNo,
    //         this.nodeStation.nodeID, this.stationID
    //     );
    //     if (this.scanOrderProductionBarcodeNoSub) { this.scanOrderProductionBarcodeNoSub.unsubscribe(); }
    //     this.scanOrderProductionBarcodeNoSub = this.nsService.getScanOrderProductionBarcodeNoUpdatedListener().subscribe((data) => {
    //         // console.log(data);
    //         this.orderProduction = data.orderProduction;
    //         if (data.success) {
    //             // this.addOrderProductionBarcodeNoToTemp(data.orderProduction);
    //         } else {
    //             // this.addOrderProductionBarcodeNoToTemp(data.orderProduction);
    //             this.productBarcodeNoInput = '';
    //             // const scanItem: ScanItem = {
    //             //     orderID: '',
    //             //     productBarcodeNundleCount: '',
    //             //     productID: '',
    //             //     bundleNo: 0,
    //             //     bundleCount: 0,
    //             //     productBarcodeNo: productBarcodeNo,
    //             //     status: 'err',
    //             //     serverCheckState: ''
    //             // };

    //             // // ## add to orderProductionScanAll
    //             // this.orderProductionScanAll.scanItem.unshift(scanItem); // ## add to position first
    //             // this.orderProductionScanAll.scanItem = this.orderProductionScanAll.scanItem.slice(0, this.scanLimit);

    //             this.messageService.add({
    //                 severity: 'error',
    //                 summary: 'Error [ ' + data.message.messageID + ' ]',
    //                 detail: data.message.value + ' [ '+data.message.mode+' ] ',
    //                 sticky: false,
    //             });
    //         }
    //     });
    // }

    paginate(event: any) {
        // console.log(event.rows, +event.page);
        this.limit = event.rows;
        this.getRepairProductCFN(+event.page + 1);

        //event.first = Index of the first record
        //event.rows = Number of rows to display in new page
        //event.page = Index of the new page
        //event.pageCount = Total number of pages
    }




    ngOnDestroy(): void {
        // if (this.scanOrderProductionBarcodeNoSub) { this.scanOrderProductionBarcodeNoSub.unsubscribe(); }
        if (this.getRepairProductCFNSub) { this.getRepairProductCFNSub.unsubscribe(); }

        // if (this.dataAroundAppSub) { this.dataAroundAppSub.unsubscribe(); }
        // if (this.errSub) { this.errSub.unsubscribe(); }
        // if (this.langSub) { this.langSub.unsubscribe(); }
        // if (this.langListSub) { this.langListSub.unsubscribe(); }
    }
}
