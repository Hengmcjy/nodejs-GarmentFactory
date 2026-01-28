import { Component, OnDestroy, OnInit } from '@angular/core';
import { MessageService } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import { Subscription } from 'rxjs';
import { GBC } from 'src/app/global/const-global';
import { ColorS, Company, Factory, SizeS, TargetPlaceS } from 'src/app/models/app.model';
import { Customer, CustomerOR, MainZone, Order, TargetPlace } from 'src/app/models/order.model';
import { CurrentCompanyOrder, CurrentOrderStyle, OrderProductFacOutQTY, OrderProductFacOutStyleColorSizeQTY, OrderStyleColorSize } from 'src/app/models/report.model';
import { UcCustomerEditComponent } from 'src/app/pages/user/ucompany/uc-customer-edit/uc-customer-edit.component';
import { CustomerService } from 'src/app/services/customer.service';
import { OrderService } from 'src/app/services/order.service';
import { ReportService } from 'src/app/services/report.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-s-rep-outs-overall2',
  templateUrl: './s-rep-outs-overall2.component.html',
  styleUrls: ['./s-rep-outs-overall2.component.scss'],
  providers: [DialogService, MessageService],
})
export class SRepOutsOverall2Component implements OnInit, OnDestroy {
    formActive = 'repOutSourceOverall2';
    pageActive = this.formActive;
    formName = this.formActive;

    blockedPanel: boolean = false;
    seasonYear = '';

    reportHeader = 'Outsource';
    company: Company = GBC.clrCompany();
    factories: Factory[] = [];
    orders: Order[] = [];
    orderIDs: string[] = [];
    ordersCount = 0;
    orderColor: ColorS[] = [];
    sizes: SizeS[] = [];
    colors: ColorS[] = [];
    targetPlaceEmpty: TargetPlace = GBC.clrTargetPlace();
    targetPlaces: TargetPlaceS[] = [];
    mainZone: MainZone[] = [];

    orderStyleColorSize: OrderStyleColorSize[] = [];
    currentCompanyOrder: CurrentCompanyOrder[] = [];
    currentOrderStyle: CurrentOrderStyle[] = [];
    outsQTYGroup: any[] = [];
    currentCompanyOrderStyleGroup: any[] = [];


    outsourcefactoryID: string[] = [];
    currentCompanyOrderOutsourceGroup: any[] = [];
    orderProductFacOutQTY: OrderProductFacOutQTY[] = [];
    orderProductFacOutRemainQTY: OrderProductFacOutQTY[] = [];
    orderProductFacOutStyleColorSizeQTY: OrderProductFacOutStyleColorSizeQTY[] = [];
    orderProductFacOutStyleColorSizeRemainQTY: OrderProductFacOutStyleColorSizeQTY[] = [];

    lastColor = '';
    borderSet = false;
    // visibleDialog = false;

    private repCompanyOutsSub: Subscription = new Subscription;
    private ordersByOrderIDsSub: Subscription = new Subscription;
    private customer1CompanySub: Subscription = new Subscription;
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
        this.reportHeader = this.userService.translateCode('nu', 'nu-outsource');
        this.company = this.userService.getCompany();
        this.factories = this.userService.getFactories();
        this.orders = this.orderService.getOrdersArr();
        this.sizes = this.userService.sizes;
        this.colors = this.userService.colors;

        this.dataAroundAppSub = this.userService.getDataAroundAppStatusListener().subscribe(dataAroundApp => {
            if (this.seasonYear !== this.userService.seasonYear) {
                this.seasonYear = this.userService.seasonYear;
                // this.getRepCompanyOrderOutsource();
            }
        });

        this.targetPlaces = this.userService.targetPlaces;
        this.mainZone = this.userService.getMainZoneTargetPlace(this.targetPlaces);

        // console.log(this.sizes, this.colors, this.targetPlaces);
        // console.log(this.orders);
        this.lastColor = '';
        this.getRepCompanyOrderOutsource();
    }

    getOutsourcefactoryIDQTY(facOutsID: string, orderID: string): string {
        //
        const orderProductFacOutQTYF =
            this.orderProductFacOutQTY.filter(i=>i.companyID == this.company.companyID && i.outsourcefactoryID==facOutsID
                && i.orderID==orderID);
        // console.log(facOutsID, orderProductFacOutQTYF, this.company.companyID);
        if (orderProductFacOutQTYF.length > 0) {
            return orderProductFacOutQTYF[0].sumFactoryOutsQty+'';
        }
        return '';
    }

    getOutsourcefactoryIDRemainQTY(facOutsID: string, orderID: string): string {
        //
        const orderProductFacOutRemainQTYF =
            this.orderProductFacOutRemainQTY.filter(i=>i.companyID == this.company.companyID && i.outsourcefactoryID==facOutsID
                && i.orderID==orderID);
        // console.log(facOutsID, orderProductFacOutQTYF, this.company.companyID);
        if (orderProductFacOutRemainQTYF.length > 0) {
            return orderProductFacOutRemainQTYF[0].sumFactoryOutsQty+'';
        }
        return '';
    }

    getSumOutsourcefactoryIDQTY(facOutsID: string, orderID: string): string {
        //
        const orderProductFacOutQTYF =
            this.orderProductFacOutQTY.filter(i=>i.companyID == this.company.companyID && i.outsourcefactoryID==facOutsID
                && i.orderID==orderID);
        // console.log(facOutsID, orderProductFacOutQTYF, this.company.companyID);
        const orderProductFacOutRemainQTYF =
            this.orderProductFacOutRemainQTY.filter(i=>i.companyID == this.company.companyID && i.outsourcefactoryID==facOutsID
                && i.orderID==orderID);
        let orderProductFacOutQTYFF = 0;
        let orderProductFacOutRemainQTYFF = 0;

        if (orderProductFacOutQTYF.length > 0) {
            orderProductFacOutQTYFF = +orderProductFacOutQTYF[0].sumFactoryOutsQty;
        }
        // console.log(facOutsID, orderProductFacOutQTYF, this.company.companyID);
        if (orderProductFacOutRemainQTYF.length > 0) {
            orderProductFacOutRemainQTYFF = +orderProductFacOutRemainQTYF[0].sumFactoryOutsQty;
        }
        const result = orderProductFacOutQTYFF - orderProductFacOutRemainQTYFF;

        if (orderProductFacOutQTYF.length === 0 && orderProductFacOutRemainQTYF.length === 0) {
            return '';
        }
        return result+'';
    }

    async getRepCompanyOrderOutsource() {
        this.blockedPanel = true;
        this.lastColor = '';
        // this.orders = [];
        // getRepCompanyOrder(companyID: string, ordertatus: string[])
        const seasonYear = this.userService.seasonYear;
        const ordertatus = ['open'];
        // console.log(this.company.companyID, ordertatus, seasonYear);
        this.repService.getRepCompanyOrderOutsource2(this.company.companyID, ordertatus, seasonYear);
        if (this.repCompanyOutsSub) { this.repCompanyOutsSub.unsubscribe(); }
        this.repCompanyOutsSub = this.repService.getRepCompanyOrderOutsourceUpdatedListener().subscribe((data) => {
            this.blockedPanel = false;
            // console.log(data);

            this.orderIDs = data.orderIDs;
            // this.orderStyleColorSize = data.orderStyleColorSize;
            // this.currentCompanyOrder = data.currentCompanyOrder;
            this.outsourcefactoryID = data.outsourcefactoryID;

            this.orderProductFacOutQTY = data.orderProductFacOutQTY;
            this.orderProductFacOutRemainQTY = data.orderProductFacOutRemainQTY;
            this.orderProductFacOutStyleColorSizeQTY = data.orderProductFacOutStyleColorSizeQTY;
            this.orderProductFacOutStyleColorSizeRemainQTY = data.orderProductFacOutStyleColorSizeRemainQTY;


            this.outsourcefactoryID = data.outsourcefactoryID;
            this.outsourcefactoryID.sort();  // sort asc
            // console.log(this.outsourcefactoryID);

            // // console.log(this.currentCompanyOrder);
            // // console.log(this.orderStyleColorSize);

            // this.orderIDs = Array.from(new Set(this.currentCompanyOrder.map((item: any) => item.orderID)));
            this.orderIDs = Array.from(new Set(this.userService.getOrders().map((item: any) => item.orderID)));
            this.getOrdersByOrderIDs(this.orderIDs);

            this.currentOrderStyle = data.currentOrderStyle;
            this.currentOrderStyle.sort((a,b)=>{
                return a.style >b.style?1:a.style <b.style?-1:0
            });
            // console.log(this.currentOrderStyle);
        });
    }

    getOrdersByOrderIDs(orderIDs: string[]) {
        this.orderService.getOrdersByOrderIDs(this.company.companyID, orderIDs);
        if (this.ordersByOrderIDsSub) { this.ordersByOrderIDsSub.unsubscribe(); }
        this.ordersByOrderIDsSub = this.orderService.getOrdersByOrderIDsListener().subscribe((data) => {

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


            this.orderProductFacOutStyleColorSizeQTY.forEach( (item, index) => {
                item.size = this.userService.strReplaceAll(item.size, '-', '');
                item.color = this.userService.strReplaceAll(item.color, '-', '');
                item.targetPlace = this.userService.strReplaceAll(item.targetPlace, '-', '');
            });
            this.orderProductFacOutStyleColorSizeQTY.forEach( (item, index) => {
                item.color = this.userService.changeColorTextToColorTextComma(item.color);
                item.sizeSeq = this.userService.getSizeSeq(item.size);
            });

            this.orderProductFacOutStyleColorSizeRemainQTY.forEach( (item, index) => {
                item.size = this.userService.strReplaceAll(item.size, '-', '');
                item.color = this.userService.strReplaceAll(item.color, '-', '');
                item.targetPlace = this.userService.strReplaceAll(item.targetPlace, '-', '');
            });
            this.orderProductFacOutStyleColorSizeRemainQTY.forEach( (item, index) => {
                item.color = this.userService.changeColorTextToColorTextComma(item.color);
                item.sizeSeq = this.userService.getSizeSeq(item.size);
            });

            // console.log(this.orderProductFacOutStyleColorSizeQTY, this.orderProductFacOutStyleColorSizeRemainQTY);

            this.outsQTYGroup = this.userService.groupBy(this.orderProductFacOutStyleColorSizeQTY, (c: any) => c.outsourcefactoryID);
            // console.log(this.outsQTYGroup);

            this.outsQTYGroup = Object.values(this.outsQTYGroup);
            // console.log(this.outsQTYGroup);

            this.outsQTYGroup.sort((a,b)=>{ return a.outsourcefactoryID >b.outsourcefactoryID?1:a.outsourcefactoryID <b.outsourcefactoryID?-1:0 });
            // console.log(this.outsQTYGroup);

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

            // this.currentCompanyOrderStyleGroup = this.userService.groupBy(this.currentCompanyOrder, (c: any) => c.style);
            // // console.log(this.currentCompanyOrderStyleGroup);

            // this.currentCompanyOrderStyleGroup = Object.values(this.currentCompanyOrderStyleGroup);
            // // console.log(this.currentCompanyOrderStyleGroup);

            // this.currentCompanyOrderStyleGroup.sort((a,b)=>{ return a.style >b.style?1:a.style <b.style?-1:0 });
            // console.log(this.currentCompanyOrderStyleGroup);

        });
    }

    getOrderQty(facOuts: string, companyID: string, orderID: string, color: string, size: string, targetPlace: string) {
        const outsOrder = this.orderProductFacOutStyleColorSizeQTY.filter(i=>
            i.outsourcefactoryID == facOuts &&
            i.companyID == companyID && i.orderID == orderID &&
            i.targetPlace == targetPlace &&
            i.color == color && i.size == size);
        if (outsOrder.length>0) {
            return outsOrder[0].countQty;
        } else {
            return ' ';
        }
    }

    getOutsProductionZoneQtyRemain(facOuts: string, companyID: string, orderID: string, color: string, size: string, targetPlace: string) {
        let outsOrderQTY = 0;
        const outsOrder = this.getOrderQty(facOuts, companyID, orderID, color, size, targetPlace);
        if (outsOrder+''.trim() === '') {
            outsOrderQTY = 0;
        } else {
            outsOrderQTY = +outsOrder;
        }

        const outsOrderReamin = this.orderProductFacOutStyleColorSizeRemainQTY.filter(i=>
            i.outsourcefactoryID == facOuts &&
            i.companyID == companyID && i.orderID == orderID &&
            i.targetPlace == targetPlace &&
            i.color == color && i.size == size);

        if (outsOrderReamin.length>0) {
            return outsOrderReamin[0].countQty;
        } else {
            if (outsOrderQTY > 0) {
                return '0';
            }
            return ' ';
        }
    }

    getOutsProductionZoneQtyReturned(facOuts: string, companyID: string, orderID: string, color: string, size: string, targetPlace: string) {
        let outsOrderQTY = 0;
        let outsOrderReaminQTY = 0;

        const outsOrder = this.getOrderQty(facOuts, companyID, orderID, color, size, targetPlace);
        if (outsOrder+''.trim() === '') {
            outsOrderQTY = 0;
        } else {
            outsOrderQTY = +outsOrder;
        }

        const outsOrderReamin = this.getOutsProductionZoneQtyRemain(facOuts, companyID, orderID, color, size, targetPlace);
        if (outsOrderReamin+''.trim() === '') {
            outsOrderReaminQTY = 0;
        } else {
            outsOrderReaminQTY = +outsOrderReamin;
        }

        return ' ';  // ## always return empty string @ this time for waiting for collect information
        return outsOrderQTY - outsOrderReaminQTY === 0 ? '0' : (outsOrderQTY - outsOrderReaminQTY)+'';
    }



    checkColorShow(color: string, doEdit: boolean, rowIdex: number) {
        // console.log(color);
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

    orderStyleColorSizeFilterF(outsFactoryID: string, style: string) {
        // console.log(outsFactoryID, style);
        // this.orderProductFacOutStyleColorSizeQTY
        let resultF = this.orderProductFacOutStyleColorSizeQTY.filter(i =>
                i.outsourcefactoryID === outsFactoryID
                && i.orderID === style
        );

        // console.log(this.orders);
        let colors: ColorS[] = [];
        const colorsF = this.orders.filter(i=>i.orderID == style);
        if (colorsF.length > 0) {
            colors = colorsF[0].orderColor;
        }
        // console.log(colors, colorsF, resultF);
        resultF = this.repService.setColorSeq2(colors, resultF);
        resultF.sort((a,b)=>{
            return a.style >b.style?1:a.style <b.style?-1:0
                || a.colorSeq >b.colorSeq?1:a.colorSeq <b.colorSeq?-1:0
                || a.sizeSeq >b.sizeSeq?1:a.sizeSeq <b.sizeSeq?-1:0
        });
        // console.log(resultF);
        return resultF;
    }

    // orderStyleColorSizeFilter(idx: number) {
    //     let orderStyleColorSize = this.orderStyleColorSize.filter(i=>i.style == this.currentCompanyOrderStyleGroup[idx][0].style);
    //     // console.log(orderStyleColorSize);
    //     // if (this.orders.length > 0) {
    //     let colors: ColorS[] = [];
    //     const colorsF = this.orders.filter(i=>i.orderID == this.currentCompanyOrderStyleGroup[idx][0].orderID);
    //     // console.log(colorsF);
    //     if (colorsF.length > 0) {
    //         colors = colorsF[0].orderColor;
    //     }
    //     // console.log(colors, orderStyleColorSize);
    //     orderStyleColorSize = this.repService.setColorSeq(colors, orderStyleColorSize);
    //     orderStyleColorSize.sort((a,b)=>{
    //         return a.style >b.style?1:a.style <b.style?-1:0
    //             || a.colorSeq >b.colorSeq?1:a.colorSeq <b.colorSeq?-1:0
    //             || a.sizeSeq >b.sizeSeq?1:a.sizeSeq <b.sizeSeq?-1:0
    //     });
    //     // console.log(orderStyleColorSize);
    //     return orderStyleColorSize;
    //     // } else { return []; }
    // }

    getStyleOuts(facOutsID: string): string[] {
        let styleArr: string[] = [];
        const outsStyleF = this.orderProductFacOutStyleColorSizeQTY.filter(o => o.outsourcefactoryID === facOutsID);
        outsStyleF.forEach((item, index) => {
            if (!styleArr.includes(item.orderID)) {
                styleArr.push(item.orderID);
            }
        });
        return styleArr;
    }

    findOrderQty(style: string) {
        const currentOrderStyleF = this.currentOrderStyle.filter(i => i.orderID === style);
        if (currentOrderStyleF.length > 0) {
            return currentOrderStyleF[0].sumQty+'';
        }
        return '';
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

    inputUserPassPopup() {

    }

    ngOnDestroy(): void {
        if (this.repCompanyOutsSub) { this.repCompanyOutsSub.unsubscribe(); }
        if (this.ordersByOrderIDsSub) { this.ordersByOrderIDsSub.unsubscribe(); }
        if (this.customer1CompanySub) { this.customer1CompanySub.unsubscribe(); }
        if (this.dataAroundAppSub) { this.dataAroundAppSub.unsubscribe(); }

        // if (this.langSub) { this.langSub.unsubscribe(); }
    }
}
