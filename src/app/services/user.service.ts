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
import { environment } from '../../environments/environment';

import { User, UserClass, AuthData, SigupData, StaffList, UserGroupScan, MenuAuthor } from '../models/user.model';
import { ColorS, CommandAroundApp, CommandAroundAppName, Company, ControlApp, DataAroundApp, Factory, GeneralInfo, Language, LanguageData, ModeRes, OrderProductionInfo, OrderTargetPlaceS, OutSourceLocationDepartment, ScreenInfo, SizeS, SysInfo, TargetPlaceS, TokenSet } from '../models/app.model';
// import { SocketIOService } from './socketio.service';

import { UCompany, UFactory } from './../models/user.model';
import { Product, ProductImageProfiles } from '../models/product.model';
import { Customer, LostGroup, MainZone, OPDLost, Order, OrderImage, OrderProduction, OrderProductionQueue, OrderSeasonYears, ProductORInfo, SubNodeFlow, TargetPlace } from '../models/order.model';
import { NodeFlow, NodeStation, NodeStationLoginRequest, OrderProductionScan, SubNodeflowC, UserNode } from '../models/workstation.model';
import { threadId } from 'worker_threads';
import { Yarn, YarnColor, YarnSeason, YarnSupplier } from '../models/yarn.model';
import { GBC } from '../global/const-global';
// import { MenuService } from './menu.service';
// import { debounceTime } from 'rxjs/operators';

const BACKEND_URL = environment.apiUrl + '/user';
const BACKEND_AESP = environment.aesP;
const hostname = environment.hostname;

// ## user, language , getIP-real

@Injectable({
  providedIn: 'root'
})
export class UserService {

    verCurrent = 2;
    ver = 2; // ## version 1 , 2
    adminADDR = 'HengTest';
    // ## ver = 2  --> 2024aw , ....   and next season also

    menuTestvisible = false; // ## test menu from sakai template
    workNodeStationFullScreen = false; // ## for dev mode
    iconConfigShow = false; // ## show icon menu show
    showExportOnCompanyFirstPage = false; // ## show export on first page
    noOutsourceNodeIDs = ['7.QC'];  // ## disable to select
    bundleNodeID = '5.WASHING';

    mainZoneList: any[] = [
        {
            seq: 1,
            targetPlaceID: 'UK',
            targetPlaceName: 'UK',
        },
        {
            seq: 2,
            targetPlaceID: 'ASIA',
            targetPlaceName: 'ASIA',
        },
        {
            seq: 3,
            targetPlaceID: 'SGHI',
            targetPlaceName: 'SHANGHAI',
        },
        {
            seq: 4,
            targetPlaceID: 'JAPN',
            targetPlaceName: 'JAPAN',
        },
        {
            seq: 5,
            targetPlaceID: 'x',
            targetPlaceName: 'x',
        },
    ];

    // ## set const info
    appName = '';
    appVer = '';
    appMail = '';
    imgServer = '';
    // ## starting data info

    // ## node user login
    secondTimer = 300; // ## 5 minute
    uuidUserNodeLoginWaiting = '';

    targetPlaces: TargetPlaceS[] = [];
    mainZone: MainZone[] = [];
    sizes: SizeS[] = [];
    colors: ColorS[] = [];



    pwdLen = 6;
    userClass: UserClass[] = []; //{userClassID: 'usr', userClassName: 'user', seq: 0};
    userClassIDArr: string[] = [];
    deviceInfo: any = null;
    // tokenTimer: any= null;
    timeOutArr: any[] = [];


    // ## device
    screenWidth = 0;
    //   screenHeight = 0;
    screenSize = ''; //## sm md lg xl


    formActive = 'login';
    keyConfirmlink = '';

    // ## image file size
    maxFileSize = 1000000;  // ## limit 1 mb

    // ## user auth
    private userIDEncrypt: string = '';
    private uuid5IDEncrypt: string = '';

    private isNodeAuthenticated = false;
    private isAuthenticated = false;
    private token: string = '';
    private tokenTimer: any;
    private userID: string = '';
    private user: User = GBC.clrUser();
    private user1Company: User = GBC.clrUser();
    userSelected: User = GBC.clrUser();
    private membersCompany: User[] = [];
    userGroupScan: UserGroupScan[] = [];
    private company: Company = GBC.clrCompany();
    companyState = '';
    private companies: Company[] = [];
    private factory: Factory = GBC.clrFactory();
    factories: Factory[] = [];
    factoryDialogSelected: Factory = GBC.clrFactory();  // ## for factory dialog selected
    factorySelect: Factory = GBC.clrFactory();
    private uuid5: string = '';
    private signupStatusListener = new Subject<boolean>();
    private dataAroundAppStatusListener = new Subject<DataAroundApp>();
    private commandAroundAppStatusListener = new Subject<CommandAroundApp>();

    // private commandAroundAppStatusListener = new Subject<{commandAroundApp: any}>();

    indexPageFirstEnter = true;

    // ## controlApp: ControlApp  public ioID: string,
        // public washingAndPressingMerge: boolean,
    controlApp: ControlApp = {clientControl: {ioID: '', washingAndPressingMerge: false}};
    outSourceLocationDepartment: OutSourceLocationDepartment[] = [];
    ioID  = '';
    sysInfo: SysInfo[] = [];

    // ## factory select
    // ## 'select'=normal step , 'selectForOrderQueue'=for order queue ,
    factoryMode = 'select';
    factoryPageLimit = 30;  // ## 10 factory per page

    // ## language
    private _lang = new BehaviorSubject<string>('');
    private lang = '';
    lastLangSelected = '';
    langs: Language[] = [];
    langData: Language = GBC.clrLanguage();

    // ## dark theme
    private _dark = new BehaviorSubject<boolean>(false);
    private dark = false;

    // ## real IP
    private ipAddress = '';

    // asObservable  mode
    orderStyleSelectListener = new Subject<string>();

    // ## error mode
    errorStatusListener = new Subject<ModeRes>();
    // errorObj: ModeRes = { messageID: '', mode:'', value: "" };

    //   // ## screen
    //   screenStatusListener = new Subject<ScreenInfo>();

    // ## pdfmake  font
      pdfMakeFonts = {
        THSarabunNew: {
          normal: hostname + 'assets/fonts/THSarabunNew.ttf',
          bold: hostname + 'assets/fonts/THSarabunNew-Bold.ttf',
          italics: hostname + 'assets/fonts/THSarabunNew-Italic.ttf',
          bolditalics: hostname + 'assets/fonts/THSarabunNew-BoldItalic.ttf'
        },
        Roboto: {
            normal: 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Regular.ttf',
            bold: 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Medium.ttf',
            italics: 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Italic.ttf',
            bolditalics: 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-MediumItalic.ttf'
        },
        // saysettha_web: {
        //   normal: 'saysettha_web.ttf'
        // }
      };

    // ## set initial function
    tokenSet: TokenSet = this.clrTokenSet();

    // ## pos of digin of productBarcodeNo
    stylePos=0;
    styleDigit=12;
    targetIDPos=12;
    targetIDDigit=4;
    countryIDPos=16;
    countryIDDigit=5;
    yearPos=21;
    yearDigit=2;
    colorPos=23;
    colorDigit=10;
    sizePos=33;
    sizeDigit=3;
    sexPos=36;
    sexDigit=1;
    runningNoPos=37;
    runningNoDigit=5;


    // ## product
    private product: Product = GBC.clrProduct();
    private products: Product[] = [];
    productImageProfiles: ProductImageProfiles[] = [];

    // ## yarn
    yarnDevideSign = '::';
    private yarn: Yarn = GBC.clrYarn();
    private yarns: Yarn[] = [];
    yarnSeason = '';
    yarnSeasons: YarnSeason[] = [];
    yarnSuppliers: YarnSupplier[] = [];
    yarnColors: YarnColor[] = [];
    yarnLotManageSlot = 1;  // ## tab show .... tab

    // ## delivery
    // deliSeasons: YarnSeason[] = [];

    styleLen = 12; // ## 8  change new = 12
    targetPlaceLen = 4;
    yearLen = 2;
    colorLen = 2;
    sexLen = 1;

    usageModeSeq: any[] = [
        {usageSeq: 10, usageMode: 'ct'},
        {usageSeq: 20, usageMode: 't'},
        {usageSeq: 30, usageMode: 'p'},
    ];

    private yarnDataAroudAppListener = new Subject<{ viewMode: string }>();



    // ## customer
    private customer: Customer = GBC.clrCustomer();
    private customers: Customer[] = [];

    // ## order
    maxLockJobQty = 1200;
    bundleQty = 12; // ## standard qty of bundle
    private order: Order = GBC.clrOrder();
    private orders: Order[] = [];
    orderSeasonYears: OrderSeasonYears[] = [];
    seasonYear = 'last';
    productBarcodeNoInput = '';
    private orderProductionInfo: OrderProductionInfo = {
        orderProduction: GBC.clrOrderProduction()
    };
    private opdLosts: OPDLost[] = [];
    private lostGroups: LostGroup[] = [];


    // ## node color
    nodeColor = [
        {nodeID: '1.COMPUTER-KNITTING', color: 'text-600'},
        {nodeID: '2.PANAL-INSPECTION', color: 'text-blue-200'},
        {nodeID: '3.LINKING', color: 'text-blue-600'},
        {nodeID: '4.MENDING', color: 'text-indigo-200'},
        {nodeID: '5.WASHING', color: 'text-indigo-600'},
        {nodeID: '6.PRESSING', color: 'text-purple-200'},
        {nodeID: '7.QC', color: 'text-purple-600'},
        {nodeID: 'completeNode', color: 'text-green-600'},
        {nodeID: 'outsource', color: 'text-yellow-500'}
    ];

    // ## node for show season for outsource
    outSourceSeasonShow = ['2024AW', '2025SS'];


    // ## node station
    nodeStations: NodeStation[] = [];

    // ## subNodeFlow
    subNodeflowC: SubNodeflowC[] = [];

    // ## user class authorization for functionality access
    private authorizeFunctionAccess = [
        {
            functionName: 'factorySetting',
            userClassID: ['spu', 'adm'],
        },
        {
            functionName: 'factoryDashboardTest',
            userClassID: ['spu', 'adm'],
        },
    ];


    private filenameListsUpdated = new Subject<{ fileListS: string[]}>();
    private langsListsUpdated = new Subject<{ langs: Language[]}>();

    staffListSelectUpdated = new Subject<{ staffList: StaffList}>();
    nodeStationSelectUpdated = new Subject<{ nodeStation: NodeStation}>();

    private factoriesUpdated = new Subject<{ factories: Factory[]}>();
    private membersCompanyListsUpdated = new Subject<{ membersCompany: User[]}>();
    private membersFactoryListsUpdated = new Subject<{ membersFactory: User[]}>();
    private inviteMemberListsUpdated = new Subject<{ success: boolean; message: any;}>();
    private joionedMemberListsUpdated = new Subject<{ success: boolean; message: any;}>();
    private editdMemberClassListsUpdated = new Subject<{ success: boolean; message: any; user: User;}>();
    private createUserCompanyFactoryUpdated = new Subject<{ success: boolean; message: any; user: User;}>();
    private checkUserIDExistedUpdated = new Subject<{ isExist: boolean}>();
    private user1CompanyListsUpdated = new Subject<{ user: User;}>();

    private userCompanyListsUpdated = new Subject<{ company: Company[]}>();
    private userFactoryListsUpdated = new Subject<{ factory: Factory[]}>();
    private selectFactoryDialogListsUpdated = new Subject<{ factory: Factory}>();
    private selectFactoryUpdated = new Subject<{ factory: Factory}>();
    private editFactoryUpdated = new Subject<{ factory: Factory}>();

    private orderCustomerSelectListsUpdated = new Subject<{ customer: Customer}>();
    private orderProductSelectListsUpdated = new Subject<{ product: Product}>();

    private userNodeLoginWaitUpdated = new Subject<{
        nodeStation: NodeStation, stationID: string, company: Company, factory: Factory, nodeStationLoginRequest: NodeStationLoginRequest
    }>();
    private editStaffPassUpdated = new Subject<{ success: boolean;}>();
    private staffCheckConfirmUpdated = new Subject<{ userID: string, mode: string, success: boolean;}>();
    private selectBundleLogUpdated = new Subject<{orderProduct: OrderProduction,}>();


    private qcSettoCompletedListener = new Subject<{ data: any }>();
    private qrCodeListsListener = new Subject<{ data: string }>();

    constructor(
        private http: HttpClient,
        private router: Router,
        private deviceService: DeviceDetectorService,

        // private loadingCtrl: LoadingController,

        private storageService: StorageService,
        // private socketService: SocketIOService,
        // private menuService: MenuService,
    ) { }




    // #######################################################################
    // ## general info ########################################################

    // *ngIf="user.uInfo.addr==='HengTest'"
    isAdmin(): boolean {
        const user = this.getUser();
        // console.log(user);
        if (user.uInfo.addr===this.adminADDR) {
            return true;
        }
        return false;
    }



    // router.get("/test/download/text", userController.downloadtext);
    async downloadText() {
        this.http
            .get
                (BACKEND_URL+'/test/download/text', {responseType: 'text'})
            .subscribe({
                next: (data) => {
                    // console.log(data);

                    const ddmmyy = this.returnDateDDMMYYYYHHMMSign(new Date(), '-');

                    // const file = new File([myBlob], filename)
                    // let res = "Text to save in a text file";
                    const blob = new Blob([data], { type: 'text/csv' });
                    const url = window.URL.createObjectURL(blob);

                    // create <a> element dynamically
                    let fileLink = document.createElement('a');
                    fileLink.href = url;

                    // suggest a name for the downloaded file
                    fileLink.download = 'logging ' + ddmmyy;

                    // simulate click
                    fileLink.click();

                    // window.open(url);

                }, error: error => {
                    // console.log(error.error);
                    // this.errorStatusListener.next(error.error.message);
                }});

    }

    // getfilenames
    // router.get("/test/download/getlist", userController.fileNameLists);
    async getfilenames() {
        this.http
            .get<{fileListS: string[]}>
                (BACKEND_URL+'/test/download/getlist')
            .subscribe({
                next: (data) => {
                    // console.log(data);

                    // getFilenameListsListener
                    this.filenameListsUpdated.next({
                        fileListS: data.fileListS
                    });

                }, error: error => {
                    // console.log(error.error);
                    // this.errorStatusListener.next(error.error.message);
                }});
    }

    // ## mode = 'rep-exclusive'
    async getGeneralInfo(mode: string, languageID: string, classLimit: number) {
        this.http
            .get<{generalInfo: GeneralInfo, colors: ColorS[], sizes: SizeS[], targetPlaces: TargetPlaceS[],
                    langs: Language[], langData: Language, userClass: UserClass[], controlApp: ControlApp,
                    ver: number, imgServer: string,
                    sysInfo: SysInfo[],
                    outSourceLocationDepartment: OutSourceLocationDepartment[],
                    outSourceSeasonShow: string[]
                    }>
                (BACKEND_URL+'/generalinfo/'+languageID+'/'+classLimit)
            .subscribe({
                next: (data) => {
                    // console.log(data);
                    this.appName = data.generalInfo.appName;
                    this.appVer = data.generalInfo.appVer;
                    this.appMail = data.generalInfo.appMail;



                    this.userClass = data.userClass;
                    // console.log('userClass', this.userClass);
                    this.userClassIDArr = [];
                    this.userClass.forEach( (item, index) => {
                        this.userClassIDArr.push(item.userClassID);
                    });

                    this.langs = data.langs;
                    this.langData = data.langData;
                    // console.log(this.langData, this.langs);

                    // ## get lang
                    const langInit = localStorage.getItem('langInit');
                    if (langInit) {
                        const langValue = JSON.parse(langInit).value;
                        // console.log('langValue == ' + langValue);
                        this.setLang(langValue);
                    }

                    // this.subNodeFlow = data.subNodeFlow;

                    this.targetPlaces = data.targetPlaces;
                    this.sizes = data.sizes;
                    this.colors = data.colors;
                    // console.log(this.targetPlaces,this.sizes,this.colors);

                    this.verCurrent = data.ver;
                    this.ver = data.ver;  // ## version 1 , 2  ,
                    this.imgServer = data.imgServer;
                    console.log('imgServer = ',this.imgServer);

                    this.controlApp = data.controlApp;
                    this.ioID = this.controlApp.clientControl.ioID;
                    this.outSourceLocationDepartment = data.outSourceLocationDepartment;
                    this.outSourceSeasonShow = data.outSourceSeasonShow;
                    // console.log('this.outSourceLocationDepartment', this.outSourceLocationDepartment);
                    // console.log(this.ver);

                    this.sysInfo = data.sysInfo;

                    // ## yarn

                    // console.log(data.updateQrCodeRealOrderProduction);
                    if (mode === 'rep-exclusive' || mode === 'staff-qrcode') {
                        // ## get company
                        this.getUserCompany(mode,this.userID, 1, 100);
                    }

                    // getLangsListUpdatedListener()
                    this.langsListsUpdated.next({ langs: this.langs });
                }, error: error => {
                    // console.log(error.error);
                    // this.errorStatusListener.next(error.error.message);
                }});
    }

    // router.get("/generalinfo1/langdata/:languageID", userController.getLangData);
    async getLangData(languageID: string) {
        // console.log(this.lastLangSelected, languageID);
        if (this.lastLangSelected !== languageID) {
            this.lastLangSelected = languageID;
            this.http
                .get<{langData: Language}>
                    (BACKEND_URL+'/generalinfo1/langdata/'+languageID)
                .subscribe({
                    next: (data) => {
                        // console.log(data);
                        this.langData = data.langData;
                        // console.log(this.langData);

                        // getLangsListUpdatedListener()
                        this.langsListsUpdated.next({ langs: this.langs });  // ## for refresh lang
                    }, error: error => {
                        // console.log(error.error);
                        // this.errorStatusListener.next(error.error.message);
                    }});
        }
    }

    // // ## get  gn  factories by  companyID   / gn=general
    // router.get("/get/gn/factories/by/:companyID", userController.getGNFactoriesByCompanyID);
    async getGNFactoriesByCompanyID(companyID: string) {
        this.http
            .get<{factories: Factory[]; }>
                (BACKEND_URL+'/get/gn/factories/by/'+companyID)
            .subscribe({
                next: (data) => {
                    // console.log(data);
                    this.factories = data.factories;
                    // this.subNodeFlow = data.subNodeFlow;

                    // getFactoriesUpdatedUpdatedListener()
                    this.factoriesUpdated.next({ factories: data.factories });
                    this.userFactoryListsUpdated.next({ factory: data.factories });
                }, error: error => {
                    // console.log(error.error);
                    // this.errorStatusListener.next(error.error.message);
                }});

    }

    groupBy(xs: any[], f: any) {
        return xs.reduce((r, v, i, a, k = f(v)) => ((r[k] || (r[k] = [])).push(v), r), {});
    }

    // ## gn = general  ,  mn = menu  ,
    // ## translateCode
    translateCode(lType: string, lID: string) {
        let languageDataText = '';
        // console.log(this.langData.languageData);
        try {
            languageDataText = this.langData.languageData.filter(i=>(i.lType == lType && i.lID == lID))[0].lText;
            // console.log(languageDataText);
            // if (languageDataText.substr(0, 1) === '[') { // ## chaeck data is array?
            //     // const factoryIDArr = JSON.parse(req.params.factoryIDArr);
            //     console.log(languageDataText);
            //     languageDataText = JSON.parse(languageDataText);
            //     console.log(languageDataText);
            // }
            return languageDataText;
        } catch (err) {
            return '';
        }
    }

    getClassColorSetName(setName: string): string {
        if (setName === 'gl') {
            return 'text-base text-blue-500';
        } else if (setName === 'muji') {
            return ' text-lg text-green-500';
        }
        return '';
    }

    getStyleFromQRCode(productID: string) {
        return productID.substr(0, 12);
    }

    genYarnColorID(colorS: ColorS, str: string): string {
        const colorS1 = colorS.setName+str+colorS.color.colorCode+str+colorS.color.colorID;
        return colorS1;
    }

    getColorByColorCode(colorCode: string) {
        colorCode = this.strReplaceAll(colorCode, '-', '');
        if (colorCode==='') {return 'transparent'}
        const idx = this.colors.findIndex( fi =>(fi.color.colorID === colorCode));
        return this.colors[idx].color.colorValue;
    }



    getOrderImage(orderIDs: string[]): OrderImage[] {
        let orderIMages: OrderImage[] = [];
        orderIDs.forEach( (orderID, index) => {
            // const pd1 = this.products.filter(i=>(i.productID.trim() == item));
            const pd1 = this.productImageProfiles.filter(i=>(i.productID.trim() == orderID));
            if (pd1.length > 0) {
                orderIMages.push({orderID: orderID, imageProfile: pd1[0].imageProfile});
            } else {
                orderIMages.push({orderID: orderID, imageProfile: GBC.nulltGCSPath});
            }
        });
        return orderIMages;
    }

    // productImageProfiles
    getOrderImage1(orderID: string): string {
        // console.log(this.products);
        let imageProfile = 'wait.png';
        const pd1 = this.productImageProfiles.filter(i=>(i.productID.trim() == orderID));
        if (pd1.length > 0) {
            // console.log(pd1[0].imageProfile);
            return pd1[0].imageProfile;
        } else {
            return imageProfile;
        }
    }

    getSetNameColorByOrderID(orderID: string): string {
        // console.log('orderID ====' , orderID);
        // const orderIDArr = JSON.stringify(Array.from(new Set(this.getOrders().map((item: any) => item.orderID))));
        // console.log(orderIDArr);
        // console.log(orderID, this.orders);
        // console.log(this.nss.orders);
        const orderF = this.orders.filter(fi => fi.orderID === orderID.trim());
        // console.log(orderF);
        // console.log(orderF[0].orderColor[0].setName);
        if (orderF.length > 0) {
            if (orderF[0].orderColor.length > 0) {
                return orderF[0].orderColor[0].setName;
            }
        }
        return 'x';
    }

    getColorNameByColorID1(colorID: string) {
        // console.log(colorCode, setName);
        // console.log(colorCode, setName, this.colors);
        colorID = this.strReplaceAll(colorID, '-', '');
        if (colorID==='') {return ''}
        const idx = this.colors.findIndex( fi =>(fi.color.colorID === colorID));
        // console.log(idx);
        return this.colors[idx].color.colorName;
    }

    getColorNameByColorCode(colorCode: string, setName: string) {
        try {
            // console.log(colorCode, setName);
            // console.log(colorCode, ',,', setName, ',,', this.colors);
            colorCode = this.strReplaceAll(colorCode, '-', '');
            if (colorCode==='') {return ''}
            const idx = this.colors.findIndex( fi =>(fi.color.colorID === colorCode && fi.setName === setName.trim()));
            // console.log(this.colors, idx);
            // return idx >= 0 ?this.colors[idx].color.colorName:'';
            return this.colors[idx].color.colorName;
        } catch (err) {
            return '';
        }
    }

    getColorValueByColorCode(colorCode: string, setName: string) {
        try {
            // console.log(colorCode, setName);
            // console.log(colorCode, ',,', setName, ',,', this.colors);
            colorCode = this.strReplaceAll(colorCode, '-', '');
            if (colorCode==='') {return ''}
            const idx = this.colors.findIndex( fi =>(fi.color.colorID === colorCode && fi.setName === setName.trim()));
            // console.log(this.colors, idx);
            // return idx >= 0 ?this.colors[idx].color.colorName:'';
            return this.colors[idx].color.colorValue;
        } catch (err) {
            return '';
        }
    }

    getColorCodeByColorIDSetName(colorID: string, setName: string) {
        try {
            colorID = this.strReplaceAll(colorID, '-', '');
            if (colorID==='') {return ''}
            const idx = this.colors.findIndex( fi =>(fi.color.colorID === colorID && fi.setName === setName.trim()));
            return this.colors[idx].color.colorCode;
        } catch (err) {
            return '';
        }
    }

    getCodeColorNameByColorCode(colorCode: string, setName: string) {
        try {
            colorCode = this.strReplaceAll(colorCode, '-', '');
            if (setName.trim() === '') { setName = 'muji';}
            if (colorCode==='') {return ''}
            const idx = this.colors.findIndex( fi =>(fi.color.colorID === colorCode && fi.setName === setName.trim()));
            // return idx >= 0 ?this.colors[idx].color.colorCode:'';
            return this.colors[idx].color.colorCode;
        } catch (err) {
            return '';
        }
    }

    getColorSeq(colorID: string) {
        colorID = this.strReplaceAll(colorID, '-', '');
        const idx = this.colors.findIndex( fi =>(fi.color.colorID === colorID));
        return this.colors[idx].seq;
    }

    genColorS1(companyID: string, yarnColorID: string, colorS: ColorS[]) {
        let colorS1: ColorS = GBC.clrOrderColor();
        colorS1.companyID = companyID;
        colorS1.setName = colorS.length > 0 ? colorS[0].setName:'';
        const c1 = yarnColorID.split(";");
        const colorCode = c1[1];
        const colorID = c1[2];
        const cf = colorS.filter(i=>i.color.colorCode === colorCode && i.color.colorID === colorID);
        colorS1.color = cf[0].color;
        return colorS1;
    }

    getSizeSeq(sizeID: string) {
        const sizeSeq = this.sizes.filter(i=>(i.size.sizeID === sizeID));
        if (sizeSeq.length > 0) {
            return sizeSeq[0].seq;
        }
        return -1;  // ## not found = error
    }

    getSizeName(sizeID: string) {
        const sizeSeq = this.sizes.filter(i=>(i.size.sizeID === sizeID));
        if (sizeSeq.length > 0) {
            return sizeSeq[0].size.sizeName;
        }
        return -1;  // ## not found = error
    }

    getSizeStr(orderID: string) {
        const order1 = this.getOrderByID(orderID);
        // console.log(orderID, order1);
        const productORInfo = order1.productOR.productORInfo;
        // console.log(productORInfo);
        let sizeObj1: any[] = []; //  { seq: 0, sizeID: '', sizeName: ''}
        productORInfo.forEach( (item, index) => {
            const size1 = {
                seq: this.getSizeSeq(item.productSize),
                sizeID: item.productSize,
                sizeName: this.getSizeName(item.productSize),
            };
            const sizeObj1F = sizeObj1.filter(i=>(i.sizeID === size1.sizeID));
            if (sizeObj1F.length === 0) {
                sizeObj1.push(size1);
            }
        });
        sizeObj1.sort((a,b)=>{ return a.seq >b.seq?1:a.seq <b.seq?-1:0 });

        // console.log(sizeObj1);
        let sizeStr = '-';
        if (sizeObj1.length === 1) {
            sizeStr = sizeObj1[0].sizeName;
        } else if (sizeObj1.length > 1) {
            sizeStr = sizeObj1[0].sizeName
                    + '-'
                    + sizeObj1[sizeObj1.length-1].sizeName
        }
        return sizeStr;
    }

    getColorSeq1(colors: ColorS[], colorID: string) {
        // console.log(colors, colorID);
        if (colors.length === 0) { return -1; }
        // const idx = this.colors.findIndex( fi =>(fi.color.colorID === colorID));
        const idx = colors.findIndex( fi =>(fi.color.colorID === colorID));
        // console.log(idx);
        return colors[idx].seq?colors[idx].seq:-1;
    }

    getColorSeqByOrderID(orderID: string, color: string) {
        // const colors: ColorS[] = [];
        // console.log(orderID, color);
        color = this.strReplaceAll(color, '-', '');
        const colors = this.orders.filter(i=>(i.orderID === orderID))[0].orderColor;
        // console.log(colors);
        const idx = colors.findIndex( fi =>(fi.color.colorID === color));
        // console.log(idx);
        return colors[idx].seq;
    }


    getTargetPlaceSeq(targetPlaceID: string, countryID: string) {
        const targetPlace = this.targetPlaces.filter(i=>(i.targetPlace.targetPlaceID === targetPlaceID
                                                    && i.targetPlace.countryID === countryID));
        if (targetPlace.length > 0) {
            return targetPlace[0].seq;
        }
        return -1;  // ## not found = error
    }

    getTargetPlaceSeq1(targetPlaceID: string) {
        const targetPlace = this.targetPlaces.filter(i=>(i.targetPlace.targetPlaceID === targetPlaceID));
        if (targetPlace.length > 0) {
            return targetPlace[0].seq;
        }
        return -1;  // ## not found = error
    }

    getTargetPlaceName(targetPlaceID: string) {
        const targetPlace = this.targetPlaces.filter(i=>(i.targetPlace.targetPlaceID === targetPlaceID));
        if (targetPlace.length > 0) {
            return targetPlace[0].targetPlace.targetPlaceName;
        }
        return '';  // ## not found = error
    }

    genTargetPlace(orderTargetPlaceS: OrderTargetPlaceS[]) {
        let targetPlaces: TargetPlaceS[] = [];
        orderTargetPlaceS.forEach( (item, index) => {
            const targetPlace1 = targetPlaces.filter(i=>(i.targetPlace.targetPlaceID === item.targetPlace.targetPlaceID));
            if (targetPlace1.length === 0) {
                targetPlaces.push({
                    seq: 0,
                    targetPlace : {
                        targetPlaceID: item.targetPlace.targetPlaceID,
                        targetPlaceName: '',
                        countryID: '',
                        countryName: '',
                    }
                });
            }
        });
        targetPlaces.forEach( (item, index) => {
            item.seq = this.getTargetPlaceSeq1(item.targetPlace.targetPlaceID);
        });
        targetPlaces.sort((a,b)=>{ return a.seq >b.seq?1:a.seq <b.seq?-1:0 });
        return targetPlaces;
    }

    getOrderTargetPlaceSeq(orderTargetPlace: OrderTargetPlaceS[], targetPlaceID: string, countryID: string) {
        if (orderTargetPlace.length === 0) { return -1; }
        // const idx = this.colors.findIndex( fi =>(fi.color.colorID === colorID));
        const idx = orderTargetPlace.findIndex( fi =>(fi.targetPlace.targetPlaceID === targetPlaceID && fi.targetPlace.countryID === countryID));
        return orderTargetPlace[idx].seq;
    }

    getOrderIDs(orders: Order[]): string[] {
        let orderIDs: string[] = [];
        orders.forEach( (item, index) => {
            orderIDs.push(item.orderID);
        });
        return orderIDs;
    }

    getOrderIDss(): string[] {
        let orderIDs: string[] = [];
        this.orders.forEach( (item, index) => {
            orderIDs.push(item.orderID);
        });
        return orderIDs;
    }

    getOrderByID(orderID: string) {
        const order1 = this.orders.filter(i=>(i.orderID === orderID));
        if (order1.length > 0) {
            return order1[0];
        }
        return GBC.clrOrder();
    }

    getGroupScanID2(userID: string) { // ## TL TN SD BD
        let groupScanID2 = '';
        this.userGroupScan.forEach( (item, index) => {
            const filter1 = item.userIDGroup.filter(i=> i === userID);
            if (filter1.length > 0) {
                groupScanID2 = item.groupScanID2;
            }
        });
        return groupScanID2;
    }

    getGroupScanIDByFactoryID(factoryID: string): UserGroupScan|undefined {
        const groupScanID2 = this.userGroupScan.filter(i=> i.factoryID === factoryID);
        if (groupScanID2.length > 0) {
            return groupScanID2[0];
        }
        return undefined;
    }

    getScanID2_GroupScanIDByFactoryID(factoryID: string) {
        const groupScanID2 = this.userGroupScan.filter(i=> i.factoryID === factoryID);
        if (groupScanID2.length > 0) {
            return groupScanID2[0].groupScanID2;
        }
        return '';
    }

    getOrderColor(orderID: string) {
        let orderColor: ColorS[] = [];
        const order1 = this.orders.filter(i=>(i.orderID === orderID));
        if (order1.length > 0) {
            return order1[0].orderColor;
        }
        return orderColor;
    }

    // setSizeLen(size: string, len: number) {
    //     return SizeS;
    // }



    genProductBarcode(style: string, targetPlaceID: string, countryID: string,
                    year: string,color: string, size: string, sex: string) {
        let productBarcode = '';
        const targetPlaceIDS = this.setAddBackStrLen(targetPlaceID, 4, '-')
        countryID = '-----';
        productBarcode = style+targetPlaceIDS+countryID+year
        if (color.length === 2) {
            productBarcode = productBarcode+color+'--------';
        } else if (color.length === 4) {
            productBarcode = productBarcode+color+'------';
        } else if (color.length === 6) {
            productBarcode = productBarcode+color+'----';
        } else if (color.length === 8) {
            productBarcode = productBarcode+color+'--';
        } else if (color.length === 10) {
            productBarcode = productBarcode+color;
        } else {
            productBarcode = productBarcode+'----------';
        }
        productBarcode = productBarcode+this.setAddBackStrLen(size, 3, '-');
        productBarcode = productBarcode+sex;
        return productBarcode;
    }

    // getTargetZone(targetPlace: TargetPlace) {
    //     let zone: TargetPlace[] = [];

    //     return zone;
    // }

    //     // ## sizeS
    // export class SizeS {
    //     constructor(
    //         public seq: number,
    //         public size: Size
    //     ) {}
    // }

    // // ## size
    // export class Size {
    //     constructor(
    //         public sizeID: string,
    //         public sizeName: string
    //     ) {}
    // }

    changeColorTextToColorTextComma(color: string): string {
        if (color.length === 2) {
            return color;
        } else if (color.length === 4) {
            return color.substr(0, 2) + ',' + color.substr(2, 2);
        } else if (color.length === 6) {
            return color.substr(0, 2) + ',' + color.substr(2, 2) + ',' + color.substr(4, 2);
        } else if (color.length === 8) {
            return color.substr(0, 2) + ',' + color.substr(2, 2) + ',' + color.substr(4, 2) + ',' + color.substr(6, 2);
        } else if (color.length === 10) {
            return color.substr(0, 2) + ',' + color.substr(2, 2) + ',' + color.substr(4, 2) + ',' + color.substr(6, 2)
                    + ',' + color.substr(8, 2);
        } else if (color.length === 12) {
            return color.substr(0, 2) + ',' + color.substr(2, 2) + ',' + color.substr(4, 2) + ',' + color.substr(6, 2)
                    + ',' + color.substr(8, 2) + ',' + color.substr(10, 2);
        } else if (color.length === 14) {
            return color.substr(0, 2) + ',' + color.substr(2, 2) + ',' + color.substr(4, 2) + ',' + color.substr(6, 2)
                    + ',' + color.substr(8, 2) + ',' + color.substr(10, 2) + ',' + color.substr(12, 2);
        } else { return ''}
    }

    // setAddBackStrLen(str: string, len: number, strAdd: string) {
    //     while ((str+'').length < len ){str = str+strAdd;}
    //     return str+'';
    // }

    changeColorArrToColorDash(colorArr: string[]) {
        let colorDash = '';
        if (colorArr.length > 0) {
            colorArr.forEach( (item, index) => {
                colorDash = colorDash + item;
            });
            colorDash = this.setAddBackStrLen(colorDash, 10, '-');
            return colorDash;
        }
        return colorDash;
    }

    getInfoFromorder(order: Order, mode: string) {
        let str = '';
        if (order.productOR.productORInfo.length > 0) {
            if (mode === 'style') {
                return order.productOR.productID;
            }else if (mode === 'targetPlaceID') {
                return order.productOR.productORInfo[0].targetPlace.targetPlaceID;
            }else if (mode === 'countryID') {
                return order.productOR.productORInfo[0].targetPlace.countryID;
            }else if (mode === 'year') {
                return order.productOR.productORInfo[0].productYear;
            }else if (mode === 'color') {
                return order.productOR.productORInfo[0].productColor;
            }else if (mode === 'size') {
                return order.productOR.productORInfo[0].productColor;
            }else if (mode === 'sex') {
                return order.productOR.productORInfo[0].productSex;
            }
        }
        return str;
    }

    getInfoDataFromProductBarcode(productBarcode: string) {
        const info: any = {
            orderID: productBarcode.substr(0, 12).trim(),
            targetPlaceID: this.strReplaceAll(productBarcode.substr(12, 4), '-', ''),
            color: this.strReplaceAll(productBarcode.substr(23, 10), '-', ''),
            size: this.strReplaceAll(productBarcode.substr(33, 3), '-', ''),
        };
        return info;
    }

    getInfoFromProductBarcode(productBarcode: string, mode: string) {
        let str = '';
        // if (str.length == 37) {  // ## barcode excluce running number
        //     strFormatted = str.substr(0, 12)
        //                         + ' ' + str.substr(12, 4)
        //                         + ' ' + str.substr(16, 5)
        //                         + ' ' + str.substr(21, 2)
        //                         + ' ' + str.substr(23, 2) + ' ' + str.substr(25, 2) + ' ' + str.substr(27, 2)
        //                         + ' ' + str.substr(29, 2) + ' ' + str.substr(31, 2)
        //                         + ' ' + str.substr(33, 3) + ' ' + str.substr(36, 1);
        if (mode === 'style') {
            return productBarcode.substr(0, 12);
        }else if (mode === 'targetPlaceID') {
            return productBarcode.substr(12, 4);
        }else if (mode === 'countryID') {
            return productBarcode.substr(16, 5);
        }else if (mode === 'year') {
            return productBarcode.substr(21, 2);
        }else if (mode === 'color') {
            return productBarcode.substr(23, 10);
        }else if (mode === 'size') {
            return productBarcode.substr(33, 3);
        }else if (mode === 'sex') {
            return productBarcode.substr(36, 1);
        }
        return str;
    }

    // stylePos=0
    // styleDigit=12
    // targetIDPos=12
    // targetIDDigit=4
    // countryIDPos=16
    // countryIDDigit=5
    // yearPos=21
    // yearDigit=2
    // colorPos=23
    // colorDigit=10
    // sizePos=33
    // sizeDigit=3
    // sexPos=36
    // sexDigit=1
    // runningNoPos=37;
    // runningNoDigit=5;
    // strFormatted = str.substr(0, 12)
    //                         + ' ' + str.substr(12, 4)
    //                         + ' ' + str.substr(16, 5)
    //                         + ' ' + str.substr(21, 2)
    //                         + ' ' + str.substr(23, 2) + ' ' + str.substr(25, 2) + ' ' + str.substr(27, 2)
    //                         + ' ' + str.substr(29, 2) + ' ' + str.substr(31, 2)
    //                         + ' ' + str.substr(33, 3) + ' ' + str.substr(36, 1) + ' ' + str.substr(37, 5);
    async getDataFromBarcode(barcode: string) {
        // AA0PKA3A    UK-------23RW--------L--F00001
        let data: any = {
            style: '',
            zone: '',
            country: '',
            year: '',
            color1: '',
            color2: '',
            color3: '',
            color4: '',
            color5: '',
            size: '',
            // no: ''
        };
        data.style = barcode.substr(this.stylePos, this.styleDigit);
        data.zone = this.strReplaceAll(barcode.substr(this.targetIDPos, this.targetIDDigit), '-', '');
        data.country = this.strReplaceAll(barcode.substr(this.countryIDPos, this.countryIDDigit), '-', '');
        data.year = barcode.substr(this.yearPos, this.yearDigit);
        data.color1 = barcode.substr(this.colorPos, 2);
        data.color2 = barcode.substr(this.colorPos+2, 2);
        data.color3 = barcode.substr(this.colorPos+4, 2);
        data.color4 = barcode.substr(this.colorPos+6, 2);
        data.color5 = barcode.substr(this.colorPos+8, 2);
        data.size = this.strReplaceAll(barcode.substr(this.sizePos, this.sizeDigit), '-', '');
        // data.no = +barcode.substr(this.runningNoPos, this.runningNoDigit);
        return data;
        // this.strReplaceAll(barcodeNo.substr(this.countryIDPos, this.countryIDDigit), '-', '');
    }

    getDataFromBarcodeNo(barcodeNo: string) {
        // AA0PKA3A    UK-------23RW--------L--F00001
        let data: any = {
            style: '',
            zone: '',
            country: '',
            year: '',
            color1: '',
            color2: '',
            color3: '',
            color4: '',
            color5: '',
            size: '',
            no: ''
        };
        data.style = barcodeNo.substr(this.stylePos, this.styleDigit);
        data.zone = this.strReplaceAll(barcodeNo.substr(this.targetIDPos, this.targetIDDigit), '-', '');
        data.country = this.strReplaceAll(barcodeNo.substr(this.countryIDPos, this.countryIDDigit), '-', '');
        data.year = barcodeNo.substr(this.yearPos, this.yearDigit);
        data.color1 = barcodeNo.substr(this.colorPos, 2);
        data.color2 = barcodeNo.substr(this.colorPos+2, 2);
        data.color3 = barcodeNo.substr(this.colorPos+4, 2);
        data.color4 = barcodeNo.substr(this.colorPos+6, 2);
        data.color5 = barcodeNo.substr(this.colorPos+8, 2);
        data.size = this.strReplaceAll(barcodeNo.substr(this.sizePos, this.sizeDigit), '-', '');
        data.no = +barcodeNo.substr(this.runningNoPos, this.runningNoDigit);
        return data;
        // this.strReplaceAll(barcodeNo.substr(this.countryIDPos, this.countryIDDigit), '-', '');
    }

    getMainZoneTargetPlace(targetPlaces: TargetPlaceS[]) {
        let mainZone: MainZone[] = [];
        targetPlaces.sort((a,b)=>{
            return a.seq >b.seq?1:a.seq <b.seq?-1:0
        });
        targetPlaces.forEach( (item, index) => {
            const targetPlace = mainZone.filter(i=>(i.targetPlaceID === item.targetPlace.targetPlaceID));
            if (targetPlace.length === 0) {
                mainZone.push({
                    targetPlaceID: item.targetPlace.targetPlaceID,
                    targetPlaceName: item.targetPlace.targetPlaceName
                });
            }
        });
        this.mainZone = mainZone;
        return mainZone;
    }

    getMainZoneTxtArr(mainZone: MainZone[]): string[] {
        let mainZoneTextArr: string[] = [];
        mainZone.forEach( (item, index) => {
            mainZoneTextArr.push(item.targetPlaceID);
        });
        return mainZoneTextArr;
    }


    getLimitUserClass(userClassID: string) {
        const idx = this.userClass.findIndex( fi =>(fi.userClassID === userClassID));
        return this.userClass[idx].seq;
    }

    getLimitUserClasses(companyID: string) {
        // console.log(companyID);
        // console.log(this.user.uCompany);
        if (companyID !== '') {
            const userClassID = this.user.uCompany.filter(i=>(i.companyID === companyID))[0].userComClass.userClassID;
            const classLimit = this.getLimitUserClass(userClassID);
            const userClasses = this.userClass.filter(i=>(i.seq <= +classLimit));
            // console.log(userClasses);
            return userClasses;
        } else {
            return [];
        }
    }

    getSubNodeFlowName(nodeID: string, subNodeID: string, subNodeflowC: SubNodeflowC[]) {
        const subNodeFlow1 = subNodeflowC.filter(i=>(i.nodeID === nodeID && i.subNodeID === subNodeID));
        if (subNodeFlow1.length > 0) {
            return subNodeFlow1[0].subNodeName;
        }
        return '';
    }

    getUsageModeSeq(usageMode: string): number {
        const idx = this.usageModeSeq.findIndex(i=>i.usageMode == usageMode);
        return this.usageModeSeq[idx].usageSeq;
    }

    getCreateBy() {
        // public userID: string, public userName: string
        const createBy = {
            userID: this.user.userID,
            userName: this.user.uInfo.userName
        };
        return createBy;
    }

    clrUserDataAllCompany() {
        this.membersCompany = [];
        this.user1Company = GBC.clrUser();

        this.customer = GBC.clrCustomer();
        this.customers = [];
    }

    async get1UserInfo(userID: string) {
        // user1Company
        let user: User = GBC.clrUser();
        const userMember = await this.membersCompany.filter(i=>(i.userID === userID));
        if (userID === this.user.userID) {
            return this.user;
        } else if (userID === this.user1Company.userID) {
            return this.user1Company;
        } else if (userMember.length > 0) {
            return userMember[0];
        } else {
            return user;
        }
    }

    getFactoryIDArr(factories: Factory[]) {
        let factoryIDs: string[] = [];
        factories.forEach( (item, index) => {
            factoryIDs.push(item.factoryID);
        });
        return factoryIDs;
    }

    getFactoryByFactoryID(factoryID: string) {
        const factory = this.factories.filter(i=>(i.factoryID === factoryID));
        if (factory.length > 0) {
            return factory[0];
        }
        return GBC.clrFactory();
    }

    getFactoryIDArrByFactoryID(factories: Factory[], factoryID: string) {
        const factory = factories.filter(i=>(i.factoryID === factoryID));
        if (factory.length > 0) {
            return factory[0];
        }
        return GBC.clrFactory();
    }

    getFactoryNameByFactoryID(factoryID: string) {
        // console.log(this.factories);
        const factory = this.factories.filter(i=>(i.factoryID === factoryID));
        if (factory.length > 0) {
            return factory[0].fInfo.factoryName;
        }
        return '';
    }

    getFactoryName2ByFactoryID(factoryID: string) {
        // console.log(this.factories);
        const factory = this.factories.filter(i=>(i.factoryID === factoryID));
        if (factory.length > 0) {
            return factory[0].fInfo.factoryName2;
        }
        return '';
    }


    // ## general info ########################################################
    // #######################################################################

    // #######################################################################
    // ## user auth ########################################################

    // u=user , s=staff/worker , us=userstaff
    getUserType(type: string) {
        if (type === 'u') {
            return 'user';
        } else if (type === 's') {
            return 'staff/worker';
        } else if (type === 'us') {
            return 'user staff';
        }
        return '';
    }

    getUserClass(companyID: string) {
        let userClassID = '';
        const uCompany = this.user.uCompany;
        const uCompanyF = uCompany.filter(i=>i.companyID == companyID);
        if (uCompanyF.length > 0) {
            userClassID = uCompanyF[0].userComClass.userClassID;
        }
        return userClassID;
    }

    // getCompanyByCompanyID(companies: Company[], companyID: string) {
    //     const idx = companies.findIndex( fi =>(fi.companyID === companyID));
    //     return companies[idx];
    // }

    // getUserCompany1(companyID: string) {
    //     const company = this.companies.filter(i=>i.companyID == companyID);
    //     if (company[0]) { this.company = company[0]; }
    //     return company[0]?company[0]:this.clrCompany();
    // }

    get userIsAuthenticated() {
        return this.isAuthenticated;
    }

    async getTokenSet(userID: string) {
        await this.clrTokenSet();
        await this.getInfo();
        this.tokenSet.userID = userID;
        return this.tokenSet;
    }

    getToken() {
        return this.token;
    }

    getIsAuth() {
        return this.isAuthenticated;
    }

    getIsNodeAuthText() {
        return this.isNodeAuthenticated?'true':'false';
    }

    getIsNodeAuth() {
        return this.isNodeAuthenticated;
    }

    setIsNodeAuth(value: boolean) {
        this.isNodeAuthenticated = value;
    }

    getUserIDEncrypt() {
        return this.userIDEncrypt;
    }

    getUUID5IDEncrypt() {
        return this.uuid5IDEncrypt;
    }

    getUserID() {
        // console.log('getUserID');
        return this.userID;
    }



    getUser() {
        return this.user;
    }

    getCompanies() {
        return this.companies;
    }

    getCompany() {
        return this.company;
    }

    setCompany(company: Company) {
        this.company = company;
        this.setDataAroundAppStatusListenerToNext();  // ## emit data around app
    }

    getFactories() {
        return this.factories;
    }

    getFactory() {
        return this.factory;
    }

    setFactory(factory: Factory) {
        this.factory = factory;
        this.setDataAroundAppStatusListenerToNext();  // ## emit data around app
    }

    selectFactory(factory: Factory) {

    }

    getUUID() {
        return this.uuid5;
    }

    getSignupStatusListener() {
        return this.signupStatusListener.asObservable();
    }

    // ## signupStatus   true = ok  ,  false = error
    sendSignupStatusListener(signupStatus: boolean) {
        this.signupStatusListener.next(signupStatus);
    }

    setFormActive(formName: string) {
        // console.log(formName);
        this.formActive = formName;
        this.setDataAroundAppStatusListenerToNext();
    }

    // ## mode = normal , rep-exclusive
    getAuthMenu(mode: string, menuName: string) {
        mode = mode===''?'normal':mode;
        // spu, adm, own, pnr, mng, acc, stf, gst
        const userClassID: string = this.getUserClass(this.company.companyID);
        const userClassIDAll: string[] = ['spu', 'adm', 'own', 'pnr', 'mng', 'hdp', 'acc', 'hws', 'wsc', 'stf', 'gst'];
        const userClassIDArr1: string[] = [];

        // ## normal mode
        if (mode === 'normal') {
            if (menuName === 'company-sideBar') {
                let auth1 = true;
                auth1 = this.companyState === ''?true:false;
                return auth1;
            } else if (menuName === 'factory-sideBar') { // ## factory-sideBar
                let auth1 = true;
                auth1 = this.companyState === ''?true:false;
                return auth1;
            } else if (menuName === 'report-sideBar') {  // ## pass-sideBar
                return false;
            } else if (menuName === 'password-sideBar') {  // ## pass-sideBar
                return false;


            } else if (menuName === 'order-qrcode') { // ## order-qrcode
                return false;




            } else if (menuName === 'bell-topBar') { // ## bell-topBar
                let auth1 = true;
                auth1 = this.companyState === ''?true:false;
                return auth1;

            } else if (menuName === 'profile-topBar') { // ## profile-topBar
                let auth1 = true;
                auth1 = this.companyState === ''?true:false;
                return auth1;
            } else if (menuName === 'layout-topbar-logo') { // ## layout-topbar-logo
                let auth1 = true;
                auth1 = this.companyState === ''?true:false;
                return auth1;
            }


        // ## reprot exclusive mode
        } else if (mode === 'rep-exclusive') {
            // console.log('rep-exclusive mode' , menuName, userClassID);

            if (menuName === 'report-sideBar') { // ## report-sideBar
                return true;
            } else if (menuName === 'password-sideBar') {  // ## pass-sideBar
                return true;

            } else if (menuName === 'order-qrcode') { // ## order-qrcode
                return false;


            // ## company dashboard ###################
            } else if (menuName === 'overview') {
                const userClassIDArr: string[] = ['spu', 'adm', 'own', 'pnr', 'mng'];
                return userClassIDArr.includes(userClassID);
            } else if (menuName === 'scan-overview') {
                const userClassIDArr: string[] = ['spu', 'adm', 'own', 'pnr', 'mng'];
                return userClassIDArr.includes(userClassID);
            } else if (menuName === 'overall') {
                const userClassIDArr: string[] = ['spu', 'adm', 'own', 'pnr', 'mng'];
                return userClassIDArr.includes(userClassID);
            } else if (menuName === 'order') { // ##
                const userClassIDArr: string[] = ['spu', 'adm', 'own', 'pnr', 'mng'];
                return userClassIDArr.includes(userClassID);
            } else if (menuName === 'production') { // ##
                const userClassIDArr: string[] = ['spu', 'adm', 'own', 'pnr', 'mng'];
                return userClassIDArr.includes(userClassID);
            } else if (menuName === 'factory') { // ##
                const userClassIDArr: string[] = ['spu', 'adm'];
                // console.log('rep-exclusive = factory = ' , userClassIDArr.includes(userClassID));
                return userClassIDArr.includes(userClassID);
            } else if (menuName === 'factory-production') { // ##
                const userClassIDArr: string[] = ['spu', 'adm'];
                return userClassIDArr.includes(userClassID);
            } else if (menuName === 'factory-production-scan') { // ##
                const userClassIDArr: string[] = ['spu', 'adm', 'own', 'pnr', 'mng'];
                return userClassIDArr.includes(userClassID);
            } else if (menuName === 'Processing-Period') { // ##
                const userClassIDArr: string[] = ['spu', 'adm'];
                return userClassIDArr.includes(userClassID);
            } else if (menuName === 'work-in-process-by-period[style]') { // ##
                const userClassIDArr: string[] = ['spu', 'adm', 'own', 'pnr', 'mng'];
                return userClassIDArr.includes(userClassID);
            } else if (menuName === 'work-in-process-by-period[zone]') { // ##
                const userClassIDArr: string[] = ['spu', 'adm', 'own', 'pnr', 'mng'];
                return userClassIDArr.includes(userClassID);
            } else if (menuName === '%Processing-Period') { // ##
                const userClassIDArr: string[] = ['spu', 'adm', 'own', 'pnr', 'mng'];
                return userClassIDArr.includes(userClassID);
            } else if (menuName === '%work-in-process-by-period[style]') { // ##
                const userClassIDArr: string[] = ['spu', 'adm', 'own', 'pnr', 'mng'];
                return userClassIDArr.includes(userClassID);
            } else if (menuName === '%work-in-process-by-period[zone]') { // ##
                const userClassIDArr: string[] = ['spu', 'adm', 'own', 'pnr', 'mng'];
                return userClassIDArr.includes(userClassID);
            } else if (menuName === 'rep-fac-production-period') { // ##
                const userClassIDArr: string[] = ['spu', 'adm', 'own', 'pnr', 'mng'];
                return userClassIDArr.includes(userClassID);
            } else if (menuName === 'Outsource') { // ##
                const userClassIDArr: string[] = ['spu', 'adm'];
                return userClassIDArr.includes(userClassID);
            } else if (menuName === 'Outsource-overall') { // ##
                const userClassIDArr: string[] = ['spu', 'adm', 'own', 'pnr', 'mng'];
                return userClassIDArr.includes(userClassID);
            }


        // ## staff for print qr code
        } else if (mode === 'staff-qrcode') {

            if (menuName === 'report-sideBar') { // ## report-sideBar
                return false;
            } else if (menuName === 'order-qrcode') { // ## order-qrcode
                return true;
            } else if (menuName === 'password-sideBar') {  // ## pass-sideBar
                return true;


            } else if (menuName === 'order-create') {  // ## pass-sideBar
                return false;
            }

        // ## other mode
        } else if (mode === 'other') {

        }



        return true;
    }

    clrCommandAroundApp() {
        const commandAroundApp: CommandAroundApp = {
            showUserNodeRequestLogin: false,
            getNodeStationLoginRequest: false,
            openSystemInfo: false,
        };
        return commandAroundApp;
    }

    private getDataAroundApp(): DataAroundApp {
        const dataAroundApp: DataAroundApp = {
            iconConfigShow: this.iconConfigShow,
            isAuthenticated: this.isAuthenticated,
            ioID: this.ioID,
            user: this.user,
            userID: this.userID,
            langs: this.langs,  // ## list languages
            lang: this.lang,
            screenWidth: this.screenWidth,
            screenSize: this.screenSize,
            formActive: this.formActive,
            company: this.company,
            factory: this.factory,
            product: this.product,
            customer: this.customer,
            order: this.order,
            orderProductionInfo: this.orderProductionInfo,
            menuTestvisible: this.menuTestvisible,
            seasonYear: this.seasonYear,
            yarnSeason: this.yarnSeason,
            factorySelect: this.factorySelect,


        };
        return dataAroundApp;
    }



    setDataAroundAppStatusListenerToNext() {
        // console.log('setDataAroundAppStatusListenerToNext()');
        this.dataAroundAppStatusListener.next(this.getDataAroundApp());
        // this.commandAroundAppStatusListener.next(this.clrCommandAroundApp());
        // this.setCommandAroundAppStatusListenerToNext('getNodeStationLoginRequest');
        // this.setCommandAroundAppStatusListenerToNext('showUserNodeRequestLogin');
    }

    getDataAroundAppStatusListener() {
        return this.dataAroundAppStatusListener.asObservable();
    }

    setCommandAroundAppStatusListenerToNext(propName: CommandAroundAppName) {
        // console.log(propName);
        let commandAroundApp: CommandAroundApp = this.clrCommandAroundApp();
        commandAroundApp[propName] = true;
        // console.log(commandAroundApp);
        this.commandAroundAppStatusListener.next(commandAroundApp);
    }

    getCommandAroundAppStatusListener() {
        return this.commandAroundAppStatusListener.asObservable();
    }

    setYarnDataAroudAppListenerToNext(viewMode: string) {
        this.yarnDataAroudAppListener.next({
            viewMode: viewMode
        });
    }

    getYarnDataAroudAppStatusListener() {
        return this.yarnDataAroudAppListener.asObservable();
    }

    setQCSettoCompletedListenerToNext(data: any) {
        this.qcSettoCompletedListener.next({data});
    }

    getQCSettoCompletedListener() {
        return this.qcSettoCompletedListener.asObservable();
    }

    setQCListsListenerToNext(data: any) {
        this.qrCodeListsListener.next({data});
    }

    getQCListsListener() {
        return this.qrCodeListsListener.asObservable();
    }

    // // ## get user1 company
    // router.get("/getuser1/company/:userID", checkAuth, checkUUID, userController.getUser1Company);
    async getUser1Company(userID: string) {
        this.user1Company = GBC.clrUser();
        this.http
            .get<{status: string; user: User;}>
            (BACKEND_URL+'/getuser1/company/' + userID)
            .subscribe({
                next: (data) => {
                    // console.log(data);
                    this.user1Company = data.user;

                    // getUser1CompanyListsUpdatedUpdatedListener()
                    this.user1CompanyListsUpdated.next({ user: data.user });

                }, error: error => {
                    // console.log(error.error);
                    // this.signupStatusListener.next(false);
                    // this.errorStatusListener.next(error.error.message);
                }});
    }

    // router.get("/uinfo/userID", checkAuth , UserController.getuserInfo);
    async getuserInfo(userID: string, mode: string) { // ## mode = 'autoAuthUser'
        this.http
            .get<{status: string; user: User;  }>
            (BACKEND_URL+'/uinfo/' + userID)
            .subscribe({
                next: (data) => {
                    // console.log(data);
                    this.user = data.user;
                    if (mode === 'autoAuthUser') {
                        this.checkUserCompanyState();
                        // this.router.navigate(['/user/ucompany']);
                    }
                    // this.subNodeFlow = data.subNodeFlow;
                    this.dataAroundAppStatusListener.next(this.getDataAroundApp());
                    // this.setCommandAroundAppStatusListenerToNext('getNodeStationLoginRequest');
                    // this.signupStatusListener.next(true);
                }, error: error => {
                    // console.log(error.error);
                    // this.signupStatusListener.next(false);
                    // this.errorStatusListener.next(error.error.message);
                }});
    }

    // router.get("/check/existuserid/:companyID/:factory/:checkuserID", checkAuth, checkUUID, userController.getCheckExistCompanyFactoryUserID);
    async getCheckExistCompanyFactoryUserID(companyID: string, factory: string, userID: string) {
        this.http
            .get<{token: string; expiresIn: number; isExist: boolean}>
            (BACKEND_URL+'/check/existuserid/' + companyID+'/'+factory+'/'+userID)
            .subscribe({
                next: (data) => {
                    // console.log(data);

                    // getCheckUserIDExistedUpdatedListener()
                    this.checkUserIDExistedUpdated.next({ isExist: data.isExist });

                }, error: error => {
                    // console.log(error.error);
                    // this.signupStatusListener.next(false);
                    // this.errorStatusListener.next(error.error.message);
                }});
    }

    userSignup(userID: string, userPass: string) {
        const signupData: SigupData = {
            userID,
            userPass
        };
        // console.log(authData);
        this.http
            .post(BACKEND_URL+'/signup', signupData)
            .subscribe({
                next: (data) => {
                    // console.log(data);
                    this.signupStatusListener.next(true);
                }, error: error => {
                    // console.log(error.error);
                    this.signupStatusListener.next(false);
                    // this.errorStatusListener.next(error.error.message);
                }});
    }

    async userLogin(userID: string, userPass: string) {
        // this.logout();
        this.uuidUserNodeLoginWaiting = await this.getUUID5(userID+userPass);
        let authData: AuthData = {
            userID,
            userPass,
            tokenSet: await this.getTokenSet(userID),
            uuidUserNodeLoginWaiting: this.uuidUserNodeLoginWaiting
        };
        this.tokenSet.uuid5 = await this.getUUID5(userID);
        authData.tokenSet.uuid5 = this.uuid5;
        // console.log(authData);
        this.http
            .post<{ token: string; expiresIn: number; userID: string; user: User; mode: string; nodeStation: NodeStation;
                    stationID: string;
                    company: Company; factory: Factory; nodeStationLoginRequest: NodeStationLoginRequest;
                     }>(
                BACKEND_URL+'/login', authData)
            .subscribe({
                next: response => {
                    // console.log(response);
                    if (response.mode === 'user') {
                        this.uuidUserNodeLoginWaiting = '';
                        const token = response.token;
                        this.token = token;
                        // console.log(token);
                        if (token) {
                            const expiresInDuration = response.expiresIn;
                            this.setUsersTimer(expiresInDuration);
                            this.isAuthenticated = true;
                            this.user = response.user;
                            this.userID = response.userID;
                            // this.subNodeFlow = response.subNodeFlow;
                            this.userIDEncrypt = this.getStrEncrypt(this.userID);
                            this.dataAroundAppStatusListener.next(this.getDataAroundApp());
                            this.genToken(token, expiresInDuration);

                            // ## check here for goto report exclusive
                            this.checkUserCompanyState();



                        }
                    } else {
                        // console.log(response.mode, response.nodeStation);
                        // console.log(response.token, response.expiresIn);

                        // getUserNodeLoginWaitUpdatedListener()
                        this.userNodeLoginWaitUpdated.next({
                            nodeStation: response.nodeStation,
                            stationID: response.stationID,
                            nodeStationLoginRequest: response.nodeStationLoginRequest,
                            company: response.company,
                            factory: response.factory
                        });
                    }

                }, error: error => {
                    // console.log(error);
                    this.isAuthenticated = false;
                    this.dataAroundAppStatusListener.next(this.getDataAroundApp());
                    // this.errorStatusListener.next(error.error.message);

                }});
    }

    async checkUserCompanyState() {
        // console.log(this.user);
        // const mode = 'rep-exclusive';
        this.companyState = '';
        const uCompany = this.user.uCompany;
        if (uCompany.length === 1) {
            if (uCompany[0].state === 'rep-exclusive') {
                this.companyState = 'rep-exclusive';
                // console.log('uCompany[0].state === rep-exclusive');
                // this.langData.languageData

                // ## get general info
                const langg = await this.getLangCurrent();
                this.getGeneralInfo('rep-exclusive', langg, 899);


            } else if (uCompany[0].state === 'staff-qrcode') {
                this.companyState = 'staff-qrcode';
                // console.log('uCompany[0].state === rep-exclusive');
                // this.langData.languageData

                // ## get general info
                const langg = await this.getLangCurrent();
                this.getGeneralInfo('staff-qrcode', langg, 899);
            } else  {
                // ## case : normal
                this.router.navigate(['/user/ucompany']);
            }
        } else {
            // ## case : normal
            this.router.navigate(['/user/ucompany']);
        }


    }

    clearDataWhenLogOut() {
        this.keyConfirmlink = '';
        this.uuid5IDEncrypt = '';
        this.uuidUserNodeLoginWaiting = '';
        this.userIDEncrypt = '';
        this.user = GBC.clrUser();
        this.token = 'x';
        this.userID = 'x';
        this.uuid5 = '';
        this.ioID  = '';

        this.user1Company = GBC.clrUser();
        this.userSelected = GBC.clrUser();

        this.company = GBC.clrCompany();
        this.companies = [];
        this.membersCompany = [];
        this.factory = GBC.clrFactory();
        this.factories = [];
        this.factoryDialogSelected = GBC.clrFactory();  // ## for factory dialog selected

        this.product = GBC.clrProduct();
        this.products = [];

        // ## customer
        this.customer = GBC.clrCustomer();
        this.customers = [];

        // ## order
        this.order = GBC.clrOrder();
        this.orders = [];
    }

    logout() {
        this.logoutByClickLinkSignupFromMail();
        // this.menuService.setIconMenu('home');  // ##  set icon to home
        this.router.navigate(['/']);
        // location.reload();
        // console.log('keyConfirmlink = '+this.keyConfirmlink);
    }

    logoutByClickLinkSignupFromMail() {
        this.userLogout(this.userID);  // ## tell server --> user logout


        this.isAuthenticated = false;
        this.dataAroundAppStatusListener.next(this.getDataAroundApp());
        this.clearDataWhenLogOut();
        this.clearTimeoutLogIn();
        clearTimeout(this.tokenTimer);
        this.clearAuthData();
    }

    async userLogout(userID: string) {
        const authData: AuthData = {
            userID,
            userPass: '',
            tokenSet: await this.getTokenSet(userID),
            uuidUserNodeLoginWaiting: ''
        };
        this.http
            .post<{ status: string }>(
                BACKEND_URL+'/logout',
                authData
            )
            .subscribe({
                next:response => {
                    // console.log(response.status);
                }, error:error => {
                    // console.log('logout error!');
                }});
    }

    autoAuthUser() {
        // console.log('autoAuthUser');

        this.uuidUserNodeLoginWaiting = '';
        const authInformation = this.getAuthData();
        if (!authInformation) {
            this.logout();
        return;
        }
        const now = new Date();
        const expiresIn = authInformation.expirationDate.getTime() - now.getTime();
        if (expiresIn > 0) {
            this.token = authInformation.token;
            this.isAuthenticated = true;
            this.userID = authInformation.userID===null?'x':authInformation.userID;
            this.uuid5 = authInformation.uuid5===null?'':authInformation.uuid5;
            this.userIDEncrypt = this.getStrEncrypt(this.userID);
            this.uuid5IDEncrypt = this.getStrEncrypt(this.uuid5);
            this.user = GBC.clrUser();
            this.getuserInfo(this.userID, 'autoAuthUser');
            this.setUsersTimer(expiresIn / 1000);
            this.dataAroundAppStatusListener.next(this.getDataAroundApp());
            // console.log('autoAuthUser');
            // console.log('lang' + this.lang);
            // this.router.navigate(['/user/ucompany']);
        }
    }

    // this.genToken(data.token, data.expiresIn);
    genToken(token: string, expiresInDuration: number) {
        this.setUsersTimer(expiresInDuration);
        this.token = token;
        const now = new Date();
        const expirationDate = new Date(now.getTime() + expiresInDuration * 1000);
        // console.log(expirationDate);
        this.saveAuthData(token, expirationDate, this.userID, this.uuid5);

        // this.showTimeExpire = this.showTimeExpire + 1;
        // this.sendGenTokenSignal(this.showTimeExpire);
        // this.token = this.token;
    }

    // sendGenTokenSignal(showTimeExpire: number) {
    //     this.sendGenTokenSignalUpdated.next({
    //       showTimeExpire: showTimeExpire
    //     });
    // }

    private setUsersTimer(duration: number) {
        this.clearTimeoutLogIn();
        clearTimeout(this.tokenTimer);
        this.tokenTimer = setTimeout(() => {
            this.logout();
            location.reload(); // ## refresh web for clear modal dialog
            // this.ref.close('button close dialog from ufactory create');
        }, duration * 1000);
        this.timeOutArr.push(this.tokenTimer);
    }

    clearTimeoutLogIn() {
        this.timeOutArr.forEach((item, index) => {
          clearTimeout(item);
          if (index == (this.timeOutArr.length - 1)) { this.timeOutArr = []; }
        });
    }

    async autoAuthUserAndDeviceInfo() {
        await this.getInfo();
        this.autoAuthUser();
    }

    // private setAuthTimer(duration: number) {
    //     // console.log("Setting timer: " + duration);
    //     this.tokenTimer = setTimeout(() => {
    //         this.logout();
    //     }, duration * 1000);
    // }

    private saveAuthData(token: string, expirationDate: Date, userID: string, uuid5: string) {
        localStorage.setItem('token', token);
        localStorage.setItem('expiration', expirationDate.toISOString());
        localStorage.setItem('userID', userID);
        localStorage.setItem('uuid5', uuid5);
    }

    private clearAuthData() {
        localStorage.removeItem('token');
        localStorage.removeItem('expiration');
        localStorage.removeItem('userID');
        localStorage.removeItem('uuid5');
    }

    private getAuthData() {
        const token = localStorage.getItem('token');
        const expirationDate = localStorage.getItem('expiration');
        const userID = localStorage.getItem('userID');
        const uuid5 = localStorage.getItem('uuid5');
        if (!token || !expirationDate || !uuid5) {
            return null;
        }
        return {
            token,
            expirationDate: new Date(expirationDate),
            userID,
            uuid5
        };
    }

    // tokenNS: '',
    //   expiresIn: process.env.expiresIn,
    //   userID: userID,
    //   mode: mode,
    //   success: true

    // router.post("/staffConfirm", userController.staffCheckConfirm);  // ## for confirmation for important case
    async staffCheckConfirm(userID: string, userPass: string, mode: string) {
        // console.log("staffCheckConfirm");
        const companyID = this.company.companyID;
        const factoryID = this.factory.factoryID;
        let dataSend: any = {
            userID,
            userPass,
            mode,
            companyID,
            factoryID,
        };

        // console.log(dataSend);
        this.http
            .post<{ tokenNS: string; expiresIn: number; userID: string; mode: string; success: boolean;}>(
                BACKEND_URL+'/staffConfirm', dataSend)
            .subscribe({
                next: data => {
                    // console.log(data);

                    // getStaffCheckConfirmListener()
                    this.staffCheckConfirmUpdated.next({
                        userID: data.userID,
                        mode: data.mode,
                        success: data.success
                    });

                }, error: error => {
                    // console.log(error);
                    // this.isAuthenticated = false;
                    // this.dataAroundAppStatusListener.next(this.getDataAroundApp());
                    // this.errorStatusListener.next(error.error.message);

                }});
    }

    // ## user auth ########################################################
    // #######################################################################

    // #######################################################################
    // ## user  ########################################################



    getStrEncrypt(str: string) {
        const strEncrypt = CryptoJS.AES.encrypt(str, BACKEND_AESP.trim()).toString();
        return strEncrypt;
    }

    // ## get user uCompany --> state
    getUserCompanyState(uCompany: UCompany[], companyID: string) {
        const uCompanyF = uCompany.filter(i=>i.companyID == companyID);

        return uCompanyF[0].state;
    }

    // // ## edit editPassFactoryStaff
    // router.put("/useredit1/factory/staff", checkAuth, checkUUID, userController.editPassFactoryStaff);
    async editPassFactoryStaff(staffUserID: string, newPass: string, state: string) {
        const dataSent = {
            staffUserID,
            newPass,
            state
        };
        this.http
            .put<{token: string; expiresIn: number; userID: string; success: boolean;}>
            (BACKEND_URL+'/useredit1/factory/staff', dataSent)
            .subscribe({
                next: (data) => {
                    // console.log(data);
                    this.genToken(data.token, data.expiresIn)

                    // getEditStaffPassUpdatedListener()
                    this.editStaffPassUpdated.next({ success: data.success });
                }, error: error => {
                    // console.log(error.error);
                    // this.signupStatusListener.next(false);
                    // this.errorStatusListener.next(error.error.message);
                }});
    }

    // ## user  ########################################################
    // #######################################################################

    // #######################################################################
    // ## staff / worker

    // // ## create company factory staff  createStaffCompanyFactory
    // router.post("/stf/create/companyID/factory/staff", checkAuth, checkUUID, userController.createStaffCompanyFactory);
    async createStaffCompanyFactory(user: User) {
        const createBy = this.getCreateBy();
        const dataSent = {
            user,
            createBy,
        };
        // this.tokenSet.uuid5 = this.uuid5;
        // factoryNewCreate.tokenSet.uuid5 = this.uuid5;

        // console.log(companyNewCreate);
        this.http
            .post<{token: string; expiresIn: number; userID: string; user: User;
                    message: any; success: boolean;}>
            (BACKEND_URL+'/stf/create/companyID/factory/staff', dataSent)
            .subscribe({
                next: (data) => {
                    // console.log(data);
                    this.genToken(data.token, data.expiresIn)

                    // getCreateUserCompanyFactoryUpdatedListener()
                    this.createUserCompanyFactoryUpdated.next({
                        success: data.success,
                        message: data.message,
                        user: data.user,
                    });
                }, error: error => {
                    this.createUserCompanyFactoryUpdated.next({
                        success: error.error.success,
                        message: error.error.message,
                        user: error.error.user
                    });
                }});
    }

    // // ## edit company factory staff  putEditStaffCompanyFactory
    // router.post("/stf/edit/companyID/factory/staff", checkAuth, checkUUID, userController.putEditStaffCompanyFactory);
    putEditStaffCompanyFactory(user: User) {
        const createBy = this.getCreateBy();
        const dataSent = {
            user,
            createBy,
        };
        // this.tokenSet.uuid5 = this.uuid5;
        // factoryNewCreate.tokenSet.uuid5 = this.uuid5;

        // console.log(companyNewCreate);
        this.http
            .post<{token: string; expiresIn: number; userID: string; user: User;
                    message: any; success: boolean;}>
            (BACKEND_URL+'/stf/edit/companyID/factory/staff', dataSent)
            .subscribe({
                next: (data) => {
                    // console.log(data);
                    this.genToken(data.token, data.expiresIn)

                    // getCreateUserCompanyFactoryUpdatedListener()
                    this.createUserCompanyFactoryUpdated.next({
                        success: data.success,
                        message: data.message,
                        user: data.user,
                    });
                }, error: error => {
                    this.createUserCompanyFactoryUpdated.next({
                        success: error.error.success,
                        message: error.error.message,
                        user: error.error.user
                    });
                }});
    }

    // // ## get staff1 company
    // router.get("/getstaff1/company/:userID", checkAuth, checkUUID, userController.getStaff1Company);
    async getStaff1Company(userID: string) {
        this.user1Company = GBC.clrUser();
        this.http
            .get<{status: string; user: User;}>
            (BACKEND_URL+'/getstaff1/company/' + userID)
            .subscribe({
                next: (data) => {
                    // console.log(data);
                    this.user1Company = data.user;

                    // getUser1CompanyListsUpdatedUpdatedListener()
                    this.user1CompanyListsUpdated.next({ user: data.user });

                }, error: error => {
                    // console.log(error.error);
                    // this.signupStatusListener.next(false);
                    // this.errorStatusListener.next(error.error.message);
                }});
    }

    // ## staff / worker
    // #######################################################################

    // #######################################################################
    // ## user upload image  ########################################################

    // ## /api/user/update/upload/images postUpdateUploadImages
    postUpdateUploadImages() {

    }

    // ## user upload image  ########################################################
    // #######################################################################

    // #######################################################################
    // ## user company ########################################################

    getCompanyByCompanyID(companies: Company[], companyID: string) {
        const idx = companies.findIndex( fi =>(fi.companyID === companyID));
        return companies[idx];
    }

    getUserCompany1(companyID: string) {
        const company = this.companies.filter(i=>i.companyID == companyID);
        if (company[0]) { this.company = company[0]; }
        return company[0]?company[0]:GBC.clrCompany();
    }

    getStateUserJoinCompany(user: User, companyID: string) {
        // console.log(user, companyID);
        // const company = user.uCompany.filter(i=>i.companyID == companyID);
        const idx = user.uCompany.findIndex( fi =>(fi.companyID === companyID));
        // console.log(idx, user.uCompany[idx].state);
        return idx >= 0 ?user.uCompany[idx].state:'';
    }

    // ## create new company
    // router.post("/create/company", UserController.createUserCompany);
    async createUserCompany(userID: string, companyName: string, cDescription: string, page: number, limit: number) {
        const companyNewCreate = {
            userID,
            companyName,
            cDescription,
            page,
            limit,
            userName: this.user.uInfo.userName,
            // tokenSet: await this.getTokenSet(userID)
        };
        // this.tokenSet.uuid5 = this.uuid5;
        // companyNewCreate.tokenSet.uuid5 = this.uuid5;

        // console.log(companyNewCreate);
        this.http
            .post<{token: string; expiresIn: number; userID: string; company: Company[];  user: User;}>
            (BACKEND_URL+'/create/company', companyNewCreate)
            .subscribe({
                next: (data) => {
                    // console.log(data);
                    this.companies = data.company;
                    // this.factories = data.factory;
                    this.user = data.user;
                    this.genToken(data.token, data.expiresIn)
                    // this.signupStatusListener.next(true);

                    this.userCompanyListsUpdated.next({ company: data.company });
                }, error: error => {
                    // console.log(error.error);
                    // this.signupStatusListener.next(false);
                    // this.errorStatusListener.next(error.error.message);
                }});
    }

    // // ## edit company
    // router.put("/edit/company", checkAuth, checkUUID, userController.editCompany);
    async editCompany(company: Company, page: number, limit: number) {
        const dataSent = {
            company,
            page,
            limit,
        };
        this.http
            .put<{token: string; expiresIn: number; userID: string; company: Company[];}>
            (BACKEND_URL+'/edit/company', dataSent)
            .subscribe({
                next: (data) => {
                    // console.log(data);
                    this.companies = data.company;
                    this.genToken(data.token, data.expiresIn);

                    const company1 = this.getCompanyByCompanyID(this.companies, company.companyID);
                    this.company = company1;
                    // console.log(company1);
                    this.dataAroundAppStatusListener.next(this.getDataAroundApp());

                    // getUserCompanyUpdatedListener()
                    this.userCompanyListsUpdated.next({ company: data.company });
                }, error: error => {
                    // console.log(error.error);
                    // this.signupStatusListener.next(false);
                    // this.errorStatusListener.next(error.error.message);
                }});
    }

    // getUserGroupScan
    // ## groupScanID = *, tailin, tai-an, sd, boda // ## * = select all for userGroupScan
    async getCompanyInfo(companyID: string, groupScanID: string) {
        const dataSent = {
            companyID,
            groupScanID,
        };
        this.http
            .put<{ token: string; expiresIn: number; userID: string;
                userGroupScan: UserGroupScan[];
            }>(BACKEND_URL+'/get/company/data/info', dataSent)
            .subscribe({
                next: (data) => {
                    // console.log(data);
                    this.userGroupScan = data.userGroupScan;

                }, error: error => {
                    // console.log(error.error);
                    // this.signupStatusListener.next(false);
                    // this.errorStatusListener.next(error.error.message);
                }});
    }

    // ## get user company
    // router.get("/get/company/:userID/:page/:limit", checkAuth, UserController.getUserCompany);
    // ## mode = 'rep-exclusive'
    async getUserCompany(mode: string, userID: string, page: number, limit: number) {
        this.clrUserDataAllCompany();  // ## clear user data about from company
        this.http
            .get<{token: string; expiresIn: number; userID: string; company: Company[]; }>
            (BACKEND_URL+'/get/company/' + this.userID+'/'+page+'/'+limit)
            .subscribe({
                next: (data) => {
                    this.companies = data.company;
                    // this.factories = data.factory;
                    // console.log(data);
                    // this.user = data.user;
                    // this.signupStatusListener.next(true);
                    this.genToken(data.token, data.expiresIn)

                    if (mode === 'rep-exclusive') {
                        this.setCompany(this.companies[0]);
                        // console.log(this.companies[0]);
                        this.getUserFactory(mode ,this.userID, this.companies[0].companyID, page, limit);
                    } else if (mode === 'staff-qrcode') {
                        this.setCompany(this.companies[0]);
                        this.getUserFactory(mode ,this.userID, this.companies[0].companyID, page, limit);
                    }

                    // private userCompanyListsUpdated = new Subject<{ company: Company[]}>();
                    this.userCompanyListsUpdated.next({ company: data.company });
                }, error: error => {
                    // console.log(error.error);
                    // this.signupStatusListener.next(false);
                    // this.errorStatusListener.next(error.error.message);
                }});
    }

    // // ## get user company 1 "/get1/company/:companyID"
    // router.get("/get1/company/:companyID", checkAuth, checkUUID, userController.getCompany1);
    getCompany1(companyID: string) {
        this.http
            .get<{token: string; expiresIn: number; company: Company; }>
            (BACKEND_URL+'/get1/company/' + companyID)
            .subscribe({
                next: (data) => {
                    this.company = data.company;
                    // this.factories = data.factory;
                    // console.log(data);
                    // this.user = data.user;
                    // this.signupStatusListener.next(true);
                    this.genToken(data.token, data.expiresIn)
                    this.dataAroundAppStatusListener.next(this.getDataAroundApp());
                    // private userCompanyListsUpdated = new Subject<{ company: Company[]}>();
                    // this.userCompanyListsUpdated.next({ company: data.company });
                }, error: error => {
                    // console.log(error.error);
                    // this.signupStatusListener.next(false);
                    // this.errorStatusListener.next(error.error.message);
                }});
    }

    // router.get("/get/member/company/:companyID/:page/:limit", checkAuth, checkUUID, userController.getMemberCompany);
    async getMemberCompany(companyID: string, page: number, limit: number) {
        this.membersCompany = [];
        this.http
            .get<{token: string; expiresIn: number; userID: string; membersCompany: User[];}>
            (BACKEND_URL+'/get/member/company/' + companyID+'/'+page+'/'+limit)
            .subscribe({
                next: (data) => {
                    // console.log(data);
                    this.genToken(data.token, data.expiresIn)
                    this.membersCompany = data.membersCompany;

                    // getMembersCompanyUpdatedListener()
                    this.membersCompanyListsUpdated.next({ membersCompany: data.membersCompany });
                }, error: error => {
                    // console.log(error.error);
                    // this.signupStatusListener.next(false);
                    // this.errorStatusListener.next(error.error.message);
                }});
    }

    // router.put("/invite/member/company", checkAuth, checkUUID, userController.putInviteMemberCompany);
    async putInviteMemberCompany(memberUserID: string, companyID: string) {
        const dataSent = {
            memberUserID,
            companyID
        };
        this.http
            .put<{token: string; expiresIn: number; userID: string;
                 message: any; success: boolean;}>
            (BACKEND_URL+'/invite/member/company', dataSent)
            .subscribe({
                next: (data) => {
                    // console.log(data);
                    this.genToken(data.token, data.expiresIn)

                    // getInviteMemberUpdatedListener() {
                    this.inviteMemberListsUpdated.next({ success: data.success,  message: data.message});
                }, error: error => {
                    this.inviteMemberListsUpdated.next({ success: error.error.success,  message: error.error.message});

                }});
    }

    // router.put("/join/user/company", checkAuth, checkUUID, userController.putUserJoinCompany);
    async putUserJoinCompany(companyID: string, page: number, limit: number) {
        const dataSent = {
            companyID,
            page,
            limit
        };
        this.http
            .put<{token: string; expiresIn: number; userID: string; user: User;
                 message: any; success: boolean;}>
            (BACKEND_URL+'/join/user/company', dataSent)
            .subscribe({
                next: (data) => {
                    // console.log(data);
                    this.genToken(data.token, data.expiresIn)
                    this.user = data.user;

                    // this.companies = data.company;
                    // this.userCompanyListsUpdated.next({ company: data.company });

                    // getJoinedMemberUpdatedListener()
                    this.joionedMemberListsUpdated.next({ success: data.success,  message: data.message});

                }, error: error => {
                    this.joionedMemberListsUpdated.next({ success: error.error.success,  message: error.error.message});

                }});
    }

    // // ##  member join company
    // router.put("/edit/userclass/company", checkAuth, checkUUID, userController.putUserClassCompany);
    async putUserClassCompany(memberUserID: string, companyID: string, userComClass: UserClass, page: number, limit: number) {

        const dataSent = {
            memberUserID,
            companyID,
            userComClass,
            page,
            limit
        };
        this.http
            .put<{token: string; expiresIn: number; userID: string; user: User;
                 message: any; success: boolean; membersCompany: User[];}>
            (BACKEND_URL+'/edit/userclass/company', dataSent)
            .subscribe({
                next: (data) => {
                    // console.log(data);
                    this.genToken(data.token, data.expiresIn)
                    // this.user = data.user;


                    // getMembersCompanyUpdatedListener()
                    this.membersCompanyListsUpdated.next({ membersCompany: data.membersCompany });

                    // getEditMemberClassUpdatedListener()
                    this.editdMemberClassListsUpdated.next({
                        success: data.success,
                        message: data.message,
                        user: data.user
                    });
                }, error: error => {
                    this.editdMemberClassListsUpdated.next({
                        success: error.error.success,
                        message: error.error.message,
                        user: error.error.user
                    });
                }});
    }



    // ## user company ########################################################
    // #######################################################################

    // #######################################################################
    // ## user factory ########################################################

    // // ## create new factory
    // router.post("/create/factory", checkAuth, UserController.createUserFactory);
    async createUserFactory(
        userID: string, companyID: string, factoryName: string,
        fDescription: string, page: number, limit: number) {
        //
        const factoryNewCreate = {
            userID,
            companyID,
            factoryName,
            fDescription,
            page,
            limit,
            userName: this.user.uInfo.userName,
            // tokenSet: await this.getTokenSet(userID)
        };
        // this.tokenSet.uuid5 = this.uuid5;
        // factoryNewCreate.tokenSet.uuid5 = this.uuid5;

        // console.log(companyNewCreate);
        this.http
            .post<{token: string; expiresIn: number; userID: string; factory: Factory[]; user: User;}>
            (BACKEND_URL+'/create/factory', factoryNewCreate)
            .subscribe({
                next: (data) => {
                    // console.log(data);
                    // this.companies = data.factory;
                    this.factories = data.factory;
                    this.user = data.user;
                    this.genToken(data.token, data.expiresIn)
                    // this.signupStatusListener.next(true);

                    this.userFactoryListsUpdated.next({ factory: data.factory });
                }, error: error => {
                    // console.log(error.error);
                    // this.signupStatusListener.next(false);
                    // this.errorStatusListener.next(error.error.message);
                }});


    }

    // router.get("/get/factory/:userID/:companyID//:page/:limit", checkAuth, UserController.getUserFactory);
    // exports.getUserFactory = async (req, res, next)
    // ## mode = 'rep-exclusive'
    async getUserFactory(mode: string, userID: string, companyID: string, page: number, limit: number) {
        this.http
        .get<{token: string; expiresIn: number; userID: string; factory: Factory[]; subNodeflowC: SubNodeflowC[]}>
        (BACKEND_URL+'/get/factory/' + userID+'/'+ companyID+'/'+page+'/'+limit)
        .subscribe({
            next: (data) => {
                // console.log(data);
                // this.companies = data.company;
                this.factories = data.factory;
                this.subNodeflowC = data.subNodeflowC;
                // this.user = data.user;
                // this.signupStatusListener.next(true);
                this.genToken(data.token, data.expiresIn);

                // console.log(this.companyState);

                if (mode === 'rep-exclusive') {
                    this.factoryDialogSelected = this.factories[0];
                    this.setFactory(this.factories[0]);

                    // this..getOrders(companyID: string, page: number, limit: number)

                    // console.log('/user/ucompany/rep/exclusive');
                    // ## after get all goto route
                    this.router.navigate(['/user/ucompany/rep/exclusive']);
                } else if (mode === 'staff-qrcode') {
                    this.factoryDialogSelected = this.factories[0];
                    this.setFactory(this.factories[0]);

                    this.router.navigate(['/user/ucompany/rep/exclusive']);
                }

                this.userFactoryListsUpdated.next({ factory: data.factory });
            }, error: error => {
                // console.log(error.error);
                // this.signupStatusListener.next(false);
                // this.errorStatusListener.next(error.error.message);
            }});
    }




    // ## get user uFactory --> state
    getUserfactoryState(uFactory: UFactory[], factoryID: string) {
        const UFactoryF = uFactory.filter(i=>i.factoryID == factoryID);
        return UFactoryF[0].state;
    }

    // ## get user uFactory  name
    getUserfactoryName(factory: Factory[], factoryID: string) {
        const UFactoryF = factory.filter(i=>i.factoryID == factoryID);
        return UFactoryF[0].fInfo.factoryName;
    }

    getUserfactoryName1(factoryIDx: string) {
        const factoryID = factoryIDx?factoryIDx:'';
        if (factoryID === '') { return '';}
        const UFactoryF = this.factories.filter(i=>i.factoryID == factoryID);
        return UFactoryF[0].fInfo.factoryName?UFactoryF[0].fInfo.factoryName:'';
    }
    getUserfactoryName2(factoryIDx: string) {
        const factoryID = factoryIDx?factoryIDx:'';
        if (factoryID === '') { return '';}
        const UFactoryF = this.factories.filter(i=>i.factoryID == factoryID);
        return UFactoryF[0].fInfo.factoryName2?UFactoryF[0].fInfo.factoryName2:'';
    }

    // // ## get  user  factory by  companyID factoryID
    // router.get("/get1/factory/:companyID/:factoryID", checkAuth, checkUUID, userController.getFactory1);
    async getFactory1(companyID: string, factoryID: string) {
        this.http
            .get<{token: string; expiresIn: number; factory: Factory; }>
            (BACKEND_URL+'/get1/factory/' + companyID+'/'+factoryID)
            .subscribe({
                next: (data) => {
                    this.factory = data.factory;
                    // this.factories = data.factory;
                    // console.log(data);
                    // this.user = data.user;
                    // this.signupStatusListener.next(true);
                    this.genToken(data.token, data.expiresIn)
                    this.dataAroundAppStatusListener.next(this.getDataAroundApp());
                    // private userCompanyListsUpdated = new Subject<{ company: Company[]}>();
                    // this.userCompanyListsUpdated.next({ company: data.company });
                }, error: error => {
                    // console.log(error.error);
                    // this.signupStatusListener.next(false);
                    // this.errorStatusListener.next(error.error.message);
                }});
    }

    // router.put("/edit/factory", checkAuth, checkUUID, userController.editFactory);
    async editFactory(companyID: string, factoryData: Factory, page: number, limit: number) {
        const dataSent = {
            companyID,
            factoryData,
            page,
            limit
        };
        this.http
            .put<{token: string; expiresIn: number; userID: string; factorys: Factory[];}>
            (BACKEND_URL+'/edit/factory', dataSent)
            .subscribe({
                next: (data) => {
                    // console.log(data);
                    this.genToken(data.token, data.expiresIn)
                    this.factories = data.factorys;
                    this.userFactoryListsUpdated.next({ factory: data.factorys });

                    const factory = this.factories.filter(i=>(i.factoryID == factoryData.factoryID))[0];
                    // getEditFactoryUpdatedListener()
                    this.editFactoryUpdated.next({ factory: factory });
                }, error: error => {
                    // this.editdMemberClassListsUpdated.next({
                    //     success: error.error.success,
                    //     message: error.error.message,
                    //     user: error.error.user
                    // });
                }});
    }

    // // ## create company factory user/staff
    // router.post("/create/companyID/factory/user", checkAuth, checkUUID, userController.createUserCompanyFactory);
    async createUserCompanyFactory(user: User) {
        const createBy = {userID: this.user.userID, userName: this.user.uInfo.userName};
        const dataSent = {
            user,
            createBy,
        };
        // this.tokenSet.uuid5 = this.uuid5;
        // factoryNewCreate.tokenSet.uuid5 = this.uuid5;

        // console.log(companyNewCreate);
        this.http
            .post<{token: string; expiresIn: number; userID: string; user: User;
                    message: any; success: boolean;}>
            (BACKEND_URL+'/create/companyID/factory/user', dataSent)
            .subscribe({
                next: (data) => {
                    // console.log(data);
                    this.genToken(data.token, data.expiresIn)

                    // getCreateUserCompanyFactoryUpdatedListener()
                    this.createUserCompanyFactoryUpdated.next({
                        success: data.success,
                        message: data.message,
                        user: data.user,
                    });
                }, error: error => {
                    this.createUserCompanyFactoryUpdated.next({
                        success: error.error.success,
                        message: error.error.message,
                        user: error.error.user
                    });
                }});


    }

    // // ## get  user member  factory by userID companyID
    // router.get("/getmembers/factory/:companyID/:factoryID/:page/:limit", checkAuth, checkUUID, userController.getUserMemberFactory);
    async getUserMemberFactory(companyID: string, factoryID: string, state: string,page: number, limit: number) {
        this.http
            .get<{token: string; expiresIn: number; userID: string; membersFactory: User[];}>
            (BACKEND_URL+'/getmembers/factory/' + companyID+'/'+factoryID+'/'+state+'/'+page+'/'+limit)
            .subscribe({
                next: (data) => {
                    // console.log(data);
                    this.genToken(data.token, data.expiresIn)

                    // getMembersFactoryUpdatedListener()
                    this.membersFactoryListsUpdated.next({ membersFactory: data.membersFactory });

                }, error: error => {
                    // console.log(error.error);
                    // this.signupStatusListener.next(false);
                    // this.errorStatusListener.next(error.error.message);
                }});
    }

    // ## getUserfactoryAll
    // async getUserfactoryAll(uFactory: UFactory[]) {
    //     let factories: Factory[] = [];
    //     await uFactory.forEach((item, index) => {
    //         const factory = this.factories.filter(i=>i.factoryID == item.factoryID);
    //         if (factory[0]) { factories.push(factory[0]); }
    //     });
    //     return factories;
    // }

    // ## user factory ########################################################
    // #######################################################################

    // #######################################################################
    // ## user product ########################################################

    setProduct(product: Product) {
        this.product = product;
        this.setDataAroundAppStatusListenerToNext();  // ## emit data around app
    }

    getProduct() {
        return this.product;
    }

    setProductImageProfiles(productImageProfiles: ProductImageProfiles[]) {
        this.productImageProfiles = productImageProfiles;
    }

    setProducts(products: Product[]) {
        this.products = products;
    }

    getProducts() {
        return this.products;
    }

    get1ProductInfoByOrderID(orderID: string) {
        const product1 = GBC.clrProduct();
        // console.log(this.products);

        const productF = this.products.filter(i=>(i.productID.trim() === orderID));
        if (productF.length > 0) {
            return productF[0];
        }
        return product1;
    }

    // ## user product ########################################################
    // #######################################################################

    // #######################################################################
    // ## user product ########################################################

    setYarn(yarn: Yarn) {
        this.yarn = yarn;
        this.setDataAroundAppStatusListenerToNext();  // ## emit data around app
    }

    getYarn() {
        return this.yarn;
    }

    setYarns(yarns: Yarn[]) {
        this.yarns = yarns;
    }

    getYarns() {
        return this.yarns;
    }

    setYarnSeason(yarnSeason: string) {
        this.yarnSeason = yarnSeason;
        // this.userService.setYarnSeason(this.yarnSeason);
        this.setDataAroundAppStatusListenerToNext();
    }

    setYarnSeasons(yarnSeason: YarnSeason[]) {
        yarnSeason.sort((a,b)=>{ return a.yarnSeasonID <b.yarnSeasonID?1:a.yarnSeasonID >b.yarnSeasonID?-1:0 });
        if (this.yarnSeason === '') {
            this.yarnSeason = yarnSeason[0].yarnSeasonID;
            this.setYarnSeason(this.yarnSeason);
        }
        this.yarnSeasons = yarnSeason;
        // this.deliSeasons = yarnSeason;
    }

    setYarnSuppliers(yarnSuppliers: YarnSupplier[]) {
        this.yarnSuppliers = yarnSuppliers;
    }

    setYarnColors(yarnColors: YarnColor[]) {
        this.yarnColors = yarnColors;
    }

    // ## user product ########################################################
    // #######################################################################

    // #######################################################################
    // ## user order ########################################################

    setOrderProduction(orderProduction: OrderProduction) {
        this.orderProductionInfo.orderProduction = orderProduction;
        this.setDataAroundAppStatusListenerToNext();
    }

    getOrderProduction() {
        return this.orderProductionInfo.orderProduction;
    }

    setOrder(order: Order) {
        this.order = order;
        this.ver = this.order.ver;
        this.setDataAroundAppStatusListenerToNext();  // ## emit data around app
    }

    getOrder() {
        return this.order;
    }

    setOrders(orders: Order[]) {
        // console.log(orders);
        this.orders = orders;
    }

    getOrders() {
        return this.orders;
    }

    setOrderSeasonYear(orderSeasonYears: OrderSeasonYears[], seasonYear: string) {
        this.orderSeasonYears = orderSeasonYears;
        this.seasonYear = seasonYear;
    }

    getOrderFactory(orderID: string, mode: 'id'|'name1'|'name2'|'all') {
        const facF = this.orders.filter(i=>i.orderID === orderID);
        const factoryID = facF.length===0 ? '' : facF[0].factoryID;
        let factoryName1 = '';
        let factoryName2 = '';
        if (factoryID !== '') {
            factoryName1 = this.getUserfactoryName1(factoryID);
            factoryName2 = this.getUserfactoryName2(factoryID);
        }
        if (mode === 'id') {
            return factoryID;
        } else if (mode === 'name1') {
            return factoryName1;
        } else if (mode === 'name2') {
            return factoryName2;
        } else if (mode === 'all') {
            return {factoryID, factoryName1, factoryName2};
        }
        return '';
    }

    setOPDLosts(opdLosts: OPDLost[]) {
        this.opdLosts = opdLosts;
    }

    getOPDLosts() {
        return this.opdLosts;
    }

    setLostGroups(lostGroups: LostGroup[]) {
        this.lostGroups = lostGroups;
    }

    getLostGroups() {
        return this.lostGroups;
    }

    // ## user order ########################################################
    // #######################################################################



    // #######################################################################
    // ## user customer ########################################################

    setCustomer(customer: Customer) {
        this.customer = customer;
        this.setDataAroundAppStatusListenerToNext();  // ## emit data around app
    }

    getCustomer() {
        return this.customer;
    }

    getCustomerName(customerID: string) {
        const customer = this.customers.filter(i=>(i.customerID === customerID));
        if (customer.length > 0) {
            return customer[0].customerName;
        }
        return '';
    }

    setCustomers(customers: Customer[]) {
        this.customers = customers;
    }

    getCustomers() {
        return this.customers;
    }

    findCustomerName(customer: Customer) {
        return customer.customerName;
    }

    // ## user customer ########################################################
    // #######################################################################



    // #######################################################################
    // ## screen ########################################################

    //   getScreenStatusListener() {
    //     return this.screenStatusListener.asObservable();
    //   }

    //   updateScreen(screenWidth: number, screenHeight: number, screenSize = '') {
    //     this.screenStatusListener.next({screenWidth, screenHeight, screenSize});
    //   }

    findScreenSize(screenInfo: ScreenInfo) {
        // ## sm 576 - 767 px   - mobile
        // ## md 768 - 991 px   -  mobile, tablet
        // ## lg 992 - 1999 px   -  tablet
        // ## xl 1200+ px up
        this.screenSize = '';
        if (screenInfo.screenWidth <576) {
            this.screenSize = 'xs';
        } else if (screenInfo.screenWidth >= 576 && screenInfo.screenWidth <= 767) {
            this.screenSize = 'sm';
        } else if (screenInfo.screenWidth >= 768 && screenInfo.screenWidth <= 991) {
            this.screenSize = 'md';
        } else if (screenInfo.screenWidth >= 992 && screenInfo.screenWidth <= 1199) {
            this.screenSize = 'lg';
        } else if (screenInfo.screenWidth >= 1200) {
            this.screenSize = 'xl';
        }
        screenInfo.screenSize = this.screenSize;
        // this.screenSizeListener.next(screenInfo);
        this.dataAroundAppStatusListener.next(this.getDataAroundApp());
        return screenInfo;
    }

    // ## screen ########################################################
    // #######################################################################

    // #######################################################################
    // ## language, theme ########################################################

    get getLang() {
        return this._lang.asObservable();
    }

    get getDarkTheme() {
        return this._dark.asObservable();
    }

    getLanguage() {
        return this.lang;
    }

    async getLangCurrent(): Promise<any> {
        if (this.lang !== '') {
            this._lang.next(this.lang);
        return this.lang;
        } else {
            const item: any = await this.storageService.getLangData();
            if (item) {
                this.lang = item;
                this._lang.next(this.lang);
                return this.lang;
            } else {
                const itemLang = await this.storageService.genLangData();
                // console.log(itemLang);
                this.lang = itemLang;
                this._lang.next(this.lang);
                return this.lang;
            }
        }
    }

    async setLang( langValue: string): Promise<any> {
        // console.log('langValue = ' , langValue);
        let langSet = {
            id: 1,
            title: 'lang',
            value: 'en', // ## default language : en
            modified: 1
        };
        langSet.value = langValue;
        const langKey = await this.storageService.setLangData(langSet);
        // console.log(langKey);
        this.lang = langValue;
        this._lang.next(this.lang);
    }

    getDark() {
        return this.dark;
    }

    async getThemeCurrent(key: string): Promise<any> {
        // const item = await this.storageService.getDataStorageIonic(key);
        // if (item) {
        //   this.dark = item[0].value==='dark'?true:false;
        //   this._dark.next(this.dark);
        //   return this.dark;
        // } else {
        //   const itemDark = await this.storageService.genThemeStorageIONIC(key);
        //   this.dark = itemDark[0].value==='dark'?true:false;;
        //   this._dark.next(this.dark);
        //   return this.dark;
        // }
    }

    async setTheme(key: string, darkValue: string): Promise<any> {
        // const themeSet = {
        //   id: 1,
        //   title: 'theme',
        //   value: 'light', // ## default theme : light
        //   modified: 1
        // };
        // themeSet.value = darkValue;
        // const darkKey = await this.storageService.setDataStorageIonic(key, themeSet);
        // // console.log(langKey);
        // this.dark = darkValue==='dark'?true:false;
        // this._dark.next(this.dark);
    }

    // ## language, theme ########################################################
    // #######################################################################

    // #######################################################################
    // ## device info ########################################################

    // ## no  uuid , ip , ipv6
    async getInfo(): Promise<any> {

        this.deviceInfo = this.deviceService.getDeviceInfo();
        const isMobile = this.deviceService.isMobile();
        const isTablet = this.deviceService.isTablet();
        const isDesktopDevice = this.deviceService.isDesktop();
        // console.log(this.deviceInfo);
        // console.log(isMobile);  // returns if the device is a mobile device (android / iPhone / windows-phone etc)
        // console.log(isTablet);  // returns if the device us a tablet (iPad etc)
        // console.log(isDesktopDevice); // returns if the app is running on a Desktop browser.
        // this.socketService.sendMessage(this.deviceInfo);
        this.tokenSet.appName =  this.appName;
        this.tokenSet.appVer = this.appVer;
        this.tokenSet.browser = this.deviceInfo.browser;
        this.tokenSet.browserVer = this.deviceInfo.browser_version;
        this.tokenSet.deviceType = this.deviceInfo.deviceType;
        this.tokenSet.os = this.deviceInfo.os;
        this.tokenSet.osVer = this.deviceInfo.os_version;
        // console.log(this.tokenSet);
        // console.log('getInfo()');

    }
    // public appName: string, public appVer: string,
    // public userID: string, public uuid5: string,
    // public browser: string, public browserVer: string,
    // public deviceType: string,
    // public os: string, public osVer: string

    // ## device info ########################################################
    // #######################################################################

    // #######################################################################
    // ## object function ########################################################



    // ## object function ########################################################
    // #######################################################################

    // ## check equality of objects  2 objects
    objectsEqual = (o1: any, o2: any): boolean => {
        if (o2 === null && o1 !== null) return false;
        return o1 !== null && typeof o1 === 'object' && Object.keys(o1).length > 0 ?
            Object.keys(o1).length === Object.keys(o2).length &&
            Object.keys(o1).every(p => this.objectsEqual(o1[p], o2[p]))
            : (o1 !== null && Array.isArray(o1) && Array.isArray(o2) && !o1.length &&
            !o2.length) ? true : o1 === o2;
    }

    // #######################################################################
    // ## real IP ########################################################

    // https://api64.ipify.org?format=json    environment.getIP
    getIPAddress() {
        // this.http.get(environment.getIP).subscribe((res: any)=>{
        //   this.ipAddress = res.ip;
        //   // console.log('ipAddress : ' + this.ipAddress);
        //   this.tokenSet.ip = this.ipAddress;
        // });
    }

    // environment.getIP2
    getIpAddress2() {
        // this.http.get<{ip: string}>(environment.getIP2)
        //   .subscribe( data => {
        //     // console.log('th data', data);
        //     this.tokenSet.ipv6 = data.ip;
        // });
    }

    // ## real IP ########################################################
    // #######################################################################

    // #######################################################################
    // ## asObservable mode ########################################################

    getOrderStyleSelectListener() {
        return this.orderStyleSelectListener.asObservable();
    }

    setselectBundleLog(orderProduct: OrderProduction) {
        this.selectBundleLogUpdated.next({
            orderProduct: orderProduct
         });
    }

    // private selectBundleLogUpdated = new Subject<{orderProduct: OrderProduction,}>();
    getselectBundleLogListener() {
        return this.selectBundleLogUpdated.asObservable();
    }

    // ## asObservable mode ########################################################
    // #######################################################################

    // #######################################################################
    // ## error mode ########################################################

    getErrorStatusListener() {
        return this.errorStatusListener.asObservable();
    }

    // ## error mode ########################################################
    // #######################################################################

    // #######################################################################
    // ## observer ########################################################



    // // private filenameListsUpdated = new Subject<{ company: string[]}>();
    // this.filenameListsUpdated.next
    getFilenameListsListener() {
        return this.filenameListsUpdated.asObservable();
    }

    // // getStaffCheckConfirmListener()
    // this.staffCheckConfirmUpdated.next
    getStaffCheckConfirmListener() {
        return this.staffCheckConfirmUpdated.asObservable();
    }

    // // getFactoriesUpdatedUpdatedListener()
    // this.factoriesUpdated.next({ factories: data.factories });
    getFactoriesUpdatedUpdatedListener() {
        return this.factoriesUpdated.asObservable();
    }

    // private editStaffPassUpdated = new Subject<{ success: boolean;}>();
    getEditStaffPassUpdatedListener() {
        return this.editStaffPassUpdated.asObservable();
    }

    // private userNodeLoginWaitUpdated = new Subject<{ nodeStation: NodeStation}>();
    getUserNodeLoginWaitUpdatedListener() {
        return this.userNodeLoginWaitUpdated.asObservable();
    }


    // private user1CompanyListsUpdated = new Subject<{ user: User;}>();
    getUser1CompanyListsUpdatedUpdatedListener() {
        return this.user1CompanyListsUpdated.asObservable();
    }

    // private membersFactoryListsUpdated = new Subject<{ membersFactory: User[]}>();
    getMembersFactoryUpdatedListener() {
        return this.membersFactoryListsUpdated.asObservable();
    }

    // private createUserCompanyFactoryUpdated = new Subject<{ success: boolean; message: any; user: User;}>();
    getCreateUserCompanyFactoryUpdatedListener() {
        return this.createUserCompanyFactoryUpdated.asObservable();
    }

    // private editdMemberClassListsUpdated = new Subject<{ success: boolean; message: any;}>();
    getEditMemberClassUpdatedListener() {
        return this.editdMemberClassListsUpdated.asObservable();
    }

    // private joionedMemberListsUpdated = new Subject<{ success: boolean; message: any;}>();
    getJoinedMemberUpdatedListener() {
        return this.joionedMemberListsUpdated.asObservable();
    }

    // private inviteMemberListsUpdated = new Subject<{ success: boolean; message: any;}>();
    getInviteMemberUpdatedListener() {
        return this.inviteMemberListsUpdated.asObservable();
    }

    // private membersCompanyListsUpdated = new Subject<{ membersCompany: User[]}>();
    getMembersCompanyUpdatedListener() {
        return this.membersCompanyListsUpdated.asObservable();
        // this.langsListsUpdated.next({ langs: langs });
    }

    // private langsListsUpdated = new Subject<{ langs: Language[]}>();
    getLangsListUpdatedListener() {
        return this.langsListsUpdated.asObservable();
        // this.langsListsUpdated.next({ langs: langs });
    }

    // private staffListSelectUpdated = new Subject<{ staffList: StaffList}>();
    getStaffListSelectListener() {
        return this.staffListSelectUpdated.asObservable();
        // this.langsListsUpdated.next({ langs: langs });
    }

    // getNodeStationSelectListener()
    // this.userService.nodeStationSelectUpdated.next({ staffList: this.staffList });
    getNodeStationSelectListener() {
        return this.nodeStationSelectUpdated.asObservable();
    }


    // private selectFactoryDialogListsUpdated = new Subject<{ factory: Factory}>();
    setSelectFactoryDialogSelect(factory: Factory) {
        this.selectFactoryDialogListsUpdated.next({ factory: factory });
    }

    getSelectFactoryDialogSelectUpdatedListener() {
        return this.selectFactoryDialogListsUpdated.asObservable();
    }

    setSelectFactory(factory: Factory) {
        this.selectFactoryUpdated.next({ factory: factory });
    }

    getSelectFactoryUpdatedListener() {
        return this.selectFactoryUpdated.asObservable();
    }

    // private editFactoryUpdated = new Subject<{ factory: Factory}>();
    getEditFactoryUpdatedListener() {
        return this.editFactoryUpdated.asObservable();
    }


    setOrderCustomerSelect(customer: Customer) {
        this.orderCustomerSelectListsUpdated.next({ customer: customer });
    }

    // private orderCustomerSelectListsUpdated = new Subject<{ customer: Customer}>();
    getOrderCustomerSelectUpdatedListener() {
        return this.orderCustomerSelectListsUpdated.asObservable();
    }

    setOrderProductSelect(product: Product) {
        this.orderProductSelectListsUpdated.next({ product: product });
    }

    // private orderProductSelectListsUpdated = new Subject<{ product: Product}>();
    getOrderProductSelectUpdatedListener() {
        return this.orderProductSelectListsUpdated.asObservable();
    }

    // private userCompanyListsUpdated = new Subject<{ company: Company[]}>();
    getUserCompanyUpdatedListener() {
        return this.userCompanyListsUpdated.asObservable();
    }

    // private userFactoryListsUpdated = new Subject<{ company: Factory[]}>();
    getUserFactoryUpdatedListener() {
        return this.userFactoryListsUpdated.asObservable();
    }

    // private checkUserIDExistedUpdated = new Subject<{ isExist: boolean}>();
    getCheckUserIDExistedUpdatedListener() {
        return this.checkUserIDExistedUpdated.asObservable();
    }

    // ## observer ########################################################
    // #######################################################################


    // #######################################################################
    // ## check string input format ########################################################

    // ## check 2 password to correct
    check2password(pwd1: string, pwd2: string) {
        if (pwd1 === pwd2 && pwd1.length >= this.pwdLen) {
            return true;
        }
        return false;
    }

    // ## checkEmailStr
    checkEmailStr(email: string) {
        const letterEmail = /^(?=.{1,254}$)(?=.{1,64}@)[-!#$%&'*+/0-9=?A-Z^_`a-z{|}~]+(\.[-!#$%&'*+/0-9=?A-Z^_`a-z{|}~]+)*@[A-Za-z0-9]([A-Za-z0-9-]{0,61}[A-Za-z0-9])?(\.[A-Za-z0-9]([A-Za-z0-9-]{0,61}[A-Za-z0-9])?)*$/;
        if (letterEmail.test(email)) {
            // console.log('collect!');
            return true;
        }
        return false;
    }



    // ## check string input format ########################################################
    // #######################################################################

    // ##################################################
    // ## uuid

    async getUUID5(str: string) {
        // this.uuid4 = uuidv4();

        // uuidv5('Hello, World!', MY_NAMESPACE);
        const MY_NAMESPACE = '1b671a64-40d5-491e-99b0-da01ff1f3341';
        this.uuid5 = uuidv5(str + this.returnYYYYMMDDHHMMSS(), uuidv5.URL);
        this.uuid5IDEncrypt = this.getStrEncrypt(this.uuid5);
        // console.log('uuid5 : ' + this.uuid5);

        // uuidValidateV4(v4Uuid); // ⇨ true
        // uuidValidateV4(v1Uuid); // ⇨ false

        // // console.log('version4 = ', this.uuidValidateV(this.uuid4, 4),'uuid4 = ', this.uuid4);
        // console.log('version5 = ', this.uuidValidateV(this.uuid5, 5),'uuid5 = ', this.uuid5);
        // console.log('version5 = ', this.uuidValidateV(this.uuid5+'x', 5),'uuid5 = ', this.uuid5+'x'); // test false
        // // console.log('version4 = ', this.uuidValidateV(this.uuid4, 5),'uuid4 = ', this.uuid4); // test wrong ver
        // console.log('version5 = ', this.uuidValidateV(this.uuid5, 4),'uuid5 = ', this.uuid5); // test wrong ver
        return this.uuid5;
    }

    uuidValidateV(uuid: string, ver: number) {
        return uuidValidate(uuid) && uuidVersion(uuid) === ver;
    }

    // ## uuid
    // ##################################################

    // #######################################################################
    // ## func of array object ########################################################

    // copy(o: any) {
    //     var output, v, key;
    //     output = Array.isArray(o) ? [] : {};
    //     for (key in o) {
    //         v = o[key];
    //         output[key] =  (typeof v === "object") ? this.copy(v) : v;
    //     }
    //     return output;
    // }

      // ## func of array object ########################################################
    // #######################################################################

    // #######################################################################
    // ## func string ########################################################

    validateBundleNoQtyAndCount(bundleNoSet: string) {
        if (bundleNoSet.trim() === '') { return -1; } // ## check empty data string

        let correctFormat = true; // ## is character and is NaN  --> incorrect format
        let bundleCount = 0;
        const setArr = bundleNoSet.split(',');
        setArr.forEach( (item, index) => {
            const dataArr = item.split('-');
            // console.log(dataArr);
            if (dataArr.length >= 3 || !correctFormat) {
                correctFormat = false; // ## incorrect format
            } else {
                dataArr.forEach( (item2, index2) => {
                    if (Number.isNaN(+item2)) {
                        // console.log(+item2, 'is nan');
                        correctFormat = false; // ## incorrect format
                    } else {
                        // console.log(+item2, 'is number');
                    }
                });

                if (dataArr.length === 2 && +dataArr[0] > +dataArr[1]) { // ##  '10-1' --> incorrect format
                    correctFormat = false; // ## incorrect format
                }

                if (correctFormat && dataArr.length === 1) {
                    if (+dataArr[0] <= 0) {
                        correctFormat = false; // ## incorrect format
                    } else {
                        bundleCount++;
                    }
                } else if (correctFormat && dataArr.length === 2) {
                    if (dataArr[0].trim() === '') {
                        correctFormat = false; // ## incorrect format
                    } else {
                        const num1 = +dataArr[0];
                        const num2 = +dataArr[1];
                        const range = this.findNumberRangeQty(num1, num2);
                        bundleCount = bundleCount + range;
                    }
                }
            }
        });
        if (!correctFormat) {
            return -1;
        }
        return bundleCount;
    }

    findNumberRangeQty(num1: number, num2: number): number {
        const range = num2 - num1 + 1;
        return range;
    }

    calDiffPercent(num1: number, num2: number) {
        const percent = (num1 / num2 * 100);
        let result = '';
        if (percent === 0 || num2 === 0) { result = ''; }
        else { result = percent.toFixed(2); }
        return result;
    }

    strTrim(str: string) {
        return str.trim();
    }

    escapeRegExp(str: string) {
        return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
      }

    strReplaceAll(str: string, find: string, replace: string) {
        return str.replace(new RegExp(this.escapeRegExp(find), 'g'), replace);
    }

    strReplaceAlll(str: string, find: string, replace: string) {
        return (str.split(find)).join(replace);
    }

    strFirst(str: string, len: number) {
        const strL = str.substr(0, len);
        return strL;
    }

    strLast(str: string, len: number) {
        const strL = str.slice(-len);
        return strL;
    }

    strFirstAndDot(str: string, len: number) {
        const strL = str.slice(0, len);
        if (str.length <= len) { return str; }
        return strL+'...';
    }

    setAddStrLen(str: string, len: number, strAdd: string) {
        while ((str+'').length < len ){str = strAdd+str;}
        return str+'';
    }

    setAddBackStrLen(str: string, len: number, strAdd: string) {
        while ((str+'').length < len ){str = str+strAdd;}
        return str+'';
    }

    // ## abbreviation first 4 digit
    getUserIDCutOutAbbreviation(str: string, lenCutFront: number) {
        const strCut = str.substring(lenCutFront);
        return strCut;
    }

    getAutoNumber(loop: number, numberStart: number, digitMin: number, numFirst: string): any[] {
        let numArr: string[] = [];
        for (let i = 1; i <= loop; i++) {
            let numX = numberStart+'';
            if ((numberStart+'').length < digitMin) {
                numX = this.setAddStrLen(numberStart+'', digitMin, numFirst);
            }
            numArr.push(numX+'');
            numberStart++;
        }
        return numArr;
    }

    getAutoNumber2(loop: number, numberStart: number): any[] {
        let numArr: string[] = [];
        for (let i = 1; i <= loop; i++) {
            let numX = numberStart+'';
            // if ((numberStart+'').length < digitMin) {
            //     numX = this.setAddStrLen(numberStart+'', digitMin, numFirst);
            // }
            numArr.push(numX+'');
            numberStart++;
        }
        return numArr;
    }

    formatProductBarcodeString(str: string) {
        // 8 + 4 + 2 +2+2+2+2+2 + 3 + 1  = 28
        // 8 + 4 + 2 +2+2+2+2+2 + 3 + 1 + 5 = 33

        // 12 + 4 + 2 +2+2+2+2+2 + 3 + 1  = 32
        // 12 + 4 + 2 +2+2+2+2+2 + 3 + 1 + 5 = 37

        // style = '********'; // ## product.productCustomerCode  //  len=8
        // targetPlace = '----';
        // year = '--';
        // c1 = '--';
        // c2 = '--';
        // c3 = '--';
        // c4 = '--';
        // c5 = '--';
        // size = '---';
        // sex = '-';

        // console.log(str.length);

        // // ## style code len = 8
        // let strFormatted = '';
        // if (str.length == 28) {  // ## barcode excluce running number
        //     strFormatted = str.substr(0, 8) + ' ' + str.substr(8, 4) + ' ' + str.substr(12, 2)
        //                         + ' ' + str.substr(14, 2) + ' ' + str.substr(16, 2) + ' ' + str.substr(18, 2)
        //                         + ' ' + str.substr(20, 2) + ' ' + str.substr(22, 2)
        //                         + ' ' + str.substr(24, 3) + ' ' + str.substr(27, 1);
        // } else if (str.length == 33) { // ## barcode incluce running number
        //     strFormatted = str.substr(0, 8) + ' ' + str.substr(8, 4) + ' ' + str.substr(12, 2)
        //                     + ' ' + str.substr(14, 2) + ' ' + str.substr(16, 2) + ' ' + str.substr(18, 2)
        //                     + ' ' + str.substr(20, 2) + ' ' + str.substr(22, 2)
        //                     + ' ' + str.substr(24, 3) + ' ' + str.substr(27, 1) + ' ' + str.substr(28, 5);
        // }

        // ## style code len = 12
        let strFormatted = '';
        if (str.length == 37) {  // ## barcode excluce running number
            strFormatted = str.substr(0, 12)
                                + ' ' + str.substr(12, 4)
                                + ' ' + str.substr(16, 5)
                                + ' ' + str.substr(21, 2)
                                + ' ' + str.substr(23, 2) + ' ' + str.substr(25, 2) + ' ' + str.substr(27, 2)
                                + ' ' + str.substr(29, 2) + ' ' + str.substr(31, 2)
                                + ' ' + str.substr(33, 3) + ' ' + str.substr(36, 1);
        } else if (str.length == 42) { // ## barcode incluce running number
            strFormatted = str.substr(0, 12)
                            + ' ' + str.substr(12, 4)
                            + ' ' + str.substr(16, 5)
                            + ' ' + str.substr(21, 2)
                            + ' ' + str.substr(23, 2) + ' ' + str.substr(25, 2) + ' ' + str.substr(27, 2)
                            + ' ' + str.substr(29, 2) + ' ' + str.substr(31, 2)
                            + ' ' + str.substr(33, 3) + ' ' + str.substr(36, 1) + ' ' + str.substr(37, 5);
        }

        // console.log(strFormatted);
        return strFormatted;
    }


    // ## func string ########################################################
    // #######################################################################

    // #######################################################################
    // ## date time zone ########################################################

    returnHHMM(numFromToday = 0, sign=':'){
        let d = new Date();
        d.setDate(d.getDate() + numFromToday);
        const month = d.getMonth() < 9 ? '0' + (d.getMonth() + 1) : d.getMonth() + 1;
        const day = d.getDate() < 10 ? '0' + d.getDate() : d.getDate();
        const hh = d.getHours() < 10 ? '0' + d.getHours() : d.getHours();
        const mm = d.getMinutes() < 10 ? '0' + d.getMinutes() : d.getMinutes();
        return `${hh}${sign}${mm}`;
    }

    // ## date1 have to more than equal date2 / date1 >= date2
    getDayDifferent(date1: Date, date2: Date): number {
        const difference = Math.ceil((date1.getTime() - date2.getTime() ) /  (1000 * 60 * 60 * 24));
        return difference;
    }

    returnDDMMYYYY(numFromToday = 0, sign = '-'){
        let d = new Date();
        d.setDate(d.getDate() + numFromToday);
        const month = d.getMonth() < 9 ? '0' + (d.getMonth() + 1) : d.getMonth() + 1;
        const day = d.getDate() < 10 ? '0' + d.getDate() : d.getDate();
        return `${day}${sign}${month}${sign}${d.getFullYear()}`;
    }

    returnYYYYMMDD(numFromToday = 0){
        let d = new Date();
        d.setDate(d.getDate() + numFromToday);
        const month = d.getMonth() < 9 ? '0' + (d.getMonth() + 1) : d.getMonth() + 1;
        const day = d.getDate() < 10 ? '0' + d.getDate() : d.getDate();
        return `${d.getFullYear()}${month}${day}`;
    }

    returnYYYYMMDDHHMM(numFromToday = 0){
        let d = new Date();
        d.setDate(d.getDate() + numFromToday);
        const month = d.getMonth() < 9 ? '0' + (d.getMonth() + 1) : d.getMonth() + 1;
        const day = d.getDate() < 10 ? '0' + d.getDate() : d.getDate();
        const hh = d.getHours() < 10 ? '0' + d.getHours() : d.getHours();
        const mm = d.getMinutes() < 10 ? '0' + d.getMinutes() : d.getMinutes();
        return `${d.getFullYear()}${month}${day}${hh}${mm}`;
    }

    returnYYYYMMDDHHMMSS(numFromToday = 0){
        let d = new Date();
        d.setDate(d.getDate() + numFromToday);
        const month = d.getMonth() < 9 ? '0' + (d.getMonth() + 1) : d.getMonth() + 1;
        const day = d.getDate() < 10 ? '0' + d.getDate() : d.getDate();
        const hh = d.getHours() < 10 ? '0' + d.getHours() : d.getHours();
        const mm = d.getMinutes() < 10 ? '0' + d.getMinutes() : d.getMinutes();
        const ss = d.getSeconds() < 10 ? '0' + d.getSeconds() : d.getSeconds();
        return `${d.getFullYear()}${month}${day}${hh}${mm}${ss}`;
    }

    returnDateDDMMYYYYHHMMSign =  (date: Date, sign: string) => {
        // const current = new Date(moment().tz('Asia/Bangkok').format('YYYY/MM/DD HH:mm:ss+07:00'));
        let d = new Date(date);
        // let d = date;
        // let d = new Date(moment(date).tz('Asia/Bangkok').format('YYYY/MM/DD HH:mm:ss+07:00'));
        // let d = new Date();
        d.setDate(d.getDate());
        const month = d.getMonth() < 9 ? '0' + (d.getMonth() + 1) : d.getMonth() + 1;
        const day = d.getDate() < 10 ? '0' + d.getDate() : d.getDate();
        const hh = d.getHours() < 10 ? '0' + d.getHours() : d.getHours();
        const mm = d.getMinutes() < 10 ? '0' + d.getMinutes() : d.getMinutes();
        // return `${d.getFullYear()}${sign}${month}${sign}${day}`;
        return `${day}${sign}${month}${sign}${d.getFullYear()}`;
    }

    returnDateYYYYMMDDSign =  (date: Date, sign: string) => {
        // const current = new Date(moment().tz('Asia/Bangkok').format('YYYY/MM/DD HH:mm:ss+07:00'));
        // let d = date;
        let d = new Date(date);
        // let d = new Date(moment(date).tz('Asia/Bangkok').format('YYYY/MM/DD HH:mm:ss+07:00'));
        // let d = new Date();
        // console.log(d.getDate());
        d.setDate(d.getDate());
        const month = d.getMonth() < 9 ? '0' + (d.getMonth() + 1) : d.getMonth() + 1;
        const day = d.getDate() < 10 ? '0' + d.getDate() : d.getDate();
        const hh = d.getHours() < 10 ? '0' + d.getHours() : d.getHours();
        const mm = d.getMinutes() < 10 ? '0' + d.getMinutes() : d.getMinutes();
        return `${d.getFullYear()}${sign}${month}${sign}${day}`;
    }

    returnDateMMDDSign =  (date: Date, sign: string) => {
        let d = new Date(date);
        // const current = new Date(moment().tz('Asia/Bangkok').format('YYYY/MM/DD HH:mm:ss+07:00'));
        // let d = date;
        // let d = new Date(moment(date).tz('Asia/Bangkok').format('YYYY/MM/DD HH:mm:ss+07:00'));
        // let d = new Date();
        d.setDate(d.getDate());
        const month = d.getMonth() < 9 ? '0' + (d.getMonth() + 1) : d.getMonth() + 1;
        const day = d.getDate() < 10 ? '0' + d.getDate() : d.getDate();
        const hh = d.getHours() < 10 ? '0' + d.getHours() : d.getHours();
        const mm = d.getMinutes() < 10 ? '0' + d.getMinutes() : d.getMinutes();
        return `${month}${sign}${day}`;
    }


    // ## date time zone ########################################################
    // #######################################################################



    // #######################################################################
    // ## clr zone ########################################################

    // ## tokenSet
    clrTokenSet() {
        const tokenSet: TokenSet = {
        appName: this.appName,
        appVer: this.appVer,
        userID: this.userID,
        uuid5: this.uuid5,
        browser: '',
        browserVer: '',
        deviceType: '',
        os: '',
        osVer: '',
        };
        return tokenSet;
    }

    // // Language
    // clrLanguage() {
    //     const language: Language = {
    //         languageID: '',
    //         languageName: '',
    //         seq: -1,
    //         show: false,
    //         languageData: []
    //     };
    //     return language;
    // }

    // // ## clr user
    // clrUser() {
    //     const user: User = {
    //         userID: '',
    //         type: '',
    //         uInfo: {
    //             userName: '',
    //             userPass: '',
    //             pic: '',
    //             tel: '',
    //             email: '',
    //             registDate: new Date(),
    //             lastLogin: new Date(),
    //         },
    //         uCompany: [],
    //         uFactory: [],
    //         status: '',
    //         state: '',
    //         createdAt: new Date(),
    //         createBy: {
    //             userID: '',
    //             userName: ''
    //         }
    //     };
    //     return user;
    // }



    // clrTargetPlace() {
    //     const targetPlace: TargetPlace = {
    //         targetPlaceID: '',
    //         targetPlaceName: '',
    //         countryID: '',
    //         countryName: '',
    //     };
    //     return targetPlace;
    // }

    // clrCompany() {
    //     const company: Company = {
    //         companyID: '',
    //         cDescription: '',
    //         cInfo: {
    //             companyName: '',
    //             abbreviation: '',
    //             pic: '',
    //             tel: '',
    //             email: '',
    //             registDate: new Date(),
    //             createBy: {
    //                 userID: '',
    //                 userName: ''
    //             }
    //         }
    //     };
    //     return company;
    // }

    // clrFactory() {
    //     const factory: Factory = {
    //         factoryID: '',
    //         fDescription: '',
    //         companyID: '',
    //         fInfo: {
    //             factoryName: '',
    //             abbreviation: '',
    //             pic: '',
    //             tel: '',
    //             email: '',
    //             registDate: new Date(),
    //             createBy: {
    //                 userID: '',
    //                 userName: ''
    //             }
    //         }
    //     };
    //     return factory;
    // }

    // clrCustomer() {
    //     // console.log('clrCustomer');
    //     const customer: Customer = {
    //         customerID: '',
    //         customerName: '',
    //         companyID: '',
    //         registDate: new Date(),
    //         imageProfile: '',
    //         cusInfo: {
    //             customerDetail: '',
    //             email: '',
    //             tel: '',
    //             web: '',
    //             pic: '',
    //             createBy: {
    //                 userID: '',
    //                 userName: ''
    //             }
    //         }
    //     };
    //     return customer;
    // }

    // clrOrder() {
    //     const order: Order = {
    //         orderID: '',
    //         orderDetail: '',
    //         orderDate: new Date(),
    //         deliveryDate: new Date(),
    //         companyID: '',
    //         factoryID: '',
    //         bundleNo: 1,
    //         orderstatus: 'close',
    //         customerOR: {
    //             customerID: '',
    //             customerName: ''
    //         },
    //         orderTargetPlace: [],
    //         orderColor: [],
    //         productOR: {
    //             productID: '',
    //             productName: '',
    //             productORDetail: '',
    //             productCustomerCode: '',
    //             productORInfo: []
    //         },
    //         createBy: {
    //             userID: '',
    //             userName: ''
    //         }
    //     };
    //     return order;
    // }

    // clrOrderProduction() {
    //     const orderProduction: OrderProduction = {
    //         companyID: '',
    //         factoryID: '',
    //         orderID: '',
    //         bundleNo: 0,
    //         bundleID: '',
    //         productID: '',
    //         productBarcodeNo: '',
    //         productBarcodeNoReal: '',
    //         productBarcodeNoReserve: [],
    //         targetPlace: {
    //             targetPlaceID: '-',
    //             targetPlaceName: '-',
    //             countryID: '-',
    //             countryName: '-',
    //         },
    //         productCount: 0,
    //         productionDate: new Date(),
    //         productStatus: '',
    //         forLoss: false,
    //         yarnLot: [],
    //         productionNode: [],
    //     };
    //     return orderProduction;
    // }

    // clrOrderProductionScan() {
    //     const orderProductionScan: OrderProductionScan = {
    //         companyID: '',
    //         factoryID: '',
    //         orderID: '',
    //         productID: '',
    //         nodeID: '',
    //         nodeIDNext: '',
    //         stationID: '',
    //         bundleNo: 0,
    //         bundleCount: 0,
    //         scanItem: [],
    //     };
    //     return orderProductionScan;
    // }

    // clrProduct() {
    //     const product: Product = {
    //         productID: '',
    //         productName: '',
    //         productDetail: '',
    //         productGroupCode: '',
    //         productCustomerCode: '',
    //         productFeature: [],
    //         seasonYear: '',
    //         companyID: '',
    //         imageProfile: '',
    //         pdPic: [],
    //         // productsize: [],
    //         // productcolorSet: [],

    //     };
    //     return product;
    // }

    // clrProductORInfo() {
    //     const productORInfo: ProductORInfo = {
    //         factoryID: '',
    //         productBarcode: '-',
    //         targetPlace: {
    //             targetPlaceID: '-',
    //             targetPlaceName: '-',
    //             countryID: '-',
    //             countryName: '-',
    //         },
    //         productColor: '-',
    //         productSize: '-',
    //         productQty: 0,
    //         productLossQty: 0,
    //         productYear: '-',
    //         productSex: '-',
    //         sizeSeq: 0,
    //     };
    //     return productORInfo;
    // }

    // clrOrderProductQueue() {
    //     const orderProductionQueue: OrderProductionQueue = {
    //         // orderProductionQueueID: '',
    //         companyID: '',
    //         orderID: '',
    //         productID: '',
    //         // forLossQty: 0,
    //         queueInfo: [],
    //     };
    //     return orderProductionQueue;
    // }

    // clrYarn() {
    //     const yarn: Yarn = {
    //         companyID: '',
    //         seq: -1,
    //         yarnID: '',
    //         yarnName: '',
    //         yarnFullName: '',
    //         detail: '',
    //     };
    //     return yarn;
    // }



    // clrNodeStation() {
    //     const nodeStation: NodeStation = {
    //         companyID: '',
    //         factoryID: '',
    //         nodeID: '',
    //         nodeName: '',
    //         status: 'c',
    //         nodeInfo: {
    //             nodeType: 'main',
    //             mustBundleScan: false,
    //             haveSubWorkflow: false,
    //             location: '',
    //             nodeDescription: '',
    //             pic: [],
    //             registDate: new Date(),
    //             createBy: {
    //                 userID: '',
    //                 userName: ''
    //             }
    //         },
    //         userNode: [],
    //         nStation: {
    //             stationNo: 0,
    //             loginList: []
    //         },
    //         nodeProblem: [],
    //     };
    //     return nodeStation;
    // }

    // emptyUserNode() {
    //     const userNode: UserNode = {
    //         stationID: '',
    //         userNodeID: '',
    //         userNodePass: '',
    //         uuid: ''
    //     };
    //     return userNode;
    // }

    // clrNodeFlow() {
    //     const nodeFlow: NodeFlow = {
    //         companyID: '',
    //         factoryID: '',
    //         nodeFlowID: '',
    //         flowType: 'main',
    //         registDate: new Date(),
    //         editDate: new Date(),
    //         flowCondition: {
    //             isFlowSequence: true,
    //         },
    //         flowSeq: [],
    //     };
    //     return nodeFlow;
    // }



    // clrNodeStationLoginRequest() {
    //     const nodeStationLoginRequest: NodeStationLoginRequest = {
    //         companyID: '',
    //         factoryID: '',
    //         nodeID: '',
    //         stationID: '',
    //         uuidUserNodeLoginWaiting: '',
    //         msgTypeID: '',
    //         userID: [],
    //         userClass: [],
    //         formName: [],
    //         datetime: new Date(),
    //         expiretime: new Date(),
    //     };
    //     return nodeStationLoginRequest;
    // }

    // clrDataMsgIO() {
    //     const dataMsgIO = {
    //         msgTypeID: '',  // ## msgID = message type
    //         sendIO: {
    //           userIO: {
    //             uAll: false,
    //             userClass: [],  //
    //             userID: [],  //
    //           },
    //           companyIO: {
    //             comAll: false,
    //             companyID: []
    //           },
    //           factoryIO: {
    //             facAll: false,
    //             factoryID: []
    //           }
    //         },
    //         toForm: {  // ## form location alert
    //           frmAll: false,
    //           formName: [],
    //         },
    //         dataIO: {
    //           // ## data messagee any
    //           // ## data structure depend on function

    //         }
    //     };
    //     return dataMsgIO;
    // }

    // ## clr zone ########################################################
    // #######################################################################

    // #######################################################################
    // ## keypress keydown zone ########################################################

    // numberOnly(event: any) {
    //     const charCode = event.which ? event.which : event.keyCode;
    //     // Only Numbers 0-9
    //     // if (charCode < 48 || charCode > 57) {
    //     if (charCode > 31 && (charCode < 48 || charCode > 57)) {
    //         event.preventDefault();
    //         return false;
    //     } else {
    //         return true;
    //     }
    // }


    // ## charcode
    // ## backspace = 8
    // ## delete = 46
    delBAckSpaceOnly(event: any): boolean {
        const charCode = (event.which) ? event.which : event.keyCode;
        if (charCode == 8 || // ## backspace = 8
            charCode == 46) { // ## delete = 46
          return true;
        }
        event.preventDefault();
        return false;
    }


    azAZOnly(event: any): boolean {
        const charCode = (event.which) ? event.which : event.keyCode;
        if ((charCode >= 65 && charCode <= 90) || // A-Z
          (charCode >= 97 && charCode <= 122)) {
          return true;
        }
        event.preventDefault();
        return false;
    }

    numberOnly(event: any): boolean {
        const charCode = (event.which) ? event.which : event.keyCode;
        if (charCode > 31 && (charCode < 48 || charCode > 57)) {
            event.preventDefault();
            return false;
        }

        return true;
    }

    // numberDotOnly(event: any): boolean {
    //     const charCode = (event.which) ? event.which : event.keyCode;
    //     // console.log(charCode);
    //     if ((charCode > 31 && (charCode < 48 || charCode > 57)) || charCode == 46) {
    //         event.preventDefault();
    //         return false;
    //     }

    //     return true;
    // }

    numberDotOnly(event: any): boolean {
        const charCode = (event.which) ? event.which : event.keyCode;
        if ((charCode >= 48 && charCode <= 57) || (charCode == 46) ) {
          return true;
        }
        event.preventDefault();
        return false;
      }

    numberMinusOnly(event: any): boolean {
        const charCode = (event.which) ? event.which : event.keyCode;
        if ((charCode >= 48 && charCode <= 57) || (charCode == 45) ) {
          return true;
        }
        event.preventDefault();
        return false;
    }

    numberMinusCommaOnly(event: any): boolean {
        const charCode = (event.which) ? event.which : event.keyCode;
        if ((charCode >= 48 && charCode <= 57)
            || (charCode == 45)   // - minus, dash
            || (charCode == 13)  // enter
            || (charCode == 32)   // spacebar
            || (charCode == 44)  // comma ,
            || (charCode == 188)  // comma ,
            || (charCode == 194) ) {  // comma ,
          return true;
        }
        event.preventDefault();
        return false;
    }

    numberAZazOnly(event: any): boolean {
        const charCode = (event.which) ? event.which : event.keyCode;
        if ((charCode >= 48 && charCode <= 57) || // 0-9
            (charCode >= 65 && charCode <= 90) || // A-Z
            (charCode >= 97 && charCode <= 122)) {
            return true;
        }
        event.preventDefault();
        return false;

        // const charCode = (event.which) ? event.which : event.keyCode;
        // const inp = String.fromCharCode(charCode);
        // // Allow numbers, alpahbets, space, underscore
        // if (/[a-zA-Z0-9-_ ]/.test(inp)) {
        //     return true;
        // } else {
        //     event.preventDefault();
        //     return false;
        // }
    }

    numberAZazMinusOnly(event: any): boolean {
        const charCode = (event.which) ? event.which : event.keyCode;
        if ((charCode >= 48 && charCode <= 57) || // 0-9
            (charCode >= 65 && charCode <= 90) || // A-Z
            (charCode == 45) || // - minus, dash
            (charCode >= 97 && charCode <= 122)) {
            return true;
        }
        event.preventDefault();
        return false;

        // const charCode = (event.which) ? event.which : event.keyCode;
        // const inp = String.fromCharCode(charCode);
        // // Allow numbers, alpahbets, space, underscore
        // if (/[a-zA-Z0-9-_ ]/.test(inp)) {
        //     return true;
        // } else {
        //     event.preventDefault();
        //     return false;
        // }
    }

    numberAZazMinusCommaOnly(event: any): boolean {
        const charCode = (event.which) ? event.which : event.keyCode;
        if ((charCode >= 48 && charCode <= 57) || // 0-9
            (charCode >= 65 && charCode <= 90) || // A-Z
            (charCode == 45) || // - minus, dash
            (charCode == 44) ||
            (charCode == 188) || // comma ,
            (charCode >= 97 && charCode <= 122)) {
            return true;
        }
        event.preventDefault();
        return false;
    }

    // numberAZazOnly(event: any): boolean {
    //     const charCode = (event.which) ? event.which : event.keyCode;
    //     // this.checkNumberAZazOnly();
    //     if ((charCode >= 48 && charCode <= 57) || // 0-9
    //         (charCode >= 65 && charCode <= 90) || // A-Z
    //         (charCode >= 97 && charCode <= 122)) {
    //         return true;
    //     }
    //     return false;
    // }

    // noSpace(event: any): boolean {
    //     const charCode = (event.which) ? event.which : event.keyCode;
    //     // console.log(charCode);
    //     if (charCode == 32 ) {
    //         // console.log("false");
    //         return false;
    //     }
    //     return true;
    // }

    lengthMax(str: string, len: number): boolean {
        // console.log(str, len);
        if (str) {
            if (str.length >= len) {
                return false;
            }
            return true;
        }
        return true;
    }

    valueMax(val: number, valMax: number): boolean {
        // if (val) {
            if (val > valMax) {
                return false;
            }
            return true;
        // }
        // return true;
    }

    // ## keypress keydown zone ########################################################
    // #######################################################################

    // #######################################################################
    // ## blob zone ########################################################

    // ## blob
    async b64toBlob(b64Data: any, contentType: any) {
        contentType = contentType || '';
        const sliceSize = 512;
        const byteCharacters = atob(b64Data);
        const byteArrays = [];

        for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
        const slice = byteCharacters.slice(offset, offset + sliceSize);

        const byteNumbers = new Array(slice.length);
        for (let i = 0; i < slice.length; i++) {
            byteNumbers[i] = slice.charCodeAt(i);
        }

        const byteArray = new Uint8Array(byteNumbers);

        byteArrays.push(byteArray);
        }

        const blob = new Blob(byteArrays, { type: contentType });
        return blob;
    }

    // ## blob zone ########################################################
    // #######################################################################


    // #######################################################################
    // ## get blank data zone ########################################################

    emptyCustomerImageProfile() {
        return 'https://storage.googleapis.com/mystoragegarment/whocustomer.png';
    }

    emptyCustomer() {
        // https://storage.googleapis.com/mystoragegarment/whocustomer.png
        const customer: Customer = {
            customerID: '-',
            customerName: '-',
            setName: '-',
            companyID: this.company.companyID,
            registDate: new Date(),
            imageProfile: '',
            cusInfo: {
                customerDetail: '-',
                email: '-',
                tel: '-',
                web: '-',
                pic: '',
                createBy: {
                    userID: '-',
                    userName: '-'
                }
            }
        };
        return customer;
    }

    emptyProductImageProfile() {
        return 'https://storage.googleapis.com/mystoragegarment/whatbox.png';
    }

    emptyProduct() {
        // https://storage.googleapis.com/mystoragegarment/whatbox.png
        const product: Product = {
            productID: '-',
            productName: '-',
            productDetail: '-',
            productGroupCode: '--------',
            productCustomerCode: '--------',
            productFeature: [],
            seasonYear: '-',
            companyID: '-',
            imageProfile: '',
            pdPic: [],
            // productsize: [],
            // productcolorSet: [],

        };
        return product;
    }

    // ## get blank data zone ########################################################
    // #######################################################################




    // #######################################################################
    // ## menu bar ########################################################

    getMenuAutor(userID: string, menuID: string, state: string): boolean {
        if (!userID || userID === '') {return false;}
        const menuAuthor1 = this.getMenuAuthor(userID);
        if (!menuAuthor1 || menuAuthor1.length === 0) {
            return false;
        } else  {
            const menuAuthor2 = menuAuthor1.filter(i=>
                i.menuID === menuID
                && i.visible === true
                && i.enable === true
                && i.state === state
            );
            if (menuAuthor2.length === 0) {
                return false;
            } else {
                return true;
            }
        }
        return false;
    }

    getMenuAuthor(userID: string) {
        const menuAuthor = this.user.uInfo.menuAuthor;
        return menuAuthor;
    }

    getFormActiveMenu(formName: string, callFrom: string) {
        // ## menu for order queue page
        const orderQueue = ['order-queue-production', 'order-queue-history', 'order-maxqty-view'];

        const deliveryMenu = ['transport', 'transport-dashboard'];

        // console.log(formName, callFrom);
        if (formName === 'nodeProductReport') {  // ## node Product Report
            return this.getMenuBarNodeProductReport();
        } else if (formName === 'product') {  // ## order
            return this.getMenuBarProduct();
        } else if (formName === 'order') {  // ## order
            return this.getMenuBarOrder();
        } else if (formName === 'order-outsource-progress-tracking') {  // ## order-outsource-progress-tracking
            return this.getMenuBarOrderOutsourceProgressTracking();
        } else if (orderQueue.includes(formName)) {  // ## order queue production
            return this.getMenuBarOrderQueueProduction();
        } else if (formName === 'ucsetting') {  // ## company profile
            return this.getMenuBarUCompanySetting();
        } else if (formName === 'ufsetting') {  // ## factory profile
            return this.getMenuBarUFactorySetting();
        } else if (formName === 'companyDashboardMenu') { // ## factory dashboard menu
            return this.getMenuBarUCompanyDashboard();
        } else if (formName === 'factory-dashboard') { // ## factory dashboard menu
            return this.getMenuBarUFactoryDashboard();
        } else if (formName === 'ufprofile') {  // ## user profile
            return this.getMenuBarUFProfileSetting();
        } else if (formName === 'yarn' || formName === 'yarn-plan') {  // ##
            return this.getMenuBarYarn();
        } else if (formName === 'yarn-report') {  // ##
            return this.getMenuBarYarnReport();
        } else if (deliveryMenu.includes(formName)) {
        // } else if (formName === 'transport') {  // ##
            return this.getMenuBarTransport();
        } else if (formName === 'financial') {  // ##
            return this.getMenuBarFinancial();
        } else if (formName === 'hr') {  // ##
            return this.getMenuBarHR();
        } else if (formName === 'WorkloadOverallReport') {  // ## Workload Overall Report
            return this.getMenuBarWorkloadOverallReport();
        }
        else {
            return this.getMenuBarBasic();
        }


        return [];
    }

    getMenuBarBasic() {
        const megaMenuItems = [
            {
                label: 'Factory Name',
                styleClass: 'text-lg font-bold'
            },
        ];
        return megaMenuItems;
    }

    getMenuBarNodeProductReport() {
        const megaMenuItems = [
            {
                label: 'Factory Name',
                styleClass: 'text-lg font-bold'
            },
            {
                label: 'Rep 2',
                icon: 'pi pi-fw pi-align-justify', visible: true
            },
            {
                label: 'All Node Station',
                icon: 'pi pi-fw pi-align-justify', visible: true
            },
            {
                label: 'Scan report',
                icon: 'pi pi-fw pi-qrcode', visible: true
            },
            {
                label: 'Node bundle remain',
                icon: 'pi pi-fw pi-book', visible: true
            },
            {
                label: 'Factory scan product period',
                icon: 'pi pi-fw pi-table', visible: true
            },

        ];
        return megaMenuItems;
    }

    getMenuBarProduct() {
        // console.log('getMenuBarProduct');
        const megaMenuItems = [
            {
                label: 'Factory Name',
                styleClass: 'text-lg font-bold'
            },
            {
                label: 'Products',
                icon: 'pi pi-fw pi-tag', visible: true, routerLink: ['/user/ucompany/product']
            },
            // {
            //     label: 'tools', icon: 'pi pi-fw pi-desktop',
            //     items: [
            //         [
            //             {
            //                 label: 'management',
            //                 items: [
            //                     { label: 'product edit', visible: true, routerLink: ['/user/ucompany/product/edit'] },
            //                     { label: 'edit / delete' }
            //                 ]
            //             },
            //         ],
            //     ]
            // },
        ];
        return megaMenuItems;
    }

    getMenuBarOrder() {
        // console.log('getMenuBarProduct');
        // const seasonYear = this.seasonYear;
        const megaMenuItems = [
            {
                label: 'Factory Name',
                styleClass: 'text-lg font-bold'
            },
            {
                label: this.seasonYear,
                styleClass: 'text-lg font-bold'
            },
            {
                label: 'Order',
                icon: 'pi pi-fw pi-tag',
                visible: true,
                // visible: this.getAuthMenu(this.companyState, 'order-create'),
                routerLink: ['/user/ucompany/order']
            },
            {
                label: 'create',
                icon: 'pi pi-fw pi-desktop',
                visible: this.getAuthMenu(this.companyState, 'order-create'),
                routerLink: ['/user/ucompany/order/create'],
                queryParams: {orderMode: 'create-order'}

            },
            {
                label: 'Order Queue', icon: 'pi pi-fw pi-tag', visible: true, routerLink: ['/user/ucompany/order/queue/list']
            },

            {
                label: this.translateCode('mn', 'mn-fin-prod-style-setSubNodePrice'),
                visible: true, routerLink: ['/user/ucompany/financial/set/cost/style/subnode']
            },

        ];
        return megaMenuItems;
    }

    getMenuBarOrderOutsourceProgressTracking() {
        const megaMenuItems = [
            {
                label: 'view order',
                styleClass: 'text-lg font-bold', visible: true
            },
            // {
            //     label: 'view order queue',
            //     styleClass: 'text-lg font-bold', visible: true
            // },
            // {
            //     label: 'view queue set',
            //     styleClass: 'text-lg font-bold', visible: true
            // },
            // {
            //     label: 'print:  job card',
            //     styleClass: 'text-lg font-bold', visible: true
            // },
        ];
        return megaMenuItems;
    }

    // setYarnDataListenerToNext(viewMode: string) {
    //     this.yarnDataListener.next({
    //         viewMode: viewMode
    //     });
    // }

    getMenuBarYarnReport() {
        const megaMenuItems = [
            {
                label: 'Report',
                // icon: 'pi pi-fw pi-info-circle',
                visible: true,
                items: [
                    [
                        {
                            label: 'Summary Board',
                            items: [
                                {
                                    label: 'dashboard',
                                    visible: true,
                                },
                            ]
                        },
                        // {
                        //     label: '',
                        //     items: [
                        //         {
                        //             label: '.',
                        //             visible: true,
                        //         },
                        //     ]
                        // },
                    ],
                    [
                        {
                            label: 'Store Report',
                            items: [
                                {
                                    label: '[store] yarn transfer report',
                                    visible: true,
                                },
                            ]
                        },
                        // {
                        //     label: 'Store Usage',
                        //     visible: false,
                        //     items: [
                        //         {
                        //             label: 'store.Usage',
                        //             visible: false,
                        //         },

                        //     ]
                        // },
                        {
                            label: 'Store. Stock current',
                            items: [
                                {
                                    label: 'store.Stock',
                                    visible: true,
                                },

                            ]
                        },
                    ],
                    [
                        {
                            label: 'Factory Report',
                            items: [
                                {
                                    label: 'stock: cuurrent',
                                    visible: true,
                                },

                            ]
                        },
                        {
                            label: 'Factory Usage',
                            items: [
                                {
                                    label: 'Fac.Usage',
                                    visible: true,
                                },

                            ]
                        },
                    ],
                ]
            }
        ];
        return megaMenuItems;
    }

    getMenuBarYarn() {
        // console.log('getMenuBarProduct');
        const megaMenuItems = [
            {
                label: 'Yarn System',
                styleClass: 'text-lg font-bold'
            },
            {
                label: 'Yarn season',
                styleClass: 'text-base text-500'
            },
            {
                label: 'Yarn info',
                icon: 'pi pi-fw pi-info-circle', visible: false,
                items: [
                    [
                        {
                            label:  'Yarn info',
                            items: [
                                {
                                    label: 'Yarn dashboard',
                                    visible: true, routerLink: ['/user/ucompany/yarn/dashboard']
                                },
                                {
                                    label: 'Yarn list', visible: true, routerLink: ['/user/ucompany/yarn']
                                },
                            ]
                        },
                    ],
                    // [
                    //     {
                    //         label:  'Yarn stock card',
                    //         items: [
                    //             {
                    //                 label: 'stock card',
                    //                 visible: true, routerLink: ['/user/ucompany/yarn/stockcard']
                    //             },
                    //             // {
                    //             //     label: 'Yarn list', visible: true, routerLink: ['/user/ucompany/yarn']
                    //             // },
                    //         ]
                    //     },
                    // ],
                ]
            },
            {
                label: 'Yarn mangement',
                icon: 'pi pi-fw pi-server', visible: true,
                items: [
                    [
                        {
                            label: 'Yarn Manage',
                            items: [
                                {
                                    label: 'Yarn plan',
                                    visible: true,
                                    routerLink: ['/user/ucompany/yarn/manage/plan'],
                                    queryParams: {menuMode: 'yarn-plan', viewMode: 'plan'},
                                    command: () => {
                                        this.setYarnDataAroudAppListenerToNext('plan');
                                    }
                                    // routerLink: ['/user/ucompany/yarn/manage/create/plan'],
                                    // queryParams: {menuMode: 'create-yarn-plan'}
                                },

                                // {
                                //     label: 'Yarn receive (actual)',
                                //     visible: true,
                                //     routerLink: ['/user/ucompany/yarn/manage/receive/actual'],
                                //     queryParams: {menuMode: 'actual-yarn-receive'}
                                // },

                                // {
                                //     separator: true
                                // },

                                // {
                                //     label: 'Packing list',
                                //     visible: true,
                                //     routerLink: ['/user/ucompany/yarn/manage/packinglist'],
                                //     queryParams: {menuMode: 'yarn-packing-list'}
                                // },

                                // {
                                //     label: 'Packing list checking',
                                //     visible: true,
                                //     routerLink: ['/user/ucompany/yarn/manage/checking/packinglist'],
                                //     queryParams: {menuMode: 'yarn-checking-packing-list'}
                                // },
                            ]
                        },

                    ],
                    [
                        {
                            label: 'FACTORY: Yarn stock',
                            items: [

                                {
                                    label: 'stock',
                                    visible: true,
                                    // routerLink: ['/user/ucompany/yarn/manage/stock']
                                    routerLink: ['/user/ucompany/yarn/manage/plan'],
                                    queryParams: {menuMode: 'factory-stock', viewMode: 'factoryStock'},
                                    command: () => {
                                        this.setYarnDataAroudAppListenerToNext('factoryStock');
                                    }
                                },
                                // {
                                //     label: 'yarn transfer report',
                                //     visible: true,
                                //     // routerLink: ['/user/ucompany/yarn/manage/stock']
                                //     routerLink: ['/user/ucompany/yarn/manage/plan'],
                                //     queryParams: {menuMode: 'yarn-transfer-report', viewMode: 'yarnTransferReport'},
                                //     command: () => {
                                //         this.setYarnDataAroudAppListenerToNext('yarnTransferReport');
                                //     }
                                // },

                            ]
                        },
                    ],
                    [
                        {
                            label: 'Report',
                            items: [

                                {
                                    label: 'report',
                                    visible: true,
                                    // routerLink: ['/user/ucompany/yarn/manage/stock']
                                    routerLink: ['/user/ucompany/yarn/report'],
                                    // queryParams: {menuMode: 'factory-stock', viewMode: 'factoryStock'},
                                    command: () => {
                                        this.setYarnDataAroudAppListenerToNext('yarnReport');
                                    }
                                },


                            ]
                        },
                        // {
                        //     label: 'xxx',
                        //     items: [

                        //         {
                        //             label: 'xxx',
                        //             visible: true,
                        //             // routerLink: ['/user/ucompany/yarn/manage/stock']
                        //             routerLink: ['/user/ucompany/yarn/report'],
                        //             // queryParams: {menuMode: 'factory-stock', viewMode: 'factoryStock'},
                        //             command: () => {
                        //                 this.setYarnDataAroudAppListenerToNext('factoryStock');
                        //             }
                        //         },


                        //     ]
                        // },
                    ],
                    [
                        {
                            label: this.translateCode('mn', 'mn-setting'),
                            items: [

                                {
                                    label: this.translateCode('mn', 'mn-setting'),
                                    visible: true, routerLink: ['/user/ucompany/yarn/setting']
                                },
                            ]
                        },
                    ],
                ]
            },
            // {
            //     label: 'Order Queue', icon: 'pi pi-fw pi-tag', visible: true, routerLink: ['/user/ucompany/order/queue/list']
            // },

        ];
        return megaMenuItems;
    }

    getMenuBarHR() {
        // console.log('getMenuBarHR');
        const megaMenuItems = [
            {
                label: this.translateCode('mn', 'mn-hr'),
                styleClass: 'text-lg font-bold'
            },
            {
                label: this.translateCode('mn', 'mn-human-resource'),
                // icon: 'pi pi-fw pi-money-bill',
                visible: true,
                items: [
                    [
                        {
                            label: this.translateCode('mn', 'mn-manage'),
                            items: [
                                {
                                    label: this.translateCode('nu', 'nu-hr-staff-according-job-regist'),
                                    visible: true, routerLink: ['/user/ucompany/hr/regist/staff'],
                                    queryParams: {mode: 'create', modeType: 'staff-according-job'}
                                },
                                {
                                    label: this.translateCode('nu', 'nu-hr-staff-according-job-regist-edit'),
                                    visible: true, routerLink: ['/user/ucompany/hr/edit/staff'],
                                    queryParams: {mode: 'edit', modeType: 'staff-according-job'}
                                },
                            ]
                        },
                    ],
                ]
            },
            {
                label: this.translateCode('mn', 'mn-report'),
                // icon: 'pi pi-fw pi-money-bill',
                visible: true,
                items: [
                    [
                        // {
                        //     label: this.translateCode('nu', 'nu-production'),
                        //     items: [
                        //         {
                        //             label: this.translateCode('mn', 'mn-fin-rep-prod-style-setSubNodePrice'),
                        //             visible: true,
                        //             routerLink: ['/user/ucompany/financial/set/cost/style/subnode']
                        //         },
                        //         // {
                        //         //     label: 'product box',
                        //         //     visible: true, routerLink: ['/user/ucompany/transport/productbox']
                        //         // },

                        //     ]
                        // },

                        // {
                        //     label: 'xxx',
                        //     items: [
                        //         { label: 'xxx' , visible: true},
                        //         // { label: 'Men Item' },
                        //         // { label: 'Men Item' }
                        //     ]
                        // }
                    ],
                ]
            },

        ];

        // const megaMenuItems = [
        //     {
        //         label: 'Factory Name', styleClass: 'text-lg font-bold'
        //     },
        //     {
        //         label: this.translateCode('mn', 'mn-delivery'),
        //         icon: 'pi pi-fw pi-paperclip', visible: true,
        //         items: [
        //             [
        //                 {
        //                     label: 'manage',
        //                     items: [
        //                         {
        //                             label: this.translateCode('mn', 'mn-delivery'),
        //                             visible: true, routerLink: ['/user/ucompany/transport']
        //                         },
        //                         {
        //                             label: 'product box',
        //                             visible: true, routerLink: ['/user/ucompany/transport/productbox']
        //                         },
        //                     ]
        //                 },
        //             ],
        //         ]
        //     },
        //     {
        //         label: 'label tag',
        //         icon: 'pi pi-fw pi-tag', visible: true,
        //         items: [
        //             [
        //                 {
        //                     label: 'setting',
        //                     items: [
        //                         {
        //                             label: 'destination', // ##  labelCountry
        //                             visible: true, routerLink: ['/user/ucompany/transport/setting/destination']
        //                         },
        //                         {
        //                             label: 'tag group',  // ##  labelCountryGroup
        //                             visible: true, routerLink: ['/user/ucompany/transport/setting/taggroup']
        //                         },
        //                         {
        //                             label: 'label tag',  // ## labalTag
        //                             visible: true, routerLink: ['/user/ucompany/transport/setting/labeltag']
        //                         },
        //                         {
        //                             label: 'label tag register',  // ## labalTagData / label registration
        //                             visible: true, routerLink: ['/user/ucompany/transport/regist/labeltagregist']
        //                         },
        //                     ]
        //                 },
        //             ],
        //         ]
        //     },

        // ];



        // const megaMenuItems = [
        //     {
        //         label: 'Factory Name',
        //         styleClass: 'text-lg font-bold'
        //     },
        //     {
        //         label: this.seasonYear,
        //         styleClass: 'text-lg font-bold'
        //     },
        //     {
        //         label: 'Order',
        //         icon: 'pi pi-fw pi-tag',
        //         visible: true,
        //         // visible: this.getAuthMenu(this.companyState, 'order-create'),
        //         routerLink: ['/user/ucompany/order']
        //     },
        //     {
        //         label: 'create',
        //         icon: 'pi pi-fw pi-desktop',
        //         visible: this.getAuthMenu(this.companyState, 'order-create'),
        //         routerLink: ['/user/ucompany/order/create'],
        //         queryParams: {orderMode: 'create-order'}

        //     },
        //     {
        //         label: 'Order Queue', icon: 'pi pi-fw pi-tag', visible: true, routerLink: ['/user/ucompany/order/queue/list']
        //     },

        // ];
        return megaMenuItems;
    }

    getMenuBarWorkloadOverallReport() {
        const megaMenuItems = [
            {
                label: 'Workload Report',
                styleClass: 'text-lg font-bold'
            },

            // {
            //     label: 'workload',
            //     // icon: 'pi pi-fw pi-money-bill',
            //     visible: true,
            //     items: [
            //         [
            //             {
            //                 label: 'Daily',
            //                 items: [
            //                     {
            //                         label: this.translateCode('nu', 'nu-overall'),
            //                         visible: true,
            //                     },
            //                     {
            //                         label: 'personal',
            //                         visible: true,
            //                     },
            //                 ]
            //             },
            //         ],
            //     ]
            // },

            // {
            //     label: this.translateCode('mn', 'mn-report'),
            //     // icon: 'pi pi-fw pi-money-bill',
            //     visible: true,
            //     items: [
            //         [
            //             // {
            //             //     label: this.translateCode('nu', 'nu-production'),
            //             //     items: [
            //             //         {
            //             //             label: this.translateCode('mn', 'mn-fin-rep-prod-style-setSubNodePrice'),
            //             //             visible: true,
            //             //             routerLink: ['/user/ucompany/financial/set/cost/style/subnode']
            //             //         },
            //             //         // {
            //             //         //     label: 'product box',
            //             //         //     visible: true, routerLink: ['/user/ucompany/transport/productbox']
            //             //         // },

            //             //     ]
            //             // },

            //             // {
            //             //     label: 'xxx',
            //             //     items: [
            //             //         { label: 'xxx' , visible: true},
            //             //         // { label: 'Men Item' },
            //             //         // { label: 'Men Item' }
            //             //     ]
            //             // }
            //         ],
            //     ]
            // },

        ];
        return megaMenuItems;
    }

    getMenuBarFinancial() {
        const megaMenuItems = [
            {
                label: 'Factory Name', styleClass: 'text-lg font-bold'
            },
            {
                label: this.translateCode('mn', 'mn-accounting'),
                // label: 'accounting',
                // icon: 'pi pi-fw pi-money-bill',
                visible: true,
                items: [
                    [
                        {
                            label: this.translateCode('nu', 'nu-overall'),
                            items: [
                                {
                                    label: this.translateCode('nu', 'nu-acc-overall1'),
                                    visible: true,
                                    // routerLink: ['/user/ucompany/financial']
                                },
                            ]
                        },
                    ],
                ]
            },
            {
                label: this.translateCode('mn', 'mn-financial'),
                // icon: 'pi pi-fw pi-money-bill',
                visible: true,
                items: [
                    [
                        {
                            label: this.translateCode('nu', 'nu-overall'),
                            items: [
                                {
                                    label: this.translateCode('nu', 'nu-fin-overall1'),
                                    visible: true, routerLink: ['/user/ucompany/financial']
                                },
                            ]
                        },
                    ],
                ]
            },
            {
                label: this.translateCode('nu', 'nu-production'),
                // icon: 'pi pi-fw pi-money-bill',
                visible: true,
                items: [
                    [
                        {
                            label: this.translateCode('nu', 'nu-fin-setcost'),
                            items: [

                                {
                                    label: this.translateCode('mn', 'mn-fin-prod-style-setSubNodePrice'),
                                    visible: true, routerLink: ['/user/ucompany/financial/set/cost/style/subnode']
                                },
                                // {
                                //     label: 'product box',
                                //     visible: true, routerLink: ['/user/ucompany/transport/productbox']
                                // },

                            ]
                        },

                    ],
                ]
            },
            {
                label: this.translateCode('mn', 'mn-report'),
                // icon: 'pi pi-fw pi-money-bill',
                visible: true,
                items: [
                    [
                        {
                            label: this.translateCode('nu', 'nu-production'),
                            items: [
                                {
                                    label: 'sub node scanned',
                                    visible: true,
                                    routerLink: ['/user/ucompany/financial/scanned/subnode']
                                },
                                {
                                    label: this.translateCode('mn', 'mn-fin-rep-prod-style-setSubNodePrice'),
                                    visible: true,
                                    routerLink: ['/user/ucompany/financial/set/cost/style/subnode']
                                },
                            ]
                        },
                    ],
                ]
            },

            {
                label: 'setting',
                // icon: 'pi pi-fw pi-money-bill',
                visible: true,
                items: [
                    [
                        {
                            label: 'setting1',
                            items: [
                                {
                                    label: 'setting',
                                    visible: true,
                                    routerLink: ['/user/ucompany/financial/setting/setting']
                                },
                                // {
                                //     label: this.translateCode('mn', 'mn-fin-rep-prod-style-setSubNodePrice'),
                                //     visible: true,
                                //     routerLink: ['/user/ucompany/financial/set/cost/style/subnode']
                                // },
                            ]
                        },
                    ],
                ]
            },

            // {
            //     label: 'create', icon: 'pi pi-fw pi-desktop', visible: true, routerLink: ['/user/ucompany/yarn/create'],
            //     queryParams: {yarnMode: 'create-yarn'}

            // },
            // {
            //     label: 'Order Queue', icon: 'pi pi-fw pi-tag', visible: true, routerLink: ['/user/ucompany/order/queue/list']
            // },
            // {
            //     label: 'Factory Name',
            //     styleClass: 'text-lg font-bold w-12'
            // },

        ];
        return megaMenuItems;
    }

    getMenuBarTransport() {
        const megaMenuItems = [
            {
                label: '', styleClass: 'text-lg font-bold'
            },
            {
                label: 'dashboard', styleClass: '', routerLink: ['/user/ucompany/transport']
            },
            {
                label: this.translateCode('mn', 'mn-delivery'),
                icon: 'pi pi-fw pi-truck', visible: true,
                items: [
                    [
                        {
                            label: 'manage',
                            items: [
                                {
                                    label: this.translateCode('mn', 'mn-delivery'),
                                    visible: true, routerLink: ['/user/ucompany/transport/manage']
                                },
                            ]
                        },
                    ],
                ]
            },
            {
                label: 'Packing Progress',
                icon: 'pi pi-fw pi-check-circle', visible: true,
                items: [
                    [
                        {
                            label: 'staff manage',
                            items: [
                                {
                                    label: 'Checking',
                                    visible: true, routerLink: ['/user/ucompany/transport/managec/checking']
                                },
                            ]
                        },
                    ],
                ]
            },
            {
                label: 'setting',
                icon: 'pi pi-fw pi-setting',
                // visible: true,
                visible: this.isAdmin() || this.getMenuAutor(this.userID, 'transport-setting', 'normal'),
                // visible: this.isAdmin(),
                items: [
                    [
                        {
                            label: 'setting',
                            items: [
                                {
                                    label: 'destination', // ##  labelCountry
                                    visible: true,
                                    routerLink: ['/user/ucompany/transport/setting/destination']
                                },
                                {
                                    label: 'product box',
                                    visible: true,
                                    routerLink: ['/user/ucompany/transport/productbox']
                                },
                                {
                                    label: 'tag group',  // ##  labelCountryGroup
                                    visible: true
                                    , routerLink: ['/user/ucompany/transport/setting/taggroup']
                                },
                                {
                                    label: 'label tag',  // ## labalTag
                                    visible: true,
                                    routerLink: ['/user/ucompany/transport/setting/labeltag']
                                },
                                {
                                    label: 'label tag register',  // ## labalTagData / label registration
                                    visible: true,
                                    routerLink: ['/user/ucompany/transport/regist/labeltagregist']
                                },
                                // {
                                //     label: 'create', icon: 'pi pi-fw pi-desktop', visible: true, routerLink: ['/user/ucompany/yarn/create'],
                                //     queryParams: {yarnMode: 'create-yarn'}

                                // },
                                // { label: 'product2' , routerLink: ['/user/ufactory/dashboard/db2'], visible: true },
                                // { label: 'Profile', visible: true },
                                // { label: 'product......', visible: true, disabled: true },
                                // { label: 'product3', visible: true, icon: 'pi pi-plus' },
                                // // { label: 'product4', visible: true, separator: true },
                                // { label: 'title', visible: true, title:'title' },
                            ]
                        },
                        // {
                        //     label: 'xxx',
                        //     items: [
                        //         { label: 'xxx' , visible: true},
                        //         // { label: 'Men Item' },
                        //         // { label: 'Men Item' }
                        //     ]
                        // }
                    ],
                ]
            },
            // {
            //     label: 'create', icon: 'pi pi-fw pi-desktop', visible: true, routerLink: ['/user/ucompany/yarn/create'],
            //     queryParams: {yarnMode: 'create-yarn'}

            // },
            // {
            //     label: 'Order Queue', icon: 'pi pi-fw pi-tag', visible: true, routerLink: ['/user/ucompany/order/queue/list']
            // },

        ];
        return megaMenuItems;
    }

    getMenuBarOrderQueueProduction() {
        const megaMenuItems = [
            {
                label: 'create order queue',
                styleClass: 'text-lg font-bold', visible: true
            },
            {
                label: '', // view order queue
                styleClass: 'text-lg font-bold', visible: true,
                disabled: true,
            },
            {
                label: 'view queue set',
                styleClass: 'text-lg font-bold', visible: true
            },
            {
                label: 'print:  job card',
                styleClass: 'text-lg font-bold', visible: true
            },
            {
                label: 'set YARN production',
                styleClass: 'text-lg font-bold', visible: false
            },
            {
                label: 'set max QTY view',
                styleClass: 'text-lg font-bold', visible: true
            },
        ];
        return megaMenuItems;
    }

    getMenuBarUFProfileSetting() {
        const megaMenuItems = [
            {
                label: 'User Name', styleClass: 'text-lg font-bold'
            },
            {
                label: this.translateCode('mn', 'mn-userProfile'),
                icon: 'pi pi-fw pi-tag', visible: true, routerLink: ['/user/uprofile']
            },
            // {
            //     label: 'Member', icon: 'pi pi-fw pi-desktop',
            //     items: [
            //         [
            //             {
            //                 label: 'm.management',
            //                 items: [{ label: 'member list' }, { label: 'member invitation' }]
            //             },
            //             // {
            //             //     label: 'Camcorder',
            //             //     items: [{ label: 'Camcorder Item' }, { label: 'Camcorder Item' }, { label: 'Camcorder Item' }]
            //             // }
            //         ],
            //         // [
            //         //     {
            //         //         label: 'Join company',
            //         //         items: [
            //         //             { label: 'join' },
            //         //             // { label: 'join list' }
            //         //         ]
            //         //     },
            //         //     // {
            //         //     //     label: 'Audio',
            //         //     //     items: [{ label: 'Audio Item' }, { label: 'Audio Item' }, { label: 'Audio Item' }]
            //         //     // }
            //         // ],
            //         // [
            //         //     {
            //         //         label: 'Sports.7',
            //         //         items: [{ label: 'Sports.7.1' }, { label: 'Sports.7.2' }]
            //         //     }
            //         // ]
            //     ]
            // },
            // {
            //     label: 'User', icon: 'pi pi-fw pi-image',
            //     items: [
            //         [
            //             {
            //                 label: 'user management',
            //                 items: [{ label: 'List' }, { label: 'Create User' }, { label: 'Edit User' }]
            //             },
            //             // {
            //             //     label: 'Kitchen',
            //             //     items: [{ label: 'Kitchen Item' }, { label: 'Kitchen Item' }, { label: 'Kitchen Item' }]
            //             // }
            //         ],
            //         // [
            //         //     {
            //         //         label: 'Bedroom',
            //         //         items: [{ label: 'Bedroom Item' }, { label: 'Bedroom Item' }]
            //         //     },
            //         //     {
            //         //         label: 'Outdoor',
            //         //         items: [{ label: 'Outdoor Item' }, { label: 'Outdoor Item' }, { label: 'Outdoor Item' }]
            //         //     }
            //         // ]
            //     ]
            // },
            // {
            //     label: 'Sports', icon: 'pi pi-fw pi-star',
            //     items: [
            //         [
            //             {
            //                 label: 'Basketball',
            //                 items: [{ label: 'Basketball Item' }, { label: 'Basketball Item' }]
            //             },
            //             {
            //                 label: 'Football',
            //                 items: [{ label: 'Football Item' }, { label: 'Football Item' }, { label: 'Football Item' }]
            //             }
            //         ],
            //         [
            //             {
            //                 label: 'Tennis',
            //                 items: [{ label: 'Tennis Item' }, { label: 'Tennis Item' }]
            //             }
            //         ]
            //     ]
            // },
        ];
        return megaMenuItems;
    }

    getMenuBarUFactorySetting() {
        const megaMenuItems = [
            {
                label: 'Factory Name', styleClass: 'text-lg font-bold'
            },
            {
                label: this.translateCode('hd', 'hd-fac-setting'),
                icon: 'pi pi-fw pi-tag', visible: true, routerLink: ['/user/ufactory/setting']
            },
            {
                label: this.translateCode('mn', 'mn-user'),
                icon: 'pi pi-fw pi-image', visible: true, routerLink: ['/user/ufactory/setting/user']
            },

                // items: [
                //     [
                //         {
                //             label: '',
                //             items: [
                //                 // { label: 'product1' , routerLink: ['/user/ufactory/dashboard/db1'], visible: true },
                //                 // { label: 'product2' , routerLink: ['/user/ufactory/dashboard/db2'], visible: true },
                //                 { label: 'Profile', visible: true, routerLink: ['/user/ucompany/setting'] },
                //                 // { label: 'product......', visible: true, disabled: true },
                //                 // { label: 'product3', visible: true, icon: 'pi pi-plus' },
                //                 // // { label: 'product4', visible: true, separator: true },
                //                 // { label: 'title', visible: true, title:'title' },
                //             ]
                //         },
                //         // {
                //         //     label: 'Men',
                //         //     items: [{ label: 'Men Item' }, { label: 'Men Item' }, { label: 'Men Item' }]
                //         // }
                //     ],
                //     // [
                //     //     {
                //     //         label: 'Kids',
                //     //         items: [{ label: 'Kids Item' }, { label: 'Kids Item' }]
                //     //     },
                //     //     {
                //     //         label: 'Luggage',
                //     //         items: [{ label: 'Luggage Item' }, { label: 'Luggage Item' }, { label: 'Luggage Item' }]
                //     //     }
                //     // ]
                // ]

            // {
            //     label: 'Member', icon: 'pi pi-fw pi-desktop',
            //     items: [
            //         [
            //             {
            //                 label: 'm.management',
            //                 items: [{ label: 'member list' }, { label: 'member invitation' }]
            //             },
            //             // {
            //             //     label: 'Camcorder',
            //             //     items: [{ label: 'Camcorder Item' }, { label: 'Camcorder Item' }, { label: 'Camcorder Item' }]
            //             // }
            //         ],
            //         // [
            //         //     {
            //         //         label: 'Join company',
            //         //         items: [
            //         //             { label: 'join' },
            //         //             // { label: 'join list' }
            //         //         ]
            //         //     },
            //         //     // {
            //         //     //     label: 'Audio',
            //         //     //     items: [{ label: 'Audio Item' }, { label: 'Audio Item' }, { label: 'Audio Item' }]
            //         //     // }
            //         // ],
            //         // [
            //         //     {
            //         //         label: 'Sports.7',
            //         //         items: [{ label: 'Sports.7.1' }, { label: 'Sports.7.2' }]
            //         //     }
            //         // ]
            //     ]
            // },

            {
                label: 'Production-Line setting', icon: 'pi pi-fw pi-star', visible: true,
                items: [
                    [
                        {
                            label: this.translateCode('mn', 'mn-node'),  // this.translateCode('mn', 'mn-customer'),
                            items: [
                                { label: 'create' , visible: true, routerLink: ['/user/ufactory/station']},
                                { label: 'node list' , visible: true, routerLink: ['/user/ufactory/station/list']},
                                // { label: 'product2' , routerLink: ['/user/ufactory/dashboard/db2'], visible: true },
                                // { label: 'Profile', visible: true, routerLink: ['/user/ucompany/setting'] },
                                // { label: 'product......', visible: true, disabled: true },
                                // { label: 'product3', visible: true, icon: 'pi pi-plus' },
                                // // { label: 'product4', visible: true, separator: true },
                                // { label: 'title', visible: true, title:'title' },
                            ]
                        },
                        {
                            label: this.translateCode('nu', 'nu-productionLine'),
                            items: [
                                { label: this.translateCode('mn', 'mn-create'),
                                visible: true, routerLink: ['/user/ufactory/station/productionline/create']},
                                // { label: 'Men Item' },
                                // { label: 'Men Item' }
                            ]
                        }
                    ],
                    // [
                    //     {
                    //         label: 'Kids',
                    //         items: [{ label: 'Kids Item' }, { label: 'Kids Item' }]
                    //     },
                    //     {
                    //         label: 'Luggage',
                    //         items: [{ label: 'Luggage Item' }, { label: 'Luggage Item' }, { label: 'Luggage Item' }]
                    //     }
                    // ]
                ]
            },
        ];
        return megaMenuItems;
    }

    getMenuBarUCompanySetting() {
        // console.log('getMenuBarUCompanySetting');
        const megaMenuItems = [
            {
                label: 'Company Name', styleClass: 'text-lg font-bold'
            },
            {
                label: this.translateCode('mn', 'mn-companyProfile'), // this.translateCode('mn', 'mn-companyProfile'),
                icon: 'pi pi-fw pi-tag', visible: true, routerLink: ['/user/ucompany/setting']
            },
            {
                label: this.translateCode('mn', 'mn-member'),
                icon: 'pi pi-fw pi-image', visible: true, routerLink: ['/user/ucompany/setting/member']
            },
            {
                label: this.translateCode('mn', 'mn-customer'),
                icon: 'pi pi-fw pi-image', visible: true, routerLink: ['/user/ucompany/setting/customer']
            },

                // items: [
                //     [
                //         {
                //             label: '',
                //             items: [
                //                 // { label: 'product1' , routerLink: ['/user/ufactory/dashboard/db1'], visible: true },
                //                 // { label: 'product2' , routerLink: ['/user/ufactory/dashboard/db2'], visible: true },
                //                 { label: 'Profile', visible: true, routerLink: ['/user/ucompany/setting'] },
                //                 // { label: 'product......', visible: true, disabled: true },
                //                 // { label: 'product3', visible: true, icon: 'pi pi-plus' },
                //                 // // { label: 'product4', visible: true, separator: true },
                //                 // { label: 'title', visible: true, title:'title' },
                //             ]
                //         },
                //         // {
                //         //     label: 'Men',
                //         //     items: [{ label: 'Men Item' }, { label: 'Men Item' }, { label: 'Men Item' }]
                //         // }
                //     ],
                //     // [
                //     //     {
                //     //         label: 'Kids',
                //     //         items: [{ label: 'Kids Item' }, { label: 'Kids Item' }]
                //     //     },
                //     //     {
                //     //         label: 'Luggage',
                //     //         items: [{ label: 'Luggage Item' }, { label: 'Luggage Item' }, { label: 'Luggage Item' }]
                //     //     }
                //     // ]
                // ]

            // {
            //     label: 'Member', icon: 'pi pi-fw pi-desktop',
            //     items: [
            //         [
            //             {
            //                 label: 'm.management',
            //                 items: [{ label: 'member list' }, { label: 'member invitation' }]
            //             },
            //             // {
            //             //     label: 'Camcorder',
            //             //     items: [{ label: 'Camcorder Item' }, { label: 'Camcorder Item' }, { label: 'Camcorder Item' }]
            //             // }
            //         ],
            //         // [
            //         //     {
            //         //         label: 'Join company',
            //         //         items: [
            //         //             { label: 'join' },
            //         //             // { label: 'join list' }
            //         //         ]
            //         //     },
            //         //     // {
            //         //     //     label: 'Audio',
            //         //     //     items: [{ label: 'Audio Item' }, { label: 'Audio Item' }, { label: 'Audio Item' }]
            //         //     // }
            //         // ],
            //         // [
            //         //     {
            //         //         label: 'Sports.7',
            //         //         items: [{ label: 'Sports.7.1' }, { label: 'Sports.7.2' }]
            //         //     }
            //         // ]
            //     ]
            // },
            // {
            //     label: 'User', icon: 'pi pi-fw pi-image',
            //     items: [
            //         [
            //             {
            //                 label: 'user management',
            //                 items: [{ label: 'List' }, { label: 'Create User' }, { label: 'Edit User' }]
            //             },
            //             // {
            //             //     label: 'Kitchen',
            //             //     items: [{ label: 'Kitchen Item' }, { label: 'Kitchen Item' }, { label: 'Kitchen Item' }]
            //             // }
            //         ],
            //         // [
            //         //     {
            //         //         label: 'Bedroom',
            //         //         items: [{ label: 'Bedroom Item' }, { label: 'Bedroom Item' }]
            //         //     },
            //         //     {
            //         //         label: 'Outdoor',
            //         //         items: [{ label: 'Outdoor Item' }, { label: 'Outdoor Item' }, { label: 'Outdoor Item' }]
            //         //     }
            //         // ]
            //     ]
            // },
            // {
            //     label: 'Sports', icon: 'pi pi-fw pi-star',
            //     items: [
            //         [
            //             {
            //                 label: 'Basketball',
            //                 items: [{ label: 'Basketball Item' }, { label: 'Basketball Item' }]
            //             },
            //             {
            //                 label: 'Football',
            //                 items: [{ label: 'Football Item' }, { label: 'Football Item' }, { label: 'Football Item' }]
            //             }
            //         ],
            //         [
            //             {
            //                 label: 'Tennis',
            //                 items: [{ label: 'Tennis Item' }, { label: 'Tennis Item' }]
            //             }
            //         ]
            //     ]
            // },
        ];
        return megaMenuItems;
    }

    getMenuBarUCompanyDashboard() {
        const megaMenuItems = [
            {
                label: 'Production setting',  // this.translateCode('mn', 'mn-factory'),
                icon: 'pi pi-fw pi-building', visible: true,
                items: [

                    // [
                    //     {
                    //         label: 'factory selection',
                    //         items: [
                    //             // { label: 'factory 1' , visible: true},
                    //             // { label: 'factory 2' , visible: true},
                    //             // { label: 'factory 3' , visible: true},
                    //             // { label: 'product2' , routerLink: ['/user/ufactory/dashboard/db2'], visible: true },
                    //             // { label: 'Profile', visible: true, routerLink: ['/user/ucompany/setting'] },
                    //             // { label: 'product......', visible: true, disabled: true },
                    //             // { label: 'product3', visible: true, icon: 'pi pi-plus' },
                    //             // // { label: 'product4', visible: true, separator: true },
                    //             // { label: 'title', visible: true, title:'title' },
                    //         ]
                    //     },
                    // ],

                    // [
                    //     {
                    //         label: 'factory selection',
                    //         items: [
                    //             // { label: 'factory 1' , visible: true},
                    //             // { label: 'factory 2' , visible: true},
                    //             // { label: 'factory 3' , visible: true},
                    //             // { label: 'product2' , routerLink: ['/user/ufactory/dashboard/db2'], visible: true },
                    //             // { label: 'Profile', visible: true, routerLink: ['/user/ucompany/setting'] },
                    //             // { label: 'product......', visible: true, disabled: true },
                    //             // { label: 'product3', visible: true, icon: 'pi pi-plus' },
                    //             // // { label: 'product4', visible: true, separator: true },
                    //             // { label: 'title', visible: true, title:'title' },
                    //         ]
                    //     },
                    // ],
                ]
            },
            {
                label: 'Factory Name', styleClass: 'text-lg font-bold'
            },
        ];
        return megaMenuItems;
    }

    getMenuBarUFactoryDashboard() {
        const megaMenuItems = [
            {
                label: 'Factory Name', styleClass: 'text-lg font-bold'
            },
            {
                label: this.translateCode('mn', 'mn-factory'),
                icon: 'pi pi-fw pi-tag', visible: true, routerLink: ['/user/ufactory/dashboard']
            },

            // {
            //     label: 'Member', icon: 'pi pi-fw pi-desktop',
            //     items: [
            //         [
            //             {
            //                 label: 'm.management',
            //                 items: [{ label: 'member list' }, { label: 'member invitation' }]
            //             },
            //         ],
            //     ]
            // },

            // {
            //     label: 'User', icon: 'pi pi-fw pi-image',
            //     items: [
            //         [
            //             {
            //                 label: 'user management',
            //                 items: [{ label: 'List' }, { label: 'Create User' }, { label: 'Edit User' }]
            //             },
            //         ],
            //     ]
            // },
        ];
        return megaMenuItems;
    }

    // ## menu bar ########################################################
    // #######################################################################




    // #######################################################################
    // ## static data ########################################################
    charE = [
        'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l','m', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'
    ];

    getCharENext(str: string): string {
        if (str === '*' || str.length === 0 || str.length > 1) {
            return 'a';
        }
        // const charEF = this.charE.filter(i=>i == str);
        const idx = this.charE.findIndex( fi =>(fi === str));
        if (idx < 0) {
            return 'a';
        } else if (idx <= this.charE.length - 1) {
            return this.charE[idx+1];
        } else {
            return 'a';
        }
        return 'a';
    }

    dD = [
        {numName: 1, dayShortName: 'Mon', dayName: 'Monday'},
        {numName: 2, dayShortName: 'Tue', dayName: 'Tuesday'},
        {numName: 3, dayShortName: 'Wed', dayName: 'Wednesday'},
        {numName: 4, dayShortName: 'Thu', dayName: 'Thursday'},
        {numName: 5, dayShortName: 'Fri', dayName: 'Friday'},
        {numName: 6, dayShortName: 'Sat', dayName: 'Saturday'},
        {numName: 7, dayShortName: 'Sun', dayName: 'Sunday'},
    ];
    mM = [
        {monthID: '01', monthShortName: 'Jan', monthFullName: 'January'},
        {monthID: '02', monthShortName: 'Feb', monthFullName: 'February'},
        {monthID: '03', monthShortName: 'Mar', monthFullName: 'March'},
        {monthID: '04', monthShortName: 'Apr', monthFullName: 'April'},
        {monthID: '05', monthShortName: 'May', monthFullName: 'May'},
        {monthID: '06', monthShortName: 'Jun', monthFullName: 'June'},
        {monthID: '07', monthShortName: 'Jul', monthFullName: 'July'},
        {monthID: '08', monthShortName: 'Aug', monthFullName: 'August'},
        {monthID: '09', monthShortName: 'Sep', monthFullName: 'September'},
        {monthID: '10', monthShortName: 'Oct', monthFullName: 'October'},
        {monthID: '11', monthShortName: 'Nov', monthFullName: 'November'},
        {monthID: '12', monthShortName: 'Dec', monthFullName: 'December'},
    ];

    // ## mode = short , full
    getMonthNamebyID(monthID: string, mode: 'short'|'full'): string {
        const month = this.mM.filter(i=>i.monthID == monthID);
        if (mode === 'short') { return month.length > 0 ? month[0].monthShortName:'';}
        else if (mode === 'full') { return month.length > 0 ? month[0].monthFullName:'';}
        else { return ''}
    }

    getYYYYMMDDInfo(yyyymmdd: string) {
        const info: any ={
            yyyy: yyyymmdd.substr(0, 4),
            mm: yyyymmdd.substr(4, 2),
            dd: yyyymmdd.substr(6, 2),
        };
        return info;
    }

    getDateShortByYYYYMMDD(yyyymmdd: string, formatStr: 'ddMMM'|'ddMMMyyyy'|'MMMdd',
                            mode: 'short'|'full', sign: string) {
        const dateInfo = this.getYYYYMMDDInfo(yyyymmdd);
        const yyyy = dateInfo.yyyy;
        const mm = dateInfo.mm;
        const dd = dateInfo.dd;
        const monthName = this.getMonthNamebyID(mm, mode);
        let dateName = '';
        if (formatStr === 'ddMMM') { dateName = dd+sign+monthName; }
        else if (formatStr === 'ddMMMyyyy') { dateName = dd+sign+monthName+sign+yyyy; }
        else if (formatStr === 'MMMdd') { dateName = monthName+sign+dd; }
        return dateName
    }

    // getDateFullByYYYYMMDD(yyyymmdd: string, formatStr: 'ddMMM'|'MMMdd', mode: 'short'|'full', sign: string) {
    //     const dateInfo = this.getYYYYMMDDInfo(yyyymmdd);
    //     const yyyy = dateInfo.yyyy;
    //     const mm = dateInfo.mm;
    //     const dd = dateInfo.dd;
    //     let monthName = this.getMonthNamebyID(mm, mode);
    // }



    // ## static data ########################################################
    // #######################################################################

}


