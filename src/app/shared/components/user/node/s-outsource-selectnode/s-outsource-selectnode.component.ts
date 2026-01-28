import { Component, OnInit } from '@angular/core';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { DynamicDialogConfig } from 'primeng/dynamicdialog';
import { FlowSeq, NodeFlow } from 'src/app/models/workstation.model';
import { UserService } from 'src/app/services/user.service';

@Component({
    selector: 'app-s-outsource-selectnode',
    templateUrl: './s-outsource-selectnode.component.html',
    styleUrls: ['./s-outsource-selectnode.component.scss'],
})
export class SOutsourceSelectnodeComponent implements OnInit {

    data: any;
    mode = 'outsource-select-nodeID';
    selectType = '';
    // nodeFlows: NodeFlow[] = [];
    flowSeq1: FlowSeq[] = [];
    flowSeq2: FlowSeq[] = [];
    flowSeqOutsourceSelect1: FlowSeq[] = [];
    flowSeqOutsourceSelect2: FlowSeq[] = [];
    noOutsourceNodeIDs: string[] = [];

    constructor(
        public config: DynamicDialogConfig,
        public ref: DynamicDialogRef,

        public userService: UserService,
    ) {}

    ngOnInit(): void {
        this.data = this.config.data
        this.mode = this.data.mode;
        this.selectType = this.data.selectType;
        // this.nodeFlows = this.data.nodeFlows;
        this.flowSeq1 = this.data.flowSeq;
        this.flowSeq2 = [...this.flowSeq1];
        this.noOutsourceNodeIDs = this.userService.noOutsourceNodeIDs;
        // console.log(this.flowSeq1);
    }

    // objectsEqual = (o1: any, o2: any): boolean => {
    //     if (o2 === null && o1 !== null) return false;
    //     return o1 !== null && typeof o1 === 'object' && Object.keys(o1).length > 0 ?
    //         Object.keys(o1).length === Object.keys(o2).length &&
    //         Object.keys(o1).every(p => this.objectsEqual(o1[p], o2[p]))
    //         : (o1 !== null && Array.isArray(o1) && Array.isArray(o2) && !o1.length &&
    //         !o2.length) ? true : o1 === o2;
    // }

    checkDisableNoOutsource(nodeID: string) {
        const isNodeIDDisable = this.noOutsourceNodeIDs.includes(nodeID);
        return isNodeIDDisable;
    }

    checkNodeSelected1(flowSeq: FlowSeq) {
        // const qtySum = this.productionQueuedQtySum.filter(i=>(i.productBarcode === productBarcode));
        const flowSeqF = this.flowSeqOutsourceSelect1.filter(i=>(i.seqNo === flowSeq.seqNo));
        return flowSeqF.length>0?'button-raised':'p-button-text';
    }

    checkNodeSelected2(flowSeq: FlowSeq) {
        // const qtySum = this.productionQueuedQtySum.filter(i=>(i.productBarcode === productBarcode));
        const flowSeqF = this.flowSeqOutsourceSelect2.filter(i=>(i.seqNo === flowSeq.seqNo));
        return flowSeqF.length>0?'button-raised':'p-button-text';
    }

    selectFlowSeq1(flowSeq: FlowSeq) {
        // console.log(flowSeq);
        // ## case = new-create-queue
        if (this.selectType === 'many') {
            if (this.mode === 'outsource-select-nodeID' && this.flowSeqOutsourceSelect1.length === 0) {
                this.flowSeqOutsourceSelect1.push(flowSeq);
            } else  if (this.mode === 'outsource-select-nodeID' && this.flowSeqOutsourceSelect1.length > 0) {
                // console.log(+this.flowSeqOutsourceSelect[+this.flowSeqOutsourceSelect.length - 1].seqNo);
                // console.log(+flowSeq.seqNo);
                const flowSeqOutsourceSelectF = this.flowSeqOutsourceSelect1.filter(i=>(i.seqNo === flowSeq.seqNo));
                if (flowSeqOutsourceSelectF.length > 0) {
                    this.flowSeqOutsourceSelect1 = [];
                } else if (Math.abs(+this.flowSeqOutsourceSelect1[+this.flowSeqOutsourceSelect1.length - 1].seqNo - +flowSeq.seqNo) === 1) {
                    this.flowSeqOutsourceSelect1.push(flowSeq);
                } else if ((Math.abs(+this.flowSeqOutsourceSelect1[0].seqNo - +flowSeq.seqNo) === 1)) {
                    this.flowSeqOutsourceSelect1.push(flowSeq);
                } else {
                    this.flowSeqOutsourceSelect1 = [];
                }
            } else { // ## select wrong order by
                this.flowSeqOutsourceSelect1 = [];
            }
        } else if (this.selectType === 'one') {
            this.flowSeqOutsourceSelect1 = [];
            this.flowSeqOutsourceSelect1.push(flowSeq);
        }
        // console.log(this.flowSeqOutsourceSelect);
        this.flowSeqOutsourceSelect1.sort((a,b)=>{
            return a.seqNo >b.seqNo?1:a.seqNo <b.seqNo?-1:0
        });
    }

    selectFlowSeq2(flowSeq: FlowSeq) {
        // console.log(flowSeq);
        // ## case = new-create-queue
        if (this.selectType === 'many') {
            if (this.mode === 'outsource-select-nodeID' && this.flowSeqOutsourceSelect2.length === 0) {
                this.flowSeqOutsourceSelect2.push(flowSeq);
            } else  if (this.mode === 'outsource-select-nodeID' && this.flowSeqOutsourceSelect2.length > 0) {
                // console.log(+this.flowSeqOutsourceSelect[+this.flowSeqOutsourceSelect.length - 1].seqNo);
                // console.log(+flowSeq.seqNo);
                const flowSeqOutsourceSelectF = this.flowSeqOutsourceSelect2.filter(i=>(i.seqNo === flowSeq.seqNo));
                if (flowSeqOutsourceSelectF.length > 0) {
                    this.flowSeqOutsourceSelect2 = [];
                } else if (Math.abs(+this.flowSeqOutsourceSelect2[+this.flowSeqOutsourceSelect2.length - 1].seqNo - +flowSeq.seqNo) === 1) {
                    this.flowSeqOutsourceSelect2.push(flowSeq);
                } else if ((Math.abs(+this.flowSeqOutsourceSelect2[0].seqNo - +flowSeq.seqNo) === 1)) {
                    this.flowSeqOutsourceSelect2.push(flowSeq);
                } else {
                    this.flowSeqOutsourceSelect2 = [];
                }
            } else { // ## select wrong order by
                this.flowSeqOutsourceSelect2 = [];
            }
        } else if (this.selectType === 'one') {
            this.flowSeqOutsourceSelect2 = [];
            this.flowSeqOutsourceSelect2.push(flowSeq);
        }
        // console.log(this.flowSeqOutsourceSelect);
        this.flowSeqOutsourceSelect2.sort((a,b)=>{
            return a.seqNo >b.seqNo?1:a.seqNo <b.seqNo?-1:0
        });
    }

    selectCommit() {
        this.ref.close(this.flowSeqOutsourceSelect1);
    }

}
