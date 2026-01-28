/* eslint-disable @typescript-eslint/member-ordering */
/* eslint-disable no-underscore-dangle */

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { Router } from '@angular/router';
import { DeviceDetectorService } from 'ngx-device-detector';
import { NIL, v4 as uuidv4, v5 as uuidv5,  validate as uuidValidate, version as uuidVersion } from 'uuid';
import * as CryptoJS from 'crypto-js';

// import { LoadingController } from '@ionic/angular';




import { StorageService } from './storage.service';
import { UserService } from './user.service';
import { SocketIOService } from './socketio.service';
import { environment } from '../../environments/environment';

import { User, UserClass, AuthData, SigupData } from '../models/user.model';
import { Company, DataAroundApp, Factory, GeneralInfo, ModeRes, ScreenInfo, TokenSet } from '../models/app.model';
import { UCompany, UFactory } from '../models/user.model';
import { Product } from '../models/product.model';
import { Customer } from '../models/order.model';
import { GBC } from '../global/const-global';
// import { MenuService } from './menu.service';
// import { debounceTime } from 'rxjs/operators';

const BACKEND_URL = environment.apiUrl + '/cus';
// const BACKEND_AESP = environment.aesP;

// ## user, language , getIP-real

@Injectable({
  providedIn: 'root'
})
export class CustomerService {

    private customer: Customer = this.clrCustomer();

    private customers: Customer[] = [];

    customerPageListItem = 10;

    // // ## google storage path
    // public customerGCSPath = 'https://storage.googleapis.com/garmentcustomergarmentworld1sthighquality/';
    // public customerImageProfileGCSPath = 'https://storage.googleapis.com/garmentcustomergarmentworld1sthighquality/imageProfile/';

    private customerListsUpdated = new Subject<{ customer: Customer}>();
    private customersListsUpdated = new Subject<{ customers: Customer[]}>();

    constructor(
        private http: HttpClient,
        private router: Router,
        private deviceService: DeviceDetectorService,

        // private loadingCtrl: LoadingController,

        private storageService: StorageService,
        private socketService: SocketIOService,
        private userService: UserService
        // private menuService: MenuService,
    ) { }

    // #######################################################################
    // ## general info ########################################################

    clearDataWhenLogOut() {
        this.customer = GBC.clrCustomer();
        this.customers = [];
    }


    async get1CustomerInfo(customerID: string, companyID: string) {
        let customer: Customer = GBC.clrCustomer();
        const customerMember = await this.customers.filter(i=>(i.customerID === customerID && i.companyID === companyID));
        if (customerID === this.customer.customerID) {
            return this.customer;
        } else if (customerMember.length > 0) {
            return customerMember[0];
        } else {
            return customer;
        }
    }

    // let user: User = this.clrUser();
    // const userMember = await this.membersCompany.filter(i=>(i.userID === userID));
    // if (userID === this.user.userID) {
    //     return this.user;
    // } else if (userID === this.user1Company.userID) {
    //     return this.user1Company;
    // } else if (userMember.length > 0) {
    //     return userMember[0];
    // } else {
    //     return user;
    // }

    // ## general info ########################################################
    // #######################################################################

    // #######################################################################
    // ## customer ########################################################

    setCustomer(customer: Customer) {
        this.customer = customer;
        this.userService.setCustomer(this.customer);
    }

    setCustomers(customers: Customer[]) {
        this.customers = customers;
        this.userService.setCustomers(this.customers);
    }

    getCustomer() {
        return this.customer;
    }


    getCustomersArr() {
        return this.customers;
    }

    // // ## get customer1 /api/customer/getlist1/:companyID/:userID/:customerID    getCustomer
    // router.get("/getlist1/:companyID/:userID/:customerID", checkAuth, checkUUID, cusController.getCustomer);
    async getCustomer1(companyID: string, customerID: string) {
        const userID = this.userService?.getUserID();
        this.http
        .get<{token: string; expiresIn: number; userID: string; customer: Customer;}>
            (BACKEND_URL+'/getlist1/' + companyID+'/'+userID+'/'+customerID)
            .subscribe({
                next: (data) => {
                    // console.log(data);
                    this.userService.genToken(data.token, data.expiresIn);
                    this.setCustomer(data.customer);

                    // getCustomerUpdatedListener()
                    this.customerListsUpdated.next({ customer: data.customer });
                }, error: error => {
                    // console.log(error.error);
                    // this.signupStatusListener.next(false);
                    // this.errorStatusListener.next(error.error.message);
                }});
    }

    // // ## get customer list /api/customer/getlist/:companyID/:userID/:page/:limit   getCustomers
    // router.get("/getlist/:companyID/:userID/:page/:limit", checkAuth, checkUUID, cusController.getCustomers);
    async getCustomers(companyID: string, page: number, limit: number) {
        // console.log(BACKEND_URL+'/getlist/' + companyID+'/'+ this.userService.getUserID()+'/'+page+'/'+limit);
        this.http
            .get<{token: string; expiresIn: number; userID: string; customers: Customer[];}>
            (BACKEND_URL+'/getlist/' + companyID+'/'+this.userService.getUserID()+'/'+page+'/'+limit)
            .subscribe({
                next: (data) => {
                    // console.log(data);
                    this.userService.genToken(data.token, data.expiresIn);
                    this.setCustomers(data.customers);
                    this.customersListsUpdated.next({ customers: data.customers });
                }, error: error => {
                    // console.log(error.error);
                    // this.signupStatusListener.next(false);
                    // this.errorStatusListener.next(error.error.message);
                }});
    }

    // // ## /api/customer/creataenew      postCustomerCreateNew
    // router.post("/createnew", checkAuth, checkUUID, cusController.postCustomerCreateNew);
    postCustomerCreateNew(userID: string, userName: string, customer: Customer) {
        customer.cusInfo.createBy.userID = userID;
        customer.cusInfo.createBy.userName = userName;
        const dataSent = {
            userID,
            userName,
            customer
        };
        this.http
            .post<{ token: string; expiresIn: number; userID: string; customer: Customer }>
                (BACKEND_URL+'/createnew', dataSent)
            .subscribe({
                next: (data) => {
                    // console.log(data);
                    this.userService.genToken(data.token, data.expiresIn);
                    this.setCustomer(data.customer);
                    this.customerListsUpdated.next({ customer: data.customer });
                }, error: error => {
                    // console.log(error.error);
                    // this.signupStatusListener.next(false);
                    // this.errorStatusListener.next(error.error.message);
                }});
    }

    // ## get customer1 for make order
    async getCustomerOrder1(companyID: string, customerID: string) {
        const userID = this.userService?.getUserID();
        this.http
        .get<{token: string; expiresIn: number; userID: string; customer: Customer;}>
            (BACKEND_URL+'/getlist1/' + companyID+'/'+userID+'/'+customerID)
            .subscribe({
                next: (data) => {
                    // console.log(data);
                    this.userService.genToken(data.token, data.expiresIn);
                    this.userService.setOrderCustomerSelect(data.customer);
                    // this.setCustomer(data.customer);
                    // this.customerListsUpdated.next({ customer: data.customer });
                }, error: error => {
                    // console.log(error.error);
                    // this.signupStatusListener.next(false);
                    // this.errorStatusListener.next(error.error.message);
                }});
    }


    // ## customer ########################################################
    // #######################################################################

    // #######################################################################
    // ##   ########################################################



    // ##   ########################################################
    // #######################################################################

    // #######################################################################
    // ##   ########################################################



    // ##   ########################################################
    // #######################################################################

    // #######################################################################
    // ## observer ########################################################


    // private customerListsUpdated = new Subject<{ customer: Customer}>();
    getCustomerUpdatedListener() {
        return this.customerListsUpdated.asObservable();
    }

    // private customersListsUpdated = new Subject<{ customera: Customer[]}>();
    getCustomersUpdatedListener() {
        return this.customersListsUpdated.asObservable();
    }


    // ## observer ########################################################
    // #######################################################################


    // #######################################################################
    // ## clr  ########################################################

    clrCustomer() {
        // console.log('clrCustomer');
        const customer: Customer = {
            customerID: '',
            customerName: '',
            setName: '',
            companyID: '',
            registDate: new Date(),
            imageProfile: '',
            cusInfo: {
                customerDetail: '',
                email: '',
                tel: '',
                web: '',
                pic: '',
                createBy: {
                    userID: '',
                    userName: ''
                }
            }
        };
        return customer;
    }


    // ## clr  ########################################################
    // #######################################################################

}


