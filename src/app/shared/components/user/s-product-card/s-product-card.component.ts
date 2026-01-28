import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { Subscription } from 'rxjs';
import { GBC } from 'src/app/global/const-global';

import { Product } from 'src/app/models/product.model';
import { ProductService } from 'src/app/services/product.service';
import { UserService } from 'src/app/services/user.service';

@Component({
    selector: 'app-s-product-card',
    templateUrl: './s-product-card.component.html',
    styleUrls: ['./s-product-card.component.scss'],
})
export class SProductCardComponent implements OnInit, OnDestroy {
    @Input() product: Product = GBC.clrProduct();
    productImageProfileGCSPath = GBC.productImageProfileGCSPath;  // ## google storage path

    private productSelectSub: Subscription = new Subscription();

    constructor(
        private userService: UserService,
        private productService: ProductService,
    ) {}

    ngOnInit(): void {
        this.product = this.productService.getProduct();
        this.getProductSelect();
    }

    getProductSelect() {
        if (this.productSelectSub) { this.productSelectSub.unsubscribe(); }
        this.productSelectSub = this.userService.getOrderProductSelectUpdatedListener().subscribe((data) => {
            this.product = data.product;
        });
    }

    genImagePath(imgPath: string) {
        if (imgPath.length > 0) {
            return this.productImageProfileGCSPath+imgPath;
        }

        return this.userService.emptyProductImageProfile();
    }

    ngOnDestroy(): void {
        if (this.productSelectSub) { this.productSelectSub.unsubscribe(); }
        // if (this.errSub) { this.errSub.unsubscribe(); }
        // if (this.sockio) { this.sockio.unsubscribe(); }
        // if (this.dataAroundAppSub) { this.dataAroundAppSub.unsubscribe(); }
        // if (this.screenSub) { this.screenSub.unsubscribe(); }
    }
}
