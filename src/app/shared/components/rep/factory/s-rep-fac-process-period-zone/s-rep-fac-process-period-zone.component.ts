import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { DialogService } from 'primeng/dynamicdialog';
import { MenuItem, MessageService } from 'primeng/api';

import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';

import { GBC } from 'src/app/global/const-global';
import { ColorS, Company, Factory, SizeS, TargetPlaceS } from 'src/app/models/app.model';
import { MainZone, Order } from 'src/app/models/order.model';
import { CurrentCompanyOrderZoneStyleSize, OrderStyleColorSize, RepQTYEditList } from 'src/app/models/report.model';
import { FlowSeq, NodeFlow, NodeStation } from 'src/app/models/workstation.model';
import { NodeStationService } from 'src/app/services/node-station.service';
import { OrderService } from 'src/app/services/order.service';
import { ReportService } from 'src/app/services/report.service';
import { UserService } from 'src/app/services/user.service';


import { UserGroupScan } from 'src/app/models/user.model';
// import { getLocaleNumberFormat } from '@angular/common';
import { SmdRepProcessEditQtyComponent } from '../smd-rep-process-edit-qty/smd-rep-process-edit-qty.component';


(pdfMake as any).vfs = pdfFonts.pdfMake.vfs;

@Component({
    selector: 'app-s-rep-fac-process-period-zone',
    templateUrl: './s-rep-fac-process-period-zone.component.html',
    styleUrls: ['./s-rep-fac-process-period-zone.component.scss'],
    providers: [ MessageService, DialogService ]
})
export class SRepFacProcessPeriodZoneComponent implements OnInit, OnDestroy {
    @Input() callFrom: string = ''; // ## nodeID

    // [repMode]="'factory-scan-product-period'"  [repModeArr]="['factory-scan-product-period']"
    @Input() repMode: string = ''; // ## rep-fac-process-period-zone-percent , rep-fac-production-period, rep-fac-scan-production-period
    @Input() repModeArr: string[] = []; // ## ['rep-fac-production-period','rep-fac-scan-production-period', ...]
    @Input() repModeEdit: string = '';

    allowEditWhiteDark = true;

    reportHeader = 'Work in process by period [Style - Zone]';
    reportHeaderZone = 'Work in process by period [Zone - Style]';
    modeShow = 'styleZone'; // ## styleZone , zoneStyle
    modePDF = 'styleZone'; // ##  zone , zone-total
    isMaxQtyView = true; // ## isMaxQtyView
    company: Company = GBC.clrCompany();
    factories: Factory[] = [];
    factory: Factory = GBC.clrFactory();
    nodeFlow: NodeFlow = GBC.clrNodeFlow();
    flowSeq: FlowSeq[] = [];
    nodeStations: NodeStation[] = [];
    targetPlaces: TargetPlaceS[] = [];
    mainZone: MainZone[] = [];
    userGroupScan: UserGroupScan[] = [];
    userGroupScan1: UserGroupScan = GBC.clrUserGroupScan();
    items: MenuItem[] = [];

    blockedPanel: boolean = false;
    seasonYear = '';

    orders: Order[] = [];
    orderIDs: string[] = [];
    ordersCount = 0;
    orderColor: ColorS[] = [];

    orderStyleColorSize: OrderStyleColorSize[] = [];
    currentCompanyOrderZoneStyleSize: CurrentCompanyOrderZoneStyleSize[] = [];
    currentProductionZonePeriod: any[] = [];
    currentProductionZonePeriodFake: any[] = [];
    currentProductionZonePeriod2: any[] = [];
    currentProductionZoneForLoss: any[] = [];
    currentProductionZonePeriodGroup: any[] = [];
    currentProductionZonePeriodGroupZone: any[] = [];
    currentProductionZonePeriodGroup2: any[] = [];
    currentProductionZonePeriodGroupZone2: any[] = [];
    sizes: SizeS[] = [];
    colors: ColorS[] = [];

    currentProductionZonePeriodFull: any[] = [];
    currentProductionZoneForLossFull: any[] = [];
    repQTYEditListFull: RepQTYEditList[] = [];

    orderIDPDFShow: any[] = [];
    orderIDPDFShow2: any[] = [];
    orderIDPDFSelect: any = {};

    lastColor = '';
    borderSet = false;
    completeNode = 'completeNode';

    date12: Date[] = [];
    readonlyInput = true;
    dateFormat = 'dd/mm/yy';
    date1 = '';
    date2 = '';
    dayDiff = -1; // ##  -1 not yet to select date / default
    // loadOnce = '';  //  = 'loadOnce'

    tabIndexActiveA = 0;
    tabNameActiveA = '';
    tabIndexActiveB = 0;
    tabNameActiveB = '';
    tabIndexActiveC = 0;
    tabNameActiveC = '';

    items2: MenuItem[] = [];
    sidebarVisible1: boolean = false;
    isShowReport = false;

    productStatus = ['normal', 'problem', 'repaired', 'complete']; // normal , problem, complete
    orderStatus = ['open'];
    repQTYEditList: RepQTYEditList[] = [];

    private repCurrentProductionZonePeriodSub: Subscription = new Subscription;
    private nodeFlowSub: Subscription = new Subscription;
    private ordersByOrderIDsSub: Subscription = new Subscription;
    private dataAroundAppSub: Subscription = new Subscription;
    private repQTYEditBySeasonYearSub: Subscription = new Subscription;

    constructor(
        public dialogService: DialogService,
        public messageService: MessageService,

        public userService: UserService,
        private orderService: OrderService,
        public nsService: NodeStationService,
        private repService: ReportService
    ) {}

    ngOnInit(): void {
        this.items2 = [
            {
                label: 'Update',
                icon: 'pi pi-refresh',
                command: () => {
                    console.log('111');
                }
            },
            {
                label: 'Delete',
                icon: 'pi pi-times',
                command: () => {
                    console.log('222');
                }
            },
            { label: 'Angular.io', icon: 'pi pi-info', url: 'http://angular.io' },
            { separator: true },
            { label: 'Setup', icon: 'pi pi-cog', routerLink: ['/setup'] }
        ];
        // console.log('Zone');
        // console.log(this.repMode);
        // console.log(this.repModeArr);
        // reportHeader = 'Work in process by period [Style - Zone]';
        // reportHeaderZone = 'Work in process by period [Zone - Style]';

        // console.log(this.userService.nodeStations);

        this.reportHeader = this.userService.translateCode('nu', 'nu-working-period-style-zone');
        this.reportHeaderZone = this.userService.translateCode('nu', 'nu-working-period-zone-style');
        this.company = this.userService.getCompany();
        this.factories = this.userService.getFactories();
        this.factory = this.factories.length>0?this.factories[0]:GBC.clrFactory();
        this.targetPlaces = this.userService.targetPlaces;
        this.mainZone = this.userService.getMainZoneTargetPlace(this.targetPlaces);
        this.sizes = this.userService.sizes;
        this.colors = this.userService.colors;
        this.seasonYear = this.userService.seasonYear;

        // console.log(this.factories);
        // console.log(this.factory);
        // console.log(this.targetPlaces);
        // console.log(this.mainZone);
        // console.log(this.sizes);
        // console.log(this.colors);
        // console.log(this.seasonYear);

        // console.log(' this.repMode ',this.repMode);
        // console.log(' this.repModeArr ',this.repModeArr);
        // console.log(' this.modeShow ',this.modeShow);
        // console.log(' this.isMaxQtyView ',this.isMaxQtyView);

        this.userGroupScan = [...this.userService.userGroupScan];
        let userGroupScanAll: UserGroupScan = GBC.clrUserGroupScan();
        userGroupScanAll.companyID = this.company.companyID;
        userGroupScanAll.groupScanID = '*';
        this.userGroupScan.unshift(userGroupScanAll);

        // console.log(this.userGroupScan);
        this.addItemsMenuScanGroup();


        this.date12[0] = new Date();
        this.date12[1] = new Date();

        // ## get DataAroundApp
        this.dataAroundAppSub = this.userService.getDataAroundAppStatusListener().subscribe((dataAroundApp) => {
            // ## season year
            // console.log(this.userService.seasonYear);
            // this.getRepCurrentProductionZonePeriod();
            if (this.seasonYear !== this.userService.seasonYear) {
                this.seasonYear = this.userService.seasonYear;
                this.execute_getRepCurrentProductionZonePeriod();
            }
        });

        // console.log('SRepFacProcessPeriodZoneComponent');
        // console.log(this.repMode);

        // // ## node report
        // if (this.repMode === 'factory-scan-product-period') {
        //     this.stfGetNodeFlow();
        // } else {
        // }
        this.getNodeFlow();
        this.execute_getRepCurrentProductionZonePeriod();
    }

    addItemsMenuScanGroup() {
        // console.log(this.userGroupScan);
        this.userGroupScan1 = GBC.clrUserGroupScan();

        let items1: MenuItem[] = [];
        this.userGroupScan.forEach( (item, index) => {
            // console.log(item);
            const item1 = {
                label: item.groupScanID,
                command: () => {
                    this.clearData();
                    this.userGroupScan1 = item;
                    // console.log(this.userGroupScan1);
                }
            };
            items1.push(item1);
        });

        this.items = [
            {
                label: 'Selection...',
                items: items1
            },
        ];
        this.userGroupScan1 = this.userGroupScan[0];

        // ## for report at node station
        if (this.repMode==='factory-scan-product-period') {
            this.factory = this.userService.getFactory();
            this.items = [];

            // console.log(this.userService.userGroupScan);
            const userGroupScanFF = this.userService.getGroupScanIDByFactoryID(this.factory.factoryID);
            let userGroupScan: UserGroupScan = GBC.clrUserGroupScan();
            if (userGroupScanFF) {userGroupScan = userGroupScanFF;}
            const userGroupScanID2 = this.userService.getScanID2_GroupScanIDByFactoryID(this.factory.factoryID);
            this.userGroupScan = [userGroupScan];
            this.userGroupScan1 = userGroupScan;

            // console.log(userGroupScanFF);
            // console.log(this.userGroupScan);
            // console.log(this.userGroupScan1);
            // console.log(this.factory);
        }
    }

    clearData() {
        this.currentProductionZonePeriod = [];
        this.currentProductionZonePeriodFake = [];
        this.currentProductionZoneForLoss = [];
        this.orderStyleColorSize = [];
        this.currentCompanyOrderZoneStyleSize = [];
        this.currentProductionZoneForLoss = [];
        this.currentProductionZonePeriod2 = [];
        this.currentProductionZonePeriodGroup = [];
        this.currentProductionZonePeriodGroupZone = [];
        this.currentProductionZonePeriodGroup2 = [];
        this.productionZonePeriod = [];
        this.orderIDPDFShow = [];
        // orderIDPDFShow: any[] = [];
    }

    execute_getRepCurrentProductionZonePeriod() {
        if (this.repMode === 'factory-scan-product-period') {
            this.blockedPanel = false;
        } else {
            if (this.repMode !== 'rep-fac-scan-production-period') {
                this.getRepCurrentProductionZonePeriod();
            } else if (this.repMode === 'rep-fac-scan-production-period') {
                this.blockedPanel = false;
                // this.loadOnce = 'loadOnce';
                // this.getRepCurrentProductionZonePeriod();
            }
        }
    }

    dateChange() {
        // console.log('dateChange');
        this.clearData();
    }

    selectDate() {
        this.isShowReport = true;
        // this.clearData();

        // this.rangeDates = [];
        this.dayDiff = -1; // ##  -1 not yet to select date / default
        if (this.date12.length === 2) {
            if (!this.date12[1]) {
                // console.log('this.rangeDates[1] is null');
                this.date12[1] = this.date12[0];
            }
        }
        // let difference = Math.ceil((this.rangeDates[1].getTime() - this.rangeDates[0].getTime() ) /  (1000 * 60 * 60 * 24));
        this.dayDiff = this.userService.getDayDifferent(this.date12[1], this.date12[0]);
        // console.log(this.date12);
        this.date1 = this.userService.returnDateDDMMYYYYHHMMSign(this.date12[0], '/')
        this.date2 = this.userService.returnDateDDMMYYYYHHMMSign(this.date12[1], '/')
        // console.log(this.date1, this.date2);
        // console.log(this.dayDiff);

        this.getRepCurrentProductionZonePeriodDate12();
    }

    checkRepMode(typeStr: string) {
        // ##  showForLoss =  show for loss  rep-fac-production-period-qty-plan-adjust
        if (this.repMode === 'rep-fac-production-period'
            || this.repMode === 'rep-fac-production-period-edit-qty'
            || this.repMode === 'rep-fac-production-period-qty-plan-adjust'
            || this.repMode === 'rep-fac-scan-production-period'
            || this.repMode === 'factory-scan-product-period') {
            if (typeStr === 'noshowForLoss') {
                return false;
            }
        }
        return true;
    }

    checkRepModeArr(typeStr: string) {
        // ##  showForLoss =  show for loss
        if (this.repModeArr.includes(this.repMode)) {
            if (typeStr === 'noshowForLoss') {
                return false;
            }
        }
        return true;
    }




    // ## date range
    getRepCurrentProductionZonePeriodDate12() {
        this.blockedPanel = true;
        this.orders = [];
        this.currentProductionZonePeriodFull = [];
        this.currentProductionZoneForLossFull = [];
        this.repQTYEditListFull = [];
        const seasonYear = this.seasonYear;
        const productStatus = ['normal', 'problem', 'repaired', 'complete']; // normal , problem, complete
        const orderStatus = ['open'];
        const date12 = this.date12;
        const userGroupScan1: UserGroupScan = this.userGroupScan1;
        // const date2 = this.date2;
        this.repService.getRepCurrentProductionZonePeriodDate12(this.company.companyID, productStatus, orderStatus, date12, userGroupScan1, seasonYear);
        if (this.repCurrentProductionZonePeriodSub) { this.repCurrentProductionZonePeriodSub.unsubscribe(); }
        this.repCurrentProductionZonePeriodSub = this.repService.getRepCurrentProductionsZonePeriodCUpdatedListener().subscribe((data) => {
            // console.log(data);
            this.blockedPanel = false;
            this.isShowReport = false;
            this.currentProductionZonePeriod = data.currentProductionZonePeriod;
            this.currentProductionZonePeriodFake = data.currentProductionZonePeriodFake;
            this.currentProductionZoneForLoss = data.currentProductionZoneForLoss;
            this.orderStyleColorSize = data.orderStyleColorSize;
            if ( this.currentProductionZonePeriod.length > 0) {
                this.prepareGetRepCurrentProductionZonePeriod();
            }

            this.currentProductionZonePeriodFull = data.currentProductionZonePeriodFull;
            this.currentProductionZoneForLossFull = data.currentProductionZoneForLossFull;
            this.repQTYEditListFull = data.repQTYEditListFull;
            // this.prepareGetRepCurrentProductionZonePeriodFull();
        });
    }

    getRepCurrentProductionZonePeriod() {
        this.blockedPanel = true;
        // getRepCurrentProductionZonePeriod(companyID: string, productStatus: string[], orderStatus: string[])
        this.orders = [];
        this.repQTYEditList = [];
        // getRepCurrentProductionPeriod(companyID: string, productStatus: string[])
        const seasonYear = this.seasonYear;
        const productStatus = this.productStatus; // normal , problem, complete
        const orderStatus = this.orderStatus;
        this.repService.getRepCurrentProductionZonePeriod(this.company.companyID, productStatus, orderStatus, seasonYear);
        if (this.repCurrentProductionZonePeriodSub) { this.repCurrentProductionZonePeriodSub.unsubscribe(); }
        this.repCurrentProductionZonePeriodSub = this.repService.getRepCurrentProductionsZonePeriodCUpdatedListener().subscribe((data) => {
            this.blockedPanel = false;
            // console.log(data);
            this.currentProductionZonePeriod = data.currentProductionZonePeriod;
            this.currentProductionZonePeriodFake = data.currentProductionZonePeriodFake;
            this.currentProductionZoneForLoss = data.currentProductionZoneForLoss;
            this.orderStyleColorSize = data.orderStyleColorSize;
            this.repQTYEditList = data.repQTYEditList;
            // this.currentCompanyOrderZoneStyleSize = data.currentCompanyOrderZoneStyleSize;

            // let orderIDArr = Array.from(new Set(this.currentProductionZonePeriod.map((item: any) => item.orderID)));
            // orderIDArr.sort();
            // this.orderIDPDFShow = [];
            // orderIDArr.forEach( (item, index) => {
            //     this.orderIDPDFShow.push({orderID: item, pdfShow: true});
            // });
            // console.log(this.orderIDPDFShow);

            this.prepareGetRepCurrentProductionZonePeriod();
        });
    }

    prepareGetRepCurrentProductionZonePeriod() {

        // ## update Fake value to real value
        this.currentProductionZonePeriodFake.forEach( (item, index) => {

        });


        // ## update dark white edit to   "currentProductionZonePeriod"
        // allowEditWhiteDark = true;
        this.currentProductionZonePeriod.forEach( (item, index) => {
            item.size = this.userService.strReplaceAll(item.size, '-', '');
            item.color = this.userService.strReplaceAll(item.color, '-', '');
            item.targetPlaceID = this.userService.strReplaceAll(item.targetPlaceID, '-', '');
        });

        // console.log(this.currentProductionZonePeriod);
        this.repQTYEditList.forEach( (item, index) => {
            if (this.allowEditWhiteDark && this.repMode === 'rep-fac-production-period') {

                const idx = this.currentProductionZonePeriod.findIndex(i=>
                    i.orderID === item.orderID
                    && i.fromNode === item.fromNode
                    && i.targetPlaceID === item.targetPlaceID
                    && i.color === item.color
                    && i.size === item.size
                );
                if (idx >= 0) {

                    this.currentProductionZonePeriod[idx].sumProductQty =
                        +this.currentProductionZonePeriod[idx].sumProductQty + +item.sumProductQty;
                } else {
                    const currentProductionZonePeriodX: any = {
                        color: item.color,
                        fromNode: item.fromNode,
                        orderID: item.orderID,
                        productColor: item.productColor,
                        productSize: item.productSize,
                        size: item.size,
                        sizeSeq: item.sizeSeq,
                        sumProductQty: item.sumProductQty,
                        targetPlaceID: item.targetPlaceID,
                        targetPlaceSeq: item.targetPlaceSeq,
                    };
                    this.currentProductionZonePeriod.push(currentProductionZonePeriodX);
                }
            }
        });

        // console.log(this.currentProductionZonePeriod);
        // console.log(this.orderStyleColorSize);
        // console.log(this.currentCompanyOrderZoneStyleSize);
        // getTargetPlaceSeq(targetPlaceID: string, countryID: string)
        this.currentProductionZonePeriod.forEach( (item, index) => {
            item.targetPlaceSeq = this.userService.getTargetPlaceSeq1(item.targetPlaceID);
            item.sizeSeq = this.userService.getSizeSeq(item.size);
        });
        this.currentProductionZonePeriod.sort((a,b)=>{
            return a.targetPlaceSeq >b.targetPlaceSeq?1:a.targetPlaceSeq <b.targetPlaceSeq?-1:0
            || a.orderID >b.orderID?1:a.orderID <b.orderID?-1:0
            || a.sizeSeq >b.sizeSeq?1:a.sizeSeq <b.sizeSeq?-1:0
        });
        // console.log(this.currentProductionZonePeriod);
        this.orderIDs = Array.from(new Set(this.currentProductionZonePeriod.map((item: any) => item.orderID.trim())));


        let orderIDArr = Array.from(new Set(this.currentProductionZonePeriod.map((item: any) => item.orderID)));
        orderIDArr.sort();
        this.orderIDPDFShow = [];
        orderIDArr.forEach( (item, index) => {
            const orderColors: ColorS[] = this.userService.getOrderColor(item);
            let colorObj: any[] = [];
            orderColors.forEach( (item2, index2) => {
                let colorObj1: any = {};
                colorObj1.seq = item2.seq;
                colorObj1.setName = item2.setName;
                colorObj1.colorCode = item2.color.colorCode;
                colorObj1.colorID = item2.color.colorID;
                colorObj1.colorName = item2.color.colorName;
                colorObj1.colorValue = item2.color.colorValue;
                colorObj1.show = true;
                colorObj.push(colorObj1);
            });
            this.orderIDPDFShow.push({orderID: item, pdfShow: true, colorObj: colorObj});
        });
        // console.log(this.orderIDPDFShow);

        // console.log(this.orderIDs);
        this.getOrdersZoneStyleSizeByOrderIDs(this.orderIDs);
    }



    configColor(idx: number) {
        // this.orderIDPDFShow
        this.sidebarVisible1 = true
        this.orderIDPDFSelect = {};
        this.orderIDPDFSelect =  this.orderIDPDFShow[idx];
    }

    setColorShow(idx: number) {
        this.orderIDPDFSelect.colorObj[idx].show = !this.orderIDPDFSelect.colorObj[idx].show;
        const idx2 = this.orderIDPDFShow.findIndex( fi =>(fi.orderID === this.orderIDPDFSelect.orderID));
        this.orderIDPDFShow[idx2].colorObj = this.orderIDPDFSelect.colorObj;
        // console.log(this.orderIDPDFShow);
    }

    getOrdersZoneStyleSizeByOrderIDs(orderIDs: string[]) {
        // getOrdersByOrderIDs(companyID: string, orderIDs: string[])
        const orderStatus = ['open'];

        if (this.repMode === 'factory-scan-product-period') {
            this.orderService.getOrdersZoneStyleSizeByOrderIDs_1(this.company.companyID, orderIDs, orderStatus);
        } else {
            this.orderService.getOrdersZoneStyleSizeByOrderIDs(this.company.companyID, orderIDs, orderStatus);
        }

        if (this.ordersByOrderIDsSub) { this.ordersByOrderIDsSub.unsubscribe(); }
        this.ordersByOrderIDsSub = this.orderService.getOrdersZoneStyleSizeByOrderIDsListener().subscribe((data) => {
            // console.log(data);
            this.orders = data.orders;
            // console.log(this.orders);
            this.ordersCount = data.ordersCount;
            this.currentCompanyOrderZoneStyleSize = data.currentCompanyOrderZoneStyleSize;
            // this.orderStyleColorSize = this.repService.setColorSeq(this.orders.orderColors, this.orderStyleColorSize);

            // const order1 = this.orders.filter(i=>i.orderID === 'AAOPHA4A');
            // console.log(order1);

            // console.log(this.currentCompanyOrderZoneStyleSize);
            this.currentCompanyOrderZoneStyleSize.sort((a,b)=>{ return a.orderID >b.orderID?1:a.orderID <b.orderID?-1:0 });
            // console.log(this.currentCompanyOrder);

            this.currentCompanyOrderZoneStyleSize.forEach( (item, index) => {
                item.productSize = this.userService.strReplaceAll(item.productSize, '-', '');
            });
            // console.log(this.currentCompanyOrderZoneStyleSize);

            this.orderStyleColorSize.forEach( (item, index) => {
                item.productSize = this.userService.strReplaceAll(item.productSize, '-', '');
            });
            this.orderStyleColorSize = this.repService.setSizeSeq(this.sizes, this.orderStyleColorSize);
            this.orderStyleColorSize = this.repService.setColorSeq(this.colors, this.orderStyleColorSize);


            this.updateColorseq();
            // ## multi sort 2 property
            this.orderStyleColorSize.sort((a,b)=>{
                return a.orderID >b.orderID?1:a.orderID <b.orderID?-1:0
                    || a.colorSeq >b.colorSeq?1:a.colorSeq <b.colorSeq?-1:0
                    || a.sizeSeq >b.sizeSeq?1:a.sizeSeq <b.sizeSeq?-1:0
            });
            // console.log(this.orderStyleColorSize);

            this.currentProductionZonePeriod.forEach( (item, index) => {
                item.size = this.userService.strReplaceAll(item.size, '-', '');
                item.color = this.userService.strReplaceAll(item.color, '-', '');
            });
            // console.log(this.currentProductionZonePeriod);

            this.currentProductionZonePeriod.forEach( (item, index) => {
                item.color = this.userService.changeColorTextToColorTextComma(item.color);
                item.sizeSeq = this.userService.getSizeSeq(item.size);
                item.productColor = item.color;
                item.productSize = item.size;
            });
            // console.log(this.currentProductionZonePeriod);

            this.currentProductionZonePeriod.sort((a,b)=>{
                return a.orderID >b.orderID?1:a.orderID <b.orderID?-1:0
                || a.color >b.color?1:a.color <b.color?-1:0
                || a.sizeSeq >b.sizeSeq?1:a.sizeSeq <b.sizeSeq?-1:0
            });
            // console.log(this.currentProductionZonePeriod);



            // currentProductionZoneForLoss
            this.currentProductionZoneForLoss.forEach( (item, index) => {
                item.size = this.userService.strReplaceAll(item.size, '-', '');
                item.color = this.userService.strReplaceAll(item.color, '-', '');
                item.targetPlaceID = this.userService.strReplaceAll(item.targetPlaceID, '-', '');
            });
            // console.log(this.currentProductionPeriod);

            this.currentProductionZoneForLoss.forEach( (item, index) => {
                item.color = this.userService.changeColorTextToColorTextComma(item.color);
                item.sizeSeq = this.userService.getSizeSeq(item.size);
            });
            // console.log(this.currentProductionZoneForLoss);


            this.currentProductionZonePeriod2 = [...this.currentProductionZonePeriod];

            // ## group by style-zone
            // currentProductionZonePeriodGroup  group by style-zone
            this.currentProductionZonePeriodGroup = this.userService.groupBy(this.currentProductionZonePeriod, (c: any) => c.orderID);
            this.currentProductionZonePeriodGroup = Object.values(this.currentProductionZonePeriodGroup);

            this.currentProductionZonePeriodGroup.sort((a,b)=>{ return a.orderID >b.orderID?1:a.orderID <b.orderID?-1:0 });
            // console.log(this.currentProductionZonePeriodGroup);

            // ## group by style-zone
            // group by targetPlaceID
            this.currentProductionZonePeriodGroupZone = [];
            this.currentProductionZonePeriodGroup.forEach( (item, index) => {
                let  currentProductionZonePeriodGroupZone = this.userService.groupBy(item, (c: any) => c.targetPlaceID);
                currentProductionZonePeriodGroupZone = Object.values(currentProductionZonePeriodGroupZone);
                this.currentProductionZonePeriodGroupZone.push(currentProductionZonePeriodGroupZone);
            });
            // console.log(this.currentProductionZonePeriodGroupZone);

            // ## group by zone-style
            this.currentProductionZonePeriodGroup2 = this.userService.groupBy(this.currentProductionZonePeriod2, (c: any) => c.targetPlaceID);
            this.currentProductionZonePeriodGroup2 = Object.values(this.currentProductionZonePeriodGroup2);
            // console.log(this.currentProductionZonePeriodGroup2);

            // ## group by zone-style
            // group by targetPlaceID
            this.currentProductionZonePeriodGroupZone2 = [];
            this.currentProductionZonePeriodGroup2.forEach( (item, index) => {
                let  currentProductionZonePeriodGroupZone2 = this.userService.groupBy(item, (c: any) => c.orderID);
                currentProductionZonePeriodGroupZone2 = Object.values(currentProductionZonePeriodGroupZone2);
                this.currentProductionZonePeriodGroupZone2.push(currentProductionZonePeriodGroupZone2);
            });
            // console.log(this.currentProductionZonePeriodGroupZone2);

            // ##set tab data initial value
            this.tabIndexActiveA = 0;
            this.tabNameActiveA = this.currentProductionZonePeriodGroup[0][0].orderID;
            this.tabIndexActiveB = 0;
            this.tabNameActiveB = this.currentProductionZonePeriodGroupZone[0][0][0].targetPlaceID;
            this.tabIndexActiveC = 0;
            this.tabNameActiveC = this.currentProductionZonePeriodGroup2[0][0].targetPlaceID;
            // console.log('tabNameActive A ', this.tabNameActiveA);
            // console.log('tabNameActive B ', this.tabNameActiveB);
            // console.log('tabNameActive C ', this.tabNameActiveC);

            // if (this.repMode === 'rep-fac-scan-production-period' && this.loadOnce === 'loadOnce') {
            //     this.printPDF('loadFull', 'prePrintPDF');
            // }
        });
    }



    editPDFShow(idx: number) {
        this.orderIDPDFShow[idx].pdfShow = !this.orderIDPDFShow[idx].pdfShow;
        this.orderIDPDFShow2 = [...this.orderIDPDFShow];
        // console.log(this.orderIDPDFShow2);
    }

    productionZonePeriod: any[] = [];
    productionZonePeriodFull: any[] = [];  // ## all/full production order

    // ## modePDF = 'zone' , 'zone-total'
    printPDF(modePDF: string, modePrePrintPDF: string) {
        // console.log('printPDF ', modeShow);
        // console.log(this.orderIDPDFShow2);
        let nodeStations: NodeStation[] = this.userService.nodeStations;
        // console.log(nodeStations);
        nodeStations.sort((a,b)=>{ return a.nodeID >b.nodeID?1:a.nodeID <b.nodeID?-1:0 });

        const companyID = this.company.companyID;
        this.productionZonePeriod = [];

        // console.log(this.currentProductionZonePeriodGroup2);
        this.currentProductionZonePeriodGroup2.forEach( (item, index) => {
            // console.log(item[0].targetPlaceID);
            const targetPlaceID = item[0].targetPlaceID;

            // ## do only targetPlaceID is active | selected
            if (this.tabNameActiveC===targetPlaceID) {
                let currentProductionZonePeriodPDF1: any = {};
                currentProductionZonePeriodPDF1.targetPlaceID = targetPlaceID;

                (this.currentProductionZonePeriodGroupZone2[index] as any[]).forEach( (item2, index2) => {
                    const orderID = item2[0].orderID;
                    const style = item2[0].orderID;
                    currentProductionZonePeriodPDF1.orderID = orderID;
                    const fac: any = this.userService.getOrderFactory(orderID, 'all');
                    currentProductionZonePeriodPDF1.factoryID = fac.factoryID;
                    currentProductionZonePeriodPDF1.factoryName1 = fac.factoryName1;
                    currentProductionZonePeriodPDF1.factoryName2 = fac.factoryName2;

                    // ## add color ColorS
                    let color: any[] = [];
                    this.styleGroupColorFilter2(orderID).forEach( (item3, index3) => {
                        const colorID = item3.color.colorID;
                        let color1: any = {
                            setName: item3.setName,
                            colorCode: item3.color.colorCode,
                            colorName: item3.color.colorName,
                            data: [],
                            totalOrderIDColor: {}
                        };

                        let setColorQTYShow = true;
                        const orF = this.orderIDPDFShow.filter(i=>i.orderID === orderID);
                        // console.log(orderID);
                        // console.log(orF);
                        const colorObj1: any[] = orF[0].colorObj;
                        // console.log(colorObj1);
                        // console.log(item3.color.colorCode);
                        const colorObj1F = colorObj1.filter(i=>i.colorCode === item3.color.colorCode);
                        // console.log(colorObj1F);
                        setColorQTYShow = colorObj1F[0].show;


                        // ## add size of orderId-color
                        const period = this.orderStyleColorSizeFilter2(index, index3, orderID);
                        const size = Array.from(new Set(period.map((item: any) => item.productSize)));

                        let data: any[] = []; // ## data line   userService.strReplaceAll(period.productSize, '-', '')

                        size.forEach( (item4, index4) => {
                            const size1 = this.userService.strReplaceAll(item4, '-', '');
                            let data1: any = {};
                            data1.size = size1;
                            data1.sizeName = this.userService.getSizeName(size1);
                            data1.orderQTY = this.getOrderQtyC(companyID, orderID, style, colorID, size1, targetPlaceID);
                            if (setColorQTYShow) { // ## show QTY here
                                data1.knitting = this.getPeriodQtyC(companyID, orderID, style, colorID, size1, nodeStations[0].nodeID, targetPlaceID);
                                data1.panal = this.getPeriodQtyC(companyID, orderID, style, colorID, size1, nodeStations[1].nodeID, targetPlaceID);
                                data1.linking = this.getPeriodQtyC(companyID, orderID, style, colorID, size1, nodeStations[2].nodeID, targetPlaceID);
                                data1.mending = this.getPeriodQtyC(companyID, orderID, style, colorID, size1, nodeStations[3].nodeID, targetPlaceID);
                                data1.washing = this.getPeriodQtyC(companyID, orderID, style, colorID, size1, nodeStations[4].nodeID, targetPlaceID);
                                data1.pressing = this.getPeriodQtyC(companyID, orderID, style, colorID, size1, nodeStations[5].nodeID, targetPlaceID);
                                data1.qc = this.getPeriodQtyC(companyID, orderID, style, colorID, size1, nodeStations[6].nodeID, targetPlaceID);
                            } else { // ## hide QTY here
                                data1.knitting = '';
                                data1.panal = '';
                                data1.linking = '';
                                data1.mending = '';
                                data1.washing = '';
                                data1.pressing = '';
                                data1.qc = '';
                            }

                            data.push({...data1});
                        });
                        color1.data = [...data];

                        // ## add total all-size orderID color
                        let totalOrderIDColor: any = {};
                        totalOrderIDColor.orderQTYT = this.getOrderQtyGrandTotal2(index, item3, orderID, targetPlaceID, '');
                        if (setColorQTYShow) { // ## show QTY here
                            totalOrderIDColor.knittingT = this.getOrderQtyColumnTotal2(index, item3, nodeStations[0].nodeID, orderID, targetPlaceID);
                            totalOrderIDColor.panalT = this.getOrderQtyColumnTotal2(index, item3, nodeStations[1].nodeID, orderID, targetPlaceID);
                            totalOrderIDColor.linkingT = this.getOrderQtyColumnTotal2(index, item3, nodeStations[2].nodeID, orderID, targetPlaceID);
                            totalOrderIDColor.mendingT = this.getOrderQtyColumnTotal2(index, item3, nodeStations[3].nodeID, orderID, targetPlaceID);
                            totalOrderIDColor.washingT = this.getOrderQtyColumnTotal2(index, item3, nodeStations[4].nodeID, orderID, targetPlaceID);
                            totalOrderIDColor.pressingT = this.getOrderQtyColumnTotal2(index, item3, nodeStations[5].nodeID, orderID, targetPlaceID);
                            totalOrderIDColor.qcT = this.getOrderQtyColumnTotal2(index, item3, nodeStations[6].nodeID, orderID, targetPlaceID);
                        } else { // ## hide QTY here
                            totalOrderIDColor.knittingT = 0;
                            totalOrderIDColor.panalT = 0;
                            totalOrderIDColor.linkingT = 0;
                            totalOrderIDColor.mendingT = 0;
                            totalOrderIDColor.washingT = 0;
                            totalOrderIDColor.pressingT = 0;
                            totalOrderIDColor.qcT = 0;
                        }
                        color1.totalOrderIDColor = {...totalOrderIDColor};

                        // // ## check empty data, filter empty data out, not show in PDF
                        // if (+totalOrderIDColor.knittingT !== 0) {
                        //     color.push({...color1});
                        // }

                        // ## get all no filter out data
                        color.push({...color1});
                    });
                    currentProductionZonePeriodPDF1.color = [...color];

                    this.productionZonePeriod.push({...currentProductionZonePeriodPDF1});
                });
            }
        });
        // console.log(this.productionZonePeriod);

        // ## filter for orderID selected
        // console.log(this.orderIDPDFShow);
        const orderIDPDFShowF = this.orderIDPDFShow.filter(i=>i.pdfShow == true);
        // console.log(orderIDPDFShowF);
        let orderIDSelectedArr = Array.from(new Set(orderIDPDFShowF.map((item: any) => item.orderID)));
        // console.log(orderIDSelectedArr);
        const productionZonePeriod = [...this.productionZonePeriod];
        const productionZonePeriodF = productionZonePeriod.filter(i=>orderIDSelectedArr.includes(i.orderID));
        this.productionZonePeriod = [...productionZonePeriodF];
        // console.log(this.productionZonePeriod);

        // if ( modePDF === 'loadFull' && modePrePrintPDF === 'prePrintPDF' && this.loadOnce === 'loadOnce') {
        //     this.loadOnce = '';
        //     this.productionZonePeriodFull = [];
        //     this.currentProductionZonePeriodGroup2 = [];
        //     this.currentProductionZonePeriodGroup = [];

        //     // console.log(modePrePrintPDF);
        //     // this.yarnDataInfoOld = this.yarnDataInfo.map(obj => ({...obj})); // copy array object
        //     this.productionZonePeriodFull = this.productionZonePeriod.map(obj => ({...obj})); // copy array object
        //     console.log(this.productionZonePeriodFull);
        // } else {
        //     // this.productionZonePeriodFull = [];
        //     this.productionZonePeriodPDF(modePDF);
        // }

        this.productionZonePeriodPDF(modePDF);
    }

    // ## productionZonePeriodPDF #########################################################################################
    // ## modePDF = 'zone' , 'zone-total'
    productionZonePeriodPDF(modePDF: string) {
        // ## state = normal, blankPackingList
        const date12 = this.date1 + ' - ' + this.date2;
        const groupScanID = this.userGroupScan1.groupScanID;
        let dataPrint: any = {
            date12: '',
            groupScanID: '', // ## *, tailin, tai-an, sd, boda
        };
        if (this.repMode === 'rep-fac-scan-production-period' || this.repMode === 'factory-scan-product-period') {
            dataPrint.date12 = date12;
            dataPrint.groupScanID = groupScanID;
        }
        const docDefinition = this.orderService.productionZonePeriodPDF(
            modePDF, this.productionZonePeriod, this.productionZonePeriodFull, dataPrint);
        // console.log(docDefinition);
        // console.log('createPackingListPDF.....');
        pdfMake.createPdf(docDefinition).open();
    }

    modeShowClick(modeShow: string) {
        // console.log('modeShowClick ', modeShow);
        // ##  'styleZone' , 'zoneStyle'
        this.modeShow = modeShow;
        this.tabIndexActiveA = 0;
        this.tabNameActiveA = this.currentProductionZonePeriodGroup[0][0].orderID;
        this.tabIndexActiveB = 0;
        this.tabNameActiveB = this.currentProductionZonePeriodGroupZone[0][0][0].targetPlaceID;
        this.tabIndexActiveC = 0;
        this.tabNameActiveC = this.currentProductionZonePeriodGroup2[0][0].targetPlaceID;
        // console.log('tabNameActive A ', this.tabNameActiveA);
        // console.log('tabNameActive B ', this.tabNameActiveB);
        // console.log('tabNameActive C ', this.tabNameActiveC);
    }

    changeIsMaxQtyView() {
        this.isMaxQtyView = !this.isMaxQtyView;
    }

    getTabIndexA(ev: any) {
        // console.log('getTabIndex A ', ev);
        this.tabIndexActiveC = 0;
        this.tabNameActiveC = this.currentProductionZonePeriodGroup2[0][0].targetPlaceID;

        this.tabIndexActiveA = ev.index;
        this.tabNameActiveA = this.currentProductionZonePeriodGroup[this.tabIndexActiveA][0].orderID;
        // console.log('tabNameActive A ', this.tabNameActiveA);

        // this.tabIndexActive = ev.index;
        // if (this.tabIndexActive === 0) {
        //     this.tabNameActive = 'Order all';
        // } else {
        //     this.tabNameActive = this.currentCompanyOrderStyleGroup[this.tabIndexActive - 1][0].orderID;
        // }
        // console.log(this.tabIndexActive, this.tabNameActive);
    }

    getTabIndexB(ev: any) {
        // console.log('getTabIndex B ', ev);
        this.tabIndexActiveC = 0;
        this.tabNameActiveC = this.currentProductionZonePeriodGroup2[0][0].targetPlaceID;
    }

    getTabIndexC(ev: any) {
        // console.log('getTabIndex C ', ev);
        this.tabIndexActiveA = 0;
        this.tabNameActiveA = this.currentProductionZonePeriodGroup[0][0].orderID;
        this.tabIndexActiveB = 0;
        this.tabNameActiveB = this.currentProductionZonePeriodGroupZone[0][0][0].targetPlaceID;

        this.tabIndexActiveC = ev.index;
        this.tabNameActiveC = this.currentProductionZonePeriodGroup2[this.tabIndexActiveC][0].targetPlaceID;
        // console.log('tabNameActive C ', this.tabNameActiveC);
    }

    orderStyleColorSizeFilter2(idx: number, idx2: number, style: string){ // # mode = array || len
        // console.log('style === ', style);
        const orderStyleColorSize = this.orderStyleColorSize.filter(i=>i.orderID.trim() == style.trim());
        const unique_color = [...new Set(orderStyleColorSize.map((item: any) => item.productColor))];
        // console.log(unique_color);
        const colorInx = unique_color[idx2];

        orderStyleColorSize.sort((a,b)=>{
            return a.orderID >b.orderID?1:a.orderID <b.orderID?-1:0
                || a.colorSeq >b.colorSeq?1:a.colorSeq <b.colorSeq?-1:0
                || a.sizeSeq >b.sizeSeq?1:a.sizeSeq <b.sizeSeq?-1:0
        });
        // console.log(orderStyleColorSize);
        const orderStyleColorSizeF = orderStyleColorSize.filter( fi =>(fi.productColor === colorInx));
        // console.log(orderStyleColorSizeF);
        // return mode==='array'?orderStyleColorSizeF:orderStyleColorSizeF.length;
        return orderStyleColorSizeF;
    }

    orderStyleColorSizeFilter(idx: number, idx2: number, group: any[]){ // # mode = array || len
        // console.log(this.currentProductionZonePeriodGroup[idx][0].orderID);
        const orderStyleColorSize = this.orderStyleColorSize.filter(i=>i.orderID == this.currentProductionZonePeriodGroup[idx][0].orderID);
        const unique_color = [...new Set(orderStyleColorSize.map((item: any) => item.productColor))];
        // console.log(unique_color);
        const colorInx = unique_color[idx2];

        orderStyleColorSize.sort((a,b)=>{
            return a.orderID >b.orderID?1:a.orderID <b.orderID?-1:0
                || a.colorSeq >b.colorSeq?1:a.colorSeq <b.colorSeq?-1:0
                || a.sizeSeq >b.sizeSeq?1:a.sizeSeq <b.sizeSeq?-1:0
        });
        // console.log(orderStyleColorSize);
        const orderStyleColorSizeF = orderStyleColorSize.filter( fi =>(fi.productColor === colorInx));
        // console.log(orderStyleColorSizeF);
        // return mode==='array'?orderStyleColorSizeF:orderStyleColorSizeF.length;
        return orderStyleColorSizeF;
    }

    updateColorseq() {
        this.orderStyleColorSize.forEach( (item, index) => {
            const ordersF = this.orders.filter(i=>i.orderID == item.orderID);
            if (ordersF.length > 0) {
                const colors = ordersF[0].orderColor;
                let seq = colors.filter(i=>i.color.colorID == item.productColor);
                if (seq.length > 0) {
                    item.colorSeq = seq[0].seq;
                } else {
                    item.colorSeq = -1;
                }
            }
        });
    }

    styleGroupColorFilter2(orderID: string) {
        // console.log(idx, group);

        let colors: ColorS[] = [];
        const ordersF = this.orders.filter(i=>i.orderID.trim() == orderID.trim());
        // console.log(ordersF);
        if (ordersF.length > 0) {
            colors = ordersF[0].orderColor;
        }
        // console.log(colors);

        return colors;
    }

    styleGroupColorFilter(idx: number, group: any[]) {
        // console.log(idx, group);

        let colors: ColorS[] = [];
        const ordersF = this.orders.filter(i=>i.orderID.trim() == group[0].orderID.trim());
        // console.log(ordersF);
        if (ordersF.length > 0) {
            colors = ordersF[0].orderColor;
        }
        // console.log(colors);

        return colors;
    }

    getOrderQty(companyID: string, orderID: string, style: string,
        productColor: string, productSize: string, targetPlaceID: string) {

        if (this.modeShow !== 'styleZone' || this.tabNameActiveA !== orderID) { return ''; } // ## do when this tabView is active

        // console.log(companyID, orderID, style, productColor, productSize);
        // return  targetPlaceID: string, countryID: string,
        // const targetPlaces = this.getOrderTargetPlace(orderID);
        // const targetPlaceID = targetPlaces[targetPlaceIndex].targetPlace.targetPlaceID;
        // const countryID = targetPlaces[targetPlaceIndex].targetPlace.countryID;
        const currentCompanyOrderZoneStyleSize = [...this.currentCompanyOrderZoneStyleSize];

        const companyOrder = currentCompanyOrderZoneStyleSize.filter(i=>i.orderID == orderID &&
            i.productColor == productColor &&
            i.productSize == productSize && i.targetPlaceID == targetPlaceID);
        if (companyOrder.length>0) {
            return companyOrder[0].sumQty;
        } else {
            return '';
        }
    }



    getOrderForLossQty(companyID: string, orderID: string, style: string,
        productColor: string, productSize: string, targetPlaceID: string) {

        if (this.modeShow !== 'styleZone' || this.tabNameActiveA !== orderID) { return ''; } // ## do when this tabView is active

        // console.log(companyID, orderID, style, productColor, productSize);
        // return  targetPlaceID: string, countryID: string,
        // const targetPlaces = this.getOrderTargetPlace(orderID);
        // const targetPlaceID = targetPlaces[targetPlaceIndex].targetPlace.targetPlaceID;
        // const countryID = targetPlaces[targetPlaceIndex].targetPlace.countryID;
        const companyOrder = this.currentProductionZoneForLoss.filter(i=>i.orderID == orderID &&
            i.color == productColor && i.size == productSize && i.targetPlaceID == targetPlaceID);
        if (companyOrder.length>0) {
            return '('+companyOrder[0].sumProductQty+')';
        } else {
            return '';
        }
    }

    editQTY(companyID: string, orderID: string, style: string, color: string, size: string, fromNode: string
        , targetPlaceID: string) {
        //

        if (this.repMode === 'rep-fac-production-period-edit-qty'
            || this.repMode === 'rep-fac-production-period-qty-plan-adjust') {
            //
            // console.log(companyID, orderID, style, color, size, fromNode, targetPlaceID);
            this.showEditQTY(companyID, orderID, style, color, size, fromNode, targetPlaceID);
        }

    }

    getPeriodQty(companyID: string, orderID: string, style: string, color: string, size: string, fromNode: string
                , targetPlaceID: string) {
        // console.log(companyID, orderID, style, color, size, fromNode, targetPlaceID);

        if (this.modeShow !== 'styleZone' || this.tabNameActiveA !== orderID) { return ''; } // ## do when this tabView is active

        // let orderQty = this.getOrderQty(companyID, orderID, style, color, size, targetPlaceID);
        // orderQty = orderQty === '' ? 0 : orderQty;
        // const forLossPeriodQty = this.getForLossPeriodQty(companyID, orderID, style, color, size, fromNode, targetPlaceID);

        let qty = this.getOrderQty(companyID, orderID, style, color, size, targetPlaceID);
        qty = qty === '' ? 0 : qty;

        // if (orderID==='AAOPHA4A' && targetPlaceID==='UK') {
        //     // console.log(companyOrder[0].sumQty);
        //     const order1 = this.orders.filter(i=>i.orderID=='AAOPHA4A');
        //     console.log(order1[0].orderSetting.qtyMaxView);
        // }

        const currentProductionPeriod = this.currentProductionZonePeriod.filter(i=>i.orderID == orderID &&
            i.color == color && i.size == size && i.fromNode == fromNode
            && i.targetPlaceID == targetPlaceID);
        if (currentProductionPeriod.length>0) {

            const order1 = this.orders.filter(i=>i.orderID==orderID);
            const order01 = order1.length > 0 ? order1[0]: undefined;
            const order001 = order01 && order01.orderSetting ? order01.orderSetting: undefined;
            const order0001 = order001 && order001.qtyMaxView ? order001.qtyMaxView: undefined;
            const qtyMaxView = order0001 ?order0001: undefined;
            const zcs = color+';'+size+';'+targetPlaceID;
            // zcs: 'CG;XS;UK', maxQty: 100

            // return currentProductionPeriod[0].sumProductQty;
            const sumProductQty = currentProductionPeriod[0].sumProductQty;

            let sumProduct = 0;
            let maxQty = 0;
            sumProduct = sumProductQty >= qty ? qty : sumProductQty;
            if (qtyMaxView && qtyMaxView.length>0 && this.isMaxQtyView) {
                const qtyMaxView1 = qtyMaxView.filter(i=>i.zcs==zcs);
                if (qtyMaxView1.length>0) {
                    maxQty = qtyMaxView1[0].maxQty;
                    if (maxQty > 0 && maxQty <= sumProduct) {
                        return maxQty;
                    }
                }
            }
            return sumProduct;
        } else {
            return '';
        }
    }

    getForLossPeriodQty(companyID: string, orderID: string, style: string, color: string, size: string, fromNode: string
                , targetPlaceID: string) {
        // console.log(companyID, orderID, style, color, size, fromNode);

        // if (orderID === 'DCA42A4A' && color === 'BL' && targetPlaceID === 'UK' && fromNode === '2.PANAL-INSPECTION') {
        //     console.log(companyID, orderID, style, color, size, fromNode);
        // }

        if (this.modeShow !== 'styleZone' || this.tabNameActiveA !== orderID) { return ''; } // ## do when this tabView is active

        let qty = this.getOrderQty(companyID, orderID, style, color, size, targetPlaceID);
        qty = qty === '' ? 0 : qty;

        const currentProductionPeriod = this.currentProductionZonePeriod.filter(i=>i.orderID == orderID &&
            i.color == color && i.size == size && i.fromNode == fromNode
            && i.targetPlaceID == targetPlaceID);
        if (currentProductionPeriod.length>0) {
            // return currentProductionPeriod[0].sumProductQty;
            const sumProductQty =  currentProductionPeriod[0].sumProductQty;
            const forLoss =  sumProductQty > qty ? '(' + (+sumProductQty - +qty) + ')' : '';
            // if (orderID === 'DCA42A4A' && color === 'BL' && targetPlaceID === 'UK' && fromNode === '2.PANAL-INSPECTION') {
            //     console.log('getForLossPeriodQty',sumProductQty, qty, forLoss);
            // }
            return forLoss;
        } else {
            return '';
        }
    }



    getPercentPeriodQty(percentRemain: string, companyID: string, orderID: string, style: string, color: string, size: string, fromNode: string
        , targetPlaceID: string) {

        if (this.modeShow !== 'styleZone' || this.tabNameActiveA !== orderID) { return ''; } // ## do when this tabView is active

        const sumQty = +this.getOrderQty(companyID, orderID, style, color, size, targetPlaceID);
        const sumProductQty = +this.getPeriodQty(companyID, orderID, style, color, size, fromNode, targetPlaceID);
        const percent = 100 - Math.floor(+sumProductQty / +sumQty * 100);
        const result = isNaN(percent) || percent === 0 ?'':percent+'%';
        // return result;

        if (percentRemain === '') {
            return result;
        } else if (percentRemain === 'qtyCompleted') {
            const percent2 = Math.floor(+sumProductQty / +sumQty * 100);
            const result2 = isNaN(percent2) || percent2 === 0 ?'':percent2+'%';
            return result2;
        } else {
            return result;
        }
    }

    getPercentPeriodQtyReamin(companyID: string, orderID: string, style: string, color: string, size: string, fromNode: string
        , targetPlaceID: string) {

        if (this.modeShow !== 'styleZone' || this.tabNameActiveA !== orderID) { return ''; } // ## do when this tabView is active

        const sumQty = +this.getOrderQty(companyID, orderID, style, color, size, targetPlaceID);
        const sumProductQty = +this.getPeriodQty(companyID, orderID, style, color, size, fromNode, targetPlaceID);

        const result = +sumQty - +sumProductQty;
        return result <= 0 ?'':result;
    }


    // ## mode = 'maxview'
    getOrderQtyGrandTotal(idx: number, color: ColorS, targetPlaceID: string, mode: string) {
        // const companyID = this.currentProductionZonePeriodGroup[idx][0].companyID;
        // const companyID = this.company.companyID;
        const orderID = this.currentProductionZonePeriodGroup[idx][0].orderID;
        const style = this.currentProductionZonePeriodGroup[idx][0].orderID;

        if (this.modeShow !== 'styleZone' || this.tabNameActiveA !== orderID) { return ''; } // ## do when this tabView is active

        // console.log(idx, idx2);
        // console.log( color);
        // console.log(this.currentProductionPeriodGroup);
        // console.log(this.currentProductionPeriodGroup[idx]);
        // console.log(this.currentProductionPeriodGroup[idx2]);
        // const colorss: string[] =  this.orderStyleColorSizeGroupColorFilter(idx2);

        // productColor  //  && i.productColor == colorss[]


        // companyID  orderID  style

        // console.log(companyID, orderID, style);


        const currentCompanyOrderZoneStyleSize2 = this.currentCompanyOrderZoneStyleSize.map(obj => ({...obj})); // copy array object
        const companyOrder = currentCompanyOrderZoneStyleSize2.filter(i=>i.orderID == orderID &&
            i.productColor == color.color.colorID &&
            i.targetPlaceID == targetPlaceID);
        //
        // console.log(companyOrder);
        // this.yarnDataInfoOld = this.yarnDataInfo.map(obj => ({...obj})); // copy array object
        const companyOrder2 = companyOrder.map(obj => ({...obj})); // copy array object

        if (mode === '' || !this.isMaxQtyView) {
            if (companyOrder.length>0) {
                // console.log(companyOrder);
                // return companyOrder[0].sumQty;
                const totalQtyColumn = companyOrder.reduce((prev, cur) => {return prev + cur.sumQty;}, 0);
                return totalQtyColumn;
            } else {
                return '0';
            }
        } else if (mode === 'maxview' && this.isMaxQtyView) {
            const order1 = this.orders.filter(i=>i.orderID==orderID);
            const order01 = order1.length > 0 ? order1[0]: undefined;
            const order001 = order01 && order01.orderSetting ? order01.orderSetting: undefined;
            const order0001 = order001 && order001.qtyMaxView ? order001.qtyMaxView: undefined;
            const qtyMaxView = order0001 ?order0001: undefined;
            // const zcs = color+';'+size+';'+targetPlaceID;
            if (qtyMaxView && qtyMaxView.length > 0) {
                // const companyOrder2 = [...companyOrder];
                companyOrder2.forEach( (item, index) => {
                    const zcs = item.productColor+';'+item.productSize+';'+item.targetPlaceID;
                    item.zcs = zcs;
                });
                // console.log(companyOrder2);
                if (companyOrder2.length>0) {
                    qtyMaxView.forEach( (item, index) => {
                        const idx = companyOrder2.findIndex( fi =>(fi.zcs === item.zcs));
                        if (idx >= 0) {
                            companyOrder2[idx].sumQty = item.maxQty;
                        }
                    });
                    // console.log(companyOrder2, qtyMaxView, orderID);
                    const totalQtyColumn = companyOrder2.reduce((prev, cur) => {return prev + cur.sumQty;}, 0);
                    return totalQtyColumn;
                } else {
                    return '0';
                }
            } else  {
                if (companyOrder.length>0) {
                    const totalQtyColumn = companyOrder.reduce((prev, cur) => {return prev + cur.sumQty;}, 0);
                    return totalQtyColumn;
                } else {
                    return '0';
                }
            }
            // return '0';
        } else {
            return '0';
        }
    }

    getOrderQtyColumnTotal(idx: number, color: ColorS, fromNode: string, targetPlaceID: string) {
        // console.log(idx, idx2);
        // console.log( groupColor);
        // const companyID = this.currentProductionZonePeriodGroup[idx][0].companyID;
        const orderID = this.currentProductionZonePeriodGroup[idx][0].orderID;
        const style = this.currentProductionZonePeriodGroup[idx][0].orderID;

        if (this.modeShow !== 'styleZone' || this.tabNameActiveA !== orderID) { return ''; } // ## do when this tabView is active

        const grandTotal = +this.getOrderQtyGrandTotal(idx, color, targetPlaceID, 'maxview');

        // companyID  orderID  style

        // console.log(companyID, orderID, style);
        const currentProductionZonePeriodGroup2: any[] = this.currentProductionZonePeriodGroup[idx];


        const currentProductionPeriod = this.currentProductionZonePeriod.filter(i=>i.orderID == orderID &&
            i.color == color.color.colorID && i.fromNode == fromNode && i.targetPlaceID == targetPlaceID);
        // console.log(currentProductionPeriod);
        // if (color.color.colorID === 'RG') {
        //     console.log(this.currentProductionZonePeriodGroup[idx]);
        //     console.log(currentProductionPeriod);
        //     console.log(color);
        // }


        if (currentProductionPeriod.length>0) {
            // console.log(currentProductionPeriod);
            // return currentProductionPeriod[0].sumProductQty;
            const totalQtyColumn = currentProductionPeriod.reduce((prev, cur) => {return prev + cur.sumProductQty;}, 0);

            // ## case = customer no need to show for loss
            // if (this.checkRepModeArr('noshowForLoss') && (+grandTotal <= +totalQtyColumn)) {
            if ((+grandTotal <= +totalQtyColumn)) {
                return grandTotal;
            }
            return totalQtyColumn;
        } else {
            return '0';
        }

    }

    getOrderQtyColumnTotal2(idx: number, color: ColorS, fromNode: string, orderID: string, targetPlaceID: string) {
        // console.log(idx, idx2);
        // console.log( groupColor);

        if (this.modeShow !== 'zoneStyle' || this.tabNameActiveC !== targetPlaceID) { return '0'; } // ## do when this tabView is active

        const grandTotal = +this.getOrderQtyGrandTotal2(idx, color, orderID, targetPlaceID, 'maxview');

        // companyID  orderID  style
        // const companyID = this.company.companyID;

        const currentProductionPeriod = this.currentProductionZonePeriod.filter(i=>i.orderID.trim() == orderID.trim() &&
            i.color == color.color.colorID && i.fromNode == fromNode && i.targetPlaceID == targetPlaceID);
        // console.log(currentProductionPeriod);
        // if (color.color.colorID === 'RG') {
        //     console.log(this.currentProductionZonePeriodGroup[idx]);
        //     console.log(currentProductionPeriod);
        //     console.log(color);
        // }

        if (currentProductionPeriod.length>0) {
            // console.log(currentProductionPeriod);
            // return currentProductionPeriod[0].sumProductQty;
            const totalQtyColumn = currentProductionPeriod.reduce((prev, cur) => {return prev + cur.sumProductQty;}, 0);

            // ## case = customer no need to show for loss
            // if (this.checkRepModeArr('noshowForLoss') && (+grandTotal <= +totalQtyColumn)) {
            if ( (+grandTotal <= +totalQtyColumn)) {
                return grandTotal;
            }

            return totalQtyColumn;
        } else {
            return '0';
        }

    }

    getOrderQtyGrandTotal2(idx: number, color: ColorS, orderID: string, targetPlaceID: string, mode: string) {

        if (this.modeShow !== 'zoneStyle' || this.tabNameActiveC !== targetPlaceID) { return '0'; } // ## do when this tabView is active

        // console.log(idx, idx2);
        // console.log( color);
        // console.log(this.currentProductionPeriodGroup);
        // console.log(this.currentProductionPeriodGroup[idx]);
        // console.log(this.currentProductionPeriodGroup[idx2]);
        // const colorss: string[] =  this.orderStyleColorSizeGroupColorFilter(idx2);

        // productColor  //  && i.productColor == colorss[]
        // companyID  orderID  style
        // const companyID = this.company.companyID;

        const currentCompanyOrderZoneStyleSize = this.currentCompanyOrderZoneStyleSize.map(obj => ({...obj})); // copy array object
        const companyOrder = currentCompanyOrderZoneStyleSize.filter(i=>i.orderID.trim() == orderID.trim() &&
            i.productColor == color.color.colorID &&
            i.targetPlaceID == targetPlaceID);
        //
        // this.yarnDataInfoOld = this.yarnDataInfo.map(obj => ({...obj})); // copy array object
        const companyOrder2 = companyOrder.map(obj => ({...obj})); // copy array object

        if (mode=='' || !this.isMaxQtyView) {
            if (companyOrder.length>0) {
                // console.log(companyOrder);
                // return companyOrder[0].sumQty;
                const totalQtyColumn = companyOrder.reduce((prev, cur) => {return prev + cur.sumQty;}, 0);
                return totalQtyColumn;
            } else {
                return '0';
            }
        } else if (mode=='maxview' && this.isMaxQtyView) {
            const order1 = this.orders.filter(i=>i.orderID==orderID);
            const order01 = order1.length > 0 ? order1[0]: undefined;
            const order001 = order01 && order01.orderSetting ? order01.orderSetting: undefined;
            const order0001 = order001 && order001.qtyMaxView ? order001.qtyMaxView: undefined;
            const qtyMaxView = order0001 ?order0001: undefined;
            // const zcs = color+';'+size+';'+targetPlaceID;
            if (qtyMaxView && qtyMaxView.length > 0) {
                // const companyOrder2 = [...companyOrder];
                companyOrder2.forEach( (item, index) => {
                    const zcs = item.productColor+';'+item.productSize+';'+item.targetPlaceID;
                    item.zcs = zcs;
                });
                // console.log(companyOrder2);
                if (companyOrder2.length>0) {
                    qtyMaxView.forEach( (item, index) => {
                        const idx = companyOrder2.findIndex( fi =>(fi.zcs === item.zcs));
                        if (idx >= 0) {
                            companyOrder2[idx].sumQty = item.maxQty;
                        }
                    });
                    // console.log(companyOrder2);
                    const totalQtyColumn = companyOrder2.reduce((prev, cur) => {return prev + cur.sumQty;}, 0);
                    return totalQtyColumn;
                } else {
                    return '0';
                }
            } else  {
                if (companyOrder.length>0) {
                    const totalQtyColumn = companyOrder.reduce((prev, cur) => {return prev + cur.sumQty;}, 0);
                    return totalQtyColumn;
                } else {
                    return '0';
                }
            }
        } else {
            return '0';
        }

    }

    getOrderQtyC(companyID: string, orderID: string, style: string,
        productColor: string, productSize: string, targetPlaceID: string) {
        // console.log(companyID, orderID, style, productColor, productSize);
        // return  targetPlaceID: string, countryID: string,
        // const targetPlaces = this.getOrderTargetPlace(orderID);
        // const targetPlaceID = targetPlaces[targetPlaceIndex].targetPlace.targetPlaceID;
        // const countryID = targetPlaces[targetPlaceIndex].targetPlace.countryID;

        // ##  'styleZone' , 'zoneStyle'   this.modeShow = modeShow;

        if (this.modeShow !== 'zoneStyle' || this.tabNameActiveC !== targetPlaceID) { return ''; } // ## do when this tabView is active

        const companyOrder = this.currentCompanyOrderZoneStyleSize.filter(i=>i.orderID == orderID &&
            i.productColor == productColor &&
            i.productSize == productSize && i.targetPlaceID == targetPlaceID);
        if (companyOrder.length>0) {
            // if (orderID==='AAOPHA4A' && targetPlaceID==='UK') {console.log(companyOrder[0].sumQty);}
            return companyOrder[0].sumQty;
        } else {
            return '';
        }
    }

    getOrderForLossQtyC(companyID: string, orderID: string, style: string,
        productColor: string, productSize: string, targetPlaceID: string) {
        // console.log(companyID, orderID, style, productColor, productSize);
        // return  targetPlaceID: string, countryID: string,
        // const targetPlaces = this.getOrderTargetPlace(orderID);
        // const targetPlaceID = targetPlaces[targetPlaceIndex].targetPlace.targetPlaceID;
        // const countryID = targetPlaces[targetPlaceIndex].targetPlace.countryID;

        if (this.modeShow !== 'zoneStyle' || this.tabNameActiveC !== targetPlaceID) { return ''; } // ## do when this tabView is active

        const companyOrder = this.currentProductionZoneForLoss.filter(i=>i.orderID == orderID &&
            i.color == productColor && i.size == productSize && i.targetPlaceID == targetPlaceID);
        if (companyOrder.length>0) {
            return '('+companyOrder[0].sumProductQty+')';
        } else {
            return '';
        }
    }

    getPeriodQtyC(companyID: string, orderID: string, style: string, color: string, size: string, fromNode: string
                , targetPlaceID: string) {
        // console.log(companyID, orderID, style, color, size, fromNode);

        // let orderQty = this.getOrderQty(companyID, orderID, style, color, size, targetPlaceID);
        // orderQty = orderQty === '' ? 0 : orderQty;
        // const forLossPeriodQty = this.getForLossPeriodQty(companyID, orderID, style, color, size, fromNode, targetPlaceID);

        if (this.modeShow !== 'zoneStyle' || this.tabNameActiveC !== targetPlaceID) { return ''; } // ## do when this tabView is active

        let qty = this.getOrderQtyC(companyID, orderID, style, color, size, targetPlaceID);
        qty = qty === '' ? 0 : qty;

        // console.log(targetPlaceID);
        // if (orderID==='AAOPHA4A' && targetPlaceID==='UK') {
        //     // console.log(companyOrder[0].sumQty);
        //     const order1 = this.orders.filter(i=>i.orderID=='AAOPHA4A');
        //     console.log(order1[0].orderSetting.qtyMaxView);
        // }

        const currentProductionPeriod = this.currentProductionZonePeriod.filter(i=>i.orderID == orderID &&
            i.color == color && i.size == size && i.fromNode == fromNode
            && i.targetPlaceID == targetPlaceID);
        if (currentProductionPeriod.length>0) {

            const order1 = this.orders.filter(i=>i.orderID==orderID);
            const order01 = order1.length > 0 ? order1[0]: undefined;
            const order001 = order01 && order01.orderSetting ? order01.orderSetting: undefined;
            const order0001 = order001 && order001.qtyMaxView ? order001.qtyMaxView: undefined;
            const qtyMaxView = order0001 ?order0001: undefined;
            const zcs = color+';'+size+';'+targetPlaceID;

            // return currentProductionPeriod[0].sumProductQty;
            const sumProductQty = currentProductionPeriod[0].sumProductQty;

            let sumProduct = 0;
            let maxQty = 0;
            sumProduct = sumProductQty >= qty ? qty : sumProductQty;
            if (qtyMaxView && qtyMaxView.length>0 && this.isMaxQtyView) {
                const qtyMaxView1 = qtyMaxView.filter(i=>i.zcs==zcs);
                if (qtyMaxView1.length>0) {
                    maxQty = qtyMaxView1[0].maxQty;
                    if (maxQty > 0 && maxQty <= sumProduct) {
                        return maxQty;
                    }
                }
            }
            return sumProduct;
        } else {
            return '';
        }
    }

    getForLossPeriodQtyC(companyID: string, orderID: string, style: string, color: string, size: string, fromNode: string
                , targetPlaceID: string) {
        // console.log(companyID, orderID, style, color, size, fromNode);

        if (this.modeShow !== 'zoneStyle' || this.tabNameActiveC !== targetPlaceID) { return ''; } // ## do when this tabView is active

        let qty = this.getOrderQtyC(companyID, orderID, style, color, size, targetPlaceID);
        qty = qty === '' ? 0 : qty;

        const currentProductionPeriod = this.currentProductionZonePeriod.filter(i=>i.orderID == orderID &&
            i.color == color && i.size == size && i.fromNode == fromNode
            && i.targetPlaceID == targetPlaceID);
        if (currentProductionPeriod.length>0) {
            // return currentProductionPeriod[0].sumProductQty;
            const sumProductQty =  currentProductionPeriod[0].sumProductQty;
            const forLoss =  sumProductQty > qty ? '(' + (+sumProductQty - +qty) + ')' : '';
            // if (orderID === 'DCA42A4A' && color === 'BL' && targetPlaceID === 'UK' && fromNode === '2.PANAL-INSPECTION') {
            //     console.log('getForLossPeriodQtyC',sumProductQty, qty, forLoss);
            // }
            return forLoss;
        } else {
            return '';
        }
    }

    getPercentPeriodQtyC(percentRemain: string, companyID: string, orderID: string, style: string, color: string, size: string, fromNode: string
        , targetPlaceID: string) {

        if (this.modeShow !== 'zoneStyle' || this.tabNameActiveC !== targetPlaceID) { return ''; } // ## do when this tabView is active

        const sumQty = +this.getOrderQtyC(companyID, orderID, style, color, size, targetPlaceID);
        const sumProductQty = +this.getPeriodQtyC(companyID, orderID, style, color, size, fromNode, targetPlaceID);
        const percent = 100 - Math.floor(+sumProductQty / +sumQty * 100);
        const result = isNaN(percent) || percent === 0 ?'':percent+'%';
        // return result;



        if (percentRemain === '') {
            return result;
        } else if (percentRemain === 'qtyCompleted') {
            const percent2 = Math.floor(+sumProductQty / +sumQty * 100);
            const result2 = isNaN(percent2) || percent2 === 0 ?'':percent2+'%';
            return result2;
        } else {
            return result;
        }
    }

    getPercentPeriodQtyReaminC(companyID: string, orderID: string, style: string, color: string, size: string, fromNode: string
        , targetPlaceID: string) {

        if (this.modeShow !== 'zoneStyle' || this.tabNameActiveC !== targetPlaceID) { return ''; } // ## do when this tabView is active

        const sumQty = +this.getOrderQtyC(companyID, orderID, style, color, size, targetPlaceID);
        const sumProductQty = +this.getPeriodQtyC(companyID, orderID, style, color, size, fromNode, targetPlaceID);

        const result = +sumQty - +sumProductQty;
        return result <= 0 ?'':result;
    }



    getNodeFlow() {
        // getNodeFlow(companyID: string, factoryID: string, nodeFlowID: string)
        // getNodeFlowUpdatedListener()
        this.nodeFlow = GBC.clrNodeFlow();
        this.flowSeq = [];
        this.nodeStations = [];
        const nodeFlowID = 'main';
        if (this.repMode === 'factory-scan-product-period') {
            this.nsService.stfGetNodeFlow(this.company.companyID, this.factory.factoryID, nodeFlowID);
        } else {
            this.nsService.getNodeFlow(this.company.companyID, this.factory.factoryID, nodeFlowID);
        }

        if (this.nodeFlowSub) { this.nodeFlowSub.unsubscribe(); }
        this.nodeFlowSub = this.nsService.getNodeFlowUpdatedListener().subscribe((data) => {
            // console.log(data);
            this.nodeFlow = data.nodeFlow;
            this.flowSeq = this.nodeFlow.flowSeq;
            this.nodeStations = data.nodeStations;
            this.userService.nodeStations = this.nodeStations;
            // getNodeStationName(nodeStations: NodeStation[], nodeID: string)
            // console.log(this.nodeFlow);
            // console.log(this.flowSeq);
            // console.log(this.nodeStations);
        });
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

    getOrderFactory(orderID: string, mode: 'id'|'name1'|'name2') {
        const factory = this.userService.getOrderFactory(orderID, mode);
        // console.log(factory);
        return factory;
    }

    // getQTYEdit('edit-qty', period.orderID, period.productColor, period.productSize, dep.nodeID, place[0].targetPlaceID)
    getQTYEdit(editType: string, orderID: string, productColor: string, productSize: string, nodeID: string, targetPlaceID: string): string {
        // console.log(editType, orderID, productColor, productSize, nodeID, targetPlaceID);
        const repQTYEditListF = this.repQTYEditList.filter(i=>
            i.editType === editType
            && i.orderID === orderID
            && i.productColor === productColor
            && i.productSize === productSize
            && i.fromNode === nodeID
            && i.targetPlaceID === targetPlaceID
        );
        if (repQTYEditListF.length > 0) {
            // console.log(editType, orderID, productColor, productSize, nodeID, targetPlaceID);
            return '+' + repQTYEditListF[0].sumProductQty;
        } else {
            return '';
        }
    }

    getRepQTYEditBySeasonYear(companyID: string, seasonYear: string) {
        this.repService.getRepQTYEditBySeasonYear(companyID, seasonYear);
        if (this.ordersByOrderIDsSub) { this.ordersByOrderIDsSub.unsubscribe(); }
        this.repQTYEditBySeasonYearSub = this.repService.getRepQTYEditListListener().subscribe((data) => {
            // console.log(data);
            this.repQTYEditList = data.repQTYEditList;
        });
    }

    showEditQTY(companyID: string, orderID: string, style: string, color: string, size: string, fromNode: string
        , targetPlaceID: string) {
        // let zoneTxtArr = [zone];
        const qty = this.getPeriodQty(companyID, orderID, orderID, color, size, fromNode, targetPlaceID);
        const sizeSeq = this.userService.getSizeSeq(size);
        const targetPlaceSeq =  this.userService.getTargetPlaceSeq1(targetPlaceID);
        const targetPlaceName = this.userService.getTargetPlaceName(targetPlaceID);
        const setName = this.userService.getSetNameColorByOrderID(orderID);
        const colorName = this.userService.getColorNameByColorCode(color, setName);
        const colorCode = this.userService.getColorCodeByColorIDSetName(color, setName);

        const seasonYear = this.seasonYear;
        const productStatus = this.productStatus; // normal , problem, complete
        const orderStatus = this.orderStatus;

        // rep-fac-production-period-edit-qty  rep-fac-production-period-qty-plan-adjust
        let popupHeader = '';
        let header = '';
        let editType = '';  // ## edit-qty , plan-adjust
        if (this.repMode === 'rep-fac-production-period-edit-qty') {
            popupHeader = 'DARK edit mode';
            header = 'DARK MODE';
            editType = 'edit-qty';
        } else if (this.repMode === 'rep-fac-production-period-qty-plan-adjust') {
            popupHeader = 'Plan adjust mode';
            header = 'Plan adjust mode';
            editType = 'plan-adjust';
        } else {
            popupHeader = '';
            header = '';
            editType = '';
        }

        let newQTY = 0;

        const ref = this.dialogService.open(SmdRepProcessEditQtyComponent, {
            data: {
                id: 'showEditQTY',
                repActive: this.repMode,
                seasonYear,
                companyID,
                orderID,
                setName,
                color,
                productColor: color,
                colorCode,
                colorName,
                productSize: size,
                size,
                sizeSeq,
                fromNode,
                targetPlaceID,
                targetPlaceSeq,
                targetPlaceName,
                qty,

                popupHeader,
                header,
                newQTY,
                editType,

                productStatus,
                orderStatus,
            },
            header: popupHeader,
            width: '50%'
        });

        ref.onClose.subscribe((data: any) => {
            // console.log(data);
            if (data) {
                this.getRepQTYEditBySeasonYear(companyID, seasonYear);
            }

        });
    }

    ngOnDestroy(): void {
        if (this.repCurrentProductionZonePeriodSub) { this.repCurrentProductionZonePeriodSub.unsubscribe(); }
        if (this.nodeFlowSub) { this.nodeFlowSub.unsubscribe(); }
        if (this.dataAroundAppSub) { this.dataAroundAppSub.unsubscribe(); }
        if (this.repQTYEditBySeasonYearSub) { this.repQTYEditBySeasonYearSub.unsubscribe(); }

    }
}
