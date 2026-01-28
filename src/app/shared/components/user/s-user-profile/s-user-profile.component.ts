import { UserClass } from './../../../../models/user.model';
import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { MenuItem, MessageService } from 'primeng/api';
import { Subscription } from 'rxjs';

import { UserService } from 'src/app/services/user.service';
import { User } from 'src/app/models/user.model';
import { Company, Factory } from 'src/app/models/app.model';
import { GBC } from 'src/app/global/const-global';

@Component({
    selector: 'app-s-user-profile',
    templateUrl: './s-user-profile.component.html',
    styleUrls: ['./s-user-profile.component.scss'],
    providers: [MessageService],
})
export class SUserProfileComponent implements OnInit, OnDestroy {
    @Input() nameMode = '';  // ## call from ...  /   user-self= edit myself ,  control-man = control edit another,
    @Input() editMode = '';
    @Input() picMode = '';
    @Input() type = '';  // ## company , factory
    @Input() user: User = GBC.clrUser();
    errID = '';
    errIDCreateUser = '';
    userIDExisted = false;
    userIDCut = '';

    positionItems: MenuItem[] = [];
    userPositon = '';
    // user: User = this.userService.getUser();
    company: Company = GBC.clrCompany();
    factory: Factory = GBC.clrFactory();
    userClassesX: UserClass[] = [];

    userClasses: UserClass[] = [];
    userComClass: UserClass = {userClassID: '', userClassName: '', userType: '', seq: 0};
    userFacClass: UserClass = {userClassID: '', userClassName: '', userType: '', seq: 0};

    // this.lottoYeekeeRoundOpen = this.lottoYeekeeRound.filter(i=>(i.secondDuration + this.secondPlusYeekee1020 >= 0));

    classLimit = 0;

    private editUserClassSub: Subscription = new Subscription();
    private checkUserIDExistedSub: Subscription = new Subscription();
    private createUserCompanyFactorySub: Subscription = new Subscription();


    constructor(
        public messageService: MessageService,
        public userService: UserService,
    ) {}

    ngOnInit(): void {

        this.company = this.userService.getCompany();
        this.factory = this.userService.getFactory();
        this.userClassesX = this.userService.userClass;
        // const userClassID = this.user.uCompany.filter(i=>(i.companyID === this.company.companyID))[0].userComClass.userClassID;
        // this.classLimit = this.userService.getLimitUserClass(userClassID);
        // this.userClasses = this.userClassesX.filter(i=>(i.seq <= +this.classLimit));
        this.userClasses = this.userService.getLimitUserClasses(this.company.companyID);
        if (this.editMode !== 'create' && this.type === 'company' && this.userClasses.length>0) {
            this.userComClass = this.user.uCompany.filter(i=>(i.companyID === this.company.companyID))[0].userComClass;
            this.userIDCut = this.userService.getUserIDCutOutAbbreviation(this.user.userID, 4);
        } else if (this.editMode !== 'create' && this.type === 'factory' && this.userClasses.length>0) {
            this.userFacClass = this.user.uFactory.filter(i=>(i.companyID === this.company.companyID && i.factoryID === this.factory.factoryID))[0].userFacClass;
            this.userIDCut = this.userService.getUserIDCutOutAbbreviation(this.user.userID, 4);
        }
        if (this.user.state === 'userEmail') { this.userIDCut =  this.user.userID; }
        // console.log(this.user);
        // console.log(this.userClasses);
        if (this.type === 'company') {
            this.setUserClassList(this.userComClass.userClassID);
        } else if (this.type === 'factory') {
            this.setUserClassList(this.userFacClass.userClassID);
        }
    }

    checkUserIDExisted() {
        this.userIDExisted = false;
        // getCheckExistCompanyFactoryUserID(companyID: string, factory: string, userID: string)
        let userID = this.factory.fInfo.abbreviation + this.userIDCut;
        if (this.user.state === 'userEmail') { userID =  this.user.userID; }
        this.userService.getCheckExistCompanyFactoryUserID(
            this.company.companyID, this.factory.factoryID, userID
        );
        if (this.checkUserIDExistedSub) { this.checkUserIDExistedSub.unsubscribe(); }
        this.checkUserIDExistedSub = this.userService.getCheckUserIDExistedUpdatedListener().subscribe((data) => {
            // console.log(data.isExist);
            this.userIDExisted = data.isExist;
            if (!this.userIDExisted) {
                this.messageService.add({
                    severity:'success',
                    summary:'Passed',
                    detail:'can use this UserID',
                    sticky: true
                });
            } else {
                this.messageService.add({
                    severity:'error',
                    summary:'Error [ userID existed ]',
                    detail: 'userID existed !!',
                    sticky: true
                });
            }
        });
    }

    editUserProfile() {
        this.errID = '';
        this.errIDCreateUser = '';

        if (this.editMode === 'edit' && this.picMode === 'view') {
            // ## edit userClass for company
            this.putUserClassCompany();
        } else if (this.editMode === 'edit' && this.picMode !== 'view') {

        } else if (this.editMode === 'create') {
            this.createUserCompanyFactory();
        }
    }

    putUserClassCompany() {
        this.errID = '';

        // putUserClassCompany(memberUserID: string, companyID: string, userComClass: UserClass)
        // this.userComClass = {userClassID: 'gst', userClassName: 'guest', seq: 0};
        this.userService.putUserClassCompany(this.user.userID, this.company.companyID, this.userComClass, 1, 20);
        if (this.editUserClassSub) { this.editUserClassSub.unsubscribe(); }
        this.editUserClassSub = this.userService.getEditMemberClassUpdatedListener().subscribe((data) => {
            // this.product = data.product;
            // this.style = this.product.productCustomerCode.toUpperCase();
            // console.log(data);
            this.user = data.user;
            this.userIDCut = this.userService.getUserIDCutOutAbbreviation(this.user.userID, 4);
            if (this.user.state === 'userEmail') { this.userIDCut =  this.user.userID; }
            const userClassID = this.user.uCompany.filter(i=>(i.companyID === this.company.companyID))[0].userComClass.userClassID;
            // console.log(userClassID);
            this.setUserClassList(userClassID);
            if (data.success) {
                // this.closeDialog({success: true});
                this.messageService.add({
                    severity:'success',
                    summary:'edit member class company',
                    detail:'completed',
                    sticky: true
                });
            } else {
                this.errID = data.message.messageID;
                if (data.message.messageID === 'erru008') {
                    this.messageService.add({
                        severity:'error',
                        summary:'Error [ ' +data.message.messageID+ ' ]',
                        detail:'Edit member class company error [ edit error ] ',
                        sticky: true
                    });
                }
            }
        });

    }

    createUserCompanyFactory() {
        this.errIDCreateUser = '';
        // createUserCompanyFactory(user: User)
        this.user.userID = this.factory.fInfo.abbreviation + this.userIDCut;
        this.user.type = '';
        this.user.uFactory = [{
            factoryID: this.factory.factoryID,
            companyID: this.company.companyID,
            state: 'joined',
            userFacClass: this.userFacClass
        }];
        this.user.status = 'a';
        this.user.state = 'staff';  // ## staff= company create to user
        // console.log(this.user);
        this.userService.createUserCompanyFactory(this.user);
        if (this.createUserCompanyFactorySub) { this.createUserCompanyFactorySub.unsubscribe(); }
        this.createUserCompanyFactorySub = this.userService.getCreateUserCompanyFactoryUpdatedListener()
        .subscribe((data) => {
            if (data.success) {
                this.user = data.user;
                this.editMode = 'edit';
                // this.closeDialog({success: true});
                this.messageService.add({
                    severity:'success',
                    summary:'create user factory',
                    detail:'completed',
                    sticky: true
                });
            } else {
                this.errIDCreateUser = data.message.messageID;
                if (data.message.messageID === 'erru010' || data.message.messageID === 'erru010-1') {
                    this.messageService.add({
                        severity:'error',
                        summary:'Error [ ' +data.message.messageID+ ' ]',
                        detail:'create user factory error [ create error ] ',
                        sticky: true
                    });
                }
            }
        });

    }

    setUserClassList(userClassID: string) {
        this.positionItems = [];
        this.userPositon = this.userComClass.userClassName;  // ## default
        // console.log(this.editMode, this.type, this.userClasses.length);
        if (this.editMode !== 'create' && this.type === 'company' && this.userClasses.length>0) {
            this.userPositon = this.user.uCompany.filter(i=>(i.companyID === this.company.companyID))[0].userComClass.userClassName;
        } else if (this.editMode !== 'create' && this.type === 'factory' && this.userClasses.length>0) {
            this.userPositon = this.user.uFactory.filter(i=>(i.companyID === this.company.companyID && i.factoryID === this.factory.factoryID))[0].userFacClass.userClassName;
        }
        const iconLSelected = 'pi pi-fw pi-check';
        const iconL = '';
        const classL = 'pl-5';
        const classLSelected = 'font-bold';
        for (const userClass of this.userClasses) {
            this.positionItems.push(
                {
                    visible: true,
                    label: userClass.userClassName,
                    styleClass: userClass.userClassID===userClassID?classLSelected:classL,
                    icon: userClass.userClassID===userClassID?iconLSelected:iconL,
                    command: () => {
                        this.userPositon = userClass.userClassName;
                        this.userComClass = {
                            userClassID: userClass.userClassID,
                            userClassName: userClass.userClassName,
                            userType: userClass.userType,
                            seq: userClass.seq
                        };
                        this.userFacClass = {
                            userClassID: userClass.userClassID,
                            userClassName: userClass.userClassName,
                            userType: userClass.userType,
                            seq: userClass.seq
                        };
                    }
                }
            );
        }
    }

    getLabel() {
        return 'Update Profile';
    }

    ngOnDestroy(): void {
        if (this.editUserClassSub) { this.editUserClassSub.unsubscribe(); }
        if (this.checkUserIDExistedSub) { this.checkUserIDExistedSub.unsubscribe(); }
        if (this.createUserCompanyFactorySub) { this.createUserCompanyFactorySub.unsubscribe(); }

        // if (this.screenSub) { this.screenSub.unsubscribe(); }
    }
}

