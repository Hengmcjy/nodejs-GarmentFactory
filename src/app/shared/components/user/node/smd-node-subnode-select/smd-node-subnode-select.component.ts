import { Component, OnInit } from '@angular/core';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { SubNodeFlowCost } from 'src/app/models/order.model';
import { UserService } from 'src/app/services/user.service';

@Component({
    selector: 'app-smd-node-subnode-select',
    templateUrl: './smd-node-subnode-select.component.html',
    styleUrls: ['./smd-node-subnode-select.component.scss'],
})
export class SmdNodeSubnodeSelectComponent implements OnInit {

    data: any;
    subNodeFlowCost: SubNodeFlowCost[] = [];
    subNodeFlowCostSelect: SubNodeFlowCost[] = [];

    constructor(
        public config: DynamicDialogConfig,
        public ref: DynamicDialogRef,

        public userService: UserService,
        // private productService: ProductService,
        // private socketService: SocketIOService,
        // public nsService: NodeStationService,
    ) {}

    ngOnInit(): void {
        this.data = this.config.data;
        this.subNodeFlowCost = this.data.subNodeFlowCost;
        this.subNodeFlowCost.sort((a,b)=>{
            return a.nodeID >b.nodeID?1:a.nodeID <b.nodeID?-1:0
                || a.seq >b.seq?1:a.seq <b.seq?-1:0
        });
        // console.log(this.subNodeFlowCost);

        this.subNodeFlowCostSelect = [];
    }

    addSelect(subNodeFlowCost: SubNodeFlowCost) {
        const idx = this.subNodeFlowCostSelect.findIndex( fi =>(fi.subNodeID === subNodeFlowCost.subNodeID));
        // const subNodeFlowCostF = this.subNodeFlowCostSelect.filter(fi => fi.subNodeID === subNodeFlowCost.subNodeID);
        if (idx < 0) {
            this.subNodeFlowCostSelect.push(subNodeFlowCost);
            this.subNodeFlowCostSelect.sort((a,b)=>{
                return a.nodeID >b.nodeID?1:a.nodeID <b.nodeID?-1:0
                    || a.seq >b.seq?1:a.seq <b.seq?-1:0
            });
        } else {
            this.subNodeFlowCostSelect.splice(idx, 1);
            this.subNodeFlowCostSelect.sort((a,b)=>{
                return a.nodeID >b.nodeID?1:a.nodeID <b.nodeID?-1:0
                    || a.seq >b.seq?1:a.seq <b.seq?-1:0
            });
        }
    }

    checkSubNodeSelected(subNodeFlowCost: SubNodeFlowCost) {
        // const qtySum = this.productionQueuedQtySum.filter(i=>(i.productBarcode === productBarcode));
        const subNodeFlowCostF = this.subNodeFlowCostSelect.filter(fi => fi.subNodeID === subNodeFlowCost.subNodeID);
        return subNodeFlowCostF.length>0?'p-button-raised':'p-button-outlined';
    }

    selectCommit() {
        this.closeDialog()
    }

    closeDialog() {
        this.subNodeFlowCostSelect.sort((a,b)=>{
            return a.nodeID >b.nodeID?1:a.nodeID <b.nodeID?-1:0
                || a.seq >b.seq?1:a.seq <b.seq?-1:0
        });
        const data = this.subNodeFlowCostSelect;
        this.ref.close(data);
    }

}
