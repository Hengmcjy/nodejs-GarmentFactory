import { Component, OnInit } from '@angular/core';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { DynamicDialogConfig } from 'primeng/dynamicdialog';
import { FlowSeq, NodeFlow } from 'src/app/models/workstation.model';

@Component({
    selector: 'app-s-department-production',
    templateUrl: './s-department-production.component.html',
    styleUrls: ['./s-department-production.component.scss'],
})
export class SDepartmentProductionComponent implements OnInit {

    data: any;
    mode = 'new-create-queue';
    nodeFlows: NodeFlow[] = [];
    flowSeq: FlowSeq[] = [];
    flowSeqOutsourceSelect: FlowSeq[] = [];

    constructor(
        public config: DynamicDialogConfig,
        public ref: DynamicDialogRef,
    ) {}

    ngOnInit(): void {
        this.data = this.config.data
        this.mode = this.data.mode;
        this.nodeFlows = this.data.nodeFlows;
        this.flowSeq = this.data.flowSeq;
        // console.log(this.flowSeq);
    }

    checkNodeSelected(flowSeq: FlowSeq) {
        // const qtySum = this.productionQueuedQtySum.filter(i=>(i.productBarcode === productBarcode));
        const flowSeqF = this.flowSeqOutsourceSelect.filter(i=>(i.seqNo === flowSeq.seqNo));
        return flowSeqF.length>0?'button-raised':'p-button-text';
    }

    selectFlowSeq(flowSeq: FlowSeq) {
        // console.log(flowSeq);
        // ## case = new-create-queue
        if (this.mode === 'new-create-queue' && this.flowSeqOutsourceSelect.length === 0 && +flowSeq.seqNo === 1) {
            this.flowSeqOutsourceSelect.push(flowSeq);
        } else  if (this.mode === 'new-create-queue'
            && this.flowSeqOutsourceSelect.length > 0
            && +this.flowSeqOutsourceSelect[0].seqNo === 1) {
            // console.log(+this.flowSeqOutsourceSelect[+this.flowSeqOutsourceSelect.length - 1].seqNo);
            // console.log(+flowSeq.seqNo);
            if (Math.abs(+this.flowSeqOutsourceSelect[+this.flowSeqOutsourceSelect.length - 1].seqNo - +flowSeq.seqNo) === 1) {
                this.flowSeqOutsourceSelect.push(flowSeq);
            } else {
                this.flowSeqOutsourceSelect = [];
            }
        } else { // ## select wrong order by
            this.flowSeqOutsourceSelect = [];
        }
        // console.log(this.flowSeqOutsourceSelect);
    }

    selectCommit() {
        this.ref.close(this.flowSeqOutsourceSelect);
    }

}
