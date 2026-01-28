import { Component, Input, OnDestroy, OnInit } from '@angular/core';
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
    selector: 'app-s-rep-workload-overall2',
    templateUrl: './s-rep-workload-overall2.component.html',
    styleUrls: ['./s-rep-workload-overall2.component.scss'],
})
export class SRepWorkloadOverall2Component implements OnInit, OnDestroy {
    @Input() nodeStation: NodeStation = GBC.clrNodeStation();
    @Input() stationID = '';

    userImageProfileGCSPath = GBC.userImageProfileGCSPath;  // ## google storage path user image profile

    company: Company = GBC.clrCompany();
    factory: Factory = GBC.clrFactory();
    // nodeStation: NodeStation = GBC.clrNodeStation();
    nodeID = '';
    // stationID = ''; // station1 , station2

    menuSelect = 'overall';
    // staffSelect: StaffList = GBC.clrStaffList();

    staffListSelect: StaffList = GBC.clrStaffList();

    // subNodeStaffScan: SubNodeStaffScan[] = []
    // subNodeflowC: SubNodeflowC[] = [];

    // date12: Date[] = [];
    // orderIDs: string[] = [];
    // subNodeIDs: string[] = [];
    // dayMonthUTCs: string[] = [];
    // subNodeflowCs: SubNodeflowC[] = [];

    // private repSubNodeStaffScanDate12OverallSub: Subscription = new Subscription;
    private staffListSelectSub: Subscription = new Subscription;

    constructor(
        public userService: UserService,
        // private orderService: OrderService,
        public nsService: NodeStationService,
        private repService: ReportService
    ) {}

    ngOnInit(): void {


        this.company = this.userService.getCompany();
        this.factory = this.userService.getFactory();
        this.nodeStation = this.nodeStation.nodeID === '' ? this.nsService.nodeStation : this.nodeStation;
        this.stationID = this.stationID === '' ? this.nsService.stationID : this.stationID;
        this.nodeID = this.nodeStation.nodeID;
        // this.subNodeflowC = this.nsService.subNodeflowC;

        // console.log(this.subNodeflowC);

        // this.getRepSubNodeStaffScanDate12Overall();
        this.getStaffListSelectListener();
    }

    getStaffListSelectListener() {
        // this.userService.getStaffListSelectListener();
        if (this.staffListSelectSub) { this.staffListSelectSub.unsubscribe(); }
        this.staffListSelectSub = this.userService.getStaffListSelectListener().subscribe((data) => {
            this.staffListSelect = data.staffList;
        });
    }

    // getRepSubNodeStaffScanDate12Overall() {
    //     // getRepSubNodeStaffScanDate12Overall(
    //     //     companyID: string, factoryIDs: string[],
    //     //     nodeID: string,
    //     //     date12: Date[], infoType: string
    //     // )
    //     this.date12[0] = new Date();
    //     this.date12[1] = new Date();
    //     // console.log(this.date12);
    //     const factoryIDs = [this.factory.factoryID];
    //     const infoType = 'staffProduction'; // ##  infoType = call by who {staffOffice, 'staffProduction'}
    //     this.nsService.getRepSubNodeStaffScanDate12Overall(
    //         this.company.companyID, factoryIDs, this.nodeID, this.date12, infoType
    //     );
    //     if (this.repSubNodeStaffScanDate12OverallSub) { this.repSubNodeStaffScanDate12OverallSub.unsubscribe(); }
    //     this.repSubNodeStaffScanDate12OverallSub = this.nsService.getRepSubNodeStaffScanListener().subscribe((data) => {
    //         // console.log(data);
    //         this.subNodeStaffScan = data.subNodeStaffScan;
    //         // console.log(this.subNodeStaffScan);

    //         this.dayMonthUTCs = Array.from(new Set(this.subNodeStaffScan.map((item: any) => item.dayMonthUTC)));
    //         this.orderIDs = Array.from(new Set(this.subNodeStaffScan.map((item: any) => item.orderID)));
    //         this.subNodeIDs = Array.from(new Set(this.subNodeStaffScan.map((item: any) => item.subNodeID)));
    //         console.log(this.dayMonthUTCs, this.orderIDs, this.subNodeIDs);

    //         this.transformData();
    //     });
    // }

    // transformData() {
    //     // ## order seq for subNodeIDs
    //     this.subNodeflowCs = [];
    //     this.subNodeIDs.forEach( (item, index) => {
    //         const subNodeflowCF = this.subNodeflowC.filter(i=>i.nodeID == this.nodeID && i.subNodeID === item);
    //         if (subNodeflowCF.length > 0) {
    //             this.subNodeflowCs.push(subNodeflowCF[0]);
    //         }
    //     });
    //     this.subNodeflowCs.sort((a,b)=>{
    //         return  a.seq >b.seq?1:a.seq <b.seq?-1:0
    //     });
    //     console.log(this.subNodeflowCs);
    // }

    selectMenu(menu: string) {
        this.staffListSelect = GBC.clrStaffList();
        this.menuSelect = menu;
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
        if (this.staffListSelectSub) { this.staffListSelectSub.unsubscribe(); }
        // if (this.nodeFlowSub) { this.nodeFlowSub.unsubscribe(); }

        // if (this.langSub) { this.langSub.unsubscribe(); }
        // if (this.dataAroundAppSub) { this.dataAroundAppSub.unsubscribe(); }
    }

}

