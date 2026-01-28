import { Component, OnInit, OnDestroy } from '@angular/core';
// import { TranslateService } from '@ngx-translate/core';
import { Location } from '@angular/common';
import { Subscription } from 'rxjs';
import { NavigationExtras, Router } from '@angular/router';
import { DialogService } from 'primeng/dynamicdialog';
import { MessageService } from 'primeng/api';

import { UserService } from 'src/app/services/user.service';
import { OrderService } from 'src/app/services/order.service';
import { ProductService } from 'src/app/services/product.service';
import { CustomerService } from 'src/app/services/customer.service';

import { Customer, Order } from 'src/app/models/order.model';
import { Company } from 'src/app/models/app.model';
import { User } from 'src/app/models/user.model';
import { Product, ProductImageProfiles } from 'src/app/models/product.model';

import { UcCustomerEditComponent } from '../../ucompany/uc-customer-edit/uc-customer-edit.component';
import { ProductEditComponent } from '../product/product-edit/product-edit.component';
import { SUserCardComponent } from 'src/app/shared/components/user/s-user-card/s-user-card.component';
import { GBC } from 'src/app/global/const-global';

@Component({
    selector: 'app-order',
    templateUrl: './order.component.html',
    styleUrls: ['./order.component.scss'],
    providers: [DialogService, MessageService],
})
export class OrderComponent implements OnInit, OnDestroy {
    formActive = 'order';
    formName = this.formActive;
    isAuthenticated = false;  // ## logged in ?
    productImageProfileGCSPath = GBC.productImageProfileGCSPath;  // ## google storage path

    company: Company = GBC.clrCompany();
    user: User = GBC.clrUser();
    productImageProfiles: ProductImageProfiles[] = [];

    // seasonYear = 'last';
    orders: Order[] = [];
    ordersF: Order[] = [];
    page = 1;
    limit = 0;
    ordersCount = 0;

    private dataAroundAppSub: Subscription = new Subscription();
    private ordersSub: Subscription = new Subscription();
    private productImageProfilesSub: Subscription = new Subscription();
    private user1CompanySub: Subscription = new Subscription();
    private product1CompanySub: Subscription = new Subscription();
    private customer1CompanySub: Subscription = new Subscription();

    constructor(
        // public translate: TranslateService,
        public dialogService: DialogService,
        public messageService: MessageService,
        private router: Router,
        private location: Location,

        private userService: UserService,
        private orderService: OrderService,
        private productService: ProductService,
        private cusService: CustomerService,
    ) {}

    ngOnInit(): void {
        this.location.replaceState('/'); // ## hide loocation
        this.userService.setFormActive(this.formActive);

        this.company = this.userService.getCompany();
        this.user = this.userService.getUser();
        this.orders = this.orderService.getOrdersArr();
        this.limit = this.orderService.orderPageListItem;


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

                // ## season year
                // console.log(this.userService.seasonYear);
                // this.getOrders(this.page, this.limit, this.userService.seasonYear);
                this.orders = this.orderService.getOrdersArr();
            });

        this.getOrders(this.page, this.orderService.ordersLimit, this.orderService.seasonYear);

    }

    getOrders(page: number, limit: number, seasonYear: string) {
        // ## get orders
        this.orderService.getOrders(this.company.companyID, page, limit, seasonYear);
        this.ordersSub = this.orderService.getCustomersUpdatedListener().subscribe((data) => {
            this.orders = data.orders;
            this.ordersCount = data.ordersCount;
            // console.log('this.orders : ' , this.orders);

            this.getOrdersData();

            // ## getting data productIDs []
            let productIDs: string[] = [];
            for (const order of this.orders) { productIDs.push(order.productOR.productID); }

            // ## product imageProfile
            this.postGetProductImageProfiles(productIDs);
        });
    }

    getOrdersData() {
        const idx1 = (+this.page - 1) * this.limit;
        const idx2 = (+this.page * this.limit) - 1 ;
        this.ordersF = [];
        for ( let i = idx1; i <= idx2; i++) {
            this.ordersF.push(this.orders[i]);
        }
    }

    checkQtyMaxView(order: Order): string {
        let hadMaxQty = false;
        if (order && order.orderSetting && order.orderSetting.qtyMaxView && order.orderSetting.qtyMaxView.length>0) {
            return '.';
        }
        return '';
    }

    paginate(event: any) {
        // console.log(event.rows, +event.page);
        this.limit = event.rows;
        this.page = +event.page + 1;
        // this.getOrders(+event.page + 1, this.limit, this.orderService.seasonYear);

        this.getOrdersData();

        //event.first = Index of the first record
        //event.rows = Number of rows to display in new page
        //event.page = Index of the new page
        //event.pageCount = Total number of pages
    }

    postGetProductImageProfiles(productIDs: string[]) {
        this.productService.postGetProductImageProfiles(this.userService.getCompany().companyID, productIDs);
        if (this.productImageProfilesSub) { this.productImageProfilesSub.unsubscribe(); }
        this.productImageProfilesSub = this.productService.getProductImageProfilesUpdatedListener()
        .subscribe((data) => {
            this.productImageProfiles = data.productImageProfiles;
            // console.log(this.productImageProfiles);

        });
    }

    getUser1Company(userID: string) {
        this.userService.getUser1Company(userID);
        if (this.user1CompanySub) { this.user1CompanySub.unsubscribe(); }
        this.user1CompanySub = this.userService.getUser1CompanyListsUpdatedUpdatedListener()
        .subscribe((data) => {
            const user = data.user;
            this.userService.userSelected = user;
            this.showStaffSelectionViewModal(user);
        });
    }

    getProduct1Company(productID: string, companyID: string , mode: string) {
        this.productService.getProduct1(companyID, productID);
        if (this.product1CompanySub) { this.product1CompanySub.unsubscribe(); }
        this.product1CompanySub = this.productService.getUserProductUpdatedListener()
        .subscribe((data) => {
            const product = data.product;
            this.productService.setProduct(product);
            if (mode === 'view') {
                this.showProductSelectionViewModal(product);
            }
        });
    }

    getCustomer1Company(customerID: string, companyID: string, mode: string) {
        // async getCustomer1(companyID: string, customerID: string)
        this.cusService.getCustomer1(companyID, customerID);
        if (this.customer1CompanySub) { this.customer1CompanySub.unsubscribe(); }
        this.customer1CompanySub = this.cusService.getCustomerUpdatedListener()
        .subscribe((data) => {
            const customer = data.customer;
            this.cusService.setCustomer(customer);
            if (mode === 'view') {
                this.showCustomerSelectionViewModal(customer);
            }
        });
    }

    // mode= view, goto
    async checkGetCustomerID(customerID: string, mode: string) {
        // async get1CustomerInfo(customerID: string, companyID: string)
        const customer: Customer = await this.cusService.get1CustomerInfo(customerID, this.company.companyID);
        if (customer.customerID !== '') {
            this.cusService.setCustomer(customer);
            if (mode === 'view') {
                this.showCustomerSelectionViewModal(customer);
            }
        } else {
            this.getCustomer1Company(customerID, this.company.companyID, mode);
        }
    }

    showCustomerSelectionViewModal(customer: Customer) {
        const ref = this.dialogService.open(UcCustomerEditComponent, {
            data: {
                id: 'customerView',
                company: this.userService?.getCompany(),
                customer: customer,
                callfrom: this.formName,  // ## send to nodejs for choose buckets
                modeView: true

            },
            header: 'Customer Info view',
            width: '80%',
        });

        ref.onClose.subscribe((data: any) => {
            // console.log(data);
        });
    }

    async checkGetProductID(productID: string, mode: string) {
        // get1ProductInfo(productID: string, companyID: string)
        const product: Product = await this.productService.get1ProductInfo(productID, this.company.companyID);
        if (product.productID !== '') {
            this.productService.setProduct(product);
            if (mode === 'view') {
                this.showProductSelectionViewModal(product);
            }
        } else {
            this.getProduct1Company(productID, this.company.companyID, mode);
        }
    }

    showProductSelectionViewModal(product: Product) {
        this.productService.productModeView = true;
        const ref = this.dialogService.open(ProductEditComponent, {
            data: {
                id: 'productView',
                company: this.userService?.getCompany(),
                product: product,
                callfrom: this.formName,  // ## send to nodejs for choose buckets
                modeView: true,


            },
            header: 'Product Info view',
            width: '80%',
        });

        ref.onClose.subscribe((data: any) => {
            this.productService.productModeView = false;
            // console.log(data);
        });
    }


    async checkGetUserID(userID: string) {
        const createByUser: User = await this.userService.get1UserInfo(userID);
        if (createByUser.userID !== '') {
            this.userService.userSelected = createByUser;
            this.showStaffSelectionViewModal(createByUser);
        } else {
            this.getUser1Company(userID);
        }
    }

    async showStaffSelectionViewModal(user: User) {
        this.productService.productModeView = true;
        const ref = this.dialogService.open(SUserCardComponent, {
            data: {
                id: 'staffView',
                company: this.userService?.getCompany(),
                user: user,
                callfrom: this.formName,  // ## send to nodejs for choose buckets
                modeView: true

            },
            showHeader: true,
            header: '',
            width: '30%',
        });

        ref.onClose.subscribe((data: any) => {
            // console.log(data);
        });
    }


    genProductImagePath(productID: string) {
        if (this.productImageProfiles.length > 0) {
            const idx = this.productImageProfiles.findIndex( fi =>(fi.productID === productID));
            if (idx >= 0) {
                return this.productImageProfileGCSPath+this.productImageProfiles[idx].imageProfile;
            } else { return GBC.nulltGCSPath; }
        } else { return GBC.nulltGCSPath; }
    }

    genImagePath(imgPath: string) {
        if (imgPath.length > 0) {
            return this.productImageProfileGCSPath+imgPath;
        }

        return GBC.nulltGCSPath;
    }

    goto(path: string, order: Order, customerID: string, productID: string) {
        // qrcode/staff    '/user/ucompany/order/edit'
        //
        this.orderService.setOrder(order);  // ## set order selected
        const mode = 'goto';
        this.checkGetCustomerID(customerID, mode);
        this.checkGetProductID(productID, mode)
        const orderID = order.orderID;
        const params: NavigationExtras = {
            queryParams: { orderID: orderID, orderMode: 'edit-order' },
        };
        if (this.userService.companyState === 'staff-qrcode') {
            // const path2 = '/user/ucompany/order/qrcode/staff ';
            // this.router.navigate([path2]);
            this.router.navigate(['/user/ucompany/order/qrcode/staff']);
        } else {
            this.router.navigate([path], params);
        }
    }

    ngOnDestroy(): void {
        if (this.dataAroundAppSub) { this.dataAroundAppSub.unsubscribe(); }
        if (this.ordersSub) { this.ordersSub.unsubscribe(); }
        if (this.productImageProfilesSub) { this.productImageProfilesSub.unsubscribe(); }
        if (this.user1CompanySub) { this.user1CompanySub.unsubscribe(); }
        if (this.product1CompanySub) { this.product1CompanySub.unsubscribe(); }
        if (this.customer1CompanySub) { this.customer1CompanySub.unsubscribe(); }
        // if (this.langSub) { this.langSub.unsubscribe(); }
        // if (this.screenSub) { this.screenSub.unsubscribe(); }
    }
}
