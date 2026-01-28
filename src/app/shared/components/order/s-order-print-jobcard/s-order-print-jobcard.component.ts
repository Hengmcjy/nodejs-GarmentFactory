import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';

import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';

import { OrderService } from 'src/app/services/order.service';
import { UserService } from 'src/app/services/user.service';
import { ColorS, Company } from 'src/app/models/app.model';
import { GBC } from 'src/app/global/const-global';
import { Order, OrderBundleList, OrderProductionQueue, QueueInfoList, SubNodeFlow, SubNodeFlowCost } from 'src/app/models/order.model';
import { FlowSeq, NodeFlow, NodeStation, SubNodeflowC } from 'src/app/models/workstation.model';
import { NodeStationService } from 'src/app/services/node-station.service';

(pdfMake as any).vfs = pdfFonts.pdfMake.vfs;

@Component({
    selector: 'app-s-order-print-jobcard',
    templateUrl: './s-order-print-jobcard.component.html',
    styleUrls: ['./s-order-print-jobcard.component.scss'],
})
export class SOrderPrintJobcardComponent implements OnInit, OnDestroy {

    company: Company = GBC.clrCompany();
    order: Order = GBC.clrOrder();
    colors: ColorS[] = [];
    subNodeFlowCost: SubNodeFlowCost[] = [];

    subNodeFlowCost12: SubNodeFlowCost[] = [];
    subNodeFlowCost60: SubNodeFlowCost[] = [];
    subNodeFlowCost120: SubNodeFlowCost[] = [];
    subNodeFlowCostKG: SubNodeFlowCost[] = [];


    nodeFlow: NodeFlow = GBC.clrNodeFlow();
    subNodeflowC: SubNodeflowC[] = [];
    flowSeq: FlowSeq[] = [];
    nodeStations: NodeStation[] = [];


    startNo = 0;
    endNo = 0;
    jobCardType = '';  // ## jobCardType = type1= jobcard | jobcard / type2 = QRCode | jobcard

    orderProductionQueueGroup: any[] = [];
    orderProductionQueueGroupSum: any[] = [];
    orderProductionQueue: QueueInfoList[] = [];
    orderBundleList: OrderBundleList[] = [];

    orderProductionQueuePairing: any[] = [];
    countProductionQueueByBundleNo = 0;  // ## count bundles
    sumProductionQueueByBundleNo = 0;  // ## total qty
    content: any[] = [];

    jobCardRows = 15; // ## sub node job list in job card
    rowsTable: any[] = ['','','','','','','','','','','','','','',''];
    blankBody: any[] = [];

    bundleList: number[] = [];

    private productionQueueSub: Subscription = new Subscription();
    private nodeFlowSub: Subscription = new Subscription();

    constructor(
        // public config: DynamicDialogConfig,
        // public ref: DynamicDialogRef,
        // private exportAsService: ExportAsService,

        public userService: UserService,
        private orderService: OrderService,
        public nsService: NodeStationService,

    ) {}

    ngOnInit(): void {
        // ## gen object for looping  // ## sub node job list in job card
        this.jobCardRows = this.orderService.jobCardRows;
        this.rowsTable = [];
        for (let i = 0; i < this.jobCardRows; i++) {
            this.rowsTable.push('');
        }

        this.company = this.userService.getCompany();
        this.order = this.orderService.getOrder();
        this.colors = this.order.orderColor;
        this.subNodeFlowCost = this.order.productOR.subNodeFlowCost?this.order.productOR.subNodeFlowCost:[];
        // console.log(this.subNodeFlowCost);

        this.subNodeFlowCost12 = [...this.subNodeFlowCost.filter(i=>i.subNodeFlowTypeID === '12' || !i.subNodeFlowTypeID)];
        this.subNodeFlowCost60 = [...this.subNodeFlowCost.filter(i=>i.subNodeFlowTypeID === '60')];
        this.subNodeFlowCost120 = [...this.subNodeFlowCost.filter(i=>i.subNodeFlowTypeID === '120')];
        this.subNodeFlowCostKG = [...this.subNodeFlowCost.filter(i=>i.subNodeFlowTypeID === 'kg')];
        // console.log(this.subNodeFlowCost12);
        // console.log(this.subNodeFlowCost60);
        // console.log(this.subNodeFlowCost120);
        // console.log(this.subNodeFlowCostKG);


        this.subNodeFlowCost.sort((a,b)=>{
            return a.nodeID >b.nodeID?1:a.nodeID <b.nodeID?-1:0
                || +a.seq > +b.seq?1: +a.seq < +b.seq?-1:0
        });

        this.getNodeFlow();

        // console.log(this.colors);
        // console.log(this.subNodeFlowCost);

        // this.data = this.config.data;
        // this.customer = this.userService.emptyCustomer();
        // this.customer = this.custService.getCustomer();
        // console.log(this.customer);
        // this.getCustomerSelect();

        this.getTotalProductionQueueUpdatedListener();
    }

    getNodeFlow() {
        // getNodeFlow(companyID: string, factoryID: string, nodeFlowID: string)
        // getNodeFlowUpdatedListener()
        this.nodeFlow = GBC.clrNodeFlow();
        this.flowSeq = [];
        this.nodeStations = [];
        const nodeFlowID = 'main';
        this.nsService.getNodeFlow(this.company.companyID, this.userService.getFactory().factoryID, nodeFlowID);
        if (this.nodeFlowSub) { this.nodeFlowSub.unsubscribe(); }
        this.nodeFlowSub = this.nsService.getNodeFlowUpdatedListener().subscribe((data) => {
            // console.log(data);
            this.nodeFlow = data.nodeFlow;
            this.subNodeflowC = data.subNodeflowC;
            this.flowSeq = this.nodeFlow.flowSeq;
            this.nodeStations = data.nodeStations;
            // getNodeStationName(nodeStations: NodeStation[], nodeID: string)
            // console.log(this.nodeFlow);
            // console.log(this.subNodeFlow);
            // console.log(this.flowSeq);
            // console.log(this.nodeStations);
        });
    }

    getProductionQueueCount() {
        this.orderProductionQueue = [];
        // getProductionQueueCount(companyID: string, orderID: string, startNo: number, endNo: number)
        this.orderService.getProductionQueueCount(
            this.company.companyID, this.order.orderID, this.startNo, this.endNo
        );
    }

    // ## jobCardType = type1= jobcard | jobcard / type2 = QRCode | jobcard
    getProductionQueueList(jobCardType: string) {
        this.jobCardType = jobCardType;
        this.orderProductionQueue = [];
        // getProductionQueueCount(companyID: string, orderID: string, startNo: number, endNo: number)
        this.orderService.getProductionQueueList(
            this.company.companyID, this.order.orderID, this.startNo, this.endNo
        );
    }

    getTotalProductionQueueUpdatedListener() {
        if (this.productionQueueSub) { this.productionQueueSub.unsubscribe(); }
        this.productionQueueSub = this.orderService.getTotalProductionQueueUpdatedListener().subscribe((data) => {
            // console.log(data);
            this.orderProductionQueue = data.orderProductionQueue;
            this.countProductionQueueByBundleNo = data.totalProductionQueueByBundleNo.countProductionQueueByBundleNo;  // ## count bundles
            this.sumProductionQueueByBundleNo = data.totalProductionQueueByBundleNo.sumProductionQueueByBundleNo;  // ## total qty

            this.orderBundleList = data.orderBundleList;
            if (this.orderBundleList.length > 0) {

                this.bundleList = Array.from(new Set(this.orderBundleList.map((item: any) => item.bundleNo))).sort();
                // console.log(this.bundleList);

                // ## get sizeSeq
                this.orderBundleList.forEach( (item, index) => {
                    item.targetPlace = this.userService.strReplaceAll(item.targetPlace, '-', '');

                    item.color = this.userService.strReplaceAll(item.color, '-', '');
                    item.colorSeq = this.userService.getColorSeq1(this.colors, this.userService.strReplaceAll(item.color, '-', ''));

                    item.size = this.userService.strReplaceAll(item.size, '-', '');
                    item.sizeSeq = this.userService.getSizeSeq(this.userService.strReplaceAll(item.size, '-', ''));
                });

                // ## sort
                this.orderBundleList.sort((a,b)=>{
                    return a.colorSeq >b.colorSeq?1:a.colorSeq <b.colorSeq?-1:0
                    || a.sizeSeq >b.sizeSeq?1:a.sizeSeq <b.sizeSeq?-1:0
                    || a.bundleNo >b.bundleNo?1:a.bundleNo <b.bundleNo?-1:0
                    // || +a.seq > +b.seq?1: +a.seq < +b.seq?-1:0
                });
                // console.log(this.orderBundleList);
            }

            // console.log(data);
            // console.log(this.orderProductionQueue);
            // console.log(this.orderProductionQueue);
            // console.log(this.orderBundleList);

            if (this.orderProductionQueue.length > 0) {
                // ## get sizeSeq
                this.orderProductionQueue.forEach( (item, index) => {
                    item.color = this.userService.strReplaceAll(this.userService.getInfoFromProductBarcode(item.productBarcode, 'color'), '-', '');
                    item.colorSeq = this.userService.getColorSeq1(this.colors, this.userService.strReplaceAll(this.userService.getInfoFromProductBarcode(item.productBarcode, 'color'), '-', ''));

                    item.size = this.userService.strReplaceAll(this.userService.getInfoFromProductBarcode(item.productBarcode, 'size'), '-', '');
                    item.sizeSeq = this.userService.getSizeSeq(this.userService.strReplaceAll(this.userService.getInfoFromProductBarcode(item.productBarcode, 'size'), '-', ''));
                });

                // ## sort
                this.orderProductionQueue.sort((a,b)=>{
                    return a.colorSeq >b.colorSeq?1:a.colorSeq <b.colorSeq?-1:0
                    || a.sizeSeq >b.sizeSeq?1:a.sizeSeq <b.sizeSeq?-1:0
                    || a.bundleNo >b.bundleNo?1:a.bundleNo <b.bundleNo?-1:0
                    // || +a.seq > +b.seq?1: +a.seq < +b.seq?-1:0
                });
                // console.log(this.orderProductionQueue);

                this.prepareDataPDF();
            }
        });
    }

    async prepareDataPDF() {

        // ## jobCardType = type1= jobcard | jobcard
        if (this.jobCardType === 'type1') {
            // ## transform array to pairing bundleNo
            await this.pdfPairingBundleNo();
            // console.log(this.orderProductionQueuePairing);

            // ## create content body
            this.content = [];
            await this.createContent();
            // console.log(this.content);

        // ## type2 = QRCode | jobcard
        } else if (this.jobCardType === 'type2') {
            await this.pdfPairingBundleNo2();

            this.content = [];
            await this.createContent2();

        // ## bundle running no
        } else if (this.jobCardType === 'bundle-runningno') {

            await this.pdfBundleRunningNoPrepareData1();

            // console.log('next');
            this.content = [];
            await this.createContentBundleRunningNo1();


        } else if (this.jobCardType === '60bundles') {
            console.log('60bundles');

        } else if (this.jobCardType === '120bundles') {
            console.log('120bundles');
        } else if (this.jobCardType === 'kg') {
            console.log('kg');
        }
    }

    // #########################################################################################################################
    // ## print bundle running No  ####################################################################################

    async pdfBundleRunningNoPrepareData1() {

        this.orderProductionQueueGroup = [];
        this.orderProductionQueueGroupSum = [];

        this.orderProductionQueueGroup = this.userService.groupBy(this.orderProductionQueue, (c: any) => c.color);
        // console.log(this.currentCompanyOrderStyleGroup);

        this.orderProductionQueueGroup = Object.values(this.orderProductionQueueGroup);
        // console.log(this.orderProductionQueueGroup);

        // ## gen data for color sum --> size
        let sizes: string[] = [];

        this.orderProductionQueueGroup.forEach( (itemG, index) => {
            let sizes1: string[] = Array.from(new Set(itemG.map((item: any) => item.size)));
            // console.log(sizes1);
            sizes1.forEach( (itemS, indexS) => {
                const idx = sizes.findIndex( fi =>(fi === itemS));
                if (idx < 0) {
                    sizes.push(itemS);
                }
            });
        });
        // console.log(sizes);

        // let sizesObj: any[] = [];
        // sizes.forEach( (item, index) => {
        //     sizesObj.push({
        //         color: '',
        //         sizeSeq: this.userService.getSizeSeq(item),
        //         size: item,
        //         qty: 0,
        //         forloss: 0
        //     });
        // });
        // sizesObj.sort((a,b)=>{
        //     return a.sizeSeq >b.sizeSeq?1:a.sizeSeq <b.sizeSeq?-1:0
        // });
        // console.log(sizesObj);

        this.orderProductionQueueGroup.forEach( (itemG, index) => {
            // console.log(itemG.color, itemG.size);
            itemG.forEach( (itemL: any, indexL: number) => {
                const idx = this.orderProductionQueueGroupSum.findIndex( fi =>(fi.color === itemL.color && fi.size === itemL.size));
                if (idx < 0) {
                    this.orderProductionQueueGroupSum.push({
                        color: itemL.color,
                        sizeSeq: itemL.sizeSeq,
                        size: itemL.size,
                        qty: itemL.productCount,
                        forloss: itemL.forLossQty !== 0? itemL.productCount: 0,
                        // forloss: itemL.forLossQty,
                    });
                } else {
                    if (+itemL.forLossQty === 0) {
                        this.orderProductionQueueGroupSum[idx].qty = +this.orderProductionQueueGroupSum[idx].qty + +itemL.productCount;
                    } else {
                        this.orderProductionQueueGroupSum[idx].forloss = +this.orderProductionQueueGroupSum[idx].forloss + +itemL.productCount;
                    }
                }
            });
        });
        // console.log(this.orderProductionQueueGroupSum);
    }

    async createContentBundleRunningNo1() {
        // let content: any[] = [];
        const rpp = 30; // ## rows per page
        let contentArr: any[] = [];
        const pageBrake: any[] = [{text: '', pageBreak: 'before', style: ['']}];

        this.orderProductionQueueGroup.forEach(async (item: any[], index) => {

            // console.log('index = ', index);
            // const data1 = await this.userService.getDataFromBarcode(item[0].productBarcode);
            const data  = await this.userService.getDataFromBarcode(item[0].productBarcode);
            const zone = this.userService.getTargetPlaceName(data.zone);
            const sumQty = await item.reduce((prev, cur) => {return prev + cur.productCount;}, 0);
            await this.genContentBundleRunningNo1(item, rpp, sumQty, zone);
            // this.content = [...this.content, ...contentArr];
            if (this.orderProductionQueueGroup.length - 1 === index) {
                // await this.testBody();
                this.content.pop(); // ## delete last element -> break page
                // console.log(this.content);
                // ## when prepared then view pdf
                this.generatePDF();
            } else {
                // console.log(index);
                // this.content = [...this.content, ...pageBrake];
            }
        });
        // console.log(content);
    }

    async genContentBundleRunningNo1(item: any[], rpp: number, sumQty: number, zone: string) {
        let contentArr: any[] = [];
        // ############################################################################################
        // ###########      ###################################################

        // rpp = 20
        // 1	20
        // 21	40
        // 41	60

        const pages =  Math.ceil(item.length / rpp);  // ##  totalRows / rpp
        const numeratorRows =  item.length - (Math.floor(item.length / rpp) * rpp); // ##  แถว เศษ
        let PagesObj: any[] = [];
        for (let i = 0; i < pages; i++) {
            PagesObj.push({
                page: i,
                pageTxt: i+1 +'/'+pages,
                row: {
                    rowStart: (i * rpp) + 1,
                    rowEnd: (i * rpp) + rpp
                },
                lastPage: i+1 === pages
            });
        }

        PagesObj.forEach(async (pageData: any, index3) => {
            const content1 = await this.genContentBundleRunningNo1Page(item, rpp, sumQty, zone, pageData);
            // console.log(content1);
            this.content = [...this.content, ...content1];
        });
    }

    async genContentBundleRunningNo1Page(item: any[], rpp: number, sumQty: number, zone: string, pageData: any): Promise<any[]> {
        let contentArr: any[] = [];
        const bgHead = '#dddddd';
        // console.log(this.orderProductionQueueGroupSum);
        // console.log(item);

        function getYarnsData() {

            let yarnData: string[] = [];
            item[0].yarnLot.forEach(async (item2: any, index2: number) => {
                yarnData.push(item2.yarnLotID);
            });
            // return yarnData.toString();
            return yarnData.join(", ");
        }

        function getRowsData() {
            const dataRows = pageData.row;
            let rowData: any[] = [];
            for (let i = +dataRows.rowStart; i <= +dataRows.rowEnd ; i++) {
                // console.log(' i = ', i);
                if (item[i - 1]) {
                    rowData.push(
                        [
                            {text: item[i - 1].bundleNo, style: ['aligncenter', 'list25']},
                            {text: item[i - 1].forLossQty>0?'forLoss':'', style: ['aligncenter', 'list3']},
                            {text: item[i - 1].size, style: ['aligncenter', 'list25']},
                            {text: item[i - 1].productCount + '', style: ['alignleft', 'list3']},
                            // {text: item[i - 1].productCount !== 12?item[i - 1].productCount+'':'', style: ['alignleft', 'list3']},
                            '',
                            '',
                            '',
                            '',
                            '',
                            '',
                            '',
                            '',
                            ''
                        ]
                    );
                }
            }
            return rowData;
        }

        function getSumRowsData(orderProductionQueueGroupSum: any[]) {
            // console.log(this.orderProductionQueueGroupSum);
            // const targetPlace = this.targetPlaces.filter(i=>(i.targetPlace.targetPlaceID === targetPlaceID));
            let sumRowsData = orderProductionQueueGroupSum.filter(i=>(i.color === item[0].color));
            sumRowsData.sort((a,b)=>{ return a.sizeSeq >b.sizeSeq?1:a.sizeSeq <b.sizeSeq?-1:0 });
            let bodyX: any[] = [];
            sumRowsData.forEach(async (item5: any, index5: number) => {
                bodyX.push(
                    [
                        {text: item5.size, style: ['aligncenter', 'listbold1']},
                        {text: item5.qty, style: ['aligncenter', 'listbold1']},
                        {text: item5.forloss, style: ['aligncenter', 'listbold1']},
                    ]
                );
            });
            const contentSumRowsData = {
                style: 'tableExample',
                table: {
                    heights: 8,
                    widths: ['15%', '15%', '15%'],
                    headerRows: 2,
                    body: [
                        [
                            {text: '', border: [false, false, false, false]},
                            {text: '', border: [false, false, false, false]},
                            {text: '', border: [false, false, false, false]},
                        ],
                        [
                            {text: 'Size', fillColor: bgHead,style: ['aligncenter', 'listbold1']},
                            {text: 'Qty', fillColor: bgHead,style: ['aligncenter', 'listbold1']},
                            {text: 'forLoss', fillColor: bgHead,style: ['aligncenter', 'listbold1']},
                        ],
                        ...bodyX
                    ]
                }
            };
            return contentSumRowsData;
        }

        let contentSumRowsData: any = {};
        contentSumRowsData = getSumRowsData(this.orderProductionQueueGroupSum);

        const content1 =
        {
            margin: [15, 0, 15, 0],
            style: 'tableExample',
            table: {
                heights: 8,
                widths: ['20%', '25%', '25%', '25%', '5%'],
                body: [

                    // [{text: '', pageBreak: 'before'},[{}],[{}],[{}],[{}]],
                    [

                        [
                            { text: 'DATA Form', style: ['alignleft', 'listbold1'] },
                            { text: 'Style : ' + item[0].orderID, style: ['alignleft', 'listbold1'] },
                        ],
                        [
                            { text: 'COLOR : '+ this.userService.getCodeColorNameByColorCode(item[0].color, this.order.orderColor[0].setName), style: ['alignleft', 'listbold1'] },
                            { text: '        '+ this.userService.getColorNameByColorCode(item[0].color, this.order.orderColor[0].setName), style: ['alignleft', 'listbold1'] },
                        ],
                        [
                            { text: ' ', style: ['alignleft'] },
                            { text: 'Batch No : '+ getYarnsData(), style: ['alignleft', 'listbold1'] },
                        ],
                        [
                            { text: 'Zone : ' + zone, style: ['alignright', 'listbold1'] },
                            { text: 'Order : ' + sumQty + ' Pcs', style: ['alignright', 'listbold1'] },
                        ],
                        []
                    ],
                ]
            },
            layout: 'noBorders'
        };

        // ## header table + body rows
        const rowBody = getRowsData();
        let content2 =
        {
            style: 'tableExample',
            table: {
                heights: 10,
                widths: [
                    '15%', '7%', '6%', '6%', '6%', '9%', // 49
                    '7%','6%','11%','7%','6%','7%','7%'  // 51
                ],
                headerRows: 2,
                body: [
                    [
                        {text: 'Bundle (Running)', fillColor: bgHead, style: ['aligncenter', 'listbold1'], rowSpan: 2, alignment: 'center'},
                        {text: 'Bundle NO', fillColor: bgHead, style: ['aligncenter', 'listbold1'], rowSpan: 2, alignment: 'center'},
                        {text: 'Size', fillColor: bgHead, style: ['aligncenter', 'listbold1'], rowSpan: 2, alignment: 'center'},
                        {text: 'Qty', fillColor: bgHead, style: ['aligncenter', 'listbold1'], rowSpan: 2, alignment: 'center'},
                        {text: 'Staff', fillColor: bgHead, style: ['aligncenter', 'listbold1'], colSpan: 2, alignment: 'center'},
                        {},
                        {text: 'Knitting Start', fillColor: bgHead, style: ['aligncenter', 'listbold1'], colSpan: 2, alignment: 'center'},
                        {},
                        {text: 'Yarn Received (Kgs)', fillColor: bgHead, style: ['aligncenter', 'listbold1'], rowSpan: 2, alignment: 'center'},
                        {text: 'Knitting Finish', fillColor: bgHead, style: ['aligncenter', 'listbold1'], colSpan: 2, alignment: 'center'},
                        {},
                        {text: 'Consumption (Kgs)', fillColor: bgHead, style: ['aligncenter', 'listbold1'], rowSpan: 2, alignment: 'center'},
                        {text: 'Balance Yarn (Kgs)', fillColor: bgHead, style: ['aligncenter', 'listbold1'], rowSpan: 2, alignment: 'center'},
                    ],
					[
                        '',
                        '',
                        '',
                        '',
                        {text: 'NO', fillColor: bgHead, style: ['aligncenter', 'listbold1'], alignment: 'center'},
                        {text: 'Name', fillColor: bgHead, style: ['aligncenter', 'listbold1'], alignment: 'center'},
                        {text: 'Date', fillColor: bgHead, style: ['aligncenter', 'listbold1'], alignment: 'center'},
                        {text: 'Time', fillColor: bgHead, style: ['aligncenter', 'listbold1'], alignment: 'center'},
                        '',
                        {text: 'Date', fillColor: bgHead, style: ['aligncenter', 'listbold1'], alignment: 'center'},
                        {text: 'Time', fillColor: bgHead, style: ['aligncenter', 'listbold1'], alignment: 'center'},
                        '',
                        '',
                    ],

                    ...rowBody,
                    // [{text: '', pageBreak: 'after'},'','','','','','','','','','','',''],
                ]
            },
        };
        // const content3 = {};
        const pageBrake: any[] = [{text: '', pageBreak: 'after', style: ['']}];
        if (pageData.lastPage) {
            contentArr = [content1, content2, contentSumRowsData, pageBrake];
        } else {

            contentArr = [content1, content2, pageBrake];
        }
        return contentArr;
    }


    // ############################################################################################################

    genQRHead(orderProductionQueue: any) {
        // console.log(orderProductionQueue);
        // return {a: "123", b: "123"};
        // const data = this.userService.getDataFromBarcode(orderProductionQueue.productBarcode);
        const qrHead = {
            qrID: 'orderProductionQueueCard',
            // companyID: orderProductionQueue.companyID,
            orderID: orderProductionQueue.orderID,
            bundleNo: orderProductionQueue.bundleNo,
            productBarcode: orderProductionQueue.productBarcode,
            productCount: orderProductionQueue.productCount,
            numberFrom: orderProductionQueue.numberFrom,
            numberTo: orderProductionQueue.numberTo,
            // style: data.style,
            // zone: data.zone,
            // year: data.year,
            // color1: data.color1,
            // colorName1: this.getColorNameByColorCode(data.color1, this.order.orderColor[0].setName),
            // size: data.size,
        };
        return JSON.stringify(qrHead);
    }

    genQRSubNodeFlowCost(subNodeFlowCost: any, itemLR: any, dataLR: any) {
        const qrSubNodeFlowCost = {
            // qrID: 'subNodeFlowCostCard',
            // companyID: this.company.companyID,
            id: 201,
            a: this.order.orderID,
            // nodeID: subNodeFlowCost.nodeID,
            b: subNodeFlowCost.subNodeID,
            c: itemLR.bundleNo,
            // d: itemLR.productBarcode,
            // productCount: itemLR.productCount,

            // numberFrom: itemLR.numberFrom,
            // numberTo: itemLR.numberTo,
            // style: data.style,
            // zone: data.zone,
            // year: data.year,
            // color1: data.color1,
            // colorName1: this.getColorNameByColorCode(data.color1, this.order.orderColor[0].setName),
            // size: data.size,
        };
        return JSON.stringify(qrSubNodeFlowCost);
    }

    async getYarnLotText(yarnLot: any[]): Promise<any[]> {
        let yarnLot1: any[] = [];
        yarnLot1.push({ text: 'Yarn lot : ', style: ['alignleft', 'list2'] });
        if (yarnLot) {
            yarnLot.forEach( (item, index) => {
                yarnLot1.push({ text: item.yarnLotID, style: ['alignleft', 'list2'] });
            });
        }
        // console.log(yarnLot1);
        return yarnLot1;
    }

    async getbody(items: number, itemL: any, itemR: any, dataL: any, dataR: any, subNodeFlowCost: SubNodeFlowCost, idxN: number): Promise<any[]> { // : Promise<any[]>
        let bodyPDF: any[] = [];
        // console.log(items);
        // let bodyPDF2: any[] = [];
        // const qrBlank = '';
        // const qrBlank = JSON.stringify({ID: '0' , data: '0'});

        // this.blankBody = [...blankBody];
        // const blankBody2 = [...blankBody];

        this.rowsTable.forEach(async(item, index) => {
            if (index <= this.subNodeFlowCost12.length - 1) {
                bodyPDF.unshift(await this.getbody1(this.subNodeFlowCost12[index], itemL, itemR, dataL, dataR, false));
            } else {
                // console.log(index);
                // bodyPDF.unshift([...blankBody]);
                bodyPDF.unshift(await this.getbody1(this.subNodeFlowCost12[0], itemL, itemR, dataL, dataR, true));
            }
        });

        // // let bodyPDF2: any[] = [];
        // this.subNodeFlowCost12.forEach(async(item, index) => {
        //     // console.log(index);
        //     bodyPDF.unshift(await this.getbody1(item, itemL, itemR, dataL, dataR));

        //     if ( (this.subNodeFlowCost12.length - 1) === index) {
        //         for (let i = this.subNodeFlowCost12.length; i < items ; i++) {
        //             // console.log(i);
        //             bodyPDF.unshift(blankBody);  // unshift   push
        //         }
        //         // console.log(bodyPDF);
        //         // return bodyPDF2;
        //     } else {
        //         // return bodyPDF2;
        //     }

        // });

        // console.log(bodyPDF);

        // bodyPDF2 = await this.genBlankRow(items, bodyPDF, blankBody);
        // console.log(bodyPDF2);


        // bodyPDF[0] = blankBody;
        // bodyPDF[1] = blankBody;
        // bodyPDF[2] = blankBody;
        // bodyPDF[3] = blankBody;

        // bodyPDF = await this.genBlankRow(items, bodyPDF, blankBody);
        // const data = {bodyPDF, blankBody};

        // bodyPDF= await this.genBlankRow(bodyPDF);

        // console.log('bodyPDF' , bodyPDF.length);
        return bodyPDF;
    }

    async getbody1(subNodeFlowCost: any, itemL: any, itemR: any, dataL: any, dataR: any, isBlankRow: boolean) {
        // console.log(itemL, itemR, dataL, dataR);  strFirstAndDot(str: string, len: number)
        const  qrcode = {a: "123", b: "123"};
        const jsonQR = JSON.stringify(qrcode);

        const subNode1 = subNodeFlowCost.subNodeID + ': '
        + this.userService.strFirst(this.userService.getSubNodeFlowName(subNodeFlowCost.nodeID, subNodeFlowCost.subNodeID, this.subNodeflowC), 10);

        const color1 = this.userService.getCodeColorNameByColorCode(dataL.color1, this.order.orderColor[0].setName)
                    + ' '
                    + this.userService.strFirst(this.userService.getColorNameByColorCode(dataL.color1, this.order.orderColor[0].setName), 7);


        const body1 = [
            [
                { qr: this.genQRSubNodeFlowCost(subNodeFlowCost, itemL, dataL), fit: '30' },
            ],
            [
                {
                    text: [
                        {text: this.order.orderID, style: ['list2']},
                        ' ',
                        {text: dataL.zone, style: ['list3']},
                        ' ',
                        {text: dataL.size, style: ['list3']},
                        ' ',
                        {text: itemL.bundleNo, style: ['list3']},
                        // ' ',
                        // {text: itemL.productCount, style: ['list4']},
                    ],
                    style: ['list3']
                },
                // {
                //     text: [
                //         {text: subNodeFlowCost.subNodeID, style: ['list3']},
                //         ' : ',
                //         {
                //             text:  this.userService.getSubNodeFlowName(subNodeFlowCost.nodeID, subNodeFlowCost.subNodeID, this.subNodeflowC),
                //             style: ['list3']
                //         },
                //     ],
                //     style: ['list3']
                // },
                // {
                //     text:  this.userService.getCodeColorNameByColorCode(dataL.color1, this.order.orderColor[0].setName)
                //             + ' '
                //             + this.userService.getColorNameByColorCode(dataL.color1, this.order.orderColor[0].setName),
                //     style: ['list3']
                // },
                {
                    text: [
                        {text: subNode1, style: ['list2']},
                        ' , ',
                        {text: color1, style: ['list3']},

                    ],
                    style: ['list25']
                },
            ],
            [
                {text: itemL.productCount, style: ['list1']},
            ],
            [
                { qr: this.genQRSubNodeFlowCost(subNodeFlowCost, itemL, dataL), fit: '30' },
            ],

            [
                {
                    text: [
                        {text: this.order.orderID, style: ['list2']},
                        ' ',
                        {text: dataL.zone, style: ['list3']},
                        ' ',
                        {text: dataL.size, style: ['list3']},
                        ' ',
                        {text: itemL.bundleNo, style: ['list3']},
                        // ' ',
                        // {text: itemL.productCount, style: ['list4']},
                    ],
                    style: ['list3']
                },
                // {
                //     text: [
                //         {text: subNodeFlowCost.subNodeID, style: ['list3']},
                //         ' : ',
                //         {
                //             text: this.userService.getSubNodeFlowName(subNodeFlowCost.nodeID, subNodeFlowCost.subNodeID, this.subNodeflowC),
                //             style: ['list3']
                //         },
                //     ],
                //     style: ['list3']
                // },
                // {
                //     text: this.userService.getCodeColorNameByColorCode(dataL.color1, this.order.orderColor[0].setName)
                //             + ' '
                //             + this.userService.getColorNameByColorCode(dataL.color1, this.order.orderColor[0].setName),
                //     style: ['list3']
                // },
                {
                    text: [
                        {text: subNode1, style: ['list2']},
                        ' , ',
                        {text: color1, style: ['list3']},

                    ],
                    style: ['list25']
                },
            ],
            [
                {text: itemL.productCount, style: ['list1']},
            ],

            { text: '', border: [true, false, true, false] },  // ## center blank zone
            { text: '', border: [true, false, true, false] }, // ## center blank zone

            [
                { qr: this.genQRSubNodeFlowCost(subNodeFlowCost, itemR, dataR), fit: '30' },
            ],
            // [
            //     { text: 'This list1', style: ['list3'] },
            //     { text: 'This list2', style: ['list3'] },
            //     { text: itemR.bundleNo, style: ['list3'] },
            // ],
            [
                {
                    text: [
                        {text: this.order.orderID, style: ['list2']},
                        ' ',
                        {text: dataR.zone, style: ['list3']},
                        ' ',
                        {text: dataR.size, style: ['list3']},
                        ' ',
                        {text: itemR.bundleNo, style: ['list3']},
                        // ' ',
                        // {text: itemR.productCount, style: ['list4']},
                    ],
                    style: ['list3']
                },
                // {
                //     text: [
                //         {text: subNodeFlowCost.subNodeID, style: ['list3']},
                //         ' : ',
                //         {
                //             text: this.userService.getSubNodeFlowName(subNodeFlowCost.nodeID, subNodeFlowCost.subNodeID, this.subNodeflowC),
                //             style: ['list3']
                //         },
                //     ],
                //     style: ['list3']
                // },
                // {
                //     text: this.userService.getCodeColorNameByColorCode(dataR.color1, this.order.orderColor[0].setName)
                //             + ' '
                //             + this.userService.getColorNameByColorCode(dataR.color1, this.order.orderColor[0].setName),
                //     style: ['list3']
                // },
                {
                    text: [
                        {text: subNode1, style: ['list2']},
                        ' , ',
                        {text: color1, style: ['list3']},

                    ],
                    style: ['list25']
                },
            ],
            [
                {text: itemR.productCount, style: ['list1']},
            ],
            [
                { qr: this.genQRSubNodeFlowCost(subNodeFlowCost, itemR, dataR), fit: '30' },
            ],
            // [
            //     { text: 'This list1', style: ['list3'] },
            //     { text: 'This list2', style: ['list3'] },
            //     { text: itemR.bundleNo, style: ['list3'] },
            // ],
            [
                {
                    text: [
                        {text: this.order.orderID, style: ['list2']},
                        ' ',
                        {text: dataR.zone, style: ['list3']},
                        ' ',
                        {text: dataR.size, style: ['list3']},
                        ' ',
                        {text: itemR.bundleNo, style: ['list3']},
                        // ' ',
                        // {text: itemR.productCount, style: ['list4']},
                    ],
                    style: ['list3']
                },
                // {
                //     text: [
                //         {text: subNodeFlowCost.subNodeID, style: ['list3']},
                //         ' : ',
                //         {
                //             text: this.userService.getSubNodeFlowName(subNodeFlowCost.nodeID, subNodeFlowCost.subNodeID, this.subNodeflowC),
                //             style: ['list3']
                //         },
                //     ],
                //     style: ['list3']
                // },
                // {
                //     text: this.userService.getCodeColorNameByColorCode(dataR.color1, this.order.orderColor[0].setName)
                //             + ' '
                //             + this.userService.getColorNameByColorCode(dataR.color1, this.order.orderColor[0].setName),
                //     style: ['list3']
                // },
                {
                    text: [
                        {text: subNode1, style: ['list2']},
                        ' , ',
                        {text: color1, style: ['list3']},

                    ],
                    style: ['list25']
                },
            ],
            [
                {text: itemR.productCount, style: ['list1']},
            ],
            // {text: '', pageBreak: 'after', style: ['']}
            // { text: ''},
            // { text: '', pageBreak : items===round?pageBreak:'' },
            // items===round?{ text: '', pageBreak : pageBreak }:{ text: ''}

        ];

        const blankBody = [

            // '','','','','','',
            // { text: '', border: [true, false, true, false] },  // ## center blank zone
            // { text: '', border: [true, false, true, false] }, // ## center blank zone
            // '','','','','','',

            [],
                [
                    {
                        text: [
                            {text: this.order.orderID, style: ['list3']},
                            ' ',
                            {text: dataL.zone, style: ['list3']},
                            ' ',
                            {text: dataL.size, style: ['list3']},
                            ' ',
                            {text: itemL.bundleNo, style: ['list4']},
                            ' ',
                            {text: itemL.productCount, style: ['list4']},
                        ],
                        style: ['list3']
                    },
                    {
                        text: [
                            {text: '.', style: ['list3']},
                            {
                                text: '',
                                style: ['list3']
                            },
                        ],
                        style: ['list3']
                    },
                    {
                        text: this.userService.getCodeColorNameByColorCode(dataL.color1, this.order.orderColor[0].setName)
                                + ' '
                                + this.userService.getColorNameByColorCode(dataL.color1, this.order.orderColor[0].setName),
                        style: ['list3']
                    },
                ],
                [
                    {text: itemL.productCount, style: ['list1']},
                ],
                [],
                [
                    {
                        text: [
                            {text: this.order.orderID, style: ['list3']},
                            ' ',
                            {text: dataL.zone, style: ['list3']},
                            ' ',
                            {text: dataL.size, style: ['list3']},
                            ' ',
                            {text: itemL.bundleNo, style: ['list4']},
                            ' ',
                            {text: itemL.productCount, style: ['list4']},
                        ],
                        style: ['list3']
                    },
                    {
                        text: [
                            {text: '.', style: ['list3']},
                            {
                                text: '',
                                style: ['list3']
                            },
                        ],
                        style: ['list3']
                    },
                    {
                        text: this.userService.getCodeColorNameByColorCode(dataL.color1, this.order.orderColor[0].setName)
                                + ' '
                                + this.userService.getColorNameByColorCode(dataL.color1, this.order.orderColor[0].setName),
                        style: ['list3']
                    },
                ],
                [
                    {text: itemL.productCount, style: ['list1']},
                ],

                { text: '', border: [true, false, true, false] },  // ## center blank zone
                { text: '', border: [true, false, true, false] }, // ## center blank zone

                [],
                [
                    {
                        text: [
                            {text: this.order.orderID, style: ['list3']},
                            ' ',
                            {text: dataR.zone, style: ['list3']},
                            ' ',
                            {text: dataR.size, style: ['list3']},
                            ' ',
                            {text: itemR.bundleNo, style: ['list4']},
                            ' ',
                            {text: itemR.productCount, style: ['list4']},
                        ],
                        style: ['list3']
                    },
                    {
                        text: [
                            {text: '.', style: ['list3']},
                            {
                                text: '',
                                style: ['list3']
                            },
                        ],
                        style: ['list3']
                    },
                    {
                        text: this.userService.getCodeColorNameByColorCode(dataR.color1, this.order.orderColor[0].setName)
                                + ' '
                                + this.userService.getColorNameByColorCode(dataR.color1, this.order.orderColor[0].setName),
                        style: ['list3']
                    },
                ],
                [
                    {text: itemR.productCount, style: ['list1']},
                ],
                [],
                [
                    {
                        text: [
                            {text: this.order.orderID, style: ['list3']},
                            ' ',
                            {text: dataR.zone, style: ['list3']},
                            ' ',
                            {text: dataR.size, style: ['list3']},
                            ' ',
                            {text: itemR.bundleNo, style: ['list4']},
                            ' ',
                            {text: itemR.productCount, style: ['list4']},
                        ],
                        style: ['list3']
                    },
                    {
                        text: [
                            {text: '.', style: ['list3']},
                            {
                                text: '',
                                style: ['list3']
                            },
                        ],
                        style: ['list3']
                    },
                    {
                        text: this.userService.getCodeColorNameByColorCode(dataR.color1, this.order.orderColor[0].setName)
                                + ' '
                                + this.userService.getColorNameByColorCode(dataR.color1, this.order.orderColor[0].setName),
                        style: ['list3']
                    },
                ],
                [
                    {text: itemR.productCount, style: ['list1']},
                ],
        ];
        // console.log(body1);
        if (!isBlankRow) {
            return body1;
        } else {
            return blankBody;
        }
    }

    async genContentPairing(item: any[], idxN: number): Promise<any[]> { // : Promise<any[]>
        let contentArr: any[] = [];
        const data1 = await this.userService.getDataFromBarcode(item[0].productBarcode);
        const data2 = await this.userService.getDataFromBarcode(item[1].productBarcode);
        // console.log(item[1]);
        const dashed = [7]; // ## need dash line for half of paper colunm 7

        // ############################################################################################
        // ###########  one page   =    1 paring    ###################################################
        const content1 =
        {
            margin: [15, 0, 15, 0],
            style: 'tableExample',
            table: {
                //   49 - 2 - 49
                widths: ['5%', '2%', '15%', '15%', '12%', '1%', '1%','5%', '2%', '15%', '15%', '12%'],
                body: [
                    [
                        [{ qr: this.genQRHead(item[0]), fit: '50' }],
                        '',
                        await this.getYarnLotText(item[0].yarnLot),
                        [
                            { text: this.order.orderID, style: ['alignleft', 'txtbold'] },
                            { text: 'ZONE : '+ this.userService.getInfoFromProductBarcode(item[0].productBarcode, 'targetPlaceID'), style: ['alignleft', 'list2'] },
                            { text: 'COLOR : '+ this.userService.getCodeColorNameByColorCode(data1.color1, this.order.orderColor[0].setName), style: ['alignleft', 'list2'] },
                            { text: '        '+ this.userService.getColorNameByColorCode(data1.color1, this.order.orderColor[0].setName), style: ['alignleft', 'list3'] },
                        ],
                        [
                            { text: data1.size, style: ['headsize', 'alignright'] },
                            { text: 'QTY : ' + item[0].productCount , style: ['alignright'] },
                            { text: 'Bundle No : ' + item[0].bundleNo, style: ['alignright', 'list2'] },
                        ],

                        { text: '', border: [true, false, true, false] },  // ## center blank zone
                        { text: '', border: [true, false, true, false] }, // ## center blank zone

                        [{ qr: this.genQRHead(item[1]), fit: '50' }],
                        '',
                        await this.getYarnLotText(item[1].yarnLot),
                        [
                            { text: this.order.orderID, style: ['alignleft', 'txtbold'] },
                            { text: 'ZONE : '+ this.userService.getInfoFromProductBarcode(item[1].productBarcode, 'targetPlaceID'), style: ['alignleft', 'list2'] },
                            { text: 'COLOR : '+ this.userService.getCodeColorNameByColorCode(data2.color1, this.order.orderColor[0].setName), style: ['alignleft', 'list2'] },
                            { text: '        '+ this.userService.getColorNameByColorCode(data2.color1, this.order.orderColor[0].setName), style: ['alignleft', 'list3'] },
                        ],
                        [
                            { text: data2.size, style: ['headsize', 'alignright'] },
                            { text: 'QTY : ' + item[1].productCount , style: ['alignright'] },
                            { text: 'Bundle No : ' + item[1].bundleNo, style: ['alignright', 'list2'] },
                        ],
                    ],
                ]
            },
            layout: 'noBorders'
        };

        const content2 =
        {
            style: 'tableExample',
            table: {
                //   49 - 2 - 49
                heights: 28,
                widths: [
                    '4%', '13%', '7%', '4%', '13%', '8%',
                    '1%', '1%',
                    '4%', '13%', '7%', '4%', '13%', '8%'
                ],
                body: await this.getbody(this.jobCardRows, item[0], item[1], data1, data2, this.subNodeFlowCost12[0], idxN),
            },

            layout: {
                vLineStyle: function (i:number, node: any) {
                    if(dashed.indexOf(i) > -1){
                    // if(dashed.indexOf(i) > -1 && dashed.indexOf(k) < 0){

                        return {dash: { length: 10, space: 6 }};
                    }
                    return {};
                },
            }
        };



        // ###########  one page   =    1 paring    ###################################################
        // ############################################################################################
        // const pageBrake: any[] = [{text: '', pageBreak: 'after', style: ['']}];
        contentArr = [content1, content2];
        // console.log(contentArr);
        return contentArr;
    }




    async createContent() {
        // let content: any[] = [];
        let contentArr: any[] = [];
        const pageBrake: any[] = [{text: '', pageBreak: 'before', style: ['']}];

        this.orderProductionQueuePairing.forEach(async (item: any[], index) => {

            contentArr = await this.genContentPairing(item, index);
            // console.log('contentArr ', contentArr.length);
            // console.log(contentArr);

            // console.log(contentArr);
            this.content = [...this.content, ...contentArr];
            if (this.orderProductionQueuePairing.length - 1 === index) {
                // console.log(this.content);
                // ## when prepared then view pdf
                this.generatePDF();
            } else {
                this.content = [...this.content, ...pageBrake];
            }
        });
        // console.log(content);
    }

    async pdfPairingBundleNo() {
        const blankData: QueueInfoList = GBC.clrOrderProductQueueList();
        this.orderProductionQueuePairing = [];
        let queuePairing: any[] = [];
        const len = this.orderProductionQueue.length;
        this.orderProductionQueue.forEach( (item, index) => {
            // console.log(index);
            if (queuePairing.length === 0) {
                queuePairing.push(item);
                if ((this.orderProductionQueue.length - 1) === index) {
                    // console.log('this.orderProductionQueue.length === index');
                    // console.log(queuePairing);
                    queuePairing.push(blankData);
                    this.orderProductionQueuePairing.push(queuePairing);
                    queuePairing = [];
                }
            } else if (queuePairing.length === 1) {
                queuePairing.push(item);
                this.orderProductionQueuePairing.push(queuePairing);
                queuePairing = [];
            }
        });
        // console.log(this.orderProductionQueuePairing);
    }

    async generatePDF() {
        // const head2 = 'C#Corner PDF Header';
        (pdfMake as any).fonts = this.userService.pdfMakeFonts;
        // (<any>pdfMake).fonts = this.userService.pdfMakeFonts;
        const num2 = 99;
        const num4 = 9999;
        const num6 = 999999;
        const num12 = 999999999999;
        const dashed = [7];
        const  qrcode = {a: "123", b: "123"};
        const jsonQR = JSON.stringify(qrcode);
        const style = {

            headsize: {
                fontSize: 22,
                bold: true,
            },
            txtbold: {
                fontSize: 14,
                bold: true,
            },
            listbold1: {
                fontSize: 10,
                bold: true,
            },
            list1: {
                fontSize: 12,
            },
            list2: {
                fontSize: 10,
            },
            list25: {
                fontSize: 9,
            },
            list3: {
                fontSize: 7,
            },
            list4: {
                fontSize: 6,
            },
            alignleft: {
                // italics: true,
                alignment: 'left'
            },
            aligncenter: {
                // italics: true,
                alignment: 'center'
            },
            alignright: {
                // italics: true,
                alignment: 'right'
            }
        };


        // console.log(content1);
        // console.log(this.content);
        // const content01 = [...content1, ...content1];
        let contentX = []
        let docDefinition: any = {
            pageSize: 'A4',
            pageMargins: [ 15, 10, 15, 10 ],
            // header: head2,
            // pageOrientation: 'portrait',
            pageOrientation: 'landscape',
            content: this.content,
            // content: content1,
            // content: [content1, content1],
            // defaultStyle: {font: 'Roboto', fontSize: 10},
            defaultStyle: {font: 'THSarabunNew', fontSize: 10},
            styles: style,
        };

        pdfMake.createPdf(docDefinition).open();
    }


    // ## print type 1,   job card  |  job card  ###############################################################################
    // #########################################################################################################################
    // ## print type 2 QRcode  |  job card  ####################################################################################
    async pdfPairingBundleNo2() {
        // const blankData: QueueInfoList = GBC.clrOrderProductQueueList();
        this.orderProductionQueuePairing = [];
        let queuePairing: any[] = [];
        // const len = this.orderProductionQueue.length;

        // [
        //     { text: this.order.orderID, style: ['alignleft', 'txtbold'] },
        //     { text: 'ZONE : '+ this.userService.getInfoFromProductBarcode(item[1].productBarcode, 'targetPlaceID'), style: ['alignleft', 'list2'] },
        //     { text: 'COLOR : '+ this.userService.getCodeColorNameByColorCode(data2.color1, this.order.orderColor[0].setName), style: ['alignleft', 'list2'] },
        //     { text: '        '+ this.userService.getColorNameByColorCode(data2.color1, this.order.orderColor[0].setName), style: ['alignleft', 'list3'] },
        // ],

        this.orderProductionQueue.forEach( (item, index) => {
            queuePairing = [];
            const zone = this.userService.getInfoFromProductBarcode(item.productBarcode, 'targetPlaceID');
            let color1 = this.userService.getInfoFromProductBarcode(item.productBarcode, 'color');
            color1 = this.userService.strReplaceAll(color1, '-', '');
            let size1 = this.userService.getInfoFromProductBarcode(item.productBarcode, 'size');
            size1 = this.userService.strReplaceAll(size1, '-', '');
            const isForLoss = item.forLossQty > 0 ? true : false;
            let qrCodeInfo = {
                productBarcodeNo: '',
                no: 0,
                zone: zone,
                colorName: this.userService.getColorNameByColorCode(color1, this.order.orderColor[0].setName),
                colorCode: this.userService.getCodeColorNameByColorCode(color1, this.order.orderColor[0].setName), // #000
                size: size1,
                isForLoss: isForLoss
            };
            let qrCodeInfoArr = [];
            for (let i = item.numberFrom; i <= item.numberTo; i++) {
                qrCodeInfo.productBarcodeNo = item.productBarcode + this.userService.setAddStrLen(''+i, 5, '0');
                qrCodeInfo.no = i;
                qrCodeInfoArr.push({...qrCodeInfo});
            }
            queuePairing.push(qrCodeInfoArr, item);
            this.orderProductionQueuePairing.push(queuePairing);
        });

        // console.log(this.orderProductionQueuePairing);
    }

    async createContent2() {
        // let content: any[] = [];
        let contentArr: any[] = [];
        const pageBrake: any[] = [{text: '', pageBreak: 'before', style: ['']}];

        this.orderProductionQueuePairing.forEach(async (item: any[], index) => {
            // console.log('index = ', index);
            contentArr = await this.genContentPairing2(item);
            this.content = [...this.content, ...contentArr];
            if (this.orderProductionQueuePairing.length - 1 === index) {


                // await this.testBody();


                // console.log(this.content);
                // ## when prepared then view pdf
                this.generatePDF();
            } else {
                // console.log(index);
                this.content = [...this.content, ...pageBrake];
            }
        });
        // console.log(content);
    }

    async genContentPairing2(item: any[]): Promise<any[]> {
        let contentArr: any[] = [];
        // const data1 = await this.userService.getDataFromBarcode(item[0]);
        // console.log(item[0]);
        // console.log(item[1]);
        const data1 = item[0];
        const data2 = await this.userService.getDataFromBarcode(item[1].productBarcode);
        const dashed = [5]; // ## need dash line for half of paper colunm 7

        // ############################################################################################
        // ###########  one page   =    1 paring    ###################################################

        function getIsForLoss(orderID: string) {
            if (+item[1].forLossQty > 0) {
                return orderID + ' [for loss]';
            }
            return orderID;
        }

        const content1 =
        {
            margin: [15, 0, 15, 0],
            style: 'tableExample',
            table: {
                //   49 - 2 - 49
                widths: ['5%', '2%', '15%', '15%', '12%',    '1%', '1%',     '5%', '2%', '15%', '15%', '12%'],
                body: [
                    [
                        [{ qr: this.genQRHead(item[1]), fit: '50' }],
                        '',
                        await this.getYarnLotText(item[1].yarnLot),
                        [
                            { text: getIsForLoss(this.order.orderID), style: ['alignleft', 'txtbold'] },
                            { text: 'ZONE : '+ this.userService.getInfoFromProductBarcode(item[1].productBarcode, 'targetPlaceID'), style: ['alignleft', 'list2'] },
                            { text: 'COLOR : '+ this.userService.getCodeColorNameByColorCode(data2.color1, this.order.orderColor[0].setName), style: ['alignleft', 'list2'] },
                            { text: '        '+ this.userService.getColorNameByColorCode(data2.color1, this.order.orderColor[0].setName), style: ['alignleft', 'list3'] },
                        ],
                        [
                            { text: data2.size, style: ['headsize', 'alignright'] },
                            { text: 'QTY : ' + item[1].productCount , style: ['alignright'] },
                            { text: 'Bundle No : ' + item[1].bundleNo, style: ['alignright', 'list2'] },
                        ],

                        { text: '', border: [true, false, true, false] },  // ## center blank zone
                        { text: '', border: [true, false, true, false] }, // ## center blank zone

                        [{ qr: this.genQRHead(item[1]), fit: '50' }],
                        '',
                        await this.getYarnLotText(item[1].yarnLot),
                        [
                            { text: getIsForLoss(this.order.orderID), style: ['alignleft', 'txtbold'] },
                            { text: 'ZONE : '+ this.userService.getInfoFromProductBarcode(item[1].productBarcode, 'targetPlaceID'), style: ['alignleft', 'list2'] },
                            { text: 'COLOR : '+ this.userService.getCodeColorNameByColorCode(data2.color1, this.order.orderColor[0].setName), style: ['alignleft', 'list2'] },
                            { text: '        '+ this.userService.getColorNameByColorCode(data2.color1, this.order.orderColor[0].setName), style: ['alignleft', 'list3'] },
                        ],
                        [
                            { text: data2.size, style: ['headsize', 'alignright'] },
                            { text: 'QTY : ' + item[1].productCount , style: ['alignright'] },
                            { text: 'Bundle No : ' + item[1].bundleNo, style: ['alignright', 'list2'] },
                        ],
                    ],
                ]
            },
            layout: 'noBorders'
        };

        const content2 =
        {
            style: 'tableExample',
            table: {
                //   49 - 2 - 49
                heights: 28,
                widths: [
                    '10%', '15%', '10%', '14%',
                    '1%', '1%',
                    '4%', '13%', '7%', '4%', '13%', '8%'
                ],
                body: await this.getbody_2(this.jobCardRows, item[0], item[1], data1, data2),
            },

            layout: {
                vLineStyle: function (i:number, node: any) {
                    if(dashed.indexOf(i) > -1){
                    // if(dashed.indexOf(i) > -1 && dashed.indexOf(k) < 0){

                        return {dash: { length: 10, space: 6 }};
                    }
                    return {};
                },
            }
        };

        // ###########  one page   =    1 paring    ###################################################
        // ############################################################################################
        // const pageBrake: any[] = [{text: '', pageBreak: 'after', style: ['']}];

        contentArr = [content1, content2];
        // console.log(contentArr);
        return contentArr;
    }


    async getbody_2(items: number, itemL: any, itemR: any, dataL: any, dataR: any): Promise<any[]> {
        let bodyPDF: any[] = [];
        // let bodyPDF2: any[] = [];
        // const qrBlank = '';
        // const qrBlank = JSON.stringify({ID: '0' , data: '0'});
        const blankBody = [
                // { qr: qrBlank, fit: '30' },
                // { text: '', border: [false, false, false, false] },
                // { text: '', border: [false, false, false, false] },
                // { text: '', border: [false, false, false, false] },
                // { text: '', border: [false, false, false, false] },
                '', '', '', '',
                { text: '', border: [true, false, true, false] },  // ## center blank zone
                { text: '', border: [true, false, true, false] }, // ## center blank zone
                '', '', '', '', '', ''

        ]; // ## 14 columns

        let bodyRows = [];
        // ## create bodyRows = items/15 items
        for (let i = 0; i < items; i++) {
            bodyRows.push([...blankBody]);
        }

        bodyRows.forEach(async(item, index) => {
        // this.subNodeFlowCost.forEach(async(item, index) => {
            // const bodyPDF = this.getbody1(item, itemL, itemR, dataL, dataR);
            // if (bodyPDF.length === 0) {
            //     bodyPDF.push(await this.getbody1(item, itemL, itemR, dataL, dataR));
            // }
            bodyPDF.unshift(await this.getbody_21(index, items, item, itemL, itemR, dataL, dataR, this.subNodeFlowCost12));
            // if ((this.subNodeFlowCost.length - 1) === index) {
            //     for (let i = this.subNodeFlowCost.length; i < items ; i++) {
            //         bodyPDF.unshift(blankBody);  // unshift   push
            //     }
            //     // console.log(bodyPDF);

            // }
        });

        // console.log('1 ',bodyPDF);
        return bodyPDF;
    }

    async getbody_21(index: number, items: number, bodyRows: any, itemL: any, itemR: any, dataL: any, dataR: any,
        subNodeFlowCost: SubNodeFlowCost[]) {
        // subNodeFlowCost: SubNodeFlowCost[] = [];
        // console.log(itemL, itemR, dataL, dataR);
        // const  qrcode = {a: "123", b: "123"};
        // const jsonQR = JSON.stringify(qrcode);
        // console.log(index);



        function getQRCode1() {
            if ((items - index - 1) < itemL.length) {
                if ((items - index - 1) % 2 === 0) {
                    const idx = items - index - 1;
                    return {
                        rowSpan: 2,
                        border: [false, false, false, false],
                        qr: itemL[idx].productBarcodeNo, fit: '50',
                    };
                } else {
                    return { text: '', border: [false, false, false, false] };
                }
            } else {
                return { text: '', border: [false, false, false, false] };
            }
        }

        function getQRCode2() {
            if ((items - index - 1) < itemL.length) {
                if ((items - index - 1) % 2 === 0) {
                    const idx = items - index - 1;
                    if (itemL[idx + 1]) {
                        return {
                            rowSpan: 2,
                            border: [false, false, false, false],
                            qr: itemL[idx + 1].productBarcodeNo, fit: '50',
                        };
                    } else {
                        return { text: '', border: [false, false, false, false] };
                    }
                } else {
                    return { text: '', border: [false, false, false, false] };
                }
            } else {
                return { text: '', border: [false, false, false, false] };
            }
        }

        // ## get qrCode 1
        function getProductNo1() {
            if ((items - index - 1) < itemL.length) {
                if ((items - index - 1) % 2 === 0) {
                    const idx = items - index - 1;
                    return {
                        rowSpan: 2,
                        border: [false, false, false, false],
                        style: ['headsize'],
                        // text: itemL[idx].no
                        text: [
                            {text: itemL[idx].no, style: ['headsize']},
                            {text: itemL[idx].isForLoss?' \n for loss':'', style: ['alignleft', 'list2']},
                        ]
                    };
                } else {
                    return { text: '', border: [false, false, false, false] };
                }

            } else {
                return { text: '', border: [false, false, false, false] };
            }
        }

        // ## get qrCode 2
        function getProductNo2() {
            if ((items - index - 1) < itemL.length) {
                if ((items - index - 1) % 2 === 0) {
                    const idx = items - index - 1;
                    if (itemL[idx + 1]) {
                        return {
                            rowSpan: 2,
                            border: [false, false, false, false],
                            style: ['headsize'],
                            // text: itemL[idx + 1].no
                            text: [
                                {text: itemL[idx + 1].no, style: ['headsize']},
                                {text: itemL[idx + 1].isForLoss?' \n for loss':'', style: ['alignleft', 'list2']},
                            ]
                        };
                    } else {
                        return { text: '', border: [false, false, false, false] };
                    }
                } else {
                    return { text: '', border: [false, false, false, false] };
                }

            } else {
                return { text: '', border: [false, false, false, false] };
            }
        }

        // ## items = 15  / 15 rows
        const body1 = [

            getQRCode1(),
            getProductNo1(),
            getQRCode2(),
            getProductNo2(),

            { text: '', border: [false, false, true, false] },  // ## center blank zone
            { text: '', border: [true, false, true, false] }, // ## center blank zone

            (index < subNodeFlowCost.length) ?
                [
                    { qr: this.genQRSubNodeFlowCost(subNodeFlowCost[index], itemR, dataR), fit: '30' },
                ]:'',

            (index < subNodeFlowCost.length) ?
                [
                    {
                        text: [
                            {text: this.order.orderID, style: ['list3']},
                            ' ',
                            {text: dataR.zone, style: ['list3']},
                            ' ',
                            {text: dataR.size, style: ['list3']},
                            ' ',
                            {text: itemR.bundleNo, style: ['list4']},
                            ' ',
                            {text: itemR.productCount, style: ['list4']},
                        ],
                        style: ['list3']
                    },
                    {
                        text: [
                            {text: subNodeFlowCost[index].subNodeID, style: ['list3']},
                            ' : ',
                            {
                                text: this.userService.getSubNodeFlowName(subNodeFlowCost[index].nodeID, subNodeFlowCost[index].subNodeID, this.subNodeflowC),
                                style: ['list3']
                            },
                        ],
                        style: ['list3']
                    },
                    {
                        text: this.userService.getCodeColorNameByColorCode(dataR.color1, this.order.orderColor[0].setName)
                                + ' '
                                + this.userService.getColorNameByColorCode(dataR.color1, this.order.orderColor[0].setName),
                        style: ['list3']
                    },
                ]:'',
            [
                {text: itemR.productCount, style: ['list1']},
            ],
            (index < subNodeFlowCost.length) ?
                [
                    { qr: this.genQRSubNodeFlowCost(subNodeFlowCost[index], itemR, dataR), fit: '30' },
                ]:'',

            (index < subNodeFlowCost.length) ?
                [
                    {
                        text: [
                            {text: this.order.orderID, style: ['list3']},
                            ' ',
                            {text: dataR.zone, style: ['list3']},
                            ' ',
                            {text: dataR.size, style: ['list3']},
                            ' ',
                            {text: itemR.bundleNo, style: ['list4']},
                            ' ',
                            {text: itemR.productCount, style: ['list4']},
                        ],
                        style: ['list3']
                    },
                    {
                        text: [
                            {text: subNodeFlowCost[index].subNodeID, style: ['list3']},
                            ' : ',
                            {
                                text: this.userService.getSubNodeFlowName(subNodeFlowCost[index].nodeID, subNodeFlowCost[index].subNodeID, this.subNodeflowC),
                                style: ['list3']
                            },
                        ],
                        style: ['list3']
                    },
                    {
                        text: this.userService.getCodeColorNameByColorCode(dataR.color1, this.order.orderColor[0].setName)
                                + ' '
                                + this.userService.getColorNameByColorCode(dataR.color1, this.order.orderColor[0].setName),
                        style: ['list3']
                    },
                ]:'',

            [
                {text: itemR.productCount, style: ['list1']},
            ],

        ];
        // console.log(body1);
        return body1;
    }




    // getColorNameByColorCode(colorCode: string, setName: string) {
    //     // console.log(colorCode, setName);
    //     // console.log(colorCode, setName, this.colors);
    //     colorCode = this.userService.strReplaceAll(colorCode, '-', '');
    //     if (colorCode==='') {return ''}
    //     const idx = this.colors.findIndex( fi =>(fi.color.colorID === colorCode && fi.setName === setName.trim()));
    //     // console.log(idx, this.colors[idx].color.colorName);
    //     return this.colors[idx].color.colorName;
    // }

    // getCodeColorNameByColorCode(colorCode: string, setName: string) {
    //     colorCode = this.userService.strReplaceAll(colorCode, '-', '');
    //     if (setName.trim() === '') { setName = 'muji';}
    //     if (colorCode==='') {return ''}
    //     const idx = this.colors.findIndex( fi =>(fi.color.colorID === colorCode && fi.setName === setName.trim()));
    //     return this.colors[idx].color.colorCode;
    // }


    // #########################################################################################################################
    // ## print bundle running No  ####################################################################################



    ngOnDestroy(): void {
        if (this.productionQueueSub) { this.productionQueueSub.unsubscribe(); }
        if (this.nodeFlowSub) { this.nodeFlowSub.unsubscribe(); }
        // if (this.sockio) { this.sockio.unsubscribe(); }
        // if (this.dataAroundAppSub) { this.dataAroundAppSub.unsubscribe(); }
        // if (this.screenSub) { this.screenSub.unsubscribe(); }
    }
}
