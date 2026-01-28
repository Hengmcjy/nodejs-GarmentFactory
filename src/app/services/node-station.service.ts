/* eslint-disable @typescript-eslint/member-ordering */
/* eslint-disable no-underscore-dangle */

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { Router } from '@angular/router';
import { DeviceDetectorService } from 'ngx-device-detector';
import { NIL, v4 as uuidv4, v5 as uuidv5,  validate as uuidValidate, version as uuidVersion } from 'uuid';
import { MenuItem } from 'primeng/api';

// import { LoadingController } from '@ionic/angular';




import { StorageService } from './storage.service';
import { UserService } from './user.service';
import { SocketIOService } from './socketio.service';
import { environment } from '../../environments/environment';

import { User, UserClass, AuthData, SigupData, StaffList, UserGroupScan } from '../models/user.model';
import { Company, DataAroundApp, DataAroundNodeApp, Factory, GeneralInfo, ModeRes, ScreenInfo, TokenSet } from '../models/app.model';
import { UCompany, UFactory } from '../models/user.model';
import { Product } from '../models/product.model';
import { BundleGroupColorScan, FlowSeq, NodeFlow, NodeStation, NodeStationLoginRequest, OrderProductionScan, SubNodeflowC } from '../models/workstation.model';
import { Order, OrderProduction, OrderProductionQueueBundleNo, OrderSubNodeFlowCost, ProductionNode, SubNodeFlow } from '../models/order.model';
import { NodeScanProduct, ProductionRepairCount, QRCodeCount, QRCodeList, RepDataFormat1, SubNodeStaffScan } from '../models/report.model';
import { GBC } from '../global/const-global';
// import { MenuService } from './menu.service';
// import { debounceTime } from 'rxjs/operators';

const BACKEND_URL = environment.apiUrl + '/ns';  // ## node station
// const BACKEND_AESP = environment.aesP;

// ## user, language , getIP-real

@Injectable({
  providedIn: 'root'
})
export class NodeStationService {

    nodeFlowPageLimit = 10;  // ## 20 node flow per page

    nodeStationPageLimit = 20;  // ## 20 node station per page
    statusList = [
        {status: 'a', statusName: 'active'},
        {status: 'c', statusName: 'close'},
        {status: 'd', statusName: 'deleted'},
    ];
    statusItems: MenuItem[] = [
        {
            visible: true,
            label: 'active',
            command: () => { return 'active'; }
        },
        {
            visible: true,
            label: 'close',
            command: () => { return 'close'; }
        },
        {
            visible: true,
            label: 'deleted',
            command: () => { return 'deleted'; }
        },
    ];

    nodeTypeList: string[] = ['main','sub','none'];
    nodeTypeItems: MenuItem[] = [
        {
            visible: true,
            label: 'main',
            command: () => { return 'main'; }
        },
        {
            visible: true,
            label: 'sub',
            command: () => { return 'sub'; }
        },
        {
            visible: true,
            label: 'none',
            command: () => { return 'none'; }
        },
    ];

    durationRefreshHomePage = 300; // ## 60 second
    refreshCurrentPage = true;
    nodeMenuActive = 'home';

    // ## general data
    factories: Factory[] = [];

    // ## outsource
    isOutsourceMode = false;
    outsourceModeName = '';

    // ## factory affiliate โรงงานในเครือ
    isFactoryAffiliate = false;

    // ## scan sub node
    isScanSubnode = false;

    staff: User = this.clrUser();
    staffScanOutsource: User = this.clrUser();

    nodeStation: NodeStation = this.clrNodeStation();
    nodeStations: NodeStation[] = [];
    stationID = '';
    nodeFlow: NodeFlow = this.clrNodeFlow();
    nodeFlows: NodeFlow[] = [];
    // ## subNodeFlow
    subNodeflowC: SubNodeflowC[] = [];

    // home getproduct viewstat chart
    // production-queue  production-record  production-report  production-repair  production-return  production-history
    // qrcode-list
    pageActive = 'home';

    mode = '';
    productID = '';
    zone = '';
    size = '';
    colorCode = '';
    colorName = '';

    nodeStationLoginRequests: NodeStationLoginRequest[] = [];

    // ## for report data
    allProductQty = '';
    totalBundle = '';
    countOrderID = '';
    countProductID = '';

    orders: Order[] = [];
    products: Product[] = [];


    // ## bundle group color
    bundleGroupColorScan: BundleGroupColorScan[] = [
        {color:'bg-green-50', bundleNo: -1},
        {color:'bg-indigo-50', bundleNo: -1},
        {color:'bg-teal-50', bundleNo: -1},
        {color:'bg-primary-50', bundleNo: -1},
        {color:'bg-purple-50', bundleNo: -1},
    ];


    // private product: Product = this.userService.clrProduct();
    // private products: Product[] = [];

    // productPageListItem = 10;

    // // ## google storage path
    // public productGCSPath = 'https://storage.googleapis.com/garmentproductgarmentworld1sthighquality/';
    // public productImageProfileGCSPath = 'https://storage.googleapis.com/garmentproductgarmentworld1sthighquality/imageProfile/';




    private dataAroundNodeAppStatusListener = new Subject<DataAroundNodeApp>();

    private editAddOrderProductionSubNodeFlowUpdated = new Subject<{success: boolean, message: any}>();
    private editQROrderProductionSubNodeFlowUpdated = new Subject<{success: boolean, message: any}>();
    private getStaffInfoUpdated = new Subject<{ staff: User, success: boolean, message: any}>();
    private getOrderProductionListUpdated = new Subject<{
        orderProductions: OrderProduction[],
        success: boolean, message: any
    }>();
    private getSubNodeFlowCostUpdated = new Subject<{
        orderSubNodeFlowCost: OrderSubNodeFlowCost,
        success: boolean, message: any
    }>();
    private getOrderProductionQueueBundleNoUpdated = new Subject<{
        orderProductionQueueBundleNo: OrderProductionQueueBundleNo,
        orderSubNodeFlowCost: OrderSubNodeFlowCost,
        orderID: string, bundleNo: number, bundleID: string,
        productBarcode: string, productCount: number,
        numberFrom: number, numberTo: number,
        success: boolean,
        message: any
    }>();
    private getOrderProductionQueueByProductBarcodeNoUpdated = new Subject<{
        orderProductionQueueBundleNo: OrderProductionQueueBundleNo,
        orderSubNodeFlowCost: OrderSubNodeFlowCost,
        orderID: string, bundleNo: number, bundleID: string,
        productBarcode: string, productCount: number,
        numberFrom: number, numberTo: number,
        success: boolean,
        message: any
    }>();

    private nodeFlowListsUpdated = new Subject<{
        nodeFlow: NodeFlow, success: boolean, message: any,
        nodeStations: NodeStation[],
        subNodeflowC: SubNodeflowC[]
    }>();
    private nodeFlowsListsUpdated = new Subject<{ nodeFlows: NodeFlow[], success: boolean, message: any}>();
    private nodeStationsListsUpdated = new Subject<{ nodeStations: NodeStation[], success: boolean, message: any}>();
    private nodeStation1ListsUpdated = new Subject<{ nodeStation: NodeStation, success: boolean, message: any}>();
    private editUserPassNodeStationListsUpdated = new Subject<{ nodeStation: NodeStation, success: boolean, message: any}>();
    private editUUIDNodeStationListsUpdated = new Subject<{ nodeStation: NodeStation, success: boolean, message: any}>();
    private selectNodeStationUpdated = new Subject<{ nodeStation: NodeStation}>();
    private tabChangeUpdated = new Subject<{ tabChange: boolean}>();
    private checkNodeUserIDExistedUpdated = new Subject<{ isExist: boolean}>();
    private nodeStationLoginRequestsUpdated = new Subject<{ nodeStationLoginRequests: NodeStationLoginRequest[]}>();




    private nodeStationLoginByUUIDUpdated = new Subject<{
        company: Company, factory: Factory,
        nodeStation: NodeStation, stationID: string,
        canLogin: boolean, success: boolean
    }>();
    private staffLoginUpdated = new Subject<{ staff: User, success: boolean}>();
    private dataNodeStationUpdated = new Subject<{
        nodeStation: NodeStation, nodeFlows: NodeFlow[], nodeFlow: NodeFlow,
        subNodeflowC: SubNodeflowC[],
        company: Company,  factory: Factory,
        userGroupScan: UserGroupScan[],
    }>();
    private scanOrderProductionBarcodeNoUpdated = new Subject<{
        companyID: string, factoryID: string,
        nodeID: string, stationID: string,
         success: boolean, mode: string,
        message: any,
        orderProduction: OrderProduction,
        orderProductions: OrderProduction[],
        orderProducts: OrderProduction[],
    }>();
    private scanOrderProductionBarcodeNoOutsourceUpdated = new Subject<{
        companyID: string, factoryID: string,
        nodeID: string, stationID: string,
        orderProduction: OrderProduction, orderProducts: OrderProduction[],
        success: boolean, mode: string,
        message: any
    }>();

    private scanNextDepOrderProductionBarcodeNoUpdated = new Subject<{
        tempID: string,
        companyID: string, factoryID: string,
        nodeID: string, stationID: string,
        orderProductionScan: OrderProductionScan, success: boolean,
        message: any
    }>();
    // private repCurrentProductQtyCFNUpdated = new Subject<{ repListNameArr: string[], repDataFormat1: RepDataFormat1}>();
    private datarecordProductBarcodeNoUpdated = new Subject<{
        productBarcodeNo: string,
        orderProduct: OrderProduction,
        orderProducts: OrderProduction[]}
    >();
    private orderProductionNextNodeIDUpdated = new Subject<{ success: boolean, productBarcodeNos: string[]}>();
    private orderProductionReceivedCancelledUpdated = new Subject<{ success: boolean, productBarcodeNos: string[], message: any}>();
    private orderProductionSentoutCancelledUpdated = new Subject<{ success: boolean, productBarcodeNos: string[], message: any}>();
    //
    private orderProductionProblemUpdated =
        new Subject<{ success: boolean, productBarcodeNo: string, currentProductAllDetailCFN: string[]}>();
    private getProblemProductCFNUpdated = new Subject<{ currentProductAllDetailCFN: any[], productionCount: ProductionRepairCount[]}>();
    private getQRCodeListProductStyleCFNUpdated = new Subject<{ currentProductStyleQRCodeCFN: any[], currentProductStyleCount: any[]}>();


    private ordersListsUpdated = new Subject<{ orders: Order[], ordersCount: number}>();


    private repNodeNoScanUpdated = new Subject<{
        mainDataBundleNoScan: any[],
        // nodeScanProductStyleZone: NodeScanProduct[],
        // nodeScanProductStyleZoneColorSize: NodeScanProduct[]
    }>();
    private repNodeNoScanDetailUpdated = new Subject<{
        mainDataBundleNoScanDetail: any[],
        mainDataBundleNoScanNo: any[],
        // nodeScanProductStyleZoneColorSize: NodeScanProduct[]
    }>();

    private repStaffScannedByDate12Updated = new Subject<{
        nodeScanProductStyle: NodeScanProduct[],
        nodeScanProductStyleZone: NodeScanProduct[],
        nodeScanProductStyleZoneColorSize: NodeScanProduct[]
    }>();
    private repStaffScannedByDate12StyleZoneUpdated = new Subject<{
        nodeScanProductStyleZoneColorSize: NodeScanProduct[]
    }>();
    private getQRCodeListUpdated = new Subject<{
        qrCodeList: QRCodeList[],
        qrCodeCount: QRCodeCount
    }>();
    private repSubNodeStaffScanUpdated = new Subject<{
        subNodeStaffScan: SubNodeStaffScan[],
        subNodeStaffScanStyleZoneColorSize: SubNodeStaffScan[],
        staffs: StaffList[],
    }>();
    private getStaffsListUpdated = new Subject<{
        staffs: StaffList[],
        success: boolean, message: any
    }>();



    constructor(
        private http: HttpClient,
        private router: Router,
        private deviceService: DeviceDetectorService,

        // private loadingCtrl: LoadingController,

        private storageService: StorageService,
        private socketService: SocketIOService,
        private userService: UserService
        // private menuService: MenuService,
    ) { }

    // #######################################################################
    // ## general info ########################################################

    // // ## get    factories by  companyID
    // router.get("/get/nodedatageneral/by/:companyID", nsController.getNodeDatageneral);
    async getNodeDatageneral(companyID: string) {
        // console.log('getNodeDatageneral', companyID);
        // const statusArr = JSON.stringify(status);
        this.http
            .get<{token: string; expiresIn: number; factories: Factory[];}>
            (BACKEND_URL+'/get/nodedatageneral/by/' + companyID)
            .subscribe({
                next: (data) => {
                    // console.log(data);
                    this.factories  = data.factories;
                    this.userService.factories = this.factories;
                    // getNodeStation1UpdatedListener()
                    // this.nodeStation1ListsUpdated.next({ nodeStation: data.nodeStation, success: true, message: {} });
                }, error: error => {
                    // console.log(error.error);
                    // this.signupStatusListener.next(false);
                    // this.errorStatusListener.next(error.error.message);
                }});
    }

    getDataAroundNodeApp(): DataAroundNodeApp {
        const dataAroundNodeApp: DataAroundNodeApp = {
            refreshCurrentPage: this.refreshCurrentPage,
            refreshPage: this.nodeMenuActive,
            isOutsourceMode: this.isOutsourceMode,
            isFactoryAffiliate: this.isFactoryAffiliate,
            isScanSubnode: this.isScanSubnode,
        };
        return dataAroundNodeApp;
    }

    setDataAroundNodeApp(prop: string, val: any) {
        // let dataAroundNodeApp = this.getDataAroundNodeApp();
        this.isOutsourceMode = false;
        this.isFactoryAffiliate = false;
        this.isScanSubnode = false;
        if (prop === 'isOutsourceMode') {
            this.isOutsourceMode = val;
        } else if (prop === 'isFactoryAffiliate') {
            this.isFactoryAffiliate = val;
        } else if (prop === 'isScanSubnode') {
            this.isScanSubnode = val;
        }
        // this.setDataAroundNodeAppStatusListenerToNext();

        // isFactoryAffiliate
    }

    setMenuActive(nodeMenuActive: string) {
        this.nodeMenuActive = nodeMenuActive;
        this.setDataAroundNodeAppStatusListenerToNext();
    }

    setDataAroundNodeAppStatusListenerToNext() {
        this.dataAroundNodeAppStatusListener.next(this.getDataAroundNodeApp());
    }

    getDataAroundNodeAppStatusListener() {
        return this.dataAroundNodeAppStatusListener.asObservable();
    }

    findNextNodeID(fromNode: string, flowSeq: FlowSeq[]) {
        flowSeq.sort((a,b)=>{return a.seqNo >b.seqNo?1:a.seqNo <b.seqNo?-1:0});
        const idx = flowSeq.findIndex( fi =>(fi.nodeID === fromNode));
        if (flowSeq.length === +idx + 1 && flowSeq[flowSeq.length - 1].nodeID === fromNode) {
            return 'completeNode'; // ## production complete
        } else if (flowSeq.length === +idx + 1 && flowSeq[flowSeq.length - 1].nodeID !== fromNode) {
            // ## need force to new reload all page
            window.location.reload();
            return '';
        } else {
            return flowSeq[+idx + 1].nodeID;
        }
    }

    clearDataWhenStaffLogin() {
        this.staff = GBC.clrUser();

    }

    clearDataWhenStaffOutsourceLogin() {
        this.staffScanOutsource = GBC.clrUser();

    }

    clearDataWhenLogOut() {
        this.clearDataWhenStaffLogin()
        this.nodeStation = GBC.clrNodeStation();
        this.stationID = '';
        this.nodeFlow = GBC.clrNodeFlow();
        this.nodeFlows = [];

        this.allProductQty = '';
        this.totalBundle = '';
        this.countOrderID = '';
        this.countProductID = '';

        this.nodeStationLoginRequests = [];
    }

    getNodeIDList(): string[] {
        let nodeIDs: string[] = [];
        this.nodeStations.forEach( (item, index) => {
            nodeIDs.push(item.nodeID);
        });
        nodeIDs.sort();
        return nodeIDs;
    }

    // ## flowType =  'main'  ,  'sub'
    async findNodeFlowType(nodeFlows: NodeFlow[], flowType: string) {
        const nodeFlow = await nodeFlows.filter(i=>(i.flowType == flowType));
        // return nodeFlow.length>0?nodeFlow[0]:null;
        return nodeFlow[0];
    }

    getNodeStationName(nodeStations: NodeStation[], nodeID: string): string {
        // console.log(nodeStations, nodeID);
        const idx = nodeStations.findIndex( fi =>(fi.nodeID === nodeID));
        // console.log(nodeStations[idx].nodeName);
        return nodeStations[idx].nodeName;
    }

    getNodeStatusName(status: string) {
        // a = active , c= close,  d= deleted - no use
        // const statusList = [
        //     {status: 'a', statusName: 'active'},
        //     {status: 'c', statusName: 'close'},
        //     {status: 'd', statusName: 'deleted'},
        // ];
        // const statusName = await statusList.filter(i=>(i.status == status))[0].statusName;
        // // console.log(statusName);
        // return statusName;

        const idx = this.statusList.findIndex( fi =>(fi.status === status));
        return this.statusList[idx].statusName;
    }

    getNodeStatus(statusName: string) {
        // a = active , c= close,  d= deleted - no use
        // const statusList = [
        //     {status: 'a', statusName: 'active'},
        //     {status: 'c', statusName: 'close'},
        //     {status: 'd', statusName: 'deleted'},
        // ];
        // const statusName = await statusList.filter(i=>(i.status == status))[0].statusName;
        // // console.log(statusName);
        // return statusName;

        const idx = this.statusList.findIndex( fi =>(fi.statusName === statusName));
        return this.statusList[idx].status;
    }

    // getNodeStatusBySeq(seqNo: number) {
    //     const idx = this.statusList.findIndex( fi =>(fi.statusName === statusName));
    //     return this.statusList[idx].status;
    // }

    getNodeMustBundleScan(nodeID: string) {
        const idx = this.nodeStations.findIndex( fi =>(fi.nodeID === nodeID));
        return this.nodeStations[idx].nodeInfo.mustBundleScan;
    }

    getSubNodeName(nodeID: string, subNodeID: string) {
        if (nodeID === '' || subNodeID === '') {
            return '';
        }
        const idx = this.subNodeflowC.findIndex( fi =>(fi.nodeID === nodeID && fi.subNodeID === subNodeID));
        // console.log(nodeID, subNodeID, idx);
        return this.subNodeflowC[idx].subNodeName;
    }

    // // ## get node nodeStationLoginRequest
    // router.get("/node9/getdata/nodelogin/:companyID/:factoryID/:nodeID/:status", checkAuth, checkUUID, nsController.getDataNodeStationLogin);
    async getDataNodeStationLogin(companyID: string, factoryID: string, status: string[], nodeID: string) {
        const statusArr = JSON.stringify(status);
        this.http
            .get<{ nodeStation: NodeStation; nodeStations: NodeStation[];
                    nodeFlows: NodeFlow[]; nodeFlow: NodeFlow;
                    company: Company;  factory: Factory;
                    subNodeflowC: SubNodeflowC[];
                    userGroupScan: UserGroupScan[]}>
            (BACKEND_URL+'/node9/getdata/nodelogin/' + companyID+'/'+factoryID+'/'+nodeID+'/'+statusArr)
            .subscribe({
                next: (data) => {
                    // console.log(data);

                    this.userService.setCompany(data.company);
                    this.userService.setFactory(data.factory);
                    this.nodeStation = data.nodeStation;
                    this.nodeStations = data.nodeStations;

                    // ## nodeFlow
                    this.nodeFlows = data.nodeFlows;
                    this.nodeFlow = data.nodeFlow;
                    this.subNodeflowC = data.subNodeflowC;
                    this.userService.subNodeflowC = this.subNodeflowC;
                    this.userService.userGroupScan = data.userGroupScan;
                    // console.log(data.subNodeflowC );
                    // console.log(this.userService.subNodeflowC );

                    // console.log(data.orders);
                    // this.userService.genToken(data.token, data.expiresIn);
                    // this.setOrders(data.orders);

                    // getDataNodeStationUpdatedListener()
                    this.dataNodeStationUpdated.next({
                        nodeStation: data.nodeStation,
                        nodeFlows: data.nodeFlows,
                        nodeFlow: data.nodeFlow,
                        subNodeflowC: data.subNodeflowC,
                        company: data.company,
                        factory: data.factory,
                        userGroupScan: data.userGroupScan
                    });
                }, error: error => {
                    // console.log(error.error);
                    // this.signupStatusListener.next(false);
                    // this.errorStatusListener.next(error.error.message);
                }});
    }

    // // ## get node getDataNodeStation
    // router.get("/node9-1/getdata/nodelogin/:companyID/:factoryID/:status", nsController.getDataNodeStation);
    async getDataNodeStation(companyID: string, factoryID: string, status: string[]) {
        const statusArr = JSON.stringify(status);
        this.http
            .get<{ nodeStation: NodeStation; nodeStations: NodeStation[];
                    nodeFlows: NodeFlow[]; nodeFlow: NodeFlow;
                    company: Company;  factory: Factory;
                    subNodeflowC: SubNodeflowC[];
                    userGroupScan: UserGroupScan[]}>
            (BACKEND_URL+'/node9-1/getdata/nodelogin/' + companyID+'/'+factoryID+'/'+statusArr)
            .subscribe({
                next: (data) => {
                    // console.log(data);

                    // this.userService.setCompany(data.company);
                    // this.userService.setFactory(data.factory);
                    // this.nodeStation = data.nodeStation;
                    this.nodeStations = data.nodeStations;

                    // ## nodeFlow
                    this.nodeFlows = data.nodeFlows;
                    this.nodeFlow = data.nodeFlow;
                    this.subNodeflowC = data.subNodeflowC;
                    this.userService.subNodeflowC = this.subNodeflowC;
                    this.userService.userGroupScan = data.userGroupScan;
                    // console.log(data.subNodeflowC );
                    // console.log(this.userService.subNodeflowC );

                    // console.log(data.orders);
                    // this.userService.genToken(data.token, data.expiresIn);
                    // this.setOrders(data.orders);

                    // getDataNodeStationUpdatedListener()
                    this.dataNodeStationUpdated.next({
                        nodeStation: GBC.clrNodeStation(),
                        nodeFlows: data.nodeFlows,
                        nodeFlow: data.nodeFlow,
                        subNodeflowC: data.subNodeflowC,
                        company: data.company,
                        factory: data.factory,
                        userGroupScan: data.userGroupScan,
                    });
                }, error: error => {
                    // console.log(error.error);
                    // this.signupStatusListener.next(false);
                    // this.errorStatusListener.next(error.error.message);
                }});
    }


    // ## general info ########################################################
    // #######################################################################

    // #######################################################################
    // ## node station ########################################################

    // // ## get node station1
    // router.get("/getnode1/:companyID/:factoryID/:status/:nodeID", checkAuth, checkUUID, nsController.getNodeStations1);
    async getNodeStations1(companyID: string, factoryID: string, status: string[], nodeID: string) {
        const statusArr = JSON.stringify(status);
        this.http
            .get<{token: string; expiresIn: number; userID: string; nodeStation: NodeStation;}>
            (BACKEND_URL+'/getnode1/' + companyID+'/'+factoryID+'/'+statusArr+'/'+nodeID)
            .subscribe({
                next: (data) => {
                    // console.log(data);
                    // console.log(data.orders);
                    this.userService.genToken(data.token, data.expiresIn);
                    // this.setOrders(data.orders);

                    // getNodeStation1UpdatedListener()
                    this.nodeStation1ListsUpdated.next({ nodeStation: data.nodeStation, success: true, message: {} });
                }, error: error => {
                    // console.log(error.error);
                    // this.signupStatusListener.next(false);
                    // this.errorStatusListener.next(error.error.message);
                }});
    }

    async getOrders(companyID: string, page: number, limit: number) {
        // console.log(BACKEND_URL+'/getlist/' + companyID+'/'+ this.userService.getUserID()+'/'+page+'/'+limit);
        this.http
            .get<{ orders: Order[]; ordersCount: number}>
            (BACKEND_URL+'/getlist/' + companyID+'/'+this.userService.getUserID()+'/'+page+'/'+limit)
            .subscribe({
                next: (data) => {
                    // console.log(data);
                    // console.log(data.orders);
                    // this.userService.genToken(data.token, data.expiresIn);
                    // this.setOrders(data.orders);

                    // getCustomersUpdatedListener()
                    this.ordersListsUpdated.next({ orders: data.orders, ordersCount: data.ordersCount});
                }, error: error => {
                    // console.log(error.error);
                    // this.signupStatusListener.next(false);
                    // this.errorStatusListener.next(error.error.message);
                }});
    }

    // router.get("/nodestation/lists/:companyID/:factoryID/:status/:page/:limit", nsController.getNodeStationsList);
    async getNodeStationsList(companyID: string, factoryID: string, status: string[], page: number, limit: number) {
        const statusArr = JSON.stringify(status);
        this.http
            .get<{ nodeStations: NodeStation[]; success: Boolean;}>
            (BACKEND_URL+'/nodestation/lists/' + companyID+'/'+factoryID+'/'+statusArr+'/'+page+'/'+limit)
            .subscribe({
                next: (data) => {
                    // console.log(data);
                    this.nodeStations = data.nodeStations;
                    // this.userService.genToken(data.token, data.expiresIn);
                    // this.setOrders(data.orders);

                    // private nodeStationsListsUpdated = new Subject<{ nodeStations: NodeStation[],success: boolean, message: any}>();
                    // getNodeStationsUpdatedListener()
                    this.nodeStationsListsUpdated.next({
                        nodeStations: data.nodeStations,
                        success: true,
                         message: {}
                    });
                }, error: error => {
                    // console.log(error.error);
                    // this.signupStatusListener.next(false);
                    // this.errorStatusListener.next(error.error.message);
                }});
    }

    // // router.get("/node/lists/:companyID/:factoryID/:status/:page/:limit", checkAuth, checkUUID, nsController.getNodeStations);
    // exports.getNodeStations = async (req, res, next)
    async getNodeStations(companyID: string, factoryID: string, status: string[], page: number, limit: number) {
        const statusArr = JSON.stringify(status);
        this.http
            .get<{token: string; expiresIn: number; userID: string; nodeStations: NodeStation[]; success: Boolean;}>
            (BACKEND_URL+'/node/lists/' + companyID+'/'+factoryID+'/'+statusArr+'/'+page+'/'+limit)
            .subscribe({
                next: (data) => {
                    // console.log(data);
                    this.nodeStations = data.nodeStations;
                    this.userService.genToken(data.token, data.expiresIn);
                    // this.setOrders(data.orders);

                    // private nodeStationsListsUpdated = new Subject<{ nodeStations: NodeStation[],success: boolean, message: any}>();
                    // getNodeStationsUpdatedListener()
                    this.nodeStationsListsUpdated.next({ nodeStations: data.nodeStations, success: true, message: {} });
                }, error: error => {
                    // console.log(error.error);
                    // this.signupStatusListener.next(false);
                    // this.errorStatusListener.next(error.error.message);
                }});
    }

    // router.get("/stf/nodef/nodeflow/:companyID/:factoryID/:nodeFlowID", nsController.stfGetNodeFlow)
    async stfGetNodeFlow(companyID: string, factoryID: string, nodeFlowID: string) {
        this.nodeFlows = [];
        this.http
            .get<{ nodeFlow: NodeFlow;success: boolean; message: any;
                nodeStations: NodeStation[], subNodeflowC: SubNodeflowC[]}>
            (BACKEND_URL+'/stf/nodef/nodeflow/' + companyID+'/'+factoryID+'/'+nodeFlowID)
            .subscribe({
                next: (data) => {
                    // console.log(data);
                    // this.nodeFlows = data.nodeFlows;
                    // this.userService.genToken(data.token, data.expiresIn);
                    // this.setOrders(data.orders);

                    // getNodeFlowUpdatedListener()
                    this.nodeFlowListsUpdated.next({
                        nodeFlow: data.nodeFlow,
                        subNodeflowC: data.subNodeflowC,
                        nodeStations: data.nodeStations,
                        success: true,
                        message: {}
                     });
                }, error: error => {
                    // console.log(error.error);
                    // this.signupStatusListener.next(false);
                    // this.errorStatusListener.next(error.error.message);
                }});
    }

    // // ## get node flow
    // router.get("/nodef/nodeflow/:companyID/:factoryID/:nodeFlowID", checkAuth, checkUUID, nsController.getNodeFlow);
    async getNodeFlow(companyID: string, factoryID: string, nodeFlowID: string) {
        this.nodeFlows = [];
        this.http
            .get<{token: string; expiresIn: number; userID: string; nodeFlow: NodeFlow;success: boolean; message: any;
                nodeStations: NodeStation[], subNodeflowC: SubNodeflowC[]}>
            (BACKEND_URL+'/nodef/nodeflow/' + companyID+'/'+factoryID+'/'+nodeFlowID)
            .subscribe({
                next: (data) => {
                    // console.log(data);
                    // this.nodeFlows = data.nodeFlows;
                    this.userService.genToken(data.token, data.expiresIn);
                    // this.setOrders(data.orders);

                    // getNodeFlowUpdatedListener()
                    this.nodeFlowListsUpdated.next({
                        nodeFlow: data.nodeFlow,
                        subNodeflowC: data.subNodeflowC,
                        nodeStations: data.nodeStations,
                        success: true,
                        message: {}
                     });
                }, error: error => {
                    // console.log(error.error);
                    // this.signupStatusListener.next(false);
                    // this.errorStatusListener.next(error.error.message);
                }});
    }

    // // ## get node flow
    // router.get("/node/nodeflows/:companyID/:factoryID", checkAuth, checkUUID, nsController.getNodeFlows);
    async getNodeFlows(companyID: string, factoryID: string, page: number, limit: number) {
        this.nodeFlows = [];
        this.http
            .get<{token: string; expiresIn: number; userID: string; nodeFlows: NodeFlow[];success: boolean; message: any;}>
            (BACKEND_URL+'/node/nodeflows/' + companyID+'/'+factoryID+'/'+page+'/'+limit)
            .subscribe({
                next: (data) => {
                    // console.log(data);
                    this.nodeFlows = data.nodeFlows;
                    this.userService.genToken(data.token, data.expiresIn);
                    // this.setOrders(data.orders);

                    // getNodeFlowsUpdatedListener()
                    this.nodeFlowsListsUpdated.next({ nodeFlows: data.nodeFlows, success: true, message: {} });
                }, error: error => {
                    // console.log(error.error);
                    // this.signupStatusListener.next(false);
                    // this.errorStatusListener.next(error.error.message);
                }});
    }

    async getNodeFlow1(nodeFlowID: string) {
        const idx = this.nodeFlows.findIndex( fi =>(fi.nodeFlowID === nodeFlowID));
        return this.nodeFlows[idx];
    }

    // // ## /api/ns/nodeflow/creataenew
    // router.post("/nodeflow/createnew", checkAuth, checkUUID, nsController.postNodeFlowCreateNew);
    postNodeFlowCreateNew(nodeFlow: NodeFlow, page: number, limit: number) {
        const dataSent = {
            nodeFlow,
            page,
            limit,
        };
        this.http
            .post<{ token: string; expiresIn: number; userID: string; nodeFlows: NodeFlow[];
                    success: boolean; message: any; }>
                (BACKEND_URL+'/nodeflow/createnew', dataSent)
            .subscribe({
                next: (data) => {
                    // console.log(data);
                    this.userService.genToken(data.token, data.expiresIn);

                    // getNodeFlowsUpdatedListener()
                    this.nodeFlowsListsUpdated.next({
                        nodeFlows: data.nodeFlows, success: data.success, message: data.message
                    });

                }, error: error => {
                    this.nodeFlowsListsUpdated.next({
                        nodeFlows: [],
                        success: false,  message: error.error.message
                    });
                    // console.log(error.error);
                    // this.signupStatusListener.next(false);
                    // this.errorStatusListener.next(error.error.message);
                }});
    }

    // // ## /api/ns/nodeflow/edit  editMode === 'flowType'  'flowCondition'  'flowSeq'
    // router.put("/nodeflow/edit", checkAuth, checkUUID, nsController.putNodeFlowEdit);
    putNodeFlowEdit(editMode: string, nodeFlow: NodeFlow, page: number, limit: number) {
        const dataSent = {
            editMode,
            nodeFlow,
            page,
            limit,
        };
        this.http
            .put<{ token: string; expiresIn: number; userID: string; nodeFlows: NodeFlow[];
                    success: boolean; message: any; }>
                (BACKEND_URL+'/nodeflow/edit', dataSent)
            .subscribe({
                next: (data) => {
                    // console.log(data);
                    this.userService.genToken(data.token, data.expiresIn);

                    // getNodeFlowsUpdatedListener()
                    this.nodeFlowsListsUpdated.next({
                        nodeFlows: data.nodeFlows, success: data.success, message: data.message
                    });

                }, error: error => {
                    this.nodeFlowsListsUpdated.next({
                        nodeFlows: [],
                        success: false,  message: error.error.message
                    });
                    // console.log(error.error);
                    // this.signupStatusListener.next(false);
                    // this.errorStatusListener.next(error.error.message);
                }});
    }

    // // ## /api/ns/node/creataenew
    // router.post("/node/createnew", checkAuth, checkUUID, nsController.postNodeStationCreateNew);
    postNodeStationCreateNew(userID: string, userName: string, nodeStation: NodeStation,
                            status: string[], page: number, limit: number) {
        nodeStation.nodeInfo.createBy.userID = userID;
        nodeStation.nodeInfo.createBy.userName = userName;
        const statusJSON = JSON.stringify(status);
        const dataSent = {
            userID,
            userName,
            status: statusJSON,
            page,
            limit,
            nodeStation
        };
        this.http
            .post<{ token: string; expiresIn: number; userID: string; nodeStations: NodeStation[];
                    success: boolean; message: any; }>
                (BACKEND_URL+'/node/createnew', dataSent)
            .subscribe({
                next: (data) => {
                    // console.log(data);
                    this.userService.genToken(data.token, data.expiresIn);

                    // getNodeStationsUpdatedListener()
                    this.nodeStationsListsUpdated.next({
                        nodeStations: data.nodeStations, success: data.success, message: data.message
                    });

                }, error: error => {
                    this.nodeStationsListsUpdated.next({
                        nodeStations: [],
                        success: false,  message: error.error.message
                    });
                    // console.log(error.error);
                    // this.signupStatusListener.next(false);
                    // this.errorStatusListener.next(error.error.message);
                }});
    }

    // // ## /api/ns/node/edit
    // router.put("/node/edit", checkAuth, checkUUID, nsController.putNodeStationEdit);
    putNodeStationEdit(userID: string, userName: string, nodeStation: NodeStation,
                            status: string[], page: number, limit: number) {

        const statusJSON = JSON.stringify(status);
        const dataSent = {
            userID,
            userName,
            status: statusJSON,
            page,
            limit,
            nodeStation
        };
        this.http
            .put<{ token: string; expiresIn: number; userID: string; nodeStations: NodeStation[];
                    success: boolean; message: any; }>
                (BACKEND_URL+'/node/edit', dataSent)
            .subscribe({
                next: (data) => {
                    // console.log(data);
                    this.userService.genToken(data.token, data.expiresIn);

                    // getNodeStationsUpdatedListener()
                    this.nodeStationsListsUpdated.next({
                        nodeStations: data.nodeStations, success: data.success, message: data.message
                    });

                }, error: error => {
                    this.nodeStationsListsUpdated.next({
                        nodeStations: [],
                        success: false,  message: error.error.message
                    });
                    // console.log(error.error);
                    // this.signupStatusListener.next(false);
                    // this.errorStatusListener.next(error.error.message);
                }});
    }

    // // ## /api/ns/node2/edit/userpass/workstation
    // router.put("/node2/edit/userpass/workstation", checkAuth, checkUUID, nsController.putNodeUserPassStationEdit);
    putNodeUserPassStationEdit(nodeStation: NodeStation, status: string[]) {
        const statusJSON = JSON.stringify(status);
        const dataSent = {
            status: statusJSON,
            nodeStation
        };
        this.http
            .put<{ token: string; expiresIn: number; userID: string; nodeStation: NodeStation;
                    success: boolean; message: any; }>
                (BACKEND_URL+'/node2/edit/userpass/workstation', dataSent)
            .subscribe({
                next: (data) => {
                    // console.log(data);
                    this.userService.genToken(data.token, data.expiresIn);

                    // getEditUserPassNodeStationUpdatedListener()
                    this.editUserPassNodeStationListsUpdated.next({
                        nodeStation: data.nodeStation, success: data.success, message: {}
                    });
                }, error: error => {
                    this.editUserPassNodeStationListsUpdated.next({
                        nodeStation: nodeStation,
                        success: false,  message: error.error.message
                    });
                    // console.log(error.error);
                    // this.signupStatusListener.next(false);
                    // this.errorStatusListener.next(error.error.message);
                }});
    }

    // // ## /api/ns/node3/edit/uuid/workstation
    // router.put("/node3/edit/uuid/workstation", checkAuth, checkUUID, nsController.putNodeUUIDStationEdit);
    putNodeUUIDStationEdit(nodeStation: NodeStation, status: string[]) {
        const statusJSON = JSON.stringify(status);
        const dataSent = {
            status: statusJSON,
            nodeStation
        };
        this.http
            .put<{ token: string; expiresIn: number; userID: string; nodeStation: NodeStation;
                    success: boolean; message: any; }>
                (BACKEND_URL+'/node3/edit/uuid/workstation', dataSent)
            .subscribe({
                next: (data) => {
                    // console.log(data);
                    this.userService.genToken(data.token, data.expiresIn);

                    // getEditUUIDNodeStationUpdatedListener()
                    this.editUUIDNodeStationListsUpdated.next({
                        nodeStation: data.nodeStation, success: data.success, message: {}
                    });
                }, error: error => {
                    this.editUUIDNodeStationListsUpdated.next({
                        nodeStation: nodeStation,
                        success: false,  message: error.error.message
                    });
                    // console.log(error.error);
                    // this.signupStatusListener.next(false);
                    // this.errorStatusListener.next(error.error.message);
                }});
    }

    // // ## get check node user exist
    // router.get("/check/existuserid/:companyID/:factoryID/:nodeID/:checkuserID",
    // checkAuth, checkUUID, nsController.getCheckExistNodeCompanyFactoryUserID);

//     router.get("/check/existuserid/:companyID/:factoryID/:nodeID/:checkuserID",
//   checkAuth, checkUUID, nsController.getCheckExistNodeCompanyFactoryUserID);


    async getCheckExistNodeCompanyFactoryUserID(companyID: string, factory: string, nodeID: string, checkuserID: string) {
        // console.log(companyID, factory, nodeID, checkuserID);
        this.http
            .get<{token: string; expiresIn: number; isExist: boolean}>
            (BACKEND_URL+'/check/existuserid/' + companyID+'/'+factory+'/'+nodeID+'/'+checkuserID)
            .subscribe({
                next: (data) => {
                    // console.log(data);

                    // getCheckNodeUserIDExistedUpdatedListener()
                    this.checkNodeUserIDExistedUpdated.next({ isExist: data.isExist });

                }, error: error => {
                    // console.log(error.error);
                    // this.signupStatusListener.next(false);
                    // this.errorStatusListener.next(error.error.message);
                }});
    }

    // // ## get node nodeStationLoginRequest
    // router.get("/node4/list/usernodelogin", checkAuth, checkUUID, nsController.getNodeStationLoginRequest);
    async getNodeStationLoginRequest() {
        this.nodeStationLoginRequests = [];
        this.http
            .get<{token: string; expiresIn: number; userID: string; nodeStationLoginRequests: NodeStationLoginRequest[]}>
            (BACKEND_URL+'/node4/list/usernodelogin')
            .subscribe({
                next: (data) => {
                    // console.log(data);
                    this.userService.genToken(data.token, data.expiresIn);
                    // this.genToken(data.token, data.expiresIn)
                    // this.membersCompany = data.membersCompany;
                    this.nodeStationLoginRequests = data.nodeStationLoginRequests;

                    // getNodeStationLoginRequestsUpdatedListener()
                    this.nodeStationLoginRequestsUpdated.next({ nodeStationLoginRequests: data.nodeStationLoginRequests });

                }, error: error => {
                    // console.log(error.error);
                    // this.signupStatusListener.next(false);
                    // this.errorStatusListener.next(error.error.message);
                }});
    }

    // // ## delete  node nodeStationLoginRequest
    // router.post("/node5/del/nodeStationLoginRequest", checkAuth, checkUUID, nsController.delNodeStationLoginRequest);
    delNodeStationLoginRequest(nodeStationLoginRequest: NodeStationLoginRequest, action: string) {
        this.nodeStationLoginRequests = [];
        const dataSent = {
            nodeStationLoginRequest,
            action
        };
        this.http
            .post<{ token: string; expiresIn: number; userID: string; nodeStationLoginRequests: NodeStationLoginRequest[]}>
                (BACKEND_URL+'/node5/del/nodeStationLoginRequest', dataSent)
            .subscribe({
                next: (data) => {
                    // console.log(data);
                    this.userService.genToken(data.token, data.expiresIn);
                    // this.userService.setCommandAroundAppStatusListenerToNext('getNodeStationLoginRequest');

                    // getNodeStationLoginRequestsUpdatedListener()
                    this.nodeStationLoginRequestsUpdated.next({ nodeStationLoginRequests: data.nodeStationLoginRequests });
                }, error: error => {
                    // this.editUUIDNodeStationListsUpdated.next({
                    //     nodeStation: nodeStation,
                    //     success: false,  message: error.error.message
                    // });
                    // console.log(error.error);
                    // this.signupStatusListener.next(false);
                    // this.errorStatusListener.next(error.error.message);
                }});
    }

    // // ## delete  node nodeStationLoginRequest  no auth
    // router.post("/node6/del/noauth/nodeStationLoginRequest", nsController.delNodeStationLoginRequestNoAuth);
    delNodeStationLoginRequestNoAuth(nodeStationLoginRequest: NodeStationLoginRequest, action: string) {
        this.nodeStationLoginRequests = [];
        const dataSent = {
            nodeStationLoginRequest,
            action
        };
        this.http
            .post<{ token: string; }>
                (BACKEND_URL+'/node6/del/noauth/nodeStationLoginRequest', dataSent)
            .subscribe({
                next: (data) => {
                    // console.log(data);
                    this.userService.setCommandAroundAppStatusListenerToNext('getNodeStationLoginRequest');
                    // this.userService.setDataAroundAppStatusListenerToNext();

                    // getNodeStationLoginRequestsUpdatedListener()
                    // this.nodeStationLoginRequestsUpdated.next({ nodeStationLoginRequests: data.nodeStationLoginRequests });
                }, error: error => {
                    // this.editUUIDNodeStationListsUpdated.next({
                    //     nodeStation: nodeStation,
                    //     success: false,  message: error.error.message
                    // });
                    // console.log(error.error);
                    // this.signupStatusListener.next(false);
                    // this.errorStatusListener.next(error.error.message);
                }});
    }

    // // ## allow  node nodeStationLoginRequest
    // router.put("/node6/allow/nodeStationLoginRequest", checkAuth, checkUUID, nsController.putAllowNodeStationLoginRequest);
    putAllowNodeStationLoginRequest(nodeStationLoginRequest: NodeStationLoginRequest, action: string) {
        this.nodeStationLoginRequests = [];
        const dataSent = {
            nodeStationLoginRequest,
            action
        };
        this.http
            .put<{ token: string; expiresIn: number; userID: string;
                    nodeStationLoginRequests: NodeStationLoginRequest[]; nodeStation: NodeStation}>
                (BACKEND_URL+'/node6/allow/nodeStationLoginRequest', dataSent)
            .subscribe({
                next: (data) => {
                    // console.log(data);
                    this.userService.genToken(data.token, data.expiresIn);
                    // this.userService.setCommandAroundAppStatusListenerToNext('getNodeStationLoginRequest');
                    this.nodeStation = data.nodeStation;

                    // getNodeStationLoginRequestsUpdatedListener()
                    this.nodeStationLoginRequestsUpdated.next({ nodeStationLoginRequests: data.nodeStationLoginRequests });
                }, error: error => {
                    // this.editUUIDNodeStationListsUpdated.next({
                    //     nodeStation: nodeStation,
                    //     success: false,  message: error.error.message
                    // });
                    // console.log(error.error);
                    // this.signupStatusListener.next(false);
                    // this.errorStatusListener.next(error.error.message);
                }});
    }

    // // ## put log out  node putLogoutNodeStation
    // router.put("/node7/logout/nodeStation", checkAuth, checkUUID, nsController.putLogoutNodeStation);
    putLogoutNodeStation(companyID: string, factoryID: string, nodeID: string) {
        this.clearDataWhenLogOut()
        const dataSent = {
            companyID,
            factoryID,
            nodeID
        };
        this.http
            .put<{ tokenNS: string; }>
                (BACKEND_URL+'/node7/logout/nodeStation', dataSent)
            .subscribe({
                next: (data) => {
                    // console.log(data);
                    // this.userService.genToken(data.token, data.expiresIn);
                    // this.userService.setCommandAroundAppStatusListenerToNext('getNodeStationLoginRequest');

                    // getNodeStationLoginRequestsUpdatedListener()
                    // this.nodeStationLoginRequestsUpdated.next({ nodeStationLoginRequests: data.nodeStationLoginRequests });
                }, error: error => {
                    // this.editUUIDNodeStationListsUpdated.next({
                    //     nodeStation: nodeStation,
                    //     success: false,  message: error.error.message
                    // });
                    // console.log(error.error);
                    // this.signupStatusListener.next(false);
                    // this.errorStatusListener.next(error.error.message);
                }});
    }

    // // ## login  node nodeStation by uuid
    // router.post("/node8/del/nodeStationLoginByUUID", nsController.postLoginNodeStationByUUID);
    postLoginNodeStationByUUID(uuid: string) {
        this.clearDataWhenLogOut();
        const dataSent = {
            uuid
        };
        this.http
            .post<{ tokenNS: string;
                    company: Company; factory: Factory;
                    nodeStation: NodeStation; stationID: string; canLogin: boolean; success: boolean;}>
                (BACKEND_URL+'/node8/del/nodeStationLoginByUUID', dataSent)
            .subscribe({
                next: (data) => {
                    // console.log(data);

                    this.userService.setCompany(data.company);
                    this.userService.setFactory(data.factory);

                    // this.userService.genToken(data.token, data.expiresIn);
                    // this.userService.setCommandAroundAppStatusListenerToNext('getNodeStationLoginRequest');
                    this.stationID = data.stationID;
                    const status = ['a'];
                    this.getDataNodeStationLogin(data.nodeStation.companyID, data.nodeStation.factoryID, status, data.nodeStation.nodeID);

                    // getNodeStationLoginByUUIDUpdatedListener()
                    this.nodeStationLoginByUUIDUpdated.next({
                        company: data.company,
                        factory: data.factory,
                        nodeStation: data.nodeStation,
                        stationID: data.stationID,
                        canLogin: data.canLogin,
                        success: data.success
                    });

                }, error: error => {
                    this.nodeStationLoginByUUIDUpdated.next({
                        company: GBC.clrCompany(),
                        factory: GBC.clrFactory(),
                        nodeStation: GBC.clrNodeStation(),
                        stationID: '',
                        canLogin: false,
                        success: error.error.success
                    });
                }});
    }



    // ## node station ########################################################
    // #######################################################################

    // #######################################################################
    // ## worker node station ########################################################

    //     const userID = data.userID;
    //   const companyID = data.companyID;
    //   const factoryID = data.factoryID;
    //   const orderID = data.orderID;
    //   const productBarcodeNos = data.productBarcodeNos;
    //   const nodeID = data.nodeID;  // ## toNode
    //   const bundleNo = data.bundleNo;
    //   let subNodeFlow = data.subNodeFlow;

    // // ## edit add order production  set putAddOrderProductionSubNodeFlow
    // router.put("/node23/editadd/oderProduction/subNodeFlow", nsController.putAddOrderProductionSubNodeFlow);
    putAddOrderProductionSubNodeFlow(companyID: string, factoryID: string, orderID: string, productBarcodeNos: string[],
        nodeID: string, bundleNo: number, subNodeFlow: SubNodeFlow[]) {
        this.nodeStationLoginRequests = [];
        const dataSent = {
            companyID,
            factoryID,
            orderID,
            productBarcodeNos,
            nodeID,
            bundleNo,
            subNodeFlow,
            userID: this.staff.userID
        };
        this.http
            .put<{ token: string; expiresIn: number; userID: string; success: boolean; message: any}>
                (BACKEND_URL+'/node23/editadd/oderProduction/subNodeFlow', dataSent)
            .subscribe({
                next: (data) => {
                    // console.log(data);
                    // this.userService.genToken(data.token, data.expiresIn);
                    // this.userService.setCommandAroundAppStatusListenerToNext('getNodeStationLoginRequest');
                    // this.nodeStation = data.nodeStation;

                    // getEditAddOrderProductionSubNodeFlowListener()
                    this.editAddOrderProductionSubNodeFlowUpdated.next({
                        success: data.success,
                        message: data.message
                    });
                }, error: error => {
                    this.editAddOrderProductionSubNodeFlowUpdated.next({

                        success: error.error.success,
                        message: error.error.message
                    });
                }});
    }

    // // ## edit add order production  set putEditOrderProductionSubNodeFlow
    // router.put("/node25/editqr/oderProduction/subNodeFlow", nsController.putEditOrderProductionSubNodeFlow);
    putEditOrderProductionSubNodeFlow(companyID: string, factoryID: string, orderID: string, productBarcodeNos: string[],
        nodeID: string, subNodeID: string, qrCode: string) {
        this.nodeStationLoginRequests = [];
        const dataSent = {
            companyID,
            factoryID,
            orderID,
            productBarcodeNos,
            nodeID,
            subNodeID,
            qrCode,
            createBy: this.userService.getCreateBy(),
            userID: this.staff.userID
        };
        this.http
            .put<{ token: string; expiresIn: number; userID: string; success: boolean; message: any}>
                (BACKEND_URL+'/node25/editqr/oderProduction/subNodeFlow', dataSent)
            .subscribe({
                next: (data) => {
                    // console.log(data);

                    // getEditQROrderProductionSubNodeFlowListener()
                    this.editQROrderProductionSubNodeFlowUpdated.next({
                        success: data.success,
                        message: data.message
                    });
                }, error: error => {
                    this.editQROrderProductionSubNodeFlowUpdated.next({

                        success: error.error.success,
                        message: error.error.message
                    });
                }});
    }

    // router.get("/node18/get1/staffinfo/:companyID/:factoryID/:qrCode", checkAuth, checkUUID, nsController.getWorkerInfoByQRCode1);
    async getWorkerInfoByQRCode1(companyID: string, factoryID: string, qrCode: string, mode: string) {
        // console.log(companyID, factoryID, qrCode, mode);
        // this.nodeStationLoginRequests = [];
        this.http
            .get<{token: string; expiresIn: number; userID: string; staff: User; success: boolean; message: any}>
            (BACKEND_URL+'/node18/get1/staffinfo/'+companyID+'/'+factoryID+'/'+qrCode+'/'+mode)
            .subscribe({
                next: (data) => {
                    // console.log(data);
                    // this.userService.genToken(data.token, data.expiresIn);
                    // this.genToken(data.token, data.expiresIn)
                    // this.membersCompany = data.membersCompany;
                    // this.nodeStationLoginRequests = data.nodeStationLoginRequests;

                    // getStaffInfoUpdatedListener()
                    // private getStaffInfoUpdated = new Subject<{ staff: User, success: boolean, message: any}>();
                    this.getStaffInfoUpdated.next({
                        staff: data.staff,
                        success: data.success,
                        message: data.message
                    });

                }, error: error => {
                    // console.log(error.error);
                    // this.signupStatusListener.next(false);
                    // this.errorStatusListener.next(error.error.message);
                    this.getStaffInfoUpdated.next({
                        staff: GBC.clrUser(),
                        success: error.error.success,
                        message: error.error.message
                    });
                }});
    }

    // // ## get subNodeFlowCost 1
    // router.get("/node19/get1/subNodeFlowCost/:companyID/:orderID", nsController.getsubNodeFlowCost1);
    async getsubNodeFlowCost1(companyID: string, orderID: string) {
        // console.log(companyID, factoryID, qrCode, mode);
        // this.nodeStationLoginRequests = [];
        this.http
            .get<{token: string; expiresIn: number; userID: string;
                orderSubNodeFlowCost: OrderSubNodeFlowCost; success: boolean; message: any}>
            (BACKEND_URL+'/node19/get1/subNodeFlowCost/'+companyID+'/'+orderID)
            .subscribe({
                next: (data) => {
                    // console.log(data);
                    // this.userService.genToken(data.token, data.expiresIn);
                    // this.genToken(data.token, data.expiresIn)
                    // this.membersCompany = data.membersCompany;
                    // this.nodeStationLoginRequests = data.nodeStationLoginRequests;

                    // getSubNodeFlowCostListener()
                    this.getSubNodeFlowCostUpdated.next({
                        orderSubNodeFlowCost: data.orderSubNodeFlowCost,
                        success: data.success,
                        message: data.message
                    });

                }, error: error => {
                    // console.log(error.error);
                    // this.signupStatusListener.next(false);
                    // this.errorStatusListener.next(error.error.message);
                    this.getSubNodeFlowCostUpdated.next({
                        orderSubNodeFlowCost: GBC.clrOrderSubNodeFlowCost(),
                        success: error.error.success,
                        message: error.error.message
                    });
                }});
    }

    // // ## get getOrderProductionQueueByBundleNo1
    // router.get("/node20/get1/orderProductionQueue/:companyID/:orderID/:bundleNo",
    // nsController.getOrderProductionQueueByBundleNo1);
    async getOrderProductionQueueByBundleNo1(companyID: string, orderID: string, bundleNo: number) {
        // console.log(companyID, factoryID, qrCode, mode);
        // this.nodeStationLoginRequests = [];
        this.http
            .get<{token: string; expiresIn: number; userID: string;
                orderProductionQueueBundleNo: OrderProductionQueueBundleNo;
                orderSubNodeFlowCost: OrderSubNodeFlowCost;
                orderID: string; bundleNo: number; bundleID: string;
                productBarcode: string; productCount: number;
                numberFrom: number; numberTo: number;
                success: boolean; message: any}>
            (BACKEND_URL+'/node20/get1/orderProductionQueue/'+companyID+'/'+orderID+'/'+bundleNo)
            .subscribe({
                next: (data) => {
                    // console.log(data);
                    // this.userService.genToken(data.token, data.expiresIn);
                    // this.genToken(data.token, data.expiresIn)
                    // this.membersCompany = data.membersCompany;
                    // this.nodeStationLoginRequests = data.nodeStationLoginRequests;

                    // getOrderProductionQueueBundleNoListener()
                    this.getOrderProductionQueueBundleNoUpdated.next({
                        orderProductionQueueBundleNo: data.orderProductionQueueBundleNo,
                        orderSubNodeFlowCost: data.orderSubNodeFlowCost,
                        orderID: data.orderID,
                        bundleNo: data.bundleNo,
                        bundleID: data.bundleID,
                        productBarcode: data.productBarcode,
                        productCount: data.productCount,
                        numberFrom: data.numberFrom,
                        numberTo: data.numberTo,
                        success: data.success,
                        message: data.message
                    });

                }, error: error => {
                    // console.log(error.error);
                    // this.signupStatusListener.next(false);
                    // this.errorStatusListener.next(error.error.message);
                    this.getOrderProductionQueueBundleNoUpdated.next({
                        orderProductionQueueBundleNo: GBC.clrOrderProductionQueueBundleNo(),
                        orderSubNodeFlowCost: GBC.clrOrderSubNodeFlowCost(),
                        orderID: '',
                        bundleNo: 0,
                        bundleID: '',
                        productBarcode: '',
                        productCount: 0,
                        numberFrom: 0,
                        numberTo: 0,
                        success: error.error.success,
                        message: error.error.message
                    });
                }});
    }

    // putDeleteSubNodeOrderProductionByBarcodeNo(this.company.companyID, orderID, bundleNo, bundleID)
    // router.put("/node26/editqr/oderProduction/subNodeFlow/del1", nsController.putDeleteSubNodeOrderProductionByBarcodeNo);
    putDeleteSubNodeOrderProductionByBarcodeNo(companyID: string, orderID: string, bundleNo: number, bundleID: string,
        nodeID: string, subNodeIDSelected: string, productBarcode: string,  productCount: number) {
        const dataSent = {
            companyID,
            orderID,
            bundleNo,
            bundleID,
            nodeID,
            subNodeIDSelected,
            productBarcode,
            productCount,
        };
        this.http
            .put<{ token: string; expiresIn: number; userID: string;
                orderProductionQueueBundleNo: OrderProductionQueueBundleNo;
                orderSubNodeFlowCost: OrderSubNodeFlowCost;
                orderID: string; bundleNo: number; bundleID: string;
                productBarcode: string; productCount: number;
                numberFrom: number; numberTo: number;
                success: boolean; message: any}>
                (BACKEND_URL+'/node26/editqr/oderProduction/subNodeFlow/del1', dataSent)
            .subscribe({
                next: (data) => {
                    // console.log(data);
                    // this.userService.genToken(data.token, data.expiresIn);
                    // this.userService.setCommandAroundAppStatusListenerToNext('getNodeStationLoginRequest');

                    // getOrderProductionQueueByProductBarcodeNoListener()
                    this.getOrderProductionQueueByProductBarcodeNoUpdated.next({
                        orderProductionQueueBundleNo: data.orderProductionQueueBundleNo,
                        orderSubNodeFlowCost: data.orderSubNodeFlowCost,
                        orderID: data.orderID,
                        bundleNo: data.bundleNo,
                        bundleID: data.bundleID,
                        productBarcode: data.productBarcode,
                        productCount: data.productCount,
                        numberFrom: data.numberFrom,
                        numberTo: data.numberTo,
                        success: data.success,
                        message: data.message
                    });
                }, error: error => {
                    // console.log(error.error);
                    this.getOrderProductionQueueByProductBarcodeNoUpdated.next({
                        orderProductionQueueBundleNo: GBC.clrOrderProductionQueueBundleNo(),
                        orderSubNodeFlowCost: GBC.clrOrderSubNodeFlowCost(),
                        orderID: '',
                        bundleNo: 0,
                        bundleID: '',
                        productBarcode: '',
                        productCount: 0,
                        numberFrom: 0,
                        numberTo: 0,
                        success: error.error.success,
                        message: error.error.message
                    });

                }});
    }

    // router.get("/node22/get1/orderProductionQueue/:companyID/:productBarcodeNo",
    // nsController.getOrderProductionQueueByProductBarcodeNo);
    async getOrderProductionQueueByProductBarcodeNo(companyID: string, productBarcodeNo: string) {
        // console.log(companyID, factoryID, qrCode, mode);
        // this.nodeStationLoginRequests = [];
        this.http
            .get<{token: string; expiresIn: number; userID: string;
                orderProductionQueueBundleNo: OrderProductionQueueBundleNo;
                orderSubNodeFlowCost: OrderSubNodeFlowCost;
                orderID: string; bundleNo: number; bundleID: string;
                productBarcode: string; productCount: number;
                numberFrom: number; numberTo: number;
                success: boolean; message: any}>
            (BACKEND_URL+'/node22/get1/orderProductionQueue/'+companyID+'/'+productBarcodeNo)
            .subscribe({
                next: (data) => {
                    // console.log(data);
                    // this.userService.genToken(data.token, data.expiresIn);
                    // this.genToken(data.token, data.expiresIn)
                    // this.membersCompany = data.membersCompany;
                    // this.nodeStationLoginRequests = data.nodeStationLoginRequests;

                    // getOrderProductionQueueByProductBarcodeNoListener()
                    this.getOrderProductionQueueByProductBarcodeNoUpdated.next({
                        orderProductionQueueBundleNo: data.orderProductionQueueBundleNo,
                        orderSubNodeFlowCost: data.orderSubNodeFlowCost,
                        orderID: data.orderID,
                        bundleNo: data.bundleNo,
                        bundleID: data.bundleID,
                        productBarcode: data.productBarcode,
                        productCount: data.productCount,
                        numberFrom: data.numberFrom,
                        numberTo: data.numberTo,
                        success: data.success,
                        message: data.message
                    });

                }, error: error => {
                    // console.log(error.error);
                    // this.signupStatusListener.next(false);
                    // this.errorStatusListener.next(error.error.message);
                    this.getOrderProductionQueueByProductBarcodeNoUpdated.next({
                        orderProductionQueueBundleNo: GBC.clrOrderProductionQueueBundleNo(),
                        orderSubNodeFlowCost: GBC.clrOrderSubNodeFlowCost(),
                        orderID: '',
                        bundleNo: 0,
                        bundleID: '',
                        productBarcode: '',
                        productCount: 0,
                        numberFrom: 0,
                        numberTo: 0,
                        success: error.error.success,
                        message: error.error.message
                    });
                }});
    }

    // // ## get orderProduction   getorderProductionCNByORIDBunNo
    // router.get("/node21/orderProduction/lists/:companyID/:orderID/:bundleNo/:nodeID",
    // nsController.getorderProductionCNByORIDBunNo);
    async getorderProductionCNByORIDBunNo(companyID: string, orderID: string, bundleNo: number, nodeID: string) {
        // console.log(companyID, factoryID, qrCode, mode);
        // this.nodeStationLoginRequests = [];
        this.http
            .get<{token: string; expiresIn: number; userID: string;
                orderProductions: OrderProduction[];
                // orderSubNodeFlowCost: OrderSubNodeFlowCost;
                success: boolean; message: any}>
            (BACKEND_URL+'/node21/orderProduction/lists/'+companyID+'/'+orderID+'/'+bundleNo+'/'+nodeID)
            .subscribe({
                next: (data) => {
                    // console.log(data);
                    // this.userService.genToken(data.token, data.expiresIn);
                    // this.genToken(data.token, data.expiresIn)
                    // this.membersCompany = data.membersCompany;
                    // this.nodeStationLoginRequests = data.nodeStationLoginRequests;

                    // console.log(data.orderProductions);

                    // getOrderProductionListListener()
                    this.getOrderProductionListUpdated.next({
                        orderProductions: data.orderProductions,
                        success: data.success,
                        message: data.message
                    });

                }, error: error => {
                    // console.log(error.error);
                    // this.signupStatusListener.next(false);
                    // this.errorStatusListener.next(error.error.message);
                    this.getOrderProductionListUpdated.next({
                        orderProductions: [],
                        success: error.error.success,
                        message: error.error.message
                    });
                }});
    }

    // // ## staff login to node workstation staffNodeLogin
    // router.post("/nodestation/staff/login", nsController.staffNodeLogin);
    staffNodeLogin(userID: string, userPass: string, companyID: string, factoryID: string) {
        this.clearDataWhenStaffLogin()
        const dataSent = {
            userID,
            userPass,
            companyID,
            factoryID
        };
        this.http
            .post<{ tokenNS: string; expiresIn: number; userID: string; user: User; success: boolean}>
                (BACKEND_URL+'/nodestation/staff/login', dataSent)
            .subscribe({
                next: (data) => {
                    // console.log(data);
                    this.staff = data.user;
                    // this.userService.genToken(data.token, data.expiresIn);
                    // this.userService.setCommandAroundAppStatusListenerToNext('getNodeStationLoginRequest');

                    // getStaffLoginUpdatedListener()
                    this.staffLoginUpdated.next({ staff: data.user, success: data.success });

                }, error: error => {
                    this.staffLoginUpdated.next({ staff: GBC.clrUser(), success: error.error.success });

                }});
    }

    // // ## get scan order production for send product to next department putScanOrderProductionBarcodeNo
    // router.put("/scanroderProduction/productBarcodeNo", nsController.putScanOrderProductionBarcodeNo);
    putScanOrderProductionBarcodeNo(userID: string, companyID: string, factoryID: string, productBarcodeNo: string, nodeID: string,
                                    stationID: string, mode: string, scan1ForAll: boolean) {
        const dataSent = {
            userID,
            companyID,
            factoryID,
            productBarcodeNo,
            nodeID,
            stationID,
            mode,
            scan1ForAll,
        };
        this.http
            .put<{ tokenNS: string; expiresIn: number; userID: string; companyID: string; factoryID: string; nodeID: string;
                    stationID: string;  success: boolean; message: any; mode: string;
                    orderProduction: OrderProduction;
                    orderProductions: OrderProduction[];
                    orderProducts: OrderProduction[];}>
                (BACKEND_URL+'/scanroderProduction/productBarcodeNo', dataSent)
            .subscribe({
                next: (data) => {
                    // console.log(data);
                    // this.userService.genToken(data.token, data.expiresIn);
                    // this.userService.setCommandAroundAppStatusListenerToNext('getNodeStationLoginRequest');

                    // getScanOrderProductionBarcodeNoUpdatedListener()
                    this.scanOrderProductionBarcodeNoUpdated.next({
                        companyID: data.companyID,
                        factoryID: data.factoryID,
                        nodeID: data.nodeID,
                        stationID: data.stationID,
                        orderProduction: data.orderProduction,
                        orderProductions: data.orderProductions,
                        orderProducts: data.orderProducts,
                        success: data.success,
                        mode: data.mode,
                        message: {}
                     });
                }, error: error => {
                    // console.log(error.error);
                    this.scanOrderProductionBarcodeNoUpdated.next({
                        companyID: companyID,
                        factoryID: factoryID,
                        nodeID: nodeID,
                        stationID: stationID,
                        orderProduction: GBC.clrOrderProduction(),
                        orderProductions: [],
                        orderProducts: [],
                        success: error.error.success,
                        mode: 'err',
                        message: error.error.message,
                     });

                }});
    }

    // // ## get scan order production for receive from outsource putScanOrderProductionBarcodeNoReceiveOutsource
    // router.put("/outsource1/receive/scanroderProduction/productBarcodeNo",
    // nsController.putScanOrderProductionBarcodeNoReceiveOutsource);
    putScanOrderProductionBarcodeNoReceiveOutsource(userID: string, companyID: string, factoryID: string,
                                    productBarcodeNo: string, nodeID: string,
                                    stationID: string, mode: string) {
        const dataSent = {
            userID,
            companyID,
            factoryID,
            productBarcodeNo,
            nodeID,
            stationID,
            mode,
        };
        this.http
            .put<{ tokenNS: string; expiresIn: number; userID: string; companyID: string; factoryID: string; nodeID: string;
                    stationID: string;
                    orderProduction: OrderProduction; orderProducts: OrderProduction[];
                    success: boolean; message: any; mode: string;}>
                (BACKEND_URL+'/outsource1/receive/scanroderProduction/productBarcodeNo', dataSent)
            .subscribe({
                next: (data) => {
                    // console.log(data);
                    // this.userService.genToken(data.token, data.expiresIn);
                    // this.userService.setCommandAroundAppStatusListenerToNext('getNodeStationLoginRequest');

                    // getScanOrderProductionBarcodeNoOutsourceUpdatedListener()
                    this.scanOrderProductionBarcodeNoOutsourceUpdated.next({
                        companyID: data.companyID,
                        factoryID: data.factoryID,
                        nodeID: data.nodeID,
                        stationID: data.stationID,
                        orderProduction: data.orderProduction,
                        orderProducts: data.orderProducts,
                        success: data.success,
                        mode: data.mode,
                        message: {}
                     });
                }, error: error => {
                    // console.log(error.error);
                    this.scanOrderProductionBarcodeNoOutsourceUpdated.next({
                        companyID: companyID,
                        factoryID: factoryID,
                        nodeID: nodeID,
                        stationID: stationID,
                        orderProduction: GBC.clrOrderProduction(),
                        orderProducts: [],
                        success: error.error.success,
                        mode: 'err',
                        message: error.error.message,
                     });

                }});
    }

    // // ## get scan order production for sendout from us putScanOrderProductionBarcodeNoReceiveOutsourceSendOut
    // router.put("/outsource3/sendout/scanroderProduction/productBarcodeNo",
    // nsController.putScanOrderProductionBarcodeNoReceiveOutsourceSendOut);
    putScanOrderProductionBarcodeNoReceiveOutsourceSendOut(userID: string, companyID: string, factoryID: string,
                                    productBarcodeNo: string, nodeID: string,
                                    stationID: string, mode: string, toNode: string) {
        const dataSent = {
            userID,
            companyID,
            factoryID,
            productBarcodeNo,
            nodeID,
            stationID,
            mode,
            toNode,
        };
        this.http
            .put<{ tokenNS: string; expiresIn: number; userID: string; companyID: string; factoryID: string; nodeID: string;
                    stationID: string; orderProduction: OrderProduction; orderProducts: OrderProduction[];
                    success: boolean; message: any; mode: string;}>
                (BACKEND_URL+'/outsource3/sendout/scanroderProduction/productBarcodeNo', dataSent)
            .subscribe({
                next: (data) => {
                    // console.log(data);
                    // this.userService.genToken(data.token, data.expiresIn);
                    // this.userService.setCommandAroundAppStatusListenerToNext('getNodeStationLoginRequest');

                    // getScanOrderProductionBarcodeNoOutsourceUpdatedListener()
                    this.scanOrderProductionBarcodeNoOutsourceUpdated.next({
                        companyID: data.companyID,
                        factoryID: data.factoryID,
                        nodeID: data.nodeID,
                        stationID: data.stationID,
                        orderProduction: data.orderProduction,
                        orderProducts: data.orderProducts,
                        success: data.success,
                        mode: data.mode,
                        message: {}
                     });
                }, error: error => {
                    // console.log(error.error);
                    this.scanOrderProductionBarcodeNoOutsourceUpdated.next({
                        companyID: companyID,
                        factoryID: factoryID,
                        nodeID: nodeID,
                        stationID: stationID,
                        orderProduction: GBC.clrOrderProduction(),
                        orderProducts: [],
                        success: error.error.success,
                        mode: 'err',
                        message: error.error.message,
                     });

                }});
    }

    // // ## get scan order production for send product to next department putScanNextDepCompleteOrderProductionBarcodeNo
    // router.put("/nextdep/scanroderProduction/productBarcodeNo", nsController.putScanNextDepCompleteOrderProductionBarcodeNo);
    putScanNextDepCompleteOrderProductionBarcodeNo(tempID: string, orderProductionScan: OrderProductionScan) {
        const dataSent = {
            tempID,
            orderProductionScan,
            createBy:{
                userID: this.staff.userID,
                userName: this.staff.uInfo.userName
            },
        };
        this.http
            .put<{ tokenNS: string; expiresIn: number; userID: string; companyID: string; factoryID: string; nodeID: string;
                    stationID: string; tempID: string; orderProductionScan: OrderProductionScan; success: boolean; message: any}>
                (BACKEND_URL+'/nextdep/scanroderProduction/productBarcodeNo', dataSent)
            .subscribe({
                next: (data) => {
                    // console.log(data);
                    // this.userService.genToken(data.token, data.expiresIn);
                    // this.userService.setCommandAroundAppStatusListenerToNext('getNodeStationLoginRequest');



                    // getScanNextDepOrderProductionBarcodeNoUpdatedListener()
                    this.scanNextDepOrderProductionBarcodeNoUpdated.next({
                        tempID: data.tempID,
                        companyID: data.companyID,
                        factoryID: data.factoryID,
                        nodeID: data.nodeID,
                        stationID: data.stationID,
                        orderProductionScan: data.orderProductionScan,
                        success: data.success,
                        message: {}
                     });
                }, error: error => {
                    // console.log(error.error);
                    this.scanNextDepOrderProductionBarcodeNoUpdated.next({
                        tempID: tempID,
                        companyID: orderProductionScan.companyID,
                        factoryID: orderProductionScan.factoryID,
                        nodeID: orderProductionScan.nodeID,
                        stationID: orderProductionScan.stationID,
                        orderProductionScan: GBC.clrOrderProductionScan(),
                        success: error.error.success,
                        message: error.error.message,
                     });

                }});
    }

    // // ## get node product record productBarcodeNo  getDatarecordProductBarcodeNo
    // router.get("/node10/record/productBarcodeNo/:companyID/:factoryID/:productBarcodeNo", nsController.getDatarecordProductBarcodeNo);
    async getDatarecordProductBarcodeNo(companyID: string, factoryID: string, productBarcodeNo: string) {
    this.http
        .get<{token: string; expiresIn: number;  orderProduct: OrderProduction; orderProducts: OrderProduction[];}>
        (BACKEND_URL+'/node10/record/productBarcodeNo/'+ companyID+'/'+factoryID+'/'+productBarcodeNo)
        .subscribe({
            next: (data) => {
                // console.log(data);
                // this.userService.genToken(data.token, data.expiresIn);

                // getDatarecordProductBarcodeNoUpdatedListener()
                this.datarecordProductBarcodeNoUpdated.next({
                    productBarcodeNo: productBarcodeNo,
                    orderProduct: data.orderProduct,
                    orderProducts: data.orderProducts
                 });
            }, error: error => {
                // console.log(error.error);
                // this.signupStatusListener.next(false);
                // this.errorStatusListener.next(error.error.message);
            }});
    }

    // // ## edit order production  send product to next department
    // router.put("/node11/edit/oderProduction/nextnode", nsController.putOrderProductionNextNodeID);
    putOrderProductionNextNodeID(
        companyID: string, factoryID: string, stationID: string,
        orderID: string, productID: string,
        productBarcodeNos: string[], productionNode: ProductionNode, washingAndPressingMerge: boolean
    ) {
        // companyID
        // factoryID
        // orderID
        // productID
        // productBarcodeNo
        const dataSent = {
            companyID,
            factoryID,
            stationID,
            orderID,
            productID,
            productBarcodeNos,
            productionNode,
            washingAndPressingMerge,
            createBy:{
                userID: this.staff.userID,
                userName: this.staff.uInfo.userName
            },
        };
        this.http
            .put<{ tokenNS: string; expiresIn: number; success: boolean; productBarcodeNos: string[]}>
                (BACKEND_URL+'/node11/edit/oderProduction/nextnode', dataSent)
            .subscribe({
                next: (data) => {
                    // console.log(data);
                    // this.userService.genToken(data.token, data.expiresIn);
                    // this.userService.setCommandAroundAppStatusListenerToNext('getNodeStationLoginRequest');

                    // getOrderProductionNextNodeIDUpdatedListener()
                    this.orderProductionNextNodeIDUpdated.next({
                        success: true,
                        productBarcodeNos: data.productBarcodeNos
                    });
                }, error: error => {
                    // console.log(error.error);
                    // this.scanNextDepOrderProductionBarcodeNoUpdated.next({
                    //     tempID: tempID,
                    //     companyID: orderProductionScan.companyID,
                    //     factoryID: orderProductionScan.factoryID,
                    //     nodeID: orderProductionScan.nodeID,
                    //     stationID: orderProductionScan.stationID,
                    //     orderProductionScan: this.userService.clrOrderProductionScan(),
                    //     success: error.error.success,
                    //     message: error.error.message,
                    //  });

                }});
    }


    // // ## edit order production  send product to next department
    // router.put("/outsource2/edit/oderProduction/nextnode", nsController.putOutsourceOrderProductionNextNodeID);
    putOutsourceOrderProductionNextNodeID(
        companyID: string, factoryID: string, orderID: string, productID: string,
        productBarcodeNos: string[], productionNode: ProductionNode[]
    ) {
        // companyID
        // factoryID
        // orderID
        // productID
        // productBarcodeNo
        const dataSent = {
            companyID,
            factoryID,
            orderID,
            productID,
            productBarcodeNos,
            productionNode,
            createBy:{
                userID: this.staff.userID,
                userName: this.staff.uInfo.userName
            },
        };
        this.http
            .put<{ tokenNS: string; expiresIn: number; success: boolean; productBarcodeNos: string[]}>
                (BACKEND_URL+'/outsource2/edit/oderProduction/nextnode', dataSent)
            .subscribe({
                next: (data) => {
                    // console.log(data);
                    // this.userService.genToken(data.token, data.expiresIn);
                    // this.userService.setCommandAroundAppStatusListenerToNext('getNodeStationLoginRequest');


                    // getOrderProductionNextNodeIDUpdatedListener()
                    this.orderProductionNextNodeIDUpdated.next({
                        success: true,
                        productBarcodeNos: data.productBarcodeNos
                    });
                }, error: error => {
                    // console.log(error.error);
                    this.orderProductionNextNodeIDUpdated.next({
                        success: false,
                        productBarcodeNos: []
                    });

                }});
    }

    // // ## edit order production  send product to next department
    // router.put("/outsource5/editcancel/oderProduction/received", nsController.putCancelOutsourceOrderProductionReceived);
    putCancelOutsourceOrderProductionReceived(companyID: string, productBarcodeNos: string[]) {
        const dataSent = {
            companyID,
            productBarcodeNos,
        };
        this.http
            .put<{ tokenNS: string; expiresIn: number; success: boolean; message: any; productBarcodeNos: string[]}>
                (BACKEND_URL+'/outsource5/editcancel/oderProduction/received', dataSent)
            .subscribe({
                next: (data) => {
                    // console.log(data);
                    // this.userService.genToken(data.token, data.expiresIn);
                    // this.userService.setCommandAroundAppStatusListenerToNext('getNodeStationLoginRequest');

                    // orderProductionReceivedCancelledUpdated = new Subject<{ success: boolean, productBarcodeNos: string[]}>();
                    // getOrderProductionReceivedCancelledUpdatedListener()
                    this.orderProductionReceivedCancelledUpdated.next({
                        success: true,
                        productBarcodeNos: data.productBarcodeNos,
                        message:  {}
                    });
                }, error: error => {
                    // console.log(error.error);
                    this.orderProductionReceivedCancelledUpdated.next({
                        success: false,
                        productBarcodeNos: [],
                        message: error.error.message,
                    });

                }});
    }

    // // router.put("/outsource6/editcancel/oderProduction/sendout", nsController.putCancelOutsourceOrderProductionsendout);
    // exports.putCancelOutsourceOrderProductionsendout
    putCancelOutsourceOrderProductionsendout(companyID: string, productBarcodeNos: string[]) {
        const dataSent = {
            companyID,
            productBarcodeNos,
        };
        this.http
            .put<{ tokenNS: string; expiresIn: number; success: boolean; message: any; productBarcodeNos: string[]}>
                (BACKEND_URL+'/outsource6/editcancel/oderProduction/sendout', dataSent)
            .subscribe({
                next: (data) => {
                    // console.log(data);
                    // this.userService.genToken(data.token, data.expiresIn);
                    // this.userService.setCommandAroundAppStatusListenerToNext('getNodeStationLoginRequest');

                    // orderProductionSentoutCancelledUpdated = new Subject<{ success: boolean, productBarcodeNos: string[]}>();
                    // getOrderProductionSentoutCancelledUpdatedListener()
                    this.orderProductionSentoutCancelledUpdated.next({
                        success: true,
                        productBarcodeNos: data.productBarcodeNos,
                        message:  {}
                    });
                }, error: error => {
                    // console.log(error.error);
                    this.orderProductionSentoutCancelledUpdated.next({
                        success: false,
                        productBarcodeNos: [],
                        message: error.error.message,
                    });

                }});
    }

    // putOutsourceOrderProductionSendOut
    // ## edit order production  send product to send out
    // router.put("/outsource4/edit/oderProduction/sendout", nsController.putOutsourceOrderProductionSendOut);
    putOutsourceOrderProductionSendOut(
        companyID: string, factoryID: string, orderID: string, productID: string,
        productBarcodeNos: string[], productionNode: ProductionNode
    ) {
        // companyID
        // factoryID
        // orderID
        // productID
        // productBarcodeNo
        const dataSent = {
            companyID,
            factoryID,
            orderID,
            productID,
            productBarcodeNos,
            productionNode,
            createBy:{
                userID: this.staff.userID,
                userName: this.staff.uInfo.userName
            },
        };
        this.http
            .put<{ tokenNS: string; expiresIn: number; success: boolean; productBarcodeNos: string[]}>
                (BACKEND_URL+'/outsource4/edit/oderProduction/sendout', dataSent)
            .subscribe({
                next: (data) => {
                    // console.log(data);
                    // this.userService.genToken(data.token, data.expiresIn);
                    // this.userService.setCommandAroundAppStatusListenerToNext('getNodeStationLoginRequest');

                    // getOrderProductionNextNodeIDUpdatedListener()
                    this.orderProductionNextNodeIDUpdated.next({
                        success: true,
                        productBarcodeNos: data.productBarcodeNos
                    });
                }, error: error => {
                    // console.log(error.error);
                    // this.scanNextDepOrderProductionBarcodeNoUpdated.next({
                    //     tempID: tempID,
                    //     companyID: orderProductionScan.companyID,
                    //     factoryID: orderProductionScan.factoryID,
                    //     nodeID: orderProductionScan.nodeID,
                    //     stationID: orderProductionScan.stationID,
                    //     orderProductionScan: this.userService.clrOrderProductionScan(),
                    //     success: error.error.success,
                    //     message: error.error.message,
                    //  });

                }});
    }

    // // ## get product repair
    // router.get("/node15/orderProduction/repair/:companyID/:factoryID/:nodeID/:productStatus/:page/:limit",
    // nsController.getRepairProductCFN);

    // productionRepairCount: ProductionRepairCount[];
    // productionProblemCount: ProductionRepairCount[];
    async getRepairProductCFN(companyID: string, factoryID: string, nodeID: string, productStatus: string[], page: number, limit: number) {
        const productStatusArr = JSON.stringify(productStatus);
        this.http
            .get<{token: string; expiresIn: number;  currentProductAllDetailCFN: any[]; productionCount: ProductionRepairCount[];}>
            (BACKEND_URL+'/node15/orderProduction/repair/'+ companyID+'/'+factoryID+'/'+nodeID+'/'+productStatusArr+'/'+page+'/'+limit)
            .subscribe({
                next: (data) => {
                    // console.log(data);
                    // this.userService.genToken(data.token, data.expiresIn);

                    // getProblemProductCFNUpdatedListener()
                    this.getProblemProductCFNUpdated.next({
                        currentProductAllDetailCFN: data.currentProductAllDetailCFN,
                        productionCount: data.productionCount,
                    });
                }, error: error => {
                    // console.log(error.error);
                    // this.signupStatusListener.next(false);
                    // this.errorStatusListener.next(error.error.message);
                }});
    }

    // // ## get product problem
    // router.get("/node14/orderProduction/problem/:companyID/:factoryID/:nodeID/:productStatus/:page/:limit",
    // nsController.getProblemProductCFN);
    async getProblemProductCFN(companyID: string, factoryID: string, nodeID: string, productStatus: string[], page: number, limit: number) {
        const productStatusArr = JSON.stringify(productStatus);
        this.http
            .get<{token: string; expiresIn: number;  currentProductAllDetailCFN: any[]; productionCount: ProductionRepairCount[];}>
            (BACKEND_URL+'/node14/orderProduction/problem/'+ companyID+'/'+factoryID+'/'+nodeID+'/'+productStatusArr+'/'+page+'/'+limit)
            .subscribe({
                next: (data) => {
                    // console.log(data);
                    // this.userService.genToken(data.token, data.expiresIn);

                    // getProblemProductCFNUpdatedListener()
                    this.getProblemProductCFNUpdated.next({
                        currentProductAllDetailCFN: data.currentProductAllDetailCFN,
                        productionCount: data.productionCount,
                    });
                }, error: error => {
                    // console.log(error.error);
                    // this.signupStatusListener.next(false);
                    // this.errorStatusListener.next(error.error.message);
                }});
    }

    // // ## edit order production  set product back from repaired
    // router.put("/node16r/edit/oderProduction/repaired", nsController.putOrderProductionRepaired);
    putOrderProductionRepaired(
        companyID: string, factoryID: string, orderID: string, productID: string, nodeID: string,
        bundleID: string,
        productBarcodeNo: string, productionNode: ProductionNode,
        productStatus: string[], page: number, limit: number
    ) {
        // companyID
        // factoryID
        // orderID
        // productID
        // productBarcodeNo
        const productStatusArr = JSON.stringify(productStatus);
        const dataSent = {
            companyID,
            factoryID,
            orderID,
            productID,
            nodeID,
            bundleID,
            productBarcodeNo,
            productionNode,
            productStatusArr,
            page,
            limit,
            createBy:{
                userID: this.staff.userID,
                userName: this.staff.uInfo.userName
            },
        };
        this.http
            .put<{ tokenNS: string; expiresIn: number; success: boolean; productBarcodeNo: string; currentProductAllDetailCFN: any[];}>
                (BACKEND_URL+'/node16r/edit/oderProduction/repaired', dataSent)
            .subscribe({
                next: (data) => {
                    // console.log(data);
                    // this.userService.genToken(data.token, data.expiresIn);
                    // this.userService.setCommandAroundAppStatusListenerToNext('getNodeStationLoginRequest');

                    // getOrderProductionProblemUpdatedListener()
                    this.orderProductionProblemUpdated.next({
                        success: true,
                        productBarcodeNo: data.productBarcodeNo,
                        currentProductAllDetailCFN: data.currentProductAllDetailCFN,
                    });
                }, error: error => {
                    // console.log(error.error);
                    // this.scanNextDepOrderProductionBarcodeNoUpdated.next({
                    //     tempID: tempID,
                    //     companyID: orderProductionScan.companyID,
                    //     factoryID: orderProductionScan.factoryID,
                    //     nodeID: orderProductionScan.nodeID,
                    //     stationID: orderProductionScan.stationID,
                    //     orderProductionScan: this.userService.clrOrderProductionScan(),
                    //     success: error.error.success,
                    //     message: error.error.message,
                    //  });

                }});
    }

    // // ## edit order production  set product problem
    // router.put("/node12/edit/oderProduction/problem", nsController.putOrderProductionProblem);
    // productStatus, page, this.limit
    putOrderProductionProblem(
        companyID: string, factoryID: string, orderID: string, productID: string, bundleID: string,
        productBarcodeNo: string, productionNode: ProductionNode,
        productStatus: string[], page: number, limit: number
    ) {
        // companyID
        // factoryID
        // orderID
        // productID
        // productBarcodeNo
        const productStatusArr = JSON.stringify(productStatus);
        const dataSent = {
            companyID,
            factoryID,
            orderID,
            productID,
            bundleID,
            productBarcodeNo,
            productionNode,
            productStatusArr,
            page,
            limit,
            createBy:{
                userID: this.staff.userID,
                userName: this.staff.uInfo.userName
            },
        };
        this.http
            .put<{ tokenNS: string; expiresIn: number; success: boolean; productBarcodeNo: string; currentProductAllDetailCFN: any[];}>
                (BACKEND_URL+'/node12/edit/oderProduction/problem', dataSent)
            .subscribe({
                next: (data) => {
                    // console.log(data);
                    // this.userService.genToken(data.token, data.expiresIn);
                    // this.userService.setCommandAroundAppStatusListenerToNext('getNodeStationLoginRequest');

                    // getOrderProductionProblemUpdatedListener()
                    this.orderProductionProblemUpdated.next({
                        success: true,
                        productBarcodeNo: data.productBarcodeNo,
                        currentProductAllDetailCFN: data.currentProductAllDetailCFN,
                    });
                }, error: error => {
                    // console.log(error.error);
                    // this.scanNextDepOrderProductionBarcodeNoUpdated.next({
                    //     tempID: tempID,
                    //     companyID: orderProductionScan.companyID,
                    //     factoryID: orderProductionScan.factoryID,
                    //     nodeID: orderProductionScan.nodeID,
                    //     stationID: orderProductionScan.stationID,
                    //     orderProductionScan: this.userService.clrOrderProductionScan(),
                    //     success: error.error.success,
                    //     message: error.error.message,
                    //  });

                }});
    }

    // router.get("/node16/orderProduction/qrcodelist/:companyID/:factoryID/:nodeID/:style/:productStatus/:page/:limit",
    // nsController.getQRCodeListProductStyleCFN);
    async getQRCodeListProductStyleCFN(companyID: string, factoryID: string, nodeID: string,
        style: string, productStatus: string[], page: number, limit: number) {
        const productStatusArr = JSON.stringify(productStatus);
        this.http
            .get<{token: string; expiresIn: number;  currentProductStyleQRCodeCFN: any[]; currentProductStyleCount: any[];}>
            (BACKEND_URL+'/node16/orderProduction/qrcodelist/'+ companyID+'/'+factoryID+'/'+nodeID+'/'+style+'/'+productStatusArr+'/'+page+'/'+limit)
            .subscribe({
                next: (data) => {
                    // console.log(data);
                    // this.userService.genToken(data.token, data.expiresIn);

                    // getQRCodeListProductStyleCFNUpdatedListener()
                    this.getQRCodeListProductStyleCFNUpdated.next({
                        currentProductStyleQRCodeCFN: data.currentProductStyleQRCodeCFN,
                        currentProductStyleCount: data.currentProductStyleCount,
                    });
                }, error: error => {
                    // console.log(error.error);
                    // this.signupStatusListener.next(false);
                    // this.errorStatusListener.next(error.error.message);
                }});
    }

    // getQRCodeListProductStyleZoneSizeColorCFN
    // router.get("/node17/orderProductionZoneSizeColor/qrcodelist/:companyID/:factoryID/:nodeID/:style/:zone/:size/:color/:productStatus/:page/:limit",
    // nsController.getQRCodeListProductStyleZoneSizeColorCFN);
    async getQRCodeListProductStyleZoneSizeColorCFN(companyID: string, factoryID: string, nodeID: string,
        style: string, zone: string, size: string, color: string,
        productStatus: string[], page: number, limit: number) {
        const productStatusArr = JSON.stringify(productStatus);
        this.http
            .get<{token: string; expiresIn: number;  currentProductStyleQRCodeCFN: any[]; currentProductStyleCount: any[];}>
            (BACKEND_URL+'/node17/orderProductionZoneSizeColor/qrcodelist/'
                + companyID+'/'+factoryID+'/'+nodeID+'/'+style
                +'/'+zone+'/'+size+'/'+color
                +'/'+productStatusArr+'/'+page+'/'+limit)
            .subscribe({
                next: (data) => {
                    // console.log(data);
                    // this.userService.genToken(data.token, data.expiresIn);

                    // getQRCodeListProductStyleCFNUpdatedListener()
                    this.getQRCodeListProductStyleCFNUpdated.next({
                        currentProductStyleQRCodeCFN: data.currentProductStyleQRCodeCFN,
                        currentProductStyleCount: data.currentProductStyleCount,
                    });
                }, error: error => {
                    // console.log(error.error);
                    // this.signupStatusListener.next(false);
                    // this.errorStatusListener.next(error.error.message);
                }});
    }

    // // ## put add factory affiliate
    // // ## edit order production  send product to next department
    // router.put("/affiliate1/edit/oderProduction/nextnode", nsController.putAffiliateOrderProductionNextNodeID);
    putAffiliateOrderProductionNextNodeID(
        companyID: string, factoryID: string, orderID: string, productID: string,
        productBarcodeNos: string[], productionNode: ProductionNode[], bundleNo: number
    ) {
        // companyID
        // factoryID
        // orderID
        // productID
        // productBarcodeNo
        const dataSent = {
            companyID,
            factoryID,
            orderID,
            productID,
            productBarcodeNos,
            productionNode,
            bundleNo,
            createBy:{
                userID: this.staff.userID,
                userName: this.staff.uInfo.userName
            },
        };
        this.http
            .put<{ tokenNS: string; expiresIn: number; success: boolean; productBarcodeNos: string[]}>
                (BACKEND_URL+'/affiliate1/edit/oderProduction/nextnode', dataSent)
            .subscribe({
                next: (data) => {
                    // console.log(data);
                    // this.userService.genToken(data.token, data.expiresIn);
                    // this.userService.setCommandAroundAppStatusListenerToNext('getNodeStationLoginRequest');


                    // getOrderProductionNextNodeIDUpdatedListener()
                    this.orderProductionNextNodeIDUpdated.next({
                        success: true,
                        productBarcodeNos: data.productBarcodeNos
                    });
                }, error: error => {
                    // console.log(error.error);
                    this.orderProductionNextNodeIDUpdated.next({
                        success: false,
                        productBarcodeNos: []
                    });

                }});
    }

    // ## worker node station ########################################################
    // #######################################################################

    // #######################################################################
    // ##  smd qrcode list  ########################################################

    // router.get("/node/smd/qrlist1/tn/:companyID/:factoryID/:toNode/:style/:zone/:color/:size/:page/:limit",
    // nsController.getQRListCFTNszcs);
    // ## smd = show modal
    // ## CFTN = companyID factoryID (toNode) nodeID
    // ## CFFN = companyID factoryID (fromNode) nodeID
    // ## szcs  = style zone color size
    // ## tn = toNode
    // ## fn = fromNode
    async getQRListCFTNszcs(companyID: string, factoryID: string, nodeID: string,
        style: string, zone: string, color: string, size: string,
        page: number, limit: number) {
        // const productStatusArr = JSON.stringify(productStatus);
        this.http
            .get<{token: string; expiresIn: number;  qrCodeList: QRCodeList[]; qrCodeCount: QRCodeCount;}>
            (BACKEND_URL+'/node/smd/qrlist1/tn/'
                + companyID+'/'+factoryID+'/'+nodeID+'/'+style
                +'/'+zone+'/'+color+'/'+size
                +'/'+page+'/'+limit)
            .subscribe({
                next: (data) => {
                    // console.log(data);
                    // this.userService.genToken(data.token, data.expiresIn);

                    // getQRCodeListUpdatedListener()
                    this.getQRCodeListUpdated.next({
                        qrCodeList: data.qrCodeList,
                        qrCodeCount: data.qrCodeCount,
                    });
                }, error: error => {
                    // console.log(error.error);
                    // this.signupStatusListener.next(false);
                    // this.errorStatusListener.next(error.error.message);
                }});
    }

    // // ## get staff scanned list   getorderProductionStaffScannedNameListCNByORIDQRs
    // router.get("/node24/orderProduction/staffscanned/lists/:orderID/:bundleNo/:nodeID/:qrcodeArr",
    // nsController.getorderProductionStaffScannedNameListCNByORIDQRs);
    async getorderProductionStaffScannedNameListCNByORIDQRs(orderID: string, nodeID: string,
        qrcodeArr: string[], bundleNo: number) {
        const qrcodes = JSON.stringify(qrcodeArr);
        this.http
            .get<{token: string; expiresIn: number;  staffs: StaffList[]; success: boolean; message: any;}>
            (BACKEND_URL+'/node24/orderProduction/staffscanned/lists/'
                + orderID+'/'+nodeID+'/'+bundleNo+'/'+qrcodes)
            .subscribe({
                next: (data) => {
                    // console.log(data);
                    // this.userService.genToken(data.token, data.expiresIn);

                    // getStaffsListListener()
                    this.getStaffsListUpdated.next({
                        staffs: data.staffs,
                        success: data.success,
                        message: data.message,
                    });
                }, error: error => {
                    // console.log(error.error);
                    // this.signupStatusListener.next(false);
                    // this.errorStatusListener.next(error.error.message);
                }});
    }

    // ##  smd qrcode list  ########################################################
    // #######################################################################

    // #######################################################################
    // ##  report  ########################################################

    // ## get node getRepNodeNoScan
    // router.get("/node/noscan1/rep/CFN/:companyID/:factoryIDArr/:nodeID/:orderIDsArr/:infoTypeArr",
    // reportController.getRepNodeNoScan);
    async getRepNodeNoScan(
        companyID: string, factoryIDs: string[], orderIDs: string[], nodeID: string, infoTypes: string[]
    ) {
        // console.log(companyID, factoryIDs, orderIDs, nodeID, infoTypes);
        const factoryIDArr = JSON.stringify(factoryIDs);
        const orderIDsArr = JSON.stringify(orderIDs);
        const infoTypeArr = JSON.stringify(infoTypes);
        // console.log(companyID, orderStatusArr);
        this.http
        .get<{token: string; expiresIn: number;
                mainDataBundleNoScan: any[];
            }>
        (BACKEND_URL+'/node/noscan1/rep/CFN/'+ companyID+'/'+factoryIDArr+'/'+nodeID+'/'+orderIDsArr+'/'+infoTypeArr)
        .subscribe({
            next: (data) => {
                // console.log(data);
                // if (infoType === 'staffOffice') {
                //     this.userService.genToken(data.token, data.expiresIn);
                // }


                // this.allProductQty = '';
                // this.totalBundle = '';
                // this.countOrderID = '';
                // this.countProductID = '';

                // getRepNodeNoScanListener()
                this.repNodeNoScanUpdated.next({
                    mainDataBundleNoScan: data.mainDataBundleNoScan,
                    // nodeScanProductStyle: data.nodeScanProductStyle,
                    // nodeScanProductStyleZoneColorSize: data.nodeScanProductStyleZoneColorSize,
                    // currentCompanyOrder: data.currentCompanyOrder,
                    // currentOrderStyle: data.currentOrderStyle,
                });

            }, error: error => {
                // console.log(error.error);
                // this.signupStatusListener.next(false);
                // this.errorStatusListener.next(error.error.message);
            }});
    }

    // getRepNodeNoScanDatail
    // ## get node getRepNodeNoScanDatail
    // router.get("/node/noscan2/rep/CFN/:companyID/:factoryIDArr/:nodeID/:orderIDArr/:targetPlaceID/:color/:size/:infoTypeArr",
    // reportController.getRepNodeNoScanDatail);
    async getRepNodeNoScanDatail(
        companyID: string, factoryIDs: string[], orderIDs: string[], nodeID: string,
        targetPlaceID: string, color: string, size: string,
        infoTypes: string[], page: number, limit: number
    ) {
        const factoryIDArr = JSON.stringify(factoryIDs);
        const orderIDsArr = JSON.stringify(orderIDs);
        const infoTypeArr = JSON.stringify(infoTypes);
        // console.log(companyID, orderStatusArr);
        this.http
        .get<{token: string; expiresIn: number;
                mainDataBundleNoScanDetail: any[];
                mainDataBundleNoScanNo: any[];
            }>
        (BACKEND_URL+'/node/noscan2/rep/CFN/'+ companyID+'/'+factoryIDArr+'/'+nodeID+'/'+orderIDsArr
            +'/'+targetPlaceID+'/'+color+'/'+size
            +'/'+infoTypeArr+'/'+page+'/'+limit)
        .subscribe({
            next: (data) => {
                // console.log(data);
                // if (infoType === 'staffOffice') {
                //     this.userService.genToken(data.token, data.expiresIn);
                // }


                // this.allProductQty = '';
                // this.totalBundle = '';
                // this.countOrderID = '';
                // this.countProductID = '';

                // getRepNodeNoScanDetailListener()
                this.repNodeNoScanDetailUpdated.next({
                    mainDataBundleNoScanDetail: data.mainDataBundleNoScanDetail,
                    mainDataBundleNoScanNo: data.mainDataBundleNoScanNo,
                    // nodeScanProductStyleZoneColorSize: data.nodeScanProductStyleZoneColorSize,
                    // currentCompanyOrder: data.currentCompanyOrder,
                    // currentOrderStyle: data.currentOrderStyle,
                });

            }, error: error => {
                // console.log(error.error);
                // this.signupStatusListener.next(false);
                // this.errorStatusListener.next(error.error.message);
            }});
    }



    // // ## get node getRepNodeStaffScannedByDate12
    // router.get("/node/scan1/rep/CF/staff/:companyID/:factoryIDArr/:orderIDsArr/:date12/:infoType", checkAuth, checkUUID,
    // reportController.getRepNodeStaffScannedByDate12);
    // ##  infoType = call by who {staffOffice, 'staffProduction'}
    async getRepNodeStaffScannedByDate12(
        companyID: string, factoryIDs: string[], orderIDs: string[], date12: Date[], infoType: string
    ) {
        const factoryIDArr = JSON.stringify(factoryIDs);
        const orderIDsArr = JSON.stringify(orderIDs);
        const date12Arr = JSON.stringify(date12);
        // console.log(companyID, orderStatusArr);
        // console.log(BACKEND_URL+'/node/scan1/rep/CF/staff/'+ companyID+'/'+factoryIDArr+'/'+orderIDsArr+'/'+date12Arr+'/'+infoType);
        this.http
        .get<{token: string; expiresIn: number;
                nodeScanProductStyle: NodeScanProduct[];
                nodeScanProductStyleZone: NodeScanProduct[];
                nodeScanProductStyleZoneColorSize: NodeScanProduct[];
            }>
        (BACKEND_URL+'/node/scan1/rep/CF/staff/'+ companyID+'/'+factoryIDArr+'/'+orderIDsArr+'/'+date12Arr+'/'+infoType)
        .subscribe({
            next: (data) => {
                // console.log(data);
                // if (infoType === 'staffOffice') {
                //     this.userService.genToken(data.token, data.expiresIn);
                // }


                // this.allProductQty = '';
                // this.totalBundle = '';
                // this.countOrderID = '';
                // this.countProductID = '';

                // getRepStaffScannedByDate12UpdatedListener()
                this.repStaffScannedByDate12Updated.next({
                    nodeScanProductStyle: data.nodeScanProductStyle,
                    nodeScanProductStyleZone: data.nodeScanProductStyleZone,
                    nodeScanProductStyleZoneColorSize: data.nodeScanProductStyleZoneColorSize,
                    // currentCompanyOrder: data.currentCompanyOrder,
                    // currentOrderStyle: data.currentOrderStyle,
                });

            }, error: error => {
                // console.log(error.error);
                // this.signupStatusListener.next(false);
                // this.errorStatusListener.next(error.error.message);
            }});
    }

    // // ## get node getRepNodeStaffScannedByStyleZoneDate12
    // router.get("/node/scan2/rep/CF/staff/:companyID/:factoryIDArr/:orderIDsArr/:zoneArr/:nodeID/:date12/:infoType",
    // reportController.getRepNodeStaffScannedByStyleZoneDate12);
    async getRepNodeStaffScannedByStyleZoneDate12(
        companyID: string, factoryIDs: string[], orderIDs: string[],
        zones: string[], nodeID: string,
        date12: Date[], infoType: string
    ) {
        const factoryIDArr = JSON.stringify(factoryIDs);
        const orderIDsArr = JSON.stringify(orderIDs);
        const zoneArr = JSON.stringify(zones);
        const date12Arr = JSON.stringify(date12);
        // console.log(companyID, orderStatusArr);
        this.http
        .get<{token: string; expiresIn: number;
                nodeScanProductStyleZoneColorSize: NodeScanProduct[];
            }>
        (BACKEND_URL+'/node/scan2/rep/CF/staff/'+ companyID+'/'+factoryIDArr+'/'+orderIDsArr
            +'/'+zoneArr+'/'+nodeID
            +'/'+date12Arr+'/'+infoType)
        .subscribe({
            next: (data) => {
                // console.log(data);
                if (infoType === 'staffOffice') {
                    this.userService.genToken(data.token, data.expiresIn);
                }


                // this.allProductQty = '';
                // this.totalBundle = '';
                // this.countOrderID = '';
                // this.countProductID = '';

                // getRepStaffScannedByDate12StyleZoneUpdatedListener()
                this.repStaffScannedByDate12StyleZoneUpdated.next({
                    nodeScanProductStyleZoneColorSize: data.nodeScanProductStyleZoneColorSize,
                });

            }, error: error => {
                // console.log(error.error);
                // this.signupStatusListener.next(false);
                // this.errorStatusListener.next(error.error.message);
            }});
    }

    // ## get node getRepSubNodeScanDate12StaffOverall
    // router.get("/node/scansub3/rep/CF/overall/:companyID/:factoryIDArr/:nodeIDs/:date12/:infoType/:qrCode",
    // reportController.getRepSubNodeScanDate12StaffOverall);
    async getRepSubNodeScanDate12StaffOverall(
        companyID: string, factoryIDs: string[],
        nodeIDs: string[],
        date12: Date[], infoType: string, qrCode: string
    ) {
        // console.log(date12);
        const factoryIDArr = JSON.stringify(factoryIDs);
        const nodeIDArr = JSON.stringify(nodeIDs);
        // const orderIDsArr = JSON.stringify(orderIDs);
        // const zoneArr = JSON.stringify(zones);
        const date12Arr = JSON.stringify(date12);
        // console.log(companyID, orderStatusArr);
        this.http
        .get<{token: string; expiresIn: number;
            subNodeStaffScan: SubNodeStaffScan[];
            subNodeStaffScanStyleZoneColorSize: SubNodeStaffScan[];
            }>
        (BACKEND_URL+'/node/scansub3/rep/CF/overall/'+ companyID+'/'+factoryIDArr
            +'/'+nodeIDArr
            +'/'+date12Arr+'/'+infoType+'/'+qrCode)
        .subscribe({
            next: (data) => {
                // console.log(data);
                if (infoType === 'staffOffice') {
                    this.userService.genToken(data.token, data.expiresIn);
                }

                // getRepSubNodeStaffScanListener()
                this.repSubNodeStaffScanUpdated.next({
                    subNodeStaffScan: data.subNodeStaffScan,
                    subNodeStaffScanStyleZoneColorSize: data.subNodeStaffScanStyleZoneColorSize,
                    staffs: []
                });

            }, error: error => {
                // console.log(error.error);
                // this.signupStatusListener.next(false);
                // this.errorStatusListener.next(error.error.message);
            }});
    }


    // router.get("/node/scansub1/rep/CF/overall/:companyID/:factoryIDArr/:nodeID/:date12/:infoType",
    //         reportController.getRepSubNodeScanDate12Overall);
    async getRepSubNodeScanDate12Overall(
        companyID: string, factoryIDs: string[],
        nodeIDs: string[],
        date12: Date[], infoType: string
    ) {
        // console.log(date12);
        const factoryIDArr = JSON.stringify(factoryIDs);
        const nodeIDArr = JSON.stringify(nodeIDs);
        // const orderIDsArr = JSON.stringify(orderIDs);
        // const zoneArr = JSON.stringify(zones);
        const date12Arr = JSON.stringify(date12);
        // console.log(companyID, orderStatusArr);
        this.http
        .get<{token: string; expiresIn: number;
            subNodeStaffScan: SubNodeStaffScan[];
            subNodeStaffScanStyleZoneColorSize: SubNodeStaffScan[];
            }>
        (BACKEND_URL+'/node/scansub1/rep/CF/overall/'+ companyID+'/'+factoryIDArr
            +'/'+nodeIDArr
            +'/'+date12Arr+'/'+infoType)
        .subscribe({
            next: (data) => {
                // console.log(data);
                if (infoType === 'staffOffice') {
                    this.userService.genToken(data.token, data.expiresIn);
                }

                // getRepSubNodeStaffScanListener()
                this.repSubNodeStaffScanUpdated.next({
                    subNodeStaffScan: data.subNodeStaffScan,
                    subNodeStaffScanStyleZoneColorSize: data.subNodeStaffScanStyleZoneColorSize,
                    staffs: []
                });

            }, error: error => {
                // console.log(error.error);
                // this.signupStatusListener.next(false);
                // this.errorStatusListener.next(error.error.message);
            }});
    }

    // // ## get node getRepSubNodeStaffScanDate12Overall
    // router.get("/node/scansub2/staff/rep/CF/overall/:companyID/:factoryIDArr/:nodeIDs/:date12/:infoType",
    // reportController.getRepSubNodeStaffScanDate12Overall);
    async getRepSubNodeStaffScanDate12Overall(
        companyID: string, factoryIDs: string[],
        nodeIDs: string[],
        date12: Date[], infoType: string
    ) {
        // console.log(date12);
        const factoryIDArr = JSON.stringify(factoryIDs);
        const nodeIDArr = JSON.stringify(nodeIDs);
        // const orderIDsArr = JSON.stringify(orderIDs);
        // const zoneArr = JSON.stringify(zones);
        const date12Arr = JSON.stringify(date12);
        // console.log(companyID, orderStatusArr);
        this.http
        .get<{token: string; expiresIn: number;
            subNodeStaffScan: SubNodeStaffScan[];
            staffs: StaffList[];
            }>
        (BACKEND_URL+'/node/scansub2/staff/rep/CF/overall/'+ companyID+'/'+factoryIDArr
            +'/'+nodeIDArr
            +'/'+date12Arr+'/'+infoType)
        .subscribe({
            next: (data) => {
                // console.log(data);
                if (infoType === 'staffOffice') {
                    this.userService.genToken(data.token, data.expiresIn);
                }

                // getRepSubNodeStaffScanListener()
                this.repSubNodeStaffScanUpdated.next({
                    subNodeStaffScan: data.subNodeStaffScan,
                    subNodeStaffScanStyleZoneColorSize: [],
                    staffs: data.staffs
                });

            }, error: error => {
                // console.log(error.error);
                // this.signupStatusListener.next(false);
                // this.errorStatusListener.next(error.error.message);
            }});
    }


    // // // ## get node getRepCurrentProductQtyCFN
    // // router.get("/noder/rep1/current/productqty/cfn/:companyID/:factoryID/:nodeID/:productStatus/:repListName", nsController.getRepCurrentProductQtyCFN);
    // async getRepCurrentProductQtyCFN(
    //         companyID: string, factoryID: string, nodeID: string,
    //         productStatus: string[], repListName: string[]
    //     ) {
    //     const productStatusArr = JSON.stringify(productStatus);
    //     const repListNameArr = JSON.stringify(repListName);  // ## which report we want to get
    //     // orders: Order[]; products: Product[];
    //     this.http
    //         .get<{token: string; expiresIn: number; repListNameArr: string[]; repDataFormat1: RepDataFormat1; }>
    //         (BACKEND_URL+'/noder/rep1/current/productqty/cfn/'+ companyID+'/'+factoryID+'/'+nodeID
    //                     +'/'+productStatusArr+'/'+repListNameArr)
    //         .subscribe({
    //             next: (data) => {
    //                 console.log(data);
    //                 // this.userService.genToken(data.token, data.expiresIn);

    //                 // this.allProductQty = '';
    //                 // this.totalBundle = '';
    //                 // this.countOrderID = '';
    //                 // this.countProductID = '';

    //                 // getRepCurrentProductQtyCFNUpdatedListener()
    //                 this.repCurrentProductQtyCFNUpdated.next({
    //                     repListNameArr: data.repListNameArr,
    //                     repDataFormat1: data.repDataFormat1,
    //                 });

    //             }, error: error => {
    //                 // console.log(error.error);
    //                 // this.signupStatusListener.next(false);
    //                 // this.errorStatusListener.next(error.error.message);
    //             }});
    // }


    // ##  report  ########################################################
    // #######################################################################

    // #######################################################################
    // ##   ########################################################



    // ##   ########################################################
    // #######################################################################

    // #######################################################################
    // ## observer ########################################################

    // // getRepNodeNoScanDetailListener()
    // this.repNodeNoScanDetailUpdated
    getRepNodeNoScanDetailListener() {
        return this.repNodeNoScanDetailUpdated.asObservable();
    }

    // // getRepNodeNoScanListener()
    // this.repNodeNoScanUpdated
    getRepNodeNoScanListener() {
        return this.repNodeNoScanUpdated.asObservable();
    }

    // // getStaffsListListener()
    // this.getStaffsListUpdated.next
    getStaffsListListener() {
        return this.getStaffsListUpdated.asObservable();
    }

    // // getRepSubNodeStaffScanListener()
    // this.repSubNodeStaffScanUpdated.next
    getRepSubNodeStaffScanListener() {
        return this.repSubNodeStaffScanUpdated.asObservable();
    }

    // // getEditQROrderProductionSubNodeFlowListener()
    // this.editQROrderProductionSubNodeFlowUpdated.next
    getEditQROrderProductionSubNodeFlowListener() {
        return this.editQROrderProductionSubNodeFlowUpdated.asObservable();
    }

    // // getEditAddOrderProductionSubNodeFlowListener()
    // this.editAddOrderProductionSubNodeFlowUpdated.next
    getEditAddOrderProductionSubNodeFlowListener() {
        return this.editAddOrderProductionSubNodeFlowUpdated.asObservable();
    }

    // // getOrderProductionQueueByProductBarcodeNoListener()
    // this.getOrderProductionQueueByProductBarcodeNoUpdated
    getOrderProductionQueueByProductBarcodeNoListener() {
        return this.getOrderProductionQueueByProductBarcodeNoUpdated.asObservable();
    }

    // // getOrderProductionListListener()
    // this.getOrderProductionListUpdated.next
    getOrderProductionListListener() {
        return this.getOrderProductionListUpdated.asObservable();
    }

    // // getOrderProductionQueueBundleNoListener()
    // this.getOrderProductionQueueBundleNoUpdated;
    getOrderProductionQueueBundleNoListener() {
        return this.getOrderProductionQueueBundleNoUpdated.asObservable();
    }

    // // getSubNodeFlowCostListener()
    // this.getSubNodeFlowCostUpdated.next
    getSubNodeFlowCostListener() {
        return this.getSubNodeFlowCostUpdated.asObservable();
    }


    // // // getStaffInfoUpdatedListener()
    // // this.getStaffInfoUpdated.next({ staff: data.staff });
    getStaffInfoUpdatedListener() {
        return this.getStaffInfoUpdated.asObservable();
    }

    // // getQRCodeListUpdatedListener()
    // this.getQRCodeListUpdated
    getQRCodeListUpdatedListener() {
        return this.getQRCodeListUpdated.asObservable();
    }

    // // getRepStaffScannedByDate12UpdatedListener()
    // this.repStaffScannedByDate12Updated.next
    getRepStaffScannedByDate12UpdatedListener() {
        return this.repStaffScannedByDate12Updated.asObservable();
    }

    // getRepStaffScannedByDate12StyleZoneUpdatedListener()
    getRepStaffScannedByDate12StyleZoneUpdatedListener() {
        return this.repStaffScannedByDate12StyleZoneUpdated.asObservable();
    }

    // // getCustomersUpdatedListener()
    // this.ordersListsUpdated.next({ orders: data.orders, ordersCount: data.ordersCount});
    getCustomersUpdatedListener() {
        return this.ordersListsUpdated.asObservable();
    }

    // // getOrderProductionSentoutCancelledUpdatedListener()
    // this.orderProductionSentoutCancelledUpdated.next
    getOrderProductionSentoutCancelledUpdatedListener() {
        return this.orderProductionSentoutCancelledUpdated.asObservable();
    }

    // // getOrderProductionReceivedCancelledUpdatedListener()
    // this.orderProductionReceivedCancelledUpdated.next
    getOrderProductionReceivedCancelledUpdatedListener() {
        return this.orderProductionReceivedCancelledUpdated.asObservable();
    }

    // getQRCodeListProductStyleCFNUpdatedListener()
    getQRCodeListProductStyleCFNUpdatedListener() {
        return this.getQRCodeListProductStyleCFNUpdated.asObservable();
    }

    // getProblemProductCFNUpdatedListener()
    getProblemProductCFNUpdatedListener() {
        return this.getProblemProductCFNUpdated.asObservable();
    }

    // getOrderProductionProblemUpdatedListener()
    getOrderProductionProblemUpdatedListener() {
        return this.orderProductionProblemUpdated.asObservable();
    }

    // getOrderProductionNextNodeIDUpdatedListener()
    getOrderProductionNextNodeIDUpdatedListener() {
        return this.orderProductionNextNodeIDUpdated.asObservable();
    }

    setDatarecordProductBarcodeNoUpdated(productBarcodeNo: string, orderProduct:OrderProduction, orderProducts:OrderProduction[]) {
        this.datarecordProductBarcodeNoUpdated.next({
            productBarcodeNo: productBarcodeNo,
            orderProduct: orderProduct,
            orderProducts: orderProducts
         });
    }

    // private datarecordProductBarcodeNoUpdated = new Subject<{ orderProduct: OrderProduction}>();
    getDatarecordProductBarcodeNoUpdatedListener() {
        return this.datarecordProductBarcodeNoUpdated.asObservable();
    }

    // // private repCurrentProductQtyCFNUpdated = new Subject<{ repListNameArr: string[], repDataFormat1: RepDataFormat1}>();
    // getRepCurrentProductQtyCFNUpdatedListener() {
    //     return this.repCurrentProductQtyCFNUpdated.asObservable();
    // }

    // private scanNextDepOrderProductionBarcodeNoUpdated = new Subject<{
    //     companyID: string, factoryID: string,
    //     nodeID: string, stationID: string,
    //     orderProductionScan: OrderProductionScan, success: boolean,
    //     message: any
    // }>();
    getScanNextDepOrderProductionBarcodeNoUpdatedListener() {
        return this.scanNextDepOrderProductionBarcodeNoUpdated.asObservable();
    }

    // private scanOrderProductionBarcodeNoUpdated = new Subject<{
    //     companyID: string, factoryID: string,
    //     nodeID: string, stationID: string,
    //     orderProduction: OrderProduction, success: boolean
    // }>();
    getScanOrderProductionBarcodeNoUpdatedListener() {
        return this.scanOrderProductionBarcodeNoUpdated.asObservable();
    }

    // getScanOrderProductionBarcodeNoOutsourceUpdatedListener
    getScanOrderProductionBarcodeNoOutsourceUpdatedListener() {
        return this.scanOrderProductionBarcodeNoOutsourceUpdated.asObservable();
    }

    // private dataNodeStationUpdated = new Subject<{
    //     nodeStation: NodeStation, nodeFlows: NodeFlow[], nodeFlow: NodeFlow, company: Company,  factory: Factory
    // }>();
    getDataNodeStationUpdatedListener() {
        return this.dataNodeStationUpdated.asObservable();
    }

    // private staffLoginUpdated = new Subject<{ staff: User, success: boolean}>();
    getStaffLoginUpdatedListener() {
        return this.staffLoginUpdated.asObservable();
    }

    // private nodeStationLoginByUUIDUpdated = new Subject<{ nodeStation: NodeStation, canLogin: boolean}>();
    getNodeStationLoginByUUIDUpdatedListener() {
        return this.nodeStationLoginByUUIDUpdated.asObservable();
    }

    // private nodeStationLoginRequestsUpdated = new Subject<{ nodeStationLoginRequests: NodeStationLoginRequest[]}>();
    getNodeStationLoginRequestsUpdatedListener() {
        return this.nodeStationLoginRequestsUpdated.asObservable();
    }

    // private checkNodeUserIDExistedUpdated = new Subject<{ isExist: boolean}>();
    getCheckNodeUserIDExistedUpdatedListener() {
        return this.checkNodeUserIDExistedUpdated.asObservable();
    }

    setTabChangeUpdated() {
        this.tabChangeUpdated.next({ tabChange: true });
    }

    getTabChangeUpdatedListener() {
        return this.tabChangeUpdated.asObservable();
    }


    // private selectNodeStationUpdated = new Subject<{ nodeStation: NodeStation}>();
    setSelectNodeStationUpdated(nodeStation: NodeStation) {
        this.selectNodeStationUpdated.next({ nodeStation: nodeStation });
    }

    getSelectNodeStationUpdatedListener() {
        return this.selectNodeStationUpdated.asObservable();
    }

    // private editUUIDNodeStationListsUpdated = new Subject<{ nodeStation: NodeStation, success: boolean, message: any}>();
    getEditUUIDNodeStationUpdatedListener() {
        return this.editUUIDNodeStationListsUpdated.asObservable();
    }

    // private editUserPassNodeStationListsUpdated = new Subject<{ nodeStation: NodeStation, success: boolean, message: any}>();
    getEditUserPassNodeStationUpdatedListener() {
        return this.editUserPassNodeStationListsUpdated.asObservable();
    }

    // private nodeStation1ListsUpdated = new Subject<{ nodeStations: NodeStation, success: boolean, message: any}>();
    getNodeStation1UpdatedListener() {
        return this.nodeStation1ListsUpdated.asObservable();
    }

    // private nodeStationsListsUpdated = new Subject<{ nodeStations: NodeStation[]}>();
    getNodeStationsUpdatedListener() {
        return this.nodeStationsListsUpdated.asObservable();
    }

    // private nodeFlowsListsUpdated = new Subject<{ nodeFlows: NodeFlow[]}>();
    getNodeFlowsUpdatedListener() {
        return this.nodeFlowsListsUpdated.asObservable();
    }

    getNodeFlowUpdatedListener() {
        return this.nodeFlowListsUpdated.asObservable();
    }

    // ## observer ########################################################
    // #######################################################################


    // #######################################################################
    // ## rep tool function ########################################################

    findProduct(productID: string) {
        const product = this.products.filter(i=>i.productID == productID);

        return product[0];
    }

    colorTransformToArray(color: string) {
        let colorArr = [];
        const color1 = color.substr(0, 2);
        const color2 = color.substr(2, 2);
        const color3 = color.substr(4, 2);
        const color4 = color.substr(6, 2);
        const color5 = color.substr(8, 2);
        if (color1 !== '--') { colorArr.push(color1); }
        if (color2 !== '--') { colorArr.push(color2); }
        if (color3 !== '--') { colorArr.push(color3); }
        if (color4 !== '--') { colorArr.push(color4); }
        if (color5 !== '--') { colorArr.push(color5); }
        return colorArr;
    }

    colorTransformToBeauty(color: string) {
        const colorB = color.substr(0, 2) + ' ' + color.substr(2, 2) + ' ' + color.substr(4, 2)
                        + ' ' + color.substr(6, 2) + ' ' + color.substr(8, 2);
        return colorB;
    }


    // ## rep tool function ########################################################
    // #######################################################################


    // #######################################################################
    // ## clr ########################################################

    clrUser() {
        const user: User = {
            userID: '',
            qrCode: '',
            type: '',
            uInfo: {
                userName: '',
                userPass: '',
                addr: '',
                pic: '',
                tel: '',
                email: '',
                registDate: new Date(),
                lastLogin: new Date(),
                menuAuthor: []
            },
            uCompany: [],
            uFactory: [],
            status: '',
            state: '',
            createdAt: new Date(),
            createBy: {
                userID: '',
                userName: ''
            }
        };
        return user;
    }

    clrNodeStation() {
        const nodeStation: NodeStation = {
            companyID: '',
            factoryID: '',
            nodeID: '',
            nodeName: '',
            status: 'c',
            nodeInfo: {
                nodeType: 'main',
                mustBundleScan: false,
                haveSubWorkflow: false,
                scan1ForAll: false,
                location: '',
                nodeDescription: '',
                pic: [],
                registDate: new Date(),
                createBy: {
                    userID: '',
                    userName: ''
                }
            },
            userNode: [],
            nStation: {
                stationNo: 0,
                loginList: []
            },
            nodeProblem: [],
        };
        return nodeStation;
    }

    clrNodeFlow() {
        const nodeFlow: NodeFlow = {
            companyID: '',
            factoryID: '',
            nodeFlowID: '',
            flowType: 'main',
            registDate: new Date(),
            editDate: new Date(),
            flowCondition: {
                isFlowSequence: true,
            },
            flowSeq: [],
        };
        return nodeFlow;
    }

    // ## clr ########################################################
    // #######################################################################
}


