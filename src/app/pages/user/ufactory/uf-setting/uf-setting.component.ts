import { Component, OnInit, OnDestroy } from '@angular/core';
// import { TranslateService } from '@ngx-translate/core';
import { Location } from '@angular/common';
import { DialogService } from 'primeng/dynamicdialog';
import { MessageService } from 'primeng/api';
import { Subscription } from 'rxjs';

import { UserService } from 'src/app/services/user.service';
import { Company, Factory } from 'src/app/models/app.model';

import { UploadImageComponent } from 'src/app/shared/components/general/upload-image/upload-image.component';
import { GBC } from 'src/app/global/const-global';

@Component({
    selector: 'app-uf-setting',
    templateUrl: './uf-setting.component.html',
    styleUrls: ['./uf-setting.component.scss'],
    providers: [DialogService, MessageService],
})
export class UfSettingComponent implements OnInit, OnDestroy {
    formActive = 'ufsetting';
    formName = 'factoryEditImageProfile';

    page = 1;
    limit = 0;
    companyFactoryImageProfileGCSPath = GBC.companyFactoryImageProfileGCSPath;  // ## google storage path company image profile
    company: Company = GBC.clrCompany();
    factory: Factory = GBC.clrFactory();
    isAuthenticated = false;  // ## logged in ?

    mode = 'card'; // ## profile, password, card


    private dataAroundAppSub: Subscription = new Subscription();
    private editFactorySub: Subscription = new Subscription();

    constructor(
        // public translate: TranslateService,
        private location: Location,
        public dialogService: DialogService,
        public messageService: MessageService,
        public userService: UserService
    ) {}

    ngOnInit(): void {
        this.location.replaceState('/'); // ## hide loocation
        this.userService.setFormActive(this.formActive);

        this.limit = this.userService.factoryPageLimit;

        this.company = this.userService.getCompany();
        this.factory = this.userService.getFactory();
        // console.log('factory : ' , this.factory);
        // ## get DataAroundApp
        // ## user auth  isAuthenticated / dataAroundApp
        this.isAuthenticated = this.userService.getIsAuth();
        this.dataAroundAppSub = this.userService
            .getDataAroundAppStatusListener()
            .subscribe((dataAroundApp) => {
                // ## declare initial variable from service user
                this.isAuthenticated = dataAroundApp.isAuthenticated;
                this.company = dataAroundApp.company;
                this.factory = dataAroundApp.factory;

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

    editFactory() {
        // editFactory(companyID: string, factoryData: Factory, page: number, limit: number)

        this.userService.editFactory(
            this.company.companyID,
            this.factory, this.page, this.limit
        );
        if (this.editFactorySub) { this.editFactorySub.unsubscribe(); }
        this.editFactorySub = this.userService.getEditFactoryUpdatedListener()
        .subscribe((data) => {
            // console.log(data.membersCompany);
            this.factory = data.factory;
        });
    }

    showFileUploadModal(multiple: boolean) {
        const ref = this.dialogService.open(UploadImageComponent, {
            data: {
                id: 'Upload factory image profile',
                companyID: this.userService.getCompany()?.companyID,
                factoryID: this.factory.factoryID,
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
        if (this.editFactorySub) { this.editFactorySub.unsubscribe(); }
        // if (this.errSub) { this.errSub.unsubscribe(); }
        // if (this.langSub) { this.langSub.unsubscribe(); }
        // if (this.screenSub) { this.screenSub.unsubscribe(); }
    }
}
