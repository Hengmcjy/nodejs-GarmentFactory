import { Component, OnDestroy, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { Subscription } from 'rxjs';
import { UserService } from 'src/app/services/user.service';

@Component({
    selector: 'app-hr',
    templateUrl: './hr.component.html',
    styleUrls: ['./hr.component.scss'],
})
export class HrComponent implements OnInit, OnDestroy {
    formActive = 'hr';
    formName = this.formActive;
    isAuthenticated = false;  // ## logged in ?

    private dataAroundAppSub: Subscription = new Subscription();

    constructor(
        private location: Location,
        // private confirmationService: ConfirmationService,
        // private messageService: MessageService,

        public userService: UserService,
        // private orderService: OrderService,
    ) {}

    ngOnInit(): void {
        this.location.replaceState('/'); // ## hide loocation
        this.userService.setFormActive(this.formActive);

        // ## get DataAroundApp
        // ## user auth  isAuthenticated / dataAroundApp
        this.isAuthenticated = this.userService.getIsAuth();
        this.dataAroundAppSub = this.userService
            .getDataAroundAppStatusListener()
            .subscribe((dataAroundApp) => {
                // ## declare initial variable from service user
                this.isAuthenticated = dataAroundApp.isAuthenticated;

                // console.log('screenSizeInfo : ' , this.screenSize);
                // console.log('isAuthenticated : ' , this.isAuthenticated);
                if (this.isAuthenticated) {
                    // ## user logged in already
                } else {
                    // ## user no login
                }
            });

        //
    }


    ngOnDestroy(): void {
        if (this.dataAroundAppSub) { this.dataAroundAppSub.unsubscribe(); }
        // if (this.qrCodeListProductStyleCFNSub) { this.qrCodeListProductStyleCFNSub.unsubscribe(); }
        // if (this.dataAroundNodeAppSub) { this.dataAroundNodeAppSub.unsubscribe(); }
        // if (this.repCurrentProductQtyCFNSub) { this.repCurrentProductQtyCFNSub.unsubscribe(); }

        // if (this.errSub) { this.errSub.unsubscribe(); }
        // if (this.langSub) { this.langSub.unsubscribe(); }
        // if (this.langListSub) { this.langListSub.unsubscribe(); }

        // this.userService.setOrderProduction(this.userService.clrOrderProduction());
    }
}

