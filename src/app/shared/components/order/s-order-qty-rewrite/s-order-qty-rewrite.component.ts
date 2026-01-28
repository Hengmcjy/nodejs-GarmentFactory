import { Component, OnInit } from '@angular/core';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { GBC } from 'src/app/global/const-global';
import { Company } from 'src/app/models/app.model';
import { Order, TargetPlace } from 'src/app/models/order.model';
import { OrderService } from 'src/app/services/order.service';
import { UserService } from 'src/app/services/user.service';

@Component({
    selector: 'app-s-order-qty-rewrite',
    templateUrl: './s-order-qty-rewrite.component.html',
    styleUrls: ['./s-order-qty-rewrite.component.scss'],
})
export class SOrderQtyRewriteComponent implements OnInit {

    data: any;

    id = '';
    company: Company = GBC.clrCompany();
    order: Order = GBC.clrOrder();
    productBarcode = '';
    color = '';
    size = '';
    targetPlace: TargetPlace = GBC.clrTargetPlace();
    orderQTY = 0;
    orderQTYOld = 0;
    mode = 'revise-order';  // ## default

    constructor(
        public config: DynamicDialogConfig,
        public ref: DynamicDialogRef,

        public userService: UserService,
        public orderService: OrderService,

    ) {}

    ngOnInit(): void {
        // id: 'rewrite-order-qty',
        // company: this.userService?.getCompany(),
        // order: this.order,
        // color: color,
        // size: size,
        // targetPlace: targetPlace,
        // orderQTY: orderQTY,
        // mode: 'rewrite-order'
        this.data = this.config.data;
        this.company = this.data.company;
        this.order = this.data.order;
        this.productBarcode = this.data.productBarcode;
        this.color = this.data.color;
        this.size = this.data.size;
        this.targetPlace = this.data.targetPlace;
        this.orderQTY = this.data.orderQTY;
        this.orderQTYOld = this.data.orderQTY;
        this.mode = this.data.mode;
    }

    closeDialog() {
        const data = {
            rewrite: true,
            orderQTY: this.orderQTY
        };
        this.ref.close(data);
    }
}
