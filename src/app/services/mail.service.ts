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
import { StringDecoder } from 'string_decoder';
// import { MenuService } from './menu.service';
// import { debounceTime } from 'rxjs/operators';

const BACKEND_URL = environment.apiUrl + '/mail';
// const BACKEND_AESP = environment.aesP;

// ## user, language , getIP-real

@Injectable({
  providedIn: 'root'
})
export class MailService {


    private mailSignupVerifyListsUpdated = new Subject<{ success: boolean; message: any;}>();
    // private customersListsUpdated = new Subject<{ customers: Customer[]}>();

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



    // ## general info ########################################################
    // #######################################################################

    // #######################################################################
    // ## mail ########################################################

    // // /api/mail/signup/sendmail
    // // ## send mail when user signup
    // router.post("/signup/sendmail", mailController.postSignupSendMail);
    postSignupSendMail(email: string, userPass: string) {
        // userSignup(userID: string, userPass: string)
        const dataSent = {
            email,
            // product
        };
        this.http
            .post<{ success: boolean; message: any; }>
                (BACKEND_URL+'/signup/sendmail', dataSent)
            .subscribe({
                next: (data) => {
                    // console.log(data);
                    // this.userService.genToken(data.token, data.expiresIn);
                    // this.setProduct(data.product);
                    // this.userProductListsUpdated.next({ product: data.product });
                }, error: error => {
                    // console.log(error.error);
                    // this.signupStatusListener.next(false);
                    // this.errorStatusListener.next(error.error.message);
                }});
    }

    // // ## verify email user for sign up
    // router.post("/signup/verifyemail", mailController.postSignupVerifyMail);
    postSignupVerifyMail(uuid: string) {
        const dataSent = {
            uuid,
            // product
        };
        this.http
            .post<{ success: boolean; message: any; }>
                (BACKEND_URL+'/signup/verifyemail', dataSent)
            .subscribe({
                next: (data) => {
                    // console.log(data);
                    this.mailSignupVerifyListsUpdated.next({ success: data.success,  message: data.message});
                }, error: error => {
                    // console.log(error.error);
                    // getMailSignupVerifyUpdatedListener()    mailSignupVerifyListsUpdated
                    this.mailSignupVerifyListsUpdated.next({ success: error.error.success,  message: error.error.message});
                    // this.signupStatusListener.next(false);
                    // this.errorStatusListener.next(error.error.message);
                }});

    }

    // ## mail ########################################################
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


    // private mailSignupVerifyListsUpdated = new Subject<{ success: boolean; message: any;}>();
    getMailSignupVerifyUpdatedListener() {
        return this.mailSignupVerifyListsUpdated.asObservable();
    }

    // // private customersListsUpdated = new Subject<{ customera: Customer[]}>();
    // getCustomersUpdatedListener() {
    //     return this.customersListsUpdated.asObservable();
    // }


    // ## observer ########################################################
    // #######################################################################




}


