import { Component, OnInit } from '@angular/core';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';

import { GBC } from 'src/app/global/const-global';
import { NodeStation } from 'src/app/models/workstation.model';
import { NodeStationService } from 'src/app/services/node-station.service';
import { UserService } from 'src/app/services/user.service';

@Component({
    selector: 'app-smd-select-nodestation',
    templateUrl: './smd-select-nodestation.component.html',
    styleUrls: ['./smd-select-nodestation.component.scss'],
})
export class SmdSelectNodestationComponent implements OnInit {

    data: any;
    nodeStations: NodeStation[] = [];
    nodeStation: NodeStation =  GBC.clrNodeStation();

    constructor(
        public config: DynamicDialogConfig,
        public ref: DynamicDialogRef,

        private userService: UserService,
        public nsService: NodeStationService,
    ) {}

    ngOnInit(): void {
        this.data = this.config.data;
        this.nodeStations = [...this.nsService.nodeStations];
        this.nodeStations.sort((a,b)=>{ return a.nodeID >b.nodeID?1:a.nodeID <b.nodeID?-1:0 });
    }

    selectNode(nodeStation: NodeStation) {
        // console.log(this.subNodeFlowSelect);
        this.nodeStation = nodeStation;
        this.closeDialog(nodeStation);
    }

    closeDialog(nodeStation: NodeStation) {
        // const data: any = {
        //     nodeStation: nodeStation,
        //     // colorNo: this.data.colorNo
        // };
        this.ref.close(nodeStation);
    }
}
