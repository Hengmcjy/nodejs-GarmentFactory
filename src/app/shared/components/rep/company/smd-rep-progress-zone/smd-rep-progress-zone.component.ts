import { Component, OnDestroy, OnInit } from '@angular/core';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Subscription } from 'rxjs';
import { GBC } from 'src/app/global/const-global';
import { Company, TargetPlaceS } from 'src/app/models/app.model';
import { Order } from 'src/app/models/order.model';
import { CompanyCurrentProductQtyAll, CurrentCompanyOrder, CurrentCompanyProductQtyCountryAll, CurrentCompanyProductQtyCountryCSAll, CurrentCompanyProductQtyZoneAll, CurrentOrderStyle, CurrentProductQtyAllC, OrderStyleColorSize } from 'src/app/models/report.model';
import { ReportService } from 'src/app/services/report.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-smd-rep-progress-zone',
  templateUrl: './smd-rep-progress-zone.component.html',
  styleUrls: ['./smd-rep-progress-zone.component.scss']
})
export class SmdRepProgressZoneComponent implements OnInit, OnDestroy {

    data: any;
    blockedPanel = true;

    mode = ''; // ## show-zone-progress
    companyID = '';
    factoryIDs: string[] = [];
    orderID = '';
    company: Company = GBC.clrCompany();
    order: Order = GBC.clrOrder();

    targetPlaces: TargetPlaceS[] = [];

    orderStyleColorSize: OrderStyleColorSize[] = [];
    currentOrderStyle: CurrentOrderStyle[] = [];
    companyCurrentProductQtyAll: CompanyCurrentProductQtyAll[] = [];
    currentCompanyProductQtyZoneAll: CurrentCompanyProductQtyZoneAll[] = [];
    currentCompanyProductQtyZoneCompleteAll: CurrentCompanyProductQtyZoneAll[] = [];
    currentCompanyProductQtyCountryAll: CurrentCompanyProductQtyCountryAll[] = [];
    currentCompanyProductQtyCountryCompleteAll: CurrentCompanyProductQtyCountryAll[] = [];
    currentCompanyProductQtyCountryCSAll: CurrentCompanyProductQtyCountryCSAll[] = [];
    currentCompanyProductQtyCountryCSCompleteAll: CurrentCompanyProductQtyCountryCSAll[] = [];

    currentProductQtyAllC: CurrentProductQtyAllC[] = [];
    currentProductQtyAllCompleteC: CurrentProductQtyAllC[] = [];
    currentAllProductQtyStyleGroup: any[] = [];
    currentAllProductQtyStyleCompleteGroup: any[] = [];

    currentAllProductQtyCountryCSGroup: any[] = [];
    currentAllProductQtyCountryCSCompleteGroup: any[] = [];
    currentCompanyOrderCountry: CurrentCompanyOrder[] = [];
    currentCompanyOrderZone: CurrentCompanyOrder[] = [];
    currentCompanyOrderZoneStyle: CurrentCompanyOrder[] = [];
    currentCompanyOrderCountryStyle: CurrentCompanyOrder[] = [];

    colorBArTxt = [
        {barColor: 'bg-green-500', barTxt: 'success', fontBarColor: 'text-0',},
        {barColor: 'bg-yellow-100', barTxt: 'production', fontBarColor: 'text-400',},
        {barColor: 'bg-blue-400', barTxt: 'remaining order', fontBarColor: 'text-0',},
    ];
    dataOrder: any[] = [];
    dataOrderSelected: any[] = [];
    emptyDataOrder: any =
        {
            orderID: '',
            zone: '',
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

    private repCompanyProductionSub: Subscription = new Subscription;

    constructor(
        public config: DynamicDialogConfig,
        public ref: DynamicDialogRef,
        // public dialogService: DialogService,
        // public messageService: MessageService,

        public userService: UserService,
        // private productService: ProductService,
        // private orderService: OrderService,
        // private cusService: CustomerService,
        private repService: ReportService,
    ) {}

    ngOnInit(): void {
        this.data = this.config.data;
        this.companyID = this.data.companyID;
        this.orderID = this.data.orderID;
        this.mode = this.data.mode;
        this.colorBArTxt = this.data.colorBArTxt;
        this.dataOrderSelected = this.data.dataOrderSelected;

        this.factoryIDs = this.userService.getFactoryIDArr(this.userService.getFactories());

        this.company = this.userService.getCompany();
        this.order = this.userService.getOrderByID(this.orderID);

        this.targetPlaces  = this.userService.genTargetPlace(this.order.orderTargetPlace);
        // console.log(this.targetPlaces);

        this.getRepCurrentProductQtyCom();
    }

    getRepCurrentProductQtyCom() {
        // console.log('getRepCurrentProductQtyCom');
        this.blockedPanel = true;
        // this.lastColor = '';
        // this.orders = [];
        const ordertatus = ['open'];
        const productStatus = ['normal', 'problem', 'repaired'];
        const orderIDArr = [this.orderID];
        const seasonYear = this.userService.seasonYear;
        this.repService.getRepCurrentProductQtyCom(this.company.companyID, this.factoryIDs, productStatus, ordertatus, orderIDArr, seasonYear);
        if (this.repCompanyProductionSub) { this.repCompanyProductionSub.unsubscribe(); }
        this.repCompanyProductionSub = this.repService.getRepCurrentCompanyProductQtyAllUpdatedListener().subscribe((data) => {
            // console.log(data);
            this.blockedPanel = false;
            this.orderStyleColorSize = data.orderStyleColorSize;
            this.currentOrderStyle = data.currentOrderStyle;
            this.currentOrderStyle.sort((a,b)=>{ return a.style >b.style?1:a.style <b.style?-1:0 });
            // console.log(this.currentOrderStyle);

            this.companyCurrentProductQtyAll = data.companyCurrentProductQtyAll;

            this.currentCompanyOrderCountry = data.currentCompanyOrderCountry;
            this.currentCompanyOrderZone = data.currentCompanyOrderZone;

            this.currentCompanyOrderZoneStyle = data.currentCompanyOrderZoneStyle;
            this.currentCompanyOrderCountryStyle = data.currentCompanyOrderCountryStyle;

            this.currentCompanyProductQtyZoneAll = data.currentCompanyProductQtyZoneAll;
            this.currentCompanyProductQtyZoneCompleteAll = data.currentCompanyProductQtyZoneCompleteAll;

            this.currentProductQtyAllC = data.currentProductQtyAllC;
            this.currentProductQtyAllCompleteC = data.currentProductQtyAllCompleteC;

            this.currentCompanyProductQtyCountryAll = data.currentCompanyProductQtyCountryAll;
            this.currentCompanyProductQtyCountryCompleteAll = data.currentCompanyProductQtyCountryCompleteAll;

            this.currentCompanyProductQtyCountryCSAll = data.currentCompanyProductQtyCountryCSAll;
            this.currentCompanyProductQtyCountryCSCompleteAll = data.currentCompanyProductQtyCountryCSCompleteAll;

            // this.orderIDs = Array.from(new Set(this.currentCompanyOrderCountry.map((item: any) => item.orderID)));
            // this.getOrdersByOrderIDs(this.orderIDs);

            // ## replace - to empty
            this.currentCompanyOrderZone.forEach( (item, index) => {
                item.productSize = this.userService.strReplaceAll(item.productSize, '-', '');
                // item.color = this.userService.strReplaceAll(item.color, '-', '');
                item.targetPlaceID = this.userService.strReplaceAll(item.targetPlaceID, '-', '');
            });
            this.currentCompanyOrderCountry.forEach( (item, index) => {
                item.productSize = this.userService.strReplaceAll(item.productSize, '-', '');
                item.countryID = this.userService.strReplaceAll(item.countryID, '-', '');
                item.targetPlaceID = this.userService.strReplaceAll(item.targetPlaceID, '-', '');
            });
            this.currentCompanyOrderZoneStyle.forEach( (item, index) => {
                // item.productSize = this.userService.strReplaceAll(item.productSize, '-', '');
                // item.color = this.userService.strReplaceAll(item.color, '-', '');
                item.targetPlaceID = this.userService.strReplaceAll(item.targetPlaceID, '-', '');
            });
            this.currentCompanyOrderCountryStyle.forEach( (item, index) => {
                // item.productSize = this.userService.strReplaceAll(item.productSize, '-', '');
                // item.color = this.userService.strReplaceAll(item.color, '-', '');
                item.targetPlaceID = this.userService.strReplaceAll(item.targetPlaceID, '-', '');
            });


            // ## replace - to empty --- currentCompanyProductQtyZoneAll
            this.currentCompanyProductQtyZoneAll.forEach( (item, index) => {
                item.targetPlace = this.userService.strReplaceAll(item.targetPlace, '-', '');
            });
            this.currentCompanyProductQtyZoneCompleteAll.forEach( (item, index) => {
                item.targetPlace = this.userService.strReplaceAll(item.targetPlace, '-', '');
            });
            this.currentCompanyProductQtyCountryAll.forEach( (item, index) => {
                item.countryID = this.userService.strReplaceAll(item.countryID, '-', '');
            });
            this.currentCompanyProductQtyCountryCompleteAll.forEach( (item, index) => {
                item.countryID = this.userService.strReplaceAll(item.countryID, '-', '');
            });

            // ## replace - to empty
            this.currentProductQtyAllC.forEach( (item, index) => {
                item.size = this.userService.strReplaceAll(item.size, '-', '');
                item.color = this.userService.strReplaceAll(item.color, '-', '');
                item.targetPlace = this.userService.strReplaceAll(item.targetPlace, '-', '');
            });

            this.genZoneOverviewProgressBar();
        });
    }

    findDataOrder(orderID: string, zone: string) {
        // console.log(orderID);
        const dataOrder1 = this.dataOrder.filter(i=>i.orderID == orderID && i.zone == zone);
        if (dataOrder1.length > 0) {
            return dataOrder1;
        }
        return [this.emptyDataOrder];
    }

    genZoneOverviewProgressBar() {
        this.dataOrder = [];
        // this.colorBArTxt = [
        //     {barColor: 'bg-green-500', barTxt: 'success', fontBarColor: 'text-0'},
        //     {barColor: 'bg-yellow-100', barTxt: 'production', fontBarColor: 'text-400',},
        //     {barColor: 'bg-blue-400', barTxt: 'remaining order', fontBarColor: 'text-0',},
        // ];

        this.targetPlaces.forEach( (item, index) => {
            const totalQty = this.findCompanyOrderQtyZoneAll(item.targetPlace.targetPlaceID);
            const completeQty = this.findCompanyProductQtyZoneCompleteAll(item.targetPlace.targetPlaceID);
            const inProductionQty = this.findCompanyProductQtyZoneAll(item.targetPlace.targetPlaceID);
            const remainQty = this.findCompanyOrderQtyZoneRemainAll(item.targetPlace.targetPlaceID);
            // console.log(totalQty, completeQty, inProductionQty, remainQty);
            const percentPart = this.genPercentPart3(totalQty, completeQty, inProductionQty, remainQty);
            // console.log(percentPart);
            // console.log('1');
            const data1 = {
                orderID: this.orderID,
                zone: item.targetPlace.targetPlaceID,
                caption1: '',
                total1: totalQty,
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
                emptyDataOrder1.orderID = this.orderID;
                emptyDataOrder1.zone = item;
                this.dataOrder.push(emptyDataOrder1);
            } else {
                this.dataOrder.push(data1);
            }
        });
        // console.log(this.dataOrder);
    }

    findCompanyOrderQtyZoneAll(targetPlaceID: string) {
        const currentCompanyOrderZone = this.currentCompanyOrderZoneStyle.filter(i=>(
            i.companyID == this.companyID &&
            i.orderID == this.orderID &&
            i.targetPlaceID == targetPlaceID
        ));
        if (currentCompanyOrderZone.length > 0) {
            return currentCompanyOrderZone[0].sumQty;
        }
        return 0;
    }

    findCompanyProductQtyZoneCompleteAll(targetPlaceID: string) {
        const currentCompanyProductQtyZoneCompleteAllF = this.currentCompanyProductQtyZoneCompleteAll.filter(i=>(
            i.companyID == this.companyID &&
            i.productID.trim() == this.orderID &&
            i.targetPlace == targetPlaceID
        ));
        if (currentCompanyProductQtyZoneCompleteAllF.length > 0) {
            return currentCompanyProductQtyZoneCompleteAllF[0].countQty;
        }
        return 0;
    }

    findCompanyProductQtyZoneAll(targetPlaceID: string) {
        const currentCompanyProductQtyZoneAllF = this.currentCompanyProductQtyZoneAll.filter(i=>(
            i.companyID == this.companyID &&
            i.productID.trim() == this.orderID &&
            i.targetPlace == targetPlaceID
        ));
        if (currentCompanyProductQtyZoneAllF.length > 0) {
            return currentCompanyProductQtyZoneAllF[0].countQty;
        }
        return 0;
    }

    findCompanyOrderQtyZoneRemainAll(targetPlaceID: string) {
        const currentCompanyProductQtyZoneCompleteAllF = this.findCompanyProductQtyZoneCompleteAll(targetPlaceID);
        const currentCompanyProductQtyZoneAllF = this.findCompanyProductQtyZoneAll(targetPlaceID);
        const currentCompanyOrderZone = this.findCompanyOrderQtyZoneAll(targetPlaceID);
        let currentCompanyProductQtyZoneCompleteAll = 0;
        if (currentCompanyProductQtyZoneCompleteAllF === 0) {
            currentCompanyProductQtyZoneCompleteAll = 0
        } else {
            currentCompanyProductQtyZoneCompleteAll = currentCompanyProductQtyZoneCompleteAllF
        }
        let currentCompanyProductQtyZoneAll = 0;
        if (currentCompanyProductQtyZoneAllF === 0) {
            currentCompanyProductQtyZoneAll = 0
        } else {
            currentCompanyProductQtyZoneAll = currentCompanyProductQtyZoneAllF
        }
        const companyOrderQtyZoneRemainAll =
            +currentCompanyOrderZone - +currentCompanyProductQtyZoneCompleteAll - +currentCompanyProductQtyZoneAll;
        if (companyOrderQtyZoneRemainAll < 0) {
            return 0;
        } else {

            return companyOrderQtyZoneRemainAll;
        }
    }

    // ## have 3 section for made percent
    genPercentPart3(total100: number, num1: number, num2: number, num3: number) {
        const percentPart = {
            percent1: Math.floor(((num1 / total100)*100) + 0.49),
            percent2: Math.floor(((num2 / total100)*100) + 0.49),
            // ## remaining percent
            percent3: Math.floor(((num3 / total100)*100) + 0.49) < 0 ? 0 : Math.floor(((num3 / total100)*100) + 0.49)
        };

        // ## adjust percent to 100%
        let tPercent = 0;
        while(tPercent !== 100 ) {
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
        }
        return percentPart;
    }

    closeDialog() {
        const data = {};
        this.ref.close(data);
    }


    ngOnDestroy(): void {
        if (this.repCompanyProductionSub) { this.repCompanyProductionSub.unsubscribe(); }
        // if (this.productImageProfilesSub) { this.productImageProfilesSub.unsubscribe(); }
        // if (this.product1CompanySub) { this.product1CompanySub.unsubscribe(); }
        // if (this.dataAroundAppSub) { this.dataAroundAppSub.unsubscribe(); }

        // if (this.langSub) { this.langSub.unsubscribe(); }
    }
}
