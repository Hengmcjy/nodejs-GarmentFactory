import { Component, OnDestroy, OnInit } from '@angular/core';
import { MegaMenuItem } from 'primeng/api';
import { Subscription } from 'rxjs';
import { GBC } from 'src/app/global/const-global';
import { Company, Factory } from 'src/app/models/app.model';
import { NodeStation } from 'src/app/models/workstation.model';

import { NodeStationService } from 'src/app/services/node-station.service';
import { ProductService } from 'src/app/services/product.service';
import { SocketIOService } from 'src/app/services/socketio.service';
import { UserService } from 'src/app/services/user.service';

@Component({
    selector: 'app-s-node-product-report',
    templateUrl: './s-node-product-report.component.html',
    styleUrls: ['./s-node-product-report.component.scss'],
})
export class SNodeProductReportComponent implements OnInit, OnDestroy {
    formActive = 'nodeProductReport';
    pageActive = 'production-report';

    repActive = 'node-report';  // ## node report ,all node report

    nodeStation: NodeStation = GBC.clrNodeStation();
    company: Company = GBC.clrCompany();
    factory: Factory = GBC.clrFactory();
    stationID = '';
    // factoryIDs: string[] = [];

    megaMenuItems: MegaMenuItem[] = [];

    private dataAroundAppSub: Subscription = new Subscription;

    constructor(
        public userService: UserService,
        private productService: ProductService,
        private socketService: SocketIOService,
        public nsService: NodeStationService,
    ) {}

    ngOnInit(): void {
        this.nodeStation = this.nsService.nodeStation;
        this.company = this.userService.getCompany();
        this.factory = this.userService.getFactory();
        this.stationID = this.nsService.stationID;

        this.nsService.setMenuActive(this.pageActive);
        this.nsService.setDataAroundNodeApp('isOutsourceMode', false);
        // console.log(this.nsService.staff);
        // console.log(this.nodeStation);
        // console.log(this.company);
        // console.log(this.factory);
        // console.log(this.stationID);
        // this.factoryIDs = this.userService.getFactoryIDArr([this.factory]);
        this.megaMenuItems = this.userService.getFormActiveMenu(this.formActive, 'app-s-node-product-report 1'); // get menu of form active
        this.megaMenuItems[0].label = 'Report';
        this.genMenu();
        this.dataAroundAppSub = this.userService.getDataAroundAppStatusListener().subscribe(dataAroundApp => {
            // ## declare initial variable from service user

            this.megaMenuItems = this.userService.getFormActiveMenu(this.formActive, 'app-s-node-product-report 2');
            this.megaMenuItems[0].label = 'Report';
            this.genMenu();
        });
    }

    genMenu() {
        this.megaMenuItems[1].label = this.nodeStation.nodeID +' Report';
        this.megaMenuItems[2].label = 'All Node Report';
        this.megaMenuItems[1].command = () => {
            this.repActive = 'node-report';
        }
        this.megaMenuItems[2].command = () => {
            this.repActive = 'all-node-report';
        }
        this.megaMenuItems[3].command = () => {
            this.repActive = 'scan-report';
        }
        this.megaMenuItems[4].command = () => {
            this.repActive = 'bundleInfo-report';
        }
        this.megaMenuItems[5].command = () => {
            this.repActive = 'factory-scan-product-period';
        }
    }

    ngOnDestroy(): void {
        if (this.dataAroundAppSub) { this.dataAroundAppSub.unsubscribe(); }
        // if (this.repCurrentProductQtyCFNSub) { this.repCurrentProductQtyCFNSub.unsubscribe(); }

        // if (this.dataAroundAppSub) { this.dataAroundAppSub.unsubscribe(); }
        // if (this.errSub) { this.errSub.unsubscribe(); }
        // if (this.langSub) { this.langSub.unsubscribe(); }
        // if (this.langListSub) { this.langListSub.unsubscribe(); }
    }
}
