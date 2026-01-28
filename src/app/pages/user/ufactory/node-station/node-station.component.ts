import { Component, OnInit, OnDestroy } from '@angular/core';
// import { TranslateService } from '@ngx-translate/core';
import { DialogService } from 'primeng/dynamicdialog';
import { MessageService } from 'primeng/api';
import { Location } from '@angular/common';
import { NavigationExtras, Router } from '@angular/router';
import { LayoutService } from 'src/app/layout/service/app.layout.service';
import { Subscription } from 'rxjs';

import { UserService } from 'src/app/services/user.service';
import { NodeStationService } from 'src/app/services/node-station.service';

import { NodeCreateComponent } from '../node-create/node-create.component';
import { Company, Factory } from 'src/app/models/app.model';
import { NodeStation } from 'src/app/models/workstation.model';
import { GBC } from 'src/app/global/const-global';
// import { NodeWorkflowComponent } from '../node-workflow/node-workflow.component';

@Component({
    selector: 'app-node-station',
    templateUrl: './node-station.component.html',
    styleUrls: ['./node-station.component.scss'],
    providers: [DialogService, MessageService],
})
export class NodeStationComponent implements OnInit, OnDestroy {
    formActive = 'nodestationsetting';
    formName = this.formActive;

    nodeStationPageLimit = 0;
    userID = '';
    userName = '';
    company: Company = GBC.clrCompany();
    factory: Factory = GBC.clrFactory();

    nodeStations: NodeStation[] = [];
    nodeStation:NodeStation = GBC.clrNodeStation();


    private nodeSub: Subscription = new Subscription();

    constructor(
        // public translate: TranslateService,
        public layoutService: LayoutService,
        public dialogService: DialogService,
        public messageService: MessageService,
        private location: Location,
        private router: Router,
        public userService: UserService,
        public nsService: NodeStationService,
    ) {}

    ngOnInit(): void {
        this.location.replaceState('/'); // ## hide loocation
        // this.userService.setFormActive(this.formActive);

        this.nodeStationPageLimit = this.nsService.nodeStationPageLimit;
        this.userID = this.userService.getUserID();
        this.userName = this.userService.getUser().uInfo.userName;
        this.company = this.userService.getCompany();
        this.factory = this.userService.getFactory();

        const status = ['a', 'c'];  // ## get only status = active , close
        this.getNodeStations(status);
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

    showCreateNodeModal() {
        const ref = this.dialogService.open(NodeCreateComponent, {
            data: {
                id: 'createnode',
            },
            header: 'Node Production',
            width: '40%',
            // height: '100%'
        });

        ref.onClose.subscribe((data: any) => {
            // console.log(data);

            if (data.success) {
                this.messageService.add({
                    severity:'success',
                    summary:'Node production new create',
                    detail:'completed'
                });
            }
        });
    }

    // showCreateNodeWorkflowModal() {
    //     // // ## check menu side show or not
    //     // if (!this.layoutService.state.staticMenuDesktopInactive) { this.layoutService.onMenuToggle(); }
    //     const ref = this.dialogService.open(NodeWorkflowComponent, {
    //         data: {
    //             id: 'nodeworkflow',
    //         },
    //         header: 'Information',
    //         width: '40%',
    //         // baseZIndex: 999,
    //         // autoZIndex: false,
    //         // height: '100%'
    //     });

    //     ref.onClose.subscribe((data: any) => {
    //         // // ## check menu side show or not
    //         // if (this.layoutService.state.staticMenuDesktopInactive) { this.layoutService.onMenuToggle(); }
    //         console.log(data);
    //         // if (car) {
    //         //     this.messageService.add({severity:'info', summary: 'Car Selected', detail:'Vin:' + car.vin});
    //         // }
    //     });
    // }

    goto(path: string) {
        const params: NavigationExtras = {
            queryParams: { node: 'nodeName' },
        };
        this.router.navigate([path], params);
    }

    ngOnDestroy(): void {
        if (this.nodeSub) { this.nodeSub.unsubscribe(); }
    }
}
