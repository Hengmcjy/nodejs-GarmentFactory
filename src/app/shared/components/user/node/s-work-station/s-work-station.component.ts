import { Component, ElementRef, OnInit, ViewChild, OnDestroy, AfterViewInit } from '@angular/core';
import { Subscription } from 'rxjs';

import { NodeStationService } from 'src/app/services/node-station.service';
import { SocketIOService } from 'src/app/services/socketio.service';
import { UserService } from 'src/app/services/user.service';

import { Company, Factory } from 'src/app/models/app.model';
import { BundleGroupColorScan, NodeFlow, NodeStation, OrderProductionScan, ScanItem } from 'src/app/models/workstation.model';
import { OrderProduction, ProductionNode } from 'src/app/models/order.model';
import { User } from 'src/app/models/user.model';
import { DialogService } from 'primeng/dynamicdialog';
import { MessageService } from 'primeng/api';
import { GBC } from 'src/app/global/const-global';

@Component({
  selector: 'app-s-work-station',
  templateUrl: './s-work-station.component.html',
  styleUrls: ['./s-work-station.component.scss'],
  providers: [DialogService, MessageService],
})
export class SWorkStationComponent implements OnInit, OnDestroy, AfterViewInit {
    nodeMenuActive = 'getproduct';
    // @ViewChild('input1', {static: false}) scanInputBox: ElementRef;
    @ViewChild('input1', { static: false }) scanInputBox!: ElementRef;

    staff: User = GBC.clrUser();
    nodeStation: NodeStation = GBC.clrNodeStation();
    company: Company = GBC.clrCompany();
    factory: Factory = GBC.clrFactory();
    stationID = '';
    nodeFlows: NodeFlow[] = [];
    nodeFlow: NodeFlow = GBC.clrNodeFlow();
    toNode = '';
    sTypeOtus = '';  // ## b =bundle , 1= 1by 1 / sTypeOtus=scanType
    // orderProduction1: OrderProduction = this.userService.clrOrderProduction();
    // orderProduction2: OrderProduction = this.userService.clrOrderProduction();
    // orderProduction3: OrderProduction = this.userService.clrOrderProduction();
    orderProductionScan1: OrderProductionScan = GBC.clrOrderProductionScan();
    orderProductionScan2: OrderProductionScan = GBC.clrOrderProductionScan();
    orderProductionScanAll: OrderProductionScan = GBC.clrOrderProductionScan();
    scanLimit = 20;
    timeInterval = 2000;
    qtyCount = 0;

    intervalTimer: any;
    // secondTimer = this.userService.secondTimer;
    productBundleGroup: any[] = [];

    productBarcodeNoInput = '';
    nodeIDNext = '';
    stackBarcodeFull = false;
    mustBundleScan = true;
    scan1ForAll = false;
    maxOrderProductionItemScan1 = 0;
    maxOrderProductionItemScan2 = 0;
    fullyItem1 = false;
    fullyItem2 = false;
    clearBtnShow1 = true;
    clearBtnShow2 = true;

    loading = false;


    bundleGroupColorScan: BundleGroupColorScan[] = [];

    visible: boolean = false;
    position: string = 'top-left';
    isShowBundleList: boolean = false;

    private dataNodeStationSub: Subscription = new Subscription;
    private scanOrderProductionBarcodeNoSub: Subscription = new Subscription;
    private scanNextDepCompleteSub: Subscription = new Subscription;
    private orderProductionNextNodeIDSub: Subscription = new Subscription;

    test: any[] = [];


    constructor(
        public dialogService: DialogService,
        public messageService: MessageService,

        public userService: UserService,
        private socketService: SocketIOService,
        private nsService: NodeStationService,
    ) {}

    ngOnInit(): void {
        this.staff = this.nsService.staff;
        this.nodeStation = this.nsService.nodeStation;
        this.company = this.userService.getCompany();
        this.factory = this.userService.getFactory();
        this.stationID = this.nsService.stationID;
        this.nodeFlows = this.nsService.nodeFlows;
        this.nodeFlow = this.nsService.nodeFlow;
        this.bundleGroupColorScan = [...this.nsService.bundleGroupColorScan];

        this.nsService.setMenuActive(this.nodeMenuActive);
        this.nsService.setDataAroundNodeApp('isOutsourceMode', false);

        this.getDataNodeStationUpdatedListener();
        this.addOrderProductionScanAll();
        if (this.nodeStation.nodeInfo.mustBundleScan) { // ## can scan --> bundle
            // console.log('runTimeSetInterval()1');
            this.runTimeSetInterval();
        }

        this.mustBundleScan = this.nodeStation.nodeInfo.mustBundleScan;  // ## y= ต้องสแกนให้ครบมัด(โหล)  n= สแกนโดยไม่สนว่าจะครบมัด(โหล)หรือไม่
        this.scan1ForAll = this.nodeStation.nodeInfo.scan1ForAll; // ## y= สแกน1ตัวแล้วดึงทั้งหมด

        // ## when error to get toNode force to reload page
        this.toNode = this.nsService.findNextNodeID(this.nodeStation.nodeID, this.nodeFlow.flowSeq);
        // console.log(this.nodeStation);
        // console.log(this.toNode);
        // findNextNodeID(fromNode: string, flowSeq: FlowSeq[])
        // console.log(this.nsService.staff);
        // console.log(this.nodeStation, this.scan1ForAll);
        // console.log(this.company);
        // console.log(this.factory);
        // console.log(this.stationID);
        // console.log(this.nodeFlows);
        // console.log(this.nodeFlow);
        // console.log('1245');
        // setInterval(()=>{
        //     console.log('1245');
        // },1000)

    }

    ngAfterViewInit(): void {
        this.scanInputBox.nativeElement.focus(); // ## input setfocus
    }

    barcodeSort() {
        // this.orderProductionScan1.scanItem
        // this.orderProductionScan1.scanItem.sort((a,b)=>{return a.bundleNo >b.bundleNo?1:a.bundleNo <b.bundleNo?-1:0}); // ## เรียง น้อยไปมาก asec
        this.orderProductionScan1.scanItem.sort((a,b)=>{
            return a.bundleNo >b.bundleNo?1:a.bundleNo <b.bundleNo?-1:0
            || a.productBarcodeNo >b.productBarcodeNo?1:a.productBarcodeNo <b.productBarcodeNo?-1:0
        });
    }

    runTimeSetInterval() {
        // console.log('runTimeSetInterval()2');
        if (this.intervalTimer) { clearInterval(this.intervalTimer); } // ## pause stop time interval
        if (this.nodeStation.nodeInfo.mustBundleScan) { // ## can scan --> bundle
            this.intervalTimer = setInterval(() => {
                // ## check bundle psc complete
                if (this.nodeStation.nodeInfo.mustBundleScan) { // ## can scan --> bundle
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
                // console.log('---------- complete -----------------------------');
                if (this.intervalTimer) { clearInterval(this.intervalTimer); } // ## pause stop time interval
                this.setBundleNextNodeID(item);
            }
        });
    }

    setBundleNextNodeID(productBundleGroup: any[]) {
        // console.log('---------- setNextNodeID -----------------------------');
        const orderID = productBundleGroup[0].orderID;
        const productID = productBundleGroup[0].productID;
        const isOutsource = productBundleGroup[0].isOutsource;
        const bundleNo = productBundleGroup[0].bundleNo;

        let productBarcodeNos: string[] = [];
        productBundleGroup.forEach( (item, index) => {
            productBarcodeNos.push(item.productBarcodeNo);
        });

        const productionNode: ProductionNode = {
            factoryID: this.factory.factoryID,
            fromNode: this.nodeStation.nodeID,
            toNode: this.toNode,
            datetime: new Date(),
            status: 'normal',
            info: '',
            sTypeOtus: this.sTypeOtus,
            problemID: '',
            problemName: '',
            isTracking: false,
            isOutsource: isOutsource,
            outsourceData: [],
            createBy: {
                userID: this.nsService.staff.userID,
                userName: this.nsService.staff.uInfo.userName
            }
        }
        this.putOrderProductionNextNodeID(orderID, productID, productBarcodeNos, productionNode, bundleNo);
    }

    set1ProductionNextnodeID(orderID: string, productID: string, productBarcodeNo: string, isOutsource: boolean, bundleNo: number) {
        const productBarcodeNos = [productBarcodeNo];
        const productionNode: ProductionNode = {
            factoryID: this.factory.factoryID,
            fromNode: this.nodeStation.nodeID,
            toNode: this.toNode,
            datetime: new Date(),
            status: 'normal',
            info: '',
            sTypeOtus: this.sTypeOtus,
            problemID: '',
            problemName: '',
            isTracking: false,
            isOutsource: isOutsource,
            outsourceData: [],
            createBy: {
                userID: this.nsService.staff.userID,
                userName: this.nsService.staff.uInfo.userName
            }
        }
        this.putOrderProductionNextNodeID(orderID, productID, productBarcodeNos, productionNode, bundleNo);
    }

    putOrderProductionNextNodeID(orderID: string, productID: string, productBarcodeNos: string[], productionNode: ProductionNode,
                                bundleNo: number) {
        // putOrderProductionNextNodeID(
        //     companyID: string, factoryID: string, orderID: string, productID: string,
        //     productBarcodeNos: string[], productionNode: ProductionNode[]
        // )
        // console.log(this.company.companyID, this.factory.factoryID, this.stationID,
        //     orderID, productID, productBarcodeNos, productionNode,
        //     this.userService.controlApp.clientControl.washingAndPressingMerge);
        this.nsService.putOrderProductionNextNodeID(
            this.company.companyID, this.factory.factoryID, this.stationID,
            orderID, productID, productBarcodeNos, productionNode,
            this.userService.controlApp.clientControl.washingAndPressingMerge
        );
        if (this.orderProductionNextNodeIDSub) { this.orderProductionNextNodeIDSub.unsubscribe(); }
        this.orderProductionNextNodeIDSub = this.nsService.getOrderProductionNextNodeIDUpdatedListener().subscribe((data) => {
            if (this.scan1ForAll) {this.loading = false;}

            // console.log(data);
            // console.log(bundleNo);
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
            if (this.nodeStation.nodeInfo.mustBundleScan) { // ## can scan --> bundle
                this.runTimeSetInterval();
            }
        });
    }

    addOrderProductionScanAll() {
        this.orderProductionScanAll = {
            companyID: this.company.companyID,
            factoryID: this.factory.factoryID,
            nodeID: this.nodeStation.nodeID,
            nodeIDNext: this.nodeIDNext,
            stationID: this.stationID,
            productID: '',
            orderID: '',
            bundleNo: 0,
            bundleCount: 0,
            scanItem: []
        };
    }

    findNodeIDNext() {
        if (this.nodeFlow.companyID !== '') {
            const idx = this.nodeFlow.flowSeq.findIndex(i=>(i.nodeID === this.nodeStation.nodeID));
            if ((+idx + 1) < this.nodeFlow.flowSeq.length) {
                this.nodeIDNext = this.nodeFlow.flowSeq[+idx + 1].nodeID;
            } else {
                // this.nodeIDNext = this.nodeStation.nodeID;  // ## this is last nodeID
                this.nodeIDNext = 'end-process';  // ## this is last nodeID
            }
        }
    }

    addOrderProductionBarcodeNoToTemp(orderProduction: OrderProduction) {
        // console.log(orderProduction );
        this.productBarcodeNoInput = '';
        const bundleNo = orderProduction.bundleNo;
        // orderProductionScan1   orderProductionScan2
        const orderProductionScanL: OrderProductionScan = {
            companyID: this.company.companyID,
            factoryID: this.factory.factoryID,
            nodeID: this.nodeStation.nodeID,
            nodeIDNext: this.nodeIDNext,
            stationID: this.stationID,
            productID: orderProduction.productID,
            orderID: orderProduction.orderID,
            bundleNo: orderProduction.bundleNo,
            bundleCount: orderProduction.productCount,
            scanItem: [
                // {bundleNo: orderProduction.bundleNo, productBarcodeNo: '', status: ''}
            ]
        };
        const scanItem: ScanItem = {
            orderID: orderProduction.orderID,
            productBarcodeNundleCount: orderProduction.productBarcodeNo.substr(0, 32) + orderProduction.bundleNo + orderProduction.productCount,
            productID: orderProduction.productID,
            bundleNo: orderProduction.bundleNo,
            bundleCount: orderProduction.productCount,
            productBarcodeNo: orderProduction.productBarcodeNo,
            productBarcodeNoReal: orderProduction.productBarcodeNoReal,
            // isOutsource: orderProduction.productionNode[orderProduction.productionNode.length - 1].isOutsource,
            isOutsource: false,
            status: 'wait',
            serverCheckState: ''
        };

        // ## add to orderProductionScanAll
        this.orderProductionScanAll.scanItem.unshift(scanItem); // ## add to position first
        this.orderProductionScanAll.scanItem = this.orderProductionScanAll.scanItem.slice(0, this.scanLimit);

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

        if (!this.scan1ForAll) { this.loading = false; }

        // else if (tempID === 'orderProductionScan2') {
        //     const existed = this.orderProductionScan2.scanItem.some(i => i.productBarcodeNo === scanItem.productBarcodeNo);
        //     if (!existed) {
        //         this.orderProductionScan2.scanItem.push(scanItem);
        //         this.fullyItem2 = this.orderProductionScan2.scanItem.length === this.maxOrderProductionItemScan2;
        //     }
        // }
    }

    addNewOrderProductionBarcodeNoToTemp(tempID: string, orderProductionScan: OrderProductionScan, scanItem: ScanItem) {
        // console.log(orderProductionScan );
        if (tempID === 'orderProductionScan1') {
            this.fullyItem1 = false;
            this.maxOrderProductionItemScan1 = orderProductionScan.bundleCount;
            this.orderProductionScan1 = orderProductionScan;
            this.orderProductionScan1.scanItem.push(scanItem);
        } else if (tempID === 'orderProductionScan2') {
            this.fullyItem2 = false;
            this.maxOrderProductionItemScan2 = orderProductionScan.bundleCount;
            this.orderProductionScan2 = orderProductionScan;
            this.orderProductionScan2.scanItem.push(scanItem);
        }
    }

    clearOrderProductionBarcodeNoToTemp(tempID: string) {
        this.qtyCount = 0;
        if (tempID === 'orderProductionScan1') {
            this.fullyItem1 = false;
            this.clearBtnShow1 = true;
            this.maxOrderProductionItemScan1 = 0;
            this.orderProductionScan1 = GBC.clrOrderProductionScan();
        } else if (tempID === 'orderProductionScan2') {
            this.fullyItem2 = false;
            this.clearBtnShow2 = true;
            this.maxOrderProductionItemScan2 = 0;
            this.orderProductionScan2 = GBC.clrOrderProductionScan();
        }
        this.clearBundleGroupColorScan();
    }

    putScanNextDepCompleteOrderProductionBarcodeNo(tempID: string, orderProductionScan: OrderProductionScan) {
        // ## hide btn clear when confirm
        if (tempID === 'orderProductionScan1') {
            this.clearBtnShow1 = false;
        } else if (tempID === 'orderProductionScan2') {
            this.clearBtnShow1 = false;
        }
        this.nsService.putScanNextDepCompleteOrderProductionBarcodeNo(tempID, orderProductionScan);
        if (this.scanNextDepCompleteSub) { this.scanNextDepCompleteSub.unsubscribe(); }
        this.scanNextDepCompleteSub = this.nsService.getScanNextDepOrderProductionBarcodeNoUpdatedListener().subscribe((data) => {
            // console.log(data);
            if (data.tempID === 'orderProductionScan1') {
                this.clearBtnShow1 = true;
            } else if (data.tempID === 'orderProductionScan2') {
                this.clearBtnShow1 = true;
            }

            if (data.success) {
                this.clearOrderProductionBarcodeNoToTemp(data.tempID);
            } else {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error [ ' + data.message.messageID + ' ]',
                    detail: data.message.value + ' [ '+data.message.mode+' ] ',
                    sticky: true,
                });
            }
        });
    }

    putScanOrderProductionBarcodeNo(productBarcodeNo: string, mode: string) {

        this.scanInputBox.nativeElement.focus(); // ## input setfocus
        this.scanInputBox.nativeElement.select();
        // putScanOrderProductionBarcodeNo(userID: string, companyID: string, factoryID: string,
        //                                  productBarcodeNo: string, nodeID: string, stationID: string)
        // console.log(productBarcodeNo);
        if (productBarcodeNo !== '') {
            this.loading = true;
            this.nsService.putScanOrderProductionBarcodeNo(
                this.staff.userID, this.company.companyID, this.factory.factoryID, productBarcodeNo,
                this.nodeStation.nodeID, this.stationID, mode, this.scan1ForAll
            );
            if (this.scanOrderProductionBarcodeNoSub) { this.scanOrderProductionBarcodeNoSub.unsubscribe(); }
            this.scanOrderProductionBarcodeNoSub = this.nsService.getScanOrderProductionBarcodeNoUpdatedListener().subscribe((data) => {
                // console.log(data);

                if (data.success) {
                    // console.log(data);
                    // const productBarcodeNo = productBarcodeNo;
                    const orderProduct = data.orderProduction;
                    const orderProducts = data.orderProducts;
                    // this.loading = false;
                    if (this.scan1ForAll === false && data.orderProduction.productStatus === 'normal' ) {
                        this.qtyCount = +this.qtyCount + 1;
                        this.addOrderProductionBarcodeNoToTemp(data.orderProduction);
                        this.showDialogBundleLog(productBarcodeNo, orderProduct, orderProducts);
                    } else if(this.scan1ForAll === true && data.orderProduction.productStatus === 'normal') {
                        this.qtyCount = +this.qtyCount + data.orderProductions.length;
                        data.orderProductions.forEach( (item, index) => {
                            this.addOrderProductionBarcodeNoToTemp(item);
                        });
                        this.showDialogBundleLog(productBarcodeNo, orderProduct, orderProducts);

                    } else if(data.orderProduction.productStatus === 'repaired') {
                        this.qtyCount = +this.qtyCount + 1;
                        this.addOrderProductionBarcodeNoToTemp(data.orderProduction);
                        this.showDialogBundleLog(productBarcodeNo, orderProduct, orderProducts);
                    } else {
                        this.visible = false;
                        this.loading = false;
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Error [ Product has problem ]',
                            detail: ' [ please send back product in problem process step ] ',
                            sticky: false,
                        });
                    }

                } else {
                    // console.log('this.loading = false;');
                    this.loading = false;
                    this.visible = false;
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

                    // ## add to orderProductionScanAll
                    this.orderProductionScanAll.scanItem.unshift(scanItem); // ## add to position first
                    this.orderProductionScanAll.scanItem = this.orderProductionScanAll.scanItem.slice(0, this.scanLimit);

                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error [ ' + data.message.messageID + ' ]',
                        detail: data.message.value + ' [ '+data.message.mode+' ] ',
                        sticky: false,
                    });
                }
            });
        }
    }

    getDataNodeStationUpdatedListener() {
        // this.nsService.getDataNodeStationUpdatedListener()
        this.findNodeIDNext();
        if (this.dataNodeStationSub) { this.dataNodeStationSub.unsubscribe(); }
        this.dataNodeStationSub = this.nsService.getDataNodeStationUpdatedListener().subscribe((data) => {
            // console.log(data);
            this.nodeStation = data.nodeStation;
            this.company = data.company;
            this.factory = data.factory;
            this.stationID = this.nsService.stationID;
            this.nodeFlows = data.nodeFlows;
            this.nodeFlow = data.nodeFlow;
            this.findNodeIDNext();
            // console.log(this.nodeStation);
            // console.log(this.company);
            // console.log(this.factory);
            // console.log(this.stationID);
            // console.log(this.nodeFlows);
            // console.log(this.nodeFlow);
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

    newScan() {
        this.loading = false;
        this.scanInputBox.nativeElement.focus(); // ## input setfocus
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
        // if (this.isShowBundleList) {
        //     this.visible = false;
        // }
        this.visible = this.isShowBundleList;
    }

    ngOnDestroy(): void {
        if (this.dataNodeStationSub) { this.dataNodeStationSub.unsubscribe(); }
        if (this.scanOrderProductionBarcodeNoSub) { this.scanOrderProductionBarcodeNoSub.unsubscribe(); }
        if (this.scanNextDepCompleteSub) { this.scanNextDepCompleteSub.unsubscribe(); }
        if (this.orderProductionNextNodeIDSub) { this.orderProductionNextNodeIDSub.unsubscribe(); }

        // if (this.langSub) { this.langSub.unsubscribe(); }
        // if (this.langListSub) { this.langListSub.unsubscribe(); }
        // if (this.getUserNodeLoginWaitSub) { this.getUserNodeLoginWaitSub.unsubscribe(); }
        // if (this.darkSub) { this.darkSub.unsubscribe(); }
        // if (this.errSub) { this.errSub.unsubscribe(); }
        // if (this.authSub) { this.authSub.unsubscribe(); }
        // if (this.screenSub) { this.screenSub.unsubscribe(); }
        // if (this.screenSizeSub) { this.screenSizeSub.unsubscribe(); }

        if (this.intervalTimer) { clearInterval(this.intervalTimer); } // ## pause stop time interval
    }
}
