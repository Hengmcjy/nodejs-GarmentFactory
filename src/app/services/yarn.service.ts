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
import { ColorS, Company, DataAroundApp, Factory, GeneralInfo, ModeRes, ScreenInfo, TokenSet } from '../models/app.model';
import { UCompany, UFactory } from '../models/user.model';
import { Product, ProductImageProfiles } from '../models/product.model';
import {
        PackageInfo, Yarn, YarnBoxInfo, YarnColor, YarnData, YarnDataDraft, YarnDataInfo,
        YarnInvoiceList, YarnInvoiceRow, YarnLotInfo, YarnLotUsage, YarnLotUsageList, YarnPackingList,
        YarnReceiveMain, YarnSeason, YarnSupplier, YarnUsage, YarnReportSubject, YarnTransferUsageRow, YarnStockRow, YarnLotUsageRow,
        YarnStatCal,
        YarnStockCardPCS
    } from '../models/yarn.model';
import { GBC } from '../global/const-global';
import { CurrentCompanyOrderZoneStyleSize } from '../models/report.model';
// import { MenuService } from './menu.service';
// import { debounceTime } from 'rxjs/operators';

const BACKEND_URL = environment.apiUrl + '/yarn';
const BACKEND_AESP = environment.aesP;

// ## user, language , getIP-real

@Injectable({
  providedIn: 'root'
})
export class YarnService {

    // productModeView = false;  // ## for view only cannot edit , cannot update

    private yarn: Yarn = GBC.clrYarn();
    private yarns: Yarn[] = [];
    private yarnPlans: YarnData[] = [];
    private yarnPlan: YarnData = GBC.clrYarnData();

    yarnSeason = '';
    yarnSeasons: YarnSeason[] = [];
    yarnSuppliers: YarnSupplier[] = [];
    yarnColors: YarnColor[] = [];

    yarnFullNameLen = 110;

    yarnPageListItem = 100;

    // ## report
    private yarnReportListener = new Subject<YarnReportSubject>(); // getYarnReportListener()








    private useryarnEditInvoiceIDUpdated = new Subject<{success: boolean}>();
    private yarnEditNameUpdated = new Subject<{success: boolean}>();
    private userYarnStockCardPCSUpdated = new Subject<{success: boolean, yarnStockCardPCS: YarnStockCardPCS}>();
    private useryarnUpdateFinishedUpdated = new Subject<{finished: boolean}>();

    private useryarnsListsUpdated = new Subject<{
        yarns: Yarn[], yarnsCount: number,
        yarnSeasons: YarnSeason[], yarnSuppliers: YarnSupplier[], yarnColors: YarnColor[]
    }>();
    private useryarnSeasonsListsUpdated = new Subject<{
        yarnSeasons: YarnSeason[], yarnSuppliers: YarnSupplier[]
    }>();

    private useryarnStatDataUpdated = new Subject<{
        userID: string,
        currentCompanyOrderZoneStyleSize: CurrentCompanyOrderZoneStyleSize[],
        yarnStatCal: YarnStatCal[]
    }>();
    private useryarnsInfo1Updated = new Subject<{
        uuid: string,
        orderIDs: string[],
        yarns: Yarn[], yarnsCount: number,
        yarnSuppliers: YarnSupplier[], yarnColors: YarnColor[],
        colorS: ColorS[],
        productImageProfiles: ProductImageProfiles[]
    }>();
    private useryarnPlanListUpdated = new Subject<{
        yarnPlans: YarnData[], yarnPlansCount: number,
        yarns: Yarn[], yarnsCount: number,
    }>();
    private useryarnPlanStatUpdated = new Subject<{
        yarnStatCal: YarnStatCal[]
    }>();



    private useryarnPlanList1Updated = new Subject<{
        success: boolean, message: any,
        yarnPlan: YarnData,
        yarnPlanDateGroup: any[],
        yarns: Yarn[], yarnsCount: number
    }>();
    private useryarnPlanInvoiceListUpdated = new Subject<{
        yarnInvoiceList: YarnInvoiceList[],
        yarnPlans: YarnData[],
    }>();


    private useryarnUsageUpdated = new Subject<{
        yarnLotUsageList: YarnLotUsageList[],
        yarnStockCardPCS: YarnStockCardPCS
    }>();
    private useryarnLotInfoUpdated = new Subject<{
        yarnLotInfo: YarnLotInfo
    }>();
    private useryarnLotBoxLastStrUpdated = new Subject<{
        charE: string
    }>();
    private useryarnData1Updated = new Subject<{
        yarnData: YarnData
    }>();
    private useryarnDataUpdated = new Subject<{
        yarnData: YarnData[]
    }>();
    // private userProductsListsUpdated = new Subject<{ products: Product[], productsCount: number}>();
    // private productImageProfilesListsUpdated = new Subject<{ productImageProfiles: ProductImageProfiles[]}>();




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

    // ## plan , factoryStock, yarnTransferReport
    yarnMainMode = [
        {viewMode: 'plan', data: 'Plan & receive-transfer'},
        {viewMode: 'factoryStock', data: 'Factory Stock'},
        {viewMode: 'yarnTransferReport', data: 'Yarn transfer report'},
        {viewMode: 'yarnReport', data: 'Yarn report'},
        {viewMode: 'yarnSetting', data: 'Yarn setting'},
    ];

    getyarnMainMode(viewMode: string) {
        const data = this.yarnMainMode.filter(i=>i.viewMode === viewMode)[0].data;
        return data;
    }

    // ## viewMode = yarnReport
    // ## mode = yarnReport-list , yarnReport-transfer
    yarnReportMode = [
        {viewMode: 'yarnReport', mode: 'yarnReport-transfer', data: 'transfer'},
        {viewMode: 'yarnReport', mode: 'yarnReport-list', data: 'list'},
        {viewMode: 'yarnReport', mode: '', data: ''},
        {viewMode: 'yarnReport', mode: '', data: ''},
    ];

    clearDataWhenLogOut() {
        this.yarn = GBC.clrYarn();
        this.yarns = [];
    }

    getYarns(yarns: Yarn[]) {
        let yarnIDs: string[] = [];
        for (const yarn of yarns) {
            yarnIDs.push(yarn.yarnID);
        }
        return yarnIDs;
    }

    get1YarnInfo(yarnID: string, companyID: string) {
        let yarn: Yarn = GBC.clrYarn();
        const yarn1 = this.yarns.filter(i=>(i.yarnID === yarnID && i.companyID === companyID));
        if (yarnID === this.yarn.yarnID) {
            return this.yarn;
        // } else if (userID === this.user1Company.userID) {
        //     return this.user1Company;
        } else if (yarn1.length > 0) {
            return yarn1[0];
        } else {
            return yarn;
        }
    }

    // ## general info ########################################################
    // #######################################################################

    // #######################################################################
    // ## yarn ########################################################

    getYarnfullName(yarnID: string) {
        let yarnFullName = '';
        const yarnF = this.yarns.filter(i=>(i.yarnID === yarnID));
        if (yarnF.length > 0) {
            return yarnF[0].yarnFullName;
        } else {
            return yarnFullName;
        }

    }

    getYarnIDs(): string[] {
        const yarnIDs = Array.from(new Set(this.yarnPlans.map((item: any) => item.yarnID)));
        return yarnIDs;
    }

    getYarnUUIDs(): string[] {
        const yarnUUIDs = Array.from(new Set(this.yarnPlans.map((item: any) => item.uuid)));
        return yarnUUIDs;
    }

    getYarnUUID(yarnID: string): string {
        const yarn1 = this.yarnPlans.filter(i=>(i.yarnID === yarnID));
        if (yarn1.length > 0) {
            return yarn1[0].uuid;
        }
        return '';
    }



    setYarnPlans(yarnPlans: YarnData[]) {
        this.yarnPlans = yarnPlans;
    }

    setYarnPlan(yarnPlan: YarnData) {
        this.yarnPlan = yarnPlan;
    }

    getYarnPlans(): YarnData[] {
        return [...this.yarnPlans];
    }

    getYarnPlan(): YarnData {
        return {...this.yarnPlan};
    }

    setYarn(yarn: Yarn) {
        this.yarn = yarn;
        this.userService.setYarn(this.yarn);
    }

    getYarnss() {
        return [...this.yarns];
    }

    setYarns(yarns: Yarn[]) {
        this.yarns = yarns;
        this.userService.setYarns(this.yarns);
    }

    setYarnSeason(yarnSeason: string) {
        this.yarnSeason = yarnSeason;
        this.userService.setYarnSeason(this.yarnSeason);
    }

    setYarnSeasons(yarnSeason: YarnSeason[]) {
        yarnSeason.sort((a,b)=>{ return a.yarnSeasonID >b.yarnSeasonID?1:a.yarnSeasonID <b.yarnSeasonID?-1:0 });
        // this.yarnSeason = yarnSeason[0].yarnSeasonID;
        if (this.yarnSeason === '') {
            // this.userService.yarnSeason = yarnSeason[0].yarnSeasonID;
            this.yarnSeason = yarnSeason[0].yarnSeasonID;
        }
        this.yarnSeasons = yarnSeason;
        this.userService.setYarnSeasons(this.yarnSeasons);
    }

    setYarnSuppliers(yarnSuppliers: YarnSupplier[]) {
        this.yarnSuppliers = yarnSuppliers;
        this.userService.setYarnSuppliers(this.yarnSuppliers);
    }

    setYarnColors(yarnColors: YarnColor[]) {
        this.yarnColors = yarnColors;
        this.userService.setYarnColors(this.yarnColors);
    }

    getYarn() {
        return this.yarn;
    }


    getYarnsArr() {
        return this.yarns;
    }


    // router.put("/yarn/editYarnFullName", checkAuth, checkUUID, yarnController.putYarnFullName);
    putYarnFullName(companyID: string, yarnID: string, yarnFullName2: string) {
    const userID = this.userService?.getUserID();
    const dataSent = {
        userID,
        companyID,
        yarnID,
        yarnFullName2,
    };
    // console.log(dataSent);
    this.http
        .put<{ token: string; expiresIn: number; userID: string; success: boolean;
        }>(BACKEND_URL+'/yarn/editYarnFullName', dataSent)
        .subscribe({
            next: (data) => {
                // console.log(data);
                // this.setYarns(data.yarns);
                this.userService.genToken(data.token, data.expiresIn);
                // this.setOrder(data.order);
                // this.setYarnPlans(data.yarnPlans);

                // getYarnEditNameListener()
                this.yarnEditNameUpdated.next({
                    success: data.success,
                });

            }, error: error => {
                // console.log(error.error);
                // this.signupStatusListener.next(false);
                // this.errorStatusListener.next(error.error.message);
            }});
    }

    //   yarnsCount: yarnsCount
    // // ## get yarn list /api/yarn/getlists/:companyID/:userID
    // router.get("/getlists/:companyID/:userID", checkAuth, checkUUID, yarnController.getYarnsList);
    async getYarnsList(companyID: string, yarnSeasonID: string) {
        // console.log(companyID, yarnSeasonID);
        if (companyID === '' || yarnSeasonID === '') { return;}
        this.setYarns([]);
        // console.log(companyID, productID);
        const userID = this.userService?.getUserID();
        this.http
        .get<{token: string; expiresIn: number; userID: string;
            yarns: Yarn[]; yarnsCount: number;
            yarnSeasons: YarnSeason[]; yarnSuppliers: YarnSupplier[]; yarnColors: YarnColor[];
        }>
            (BACKEND_URL+'/getlists/' + companyID+'/'+yarnSeasonID+'/'+userID)
            .subscribe({
                next: (data) => {
                    // console.log(data);
                    this.userService.genToken(data.token, data.expiresIn);
                    this.setYarns(data.yarns);
                    this.setYarnSeasons(data.yarnSeasons);
                    this.setYarnSuppliers(data.yarnSuppliers);

                    // getYarnsListUpdatedListener()
                    this.useryarnsListsUpdated.next({
                        yarns: data.yarns,
                        yarnsCount: data.yarnsCount,
                        yarnSeasons: data.yarnSeasons,
                        yarnSuppliers: data.yarnSuppliers,
                        yarnColors: data.yarnColors,
                    });
                }, error: error => {
                    // console.log(error.error);
                    // this.signupStatusListener.next(false);
                    // this.errorStatusListener.next(error.error.message);
                }});
    }

    // // ## get yarn list /api/yarn/getlists/yarnseasons/:companyID/:userID
    // router.get("/getlists/yarnseasons/:companyID/:userID", checkAuth, checkUUID, yarnController.getYarnsSeasons);
    async getYarnsSeasons(companyID: string) {
        // console.log(companyID);
        if (companyID === '') { return;}
        // console.log(companyID, productID);
        const userID = this.userService?.getUserID();
        this.http
        .get<{token: string; expiresIn: number; userID: string;
            yarnSeasons: YarnSeason[]; yarnSuppliers: YarnSupplier[]; yarnColors: YarnColor[];
        }>
            (BACKEND_URL+'/getlists2/yarnseasons/' + companyID+'/'+userID)
            .subscribe({
                next: (data) => {
                    // console.log(data);
                    this.userService.genToken(data.token, data.expiresIn);
                    // this.setYarns(data.yarns);
                    this.setYarnSeasons(data.yarnSeasons);
                    this.setYarnSuppliers(data.yarnSuppliers);

                    // private useryarnSeasonsListsUpdated = new Subject<{
                    //     yarnSeasons: YarnSeason[], yarnSuppliers: YarnSupplier[], yarnColors: YarnColor[]
                    // }>();
                    // getYarnSeasonsListUpdatedListener()
                    this.useryarnSeasonsListsUpdated.next({
                        yarnSeasons: data.yarnSeasons,
                        yarnSuppliers: data.yarnSuppliers,
                    });
                }, error: error => {
                    // console.log(error.error);
                    // this.signupStatusListener.next(false);
                    // this.errorStatusListener.next(error.error.message);
                }});
    }

    // router.get("/getinfo1/:companyID/:factoryID/:customerID/:yarnSeason", checkAuth, checkUUID, yarnController.getYarnInfo1);
    async getYarnInfo1(companyID: string, factoryID: string, customerID: string, setName: string, yarnSeason: string) {
        // console.log(companyID, productID);
        const userID = this.userService?.getUserID();
        this.http
            .get<{token: string; expiresIn: number; userID: string;
                uuid: string;
                yarns: Yarn[]; yarnsCount: number;
                orderIDs: string[];
                yarnSuppliers: YarnSupplier[];
                yarnColors: YarnColor[];
                colorS: ColorS[];
                productImageProfiles: ProductImageProfiles[];
            }>
            (BACKEND_URL+'/getinfo1/' + companyID+'/'+factoryID+'/'+customerID+'/'+setName+'/'+yarnSeason)
            .subscribe({
                next: (data) => {
                    // console.log(data);
                    this.userService.setProductImageProfiles(data.productImageProfiles);
                    this.setYarns(data.yarns);
                    this.userService.genToken(data.token, data.expiresIn);
                    // this.setYarns(data.yarns);
                    // this.setYarnSeasons(data.yarnSeasons);
                    // this.setYarnSuppliers(data.yarnSuppliers);

                    // getYarnsInfo1UpdatedListener()
                    this.useryarnsInfo1Updated.next({
                        uuid: data.uuid,
                        yarns: data.yarns,
                        yarnsCount: data.yarnsCount,
                        orderIDs: data.orderIDs,
                        yarnSuppliers: data.yarnSuppliers,
                        yarnColors: data.yarnColors,
                        colorS: data.colorS,
                        productImageProfiles: data.productImageProfiles,
                    });
                }, error: error => {
                    // console.log(error.error);
                    // this.signupStatusListener.next(false);
                    // this.errorStatusListener.next(error.error.message);
                }});
    }

    // getYarnStatData(companyID, orderIDs)
    // router.get("/yarnplan/statdata1/:companyID/:orderIDs", checkAuth, checkUUID, yarnController.getYarnStatData);
    async getYarnStatData(companyID: string, orderIDs: string[], yarnID: string, uuid: string, yarnSeason: string) {
        // console.log(companyID, orderIDs, yarnID, uuid, yarnSeason);
        // const orderIDs1 = JSON.stringify(orderIDs);
        const userID = this.userService?.getUserID();
        const dataSent = {
            companyID, orderIDs, yarnID, uuid, yarnSeason
        };
        this.http
            .put<{ token: string; expiresIn: number; userID: string;
                currentCompanyOrderZoneStyleSize: CurrentCompanyOrderZoneStyleSize[],
                yarnStatCal: YarnStatCal[]
            }>(BACKEND_URL+'/yarnplan/statdata1', dataSent)
            .subscribe({
                next: (data) => {
                    // console.log(data);
                    // console.log(data.dateDetail);
                    // this.setYarns(data.yarns);
                    this.userService.genToken(data.token, data.expiresIn);
                    // this.setOrder(data.order);

                    // getYarnyarnStatDataListener()
                    this.useryarnStatDataUpdated.next({
                        userID: userID,
                        currentCompanyOrderZoneStyleSize: data.currentCompanyOrderZoneStyleSize,
                        yarnStatCal: data.yarnStatCal
                    });

                }, error: error => {
                    // console.log(error.error);
                    // this.signupStatusListener.next(false);
                    // this.errorStatusListener.next(error.error.message);
                }});
    }

    // // ## get yarn plan list /api/yarn/yarnplan/get/list1 getYarnPlansList1
    // router.post("/yarnplan/get/list1",
    // checkAuth, checkUUID, yarnController.getYarnPlansList1);
    async getYarnPlansList1(companyID: string, factoryID: string, customerID: string, uuid: string, yarnSeasonID: string,
        yarnID: string, type: string[]) {
        // console.log(companyID, factoryID, customerID, uuid, yarnSeasonID, yarnID );
        // const userID = this.userService?.getUserID();
        const typeArr = JSON.stringify(type);
        const dataSent = {
            companyID, factoryID, customerID, uuid, yarnSeasonID, yarnID, typeArr
        };
        this.http
            .post<{ token: string; expiresIn: number; userID: string;
                success: boolean, message: any,
                yarnPlan: YarnData,
                dateDetail: any, yarnPlanDateGroup: any[],
                yarns: Yarn[], yarnsCount: number
            }>(BACKEND_URL+'/yarnplan/get/list1', dataSent)
            .subscribe({
                next: (data) => {
                    // console.log(data);
                    // console.log(data.dateDetail);
                    // this.setYarns(data.yarns);
                    if (data.yarns && data.yarns.length > 0) {
                        this.yarns = data.yarns;
                        this.setYarns(data.yarns);
                    }
                    this.userService.genToken(data.token, data.expiresIn);
                    // this.setOrder(data.order);

                    // getYarnPlanList1Listener()
                    this.useryarnPlanList1Updated.next({
                        success: data.success,
                        message: data.message,
                        yarnPlan: data.yarnPlan,
                        yarnPlanDateGroup: data.yarnPlanDateGroup,
                        yarns: data.yarns,
                        yarnsCount: data.yarnsCount,
                    });

                }, error: error => {
                    // console.log(error.error);
                    // this.signupStatusListener.next(false);
                    // this.errorStatusListener.next(error.error.message);
                }});
    }

    // // ## get yarn plan list /api/yarn/yarnplan/get/invoice/list2 getYarnPlansInvoiceList2
    // router.put("/yarnplan/get/invoice/list2", checkAuth, checkUUID, yarnController.getYarnPlansInvoiceList2);
    async getYarnPlansInvoiceList2(companyID: string, factoryID: string, customerID: string, yarnSeasonID: string,
        type: string[], invoiceID: string) {
        // console.log(companyID, factoryID, customerID, uuid, yarnSeasonID, yarnID );
        // const userID = this.userService?.getUserID();
        const typeArr = JSON.stringify(type);
        const dataSent = {
            companyID, factoryID, customerID, yarnSeasonID, typeArr, invoiceID
        };
        this.http
            .put<{ token: string; expiresIn: number; userID: string;
                success: boolean, message: any,
                yarnInvoiceList: YarnInvoiceList[],
                yarnPlans: YarnData[],
            }>(BACKEND_URL+'/yarnplan/get/invoice/list2', dataSent)
            .subscribe({
                next: (data) => {
                    // console.log(data);
                    // console.log(data.dateDetail);
                    // this.setYarns(data.yarns);
                    this.userService.genToken(data.token, data.expiresIn);
                    // this.setOrder(data.order);

                    // getYarnPlanInvoiceListListener()
                    this.useryarnPlanInvoiceListUpdated.next({
                        yarnInvoiceList: data.yarnInvoiceList,
                        yarnPlans: data.yarnPlans,
                    });

                }, error: error => {
                    // console.log(error.error);
                    // this.signupStatusListener.next(false);
                    // this.errorStatusListener.next(error.error.message);
                }});
    }

    // // ## get yarn plan list /api/yarn/yarnplan/list/:companyID/:factoryID/:customerID/:setName/:yarnSeason getYarPlansList
    // router.get("/yarnplan/list/main/:companyID/:factoryID/:customerID/:setName/:yarnSeason",
    // checkAuth, checkUUID, yarnController.getYarPlansList);
    async getYarPlansList(companyID: string, factoryID: string, customerID: string, setName: string, yarnSeason: string,
        orderIDs: string[]) {
        // console.log(companyID, productID);
        this.setYarns([]);
        const userID = this.userService?.getUserID();
        const orderIDArr = JSON.stringify(orderIDs);
        this.http
            .get<{token: string; expiresIn: number; userID: string;
                yarnPlans: YarnData[], yarnPlansCount: number,
                yarns: Yarn[], yarnsCount: number,
                productImageProfiles: ProductImageProfiles[]
            }>
            (BACKEND_URL+'/yarnplan/list/main/' + companyID+'/'+factoryID+'/'+customerID+'/'+setName+'/'+yarnSeason+'/'+orderIDArr)
            .subscribe({
                next: (data) => {
                    // console.log(data);
                    this.setYarns(data.yarns);
                    this.userService.setProductImageProfiles(data.productImageProfiles);
                    this.userService.genToken(data.token, data.expiresIn);
                    // this.setYarns(data.yarns);
                    // this.setYarnSeasons(data.yarnSeasons);
                    this.setYarnPlans(data.yarnPlans);

                    // getYarnPlanListListener()
                    this.useryarnPlanListUpdated.next({
                        yarnPlans: data.yarnPlans,
                        yarnPlansCount: data.yarnPlansCount,
                        yarns: data.yarns,
                        yarnsCount: data.yarnsCount,
                    });
                }, error: error => {
                    // console.log(error.error);
                    // this.signupStatusListener.next(false);
                    // this.errorStatusListener.next(error.error.message);
                }});
    }

    // // ## /api/yarn/yarnplan/createnew   postYarnPlanCreateNew
    // router.post("/yarnplan/createnew", checkAuth, checkUUID, yarnController.postYarnPlanCreateNew);
    postYarnPlanCreateNew(userID: string, companyID: string, factoryID: string, customerID: string, uuid: string,
            yarnSeasonID: string, yarnID: string, orderID: string[], colorS: ColorS[] ) {
        const dataSent = {
            userID,
            companyID,
            factoryID,
            customerID,
            uuid,
            yarnSeasonID,
            yarnID,
            orderID: orderID,
            colorS: colorS,
        };
        // console.log(dataSent);
        this.http
            .post<{ token: string; expiresIn: number; userID: string;
                yarnPlans: YarnData[], yarnPlansCount: number,
                yarns: Yarn[], yarnsCount: number,
            }>(BACKEND_URL+'/yarnplan/createnew', dataSent)
            .subscribe({
                next: (data) => {
                    // console.log(data);
                    this.setYarns(data.yarns);
                    this.userService.genToken(data.token, data.expiresIn);
                    // this.setOrder(data.order);
                    this.setYarnPlans(data.yarnPlans);

                    // getYarnPlanListListener()
                    this.useryarnPlanListUpdated.next({
                        yarnPlans: data.yarnPlans,
                        yarnPlansCount: data.yarnPlansCount,
                        yarns: data.yarns,
                        yarnsCount: data.yarnsCount,
                    });

                }, error: error => {
                    // console.log(error.error);
                    // this.signupStatusListener.next(false);
                    // this.errorStatusListener.next(error.error.message);
                }});
    }

    // // ## /api/yarn/yarnplan/edit/maindata   putYarnPlan
    // router.put("/yarnplan/cedit/maindata", checkAuth, checkUUID, yarnController.putYarnPlan);
    putYarnPlan(userID: string, companyID: string, factoryID: string, customerID: string, uuid: string,
        yarnSeasonID: string, yarnID: string, orderID: string[], colorS: ColorS[] ) {
    const dataSent = {
        userID,
        companyID,
        factoryID,
        customerID,
        uuid,
        yarnSeasonID,
        yarnID,
        orderID: orderID,
        colorS: colorS,
    };
    // console.log(dataSent);
    this.http
        .put<{ token: string; expiresIn: number; userID: string;
            yarnPlans: YarnData[], yarnPlansCount: number,
            yarns: Yarn[], yarnsCount: number,
        }>(BACKEND_URL+'/yarnplan/edit/maindata', dataSent)
        .subscribe({
            next: (data) => {
                // console.log(data);
                this.setYarns(data.yarns);
                this.userService.genToken(data.token, data.expiresIn);
                // this.setOrder(data.order);
                this.setYarnPlans(data.yarnPlans);

                // getYarnPlanListListener()
                this.useryarnPlanListUpdated.next({
                    yarnPlans: data.yarnPlans,
                    yarnPlansCount: data.yarnPlansCount,
                    yarns: data.yarns,
                    yarnsCount: data.yarnsCount,
                });

            }, error: error => {
                // console.log(error.error);
                // this.signupStatusListener.next(false);
                // this.errorStatusListener.next(error.error.message);
            }});
    }

    // router.put("/yarnplan/edit/stat", checkAuth, checkUUID, yarnController.putYarnPlanStat);
    putYarnPlanStat(companyID: string, yarnID: string, uuid: string, yarnSeason: string,
         yarnStatCal: YarnStatCal[]) {
        const userID = this.userService.getUserID();
        const dataSent = {
            userID,
            companyID,
            yarnID,
            uuid,
            yarnSeason,
            yarnStatCal: yarnStatCal,
        };
        // console.log(dataSent);
        this.http
        .put<{ token: string; expiresIn: number; userID: string;
        }>(BACKEND_URL+'/yarnplan/edit/stat', dataSent)
        .subscribe({
            next: (data) => {
                // console.log(data);
                // this.setYarns(data.yarns);
                this.userService.genToken(data.token, data.expiresIn);
                // this.setOrder(data.order);
                // this.setYarnPlans(data.yarnPlans);

                // getYarnPlanStatListener()
                this.useryarnPlanStatUpdated.next({
                    yarnStatCal: yarnStatCal,
                });

            }, error: error => {
                // console.log(error.error);
                // this.signupStatusListener.next(false);
                // this.errorStatusListener.next(error.error.message);
            }});
    }


    // // ## /api/yarn/yarnplan/yarnDataInfo    putYarnPlanDataInfo
    // router.put("/yarnplan/yarnDataInfo", checkAuth, checkUUID, yarnController.putYarnPlanDataInfo);
    putYarnPlanDataInfo(userID: string, companyID: string, factoryID: string, customerID: string, uuid: string,
        yarnSeasonID: string, yarnID: string,
        datetime: Date, yarnColorID: string, type: string, yarnWeight: number,
        type2: string[]) {
        // const typeArr2 = JSON.stringify(type2);
        const dataSent = {
            userID,
            companyID,
            factoryID,
            customerID,
            uuid,
            yarnSeasonID,
            yarnID,

            datetime: datetime,
            yarnColorID: yarnColorID,
            type: type, // ## plan
            yarnWeight: yarnWeight,
            type2,
        };
        this.http
            .put<{ token: string; expiresIn: number; userID: string;
                success: boolean, message: any,
                yarnPlan: YarnData, yarnPlanDateGroup: any,
                yarns: Yarn[], yarnsCount: number,
            }>(BACKEND_URL+'/yarnplan/yarnDataInfo', dataSent)
            .subscribe({
                next: (data) => {
                    // console.log(data);
                    this.userService.genToken(data.token, data.expiresIn);
                    // this.userService.setOrderProduction(data.orderProduct);
                    // console.log(companyID, factoryID, customerID, uuid, yarnSeasonID, yarnID, type2);
                    // this.getYarnPlansList1(companyID, factoryID, customerID, uuid, yarnSeasonID, yarnID, type2);

                    // getYarnPlanList1Listener()
                    this.useryarnPlanList1Updated.next({
                        success: data.success,
                        message: data.message,
                        yarnPlan: data.yarnPlan,
                        yarnPlanDateGroup: data.yarnPlanDateGroup,
                        yarns: data.yarns,
                        yarnsCount: data.yarnsCount,
                    });
                }, error: error => {
                    // console.log(error.error);
                    // this.signupStatusListener.next(false);
                    // this.errorStatusListener.next(error.error.message);
                }});
    }

    // // ## /api/yarn/yarnpackinglist1/add   putAddYarnPackingList1
    // router.put("/yarnpackinglist1/add", checkAuth, checkUUID, yarnController.putAddYarnPackingList1);
    putAddYarnPackingList1(userID: string, companyID: string, factoryID: string, customerID: string, uuid: string,
        yarnSeasonID: string, yarnID: string,
        datetime: Date, yarnColorID: string, type: string) {
        const dataSent = {
            userID,
            companyID,
            factoryID,
            customerID,
            uuid,
            yarnSeasonID,
            yarnID,

            datetime: datetime,
            yarnColorID: yarnColorID,
            type: type, // ## receive
        };
        this.http
            .put<{ token: string; expiresIn: number; userID: string;
                success: boolean, message: any,
                yarnPlan: YarnData, yarnPlanDateGroup: any,
                yarns: Yarn[], yarnsCount: number,
            }>(BACKEND_URL+'/yarnpackinglist1/add', dataSent)
            .subscribe({
                next: (data) => {
                    // console.log(data);
                    this.userService.genToken(data.token, data.expiresIn);
                    // this.userService.setOrderProduction(data.orderProduct);

                    // getYarnPlanList1Listener()
                    this.useryarnPlanList1Updated.next({
                        success: data.success,
                        message: data.message,
                        yarnPlan: data.yarnPlan,
                        yarnPlanDateGroup: data.yarnPlanDateGroup,
                        yarns: data.yarns,
                        yarnsCount: data.yarnsCount,
                    });
                }, error: error => {
                    // console.log(error.error);
                    // this.signupStatusListener.next(false);
                    // this.errorStatusListener.next(error.error.message);
                }});
    }

    // // ## /api/yarn/yarnpackinglist1/cancel   putCancelYarnPackingList1
    // router.put("/yarnpackinglist1/cancel", checkAuth, checkUUID, yarnController.putCancelYarnPackingList1);
    putCancelYarnPackingList1(userID: string, companyID: string, factoryID: string, customerID: string, uuid: string,
        yarnSeasonID: string, yarnID: string,
        yarnDataUUID: string, yarnColorID: string, type: string) {
        const dataSent = {
            userID,
            companyID,
            factoryID,
            customerID,
            uuid,
            yarnSeasonID,
            yarnID,

            yarnDataUUID: yarnDataUUID,
            yarnColorID: yarnColorID,
            type: type, // ## receive
        };
        this.http
            .put<{ token: string; expiresIn: number; userID: string;
                success: boolean, message: any,
                yarnPlan: YarnData, yarnPlanDateGroup: any,
                yarns: Yarn[], yarnsCount: number,
            }>(BACKEND_URL+'/yarnpackinglist1/cancel', dataSent)
            .subscribe({
                next: (data) => {
                    // console.log(data);
                    this.userService.genToken(data.token, data.expiresIn);
                    // this.userService.setOrderProduction(data.orderProduct);

                    // getYarnPlanList1Listener()
                    this.useryarnPlanList1Updated.next({
                        success: data.success,
                        message: data.message,
                        yarnPlan: data.yarnPlan,
                        yarnPlanDateGroup: data.yarnPlanDateGroup,
                        yarns: data.yarns,
                        yarnsCount: data.yarnsCount,
                    });
                }, error: error => {
                    // console.log(error.error);
                    // this.signupStatusListener.next(false);
                    // this.errorStatusListener.next(error.error.message);
                }});
    }

    // // ## /api/yarn/yarndatainfo/datetime   putYarnDataInfoDatetime
    // router.put("/yarndatainfo/datetime", checkAuth, checkUUID, yarnController.putYarnDataInfoDatetime);
    putYarnDataInfoDatetime(userID: string, companyID: string, factoryID: string, customerID: string, uuid: string,
        yarnSeasonID: string, yarnID: string,
        yarnDataUUID: string, yarnColorID: string, type: string, datetime: Date) {
        const dataSent = {
            userID,
            companyID,
            factoryID,
            customerID,
            uuid,
            yarnSeasonID,
            yarnID,

            yarnDataUUID: yarnDataUUID,
            yarnColorID: yarnColorID,
            type: type, // ## receive
            datetime,
        };
        this.http
            .put<{ token: string; expiresIn: number; userID: string;
                success: boolean, message: any,
                yarnPlan: YarnData, yarnPlanDateGroup: any,
                yarns: Yarn[], yarnsCount: number,
            }>(BACKEND_URL+'/yarndatainfo/datetime', dataSent)
            .subscribe({
                next: (data) => {
                    // console.log(data);
                    this.userService.genToken(data.token, data.expiresIn);
                    // this.userService.setOrderProduction(data.orderProduct);

                    // getYarnPlanList1Listener()
                    this.useryarnPlanList1Updated.next({
                        success: data.success,
                        message: data.message,
                        yarnPlan: data.yarnPlan,
                        yarnPlanDateGroup: data.yarnPlanDateGroup,
                        yarns: data.yarns,
                        yarnsCount: data.yarnsCount,
                    });

                }, error: error => {
                    // console.log(error.error);
                    // this.signupStatusListener.next(false);
                    // this.errorStatusListener.next(error.error.message);
                }});
    }

    // // ## /api/yarn/yarnpackageInfo/del   putDelYarnPackingList1
    // router.put("/yarnpackageInfo/del", checkAuth, checkUUID, yarnController.putDelYarnPackingList1);
    putDelYarnPackingList1(userID: string, companyID: string, factoryID: string, customerID: string, uuid: string,
        yarnSeasonID: string, yarnID: string,
        yarnDataUUID: string, yarnColorID: string, type: string,
        invoiceID: string, yarnLotID: string, yarnLotUUID: string) {
        const dataSent = {
            userID,
            companyID,
            factoryID,
            customerID,
            uuid,
            yarnSeasonID,
            yarnID,

            yarnDataUUID: yarnDataUUID,
            yarnColorID: yarnColorID,
            type: type, // ## receive
            invoiceID,
            yarnLotID,
            yarnLotUUID
        };
        this.http
            .put<{ token: string; expiresIn: number; userID: string;
                success: boolean, message: any,
                yarnPlan: YarnData, yarnPlanDateGroup: any,
                yarns: Yarn[], yarnsCount: number,
            }>(BACKEND_URL+'/yarnpackageInfo/del', dataSent)
            .subscribe({
                next: (data) => {
                    // console.log(data);
                    this.userService.genToken(data.token, data.expiresIn);
                    // this.userService.setOrderProduction(data.orderProduct);

                    // getYarnPlanList1Listener()
                    this.useryarnPlanList1Updated.next({
                        success: data.success,
                        message: data.message,
                        yarnPlan: data.yarnPlan,
                        yarnPlanDateGroup: data.yarnPlanDateGroup,
                        yarns: data.yarns,
                        yarnsCount: data.yarnsCount,
                    });
                }, error: error => {
                    // console.log(error.error);
                    // this.signupStatusListener.next(false);
                    // this.errorStatusListener.next(error.error.message);
                }});
    }

    // // ## /api/yarn/yarnlotID/add putAddYarnLotID1
    // router.put("/yarnlotID/add", checkAuth, checkUUID, yarnController.putAddYarnLotID1);
    putAddYarnLotID1(userID: string, companyID: string, factoryID: string, customerID: string, uuid: string,
        yarnSeasonID: string, yarnID: string,
        yarnDataUUID: string, yarnColorID: string, type: string,
        invoiceID: string, yarnLotID: string, coneWeight: number, boxWeight: number,
        yarnBoxInfo: YarnBoxInfo[]) {
        const dataSent = {
            userID,
            companyID,
            factoryID,
            customerID,
            uuid,
            yarnSeasonID,
            yarnID,

            yarnDataUUID: yarnDataUUID,
            yarnColorID: yarnColorID,
            type: type, // ## receive
            invoiceID,
            yarnLotID,
            coneWeight,
            boxWeight,

            yarnBoxInfo
        };
        this.http
            .put<{ token: string; expiresIn: number; userID: string;
                success: boolean, message: any,
                yarnPlan: YarnData, yarnPlanDateGroup: any,
                yarns: Yarn[], yarnsCount: number,
            }>(BACKEND_URL+'/yarnlotID/add', dataSent)
            .subscribe({
                next: (data) => {
                    // console.log(data);
                    this.userService.genToken(data.token, data.expiresIn);
                    // this.userService.setOrderProduction(data.orderProduct);

                    // getYarnPlanList1Listener()
                    this.useryarnPlanList1Updated.next({
                        success: data.success,
                        message: data.message,
                        yarnPlan: data.yarnPlan,
                        yarnPlanDateGroup: data.yarnPlanDateGroup,
                        yarns: data.yarns,
                        yarnsCount: data.yarnsCount,
                    });
                }, error: error => {
                    // console.log(error.error);
                    // this.signupStatusListener.next(false);
                    // this.errorStatusListener.next(error.error.message);
                }});
    }

    // // ## /api/yarn/yarnlotID/edit putEditYarnLotID1
    // router.put("/yarnlotID/edit", checkAuth, checkUUID, yarnController.putEditYarnLotID1);
    putEditYarnLotID1(userID: string, companyID: string, factoryID: string, customerID: string, uuid: string,
        yarnSeasonID: string, yarnID: string,
        yarnDataUUID: string, yarnColorID: string, type: string,
        yarnLotID: string, yarnBoxInfo: YarnBoxInfo[],
        yarnLotUUID: string, invoiceID: string, coneWeight: number, boxWeight: number) {
        const dataSent = {
            userID,
            companyID,
            factoryID,
            customerID,
            uuid,
            yarnSeasonID,
            yarnID,

            yarnDataUUID: yarnDataUUID,
            yarnColorID: yarnColorID,
            type: type, // ## receive
            yarnLotID,
            yarnBoxInfo,
            yarnLotUUID,
            invoiceID,
            coneWeight,
            boxWeight,
        };
        this.http
            .put<{ token: string; expiresIn: number; userID: string;
                success: boolean, message: any,
                yarnPlan: YarnData, yarnPlanDateGroup: any,
                yarns: Yarn[], yarnsCount: number,
            }>(BACKEND_URL+'/yarnlotID/edit', dataSent)
            .subscribe({
                next: (data) => {
                    // console.log(data);
                    this.userService.genToken(data.token, data.expiresIn);
                    // this.userService.setOrderProduction(data.orderProduct);

                    // getYarnPlanList1Listener()
                    this.useryarnPlanList1Updated.next({
                        success: data.success,
                        message: data.message,
                        yarnPlan: data.yarnPlan,
                        yarnPlanDateGroup: data.yarnPlanDateGroup,
                        yarns: data.yarns,
                        yarnsCount: data.yarnsCount,
                    });
                }, error: error => {
                    // console.log(error.error);
                    // this.signupStatusListener.next(false);
                    // this.errorStatusListener.next(error.error.message);
                }});
    }

    // // ## /api/yarn/yarnlotID2/edit/state putEditYarnLotIDState2
    // router.put("/yarnlotID2/edit/state", checkAuth, checkUUID, yarnController.putEditYarnLotIDState2);
    putEditYarnLotIDState2(userID: string, companyID: string, factoryID: string, customerID: string, uuid: string,
        yarnSeasonID: string, yarnID: string,
        yarnDataUUID: string, yarnColorID: string, type: string,
        yarnLotID: string, yarnBoxInfo: YarnBoxInfo[], yarnLotUUID: string,
        state: string, packageInfo: PackageInfo, usageMode: string) {
        const dataSent = {
            userID,
            companyID,
            factoryID,
            customerID,
            uuid,
            yarnSeasonID,
            yarnID,

            yarnDataUUID: yarnDataUUID,
            yarnColorID: yarnColorID,
            type: type, // ## receive
            yarnLotID,
            yarnBoxInfo,
            yarnLotUUID,
            state,
            packageInfo,
            usageMode
        };
        this.http
            .put<{ token: string; expiresIn: number; userID: string;
                success: boolean, message: any,
                yarnPlan: YarnData, yarnPlanDateGroup: any,
                yarns: Yarn[], yarnsCount: number,
            }>(BACKEND_URL+'/yarnlotID2/edit/state', dataSent)
            .subscribe({
                next: (data) => {
                    // console.log(data);
                    this.userService.genToken(data.token, data.expiresIn);
                    // this.userService.setOrderProduction(data.orderProduct);

                    // getYarnPlanList1Listener()
                    this.useryarnPlanList1Updated.next({
                        success: data.success,
                        message: data.message,
                        yarnPlan: data.yarnPlan,
                        yarnPlanDateGroup: data.yarnPlanDateGroup,
                        yarns: data.yarns,
                        yarnsCount: data.yarnsCount,
                    });
                }, error: error => {
                    // console.log(error.error);
                    // this.signupStatusListener.next(false);
                    // this.errorStatusListener.next(error.error.message);
                }});
    }

    // router.put("/usage/edit/sendto/newFac", checkAuth, checkUUID, yarnController.editYarnUsageNewFacSendTo);
    async editYarnUsageNewFacSendTo(companyID: string, factoryID: string, toFactoryID: string, customerID: string, yarnSeasonID: string, yarnID: string,
        yarnColorID: string, yarnDataUUID: string, status: string[], newFacIDSendTo: string,
        yuUUID: string, invoiceID: string, usageMode: string, yarnLotID: string) {
        // console.log(companyID, productID);
        const userID = this.userService?.getUserID();
        // const statusArr = JSON.stringify(status);
        const dataSent = {
            userID,
            companyID,
            factoryID,
            toFactoryID,
            customerID,
            yarnSeasonID,
            yarnID,
            yarnColorID: yarnColorID,
            yarnDataUUID: yarnDataUUID,
            status,
            newFacIDSendTo,
            yuUUID,
            invoiceID,
            usageMode,
            yarnLotID,
        };
        this.http
            .put<{ token: string; expiresIn: number; userID: string;
                yarnLotUsageList: YarnLotUsageList[];
                yarnStockCardPCS: YarnStockCardPCS;
            }>(BACKEND_URL+'/usage/edit/sendto/newFac', dataSent)
            .subscribe({
                next: (data) => {
                    // console.log(data);
                    this.userService.genToken(data.token, data.expiresIn);
                    // this.userService.setOrderProduction(data.orderProduct);

                    // getYarnUsageListener()
                    this.useryarnUsageUpdated.next({
                        yarnLotUsageList: data.yarnLotUsageList,
                        yarnStockCardPCS: data.yarnStockCardPCS,
                        // yarns: data.yarns,
                        // yarnsCount: data.yarnsCount,
                    });
                }, error: error => {
                    // console.log(error.error);
                    // this.signupStatusListener.next(false);
                    // this.errorStatusListener.next(error.error.message);
                }});
    }

    // // ## getYarnUsage
    // router.put("/usage/list", checkAuth, checkUUID, yarnController.getYarnUsage);
    async getYarnUsage(companyID: string, factoryID: string, toFactoryID: string, customerID: string, yarnSeasonID: string,
        yarnID: string, uuid: string,
        yarnColorID: string, yarnDataUUID: string, status: string[]) {
        // console.log(companyID, productID);
        const userID = this.userService?.getUserID();
        // const statusArr = JSON.stringify(status);
        const dataSent = {
            userID,
            companyID,
            factoryID,
            toFactoryID,
            customerID,
            yarnSeasonID,
            yarnID,
            uuid,
            yarnColorID: yarnColorID,
            yarnDataUUID: yarnDataUUID,
            status
        };
        this.http
            .put<{ token: string; expiresIn: number; userID: string;
                yarnLotUsageList: YarnLotUsageList[];
                yarnStockCardPCS: YarnStockCardPCS;
            }>(BACKEND_URL+'/usage/list', dataSent)
            .subscribe({
                next: (data) => {
                    // console.log(data);
                    this.userService.genToken(data.token, data.expiresIn);
                    // this.userService.setOrderProduction(data.orderProduct);

                    // getYarnUsageListener()
                    this.useryarnUsageUpdated.next({
                        yarnLotUsageList: data.yarnLotUsageList,
                        yarnStockCardPCS: data.yarnStockCardPCS,
                        // yarns: data.yarns,
                        // yarnsCount: data.yarnsCount,
                    });
                }, error: error => {
                    // console.log(error.error);
                    // this.signupStatusListener.next(false);
                    // this.errorStatusListener.next(error.error.message);
                }});
    }

    // // ## getYarnUsageCF
    // router.put("/usage/list2", checkAuth, checkUUID, yarnController.getYarnUsageCF);
    async getYarnUsageCF(companyID: string, setfactoryID: string, toFactoryID: string, customerID: string, yarnSeasonID: string,
        yarnID: string, uuid: string,
        yarnColorID: string, yarnDataUUID: string, status: string[]) {
        // console.log(companyID, productID);
        const userID = this.userService?.getUserID();
        // const statusArr = JSON.stringify(status);
        const dataSent = {
            userID,
            companyID,
            setfactoryID,
            toFactoryID,
            customerID,
            yarnSeasonID,
            yarnID,
            uuid,
            yarnColorID: yarnColorID,
            yarnDataUUID: yarnDataUUID,
            status
        };
        this.http
            .put<{ token: string; expiresIn: number; userID: string;
                yarnLotUsageList: YarnLotUsageList[];
                yarnStockCardPCS: YarnStockCardPCS
            }>(BACKEND_URL+'/usage/list2', dataSent)
            .subscribe({
                next: (data) => {
                    // console.log(data);
                    this.userService.genToken(data.token, data.expiresIn);
                    // this.userService.setOrderProduction(data.orderProduct);

                    // getYarnUsageListener()
                    this.useryarnUsageUpdated.next({
                        yarnLotUsageList: data.yarnLotUsageList,
                        yarnStockCardPCS: data.yarnStockCardPCS,
                        // yarns: data.yarns,
                        // yarnsCount: data.yarnsCount,
                    });
                }, error: error => {
                    // console.log(error.error);
                    // this.signupStatusListener.next(false);
                    // this.errorStatusListener.next(error.error.message);
                }});
    }


    // // ## putYarnUsageTransfersDate
    // router.put("/edit/usage/transfer/date", checkAuth, checkUUID, yarnController.putYarnUsageTransfersDate);
    async putYarnUsageTransfersDate(companyID: string, factoryID: string, setfactoryID: string, toFactoryID: string, customerID: string, yarnSeasonID: string, yarnID: string,
        yarnColorID: string, yarnDataUUID: string, status: string[],
        mode: string, yuUUID: string, yarnLotID: string, invoiceID: string, usageMode: string, datetime: Date) {
        // console.log(companyID, productID);
        const userID = this.userService?.getUserID();
        // const statusArr = JSON.stringify(status);
        const dataSent = {
            userID,
            companyID,
            factoryID,
            setfactoryID,
            toFactoryID,
            customerID,
            yarnSeasonID,
            yarnID,
            yarnColorID: yarnColorID,
            yarnDataUUID: yarnDataUUID,
            status,

            mode,
            yuUUID,
            yarnLotID,
            invoiceID,
            usageMode,
            datetime,
        };
        this.http
            .put<{ token: string; expiresIn: number; userID: string;
                yarnLotUsageList: YarnLotUsageList[];
                yarnStockCardPCS: YarnStockCardPCS;
            }>(BACKEND_URL+'/edit/usage/transfer/date', dataSent)
            .subscribe({
                next: (data) => {
                    // console.log(data);
                    this.userService.genToken(data.token, data.expiresIn);
                    // this.userService.setOrderProduction(data.orderProduct);

                    // getYarnUsageListener()
                    this.useryarnUsageUpdated.next({
                        yarnLotUsageList: data.yarnLotUsageList,
                        yarnStockCardPCS: data.yarnStockCardPCS,
                        // yarns: data.yarns,
                        // yarnsCount: data.yarnsCount,
                    });
                }, error: error => {
                    // console.log(error.error);
                    // this.signupStatusListener.next(false);
                    // this.errorStatusListener.next(error.error.message);
                }});
    }

    // // ## get yarn plan list /api/yarn/yarnlot/CF/rep/transfer1/yarn1 getYarnTransferUsageList
    // router.put("/yarnlot/CF/rep/transfer1/yarn1", checkAuth, checkUUID, yarnController.getYarnTransferUsageList);
    async getYarnTransferUsageList(companyID: string, toFactoryID: string, customerID: string, yarnSeasonID: string, yarnID: string,
        usageMode: string) {
        // console.log(companyID, productID);
        const userID = this.userService?.getUserID();
        // const statusArr = JSON.stringify(status);
        const dataSent = {
            userID,
            companyID,
            toFactoryID,
            customerID,
            yarnSeasonID,
            yarnID,
            usageMode,
        };
        this.http
            .put<{ token: string; expiresIn: number; userID: string;
                yarnTransferUsage: YarnLotUsageList[];
                yarnStockCardPCS: YarnStockCardPCS;
            }>(BACKEND_URL+'/yarnlot/CF/rep/transfer1/yarn1', dataSent)
            .subscribe({
                next: (data) => {
                    // console.log(data);
                    this.userService.genToken(data.token, data.expiresIn);
                    // this.userService.setOrderProduction(data.orderProduct);

                    // getYarnUsageListener()
                    this.useryarnUsageUpdated.next({
                        yarnLotUsageList: data.yarnTransferUsage,
                        yarnStockCardPCS: data.yarnStockCardPCS,
                        // yarns: data.yarns,
                        // yarnsCount: data.yarnsCount,
                    });
                }, error: error => {
                    // console.log(error.error);
                    // this.signupStatusListener.next(false);
                    // this.errorStatusListener.next(error.error.message);
                }});
    }

    // companyID, yarnSeasonID, yarnID, yarnColorID, yarnLotID, yarnLotUUID, type
    // // ## getYarnLotInfo
    // router.put("/yarnlotID/getinfo", checkAuth, checkUUID, yarnController.getYarnLotInfo);
    async getYarnLotInfo(companyID: string, factoryIDBox: string, yarnSeasonID: string, yarnID: string,
        yarnColorID: string, yarnLotID: string, yarnLotUUID: string, type: string[]) {
        // console.log(companyID, productID);
        const userID = this.userService?.getUserID();
        // const statusArr = JSON.stringify(status);
        const dataSent = {
            userID,
            companyID,
            factoryIDBox,
            yarnSeasonID,
            yarnID,
            yarnColorID,
            yarnLotID,
            yarnLotUUID,
            type
        };
        this.http
            .put<{ token: string; expiresIn: number; userID: string;
                yarnLotInfo: YarnLotInfo
            }>(BACKEND_URL+'/yarnlotID/getinfo', dataSent)
            .subscribe({
                next: (data) => {
                    // console.log(data);
                    this.userService.genToken(data.token, data.expiresIn);
                    // this.userService.setOrderProduction(data.orderProduct);

                    // getYarnlotInfoListener()
                    this.useryarnLotInfoUpdated.next({
                        yarnLotInfo: data.yarnLotInfo,
                        // yarnPlansCount: data.yarnPlansCount,
                        // yarns: data.yarns,
                        // yarnsCount: data.yarnsCount,
                    });
                }, error: error => {
                    // console.log(error.error);
                    // this.signupStatusListener.next(false);
                    // this.errorStatusListener.next(error.error.message);
                }});
    }

    // // ## getYarnLotCFInfo
    // router.put("/yarnlot/CF/getinfo", checkAuth, checkUUID, yarnController.getYarnLotCFInfo);
    async getYarnLotCFInfo(companyID: string, factoryID: string, yarnSeasonID: string, yarnID: string,
        uuid: string,
        type: string[], state: string,
        weightVerified: boolean) {
        // console.log(companyID, productID);
        const userID = this.userService?.getUserID();
        // const statusArr = JSON.stringify(status);
        const dataSent = {
            userID,
            companyID,
            factoryID,
            yarnSeasonID,
            yarnID,
            uuid,
            type,
            state,
            weightVerified
        };
        this.http
            .put<{ token: string; expiresIn: number; userID: string;
                yarnData: YarnData
            }>(BACKEND_URL+'/yarnlot/CF/getinfo', dataSent)
            .subscribe({
                next: (data) => {
                    // console.log(data);
                    this.userService.genToken(data.token, data.expiresIn);
                    // this.userService.setOrderProduction(data.orderProduct);

                    // getYarnData1Listener()
                    this.useryarnData1Updated.next({
                        yarnData: data.yarnData,
                        // yarnPlansCount: data.yarnPlansCount,
                        // yarns: data.yarns,
                        // yarnsCount: data.yarnsCount,
                    });
                }, error: error => {
                    // console.log(error.error);
                    // this.signupStatusListener.next(false);
                    // this.errorStatusListener.next(error.error.message);
                }});
    }

    // // ## getYarnLotBoxLastStr
    // router.put("/yarnlotbox/get/box/last/str", checkAuth, checkUUID, yarnController.getYarnLotBoxLastStr);
    async getYarnLotBoxLastStr(companyID: string, yarnSeasonID: string, yarnID: string,
        yarnColorID: string, yarnLotID: string, yarnLotUUID: string, type: string[],
        boxID: string, boxSign: string) {
        // console.log(companyID, productID);
        const userID = this.userService?.getUserID();
        // const statusArr = JSON.stringify(status);
        const dataSent = {
            userID,
            companyID,
            yarnSeasonID,
            yarnID,
            yarnColorID,
            yarnLotID,
            yarnLotUUID,
            type,
            boxID,
            boxSign,
        };
        this.http
            .put<{ token: string; expiresIn: number; userID: string;
                charE: string
            }>(BACKEND_URL+'/yarnlotbox/get/box/last/str', dataSent)
            .subscribe({
                next: (data) => {
                    // console.log(data);
                    this.userService.genToken(data.token, data.expiresIn);
                    // this.userService.setOrderProduction(data.orderProduct);

                    // getYarnlotBoxLastStrListener()
                    this.useryarnLotBoxLastStrUpdated.next({
                        charE: data.charE,
                        // yarnPlansCount: data.yarnPlansCount,
                        // yarns: data.yarns,
                        // yarnsCount: data.yarnsCount,
                    });
                }, error: error => {
                    // console.log(error.error);
                    // this.signupStatusListener.next(false);
                    // this.errorStatusListener.next(error.error.message);
                }});
    }

    // // ## /api/yarn/yarnlotbox/edit/devide putEditYarnLotIDDevide
    // router.put("/yarnlotbox/edit/devide", checkAuth, checkUUID, yarnController.putEditYarnLotIDDevide);
    async putEditYarnLotIDDevide(companyID: string, yarnSeasonID: string, yarnID: string,
        uuid: string , yarnDataUUID: string,
        yarnColorID: string, yarnLotID: string, yarnLotUUID: string, type: string[],
        boxID: string, boxUUID: string, boxSign: string,
        boxNew: any, factoryIDBox: string) {
        // console.log(companyID, productID);
        const userID = this.userService?.getUserID();
        // const statusArr = JSON.stringify(status);
        const dataSent = {
            userID,
            companyID,
            yarnSeasonID,
            yarnID,
            uuid,
            yarnDataUUID,
            yarnColorID,
            yarnLotID,
            yarnLotUUID,
            type,
            boxID,
            boxUUID,
            boxSign,
            boxNew,
            factoryIDBox,
        };
        this.http
            .put<{ token: string; expiresIn: number; userID: string;
                yarnLotInfo: YarnLotInfo
            }>(BACKEND_URL+'/yarnlotbox/edit/devide', dataSent)
            .subscribe({
                next: (data) => {
                    // console.log(data);
                    this.userService.genToken(data.token, data.expiresIn);
                    // this.userService.setOrderProduction(data.orderProduct);

                    // getYarnlotInfoListener()
                    this.useryarnLotInfoUpdated.next({
                        yarnLotInfo: data.yarnLotInfo,
                        // yarnPlansCount: data.yarnPlansCount,
                        // yarns: data.yarns,
                        // yarnsCount: data.yarnsCount,
                    });
                }, error: error => {
                    // console.log(error.error);
                    // this.signupStatusListener.next(false);
                    // this.errorStatusListener.next(error.error.message);
                }});
    }

    //     // ## putYarnLotTransferCFCancelAndBackCenter
    // router.put("/yarnlot/CF/transfer2/cancel/backcenter",
    // checkAuth, checkUUID, yarnController.putYarnLotTransferCFCancelAndBackCenter)
    async putYarnLotTransferCFCancelAndBackCenter(_id: string, yarnDataDraft: YarnDataDraft) {
        // console.log(companyID, productID);
        const userID = this.userService?.getUserID();
        // const statusArr = JSON.stringify(status);
        const dataSent = {
            _id,
            userID,
            yarnDataDraft,
            // yarnUsage1,
            // yarnLotUsage1,
            // orderIDTransfer,
        };
        this.http
            .put<{ token: string; expiresIn: number; userID: string;
                yarnTransferUsage: YarnLotUsageList[];
                yarnStockCardPCS: YarnStockCardPCS;
            }>(BACKEND_URL+'/yarnlot/CF/transfer2/cancel/backcenter', dataSent)
            .subscribe({
                next: (data) => {
                    // console.log(data);
                    this.userService.genToken(data.token, data.expiresIn);
                    // this.userService.setOrderProduction(data.orderProduct);

                    // getYarnUsageListener()
                    this.useryarnUsageUpdated.next({
                        yarnLotUsageList: data.yarnTransferUsage,
                        yarnStockCardPCS: data.yarnStockCardPCS,
                        // yarns: data.yarns,
                        // yarnsCount: data.yarnsCount,
                    });
                }, error: error => {
                    // console.log(error.error);
                    // this.signupStatusListener.next(false);
                    // this.errorStatusListener.next(error.error.message);
                }});
    }

    // router.put("/edit/usage2/stockcard/pcs", checkAuth, checkUUID, yarnController.putYarnStockCardPCS);
    async putYarnStockCardPCS(yarnStockCardPCS: YarnStockCardPCS) {
        // console.log(companyID, productID);
        const userID = this.userService?.getUserID();
        // const statusArr = JSON.stringify(status);
        const dataSent = {
            userID,
            yarnStockCardPCS,
        };
        this.http
            .put<{ token: string; expiresIn: number; userID: string;
                yarnStockCardPCS: YarnStockCardPCS;
            }>(BACKEND_URL+'/edit/usage2/stockcard/pcs', dataSent)
            .subscribe({
                next: (data) => {
                    // console.log(data);
                    this.userService.genToken(data.token, data.expiresIn);
                    // this.userService.setOrderProduction(data.orderProduct);

                    // getYarnStockCardPCSListener()
                    this.userYarnStockCardPCSUpdated.next({
                        success: true,
                        yarnStockCardPCS: data.yarnStockCardPCS,
                        // yarns: data.yarns,
                        // yarnsCount: data.yarnsCount,
                    });
                }, error: error => {
                    // console.log(error.error);
                    // this.signupStatusListener.next(false);
                    // this.errorStatusListener.next(error.error.message);
                }});
    }

    // router.put("/edit/usage3/stockcard/zone", checkAuth, checkUUID, yarnController.putYarnStockCardPCSZONE);
    async putYarnStockCardPCSZONE(yarnStockCardPCS: YarnStockCardPCS) {
        // console.log(companyID, productID);
        const userID = this.userService?.getUserID();
        // const statusArr = JSON.stringify(status);
        const dataSent = {
            userID,
            yarnStockCardPCS,
        };
        this.http
            .put<{ token: string; expiresIn: number; userID: string;
                yarnStockCardPCS: YarnStockCardPCS;
            }>(BACKEND_URL+'/edit/usage3/stockcard/zone', dataSent)
            .subscribe({
                next: (data) => {
                    // console.log(data);
                    this.userService.genToken(data.token, data.expiresIn);
                    // this.userService.setOrderProduction(data.orderProduct);

                    // getYarnStockCardPCSListener()
                    this.userYarnStockCardPCSUpdated.next({
                        success: true,
                        yarnStockCardPCS: data.yarnStockCardPCS,
                        // yarns: data.yarns,
                        // yarnsCount: data.yarnsCount,
                    });
                }, error: error => {
                    // console.log(error.error);
                    // this.signupStatusListener.next(false);
                    // this.errorStatusListener.next(error.error.message);
                }});
    }

    // // ## putYarnLotTransferCF
    // router.put("/yarnlot/CF/transfer", checkAuth, checkUUID, yarnController.putYarnLotTransferCF);
    async putYarnLotTransferCF(yarnDataDraft: YarnDataDraft, yarnUsage1: YarnUsage, yarnLotUsage1: YarnLotUsage, orderIDTransfer: string) {
        // console.log(companyID, productID);
        const userID = this.userService?.getUserID();
        // const statusArr = JSON.stringify(status);
        const dataSent = {
            userID,
            yarnDataDraft,
            yarnUsage1,
            yarnLotUsage1,
            orderIDTransfer,
        };
        this.http
            .put<{ token: string; expiresIn: number; userID: string;
                // yarnLotInfo: YarnLotInfo
            }>(BACKEND_URL+'/yarnlot/CF/transfer', dataSent)
            .subscribe({
                next: (data) => {
                    // console.log(data);
                    this.userService.genToken(data.token, data.expiresIn);
                    // this.userService.setOrderProduction(data.orderProduct);

                    // getYarnUpdateFinishedListener()
                    this.useryarnUpdateFinishedUpdated.next({
                        finished: true,
                        // yarnPlansCount: data.yarnPlansCount,
                        // yarns: data.yarns,
                        // yarnsCount: data.yarnsCount,
                    });
                }, error: error => {
                    // console.log(error.error);
                    // this.signupStatusListener.next(false);
                    // this.errorStatusListener.next(error.error.message);
                }});
    }

    // companyID, factoryIDs, customerID, yarnSeasonID, yarnIDs, uuids, status, type, state, used, weightVerified)
    // // ## get yarn current stock /api/yarn/yarnlot/CF/rep/fac/remain getYarnRemainCF
    // router.put("/yarnlot/CF/rep/fac/remain", checkAuth, checkUUID, yarnController.getYarnRemainCF);
    async getYarnRemainCF(companyID: string, yarnSeasonID: string, yarnIDArr: string[],
        uuidArr: string[] , status: string[], type: string[], state: string[], factoryIDBoxArr: string[],
        used: boolean, weightVerified: boolean) {
        // console.log(companyID, productID);
        const userID = this.userService?.getUserID();
        // const statusArr = JSON.stringify(status);
        const dataSent = {
            companyID,
            yarnSeasonID,
            yarnIDArr,
            uuidArr,
            status,
            type,
            state,
            factoryIDBoxArr,
            used,
            weightVerified,
        };
        this.http
            .put<{ token: string; expiresIn: number; userID: string;
                yarnData: YarnData[]
            }>(BACKEND_URL+'/yarnlot/CF/rep/fac/remain', dataSent)
            .subscribe({
                next: (data) => {
                    // console.log(data);
                    this.userService.genToken(data.token, data.expiresIn);
                    // this.userService.setOrderProduction(data.orderProduct);

                    // getYarnDataListener()
                    this.useryarnDataUpdated.next({
                        yarnData: data.yarnData,
                        // yarnPlansCount: data.yarnPlansCount,
                        // yarns: data.yarns,
                        // yarnsCount: data.yarnsCount,
                    });
                }, error: error => {
                    // console.log(error.error);
                    // this.signupStatusListener.next(false);
                    // this.errorStatusListener.next(error.error.message);
                }});
    }

    // router.put("/edit/usage4/change/invoiceID", checkAuth, checkUUID, yarnController.putYarnChangeInvoiceID);
    async putYarnChangeInvoiceID(companyID: string, yarnSeasonID: string, invoiceID1: string, invoiceID2: string) {
        // console.log(companyID, productID);
        const userID = this.userService?.getUserID();
        // const statusArr = JSON.stringify(status);
        const dataSent = {
            userID,
            companyID,
            yarnSeasonID,
            invoiceID1,
            invoiceID2,
        };
        this.http
            .put<{ token: string; expiresIn: number; userID: string;
                success: boolean;
            }>(BACKEND_URL+'/edit/usage4/change/invoiceID', dataSent)
            .subscribe({
                next: (data) => {
                    // console.log(data);
                    this.userService.genToken(data.token, data.expiresIn);
                    // this.userService.setOrderProduction(data.orderProduct);

                    // getYarnEditInvoiceIDListener()
                    this.useryarnEditInvoiceIDUpdated.next({
                        success: true
                    });
                }, error: error => {
                    // console.log(error.error);
                    // this.signupStatusListener.next(false);
                    // this.errorStatusListener.next(error.error.message);
                }});
    }


    // // async getUserCompany(userID: string, page: number, limit: number) {
    // //     this.http
    // //         .get<{token: string; expiresIn: number; userID: string; company: Company[]; }>
    // //         (BACKEND_URL+'/get/company/' + this.userID+'/'+page+'/'+limit)

    // // ## get product list /api/product/getlist/:companyID/:userID/:page/:limit
    // // // router.get("/getlist/:companyID/:userID/:page/:limit", productController.getProducts);
    // async getProducts(companyID: string, page: number, limit: number) {
    //     // console.log(BACKEND_URL+'/getlist/' + companyID+'/'+ this.userService.getUserID()+'/'+page+'/'+limit);
    //     this.http
    //         .get<{token: string; expiresIn: number; userID: string; products: Product[]; productsCount: number}>
    //         (BACKEND_URL+'/getlist/' + companyID+'/'+this.userService.getUserID()+'/'+page+'/'+limit)
    //         .subscribe({
    //             next: (data) => {
    //                 // console.log(data);
    //                 this.userService.genToken(data.token, data.expiresIn);
    //                 this.setProducts(data.products);
    //                 this.userProductsListsUpdated.next({ products: data.products, productsCount: data.productsCount});
    //             }, error: error => {
    //                 // console.log(error.error);
    //                 // this.signupStatusListener.next(false);
    //                 // this.errorStatusListener.next(error.error.message);
    //             }});
    // }

    // // ## /api/product/creataenew
    // // ## router.post("/createnew", userController.postProductCreateNew);
    // postProductCreateNew(userID: string, product: Product) {
    //     const dataSent = {
    //         userID,
    //         product
    //     };
    //     this.http
    //         .post<{ token: string; expiresIn: number; userID: string; product: Product }>
    //             (BACKEND_URL+'/createnew', dataSent)
    //         .subscribe({
    //             next: (data) => {
    //                 // console.log(data);
    //                 this.userService.genToken(data.token, data.expiresIn);
    //                 this.setProduct(data.product);
    //                 // getUserProductUpdatedListener()
    //                 this.userProductListsUpdated.next({ product: data.product });
    //             }, error: error => {
    //                 // console.log(error.error);
    //                 // this.signupStatusListener.next(false);
    //                 // this.errorStatusListener.next(error.error.message);
    //             }});
    // }

    // // ## get product1 for make order
    // async getProductOrder1(companyID: string, productID: string) {
    //     const userID = this.userService?.getUserID();
    //     this.http
    //     .get<{token: string; expiresIn: number; userID: string; product: Product;}>
    //         (BACKEND_URL+'/getlist1/' + companyID+'/'+userID+'/'+productID)
    //         .subscribe({
    //             next: (data) => {
    //                 // console.log(data);
    //                 this.userService.genToken(data.token, data.expiresIn);
    //                 this.userService.setOrderProductSelect(data.product);
    //                 // this.setProduct(data.product);
    //                 // this.userProductListsUpdated.next({ product: data.product });
    //             }, error: error => {
    //                 // console.log(error.error);
    //                 // this.signupStatusListener.next(false);
    //                 // this.errorStatusListener.next(error.error.message);
    //             }});
    // }


    // // // ## /api/product/get/image/profiles  postGetProductImageProfiles
    // // router.post("/get/image/profiles", checkAuth, checkUUID, productController.postGetProductImageProfiles);
    // postGetProductImageProfiles(companyID: string, productIDs: string[]) {

    //     const dataSent = {
    //         companyID,
    //         userID: this.userService.getUserID(),
    //         productIDs
    //     };
    //     this.http
    //         .post<{ token: string; expiresIn: number; userID: string; productImageProfiles: ProductImageProfiles[] }>
    //             (BACKEND_URL+'/get/image/profiles', dataSent)
    //         .subscribe({
    //             next: (data) => {
    //                 // console.log(data);
    //                 this.userService.genToken(data.token, data.expiresIn);
    //                 // this.setProduct(data.product);
    //                 this.productImageProfilesListsUpdated.next({ productImageProfiles: data.productImageProfiles });
    //             }, error: error => {
    //                 // console.log(error.error);
    //                 // this.signupStatusListener.next(false);
    //                 // this.errorStatusListener.next(error.error.message);
    //             }});

    // }

    // // // ## /api/product/edit
    // // router.put("/edit", checkAuth, checkUUID, productController.putEditProduct);
    // putEditProduct(product: Product) {
    //     // console.log(product);
    //     const dataSent = {
    //         product: product
    //     };
    //     this.http
    //         .put<{ token: string; expiresIn: number; userID: string; product: Product }>
    //             (BACKEND_URL+'/edit', dataSent)
    //         .subscribe({
    //             next: (data) => {
    //                 // console.log(data);
    //                 this.userService.genToken(data.token, data.expiresIn);
    //                 this.setProduct(data.product);
    //                 // getUserProductUpdatedListener()
    //                 this.userProductListsUpdated.next({ product: data.product });
    //             }, error: error => {
    //                 // console.log(error.error);
    //                 // this.signupStatusListener.next(false);
    //                 // this.errorStatusListener.next(error.error.message);
    //             }});

    // }

    // ## yarn ########################################################
    // #######################################################################

    // #######################################################################
    // ##   ########################################################



    // ##   ########################################################
    // #######################################################################

    // #######################################################################
    // ## yarn report  ########################################################

    yarnIDReport = '';  // ## yarnID selected
    yarnReportID = '';  // ## report name selected
    yarnReportIDArr = [
        {yarnReportID: 'yarnReport-list', yarnReportName: 'Dashboard'},
        {yarnReportID: 'yarnReport-transfer', yarnReportName: '[Store] Yarn transfer report'},
        {yarnReportID: 'yarnReport-stock-current', yarnReportName: 'Yarn stock current'},
        // {yarnReportID: 'yarnReport-stock-current', yarnReportName: 'Yarn stock current'},
    ];

    getYarnReportName(mode: string): string {
        const yarn1 = this.yarnReportIDArr.filter(i=>i.yarnReportID === mode);
        return yarn1.length > 0 ? yarn1[0].yarnReportName : '';
    }

    // ##   ########################################################
    // #######################################################################

    // #######################################################################
    // ## observer ########################################################

    // // getYarnEditInvoiceIDListener()
    // this.useryarnEditInvoiceIDUpdated
    getYarnEditInvoiceIDListener() {
        return this.useryarnEditInvoiceIDUpdated.asObservable();
    }

    // // getYarnEditNameListener()
    // this.yarnEditNameUpdated.next
    getYarnEditNameListener() {
        return this.yarnEditNameUpdated.asObservable();
    }

    // // getYarnStockCardPCSListener()
    // this.userYarnStockCardPCSUpdated.next
    getYarnStockCardPCSListener() {
        return this.userYarnStockCardPCSUpdated.asObservable();
    }

    // // getYarnPlanStatListener()
    // this.useryarnPlanStatUpdated
    getYarnPlanStatListener() {
        return this.useryarnPlanStatUpdated.asObservable();
    }

    // this.useryarnStatDataUpdated
    getYarnyarnStatDataListener() {
        return this.useryarnStatDataUpdated.asObservable();
    }

    setYarnReportListenerToNext() {
        const yarnReportSubject: YarnReportSubject = {
            yarnID: this.yarnIDReport,
            yarnReportID: this.yarnReportID,
        };
        this.yarnReportListener.next(yarnReportSubject);
    }

    // private yarnReportListener = new Subject<yarnReportSubject>();
    getYarnReportListener() {
        return this.yarnReportListener.asObservable();
    }

    // getYarnPlanInvoiceListListener()
    // this.useryarnPlanInvoiceListUpdated.next
    getYarnPlanInvoiceListListener() {
        return this.useryarnPlanInvoiceListUpdated.asObservable();
    }

    // // getYarnUpdateFinishedListener()
    // this.useryarnUpdateFinishedUpdated.next({
    getYarnUpdateFinishedListener() {
        return this.useryarnUpdateFinishedUpdated.asObservable();
    }

    // // getYarnData1Listener()
    // this.useryarnData1Updated.next
    getYarnData1Listener() {
        return this.useryarnData1Updated.asObservable();
    }

    // useryarnDataUpdated
    getYarnDataListener() {
        return this.useryarnDataUpdated.asObservable();
    }


    // // getYarnlotBoxLastStrListener()
    // this.useryarnLotBoxLastStrUpdated
    getYarnlotBoxLastStrListener() {
        return this.useryarnLotBoxLastStrUpdated.asObservable();
    }

    // // getYarnlotInfoListener()
    // this.useryarnLotInfoUpdated.next
    getYarnlotInfoListener() {
        return this.useryarnLotInfoUpdated.asObservable();
    }

    // // getYarnUsageListener()
    // this.useryarnUsageUpdated.
    getYarnUsageListener() {
        return this.useryarnUsageUpdated.asObservable();
    }

    // // getYarnPlanList1Listener()
    // this.useryarnPlanList1Updated
    getYarnPlanList1Listener() {
        return this.useryarnPlanList1Updated.asObservable();
    }

    // getYarnPlanListListener()
    // this.useryarnPlanListUpdated
    getYarnPlanListListener() {
        return this.useryarnPlanListUpdated.asObservable();
    }

    // getYarnsInfo1UpdatedListener()
    // this.useryarnsInfo1Updated
    getYarnsInfo1UpdatedListener() {
        return this.useryarnsInfo1Updated.asObservable();
    }

    // getYarnSeasonsListUpdatedListener()
    // this.useryarnSeasonsListsUpdated.next
    getYarnSeasonsListUpdatedListener() {
        return this.useryarnSeasonsListsUpdated.asObservable();
    }

    // private useryarnsListsUpdated = new Subject<{ yarns: Yarn[], yarnsCount: number}>();
    getYarnsListUpdatedListener() {
        return this.useryarnsListsUpdated.asObservable();
    }




    // ## observer ########################################################
    // #######################################################################


    // #######################################################################****************************************************
    // ## PDF ########################################################*******************************************************************


    // #*# Yarn usage #######################################################
    contentYarnUsagePDF: any[] = [];

    // createYarnUsagePDF(this.yarnPlan.yarnID, yarnStatCalPDF)
    createYarnUsagePDF(yarnID: string, yarnStatCal1: YarnStatCal[]) {
        // YarnUsage
        // console.log('YarnUsage PDF');

        this.contentYarnUsagePDF = [];
        const contentYarnUsageHeaderTop = this.getYarnUsageHeaderPDF(yarnID);

        // // ## get body pdf
        const contentYarnUsageTable = this.getYarnUsageTablePDF1(yarnID, yarnStatCal1);

        // // ## get footer pdf
        // const contentYarnAllReceiveFooter = this.getYarnAllReceiveTablefooterPDF();

        // ...contentPackingListHeaderTop
        const pageBrake: any[] = [{text: '', pageBreak: 'after', style: ['']}];
        // this.contentYarnUsagePDF = [...this.contentPackingListPDF,  ...contentYarnUsageTable];
        this.contentYarnUsagePDF = [ ...contentYarnUsageHeaderTop, ...contentYarnUsageTable];
        // if (mode==='multi' || mode==='multi-yarn') {return this.contentPackingListPDF;}  // ## multi mode


        const docDefinition: any = this.generateYarnUsagePDF('yarn-rep08');

        // this.yarnDataInfoPackingListPDF = [];  // ## clear data
        // this.contentYarnUsagePDF = [];  // ## clear data
        // this.rowYarnPackingListPDF = [];  // ## clear data

        return docDefinition;
    }

    getYarnUsageHeaderPDF(yarnID: string) {
        // ## header top
        const datePrint = this.userService.returnDDMMYYYY(0,'-')
                        +' '
                        +this.userService.returnHHMM(0,':');
        const contentHeaderTop = [

            // {columns: [
			// 	{text: '', style: ['', '']},
            //     {text: 'Yarn Usage', style: ['', ''], alignment: 'center'},
            //     {text: '', style: ['', '']},
			// 	// {text: 'date print: ' + datePrint, italics: true, fontSize: 6, alignment: 'right', margin: [0, 0, 15, 0]}
			// ]},
            { text: 'Yarn Usage : '+this.userService.strFirstAndDot(this.getYarnfullName(yarnID), this.yarnFullNameLen), style: ['', ''], alignment: 'left', margin: [5, 10, 5, 0], },
        ];
        return contentHeaderTop;
    }

    // getYarnUsageTablePDF1(yarnID: string, yarnStatCal1: YarnStatCal[]) {
    //     yarnStatCal1.forEach( (item1, index1) => {

    //     });
    // }

    getYarnUsageTablePDF1(yarnID: string, yarnStatCal1: YarnStatCal[]) {
        let contentX: any[] = [];
        const invLen = yarnStatCal1.length;

        yarnStatCal1.forEach( (item1, index1) => {
            const contentYarnUsage1: any[] = this.getYarnUsageTablePDF2(yarnID, item1, index1);
            // contentX.push(...contentPackingListHeaderTop);
            contentX.push(...contentYarnUsage1);
            // console.log(index1);
        });
        // console.log(contentX);
        return contentX;
    }

    getYarnUsageTablePDF2(yarnID: string, yarnStatCal1: YarnStatCal, index1: number) {

        const marginTop = index1===0?5:25;
        const color1 = yarnStatCal1.color.colorCode +' '+ yarnStatCal1.color.colorName
        const contentTableHeader = [
            // {
            //     columns: [
            //         {text: '', style: ['', '']},
            //         {text: 'Yarn Usage', style: ['', ''], alignment: 'center'},
            //         {text: '', style: ['', '']},
            //         // {text: 'date print: ' + datePrint, italics: true, fontSize: 6, alignment: 'right', margin: [0, 0, 15, 0]}
            //     ]
            // },
            // { text: 'Yarn Usage : ' +this.userService.strFirstAndDot(this.getYarnfullName(yarnID), this.yarnFullNameLen), style: ['', ''], alignment: 'left', margin: [35, 20, 15, 2], },
            {
                // margin: [marginLeft, -1, marginRight, 0],
                margin: [0, marginTop, 0, 0],
                style: 'tableExample',
                // pageOrientation: 'portrait',
                table: {
                    widths: ['28%', '72%'],
                    // pageOrientation: 'portrait',
                    // headerRows: 1,
                    body: [
                        [
                            {text: 'Color', style: ['txtheadsize', 'marginHeadTop2'], alignment: 'center', fillColor: '#cccccc'},
                            {text: color1, style: ['txtheadsize', 'marginHeadTop2'], alignment: 'center'}
                        ]
                    ]
                }
            },
            {
                margin: [0, -1, 0, 0],
                style: 'tableExample',
                table: {
                    widths: ['3%','25%', '15%', '19%', '19%', '19%'],
                    body: [
                        [
                            {text: '', style: ['txtSmall7', 'marginHeadTop2'], alignment: 'center', fillColor: '#cccccc'},
                            {text: 'Style', style: ['txtheadsize', 'marginHeadTop2'], alignment: 'center', fillColor: '#cccccc'},
                            {text: 'Size', style: ['txtSmall7', 'marginHeadTop2'], alignment: 'center', fillColor: '#cccccc'},
                            {text: 'Orders', style: ['txtheadsize', 'marginHeadTop2'], alignment: 'center', fillColor: '#cccccc'},
                            {text: 'Weight (pc)', style: ['txtheadsize', 'marginHeadTop2'], alignment: 'center', fillColor: '#cccccc'},
                            {text: 'Neccesary (kgs)', style: ['txtheadsize', 'marginHeadTop2'], alignment: 'center', fillColor: '#cccccc'},
                        ],
                        ...this.getYarnUsageTableBodyPDF(yarnStatCal1),  // ## body table
                    ]
                }
            },
        ];
        return contentTableHeader;
    }

    getYarnUsageTableBodyPDF(yarnStatCal1: YarnStatCal) {
        const rowBlank = [
            {text: [{text: '', style: ['', ''], alignment: 'center'}]},
            {text: [{text: '', style: ['', ''], alignment: 'center'}]},
            {text: [{text: '', style: ['', ''], alignment: 'center'}]},
            {text: [{text: '', style: ['', ''], alignment: 'center'}]},
            {text: [{text: '', style: ['', ''], alignment: 'center'}]},
            {text: [{text: '', style: ['', ''], alignment: 'center'}]},
        ];
        let rowCurrent: any[] = [...rowBlank];
        let contentBody: any[] = [];

        // ## b=blank d=data t=total tan=totalActualNet s=shortage
        yarnStatCal1.mainZoneYarn.forEach( (item, index) => {
            let row1: any[] = [...rowBlank];
            if (item.lineMode === 'b') {
                row1 = [
                    {text: [{text: '*', style: ['color_white', ''], alignment: 'center'}]},
                    {text: [{text: '', style: ['', ''], alignment: 'center'}]},
                    {text: [{text: '', style: ['', ''], alignment: 'center'}]},
                    {text: [{text: '', style: ['', ''], alignment: 'center'}]},
                    {text: [{text: '', style: ['', ''], alignment: 'center'}]},
                    {text: [{text: '', style: ['', ''], alignment: 'center'}]},

                ];
            } else if (item.lineMode === 'd') {
                const style1 = item.orderID + ' / ' + item.targetPlaceID;
                row1 = [
                    {text: [{text: '', style: ['', ''], alignment: 'center'}]},
                    {text: [{text: style1, style: ['txtSmall7', ''], alignment: 'center'}]},
                    {text: [{text: item.sizeStr, style: ['txtSmall7', ''], alignment: 'center'}]},
                    {text: [{text: item.orderQty, style: ['txtSmall7', ''], alignment: 'center'}]},
                    {text: [{text: item.pcWeight, style: ['txtSmall7', ''], alignment: 'center'}]},
                    {text: [{text: item.totalWeight, style: ['txtSmall7', ''], alignment: 'center'}]},
                ];
            } else if (item.lineMode === 't') {
                row1 = [
                    // {text: [{text: '', style: ['', ''], alignment: 'center'}]},  // ## blank column
                    {text: [{text: 'Total', style: ['', ''], alignment: 'center'}], colSpan: 3}, {}, {}, // ##
                    // {text: [{text: '', style: ['', ''], alignment: 'center'}]},  // ## blank column
                    {text: [{text: item.orderQtyTotal, style: ['txtSmall7', ''], alignment: 'center'}]},  // ## blank column
                    {text: [{text: '', style: ['txtSmall7', ''], alignment: 'center'}]},
                    {text: [{text: ''+item.orderWeightTotal, style: ['txtSmall7', ''], alignment: 'center'}]},
                ];
            } else if (item.lineMode === 'tan') {
                row1 = [
                    {text: [{text: 'Total ( Actual.Net)', style: ['', ''], alignment: 'center'}], colSpan: 5}, {}, {}, {}, {},  // ## blank column
                    // {text: [{text: '', style: ['', ''], alignment: 'center'}]},  // ## blank column
                    // {text: [{text: '', style: ['', ''], alignment: 'center'}]},  // ## blank column
                    {text: [{text: item.orderWeightTotal, style: ['', ''], alignment: 'center'}]},  // ## blank column

                ];
            } else if (item.lineMode === 's') {
                const txt1 = 'Shortage '+item.targetPlaceName; // ## percent text
                row1 = [
                    {text: [{text: txt1, style: ['', ''], alignment: 'center'}], colSpan: 5}, {}, {}, {}, {},  // ## blank column
                    // {text: [{text: '', style: ['', ''], alignment: 'center'}]},  // ## blank column
                    // {text: [{text: '', style: ['', ''], alignment: 'center'}]},  // ## blank column
                    {text: [{text: item.orderWeightTotal, style: ['', ''], alignment: 'center'}],},  // ## blank column

                ];
            }
            // console.log(row1);
            contentBody.push([...row1]);
            rowCurrent = [...row1];
        });

        // ## add margin @ last record


        return contentBody;
    }

    generateYarnUsagePDF(repID: string) {
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
        let docDefinition: any = {
            pageSize: 'A4',
            pageMargins: [ 35, 20, 15, 30 ],
            // header: head2,
            // pageOrientation: 'portrait',
            // pageOrientation: 'portrait',
            content: this.contentYarnUsagePDF,
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
                    {text: repID, italics: true, fontSize: 6, alignment: 'left', margin: [10, 2, 0, 0]},
                    '',
                    {text: 'date print: ' + datePrint, italics: true, fontSize: 6, alignment: 'right', margin: [1, 2, 10, 0]},
                ], margin: [35, 10, 15, 0]
            },

            footer: function(currentPage: any, pageCount: any) {
                return {
                    columns: [
                      '',
                      {text: repID + ' , date print: ' + datePrint, italics: true, fontSize: 6, alignment: 'right'},
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


    // ## Yarn receive #######################################################
    yarnDataInfoYarnAllReceivePDF: YarnDataInfo[] = [];
    yarnDataInfoInvoicePDF: YarnInvoiceList[] = [];
    yarnDataInfoPackingListPDF: YarnDataInfo[] = [];

    contentYarnAllReceivePDF: any[] = [];
    contentInvoicePDF: any[] = [];
    contentPackingListPDF: any[] = [];

    rowYarnAllReceivePDF: YarnReceiveMain[] = [];
    rowYarnInvoicePDF: YarnInvoiceRow[] = [];
    rowYarnPackingListPDF: YarnPackingList[] = [];



    prepareDataYarnReceivePDF(yarnDataInfo1: YarnDataInfo[]) {
        this.yarnDataInfoYarnAllReceivePDF = [...yarnDataInfo1];
        // this.yarnDataInfoInvoicePDF = [...yarnDataInfo1];
        // this.yarnDataInfoPackingListPDF = [...yarnDataInfo1];
        // console.log(this.yarnDataInfoYarnAllReceivePDF);

        // ## for YarnAllReceive
        // console.log(this.yarnDataInfoYarnAllReceivePDF);
        this.rowYarnAllReceivePDF = [];
        this.yarnDataInfoYarnAllReceivePDF.forEach( (item1, index1) => {
            let yarnReceiveMain1: YarnReceiveMain = GBC.clrYarnReceiveMain();
            item1.packageInfo.forEach( (item2, index2) => {
                const carton = item2.yarnBoxInfo.filter(i=>i.boxID.split(this.userService.yarnDevideSign).length === 1).length;
                const dif = +(item2.yarnWeightTotal - item2.yarnPlanWeightTotal).toFixed(2);
                yarnReceiveMain1.rowState = '';
                yarnReceiveMain1.yyyymmdd = item1.yyyymmdd;
                yarnReceiveMain1.mmdd = item1.mmdd;
                yarnReceiveMain1.toFactoryID = item1.toFactoryID;
                yarnReceiveMain1.yarnColorID = item1.yarnColorID;
                yarnReceiveMain1.yarnDataUUID = item1.yarnDataUUID;
                yarnReceiveMain1.setName = item1.setName;
                yarnReceiveMain1.colorCode = item1.colorCode;
                yarnReceiveMain1.colorID = item1.colorID;

                // console.log(index2, item2.yarnLotID, item2.yarnPlanWeightTotal, item2.yarnWeightTotal, dif);
                yarnReceiveMain1.invoiceID = item2.invoiceID;
                yarnReceiveMain1.yarnLotID = item2.yarnLotID;
                yarnReceiveMain1.yarnLotUUID = item2.yarnLotUUID;

                yarnReceiveMain1.carton = carton;
                yarnReceiveMain1.yarnPlanWeightTotal = item2.yarnPlanWeightTotal;
                yarnReceiveMain1.yarnWeightTotal = item2.yarnWeightTotal;
                yarnReceiveMain1.yarnWeightDif = dif;

                yarnReceiveMain1.boxWeight = item2.boxWeight;
                yarnReceiveMain1.coneWeight = item2.coneWeight;
                yarnReceiveMain1.yarnWeightDifTotal = item2.yarnWeightDifTotal;
                yarnReceiveMain1.yarnCCWeightTotal = item2.yarnCCWeightTotal;
                yarnReceiveMain1.yarnTransferWeightTotal = item2.yarnTransferWeightTotal;
                yarnReceiveMain1.yarnWeightNetTotal = item2.yarnWeightNetTotal;

                yarnReceiveMain1.yarnWeightTotalPercent = item2.yarnWeightTotalPercent;
                // console.log(yarnReceiveMain1);
                this.rowYarnAllReceivePDF.push({...yarnReceiveMain1});
            });
        });
        // console.log(this.rowYarnAllReceivePDF);

        // console.log(this.rowYarnAllReceivePDF);
        return true;
    }

    prepareDataYarnPackingListPDF(yarnID: string, yarnDataInfo1: YarnDataInfo[]) {
        // yarnDataInfoPackingListPDF: YarnDataInfo[] = [];
        this.yarnDataInfoPackingListPDF = [...yarnDataInfo1];
        // console.log(this.yarnDataInfoPackingListPDF);

        this.rowYarnPackingListPDF = [];
        this.yarnDataInfoPackingListPDF.forEach( (item1, index1) => {
            let yarnPackingList1: YarnPackingList = GBC.clrYarnPackingList();
            item1.packageInfo.forEach( (item2, index2) => {
                yarnPackingList1.rowState = '';
                yarnPackingList1.yyyymmdd = item1.yyyymmdd;
                yarnPackingList1.mmdd = item1.mmdd;
                yarnPackingList1.toFactoryID = item1.toFactoryID;

                yarnPackingList1.yarnID = yarnID;
                yarnPackingList1.yarnColorID = item1.yarnColorID;
                yarnPackingList1.yarnDataUUID = item1.yarnDataUUID;
                yarnPackingList1.setName = item1.setName;
                yarnPackingList1.colorCode = item1.colorCode;
                yarnPackingList1.colorID = item1.colorID;

                yarnPackingList1.invoiceID = item2.invoiceID;
                yarnPackingList1.yarnLotID = item2.yarnLotID;
                yarnPackingList1.yarnLotUUID = item2.yarnLotUUID;

                yarnPackingList1.carton = item2.yarnBoxInfo.filter(i=>i.boxID.split(this.userService.yarnDevideSign).length === 1).length;
                yarnPackingList1.boxWeight = item2.boxWeight;
                yarnPackingList1.coneWeight = item2.coneWeight;
                yarnPackingList1.yarnPlanWeightTotal = item2.yarnPlanWeightTotal;
                yarnPackingList1.yarnWeightTotal = item2.yarnWeightTotal;
                yarnPackingList1.yarnWeightDifTotal = item2.yarnWeightDifTotal;
                yarnPackingList1.yarnCCWeightTotal = item2.yarnCCWeightTotal;
                yarnPackingList1.yarnTransferWeightTotal = item2.yarnTransferWeightTotal;
                yarnPackingList1.yarnWeightNetTotal = item2.yarnWeightNetTotal;
                yarnPackingList1.yarnWeightTotalPercent = item2.yarnWeightTotalPercent;
                yarnPackingList1.boxIDAllVerified = item2.boxIDAllVerified;

                yarnPackingList1.yarnBoxInfo = item2.yarnBoxInfo;
                this.rowYarnPackingListPDF.push({...yarnPackingList1});
            });
        });
        // console.log(this.rowYarnPackingListPDF);
        return true;
    }
    // boxWeight: 0.00,
    //         coneWeight: 0.00,
    // public carton: number,   // ## boxes qty
    //     public yarnPlanWeightTotal: number,

    //     public yarnWeightTotal: number,
    //     public yarnWeightDifTotal: number,
    //     public yarnCCWeightTotal: number,
    //     public yarnTransferWeightTotal: number,
    //     public yarnWeightNetTotal: number,
    //     public yarnWeightTotalPercent: string,
    //     public boxIDAllVerified: boolean,

    // public rowState: string, // ##
    //     public yyyymmdd: string,  // ## date confirm , verified
    //     public mmdd: string,
    //     public toFactoryID: string,
    //     public yarnColorID: string,
    //     public yarnDataUUID: string,
    //     public setName: string,
    //     public colorCode: string,
    //     public colorID: string,
    //     public invoiceID: string,
    //     public yarnLotID: string,
    //     public yarnLotUUID: string,

    //     public yarnBoxInfo: YarnBoxInfo[],

    // export class YarnBoxInfo {
    //     constructor(
    //         public boxID: string,
    //         public boxUUID: string,
    //         public factoryID: string,  // ## current factory store
    //         public yarnPlanWeight: number,   // {type: mongoose.Types.Decimal128},
    //         public yarnWeight: number,   // {type: mongoose.Types.Decimal128},
    //         public useWeight: number,   // {type: mongoose.Types.Decimal128},
    //         public weightVerified: boolean,
    //         public used: boolean,

    //         public yarnWeightDif: number,
    //         public state: string,  // ## new, old
    //         public errCode: string,
    //         public factoryIDBox: string,
    //     ) {}
    // }


    // ## createYarnAllReceivePDF  YarnAllReceive #########################################################
    createYarnAllReceivePDF(yarnID: string, yarnDataInfo1: YarnDataInfo[]) {
        // console.log(yarnDataInfo1);
        const next1 = this.prepareDataYarnReceivePDF(yarnDataInfo1);

        // ## yarn all receive  summary ................................................
        const rowYarnAllReceivePDF1 = [...this.rowYarnAllReceivePDF];
        rowYarnAllReceivePDF1.sort((a,b)=>{
            return a.yarnColorID >b.yarnColorID?1:a.yarnColorID <b.yarnColorID?-1:0
            || a.yyyymmdd >b.yyyymmdd?1:a.yyyymmdd <b.yyyymmdd?-1:0
            || a.invoiceID >b.invoiceID?1:a.invoiceID <b.invoiceID?-1:0
            || a.yarnLotID >b.yarnLotID?1:a.yarnLotID <b.yarnLotID?-1:0
        });

        let yarnReceiveMainBlank: YarnReceiveMain = GBC.clrYarnReceiveMain();
        yarnReceiveMainBlank.rowState = 'b'; // ## d=data , b  = blank row , t = total row, gt = grand total
        let yarnReceiveMainRunning: YarnReceiveMain = GBC.clrYarnReceiveMain();
        let yarnReceiveRows: YarnReceiveMain[] = [];

        let invTotal = 0;
        let actualTotal = 0;
        let cartonTotal = 0;
        let difTotal = 0;
        let cCTotal = 0;
        let netTotal = 0;
        let iDNTotal = 0;

        let invGTotal = 0;  // ## G grand total
        let actualGTotal = 0; // ## G grand total
        let cartonGTotal = 0; // ## G grand total
        let difGTotal = 0; // ## G grand total
        let cCGTotal = 0; // ## G grand total
        let netGTotal = 0; // ## G grand total
        let iDNGTotal = 0; // ## G grand total

        // console.log(rowYarnAllReceivePDF1);
        rowYarnAllReceivePDF1.forEach( (item1, index1) => {
            // if (index1 === 0) { yarnReceiveMainRunning = item1; }
            if (yarnReceiveMainRunning.yarnColorID === '') {
                invTotal = item1.yarnPlanWeightTotal;
                actualTotal = item1.yarnWeightTotal;
                cartonTotal = item1.carton;
                difTotal = item1.yarnWeightDif;
                cCTotal = item1.yarnCCWeightTotal;
                netTotal = item1.yarnWeightNetTotal;

                invGTotal = item1.yarnPlanWeightTotal;
                actualGTotal = item1.yarnWeightTotal;
                cartonGTotal = item1.carton;
                difGTotal = item1.yarnWeightDif;
                cCGTotal = item1.yarnCCWeightTotal;
                netGTotal = item1.yarnWeightNetTotal;

                item1.rowState = 'd';
                yarnReceiveRows.push(item1);
            } else if (item1.yarnColorID === yarnReceiveMainRunning.yarnColorID) {
                invTotal = invTotal + item1.yarnPlanWeightTotal;
                actualTotal = actualTotal + item1.yarnWeightTotal;
                cartonTotal = cartonTotal + item1.carton;
                difTotal = difTotal + item1.yarnWeightDif;
                cCTotal = cCTotal + item1.yarnCCWeightTotal;
                netTotal = netTotal + item1.yarnWeightNetTotal;

                invGTotal = invGTotal + item1.yarnPlanWeightTotal;
                actualGTotal = actualGTotal + item1.yarnWeightTotal;
                cartonGTotal = cartonGTotal + item1.carton;
                difGTotal = difGTotal + item1.yarnWeightDif;
                cCGTotal = cCGTotal + item1.yarnCCWeightTotal;
                netGTotal = netGTotal + item1.yarnWeightNetTotal;

                item1.rowState = 'd';
                yarnReceiveRows.push(item1);
            } else {
                let yarnReceiveMainRow1: YarnReceiveMain = GBC.clrYarnReceiveMain();
                yarnReceiveMainRow1.yarnLotID = 'Total';
                yarnReceiveMainRow1.yarnPlanWeightTotal = +invTotal.toFixed(2);
                yarnReceiveMainRow1.yarnWeightTotal = +actualTotal.toFixed(2);
                yarnReceiveMainRow1.carton = cartonTotal;
                yarnReceiveMainRow1.yarnWeightDif = +difTotal.toFixed(2);
                yarnReceiveMainRow1.yarnCCWeightTotal = +cCTotal.toFixed(2);
                yarnReceiveMainRow1.yarnWeightNetTotal = +netTotal.toFixed(2);

                yarnReceiveMainRow1.rowState = 't';
                yarnReceiveRows.push(yarnReceiveMainRow1);   // ## add total row
                yarnReceiveRows.push(yarnReceiveMainBlank);  // ## add blank row

                // ## after add row total , then add current data
                invTotal = item1.yarnPlanWeightTotal;
                actualTotal = item1.yarnWeightTotal;
                cartonTotal = item1.carton;
                difTotal = item1.yarnWeightDif;
                cCTotal = item1.yarnCCWeightTotal;
                netTotal = item1.yarnWeightNetTotal;

                invGTotal = invGTotal + item1.yarnPlanWeightTotal;
                actualGTotal = actualGTotal + item1.yarnWeightTotal;
                cartonGTotal = cartonGTotal + item1.carton;
                difGTotal = difGTotal + item1.yarnWeightDif;
                cCGTotal = cCGTotal + item1.yarnCCWeightTotal;
                netGTotal = netGTotal + item1.yarnWeightNetTotal;

                item1.rowState = 'd';
                yarnReceiveRows.push(item1);
            }
            if (rowYarnAllReceivePDF1.length === index1+1) {  // ## last row
                let yarnReceiveMainRow1: YarnReceiveMain = GBC.clrYarnReceiveMain();
                yarnReceiveMainRow1.yarnLotID = 'Total';
                yarnReceiveMainRow1.yarnPlanWeightTotal = +invTotal.toFixed(2);
                yarnReceiveMainRow1.yarnWeightTotal = +actualTotal.toFixed(2);
                yarnReceiveMainRow1.carton = cartonTotal;
                yarnReceiveMainRow1.yarnWeightDif = +difTotal.toFixed(2);
                yarnReceiveMainRow1.yarnCCWeightTotal = +cCTotal.toFixed(2);
                yarnReceiveMainRow1.yarnWeightNetTotal = +netTotal.toFixed(2);

                yarnReceiveMainRow1.rowState = 't';
                yarnReceiveRows.push(yarnReceiveMainRow1);   // ## add total row
                yarnReceiveRows.push(yarnReceiveMainBlank);  // ## add blank row
            }
            yarnReceiveMainRunning = item1;
        });
        yarnReceiveRows.push(yarnReceiveMainBlank);  // ## add blank row
        let yarnReceiveMainRowGT: YarnReceiveMain = GBC.clrYarnReceiveMain();  // ## grand total row
        yarnReceiveMainRowGT.yarnLotID = 'Grand Total';
        yarnReceiveMainRowGT.yarnPlanWeightTotal = +invGTotal.toFixed(2);
        yarnReceiveMainRowGT.yarnWeightTotal = +actualGTotal.toFixed(2);
        yarnReceiveMainRowGT.carton = cartonGTotal;
        yarnReceiveMainRowGT.yarnWeightDif = +difGTotal.toFixed(2);
        yarnReceiveMainRowGT.yarnCCWeightTotal = +cCGTotal.toFixed(2);
        yarnReceiveMainRowGT.yarnWeightNetTotal = +netGTotal.toFixed(2);
        yarnReceiveMainRowGT.rowState = 'gt';
        yarnReceiveRows.push(yarnReceiveMainRowGT);   // ## add grand total row

        // console.log(yarnReceiveRows);
        // console.log(next1 , '....... yarn all , lot ID  completed.......................');

        // createPackingListPDF(mode: string, yarnID: string, yarnDataInfo1: YarnDataInfo[])
        // ## state = normal, blankPackingList
        // ## include another pdf
        const packingListX = this.createPackingListPDF('multi', yarnID, yarnDataInfo1, 'normal');

        // ## yarn all receive  summary ................................................
        this.contentYarnAllReceivePDF = [];
        const contentYarnAllReceiveHeaderTop: any[] = this.getYarnAllReceiveHeaderPDF(yarnID);

        // // ## get body pdf
        const contentYarnAllReceiveTable: any = this.getYarnAllReceiveTablePDF(yarnReceiveRows);

        // // ## get footer pdf
        // const contentYarnAllReceiveFooter = this.getYarnAllReceiveTablefooterPDF();
        const pageBrake: any[] = [{text: '', pageBreak: 'after', style: ['']}];
        this.contentYarnAllReceivePDF = [
            ...this.contentYarnAllReceivePDF,
            ...contentYarnAllReceiveHeaderTop,
            contentYarnAllReceiveTable,
            ...pageBrake,
            ...packingListX,
        ];
        const docDefinition: any = this.generateYarnAllReceivePDF();

        this.yarnDataInfoYarnAllReceivePDF = [];  // ## clear data
        this.contentYarnAllReceivePDF = [];  // ## clear data
        this.rowYarnAllReceivePDF = [];  // ## clear data

        return docDefinition;
    }

    getYarnAllReceiveHeaderPDF(yarnID: string) {
        // getYarnfullName(yarnID: string)  strFirstAndDot(str: string, len: number)
        // ## header top
        const datePrint = this.userService.returnDDMMYYYY(0,'-')
                        +' '
                        +this.userService.returnHHMM(0,':');
        const contentHeaderTop = [

            {columns: [
				{text: '', style: ['', '']},
                {text: 'Yarn All Received', style: ['', ''], alignment: 'center'},
                {text: '', style: ['', '']},
				// {text: 'date print: ' + datePrint, italics: true, fontSize: 6, alignment: 'right', margin: [0, 0, 15, 0]}
			]},
            { text: this.userService.strFirstAndDot(this.getYarnfullName(yarnID), this.yarnFullNameLen), style: ['', ''], alignment: 'left', margin: [35, 0, 15, 0], },
        ];
        return contentHeaderTop;
    }

    getYarnAllReceiveTablePDF(yarnReceiveRows: YarnReceiveMain[]) {
        const contentTableHeader = {
            margin: [35, 0, 15, 0],
            style: 'tableExample',
            table: {
                // ##  11 columns    48                     20                 12                 12               8
                // ##  no      color  date 	invoiceno	Lot ID   carton   inv.Kgs   dif.Kgs   act.Kgs   CC.Kgs   NET.Kgs
                widths: ['2%', '20%', '9%', '17%',      '15%',   '5%',     '7%',    '5%',      '7%',    '5%',    '8%'],
                headerRows: 1,
                body: [
                        [
                            {text: '#', style: ['txtheadsize', 'marginHeadTop2'], alignment: 'center', fillColor: '#cccccc'},
                            {text: 'Color', style: ['txtheadsize', 'marginHeadTop2'], alignment: 'center', fillColor: '#cccccc'},
                            {text: 'Date', style: ['txtheadsize', 'marginHeadTop2'], alignment: 'center', fillColor: '#cccccc'},
                            {text: 'Invoice no.', style: ['txtheadsize', 'marginHeadTop2'], alignment: 'center', fillColor: '#cccccc'},
                            {text: 'Lot ID', style: ['txtheadsize', 'marginHeadTop2'], alignment: 'center', fillColor: '#cccccc'},
                            {text: 'Carton', style: ['txtSmall6', 'marginHeadTop2'], alignment: 'center', fillColor: '#cccccc'},
                            {text: 'Inv.Kgs', style: ['txtSmall6', 'marginHeadTop2'], alignment: 'center', fillColor: '#cccccc'},
                            {text: 'Dif.Kgs', style: ['txtSmall6', 'marginHeadTop2'], alignment: 'center', fillColor: '#cccccc'},
                            {text: 'Act.Kgs', style: ['txtSmall6', 'marginHeadTop2'], alignment: 'center', fillColor: '#cccccc'},

                            {text: 'CC.Kgs', style: ['txtSmall6', 'marginHeadTop2'], alignment: 'center', fillColor: '#cccccc'},
                            {text: 'NET.Kgs', style: ['txtheadsize', 'marginHeadTop2'], alignment: 'center', fillColor: '#cccccc'},
                            // style: ['txtheadsize', 'marginHeadTop2', 'backgroundHead']
                        ],
                        ...this.getYarnAllReceiveTableBodyPDF(yarnReceiveRows),  // ## body table
                ]
            }
        };
        return contentTableHeader;
    }

    getYarnAllReceiveTableBodyPDF(yarnReceiveRows: YarnReceiveMain[]) {
        const rowBlank = [
            {text: [{text: '*', style: ['', ''], alignment: 'center'}]},
            {text: [{text: '', style: ['', ''], alignment: 'center'}]},
            {text: [{text: '', style: ['', ''], alignment: 'center'}]},
            {text: [{text: '', style: ['', ''], alignment: 'center'}]},
            {text: [{text: '', style: ['', ''], alignment: 'center'}]},
            {text: [{text: '', style: ['', ''], alignment: 'center'}]},
            {text: [{text: '', style: ['', ''], alignment: 'center'}]},
            {text: [{text: '', style: ['', ''], alignment: 'center'}]},
            {text: [{text: '', style: ['', ''], alignment: 'center'}]},
            {text: [{text: '', style: ['', ''], alignment: 'center'}]},
            {text: [{text: '', style: ['', ''], alignment: 'center'}]},
        ];
        let rowCurrent: any[] = [...rowBlank];
        let contentBody: any[] = [];

        // ## company  col 2 / color
        function getColor1(idx:number, rowX: YarnReceiveMain, colorStr: string): any {
            if (colorStr !== rowCurrent[1].text[0].text) {
                return {text: [{
                    text: colorStr,
                    style: ['txtSmall7', ''],
                    alignment: 'center'
                }]};
            }
            return {text: [{text: colorStr, style: ['txtSmall7', 'color_white'], alignment: 'center'}]};
        }

        // ## company  col 3 / date
        function getDate1(idx:number, rowX: YarnReceiveMain): any {
            if (getDateddmmyyyy(rowX.yyyymmdd, '-') !== rowCurrent[2].text[0].text) {
                return {text: [{
                    text: getDateddmmyyyy(rowX.yyyymmdd, '-'),
                    style: ['txtSmall6', ''],
                    color: 'gray',
                    alignment: 'center'
                }]};
            }
            return {text: [{text: getDateddmmyyyy(rowX.yyyymmdd, '-'), style: ['txtSmall7', 'color_white'], alignment: 'center'}]};
        }
        function getDateddmmyyyy(yyyymmdd: string, sign:string): any {
            const dmy = yyyymmdd.split(sign);
            return dmy[2]+sign+dmy[1]+sign+dmy[0];
        }

        // ## company  col 4 / invoice no
        function getInvoice1(idx:number, rowX: YarnReceiveMain): any {
            if (rowX.invoiceID !== rowCurrent[3].text[0].text) {
                return {text: [{
                    text: rowX.invoiceID,
                    style: ['txtSmall7', ''],
                    alignment: 'center'
                }]};
            }
            return {text: [{text: rowX.invoiceID, style: ['txtSmall7', 'color_white'], alignment: 'center'}]};
        }

        // ## company  col 5 / lot ID
        function getLotID1(idx:number, rowX: YarnReceiveMain): any {
            if (rowX.yarnLotID !== rowCurrent[4].text[0].text) {
                return {text: [{
                    text: rowX.yarnLotID,
                    style: ['txtSmall7', ''],
                    alignment: 'center'
                }]};
            }
            return {text: [{text: rowX.yarnLotID, style: ['txtSmall7', 'color_white'], alignment: 'center'}]};
        }

        // ##  9Col  ## no   color  date  invoice no	Lot ID	inv.Kgs	act.Kgs	carton	dif.Kgs
        yarnReceiveRows.forEach( (item, index) => {
            let row1: any[] = [...rowBlank];
            if (item.rowState === 'b') {
                row1 = [
                    {text: [{text: '*', style: ['color_white', ''], alignment: 'center'}]},
                    {text: [{text: '', style: ['', ''], alignment: 'center'}]},
                    {text: [{text: '', style: ['', ''], alignment: 'center'}]},
                    {text: [{text: '', style: ['', ''], alignment: 'center'}]},
                    {text: [{text: '', style: ['', ''], alignment: 'center'}]},
                    {text: [{text: '', style: ['', ''], alignment: 'center'}]},
                    {text: [{text: '', style: ['', ''], alignment: 'center'}]},
                    {text: [{text: '', style: ['', ''], alignment: 'center'}]},
                    {text: [{text: '', style: ['', ''], alignment: 'center'}]},
                    {text: [{text: '', style: ['', ''], alignment: 'center'}]},
                    {text: [{text: '', style: ['', ''], alignment: 'center'}]},
                ];
            } else if (item.rowState === 'd') {
                row1 = [
                    {text: [{text: '', style: ['', ''], alignment: 'center'}]},  // ## blank column
                    getColor1(index, item, item.colorCode + ' ' + this.userService.getColorNameByColorCode(item.colorID, item.setName)),
                    getDate1(index, item),
                    getInvoice1(index, item),
                    getLotID1(index, item),

                    {text: [{text: item.carton, style: ['txtSmall6', ''], alignment: 'center'}]},
                    {text: [{text: item.yarnPlanWeightTotal, style: ['txtSmall6', ''], alignment: 'center'}]},
                    {text: [{text: item.yarnWeightDif, style: ['txtSmall6', ''], alignment: 'center'}]},
                    {text: [{text: item.yarnWeightTotal, style: ['txtSmall7', ''], alignment: 'center'}]},
                    {text: [{text: '- '+item.yarnCCWeightTotal, style: ['txtSmall6', ''], alignment: 'center'}]},
                    {text: [{text: item.yarnWeightNetTotal, style: ['txtSmall7', 'txtBold'], alignment: 'center'}]},
                ];
            } else if (item.rowState === 't') {
                row1 = [
                    {text: [{text: '', style: ['', ''], alignment: 'center'}]},  // ## blank column
                    {text: [{text: '', style: ['', ''], alignment: 'center'}]},  // ## blank column
                    {text: [{text: '', style: ['', ''], alignment: 'center'}]},  // ## blank column
                    {text: [{text: '', style: ['', ''], alignment: 'center'}]},  // ## blank column
                    {text: [{text: 'Total', style: ['txtSmall8', 'txtBold'], alignment: 'center'}], fillColor: '#faedc4'},
                    {text: [{text: ''+item.carton, style: ['txtSmall7', ''], alignment: 'center'}], fillColor: '#faedc4'},
                    {text: [{text: ''+item.yarnPlanWeightTotal, style: ['txtSmall7', ''], alignment: 'center'}], fillColor: '#faedc4'},
                    {text: [{text: ''+item.yarnWeightDif, style: ['txtSmall6', ''], alignment: 'center'}], fillColor: '#faedc4'},
                    {text: [{text: ''+item.yarnWeightTotal, style: ['txtSmall7', 'txtBold'], alignment: 'center'}], fillColor: '#faedc4'},
                    {text: [{text: '- '+item.yarnCCWeightTotal, style: ['txtSmall6', ''], alignment: 'center'}], fillColor: '#faedc4'},
                    {text: [{text: ''+item.yarnWeightNetTotal, style: ['txtSmall7', 'txtBold'], alignment: 'center'}], fillColor: '#faedc4'},
                ];
            } else if (item.rowState === 'gt') {
                row1 = [
                    {text: [{text: '', style: ['', ''], alignment: 'center'}]},  // ## blank column
                    {text: [{text: '', style: ['', ''], alignment: 'center'}]},  // ## blank column
                    {text: [{text: '', style: ['', ''], alignment: 'center'}]},  // ## blank column
                    {text: [{text: '', style: ['', ''], alignment: 'center'}]},  // ## blank column
                    {text: [{text: 'Grand Total', style: ['txtSmall8', 'txtBold'], alignment: 'center'}], fillColor: '#fcc39b'},
                    {text: [{text: ''+item.carton, style: ['txtSmall7', 'txtBold'], alignment: 'center'}], fillColor: '#fcc39b'},
                    {text: [{text: ''+item.yarnPlanWeightTotal, style: ['txtSmall7', 'txtBold'], alignment: 'center'}], fillColor: '#fcc39b'},
                    {text: [{text: ''+item.yarnWeightDif, style: ['txtSmall7', ''], alignment: 'center'}], fillColor: '#fcc39b'},
                    {text: [{text: ''+item.yarnWeightTotal, style: ['txtSmall7', 'txtBold'], alignment: 'center'}], fillColor: '#fcc39b'},
                    {text: [{text: '- '+item.yarnCCWeightTotal, style: ['txtSmall7', ''], alignment: 'center'}], fillColor: '#fcc39b'},
                    {text: [{text: ''+item.yarnWeightNetTotal, style: ['txtSmall7', 'txtBold'], alignment: 'center'}], fillColor: '#fcc39b'},
                ];
            }
            // console.log(row1);
            contentBody.push([...row1]);
            rowCurrent = [...row1];
        });

        return contentBody;
    }

    generateYarnAllReceivePDF() {
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
        let docDefinition: any = {
            pageSize: 'A4',
            pageMargins: [ 35, 20, 15, 30 ],
            // header: head2,
            // pageOrientation: 'portrait',
            // pageOrientation: 'portrait',
            content: this.contentYarnAllReceivePDF,
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
                    {text: 'yarn-rep01', italics: true, fontSize: 6, alignment: 'left', margin: [10, 2, 0, 0]},
                    '',
                    {text: 'date print: ' + datePrint, italics: true, fontSize: 6, alignment: 'right', margin: [1, 2, 10, 0]},
                ], margin: [35, 10, 15, 0]
            },

            footer: function(currentPage: any, pageCount: any) {
                return {
                    columns: [
                      '',
                      {text: 'yarn-rep01  , date print: ' + datePrint, italics: true, fontSize: 6, alignment: 'right'},
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

    // ## createPackingListPDF  PackingList #########################################################
    // ## state = normal, blankPackingList
    // ## mode = 'single' , 'multi'  multi=print with another pdf  ,  multi-yarn = call from yarnInvoice
    createPackingListPDF(mode: string, yarnID: string, yarnDataInfo1: YarnDataInfo[], state: string) {
        // console.log(yarnDataInfo1);
        if (mode==='single' || mode==='multi'|| mode==='multi-yarn') {
            const next1 = this.prepareDataYarnPackingListPDF(yarnID, yarnDataInfo1);
        }

        let rowYarnPackingListPDF1 = [...this.rowYarnPackingListPDF];
        // console.log(rowYarnPackingListPDF1);
        rowYarnPackingListPDF1.sort((a,b)=>{
            return a.yarnID >b.yarnID?1:a.yarnID <b.yarnID?-1:0
            || a.yarnColorID >b.yarnColorID?1:a.yarnColorID <b.yarnColorID?-1:0
            || a.yyyymmdd >b.yyyymmdd?1:a.yyyymmdd <b.yyyymmdd?-1:0
            || a.invoiceID >b.invoiceID?1:a.invoiceID <b.invoiceID?-1:0
            || a.yarnLotID >b.yarnLotID?1:a.yarnLotID <b.yarnLotID?-1:0
            // || a.yarnLotID >b.yarnLotID?1:a.yarnLotID <b.yarnLotID?-1:0
            // || a.YarnBoxInfo.boxID >b.YarnBoxInfo.boxID?1:a.carton <b.carton?-1:0
        });
        rowYarnPackingListPDF1.forEach( (item1, index1) => {
            item1.yarnBoxInfo = item1.yarnBoxInfo.filter(i=>i.boxID.split(this.userService.yarnDevideSign).length === 1);
            item1.yarnBoxInfo.sort((a,b)=>{
                return +a.boxID > +b.boxID?1: +a.boxID < +b.boxID?-1:0
            });
        });
        // console.log(rowYarnPackingListPDF1);
        // console.log('....... yarn all packing list completed.......................');

        this.contentPackingListPDF = [];
        const contentPackingListHeaderTop = this.getPackingListHeaderPDF(yarnID);

        // // ## get body pdf
        const contentPackingListTable = this.getPackingListTablePDF(mode, yarnID, rowYarnPackingListPDF1, state);

        // // ## get footer pdf
        // const contentYarnAllReceiveFooter = this.getYarnAllReceiveTablefooterPDF();

        // ...contentPackingListHeaderTop
        const pageBrake: any[] = [{text: '', pageBreak: 'after', style: ['']}];
        this.contentPackingListPDF = [...this.contentPackingListPDF,  ...contentPackingListTable];
        if (mode==='multi' || mode==='multi-yarn') {return this.contentPackingListPDF;}  // ## multi mode
        const docDefinition: any = this.generatePackingListPDF('yarn-rep03');

        this.yarnDataInfoPackingListPDF = [];  // ## clear data
        this.contentPackingListPDF = [];  // ## clear data
        this.rowYarnPackingListPDF = [];  // ## clear data

        return docDefinition;
    }

    getPackingListHeaderPDF(yarnID: string) {
        // ## header top
        const datePrint = this.userService.returnDDMMYYYY(0,'-')
                        +' '
                        +this.userService.returnHHMM(0,':');
        const contentHeaderTop = [
            {columns: [
				{text: '', style: ['', '']},
                {text: 'Yarn All Received [packing list]', style: ['', ''], alignment: 'center'},
                {text: '', style: ['', '']},
				// {text: 'date print: ' + datePrint, italics: true, fontSize: 6, alignment: 'right', margin: [0, 0, 15, 0]}
			]}, // , margin: [35, 0, 15, 0]
            // { text: yarnID, style: ['', ''], alignment: 'left', margin: [15, 0, 15, 0], },
        ];
        return contentHeaderTop;
    }

    // ## state = normal, blankPackingList
    getPackingListTablePDF(mode: string, yarnID: string, rowYarnPackingListPDF: YarnPackingList[], state: string) {
        let contentX: any[] = [];
        const invLen = rowYarnPackingListPDF.length;

        rowYarnPackingListPDF.forEach( (item1, index1) => {
            const contentInVPackingList1: any[] = this.genInvoicePackingListTablePDF(mode, yarnID, item1, invLen===index1+1, index1, state);
            // contentX.push(...contentPackingListHeaderTop);
            contentX.push(...contentInVPackingList1);
            // console.log(index1);
        });
        // console.log(contentX);
        return contentX;
    }

    // printedPageBrakeInv = false;
    // invLessThanFirstTotalRow = false;
    // invFirstTotalRowLastpage = 48;
    genInvoicePackingListTablePDF(mode: string, yarnID: string, yarnPackingList1: YarnPackingList, lastInvoice: boolean,
        idx: number, state: string) {
        // ## state = normal, blankPackingList

        // this.printedPageBrakeInv = false;

        // if (idx === 0) { this.invLessThanFirstTotalRow = false; }


        const yarnIDx = yarnPackingList1.yarnID;
        const yarnFuullName = this.userService.strFirstAndDot(this.getYarnfullName(yarnIDx), 60)
        const setName = yarnPackingList1.setName;
        const invoiceID = yarnPackingList1.invoiceID;
        const colorName = yarnPackingList1.colorCode
                        + ' '
                        + this.userService.getColorNameByColorCode(yarnPackingList1.colorID, yarnPackingList1.setName);
        const yarnLotID = yarnPackingList1.yarnLotID;

        // Inv.Kgs		Act.Kgs		Dif.Kgs		Dif %
        // Carton.Kgs	Cone.Kgs	CC.Kgs		NET.Kgs
        const invKG = yarnPackingList1.yarnPlanWeightTotal;
        const actKG = yarnPackingList1.yarnWeightTotal;
        const difKG = yarnPackingList1.yarnWeightDifTotal;
        const receivePercent = yarnPackingList1.yarnWeightTotalPercent;

        const cartonQty = yarnPackingList1.carton;
        const cartonKG = yarnPackingList1.boxWeight;
        // console.log(yarnPackingList1.coneWeight;);
        const coneKG = +yarnPackingList1.coneWeight ;
        const cCKG = Math.abs(yarnPackingList1.yarnCCWeightTotal);
        const netKG = yarnPackingList1.yarnWeightNetTotal;

        const iDNKG = invKG - netKG > 0 ? '- '+(invKG - netKG).toFixed(2) : '';

        // ## sometime error margin , page >= 2 error
        // ## adjust right margin

        let marginLeft = 0;
        let marginRight = 50;  // 15   65


        if (mode==='single') {
            marginLeft = 0;
            marginRight = 15;
        } else if ((mode==='multi-yarn') && idx <= 1) {
            marginLeft = 0;
            marginRight = 50;

        } else if ((mode==='multi') && idx <= 1) {
            marginLeft = 0;
            marginRight = 15;
        }
        // if (yarnPackingList1.yarnBoxInfo.length <= this.invFirstTotalRowLastpage) { this.invLessThanFirstTotalRow = true; }

        const pageBrake: any[] = [{text: '', pageBreak: 'after', style: ['']}];

        function getPageBrake() {
            if (lastInvoice) {
                return undefined;
            }
            return {text: '', pageBreak: 'after', style: ['']};
        }

        const contentTableHeader = [
            {
                columns: [
                    {text: '', style: ['', '']},
                    {text: 'Yarn All Received [packing list]', style: ['', ''], alignment: 'center'},
                    {text: '', style: ['', '']},
                    // {text: 'date print: ' + datePrint, italics: true, fontSize: 6, alignment: 'right', margin: [0, 0, 15, 0]}
                ] , margin: [marginLeft, 0, marginRight, 0]
            },
            {
                margin: [marginLeft, -1, marginRight, 0],
                style: 'tableExample',
                // pageOrientation: 'portrait',
                table: {
                    widths: ['9.7%', '17.3%', '12%', '61%'],
                    // pageOrientation: 'portrait',
                    // headerRows: 1,
                    body: [
                        [
                            {text: 'Date', style: ['txtheadsize', 'marginHeadTop2'], alignment: 'center', fillColor: '#cccccc'},
                            {text: '', style: ['txtheadsize', 'marginHeadTop2'], alignment: 'center'},
                            {text: 'Yarn', style: ['txtheadsize', 'marginHeadTop2'], alignment: 'center', fillColor: '#cccccc'},
                            {text: yarnFuullName, style: ['txtheadsize', 'marginHeadTop2'], alignment: 'center'},
                        ],
                        [
                            {text: 'Saler Name', style: ['txtheadsize', 'marginHeadTop2'], alignment: 'center', fillColor: '#cccccc'},
                            {text: setName.toUpperCase(), style: ['txtheadsize', 'marginHeadTop2'], alignment: 'center'},
                            {text: 'Invoice no', style: ['txtheadsize', 'marginHeadTop2'], alignment: 'center', fillColor: '#cccccc'},
                            {text: invoiceID, style: ['txtheadsize', 'marginHeadTop2'], alignment: 'center'},
                        ],
                        // [
                        //     {text: 'Color', style: ['txtheadsize', 'marginHeadTop2'], alignment: 'center', fillColor: '#cccccc'},
                        //     {text: colorName, style: ['txtheadsize', 'marginHeadTop2'], alignment: 'center'},
                        //     {text: 'Lot ID', style: ['txtheadsize', 'marginHeadTop2'], alignment: 'center', fillColor: '#cccccc'},
                        //     {text: yarnLotID, style: ['txtheadsize', 'marginHeadTop2'], alignment: 'center'},
                        // ]
                    ]
                }
            },
            {
                margin: [marginLeft, -1, marginRight, 0],
                style: 'tableExample',
                table: {
                    widths: ['9.7%', '31.3%', '8%', '51%'],
                    // headerRows: 1,
                    body: [
                        [
                            {text: 'Color', style: ['txtheadsize', 'marginHeadTop2'], alignment: 'center', fillColor: '#cccccc'},
                            {text: colorName, style: ['txtSmall7', 'marginHeadTop2'], alignment: 'center'},
                            {text: 'Lot ID', style: ['txtheadsize', 'marginHeadTop2'], alignment: 'center', fillColor: '#cccccc'},
                            {text: yarnLotID, style: ['txtheadsize', 'marginHeadTop2'], alignment: 'center'},
                        ]
                    ]
                }
            },
            {
                margin: [marginLeft, -1, marginRight, 0],
                style: 'tableExample',
                table: {
                    widths: ['11%', '11%', '9%', '11%',   '9%', '11%', '9%', '11%' , '7%', '11%'],
                    // headerRows: 1,
                    body: [
                        [
                            {text: 'Inv.Kgs', style: ['txtheadsize', 'marginHeadTop2'], alignment: 'center', fillColor: '#cccccc'},
                            {text: invKG.toFixed(2), style: ['txtSmall7', 'marginHeadTop2'], alignment: 'center'},
                            {text: 'T.Dif.Kgs', style: ['txtheadsize', 'marginHeadTop2'], alignment: 'center', fillColor: '#cccccc'},
                            {text: difKG.toFixed(2), style: ['txtSmall7', 'marginHeadTop2'], alignment: 'center'},
                            {text: 'Act.Kgs', style: ['txtheadsize', 'marginHeadTop2'], alignment: 'center', fillColor: '#cccccc'},
                            {text: actKG.toFixed(2), style: ['txtheadsize', 'marginHeadTop2'], alignment: 'center'},
                            {text: 'Receive%', style: ['txtheadsize', 'marginHeadTop2'], alignment: 'center', fillColor: '#cccccc'},
                            {text: receivePercent+'%', style: ['txtheadsize', 'marginHeadTop2'], alignment: 'center'},
                            {text: '', style: ['txtheadsize', 'marginHeadTop2'], alignment: 'center', fillColor: '#cccccc'},
                            {text: '', style: ['txtheadsize', 'marginHeadTop2'], alignment: 'center'},
                        ],
                        [
                            {text: 'Carton.Kgs', style: ['txtheadsize', 'marginHeadTop2'], alignment: 'center', fillColor: '#cccccc'},
                            {text: cartonKG.toFixed(2)+' , Qty: '+ cartonQty, style: ['txtSmall7', 'marginHeadTop2'], alignment: 'center'},
                            {text: 'Cone.Kgs', style: ['txtheadsize', 'marginHeadTop2'], alignment: 'center', fillColor: '#cccccc'},
                            {text: coneKG.toFixed(3), style: ['txtheadsize', 'marginHeadTop2'], alignment: 'center'},
                            {text: 'T.CC.Kgs', style: ['txtheadsize', 'marginHeadTop2'], alignment: 'center', fillColor: '#cccccc'},
                            {text: '- '+cCKG.toFixed(2), style: ['txtSmall7', 'marginHeadTop2'], alignment: 'center'},
                            {text: 'NET.Kgs', style: ['txtheadsize', 'marginHeadTop2'], alignment: 'center', fillColor: '#cccccc'},
                            {text: netKG.toFixed(2), style: ['txtheadsize', 'marginHeadTop2'], alignment: 'center'},
                            {text: 'T. i-n', style: ['txtheadsize', 'marginHeadTop2'], alignment: 'center', fillColor: '#cccccc'},
                            {text: iDNKG, style: ['txtheadsize', 'marginHeadTop2'], alignment: 'center'},
                        ]
                    ]
                }
            },
            // ## state = normal, blankPackingList
            ...this.getPackingListTableHeaderBody(yarnPackingList1, marginLeft, marginRight, state),  // ## header body table

            // ...pageBrake   // ## cut end to new next page
            getPageBrake()
        ];
        return contentTableHeader;
    }

    // ## state = normal, blankPackingList
    getPackingListTableHeaderBody(yarnPackingList1: YarnPackingList, marginLeft: number, marginRight: number, state: string) {
        let headerBodyPackingList: any[] = []
        if (state === 'normal') {
            headerBodyPackingList = this.getPackingListTableHeaderBodyPDF(yarnPackingList1, marginLeft, marginRight);
        } else if (state === 'blankPackingList') {
            headerBodyPackingList = this.getPackingListTableHeaderBodyBlankPackingListPDF(yarnPackingList1, marginLeft, marginRight);
        }
        return headerBodyPackingList;
    }

    getPackingListTableHeaderBodyPDF(yarnPackingList1: YarnPackingList, marginLeft: number, marginRight: number) {
        // if (state === 'normal') { return null;}
        let headerBodyPackingList: any[] = []
        const headerBody =
            {
                margin: [marginLeft, -1, marginRight, 0],
                style: 'tableExample',
                table: {                     //  col = 9     cone  CC.KG   NET
                    widths: ['4%', '7%', '12%', '7%', '13%', '5%', '8%', '13%', '11%', '20%'],
                    headerRows: 1,
                    body: [
                        [
                            {text: '###', style: ['txtheadsize', 'marginHeadTop2'], alignment: 'center', fillColor: '#cccccc'},
                            {text: '#Carton', style: ['txtheadsize', 'marginHeadTop2'], alignment: 'center', fillColor: '#cccccc'},
                            {text: 'Inv Kgs.', style: ['txtheadsize', 'marginHeadTop2'], alignment: 'center', fillColor: '#cccccc'},
                            {text: 'Dif Kgs.', style: ['txtheadsize', 'marginHeadTop2'], alignment: 'center', fillColor: '#cccccc'},
                            {text: 'Actual Kgs.', style: ['txtheadsize', 'marginHeadTop2'], alignment: 'center', fillColor: '#cccccc'},

                            {text: 'cone', style: ['txtheadsize', 'marginHeadTop2'], alignment: 'center', fillColor: '#cccccc'},
                            {text: 'CC.KG', style: ['txtheadsize', 'marginHeadTop2'], alignment: 'center', fillColor: '#cccccc'},
                            {text: 'NET', style: ['txtheadsize', 'marginHeadTop2'], alignment: 'center', fillColor: '#cccccc'},
                            {text: 'i-n', style: ['txtheadsize', 'marginHeadTop2'], alignment: 'center', fillColor: '#cccccc'},
                            {text: 'Note', style: ['txtheadsize', 'marginHeadTop2'], alignment: 'center', fillColor: '#cccccc'},
                        ],
                        ...this.getPackingListTableBodyPDF(yarnPackingList1),  // ## body table
                    ],
                }
            };
        headerBodyPackingList = [headerBody];
        return headerBodyPackingList;
    }

    getPackingListTableBodyPDF(yarnPackingList1: YarnPackingList) {
        let bodyPackingList: any[] = []
        const lastRow = yarnPackingList1.yarnBoxInfo.length - 1;

        function getPageBrake(idx: number) {
            if (lastRow === idx) {
                return {text: [{text: '', style: ['', ''], alignment: 'center'}], pageBreak: 'after'};
            }
            return {text: [{text: '', style: ['', ''], alignment: 'center'}]};
        }

        yarnPackingList1.yarnBoxInfo.forEach( (item1, index1) => {
            let row1: any[] = [];
            const weightDif = +(item1.yarnWeight - item1.yarnPlanWeight).toFixed(2);
            const iDN = +(item1.yarnPlanWeight - item1.yarnWeightNet).toFixed(2); // ## invoice dif net
            row1 = [
                {text: [{text: index1 + 1 +'', style: ['', ''], alignment: 'center'}], color: 'black'},
                {text: [{text: item1.boxID, style: ['', ''], alignment: 'center'}], color: 'black'},
                {text: [{text: item1.yarnPlanWeight.toFixed(2), style: ['', ''], alignment: 'center'}], color: 'black'},
                {text: [{text: weightDif.toFixed(2), style: ['', ''], alignment: 'center'}], color: 'black'},
                {text: [{text: (+item1.yarnWeight + 0).toFixed(2), style: ['txtBold', ''], alignment: 'center'}]},

                {text: [{text: item1.coneQty, style: ['', ''], alignment: 'center'}], color: 'black', italics: true},
                {text: [{text: '- '+item1.cCWeight.toFixed(2), style: ['', ''], alignment: 'center'}], color: 'black'},
                {text: [{text: item1.yarnWeightNet.toFixed(2), style: ['txtBold', 'txt9'], alignment: 'center'}], color: 'black'},

                {text: [{text: iDN>0? '- '+iDN.toFixed(2):'', style: ['txtSmall7', ''], alignment: 'center', italics: true}]},

                {text: [{text: '', style: ['', ''], alignment: 'center'}]},
                // getPageBrake(index1),
            ];
            bodyPackingList.push(row1);
        });
        // const rowBreakAfter

        return bodyPackingList;
    }

    // ## state ===  blankPackingList
    getPackingListTableHeaderBodyBlankPackingListPDF(yarnPackingList1: YarnPackingList, marginLeft: number, marginRight: number) {
        let headerBodyPackingList: any[] = []
        const headerBody =
            {
                margin: [marginLeft, -1, marginRight, 0],
                style: 'tableExample',
                table: {                     //  col = 10     cone  CC.KG   NET
                    widths: ['10%', '10%', '10%', '10%', '10%', '10%', '10%', '10%', '10%', '10%'],
                    headerRows: 1,
                    body: [
                        [
                            {text: '#Carton', style: ['txtheadsize', 'marginHeadTop2'], alignment: 'center', fillColor: '#cccccc'},
                            {text: 'NET', style: ['txtheadsize', 'marginHeadTop2'], alignment: 'center', fillColor: '#cccccc'},
                            {text: '', style: ['txtheadsize', 'marginHeadTop2'], alignment: 'center', fillColor: '#cccccc'},
                            {text: '', style: ['txtheadsize', 'marginHeadTop2'], alignment: 'center', fillColor: '#cccccc'},
                            {text: '', style: ['txtheadsize', 'marginHeadTop2'], alignment: 'center', fillColor: '#cccccc'},
                            {text: '', style: ['txtheadsize', 'marginHeadTop2'], alignment: 'center', fillColor: '#cccccc'},
                            {text: '', style: ['txtheadsize', 'marginHeadTop2'], alignment: 'center', fillColor: '#cccccc'},
                            {text: '', style: ['txtheadsize', 'marginHeadTop2'], alignment: 'center', fillColor: '#cccccc'},
                            {text: '', style: ['txtheadsize', 'marginHeadTop2'], alignment: 'center', fillColor: '#cccccc'},
                            {text: '', style: ['txtheadsize', 'marginHeadTop2'], alignment: 'center', fillColor: '#cccccc'},

                        ],
                        ...this.getPackingListTableBodyBlankPackingListPDF(yarnPackingList1),  // ## body table
                    ],
                }
            };
        headerBodyPackingList = [headerBody];
        return headerBodyPackingList;
    }

    getPackingListTableBodyBlankPackingListPDF(yarnPackingList1: YarnPackingList) {
        let bodyPackingList: any[] = []
        const lastRow = yarnPackingList1.yarnBoxInfo.length - 1;

        function getPageBrake(idx: number) {
            if (lastRow === idx) {
                return {text: [{text: '', style: ['', ''], alignment: 'center'}], pageBreak: 'after'};
            }
            return {text: [{text: '', style: ['', ''], alignment: 'center'}]};
        }

        yarnPackingList1.yarnBoxInfo.forEach( (item1, index1) => {
            let row1: any[] = [];
            const weightDif = +(item1.yarnWeight - item1.yarnPlanWeight).toFixed(2);
            row1 = [
                {text: [{text: item1.boxID, style: ['', ''], alignment: 'center'}], color: 'black'},
                {text: [{text: item1.yarnWeightNet.toFixed(2), style: ['txtBold', 'txt9'], alignment: 'center'}], color: 'black'},
                {text: [{text: '', style: ['', ''], alignment: 'center'}]},
                {text: [{text: '', style: ['', ''], alignment: 'center'}]},
                {text: [{text: '', style: ['', ''], alignment: 'center'}]},
                {text: [{text: '', style: ['', ''], alignment: 'center'}]},
                {text: [{text: '', style: ['', ''], alignment: 'center'}]},
                {text: [{text: '', style: ['', ''], alignment: 'center'}]},
                {text: [{text: '', style: ['', ''], alignment: 'center'}]},
                {text: [{text: '', style: ['', ''], alignment: 'center'}]},
                // getPageBrake(index1),
            ];
            bodyPackingList.push(row1);
        });
        // const rowBreakAfter

        return bodyPackingList;
    }

    generatePackingListPDF(headerTxt: string) {
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
            txt10: {
                fontSize: 10,
            },
            txt9: {
                fontSize: 9,
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
        let docDefinition: any = {
            pageSize: 'A4',
            pageMargins: [ 30, 20, 15, 30 ],

            // pageOrientation: 'portrait',
            // pageOrientation: 'portrait',
            content: this.contentPackingListPDF,
            // header: headerTxt,
            // header: {
            //     columns: [
            //         headerTxt,
            //         '',
            //         {text: 'date print: ' + datePrint, italics: true, fontSize: 6, alignment: 'right'},
            //     ]
            // },
            // header: {
            //     columns: [
            //         {text: headerTxt , italics: true, fontSize: 6, alignment: 'left', margin: [10, 2, 0, 0]},
            //         '',
            //         {text: 'date print: ' + datePrint, italics: true, fontSize: 6, alignment: 'right', margin: [1, 2, 10, 0]},
            //     ], margin: [35, 10, 15, 0]
            // },
            header: {
                columns: [
                    {text: headerTxt , italics: true, fontSize: 6, alignment: 'left', margin: [10, 2, 0, 0]},
                    '',
                    {text: 'date print: ' + datePrint, italics: true, fontSize: 6, alignment: 'right', margin: [1, 2, 10, 0]},
                ] //, margin: [35, 10, 15, 0]
            },
            // footer: function(currentPage: any, pageCount: any) {
            //     return {
            //         columns: [
            //           '',
            //           {text: headerTxt + ' , date print: ' + datePrint, italics: true, fontSize: 6, alignment: 'right'},
            //           '',
            //           { text: currentPage.toString() + ' of ' + pageCount, alignment: 'right' },
            //           '',
            //         ], margin: [35, 0, 15, 5]
            //       };
            // },
            footer: function(currentPage: any, pageCount: any) {
                return {
                    columns: [
                      '',
                      {text: headerTxt + ' , date print: ' + datePrint, italics: true, fontSize: 6, alignment: 'right'},
                      '',
                      { text: currentPage.toString() + ' of ' + pageCount, alignment: 'right' },
                      '',
                    ] //, margin: [35, 0, 15, 5]
                  };
            },
            // content: content1,
            // content: [content1, content1],
            // defaultStyle: {font: 'Roboto', fontSize: 10},
            defaultStyle: { fontSize: 8},
            styles: style,
        };

        // pdfMake.createPdf(docDefinition).open();
        return docDefinition;
    }



    // ## createInvoicePDF  Invoice  #########################################################

    prepareDataYarnInvoicePDF(yarnInvoiceList: YarnInvoiceList[]) {
        // yarnDataInfoPackingListPDF: YarnDataInfo[] = [];
        this.yarnDataInfoInvoicePDF = [...yarnInvoiceList];

        this.rowYarnInvoicePDF = [];
        let cartonTotalSubY = 0;
        let yarnPlanWeightTotalTotalSubY = 0;
        let yarnWeightDifTotalSubY = 0;
        let yarnWeightTotalTotalSubY = 0;
        let yarnCCWeightTotalTotalSubY = 0;
        let yarnWeightNetTotalTotalSubY = 0;
        // let yarnWeightTotalDifPercentSubY = 0.00;

        let cartonTotalY = 0;
        let yarnPlanWeightTotalTotalY = 0;
        let yarnWeightDifTotalY = 0;
        let yarnWeightTotalTotalY = 0;
        let yarnCCWeightTotalTotalY = 0;
        let yarnWeightNetTotalTotalY = 0;
        // let yarnWeightTotalDifPercentTotalY = 0.00;
            // carton
            // yarnPlanWeightTotal
            // yarnWeightDif
            // yarnWeightTotal
            // yarnCCWeightTotal
            // yarnWeightNetTotal
        let yarnInvoiceRowCurrent: YarnInvoiceRow = GBC.clrYarnInvoiceRow();
        this.yarnDataInfoInvoicePDF.forEach( (item1, index1) => {
            let rowYarnInvoice1: YarnInvoiceRow = GBC.clrYarnInvoiceRow();

            if (yarnInvoiceRowCurrent.rowState === '') {
                rowYarnInvoice1.rowState = 'y';  // ## y=yarn
                rowYarnInvoice1.yyyymmdd = item1.yyyymmdd;
                rowYarnInvoice1.mmdd = this.userService.getMonthNamebyID(item1.mmdd.substr(0, 2), 'short') + item1.mmdd.substr(2, 3);
                // getMonthNamebyID(monthID: string, mode: 'short'|'full')

                rowYarnInvoice1.yarnID = item1.yarnID;
                rowYarnInvoice1.setName = item1.setName;
                rowYarnInvoice1.invoiceID = item1.invoiceID;
                this.rowYarnInvoicePDF.push({...rowYarnInvoice1});  // ## add row yarn

                // rowYarnInvoice1.rowState = 'd';
                // rowYarnInvoice1.yarnID = item1.yarnID;
                // rowYarnInvoice1.invoiceID = item1.invoiceID;
                // rowYarnInvoice1.yarnColorID = item1.yarnColorID;
                // rowYarnInvoice1.setName = item1.setName;
                // rowYarnInvoice1.colorCode = item1.colorCode;
                // rowYarnInvoice1.colorID = item1.colorID;

                // rowYarnInvoice1.yarnLotID = item1.yarnLotID;
                // rowYarnInvoice1.yarnBoxInfo = item1.yarnBoxInfo;

                // rowYarnInvoice1.carton = item1.carton;
                // rowYarnInvoice1.yarnPlanWeightTotal = item1.yarnPlanWeightTotal;
                // rowYarnInvoice1.yarnWeightTotal = item1.yarnWeightTotal;
                // rowYarnInvoice1.yarnWeightDif = item1.yarnWeightDif;
                // rowYarnInvoice1.yarnWeightTotalPercent = item1.yarnWeightTotalPercent;
                // rowYarnInvoice1.yarnWeightTotalDifPercent = item1.yarnWeightTotalDifPercent;

                // this.rowYarnInvoicePDF.push({...rowYarnInvoice1});  // ## add row yarn Lot ID
                // yarnInvoiceRowCurrent = {...rowYarnInvoice1};
            } else { // ## yarnInvoiceRowCurrent.rowState !== ''
                if (yarnInvoiceRowCurrent.colorCode === item1.colorCode) {
                    // rowYarnInvoice1.rowState = 'd';
                    // rowYarnInvoice1.yarnID = item1.yarnID;
                    // rowYarnInvoice1.invoiceID = item1.invoiceID;
                    // rowYarnInvoice1.yarnColorID = item1.yarnColorID;
                    // rowYarnInvoice1.setName = item1.setName;
                    // rowYarnInvoice1.colorCode = item1.colorCode;
                    // rowYarnInvoice1.colorID = item1.colorID;

                    // rowYarnInvoice1.yarnLotID = item1.yarnLotID;
                    // rowYarnInvoice1.yarnBoxInfo = item1.yarnBoxInfo;

                    // rowYarnInvoice1.carton = item1.carton;
                    // rowYarnInvoice1.yarnPlanWeightTotal = item1.yarnPlanWeightTotal;
                    // rowYarnInvoice1.yarnWeightTotal = item1.yarnWeightTotal;
                    // rowYarnInvoice1.yarnWeightDif = item1.yarnWeightDif;
                    // rowYarnInvoice1.yarnWeightTotalPercent = item1.yarnWeightTotalPercent;
                    // rowYarnInvoice1.yarnWeightTotalDifPercent = item1.yarnWeightTotalDifPercent;

                    // this.rowYarnInvoicePDF.push({...rowYarnInvoice1});  // ## add row yarn Lot ID
                    // yarnInvoiceRowCurrent = {...rowYarnInvoice1};

                // } else if () {

                } else {

                    // ## sub total yarn
                    let rowYarnInvoiceotalSubY: YarnInvoiceRow = GBC.clrYarnInvoiceRow();
                    rowYarnInvoiceotalSubY.rowState = 'sty'; // ## sty=sub total yarn
                    rowYarnInvoiceotalSubY.carton = cartonTotalSubY;
                    rowYarnInvoiceotalSubY.yarnPlanWeightTotal = +yarnPlanWeightTotalTotalSubY.toFixed(2);
                    rowYarnInvoiceotalSubY.yarnWeightDif = +yarnWeightDifTotalSubY.toFixed(2);
                    rowYarnInvoiceotalSubY.yarnWeightTotal = +yarnWeightTotalTotalSubY.toFixed(2);
                    rowYarnInvoiceotalSubY.yarnCCWeightTotal = +yarnCCWeightTotalTotalSubY.toFixed(2);
                    rowYarnInvoiceotalSubY.yarnWeightNetTotal = +yarnWeightNetTotalTotalSubY.toFixed(2);
                    rowYarnInvoiceotalSubY.yarnWeightTotalDifPercent = ((yarnWeightNetTotalTotalSubY / yarnPlanWeightTotalTotalSubY) * 100).toFixed(2);
                    this.rowYarnInvoicePDF.push({...rowYarnInvoiceotalSubY});  // ## add row sub total yarn

                    // let yarnWeightTotalDifPercentSubY = 0.00;   let yarnWeightTotalDifPercentTotalY = 0.00;

                    let rowYarnInvoiceBlank = {...GBC.clrYarnInvoiceRow()};
                    rowYarnInvoiceBlank.rowState = 'b';
                    this.rowYarnInvoicePDF.push({...rowYarnInvoiceBlank});  // ## add row blank



                    // let rowYarnInvoiceBlank = {...GBC.clrYarnInvoiceRow()};
                    // rowYarnInvoiceBlank.rowState = 'b';
                    // this.rowYarnInvoicePDF.push({...rowYarnInvoiceBlank});  // ## add row blank

                    // ## reset value
                    cartonTotalSubY = 0;
                    yarnPlanWeightTotalTotalSubY = 0;
                    yarnWeightDifTotalSubY = 0;
                    yarnWeightTotalTotalSubY = 0;
                    yarnCCWeightTotalTotalSubY = 0;
                    yarnWeightNetTotalTotalSubY = 0;

                    // rowYarnInvoice1.rowState = 'y';  // ## y=yarn
                    // rowYarnInvoice1.yarnID = item1.yarnID;
                    // this.rowYarnInvoicePDF.push({...rowYarnInvoice1});  // ## add row yarn

                    // rowYarnInvoice1.rowState = 'd';
                    // rowYarnInvoice1.yarnID = item1.yarnID;
                    // rowYarnInvoice1.invoiceID = item1.invoiceID;
                    // rowYarnInvoice1.yarnColorID = item1.yarnColorID;
                    // rowYarnInvoice1.setName = item1.setName;
                    // rowYarnInvoice1.colorCode = item1.colorCode;
                    // rowYarnInvoice1.colorID = item1.colorID;

                    // rowYarnInvoice1.yarnLotID = item1.yarnLotID;
                    // rowYarnInvoice1.yarnBoxInfo = item1.yarnBoxInfo;

                    // rowYarnInvoice1.carton = item1.carton;
                    // rowYarnInvoice1.yarnPlanWeightTotal = item1.yarnPlanWeightTotal;
                    // rowYarnInvoice1.yarnWeightTotal = item1.yarnWeightTotal;
                    // rowYarnInvoice1.yarnWeightDif = item1.yarnWeightDif;
                    // rowYarnInvoice1.yarnWeightTotalPercent = item1.yarnWeightTotalPercent;
                    // rowYarnInvoice1.yarnWeightTotalDifPercent = item1.yarnWeightTotalDifPercent;

                    // this.rowYarnInvoicePDF.push({...rowYarnInvoice1});  // ## add row yarn Lot ID
                    // yarnInvoiceRowCurrent = {...rowYarnInvoice1};
                }
            }
            rowYarnInvoice1.rowState = 'd';
            rowYarnInvoice1.yarnID = item1.yarnID;
            rowYarnInvoice1.invoiceID = item1.invoiceID;
            rowYarnInvoice1.yarnColorID = item1.yarnColorID;
            rowYarnInvoice1.setName = item1.setName;
            rowYarnInvoice1.colorCode = item1.colorCode;
            rowYarnInvoice1.colorID = item1.colorID;
            rowYarnInvoice1.colorName = this.userService.getColorNameByColorCode(item1.colorID, item1.setName);

            rowYarnInvoice1.yarnLotID = item1.yarnLotID;
            rowYarnInvoice1.yarnBoxInfo = item1.yarnBoxInfo;

            rowYarnInvoice1.carton = item1.carton;
            rowYarnInvoice1.yarnPlanWeightTotal = item1.yarnPlanWeightTotal;
            rowYarnInvoice1.yarnWeightTotal = item1.yarnWeightTotal;
            rowYarnInvoice1.yarnWeightDif = item1.yarnWeightDif;
            rowYarnInvoice1.yarnWeightTotalPercent = item1.yarnWeightTotalPercent;
            rowYarnInvoice1.yarnWeightTotalDifPercent = item1.yarnWeightTotalDifPercent;

            rowYarnInvoice1.coneWeight = item1.coneWeight;
            rowYarnInvoice1.boxWeight = item1.boxWeight;
            rowYarnInvoice1.yarnWeightDifTotal = item1.yarnWeightDifTotal;
            rowYarnInvoice1.yarnCCWeightTotal = item1.yarnCCWeightTotal;
            rowYarnInvoice1.yarnTransferWeightTotal = item1.yarnTransferWeightTotal;
            rowYarnInvoice1.yarnWeightNetTotal = item1.yarnWeightNetTotal;

            // ## sub total yarn
            cartonTotalSubY = cartonTotalSubY + +item1.carton;
            yarnPlanWeightTotalTotalSubY = yarnPlanWeightTotalTotalSubY + +item1.yarnPlanWeightTotal;
            yarnWeightDifTotalSubY = yarnWeightDifTotalSubY + +item1.yarnWeightDif;
            yarnWeightTotalTotalSubY = yarnWeightTotalTotalSubY + +item1.yarnWeightTotal;
            yarnCCWeightTotalTotalSubY = yarnCCWeightTotalTotalSubY + +item1.yarnCCWeightTotal;
            yarnWeightNetTotalTotalSubY = yarnWeightNetTotalTotalSubY + +item1.yarnWeightNetTotal;

            cartonTotalY = cartonTotalY + +item1.carton;
            yarnPlanWeightTotalTotalY = yarnPlanWeightTotalTotalY + +item1.yarnPlanWeightTotal;
            yarnWeightDifTotalY = yarnWeightDifTotalY + +item1.yarnWeightDif;
            yarnWeightTotalTotalY = yarnWeightTotalTotalY + +item1.yarnWeightTotal;
            yarnCCWeightTotalTotalY = yarnCCWeightTotalTotalY + +item1.yarnCCWeightTotal;
            yarnWeightNetTotalTotalY = yarnWeightNetTotalTotalY + +item1.yarnWeightNetTotal;

            this.rowYarnInvoicePDF.push({...rowYarnInvoice1});  // ## add row yarn Lot ID
            yarnInvoiceRowCurrent = {...rowYarnInvoice1};
        });

        // ## sub total yarn
        let rowYarnInvoiceotalSubY: YarnInvoiceRow = GBC.clrYarnInvoiceRow();
        rowYarnInvoiceotalSubY.rowState = 'sty'; // ## sty=sub total yarn
        rowYarnInvoiceotalSubY.carton = cartonTotalSubY;
        rowYarnInvoiceotalSubY.yarnPlanWeightTotal = +yarnPlanWeightTotalTotalSubY.toFixed(2);
        rowYarnInvoiceotalSubY.yarnWeightDif = +yarnWeightDifTotalSubY.toFixed(2);
        rowYarnInvoiceotalSubY.yarnWeightTotal = +yarnWeightTotalTotalSubY.toFixed(2);
        rowYarnInvoiceotalSubY.yarnCCWeightTotal = +yarnCCWeightTotalTotalSubY.toFixed(2);
        rowYarnInvoiceotalSubY.yarnWeightNetTotal = +yarnWeightNetTotalTotalSubY.toFixed(2);
        rowYarnInvoiceotalSubY.yarnWeightTotalDifPercent = ((yarnWeightNetTotalTotalSubY / yarnPlanWeightTotalTotalSubY) * 100).toFixed(2);
        this.rowYarnInvoicePDF.push({...rowYarnInvoiceotalSubY});  // ## add row sub total yarn

        let rowYarnInvoiceBlank = {...GBC.clrYarnInvoiceRow()};
        rowYarnInvoiceBlank.rowState = 'b';
        this.rowYarnInvoicePDF.push({...rowYarnInvoiceBlank});  // ## add row blank

        // ## total yarn
        let rowYarnInvoiceotalY: YarnInvoiceRow = GBC.clrYarnInvoiceRow();
        rowYarnInvoiceotalY.rowState = 'gty'; // ## gty=grand total yarn
        rowYarnInvoiceotalY.carton = cartonTotalY;
        rowYarnInvoiceotalY.yarnPlanWeightTotal = +yarnPlanWeightTotalTotalY.toFixed(2);
        rowYarnInvoiceotalY.yarnWeightDif = +yarnWeightDifTotalY.toFixed(2);
        rowYarnInvoiceotalY.yarnWeightTotal = +yarnWeightTotalTotalY.toFixed(2);
        rowYarnInvoiceotalY.yarnCCWeightTotal = +yarnCCWeightTotalTotalY.toFixed(2);
        rowYarnInvoiceotalY.yarnWeightNetTotal = +yarnWeightNetTotalTotalY.toFixed(2);
        rowYarnInvoiceotalY.yarnWeightTotalDifPercent = ((yarnWeightNetTotalTotalY / yarnPlanWeightTotalTotalY) * 100).toFixed(2);
        this.rowYarnInvoicePDF.push({...rowYarnInvoiceotalY});  // ## add row total yarn

        // console.log(this.rowYarnInvoicePDF);
        return true;
    }

    // ## state = normal, blankPackingList
    createInvoicePDF(yarnID: string, yarnInvoiceList: YarnInvoiceList[], yarnDataInfo1: YarnDataInfo[], state: string) {
        // console.log(yarnInvoiceList);
        // console.log(yarnDataInfo1);
        const next1 = this.prepareDataYarnInvoicePDF(yarnInvoiceList);
        // console.log(this.rowYarnInvoicePDF);

        // yarnDataInfoInvoicePDF: YarnInvoiceList[] = [];
        // contentInvoicePDF: any[] = [];
        // rowYarnInvoicePDF: YarnInvoiceRow[] = [];
        this.contentInvoicePDF = [];
        const contentINVHeaderTop = this.getINVHeaderPDF();

        // // ## get body pdf
        const contentINVTable = this.getINVTablePDF(this.rowYarnInvoicePDF);

        // // ## get footer pdf
        // const contentINVFooter = this.getINVTablefooterPDF();

        this.rowYarnPackingListPDF = [];
        yarnInvoiceList.forEach( (item1, index1) => {
            let yarnPackingList1: YarnPackingList = GBC.clrYarnPackingList();
            // item1.packageInfo.forEach( (item2, index2) => {
                yarnPackingList1.rowState = '';
                yarnPackingList1.yyyymmdd = item1.yyyymmdd;
                yarnPackingList1.mmdd = item1.mmdd;
                yarnPackingList1.toFactoryID = item1.factoryID;

                yarnPackingList1.yarnID = item1.yarnID;
                yarnPackingList1.yarnColorID = item1.yarnColorID;
                yarnPackingList1.yarnDataUUID = item1.yarnDataUUID;
                yarnPackingList1.setName = item1.setName;
                yarnPackingList1.colorCode = item1.colorCode;
                yarnPackingList1.colorID = item1.colorID;

                yarnPackingList1.invoiceID = item1.invoiceID;
                yarnPackingList1.yarnLotID = item1.yarnLotID;
                yarnPackingList1.yarnLotUUID = item1.yarnLotUUID;

                // yarnPackingList1.carton = item1.yarnBoxInfo.filter(i=>i.boxID.split(this.userService.yarnDevideSign).length === 1).length;
                // yarnPackingList1.boxWeight = item1.boxWeight;
                // yarnPackingList1.coneWeight = item1.coneWeight;
                // yarnPackingList1.yarnPlanWeightTotal = item1.yarnPlanWeightTotal;
                // yarnPackingList1.yarnWeightTotal = item1.yarnWeightTotal;
                // yarnPackingList1.yarnWeightDifTotal = item1.yarnWeightDifTotal;
                // yarnPackingList1.yarnCCWeightTotal = item1.yarnCCWeightTotal;
                // yarnPackingList1.yarnTransferWeightTotal = item1.yarnTransferWeightTotal;
                // yarnPackingList1.yarnWeightNetTotal = item1.yarnWeightNetTotal;
                // yarnPackingList1.yarnWeightTotalPercent = item1.yarnWeightTotalPercent;
                // yarnPackingList1.boxIDAllVerified = item2.boxIDAllVerified;

                yarnPackingList1.yarnBoxInfo = item1.yarnBoxInfo;
                this.rowYarnPackingListPDF.push({...yarnPackingList1});
            // });
        });
        // console.log(this.rowYarnPackingListPDF);

        // ## state = normal, blankPackingList
        // let packingListX = [];
        // if (state === 'normal') {
        // } else if (state === 'blankPackingList') {

        // }
        const  packingListX = this.createPackingListPDF('multi-yarn', yarnID, yarnDataInfo1, state);

        // createPackingListPDF(mode: string, yarnID: string, yarnDataInfo1: YarnDataInfo[]) {
        //     console.log(yarnDataInfo1);
        //     if (mode==='single' || mode==='multi') {
        //         const next1 = this.prepareDataYarnPackingListPDF(yarnDataInfo1);
        //     }

        //     let rowYarnPackingListPDF1 = [...this.rowYarnPackingListPDF];
        const pageBrake: any[] = [{text: '', pageBreak: 'after', style: ['']}];
        this.contentInvoicePDF = [
            ...this.contentInvoicePDF,
            ...contentINVHeaderTop,
            ...contentINVTable,
            ...pageBrake,
            ...packingListX
        ];

        const docDefinition: any = this.generateINVPDF('yarn-rep02');

        this.yarnDataInfoInvoicePDF = [];  // ## clear data
        this.contentInvoicePDF = [];  // ## clear data
        this.rowYarnInvoicePDF = [];  // ## clear data

        return docDefinition;
    }

    getINVHeaderPDF() {
        // ## header top
        const datePrint = this.userService.returnDDMMYYYY(0,'-')
                        +' '
                        +this.userService.returnHHMM(0,':');
        const contentHeaderTop = [
            {columns: [
				{text: '', style: ['', '']},
                {text: 'Yarn [Invoice] [packing list]', style: ['', ''], alignment: 'center'},
                {text: '', style: ['', '']},
				// {text: 'date print: ' + datePrint, italics: true, fontSize: 6, alignment: 'right', margin: [0, 0, 15, 0]}
			]},
            // { text: yarnID, style: ['', ''], alignment: 'left', margin: [15, 0, 15, 0], },
        ];
        return contentHeaderTop;
    }

    getINVTablePDF(rowYarnInvoicePDF: YarnInvoiceRow[]) {
        const setName = rowYarnInvoicePDF[0].setName;
        const invoiceID = rowYarnInvoicePDF[0].invoiceID;
        const contentTableHeader = [
            {
                margin: [35, 0, 15, 0],
                style: 'tableExample',
                table: {
                    widths: ['12%', '15%', '12%', '61%'],
                    // headerRows: 1,
                    body: [
                        [
                            {text: 'Saler Name', style: ['txtheadsize', 'marginHeadTop2'], alignment: 'center', fillColor: '#cccccc'},
                            {text: setName.toUpperCase(), style: ['txtheadsize', 'marginHeadTop2'], alignment: 'center'},
                            {text: 'Invoice no', style: ['txtheadsize', 'marginHeadTop2'], alignment: 'center', fillColor: '#cccccc'},
                            {text: invoiceID, style: ['txtheadsize', 'marginHeadTop2'], alignment: 'center'},
                        ],
                    ]
                }
            },
            {
                margin: [35, -1, 15, 0],
                style: 'tableExample',
                table: {
                    // ##  9 columns       17                                 *                   *
                    // // ##  Items	Description	 carton	 Inv.Kgs  Dif.Kgs  Actual.Kgs   Dif.%   cC.Kgs   NET.Kgs
                    // widths: ['10%',   '40%',     '5%',    '9%',   '7%',    '9%',     '5%',      '5%',    '10%' ],

                    // ## 7 columns
                    // ##  Items	Description	 carton	 Inv.Kgs   NET.Kgs  Dif.Kgs   Dif.%
                    widths: ['10%',   '40%',     '6%',    '12%',   '12%',    '9%',     '11%' ],

                    headerRows: 1,
                    body: [
                            [
                                {text: 'Date', style: ['txtheadsize', 'marginHeadTop2'], alignment: 'center', fillColor: '#cccccc'},
                                {text: 'Description', style: ['txtheadsize', 'marginHeadTop2'], alignment: 'center', fillColor: '#cccccc'},
                                {text: 'carton', style: ['txtSmall6', 'marginHeadTop2'], alignment: 'center', fillColor: '#cccccc'},
                                {text: 'Inv.Kgs', style: ['txtSmall6', 'marginHeadTop2'], alignment: 'center', fillColor: '#cccccc'},
                                {text: 'NET.Kgs', style: ['txtheadsize', 'marginHeadTop2'], alignment: 'center', fillColor: '#cccccc'},
                                {text: 'Dif.Kgs', style: ['txtSmall6', 'marginHeadTop2'], alignment: 'center', fillColor: '#cccccc'},
                                // {text: 'Actual.Kgs', style: ['txtSmall6', 'marginHeadTop2'], alignment: 'center', fillColor: '#cccccc'},
                                // {text: 'cC.Kgs', style: ['txtSmall6', 'marginHeadTop2'], alignment: 'center', fillColor: '#cccccc'},
                                {text: 'Dif.%', style: ['txtSmall6', 'marginHeadTop2'], alignment: 'center', fillColor: '#cccccc'},

                                // style: ['txtheadsize', 'marginHeadTop2', 'backgroundHead']
                            ],
                            ...this.getYarnInvoiceTableBodyPDF(rowYarnInvoicePDF),  // ## body table
                    ]
                },
                layout: {
                    // hLineWidth: function (i: any, node: any) {
                    // 	return (i === 0 || i === node.table.body.length) ? 2 : 1;
                    // },
                    // vLineWidth: function (i: any, node: any) {
                    // 	return (i === 0 || i === node.table.widths.length) ? 2 : 1;
                    // },

                    // hLineColor: function (i: any, node: any) {
                    //     return (i === 0 || i === node.table.body.length) ? 'gray' : 'gray';
                    // },
                    // vLineColor: function (i: any, node: any) {
                    //     return (i === 0 || i === node.table.widths.length) ? 'gray' : 'gray';
                    // },

                    // hLineStyle: function (i, node) { return {dash: { length: 10, space: 4 }}; },
                    // vLineStyle: function (i, node) { return {dash: { length: 10, space: 4 }}; },
                    // paddingLeft: function(i, node) { return 4; },
                    // paddingRight: function(i, node) { return 4; },
                    // paddingTop: function(i, node) { return 2; },
                    // paddingBottom: function(i, node) { return 2; },
                    // fillColor: function (rowIndex, node, columnIndex) { return null; }
                }
            }
        ];
        return contentTableHeader;
    }

    getYarnInvoiceTableBodyPDF(rowYarnInvoicePDF: YarnInvoiceRow[]) {
        const allLen = rowYarnInvoicePDF.length;
        const rowBlank = [
            {text: [{text: '*', style: ['', ''], alignment: 'center'}]},
            {text: [{text: '', style: ['', ''], alignment: 'center'}]},
            {text: [{text: '', style: ['', ''], alignment: 'center'}]},
            {text: [{text: '', style: ['', ''], alignment: 'center'}]},
            {text: [{text: '', style: ['', ''], alignment: 'center'}]},
            {text: [{text: '', style: ['', ''], alignment: 'center'}]},
            // {text: [{text: '', style: ['', ''], alignment: 'center'}]},
            // {text: [{text: '', style: ['', ''], alignment: 'center'}]},
            {text: [{text: '', style: ['', ''], alignment: 'center'}]},
        ];
        let bodyInvList: any[] = [];

        function getRow(rowYarnInvoice1: YarnInvoiceRow, idx: number, allLen: number, yarnFullName: string) {
            let row1: any[] = [
                {text: [{text: '*', style: ['', ''], alignment: 'center'}]},
                {text: [{text: '', style: ['', ''], alignment: 'center'}]},
                {text: [{text: '', style: ['', ''], alignment: 'center'}]},
                {text: [{text: '', style: ['', ''], alignment: 'center'}]},
                {text: [{text: '', style: ['', ''], alignment: 'center'}]},
                {text: [{text: '', style: ['', ''], alignment: 'center'}]},
                // {text: [{text: '', style: ['', ''], alignment: 'center'}]},
                // {text: [{text: '', style: ['', ''], alignment: 'center'}]},
                {text: [{text: '', style: ['', ''], alignment: 'center'}]},
            ];
            // ## rowState   y=yarnID , d=detail , b=blank row
            if (rowYarnInvoice1.rowState === 'y') {
                // [
                //     {text: 'Header with Colspan = 2', style: 'tableHeader', colSpan: 2, alignment: 'center'}, {},
                //     {text: 'Header 3', style: 'tableHeader', alignment: 'center'}
                // ]
                row1 = [
                    {text: [{text: rowYarnInvoice1.mmdd, style: ['txtSmall8', 'txtBold'], alignment: 'center'}], border: [true, true, true, true]},
                    {text: yarnFullName, style: ['txtSmall8', 'txtBold'], colSpan: 6, alignment: 'left', border: [true, true, true, true]},
                    , {}, {}, {}, {}
                ];

                // [{
                //     // margin: [marginLeft, -1, marginRight, 0],
                //     style: 'tableExample',
                //     table: {
                //         widths: ['13%', '16%', '13%', '13%',   '9%', '13%', '10%', '13%'],
                //         // headerRows: 1,
                //         body: [
                //             [
                //                 {text: 'Inv.Kgs', style: ['txtheadsize', 'marginHeadTop2'], alignment: 'center', fillColor: '#cccccc'},
                //                 {text: 'invKG', style: ['txtSmall7', 'marginHeadTop2'], alignment: 'center'},
                //                 {text: 'T.Dif.Kgs', style: ['txtheadsize', 'marginHeadTop2'], alignment: 'center', fillColor: '#cccccc'},
                //                 {text: 'difKG', style: ['txtSmall7', 'marginHeadTop2'], alignment: 'center'},
                //                 {text: 'Act.Kgs', style: ['txtheadsize', 'marginHeadTop2'], alignment: 'center', fillColor: '#cccccc'},
                //                 {text: 'actKG', style: ['txtheadsize', 'marginHeadTop2'], alignment: 'center'},
                //                 {text: 'Receive%', style: ['txtheadsize', 'marginHeadTop2'], alignment: 'center', fillColor: '#cccccc'},
                //                 {text: 'receivePercent'+'%', style: ['txtheadsize', 'marginHeadTop2'], alignment: 'center'},
                //             ],
                //             [
                //                 {text: 'Carton.Kgs', style: ['txtheadsize', 'marginHeadTop2'], alignment: 'center', fillColor: '#cccccc'},
                //                 {text: 'cartonKG'+' , Qty: '+ 'cartonQty', style: ['txtSmall7', 'marginHeadTop2'], alignment: 'center'},
                //                 {text: 'Cone.Kgs', style: ['txtheadsize', 'marginHeadTop2'], alignment: 'center', fillColor: '#cccccc'},
                //                 {text: 'coneKG', style: ['txtheadsize', 'marginHeadTop2'], alignment: 'center'},
                //                 {text: 'T.CC.Kgs', style: ['txtheadsize', 'marginHeadTop2'], alignment: 'center', fillColor: '#cccccc'},
                //                 {text: '- '+'cCKG', style: ['txtSmall7', 'marginHeadTop2'], alignment: 'center'},
                //                 {text: 'NET.Kgs', style: ['txtheadsize', 'marginHeadTop2'], alignment: 'center', fillColor: '#cccccc'},
                //                 {text: 'netKG', style: ['txtheadsize', 'marginHeadTop2'], alignment: 'center'},
                //             ]
                //         ]
                //     }
                // }];
                // return row1;

            // } else if (rowYarnInvoice1.rowState === 'd') {
            //     // ##  7 columns
            //     // ##  Items	Description	 carton	 Inv.Kgs	 Actual.Kgs	  Dif.Kgs	  Dif.%
            //     row1 = [
            //         {text: [{text: '', style: ['', ''], alignment: 'center'}], border: [true, false, false, idx+1 === allLen]},
            //         // {text: [{text: '', style: ['', ''], alignment: 'center'}]},
            //         {text: [
            //             {text: rowYarnInvoice1.colorCode +' '+  rowYarnInvoice1.colorName, style: ['', ''], alignment: 'left'},
            //             {text: ' Lot ID: '+ rowYarnInvoice1.yarnLotID, style: ['txtSmall7', ''], color: 'gray'},
            //         ], border: [false, false, false, idx+1 === allLen]},
            //         {text: [{text: rowYarnInvoice1.carton, style: ['txtSmall6', ''], alignment: 'center'}], border: [false, false, false, true]},
            //         {text: [{text: rowYarnInvoice1.yarnPlanWeightTotal, style: ['txtSmall6', ''], alignment: 'center'}], border: [false, false, false, true]},
            //         {text: [{text: rowYarnInvoice1.yarnWeightDif, style: ['txtSmall6', ''], alignment: 'center'}], border: [false, false, false, true]},
            //         {text: [{text: rowYarnInvoice1.yarnWeightTotal, style: ['', ''], alignment: 'center'}], border: [false, false, false, true]},
            //         {text: [{text: rowYarnInvoice1.yarnWeightTotalPercent+ ' %', style: ['txtSmall5', ''], alignment: 'center'}], border: [false, false, false, true]},
            //         {text: [{text: '- '+rowYarnInvoice1.yarnCCWeightTotal, style: ['txtSmall6', ''], alignment: 'center'}], border: [false, false, false, true]},
            //         {text: [{text: rowYarnInvoice1.yarnWeightNetTotal, style: ['txtSmall7', 'txtBold'], alignment: 'center'}], border: [false, false, true, true]},
            //     ];

            // } else {
            //     row1 = [
            //         {text: [{text: '*', style: ['color_white', ''], alignment: 'center'}], border: [true, false, false, idx+1 === allLen]},
            //         {text: [{text: '', style: ['', ''], alignment: 'center'}], border: [false, false, false, idx+1 === allLen]},
            //         {text: [{text: '', style: ['', ''], alignment: 'center'}], border: [false, false, false, idx+1 === allLen]},
            //         {text: [{text: '', style: ['', ''], alignment: 'center'}], border: [false, false, false, idx+1 === allLen]},
            //         {text: [{text: '', style: ['', ''], alignment: 'center'}], border: [false, false, false, idx+1 === allLen]},
            //         {text: [{text: '', style: ['', ''], alignment: 'center'}], border: [false, false, false, idx+1 === allLen]},
            //         {text: [{text: '', style: ['', ''], alignment: 'center'}], border: [false, false, false, idx+1 === allLen]},
            //         {text: [{text: '', style: ['', ''], alignment: 'center'}], border: [false, false, false, idx+1 === allLen]},
            //         {text: [{text: '', style: ['', ''], alignment: 'center'}], border: [false, false, true, idx+1 === allLen]},
            //     ];

            } else if (rowYarnInvoice1.rowState === 'd') {
                // ##  7 columns
                // ##  Items	Description	 carton	 Inv.Kgs	 Actual.Kgs	  Dif.Kgs	  Dif.%
                row1 = [
                    {text: [{text: '', style: ['', ''], alignment: 'center'}], border: [true, true, true, true]},
                    // {text: [{text: '', style: ['', ''], alignment: 'center'}]},
                    {text: [
                        {text: rowYarnInvoice1.colorCode +' '+  rowYarnInvoice1.colorName, style: ['', ''], alignment: 'left'},
                        {text: ' Lot ID: '+ rowYarnInvoice1.yarnLotID, style: ['txtSmall6', ''], color: 'black'},
                    ], border: [true, true, true, true]},
                    {text: [{text: rowYarnInvoice1.carton, style: ['txtSmall6', ''], alignment: 'center'}], border: [true, true, true, true]},
                    {text: [{text: rowYarnInvoice1.yarnPlanWeightTotal.toFixed(2), style: ['txtSmall6', ''], alignment: 'center'}], border: [true, true, true, true]},
                    {text: [{text: rowYarnInvoice1.yarnWeightNetTotal.toFixed(2), style: ['txtSmall7', 'txtBold'], alignment: 'center'}], border: [true, true, true, true]},
                    {text: [{text: rowYarnInvoice1.yarnWeightDif.toFixed(2), style: ['txtSmall6', ''], alignment: 'center'}], border: [true, true, true, true]},
                    // {text: [{text: rowYarnInvoice1.yarnWeightTotal, style: ['txtSmall6', ''], alignment: 'center'}], border: [true, true, true, true]},
                    {text: [{text: rowYarnInvoice1.yarnWeightTotalPercent + ' %', style: ['txtSmall6', ''], alignment: 'center'}], border: [true, true, true, true]},
                    // {text: [{text: '- '+rowYarnInvoice1.yarnCCWeightTotal, style: ['txtSmall6', ''], alignment: 'center'}], border: [true, true, true, true]},
                ];

            } else if (rowYarnInvoice1.rowState === 'sty') {  // ## sub total yarn
                row1 = [
                    {text: [{text: '', style: ['', ''], alignment: 'center'}], border: [true, true, true, true]},
                    // {text: [{text: '', style: ['', ''], alignment: 'center'}]},
                    {text: [
                        {text: 'Sub Total', style: ['txtSmall7', ''], alignment: 'center'}
                    ], border: [true, true, true, true]},
                    {text: [{text: rowYarnInvoice1.carton, style: ['txtSmall6', 'txtBold'], alignment: 'center'}], border: [true, true, true, true]},
                    {text: [{text: rowYarnInvoice1.yarnPlanWeightTotal.toFixed(2), style: ['txtSmall6', 'txtBold'], alignment: 'center'}], border: [true, true, true, true]},
                    {text: [{text: rowYarnInvoice1.yarnWeightNetTotal.toFixed(2), style: ['txtSmall7', 'txtBold'], alignment: 'center'}], border: [true, true, true, true]},
                    {text: [{text: rowYarnInvoice1.yarnWeightDif.toFixed(2), style: ['txtSmall6', 'txtBold'], alignment: 'center'}], border: [true, true, true, true]},
                    // {text: [{text: rowYarnInvoice1.yarnWeightTotal, style: ['txtSmall6', 'txtBold'], alignment: 'center'}], border: [true, true, true, true]},
                    {text: [{text: rowYarnInvoice1.yarnWeightTotalDifPercent + ' %', style: ['txtSmall6', ''], alignment: 'center'}], border: [true, true, true, true]},
                    // {text: '- '+rowYarnInvoice1.yarnCCWeightTotal, style: ['txtSmall6', 'txtBold'], colSpan: 2, alignment: 'right', border: [true, true, true, true]},
                ];

            } else if (rowYarnInvoice1.rowState === 'gty') {  // ## grand total yarn
                row1 = [
                    {text: [{text: '', style: ['', ''], alignment: 'center'}], border: [true, true, true, true]},
                    // {text: [{text: '', style: ['', ''], alignment: 'center'}]},
                    {text: [
                        {text: 'Grand Total', style: ['txtSmall7', 'txtBold'], alignment: 'center'}
                    ], border: [true, true, true, true]},
                    {text: [{text: rowYarnInvoice1.carton, style: ['txtSmall6', 'txtBold'], alignment: 'center'}], border: [true, true, true, true]},
                    {text: [{text: rowYarnInvoice1.yarnPlanWeightTotal.toFixed(2), style: ['txtSmall6', 'txtBold'], alignment: 'center'}], border: [true, true, true, true]},
                    {text: [{text: rowYarnInvoice1.yarnWeightNetTotal.toFixed(2), style: ['txtSmall7', 'txtBold'], alignment: 'center'}], border: [true, true, true, true]},
                    {text: [{text: rowYarnInvoice1.yarnWeightDif.toFixed(2), style: ['txtSmall6', 'txtBold'], alignment: 'center'}], border: [true, true, true, true]},
                    // {text: [{text: rowYarnInvoice1.yarnWeightTotal, style: ['txtSmall6', 'txtBold'], alignment: 'center'}], border: [true, true, true, true]},
                    {text: [{text: rowYarnInvoice1.yarnWeightTotalDifPercent + ' %', style: ['txtSmall6', ''], alignment: 'center'}], border: [true, true, true, true]},
                    // {text: '- '+rowYarnInvoice1.yarnCCWeightTotal, style: ['txtSmall6', 'txtBold'], colSpan: 2, alignment: 'right', border: [true, true, true, true]},
                ];
            } else {
                // row1 = [
                //     {text: [{text: '*', style: ['color_white', ''], alignment: 'center'}], border: [true, true, true, true]},
                //     {text: [{text: '', style: ['', ''], alignment: 'center'}], border: [true, true, true, true]},
                //     {text: [{text: '', style: ['', ''], alignment: 'center'}], border: [true, true, true, true]},
                //     {text: [{text: '', style: ['', ''], alignment: 'center'}], border: [true, true, true, true]},
                //     {text: [{text: '', style: ['', ''], alignment: 'center'}], border: [true, true, true, true]},
                //     {text: [{text: '', style: ['', ''], alignment: 'center'}], border: [true, true, true, true]},
                //     {text: [{text: '', style: ['', ''], alignment: 'center'}], border: [true, true, true, true]},
                //     {text: [{text: '', style: ['', ''], alignment: 'center'}], border: [true, true, true, true]},
                //     {text: [{text: '', style: ['', ''], alignment: 'center'}], border: [true, true, true, true]},
                // ];
                row1 = [
                    {text: [{text: '', style: ['color_white', ''], alignment: 'center'}], border: [true, true, true, true]},
                    {text: '', style: ['txtSmall8', 'txtBold'], colSpan: 6, alignment: 'left', border: [true, true, true, true]},
                    , {}, {}, {}, {}
                ];
            }

            return row1;
        }


        rowYarnInvoicePDF.forEach( (item1, index1) => {
            const yarnID = item1.yarnID;
            const yarnFullName = this.userService.strFirstAndDot(this.getYarnfullName(yarnID), this.yarnFullNameLen);

            let row1: any[] = [];
            row1 = getRow(item1, index1, allLen, yarnFullName);
            bodyInvList.push(row1);
            // if (item1.rowState === 'y') {
            //     // bodyInvList.push(...row1);
            //     row1.forEach( (item2, index2) => {
            //         bodyInvList.push(item2);
            //     });
            // } else {
            //     bodyInvList.push(row1);
            // }
        });

        return bodyInvList;
    }

    generateINVPDF(headerTxt: string) {
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

            txtBold: {
                bold: true,
            },

            color_white: {  // ## transparent
                color: 'white',
            },
        };
        let docDefinition: any = {
            pageSize: 'A4',
            // pageMargins: [ 3, 10, 3, 10 ],
            pageMargins: [ 35, 20, 15, 30 ],
            // header: head2,
            // pageOrientation: 'portrait',
            // pageOrientation: 'portrait',
            content: this.contentInvoicePDF,
            // content: content1,
            // content: [content1, content1],
            // defaultStyle: {font: 'Roboto', fontSize: 10},
            // header: headerTxt,   , margin: [0, 5, 5, 0]
            header: {
                columns: [
                    {text: headerTxt, italics: true, fontSize: 6, alignment: 'left', margin: [10, 2, 0, 0]},
                    '',
                    {text: 'date print: ' + datePrint, italics: true, fontSize: 6, alignment: 'right', margin: [1, 2, 10, 0]},
                ] //, margin: [35, 5, 15, 0]
            },
            footer: function(currentPage: any, pageCount: any) {
                return {
                    columns: [
                      '',
                      {text: headerTxt + ' , date print: ' + datePrint, italics: true, fontSize: 6, alignment: 'right'},
                      '',
                      { text: currentPage.toString() + ' of ' + pageCount, alignment: 'right' },
                      '',
                    ] //, margin: [35, 0, 15, 5]
                };
            },
            defaultStyle: { fontSize: 8},
            styles: style,
        };

        // pdfMake.createPdf(docDefinition).open();
        return docDefinition;
    }

    // ##  #########################################################
    // yarnTransferUsage1, yarnTransferUsageGroupRow1
    contentTransferPDF: any[] = [];

    createYarnTransferPDF(yarnTransferUsage1: YarnLotUsageList[], yarnTransferUsageGroupRow1: YarnTransferUsageRow[]) {
        // console.log(yarnTransferUsage1);
        // console.log(yarnTransferUsageGroupRow1);

        this.contentTransferPDF = [];
        const contentTransferHeaderTop = this.getTransferHeaderPDF(yarnTransferUsage1);

        // // ## get body pdf
        const contentTransferTable = this.getTransferTablePDF(yarnTransferUsage1, yarnTransferUsageGroupRow1);

        const packingListX = this.createTransferPackingListPDF(yarnTransferUsage1);

        const pageBrake: any[] = [{text: '', pageBreak: 'after', style: ['']}];
        this.contentTransferPDF = [
            ...this.contentTransferPDF,
            ...contentTransferHeaderTop,
            ...contentTransferTable,
            ...pageBrake,
            ...packingListX
        ];

        const docDefinition: any = this.generateTransferPDF('yarn-rep04');

        return docDefinition;
    }

    getTransferHeaderPDF(yarnTransferUsage1: YarnLotUsageList[]) {
        let setName = '';
        let customerName = '';
        if (yarnTransferUsage1.length > 0) {
            setName = this.userService.getSetNameColorByOrderID(yarnTransferUsage1[0].usageInfo.orderID);
            customerName = this.userService.getCustomerName(yarnTransferUsage1[0].customerID);
        }
        // ## header top
        const datePrint = this.userService.returnDDMMYYYY(0,'-')
                        +' '
                        +this.userService.returnHHMM(0,':');
        const contentHeaderTop = [
            {columns: [
				{text: '', style: ['', '']},
                {text: 'Yarn [Transfer] [packing list]', style: ['', ''], alignment: 'center'},
                {text: '', style: ['', '']},
				// {text: 'date print: ' + datePrint, italics: true, fontSize: 6, alignment: 'right', margin: [0, 0, 15, 0]}
			]},
            // { text: yarnID, style: ['', ''], alignment: 'left', margin: [15, 0, 15, 0], },
        ];
        return contentHeaderTop;
    }

    getTransferTablePDF(yarnTransferUsage1: YarnLotUsageList[], yarnTransferUsageGroupRow1: YarnTransferUsageRow[]) {
        // getSetNameColorByOrderID  usageInfo
        let setName = '';
        let customerName = '';
        let yarnID = '';
        let orderID = '';
        if (yarnTransferUsage1.length > 0) {
            setName = this.userService.getSetNameColorByOrderID(yarnTransferUsage1[0].usageInfo.orderID);
            customerName = this.userService.getCustomerName(yarnTransferUsage1[0].customerID);
            yarnID = yarnTransferUsage1[0].yarnID;
            orderID = yarnTransferUsage1[0].usageInfo.orderID;
        }
        const contentTableHeader = [
            {
                margin: [35, 0, 15, 0],
                style: 'tableExample',
                table: {  //  date   color   lot ID   carton   weight     note
                    widths: ['15%',  '20%',   '20%',   '10%',   '20%',   '15%'],
                    headerRows: 2,
                    body: [
                        [
                            {text: 'Yarn name:', style: ['txtheadsize', 'marginHeadTop2'], alignment: 'center', fillColor: '#cccccc'},
                            {text: '[ '+orderID+' ] '+yarnID, style: ['txtheadsize', 'marginHeadTop2'], colSpan: 5, alignment: 'center', fillColor: '#cccccc'},
                            {},{},{},{}
                        ],
                        [
                            {text: 'Date', style: ['txtheadsize', 'marginHeadTop2'], alignment: 'center', fillColor: '#cccccc'},
                            {text: 'Color', style: ['txtheadsize', 'marginHeadTop2'], alignment: 'center', fillColor: '#cccccc'},
                            {text: 'Lot ID', style: ['txtheadsize', 'marginHeadTop2'], alignment: 'center', fillColor: '#cccccc'},
                            {text: 'Carton', style: ['txtheadsize', 'marginHeadTop2'], alignment: 'center', fillColor: '#cccccc'},
                            {text: 'Weight [ NET ]', style: ['txtheadsize', 'marginHeadTop2'], alignment: 'center', fillColor: '#cccccc'},
                            {text: 'note', style: ['txtheadsize', 'marginHeadTop2'], alignment: 'center', fillColor: '#cccccc'},
                        ],
                        ...this.getYarnTransferTableBodyPDF(yarnTransferUsageGroupRow1),  // ## body table
                    ],
                }
            },
            //
        ];
        return contentTableHeader;
    }

    getYarnTransferTableBodyPDF(yarnTransferUsageGroupRow1: YarnTransferUsageRow[]) {
        const rowBlank = [
            {text: [{text: ' ', style: ['', ''], alignment: 'center'}], border: [true, false, false, true]},
            {text: [{text: '', style: ['', ''], alignment: 'center'}], border: [false, false, false, true]},
            {text: [{text: '', style: ['', ''], alignment: 'center'}], border: [false, false, false, true]},
            {text: [{text: '', style: ['', ''], alignment: 'center'}], border: [false, false, false, true]},
            {text: [{text: '', style: ['', ''], alignment: 'center'}], border: [false, false, false, true]},
            {text: [{text: '', style: ['', ''], alignment: 'center'}], border: [false, false, true, true]},
        ];
        let rowCurrent: any[] = [...rowBlank];
        let contentBody: any[] = [];
        let yarnTransferUsageGroupRowOld: YarnTransferUsageRow = GBC.clrYarnTransferUsageRow();

        function getDate(yarnTransRow: YarnTransferUsageRow, idx: number) {
            // return yarnTransRow.ddmmyyyy;
            return {text: [{
                text: yarnTransRow.ddmmyyyy,
                style: ['txtSmall7', ''],
                alignment: 'center'
            }]};
        }

        function getColor(yarnTransRow: YarnTransferUsageRow , strFirstAndDot: Function) {
            const colorX = strFirstAndDot(yarnTransRow.colorCode + ' ' + yarnTransRow.colorName, 20);
            let color1 = '';
            if (yarnTransRow.colorCode !== yarnTransferUsageGroupRowOld.colorCode) {
                color1 = colorX;
            }
            // console.log(color1);
            return {text: [{
                text: color1,
                style: ['txtSmall7', ''],
                alignment: 'center'
            }]};
        }

        function getLotID(yarnTransRow: YarnTransferUsageRow) {
            // return yarnTransRow.ddmmyyyy;
            return {text: [{
                text: yarnTransRow.yarnLotID,
                style: ['txtSmall7', ''],
                alignment: 'center'
            }]};
        }

        function getCarton(yarnTransRow: YarnTransferUsageRow) {
            if (yarnTransRow.rowState === 't') {
                return {text: [{
                    text: yarnTransRow.carton,
                    style: ['txtSmall7', 'txtBold'],
                    alignment: 'center'
                }], fillColor: '#faedc4'};
            } else if (yarnTransRow.rowState === 'gt') {
                return {text: [{
                    text: yarnTransRow.carton,
                    style: ['txtSmall7', 'txtBold'],
                    alignment: 'center'
                }], fillColor: '#fcc39b'};
            }
            return {text: [{
                text: yarnTransRow.carton,
                style: ['txtSmall7', ''],
                alignment: 'center'
            }]};
        }

        function getWeight(yarnTransRow: YarnTransferUsageRow) {
            if (yarnTransRow.rowState === 't') {
                return {text: [{
                    text: yarnTransRow.yarnTransferWeightTotal,
                    style: ['txtSmall7', 'txtBold'],
                    alignment: 'center'
                }], fillColor: '#faedc4'};
            } else if (yarnTransRow.rowState === 'gt') {
                return {text: [{
                    text: yarnTransRow.yarnTransferWeightTotal,
                    style: ['txtSmall7', 'txtBold'],
                    alignment: 'center'
                }], fillColor: '#fcc39b'};
            }
            return {text: [{
                text: yarnTransRow.yarnTransferWeightTotal,
                style: ['txtSmall7', ''],
                alignment: 'center'
            }]};
        }

        yarnTransferUsageGroupRow1.forEach( (item, index) => {
            let row1: any[] = [...rowBlank];
            if (item.rowState === 'd') {
                row1 = [
                    // {text: [{text: '', style: ['', ''], alignment: 'center'}]},  // ## blank column
                    getDate(item, index),
                    getColor(item, this.userService.strFirstAndDot),
                    getLotID(item),
                    getCarton(item),
                    getWeight(item),
                    {text: [{text: '', style: ['txtSmall6', ''], alignment: 'center'}]},
                ];
            } else if (item.rowState === 'sd') {
                row1 = [
                    {text: [{text: '', style: ['txtSmall6', ''], alignment: 'center'}]},
                    getColor(item, this.userService.strFirstAndDot),
                    getLotID(item),
                    getCarton(item),
                    getWeight(item),
                    {text: [{text: '', style: ['txtSmall6', ''], alignment: 'center'}]},
                ];
            } else if (item.rowState === 't') {
                row1 = [
                    {text: [{text: '', style: ['txtSmall6', ''], alignment: 'center'}]},
                    {text: [{text: '', style: ['txtSmall6', ''], alignment: 'center'}]},
                    {text: [{text: 'Total', style: ['txtSmall8', 'txtBold'], alignment: 'center'}], fillColor: '#faedc4'},
                    getCarton(item),
                    getWeight(item),
                    {text: [{text: '', style: ['txtSmall6', ''], alignment: 'center'}]},
                ];
            } else if (item.rowState === 'gt') {
                const rowB = [...rowBlank];
                contentBody.push([...rowB]);
                row1 = [
                    {text: [{text: '', style: ['txtSmall6', ''], alignment: 'center'}]},
                    {text: [{text: '', style: ['txtSmall6', ''], alignment: 'center'}]},
                    {text: [{text: 'GrandTotal', style: ['txtSmall8', 'txtBold'], alignment: 'center'}], fillColor: '#fcc39b'},
                    getCarton(item),
                    getWeight(item),
                    {text: [{text: '', style: ['txtSmall6', ''], alignment: 'center'}], border: [true, true, true, true]},
                ];
            } else if (item.rowState === 'b') {
                row1 = [...rowBlank];
            }
            contentBody.push([...row1]);
            rowCurrent = [...row1];
            yarnTransferUsageGroupRowOld = item;
        });
        // console.log(contentBody);
        return contentBody;
    }

    createTransferPackingListPDF(yarnTransferUsage1: YarnLotUsageList[]) {
        let contentX: any[] = [];
        const invLen = yarnTransferUsage1.length;

        yarnTransferUsage1.forEach( (item1, index1) => {
            const contentTransferPackingList1: any[] = this.genTransferPackingListTablePDF(item1, invLen===index1+1, index1);
            // contentX.push(...contentPackingListHeaderTop);
            contentX.push(...contentTransferPackingList1);
            // console.log(index1);
        });
        // console.log(contentX);
        return contentX;
    }

    genTransferPackingListTablePDF(yarnTransferUsage1: YarnLotUsageList, lastInvoice: boolean, idx: number) {
        const yarnID = yarnTransferUsage1.yarnID;
        const setName = this.userService.getSetNameColorByOrderID(yarnTransferUsage1.usageInfo.orderID);
        const customerName = this.userService.getCustomerName(yarnTransferUsage1.customerID);
        const orderID = yarnTransferUsage1.usageInfo.orderID;
        const c1 = yarnTransferUsage1.yarnColorID.split(";");
        const colorCode = c1[1];
        const colorID = c1[2];
        const colorName = this.userService.getColorNameByColorCode(colorID, setName);
        const invoiceID = yarnTransferUsage1.invoiceID;
        const yarnLotID = yarnTransferUsage1.yarnLotID;
        const colorTxt = ' ' + colorCode + ' ' + colorName;
        const headTxt = colorTxt + ' ,  Lot ID: ' + yarnLotID;

        const ActualWeightTotal = +(yarnTransferUsage1.yarnBoxInfo.reduce((prev, cur) => {return prev + cur.yarnWeight;}, 0).toFixed(2));
        const transferWeightTotal = +(yarnTransferUsage1.yarnBoxInfo.reduce((prev, cur) => {return prev + cur.yarnTransferWeight;}, 0).toFixed(2));

        // ## sometime error margin , page >= 2 error
        // ## adjust right margin
        let marginLeft = 35;
        let marginRight = 15;
        // if (mode==='single') {
        //     marginLeft = 35;
        //     marginRight = 15;
        // } else if ((mode==='multi' || mode==='multi-yarn') && idx >= 2) {
        //     marginLeft = 35;
        //     marginRight = 65;
        // }

        const pageBrake: any[] = [{text: '', pageBreak: 'after', style: ['']}];

        function getPageBrake() {
            if (lastInvoice) {
                return undefined;
            }
            return {text: '', pageBreak: 'after', style: ['']};
        }

        const contentTableHeader = [
            {
                columns: [
                    {text: '', style: ['', '']},
                    {text: 'Transfer [packing list]', style: ['', ''], alignment: 'center'},
                    {text: '', style: ['', '']},
                    // {text: 'date print: ' + datePrint, italics: true, fontSize: 6, alignment: 'right', margin: [0, 0, 15, 0]}
                ], margin: [marginLeft, 0, marginRight, 0]
            },
            {
                margin: [marginLeft, -1, marginRight, 0],
                style: 'tableExample',
                // pageOrientation: 'portrait',
                table: {
                    widths: ['15%', '20%', '20%', '20%', '25%'],
                    // pageOrientation: 'portrait',
                    // headerRows: 2,
                    body: [
                        [
                            {text: 'Yarn name:', style: ['txtheadsize', 'marginHeadTop2'], alignment: 'center', fillColor: '#cccccc'},
                            {text: yarnID, style: ['txtheadsize', 'marginHeadTop2'], colSpan: 4, alignment: 'center', fillColor: '#cccccc'},
                            {},{},{}
                        ],
                    ]
                }
            },
            {
                margin: [marginLeft, -1, marginRight, 0],
                style: 'tableExample',
                table: {
                    widths: ['14.7%', '41%', '20%', '24.3%'],
                    // headerRows: 1,
                    body: [
                        [
                            {text: 'Color', style: ['txtheadsize', 'marginHeadTop2'], alignment: 'center', fillColor: '#cccccc'},
                            {text: colorTxt, style: ['txtSmall7', 'marginHeadTop2'], alignment: 'center'},
                            {text: 'Lot ID', style: ['txtheadsize', 'marginHeadTop2'], alignment: 'center', fillColor: '#cccccc'},
                            {text: yarnLotID, style: ['txtheadsize', 'marginHeadTop2'], alignment: 'center'},
                        ]
                    ]
                }
            },
            {
                margin: [marginLeft, -1, marginRight, 0],
                style: 'tableExample',
                table: {
                    widths: ['14.7%', '19.7%', '19.6%', '46%'],
                    // headerRows: 1,
                    body: [
                        [
                            {text: 'Total.Kgs', style: ['txtheadsize', 'marginHeadTop2'], alignment: 'center', fillColor: '#cccccc'},
                            {text: ActualWeightTotal, style: ['txtSmall8', 'txtBold', 'marginHeadTop2'], alignment: 'center'},
                            {text: transferWeightTotal, style: ['txtSmall8', 'txtBold', 'marginHeadTop2'], alignment: 'center'},
                            {text: '', style: ['txtheadsize', 'marginHeadTop2'], alignment: 'center', fillColor: '#d3d3d3'},
                        ]
                    ]
                }
            },
            {
                margin: [marginLeft, -1, marginRight, 20],
                style: 'tableExample',
                table: {
                    //  col = 5
                    //       boxID  act.Kgs    net.Kgs
                    widths: ['15%', '20%',     '20%',    '20%',    '25%'],
                    headerRows: 1,
                    body: [
                        [
                            {text: '#Carton', style: ['txtheadsize', 'marginHeadTop2'], alignment: 'center', fillColor: '#cccccc'},
                            {text: 'Actual Kgs.', style: ['txtheadsize', 'marginHeadTop2'], alignment: 'center', fillColor: '#cccccc'},
                            {text: 'NET Kgs.', style: ['txtheadsize', 'marginHeadTop2'], alignment: 'center', fillColor: '#cccccc'},
                            {text: '', style: ['txtheadsize', 'marginHeadTop2'], alignment: 'center', fillColor: '#d3d3d3'},
                            {text: '', style: ['txtheadsize', 'marginHeadTop2'], alignment: 'center', fillColor: '#d3d3d3'},
                        ],
                        ...this.getTransferPackingListTableBodyPDF(yarnTransferUsage1),  // ## body table
                    ],
                }
            },

            // getPageBrake()   // ## cut end to new next page
        ];
        return contentTableHeader;
    }

    getTransferPackingListTableBodyPDF(yarnTransferUsage1: YarnLotUsageList) {
        let bodyPackingList: any[] = []
        const lastRow = yarnTransferUsage1.yarnBoxInfo.length - 1;

        function getPageBrake(idx: number) {
            if (lastRow === idx) {
                return {text: [{text: '', style: ['', ''], alignment: 'center'}], pageBreak: 'after'};
            }
            return {text: [{text: '', style: ['', ''], alignment: 'center'}]};
        }

        yarnTransferUsage1.yarnBoxInfo.forEach( (item1, index1) => {
            let row1: any[] = [];
            // const weightDif = +(item1.yarnWeight - item1.yarnPlanWeight).toFixed(2);
            row1 = [
                {text: [{text: item1.boxID, style: ['', ''], alignment: 'center'}], color: 'gray'},
                {text: [{text: item1.yarnWeight, style: ['', ''], alignment: 'center'}], color: 'gray'},
                {text: [{text: item1.yarnTransferWeight, style: ['', ''], alignment: 'center'}], color: 'gray'},

                {text: [{text: '', style: ['', ''], alignment: 'center'}], color: 'gray'},
                {text: [{text: '', style: ['txtBold', ''], alignment: 'center'}]},

                // getPageBrake(index1),
            ];
            bodyPackingList.push(row1);
        });
        // const rowBreakAfter

        return bodyPackingList;
    }

    xxxgetPackingListTableBodyPDF(yarnPackingList1: YarnPackingList) {
        let bodyPackingList: any[] = []
        const lastRow = yarnPackingList1.yarnBoxInfo.length - 1;

        function getPageBrake(idx: number) {
            if (lastRow === idx) {
                return {text: [{text: '', style: ['', ''], alignment: 'center'}], pageBreak: 'after'};
            }
            return {text: [{text: '', style: ['', ''], alignment: 'center'}]};
        }

        yarnPackingList1.yarnBoxInfo.forEach( (item1, index1) => {
            let row1: any[] = [];
            const weightDif = +(item1.yarnWeight - item1.yarnPlanWeight).toFixed(2);
            row1 = [
                {text: [{text: index1 + 1 +'', style: ['', ''], alignment: 'center'}], color: 'gray'},
                {text: [{text: item1.boxID, style: ['', ''], alignment: 'center'}], color: 'gray'},
                {text: [{text: item1.yarnPlanWeight, style: ['', ''], alignment: 'center'}], color: 'gray'},
                {text: [{text: weightDif, style: ['', ''], alignment: 'center'}], color: 'gray'},
                {text: [{text: item1.yarnWeight, style: ['txtBold', ''], alignment: 'center'}]},

                {text: [{text: item1.coneQty, style: ['', ''], alignment: 'center'}], color: 'gray', italics: true},
                {text: [{text: '- '+item1.cCWeight, style: ['', ''], alignment: 'center'}], color: 'gray'},
                {text: [{text: item1.yarnWeightNet, style: ['txtBold', 'txt9'], alignment: 'center'}], color: 'green'},

                {text: [{text: '', style: ['', ''], alignment: 'center'}]},
                // getPageBrake(index1),
            ];
            bodyPackingList.push(row1);
        });
        // const rowBreakAfter

        return bodyPackingList;
    }

    xxgetPackingListTablePDF(mode: string, yarnID: string, rowYarnPackingListPDF: YarnPackingList[]) {
        let contentX: any[] = [];
        const invLen = rowYarnPackingListPDF.length;

        rowYarnPackingListPDF.forEach( (item1, index1) => {
            const contentInVPackingList1: any[] = this.genInvoicePackingListTablePDF(mode, yarnID, item1, invLen===index1+1, index1, 'normal');
            // contentX.push(...contentPackingListHeaderTop);
            contentX.push(...contentInVPackingList1);
            // console.log(index1);
        });
        // console.log(contentX);
        return contentX;
    }

    generateTransferPDF(headerTxt: string) {
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
        let docDefinition: any = {
            pageSize: 'A4',
            // pageMargins: [ 3, 10, 3, 10 ],
            pageMargins: [ 3, 20, 3, 30 ],
            // header: head2,
            // pageOrientation: 'portrait',
            // pageOrientation: 'portrait',
            content: this.contentTransferPDF,
            // content: content1,
            // content: [content1, content1],
            // defaultStyle: {font: 'Roboto', fontSize: 10},
            // header: headerTxt,   , margin: [0, 5, 5, 0]
            header: {
                columns: [
                    {text: headerTxt, italics: true, fontSize: 6, alignment: 'left', margin: [10, 2, 0, 0]},
                    '',
                    {text: 'date print: ' + datePrint, italics: true, fontSize: 6, alignment: 'right', margin: [1, 5, 10, 0]},
                ], margin: [35, 5, 15, 0]
            },
            footer: function(currentPage: any, pageCount: any) {
                return {
                    columns: [
                      '',
                      {text: headerTxt + ' , date print: ' + datePrint, italics: true, fontSize: 6, alignment: 'right'},
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


    // ##  #########################################################
    // yarnStock,

    // createYarnStockPDF(yarnData: YarnData, yarnStockRow: YarnStockRow[]) {
    //     // console.log(yarnData);
    //     // console.log(yarnStockRow);

    //     this.contentStockPDF = [];
    //     const contentStockHeaderTop = this.getStockHeaderPDF();

    //     // ## get body pdf
    //     const contentTransferTable = this.getStockTablePDF(yarnData, yarnStockRow);

    //     const packingListX = this.createStockPackingListPDF(yarnStockRow);

    //     const pageBrake: any[] = [{text: '', pageBreak: 'after', style: ['']}];
    //     this.contentStockPDF = [
    //         ...this.contentStockPDF,
    //         ...contentStockHeaderTop,
    //         ...contentTransferTable,
    //         ...pageBrake,
    //         ...packingListX
    //     ];

    //     const docDefinition: any = this.generateStockPDF('yarn-rep05');

    //     return docDefinition;
    // }

    contentStockCardPDF: any[] = [];
    yarnLotUsageRow: YarnLotUsageRow[] = [];

    exportPDFStockCard(yarnLotUsageRow: YarnLotUsageRow[], yarnCardInfo: any, sumaryOrderIDPCS: string[]) {
        // console.log(yarnLotUsageRow);
        const yarnID = yarnCardInfo.yarnID;
        const colorS = yarnCardInfo.colorS;
        const colorTxt = yarnCardInfo.colorTxt;
        const headerTxt = yarnCardInfo.headerTxt;

        // this.yarnDataInfoPackingListPDF = [];  // ## clear data
        // this.contentPackingListPDF = [];  // ## clear data
        // this.rowYarnPackingListPDF = [];  // ## clear data

        this.contentStockCardPDF = [];
        const contentHeaderTop = this.getCardHeaderPDF();
        const contentStockCardHeaderTop = this.getStockCardHeaderPDF(yarnLotUsageRow, yarnCardInfo, sumaryOrderIDPCS);

        // // ## get body pdf
        // const contentTransferTable = this.getStockTablePDF(yarnData, yarnStockRow);

        this.contentStockCardPDF = [
            ...this.contentStockCardPDF,
            ...contentHeaderTop,
            ...contentStockCardHeaderTop,
            // ...contentTransferTable,
            // ...pageBrake,
            // ...packingListX
        ];

        // const headerTxt = 'StockCard01';
        const docDefinition: any = this.generateStockCardPDF(headerTxt);

        return docDefinition;
    }

    getCardHeaderPDF() {
        // ## header top
        const datePrint = this.userService.returnDDMMYYYY(0,'-');
                        // +' '
                        // +this.userService.returnHHMM(0,':');
        const contentHeaderTop = [
            {columns: [
				{text: '', style: ['', '']},
                {text: '', style: ['', '']},
                // {text: 'Yarn [Stock] [packing list]', style: ['', ''], alignment: 'center'},
				{text: 'Date : ' + datePrint, fontSize: 7, alignment: 'right', margin: [0, 0, 15, 0]}
			]},
            // { text: yarnID, style: ['', ''], alignment: 'left', margin: [15, 0, 15, 0], },
        ];
        return contentHeaderTop;
    }

    getStockCardHeaderPDF(yarnLotUsageRow: YarnLotUsageRow[], yarnCardInfo: any, sumaryOrderIDPCS: string[]) {
        const yarnFullName = this.userService.strFirstAndDot(this.getYarnfullName(yarnCardInfo.yarnID), this.yarnFullNameLen);

        const contentTableHeader = [
            {
                // margin: [35, 0, 15, 0],
                //  7
                style: 'tableExample',
                table: {  // ## #11
                    widths: ['8%',  '5%',   '11%',   '9%',   '10%',   '10%', '4%',  '10%',   '9%', '5%',   '8%',   '11%'],
                    headerRows: 4,
                    body: [
                        [
                            {text: yarnFullName, style: ['txtheadsize', 'marginHeadTop2'], colSpan: 12, alignment: 'center', fillColor: '#cccccc'},
                            {},{},{},{},{},{},{},{},{},{},{}
                        ],
                        [
                            {text: yarnCardInfo.colorTxt, style: ['txtheadsize', 'marginHeadTop2'], colSpan: 12, alignment: 'center', fillColor: '#cccccc'},
                            {},{},{},{},{},{},{},{},{},{},{}
                        ],

                        [
                            {text: 'Date', style: ['txtSmall8', 'marginHeadTop2'], rowSpan: 2, alignment: 'center', fillColor: '#cccccc', margin: [0, 10]},
                            {text: 'Issue', style: ['txtSmall8', 'marginHeadTop2'], rowSpan: 2, alignment: 'center', fillColor: '#cccccc', margin: [0, 10]},
                            {text: 'Invoice', style: ['txtSmall8', 'marginHeadTop2'], rowSpan: 2, alignment: 'center', fillColor: '#cccccc', margin: [0, 10]},
                            {text: 'Lot ID', style: ['txtSmall8', 'marginHeadTop2'], rowSpan: 2, alignment: 'center', fillColor: '#cccccc', margin: [0, 10]},

                            {text: 'Received', style: ['txtSmall8', 'marginHeadTop2'], colSpan: 2, alignment: 'center', fillColor: '#cccccc'},
                            {},

                            {text: 'Send', style: ['txtSmall8', 'marginHeadTop2'], rowSpan: 2, alignment: 'center', fillColor: '#cccccc', margin: [0, 10]},
                            {text: 'Style', style: ['txtSmall8', 'marginHeadTop2'], rowSpan: 2, alignment: 'center', fillColor: '#cccccc', margin: [0, 10]},
                            {text: 'Lot ID', style: ['txtSmall8', 'marginHeadTop2'], rowSpan: 2, alignment: 'center', fillColor: '#cccccc', margin: [0, 10]},
                            {text: 'Pcs.', style: ['txtSmall8', 'marginHeadTop2'], rowSpan: 2, alignment: 'center', fillColor: '#cccccc', margin: [0, 10]},
                            {text: 'Kgs.', style: ['txtSmall8', 'marginHeadTop2'], rowSpan: 2, alignment: 'center', fillColor: '#cccccc', margin: [0, 10]},
                            {text: 'Balance', style: ['txtSmall8', 'marginHeadTop2'], rowSpan: 2, alignment: 'center', fillColor: '#cccccc', margin: [0, 10]},

                        ],
                        [
                            // '','','','','','','','','','',''
                            {text: '', style: 'tableHeader', alignment: 'center'},
                            {text: '', style: 'tableHeader', alignment: 'center'},
                            {text: '', style: 'tableHeader', alignment: 'center'},
                            {text: '', style: 'tableHeader', alignment: 'center'},
                            {text: 'Invoice', style: ['txtSmall8', 'marginHeadTop2'], alignment: 'center', fillColor: '#cccccc'},
                            {text: 'NET.Actual', style: ['txtSmall8', 'marginHeadTop2'], alignment: 'center', fillColor: '#cccccc'},
                            {text: '', style: 'tableHeader', alignment: 'center'},
                            {text: '', style: 'tableHeader', alignment: 'center'},
                            {text: '', style: 'tableHeader', alignment: 'center'},
                            {text: '', style: 'tableHeader', alignment: 'center'},
                            {text: '', style: 'tableHeader', alignment: 'center'},
                            {text: '', style: 'tableHeader', alignment: 'center'},
                        ],

                        ...this.getYarnStockCardTableBodyPDF(yarnLotUsageRow, sumaryOrderIDPCS),  // ## body table
                    ],
                }
            },
            //
        ];
        return contentTableHeader;

    }

    getYarnStockCardTableBodyPDF(yarnLotUsageRow: YarnLotUsageRow[], sumaryOrderIDPCS: string[]) {

        let contentBody: any[] = [];

        // ## calculate total --> Invoice , NET.Actual , percent  , Kgs , Balance
        const yarnInvoiceWeightTotal = +yarnLotUsageRow.reduce((prev, cur) => {return prev + cur.yarnInvoiceWeight;}, 0).toFixed(2);
        const yarnWeightNetTotal = +yarnLotUsageRow.reduce((prev, cur) => {return prev + cur.yarnWeightNet;}, 0).toFixed(2);
        const useYarnWeightTotal = +yarnLotUsageRow.reduce((prev, cur) => {return prev + cur.useYarnWeight;}, 0).toFixed(2);

        const rowBlank: any[] = [
            {text: [{text: ' ', style: ['', ''], alignment: 'center'}]},
            {text: [{text: ' ', style: ['', ''], alignment: 'center'}]},
            {text: [{text: ' ', style: ['', ''], alignment: 'center'}]},
            {text: [{text: ' ', style: ['', ''], alignment: 'center'}]},
            {text: [{text: ' ', style: ['', ''], alignment: 'center'}]},
            {text: [{text: ' ', style: ['', ''], alignment: 'center'}]},
            {text: [{text: ' ', style: ['', ''], alignment: 'center'}]},
            {text: [{text: ' ', style: ['', ''], alignment: 'center'}]},
            {text: [{text: ' ', style: ['', ''], alignment: 'center'}]},
            {text: [{text: ' ', style: ['', ''], alignment: 'center'}]},
            {text: [{text: ' ', style: ['', ''], alignment: 'center'}]},
            {text: [{text: ' ', style: ['', ''], alignment: 'center'}]}
        ];

        let rowCurrent: any[] = rowBlank.map(obj => ({...obj})); // copy array object
        let yarnLotUsageRowOld: YarnLotUsageRow = GBC.clrYarnLotUsageRow();

        function getDate(yarnLotUsageRow1: YarnLotUsageRow, idx: number) {
            // return yarnLotUsageRow.ddmmyyyyIssue;
            if (idx === 0) {
                return {text: [{text: yarnLotUsageRow1.ddmmyyyyIssue, style: ['txtSmall5', ''], alignment: 'center'}]};
            } else if (yarnLotUsageRow[idx - 1].usageMode === 't') {
                return {text: [{text: yarnLotUsageRow1.ddmmyyyyIssue, style: ['txtSmall5', ''], alignment: 'center'}]};
            } else if (yarnLotUsageRow1.ddmmyyyyIssue !== yarnLotUsageRowOld.ddmmyyyyIssue) {
                return {text: [{text: yarnLotUsageRow1.ddmmyyyyIssue, style: ['txtSmall5', ''], alignment: 'center'}]};
            } else if (yarnLotUsageRow1.ddmmyyyyIssue === yarnLotUsageRowOld.ddmmyyyyIssue) {
                return {text: [{
                    text: '',
                    style: ['txtSmall5', ''],
                    alignment: 'center'
                }]};
            }
            return {text: [{
                text: '',
                style: ['txtSmall5', ''],
                alignment: 'center'
            }]};
        }

        function getInvoiceID(yarnLotUsageRow1: YarnLotUsageRow, idx: number) {
            // ## invoiceID
            if (idx === 0) {
                return {text: [{text: yarnLotUsageRow1.invoiceID, style: ['txtSmall5', ''], alignment: 'center'}]};
            } else if (yarnLotUsageRow[idx - 1].usageMode === 't') {
                return {text: [{text: yarnLotUsageRow1.invoiceID, style: ['txtSmall5', ''], alignment: 'center'}]};
            } else if (yarnLotUsageRow1.invoiceID !== yarnLotUsageRowOld.invoiceID) {
                return {text: [{text: yarnLotUsageRow1.invoiceID, style: ['txtSmall5', ''], alignment: 'center'}]};
            } else if (yarnLotUsageRow1.invoiceID === yarnLotUsageRowOld.invoiceID) {
                return {text: [{
                    text: '',
                    style: ['txtSmall5', ''],
                    alignment: 'center'
                }]};
            }
            return {text: [{
                text: '',
                style: ['txtSmall5', ''],
                alignment: 'center'
            }]};
        }

        function getTargetPlaceID(yarnLotUsageRow1: YarnLotUsageRow) {
            if (yarnLotUsageRow1.targetPlaceID === '') {
                return '';
            } else {
                return '  /' + yarnLotUsageRow1.targetPlaceID;
            }
        }

        yarnLotUsageRow.forEach( (item, index) => {
            let row1: any[] = [...rowBlank];
            if (item.usageMode === 'ct') {
                row1 = [
                    // {text: [{text: item.ddmmyyyyIssue, style: ['txtSmall5', ''], alignment: 'center'}]},
                    getDate(item, index),
                    {text: [{text: '', style: ['txtSmall5', ''], alignment: 'center'}]},
                    // {text: [{text: item.invoiceID, style: ['txtSmall5', ''], alignment: 'center'}]},
                    getInvoiceID(item, index),
                    {text: [{text: item.yarnLotID, style: ['txtSmall5', ''], alignment: 'center'}]},
                    {text: [{text: item.yarnInvoiceWeight.toFixed(2), style: ['txtSmall6', ''], alignment: 'right'}]},
                    {text: [{text: item.yarnWeightNet.toFixed(2), style: ['txtSmall6', ''], alignment: 'right'}]},

                    {text: [{text: '', style: ['txtSmall5', ''], alignment: 'center'}]},
                    {text: [{text: '', style: ['txtSmall5', ''], alignment: 'center'}]},
                    {text: [{text: '', style: ['txtSmall5', ''], alignment: 'center'}]},
                    {text: [{text: '', style: ['txtSmall6', ''], alignment: 'center'}]},
                    {text: [{text: '', style: ['txtSmall6', ''], alignment: 'center'}]},
                    {text: [{text: item.balance.toFixed(2), style: ['txtSmall6', ''], alignment: 'right'}]},
                ];
            } else if (item.usageMode === 't') {
                row1 = [
                    {text: [{text: item.ddmmyyyyIssue, style: ['txtSmall5', ''], alignment: 'center'}]},
                    {text: [{text: item.issueNote, style: ['txtSmall4', ''], alignment: 'center'}]},
                    {text: [{text: item.invoiceID, style: ['txtSmall5', ''], alignment: 'center'}]},
                    {text: [{text: '', style: ['txtSmall6', ''], alignment: 'center'}]},
                    {text: [{text: '', style: ['txtSmall6', ''], alignment: 'center'}]},
                    {text: [{text: '', style: ['txtSmall6', ''], alignment: 'center'}]},

                    {text: [{text: item.toFactoryID, style: ['txtSmall5', ''], alignment: 'center'}]},
                    {text: [
                        {text: item.orderID, style: ['txtSmall6', '']},
                        {text: getTargetPlaceID(item), style: ['txtSmall4', '']},
                    ], alignment: 'center'},
                    // {text: [{text: getTargetPlaceID(item), style: ['txtSmall4', ''], alignment: 'center'}]},
                    {text: [{text: item.yarnLotID2, style: ['txtSmall5', ''], alignment: 'center'}]},
                    {text: [{text: item.pcs===0?'':item.pcs, style: ['txtSmall5', ''], alignment: 'center'}]},
                    {text: [{text: '-'+ +item.useYarnWeight.toFixed(2), style: ['txtSmall6', ''], alignment: 'right'}]},
                    {text: [{text: item.balance.toFixed(2), style: ['txtSmall6', ''], alignment: 'right'}]},
                ];
            }

            contentBody.push([...row1]);
            rowCurrent = [...row1];
            yarnLotUsageRowOld = item;
        });

        // const yarnInvoiceWeightTotal = +yarnLotUsageRow.reduce((prev, cur) => {return prev + cur.yarnInvoiceWeight;}, 0).toFixed(2);
        // const yarnWeightNetTotal = +yarnLotUsageRow.reduce((prev, cur) => {return prev + cur.yarnWeightNet;}, 0).toFixed(2);
        // const useYarnWeightTotal = +yarnLotUsageRow.reduce((prev, cur) => {return prev + cur.useYarnWeight;}, 0).toFixed(2);
        const len = yarnLotUsageRow.length;
        // ## add total line @ eof
        let totalRow1 = [
            {text: 'TOTAL', style: ['txtSmall6', 'txtBold'], colSpan: 4, alignment: 'center'},
            {},{},{},
            {text: [{text: yarnInvoiceWeightTotal.toFixed(2), style: ['txtSmall6', ''], alignment: 'right'}]},
            {text: [{text: yarnWeightNetTotal.toFixed(2), style: ['txtSmall6', ''], alignment: 'right'}]},

            {text: [{text: ' ', style: ['', ''], alignment: 'center'}], border: [true, true, false, true]},

            {stack: [...sumaryOrderIDPCS], style: ['txtSmall6', ''], colSpan: 4, alignment: 'left' , border: [false, true, true, true]},
            {},{},

            {text: [{text: useYarnWeightTotal.toFixed(2), style: ['txtSmall6', ''], alignment: 'right'}]},
            {text: [{text: yarnLotUsageRow[len-1].balance.toFixed(2), style: ['txtSmall6', ''], alignment: 'right'}]},
        ];
        contentBody.push([...totalRow1]);

        return contentBody;
    }

    generateStockCardPDF(headerTxt: string) {
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
        let docDefinition: any = {
            pageSize: 'A4',
            // pageMargins: [ 3, 10, 3, 10 ],
            pageMargins: [ 15, 20, 15, 30 ],
            // header: head2,
            // pageOrientation: 'portrait',
            // pageOrientation: 'portrait',
            content: this.contentStockCardPDF,
            // content: content1,
            // content: [content1, content1],
            // defaultStyle: {font: 'Roboto', fontSize: 10},
            // header: headerTxt,   , margin: [0, 5, 5, 0]
            header: {
                columns: [
                    {text: headerTxt, italics: true, fontSize: 6, alignment: 'left', margin: [10, 5, 0, 0]},
                    '',
                    '',
                    // {text: 'date print: ' + datePrint, italics: true, fontSize: 6, alignment: 'right', margin: [1, 2, 10, 0]},
                ] //, margin: [35, 5, 15, 0]
            },
            footer: function(currentPage: any, pageCount: any) {
                return {
                    columns: [
                    //   '',
                      {text: headerTxt + ' , date print: ' + datePrint, italics: true, fontSize: 6, alignment: 'right'},
                      '',
                      { text: currentPage.toString() + ' of ' + pageCount, alignment: 'center' },
                    //   '',
                    ] //, margin: [35, 0, 15, 5]
                };
            },
            defaultStyle: { fontSize: 8},
            styles: style,
        };

        // pdfMake.createPdf(docDefinition).open();
        return docDefinition;
    }



    contentStockPDF: any[] = [];

    createYarnStockPDF(yarnData: YarnData, yarnStockRow: YarnStockRow[]) {
        // console.log(yarnData);
        // console.log(yarnStockRow);

        this.contentStockPDF = [];
        const contentStockHeaderTop = this.getStockHeaderPDF();

        // ## get body pdf
        const contentTransferTable = this.getStockTablePDF(yarnData, yarnStockRow);

        const packingListX = this.createStockPackingListPDF(yarnStockRow);

        const pageBrake: any[] = [{text: '', pageBreak: 'after', style: ['']}];
        this.contentStockPDF = [
            ...this.contentStockPDF,
            ...contentStockHeaderTop,
            ...contentTransferTable,
            ...pageBrake,
            ...packingListX
        ];

        const docDefinition: any = this.generateStockPDF('yarn-rep05');

        return docDefinition;
    }

    getStockHeaderPDF() {
        // ## header top
        const datePrint = this.userService.returnDDMMYYYY(0,'-')
                        +' '
                        +this.userService.returnHHMM(0,':');
        const contentHeaderTop = [
            {columns: [
				{text: '', style: ['', '']},
                {text: 'Yarn [Stock] [packing list]', style: ['', ''], alignment: 'center'},
                {text: '', style: ['', '']},
				// {text: 'date print: ' + datePrint, italics: true, fontSize: 6, alignment: 'right', margin: [0, 0, 15, 0]}
			]},
            // { text: yarnID, style: ['', ''], alignment: 'left', margin: [15, 0, 15, 0], },
        ];
        return contentHeaderTop;
    }

    getStockTablePDF(yarnData: YarnData, yarnStockRow: YarnStockRow[]) {
        const  yarnID = yarnData.yarnID;
        // getSetNameColorByOrderID  usageInfo
        // let setName = '';
        // let customerName = '';
        // let orderID = '';
        // if (yarnTransferUsage1.length > 0) {
        //     setName = this.userService.getSetNameColorByOrderID(yarnTransferUsage1[0].usageInfo.orderID);
        //     customerName = this.userService.getCustomerName(yarnTransferUsage1[0].customerID);
        //     yarnID = yarnTransferUsage1[0].yarnID;
        //     orderID = yarnTransferUsage1[0].usageInfo.orderID;
        // }
        const contentTableHeader = [
            {
                margin: [35, 0, 15, 0],
                style: 'tableExample',
                table: {  //  ???   color   lot ID   carton   weight     note
                    widths: ['15%',  '20%',   '20%',   '10%',   '20%',   '15%'],
                    headerRows: 2,
                    body: [
                        [
                            {text: 'Yarn name:', style: ['txtheadsize', 'marginHeadTop2'], alignment: 'center', fillColor: '#cccccc'},
                            {text: yarnID, style: ['txtheadsize', 'marginHeadTop2'], colSpan: 5, alignment: 'center', fillColor: '#cccccc'},
                            {},{},{},{}
                        ],
                        [
                            {text: '', style: ['txtheadsize', 'marginHeadTop2'], alignment: 'center', fillColor: '#cccccc'},
                            {text: 'Color', style: ['txtheadsize', 'marginHeadTop2'], alignment: 'center', fillColor: '#cccccc'},
                            {text: 'Lot ID', style: ['txtheadsize', 'marginHeadTop2'], alignment: 'center', fillColor: '#cccccc'},
                            {text: 'Carton', style: ['txtheadsize', 'marginHeadTop2'], alignment: 'center', fillColor: '#cccccc'},
                            {text: 'Weight [ NET ]', style: ['txtheadsize', 'marginHeadTop2'], alignment: 'center', fillColor: '#cccccc'},
                            {text: 'note', style: ['txtheadsize', 'marginHeadTop2'], alignment: 'center', fillColor: '#cccccc'},
                        ],
                        ...this.getYarnStockTableBodyPDF(yarnStockRow),  // ## body table
                    ],
                }
            },
            //
        ];
        return contentTableHeader;
    }

    getYarnStockTableBodyPDF(yarnStockRow: YarnStockRow[]) {
        const rowBlank: any[] = [
            {text: [{text: ' ', style: ['', ''], alignment: 'center'}], border: [true, false, false, true]},
            {text: [{text: '', style: ['', ''], alignment: 'center'}], border: [false, false, false, true]},
            {text: [{text: '', style: ['', ''], alignment: 'center'}], border: [false, false, false, true]},
            {text: [{text: '', style: ['', ''], alignment: 'center'}], border: [false, false, false, true]},
            {text: [{text: '', style: ['', ''], alignment: 'center'}], border: [false, false, false, true]},
            {text: [{text: '', style: ['', ''], alignment: 'center'}], border: [false, false, true, true]},
        ];
        let rowCurrent: any[] = rowBlank.map(obj => ({...obj})); // copy array object
        let contentBody: any[] = [];
        // let yarnTransferUsageGroupRowOld: YarnTransferUsageRow = GBC.clrYarnTransferUsageRow();
        let yarnStockRowOld: YarnStockRow = GBC.clrYarnStockRow();

        function getDate(yarnTransRow: YarnTransferUsageRow, idx: number) {
            // return yarnTransRow.ddmmyyyy;
            return {text: [{
                text: yarnTransRow.ddmmyyyy,
                style: ['txtSmall7', ''],
                alignment: 'center'
            }]};
        }

        function getColor(yarnStockRow: YarnStockRow , strFirstAndDot: Function) {
            const colorX = strFirstAndDot(yarnStockRow.colorCode + ' ' + yarnStockRow.colorName, 20);
            let color1 = '';
            if (yarnStockRow.colorCode !== yarnStockRowOld.colorCode) {
                color1 = colorX;
            }
            // console.log(color1);
            return {text: [{
                text: color1,
                style: ['txtSmall7', ''],
                alignment: 'center'
            }]};
        }

        function getLotID(yarnStockRow: YarnStockRow) {
            // return yarnTransRow.ddmmyyyy;
            return {text: [{
                text: yarnStockRow.yarnLotID,
                style: ['txtSmall7', ''],
                alignment: 'center'
            }]};
        }

        function getCarton(yarnStockRow: YarnStockRow) {
            if (yarnStockRow.rowState === 't') {
                return {text: [{
                    text: yarnStockRow.carton,
                    style: ['txtSmall7', 'txtBold'],
                    alignment: 'center'
                }], fillColor: '#faedc4'};
            } else if (yarnStockRow.rowState === 'gt') {
                return {text: [{
                    text: yarnStockRow.carton,
                    style: ['txtSmall7', 'txtBold'],
                    alignment: 'center'
                }], fillColor: '#fcc39b'};
            }
            return {text: [{
                text: yarnStockRow.carton,
                style: ['txtSmall7', ''],
                alignment: 'center'
            }]};
        }

        function getWeight(yarnStockRow: YarnStockRow) {
            if (yarnStockRow.rowState === 't') {
                return {text: [{
                    text: yarnStockRow.yarnStockWeightTotal,
                    style: ['txtSmall7', 'txtBold'],
                    alignment: 'center'
                }], fillColor: '#faedc4'};
            } else if (yarnStockRow.rowState === 'gt') {
                return {text: [{
                    text: yarnStockRow.yarnStockWeightTotal,
                    style: ['txtSmall7', 'txtBold'],
                    alignment: 'center'
                }], fillColor: '#fcc39b'};
            }
            return {text: [{
                text: yarnStockRow.yarnStockWeightTotal,
                style: ['txtSmall7', ''],
                alignment: 'center'
            }]};
        }

        yarnStockRow.forEach( (item, index) => {
            let row1: any[] = [...rowBlank];
            if (item.rowState === 'd') {
                row1 = [
                    // {text: [{text: '', style: ['', ''], alignment: 'center'}]},  // ## blank column
                    {text: [{text: '', style: ['txtSmall6', ''], alignment: 'center'}]},
                    getColor(item, this.userService.strFirstAndDot),
                    getLotID(item),
                    getCarton(item),
                    getWeight(item),
                    {text: [{text: '', style: ['txtSmall6', ''], alignment: 'center'}]},
                ];
            } else if (item.rowState === 'sd') {
                row1 = [
                    {text: [{text: '', style: ['txtSmall6', ''], alignment: 'center'}]},
                    getColor(item, this.userService.strFirstAndDot),
                    getLotID(item),
                    getCarton(item),
                    getWeight(item),
                    {text: [{text: '', style: ['txtSmall6', ''], alignment: 'center'}]},
                ];
            } else if (item.rowState === 't') {
                row1 = [
                    {text: [{text: '', style: ['txtSmall6', ''], alignment: 'center'}]},
                    {text: [{text: '', style: ['txtSmall6', ''], alignment: 'center'}]},
                    {text: [{text: 'Total', style: ['txtSmall8', 'txtBold'], alignment: 'center'}], fillColor: '#faedc4'},
                    getCarton(item),
                    getWeight(item),
                    {text: [{text: '', style: ['txtSmall6', ''], alignment: 'center'}]},
                ];
            } else if (item.rowState === 'gt') {
                const rowB = [...rowBlank];
                contentBody.push([...rowB]);
                row1 = [
                    {text: [{text: '', style: ['txtSmall6', ''], alignment: 'center'}]},
                    {text: [{text: '', style: ['txtSmall6', ''], alignment: 'center'}]},
                    {text: [{text: 'GrandTotal', style: ['txtSmall8', 'txtBold'], alignment: 'center'}], fillColor: '#fcc39b'},
                    getCarton(item),
                    getWeight(item),
                    {text: [{text: '', style: ['txtSmall6', ''], alignment: 'center'}], border: [true, true, true, true]},
                ];
            } else if (item.rowState === 'b') {
                row1 = [...rowBlank];
            }
            contentBody.push([...row1]);
            rowCurrent = [...row1];
            yarnStockRowOld = item;
        });
        // console.log(contentBody);
        return contentBody;
    }

    createStockPackingListPDF(yarnStockRow: YarnStockRow[]) {
        let contentX: any[] = [];
        const yarnStockRowC = yarnStockRow.map(obj => ({...obj})); // copy array object
        const yarnStockRowF = yarnStockRowC.filter(i=>i.rowState === 'd' || i.rowState === 'sd');
        const invLen = yarnStockRowF.length;

        yarnStockRowF.forEach( (item1, index1) => {
            const contentStockPackingList1: any[] = this.genStockPackingListTablePDF(item1, invLen===index1+1, index1);
            // contentX.push(...contentPackingListHeaderTop);
            contentX.push(...contentStockPackingList1);
            // console.log(index1);
        });
        // console.log(contentX);
        return contentX;
    }

    genStockPackingListTablePDF(yarnStockRow: YarnStockRow, lastLotID: boolean, idx: number) {
        const yarnID = yarnStockRow.yarnID;
        const color3 = yarnStockRow.yarnColorID.split(';');
        const setname = color3[0];
        const colorCode = color3[1];
        const colorID = color3[2];
        const colorName = this.userService.getColorNameByColorCode(colorID, setname);
        // const setName = this.userService.getSetNameColorByOrderID(yarnTransferUsage1.usageInfo.orderID);
        const customerName = setname.toUpperCase();
        const orderID = '';

        const invoiceID = yarnStockRow.invoiceID;
        const yarnLotID = yarnStockRow.yarnLotID;
        const colorTxt = ' ' + colorCode + ' ' + colorName;
        const headTxt = colorTxt + ' ,  Lot ID: ' + yarnLotID;

        const actualWeightTotal = +(yarnStockRow.yarnBoxInfo.reduce((prev, cur) => {return prev + cur.yarnWeight;}, 0).toFixed(2));
        const stockWeightTotal = +(yarnStockRow.yarnBoxInfo.reduce((prev, cur) => {return prev + cur.useWeight;}, 0).toFixed(2));

        // ## sometime error margin , page >= 2 error
        // ## adjust right margin
        let marginLeft = 35;
        let marginRight = 15;
        // if (mode==='single') {
        //     marginLeft = 35;
        //     marginRight = 15;
        // } else if ((mode==='multi' || mode==='multi-yarn') && idx >= 2) {
        //     marginLeft = 35;
        //     marginRight = 65;
        // }

        const pageBrake: any[] = [{text: '', pageBreak: 'after', style: ['']}];

        function getPageBrake() {
            if (lastLotID) {
                return undefined;
            }
            return {text: '', pageBreak: 'after', style: ['']};
        }

        const contentTableHeader = [
            {
                columns: [
                    {text: '', style: ['', '']},
                    {text: 'Stock [packing list]', style: ['', ''], alignment: 'center'},
                    {text: '', style: ['', '']},
                    // {text: 'date print: ' + datePrint, italics: true, fontSize: 6, alignment: 'right', margin: [0, 0, 15, 0]}
                ], margin: [marginLeft, 0, marginRight, 0]
            },
            {
                margin: [marginLeft, -1, marginRight, 0],
                style: 'tableExample',
                // pageOrientation: 'portrait',
                table: {
                    widths: ['15%', '20%', '20%', '20%', '25%'],
                    // pageOrientation: 'portrait',
                    // headerRows: 2,
                    body: [
                        [
                            {text: 'Yarn name:', style: ['txtheadsize', 'marginHeadTop2'], alignment: 'center', fillColor: '#cccccc'},
                            {text: yarnID, style: ['txtheadsize', 'marginHeadTop2'], colSpan: 4, alignment: 'center', fillColor: '#cccccc'},
                            {},{},{}
                        ],
                    ]
                }
            },
            {
                margin: [marginLeft, -1, marginRight, 0],
                style: 'tableExample',
                table: {
                    widths: ['14.7%', '41%', '20%', '24.3%'],
                    // headerRows: 1,
                    body: [
                        [
                            {text: 'Color', style: ['txtheadsize', 'marginHeadTop2'], alignment: 'center', fillColor: '#cccccc'},
                            {text: colorTxt, style: ['txtSmall7', 'marginHeadTop2'], alignment: 'center'},
                            {text: 'Lot ID', style: ['txtheadsize', 'marginHeadTop2'], alignment: 'center', fillColor: '#cccccc'},
                            {text: yarnLotID, style: ['txtheadsize', 'marginHeadTop2'], alignment: 'center'},
                        ]
                    ]
                }
            },
            {
                margin: [marginLeft, -1, marginRight, 0],
                style: 'tableExample',
                table: {
                    widths: ['14.7%', '19.7%', '19.6%', '46%'],
                    // headerRows: 1,
                    body: [
                        [
                            {text: 'Total.Kgs', style: ['txtheadsize', 'marginHeadTop2'], alignment: 'center', fillColor: '#cccccc'},
                            {text: actualWeightTotal, style: ['txtSmall8', 'txtBold', 'marginHeadTop2'], alignment: 'center'},
                            {text: stockWeightTotal, style: ['txtSmall8', 'txtBold', 'marginHeadTop2'], alignment: 'center'},
                            {text: '', style: ['txtheadsize', 'marginHeadTop2'], alignment: 'center', fillColor: '#d3d3d3'},
                        ]
                    ]
                }
            },
            {
                margin: [marginLeft, -1, marginRight, 20],
                style: 'tableExample',
                table: {
                    //  col = 5
                    //       boxID  act.Kgs    net.Kgs
                    widths: ['15%', '20%',     '20%',    '20%',    '25%'],
                    headerRows: 1,
                    body: [
                        [
                            {text: '#Carton', style: ['txtheadsize', 'marginHeadTop2'], alignment: 'center', fillColor: '#cccccc'},
                            {text: 'Actual Kgs.', style: ['txtheadsize', 'marginHeadTop2'], alignment: 'center', fillColor: '#cccccc'},
                            {text: 'NET Kgs.', style: ['txtheadsize', 'marginHeadTop2'], alignment: 'center', fillColor: '#cccccc'},
                            {text: '', style: ['txtheadsize', 'marginHeadTop2'], alignment: 'center', fillColor: '#d3d3d3'},
                            {text: '', style: ['txtheadsize', 'marginHeadTop2'], alignment: 'center', fillColor: '#d3d3d3'},
                        ],
                        ...this.getStockPackingListTableBodyPDF(yarnStockRow),  // ## body table
                    ],
                }
            },

            // getPageBrake()   // ## cut end to new next page
        ];
        return contentTableHeader;
    }

    getStockPackingListTableBodyPDF(yarnStockRow: YarnStockRow) {
        let bodyPackingList: any[] = []
        const lastRow = yarnStockRow.yarnBoxInfo.length - 1;

        function getPageBrake(idx: number) {
            if (lastRow === idx) {
                return {text: [{text: '', style: ['', ''], alignment: 'center'}], pageBreak: 'after'};
            }
            return {text: [{text: '', style: ['', ''], alignment: 'center'}]};
        }

        yarnStockRow.yarnBoxInfo.forEach( (item1, index1) => {
            let row1: any[] = [];
            // const weightDif = +(item1.yarnWeight - item1.yarnPlanWeight).toFixed(2);
            row1 = [
                {text: [{text: item1.boxID, style: ['', ''], alignment: 'center'}], color: 'gray'},
                {text: [{text: item1.yarnWeight, style: ['', ''], alignment: 'center'}], color: 'gray'},
                {text: [{text: item1.yarnTransferWeight, style: ['', ''], alignment: 'center'}], color: 'gray'},

                {text: [{text: '', style: ['', ''], alignment: 'center'}], color: 'gray'},
                {text: [{text: '', style: ['txtBold', ''], alignment: 'center'}]},

                // getPageBrake(index1),
            ];
            bodyPackingList.push(row1);
        });
        // const rowBreakAfter

        return bodyPackingList;
    }

    generateStockPDF(headerTxt: string) {
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
        let docDefinition: any = {
            pageSize: 'A4',
            // pageMargins: [ 3, 10, 3, 10 ],
            pageMargins: [ 3, 20, 3, 30 ],
            // header: head2,
            // pageOrientation: 'portrait',
            // pageOrientation: 'portrait',
            content: this.contentStockPDF,
            // content: content1,
            // content: [content1, content1],
            // defaultStyle: {font: 'Roboto', fontSize: 10},
            // header: headerTxt,   , margin: [0, 5, 5, 0]
            header: {
                columns: [
                    {text: headerTxt, italics: true, fontSize: 6, alignment: 'left', margin: [10, 2, 0, 0]},
                    '',
                    {text: 'date print: ' + datePrint, italics: true, fontSize: 6, alignment: 'right', margin: [1, 5, 10, 0]},
                ], margin: [35, 5, 15, 0]
            },
            footer: function(currentPage: any, pageCount: any) {
                return {
                    columns: [
                      '',
                      {text: headerTxt+ ' , date print: ' + datePrint, italics: true, fontSize: 6, alignment: 'right'},
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





    // ## PDF ########################################################
    // #######################################################################

}


