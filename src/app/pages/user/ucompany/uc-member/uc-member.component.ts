import { Component, OnInit, OnDestroy } from '@angular/core';
import { DialogService } from 'primeng/dynamicdialog';
// import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { Location } from '@angular/common';
import { MessageService } from 'primeng/api';

import { UserService } from 'src/app/services/user.service';

import { Company } from 'src/app/models/app.model';
import { User } from 'src/app/models/user.model';

import { UcMemberEditComponent } from '../uc-member-edit/uc-member-edit.component';
import { GBC } from 'src/app/global/const-global';

@Component({
    selector: 'app-uc-member',
    templateUrl: './uc-member.component.html',
    styleUrls: ['./uc-member.component.scss'],
    providers: [DialogService, MessageService],
})
export class UcMemberComponent implements OnInit, OnDestroy {
    formActive = 'companyMember';
    formName = this.formActive;

    userImageProfileGCSPath = GBC.userImageProfileGCSPath;  // ## google storage path user image profile

    company: Company = GBC.clrCompany();
    user: User = GBC.clrUser();
    newMemberShow = false;
    memberUserID = '';
    errID = '';
    errText = '';

    membersCompany: User[] = [];

    isAuthenticated = false;  // ## logged in ?
    screenSize = 'sm';

    private dataAroundAppSub: Subscription = new Subscription();
    private membersCompanySub: Subscription = new Subscription();
    private inviteMemberCompanySub: Subscription = new Subscription();


    constructor(
        private location: Location,
        public messageService: MessageService,
        public dialogService: DialogService,
        // public messageService: MessageService,
        // public translate: TranslateService,
        public userService: UserService
    ) {}

    ngOnInit(): void {
        this.location.replaceState('/'); // ## hide loocation
        this.errID = '';
        this.errText = '';
        this.company = this.userService.getCompany();
        this.user = this.userService.getUser();
        this.screenSize = this.userService.screenSize;

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
        this.getMemberCompany();
    }

    putInviteMemberCompany() {
        this.errID = '';
        this.errText = '';
        // putInviteMemberCompany(memberUserID: string, companyID: string)
        this.userService.putInviteMemberCompany(this.memberUserID, this.company.companyID);
        if (this.inviteMemberCompanySub) { this.inviteMemberCompanySub.unsubscribe(); }
        this.inviteMemberCompanySub = this.userService.getInviteMemberUpdatedListener()
        .subscribe((data) => {
            // console.log(data);
            if (data.success) {
                this.messageService.add({
                    severity:'success',
                    summary:'invite member',
                    detail:'completed',
                    sticky: true
                });
            } else {
                this.errID = data.message.messageID;
                if (data.message.messageID === 'erru006-1' || data.message.messageID === 'erru006-2') {
                    // console.log(data.message.messageID);
                    this.errText = data.message.value;
                    this.messageService.add({
                        severity:'error',
                        summary:'Error [ ' +data.message.messageID+ ' ]',
                        detail: data.message.value,
                        sticky: true
                    });
                }
            }
        });
    }

    getMemberCompany() {
        // getMemberCompany(companyID: string, page: number, limit: number)
        this.userService.getMemberCompany(this.company.companyID, 1, 20);
        if (this.membersCompanySub) { this.membersCompanySub.unsubscribe(); }
        this.membersCompanySub = this.userService.getMembersCompanyUpdatedListener()
        .subscribe((data) => {
            // console.log(data.membersCompany);
            this.membersCompany = data.membersCompany;
        });
    }

    newMember() {
        this.newMemberShow = true;
    }

    cancelCreateNewMember() {
        this.newMemberShow = false;
        this.errID = '';
        this.errText = '';
        this.memberUserID = '';
    }

    showMemberEditModal(editMode: string, modeStr: string, member: User) {
        let modalWidth = '90%';
        if (this.screenSize == 'xl' ) { modalWidth = '60%' }
        else if (this.screenSize == 'lg' || this.screenSize == 'md') {  modalWidth = '75%' }

        const ref = this.dialogService.open(UcMemberEditComponent, {
            data: {
                editMode: editMode,
                modeStr: modeStr,
                user: member,
                picMode: 'view',
            },
            header: modeStr,
            width: modalWidth,
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

        return GBC.selectOneGCSPath;
    }

    ngOnDestroy(): void {
        if (this.dataAroundAppSub) { this.dataAroundAppSub.unsubscribe(); }
        if (this.membersCompanySub) { this.membersCompanySub.unsubscribe(); }
        if (this.inviteMemberCompanySub) { this.inviteMemberCompanySub.unsubscribe(); }

        // if (this.langSub) { this.langSub.unsubscribe(); }
        // if (this.screenSub) { this.screenSub.unsubscribe(); }
    }
}
