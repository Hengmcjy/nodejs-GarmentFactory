import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { GBC } from 'src/app/global/const-global';
import { ColorS, Company, Factory, SizeS } from 'src/app/models/app.model';
import { Order } from 'src/app/models/order.model';
import { CurrentCompanyOrder, CurrentCompanyOrderStyleSize, OrderStyleColorSize } from 'src/app/models/report.model';
import { FlowSeq, NodeFlow, NodeStation } from 'src/app/models/workstation.model';
import { NodeStationService } from 'src/app/services/node-station.service';
import { OrderService } from 'src/app/services/order.service';
import { ReportService } from 'src/app/services/report.service';
import { UserService } from 'src/app/services/user.service';

@Component({
    selector: 'app-s-rep-fac-process-period',
    templateUrl: './s-rep-fac-process-period.component.html',
    styleUrls: ['./s-rep-fac-process-period.component.scss'],
})
export class SRepFacProcessPeriodComponent implements OnInit, OnDestroy {
    // @Input() factory: Factory = this.userService.clrFactory();
    @Input() callFrom: string = ''; // ## nodeID
    @Input() repMode: string = ''; // ##   rep-fac-process-period-percent

    reportHeader = 'Work in process by period [Style]';
    company: Company = GBC.clrCompany();
    factories: Factory[] = [];
    factory: Factory = GBC.clrFactory();
    nodeFlow: NodeFlow = GBC.clrNodeFlow();
    flowSeq: FlowSeq[] = [];
    nodeStations: NodeStation[] = [];

    blockedPanel: boolean = false;
    seasonYear = '';

    // orders: Order[] = this.orderService.getOrdersArr();
    orders: Order[] = [];
    orderIDs: string[] = [];
    ordersCount = 0;
    orderColor: ColorS[] = [];

    orderStyleColorSize: OrderStyleColorSize[] = [];
    currentCompanyOrderStyleSize: CurrentCompanyOrderStyleSize[] = [];
    // currentForLossCompanyOrderStyleSize: CurrentCompanyOrderStyleSize[] = [];
    currentProductionPeriod: any[] = [];
    currentProductionPeriodGroup: any[] = [];
    currentProductionForLoss: any[] = [];
    sizes: SizeS[] = [];
    colors: ColorS[] = [];

    lastColor = '';
    borderSet = false;
    completeNode = 'completeNode';
    // rowspan = 6;

    private repCurrentProductionPeriodSub: Subscription = new Subscription;
    private nodeFlowSub: Subscription = new Subscription;
    private ordersByOrderIDsSub: Subscription = new Subscription;
    private dataAroundAppSub: Subscription = new Subscription;

    constructor(
        public userService: UserService,
        private orderService: OrderService,
        public nsService: NodeStationService,
        private repService: ReportService
    ) {}

    ngOnInit(): void {
        this.reportHeader = this.userService.translateCode('hd', 'nu-working-period-style');
        this.company = this.userService.getCompany();
        this.factories = this.userService.getFactories();
        this.factory = this.factories.length>0?this.factories[0]:GBC.clrFactory();
        this.sizes = this.userService.sizes;
        this.colors = this.userService.colors;
        this.seasonYear = this.userService.seasonYear;

        // ## get DataAroundApp
        this.dataAroundAppSub = this.userService.getDataAroundAppStatusListener().subscribe((dataAroundApp) => {
            // ## season year
            // console.log(this.userService.seasonYear);
            // this.getRepCurrentProductionPeriod();
            if (this.seasonYear !== this.userService.seasonYear) {
                this.seasonYear = this.userService.seasonYear;
                this.getRepCurrentProductionPeriod();
            }
        });

        // console.log(this.orders);
        this.getNodeFlow();
        this.getRepCurrentProductionPeriod();
        // console.log(this.factory);



    }

    getRepCurrentProductionPeriod() {
        this.blockedPanel = true;
        this.orders = [];
        // getRepCurrentProductionPeriod(companyID: string, productStatus: string[])
        const productStatus = ['normal', 'problem', 'repaired', 'complete']; // normal , problem, complete
        const orderStatus = ['open'];
        this.repService.getRepCurrentProductionPeriod(this.company.companyID, productStatus, orderStatus);
        if (this.repCurrentProductionPeriodSub) { this.repCurrentProductionPeriodSub.unsubscribe(); }
        this.repCurrentProductionPeriodSub = this.repService.getRepCurrentProductionsPeriodCUpdatedListener().subscribe((data) => {
            this.blockedPanel = false;
            // console.log(data);
            this.currentProductionPeriod = data.currentProductionPeriod;
            this.currentProductionForLoss = data.currentProductionForLoss;
            this.orderStyleColorSize = data.orderStyleColorSize;
            this.currentCompanyOrderStyleSize = data.currentCompanyOrderStyleSize;
            // this.currentForLossCompanyOrderStyleSize = data.currentForLossCompanyOrderStyleSize;


            // console.log(this.currentProductionForLoss);
            // console.log(this.currentProductionPeriod);
            // console.log(this.orderStyleColorSize);
            // console.log(this.currentCompanyOrderStyleSize);
            this.orderIDs = Array.from(new Set(this.currentProductionPeriod.map((item: any) => item.orderID.trim())));
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

            this.currentCompanyOrderStyleSize.sort((a,b)=>{ return a.orderID >b.orderID?1:a.orderID <b.orderID?-1:0 });
            // console.log(this.currentCompanyOrder);

            this.currentCompanyOrderStyleSize.forEach( (item, index) => {
                item.productSize = this.userService.strReplaceAll(item.productSize, '-', '');
            });
            // console.log(this.currentCompanyOrderStyleSize);



            // this.currentForLossCompanyOrderStyleSize.forEach( (item, index) => {
            //     item.productSize = this.userService.strReplaceAll(item.productSize, '-', '');
            // });
            // console.log(this.currentForLossCompanyOrderStyleSize);

            this.orderStyleColorSize.forEach( (item, index) => {
                item.productSize = this.userService.strReplaceAll(item.productSize, '-', '');
            });
            this.orderStyleColorSize = this.repService.setSizeSeq(this.sizes, this.orderStyleColorSize);
            this.orderStyleColorSize = this.repService.setColorSeq(this.colors, this.orderStyleColorSize);


            this.updateColorseq();
            // ## multi sort 2 property
            this.orderStyleColorSize.sort((a,b)=>{
                return a.orderID >b.orderID?1:a.orderID <b.orderID?-1:0
                    || a.colorSeq >b.colorSeq?1:a.colorSeq <b.colorSeq?-1:0
                    || a.sizeSeq >b.sizeSeq?1:a.sizeSeq <b.sizeSeq?-1:0
            });
            // console.log(this.orderStyleColorSize);

            this.currentProductionPeriod.forEach( (item, index) => {
                item.size = this.userService.strReplaceAll(item.size, '-', '');
                item.color = this.userService.strReplaceAll(item.color, '-', '');
            });
            // console.log(this.currentProductionPeriod);

            this.currentProductionPeriod.forEach( (item, index) => {
                item.color = this.userService.changeColorTextToColorTextComma(item.color);
                item.sizeSeq = this.userService.getSizeSeq(item.size);
            });
            // console.log(this.currentProductionPeriod);

            this.currentProductionPeriod.sort((a,b)=>{
                return a.orderID >b.orderID?1:a.orderID <b.orderID?-1:0
                || a.color >b.color?1:a.color <b.color?-1:0
                || a.sizeSeq >b.sizeSeq?1:a.sizeSeq <b.sizeSeq?-1:0
            });
            // console.log(this.currentProductionPeriod);

            // currentProductionForLoss
            this.currentProductionForLoss.forEach( (item, index) => {
                item.size = this.userService.strReplaceAll(item.size, '-', '');
                item.color = this.userService.strReplaceAll(item.color, '-', '');
            });
            // console.log(this.currentProductionPeriod);

            this.currentProductionForLoss.forEach( (item, index) => {
                item.color = this.userService.changeColorTextToColorTextComma(item.color);
                item.sizeSeq = this.userService.getSizeSeq(item.size);
            });
            // console.log(this.currentProductionForLoss);

            // currentProductionPeriodGroup
            this.currentProductionPeriodGroup = this.userService.groupBy(this.currentProductionPeriod, (c: any) => c.orderID);
            // console.log(this.currentProductionPeriodGroup);
            this.currentProductionPeriodGroup = Object.values(this.currentProductionPeriodGroup);
            // console.log(this.currentProductionPeriodGroup);
            this.currentProductionPeriodGroup.sort((a,b)=>{ return a.orderID >b.orderID?1:a.orderID <b.orderID?-1:0 });
        });
    }

    updateColorseq() {
        this.orderStyleColorSize.forEach( (item, index) => {
            const ordersF = this.orders.filter(i=>i.orderID == item.orderID);
            if (ordersF.length > 0) {
                const colors = ordersF[0].orderColor;
                // if (!colors.filter(i=>i.color.colorID == item.productColor)[0]) {
                //     console.log(ordersF, colors);
                // }
                const seq = colors.filter(i=>i.color.colorID == item.productColor)[0].seq;
                item.colorSeq = seq;
            }
        });
    }

    getOrderQty(companyID: string, orderID: string, style: string,
        productColor: string, productSize: string) {
        // console.log(companyID, orderID, style, productColor, productSize);
        // return  targetPlaceID: string, countryID: string,
        // const targetPlaces = this.getOrderTargetPlace(orderID);
        // const targetPlaceID = targetPlaces[targetPlaceIndex].targetPlace.targetPlaceID;
        // const countryID = targetPlaces[targetPlaceIndex].targetPlace.countryID;
        const companyOrder = this.currentCompanyOrderStyleSize.filter(i=>i.orderID == orderID &&
            i.productColor == productColor && i.productSize == productSize);
        if (companyOrder.length>0) {
            return companyOrder[0].sumQty;
        } else {
            return '';
        }
    }

    getOrderForLossQty(companyID: string, orderID: string, style: string,
        productColor: string, productSize: string) {
        // console.log(companyID, orderID, style, productColor, productSize);
        // return  targetPlaceID: string, countryID: string,
        // const targetPlaces = this.getOrderTargetPlace(orderID);
        // const targetPlaceID = targetPlaces[targetPlaceIndex].targetPlace.targetPlaceID;
        // const countryID = targetPlaces[targetPlaceIndex].targetPlace.countryID;
        const companyOrder = this.currentProductionForLoss.filter(i=>i.orderID == orderID &&
            i.color == productColor && i.size == productSize);
        if (companyOrder.length>0) {
            return '('+companyOrder[0].sumProductQty+')';
        } else {
            return '';
        }
    }



    getOrderQtyGrandTotal(idx: number, groupColor: string) {
        // console.log(idx, idx2);
        // console.log( groupColor);
        // console.log(this.currentProductionPeriodGroup);
        // console.log(this.currentProductionPeriodGroup[idx]);
        // console.log(this.currentProductionPeriodGroup[idx2]);
        // const colorss: string[] =  this.orderStyleColorSizeGroupColorFilter(idx2);

        // productColor  //  && i.productColor == colorss[]


        // companyID  orderID  style
        // const companyID = this.currentProductionPeriodGroup[idx][0].companyID;
        const orderID = this.currentProductionPeriodGroup[idx][0].orderID;
        // const style = this.currentProductionPeriodGroup[idx][0].orderID;
        // console.log(companyID, orderID, style);

        const companyOrder = this.currentCompanyOrderStyleSize.filter(i=>i.orderID == orderID &&
            i.productColor == groupColor);
        if (companyOrder.length>0) {
            // console.log(companyOrder);
            // return companyOrder[0].sumQty;
            const totalQtyColumn = companyOrder.reduce((prev, cur) => {return prev + cur.sumQty;}, 0);
            return totalQtyColumn;
        } else {
            return '0';
        }
    }

    getOrderQtyColumnTotal(idx: number, groupColor: string, fromNode: string) {
        // console.log(idx, idx2);
        // console.log( groupColor);

        // companyID  orderID  style
        // const companyID = this.currentProductionPeriodGroup[idx][0].companyID;
        const orderID = this.currentProductionPeriodGroup[idx][0].orderID;
        // const style = this.currentProductionPeriodGroup[idx][0].orderID;
        // console.log(companyID, orderID, style);

        const currentProductionPeriod = this.currentProductionPeriod.filter(i=>i.orderID == orderID &&
            i.color == groupColor && i.fromNode == fromNode);
        if (currentProductionPeriod.length>0) {
            // console.log(currentProductionPeriod);
            // return currentProductionPeriod[0].sumProductQty;
            const totalQtyColumn = currentProductionPeriod.reduce((prev, cur) => {return prev + cur.sumProductQty;}, 0);
            return totalQtyColumn;
        } else {
            return '0';
        }

    }

    getPeriodQty(companyID: string, orderID: string, style: string, color: string, size: string, fromNode: string) {
        const currentProductionPeriod = this.currentProductionPeriod.filter(i=>i.orderID == orderID &&
            i.color == color && i.size == size && i.fromNode == fromNode);
        //
        // getOrderQty(companyID: string, orderID: string, style: string,
        //     productColor: string, productSize: string)

        let qty = this.getOrderQty(companyID, orderID, style, color, size);
        qty = qty === '' ? 0 : qty;

        if (currentProductionPeriod.length>0) {
            const sumProductQty =  currentProductionPeriod[0].sumProductQty;
            return sumProductQty >= qty ? qty : sumProductQty;
        } else {
            return '';
        }
    }

    getForLossPeriodQty(companyID: string, orderID: string, style: string, color: string, size: string, fromNode: string) {
        const currentProductionPeriod = this.currentProductionPeriod.filter(i=>i.orderID == orderID &&
            i.color == color && i.size == size && i.fromNode == fromNode);
        //
        // getOrderQty(companyID: string, orderID: string, style: string,
        //     productColor: string, productSize: string)

        let qty = this.getOrderQty(companyID, orderID, style, color, size);
        qty = qty === '' ? 0 : qty;

        if (currentProductionPeriod.length>0) {
            const sumProductQty =  currentProductionPeriod[0].sumProductQty;
            const forLoss =  sumProductQty > qty ? '(' + (+sumProductQty - +qty) + ')' : '';
            return forLoss;
        } else {
            return '';
        }
    }

    getPercentPeriodQty(percentRemain: string, companyID: string, orderID: string, style: string, color: string, size: string, fromNode: string) {
        // repPeriodShowRemain = false;  // ## false= show percent of qty completed , true = show percent of qty remaining
        //
        const sumQty = this.getOrderQty(companyID, orderID, style, color, size);
        const sumProductQty = this.getPeriodQty(companyID, orderID, style, color, size, fromNode);
        const percent = 100 - Math.floor(+sumProductQty / +sumQty * 100);
        const result = isNaN(percent) || percent === 0 ?'':percent+'%';

        // // 3807 24 100% 24 RG M
        // if (style.trim() === 'AA0Q1A3A' && color == 'RG' && size == 'M' ) {  // && result !== '100%'
        //     console.log('AA0Q1A3A = ', companyID,orderID,style,color,size,fromNode);
        //     console.log('result = ', sumQty, sumProductQty, result, sumProductQty, color, size);
        // }

        // return result;

        if (percentRemain === '') {
            return result;
        } else if (percentRemain === 'qtyCompleted') {
            const percent2 = Math.floor(+sumProductQty / +sumQty * 100);
            const result2 = isNaN(percent2) || percent2 === 0 ?'':percent2+'%';
            return result2;
        } else {
            return result;
        }

    }

    getPercentPeriodQtyRemain(companyID: string, orderID: string, style: string, color: string, size: string, fromNode: string) {
        //
        const sumQty = this.getOrderQty(companyID, orderID, style, color, size);
        const sumProductQty = this.getPeriodQty(companyID, orderID, style, color, size, fromNode);

        // const percent = Math.floor(+sumProductQty / +sumQty * 100);
        // const result = isNaN(percent)?'0':percent;
        // return result+'%';

        const result = +sumQty - +sumProductQty;
        return result <= 0 ?'':result;
    }

    orderStyleColorSizeFilter(idx: number, idx2: number){ // # mode = array || len
        const orderStyleColorSize = this.orderStyleColorSize.filter(i=>i.orderID == this.currentProductionPeriodGroup[idx][0].orderID);
        const unique_color = [...new Set(orderStyleColorSize.map((item: any) => item.productColor))];
        // console.log(unique_color);
        const colorInx = unique_color[idx2];

        orderStyleColorSize.sort((a,b)=>{
            return a.orderID >b.orderID?1:a.orderID <b.orderID?-1:0
                || a.colorSeq >b.colorSeq?1:a.colorSeq <b.colorSeq?-1:0
                || a.sizeSeq >b.sizeSeq?1:a.sizeSeq <b.sizeSeq?-1:0
        });
        // console.log(orderStyleColorSize);
        const orderStyleColorSizeF = orderStyleColorSize.filter( fi =>(fi.productColor === colorInx));
        // console.log(orderStyleColorSizeF);
        // return mode==='array'?orderStyleColorSizeF:orderStyleColorSizeF.length;
        return orderStyleColorSizeF;
    }

    orderStyleColorSizeGroupColorFilter(idx: number) {
        let orderStyleColorSize = this.orderStyleColorSize.filter(i=>i.orderID == this.currentProductionPeriodGroup[idx][0].orderID);

        let colors: ColorS[] = [];
        const colorsF = this.orders.filter(i=>i.orderID == this.currentProductionPeriodGroup[idx][0].orderID.trim());
        // console.log(colorsF);
        if (colorsF.length > 0) {
            colors = colorsF[0].orderColor;
        }
        orderStyleColorSize = this.repService.setColorSeq(colors, orderStyleColorSize);
        orderStyleColorSize.sort((a,b)=>{
            return a.orderID >b.orderID?1:a.orderID <b.orderID?-1:0
                || a.colorSeq >b.colorSeq?1:a.colorSeq <b.colorSeq?-1:0
                || a.sizeSeq >b.sizeSeq?1:a.sizeSeq <b.sizeSeq?-1:0
        });
        // console.log(orderStyleColorSize);
        const unique_color = [...new Set(orderStyleColorSize.map((item: any) => item.productColor))];
        // console.log(unique_color);
        return unique_color;
    }

    checkColorShow(color: string, doEdit: boolean, rowIdex: number) {
        if (doEdit && rowIdex === 0) { this.lastColor = '';}
        if (this.lastColor === color) {
            return false;
        } else {
            if (doEdit) {
                this.lastColor = color;
            }
            this.borderSet = true;
            return true;
        }
    }


    getNodeFlow() {
        // getNodeFlow(companyID: string, factoryID: string, nodeFlowID: string)
        // getNodeFlowUpdatedListener()
        this.nodeFlow = GBC.clrNodeFlow();
        this.flowSeq = [];
        this.nodeStations = [];
        const nodeFlowID = 'main';
        this.nsService.getNodeFlow(this.company.companyID, this.factory.factoryID, nodeFlowID);
        if (this.nodeFlowSub) { this.nodeFlowSub.unsubscribe(); }
        this.nodeFlowSub = this.nsService.getNodeFlowUpdatedListener().subscribe((data) => {
            // console.log(data);
            this.nodeFlow = data.nodeFlow;
            this.flowSeq = this.nodeFlow.flowSeq;
            this.nodeStations = data.nodeStations;
            // getNodeStationName(nodeStations: NodeStation[], nodeID: string)
            // console.log(this.nodeFlow);
            // console.log(this.flowSeq);
            // console.log(this.nodeStations);
        });
    }


    ngOnDestroy(): void {
        if (this.repCurrentProductionPeriodSub) { this.repCurrentProductionPeriodSub.unsubscribe(); }
        if (this.nodeFlowSub) { this.nodeFlowSub.unsubscribe(); }
        if (this.ordersByOrderIDsSub) { this.ordersByOrderIDsSub.unsubscribe(); }
        if (this.dataAroundAppSub) { this.dataAroundAppSub.unsubscribe(); }

        // if (this.langSub) { this.langSub.unsubscribe(); }
    }
}
