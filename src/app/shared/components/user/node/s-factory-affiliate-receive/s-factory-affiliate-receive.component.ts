import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { DialogService } from 'primeng/dynamicdialog';
import { MessageService } from 'primeng/api';

import { GBC } from 'src/app/global/const-global';
import { Company, CreateBy, Factory } from 'src/app/models/app.model';
import { BundleGroupColorScan, FlowSeq, NodeFlow, NodeStation, OrderProductionReceiveOutsourceScan, OrderProductionScan, ScanItem, ScanItemOutsourece } from 'src/app/models/workstation.model';
import { NodeStationService } from 'src/app/services/node-station.service';
import { UserService } from 'src/app/services/user.service';
import { SOutsourceSelectnodeComponent } from '../s-outsource-selectnode/s-outsource-selectnode.component';
import { User } from 'src/app/models/user.model';
import { OrderProduction, OutsourceData, ProductionNode } from 'src/app/models/order.model';
import { SSelectFactoryComponent } from '../../../general/s-select-factory/s-select-factory.component';

@Component({
    selector: 'app-s-factory-affiliate-receive',
    templateUrl: './s-factory-affiliate-receive.component.html',
    styleUrls: ['./s-factory-affiliate-receive.component.scss'],
    providers: [DialogService, MessageService],
})
export class SFactoryAffiliateReceiveComponent implements OnInit, OnDestroy {
    @ViewChild('input1', { static: false }) scanInputBox!: ElementRef;

    nodeMenuActive = 'factory-affiliate';  // factory-affiliate
    formName = this.nodeMenuActive;

    intervalTimer: any;
    timeInterval = 2000;
    productBundleGroup: any[] = [];

    scan1ForAll = false;
    nodeStations: NodeStation[] = [];
    staff: User = GBC.clrUser();
    nodeStation: NodeStation = GBC.clrNodeStation();
    company: Company = GBC.clrCompany();
    factory: Factory = GBC.clrFactory();
    factorySelect: Factory = GBC.clrFactory();
    nodeFlow: NodeFlow = GBC.clrNodeFlow();
    flowSeq: FlowSeq[] = [];
    stationID = '';
    companyID = '';
    factoryID = '';
    nodeID = '';
    sTypeOtus = ''; // ## b =bundle , 1= 1by 1 / sTypeOtus=scanType
    isOutsource = true;
    mustBundleScan = true; //
    cancelReceiveMode = false; // ## true = we want to cancel the product whice received
    cancelCount = 0;

    bundleGroupColorScan: BundleGroupColorScan[] = [];
    bundleNoScan: number[] = [];
    productBarcodeNos: string[] = [];

    // ## outsource
    flowSeqOutsourceSelect: FlowSeq[] = [];

    productBarcodeNoInput = '';
    stackBarcodeFull = false;
    orderProductionScan1: OrderProductionScan = GBC.clrOrderProductionScan();


    private dataAroundNodeAppSub: Subscription = new Subscription;
    private scanOrderProductionBarcodeNoSub: Subscription = new Subscription;
    private orderProductionNextNodeIDSub: Subscription = new Subscription;
    private orderProductionCancelSub: Subscription = new Subscription;


    constructor(
        public dialogService: DialogService,
        public messageService: MessageService,
        // private router: Router,

        public userService: UserService,
        // private productService: ProductService,
        // private socketService: SocketIOService,
        public nsService: NodeStationService,
        // private repService: ReportService,
    ) {}

    ngOnInit(): void {

        this.nsService.setMenuActive(this.nodeMenuActive);
        // setDataAroundNodeApp(prop: string, val: any)
        this.nsService.setDataAroundNodeApp('isFactoryAffiliate', true);
        // this.nsService.outsourceModeName = 'RECEIVE';

        this.staff = this.nsService.staff;
        this.nodeStation = this.nsService.nodeStation;
        this.company = this.userService.getCompany();
        this.factory = this.userService.getFactory();
        this.stationID = this.nsService.stationID;
        this.nodeFlow = this.nsService.nodeFlow;
        this.flowSeq = this.nodeFlow.flowSeq;
        this.bundleGroupColorScan = [...this.nsService.bundleGroupColorScan];

        // console.log(this.nodeFlow );
        // console.log(this.staff );
        // console.log(this.nodeStations );
        // console.log(this.nsService.nodeFlow);

        this.companyID = this.company.companyID;
        this.factoryID = this.factory.factoryID;
        this.nodeID = this.nodeStation.nodeID;
        // this.mustBundleScan = this.nsService.getNodeMustBundleScan(this.nodeID);

        this.scan1ForAll = this.nodeStation.nodeInfo.scan1ForAll; // ## y= สแกน1ตัวแล้วดึงทั้งหมด

        this.dataAroundNodeAppSub = this.nsService.getDataAroundNodeAppStatusListener().subscribe(dataAroundNodeApp => {
            // console.log(dataAroundNodeApp.refreshCurrentPage, );
            // console.log(this.nodeMenuActive, dataAroundNodeApp.refreshPage);
            if (dataAroundNodeApp.refreshCurrentPage && this.nodeMenuActive === dataAroundNodeApp.refreshPage) {
                // console.log('this.nodeMenuActive === dataAroundNodeApp.refreshPage');

                // this.getRepCurrentProductQtyCFNUpdatedListener();
            }
        });

        if (this.mustBundleScan) { // ## can scan --> bundle
            // console.log('runTimeSetInterval()1');
            this.runTimeSetInterval();
        }
    }

    cancelReceive() {
        // console.log('cancelReceiveMode');
        this.cancelReceiveMode = true;
    }

    runTimeSetInterval() {
        // console.log('runTimeSetInterval()');
        if (this.intervalTimer) { clearInterval(this.intervalTimer); } // ## pause stop time interval
        if (this.mustBundleScan) { // ## can scan --> bundle
            this.intervalTimer = setInterval(() => {
                // ## check bundle psc complete
                if (this.mustBundleScan && this.flowSeqOutsourceSelect.length > 0) { // ## can scan --> bundle
                    this.checkScanCompleteBundle();
                } else {
                    // ## can scan 1 by 1  , no bundle
                }
            }, this.timeInterval);
        }
    }

    checkScanCompleteBundle() {
        this.productBundleGroup = [];
        let scanItem = [...this.orderProductionScan1.scanItem];
        this.productBundleGroup = this.userService.groupBy(scanItem, (c: any) => c.productBarcodeNundleCount);
        // console.log(this.productBundleGroup);
        this.productBundleGroup = Object.values(this.productBundleGroup);
        // console.log(this.productBundleGroup);

        this.productBundleGroup.forEach( (item, index) => {
            if (item.length === item[0].bundleCount) {
                // console.log('---------- complete  bundle-----------------------------');
                if (this.intervalTimer) { clearInterval(this.intervalTimer); } // ## pause stop time interval
                this.setBundleNextNodeID(item);
            }
        });
    }

    getProductionNodeArr() {
        const outsourceData: OutsourceData[] = [];
        const isOutsource = false;
        const createBy: CreateBy = {
            userID: this.nsService.staff.userID,
            userName: this.nsService.staff.uInfo.userName
        };

        // ## do here for all nodeID processed / loop of nodeIDs
        let fromNode = '';  // starterNode
        let toNode = '';
        let productionNode: ProductionNode[] = [];
        // console.log(this.flowSeqOutsourceSelect);
        this.flowSeqOutsourceSelect.forEach( (item, index) => {
            const idx = this.flowSeq.findIndex( fi =>(fi.nodeID === item.nodeID));
            fromNode = this.flowSeq[idx].nodeID;
            toNode = this.flowSeq[idx + 1].nodeID;
            productionNode.push(this.genProductionNodeTemp(fromNode, toNode, 'normal', '', '', isOutsource, outsourceData, createBy));

            // if (+item.seqNo === 1) {

            //     // ## first element
            //     fromNode = 'starterNode';
            //     toNode = this.flowSeq[0].nodeID;
            //     productionNode.push(this.genProductionNodeTemp(fromNode, toNode, 'normal', '', '', isOutsource, outsourceData, createBy));

            //     // ## second element
            //     fromNode = this.flowSeq[0].nodeID;
            //     toNode = this.flowSeq[1].nodeID;
            //     productionNode.push(this.genProductionNodeTemp(fromNode, toNode, 'normal', '', '', isOutsource, outsourceData, createBy));
            // } else {
            //     const idx = this.flowSeq.findIndex( fi =>(fi.nodeID === item.nodeID));
            //     fromNode = this.flowSeq[idx].nodeID;
            //     toNode = this.flowSeq[idx + 1].nodeID;
            //     productionNode.push(this.genProductionNodeTemp(fromNode, toNode, 'normal', '', '', isOutsource, outsourceData, createBy));
            // }
        });

        // console.log(productionNode);
        return productionNode;
    }

    setBundleNextNodeID(productBundleGroup: any[]) {
        // console.log('---------- setNextNodeID -----------------------------');
        const orderID = productBundleGroup[0].orderID;
        const productID = productBundleGroup[0].productID;
        const isOutsource = false;
        const bundleNo = productBundleGroup[0].bundleNo;

        let productBarcodeNos: string[] = [];
        productBundleGroup.forEach( (item, index) => {
            productBarcodeNos.push(item.productBarcodeNo);
        });

        // const productionNode: ProductionNode = {
        //     factoryID: this.factory.factoryID,
        //     fromNode: this.nodeStation.nodeID,
        //     toNode: '',
        //     datetime: new Date(),
        //     status: 'normal',
        //     problemID: '',
        //     problemName: '',
        //     isOutsource: isOutsource,
        //     outsourceData: [],
        //     createBy: {
        //         userID: this.nsService.staff.userID,
        //         userName: this.nsService.staff.uInfo.userName
        //     }
        // }
        let productionNode: ProductionNode[] = this.getProductionNodeArr();
        this.putAffiliateOrderProductionNextNodeID(orderID, productID, productBarcodeNos, productionNode, bundleNo);
    }

    set1ProductionNextnodeID(orderID: string, productID: string, productBarcodeNo: string, isOutsource: boolean, bundleNo: number) {
        const productBarcodeNos = [productBarcodeNo];
        // const productionNode: ProductionNode = {
        //     factoryID: this.factory.factoryID,
        //     fromNode: this.nodeStation.nodeID,
        //     toNode:    '',
        //     datetime: new Date(),
        //     status: 'normal',
        //     problemID: '',
        //     problemName: '',
        //     isOutsource: isOutsource,
        //     outsourceData: [],
        //     createBy: {
        //         userID: this.nsService.staff.userID,
        //         userName: this.nsService.staff.uInfo.userName
        //     }
        // }
        let productionNode: ProductionNode[] = this.getProductionNodeArr();
        this.putAffiliateOrderProductionNextNodeID(orderID, productID, productBarcodeNos, productionNode, bundleNo);
    }

    putAffiliateOrderProductionNextNodeID(orderID: string, productID: string, productBarcodeNos: string[], productionNode: ProductionNode[],
                                        bundleNo: number) {
        // putAffiliateOrderProductionNextNodeID(
        //     companyID: string, factoryID: string, orderID: string, productID: string,
        //     productBarcodeNos: string[], productionNode: ProductionNode[]
        // )
        // console.log('putAffiliateOrderProductionNextNodeID');
        // console.log(productionNode);
        this.nsService.putAffiliateOrderProductionNextNodeID(
            this.company.companyID, this.factory.factoryID, orderID, productID, productBarcodeNos, productionNode, bundleNo
        );
        if (this.orderProductionNextNodeIDSub) { this.orderProductionNextNodeIDSub.unsubscribe(); }
        this.orderProductionNextNodeIDSub = this.nsService.getOrderProductionNextNodeIDUpdatedListener().subscribe((data) => {
            // console.log(data);
            // console.log(bundleNo);
            if (data.success) {

                this.updateQtyScanned(productBarcodeNos);
                this.clearBundleGroupColorScan1(bundleNo);

                // ## clear data @ this.orderProductionScan1.scanItem
                let productBarcodeNosArr = data.productBarcodeNos;
                productBarcodeNosArr.forEach( (item, index) => {
                    // const index1= this.orderProductionScan1.scanItem.indexOf(item);
                    const idx = this.orderProductionScan1.scanItem.findIndex(i=>(i.productBarcodeNo === item));
                    if (idx !== -1) {
                        this.orderProductionScan1.scanItem.splice(idx, 1);
                    }
                });
                if (this.mustBundleScan) { // ## can scan --> bundle
                    this.runTimeSetInterval();
                }
                this.messageService.add({
                    severity:'success',
                    summary:'receive Factory affiliate completed successfully',
                    detail:'receive Factory affiliate completed',
                    sticky: false
                });
            } else {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error [ Product has problem ]',
                    detail: ' [ please send back product in problem process step ] ',
                    sticky: false,
                });
            }

        });

    }


    // putOrderProductionNextNodeID(orderID: string, productID: string, productBarcodeNos: string[], productionNode: ProductionNode,
    //                             bundleNo: number) {
    //     // putOrderProductionNextNodeID(
    //     //     companyID: string, factoryID: string, orderID: string, productID: string,
    //     //     productBarcodeNos: string[], productionNode: ProductionNode[]
    //     // )
    //     this.nsService.putOrderProductionNextNodeID(
    //         this.company.companyID, this.factory.factoryID, orderID, productID, productBarcodeNos, productionNode,
    //         this.userService.controlApp.clientControl.washingAndPressingMerge
    //     );
    //     if (this.orderProductionNextNodeIDSub) { this.orderProductionNextNodeIDSub.unsubscribe(); }
    //     this.orderProductionNextNodeIDSub = this.nsService.getOrderProductionNextNodeIDUpdatedListener().subscribe((data) => {
    //         // console.log(data);
    //         // console.log(bundleNo);
    //         this.clearBundleGroupColorScan1(bundleNo);

    //         // ## clear data @ this.orderProductionScan1.scanItem
    //         let productBarcodeNosArr = data.productBarcodeNos;
    //         productBarcodeNosArr.forEach( (item, index) => {
    //             // const index1= this.orderProductionScan1.scanItem.indexOf(item);
    //             const idx = this.orderProductionScan1.scanItem.findIndex(i=>(i.productBarcodeNo === item));
    //             if (idx !== -1) {
    //                 this.orderProductionScan1.scanItem.splice(idx, 1);
    //             }
    //         });
    //         if (this.nodeStation.nodeInfo.mustBundleScan) { // ## can scan --> bundle
    //             this.runTimeSetInterval();
    //         }
    //     });
    // }

    genProductionNodeTemp(fromNode: string, toNode: string, status: string, problemID: string, problemName: string,
                            isOutsource: boolean, outsourceData: OutsourceData[], createBy: CreateBy) {
        const productionNode: ProductionNode = {
            factoryID: this.factorySelect.factoryID,  // ## factory who did
            fromNode: fromNode,
            toNode: toNode,
            datetime: new Date(),
            status: status,
            info: '',
            sTypeOtus: this.sTypeOtus,
            problemID: problemID,
            problemName: problemName,
            isTracking: false,
            isOutsource: isOutsource,
            outsourceData: outsourceData,

            createBy: createBy
        };
        return productionNode;
    }

    updatebundleScanned(bundleNo: number|string) {
        // console.log(bundleNo);
        this.bundleNoScan.push(+bundleNo);
        // console.log(this.bundleNoScan);
    }

    updateQtyScanned(productBarcodeNos: string[]) {
        this.productBarcodeNos = [...this.productBarcodeNos, ...productBarcodeNos];
        // console.log(this.productBarcodeNos);
    }

    clearbundleScanned() {
        this.bundleNoScan = [];
    }

    clearQtyScanned() {
        this.productBarcodeNos = [];
    }

    clearAll() {
        this.factorySelect = GBC.clrFactory();
        this.cancelReceiveMode = false;
        this.cancelCount = 0;
        this.clearbundleScanned();
        this.clearQtyScanned();
        this.clearflowSeqOutsourceSelect();
        this.mustBundleScan = true;
        if (this.mustBundleScan) { // ## can scan --> bundle
            // console.log('runTimeSetInterval()1');
            this.runTimeSetInterval();
        }
    }

    // ## mode = scan-receive-affiliate
    putScanOrderProductionBarcodeNo(productBarcodeNo: string, mode: string) {
        this.scanInputBox.nativeElement.focus(); // ## input setfocus
        this.scanInputBox.nativeElement.select();
        // putScanOrderProductionBarcodeNo(userID: string, companyID: string, factoryID: string,
        //                                  productBarcodeNo: string, nodeID: string, stationID: string)
        // console.log(productBarcodeNo);
        this.nsService.putScanOrderProductionBarcodeNo(
            this.staff.userID, this.company.companyID, this.factorySelect.factoryID, productBarcodeNo,
            this.nodeStation.nodeID, this.stationID, mode, false
        );
        if (this.scanOrderProductionBarcodeNoSub) { this.scanOrderProductionBarcodeNoSub.unsubscribe(); }
        this.scanOrderProductionBarcodeNoSub = this.nsService.getScanOrderProductionBarcodeNoUpdatedListener().subscribe((data) => {
            // console.log(data);
            // console.log(data.orderProduction);
            if (data.success) {
                if ((data.orderProduction.productStatus === 'normal' || data.orderProduction.productStatus === 'repaired')
                    && data.orderProduction.productionNode[data.orderProduction.productionNode.length - 1].factoryID === this.factorySelect.factoryID
                    && data.orderProduction.productionNode[data.orderProduction.productionNode.length - 1].toNode === this.flowSeqOutsourceSelect[0].nodeID) {
                    // this.qtyCount = +this.qtyCount + 1;
                    this.addOrderProductionBarcodeNoToTemp(data.orderProduction);
                    // console.log(data.orderProduction);
                    // this.putAffiliateOrderProductionNextNodeID(data.orderProduction);
                } else {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error [ Product has problem ]',
                        detail: ' [ please send back product in problem process step ] ',
                        sticky: false,
                    });
                }
            } else {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error [ ' + data.message.messageID + ' ]',
                    detail: data.message.value + ' [ '+data.message.mode+' ] ',
                    sticky: false,
                });
            }
        });
    }






    putCancelOutsourceOrderProductionReceived(productBarcodeNos: string[]) {
        // // putCancelOutsourceOrderProductionReceived(companyID: string, productBarcodeNos: string[])
        // // this.productBarcodeNos = [];
        // this.nsService.putCancelOutsourceOrderProductionReceived(this.company.companyID, productBarcodeNos);
        // if (this.orderProductionCancelSub) { this.orderProductionCancelSub.unsubscribe(); }
        // this.orderProductionCancelSub = this.nsService.getOrderProductionReceivedCancelledUpdatedListener().subscribe((data) => {
        //     this.productBarcodeNoInput = '';
        //     if (data.success) {
        //         this.cancelCount++;
        //         this.messageService.add({
        //             severity:'success',
        //             summary:'Cancel completed successfully',
        //             detail:'completed',
        //             sticky: false
        //         });
        //     } else {
        //         this.messageService.add({
        //             severity: 'error',
        //             summary: 'Error [ ' + data.message.messageID + ' ]',
        //             detail: data.message.value + ' [ '+data.message.mode+' ] ',
        //             sticky: false,
        //         });
        //     }
        // });
    }

    addOrderProductionBarcodeNoToTemp(orderProduction: OrderProduction) {
        // console.log(orderProduction );
        this.productBarcodeNoInput = '';
        const bundleNo = orderProduction.bundleNo;
        // orderProductionScan1   orderProductionScan2

        if (this.orderProductionScan1.scanItem.length === 0) {
            const orderProductionScanL: OrderProductionScan = {
                companyID: this.company.companyID,
                factoryID: orderProduction.productionNode[orderProduction.productionNode.length - 1].factoryID,
                nodeID: this.nodeStation.nodeID,
                nodeIDNext: '',
                stationID: this.stationID,
                productID: orderProduction.productID,
                orderID: orderProduction.orderID,
                bundleNo: orderProduction.bundleNo,
                bundleCount: orderProduction.productCount,
                scanItem: [
                    // {bundleNo: orderProduction.bundleNo, productBarcodeNo: '', status: ''}
                ]
            };
            this.orderProductionScan1 = orderProductionScanL;
        }
        const scanItem: ScanItem = {
            orderID: orderProduction.orderID,
            productBarcodeNundleCount: orderProduction.productBarcodeNo.substr(0, 32) + orderProduction.bundleNo + orderProduction.productCount,
            productID: orderProduction.productID,
            bundleNo: orderProduction.bundleNo,
            bundleCount: orderProduction.productCount,
            productBarcodeNo: orderProduction.productBarcodeNo,
            productBarcodeNoReal: orderProduction.productBarcodeNo,
            // isOutsource: orderProduction.productionNode[orderProduction.productionNode.length - 1].isOutsource,
            isOutsource: false,
            status: 'wait',
            serverCheckState: ''
        };

        // console.log(orderProductionScanL, scanItem);
        // this.addNewOrderProductionBarcodeNoToTemp('orderProductionScan1', orderProductionScanL, scanItem);
        this.updateBundleGroupColorScan(bundleNo)
        this.addScanItem('orderProductionScan1', scanItem);
    }



    addScanItem(tempID: string, scanItem: ScanItem) {
        if (tempID === 'orderProductionScan1') {
            // console.log(this.orderProductionScan1.scanItem.length , '   ', this.maxOrderProductionItemScan1);
            const existed = this.orderProductionScan1.scanItem.some(i => i.productBarcodeNo === scanItem.productBarcodeNo);
            if (!existed) {
                this.orderProductionScan1.scanItem.push(scanItem);
                // this.fullyItem1 = this.orderProductionScan1.scanItem.length === this.maxOrderProductionItemScan1;
                // console.log(this.orderProductionScan1 );
                if (!this.nodeStation.nodeInfo.mustBundleScan) { // ## 1  by 1
                    this.set1ProductionNextnodeID(scanItem.orderID, scanItem.productID,
                                scanItem.productBarcodeNo, scanItem.isOutsource, scanItem.bundleNo);
                }
            }
        }
    }

    clearOrderProductionBarcodeNoToTemp() {
        this.orderProductionScan1 = GBC.clrOrderProductionScan();
        this.clearBundleGroupColorScan();
    }

    barcodeSort() {
        // this.orderProductionScan1.scanItem
        // this.orderProductionScan1.scanItem.sort((a,b)=>{return a.bundleNo >b.bundleNo?1:a.bundleNo <b.bundleNo?-1:0}); // ## เรียง น้อยไปมาก asec
        this.orderProductionScan1.scanItem.sort((a,b)=>{
            return a.bundleNo >b.bundleNo?1:a.bundleNo <b.bundleNo?-1:0
            || a.productBarcodeNo >b.productBarcodeNo?1:a.productBarcodeNo <b.productBarcodeNo?-1:0
        });
    }

    clearflowSeqOutsourceSelect() {
        this.orderProductionScan1 = GBC.clrOrderProductionScan();
        this.flowSeqOutsourceSelect = [];
        this.mustBundleScan = true;
    }



    getColorBundleGroupColorScan(bundleNo: number): string {
        const BundleGroupColorScanF = this.bundleGroupColorScan.filter(i=>(i.bundleNo === bundleNo));
        if (BundleGroupColorScanF.length > 0) {
            return BundleGroupColorScanF[0].color;
        }
        return '';
    }

    updateBundleGroupColorScan(bundleNo: number) {
        // const factory = factories.filter(i=>(i.factoryID === factoryID));
        const BundleGroupColorScanF = this.bundleGroupColorScan.filter(i=>(i.bundleNo === bundleNo));
        if (BundleGroupColorScanF.length === 0) {
            if (this.bundleGroupColorScan[0].bundleNo === -1) {this.bundleGroupColorScan[0].bundleNo = bundleNo;}
            else if (this.bundleGroupColorScan[1].bundleNo === -1) {this.bundleGroupColorScan[1].bundleNo = bundleNo;}
            else if (this.bundleGroupColorScan[2].bundleNo === -1) {this.bundleGroupColorScan[2].bundleNo = bundleNo;}
            else if (this.bundleGroupColorScan[3].bundleNo === -1) {this.bundleGroupColorScan[3].bundleNo = bundleNo;}
            else if (this.bundleGroupColorScan[4].bundleNo === -1) {this.bundleGroupColorScan[4].bundleNo = bundleNo;}
        }
    }

    clearBundleGroupColorScan1(bundleNo: number) {
        const idx = this.bundleGroupColorScan.findIndex( fi =>(fi.bundleNo === bundleNo));
        this.bundleGroupColorScan[idx].bundleNo = -1;
    }

    clearBundleGroupColorScan() {
        this.bundleGroupColorScan = [...this.nsService.bundleGroupColorScan];
    }

    showOutsourceNodeIDSelectionModal() {
        const ref = this.dialogService.open(SOutsourceSelectnodeComponent, {
            data: {
                id: 'nodeIDsSelection',
                company: this.userService?.getCompany(),
                callfrom: this.formName,  // ## send to nodejs for choose buckets
                btnCaption: 'choose',
                // isOutsource: this.isOutsource,
                // nodeFlows: this.nodeFlows[0],
                flowSeq: this.nodeFlow.flowSeq,
                mode: 'outsource-select-nodeID',
                selectType: 'many'
            },
            header: 'Node Production Selection',
            width: '80%',
        });

        ref.onClose.subscribe((data: any) => {
            // console.log(data);
            if (!data || data.length === 0) {
                this.flowSeqOutsourceSelect = [];
            } else {
                this.flowSeqOutsourceSelect = data;
                this.mustBundleScan = true;

                if (this.flowSeqOutsourceSelect.length>0) {
                    this.mustBundleScan =
                        this.nsService.getNodeMustBundleScan(this.flowSeqOutsourceSelect[this.flowSeqOutsourceSelect.length - 1].nodeID);
                }

                if (this.mustBundleScan) { // ## can scan --> bundle
                    // console.log('runTimeSetInterval()1');
                    this.runTimeSetInterval();
                }
            }
        });
    }

    showFactorySelectionModal() {
        this.clearAll();
        const ref = this.dialogService.open(SSelectFactoryComponent, {
            data: {
                id: 'factorySelection-outsource',
                company: this.userService?.getCompany(),
                callfrom: this.formName,  // ## send to nodejs for choose buckets
                btnCaption: 'choose',
                isOutsource: false,

            },
            header: 'Factory Selection [Affiliate]',
            width: '80%',
        });

        ref.onClose.subscribe((factory: Factory) => {
            // console.log(factory);
            if (factory) {
                this.factorySelect = {...factory};
                // this.factorySelectForOrderStyle = {...this.factorySelect};
                // console.log(this.factorySelect);
            }
        });
    }

    ngOnDestroy(): void {
        this.nsService.setDataAroundNodeApp('isOutsourceMode', false);
        if (this.dataAroundNodeAppSub) { this.dataAroundNodeAppSub.unsubscribe(); }
        if (this.scanOrderProductionBarcodeNoSub) { this.scanOrderProductionBarcodeNoSub.unsubscribe(); }
        if (this.orderProductionNextNodeIDSub) { this.orderProductionNextNodeIDSub.unsubscribe(); }
        if (this.orderProductionCancelSub) { this.orderProductionCancelSub.unsubscribe(); }

        // if (this.langSub) { this.langSub.unsubscribe(); }
        // if (this.langListSub) { this.langListSub.unsubscribe(); }
        if (this.intervalTimer) { clearInterval(this.intervalTimer); } // ## pause stop time interval
    }
}

