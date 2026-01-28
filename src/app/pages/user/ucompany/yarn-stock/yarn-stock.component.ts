import { Component, OnDestroy, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import { UserService } from 'src/app/services/user.service';
import { ColorS, Company, Factory } from 'src/app/models/app.model';
import { GBC } from 'src/app/global/const-global';
import { Customer, OrderImage } from 'src/app/models/order.model';
import { Subscription } from 'rxjs';
import { DialogService } from 'primeng/dynamicdialog';
import { YarnService } from 'src/app/services/yarn.service';
import { SmdYarnSeasonyearComponent } from 'src/app/shared/components/user/yarn/smd-yarn-seasonyear/smd-yarn-seasonyear.component';
import { SSelectCustomerComponent } from 'src/app/shared/components/general/s-select-customer/s-select-customer.component';
import { SSelectFactoryComponent } from 'src/app/shared/components/general/s-select-factory/s-select-factory.component';
import { Yarn, YarnData } from 'src/app/models/yarn.model';
import { SYarnFilterComponent } from 'src/app/shared/components/general/s-yarn-filter/s-yarn-filter.component';
import { SmdSelectOrderComponent } from 'src/app/shared/components/general/smd-select-order/smd-select-order.component';

@Component({
  selector: 'app-yarn-stock',
  templateUrl: './yarn-stock.component.html',
  styleUrls: ['./yarn-stock.component.scss'],
  providers: [DialogService],
})
export class YarnStockComponent implements OnInit, OnDestroy  {
    formActive = 'yarn-stock';
    formName = this.formActive;
    productImageProfileGCSPath = GBC.productImageProfileGCSPath;  // ## google storage path
    nulltGCSPath= GBC.nulltGCSPath;

    loading = true;

    mode = ''; // ## list , create ,

    company: Company = GBC.clrCompany();
    yarnSeason = '';
    factorySelect: Factory = GBC.clrFactory();
    customer: Customer = GBC.clrCustomer();

    yarns: Yarn[] = [];
    yarnsCount: number = 0;
    yarnSelects: Yarn[] = [];
    orderImagesSelect: OrderImage[] = [];
    orderImages: OrderImage[] = [];

    yarnPlan: YarnData = GBC.clrYarnData();
    colorS: ColorS = GBC.clrOrderColor();
    yarnColorID = '';
    yarnID = '';
    uuid = '';

    private dataAroundAppSub: Subscription = new Subscription();

    constructor(
        private router: Router,
        private location: Location,
        public dialogService: DialogService,

        public userService: UserService,
        public yarnService: YarnService,
    ) {}


    ngOnInit(): void {
        this.location.replaceState('/'); // ## hide loocation
        // this.userService.setFormActive(this.formActive);

        this.yarnSeason = this.userService.yarnSeason;
        this.userService.setCustomer(GBC.clrCustomer());
        this.userService.factorySelect = GBC.clrFactory();

        this.dataAroundAppSub = this.userService
            .getDataAroundAppStatusListener()
            .subscribe((dataAroundApp) => {
                // ## declare initial variable from service user

                this.customer = dataAroundApp.customer;
                this.factorySelect = dataAroundApp.factorySelect;
                this.yarnSeason = dataAroundApp.yarnSeason;
                // this.checkMode();
            });
    }

    showYarnfilterModal() {
        const showList: string[] = ['yarnID'];
        const ref = this.dialogService.open(SYarnFilterComponent, {
            data: {
                id: 'yarnFilter',
                showList: showList,
                company: this.userService?.getCompany(),
                yarns: this.yarns,
                yarnsCount: this.yarnsCount,
                mode: 'yarn-lists-select',

            },
            header: 'Yarn Filter [ ' + this.customer.customerName+ ' ]',
            width: '80%'
        });

        ref.onClose.subscribe((data: Yarn) => {
            this.orderImagesSelect = [];
            // console.log(data);
            if (data) {
                const yarn1 = this.yarnSelects.filter(i=>(i.yarnID === data.yarnID));
                if (yarn1.length === 0) {
                    this.yarnSelects.push(data);
                    this.uuid = '';
                    this.yarnID = data.yarnID;
                }
            } else {
                this.yarnSelects = [];
            }
        });
    }

    // ## mode = orderID-selector
    showStyleSelector(mode: string, idx: number) {
        const ref = this.dialogService.open(SmdSelectOrderComponent, {
            data: {
                id: 'orderIDSelection',
                company: this.userService?.getCompany(),
                orderImages: this.orderImages,
                mode: mode,  // ## mode = orderID-selector
                idx: idx,
                btnCaption: 'choose'

            },
            header: 'orderID Selection',
            width: '80%',
        });

        ref.onClose.subscribe((data: any) => {
            // console.log(data);
            if (!data) {

            } else {
                this.yarnSelects = [];
                this.orderImagesSelect = [];
                this.orderImagesSelect.push(data.orderImage);
                // this.orderImagesSelect[idx] = {orderID: data.orderImage.orderID, imageProfile: data.orderImage.imageProfile};
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

    yarnRemove(idx: number) {
        // array.splice(i, 1);
        this.yarnSelects .splice(idx, 1);
        // this.orderImagesSelect.splice(idx, 1);
        // this.genOrderImagesSelect();
    }

    styleRemove(idx: number) {
        // array.splice(i, 1);
        this.orderImagesSelect.splice(idx, 1);
        // this.orderImagesSelect.splice(idx, 1);
        // this.genOrderImagesSelect();
    }

    ngOnDestroy(): void {
        if (this.dataAroundAppSub) { this.dataAroundAppSub.unsubscribe(); }
        // if (this.yarnPlanListSub) { this.yarnPlanListSub.unsubscribe(); }

    }
}
