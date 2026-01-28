import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { MenuItem } from 'primeng/api';
import { LayoutService } from 'src/app/layout/service/app.layout.service';

// import { TranslateService } from '@ngx-translate/core';


import { UserService } from 'src/app/services/user.service';
import { Language } from 'src/app/models/app.model';
import { GBC } from 'src/app/global/const-global';



@Component({
    selector: 'app-web-footer',
    templateUrl: './web-footer.component.html',
    styleUrls: ['./web-footer.component.scss'],
})
export class WebFooterComponent implements OnInit, OnDestroy {
    lang: string = '';

    menuItems: MenuItem[] = [];
    langs: Language[] = [];
    langData: Language = GBC.clrLanguage();
    langSelected: string = 'en';

    private langListSub: Subscription = new Subscription;
    private langSub: Subscription = new Subscription;

    constructor(
        public layoutService: LayoutService,
        // public translate: TranslateService,
        private userService: UserService
    ) {}

    async ngOnInit() {
        this.langs = this.userService.langs;
        this.langData = this.userService.langData;
        this.langSelected = this.userService.getLanguage();

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

    ngOnDestroy(): void {
        if (this.langSub) { this.langSub.unsubscribe(); }
        if (this.langListSub) { this.langListSub.unsubscribe(); }
        // if (this.langSub) { this.langSub.unsubscribe(); }

    }
}
