import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { DialogService } from 'primeng/dynamicdialog';
import { MessageService } from 'primeng/api';

import { ProductService } from 'src/app/services/product.service';
import { UserService } from 'src/app/services/user.service';

import { Company, Factory } from 'src/app/models/app.model';
import { Product } from 'src/app/models/product.model';

import { UploadImageComponent } from '../../general/upload-image/upload-image.component';
import { GBC } from 'src/app/global/const-global';
// import { PhotoService } from 'src/app/pages/service/photo.service';

@Component({
    selector: 'app-s-product-image',
    templateUrl: './s-product-image.component.html',
    styleUrls: ['./s-product-image.component.scss'],
    providers: [DialogService, MessageService],
})
export class SProductImageComponent implements OnInit, OnDestroy {
    formName = 'productImagesEdit';

    data: any;
    modeView = false; // ## for view only cannot edit , cannot update

    company: Company = GBC.clrCompany();
    factory: Factory = GBC.clrFactory();
    product: Product = GBC.clrProduct();

    productImageProfileGCSPath = GBC.productImageProfileGCSPath; // ## google storage path image profile

    displayCustom: boolean = false;

    activeIndex: number = 0;
    responsiveOptions:any[] = [
        {
            breakpoint: '1024px',
            numVisible: 5
        },
        {
            breakpoint: '768px',
            numVisible: 3
        },
        {
            breakpoint: '560px',
            numVisible: 1
        }
    ];
    images: any[] = [
        {
            previewImageSrc: 'https://storage.googleapis.com/mystoragegarment/newfactory.png',
            thumbnailImageSrc: 'https://storage.googleapis.com/mystoragegarment/newfactory.png',
            alt: 'alt1'
        },
        {
            previewImageSrc: 'https://storage.googleapis.com/mystoragegarment/createnewproduct.png',
            thumbnailImageSrc: 'https://storage.googleapis.com/mystoragegarment/createnewproduct.png',
            alt: 'alt2'
        },
        {
            previewImageSrc: 'https://storage.googleapis.com/mystoragegarment/createuser.png',
            thumbnailImageSrc: 'https://storage.googleapis.com/mystoragegarment/createuser.png',
            alt: 'alt3'
        },
        {
            previewImageSrc: 'https://storage.googleapis.com/mystoragegarment/createmember.png',
            thumbnailImageSrc: 'https://storage.googleapis.com/mystoragegarment/createmember.png',
            alt: 'alt4'
        },
        {
            previewImageSrc: 'https://storage.googleapis.com/mystoragegarment/memberperson.png',
            thumbnailImageSrc: 'https://storage.googleapis.com/mystoragegarment/memberperson.png',
            alt: 'alt3'
        },
        {
            previewImageSrc: 'https://storage.googleapis.com/mystoragegarment/newnode.png',
            thumbnailImageSrc: 'https://storage.googleapis.com/mystoragegarment/newnode.png',
            alt: 'alt3'
        },
        {
            previewImageSrc: 'https://storage.googleapis.com/mystoragegarment/ordernow.png',
            thumbnailImageSrc: 'https://storage.googleapis.com/mystoragegarment/ordernow.png',
            alt: 'alt4'
        },
        {
            previewImageSrc: 'https://storage.googleapis.com/mystoragegarment/subnode.jpg',
            thumbnailImageSrc: 'https://storage.googleapis.com/mystoragegarment/subnode.jpg',
            alt: 'alt3'
        },

    ];


    private dataAroundAppSub: Subscription = new Subscription;

    constructor(
        public dialogService: DialogService,
        public messageService: MessageService,
        private productService: ProductService,
        private userService: UserService,
        // private photoService: PhotoService
    ) {}

    ngOnInit(): void {

        this.modeView = this.productService.productModeView;
        this.company = this.userService.getCompany();
        this.factory = this.userService.getFactory();
        this.product = this.productService.getProduct();
        // console.log(this.product);

        // ## get DataAroundApp
        // ## user auth  isAuthenticated / dataAroundApp
        this.dataAroundAppSub = this.userService.getDataAroundAppStatusListener().subscribe(dataAroundApp => {
            // ## declare initial variable from service user
            // this.isAuthenticated = dataAroundApp.isAuthenticated;
            this.company = dataAroundApp.company;
            this.factory = dataAroundApp.factory;
            this.product = dataAroundApp.product;
            // console.log('product : ', this.product);
            // console.log('screenSizeInfo : ' , this.screenSize);
            // console.log('isAuthenticated : ' , this.isAuthenticated);
            // if (this.isAuthenticated) { // ## user logged in already

            // } else {  // ## user no login

            // }
        });
    }

    imageClick(index: number) {
        this.activeIndex = index;
        this.displayCustom = true;
    }

    showFileUploadModal(multiple: boolean) {
        const ref = this.dialogService.open(UploadImageComponent, {
            data: {
                id: 'fileUpload',
                companyID: this.userService.getCompany()?.companyID,
                multiple: multiple, // ## allow upload multiple file
                callfrom: this.formName,  // ## send to nodejs for choose buckets
                productID: this.product.productID,
                subfolder: 'images/',  // ## in google storage store in subfolder
            },
            header: 'image upload',
            width: '60%',
        });

        ref.onClose.subscribe((data: any) => {
            // console.log(data);
            // if (car) {
            //     this.messageService.add({severity:'info', summary: 'Car Selected', detail:'Vin:' + car.vin});
            // }
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
        // if (this.sockio) { this.sockio.unsubscribe(); }
        // if (this.errSub) { this.errSub.unsubscribe(); }
        // if (this.langSub) { this.langSub.unsubscribe(); }
        // if (this.screenSub) { this.screenSub.unsubscribe(); }
    }
}
