import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
// import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';

import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';

import { UserService } from 'src/app/services/user.service';
import { MailService } from 'src/app/services/mail.service';

@Component({
  selector: 'app-usignup',
  templateUrl: './usignup.component.html',
  styleUrls: ['./usignup.component.scss']
})
export class UsignupComponent implements OnInit, OnDestroy {
    lang: string = '';
    errID: string = '';
    blockSpecial: RegExp = /^[^<>*!]+$/
    email1: string = '';
    pwd1: string = '';
    pwd2: string = '';
    emailCheck = false;
    pwdCheck = false;

    private signupSub: Subscription = new Subscription;
    private errSub: Subscription = new Subscription;

    constructor(
        public config: DynamicDialogConfig,
        public ref: DynamicDialogRef,
        private router: Router,
        // public translate: TranslateService,
        private userService: UserService,
        private mailService: MailService,
    ) { }

    ngOnInit(): void {
        this.errID = '';

        // ## set lang
        this.lang = this.userService.getLanguage();
        this.setLang(this.lang);

        // ## observ err
        this.errSub = this.userService.getErrorStatusListener().subscribe(errObj => {
            // console.log(errObj);
            this.errID = errObj.messageID;
            // console.log(this.errID);
        });


    }

    setLang(lang: string) {
        // this.translate.use(lang);
    }

    closeDialog() {
        this.ref.close('button close dialog from ufactory create');
    }

    signup() {
        // test send mail
        this.mailService.postSignupSendMail(this.email1, this.pwd1);

        this.errID = '';
        this.userService.userSignup(this.email1, this.pwd1);
        // ## signup observer
        this.signupSub = this.userService.getSignupStatusListener().subscribe(data => {
            // console.log(data);
            if (data) {
                this.ref.close({
                    email: this.email1,
                    pwd: this.pwd1,
                    status: 'sign up complete'
                });
                this.router.navigate(['']);
            }
        });

    }

    emailChange(ev: any) {
        this.errID = '';
        this.emailCheck = this.userService.checkEmailStr(this.email1);
        // console.log(this.emailCheck);
    }

    pwdChange(ev: any) {
        // console.log('pwd1: ' + this.pwd1 + ' /  pwd2: ' + this.pwd2);
        this.pwdCheck = this.userService.check2password(this.pwd1, this.pwd2);
        // console.log(this.pwdCheck);
    }



    ngOnDestroy(): void {
        // this.ref.close();
        if (this.signupSub) { this.signupSub.unsubscribe(); }
        if (this.errSub) { this.signupSub.unsubscribe(); }
    }
}
