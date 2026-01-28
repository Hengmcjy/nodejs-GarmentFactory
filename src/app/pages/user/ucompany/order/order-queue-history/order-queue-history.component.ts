import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';


import { UserService } from 'src/app/services/user.service';
import { OrderService } from 'src/app/services/order.service';
import { ProductService } from 'src/app/services/product.service';
import { Order, OrderProductionQueue } from 'src/app/models/order.model';
import { GBC } from 'src/app/global/const-global';
import { Factory } from 'src/app/models/app.model';

@Component({
    selector: 'app-order-queue-history',
    templateUrl: './order-queue-history.component.html',
    styleUrls: ['./order-queue-history.component.scss'],
})
export class OrderQueueHistoryComponent implements OnInit, OnDestroy {
    // @Input() order: Order;
    // @Input() coin: string;
    formActive = 'order-queue-history';
    formName = this.formActive;

    // productBarcode = '';
    companyID = '';
    factories: Factory[] = [];
    orderProductionQueue: OrderProductionQueue = GBC.clrOrderProductQueue();
    countProductionQueueAll = 0;
    sumProductionQueueAll = 0;
    limit = 20;

    order: Order = GBC.clrOrder();

    private productionQueueSub: Subscription = new Subscription();

    constructor(
        public userService: UserService,
        private orderService: OrderService,
        private productService: ProductService,
    ) {}

    ngOnInit(): void {
        this.companyID = this.userService.getCompany().companyID;
        this.factories = this.userService.factories;
        this.order = this.orderService.getOrder();
        // this.productBarcode = '';
        this.getProductionQueue(1);
    }

    getProductionQueue(page: number) {
        this.orderService.getProductionQueue(this.companyID,
                                                        this.order.orderID, this.order.productOR.productID,
                                                        page, this.limit);
        if (this.productionQueueSub) { this.productionQueueSub.unsubscribe(); }
        this.productionQueueSub = this.orderService.getLastProductionQueueAllUpdatedListener()
        .subscribe((data) => {
            // this.product = data.product;
            // this.style = this.product.productCustomerCode.toUpperCase();
            // console.log(data);
            this.orderProductionQueue = data.orderProductionQueue;
            this.countProductionQueueAll = data.countProductionQueueAll;
            this.sumProductionQueueAll = data.sumProductionQueueAll;
            // console.log(this.orderProductionQueue);
        });
    }

    paginate(event: any) {
        // console.log(event);
        this.limit = event.rows;
        this.getProductionQueue(+event.page+ 1 );
        //event.first = Index of the first record
        //event.rows = Number of rows to display in new page
        //event.page = Index of the new page
        //event.pageCount = Total number of pages
    }

    getRowClass(isOutsource: boolean): string {
        if (isOutsource) {
            return 'txt-subcontact-cell';
        }
        return '';
    }

    ngOnDestroy(): void {
        if (this.productionQueueSub) { this.productionQueueSub.unsubscribe(); }

        // if (this.ordersSub) { this.ordersSub.unsubscribe(); }
        // if (this.productImageProfilesSub) { this.productImageProfilesSub.unsubscribe(); }
        // if (this.langSub) { this.langSub.unsubscribe(); }
        // if (this.screenSub) { this.screenSub.unsubscribe(); }
    }
}
