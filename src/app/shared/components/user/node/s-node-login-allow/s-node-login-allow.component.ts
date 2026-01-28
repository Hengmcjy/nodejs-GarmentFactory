import { Component, OnDestroy, OnInit } from '@angular/core';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Subscription } from 'rxjs';

import { NodeStationService } from 'src/app/services/node-station.service';
import { UserService } from 'src/app/services/user.service';
import { NodeStationLoginRequest } from 'src/app/models/workstation.model';

@Component({
    selector: 'app-s-node-login-allow',
    templateUrl: './s-node-login-allow.component.html',
    styleUrls: ['./s-node-login-allow.component.scss'],
})
export class SNodeLoginAllowComponent implements OnInit, OnDestroy{

    data: any;

    nodeStationLoginRequests: NodeStationLoginRequest[] = [];


    private nodeStationLoginRequestSub: Subscription = new Subscription;

    constructor(
        public config: DynamicDialogConfig,
        public ref: DynamicDialogRef,

        public userService: UserService,
        private nsService: NodeStationService,
    ) {}

    ngOnInit(): void {
        this.data = this.config.data;
        // console.log(this.data);
        this.getNodeStationLoginRequest();
    }

    getNodeStationLoginRequest() {
        this.nsService.getNodeStationLoginRequest();
        if (this.nodeStationLoginRequestSub) { this.nodeStationLoginRequestSub.unsubscribe(); }
        this.nodeStationLoginRequestSub = this.nsService
        .getNodeStationLoginRequestsUpdatedListener().subscribe((data) => {
            // console.log(data);
            this.nodeStationLoginRequests = data.nodeStationLoginRequests;
            if (this.nodeStationLoginRequests.length <= 0) {
                this.ref.close('close dialog');
            }
        });
    }

    putAllowNodeStationLoginRequest(nodeStationLoginRequest: NodeStationLoginRequest) {
        this.nsService.putAllowNodeStationLoginRequest(nodeStationLoginRequest, 'allow');
    }

    delNodeStationLoginRequest(nodeStationLoginRequest: NodeStationLoginRequest) {
        this.nsService.delNodeStationLoginRequest(nodeStationLoginRequest, 'reject');
    }

    ngOnDestroy(): void {
        if (this.nodeStationLoginRequestSub) { this.nodeStationLoginRequestSub.unsubscribe(); }

        // if (this.screenSizeSub) { this.screenSizeSub.unsubscribe(); }
        // if (this.darkSub) { this.darkSub.unsubscribe(); }
        // if (this.errSub) { this.errSub.unsubscribe(); }
        // if (this.authSub) { this.authSub.unsubscribe(); }
        // if (this.screenSub) { this.screenSub.unsubscribe(); }
        // if (this.screenSizeSub) { this.screenSizeSub.unsubscribe(); }
    }
}
