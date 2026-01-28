import { Component, OnInit, OnDestroy } from '@angular/core';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Subscription } from 'rxjs';
import { GBC } from 'src/app/global/const-global';

import { Product } from 'src/app/models/product.model';
import { ProductService } from 'src/app/services/product.service';
import { UserService } from 'src/app/services/user.service';

@Component({
    selector: 'app-s-product-new',
    templateUrl: './s-product-new.component.html',
    styleUrls: ['./s-product-new.component.scss'],
})
export class SProductNewComponent implements OnInit, OnDestroy {
    productID = '';
    productDetail = '';

    product: Product = GBC.clrProduct();
    userID = '';

    private postCreateProductSub: Subscription = new Subscription();

    constructor(
        public config: DynamicDialogConfig,
        public ref: DynamicDialogRef,
        private productService: ProductService,
        public userService: UserService
    ) {}

    async ngOnInit() {
        this.product = GBC.clrProduct();
        this.userID = this.userService?.getUserID();
    }

    postProductCreateNew() {
        // setAddBackStrLen(str: string, len: number, strAdd: string)
        // this.userService.setAddBackStrLen(this.productID,this.userService.styleLen, ' ');
        this.product.productID = this.userService.setAddBackStrLen(this.productID, this.userService.styleLen, ' ');
        this.product.productDetail = this.productDetail;
        this.product.companyID = this.userService.getCompany()?.companyID;
        this.productService.postProductCreateNew(this.userID, this.product);
        if (this.postCreateProductSub) { this.postCreateProductSub.unsubscribe(); }
        this.postCreateProductSub = this.productService.getUserProductUpdatedListener()
        .subscribe((data) => {
            // console.log(data);
            this.product = data.product;
            this.closeDialog(this.product);
        });
    }

    closeDialog(product: Product) {
        this.ref.close(product);
    }

    ngOnDestroy(): void {
        if (this.postCreateProductSub) { this.postCreateProductSub.unsubscribe(); }
    }
}
