import { Component, OnInit, OnDestroy } from '@angular/core';
import { DialogService } from 'primeng/dynamicdialog';
// import { TranslateService } from '@ngx-translate/core';
import { Location } from '@angular/common';
import { Subscription } from 'rxjs';

import { UserService } from 'src/app/services/user.service';
import { User } from 'src/app/models/user.model';
import { Company, Factory } from 'src/app/models/app.model';

import { UfUserEditComponent } from '../uf-user-edit/uf-user-edit.component';
import { GBC } from 'src/app/global/const-global';

@Component({
    selector: 'app-uf-user',
    templateUrl: './uf-user.component.html',
    styleUrls: ['./uf-user.component.scss'],
    providers: [DialogService],
})
export class UfUserComponent implements OnInit, OnDestroy {
    formActive = 'factoryMember';
    formName = this.formActive;

    userImageProfileGCSPath = GBC.userImageProfileGCSPath;  // ## google storage path user image profile

    membersFactory: User[] = [];
    newUser1: User = GBC.clrUser();
    newUserShow = false;
    page = 1;
    limit = 20;
    company: Company = GBC.clrCompany();
    factory: Factory = GBC.clrFactory();

    isAuthenticated = false;  // ## logged in ?
    screenSize = 'sm';
    // initialLang = 'en';
    // lang = 'en';

    private dataAroundAppSub: Subscription = new Subscription();
    private memberFactorySub: Subscription = new Subscription();

    constructor(
        private location: Location,
        public dialogService: DialogService,
        // public messageService: MessageService,
        // public translate: TranslateService,
        private userService: UserService
    ) {}

    async ngOnInit() {

        this.location.replaceState('/'); // ## hide loocation

        this.company = this.userService.getCompany();
        this.factory = this.userService.getFactory();
        // ## get screen size
        this.screenSize = this.userService.screenSize;
        // console.log('screenSizeInfo : ' , this.screenSize);
        // ## get DataAroundApp
        // ## user auth  isAuthenticated / dataAroundApp
        this.isAuthenticated = this.userService.getIsAuth();
        this.dataAroundAppSub = this.userService
            .getDataAroundAppStatusListener()
            .subscribe((dataAroundApp) => {
                // ## declare initial variable from service user
                this.isAuthenticated = dataAroundApp.isAuthenticated;
                this.screenSize = dataAroundApp.screenSize;

                // console.log('screenSizeInfo : ' , this.screenSize);
                // console.log('isAuthenticated : ' , this.isAuthenticated);
                if (this.isAuthenticated) {
                    // ## user logged in already
                } else {
                    // ## user no login
                }
            });

        // ## get member factory
        this.getUserMemberFactory();
    }

    getUserMemberFactory() {
        // getUserMemberFactory(companyID: string, factoryID: string, page: number, limit: number)
        const state = 'staff';
        this.userService.getUserMemberFactory(
            this.company.companyID, this.factory.factoryID, state, this.page, this.limit
        );
        if (this.memberFactorySub) { this.memberFactorySub.unsubscribe(); }
        this.memberFactorySub = this.userService.getMembersFactoryUpdatedListener()
        .subscribe((data) => {
            // console.log(data.membersFactory);
            this.membersFactory = data.membersFactory;
        });
    }


    newUser() {
        this.newUserShow = true;
    }

    cancelCreateNewUser() {
        this.newUserShow = false;
    }



    showUserEditModal(editMode: string, modeStr: string, user: User) {
        let modalWidth = '90%';
        if (this.screenSize == 'xl' ) { modalWidth = '60%' }
        else if (this.screenSize == 'lg' || this.screenSize == 'md') {  modalWidth = '75%' }

        const editUserMode = 'new-pass-staff';
        const ref = this.dialogService.open(UfUserEditComponent, {
            data: {
                editMode: editMode,
                modeStr: modeStr,
                editUserMode: editUserMode,
                user: user
            },
            header: modeStr,
            width: modalWidth,
        });

        ref.onClose.subscribe((data: any) => {
            this.getUserMemberFactory();  // ## get member factory
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

        return GBC.selectOneGCSPath;
    }

    ngOnDestroy(): void {
        if (this.dataAroundAppSub) { this.dataAroundAppSub.unsubscribe(); }
        if (this.memberFactorySub) { this.memberFactorySub.unsubscribe(); }

        // if (this.errSub) { this.errSub.unsubscribe(); }
        // if (this.langSub) { this.langSub.unsubscribe(); }
        // if (this.screenSub) { this.screenSub.unsubscribe(); }
    }
}
