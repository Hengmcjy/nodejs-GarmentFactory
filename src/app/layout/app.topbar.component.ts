import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { Subscription } from 'rxjs';
import { LayoutService } from "./service/app.layout.service";
import { UserService } from '../services/user.service';
import { SocketIOService } from '../services/socketio.service';
import { NodeStationService } from '../services/node-station.service';
import { Company, Factory } from '../models/app.model';
import { GBC } from '../global/const-global';

@Component({
    selector: 'app-topbar',
    templateUrl: './app.topbar.component.html'
})
export class AppTopBarComponent implements OnInit, OnDestroy {

    sweaterGCSPath = GBC.sweaterGCSPath;
    company: Company = GBC.clrCompany();
    factory: Factory = GBC.clrFactory();

    lang: string = '';
    valueCount = '';
    topBarLogoTRxt = '';

    menuItems: MenuItem[] = [];

    items!: MenuItem[];

    @ViewChild('menubutton') menuButton!: ElementRef;

    @ViewChild('topbarmenubutton') topbarMenuButton!: ElementRef;

    @ViewChild('topbarmenu') menu!: ElementRef;

    private langSub: Subscription = new Subscription;
    // private langsListSub: Subscription = new Subscription;
    private dataAroundAppSub: Subscription = new Subscription;
    private commandAroundAppSub: Subscription = new Subscription;
    private ioRequestLoginNode: Subscription = new Subscription;
    private langListSub: Subscription = new Subscription;
    private nodeStationLoginRequestSub: Subscription = new Subscription;


    constructor(
        public layoutService: LayoutService,

        public userService: UserService,
        private socketService: SocketIOService,
        private nsService: NodeStationService,
    ) { }

    async ngOnInit() {
        this.company = this.userService.getCompany();
        this.factory = this.userService.getFactory();


        this.dataAroundAppSub = this.userService.getDataAroundAppStatusListener().subscribe(dataAroundApp => {
            this.company = dataAroundApp.company;
            this.factory = dataAroundApp.factory;
        });

        this.commandAroundAppSub = this.userService.getCommandAroundAppStatusListener().subscribe(commandAroundApp => {
            // console.log(commandAroundApp);
            if (commandAroundApp.showUserNodeRequestLogin) {
                // this.showAllowUserNodeLoginModal();
            }
            if (commandAroundApp.getNodeStationLoginRequest) {
                // console.log('getNodeStationLoginRequest');
                // this.nsService.getNodeStationLoginRequest();
            }
        });

        this.getIORequestLoginNode();
        this.langListSub = this.userService.getLangsListUpdatedListener().subscribe((data) => {
            this.getIORequestLoginNode();
            this.getTopBarLogoTRxt();
        });

        // ## get current lang and set app language
        this.langSub = this.userService.getLang.subscribe(langu => {
            if (langu) {
                this.setLang(langu);
                this.lang = langu;
            }
        });
        const langg = await this.userService.getLangCurrent();
        if (langg !== '' || langg != null) {
            this.setLang(langg);
            this.lang = langg;
        }
        else {
            this.setLang('en');
            this.lang = 'en';
        }

        this.getTopBarLogoTRxt();

        // ## get user node login request
        this.getNodeStationLoginRequest();

    }

    // getLangsListUpdatedListener() {
    //     if (this.langsListSub) { this.langsListSub.unsubscribe(); }
    //     this.langsListSub = this.userService.getLangsListUpdatedListener().subscribe((data) => {
    //         // console.log('getLangsListUpdatedListener ' + data);
    //         this.getTopBarLogoTRxt();
    //     });
    // }

    getTopBarLogoTRxt() {
        this.topBarLogoTRxt = '';
        this.topBarLogoTRxt = this.userService.translateCode('mn', 'mn-report');
        // return this.topBarLogoTRxt;
    }

    getNodeStationLoginRequest() {
        this.nsService.getNodeStationLoginRequest();

        if (this.nodeStationLoginRequestSub) { this.nodeStationLoginRequestSub.unsubscribe(); }
        this.nodeStationLoginRequestSub = this.nsService
        .getNodeStationLoginRequestsUpdatedListener().subscribe((data) => {
            if (data.nodeStationLoginRequests.length > 0) {
                this.valueCount = '*';
            } else {
                this.valueCount = '';
            }
        });
    }

    getIORequestLoginNode() {
        // console.log(this.userService.ioID);
        if (this.ioRequestLoginNode) { this.ioRequestLoginNode.unsubscribe(); }
        this.ioRequestLoginNode = this.socketService.getIORequestLoginNode().subscribe((msgio: any) => {
            if (msgio) {
                if (msgio.msgTypeID === 'userRequestNodeLoginWaiting') {  // ## user node request for login
                    this.valueCount = '*';
                }
            }
        });
    }

    setCommandAroundAppStatusListenerToNext() {
        if (this.valueCount === '*') {
            this.userService.setCommandAroundAppStatusListenerToNext('showUserNodeRequestLogin');
        }
    }

    openSystemInfo() {
        // console.log('openSystemInfo');
        this.userService.setCommandAroundAppStatusListenerToNext('openSystemInfo');
    }

    setLang(lang: string) {
        // console.log('SetLang = ' ,lang);
        // this.translate.use(lang);
        // this.setLangList(lang);
    }

    ngOnDestroy(): void {
        if (this.langSub) { this.langSub.unsubscribe(); }
        // if (this.langsListSub) { this.langsListSub.unsubscribe(); }
        if (this.dataAroundAppSub) { this.dataAroundAppSub.unsubscribe(); }
        if (this.ioRequestLoginNode) { this.ioRequestLoginNode.unsubscribe(); }
        if (this.langListSub) { this.langListSub.unsubscribe(); }
        if (this.nodeStationLoginRequestSub) { this.nodeStationLoginRequestSub.unsubscribe(); }

        if (this.commandAroundAppSub) { this.commandAroundAppSub.unsubscribe(); }
        // if (this.langSub) { this.langSub.unsubscribe(); }
        // if (this.langSub) { this.langSub.unsubscribe(); }
        // if (this.langSub) { this.langSub.unsubscribe(); }

    }
}
