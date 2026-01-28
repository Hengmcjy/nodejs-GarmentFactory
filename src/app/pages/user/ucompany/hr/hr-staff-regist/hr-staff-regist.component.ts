import { Component, OnDestroy, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { Subscription } from 'rxjs';
import { GBC } from 'src/app/global/const-global';
import { UFactory, User } from 'src/app/models/user.model';
import { UserService } from 'src/app/services/user.service';
import { DialogService } from 'primeng/dynamicdialog';
import { MessageService } from 'primeng/api';
import { UploadImageComponent } from 'src/app/shared/components/general/upload-image/upload-image.component';
import { ActivatedRoute } from '@angular/router';
import { Company, Factory } from 'src/app/models/app.model';

@Component({
    selector: 'app-hr-staff-regist',
    templateUrl: './hr-staff-regist.component.html',
    styleUrls: ['./hr-staff-regist.component.scss'],
    providers: [DialogService, MessageService],
})
export class HrStaffRegistComponent implements OnInit, OnDestroy {
    formActive = 'staffFprofile';
    formName = 'staffEditImageProfile';
    userImageProfileGCSPath = GBC.userImageProfileGCSPath;  // ## google storage path user image profile

    company: Company = GBC.clrCompany();
    factory: Factory = GBC.clrFactory();
    user: User = GBC.clrUser();
    userID = '';
    isAuthenticated = false;  // ## logged in ?

    // user1: User = GBC.clrUser();
    type = 's'; // ## s=staff/worker
    uFactory: UFactory[] = [{
        companyID: '',
        factoryID: '',
        state: '',
        userFacClass: {
            userClassID: '', // ## wst worker staff
            userClassName: '',
            userType: '',
            seq: 0,
        }
    }];

    mode = ''; // ## create / edit
    modeType = ''; // ## staff-according-job /

    private dataAroundAppSub: Subscription = new Subscription();
    private createStaffCompanyFactorySub: Subscription = new Subscription();
    private staff1CompanySub: Subscription = new Subscription();


    constructor(
        private location: Location,
        private route: ActivatedRoute,
        public dialogService: DialogService,
        public messageService: MessageService,
        // private confirmationService: ConfirmationService,
        // private messageService: MessageService,

        public userService: UserService,
        // private orderService: OrderService,
    ) {}

    ngOnInit(): void {
        this.mode = (this.route.snapshot.queryParamMap.get('mode') + '')?this.route.snapshot.queryParamMap.get('mode') + '':'create';
        this.modeType = (this.route.snapshot.queryParamMap.get('modeType') + '')?this.route.snapshot.queryParamMap.get('modeType') + '':'staff-according-job';
        // console.log('mode : ' , this.mode);
        // console.log('modeType : ' , this.modeType);
        this.location.replaceState('/'); // ## hide loocation
        // this.userService.setFormActive(this.formActive);
        // this.user = this.userService.getUser();
        this.company = this.userService.getCompany();
        this.factory = this.userService.getFactory();

        if (this.mode == 'create') {
            this.user = GBC.clrUser();
            // this.user1 = GBC.clrUser();
        }
        this.uFactory = [{
            companyID: this.company.companyID,
            factoryID: this.factory.factoryID,
            state: '',
            userFacClass: {
                userClassID: 'wst',
                userClassName: 'worker staff',
                userType: 'staff',
                seq: 0,
            }
        }];

        // ## get DataAroundApp
        // ## user auth  isAuthenticated / dataAroundApp
        this.isAuthenticated = this.userService.getIsAuth();
        this.dataAroundAppSub = this.userService
            .getDataAroundAppStatusListener()
            .subscribe((dataAroundApp) => {
                // ## declare initial variable from service user
                this.isAuthenticated = dataAroundApp.isAuthenticated;
                // this.user = dataAroundApp.user;

                // console.log('screenSizeInfo : ' , this.screenSize);
                // console.log('isAuthenticated : ' , this.isAuthenticated);
                if (this.isAuthenticated) {
                    // ## user logged in already
                } else {
                    // ## user no login
                }
            });
    }

    reset() {
        this.user = GBC.clrUser();
        this.mode = 'create';
        // this.userID = '';
        this.uFactory = [{
            companyID: this.company.companyID,
            factoryID: this.factory.factoryID,
            state: '',
            userFacClass: {
                userClassID: 'wst',
                userClassName: 'worker staff',
                userType: 'staff',
                seq: 0,
            }
        }];
    }

    updateStaff() {
        this.user.userID = this.factory.fInfo.abbreviation + this.userID;
        this.user.uFactory = this.uFactory;
        this.user.status = 'a'; // ## active
        this.user.type = this.type;
        this.user.createBy = this.userService.getCreateBy();
        // console.log(this.user);
        if (this.mode === 'create') {
            this.createStaffCompanyFactory(this.user);
        } else if (this.mode === 'edit') {
            this.putEditStaffCompanyFactory(this.user);
        }
    }

    getStaff1Company01(userID: string) {
        this.reset();
        this.mode = 'edit';
        const userID1 =  this.factory.fInfo.abbreviation + userID;
        this.getStaff1Company(userID1);
    }

    getStaff1Company(userID: string) {
        // console.log(userID);
        this.userService.getStaff1Company(userID);
        if (this.staff1CompanySub) { this.staff1CompanySub.unsubscribe(); }
        this.staff1CompanySub = this.userService.getUser1CompanyListsUpdatedUpdatedListener()
        .subscribe((data) => {
            // console.log(data.user);
            const abbreviationLen = this.factory.fInfo.abbreviation.length;
            this.user = data.user;
            // this.user.userID = this.user.userID.substr(4, this.user.userID.length - 4);
            this.userID = this.user.userID.substr(abbreviationLen, this.user.userID.length - (abbreviationLen - 1));
        });
    }

    createStaffCompanyFactory(user: User) {
        // createStaffCompanyFactory(user: User)
        this.userService.createStaffCompanyFactory(user);
        if (this.createStaffCompanyFactorySub) { this.createStaffCompanyFactorySub.unsubscribe(); }
        this.createStaffCompanyFactorySub = this.userService.getCreateUserCompanyFactoryUpdatedListener()
        .subscribe((data) => {
            // this.productImageProfiles = data.productImageProfiles;
            // console.log(this.productImageProfiles);
            if (data.success) {
                // this.getStaff1Company(this.user.userID);

                this.mode = 'edit';
                this.messageService.add({
                    severity:'success',
                    summary:'staff new Create',
                    detail:'completed'
                });
            } else {
                this.messageService.add({
                    severity:'error',
                    summary:'Error [ ' +data.message.messageID+ ' ]',
                    detail: data.message.value
                });
            }

        });
    }

    putEditStaffCompanyFactory(user: User) {
        this.userService.putEditStaffCompanyFactory(user);
        if (this.createStaffCompanyFactorySub) { this.createStaffCompanyFactorySub.unsubscribe(); }
        this.createStaffCompanyFactorySub = this.userService.getCreateUserCompanyFactoryUpdatedListener()
        .subscribe((data) => {
            // this.productImageProfiles = data.productImageProfiles;
            // console.log(this.productImageProfiles);
            if (data.success) {
                // this.getStaff1Company(this.user.userID);

                this.mode = 'edit';
                this.messageService.add({
                    severity:'success',
                    summary:'staff new Create',
                    detail:'completed'
                });
            } else {
                this.messageService.add({
                    severity:'error',
                    summary:'Error [ ' +data.message.messageID+ ' ]',
                    detail: data.message.value
                });
            }

        });
    }

    showFileUploadModal(multiple: boolean) {
        // console.log(this.user.userID);
        const ref = this.dialogService.open(UploadImageComponent, {
            data: {
                id: 'fileUserUpload',
                companyID: this.company.companyID,
                multiple: multiple, // ## allow upload multiple file
                callfrom: this.formName,  // ## send to nodejs for choose buckets
                touserID: this.factory.fInfo.abbreviation + this.userID,  // ##
                subfolder: 'imageProfile/',  // ## in google storage store in subfolder

            },
            header: 'image upload',
            width: '50%',
        });

        ref.onClose.subscribe((data: any) => {
            this.getStaff1Company(this.factory.fInfo.abbreviation + this.userID);
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
        if (this.createStaffCompanyFactorySub) { this.createStaffCompanyFactorySub.unsubscribe(); }
        if (this.staff1CompanySub) { this.staff1CompanySub.unsubscribe(); }
        // if (this.langSub) { this.langSub.unsubscribe(); }
        // if (this.screenSub) { this.screenSub.unsubscribe(); }
    }
}
