import { Component, OnDestroy, OnInit } from '@angular/core';
import { MessageService } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import { GBC } from 'src/app/global/const-global';
import { Company, Factory } from 'src/app/models/app.model';
import { NodeStation } from 'src/app/models/workstation.model';
import { NodeStationService } from 'src/app/services/node-station.service';
import { ReportService } from 'src/app/services/report.service';
import { UserService } from 'src/app/services/user.service';

@Component({
    selector: 'app-s-rep-pds-wl-subnode',
    templateUrl: './s-rep-pds-wl-subnode.component.html',
    styleUrls: ['./s-rep-pds-wl-subnode.component.scss'],
    providers: [DialogService, MessageService],
})
export class SRepPdsWlSubnodeComponent implements OnInit, OnDestroy {

    company: Company = GBC.clrCompany();
    factory: Factory = GBC.clrFactory();
    nodeStation: NodeStation = GBC.clrNodeStation();
    nodeID = '';
    stationID = ''

    menuSelect = 'menu1';

    constructor(
        public dialogService: DialogService,
        public messageService: MessageService,

        public userService: UserService,
        // private orderService: OrderService,
        public nsService: NodeStationService,
        private repService: ReportService
    ) {}

    ngOnInit(): void {

        this.company = this.userService.getCompany();
        this.factory = this.userService.getFactory();
        this.nodeStation = this.nsService.nodeStation;
        this.nodeID = this.nodeStation.nodeID;
        this.stationID = this.nsService.stationID;

    }

    selectMenu(menu: string) {
        this.menuSelect = menu;
    }

    ngOnDestroy(): void {
        // this.nsService.setDataAroundNodeApp('isScanSubnode', false);
        // if (this.workerInfoSub) { this.workerInfoSub.unsubscribe(); }
        // if (this.subNodeFlowCostSub) { this.subNodeFlowCostSub.unsubscribe(); }
        // if (this.orderProductionQueueByBundleNo1Sub) { this.orderProductionQueueByBundleNo1Sub.unsubscribe(); }
        // if (this.orderProductionsSub) { this.orderProductionsSub.unsubscribe(); }
        // if (this.orderProductionQueueByProductBarcodeNoSub) { this.orderProductionQueueByProductBarcodeNoSub.unsubscribe(); }
        // if (this.editAddOrderProductionSubNodeFlowSub) { this.editAddOrderProductionSubNodeFlowSub.unsubscribe(); }
        // if (this.dataAroundNodeAppSub) { this.dataAroundNodeAppSub.unsubscribe(); }
        // if (this.scanOrderProductionBarcodeNoSub) { this.scanOrderProductionBarcodeNoSub.unsubscribe(); }
        // if (this.orderProductionNextNodeIDSub) { this.orderProductionNextNodeIDSub.unsubscribe(); }
        // if (this.orderProductionCancelSub) { this.orderProductionCancelSub.unsubscribe(); }

        // if (this.langSub) { this.langSub.unsubscribe(); }
        // if (this.langListSub) { this.langListSub.unsubscribe(); }
        // if (this.intervalTimer) { clearInterval(this.intervalTimer); } // ## pause stop time interval
    }

}
