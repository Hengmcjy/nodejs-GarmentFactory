import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { MenuItem, MessageService } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import { Subscription } from 'rxjs';
import { GBC } from 'src/app/global/const-global';
import { ColorS, Company, CreateBy, Factory, SizeS, TargetPlaceS } from 'src/app/models/app.model';
import { Order, TargetPlace } from 'src/app/models/order.model';
import { CurrentCompanyOrder, CurrentOrderStyle, OrderStyleColorSize } from 'src/app/models/report.model';
import { OrderService } from 'src/app/services/order.service';
import { ReportService } from 'src/app/services/report.service';
import { UserService } from 'src/app/services/user.service';
import { SOrderQtyRewriteComponent } from '../s-order-qty-rewrite/s-order-qty-rewrite.component';

@Component({
    selector: 'app-s-zonecountry-orderview',
    templateUrl: './s-zonecountry-orderview.component.html',
    styleUrls: ['./s-zonecountry-orderview.component.scss'],
    providers: [DialogService, MessageService],
})
export class SZonecountryOrderviewComponent implements OnInit, OnDestroy {
    @Input() order: Order = GBC.clrOrder();

    formActive = 'S-StyleOrder-zone-country';
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

    lastColor = '';
    borderSet = false;

    headMenuPopup = '';
    items: MenuItem[] = [];
    menuOrdervisible: string[] = ['revise-order']; // ## ['revise-order']

    private repCompanyOrderSub: Subscription = new Subscription;
    // private customer1CompanySub: Subscription = new Subscription;
    private ordersByOrderIDsSub: Subscription = new Subscription;
    private orderQtyRewriteSub: Subscription = new Subscription;

    constructor(
        public dialogService: DialogService,
        public messageService: MessageService,

        public userService: UserService,
        private orderService: OrderService,
        // private cusService: CustomerService,
        private repService: ReportService,
    ) {}

    ngOnInit(): void {
        this.company = this.userService.getCompany();
        this.factories = this.userService.getFactories();
        this.orders = this.orderService.getOrdersArr();
        this.sizes = this.userService.sizes;
        this.colors = this.userService.colors;

        // console.log(this.sizes, this.colors, this.targetPlaces);
        // console.log(this.orders);
        this.lastColor = '';
        if (this.order.orderID !== '') {
            this.getRepCompanyOrderByOrderID();
        }

    }

    putOrderProductionQtyRewrite(productBarcode: string, color: string, size: string, targetPlace: TargetPlace,
                                orderQTY: number, orderQTYOld: number) {
        // putOrderProductionQtyRewrite(userID: string, companyID: string, orderID: string,
        //     productBarcode: string, color: string, size: string, targetPlace: TargetPlace,
        //     orderQTY: number, orderQTYOld: number)
        const createBy: CreateBy = this.userService.getCreateBy();
        const year = this.userService.getInfoFromProductBarcode(productBarcode, 'year');
        const sex = this.userService.getInfoFromProductBarcode(productBarcode, 'sex');

        this.orderService.putOrderProductionQtyRewrite(
            createBy, this.company.companyID, this.order.orderID,
            productBarcode, color, size, targetPlace, year, sex,
            orderQTY, orderQTYOld
        );
        if (this.orderQtyRewriteSub) { this.orderQtyRewriteSub.unsubscribe(); }
        this.orderQtyRewriteSub = this.orderService.getOrderQtyRewriteUpdatedListener().subscribe(async (data) => {
            // console.log(data);

            this.orderStyleColorSize = data.orderStyleColorSize;
            this.currentCompanyOrder = data.currentCompanyOrder;
            // console.log(this.currentCompanyOrder);
            // console.log(this.orderStyleColorSize);

            this.orderIDs = Array.from(new Set(this.currentCompanyOrder.map((item: any) => item.orderID)));
            // console.log(this.orderIDs);
            this.getOrdersByOrderIDs(this.orderIDs);

            this.currentOrderStyle = data.currentOrderStyle;

        });
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

    selectProduct(color: string, size: string, targetPlace: TargetPlace) {
        const productBarcode = this.currentCompanyOrder.filter(i=>
            i.productColor == color && i.productSize == size &&
            i.targetPlaceID == targetPlace.targetPlaceID && i.countryID == targetPlace.countryID
            )[0].productBarcode;
        // console.log(productBarcode, color, size, targetPlace);
    }

    setMenuPopup(color: string, size: string, targetPlace: TargetPlace) {
        const productBarcode = this.currentCompanyOrder.filter(i=>
            i.productColor == color && i.productSize == size &&
            i.targetPlaceID == targetPlace.targetPlaceID && i.countryID == targetPlace.countryID
            )[0].productBarcode;
        // console.log(productBarcode, color, size, targetPlace);

        this.headMenuPopup = this.order.orderID;
        this.items = [{
            label: this.headMenuPopup,
            items: [
                // {label: 'show order queue', command: () => { this.selectProductBarcode(); }},
                {
                    label: 'revise order qty',
                    visible: this.checkMenuVisible('revise-order'),
                    command: () => { this.rewriteOrderQTY(productBarcode, color, size, targetPlace); }
                },
                // {label: 'Download', icon: 'pi pi-fw pi-download'}
            ]
        }];
    }

    checkMenuVisible(menuID: string): boolean {
        const canVisible = this.menuOrdervisible.includes(menuID);
        return canVisible;
    }

    rewriteOrderQTY(productBarcode: string, color: string, size: string, targetPlace: TargetPlace) {
        // console.log(productBarcode, color, size, targetPlace);
        const orderQTY = this.getOrderQtyForRewrite(
            this.company.companyID, this.order.orderID, this.order.productOR.productID, this.order.productOR.productID,
            color, size, targetPlace
        );
        // showRewriteOrderQTYModal(color: string, size: string, targetPlace: TargetPlace, orderQTY: number)
        this.showRewriteOrderQTYModal(productBarcode, color, size, targetPlace, +orderQTY);
    }

    getOrderQtyForRewrite(companyID: string, orderID: string, productID: string, style: string,
        productColor: string, productSize: string, targetPlace: TargetPlace) {
        // console.log(this.company.companyID, this.order.orderID, this.order.productOR.productID, this.order.orderID,
        //     productColor, productSize, targetPlace);
        // return  targetPlaceID: string, countryID: string,
        // const targetPlaces = this.getOrderTargetPlace(orderID);
        // const targetPlaceID = targetPlaces[targetPlaceIndex].targetPlace.targetPlaceID;
        // const countryID = targetPlaces[targetPlaceIndex].targetPlace.countryID;
        const companyOrder = this.currentCompanyOrder.filter(i=>i.companyID == companyID && i.orderID == orderID &&
            i.productID == productID && i.style == style &&
            i.targetPlaceID == targetPlace.targetPlaceID && i.countryID == targetPlace.countryID &&
            i.productColor == productColor && i.productSize == productSize);
        // console.log(companyOrder);
        // console.log(this.currentCompanyOrder);
        if (companyOrder.length>0) {
            return companyOrder[0].sumQty;
        } else {
            return 0;
        }
    }


    async getRepCompanyOrderByOrderID() {
        this.lastColor = '';
        this.orders = [];
        // getRepCompanyOrder(companyID: string, ordertatus: string[])
        const ordertatus = ['any'];
        this.repService.getRepCompanyOrderByOrderID(this.company.companyID, ordertatus, this.order.orderID);
        if (this.repCompanyOrderSub) { this.repCompanyOrderSub.unsubscribe(); }
        this.repCompanyOrderSub = this.repService.getRepCompanyOrderUpdatedListener().subscribe((data) => {
            // console.log(data);
            // this.orderStyleColorSize = this.repService.setColorSeq(this.sizes, data.orderStyleColorSize);
            this.orderStyleColorSize = data.orderStyleColorSize;
            this.currentCompanyOrder = data.currentCompanyOrder;
            // console.log(this.currentCompanyOrder);
            // console.log(this.orderStyleColorSize);

            this.orderIDs = Array.from(new Set(this.currentCompanyOrder.map((item: any) => item.orderID)));
            // console.log(this.orderIDs);
            this.getOrdersByOrderIDs(this.orderIDs);
            // console.log([this.order.orderID]);
            // this.getOrdersByOrderIDs([this.order.orderID]);

            this.currentOrderStyle = data.currentOrderStyle;
            // this.currentOrderStyle.sort((a,b)=>{
            //     return a.style >b.style?1:a.style <b.style?-1:0
            // });

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

            // this.currentCompanyOrderStyleGroup[0][0] = undefined;

            this.currentCompanyOrderStyleGroup = this.userService.groupBy(this.currentCompanyOrder, (c: any) => c.style);
            // console.log(this.currentCompanyOrderStyleGroup);

            this.currentCompanyOrderStyleGroup = Object.values(this.currentCompanyOrderStyleGroup);
            // console.log(this.currentCompanyOrderStyleGroup);

            this.currentCompanyOrderStyleGroup.sort((a,b)=>{ return a.style >b.style?1:a.style <b.style?-1:0 });
            // console.log(this.currentCompanyOrderStyleGroup);
        });
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

    showRewriteOrderQTYModal(productBarcode: string, color: string, size: string, targetPlace: TargetPlace, orderQTY: number) {
        const ref = this.dialogService.open(SOrderQtyRewriteComponent, {
            data: {
                id: 'revise-order-qty',
                company: this.userService?.getCompany(),
                // callfrom: this.formName,  // ## send to nodejs for choose buckets
                // productBarcode: productBarcode,
                order: this.order,
                productBarcode: productBarcode,
                color: color,
                size: size,
                targetPlace: targetPlace,
                orderQTY: orderQTY,
                mode: 'revise-order'

            },
            header: 'Revise Order QTY',
            width: '70%',
        });

        ref.onClose.subscribe((data: any) => {
            // console.log(data);
            if (data.rewrite) {
                // console.log(data.orderQTY);
                this.putOrderProductionQtyRewrite(productBarcode, color, size, targetPlace, data.orderQTY, orderQTY);
            }
        });
    }



    ngOnDestroy(): void {
        if (this.repCompanyOrderSub) { this.repCompanyOrderSub.unsubscribe(); }
        if (this.ordersByOrderIDsSub) { this.ordersByOrderIDsSub.unsubscribe(); }
        if (this.orderQtyRewriteSub) { this.orderQtyRewriteSub.unsubscribe(); }
        // if (this.productionQueueBarcodeSumQtySub) { this.productionQueueBarcodeSumQtySub.unsubscribe(); }

        // if (this.screenSub) { this.screenSub.unsubscribe(); }
    }
}
