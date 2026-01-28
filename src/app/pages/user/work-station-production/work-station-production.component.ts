import { Component, OnInit, Inject, OnDestroy, Input } from '@angular/core';
// import { Location } from '@angular/common';
// import { DOCUMENT } from '@angular/common';
// import { Router } from '@angular/router';
import { DialogService } from 'primeng/dynamicdialog';
import { MessageService } from 'primeng/api';

// import { UserService } from 'src/app/services/user.service';
// import { TranslateService } from '@ngx-translate/core';

// import { StaffLoginComponent } from 'src/app/shared/components/general/staff-login/staff-login.component';

@Component({
    selector: 'app-work-station-production',
    templateUrl: './work-station-production.component.html',
    styleUrls: ['./work-station-production.component.scss'],
    providers: [DialogService, MessageService],
})
export class WorkStationProductionComponent implements OnInit, OnDestroy {
    @Input() viewMode: string = 'user'; // ## view= only view, user= really working

    // formActive = 'workstation-production';
    // pageActive = 'home'; // ## home , getproduct , viewstat , chart
    // staffLoggedIN = false;

    // elem: any;

    constructor(
        // private location: Location,
        // @Inject(DOCUMENT) private document: any,
        // private router: Router,
        // public translate: TranslateService,
        public dialogService: DialogService,
        public messageService: MessageService,
        // private userService: UserService
    ) {}

    ngOnInit(): void {
        // console.log('WorkStationProductionComponent');
        // this.location.replaceState('/'); // ## hide loocation
        // this.userService.setFormActive(this.formActive);
        // this.pageActive = 'home';

        // this.elem = document.documentElement;
        // if (this.viewMode==='user') { this.openFullscreen(); } // ## only user mode

    }

    // selectPage(page: string) {
    //     this.pageActive = page;
    //     // console.log(this.pageActive);
    // }

    // openFullscreen() {
    //     // console.log('openFullscreen');
    //     if (this.elem.requestFullscreen) {
    //         this.elem.requestFullscreen();
    //     } else if (this.elem.mozRequestFullScreen) {
    //         /* Firefox */
    //         this.elem.mozRequestFullScreen();
    //     } else if (this.elem.webkitRequestFullscreen) {
    //         /* Chrome, Safari and Opera */
    //         this.elem.webkitRequestFullscreen();
    //     } else if (this.elem.msRequestFullscreen) {
    //         /* IE/Edge */
    //         this.elem.msRequestFullscreen();
    //     }
    // }

    // /* Close fullscreen */
    // closeFullscreen() {
    //     if (this.document.exitFullscreen) {
    //         this.document.exitFullscreen();
    //     } else if (this.document.mozCancelFullScreen) {
    //         /* Firefox */
    //         this.document.mozCancelFullScreen();
    //     } else if (this.document.webkitExitFullscreen) {
    //         /* Chrome, Safari and Opera */
    //         this.document.webkitExitFullscreen();
    //     } else if (this.document.msExitFullscreen) {
    //         /* IE/Edge */
    //         this.document.msExitFullscreen();
    //     }
    // }

    // staffLogin() {
    //     this.staffLoggedIN = true;
    //     this.showStaffLoginModal();
    // }

    // staffLogout() {
    //     this.pageActive = 'home';
    //     this.staffLoggedIN = false;
    // }

    // logout() {
    //     this.closeFullscreen();
    //     this.router.navigate(['/']);
    // }

    // showStaffLoginModal() {
    //     const ref = this.dialogService.open(StaffLoginComponent, {
    //         data: {
    //             id: 'staffLogin',
    //         },
    //         header: 'staff login',
    //         width: '50%'
    //     });

    //     ref.onClose.subscribe((data: any) => {
    //         console.log(data);
    //         // if (car) {
    //         //     this.messageService.add({severity:'info', summary: 'Car Selected', detail:'Vin:' + car.vin});
    //         // }
    //     });
    // }

    ngOnDestroy(): void {

    }
}
