import { Component, OnDestroy, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { FlowSeq, NodeFlow, NodeStation } from 'src/app/models/workstation.model';
import { NodeStationService } from 'src/app/services/node-station.service';
import { UserService } from 'src/app/services/user.service';
import { GBC } from 'src/app/global/const-global';
import { Company, Factory } from 'src/app/models/app.model';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-uc-scanned-subnode',
    templateUrl: './uc-scanned-subnode.component.html',
    styleUrls: ['./uc-scanned-subnode.component.scss'],
})
export class UcScannedSubnodeComponent implements OnInit, OnDestroy {

    company: Company = GBC.clrCompany();
    factory: Factory = GBC.clrFactory();

    nodeStations: NodeStation[] = [];
    nodeStationSelect: NodeStation = GBC.clrNodeStation();
    nodeFlows: NodeFlow[] = [];
    nodeFlow: NodeFlow = GBC.clrNodeFlow();
    flowSeq: FlowSeq[] = [];

    nodeStationPageLimit = 0;

    private nodeFlowsSub: Subscription = new Subscription();
    private nodeSub: Subscription = new Subscription();
    private nodeStationSelectSub: Subscription = new Subscription();


    constructor(
        private location: Location,
        // public dialogService: DialogService,
        // public messageService: MessageService,
        // private confirmationService: ConfirmationService,
        // private messageService: MessageService,

        public userService: UserService,
        // private orderService: OrderService,
        public nsService: NodeStationService,
    ) {}

    ngOnInit(): void {
        this.location.replaceState('/'); // ## hide loocation

        this.company = this.userService.getCompany();
        this.factory = this.userService.getFactory();
        this.nodeStationPageLimit = this.nsService.nodeStationPageLimit;

        // console.log(this.nsService.nodeFlows);
        // console.log(this.nsService.nodeStations);
        // this.nodeStations
        // getNodeFlows(companyID: string, factoryID: string, page: number, limit: number)

        // ## get basic data for node station
        const status1 = ['a'];
        this.nsService.getDataNodeStation(this.company.companyID, this.factory.factoryID, status1);

        const status = ['a','c','d'];
        // this.getNodeStations(status);
        this.nodeStations = this.nsService.nodeStations;

        this.getNodeFlows();
        this.getNodeStationSelectListener();
    }

    getNodeStationSelectListener() {
        // this.userService.nodeStationSelectUpdated.next({ nodeStation: NodeStation });
        if (this.nodeStationSelectSub) { this.nodeStationSelectSub.unsubscribe(); }
        this.nodeStationSelectSub = this.userService.getNodeStationSelectListener().subscribe((data) => {
            this.nodeStationSelect =data.nodeStation;
        });
    }

    // // getNodeStationSelectListener()
    // // this.userService.nodeStationSelectUpdated.next({ nodeStation: NodeStation });
    // nodeStationSelectUpdated = new Subject<{ nodeStation: NodeStation}>();

    selectFlowSeq(flowSeq: FlowSeq) {
        // const subNodeFlowCostSelectF = this.subNodeFlowCostSelect.filter(i=>(i.nodeID === flowSeq.nodeID));
        const nodeStationF = this.nodeStations.filter(i=>(i.nodeID === flowSeq.nodeID))[0];
        this.nsService.nodeStation = nodeStationF;
        this.nodeStationSelect = nodeStationF;
    }

    getNodeFlows() {
        // getNodeFlows(companyID: string, factoryID: string, page: number, limit: number)
        this.nsService.getNodeFlows(this.company.companyID, this.factory.factoryID, 1 , 100);
        if (this.nodeFlowsSub) { this.nodeFlowsSub.unsubscribe(); }
        this.nodeFlowsSub = this.nsService.getNodeFlowsUpdatedListener()
        .subscribe((data) => {
            // console.log(data);
            this.nodeFlows = data.nodeFlows;
            // console.log(this.nodeFlows);
            if (this.nodeFlows.length > 0) {
                this.flowSeq = this.nodeFlows[0].flowSeq;
                // console.log(this.flowSeq);
            }
        });
    }

    getNodeStations(status: string[]) {
        // getNodeStations(companyID: string, factoryID: string, status: string[], page: number, limit: number)
        // const status = ['a','c','d'];
        this.nsService.getNodeStations(this.company.companyID, this.factory.factoryID, status, 1 , this.nodeStationPageLimit );
        if (this.nodeSub) { this.nodeSub.unsubscribe(); }
        this.nodeSub = this.nsService.getNodeStationsUpdatedListener().subscribe((data) => {
            // console.log(data);
            this.nodeStations = data.nodeStations;
        });
    }

    ngOnDestroy(): void {
        this.nsService.nodeStation = GBC.clrNodeStation();
        if (this.nodeFlowsSub) { this.nodeFlowsSub.unsubscribe(); }
        if (this.nodeSub) { this.nodeSub.unsubscribe(); }
        if (this.nodeStationSelectSub) { this.nodeStationSelectSub.unsubscribe(); }
        // if (this.dataAroundNodeAppSub) { this.dataAroundNodeAppSub.unsubscribe(); }
        // if (this.repCurrentProductQtyCFNSub) { this.repCurrentProductQtyCFNSub.unsubscribe(); }

        // if (this.errSub) { this.errSub.unsubscribe(); }
        // if (this.langSub) { this.langSub.unsubscribe(); }
        // if (this.langListSub) { this.langListSub.unsubscribe(); }

        // this.userService.setOrderProduction(this.userService.clrOrderProduction());
    }
}
