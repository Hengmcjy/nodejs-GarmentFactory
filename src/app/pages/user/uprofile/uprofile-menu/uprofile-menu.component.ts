import { Component, OnInit, OnDestroy } from '@angular/core';
// import { TranslateService } from '@ngx-translate/core';
import { MegaMenuItem } from 'primeng/api';
// import { DynamicDialogConfig } from 'primeng/dynamicdialog';
import { Subscription } from 'rxjs';

import { UserService } from 'src/app/services/user.service';

@Component({
    selector: 'app-uprofile-menu',
    templateUrl: './uprofile-menu.component.html',
    styleUrls: ['./uprofile-menu.component.scss'],
})
export class UprofileMenuComponent implements OnInit, OnDestroy {
    formActive = '';

    lang: string = '';
    megaMenuItems: MegaMenuItem[] = [];

    private dataAroundAppSub: Subscription = new Subscription;
    private langSub: Subscription = new Subscription();

    constructor(
        // public translate: TranslateService,
        // public config: DynamicDialogConfig,
        private userService: UserService
    ) {}

    async ngOnInit() {
        // this.megaMenuItems = this.userService.getMenuBarUCompanySetting();

        this.formActive = this.userService.formActive;
        this.megaMenuItems = this.userService.getFormActiveMenu(this.userService.formActive, 'app-uprofile-menu 1'); // get menu of form active
        this.dataAroundAppSub = this.userService.getDataAroundAppStatusListener().subscribe(dataAroundApp => {
            // ## declare initial variable from service user
            this.formActive = dataAroundApp.formActive;
            this.megaMenuItems = this.userService.getFormActiveMenu(this.formActive, 'app-uprofile-menu 2');
            // console.log(this.userService.formActive);

        });

        // ## get current lang and set app language
        this.langSub = this.userService.getLang.subscribe((langu) => {
            if (langu) {
                this.setLang(langu);
                this.lang = langu;
            }
        });
        const langg = await this.userService.getLangCurrent();
        if (langg !== '' || langg != null) {
            this.setLang(langg);
            this.lang = langg;
        } else {
            this.setLang('en');
            this.lang = 'en';
        }
    }

    setLang(lang: string) {
        // console.log('SetLang = ' ,lang);
        // this.translate.use(lang);
    }

    ngOnDestroy(): void {
        if (this.langSub) { this.langSub.unsubscribe(); }
        if (this.dataAroundAppSub) { this.dataAroundAppSub.unsubscribe(); }

    }
}
