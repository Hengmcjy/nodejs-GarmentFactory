import { Component, OnDestroy, OnInit } from '@angular/core';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Subscription } from 'rxjs';
import { GBC } from 'src/app/global/const-global';
import { User } from 'src/app/models/user.model';
import { NodeStationService } from 'src/app/services/node-station.service';
import { UserService } from 'src/app/services/user.service';

@Component({
    selector: 'app-smd-confirm-important-task',
    templateUrl: './smd-confirm-important-task.component.html',
    styleUrls: ['./smd-confirm-important-task.component.scss'],
})
export class SmdConfirmImportantTaskComponent implements OnInit, OnDestroy {

    data: any;
    mode = '';  // ##  cancelOrderQueue, sType-switch
    // ## mode = 'cancelOrderQueue'
    // ## id: 'staffRefreshoutsourceOverall', mode: 'RefreshoutsourceOverall',
    // ## mode = 'sType-switch'

    staff: User = GBC.clrUser();

    userID =  '';
    userPass = '';
    authTxt = '';
    btnConfirmActive = true;


    private staffCheckConfirmSub: Subscription = new Subscription;

    constructor(
        public config: DynamicDialogConfig,
        public ref: DynamicDialogRef,

        public userService: UserService,
        public nsService: NodeStationService,
    ) {}

    ngOnInit(): void {
        this.data = this.config.data;
        // console.log(this.data);
        this.mode = this.data.mode;
        this.userID = this.userService.getUserID();
        this.userPass = '';
        this.authTxt = '';
        this.btnConfirmActive = true;

        if (this.mode === 'sType-switch') { // ## b =bundle , 1= 1by 1 / sType=scanType
            this.staff = this.nsService.staff;
            this.userID = this.staff.userID;
        }

        // console.log(this.data);
        // console.log(this.userService.getUser());
        // console.log(this.userID);
    }

    closeDialog(data: any) {
        this.ref.close(data);
    }

    staffCheckConfirm() {
        // console.log(this.userPass);
        this.authTxt = '';
        this.btnConfirmActive = false;
        if (this.userPass.trim() !== '') {

            // staffCheckConfirm(userID: string, userPass: string, mode: string)
            this.userService.staffCheckConfirm(this.userID, this.userPass, this.mode);
            if (this.staffCheckConfirmSub) { this.staffCheckConfirmSub.unsubscribe(); }
            this.staffCheckConfirmSub = this.userService.getStaffCheckConfirmListener().subscribe((data) => {
                // console.log(data);
                this.btnConfirmActive = true;
                if (data.success) {
                    const data1: any = {
                        mode: this.mode,
                        success: data.success,
                    };
                    this.closeDialog(data1);
                } else {
                    this.authTxt = 'Err!!!. passworn incorrect / This userID cannot confirm';
                    const data1: any = {
                        mode: this.mode,
                        success: false,
                    };
                    // this.closeDialog(data1);
                }
            });
        }
    }

    ngOnDestroy(): void {
        if (this.staffCheckConfirmSub) { this.staffCheckConfirmSub.unsubscribe(); }
        // if (this.getRepairProductCFNSub) { this.getRepairProductCFNSub.unsubscribe(); }

        // if (this.dataAroundAppSub) { this.dataAroundAppSub.unsubscribe(); }
        // if (this.errSub) { this.errSub.unsubscribe(); }
        // if (this.langSub) { this.langSub.unsubscribe(); }
        // if (this.langListSub) { this.langListSub.unsubscribe(); }
    }
}
