import { Component, OnDestroy, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { UserService } from 'src/app/services/user.service';
import { OrderService } from 'src/app/services/order.service';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';

@Component({
    selector: 'app-rep-exclusive-user',
    templateUrl: './rep-exclusive-user.component.html',
    styleUrls: ['./rep-exclusive-user.component.scss'],
})
export class RepExclusiveUserComponent implements OnInit, OnDestroy {

    formActive = 'rep-exclusive-user';

    private ordersSub: Subscription = new Subscription;

    constructor(
        private location: Location,
        private router: Router,
        // private confirmationService: ConfirmationService,
        // private messageService: MessageService,

        public userService: UserService,
        private orderService: OrderService,
    ) {}

    ngOnInit(): void {
        // console.log('page = RepExclusiveUserComponent');
        this.location.replaceState('/'); // ## hide loocation
        // this.userService.setFormActive(this.formActive);
        this.getOrders();
    }

    getOrders()  {
        // getOrders(companyID: string, page: number, limit: number)
        this.orderService.getOrders(this.userService.getCompany().companyID, 1 , 100, this.orderService.seasonYear);
        if (this.ordersSub) { this.ordersSub.unsubscribe(); }
        this.ordersSub = this.orderService.getCustomersUpdatedListener().subscribe((data) => {

            // console.log(this.companyState);
            // (mode === 'rep-exclusive' || mode === 'staff-qrcode')
            if (this.userService.companyState === 'rep-exclusive') {
                this.router.navigate(['/user/ucompany/dashboard']);
            } else if (this.userService.companyState === 'staff-qrcode') {
                this.router.navigate(['/user/ucompany/order']);
            }
        });
    }

    ngOnDestroy(): void {
        if (this.ordersSub) { this.ordersSub.unsubscribe(); }
        // if (this.dataAroundAppSub) { this.dataAroundAppSub.unsubscribe(); }

        // if (this.langSub) { this.langSub.unsubscribe(); }
        // if (this.dataAroundAppSub) { this.dataAroundAppSub.unsubscribe(); }
    }
}
