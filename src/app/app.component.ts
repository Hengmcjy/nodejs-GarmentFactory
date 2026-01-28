import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {
    ConfirmationService,
    MessageService,
    PrimeNGConfig,
} from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import { Subscription } from 'rxjs';
import { UserService } from './services/user.service';
import { Company, Factory, ScreenInfo } from './models/app.model';
import { SocketIOService } from './services/socketio.service';
import { NodeStationService } from './services/node-station.service';
import { StorageService } from './services/storage.service';
import { NodeStation, NodeStationLoginRequest } from './models/workstation.model';
import { SWaitResponseUsernodeLoginComponent } from './shared/components/general/s-wait-response-usernode-login/s-wait-response-usernode-login.component';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    providers: [MessageService, ConfirmationService, DialogService],
})
export class AppComponent implements OnInit, OnDestroy {
    formName = 'main-page';

    // ##
    uuid4: string = '';
    uuid5: string = '';
    isAuthenticated = false;  // ## logged in ?
    screenSize = '';
    initialLang = 'en';
    lang = 'en';
    keyConfirmlink = '';
    closable = false;

    // langs: Language[] = this.userService.langs;
    testData: any = {
        data1: '123',
        server: ''
    };

    //## screen width
    screenWidth = 0;

    deviceInfo: any = null;
    monthName: string[] = ['มกราคม','February','March','April','May','June','July','August','September','October','November','December'];



    private sockio: Subscription = new Subscription;
    // private ioRequestLoginNode: Subscription = new Subscription;
    private dataAroundAppSub: Subscription = new Subscription;
    // private screenSub: Subscription = new Subscription;
    private errSub: Subscription = new Subscription;
    private langSub: Subscription = new Subscription;
    private langListSub: Subscription = new Subscription;
    private getUserNodeLoginWaitSub: Subscription = new Subscription;

    constructor(

        private primengConfig: PrimeNGConfig,
        public dialogService: DialogService,
        private confirmationService: ConfirmationService,
        public messageService: MessageService,
        private router: Router,

        private socketService: SocketIOService,
        private userService: UserService,
        private nsService: NodeStationService,
        private storageService: StorageService,
    ) {}

    async ngOnInit() {
        this.primengConfig.ripple = true;

        // ## get DataAroundApp
        // ## user auth  isAuthenticated / dataAroundApp
        this.isAuthenticated = this.userService.getIsAuth();
        this.dataAroundAppSub = this.userService.getDataAroundAppStatusListener().subscribe(dataAroundApp => {
            // ## declare initial variable from service user
            this.isAuthenticated = dataAroundApp.isAuthenticated;
            this.screenSize = dataAroundApp.screenSize;
            // console.log('screenSizeInfo : ' , this.screenSize);
            // console.log('isAuthenticated : ' , this.isAuthenticated);
            if (this.isAuthenticated) { // ## user logged in already

            } else {  // ## user no login

            }
        });

        // ## get screen width at the begining
        this.screenWidth = window.innerWidth;
        let screenInfo: ScreenInfo = {
            screenWidth: this.screenWidth,
            screenHeight: 0,
            screenSize: ''
        };
        this.userService.findScreenSize(screenInfo);
        // console.log('screen width : ', this.screenWidth);

        // ## observ err
        this.errSub = this.userService.getErrorStatusListener().subscribe(errObj => {
            // console.log(errObj);
        });

        // ## get user node station login
        this.getUserNodeLoginWaitUpdatedListener();

        // ## get current lang and set app language
        this.langSub = this.userService.getLang.subscribe(langu => {
            if (langu) {
                // console.log('langSub : ');
                // this.setLang(langu);

                // ## set defualt primeng config language
                this.setPrimengConfig();


            }
            // console.log('langu : ', langu);
        });
        const langg = await this.userService.getLangCurrent();
        // if (langg !== '' || langg != null) { this.setLang(langg); }
        // else { this.setLang('en'); }

        this.langListSub = this.userService.getLangsListUpdatedListener().subscribe((data) => {
            // ## after get generatl info all

            // console.log('langListSub : ');
            // test
            this.socketService.sendMessage(this.testData, 'iomessage', 'user', 'test1');
            // this.showConfirm();

            // ## set defualt primeng config language
            this.setPrimengConfig();

            this.getNewMessage();
            // this.getIORequestLoginNode();
        });

        // // ## screenSub
        // this.screenSub = this.userService.getScreenStatusListener()
        //     .pipe(debounceTime(1000))
        //     .subscribe((screenInfo: ScreenInfo)=> {
        //     // console.log('screenInfo : ' , screenInfo);
        //     this.userService.findScreenSize(screenInfo);
        //     });

        // ## get device info
        // this.epicFunction();

        // // ## get uuid
        // this.getUUID();
        // console.log(this.userService.returnYYYYMMDDHHMMSS());

        // ## get general info
        this.userService.getGeneralInfo('', this.initialLang, 899);

        // // ## auto login
        // this.userService.autoAuthUserAndDeviceInfo();

        // const days = '["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"]';
        // console.log(JSON.parse(days));



    }

    getNewMessage() {
        // ## get new message socketIO
        if (this.sockio) { this.sockio.unsubscribe(); }
        this.sockio = this.socketService.getNewMessage().subscribe((msgio: any) => {
            // console.log('my socketIO ID : ',this.socketService.socket.id);
            // console.log('app-root socketIO : ', msgio);
            // ## check return message value
        });
    }

    // getIORequestLoginNode() {
    //     if (this.ioRequestLoginNode) { this.ioRequestLoginNode.unsubscribe(); }
    //     this.ioRequestLoginNode = this.socketService.getIORequestLoginNode().subscribe((msgio: any) => {
    //         // console.log('my socketIO ID : ',this.socketService.socket.id);
    //         console.log('app-root socketIO : ', msgio);
    //         // ## check return message value
    //     });
    // }

    getUserNodeLoginWaitUpdatedListener() {
        if (this.getUserNodeLoginWaitSub) { this.getUserNodeLoginWaitSub.unsubscribe(); }
        this.getUserNodeLoginWaitSub = this.userService
        .getUserNodeLoginWaitUpdatedListener().subscribe((data) => {
            this.showUserNodeLoginWaitResponseModal(
                data.nodeStation, data.stationID, data.company, data.factory,
                data.nodeStationLoginRequest
                );
        });
    }

    setPrimengConfig() {
        // console.log(this.userService.langData);
        if (this.userService.langData.languageID !== null) {
            if (this.userService.langData.languageID.length > 0) {
                const primengConfig = {
                    startsWith: this.translateCode('pc', 'startsWith'),
                    contains: this.translateCode('pc', 'contains'),
                    notContains: this.translateCode('pc', 'notContains'),
                    endsWith: this.translateCode('pc', 'endsWith'),
                    equals: this.translateCode('pc', 'equals'),
                    notEquals: this.translateCode('pc', 'notEquals'),
                    noFilter: this.translateCode('pc', 'noFilter'),
                    lt: this.translateCode('pc', 'lt'),
                    lte: this.translateCode('pc', 'lte'),
                    gt: this.translateCode('pc', 'gt'),
                    gte: this.translateCode('pc', 'gte'),
                    is: this.translateCode('pc', 'is'),
                    isNot: this.translateCode('pc', 'isNot'),
                    before: this.translateCode('pc', 'before'),
                    after: this.translateCode('pc', 'after'),
                    dateIs: this.translateCode('pc', 'dateIs'),
                    dateIsNot: this.translateCode('pc', 'dateIsNot'),
                    dateBefore: this.translateCode('pc', 'dateBefore'),
                    dateAfter: this.translateCode('pc', 'dateAfter'),
                    clear: this.translateCode('pc', 'clear'),
                    apply: this.translateCode('pc', 'apply'),
                    matchAll: this.translateCode('pc', 'matchAll'),
                    matchAny: this.translateCode('pc', 'matchAny'),
                    addRule: this.translateCode('pc', 'addRule'),
                    removeRule: this.translateCode('pc', 'removeRule'),
                    accept: this.translateCode('pc', 'accept'),
                    reject: this.translateCode('pc', 'reject'),
                    choose: this.translateCode('pc', 'choose'),
                    upload: this.translateCode('pc', 'upload'),
                    cancel: this.translateCode('pc', 'cancel'),
                    dayNames: JSON.parse(this.translateCode('pc', 'dayNames')),
                    dayNamesShort: JSON.parse(this.translateCode('pc', 'dayNamesShort')),
                    dayNamesMin: JSON.parse(this.translateCode('pc', 'dayNamesMin')),
                    monthNames: JSON.parse(this.translateCode('pc', 'monthNames')),
                    monthNamesShort: JSON.parse(this.translateCode('pc', 'monthNamesShort')),
                    dateFormat: this.translateCode('pc', 'dateFormat'),
                    firstDayOfWeek: +this.translateCode('pc', 'firstDayOfWeek'), // ## 0
                    today: this.translateCode('pc', 'today'),
                    weekHeader: this.translateCode('pc', 'weekHeader'),
                    weak: this.translateCode('pc', 'weak'),
                    medium: this.translateCode('pc', 'medium'),
                    strong: this.translateCode('pc', 'strong'),
                    passwordPrompt: this.translateCode('pc', 'passwordPrompt'),
                    emptyMessage: this.translateCode('pc', 'emptyMessage'),
                    emptyFilterMessage: this.translateCode('pc', 'emptyFilterMessage')
                };

                // console.log(primengConfig);
                this.primengConfig.ripple = true;
                this.primengConfig.setTranslation(primengConfig);

                // this.primengConfig.setTranslation({
                //     accept: 'Accept',
                //     reject: 'reject',
                //     monthNames: this.monthName,
                //     weak:'ไม่ปลอดภัย'
                //     //translations
                //     //## set all lang  manually at i18n
                //     // https://www.primefaces.org/primeng/i18n
                // });
            }
        }
    }

    translateCode(lType: string, lID: string) {
        const languageDataText = this.userService.translateCode(lType, lID);
        return languageDataText;
    }

    // setLang(lang: string) {
    //     // // this language will be used as a fallback when a translation isn't found in the current language
    //     // this.translate.setDefaultLang(lang);
    //     // the lang to use, if the lang isn't available, it will use the current loader to get them
    //     // console.log('lang : ' , lang);
    //     // console.log('this.userService.langData.languageID : ' , this.userService.langData.languageID);

    //     this.translate.use(lang);
    //     this.initialLang = lang;
    //     if (this.userService.langData.languageID) {
    //         if (this.userService.langData.languageID !== lang) {
    //             this.userService.getLangData(lang);
    //         }
    //     }

    //     // console.log('setLang : ' + lang);
    //   }

    //## get screen size, resize
    onResize(event: any) {
        // ## sm 576 - 767 px   - mobile
        // ## md 768 - 991 px   -  moblie, tablet
        // ## lg 992 - 1999 px   -  tablet
        // ## xl 1200+ px up     -  tablet
        this.screenWidth = event.target.innerWidth;
        let screenInfo: ScreenInfo = {
            screenWidth: this.screenWidth,
            screenHeight: 0,
            screenSize: ''
        };
        screenInfo = this.userService.findScreenSize(screenInfo);
        // console.log('screen width : ', screenInfo);
    }




    // epicFunction() {
    //     this.deviceInfo = this.deviceService.getDeviceInfo();
    //     const isMobile = this.deviceService.isMobile();
    //     const isTablet = this.deviceService.isTablet();
    //     const isDesktopDevice = this.deviceService.isDesktop();
    //     console.log(this.deviceInfo);
    //     console.log(isMobile);  // returns if the device is a mobile device (android / iPhone / windows-phone etc)
    //     console.log(isTablet);  // returns if the device us a tablet (iPad etc)
    //     console.log(isDesktopDevice); // returns if the app is running on a Desktop browser.
    //     this.socketService.sendMessage(this.deviceInfo);
    // }

    showConfirm() {
        this.messageService.clear();
        this.messageService.add({
            key: 'c',
            sticky: true,
            closable: this.closable,
            severity:'warn',
            summary:'Are you sure?',
            detail:'Confirm to proceed'
        });
    }

    closeMsg() {
        this.messageService.clear('c');
    }

    showUserNodeLoginWaitResponseModal(
        nodeStation: NodeStation, stationID: string, company: Company, factory: Factory, nodeStationLoginRequest: NodeStationLoginRequest
    ) {
        // console.log(nodeStation);
        const ref = this.dialogService.open(SWaitResponseUsernodeLoginComponent, {
            data: {
                id: 'wait response user node login',
                company: company,
                factory: factory,
                nodeID: nodeStation.nodeID,
                nodeStation: nodeStation,
                stationID: stationID,
                nodeStationLoginRequest: nodeStationLoginRequest,
                mode: 'userNode',
                callfrom: this.formName,  // ##


            },
            header: 'waiting system for allow login',
            width: '50%',
        });

        ref.onClose.subscribe((data: any) => {
            if (!data) {
                this.nsService.delNodeStationLoginRequestNoAuth(nodeStationLoginRequest, 'none');
            } else {
                if (data.actionMode === 'login-node-workstation') {  // actionMode: 'login-node-workstation'
                    // console.log('login-node-workstation');
                    // console.log(data);
                    // ## set storage uuid5 for login node userID

                    // ## login to page node workstation
                    // [routerLink]="['/workstation']"

                    // getDataNodeStationLogin(companyID: string, factoryID: string, status: string[], nodeID: string)
                    const status = ['a'];
                    this.nsService.stationID = data.stationID;
                    this.nsService.getDataNodeStationLogin(data.companyID, data.factoryID, status, data.nodeID);

                    // setData(key: string, value: any)
                    let value = this.storageService.clrNodeValue();
                    value.uuid = this.userService.uuidUserNodeLoginWaiting;
                    this.storageService.setData('nUUIDL', value);  // ## nUUIDL = key for node workstation login
                    this.nsService.nodeStation = nodeStation;
                    this.userService.setIsNodeAuth(true);
                    this.userService.setCompany(data.company);
                    this.userService.setFactory(data.factory);
                    this.router.navigate(['/workstation']);
                }
            }
            // console.log(data);
            // if (car) {
            //     this.messageService.add({severity:'info', summary: 'Car Selected', detail:'Vin:' + car.vin});
            // }
        });
    }

    ngOnDestroy() {
        if (this.sockio) { this.sockio.unsubscribe(); }
        if (this.dataAroundAppSub) { this.dataAroundAppSub.unsubscribe(); }
        if (this.errSub) { this.errSub.unsubscribe(); }
        if (this.langSub) { this.langSub.unsubscribe(); }
        if (this.langListSub) { this.langListSub.unsubscribe(); }
        if (this.getUserNodeLoginWaitSub) { this.getUserNodeLoginWaitSub.unsubscribe(); }

        // if (this.ioRequestLoginNode) { this.ioRequestLoginNode.unsubscribe(); }
        // if (this.darkSub) { this.darkSub.unsubscribe(); }
        // if (this.errSub) { this.errSub.unsubscribe(); }
        // if (this.authSub) { this.authSub.unsubscribe(); }
        // if (this.screenSub) { this.screenSub.unsubscribe(); }
        // if (this.screenSizeSub) { this.screenSizeSub.unsubscribe(); }
    }
}
