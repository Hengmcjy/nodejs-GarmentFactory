import { Component } from '@angular/core';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-tsp-dashboard',
  templateUrl: './tsp-dashboard.component.html',
  styleUrls: ['./tsp-dashboard.component.scss']
})
export class TspDashboardComponent {

    formActive = 'transport-dashboard';
    formName = this.formActive;
    isAuthenticated = false;  // ## logged in ?

    // mode = 'delivery-list'; // ##

    private dataAroundAppSub: Subscription = new Subscription();
    // private yarnsListSub: Subscription = new Subscription();

    constructor(
        private router: Router,
        private location: Location,
        public userService: UserService,
    ) {}

    ngOnInit(): void {
        // console.log('TspDashboardComponent');
        this.location.replaceState('/'); // ## hide loocation
        this.userService.setFormActive(this.formActive);
        // this.userService.setDataAroundAppStatusListenerToNext();

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

    // changeMode(mode: string) {
    //     this.mode = mode;
    // }

    ngOnDestroy(): void {
        if (this.dataAroundAppSub) { this.dataAroundAppSub.unsubscribe(); }
        // if (this.yarnsListSub) { this.yarnsListSub.unsubscribe(); }

    }


}
