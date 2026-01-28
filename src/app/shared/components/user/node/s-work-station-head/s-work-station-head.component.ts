import { Component, OnDestroy, OnInit } from '@angular/core';
import { MessageService } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import { GalleriaThumbnails } from 'primeng/galleria';
import { Subscription } from 'rxjs';
import { GBC } from 'src/app/global/const-global';

import { Company, Factory } from 'src/app/models/app.model';
import { RepDataFormat1 } from 'src/app/models/report.model';
import { NodeFlow, NodeStation } from 'src/app/models/workstation.model';
import { NodeStationService } from 'src/app/services/node-station.service';
import { ReportService } from 'src/app/services/report.service';
import { SocketIOService } from 'src/app/services/socketio.service';
import { UserService } from 'src/app/services/user.service';
import { SNodeProductRecordComponent } from '../s-node-product-record/s-node-product-record.component';
import { SmdRepSubnodeScannedComponent } from '../../../rep/company/smd-rep-subnode-scanned/smd-rep-subnode-scanned.component';
import { SmdProductBundleRecordComponent } from '../../smd-product-bundle-record/smd-product-bundle-record.component';

@Component({
    selector: 'app-s-work-station-head',
    templateUrl: './s-work-station-head.component.html',
    styleUrls: ['./s-work-station-head.component.scss'],
    providers: [DialogService, MessageService],
})
export class SWorkStationHeadComponent implements OnInit, OnDestroy {

    dataAroundNodeApp: any;
    isOutsourceMode = false;
    isFactoryAffiliate = false;
    isScanSubnode = false;

    nodeStation: NodeStation = GBC.clrNodeStation();
    company: Company = GBC.clrCompany();
    factory: Factory = GBC.clrFactory();
    stationID = '';
    nodeFlows: NodeFlow[] = [];
    nodeFlow: NodeFlow = GBC.clrNodeFlow();

    allProductQty = '';
    totalBundle = '';
    countOrderID = '';
    countProductID = '';

    private dataAroundNodeAppSub: Subscription = new Subscription;
    private dataNodeStationSub: Subscription = new Subscription;
    private repCurrentProductQtyCFNSub: Subscription = new Subscription;

    constructor(
        public dialogService: DialogService,
        public messageService: MessageService,

        private userService: UserService,
        private socketService: SocketIOService,
        public nsService: NodeStationService,
        private repService: ReportService,
    ) {}

    ngOnInit(): void {
        this.nodeStation = this.nsService.nodeStation;
        this.company = this.userService.getCompany();
        this.factory = this.userService.getFactory();
        this.stationID = this.nsService.stationID;
        this.nodeFlows = this.nsService.nodeFlows;
        this.nodeFlow = this.nsService.nodeFlow;

        this.allProductQty = this.nsService.allProductQty;
        this.totalBundle = this.nsService.totalBundle;
        this.countOrderID = this.nsService.countOrderID;
        this.countProductID = this.nsService.countProductID;
        this.getDataNodeStationUpdatedListener();
        this.getRepCurrentProductQtyCFNUpdatedListener();
        this.getDataNodeAroundApp();
        // console.log(this.nodeStation);
        // console.log(this.company);
        // console.log(this.factory);
        // console.log(this.stationID);

        // this.nodeStation.nodeInfo.mustBundleScan;

        this.dataAroundNodeAppSub = this.nsService.getDataAroundNodeAppStatusListener().subscribe(dataAroundNodeApp => {
            // console.log(dataAroundNodeApp);
            // ## declare initial variable from service user
            // this.isAuthenticated = dataAroundApp.isAuthenticated;
            // this.screenSize = dataAroundApp.screenSize;
            // console.log('screenSizeInfo : ' , this.screenSize);
            // console.log('isAuthenticated : ' , this.isAuthenticated);
            // if (this.isAuthenticated) { // ## user logged in already

            // } else {  // ## user no login

            // }
        });


    }

    getDataNodeAroundApp() {
        this.dataAroundNodeApp = this.nsService.getDataAroundNodeApp();
        this.isOutsourceMode = this.nsService.getDataAroundNodeApp().isOutsourceMode;
        // console.log('this.isOutsourceMode : ' , this.isOutsourceMode);

        // isFactoryAffiliate
        this.isFactoryAffiliate = this.nsService.getDataAroundNodeApp().isFactoryAffiliate;
        this.isScanSubnode = this.nsService.getDataAroundNodeApp().isScanSubnode;
    }

    refreshWeb() {
        this.nsService.refreshCurrentPage = true;
        this.nsService.setDataAroundNodeAppStatusListenerToNext();
    }

    getRepCurrentProductQtyCFNUpdatedListener() {
        if (this.repCurrentProductQtyCFNSub) { this.repCurrentProductQtyCFNSub.unsubscribe(); }
        this.repCurrentProductQtyCFNSub = this.repService.getRepCurrentProductQtyCFNUpdatedListener().subscribe((data) => {
            // console.log(data);
            this.showDataReport(data.repDataFormat1, data.repListNameArr);
        });
    }

    showDataReport(repDataFormat1: RepDataFormat1, repListNameArr: string[]) {
        if (repListNameArr.includes('allTotalProduct')) {
            this.nsService.allProductQty = repDataFormat1.allProductQty+'';
            this.allProductQty = repDataFormat1.allProductQty+'';
        }
        // if (repListNameArr.includes('getRepCFNCurrentProductQty')) {
        //     this.nsService.allProductQty = repDataFormat1.allProductQty+'';
        //     this.allProductQty = repDataFormat1.allProductQty+'';
        // }
        if (repListNameArr.includes('getRepCFNCurrentProductQtyByOrderID')) {
            this.nsService.countOrderID = repDataFormat1.orderProductQtyByOrderIDRep.length+'';
            this.countOrderID = repDataFormat1.orderProductQtyByOrderIDRep.length+'';
        }
        if (repListNameArr.includes('getRepCFNCurrentProductQtyByOrderIDProductID')) {
            this.nsService.countProductID = repDataFormat1.orderProductQtyByOrderIDProductIDRep.length+'';
            this.countProductID = repDataFormat1.orderProductQtyByOrderIDProductIDRep.length+'';
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


        }
        if (repListNameArr.includes('getRepCFNCurrentProductionQueueCFN')) {


        }
        if (repListNameArr.includes('getRepCFNCurrentProductAllDetail')) {


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
            // console.log(this.nodeStation);
            // console.log(this.company);
            // console.log(this.factory);
            // console.log(this.stationID);
        });
    }

    showSProductRecord() {
        const ref = this.dialogService.open(SNodeProductRecordComponent, {
            data: {
                id: 'showProductRecord',
            },
            header: 'Logging',
            width: '90%'
        });

        ref.onClose.subscribe((data: any) => {
            // console.log(data);
        });
    }

    // showSProductRecordBundle
    showSProductRecordBundle() {
        const ref = this.dialogService.open(SmdProductBundleRecordComponent, {
            data: {
                id: 'showProductRecordBundle',
            },
            header: 'Logging bundle',
            width: '90%'
        });

        ref.onClose.subscribe((data: any) => {
            // console.log(data);
        });
    }

    showSubNodeScanned() {
        const ref = this.dialogService.open(SmdRepSubnodeScannedComponent, {
            data: {
                id: 'showSubNodeScanned',
                mode: 'show-list',
            },
            header: 'sub node scanned list',
            width: '90%'
        });

        ref.onClose.subscribe((data: any) => {
            // console.log(data);

        });
    }

    ngOnDestroy() {
        if (this.dataNodeStationSub) { this.dataNodeStationSub.unsubscribe(); }
        if (this.repCurrentProductQtyCFNSub) { this.repCurrentProductQtyCFNSub.unsubscribe(); }
        if (this.dataAroundNodeAppSub) { this.dataAroundNodeAppSub.unsubscribe(); }

        // if (this.errSub) { this.errSub.unsubscribe(); }
        // if (this.langSub) { this.langSub.unsubscribe(); }
        // if (this.langListSub) { this.langListSub.unsubscribe(); }
        // if (this.getUserNodeLoginWaitSub) { this.getUserNodeLoginWaitSub.unsubscribe(); }
        // if (this.darkSub) { this.darkSub.unsubscribe(); }
        // if (this.errSub) { this.errSub.unsubscribe(); }
        // if (this.authSub) { this.authSub.unsubscribe(); }
        // if (this.screenSub) { this.screenSub.unsubscribe(); }
        // if (this.screenSizeSub) { this.screenSizeSub.unsubscribe(); }
    }
}
