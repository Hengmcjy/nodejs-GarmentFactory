import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { GBC } from 'src/app/global/const-global';

import { Company, Factory } from 'src/app/models/app.model';
import { OrderProductQtyByOrderIDProductIDRep, RepDataFormat1 } from 'src/app/models/report.model';
import { NodeFlow, NodeStation } from 'src/app/models/workstation.model';

import { NodeStationService } from 'src/app/services/node-station.service';
import { ProductService } from 'src/app/services/product.service';
import { ReportService } from 'src/app/services/report.service';
import { SocketIOService } from 'src/app/services/socketio.service';
import { UserService } from 'src/app/services/user.service';

@Component({
    selector: 'app-node-product-record',
    templateUrl: './node-product-record.component.html',
    styleUrls: ['./node-product-record.component.scss'],
})
export class NodeProductRecordComponent implements OnInit, OnDestroy {
    pageActive = 'production-record';
    @Input() productBarcodeNoInput = '';

    productImageProfileGCSPath = GBC.productImageProfileGCSPath; // ## google storage path image profile

    nodeStation: NodeStation = GBC.clrNodeStation();
    company: Company = GBC.clrCompany();
    factory: Factory = GBC.clrFactory();
    stationID = '';
    nodeFlows: NodeFlow[] = [];
    nodeFlow: NodeFlow = GBC.clrNodeFlow()
    companyID = '';
    factoryID = '';
    nodeID = '';

    repListName: string[] = [];

    orderProductQtyByOrderIDProductIDRep: OrderProductQtyByOrderIDProductIDRep[] = [];

    allProductQty = '';
    totalBundle = '';
    countOrderID = '';
    countProductID = '';

    private dataNodeStationSub: Subscription = new Subscription;
    private repCurrentProductQtyCFNSub: Subscription = new Subscription;

    constructor(
        public userService: UserService,
        private productService: ProductService,
        private socketService: SocketIOService,
        public nsService: NodeStationService,
        private repService: ReportService,
    ) {}

    ngOnInit(): void {
        this.nsService.setMenuActive(this.pageActive);
        this.nsService.setDataAroundNodeApp('isOutsourceMode', false);

        this.nodeStation = this.nsService.nodeStation;
        this.company = this.userService.getCompany();
        this.factory = this.userService.getFactory();
        this.stationID = this.nsService.stationID;
        this.nodeFlows = this.nsService.nodeFlows;
        this.nodeFlow = this.nsService.nodeFlow;

        // console.log(this.nsService.staff);
        this.allProductQty = this.nsService.allProductQty;
        this.totalBundle = this.nsService.totalBundle;
        this.countOrderID = this.nsService.countOrderID;
        this.countProductID = this.nsService.countProductID;

        this.companyID = this.company.companyID;
        this.factoryID = this.factory.factoryID;
        this.nodeID = this.nodeStation.nodeID;

        this.getDataNodeStationUpdatedListener();
        this.getRepCurrentProductQtyCFNUpdatedListener();
    }

    getRepCurrentProductQtyCFNUpdatedListener() {
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
                // 'getRepCFNCurrentProductQtyByOrderID',
                'getRepCFNCurrentProductQtyByOrderIDProductID',
                // 'getRepCFNCurrentProductBundleList',
                // 'getAllOrderAndProductFromOrderProduction',
                // 'getRepCFNProductState',  // ## style-targetPlace-year-5color-size-sex-#####    /   8  4  2  10  3  1  99999
                // 'getRepCFNCurrentProductionQueueCFN',
            ];
            this.repService.getRepCurrentProductQtyCFN(this.companyID, this.factoryID, this.nodeID, productStatus, this.repListName);
            if (this.repCurrentProductQtyCFNSub) { this.repCurrentProductQtyCFNSub.unsubscribe(); }
            this.repCurrentProductQtyCFNSub = this.repService.getRepCurrentProductQtyCFNUpdatedListener().subscribe((data) => {
                // console.log(data);

                this.showDataReport(data.repDataFormat1, data.repListNameArr);
            });

        }
    }

    showDataReport(repDataFormat1: RepDataFormat1, repListNameArr: string[]) {
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

            this.nsService.orders = repDataFormat1.orders;
            this.nsService.products = repDataFormat1.products;
        }
        if (repListNameArr.includes('getRepCFNProductState')) {
            // this.productStateStyleTargetPlaceColorSize = repDataFormat1.productStateStyleTargetPlaceColorSize;

        }
        if (repListNameArr.includes('getRepCFNCurrentProductionQueueCFN')) {


        }

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

    ngOnDestroy(): void {
        if (this.dataNodeStationSub) { this.dataNodeStationSub.unsubscribe(); }
        if (this.repCurrentProductQtyCFNSub) { this.repCurrentProductQtyCFNSub.unsubscribe(); }

        // if (this.dataAroundAppSub) { this.dataAroundAppSub.unsubscribe(); }
        // if (this.errSub) { this.errSub.unsubscribe(); }
        // if (this.langSub) { this.langSub.unsubscribe(); }
        // if (this.langListSub) { this.langListSub.unsubscribe(); }
    }
}
