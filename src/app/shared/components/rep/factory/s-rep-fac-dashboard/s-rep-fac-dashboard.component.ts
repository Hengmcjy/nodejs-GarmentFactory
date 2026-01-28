import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { GBC } from 'src/app/global/const-global';
import { Company, Factory, TargetPlaceS } from 'src/app/models/app.model';
import { MainZone } from 'src/app/models/order.model';
import { CurrentProductQtyAllCF } from 'src/app/models/report.model';
import { ReportService } from 'src/app/services/report.service';
import { UserService } from 'src/app/services/user.service';

@Component({
    selector: 'app-s-rep-fac-dashboard',
    templateUrl: './s-rep-fac-dashboard.component.html',
    styleUrls: ['./s-rep-fac-dashboard.component.scss'],
})
export class SRepFacDashboardComponent implements OnInit, OnDestroy {
    @Input() factory: Factory = GBC.clrFactory();

    reportHeader = 'Factory Production';
    lastColor = '';

    factoryIDs: string[] = [];
    company: Company = GBC.clrCompany();
    targetPlaces: TargetPlaceS[] = [];
    mainZone: MainZone[] = [];

    currentProductQtyAllCF: CurrentProductQtyAllCF[] = [];
    currentFactoryProductQtyStyleGroup: any[] = [];

    private selectFactorySub: Subscription = new Subscription;
    private repCurrentProductQtyAllCFSub: Subscription = new Subscription;
    private dataAroundAppSub: Subscription = new Subscription;

    constructor(
        public userService: UserService,
        private repService: ReportService,
    ) {}

    ngOnInit(): void {
        this.reportHeader = this.userService.translateCode('hd', 'hd-fac-production');
        this.company = this.userService.getCompany();
        this.targetPlaces = this.userService.targetPlaces;
        this.mainZone = this.userService.getMainZoneTargetPlace(this.targetPlaces);
        // console.log('SRepFacDashboardComponent');
        this.getSelectFactoryUpdatedListener();

        // ## get DataAroundApp
        this.dataAroundAppSub = this.userService.getDataAroundAppStatusListener().subscribe((dataAroundApp) => {
            // ## season year
            // console.log(this.userService.seasonYear);
            this.getRepCurrentProductQtyAllCF();
        });

        // console.log(this.factory);
        this.lastColor = '';
        this.factoryIDs = this.userService.getFactoryIDArr([this.factory]);
        this.getRepCurrentProductQtyAllCF();
    }

    getSelectFactoryUpdatedListener() {
        if (this.selectFactorySub) { this.selectFactorySub.unsubscribe(); }
        this.selectFactorySub = this.userService.getSelectFactoryUpdatedListener().subscribe((data) => {
            // console.log(data);
            this.factory = data.factory;
            this.lastColor = '';
            this.factoryIDs = this.userService.getFactoryIDArr([this.factory]);
            this.getRepCurrentProductQtyAllCF();
        });
    }

    getRepCurrentProductQtyAllCF() {
        this.lastColor = '';
        const productStatus = ['normal', 'problem', 'repaired'];

        this.repService.getRepCurrentProductQtyAllCFactory(this.company.companyID, this.factoryIDs, productStatus);
        if (this.repCurrentProductQtyAllCFSub) { this.repCurrentProductQtyAllCFSub.unsubscribe(); }
        this.repCurrentProductQtyAllCFSub = this.repService.getRepCurrentProductQtyAllCFactoryUpdatedListener().subscribe((data) => {
            // console.log(data);
            this.currentProductQtyAllCF = data.currentProductQtyAllCF;
            // console.log(this.currentProductQtyAllCF );

            this.currentProductQtyAllCF.forEach( (item, index) => {
                item.size = this.userService.strReplaceAll(item.size, '-', '');
                item.color = this.userService.strReplaceAll(item.color, '-', '');
                item.targetPlace = this.userService.strReplaceAll(item.targetPlace, '-', '');
            });

            this.currentProductQtyAllCF.forEach( (item, index) => {
                item.color = this.userService.changeColorTextToColorTextComma(item.color);
                item.sizeSeq = this.userService.getSizeSeq(item.size);
            });

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

    // currentProductQtyAllCFFilter(idx: number, factory: Factory) {
    //     // return this.currentProductQtyAllCF.filter(i=>i.factoryID == fac.factoryID);
    //     let table2: any[] = [];
    //     let currentProductQtyAllCF = this.currentProductQtyAllCF.filter(i=>
    //         i.style == this.currentFactoryProductQtyStyleGroup[idx][0].style &&
    //         i.factoryID == factory.factoryID
    //     );

    //     currentProductQtyAllCF.forEach( (item, index) => {
    //         const table = table2.filter(i=>i.color == item.color && i.size == item.size);
    //         if (table.length===0) { table2.push({...item}); }
    //     });

    //     table2.sort((a,b)=>{
    //         return a.factoryID >b.factoryID?1:a.factoryID <b.factoryID?-1:0
    //             || a.style >b.style?1:a.style <b.style?-1:0
    //             || a.color >b.color?1:a.color <b.color?-1:0
    //             || a.sizeSeq >b.sizeSeq?1:a.sizeSeq <b.sizeSeq?-1:0
    //     });
    //     return table2;
    // }

    currentProductQtyAllCFFilter(idx: number, factory: Factory) {
        let table2: any[] = [];
        let currentProductQtyAllCF = this.currentProductQtyAllCF.filter(i=>
            i.style == this.currentFactoryProductQtyStyleGroup[idx][0].style &&
            i.factoryID == factory.factoryID
        );
        // console.log(currentProductQtyAllCF);
        currentProductQtyAllCF.forEach( (item, index) => {
            const table = table2.filter(i=>i.color == item.color && i.size == item.size);
            if (table.length===0) { table2.push({...item}); }
        });
        // console.log(this.currentProductQtyAllCFTable);
        table2.sort((a,b)=>{
            return a.factoryID >b.factoryID?1:a.factoryID <b.factoryID?-1:0
                || a.style >b.style?1:a.style <b.style?-1:0
                || a.color >b.color?1:a.color <b.color?-1:0
                || a.sizeSeq >b.sizeSeq?1:a.sizeSeq <b.sizeSeq?-1:0
        });
        // console.log(table2);
        return table2;
    }

    getFactoryProductionQty(companyID: string, factoryID: string, productID: string, style: string,
        color: string, size: string, targetPlaceIndex: number) {
        // console.log(companyID, productID, style, color, size, targetPlaceIndex);
        // return  targetPlaceID: string, countryID: string,
        const targetPlaceID = this.mainZone[targetPlaceIndex].targetPlaceID;
        // const countryID = this.targetPlaces[targetPlaceIndex].targetPlace.countryID;
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
        if (this.selectFactorySub) { this.selectFactorySub.unsubscribe(); }
        if (this.repCurrentProductQtyAllCFSub) { this.repCurrentProductQtyAllCFSub.unsubscribe(); }
        if (this.dataAroundAppSub) { this.dataAroundAppSub.unsubscribe(); }

        // if (this.dataAroundAppSub) { this.dataAroundAppSub.unsubscribe(); }
    }
}
