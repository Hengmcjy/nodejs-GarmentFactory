import { Component, OnInit, OnDestroy } from '@angular/core';
// import { TranslateService } from '@ngx-translate/core';
import { Location } from '@angular/common';
import { MessageService } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import { Subscription } from 'rxjs';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';

import { PrimeNGConfig, SelectItemGroup } from 'primeng/api';

import { UserService } from 'src/app/services/user.service';
import { ProductService } from 'src/app/services/product.service';
import { SProductNewComponent } from 'src/app/shared/components/user/s-product-new/s-product-new.component';
import { Product } from 'src/app/models/product.model';
import { GBC } from 'src/app/global/const-global';

interface City {
    name: string;
    code: string;
}

interface Country {
    name: string;
    code: string;
}

@Component({
    selector: 'app-product',
    templateUrl: './product.component.html',
    styleUrls: ['./product.component.scss'],
    providers: [DialogService, MessageService],
})
export class ProductComponent implements OnInit, OnDestroy {
    formActive = 'product';
    productImageProfileGCSPath = GBC.productImageProfileGCSPath;  // ## google storage path
    companyID = ''
    product = GBC.clrProduct();
    products: Product[] = [];

    page = 1;
    limit = 0;
    productsCount = 0;

    cities: City[];

    countries: any[];

    // selectedCity: City;

    // selectedCountries: any[];

    groupedCities: SelectItemGroup[] = [];

    private postCreateProductSub: Subscription = new Subscription();
    private postCreateProductsSub: Subscription = new Subscription();

    constructor(
        // public translate: TranslateService,
        public dialogService: DialogService,
        private location: Location,
        private primengConfig: PrimeNGConfig,
        private route: ActivatedRoute,
        private router: Router,
        private userService: UserService,
        private productService: ProductService,
    ) {
        this.cities = [
            { name: 'New York', code: 'NY' },
            { name: 'Rome', code: 'RM' },
            { name: 'London', code: 'LDN' },
            { name: 'Istanbul', code: 'IST' },
            { name: 'Paris', code: 'PRS' },
        ];

        this.countries = [
            { name: 'Australia', code: 'AU' },
            { name: 'Brazil', code: 'BR' },
            { name: 'China', code: 'CN' },
            { name: 'Egypt', code: 'EG' },
            { name: 'France', code: 'FR' },
            { name: 'Germany', code: 'DE' },
            { name: 'India', code: 'IN' },
            { name: 'Japan', code: 'JP' },
            { name: 'Spain', code: 'ES' },
            { name: 'United States', code: 'US' },
        ];

        this.groupedCities = [
            {
                label: 'Germany',
                value: 'de',
                items: [
                    { label: 'Berlin', value: 'Berlin' },
                    { label: 'Frankfurt', value: 'Frankfurt' },
                    { label: 'Hamburg', value: 'Hamburg' },
                    { label: 'Munich', value: 'Munich' },
                ],
            },
            {
                label: 'USA',
                value: 'us',
                items: [
                    { label: 'Chicago', value: 'Chicago' },
                    { label: 'Los Angeles', value: 'Los Angeles' },
                    { label: 'New York', value: 'New York' },
                    { label: 'San Francisco', value: 'San Francisco' },
                ],
            },
            {
                label: 'Japan',
                value: 'jp',
                items: [
                    { label: 'Kyoto', value: 'Kyoto' },
                    { label: 'Osaka', value: 'Osaka' },
                    { label: 'Tokyo', value: 'Tokyo' },
                    { label: 'Yokohama', value: 'Yokohama' },
                ],
            },
        ];
    }

    ngOnInit(): void {
        this.companyID = this.userService.getCompany().companyID;
        this.limit = this.productService.productPageListItem;

        this.primengConfig.ripple = true;
        this.location.replaceState('/'); // ## hide loocation
        this.userService.setFormActive(this.formActive);
        this.companyID = this.userService.getCompany().companyID;
        this.getProducts(this.page, this.limit);


    }

    getProducts(page: number, limit: number) {
        // ## get products list getProducts(companyID: string, page: number, limit: number)
        this.productService.getProducts(this.userService.getCompany().companyID, page , limit);
        if (this.postCreateProductsSub) { this.postCreateProductsSub.unsubscribe(); }
        this.postCreateProductsSub = this.productService.getUserProductsUpdatedListener()
        .subscribe((data) => {
            // console.log(data);
            this.products = data.products;
            this.productsCount = data.productsCount;
        });
    }

    paginate(event: any) {
        // console.log(event.rows, +event.page);
        this.limit = event.rows;
        this.page = +event.page + 1;
        this.getProducts(this.page, this.limit);
        //event.first = Index of the first record
        //event.rows = Number of rows to display in new page
        //event.page = Index of the new page
        //event.pageCount = Total number of pages
    }

    postProductCreateNew(userID: string, product: Product) {
        this.productService.postProductCreateNew(userID, product);
        // ## get data from create new product
        if (this.postCreateProductSub) { this.postCreateProductSub.unsubscribe(); }
        this.postCreateProductSub = this.productService.getUserProductUpdatedListener()
        .subscribe((data) => {
            // console.log(data.product);
            this.product = data.product;
            // ## get all product
            this.productService.getProducts(this.userService.getCompany().companyID, this.page , this.limit);

        });
    }

    showCreateProductModal() {
        const ref = this.dialogService.open(SProductNewComponent, {
            data: {
                companyID: this.companyID,
            },
            header: 'Product creation',
            width: '70%',
        });

        ref.onClose.subscribe((data: Product) => {
            // console.log(data);
            // if (car) {
            //     this.messageService.add({severity:'info', summary: 'Car Selected', detail:'Vin:' + car.vin});
            // }
        });
    }

    genImagePath(imgPath: string) {
        if (imgPath.length > 0) {
            return this.productImageProfileGCSPath+imgPath;
        }

        return GBC.nulltGCSPath;
    }

    goto(path: string, product: Product) {
        this.productService.setProduct(product);  // ## set product selected
        const productID = 'product test id';
        const params: NavigationExtras = {
            queryParams: { productID: productID },
        };
        this.router.navigate([path], params);
    }

    ngOnDestroy(): void {
        if (this.postCreateProductSub) { this.postCreateProductSub.unsubscribe(); }
        if (this.postCreateProductsSub) { this.postCreateProductsSub.unsubscribe(); }
    }
}
