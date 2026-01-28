import { Component, OnDestroy, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import { DialogService } from 'primeng/dynamicdialog';
import { UserService } from 'src/app/services/user.service';
import { YarnService } from 'src/app/services/yarn.service';
import { Subscription } from 'rxjs';
import { Company, Factory } from 'src/app/models/app.model';
import { GBC } from 'src/app/global/const-global';
import { Customer } from 'src/app/models/order.model';
import { SmdYarnSeasonyearComponent } from 'src/app/shared/components/user/yarn/smd-yarn-seasonyear/smd-yarn-seasonyear.component';
import { SSelectCustomerComponent } from 'src/app/shared/components/general/s-select-customer/s-select-customer.component';
import { SSelectFactoryComponent } from 'src/app/shared/components/general/s-select-factory/s-select-factory.component';
import { MegaMenuItem, MenuItem } from 'primeng/api';
import { SmdYarnListsSelectComponent } from 'src/app/shared/components/user/yarn/smd-yarn-lists-select/smd-yarn-lists-select.component';
import { Yarn, YarnData } from 'src/app/models/yarn.model';

@Component({
  selector: 'app-yarn-report',
  templateUrl: './yarn-report.component.html',
  styleUrls: ['./yarn-report.component.scss'],
  providers: [DialogService],
})
export class YarnReportComponent implements OnInit, OnDestroy {
    formActive = 'yarn-report';
    formName = this.formActive;

    yarn: Yarn = GBC.clrYarn();
    yarns: Yarn[] = [];
    yarnsOld: Yarn[] = [];
    yarnsCount: number = 0;
    yarnPlans: YarnData[] = [];
    yarnPlansCount: number = 0;

    megaMenuItems: MegaMenuItem[] = [];
    loading = false;

    viewMode = 'yarnReport'; // ## plan , factoryStock, yarnTransferReport yarnReport
    mode = '';   // ##  yarnReport-list , yarnReport-transfer, yarnReport-stock-curren, fac-usage, com-usage
    company: Company = GBC.clrCompany();

    yarnID = '';
    yarnReportID = '';
    yarnReportName = '';
    yarnSeasonID = '';
    factorySelect: Factory = GBC.clrFactory();
    customer: Customer = GBC.clrCustomer();

    private dataAroundAppSub: Subscription = new Subscription();
    private yarnDataAroudAppSub: Subscription = new Subscription();
    private yarnReportSub: Subscription = new Subscription();
    private yarnPlanListSub: Subscription = new Subscription();

    constructor(
        // private route: ActivatedRoute,
        private router: Router,
        private location: Location,

        public dialogService: DialogService,

        public userService: UserService,
        public yarnService: YarnService,
    ) {}

    ngOnInit(): void {
        // console.log('app-yarn-report');
        this.location.replaceState('/'); // ## hide loocation
        this.yarnService.yarnIDReport = '';
        this.yarnService.yarnReportID = '';
        // ## get yarn report menu
        this.getYarnReportMenu();


        this.company = this.userService.getCompany();
        this.mode = 'yarnReport-list';

        this.yarnSeasonID = this.userService.yarnSeason;
        this.customer = this.userService.getCustomer();
        this.factorySelect = this.userService.factorySelect;
        this.userService.setYarnSeason(this.yarnSeasonID);
        this.userService.factorySelect = this.factorySelect;
        this.userService.setCustomer(this.customer);
        // this.userService.setCustomer(GBC.clrCustomer());
        // this.userService.factorySelect = GBC.clrFactory();


        this.dataAroundAppSub = this.userService.getDataAroundAppStatusListener().subscribe((dataAroundApp) => {
            // ## declare initial variable from service user

            this.customer = dataAroundApp.customer;
            this.factorySelect = dataAroundApp.factorySelect;
            this.yarnSeasonID = dataAroundApp.yarnSeason;

            const companyID = this.company.companyID;
            const factoryID = this.factorySelect.factoryID;
            const customerID = this.customer.customerID;
            if (companyID !== '' && factoryID !== '' && customerID !== '') {
                this.getYarPlansList();
            }

            if (this.mode === 'yarnReport-stock-current') {
                // this.mode = 'yarnReport-stock-current'; // ##  yarnReport-list , yarnReport-transfer, yarnReport-stock-curren, fac-usage, com-usage
                const yarnReportName = this.yarnService.getYarnReportName(this.mode);
                const factoryName = ' [ '+this.factorySelect.fInfo.factoryName + ' ] ';
                this.yarnReportName = factoryName + yarnReportName;
            }
        });

        this.yarnDataAroudAppSub = this.userService.getYarnDataAroudAppStatusListener().subscribe((yranDataAroundApp) => {
            // ##
            // this.mode = this.mode==='' ? 'list':this.mode;
            this.viewMode = yranDataAroundApp.viewMode;
            // console.log('2');
            // this.checkMode('');
        });
        this.yarnReportSub = this.yarnService.getYarnReportListener().subscribe((data) => {
                // console.log(data);
                this.yarnID = data.yarnID;
                this.yarnReportID = data.yarnReportID;
        });

        const companyID = this.company.companyID;
        const factoryID = this.factorySelect.factoryID;
        const customerID = this.customer.customerID;
        if (companyID !== '' && factoryID !== '' && customerID !== '') {
            this.getYarPlansList();
        }
    }

    getYarnReportMenu() {
        this.megaMenuItems = this.userService.getFormActiveMenu(this.formActive, 'app-yarn-report');
        // console.log(this.megaMenuItems);
        // console.log(  ((((this.megaMenuItems[0].items) as MenuItem[][])[0][0].items)as MenuItem[])[0]   );

        // ## report: yarnReport-transfer
        ((((this.megaMenuItems[0].items) as MenuItem[][])[0][0].items) as MenuItem[])[0].command = () => {
            this.mode = 'yarnReport-list'; // ##  yarnReport-list , yarnReport-transfer, yarnReport-stock-curren, fac-usage, com-usage
            this.yarnReportName = this.yarnService.getYarnReportName(this.mode);
            // console.log(this.viewMode, this.mode);
            // this.userService.setSelectFactoryDialogSelect(this.factory);
        }

        // ## report: yarnReport-transfer
        ((((this.megaMenuItems[0].items) as MenuItem[][])[1][0].items) as MenuItem[])[0].command = () => {
            this.mode = 'yarnReport-transfer'; // ##  yarnReport-list , yarnReport-transfer, yarnReport-stock-curren, fac-usage, com-usage
            this.yarnReportName = this.yarnService.getYarnReportName(this.mode);
            // console.log(this.viewMode, this.mode);
            // this.userService.setSelectFactoryDialogSelect(this.factory);
        }
        // ((((this.megaMenuItems[0].items) as MenuItem[][])[1][1].items) as MenuItem[])[0].command = () => {
        //     console.log('com-usage');
        //     this.mode = 'com-usage'; // ##  yarnReport-list , yarnReport-transfer, yarnReport-stock-curren, fac-usage, com-usage
        //     // this.mode = 'yarnReport-stock-current';
        //     // this.yarnReportName = this.yarnService.getYarnReportName(this.mode);
        //     // this.userService.setSelectFactoryDialogSelect(this.factory);
        // }
        ((((this.megaMenuItems[0].items) as MenuItem[][])[1][1].items) as MenuItem[])[0].command = () => {
            console.log('Com.Stock');
            this.mode = 'com-stock'; // ##  yarnReport-list , yarnReport-transfer, yarnReport-stock-curren, fac-usage, com-usage,com-stock
            // this.mode = 'yarnReport-stock-current';
            // this.yarnReportName = this.yarnService.getYarnReportName(this.mode);
            // this.userService.setSelectFactoryDialogSelect(this.factory);
        }

        // ## report: yarnReport-transfer
        ((((this.megaMenuItems[0].items) as MenuItem[][])[2][0].items) as MenuItem[])[0].command = () => {
            this.mode = 'yarnReport-stock-current'; // ##  yarnReport-list , yarnReport-transfer, yarnReport-stock-curren, fac-usage, com-usage
            const yarnReportName = this.yarnService.getYarnReportName(this.mode);
            const factoryName = ' [ '+this.factorySelect.fInfo.factoryName + ' ] ';
            this.yarnReportName = factoryName + yarnReportName;
            // console.log(this.viewMode, this.mode);
            // this.userService.setSelectFactoryDialogSelect(this.factory);
        }
        ((((this.megaMenuItems[0].items) as MenuItem[][])[2][1].items) as MenuItem[])[0].command = () => {
            console.log('fac-usage');
            this.mode = 'fac-usage'; // ##  yarnReport-list , yarnReport-transfer, yarnReport-stock-curren, fac-usage, com-usage
            // this.mode = 'yarnReport-stock-current';
            // this.yarnReportName = this.yarnService.getYarnReportName(this.mode);
            // this.userService.setSelectFactoryDialogSelect(this.factory);
        }
    }

    getYarPlansList() {
        // this.yarnPlan = GBC.clrYarnData();
        this.loading = true;
        // this.mode = 'list';
        const companyID = this.company.companyID;
        const factoryID = this.factorySelect.factoryID;
        const customerID = this.customer.customerID;
        const setName = this.customer.setName;
        const orderIDs = this.userService.getOrderIDss();
        // getYarPlansList(companyID: string, factoryID: string, customerID: string, setName: string, yarnSeason: string)
        // console.log(companyID, factoryID, customerID, setName, this.yarnSeasonID, orderIDs);

        this.yarnService.getYarPlansList(companyID, factoryID, customerID, setName, this.yarnSeasonID, orderIDs);
        if (this.yarnPlanListSub) { this.yarnPlanListSub.unsubscribe(); }
        this.yarnPlanListSub = this.yarnService.getYarnPlanListListener().subscribe((data) => {
            // console.log(data);
            this.loading = false;
            // yarnPlans: YarnData[], yarnPlansCount: number,
            this.yarnPlans = data.yarnPlans;
            this.yarnPlansCount = data.yarnPlansCount;
            this.yarnPlans.sort((a,b)=>{ return a.orderID >b.orderID?1:a.orderID <b.orderID?-1:0 });

            this.yarns = data.yarns;
            this.yarnsOld = this.yarns.map(obj => ({...obj})); // copy array object
            this.yarnsCount = data.yarnsCount;
            // console.log(this.yarns);
        });
    }

    // mode = yarnReport
    showYarnList(mode: string) {
        // this.yarnSelect = GBC.clrYarn();
        const ref = this.dialogService.open(SmdYarnListsSelectComponent, {
            data: {
                id: 'yarnSelection',
                company: this.userService?.getCompany(),
                yarns: this.yarns,
                // idx: idx,
                mode: mode,
                btnCaption: 'choose'

            },
            header: 'Yarn Selection',
            width: '80%',
        });

        ref.onClose.subscribe((data: any) => {
            // console.log(data);
            if (!data) {
                // console.log(data);
                // this.yarnLot[idx] = GBC.clrYarnData();
            } else if (mode === 'yarnReport') {
                this.yarn = data;
                this.yarnService.yarnIDReport = this.yarn.yarnID;
                this.yarnService.setYarnReportListenerToNext();
                // console.log(data , '.........................')
                // console.log(this.yarnLotInfo);
                // const yarnLot = [...this.yarnLot];
                // const yarnLotF = yarnLot.filter(i => i.yarnID === data.yarnID);
                // if (yarnLotF.length <= 0) {
                //     // this.yarnLot[idx].yarnID = data.yarnID;
                //     // console.log(this.yarnLot);
                //     this.getYarnLotCFInfo(data.yarnID, idx)
                // }
            }

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

    gotoYarnReportList(data: any) {
        console.log(data);
        // this.yarnPlan = GBC.clrYarnData();
        // this.yarnPlan = data.yarnPlan;
        // this.mode = data.mode;
        // this.mode = '';
    }

    ngOnDestroy(): void {
        if (this.dataAroundAppSub) { this.dataAroundAppSub.unsubscribe(); }
        if (this.yarnDataAroudAppSub) { this.yarnDataAroudAppSub.unsubscribe(); }
        if (this.yarnReportSub) { this.yarnReportSub.unsubscribe(); }
        if (this.yarnPlanListSub) { this.yarnPlanListSub.unsubscribe(); }

        // if (this.yarnReportSub) { this.yarnReportSub.unsubscribe(); }
        // if (this.yarnReportSub) { this.yarnReportSub.unsubscribe(); }
        // if (this.yarnReportSub) { this.yarnReportSub.unsubscribe(); }

    }
}
