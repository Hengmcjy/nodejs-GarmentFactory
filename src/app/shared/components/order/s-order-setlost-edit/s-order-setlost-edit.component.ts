import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { GBC } from 'src/app/global/const-global';
import { Company, Factory } from 'src/app/models/app.model';
import { LostGroup, OPDLost, OrLost, Order, OrderProduction } from 'src/app/models/order.model';
import { FlowSeq, NodeFlow } from 'src/app/models/workstation.model';
import { NodeStationService } from 'src/app/services/node-station.service';
import { OrderService } from 'src/app/services/order.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-s-order-setlost-edit',
  templateUrl: './s-order-setlost-edit.component.html',
  styleUrls: ['./s-order-setlost-edit.component.scss']
})
export class SOrderSetlostEditComponent implements OnInit, OnDestroy {
    @Input() productBarcodeNo = '';  // ##
    @Input() orderProduct: OrderProduction = GBC.clrOrderProduction();

    company: Company = GBC.clrCompany();
    factory: Factory = GBC.clrFactory();
    order: Order = GBC.clrOrder();
    opdLosts: OPDLost[] = [];
    lostGroups: LostGroup[] = [];

    orLost: OrLost = GBC.clrOrLost();


    nodeFlows: NodeFlow[] = [];
    // nodeFlow: NodeFlow = GBC.clrNodeFlow();
    flowSeq: FlowSeq[] = [];

    flowSelect: string[] = [];
    opdLostSelect = '';
    lostGroupIDSelect = '';
    note = '';


    private nodeFlowsSub: Subscription = new Subscription();
    private putOrLostSub: Subscription = new Subscription();

    constructor(
        // public dialogService: DialogService,
        // public config: DynamicDialogConfig,
        // public ref: DynamicDialogRef,
        // private exportAsService: ExportAsService,

        public userService: UserService,
        private orderService: OrderService,
        public nsService: NodeStationService,

    ) {}

    ngOnInit(): void {
        this.company = this.userService.getCompany();
        this.factory = this.userService.getFactory();
        this.order = this.orderService.getOrder();
        // console.log(this.order);

        this.opdLosts = this.userService.getOPDLosts();
        this.lostGroups = this.userService.getLostGroups();
        // console.log(this.order);
        // console.log(this.opdLosts);
        // console.log(this.lostGroups);
        // console.log(this.orderProduct);

        this.getNodeFlows();
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

    selectNode(nodeID: string) {
        const idx = this.flowSelect.findIndex(f => f === nodeID);
        if (idx < 0) {
            this.flowSelect.push(nodeID);
        } else {
            this.flowSelect.splice(idx, 1);
        }
        this.flowSelect.sort();
    }

    // ## mode = set   ,  unset
    putOrderLost(mode: string) {
        const createBy = this.userService.getCreateBy();
        this.orLost = GBC.clrOrLost();
        this.orLost  = {
            datetime: new Date(),
            odpLostID: this.opdLostSelect,
            lostGroupID: this.lostGroupIDSelect,
            nodeID: this.flowSelect,
            note: this.note,
            createBy: createBy
        };

        const companyID = this.company.companyID;
        const orderID = this.orderProduct.orderID;
        const productBarcodeNoReal = this.orderProduct.productBarcodeNoReal;
        const bundleNo = this.orderProduct.bundleNo;
        const bundleID = this.orderProduct.bundleID;

        // console.log(this.orLost);
        this.orderService.putOrderLost(companyID, orderID, productBarcodeNoReal, bundleNo, bundleID, mode, this.orLost);
        if (this.putOrLostSub) { this.putOrLostSub.unsubscribe(); }
        this.putOrLostSub = this.orderService.getPutorderLostListener()
        .subscribe((data) => {
            // console.log(data);
            // this.nodeFlows = data.nodeFlows;
            // console.log(this.nodeFlows);
            this.flowSelect = [];
            this.opdLostSelect = '';
            this.lostGroupIDSelect = '';
            this.note = '';
            if (data.success) {
                // this.flowSeq = this.nodeFlows[0].flowSeq;
                // console.log(data.success);
                this.orderProduct.productStatus = 'lost';
            }
        });
    }

    ngOnDestroy(): void {
        if (this.nodeFlowsSub) { this.nodeFlowsSub.unsubscribe(); }
        if (this.putOrLostSub) { this.putOrLostSub.unsubscribe(); }
        // if (this.sockio) { this.sockio.unsubscribe(); }
        // if (this.dataAroundAppSub) { this.dataAroundAppSub.unsubscribe(); }
        // if (this.screenSub) { this.screenSub.unsubscribe(); }
    }
}


