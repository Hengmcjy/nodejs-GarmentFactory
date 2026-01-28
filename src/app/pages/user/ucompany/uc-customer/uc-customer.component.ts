import { Component, OnInit, OnDestroy } from '@angular/core';
import { Location } from '@angular/common';
import { DialogService } from 'primeng/dynamicdialog';
import { Subscription } from 'rxjs';

import { Customer } from 'src/app/models/order.model';
import { CustomerService } from 'src/app/services/customer.service';
import { UserService } from 'src/app/services/user.service';

import { UcCustomerEditComponent } from '../uc-customer-edit/uc-customer-edit.component';
import { GBC } from 'src/app/global/const-global';



@Component({
    selector: 'app-uc-customer',
    templateUrl: './uc-customer.component.html',
    styleUrls: ['./uc-customer.component.scss'],
    providers: [DialogService],
})
export class UcCustomerComponent implements OnInit, OnDestroy {
    formActive = 'customer';
    newCustomerShow = false;
    customerImageProfileGCSPath = GBC.customerImageProfileGCSPath;  // ## google storage path
    customerPageListItem = 0;
    companyID = '';

    isAuthenticated = false; // ## logged in ?
    screenSize = 'sm';

    customers: Customer[] = [];
    customer: Customer = GBC.clrCustomer();

    private dataAroundAppSub: Subscription = new Subscription();
    private postCreateCustomerSub: Subscription = new Subscription();
    private postCreateCustomersSub: Subscription = new Subscription();

    constructor(
        private location: Location,
        public dialogService: DialogService,
        private userService: UserService,
        private custService: CustomerService,
    ) {}

    ngOnInit(): void {
        this.location.replaceState('/'); // ## hide loocation
        // this.userService.setFormActive(this.formActive);
        this.customerPageListItem = this.custService.customerPageListItem;
        this.companyID = this.userService.getCompany().companyID;
        this.screenSize = this.userService.screenSize;

        this.customers= this.custService.getCustomersArr();
        this.customer = this.custService.getCustomer();

        // this.customers = this.custService.getCustomersArr();
        // this.customer = this.custService.getCustomer();

        // ## get customers

        // ## get DataAroundApp
        // ## user auth  isAuthenticated / dataAroundApp
        this.isAuthenticated = this.userService.getIsAuth();
        this.dataAroundAppSub = this.userService
            .getDataAroundAppStatusListener()
            .subscribe((dataAroundApp) => {
                // ## declare initial variable from service user
                this.isAuthenticated = dataAroundApp.isAuthenticated;
                this.customer = dataAroundApp.customer;

                // console.log('screenSizeInfo : ' , this.screenSize);
                // console.log('isAuthenticated : ' , this.isAuthenticated);
                if (this.isAuthenticated) {
                    // ## user logged in already
                } else {
                    // ## user no login
                }
            });

        // ## get products list getProducts(companyID: string, page: number, limit: number)
        this.custService.getCustomers(this.userService.getCompany().companyID, 1 , this.customerPageListItem);
        if (this.postCreateCustomersSub) { this.postCreateCustomersSub.unsubscribe(); }
        this.postCreateCustomersSub = this.custService.getCustomersUpdatedListener()
        .subscribe((data) => {
            this.customers = data.customers;
            // console.log(this.customers);

        });

        // ## get data from create new product
        if (this.postCreateCustomerSub) { this.postCreateCustomerSub.unsubscribe(); }
        this.postCreateCustomerSub = this.custService.getCustomerUpdatedListener()
        .subscribe((data) => {
            // console.log(data.product);
            this.customer = data.customer;
            // ## get all product
            this.custService.getCustomers(this.userService.getCompany().companyID, 1 , this.customerPageListItem);

        });


    }

    newCustomer() {
        this.newCustomerShow = true;
    }

    cancelCreateNewCustomer() {
        this.newCustomerShow = false;
    }

    showCustomerEditModal(mode: string, modeStr: string, customer: Customer) {
        if (mode==='edit') { this.custService.setCustomer(customer); }

        let modalWidth = '90%';
        if (this.screenSize == 'xl' ) { modalWidth = '60%' }
        else if (this.screenSize == 'lg' || this.screenSize == 'md') {  modalWidth = '75%' }

        const ref = this.dialogService.open(UcCustomerEditComponent, {
            data: {
                id: mode,
            },
            header: modeStr,
            width: modalWidth,
        });

        ref.onClose.subscribe((data: any) => {
            // console.log(data);
            this.newCustomerShow = false;
            // if (car) {
            //     this.messageService.add({severity:'info', summary: 'Car Selected', detail:'Vin:' + car.vin});
            // }
        });
    }

    showCreateCustomerModal() {}

    genImagePath(imgPath: string) {
        if (imgPath.length > 0) {
            return this.customerImageProfileGCSPath+imgPath;
        }

        return GBC.nulltGCSPath;
    }

    ngOnDestroy(): void {
        if (this.dataAroundAppSub) { this.dataAroundAppSub.unsubscribe(); }
        if (this.postCreateCustomerSub) { this.postCreateCustomerSub.unsubscribe(); }
        if (this.postCreateCustomersSub) { this.postCreateCustomersSub.unsubscribe(); }
        // if (this.langSub) { this.langSub.unsubscribe(); }
        // if (this.screenSub) { this.screenSub.unsubscribe(); }

    }
}
