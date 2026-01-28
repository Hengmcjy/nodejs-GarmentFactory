import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { DialogService } from 'primeng/dynamicdialog';
import { MessageService } from 'primeng/api';
import { Subscription } from 'rxjs';


import { ProductService } from 'src/app/services/product.service';
import { UserService } from 'src/app/services/user.service';
import { Product, ProductFeature } from 'src/app/models/product.model';

import { UploadImageComponent } from 'src/app/shared/components/general/upload-image/upload-image.component';
import { SSelectYearComponent } from 'src/app/shared/components/general/s-select-year/s-select-year.component';
import { GBC } from 'src/app/global/const-global';

@Component({
    selector: 'app-product-edit',
    templateUrl: './product-edit.component.html',
    styleUrls: ['./product-edit.component.scss'],
    providers: [DialogService, MessageService],
})
export class ProductEditComponent implements OnInit, OnDestroy {
    @Input() product: Product = GBC.clrProduct();
    // @Input() isView: boolean = false;

    isdragdrop = true;
    // data: any;

    formActive = 'productEdit';
    formName = 'productEditImageProfile';
    data: any;
    modeView = false; // ## for view only cannot edit , cannot update
    // productGCSPath = this.productService.productGCSPath;  // ## google storage path
    productImageProfileGCSPath = GBC.productImageProfileGCSPath; // ## google storage path image profile
    productFeature: ProductFeature[] = [];
    emptyProductFeature: ProductFeature = {featureName: '', featureDetail:''};

    isAuthenticated = false;  // ## logged in ?

    mode = 'productInfo'; // ##
    productID = '';
    seasonYear = '2023'


    private dataAroundAppSub: Subscription = new Subscription;
    private editProductSub: Subscription = new Subscription;

    constructor(
        public dialogService: DialogService,
        public messageService: MessageService,
        // public config: DynamicDialogConfig,
        // public ref: DynamicDialogRef,

        private route: ActivatedRoute,
        private location: Location,
        private productService: ProductService,
        public userService: UserService
    ) {}

    ngOnInit(): void {
        this.location.replaceState('/'); // ## hide loocation

        this.modeView = this.productService.productModeView; // ## for view only cannot edit , cannot update

        // this.data = this.config.data;
        // this.userService.setFormActive(this.formActive);
        // this.product = this.userService?.clrProduct();
        this.productID = this.route.snapshot.queryParamMap.get('productID') + '';
        this.seasonYear = this.product.seasonYear;
        // console.log(this.productID);
        // if (this.config.data ) {console.log(this.productID);}
        if (this.productID && this.productID !== '' && this.productID !== null) {
            // console.log(this.productID);
            this.product = this.productService?.getProduct();
            this.productFeature = [...this.product.productFeature];
            this.seasonYear = this.product.seasonYear;
        }
        // else {
        //     this.data = this.config.data;
        //     console.log(this.data);
        //     this.isView = this.data.isView;
        //     this.modeView = this.data.modeView;
        //     this.product = this.data.product;
        //     this.productFeature = [...this.product.productFeature];
        // }


        // console.log(this.productID);
        // console.log(this.product);

        // ## get DataAroundApp
        // ## user auth  isAuthenticated / dataAroundApp
        this.isAuthenticated = this.userService.getIsAuth();
        this.dataAroundAppSub = this.userService.getDataAroundAppStatusListener().subscribe(dataAroundApp => {
            // ## declare initial variable from service user
            this.isAuthenticated = dataAroundApp.isAuthenticated;
            this.product = dataAroundApp.product;
            this.seasonYear = this.product.seasonYear;
            // console.log('product : ', this.product);
            // console.log('screenSizeInfo : ' , this.screenSize);
            // console.log('isAuthenticated : ' , this.isAuthenticated);
            if (this.isAuthenticated) { // ## user logged in already

            } else {  // ## user no login

            }
        });

        this.getUserProductUpdatedListener();
        // console.log(this.product);
    }

    onOrderActivity() {
        // console.log(this.productFeature);
    }

    putEditProduct() {
        // putEditProduct(product: Product)
        this.product.productFeature = [...this.productFeature];
        this.productService.putEditProduct(this.product);

    }

    getUserProductUpdatedListener() {
        if (this.editProductSub) { this.editProductSub.unsubscribe(); }
        this.editProductSub = this.productService.getUserProductUpdatedListener()
        .subscribe((data) => {
            // console.log(data);
            this.product = data.product;
            // this.closeDialog(this.product);

            this.messageService.add({
                severity:'success',
                summary:'edit product',
                detail:'completed'
            });
        });
    }

    addProductFeature() {
        this.productFeature.unshift({...this.emptyProductFeature});
    }

    deleteProductFeature(idx: number) {
        this.productFeature.splice(idx,1);
    }

    changeMode(mode: string) {
        this.mode = mode;
    }

    showFileUploadModal(multiple: boolean) {
        // console.log(this.product);
        const ref = this.dialogService.open(UploadImageComponent, {
            data: {
                id: 'fileUpload',
                companyID: this.userService.getCompany()?.companyID,
                multiple: multiple, // ## allow upload multiple file
                callfrom: this.formName,  // ## send to nodejs for choose buckets
                productID: this.product.productID,
                subfolder: 'imageProfile/',  // ## in google storage store in subfolder
            },
            header: 'image upload',
            width: '50%',
        });

        ref.onClose.subscribe((data: any) => {
            // console.log(data);
            // if (car) {
            //     this.messageService.add({severity:'info', summary: 'Car Selected', detail:'Vin:' + car.vin});
            // }
        });
    }

    showYearSelectionModal() {
        const ref = this.dialogService.open(SSelectYearComponent, {
            data: {
                id: 'seasonYearSelection',
                company: this.userService?.getCompany(),
                callfrom: this.formName,  // ## send to nodejs for choose buckets
                btnCaption: 'choose'

            },
            header: 'Season Year Selection',
            width: '50%',
        });

        ref.onClose.subscribe((data: any) => {
            if (data.id === 'seasonYearSelection') {
                // console.log(data);
                this.seasonYear = data.seasonYear;
                this.product.seasonYear = this.seasonYear;
                // editProductORInfo(field: string, value: string, targetPlace: TargetPlace)
                // this.editProductORInfo('year',this.year,this.targetPlaceTmp);
            }
        });
    }

    genImagePath(imgPath: string) {
        if (imgPath) {
            if (imgPath.length > 0) {
                return this.productImageProfileGCSPath + imgPath;
            }
        }
        return GBC.nulltGCSPath;
    }

    ngOnDestroy(): void {
        if (this.dataAroundAppSub) { this.dataAroundAppSub.unsubscribe(); }
        if (this.editProductSub) { this.editProductSub.unsubscribe(); }
        // if (this.errSub) { this.errSub.unsubscribe(); }
        // if (this.langSub) { this.langSub.unsubscribe(); }
        // if (this.screenSub) { this.screenSub.unsubscribe(); }
    }
}
