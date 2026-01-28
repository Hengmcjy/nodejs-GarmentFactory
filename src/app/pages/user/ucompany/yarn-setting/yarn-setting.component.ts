import { Component, OnDestroy, OnInit } from '@angular/core';
import { DialogService } from 'primeng/dynamicdialog';
import { Subscription } from 'rxjs';
import { GBC } from 'src/app/global/const-global';
import { Company, Factory } from 'src/app/models/app.model';
import { Customer } from 'src/app/models/order.model';
import { Yarn } from 'src/app/models/yarn.model';
import { UserService } from 'src/app/services/user.service';
import { YarnService } from 'src/app/services/yarn.service';
import { SSelectCustomerComponent } from 'src/app/shared/components/general/s-select-customer/s-select-customer.component';
import { SmdYarnSeasonyearComponent } from 'src/app/shared/components/user/yarn/smd-yarn-seasonyear/smd-yarn-seasonyear.component';

@Component({
    selector: 'app-yarn-setting',
    templateUrl: './yarn-setting.component.html',
    styleUrls: ['./yarn-setting.component.scss'],
    providers: [DialogService],
})
export class YarnSettingComponent implements OnInit, OnDestroy {
    formActive = 'yarn-setting';
    formName = this.formActive;

    viewMode = 'yarnSetting'; // ## plan , factoryStock, yarnTransferReport yarnReport, yarnSetting
    mode = 'yarn-create'; // ## yarn-create, yarn-season
    modeName = 'Yarn update'; // ## Yarn update , Yarn SEASON update

    company: Company = GBC.clrCompany();

    yarnSeason = '';
    factorySelect: Factory = GBC.clrFactory();
    customer: Customer = GBC.clrCustomer();

    yarns: Yarn[] = [];
    yarnsCount: number = 0;

    yarnID = '';
    yarnSeasonID = '';

    private dataAroundAppSub: Subscription = new Subscription();
    private yarnDataAroudAppSub: Subscription = new Subscription();

    constructor(
        public dialogService: DialogService,

        public userService: UserService,
        public yarnService: YarnService,
    ) {}

    ngOnInit(): void {

        this.company = this.userService.getCompany();
        // console.log('1');
        this.yarnSeason = this.userService.yarnSeason;
        this.customer = this.userService.getCustomer();
        this.factorySelect = this.userService.factorySelect;
        this.userService.setYarnSeason(this.yarnSeason);
        this.userService.factorySelect = this.factorySelect;
        this.userService.setCustomer(this.customer);

        this.yarnService.getYarnsList(this.company.companyID, this.yarnSeason);

        this.dataAroundAppSub = this.userService
            .getDataAroundAppStatusListener()
            .subscribe((dataAroundApp) => {
                // ## declare initial variable from service user

                this.customer = dataAroundApp.customer;
                this.factorySelect = dataAroundApp.factorySelect;
                this.yarnSeason = dataAroundApp.yarnSeason;
                //
                this.checkMode('');
            });

        this.yarnDataAroudAppSub = this.userService
            .getYarnDataAroudAppStatusListener()
            .subscribe((yranDataAroundApp) => {
                // ##
                // this.mode = this.mode==='' ? 'list':this.mode;
                // this.viewMode = yranDataAroundApp.viewMode;
                // console.log('2');
                // this.checkMode('');
            });

    }

    checkMode(mode: string) {

    }

    changeMode(mode: string) {
        this.mode = mode;
        if (this.mode === 'yarn-create') { // ## yarn-create, yarn-season
            this.modeName = 'Yarn create/update';
        } else if (this.mode === 'yarn-season') {
            this.modeName = 'Yarn SEASON create/update';
        } else {
            this.modeName = '';
        }
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

    showCustomerSelectionModal() {
        const ref = this.dialogService.open(SSelectCustomerComponent, {
            data: {
                id: 'customersSelection',
                company: this.userService?.getCompany(),
                callfrom: this.formName,  // ## send to nodejs for choose buckets
                btnCaption: 'choose'

            },
            header: 'Customer Selection',
            width: '80%',
        });

        ref.onClose.subscribe((customer: Customer) => {
            // console.log(customer);
            if (customer) {
                // console.log(customer);
                this.customer = {...customer};
                this.userService.setCustomer(customer);
                // this.userService.setDataAroundAppStatusListenerToNext();
            }
        });
    }

    // showFactorySelectionModal() {
    //     const ref = this.dialogService.open(SSelectFactoryComponent, {
    //         data: {
    //             id: 'factorySelection-main',
    //             company: this.userService?.getCompany(),
    //             callfrom: this.formName,  // ## send to nodejs for choose buckets
    //             btnCaption: 'choose'

    //         },
    //         header: 'Factory Selection',
    //         width: '80%',
    //     });

    //     ref.onClose.subscribe((factory: Factory) => {
    //         if (factory) {
    //             this.factorySelect = {...factory};
    //             this.userService.factorySelect = this.factorySelect;
    //             this.userService.setDataAroundAppStatusListenerToNext();
    //             // this.factorySelectForOrderStyle = {...this.factorySelected};
    //             // this.userService.setOrderCustomerSelect(customer);
    //         }
    //     });

    // }

    ngOnDestroy(): void {
        if (this.dataAroundAppSub) { this.dataAroundAppSub.unsubscribe(); }
        if (this.yarnDataAroudAppSub) { this.yarnDataAroudAppSub.unsubscribe(); }
    }
}
