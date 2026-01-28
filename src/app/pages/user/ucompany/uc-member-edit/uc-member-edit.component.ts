import { Component, OnInit, OnDestroy } from '@angular/core';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Subscription } from 'rxjs';

import { UserService } from 'src/app/services/user.service';
import { User } from 'src/app/models/user.model';
import { GBC } from 'src/app/global/const-global';

@Component({
    selector: 'app-uc-member-edit',
    templateUrl: './uc-member-edit.component.html',
    styleUrls: ['./uc-member-edit.component.scss'],
})
export class UcMemberEditComponent implements OnInit, OnDestroy {

    userImageProfileGCSPath = GBC.userImageProfileGCSPath;  // ## google storage path user image profile
    user: User = GBC.clrUser();
    mode = 'card'; // ## profile, password, card
    modeStr = '';
    editMode = '';
    picMode = '';


    private dataAroundAppSub: Subscription = new Subscription();

    constructor(
        public config: DynamicDialogConfig,
        public ref: DynamicDialogRef,

        public userService: UserService,
    ) {}

    ngOnInit(): void {
        // console.log(this.config.data);
        this.user = this.config.data.user;
        this.editMode = this.config.data.editMode;
        this.modeStr = this.config.data.modeStr;
        this.picMode = this.config.data.picMode;

        // ## get DataAroundApp
        // ## user auth  isAuthenticated / dataAroundApp
        this.dataAroundAppSub = this.userService
            .getDataAroundAppStatusListener().subscribe((dataAroundApp) => {
                // ## declare initial variable from service user
                this.user = dataAroundApp.user;
                // console.log(this.user);
            });

    }

    closeDialog() {
        this.ref.close('button close dialog from user edit');
    }

    changeMode(mode: string) {
        this.mode = mode;
    }

    genImagePath(imgPath: string) {
        if (imgPath) {
            if (imgPath.length > 0) {
                return this.userImageProfileGCSPath + imgPath;
            }
        }

        return GBC.nulltGCSPath;
    }

    ngOnDestroy(): void {
        if (this.dataAroundAppSub) { this.dataAroundAppSub.unsubscribe(); }
    }
}
