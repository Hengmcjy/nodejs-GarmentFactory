import { Component, OnDestroy, OnInit } from '@angular/core';
import { MessageService } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import { Subscription } from 'rxjs';

import { ColorS, Company, Factory, OrderTargetPlaceS, SizeS, TargetPlaceS } from 'src/app/models/app.model';
import { Customer, CustomerOR, Order, ProductORRewriteInfo, TargetPlace } from 'src/app/models/order.model';
import { CurrentCompanyOrder, CurrentOrderStyle, OrderStyleColorSize } from 'src/app/models/report.model';
import { ReportService } from 'src/app/services/report.service';
import { UserService } from 'src/app/services/user.service';

import { UcCustomerEditComponent } from 'src/app/pages/user/ucompany/uc-customer-edit/uc-customer-edit.component';
import { CustomerService } from 'src/app/services/customer.service';
import { OrderService } from 'src/app/services/order.service';
import { GBC } from 'src/app/global/const-global';
import { SmdOrderRecordRewriteComponent } from '../../../order/smd-order-record-rewrite/smd-order-record-rewrite.component';


@Component({
    selector: 'app-s-rep-com-overall',
    templateUrl: './s-rep-com-overall.component.html',
    styleUrls: ['./s-rep-com-overall.component.scss'],
    providers: [DialogService, MessageService],
})
export class SRepComOverallComponent implements OnInit, OnDestroy {
    formActive = 'repComOverall';
    pageActive = this.formActive;
    formName = this.formActive;

    reportHeader = 'Order';
    company: Company = GBC.clrCompany();
    factories: Factory[] = [];
    orders: Order[] = [];
    orderIDs: string[] = [];
    ordersCount = 0;
    orderColor: ColorS[] = [];

    orderStyleColorSize: OrderStyleColorSize[] = [];
    currentCompanyOrder: CurrentCompanyOrder[] = [];
    currentOrderStyle: CurrentOrderStyle[] = [];
    currentCompanyOrderStyleGroup: any[] = [];
    sizes: SizeS[] = [];
    colors: ColorS[] = [];

    targetPlaceEmpty: TargetPlace = GBC.clrTargetPlace();

    lastColor = '';
    borderSet = false;
    // visibleDialog = false;
    tabIndexActive = 0;
    tabNameActive = 'Order all';

    private repCompanyOrderSub: Subscription = new Subscription;
    private customer1CompanySub: Subscription = new Subscription;
    private ordersByOrderIDsSub: Subscription = new Subscription;
    private dataAroundAppSub: Subscription = new Subscription;

    constructor(
        public dialogService: DialogService,
        public messageService: MessageService,

        public userService: UserService,
        private orderService: OrderService,
        private cusService: CustomerService,
        private repService: ReportService,
    ) {}

    ngOnInit(): void {
        this.reportHeader = this.userService.translateCode('mn', 'mn-order');
        this.company = this.userService.getCompany();
        this.factories = this.userService.getFactories();
        this.orders = this.orderService.getOrdersArr();
        this.sizes = this.userService.sizes;
        this.colors = this.userService.colors;
        this.tabIndexActive = 0;
        this.tabNameActive = 'Order all';

        this.dataAroundAppSub = this.userService.getDataAroundAppStatusListener().subscribe(dataAroundApp => {
            this.getRepCompanyOrder();
        });


        // console.log(this.sizes, this.colors, this.targetPlaces);
        // console.log(this.orders);
        this.lastColor = '';
        this.getRepCompanyOrder();
    }

    checkOrderQtyRewrite(orderID: string, color: string, size: string, targetPlace: TargetPlace) {
        // console.log(orderID, color, size, targetPlace);

        if (this.tabNameActive !== orderID) { return ''; } // ## do when this tabView is active

        const productBarcodeArr = this.currentCompanyOrder.filter(i=>
            i.orderID === orderID &&
            i.productColor == color && i.productSize == size &&
            i.targetPlaceID == targetPlace.targetPlaceID && i.countryID == targetPlace.countryID
            );
        let productBarcode = '';
        if (productBarcodeArr.length > 0) {
            // console.log(orderID, color, size, targetPlace);
            // console.log(productBarcodeArr);
            productBarcode = productBarcodeArr[0].productBarcode;

            const order = this.orders.filter(i=>i.orderID == orderID)[0];
            const productORRewriteInfo = order.productOR.productORRewriteInfo?order.productOR.productORRewriteInfo:[];
            if (productORRewriteInfo.length > 0) {
                const found = productORRewriteInfo.filter(i=>i.productBarcode == productBarcode);
                if (found.length > 0) { return true; }
                else { return false; }
            } else { return false; }
        } else { return false; }
    }

    // showRewriteRecordDialog() {
    //     this.visibleDialog = true;
    // }

    async getRepCompanyOrder() {
        this.lastColor = '';
        this.orders = [];
        // getRepCompanyOrder(companyID: string, ordertatus: string[])
        const ordertatus = ['open'];
        this.repService.getRepCompanyOrder(this.company.companyID, ordertatus);
        if (this.repCompanyOrderSub) { this.repCompanyOrderSub.unsubscribe(); }
        this.repCompanyOrderSub = this.repService.getRepCompanyOrderUpdatedListener().subscribe((data) => {
            // console.log(data);
            // this.orderStyleColorSize = this.repService.setColorSeq(this.sizes, data.orderStyleColorSize);
            this.orderStyleColorSize = data.orderStyleColorSize;
            this.currentCompanyOrder = data.currentCompanyOrder;
            // console.log(this.currentCompanyOrder);
            // console.log(this.orderStyleColorSize);
            this.orderIDs = Array.from(new Set(this.currentCompanyOrder.map((item: any) => item.orderID)));
            this.getOrdersByOrderIDs(this.orderIDs);

            this.currentOrderStyle = data.currentOrderStyle;
        });
    }

    getOrdersByOrderIDs(orderIDs: string[]) {
        // getOrdersByOrderIDs(companyID: string, orderIDs: string[])
        this.orderService.getOrdersByOrderIDs(this.company.companyID, orderIDs);
        if (this.ordersByOrderIDsSub) { this.ordersByOrderIDsSub.unsubscribe(); }
        this.ordersByOrderIDsSub = this.orderService.getOrdersByOrderIDsListener().subscribe((data) => {
            // console.log(data);
            this.orders = data.orders;
            this.ordersCount = data.ordersCount;
            // console.log(this.orders);
            // this.orderStyleColorSize = this.repService.setColorSeq(this.orders.orderColors, this.orderStyleColorSize);

            // // ## adjust group for style
            // this.currentCompanyOrderStyleGroup = this.userService.groupBy(this.currentCompanyOrder, (c: any) => c.style);
            // this.currentCompanyOrderStyleGroup = Object.values(this.currentCompanyOrderStyleGroup);
            // this.currentCompanyOrderStyleGroup.forEach( (item, index) => {
            //     // console.log(item, index);
            //     item = this.repService.setAnySizeSeq(this.sizes, item);
            //     item = this.repService.setAnyColorSeq(item[0].orderColor, item);
            // });
            // console.log(this.currentCompanyOrderStyleGroup);

            // this.currentOrderStyle = data.currentOrderStyle;
            this.currentOrderStyle.sort((a,b)=>{
                return a.style >b.style?1:a.style <b.style?-1:0
            });

            this.orderStyleColorSize.forEach( (item, index) => {
                item.productSize = this.userService.strReplaceAll(item.productSize, '-', '');
            });
            this.orderStyleColorSize = this.repService.setSizeSeq(this.sizes, this.orderStyleColorSize);
            this.orderStyleColorSize = this.repService.setColorSeq(this.colors, this.orderStyleColorSize);


            // ## multi sort 2 property
            this.orderStyleColorSize.sort((a,b)=>{
                return a.style >b.style?1:a.style <b.style?-1:0
                    || a.colorSeq >b.colorSeq?1:a.colorSeq <b.colorSeq?-1:0
                    || a.sizeSeq >b.sizeSeq?1:a.sizeSeq <b.sizeSeq?-1:0
            });

            // this.orderStyleColorSize.sort((a,b)=>{
            //     return a.productColor >b.productColor?1:a.productColor <b.productColor?-1:0
            //         || a.sizeSeq >b.sizeSeq?1:a.sizeSeq <b.sizeSeq?-1:0
            // });


            // console.log(this.orderStyleColorSize);
            // console.log(this.currentOrderStyle, this.orderStyleColorSize, this.currentCompanyOrder);
            // console.log(this.currentCompanyOrder);

            // ## grouping style
            this.currentCompanyOrder.sort((a,b)=>{ return a.style >b.style?1:a.style <b.style?-1:0 });
            // console.log(this.currentCompanyOrder);

            this.currentCompanyOrder.forEach( (item, index) => {
                item.productSize = this.userService.strReplaceAll(item.productSize, '-', '');
            });
            // console.log(this.currentCompanyOrder);

            this.currentCompanyOrderStyleGroup = this.userService.groupBy(this.currentCompanyOrder, (c: any) => c.style);
            // console.log(this.currentCompanyOrderStyleGroup);

            this.currentCompanyOrderStyleGroup = Object.values(this.currentCompanyOrderStyleGroup);
            // console.log(this.currentCompanyOrderStyleGroup);

            this.currentCompanyOrderStyleGroup.sort((a,b)=>{ return a.style >b.style?1:a.style <b.style?-1:0 });
            // console.log(this.currentCompanyOrderStyleGroup);

        });
    }

    getTabIndex(ev: any) {
        // console.log(ev);
        this.tabIndexActive = ev.index;
        if (this.tabIndexActive === 0) {
            this.tabNameActive = 'Order all';
        } else {
            this.tabNameActive = this.currentCompanyOrderStyleGroup[this.tabIndexActive - 1][0].orderID;
        }
        // console.log(this.tabIndexActive, this.tabNameActive);
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

    getOrderQty(companyID: string, orderID: string, productID: string, style: string,
        productColor: string, productSize: string, targetPlaceIndex: number, orderTargetPlace: TargetPlaceS) {
        // return  targetPlaceID: string, countryID: string,

        // const targetPlaces = this.getOrderTargetPlace(orderID);
        // const targetPlaceID = targetPlaces[targetPlaceIndex].targetPlace.targetPlaceID;
        // const countryID = targetPlaces[targetPlaceIndex].targetPlace.countryID;


        if (this.tabNameActive !== orderID) { return ''; } // ## do when this tabView is active

        const targetPlaceID = orderTargetPlace.targetPlace.targetPlaceID;
        const countryID = orderTargetPlace.targetPlace.countryID;
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
        if (this.tabNameActive !== orderID) { return 0; } // ## do when this tabView is active

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

        if (this.tabNameActive !== group.orderID) { return 0; } // ## do when this tabView is active

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

        if (this.tabNameActive !== group.orderID) { return 0; } // ## do when this tabView is active

        const companyOrder = this.currentCompanyOrder.filter(i=>i.companyID == group.companyID && i.orderID == group.orderID &&
            i.productID == group.productID && i.style == group.style );
        if (companyOrder.length>0) {
            const totalQtyGrand = companyOrder.reduce((prev, cur) => {return prev + cur.sumQty;}, 0);
            return totalQtyGrand;
        } else {
            return 0;
        }
    }

    // groupBy(xs: any[], f: any) {
    //     return xs.reduce((r, v, i, a, k = f(v)) => ((r[k] || (r[k] = [])).push(v), r), {});
    // }

    orderStyleColorSizeFilter(idx: number) {
        let orderStyleColorSize = this.orderStyleColorSize.filter(i=>i.style == this.currentCompanyOrderStyleGroup[idx][0].style);
        // console.log(orderStyleColorSize);
        // if (this.orders.length > 0) {
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

    checkBorderLastColumn(isLastColumn: boolean) {
        // if (isLastColumn) {
        //     this.borderSet = false;
        // }
        if (this.borderSet) {
            if (isLastColumn) {
                this.borderSet = false;
            }
            return true;
        }

        // if (isLastColumn && this.borderSet) { return true; }
        return false;
    }

    async showCustomerSelectionViewBtn(customerOR: CustomerOR, mode: string) {
        const customer: Customer = await this.cusService.get1CustomerInfo(customerOR.customerID, this.company.companyID);
        if (customer.customerID !== '') {
            this.cusService.setCustomer(customer);
            if (mode === 'view') {
                this.showCustomerSelectionViewModal(customer);
            }
        } else {
            this.getCustomer1Company(customerOR.customerID, this.company.companyID, mode);
        }
    }

    getCustomer1Company(customerID: string, companyID: string, mode: string) {
        // async getCustomer1(companyID: string, customerID: string)
        this.cusService.getCustomer1(companyID, customerID);
        if (this.customer1CompanySub) { this.customer1CompanySub.unsubscribe(); }
        this.customer1CompanySub = this.cusService.getCustomerUpdatedListener()
        .subscribe((data) => {
            const customer = data.customer;
            this.cusService.setCustomer(customer);
            if (mode === 'view') {
                this.showCustomerSelectionViewModal(customer);
            }
        });
    }

    showCustomerSelectionViewModal(customer: Customer) {
        const ref = this.dialogService.open(UcCustomerEditComponent, {
            data: {
                id: 'customerView',
                company: this.userService?.getCompany(),
                customer: customer,
                callfrom: this.formName,  // ## send to nodejs for choose buckets
                modeView: true

            },
            header: 'Customer Info view',
            width: '80%',
        });

        ref.onClose.subscribe((data: any) => {
            // console.log(data);
        });
    }

    // type =  'all' , 'zone-color-size'
    showRewriteOrderQTYModal(orderID: string, type: string, color: string, size: string, targetPlace: TargetPlace) {

        let canShowModal = false;
        const order: Order = this.orders.filter(i=> i.orderID === orderID.trim())[0];
        let productORRewriteInfo: ProductORRewriteInfo[] = [];

        if (type === 'zone-color-size') {
            const isRewriteZoneColorSize = this.checkOrderQtyRewrite(orderID, color, size, targetPlace);
            if (isRewriteZoneColorSize) {
                let productORRewriteInfo2: ProductORRewriteInfo[] =
                    order.productOR.productORRewriteInfo?order.productOR.productORRewriteInfo:[];
                productORRewriteInfo = productORRewriteInfo2.filter(i=>
                    i.productColor == color && i.productSize == size &&
                    i.targetPlace.targetPlaceID == targetPlace.targetPlaceID && i.targetPlace.countryID == targetPlace.countryID
                );
                canShowModal = true;
            }
        } else if (type === 'all') {
            if (this.checkIsRewriteOrder(orderID)) {
                productORRewriteInfo = order.productOR.productORRewriteInfo?order.productOR.productORRewriteInfo:[];
                canShowModal = true;
            }
        }

        if (canShowModal) {
            const ref = this.dialogService.open(SmdOrderRecordRewriteComponent, {
                data: {
                    id: 'revise-order-record',
                    company: this.userService?.getCompany(),
                    order: order,
                    productORRewriteInfo: productORRewriteInfo,
                    mode: 'revise-order-record'

                },
                header: 'Revise order QTY record ',
                width: '70%',
            });

            ref.onClose.subscribe((data: any) => {
                // console.log(data);
                // if (data.rewrite) {
                //     // console.log(data.orderQTY);
                //     this.putOrderProductionQtyRewrite(productBarcode, color, size, targetPlace, data.orderQTY, orderQTY);
                // }
            });
        }

    }

    checkIsRewriteOrder(orderID: string) {
        let order: Order = GBC.clrOrder();
        const orderF = this.orders.filter(i=> i.orderID === orderID.trim());
        if (orderF.length > 0) {
            order = orderF[0];
        }
        let productORRewriteInfo: ProductORRewriteInfo[] = [];
        productORRewriteInfo = order.productOR.productORRewriteInfo?order.productOR.productORRewriteInfo:[];
        if (productORRewriteInfo.length > 0) {
            return true;
        }
        return false;
    }

    // selectRewriteOrderZoneColorSize(orderID: string, color: string, size: string, targetPlace: TargetPlace) {
    //     const productBarcodeArr = this.currentCompanyOrder.filter(i=>
    //         i.orderID === orderID &&
    //         i.productColor == color && i.productSize == size &&
    //         i.targetPlaceID == targetPlace.targetPlaceID && i.countryID == targetPlace.countryID
    //         );
    //     const order: Order = this.orders.filter(i=> i.orderID === orderID)[0];

    // }

    // checkOrderQtyRewrite(orderID: string, color: string, size: string, targetPlace: TargetPlace) {
    //     // console.log(orderID, color, size, targetPlace);
    //     const productBarcodeArr = this.currentCompanyOrder.filter(i=>
    //         i.orderID === orderID &&
    //         i.productColor == color && i.productSize == size &&
    //         i.targetPlaceID == targetPlace.targetPlaceID && i.countryID == targetPlace.countryID
    //         );
    //     let productBarcode = '';
    //     if (productBarcodeArr.length > 0) {
    //         // console.log(orderID, color, size, targetPlace);
    //         // console.log(productBarcodeArr);
    //         productBarcode = productBarcodeArr[0].productBarcode;

    //         const order = this.orders.filter(i=>i.orderID == orderID)[0];
    //         const productORRewriteInfo = order.productOR.productORRewriteInfo?order.productOR.productORRewriteInfo:[];
    //         if (productORRewriteInfo.length > 0) {
    //             const found = productORRewriteInfo.filter(i=>i.productBarcode == productBarcode);
    //             if (found.length > 0) { return true; }
    //             else { return false; }
    //         } else { return false; }
    //     } else { return false; }
    // }

    ngOnDestroy(): void {
        if (this.repCompanyOrderSub) { this.repCompanyOrderSub.unsubscribe(); }
        if (this.customer1CompanySub) { this.customer1CompanySub.unsubscribe(); }
        if (this.ordersByOrderIDsSub) { this.ordersByOrderIDsSub.unsubscribe(); }
        if (this.dataAroundAppSub) { this.dataAroundAppSub.unsubscribe(); }

        // if (this.langSub) { this.langSub.unsubscribe(); }
    }
}
