import { Component, OnInit, OnDestroy } from '@angular/core';
// import { TranslateService } from '@ngx-translate/core';
import { Location } from '@angular/common';
import { DialogService } from 'primeng/dynamicdialog';
import { MessageService } from 'primeng/api';
import { Subscription } from 'rxjs';

import { UserService } from 'src/app/services/user.service';

import { UploadImageComponent } from 'src/app/shared/components/general/upload-image/upload-image.component';
import { User } from 'src/app/models/user.model';
import { GBC } from 'src/app/global/const-global';

@Component({
    selector: 'app-uprofile',
    templateUrl: './uprofile.component.html',
    styleUrls: ['./uprofile.component.scss'],
    providers: [DialogService, MessageService],
})
export class UprofileComponent implements OnInit, OnDestroy {
    formActive = 'ufprofile';
    formName = 'userEditImageProfile';
    // userGCSPath = this.userService.userGCSPath;   // ## google storage path user
    userImageProfileGCSPath = GBC.userImageProfileGCSPath;  // ## google storage path user image profile
    mode = 'card'; // ## profile, password, card
    editMode = 'edit';
    editUserMode = 'user-email-pass';
    isAuthenticated = false;  // ## logged in ?

    user: User = GBC.clrUser();

    private dataAroundAppSub: Subscription = new Subscription();

    constructor(
        // public translate: TranslateService,
        private location: Location,
        public dialogService: DialogService,
        public messageService: MessageService,
        private userService: UserService
    ) {}

    ngOnInit(): void {
        this.location.replaceState('/'); // ## hide loocation
        this.userService.setFormActive(this.formActive);
        this.user = this.userService.getUser();

        // ## get DataAroundApp
        // ## user auth  isAuthenticated / dataAroundApp
        this.isAuthenticated = this.userService.getIsAuth();
        this.dataAroundAppSub = this.userService
            .getDataAroundAppStatusListener()
            .subscribe((dataAroundApp) => {
                // ## declare initial variable from service user
                this.isAuthenticated = dataAroundApp.isAuthenticated;
                this.user = dataAroundApp.user;

                // console.log('screenSizeInfo : ' , this.screenSize);
                // console.log('isAuthenticated : ' , this.isAuthenticated);
                if (this.isAuthenticated) {
                    // ## user logged in already
                } else {
                    // ## user no login
                }
            });
    }

    changeMode(mode: string) {
        this.mode = mode;
    }

    showFileUploadModal(multiple: boolean) {
        const ref = this.dialogService.open(UploadImageComponent, {
            data: {
                id: 'fileUserUpload',
                companyID: this.userService.getCompany()?.companyID,
                multiple: multiple, // ## allow upload multiple file
                callfrom: this.formName,  // ## send to nodejs for choose buckets
                touserID: this.userService.getUserID(),  // ##
                subfolder: 'imageProfile/',  // ## in google storage store in subfolder

            },
            header: 'image upload',
            width: '50%',
        });

        ref.onClose.subscribe((data: any) => {
            // console.log(data);
            // if (car) {
            //     this.messageService.add({severity:'info', summary: 'Car Selected', detail:'Vin:' + car.vin});
            // }
        });
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
        // if (this.sockio) { this.sockio.unsubscribe(); }
        // if (this.errSub) { this.errSub.unsubscribe(); }
        // if (this.langSub) { this.langSub.unsubscribe(); }
        // if (this.screenSub) { this.screenSub.unsubscribe(); }
    }
}
