import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { DialogService, DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Subscription } from 'rxjs';
import { GBC } from 'src/app/global/const-global';
import { Company, Factory } from 'src/app/models/app.model';
import { OrderProduction, OrderProductionQueueBundleNo, OrderSubNodeFlowCost, SubNodeFlowCost } from 'src/app/models/order.model';
import { StaffList, User } from 'src/app/models/user.model';
import { NodeStation, SubNodeflowC } from 'src/app/models/workstation.model';
import { NodeStationService } from 'src/app/services/node-station.service';
import { UserService } from 'src/app/services/user.service';

@Component({
    selector: 'app-smd-rep-subnode-scanned',
    templateUrl: './smd-rep-subnode-scanned.component.html',
    styleUrls: ['./smd-rep-subnode-scanned.component.scss'],
    providers: [DialogService, MessageService, ConfirmationService],
})
export class SmdRepSubnodeScannedComponent implements OnInit, OnDestroy {
    @ViewChild('input2', { static: false }) scanInputBox2!: ElementRef;

    nodeMenuActive = 'scanned-subnode';  //
    formName = this.nodeMenuActive;
    userImageProfileGCSPath = GBC.userImageProfileGCSPath;  // ## google storage path user image profile

    data: any;
    mode = 'show-list';  // show-list , edit-qr
    token = '';
    staffEditSelect: StaffList = GBC.clrStaffList();
    staffIDEdit = '';
    subNodeIDEdit = '';
    productBarcodeNoS: string[] = [];

    blockUI = false;
    getOrderProductionLoading = false; // ## true= loading , false= not loading or loaded
    checkListComplete = false;
    orderProductions: OrderProduction[] = [];
    statusScan1: string[] = [];

    company: Company = GBC.clrCompany();
    factory: Factory = GBC.clrFactory();
    nodeStation: NodeStation = GBC.clrNodeStation();
    // staffSelect: User = GBC.clrUser();
    nodeID = '';
    stationID = '';

    orderSubNodeFlowCost: OrderSubNodeFlowCost = GBC.clrOrderSubNodeFlowCost();
    subNodeFlowCost: SubNodeFlowCost[] = [];
    subNodeFlowCostSelect: SubNodeFlowCost[] = [];
    subNodeflowC: SubNodeflowC[] = [];
    orderProductionQueueBundleNo: OrderProductionQueueBundleNo = GBC.clrOrderProductionQueueBundleNo();
    staffs: StaffList[] = [];
    staffSelect: StaffList = GBC.clrStaffList();

    tokenScan = '';

    orderID = '';
    orderIDOld = '';
    zone = '';
    color = '';
    colorCode = '';
    size = '';
    bundleNo = 0;
    bundleID = '';
    productBarcode = '';
    productCount = 0;
    numberFrom = 0;
    numberTo = 0;

    visible = false;
    subNodeIDSelected = '';

    private subNodeFlowCostSub: Subscription = new Subscription;
    private orderProductionQueueByBundleNo1Sub: Subscription = new Subscription;
    private orderProductionQueueByProductBarcodeNoSub: Subscription = new Subscription;
    private orderProductionsSub: Subscription = new Subscription;
    private staffListsSub: Subscription = new Subscription;
    private workerInfoSub: Subscription = new Subscription;
    private editQROrderProductionSubNodeFlowSub: Subscription = new Subscription;
    // private editAddOrderProductionSubNodeFlowSub: Subscription = new Subscription;

    constructor(
        public config: DynamicDialogConfig,
        public ref: DynamicDialogRef,

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
        this.data = this.config.data;
        this.mode = this.data.mode;
        this.company = this.userService.getCompany();
        this.factory = this.userService.getFactory();
        this.nodeStation = this.nsService.nodeStation;
        this.nodeID = this.nodeStation.nodeID;
        this.stationID = this.nsService.stationID;
        this.subNodeflowC = this.nsService.subNodeflowC;
        // console.log(this.subNodeflowC);
        // console.log(this.data);
        if (this.mode === 'edit-qr') {
            this.tokenScan = this.data.token;
            this.scanQRCode('token');
        }
    }


    updateEditOrderProductionSubNode() {
        this.blockUI = true; // block ui
        this.productBarcodeNoS = [];
        this.orderProductions.forEach( (item, index) => {
            this.productBarcodeNoS.push(item.productBarcodeNoReal);
        });
        // putEditOrderProductionSubNodeFlow(companyID: string, factoryID: string, orderID: string, productBarcodeNos: string[],
        //     nodeID: string, subNodeID: string, qrCode: string)
        this.nsService.putEditOrderProductionSubNodeFlow(
            this.company.companyID,
            this.factory.factoryID,
            this.orderID,
            this.productBarcodeNoS,
            this.nodeID,
            this.subNodeIDEdit,
            this.staffIDEdit
        );
        if (this.editQROrderProductionSubNodeFlowSub) { this.editQROrderProductionSubNodeFlowSub.unsubscribe(); }
        this.editQROrderProductionSubNodeFlowSub = this.nsService.getEditQROrderProductionSubNodeFlowListener().subscribe((data) => {
            this.blockUI = false; // clear block ui
            if (data.success) {
                if (this.mode === 'edit-qr') {
                    this.scanQRCode('token');
                }
                this.clearEditQR();
                this.messageService.add({
                    severity:'success',
                    summary:'edit QRCode ok',
                    detail:'edit QRCode order production subNodeFlow ok',
                    sticky: false
                });
            } else {
                // this.clearAll();
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error [ error edit QRCode ]',
                    detail: ' error edit QRCode order production subNodeFlow ',
                    sticky: false,
                });
            }
        });
    }

    getWorkerInfoByQRCode1(mode: string) {
        this.staffEditSelect = GBC.clrStaffList();
        // getWorkerInfoByQRCode1(companyID: string, factoryID: string, qrCode: string)
        this.nsService.getWorkerInfoByQRCode1(
            this.company.companyID, this.factory.factoryID, this.staffIDEdit, mode
        );
        if (this.workerInfoSub) { this.workerInfoSub.unsubscribe(); }
        this.workerInfoSub = this.nsService.getStaffInfoUpdatedListener().subscribe((data) => {
            if (data.success) {
                this.staffEditSelect.userID = data.staff.userID;
                this.staffEditSelect.qrCode = data.staff.qrCode;
                this.staffEditSelect.type = data.staff.type;
                this.staffEditSelect.userName = data.staff.uInfo.userName;
                this.staffEditSelect.pic = data.staff.uInfo.pic;

            } else {
                this.staffEditSelect = GBC.clrStaffList();

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



            this.productBarcode = data.productBarcode;
            this.bundleID = data.bundleID;
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
            this.visible=false;
            this.subNodeIDSelected = '';
            this.orderProductionQueueBundleNo = data.orderProductionQueueBundleNo;
            this.orderSubNodeFlowCost = data.orderSubNodeFlowCost;
            // this.subNodeFlowCost = this.orderSubNodeFlowCost.subNodeFlowCost;
            this.subNodeFlowCost = this.orderSubNodeFlowCost.subNodeFlowCost?this.orderSubNodeFlowCost.subNodeFlowCost:[];


            this.orderID = data.orderID.trim();
            this.bundleNo = data.bundleNo;
            this.bundleID = data.bundleID;
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

    getOrderProductionQueueByProductBarcodeNoListener() {
        if (this.orderProductionQueueByProductBarcodeNoSub) { this.orderProductionQueueByProductBarcodeNoSub.unsubscribe(); }
        this.orderProductionQueueByProductBarcodeNoSub = this.nsService.getOrderProductionQueueByProductBarcodeNoListener()
            .subscribe((data) => {
            // console.log(data);
            this.visible=false;
            this.subNodeIDSelected = '';
            this.orderProductionQueueBundleNo = data.orderProductionQueueBundleNo;
            this.orderSubNodeFlowCost = data.orderSubNodeFlowCost;
            // this.subNodeFlowCost = this.orderSubNodeFlowCost.subNodeFlowCost;
            this.subNodeFlowCost = this.orderSubNodeFlowCost.subNodeFlowCost?this.orderSubNodeFlowCost.subNodeFlowCost:[];


            this.orderID = data.orderID.trim();
            this.bundleNo = data.bundleNo;
            this.bundleID = data.bundleID;
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

    putDeleteSubNodeOrderProductionByBarcodeNo(subNodeIDSelected: string) {
        this.orderSubNodeFlowCost = GBC.clrOrderSubNodeFlowCost();
        this.orderProductionQueueBundleNo = GBC.clrOrderProductionQueueBundleNo();
        this.subNodeFlowCost = [];
        // this.subNodeFlowCostSelect = [];
        if (this.orderIDOld !== this.orderID) {
            this.subNodeFlowCostSelect = [];
        }
        // console.log(this.company.companyID, this.orderID,
        //     this.bundleNo, this.bundleID, this.nodeID, subNodeIDSelected,
        //     this.productBarcode, this.productCount);
        this.nsService.putDeleteSubNodeOrderProductionByBarcodeNo(
            this.company.companyID, this.orderID,
            this.bundleNo, this.bundleID, this.nodeID, subNodeIDSelected,
            this.productBarcode, this.productCount
        );
        this.getOrderProductionQueueByProductBarcodeNoListener()
    }

    scanQRCode(mode: string) {
        this.visible=false;
        this.subNodeIDSelected = '';
        this.orderIDOld = this.orderID!==''?this.orderID:this.orderIDOld;
        let data: any;
        this.orderID = '';
        this.zone = '';
        this.color = '';
        this.colorCode = '';
        this.size = '';
        this.bundleNo = 0;
        this.bundleID = '';
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
            // console.log('not JSON', this.tokenScan);
            this.getOrderProductionQueueByProductBarcodeNo(this.tokenScan);
        }
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
            this.orderProductions.sort((a,b)=>{return  a.productBarcodeNoReal >b.productBarcodeNoReal?1:a.productBarcodeNoReal <b.productBarcodeNoReal?-1:0});
            this.getorderProductionStaffScannedNameListCNByORIDQRs();
            // console.log(this.orderProductions);

            if (data.success) {
                // this.addOrderProductionBarcodeNoToTempByORIDBunNo(data.orderProductions);


            } else {

            }
        });
    }

    getorderProductionStaffScannedNameListCNByORIDQRs() {
        this.staffs = [];
        let qrcodeArr: string[] = [];

        // ## gen qrcodeArr
        this.orderProductions.forEach( (item, index) => {
            item.subNodeFlow.forEach( (item2, index2) => {
                qrcodeArr.push(item2.qrCode);
            });
        });
        // console.log(qrcodeArr);
        qrcodeArr = [...new Set(qrcodeArr)];
        // console.log(qrcodeArr);

        this.nsService.getorderProductionStaffScannedNameListCNByORIDQRs(
            this.orderID, this.nodeID, qrcodeArr, this.bundleNo,
        );
        if (this.staffListsSub) { this.staffListsSub.unsubscribe(); }
        this.staffListsSub = this.nsService.getStaffsListListener().subscribe((data) => {
            // console.log(data);
            this.staffs = data.staffs;
        });
    }

    clearToken() {
        this.visible=false;
        this.subNodeIDSelected = '';
        this.orderIDOld = this.orderID!==''?this.orderID:this.orderIDOld;
        // this.orderSubNodeFlowCost = GBC.clrOrderSubNodeFlowCost();
        // this.orderProductionQueueBundleNo = GBC.clrOrderProductionQueueBundleNo();

        this.tokenScan = '';
        this.zone = '';
        this.color = '';
        this.colorCode = '';
        this.size = '';
        this.orderID = '';
        this.bundleNo = 0;
        this.bundleID = '';
        this.productBarcode = '';
        this.productCount = 0;
        this.numberFrom = 0;
        this.numberTo = 0;

        // this.subNodeFlowCost = [];
        // this.subNodeFlowCostSelect = [];

        // this.clearScanTemp();
        this.getOrderProductionLoading = true;
        this.checkListComplete = false;
        this.orderProductions = [];
        this.statusScan1 = [];

        this.staffSelect = GBC.clrStaffList();

        this.scanInputBox2.nativeElement.focus(); // ## input setfocus
        this.scanInputBox2.nativeElement.select();
    }

    getSubNodeflow(nodeID: string) {
        // ## order seq for subNodeIDs
        const subNodeflowCF = this.subNodeFlowCost.filter(i=>i.nodeID == nodeID);
        subNodeflowCF.sort((a,b)=>{return  a.seq >b.seq?1:a.seq <b.seq?-1:0});
        // console.log(this.subNodeflowCs);
        return subNodeflowCF;
    }

    getLastStrBarcode(barcodeNo: string, len: number) {
        return +barcodeNo.substr(37, len);
    }

    // ## getMode = userName , pic , userID, qrCode, info
    getStaffScanned(barcodeNo: string, subNodeID: string, getMode: string): string | StaffList {
        // this.staffs
        // const subNodeflowCF = this.staffs.filter(i=>i.nodeID == nodeID);
        // this.orderProductions

        const orderProductionsF = this.orderProductions.filter(i=>i.productBarcodeNoReal == barcodeNo);
        if (orderProductionsF.length > 0) {
            const subNodeFlowF = orderProductionsF[0].subNodeFlow.filter(i=>i.subNodeID == subNodeID);
            if (subNodeFlowF.length > 0) {
                const qrCode = subNodeFlowF[0].qrCode;
                const staffsF = this.staffs.filter(i=>i.qrCode == qrCode);
                if (staffsF.length > 0) {
                    // return staffsF[0].userName;
                    if (getMode==='userID'){ return staffsF[0].userID; }
                    else if (getMode==='userName'){ return staffsF[0].userName; }
                    else if (getMode==='pic'){ return staffsF[0].pic; }
                    else if (getMode==='qrCode'){ return staffsF[0].qrCode; }
                    else if (getMode==='info'){
                        this.staffSelect = staffsF[0];
                        return staffsF[0];
                    }
                }
            }
        } else if (getMode==='info') { return GBC.clrStaffList(); }
        return '';
    }

    getStaffInfo(barcodeNo: string, subNodeID: string, getMode: string) {
        // console.log(subNodeID);
        this.subNodeIDEdit = subNodeID;
        this.getStaffScanned(barcodeNo, subNodeID, getMode);
    }

    clearEditQR() {
        this.staffEditSelect = GBC.clrStaffList();
        this.staffIDEdit = '';
        this.subNodeIDEdit = '';
    }

    genImagePath(imgPath: string) {
        if (imgPath) {
            if (imgPath.length > 0) {
                return this.userImageProfileGCSPath + imgPath;
            }
        }

        return GBC.nulltGCSPath;
    }

    showMenu(nodeID: string, subNodeID: string) {
        // console.log(nodeID, subNodeID);
        // this.visible=false;
        // this.subNodeIDSelected = '';
        // console.log(this.orderID, this.bundleNo);
        if (this.orderID !== '' && this.bundleNo > 0) {
            this.visible = !this.visible;
            this.subNodeIDSelected = subNodeID;
        }
    }

    confirmSubNodeIDDelete() {
        // console.log(this.subNodeIDSelected);
        this.putDeleteSubNodeOrderProductionByBarcodeNo(this.subNodeIDSelected);
    }

    ngOnDestroy(): void {
        if (this.subNodeFlowCostSub) { this.subNodeFlowCostSub.unsubscribe(); }
        if (this.orderProductionQueueByBundleNo1Sub) { this.orderProductionQueueByBundleNo1Sub.unsubscribe(); }
        if (this.orderProductionQueueByProductBarcodeNoSub) { this.orderProductionQueueByProductBarcodeNoSub.unsubscribe(); }
        if (this.orderProductionsSub) { this.orderProductionsSub.unsubscribe(); }
        if (this.staffListsSub) { this.staffListsSub.unsubscribe(); }
        if (this.workerInfoSub) { this.workerInfoSub.unsubscribe(); }
        if (this.editQROrderProductionSubNodeFlowSub) { this.editQROrderProductionSubNodeFlowSub.unsubscribe(); }

        // if (this.scanOrderProductionBarcodeNoSub) { this.scanOrderProductionBarcodeNoSub.unsubscribe(); }
        // if (this.orderProductionNextNodeIDSub) { this.orderProductionNextNodeIDSub.unsubscribe(); }
        // if (this.orderProductionCancelSub) { this.orderProductionCancelSub.unsubscribe(); }

        // if (this.langSub) { this.langSub.unsubscribe(); }
        // if (this.langListSub) { this.langListSub.unsubscribe(); }
        // if (this.intervalTimer) { clearInterval(this.intervalTimer); } // ## pause stop time interval
    }
}
