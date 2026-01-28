import { Component, OnInit, OnDestroy } from '@angular/core';
// import { TranslateService } from '@ngx-translate/core';
import { MegaMenuItem } from 'primeng/api';
import { Subscription } from 'rxjs';

import { UserService } from 'src/app/services/user.service';
import { Company, Factory } from 'src/app/models/app.model';
import { GBC } from 'src/app/global/const-global';
import { DialogService } from 'primeng/dynamicdialog';
import { SmdOrderSeasonyearComponent } from 'src/app/shared/components/order/smd-order-seasonyear/smd-order-seasonyear.component';

@Component({
    selector: 'app-ufactory-dashboard-menu',
    templateUrl: './ufactory-dashboard-menu.component.html',
    styleUrls: ['./ufactory-dashboard-menu.component.scss'],
    providers: [DialogService],
})
export class UfactoryDashboardMenuComponent implements OnInit, OnDestroy {
    formActive = '';
    company: Company = GBC.clrCompany();
    factory: Factory = GBC.clrFactory();

    lang: string = '';
    megaMenuItems: MegaMenuItem[] = [];

    private dataAroundAppSub: Subscription = new Subscription;
    private langSub: Subscription = new Subscription();

    constructor(
        public dialogService: DialogService,
        // public translate: TranslateService,
        private userService: UserService
    ) {}

    async ngOnInit() {
        // console.log(this.userService.formActive);
        // console.log(this.company);
        // console.log(this.factory);
        this.formActive = this.userService.formActive;
        this.megaMenuItems = this.userService.getFormActiveMenu(this.userService.formActive, 'app-ufactory-dashboard-menu 1'); // get menu of form active
        this.company = this.userService.getCompany();
        this.factory = this.userService.getFactory();

        this.megaMenuItems[0].label = this.userService.strFirstAndDot(this.factory.fInfo.factoryName, 20);
        // this.megaMenuItems[0].visible = false;
        this.dataAroundAppSub = this.userService.getDataAroundAppStatusListener().subscribe(dataAroundApp => {
            // ## declare initial variable from service user
            this.formActive = dataAroundApp.formActive;
            this.megaMenuItems = this.userService.getFormActiveMenu(this.formActive, 'app-ufactory-dashboard-menu 2');
            this.factory = dataAroundApp.factory;
            this.megaMenuItems[0].label = this.userService.strFirstAndDot(this.factory.fInfo.factoryName, 20);
            // this.megaMenuItems[0].visible = false;

            // if (this.userService.formActive === 'order') {
            this.megaMenuItems[2] = {
                label: this.userService.seasonYear,
                styleClass: 'text-lg font-bold',
                command: () => { this.showSeasonYearsList(); }
            };
            // }
        });

        this.megaMenuItems[2] = {
            label: this.userService.seasonYear,
            styleClass: 'text-lg font-bold',
            command: () => { this.showSeasonYearsList(); }
        };

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

    showSeasonYearsList() {
        const ref = this.dialogService.open(SmdOrderSeasonyearComponent, {
            data: {
                id: 'productsSelection',
                company: this.userService?.getCompany(),
                callfrom: this.formActive,  // ## send to nodejs for choose buckets
                btnCaption: 'choose'

            },
            header: 'Season year Selection',
            width: '80%',
        });

        ref.onClose.subscribe((data: any) => {
            // if (product) {
            //     this.product = product;
            //     // this.style = this.product.productCustomerCode.toUpperCase();
            //     this.style = this.order.orderID;
            //     this.style = this.userService.setAddBackStrLen(this.style, this.userService.styleLen, ' ');
            //     this.userService.setOrderProductSelect(product)
            // }

        });

    }

    ngOnDestroy(): void {
        if (this.langSub) { this.langSub.unsubscribe(); }
        if (this.dataAroundAppSub) { this.dataAroundAppSub.unsubscribe(); }

        // if (this.langSub) { this.langSub.unsubscribe(); }
        // if (this.dataAroundAppSub) { this.dataAroundAppSub.unsubscribe(); }
    }
}
