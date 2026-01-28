import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
// import { TranslateService } from '@ngx-translate/core';
import { MenuItem } from 'primeng/api';
import { Subscription } from 'rxjs';
import { LayoutService } from 'src/app/layout/service/app.layout.service';

import { StorageService } from 'src/app/services/storage.service';
import { UserService } from 'src/app/services/user.service';
import { CustomerService } from 'src/app/services/customer.service';
import { MailService } from 'src/app/services/mail.service';
import { ProductService } from 'src/app/services/product.service';
import { OrderService } from 'src/app/services/order.service';
import { Language } from 'src/app/models/app.model';
import { NodeStationService } from 'src/app/services/node-station.service';

import { GBC } from 'src/app/global/const-global';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styles: [`
        :host ::ng-deep .pi-eye,
        :host ::ng-deep .pi-eye-slash {
            transform:scale(1.6);
            margin-right: 1rem;
            color: var(--primary-color) !important;
        }
    `]
})
export class LoginComponent implements OnInit, OnDestroy {

    sweaterGCSPath = GBC.sweaterGCSPath2;

    keyConfirmlink = '';
    blockSpecial: RegExp = /^[^<>*!]+$/
    userID1: string = '';
    pwd1: string = '';
    lang: string = '';
    errID: string = '';
    display = false;
    mailVerifyErr = '';
    hasUUIDForNodeLogin = false;
    uuid = '';
    showLogin = false;

    menuItems: MenuItem[] = [];

    langs: Language[] = [];
    langData: Language = GBC.clrLanguage();
    langSelected: string = '';

    valCheck: string[] = ['remember'];

    password!: string;
    features: any;

    private langListSub: Subscription = new Subscription;
    private langSub: Subscription = new Subscription;
    private errSub: Subscription = new Subscription;
    private mailVerifySub: Subscription = new Subscription;
    private loginNodeStationByUUIDSub: Subscription = new Subscription;


    constructor(
        // public translate: TranslateService,
        public layoutService: LayoutService,
        private location: Location,
        private route: ActivatedRoute,
        private router: Router,

        private storageService: StorageService,
        public userService: UserService,
        public cusService: CustomerService,
        public mailService: MailService,
        public prodService: ProductService,
        public ordService: OrderService,
        public nsService: NodeStationService,
    ) { }

    async ngOnInit() {
        this.langs = this.userService.langs;
        this.langData = this.userService.langData;
        this.langSelected = this.userService.getLanguage();

        // ## clear all data for start new fresh data
        this.clearDataWhenLogOut();

        // ## check get uuid for login node workstation
        this.uuid = await this.storageService.getData('nUUIDL', 'nUUIDL');  // ## nUUIDL = key for node workstation login
        // console.log(this.uuid);
        if (this.uuid) {
            // console.log('uuid have');
            this.hasUUIDForNodeLogin = true;
        } else {
            // console.log('uuid no have');
            this.hasUUIDForNodeLogin = false;
        }

        // this.key = this.route.snapshot.queryParamMap.get('key') + '';
        this.keyConfirmlink = this.route.snapshot.params['confirmlink'];

        if (this.keyConfirmlink) {
            this.userService.keyConfirmlink = this.keyConfirmlink;
        } else {
            this.keyConfirmlink = '';
            this.userService.keyConfirmlink = '';
        }
        // console.log('keyConfirmlink = '+this.keyConfirmlink);

        this.location.replaceState("/"); // ## hide loocation
        this.langs = this.userService.langs;
        this.langData = this.userService.langData;

        // this.storageService.saveAuthData();
        // this.storageService.getAuthData();


        this.langListSub = this.userService.getLangsListUpdatedListener().subscribe((data) => {
            // console.log(data);
            this.langs = data.langs;
            this.setLangList(this.langSelected);
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

        // ## observ err
        this.errID = '';
        this.errSub = this.userService.getErrorStatusListener().subscribe(errObj => {
            // console.log(errObj);
            this.errID = errObj.messageID;
            // console.log(this.errID);
        });

        this.mailVerifyErr = '';
        this.getMailSignupVerifyUpdatedListener();

        // ## auto login
        if (this.keyConfirmlink.length === 0) {
            // console.log('keyConfirmlink = '+this.keyConfirmlink);
            this.userService.autoAuthUserAndDeviceInfo();
        } else {
            // ## clear storage token
            this.userService.logoutByClickLinkSignupFromMail();
            this.display = true;  // ## show dialog confirmed
            //## update user verified from mail already
            this.mailService.postSignupVerifyMail(this.keyConfirmlink);

        }

    }

    showLoginCheck() {
        if (!this.hasUUIDForNodeLogin) {
            // this.showLogin = true;
            return true;
        } else {
            // this.showLogin = !this.showLogin;
            return this.hasUUIDForNodeLogin && this.showLogin;
        }
    }

    postLoginNodeStationByUUID() {
        // postLoginNodeStationByUUID(uuid: string)
        if (this.uuid) {
            this.nsService.postLoginNodeStationByUUID(this.uuid);
            if (this.loginNodeStationByUUIDSub) { this.loginNodeStationByUUIDSub.unsubscribe(); }
            this.loginNodeStationByUUIDSub = this.nsService.getNodeStationLoginByUUIDUpdatedListener().subscribe((data) => {
                // console.log(data);
                if (data.canLogin) {
                    this.nsService.nodeStation = data.nodeStation;
                    this.userService.setIsNodeAuth(true);
                    this.router.navigate(['/workstation']);
                } else {
                    if (!data.success) {
                        this.storageService.clearData('nUUIDL');  // ## nUUIDL = key for node workstation login
                        this.hasUUIDForNodeLogin = false;
                    }
                }
            });
        }
    }

    clearDataWhenLogOut() {
        this.userService.clearDataWhenLogOut();
        this.cusService.clearDataWhenLogOut();
        this.prodService.clearDataWhenLogOut();
        this.ordService.clearDataWhenLogOut();
        this.nsService.clearDataWhenLogOut();
    }

    getMailSignupVerifyUpdatedListener() {
        if (this.mailVerifySub) { this.mailVerifySub.unsubscribe(); }
        this.mailVerifySub = this.mailService.getMailSignupVerifyUpdatedListener().subscribe((data) => {
            if (data.success) {
                this.mailVerifyErr = '';
            } else {
                this.mailVerifyErr = data.message.messageID;
            }
        });
    }

    gettxt() {
        return 'xxxx';
    }

    translateCode(lType: string, lID: string) {
        const languageDataText = this.userService.translateCode(lType, lID);
        return languageDataText;
    }

    setLangList(langSelected: string) {
        this.menuItems = [];
        const iconLSelected = 'pi pi-fw pi-check';
        const iconL = '';
        const classL = 'pl-5';
        const classLSelected = 'font-bold';

        // console.log(this.langs);
        for (const lang of this.langs) {
            // console.log(lang);
            this.menuItems.push(
                {
                    visible: true,
                    label: lang.languageID +' - ' + lang.languageName,
                    styleClass: lang.languageID===langSelected?classLSelected:classL,
                    icon: lang.languageID===langSelected?iconLSelected:iconL,
                    command: () => { this.userService.setLang(lang.languageID); }
                }
            );
        }
        // console.log(this.menuItems);


        // this.menuItems = [
        //     {
        //         visible: true,
        //         label: 'EN - english',
        //         styleClass: lang==='en'?classLSelected:classL,
        //         icon: lang==='en'?iconLSelected:iconL,
        //         command: () => { this.userService.setLang('en'); }
        //     },
        //     {
        //         visible: true,
        //         label: 'TH - thai',
        //         styleClass: lang==='th'?classLSelected:classL,
        //         icon: lang==='th'?iconLSelected:iconL,
        //         command: () => { this.userService.setLang('th'); }
        //     },
        //     {
        //         visible: true,
        //         label: 'CN - china',
        //         styleClass: lang==='cn'?classLSelected:classL,
        //         icon: lang==='cn'?iconLSelected:iconL,
        //         command: () => { this.userService.setLang('cn'); }
        //     },
        //     {
        //         visible: true,
        //         label: 'MM - myanmar',
        //         styleClass: lang==='mm'?classLSelected:classL,
        //         icon: lang==='mm'?iconLSelected:iconL,
        //         command: () => { this.userService.setLang('mm'); }
        //     },
        // ];
    }



    getLangu() {
        // this.translate.get('HOME.xuelek').subscribe((res: string) => {
        //     console.log(res);
        // });
    }

    setLang(lang: string) {
        // console.log('SetLang = ' ,lang);
        this.langSelected = lang;
        // this.translate.use(lang);
        this.setLangList(lang);

        if (this.userService.langData.languageID) {
            if (this.userService.langData.languageID !== lang) {
                this.userService.getLangData(lang);
            }
        }
    }

    login() {
        this.errID = '';

        // ## when login have to clear storage for node station login uuid
        this.storageService.clearData('nUUIDL');  // ## nUUIDL = key for node workstation login

        if (this.userID1.trim() !== '' && this.pwd1.trim() !== '') {
            this.userService.userLogin(this.userID1, this.pwd1);
        }
    }

    onHideDialog() {
        // console.log('onHideDialog');
        this.display = false;
    }

    goto(path: string) {
        // const params: NavigationExtras = {
        //     queryParams: { productID: productID },
        // };
        // this.userService.setIsNodeAuth(true);
        this.router.navigate([path]);
    }

    ngOnDestroy() {
        if (this.langSub) { this.langSub.unsubscribe(); }
        if (this.errSub) { this.errSub.unsubscribe(); }
        if (this.langListSub) { this.langListSub.unsubscribe(); }
        if (this.mailVerifySub) { this.mailVerifySub.unsubscribe(); }
        if (this.loginNodeStationByUUIDSub) { this.loginNodeStationByUUIDSub.unsubscribe(); }

        // if (this.darkSub) { this.darkSub.unsubscribe(); }
        // if (this.screenSizeSub) { this.screenSizeSub.unsubscribe(); }
        // if (this.darkSub) { this.darkSub.unsubscribe(); }
        // if (this.errSub) { this.errSub.unsubscribe(); }
        // if (this.authSub) { this.authSub.unsubscribe(); }
        // if (this.screenSub) { this.screenSub.unsubscribe(); }
        // if (this.screenSizeSub) { this.screenSizeSub.unsubscribe(); }
    }
}
