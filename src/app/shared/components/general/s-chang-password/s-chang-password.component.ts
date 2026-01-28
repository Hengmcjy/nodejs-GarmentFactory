import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { MessageService } from 'primeng/api';

import { UserService } from 'src/app/services/user.service';
import { User } from 'src/app/models/user.model';
import { GBC } from 'src/app/global/const-global';

@Component({
    selector: 'app-s-chang-password',
    templateUrl: './s-chang-password.component.html',
    styleUrls: ['./s-chang-password.component.scss'],
    providers: [MessageService],
})
export class SChangPasswordComponent implements OnInit, OnDestroy {
    @Input() user: User = GBC.clrUser();
    @Input() editMode = '';  // ##
    @Input() editUserMode = '';  // ## user-email-pass , new-pass-staff

    newPassword1 = '';
    newPassword2 = '';

    private editUserPassSub: Subscription = new Subscription();

    constructor(
        public messageService: MessageService,
        public userService: UserService,
    ) {}

    ngOnInit(): void {
        // console.log(this.user);
        // console.log(this.editMode);
        // console.log(this.editUserMode);
        this.clrText();
    }

    clrText() {
        this.newPassword1 = '';
        this.newPassword2 = '';
    }

    editPassFactoryStaff() {
        // editPassFactoryStaff(staffUserID: string, newPass: string)
        let state = 'userEmail';
        if (this.editUserMode === 'new-pass-staff') {
            state = 'staff';
        } else if (this.editUserMode === 'user-email-pass') {  // normal user signup by email
            state = 'userEmail';
        }
        if (this.newPassword1 === this.newPassword2 && this.newPassword1 !== '') {
            this.userService.editPassFactoryStaff(this.user.userID, this.newPassword1, state);
            if (this.editUserPassSub) { this.editUserPassSub.unsubscribe(); }
            this.editUserPassSub = this.userService.getEditStaffPassUpdatedListener()
            .subscribe((data) => {
                if (data.success) {
                    this.clrText();
                    this.messageService.add({
                        severity:'success',
                        summary:'edit password',
                        detail:'edit password completed',
                        sticky: true
                    });
                } else {

                }
            });
        }
    }

    ngOnDestroy(): void {
        if (this.editUserPassSub) { this.editUserPassSub.unsubscribe(); }
        // if (this.checkUserIDExistedSub) { this.checkUserIDExistedSub.unsubscribe(); }
        // if (this.createUserCompanyFactorySub) { this.createUserCompanyFactorySub.unsubscribe(); }
    }
}
