import { Component, OnDestroy, OnInit } from '@angular/core';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { GBC } from 'src/app/global/const-global';
import { Order, OrderStyles } from 'src/app/models/order.model';
import { UserService } from 'src/app/services/user.service';

@Component({
    selector: 'app-s-select-order',
    templateUrl: './s-select-order.component.html',
    styleUrls: ['./s-select-order.component.scss'],
})
export class SSelectOrderComponent implements OnInit, OnDestroy {
    data: any;
    productImageProfileGCSPath = GBC.productImageProfileGCSPath;  // ## google storage path

    orders: Order[] = [];
    // orderStyles: OrderStyles[] = [];
    // export class OrderStyles {
    //     constructor(
    //         public companyID: string,
    //         public factoryID: string,
    //         public orderID: string,
    //         public productID: string,
    //     ) {}
    // }

    constructor(
        public config: DynamicDialogConfig,
        public ref: DynamicDialogRef,
        public userService: UserService,
    ) {}

    ngOnInit(): void {
        this.data = this.config.data;
        // console.log(this.data);
        this.orders = this.data.orders;
        this.orders.sort((a,b)=>{
            return a.orderID >b.orderID?1:a.orderID <b.orderID?-1:0
        });
    }

    getImage1(orderID: string) {
        return this.productImageProfileGCSPath + this.userService.getOrderImage1(orderID);
    }

    selectStyle(order: Order) {
        this.closeDialog(order);
    }

    closeDialog(order: Order) {
        const data = order;
        this.ref.close(data);
    }

    ngOnDestroy(): void {
        // if (this.postCreateCustomerSub) { this.postCreateCustomerSub.unsubscribe(); }
        // if (this.posteditCustomerSub) { this.posteditCustomerSub.unsubscribe(); }
        // if (this.errSub) { this.errSub.unsubscribe(); }
        // if (this.langSub) { this.langSub.unsubscribe(); }
        // if (this.screenSub) { this.screenSub.unsubscribe(); }
    }
}
