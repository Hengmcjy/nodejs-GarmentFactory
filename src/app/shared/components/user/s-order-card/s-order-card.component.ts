import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { GBC } from 'src/app/global/const-global';
import { Order } from 'src/app/models/order.model';
import { ProductImageProfiles } from 'src/app/models/product.model';
import { ProductService } from 'src/app/services/product.service';
import { UserService } from 'src/app/services/user.service';

@Component({
    selector: 'app-s-order-card',
    templateUrl: './s-order-card.component.html',
    styleUrls: ['./s-order-card.component.scss'],
})
export class SOrderCardComponent implements OnInit, OnDestroy {
    @Input() order: Order = GBC.clrOrder();

    orders: Order[] = [];
    productImageProfiles: ProductImageProfiles[] = [];

    productImageProfileGCSPath = GBC.productImageProfileGCSPath;  // ## google storage path

    private productImageProfilesSub: Subscription = new Subscription();

    constructor(
        // private location: Location,
        // public dialogService: DialogService,
        // public messageService: MessageService,
        // private confirmationService: ConfirmationService,
        // private messageService: MessageService,

        public userService: UserService,
        private productService: ProductService,
        // private orderService: OrderService,
        // public nsService: NodeStationService,
    ) {}

    ngOnInit(): void {
        // this.getSelectFactoryDialogSelect();
        // console.log(this.factory);
        // console.log(this.userService.getOrders());
        this.orders = this.userService.getOrders();
        this.getProducts();
    }

    getProducts() {
        // ## getting data productIDs []
        let productIDs: string[] = [];
        for (const order of this.orders) { productIDs.push(order.productOR.productID); }

        // ## product imageProfile
        this.postGetProductImageProfiles(productIDs);
    }

    postGetProductImageProfiles(productIDs: string[]) {
        this.productService.postGetProductImageProfiles(this.userService.getCompany().companyID, productIDs);
        if (this.productImageProfilesSub) { this.productImageProfilesSub.unsubscribe(); }
        this.productImageProfilesSub = this.productService.getProductImageProfilesUpdatedListener()
        .subscribe((data) => {
            this.productImageProfiles = data.productImageProfiles;
            // console.log(this.productImageProfiles);

        });
    }

    genImagePath(imgPath: string) {
        if (imgPath.length > 0) {
            return this.productImageProfileGCSPath+imgPath;
        }

        return GBC.nulltGCSPath;
    }

    genProductImagePath(productID: string) {
        if (this.productImageProfiles.length > 0) {
            const idx = this.productImageProfiles.findIndex( fi =>(fi.productID === productID));
            if (idx >= 0) {
                return this.productImageProfileGCSPath+this.productImageProfiles[idx].imageProfile;
            } else { return GBC.nulltGCSPath; }
        } else { return GBC.nulltGCSPath; }
    }

    ngOnDestroy(): void {
        if (this.productImageProfilesSub) { this.productImageProfilesSub.unsubscribe(); }
        // if (this.subNodeFlowCostSub) { this.subNodeFlowCostSub.unsubscribe(); }
        // if (this.qrCodeListProductStyleCFNSub) { this.qrCodeListProductStyleCFNSub.unsubscribe(); }
        // if (this.dataAroundNodeAppSub) { this.dataAroundNodeAppSub.unsubscribe(); }
        // if (this.repCurrentProductQtyCFNSub) { this.repCurrentProductQtyCFNSub.unsubscribe(); }

        // if (this.errSub) { this.errSub.unsubscribe(); }
        // if (this.langSub) { this.langSub.unsubscribe(); }
        // if (this.langListSub) { this.langListSub.unsubscribe(); }

        // this.userService.setOrderProduction(this.userService.clrOrderProduction());
    }
}
