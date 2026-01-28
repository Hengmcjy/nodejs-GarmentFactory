import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { Subscription } from 'rxjs';
import { DialogService } from 'primeng/dynamicdialog';
import { MessageService } from 'primeng/api';

import { Company } from 'src/app/models/app.model';
import { UserService } from 'src/app/services/user.service';

import { UploadImageComponent } from 'src/app/shared/components/general/upload-image/upload-image.component';
import { GBC } from 'src/app/global/const-global';

@Component({
    selector: 'app-uc-setting',
    templateUrl: './uc-setting.component.html',
    styleUrls: ['./uc-setting.component.scss'],
    providers: [DialogService, MessageService],
})
export class UcSettingComponent implements OnInit, OnDestroy {
    formActive = 'ucsetting';
    formName = 'companyEditImageProfile';

    page = 1;
    limit = 10;
    companyFactoryImageProfileGCSPath = GBC.companyFactoryImageProfileGCSPath;  // ## google storage path company image profile
    companyID: string = '';
    company: Company = GBC.clrCompany();
    isAuthenticated = false;  // ## logged in ?

    mode = 'card'; // ## profile, password, card


    private dataAroundAppSub: Subscription = new Subscription();

    constructor(
        private router: Router,
        private location: Location,
        private route: ActivatedRoute,
        public dialogService: DialogService,
        public messageService: MessageService,
        public userService: UserService,
        ) {}

    ngOnInit(): void {
        this.location.replaceState("/"); // ## hide loocation
        this.userService.setFormActive(this.formActive);
        // this.companyID = this.route.snapshot.queryParamMap.get('companyID')+'';
        // this.company = this.userService.getUserCompany1(this.companyID);
        this.companyID = this.userService.getCompany().companyID;
        this.company = this.userService.getCompany();
        // console.log(this.company);

        // ## get DataAroundApp
        // ## user auth  isAuthenticated / dataAroundApp
        this.isAuthenticated = this.userService.getIsAuth();
        this.dataAroundAppSub = this.userService
            .getDataAroundAppStatusListener()
            .subscribe((dataAroundApp) => {
                // ## declare initial variable from service user
                this.isAuthenticated = dataAroundApp.isAuthenticated;
                this.company = dataAroundApp.company;

                // console.log('company : ' , this.company);
                // console.log('screenSizeInfo : ' , this.screenSize);
                // console.log('isAuthenticated : ' , this.isAuthenticated);
                if (this.isAuthenticated) {
                    // ## user logged in already
                } else {
                    // ## user no login
                }
            });
    }

    editCompany() {
        // editCompany(company: Company, page: number, limit: number)
        this.userService.editCompany(this.company, this.page, this.limit );
    }

    showFileUploadModal(multiple: boolean) {
        const ref = this.dialogService.open(UploadImageComponent, {
            data: {
                id: 'Upload company image profile',
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

    changeMode(mode: string) {
        this.mode = mode;
    }

    genImagePath(imgPath: string) {
        if (imgPath) {
            if (imgPath.length > 0) {
                return this.companyFactoryImageProfileGCSPath + imgPath;
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
