import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';

import { UserService } from 'src/app/services/user.service';
import { NodeStationService } from 'src/app/services/node-station.service';
import { SocketIOService } from 'src/app/services/socketio.service';
import { Company, Factory } from 'src/app/models/app.model';
import { NodeStationLoginRequest } from 'src/app/models/workstation.model';
import { GBC } from 'src/app/global/const-global';

@Component({
    selector: 'app-s-wait-response-usernode-login',
    templateUrl: './s-wait-response-usernode-login.component.html',
    styleUrls: ['./s-wait-response-usernode-login.component.scss'],
})
export class SWaitResponseUsernodeLoginComponent
    implements OnInit, AfterViewInit, OnDestroy
{
    secondTimer = 0;
    // secondTimer = 5;
    intervalTimer: any;
    data: any;
    modeIO = '';

    uuidUserNodeLoginWaiting = '';
    company: Company = GBC.clrCompany();
    factory: Factory = GBC.clrFactory();
    nodeID = '';
    nodeStationLoginRequest: NodeStationLoginRequest = GBC.clrNodeStationLoginRequest();
    stationID = '';

    private dataAroundAppSub: Subscription = new Subscription;
    private ioResponseLoginNode: Subscription = new Subscription;


    constructor(
        public config: DynamicDialogConfig,
        public ref: DynamicDialogRef,
        public userService: UserService,
        private nsService: NodeStationService,
        private socketService: SocketIOService,
    ) {}

    ngOnInit(): void {
        // console.log(this.config.data);
        // console.log(this.uuidUserNodeLoginWaiting);
        this.company = this.userService.getCompany();
        this.factory = this.userService.getFactory();

        this.data = this.config.data;
        this.company = this.data.company;
        this.factory = this.data.factory;
        this.nodeID = this.data.nodeStation.nodeID;
        this.stationID = this.data.stationID;
        this.nodeStationLoginRequest = this.data.nodeStationLoginRequest;
        this.uuidUserNodeLoginWaiting = this.userService.uuidUserNodeLoginWaiting;
        this.secondTimer = this.userService.secondTimer;
        // console.log(this.nodeStationLoginRequest);

        // ## get DataAroundApp
        this.dataAroundAppSub = this.userService.getDataAroundAppStatusListener().subscribe(dataAroundApp => {
            // ## declare initial variable from service user

            this.company = dataAroundApp.company;
            this.factory = dataAroundApp.factory;
        });

        // ## get response user node login
        this.getIOResponseLoginNode();
    }

    getIOResponseLoginNode() {
        this.modeIO = '';
        // console.log(this.userService.ioID);
        if (this.ioResponseLoginNode) { this.ioResponseLoginNode.unsubscribe(); }
        this.ioResponseLoginNode = this.socketService.getIOResponseLoginNode().subscribe((msgio: any) => {
            this.modeIO = '';
            // console.log(msgio);
            if (msgio) {
                if (msgio.msgTypeID === 'userResponseNodeLoginWaiting'   // ## user node request for login
                    &&  msgio.dataIO.userResponseNodeLoginWaiting.uuidUserNodeLoginWaiting === this.uuidUserNodeLoginWaiting) {
                    // this.valueCount = '*';
                    if (msgio.dataIO.userResponseNodeLoginWaiting.mode === 'answer'
                        && msgio.dataIO.userResponseNodeLoginWaiting.action === 'reject') {
                        // console.log('msgio.dataIO.userResponseNodeLoginWaiting.action = ',  msgio.dataIO.action);
                        this.secondTimer = 0;
                        this.modeIO = 'reject';
                    } else if (msgio.dataIO.userResponseNodeLoginWaiting.mode === 'answer'
                        && msgio.dataIO.userResponseNodeLoginWaiting.action === 'allow'
                        ) {
                        this.secondTimer = 0;
                        this.modeIO = 'allow';
                        // console.log('msgio.dataIO.userResponseNodeLoginWaiting.action = ',  msgio.dataIO.action);
                        // this.userService.setCompany(this.company);
                        // this.userService.setFactory(this.factory);
                        this.ref.close({
                            actionMode: 'login-node-workstation',
                            company: this.company,
                            factory: this.factory,
                            action: msgio.dataIO.userResponseNodeLoginWaiting.action,
                            companyID: msgio.dataIO.userResponseNodeLoginWaiting.companyID,
                            factoryID: msgio.dataIO.userResponseNodeLoginWaiting.factoryID,
                            nodeID: msgio.dataIO.userResponseNodeLoginWaiting.nodeID,
                            stationID: msgio.dataIO.userResponseNodeLoginWaiting.stationID,
                        });


                    } else if (msgio.dataIO.userResponseNodeLoginWaiting.mode === 'answer'
                        && msgio.dataIO.userResponseNodeLoginWaiting.action === 'none') {

                    }
                }
            }
        });
    }

    delNodeStationLoginRequest(nodeStationLoginRequest: NodeStationLoginRequest) {
        this.nsService.delNodeStationLoginRequest(nodeStationLoginRequest, 'reject');
    }

    delNodeStationLoginRequestNoAuth(nodeStationLoginRequest: NodeStationLoginRequest) {
        this.nsService.delNodeStationLoginRequestNoAuth(nodeStationLoginRequest, 'reject');
        // this.userService.setCommandAroundAppStatusListenerToNext('getNodeStationLoginRequest');
    }

    ngAfterViewInit(): void {
        this.intervalTimer = setInterval(() => {
            this.secondTimer = this.secondTimer - 1;
            if (this.secondTimer <= 0) {
                // this.ref.close('user node waiting close');
                this.secondTimer = 0;
            }
        }, 1000);
    }

    closeDialog() {
        this.delNodeStationLoginRequestNoAuth(this.nodeStationLoginRequest);
        this.ref.close('user node waiting close');
    }

    ngOnDestroy() {
        // console.log('SWaitResponseUsernodeLoginComponent ngOnDestroy');
        if (this.dataAroundAppSub) { this.dataAroundAppSub.unsubscribe(); }
        if (this.ioResponseLoginNode) { this.ioResponseLoginNode.unsubscribe(); }

        // if (this.errSub) { this.errSub.unsubscribe(); }
        // if (this.langSub) { this.langSub.unsubscribe(); }
        // if (this.langListSub) { this.langListSub.unsubscribe(); }
        // if (this.getUserNodeLoginWaitSub) { this.getUserNodeLoginWaitSub.unsubscribe(); }
        // if (this.screenSizeSub) { this.screenSizeSub.unsubscribe(); }
        // if (this.darkSub) { this.darkSub.unsubscribe(); }
        // if (this.errSub) { this.errSub.unsubscribe(); }
        // if (this.authSub) { this.authSub.unsubscribe(); }
        // if (this.screenSub) { this.screenSub.unsubscribe(); }
        // if (this.screenSizeSub) { this.screenSizeSub.unsubscribe(); }

        if (this.intervalTimer) {
            clearInterval(this.intervalTimer);
        }
    }
}
