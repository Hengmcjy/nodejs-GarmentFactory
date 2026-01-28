import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { GBC } from 'src/app/global/const-global';
import { ColorS, Company, Factory, SizeS, TargetPlaceS } from 'src/app/models/app.model';
import { MainZone, OrderStyles } from 'src/app/models/order.model';
import { OrderService } from 'src/app/services/order.service';
import { UserService } from 'src/app/services/user.service';

@Component({
    selector: 'app-s-gen-qrcode',
    templateUrl: './s-gen-qrcode.component.html',
    styleUrls: ['./s-gen-qrcode.component.scss'],
})
export class SGenQrcodeComponent implements OnInit, OnDestroy {

    company: Company = GBC.clrCompany();
    factory: Factory = GBC.clrFactory();
    mainZone: MainZone[] = [];

    orderStyles: OrderStyles[] = [];

    productBarcodeNo = '************------------------------------';
    runningNo = 0;
    style = '************'; // ## product.productCustomerCode 12
    targetPlace = '----';
    countryID = '-----';
    year = '--';
    c1 = '--';
    c2 = '--';
    c3 = '--';
    c4 = '--';
    c5 = '--';
    size = '---';
    sex = '-';
    runNo = '#####';

    yearx = '';
    yearBefore: string[] = [];
    yearNow: string[] = [];
    yearAfter: string[] = [];

    colors: ColorS[] = [];
    sizes: SizeS[] = [];


    private orderStyleListSub: Subscription = new Subscription();

    constructor(
        public userService: UserService,
        private orderService: OrderService,
    ) {}

    ngOnInit(): void {
        this.company = this.userService.getCompany();
        this.factory = this.userService.getFactory();
        this.colors = this.userService.colors;
        this.sizes = this.userService.sizes;
        this.mainZone = this.userService.getMainZoneTargetPlace(this.userService.targetPlaces);
        // console.log(this.colors);
        this.colors.sort((a,b)=>{
            return a.setName >b.setName?1:a.setName <b.setName?-1:0
                || a.seq >b.seq?1:a.seq <b.seq?-1:0
        });

        this.getOrderStyles();
        this.productBarcodeNo = this.genproductBarcodeNo();

        this.yearx = new Date().getFullYear()+'';
        // console.log(this.year);
        this.yearNow.push(this.yearx);

        let yBefore = +this.yearx - 1;
        for(let i=1; i<=5; i++){
            this.yearBefore.push(yBefore+'');
            yBefore = yBefore - 1;
        }

        let yAfter = +this.yearx + 1;
        for(let i=1; i<=5; i++){
            this.yearAfter.push(yAfter+'');
            yAfter = yAfter + 1;
        }
    }

    // getClassSetName(setName: string): string {
    //     if (setName === 'gl') {
    //         return 'text-base text-blue-500';
    //     } else if (setName === 'muji') {
    //         return ' text-lg text-green-500';
    //     }
    //     return '';
    // }

    numberChange() {
        // console.log(this.runningNo);
        this.runNo = this.userService.setAddStrLen(this.runningNo+'',5,'0');
        this.genproductBarcodeNo();
    }

    selectStyle(orderStyles: OrderStyles) {
        // console.log(orderStyles);
        const style = orderStyles.orderID;
        this.style = this.userService.setAddBackStrLen(style+'',12,' ');
        this.genproductBarcodeNo();
    }

    selectZone(mainZone: MainZone) {
        // console.log(mainZone);
        const targetPlace = mainZone.targetPlaceID;
        this.targetPlace = this.userService.setAddBackStrLen(targetPlace+'',4,'-');
        this.genproductBarcodeNo();
    }

    selectYear(year: string) {
        // console.log(year);
        this.year = year.substr(2, 2)
        this.genproductBarcodeNo();
    }

    selectColor1(color: ColorS) {
        // console.log(color);
        this.c1 = color.color.colorID;
        this.genproductBarcodeNo();
    }

    selectSize(size: SizeS) {
        // console.log(size);
        const sizeX = size.size.sizeID;
        this.size = this.userService.setAddBackStrLen(sizeX+'',3,'-');
        this.genproductBarcodeNo();
    }

    genproductBarcodeNo() {
        const productBarcodeNo =
            this.style
            +this.targetPlace
            +this.countryID
            +this.year
            +this.c1+this.c2+this.c3+this.c4+this.c5
            +this.size
            +this.sex
            +this.userService.setAddStrLen(this.runningNo+'',5,'0');
        this.productBarcodeNo = productBarcodeNo;
        this.userService.productBarcodeNoInput = this.productBarcodeNo;
        return productBarcodeNo;
    }

    getColor(colorValue: string): string {
        return 'background-color: '+ colorValue +';';
    }

    getOrderStyles() {
        // getOrderStyles(companyID: string, orderStatus: string[])
        const orderStatus = ['open'];
        this.orderService.getOrderStyles(this.company.companyID, orderStatus);
        if (this.orderStyleListSub) { this.orderStyleListSub.unsubscribe(); }
        this.orderStyleListSub = this.orderService.getOrderStylesListsListener().subscribe((data) => {
            // console.log(data);
            this.orderStyles = data.orderStyles;

            this.orderStyles.sort((a,b)=>{ return a.orderID >b.orderID?1:a.orderID <b.orderID?-1:0 });

            // this.product = data.product;
            // // this.style = this.product.productCustomerCode.toUpperCase();
            // this.style = this.order.orderID;
            // this.style = this.userService.setAddBackStrLen(this.style, this.userService.styleLen, ' ');
            // // console.log(this.product);
            // // this.userService.setAddBackStrLen();
            // // setAddBackStrLen(this.style, this.userService.styleLen, ' ');
        });
    }

    ngOnDestroy(): void {
        if (this.orderStyleListSub) { this.orderStyleListSub.unsubscribe(); }
        // if (this.orderSub) { this.orderSub.unsubscribe(); }
        // if (this.orderProductSelectSub) { this.orderProductSelectSub.unsubscribe(); }
        // if (this.errSub) { this.errSub.unsubscribe(); }
        // if (this.langSub) { this.langSub.unsubscribe(); }
        // if (this.screenSub) { this.screenSub.unsubscribe(); }
    }
}
