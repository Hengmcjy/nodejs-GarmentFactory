import { Component, Input, OnInit } from '@angular/core';
import { MegaMenuItem } from 'primeng/api';
import { GBC } from 'src/app/global/const-global';
import { Company, Factory } from 'src/app/models/app.model';
import { User } from 'src/app/models/user.model';
import { NodeStation } from 'src/app/models/workstation.model';
import { NodeStationService } from 'src/app/services/node-station.service';
import { ReportService } from 'src/app/services/report.service';
import { UserService } from 'src/app/services/user.service';
import { SmdRepSubnodeScannedComponent } from '../smd-rep-subnode-scanned/smd-rep-subnode-scanned.component';
import { DialogService } from 'primeng/dynamicdialog';
import { Router } from '@angular/router';

@Component({
    selector: 'app-s-rep-workload-overall',
    templateUrl: './s-rep-workload-overall.component.html',
    styleUrls: ['./s-rep-workload-overall.component.scss'],
    providers: [DialogService],
})
export class SRepWorkloadOverallComponent implements OnInit {
    @Input() callFromType: string = '';  // ## node, office
    @Input() nodeStation: NodeStation = GBC.clrNodeStation();
    @Input() stationID = '';

    formActive = 'WorkloadOverallReport';
    // ## overall = first rep page
    repActive = 'overall';

    megaMenuItems: MegaMenuItem[] = [];

    company: Company = GBC.clrCompany();
    factory: Factory = GBC.clrFactory();
    staffSelect: User = GBC.clrUser();
    nodeID = '';

    // menuSelect: string = '';

    constructor(
        private router: Router,
        public dialogService: DialogService,

        public userService: UserService,
        // private orderService: OrderService,
        public nsService: NodeStationService,
        private repService: ReportService
    ) {}

    ngOnInit(): void {
        this.megaMenuItems = this.userService.getFormActiveMenu(this.formActive, 'app-s-rep-workload-overall 1'); // get menu of form active

        this.company = this.userService.getCompany();
        this.factory = this.userService.getFactory();
        this.nodeStation = this.nodeStation.nodeID === '' ? this.nsService.nodeStation : this.nodeStation;
        this.stationID = this.stationID === '' ? this.nsService.stationID : this.stationID;
        this.nodeID = this.nodeStation.nodeID;

        // console.log(this.nodeStation);
        // console.log(data);
        // console.log(this.stationID);

        this.settingUpMenu();
    }

    gotoMenu() {
        if (this.callFromType === 'office') {
            // routerLink: ['/user/ucompany/financial/scanned/subnode']
            // this.router.navigate(['/user/ucompany/financial/scanned/subnode']);
            this.userService.nodeStationSelectUpdated.next({ nodeStation: GBC.clrNodeStation() });
        }
    }

    settingUpMenu() {
        this.megaMenuItems[1] = {
            label: this.nodeID + ' [ ' +this.stationID+' ] '+ ' [ ' +this.factory.fInfo.factoryName+' ] ',
            command: () => { this.gotoMenu(); },
            styleClass: 'text-base font-semibold'
        };
        this.megaMenuItems[2] = {
            label: 'workload',
            // icon: 'pi pi-fw pi-money-bill',
            // routerLink: ['/user/ucompany/financial/scanned/subnode'],

            visible: true,
            items: [
                [
                    {
                        label: 'Daily',
                        items: [
                            {
                                label: this.userService.translateCode('nu', 'nu-overall'),
                                visible: true,
                                command: () => { this.selectMenu('overall'); }
                            },
                            {
                                label: 'personal',
                                visible: true,
                                command: () => { this.selectMenu('personal'); }
                            },
                        ]
                    },
                ],
            ]
        };
        this.megaMenuItems[3] = {
            label: this.userService.translateCode('mn', 'mn-product'),
            // icon: 'pi pi-fw pi-money-bill',
            visible: true,
            items: [
                [
                    {
                        label: 'product workload',
                        items: [
                            {
                                label: 'product scan',
                                visible: true,
                                command: () => { this.selectMenu('product-scan'); }
                            },
                            // {
                            //     label: 'personal',
                            //     visible: true,
                            //     command: () => { this.selectMenu('personal'); }
                            // },
                        ]
                    },
                ],
            ]
        };

        const menuItemsSMDShowSubNodeScanned: MegaMenuItem = {
            label: 'Scanned',
            command: () => { this.showSubNodeScanned(); }
        };

        this.megaMenuItems.push(menuItemsSMDShowSubNodeScanned);
    }

    selectMenu(menu: string) {
        this.repActive = menu;
    }

    showSubNodeScanned() {
        const ref = this.dialogService.open(SmdRepSubnodeScannedComponent, {
            data: {
                id: 'showSubNodeScanned',
            },
            header: 'sub node scanned list',
            width: '90%'
        });

        ref.onClose.subscribe((data: any) => {
            // console.log(data);

        });
    }
}
