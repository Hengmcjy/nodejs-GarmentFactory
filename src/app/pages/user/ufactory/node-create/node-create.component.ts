import { NodeStation } from './../../../../models/workstation.model';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Subscription } from 'rxjs';
import { MessageService } from 'primeng/api';

import { NodeStationService } from 'src/app/services/node-station.service';
import { UserService } from 'src/app/services/user.service';
import { GBC } from 'src/app/global/const-global';

@Component({
    selector: 'app-node-create',
    templateUrl: './node-create.component.html',
    styleUrls: ['./node-create.component.scss'],
    providers: [MessageService],
})
export class NodeCreateComponent implements OnInit, OnDestroy {

    nodeID = '';
    nodeStationPageLimit = 0;
    errID = '';

    userID = '';
    userName = '';
    companyID = '';
    factoryID = '';

    private createNodeSub: Subscription = new Subscription();

    constructor(
        public config: DynamicDialogConfig,
        public ref: DynamicDialogRef,
        public messageService: MessageService,
        public userService: UserService,
        private nsService: NodeStationService,
    ) {}

    ngOnInit(): void {
        this.nodeStationPageLimit = this.nsService.nodeStationPageLimit;
        this.userID = this.userService.getUserID();
        this.userName = this.userService.getUser().uInfo.userName;
        this.companyID = this.userService.getCompany().companyID;
        this.factoryID = this.userService.getFactory().factoryID;

        this.nodeID = '';
        this.errID = '';
        this.getNodeStationsUpdatedListener();
    }

    getNodeStationsUpdatedListener() {
        if (this.createNodeSub) { this.createNodeSub.unsubscribe(); }
        this.createNodeSub = this.nsService.getNodeStationsUpdatedListener().subscribe((data) => {
            // this.product = data.product;
            // this.style = this.product.productCustomerCode.toUpperCase();
            // console.log(data);
            if (data.success) {
                this.closeDialog({success: true});
            } else {
                this.errID = data.message.messageID;
                if (data.message.messageID === 'errns003-1') {
                    this.messageService.add({
                        severity:'error',
                        summary:'Error [ ' +data.message.messageID+ ' ]',
                        detail:'create Node error [ NodeID Existed ] ',
                        sticky: true
                    });
                }
            }
        });
    }

    postNodeStationCreateNew() {
        // postNodeStationCreateNew(userID: string, userName: string, nodeStation: NodeStation,
        //                          status: string[], page: number, limit: number)
        this.errID = '';
        const status = ['a','c','d'];
        let nodeStation: NodeStation = GBC.clrNodeStation();
        nodeStation.companyID = this.companyID;
        nodeStation.factoryID = this.factoryID;
        nodeStation.nodeID = this.nodeID;
        nodeStation.nodeInfo.createBy.userID = this.userID;
        nodeStation.nodeInfo.createBy.userName = this.userName;
        this.nsService.postNodeStationCreateNew(
            this.userID, this.userName,
            nodeStation, status,
            1, this.nodeStationPageLimit
        );

    }

    closeDialog(data: any) {
        this.ref.close(data);
    }

    ngOnDestroy(): void {
        if (this.createNodeSub) { this.createNodeSub.unsubscribe(); }
        // if (this.orderProductSelectSub) { this.orderProductSelectSub.unsubscribe(); }
        // if (this.errSub) { this.errSub.unsubscribe(); }
        // if (this.langSub) { this.langSub.unsubscribe(); }
        // if (this.screenSub) { this.screenSub.unsubscribe(); }
    }
}
