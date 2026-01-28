import { Component, OnInit, OnDestroy } from '@angular/core';
import { Location } from '@angular/common';
import { DialogService } from 'primeng/dynamicdialog';
import { Message, MessageService } from 'primeng/api';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';

import { ProductService } from 'src/app/services/product.service';
import { UserService } from 'src/app/services/user.service';
import { CustomerService } from 'src/app/services/customer.service';
import { OrderService } from 'src/app/services/order.service';
import { Product } from 'src/app/models/product.model';
import { ColorS, Company, Factory, SizeS, TargetPlaceS } from 'src/app/models/app.model';
import { Customer, Order, OrderProduction, ProductORInfo, TargetPlace } from './../../../../../models/order.model';

import { SSelectCustomerComponent } from 'src/app/shared/components/general/s-select-customer/s-select-customer.component';
import { SSelectProductComponent } from 'src/app/shared/components/general/s-select-product/s-select-product.component';
import { SSelectTargetPlaceComponent } from 'src/app/shared/components/general/s-select-target-place/s-select-target-place.component';
import { SSelectSizeComponent } from 'src/app/shared/components/general/s-select-size/s-select-size.component';
import { SSelectYearComponent } from 'src/app/shared/components/general/s-select-year/s-select-year.component';
import { SSelectSexComponent } from 'src/app/shared/components/general/s-select-sex/s-select-sex.component';
import { SSelectColorComponent } from 'src/app/shared/components/general/s-select-color/s-select-color.component';
import { SProductFilterComponent } from 'src/app/shared/components/general/s-product-filter/s-product-filter.component';
import { SSelectFactoryComponent } from 'src/app/shared/components/general/s-select-factory/s-select-factory.component';
import { SSelectFactoryComponent as SSelectFactoryComponent2} from 'src/app/shared/components/general/s-select-factory/s-select-factory.component';
import { GBC } from 'src/app/global/const-global';
import { CurrentCompanyOrder, CurrentOrderStyle, CurrentProductQtyAllC, OrderStyleColorSize } from 'src/app/models/report.model';
import { ReportService } from 'src/app/services/report.service';
// import { SLabelQrcodeComponent } from 'src/app/shared/components/order/s-label-qrcode/s-label-qrcode.component';

@Component({
    selector: 'app-order-create',
    templateUrl: './order-create.component.html',
    styleUrls: ['./order-create.component.scss'],
    providers: [DialogService, MessageService],
})
export class OrderCreateComponent implements OnInit, OnDestroy {
    formActive = 'order-create';
    formName = this.formActive;
    userID = '';
    company: Company = GBC.clrCompany();
    factorySelected: Factory = GBC.clrFactory();
    factorySelectForOrderStyle: Factory = GBC.clrFactory();

    msgErrCustomerProduct: Message[] = [];

    forLossInputDisable = true;
    colorBtn2_5Disable = true;
    sexBtnDisable = true;

    mode = 'create-order'; // ##
    orderMode = '';
    // autoResize = true; // ## text area auto resize
    productImageProfileGCSPath = GBC.productImageProfileGCSPath; // ## google storage path image profile
    product: Product = GBC.clrProduct();
    customer: Customer = GBC.clrCustomer();
    order: Order = GBC.clrOrder();
    productORInfo: ProductORInfo[] = [];
    productORInfo1: ProductORInfo = GBC.clrProductORInfo();
    targetPlaceTmp: TargetPlace = GBC.clrTargetPlace();
    tempFullProductORInfo: ProductORInfo[] = [];
    productORInfoOld: ProductORInfo[] = [];

    name1 = 'style-targetPlace-year-5color-size-sex-#####';
    name2 = '';

    barcodeStr = '';
    style = '************'; // ## product.productCustomerCode 12
    targetPlace = '----';
    countryID = '-----';
    year = '--';
    c1 = '--';
    c2 = '--';
    c3 = '--';
    c4 = '--';
    c5 = '--';
    size = '---';
    sex = '-';
    runNo = '#####';

    orderDate: Date = new Date();

    styleS: string[] = [];
    targetPlaceS: string[] = [];
    colorS: string[] = [];
    sizeS: string[] = [];

    currentProductQtyAllC: CurrentProductQtyAllC[] = [];
    orderStyleColorSize: OrderStyleColorSize[] = [];
    currentCompanyOrder: CurrentCompanyOrder[] = [];
    currentOrderStyle: CurrentOrderStyle[] = [];
    currentCompanyOrderStyleGroup: any[] = [];
    orderProductBundleNos: OrderProduction[] = [];
    sizes: SizeS[] = [];
    colors: ColorS[] = [];
    orderStyleColorSizeF: any;
    menuOrdervisible: string[] = ['revise-order']; // ## ['revise-order']
    // ## revise-order = edit qty of order

    private orderSub: Subscription = new Subscription();
    private orderProductSelectSub: Subscription = new Subscription();
    private repCompanyOrderSub: Subscription = new Subscription();
    private repCompanyOrder1Sub: Subscription = new Subscription();

    constructor(
        private location: Location,
        private route: ActivatedRoute,
        public dialogService: DialogService,
        public messageService: MessageService,
        private productService: ProductService,
        public userService: UserService,
        private orderService: OrderService,
        private customerService: CustomerService,
        private repService: ReportService,
    ) {}

    ngOnInit(): void {
        this.location.replaceState('/'); // ## hide loocation

        this.userID = this.userService.getUserID();
        this.company = this.userService.getCompany();
        this.factorySelected = GBC.clrFactory();
        this.factorySelectForOrderStyle = {...GBC.clrFactory()};

        this.product = this.productService.getProduct();
        this.customer = GBC.clrCustomer();
        this.order = this.orderService.getOrder();
        this.productORInfo1 = GBC.clrProductORInfo();
        this.targetPlaceTmp = GBC.clrTargetPlace();

        this.sizes = this.userService.sizes;
        this.colors = this.userService.colors;

        // this.userService.strReplaceAll('aa,bbb,cc',',','');
        // console.log(this.userService.strReplaceAll('aa,bbb,cc',',',''));
        // strReplaceAll(str: string, find: string, replace: string)

        // console.log(this.order);

        // console.log(this.route.snapshot.queryParamMap.get('mode') + '');
        this.orderMode = (this.route.snapshot.queryParamMap.get('orderMode') + '')?this.route.snapshot.queryParamMap.get('orderMode') + '':'create-order';
        // console.log(this.orderMode);
        if (this.orderMode === 'edit-order') {
            this.order = this.orderService.getOrder();
            // console.log('111');
            this.productORInfoOld = this.order.productOR.productORInfo?[...this.order.productOR.productORInfo]:[];
            this.productORInfoFilter();
            this.sortOrderProductORInfo();
            this.orderDate = new Date(this.order.orderDate);
            this.getCustomer1(this.company.companyID, this.order.customerOR.customerID);
            // this.customer = GBC.clrCustomer();
            this.prepareData();

        } else if (this.orderMode === 'create-order'){
            this.product = GBC.clrProduct();
            this.customer = GBC.clrCustomer();
            this.order = GBC.clrOrder();
            this.productORInfoOld = this.order.productOR.productORInfo?[...this.order.productOR.productORInfo]:[];
            this.productORInfoFilter();

            this.userService.setProduct(GBC.clrProduct());
            this.userService.setCustomer(GBC.clrCustomer());
            this.userService.setOrder(GBC.clrOrder());

            this.productService.setProduct(GBC.clrProduct());
        }

        // console.log(this.orderMode);
        // console.log(this.order);
        // this.product = this.userService.emptyProduct();
        // this.customer = this.userService.emptyCustomer();
        // this.productORInfo1 = this.userService.clrProductORInfo();

        this.getRepCompanyOrder();

    }

    getCustomer1(companyID: string, customerID: string) {
        // getCustomer1(companyID: string, customerID: string)
        this.customerService.getCustomer1(companyID, customerID);
        if (this.repCompanyOrder1Sub) { this.repCompanyOrder1Sub.unsubscribe(); }
        this.repCompanyOrder1Sub = this.customerService.getCustomerUpdatedListener().subscribe((data) => {
            this.customer = data.customer;

        });
    }

    async getRepCompanyOrder() {
        // this.lastColor = '';
        // this.orders = [];
        // console.log('getRepCompanyOrder');
        // console.log(this.order);
        if (this.order.orderID !== '') {



            const productStatus = ['normal', 'problem', 'repaired', 'lost', 'complete'];
            const ordertatus = ['open'];
            this.orderService.getCompanyOrderByStyle(this.company.companyID, this.order.productOR.productID, ordertatus, productStatus);
            if (this.repCompanyOrderSub) { this.repCompanyOrderSub.unsubscribe(); }
            this.repCompanyOrderSub = this.orderService.getRepCompanyOrderUpdatedListener().subscribe((data) => {
                // console.log(data);
                // this.orderStyleColorSize = this.repService.setColorSeq(this.sizes, data.orderStyleColorSize);
                this.orderStyleColorSize = data.orderStyleColorSize;
                this.currentCompanyOrder = data.currentCompanyOrder;
                this.currentOrderStyle = data.currentOrderStyle;
                // console.log(this.currentCompanyOrder);
                // console.log(this.orderStyleColorSize);

                this.currentProductQtyAllC = data.currentProductQtyAllC;

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

                // ## replace - to empty
                this.currentProductQtyAllC.forEach( (item, index) => {
                    item.size = this.userService.strReplaceAll(item.size, '-', '');
                    item.color = this.userService.strReplaceAll(item.color, '-', '');
                    item.targetPlace = this.userService.strReplaceAll(item.targetPlace, '-', '');
                });
                // ## change color text to textComma
                this.currentProductQtyAllC.forEach( (item, index) => {
                    item.color = this.userService.changeColorTextToColorTextComma(item.color);
                    item.sizeSeq = this.userService.getSizeSeq(item.size);
                });
                // console.log(this.currentProductQtyAllC);


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

                this.orderStyleColorSizeF = this.orderStyleColorSizeFilter(0);

            });
        }
    }

    orderStyleColorSizeFilter(idx: number) {
        // console.log(this.orderStyleColorSize);
        // console.log(this.currentCompanyOrderStyleGroup);
        let orderStyleColorSize = this.orderStyleColorSize.filter(i=>i.style == this.currentCompanyOrderStyleGroup[idx][0].style);
        // console.log(orderStyleColorSize);
        // if (this.orders.length > 0) {
        let colors: ColorS[] = this.order.orderColor;

        // console.log(colors, orderStyleColorSize);
        orderStyleColorSize = this.repService.setColorSeq(colors, orderStyleColorSize);
        orderStyleColorSize.sort((a,b)=>{
            return a.style >b.style?1:a.style <b.style?-1:0
                || a.colorSeq >b.colorSeq?1:a.colorSeq <b.colorSeq?-1:0
                || a.sizeSeq >b.sizeSeq?1:a.sizeSeq <b.sizeSeq?-1:0
        });
        // console.log(orderStyleColorSize);
        return orderStyleColorSize;
    }

    sortOrderProductORInfo() {
        let productORInfo = this.order.productOR.productORInfo?[...this.order.productOR.productORInfo]:[];
        productORInfo.forEach( (item, index) => {
            item.productSize = this.userService.strReplaceAll(item.productSize, '-', '');
            item.productColor = this.userService.strReplaceAll(item.productColor, '-', '');
            // item.targetPlace = this.userService.strReplaceAll(item.targetPlace, '-', '');
        });

        productORInfo.forEach( (item, index) => {
            // item.productColor = this.userService.changeColorTextToColorTextComma(item.productColor);
            item.sizeSeq = this.userService.getSizeSeq(item.productSize);
        });

        productORInfo.sort((a,b)=>{
            return a.productBarcode >b.productBarcode?1:a.productBarcode <b.productBarcode?-1:0
            // || a.targetPlace.targetPlaceID >b.targetPlace.targetPlaceID?1:a.targetPlace.targetPlaceID <b.targetPlace.targetPlaceID?-1:0
            // || a.targetPlace.countryID >b.targetPlace.countryID?1:a.targetPlace.countryID <b.targetPlace.countryID?-1:0
            || a.targetPlace>b.targetPlace?1:a.targetPlace <b.targetPlace?-1:0
            || a.productColor >b.productColor?1:a.productColor <b.productColor?-1:0
            || a.sizeSeq >b.sizeSeq?1:a.sizeSeq <b.sizeSeq?-1:0
        });
        // console.log(this.order.productOR.productORInfo);
        // console.log(productORInfo);
    }

    editProductORInfo(field: string, value: string, targetPlace: TargetPlace) {
        // style = '********'; // ## product.productCustomerCode
        // targetPlace = '****';
        // year = '**';
        // c1 = '**';
        // c2 = '**';
        // c3 = '**';
        // c4 = '**';
        // c5 = '**';
        // size = '***';
        // sex = '*';
        const colorSet = ['c2','c3','c4','c5'];
        if (field === 'targetPlace') {
            this.productORInfo1.targetPlace = targetPlace;
        } else if (field === 'year') {
            this.productORInfo1.productYear = value;
        } else if (field === 'c1') {
            this.productORInfo1.productColor = value;
        } else if (colorSet.includes(field)) {  // ##  in 'c2','c3','c4','c5'
            this.productORInfo1.productColor = this.productORInfo1.productColor +','+value;
        } else if (field === 'size') {
            this.productORInfo1.productSize = value;
        } else if (field === 'sex') {
            this.productORInfo1.productSex = value;
        }
        // console.log(this.productORInfo1);
        this.barcodeStr = this.style+this.targetPlace+this.countryID
                            +this.year+this.c1+this.c2
                            +this.c3+this.c4+this.c5+this.size+this.sex;
        // this.userService.formatProductBarcodeString(this.barcodeStr);
        this.productORInfo1.productBarcode = this.barcodeStr;
        this.productORInfo1.factoryID = this.factorySelectForOrderStyle.factoryID;
    }

    checkAddBtn() {
        // this.targetPlace = '----';
        // this.countryID = '-----';
        // this.year = '--';
        // this.c1 = '--';
        // this.c2 = '--';
        // this.c3 = '--';
        // this.c4 = '--';
        // this.c5 = '--';
        // this.size = '---';
        // this.sex = '-';
        // this.runNo = '#####';
        if (this.targetPlace === '----' || this.year === '--' || this.c1 === '--'
            || this.size === '---' || this.productORInfo1.productQty === 0) {
            return true;
        }
        return false;
    }

    addProductORInfo() {
        // console.log(this.productORInfo1);
        this.order.productOR.productORInfo = this.order.productOR.productORInfo?this.order.productOR.productORInfo:[];
        this.order.productOR.productORInfo.push(this.productORInfo1);
        // this.productORInfo1 = this.userService.clrProductORInfo();

        // ## check duplicates data of rder.productOR.productORInfo
        // ## check productORInfo / delete for duplicate record
        const productORInfo = [...this.order.productOR.productORInfo];
        let productORInfo1: ProductORInfo[]  = [];
        productORInfo.forEach( (item1, index1) => {
            const idx = productORInfo1.findIndex( fi =>(
                fi.productBarcode === item1.productBarcode
                // && fi.targetPlace === item1.targetPlace
                // && fi.productColor === item1.productColor
                // && fi.productSize === item1.productSize
            ));
            if (idx < 0) {
                productORInfo1.push(item1);
            } else {
                productORInfo1[idx] = item1;
            }
        });
        this.order.productOR.productORInfo = productORInfo1;
        // console.log(this.order.productOR.productORInfo);

        this.productORInfoFilter();
        this.sortOrderProductORInfo();
        this.clrQRCode();
    }

    checkTargetSelected() {
        if (this.targetPlace === '----') {
            return false;
        }
        return true;
    }

    checkYearSelected() {
        if (this.year === '--') {
            return false;
        }
        return true;
    }

    checkColorSelected(cN: string) {
        if (cN === 'c1' && this.c1 === '--') {
            return false;
        } else if (cN === 'c2' && this.c2 === '--') {
            return false;
        } else if (cN === 'c3' && this.c3 === '--') {
            return false;
        } else if (cN === 'c4' && this.c4 === '--') {
            return false;
        } else if (cN === 'c5' && this.c5 === '--') {
            return false;
        }
        return true;
    }

    checkSizeSelected() {
        if (this.size === '---') {
            return false;
        }
        return true;
    }

    checkSexSelected() {
        if (this.sex === '-') {
            return false;
        }
        return true;
    }

    formatProductBarcodeString(str: string) {
        const strFormat =  this.userService.formatProductBarcodeString(str);
        return strFormat;
    }

    getBackgroudColor(colorCode: string) {
        const colorValue =  this.userService.getColorByColorCode(colorCode);
        return 'background-color: '+colorValue;
    }

    prepareData() {
        // ## get customer
        // getCustomerOrder1(companyID: string, customerID: string)
        // console.log('222');
        this.customerService.getCustomerOrder1(this.company.companyID, this.order.customerOR.customerID);

        // ## get product

        // ## factory
        this.factorySelected = this.userService.getFactoryIDArrByFactoryID(this.userService.getFactories(), this.order.factoryID);
        this.factorySelectForOrderStyle= {...this.factorySelected};

        // this.userService.setOrderProductSelect(product)
        // getProductOrder1(companyID: string, productID: string)
        this.productService.getProductOrder1(this.company.companyID, this.order.productOR.productID);
        // getOrderProductSelectUpdatedListener()
        if (this.orderProductSelectSub) { this.orderProductSelectSub.unsubscribe(); }
        this.orderProductSelectSub = this.userService.getOrderProductSelectUpdatedListener().subscribe((data) => {
            // console.log('333');
            this.product = data.product;
            // this.style = this.product.productCustomerCode.toUpperCase();
            this.style = this.order.orderID;
            this.style = this.userService.setAddBackStrLen(this.style, this.userService.styleLen, ' ');
            // console.log(this.product);
            // this.userService.setAddBackStrLen();
            // setAddBackStrLen(this.style, this.userService.styleLen, ' ');
        });
    }

    calTotal(productQty: number, productLossQty: number) {
        let total = 0;
        const productQtyF = productQty ? +productQty : 0;
        const productLossQtyF = productLossQty ? +productLossQty : 0;
        return productQtyF + productLossQtyF;
    }

    // postOrderCreateNew(userID: string, order: Order)
    postOrderCreateNew() {
        this.messageService.clear();
        // ## setting order data
        this.order.seasonYear = this.product.seasonYear;
        this.order.ver = this.userService.verCurrent;
        this.order.orderDate = this.orderDate;
        this.order.deliveryDate = this.orderDate;
        this.order.companyID = this.company.companyID;
        this.order.factoryID = this.factorySelected.factoryID;
        this.order.customerOR.customerID = this.customer.customerID;
        this.order.customerOR.customerName = this.customer.customerName;
        this.order.productOR.productID = this.product.productID;
        this.order.productOR.productName = this.product.productName;
        this.order.productOR.productCustomerCode = this.product.productCustomerCode;
        this.order.productOR.productORInfo = [];
        this.order.createBy = this.userService.getCreateBy();

        if (this.customer.customerID !== '-' && this.product.productID !== '-'
            && this.order.orderID.trim() !== '') {
            this.orderService.postOrderCreateNew(this.userID, this.order);
            if (this.orderSub) { this.orderSub.unsubscribe(); }
            this.orderSub = this.orderService.getCustomerUpdatedListener().subscribe((data) => {
                // console.log(data);
                this.order = data.order;
                this.productORInfoOld = this.order.productOR.productORInfo?[...this.order.productOR.productORInfo]:[];
                // this.order.productOR.productORInfo?[...this.order.productOR.productORInfo]:[];
                this.productORInfoFilter();
                this.sortOrderProductORInfo();
                this.orderDate = new Date(this.order.orderDate);
                this.orderMode = 'edit-order';
                // console.log(this.order);

                this.messageService.add({
                    severity:'success',
                    summary:'create order',
                    detail:'completed'
                });
            });
        } else {
            if (this.customer.customerID === '-') {
                this.messageService.add({severity:'warn', summary:'Please ', detail:'select Customer'});
            }
            if (this.product.productID === '-') {
                this.messageService.add({severity:'warn', summary:'Please ', detail:'select Product'});
            }
            if (this.order.orderID.trim() === '') {
                this.messageService.add({severity:'warn', summary:'Please ', detail:'key orderID'});
            }

        }

    }

    // putOrderUpdate(userID: string, order: Order)
    putOrderUpdate() {
        this.tempFullProductORInfo = this.order.productOR.productORInfo?[...this.order.productOR.productORInfo]:[];
        const arrayObjOne =[...this.tempFullProductORInfo]
        const arrayObjTwo = [...this.productORInfoOld]

        // console.log(arrayObjOne, arrayObjTwo);

        // // Array Object 1
        // const arrayObjOne = [
        //     { userId: "1", display: "Jamsheer" },
        //     { userId: "2", display: "Muhammed" },
        //     { userId: "3", display: "Ravi" },
        //     { userId: "4", display: "Ajmal" },
        //     { userId: "5", display: "Ryan" }
        // ]

        // // Array Object 2
        // const arrayObjTwo =[
        //     { empId: "1", display: "Jamsheer", designation:"Jr. Officer" },
        //     { empId: "2", display: "Muhammed", designation:"Jr. Officer" },
        //     { empId: "3", display: "Ravi", designation:"Sr. Officer" },
        //     { empId: "4", display: "Ajmal", designation:"Ast. Manager" },
        // ]
        // const existed = this.orderProductionScan1.scanItem.some(i => i.productBarcodeNo === scanItem.productBarcodeNo);
        // const ResultArrayObjOne = arrayObjOne.filter(({ productBarcode: productBarcode1}) => !arrayObjTwo.some(({ productBarcode: productBarcode2 }) => productBarcode1 === productBarcode2));
        const ResultArrayObjOne = arrayObjOne.filter(i=>(!arrayObjTwo.some(i2 => i.productBarcode === i2.productBarcode && i.targetPlace.countryID === i2.targetPlace.countryID)));
        // console.log(ResultArrayObjOne);

        // ## check duplicates data of rder.productOR.productORInfo
        // ## check productORInfo / delete for duplicate record
        const productORInfo = [...ResultArrayObjOne];
        let productORInfo1: ProductORInfo[]  = [];
        productORInfo.forEach( (item1, index1) => {
            const idx = productORInfo1.findIndex( fi =>(
                fi.productBarcode === item1.productBarcode
                // && fi.targetPlace === item1.targetPlace
                // && fi.productColor === item1.productColor
                // && fi.productSize === item1.productSize
            ));
            if (idx < 0) {
                productORInfo1.push(item1);
            } else {
                productORInfo1[idx] = item1;
            }
        });

        this.messageService.clear();
        // ## setting order data
        let order = this.order;
        order.productOR.productORInfo = productORInfo1;
        order.orderDate = this.orderDate;
        order.deliveryDate = this.orderDate;
        order.companyID = this.company.companyID;
        // this.order.productOR.productORInfo = this.;
        this.orderService.putOrderUpdate(this.userID, order);
        if (this.orderSub) { this.orderSub.unsubscribe(); }
        this.orderSub = this.orderService.getCustomerUpdatedListener().subscribe((data) => {
            this.order = data.order;
            this.productORInfoOld = this.order.productOR.productORInfo?[...this.order.productOR.productORInfo]:[];
            this.productORInfoFilter();
            this.sortOrderProductORInfo();
            this.orderDate = new Date(this.order.orderDate);
            this.orderMode = 'edit-order';
            // console.log(this.order);
            this.getRepCompanyOrder();

            this.messageService.add({
                severity:'success',
                summary:'edit order',
                detail:'completed'
            });
        });
    }

    genImagePath(imgPath: string) {
    //    this.mode = 'edit-order';
        if (imgPath) {
            if (imgPath.length > 0) {
                return this.productImageProfileGCSPath + imgPath;
            }
        }

        return GBC.nulltGCSPath;
    }

    changeMode(mode: string) {
        this.mode = mode;
    }

    selectOrderDate() {
        // console.log('selectOrderDate');
        // console.log(this.orderDate);
    }

    transformToCountryID(element: string) {
        return element.split("/")[1];
    }

    productORInfoFilter() {
        // this.order.productOR.productORInfo?[...this.order.productOR.productORInfo]:[];
        this.tempFullProductORInfo = this.order.productOR.productORInfo?[...this.order.productOR.productORInfo]:[];
        if (this.styleS.length > 0) {
            this.tempFullProductORInfo = this.tempFullProductORInfo.filter(i=>(this.styleS.includes(i.productBarcode.substr(0, 12).trim())));
        }
        if (this.targetPlaceS.length > 0) {
            const targetPlaceNewS = this.targetPlaceS.map(this.transformToCountryID)
            this.tempFullProductORInfo = this.tempFullProductORInfo.filter(i=>(targetPlaceNewS.includes(i.targetPlace.countryID)));
        }
        if (this.colorS.length > 0) {
            this.tempFullProductORInfo = this.tempFullProductORInfo.filter(i=>(this.colorS.includes(i.productColor)));
        }
        if (this.sizeS.length > 0) {
            this.tempFullProductORInfo = this.tempFullProductORInfo.filter(i=>(this.sizeS.includes(i.productSize)));
        }
    }

    showProductfilterModal() {
        const showList: string[] = ['style', 'zone', 'color', 'size'];
        const ref = this.dialogService.open(SProductFilterComponent, {
            data: {
                id: 'productFilter',
                showList: showList,
                company: this.userService?.getCompany(),
                order: this.order,
                callfrom: this.formName,  // ## send to nodejs for choose buckets
                styleS: this.styleS,
                targetPlaceS: this.targetPlaceS,
                colorS: this.colorS,
                sizeS: this.sizeS
            },
            header: 'Product Filter [ ' + this.order.productOR.productID + ' ]',
            width: '80%'
        });

        ref.onClose.subscribe((data: any) => {
            // console.log(data);
            if (data) {
                this.styleS = data.styleS;
                this.targetPlaceS = data.targetPlaceS;
                this.colorS = data.colorS;
                this.sizeS = data.sizeS;
                this.productORInfoFilter();
            } else {
                this.styleS = [];
                this.targetPlaceS = [];
                this.colorS = [];
                this.sizeS = [];
                this.productORInfoFilter();
            }
            // this.targetPlace =
            //     this.userService.setAddBackStrLen(targetPlace.targetPlace.targetPlaceID, 4, '-').toUpperCase();
            // console.log(targetPlace);
            // editProductORInfo(field: string, value: string, targetPlace: TargetPlace)
            // this.editProductORInfo('targetPlace','',targetPlace.targetPlace);
        });
    }

    showFactorySelectionModal() {
        if (this.orderMode === 'create-order') {

            const ref = this.dialogService.open(SSelectFactoryComponent, {
                data: {
                    id: 'factorySelection',
                    company: this.userService?.getCompany(),
                    callfrom: this.formName,  // ## send to nodejs for choose buckets
                    btnCaption: 'choose'

                },
                header: 'Factory Selection',
                width: '80%',
            });

            ref.onClose.subscribe((factory: Factory) => {
                if (factory) {
                    this.factorySelected = {...factory};
                    this.factorySelectForOrderStyle = {...this.factorySelected};
                    // this.userService.setOrderCustomerSelect(customer);
                }
            });
        }
    }

    showFactoryOrderStyleSelectionModal() {
        if (this.orderMode === 'edit-order') {

            const ref = this.dialogService.open(SSelectFactoryComponent2, {
                data: {
                    id: 'factoryOrderStyleSelection',
                    company: this.userService?.getCompany(),
                    callfrom: this.formName,  // ## send to nodejs for choose buckets
                    btnCaption: 'choose'

                },
                header: 'edit Order style Factory Selection',
                width: '80%',
            });

            ref.onClose.subscribe((factory: Factory) => {
                if (factory) {
                    // console.log(factory);
                    this.factorySelectForOrderStyle = {...factory};
                    // this.userService.setOrderCustomerSelect(customer);
                }
            });
        }
    }

    showCustomerSelectionModal() {
        if (this.orderMode === 'create-order') {

            const ref = this.dialogService.open(SSelectCustomerComponent, {
                data: {
                    id: 'customersSelection',
                    company: this.userService?.getCompany(),
                    callfrom: this.formName,  // ## send to nodejs for choose buckets
                    btnCaption: 'choose'

                },
                header: 'Customer Selection',
                width: '80%',
            });

            ref.onClose.subscribe((customer: Customer) => {
                if (customer) {
                    this.customer = customer;
                    this.userService.setOrderCustomerSelect(customer);
                }
            });
        }
    }

    showProductSelectionModal() {
        if (this.orderMode === 'create-order') {
            const ref = this.dialogService.open(SSelectProductComponent, {
                data: {
                    id: 'productsSelection',
                    company: this.userService?.getCompany(),
                    callfrom: this.formName,  // ## send to nodejs for choose buckets
                    btnCaption: 'choose'

                },
                header: 'Product Selection',
                width: '80%',
            });

            ref.onClose.subscribe((product: Product) => {
                if (product) {
                    this.product = product;
                    // this.style = this.product.productCustomerCode.toUpperCase();
                    this.style = this.order.orderID;
                    this.style = this.userService.setAddBackStrLen(this.style, this.userService.styleLen, ' ');
                    this.userService.setOrderProductSelect(product)
                }

            });
        }
    }

    showTargetPlaceSelectionModal() {
        const ref = this.dialogService.open(SSelectTargetPlaceComponent, {
            data: {
                id: 'targetPlacesSelection',
                company: this.userService?.getCompany(),
                callfrom: this.formName,  // ## send to nodejs for choose buckets
                btnCaption: 'choose'

            },
            header: 'TargetPlace Selection',
            width: '50%',
        });

        ref.onClose.subscribe((targetPlace: TargetPlaceS) => {
            if (targetPlace) {
                this.targetPlace =
                    this.userService.setAddBackStrLen(targetPlace.targetPlace.targetPlaceID, 4, '-').toUpperCase();
                this.countryID =
                    this.userService.setAddBackStrLen(targetPlace.targetPlace.countryID, 5, '-').toUpperCase();

                // console.log(targetPlace);
                // editProductORInfo(field: string, value: string, targetPlace: TargetPlace)
                this.editProductORInfo('targetPlace','',targetPlace.targetPlace);
            }
        });
    }

    showSizeSelectionModal() {
        const ref = this.dialogService.open(SSelectSizeComponent, {
            data: {
                id: 'sizeSelection',
                company: this.userService?.getCompany(),
                callfrom: this.formName,  // ## send to nodejs for choose buckets
                btnCaption: 'choose'

            },
            header: 'Size Selection',
            width: '30%',
        });

        ref.onClose.subscribe((size: SizeS) => {
            if (size) {
                this.size = this.userService.setAddBackStrLen(size.size.sizeID, 3, '-').toUpperCase();
                // editProductORInfo(field: string, value: string, targetPlace: TargetPlace)
                this.editProductORInfo('size',this.size,this.targetPlaceTmp);
            }
        });
    }

    showYearSelectionModal() {
        const ref = this.dialogService.open(SSelectYearComponent, {
            data: {
                id: 'yearSelection',
                company: this.userService?.getCompany(),
                callfrom: this.formName,  // ## send to nodejs for choose buckets
                btnCaption: 'choose'

            },
            header: 'Year Selection',
            width: '50%',
        });

        ref.onClose.subscribe((year: any) => {
            if (year) {
                // console.log(year);
                this.year = this.userService.strLast(year, 2);
                // editProductORInfo(field: string, value: string, targetPlace: TargetPlace)
                this.editProductORInfo('year',this.year,this.targetPlaceTmp);
            }
        });
    }

    showSexSelectionModal() {
        const ref = this.dialogService.open(SSelectSexComponent, {
            data: {
                id: 'sexSelection',
                company: this.userService?.getCompany(),
                callfrom: this.formName,  // ## send to nodejs for choose buckets
                btnCaption: 'choose'

            },
            header: 'Sex Selection',
            width: '40%',
        });

        ref.onClose.subscribe((sex: any) => {
            if (sex) {
                this.sex = sex.toUpperCase();;
                // editProductORInfo(field: string, value: string, targetPlace: TargetPlace)
                this.editProductORInfo('sex',this.sex,this.targetPlaceTmp);
            }
        });
    }

    showColorSelectionModal(colorNo: string) {
        let showDialog = false;
        if (colorNo === 'c1') {
            this.c2 = '--';
            this.c3 = '--';
            this.c4 = '--';
            this.c5 = '--';
            showDialog = true;
        } else if (colorNo === 'c2' && this.c1 != '--') {
            this.c2 = '--';
            this.c3 = '--';
            this.c4 = '--';
            this.c5 = '--';
            showDialog = true;
        } else if (colorNo === 'c3' && this.c1 != '--' && this.c2 != '--') {
            this.c3 = '--';
            this.c4 = '--';
            this.c5 = '--';
            showDialog = true;
        } else if (colorNo === 'c4' && this.c1 != '--' && this.c2 != '--' && this.c3 != '--') {
            this.c4 = '--';
            this.c5 = '--';
            showDialog = true;
        } else if (colorNo === 'c5' && this.c1 != '--' && this.c2 != '--' &&
                                        this.c3 != '--' && this.c4 != '--') {
            this.c5 = '--';
            showDialog = true;
        }

        if (showDialog) {
            const ref = this.dialogService.open(SSelectColorComponent, {
                data: {
                    id: 'colorSelection',
                    company: this.userService?.getCompany(),
                    callfrom: this.formName,  // ## send to nodejs for choose buckets
                    btnCaption: 'choose',
                    colorNo: colorNo

                },
                header: 'Color Selection',
                width: '60%',
            });

            ref.onClose.subscribe((data: any) => {
                if (data) {
                    // console.log(data);
                    if (data.colorNo === 'c1') {
                        this.c1 = data.color.color.colorID.toUpperCase();
                        this.editProductORInfo('c1',this.c1,this.targetPlaceTmp);
                    }
                    else if (data.colorNo === 'c2') {
                        this.c2 = data.color.color.colorID.toUpperCase();
                        this.editProductORInfo('c2',this.c2,this.targetPlaceTmp);
                    }
                    else if (data.colorNo === 'c3') {
                        this.c3 = data.color.color.colorID.toUpperCase();
                        this.editProductORInfo('c3',this.c3,this.targetPlaceTmp);
                    }
                    else if (data.colorNo === 'c4') {
                        this.c4 = data.color.color.colorID.toUpperCase();
                        this.editProductORInfo('c4',this.c4,this.targetPlaceTmp);
                    }
                    else if (data.colorNo === 'c5') {
                        this.c5 = data.color.color.colorID.toUpperCase();
                        this.editProductORInfo('c5',this.c5,this.targetPlaceTmp);
                    }
                }
            });
        }
    }

    showLabelQRCodeCreateModal() {
        // const ref = this.dialogService.open(SLabelQrcodeComponent, {
        //     data: {
        //         id: 'labelQRCodeCreation',
        //         company: this.userService?.getCompany(),
        //         callfrom: this.formName,  // ## send to nodejs for choose buckets
        //         btnCaption: 'choose'

        //     },
        //     header: '',
        //     width: '100%',
        // });

        // ref.onClose.subscribe((sex: any) => {
        //     // this.sex = sex.toUpperCase();;
        //     // editProductORInfo(field: string, value: string, targetPlace: TargetPlace)
        //     // this.editProductORInfo('sex',this.sex,this.targetPlaceTmp);
        // });
    }

    clrQRCode() {
        const targetPlace = this.productORInfo1.targetPlace;
        const productColor = this.productORInfo1.productColor;
        const productYear = this.productORInfo1.productYear;
        const productSex = this.productORInfo1.productSex;
        this.productORInfo1 = GBC.clrProductORInfo();
        this.barcodeStr = '';
        // this.style = this.product.productCustomerCode.toUpperCase();
        this.style = this.order.orderID;
        this.style = this.userService.setAddBackStrLen(this.style, this.userService.styleLen, ' ');
        this.productORInfo1.productColor = productColor;
        this.productORInfo1.productYear = productYear;
        this.productORInfo1.productSex = productSex;
        this.productORInfo1.targetPlace = targetPlace;

        // this.targetPlace = '----';
        // this.year = '--';
        // this.c1 = '--';
        // this.c2 = '--';
        // this.c3 = '--';
        // this.c4 = '--';
        // this.c5 = '--';
        this.size = '---';
        // this.sex = '-';
        this.runNo = '#####';
    }

    // goto(path: string, order: Order) {
    //     // routerLink: ['/user/ucompany/order/edit'],
    //     this.orderService.setOrder(order);  // ## set order selected
    //     const orderID = 'order test id';
    //     const params: NavigationExtras = {
    //         queryParams: { orderID: orderID},
    //     };
    //     this.router.navigate([path], params);
    // }

    ngOnDestroy(): void {
        if (this.orderSub) { this.orderSub.unsubscribe(); }
        if (this.orderProductSelectSub) { this.orderProductSelectSub.unsubscribe(); }
        if (this.repCompanyOrderSub) { this.repCompanyOrderSub.unsubscribe(); }
        if (this.repCompanyOrderSub) { this.repCompanyOrderSub.unsubscribe(); }
        if (this.repCompanyOrder1Sub) { this.repCompanyOrder1Sub.unsubscribe(); }
        // if (this.errSub) { this.errSub.unsubscribe(); }
        // if (this.langSub) { this.langSub.unsubscribe(); }
        // if (this.screenSub) { this.screenSub.unsubscribe(); }
    }
}
