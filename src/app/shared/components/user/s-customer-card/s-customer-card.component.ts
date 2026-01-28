import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { Subscription } from 'rxjs';
import { GBC } from 'src/app/global/const-global';

import { Customer } from 'src/app/models/order.model';
import { CustomerService } from 'src/app/services/customer.service';
import { UserService } from 'src/app/services/user.service';


@Component({
    selector: 'app-s-customer-card',
    templateUrl: './s-customer-card.component.html',
    styleUrls: ['./s-customer-card.component.scss'],
})
export class SCustomerCardComponent implements OnInit, OnDestroy {
    customer: Customer = GBC.clrCustomer();

    customerImageProfileGCSPath = GBC.customerImageProfileGCSPath;  // ## google storage path
    // customer: Customer = this.userService.emptyCustomer();

    private customerSelectSub: Subscription = new Subscription();

    constructor(
        private userService: UserService,
        private custService: CustomerService,
    ) {}

    ngOnInit(): void {
        // this.customer = this.userService.emptyCustomer();
        this.customer = this.custService.getCustomer();
        // console.log(this.customer);
        this.getCustomerSelect();
    }

    getCustomerSelect() {
        if (this.customerSelectSub) { this.customerSelectSub.unsubscribe(); }
        this.customerSelectSub = this.userService.getOrderCustomerSelectUpdatedListener().subscribe((data) => {
            this.customer = data.customer;
        });
    }

    genImagePath(imgPath: string) {
        if (imgPath.length > 0) {
            return this.customerImageProfileGCSPath+imgPath;
        }

        return this.userService.emptyCustomerImageProfile();
    }

    ngOnDestroy(): void {
        if (this.customerSelectSub) { this.customerSelectSub.unsubscribe(); }
        // if (this.errSub) { this.errSub.unsubscribe(); }
        // if (this.sockio) { this.sockio.unsubscribe(); }
        // if (this.dataAroundAppSub) { this.dataAroundAppSub.unsubscribe(); }
        // if (this.screenSub) { this.screenSub.unsubscribe(); }
    }
}
