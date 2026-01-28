import { Component, OnInit, OnDestroy } from '@angular/core';
import { Location } from '@angular/common';
import { ConfirmationService, MessageService, PrimeNGConfig } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import { Subscription } from 'rxjs';
import { NavigationExtras, Router } from '@angular/router';

import { UserService } from 'src/app/services/user.service';
import { NodeStationService } from 'src/app/services/node-station.service';
import { Company, Factory } from 'src/app/models/app.model';
import { NodeFlow } from 'src/app/models/workstation.model';

import { SNodeflowCreateComponent } from 'src/app/shared/components/factory/s-nodeflow-create/s-nodeflow-create.component';
import { GBC } from 'src/app/global/const-global';

@Component({
    selector: 'app-production-line-create',
    templateUrl: './production-line-create.component.html',
    styleUrls: ['./production-line-create.component.scss'],
    providers: [DialogService, MessageService, ConfirmationService],
})
export class ProductionLineCreateComponent implements OnInit, OnDestroy {
    formActive = 'nodeFlowCreate';
    formName = this.formActive;

    company: Company = GBC.clrCompany();
    factory: Factory = GBC.clrFactory();
    nodeFlowPageLimit = 0;
    nodeFlows: NodeFlow[] = [];

    errID = '';

    private nodeFlowsSub: Subscription = new Subscription();

    constructor(
        private location: Location,
        public dialogService: DialogService,
        public messageService: MessageService,
        private confirmationService: ConfirmationService,
        private primengConfig: PrimeNGConfig,
        private router: Router,

        private userService: UserService,
        public nsService: NodeStationService,
    ) {}

    ngOnInit(): void {
        this.location.replaceState('/'); // ## hide loocation

        this.company = this.userService.getCompany();
        this.factory = this.userService.getFactory();
        this.nodeFlowPageLimit = this.nsService.nodeFlowPageLimit;

        this.nodeFlows = [];
        this.errID = '';
        this.getNodeFlowsUpdatedListener();
        this.getNodeFlows(1, this.nodeFlowPageLimit);
    }

    getNodeFlows(page: number, limit: number) {
        // getNodeFlows(companyID: string, factoryID: string, page: number, limit: number)
        this.nsService.getNodeFlows(this.company.companyID, this.factory.factoryID, page, limit);
    }

    getNodeFlowsUpdatedListener() {
        if (this.nodeFlowsSub) { this.nodeFlowsSub.unsubscribe(); }
        this.nodeFlowsSub = this.nsService.getNodeFlowsUpdatedListener().subscribe((data) => {
            // this.product = data.product;
            // this.style = this.product.productCustomerCode.toUpperCase();
            // console.log(data);
            if (data.success) {
                this.nodeFlows = data.nodeFlows;
            } else {
                this.nodeFlows = [];
                this.errID = data.message.messageID;
                if (data.message.messageID === 'errns005') {
                    this.messageService.add({
                        severity:'error',
                        summary:'Error [ ' +data.message.messageID+ ' ]',
                        detail:'create Node Flow error [ NodeFlow create error ] ',
                        sticky: true
                    });
                }
            }
        });
    }

    putNodeFlowEdit(editMode: string, nodeFlow: NodeFlow) {
        // editMode === 'flowType'  'flowCondition'  'flowSeq'
        // putNodeFlowEdit(editMode: string, nodeFlow: NodeFlow, page: number, limit: number)
        this.nsService.putNodeFlowEdit(editMode, nodeFlow, 1, this.nodeFlowPageLimit);
    }

    showCreateNodeFlowModal() {
        const ref = this.dialogService.open(SNodeflowCreateComponent, {
            data: {
                id: 'createnodeflow',
            },
            header: 'Node flow create',
            width: '40%',
            // height: '100%'
        });

        ref.onClose.subscribe((data: any) => {
            // console.log(data);

            if (data.success) {
                this.messageService.add({
                    severity:'success',
                    summary:'Node flow new create',
                    detail:'completed',
                    sticky: true
                });
            }
        });
    }

    confirmFlowType(event: Event, idx: number, nodeFlow: NodeFlow) {
        const editMode = 'flowType';
        this.confirmationService.confirm({
            target: event.target as EventTarget,
            message: 'This flow is main?',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'main',  // ## main
            rejectLabel: 'sub',  // ## sub
            acceptButtonStyleClass: 'p-button-text',
            rejectButtonStyleClass: 'p-button-warning p-button-text',
            accept: () => {
                // ## main
                nodeFlow.flowType= 'main';
                this.putNodeFlowEdit(editMode, nodeFlow);
            },
            reject: () => {
                // ## sub
                nodeFlow.flowType= 'sub';
                this.putNodeFlowEdit(editMode, nodeFlow);
            }
        });
    }

    confirmConditionType(event: Event, idx: number, nodeFlow: NodeFlow) {
        const editMode = 'flowCondition';
        this.confirmationService.confirm({
            target: event.target as EventTarget,
            message: 'This flow have to sort production step?',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'have to sort',  // ## have to sort
            rejectLabel: 'no sort', // ## no sort
            acceptButtonStyleClass: 'p-button-text',
            rejectButtonStyleClass: 'p-button-warning p-button-text',
            accept: () => {
                // ## have to sort
                nodeFlow.flowCondition.isFlowSequence = true;
                this.putNodeFlowEdit(editMode, nodeFlow);
            },
            reject: () => {
                // ## no sort
                nodeFlow.flowCondition.isFlowSequence = false;
                this.putNodeFlowEdit(editMode, nodeFlow);
            }
        });
    }

    gotoNodeFlowPick(path: string, nodeFlowID: string) {
        const params: NavigationExtras = {
            queryParams: { nodeFlowID: nodeFlowID },
        };
        this.router.navigate([path], params);
    }

    ngOnDestroy(): void {
        if (this.nodeFlowsSub) { this.nodeFlowsSub.unsubscribe(); }
        // if (this.selectNodeSub) { this.selectNodeSub.unsubscribe(); }
    }
}
