import { Component, OnDestroy, OnInit } from '@angular/core';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';

import { Subscription } from 'rxjs';
import { GBC } from 'src/app/global/const-global';
import { Company } from 'src/app/models/app.model';
import { OrderProductionQueueList } from 'src/app/models/order.model';
import { OrderService } from 'src/app/services/order.service';
import { UserService } from 'src/app/services/user.service';

@Component({
    selector: 'app-s-order-queue-list',
    templateUrl: './s-order-queue-list.component.html',
    styleUrls: ['./s-order-queue-list.component.scss'],

})
export class SOrderQueueListComponent implements OnInit, OnDestroy {

    data: any;
    userID = '';
    company: Company = GBC.clrCompany();

    orderID = '';
    productBarcode = '';

    page = 1;
    limit = 0;
    queueList: OrderProductionQueueList[] = [];
    queueListCount = 0;

    private ordersQueueListSub: Subscription = new Subscription();

    constructor(
        public config: DynamicDialogConfig,
        public ref: DynamicDialogRef,



        public userService: UserService,
        private orderService: OrderService,
    ) {}

    ngOnInit(): void {
        this.data = this.config.data;
        this.userID = this.userService.getUserID();
        this.company = this.userService.getCompany();
        this.limit = this.orderService.orderQueuePageListItem;


        // console.log(this.data);
        this.productBarcode = this.data.productBarcode;
        this.orderID = this.data.orderID;
        // console.log(this.productBarcode);
        this.getOrdersQueueList(this.page, this.limit);
    }

    getOrdersQueueList(page: number, limit: number) {
        // getOrdersQueueList(companyID: string, orderID: string, productBarcode: string, page: number, limit: number)
        this.queueList = [];
        this.queueListCount = 0;
        this.orderService.getOrdersQueueList(this.company.companyID, this.orderID, this.productBarcode, page, limit);
        if (this.ordersQueueListSub) { this.ordersQueueListSub.unsubscribe(); }
        this.ordersQueueListSub = this.orderService.getOrdersQueueListUpdatedListener().subscribe(async (data) => {
            // console.log(data);
            this.queueList = data.queueList;
            this.queueListCount = data.queueListCount;
        });
    }

    paginate(event: any) {
        // console.log(event.rows, +event.page);
        this.limit = event.rows;
        this.page = +event.page + 1;
        this.getOrdersQueueList(+event.page + 1, this.limit);
        //event.first = Index of the first record
        //event.rows = Number of rows to display in new page
        //event.page = Index of the new page
        //event.pageCount = Total number of pages
    }

    closeDialog() {
        this.ref.close('');
    }

    ngOnDestroy(): void {
        if (this.ordersQueueListSub) { this.ordersQueueListSub.unsubscribe(); }
        // if (this.orderSub) { this.orderSub.unsubscribe(); }
        // if (this.errSub) { this.errSub.unsubscribe(); }
        // if (this.langSub) { this.langSub.unsubscribe(); }
        // if (this.screenSub) { this.screenSub.unsubscribe(); }
    }
}
