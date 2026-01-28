import { Component, OnInit, OnDestroy } from '@angular/core';
// import { TranslateService } from '@ngx-translate/core';
import { MegaMenuItem } from 'primeng/api';
import { Subscription } from 'rxjs';

import { UserService } from 'src/app/services/user.service';
import { Company } from 'src/app/models/app.model';
import { GBC } from 'src/app/global/const-global';
import { DialogService } from 'primeng/dynamicdialog';
import { SmdOrderSeasonyearComponent } from 'src/app/shared/components/order/smd-order-seasonyear/smd-order-seasonyear.component';
import { SmdYarnSeasonyearComponent } from 'src/app/shared/components/user/yarn/smd-yarn-seasonyear/smd-yarn-seasonyear.component';
import { User } from 'src/app/models/user.model';

@Component({
  selector: 'app-ucompany-menu',
  templateUrl: './ucompany-menu.component.html',
  styleUrls: ['./ucompany-menu.component.scss'],
  providers: [DialogService],
})
export class UcompanyMenuComponent implements OnInit, OnDestroy{
    formActive = '';

    // isAdmin: boolean = false;
    // user: User = GBC.clrUser();

    company: Company = GBC.clrCompany();

    lang: string = '';
    megaMenuItems: MegaMenuItem[] = [];

    private dataAroundAppSub: Subscription = new Subscription;
    private langSub: Subscription = new Subscription();

  constructor(
    public dialogService: DialogService,

    // public translate: TranslateService,
    private userService: UserService,
  ) { }

  async ngOnInit() {
        // console.log(this.userService.formActive);

        this.formActive = this.userService.formActive;
        // console.log(this.userService.formActive);
        this.megaMenuItems = this.userService.getFormActiveMenu(this.userService.formActive, 'app-ucompany-menu ngOnInit()'); // get menu of form active
        this.company = this.userService.getCompany();
        // console.log([...this.megaMenuItems]);

        // this.megaMenuItems[0].label = this.userService.strFirstAndDot(this.company.cInfo.companyName, 20);
        // this.megaMenuItems[1] = {
        //     label: this.userService.seasonYear,
        //     styleClass: 'text-lg font-bold',
        //     command: () => { this.showSeasonYearsList(); }
        // };

        this.dataAroundAppSub = this.userService.getDataAroundAppStatusListener().subscribe(dataAroundApp => {
            // console.log(dataAroundApp);
            // ## declare initial variable from service user
            this.formActive = dataAroundApp.formActive;
            // console.log(this.formActive);
            this.megaMenuItems = this.userService.getFormActiveMenu(this.formActive , 'app-ucompany-menu   dataAroundAppSub');
            // console.log(this.megaMenuItems);
            this.company = dataAroundApp.company;
            this.megaMenuItems[0].label = this.userService.strFirstAndDot(this.company.cInfo.companyName, 20);
            // this.megaMenuItems[0].visible = false;
            // console.log(this.userService.formActive);

            this.megaMenuItems[1] = {
                label: this.userService.seasonYear,
                styleClass: 'text-lg font-bold',
                command: () => { this.showSeasonYearsList(); }
            };
            if (this.userService.formActive === 'order') {
                this.megaMenuItems[1] = {
                    label: this.userService.seasonYear,
                    styleClass: 'text-lg font-bold',
                    command: () => { this.showSeasonYearsList(); }
                };
            }
            if (this.userService.formActive === 'yarn' || this.userService.formActive === 'yarn-plan') {
                this.megaMenuItems[1] = {
                    label: this.userService.yarnSeason,
                    styleClass: 'text-base text-500',
                    command: () => { this.showYarnSeasonsList(); }
                };
            }

            if (this.userService.formActive === 'transport' || this.userService.formActive === 'transport-dashboard') {
                // console.log('transport-menu');
                const user: User = GBC.clrUser();
                const isAdmin = this.userService.isAdmin();
                this.megaMenuItems[3] = {
                    // label: this.userService.yarnSeason,
                    styleClass: 'text-base text-500',
                    // visible: isAdmin || this.userService.getMenuAutor(user.userID, 'transport-setting', 'normal'),
                    // visible: false,

                    // command: () => { this.showYarnSeasonsList(); }
                };
            }
            if (this.userService.formActive === 'financial') {

            }

        });

        if (this.userService.formActive === 'order') {
            this.megaMenuItems[1] = {
                label: this.userService.seasonYear,
                styleClass: 'text-lg font-bold',
                command: () => { this.showSeasonYearsList(); }
            };
        }

        if (this.userService.formActive === 'yarn' || this.userService.formActive === 'yarn-plan') {
            this.megaMenuItems[1] = {
                label: this.userService.yarnSeason,
                styleClass: 'text-base text-500',
                command: () => { this.showYarnSeasonsList(); }
            };
        }

        if (this.userService.formActive === 'financial') {

        }

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

    showYarnSeasonsList() {
        const ref = this.dialogService.open(SmdYarnSeasonyearComponent, {
            data: {
                id: 'yarnSeasonsSelection',
                company: this.userService?.getCompany(),
                callfrom: this.formActive,  // ## send to nodejs for choose buckets
                btnCaption: 'choose'

            },
            header: 'Yarn Season Selection',
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

    }

}
