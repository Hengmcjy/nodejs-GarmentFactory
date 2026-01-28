import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { GBC } from 'src/app/global/const-global';
import { Company, Factory } from 'src/app/models/app.model';
import { OrderProductQtyByOrderIDProductIDRep, RepDataFormat1 } from 'src/app/models/report.model';
import { NodeFlow, NodeStation } from 'src/app/models/workstation.model';
import { NodeStationService } from 'src/app/services/node-station.service';
import { ProductService } from 'src/app/services/product.service';
import { ReportService } from 'src/app/services/report.service';
import { UserService } from 'src/app/services/user.service';

@Component({
    selector: 'app-s-node-product-history',
    templateUrl: './s-node-product-history.component.html',
    styleUrls: ['./s-node-product-history.component.scss'],
})
export class SNodeProductHistoryComponent implements OnInit, OnDestroy {
    pageActive = 'production-history';

    productImageProfileGCSPath = GBC.productImageProfileGCSPath; // ## google storage path image profile

    orderProductQtyByOrderIDProductIDRep: OrderProductQtyByOrderIDProductIDRep[] = [];

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

    countProductionsAll = 0;
    limit = 20;

    currentProductAllDetailCFN: any[] = [];

    private repCurrentProductQtyCFNSub: Subscription = new Subscription;
    private repCurrentCurrentProductionsSub: Subscription = new Subscription;

    constructor(
        public userService: UserService,
        private productService: ProductService,
        public nsService: NodeStationService,
        private repService: ReportService,
    ) {}

    ngOnInit(): void {
        this.nsService.setMenuActive(this.pageActive);
        this.nsService.setDataAroundNodeApp('isOutsourceMode', false);

        this.companyID = this.company.companyID;
        this.factoryID = this.factory.factoryID;
        this.nodeID = this.nodeStation.nodeID;

        this.nodeStation = this.nsService.nodeStation;
        this.company = this.userService.getCompany();
        this.factory = this.userService.getFactory();
        this.stationID = this.nsService.stationID;
        this.nodeFlows = this.nsService.nodeFlows;
        this.nodeFlow = this.nsService.nodeFlow;

        this.getRepCurrentProductQtyCFNUpdatedListener();
        this.getRepCurrentProductions(1);
    }

    getRepCurrentProductions(page: number) {
        // getRepCurrentProductions(
        //     companyID: string, factoryID: string, nodeID: string,
        //     productStatus: string[], page: number, limit: number
        //     )
        // const productStatus = ['normal'];
        const productStatus = ['normal', 'problem', 'repaired'];
        this.repService.getRepCurrentProductions(
            this.company.companyID, this.factory.factoryID, this.nodeID, productStatus, page, this.limit
        );
        if (this.repCurrentCurrentProductionsSub) { this.repCurrentCurrentProductionsSub.unsubscribe(); }
        this.repCurrentCurrentProductionsSub = this.repService.getRepCurrentProductionsCFNUpdatedListener().subscribe((data) => {
            // console.log(data);
            this.currentProductAllDetailCFN = data.currentProductAllDetailCFN;
            this.countProductionsAll = data.countProductionsAll;
            // console.log(this.currentProductAllDetailCFN);

        });
    }

    paginate(event: any) {
        // console.log(event.rows, +event.page);
        this.limit = event.rows;
        this.getRepCurrentProductions(+event.page + 1);
        //event.first = Index of the first record
        //event.rows = Number of rows to display in new page
        //event.page = Index of the new page
        //event.pageCount = Total number of pages
    }

    genImagePathProduct(imgPath: string) {
        if (imgPath) {
            if (imgPath.length > 0) {
                return GBC.productImageProfileGCSPath + imgPath;
            }
        }
        return GBC.nulltGCSPath;
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
            // const productStatus = ['normal'];
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
            // this.nsService.allProductQty = repDataFormat1.allProductQty+'';
            // this.allProductQty = repDataFormat1.allProductQty+'';
        }
        if (repListNameArr.includes('getRepCFNCurrentProductQtyByOrderID')) {
            // this.nsService.countOrderID = repDataFormat1.orderProductQtyByOrderIDRep.length+'';
            // this.countOrderID = repDataFormat1.orderProductQtyByOrderIDRep.length+'';
        }
        if (repListNameArr.includes('getRepCFNCurrentProductQtyByOrderIDProductID')) {
            this.nsService.countProductID = repDataFormat1.orderProductQtyByOrderIDProductIDRep.length+'';
            // this.countProductID = repDataFormat1.orderProductQtyByOrderIDProductIDRep.length+'';
            this.orderProductQtyByOrderIDProductIDRep = repDataFormat1.orderProductQtyByOrderIDProductIDRep;
            this.orderProductQtyByOrderIDProductIDRep.sort((a,b)=>{
                return a.productID >b.productID?1:a.productID <b.productID?-1:0
            });
            // console.log(this.orderProductQtyByOrderIDProductIDRep);

        }
        if (repListNameArr.includes('getRepCFNCurrentProductBundleList')) {
            // this.nsService.totalBundle = repDataFormat1.orderProductQtyBundleListRep.length+'';
            // this.totalBundle = repDataFormat1.orderProductQtyBundleListRep.length+'';
        }
        if (repListNameArr.includes('getAllOrderAndProductFromOrderProduction')) {

            // this.nsService.orders = repDataFormat1.orders;
            // this.nsService.products = repDataFormat1.products;
        }
        if (repListNameArr.includes('getRepCFNProductState')) {
            // this.productStateStyleTargetPlaceColorSize = repDataFormat1.productStateStyleTargetPlaceColorSize;

        }
        if (repListNameArr.includes('getRepCFNCurrentProductionQueueCFN')) {
            // this.queueInfoRep = repDataFormat1.queueInfoRep;
            // this.productStateStyleTargetPlaceColorSize.sort((a,b)=>{
            //     return a.style >b.style?1:a.style <b.style?-1:0
            //     || a.targetPlace >b.targetPlace?1:a.targetPlace <b.targetPlace?-1:0
            //     || a.size >b.size?1:a.size <b.size?-1:0
            //     || a.color >b.color?1:a.color <b.color?-1:0
            // });
            // console.log(this.queueInfoRep);

        }

    }

    ngOnDestroy(): void {
        if (this.repCurrentProductQtyCFNSub) { this.repCurrentProductQtyCFNSub.unsubscribe(); }
        if (this.repCurrentCurrentProductionsSub) { this.repCurrentCurrentProductionsSub.unsubscribe(); }
        // if (this.repCurrentProductQtyCFNSub) { this.repCurrentProductQtyCFNSub.unsubscribe(); }

        // if (this.dataAroundAppSub) { this.dataAroundAppSub.unsubscribe(); }
        // if (this.errSub) { this.errSub.unsubscribe(); }
        // if (this.langSub) { this.langSub.unsubscribe(); }
        // if (this.langListSub) { this.langListSub.unsubscribe(); }
    }
}
