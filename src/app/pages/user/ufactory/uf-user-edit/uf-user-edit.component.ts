import { Component, OnInit, OnDestroy } from '@angular/core';
import { MessageService } from 'primeng/api';
import { DialogService, DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Subscription } from 'rxjs';
import { GBC } from 'src/app/global/const-global';

import { User } from 'src/app/models/user.model';
import { UserService } from 'src/app/services/user.service';
import { UploadImageComponent } from 'src/app/shared/components/general/upload-image/upload-image.component';

@Component({
    selector: 'app-uf-user-edit',
    templateUrl: './uf-user-edit.component.html',
    styleUrls: ['./uf-user-edit.component.scss'],
    providers: [DialogService, MessageService],
})
export class UfUserEditComponent implements OnInit, OnDestroy {
    formActive = 'memberFactoryEdit';
    formName = 'staffEditImageProfile';

    userImageProfileGCSPath = GBC.userImageProfileGCSPath;  // ## google storage path user image profile

    editUserMode = '';
    editMode = '';
    mode = 'card'; // ## profile, password, card
    user: User = GBC.clrUser();

    // positionItems: MenuItem[] = [];
    // userPositon = '';

    private dataAroundAppSub: Subscription = new Subscription();

    constructor(
        public config: DynamicDialogConfig,
        public ref: DynamicDialogRef,
        public dialogService: DialogService,
        public messageService: MessageService,

        private userService: UserService
    ) {}

    ngOnInit(): void {
        // console.log(this.config.data);
        this.user = this.config.data.user;
        this.editMode = this.config.data.editMode;
        this.editUserMode = this.config.data.editUserMode;

        // ## get DataAroundApp
        // ## user auth  isAuthenticated / dataAroundApp
        this.dataAroundAppSub = this.userService
            .getDataAroundAppStatusListener().subscribe((dataAroundApp) => {
                // ## declare initial variable from service user
                // this.user = dataAroundApp.user;
                // console.log(this.user);
            });

    }

    closeDialog() {
        this.ref.close('button close dialog from user edit');
    }

    changeMode(mode: string) {
        this.mode = mode;
    }

    showFileUploadModal(multiple: boolean) {
        const ref = this.dialogService.open(UploadImageComponent, {
            data: {
                id: 'filememberFactoryUpload',
                companyID: this.userService.getCompany()?.companyID,
                factoryID: this.userService.getFactory()?.factoryID,
                multiple: multiple, // ## allow upload multiple file
                callfrom: this.formName,  // ## send to nodejs for choose buckets
                touserID: this.user.userID,
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

        // if (this.errSub) { this.errSub.unsubscribe(); }
        // if (this.langSub) { this.langSub.unsubscribe(); }
        // if (this.screenSub) { this.screenSub.unsubscribe(); }
    }
}
