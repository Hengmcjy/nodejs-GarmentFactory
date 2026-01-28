import { Component, OnInit, OnDestroy } from '@angular/core';
import { MessageService } from 'primeng/api';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Subscription } from 'rxjs';
import { GBC } from 'src/app/global/const-global';

import { Customer } from 'src/app/models/order.model';

import { CustomerService } from 'src/app/services/customer.service';
import { UserService } from 'src/app/services/user.service';

@Component({
    selector: 'app-s-customer-profile',
    templateUrl: './s-customer-profile.component.html',
    styleUrls: ['./s-customer-profile.component.scss'],
    providers: [MessageService],
})
export class SCustomerProfileComponent implements OnInit, OnDestroy {

    data: any = {};
    modeView = false; // ## for view only cannot edit , cannot update

    customer: Customer = GBC.clrCustomer();
    userID = '';
    userName = '';
    companyID = '';
    modeCus = '';

    private postCreateCustomerSub: Subscription = new Subscription();
    private posteditCustomerSub: Subscription = new Subscription();

    constructor(
        public config: DynamicDialogConfig,
        public ref: DynamicDialogRef,
        public messageService: MessageService,

        private userService: UserService,
        private custService: CustomerService,
    ) {}

    ngOnInit(): void {
        // console.log(this.config.data);
        this.data = this.config.data;
        this.modeView = this.data.modeView;

        this.customer = this.custService.getCustomer();
        this.userID = this.userService.getUserID();
        this.userName = this.userService.getUser().uInfo.userName;
        this.companyID = this.userService.getCompany().companyID;

        this.modeCus = this.config.data.id;
        this.customer = this.custService.getCustomer();
        // console.log(this.customer);
        if (this.modeCus==='create') { this.customer = GBC.clrCustomer(); }
    }

    postCustomer() {
        if (this.modeCus==='create') {
            this.postCustomerCreateNew();
        } else {
            this.postCustomerEdit();
        }
    }

    postCustomerCreateNew() {
        this.customer.companyID = this.companyID;
        this.custService.postCustomerCreateNew(this.userID, this.userName, this.customer);

        if (this.postCreateCustomerSub) { this.postCreateCustomerSub.unsubscribe(); }
        this.postCreateCustomerSub = this.custService.getCustomerUpdatedListener().subscribe((data) => {
            this.customer = data.customer;
            this.closeDialog();
        });
    }

    postCustomerEdit() {

    }

    closeDialog() {
        this.ref.close('button close dialog from customer edit');
    }

    ngOnDestroy(): void {

        if (this.postCreateCustomerSub) { this.postCreateCustomerSub.unsubscribe(); }
        if (this.posteditCustomerSub) { this.posteditCustomerSub.unsubscribe(); }
        // if (this.errSub) { this.errSub.unsubscribe(); }
        // if (this.langSub) { this.langSub.unsubscribe(); }
        // if (this.screenSub) { this.screenSub.unsubscribe(); }

    }
}
