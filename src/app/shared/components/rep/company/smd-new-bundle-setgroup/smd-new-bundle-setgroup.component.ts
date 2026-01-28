import { Component, OnDestroy, OnInit } from '@angular/core';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Subscription } from 'rxjs';
import { GBC } from 'src/app/global/const-global';
import { Company } from 'src/app/models/app.model';
import { BundleSetGroup } from 'src/app/models/order.model';
import { OrderService } from 'src/app/services/order.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-smd-new-bundle-setgroup',
  templateUrl: './smd-new-bundle-setgroup.component.html',
  styleUrls: ['./smd-new-bundle-setgroup.component.scss']
})
export class SmdNewBundleSetgroupComponent implements OnInit, OnDestroy {
    data: any;
    company: Company = GBC.clrCompany();

    bundleSetGroup: BundleSetGroup = GBC.clrBundleSetGroup();


    // bundleNoSet1 = '1-10';
    // bundleNoSet2 = '1-10, 20 , 31-40';
    // bundleNoSet3 = '1-10, s, ..-900';
    // bundleNoSet4 = '10-1';
    // bundleNoSet5 = '';

    // private qrListSub: Subscription = new Subscription;

    constructor(
        public config: DynamicDialogConfig,
        public ref: DynamicDialogRef,

        public userService: UserService,
        private orderService: OrderService,
        // private productService: ProductService,
        // private socketService: SocketIOService,
        // public nsService: NodeStationService,
    ) {}

    ngOnInit(): void {
        this.data = this.config.data;
        this.company = this.userService.getCompany();
        // console.log(this.data);
        this.bundleSetGroup = GBC.clrBundleSetGroup();
        this.bundleSetGroup.companyID = this.company.companyID;
        this.bundleSetGroup.seasonYear = this.userService.seasonYear; // ## 2024AW
        this.bundleSetGroup.orderID = this.data.orderID;
        this.bundleSetGroup.setName = this.data.setName;
        this.bundleSetGroup.targetPlaceID = this.data.targetPlaceID;
        this.bundleSetGroup.color = this.data.colorS.color;
        this.bundleSetGroup.createBy = this.userService.getCreateBy();
    }

    postBundleSetGroupCreateNew() {
        // postBundleSetGroupCreateNew(bundleSetGroup: BundleSetGroup)
        const bundleNoQty = this.userService.validateBundleNoQtyAndCount(this.bundleSetGroup.bundleNoSet);
        if (bundleNoQty < 0) {
            this.bundleSetGroup.bundleNoQty = 0;
        } else if (bundleNoQty >= 1) {
            this.orderService.postBundleSetGroupCreateNew(this.bundleSetGroup);
            this.closeDialog();
        }
    }

    validateBundleNoQty() {
        // this.bundleSetGroup.bundleNoSet = this.bundleNoSet2;
        const bundleNoQty = this.userService.validateBundleNoQtyAndCount(this.bundleSetGroup.bundleNoSet);
        this.bundleSetGroup.bundleNoQty = bundleNoQty === -1 ?0:bundleNoQty;
        // console.log(bundleNoQty);
    }

    closeDialog() {
        // const data: any = {
        //     color: color,
        //     colorNo: this.data.colorNo
        // };
        this.ref.close(true);
    }

    ngOnDestroy(): void {
        // if (this.qrListSub) { this.qrListSub.unsubscribe(); }
        // if (this.ordersByOrderIDsSub) { this.ordersByOrderIDsSub.unsubscribe(); }
        // if (this.orderQtyRewriteSub) { this.orderQtyRewriteSub.unsubscribe(); }
        // if (this.productionQueueBarcodeSumQtySub) { this.productionQueueBarcodeSumQtySub.unsubscribe(); }

        // if (this.screenSub) { this.screenSub.unsubscribe(); }
    }
}
