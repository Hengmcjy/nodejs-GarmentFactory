import { Component, OnInit } from '@angular/core';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { GBC } from 'src/app/global/const-global';
import { Company, Factory } from 'src/app/models/app.model';
import { FlowSeq, NodeFlow, NodeProblem, NodeStation } from 'src/app/models/workstation.model';
import { NodeStationService } from 'src/app/services/node-station.service';
import { UserService } from 'src/app/services/user.service';

@Component({
    selector: 'app-s-node-product-select-problem',
    templateUrl: './s-node-product-select-problem.component.html',
    styleUrls: ['./s-node-product-select-problem.component.scss'],
})
export class SNodeProductSelectProblemComponent implements OnInit {

    nodeStation: NodeStation = GBC.clrNodeStation();
    nodeStations: NodeStation[] = [];
    company: Company = GBC.clrCompany();
    factory: Factory = GBC.clrFactory();
    nodeFlow: NodeFlow = GBC.clrNodeFlow();
    flowSeq: FlowSeq[] = [];
    nodeIDs: string[] = [];
    data: any;
    productBarcodeNo = '';

    constructor(
        public config: DynamicDialogConfig,
        public ref: DynamicDialogRef,

        public userService: UserService,
        public nsService: NodeStationService,
    ) {}

    ngOnInit(): void {
        this.nodeStation = this.nsService.nodeStation;
        this.nodeStations = this.nsService.nodeStations;
        this.company = this.userService.getCompany();
        this.factory = this.userService.getFactory();
        this.nodeFlow = this.nsService.nodeFlow;
        this.flowSeq = this.nodeFlow.flowSeq;

        this.data = this.config.data;
        this.productBarcodeNo = this.data.productBarcodeNo;

        // console.log(this.nodeStation);
        // console.log(this.nodeStations);
        // console.log(this.nodeFlow);
        // console.log(this.flowSeq);

        this.managaeProblem();

    }

    selectProblem(nodeID: string, nodeProblem: NodeProblem) {
        const data = {
            nodeID: nodeID,
            nodeProblem: nodeProblem,
            selected: true
        };
        this.ref.close(data);
    }

    // closeDialog(targetPlace: TargetPlaceS) {
    //     this.ref.close(targetPlace);
    // }

    findNodeProblem(nodeID: string) {
        const nodeStationP = this.nodeStations.filter(i => (i.nodeID === nodeID));
        // const payForwardCompany = await forwardCompanyStatementAllTotal.filter(i => (i.mode == 'payForwardCompany'));
        // console.log(nodeStationP[0].nodeProblem);
        if (nodeStationP.length > 0) {
            return nodeStationP[0].nodeProblem;
        }
        return [];
    }

    managaeProblem() {
        let flowSeqArr: FlowSeq[] = [];
        this.nodeIDs = [];
        this.flowSeq.sort((a,b)=>{return a.seqNo >b.seqNo?1:a.seqNo <b.seqNo?-1:0});
        // console.log(this.flowSeq, this.nodeStation.nodeID);

        const idx = this.flowSeq.findIndex(i=>(i.nodeID === this.nodeStation.nodeID));
        // console.log('idx === >'  , idx);
        if (idx >= 0) {
            flowSeqArr = this.flowSeq.slice(0, idx+1);
            flowSeqArr.forEach( (item, index) => {
                this.nodeIDs.push(item.nodeID);
            });
            // console.log(this.nodeIDs);
        }
    }
}
