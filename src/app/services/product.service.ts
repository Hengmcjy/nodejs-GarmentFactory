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
// import { MenuService } from './menu.service';
// import { debounceTime } from 'rxjs/operators';

const BACKEND_URL = environment.apiUrl + '/product';
const BACKEND_AESP = environment.aesP;

// ## user, language , getIP-real

@Injectable({
  providedIn: 'root'
})
export class ProductService {

    productModeView = false;  // ## for view only cannot edit , cannot update

    private product: Product = this.clrProduct();
    private products: Product[] = [];

    productPageListItem = 10;

    // // ## google storage path
    // public productGCSPath = 'https://storage.googleapis.com/garmentproductgarmentworld1sthighquality/';
    // public productImageProfileGCSPath = 'https://storage.googleapis.com/garmentproductgarmentworld1sthighquality/imageProfile/';

    private userProductListsUpdated = new Subject<{ product: Product}>();
    private userProductsListsUpdated = new Subject<{ products: Product[], productsCount: number}>();
    private productImageProfilesListsUpdated = new Subject<{ productImageProfiles: ProductImageProfiles[]}>();



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
        this.product = this.clrProduct();
        this.products = [];
    }

    getProductIDs(products: Product[]) {
        let productIDs: string[] = [];
        for (const product of products) {
            productIDs.push(product.productID);
        }
        return productIDs;
    }

    async get1ProductInfo(productID: string, companyID: string) {
        let product: Product = GBC.clrProduct();
        const productOR = await this.products.filter(i=>(i.productID === productID && i.companyID === companyID));
        if (productID === this.product.productID) {
            return this.product;
        // } else if (userID === this.user1Company.userID) {
        //     return this.user1Company;
        } else if (productOR.length > 0) {
            return productOR[0];
        } else {
            return product;
        }
    }



    // ## general info ########################################################
    // #######################################################################

    // #######################################################################
    // ## product ########################################################

    setProduct(product: Product) {
        this.product = product;
        this.userService.setProduct(this.product);
    }

    setProducts(products: Product[]) {
        this.products = products;
        this.userService.setProducts(this.products);
    }

    getProduct() {
        return this.product;
    }


    getProductsArr() {
        return this.products;
    }

    // // ## get product list /api/product/getlist1/:companyID/:userID/:productID
    // router.get("/getlist1/:companyID/:userID/:productID", checkAuth, checkUUID, productController.getProduct);
    async getProduct1(companyID: string, productID: string) {
        // console.log(companyID, productID);
        productID = this.userService.setAddStrLen(productID, 12, ' ');
        const userID = this.userService?.getUserID();
        this.http
        .get<{token: string; expiresIn: number; userID: string; product: Product;}>
            (BACKEND_URL+'/getlist1/' + companyID+'/'+userID+'/'+productID)
            .subscribe({
                next: (data) => {
                    // console.log(data);
                    this.userService.genToken(data.token, data.expiresIn);
                    this.setProduct(data.product);

                    // getUserProductUpdatedListener()
                    this.userProductListsUpdated.next({ product: data.product });
                }, error: error => {
                    // console.log(error.error);
                    // this.signupStatusListener.next(false);
                    // this.errorStatusListener.next(error.error.message);
                }});
    }


    // async getUserCompany(userID: string, page: number, limit: number) {
    //     this.http
    //         .get<{token: string; expiresIn: number; userID: string; company: Company[]; }>
    //         (BACKEND_URL+'/get/company/' + this.userID+'/'+page+'/'+limit)

    // ## get product list /api/product/getlist/:companyID/:userID/:page/:limit
    // // router.get("/getlist/:companyID/:userID/:page/:limit", productController.getProducts);
    async getProducts(companyID: string, page: number, limit: number) {
        // console.log(BACKEND_URL+'/getlist/' + companyID+'/'+ this.userService.getUserID()+'/'+page+'/'+limit);
        this.http
            .get<{token: string; expiresIn: number; userID: string; products: Product[]; productsCount: number}>
            (BACKEND_URL+'/getlist/' + companyID+'/'+this.userService.getUserID()+'/'+page+'/'+limit)
            .subscribe({
                next: (data) => {
                    // console.log(data);
                    this.userService.genToken(data.token, data.expiresIn);
                    this.setProducts(data.products);
                    this.userProductsListsUpdated.next({ products: data.products, productsCount: data.productsCount});
                }, error: error => {
                    // console.log(error.error);
                    // this.signupStatusListener.next(false);
                    // this.errorStatusListener.next(error.error.message);
                }});
    }

    // ## /api/product/creataenew
    // ## router.post("/createnew", userController.postProductCreateNew);
    postProductCreateNew(userID: string, product: Product) {
        const dataSent = {
            userID,
            product
        };
        this.http
            .post<{ token: string; expiresIn: number; userID: string; product: Product }>
                (BACKEND_URL+'/createnew', dataSent)
            .subscribe({
                next: (data) => {
                    // console.log(data);
                    this.userService.genToken(data.token, data.expiresIn);
                    this.setProduct(data.product);
                    // getUserProductUpdatedListener()
                    this.userProductListsUpdated.next({ product: data.product });
                }, error: error => {
                    // console.log(error.error);
                    // this.signupStatusListener.next(false);
                    // this.errorStatusListener.next(error.error.message);
                }});
    }

    // ## get product1 for make order
    async getProductOrder1(companyID: string, productID: string) {
        const userID = this.userService?.getUserID();
        this.http
        .get<{token: string; expiresIn: number; userID: string; product: Product;}>
            (BACKEND_URL+'/getlist1/' + companyID+'/'+userID+'/'+productID)
            .subscribe({
                next: (data) => {
                    // console.log(data);
                    this.userService.genToken(data.token, data.expiresIn);
                    this.userService.setOrderProductSelect(data.product);
                    // this.setProduct(data.product);
                    // this.userProductListsUpdated.next({ product: data.product });
                }, error: error => {
                    // console.log(error.error);
                    // this.signupStatusListener.next(false);
                    // this.errorStatusListener.next(error.error.message);
                }});
    }


    // // ## /api/product/get/image/profiles  postGetProductImageProfiles
    // router.post("/get/image/profiles", checkAuth, checkUUID, productController.postGetProductImageProfiles);
    postGetProductImageProfiles(companyID: string, productIDs: string[]) {
        // productID = this.userService.setAddStrLen(productID, 12, ' ');
        productIDs.forEach( (item, index) => {
            // this.userClassIDArr.push(item.userClassID);
            item = this.userService.setAddBackStrLen(item, 12, ' ');
        });
        // console.log(productIDs);
        const dataSent = {
            companyID,
            userID: this.userService.getUserID(),
            productIDs
        };
        this.http
            .post<{ token: string; expiresIn: number; userID: string; productImageProfiles: ProductImageProfiles[] }>
                (BACKEND_URL+'/get/image/profiles', dataSent)
            .subscribe({
                next: (data) => {
                    // console.log(data);
                    this.userService.setProductImageProfiles(data.productImageProfiles);
                    this.userService.genToken(data.token, data.expiresIn);
                    // this.setProduct(data.product);
                    this.productImageProfilesListsUpdated.next({ productImageProfiles: data.productImageProfiles });
                }, error: error => {
                    // console.log(error.error);
                    // this.signupStatusListener.next(false);
                    // this.errorStatusListener.next(error.error.message);
                }});

    }

    // // ## /api/product/edit
    // router.put("/edit", checkAuth, checkUUID, productController.putEditProduct);
    putEditProduct(product: Product) {
        // console.log(product);
        const dataSent = {
            product: product
        };
        this.http
            .put<{ token: string; expiresIn: number; userID: string; product: Product }>
                (BACKEND_URL+'/edit', dataSent)
            .subscribe({
                next: (data) => {
                    // console.log(data);
                    this.userService.genToken(data.token, data.expiresIn);
                    this.setProduct(data.product);
                    // getUserProductUpdatedListener()
                    this.userProductListsUpdated.next({ product: data.product });
                }, error: error => {
                    // console.log(error.error);
                    // this.signupStatusListener.next(false);
                    // this.errorStatusListener.next(error.error.message);
                }});

    }

    // ## product ########################################################
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

    // private productImageProfilesListsUpdated = new Subject<{ productImageProfiles: ProductImageProfiles[]}>();
    getProductImageProfilesUpdatedListener() {
        return this.productImageProfilesListsUpdated.asObservable();
    }

    // private userProductListsUpdated = new Subject<{ product: Product}>();
    getUserProductUpdatedListener() {
        return this.userProductListsUpdated.asObservable();
    }

    // private userProductsListsUpdated = new Subject<{ products: Product[]}>();
    getUserProductsUpdatedListener() {
        return this.userProductsListsUpdated.asObservable();
    }

    // ## observer ########################################################
    // #######################################################################


    // #######################################################################
    // ## clr  ########################################################

    clrProduct() {
        const product: Product = {
            productID: '',
            productName: '',
            productDetail: '',
            productGroupCode: '',
            productCustomerCode: '',
            productFeature: [],
            seasonYear: '',
            companyID: '',
            imageProfile: '',
            pdPic: [],
            // productsize: [],
            // productcolorSet: [],

        };
        return product;
    }


    // ## clr  ########################################################
    // #######################################################################


}


