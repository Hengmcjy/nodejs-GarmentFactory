import { Component, OnDestroy, OnInit } from '@angular/core';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Subscription } from 'rxjs';
import { GBC } from 'src/app/global/const-global';
import { Company, TargetPlaceS } from 'src/app/models/app.model';
import { Order } from 'src/app/models/order.model';
import { CompanyCurrentProductQtyAll, CurrentCompanyOrder, CurrentCompanyProductQtyCountryAll, CurrentCompanyProductQtyCountryCSAll, CurrentCompanyProductQtyZoneAll, CurrentOrderStyle, CurrentProductQtyAllC, OrderStyleColorSize } from 'src/app/models/report.model';
import { NodeStationService } from 'src/app/services/node-station.service';
import { ReportService } from 'src/app/services/report.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-smd-rep-progress-node',
  templateUrl: './smd-rep-progress-node.component.html',
  styleUrls: ['./smd-rep-progress-node.component.scss']
})
export class SmdRepProgressNodeComponent implements OnInit, OnDestroy {

    data: any;
    blockedPanel = true;

    mode = ''; // ## show-zone-progress
    companyID = '';
    factoryIDs: string[] = [];
    orderID = '';
    company: Company = GBC.clrCompany();
    order: Order = GBC.clrOrder();

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

        currentProductionNodeQty: any[] = [];
        overviewData: string[] = ['overview'];
        barData: any;
        barOptions: any;
        toNodeArr: string[] = [];
        dataNode: number[] = [];
        dataOutsource: number[] = [];

    private repProductQtyNodeSub: Subscription = new Subscription;

    constructor(
        public config: DynamicDialogConfig,
        public ref: DynamicDialogRef,
        // public dialogService: DialogService,
        // public messageService: MessageService,

        public userService: UserService,
        // private productService: ProductService,
        // private orderService: OrderService,
        // private cusService: CustomerService,
        public nsService: NodeStationService,
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

        // this.targetPlaces  = this.userService.genTargetPlace(this.order.orderTargetPlace);
        // console.log(this.targetPlaces);


        this.toNodeArr = [];
        this.dataNode = [];
        this.dataOutsource = [];
        this.getRepCNCurrentProductQtyNode();


    }

    getRepCNCurrentProductQtyNode() {
        this.blockedPanel = true;
        this.currentProductionNodeQty = [];
        this.toNodeArr = [];
        this.dataNode = [];
        this.dataOutsource = [];
        const ordertatus = ['open'];
        const productStatus = ['normal', 'problem', 'repaired', 'outsource'];
        const orderIDArr = [this.orderID];
        const outsourceNode = 'outsource';
        this.toNodeArr = this.nsService.getNodeIDList();
        this.toNodeArr.push(outsourceNode);
        // console.log(toNodeArr);
        // getRepCNCurrentProductQtyNode(companyID: string, factoryID: string[], productStatus: string[], ordertatus: string[], orderIDArr1: string[])
        this.repService.getRepCNCurrentProductQtyNode(this.company.companyID, this.factoryIDs, productStatus, ordertatus, orderIDArr, this.toNodeArr);
        if (this.repProductQtyNodeSub) { this.repProductQtyNodeSub.unsubscribe(); }
        this.repProductQtyNodeSub = this.repService.getRepCurrentProductQtyNodeListener().subscribe((data) => {
            // console.log(data);
            this.blockedPanel = false;
            this.currentProductionNodeQty = data.currentProductionNodeQty;

            // ## gen  data for chart bar
            this.dataNode = [];
            this.dataOutsource = [];
            this.toNodeArr.forEach( (item, index) => {
                if (item === 'outsource') {
                    this.dataNode.push(0);
                    const qty1 = this.currentProductionNodeQty.filter(i=>i.toNode == item);
                    if (qty1.length > 0) {
                        this.dataOutsource.push(qty1[0].countQty);
                    } else {
                        this.dataOutsource.push(0);
                    }

                } else {
                    const qty1 = this.currentProductionNodeQty.filter(i=>i.toNode == item);
                    if (qty1.length > 0) {
                        this.dataNode.push(qty1[0].countQty);
                    } else {
                        this.dataNode.push(0);
                    }
                    this.dataOutsource.push(0);
                }
            });

            this.initCharts();
        });
    }

    initCharts() {
        const documentStyle = getComputedStyle(document.documentElement);
        const textColor = documentStyle.getPropertyValue('--text-color');
        const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary');
        const surfaceBorder = documentStyle.getPropertyValue('--surface-border');

        this.barData = {
            labels: this.toNodeArr,
            datasets: [
                {
                    label: 'in Production',
                    backgroundColor: documentStyle.getPropertyValue('--yellow-100'),
                    borderColor: documentStyle.getPropertyValue('--yellow-100'),
                    data: this.dataNode
                },
                {
                    label: 'outsource',
                    backgroundColor: documentStyle.getPropertyValue('--primary-200'),
                    borderColor: documentStyle.getPropertyValue('--primary-200'),
                    data: this.dataOutsource
                }
            ]
        };
        this.barOptions = {
            indexAxis: 'y',
            plugins: {
                legend: {
                    labels: {
                        fontColor: textColor
                    }
                }
            },
            scales: {
                x: {
                    ticks: {
                        color: textColorSecondary,
                        font: {
                            weight: 500
                        }
                    },
                    grid: {
                        display: false,
                        drawBorder: false
                    }
                },
                y: {
                    ticks: {
                        color: textColorSecondary
                    },
                    grid: {
                        color: surfaceBorder,
                        drawBorder: false
                    }
                },
            }
        };
    }

    findNodeQty(nodeID: string) {
        const qty1 = this.currentProductionNodeQty.filter(i=>i.toNode == nodeID);
        if (qty1.length > 0) {
            return qty1[0].countQty;
        } else {
            return '';
        }
    }

    ngOnDestroy(): void {
        if (this.repProductQtyNodeSub) { this.repProductQtyNodeSub.unsubscribe(); }
        // if (this.productImageProfilesSub) { this.productImageProfilesSub.unsubscribe(); }
        // if (this.product1CompanySub) { this.product1CompanySub.unsubscribe(); }
        // if (this.dataAroundAppSub) { this.dataAroundAppSub.unsubscribe(); }

        // if (this.langSub) { this.langSub.unsubscribe(); }
    }
}
