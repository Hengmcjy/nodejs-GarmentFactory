import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { DialogService } from 'primeng/dynamicdialog';
import { MessageService } from 'primeng/api';

import { GBC } from 'src/app/global/const-global';
import { Company, CreateBy, Factory } from 'src/app/models/app.model';
import { BundleGroupColorScan, FlowSeq, NodeFlow, NodeStation, OrderProductionReceiveOutsourceScan, ScanItem, ScanItemOutsourece } from 'src/app/models/workstation.model';
import { NodeStationService } from 'src/app/services/node-station.service';
import { UserService } from 'src/app/services/user.service';
import { SOutsourceSelectnodeComponent } from '../s-outsource-selectnode/s-outsource-selectnode.component';
import { User } from 'src/app/models/user.model';
import { OrderProduction, OutsourceData, ProductionNode } from 'src/app/models/order.model';
import { SmdConfirmImportantTaskComponent } from '../../../general/smd-confirm-important-task/smd-confirm-important-task.component';

@Component({
    selector: 'app-s-outsource-receive',
    templateUrl: './s-outsource-receive.component.html',
    styleUrls: ['./s-outsource-receive.component.scss'],
    providers: [DialogService, MessageService],
})
export class SOutsourceReceiveComponent implements OnInit, OnDestroy {
    @ViewChild('input1', { static: false }) scanInputBox!: ElementRef;

    nodeMenuActive = 'receive-outsource';  // receive-outsource
    formName = this.nodeMenuActive;

    intervalTimer: any;
    timeInterval = 2000;
    productBundleGroup: any[] = [];

    nodeStations: NodeStation[] = [];
    staff: User = GBC.clrUser();
    nodeStation: NodeStation = GBC.clrNodeStation();
    company: Company = GBC.clrCompany();
    factory: Factory = GBC.clrFactory();
    nodeFlow: NodeFlow = GBC.clrNodeFlow();
    flowSeq: FlowSeq[] = [];
    stationID = '';
    companyID = '';
    factoryID = '';
    nodeID = '';
    sTypeOtus = 'b';  // ## b =bundle , 1= 1by 1 / sTypeOtus=scanType
    isOutsource = true;
    mustBundleScan = true; //  false = for scan individual
    cancelReceiveMode = false; // ## true = we want to cancel the product whice received
    cancelCount = 0;

    bundleGroupColorScan: BundleGroupColorScan[] = [];
    bundleNoScan: number[] = [];
    productBarcodeNos: string[] = [];

    // ## outsource
    flowSeqOutsourceSelect: FlowSeq[] = [];

    productBarcodeNoInput = '';
    stackBarcodeFull = false;
    orderProductionScan1: OrderProductionReceiveOutsourceScan = GBC.clrOrderProductionReceiveOutsourceScan();

    orderProducts: OrderProduction[] = [];
    position: string = 'top-left';
    visible: boolean = false;
    isShowBundleList: boolean = false;


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
        this.nsService.setDataAroundNodeApp('isOutsourceMode', true);
        this.nsService.outsourceModeName = 'RECEIVE';

        this.staff = this.nsService.staff;
        this.nodeStation = this.nsService.nodeStation;
        this.company = this.userService.getCompany();
        this.factory = this.userService.getFactory();
        this.stationID = this.nsService.stationID;
        this.nodeFlow = this.nsService.nodeFlow;
        this.flowSeq = this.nodeFlow.flowSeq;
        this.bundleGroupColorScan = [...this.nsService.bundleGroupColorScan];

        // this.nodeStations = [...this.nsService.nodeStations];
        // this.nodeFlows = this.nsService.nodeFlows;
        // this.nodeFlow = this.nsService.nodeFlow;
        // console.log(this.nodeFlow );
        // console.log(this.staff );
        // console.log(this.nodeStations );
        // console.log(this.nsService.nodeFlow);

        // this.nsService.nodeMenuActive = this.nodeMenuActive;
        // console.log(this.nsService.staff);
        // this.allProductQty = this.nsService.allProductQty;
        // this.totalBundle = this.nsService.totalBundle;
        // this.countOrderID = this.nsService.countOrderID;
        // this.countProductID = this.nsService.countProductID;

        // this.durationRefreshHomePage = this.nsService.durationRefreshHomePage;

        this.companyID = this.company.companyID;
        this.factoryID = this.factory.factoryID;
        this.nodeID = this.nodeStation.nodeID;
        // this.mustBundleScan = this.nsService.getNodeMustBundleScan(this.nodeID);

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

    changeSType() { // ## b =bundle , 1= 1by 1 / sType=scanType
        if (this.sTypeOtus === 'b') {
            this.sTypeOtus = '1';
        } else {
            this.sTypeOtus = 'b';
        }
        this.mustBundleScan = this.sTypeOtus==='b'; // ## b =bundle , 1= 1by 1 / sType=scanType
    }

    cancelReceive() {
        // console.log('cancelReceiveMode');
        this.cancelReceiveMode = true;
    }

    runTimeSetInterval() {
        // console.log('runTimeSetInterval()2');
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
        let scanItem = [...this.orderProductionScan1.scanItemOutsourece];
        this.productBundleGroup = this.userService.groupBy(scanItem, (c: any) => c.productBarcodeNundleCount);
        // console.log(this.productBundleGroup);
        this.productBundleGroup = Object.values(this.productBundleGroup);
        // console.log(this.productBundleGroup);

        this.productBundleGroup.forEach( (item, index) => {
            if (item.length === item[0].bundleCount) {
                // console.log('---------- complete -----------------------------');
                if (this.intervalTimer) { clearInterval(this.intervalTimer); } // ## pause stop time interval
                this.setBundleNextNodeID(item);
            }
        });
    }

    getProductionNodeArr(outsourceData: OutsourceData[]) {
        const isOutsource = this.isOutsource;
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
            if (+item.seqNo === 1) {

                // // ## first element
                // fromNode = 'starterNode';
                // toNode = this.flowSeq[0].nodeID;
                // productionNode.push(this.genProductionNodeTemp(fromNode, toNode, 'normal', '', '', isOutsource, outsourceData, createBy));

                // ## second element
                fromNode = this.flowSeq[0].nodeID;
                toNode = this.flowSeq[1].nodeID;
                productionNode.push(this.genProductionNodeTemp(fromNode, toNode, 'normal', '', '', isOutsource, outsourceData, createBy));
            } else {
                const idx = this.flowSeq.findIndex( fi =>(fi.nodeID === item.nodeID));
                fromNode = this.flowSeq[idx].nodeID;
                toNode = this.flowSeq[idx + 1].nodeID;
                // toNode = item.nodeID;
                productionNode.push(this.genProductionNodeTemp(fromNode, toNode, 'normal', '', '', isOutsource, outsourceData, createBy));
            }
        });
        return productionNode;
    }

    setBundleNextNodeID(productBundleGroup: any[]) {
        // console.log('---------- setNextNodeID -----------------------------');
        const orderID = productBundleGroup[0].orderID;
        const productID = productBundleGroup[0].productID;
        const isOutsource = this.isOutsource;
        const bundleNo = productBundleGroup[0].bundleNo;
        const outsourceData: OutsourceData[] = [{
            factoryID: productBundleGroup[0].factoryIDForm,
            fromFactoryID: this.factory.factoryID,  // ## back to factoryID
            datetime: new Date()
        }];
        const createBy: CreateBy = {
            userID: this.nsService.staff.userID,
            userName: this.nsService.staff.uInfo.userName
        };

        let productBarcodeNos: string[] = [];
        productBundleGroup.forEach( (item, index) => {
            productBarcodeNos.push(item.productBarcodeNo);
        });
        // console.log(productBarcodeNos);

        // console.log(this.flowSeqOutsourceSelect);
        // console.log(this.nsService.nodeStations);
        // console.log(this.nsService.nodeFlow);

        let productionNode: ProductionNode[] = this.getProductionNodeArr(outsourceData);
        this.putOutsourceOrderProductionNextNodeID(orderID, productID, productBarcodeNos, productionNode, bundleNo);
    }

    set1ProductionNextnodeID(factoryIDForm: string, orderID: string, productID: string, productBarcodeNo: string,
                            isOutsource: boolean, bundleNo: number) {
        console.log('set1ProductionNextnodeID');
        const productBarcodeNos = [productBarcodeNo];
        const outsourceData: OutsourceData[] = [{
            factoryID: factoryIDForm,
            fromFactoryID: this.factory.factoryID,  // ## from factoryID
            datetime: new Date()
        }];
        const createBy: CreateBy = {
            userID: this.nsService.staff.userID,
            userName: this.nsService.staff.uInfo.userName
        };
        let productionNode: ProductionNode[] = this.getProductionNodeArr(outsourceData);
        this.putOutsourceOrderProductionNextNodeID(orderID, productID, productBarcodeNos, productionNode, bundleNo);

        // let productionNode: ProductionNode[] = [{
        //     fromNode: this.nodeStation.nodeID,
        //     toNode: this.toNode,
        //     datetime: new Date(),
        //     status: 'normal',
        //     problemID: '',
        //     problemName: '',
        //     isOutsource: isOutsource,
        //     outsourceData: [],
        //     createBy: createBy
        // }];
    }

    putOutsourceOrderProductionNextNodeID(orderID: string, productID: string, productBarcodeNos: string[],
        productionNode: ProductionNode[], bundleNo: number) {
        // console.log('putOutsourceOrderProductionNextNodeID');
        console.log(this.company.companyID, this.factory.factoryID, orderID, productID, productBarcodeNos, productionNode);
        this.nsService.putOutsourceOrderProductionNextNodeID(
            this.company.companyID, this.factory.factoryID, orderID, productID, productBarcodeNos, productionNode
        );
        if (this.orderProductionNextNodeIDSub) { this.orderProductionNextNodeIDSub.unsubscribe(); }
        this.orderProductionNextNodeIDSub = this.nsService.getOrderProductionNextNodeIDUpdatedListener().subscribe((data) => {
            // console.log(data);
            // console.log(bundleNo);
            if (data.success) {
                this.updatebundleScanned(bundleNo);
                this.updateQtyScanned(productBarcodeNos);
                this.clearBundleGroupColorScan1(bundleNo);

                // ## clear data @ this.orderProductionScan1.scanItem
                let productBarcodeNosArr = data.productBarcodeNos;
                productBarcodeNosArr.forEach( (item, index) => {
                    // const index1= this.orderProductionScan1.scanItem.indexOf(item);
                    const idx = this.orderProductionScan1.scanItemOutsourece.findIndex(i=>(i.productBarcodeNo === item));
                    if (idx !== -1) {
                        this.orderProductionScan1.scanItemOutsourece.splice(idx, 1);
                    }
                });
                if (this.mustBundleScan) { // ## can scan --> bundle
                    this.runTimeSetInterval();
                }
                this.messageService.add({
                    severity:'success',
                    summary:'receive completed successfully',
                    detail:'receive completed',
                    sticky: false
                });
            } else {
                this.clearOrderProductionBarcodeNoToTemp();
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error [ Product has problem ]',
                    detail: ' [ please send back product in problem process step ] ',
                    sticky: false,
                });
            }
        });
    }

    genProductionNodeTemp(fromNode: string, toNode: string, status: string, problemID: string, problemName: string,
                            isOutsource: boolean, outsourceData: OutsourceData[], createBy: CreateBy) {
        const productionNode: ProductionNode = {
            factoryID: outsourceData[0].factoryID,  // ## factory who did
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
        // console.log(productBarcodeNos);
        // console.log([].concat(this.productBarcodeNos, productBarcodeNos));
        // console.log([...this.productBarcodeNos, ...productBarcodeNos]);
        // this.productBarcodeNos.push();
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
        this.cancelReceiveMode = false;
        this.cancelCount = 0;
        this.clearbundleScanned();
        this.clearQtyScanned();
        this.clearflowSeqOutsourceSelect();
    }

    putScanOrderProductionBarcodeNoReceiveOutsource(productBarcodeNo: string, mode: string) {
        if (!this.cancelReceiveMode) {

            // ## mode = "scan-receive-outsource"
            this.scanInputBox.nativeElement.focus(); // ## input setfocus
            this.scanInputBox.nativeElement.select();
            // putScanOrderProductionBarcodeNo(userID: string, companyID: string, factoryID: string,
            //                                  productBarcodeNo: string, nodeID: string, stationID: string)
            // console.log(productBarcodeNo);
            this.nsService.putScanOrderProductionBarcodeNoReceiveOutsource(
                this.staff.userID, this.company.companyID, this.factory.factoryID, productBarcodeNo,
                this.nodeStation.nodeID, this.stationID, mode
            );
            if (this.scanOrderProductionBarcodeNoSub) { this.scanOrderProductionBarcodeNoSub.unsubscribe(); }
            this.scanOrderProductionBarcodeNoSub = this.nsService.getScanOrderProductionBarcodeNoOutsourceUpdatedListener().subscribe((data) => {
                // console.log(data);
                if (data.success) {
                    // this.visible = false;
                    if (data.orderProduction.productStatus === 'normal' && data.orderProduction.productionNode[0].isOutsource) {
                        this.addOrderProductionBarcodeNoToTemp(data.orderProduction);
                        // console.log('ok');
                        this.showDialogBundleLog(productBarcodeNo, data.orderProduction, data.orderProducts);
                    } else {
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Error [ Product has problem ]',
                            detail: ' [ please send back product in problem process step ] ',
                            sticky: false,
                        });
                    }
                } else {
                    // this.visible = false;
                    // this.isShowBundleList = false;
                    // this.addOrderProductionBarcodeNoToTemp(data.orderProduction);
                    this.productBarcodeNoInput = '';
                    const scanItem: ScanItem = {
                        orderID: '',
                        productBarcodeNundleCount: '',
                        productID: '',
                        bundleNo: 0,
                        bundleCount: 0,
                        productBarcodeNo: productBarcodeNo,
                        productBarcodeNoReal: productBarcodeNo,
                        isOutsource: false,
                        status: 'err',
                        serverCheckState: ''
                    };

                    // // ## add to orderProductionScanAll
                    // this.orderProductionScanAll.scanItem.unshift(scanItem); // ## add to position first
                    // this.orderProductionScanAll.scanItem = this.orderProductionScanAll.scanItem.slice(0, this.scanLimit);

                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error [ ' + data.message.messageID + ' ]',
                        detail: data.message.value + ' [ '+data.message.mode+' ] ',
                        sticky: false,
                    });
                }
            });
        } else {  // ## cancel received mode
            this.putCancelOutsourceOrderProductionReceived([productBarcodeNo]);
        }
    }

    putCancelOutsourceOrderProductionReceived(productBarcodeNos: string[]) {
        // putCancelOutsourceOrderProductionReceived(companyID: string, productBarcodeNos: string[])
        // this.productBarcodeNos = [];
        this.nsService.putCancelOutsourceOrderProductionReceived(this.company.companyID, productBarcodeNos);
        if (this.orderProductionCancelSub) { this.orderProductionCancelSub.unsubscribe(); }
        this.orderProductionCancelSub = this.nsService.getOrderProductionReceivedCancelledUpdatedListener().subscribe((data) => {
            this.productBarcodeNoInput = '';
            if (data.success) {
                this.cancelCount++;
                this.messageService.add({
                    severity:'success',
                    summary:'Cancel completed successfully',
                    detail:'completed',
                    sticky: false
                });
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

    addOrderProductionBarcodeNoToTemp(orderProduction: OrderProduction) {
        // console.log(orderProduction );
        this.productBarcodeNoInput = '';
        const bundleNo = orderProduction.bundleNo;
        // orderProductionScan1   orderProductionScan2
        const orderProductionScanL: OrderProductionReceiveOutsourceScan = {
            companyID: this.company.companyID,
            factoryID: this.factory.factoryID,
            nodeID: this.nodeStation.nodeID,
            nodeIDNext: '',
            stationID: this.stationID,
            productID: orderProduction.productID,
            orderID: orderProduction.orderID,
            bundleNo: orderProduction.bundleNo,
            bundleCount: orderProduction.productCount,
            scanItemOutsourece: [
                // {bundleNo: orderProduction.bundleNo, productBarcodeNo: '', status: ''}
            ]
        };

        // const outsFactoryID = orderProduction.outsourceData && orderProduction.outsourceData.length > 0
        //     ? orderProduction.outsourceData[orderProduction.outsourceData.length - 1].factoryID
        //     : '';

        const outsFactoryID = orderProduction.productionNode[0].outsourceData[0] && orderProduction.productionNode.length > 0
                    && orderProduction.productionNode[0].outsourceData.length > 0
            ? orderProduction.productionNode[0].outsourceData[0].factoryID
            : '';

        const scanItemOutsourece: ScanItemOutsourece = {
            factoryIDForm: outsFactoryID,
            orderID: orderProduction.orderID,
            productBarcodeNundleCount: orderProduction.productBarcodeNo.substr(0, 32) + orderProduction.bundleNo + orderProduction.productCount,
            productID: orderProduction.productID,
            bundleNo: orderProduction.bundleNo,
            bundleCount: orderProduction.productCount,
            productBarcodeNo: orderProduction.productBarcodeNo,
            productBarcodeNoReal: orderProduction.productBarcodeNo,
            isOutsource: orderProduction.productionNode[orderProduction.productionNode.length - 1].isOutsource,
            outsourceData: orderProduction.outsourceData ? orderProduction.outsourceData : [],
            status: 'wait',
            serverCheckState: ''
        };

        // this.addNewOrderProductionBarcodeNoToTemp('orderProductionScan1', orderProductionScanL, scanItem);
        this.addScanItem('orderProductionScan1', scanItemOutsourece);
        // console.log(scanItemOutsourece);
    }

    addScanItem(tempID: string, scanItemOutsourece: ScanItemOutsourece) {
        if (tempID === 'orderProductionScan1') {
            const factoryIDFrom = scanItemOutsourece.factoryIDForm;
            // console.log(this.orderProductionScan1.scanItem.length , '   ', this.maxOrderProductionItemScan1);
            const existed = this.orderProductionScan1.scanItemOutsourece.some(i => i.productBarcodeNo === scanItemOutsourece.productBarcodeNo);
            if (!existed) {
                this.orderProductionScan1.scanItemOutsourece.push(scanItemOutsourece);
                this.updateBundleGroupColorScan(scanItemOutsourece.bundleNo);
                // this.fullyItem1 = this.orderProductionScan1.scanItem.length === this.maxOrderProductionItemScan1;
                // console.log(this.orderProductionScan1 );
                if (!this.mustBundleScan) { // ## 1  by 1
                    this.set1ProductionNextnodeID(factoryIDFrom, scanItemOutsourece.orderID, scanItemOutsourece.productID,
                        scanItemOutsourece.productBarcodeNo, scanItemOutsourece.isOutsource, scanItemOutsourece.bundleNo);
                }
            }
        }
        // else if (tempID === 'orderProductionScan2') {
        //     const existed = this.orderProductionScan2.scanItem.some(i => i.productBarcodeNo === scanItem.productBarcodeNo);
        //     if (!existed) {
        //         this.orderProductionScan2.scanItem.push(scanItem);
        //         this.fullyItem2 = this.orderProductionScan2.scanItem.length === this.maxOrderProductionItemScan2;
        //     }
        // }
    }

    clearOrderProductionBarcodeNoToTemp() {
        // if (tempID === 'orderProductionScan1') {
        //     this.fullyItem1 = false;
        //     this.clearBtnShow1 = true;
        //     this.maxOrderProductionItemScan1 = 0;
        //     this.orderProductionScan1 = GBC.clrOrderProductionScan();
        // } else if (tempID === 'orderProductionScan2') {
        //     this.fullyItem2 = false;
        //     this.clearBtnShow2 = true;
        //     this.maxOrderProductionItemScan2 = 0;
        //     this.orderProductionScan2 = GBC.clrOrderProductionScan();
        // }
        this.orderProductionScan1 = GBC.clrOrderProductionReceiveOutsourceScan();
        this.clearBundleGroupColorScan();
    }

    barcodeSort() {
        // this.orderProductionScan1.scanItem
        // this.orderProductionScan1.scanItem.sort((a,b)=>{return a.bundleNo >b.bundleNo?1:a.bundleNo <b.bundleNo?-1:0}); // ## เรียง น้อยไปมาก asec
        this.orderProductionScan1.scanItemOutsourece.sort((a,b)=>{
            return a.bundleNo >b.bundleNo?1:a.bundleNo <b.bundleNo?-1:0
            || a.productBarcodeNo >b.productBarcodeNo?1:a.productBarcodeNo <b.productBarcodeNo?-1:0
        });
    }

    clearflowSeqOutsourceSelect() {
        this.flowSeqOutsourceSelect = [];
        // this.mustBundleScan = true;
        this.mustBundleScan = this.sTypeOtus==='b'; // ## b =bundle , 1= 1by 1 / sType=scanType
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
                // console.log(this.flowSeqOutsourceSelect);

                // ## dont need to check mustBundleScan / it always this.mustBundleScan = false;
                this.mustBundleScan =
                    this.nsService.getNodeMustBundleScan(this.flowSeqOutsourceSelect[this.flowSeqOutsourceSelect.length - 1].nodeID);
                // ## it always this.mustBundleScan = false;
                // this.mustBundleScan = false;
                if (this.mustBundleScan) {
                    this.sTypeOtus = 'b';
                } else {
                    this.sTypeOtus = '1';
                }
            }
            if (this.mustBundleScan) {
                this.sTypeOtus = 'b';
            } else {
                this.sTypeOtus = '1';
            }
        });
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

    showDialogBundleLog(productBarcodeNo: string, orderProduct:OrderProduction, orderProducts:OrderProduction[]) {
        // this.position = position;
        if (this.isShowBundleList) {
            this.visible = true;
            this.nsService.setDatarecordProductBarcodeNoUpdated(productBarcodeNo, orderProduct, orderProducts);
        } else {
            this.visible = false;
        }
    }

    setVisible() {
        this.visible = this.isShowBundleList;
    }

    inputUserPassPopup() {
        const ref = this.dialogService.open(SmdConfirmImportantTaskComponent, {
            data: {
                id: 'sType-switch',
                mode: 'sType-switch',
            },
            header: 'Confirmation for change Scanning type',
            width: '30%'
        });

        ref.onClose.subscribe((data: any) => {
            // console.log(data);
            // console.log(this.canScanNode);
            // console.log(this.canScanSubNode);

            // console.log('showStaffLoginModal OK'); canScanSubNode

            // ## mode === 'cancelOrderQueue'
            if (data) {
                if (data.mode && data.mode === 'sType-switch' && data.success) {
                    // console.log(data);
                    this.changeSType();
                    // this.getRepCompanyOrderOutsource('refresh');
                    // console.log(orderProductionQueueList);
                    // this.deleteOrderProductionQueuesCancel(orderProductionQueueList);
                } else {

                }
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
