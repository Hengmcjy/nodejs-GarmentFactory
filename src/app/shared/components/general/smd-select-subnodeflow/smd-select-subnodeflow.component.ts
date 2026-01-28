import { Component, OnInit } from '@angular/core';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { GBC } from 'src/app/global/const-global';
import { SubNodeFlow } from 'src/app/models/order.model';

@Component({
    selector: 'app-smd-select-subnodeflow',
    templateUrl: './smd-select-subnodeflow.component.html',
    styleUrls: ['./smd-select-subnodeflow.component.scss'],
})
export class SmdSelectSubnodeflowComponent implements OnInit {
    data: any;

    seq = 0;
    nodeID = '';
    subNodeFlow: SubNodeFlow[] = [];
    subNodeFlowChoice: SubNodeFlow[] = [];
    // subNodeFlowSelect: SubNodeFlow = GBC.clrSubNodeFlow();

    constructor(
        public config: DynamicDialogConfig,
        public ref: DynamicDialogRef,

        // public userService: UserService
    ) {}


    ngOnInit(): void {
        this.data = this.config.data;
        this.seq = this.data.seq;
        this.nodeID = this.data.nodeID;
        this.subNodeFlow = this.data.subNodeFlow;
        this.subNodeFlowChoice = this.subNodeFlow.filter(i=>(i.nodeID === this.nodeID));
        this.subNodeFlowChoice.sort((a,b)=>{
            return a.seq >b.seq?1:a.seq <b.seq?-1:0
        });
        // this.getSelectFactoryDialogSelect();
        // console.log(this.seq, this.nodeID, this.subNodeFlow);
        // console.log(this.subNodeFlowChoice);
    }

    selectSubNode(subNodeFlow: SubNodeFlow) {
        // console.log(this.subNodeFlowSelect);
        this.closeDialog(subNodeFlow);
    }

    closeDialog(subNodeFlow: SubNodeFlow) {
        const seq = this.seq;
        const data = {seq, subNodeFlow};
        this.ref.close(data);
    }
}
