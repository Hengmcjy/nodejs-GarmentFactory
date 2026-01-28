import { Component, OnDestroy, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { OrderService } from 'src/app/services/order.service';
import { UserService } from 'src/app/services/user.service';
import { Subscription } from 'rxjs';
import { SSelectFactoryComponent } from 'src/app/shared/components/general/s-select-factory/s-select-factory.component';
import { DialogService } from 'primeng/dynamicdialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Company, Factory } from 'src/app/models/app.model';
import { GBC } from 'src/app/global/const-global';
import { SSelectOrderComponent } from 'src/app/shared/components/general/s-select-order/s-select-order.component';
import { Order, SubNodeFlow, SubNodeFlowCost, SubNodeFlowType } from 'src/app/models/order.model';
import { FlowSeq, NodeFlow, NodeStation, SubNodeflowC } from 'src/app/models/workstation.model';
import { NodeStationService } from 'src/app/services/node-station.service';
import { SmdSelectSubnodeflowComponent } from 'src/app/shared/components/general/smd-select-subnodeflow/smd-select-subnodeflow.component';

@Component({
    selector: 'app-set-cost-style-subnode',
    templateUrl: './set-cost-style-subnode.component.html',
    styleUrls: ['./set-cost-style-subnode.component.scss'],
    providers: [DialogService, MessageService, ConfirmationService],
})
export class SetCostStyleSubnodeComponent implements OnInit, OnDestroy {

    formName = 'fin-set-cost-style-subnode';

    company: Company = GBC.clrCompany();
    factorySelected: Factory = GBC.clrFactory();
    factorySelectForOrderStyle: Factory = GBC.clrFactory();
    orderSelect: Order = GBC.clrOrder();

    nodeFlow: NodeFlow = GBC.clrNodeFlow();
    subNodeflowC: SubNodeflowC[] = [];
    subNodeFlowCostSelect: SubNodeFlowCost[] = [];
    flowSeq: FlowSeq[] = [];
    nodeStations: NodeStation[] = [];

    blankSubNodeFlowCost: SubNodeFlowCost = GBC.clrSubNodeFlowCost();

    subNodeFlowTypes: SubNodeFlowType[] = [];
    subNodeFlowTypeID_DF = '';  // ## id default

    private nodeFlowSub: Subscription = new Subscription();
    private subNodeFlowTypeSub: Subscription = new Subscription();
    private subNodeFlowCostSub: Subscription = new Subscription();

    constructor(
        private location: Location,
        public dialogService: DialogService,
        public messageService: MessageService,
        private confirmationService: ConfirmationService,
        // private messageService: MessageService,

        public userService: UserService,
        private orderService: OrderService,
        public nsService: NodeStationService,
    ) {}

    ngOnInit(): void {
        this.location.replaceState('/'); // ## hide loocation
        this.company = this.userService.getCompany();
        this.factorySelected = GBC.clrFactory();
        this.factorySelectForOrderStyle = {...GBC.clrFactory()};

        // console.log(this.userService.getOrders());
        this.getSubNodeFlowTypeList();

    }

    getSubNodeFlowTypeList() {
        const companyID = this.company.companyID;
        this.orderService.getSubNodeFlowTypeList(companyID);
        if (this.subNodeFlowTypeSub) { this.subNodeFlowTypeSub.unsubscribe(); }
        this.subNodeFlowTypeSub = this.orderService.getSubNodeFlowTypeListListener()
        .subscribe((data) => {
            // console.log(data);
            this.subNodeFlowTypes = data.subNodeFlowTypes;

            this.subNodeFlowTypes.sort((a,b)=>{
                return a.companyID >b.companyID?1:a.companyID <b.companyID?-1:0
                || a.seq >b.seq?1:a.seq <b.seq?-1:0
            });

            this.subNodeFlowTypeID_DF = this.subNodeFlowTypes[0].subNodeFlowTypeID;
        });
    }

    putOrderSubNodeFlowCostUpdate() {
        // this.orderSelect = {...order};
        // putOrderSubNodeFlowCostUpdate(userID: string, order: Order)
        // console.log(this.subNodeFlowCostSelect);
        this.orderSelect.productOR.subNodeFlowCost = this.subNodeFlowCostSelect;
        this.orderService.putOrderSubNodeFlowCostUpdate(this.userService.getUser().userID, this.orderSelect);
        if (this.subNodeFlowCostSub) { this.subNodeFlowCostSub.unsubscribe(); }
        this.subNodeFlowCostSub = this.orderService.getCustomerUpdatedListener()
        .subscribe((data) => {
            // console.log(data);
            this.orderSelect = {...data.order};
            // this.closeDialog(this.product);

            this.messageService.add({
                severity:'success',
                summary:'edit sub node flow cost',
                detail:'completed'
            });
        });
    }

    sortSubNodeFlowSelect() {
        // this.subNodeFlowSelect.forEach( (item, index) => {
        //     const idx = this.subNodeFlow.findIndex( fi =>(
        //         fi.nodeID === item.nodeID
        //         && fi.subNodeID === item.subNodeID
        //     ));
        //     item.seq = this.subNodeFlow[idx].seq;
        // });
        this.subNodeFlowCostSelect.sort((a,b)=>{
            return a.nodeID >b.nodeID?1:a.nodeID <b.nodeID?-1:0
                // || a.subNodeID >b.subNodeID?1:a.subNodeID <b.subNodeID?-1:0
                || +a.seq > +b.seq?1: +a.seq < +b.seq?-1:0
        });
    }

    confirmSaveOrderSubNodeFlow() {
        this.confirmationService.confirm({
            message: 'Are you sure that you want to proceed?',
            header: 'Confirmation',
            icon: 'pi pi-exclamation-triangle',
            accept: () => this.saveOrderSubNodeFlow(),
            reject: () => {}
        });
    }

    saveOrderSubNodeFlow() {
        this.subNodeFlowCostSelect = this.subNodeFlowCostSelect.filter(i=>(i.subNodeID !== 'x'));
        this.subNodeFlowCostSelect.forEach( (item, index) => {
            const idx = this.subNodeflowC.findIndex( fi =>(
                fi.nodeID === item.nodeID
                && fi.subNodeID === item.subNodeID
            ));
            item.seq = this.subNodeflowC[idx].seq;
        });

        this.sortSubNodeFlowSelect();
        // console.log(this.subNodeFlowCostSelect);
        this.putOrderSubNodeFlowCostUpdate();
    }

    editSubNodeFlowTypeID(flowSeq: FlowSeq, subNodeID: string, subNodeFlowTypeID: string) {
        const idx = this.subNodeFlowCostSelect.findIndex( fi =>(fi.nodeID === flowSeq.nodeID && fi.subNodeID === subNodeID));
        // console.log(this.subNodeFlowCostSelect);
        // console.log('subNodeID  =  ' , subNodeID);
        // console.log(idx);
        if (idx >= 0 && subNodeID !== 'x') {
            // console.log('idx = ', idx);

            // ## check exist field
            if (!subNodeFlowTypeID) { subNodeFlowTypeID = this.subNodeFlowTypeID_DF; }
            let subNodeFlowTypeID_New = '';
            const len = this.subNodeFlowTypes.length;
            const idx2 = this.subNodeFlowTypes.findIndex( fi =>(fi.subNodeFlowTypeID === subNodeFlowTypeID));
            if (idx2+1 === len) {
                subNodeFlowTypeID_New = this.subNodeFlowTypeID_DF;
            } else {
                subNodeFlowTypeID_New = this.subNodeFlowTypes[idx2+1].subNodeFlowTypeID;
            }
            this.subNodeFlowCostSelect[idx].subNodeFlowTypeID = subNodeFlowTypeID_New;
        }
    }

    getSubNode(flowSeq: FlowSeq) {
        if (this.subNodeFlowCostSelect) {
            const subNodeFlowCostSelectF = this.subNodeFlowCostSelect.filter(i=>(i.nodeID === flowSeq.nodeID));
            // console.log(subNodeFlowCostSelectF);
            return subNodeFlowCostSelectF;
        }
        return [];
    }

    addBlankSubNode(flowSeq: FlowSeq) {
        // console.log(flowSeq);
        // const subNodeFlowTypeID = this.subNodeFlowTypes[0].subNodeFlowTypeID;
        const subNodeFlowCostSelect = [...this.subNodeFlowCostSelect];
        let blankSubNodeFlowCost1 = GBC.clrSubNodeFlowCost();
        // blankSubNodeFlow1.seq = +flowSeq.seqNo;
        blankSubNodeFlowCost1.nodeID = flowSeq.nodeID;


        // this.subNodeFlowSelect.push(blankSubNodeFlow1);
        const subNodeFlowCostSelectF = subNodeFlowCostSelect.filter(i=>(i.nodeID === flowSeq.nodeID));
        subNodeFlowCostSelectF.sort((a,b)=>{
            return a.seq >b.seq?1:a.seq <b.seq?-1:0
        });
        if (subNodeFlowCostSelectF.length === 0) {
            this.subNodeFlowCostSelect.push(blankSubNodeFlowCost1);
            // console.log(this.subNodeFlowSelect);
        } else {
            const seq1 = subNodeFlowCostSelectF[subNodeFlowCostSelectF.length - 1].seq + 1;
            blankSubNodeFlowCost1.seq = seq1;
            this.subNodeFlowCostSelect.push(blankSubNodeFlowCost1);
        }

    }

    getNodeFlow() {
        // getNodeFlow(companyID: string, factoryID: string, nodeFlowID: string)
        // getNodeFlowUpdatedListener()
        this.nodeFlow = GBC.clrNodeFlow();
        this.flowSeq = [];
        this.nodeStations = [];
        const nodeFlowID = 'main';
        this.nsService.getNodeFlow(this.company.companyID, this.factorySelected.factoryID, nodeFlowID);
        if (this.nodeFlowSub) { this.nodeFlowSub.unsubscribe(); }
        this.nodeFlowSub = this.nsService.getNodeFlowUpdatedListener().subscribe((data) => {
            // console.log(data);
            this.nodeFlow = data.nodeFlow;
            this.subNodeflowC = data.subNodeflowC;
            this.flowSeq = this.nodeFlow.flowSeq;
            this.nodeStations = data.nodeStations;
            // getNodeStationName(nodeStations: NodeStation[], nodeID: string)
            // console.log(this.nodeFlow);
            // console.log(this.subNodeFlow);
            // console.log(this.flowSeq);
            // console.log(this.nodeStations);
        });
    }

    deleteSubNode(subNodeFlow1: SubNodeFlow) {
        const idx = this.subNodeFlowCostSelect.findIndex( fi =>(
            fi.seq === subNodeFlow1.seq
            && fi.nodeID === subNodeFlow1.nodeID
            && fi.subNodeID === subNodeFlow1.subNodeID
        ));
        if (idx >= 0) {
            this.subNodeFlowCostSelect.splice(idx, 1);
        }
    }

    // transformSubNodeFlowCostTosubNodeFlow(subNodeFlowCost: SubNodeFlowCost[], subNodeFlow: SubNodeFlow[]) {
    //     let subNodeFlow1: SubNodeFlow[] = [];

    // }

    showFactorySelectionModal() {
        this.orderSelect = GBC.clrOrder();
        const ref = this.dialogService.open(SSelectFactoryComponent, {
            data: {
                id: 'fin-set-cost-style-subnode',
                company: this.userService?.getCompany(),
                callfrom: this.formName,  // ## send to nodejs for choose buckets
                btnCaption: 'choose'

            },
            header: 'Factory Selection',
            width: '80%',
        });

        ref.onClose.subscribe((factory: Factory) => {
            if (factory) {
                this.factorySelected = {...factory};
                this.factorySelectForOrderStyle = {...this.factorySelected};
                this.getNodeFlow();
            }
        });
    }

    showOrderSelectionModal() {
        this.orderSelect = GBC.clrOrder();
        this.subNodeFlowCostSelect = [];
        const ref = this.dialogService.open(SSelectOrderComponent, {
            data: {
                id: 'fin-set-cost-style-subnode',
                company: this.userService?.getCompany(),
                callfrom: this.formName,  // ## send to nodejs for choose buckets
                btnCaption: 'choose',
                orders: this.userService.getOrders(),

            },
            header: 'Order Selection',
            width: '80%',
        });

        ref.onClose.subscribe((order: Order) => {
            // console.log(order);
            // getSubNodeFlowName(nodeID: string, subNodeID: string, subNodeFlow: SubNodeFlow[])
            if (order) {
                this.orderSelect = {...order};
                this.subNodeFlowCostSelect = this.orderSelect.productOR.subNodeFlowCost?this.orderSelect.productOR.subNodeFlowCost:[];
                // this.factorySelectForOrderStyle = {...this.factorySelected};
                // this.userService.setOrderCustomerSelect(customer);
            }
        });
    }

    showSubNodeSelect(subNodeFlow1: SubNodeFlow) {
        // const subNodeFlowTypeID = this.subNodeFlowTypes[0].subNodeFlowTypeID;
        // console.log(subNodeFlow1);
        // SmdSelectSubnodeflowComponent
        // this.orderSelect = GBC.clrOrder();
        // this.subNodeFlowSelect = [];
        const ref = this.dialogService.open(SmdSelectSubnodeflowComponent, {
            data: {
                id: 'select-subnode',
                company: this.userService?.getCompany(),
                callfrom: this.formName,  // ## send to nodejs for choose buckets
                btnCaption: 'choose',
                seq: subNodeFlow1.seq,
                nodeID: subNodeFlow1.nodeID,
                subNodeFlow: this.subNodeflowC,

            },
            header: 'sub node Selection',
            width: '50%',
        });

        ref.onClose.subscribe((data: any) => {
            // console.log(data);
            if (data) {
                // console.log(data);
                // const idx = this.subNodeFlowSelect.findIndex( fi =>(fi.seq === data.seq));
                const idx = this.subNodeFlowCostSelect.findIndex( fi =>(
                    fi.seq === subNodeFlow1.seq
                    && fi.nodeID === subNodeFlow1.nodeID
                    && fi.subNodeID === subNodeFlow1.subNodeID
                ));
                if (idx >= 0) {
                    const idx2 = this.subNodeFlowCostSelect.findIndex( fi =>(
                        fi.nodeID === data.subNodeFlow.nodeID
                        && fi.subNodeID === data.subNodeFlow.subNodeID
                    ));
                    if (idx2 < 0) {
                        this.subNodeFlowCostSelect[idx].subNodeID = data.subNodeFlow.subNodeID;
                        this.subNodeFlowCostSelect[idx].subNodeFlowTypeID = this.subNodeFlowTypeID_DF;
                        // this.subNodeFlowCostSelect[idx].subNodeName = data.subNodeFlow.subNodeName;
                    }
                }
                // this.orderSelect = {...order};
                // this.subNodeFlowSelect = this.orderSelect.productOR.subNodeFlow?this.orderSelect.productOR.subNodeFlow:[];
                // this.factorySelectForOrderStyle = {...this.factorySelected};
                // this.userService.setOrderCustomerSelect(customer);
            }
            this.sortSubNodeFlowSelect();
        });
    }

    ngOnDestroy(): void {
        if (this.nodeFlowSub) { this.nodeFlowSub.unsubscribe(); }
        if (this.subNodeFlowCostSub) { this.subNodeFlowCostSub.unsubscribe(); }
        if (this.subNodeFlowTypeSub) { this.subNodeFlowTypeSub.unsubscribe(); }
        // if (this.dataAroundNodeAppSub) { this.dataAroundNodeAppSub.unsubscribe(); }
        // if (this.repCurrentProductQtyCFNSub) { this.repCurrentProductQtyCFNSub.unsubscribe(); }

        // if (this.errSub) { this.errSub.unsubscribe(); }
        // if (this.langSub) { this.langSub.unsubscribe(); }
        // if (this.langListSub) { this.langListSub.unsubscribe(); }

        // this.userService.setOrderProduction(this.userService.clrOrderProduction());
    }
}
