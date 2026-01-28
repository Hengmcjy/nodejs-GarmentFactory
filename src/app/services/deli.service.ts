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
import { Product, ProductImageProfiles } from '../models/product.model';
import { GBC } from '../global/const-global';
import { DCarton, DCountry, DPacking } from '../models/carton.model';
// import { MenuService } from './menu.service';
// import { debounceTime } from 'rxjs/operators';

const BACKEND_URL = environment.apiUrl + '/deli';
const BACKEND_AESP = environment.aesP;

// ## user, language , getIP-real

@Injectable({
  providedIn: 'root'
})
export class DeliService {

    productModeView = false;  // ## for view only cannot edit , cannot update

    // private cartons: Product = this.clrCartons();
    private dCartons: DCarton[] = [];
    private dCountries: DCountry[] = [];

    productPageListItem = 10;

    // // ## google storage path
    // public productGCSPath = 'https://storage.googleapis.com/garmentproductgarmentworld1sthighquality/';
    // public productImageProfileGCSPath = 'https://storage.googleapis.com/garmentproductgarmentworld1sthighquality/imageProfile/';

    private dCartonsUpdated = new Subject<{ dCartons: DCarton[]}>();
    private dCountriesUpdated = new Subject<{ dCountries: DCountry[]}>();
    private dPackingsUpdated = new Subject<{ dPackings: DPacking[]}>();
    private dPackingCreateUpdated = new Subject<{ success: boolean}>();




    // // getDCartonsUpdatedListener()
    // this.dCartonsUpdated.next({ product: data.dCartons });



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
        // this.product = this.clrProduct();
        this.dCartons = [];
        this.dCountries = [];
    }

    getClassDPacking(dStatus: string): string {
        // ## hide, open , close,  delete
        if (dStatus === 'hide') {
            return '';
        } else if (dStatus === 'open') {
            return 'text-orange-600 text-sm font-semibold';
        } else if (dStatus === 'close') {
            return 'text-teal-500 text-sm font-semibold';
        } else if (dStatus === 'delete') {
            return 'text-red-500 text-sm font-semibold';
        } else {
            return '';
        }
        return '';
    }

    // getProductIDs(products: Product[]) {
    //     let productIDs: string[] = [];
    //     for (const product of products) {
    //         productIDs.push(product.productID);
    //     }
    //     return productIDs;
    // }

    // async get1ProductInfo(productID: string, companyID: string) {
    //     let product: Product = GBC.clrProduct();
    //     const productOR = await this.products.filter(i=>(i.productID === productID && i.companyID === companyID));
    //     if (productID === this.product.productID) {
    //         return this.product;
    //     // } else if (userID === this.user1Company.userID) {
    //     //     return this.user1Company;
    //     } else if (productOR.length > 0) {
    //         return productOR[0];
    //     } else {
    //         return product;
    //     }
    // }



    // ## general info ########################################################
    // #######################################################################

    // #######################################################################
    // ## DPacking ########################################################

    setDCartons(dCartons: DCarton[]) {
        this.dCartons = dCartons;
        // this.userService.setProduct(this.product);
    }

    setCountries(dCountries: DCountry[]) {
        this.dCountries = dCountries;
        // this.userService.setProducts(this.products);
    }

    // getProduct() {
    //     return this.product;
    // }


    // getProductsArr() {
    //     return this.products;
    // }

    // router.get("/deli1/cartons/:companyID", checkAuth, checkUUID, deliController.getDCartons);
    async getDCartons() {
        // console.log(companyID, productID);
        // productID = this.userService.setAddStrLen(productID, 12, ' ');
        const companyID = this.userService?.getCompany().companyID;
        this.http
        .get<{token: string; expiresIn: number; userID: string; dCartons: DCarton[];}>
            (BACKEND_URL+'/deli1/dcartons/' + companyID)
            .subscribe({
                next: (data) => {
                    // console.log(data);
                    this.userService.genToken(data.token, data.expiresIn);
                    this.setDCartons(data.dCartons);

                    // getDCartonsUpdatedListener()
                    this.dCartonsUpdated.next({ dCartons: data.dCartons });
                }, error: error => {
                    // console.log(error.error);
                    // this.signupStatusListener.next(false);
                    // this.errorStatusListener.next(error.error.message);
                }});
    }

    // router.get("/deli2/countries/:companyID", checkAuth, checkUUID, deliController.getDCountries);
    async getDCountries() {
        // console.log(companyID, productID);
        // productID = this.userService.setAddStrLen(productID, 12, ' ');
        // const userID = this.userService?.getUserID();
        const companyID = this.userService?.getCompany().companyID;
        this.http
        .get<{token: string; expiresIn: number; userID: string; dCountries: DCountry[];}>
            (BACKEND_URL+'/deli2/dcountries/' + companyID)
            .subscribe({
                next: (data) => {
                    // console.log(data);
                    this.userService.genToken(data.token, data.expiresIn);
                    this.setCountries(data.dCountries);


                    // getDCountriesUpdatedListener()
                    this.dCountriesUpdated.next({ dCountries: data.dCountries });
                }, error: error => {
                    // console.log(error.error);
                    // this.signupStatusListener.next(false);
                    // this.errorStatusListener.next(error.error.message);
                }});
    }


    // router.post("/deli7/dPacking/createnew", checkAuth, checkUUID, deliController.postDPackingCreateNew);
    postDPackingCreateNew(dPacking: DPacking) {
        const userID = this.userService?.getUserID();
        const dataSent = {
            userID,
            dPacking
        };
        this.http
            .post<{ token: string; expiresIn: number; userID: string; success: boolean }>
                (BACKEND_URL+'/deli7/dPacking/createnew', dataSent)
            .subscribe({
                next: (data) => {
                    // console.log(data);
                    this.userService.genToken(data.token, data.expiresIn);
                    // this.setProduct(data.product);

                    // getDPackingCreateListener()
                    this.dPackingCreateUpdated.next({ success: true });
                }, error: error => {
                    // console.log(error.error);
                    // this.signupStatusListener.next(false);
                    // this.errorStatusListener.next(error.error.message);
                }});
    }

    // router.get("/deli8/dPacking/get/:companyID/:seasonYear", checkAuth, checkUUID, deliController.getDPackings);
    async getDPackings(seasonYear: string, dStatus: string[]) {
        // console.log(companyID, productID);
        // productID = this.userService.setAddStrLen(productID, 12, ' ');
        // const companyID = this.userService?.getCompany().companyID;
        const dStatuss = JSON.stringify(dStatus);
        const companyID = this.userService?.getCompany().companyID;
        this.http
        .get<{token: string; expiresIn: number; userID: string; dPackings: DPacking[];}>
            (BACKEND_URL+'/deli8/dPacking/get/' + companyID+'/'+ seasonYear+'/'+ dStatuss)
            .subscribe({
                next: (data) => {
                    // console.log(data);
                    this.userService.genToken(data.token, data.expiresIn);
                    // this.setCountries(data.dPackings);


                    // getDPackingsListener()
                    this.dPackingsUpdated.next({ dPackings: data.dPackings });
                }, error: error => {
                    // console.log(error.error);
                    // this.signupStatusListener.next(false);
                    // this.errorStatusListener.next(error.error.message);
                }});
    }



    // ## DPacking ########################################################
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

    // // getDPackingsListener()
    // this.dPackingsUpdated.next({ dPackings: data.dPackings });
    getDPackingsListener() {
        return this.dPackingsUpdated.asObservable();
    }

    // // getDPackingCreateListener()
    // this.dPackingCreateUpdated.next({ success: true });
    getDPackingCreateListener() {
        return this.dPackingCreateUpdated.asObservable();
    }

    // // getDCartonsUpdatedListener()
    // this.dCartonsUpdated.next({ product: data.dCartons });
    getDCartonsUpdatedListener() {
        return this.dCartonsUpdated.asObservable();
    }

    // // getUserProductUpdatedListener()
    // this.dCountriesUpdated.next({ dCountries: data.dCountries });
    getDCountriesUpdatedListener() {
        return this.dCountriesUpdated.asObservable();
    }


    // ## observer ########################################################
    // #######################################################################


    // #######################################################################
    // ## clr  ########################################################

    // clrProduct() {
    //     const product: Product = {
    //         productID: '',
    //         productName: '',
    //         productDetail: '',
    //         productGroupCode: '',
    //         productCustomerCode: '',
    //         productFeature: [],
    //         seasonYear: '',
    //         companyID: '',
    //         imageProfile: '',
    //         pdPic: [],
    //         // productsize: [],
    //         // productcolorSet: [],

    //     };
    //     return product;
    // }


    // ## clr  ########################################################
    // #######################################################################


}


