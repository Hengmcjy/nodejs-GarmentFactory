import { Component, OnInit } from '@angular/core';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { GBC } from 'src/app/global/const-global';
import { Order, ProductORRewriteInfo } from 'src/app/models/order.model';
import { UserService } from 'src/app/services/user.service';

@Component({
    selector: 'app-smd-order-record-rewrite',
    templateUrl: './smd-order-record-rewrite.component.html',
    styleUrls: ['./smd-order-record-rewrite.component.scss'],
})
export class SmdOrderRecordRewriteComponent implements OnInit {
    data: any;

    order: Order = GBC.clrOrder();
    productORRewriteInfo: ProductORRewriteInfo[] = [];
    setName = '';

    // page = 1;
    // countOrderRewriteAll = 0;
    // sumOrderRewriteAll = 0;
    // limit = 20;

    datimeASC = true;
    zoneASC = true;
    colorASC = true;
    sizeASC = true;

    constructor(
        public config: DynamicDialogConfig,
        public ref: DynamicDialogRef,

        public userService: UserService
    ) {}

    ngOnInit(): void {
        this.data = this.config.data;
        this.order = this.data.order;
        if (this.order.orderColor.length > 0) {
            this.setName = this.order.orderColor[0].setName;
        }
        // this.productORRewriteInfo = this.order.productOR.productORRewriteInfo?this.order.productOR.productORRewriteInfo:[];
        this.productORRewriteInfo = this.data.productORRewriteInfo;
        // console.log(this.data);

        // getColorSeq1(colors: ColorS[], colorID: string)
        // getSizeSeq(sizeID: string)
        // getOrderTargetPlaceSeq(orderTargetPlace: OrderTargetPlaceS[], targetPlaceID: string, countryID: string)
        this.productORRewriteInfo.forEach((item, index) => {
            item.colorSeq = this.userService.getColorSeq1(this.order.orderColor, item.productColor);
            item.sizeSeq = this.userService.getSizeSeq(item.productSize);
            item.targetPlaceSeq = this.userService.getOrderTargetPlaceSeq(
                this.order.orderTargetPlace,
                item.targetPlace.targetPlaceID,
                item.targetPlace.countryID);
        });
        // console.log(this.productORRewriteInfo);
    }

    sortByDatetime() {
        // asc = true = น้อย ไป มาก
        this.datimeASC = !this.datimeASC;
        if (this.datimeASC) {
            this.productORRewriteInfo.sort((a,b)=>{
                return a.datetime >b.datetime?1:a.datetime <b.datetime?-1:0
                    || a.targetPlaceSeq >b.targetPlaceSeq?1:a.targetPlaceSeq <b.targetPlaceSeq?-1:0
                    || a.colorSeq >b.colorSeq?1:a.colorSeq <b.colorSeq?-1:0
                    || a.sizeSeq >b.sizeSeq?1:a.sizeSeq <b.sizeSeq?-1:0
            });
        } else {
            this.productORRewriteInfo.sort((a,b)=>{
                return a.datetime <b.datetime?1:a.datetime >b.datetime?-1:0
                    || a.targetPlaceSeq >b.targetPlaceSeq?1:a.targetPlaceSeq <b.targetPlaceSeq?-1:0
                    || a.colorSeq >b.colorSeq?1:a.colorSeq <b.colorSeq?-1:0
                    || a.sizeSeq >b.sizeSeq?1:a.sizeSeq <b.sizeSeq?-1:0
            });
        }
    }

    sortByZone() {
        this.zoneASC = !this.zoneASC;
        if (this.zoneASC) {
            this.productORRewriteInfo.sort((a,b)=>{
                return a.targetPlaceSeq >b.targetPlaceSeq?1:a.targetPlaceSeq <b.targetPlaceSeq?-1:0
                    || a.datetime >b.datetime?1:a.datetime <b.datetime?-1:0
                    || a.colorSeq >b.colorSeq?1:a.colorSeq <b.colorSeq?-1:0
                    || a.sizeSeq >b.sizeSeq?1:a.sizeSeq <b.sizeSeq?-1:0
            });
        } else {
            this.productORRewriteInfo.sort((a,b)=>{
                return a.targetPlaceSeq <b.targetPlaceSeq?1:a.targetPlaceSeq >b.targetPlaceSeq?-1:0
                    || a.datetime >b.datetime?1:a.datetime <b.datetime?-1:0
                    || a.colorSeq >b.colorSeq?1:a.colorSeq <b.colorSeq?-1:0
                    || a.sizeSeq >b.sizeSeq?1:a.sizeSeq <b.sizeSeq?-1:0
            });
        }
    }

    sortByColor() {
        this.colorASC = !this.colorASC;
        if (this.colorASC) {
            this.productORRewriteInfo.sort((a,b)=>{
                return a.colorSeq >b.colorSeq?1:a.colorSeq <b.colorSeq?-1:0
                    || a.targetPlaceSeq >b.targetPlaceSeq?1:a.targetPlaceSeq <b.targetPlaceSeq?-1:0
                    || a.datetime >b.datetime?1:a.datetime <b.datetime?-1:0
                    || a.sizeSeq >b.sizeSeq?1:a.sizeSeq <b.sizeSeq?-1:0
            });
        } else {
            this.productORRewriteInfo.sort((a,b)=>{
                return a.colorSeq <b.colorSeq?1:a.colorSeq >b.colorSeq?-1:0
                    || a.datetime >b.datetime?1:a.datetime <b.datetime?-1:0
                    || a.targetPlaceSeq >b.targetPlaceSeq?1:a.targetPlaceSeq <b.targetPlaceSeq?-1:0
                    || a.sizeSeq >b.sizeSeq?1:a.sizeSeq <b.sizeSeq?-1:0
            });
        }
    }

    sortBySize() {
        this.sizeASC = !this.sizeASC;
        if (this.sizeASC) {
            this.productORRewriteInfo.sort((a,b)=>{
                return a.sizeSeq >b.sizeSeq?1:a.sizeSeq <b.sizeSeq?-1:0
                    || a.datetime >b.datetime?1:a.datetime <b.datetime?-1:0
                    || a.targetPlaceSeq >b.targetPlaceSeq?1:a.targetPlaceSeq <b.targetPlaceSeq?-1:0
                    || a.colorSeq >b.colorSeq?1:a.colorSeq <b.colorSeq?-1:0
            });
        } else {
            this.productORRewriteInfo.sort((a,b)=>{
                return a.sizeSeq <b.sizeSeq?1:a.sizeSeq >b.sizeSeq?-1:0
                    || a.datetime >b.datetime?1:a.datetime <b.datetime?-1:0
                    || a.targetPlaceSeq >b.targetPlaceSeq?1:a.targetPlaceSeq <b.targetPlaceSeq?-1:0
                    || a.colorSeq >b.colorSeq?1:a.colorSeq <b.colorSeq?-1:0
            });
        }
    }

    // export class ProductORRewriteInfo {
    //     constructor(
    //         public datetime: Date,
    //         public productBarcode: string,
    //         public targetPlace: TargetPlace,
    //         public productColor: string,
    //         public productSize: string,
    //         public productQtyOld: number,
    //         public productQty: number,
    //         public productLossQty: number,
    //         public productYear: string,
    //         public productSex: string,
    //         public sizeSeq: number,
    //         public colorSeq: number,
    //         public targetPlaceSeq: number,
    //         public createBy: CreateBy
    //     ) {}
    // }

    closeDialog() {
        const data = {};
        this.ref.close(data);
    }
}
