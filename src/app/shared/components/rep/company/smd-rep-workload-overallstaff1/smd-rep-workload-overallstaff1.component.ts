import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { GBC } from 'src/app/global/const-global';
import { Company, Factory } from 'src/app/models/app.model';
import { SubNodeStaffScan } from 'src/app/models/report.model';
import { StaffList } from 'src/app/models/user.model';
import { NodeStation, SubNodeflowC } from 'src/app/models/workstation.model';
import { NodeStationService } from 'src/app/services/node-station.service';
import { ReportService } from 'src/app/services/report.service';
import { UserService } from 'src/app/services/user.service';

@Component({
    selector: 'app-smd-rep-workload-overallstaff1',
    templateUrl: './smd-rep-workload-overallstaff1.component.html',
    styleUrls: ['./smd-rep-workload-overallstaff1.component.scss'],
})
export class SmdRepWorkloadOverallstaff1Component implements OnInit, OnDestroy {
    @Input() nodeStation: NodeStation = GBC.clrNodeStation();
    @Input() stationID = '';

    company: Company = GBC.clrCompany();
    factory: Factory = GBC.clrFactory();
    // nodeStation: NodeStation = GBC.clrNodeStation();
    // stationID = ''
    nodeID = '';

    data: any;

    readonlyInput = true;
    dateFormat = 'dd/mm/yy';
    dayDiff = -1; // ##  -1 not yet to select date / default

    subNodeStaffScan: SubNodeStaffScan[] = []
    subNodeflowC: SubNodeflowC[] = [];
    staffs: StaffList[] = [];

    date1 = '';
    date2 = '';
    date12: Date[] = [];
    orderIDs: string[] = [];
    nodeIDs: string[] = [];
    nodeIDs2: string[] = [];
    subNodeIDs: string[] = [];
    dayMonthUTCs: string[] = [];
    subNodeflowCs: SubNodeflowC[] = [];

    summarySubNode: any[] = [];



    private repSubNodeStaffScanDate12OverallSub: Subscription = new Subscription;

    constructor(
        public userService: UserService,
        // private orderService: OrderService,
        public nsService: NodeStationService,
        private repService: ReportService
    ) {}



    ngOnInit(): void {
        // console.log('SmdRepWorkloadOverallstaff1Component');
        this.userService.staffListSelectUpdated.next({ staffList: GBC.clrStaffList() }); // ## clear staff image

        this.company = this.userService.getCompany();
        this.factory = this.userService.getFactory();
        this.nodeStation = this.nodeStation.nodeID === '' ? this.nsService.nodeStation : this.nodeStation;
        this.stationID = this.stationID === '' ? this.nsService.stationID : this.stationID;
        this.nodeID = this.nodeStation.nodeID;
        this.subNodeflowC = this.nsService.subNodeflowC;

        // console.log(this.subNodeflowC);

        this.date12[0] = new Date();
        this.date12[1] = new Date();
        this.getRepSubNodeStaffScanDate12Overall();

    }

    getRepSubNodeStaffScanDate12Overall() {
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
        this.nsService.getRepSubNodeStaffScanDate12Overall(
            this.company.companyID, factoryIDs, [this.nodeID], this.date12, infoType
        );
        if (this.repSubNodeStaffScanDate12OverallSub) { this.repSubNodeStaffScanDate12OverallSub.unsubscribe(); }
        this.repSubNodeStaffScanDate12OverallSub = this.nsService.getRepSubNodeStaffScanListener().subscribe((data) => {
            // console.log(data);
            this.subNodeStaffScan = data.subNodeStaffScan;
            this.staffs = data.staffs;

            this.subNodeStaffScan.forEach( (item, index) => {
                item.userID = this.getUserIDByQRCode(item.qrCode);
                // item.color = this.userService.strReplaceAll(item.color, '-', '');
            });



            this.dayMonthUTCs = Array.from(new Set(this.subNodeStaffScan.map((item: any) => item.dayMonthUTC)));
            this.orderIDs = Array.from(new Set(this.subNodeStaffScan.map((item: any) => item.orderID)));
            this.nodeIDs = Array.from(new Set(this.subNodeStaffScan.map((item: any) => item.nodeID)));
            this.subNodeIDs = Array.from(new Set(this.subNodeStaffScan.map((item: any) => item.subNodeID)));

            this.nodeIDs.sort();
            this.nodeIDs2 = [];
            this.nodeIDs.forEach( (item, index) => {
                this.nodeIDs2.push(this.userService.strFirstAndDot(item, 15));
            });


            // console.log(this.subNodeStaffScan);
            // console.log(this.staffs);
            this.summarySubNode = [];
            // this.orderIDs = Array.from(new Set(this.subNodeStaffScan.map((item: any) => item.orderID)));
            // console.log(this.nodeID, this.orderIDs);
            const subNodeflowCs = this.getSubNodeflow(this.nodeID);
            // console.log(subNodeflowCs);
            this.orderIDs.forEach( (item, index) => {
                const summarySubNode1: any = {
                    orderID: item,

                };
            });

            // console.log(this.dayMonthUTCs, this.orderIDs, this.nodeIDs, this.subNodeIDs);

            // this.transformData();
        });
    }

    getQTYSubNode(nodeID: string, subNodeID: string, orderID: string, userID: string) {
        const companyID = this.company.companyID;
        const factoryID = this.factory.factoryID;
        // const date1 = this.userService.returnDateDDMMYYYYHHMMSign(this.date12[0], '/')
        // const date12 = date1.substr(0, 5)

        const subNodeStaffScanF = this.subNodeStaffScan.filter(i=>
            i.companyID == companyID &&
            i.factoryID == factoryID &&
            i.orderID == orderID &&
            i.nodeID == nodeID &&
            i.subNodeID == subNodeID &&
            i.userID == userID
            // i.dayMonthUTC == dayMonthUTC
        );

        if (subNodeStaffScanF.length > 0) {
            return subNodeStaffScanF[0].countQty?subNodeStaffScanF[0].countQty:'';
        }
        return '';

    }

    getTotalQTYSubNode(nodeID: string, subNodeID: string, orderID: string) {
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
            // i.dayMonthUTC == dayMonthUTC
        );

        if (subNodeStaffScanF.length > 0) {
            const totalQTY = +subNodeStaffScanF.reduce((prev, cur) => {return prev + cur.countQty;}, 0);
            return totalQTY;
        }
        return '';

    }

    getSubNodeflow(nodeID: string) {
        // console.log(nodeID);
        // ## order seq for subNodeIDs
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

    getStaffFromNodeID(nodeID: string) {
        // let staffIDArr: string[] = [];
        const subNodeStaffScanF = this.subNodeStaffScan.filter(i=>i.nodeID == nodeID);
        let subNodeStaffScanFF: any[] = [];
        subNodeStaffScanF.forEach( (item, index) => {
            // const idx = this.colors.findIndex( fi =>(fi.color.colorID === colorCode));
            const idx = subNodeStaffScanFF.findIndex( fi =>(
                fi.userID === item.userID
                && fi.qrCode === item.qrCode
                && fi.orderID === item.orderID
            ));
            if (idx < 0) {
                subNodeStaffScanFF.push(item);
            }
        });


        subNodeStaffScanFF.sort((a,b)=>{
            return a.userID >b.userID?1:a.userID <b.userID?-1:0
            || a.qrCode >b.qrCode?1:a.qrCode <b.qrCode?-1:0
            || a.orderID >b.orderID?1:a.orderID <b.orderID?-1:0
        });

        // subNodeStaffScanF.forEach( (item, index) => {
        //     staffIDArr.push(item.qrCode);
        // });
        // // orderIDArr = Array.from(new Set(this.subNodeStaffScan.map((item: any) => item)));
        // staffIDArr = [...new Set(staffIDArr)];
        // staffIDArr.sort();
        // console.log(subNodeStaffScanF);
        return subNodeStaffScanFF;
    }

    selectStaff(userID: string) {
        const staffsF = this.staffs.filter(i=>i.userID == userID);
        if (staffsF.length > 0) {
            this.userService.staffListSelectUpdated.next({ staffList: staffsF[0] }); // ##
        } else {
            this.userService.staffListSelectUpdated.next({ staffList: GBC.clrStaffList() }); // ## clear staff image
        }
    }

    // staffs: StaffList[]
    getUserIDByQRCode(qrCode: string) {
        const staffsF = this.staffs.filter(i=>i.qrCode == qrCode);
        if (staffsF.length > 0) {
            return staffsF[0].userID;
        }
        return '';
    }

    getUserNameByQRCode(qrCode: string) {
        const staffsF = this.staffs.filter(i=>i.qrCode == qrCode);
        if (staffsF.length > 0) {
            return staffsF[0].userName;
        }
        return '';
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
        this.getRepSubNodeStaffScanDate12Overall();
    }

    clearData() {
        this.subNodeStaffScan = [];
        // this.subNodeStaffScanStyleZoneColorSize = [];
        // this.subNodeStaffScanStyleZoneColorSizeData = [];
        this.dayMonthUTCs = [];
        this.orderIDs = [];
        this.nodeIDs = [];
        this.subNodeIDs = [];
        this.nodeIDs2 = [];
        this.staffs = [];

    }

    getAllColumn(nodeID: string, colLenExtra: number) {
        // console.log('getAllColumn');
        const data = this.getSubNodeflow(nodeID);
        return data.length + colLenExtra;
    }

    ngOnDestroy(): void {
        // this.userService.staffListSelectUpdated.next({ staffList: GBC.clrStaffList() }); // ## clear staff image
        if (this.repSubNodeStaffScanDate12OverallSub) { this.repSubNodeStaffScanDate12OverallSub.unsubscribe(); }
        // if (this.nodeFlowSub) { this.nodeFlowSub.unsubscribe(); }

        // if (this.langSub) { this.langSub.unsubscribe(); }
        // if (this.dataAroundAppSub) { this.dataAroundAppSub.unsubscribe(); }
    }

}
