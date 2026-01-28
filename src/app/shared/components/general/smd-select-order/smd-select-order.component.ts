import { Component, OnInit } from '@angular/core';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { GBC } from 'src/app/global/const-global';
import { OrderImage } from 'src/app/models/order.model';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-smd-select-order',
  templateUrl: './smd-select-order.component.html',
  styleUrls: ['./smd-select-order.component.scss']
})
export class SmdSelectOrderComponent implements OnInit {
    productImageProfileGCSPath = GBC.productImageProfileGCSPath;  // ## google storage path

    data: any;

    idx = -1;
    orderImages: OrderImage[] = [];

    constructor(
        public config: DynamicDialogConfig,
        public ref: DynamicDialogRef,

        public userService: UserService,
    ) {}

    ngOnInit(): void {
        this.data = this.config.data;
        this.orderImages = this.data.orderImages;
        this.idx = this.data.idx;
        // console.log(this.data);
    }

    selectStyle(orderImage: OrderImage) {
        this.ref.close({
            orderImage: orderImage,
            idx: this.idx
        });
    }

    getImage1(orderID: string) {
        return this.productImageProfileGCSPath + this.userService.getOrderImage1(orderID);
    }

}
