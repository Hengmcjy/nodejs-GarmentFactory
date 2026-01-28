import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import { Subscription } from 'rxjs';
import { GBC } from 'src/app/global/const-global';
import { Company, Factory } from 'src/app/models/app.model';
import { User } from 'src/app/models/user.model';
import { NodeStationService } from 'src/app/services/node-station.service';
import { UserService } from 'src/app/services/user.service';
import { SmdNodeSubnodeSelectComponent } from '../smd-node-subnode-select/smd-node-subnode-select.component';
import { OrderProduction, OrderProductionQueueBundleNo, OrderSubNodeFlowCost, SubNodeFlow, SubNodeFlowCost } from 'src/app/models/order.model';
import { BundleGroupColorScan, NodeStation, OrderProductionScan, ScanItem, SubNodeflowC } from 'src/app/models/workstation.model';
import { SmdRepSubnodeScannedComponent } from '../../../rep/company/smd-rep-subnode-scanned/smd-rep-subnode-scanned.component';

@Component({
    selector: 'app-s-node-scan-sub-process',
    templateUrl: './s-node-scan-sub-process.component.html',
    styleUrls: ['./s-node-scan-sub-process.component.scss'],
    providers: [DialogService, MessageService, ConfirmationService],
})
export class SNodeScanSubProcessComponent implements OnInit, OnDestroy, AfterViewInit {
    @ViewChild('input1', { static: false }) scanInputBox!: ElementRef;
    @ViewChild('input2', { static: false }) scanInputBox2!: ElementRef;
    @ViewChild('input3', { static: false }) scanInputBox3!: ElementRef;

    nodeMenuActive = 'scan-subnode';  //
    formName = this.nodeMenuActive;
    userImageProfileGCSPath = GBC.userImageProfileGCSPath;  // ## google storage path user image profile

    blockUI = false;

    company: Company = GBC.clrCompany();
    factory: Factory = GBC.clrFactory();
    nodeStation: NodeStation = GBC.clrNodeStation();
    staffSelect: User = GBC.clrUser();
    nodeID = '';
    stationID = '';

    orderSubNodeFlowCost: OrderSubNodeFlowCost = GBC.clrOrderSubNodeFlowCost();
    subNodeFlowCost: SubNodeFlowCost[] = [];
    subNodeFlowCostSelect: SubNodeFlowCost[] = [];
    subNodeflowC: SubNodeflowC[] = [];
    orderProductionQueueBundleNo: OrderProductionQueueBundleNo = GBC.clrOrderProductionQueueBundleNo();

    mustBundleScan = true;
    productBarcodeNos: string[] = [];
    staffID = '';
    tokenScan: string = '';

    orderProductions: OrderProduction[] = [];
    getOrderProductionLoading = false; // ## true= loading , false= not loading or loaded
    productBarcodeNoInput = '';
    orderProductionScan1: OrderProductionScan = GBC.clrOrderProductionScan();
    bundleGroupColorScan: BundleGroupColorScan[] = [];
    subNodeFlow: SubNodeFlow[] = [];
    productBarcodeNoS2: string[] = [];
    checkListComplete = false;
    statusScan1: string[] = [];

    orderID = '';
    orderIDOld = '';
    zone = '';
    color = '';
    colorCode = '';
    size = '';
    bundleNo = 0;
    productBarcode = '';
    productCount = 0;
    numberFrom = 0;
    numberTo = 0;


    private workerInfoSub: Subscription = new Subscription;
    private subNodeFlowCostSub: Subscription = new Subscription;
    private orderProductionQueueByBundleNo1Sub: Subscription = new Subscription;
    private orderProductionsSub: Subscription = new Subscription;
    private orderProductionQueueByProductBarcodeNoSub: Subscription = new Subscription;
    private editAddOrderProductionSubNodeFlowSub: Subscription = new Subscription;



    constructor(
        public dialogService: DialogService,
        public messageService: MessageService,
        private confirmationService: ConfirmationService,
        // private router: Router,

        public userService: UserService,
        // private productService: ProductService,
        // private socketService: SocketIOService,
        public nsService: NodeStationService,
        // private repService: ReportService,
    ) {}

    ngOnInit(): void {
        // window.location.reload();  // ## test reload page
        this.nsService.setMenuActive(this.nodeMenuActive);
        this.nsService.setDataAroundNodeApp('isScanSubnode', true);

        this.company = this.userService.getCompany();
        this.factory = this.userService.getFactory();
        this.nodeStation = this.nsService.nodeStation;
        this.nodeID = this.nodeStation.nodeID;
        this.stationID = this.nsService.stationID;
        this.subNodeflowC = this.nsService.subNodeflowC;
        this.bundleGroupColorScan = [...this.nsService.bundleGroupColorScan];


        // console.log(this.subNodeflowC);

        this.autoAddSelectSubNodeFlow();

    }

    ngAfterViewInit(): void {
        this.scanInputBox.nativeElement.focus(); // ## input setfocus
    }

    putScanOrderProductionBarcodeNoSubNode(productBarcodeNo: string, mode: string) {

    }

    autoAddSelectSubNodeFlow() {
        // ## auto select when node have only one subNode
        const subNodeflowCF = this.subNodeflowC.filter(fi => fi.nodeID === this.nodeID);
        if (subNodeflowCF.length === 1 && this.nodeStation.nodeInfo.haveSubWorkflow) {
            this.subNodeFlowCostSelect = [];
            this.subNodeFlowCostSelect.push({
                seq: subNodeflowCF[0].seq,
                nodeID: subNodeflowCF[0].nodeID,
                subNodeID: subNodeflowCF[0].subNodeID,
                cost: 0,
                subNodeFlowTypeID: '',
            });
        }
    }

    barcodeSort() {
        // this.orderProductionScan1.scanItem
        // this.orderProductionScan1.scanItem.sort((a,b)=>{return a.bundleNo >b.bundleNo?1:a.bundleNo <b.bundleNo?-1:0}); // ## เรียง น้อยไปมาก asec
        this.orderProductionScan1.scanItem.sort((a,b)=>{
            return a.bundleNo >b.bundleNo?1:a.bundleNo <b.bundleNo?-1:0
            || a.productBarcodeNo >b.productBarcodeNo?1:a.productBarcodeNo <b.productBarcodeNo?-1:0
        });
    }

    getColorBundleGroupColorScan(bundleNo: number): string {
        const BundleGroupColorScanF = this.bundleGroupColorScan.filter(i=>(i.bundleNo === bundleNo));
        if (BundleGroupColorScanF.length > 0) {
            return BundleGroupColorScanF[0].color;
        }
        return '';
    }

    clearBundleGroupColorScan() {
        this.bundleGroupColorScan = [...this.nsService.bundleGroupColorScan];
    }

    async getDataFromBarcode(barcode: string) {
        this.zone = '';
        this.color = '';
        this.colorCode = '';
        this.size = '';
        const data: any = await this.userService.getDataFromBarcode(barcode);
        // console.log(data);
        this.zone = data.zone;
        this.color = this.userService.getColorNameByColorCode(data.color1, this.orderSubNodeFlowCost.orderColor[0].setName);
        this.colorCode = this.userService.getCodeColorNameByColorCode(data.color1, this.orderSubNodeFlowCost.orderColor[0].setName);
        this.size = data.size;

    }

    // ## in case get by orderID and bundleNo
    // ## just scan sub node / not scan for next nodeID
    addOrderProductionBarcodeNoToTempByORIDBunNo(orderProductions: OrderProduction[]) {
        const productID = orderProductions[0].productID?orderProductions[0].productID:'';
        this.orderProductionScan1 = {
            companyID: this.company.companyID,
            factoryID: this.factory.factoryID,
            nodeID: this.nodeStation.nodeID,
            nodeIDNext: '',
            stationID: this.stationID,
            productID: productID,
            orderID: this.orderID,
            bundleNo: this.bundleNo,
            bundleCount: this.productCount,
            scanItem: [
                // {bundleNo: orderProduction.bundleNo, productBarcodeNo: '', status: ''}
            ]
        };
        this.addScanItem(orderProductions);
    }

    addScanItem(orderProductions: OrderProduction[]) {
        // console.log(orderProductions);
        orderProductions.forEach( (item, index) => {
            const scanItem: ScanItem = {
                orderID: this.orderID,
                productBarcodeNundleCount: item.productBarcodeNo.substr(0, 32) + item.bundleNo + item.productCount,
                productID: item.productID,
                bundleNo: item.bundleNo,
                bundleCount: item.productCount,
                productBarcodeNo: item.productBarcodeNoReal,
                productBarcodeNoReal: item.productBarcodeNoReal,
                // isOutsource: orderProduction.productionNode[orderProduction.productionNode.length - 1].isOutsource,
                isOutsource: false,
                status: 'wait',
                serverCheckState: ''
            };
            this.orderProductionScan1.scanItem.push(scanItem);
        });

    }

    genStaffSubNodeFlow() {
        // console.log('genStaffSubNodeFlow');
        this.subNodeFlow = [];


        // console.log(this.orderProductions);
        // console.log(this.subNodeFlowCostSelect);
        let subNodeFlow: SubNodeFlow = {
            seq: 0,
            factoryID: this.factory.factoryID,
            nodeID: this.nodeID,
            subNodeID: '',
            subNodeName: '',
            qrCode: '',
            datetime: new Date(),
            monthlyID: '',
            cost: 0,
            createBy: this.userService.getCreateBy(),
        };

        this.subNodeFlowCostSelect.forEach( (item, index) => {
            let subNodeFlow1 = {...subNodeFlow};
            subNodeFlow1.subNodeID = item.subNodeID;
            subNodeFlow1.qrCode = this.staffSelect.qrCode;
            this.subNodeFlow.push(subNodeFlow1);
        });
        // console.log(this.subNodeFlow);
    }

    // ## check condition all , these can add subNode ot not
    checkScanTemp() {
        let subNodeFlowAnywhereScan = true; // ## can scan any time no need to exist at current nodeID station
        this.checkListComplete = false;
        let checked = true;
        this.subNodeFlow = [];
        this.statusScan1 = [];
        this.productBarcodeNoS2 = [];
        // console.log(this.orderProductions);
        // console.log(this.subNodeFlowCostSelect);

        // ## 1. check in this.orderProductions list  had subnode already  or not
        // ## had subnode already  = error
        this.subNodeFlowCostSelect.forEach( (item, index) => {
            for (let i=0; i<this.orderProductions.length; i++) {
                this.statusScan1.push('ok');
                this.productBarcodeNoS2.push(this.orderProductions[i].productBarcodeNoReal);
                const orderProduction = this.orderProductions[i];
                if (orderProduction.subNodeFlow) {
                    const subNodeFlowF = orderProduction.subNodeFlow.filter(fi =>
                        fi.nodeID === this.nodeID
                        && fi.subNodeID === item.subNodeID);
                    if (subNodeFlowF.length > 0) {
                        checked = false;
                        this.statusScan1[i] = 'err';
                    }
                }

                // ## 2. check current nodeID step in productionNode of this.orderProductions
                if (!subNodeFlowAnywhereScan) {
                    const productionNode = orderProduction.productionNode
                    if (!productionNode[0]) {
                        checked = false;
                        this.statusScan1[i] = 'err';
                    } else if (productionNode[0].toNode !== this.nodeID) {
                        checked = false;
                        this.statusScan1[i] = 'err';
                    }
                }

                // console.log('i = ' , i);
            }
            // console.log('index = ',index);
        });
        // console.log('checked = ', checked);
        this.checkListComplete = checked;
        if (this.checkListComplete) {
            this.genStaffSubNodeFlow();
        }
    }

    putAddOrderProductionSubNodeFlow() {
        this.blockUI = true; // block ui
        // putAddOrderProductionSubNodeFlow(companyID: string, factoryID: string, orderID: string, productBarcodeNos: string[],
        //     nodeID: string, bundleNo: number, subNodeFlow: SubNodeFlow[])

        this.nsService.putAddOrderProductionSubNodeFlow(
            this.company.companyID,
            this.factory.factoryID,
            this.orderID,
            this.productBarcodeNoS2,
            this.nodeID,
            this.bundleNo,
            this.subNodeFlow
        );
        if (this.editAddOrderProductionSubNodeFlowSub) { this.editAddOrderProductionSubNodeFlowSub.unsubscribe(); }
        this.editAddOrderProductionSubNodeFlowSub = this.nsService.getEditAddOrderProductionSubNodeFlowListener().subscribe((data) => {
            this.blockUI = false; // clear block ui
            if (data.success) {
                this.statusScan1 = [];
                this.productBarcodeNoS2 = [];
                this.checkListComplete = false;
                // this.autoAddSelectSubNodeFlow();
                this.messageService.add({
                    severity:'success',
                    summary:'edit/add ok',
                    detail:'edit/add order production subNodeFlow ok',
                    sticky: false
                });
            } else {
                // this.clearAll();
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error [ error edit/add ]',
                    detail: ' error edit/add order production subNodeFlow ',
                    sticky: false,
                });
            }
        });
    }



    acceptFunc() {
        // console.log('acceptFunc');
        this.putAddOrderProductionSubNodeFlow();
    }

    rejectFunc() {
        // console.log('rejectFunc');
    }

    confirmUpdateOrderProductionSubNode() {
        this.confirmationService.confirm({
            message: 'Are you sure that you want to proceed?',
            header: 'Confirmation',
            icon: 'pi pi-exclamation-triangle',
            acceptButtonStyleClass: 'p-button-success',
            rejectButtonStyleClass: 'p-button-danger',
            accept: () => this.acceptFunc(),
            reject: () => this.rejectFunc()
        });
    }

    updateOrderProductionSubNode() {
        this.confirmUpdateOrderProductionSubNode();
    }

    async getorderProductionCNByORIDBunNo() {
        this.getOrderProductionLoading = true;
        this.checkListComplete = false;
        this.orderProductions = [];
        this.statusScan1 = [];
        // async getorderProductionCNByORIDBunNo(companyID: string, orderID: string, bundleNo: number, nodeID: string)
        this.nsService.getorderProductionCNByORIDBunNo(
            this.company.companyID, this.orderID, this.bundleNo, this.nodeID
        );
        if (this.orderProductionsSub) { this.orderProductionsSub.unsubscribe(); }
        this.subNodeFlowCostSub = this.nsService.getOrderProductionListListener().subscribe((data) => {
            this.getOrderProductionLoading = false;
            this.orderProductions = data.orderProductions;
            if (data.success) {
                this.addOrderProductionBarcodeNoToTempByORIDBunNo(data.orderProductions);
            } else {

            }
        });
    }

    getsubNodeFlowCost1(orderID: string) {
        // getsubNodeFlowCost1(companyID: string, orderID: string)
        // orderID = '23F-BP1508';
        this.orderSubNodeFlowCost = GBC.clrOrderSubNodeFlowCost();
        this.orderProductionQueueBundleNo = GBC.clrOrderProductionQueueBundleNo();
        this.subNodeFlowCost = [];
        // this.subNodeFlowCostSelect = [];
        if (this.orderIDOld !== this.orderID) {
            this.subNodeFlowCostSelect = [];
        }
        this.nsService.getsubNodeFlowCost1(this.company.companyID, orderID);
        if (this.subNodeFlowCostSub) { this.subNodeFlowCostSub.unsubscribe(); }
        this.subNodeFlowCostSub = this.nsService.getSubNodeFlowCostListener().subscribe((data) => {
            // console.log(data);
            this.orderSubNodeFlowCost = data.orderSubNodeFlowCost;
            // this.subNodeFlowCost = this.orderSubNodeFlowCost.subNodeFlowCost;
            this.subNodeFlowCost = this.orderSubNodeFlowCost.subNodeFlowCost?this.orderSubNodeFlowCost.subNodeFlowCost:[];

            this.getDataFromBarcode(this.productBarcode);
            this.getorderProductionCNByORIDBunNo();

            // console.log(this.orderSubNodeFlowCost);
            // console.log(this.orderID,this.bundleNo,this.productBarcode,this.productCount,this.numberFrom,this.numberTo);
        });
    }

    getOrderProductionQueueByBundleNo1(orderID: string, bundleNo: number) {
        this.orderSubNodeFlowCost = GBC.clrOrderSubNodeFlowCost();
        this.orderProductionQueueBundleNo = GBC.clrOrderProductionQueueBundleNo();
        this.subNodeFlowCost = [];
        // this.subNodeFlowCostSelect = [];
        if (this.orderIDOld !== this.orderID) {
            this.subNodeFlowCostSelect = [];
        }
        // getOrderProductionQueueByBundleNo1(companyID: string, orderID: string, bundleNo: number)
        this.nsService.getOrderProductionQueueByBundleNo1(this.company.companyID, orderID, bundleNo);
        if (this.orderProductionQueueByBundleNo1Sub) { this.orderProductionQueueByBundleNo1Sub.unsubscribe(); }
        this.orderProductionQueueByBundleNo1Sub = this.nsService.getOrderProductionQueueBundleNoListener().subscribe((data) => {
            // console.log(data);
            this.orderProductionQueueBundleNo = data.orderProductionQueueBundleNo;
            this.orderSubNodeFlowCost = data.orderSubNodeFlowCost;
            this.subNodeFlowCost = this.orderSubNodeFlowCost.subNodeFlowCost?this.orderSubNodeFlowCost.subNodeFlowCost:[];



            // this.productBarcode = this.orderProductionQueueBundleNo.productBarcode;
            // this.productCount = this.orderProductionQueueBundleNo.productCount;
            // this.numberFrom = this.orderProductionQueueBundleNo.numberFrom;
            // this.numberTo = this.orderProductionQueueBundleNo.numberTo;

            this.productBarcode = data.productBarcode;
            this.productCount = data.productCount;
            this.numberFrom = data.numberFrom;
            this.numberTo = data.numberTo;

            this.getDataFromBarcode(this.productBarcode);
            this.getorderProductionCNByORIDBunNo();

            // console.log(this.orderSubNodeFlowCost);
            // console.log(this.orderID,this.bundleNo,this.productBarcode,this.productCount,this.numberFrom,this.numberTo);
        });
    }

    getOrderProductionQueueByProductBarcodeNo(productBarcodeNo: string) {
        // console.log(productBarcodeNo);
        this.orderSubNodeFlowCost = GBC.clrOrderSubNodeFlowCost();
        this.orderProductionQueueBundleNo = GBC.clrOrderProductionQueueBundleNo();
        this.subNodeFlowCost = [];
        // this.subNodeFlowCostSelect = [];
        if (this.orderIDOld !== this.orderID) {
            this.subNodeFlowCostSelect = [];
        }

        this.nsService.getOrderProductionQueueByProductBarcodeNo(this.company.companyID, productBarcodeNo);
        if (this.orderProductionQueueByProductBarcodeNoSub) { this.orderProductionQueueByProductBarcodeNoSub.unsubscribe(); }
        this.orderProductionQueueByProductBarcodeNoSub = this.nsService.getOrderProductionQueueByProductBarcodeNoListener()
            .subscribe((data) => {
            // console.log(data);
            this.orderProductionQueueBundleNo = data.orderProductionQueueBundleNo;
            this.orderSubNodeFlowCost = data.orderSubNodeFlowCost;
            // this.subNodeFlowCost = this.orderSubNodeFlowCost.subNodeFlowCost;
            this.subNodeFlowCost = this.orderSubNodeFlowCost.subNodeFlowCost?this.orderSubNodeFlowCost.subNodeFlowCost:[];

            // this.orderID = data.orderProductionQueueBundleNo.orderID;
            // this.bundleNo = data.orderProductionQueueBundleNo.bundleNo;
            // this.productBarcode = this.orderProductionQueueBundleNo.productBarcode;
            // this.productCount = this.orderProductionQueueBundleNo.productCount;
            // this.numberFrom = this.orderProductionQueueBundleNo.numberFrom;
            // this.numberTo = this.orderProductionQueueBundleNo.numberTo;

            this.orderID = data.orderID;
            this.bundleNo = data.bundleNo;
            this.productBarcode = data.productBarcode;
            this.productCount = data.productCount;
            this.numberFrom = data.numberFrom;
            this.numberTo = data.numberTo;

            this.getDataFromBarcode(this.productBarcode);
            this.getorderProductionCNByORIDBunNo();

            // console.log(this.orderSubNodeFlowCost);
            // console.log(this.orderID,this.bundleNo,this.productBarcode,this.productCount,this.numberFrom,this.numberTo);
        });
    }

    getWorkerInfoByQRCode1(mode: string) {
        this.staffSelect = GBC.clrUser();
        // getWorkerInfoByQRCode1(companyID: string, factoryID: string, qrCode: string)
        this.nsService.getWorkerInfoByQRCode1(
            this.company.companyID, this.factory.factoryID, this.staffID, mode
        );
        if (this.workerInfoSub) { this.workerInfoSub.unsubscribe(); }
        this.workerInfoSub = this.nsService.getStaffInfoUpdatedListener().subscribe((data) => {
            if (data.success) {
                this.staffSelect = data.staff;
                this.autoAddSelectSubNodeFlow();
                this.messageService.add({
                    severity:'success',
                    summary:'Staff found',
                    detail:'staff found',
                    sticky: false
                });
            } else {
                this.clearAll();
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error [ find staff info ]',
                    detail: ' [ please find staff info again ] ',
                    sticky: false,
                });
            }
        });
    }



    scanQRCode(mode: string) {
        this.orderIDOld = this.orderID!==''?this.orderID:this.orderIDOld;
        let data: any;
        this.orderID = '';
        this.zone = '';
        this.color = '';
        this.colorCode = '';
        this.size = '';
        this.bundleNo = 0;
        this.productBarcode = '';
        this.productCount = 0;
        this.numberFrom = 0;
        this.numberTo = 0;
        // console.log(JSON.parse(this.tokenScan));
        // JSON.parse(this.tokenScan)?console.log(JSON.parse(this.tokenScan)):console.log('not JSON');
        try {
            data = JSON.parse(this.tokenScan);
            // console.log(data);
            if (data.qrID === 'orderProductionQueueCard') {
                // console.log('ok JSON');
                this.orderID = data.orderID;
                this.bundleNo = data.bundleNo;
                this.productBarcode = data.productBarcode;
                this.productCount = data.productCount;
                this.numberFrom = data.numberFrom;
                this.numberTo = data.numberTo;
                // console.log(this.orderID,this.bundleNo,this.productBarcode,this.productCount,this.numberFrom,this.numberTo);
                this.getsubNodeFlowCost1(this.orderID);
            } else if (data.id === 201) {
                this.orderID = data.a;
                this.bundleNo = data.c;
                this.getOrderProductionQueueByBundleNo1(this.orderID, this.bundleNo);
            }
        } catch (e) {
            // return false;
            // console.log('not JSON');
            this.getOrderProductionQueueByProductBarcodeNo(this.tokenScan);
        }
    }

    clearScanTemp() {
        this.productBarcodeNoInput = '';
        this.getOrderProductionLoading = false;
        this.checkListComplete = false;
        this.orderProductions = [];
        this.subNodeFlow = [];
        this.statusScan1 = [];

        this.orderProductionScan1 = {
            companyID: this.company.companyID,
            factoryID: this.factory.factoryID,
            nodeID: this.nodeStation.nodeID,
            nodeIDNext: '',
            stationID: this.stationID,
            productID: '',
            orderID: '',
            bundleNo: 0,
            bundleCount: 0,
            scanItem: []
        };
    }


    clearToken() {
        this.orderIDOld = this.orderID!==''?this.orderID:this.orderIDOld;
        this.orderSubNodeFlowCost = GBC.clrOrderSubNodeFlowCost();
        this.orderProductionQueueBundleNo = GBC.clrOrderProductionQueueBundleNo();

        this.tokenScan = '';
        this.zone = '';
        this.color = '';
        this.colorCode = '';
        this.size = '';
        this.orderID = '';
        this.bundleNo = 0;
        this.productBarcode = '';
        this.productCount = 0;
        this.numberFrom = 0;
        this.numberTo = 0;

        this.subNodeFlowCost = [];
        // this.subNodeFlowCostSelect = [];

        this.clearScanTemp();

        this.scanInputBox2.nativeElement.focus(); // ## input setfocus
        this.scanInputBox2.nativeElement.select();
    }

    clearAll() {
        this.staffSelect = GBC.clrUser();
        this.staffID = '';
        this.subNodeFlowCostSelect = [];

        this.clearToken();
        this.clearScanTemp();

        this.scanInputBox.nativeElement.focus(); // ## input setfocus
        this.scanInputBox.nativeElement.select();
    }

    genImagePath(imgPath: string) {
        if (imgPath) {
            if (imgPath.length > 0) {
                return this.userImageProfileGCSPath + imgPath;
            }
        }

        return GBC.nulltGCSPath;
    }

    showSubNodeSelect() {
        // this.getQRCodeListProductStyleCFN(productID);
        const ref = this.dialogService.open(SmdNodeSubnodeSelectComponent, {
            data: {
                id: 'showSubNodeSelect',
                companyID: this.userService.getCompany()?.companyID,
                subNodeFlowCost: this.subNodeFlowCost.filter(fi => fi.nodeID === this.nodeID),
                // zone: 'all',
                // size: 'all',
                // colorCode: 'all',
                // colorName: '',
                // productBarcodeNo: this.productBarcodeNoInput,
                // callfrom: this.formName,  // ## send to nodejs for choose buckets
                // nodeStation: this.nodeStation,
                // nodeStations: this.nsService.nodeStations
            },
            header: 'sub node select',
            width: '40%',
        });

        ref.onClose.subscribe((data: any) => {
            // console.log(data);
            this.subNodeFlowCostSelect = [];
            if (data && data.length > 0) {
                this.subNodeFlowCostSelect = data;
            }
        });
    }

    showSubNodeScanned(token: string) {
        token = this.tokenScan;
        const ref = this.dialogService.open(SmdRepSubnodeScannedComponent, {
            data: {
                id: 'showSubNodeScanned',
                mode: 'edit-qr',
                token: token
            },
            header: 'edit staff work load',
            width: '90%'
        });

        ref.onClose.subscribe((data: any) => {
            // console.log(data);

        });
    }

    ngOnDestroy(): void {
        this.nsService.setDataAroundNodeApp('isScanSubnode', false);
        if (this.workerInfoSub) { this.workerInfoSub.unsubscribe(); }
        if (this.subNodeFlowCostSub) { this.subNodeFlowCostSub.unsubscribe(); }
        if (this.orderProductionQueueByBundleNo1Sub) { this.orderProductionQueueByBundleNo1Sub.unsubscribe(); }
        if (this.orderProductionsSub) { this.orderProductionsSub.unsubscribe(); }
        if (this.orderProductionQueueByProductBarcodeNoSub) { this.orderProductionQueueByProductBarcodeNoSub.unsubscribe(); }
        if (this.editAddOrderProductionSubNodeFlowSub) { this.editAddOrderProductionSubNodeFlowSub.unsubscribe(); }
        // if (this.dataAroundNodeAppSub) { this.dataAroundNodeAppSub.unsubscribe(); }
        // if (this.scanOrderProductionBarcodeNoSub) { this.scanOrderProductionBarcodeNoSub.unsubscribe(); }
        // if (this.orderProductionNextNodeIDSub) { this.orderProductionNextNodeIDSub.unsubscribe(); }
        // if (this.orderProductionCancelSub) { this.orderProductionCancelSub.unsubscribe(); }

        // if (this.langSub) { this.langSub.unsubscribe(); }
        // if (this.langListSub) { this.langListSub.unsubscribe(); }
        // if (this.intervalTimer) { clearInterval(this.intervalTimer); } // ## pause stop time interval
    }
}
