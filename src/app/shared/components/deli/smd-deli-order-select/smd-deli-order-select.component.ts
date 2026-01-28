import { Component, OnInit } from '@angular/core';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { GBC } from 'src/app/global/const-global';
import { ColorS, Company, SizeS, TargetPlaceS } from 'src/app/models/app.model';
import { Order, TargetPlace } from 'src/app/models/order.model';
import { CurrentCompanyOrder, CurrentOrderStyle, OrderStyleColorSize } from 'src/app/models/report.model';
import { ReportService } from 'src/app/services/report.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-smd-deli-order-select',
  templateUrl: './smd-deli-order-select.component.html',
  styleUrls: ['./smd-deli-order-select.component.scss']
})
export class SmdDeliOrderSelectComponent implements OnInit {

    data: any;
    mode = '';  // ##
    cartonIDX = 0; // ##  carton ic

    company: Company = GBC.clrCompany();
    orders: Order[] = [];
    order: Order = GBC.clrOrder();
    orderID: string = '';

    currentCompanyOrderStyleGroup: any[] = [];
    orderStyleColorSize: OrderStyleColorSize[] = [];
    currentCompanyOrder: CurrentCompanyOrder[] = [];
    currentOrderStyle: CurrentOrderStyle[] = [];
    sizes: SizeS[] = [];
    colors: ColorS[] = [];

    lastColor = '';
    borderSet = false;

    constructor(
        public config: DynamicDialogConfig,
        public ref: DynamicDialogRef,

        public userService: UserService,
        private repService: ReportService,
    ) {}

    ngOnInit(): void {
        this.data = this.config.data;
        // console.log(this.data);

        this.company = this.userService.getCompany();

        this.mode = this.data.mode;
        this.cartonIDX = this.data.cartonIDX;
        // this.company = this.data.company;
        this.orders = this.data.orders;
        this.order = this.data.order;
        this.orderID = this.order.orderID;
        this.currentCompanyOrderStyleGroup = this.data.currentCompanyOrderStyleGroup;
        this.orderStyleColorSize = this.data.orderStyleColorSize;
        this.currentCompanyOrder = this.data.currentCompanyOrder;
        this.currentOrderStyle = this.data.currentOrderStyle;

        this.sizes = this.userService.sizes;
        this.colors = this.userService.colors;


        // console.log(this.currentCompanyOrderStyleGroup);
    }

    selectOrder(data1: any) {
        // const data1: any = { cartonIDX, productBarcode, color, size, targetPlace, qty };
        this.ref.close(data1);
    }

    selectProduct(color: string, size: string, targetPlace: TargetPlace,
        companyID: string, orderID: string, productID: string, style: string, targetPlaceIndex: number
    ) {
        const productBarcode = this.currentCompanyOrder.filter(i=>
            i.productColor == color && i.productSize == size &&
            i.targetPlaceID == targetPlace.targetPlaceID && i.countryID == targetPlace.countryID
            )[0].productBarcode;
        //
        const qty = this.getOrderQty(companyID, orderID, productID, style,
            color, size, targetPlaceIndex);
        // console.log(productBarcode, color, size, targetPlace, qty);
        const cartonIDX = this.cartonIDX;
        const data1: any = { cartonIDX, productBarcode, color, size, targetPlace, qty };
        this.selectOrder(data1);
    }

    orderStyleColorSizeFilter(idx: number) {
        let orderStyleColorSize = this.orderStyleColorSize.filter(i=>i.style == this.currentCompanyOrderStyleGroup[idx][0].style);
        // console.log(orderStyleColorSize);
        // if (this.orders.length > 0)
        let colors: ColorS[] = [];
        const colorsF = this.orders.filter(i=>i.orderID == this.currentCompanyOrderStyleGroup[idx][0].orderID);
        // console.log(colorsF);
        if (colorsF.length > 0) {
            colors = colorsF[0].orderColor;
        }
        // console.log(colors, orderStyleColorSize);
        orderStyleColorSize = this.repService.setColorSeq(colors, orderStyleColorSize);
        orderStyleColorSize.sort((a,b)=>{
            return a.style >b.style?1:a.style <b.style?-1:0
                || a.colorSeq >b.colorSeq?1:a.colorSeq <b.colorSeq?-1:0
                || a.sizeSeq >b.sizeSeq?1:a.sizeSeq <b.sizeSeq?-1:0
        });
        // console.log(orderStyleColorSize);
        return orderStyleColorSize;
        // } else { return []; }
    }

    getOrderTargetPlace(orderID: string) {
        let orderTargetPlace: TargetPlaceS[] = [];
        const order: Order[] = this.orders.filter(i=>i.companyID == this.company.companyID && i.orderID == orderID.trim());
        // console.log(order, orderID);
        if (order.length > 0) {
            return order[0].orderTargetPlace;
        }
        return orderTargetPlace;
    }

    checkColorShow(color: string, doEdit: boolean, rowIdex: number) {
        if (doEdit && rowIdex === 0) { this.lastColor = '';}
        if (this.lastColor === color) {
            return false;
        } else {
            if (doEdit) {
                this.lastColor = color;
            }
            this.borderSet = true;
            return true;
        }
    }



    checkOrderQtyRewrite(color: string, size: string, targetPlace: TargetPlace) {
        const productBarcodeArr = this.currentCompanyOrder.filter(i=>
            i.productColor == color && i.productSize == size &&
            i.targetPlaceID == targetPlace.targetPlaceID && i.countryID == targetPlace.countryID
            );
        let productBarcode = '';
        if (productBarcodeArr.length > 0) {
            productBarcode = productBarcodeArr[0].productBarcode;

            const order = this.orders.filter(i=>i.orderID == this.order.orderID)[0];
            const productORRewriteInfo = order.productOR.productORRewriteInfo?order.productOR.productORRewriteInfo:[];
            if (productORRewriteInfo.length > 0) {
                const found = productORRewriteInfo.filter(i=>i.productBarcode == productBarcode);
                if (found.length > 0) { return true; }
                else { return false; }
            } else { return false; }
        } else { return false; }
    }

    getOrderQty(companyID: string, orderID: string, productID: string, style: string,
        productColor: string, productSize: string, targetPlaceIndex: number) {
        // return  targetPlaceID: string, countryID: string,
        const targetPlaces = this.getOrderTargetPlace(orderID);
        const targetPlaceID = targetPlaces[targetPlaceIndex].targetPlace.targetPlaceID;
        const countryID = targetPlaces[targetPlaceIndex].targetPlace.countryID;
        const companyOrder = this.currentCompanyOrder.filter(i=>i.companyID == companyID && i.orderID == orderID &&
            i.productID == productID && i.style == style && i.targetPlaceID == targetPlaceID && i.countryID == countryID &&
            i.productColor == productColor && i.productSize == productSize);
        if (companyOrder.length>0) {
            return companyOrder[0].sumQty;
        } else {
            return '';
        }
    }

    getOrderQtyRowTotal(companyID: string, orderID: string, productID: string, style: string,
        productColor: string, productSize: string) {
        //
        const companyOrder = this.currentCompanyOrder.filter(i=>i.companyID == companyID && i.orderID == orderID &&
            i.productID == productID && i.style == style &&
            i.productColor == productColor && i.productSize == productSize);
        if (companyOrder.length>0) {
            const totalQtyRow = companyOrder.reduce((prev, cur) => {return prev + cur.sumQty;}, 0);
            return totalQtyRow;
            // return 1;
        } else {
            return 0;
        }
    }

    getOrderQtyColumnTotal(group: any, targetPlaceIndex: number) {
        const targetPlaces = this.getOrderTargetPlace(group.style.trim());
        const targetPlaceID = targetPlaces[targetPlaceIndex].targetPlace.targetPlaceID;
        const countryID = targetPlaces[targetPlaceIndex].targetPlace.countryID;
        const companyOrder = this.currentCompanyOrder.filter(i=>i.companyID == group.companyID && i.orderID == group.orderID &&
            i.productID == group.productID && i.style == group.style && i.targetPlaceID == targetPlaceID && i.countryID == countryID);
        // console.log(companyOrder);
        if (companyOrder.length>0) {
            const totalQtyColumn = companyOrder.reduce((prev, cur) => {return prev + cur.sumQty;}, 0);
            return totalQtyColumn;
        } else {
            return 0;
        }
    }

    getOrderQtyGrandTotal(group: any) {
        const companyOrder = this.currentCompanyOrder.filter(i=>i.companyID == group.companyID && i.orderID == group.orderID &&
            i.productID == group.productID && i.style == group.style );
        if (companyOrder.length>0) {
            const totalQtyGrand = companyOrder.reduce((prev, cur) => {return prev + cur.sumQty;}, 0);
            return totalQtyGrand;
        } else {
            return 0;
        }
    }
}
