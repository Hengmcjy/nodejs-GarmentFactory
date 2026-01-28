import { Component, OnDestroy, OnInit } from '@angular/core';
import { MessageService } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import { Subscription } from 'rxjs';

import { ColorS, Company, Factory, SizeS, TargetPlaceS } from 'src/app/models/app.model';
import { Customer, CustomerOR, MainZone, Order } from 'src/app/models/order.model';
import { CompanyCurrentProductQtyAll, CurrentCompanyOrder, CurrentCompanyProductQtyCountryAll, CurrentCompanyProductQtyCountryCSAll, CurrentCompanyProductQtyZoneAll, CurrentOrderStyle, CurrentProductQtyAllC, OrderStyleColorSize } from 'src/app/models/report.model';
import { CustomerService } from 'src/app/services/customer.service';

import { UcCustomerEditComponent } from 'src/app/pages/user/ucompany/uc-customer-edit/uc-customer-edit.component';

import { ReportService } from 'src/app/services/report.service';
import { UserService } from 'src/app/services/user.service';
import { OrderService } from 'src/app/services/order.service';
import { GBC } from 'src/app/global/const-global';

@Component({
    selector: 'app-s-rep-com-production-overall',
    templateUrl: './s-rep-com-production-overall.component.html',
    styleUrls: ['./s-rep-com-production-overall.component.scss'],
    providers: [DialogService, MessageService],
})
export class SRepComProductionOverallComponent implements OnInit, OnDestroy {
    formActive = 'repComProductionOverall';
    pageActive = this.formActive;
    formName = this.formActive;

    blockedPanel: boolean = false;
    seasonYear = '';

    reportHeader = 'Production';
    sizes: SizeS[] = [];
    colors: ColorS[] = [];
    company: Company = GBC.clrCompany();
    factories: Factory[] = [];
    factoryIDs: string[] = [];
    targetPlaces: TargetPlaceS[] = [];
    mainZone: MainZone[] = [];
    orders: Order[] = [];
    orderIDs: string[] = [];
    ordersCount = 0;
    orderColor: ColorS[] = [];

    orderStyleColorSize: OrderStyleColorSize[] = [];
    currentOrderStyle: CurrentOrderStyle[] = [];
    companyCurrentProductQtyAll: CompanyCurrentProductQtyAll[] = [];
    currentCompanyProductQtyZoneAll: CurrentCompanyProductQtyZoneAll[] = [];
    currentCompanyProductQtyZoneCompleteAll: CurrentCompanyProductQtyZoneAll[] = [];
    currentCompanyProductQtyCountryAll: CurrentCompanyProductQtyCountryAll[] = [];
    currentCompanyProductQtyCountryCompleteAll: CurrentCompanyProductQtyCountryAll[] = [];
    currentCompanyProductQtyCountryCSAll: CurrentCompanyProductQtyCountryCSAll[] = [];
    currentCompanyProductQtyCountryCSCompleteAll: CurrentCompanyProductQtyCountryCSAll[] = [];


    lastColor = '';
    currentProductQtyAllC: CurrentProductQtyAllC[] = [];
    currentProductQtyAllCompleteC: CurrentProductQtyAllC[] = [];
    currentAllProductQtyStyleGroup: any[] = [];
    currentAllProductQtyStyleCompleteGroup: any[] = [];

    currentAllProductQtyCountryCSGroup: any[] = [];
    currentAllProductQtyCountryCSCompleteGroup: any[] = [];
    currentCompanyOrderCountry: CurrentCompanyOrder[] = [];
    currentCompanyOrderZone: CurrentCompanyOrder[] = [];
    currentCompanyOrderZoneStyle: CurrentCompanyOrder[] = [];
    currentCompanyOrderCountryStyle: CurrentCompanyOrder[] = [];

    private repCompanyProductionSub: Subscription = new Subscription;
    private customer1CompanySub: Subscription = new Subscription;
    private ordersByOrderIDsSub: Subscription = new Subscription;
    private dataAroundAppSub: Subscription = new Subscription;

    constructor(
        public dialogService: DialogService,
        public messageService: MessageService,

        public userService: UserService,
        private orderService: OrderService,
        private cusService: CustomerService,
        private repService: ReportService,
    ) {}

    ngOnInit(): void {
        this.reportHeader = this.userService.translateCode('nu', 'nu-production');
        this.company = this.userService.getCompany();
        this.factories = this.userService.getFactories();
        this.targetPlaces = this.userService.targetPlaces;
        this.mainZone = this.userService.getMainZoneTargetPlace(this.targetPlaces);
        this.orders = this.orderService.getOrdersArr();
        this.sizes = this.userService.sizes;
        this.colors = this.userService.colors;
        this.seasonYear = this.userService.seasonYear;

        this.dataAroundAppSub = this.userService.getDataAroundAppStatusListener().subscribe(dataAroundApp => {
            if (this.seasonYear !== this.userService.seasonYear) {
                this.seasonYear = this.userService.seasonYear;
                // this.getRepCurrentProductQtyCom();
            }
        });

        this.lastColor = '';
        this.factoryIDs = this.userService.getFactoryIDArr(this.factories);
        this.getRepCurrentProductQtyCom();
    }

    getRepCurrentProductQtyCom() {
        // console.log('getRepCurrentProductQtyCom');
        this.blockedPanel = true;
        this.lastColor = '';
        this.orders = [];
        const seasonYear = this.userService.seasonYear;
        const ordertatus = ['open'];
        const productStatus = ['normal', 'problem', 'repaired'];
        const orderIDArr = Array.from(new Set(this.userService.getOrders().map((item: any) => item.orderID)));
        this.repService.getRepCurrentProductQtyCom(this.company.companyID, this.factoryIDs, productStatus, ordertatus, orderIDArr, seasonYear);
        if (this.repCompanyProductionSub) { this.repCompanyProductionSub.unsubscribe(); }
        this.repCompanyProductionSub = this.repService.getRepCurrentCompanyProductQtyAllUpdatedListener().subscribe((data) => {
            // console.log(data);
            this.blockedPanel = false;
            this.orderStyleColorSize = data.orderStyleColorSize;
            this.currentOrderStyle = data.currentOrderStyle;
            this.currentOrderStyle.sort((a,b)=>{ return a.style >b.style?1:a.style <b.style?-1:0 });
            // console.log(this.currentOrderStyle);

            this.companyCurrentProductQtyAll = data.companyCurrentProductQtyAll;

            this.currentCompanyOrderCountry = data.currentCompanyOrderCountry;
            this.currentCompanyOrderZone = data.currentCompanyOrderZone;

            this.currentCompanyOrderZoneStyle = data.currentCompanyOrderZoneStyle;
            this.currentCompanyOrderCountryStyle = data.currentCompanyOrderCountryStyle;

            this.currentCompanyProductQtyZoneAll = data.currentCompanyProductQtyZoneAll;
            this.currentCompanyProductQtyZoneCompleteAll = data.currentCompanyProductQtyZoneCompleteAll;

            this.currentProductQtyAllC = data.currentProductQtyAllC;
            this.currentProductQtyAllCompleteC = data.currentProductQtyAllCompleteC;

            this.currentCompanyProductQtyCountryAll = data.currentCompanyProductQtyCountryAll;
            this.currentCompanyProductQtyCountryCompleteAll = data.currentCompanyProductQtyCountryCompleteAll;

            this.currentCompanyProductQtyCountryCSAll = data.currentCompanyProductQtyCountryCSAll;
            this.currentCompanyProductQtyCountryCSCompleteAll = data.currentCompanyProductQtyCountryCSCompleteAll;

            this.orderIDs = Array.from(new Set(this.currentCompanyOrderCountry.map((item: any) => item.orderID)));
            this.getOrdersByOrderIDs(this.orderIDs);

            // console.log(this.targetPlaces);
            // console.log(this.orderIDs);
            // console.log(this.currentCompanyOrderCountry);
            // console.log(this.currentCompanyOrderZone);
            // console.log(this.currentCompanyOrderZoneStyle);
            // console.log(this.currentCompanyOrderCountryStyle);
            // console.log(this.companyCurrentProductQtyAll);
            // console.log(this.currentCompanyProductQtyZoneAll);
            // console.log(this.currentCompanyProductQtyZoneCompleteAll);
            // console.log(this.currentOrderStyle);

            // console.log(this.currentProductQtyAllC);
            // console.log(this.currentProductQtyAllCompleteC);

            // console.log(this.currentCompanyProductQtyCountryAll);
            // console.log(this.currentCompanyProductQtyCountryCompleteAll);

            // console.log(this.currentCompanyProductQtyCountryCSAll);
            // console.log(this.currentCompanyProductQtyCountryCSCompleteAll);

            // // ## replace - to empty
            // this.currentCompanyOrderZone.forEach( (item, index) => {
            //     item.productSize = this.userService.strReplaceAll(item.productSize, '-', '');
            //     // item.color = this.userService.strReplaceAll(item.color, '-', '');
            //     item.targetPlaceID = this.userService.strReplaceAll(item.targetPlaceID, '-', '');
            // });
            // this.currentCompanyOrderCountry.forEach( (item, index) => {
            //     item.productSize = this.userService.strReplaceAll(item.productSize, '-', '');
            //     item.countryID = this.userService.strReplaceAll(item.countryID, '-', '');
            //     item.targetPlaceID = this.userService.strReplaceAll(item.targetPlaceID, '-', '');
            // });
            // this.currentCompanyOrderZoneStyle.forEach( (item, index) => {
            //     // item.productSize = this.userService.strReplaceAll(item.productSize, '-', '');
            //     // item.color = this.userService.strReplaceAll(item.color, '-', '');
            //     item.targetPlaceID = this.userService.strReplaceAll(item.targetPlaceID, '-', '');
            // });
            // this.currentCompanyOrderCountryStyle.forEach( (item, index) => {
            //     // item.productSize = this.userService.strReplaceAll(item.productSize, '-', '');
            //     // item.color = this.userService.strReplaceAll(item.color, '-', '');
            //     item.targetPlaceID = this.userService.strReplaceAll(item.targetPlaceID, '-', '');
            // });


            // // ## replace - to empty --- currentCompanyProductQtyZoneAll
            // this.currentCompanyProductQtyZoneAll.forEach( (item, index) => {
            //     item.targetPlace = this.userService.strReplaceAll(item.targetPlace, '-', '');
            // });
            // this.currentCompanyProductQtyZoneCompleteAll.forEach( (item, index) => {
            //     item.targetPlace = this.userService.strReplaceAll(item.targetPlace, '-', '');
            // });
            // this.currentCompanyProductQtyCountryAll.forEach( (item, index) => {
            //     item.countryID = this.userService.strReplaceAll(item.countryID, '-', '');
            // });
            // this.currentCompanyProductQtyCountryCompleteAll.forEach( (item, index) => {
            //     item.countryID = this.userService.strReplaceAll(item.countryID, '-', '');
            // });

            // // ## replace - to empty
            // this.currentProductQtyAllC.forEach( (item, index) => {
            //     item.size = this.userService.strReplaceAll(item.size, '-', '');
            //     item.color = this.userService.strReplaceAll(item.color, '-', '');
            //     item.targetPlace = this.userService.strReplaceAll(item.targetPlace, '-', '');
            // });
            // // ## change color text to textComma
            // this.currentProductQtyAllC.forEach( (item, index) => {
            //     item.color = this.userService.changeColorTextToColorTextComma(item.color);
            //     item.sizeSeq = this.userService.getSizeSeq(item.size);
            // });
            // // console.log(this.currentProductQtyAllC);

            // // ## set size seq for currentProductQtyAllC

            // // ## set group all factory
            // this.currentProductQtyAllC.sort((a,b)=>{
            //     return a.style >b.style?1:a.style <b.style?-1:0
            //     || a.color >b.color?1:a.color <b.color?-1:0
            //     || a.sizeSeq >b.sizeSeq?1:a.sizeSeq <b.sizeSeq?-1:0
            // });
            // // console.log(this.currentProductQtyAllC);
            // this.currentAllProductQtyStyleGroup = this.userService.groupBy(this.currentProductQtyAllC, (c: any) => c.style);
            // // console.log(this.currentAllProductQtyStyleGroup);
            // // this.currentAllProductQtyStyleGroup = this.groupBy(this.currentProductQtyAllC, (c: any) => c.color);

            // this.currentAllProductQtyStyleGroup = Object.values(this.currentAllProductQtyStyleGroup);
            // // console.log(this.currentAllProductQtyStyleGroup);

            // // this.currentProductQtyAllCF.sort((a,b)=>{
            // //     return a.factoryID >b.factoryID?1:a.factoryID <b.factoryID?-1:0
            // //         || a.style >b.style?1:a.style <b.style?-1:0
            // // });

            // // currentAllProductQtyStyleCompleteGroup
            // // ## replace - to empty
            // this.currentProductQtyAllCompleteC.forEach( (item, index) => {
            //     item.size = this.userService.strReplaceAll(item.size, '-', '');
            //     item.color = this.userService.strReplaceAll(item.color, '-', '');
            //     item.targetPlace = this.userService.strReplaceAll(item.targetPlace, '-', '');
            // });
            // // ## change color text to textComma
            // this.currentProductQtyAllCompleteC.forEach( (item, index) => {
            //     item.color = this.userService.changeColorTextToColorTextComma(item.color);
            //     item.sizeSeq = this.userService.getSizeSeq(item.size);
            // });
            // // console.log(this.currentProductQtyAllC);

            // // ## set size seq for currentProductQtyAllC

            // // ## set group all factory
            // this.currentProductQtyAllCompleteC.sort((a,b)=>{
            //     return a.style >b.style?1:a.style <b.style?-1:0
            //     || a.color >b.color?1:a.color <b.color?-1:0
            //     || a.sizeSeq >b.sizeSeq?1:a.sizeSeq <b.sizeSeq?-1:0
            // });
            // this.currentAllProductQtyStyleCompleteGroup = this.userService.groupBy(this.currentProductQtyAllCompleteC, (c: any) => c.style);
            // // console.log(this.currentAllProductQtyStyleCompleteGroup);

            // this.currentAllProductQtyStyleCompleteGroup = Object.values(this.currentAllProductQtyStyleCompleteGroup);
            // // console.log(this.currentAllProductQtyStyleCompleteGroup);


            // /////////////////////////////////////////////---------------------------------
            // // ## replace - to empty
            // this.currentCompanyProductQtyCountryCSAll.forEach( (item, index) => {
            //     item.size = this.userService.strReplaceAll(item.size, '-', '');
            //     item.color = this.userService.strReplaceAll(item.color, '-', '');
            //     item.countryID = this.userService.strReplaceAll(item.countryID, '-', '');
            // });
            // // ## change color text to textComma
            // this.currentCompanyProductQtyCountryCSAll.forEach( (item, index) => {
            //     item.color = this.userService.changeColorTextToColorTextComma(item.color);
            //     item.sizeSeq = this.userService.getSizeSeq(item.size);
            // });
            // // console.log(this.currentProductQtyAllC);

            // // ## set size seq for currentProductQtyAllC

            // // ## set group all factory
            // this.currentCompanyProductQtyCountryCSAll.sort((a,b)=>{
            //     return a.style >b.style?1:a.style <b.style?-1:0
            //     || a.color >b.color?1:a.color <b.color?-1:0
            //     || a.sizeSeq >b.sizeSeq?1:a.sizeSeq <b.sizeSeq?-1:0
            // });
            // this.currentAllProductQtyCountryCSGroup = this.userService.groupBy(this.currentCompanyProductQtyCountryCSAll, (c: any) => c.style);
            // // console.log(this.currentAllProductQtyCountryCSGroup);

            // this.currentAllProductQtyCountryCSGroup = Object.values(this.currentAllProductQtyCountryCSGroup);
            // // console.log(this.currentAllProductQtyCountryCSGroup);

            // // currentAllProductQtyCountryCSCompleteGroup
            // this.currentCompanyProductQtyCountryCSCompleteAll.forEach( (item, index) => {
            //     item.size = this.userService.strReplaceAll(item.size, '-', '');
            //     item.color = this.userService.strReplaceAll(item.color, '-', '');
            //     item.countryID = this.userService.strReplaceAll(item.countryID, '-', '');
            // });
            // // ## change color text to textComma
            // this.currentCompanyProductQtyCountryCSCompleteAll.forEach( (item, index) => {
            //     item.color = this.userService.changeColorTextToColorTextComma(item.color);
            //     item.sizeSeq = this.userService.getSizeSeq(item.size);
            // });
            // // console.log(this.currentProductQtyAllC);

            // // ## set size seq for currentProductQtyAllC

            // // ## set group all factory
            // this.currentCompanyProductQtyCountryCSCompleteAll.sort((a,b)=>{
            //     return a.style >b.style?1:a.style <b.style?-1:0
            //     || a.color >b.color?1:a.color <b.color?-1:0
            //     || a.sizeSeq >b.sizeSeq?1:a.sizeSeq <b.sizeSeq?-1:0
            // });
            // this.currentAllProductQtyCountryCSCompleteGroup = this.userService.groupBy(this.currentCompanyProductQtyCountryCSCompleteAll, (c: any) => c.style);
            // // console.log(this.currentAllProductQtyCountryCSCompleteGroup);

            // this.currentAllProductQtyCountryCSCompleteGroup = Object.values(this.currentAllProductQtyCountryCSCompleteGroup);
            // // console.log(this.currentAllProductQtyCountryCSCompleteGroup);
        });

    }

    getOrdersByOrderIDs(orderIDs: string[]) {
        // getOrdersByOrderIDs(companyID: string, orderIDs: string[])
        // console.log(orderIDs);
        this.orderService.getOrdersByOrderIDs(this.company.companyID, orderIDs);
        if (this.ordersByOrderIDsSub) { this.ordersByOrderIDsSub.unsubscribe(); }
        this.ordersByOrderIDsSub = this.orderService.getOrdersByOrderIDsListener().subscribe((data) => {
            // console.log(data);
            this.orders = data.orders;
            this.ordersCount = data.ordersCount;
            // this.orderStyleColorSize = this.repService.setColorSeq(this.orders.orderColors, this.orderStyleColorSize);

            // ## replace - to empty
            this.currentCompanyOrderZone.forEach( (item, index) => {
                item.productSize = this.userService.strReplaceAll(item.productSize, '-', '');
                // item.color = this.userService.strReplaceAll(item.color, '-', '');
                item.targetPlaceID = this.userService.strReplaceAll(item.targetPlaceID, '-', '');
            });
            this.currentCompanyOrderCountry.forEach( (item, index) => {
                item.productSize = this.userService.strReplaceAll(item.productSize, '-', '');
                item.countryID = this.userService.strReplaceAll(item.countryID, '-', '');
                item.targetPlaceID = this.userService.strReplaceAll(item.targetPlaceID, '-', '');
            });
            this.currentCompanyOrderZoneStyle.forEach( (item, index) => {
                // item.productSize = this.userService.strReplaceAll(item.productSize, '-', '');
                // item.color = this.userService.strReplaceAll(item.color, '-', '');
                item.targetPlaceID = this.userService.strReplaceAll(item.targetPlaceID, '-', '');
            });
            this.currentCompanyOrderCountryStyle.forEach( (item, index) => {
                // item.productSize = this.userService.strReplaceAll(item.productSize, '-', '');
                // item.color = this.userService.strReplaceAll(item.color, '-', '');
                item.targetPlaceID = this.userService.strReplaceAll(item.targetPlaceID, '-', '');
            });


            // ## replace - to empty --- currentCompanyProductQtyZoneAll
            this.currentCompanyProductQtyZoneAll.forEach( (item, index) => {
                item.targetPlace = this.userService.strReplaceAll(item.targetPlace, '-', '');
            });
            this.currentCompanyProductQtyZoneCompleteAll.forEach( (item, index) => {
                item.targetPlace = this.userService.strReplaceAll(item.targetPlace, '-', '');
            });
            this.currentCompanyProductQtyCountryAll.forEach( (item, index) => {
                item.countryID = this.userService.strReplaceAll(item.countryID, '-', '');
            });
            this.currentCompanyProductQtyCountryCompleteAll.forEach( (item, index) => {
                item.countryID = this.userService.strReplaceAll(item.countryID, '-', '');
            });

            // ## replace - to empty
            this.currentProductQtyAllC.forEach( (item, index) => {
                item.size = this.userService.strReplaceAll(item.size, '-', '');
                item.color = this.userService.strReplaceAll(item.color, '-', '');
                item.targetPlace = this.userService.strReplaceAll(item.targetPlace, '-', '');
            });
            // ## change color text to textComma
            this.currentProductQtyAllC.forEach( (item, index) => {
                item.color = this.userService.changeColorTextToColorTextComma(item.color);
                item.sizeSeq = this.userService.getSizeSeq(item.size);
            });
            // console.log(this.currentProductQtyAllC);

            // const fff = this.currentProductQtyAllC.filter(i=>( i.productID == 'BA1ODA3A    '));
            // console.log(fff);

            // ## set size seq for currentProductQtyAllC

            // ## set group all factory
            this.currentProductQtyAllC.sort((a,b)=>{
                return a.style >b.style?1:a.style <b.style?-1:0
                || a.color >b.color?1:a.color <b.color?-1:0
                || a.sizeSeq >b.sizeSeq?1:a.sizeSeq <b.sizeSeq?-1:0
            });
            // console.log(this.currentProductQtyAllC);
            this.currentAllProductQtyStyleGroup = this.userService.groupBy(this.currentProductQtyAllC, (c: any) => c.style);
            // console.log(this.currentAllProductQtyStyleGroup);
            // this.currentAllProductQtyStyleGroup = this.groupBy(this.currentProductQtyAllC, (c: any) => c.color);

            this.currentAllProductQtyStyleGroup = Object.values(this.currentAllProductQtyStyleGroup);
            // console.log(this.currentAllProductQtyStyleGroup);

            // this.currentProductQtyAllCF.sort((a,b)=>{
            //     return a.factoryID >b.factoryID?1:a.factoryID <b.factoryID?-1:0
            //         || a.style >b.style?1:a.style <b.style?-1:0
            // });

            // currentAllProductQtyStyleCompleteGroup
            // ## replace - to empty
            this.currentProductQtyAllCompleteC.forEach( (item, index) => {
                item.size = this.userService.strReplaceAll(item.size, '-', '');
                item.color = this.userService.strReplaceAll(item.color, '-', '');
                item.targetPlace = this.userService.strReplaceAll(item.targetPlace, '-', '');
            });
            // ## change color text to textComma
            this.currentProductQtyAllCompleteC.forEach( (item, index) => {
                item.color = this.userService.changeColorTextToColorTextComma(item.color);
                item.sizeSeq = this.userService.getSizeSeq(item.size);
            });
            // console.log(this.currentProductQtyAllC);

            // ## set size seq for currentProductQtyAllC

            // ## set group all factory
            this.currentProductQtyAllCompleteC.sort((a,b)=>{
                return a.style >b.style?1:a.style <b.style?-1:0
                || a.color >b.color?1:a.color <b.color?-1:0
                || a.sizeSeq >b.sizeSeq?1:a.sizeSeq <b.sizeSeq?-1:0
            });
            this.currentAllProductQtyStyleCompleteGroup = this.userService.groupBy(this.currentProductQtyAllCompleteC, (c: any) => c.style);
            // console.log(this.currentAllProductQtyStyleCompleteGroup);

            this.currentAllProductQtyStyleCompleteGroup = Object.values(this.currentAllProductQtyStyleCompleteGroup);
            // console.log(this.currentAllProductQtyStyleCompleteGroup);


            /////////////////////////////////////////////---------------------------------
            // ## replace - to empty
            this.currentCompanyProductQtyCountryCSAll.forEach( (item, index) => {
                item.size = this.userService.strReplaceAll(item.size, '-', '');
                item.color = this.userService.strReplaceAll(item.color, '-', '');
                item.countryID = this.userService.strReplaceAll(item.countryID, '-', '');
            });
            // ## change color text to textComma
            this.currentCompanyProductQtyCountryCSAll.forEach( (item, index) => {
                item.color = this.userService.changeColorTextToColorTextComma(item.color);
                item.sizeSeq = this.userService.getSizeSeq(item.size);
            });
            // console.log(this.currentProductQtyAllC);

            // ## set size seq for currentProductQtyAllC

            // ## set group all factory
            this.currentCompanyProductQtyCountryCSAll.sort((a,b)=>{
                return a.style >b.style?1:a.style <b.style?-1:0
                || a.color >b.color?1:a.color <b.color?-1:0
                || a.sizeSeq >b.sizeSeq?1:a.sizeSeq <b.sizeSeq?-1:0
            });
            this.currentAllProductQtyCountryCSGroup = this.userService.groupBy(this.currentCompanyProductQtyCountryCSAll, (c: any) => c.style);
            // console.log(this.currentAllProductQtyCountryCSGroup);

            this.currentAllProductQtyCountryCSGroup = Object.values(this.currentAllProductQtyCountryCSGroup);
            // console.log(this.currentAllProductQtyCountryCSGroup);

            // currentAllProductQtyCountryCSCompleteGroup
            this.currentCompanyProductQtyCountryCSCompleteAll.forEach( (item, index) => {
                item.size = this.userService.strReplaceAll(item.size, '-', '');
                item.color = this.userService.strReplaceAll(item.color, '-', '');
                item.countryID = this.userService.strReplaceAll(item.countryID, '-', '');
            });
            // ## change color text to textComma
            this.currentCompanyProductQtyCountryCSCompleteAll.forEach( (item, index) => {
                item.color = this.userService.changeColorTextToColorTextComma(item.color);
                item.sizeSeq = this.userService.getSizeSeq(item.size);
            });
            // console.log(this.currentProductQtyAllC);

            // ## set size seq for currentProductQtyAllC

            // ## set group all factory
            this.currentCompanyProductQtyCountryCSCompleteAll.sort((a,b)=>{
                return a.style >b.style?1:a.style <b.style?-1:0
                || a.color >b.color?1:a.color <b.color?-1:0
                || a.sizeSeq >b.sizeSeq?1:a.sizeSeq <b.sizeSeq?-1:0
            });
            this.currentAllProductQtyCountryCSCompleteGroup = this.userService.groupBy(this.currentCompanyProductQtyCountryCSCompleteAll, (c: any) => c.style);
            // console.log(this.currentAllProductQtyCountryCSCompleteGroup);

            this.currentAllProductQtyCountryCSCompleteGroup = Object.values(this.currentAllProductQtyCountryCSCompleteGroup);
            // console.log(this.currentAllProductQtyCountryCSCompleteGroup);


        });
    }

    getOrderTargetPlace(orderID: string) {
        let orderTargetPlace: TargetPlaceS[] = [];
        const order: Order[] = this.orders.filter(i=>i.companyID == this.company.companyID && i.orderID == orderID.trim());
        // console.log(order, orderID);
        if (order.length > 0) {
            return order[0].orderTargetPlace;
        }
        return orderTargetPlace;
    }

    findOrderQty(currentAllProductQtyStyleGroup: any) {
        const currentOrderStyleF = this.currentOrderStyle.filter(i=>(
            i.companyID == currentAllProductQtyStyleGroup.companyID &&
            i.productID == currentAllProductQtyStyleGroup.productID && i.style == currentAllProductQtyStyleGroup.style
        ));
        if (currentOrderStyleF.length > 0) {
            return currentOrderStyleF[0].sumQty;
        }
        return '';
    }

    // findProductQtyComplete(order, 'complete')
    findProductQtyComplete(currentOrderStyle: CurrentOrderStyle, mode: string) {
        const companyCurrentProductQtyAllF = this.companyCurrentProductQtyAll.filter(i=>(
            i.companyID == currentOrderStyle.companyID && i.orderID == currentOrderStyle.orderID &&
            i.productID == currentOrderStyle.productID && i.style == currentOrderStyle.style
        ));
        if (companyCurrentProductQtyAllF.length > 0) {
            if (mode === 'complete') {
                return companyCurrentProductQtyAllF[0].completeQty;
            } else if (mode === 'inProduction') {
                return companyCurrentProductQtyAllF[0].countQty;
            } else if (mode === 'remain') {
                let remain = 0;
                // console.log(currentOrderStyle.sumQty , companyCurrentProductQtyAllF[0].completeQty, companyCurrentProductQtyAllF[0].countQty);
                remain = +currentOrderStyle.sumQty - (+companyCurrentProductQtyAllF[0].completeQty + +companyCurrentProductQtyAllF[0].countQty);
                return remain;
            } else {
                return '';
            }
        }
        return '';
    }

    // this.currentCompanyProductQtyZoneAll
    // currentOrderStyle: CurrentOrderStyle  currentCompanyProductQtyZoneAll: CurrentCompanyProductQtyZoneAll
    findCompanyProductQtyZoneAll(currentOrderStyle: CurrentOrderStyle, targetPlace: string) {
        const currentCompanyProductQtyZoneAllF = this.currentCompanyProductQtyZoneAll.filter(i=>(
            i.companyID == currentOrderStyle.companyID &&
            i.productID == currentOrderStyle.productID && i.style == currentOrderStyle.style &&
            i.targetPlace == targetPlace
        ));
        if (currentCompanyProductQtyZoneAllF.length > 0) {
            return currentCompanyProductQtyZoneAllF[0].countQty;
        }
        return '_';
    }

    findCompanyOrderQtyZoneAll(currentOrderStyle: CurrentOrderStyle, targetPlace: string) {
        const currentCompanyOrderZone = this.currentCompanyOrderZoneStyle.filter(i=>(
            i.companyID == currentOrderStyle.companyID &&
            i.productID == currentOrderStyle.productID && i.style == currentOrderStyle.style &&
            i.targetPlaceID == targetPlace
        ));
        if (currentCompanyOrderZone.length > 0) {
            return currentCompanyOrderZone[0].sumQty;
        }
        return 0;
    }

    findCompanyOrderQtyZoneRemainAll(currentOrderStyle: CurrentOrderStyle, targetPlace: string) {
        const currentCompanyProductQtyZoneCompleteAllF = this.findCompanyProductQtyZoneCompleteAll(currentOrderStyle, targetPlace);
        const currentCompanyProductQtyZoneAllF = this.findCompanyProductQtyZoneAll(currentOrderStyle, targetPlace);
        const currentCompanyOrderZone = this.findCompanyOrderQtyZoneAll(currentOrderStyle, targetPlace);
        let currentCompanyProductQtyZoneCompleteAll = 0;
        if (currentCompanyProductQtyZoneCompleteAllF === '_') {
            currentCompanyProductQtyZoneCompleteAll = 0
        } else {
            currentCompanyProductQtyZoneCompleteAll = currentCompanyProductQtyZoneCompleteAllF
        }
        let currentCompanyProductQtyZoneAll = 0;
        if (currentCompanyProductQtyZoneAllF === '_') {
            currentCompanyProductQtyZoneAll = 0
        } else {
            currentCompanyProductQtyZoneAll = currentCompanyProductQtyZoneAllF
        }
        const companyOrderQtyZoneRemainAll =
            +currentCompanyOrderZone - +currentCompanyProductQtyZoneCompleteAll - +currentCompanyProductQtyZoneAll;
        if (companyOrderQtyZoneRemainAll < 0) {
            return 0;
        } else {

            return companyOrderQtyZoneRemainAll;
        }
    }

    findCompanyOrderQtyZoneForLoss(currentOrderStyle: CurrentOrderStyle, targetPlace: string) {
        const currentCompanyProductQtyZoneCompleteAllF = this.findCompanyProductQtyZoneCompleteAll(currentOrderStyle, targetPlace);
        const currentCompanyProductQtyZoneAllF = this.findCompanyProductQtyZoneAll(currentOrderStyle, targetPlace);
        const currentCompanyOrderZone = this.findCompanyOrderQtyZoneAll(currentOrderStyle, targetPlace);
        let currentCompanyProductQtyZoneCompleteAll = 0;
        if (currentCompanyProductQtyZoneCompleteAllF === '_') {
            currentCompanyProductQtyZoneCompleteAll = 0
        } else {
            currentCompanyProductQtyZoneCompleteAll = currentCompanyProductQtyZoneCompleteAllF
        }
        let currentCompanyProductQtyZoneAll = 0;
        if (currentCompanyProductQtyZoneAllF === '_') {
            currentCompanyProductQtyZoneAll = 0
        } else {
            currentCompanyProductQtyZoneAll = currentCompanyProductQtyZoneAllF
        }
        const companyOrderQtyZoneRemainAll =
            +currentCompanyOrderZone - +currentCompanyProductQtyZoneCompleteAll - +currentCompanyProductQtyZoneAll;
        if (companyOrderQtyZoneRemainAll >= 0) {
            return '';
        } else {

            return '('+ Math.abs(companyOrderQtyZoneRemainAll) +')';
        }
    }

    // this.currentCompanyProductQtyZoneCompleteAll
    findCompanyProductQtyZoneCompleteAll(currentOrderStyle: CurrentOrderStyle, targetPlace: string) {
        const currentCompanyProductQtyZoneCompleteAllF = this.currentCompanyProductQtyZoneCompleteAll.filter(i=>(
            i.companyID == currentOrderStyle.companyID &&
            i.productID == currentOrderStyle.productID && i.style == currentOrderStyle.style &&
            i.targetPlace == targetPlace
        ));
        if (currentCompanyProductQtyZoneCompleteAllF.length > 0) {
            return currentCompanyProductQtyZoneCompleteAllF[0].countQty;
        }
        return '_';
    }

    finndCompanyProductQtyZoneAllRemain(currentOrderStyle: CurrentOrderStyle, mode: string) {
        let remain = 0
        let styleQtyTotal = 0;
        let styleQtyCompleteTotal = 0;

        this.mainZone.forEach( (item, index) => {
            const currentCompanyProductQtyZoneAll = this.currentCompanyProductQtyZoneAll.filter(i=>(
                i.companyID === currentOrderStyle.companyID && i.productID === currentOrderStyle.productID &&
                i.style === currentOrderStyle.style && i.targetPlace === item.targetPlaceID
            ));
            if (currentCompanyProductQtyZoneAll.length > 0) {
                styleQtyTotal = styleQtyTotal + currentCompanyProductQtyZoneAll[0].countQty;
            }

            const currentCompanyProductQtyZoneCompleteAll = this.currentCompanyProductQtyZoneCompleteAll.filter(i=>(
                i.companyID === currentOrderStyle.companyID && i.productID === currentOrderStyle.productID &&
                i.style === currentOrderStyle.style && i.targetPlace === item.targetPlaceID
            ));
            if (currentCompanyProductQtyZoneCompleteAll.length > 0) {
                styleQtyCompleteTotal = styleQtyCompleteTotal + currentCompanyProductQtyZoneCompleteAll[0].countQty;
            }
        });


        remain = +currentOrderStyle.sumQty - +styleQtyTotal - +styleQtyCompleteTotal;
        if (mode === 'qty') {
            if (remain > 0) {
                return remain;
            }0
        } else if (mode === 'percent') {
            if (remain > 0) {
                return Math.floor(remain/currentOrderStyle.sumQty*100)+'%';
            } else {
                return '0%';
            }
        }

        return '_';
    }

    findCompanyProductQtyCountryAll(currentOrderStyle: CurrentOrderStyle, countryID: string) {
        const currentCompanyProductQtyCountryAllF = this.currentCompanyProductQtyCountryAll.filter(i=>(
            i.companyID == currentOrderStyle.companyID &&
            i.productID == currentOrderStyle.productID && i.style == currentOrderStyle.style &&
            i.countryID == countryID
        ));
        if (currentCompanyProductQtyCountryAllF.length > 0) {
            return currentCompanyProductQtyCountryAllF[0].countQty;
        }
        return '_';
    }

    findCompanyOrderQtyCountryAll(currentOrderStyle: CurrentOrderStyle, countryID: string) {
        const currentCompanyProductQtyCountryAllF = this.currentCompanyOrderCountryStyle.filter(i=>(
            i.companyID == currentOrderStyle.companyID &&
            i.productID == currentOrderStyle.productID && i.style == currentOrderStyle.style &&
            i.countryID == countryID
        ));
        if (currentCompanyProductQtyCountryAllF.length > 0) {
            return currentCompanyProductQtyCountryAllF[0].sumQty;
        }
        return '';
    }

    findCompanyOrderQtyCountryRemainAll(currentOrderStyle: CurrentOrderStyle, countryID: string) {
        const currentCompanyProductQtyCountryCompleteAllF =  this.findCompanyProductQtyCountryCompleteAll(currentOrderStyle, countryID);
        const currentCompanyProductQtyCountryAllF =  this.findCompanyProductQtyCountryAll(currentOrderStyle, countryID);
        const companyOrderQtyCountryAll =  this.findCompanyOrderQtyCountryAll(currentOrderStyle, countryID);

        let currentCompanyProductQtyCountryCompleteAll = 0;
        if (currentCompanyProductQtyCountryCompleteAllF === '_') {
            currentCompanyProductQtyCountryCompleteAll = 0
        } else {
            currentCompanyProductQtyCountryCompleteAll = currentCompanyProductQtyCountryCompleteAllF;
        }

        let currentCompanyProductQtyCountryAll = 0;
        if (currentCompanyProductQtyCountryAllF === '_') {
            currentCompanyProductQtyCountryAll = 0
        } else {
            currentCompanyProductQtyCountryAll = currentCompanyProductQtyCountryAllF;
        }

        let companyOrderQtyCountryAllX = 0;
        if (companyOrderQtyCountryAll === '') {
            companyOrderQtyCountryAllX = 0
        } else {
            companyOrderQtyCountryAllX = companyOrderQtyCountryAll;
        }
        const orderQtyCountryRemainAll =
            +companyOrderQtyCountryAllX - +currentCompanyProductQtyCountryCompleteAll - +currentCompanyProductQtyCountryAll;
        return orderQtyCountryRemainAll;
    }

    findCompanyProductQtyCountryCompleteAll(currentOrderStyle: CurrentOrderStyle, countryID: string) {
        const currentCompanyProductQtyCountryCompleteAllF = this.currentCompanyProductQtyCountryCompleteAll.filter(i=>(
            i.companyID == currentOrderStyle.companyID &&
            i.productID == currentOrderStyle.productID && i.style == currentOrderStyle.style &&
            i.countryID == countryID
        ));
        if (currentCompanyProductQtyCountryCompleteAllF.length > 0) {
            return currentCompanyProductQtyCountryCompleteAllF[0].countQty;
        }
        return '_';
    }

    finndCompanyProductQtyCountryAllRemain(currentOrderStyle: CurrentOrderStyle, mode: string) {
        let remain = 0
        let styleQtyTotal = 0;
        let styleQtyCompleteTotal = 0;

        const targetPlaces = this.getOrderTargetPlace(currentOrderStyle.style.trim());

        targetPlaces.forEach( (item, index) => {
            const currentCompanyProductQtyCountryAll = this.currentCompanyProductQtyCountryAll.filter(i=>(
                i.companyID === currentOrderStyle.companyID && i.productID === currentOrderStyle.productID &&
                i.style === currentOrderStyle.style && i.countryID === item.targetPlace.countryID
            ));
            if (currentCompanyProductQtyCountryAll.length > 0) {
                styleQtyTotal = styleQtyTotal + currentCompanyProductQtyCountryAll[0].countQty;
            }

            const currentCompanyProductQtyCountryCompleteAll = this.currentCompanyProductQtyCountryCompleteAll.filter(i=>(
                i.companyID === currentOrderStyle.companyID && i.productID === currentOrderStyle.productID &&
                i.style === currentOrderStyle.style && i.countryID === item.targetPlace.countryID
            ));
            if (currentCompanyProductQtyCountryCompleteAll.length > 0) {
                styleQtyCompleteTotal = styleQtyCompleteTotal + currentCompanyProductQtyCountryCompleteAll[0].countQty;
            }
        });


        remain = +currentOrderStyle.sumQty - +styleQtyTotal - +styleQtyCompleteTotal;
        if (mode === 'qty') {
            if (remain > 0) {
                return remain;
            }0
        } else if (mode === 'percent') {
            if (remain > 0) {
                return Math.floor(remain/currentOrderStyle.sumQty*100)+'%';
            } else {
                return '0%';
            }
        }

        return '_';
    }
    // export class CurrentCompanyProductQtyZoneAll {
    //     constructor(
    //         public companyID: string,
    //         public productID: string,
    //         public style: string,
    //         public targetPlace: string,
    //         public countQty: number,
    //     ) {}
    // }

    async showCustomerSelectionViewBtn(customerOR: CustomerOR, mode: string) {
        const customer: Customer = await this.cusService.get1CustomerInfo(customerOR.customerID, this.company.companyID);
        if (customer.customerID !== '') {
            this.cusService.setCustomer(customer);
            if (mode === 'view') {
                this.showCustomerSelectionViewModal(customer);
            }
        } else {
            this.getCustomer1Company(customerOR.customerID, this.company.companyID, mode);
        }
    }

    getCustomer1Company(customerID: string, companyID: string, mode: string) {
        // async getCustomer1(companyID: string, customerID: string)
        this.cusService.getCustomer1(companyID, customerID);
        if (this.customer1CompanySub) { this.customer1CompanySub.unsubscribe(); }
        this.customer1CompanySub = this.cusService.getCustomerUpdatedListener()
        .subscribe((data) => {
            const customer = data.customer;
            this.cusService.setCustomer(customer);
            if (mode === 'view') {
                this.showCustomerSelectionViewModal(customer);
            }
        });
    }

    currentProductQtyAllCFilter(idx: number) {
        // console.log(this.currentProductQtyAllC);
        // console.log(this.currentAllProductQtyStyleGroup[idx][0].style);
        let table2: any[] = [];
        // return this.currentProductQtyAllCF.filter(i=>i.factoryID == fac.factoryID);
        let table = this.currentProductQtyAllC.filter(i=>i.style == this.currentAllProductQtyStyleGroup[idx][0].style);
        // console.log(table);
        // console.log(this.orders);

        let colors: ColorS[] = [];
        const colorsF = this.orders.filter(i=>i.orderID == table[0].style.trim());
        // console.log(colorsF);
        if (colorsF.length > 0) {
            colors = colorsF[0].orderColor;
        }
        // console.log(colors);

        // table = this.userService.getColorSeq1(colors, table);
        table.forEach( (item, index) => {
            // console.log(colors, item.color);
            item.colorSeq = this.userService.getColorSeq1(colors, item.color);
            const table1 = table2.filter(i=>i.color == item.color && i.size == item.size);
            if (table1.length===0) { table2.push({...item}); }
        });


        // table2.forEach( (item, index) => {
        //     this.orderStyleColorSize = this.repService.setColorSeq(this.colors, this.orderStyleColorSize);
        // });
        table2.sort((a,b)=>{
            return a.style >b.style?1:a.style <b.style?-1:0
                || a.colorSeq >b.colorSeq?1:a.colorSeq <b.colorSeq?-1:0
                || a.sizeSeq >b.sizeSeq?1:a.sizeSeq <b.sizeSeq?-1:0
        });
        // console.log(table2);
        return table2;
    }

    // orderStyleColorSizeFilter(idx: number) {
    //     let orderStyleColorSize = this.orderStyleColorSize.filter(i=>i.style == this.currentCompanyOrderStyleGroup[idx][0].style);
    //     let colors: ColorS[] = [];
    //     const colorsF = this.orders.filter(i=>i.orderID == this.currentCompanyOrderStyleGroup[idx][0].orderID);
    //     if (colorsF.length > 0) {
    //         colors = colorsF[0].orderColor;
    //     }
    //     orderStyleColorSize = this.repService.setColorSeq(colors, orderStyleColorSize);
    //     orderStyleColorSize.sort((a,b)=>{
    //         return a.style >b.style?1:a.style <b.style?-1:0
    //             || a.colorSeq >b.colorSeq?1:a.colorSeq <b.colorSeq?-1:0
    //             || a.sizeSeq >b.sizeSeq?1:a.sizeSeq <b.sizeSeq?-1:0
    //     });
    //     return orderStyleColorSize;
    // }

    checkColorShow(color: string, doEdit: boolean, rowIdex: number) {
        if (doEdit && rowIdex === 0) { this.lastColor = '';}
        if (this.lastColor === color) {
            return false;
        } else {
            if (doEdit) {this.lastColor = color;}
            return true;
        }
    }

    getProductionQty(companyID: string, productID: string, style: string,
        color: string, size: string, targetPlaceIndex: number) {
        // console.log(companyID, productID, style, color, size, targetPlaceIndex);
        // return  targetPlaceID: string, countryID: string,
        const targetPlaceID = this.mainZone[targetPlaceIndex].targetPlaceID;
        // const countryID = this.targetPlaces[targetPlaceIndex].targetPlace.countryID;
        const factoryProduction = this.currentProductQtyAllC.filter(i=>i.companyID == companyID &&
            i.productID == productID && i.style == style && i.targetPlace == targetPlaceID &&
            i.color == color && i.size == size);
        if (factoryProduction.length>0) {
            return factoryProduction[0].countQty;
        } else {
            return '';
        }
    }

    getProductionZoneQty(companyID: string, productID: string, style: string,
        color: string, size: string, targetPlaceIndex: number) {
        // console.log(companyID, productID, style, color, size, targetPlaceIndex);
        // return  targetPlaceID: string, countryID: string,
        const targetPlaceID = this.mainZone[targetPlaceIndex].targetPlaceID;
        // const countryID = this.targetPlaces[targetPlaceIndex].targetPlace.countryID;
        const factoryProductionZone = this.currentCompanyOrderZone.filter(i=>i.companyID == companyID &&
            i.productID == productID && i.style == style && i.targetPlaceID == targetPlaceID &&
            i.productColor == color && i.productSize == size);
        if (factoryProductionZone.length>0) {
            return factoryProductionZone[0].sumQty;
        } else {
            return '';
        }
        // return '';
    }

    getProductionZoneRemainQty(companyID: string, productID: string, style: string,
        color: string, size: string, targetPlaceIndex: number) {
        const factoryProductionComplete =  this.getProductionCompleteQty(companyID, productID, style, color, size, targetPlaceIndex);
        const factoryProduction =  this.getProductionQty(companyID, productID, style, color, size, targetPlaceIndex);
        const factoryProductionZone =  this.getProductionZoneQty(companyID, productID, style, color, size, targetPlaceIndex);

        let factoryProductionCompleteX = 0;
        if (factoryProductionComplete === '_') {
            factoryProductionCompleteX = 0
        } else {
            factoryProductionCompleteX = factoryProductionComplete;
        }

        let factoryProductionX = 0;
        if (factoryProduction === '') {
            factoryProductionX = 0
        } else {
            factoryProductionX = factoryProduction;
        }

        let factoryProductionZoneX = 0;
        if (factoryProductionZone === '') {
            factoryProductionZoneX = 0
        } else {
            factoryProductionZoneX = factoryProductionZone;
        }
        const productionZoneRemainQty = +factoryProductionZone - +factoryProductionCompleteX - +factoryProductionX;

        // return productionZoneRemainQty;
        if (productionZoneRemainQty < 0) {
            return 0;
        } else {

            return productionZoneRemainQty;
        }


    }

    getProductionZoneRemainQtyForLoss(companyID: string, productID: string, style: string,
        color: string, size: string, targetPlaceIndex: number) {
        const factoryProductionComplete =  this.getProductionCompleteQty(companyID, productID, style, color, size, targetPlaceIndex);
        const factoryProduction =  this.getProductionQty(companyID, productID, style, color, size, targetPlaceIndex);
        const factoryProductionZone =  this.getProductionZoneQty(companyID, productID, style, color, size, targetPlaceIndex);

        let factoryProductionCompleteX = 0;
        if (factoryProductionComplete === '_') {
            factoryProductionCompleteX = 0
        } else {
            factoryProductionCompleteX = factoryProductionComplete;
        }

        let factoryProductionX = 0;
        if (factoryProduction === '') {
            factoryProductionX = 0
        } else {
            factoryProductionX = factoryProduction;
        }

        let factoryProductionZoneX = 0;
        if (factoryProductionZone === '') {
            factoryProductionZoneX = 0
        } else {
            factoryProductionZoneX = factoryProductionZone;
        }
        const productionZoneRemainQty = +factoryProductionZone - +factoryProductionCompleteX - +factoryProductionX;

        if (productionZoneRemainQty >= 0) {
            return '';
        } else {

            return '('+ Math.abs(productionZoneRemainQty) +')';
        }
    }


    // currentCompanyProductQtyCountryCSAll
    getProductionCountryQty(companyID: string, productID: string, style: string,
        color: string, size: string, targetPlaceIndex: number) {
        // console.log(companyID, productID, style, color, size, targetPlaceIndex);
        // return  targetPlaceID: string, countryID: string,
        const targetPlaces = this.getOrderTargetPlace(style.trim());
        const countryID = targetPlaces[targetPlaceIndex].targetPlace.countryID;
        // const countryID = this.targetPlaces[targetPlaceIndex].targetPlace.countryID;
        const factoryProduction = this.currentCompanyProductQtyCountryCSAll.filter(i=>i.companyID == companyID &&
            i.productID == productID && i.style == style && i.countryID == countryID &&
            i.color == color && i.size == size);
        if (factoryProduction.length>0) {
            return factoryProduction[0].countQty;
        } else {
            return '';
        }
    }

    getOrderCountryQty(companyID: string, productID: string, style: string,
        color: string, size: string, targetPlaceIndex: number) {
        // console.log(companyID, productID, style, color, size, targetPlaceIndex);
        // return  targetPlaceID: string, countryID: string,
        const targetPlaces = this.getOrderTargetPlace(style.trim());
        const countryID = targetPlaces[targetPlaceIndex].targetPlace.countryID;
        // const countryID = this.targetPlaces[targetPlaceIndex].targetPlace.countryID;
        const factoryProduction = this.currentCompanyOrderCountry.filter(i=>i.companyID == companyID &&
            i.productID == productID && i.style == style && i.countryID == countryID &&
            i.productColor == color && i.productSize == size);
        if (factoryProduction.length>0) {
            return factoryProduction[0].sumQty;
        } else {
            return '';
        }
    }

    getOrderCountryRemainQty(companyID: string, productID: string, style: string,
        color: string, size: string, targetPlaceIndex: number) {
        const productionCountryCompleteQty = this.getProductionCountryCompleteQty(companyID, productID, style, color, size, targetPlaceIndex);
        const productionCountryQty = this.getProductionCountryQty(companyID, productID, style, color, size, targetPlaceIndex);
        const orderCountryQty = this.getOrderCountryQty(companyID, productID, style, color, size, targetPlaceIndex);

        let productionCountryCompleteQtyX = 0;
        if (productionCountryCompleteQty === '_') {
            productionCountryCompleteQtyX = 0
        } else {
            productionCountryCompleteQtyX = productionCountryCompleteQty;
        }

        let productionCountryQtyX = 0;
        if (productionCountryQty === '') {
            productionCountryQtyX = 0
        } else {
            productionCountryQtyX = productionCountryQty;
        }

        let orderCountryQtyX = 0;
        if (orderCountryQty === '') {
            orderCountryQtyX = 0
        } else {
            orderCountryQtyX = orderCountryQty;
        }
        const orderCountryRemainQty = +orderCountryQtyX - +productionCountryCompleteQtyX - +productionCountryQtyX;
        return orderCountryRemainQty;
    }

    getProductionQtyRowTotal(companyID: string, productID: string, style: string,
        color: string, size: string) {
        //
        const factoryProduction = this.currentProductQtyAllC.filter(i=>i.companyID == companyID &&
            i.productID == productID && i.style == style &&
            i.color == color && i.size == size);
        if (factoryProduction.length>0) {
            const totalQtyRow = factoryProduction.reduce((prev, cur) => {return prev + cur.countQty;}, 0);
            return totalQtyRow;
            // return 1;
        } else {
            return 0;
        }
    }

    getProductionCountryQtyRowTotal(companyID: string, productID: string, style: string,
        color: string, size: string) {
        //
        const factoryProduction = this.currentCompanyProductQtyCountryCSAll.filter(i=>i.companyID == companyID &&
            i.productID == productID && i.style == style &&
            i.color == color && i.size == size);
        if (factoryProduction.length>0) {
            const totalQtyRow = factoryProduction.reduce((prev, cur) => {return prev + cur.countQty;}, 0);
            return totalQtyRow;
            // return 1;
        } else {
            return 0;
        }
    }

    getProductionQtyColumnTotal(group: any, targetPlaceIndex: number) {
        const targetPlaceID = this.mainZone[targetPlaceIndex].targetPlaceID;
        // const countryID = this.targetPlaces[targetPlaceIndex].targetPlace.countryID;
        const factoryProduction = this.currentProductQtyAllC.filter(i=>i.companyID == group.companyID &&
            i.productID == group.productID && i.style == group.style && i.targetPlace == targetPlaceID );
        // console.log(factoryProduction);
        if (factoryProduction.length>0) {
            const totalQtyColumn = factoryProduction.reduce((prev, cur) => {return prev + cur.countQty;}, 0);
            return totalQtyColumn;
        } else {
            return 0;
        }
    }

    getProductionCountryCompleteQtyColumnTotal(group: any, targetPlaceIndex: number) {
        const targetPlaces = this.getOrderTargetPlace(group.style.trim());
        const countryID = targetPlaces[targetPlaceIndex].targetPlace.countryID;
        // const countryID = this.targetPlaces[targetPlaceIndex].targetPlace.countryID;
        const factoryProduction = this.currentCompanyProductQtyCountryCSCompleteAll.filter(i=>i.companyID == group.companyID &&
            i.productID == group.productID && i.style == group.style && i.countryID == countryID );
        // console.log(factoryProduction);
        if (factoryProduction.length>0) {
            const totalQtyColumn = factoryProduction.reduce((prev, cur) => {return prev + cur.countQty;}, 0);
            return totalQtyColumn;
        } else {
            return 0;
        }
    }

    getProductionQtyGrandTotal(group: any) {
        let currentCompanyProductQtyCountryCSAll = 0;
        let currentCompanyProductQtyCountryCSCompleteAll = 0;
        const factoryProduction = this.currentCompanyProductQtyCountryCSAll.filter(i=>i.companyID == group.companyID &&
            i.productID == group.productID && i.style == group.style );
        if (factoryProduction.length>0) {
            currentCompanyProductQtyCountryCSAll = factoryProduction.reduce((prev, cur) => {return prev + cur.countQty;}, 0);
        } else {
            currentCompanyProductQtyCountryCSAll = 0;
        }

        const factoryProductionComplete = this.currentCompanyProductQtyCountryCSCompleteAll.filter(i=>i.companyID == group.companyID &&
            i.productID == group.productID && i.style == group.style );
        if (factoryProductionComplete.length>0) {
            currentCompanyProductQtyCountryCSCompleteAll = factoryProductionComplete.reduce((prev, cur) => {return prev + cur.countQty;}, 0);
        } else {
            currentCompanyProductQtyCountryCSCompleteAll = 0;
        }
        return currentCompanyProductQtyCountryCSAll + currentCompanyProductQtyCountryCSCompleteAll;
    }

    getProductionCountryQtyGrandTotal(group: any) {
        let currentCompanyProductQtyCountryCSAll = 0;
        let currentCompanyProductQtyCountryCSCompleteAll = 0;

        const factoryProduction = this.currentCompanyProductQtyCountryCSAll.filter(i=>i.companyID == group.companyID &&
            i.productID == group.productID && i.style == group.style );
        if (factoryProduction.length>0) {
            const totalQtyGrand = factoryProduction.reduce((prev, cur) => {return prev + cur.countQty;}, 0);
            currentCompanyProductQtyCountryCSAll = totalQtyGrand;
        } else {
            currentCompanyProductQtyCountryCSAll = 0;
        }

        const factoryProductionComplete = this.currentCompanyProductQtyCountryCSCompleteAll.filter(i=>i.companyID == group.companyID &&
            i.productID == group.productID && i.style == group.style );
        if (factoryProductionComplete.length>0) {
            const totalQtyGrand = factoryProductionComplete.reduce((prev, cur) => {return prev + cur.countQty;}, 0);
            currentCompanyProductQtyCountryCSCompleteAll = totalQtyGrand;
        } else {
            currentCompanyProductQtyCountryCSCompleteAll = 0;
        }
        return currentCompanyProductQtyCountryCSAll+currentCompanyProductQtyCountryCSCompleteAll;
        // return currentCompanyProductQtyCountryCSAll;
    }

    getProductionCompleteQty(companyID: string, productID: string, style: string,
        color: string, size: string, targetPlaceIndex: number) {
        // console.log(companyID, productID, style, color, size, targetPlaceIndex);
        // return  targetPlaceID: string, countryID: string,
        const targetPlaceID = this.mainZone[targetPlaceIndex].targetPlaceID;
        // const countryID = this.targetPlaces[targetPlaceIndex].targetPlace.countryID;
        const factoryProduction = this.currentProductQtyAllCompleteC.filter(i=>i.companyID == companyID &&
            i.productID == productID && i.style == style && i.targetPlace == targetPlaceID &&
            i.color == color && i.size == size);
        if (factoryProduction.length>0) {
            return factoryProduction[0].countQty;
        } else {
            return '_';
        }
    }


    getProductionCountryCompleteQty(companyID: string, productID: string, style: string,
        color: string, size: string, targetPlaceIndex: number) {
        // console.log(companyID, productID, style, color, size, targetPlaceIndex);
        // return  targetPlaceID: string, countryID: string,
        const targetPlaces = this.getOrderTargetPlace(style.trim());
        const countryID = targetPlaces[targetPlaceIndex].targetPlace.countryID;
        // const countryID = this.targetPlaces[targetPlaceIndex].targetPlace.countryID;
        const factoryProduction = this.currentCompanyProductQtyCountryCSCompleteAll.filter(i=>i.companyID == companyID &&
            i.productID == productID && i.style == style && i.countryID == countryID &&
            i.color == color && i.size == size);
        if (factoryProduction.length>0) {
            return factoryProduction[0].countQty;
        } else {
            return '_';
        }
    }

    getProductionCompleteQtyColumnTotal(group: any, targetPlaceIndex: number) {
        const targetPlaceID = this.mainZone[targetPlaceIndex].targetPlaceID;
        // const countryID = this.targetPlaces[targetPlaceIndex].targetPlace.countryID;
        const factoryProduction = this.currentProductQtyAllCompleteC.filter(i=>i.companyID == group.companyID &&
            i.productID == group.productID && i.style == group.style && i.targetPlace == targetPlaceID );
        // console.log(factoryProduction);
        if (factoryProduction.length>0) {
            const totalQtyColumn = factoryProduction.reduce((prev, cur) => {return prev + cur.countQty;}, 0);
            return totalQtyColumn;
        } else {
            return '_';
        }
    }

    getProductionCountryQtyColumnTotal(group: any, targetPlaceIndex: number) {
        const targetPlaces = this.getOrderTargetPlace(group.style.trim());
        const countryID = targetPlaces[targetPlaceIndex].targetPlace.countryID;
        // const countryID = this.targetPlaces[targetPlaceIndex].targetPlace.countryID;
        const factoryProduction = this.currentCompanyProductQtyCountryCSAll.filter(i=>i.companyID == group.companyID &&
            i.productID == group.productID && i.style == group.style && i.countryID == countryID );
        // console.log(factoryProduction);
        if (factoryProduction.length>0) {
            const totalQtyColumn = factoryProduction.reduce((prev, cur) => {return prev + cur.countQty;}, 0);
            return totalQtyColumn;
        } else {
            return '_';
        }
    }

    getReaminProductionQtyGrandTotal(group: any) {
        let totalQtyGrand = 0;
        let totalCompleteQtyGrand = 0;
        let currentOrderStyleSumQty = 0;

        const factoryProduction = this.currentProductQtyAllC.filter(i=>i.companyID == group.companyID &&
            i.productID == group.productID && i.style == group.style );
        if (factoryProduction.length>0) {
            totalQtyGrand = factoryProduction.reduce((prev, cur) => {return prev + cur.countQty;}, 0);
        }

        const factoryProductionComplete = this.currentProductQtyAllCompleteC.filter(i=>i.companyID == group.companyID &&
            i.productID == group.productID && i.style == group.style );
        if (factoryProductionComplete.length>0) {
            totalCompleteQtyGrand = factoryProductionComplete.reduce((prev, cur) => {return prev + cur.countQty;}, 0);
        }

        const currentOrderStyleF = this.currentOrderStyle.filter(i=>(
            i.companyID == group.companyID &&
            i.productID == group.productID && i.style == group.style
        ));
        if (currentOrderStyleF.length > 0) {
            currentOrderStyleSumQty = currentOrderStyleF[0].sumQty;
        }
        return currentOrderStyleSumQty - totalQtyGrand - totalCompleteQtyGrand;
    }

    getReaminProductionCountryQtyGrandTotal(group: any) {
        // console.log(this.currentCompanyProductQtyCountryCSAll);
        // console.log(this.currentCompanyProductQtyCountryCSCompleteAll);
        let totalQtyGrand = 0;
        let totalCompleteQtyGrand = 0;
        let currentOrderStyleSumQty = 0;

        const factoryProduction = this.currentCompanyProductQtyCountryCSAll.filter(i=>i.companyID == group.companyID &&
            i.productID == group.productID && i.style == group.style );
        if (factoryProduction.length>0) {
            totalQtyGrand = factoryProduction.reduce((prev, cur) => {return prev + cur.countQty;}, 0);
        }

        const factoryProductionComplete = this.currentCompanyProductQtyCountryCSCompleteAll.filter(i=>i.companyID == group.companyID &&
            i.productID == group.productID && i.style == group.style );
        if (factoryProductionComplete.length>0) {
            totalCompleteQtyGrand = factoryProductionComplete.reduce((prev, cur) => {return prev + cur.countQty;}, 0);
        }

        const currentOrderStyleF = this.currentOrderStyle.filter(i=>(
            i.companyID == group.companyID &&
            i.productID == group.productID && i.style == group.style
        ));
        if (currentOrderStyleF.length > 0) {
            currentOrderStyleSumQty = currentOrderStyleF[0].sumQty;
        }
        return currentOrderStyleSumQty - totalQtyGrand - totalCompleteQtyGrand;
    }

    showCustomerSelectionViewModal(customer: Customer) {
        const ref = this.dialogService.open(UcCustomerEditComponent, {
            data: {
                id: 'customerView',
                company: this.userService?.getCompany(),
                customer: customer,
                callfrom: this.formName,  // ## send to nodejs for choose buckets
                modeView: true

            },
            header: 'Customer Info view',
            width: '80%',
        });

        ref.onClose.subscribe((data: any) => {
            // console.log(data);
        });
    }

    // groupBy(xs: any[], f: any) {
    //     return xs.reduce((r, v, i, a, k = f(v)) => ((r[k] || (r[k] = [])).push(v), r), {});
    // }

    ngOnDestroy(): void {
        if (this.repCompanyProductionSub) { this.repCompanyProductionSub.unsubscribe(); }
        if (this.customer1CompanySub) { this.customer1CompanySub.unsubscribe(); }
        if (this.ordersByOrderIDsSub) { this.ordersByOrderIDsSub.unsubscribe(); }
        if (this.dataAroundAppSub) { this.dataAroundAppSub.unsubscribe(); }

        // if (this.langSub) { this.langSub.unsubscribe(); }
    }
}
