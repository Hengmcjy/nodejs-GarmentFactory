import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { Subscription } from 'rxjs';
import { DialogService } from 'primeng/dynamicdialog';
import { MessageService } from 'primeng/api';

import { GBC } from 'src/app/global/const-global';
import { Company, Factory, TargetPlaceS } from 'src/app/models/app.model';
import { MainZone } from 'src/app/models/order.model';
import { OrderProductCFNodeRep } from 'src/app/models/report.model';
import { ReportService } from 'src/app/services/report.service';
import { UserService } from 'src/app/services/user.service';
import { SmdProductbarcodenoComponent } from '../../../order/smd-productbarcodeno/smd-productbarcodeno.component';

@Component({
    selector: 'app-s-rep-fac-node-station',
    templateUrl: './s-rep-fac-node-station.component.html',
    styleUrls: ['./s-rep-fac-node-station.component.scss'],
    providers: [DialogService, MessageService],
})
export class SRepFacNodeStationComponent implements OnInit, OnDestroy {
    @Input() factory: Factory = GBC.clrFactory();
    @Input() callFrom: string = ''; // ## nodeID

    reportHeader = 'Node Station Production';
    headMenuPopup = '';
    items: MenuItem[] = [];

    lastColor = '';
    factoryIDs: string[] = [];
    company: Company = GBC.clrCompany();
    targetPlaces: TargetPlaceS[] = [];
    mainZone: MainZone[] = [];

    orderProductCFNodeRep: OrderProductCFNodeRep[] = [];

    currentAllProductQtyStyleGroup: any[] = [];
    currentAllProductNodeQtyStyleGroup: any[] = [];

    refreshBtn = true;

    private selectFactorySub: Subscription = new Subscription;
    private repCurrentProductQtyAllCFNodeSub: Subscription = new Subscription;
    private dataAroundAppSub: Subscription = new Subscription;

    constructor(
        public dialogService: DialogService,
        public messageService: MessageService,

        public userService: UserService,
        private repService: ReportService,
    ) {}

    ngOnInit(): void {
        this.reportHeader = this.userService.translateCode('hd', 'hd-nodestation-production');
        this.company = this.userService.getCompany();
        this.targetPlaces = this.userService.targetPlaces;
        this.mainZone = this.userService.getMainZoneTargetPlace(this.targetPlaces);

        // ## get DataAroundApp
        this.dataAroundAppSub = this.userService.getDataAroundAppStatusListener().subscribe((dataAroundApp) => {
            // ## season year
            // console.log(this.userService.seasonYear);
            this.getRepCurrentProductQtyAllCFNode();
        });

        // console.log(this.userService.getOrders());
        // console.log('SRepFacNodeStationComponent');
        // console.log(this.callFrom);
        this.lastColor = '';
        this.getSelectFactoryUpdatedListener();

        this.factoryIDs = this.userService.getFactoryIDArr([this.factory]);
        this.getRepCurrentProductQtyAllCFNode();
    }



    getSelectFactoryUpdatedListener() {
        // console.log('SRepFacNodeStationComponent');
        if (this.selectFactorySub) { this.selectFactorySub.unsubscribe(); }
        this.selectFactorySub = this.userService.getSelectFactoryUpdatedListener().subscribe((data) => {
            // console.log(data);
            this.factory = data.factory;
            this.factoryIDs = this.userService.getFactoryIDArr([this.factory]);
            this.getRepCurrentProductQtyAllCFNode();
            // console.log(this.userService.getOrders());
        });
    }

    getRepCurrentProductQtyAllCFNode() {
        this.refreshBtn = false;
        // getRepCurrentProductQtyAllCFNode(companyID: string, factoryID: string[], productStatus: string[])
        this.lastColor = '';
        const productStatus = ['normal', 'problem', 'repaired'];
        this.repService.getRepCurrentProductQtyAllCFNode(this.company.companyID, this.factoryIDs, productStatus);
        if (this.repCurrentProductQtyAllCFNodeSub) { this.repCurrentProductQtyAllCFNodeSub.unsubscribe(); }
        this.repCurrentProductQtyAllCFNodeSub = this.repService.getRepCurrentProductQtyAllCFNodeUpdatedListener().subscribe((data) => {
            // console.log(data);
            this.refreshBtn = true;
            if (this.callFrom === '') { // ## call from worker node station
                this.orderProductCFNodeRep = data.orderProductCFNodeRep;
            } else {
                this.orderProductCFNodeRep = data.orderProductCFNodeRep.filter(i=>i.toNode == this.callFrom);
            }
            // console.log(this.orderProductCFNodeRep);
            this.orderProductCFNodeRep.forEach( (item, index) => {
                item.size = this.userService.strReplaceAll(item.size, '-', '');
                item.color = this.userService.strReplaceAll(item.color, '-', '');
            });
            this.orderProductCFNodeRep.forEach( (item, index) => {
                item.color = this.userService.changeColorTextToColorTextComma(item.color);
                item.sizeSeq = this.userService.getSizeSeq(item.size);
            });
            // this.orderProductCFNodeRep.sort((a,b)=>{
            //     return a.style >b.style?1:a.style <b.style?-1:0
            //     || a.color >b.color?1:a.color <b.color?-1:0
            //     || a.sizeSeq >b.sizeSeq?1:a.sizeSeq <b.sizeSeq?-1:0
            // });

            // this.orderProductCFNodeRep.sort((a,b)=>{
            //     return a.toNode >b.toNode?1:a.toNode <b.toNode?-1:0
            //     || a.style >b.style?1:a.style <b.style?-1:0
            //     || a.color >b.color?1:a.color <b.color?-1:0
            //     || a.sizeSeq >b.sizeSeq?1:a.sizeSeq <b.sizeSeq?-1:0
            // });

            this.orderProductCFNodeRep.sort((a,b)=>{
                return  a.style >b.style?1:a.style <b.style?-1:0
                || a.toNode >b.toNode?1:a.toNode <b.toNode?-1:0
                || a.color >b.color?1:a.color <b.color?-1:0
                || a.sizeSeq >b.sizeSeq?1:a.sizeSeq <b.sizeSeq?-1:0
            });


            // this.orderProductCFNodeRep.sort((a,b)=>{
            //     return a.style >b.style?1:a.style <b.style?-1:0
            //     || a.color >b.color?1:a.color <b.color?-1:0
            //     || a.sizeSeq >b.sizeSeq?1:a.sizeSeq <b.sizeSeq?-1:0
            // });

            // console.log(this.orderProductCFNodeRep);

            this.currentAllProductQtyStyleGroup = this.userService.groupBy(this.orderProductCFNodeRep, (c: any) => c.style);
            // console.log(this.currentAllProductQtyStyleGroup);

            this.currentAllProductQtyStyleGroup = Object.values(this.currentAllProductQtyStyleGroup);
            // console.log(this.currentAllProductQtyStyleGroup);
            this.currentAllProductQtyStyleGroup.sort((a,b)=>{ return a.style >b.style?1:a.style <b.style?-1:0 });

            // console.log(this.currentAllProductQtyStyleGroup[0][0]);
            // console.log(this.currentAllProductQtyStyleGroup[1]);
            // currentAllProductNodeQtyStyleGroup
            // console.log(this.currentAllProductQtyStyleGroup);
            // console.log(this.currentAllProductNodeQtyStyleGroup);
            this.currentAllProductQtyStyleGroup.forEach( (item, index) => {
                this.currentAllProductNodeQtyStyleGroup[index] = item;
                this.currentAllProductNodeQtyStyleGroup[index] = this.userService.groupBy(this.currentAllProductNodeQtyStyleGroup[index], (c: any) => c.toNode);
                this.currentAllProductNodeQtyStyleGroup[index] = Object.values(this.currentAllProductNodeQtyStyleGroup[index]);
            });
            // console.log(this.currentAllProductNodeQtyStyleGroup);


        });
    }

    currentProductQtyStyleNodeFilter(idx1: number) {
        // console.log(this.currentAllProductNodeQtyStyleGroup[idx1]);
        return this.currentAllProductNodeQtyStyleGroup[idx1];
    }

    currentProductQtyStyleFilter(idx1: number, idx2: number) {
        this.lastColor = '';
        let table2: any[] = [];
        const currentAllProductNodeQtyStyleGroup: OrderProductCFNodeRep[] = this.currentAllProductNodeQtyStyleGroup[idx1][idx2];
        // console.log(currentAllProductNodeQtyStyleGroup);

        // currentAllProductNodeQtyStyleGroup.sort((a,b)=>{
        //     return a.toNode >b.toNode?1:a.toNode <b.toNode?-1:0
        //     || a.style >b.style?1:a.style <b.style?-1:0
        //     || a.color >b.color?1:a.color <b.color?-1:0
        //     || a.sizeSeq >b.sizeSeq?1:a.sizeSeq <b.sizeSeq?-1:0
        // });

        currentAllProductNodeQtyStyleGroup.forEach( (item, index) => {
            const table = table2.filter(i=>i.color == item.color && i.size == item.size);
            if (table.length===0) { table2.push({...item}); }
        });
        // console.log(currentAllProductNodeQtyStyleGroup);

        // if (this.callFrom === '') { // ## call from worker node station
        //     currentAllProductNodeQtyStyleGroup.forEach( (item, index) => {
        //         const table = table2.filter(i=>i.color == item.color && i.size == item.size);
        //         if (table.length===0) { table2.push({...item}); }
        //     });
        // } else {
        //     console.log(this.callFrom);
        //     currentAllProductNodeQtyStyleGroup.forEach( (item, index) => {
        //         const table = table2.filter(i=>i.color == item.color && i.size == item.size && i.toNode == this.callFrom);
        //         if (table.length===0) { table2.push({...item}); }
        //     });
        // }

        // table2.sort((a,b)=>{
        //     return a.style >b.style?1:a.style <b.style?-1:0
        //         || a.toNode >b.toNode?1:a.toNode <b.toNode?-1:0
        //         || a.color >b.color?1:a.color <b.color?-1:0
        //         || a.sizeSeq >b.sizeSeq?1:a.sizeSeq <b.sizeSeq?-1:0
        // });

        table2.sort((a,b)=>{
            return a.toNode >b.toNode?1:a.toNode <b.toNode?-1:0
                || a.style >b.style?1:a.style <b.style?-1:0
                || a.color >b.color?1:a.color <b.color?-1:0
                || a.sizeSeq >b.sizeSeq?1:a.sizeSeq <b.sizeSeq?-1:0
        });

        // console.log(table2);
        return table2;
    }
    //     color
    // companyID
    // countQty
    // productID
    // size
    // sizeSeq
    // style
    // targetPlaceID
    // toNode

    getFactoryNodeProductionQty(companyID: string, productID: string, style: string,
        color: string, toNode: string, size: string, targetPlaceIndex: number, idx1: number, idx2: number) {
        // console.log(style, color,toNode,size , targetPlaceIndex, idx1, idx2);
        // console.log(this.currentAllProductNodeQtyStyleGroup[idx1][idx2]);
        // console.log(this.mainZone);
        const targetPlaceID = this.mainZone[targetPlaceIndex].targetPlaceID;
        const currentAllProductNodeQtyStyleGroup: any[] = this.currentAllProductNodeQtyStyleGroup[idx1][idx2];
        // const countryID = this.targetPlaces[targetPlaceIndex].targetPlace.countryID;
        // console.log(this.currentProductQtyAllCF);

        const factoryNodeProduction = currentAllProductNodeQtyStyleGroup.filter(i=>i.companyID == companyID &&
            i.productID == productID && i.style == style && i.targetPlaceID == targetPlaceID &&
            i.color == color && i.size == size && i.toNode == toNode);
        if (factoryNodeProduction.length>0) {
            return factoryNodeProduction[0].countQty;
        } else {
            return '';
        }

    }

    getFactoryNodeProductionQtyRowTotal(companyID: string, productID: string, style: string,
        color: string, size: string, toNode: string, idx1: number, idx2: number) {
        const currentAllProductNodeQtyStyleGroup: any[] = this.currentAllProductNodeQtyStyleGroup[idx1][idx2];
        const factoryNodeProduction = currentAllProductNodeQtyStyleGroup.filter(i=>i.companyID == companyID &&
            i.productID == productID && i.style == style &&
            i.color == color && i.size == size && i.toNode == toNode);
        // console.log(factoryNodeProduction);
        if (factoryNodeProduction.length>0) {
            const totalQtyRow = factoryNodeProduction.reduce((prev, cur) => {return prev + cur.countQty;}, 0);
            return totalQtyRow;
            // return 1;
        } else {
            return 0;
        }
    }


    getFactoryNodeProductionQtyColumnTotal(group: any, factory: Factory, targetPlaceIndex: number, idx1: number, idx2: number) {
        const targetPlaceID = this.mainZone[targetPlaceIndex].targetPlaceID;
        // const countryID = this.targetPlaces[targetPlaceIndex].targetPlace.countryID;
        const currentAllProductNodeQtyStyleGroup: any[] = this.currentAllProductNodeQtyStyleGroup[idx1][idx2];
        const factoryNodeProduction = currentAllProductNodeQtyStyleGroup.filter(i=>
            i.companyID == group.companyID  && i.toNode == group.toNode &&
            i.productID == group.productID && i.style == group.style && i.targetPlaceID == targetPlaceID );

        // console.log(currentAllProductNodeQtyStyleGroup);
        // console.log(group);
        if (factoryNodeProduction.length>0) {
            const totalQtyColumn = factoryNodeProduction.reduce((prev, cur) => {return prev + cur.countQty;}, 0);
            return totalQtyColumn;
        } else {
            return 0;
        }
        // return 0;
    }

    getFactoryNodeProductionQtyGrandTotal(group: any, factory: Factory, idx1: number, idx2: number) {
        const currentAllProductNodeQtyStyleGroup: any[] = this.currentAllProductNodeQtyStyleGroup[idx1][idx2];
        const factoryNodeProduction = currentAllProductNodeQtyStyleGroup.filter(i=>
            i.companyID == group.companyID && i.toNode == group.toNode &&
            i.productID == group.productID && i.style == group.style );
        if (factoryNodeProduction.length>0) {
            const totalQtyGrand = factoryNodeProduction.reduce((prev, cur) => {return prev + cur.countQty;}, 0);
            return totalQtyGrand;
        } else {
            return 0;
        }
    }

    checkColorShow(color: string, doEdit: boolean, rowIdex: number) {
        if (doEdit && rowIdex === 0) { this.lastColor = '';}
        // console.log(this.lastColor, color, doEdit);
        if (this.lastColor === color) {
            return false;
        } else {
            if (doEdit) {this.lastColor = color;}
            return true;
        }
    }

    setMenuPopup(toNode: string, style: string, zone: string, color: string, size: string) {
        // this.headMenuPopup = style;
        // this.items = [{
        //     label: this.headMenuPopup,
        //     items: [
        //         {
        //             label: 'show QR code',
        //             command: () => {
        //                 this.showSMDQRCode(toNode, style.trim(), zone, color, size);
        //             }
        //         },
        //         // {
        //         //     label: 'rewrite order qty',
        //         //     visible: this.checkMenuVisible('rewrite-order'),
        //         //     command: () => { this.rewriteOrderQTY(productColor, productSize, targetPlaceID); }
        //         // },
        //         // {label: 'Download', icon: 'pi pi-fw pi-download'}
        //     ]
        // }];
        this.showSMDQRCode(toNode, style.trim(), zone, color, size);
    }

    showSMDQRCode(toNode: string, style: string, zone: string, color: string, size: string) {
        const ref = this.dialogService.open(SmdProductbarcodenoComponent, {
            data: {
                id: 'showQRCodeList',
                mode: 'getQRListCFTNszcs', // ## mode = 'getQRListCFTNszcs'  CFTN = companyID factoryID (toNode) nodeID , szcs= style zone color size
                page: 1,
                limit: 20,
                companyID: this.company.companyID,
                factoryID: this.factory.factoryID,
                nodeID: toNode,  // ## toNode
                style: style,
                zone: zone,
                color: color,
                size: size,



            },
            header: 'QR code',
            width: '60%'
        });

        ref.onClose.subscribe((data: any) => {
            // console.log(data);

        });
    }

    ngOnDestroy(): void {
        if (this.selectFactorySub) { this.selectFactorySub.unsubscribe(); }
        if (this.repCurrentProductQtyAllCFNodeSub) { this.repCurrentProductQtyAllCFNodeSub.unsubscribe(); }
        if (this.dataAroundAppSub) { this.dataAroundAppSub.unsubscribe(); }

        // if (this.langSub) { this.langSub.unsubscribe(); }
    }
}
