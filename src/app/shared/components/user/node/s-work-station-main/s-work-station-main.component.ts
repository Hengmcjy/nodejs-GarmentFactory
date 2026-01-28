import { Component, OnInit, Inject, OnDestroy, Input } from '@angular/core';
import { Location } from '@angular/common';
import { DOCUMENT } from '@angular/common';
import { Router } from '@angular/router';
import { DialogService } from 'primeng/dynamicdialog';
import { MessageService } from 'primeng/api';
import { Subscription } from 'rxjs';

import { UserService } from 'src/app/services/user.service';
import { SocketIOService } from 'src/app/services/socketio.service';
import { NodeStationService } from 'src/app/services/node-station.service';
import { StorageService } from 'src/app/services/storage.service';
import { ReportService } from 'src/app/services/report.service';


import { StaffLoginComponent } from 'src/app/shared/components/general/staff-login/staff-login.component';
import { NodeFlow, NodeStation } from 'src/app/models/workstation.model';
import { Company, Factory, OutSourceLocationDepartment } from 'src/app/models/app.model';
import { User } from 'src/app/models/user.model';
import { ProductionRepairCount, RepDataFormat1 } from 'src/app/models/report.model';
import { GBC } from 'src/app/global/const-global';
import { OrderService } from 'src/app/services/order.service';
import { Order } from 'src/app/models/order.model';

@Component({
  selector: 'app-s-work-station-main',
  templateUrl: './s-work-station-main.component.html',
  styleUrls: ['./s-work-station-main.component.scss'],
  providers: [DialogService, MessageService],

})
export class SWorkStationMainComponent implements OnInit,OnDestroy {
    @Input() viewMode: string = 'user'; // ## view= only view, user= really working

    userImageProfileGCSPath = GBC.userImageProfileGCSPath;  // ## google storage path user image profile

    formActive = 'workstation-production';
    pageActive = 'home'; // ## home , getproduct , viewstat , chart
    staffLoggedIN = false;
    staff: User = GBC.clrUser();
    staffScanOutsourceLoggedIN = false;
    staffScanOutsource: User = GBC.clrUser();

    starterLoaded = false;

    elem: any;

    nodeStation: NodeStation = GBC.clrNodeStation();
    company: Company = GBC.clrCompany();
    factory: Factory = GBC.clrFactory();
    orders: Order[] = [];
    stationID = '';
    nodeFlows: NodeFlow[] = [];
    nodeFlow: NodeFlow = GBC.clrNodeFlow();
    companyID = '';
    factoryID = '';
    nodeID = '';
    outSourceLocationDepartment: OutSourceLocationDepartment[] = [];
    haveSubWorkflow = false;
    canScanNode = false;
    canScanSubNode = false;


    repListName: string[] = [];

    productionRepairCount: ProductionRepairCount[] = [];
    productionProblemCount: ProductionRepairCount[] = [];

    private sockioResLogin: Subscription = new Subscription;
    private dataNodeStationSub: Subscription = new Subscription;
    private repCurrentProductQtyCFNSub: Subscription = new Subscription;
    private dataAroundNodeAppSub: Subscription = new Subscription;

    constructor(
        private location: Location,
        @Inject(DOCUMENT) private document: any,
        private router: Router,
        // public translate: TranslateService,
        public dialogService: DialogService,
        public messageService: MessageService,

        private userService: UserService,
        private orderService: OrderService,
        private socketService: SocketIOService,
        private nsService: NodeStationService,
        private repService: ReportService,
        private storageService: StorageService,
    ) {}

    ngOnInit(): void {
        // console.log('SWorkStationMainComponent');
        this.location.replaceState('/'); // ## hide loocation
        this.userService.setFormActive(this.formActive);
        this.pageActive = 'home';
        this.nsService.setMenuActive(this.pageActive);

        this.staff = this.nsService.staff;
        this.staffScanOutsource = this.nsService.staffScanOutsource;

        this.getDataNodeStationUpdatedListener();
        this.nodeStation = this.nsService.nodeStation;
        this.haveSubWorkflow = this.nodeStation.nodeInfo.haveSubWorkflow;
        this.company = this.userService.getCompany();
        this.factory = this.userService.getFactory();
        this.stationID = this.nsService.stationID;
        this.nodeFlows = this.nsService.nodeFlows;
        this.nodeFlow = this.nsService.nodeFlow;
        // console.log(this.nsService.nodeStation);
        // console.log(this.nsService.nodeFlow);
        this.companyID = this.company.companyID;
        this.factoryID = this.factory.factoryID;
        this.nodeID = this.nodeStation.nodeID;
        this.outSourceLocationDepartment = this.userService.outSourceLocationDepartment;

        // this.nsService.getNodeDatageneral(this.companyID);
        // console.log('getNodeDatageneral', this.companyID);
        // console.log('nodeStation', this.nodeStation);

        // console.log('SWorkStationMainComponent   111');

        // getGNFactoriesByCompanyID(companyID: string)
        this.userService.getGNFactoriesByCompanyID(this.companyID);

        // ## socket io
        this.getSocketIORes();

        this.elem = document.documentElement;
        if (this.viewMode==='user' && this.userService.workNodeStationFullScreen) {
            this.openFullscreen();
        } // ## only user mode

        // ## get report node station
        this.getNodeReport();

        // ## get all order
        this.nsService.getOrders(this.company.companyID, 1, this.orderService.ordersLimit*2);

        // console.log(this.nodeStation);
        // console.log(this.company);
        // console.log(this.factory);
        // console.log(this.stationID);
        // console.log(this.nodeFlows);
        // console.log(this.nodeFlow);
        this.dataAroundNodeAppSub = this.nsService.getDataAroundNodeAppStatusListener().subscribe(dataAroundNodeApp => {
            // console.log(dataAroundNodeApp);
            // if (dataAroundNodeApp.refreshCurrentPage && this.nodeMenuActive === dataAroundNodeApp.refreshPage) {
            //     // console.log('this.nodeMenuActive === dataAroundNodeApp.refreshPage');
            //     this.getRepCurrentProductQtyCFNUpdatedListener();
            // }
            this.pageActive = dataAroundNodeApp.refreshPage;
        });

        // console.log('SWorkStationMainComponent  999');

        // // ## check OutSourceLocationDepartment
        // this.checkOutSourceLocationDepartment();
    }

    getNodeReport() {
        // console.log(this.companyID, this.factoryID, this.nodeID);
        if (this.repCurrentProductQtyCFNSub) { this.repCurrentProductQtyCFNSub.unsubscribe(); }
        this.repCurrentProductQtyCFNSub = this.repService.getRepCurrentProductQtyCFNUpdatedListener().subscribe((data) => {
            // console.log(data);
            this.starterLoaded = true;
            this.showDataReport(data.repDataFormat1, data.repListNameArr);
        });

        // if (this.companyID !== '') {

        //     // ## 1 report current node station product qty
        //     const productStatus = ['normal'];
        //     this.repListName = [
        //         'getRepCFNCurrentProductQty',
        //         'getRepCFNCurrentProductQtyByOrderID',
        //         'getRepCFNCurrentProductQtyByOrderIDProductID',
        //         'getRepCFNCurrentProductBundleList',
        //         'getAllOrderAndProductFromOrderProduction',
        //         'getRepCFNProductState',  // ## style-targetPlace-year-5color-size-sex-#####    /   8  4  2  10  3  1  99999
        //         'getRepCFNCurrentProductionQueueCFN',
        //     ];
        //     this.nsService.getRepCurrentProductQtyCFN(this.companyID, this.factoryID, this.nodeID, productStatus, this.repListName);
        //     if (this.repCurrentProductQtyCFNSub) { this.repCurrentProductQtyCFNSub.unsubscribe(); }
        //     this.repCurrentProductQtyCFNSub = this.nsService.getRepCurrentProductQtyCFNUpdatedListener().subscribe((data) => {
        //         // console.log(data);

        //         this.showDataReport(data.repDataFormat1, data.repListNameArr);
        //     });

        // }
    }

    showDataReport(repDataFormat1: RepDataFormat1, repListNameArr: string[]) {
        // this.nsService.allProductQty = '';
                    // this.nsService.totalBundle = '';
                    // this.nsService.countOrderID = '';
                    // this.nsService.countProductID = '';
        if (repListNameArr.includes('allTotalProduct')) {
            this.nsService.allProductQty = repDataFormat1.allProductQty+'';
        }
        if (repListNameArr.includes('getRepCFNCurrentProductQty')) {
            this.nsService.allProductQty = repDataFormat1.allProductQty+'';
        }
        if (repListNameArr.includes('getRepCFNCurrentProductQtyByOrderID')) {
            this.nsService.countOrderID = repDataFormat1.orderProductQtyByOrderIDRep.length+'';
        }
        if (repListNameArr.includes('getRepCFNCurrentProductQtyByOrderIDProductID')) {
            this.nsService.countProductID = repDataFormat1.orderProductQtyByOrderIDProductIDRep.length+'';
        }
        if (repListNameArr.includes('getRepCFNCurrentProductBundleList')) {
            this.nsService.totalBundle = repDataFormat1.orderProductQtyBundleListRep.length+'';
        }
        if (repListNameArr.includes('getAllOrderAndProductFromOrderProduction')) {
            this.orders = repDataFormat1.orders;
            this.nsService.orders = repDataFormat1.orders;
            this.orderService.setOrders(this.orders);
            this.nsService.products = repDataFormat1.products;
        }
        if (repListNameArr.includes('getRepCFNProductState')) {


        }
        if (repListNameArr.includes('getRepCFNCurrentProductionQueueCFN')) {


        }
        if (repListNameArr.includes('getRepCFNCurrentProductAllDetail')) {


        }
        if (repListNameArr.includes('getRepCFNCurrentProductAllRepairCount')) {
            this.productionRepairCount = repDataFormat1.productionRepairCount;

        }
        if (repListNameArr.includes('getRepCFNCurrentProductAllProblemCount')) {
            this.productionProblemCount = repDataFormat1.productionProblemCount;

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
            // this.pageActive = data.pageActive;

            this.nsService.getNodeDatageneral(this.companyID);
            // console.log('getNodeDatageneral', this.companyID);

            // ##
            this.getScanConfig();

            // ## get report node station
            this.getNodeReport();

            // console.log(this.nsService.nodeStations);
            // console.log(this.stationID, this.nodeStation);
            // console.log(this.company);
            // console.log(this.factory);
            // console.log(this.stationID);
            // console.log(this.nodeFlows);
            // console.log(this.nodeFlow);
        });
    }

    getScanConfig() {
        this.canScanNode = false;
        this.canScanSubNode = false;
        // console.log('this.nsService.nodeStations  == ', this.nsService.nodeStations);
        const nodeStation = this.nsService.nodeStations.filter(i=>i.companyID == this.company.companyID
            && i.factoryID == this.factory.factoryID
            && i.nodeID == this.nodeID);
        const nodeStationF = nodeStation[0]?nodeStation[0]:GBC.clrNodeStation();
        // console.log('nodeStationF  == ', nodeStationF);
        const userNode = nodeStationF.userNode;
        const userNodeF = userNode.filter(i=>i.stationID == this.stationID);
        this.canScanNode = userNodeF[0]?userNodeF[0].canScanNode:false;
        this.canScanSubNode = userNodeF[0]?userNodeF[0].canScanSubNode:false;
        // console.log('this.canScanNode  == ', this.canScanNode);
        // console.log('this.canScanSubNode  == ',this.canScanSubNode);

    }

    selectPage(page: string) {
        this.pageActive = page;
        // console.log(this.pageActive);
    }

    openFullscreen() {
        // console.log('openFullscreen');
        if (this.elem.requestFullscreen) {
            this.elem.requestFullscreen();
        } else if (this.elem.mozRequestFullScreen) {
            /* Firefox */
            this.elem.mozRequestFullScreen();
        } else if (this.elem.webkitRequestFullscreen) {
            /* Chrome, Safari and Opera */
            this.elem.webkitRequestFullscreen();
        } else if (this.elem.msRequestFullscreen) {
            /* IE/Edge */
            this.elem.msRequestFullscreen();
        }
    }

    /* Close fullscreen */
    closeFullscreen() {
        if (this.document.exitFullscreen) {
            this.document.exitFullscreen();
        } else if (this.document.mozCancelFullScreen) {
            /* Firefox */
            this.document.mozCancelFullScreen();
        } else if (this.document.webkitExitFullscreen) {
            /* Chrome, Safari and Opera */
            this.document.webkitExitFullscreen();
        } else if (this.document.msExitFullscreen) {
            /* IE/Edge */
            this.document.msExitFullscreen();
        }
    }

    staffLogin() {

        this.showStaffLoginModal();
    }

    staffLogout() {
        this.pageActive = 'home';
        this.staffLoggedIN = false;
        this.staff = GBC.clrUser();
        this.nsService.staff = GBC.clrUser();
        this.nsService.clearDataWhenStaffLogin();
    }

    staffOutsourceLogout() {
        this.nsService.setDataAroundNodeApp('isOutsourceMode', false);
        this.pageActive = 'home';
        this.staffScanOutsourceLoggedIN = false;
        this.staffScanOutsource = GBC.clrUser();
        this.nsService.staffScanOutsource = GBC.clrUser();
        this.nsService.clearDataWhenStaffOutsourceLogin();
    }

    logout() {
        if (this.userService.workNodeStationFullScreen) { this.closeFullscreen(); }
        this.storageService.clearData('nUUIDL');  // ## nUUIDL = key for node workstation login
        this.userService.setIsNodeAuth(false);
        // putLogoutNodeStation(companyID: string, factoryID: string, nodeID: string)
        this.nsService.putLogoutNodeStation(this.nodeStation.companyID, this.nodeStation.factoryID, this.nodeStation.nodeID);
        this.router.navigate(['/']);
    }

    showStaffLoginModal() {
        this.staffOutsourceLogout();
        this.staffLogout();
        this.staff = GBC.clrUser();
        this.staffLoggedIN = false;
        const ref = this.dialogService.open(StaffLoginComponent, {
            data: {
                id: 'staffLogin',
            },
            header: 'staff login',
            width: '50%'
        });

        ref.onClose.subscribe((data: any) => {
            // console.log(data);
            // console.log(this.canScanNode);
            // console.log(this.canScanSubNode);

            // console.log('showStaffLoginModal OK'); canScanSubNode
            if (data.success) {
                this.staffLoggedIN = true;
                this.staff = this.nsService.staff;
                this.messageService.add({
                    severity:'success',
                    summary:'staff logged in ok',
                    detail:'completed',
                    sticky: false
                });
            }
        });
    }

    showOutsourceStaffLoginModal() {
        this.staffOutsourceLogout();
        this.staffLogout();
        this.staffScanOutsource = GBC.clrUser();
        this.staffScanOutsourceLoggedIN = false;
        const ref = this.dialogService.open(StaffLoginComponent, {
            data: {
                id: 'outsourcestaffLogin',
            },
            header: 'staff login [scan outsource]',
            width: '50%'
        });

        ref.onClose.subscribe((data: any) => {
            // console.log(data);
            // console.log('showOutsourceStaffLoginModal OK');
            if (data.success) {
                this.staffScanOutsourceLoggedIN = true;
                // this.staff = this.nsService.staff;
                this.staffScanOutsource = this.nsService.staffScanOutsource;
                this.messageService.add({
                    severity:'success',
                    summary:'outsource staff logged in ok',
                    detail:'completed',
                    sticky: false
                });
            }
        });
    }

    checkOutSourceLocationDepartment(): boolean {
        // const table = table2.filter(i=>i.color == item.color && i.size == item.size);
        const outSourceLocationDepartmentF =
            this.outSourceLocationDepartment.filter(i=>i.companyID == this.company.companyID
                                                    && i.factoryID == this.factory.factoryID
                                                    && i.nodeID == this.nodeID
                                                    && i.stationID == this.stationID
                                                    && i.scanOutsource);
        if (outSourceLocationDepartmentF.length > 0) {return true}
        return false;
    }

    getSocketIORes() {
        // ## get response login
        this.sockioResLogin = this.socketService.getIOResponseLoginNode().subscribe((msgio: any) => {
            // console.log('my socketIO ID : ',this.socketService.socket.id);
            // console.log('app-root socketIO : ', msgio);
            // ## check return message value
        });
    }

    genImagePath(imgPath: string) {
        if (imgPath) {
            if (imgPath.length > 0) {
                return this.userImageProfileGCSPath + imgPath;
            }
        }

        return GBC.nulltGCSPath;
    }

    ngOnDestroy(): void {
        if (this.dataAroundNodeAppSub) { this.dataAroundNodeAppSub.unsubscribe(); }
        if (this.sockioResLogin) { this.sockioResLogin.unsubscribe(); }
        if (this.dataNodeStationSub) { this.dataNodeStationSub.unsubscribe(); }
        if (this.repCurrentProductQtyCFNSub) { this.repCurrentProductQtyCFNSub.unsubscribe(); }

        // if (this.darkSub) { this.darkSub.unsubscribe(); }
        // if (this.errSub) { this.errSub.unsubscribe(); }
        // if (this.authSub) { this.authSub.unsubscribe(); }
        // if (this.screenSub) { this.screenSub.unsubscribe(); }
        // if (this.screenSizeSub) { this.screenSizeSub.unsubscribe(); }
    }
}
