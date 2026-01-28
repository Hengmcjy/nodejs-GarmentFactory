import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { GBC } from 'src/app/global/const-global';
import { Company, Factory } from 'src/app/models/app.model';
import { SubNodeStaffScan } from 'src/app/models/report.model';
import { NodeStation, SubNodeflowC } from 'src/app/models/workstation.model';
import { NodeStationService } from 'src/app/services/node-station.service';
import { ReportService } from 'src/app/services/report.service';
import { UserService } from 'src/app/services/user.service';

@Component({
    selector: 'app-smd-rep-workload-overall1',
    templateUrl: './smd-rep-workload-overall1.component.html',
    styleUrls: ['./smd-rep-workload-overall1.component.scss'],
})
export class SmdRepWorkloadOverall1Component implements OnInit, OnDestroy {
    @Input() nodeStation: NodeStation = GBC.clrNodeStation();
    @Input() stationID = '';
    // @Input() company: Company = GBC.clrCompany();
    // @Input() factory: Factory = GBC.clrFactory();
    // @Input() nodeStation: NodeStation = GBC.clrNodeStation();
    // @Input() nodeID = '';
    // @Input() stationID = ''

    company: Company = GBC.clrCompany();
    factory: Factory = GBC.clrFactory();
    // nodeStation: NodeStation = GBC.clrNodeStation();
    nodeID = '';
    // stationID = ''

    data: any;

    readonlyInput = true;
    dateFormat = 'dd/mm/yy';
    dayDiff = -1; // ##  -1 not yet to select date / default

    subNodeStaffScan: SubNodeStaffScan[] = [];
    subNodeStaffScanStyleZoneColorSize: SubNodeStaffScan[] = [];
    subNodeStaffScanStyleZoneColorSizeData: SubNodeStaffScan[] = [];
    subNodeflowC: SubNodeflowC[] = [];

    menuSelect = 'overall';
    date12: Date[] = [];
    orderIDs: string[] = [];
    nodeIDs: string[] = [];
    nodeIDs2: string[] = [];
    subNodeIDs: string[] = [];
    dayMonthUTCs: string[] = [];
    subNodeflowCs: SubNodeflowC[] = [];
    date1 = '';
    date2 = '';

    note = 'U=UK, A=ASIA, S=SHANGHAI, J=JAPAN';

    private repSubNodeStaffScanDate12OverallSub: Subscription = new Subscription;

    constructor(
        public userService: UserService,
        // private orderService: OrderService,
        public nsService: NodeStationService,
        private repService: ReportService
    ) {}



    ngOnInit(): void {
        // console.log('SmdRepWorkloadOverall1Component');
        // console.log(this.userService.getOrders());
        this.userService.staffListSelectUpdated.next({ staffList: GBC.clrStaffList() }); // ## clear staff image

        this.company = this.userService.getCompany();
        this.factory = this.userService.getFactory();
        this.nodeStation = this.nodeStation.nodeID === '' ? this.nsService.nodeStation : this.nodeStation;
        this.stationID = this.stationID === '' ? this.nsService.stationID : this.stationID;
        this.nodeID = this.nodeStation.nodeID;
        this.subNodeflowC = this.nsService.subNodeflowC;

        // console.log(this.subNodeflowC);
        // console.log(this.nodeStation);

        this.date12[0] = new Date();
        this.date12[1] = new Date();
        this.getRepSubNodeScanDate12Overall();
    }

    getRepSubNodeScanDate12Overall() {
        // getRepSubNodeStaffScanDate12Overall(
        //     companyID: string, factoryIDs: string[],
        //     nodeID: string,
        //     date12: Date[], infoType: string
        // )
        // this.date12[0] = new Date();
        // this.date12[1] = new Date();
        this.date1 = this.userService.returnDateDDMMYYYYHHMMSign(this.date12[0], '/')
        this.date2 = this.userService.returnDateDDMMYYYYHHMMSign(this.date12[1], '/')
        // console.log(this.date12);
        const factoryIDs = [this.factory.factoryID];
        const infoType = 'staffProduction'; // ##  infoType = call by who {staffOffice, 'staffProduction'}
        // console.log(this.company.companyID, factoryIDs, [this.nodeID], this.date12, infoType);
        this.nsService.getRepSubNodeScanDate12Overall(
            this.company.companyID, factoryIDs, [this.nodeID], this.date12, infoType
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

    selectDate() {
        this.clearData();
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
        // this.getRepNodeStaffScannedByDate12();
        this.getRepSubNodeScanDate12Overall();
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

    ngOnDestroy(): void {
        if (this.repSubNodeStaffScanDate12OverallSub) { this.repSubNodeStaffScanDate12OverallSub.unsubscribe(); }
        // if (this.nodeFlowSub) { this.nodeFlowSub.unsubscribe(); }

        // if (this.langSub) { this.langSub.unsubscribe(); }
        // if (this.dataAroundAppSub) { this.dataAroundAppSub.unsubscribe(); }
    }
}
