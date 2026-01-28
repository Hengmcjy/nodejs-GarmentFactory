import { Component, OnDestroy, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { UserService } from 'src/app/services/user.service';
import { DialogService } from 'primeng/dynamicdialog';
import { Customer } from 'src/app/models/order.model';
import { GBC } from 'src/app/global/const-global';
import { SmdYarnSeasonyearComponent } from 'src/app/shared/components/user/yarn/smd-yarn-seasonyear/smd-yarn-seasonyear.component';
import { SSelectCustomerComponent } from 'src/app/shared/components/general/s-select-customer/s-select-customer.component';
import { SSelectFactoryComponent } from 'src/app/shared/components/general/s-select-factory/s-select-factory.component';
import { Company, Factory } from 'src/app/models/app.model';
import { Subscription } from 'rxjs';
import { YarnService } from 'src/app/services/yarn.service';
import { Yarn, YarnData } from 'src/app/models/yarn.model';


@Component({
  selector: 'app-yarn-plan',
  templateUrl: './yarn-plan.component.html',
  styleUrls: ['./yarn-plan.component.scss'],
  providers: [DialogService],
})
export class YarnPlanComponent implements OnInit, OnDestroy {
    formActive = 'yarn-plan';
    formName = this.formActive;

    loading = true;
    // ofFactory = false;  // ## plan of factory

    mode = ''; // ## list , create ,
    viewMode = 'plan'; // ## plan , factoryStock, yarnTransferReport yarnReport
    menuMode = 'yarn-plan'; // ## yarn-plan
    company: Company = GBC.clrCompany();

    yarnSeason = '';
    factorySelect: Factory = GBC.clrFactory();
    customer: Customer = GBC.clrCustomer();

    yarns: Yarn[] = [];
    yarnsCount: number = 0;

    yarnPlans: YarnData[] = [];
    yarnPlansCount: number = 0;

    yarnPlan: YarnData = GBC.clrYarnData();

    // /:factoryID/:customerID/:yarnSeason

    private dataAroundAppSub: Subscription = new Subscription();
    private yarnDataAroudAppSub: Subscription = new Subscription();
    private yarnPlanListSub: Subscription = new Subscription();

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private location: Location,

        public dialogService: DialogService,

        public userService: UserService,
        public yarnService: YarnService,
    ) {}


    ngOnInit(): void {
        this.location.replaceState('/'); // ## hide loocation
        this.userService.setFormActive(this.formActive);

        // queryParams: {menuMode: 'yarn-plan', viewMode: 'plan'}
        this.menuMode = (this.route.snapshot.queryParamMap.get('menuMode') + '' !== 'null')?this.route.snapshot.queryParamMap.get('menuMode') + '':'yarn-plan';
        this.viewMode = (this.route.snapshot.queryParamMap.get('viewMode') + '' !== 'null')?this.route.snapshot.queryParamMap.get('viewMode') + '':'plan';
        // console.log(this.menuMode, this.viewMode);
        // console.log((this.route.snapshot.queryParamMap.get('menuMode') + ''));
        // console.log(this.menuMode, typeof(this.menuMode));
        // if (this.menuMode === null) {
        //     console.log('00');
        // } else {console.log('11');}

        this.company = this.userService.getCompany();
        // console.log('1');
        this.yarnSeason = this.userService.yarnSeason;
        this.customer = this.userService.getCustomer();
        this.factorySelect = this.userService.factorySelect;
        this.userService.setYarnSeason(this.yarnSeason);
        this.userService.factorySelect = this.factorySelect;
        this.userService.setCustomer(this.customer);

        this.getYarnsSeasons();
        this.yarnService.getYarnsList(this.company.companyID, this.yarnSeason);
        // console.log('2');
        // console.log(this.yarnSeason, this.customer, this.factorySelect);
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
                this.mode = this.mode==='' ? 'list':this.mode;
                this.viewMode = yranDataAroundApp.viewMode;
                // console.log('2');
                this.checkMode('');
            });

        // this.menuMode = (this.route.snapshot.queryParamMap.get('menuMode') + '')?this.route.snapshot.queryParamMap.get('menuMode') + '':'noMenu';
        // console.log(this.menuMode);
        // console.log(this.userService.productImageProfiles);
        // console.log('10');
    }

    getYarnsSeasons() {
        // getYarnsSeasons(companyID: string)
        if (this.yarnService.yarnSeasons.length === 0) {
            this.yarnService.getYarnsSeasons(this.company.companyID);
        }
    }

    getYarPlansList() {
        this.yarnService.setYarns([]);  // ## clear yarn list
        this.yarnPlan = GBC.clrYarnData();
        this.loading = true;
        // this.ofFactory = false;  // ## plan of factory
        // this.mode = 'list';
        const companyID = this.company.companyID;
        const factoryID = this.factorySelect.factoryID;
        const customerID = this.customer.customerID;
        const setName = this.customer.setName;
        const orderIDs = this.userService.getOrderIDss();
        // getYarPlansList(companyID: string, factoryID: string, customerID: string, setName: string, yarnSeason: string)
        // console.log(companyID, factoryID, customerID, setName, this.yarnSeason, orderIDs);
        this.yarnService.getYarPlansList(companyID, factoryID, customerID, setName, this.yarnSeason, orderIDs);
        if (this.yarnPlanListSub) { this.yarnPlanListSub.unsubscribe(); }
        this.yarnPlanListSub = this.yarnService.getYarnPlanListListener().subscribe((data) => {
            // console.log(data);
            this.loading = false;
            // yarnPlans: YarnData[], yarnPlansCount: number,
            this.yarnPlans = data.yarnPlans;
            this.yarnPlansCount = data.yarnPlansCount;
            this.yarnPlans.sort((a,b)=>{ return a.orderID >b.orderID?1:a.orderID <b.orderID?-1:0 });

            this.yarns = data.yarns;
            this.yarnsCount = data.yarnsCount;
            // console.log(this.yarns);
        });
    }

    goFactoryYarnLot() {
        this.mode = 'fac-lot';
    }

    checkMode(mode: string) {
        // // ## clr for viewMode==='plan'
        // this.yarnPlan = GBC.clrYarnData();
        // this.yarnPlans = [];
        // this.yarnPlansCount = -1
        // this.yarns = [];
        // this.yarnsCount = -1;

        if (mode !== '') {
            this.mode = 'list'
        }

        // console.log(this.viewMode, this.mode);

        if (this.viewMode === 'factoryStock') {
            this.mode = 'fac-lot';

            // ## for have to get yarns list
            if (this.customer.companyID !== '' && this.factorySelect.factoryID !== '' && this.yarnSeason !== '') {
                this.getYarPlansList();
            }
        }
        if (this.viewMode === 'yarnTransferReport') {
            this.mode = 'yarn-transfer-report';

            // ## for have to get yarns list
            if (this.customer.companyID !== '' && this.factorySelect.factoryID !== '' && this.yarnSeason !== '') {
                this.getYarPlansList();
            }
        }
        if (this.customer.companyID !== '' && this.factorySelect.factoryID !== '' && this.yarnSeason !== '') {
            if (this.viewMode === 'plan' ) {
                // console.log(this.mode);
                this.mode = this.mode===''? 'list':this.mode;
                // this.mode = 'list';
                if (this.mode === 'list') {
                    this.getYarPlansList();
                }
            }


        }
    }


    createNewPlanEvent(mode: string) {
        // console.log(this.viewMode, this.mode);
        if (this.mode === 'create') {
            this.mode = 'list';
            this.getYarPlansList();
        } else {  // ## mode = 'list'
            this.mode = mode;
            this.getYarPlansList();
        }
    }

    gotoYarnManage(data: any) {
        this.yarnPlan = GBC.clrYarnData();
        this.yarnPlan = data.yarnPlan;
        this.mode = data.mode;
        // this.mode = '';
    }

    gotoMode(data: any) {
        this.mode = 'list';
        this.getYarPlansList();
    }

    showYarnSeasonsList() {
        const ref = this.dialogService.open(SmdYarnSeasonyearComponent, {
            data: {
                id: 'yarnSeasonsSelection',
                company: this.userService?.getCompany(),
                callfrom: this.formActive,  // ## send to nodejs for choose buckets
                moduleCaption: 'yarn',
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

    showFactorySelectionModal() {
        const ref = this.dialogService.open(SSelectFactoryComponent, {
            data: {
                id: 'factorySelection-main',
                company: this.userService?.getCompany(),
                callfrom: this.formName,  // ## send to nodejs for choose buckets
                btnCaption: 'choose'

            },
            header: 'Factory Selection',
            width: '80%',
        });

        ref.onClose.subscribe((factory: Factory) => {
            if (factory) {
                this.factorySelect = {...factory};
                this.userService.factorySelect = this.factorySelect;
                this.userService.setDataAroundAppStatusListenerToNext();
                // this.factorySelectForOrderStyle = {...this.factorySelected};
                // this.userService.setOrderCustomerSelect(customer);
            }
        });

    }

    ngOnDestroy(): void {
        if (this.dataAroundAppSub) { this.dataAroundAppSub.unsubscribe(); }
        if (this.yarnDataAroudAppSub) { this.yarnDataAroudAppSub.unsubscribe(); }
        if (this.yarnPlanListSub) { this.yarnPlanListSub.unsubscribe(); }

    }
}
