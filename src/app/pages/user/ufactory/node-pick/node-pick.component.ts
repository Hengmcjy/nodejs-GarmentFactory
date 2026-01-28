import { FlowSeq } from './../../../../models/workstation.model';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';

import { UserService } from 'src/app/services/user.service';
import { NodeStationService } from 'src/app/services/node-station.service';
import { Company, Factory } from 'src/app/models/app.model';
import { NodeFlow, NodeStation } from 'src/app/models/workstation.model';
import { MessageService } from 'primeng/api';
import { GBC } from 'src/app/global/const-global';

interface NodeIDSet {
    nodeID: string;
}

@Component({
    selector: 'app-node-pick',
    templateUrl: './node-pick.component.html',
    styleUrls: ['./node-pick.component.scss'],
    providers: [MessageService],
})
export class NodePickComponent implements OnInit, OnDestroy {
    formActive = 'nodeFlowPick';
    formName = this.formActive;
    isdragdrop = true;

    nodeFlowID = '';
    nodeFlow: NodeFlow = GBC.clrNodeFlow();

    nodeStationPageLimit = 0;
    // userID = this.userService.getUserID();
    // userName = this.userService.getUser().uInfo.userName;
    company: Company = GBC.clrCompany();
    factory: Factory = GBC.clrFactory();
    nodeStations: NodeStation[] = [];

    nodeID1: NodeIDSet[] = [];
    nodeID2: NodeIDSet[] = [];

    test: any[] = [
        { id: 1, a: 'aaa', b: 'bbb' },
        { id: 2, a: 'aaa', b: 'bbb' },
        { id: 3, a: 'aaa', b: 'bbb' },
        { id: 4, a: 'aaa', b: 'bbb' },
        { id: 5, a: 'aaa', b: 'bbb' },
        { id: 6, a: 'aaa', b: 'bbb' },
        { id: 7, a: 'aaa', b: 'bbb' },
        { id: 8, a: 'aaa', b: 'bbb' },
        { id: 9, a: 'aaa', b: 'bbb' },
        { id: 10, a: 'aaa', b: 'bbb' },
    ];

    test2: any[] = [{ id: 11, a: 'aaa', b: 'bbb' }];

    private nodeSub: Subscription = new Subscription();
    private nodeFlowsSub: Subscription = new Subscription();

    constructor(
        private location: Location,
        private route: ActivatedRoute,
        public messageService: MessageService,
        // private router: Router,

        private userService: UserService,
        public nsService: NodeStationService,
    ) {}

    async ngOnInit() {
        this.company = this.userService.getCompany();
        this.factory = this.userService.getFactory();
        this.nodeStationPageLimit = this.nsService.nodeStationPageLimit;
        // console.log(this.route.snapshot.queryParamMap.get('nodeFlowID') + '');
        this.nodeFlowID = this.route.snapshot.queryParamMap.get('nodeFlowID') + '';
        this.nodeFlow = await this.nsService.getNodeFlow1(this.nodeFlowID);
        this.setNodeID2();


        this.location.replaceState('/'); // ## hide loocation

        const status = ['a', 'c'];  // ## get only status = active , close
        this.getNodeStations(status);
        this.getNodeFlowsUpdatedListener();
    }

    getNodeStations(status: string[]) {
        // getNodeStations(companyID: string, factoryID: string, status: string[], page: number, limit: number)
        // const status = ['a','c','d'];
        this.nsService.getNodeStations(this.company.companyID, this.factory.factoryID, status, 1 , 1000 );  //## 1000 get all node
        if (this.nodeSub) { this.nodeSub.unsubscribe(); }
        this.nodeSub = this.nsService.getNodeStationsUpdatedListener().subscribe((data) => {
            // console.log(data);
            this.nodeStations = data.nodeStations;
            this.setNodeID1();
        });
    }

    getNodeFlowsUpdatedListener() {
        if (this.nodeFlowsSub) { this.nodeFlowsSub.unsubscribe(); }
        this.nodeFlowsSub = this.nsService.getNodeFlowsUpdatedListener().subscribe((data) => {
            // console.log(data);
            if (data.success) {
                // this.nodeFlows = data.nodeFlows;
                this.messageService.add({
                    severity:'success',
                    summary:'Node flow edit',
                    detail:'completed',
                    sticky: true
                });
            } else {
                // this.nodeFlows = [];
                // this.errID = data.message.messageID;
                // if (data.message.messageID === 'errns005') {
                //     this.messageService.add({
                //         severity:'error',
                //         summary:'Error [ ' +data.message.messageID+ ' ]',
                //         detail:'create Node Flow error [ NodeFlow create error ] ',
                //         sticky: true
                //     });
                // }
            }
        });
    }

    putNodeFlowEdit(editMode: string, nodeFlow: NodeFlow) {

        // editMode === 'flowType'  'flowCondition'  'flowSeq'
        // putNodeFlowEdit(editMode: string, nodeFlow: NodeFlow, page: number, limit: number)
        this.nsService.putNodeFlowEdit(editMode, nodeFlow, 1, 1000);
        // this.nodeFlow.flowSeq =
    }

    viewArr() {
        // console.log(this.test);
        // console.log(this.test2);
        // console.log(this.nodeID1);
        // console.log(this.nodeID2);
        this.setNodeID2ToFlowSeq();
    }

    setNodeID1() {
        for (const nodeStation of this.nodeStations) {
            if ( !this.nodeID2.some(e => e.nodeID === nodeStation.nodeID) ) {
                this.nodeID1.push({nodeID: nodeStation.nodeID});
            }
        }
        this.nodeID1 = this.nodeID1.map(fw => ({
            nodeID: fw.nodeID,
        }));
        // console.log(this.nodeID1);
    }

    setNodeID2() {
        this.nodeID2 = this.nodeFlow.flowSeq.map(fw => ({
            nodeID: fw.nodeID,
        }));
        // console.log(this.nodeID2);
    }

    setNodeID2ToFlowSeq() {
        let i = 1;
        let flowSeq: FlowSeq[] = [];
        for (const nodeIDList of this.nodeID2) {
            flowSeq.push(
                {seqNo: +i, nodeID: nodeIDList.nodeID, canScanSubNode: false}
            );
            i++;
        }
        this.nodeFlow.flowSeq = flowSeq;
    }

    ngOnDestroy(): void {
        if (this.nodeSub) { this.nodeSub.unsubscribe(); }
        if (this.nodeFlowsSub) { this.nodeFlowsSub.unsubscribe(); }
    }
}
