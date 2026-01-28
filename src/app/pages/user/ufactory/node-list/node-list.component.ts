import { Component, OnInit, OnDestroy } from '@angular/core';
import { Location } from '@angular/common';
import { MessageService } from 'primeng/api';
import { Subscription } from 'rxjs';

import { UserService } from 'src/app/services/user.service';
import { NodeStationService } from 'src/app/services/node-station.service';
import { Company, Factory } from './../../../../models/app.model';
import { NodeStation } from 'src/app/models/workstation.model';
import { GBC } from 'src/app/global/const-global';

@Component({
    selector: 'app-node-list',
    templateUrl: './node-list.component.html',
    styleUrls: ['./node-list.component.scss'],
    providers: [MessageService],
})
export class NodeListComponent implements OnInit, OnDestroy {
    formActive = 'node-list';
    formName = this.formActive;

    // indexTab = 0;

    nodeStationPageLimit = 0;
    userID = '';
    userName = '';
    company: Company = GBC.clrCompany();
    factory: Factory = GBC.clrFactory();

    nodeStations: NodeStation[] = [];
    nodeStation:NodeStation = GBC.clrNodeStation();
    rowSelectedIdx = -1;

    private nodeSub: Subscription = new Subscription();

    constructor(
        private location: Location,
        public messageService: MessageService,

        private userService: UserService,
        public nsService: NodeStationService,
    ) {}

    ngOnInit(): void {
        this.location.replaceState('/'); // ## hide loocation
        this.rowSelectedIdx = -1;

        this.nodeStationPageLimit = this.nsService.nodeStationPageLimit;
        this.userID = this.userService.getUserID();
        this.userName = this.userService.getUser().uInfo.userName;
        this.company = this.userService.getCompany();
        this.factory = this.userService.getFactory();

        const status = ['a','c','d'];
        this.getNodeStations(status);
        // getNodeStatus(status: string)
    }

    editNode(nodeStation: NodeStation) {
        // console.log(nodeStation);
        this.nodeStation = nodeStation;
        this.nsService.setTabChangeUpdated();  // ## signal for tab change
        // this.indexTab = 0;
    }

    getNodeStations(status: string[]) {
        // getNodeStations(companyID: string, factoryID: string, status: string[], page: number, limit: number)
        // const status = ['a','c','d'];
        this.nsService.getNodeStations(this.company.companyID, this.factory.factoryID, status, 1 , this.nodeStationPageLimit );
        if (this.nodeSub) { this.nodeSub.unsubscribe(); }
        this.nodeSub = this.nsService.getNodeStationsUpdatedListener().subscribe((data) => {
            // console.log(data);
            this.nodeStations = data.nodeStations;
        });
    }

    getNodeStatus(status: string) {
        const statusName = this.nsService.getNodeStatusName(status);
        return statusName;
    }

    rowSelect(idx: number, modeRow: string) {
        this.rowSelectedIdx = idx;
        this.nsService.setSelectNodeStationUpdated(this.nodeStations[idx]);
        // setSelectNodeStationUpdated(nodeStation: NodeStation)
    }

    getRowClass(idx: number) {
        // let className = '';
        if (idx === this.rowSelectedIdx) { return 'background-color: var(--yellow-50);'}
        return '';
    }

    ngOnDestroy(): void {
        if (this.nodeSub) { this.nodeSub.unsubscribe(); }

        // if (this.orderProductSelectSub) { this.orderProductSelectSub.unsubscribe(); }
        // if (this.errSub) { this.errSub.unsubscribe(); }
        // if (this.langSub) { this.langSub.unsubscribe(); }
        // if (this.screenSub) { this.screenSub.unsubscribe(); }
    }
}
