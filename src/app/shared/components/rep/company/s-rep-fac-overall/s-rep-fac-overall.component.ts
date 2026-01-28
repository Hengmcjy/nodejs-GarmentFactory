import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { GBC } from 'src/app/global/const-global';

import { ColorS, Company, Factory, SizeS, TargetPlaceS } from 'src/app/models/app.model';
import { MainZone, Order } from 'src/app/models/order.model';
import { CurrentProductQtyAllC, CurrentProductQtyAllCF, OrderStyleColorSize } from 'src/app/models/report.model';
import { OrderService } from 'src/app/services/order.service';
import { ReportService } from 'src/app/services/report.service';
import { UserService } from 'src/app/services/user.service';

@Component({
    selector: 'app-s-rep-fac-overall',
    templateUrl: './s-rep-fac-overall.component.html',
    styleUrls: ['./s-rep-fac-overall.component.scss'],
})
export class SRepFacOverallComponent implements OnInit, OnDestroy {
    formActive = 'repFacOverall';
    pageActive = this.formActive;

    reportHeader = 'Factory Production';
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

    lastColor = '';

    currentAllProductQtyStyleGroup: any[] = [];
    currentFactoryProductQtyStyleGroup: any[] = [];
    currentProductQtyAllC: CurrentProductQtyAllC[] = [];
    currentProductQtyAllCF: CurrentProductQtyAllCF[] = [];
    orderStyleColorSize: OrderStyleColorSize[] = [];

    // currentProductQtyAllCFTable: any[] = [];

    private repCurrentProductQtyAllCFSub: Subscription = new Subscription;
    private ordersByOrderIDsSub: Subscription = new Subscription;
    private dataAroundAppSub: Subscription = new Subscription;

    constructor(
        public userService: UserService,
        private orderService: OrderService,
        private repService: ReportService,
    ) {}

    ngOnInit(): void {
        this.reportHeader = this.userService.translateCode('nu', 'nu-fac-production');
        this.company = this.userService.getCompany();
        this.factories = this.userService.getFactories().filter(fi => fi.fInfo.isOutsource === false);
        this.targetPlaces = this.userService.targetPlaces;
        this.mainZone = this.userService.getMainZoneTargetPlace(this.targetPlaces);
        this.sizes = this.userService.sizes;
        this.colors = this.userService.colors;

        this.dataAroundAppSub = this.userService.getDataAroundAppStatusListener().subscribe(dataAroundApp => {
            this.getRepCurrentProductQtyAllCF();
        });

        // console.log(this.targetPlaces, this.mainZone);
        this.lastColor = '';
        this.factoryIDs = this.userService.getFactoryIDArr(this.factories);
        this.getRepCurrentProductQtyAllCF();
    }

    getRepCurrentProductQtyAllCF() {
        this.lastColor = '';
        this.orders = [];
        // getRepCurrentProductQtyAllCF(companyID: string, factoryID: string[], productStatus: string[])
        const productStatus = ['normal', 'problem', 'repaired'];
        const ordertatus = ['open'];
        this.repService.getRepCurrentProductQtyAllCF(this.company.companyID, this.factoryIDs, productStatus, ordertatus);
        if (this.repCurrentProductQtyAllCFSub) { this.repCurrentProductQtyAllCFSub.unsubscribe(); }
        this.repCurrentProductQtyAllCFSub = this.repService.getRepCurrentProductQtyAllCFUpdatedListener().subscribe((data) => {
            // console.log(data);
            this.currentProductQtyAllC = data.currentProductQtyAllC;
            this.currentProductQtyAllCF = data.currentProductQtyAllCF;
            // console.log(this.currentProductQtyAllC, this.currentProductQtyAllCF);
            this.orderIDs = Array.from(new Set(this.currentProductQtyAllC.map((item: any) => item.style.trim())));
            // console.log(this.orderIDs);
            this.getOrdersByOrderIDs(this.orderIDs);
        });
    }

    getOrdersByOrderIDs(orderIDs: string[]) {
        // getOrdersByOrderIDs(companyID: string, orderIDs: string[])
        this.orderService.getOrdersByOrderIDs(this.company.companyID, orderIDs);
        if (this.ordersByOrderIDsSub) { this.ordersByOrderIDsSub.unsubscribe(); }
        this.ordersByOrderIDsSub = this.orderService.getOrdersByOrderIDsListener().subscribe((data) => {
            // console.log(data);
            this.orders = data.orders;
            this.ordersCount = data.ordersCount;
            // this.orderStyleColorSize = this.repService.setColorSeq(this.orders.orderColors, this.orderStyleColorSize);

            // ## replace - to empty
            this.currentProductQtyAllC.forEach( (item, index) => {
                item.size = this.userService.strReplaceAll(item.size, '-', '');
                item.color = this.userService.strReplaceAll(item.color, '-', '');
                item.targetPlace = this.userService.strReplaceAll(item.targetPlace, '-', '');
            });
            this.currentProductQtyAllCF.forEach( (item, index) => {
                item.size = this.userService.strReplaceAll(item.size, '-', '');
                item.color = this.userService.strReplaceAll(item.color, '-', '');
                item.targetPlace = this.userService.strReplaceAll(item.targetPlace, '-', '');
            });
            // console.log(this.currentProductQtyAllC, this.currentProductQtyAllCF);

            // ## change color text to textComma
            this.currentProductQtyAllC.forEach( (item, index) => {
                item.color = this.userService.changeColorTextToColorTextComma(item.color);
                item.sizeSeq = this.userService.getSizeSeq(item.size);
            });
            this.currentProductQtyAllCF.forEach( (item, index) => {
                item.color = this.userService.changeColorTextToColorTextComma(item.color);
                item.sizeSeq = this.userService.getSizeSeq(item.size);
            });
            // console.log(this.currentProductQtyAllC, this.currentProductQtyAllCF);

            // ## set group all factory
            // this.currentProductQtyAllC.sort((a,b)=>{ return a.style >b.style?1:a.style <b.style?-1:0 });
            this.currentProductQtyAllC.sort((a,b)=>{
                return a.style >b.style?1:a.style <b.style?-1:0
                || a.color >b.color?1:a.color <b.color?-1:0
                || a.sizeSeq >b.sizeSeq?1:a.sizeSeq <b.sizeSeq?-1:0
            });
            this.currentAllProductQtyStyleGroup = this.userService.groupBy(this.currentProductQtyAllC, (c: any) => c.style);
            // console.log(this.currentAllProductQtyStyleGroup);

            this.currentAllProductQtyStyleGroup = Object.values(this.currentAllProductQtyStyleGroup);
            // console.log(this.currentAllProductQtyStyleGroup);

            this.currentAllProductQtyStyleGroup.sort((a,b)=>{ return a.style >b.style?1:a.style <b.style?-1:0 });

            // ## set group factory
            // currentFactoryProductQtyStyleGroup
            this.currentProductQtyAllCF.sort((a,b)=>{
                return a.factoryID >b.factoryID?1:a.factoryID <b.factoryID?-1:0
                    || a.style >b.style?1:a.style <b.style?-1:0
                    || a.color >b.color?1:a.color <b.color?-1:0
                    || a.sizeSeq >b.sizeSeq?1:a.sizeSeq <b.sizeSeq?-1:0
            });
            this.currentFactoryProductQtyStyleGroup = this.userService.groupBy(this.currentProductQtyAllCF, (c: any) => c.style);
            // console.log(this.currentFactoryProductQtyStyleGroup);
            this.currentFactoryProductQtyStyleGroup = Object.values(this.currentFactoryProductQtyStyleGroup);
            // console.log(this.currentFactoryProductQtyStyleGroup);
            this.currentFactoryProductQtyStyleGroup.sort((a,b)=>{ return a.style >b.style?1:a.style <b.style?-1:0 });

        });
    }

    currentProductQtyAllCFilter(idx: number) {
        let table2: any[] = [];
        let currentProductQtyAllC = this.currentProductQtyAllC.filter(i=>i.style == this.currentAllProductQtyStyleGroup[idx][0].style);
        // console.log(currentProductQtyAllC);
        let colors: ColorS[] = [];
        const colorsF = this.orders.filter(i=>i.orderID == currentProductQtyAllC[0].style.trim());
        if (colorsF.length > 0) {
            colors = colorsF[0].orderColor;
        }

        currentProductQtyAllC.forEach( (item, index) => {
            item.colorSeq = this.userService.getColorSeq1(colors, item.color);
            const table = table2.filter(i=>i.color == item.color && i.size == item.size );
            if (table.length===0) { table2.push({...item}); }
        });
        table2.sort((a,b)=>{
            return a.style >b.style?1:a.style <b.style?-1:0
                || a.colorSeq >b.colorSeq?1:a.colorSeq <b.colorSeq?-1:0
                || a.sizeSeq >b.sizeSeq?1:a.sizeSeq <b.sizeSeq?-1:0
        });
        // console.log(table2);
        return table2;
    }

    currentProductQtyAllCFFilter(idx: number, factory: Factory) {
        let table2: any[] = [];
        let currentProductQtyAllCF = this.currentProductQtyAllCF.filter(i=>
            i.style == this.currentFactoryProductQtyStyleGroup[idx][0].style &&
            i.factoryID == factory.factoryID
        );
        // console.log(currentProductQtyAllCF);
        let colors: ColorS[] = [];
        if (currentProductQtyAllCF.length > 0 ) {
            const colorsF = this.orders.filter(i=>i.orderID == currentProductQtyAllCF[0].style.trim());
            if (colorsF.length > 0) {
                colors = colorsF[0].orderColor;
            }
        }

        // console.log(currentProductQtyAllCF);
        currentProductQtyAllCF.forEach( (item, index) => {
            item.colorSeq = this.userService.getColorSeq1(colors, item.color);
            const table = table2.filter(i=>i.color == item.color && i.size == item.size);
            if (table.length===0) { table2.push({...item}); }
        });
        // console.log(this.currentProductQtyAllCFTable);
        table2.sort((a,b)=>{
            return a.factoryID >b.factoryID?1:a.factoryID <b.factoryID?-1:0
                || a.style >b.style?1:a.style <b.style?-1:0
                || a.colorSeq >b.colorSeq?1:a.colorSeq <b.colorSeq?-1:0
                || a.sizeSeq >b.sizeSeq?1:a.sizeSeq <b.sizeSeq?-1:0
        });
        // console.log(table2);
        return table2;
    }
    // export class CurrentProductQtyAllCF {
    //     constructor(
    //         public companyID: string,
    //         public factoryID: string,
    //         public productID: string,
    //         public style: string,
    //         public targetPlace: string,
    //         public color: string,
    //         public size: string,
    //         public countQty: number,
    //         public colorSeq: number,
    //         public sizeSeq: number,
    //     ) {}
    // }

    //     color
    // companyID
                // countQty
    // factoryID
    // productID
    // size
    // sizeSeq
    // style
    // targetPlace

    getFactoryProductionQty(companyID: string, factoryID: string, productID: string, style: string,
        color: string, size: string, targetPlaceIndex: number) {
        // console.log(companyID, productID, style, color, size, targetPlaceIndex);
        // return  targetPlaceID: string, countryID: string,
        const targetPlaceID = this.mainZone[targetPlaceIndex].targetPlaceID;
        // const countryID = this.targetPlaces[targetPlaceIndex].targetPlace.countryID;
        // console.log(this.currentProductQtyAllCF);
        const factoryProduction = this.currentProductQtyAllCF.filter(i=>i.companyID == companyID && i.factoryID == factoryID &&
            i.productID == productID && i.style == style && i.targetPlace == targetPlaceID &&
            i.color == color && i.size == size);
        if (factoryProduction.length>0) {
            return factoryProduction[0].countQty;
        } else {
            return '';
        }
    }

    getFactoryProductionQtyRowTotal(companyID: string, factoryID: string, productID: string, style: string,
        color: string, size: string) {
        //
        const factoryProduction = this.currentProductQtyAllCF.filter(i=>i.companyID == companyID && i.factoryID == factoryID &&
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

    getFactoryProductionQtyColumnTotal(group: any, factory: Factory, targetPlaceIndex: number) {
        const targetPlaceID = this.mainZone[targetPlaceIndex].targetPlaceID;
        // const countryID = this.targetPlaces[targetPlaceIndex].targetPlace.countryID;
        const factoryProduction = this.currentProductQtyAllCF.filter(i=>
            i.companyID == group.companyID && i.factoryID == factory.factoryID &&
            i.productID == group.productID && i.style == group.style && i.targetPlace == targetPlaceID );
        // console.log(factoryProduction);
        if (factoryProduction.length>0) {
            const totalQtyColumn = factoryProduction.reduce((prev, cur) => {return prev + cur.countQty;}, 0);
            return totalQtyColumn;
        } else {
            return 0;
        }
    }

    getFactoryProductionQtyGrandTotal(group: any, factory: Factory) {
        const factoryProduction = this.currentProductQtyAllCF.filter(i=>
            i.companyID == group.companyID && i.factoryID == factory.factoryID &&
            i.productID == group.productID && i.style == group.style );
        if (factoryProduction.length>0) {
            const totalQtyGrand = factoryProduction.reduce((prev, cur) => {return prev + cur.countQty;}, 0);
            return totalQtyGrand;
        } else {
            return 0;
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

    getProductionQtyGrandTotal(group: any) {
        const factoryProduction = this.currentProductQtyAllC.filter(i=>i.companyID == group.companyID &&
            i.productID == group.productID && i.style == group.style );
        if (factoryProduction.length>0) {
            const totalQtyGrand = factoryProduction.reduce((prev, cur) => {return prev + cur.countQty;}, 0);
            return totalQtyGrand;
        } else {
            return 0;
        }
    }

    // groupBy(xs: any[], f: any) {
    //     return xs.reduce((r, v, i, a, k = f(v)) => ((r[k] || (r[k] = [])).push(v), r), {});
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

    ngOnDestroy(): void {
        if (this.repCurrentProductQtyAllCFSub) { this.repCurrentProductQtyAllCFSub.unsubscribe(); }
        if (this.ordersByOrderIDsSub) { this.ordersByOrderIDsSub.unsubscribe(); }
        if (this.dataAroundAppSub) { this.dataAroundAppSub.unsubscribe(); }

        // if (this.langSub) { this.langSub.unsubscribe(); }
    }
}
