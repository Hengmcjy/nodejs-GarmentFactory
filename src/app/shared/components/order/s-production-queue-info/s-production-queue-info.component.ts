import { Component, OnInit, OnDestroy } from '@angular/core';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Subscription } from 'rxjs';

import { OrderService } from 'src/app/services/order.service';
import { UserService } from 'src/app/services/user.service';
import { OrderProductionQueue } from 'src/app/models/order.model';
import { GBC } from 'src/app/global/const-global';
import { Factory } from 'src/app/models/app.model';


@Component({
    selector: 'app-s-production-queue-info',
    templateUrl: './s-production-queue-info.component.html',
    styleUrls: ['./s-production-queue-info.component.scss'],
})
export class SProductionQueueInfoComponent implements OnInit, OnDestroy {
    data: any;
    productBarcode = '';
    factories: Factory[] = [];
    orderProductionQueue: OrderProductionQueue = GBC.clrOrderProductQueue();
    countProductionQueueByBarcode = 0;
    sumProductionQueueByBarcode = 0;


    private lastProductionQueueBarcodeSub: Subscription = new Subscription();

    constructor(
        public config: DynamicDialogConfig,
        public ref: DynamicDialogRef,

        public userService: UserService,
        private orderService: OrderService,
        // private productService: ProductService,
    ) {}

    ngOnInit(): void {
        this.data = this.config.data;
        this.factories = this.userService.factories;
        // console.log(this.config);
        // console.log(this.data);
        this.getLastProductionQueueBarcode(1);  // ## 1 first page
        // console.log(this.userService.factories);
        // userService.getUserfactoryName(factory: Factory[], factoryID: string)
    }

    getLastProductionQueueBarcode(page: number) {
        this.orderService.getLastProductionQueueBarcode(this.data.companyID,
                                                        this.data.orderID, this.data.productID,
                                                        this.data.productBarcode, page, this.data.limit);
        if (this.lastProductionQueueBarcodeSub) { this.lastProductionQueueBarcodeSub.unsubscribe(); }
            this.lastProductionQueueBarcodeSub = this.orderService.getLastProductionQueueBarcodeUpdatedListener()
            .subscribe((data) => {
                // this.product = data.product;
                // this.style = this.product.productCustomerCode.toUpperCase();
                // console.log(data);
                this.orderProductionQueue = data.orderProductionQueue;
                // console.log(this.orderProductionQueue.queueInfo);
                this.countProductionQueueByBarcode = data.countProductionQueueByBarcode;
                this.sumProductionQueueByBarcode = data.sumProductionQueueByBarcode;
                // ## edit header caption
                this.config.header = 'Qty : '  + this.sumProductionQueueByBarcode +' / ' + this.data.productQty;
                this.productBarcode = '';
                if (this.orderProductionQueue.queueInfo.length> 0) {
                    this.productBarcode = this.orderProductionQueue.queueInfo[0].productBarcode;
                }
            });
    }

    closeDialog() {
        this.ref.close();
    }

    ngOnDestroy(): void {
        if (this.lastProductionQueueBarcodeSub) { this.lastProductionQueueBarcodeSub.unsubscribe(); }
        // if (this.errSub) { this.errSub.unsubscribe(); }
        // if (this.sockio) { this.sockio.unsubscribe(); }
        // if (this.dataAroundAppSub) { this.dataAroundAppSub.unsubscribe(); }
        // if (this.screenSub) { this.screenSub.unsubscribe(); }
    }
}
