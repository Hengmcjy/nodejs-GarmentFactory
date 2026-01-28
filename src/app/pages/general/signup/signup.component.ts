import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
// import { TranslateService } from '@ngx-translate/core';
import { DialogService } from 'primeng/dynamicdialog';
import { Subscription } from 'rxjs';


import { UserService } from 'src/app/services/user.service';


import { UsignupComponent } from 'src/app/shared/components/user/usignup/usignup.component';

@Component({
    selector: 'app-signup',
    templateUrl: './signup.component.html',
    styleUrls: ['./signup.component.scss'],
    providers: [DialogService],
})
export class SignupComponent implements OnInit, OnDestroy {

    isAuthenticated = false;  // ## logged in ?
    screenSize = '';
    initialLang = 'en';
    lang = 'en';

    private dataAroundAppSub: Subscription = new Subscription();

    constructor(
        public dialogService: DialogService,
        private router: Router,
        // public translate: TranslateService,
        private userService: UserService
    ) {}

    ngOnInit(): void {
        // console.log('SignupComponent  000');

        // ## set lang
        this.lang = this.userService.getLanguage();
        this.setLang(this.lang);

        // ## get screen size
        this.screenSize = this.userService.screenSize;
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

        this.showDialog();
    }

    setLang(lang: string) {
        // this.translate.use(lang);
    }

    async showDialog() {
        // let header: string = await this.getLangu('TEST.signup');
        let header: string = '';
        console.log(header);
        let modalWidth = '90%';
        if (this.screenSize == 'xl' ) { modalWidth = '40%' }
        else if (this.screenSize == 'lg' || this.screenSize == 'md') {  modalWidth = '50%' }
        const ref = this.dialogService.open(UsignupComponent, {
            data: {
                id: 'testID-1234',
            },
            header: header,
            width: modalWidth,
        });
        // console.log('dialogService.open');

        ref.onClose.subscribe((data: any) => {
            console.log(data);
            //## if press button close no action anymore
            if (!data) {
                this.router.navigate(['/']);
            }

            // if (car) {
            //     this.messageService.add({severity:'info', summary: 'Car Selected', detail:'Vin:' + car.vin});
            // }
        });
    }

    // getLangu(code: string): Promise<any> {
    //     const promise = new Promise((resolve, reject) => {
    //         this.translate.get(code).subscribe((res: string) => {
    //             // console.log(res);
    //             resolve(res);
    //         });
    //     });
    //     // console.log(promise);
    //     return promise;

    // }

    ngOnDestroy(): void {

        if (this.dataAroundAppSub) { this.dataAroundAppSub.unsubscribe(); }
        // if (this.sockio) { this.sockio.unsubscribe(); }
        // if (this.errSub) { this.errSub.unsubscribe(); }
        // if (this.langSub) { this.langSub.unsubscribe(); }
        // if (this.screenSub) { this.screenSub.unsubscribe(); }

        // if (this.darkSub) { this.darkSub.unsubscribe(); }
        // if (this.screenSizeSub) { this.screenSizeSub.unsubscribe(); }
        // if (this.darkSub) { this.darkSub.unsubscribe(); }
        // if (this.errSub) { this.errSub.unsubscribe(); }
        // if (this.authSub) { this.authSub.unsubscribe(); }
        // if (this.screenSub) { this.screenSub.unsubscribe(); }
        // if (this.screenSizeSub) { this.screenSizeSub.unsubscribe(); }
    }
}
