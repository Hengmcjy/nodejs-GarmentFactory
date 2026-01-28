import { Component, OnDestroy, OnInit } from '@angular/core';
import { MenuItem, MessageService } from 'primeng/api';
import { Subscription } from 'rxjs';
import { NavigationExtras, Router } from '@angular/router';

import { Company, Factory } from 'src/app/models/app.model';
import { OrderProductQtyByOrderIDProductIDRep, ProductStateStyleTargetPlaceColorSize, RepDataFormat1 } from 'src/app/models/report.model';
import { NodeFlow, NodeStation } from 'src/app/models/workstation.model';

import { NodeStationService } from 'src/app/services/node-station.service';
import { ProductService } from 'src/app/services/product.service';
import { ReportService } from 'src/app/services/report.service';
import { SocketIOService } from 'src/app/services/socketio.service';
import { UserService } from 'src/app/services/user.service';
import { SShowQrcodeComponent } from '../../../order/s-show-qrcode/s-show-qrcode.component';
import { DialogService } from 'primeng/dynamicdialog';
import { GBC } from 'src/app/global/const-global';

@Component({
    selector: 'app-node-home',
    templateUrl: './node-home.component.html',
    styleUrls: ['./node-home.component.scss'],
    providers: [DialogService, MessageService],
})
export class NodeHomeComponent implements OnInit, OnDestroy {
    nodeMenuActive = 'home';

    productImageProfileGCSPath = GBC.productImageProfileGCSPath; // ## google storage path image profile

    nodeStation: NodeStation = GBC.clrNodeStation();
    company: Company = GBC.clrCompany();
    factory: Factory = GBC.clrFactory();
    stationID = '';
    nodeFlows: NodeFlow[] = [];
    nodeFlow: NodeFlow = GBC.clrNodeFlow();
    companyID = '';
    factoryID = '';
    nodeID = '';

    repListName: string[] = [];
    items: MenuItem[] = [];

    timer: any;
    durationRefreshHomePage = 60;

    allProductQty = '';
    totalBundle = '';
    countOrderID = '';
    countProductID = '';

    orderProductQtyByOrderIDProductIDRep: OrderProductQtyByOrderIDProductIDRep[] = [];
    productStateStyleTargetPlaceColorSize: ProductStateStyleTargetPlaceColorSize[] = [];

    private dataAroundNodeAppSub: Subscription = new Subscription;
    private dataNodeStationSub: Subscription = new Subscription;
    private repCurrentProductQtyCFNSub: Subscription = new Subscription;

    constructor(
        public dialogService: DialogService,
        public messageService: MessageService,
        private router: Router,

        public userService: UserService,
        private productService: ProductService,
        private socketService: SocketIOService,
        public nsService: NodeStationService,
        private repService: ReportService,
    ) {}

    ngOnInit(): void {
        this.items = [{
            label: 'File',
            items: [
                {label: 'New', icon: 'pi pi-fw pi-plus'},
                {label: 'Download', icon: 'pi pi-fw pi-download'}
            ]
        },
        {
            label: 'Edit',
            items: [
                {label: 'Add User', icon: 'pi pi-fw pi-user-plus'},
                {label: 'Remove User', icon: 'pi pi-fw pi-user-minus'}
            ]
        }];

        this.nsService.setMenuActive(this.nodeMenuActive);
        this.nsService.setDataAroundNodeApp('isOutsourceMode', false);


        this.nodeStation = this.nsService.nodeStation;
        this.company = this.userService.getCompany();
        this.factory = this.userService.getFactory();
        this.stationID = this.nsService.stationID;
        this.nodeFlows = this.nsService.nodeFlows;
        this.nodeFlow = this.nsService.nodeFlow;
        // console.log(this.company);
        // console.log(this.factory);
        // console.log(this.nsService.stationID);

        // this.nsService.nodeMenuActive = this.nodeMenuActive;
        // console.log(this.nsService.staff);
        this.allProductQty = this.nsService.allProductQty;
        this.totalBundle = this.nsService.totalBundle;
        this.countOrderID = this.nsService.countOrderID;
        this.countProductID = this.nsService.countProductID;

        this.durationRefreshHomePage = this.nsService.durationRefreshHomePage;

        this.companyID = this.company.companyID;
        this.factoryID = this.factory.factoryID;
        this.nodeID = this.nodeStation.nodeID;

        // ## get nodestations
        const status = ['a', 'c'];
        this.nsService.getNodeStationsList(this.companyID, this.factoryID, status, 1, 20);

        this.dataAroundNodeAppSub = this.nsService.getDataAroundNodeAppStatusListener().subscribe(dataAroundNodeApp => {
            // console.log(dataAroundNodeApp.refreshCurrentPage, );
            // console.log(this.nodeMenuActive, dataAroundNodeApp.refreshPage);
            if (dataAroundNodeApp.refreshCurrentPage && this.nodeMenuActive === dataAroundNodeApp.refreshPage) {
                // console.log('this.nodeMenuActive === dataAroundNodeApp.refreshPage');

                // this.getRepCurrentProductQtyCFNUpdatedListener();
            }
        });

        this.getDataNodeStationUpdatedListener();
        // this.getRepCurrentProductQtyCFNUpdatedListener();
        this.setTimer(this.durationRefreshHomePage);
    }

    private setTimer(duration: number) {
        clearTimeout(this.timer);
        this.timer = setInterval(() => {
            // this.getRepCurrentProductQtyCFNUpdatedListener();
        }, duration * 1000);
    }

    getRepCurrentProductQtyCFNUpdatedListener() {
        // console.log('getRepCurrentProductQtyCFNUpdatedListener');
        // console.log('----------------------');
        // if (this.repCurrentProductQtyCFNSub) { this.repCurrentProductQtyCFNSub.unsubscribe(); }
        // this.repCurrentProductQtyCFNSub = this.nsService.getRepCurrentProductQtyCFNUpdatedListener().subscribe((data) => {
        //     console.log(data);
        //     this.showDataReport(data.repDataFormat1, data.repListNameArr);
        // });

        // console.log(this.companyID, this.factoryID, this.nodeID);
        if (this.companyID !== '') {

            // ## 1 report current node station product qty
            const productStatus = ['normal', 'problem', 'repaired'];
            this.repListName = [
                // 'getRepCFNCurrentProductQty',

                // 'allTotalProduct',
                // 'getRepCFNCurrentProductQtyByOrderID',
                'getRepCFNCurrentProductQtyByOrderIDProductID',
                // 'getRepCFNCurrentProductBundleList',

                'getAllOrderAndProductFromOrderProduction',
                // 'getRepCFNProductState',  // ## style-targetPlace-year-5color-size-sex-#####    /   8  4  2  10  3  1  99999



                // 'getRepCFNCurrentProductionQueueCFN',

                // 'getRepCFNCurrentProductAllDetail',
                // 'getRepCFNCurrentProductAllRepairCount',
                // 'getRepCFNCurrentProductAllProblemCount',

            ];
            // console.log('000');
            this.repService.getRepCurrentProductQtyCFN(this.companyID, this.factoryID, this.nodeID, productStatus, this.repListName);
            if (this.repCurrentProductQtyCFNSub) { this.repCurrentProductQtyCFNSub.unsubscribe(); }
            this.repCurrentProductQtyCFNSub = this.repService.getRepCurrentProductQtyCFNUpdatedListener().subscribe((data) => {
                // console.log(data);

                this.showDataReport(data.repDataFormat1, data.repListNameArr);
            });

        }
    }

    showDataReport(repDataFormat1: RepDataFormat1, repListNameArr: string[]) {
        if (repListNameArr.includes('allTotalProduct')) {
            this.nsService.allProductQty = repDataFormat1.allProductQty+'';
            this.allProductQty = repDataFormat1.allProductQty+'';
        }
        if (repListNameArr.includes('getRepCFNCurrentProductQty')) {
            this.nsService.allProductQty = repDataFormat1.allProductQty+'';
            this.allProductQty = repDataFormat1.allProductQty+'';
        }
        if (repListNameArr.includes('getRepCFNCurrentProductQtyByOrderID')) {
            this.nsService.countOrderID = repDataFormat1.orderProductQtyByOrderIDRep.length+'';
            this.countOrderID = repDataFormat1.orderProductQtyByOrderIDRep.length+'';
        }
        if (repListNameArr.includes('getRepCFNCurrentProductQtyByOrderIDProductID')) {
            this.nsService.countProductID = repDataFormat1.orderProductQtyByOrderIDProductIDRep.length+'';
            this.countProductID = repDataFormat1.orderProductQtyByOrderIDProductIDRep.length+'';
            this.orderProductQtyByOrderIDProductIDRep = repDataFormat1.orderProductQtyByOrderIDProductIDRep;
            this.orderProductQtyByOrderIDProductIDRep.sort((a,b)=>{
                return a.productID >b.productID?1:a.productID <b.productID?-1:0
            });
            // console.log(this.orderProductQtyByOrderIDProductIDRep);
        }
        if (repListNameArr.includes('getRepCFNCurrentProductBundleList')) {
            this.nsService.totalBundle = repDataFormat1.orderProductQtyBundleListRep.length+'';
            this.totalBundle = repDataFormat1.orderProductQtyBundleListRep.length+'';
        }
        if (repListNameArr.includes('getAllOrderAndProductFromOrderProduction')) {
            this.userService.setOrders(repDataFormat1.orders);
            // console.log(this.userService.getOrders());
            // this.nsService.setOrders(repDataFormat1.orders);
            // console.log(repDataFormat1.orders);
            this.nsService.orders = repDataFormat1.orders;
            this.nsService.products = repDataFormat1.products;
        }
        if (repListNameArr.includes('getRepCFNProductState')) {
            this.productStateStyleTargetPlaceColorSize = repDataFormat1.productStateStyleTargetPlaceColorSize;

            this.productStateStyleTargetPlaceColorSize.forEach( (item, index) => {
                item.size = this.userService.strReplaceAll(item.size, '-', '');
                // item.color = this.userService.strReplaceAll(item.color, '-', '');
                // item.targetPlace = this.userService.strReplaceAll(item.targetPlace, '-', '');
            });

            this.productStateStyleTargetPlaceColorSize.forEach( (item, index) => {
                // item.color = this.userService.changeColorTextToColorTextComma(item.color);
                item.sizeSeq = this.userService.getSizeSeq(item.size);
            });

            this.productStateStyleTargetPlaceColorSize.sort((a,b)=>{
                return a.style >b.style?1:a.style <b.style?-1:0
                || a.targetPlace >b.targetPlace?1:a.targetPlace <b.targetPlace?-1:0
                || a.color >b.color?1:a.color <b.color?-1:0
                || a.sizeSeq >b.sizeSeq?1:a.sizeSeq <b.sizeSeq?-1:0
            });
            // console.log(this.productStateStyleTargetPlaceColorSize);

        }
        if (repListNameArr.includes('getRepCFNCurrentProductionQueueCFN')) {


        }
        if (repListNameArr.includes('getRepCFNCurrentProductAllRepairCount')) {


        }
        if (repListNameArr.includes('getRepCFNCurrentProductAllProblemCount')) {


        }



        //         // productionRepairCount: productionRepairCount,
        // // productionProblemCount: productionProblemCount,
        // export class productionRepairCount

    }

    getDataNodeStationUpdatedListener() {
        // this.nsService.getDataNodeStationUpdatedListener()

        if (this.dataNodeStationSub) { this.dataNodeStationSub.unsubscribe(); }
        this.dataNodeStationSub = this.nsService.getDataNodeStationUpdatedListener().subscribe((data) => {
            // console.log(data);
            this.nodeStation = data.nodeStation;
            this.company = data.company;
            this.factory = data.factory;
            this.stationID = this.nsService.stationID;
            this.nodeFlows = data.nodeFlows;
            this.nodeFlow = data.nodeFlow;
            this.companyID = this.company.companyID;
            this.factoryID = this.factory.factoryID;
            this.nodeID = this.nodeStation.nodeID;
            // console.log(this.nodeStation);
            // console.log(this.company);
            // console.log(this.factory);
            // console.log(this.stationID);
            this.getRepCurrentProductQtyCFNUpdatedListener();
        });
    }

    genImagePathProduct(imgPath: string) {
        if (imgPath) {
            if (imgPath.length > 0) {
                return this.productImageProfileGCSPath + imgPath;
            }
        }
        return GBC.nulltGCSPath;
    }

    // getQRCodeListProductStyleCFN(productID: string) {
    //     // getQRCodeListProductStyleCFN(companyID: string, factoryID: string, nodeID: string,
    //     //         style: string, productStatus: string[], page: number, limit: number)
    //     const productStatus = ['normal', 'problem', 'repaired'];
    //     this.nsService.getQRCodeListProductStyleCFN(
    //         this.companyID, this.factoryID, this.nodeID, productID,
    //         productStatus
    //     );
    // }

    showQRCodeList(productID: string) {
        // this.getQRCodeListProductStyleCFN(productID);
        const ref = this.dialogService.open(SShowQrcodeComponent, {
            data: {
                id: 'showQRCodeListStyleAll',
                companyID: this.userService.getCompany()?.companyID,
                productID: productID,
                zone: 'all',
                size: 'all',
                colorCode: 'all',
                colorName: '',
                // productBarcodeNo: this.productBarcodeNoInput,
                // callfrom: this.formName,  // ## send to nodejs for choose buckets
                nodeStation: this.nodeStation,
                nodeStations: this.nsService.nodeStations
            },
            header: 'QR code',
            width: '80%',
        });

        ref.onClose.subscribe((data: any) => {
            console.log(data);
            // if (data.selected) {
            //     const toNode = data.nodeID;
            //     const problemID = data.nodeProblem.problemID;
            //     const problemName = data.nodeProblem.problemName;
            //     this.set1ProductProblem(toNode, problemID, problemName);
            // }
            // if (car) {
            //     this.messageService.add({severity:'info', summary: 'Car Selected', detail:'Vin:' + car.vin});
            // }
        });
    }

    setMenuActive(nodeMenuActive: string, productID: string) {
        // this.nodeMenuActive = nodeMenuActive;
        this.nsService.productID = productID;
        this.nsService.zone = 'all';
        this.nsService.size = 'all';
        this.nsService.colorCode = 'all';
        this.nsService.colorName = '';
        this.nsService.mode = 'QRCodeListProductStyleCFN';
        this.nsService.setMenuActive(nodeMenuActive);  // 'qrcode-list'
    }

    setMenuActive2(nodeMenuActive: string, prodStyle: ProductStateStyleTargetPlaceColorSize) {
        // this.nodeMenuActive = nodeMenuActive;
        this.nsService.productID = prodStyle.productID;
        this.nsService.zone = prodStyle.targetPlace;
        this.nsService.size = prodStyle.size;
        this.nsService.colorCode = prodStyle.color
        // this.userService.changeColorArrToColorDash(this.nsService.colorTransformToArray(prodStyle.color));
        this.nsService.colorName =
            this.userService.getColorNameByColorCode(
                this.nsService.colorTransformToArray(prodStyle.color)[0],
                this.userService.getSetNameColorByOrderID(prodStyle.productID)
                );
        this.nsService.mode = 'QRCodeListProductStyleZoneSizeColorCFN';
        this.nsService.setMenuActive(nodeMenuActive);  // 'qrcode-list'
    }


    ngOnDestroy(): void {
        clearTimeout(this.timer);
        if (this.dataNodeStationSub) { this.dataNodeStationSub.unsubscribe(); }
        if (this.repCurrentProductQtyCFNSub) { this.repCurrentProductQtyCFNSub.unsubscribe(); }
        if (this.dataAroundNodeAppSub) { this.dataAroundNodeAppSub.unsubscribe(); }

        // if (this.errSub) { this.errSub.unsubscribe(); }
        // if (this.langSub) { this.langSub.unsubscribe(); }
        // if (this.langListSub) { this.langListSub.unsubscribe(); }
    }
}
