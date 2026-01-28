import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { MessageService } from 'primeng/api';

import { NodeStationService } from 'src/app/services/node-station.service';
import { UserService } from 'src/app/services/user.service';
import { Company, Factory } from 'src/app/models/app.model';
import { NodeFlow } from 'src/app/models/workstation.model';
import { GBC } from 'src/app/global/const-global';

@Component({
    selector: 'app-s-nodeflow-create',
    templateUrl: './s-nodeflow-create.component.html',
    styleUrls: ['./s-nodeflow-create.component.scss'],
    providers: [MessageService],
})
export class SNodeflowCreateComponent implements OnInit, OnDestroy {

    company: Company = GBC.clrCompany();
    factory: Factory = GBC.clrFactory();
    nodeFlowPageLimit = 0;

    nodeFlowID = '';
    errID = '';

    private nodeFlowsSub: Subscription = new Subscription();

    constructor(
        public config: DynamicDialogConfig,
        public ref: DynamicDialogRef,
        public messageService: MessageService,

        private userService: UserService,
        public nsService: NodeStationService,
    ) {}

    ngOnInit(): void {
        this.company = this.userService.getCompany();
        this.factory = this.userService.getFactory();
        this.nodeFlowPageLimit = this.nsService.nodeFlowPageLimit;
        this.errID = '';
        this.nodeFlowID = '';
        this.getNodeFlowsUpdatedListener();
    }

    getNodeFlowsUpdatedListener() {
        if (this.nodeFlowsSub) { this.nodeFlowsSub.unsubscribe(); }
        this.nodeFlowsSub = this.nsService.getNodeFlowsUpdatedListener().subscribe((data) => {
            // this.product = data.product;
            // this.style = this.product.productCustomerCode.toUpperCase();
            // console.log(data);
            if (data.success) {
                this.closeDialog({success: true});
            } else {
                this.errID = data.message.messageID;
                if (data.message.messageID === 'errns005-1') {
                    this.messageService.add({
                        severity:'error',
                        summary:'Error [ ' +data.message.messageID+ ' ]',
                        detail:'create Node Flow error [ NodeFlowID Existed ] ',
                        sticky: true
                    });
                }
            }
        });
    }

    postNodeFlowCreateNew() {
        // postNodeFlowCreateNew(nodeStation: NodeStation, page: number, limit: number)
        this.errID = '';
        let nodeFlow: NodeFlow = GBC.clrNodeFlow();
        nodeFlow.companyID = this.company.companyID;
        nodeFlow.factoryID = this.factory.factoryID;
        nodeFlow.nodeFlowID = this.nodeFlowID;
        this.nsService.postNodeFlowCreateNew(nodeFlow, 1, this.nodeFlowPageLimit);
    }

    closeDialog(data: any) {
        this.ref.close(data);
    }

    ngOnDestroy(): void {
        if (this.nodeFlowsSub) { this.nodeFlowsSub.unsubscribe(); }
        // if (this.selectNodeSub) { this.selectNodeSub.unsubscribe(); }
    }
}
