import { Component, ElementRef, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MessageService } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import { Subscription } from 'rxjs';
import { GBC } from 'src/app/global/const-global';
import { Company, Factory } from 'src/app/models/app.model';
import { SubNodeStaffScan } from 'src/app/models/report.model';
import { StaffList, User } from 'src/app/models/user.model';
import { NodeStation, SubNodeflowC } from 'src/app/models/workstation.model';
import { NodeStationService } from 'src/app/services/node-station.service';
import { ReportService } from 'src/app/services/report.service';
import { UserService } from 'src/app/services/user.service';

@Component({
    selector: 'app-s-rep-workload-personal',
    templateUrl: './s-rep-workload-personal.component.html',
    styleUrls: ['./s-rep-workload-personal.component.scss'],
    providers: [DialogService, MessageService],
})
export class SRepWorkloadPersonalComponent implements OnInit, OnDestroy {
    @Input() nodeStation: NodeStation = GBC.clrNodeStation();
    @Input() stationID = '';
    @ViewChild('input1', { static: false }) scanInputBox!: ElementRef;

    userImageProfileGCSPath = GBC.userImageProfileGCSPath;  // ## google storage path user image profile

    company: Company = GBC.clrCompany();
    factory: Factory = GBC.clrFactory();
    // nodeStation: NodeStation = GBC.clrNodeStation();
    staffSelect: User = GBC.clrUser();
    nodeID = '';
    // stationID = ''

    readonlyInput = true;
    dateFormat = 'dd/mm/yy';
    dayDiff = -1; // ##  -1 not yet to select date / default
    date12: Date[] = [];
    date1 = '';
    date2 = '';


    staffID = '';
    note = 'U=UK, A=ASIA, S=SHANGHAI, J=JAPAN';

    menuSelect = 'staff-scanned-report';
    orderIDs: string[] = [];
    nodeIDs: string[] = [];
    nodeIDs2: string[] = [];
    subNodeIDs: string[] = [];
    dayMonthUTCs: string[] = [];
    subNodeflowCs: SubNodeflowC[] = [];


    subNodeStaffScan: SubNodeStaffScan[] = [];
    subNodeStaffScanStyleZoneColorSize: SubNodeStaffScan[] = [];
    subNodeStaffScanStyleZoneColorSizeData: SubNodeStaffScan[] = [];
    subNodeflowC: SubNodeflowC[] = [];



    private workerInfoSub: Subscription = new Subscription;
    private repSubNodeStaffScanDate12OverallSub: Subscription = new Subscription;



    constructor(
        public dialogService: DialogService,
        public messageService: MessageService,

        public userService: UserService,
        // private orderService: OrderService,
        public nsService: NodeStationService,
        private repService: ReportService
    ) {}

    ngOnInit(): void {

        this.userService.staffListSelectUpdated.next({ staffList: GBC.clrStaffList() }); // ## clear staff image
        // console.log(this.nsService.nodeStation);
        // console.log(this.nodeStation);
        this.company = this.userService.getCompany();
        this.factory = this.userService.getFactory();
        this.nodeStation = this.nodeStation.nodeID === '' ? this.nsService.nodeStation : this.nodeStation;
        this.stationID = this.stationID === '' ? this.nsService.stationID : this.stationID;
        this.nodeID = this.nodeStation.nodeID;
        this.subNodeflowC = this.nsService.subNodeflowC;

        // console.log(this.nodeStation);

        this.date12[0] = new Date();
        this.date12[1] = new Date();
        // this.getRepSubNodeScanDate12OStaffverall();

    }

    getRepSubNodeScanDate12StaffOverall() {

        this.date1 = this.userService.returnDateDDMMYYYYHHMMSign(this.date12[0], '/')
        this.date2 = this.userService.returnDateDDMMYYYYHHMMSign(this.date12[1], '/')
        const factoryIDs = [this.factory.factoryID];
        const infoType = 'staffProduction'; // ##  infoType = call by who {staffOffice, 'staffProduction'}

        // console.log(this.company.companyID, factoryIDs, [this.nodeID], this.date12, infoType, this.staffSelect.qrCode);
        this.nsService.getRepSubNodeScanDate12StaffOverall(
            this.company.companyID, factoryIDs, [this.nodeID], this.date12, infoType, this.staffSelect.qrCode
        );
        if (this.repSubNodeStaffScanDate12OverallSub) { this.repSubNodeStaffScanDate12OverallSub.unsubscribe(); }
        this.repSubNodeStaffScanDate12OverallSub = this.nsService.getRepSubNodeStaffScanListener().subscribe((data) => {
            // console.log(data);
            this.subNodeStaffScan = data.subNodeStaffScan;
            this.subNodeStaffScanStyleZoneColorSize = data.subNodeStaffScanStyleZoneColorSize;
            // console.log(this.subNodeStaffScan);
            // console.log(this.subNodeStaffScanStyleZoneColorSize);

            this.dayMonthUTCs = Array.from(new Set(this.subNodeStaffScan.map((item: any) => item.dayMonthUTC)));
            this.orderIDs = Array.from(new Set(this.subNodeStaffScan.map((item: any) => item.orderID)));
            this.nodeIDs = Array.from(new Set(this.subNodeStaffScan.map((item: any) => item.nodeID)));
            this.subNodeIDs = Array.from(new Set(this.subNodeStaffScan.map((item: any) => item.subNodeID)));

            this.nodeIDs.sort();
            this.nodeIDs2 = [];
            this.nodeIDs.forEach( (item, index) => {
                this.nodeIDs2.push(this.userService.strFirstAndDot(item, 15));
            });

            // console.log(this.dayMonthUTCs, this.orderIDs, this.nodeIDs, this.subNodeIDs);

            // this.transformData();
            this.subNodeStaffScanStyleZoneColorSizePrepareData();
        });

    }

    // #########################################################################
    subNodeStaffScanStyleZoneColorSizePrepareData() {
        // console.log(this.subNodeStaffScanStyleZoneColorSize);

        this.subNodeStaffScanStyleZoneColorSize.forEach( (item, index) => {
            item.size = this.userService.strReplaceAll(item.size, '-', '');
            item.color = this.userService.strReplaceAll(item.color, '-', '');
            item.targetPlace = this.userService.strReplaceAll(item.targetPlace, '-', '');
        });

        this.subNodeStaffScanStyleZoneColorSize.forEach( (item, index) => {
            item.color = this.userService.changeColorTextToColorTextComma(item.color);
            item.colorSeq = this.userService.getColorSeqByOrderID(item.orderID, item.color);
            item.sizeSeq = this.userService.getSizeSeq(item.size);
            item.targetPlaceSeq = this.userService.getTargetPlaceSeq1(item.targetPlace);
        });

        this.subNodeStaffScanStyleZoneColorSize.sort((a,b)=>{
            return a.orderID >b.orderID?1:a.orderID <b.orderID?-1:0
            || a.colorSeq >b.colorSeq?1:a.colorSeq <b.colorSeq?-1:0
            || a.sizeSeq >b.sizeSeq?1:a.sizeSeq <b.sizeSeq?-1:0
        });

        // console.log(this.subNodeStaffScanStyleZoneColorSize);

        // ## adjust data distinct for style , color , size
        this.subNodeStaffScanStyleZoneColorSizeData = [];
        this.subNodeStaffScanStyleZoneColorSize.forEach( (item, index) => {
            const dataF = this.subNodeStaffScanStyleZoneColorSizeData.filter(i=>
                i.companyID == item.companyID &&
                i.factoryID == item.factoryID &&
                i.orderID == item.orderID &&
                i.color == item.color &&
                i.size == item.size
            );
            if (dataF.length === 0) {
                this.subNodeStaffScanStyleZoneColorSizeData.push({
                    companyID: item.companyID,
                    factoryID: item.factoryID,
                    orderID: item.orderID,
                    color: item.color,
                    size: item.size,

                    targetPlaceSeq: item.targetPlaceSeq,
                    colorSeq: item.colorSeq,
                    sizeSeq: item.sizeSeq,

                    seq: 0,
                    nodeID: item.nodeID,
                    subNodeID: item.subNodeID,
                    dayMonthUTC: '',
                    targetPlace: item.targetPlace,
                    countQty: 0,
                    qrCode:  '',
                    userID:  '',
                    userName:  '',
                });
            }
        });
        // console.log(this.subNodeStaffScanStyleZoneColorSizeData);
    }

    getOrderIDFromNodeID(nodeID: string) {
        let orderIDArr: string[] = [];
        const subNodeStaffScanF = this.subNodeStaffScan.filter(i=>i.nodeID == nodeID);
        subNodeStaffScanF.forEach( (item, index) => {
            orderIDArr.push(item.orderID);
        });
        // orderIDArr = Array.from(new Set(this.subNodeStaffScan.map((item: any) => item)));
        orderIDArr = [...new Set(orderIDArr)];
        orderIDArr.sort();
        // console.log(orderIDArr);
        return orderIDArr;
    }

    getSubNodeflow(nodeID: string) {
        // ## order seq for subNodeIDs
        // console.log(this.subNodeflowC);
        this.subNodeflowCs = [];
        this.subNodeIDs.forEach( (item, index) => {
            const subNodeflowCF = this.subNodeflowC.filter(i=>i.nodeID == nodeID && i.subNodeID === item);
            if (subNodeflowCF.length > 0) {
                this.subNodeflowCs.push(subNodeflowCF[0]);
            }
        });
        this.subNodeflowCs.sort((a,b)=>{return  a.seq >b.seq?1:a.seq <b.seq?-1:0});
        // console.log(this.subNodeflowCs);
        return this.subNodeflowCs;
    }

    getQTYSubNode(nodeID: string, subNodeID: string, orderID: string) {
        const companyID = this.company.companyID;
        const factoryID = this.factory.factoryID;
        // const date1 = this.userService.returnDateDDMMYYYYHHMMSign(this.date12[0], '/')
        // const date12 = date1.substr(0, 5)

        const subNodeStaffScanF = this.subNodeStaffScan.filter(i=>
            i.companyID == companyID &&
            i.factoryID == factoryID &&
            i.orderID == orderID &&
            i.nodeID == nodeID &&
            i.subNodeID == subNodeID
            // i.dayMonthUTC == date12
        );

        if (subNodeStaffScanF.length > 0) {
            return subNodeStaffScanF[0].countQty?subNodeStaffScanF[0].countQty:'';
        }
        return '';

    }

    getQTYSubNodeZoneColorSize(orderID: string, nodeID: string, subNodeID: string, color: string, size: string) {
        const companyID = this.company.companyID;
        const factoryID = this.factory.factoryID;
        // const date1 = this.userService.returnDateDDMMYYYYHHMMSign(this.date12[0], '/')
        // const date12 = date1.substr(0, 5)

        const subNodeStaffScanStyleZoneColorSizeF = this.subNodeStaffScanStyleZoneColorSize.filter(i=>
            i.companyID == companyID &&
            i.factoryID == factoryID &&
            i.orderID == orderID &&
            i.nodeID == nodeID &&
            i.subNodeID == subNodeID &&
            // i.targetPlace == targetPlace &&
            i.color == color &&
            i.size == size
            // i.dayMonthUTC == date12
        );

        let qtyZone: any[] = [];
        if (subNodeStaffScanStyleZoneColorSizeF.length > 0) {
            // return subNodeStaffScanStyleZoneColorSizeF[0].countQty?subNodeStaffScanStyleZoneColorSizeF[0].countQty:'';
            subNodeStaffScanStyleZoneColorSizeF.forEach( (item, index) => {
                qtyZone.push({
                    zone: item.targetPlace.substr(0, 1),
                    qty: item.countQty
                });
            });
            return qtyZone;
        }
        return [];
    }

    getWorkerInfoByQRCode1(mode: string) {
        this.staffSelect = GBC.clrUser();
        this.clearData();
        // getWorkerInfoByQRCode1(companyID: string, factoryID: string, qrCode: string)
        this.nsService.getWorkerInfoByQRCode1(
            this.company.companyID, this.factory.factoryID, this.staffID, mode
        );
        if (this.workerInfoSub) { this.workerInfoSub.unsubscribe(); }
        this.workerInfoSub = this.nsService.getStaffInfoUpdatedListener().subscribe((data) => {
            if (data.success) {
                this.staffSelect = data.staff;
                // this.getRepSubNodeScanDate12StaffOverall();
                // this.autoAddSelectSubNodeFlow();
                this.messageService.add({
                    severity:'success',
                    summary:'Staff found',
                    detail:'staff found',
                    sticky: false
                });
            } else {
                // this.clearAll();
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error [ not found staff info ]',
                    detail: ' [ please find staff again ] ',
                    sticky: false,
                });
            }
        });
    }

    selectMenu(menu: string) {
        this.menuSelect = menu;
    }

    // getWorkerInfoByQRCode1(mode: string) {

    // }

    clearData() {
        this.subNodeStaffScan = [];
        this.subNodeStaffScanStyleZoneColorSize = [];
        this.subNodeStaffScanStyleZoneColorSizeData = [];
        this.dayMonthUTCs = [];
        this.orderIDs = [];
        this.nodeIDs = [];
        this.subNodeIDs = [];
        this.nodeIDs2 = [];
        // this.staffs = [];
    }

    clearScan() {
        this.staffID = '';
        this.staffSelect = GBC.clrUser();

        this.clearData();

        this.scanInputBox.nativeElement.focus(); // ## input setfocus
        this.scanInputBox.nativeElement.select();
    }

    selectDate() {
        // this.rangeDates = [];
        this.dayDiff = -1; // ##  -1 not yet to select date / default
        if (this.date12.length === 2) {
            if (!this.date12[1]) {
                // console.log('this.rangeDates[1] is null');
                this.date12[1] = this.date12[0];
            }
        }
        // let difference = Math.ceil((this.rangeDates[1].getTime() - this.rangeDates[0].getTime() ) /  (1000 * 60 * 60 * 24));
        this.dayDiff = this.userService.getDayDifferent(this.date12[1], this.date12[0]);
        // console.log(this.date12);
        this.date1 = this.userService.returnDateDDMMYYYYHHMMSign(this.date12[0], '/')
        this.date2 = this.userService.returnDateDDMMYYYYHHMMSign(this.date12[1], '/')
        // console.log(this.dayDiff);

        // this.getRepSubNodeStaffScanDate12Overall();
        this.getRepSubNodeScanDate12StaffOverall();
    }

    genImagePath(imgPath: string) {
        if (imgPath) {
            if (imgPath.length > 0) {
                return this.userImageProfileGCSPath + imgPath;
            }
        }

        return GBC.nulltGCSPath;
    }

    ngOnDestroy(): void {
        // this.nsService.setDataAroundNodeApp('isScanSubnode', false);
        if (this.workerInfoSub) { this.workerInfoSub.unsubscribe(); }
        if (this.repSubNodeStaffScanDate12OverallSub) { this.repSubNodeStaffScanDate12OverallSub.unsubscribe(); }
        // if (this.orderProductionQueueByBundleNo1Sub) { this.orderProductionQueueByBundleNo1Sub.unsubscribe(); }
        // if (this.orderProductionsSub) { this.orderProductionsSub.unsubscribe(); }
        // if (this.orderProductionQueueByProductBarcodeNoSub) { this.orderProductionQueueByProductBarcodeNoSub.unsubscribe(); }
        // if (this.editAddOrderProductionSubNodeFlowSub) { this.editAddOrderProductionSubNodeFlowSub.unsubscribe(); }
        // if (this.dataAroundNodeAppSub) { this.dataAroundNodeAppSub.unsubscribe(); }
        // if (this.scanOrderProductionBarcodeNoSub) { this.scanOrderProductionBarcodeNoSub.unsubscribe(); }
        // if (this.orderProductionNextNodeIDSub) { this.orderProductionNextNodeIDSub.unsubscribe(); }
        // if (this.orderProductionCancelSub) { this.orderProductionCancelSub.unsubscribe(); }

        // if (this.langSub) { this.langSub.unsubscribe(); }
        // if (this.langListSub) { this.langListSub.unsubscribe(); }
        // if (this.intervalTimer) { clearInterval(this.intervalTimer); } // ## pause stop time interval
    }

}
