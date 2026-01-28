import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import { UserService } from 'src/app/services/user.service';
import { Subscription } from 'rxjs';
import { SmdYarnSeasonyearComponent } from 'src/app/shared/components/user/yarn/smd-yarn-seasonyear/smd-yarn-seasonyear.component';
import { DialogService } from 'primeng/dynamicdialog';
import { Paginator } from 'primeng/paginator';

import { GBC } from 'src/app/global/const-global';
import { ColorS, Company, SizeS } from 'src/app/models/app.model';
import { YarnService } from 'src/app/services/yarn.service';
import { SSelectCustomerComponent } from 'src/app/shared/components/general/s-select-customer/s-select-customer.component';
import { Customer, Order, OrderImage } from 'src/app/models/order.model';
import { SmdSelectOrderComponent } from 'src/app/shared/components/general/smd-select-order/smd-select-order.component';
import { SmdDeliCountrySelectComponent } from 'src/app/shared/components/deli/smd-deli-country-select/smd-deli-country-select.component';
import { DeliService } from 'src/app/services/deli.service';
import { DBox, DCarton, DCountry, DPacking, DPackingQTY, DPCarton } from 'src/app/models/carton.model';
import { OrderService } from 'src/app/services/order.service';
import { ReportService } from 'src/app/services/report.service';
import { CurrentCompanyOrder, CurrentOrderStyle, OrderStyleColorSize } from 'src/app/models/report.model';
import { SmdDeliOrderSelectComponent } from 'src/app/shared/components/deli/smd-deli-order-select/smd-deli-order-select.component';
import { SmdDeliCartonSizeSelectComponent } from 'src/app/shared/components/deli/smd-deli-carton-size-select/smd-deli-carton-size-select.component';
import { SmdDeliCartonAddboxComponent } from 'src/app/shared/components/deli/smd-deli-carton-addbox/smd-deli-carton-addbox.component';

@Component({
    selector: 'app-transport',
    templateUrl: './transport.component.html',
    styleUrls: ['./transport.component.scss'],
    providers: [DialogService],
})
export class TransportComponent implements OnInit, OnDestroy {
    @ViewChild('paginator', { static: false }) paginator!: Paginator;

    formActive = 'transport';
    formName = this.formActive;
    isAuthenticated = false;  // ## logged in ?

    company: Company = GBC.clrCompany();
    customer: Customer = GBC.clrCustomer();
    // orderID = '';
    orderIDs_: string[] = [];
    orderImages: OrderImage[] = [];

    mode = 'delivery-list'; // ##
    // seasonYear = '';  // 2024SS  2025AW

    dCartons: DCarton[] = [];
    dCountries: DCountry[] = [];
    dCountry: DCountry = GBC.clrDCountry();

    readonlyInput = true;
    dateFormat = 'dd/mm/yy';
    // dDate = new Date();
    // productionDate = new Date();

    dPackings: DPacking[] = [];
    dPacking1: DPacking = GBC.clrDPacking();
    dPackingCompleted: DPacking = GBC.clrDPacking();
    dPackingWaiting: DPacking = GBC.clrDPacking();
    dCarton1: DPCarton = GBC.clrDPCarton();
    dCartonTemp: DPCarton = GBC.clrDPCarton();
    dCartonPage: DPCarton[] = [];

    size1: any[] = [];
    sizeC: any[] = [];
    sizeW: any[] = [];

    lastDCartonID = 'xnew';  //  carton boxID , no.
    lastColorCode = 'xnew';  //  #001
    lastColorID = 'xnew';  // WH  ,  BK ...

    lastDCartonID2 = 'xnew';  //  carton boxID , no.
    lastColorCode2 = 'xnew';  //  #001
    lastColorID2 = 'xnew';  // WH  ,  BK ...


    // dPackings: any[] = [
    //     {seq: 1 , cartonID: 'D55*W28*H25', cartonName:'D55*W28*H25', cSize:'D55*W28*H25'},
    //     {seq: 2 , cartonID: 'D37*W37*H20', cartonName:'D37*W37*H20', cSize:'D37*W37*H20'},
    //     {seq: 3 , cartonID: 'D..*W..*H..', cartonName:'D..*W..*H..', cSize:'D..*W..*H..'},
    //     {seq: 4 , cartonID: 'D--*W--*H--', cartonName:'D--*W--*H--', cSize:'D--*W--*H--'},
    // ];

    dbTest: any[] = [
        {seq: 1 , cartonID: 'AAAAA', cartonName:'1000', cSize:'D55*W28*H25'},
        {seq: 2 , cartonID: 'BBBBB', cartonName:'200', cSize:'D37*W37*H20'},
        {seq: 3 , cartonID: 'CCCCC', cartonName:'10', cSize:'D..*W..*H..'},
        {seq: 4 , cartonID: 'DDDDD', cartonName:'5', cSize:'D--*W--*H--'},
    ];



    // cartons: any[] = [
    //     {a: '', b: '', c: '', d: ''},
    //     {a: '', b: '', c: '', d: ''},
    //     {a: '', b: '', c: '', d: ''},
    //     {a: '', b: '', c: '', d: ''},
    //     {a: '', b: '', c: '', d: ''},
    // ];

    // ##  order zone  ###########
    lastColor = '';
    order: Order = GBC.clrOrder();
    orders: Order[] = [];
    orderIDs: string[] = [];
    ordersCount = 0;
    orderColor: ColorS[] = [];

    orderStyleColorSize: OrderStyleColorSize[] = [];
    currentCompanyOrder: CurrentCompanyOrder[] = [];
    currentOrderStyle: CurrentOrderStyle[] = [];
    currentCompanyOrderStyleGroup: any[] = [];
    sizes: SizeS[] = [];
    colors: ColorS[] = [];
    cartonID = '';   // ## box size    D55*W28*H25  D37*W37*H20 …
    oldData: any = {
        orderID: '',
        currentCompanyOrderStyleGroup: [],
        orderStyleColorSize: [],
        currentCompanyOrder: [],
        currentOrderStyle: [],
    };


    first: number = 0;
    rows: number = 100;  // record for counting data --> dCarton(s)
    totalRecords: number = 0;
    page: number = 1;

    private dataAroundAppSub: Subscription = new Subscription();
    private countriesSub: Subscription = new Subscription();

    private repCompanyOrderSub: Subscription = new Subscription();
    private ordersByOrderIDsSub: Subscription = new Subscription();
    private order1Sub: Subscription = new Subscription();
    private cartonsSub: Subscription = new Subscription();
    private dPackingCreateSub: Subscription = new Subscription();
    private dPackingsSub: Subscription = new Subscription();
    // private cartonsSub: Subscription = new Subscription();
    // private cartonsSub: Subscription = new Subscription();
    // private cartonsSub: Subscription = new Subscription();
    // private cartonsSub: Subscription = new Subscription();


    constructor(
        private router: Router,
        private location: Location,
        public dialogService: DialogService,

        public userService: UserService,
        private orderService: OrderService,
        public yarnService: YarnService,
        public deliService: DeliService,
        private repService: ReportService,
    ) {}


    // testChangePage(page: number): void {
    //     this.paginator.changePage(page-1);
    // }



    ngOnInit(): void {
        // console.log('TransportComponent');
        this.location.replaceState('/'); // ## hide loocation
        this.userService.setFormActive(this.formActive);
        this.company = this.userService.getCompany();
        this.getDCountries();
        this.customer = GBC.clrCustomer();
        this.yarnService.getYarnsSeasons(this.company.companyID)
        this.sizes = this.userService.sizes;
        this.colors = this.userService.colors;

        this.dPacking1.seasonYear = this.userService.seasonYear;
        this.dPacking1.companyID = this.company.companyID;
        this.dCountries = [];
        this.dCountry = GBC.clrDCountry();
        this.getDCartons();  // ## get carton box size list

        // // ## get DataAroundApp
        // // ## user auth  isAuthenticated / dataAroundApp
        // this.isAuthenticated = this.userService.getIsAuth();
        // this.dataAroundAppSub = this.userService
        //     .getDataAroundAppStatusListener()
        //     .subscribe((dataAroundApp) => {
        //         // ## declare initial variable from service user
        //         this.isAuthenticated = dataAroundApp.isAuthenticated;

        //         // console.log('screenSizeInfo : ' , this.screenSize);
        //         // console.log('isAuthenticated : ' , this.isAuthenticated);
        //         if (this.isAuthenticated) {
        //             // ## user logged in already
        //         } else {
        //             // ## user no login
        //         }
        //     });

        //
        this.getDPackings(this.dPacking1.seasonYear);

    }

    getDPackings(seasonYear: string) {
        this.dPackings = [];
        const dStatus: string[] = ['hide', 'open', 'close']; // hide, open , close
        this.deliService.getDPackings(seasonYear, dStatus);
        if (this.dPackingsSub) { this.dPackingsSub.unsubscribe(); }
        this.dPackingsSub = this.deliService.getDPackingsListener()
        .subscribe((data) => {
            console.log(data);
            this.dPackings = data.dPackings;

        });
    }

    postDPackingCreateNew(dPacking: DPacking) {
        const createBy = this.userService.getCreateBy();
        this.dPacking1.dStatus = 'open'; // ## hide, open , close,  delete
        this.dPacking1.dInfo.createBy = createBy;

        this.deliService.postDPackingCreateNew(dPacking);
        if (this.dPackingCreateSub) { this.dPackingCreateSub.unsubscribe(); }
        this.dPackingCreateSub = this.deliService.getDPackingCreateListener()
        .subscribe((data) => {
            // console.log(data);
            if (data.success) {

            }

        });
    }

    // getClassDPacking(dStatus: string): string {
    //     // ## hide, open , close,  delete
    //     if (dStatus === 'hide') {
    //         return '';
    //     } else if (dStatus === 'open') {
    //         return 'text-orange-600 text-sm font-semibold';
    //     } else if (dStatus === 'close') {
    //         return 'text-teal-500 text-sm font-semibold';
    //     } else if (dStatus === 'delete') {
    //         return 'text-red-500 text-sm font-semibold';
    //     } else {
    //         return '';
    //     }
    //     return '';
    // }

    getCartonPage(page: number): DPCarton[] {
        // const dCarton1: DPCarton[] = JSON.parse(JSON.stringify(this.dPacking1.dCarton));
        const dCarton1: DPCarton[] = this.dPacking1.dCarton;

        const startPos = (page - 1) * this.rows;
        const endPos = page * this.rows;
        this.dCartonPage = [];
        this.dCartonPage =  dCarton1.slice(startPos, endPos);
        return this.dCartonPage;
    }

    onPageChange(event: any) {
        // console.log(event);
        this.first = event.first;
        this.rows = event.rows;
        this.page = +event.page + 1;
        this.getCartonPage(this.page);
    }

    newCartonSetColor() {
        this.lastDCartonID = 'xnew';  //  carton boxID , no.
        this.lastColorID = 'xnew';  // WH  ,  BK ...
        this.lastDCartonID2 = 'xnew';  //  carton boxID , no.
        this.lastColorID2 = 'xnew';  // WH  ,  BK ...
    }
    getColorCode(ct: DPCarton, dB: DBox): string {
        // lastDCartonID = '';  //  carton boxID , no.
        // lastColorID = '';  // WH  ,  BK ...
        // lastColorCode = '';  //  #001

        if (this.lastDCartonID === ct.dCartonID) {  // ## case : old same carton
            if (this.lastColorID === dB.productColor) {
                // this.lastDCartonID = ct.dCartonID;
                // this.lastColorID = dB.productColor;
                return '';
            } else {
                // this.lastDCartonID = ct.dCartonID;
                this.lastColorID = dB.productColor;
                return this.userService.getCodeColorNameByColorCode
                    (dB.productColor, this.userService.getSetNameColorByOrderID(this.dPacking1.orderID));
            }
        } else {  // ## case : difference carton
            this.lastDCartonID = ct.dCartonID;
            this.lastColorID = dB.productColor;
            return this.userService.getCodeColorNameByColorCode
                (dB.productColor, this.userService.getSetNameColorByOrderID(this.dPacking1.orderID));
        }
    }
    getColorName(ct: DPCarton, dB: DBox): string {
        // lastDCartonID = '';  //  carton boxID , no.
        // lastColorID = '';  // WH  ,  BK ...
        // lastColorCode = '';  //  #001

        if (this.lastDCartonID2 === ct.dCartonID) {  // ## case : same carton
            if (this.lastColorID2 === dB.productColor) {
                return '';
            } else {
                this.lastColorID2 = dB.productColor;
                return this.userService.strFirstAndDot
                (this.userService.getColorNameByColorCode(dB.productColor, this.userService.getSetNameColorByOrderID(this.dPacking1.orderID)), 8);
            }
        } else {  // ## case : new carton
            this.lastDCartonID2 = ct.dCartonID;
            this.lastColorID2 = dB.productColor;
            return this.userService.strFirstAndDot
            (this.userService.getColorNameByColorCode(dB.productColor, this.userService.getSetNameColorByOrderID(this.dPacking1.orderID)), 8);
        }

    }

    changeMode(mode: string) {
        this.mode = mode;
    }

    packingEdit() {
        // console.log(this.dPacking1);
        // console.log(this.size1);
        // console.log(this.sizeC);
        // console.log(this.sizeW);
        this.postDPackingCreateNew(this.dPacking1)
    }

    btnDisableMode() {
        return 'border-none surface-100 text-gray-400';
    }

    clrEditBoxForCreateNew() {
        // this.orderID = '';
        this.dPacking1 = GBC.clrDPacking();
        this.customer = GBC.clrCustomer();
    }

    getDCartons() {
        this.dCartons = [];
        this.deliService.getDCartons();
        if (this.cartonsSub) { this.cartonsSub.unsubscribe(); }
        this.cartonsSub = this.deliService.getDCartonsUpdatedListener()
        .subscribe((data) => {
            // console.log(data);
            this.dCartons = data.dCartons;

        });
    }

    getDCountries() {
        this.dCountries = [];
        this.deliService.getDCountries();
        if (this.countriesSub) { this.countriesSub.unsubscribe(); }
        this.countriesSub = this.deliService.getDCountriesUpdatedListener()
        .subscribe((data) => {
            // console.log(data);
            this.dCountries = data.dCountries;
        });
    }

    deliDateChange() {

    }

    productionDateChange() {

    }

    setDPackingLock(isLock: boolean) {
        this.dPacking1.isLock = !this.dPacking1.isLock;
    }

    setDPackingDCartonLock(isLock: boolean) {
        this.dPacking1.isLockDCarton = !this.dPacking1.isLockDCarton;
    }

    autoDCartonID(idx: number, ct: DPCarton) {
        const cartonIDX_ = this.currentCartonIDX(idx);
        // console.log(idx, ct);
        this.dPacking1.dCarton[cartonIDX_].seq = +ct.dCartonID;
        let iddxx = 0;
        let seqxx = +ct.dCartonID + 1;
        let dCartonIDxx = +ct.dCartonID + 1;
        this.dPacking1.dCarton.forEach( (item, index) => {
            if (iddxx > cartonIDX_) {
                // console.log(item);
                item.dCartonID = dCartonIDxx + '';
                item.seq = dCartonIDxx;
                dCartonIDxx++;
                seqxx++;
            }

            iddxx++;
        });
    }

    copyCartonToTemp(idx: number, ct: DPCarton) {
        const cartonIDX_ = this.currentCartonIDX(idx);
        // const ct2: DPCarton = Object.assign({}, ct);
        const ct2: DPCarton = JSON.parse(JSON.stringify(ct));
        // JSON.parse(JSON.stringify(ct2))
        const dCarton: DPCarton = {
            seq: ct2.seq,
            dCartonID: ct2.dCartonID,
            dCartonName: ct2.dCartonName,
            cartonID: ct2.cartonID,
            dStatus: ct2.dStatus,  // ## w , c 	waiting  complete
            isLock: false,
            dOpen: false,
            dShow: false,
            lastEdit: new Date(),
            dBox: ct2.dBox,

            totalQTY: ct2.totalQTY,
        };
        this.dCartonTemp = GBC.clrDPCarton();
        // this.dCartonTemp = Object.assign({}, dCarton);
        this.dCartonTemp = JSON.parse(JSON.stringify(dCarton));
    }

    pasteCartonToTemp(idx: number, ct: DPCarton) {
        const cartonIDX_ = this.currentCartonIDX(idx);
        const ct2: DPCarton = JSON.parse(JSON.stringify(this.dCartonTemp));
        if (this.dCartonTemp.dCartonID !== '')  {
            // this.dPacking1.dCarton[idx] = {...this.dCartonTemp};
            this.dPacking1.dCarton[cartonIDX_].cartonID = ct2.cartonID;
            this.dPacking1.dCarton[cartonIDX_].lastEdit = new Date(),
            this.dPacking1.dCarton[cartonIDX_].dBox = ct2.dBox;
        }
    }

    addDCartons(num: number) {
        for (let i = 0; i < num; i++) {
            this.addDCarton1();
        }
        this.totalRecords = this.dPacking1.dCarton.length;
        this.getCartonPage(this.page);
    }

    addDCarton1() {
        const dCarton01: DPCarton = GBC.clrDPCarton();
        this.dPacking1.dCarton.unshift(dCarton01);
        // this.refreshDCarton1();
        // this.dPacking1.dCarton.sort((a,b)=>{
        //     return a.seq >b.seq?1:a.seq <b.seq?-1:0
        // });
    }

    refreshDCarton1() {
        // ##

        const dPackingC: DPacking = JSON.parse(JSON.stringify(this.dPacking1));
        const dPackingW: DPacking = JSON.parse(JSON.stringify(this.dPacking1));
        this.dPackingCompleted = JSON.parse(JSON.stringify(this.dPacking1));
        this.dPackingWaiting = JSON.parse(JSON.stringify(this.dPacking1));
        const dCartonC= dPackingC.dCarton.filter(i=>i.dStatus == 'c');
        const dCartonW= dPackingW.dCarton.filter(i=>i.dStatus == 'w');
        this.dPackingCompleted.dCarton = dCartonC;
        this.dPackingWaiting.dCarton = dCartonW;

        this.dPacking1.dCarton.sort((a,b)=>{
            return +a.seq > +b.seq?1: +a.seq < +b.seq?-1:0
            || a.dCartonID >b.dCartonID?1:a.dCartonID <b.dCartonID?-1:0
        });
        this.dPackingCompleted.dCarton.sort((a,b)=>{
            return +a.seq > +b.seq?1: +a.seq < +b.seq?-1:0
            || a.dCartonID >b.dCartonID?1:a.dCartonID <b.dCartonID?-1:0
        });
        this.dPackingWaiting.dCarton.sort((a,b)=>{
            return +a.seq > +b.seq?1: +a.seq < +b.seq?-1:0
            || a.dCartonID >b.dCartonID?1:a.dCartonID <b.dCartonID?-1:0
        });
        // console.log(this.dPacking1.dCarton);
        this.calDCartonQty_All();
        this.calDCartonQty_Completed()
        this.calDCartonQty_Waiting()
        this.getCartonPage(this.page);
        console.log(this.dPacking1);
    }

    checkOldData(orderID: string): Boolean {

        if (orderID === this.oldData.orderID && this.currentCompanyOrderStyleGroup.length > 0) {
            return true;
        } else {
            this.clrOldData();
            return false;
        }
    }

    clrOldData() {
        this.oldData = {
            orderID: '',
            currentCompanyOrderStyleGroup: this.currentCompanyOrderStyleGroup,
            orderStyleColorSize: this.orderStyleColorSize,
            currentCompanyOrder: this.currentCompanyOrder,
            currentOrderStyle: this.currentOrderStyle,
        };
    }


    checkOrderExisted() {
        const companyID = this.company.companyID;
        if (this.dPacking1.customerID !== '' && this.dPacking1.orderID !== '') {
            const existed = this.checkOldData(this.dPacking1.orderID);
            if (!existed) {
                this.getOrder1(companyID, this.dPacking1.orderID)
            } else {
                // console.log('old data',this.oldData);
            }
        } else {

        }
    }


    // export class DPackingQTY {
    //     constructor(
    //         public productColor: string,
    //         public productSize: string,
    //         public totalQty: number,

    //         public colorSeq: number,
    //         public sizeSeq: number,

    //     ) {}
    // }

    // // ## DBox
    // export class DBox {
    //     constructor(
    //         // public cartonID: string,  // box size     D55*W28*H25  D37*W37*H20 …
    //         public productColor: string,
    //         public productSize: string,
    //         public productQty: number,

    //         public colorSeq: number,
    //         public sizeSeq: number,
    //     ) {}
    // }

    // size1: any[] = [];
    // sizeC: any[] = [];
    // sizeW: any[] = [];

    calDCartonQty_All() {
        let totalCarton = 0;  // ##  counting box
        let totalDPQty = 0;  // ##  total all qty

        let dPackingQTY1: DPackingQTY[] = [];
        this.size1 = [];

        this.dPacking1.dCarton.forEach( (item, index) => {
            totalCarton = totalCarton + 1;

            let totalQTY = 0;
            item.dBox.forEach( (item2, index) => {
                totalDPQty = totalDPQty + +item2.productQty;
                totalQTY = totalQTY + +item2.productQty;

                // ## update DPackingQTY[]
                let dPackingQTY1_: DPackingQTY = {
                    productColor: item2.productColor,
                    productSize: item2.productSize,
                    totalQty: item2.productQty,
                    colorSeq: item2.colorSeq,
                    sizeSeq: item2.sizeSeq,
                };
                const idx = dPackingQTY1.findIndex( i =>(
                        i.productColor == item2.productColor
                        && i.productSize == item2.productSize));
                if (idx < 0) {
                    dPackingQTY1.push(dPackingQTY1_);
                } else {
                    dPackingQTY1[idx].totalQty = dPackingQTY1[idx].totalQty + item2.productQty;
                }

                // ## update size
                const idxSize = this.size1.findIndex( i =>(i.productSize == item2.productSize));
                if (idxSize < 0) {
                    this.size1.push({
                        productSize: item2.productSize,
                        sizeSeq: item2.sizeSeq
                    });
                    this.size1.sort((a,b)=>{ return a.sizeSeq >b.sizeSeq?1:a.sizeSeq <b.sizeSeq?-1:0 });
                } else {

                }

            });
            item.totalQTY = totalQTY;
        });

        this.dPacking1.dPackingQTY = dPackingQTY1;
        this.dPacking1.totalCarton = totalCarton;
        this.dPacking1.totalDPQty = totalDPQty;
    }

    calDCartonQty_Completed() {
        // this.dPackingCompleted = JSON.parse(JSON.stringify(this.dPacking1));
        // this.dPackingWaiting = JSON.parse(JSON.stringify(this.dPacking1));
        let totalCarton = 0;  // ##  counting box
        let totalDPQty = 0;  // ##  total all qty

        let dPackingQTYC: DPackingQTY[] = [];
        this.sizeC = [];

        this.dPackingCompleted.dCarton.forEach( (item, index) => {
            totalCarton = totalCarton + 1;

            let totalQTY = 0;
            item.dBox.forEach( (item2, index) => {
                totalDPQty = totalDPQty + +item2.productQty;
                totalQTY = totalQTY + +item2.productQty;

                // ## update DPackingQTY[]
                let dPackingQTY1_: DPackingQTY = {
                    productColor: item2.productColor,
                    productSize: item2.productSize,
                    totalQty: item2.productQty,
                    colorSeq: item2.colorSeq,
                    sizeSeq: item2.sizeSeq,
                };
                const idx = dPackingQTYC.findIndex( i =>(
                        i.productColor == item2.productColor
                        && i.productSize == item2.productSize));
                if (idx < 0) {
                    dPackingQTYC.push(dPackingQTY1_);
                } else {
                    dPackingQTYC[idx].totalQty = dPackingQTYC[idx].totalQty + item2.productQty;
                }

                // ## update size
                const idxSize = this.sizeC.findIndex( i =>(i.productSize == item2.productSize));
                if (idxSize < 0) {
                    this.sizeC.push({
                        productSize: item2.productSize,
                        sizeSeq: item2.sizeSeq
                    });
                    this.sizeC.sort((a,b)=>{ return a.sizeSeq >b.sizeSeq?1:a.sizeSeq <b.sizeSeq?-1:0 });
                } else {

                }
            });
            item.totalQTY = totalQTY;
        });

        this.dPackingCompleted.totalCarton = totalCarton;
        this.dPackingCompleted.totalDPQty = totalDPQty;
    }

    calDCartonQty_Waiting() {
        // this.dPackingCompleted = JSON.parse(JSON.stringify(this.dPacking1));
        // this.dPackingWaiting = JSON.parse(JSON.stringify(this.dPacking1));
        let totalCarton = 0;  // ##  counting box
        let totalDPQty = 0;  // ##  total all qty

        let dPackingQTYW: DPackingQTY[] = [];
        this.sizeW = [];

        this.dPackingWaiting.dCarton.forEach( (item, index) => {
            totalCarton = totalCarton + 1;

            let totalQTY = 0;
            item.dBox.forEach( (item2, index) => {
                totalDPQty = totalDPQty + +item2.productQty;
                totalQTY = totalQTY + +item2.productQty;

                // ## update DPackingQTY[]
                let dPackingQTY1_: DPackingQTY = {
                    productColor: item2.productColor,
                    productSize: item2.productSize,
                    totalQty: item2.productQty,
                    colorSeq: item2.colorSeq,
                    sizeSeq: item2.sizeSeq,
                };
                const idx = dPackingQTYW.findIndex( i =>(
                        i.productColor == item2.productColor
                        && i.productSize == item2.productSize));
                if (idx < 0) {
                    dPackingQTYW.push(dPackingQTY1_);
                } else {
                    dPackingQTYW[idx].totalQty = dPackingQTYW[idx].totalQty + item2.productQty;
                }

                // ## update size
                const idxSize = this.sizeW.findIndex( i =>(i.productSize == item2.productSize));
                if (idxSize < 0) {
                    this.sizeW.push({
                        productSize: item2.productSize,
                        sizeSeq: item2.sizeSeq
                    });
                    this.sizeW.sort((a,b)=>{ return a.sizeSeq >b.sizeSeq?1:a.sizeSeq <b.sizeSeq?-1:0 });
                } else {

                }
            });
            item.totalQTY = totalQTY;
        });

        this.dPackingWaiting.totalCarton = totalCarton;
        this.dPackingWaiting.totalDPQty = totalDPQty;
    }


    getOrder1(companyID: string, orderID: string) {
        // console.log('getOrder1');
        this.orderService.getOrder1(companyID, orderID);
        if (this.order1Sub) { this.order1Sub.unsubscribe(); }
        this.order1Sub = this.orderService.getOrder1UpdatedListener().subscribe((data) => {
            // console.log(data);
            this.order = data.order;
            this.getRepCompanyOrderByOrderID(this.order.orderID);
        });
    }

    async getRepCompanyOrderByOrderID(orderID: string) {
        this.lastColor = '';
        this.orders = [];
        // getRepCompanyOrder(companyID: string, ordertatus: string[])
        const ordertatus = ['any'];
        this.repService.getRepCompanyOrderByOrderID(this.company.companyID, ordertatus, orderID);
        if (this.repCompanyOrderSub) { this.repCompanyOrderSub.unsubscribe(); }
        this.repCompanyOrderSub = this.repService.getRepCompanyOrderUpdatedListener().subscribe((data) => {
            // console.log(data);
            // this.orderStyleColorSize = this.repService.setColorSeq(this.sizes, data.orderStyleColorSize);
            this.orderStyleColorSize = data.orderStyleColorSize;
            this.currentCompanyOrder = data.currentCompanyOrder;
            // console.log(this.currentCompanyOrder);
            // console.log(this.orderStyleColorSize);

            this.orderIDs = Array.from(new Set(this.currentCompanyOrder.map((item: any) => item.orderID)));
            // console.log(this.orderIDs);
            this.getOrdersByOrderIDs(this.orderIDs, orderID);
            // console.log([this.order.orderID]);
            // this.getOrdersByOrderIDs([this.order.orderID]);

            this.currentOrderStyle = data.currentOrderStyle;
            // this.currentOrderStyle.sort((a,b)=>{
            //     return a.style >b.style?1:a.style <b.style?-1:0
            // });

        });
    }

    getOrdersByOrderIDs(orderIDs: string[], orderID: string) {
        // getOrdersByOrderIDs(companyID: string, orderIDs: string[])
        this.orderService.getOrdersByOrderIDs(this.company.companyID, orderIDs);
        if (this.ordersByOrderIDsSub) { this.ordersByOrderIDsSub.unsubscribe(); }
        this.ordersByOrderIDsSub = this.orderService.getOrdersByOrderIDsListener().subscribe((data) => {
            // console.log(data);
            this.orders = data.orders;
            this.ordersCount = data.ordersCount;
            // this.orderStyleColorSize = this.repService.setColorSeq(this.orders.orderColors, this.orderStyleColorSize);

            // // ## adjust group for style
            // this.currentCompanyOrderStyleGroup = this.userService.groupBy(this.currentCompanyOrder, (c: any) => c.style);
            // this.currentCompanyOrderStyleGroup = Object.values(this.currentCompanyOrderStyleGroup);
            // this.currentCompanyOrderStyleGroup.forEach( (item, index) => {
            //     // console.log(item, index);
            //     item = this.repService.setAnySizeSeq(this.sizes, item);
            //     item = this.repService.setAnyColorSeq(item[0].orderColor, item);
            // });
            // console.log(this.currentCompanyOrderStyleGroup);

            // this.currentOrderStyle = data.currentOrderStyle;
            this.currentOrderStyle.sort((a,b)=>{
                return a.style >b.style?1:a.style <b.style?-1:0
            });

            this.orderStyleColorSize.forEach( (item, index) => {
                item.productSize = this.userService.strReplaceAll(item.productSize, '-', '');
            });
            this.orderStyleColorSize = this.repService.setSizeSeq(this.sizes, this.orderStyleColorSize);
            this.orderStyleColorSize = this.repService.setColorSeq(this.colors, this.orderStyleColorSize);


            // ## multi sort 2 property
            this.orderStyleColorSize.sort((a,b)=>{
                return a.style >b.style?1:a.style <b.style?-1:0
                    || a.colorSeq >b.colorSeq?1:a.colorSeq <b.colorSeq?-1:0
                    || a.sizeSeq >b.sizeSeq?1:a.sizeSeq <b.sizeSeq?-1:0
            });

            // this.orderStyleColorSize.sort((a,b)=>{
            //     return a.productColor >b.productColor?1:a.productColor <b.productColor?-1:0
            //         || a.sizeSeq >b.sizeSeq?1:a.sizeSeq <b.sizeSeq?-1:0
            // });


            // console.log(this.orderStyleColorSize);
            // console.log(this.currentOrderStyle, this.orderStyleColorSize, this.currentCompanyOrder);
            // console.log(this.currentCompanyOrder);

            // ## grouping style
            this.currentCompanyOrder.sort((a,b)=>{ return a.style >b.style?1:a.style <b.style?-1:0 });
            // console.log(this.currentCompanyOrder);

            this.currentCompanyOrder.forEach( (item, index) => {
                item.productSize = this.userService.strReplaceAll(item.productSize, '-', '');
            });
            // console.log(this.currentCompanyOrder);

            // this.currentCompanyOrderStyleGroup[0][0] = undefined;

            this.currentCompanyOrderStyleGroup = this.userService.groupBy(this.currentCompanyOrder, (c: any) => c.style);
            // console.log(this.currentCompanyOrderStyleGroup);

            this.currentCompanyOrderStyleGroup = Object.values(this.currentCompanyOrderStyleGroup);
            // console.log(this.currentCompanyOrderStyleGroup);

            this.currentCompanyOrderStyleGroup.sort((a,b)=>{ return a.style >b.style?1:a.style <b.style?-1:0 });
            // console.log(this.currentCompanyOrderStyleGroup);

            // ## save for old order data  this.records = Object.assign([], this.dataSource.data);
            const currentCompanyOrderStyleGroup: any[] = Object.assign([], this.currentCompanyOrderStyleGroup);
            this.oldData = {
                orderID: orderID,
                currentCompanyOrderStyleGroup: [...currentCompanyOrderStyleGroup],
                orderStyleColorSize: [...this.orderStyleColorSize],
                currentCompanyOrder: [...this.currentCompanyOrder],
                currentOrderStyle: [...this.currentOrderStyle],
            };


            // console.log('new data fecth',this.oldData);
        });
    }

    currentCartonIDX(cartonIDX: number): number {
        const cartonIDX_ = cartonIDX + ((this.page - 1) * this.rows);
        return cartonIDX_;
    }

    addDBox1(cartonIDX: number) {
        const cartonIDX_ = this.currentCartonIDX(cartonIDX);
        if (this.dPacking1.customerID !== '' && this.dPacking1.orderID !== ''
            && this.oldData.currentCompanyOrderStyleGroup.length> 0) {
            this.showOrder1Selection(cartonIDX_);
        } else {

        }
    }

    delDBox1(cartonIDX: number) {
        const cartonIDX_ = this.currentCartonIDX(cartonIDX);
        const dCartonx = this.dPacking1.dCarton[cartonIDX_];
        this.dPacking1.dCarton.splice(cartonIDX_, 1);

        this.refreshDCarton1();
    }

    updateOrderCarton(data1: any) {
        // const data1: any = { cartonIDX, productBarcode, color, size, targetPlace, qty };
        // console.log(data1);

        const cartonIDSize = ''; // D55*W28*H25  D37*W37*H20 …
        const cartonIDX = data1.cartonIDX;
        const color = data1.color;
        const size = data1.size;
        const qty = data1.qty;
        // const targetPlace = data1.targetPlace;
        const colorSeq = this.userService.getColorSeq(color);
        const sizeSeq = this.userService.getSizeSeq(size);
        // const productColor = this.userService.getColorNameByColorCode(color, this.userService.getSetNameColorByOrderID(this.dPacking1.orderID))
        // const productSize = this.userService.getSizeName(this.userService.strReplaceAll(size, '-', '')) +'';

        const dCartonx = this.dPacking1.dCarton[cartonIDX];
        const dBox = dCartonx.dBox;
        // console.log(dBox);
        const dBoxF = dBox.filter(i=>i.productColor == color && i.productSize == size); // && i.productSize != size
        // console.log('dBoxF.length === ' , dBoxF.length, dBox);

        if (dBoxF.length === 0) {
            // console.log('dBoxF.length === 0');
            const dBox1: DBox = {
                // cartonID: cartonIDSize,
                productColor: color,
                productSize: size,
                productQty: +qty,
                colorSeq,
                sizeSeq
            };
            dBox.push(dBox1);
            dBox.sort((a,b)=>{
                return a.colorSeq >b.colorSeq?1:a.colorSeq <b.colorSeq?-1:0
                    || a.sizeSeq >b.sizeSeq?1:a.sizeSeq <b.sizeSeq?-1:0
            });
        }
        // console.log(this.dPacking1);
    }

    del1OrderCartonBox(cartonIDX: number, orderIDX: number) {
        const dCartonx = this.dPacking1.dCarton[cartonIDX];
        let dBoxx = dCartonx.dBox;
        dBoxx.splice(orderIDX, 1);

        dBoxx.sort((a,b)=>{
            return a.colorSeq >b.colorSeq?1:a.colorSeq <b.colorSeq?-1:0
                || a.sizeSeq >b.sizeSeq?1:a.sizeSeq <b.sizeSeq?-1:0
        });
    }

    showOrder1Selection(cartonIDX: number) {
        const ref = this.dialogService.open(SmdDeliOrderSelectComponent, {
            data: {
                id: 'order1-country-color-qty-Selection',
                mode: 'order1-country-color-qty-Selection',
                company: this.userService?.getCompany(),
                callfrom: this.formActive,  // ## send to nodejs for choose buckets
                moduleCaption: '',  // ##
                cartonIDX: cartonIDX,

                orderID: this.oldData.orderID,
                currentCompanyOrderStyleGroup: this.oldData.currentCompanyOrderStyleGroup,
                orderStyleColorSize: this.oldData.orderStyleColorSize,
                currentCompanyOrder: this.oldData.currentCompanyOrder,
                currentOrderStyle: this.oldData.currentOrderStyle,
                order: this.order,
                orders: this.orders,

                btnCaption: 'choose'

            },
            header: 'order 1 country-color-qty Selection [ ' + this.oldData.orderID + ' ]',
            width: '80%',
        });

        ref.onClose.subscribe((data: any) => {
            // console.log(data);
            if (!data) {

            } else{
                this.updateOrderCarton(data)
                // this.dPacking1.orderID = data.orderImage.orderID;
                // orderImagesSelect: OrderImage[] = [];
                // this.orderImagesSelect.push(data.orderImage);
                // this.orderImagesSelect[idx] = {orderID: data.orderImage.orderID, imageProfile: data.orderImage.imageProfile};
                // this.checkOrderExisted();
            }
        });
    }



    showSeasonsList() {
        const ref = this.dialogService.open(SmdYarnSeasonyearComponent, {
            data: {
                id: 'deliSeasonsSelection',
                company: this.userService?.getCompany(),
                callfrom: this.formActive,  // ## send to nodejs for choose buckets
                moduleCaption: '',  // ## delivery
                btnCaption: 'choose'

            },
            header: 'Season Selection',
            width: '80%',
        });

        ref.onClose.subscribe((data: any) => {
            // console.log(data);
            this.dPacking1.seasonYear = data;
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
                id: 'customersDeliSelection',
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
                this.dPacking1.customerID = this.customer.customerID;
                this.userService.setCustomer(customer);
                // this.userService.setDataAroundAppStatusListenerToNext();
                this.checkOrderExisted();
            }
        });
    }

    // ## mode = orderID-selector , this case idx = 0 always
    showStyleSelector(mode: string, idx: number) {
        // console.log(mode, idx);
        this.orderIDs_ = this.userService.getOrderIDss();
        this.orderImages = this.userService.getOrderImage(this.orderIDs_);
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

            } else{
                this.dPacking1.orderID = data.orderImage.orderID;
                // orderImagesSelect: OrderImage[] = [];
                // this.orderImagesSelect.push(data.orderImage);
                // this.orderImagesSelect[idx] = {orderID: data.orderImage.orderID, imageProfile: data.orderImage.imageProfile};
                this.checkOrderExisted();
            }

        });
    }

    // ##
    showDCountrySelector(mode: string) {
        // console.log(mode, idx);
        // this.orderIDs = this.userService.getOrderIDss();
        // this.orderImages = this.userService.getOrderImage(this.orderIDs);
        const ref = this.dialogService.open(SmdDeliCountrySelectComponent, {
            data: {
                id: 'countryIDSelection',
                company: this.userService?.getCompany(),
                dCountries: this.dCountries,
                mode: mode,  // ## mode = orderID-selector
                // idx: idx,
                btnCaption: 'choose'

            },
            header: 'Country Selection',
            width: '80%',
        });

        ref.onClose.subscribe((data: any) => {
            // console.log(data);
            if (!data) {

            } else{
                this.dCountry = data.dCountry;
                this.dPacking1.dCountryID = this.dCountry.dCountryID;
                // orderImagesSelect: OrderImage[] = [];
                // this.orderImagesSelect.push(data.orderImage);
                // this.orderImagesSelect[idx] = {orderID: data.orderImage.orderID, imageProfile: data.orderImage.imageProfile};
            }

        });
    }

    showCartonIDBoxSizeSelector(cartonIDX: number) {
        // const cartonIDX_ = cartonIDX + ((this.page - 1) * this.rows);
        const cartonIDX_ = this.currentCartonIDX(cartonIDX);
        const ref = this.dialogService.open(SmdDeliCartonSizeSelectComponent, {
            data: {
                id: 'carton-box-size-Selection',
                mode: 'carton-box-size-Selection',
                company: this.userService?.getCompany(),
                callfrom: this.formActive,  // ## send to nodejs for choose buckets
                moduleCaption: '',  // ##
                cartonIDX: cartonIDX_,

                // orderID: this.oldData.orderID,
                // currentCompanyOrderStyleGroup: this.oldData.currentCompanyOrderStyleGroup,
                // orderStyleColorSize: this.oldData.orderStyleColorSize,
                // currentCompanyOrder: this.oldData.currentCompanyOrder,
                // currentOrderStyle: this.oldData.currentOrderStyle,
                dCartons: this.dCartons,
                // orders: this.orders,

                btnCaption: 'choose'

            },
            header: 'Carton box size Selection',
            width: '80%',
        });

        ref.onClose.subscribe((data: any) => {
            // console.log(data);
            if (!data) {
                // this.dPacking1.dCarton[cartonIDX].cartonID = '';
            } else{
                const cartonIDXX: number = data.cartonIDX;
                const dCarton: DCarton = data.dCarton;
                this.dPacking1.dCarton[cartonIDXX].cartonID = dCarton.cartonID;
                // this.updateOrderCarton(data)
                // this.dPacking1.orderID = data.orderImage.orderID;
                // orderImagesSelect: OrderImage[] = [];
                // this.orderImagesSelect.push(data.orderImage);
                // this.orderImagesSelect[idx] = {orderID: data.orderImage.orderID, imageProfile: data.orderImage.imageProfile};
                // this.checkOrderExisted();
            }
        });
    }

    showAddCartonBoxNum() {
        const ref = this.dialogService.open(SmdDeliCartonAddboxComponent, {
            data: {
                id: 'deliAddCartonNumSelection',
                company: this.userService?.getCompany(),
                callfrom: this.formActive,  // ## send to nodejs for choose buckets
                moduleCaption: '',  // ## delivery
                numBox: 1,
                btnCaption: 'choose'

            },
            header: 'input Carton qty number',
            width: '30%',
        });

        ref.onClose.subscribe((data: any) => {
            // console.log(data);
            if (!data) {

            } else{
                this.addDCartons(data.num);
            }

        });
    }

    ngOnDestroy(): void {
        if (this.dataAroundAppSub) { this.dataAroundAppSub.unsubscribe(); }
        if (this.countriesSub) { this.countriesSub.unsubscribe(); }
        if (this.repCompanyOrderSub) { this.countriesSub.unsubscribe(); }
        if (this.ordersByOrderIDsSub) { this.ordersByOrderIDsSub.unsubscribe(); }
        if (this.order1Sub) { this.order1Sub.unsubscribe(); }
        if (this.cartonsSub) { this.cartonsSub.unsubscribe(); }
        if (this.dPackingCreateSub) { this.dPackingCreateSub.unsubscribe(); }
        if (this.dPackingsSub) { this.dPackingsSub.unsubscribe(); }

        // if (this.dPackingsSub) { this.dPackingsSub.unsubscribe(); }
        // if (this.dPackingsSub) { this.dPackingsSub.unsubscribe(); }
        // if (this.dPackingsSub) { this.dPackingsSub.unsubscribe(); }
        // if (this.dPackingsSub) { this.dPackingsSub.unsubscribe(); }

    }
}
