/* eslint-disable @typescript-eslint/member-ordering */
/* eslint-disable no-underscore-dangle */

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { Router } from '@angular/router';
import { DeviceDetectorService } from 'ngx-device-detector';

// import { LoadingController } from '@ionic/angular';

import { StorageService } from './storage.service';
import { UserService } from './user.service';
import { SocketIOService } from './socketio.service';
import { environment } from '../../environments/environment';

import { User, UserClass, AuthData, SigupData, UserGroupScan } from '../models/user.model';
import { ColorS, Company, DataAroundApp, Factory, GeneralInfo, ModeRes, ScreenInfo, SizeS, TokenSet } from '../models/app.model';
import { UCompany, UFactory } from '../models/user.model';
import { Product } from '../models/product.model';
import { BundleSetGroup, Customer, OrderProduction } from '../models/order.model';
import { StringDecoder } from 'string_decoder';
import { CompanyCurrentProductQtyAll, CurrentCompanyOrder, CurrentCompanyOrderStyleSize, CurrentCompanyOrderZoneStyleSize, CurrentCompanyProductQtyCountryAll, CurrentCompanyProductQtyCountryCSAll, CurrentCompanyProductQtyZoneAll, CurrentOrderStyle, CurrentProductQtyAllC, CurrentProductQtyAllCF, CurrentProductionBundleState, DataRQTYE, OrderProductCFNodeRep, OrderProductFacOutQTY, OrderProductFacOutStyleColorSizeQTY, OrderStyleColorSize, QueueInfoRep, RepDataFormat1, RepQTYEditList } from '../models/report.model';
import { BundleStatePDF } from '../models/reportpdf.model';
import { GBC } from '../global/const-global';
// import { MenuService } from './menu.service';
// import { debounceTime } from 'rxjs/operators';

const BACKEND_URL = environment.apiUrl + '/rep';
// const BACKEND_AESP = environment.aesP;

// ## user, language , getIP-real

@Injectable({
  providedIn: 'root'
})
export class ReportService {


    // private mailSignupVerifyListsUpdated = new Subject<{ success: boolean; message: any;}>();
    // private customersListsUpdated = new Subject<{ customers: Customer[]}>();
    // repCurrentProductionsCFNUpdated


    private repCurrentProductionsBundleStateCUpdated = new Subject<{
        currentProductionBundleState: CurrentProductionBundleState[],
        bundleStatePDF: BundleStatePDF[],
        product: Product
    }>();
    private repCurrentProductionsZonePeriodCUpdated = new Subject<{
        currentProductionZonePeriod: any[],
        currentProductionZonePeriodFake: any[],
        currentProductionZoneForLoss: any[],
        orderStyleColorSize: OrderStyleColorSize[],
        currentCompanyOrderZoneStyleSize: CurrentCompanyOrderZoneStyleSize[],
        repQTYEditList: RepQTYEditList[],

        currentProductionZonePeriodFull: any[],
        currentProductionZoneForLossFull: any[],
        repQTYEditListFull: RepQTYEditList[],

    }>();
    private repCurrentProductionsPeriodCUpdated = new Subject<{
        currentProductionPeriod: any[],
        currentProductionForLoss: any[],
        orderStyleColorSize: OrderStyleColorSize[],
        currentCompanyOrderStyleSize: CurrentCompanyOrderStyleSize[],

    }>();
    private repCurrentProductionsCFNUpdated = new Subject<{ currentProductAllDetailCFN: any[], countProductionsAll: number }>();
    private repCurrentProductQueueCFUpdated = new Subject<{ queueInfoRep: QueueInfoRep[], countProductionQueueAll: number }>();
    private repCurrentProductQtyCFNUpdated = new Subject<{ repListNameArr: string[], repDataFormat1: RepDataFormat1}>();
    private repCompanyOrderUpdated = new Subject<{
        orderStyleColorSize: OrderStyleColorSize[],
        currentCompanyOrder: CurrentCompanyOrder[];
        currentOrderStyle: CurrentOrderStyle[]
    }>();

    private repCompanyOrderOutsourceStateUpdated = new Subject<{
        orderIDArr: string[],
        orderProductFacOut: any[],
        orderProductFacReceive: any[],
        orderProductFac1BY1Out: any[],
        orderProductFac1BY1Receive: any[],
        dataOutsState: any[]
    }>();

    private repCompanyOrderOutsourceUpdated = new Subject<{
        orderIDs: string[],
        orderStyleColorSize: OrderStyleColorSize[],
        currentCompanyOrder: CurrentCompanyOrder[],
        currentOrderStyle: CurrentOrderStyle[],
        outsourcefactoryID: string[],
        orderProductFacOutQTY: OrderProductFacOutQTY[],
        orderProductFacOutRemainQTY: OrderProductFacOutQTY[],
        orderProductFacOutStyleColorSizeQTY: OrderProductFacOutStyleColorSizeQTY[],
        orderProductFacOutStyleColorSizeRemainQTY: OrderProductFacOutStyleColorSizeQTY[],
    }>();
    private repCurrentProductQtyAllCFUpdated = new Subject<{
        currentProductQtyAllC: CurrentProductQtyAllC[],
        currentProductQtyAllCF: CurrentProductQtyAllCF[],
        orderStyleColorSize: OrderStyleColorSize[]
    }>();
    private repCurrentProductQtyAllCFNodeUpdated = new Subject<{
        orderProductCFNodeRep: OrderProductCFNodeRep[]
    }>();

    private repCurrentProductQtyAllCFactoryUpdated = new Subject<{
        currentProductQtyAllCF: CurrentProductQtyAllCF[],
    }>();
    private repCurrentCompanyProductQtyAllUpdated = new Subject<{
        currentOrderStyle: CurrentOrderStyle[],
        currentCompanyOrderCountry: CurrentCompanyOrder[],
        currentCompanyOrderZone: CurrentCompanyOrder[],

        currentCompanyOrderZoneStyle: CurrentCompanyOrder[],
        currentCompanyOrderCountryStyle: CurrentCompanyOrder[],

        companyCurrentProductQtyAll: CompanyCurrentProductQtyAll[],
        companyCurrentProductQtyCompleteAll: CompanyCurrentProductQtyAll[],
        currentCompanyProductQtyZoneAll: CurrentCompanyProductQtyZoneAll[],
        currentCompanyProductQtyZoneCompleteAll: CurrentCompanyProductQtyZoneAll[],
        currentCompanyProductQtyCountryAll: CurrentCompanyProductQtyCountryAll[],
        currentCompanyProductQtyCountryCompleteAll: CurrentCompanyProductQtyCountryAll[],
        currentCompanyProductQtyCountryCSAll: CurrentCompanyProductQtyCountryCSAll[],
        currentCompanyProductQtyCountryCSCompleteAll: CurrentCompanyProductQtyCountryCSAll[],
        currentProductQtyAllC: CurrentProductQtyAllC[],
        currentProductQtyAllCompleteC: CurrentProductQtyAllC[],
        orderStyleColorSize: OrderStyleColorSize[]
    }>();
    private repCurrentProductQtyNodeUpdated = new Subject<{
        currentProductionNodeQty: any[]
    }>();

    private repCurrentCompanyProductOverviewUpdated = new Subject<{
        currentOrderStyle: CurrentOrderStyle[],
        currentFactoryOrder: any[],
        companyCurrentProductQtyAll: CompanyCurrentProductQtyAll[],
    }>();
    private repStaffScannedByDate12Updated = new Subject<{ xxx: string }>();
    private getRepQTYEditUpdated = new Subject<{ success: boolean }>();
    private getRepQTYEditListUpdated = new Subject<{ repQTYEditList: RepQTYEditList[] }>();



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





    setSizeSeq(sizes: SizeS[], orderStyleColorSize: OrderStyleColorSize[]): OrderStyleColorSize[] {
        orderStyleColorSize.forEach((item, index) => {
            // let size: SizeS;
            const sizeF = sizes.filter(i=>i.size.sizeID == item.productSize);
            if (sizeF.length > 0) {
                item.sizeSeq = sizeF[0].seq;
            } else {
                item.sizeSeq = -1;
            }
            // console.log(size);
            // console.log(item.productSize);
        });

        // orderStyleColorSize.sort((a,b)=>{
        //     return a.sizeSeq >b.sizeSeq?1:a.sizeSeq <b.sizeSeq?-1:0;
        // });
        orderStyleColorSize.sort((a,b)=>{
            return a.productColor >b.productColor?1:a.productColor <b.productColor?-1:0
            || a.sizeSeq >b.sizeSeq?1:a.sizeSeq <b.sizeSeq?-1:0
        });
        return orderStyleColorSize;
    }

    setColorSeq(colors: ColorS[], orderStyleColorSize: OrderStyleColorSize[]): OrderStyleColorSize[] {
        orderStyleColorSize.forEach((item, index) => {
            const colorF = colors.filter(i=>i.color.colorID == item.productColor);
            if (colorF.length > 0) {
                item.colorSeq = colorF[0].seq;
            } else {
                item.colorSeq = -1;
            }
            // console.log(color);
            // console.log(item.productColor);
        });

        // orderStyleColorSize.sort((a,b)=>{
        //     return a.sizeSeq >b.sizeSeq?1:a.sizeSeq <b.sizeSeq?-1:0;
        // });
        orderStyleColorSize.sort((a,b)=>{
            return a.productColor >b.productColor?1:a.productColor <b.productColor?-1:0
            || a.sizeSeq >b.sizeSeq?1:a.sizeSeq <b.sizeSeq?-1:0
        });
        return orderStyleColorSize;
    }

    setColorSeq2(colors: ColorS[], outsQTY: OrderProductFacOutStyleColorSizeQTY[]): OrderProductFacOutStyleColorSizeQTY[] {
        outsQTY.forEach((item, index) => {
            const colorF = colors.filter(i=>i.color.colorID == item.color);
            if (colorF.length > 0) {
                item.colorSeq = colorF[0].seq;
            } else {
                item.colorSeq = -1;
            }
            // console.log(color);
            // console.log(item.productColor);
        });

        // orderStyleColorSize.sort((a,b)=>{
        //     return a.sizeSeq >b.sizeSeq?1:a.sizeSeq <b.sizeSeq?-1:0;
        // });

        let outsQTY2: OrderProductFacOutStyleColorSizeQTY[] = [];
        outsQTY.forEach((item, index) => {
            const outsQTYF = outsQTY2.filter(i=>i.companyID == item.companyID
                && i.orderID == item.orderID
                // && i.targetPlace == item.targetPlace
                && i.color == item.color
                && i.size == item.size
            );
            if (outsQTYF.length === 0) {
                outsQTY2.push(item);
            }
        });

        outsQTY2.sort((a,b)=>{
            return a.color >b.color?1:a.color <b.color?-1:0
            || a.sizeSeq >b.sizeSeq?1:a.sizeSeq <b.sizeSeq?-1:0
        });
        return outsQTY2;
    }

    setAnySizeSeq(sizes: SizeS[], objectSize: any[]): any[] {
        objectSize.forEach((item, index) => {
            const size = sizes.filter(i=>i.size.sizeID == item.productSize)[0];
            // console.log(size);
            // console.log(item.productSize);
            item.sizeSeq = size.seq;
        });

        // orderStyleColorSize.sort((a,b)=>{
        //     return a.sizeSeq >b.sizeSeq?1:a.sizeSeq <b.sizeSeq?-1:0;
        // });
        objectSize.sort((a,b)=>{
            return a.productColor >b.productColor?1:a.productColor <b.productColor?-1:0
            || a.sizeSeq >b.sizeSeq?1:a.sizeSeq <b.sizeSeq?-1:0
        });
        return objectSize;
    }

    setAnyColorSeq(colors: ColorS[], objectColor: any[]): any[] {
        objectColor.forEach((item, index) => {
            // const color = colors.filter(i=>i.color.colorID == item.productColor)[0];
            const colorF = colors.filter(i=>i.color.colorID == item.productColor || i.color.colorID == item.color);
            if (colorF.length > 0) {
                item.colorSeq = colorF[0].seq;
            } else {
                item.colorSeq = -1;
            }
            // console.log(color);
            // console.log(item.productColor);
        });

        // orderStyleColorSize.sort((a,b)=>{
        //     return a.sizeSeq >b.sizeSeq?1:a.sizeSeq <b.sizeSeq?-1:0;
        // });
        objectColor.sort((a,b)=>{
            return a.productColor >b.productColor?1:a.productColor <b.productColor?-1:0
            || a.sizeSeq >b.sizeSeq?1:a.sizeSeq <b.sizeSeq?-1:0
        });
        return objectColor;
    }

    setSizeSeqG(sizes: SizeS[], dataObj: any[]): any[] {
        dataObj.forEach((item, index) => {
            // let size: SizeS;
            const sizeF = sizes.filter(i=>i.size.sizeID == item.size);
            if (sizeF.length > 0) {
                item.sizeSeq = sizeF[0].seq;
            } else {
                item.sizeSeq = -1;
            }
        });

        // orderStyleColorSize.sort((a,b)=>{
        //     return a.sizeSeq >b.sizeSeq?1:a.sizeSeq <b.sizeSeq?-1:0;
        // });

        // orderStyleColorSize.sort((a,b)=>{
        //     return a.productColor >b.productColor?1:a.productColor <b.productColor?-1:0
        //     || a.sizeSeq >b.sizeSeq?1:a.sizeSeq <b.sizeSeq?-1:0
        // });

        return dataObj;
    }

    setColorSeqG(colors: ColorS[], dataObj: any[]): any[] {
        dataObj.forEach((item, index) => {
            const colorF = colors.filter(i=>i.color.colorID == item.color);
            if (colorF.length > 0) {
                item.colorSeq = colorF[0].seq;
            } else {
                item.colorSeq = -1;
            }
            // console.log(color);
            // console.log(item.productColor);
        });

        // orderStyleColorSize.sort((a,b)=>{
        //     return a.sizeSeq >b.sizeSeq?1:a.sizeSeq <b.sizeSeq?-1:0;
        // });

        // orderStyleColorSize.sort((a,b)=>{
        //     return a.productColor >b.productColor?1:a.productColor <b.productColor?-1:0
        //     || a.sizeSeq >b.sizeSeq?1:a.sizeSeq <b.sizeSeq?-1:0
        // });

        return dataObj;
    }

    // getColorSeq(colors: ColorS[], colorID: string) {
    //     let seq = -1;
    //     const colorF = colors.filter(i=>i.color.colorID == colorID);
    //     if (colorF.length > 0) {
    //         seq= colorF[0].seq;
    //     } else {
    //         seq = -1;
    //     }
    //     return seq;
    // }

    // getSizeSeq(sizes: SizeS[], size: string) {
    //     let seq = -1;
    //     const sizeF = sizes.filter(i=>i.size.sizeID == size);
    //     if (sizeF.length > 0) {
    //         seq = sizeF[0].seq;
    //     } else {
    //         seq = -1;
    //     }
    //     return seq;
    // }

    // ## general info ########################################################
    // #######################################################################

    // #######################################################################
    // ## report node station ########################################################

    // // ## get node getRepCurrentProductions
    // router.get("/noder/rep8/current/productions/zoneperiod/c/:companyID/:productStatus/:orderStatus"
    // , reportController.getRepCurrentProductionZonePeriod);
    async getRepCurrentProductionZonePeriod(companyID: string, productStatus: string[], orderStatus: string[],
        seasonYear: string
    ) {
        const productStatusArr = JSON.stringify(productStatus); // normal , problem, complete
        const orderStatusArr = JSON.stringify(orderStatus);
        const orderIDArr = JSON.stringify(Array.from(new Set(this.userService.getOrders().map((item: any) => item.orderID))));
        // const productIDArr = JSON.stringify(productIDs);
        // console.log(companyID, factoryID, nodeID, productStatusArr, page, limit);
        this.http
            .get<{token: string; expiresIn: number;
                currentProductionZonePeriod: any[];
                currentProductionZonePeriodFake: any[];
                currentProductionZoneForLoss: any[];
                orderStyleColorSize: OrderStyleColorSize[];
                currentCompanyOrderZoneStyleSize: CurrentCompanyOrderZoneStyleSize[];
                repQTYEditList: RepQTYEditList[];
            }>
            (BACKEND_URL+'/noder/rep8/current/productions/zoneperiod/c/'
                + companyID+'/'+productStatusArr+'/'+orderStatusArr+'/'+orderIDArr+'/'+seasonYear)
            .subscribe({
                next: (data) => {
                    // console.log(data);
                    // this.userService.genToken(data.token, data.expiresIn);
                    // orderStyleColorSize: OrderStyleColorSize[],

                    // this.allProductQty = '';
                    // this.totalBundle = '';
                    // this.countOrderID = '';
                    // this.countProductID = '';

                    // getRepCurrentProductionsZonePeriodCUpdatedListener()
                    this.repCurrentProductionsZonePeriodCUpdated.next({
                        currentProductionZonePeriod: data.currentProductionZonePeriod,
                        currentProductionZonePeriodFake: data.currentProductionZonePeriodFake,
                        currentProductionZoneForLoss: data.currentProductionZoneForLoss,
                        orderStyleColorSize: data.orderStyleColorSize,
                        currentCompanyOrderZoneStyleSize: data.currentCompanyOrderZoneStyleSize,
                        repQTYEditList: data.repQTYEditList,

                        currentProductionZonePeriodFull: [],
                        currentProductionZoneForLossFull: [],
                        repQTYEditListFull: [],
                    });

                }, error: error => {
                    // console.log(error.error);
                    // this.signupStatusListener.next(false);
                    // this.errorStatusListener.next(error.error.message);
                }});
    }

    // this.userGroupScan1
    // getRepCurrentProductionZonePeriodDate12
    // router.put("/noder/rep12/date12/productions/zoneperiod/c", reportController.getRepCurrentProductionZonePeriodDate12);
    async getRepCurrentProductionZonePeriodDate12(companyID: string, productStatus: string[], orderStatus: string[], date12: Date[],
        userGroupScan1: UserGroupScan, seasonYear: string) {
        const productStatusArr = JSON.stringify(productStatus); // normal , problem, complete
        const orderStatusArr = JSON.stringify(orderStatus);
        const orderIDArr = JSON.stringify(Array.from(new Set(this.userService.getOrders().map((item: any) => item.orderID))));
        const userID = this.userService?.getUserID();
        // const productIDArr = JSON.stringify(productIDs);
        // console.log(companyID, factoryID, nodeID, productStatusArr, page, limit);
        const dataSent = {
            companyID, productStatus, orderStatus, date12, productStatusArr, orderStatusArr, orderIDArr, userID,
            userGroupScan1, seasonYear
        };
        this.http
            .put<{ token: string; expiresIn: number; userID: string;
                success: boolean, message: any,
                currentProductionZonePeriod: any[],
                // currentProductionZoneForLoss: any[],
                orderStyleColorSize: OrderStyleColorSize[],
                repQTYEditList: RepQTYEditList[];
                // currentCompanyOrderZoneStyleSize: CurrentCompanyOrderZoneStyleSize[],

                currentProductionZonePeriodFull: any[];
                currentProductionZoneForLossFull: any[];
                repQTYEditListFull: RepQTYEditList[];
            }>(BACKEND_URL+'/noder/rep12/date12/productions/zoneperiod/c', dataSent)
            .subscribe({
                next: (data) => {
                    // console.log(data);
                    const currentProductionZoneForLoss: any[] = [];
                    const currentCompanyOrderZoneStyleSize: CurrentCompanyOrderZoneStyleSize[]  = [];
                    // getRepCurrentProductionsZonePeriodCUpdatedListener()
                    this.repCurrentProductionsZonePeriodCUpdated.next({
                        currentProductionZonePeriod: data.currentProductionZonePeriod,
                        currentProductionZonePeriodFake: [],
                        currentProductionZoneForLoss: currentProductionZoneForLoss,
                        orderStyleColorSize: data.orderStyleColorSize,
                        currentCompanyOrderZoneStyleSize: currentCompanyOrderZoneStyleSize,
                        repQTYEditList: data.repQTYEditList,

                        currentProductionZonePeriodFull: data.currentProductionZonePeriodFull,
                        currentProductionZoneForLossFull: data.currentProductionZoneForLossFull,
                        repQTYEditListFull: data.repQTYEditListFull,
                    });

                }, error: error => {
                    // console.log(error.error);
                    // this.signupStatusListener.next(false);
                    // this.errorStatusListener.next(error.error.message);
                }});
    }



    // router.put("/noder/rep14/date12/productions/bundle/state/c", reportController.getRepCurrentProductionBundleStateDate12);
    async getRepCurrentProductionBundleStateDate12(companyID: string, productStatus: string[], orderStatus: string[],
        orderIDArr: string[],
        date12: Date[],
        userGroupScan1: UserGroupScan) {
        const productStatusArr = JSON.stringify(productStatus); // normal , problem, complete
        const orderStatusArr = JSON.stringify(orderStatus);
        // const orderIDArr = JSON.stringify(Array.from(new Set(this.userService.getOrders().map((item: any) => item.orderID))));
        const userID = this.userService?.getUserID();
        // const productIDArr = JSON.stringify(productIDs);
        // console.log(companyID, factoryID, nodeID, productStatusArr, page, limit);
        const dataSent = {
            companyID, productStatus, orderStatus, date12, productStatusArr, orderStatusArr, orderIDArr, userID,
            userGroupScan1
        };
        this.http
            .put<{ token: string; expiresIn: number; userID: string;
                success: boolean, message: any,
                currentProductionBundleState: CurrentProductionBundleState[],
                bundleStatePDF: BundleStatePDF[]
                // currentProductionZoneForLoss: any[],
                // orderStyleColorSize: OrderStyleColorSize[],
                // currentCompanyOrderZoneStyleSize: CurrentCompanyOrderZoneStyleSize[],
            }>(BACKEND_URL+'/noder/rep14/date12/productions/bundle/state/c', dataSent)
            .subscribe({
                next: (data) => {
                    // console.log(data);

                    const product = GBC.clrProduct();

                    // const currentProductionZoneForLoss: any[] = [];
                    // const currentCompanyOrderZoneStyleSize: CurrentCompanyOrderZoneStyleSize[]  = [];

                    // getRepCurrentProductionsBundleStateCUpdatedListener()
                    this.repCurrentProductionsBundleStateCUpdated.next({
                        currentProductionBundleState: data.currentProductionBundleState,
                        bundleStatePDF: data.bundleStatePDF,
                        product: product,
                    //     currentProductionZoneForLoss: currentProductionZoneForLoss,
                    //     orderStyleColorSize: data.orderStyleColorSize,
                    //     currentCompanyOrderZoneStyleSize: currentCompanyOrderZoneStyleSize,
                    });

                }, error: error => {
                    // console.log(error.error);
                    // this.signupStatusListener.next(false);
                    // this.errorStatusListener.next(error.error.message);
                }});
    }

    // router.put("/noder/rep15/productions/bundle/state/c", reportController.getRepCurrentProductionBundleState);
    async getRepCurrentProductionBundleState(companyID: string, productStatus: string[], orderStatus: string[],
        orderIDArr: string[]) {
        const productStatusArr = JSON.stringify(productStatus); // normal , problem, complete
        const orderStatusArr = JSON.stringify(orderStatus);
        // const orderIDArr = JSON.stringify(Array.from(new Set(this.userService.getOrders().map((item: any) => item.orderID))));
        const userID = this.userService?.getUserID();
        // const productIDArr = JSON.stringify(productIDs);
        // console.log(companyID, factoryID, nodeID, productStatusArr, page, limit);
        const dataSent = {
            companyID, productStatus, orderStatus, productStatusArr, orderStatusArr, orderIDArr, userID
        };
        this.http
            .put<{ token: string; expiresIn: number; userID: string;
                success: boolean, message: any,
                currentProductionBundleState: CurrentProductionBundleState[],
                bundleStatePDF: BundleStatePDF[]
                // currentProductionZoneForLoss: any[],
                // orderStyleColorSize: OrderStyleColorSize[],
                // currentCompanyOrderZoneStyleSize: CurrentCompanyOrderZoneStyleSize[],
            }>(BACKEND_URL+'/noder/rep15/productions/bundle/state/c', dataSent)
            .subscribe({
                next: (data) => {
                    // console.log(data);
                    const product = GBC.clrProduct();

                    // const currentProductionZoneForLoss: any[] = [];
                    // const currentCompanyOrderZoneStyleSize: CurrentCompanyOrderZoneStyleSize[]  = [];

                    // getRepCurrentProductionsBundleStateCUpdatedListener()
                    this.repCurrentProductionsBundleStateCUpdated.next({
                        currentProductionBundleState: data.currentProductionBundleState,
                        bundleStatePDF: data.bundleStatePDF,
                        product: product,
                    //     currentProductionZoneForLoss: currentProductionZoneForLoss,
                    //     orderStyleColorSize: data.orderStyleColorSize,
                    //     currentCompanyOrderZoneStyleSize: currentCompanyOrderZoneStyleSize,
                    });

                }, error: error => {
                    // console.log(error.error);
                    // this.signupStatusListener.next(false);
                    // this.errorStatusListener.next(error.error.message);
                }});
    }

    // router.put("/noder/rep16/productions/bundle/state/no/c", reportController.getRepCurrentProductionBundleStateNo);
    async getRepCurrentProductionBundleStateNo(companyID: string, productStatus: string[], orderStatus: string[],
        orderIDArr: string[], bundleSetGroup: BundleSetGroup) {
        const productStatusArr = JSON.stringify(productStatus); // normal , problem, complete
        const orderStatusArr = JSON.stringify(orderStatus);
        // const orderIDArr = JSON.stringify(Array.from(new Set(this.userService.getOrders().map((item: any) => item.orderID))));
        const userID = this.userService?.getUserID();
        // const productIDArr = JSON.stringify(productIDs);
        // console.log(companyID, factoryID, nodeID, productStatusArr, page, limit);
        const dataSent = {
            companyID, productStatus, orderStatus, productStatusArr, orderStatusArr, orderIDArr, userID, bundleSetGroup
        };
        this.http
            .put<{ token: string; expiresIn: number; userID: string;
                success: boolean, message: any,
                currentProductionBundleState: CurrentProductionBundleState[],
                bundleStatePDF: BundleStatePDF[]
                // currentProductionZoneForLoss: any[],
                // orderStyleColorSize: OrderStyleColorSize[],
                // currentCompanyOrderZoneStyleSize: CurrentCompanyOrderZoneStyleSize[],
            }>(BACKEND_URL+'/noder/rep16/productions/bundle/state/no/c', dataSent)
            .subscribe({
                next: (data) => {
                    // console.log(data);
                    const product = GBC.clrProduct();

                    // const currentProductionZoneForLoss: any[] = [];
                    // const currentCompanyOrderZoneStyleSize: CurrentCompanyOrderZoneStyleSize[]  = [];

                    // getRepCurrentProductionsBundleStateCUpdatedListener()
                    this.repCurrentProductionsBundleStateCUpdated.next({
                        currentProductionBundleState: data.currentProductionBundleState,
                        bundleStatePDF: data.bundleStatePDF,
                        product: product,
                    //     currentProductionZoneForLoss: currentProductionZoneForLoss,
                    //     orderStyleColorSize: data.orderStyleColorSize,
                    //     currentCompanyOrderZoneStyleSize: currentCompanyOrderZoneStyleSize,
                    });

                }, error: error => {
                    // console.log(error.error);
                    // this.signupStatusListener.next(false);
                    // this.errorStatusListener.next(error.error.message);
                }});
    }

    // router.put("/noder/rep17/productions/bundle/state/no/c2", reportController.getRepCurrentProductionBundleStateNo2);
    async getRepCurrentProductionBundleStateNo2(companyID: string, productStatus: string[], orderStatus: string[],
        orderIDArr: string[], bundleNos: number[], productID: string) {
        const productStatusArr = JSON.stringify(productStatus); // normal , problem, complete
        const orderStatusArr = JSON.stringify(orderStatus);
        // const orderIDArr = JSON.stringify(Array.from(new Set(this.userService.getOrders().map((item: any) => item.orderID))));
        const userID = this.userService?.getUserID();
        // const productIDArr = JSON.stringify(productIDs);
        // console.log(companyID, factoryID, nodeID, productStatusArr, page, limit);
        const dataSent = {
            companyID, productStatus, orderStatus, productStatusArr, orderStatusArr, orderIDArr, userID, bundleNos, productID
        };
        this.http
            .put<{ token: string; expiresIn: number; userID: string;
                success: boolean, message: any,
                currentProductionBundleState: CurrentProductionBundleState[],
                bundleStatePDF: BundleStatePDF[],
                product: Product,
                // currentProductionZoneForLoss: any[],
                // orderStyleColorSize: OrderStyleColorSize[],
                // currentCompanyOrderZoneStyleSize: CurrentCompanyOrderZoneStyleSize[],
            }>(BACKEND_URL+'/noder/rep17/productions/bundle/state/no/c2', dataSent)
            .subscribe({
                next: (data) => {
                    // console.log(data);

                    // const currentProductionZoneForLoss: any[] = [];
                    // const currentCompanyOrderZoneStyleSize: CurrentCompanyOrderZoneStyleSize[]  = [];

                    // getRepCurrentProductionsBundleStateCUpdatedListener()
                    this.repCurrentProductionsBundleStateCUpdated.next({
                        currentProductionBundleState: data.currentProductionBundleState,
                        bundleStatePDF: data.bundleStatePDF,
                        product: data.product,
                    //     currentProductionZoneForLoss: currentProductionZoneForLoss,
                    //     orderStyleColorSize: data.orderStyleColorSize,
                    //     currentCompanyOrderZoneStyleSize: currentCompanyOrderZoneStyleSize,
                    });

                }, error: error => {
                    // console.log(error.error);
                    // this.signupStatusListener.next(false);
                    // this.errorStatusListener.next(error.error.message);
                }});
    }


    // ## get node getRepCurrentProductions
    // router.get("/noder/rep7/current/productions/period/c/:companyID/:productStatus/:orderStatus"
    // , reportController.getRepCurrentProductionPeriod);
    async getRepCurrentProductionPeriod(companyID: string, productStatus: string[], orderStatus: string[]) {
        const productStatusArr = JSON.stringify(productStatus); // normal , problem, complete
        const orderStatusArr = JSON.stringify(orderStatus);
        const orderIDArr = JSON.stringify(Array.from(new Set(this.userService.getOrders().map((item: any) => item.orderID))));
        // const productIDArr = JSON.stringify(productIDs);
        // console.log(companyID, factoryID, nodeID, productStatusArr, page, limit);
        this.http
            .get<{token: string; expiresIn: number;
                    currentProductionPeriod: any[];
                    currentProductionForLoss: any[];
                    orderStyleColorSize: OrderStyleColorSize[];
                    currentCompanyOrderStyleSize: CurrentCompanyOrderStyleSize[];
                    }>
            (BACKEND_URL+'/noder/rep7/current/productions/period/c/'
                + companyID+'/'+productStatusArr+'/'+orderStatusArr+'/'+orderIDArr)
            .subscribe({
                next: (data) => {
                    // console.log(data);
                    // this.userService.genToken(data.token, data.expiresIn);
                    // orderStyleColorSize: OrderStyleColorSize[],

                    // this.allProductQty = '';
                    // this.totalBundle = '';
                    // this.countOrderID = '';
                    // this.countProductID = '';

                    // getRepCurrentProductionsPeriodCUpdatedListener()
                    this.repCurrentProductionsPeriodCUpdated.next({
                        currentProductionPeriod: data.currentProductionPeriod,
                        currentProductionForLoss: data.currentProductionForLoss,
                        orderStyleColorSize: data.orderStyleColorSize,
                        currentCompanyOrderStyleSize: data.currentCompanyOrderStyleSize,
                    });

                }, error: error => {
                    // console.log(error.error);
                    // this.signupStatusListener.next(false);
                    // this.errorStatusListener.next(error.error.message);
                }});
    }


    // // ## get node getRepCurrentProductions
    // router.get("/noder/rep6/current/productions/cfn/:companyID/:factoryID/:nodeID/:productStatus/:page/:limit"
    // , reportController.getRepCurrentProductions);
    async getRepCurrentProductions(
        companyID: string, factoryID: string, nodeID: string,
        productStatus: string[], page: number, limit: number
        ) {
        const productStatusArr = JSON.stringify(productStatus);
        // const productIDArr = JSON.stringify(productIDs);
        // console.log(companyID, factoryID, nodeID, productStatusArr, page, limit);
        this.http
            .get<{token: string; expiresIn: number; currentProductAllDetailCFN: any[]; countProductionsAll: number}>
            (BACKEND_URL+'/noder/rep6/current/productions/cfn/'+ companyID+'/'+factoryID+'/'+nodeID+'/'+productStatusArr+'/'+page+'/'+limit)
            .subscribe({
                next: (data) => {
                    // console.log(data);
                    // this.userService.genToken(data.token, data.expiresIn);

                    // this.allProductQty = '';
                    // this.totalBundle = '';
                    // this.countOrderID = '';
                    // this.countProductID = '';

                    // getRepCurrentProductionsCFNUpdatedListener()
                    this.repCurrentProductionsCFNUpdated.next({
                        currentProductAllDetailCFN: data.currentProductAllDetailCFN,
                        countProductionsAll: data.countProductionsAll,
                    });

                }, error: error => {
                    // console.log(error.error);
                    // this.signupStatusListener.next(false);
                    // this.errorStatusListener.next(error.error.message);
                }});
    }

    // // ## get node getRepCurrentProductQueue
    // router.get("/noder/rep5/current/productqueue/cf/:companyID/:factoryID/:productIDArr/:page/:limit"
    //         , reportController.getRepCurrentProductQueue);
    async getRepCurrentProductQueue(companyID: string, factoryID: string, productIDs: string[], page: number, limit: number) {
        const productIDArr = JSON.stringify(productIDs);
        this.http
            .get<{token: string; expiresIn: number; queueInfoRep: QueueInfoRep[]; countProductionQueueAll: number}>
            (BACKEND_URL+'/noder/rep5/current/productqueue/cf/'+ companyID+'/'+factoryID+'/'+productIDArr+'/'+page+'/'+limit)
            .subscribe({
                next: (data) => {
                    // console.log(data);
                    // this.userService.genToken(data.token, data.expiresIn);

                    // this.allProductQty = '';
                    // this.totalBundle = '';
                    // this.countOrderID = '';
                    // this.countProductID = '';

                    // getRepCurrentProductQueueCFUpdatedListener()
                    this.repCurrentProductQueueCFUpdated.next({
                        queueInfoRep: data.queueInfoRep,
                        countProductionQueueAll: data.countProductionQueueAll,
                    });

                }, error: error => {
                    // console.log(error.error);
                    // this.signupStatusListener.next(false);
                    // this.errorStatusListener.next(error.error.message);
                }});
    }

    // // ## get node getRepCurrentProductQtyCFN
    // router.get("/noder/rep1/current/productqty/cfn/:companyID/:factoryID/:nodeID/:productStatus/:repListName", nsController.getRepCurrentProductQtyCFN);
    async getRepCurrentProductQtyCFN(
        companyID: string, factoryID: string, nodeID: string,
        productStatus: string[], repListName: string[]
    ) {
        // console.log(companyID, factoryID, nodeID, productStatus, repListName);
        const productStatusArr = JSON.stringify(productStatus);
        const repListNameArr = JSON.stringify(repListName);  // ## which report we want to get
        // orders: Order[]; products: Product[];
        this.http
            .get<{token: string; expiresIn: number; repListNameArr: string[]; repDataFormat1: RepDataFormat1; }>
            (BACKEND_URL+'/noder/rep1/current/productqty/cfn/'+ companyID+'/'+factoryID+'/'+nodeID
                        +'/'+productStatusArr+'/'+repListNameArr)
            .subscribe({
                next: (data) => {
                    // console.log(data);
                    // this.userService.genToken(data.token, data.expiresIn);

                    // this.allProductQty = '';
                    // this.totalBundle = '';
                    // this.countOrderID = '';
                    // this.countProductID = '';

                    // getRepCurrentProductQtyCFNUpdatedListener()
                    this.repCurrentProductQtyCFNUpdated.next({
                        repListNameArr: data.repListNameArr,
                        repDataFormat1: data.repDataFormat1,
                    });

                }, error: error => {
                    console.log(error.error);
                    // this.signupStatusListener.next(false);
                    // this.errorStatusListener.next(error.error.message);
                }});
    }

    // // ## get node getRepCurrentProductQtyAllCF
    // router.get("/node/rep2/current/productqty/all/cf/:companyID/:factoryIDArr/:ordertatus/:productStatus",
    // checkAuth, checkUUID, reportController.getRepCurrentProductQtyAllCF);
    async getRepCurrentProductQtyAllCF(companyID: string, factoryID: string[], productStatus: string[], ordertatus: string[]) {
        const productStatusArr = JSON.stringify(productStatus);
        const factoryIDArr = JSON.stringify(factoryID);
        const orderStatusArr = JSON.stringify(ordertatus);
        const orderIDArr = JSON.stringify(Array.from(new Set(this.userService.getOrders().map((item: any) => item.orderID))));
        this.http
            .get<{token: string; expiresIn: number;
                currentProductQtyAllC: CurrentProductQtyAllC[]; currentProductQtyAllCF: CurrentProductQtyAllCF[];
                orderStyleColorSize: OrderStyleColorSize[];
            }>
            (BACKEND_URL+'/node/rep2/current/productqty/all/cf/'
                + companyID+'/'+factoryIDArr+'/'+orderStatusArr+'/'+productStatusArr+'/'+orderIDArr)
            .subscribe({
                next: (data) => {
                    // console.log(data);
                    this.userService.genToken(data.token, data.expiresIn);

                    // this.allProductQty = '';
                    // this.totalBundle = '';
                    // this.countOrderID = '';
                    // this.countProductID = '';

                    // getRepCurrentProductQtyAllCFUpdatedListener()
                    this.repCurrentProductQtyAllCFUpdated.next({
                        currentProductQtyAllC: data.currentProductQtyAllC,
                        currentProductQtyAllCF: data.currentProductQtyAllCF,
                        orderStyleColorSize: data.orderStyleColorSize,
                    });

                }, error: error => {
                    // console.log(error.error);
                    // this.signupStatusListener.next(false);
                    // this.errorStatusListener.next(error.error.message);
                }});
    }

    // // ## get node getRepCurrentProductQtyAllCFNode
    // router.get("/node/rep5/current/productqty/all/cfnode/:companyID/:factoryIDArr/:productStatus",
    // checkAuth, checkUUID, reportController.getRepCurrentProductQtyAllCFNode);
    async getRepCurrentProductQtyAllCFNode(companyID: string, factoryID: string[], productStatus: string[]) {
        // console.log(companyID, factoryID, productStatus);
        const productStatusArr = JSON.stringify(productStatus);
        const factoryIDArr = JSON.stringify(factoryID);
        const orderIDArr = JSON.stringify(Array.from(new Set(this.userService.getOrders().map((item: any) => item.orderID))));
        this.http
            .get<{token: string; expiresIn: number;
                orderProductCFNodeRep: OrderProductCFNodeRep[];
            }>
            (BACKEND_URL+'/node/rep5/current/productqty/all/cfnode/'+ companyID+'/'+factoryIDArr+'/'+productStatusArr+'/'+orderIDArr)
            .subscribe({
                next: (data) => {
                    // console.log(data);
                    // this.userService.genToken(data.token, data.expiresIn);

                    // getRepCurrentProductQtyAllCFNodeUpdatedListener()
                    this.repCurrentProductQtyAllCFNodeUpdated.next({
                        orderProductCFNodeRep: data.orderProductCFNodeRep,
                    });

                }, error: error => {
                    // console.log(error.error);
                    // this.signupStatusListener.next(false);
                    // this.errorStatusListener.next(error.error.message);
                }});
    }

    // // ## get node getRepCurrentProductQtyAllCFactory
    // router.get("/node/rep4/current/productqty/all/cf/:companyID/:factoryIDArr/:productStatus",
    // checkAuth, checkUUID, reportController.getRepCurrentProductQtyAllCFactory);
    // // ##
    async getRepCurrentProductQtyAllCFactory(companyID: string, factoryID: string[], productStatus: string[]) {
        const factoryIDArr = JSON.stringify(factoryID);
        const productStatusArr = JSON.stringify(productStatus);
        const orderIDArr = JSON.stringify(Array.from(new Set(this.userService.getOrders().map((item: any) => item.orderID))));
        this.http
            .get<{token: string; expiresIn: number;
                currentProductQtyAllCF: CurrentProductQtyAllCF[];
            }>
            (BACKEND_URL+'/node/rep4/current/productqty/all/cf/'+ companyID+'/'+factoryIDArr+'/'+productStatusArr+'/'+orderIDArr)
            .subscribe({
                next: (data) => {
                    // console.log(data);
                    this.userService.genToken(data.token, data.expiresIn);

                    // this.allProductQty = '';
                    // this.totalBundle = '';
                    // this.countOrderID = '';
                    // this.countProductID = '';

                    // getRepCurrentProductQtyAllCFactoryUpdatedListener()
                    this.repCurrentProductQtyAllCFactoryUpdated.next({
                        currentProductQtyAllCF: data.currentProductQtyAllCF,
                    });

                }, error: error => {
                    // console.log(error.error);
                    // this.signupStatusListener.next(false);
                    // this.errorStatusListener.next(error.error.message);
                }});
    }

    // // ## get node getRepCurrentProductQtyCom
    // router.get("/node/rep3/current/productqty/com/:companyID/:factoryIDArr/:ordertatus/:productStatus", checkAuth, checkUUID,
    // reportController.getRepCurrentProductQtyCom);
    async getRepCurrentProductQtyCom(companyID: string, factoryID: string[], productStatus: string[], ordertatus: string[], orderIDArr1: string[],
        seasonYear: string
    ) {
        const factoryIDArr = JSON.stringify(factoryID);
        const productStatusArr = JSON.stringify(productStatus);
        const orderStatusArr = JSON.stringify(ordertatus);
        const orderIDArr = JSON.stringify(orderIDArr1);

        // console.log(companyID+'/'+factoryIDArr+'/'+orderStatusArr+'/'+productStatusArr+'/'+orderIDArr+'/'+seasonYear);
        // const orderIDArr = JSON.stringify(Array.from(new Set(this.userService.getOrders().map((item: any) => item.orderID))));
        // const factoryIDArr = JSON.stringify(factoryID);
        // orders: Order[]; products: Product[];
        this.http
            .get<{token: string; expiresIn: number;
                currentOrderStyle: CurrentOrderStyle[];
                currentCompanyOrderCountry: CurrentCompanyOrder[];
                currentCompanyOrderZone: CurrentCompanyOrder[];

                currentCompanyOrderZoneStyle: CurrentCompanyOrder[];
                currentCompanyOrderCountryStyle: CurrentCompanyOrder[];

                companyCurrentProductQtyCompleteAll: CompanyCurrentProductQtyAll[];
                companyCurrentProductQtyAll: CompanyCurrentProductQtyAll[];
                currentCompanyProductQtyZoneAll: CurrentCompanyProductQtyZoneAll[];
                currentCompanyProductQtyZoneCompleteAll: CurrentCompanyProductQtyZoneAll[];
                currentCompanyProductQtyCountryAll: CurrentCompanyProductQtyCountryAll[];
                currentCompanyProductQtyCountryCompleteAll: CurrentCompanyProductQtyCountryAll[];
                currentCompanyProductQtyCountryCSAll: CurrentCompanyProductQtyCountryCSAll[];
                currentCompanyProductQtyCountryCSCompleteAll: CurrentCompanyProductQtyCountryCSAll[];

                currentProductListAllC: OrderProduction[];
                currentProductQtyAllC: CurrentProductQtyAllC[];
                currentProductQtyAllCompleteC: CurrentProductQtyAllC[];

                orderStyleColorSize: OrderStyleColorSize[];
            }>
            (BACKEND_URL+'/node/rep3/current/productqty/com/'
                + companyID+'/'+factoryIDArr+'/'+orderStatusArr+'/'+productStatusArr+'/'+orderIDArr+'/'+seasonYear)
            .subscribe({
                next: (data) => {
                    // console.log(data);
                    // console.log(data.currentProductListAllC);
                    this.userService.genToken(data.token, data.expiresIn);

                    // this.allProductQty = '';
                    // this.totalBundle = '';
                    // this.countOrderID = '';
                    // this.countProductID = '';

                    // getRepCurrentCompanyProductQtyAllUpdatedListener()
                    this.repCurrentCompanyProductQtyAllUpdated.next({
                        currentOrderStyle: data.currentOrderStyle,
                        currentCompanyOrderCountry: data.currentCompanyOrderCountry,
                        currentCompanyOrderZone: data.currentCompanyOrderZone,

                        currentCompanyOrderZoneStyle: data.currentCompanyOrderZoneStyle,
                        currentCompanyOrderCountryStyle: data.currentCompanyOrderCountryStyle,

                        companyCurrentProductQtyAll: data.companyCurrentProductQtyAll,
                        companyCurrentProductQtyCompleteAll: data.companyCurrentProductQtyCompleteAll,
                        currentCompanyProductQtyZoneAll: data.currentCompanyProductQtyZoneAll,
                        currentCompanyProductQtyZoneCompleteAll: data.currentCompanyProductQtyZoneCompleteAll,

                        currentCompanyProductQtyCountryAll: data.currentCompanyProductQtyCountryAll,
                        currentCompanyProductQtyCountryCompleteAll: data.currentCompanyProductQtyCountryCompleteAll,

                        currentCompanyProductQtyCountryCSAll: data.currentCompanyProductQtyCountryCSAll,
                        currentCompanyProductQtyCountryCSCompleteAll: data.currentCompanyProductQtyCountryCSCompleteAll,

                        currentProductQtyAllC: data.currentProductQtyAllC,
                        currentProductQtyAllCompleteC: data.currentProductQtyAllCompleteC,

                        orderStyleColorSize: data.orderStyleColorSize,
                    });

                }, error: error => {
                    // console.log(error.error);
                    // this.signupStatusListener.next(false);
                    // this.errorStatusListener.next(error.error.message);
                }});
    }

    // ## get node getRepCNCurrentProductQtyNode
    // router.get("/node/rep11/cn/current/productqty/:companyID/:factoryIDArr/:ordertatus/:productStatus/:orderIDArr", checkAuth, checkUUID,
    //         reportController.getRepCNCurrentProductQtyNode);
    async getRepCNCurrentProductQtyNode(companyID: string, factoryID: string[], productStatus: string[],
            ordertatus: string[], orderIDArr1: string[], toNodeArr1: string[]) {
        const factoryIDArr = JSON.stringify(factoryID);
        const productStatusArr = JSON.stringify(productStatus);
        const orderStatusArr = JSON.stringify(ordertatus);
        const orderIDArr = JSON.stringify(orderIDArr1);
        const toNodeArr = JSON.stringify(toNodeArr1);
        this.http
            .get<{token: string; expiresIn: number;
                currentProductionNodeQty: any[];
            }>
            (BACKEND_URL+'/node/rep11/cn/current/productqty/'
                + companyID+'/'+factoryIDArr+'/'+orderStatusArr+'/'+productStatusArr+'/'+orderIDArr+'/'+toNodeArr)
            .subscribe({
                next: (data) => {
                    // console.log(data);
                    this.userService.genToken(data.token, data.expiresIn);

                    // getRepCurrentProductQtyNodeListener()
                    this.repCurrentProductQtyNodeUpdated.next({
                        currentProductionNodeQty: data.currentProductionNodeQty,
                        // currentCompanyOrderCountry: data.currentCompanyOrderCountry,
                    });

                }, error: error => {
                    // console.log(error.error);
                    // this.signupStatusListener.next(false);
                    // this.errorStatusListener.next(error.error.message);
                }});
    }

    // ## get node getRepCurrentProductionOverview
    // router.get("/node/rep9/current/productqty/com/:companyID/:factoryIDArr/:ordertatus/:productStatus/:orderIDArr"
    async getRepCurrentProductionOverview(companyID: string, factoryID: string[], productStatus: string[],
        ordertatus: string[], seasonYear: string) {
        const factoryIDArr = JSON.stringify(factoryID);
        const productStatusArr = JSON.stringify(productStatus);
        const orderStatusArr = JSON.stringify(ordertatus);
        const orderIDArr = JSON.stringify(Array.from(new Set(this.userService.getOrders().map((item: any) => item.orderID))));
        // const factoryIDArr = JSON.stringify(factoryID);
        // orders: Order[]; products: Product[];
        this.http
            .get<{token: string; expiresIn: number;
                currentOrderStyle: CurrentOrderStyle[];
                currentFactoryOrder: any[];
                companyCurrentProductQtyAll: CompanyCurrentProductQtyAll[];
            }>
            (BACKEND_URL+'/node/rep9/current/productqty/com/'
                + companyID+'/'+factoryIDArr+'/'+orderStatusArr+'/'+productStatusArr+'/'+orderIDArr
                +'/'+seasonYear)
            .subscribe({
                next: (data) => {
                    // console.log(data);
                    // console.log(data.currentProductListAllC);
                    this.userService.genToken(data.token, data.expiresIn);

                    // this.allProductQty = '';
                    // this.totalBundle = '';
                    // this.countOrderID = '';
                    // this.countProductID = '';

                    // getRepCurrentCompanyProductOverviewListener()
                    this.repCurrentCompanyProductOverviewUpdated.next({
                        currentOrderStyle: data.currentOrderStyle,
                        currentFactoryOrder: data.currentFactoryOrder,
                        companyCurrentProductQtyAll: data.companyCurrentProductQtyAll
                    });

                }, error: error => {
                    // console.log(error.error);
                    // this.signupStatusListener.next(false);
                    // this.errorStatusListener.next(error.error.message);
                }});
    }

    // ## report node station ########################################################
    // #######################################################################

    // #######################################################################
    // ##  report company ########################################################

    // router.put("/edit/productions/OutsourceState", reportController.putEditSchedule);
    putEditSchedule(companyID: string, dataOutsState: any[], scheduleData: any) {
        const userID = this.userService.getUserID();
        const dataSent = {
            companyID,
            dataOutsState,
            scheduleData,
            userID
        };
        this.http
            .put<{ token: string; expiresIn: number; userID: string;}>
                (BACKEND_URL+'/edit/productions/OutsourceState', dataSent)
            .subscribe({
                next: (data) => {
                    // console.log(data);
                    // this.userService.genToken(data.token, data.expiresIn);
                    // this.userService.setOrderProduction(data.orderProduct);

                //    // getBundleSetGroupListener()
                //     this.getBundleSetGroupUpdated.next({
                //         bundleSetGroups: data.bundleSetGroups,
                //     });
                }, error: error => {
                    // console.log(error.error);
                    // this.signupStatusListener.next(false);
                    // this.errorStatusListener.next(error.error.message);
                }});
    }

    // router.get("/cpn/rep14/current/order/state/:companyID/:ordertatus/:orderIDArr",
    // checkAuth, checkUUID, reportController.getRepCompanyOrderOutsourceState);
    async getRepCompanyOrderOutsourceState(companyID: string, ordertatus: string[], orderIDArrr: string[],
        seasonYear: string, type: string
    ) {
        const orderStatusArr = JSON.stringify(ordertatus);
        const orderIDArr = JSON.stringify(orderIDArrr);
        // const orderIDArr = JSON.stringify(Array.from(new Set(this.userService.getOrders().map((item: any) => item.orderID))));
        // console.log(companyID, orderStatusArr);
        this.http
        .get<{token: string; expiresIn: number;
                orderIDArr: string[],
                orderProductFacOut: any[],
                orderProductFacReceive: any[],
                dataOutsState: any[],
                orderProductFac1BY1Out: any[],
                orderProductFac1BY1Receive: any[],
                // orderStyleColorSize: OrderStyleColorSize[];  currentCompanyOrder: CurrentCompanyOrder[];
                // currentOrderStyle: CurrentOrderStyle[]; outsourcefactoryID: string[];
                // orderProductFacOutQTY: OrderProductFacOutQTY[]; orderProductFacOutRemainQTY: OrderProductFacOutQTY[];
                // orderProductFacOutStyleColorSizeQTY: OrderProductFacOutStyleColorSizeQTY[];
                // orderProductFacOutStyleColorSizeRemainQTY: OrderProductFacOutStyleColorSizeQTY[];
            }>
        (BACKEND_URL+'/cpn/rep14/current/order/state/'+ companyID+'/'+orderStatusArr+'/'+orderIDArr+'/'+seasonYear+'/'+type)
        .subscribe({
            next: (data) => {
                // console.log(data);
                this.userService.genToken(data.token, data.expiresIn);

                // getRepCompanyOrderOutsourceStateUpdatedListener()
                this.repCompanyOrderOutsourceStateUpdated.next({
                    orderIDArr: data.orderIDArr,
                    orderProductFacOut: data.orderProductFacOut,
                    orderProductFacReceive: data.orderProductFacReceive,
                    orderProductFac1BY1Out: data.orderProductFac1BY1Out,
                    orderProductFac1BY1Receive: data.orderProductFac1BY1Receive,
                    dataOutsState: data.dataOutsState,
                });

            }, error: error => {
                // console.log(error.error);
                // this.signupStatusListener.next(false);
                // this.errorStatusListener.next(error.error.message);
            }});
    }

    // router.get("/cpn/rep14_2/current/order/state/:companyID/:ordertatus/:orderIDArr",
    // reportController.getRepCompanyOrderOutsourceState2);
    async getRepCompanyOrderOutsourceState2(companyID: string, ordertatus: string[], orderIDArrr: string[],
        seasonYear: string, type: string
    ) {
        const orderStatusArr = JSON.stringify(ordertatus);
        const orderIDArr = JSON.stringify(orderIDArrr);
        // const orderIDArr = JSON.stringify(Array.from(new Set(this.userService.getOrders().map((item: any) => item.orderID))));
        // console.log(companyID, orderStatusArr);
        this.http
        .get<{token: string; expiresIn: number;
                orderIDArr: string[],
                orderProductFacOut: any[],
                orderProductFacReceive: any[],
                orderProductFac1BY1Out: any[],
                orderProductFac1BY1Receive: any[],
                dataOutsState: any[],
                // orderStyleColorSize: OrderStyleColorSize[];  currentCompanyOrder: CurrentCompanyOrder[];
                // currentOrderStyle: CurrentOrderStyle[]; outsourcefactoryID: string[];
                // orderProductFacOutQTY: OrderProductFacOutQTY[]; orderProductFacOutRemainQTY: OrderProductFacOutQTY[];
                // orderProductFacOutStyleColorSizeQTY: OrderProductFacOutStyleColorSizeQTY[];
                // orderProductFacOutStyleColorSizeRemainQTY: OrderProductFacOutStyleColorSizeQTY[];
            }>
        (BACKEND_URL+'/cpn/rep14_2/current/order/state/'+ companyID+'/'+orderStatusArr+'/'+orderIDArr+'/'+seasonYear+'/'+type)
        .subscribe({
            next: (data) => {
                // console.log(data);
                // this.userService.genToken(data.token, data.expiresIn);

                // getRepCompanyOrderOutsourceStateUpdatedListener()
                this.repCompanyOrderOutsourceStateUpdated.next({
                    orderIDArr: data.orderIDArr,
                    orderProductFacOut: data.orderProductFacOut,
                    orderProductFacReceive: data.orderProductFacReceive,
                    orderProductFac1BY1Out: data.orderProductFac1BY1Out,
                    orderProductFac1BY1Receive: data.orderProductFac1BY1Receive,
                    dataOutsState: data.dataOutsState
                });

            }, error: error => {
                // console.log(error.error);
                // this.signupStatusListener.next(false);
                // this.errorStatusListener.next(error.error.message);
            }});
    }


    // router.get("/cpn/rep10/current/order/:companyID/:ordertatus",
    // checkAuth, checkUUID, reportController.getRepCompanyOrderOutsource);
    async getRepCompanyOrderOutsource(companyID: string, ordertatus: string[], seasonYear: string, type: string) {
        const orderStatusArr = JSON.stringify(ordertatus);
        const orderIDArr = JSON.stringify(Array.from(new Set(this.userService.getOrders().map((item: any) => item.orderID))));
        // console.log(companyID, orderStatusArr);
        this.http
        .get<{token: string; expiresIn: number;
                orderIDs: string[],
                orderStyleColorSize: OrderStyleColorSize[];  currentCompanyOrder: CurrentCompanyOrder[];
                currentOrderStyle: CurrentOrderStyle[]; outsourcefactoryID: string[];
                orderProductFacOutQTY: OrderProductFacOutQTY[]; orderProductFacOutRemainQTY: OrderProductFacOutQTY[];
                orderProductFacOutStyleColorSizeQTY: OrderProductFacOutStyleColorSizeQTY[];
                orderProductFacOutStyleColorSizeRemainQTY: OrderProductFacOutStyleColorSizeQTY[];}>
        (BACKEND_URL+'/cpn/rep10/current/order/'+ companyID+'/'+orderStatusArr+'/'+orderIDArr+'/'+seasonYear+'/'+type)
        .subscribe({
            next: (data) => {
                // console.log(data);
                this.userService.genToken(data.token, data.expiresIn);


                // this.allProductQty = '';
                // this.totalBundle = '';
                // this.countOrderID = '';
                // this.countProductID = '';

                // getRepCompanyOrderOutsourceUpdatedListener()
                this.repCompanyOrderOutsourceUpdated.next({
                    orderIDs: data.orderIDs,
                    orderStyleColorSize: data.orderStyleColorSize,
                    currentCompanyOrder: data.currentCompanyOrder,
                    currentOrderStyle: data.currentOrderStyle,
                    outsourcefactoryID: data.outsourcefactoryID,
                    orderProductFacOutQTY: data.orderProductFacOutQTY,
                    orderProductFacOutRemainQTY: data.orderProductFacOutRemainQTY,
                    orderProductFacOutStyleColorSizeQTY: data.orderProductFacOutStyleColorSizeQTY,
                    orderProductFacOutStyleColorSizeRemainQTY: data.orderProductFacOutStyleColorSizeRemainQTY,
                });

            }, error: error => {
                // console.log(error.error);
                // this.signupStatusListener.next(false);
                // this.errorStatusListener.next(error.error.message);
            }});
    }

    // // ## get node getRepNodeStaffScannedByDate12
    // router.get("/node/outs/rep10/CF/:companyID/:ordertatus/:orderIDArr",
    // reportController.getRepCompanyOrderOutsource2);
    // // // ##
    async getRepCompanyOrderOutsource2(companyID: string, ordertatus: string[], seasonYear: string) {
        const orderStatusArr = JSON.stringify(ordertatus);
        const orderIDArr = JSON.stringify(Array.from(new Set(this.userService.getOrders().map((item: any) => item.orderID))));
        // console.log(companyID, orderStatusArr, seasonYear);
        this.http
        .get<{token: string; expiresIn: number;
                orderIDs: string[],
                orderStyleColorSize: OrderStyleColorSize[];  currentCompanyOrder: CurrentCompanyOrder[];
                currentOrderStyle: CurrentOrderStyle[]; outsourcefactoryID: string[];
                orderProductFacOutQTY: OrderProductFacOutQTY[]; orderProductFacOutRemainQTY: OrderProductFacOutQTY[];
                orderProductFacOutStyleColorSizeQTY: OrderProductFacOutStyleColorSizeQTY[];
                orderProductFacOutStyleColorSizeRemainQTY: OrderProductFacOutStyleColorSizeQTY[];}>
        (BACKEND_URL+'/node/outs/rep10/CF/'+ companyID+'/'+orderStatusArr+'/'+orderIDArr+'/'+seasonYear)
        .subscribe({
            next: (data) => {
                // console.log(data);
                // this.userService.genToken(data.token, data.expiresIn);


                // this.allProductQty = '';
                // this.totalBundle = '';
                // this.countOrderID = '';
                // this.countProductID = '';

                // getRepCompanyOrderOutsourceUpdatedListener()
                this.repCompanyOrderOutsourceUpdated.next({
                    orderIDs: data.orderIDs,
                    orderStyleColorSize: data.orderStyleColorSize,
                    currentCompanyOrder: data.currentCompanyOrder,
                    currentOrderStyle: data.currentOrderStyle,
                    outsourcefactoryID: data.outsourcefactoryID,
                    orderProductFacOutQTY: data.orderProductFacOutQTY,
                    orderProductFacOutRemainQTY: data.orderProductFacOutRemainQTY,
                    orderProductFacOutStyleColorSizeQTY: data.orderProductFacOutStyleColorSizeQTY,
                    orderProductFacOutStyleColorSizeRemainQTY: data.orderProductFacOutStyleColorSizeRemainQTY,
                });

            }, error: error => {
                // console.log(error.error);
                // this.signupStatusListener.next(false);
                // this.errorStatusListener.next(error.error.message);
            }});
    }

    // // ## get node getRepCurrentProductQtyCFN
    // router.get("/cpn/rep1/current/order/:companyID/:ordertatus", reportController.getRepCompanyOrder);
    async getRepCompanyOrder(companyID: string, ordertatus: string[]) {
        const orderStatusArr = JSON.stringify(ordertatus);
        const orderIDArr = JSON.stringify(Array.from(new Set(this.userService.getOrders().map((item: any) => item.orderID))));
        // console.log(companyID, orderStatusArr);
        this.http
        .get<{token: string; expiresIn: number;
                orderStyleColorSize: OrderStyleColorSize[];  currentCompanyOrder: CurrentCompanyOrder[];
                currentOrderStyle: CurrentOrderStyle[];}>
        (BACKEND_URL+'/cpn/rep1/current/order/'+ companyID+'/'+orderStatusArr+'/'+orderIDArr)
        .subscribe({
            next: (data) => {
                // console.log(data);
                this.userService.genToken(data.token, data.expiresIn);


                // this.allProductQty = '';
                // this.totalBundle = '';
                // this.countOrderID = '';
                // this.countProductID = '';

                // getRepCompanyOrderUpdatedListener()
                this.repCompanyOrderUpdated.next({
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

    // router.get("/cpn/rep9/current/order/:companyID/:ordertatus/:orderID",
    //  checkAuth, checkUUID, reportController.getRepCompanyOrderByOrderID);
    async getRepCompanyOrderByOrderID(companyID: string, ordertatus: string[], orderID: string) {
        const orderStatusArr = JSON.stringify(ordertatus);
        // console.log(companyID, orderStatusArr);
        this.http
        .get<{token: string; expiresIn: number;
                orderStyleColorSize: OrderStyleColorSize[];  currentCompanyOrder: CurrentCompanyOrder[];
                currentOrderStyle: CurrentOrderStyle[];}>
        (BACKEND_URL+'/cpn/rep9/current/order/'+ companyID+'/'+orderStatusArr+'/'+orderID)
        .subscribe({
            next: (data) => {
                // console.log(data);
                this.userService.genToken(data.token, data.expiresIn);


                // this.allProductQty = '';
                // this.totalBundle = '';
                // this.countOrderID = '';
                // this.countProductID = '';

                // getRepCompanyOrderUpdatedListener()
                this.repCompanyOrderUpdated.next({
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
        this.http
        .get<{token: string; expiresIn: number;
                // orderStyleColorSize: OrderStyleColorSize[];  currentCompanyOrder: CurrentCompanyOrder[];
                // currentOrderStyle: CurrentOrderStyle[];
            }>
        (BACKEND_URL+'/node/scan1/rep/CF/staff/:companyID/'+ companyID+'/'+factoryIDArr+'/'+orderIDsArr+'/'+date12Arr+'/'+infoType)
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

                // getRepStaffScannedByDate12UpdatedListener()
                this.repStaffScannedByDate12Updated.next({
                    xxx: '',
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
                // orderStyleColorSize: OrderStyleColorSize[];  currentCompanyOrder: CurrentCompanyOrder[];
                // currentOrderStyle: CurrentOrderStyle[];
            }>
        (BACKEND_URL+'/node/scan1/rep/CF/staff/:companyID/'+ companyID+'/'+factoryIDArr+'/'+orderIDsArr
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

                // getRepStaffScannedByDate12UpdatedListener()
                this.repStaffScannedByDate12Updated.next({
                    xxx: '',
                    // currentCompanyOrder: data.currentCompanyOrder,
                    // currentOrderStyle: data.currentOrderStyle,
                });

            }, error: error => {
                // console.log(error.error);
                // this.signupStatusListener.next(false);
                // this.errorStatusListener.next(error.error.message);
            }});
    }

    // router.get("/cpn/RepQTYEdit/current/seasonYear/:companyID/:seasonYear",
    //     checkAuth, checkUUID, reportController.getRepQTYEditBySeasonYear);
    async getRepQTYEditBySeasonYear(companyID: string, seasonYear: string) {
        // console.log(companyID, seasonYear);
        this.http
        .get<{token: string; expiresIn: number;
                repQTYEditList: RepQTYEditList[];
                //  currentCompanyOrder: CurrentCompanyOrder[];
                // currentOrderStyle: CurrentOrderStyle[];
            }>
        (BACKEND_URL+'/cpn/RepQTYEdit/current/seasonYear/'+ companyID+'/'+seasonYear)
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

                // getRepQTYEditListListener()
                this.getRepQTYEditListUpdated.next({
                    repQTYEditList: data.repQTYEditList,
                });

            }, error: error => {
                // console.log(error.error);
                // this.signupStatusListener.next(false);
                // this.errorStatusListener.next(error.error.message);
            }});
    }

    // router.post("/cpn/rep/edit1/order/zoneperiod/qty",
    //     checkAuth, checkUUID, reportController.postRepCompanyOrderZonePeriod);
    postRepCompanyOrderZonePeriod(companyID: string, editType: string, seasonYear: string, orderID: string, setName: string,
        dataRQTYE: DataRQTYE) {
        const userID = this.userService.getUserID();
        const dataSent = {
            companyID,
            editType,
            seasonYear,
            orderID,
            setName,
            dataRQTYE,
            userID,
        };
        // console.log(dataSent);
        this.http
        .post<{ token: string; expiresIn: number; userID: string; success: boolean; message: any;
            }>
            (BACKEND_URL+'/cpn/rep/edit1/order/zoneperiod/qty', dataSent)
        .subscribe({
            next: (data) => {
                // console.log(data);
                this.userService.genToken(data.token, data.expiresIn);

                // getRepQTYEditListener()
                this.getRepQTYEditUpdated.next({
                    success: true,
                });
            }, error: error => {
                // console.log(error);
                // this.postOrderProductionQueuesCreateNewUpdated.next({ success: false,  message: error.error.message });
            }});
    }


    // ##  report company ########################################################
    // #######################################################################

    // ###################################################################################################
    // ## report heng test ############################################################################

    // // ## getHengtestRep1
    // router.get("/hengtest/rep1", checkAuth, checkUUID, reportController.getHengtestRep1);
    async getHengtestRep1() {
        // const factoryIDArr = JSON.stringify(factoryIDs);
        // const orderIDsArr = JSON.stringify(orderIDs);
        // const zoneArr = JSON.stringify(zones);
        // const date12Arr = JSON.stringify(date12);
        // console.log(companyID, orderStatusArr);
        this.http
        .get<{
            success: boolean; data01: any;
            // token: string; expiresIn: number;
                // orderStyleColorSize: OrderStyleColorSize[];  currentCompanyOrder: CurrentCompanyOrder[];
                // currentOrderStyle: CurrentOrderStyle[];
            }>
        (BACKEND_URL+'/hengtest/rep1')
        .subscribe({
            next: (data) => {
                // console.log(data);



                // this.allProductQty = '';
                // this.totalBundle = '';
                // this.countOrderID = '';
                // this.countProductID = '';

                // // getRepStaffScannedByDate12UpdatedListener()
                // this.repStaffScannedByDate12Updated.next({
                //     xxx: '',
                //     // currentCompanyOrder: data.currentCompanyOrder,
                //     // currentOrderStyle: data.currentOrderStyle,
                // });

            }, error: error => {
                // console.log(error.error);
                // this.signupStatusListener.next(false);
                // this.errorStatusListener.next(error.error.message);
            }});
    }

    // ## report heng test ############################################################################
    // ###################################################################################################

    // #######################################################################
    // ##   ########################################################



    // ##   ########################################################
    // #######################################################################

    // #######################################################################
    // ## observer ########################################################

    // // getRepQTYEditListListener()
    // this.getRepQTYEditListUpdated.next
    getRepQTYEditListListener() {
        return this.getRepQTYEditListUpdated.asObservable();
    }

    // // getRepQTYEditListener()
    // this.getRepQTYEditUpdated.next
    getRepQTYEditListener() {
        return this.getRepQTYEditUpdated.asObservable();
    }

    // getRepCompanyOrderOutsourceStateUpdatedListener()
    //             this.repCompanyOrderOutsourceStateUpdated.
    getRepCompanyOrderOutsourceStateUpdatedListener() {
        return this.repCompanyOrderOutsourceStateUpdated.asObservable();
    }

    // // getRepCurrentProductionsBundleStateCUpdatedListener()
    // this.repCurrentProductionsBundleStateCUpdated.next
    getRepCurrentProductionsBundleStateCUpdatedListener() {
        return this.repCurrentProductionsBundleStateCUpdated.asObservable();
    }

    // getRepCurrentProductQtyNodeListener()
    //                 this.repCurrentProductQtyNodeUpdated
    getRepCurrentProductQtyNodeListener() {
        return this.repCurrentProductQtyNodeUpdated.asObservable();
    }

    // // getRepCurrentCompanyProductOverviewListener()
    // this.repCurrentCompanyProductOverviewUpdated
    getRepCurrentCompanyProductOverviewListener() {
        return this.repCurrentCompanyProductOverviewUpdated.asObservable();
    }

    // // getRepStaffScannedByDate12UpdatedListener()
    // this.repStaffScannedByDate12Updated.next
    getRepStaffScannedByDate12UpdatedListener() {
        return this.repStaffScannedByDate12Updated.asObservable();
    }

    // // getRepCompanyOrderOutsourceUpdatedListener()
    // this.repCompanyOrderOutsourceUpdated.next
    getRepCompanyOrderOutsourceUpdatedListener() {
        return this.repCompanyOrderOutsourceUpdated.asObservable();
    }

    // this.repCurrentProductionsZonePeriodCUpdated.
    getRepCurrentProductionsZonePeriodCUpdatedListener() {
        return this.repCurrentProductionsZonePeriodCUpdated.asObservable();
    }

    // // getRepCurrentProductionsPeriodCUpdatedListener()
    getRepCurrentProductionsPeriodCUpdatedListener() {
        return this.repCurrentProductionsPeriodCUpdated.asObservable();
    }

    // // getRepCurrentProductionsCFNUpdatedListener()
    getRepCurrentProductionsCFNUpdatedListener() {
        return this.repCurrentProductionsCFNUpdated.asObservable();
    }

    // getRepCurrentProductQueueCFUpdatedListener()
    getRepCurrentProductQueueCFUpdatedListener() {
        return this.repCurrentProductQueueCFUpdated.asObservable();
    }


    // getRepCurrentProductQtyAllCFNodeUpdatedListener()
    getRepCurrentProductQtyAllCFNodeUpdatedListener() {
        return this.repCurrentProductQtyAllCFNodeUpdated.asObservable();
    }

    // getRepCurrentCompanyProductQtyAllUpdatedListener() // this.repCurrentCompanyProductQtyAllUpdated
    getRepCurrentCompanyProductQtyAllUpdatedListener() {
        return this.repCurrentCompanyProductQtyAllUpdated.asObservable();
    }

    // repCurrentProductQtyAllCFactoryUpdated
    getRepCurrentProductQtyAllCFactoryUpdatedListener() {
        return this.repCurrentProductQtyAllCFactoryUpdated.asObservable();
    }

    // this.repCurrentProductQtyAllCFUpdated
    getRepCurrentProductQtyAllCFUpdatedListener() {
        return this.repCurrentProductQtyAllCFUpdated.asObservable();
    }

    // private repCurrentProductQtyCFNUpdated = new Subject<{ repListNameArr: string[], repDataFormat1: RepDataFormat1}>();
    getRepCompanyOrderUpdatedListener() {
        return this.repCompanyOrderUpdated.asObservable();
    }

    // private repCurrentProductQtyCFNUpdated = new Subject<{ repListNameArr: string[], repDataFormat1: RepDataFormat1}>();
    getRepCurrentProductQtyCFNUpdatedListener() {
        return this.repCurrentProductQtyCFNUpdated.asObservable();
    }



    // ## observer ########################################################
    // #######################################################################




    // #######################################################################
    // ## PDF ########################################################



    // ## PDF test      ########################################################
    contentTest: any[] = [];

    createContent() {
        this.contentTest = [];
        const contentHeaderTop = this.getHeaderPDF();
        const contentTableHeader = this.getTableHeaderPDF();

        // ## get body pdf
        const contentBody = this.getTableBodyPDF();


        // ## get footer pdf
        const contentFooter = this.getTablefooterPDF();

        this.contentTest = [...this.contentTest, ...contentHeaderTop, contentTableHeader];
        const docDefinition = this.generatePDF();
        return docDefinition;
    }

    getHeaderPDF() {
        // ## header top
        const contentHeaderTop = [
            { text: 'dd-mm-yyyy', style: ['', ''], alignment: 'center' },
            { text: 'yarn name....', style: ['', ''], alignment: 'center' },
            { text: 'color...', style: ['', ''], alignment: 'center' },
        ];
        return contentHeaderTop;
    }

    getTableHeaderPDF() {
        // ## header table
        const contentTableHeader = {
            margin: [15, 0, 15, 0],
            style: 'tableExample',
            table: {
                // ##  11 columns         60                    /                   40
                widths: ['8%', '10%', '13%', '13%', '8%', '8%',      '7%', '7%', '7%', '8%', '11%'],
                headerRows: 2,
                body: [
                        [
                            {rowSpan: 2, text: [
                                {text: 'Date\n', style: ['txtheadsize', ''], alignment: 'center'},
                                {text: 'confirm date', style: ['txtSmall6', ''], color: 'gray', italics: true},
                            ], style: ['marginHeadTop3', '']},
                            {rowSpan: 2, text: 'Issue', style: ['txtheadsize', 'marginHeadTop7'], alignment: 'center'},
                            {rowSpan: 2, text: 'Invoice', style: ['txtheadsize', 'marginHeadTop7'], alignment: 'center'},
                            {rowSpan: 2, text: 'Lot no', style: ['txtheadsize', 'marginHeadTop7'], alignment: 'center'},

                            {text: 'receive', style: ['txtheadsize'], colSpan: 2, alignment: 'center'},
                            {},

                            {rowSpan: 2, text: 'Send to', style: ['txtheadsize', 'marginHeadTop7'], alignment: 'center', alignmentVertical: 'center'},
                            {rowSpan: 2, text: 'Style', style: ['txtheadsize', 'marginHeadTop7'], alignment: 'center' , alignmentCenter: 'center'},
                            {rowSpan: 2, text: 'Lot no', style: ['txtheadsize', 'marginHeadTop7'], alignment: 'center', alignmentVertical: 'center'},
                            {rowSpan: 2, text: 'Kgs.', style: ['txtheadsize', 'marginHeadTop7'], alignment: 'center'},
                            {rowSpan: 2, text: 'BAlance', style: ['txtheadsize', 'marginHeadTop7'], alignment: 'center'}
                        ],
                        [
                            '', '', '', '',
                            {text: 'invoice', style: ['txtheadsize'], alignment: 'center'},
                            {text: 'actual', style: ['txtheadsize'], alignment: 'center'},
                            '', '', '', '', '',
                        ]
                ]
            }
        };
        return contentTableHeader;
    }

    getTableBodyPDF() {
        const contentBody = '';
    }

    getTablefooterPDF() {
        const contentFooter = '';
    }

    generatePDF() {
        // this.content = [...this.content, ...content1, content2];
        const datePrint = this.userService.returnDDMMYYYY(0,'-')
                        +' '
                        +this.userService.returnHHMM(0,':');
        const style = {
            marginHeadTop7: {
                margin: [0, 7, 0, 0]
            },
            marginHeadTop3: {
                margin: [0, 3, 0, 0]
            },
            txtheadsize: {
                fontSize: 8,
                bold: true,
            },
            txtSmall6: {
                fontSize: 6,
            },
        };
        let docDefinition: any = {
            pageSize: 'A4',
            pageMargins: [ 3, 10, 3, 10 ],
            // header: head2,
            // pageOrientation: 'portrait',
            // pageOrientation: 'portrait',
            content: this.contentTest,
            // content: content1,
            // content: [content1, content1],
            // defaultStyle: {font: 'Roboto', fontSize: 10},
            header: {
                columns: [
                    {text: 'headerTxt', italics: true, fontSize: 6, alignment: 'left', margin: [10, 2, 0, 0]},
                    '',
                    {text: 'date print: ' + datePrint, italics: true, fontSize: 6, alignment: 'right', margin: [1, 2, 10, 0]},
                ]
            },
            footer: function(currentPage: any, pageCount: any) {
                return {
                    columns: [
                      '',
                      {text: 'date print: ' + datePrint, italics: true, fontSize: 6, alignment: 'right'},
                      '',
                      { text: currentPage.toString() + ' of ' + pageCount, alignment: 'right' },
                      '',
                    ]
                  };
            },
            defaultStyle: { fontSize: 8},
            styles: style,
        };

        // pdfMake.createPdf(docDefinition).open();
        return docDefinition;
    }



    // ## PDF ########################################################
    // #######################################################################

}


