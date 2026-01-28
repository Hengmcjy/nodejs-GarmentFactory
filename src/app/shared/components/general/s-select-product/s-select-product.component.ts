import { Component, OnDestroy, OnInit } from '@angular/core';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Subscription } from 'rxjs';
import { GBC } from 'src/app/global/const-global';

import { Product } from 'src/app/models/product.model';
import { ProductService } from 'src/app/services/product.service';
import { UserService } from 'src/app/services/user.service';

@Component({
    selector: 'app-s-select-product',
    templateUrl: './s-select-product.component.html',
    styleUrls: ['./s-select-product.component.scss'],
})
export class SSelectProductComponent implements OnInit, OnDestroy {

    data: any;
    rows = 0; // ## 1 page / 10 items
    totalProducts = 10;  // ## 10 for example

    page = 1;
    limit = 0;
    productsCount = 0;

    products: Product[] = [];
    productImageProfileGCSPath = GBC.productImageProfileGCSPath;  // ## google storage path
    productPageListItem = 0;

    private productsSub: Subscription = new Subscription();
    private postCreateProductsSub: Subscription = new Subscription();

    constructor(
        public config: DynamicDialogConfig,
        public ref: DynamicDialogRef,
        private userService: UserService,
        private productService: ProductService,
    ) {}

    ngOnInit(): void {
        this.data = this.config.data;
        this.products = this.productService.getProductsArr();
        this.productPageListItem = this.productService.productPageListItem;
        this.rows = this.productService.productPageListItem; // ## 1 page / 10 items
        this.limit = this.productService.productPageListItem;
        // console.log(this.data);

        // // ## get products list getProducts(companyID: string, page: number, limit: number)
        // this.productService.getProducts(this.userService.getCompany().companyID, 1 , this.productPageListItem);
        // if (this.productsSub) { this.productsSub.unsubscribe(); }
        // this.productsSub = this.productService.getUserProductsUpdatedListener()
        // .subscribe((data) => {
        //     // console.log(data);
        //     this.products = data.products;

        // });
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

    genImagePath(imgPath: string) {
        if (imgPath.length > 0) {
            return this.productImageProfileGCSPath+imgPath;
        }

        return GBC.nulltGCSPath;
    }

    selectProduct(product: Product) {
        this.closeDialog(product);
    }

    closeDialog(product: Product) {
        this.ref.close(product);
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

    ngOnDestroy(): void {
        if (this.productsSub) { this.productsSub.unsubscribe(); }
        if (this.postCreateProductsSub) { this.postCreateProductsSub.unsubscribe(); }
        // if (this.posteditCustomerSub) { this.posteditCustomerSub.unsubscribe(); }
        // if (this.errSub) { this.errSub.unsubscribe(); }
        // if (this.langSub) { this.langSub.unsubscribe(); }
        // if (this.screenSub) { this.screenSub.unsubscribe(); }
    }
}
