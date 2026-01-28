import { Component, OnInit, OnDestroy } from '@angular/core';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Subscription } from 'rxjs';
import { GBC } from 'src/app/global/const-global';

import { Customer } from 'src/app/models/order.model';
import { CustomerService } from 'src/app/services/customer.service';
import { UserService } from 'src/app/services/user.service';

@Component({
    selector: 'app-s-select-customer',
    templateUrl: './s-select-customer.component.html',
    styleUrls: ['./s-select-customer.component.scss'],
})
export class SSelectCustomerComponent implements OnInit, OnDestroy {

    data: any;
    rows = 0; // ## 1 page / 10 items
    totalCustomers = 10;  // ## 10 for example
    customers: Customer[] = [];
    customerImageProfileGCSPath = GBC.customerImageProfileGCSPath;  // ## google storage path
    customerPageListItem = 0;

    private customersSub: Subscription = new Subscription();

    constructor(
        public config: DynamicDialogConfig,
        public ref: DynamicDialogRef,
        private userService: UserService,
        private custService: CustomerService,
    ) {}

    ngOnInit(): void {
        this.rows = this.custService.customerPageListItem; // ## 1 page / 10 items
        this.customers = this.custService.getCustomersArr();
        this. customerImageProfileGCSPath = GBC.customerImageProfileGCSPath;  // ## google storage path
        this.customerPageListItem = this.custService.customerPageListItem;

        // id: 'customersSelection',
        //         company: this.userService?.getCompany(),
        //         callfrom: this.formName,  // ## send to nodejs for choose buckets
        //         btnCaption: 'choose'
        this.data = this.config.data
        // console.log(this.data);

        // ## get customers
        // ## get products list getProducts(companyID: string, page: number, limit: number)
        this.custService.getCustomers(this.userService.getCompany().companyID, 1 , this.customerPageListItem);
        if (this.customersSub) { this.customersSub.unsubscribe(); }
        this.customersSub = this.custService.getCustomersUpdatedListener()
        .subscribe((data) => {
            this.customers = data.customers;
            // console.log(this.customers);

        });

    }

    genImagePath(imgPath: string) {
        if (imgPath.length > 0) {
            return this.customerImageProfileGCSPath+imgPath;
        }

        return GBC.nulltGCSPath;
    }

    selectCustomer(customer: Customer) {
        this.closeDialog(customer);
    }

    closeDialog(customer: Customer) {
        this.ref.close(customer);
    }

    ngOnDestroy(): void {
        if (this.customersSub) { this.customersSub.unsubscribe(); }
        // if (this.posteditCustomerSub) { this.posteditCustomerSub.unsubscribe(); }
        // if (this.errSub) { this.errSub.unsubscribe(); }
        // if (this.langSub) { this.langSub.unsubscribe(); }
        // if (this.screenSub) { this.screenSub.unsubscribe(); }

    }
}
