/* eslint-disable @typescript-eslint/member-ordering */
/* eslint-disable no-underscore-dangle */

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { Router } from '@angular/router';
import { DeviceDetectorService } from 'ngx-device-detector';
import { NIL, v4 as uuidv4, v5 as uuidv5,  validate as uuidValidate, version as uuidVersion } from 'uuid';
import * as CryptoJS from 'crypto-js';

// import { LoadingController } from '@ionic/angular';




import { StorageService } from './storage.service';
import { UserService } from './user.service';
import { SocketIOService } from './socketio.service';
import { environment } from '../../environments/environment';

import { User, UserClass, AuthData, SigupData } from '../models/user.model';
import { Company, CreateBy, DataAroundApp, Factory, GeneralInfo, ModeRes, ScreenInfo, TokenSet } from '../models/app.model';
import { UCompany, UFactory } from '../models/user.model';
import { Product } from '../models/product.model';
import { BundleSetGroup, LostGroup, OPDLost, OrLost, Order, OrderBundleList, OrderProductBundleNosOutsourceTracking, OrderProduction, OrderProductionQueue, OrderProductionQueueList, OrderSeasonYears, OrderStyles, OutsourceData, ProductBarcodeNoReserve, ProductionNode, ProductionQueuedQtySum, ProductionZonePeriodRow, QtyMaxView, QueueInfo, QueueInfoList, SubNodeFlowType, TargetPlace } from '../models/order.model';
import { CurrentCompanyOrder, CurrentCompanyOrderZoneStyleSize, CurrentOrderStyle, CurrentProductQtyAllC, OrderStyleColorSize, TotalProductionQueueByBundleNo } from '../models/report.model';
import { YarnLot } from '../models/yarn.model';
import { GBC } from '../global/const-global';
import { FlowSeq, NodeStation } from '../models/workstation.model';
import { ProductService } from './product.service';
import { BundleStatePDFRow, NodeGroupScanID2 } from '../models/reportpdf.model';
// import { MenuService } from './menu.service';
// import { debounceTime } from 'rxjs/operators';

const BACKEND_URL = environment.apiUrl + '/order';
// const BACKEND_AESP = environment.aesP;

// ## user, language , getIP-real

@Injectable({
  providedIn: 'root'
})
export class OrderService {

    private order: Order = this.clrOrder();
    private orders: Order[] = [];
    private orderSeasonYears: OrderSeasonYears[] = [];
    seasonYear = 'last';
    ordersLimit = 200;

    opdLosts: OPDLost[] = [];
    lostGroups: LostGroup[] = [];

    orderPageListItem = 10;
    orderQueuePageListItem = 10;
    lastProductionQueueBarcodeItem = 10;
    jobCardRows = 15;  // ## sub node job list in job card

    // ## select create queue
    qStyle = '';
    qZone = '';
    qColor = '';
    qSize = '';
    qQty = 0;

    // // ## google storage path
    // public productGCSPath = 'https://storage.googleapis.com/garmentproductgarmentworld1sthighquality/';
    // public productImageProfileGCSPath = 'https://storage.googleapis.com/garmentproductgarmentworld1sthighquality/imageProfile/';




    private subNodeFlowTypeListUpdated = new Subject<{ subNodeFlowTypes: SubNodeFlowType[]}>();
    private productionLostUpdated = new Subject<{ orderProduct: OrderProduction[]}>();
    private orderListsUpdated = new Subject<{ order: Order}>();
    private putorderLostUpdated = new Subject<{ success: boolean}>();
    private ordersListsUpdated = new Subject<{
        orders: Order[],
        ordersCount: number,
        orderSeasonYears: OrderSeasonYears[],
    }>();

    private ordersZoneStyleSizeByOrderIDsListsUpdated = new Subject<{
        orders: Order[],
        currentCompanyOrderZoneStyleSize: CurrentCompanyOrderZoneStyleSize[],
        ordersCount: number
    }>();
    private ordersByOrderIDsListsUpdated = new Subject<{ orders: Order[], ordersCount: number}>();
    private orderStylesListsUpdated = new Subject<{ orderStyles: OrderStyles[]}>();

    private lastProductionQueueBarcodeListsUpdated = new Subject<{
        orderProductionQueue: OrderProductionQueue,
        countProductionQueueByBarcode: number,
        sumProductionQueueByBarcode: number
    }>();
    private totalProductionQueueListsUpdated = new Subject<{
        orderProductionQueue: QueueInfoList[]
        totalProductionQueueByBundleNo: TotalProductionQueueByBundleNo,
        orderBundleList: OrderBundleList[]
    }>();


    private lastProductionQueueAllListsUpdated = new Subject<{
        orderProductionQueue: OrderProductionQueue,
        countProductionQueueAll: number,
        sumProductionQueueAll: number
    }>();
    private ordersQueueListUpdated = new Subject<{ queueList: OrderProductionQueueList[], queueListCount: number}>();
    private ordersQueueListCancelUpdated = new Subject<{
        queueList: OrderProductionQueueList[],
        queueListCount: number,
        success: boolean, message: any
    }>();

    private postOrderProductionQueueCreateNewUpdated = new Subject<{ success: boolean, message: any}>();
    private postOrderProductionQueuesCreateNewUpdated = new Subject<{ success: boolean, message: any}>();
    private getLastRunningNoOrderProductionUpdated = new Subject<{ runningNo: number, lastBundleNo: number, ver: number}>();
    private getProductionQueueBarcodeSumQtyUpdated = new Subject<{ productionQueuedQtySum: ProductionQueuedQtySum[]}>();
    private repCompanyOrderUpdated = new Subject<{
        orderStyleColorSize: OrderStyleColorSize[],
        currentCompanyOrder: CurrentCompanyOrder[],
        currentOrderStyle: CurrentOrderStyle[],
        currentProductQtyAllC: CurrentProductQtyAllC[]
    }>();
    private repCompanyOrderProductBundleNosUpdated = new Subject<{ orderProductionBundleNos: OrderProduction[]}>();
    private orderQtyRewriteUpdated = new Subject<{
        status: boolean,
        order: Order,
        orderStyleColorSize: OrderStyleColorSize[],
        currentCompanyOrder: CurrentCompanyOrder[];
        currentOrderStyle: CurrentOrderStyle[]
    }>();
    private getOrderProductBundleNosOutsourceTrackingUpdated = new Subject<{
        bundleNos: number[],
        nodeIDs: string[],
        forbiddenNodeIDs: string[],
        nodeStations: NodeStation[],
        flowSeq: FlowSeq[],
        orderProductBundleNosOutsourceTracking: OrderProductBundleNosOutsourceTracking[],
        orderProductOutsourceTrackingFlowseqNormal: OrderProductBundleNosOutsourceTracking[],
        orderProductOutsourceTrackingFlowseqTracking: OrderProductBundleNosOutsourceTracking[],
    }>();
    private getBundleSetGroupUpdated = new Subject<{ bundleSetGroups: BundleSetGroup[]}>();
    private editOutsTrackingUpdated = new Subject<{
        orderProductOutsourceTrackingFlowseqNormal: OrderProductBundleNosOutsourceTracking[]
    }>();
    private orderQCtoCompleteUpdated = new Subject<{
        status: boolean
    }>();








    constructor(
        private http: HttpClient,
        private router: Router,
        private deviceService: DeviceDetectorService,

        // private loadingCtrl: LoadingController,

        private storageService: StorageService,
        private socketService: SocketIOService,
        private userService: UserService,
        // private menuService: MenuService,
        private productService: ProductService,
    ) { }

    // #######################################################################
    // ## general info ########################################################

    clearDataWhenLogOut() {
        this.order = GBC.clrOrder();
        this.orders = [];
    }


    // ## general info ########################################################
    // #######################################################################

    // #######################################################################
    // ## order ########################################################

    // this.setOrderSeasonYear(data.orderSeasonYears);
    setOrderSeasonYear(orderSeasonYears: OrderSeasonYears[], seasonYear: string) {
        this.orderSeasonYears = orderSeasonYears;
        this.seasonYear = seasonYear;
        this.userService.setOrderSeasonYear(this.orderSeasonYears, seasonYear);
    }

    setOrder(order: Order) {
        this.order = order;
        this.userService.setOrder(this.order);
    }

    setOrders(orders: Order[]) {
        this.orders = orders;
        this.userService.setOrders(this.orders);
    }

    getOrder() {
        return this.order;
    }

    getOrdersArr() {
        return this.orders;
    }

    setOPDLosts(opdLosts: OPDLost[]) {
        this.opdLosts = opdLosts;
        this.userService.setOPDLosts(this.opdLosts);
    }

    setLostGroups(lostGroups: LostGroup[]) {
        this.lostGroups = lostGroups;
        this.userService.setLostGroups(this.lostGroups);
    }

    // // ## get order1   "/order/getlist1/:companyID/:userID/:orderID"
    // router.get("/order/getlist1/:companyID/:userID/:orderID", checkAuth, checkUUID, orderController.getOrder);
    async getOrder1(companyID: string, orderID: string) {
        const userID = this.userService?.getUserID();
        // console.log(BACKEND_URL+'/getlist1/' + companyID+'/'+userID+'/'+orderID);
        this.http
        .get<{token: string; expiresIn: number; userID: string; order: Order;}>
            (BACKEND_URL+'/order/getlist1/' + companyID+'/'+userID+'/'+orderID)
            .subscribe({
                next: (data) => {
                    // console.log(data);
                    this.userService.genToken(data.token, data.expiresIn);
                    this.setOrder(data.order);

                    // getOrder1UpdatedListener()  getCustomerUpdatedListener()
                    this.orderListsUpdated.next({ order: data.order });
                }, error: error => {
                    // console.log(error.error);
                    // this.signupStatusListener.next(false);
                    // this.errorStatusListener.next(error.error.message);
                }});
    }

    // // ## get order list /api/order/getlist3/:companyID/:userID/:orderids  getOrdersByOrderIDs
    // router.get("/getlist3/:companyID/:userID/:orderids/:orderStatus",
    // checkAuth, checkUUID, orderController.getOrdersZoneStyleSizeByOrderIDs);
    async getOrdersZoneStyleSizeByOrderIDs(companyID: string, orderIDs: string[], orderStatus: string[]) {
        const orderIDsArr = JSON.stringify(orderIDs);
        const orderStatusArr = JSON.stringify(orderStatus);
        this.http
            .get<{token: string; expiresIn: number; userID: string;
                    orders: Order[]; currentCompanyOrderZoneStyleSize: CurrentCompanyOrderZoneStyleSize[]}>
            (BACKEND_URL+'/getlist3/' + companyID+'/'+this.userService.getUserID()+'/'+orderIDsArr+'/'+orderStatusArr)
            .subscribe({
                next: (data) => {
                    // console.log(data);
                    // console.log(data.orders);
                    this.userService.genToken(data.token, data.expiresIn);
                    // this.setOrders(data.orders);

                    // getOrdersZoneStyleSizeByOrderIDsListener()
                    this.ordersZoneStyleSizeByOrderIDsListsUpdated.next({
                        orders: data.orders,
                        currentCompanyOrderZoneStyleSize: data.currentCompanyOrderZoneStyleSize,
                        ordersCount: data.orders.length
                    });
                }, error: error => {
                    // console.log(error.error);
                    // this.signupStatusListener.next(false);
                    // this.errorStatusListener.next(error.error.message);
                }});
    }

    async getOrdersZoneStyleSizeByOrderIDs_1(companyID: string, orderIDs: string[], orderStatus: string[]) {
        const orderIDsArr = JSON.stringify(orderIDs);
        const orderStatusArr = JSON.stringify(orderStatus);
        const mode = 'node'; // ## for report on nodeID station
        this.http
            .get<{token: string; expiresIn: number; userID: string;
                    orders: Order[]; currentCompanyOrderZoneStyleSize: CurrentCompanyOrderZoneStyleSize[]}>
            (BACKEND_URL+'/getlist3-1/' + companyID+'/'+this.userService.getUserID()+'/'+orderIDsArr+'/'+orderStatusArr
            +'/'+mode)
            .subscribe({
                next: (data) => {
                    // console.log(data);
                    // console.log(data.orders);
                    // this.userService.genToken(data.token, data.expiresIn);
                    // this.setOrders(data.orders);

                    // getOrdersZoneStyleSizeByOrderIDsListener()
                    this.ordersZoneStyleSizeByOrderIDsListsUpdated.next({
                        orders: data.orders,
                        currentCompanyOrderZoneStyleSize: data.currentCompanyOrderZoneStyleSize,
                        ordersCount: data.orders.length
                    });
                }, error: error => {
                    // console.log(error.error);
                    // this.signupStatusListener.next(false);
                    // this.errorStatusListener.next(error.error.message);
                }});
    }

    // // ## get order list /api/order/getlist2/:companyID/:userID/:orderids  getOrdersByOrderIDs
    // router.get("/getlist2/:companyID/:userID/:orderids", checkAuth, checkUUID, orderController.getOrdersByOrderIDs);
    async getOrdersByOrderIDs(companyID: string, orderIDs: string[]) {
        // console.log(BACKEND_URL+'/getlist/' + companyID+'/'+ this.userService.getUserID()+'/'+page+'/'+limit);
        const orderIDsArr = JSON.stringify(orderIDs);
        this.http
            .get<{token: string; expiresIn: number; userID: string; orders: Order[]; ordersCount: number}>
            (BACKEND_URL+'/getlist2/' + companyID+'/'+this.userService.getUserID()+'/'+orderIDsArr)
            .subscribe({
                next: (data) => {
                    // console.log(data);
                    // console.log(data.orders);
                    // this.userService.genToken(data.token, data.expiresIn);
                    // this.setOrders(data.orders);

                    // getOrdersByOrderIDsListener()
                    this.ordersByOrderIDsListsUpdated.next({ orders: data.orders, ordersCount: data.orders.length});
                }, error: error => {
                    // console.log(error.error);
                    // this.signupStatusListener.next(false);
                    // this.errorStatusListener.next(error.error.message);
                }});
    }



    // router.get("/order5/getlist/:companyID/:orderStatus/:userID", checkAuth, checkUUID, orderController.getOrderStyles);
    async getOrderStyles(companyID: string, orderStatus: string[]) {
        // console.log(BACKEND_URL+'/getlist/' + companyID+'/'+ this.userService.getUserID()+'/'+page+'/'+limit);
        const orderStatusArr = JSON.stringify(orderStatus);
        this.http
            .get<{token: string; expiresIn: number; userID: string; orderStyles: OrderStyles[];}>
            (BACKEND_URL+'/order5/getlist/' + companyID+'/'+orderStatusArr+'/'+this.userService.getUserID())
            .subscribe({
                next: (data) => {
                    // console.log(data);
                    // console.log(data.orders);
                    this.userService.genToken(data.token, data.expiresIn);
                    // this.setOrders(data.orders);

                    // getOrderStylesListsListener()
                    this.orderStylesListsUpdated.next({ orderStyles: data.orderStyles });
                }, error: error => {
                    // console.log(error.error);
                    // this.signupStatusListener.next(false);
                    // this.errorStatusListener.next(error.error.message);
                }});
    }


    // // ## get order list /api/order/getlist/:companyID/:userID/:page/:limit
    // router.get("/getlist/:companyID/:userID/:page/:limit", checkAuth, checkUUID, orderController.getOrders);
    async getOrders(companyID: string, page: number, limit: number, seasonYear: string) {
        // console.log(BACKEND_URL+'/getlist/' + companyID+'/'+ this.userService.getUserID()+'/'+page+'/'+limit);
        this.http
            .get<{token: string; expiresIn: number; userID: string; orders: Order[]; ordersCount: number,
                orderSeasonYears: OrderSeasonYears[], seasonYear: string,
                opdLosts: OPDLost[], lostGroups: LostGroup[]}>
            (BACKEND_URL+'/getlist/' + companyID+'/'+this.userService.getUserID()+'/'+page+'/'+limit+'/'+seasonYear)
            .subscribe({
                next: (data) => {
                    // console.log(data);
                    // console.log(data.orders);
                    // console.log(data.seasonYear);
                    // console.log(data.orderSeasonYears);
                    this.seasonYear = data.seasonYear;
                    this.userService.seasonYear = data.seasonYear;
                    this.userService.genToken(data.token, data.expiresIn);
                    this.setOrders(data.orders);
                    this.setOPDLosts(data.opdLosts);
                    this.setLostGroups(data.lostGroups);
                    this.setOrderSeasonYear(data.orderSeasonYears, data.seasonYear);

                    // postGetProductImageProfiles(companyID: string, productIDs: string[])
                    const orderids = this.userService.getOrderIDss();
                    this.productService.postGetProductImageProfiles(companyID, orderids);
                    this.userService.setDataAroundAppStatusListenerToNext();

                    // getCustomersUpdatedListener()
                    this.ordersListsUpdated.next({
                        orders: data.orders,
                        ordersCount: data.ordersCount,
                        orderSeasonYears: data.orderSeasonYears,
                    });
                }, error: error => {
                    // console.log(error.error);
                    // this.signupStatusListener.next(false);
                    // this.errorStatusListener.next(error.error.message);
                }});
    }

    // // ## /api/order/creataenew
    // router.post("/createnew", checkAuth, checkUUID, orderController.postOrderCreateNew);
    postOrderCreateNew(userID: string, order: Order) {
        const dataSent = {
            userID,
            order
        };
        this.http
            .post<{ token: string; expiresIn: number; userID: string; order: Order }>
                (BACKEND_URL+'/createnew', dataSent)
            .subscribe({
                next: (data) => {
                    // console.log(data);
                    this.userService.genToken(data.token, data.expiresIn);
                    this.setOrder(data.order);
                    this.orderListsUpdated.next({ order: data.order });
                }, error: error => {
                    // console.log(error.error);
                    // this.signupStatusListener.next(false);
                    // this.errorStatusListener.next(error.error.message);
                }});
    }

    // // ## /api/order/update
    // router.put("/update", checkAuth, checkUUID, orderController.putOrderUpdate);
    putOrderUpdate(userID: string, order: Order) {
        const dataSent = {
            userID,
            order
        };
        // console.log(dataSent);
        this.http
            .put<{ token: string; expiresIn: number; userID: string; order: Order }>
                (BACKEND_URL+'/update', dataSent)
            .subscribe({
                next: (data) => {
                    // console.log(data);
                    this.userService.genToken(data.token, data.expiresIn);
                    this.setOrder(data.order);
                    this.orderListsUpdated.next({ order: data.order });
                }, error: error => {
                    // console.log(error.error);
                    // this.signupStatusListener.next(false);
                    // this.errorStatusListener.next(error.error.message);
                }});
    }

    // // ## /api/order/update2/setzone
    // router.put("/update2/setzone", checkAuth, checkUUID, orderController.putOrderZoneUpdate);
    putOrderZoneUpdate(userID: string, order: Order) {
        const dataSent = {
            userID,
            order
        };
        this.http
            .put<{ token: string; expiresIn: number; userID: string; order: Order }>
                (BACKEND_URL+'/update2/setzone', dataSent)
            .subscribe({
                next: (data) => {
                    // console.log(data);
                    this.userService.genToken(data.token, data.expiresIn);
                    this.setOrder(data.order);

                    // getCustomerUpdatedListener()
                    this.orderListsUpdated.next({ order: data.order });
                }, error: error => {
                    // console.log(error.error);
                    // this.signupStatusListener.next(false);
                    // this.errorStatusListener.next(error.error.message);
                }});
    }

    // // ## /api/order/update2/setcolor
    // router.put("/update3/setcolor", checkAuth, checkUUID, orderController.putOrderColorUpdate);
    putOrderColorUpdate(userID: string, order: Order) {
        const dataSent = {
            userID,
            order
        };
        this.http
            .put<{ token: string; expiresIn: number; userID: string; order: Order }>
                (BACKEND_URL+'/update3/setcolor', dataSent)
            .subscribe({
                next: (data) => {
                    // console.log(data);
                    this.userService.genToken(data.token, data.expiresIn);
                    this.setOrder(data.order);

                    // getCustomerUpdatedListener()
                    this.orderListsUpdated.next({ order: data.order });
                }, error: error => {
                    // console.log(error.error);
                    // this.signupStatusListener.next(false);
                    // this.errorStatusListener.next(error.error.message);
                }});
    }

    // // ## /api/order/update3/setmaxqtyview   updateOrderMaxQtyView
    // router.put("/update3/setmaxqtyview", checkAuth, checkUUID, orderController.updateOrderMaxQtyView);
    updateOrderMaxQtyView(userID: string, companyID: string, orderID: string, seasonYear: string, qtyMaxView: QtyMaxView[]) {
        const dataSent = {
            userID,
            companyID,
            orderID,
            seasonYear,
            qtyMaxView
        };
        this.http
            .put<{ token: string; expiresIn: number; userID: string; order: Order }>
                (BACKEND_URL+'/update3/setmaxqtyview', dataSent)
            .subscribe({
                next: (data) => {
                    // console.log(data);
                    this.userService.genToken(data.token, data.expiresIn);
                    this.setOrder(data.order);

                    // getCustomerUpdatedListener()
                    this.orderListsUpdated.next({ order: data.order });
                }, error: error => {
                    // console.log(error.error);
                    // this.signupStatusListener.next(false);
                    // this.errorStatusListener.next(error.error.message);
                }});
    }


    // // ## /api/order/update4/qrcode/replacement
    // router.put("/update4/qrcode/replacement", checkAuth, checkUUID, orderController.putOrderProductionQrcodeReplacement);
    putOrderProductionQrcodeReplacement(userID: string, companyID: string, factoryID: string, orderID: string,
                                        productBarcodeNo: string, productBarcodeNoNew: string,
                                        productBarcodeNoReserve: ProductBarcodeNoReserve) {
        const dataSent = {
            userID,
            companyID,
            factoryID,
            orderID,
            productBarcodeNo,
            productBarcodeNoNew,
            productBarcodeNoReserve,
        };
        this.http
            .put<{ token: string; expiresIn: number; userID: string; orderProduct: OrderProduction }>
                (BACKEND_URL+'/update4/qrcode/replacement', dataSent)
            .subscribe({
                next: (data) => {
                    // console.log(data);
                    this.userService.genToken(data.token, data.expiresIn);
                    this.userService.setOrderProduction(data.orderProduct);

                    // getOrderProductionReplacedUpdatedListener()
                    // this.orderProductionReplacedListsUpdated.next({ orderProduct: data.orderProduct });
                }, error: error => {
                    // console.log(error.error);
                    // this.signupStatusListener.next(false);
                    // this.errorStatusListener.next(error.error.message);
                }});
    }

    // getSubNodeFlowTypeList
    // router.get("/get/Order/SubNodeFlowType/list/:companyID/:userID", orderController.getSubNodeFlowTypeList);
    async getSubNodeFlowTypeList(companyID: string) {
        //
        const userID = this.userService.getUserID();
        this.http
            .get<{token: string; expiresIn: number; userID: string; subNodeFlowTypes: SubNodeFlowType[]}>
            (BACKEND_URL+'/get/Order/SubNodeFlowType/list/'
                        + companyID+'/'+userID)
            .subscribe({
                next: (data) => {
                    // console.log(data);
                    // console.log(data.orderProductionQueue);
                    // console.log(data.expiresIn);
                    // console.log(data.userID);
                    // console.log(data.orders);
                    this.userService.genToken(data.token, data.expiresIn);

                    // getSubNodeFlowTypeListListener()  subNodeFlowTypes: SubNodeFlowType[]
                    this.subNodeFlowTypeListUpdated.next({
                        subNodeFlowTypes: data.subNodeFlowTypes,
                        // countProductionQueueByBarcode: data.countProductionQueueByBarcode,
                        // sumProductionQueueByBarcode: data.sumProductionQueueByBarcode
                    });
                }, error: error => {
                    // console.log(error.error);
                    // this.signupStatusListener.next(false);
                    // this.errorStatusListener.next(error.error.message);
                }});
    }

    // // ## /api/order/update5/setSubNodeFlowCost
    // router.put("/update5/setSubNodeFlowCost", checkAuth, checkUUID, orderController.putOrderSubNodeFlowCostUpdate);
    putOrderSubNodeFlowCostUpdate(userID: string, order: Order) {
        // console.log(userID, order);
        const dataSent = {
            userID,
            order
        };
        this.http
            .put<{ token: string; expiresIn: number; userID: string; order: Order }>
                (BACKEND_URL+'/update5/setSubNodeFlowCost', dataSent)
            .subscribe({
                next: (data) => {
                    // console.log(data);
                    this.userService.genToken(data.token, data.expiresIn);
                    // this.userService.setOrderProduction(data.orderProduct);

                    // getCustomerUpdatedListener()
                    this.orderListsUpdated.next({ order: data.order });
                }, error: error => {
                    // console.log(error.error);
                    // this.signupStatusListener.next(false);
                    // this.errorStatusListener.next(error.error.message);
                }});
    }

    // router.get("/get/OrderLost/list/:companyID/:userID/:orderID", orderController.getOrderLostList);
    async getOrderLostList(companyID: string, orderID: string) {
        //
        const userID = this.userService.getUserID();
        this.http
            .get<{token: string; expiresIn: number; userID: string; orderProduct: OrderProduction[]}>
            (BACKEND_URL+'/get/OrderLost/list/'
                        + companyID+'/'+userID+'/'+orderID)
            .subscribe({
                next: (data) => {
                    // console.log(data);
                    // console.log(data.orderProductionQueue);
                    // console.log(data.expiresIn);
                    // console.log(data.userID);
                    // console.log(data.orders);
                    this.userService.genToken(data.token, data.expiresIn);

                    // getProductionLostListener()
                    this.productionLostUpdated.next({
                        orderProduct: data.orderProduct,
                        // countProductionQueueByBarcode: data.countProductionQueueByBarcode,
                        // sumProductionQueueByBarcode: data.sumProductionQueueByBarcode
                    });
                }, error: error => {
                    // console.log(error.error);
                    // this.signupStatusListener.next(false);
                    // this.errorStatusListener.next(error.error.message);
                }});
    }

    // router.put("/update/opd/lost/putOrderLost", checkAuth, checkUUID, orderController.putOrderLost);
    putOrderLost(companyID: string, orderID: string, productBarcodeNoReal: string,
            bundleNo: number, bundleID: string,
            mode: string, orLost: OrLost) {
        // console.log(userID, order);
        const dataSent = {
            companyID,
            orderID,
            productBarcodeNoReal,
            bundleNo,
            bundleID,
            mode,
            orLost,
        };
        this.http
            .put<{ token: string; expiresIn: number; userID: string; success: boolean;}>
                (BACKEND_URL+'/update/opd/lost/putOrderLost', dataSent)
            .subscribe({
                next: (data) => {
                    // console.log(data);
                    this.userService.genToken(data.token, data.expiresIn);
                    // this.userService.setOrderProduction(data.orderProduct);

                    // getPutorderLostListener()
                    this.putorderLostUpdated.next({ success: data.success });
                }, error: error => {
                    // console.log(error.error);
                    // this.signupStatusListener.next(false);
                    // this.errorStatusListener.next(error.error.message);
                    this.putorderLostUpdated.next({ success: false });
                }});
    }

    // router.put("/order8/oroderProduction/productBarcodeNo/qctocomplete",
    // checkAuth, checkUUID, orderController.putOrderProductionBarcodeNoQCtoComplete);
    putOrderProductionBarcodeNoQCtoComplete(companyID: string, factoryID: string, orderID: string,
        productBarcodeNos: string[], nodeIDLast: string, toNode: string) {
        //
        const createBy = this.userService.getCreateBy();
        const userID = this.userService.getUserID();
        const dataSent = {
            userID,
            createBy,
            companyID,
            factoryID,
            orderID,
            productBarcodeNos,
            nodeIDLast,
            toNode,
        };
        this.http
            .put<{ token: string; expiresIn: number; userID: string;
                // order: Order;
                // orderStyleColorSize: OrderStyleColorSize[];  currentCompanyOrder: CurrentCompanyOrder[];
                // currentOrderStyle: CurrentOrderStyle[];
            }>
                (BACKEND_URL+'/order8/oroderProduction/productBarcodeNo/qctocomplete', dataSent)
            .subscribe({
                next: (data) => {
                    // console.log(data);
                    this.userService.genToken(data.token, data.expiresIn);
                    // this.userService.setOrderProduction(data.orderProduct);

                    // getOrderQCtoCompleteListener()
                    this.orderQCtoCompleteUpdated.next({
                        status: true,
                        // order: data.order,
                        // orderStyleColorSize: data.orderStyleColorSize,
                        // currentCompanyOrder: data.currentCompanyOrder,
                        // currentOrderStyle: data.currentOrderStyle,
                    });
                }, error: error => {
                    // console.log(error.error);
                    // this.signupStatusListener.next(false);
                    // this.errorStatusListener.next(error.error.message);
                }});
    }


    // // ## /api/order/orderrewrite/orderqty/rewrite  putOrderProductionQtyRewrite
    // router.put("/orderrewrite/orderqty/rewrite", checkAuth, checkUUID, orderController.putOrderProductionQtyRewrite);
    putOrderProductionQtyRewrite(createBy: CreateBy, companyID: string, orderID: string,
                                productBarcode: string, color: string, size: string, targetPlace: TargetPlace,
                                year: string, sex: string,
                                orderQTY: number, orderQTYOld: number) {
        const dataSent = {
            userID: createBy.userID,
            createBy,
            companyID,
            orderID,
            productBarcode,
            color,
            size,
            targetPlace,
            year,
            sex,
            orderQTY,
            orderQTYOld,
        };
        this.http
            .put<{ token: string; expiresIn: number; userID: string;
                order: Order;
                orderStyleColorSize: OrderStyleColorSize[];  currentCompanyOrder: CurrentCompanyOrder[];
                currentOrderStyle: CurrentOrderStyle[];}>
                (BACKEND_URL+'/orderrewrite/orderqty/rewrite', dataSent)
            .subscribe({
                next: (data) => {
                    // console.log(data);
                    this.userService.genToken(data.token, data.expiresIn);
                    // this.userService.setOrderProduction(data.orderProduct);

                    // getOrderQtyRewriteUpdatedListener()
                    this.orderQtyRewriteUpdated.next({
                        status: true,
                        order: data.order,
                        orderStyleColorSize: data.orderStyleColorSize,
                        currentCompanyOrder: data.currentCompanyOrder,
                        currentOrderStyle: data.currentOrderStyle,
                    });
                }, error: error => {
                    // console.log(error.error);
                    // this.signupStatusListener.next(false);
                    // this.errorStatusListener.next(error.error.message);
                }});
    }



    // // ## get last n record production queue by barcodeNo
    // router.get("/lastProduction/getlists/:companyID/:orderID/:productID/:productBarcode/:page/:limit",
    //                                      checkAuth, checkUUID, orderController.getLastProductionQueueBarcode);
    // "/lastProduction/getlists/:companyID/:orderID/:productID/:productBarcode/:limit"
    // countProductionQueueByBarcode, sumProductionQueueByBarcode
    async getLastProductionQueueBarcode(companyID: string, orderID: string,
                                        productID: string, productBarcode: string,
                                        page: number, limit: number) {
        //

        this.http
            .get<{token: string; expiresIn: number; userID: string; orderProductionQueue: OrderProductionQueue,
                    countProductionQueueByBarcode: number, sumProductionQueueByBarcode: number}>
            (BACKEND_URL+'/lastProduction/getlists/'
                        + companyID+'/'+orderID+'/'+productID+'/'+productBarcode+'/'+page+'/'+limit)
            .subscribe({
                next: (data) => {
                    // console.log(data);
                    // console.log(data.orderProductionQueue);
                    // console.log(data.expiresIn);
                    // console.log(data.userID);
                    // console.log(data.orders);
                    this.userService.genToken(data.token, data.expiresIn);
                    // getLastProductionQueueBarcodeUpdatedListener()
                    this.lastProductionQueueBarcodeListsUpdated.next({
                        orderProductionQueue: data.orderProductionQueue,
                        countProductionQueueByBarcode: data.countProductionQueueByBarcode,
                        sumProductionQueueByBarcode: data.sumProductionQueueByBarcode
                    });
                }, error: error => {
                    // console.log(error.error);
                    // this.signupStatusListener.next(false);
                    // this.errorStatusListener.next(error.error.message);
                }});
    }

    // // ## get count productionqueue by bundleno
    // router.get("/get/orderProductionQueue1/getcount/:companyID/:orderID",
    // checkAuth, checkUUID, orderController.getProductionQueueCount);
    async getProductionQueueCount(companyID: string, orderID: string, startNo: number, endNo: number) {
        //
        this.http
            .get<{token: string; expiresIn: number; userID: string;
                totalProductionQueueByBundleNo: TotalProductionQueueByBundleNo}>
            (BACKEND_URL+'/get/orderProductionQueue1/getcount/'
                        + companyID+'/'+orderID+'/'+startNo+'/'+endNo)
            .subscribe({
                next: (data) => {
                    // console.log(data);
                    // console.log(data.orderProductionQueue);
                    // console.log(data.expiresIn);
                    // console.log(data.userID);
                    // console.log(data.orders);
                    this.userService.genToken(data.token, data.expiresIn);

                    // getTotalProductionQueueUpdatedListener()
                    this.totalProductionQueueListsUpdated.next({
                        orderProductionQueue: [],
                        totalProductionQueueByBundleNo: data.totalProductionQueueByBundleNo,
                        orderBundleList: []
                    });
                }, error: error => {
                    // console.log(error.error);
                    // this.signupStatusListener.next(false);
                    // this.errorStatusListener.next(error.error.message);
                }});
    }

    // // ## get list productionqueue by bundleno
    // router.get("/get/orderProductionQueue2/getlists/:companyID/:orderID/:startNo/:endNo",
    // checkAuth, checkUUID, orderController.getProductionQueueList);
    async getProductionQueueList(companyID: string, orderID: string, startNo: number, endNo: number) {
        //
        this.http
            .get<{token: string; expiresIn: number; userID: string;
                orderProductionQueue: QueueInfoList[];
                totalProductionQueueByBundleNo: TotalProductionQueueByBundleNo;
                orderBundleList: OrderBundleList[]}>
            (BACKEND_URL+'/get/orderProductionQueue2/getlists/'
                        + companyID+'/'+orderID+'/'+startNo+'/'+endNo)
            .subscribe({
                next: (data) => {
                    // console.log(data);
                    // console.log(data.orderProductionQueue);
                    // console.log(data.expiresIn);
                    // console.log(data.userID);
                    // console.log(data.orders);
                    this.userService.genToken(data.token, data.expiresIn);

                    // getTotalProductionQueueUpdatedListener()
                    this.totalProductionQueueListsUpdated.next({
                        orderProductionQueue: data.orderProductionQueue,
                        totalProductionQueueByBundleNo: data.totalProductionQueueByBundleNo,
                        orderBundleList: data.orderBundleList,
                    });
                }, error: error => {
                    // console.log(error.error);
                    // this.signupStatusListener.next(false);
                    // this.errorStatusListener.next(error.error.message);
                }});
    }


    // // ## get last n record production queue
    // router.get("/lastProduction/getlists/:companyID/:orderID/:productID/:page/:limit",
    // checkAuth, checkUUID, orderController.getProductionQueue);
    async getProductionQueue(companyID: string, orderID: string,
                            productID: string, page: number, limit: number) {
        //
        this.http.get<{
                token: string; expiresIn: number; userID: string; orderProductionQueue: OrderProductionQueue,
                countProductionQueueAll: number, sumProductionQueueAll: number
            }>
            (BACKEND_URL + '/lastProduction/getlists/'
                + companyID + '/' + orderID + '/' + productID + '/' + page + '/' + limit)
            .subscribe({
                next: (data) => {
                    // console.log(data);
                    // console.log(data.orderProductionQueue);
                    // console.log(data.expiresIn);
                    // console.log(data.userID);
                    // console.log(data.orders);
                    this.userService.genToken(data.token, data.expiresIn);
                    // getLastProductionQueueAllUpdatedListener()
                    this.lastProductionQueueAllListsUpdated.next({
                        orderProductionQueue: data.orderProductionQueue,
                        countProductionQueueAll: data.countProductionQueueAll,
                        sumProductionQueueAll: data.sumProductionQueueAll
                    });
                }, error: error => {
                    // console.log(error.error);
                    // this.signupStatusListener.next(false);
                    // this.errorStatusListener.next(error.error.message);
                }
            });
    }

    // // ## get order list /api/order/getqlist1/:companyID/:userID/:orderID/:productBarcode/:page/:limit  getOrdersQueueList
    // router.get("/getqlist1/:companyID/:userID/:orderID/:productBarcode/:page/:limit", checkAuth, checkUUID, orderController.getOrdersQueueList);
    async getOrdersQueueList(companyID: string, orderID: string,
                            productBarcode: string, page: number, limit: number) {
        //
        this.http.get<{
                token: string; expiresIn: number; userID: string; queueList: OrderProductionQueueList[]; queueListCount: number
            }>
            (BACKEND_URL + '/getqlist1/'
                + companyID + '/' + this.userService.getUserID()+ '/' + orderID + '/' + productBarcode + '/' + page + '/' + limit)
            .subscribe({
                next: (data) => {
                    // console.log(data);
                    // console.log(data.orderProductionQueue);
                    // console.log(data.expiresIn);
                    // console.log(data.userID);
                    // console.log(data.orders);
                    this.userService.genToken(data.token, data.expiresIn);

                    // getOrdersQueueListUpdatedListener()
                    this.ordersQueueListUpdated.next({
                        queueList: data.queueList,
                        queueListCount: data.queueListCount
                    });
                }, error: error => {
                    // console.log(error.error);
                    // this.signupStatusListener.next(false);
                    // this.errorStatusListener.next(error.error.message);
                }
            });
    }

    // // ## get order list /api/order/getqsetlist2/:companyID/:userID/:orderID/:page/:limit  getOrdersQueueSetList
    // router.get("/getqsetlist2/:companyID/:userID/:orderID/:page/:limit", checkAuth, checkUUID,
    // orderController.getOrdersQueueSetList);
    async getOrdersQueueSetList(companyID: string, orderID: string, page: number, limit: number) {
        //
        this.http.get<{
                token: string; expiresIn: number; userID: string; queueSetList: OrderProductionQueueList[]; queueSetListCount: number
            }>
            (BACKEND_URL + '/getqsetlist2/'
                + companyID + '/' + this.userService.getUserID()+ '/' + orderID  + '/' + page + '/' + limit)
            .subscribe({
                next: (data) => {
                    // console.log(data);
                    // console.log(data.orderProductionQueue);
                    // console.log(data.expiresIn);
                    // console.log(data.userID);
                    // console.log(data.orders);
                    this.userService.genToken(data.token, data.expiresIn);

                    // getOrdersQueueListUpdatedListener()
                    this.ordersQueueListUpdated.next({
                        queueList: data.queueSetList,
                        queueListCount: data.queueSetListCount
                    });
                }, error: error => {
                    // console.log(error.error);
                    // this.signupStatusListener.next(false);
                    // this.errorStatusListener.next(error.error.message);
                }
            });
    }

    // // ## get last running number order production  return last number
    //     router.get("/lastroderProduction/runningno/:companyID/:orderID/:productID/:productBarcode",
    //     checkAuth, checkUUID, orderController.getLastNoOrderProductionBarcode);
    async getLastNoOrderProductionBarcode(ver: number, companyID: string, orderID: string, productID: string, productBarcode: string) {
        //
        this.http.get<{ token: string; expiresIn: number; userID: string; runningNo: number; lastBundleNo: number; ver: number;}>
            (BACKEND_URL + '/lastroderProduction/runningno/'
                + companyID + '/' + orderID + '/' + productID + '/' + productBarcode+ '/' + ver)
            .subscribe({
                next: (data) => {
                    // console.log(data);
                    // console.log(data.orderProductionQueue);
                    // console.log(data.expiresIn);
                    // console.log(data.userID);
                    // console.log(data.orders);
                    this.userService.genToken(data.token, data.expiresIn);

                    // getLastRunningNoOrderProductionUpdatedListener()
                    this.getLastRunningNoOrderProductionUpdated.next({
                        runningNo: data.runningNo,
                        lastBundleNo: data.lastBundleNo,
                        ver: data.ver,
                     });
                }, error: error => {
                    // console.log(error.error);
                    // this.signupStatusListener.next(false);
                    // this.errorStatusListener.next(error.error.message);
                }
            });
    }

    // // ## get getProductionQueueBarcodeSumQty
    // router.get("/order3/getsumqty/queue/:companyID/:orderID/:productID",
    // checkAuth, checkUUID, orderController.getProductionQueueBarcodeSumQty);
    async getProductionQueueBarcodeSumQty(companyID: string, orderID: string, productID: string) {
        this.http.get<{ token: string; expiresIn: number; userID: string; productionQueuedQtySum: ProductionQueuedQtySum[]; }>
            (BACKEND_URL + '/order3/getsumqty/queue/'
            + companyID + '/' + orderID + '/' + productID)
            .subscribe({
                next: (data) => {
                    // console.log(data);
                    // console.log(data.orderProductionQueue);
                    // console.log(data.expiresIn);
                    // console.log(data.userID);
                    // console.log(data.orders);
                    this.userService.genToken(data.token, data.expiresIn);

                    // getProductionQueueBarcodeSumQtyListener()
                    this.getProductionQueueBarcodeSumQtyUpdated.next({ productionQueuedQtySum: data.productionQueuedQtySum });
                }, error: error => {
                    // console.log(error.error);
                    // this.signupStatusListener.next(false);
                    // this.errorStatusListener.next(error.error.message);
                }
            });
    }

    // // ## get all size each orderIDs  getOrderIDsSizes
    // router.get("/get/orderProductionQueuelist/getsizes/:companyID/:orderIDs",
    // checkAuth, checkUUID, orderController.getOrderIDsSizes);
    async getOrderIDsSizes(companyID: string, orderIDs: string[]) {
        const orderIDs1 = JSON.stringify(orderIDs);
        this.http.get<{ token: string; expiresIn: number; userID: string; productionQueuedQtySum: ProductionQueuedQtySum[]; }>
            (BACKEND_URL + '/get/orderProductionQueuelist/getsizes/'
            + companyID + '/' + orderIDs1 )
            .subscribe({
                next: (data) => {
                    // console.log(data);
                    // console.log(data.orderProductionQueue);
                    // console.log(data.expiresIn);
                    // console.log(data.userID);
                    // console.log(data.orders);
                    this.userService.genToken(data.token, data.expiresIn);

                    // getProductionQueueBarcodeSumQtyListener()
                    this.getProductionQueueBarcodeSumQtyUpdated.next({ productionQueuedQtySum: data.productionQueuedQtySum });
                }, error: error => {
                    // console.log(error.error);
                    // this.signupStatusListener.next(false);
                    // this.errorStatusListener.next(error.error.message);
                }
            });
    }


    // // ## /api/order/orderProductionQueue/createnew   postOrderProductionQueueCreateNew
    // router.post("/orderProductionQueue/createnew", checkAuth, checkUUID, orderController.postOrderProductionQueueCreateNew);
    postOrderProductionQueueCreateNew(companyID: string, orderID: string, productID: string, queueInfo: QueueInfo) {
        const dataSent = {
            companyID,
            orderID,
            productID,
            queueInfo
        };
        // console.log(dataSent);
        this.http
            .post<{ token: string; expiresIn: number; userID: string; success: boolean; message: any; }>
                (BACKEND_URL+'/orderProductionQueue/createnew', dataSent)
            .subscribe({
                next: (data) => {
                    // console.log(data);
                    this.userService.genToken(data.token, data.expiresIn);

                    // getPostOrderProductionQueueCreateNewUpdatedListener()
                    this.postOrderProductionQueueCreateNewUpdated.next({ success: data.success, message: {} });
                }, error: error => {
                    // console.log(error.error);
                    this.postOrderProductionQueueCreateNewUpdated.next({ success: false,  message: error.error.message });
                }});
    }

    // // ## /api/order2/orderProductionQueues/lists/createnew   postOrderProductionQueuesCreateNew
    // router.post("/order2/orderProductionQueues/lists/createnew", checkAuth, checkUUID, orderController.postOrderProductionQueuesCreateNew);
    postOrderProductionQueuesCreateNew(companyID: string, factoryID: string,
            orderID: string, productID: string,
            forLoss: boolean,
            targetPlace: TargetPlace, queueInfo: QueueInfo[], qty: number, orderQty: number,
            yarnLots: YarnLot[],
            startNo: number, toNo: number, productBarcode: string, isOutsource: boolean,
            bundleItems: number, bundleNoFrom: number, bundleNoTo: number, toNode1: string,
            outsourceData: OutsourceData,
            createBy: CreateBy, ver: number, seasonYear: string) {
        const dataSent = {
            companyID,
            factoryID,
            orderID,
            productID,
            forLoss,
            targetPlace,
            queueInfo,
            qty,
            orderQty,
            yarnLots,
            startNo,
            toNo,
            productBarcode,
            isOutsource,
            bundleItems,
            bundleNoFrom,
            bundleNoTo,
            toNode1,
            outsourceData,
            createBy,
            ver,
            seasonYear,
        };
        // console.log(dataSent);
        this.http
            .post<{ token: string; expiresIn: number; userID: string; success: boolean; message: any; }>
                (BACKEND_URL+'/order2/orderProductionQueues/lists/createnew', dataSent)
            .subscribe({
                next: (data) => {
                    // console.log(data);
                    this.userService.genToken(data.token, data.expiresIn);

                    // getLastRunningNoOrderProductionsUpdatedListener()
                    this.postOrderProductionQueuesCreateNewUpdated.next({ success: data.success, message: {} });
                }, error: error => {
                    // console.log(error);
                    this.postOrderProductionQueuesCreateNewUpdated.next({ success: false,  message: error.error.message });
                }});
    }

    // // ## /api/order/delorder1/orderProductionQueues/cancel  deleteOrderProductionQueuesCancel
    // router.post("/delorder1/orderProductionQueues/cancel", checkAuth, checkUUID,
    // orderController.deleteOrderProductionQueuesCancel);
    deleteOrderProductionQueuesCancel(orderProductionQueueList: OrderProductionQueueList, page: number, limit: number) {
        const dataSent = {
            orderProductionQueueList,
            page,
            limit,
        };
        // console.log(dataSent);
        this.http
            .post<{ token: string; expiresIn: number; userID: string; success: boolean; message: any;
                queueList: OrderProductionQueueList[]; queueListCount: number}>
                (BACKEND_URL+'/delorder1/orderProductionQueues/cancel', dataSent)
            .subscribe({
                next: (data) => {
                    // console.log(data);
                    this.userService.genToken(data.token, data.expiresIn);

                    // getordersQueueListCancelUpdatedListener()
                    this.ordersQueueListCancelUpdated.next({
                        queueList: data.queueList,
                        queueListCount: data.queueListCount,
                        success: data.success,
                        message: {}
                    });
                    // queueList: OrderProductionQueueList[],
                    // queueListCount: number,
                    // success: boolean, message: any
                }, error: error => {
                    // console.log(error);
                    // this.postOrderProductionQueuesCreateNewUpdated.next({ success: false,  message: error.error.message });
                }});
    }


    // router.get("/order4/:companyID/:style/:ordertatus", checkAuth, checkUUID, orderController.getCompanyOrderByStyle);
    async getCompanyOrderByStyle(companyID: string, style: string, ordertatus: string[], productStatus: string[]) {
        const orderStatusArr = JSON.stringify(ordertatus);
        const productStatusArr = JSON.stringify(productStatus);
        const orderIDArr = JSON.stringify(Array.from(new Set(this.userService.getOrders().map((item: any) => item.orderID))));
        // console.log(companyID, orderStatusArr);
        this.http
        .get<{token: string; expiresIn: number;
                orderStyleColorSize: OrderStyleColorSize[];  currentCompanyOrder: CurrentCompanyOrder[];
                currentOrderStyle: CurrentOrderStyle[]; currentProductQtyAllC: CurrentProductQtyAllC[];}>
        (BACKEND_URL+'/order4/'+ companyID+'/'+style+'/'+orderStatusArr+'/'+productStatusArr+'/'+orderIDArr)
        .subscribe({
            next: (data) => {
                // console.log(data);
                this.userService.genToken(data.token, data.expiresIn);

                // getRepCompanyOrderUpdatedListener()
                this.repCompanyOrderUpdated.next({
                    orderStyleColorSize: data.orderStyleColorSize,
                    currentCompanyOrder: data.currentCompanyOrder,
                    currentOrderStyle: data.currentOrderStyle,
                    currentProductQtyAllC: data.currentProductQtyAllC,
                });

            }, error: error => {
                // console.log(error.error);
                // this.signupStatusListener.next(false);
                // this.errorStatusListener.next(error.error.message);
            }});
    }


    // router.put("/orderoutsourcetracking2/productionNode", .upsertOrderProducctionNodeFlow);
    upsertOrderProducctionNodeFlow(companyID: string, orderID: string, bundleNos: number[], bundleNos2: number[],
        nodeIDs: string[], productionNode: ProductionNode[] ) {
        const dataSent = {
            companyID,
            orderID,
            bundleNos,
            bundleNos2,
            nodeIDs,
            productionNode,
        };
        this.http
            .put<{ token: string; expiresIn: number; userID: string;
                order: Order;
                orderProductOutsourceTrackingFlowseqNormal: OrderProductBundleNosOutsourceTracking[];}>
                (BACKEND_URL+'/orderoutsourcetracking2/productionNode', dataSent)
            .subscribe({
                next: (data) => {
                    // console.log(data);
                    this.userService.genToken(data.token, data.expiresIn);
                    // this.userService.setOrderProduction(data.orderProduct);

                    // orderProductOutsourceTrackingFlowseqNormal: OrderProductBundleNosOutsourceTracking[];
                    // getEditOutsTrackingListener()
                    this.editOutsTrackingUpdated.next({
                        orderProductOutsourceTrackingFlowseqNormal: data.orderProductOutsourceTrackingFlowseqNormal,
                    });
                }, error: error => {
                    // console.log(error.error);
                    // this.signupStatusListener.next(false);
                    // this.errorStatusListener.next(error.error.message);
                }});
    }

    // productBarcode  startNO   endNo
    // router.get("/order7/getbundlenos/:companyID/:productBarcode/:startNO/:endNo", checkAuth, checkUUID, orderController.getOrderProductBundleNos);
    async getOrderProductBundleNos(companyID: string, productBarcode: string, startNO: number, endNo: number) {
        this.http
        .get<{token: string; expiresIn: number;
            orderProductionBundleNos: OrderProduction[];}>
        (BACKEND_URL+'/order7/getbundlenos/'+ companyID+'/'+productBarcode+'/'+startNO+'/'+endNo)
        .subscribe({
            next: (data) => {
                // console.log(data);
                this.userService.genToken(data.token, data.expiresIn);

                // getOrderProductBundleNosUpdatedListener()
                this.repCompanyOrderProductBundleNosUpdated.next({
                    orderProductionBundleNos: data.orderProductionBundleNos,
                });

            }, error: error => {
                // console.log(error.error);
                // this.signupStatusListener.next(false);
                // this.errorStatusListener.next(error.error.message);
            }});
    }

    // // ## get bundle no by style , zone , color , size
    // router.get("/orderoutsourcetracking1/getlists/:companyID/:factoryID/:orderIDs/:productionNodeStatusArr",
    // checkAuth, checkUUID, orderController.getOrderOursourceTracking);
    async getOrderOursourceTracking(companyID: string, factoryID: string, orderIDs1: string[], productionNodeStatusArr1: string[]) {
        const orderIDs = JSON.stringify(orderIDs1);
        const productionNodeStatusArr = JSON.stringify(productionNodeStatusArr1);
        this.http
        .get<{token: string; expiresIn: number;
            bundleNos: number[],
            nodeIDs: string[],
            forbiddenNodeIDs: string[],
            nodeStations: NodeStation[];
            flowSeq: FlowSeq[];
            orderProductBundleNosOutsourceTracking: OrderProductBundleNosOutsourceTracking[];
            orderProductOutsourceTrackingFlowseqNormal: OrderProductBundleNosOutsourceTracking[];
            orderProductOutsourceTrackingFlowseqTracking: OrderProductBundleNosOutsourceTracking[];
        }>
        (BACKEND_URL+'/orderoutsourcetracking1/getlists/'
            + companyID+'/'+factoryID+'/'+orderIDs+'/'+productionNodeStatusArr)
        .subscribe({
            next: (data) => {
                // console.log(data);
                this.userService.genToken(data.token, data.expiresIn);

                // getOrderProductBundleNosOutsourceTrackingUpdatedListener()
                this.getOrderProductBundleNosOutsourceTrackingUpdated.next({
                    bundleNos: data.bundleNos,
                    nodeIDs: data.nodeIDs,
                    forbiddenNodeIDs: data.forbiddenNodeIDs,
                    nodeStations: data.nodeStations,
                    flowSeq: data.flowSeq,
                    orderProductBundleNosOutsourceTracking: data.orderProductBundleNosOutsourceTracking,
                    orderProductOutsourceTrackingFlowseqNormal: data.orderProductOutsourceTrackingFlowseqNormal,
                    orderProductOutsourceTrackingFlowseqTracking: data.orderProductOutsourceTrackingFlowseqTracking,
                });

            }, error: error => {
                // console.log(error.error);
                // this.signupStatusListener.next(false);
                // this.errorStatusListener.next(error.error.message);
            }});
    }

    async getOrderOursourceTrackingByBundleNos(companyID: string, factoryID: string, orderIDs1: string[],
        productionNodeStatusArr1: string[], bundleNos: number[]) {
        const orderIDs = JSON.stringify(orderIDs1);
        const productionNodeStatusArr = JSON.stringify(productionNodeStatusArr1);
        const bundleNoArr = JSON.stringify(bundleNos);
        this.http
        .get<{token: string; expiresIn: number;
            bundleNos: number[],
            nodeIDs: string[],
            forbiddenNodeIDs: string[],
            nodeStations: NodeStation[];
            flowSeq: FlowSeq[];
            orderProductBundleNosOutsourceTracking: OrderProductBundleNosOutsourceTracking[];
            orderProductOutsourceTrackingFlowseqNormal: OrderProductBundleNosOutsourceTracking[];
            orderProductOutsourceTrackingFlowseqTracking: OrderProductBundleNosOutsourceTracking[];
        }>
        (BACKEND_URL+'/orderoutsourcetracking3/getlists/'
            + companyID+'/'+factoryID+'/'+orderIDs+'/'+productionNodeStatusArr+'/'+bundleNoArr)
        .subscribe({
            next: (data) => {
                // console.log(data);
                this.userService.genToken(data.token, data.expiresIn);

                // getOrderProductBundleNosOutsourceTrackingUpdatedListener()
                this.getOrderProductBundleNosOutsourceTrackingUpdated.next({
                    bundleNos: data.bundleNos,
                    nodeIDs: data.nodeIDs,
                    forbiddenNodeIDs: data.forbiddenNodeIDs,
                    nodeStations: data.nodeStations,
                    flowSeq: data.flowSeq,
                    orderProductBundleNosOutsourceTracking: data.orderProductBundleNosOutsourceTracking,
                    orderProductOutsourceTrackingFlowseqNormal: data.orderProductOutsourceTrackingFlowseqNormal,
                    orderProductOutsourceTrackingFlowseqTracking: data.orderProductOutsourceTrackingFlowseqTracking,
                });

            }, error: error => {
                // console.log(error.error);
                // this.signupStatusListener.next(false);
                // this.errorStatusListener.next(error.error.message);
            }});
    }



    // ## order ########################################################
    // #######################################################################

    // #######################################################################
    // ## bundle group  ########################################################

    // router.get("/bundlesetgroup/getlists/:companyID/:userID/:orderID/:seasonYear",
    // checkAuth, checkUUID, orderController.getBundlesetgroups);
    async getBundlesetgroups(companyID: string, orderID: string, seasonYear: string) {
        // console.log(companyID, orderID, seasonYear);
        const userID = this.userService.getUserID();
        this.http
        .get<{token: string; expiresIn: number; userID: string;
            bundleSetGroups: BundleSetGroup[];
        }>
        (BACKEND_URL+'/bundlesetgroup/getlists/'
            + companyID+'/'+userID+'/'+orderID+'/'+seasonYear)
        .subscribe({
            next: (data) => {
                // console.log(data);
                this.userService.genToken(data.token, data.expiresIn);

                // getBundleSetGroupListener()
                this.getBundleSetGroupUpdated.next({
                    bundleSetGroups: data.bundleSetGroups,
                });

            }, error: error => {
                // console.log(error.error);
                // this.signupStatusListener.next(false);
                // this.errorStatusListener.next(error.error.message);
            }});
    }

    // router.post("/bundlesetgroup/createnew", checkAuth, checkUUID, orderController.postBundleSetGroupCreateNew);
    postBundleSetGroupCreateNew(bundleSetGroup: BundleSetGroup) {
        const userID = this.userService.getUserID();
        const dataSent = {
            bundleSetGroup,
            userID,
        };
        // console.log(dataSent);
        this.http
        .post<{ token: string; expiresIn: number; userID: string; success: boolean; message: any;
            bundleSetGroups: BundleSetGroup[];}>
            (BACKEND_URL+'/bundlesetgroup/createnew', dataSent)
        .subscribe({
            next: (data) => {
                // console.log(data);
                this.userService.genToken(data.token, data.expiresIn);

                // getBundleSetGroupListener()
                this.getBundleSetGroupUpdated.next({
                    bundleSetGroups: data.bundleSetGroups,
                });
            }, error: error => {
                // console.log(error);
                // this.postOrderProductionQueuesCreateNewUpdated.next({ success: false,  message: error.error.message });
            }});
    }

    // router.post("/bundlesetgroup/del", checkAuth, checkUUID, orderController.deleteBundleSetGroupDel);
    deleteBundleSetGroupDel(bundleSetGroup: BundleSetGroup) {
        const userID = this.userService.getUserID();
        const dataSent = {
            bundleSetGroup,
            userID,
        };
        // console.log(dataSent);
        this.http
        .post<{ token: string; expiresIn: number; userID: string; success: boolean; message: any;
            bundleSetGroups: BundleSetGroup[];}>
            (BACKEND_URL+'/bundlesetgroup/del', dataSent)
        .subscribe({
            next: (data) => {
                // console.log(data);
                this.userService.genToken(data.token, data.expiresIn);

                // getBundleSetGroupListener()
                this.getBundleSetGroupUpdated.next({
                    bundleSetGroups: data.bundleSetGroups,
                });
            }, error: error => {
                // console.log(error);
                // this.postOrderProductionQueuesCreateNewUpdated.next({ success: false,  message: error.error.message });
            }});
    }

    // router.put("/bundlesetgroup/completed", checkAuth, checkUUID, orderController.editBundleSetGroupComplete);
    editBundleSetGroupComplete(bundleSetGroup: BundleSetGroup, mode:'complete'|'seq') {
        const userID = this.userService.getUserID();
        const dataSent = {
            bundleSetGroup,
            mode,
            userID
        };
        this.http
            .put<{ token: string; expiresIn: number; userID: string;
                bundleSetGroups: BundleSetGroup[];}>
                (BACKEND_URL+'/bundlesetgroup/completed', dataSent)
            .subscribe({
                next: (data) => {
                    // console.log(data);
                    this.userService.genToken(data.token, data.expiresIn);
                    // this.userService.setOrderProduction(data.orderProduct);

                   // getBundleSetGroupListener()
                    this.getBundleSetGroupUpdated.next({
                        bundleSetGroups: data.bundleSetGroups,
                    });
                }, error: error => {
                    // console.log(error.error);
                    // this.signupStatusListener.next(false);
                    // this.errorStatusListener.next(error.error.message);
                }});
    }

    // ##   ########################################################
    // #######################################################################

    // #######################################################################
    // ##   ########################################################



    // ##   ########################################################
    // #######################################################################

    // #######################################################################
    // ## observer ########################################################

    // // getOrderQCtoCompleteListener()
    // this.orderQCtoCompleteUpdated.nex
    getOrderQCtoCompleteListener() {
        return this.orderQCtoCompleteUpdated.asObservable();
    }

    // getEditOutsTrackingListener()
    // this.editOutsTrackingUpdated.next
    getEditOutsTrackingListener() {
        return this.editOutsTrackingUpdated.asObservable();
    }

    // // getSubNodeFlowTypeListListener()  subNodeFlowTypes: SubNodeFlowType[]
    // this.subNodeFlowTypeListUpdated.next
    getSubNodeFlowTypeListListener() {
        return this.subNodeFlowTypeListUpdated.asObservable();
    }

    // // getProductionLostListener()
    // this.productionLostUpdated.next
    getProductionLostListener() {
        return this.productionLostUpdated.asObservable();
    }

    // // getPutorderLostListener()
    // this.putorderLostUpdated.next({ success: data.success });
    getPutorderLostListener() {
        return this.putorderLostUpdated.asObservable();
    }

    // // getBundleSetGroupListener()
    // this.getBundleSetGroupUpdated.next
    getBundleSetGroupListener() {
        return this.getBundleSetGroupUpdated.asObservable();
    }

    // // getOrderProductBundleNosOutsourceTrackingUpdatedListener()
    // this.getOrderProductBundleNosOutsourceTrackingUpdated.next
    getOrderProductBundleNosOutsourceTrackingUpdatedListener() {
        return this.getOrderProductBundleNosOutsourceTrackingUpdated.asObservable();
    }

    // // getTotalProductionQueueUpdatedListener()
    // this.totalProductionQueueListsUpdated.next
    getTotalProductionQueueUpdatedListener() {
        return this.totalProductionQueueListsUpdated.asObservable();
    }

    // // getordersQueueListCancelUpdatedListener()
    // this.ordersQueueListCancelUpdated.next
    getordersQueueListCancelUpdatedListener() {
        return this.ordersQueueListCancelUpdated.asObservable();
    }

    // getOrderQtyRewriteUpdatedListener()
    // this.orderQtyRewriteUpdated.next({ status: true });
    getOrderQtyRewriteUpdatedListener() {
        return this.orderQtyRewriteUpdated.asObservable();
    }

    // // getOrdersQueueListUpdatedListener()
    getOrdersQueueListUpdatedListener() {
        return this.ordersQueueListUpdated.asObservable();
    }

    // // getOrderProductBundleNosUpdatedListener()
    // this.repCompanyOrderProductBundleNosUpdated.next
    getOrderProductBundleNosUpdatedListener() {
        return this.repCompanyOrderProductBundleNosUpdated.asObservable();
    }

    // // getOrderStylesListsListener()
    // this.orderStylesListsUpdated.next({ orderStyles: data.orderStyles });
    getOrderStylesListsListener() {
        return this.orderStylesListsUpdated.asObservable();
    }

    getRepCompanyOrderUpdatedListener() {
        return this.repCompanyOrderUpdated.asObservable();
    }

    // this.ordersZoneStyleSizeByOrderIDsListsUpdated
    getOrdersZoneStyleSizeByOrderIDsListener() {
        return this.ordersZoneStyleSizeByOrderIDsListsUpdated.asObservable();
    }

    // private ordersByOrderIDsListsUpdated = new Subject<{ orders: Order[], ordersCount: number}>();
    getOrdersByOrderIDsListener() {
        return this.ordersByOrderIDsListsUpdated.asObservable();
    }

    // // getProductionQueueBarcodeSumQtyListener()
    getProductionQueueBarcodeSumQtyListener() {
        return this.getProductionQueueBarcodeSumQtyUpdated.asObservable();
    }

    // private postOrderProductionQueuesCreateNewUpdated = new Subject<{ success: boolean, message: any}>();
    getLastRunningNoOrderProductionsUpdatedListener() {
        return this.postOrderProductionQueuesCreateNewUpdated.asObservable();
    }

    // private getLastRunningNoOrderProductionUpdated = new Subject<{ runningNo: number}>();
    getLastRunningNoOrderProductionUpdatedListener() {
        return this.getLastRunningNoOrderProductionUpdated.asObservable();
    }

    // private postOrderProductionQueueCreateNewUpdated = new Subject<{ success: boolean}>();
    getPostOrderProductionQueueCreateNewUpdatedListener() {
        return this.postOrderProductionQueueCreateNewUpdated.asObservable();
    }

    // private LastProductionQueueBarcodeListsUpdated = new Subject<{ orderProductQueue: OrderProductQueue}>();
    getLastProductionQueueAllUpdatedListener() {
        return this.lastProductionQueueAllListsUpdated.asObservable();
    }

    // private LastProductionQueueBarcodeListsUpdated = new Subject<{ orderProductQueue: OrderProductQueue}>();
    getLastProductionQueueBarcodeUpdatedListener() {
        return this.lastProductionQueueBarcodeListsUpdated.asObservable();
    }

    // private orderListsUpdated = new Subject<{ order: Order}>();
    getCustomerUpdatedListener() {
        return this.orderListsUpdated.asObservable();
    }


    getOrder1UpdatedListener() {
        return this.orderListsUpdated.asObservable();
    }

    // private ordersListsUpdated = new Subject<{ orders: Order[]}>();;
    getCustomersUpdatedListener() {
        return this.ordersListsUpdated.asObservable();
    }

    // ## observer ########################################################
    // #######################################################################


    // #######################################################################
    // ##   ########################################################


    clrOrder() {
        const order: Order = {
            orderID: '',
            seasonYear: '',
            ver: 0,
            orderDetail: '',
            orderDate: new Date(),
            deliveryDate: new Date(),
            companyID: '',
            factoryID: '',
            bundleNo: 1,
            orderstatus: 'close',
            customerOR: {
                customerID: '',
                customerName: ''
            },
            orderTargetPlace: [],
            orderColor: [],
            productOR: {
                productID: '',
                productName: '',
                productORDetail: '',
                productCustomerCode: '',
                productORInfo: [],
                productORRewriteInfo: [],
                subNodeFlowCost: [],
            },
            createBy: {
                userID: '',
                userName: ''
            },
            orderSetting: {
                qtyMaxView: [],
            },
        };
        return order;
    }

    // ##   ########################################################
    // #######################################################################




    // #######################################################################
    // ##  print PDF ########################################################

    outS1BY1: any[] = [];  // OutS1BY1

    productionOutS1BY1PDF(outsMode: string, dataGroup: any[][], dataPrint: any) {
        const repID = dataPrint.repID;
        const dmy = dataPrint.dmy;
        const seasonYear = dataPrint.seasonYear;
        const factoryName = dataPrint.factoryName;
        // console.log(repID, dmy, seasonYear)

        this.outS1BY1 = [];
        let row = 1;
        dataGroup.forEach( (item: any[], index) => {
            item.sort((a,b)=>{
                return a.orderID >b.orderID?1:a.orderID <b.orderID?-1:0
                    || a.targetPlaceID >b.targetPlaceID?1:a.targetPlaceID <b.targetPlaceID?-1:0
                    || a.color1 >b.color1?1:a.color1 <b.color1?-1:0
            });

            // ## get summary page PDF
            const contentOutS1BY1Summary = this.getOutS1BY1SummaryPDF_1(factoryName, outsMode, item, row);

            this.outS1BY1.push(...contentOutS1BY1Summary);
            row++;
        });
        const docDefinition: any = this.generateOutS1BY1PDF(repID, seasonYear, dmy);
        return docDefinition;
    }

    // getOutS1BY1SummaryPDF_1(data: any[], row: number) {
    //     data.forEach( (item, index) => {
    //         // ## get summary page PDF
    //         const contentOutS1BY1Summary = this.getOutS1BY1SummaryPDF_2(item, row);

    //     });
    // }

    getOutS1BY1SummaryPDF_1(factoryName: string, outsMode: string, data: any[], row: number) {
        const mode = outsMode==='out'?'SENT OUT':'RECEIVED';
        const dmy = data[0].dmy
        const mardinTop = row===1?0:20;
        const head1 = factoryName + ' ,   Date : ' + dmy;
        const contentsummary = [
            {
                style: 'tableExample',
                margin: [35, mardinTop, 15, 0],
                table: {  // ##
                    widths: ['5%', '55%', '20%', '20%'],
                    headerRows: 1,
                    body: [
                        [
                            {text: head1, style: ['txtheadsize', 'marginHeadTop2'], colSpan: 3, alignment: 'left', fillColor: '#cccccc'},
                            {},{},
                            {text: mode, style: ['txtheadsize', 'marginHeadTop2'], alignment: 'center', fillColor: '#cccccc'}
                        ],
                        [
                            {text: '', style: ['txtheadsize', 'marginHeadTop2'], alignment: 'center', fillColor: '#cccccc'},
                            {text: 'Style.', style: ['txtheadsize', 'marginHeadTop2'], alignment: 'center', fillColor: '#cccccc'},
                            {text: 'Bundles.', style: ['txtheadsize', 'marginHeadTop2'], alignment: 'center', fillColor: '#cccccc'},
                            {text: 'Qty.  (1 by 1) ', style: ['txtheadsize', 'marginHeadTop2'], alignment: 'center', fillColor: '#cccccc'},
                        ],
                        ...this.getOutS1BY1SummaryBodyPDF(data),  // ## body table
                    ]
                }
            },
        ];
        return contentsummary;
    }

    getOutS1BY1SummaryBodyPDF(dataSummary: any[]) {
        const orderID = dataSummary[0].orderID
        const targetPlaceID = dataSummary[0].targetPlaceID
        let body1: any[] = []
        let row1: any[] = [];
        let row2: any[] = [];
        const orderIDTxt = orderID
                        + ' [ ' + targetPlaceID + ' ]';

        let qtyTotal = 0;
        dataSummary.forEach( (item1, index1) => {
            qtyTotal = qtyTotal + +item1.qty;
            row1 = [
                {text: [{text: '', style: ['', ''], alignment: 'center'}], color: 'black', border: [true, true, true, false]},
                {text: [{text: orderIDTxt, style: ['', ''], alignment: 'left'}], color: 'black', border: [true, true, true, false]},
                {text: [{text: '', style: ['', ''], alignment: 'center'}], color: 'black', border: [true, true, true, false]},
                {text: [{text: item1.qty, style: ['', ''], alignment: 'center'}], color: 'black', border: [true, true, true, false]},
            ];
            body1.push(row1);

            row2 = [
                {text: [{text: '', style: ['', ''], alignment: 'center'}], color: 'black', border: [true, false, true, true]},
                {text: [{text: '.   '+item1.color1, style: ['txtSmall6', ''], alignment: 'left'}], color: 'black', border: [true, false, true, true]},
                {text: [{text: '', style: ['', ''], alignment: 'center'}], color: 'black', border: [true, false, true, true]},
                {text: [{text: '', style: ['', ''], alignment: 'center'}], color: 'black', border: [true, false, true, true]},
            ];
            body1.push(row2);
        });

        // ## line total
        // let row1: any[] = [];
        // let row2: any[] = [];
        row1 = [
            {text: [{text: '', style: ['', ''], alignment: 'center'}], color: 'black', border: [true, true, true, false]},
            {text: [{text: '', style: ['', ''], alignment: 'left'}], color: 'black', border: [true, true, true, false]},
            {text: [{text: '', style: ['', ''], alignment: 'center'}], color: 'black', border: [true, true, true, false]},
            {text: [{text: '', style: ['', ''], alignment: 'center'}], color: 'black', border: [true, true, true, false]},
        ];
        body1.push(row1);

        row2 = [
            {text: [{text: '', style: ['', ''], alignment: 'center'}], color: 'black', border: [true, false, true, true]},
            {text: [{text: 'Total', style: ['txtheadsize', ''], alignment: 'center'}], color: 'black', border: [true, false, true, true]},
            {text: [{text: '', style: ['txtheadsize', ''], alignment: 'center'}], color: 'black', border: [true, false, true, true]},
            {text: [{text: qtyTotal, style: ['txtheadsize', ''], alignment: 'center'}], color: 'black', border: [true, false, true, true]},
        ];
        body1.push(row2);

        return body1;
    }



    generateOutS1BY1PDF(repCode: string, seasonYear: string, dmy: string) {
        const datePrint = this.userService.returnDDMMYYYY(0,'-')
                        +' '
                        +this.userService.returnHHMM(0,':');
        const style = {
            backgroundHead: {
                background: 'lightgray',
            },

            marginHeadTop7: {
                margin: [0, 7, 0, 0]
            },
            marginHeadTop3: {
                margin: [0, 3, 0, 0]
            },
            marginHeadTop2: {
                margin: [0, 2, 0, 0]
            },
            txtheadsize: {
                fontSize: 8,
                bold: true,
            },
            txtSmall8: {
                fontSize: 8,
            },
            txtSmall7: {
                fontSize: 7,
            },
            txtSmall6: {
                fontSize: 6,
            },

            txtBold: {
                bold: true,
            },

            color_white: {  // ## transparent
                color: 'white',
            },
        };
        // const seasonYear = this.userService.seasonYear;
        let docDefinition: any = {
            pageSize: 'A4',
            pageMargins: [ 15, 20, 15, 30 ],
            content: this.outS1BY1,
            header: {
                columns: [
                    {text: repCode+'/'+ seasonYear, italics: true, fontSize: 6, alignment: 'left', margin: [10, 2, 0, 0]},
                    '',
                    {text: 'date print: ' + datePrint, italics: true, fontSize: 6, alignment: 'right', margin: [1, 2, 10, 0]},
                ], margin: [35, 10, 15, 0]
            },

            footer: function(currentPage: any, pageCount: any) {
                return {
                    columns: [
                      '',
                      {text: repCode+'  , date print: ' + datePrint, italics: true, fontSize: 6, alignment: 'right'},
                      '',
                      { text: currentPage.toString() + ' of ' + pageCount, alignment: 'right' },
                      '',
                    ], margin: [35, 0, 15, 5]
                  };
            },
            defaultStyle: { fontSize: 8},
            styles: style,
        };
        return docDefinition;
    }

    dataPrintProductionBundleState: any = {};
    bundleStatePDFGroup2: any[][] = [];
    bundleStateDone = '*';

    // ## 1.COMPUTER-KNITTING 2.PANAL-INSPECTION 3.LINKING 4.MENDING 5.WASHING 6.PRESSING 7.QC
    findBundleStateNodeID(nodeGroupScanID2: NodeGroupScanID2[], nodeID: string) {
        const nodeIDF = nodeGroupScanID2.filter(i=> i.nodeID === nodeID);
        if (nodeIDF.length > 0) {
            const status = nodeIDF[0].status; // ## done= finished of this node,  '-'= not finished yet
            if (status === 'done') {
                return this.bundleStateDone;
            } else if (status === '-') {
                return nodeIDF[0].sumProductQty + '';
            }
        }
        return '';
    }

    prepareDataBundleState(bundleStatePDFGroupX: any[]) {
        let bundleStatePDFGroup1: any[] = [];
        // console.log(bundleStatePDFGroupX);
        let rowNo = 1;
        bundleStatePDFGroupX.forEach( (item, index) => {
            let bundleStatePDFRow1: BundleStatePDFRow = GBC.clrBundleStatePDFRow();
            bundleStatePDFRow1.rowState = 'd'; // ## ## d=detail
            bundleStatePDFRow1.groupNamePDF = item.groupNamePDF;
            bundleStatePDFRow1.rowNo = rowNo;
            bundleStatePDFRow1.bundleNo = item.bundleNo;
            bundleStatePDFRow1.size = item.size;
            bundleStatePDFRow1.productCount = item.productCount;

            bundleStatePDFRow1.knitting = this.findBundleStateNodeID(item.nodeGroupScanID2, '1.COMPUTER-KNITTING');
            bundleStatePDFRow1.panal = this.findBundleStateNodeID(item.nodeGroupScanID2, '2.PANAL-INSPECTION');
            bundleStatePDFRow1.linking = this.findBundleStateNodeID(item.nodeGroupScanID2, '3.LINKING');
            bundleStatePDFRow1.mending = this.findBundleStateNodeID(item.nodeGroupScanID2, '4.MENDING');
            bundleStatePDFRow1.washing = this.findBundleStateNodeID(item.nodeGroupScanID2, '5.WASHING');
            bundleStatePDFRow1.pressing = this.findBundleStateNodeID(item.nodeGroupScanID2, '6.PRESSING');
            bundleStatePDFRow1.qc = this.findBundleStateNodeID(item.nodeGroupScanID2, '7.QC');
            bundleStatePDFGroup1.push(bundleStatePDFRow1);
            rowNo++;
        });
        this.bundleStatePDFGroup2.push(bundleStatePDFGroup1);
    }

    contentBundleStatePDF: any[] = [];

    // productionBundleStatePDF
    productionBundleStatePDF(bundleStatePDFGroup: any[][], dataPrint: any) {
        // console.log(bundleStatePDFGroup);
        // console.log(dataPrint);
        this.dataPrintProductionBundleState = dataPrint;
        const repID = dataPrint.repID;

        this.bundleStatePDFGroup2 = [];
        this.contentBundleStatePDF = [];
        bundleStatePDFGroup.forEach( (item, index) => {
            this.prepareDataBundleState(item);
        });
        // console.log(this.bundleStatePDFGroup2);

        const date12 = this.dataPrintProductionBundleState.date12;
        const orderID = this.dataPrintProductionBundleState.orderID;
        const setName = this.userService.getSetNameColorByOrderID(orderID);
        const pageBrake: any[] = [{text: '', pageBreak: 'after', style: ['']}];

        // ## get summary page PDF
        const contentBundleStateSummary = this.getBundleStateSummaryPDF([...this.bundleStatePDFGroup2]);
        this.contentBundleStatePDF = [
            ...contentBundleStateSummary,
            ...pageBrake,
        ];
        this.bundleStatePDFGroup2.forEach( (item, index) => {
            const len = item.length;
            const zone = bundleStatePDFGroup[index][0].targetPlaceID;
            const color = bundleStatePDFGroup[index][0].color;
            const colorName = bundleStatePDFGroup[index][0].colorName;
            const colorCode = this.userService.getColorCodeByColorIDSetName(color, setName);
            const firstRow = index===0;
            const lastRow = index===this.bundleStatePDFGroup2.length-1;
            // console.log(len, zone, color, colorName, colorCode);
            const data1: any = {date12, orderID, setName, len, zone, color, colorName, colorCode, firstRow};

            // ## get header PDF
            let contentBundleStateHeaderTop = this.getBundleStateHeaderPDF(data1);

            // ## get body pdf
            const contentBundleStateTable = this.getBundleStateTablePDF(item);

            this.contentBundleStatePDF = [
                ...this.contentBundleStatePDF,
                // ...contentBundleStateSummary,
                // ...pageBrake,
                ...contentBundleStateHeaderTop,
                ...contentBundleStateTable,
                // firstRow?'':pageBrake,
                lastRow?'':pageBrake,

            ];

        });
        const docDefinition: any = this.generateBundleStatePDF(repID);
        return docDefinition;
    }

    getBundleStateSummaryPDF(bundleStatePDFGroup2: any[][]) {

        // ## find style, zone , color   list
        let outsSummary: any[] = [];
        bundleStatePDFGroup2.forEach( (item, index) => {
            const bundles = item.length;
            const qty = +item.reduce((prev, cur) => {return prev + cur.productCount;}, 0);
            const groupNamePDF = item[0].groupNamePDF;
            const groupNameData = groupNamePDF.split(':');  // DBC48A4A:SGHI:BK
            const orderID = groupNameData[0];
            const setName = this.userService.getSetNameColorByOrderID(orderID);
            const targetPlaceID = groupNameData[1];
            const color = groupNameData[2];
            const colorCode = this.userService.getColorCodeByColorIDSetName(color, setName);
            const colorName = this.userService.getColorNameByColorCode(color, setName);
            const colorValue = this.userService.getColorValueByColorCode(color, setName);
            const outsSummary1: any = {groupNamePDF, setName, orderID, targetPlaceID, color, colorCode, colorName, colorValue, bundles, qty};
            outsSummary.push(outsSummary1);
        });
        // console.log(outsSummary);

        const contentsummary = [
            {
                // margin: [35, 0, 15, 0],
                style: 'tableExample',
                table: {  // ##
                    // widths: ['10%', '45%', '15%', '15%', '15%'],
                    widths: ['5%', '55%', '20%', '20%'],
                    headerRows: 1,
                    body: [
                        [
                            {text: 'No.', style: ['txtheadsize', 'marginHeadTop2'], alignment: 'center', fillColor: '#cccccc'},
                            {text: 'Style.', style: ['txtheadsize', 'marginHeadTop2'], alignment: 'center', fillColor: '#cccccc'},
                            // {text: 'Order total', style: ['txtheadsize', 'marginHeadTop2'], alignment: 'center', fillColor: '#cccccc'},
                            {text: 'Bundles.', style: ['txtheadsize', 'marginHeadTop2'], alignment: 'center', fillColor: '#cccccc'},
                            {text: 'Qty.', style: ['txtheadsize', 'marginHeadTop2'], alignment: 'center', fillColor: '#cccccc'},

                            // {text: '1.COM..', style: ['txtheadsize', 'marginHeadTop2'], alignment: 'center', fillColor: '#cccccc'},
                            // {text: '2.PANAL', style: ['txtheadsize', 'marginHeadTop2'], alignment: 'center', fillColor: '#cccccc'},
                            // {text: '3.LINKING', style: ['txtheadsize', 'marginHeadTop2'], alignment: 'center', fillColor: '#cccccc'},
                            // {text: '4.MENDING', style: ['txtheadsize', 'marginHeadTop2'], alignment: 'center', fillColor: '#cccccc'},
                            // {text: '5.WASHING', style: ['txtheadsize', 'marginHeadTop2'], alignment: 'center', fillColor: '#cccccc'},
                            // {text: '6.PRESSING', style: ['txtheadsize', 'marginHeadTop2'], alignment: 'center', fillColor: '#cccccc'},
                            // {text: '7.QC', style: ['txtheadsize', 'marginHeadTop2'], alignment: 'center', fillColor: '#cccccc'},
                        ],
                        ...this.getSummaryBodyPDF(outsSummary),  // ## body table
                    ]
                }
            },
        ];
        return contentsummary;
    }

    getSummaryBodyPDF(outsSummary: any[]) {
        let body1: any[] = []
        let bundleTotal = 0;
        let qtyTotal = 0;
        // {groupNamePDF, setName, orderID, targetPlaceID, color, colorCode, colorName, colorValue, bundles, qty};
        outsSummary.forEach( (item1, index1) => {
            bundleTotal = bundleTotal + +item1.bundles;
            qtyTotal = qtyTotal + +item1.qty;
            let row1: any[] = [];
            let row2: any[] = [];
            const orderIDTxt = item1.orderID + '    [ ' + item1.targetPlaceID + ' ]';
            const color1 = item1.colorCode + ' ' + item1.colorName;
            row1 = [
                {text: [{text: '', style: ['', ''], alignment: 'center'}], color: 'black', border: [true, true, true, false]},
                {text: [{text: orderIDTxt, style: ['', ''], alignment: 'left'}], color: 'black', border: [true, true, true, false]},
                {text: [{text: item1.bundles, style: ['', ''], alignment: 'center'}], color: 'black', border: [true, true, true, false]},
                {text: [{text: item1.qty, style: ['', ''], alignment: 'center'}], color: 'black', border: [true, true, true, false]},
            ];
            body1.push(row1);

            row2 = [
                {text: [{text: '', style: ['', ''], alignment: 'center'}], color: 'black', border: [true, false, true, true]},
                {text: [{text: '.   '+color1, style: ['txtSmall6', ''], alignment: 'left'}], color: 'black', border: [true, false, true, true]},
                {text: [{text: '', style: ['', ''], alignment: 'center'}], color: 'black', border: [true, false, true, true]},
                {text: [{text: '', style: ['', ''], alignment: 'center'}], color: 'black', border: [true, false, true, true]},
            ];
            body1.push(row2);
        });

        // ## line total
        let row1: any[] = [];
        let row2: any[] = [];
        row1 = [
            {text: [{text: '', style: ['', ''], alignment: 'center'}], color: 'black', border: [true, true, true, false]},
            {text: [{text: '', style: ['', ''], alignment: 'left'}], color: 'black', border: [true, true, true, false]},
            {text: [{text: '', style: ['', ''], alignment: 'center'}], color: 'black', border: [true, true, true, false]},
            {text: [{text: '', style: ['', ''], alignment: 'center'}], color: 'black', border: [true, true, true, false]},
        ];
        body1.push(row1);

        row2 = [
            {text: [{text: '', style: ['', ''], alignment: 'center'}], color: 'black', border: [true, false, true, true]},
            {text: [{text: 'Total', style: ['txtheadsize', ''], alignment: 'center'}], color: 'black', border: [true, false, true, true]},
            {text: [{text: bundleTotal, style: ['txtheadsize', ''], alignment: 'center'}], color: 'black', border: [true, false, true, true]},
            {text: [{text: qtyTotal, style: ['txtheadsize', ''], alignment: 'center'}], color: 'black', border: [true, false, true, true]},
        ];
        body1.push(row2);

        return body1;
    }

    getBundleStateHeaderPDF(data1: any) {
        const seasonYear = this.userService.seasonYear;
        // ## header top
        const datePrint = this.userService.returnDDMMYYYY(0,'-')
                        +' '
                        +this.userService.returnHHMM(0,':');
        const orderIDZone = 'Style : ' + data1.orderID+'/'+data1.zone;
        const colorTxt = 'Color : ' + data1.colorCode + '  ' + data1.colorName;
        const bundleTxt = 'Bundles : ' + data1.len;
        const date12 = data1.date12;
        const contentHeaderTop = [
            {columns: [
                // {text: 'Work in Process by Period  ['+targetPlaceID+'] / '+ seasonYear, style: ['', ''], alignment: 'center'},
                {text: orderIDZone, style: ['', '']},
				{text: colorTxt, style: ['', '']},
                {text: bundleTxt, style: ['', '']},
                {text: date12, style: ['', '']},
				// {text: 'date print: ' + datePrint, italics: true, fontSize: 6, alignment: 'right', margin: [0, 0, 15, 0]}
			]},  // , margin: [0, 5, 0, 10]
            // { text: yarnID, style: ['', ''], alignment: 'left', margin: [15, 0, 15, 0], },
        ];
        return contentHeaderTop;
    }

    getBundleStateTablePDF(bundleStatePDFGroup: any[]) {
        // let contentTableHeader: any[] = [];
        // ## 1.COMPUTER-KNITTING 2.PANAL-INSPECTION 3.LINKING 4.MENDING 5.WASHING 6.PRESSING 7.QC
        const contentTableHeader = [
            {
                // margin: [35, 0, 15, 0],
                style: 'tableExample',
                table: {  // ## 4                                        70
                    widths: ['7%', '12%', '6%', '5%'    , '10%', '10%', '10%', '10%', '10%', '10%', '10%'],
                    headerRows: 1,
                    body: [
                        [
                            {text: 'No.', style: ['txtheadsize', 'marginHeadTop2'], alignment: 'center', fillColor: '#cccccc'},
                            {text: 'BundleNo.', style: ['txtheadsize', 'marginHeadTop2'], alignment: 'center', fillColor: '#cccccc'},
                            {text: 'Size.', style: ['txtheadsize', 'marginHeadTop2'], alignment: 'center', fillColor: '#cccccc'},
                            {text: 'Qty.', style: ['txtheadsize', 'marginHeadTop2'], alignment: 'center', fillColor: '#cccccc'},

                            {text: '1.COM..', style: ['txtheadsize', 'marginHeadTop2'], alignment: 'center', fillColor: '#cccccc'},
                            {text: '2.PANAL', style: ['txtheadsize', 'marginHeadTop2'], alignment: 'center', fillColor: '#cccccc'},
                            {text: '3.LINKING', style: ['txtheadsize', 'marginHeadTop2'], alignment: 'center', fillColor: '#cccccc'},
                            {text: '4.MENDING', style: ['txtheadsize', 'marginHeadTop2'], alignment: 'center', fillColor: '#cccccc'},
                            {text: '5.WASHING', style: ['txtheadsize', 'marginHeadTop2'], alignment: 'center', fillColor: '#cccccc'},
                            {text: '6.PRESSING', style: ['txtheadsize', 'marginHeadTop2'], alignment: 'center', fillColor: '#cccccc'},
                            {text: '7.QC', style: ['txtheadsize', 'marginHeadTop2'], alignment: 'center', fillColor: '#cccccc'},
                        ],
                        ...this.getBundleStateTableBodyPDF(bundleStatePDFGroup),  // ## body table
                    ]
                }
            },
        ];
        return contentTableHeader;
    }

    getBundleStateTableBodyPDF(bundleStatePDFGroup: any[]) {
        let body1: any[] = []

        bundleStatePDFGroup.forEach( (item1, index1) => {
            let row1: any[] = [];
            row1 = [
                {text: [{text: item1.rowNo, style: ['', ''], alignment: 'center'}], color: 'black'},
                {text: [{text: item1.bundleNo, style: ['', ''], alignment: 'center'}], color: 'black'},
                {text: [{text: item1.size, style: ['', ''], alignment: 'center'}], color: 'black'},
                {text: [{text: item1.productCount, style: ['', ''], alignment: 'center'}], color: 'black'},

                {text: [{text: item1.knitting, style: ['', ''], alignment: 'center'}], color: 'black'},
                {text: [{text: item1.panal, style: ['', ''], alignment: 'center'}], color: 'black'},
                {text: [{text: item1.linking, style: ['', ''], alignment: 'center'}], color: 'black'},
                {text: [{text: item1.mending, style: ['', ''], alignment: 'center'}], color: 'black'},
                {text: [{text: item1.washing, style: ['', ''], alignment: 'center'}], color: 'black'},
                {text: [{text: item1.pressing, style: ['', ''], alignment: 'center'}], color: 'black'},
                {text: [{text: item1.qc, style: ['', ''], alignment: 'center'}], color: 'black'},

            ];
            body1.push(row1);
        });
        return body1;
    }

    generateBundleStatePDF(repCode: string) {
        const datePrint = this.userService.returnDDMMYYYY(0,'-')
                        +' '
                        +this.userService.returnHHMM(0,':');
        const style = {
            backgroundHead: {
                background: 'lightgray',
            },

            marginHeadTop7: {
                margin: [0, 7, 0, 0]
            },
            marginHeadTop3: {
                margin: [0, 3, 0, 0]
            },
            marginHeadTop2: {
                margin: [0, 2, 0, 0]
            },
            txtheadsize: {
                fontSize: 8,
                bold: true,
            },
            txtSmall8: {
                fontSize: 8,
            },
            txtSmall7: {
                fontSize: 7,
            },
            txtSmall6: {
                fontSize: 6,
            },

            txtBold: {
                bold: true,
            },

            color_white: {  // ## transparent
                color: 'white',
            },
        };
        const seasonYear = this.userService.seasonYear;
        let docDefinition: any = {
            pageSize: 'A4',
            pageMargins: [ 15, 20, 15, 30 ],
            // header: head2,
            // pageOrientation: 'portrait',
            // pageOrientation: 'portrait',
            content: this.contentBundleStatePDF,
            // pageBreakBefore: function(currentNode: any, followingNodesOnPage: any, nodesOnNextPage: any, previousNodesOnPage: any) {
            //     return currentNode.startPosition.top >= 770;
            // },
            // content: content1,
            // content: [content1, content1],
            // defaultStyle: {font: 'Roboto', fontSize: 10},
            // header: 'yarn-rep01',
            // header: {
            //     columns: [
            //         'yarn-rep01',
            //         '',
            //         {text: 'date print: ' + datePrint, italics: true, fontSize: 6, alignment: 'right'},
            //     ]
            // },


            header: {
                columns: [
                    {text: repCode+'/'+ seasonYear, italics: true, fontSize: 6, alignment: 'left', margin: [10, 2, 0, 0]},
                    '',
                    {text: 'date print: ' + datePrint, italics: true, fontSize: 6, alignment: 'right', margin: [1, 2, 10, 0]},
                ], margin: [35, 10, 15, 0]
            },

            footer: function(currentPage: any, pageCount: any) {
                return {
                    columns: [
                      '',
                      {text: repCode+'  , date print: ' + datePrint, italics: true, fontSize: 6, alignment: 'right'},
                      '',
                      { text: currentPage.toString() + ' of ' + pageCount, alignment: 'right' },
                      '',
                    ], margin: [35, 0, 15, 5]
                  };
            },
            defaultStyle: { fontSize: 8},
            styles: style,
        };

        // pdfMake.createPdf(docDefinition).open();
        return docDefinition;
    }




    productionZonePeriodFullRow: ProductionZonePeriodRow[] = []
    dataGroupFull: string[] = [];

    productionZonePeriodRow: ProductionZonePeriodRow[] = []
    dataGroup: string[] = [];
    contentProductionZonePeriodPDF: any[] = [];
    periodOrderIDOldHeader = '';
    dataPrintProductionZonePeriod: any = {};
    lineCountA = 0;
    linelimitA = 42; // ## more than 42 , have to new page

    prepareDataproductionZonePeriodPDF(productionZonePeriod: any[]) {
        this.dataGroup = [];
        this.productionZonePeriodRow = [];
        let productionZonePeriodRowBefore = GBC.clrProductionZonePeriodRow();

        let setNameGT = '';
        let dataGroupGT = '';
        let dataGroupGGT = '';
        let orderQTYGT = 0;
        let knittingGT = 0;
        let panalGT = 0;
        let linkingGT = 0;
        let mendingGT = 0;
        let washingGT = 0;
        let pressingGT = 0;
        let qcGT = 0;

        let dataGroupGOld = '';
        productionZonePeriod.forEach( (item, index) => {
            let productionZonePeriodRow1 = GBC.clrProductionZonePeriodRow();

            (item.color as any[]).forEach( (item2, index2) => {
                const dataGroup = item2.setName+':'+item.targetPlaceID+':'+item.orderID+':'+item2.colorCode; // ## check same orderID  and color
                const dataGroupG = item2.setName+':'+item.targetPlaceID+':'+item.orderID; // ## check same orderID
                this.dataGroup.push(dataGroup);
                dataGroupGT = dataGroup;
                dataGroupGGT = dataGroupG;
                setNameGT = item2.setName;

                // ## check new orderID data
                const checkHeader = this.productionZonePeriodRow.filter(i=>{i.dataGroup==dataGroup && i.rowState=='orderIDHead'});
                if (checkHeader.length === 0) { // ## add orderID header
                // if (dataGroupGOld !== dataGroupG) { // ## add orderID header
                    let productionZonePeriodRowH = GBC.clrProductionZonePeriodRow();
                    // ## 'orderIDHead', 'ht', 'd', 't', 'gt' // ht= head table  d= data detail , t= total line, gt= grand total of orderID
                    productionZonePeriodRowH.rowState = 'orderIDHead';
                    productionZonePeriodRowH.dataGroup = dataGroup;
                    productionZonePeriodRowH.dataGroupG = dataGroupG;
                    productionZonePeriodRowH.setName = item2.setName;
                    productionZonePeriodRowH.orderID = item.orderID;
                    productionZonePeriodRowH.targetPlaceID = item.targetPlaceID;
                    productionZonePeriodRowH.factoryName= item.factoryName2;
                    // productionZonePeriodRowH.orderID = item.orderID;
                    this.productionZonePeriodRow.push({...productionZonePeriodRowH});
                }
                // dataGroupGOld = dataGroupG;

                (item2.data as any[]).forEach( (item3, index3) => {
                    // ## 'orderIDHead', 'ht', 'd', 't', 'gt' // ht= head table  d= data detail , t= total line, gt= grand total of orderID
                    productionZonePeriodRow1.rowState = 'd';
                    productionZonePeriodRow1.dataGroup = dataGroup;
                    productionZonePeriodRow1.dataGroupG = dataGroupG;
                    productionZonePeriodRow1.orderID = item.orderID;
                    productionZonePeriodRow1.targetPlaceID = item.targetPlaceID;
                    productionZonePeriodRow1.setName = item2.setName;
                    productionZonePeriodRow1.colorCode = item2.colorCode;
                    productionZonePeriodRow1.colorName = item2.colorName;
                    productionZonePeriodRow1.size = item3.size;
                    productionZonePeriodRow1.sizeName = item3.sizeName;
                    productionZonePeriodRow1.orderQTY = item3.orderQTY;
                    productionZonePeriodRow1.knitting = item3.knitting;
                    productionZonePeriodRow1.panal = item3.panal;
                    productionZonePeriodRow1.linking = item3.linking;
                    productionZonePeriodRow1.mending = item3.mending;
                    productionZonePeriodRow1.washing = item3.washing;
                    productionZonePeriodRow1.pressing = item3.pressing;
                    productionZonePeriodRow1.qc = item3.qc;

                    this.productionZonePeriodRow.push({...productionZonePeriodRow1});
                });

                // ## add total line
                let productionZonePeriodRowT = GBC.clrProductionZonePeriodRow();
                // ## 'orderIDHead', 'ht', 'd', 't', 'gt' // ht= head table  d= data detail , t= total line, gt= grand total of orderID
                productionZonePeriodRowT.rowState = 't';
                productionZonePeriodRowT.dataGroup = dataGroup;
                productionZonePeriodRowT.dataGroupG = dataGroupG;
                productionZonePeriodRowT.orderID = item.orderID;
                productionZonePeriodRowT.targetPlaceID = item.targetPlaceID;
                productionZonePeriodRowT.setName = item2.setName;
                productionZonePeriodRowT.colorCode = item2.colorCode;
                productionZonePeriodRowT.colorName = item2.colorName;

                productionZonePeriodRowT.orderQTY = item2.totalOrderIDColor.orderQTYT==='0'?'':item2.totalOrderIDColor.orderQTYT;
                productionZonePeriodRowT.knitting = item2.totalOrderIDColor.knittingT==='0'?'':item2.totalOrderIDColor.knittingT;
                productionZonePeriodRowT.panal = item2.totalOrderIDColor.panalT==='0'?'':item2.totalOrderIDColor.panalT;
                productionZonePeriodRowT.linking = item2.totalOrderIDColor.linkingT==='0'?'':item2.totalOrderIDColor.linkingT;
                productionZonePeriodRowT.mending = item2.totalOrderIDColor.mendingT==='0'?'':item2.totalOrderIDColor.mendingT;
                productionZonePeriodRowT.washing = item2.totalOrderIDColor.washingT==='0'?'':item2.totalOrderIDColor.washingT;
                productionZonePeriodRowT.pressing = item2.totalOrderIDColor.pressingT==='0'?'':item2.totalOrderIDColor.pressingT;
                productionZonePeriodRowT.qc = item2.totalOrderIDColor.qcT==='0'?'':item2.totalOrderIDColor.qcT;

                // ## add to grand total
                let orderQTYGT1 = +item2.totalOrderIDColor.orderQTYT;
                let knittingGT1 = +item2.totalOrderIDColor.knittingT;
                let panalGT1 = +item2.totalOrderIDColor.panalT;
                let linkingGT1 = +item2.totalOrderIDColor.linkingT;
                let mendingGT1 = +item2.totalOrderIDColor.mendingT;
                let washingGT1 = +item2.totalOrderIDColor.washingT;
                let pressingGT1 = +item2.totalOrderIDColor.pressingT;
                let qcGT1 = +item2.totalOrderIDColor.qcT;

                orderQTYGT = orderQTYGT + orderQTYGT1;
                knittingGT = knittingGT + knittingGT1;
                panalGT = panalGT + panalGT1;
                linkingGT = linkingGT + linkingGT1;
                mendingGT = mendingGT + mendingGT1;
                washingGT = washingGT + washingGT1;
                pressingGT = pressingGT + pressingGT1;
                qcGT = qcGT + qcGT1;

                this.productionZonePeriodRow.push({...productionZonePeriodRowT});
            });

            // ## add row grand total  gt
            let productionZonePeriodRowGT = GBC.clrProductionZonePeriodRow();
            // ## 'orderIDHead', 'ht', 'd', 't', 'gt' // ht= head table  d= data detail , t= total line, gt= grand total of orderID
            productionZonePeriodRowGT.rowState = 'gt';
            productionZonePeriodRowGT.dataGroup = dataGroupGT;
            productionZonePeriodRowGT.dataGroupG = dataGroupGGT;
            productionZonePeriodRowGT.orderID = item.orderID;
            productionZonePeriodRowGT.targetPlaceID = item.targetPlaceID;
            productionZonePeriodRowGT.factoryName= item.factoryName2;
            productionZonePeriodRowGT.setName = setNameGT;

            productionZonePeriodRowGT.orderQTY = orderQTYGT+'';
            productionZonePeriodRowGT.knitting = knittingGT+'';
            productionZonePeriodRowGT.panal = panalGT+'';
            productionZonePeriodRowGT.linking = linkingGT+'';
            productionZonePeriodRowGT.mending = mendingGT+'';
            productionZonePeriodRowGT.washing = washingGT+'';
            productionZonePeriodRowGT.pressing = pressingGT+'';
            productionZonePeriodRowGT.qc = qcGT+'';

            this.productionZonePeriodRow.push({...productionZonePeriodRowGT});

            orderQTYGT = 0;
            knittingGT = 0;
            panalGT = 0;
            linkingGT = 0;
            mendingGT = 0;
            washingGT = 0;
            pressingGT = 0;
            qcGT = 0;

        });
        // console.log(this.dataGroup);
        // console.log(this.productionZonePeriodRow);
    }

    prepareDataproductionZonePeriodPDFFull(productionZonePeriod: any[]) {
        this.dataGroupFull = [];
        this.productionZonePeriodFullRow = [];
        let productionZonePeriodRowBefore = GBC.clrProductionZonePeriodRow();

        let setNameGT = '';
        let dataGroupGT = '';
        let dataGroupGGT = '';
        let orderQTYGT = 0;
        let knittingGT = 0;
        let panalGT = 0;
        let linkingGT = 0;
        let mendingGT = 0;
        let washingGT = 0;
        let pressingGT = 0;
        let qcGT = 0;

        let dataGroupGOld = '';
        productionZonePeriod.forEach( (item, index) => {
            let productionZonePeriodRow1 = GBC.clrProductionZonePeriodRow();

            (item.color as any[]).forEach( (item2, index2) => {
                const dataGroup = item2.setName+':'+item.targetPlaceID+':'+item.orderID+':'+item2.colorCode; // ## check same orderID  and color
                const dataGroupG = item2.setName+':'+item.targetPlaceID+':'+item.orderID; // ## check same orderID
                this.dataGroupFull.push(dataGroup);
                dataGroupGT = dataGroup;
                dataGroupGGT = dataGroupG;
                setNameGT = item2.setName;

                // ## check new orderID data
                const checkHeader = this.productionZonePeriodFullRow.filter(i=>{i.dataGroup==dataGroup && i.rowState=='orderIDHead'});
                if (checkHeader.length === 0) { // ## add orderID header
                // if (dataGroupGOld !== dataGroupG) { // ## add orderID header
                    let productionZonePeriodRowH = GBC.clrProductionZonePeriodRow();
                    // ## 'orderIDHead', 'ht', 'd', 't', 'gt' // ht= head table  d= data detail , t= total line, gt= grand total of orderID
                    productionZonePeriodRowH.rowState = 'orderIDHead';
                    productionZonePeriodRowH.dataGroup = dataGroup;
                    productionZonePeriodRowH.dataGroupG = dataGroupG;
                    productionZonePeriodRowH.setName = item2.setName;
                    productionZonePeriodRowH.orderID = item.orderID;
                    productionZonePeriodRowH.targetPlaceID = item.targetPlaceID;
                    productionZonePeriodRowH.factoryName= item.factoryName2;
                    // productionZonePeriodRowH.orderID = item.orderID;
                    this.productionZonePeriodFullRow.push({...productionZonePeriodRowH});
                }
                // dataGroupGOld = dataGroupG;

                (item2.data as any[]).forEach( (item3, index3) => {
                    // ## 'orderIDHead', 'ht', 'd', 't', 'gt' // ht= head table  d= data detail , t= total line, gt= grand total of orderID
                    productionZonePeriodRow1.rowState = 'd';
                    productionZonePeriodRow1.dataGroup = dataGroup;
                    productionZonePeriodRow1.dataGroupG = dataGroupG;
                    productionZonePeriodRow1.orderID = item.orderID;
                    productionZonePeriodRow1.targetPlaceID = item.targetPlaceID;
                    productionZonePeriodRow1.setName = item2.setName;
                    productionZonePeriodRow1.colorCode = item2.colorCode;
                    productionZonePeriodRow1.colorName = item2.colorName;
                    productionZonePeriodRow1.size = item3.size;
                    productionZonePeriodRow1.sizeName = item3.sizeName;
                    productionZonePeriodRow1.orderQTY = item3.orderQTY;
                    productionZonePeriodRow1.knitting = item3.knitting;
                    productionZonePeriodRow1.panal = item3.panal;
                    productionZonePeriodRow1.linking = item3.linking;
                    productionZonePeriodRow1.mending = item3.mending;
                    productionZonePeriodRow1.washing = item3.washing;
                    productionZonePeriodRow1.pressing = item3.pressing;
                    productionZonePeriodRow1.qc = item3.qc;

                    this.productionZonePeriodFullRow.push({...productionZonePeriodRow1});
                });

                // ## add total line
                let productionZonePeriodRowT = GBC.clrProductionZonePeriodRow();
                // ## 'orderIDHead', 'ht', 'd', 't', 'gt' // ht= head table  d= data detail , t= total line, gt= grand total of orderID
                productionZonePeriodRowT.rowState = 't';
                productionZonePeriodRowT.dataGroup = dataGroup;
                productionZonePeriodRowT.dataGroupG = dataGroupG;
                productionZonePeriodRowT.orderID = item.orderID;
                productionZonePeriodRowT.targetPlaceID = item.targetPlaceID;
                productionZonePeriodRowT.setName = item2.setName;
                productionZonePeriodRowT.colorCode = item2.colorCode;
                productionZonePeriodRowT.colorName = item2.colorName;

                productionZonePeriodRowT.orderQTY = item2.totalOrderIDColor.orderQTYT==='0'?'':item2.totalOrderIDColor.orderQTYT;
                productionZonePeriodRowT.knitting = item2.totalOrderIDColor.knittingT==='0'?'':item2.totalOrderIDColor.knittingT;
                productionZonePeriodRowT.panal = item2.totalOrderIDColor.panalT==='0'?'':item2.totalOrderIDColor.panalT;
                productionZonePeriodRowT.linking = item2.totalOrderIDColor.linkingT==='0'?'':item2.totalOrderIDColor.linkingT;
                productionZonePeriodRowT.mending = item2.totalOrderIDColor.mendingT==='0'?'':item2.totalOrderIDColor.mendingT;
                productionZonePeriodRowT.washing = item2.totalOrderIDColor.washingT==='0'?'':item2.totalOrderIDColor.washingT;
                productionZonePeriodRowT.pressing = item2.totalOrderIDColor.pressingT==='0'?'':item2.totalOrderIDColor.pressingT;
                productionZonePeriodRowT.qc = item2.totalOrderIDColor.qcT==='0'?'':item2.totalOrderIDColor.qcT;

                // ## add to grand total
                let orderQTYGT1 = +item2.totalOrderIDColor.orderQTYT;
                let knittingGT1 = +item2.totalOrderIDColor.knittingT;
                let panalGT1 = +item2.totalOrderIDColor.panalT;
                let linkingGT1 = +item2.totalOrderIDColor.linkingT;
                let mendingGT1 = +item2.totalOrderIDColor.mendingT;
                let washingGT1 = +item2.totalOrderIDColor.washingT;
                let pressingGT1 = +item2.totalOrderIDColor.pressingT;
                let qcGT1 = +item2.totalOrderIDColor.qcT;

                orderQTYGT = orderQTYGT + orderQTYGT1;
                knittingGT = knittingGT + knittingGT1;
                panalGT = panalGT + panalGT1;
                linkingGT = linkingGT + linkingGT1;
                mendingGT = mendingGT + mendingGT1;
                washingGT = washingGT + washingGT1;
                pressingGT = pressingGT + pressingGT1;
                qcGT = qcGT + qcGT1;

                this.productionZonePeriodFullRow.push({...productionZonePeriodRowT});
            });

            // ## add row grand total  gt
            let productionZonePeriodRowGT = GBC.clrProductionZonePeriodRow();
            // ## 'orderIDHead', 'ht', 'd', 't', 'gt' // ht= head table  d= data detail , t= total line, gt= grand total of orderID
            productionZonePeriodRowGT.rowState = 'gt';
            productionZonePeriodRowGT.dataGroup = dataGroupGT;
            productionZonePeriodRowGT.dataGroupG = dataGroupGGT;
            productionZonePeriodRowGT.orderID = item.orderID;
            productionZonePeriodRowGT.targetPlaceID = item.targetPlaceID;
            productionZonePeriodRowGT.factoryName= item.factoryName2;
            productionZonePeriodRowGT.setName = setNameGT;

            productionZonePeriodRowGT.orderQTY = orderQTYGT+'';
            productionZonePeriodRowGT.knitting = knittingGT+'';
            productionZonePeriodRowGT.panal = panalGT+'';
            productionZonePeriodRowGT.linking = linkingGT+'';
            productionZonePeriodRowGT.mending = mendingGT+'';
            productionZonePeriodRowGT.washing = washingGT+'';
            productionZonePeriodRowGT.pressing = pressingGT+'';
            productionZonePeriodRowGT.qc = qcGT+'';

            this.productionZonePeriodFullRow.push({...productionZonePeriodRowGT});

            orderQTYGT = 0;
            knittingGT = 0;
            panalGT = 0;
            linkingGT = 0;
            mendingGT = 0;
            washingGT = 0;
            pressingGT = 0;
            qcGT = 0;

        });
        // console.log(this.dataGroupFull);
        // console.log(this.productionZonePeriodFullRow);
    }

    // ## modePDF = 'zone' , 'zone-total'
    productionZonePeriodPDF(modePDF: string, productionZonePeriod: any[], productionZonePeriodFull: any[], dataPrint: any) {
        // console.log(productionZonePeriod);
        // console.log(productionZonePeriodFull);
        // console.log(dataPrint);
        // console.log('modePDF = ' , modePDF);
        this.dataPrintProductionZonePeriod = dataPrint;

        this.periodOrderIDOldHeader = '';
        this.contentProductionZonePeriodPDF = [];
        const next1 = this.prepareDataproductionZonePeriodPDF(productionZonePeriod);
        const next2 = this.prepareDataproductionZonePeriodPDFFull(productionZonePeriodFull);
        const targetPlaceID = productionZonePeriod[0].targetPlaceID;

        let docDefinition: any = {};

        if (modePDF === 'zone') {
            // ## get header PDF
            const contentPeriodHeaderTop = this.getPeriodHeaderPDF(targetPlaceID);

            // ## get body pdf
            const contentPeriodTable = this.getPeriodTablePDF(this.productionZonePeriodRow);

            const pageBrake: any[] = [{text: '', pageBreak: 'after', style: ['']}];
            this.contentProductionZonePeriodPDF = [
                ...this.contentProductionZonePeriodPDF,
                ...contentPeriodHeaderTop,
                ...contentPeriodTable,
            ];
            docDefinition = this.generatePeriodPDF(targetPlaceID);
            return docDefinition;
        } else if (modePDF === 'zone-total') {
            // ## get header PDF
            const contentPeriodHeaderTop = this.getPeriodHeaderPDF2(targetPlaceID);

            // ## get body pdf
            const contentPeriodTable = this.getPeriodTablePDF2(this.productionZonePeriodRow);

            const pageBrake: any[] = [{text: '', pageBreak: 'after', style: ['']}];
            this.contentProductionZonePeriodPDF = [
                ...this.contentProductionZonePeriodPDF,
                ...contentPeriodHeaderTop,
                ...contentPeriodTable,
            ];
            docDefinition = this.generatePeriodPDF(targetPlaceID);

            return docDefinition;
        } else {
            return docDefinition;
        }
        return docDefinition;
    }

    getPeriodHeaderPDF2(targetPlaceID:  string) {
        const seasonYear = this.userService.seasonYear;
        // ## header top
        const datePrint = this.userService.returnDDMMYYYY(0,'-')
                        +' '
                        +this.userService.returnHHMM(0,':');
        //

        // const headerF = productionZonePeriod.filter(i=>i.rowState==='orderIDHead')[0];
        // const headerTxt = '['+targetPlaceID+']  '+ headerF.factoryName + '  .  ' + headerF.orderID;
        const headerTxt2 = '['+targetPlaceID+']  '
                        + ' . '
                        + seasonYear
                        + '   .   '
                        + this.dataPrintProductionZonePeriod.groupScanID
                        + '     '
                        + this.dataPrintProductionZonePeriod.date12


        const contentHeaderTop = [
            {columns: [
                // {text: 'Work in Process by Period  ['+targetPlaceID+'] / '+ seasonYear, style: ['', ''], alignment: 'center'},
                {text: headerTxt2, style: ['', '']},
				// {text: '', style: ['', '']},
                // {text: '', style: ['', '']},
				// {text: 'date print: ' + datePrint, italics: true, fontSize: 6, alignment: 'right', margin: [0, 0, 15, 0]}
			]},  // , margin: [0, 5, 0, 10]
            // { text: yarnID, style: ['', ''], alignment: 'left', margin: [15, 0, 15, 0], },
        ];
        return contentHeaderTop;
    }

    getPeriodTablePDF2(productionZonePeriodRow: any[]) {
        let contentTableHeader: any[] = [];
        let body1: any[] = [];
        // console.log(productionZonePeriodRow);
        // console.log(this.dataGroup);
        const productionZonePeriodRowT = productionZonePeriodRow.filter(i=>i.rowState=='gt');


        let rowHT: any[] = [];
        rowHT = [
            // ## check line counter for new page here  /  pageBreak: this.lineCountA <= this.linelimitA?'':'before'
            // {text: 'color', pageBreak: this.lineCountA <= this.linelimitA?'':'before', style: ['txtheadsize', 'marginHeadTop2'], alignment: 'center'},
            // {text: 'size', pageBreak: this.lineCountA <= this.linelimitA?'':'before', style: ['txtheadsize', 'marginHeadTop2'], alignment: 'center'},
            {text: 'Fac.Style', pageBreak: this.lineCountA <= this.linelimitA?'':'before', style: ['txtheadsize', 'marginHeadTop2'], alignment: 'center', fillColor: '#cccccc'},
            {text: 'orderQTY', pageBreak: this.lineCountA <= this.linelimitA?'':'before', style: ['txtheadsize', 'marginHeadTop2'], alignment: 'center', fillColor: '#cccccc'},
            {text: 'knitting', pageBreak: this.lineCountA <= this.linelimitA?'':'before', style: ['txtheadsize', 'marginHeadTop2'], alignment: 'center', fillColor: '#cccccc'},
            {text: 'panal', pageBreak: this.lineCountA <= this.linelimitA?'':'before', style: ['txtheadsize', 'marginHeadTop2'], alignment: 'center', fillColor: '#cccccc'},
            {text: 'linking', pageBreak: this.lineCountA <= this.linelimitA?'':'before', style: ['txtheadsize', 'marginHeadTop2'], alignment: 'center', fillColor: '#cccccc'},
            {text: 'mending', pageBreak: this.lineCountA <= this.linelimitA?'':'before', style: ['txtheadsize', 'marginHeadTop2'], alignment: 'center', fillColor: '#cccccc'},
            {text: 'washing', pageBreak: this.lineCountA <= this.linelimitA?'':'before', style: ['txtheadsize', 'marginHeadTop2'], alignment: 'center', fillColor: '#cccccc'},
            {text: 'pressing', pageBreak: this.lineCountA <= this.linelimitA?'':'before', style: ['txtheadsize', 'marginHeadTop2'], alignment: 'center', fillColor: '#cccccc'},
            {text: 'QC', pageBreak: this.lineCountA <= this.linelimitA?'':'before', style: ['txtheadsize', 'marginHeadTop2'], alignment: 'center', fillColor: '#cccccc'},
        ];
        // body1.push(rowHT);

        contentTableHeader = [
            {
                style: 'tableExample',
                table: {
                    widths: ['15%', '8%', '11%', '11%', '11%', '11%', '11%', '11%', '11%'],
                    body: [
                        rowHT,  // ## header

                        // ##  body
                        ...this.getPeriodBodyPDF2(productionZonePeriodRowT),  // ## body
                    ]
                }
            },
        ];

        return contentTableHeader;
    }

    getPeriodBodyPDF2(productionZonePeriod: any[]) {
        let body1: any[] = [];

        function getEmptyTo0(num1: string|number,) {
            if (num1+'' === '') {
                return 0;
            }
            return num1;
        }

        let knittingGT = 0;
        let panalGT = 0;
        let linkingGT = 0;
        let mendingGT = 0;
        let washingGT = 0;
        let pressingGT = 0;
        let qcGT = 0;

        productionZonePeriod.forEach( (item1, index1) => {
            knittingGT = knittingGT + +item1.knitting;
            panalGT = panalGT + +item1.panal;
            linkingGT = linkingGT + +item1.linking;
            mendingGT = mendingGT + +item1.mending;
            washingGT = washingGT + +item1.washing;
            pressingGT = pressingGT + +item1.pressing;
            qcGT = qcGT + +item1.qc;
            let rowT: any[] = [];
            const facStyle = item1.factoryName + ' . ' + item1.orderID;
            const dummy1 = ' / xxxxxx';
            rowT = [
                {text: [{text: facStyle, style: ['', 'txtBold'], alignment: 'center'}], color: 'black'},
                // {text: 'orderQTY', style: ['txtheadsize', 'marginHeadTop2'], alignment: 'center'},
                // {text: [{text: '', style: ['', ''], alignment: 'center'}], color: 'black', fillColor: '#cccccc'},
                // {text: [{text: getEmptyTo0(productionZonePeriodGT1.orderQTY), style: ['', 'txtBold'], alignment: 'right'}], color: 'black', fillColor: '#cccccc'},
                {text: [
                    {text: getEmptyTo0(item1.orderQTY), style: ['', 'txtBold'], alignment: 'right'}
                ], color: 'black'},
                {text: [
                    {text: getEmptyTo0(item1.knitting), style: ['', 'txtBold'], alignment: 'right'},
                    // {text: dummy1, style: ['txtSmall5', ''], alignment: 'right'},
                ], color: 'black'},
                {text: [
                    {text: getEmptyTo0(item1.panal), style: ['', 'txtBold'], alignment: 'right'},
                    // {text: dummy1, style: ['txtSmall5', ''], alignment: 'right'},
                ], color: 'black'},
                {text: [
                    {text: getEmptyTo0(item1.linking), style: ['', 'txtBold'], alignment: 'right'},
                    // {text: dummy1, style: ['txtSmall5', ''], alignment: 'right'},
                ], color: 'black'},
                {text: [
                    {text: getEmptyTo0(item1.mending), style: ['', 'txtBold'], alignment: 'right'},
                    // {text: dummy1, style: ['txtSmall5', ''], alignment: 'right'},
                ], color: 'black'},
                {text: [
                    {text: getEmptyTo0(item1.washing), style: ['', 'txtBold'], alignment: 'right'},
                    // {text: dummy1, style: ['txtSmall5', ''], alignment: 'right'},
                ], color: 'black'},
                {text: [
                    {text: getEmptyTo0(item1.pressing), style: ['', 'txtBold'], alignment: 'right'},
                    // {text: dummy1, style: ['txtSmall5', ''], alignment: 'right'},
                ], color: 'black'},
                {text: [
                    {text: getEmptyTo0(item1.qc), style: ['', 'txtBold'], alignment: 'right'},
                    // {text: dummy1, style: ['txtSmall5', ''], alignment: 'right'},
                ], color: 'black'},

            ];
            body1.push(rowT);
        });

        // let knittingGT = 0;
        // let panalGT = 0;
        // let linkingGT = 0;
        // let mendingGT = 0;
        // let washingGT = 0;
        // let pressingGT = 0;
        // let qcGT = 0;
        let rowGT: any[] = [];
        rowGT = [
            {text: [{text: 'Total', style: ['', 'txtBold'], alignment: 'center'}], colSpan: 2, color: 'black'},
            {},
            {text: [
                {text: getEmptyTo0(knittingGT), style: ['', 'txtBold'], alignment: 'right'},
                // {text: dummy1, style: ['txtSmall5', ''], alignment: 'right'},
            ], color: 'black'},
            {text: [
                {text: getEmptyTo0(panalGT), style: ['', 'txtBold'], alignment: 'right'},
                // {text: dummy1, style: ['txtSmall5', ''], alignment: 'right'},
            ], color: 'black'},
            {text: [
                {text: getEmptyTo0(linkingGT), style: ['', 'txtBold'], alignment: 'right'},
                // {text: dummy1, style: ['txtSmall5', ''], alignment: 'right'},
            ], color: 'black'},
            {text: [
                {text: getEmptyTo0(mendingGT), style: ['', 'txtBold'], alignment: 'right'},
                // {text: dummy1, style: ['txtSmall5', ''], alignment: 'right'},
            ], color: 'black'},
            {text: [
                {text: getEmptyTo0(washingGT), style: ['', 'txtBold'], alignment: 'right'},
                // {text: dummy1, style: ['txtSmall5', ''], alignment: 'right'},
            ], color: 'black'},
            {text: [
                {text: getEmptyTo0(pressingGT), style: ['', 'txtBold'], alignment: 'right'},
                // {text: dummy1, style: ['txtSmall5', ''], alignment: 'right'},
            ], color: 'black'},
            {text: [
                {text: getEmptyTo0(qcGT), style: ['', 'txtBold'], alignment: 'right'},
                // {text: dummy1, style: ['txtSmall5', ''], alignment: 'right'},
            ], color: 'black'},

        ];
        body1.push(rowGT);



        // const headerF = productionZonePeriod.filter(i=>i.rowState==='orderIDHead')[0];
        // // console.log(headerF.orderID, this.lineCountA);
        // // ## add row head table
        // let rowHT: any[] = [];
        // rowHT = [
        //     // ## check line counter for new page here  /  pageBreak: this.lineCountA <= this.linelimitA?'':'before'
        //     {text: 'color', pageBreak: this.lineCountA <= this.linelimitA?'':'before', style: ['txtheadsize', 'marginHeadTop2'], alignment: 'center'},
        //     {text: 'size', pageBreak: this.lineCountA <= this.linelimitA?'':'before', style: ['txtheadsize', 'marginHeadTop2'], alignment: 'center'},
        //     {text: 'orderQTY', pageBreak: this.lineCountA <= this.linelimitA?'':'before', style: ['txtheadsize', 'marginHeadTop2'], alignment: 'center'},
        //     {text: 'knitting', pageBreak: this.lineCountA <= this.linelimitA?'':'before', style: ['txtheadsize', 'marginHeadTop2'], alignment: 'center'},
        //     {text: 'panal', pageBreak: this.lineCountA <= this.linelimitA?'':'before', style: ['txtheadsize', 'marginHeadTop2'], alignment: 'center'},
        //     {text: 'linking', pageBreak: this.lineCountA <= this.linelimitA?'':'before', style: ['txtheadsize', 'marginHeadTop2'], alignment: 'center'},
        //     {text: 'mending', pageBreak: this.lineCountA <= this.linelimitA?'':'before', style: ['txtheadsize', 'marginHeadTop2'], alignment: 'center'},
        //     {text: 'washing', pageBreak: this.lineCountA <= this.linelimitA?'':'before', style: ['txtheadsize', 'marginHeadTop2'], alignment: 'center'},
        //     {text: 'pressing', pageBreak: this.lineCountA <= this.linelimitA?'':'before', style: ['txtheadsize', 'marginHeadTop2'], alignment: 'center'},
        //     {text: 'QC', pageBreak: this.lineCountA <= this.linelimitA?'':'before', style: ['txtheadsize', 'marginHeadTop2'], alignment: 'center'},
        // ];
        // body1.push(rowHT);
        // this.lineCountA++;  // ## line counter

        // function getColor(idx: number, colorCode: string, colorName: string, lenD: number) {
        //     if (idx === 0) {
        //         return {rowSpan: lenD, text: [{text: colorCode +' '+colorName, style: ['', ''], alignment: 'center'}], color: 'black'};
        //     }
        //     return {text: [{text: '', style: ['', ''], alignment: 'center'}]};
        // }



        // function getBlankRowAndLine() {
        //     return [
        //         {text: ' ', style: ['', ''], colSpan: 10, border: [false, false, false, false]},{},{},{},{},{},{},{},{},{},
        //     ];
        // }

        // // console.log(productionZonePeriod);
        // const productionZonePeriod1 = [...productionZonePeriod];
        // const productionZonePeriod2 = [...productionZonePeriod];
        // const productionZonePeriod3 = [...productionZonePeriod];
        // // console.log(productionZonePeriod1);
        // const productionZonePeriodD = productionZonePeriod1.filter(i=>i.rowState==='d'); // ## find data detail row
        // const lenD = productionZonePeriodD.length;
        // const productionZonePeriodT = productionZonePeriod2.filter(i=>i.rowState==='t')[0]; // ## find total row
        // const productionZonePeriodGT = productionZonePeriod3.filter(i=>i.rowState==='gt'); // ## find grand total row
        // // console.log(productionZonePeriodD.length, productionZonePeriodD);
        // const colorCode = productionZonePeriodD[0].colorCode?productionZonePeriodD[0].colorCode:'';
        // const colorName = productionZonePeriodD[0].colorName?productionZonePeriodD[0].colorName:'';

        // productionZonePeriodD.forEach( (item1, index1) => {
        //     let row1: any[] = [];
        //     row1 = [
        //         getColor(index1, colorCode, colorName, lenD),
        //         {text: [{text: item1.sizeName, style: ['', ''], alignment: 'center'}], color: 'black'},
        //         {text: [{text: item1.orderQTY, style: ['', ''], alignment: 'right'}], color: 'black'},
        //         {text: [{text: item1.knitting, style: ['', ''], alignment: 'right'}], color: 'black'},
        //         {text: [{text: item1.panal, style: ['', ''], alignment: 'right'}], color: 'black'},
        //         {text: [{text: item1.linking, style: ['', ''], alignment: 'right'}], color: 'black'},
        //         {text: [{text: item1.mending, style: ['', ''], alignment: 'right'}], color: 'black'},
        //         {text: [{text: item1.washing, style: ['', ''], alignment: 'right'}], color: 'black'},
        //         {text: [{text: item1.pressing, style: ['', ''], alignment: 'right'}], color: 'black'},
        //         {text: [{text: item1.qc, style: ['', ''], alignment: 'right'}], color: 'black'},

        //     ];
        //     body1.push(row1);
        //     this.lineCountA++; // ## line counter
        // });

        // // ## add line total
        // let rowT: any[] = [];
        // rowT = [
        //     {text: [{text: 'Total', style: ['', 'txtBold'], alignment: 'center'}], color: 'black', fillColor: '#e6e6e6'},
        //     {text: [{text: '', style: ['', ''], alignment: 'center'}], color: 'black', fillColor: '#e6e6e6'},
        //     {text: [{text: getEmptyTo0(productionZonePeriodT.orderQTY), style: ['', 'txtBold'], alignment: 'right'}], color: 'black', fillColor: '#e6e6e6'},
        //     {text: [{text: getEmptyTo0(productionZonePeriodT.knitting), style: ['', 'txtBold'], alignment: 'right'}], color: 'black', fillColor: '#e6e6e6'},
        //     {text: [{text: getEmptyTo0(productionZonePeriodT.panal), style: ['', 'txtBold'], alignment: 'right'}], color: 'black', fillColor: '#e6e6e6'},
        //     {text: [{text: getEmptyTo0(productionZonePeriodT.linking), style: ['', 'txtBold'], alignment: 'right'}], color: 'black', fillColor: '#e6e6e6'},
        //     {text: [{text: getEmptyTo0(productionZonePeriodT.mending), style: ['', 'txtBold'], alignment: 'right'}], color: 'black', fillColor: '#e6e6e6'},
        //     {text: [{text: getEmptyTo0(productionZonePeriodT.washing), style: ['', 'txtBold'], alignment: 'right'}], color: 'black', fillColor: '#e6e6e6'},
        //     {text: [{text: getEmptyTo0(productionZonePeriodT.pressing), style: ['', 'txtBold'], alignment: 'right'}], color: 'black', fillColor: '#e6e6e6'},
        //     {text: [{text: getEmptyTo0(productionZonePeriodT.qc), style: ['', 'txtBold'], alignment: 'right'}], color: 'black', fillColor: '#e6e6e6'},

        // ];
        // body1.push(rowT);
        // this.lineCountA++;  // ## line counter

        // // ## add row grandtotal
        // if (productionZonePeriodGT.length > 0) {
        //     const productionZonePeriodGT1 = productionZonePeriodGT[0];
        //     let rowGT: any[] = [];
        //     rowGT = [
        //         {text: [{text: 'Grand total', style: ['', 'txtBold'], alignment: 'center'}], color: 'black', fillColor: '#cccccc'},
        //         {text: [{text: '', style: ['', ''], alignment: 'center'}], color: 'black', fillColor: '#cccccc'},
        //         {text: [{text: getEmptyTo0(productionZonePeriodGT1.orderQTY), style: ['', 'txtBold'], alignment: 'right'}], color: 'black', fillColor: '#cccccc'},
        //         {text: [{text: getEmptyTo0(productionZonePeriodGT1.knitting), style: ['', 'txtBold'], alignment: 'right'}], color: 'black', fillColor: '#cccccc'},
        //         {text: [{text: getEmptyTo0(productionZonePeriodGT1.panal), style: ['', 'txtBold'], alignment: 'right'}], color: 'black', fillColor: '#cccccc'},
        //         {text: [{text: getEmptyTo0(productionZonePeriodGT1.linking), style: ['', 'txtBold'], alignment: 'right'}], color: 'black', fillColor: '#cccccc'},
        //         {text: [{text: getEmptyTo0(productionZonePeriodGT1.mending), style: ['', 'txtBold'], alignment: 'right'}], color: 'black', fillColor: '#cccccc'},
        //         {text: [{text: getEmptyTo0(productionZonePeriodGT1.washing), style: ['', 'txtBold'], alignment: 'right'}], color: 'black', fillColor: '#cccccc'},
        //         {text: [{text: getEmptyTo0(productionZonePeriodGT1.pressing), style: ['', 'txtBold'], alignment: 'right'}], color: 'black', fillColor: '#cccccc'},
        //         {text: [{text: getEmptyTo0(productionZonePeriodGT1.qc), style: ['', 'txtBold'], alignment: 'right'}], color: 'black', fillColor: '#cccccc'},

        //     ];
        //     body1.push(rowGT);
        //     // body1.push(getBlankRowAndLine());
        //     // body1.push(getBlankRowAndLine());
        // }




        return body1;
    }

    getPeriodHeaderPDF(targetPlaceID:  string) {
        const seasonYear = this.userService.seasonYear;
        // ## header top
        const datePrint = this.userService.returnDDMMYYYY(0,'-')
                        +' '
                        +this.userService.returnHHMM(0,':');
        const contentHeaderTop = [
            {columns: [
                // {text: 'Work in Process by Period  ['+targetPlaceID+'] / '+ seasonYear, style: ['', ''], alignment: 'center'},
                {text: ' ', style: ['', '']},
				{text: '', style: ['', '']},
                {text: '', style: ['', '']},
				// {text: 'date print: ' + datePrint, italics: true, fontSize: 6, alignment: 'right', margin: [0, 0, 15, 0]}
			]},  // , margin: [0, 5, 0, 10]
            // { text: yarnID, style: ['', ''], alignment: 'left', margin: [15, 0, 15, 0], },
        ];
        return contentHeaderTop;
    }

    getPeriodTablePDF(productionZonePeriodRow: any[]) {
        let contentX: any[] = [];
        // console.log(productionZonePeriodRow);
        // console.log(this.dataGroup);

        this.dataGroup.forEach( (item1, index1) => {
            // console.log(item1);
            const isFirstPage = index1===0;
            const productionZonePeriod1 = productionZonePeriodRow.filter(i=>i.dataGroup==item1);
            const contentPeriod1: any[] = this.genPeriodTablePDF(productionZonePeriod1, isFirstPage);
            contentX.push(...contentPeriod1);
        });
        return contentX;
    }

    genPeriodTablePDF(productionZonePeriod: any[], isFirstPage: boolean) {
        // console.log(productionZonePeriod);
        // this.periodOrderIDOldHeader = '';
        // this.dataPrintProductionZonePeriod

        const headerF = productionZonePeriod.filter(i=>i.rowState==='orderIDHead')[0];
        const headerTxt = '['+headerF.targetPlaceID+']  '+ headerF.factoryName + '  .  ' + headerF.orderID;
        const headerTxt2 = this.dataPrintProductionZonePeriod.groupScanID
                        + '     '
                        + this.dataPrintProductionZonePeriod.date12;

        let contentTableHeader: any[] = [];
        // ##  check orderid header exists show ?
        if (this.periodOrderIDOldHeader === headerF.orderID) { // ## exclude orderID header
            contentTableHeader = [
                {
                    style: 'tableExample',
                    table: {
                        widths: ['14%', '6%', '10%', '10%', '10%', '10%', '10%', '10%', '10%', '10%'],
                        body: [
                            // ##  body
                            ...this.getPeriodBodyPDF(productionZonePeriod),  // ## body
                        ]
                    }
                },
            ];
        } else {  // ## include orderID header
            // ## line counter   ################################################################################
            this.lineCountA = 1;  // ## line counter
            contentTableHeader = [
                {
                    style: 'tableExample',
                    table: {
                        widths: ['14%', '6%', '10%', '10%', '10%', '10%', '10%', '10%', '10%', '10%'],
                        body: [
                            [
                                {text: headerTxt, pageBreak: isFirstPage?'':'before', style: 'tableHeader', colSpan: 6, alignment: 'left', border: [true, true, false, true]},
                                {},{},{},{},{},
                                {text: headerTxt2, style: 'tableHeader', colSpan: 4, alignment: 'right', border: [false, true, true, true]},
                                {},{},{}
                            ],

                            // ##  body
                            ...this.getPeriodBodyPDF(productionZonePeriod),  // ## body
                        ]
                    }
                },
            ];
        }
        this.periodOrderIDOldHeader = headerF.orderID;

        return contentTableHeader;
    }

    getPeriodBodyPDF(productionZonePeriod: any[]) {
        let body1: any[] = [];

        const headerF = productionZonePeriod.filter(i=>i.rowState==='orderIDHead')[0];
        // console.log(headerF.orderID, this.lineCountA);
        // ## add row head table
        let rowHT: any[] = [];
        rowHT = [
            // ## check line counter for new page here  /  pageBreak: this.lineCountA <= this.linelimitA?'':'before'
            {text: 'color', pageBreak: this.lineCountA <= this.linelimitA?'':'before', style: ['txtheadsize', 'marginHeadTop2'], alignment: 'center'},
            {text: 'size', pageBreak: this.lineCountA <= this.linelimitA?'':'before', style: ['txtheadsize', 'marginHeadTop2'], alignment: 'center'},
            {text: 'orderQTY', pageBreak: this.lineCountA <= this.linelimitA?'':'before', style: ['txtheadsize', 'marginHeadTop2'], alignment: 'center'},
            {text: 'knitting', pageBreak: this.lineCountA <= this.linelimitA?'':'before', style: ['txtheadsize', 'marginHeadTop2'], alignment: 'center'},
            {text: 'panal', pageBreak: this.lineCountA <= this.linelimitA?'':'before', style: ['txtheadsize', 'marginHeadTop2'], alignment: 'center'},
            {text: 'linking', pageBreak: this.lineCountA <= this.linelimitA?'':'before', style: ['txtheadsize', 'marginHeadTop2'], alignment: 'center'},
            {text: 'mending', pageBreak: this.lineCountA <= this.linelimitA?'':'before', style: ['txtheadsize', 'marginHeadTop2'], alignment: 'center'},
            {text: 'washing', pageBreak: this.lineCountA <= this.linelimitA?'':'before', style: ['txtheadsize', 'marginHeadTop2'], alignment: 'center'},
            {text: 'pressing', pageBreak: this.lineCountA <= this.linelimitA?'':'before', style: ['txtheadsize', 'marginHeadTop2'], alignment: 'center'},
            {text: 'QC', pageBreak: this.lineCountA <= this.linelimitA?'':'before', style: ['txtheadsize', 'marginHeadTop2'], alignment: 'center'},
        ];
        body1.push(rowHT);
        this.lineCountA++;  // ## line counter

        function getColor(idx: number, colorCode: string, colorName: string, lenD: number) {
            if (idx === 0) {
                return {rowSpan: lenD, text: [{text: colorCode +' '+colorName, style: ['', ''], alignment: 'center'}], color: 'black'};
            }
            return {text: [{text: '', style: ['', ''], alignment: 'center'}]};
        }

        function getEmptyTo0(num1: string|number,) {
            if (num1+'' === '') {
                return 0;
            }
            return num1;
        }

        function getBlankRowAndLine() {
            return [
                {text: ' ', style: ['', ''], colSpan: 10, border: [false, false, false, false]},{},{},{},{},{},{},{},{},{},
            ];
        }

        // console.log(productionZonePeriod);
        const productionZonePeriod1 = [...productionZonePeriod];
        const productionZonePeriod2 = [...productionZonePeriod];
        const productionZonePeriod3 = [...productionZonePeriod];
        // console.log(productionZonePeriod1);
        const productionZonePeriodD = productionZonePeriod1.filter(i=>i.rowState==='d'); // ## find data detail row
        const lenD = productionZonePeriodD.length;
        const productionZonePeriodT = productionZonePeriod2.filter(i=>i.rowState==='t')[0]; // ## find total row
        const productionZonePeriodGT = productionZonePeriod3.filter(i=>i.rowState==='gt'); // ## find grand total row
        // console.log(productionZonePeriodD.length, productionZonePeriodD);
        const colorCode = productionZonePeriodD[0].colorCode?productionZonePeriodD[0].colorCode:'';
        const colorName = productionZonePeriodD[0].colorName?productionZonePeriodD[0].colorName:'';

        productionZonePeriodD.forEach( (item1, index1) => {
            let row1: any[] = [];
            row1 = [
                getColor(index1, colorCode, colorName, lenD),
                {text: [{text: item1.sizeName, style: ['', ''], alignment: 'center'}], color: 'black'},
                {text: [{text: item1.orderQTY, style: ['', ''], alignment: 'right'}], color: 'black'},
                {text: [{text: item1.knitting, style: ['', ''], alignment: 'right'}], color: 'black'},
                {text: [{text: item1.panal, style: ['', ''], alignment: 'right'}], color: 'black'},
                {text: [{text: item1.linking, style: ['', ''], alignment: 'right'}], color: 'black'},
                {text: [{text: item1.mending, style: ['', ''], alignment: 'right'}], color: 'black'},
                {text: [{text: item1.washing, style: ['', ''], alignment: 'right'}], color: 'black'},
                {text: [{text: item1.pressing, style: ['', ''], alignment: 'right'}], color: 'black'},
                {text: [{text: item1.qc, style: ['', ''], alignment: 'right'}], color: 'black'},

            ];
            body1.push(row1);
            this.lineCountA++; // ## line counter
        });

        // ## add line total
        let rowT: any[] = [];
        rowT = [
            {text: [{text: 'Total', style: ['', 'txtBold'], alignment: 'center'}], color: 'black', fillColor: '#e6e6e6'},
            {text: [{text: '', style: ['', ''], alignment: 'center'}], color: 'black', fillColor: '#e6e6e6'},
            {text: [{text: getEmptyTo0(productionZonePeriodT.orderQTY), style: ['', 'txtBold'], alignment: 'right'}], color: 'black', fillColor: '#e6e6e6'},
            {text: [{text: getEmptyTo0(productionZonePeriodT.knitting), style: ['', 'txtBold'], alignment: 'right'}], color: 'black', fillColor: '#e6e6e6'},
            {text: [{text: getEmptyTo0(productionZonePeriodT.panal), style: ['', 'txtBold'], alignment: 'right'}], color: 'black', fillColor: '#e6e6e6'},
            {text: [{text: getEmptyTo0(productionZonePeriodT.linking), style: ['', 'txtBold'], alignment: 'right'}], color: 'black', fillColor: '#e6e6e6'},
            {text: [{text: getEmptyTo0(productionZonePeriodT.mending), style: ['', 'txtBold'], alignment: 'right'}], color: 'black', fillColor: '#e6e6e6'},
            {text: [{text: getEmptyTo0(productionZonePeriodT.washing), style: ['', 'txtBold'], alignment: 'right'}], color: 'black', fillColor: '#e6e6e6'},
            {text: [{text: getEmptyTo0(productionZonePeriodT.pressing), style: ['', 'txtBold'], alignment: 'right'}], color: 'black', fillColor: '#e6e6e6'},
            {text: [{text: getEmptyTo0(productionZonePeriodT.qc), style: ['', 'txtBold'], alignment: 'right'}], color: 'black', fillColor: '#e6e6e6'},

        ];
        body1.push(rowT);
        this.lineCountA++;  // ## line counter

        // ## add row grandtotal
        if (productionZonePeriodGT.length > 0) {
            const productionZonePeriodGT1 = productionZonePeriodGT[0];
            let rowGT: any[] = [];
            rowGT = [
                {text: [{text: 'Grand total', style: ['', 'txtBold'], alignment: 'center'}], color: 'black', fillColor: '#cccccc'},
                {text: [{text: '', style: ['', ''], alignment: 'center'}], color: 'black', fillColor: '#cccccc'},
                {text: [{text: getEmptyTo0(productionZonePeriodGT1.orderQTY), style: ['', 'txtBold'], alignment: 'right'}], color: 'black', fillColor: '#cccccc'},
                {text: [{text: getEmptyTo0(productionZonePeriodGT1.knitting), style: ['', 'txtBold'], alignment: 'right'}], color: 'black', fillColor: '#cccccc'},
                {text: [{text: getEmptyTo0(productionZonePeriodGT1.panal), style: ['', 'txtBold'], alignment: 'right'}], color: 'black', fillColor: '#cccccc'},
                {text: [{text: getEmptyTo0(productionZonePeriodGT1.linking), style: ['', 'txtBold'], alignment: 'right'}], color: 'black', fillColor: '#cccccc'},
                {text: [{text: getEmptyTo0(productionZonePeriodGT1.mending), style: ['', 'txtBold'], alignment: 'right'}], color: 'black', fillColor: '#cccccc'},
                {text: [{text: getEmptyTo0(productionZonePeriodGT1.washing), style: ['', 'txtBold'], alignment: 'right'}], color: 'black', fillColor: '#cccccc'},
                {text: [{text: getEmptyTo0(productionZonePeriodGT1.pressing), style: ['', 'txtBold'], alignment: 'right'}], color: 'black', fillColor: '#cccccc'},
                {text: [{text: getEmptyTo0(productionZonePeriodGT1.qc), style: ['', 'txtBold'], alignment: 'right'}], color: 'black', fillColor: '#cccccc'},

            ];
            body1.push(rowGT);
            // body1.push(getBlankRowAndLine());
            // body1.push(getBlankRowAndLine());
        }

        return body1;
    }

    generatePeriodPDF(targetPlaceID: string) {
        const datePrint = this.userService.returnDDMMYYYY(0,'-')
                        +' '
                        +this.userService.returnHHMM(0,':');
        const style = {
            backgroundHead: {
                background: 'lightgray',
            },

            marginHeadTop7: {
                margin: [0, 7, 0, 0]
            },
            marginHeadTop3: {
                margin: [0, 3, 0, 0]
            },
            marginHeadTop2: {
                margin: [0, 2, 0, 0]
            },
            txtheadsize: {
                fontSize: 8,
                bold: true,
            },
            txtSmall8: {
                fontSize: 8,
            },
            txtSmall7: {
                fontSize: 7,
            },
            txtSmall6: {
                fontSize: 6,
            },
            txtSmall5: {
                fontSize: 5,
            },
            txtSmall4: {
                fontSize: 4,
            },

            txtBold: {
                bold: true,
            },

            color_white: {  // ## transparent
                color: 'white',
            },
        };
        const seasonYear = this.userService.seasonYear;
        let docDefinition: any = {
            pageSize: 'A4',
            pageMargins: [ 15, 20, 15, 30 ],
            // header: head2,
            // pageOrientation: 'portrait',
            // pageOrientation: 'portrait',
            content: this.contentProductionZonePeriodPDF,
            pageBreakBefore: function(currentNode: any, followingNodesOnPage: any, nodesOnNextPage: any, previousNodesOnPage: any) {
                return currentNode.startPosition.top >= 770;
            },
            // content: content1,
            // content: [content1, content1],
            // defaultStyle: {font: 'Roboto', fontSize: 10},
            // header: 'yarn-rep01',
            // header: {
            //     columns: [
            //         'yarn-rep01',
            //         '',
            //         {text: 'date print: ' + datePrint, italics: true, fontSize: 6, alignment: 'right'},
            //     ]
            // },


            header: {
                columns: [
                    {text: 'Work in Process by Period  ['+targetPlaceID+'] / '+ seasonYear, italics: true, fontSize: 6, alignment: 'left', margin: [10, 2, 0, 0]},
                    '',
                    {text: 'date print: ' + datePrint, italics: true, fontSize: 6, alignment: 'right', margin: [1, 2, 10, 0]},
                ], margin: [35, 10, 15, 0]
            },

            footer: function(currentPage: any, pageCount: any) {
                return {
                    columns: [
                      '',
                      {text: 'production-rep09  , date print: ' + datePrint, italics: true, fontSize: 6, alignment: 'right'},
                      '',
                      { text: currentPage.toString() + ' of ' + pageCount, alignment: 'right' },
                      '',
                    ], margin: [35, 0, 15, 5]
                  };
            },
            defaultStyle: { fontSize: 8},
            styles: style,
        };

        // pdfMake.createPdf(docDefinition).open();
        return docDefinition;
    }

    // ##   ########################################################
    // #######################################################################

}


