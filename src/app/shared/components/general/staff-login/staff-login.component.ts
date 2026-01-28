import { Component, OnDestroy, OnInit } from '@angular/core';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Subscription } from 'rxjs';

import { NodeStationService } from 'src/app/services/node-station.service';
import { UserService } from 'src/app/services/user.service';
import { User } from 'src/app/models/user.model';
import { NodeStation } from 'src/app/models/workstation.model';
import { Company, Factory } from 'src/app/models/app.model';
import { MessageService } from 'primeng/api';
import { GBC } from 'src/app/global/const-global';

@Component({
    selector: 'app-staff-login',
    templateUrl: './staff-login.component.html',
    styleUrls: ['./staff-login.component.scss'],
    providers: [MessageService],
})
export class StaffLoginComponent implements OnInit, OnDestroy {

    data: any;

    nodeStation: NodeStation = GBC.clrNodeStation();
    company: Company = GBC.clrCompany();
    factory: Factory = GBC.clrFactory();
    stationID = '';


    staff: User = GBC.clrUser();
    userID = '';
    userPass = '';

    // private nodeSub: Subscription = new Subscription();
    private staffLoginSub: Subscription = new Subscription();

    constructor(
        public config: DynamicDialogConfig,
        public ref: DynamicDialogRef,
        public messageService: MessageService,

        private userService: UserService,
        private nsService: NodeStationService,
    ) {}

    ngOnInit(): void {
        this.data = this.config.data;
        this.nodeStation = this.nsService.nodeStation;
        this.company = this.userService.getCompany();
        this.factory = this.userService.getFactory();
        this.stationID = this.nsService.stationID;
        this.staff = GBC.clrUser();
    }

    staffNodeLogin() {
        // staffNodeLogin(userID: string, userPass: string, companyID: string, factoryID: string)
        this.nsService.staffNodeLogin(this.userID, this.userPass, this.company.companyID, this.factory.factoryID);
        // getStaffLoginUpdatedListener
        if (this.staffLoginSub) { this.staffLoginSub.unsubscribe(); }
        this.staffLoginSub = this.nsService.getStaffLoginUpdatedListener().subscribe((data) => {
            // console.log(data);
            if (this.data.id === 'staffLogin') { this.nsService.staff = data.staff; }
            else if (this.data.id === 'outsourcestaffLogin') { this.nsService.staff = data.staff; }
            if (data.success) {
                this.closeDialog({
                    success: data.success,
                    staff: data.staff
                });
            } else {
                this.messageService.add({
                    severity:'error',
                    summary:'Error [ userID or password not correct ]',
                    detail: 'login error',
                    sticky: false
                });
            }

        });


        // console.log('key enter');
    }

    closeDialog(data: any) {
        this.ref.close(data);
    }

    ngOnDestroy(): void {
        if (this.staffLoginSub) { this.staffLoginSub.unsubscribe(); }
        // if (this.errSub) { this.errSub.unsubscribe(); }
        // if (this.authSub) { this.authSub.unsubscribe(); }
        // if (this.screenSub) { this.screenSub.unsubscribe(); }
        // if (this.screenSizeSub) { this.screenSizeSub.unsubscribe(); }
    }
}
