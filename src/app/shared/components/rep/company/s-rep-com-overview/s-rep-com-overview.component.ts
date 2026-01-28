import { Component, OnDestroy, OnInit } from '@angular/core';
import { MessageService } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import { Subscription } from 'rxjs';
import { GBC } from 'src/app/global/const-global';
import { Company, Factory } from 'src/app/models/app.model';
import { Product, ProductImageProfiles } from 'src/app/models/product.model';
import { CompanyCurrentProductQtyAll, CurrentOrderStyle } from 'src/app/models/report.model';
import { ProductEditComponent } from 'src/app/pages/user/ufactory/product/product-edit/product-edit.component';
import { ProductService } from 'src/app/services/product.service';
import { ReportService } from 'src/app/services/report.service';

import { UserService } from 'src/app/services/user.service';
import { SmdRepProgressZoneComponent } from '../smd-rep-progress-zone/smd-rep-progress-zone.component';
import { SmdRepProgressNodeComponent } from '../smd-rep-progress-node/smd-rep-progress-node.component';
import { SmdConfirmImportantTaskComponent } from '../../../general/smd-confirm-important-task/smd-confirm-important-task.component';

@Component({
  selector: 'app-s-rep-com-overview',
  templateUrl: './s-rep-com-overview.component.html',
  styleUrls: ['./s-rep-com-overview.component.scss'],
  providers: [DialogService, MessageService],
})
export class SRepComOverviewComponent implements OnInit, OnDestroy {

    formActive = 'repComOverview';
    pageActive = this.formActive;
    formName = this.formActive;

    reportHeader = 'report overview';
    blockedPanel = true;

    company: Company = GBC.clrCompany();
    factories: Factory[] = [];
    factoryIDs: string[] = [];

    orderIDArr: string[] = [];
    currentOrderStyle: CurrentOrderStyle[] = [];
    currentFactoryOrder: any[] = [];
    companyCurrentProductQtyAll: CompanyCurrentProductQtyAll[] = [];
    productImageProfiles: ProductImageProfiles[] = [];
    productImageProfileGCSPath = GBC.productImageProfileGCSPath;  // ## google storage path

    private dataAroundAppSub: Subscription = new Subscription;
    private overviewSub: Subscription = new Subscription;
    private productImageProfilesSub: Subscription = new Subscription;
    private product1CompanySub: Subscription = new Subscription;

    colorBArTxt = [
        {barColor: 'bg-green-500', barTxt: 'success', fontBarColor: 'text-0',},
        {barColor: 'bg-yellow-100', barTxt: 'production', fontBarColor: 'text-400',},
        {barColor: 'bg-blue-400', barTxt: 'remaining order', fontBarColor: 'text-0',},
    ];

    dataOrder: any[] = [];
    emptyDataOrder: any =
        {
            orderID: '',
            caption1: '',
            total1: 0,
            totalUnit: ' pcs',
            dataObjectArr : [
                {
                    var1: '0%',
                    qty1: '',
                    varTxt1: 'width: 0%',
                    barColor: 'bg-green-500',
                    fontBarColor: 'text-0',
                    barTxt: 'success',
                    barPosition: 'l',
                },

                {
                    var1: '0%',
                    qty1: '',
                    varTxt1: 'width: 0%',
                    barColor: 'bg-yellow-100',
                    fontBarColor: 'text-400',
                    barTxt: 'production',
                    barPosition: 'm',
                },

                {
                    var1: '0%',
                    qty1: '',
                    varTxt1: 'width: 0%',
                    barColor: 'bg-blue-400',
                    fontBarColor: 'text-0',
                    barTxt: 'remaining product',
                    barPosition: 'r',
                },
            ],
        };

    constructor(
        public dialogService: DialogService,
        public messageService: MessageService,

        public userService: UserService,
        private productService: ProductService,
        // private orderService: OrderService,
        // private cusService: CustomerService,
        private repService: ReportService,
    ) {}

    ngOnInit(): void {
        this.company = this.userService.getCompany();
        this.factories = this.userService.getFactories();
        this.factoryIDs = this.userService.getFactoryIDArr(this.factories);
        this.orderIDArr = Array.from(new Set(this.userService.getOrders().map((item: any) => item.orderID)));

        this.getRepCurrentProductionOverview();

        this.dataAroundAppSub = this.userService.getDataAroundAppStatusListener().subscribe(dataAroundApp => {
            // this.getRepCurrentProductionOverview();
        });
    }


    getRepCurrentProductionOverview() {
        // console.log('start getRepCurrentProductionOverview()...');
        this.blockedPanel = true;
        const ordertatus = ['open'];
        const productStatus = ['normal', 'problem', 'repaired'];
        const seasonYear = this.userService.seasonYear;

        // // getRepCurrentCompanyProductOverviewListener()
        // this.repCurrentCompanyProductOverviewUpdated
        this.repService.getRepCurrentProductionOverview(this.company.companyID, this.factoryIDs, productStatus, ordertatus, seasonYear);
        if (this.overviewSub) { this.overviewSub.unsubscribe(); }
        this.overviewSub = this.repService.getRepCurrentCompanyProductOverviewListener().subscribe((data) => {
            this.blockedPanel = false;
            // ## product imageProfile
            this.orderIDArr = Array.from(new Set(this.userService.getOrders().map((item: any) => item.orderID)));
            this.postGetProductImageProfiles(this.orderIDArr);

            // console.log(data);
            this.currentOrderStyle = data.currentOrderStyle;
            this.currentFactoryOrder = data.currentFactoryOrder;  // ## factory lists are relate to the order
            this.currentOrderStyle.sort((a,b)=>{ return a.orderID >b.orderID?1:a.orderID <b.orderID?-1:0 });

            this.companyCurrentProductQtyAll = data.companyCurrentProductQtyAll;

            // console.log(this.currentOrderStyle);
            // console.log(this.currentFactoryOrder);
            // console.log(this.companyCurrentProductQtyAll);

            // this.userService.getFactoryIDArrByFactoryID

            this.genOverviewProgressBar();

            // console.log('----------');
            // console.log(this.dataOrder);
        });
    }



    genOverviewProgressBar() {
        this.dataOrder = [];
        // this.colorBArTxt = [
        //     {barColor: 'bg-green-500', barTxt: 'success', fontBarColor: 'text-0'},
        //     {barColor: 'bg-yellow-100', barTxt: 'production', fontBarColor: 'text-400',},
        //     {barColor: 'bg-blue-400', barTxt: 'remaining order', fontBarColor: 'text-0',},
        // ];

        this.orderIDArr.forEach( (item, index) => {
            // console.log('orderID = ', item);
            const totalQty = this.findOrderTotalQty(item);
            // console.log('a', totalQty);
            const completeQty = this.findProductQtyComplete(this.company.companyID, item, 'complete');
            // console.log('b', completeQty);
            const inProductionQty = this.findProductQtyComplete(this.company.companyID, item, 'inProduction');
            // console.log('c', inProductionQty);
            const remainQty = this.findProductQtyComplete(this.company.companyID, item, 'remain');
            // console.log('d', remainQty);
            // console.log(totalQty, completeQty, inProductionQty, remainQty);

            let percentPart = {
                percent1: 0,
                percent2: 0,
                // ## remaining percent
                percent3: 0
            };
            if (totalQty !== 0) {

                percentPart = this.genPercentPart3(totalQty, completeQty, inProductionQty, remainQty);
                // console.log('e', percentPart);
                // console.log('1');

                const data1 = {
                    orderID: item,
                    caption1: '',
                    total1: this.findOrderTotalQty(item),
                    totalUnit: ' pcs',
                    dataObjectArr : [
                        {
                            var1: percentPart.percent1 + '%',
                            qty1: completeQty,
                            varTxt1: 'width: '+percentPart.percent1+'%',
                            barColor: this.colorBArTxt[0].barColor,
                            fontBarColor: this.colorBArTxt[0].fontBarColor,
                            barTxt: 'success',
                            barPosition: 'l',
                        },
                        {
                            var1: percentPart.percent2 + '%',
                            qty1: inProductionQty,
                            varTxt1: 'width: '+percentPart.percent2+'%',
                            barColor: this.colorBArTxt[1].barColor,
                            fontBarColor: this.colorBArTxt[1].fontBarColor,
                            barTxt: 'in production',
                            barPosition: 'm',
                        },
                        {
                            var1: percentPart.percent3 + '%',
                            qty1: remainQty,
                            varTxt1: 'width: '+percentPart.percent3+'%',
                            barColor: this.colorBArTxt[2].barColor,
                            fontBarColor: this.colorBArTxt[2].fontBarColor,
                            barTxt: 'remaining product',
                            barPosition: 'r',
                        },
                    ]
                };
                if (completeQty + inProductionQty + remainQty <=0) {
                    let emptyDataOrder1 = {...this.emptyDataOrder};
                    emptyDataOrder1.orderID = item;
                    this.dataOrder.push(emptyDataOrder1);
                } else {
                    this.dataOrder.push(data1);
                }
                // console.log(this.dataOrder);
            } else {

            }
        });
    }

    findProductQtyComplete(companyID: string, orderID: string, mode: string) {
        const companyCurrentProductQtyAllF = this.companyCurrentProductQtyAll.filter(i=>(i.orderID == orderID));
        const orderQty1 = this.currentOrderStyle.filter(i=>i.orderID == orderID)[0];
        if (companyCurrentProductQtyAllF.length > 0) {
            if (mode === 'complete') {
                return companyCurrentProductQtyAllF[0].completeQty;
            } else if (mode === 'inProduction') {
                return companyCurrentProductQtyAllF[0].countQty;
            } else if (mode === 'remain') {
                let remain = 0;
                // console.log(currentOrderStyle.sumQty , companyCurrentProductQtyAllF[0].completeQty, companyCurrentProductQtyAllF[0].countQty);
                remain = +orderQty1.sumQty - (+companyCurrentProductQtyAllF[0].completeQty + +companyCurrentProductQtyAllF[0].countQty);
                return remain;
            } else {
                return 0;
            }
        }
        return 0;
    }

    findOrderTotalQty(orderID: string): number {
        const orderQty1 = this.currentOrderStyle.filter(i=>i.orderID == orderID);
        if (orderQty1.length > 0) {
            return orderQty1[0].sumQty;
        }
        return 0;
    }

    // ## have 3 section for made percent
    //              totalQty,       completeQty,    inProductionQty, remainQty
    genPercentPart3(total100: number, num1: number, num2: number, num3: number) {
        const percentPart = {
            percent1: Math.floor(((num1 / total100)*100) + 0.49),
            percent2: Math.floor(((num2 / total100)*100) + 0.49),
            // ## remaining percent
            percent3: Math.floor(((num3 / total100)*100) + 0.49) < 0 ? 0 : Math.floor(((num3 / total100)*100) + 0.49)
        };

        // ## adjust percent to 100%
        let tPercent = 0;
        while(tPercent !== 100) {
            tPercent = percentPart.percent1 + percentPart.percent2 + percentPart.percent3;
            if (tPercent > 100) {
                if (percentPart.percent1 >= percentPart.percent2 && percentPart.percent1 >= percentPart.percent3) {
                    percentPart.percent1 = +percentPart.percent1 - 1;
                } else if (percentPart.percent2 >= percentPart.percent1 && percentPart.percent2 >= percentPart.percent3) {
                    percentPart.percent2 = +percentPart.percent2 - 1;
                } else if (percentPart.percent3 >= percentPart.percent1 && percentPart.percent3 >= percentPart.percent2) {
                    percentPart.percent3 = +percentPart.percent3 - 1;
                }
            }

            if (tPercent < 100) {
                if (percentPart.percent1 >= percentPart.percent2 && percentPart.percent1 >= percentPart.percent3) {
                    percentPart.percent1 = +percentPart.percent1 + 1;
                } else if (percentPart.percent2 >= percentPart.percent1 && percentPart.percent2 >= percentPart.percent3) {
                    percentPart.percent2 = +percentPart.percent2 + 1;
                } else if (percentPart.percent3 >= percentPart.percent1 && percentPart.percent3 >= percentPart.percent2) {
                    percentPart.percent3 = +percentPart.percent3 + 1;
                }
            }
            tPercent = percentPart.percent1 + percentPart.percent2 + percentPart.percent3;
            // console.log('tPercent = ', tPercent);
        }
        return percentPart;
    }

    findDataOrder(orderID: string) {
        // console.log(orderID);
        const dataOrder1 = this.dataOrder.filter(i=>i.orderID == orderID);
        if (dataOrder1.length > 0) {
            return dataOrder1;
        }
        return [this.emptyDataOrder];
    }



    postGetProductImageProfiles(productIDs: string[]) {

        this.productService.postGetProductImageProfiles(this.userService.getCompany().companyID, productIDs);
        if (this.productImageProfilesSub) { this.productImageProfilesSub.unsubscribe(); }
        this.productImageProfilesSub = this.productService.getProductImageProfilesUpdatedListener()
        .subscribe((data) => {
            this.productImageProfiles = data.productImageProfiles;
            // console.log(this.productImageProfiles);
        });
    }

    getProduct1Company(productID: string, companyID: string , mode: string) {
        productID = this.userService.setAddBackStrLen(productID, 12, ' ');
        this.productService.getProduct1(companyID, productID);
        if (this.product1CompanySub) { this.product1CompanySub.unsubscribe(); }
        this.product1CompanySub = this.productService.getUserProductUpdatedListener()
        .subscribe((data) => {
            const product = data.product;
            this.productService.setProduct(product);
            if (mode === 'view') {
                this.showProductSelectionViewModal(product);
            }
        });
    }


    genProductImagePath(productID: string) {
        productID = this.userService.setAddBackStrLen(productID, 12, ' ');
        if (this.productImageProfiles.length > 0) {
            const idx = this.productImageProfiles.findIndex( fi =>(fi.productID === productID));
            if (idx >= 0) {
                return this.productImageProfileGCSPath+this.productImageProfiles[idx].imageProfile;
            } else { return GBC.nulltGCSPath; }
        } else { return GBC.nulltGCSPath; }
    }

    async checkGetProductID(productID: string, mode: string) {
        // get1ProductInfo(productID: string, companyID: string)
        productID = this.userService.setAddBackStrLen(productID, 12, ' ');
        const product: Product = await this.productService.get1ProductInfo(productID, this.company.companyID);
        if (product.productID !== '') {
            this.productService.setProduct(product);
            if (mode === 'view') {
                this.showProductSelectionViewModal(product);
            }
        } else {
            this.getProduct1Company(productID, this.company.companyID, mode);
        }
    }

    showProductSelectionViewModal(product: Product) {
        this.productService.productModeView = true;
        const ref = this.dialogService.open(ProductEditComponent, {
            data: {
                id: 'productView',
                company: this.userService?.getCompany(),
                product: product,
                callfrom: this.formName,  // ## send to nodejs for choose buckets
                modeView: true,


            },
            header: 'Product Info view',
            width: '80%',
        });

        ref.onClose.subscribe((data: any) => {
            // this.productService.productModeView = false;
            // console.log(data);
        });
    }

    getFactoryByOrderID(orderID: string): any[] {
        // let factoriess: any[] = [];
        let factoriess = this.currentFactoryOrder.filter(i=>i.orderID == orderID);
        factoriess.sort((a,b)=>{ return a.factoryID >b.factoryID?1:a.factoryID <b.factoryID?-1:0 });
        return factoriess;
    }

    showRepProgressZoneModal(orderID: string) {
        const dataOrderSelected = this.findDataOrder(orderID);
        const ref = this.dialogService.open(SmdRepProgressZoneComponent, {
            data: {
                id: 'show-zone-progress',
                companyID: this.userService?.getCompany().companyID,
                // callfrom: this.formName,  // ## send to nodejs for choose buckets
                // productBarcode: productBarcode,
                orderID: orderID,
                colorBArTxt: this.colorBArTxt,
                dataOrderSelected: dataOrderSelected,
                // size: size,
                // targetPlace: targetPlace,
                // orderQTY: orderQTY,
                mode: 'show-zone-progress'

            },
            header: ' [Zone Progress] - ' + orderID.toUpperCase(),
            width: '70%',
        });

        ref.onClose.subscribe((data: any) => {
            // console.log(data);
            if (data) {
                // console.log(data.orderQTY);
                // this.putOrderProductionQtyRewrite(productBarcode, color, size, targetPlace, data.orderQTY, orderQTY);
            }
        });
    }

    // SmdRepProgressNodeComponent
    showRepProgressNodeModal(orderID: string) {
        const dataOrderSelected = this.findDataOrder(orderID);
        const ref = this.dialogService.open(SmdRepProgressNodeComponent, {
            data: {
                id: 'show-node-progress',
                companyID: this.userService?.getCompany().companyID,
                // callfrom: this.formName,  // ## send to nodejs for choose buckets
                // productBarcode: productBarcode,
                orderID: orderID,
                colorBArTxt: this.colorBArTxt,
                dataOrderSelected: dataOrderSelected,
                // size: size,
                // targetPlace: targetPlace,
                // orderQTY: orderQTY,
                mode: 'show-node-progress'

            },
            header: ' [Node Progress] - ' + orderID.toUpperCase(),
            width: '70%',
        });

        ref.onClose.subscribe((data: any) => {
            // console.log(data);
            if (data) {
                // console.log(data.orderQTY);
                // this.putOrderProductionQtyRewrite(productBarcode, color, size, targetPlace, data.orderQTY, orderQTY);
            }
        });
    }



    ngOnDestroy(): void {
        if (this.overviewSub) { this.overviewSub.unsubscribe(); }
        if (this.productImageProfilesSub) { this.productImageProfilesSub.unsubscribe(); }
        if (this.product1CompanySub) { this.product1CompanySub.unsubscribe(); }
        if (this.dataAroundAppSub) { this.dataAroundAppSub.unsubscribe(); }

        // if (this.langSub) { this.langSub.unsubscribe(); }
    }
}
