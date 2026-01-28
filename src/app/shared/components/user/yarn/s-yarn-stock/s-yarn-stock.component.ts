import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Location } from '@angular/common';
import { DialogService } from 'primeng/dynamicdialog';
import { Subscription } from 'rxjs/internal/Subscription';

import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';

import { GBC } from 'src/app/global/const-global';
import { ColorS, Company, Factory } from 'src/app/models/app.model';
import { Customer, OrderImage } from 'src/app/models/order.model';
import { DataPCS, DataZONE, Yarn, YarnData, YarnDataInfo, YarnLotUsageList, YarnLotUsageRow, YarnStockCardPCS } from 'src/app/models/yarn.model';
import { UserService } from 'src/app/services/user.service';
import { YarnService } from 'src/app/services/yarn.service';
import { SYarnFilterComponent } from '../../../general/s-yarn-filter/s-yarn-filter.component';
import { SmdSelectOrderComponent } from '../../../general/smd-select-order/smd-select-order.component';
import { SmdYarnSeasonyearComponent } from '../smd-yarn-seasonyear/smd-yarn-seasonyear.component';
import { SSelectCustomerComponent } from '../../../general/s-select-customer/s-select-customer.component';
import { SSelectFactoryComponent } from '../../../general/s-select-factory/s-select-factory.component';
import { MenuItem } from 'primeng/api';
import { SmdYarnLotTransferComponent } from '../smd-yarn-lot-transfer/smd-yarn-lot-transfer.component';
import { SCcDateSelectComponent } from '../../../component/s-cc-date-select/s-cc-date-select.component';
import { SmdConfirmImportantTaskComponent } from '../../../general/smd-confirm-important-task/smd-confirm-important-task.component';
import { SmdInputNumber1Component } from '../../../general/smd-input-number1/smd-input-number1.component';
import { SmdSelectZone1Component } from '../../../general/smd-select-zone1/smd-select-zone1.component';


(pdfMake as any).vfs = pdfFonts.pdfMake.vfs;

@Component({
  selector: 'app-s-yarn-stock',
  templateUrl: './s-yarn-stock.component.html',
  styleUrls: ['./s-yarn-stock.component.scss'],
  providers: [DialogService],
})
export class SYarnStockComponent implements OnInit, OnDestroy {
    @Input() mode = '';  // ## view, yarn-packaging-list-stock-card , fac-lot
    @Input() yarnSeason = '';
    @Input() company: Company = GBC.clrCompany();
    @Input() factorySelect: Factory = GBC.clrFactory();
    @Input() factoryCTSelect: Factory = GBC.clrFactory();
    @Input() customer: Customer = GBC.clrCustomer();
    @Input() orderImagesSelect: OrderImage[] = [];
    @Input() colorS: ColorS = GBC.clrOrderColor();
    @Input() yarnColorID = '';
    @Input() yarnDataUUID = '';
    @Input() uuid = '';
    @Input() yarnID = '';
    // @Input() yarnPlan: YarnData = GBC.clrYarnData();
    @Input() yarnDataInfo_Receive: YarnDataInfo[] = [];

    @Output() closeYarnStockCard = new EventEmitter<any>();

    productImageProfileGCSPath = GBC.productImageProfileGCSPath;  // ## google storage path
    nulltGCSPath= GBC.nulltGCSPath;

    isShowBar = false;
    loading = true;
    dateSign = '-';
    items: MenuItem[] = [];

    yarns: Yarn[] = [];
    yarnsCount: number = 0;
    yarnSelects: Yarn[] = [];
    orderImages: OrderImage[] = [];

    yarnLotUsageList: YarnLotUsageList[] = [];
    yarnStockCardPCS: YarnStockCardPCS = GBC.clrYarnStockCardPCS();
    // yarnLotUsageList0: YarnLotUsageList = GBC.clrYarnLotUsageList();  // ## blank row data
    yarnLotUsageRow: YarnLotUsageRow[] = [];
    yarnLotUsageRowOld: YarnLotUsageRow[] = [];
    // yarnLotUsageRowLast: YarnLotUsageRow = GBC.clrYarnLotUsageRow();
    yarnLotUsageRowMaster: YarnLotUsageRow[] = [];
    yarnLotUsageRow0: YarnLotUsageRow = GBC.clrYarnLotUsageRow();  // ## blank row data
    yarnLotUsageRowCurrent: YarnLotUsageRow = {...GBC.clrYarnLotUsageRow()};  // ## check current row

    idxLastLine = 0;
    usageModeInvisible = '';

    content: any[] = [];

    private dataAroundAppSub: Subscription = new Subscription();
    private yarnUsageListSub: Subscription = new Subscription();
    private yarnStockCardPCSSub: Subscription = new Subscription();

    constructor(
        // private router: Router,
        private location: Location,
        public dialogService: DialogService,

        public userService: UserService,
        public yarnService: YarnService,
    ) {}





    ngOnInit(): void {
        // console.log(this.mode);
        // console.log(this.yarnID, this.uuid);
        // console.log(this.orderImagesSelect, this.colorS);
        // console.log(this.yarnDataInfo_Receive);
        // console.log(this.yarnColorID, this.yarnDataUUID);
        // console.log(this.factorySelect, this.factoryCTSelect);
        this.location.replaceState('/'); // ## hide loocation
        // this.userService.setFormActive(this.formActive);

        // this.yarnSeason = this.userService.yarnSeason;
        // this.customer = this.userService.getCustomer();
        // this.factorySelect = this.userService.factorySelect;
        // this.userService.setYarnSeason(this.yarnSeason);
        // this.userService.factorySelect = this.factorySelect;
        // this.userService.setCustomer(this.customer);

        // this.userService.setCustomer(GBC.clrCustomer());
        // this.userService.factorySelect = GBC.clrFactory();



        this.dataAroundAppSub = this.userService
            .getDataAroundAppStatusListener()
            .subscribe((dataAroundApp) => {
                // ## declare initial variable from service user

                this.customer = dataAroundApp.customer;
                this.factorySelect = dataAroundApp.factorySelect;
                this.yarnSeason = dataAroundApp.yarnSeason;
                // this.checkMode();
            });

        // console.log(this.mode);
        // ## prepare data
        this.prepareDate();
    }

    prepareDate() {
        // console.log(this.mode);
        // console.log('prepareDate');
        // yarnColorID , type='receive'
        const type = 'receive';
        this.yarnDataInfo_Receive = this.yarnDataInfo_Receive.filter(i=>
            i.yarnColorID == this.yarnColorID &&
            i.type == type
        );
        // console.log(this.yarnDataInfo_Receive);
        // console.log(this.yarnDataUUID);

        this.getYarnUsage();
        // if (this.mode === 'yarn-packaging-list-stock-card') {

        // } else if (this.mode === 'fac-lot') {

        // }
    }


    getYarnUsage() {
        // console.log(this.mode);
        // console.log('getYarnUsage');
        this.loading = true;
        this.yarnLotUsageList = [];
        this.yarnLotUsageRow = [];
        this.yarnLotUsageRowCurrent = {...GBC.clrYarnLotUsageRow()};

        const companyID = this.company.companyID;
        const factoryID = this.factorySelect.factoryID; // ## case mode = 'yarn-packaging-list-stock-card'
        const setfactoryID = this.factorySelect.factoryID;  // ## case mode = 'fac-lot'
        const customerID = this.customer.customerID;
        const uuid = this.uuid;
        const yarnID = this.yarnID;
        const status = ['open'];
        const yarnSeasonID = this.yarnSeason;
        const yarnColorID = this.yarnColorID;
        const yarnDataUUID = this.yarnDataUUID;
        // getYarnUsage(companyID: string, factoryID: string, customerID: string, yarnSeasonID: string, yarnID: string,
        //     yarnColorID: string, yarnDataUUID: string, status: string[])
        if (this.mode === 'yarn-packaging-list-stock-card') {
            const toFactoryID = '*';
            this.yarnService.getYarnUsage(companyID, factoryID, toFactoryID, customerID, yarnSeasonID, yarnID, uuid, yarnColorID, yarnDataUUID, status);
        } else if (this.mode === 'fac-lot') {
            const toFactoryID = setfactoryID;
            this.yarnService.getYarnUsageCF(companyID, setfactoryID, toFactoryID, customerID, yarnSeasonID, yarnID, uuid, yarnColorID, yarnDataUUID, status);
        }
        // console.log(this.mode);
        if (this.yarnUsageListSub) { this.yarnUsageListSub.unsubscribe(); }
        this.yarnUsageListSub = this.yarnService.getYarnUsageListener().subscribe((data) => {
            this.yarnLotUsageList = [];
            this.yarnLotUsageRow = [];
            // console.log(this.mode);
            // console.log(companyID, factoryID, '*', customerID, yarnSeasonID, yarnID, yarnColorID, yarnDataUUID, status);
            // console.log(data);
            // console.log(data.yarnStockCardPCS);
            this.loading = false;
            this.yarnLotUsageList = data.yarnLotUsageList;
            // this.yarnStockCardPCS = data.yarnStockCardPCS;
            this.yarnStockCardPCS = data.yarnStockCardPCS?data.yarnStockCardPCS:GBC.clrYarnStockCardPCS();
            // console.log(this.yarnStockCardPCS);
            // this.yarnLotUsageList.sort((a,b)=>{ return a.yyyymmdd2 >b.yyyymmdd2?1:a.yyyymmdd2 <b.yyyymmdd2?-1:0 });

            this.yarnLotUsageList.forEach( (item, index) => {
                item.usageSeq = this.userService.getUsageModeSeq(item.usageMode);
            });

            if (this.mode==='yarn-packaging-list-stock-card') {
                this.yarnLotUsageList.sort((a,b)=>{
                    return a.yyyymmdd2 >b.yyyymmdd2?1:a.yyyymmdd2 <b.yyyymmdd2?-1:0
                    || a.usageSeq >b.usageSeq?1:a.usageSeq <b.usageSeq?-1:0
                    || a.invoiceID >b.invoiceID?1:a.invoiceID <b.invoiceID?-1:0
                    || a.usageInfo.toFactoryID >b.usageInfo.toFactoryID?1:a.usageInfo.toFactoryID <b.usageInfo.toFactoryID?-1:0
                    || a.usageInfo.orderID >b.usageInfo.orderID?1:a.usageInfo.orderID <b.usageInfo.orderID?-1:0
                    || a.yarnLotID >b.yarnLotID?1:a.yarnLotID <b.yarnLotID?-1:0
                });
            } else if (this.mode==='fac-lot') {
                this.yarnLotUsageList.sort((a,b)=>{
                    return a.yyyymmdd2 >b.yyyymmdd2?1:a.yyyymmdd2 <b.yyyymmdd2?-1:0
                    || a.usageSeq >b.usageSeq?1:a.usageSeq <b.usageSeq?-1:0
                    || a.usageInfo.toFactoryID >b.usageInfo.toFactoryID?1:a.usageInfo.toFactoryID <b.usageInfo.toFactoryID?-1:0
                    || a.usageInfo.orderID >b.usageInfo.orderID?1:a.usageInfo.orderID <b.usageInfo.orderID?-1:0
                    || a.yarnLotID >b.yarnLotID?1:a.yarnLotID <b.yarnLotID?-1:0
                });
            }
            // console.log(this.yarnLotUsageList);

            // ## gen yarnLotUsage Rows
            const s = this.dateSign;
            let balance = 0;
            // this.yarnLotUsageRow.push(this.yarnLotUsageRow0);  // ## add  blank row @ first
            this.yarnLotUsageList.forEach( (item, index) => {
                let yarnLotUsageRow1: YarnLotUsageRow = GBC.clrYarnLotUsageRow();
                yarnLotUsageRow1.usageMode = item.usageMode;
                yarnLotUsageRow1.factoryID = item.factoryID;
                yarnLotUsageRow1.yyyymmdd = item.yyyymmdd;
                yarnLotUsageRow1.yyyymmddIssue = item.yyyymmdd2;

                yarnLotUsageRow1.yarnBoxInfo = item.yarnBoxInfo;
                yarnLotUsageRow1.usageInfo = item.usageInfo;
                yarnLotUsageRow1.invoiceID = item.invoiceID;
                yarnLotUsageRow1.yarnColorID = item.yarnColorID;
                yarnLotUsageRow1.yarnDataUUID = item.yarnDataUUID;
                yarnLotUsageRow1.yarnSeasonID = item.yarnSeasonID;
                yarnLotUsageRow1.yuUUID = item.yuUUID;
                // yarnLotUsageRow1.yarnLotID = item.yarnLotID;
                yarnLotUsageRow1.yarnLotUUID = item.yarnLotUUID;
                // yarnLotUsageRow1.usageSeq = this.userService.getUsageModeSeq(item.usageMode);

                const dateA = item.yyyymmdd.split("-");
                const dateB = item.yyyymmdd2.split("-");
                const ddmmyyyy = dateA[2]+s+dateA[1]+s+dateA[0];
                yarnLotUsageRow1.ddmmyyyy = ddmmyyyy;
                yarnLotUsageRow1.ddmmyyyyIssue = dateB[2]+s+dateB[1]+s+dateB[0];
                if (item.usageMode === 'ct') { // ## ct= fromCustomer
                    // yarnLotUsageRow1.invoiceID = item.invoiceID;
                    yarnLotUsageRow1.yarnLotID = item.yarnLotID;
                    // yarnLotUsageRow1.yarnLotUUID = item.yarnLotUUID;

                    yarnLotUsageRow1.yarnInvoiceWeight = item.usageInfo.yarnInvoiceWeight;
                    yarnLotUsageRow1.yarnWeight = item.yarnWeight;
                    yarnLotUsageRow1.yarnWeightNet = item.yarnWeightNet;
                    yarnLotUsageRow1.useWeight = item.useWeight;
                    // yarnLotUsageRow1.toFactoryID = item.usageInfo.toFactoryID?this.userService.strFirst(this.userService.getUserfactoryName1(item.usageInfo.toFactoryID), 6):'';

                    balance = balance + item.yarnWeightNet;  // ## update balance
                    yarnLotUsageRow1.balance = +balance.toFixed(2);
                    this.yarnLotUsageRow.push(yarnLotUsageRow1);
                } else if (item.usageMode === 't') { // ##  t=transfer

                    const data1: any = {
                        ddmmyyyy,
                        usageMode: item.usageMode,
                        orderID: item.usageInfo.orderID,
                        toFactoryID: this.userService.strFirst(this.userService.getUserfactoryName2(item.usageInfo.toFactoryID), 6),
                        invoiceID: item.invoiceID,
                        yarnBoxInfoLen: item.yarnBoxInfo.length,
                        yarnLotID2: item.yarnLotID,
                        yarnDataUUID: item.yarnDataUUID,
                        yarnLotUUID: item.yarnLotUUID,
                        yuUUID: item.yuUUID,
                    };

                    if (this.factoryCTSelect.factoryID === item.usageInfo.fromFactoryID) {
                        yarnLotUsageRow1.issueNote = 'transfer';

                        yarnLotUsageRow1.toFactoryID = this.userService.strFirst(this.userService.getUserfactoryName2(item.usageInfo.toFactoryID), 6);
                        yarnLotUsageRow1.yarnLotID2 = item.yarnLotID;
                        yarnLotUsageRow1.orderID = item.usageInfo.orderID;
                        yarnLotUsageRow1.orderID2 = item.usageInfo.orderID + ' /' + this.getZoneStockCard(data1);
                        yarnLotUsageRow1.targetPlaceID = this.getZoneStockCard(data1);
                        yarnLotUsageRow1.pcs = this.getPCSStockCard(data1);
                        yarnLotUsageRow1.useYarnWeight = item.useWeight;

                    } else {
                        if ( this.factorySelect.factoryID === item.usageInfo.fromFactoryID) {

                            yarnLotUsageRow1.issueNote = 'transfer';
                            // yarnLotUsageRow1.invoiceID = item.invoiceID;
                            // yarnLotUsageRow1.yarnLotID = item.yarnLotID;
                            // yarnLotUsageRow1.yarnLotUUID = item.yarnLotUUID;

                            yarnLotUsageRow1.toFactoryID = this.userService.strFirst(this.userService.getUserfactoryName2(item.usageInfo.toFactoryID), 6);
                            yarnLotUsageRow1.yarnLotID2 = item.yarnLotID;
                            yarnLotUsageRow1.orderID = item.usageInfo.orderID;
                            yarnLotUsageRow1.orderID2 = item.usageInfo.orderID + ' /' + this.getZoneStockCard(data1);
                            yarnLotUsageRow1.targetPlaceID = this.getZoneStockCard(data1);
                            yarnLotUsageRow1.pcs = this.getPCSStockCard(data1);
                            yarnLotUsageRow1.useYarnWeight = item.useWeight;
                        } else if (this.factorySelect.factoryID === item.usageInfo.toFactoryID) {
                            yarnLotUsageRow1.issueNote = 't.receive';
                            yarnLotUsageRow1.orderID = item.usageInfo.orderID;
                            yarnLotUsageRow1.orderID2 = item.usageInfo.orderID + ' /' + this.getZoneStockCard(data1);
                            yarnLotUsageRow1.targetPlaceID = this.getZoneStockCard(data1);
                            yarnLotUsageRow1.invoiceID = item.invoiceID;
                            yarnLotUsageRow1.yarnLotID = item.yarnLotID;
                            yarnLotUsageRow1.pcs = this.getPCSStockCard(data1);
                            yarnLotUsageRow1.useWeight = item.useWeight;
                            yarnLotUsageRow1.toFactoryID = this.userService.strFirst(this.userService.getUserfactoryName2(item.usageInfo.toFactoryID), 6);
                        }
                    }


                    // ## mode = yarn-packaging-list-stock-card , fac-lot
                    if (this.mode==='yarn-packaging-list-stock-card') {
                        // yarnLotUsageRow1.balance = 0;
                        balance = balance - item.useWeight;  // ## update balance
                        yarnLotUsageRow1.balance = +balance.toFixed(2);
                    } else if (this.mode==='fac-lot') {
                        if (this.factorySelect.factoryID===item.usageInfo.toFactoryID) {
                            balance = balance + item.useWeight;  // ## update balance
                            yarnLotUsageRow1.balance = +balance.toFixed(2);
                        } else {
                            balance = balance - item.useWeight;  // ## update balance
                            yarnLotUsageRow1.balance = +balance.toFixed(2);
                        }
                    }

                    this.yarnLotUsageRow.push(yarnLotUsageRow1);
                } else if (item.usageMode === 'p') { // ##  , p=produce
                    yarnLotUsageRow1.issueNote = 'produce';

                    balance = balance - item.useWeight;  // ## update balance
                    yarnLotUsageRow1.balance = +balance.toFixed(2);
                }
            });

            // this.yarnLotUsageRow.sort((a,b)=>{
            //     return a.yyyymmddIssue >b.yyyymmddIssue?1:a.yyyymmddIssue <b.yyyymmddIssue?-1:0
            //     || a.usageSeq >b.usageSeq?1:a.usageSeq <b.usageSeq?-1:0
            // });

            this.idxLastLine = 0;
            this.yarnLotUsageRow.forEach( (item, index) => {
                if (item.balance > 0) {
                    this.idxLastLine = index;
                }
            });
            // console.log(this.yarnLotUsageRow);
            this.yarnLotUsageRowOld = this.yarnLotUsageRow.map(obj => ({...obj})); // copy array object
            this.yarnLotUsageRowMaster = [...this.yarnLotUsageRow];
        });
    }

    getPCSStockCard(data1: any): number {
        // console.log(data1);
        if (this.yarnStockCardPCS && this.yarnStockCardPCS.dataPCS) {
            const dataPCS: DataPCS[] = [...this.yarnStockCardPCS.dataPCS];
            // console.log(dataPCS);
            const dataPCS1 = dataPCS.filter(i=>i.ddmmyyyy == data1.ddmmyyyy
                && i.usageMode == data1.usageMode
                && i.orderID == data1.orderID
                && i.toFactoryID == data1.toFactoryID
                && i.invoiceID == data1.invoiceID
                && i.yarnBoxInfoLen == data1.yarnBoxInfoLen
                && i.yarnLotID2 == data1.yarnLotID2
                && i.yarnDataUUID == data1.yarnDataUUID
                && i.yarnLotUUID == data1.yarnLotUUID
                && i.yuUUID == data1.yuUUID
            );
            if (dataPCS1.length > 0) {
                // console.log('yarnStockCardPCS1.length > 0');
                return dataPCS1[0].pcs;
            }
        }
        return 0;
    }

    getZoneStockCard(data1: any): string {
        if (this.yarnStockCardPCS && this.yarnStockCardPCS.dataZONE) {
            const dataZONE: DataZONE[] = [...this.yarnStockCardPCS.dataZONE];
            const dataZONE1 = dataZONE.filter(i=>i.ddmmyyyy == data1.ddmmyyyy
                && i.usageMode == data1.usageMode
                && i.orderID == data1.orderID
                && i.toFactoryID == data1.toFactoryID
                && i.invoiceID == data1.invoiceID
                && i.yarnBoxInfoLen == data1.yarnBoxInfoLen
                && i.yarnLotID2 == data1.yarnLotID2
                && i.yarnDataUUID == data1.yarnDataUUID
                && i.yarnLotUUID == data1.yarnLotUUID
                && i.yuUUID == data1.yuUUID
            );
            if (dataZONE1.length > 0) {
                // console.log('yarnStockCardPCS1.length > 0');
                return dataZONE1[0].targetPlaceID;
            }
        }
        return '';
    }

    selectYarnLotUsageRow(mode: 'invoiceID'|'yarnLotID', id: string) {
        const yarnLotUsageRow1 = this.yarnLotUsageRowOld.map(obj => ({...obj}));
        if (mode === 'invoiceID') {
            this.yarnLotUsageRow = [...yarnLotUsageRow1.filter(i=>i.invoiceID === id)];
            this.reCalculateYarnLotUsageRow();
            // console.log(this.yarnLotUsageRow);
        }
        else if (mode === 'yarnLotID') {
            this.yarnLotUsageRow = [...yarnLotUsageRow1.filter(i=>i.yarnLotID === id)];
            this.reCalculateYarnLotUsageRow();
            // console.log(this.yarnLotUsageRow);
        }
    }

    reCalculateYarnLotUsageRow() {
        let balance = 0;
        this.yarnLotUsageRow.forEach( (item, index) => {
            if (item.usageMode === 'ct') { // ## ct= fromCustomer

                balance = balance + item.yarnWeightNet;  // ## update balance
                item.balance = +balance.toFixed(2);
            } else if (item.usageMode === 't') { // ##  t=transfer

                // ## mode = yarn-packaging-list-stock-card , fac-lot
                if (this.mode==='yarn-packaging-list-stock-card') {
                    balance = balance - item.useYarnWeight;  // ## update balance
                    item.balance = +balance.toFixed(2);
                } else if (this.mode==='fac-lot') {
                    if (this.factorySelect.factoryID===item.usageInfo.toFactoryID) {
                        balance = balance + item.useYarnWeight;  // ## update balance
                        item.balance = +balance.toFixed(2);
                    } else {
                        balance = balance - item.useYarnWeight;  // ## update balance
                        item.balance = +balance.toFixed(2);
                    }
                }

                // this.yarnLotUsageRow.push(yarnLotUsageRow1);
            } else if (item.usageMode === 'p') { // ##  , p=produce
                balance = balance - item.useYarnWeight;  // ## update balance
                item.balance = +balance.toFixed(2);
            }
        });
        this.idxLastLine = 0;
        this.yarnLotUsageRow.forEach( (item, index) => {
            if (item.balance > 0) {
                this.idxLastLine = index;
            }
        });
    }

    showAllYarnLotUsageRow() {
        this.getYarnUsage();
    }

    getYarnLotUsageRow(usageMode: string) {
        this.usageModeInvisible = usageMode;
        if (usageMode === 't') {
            this.yarnLotUsageRow = this.yarnLotUsageRowMaster.filter(i=>i.usageMode !== usageMode);
            // this.idxLastLine = this.yarnLotUsageRow.length-1;
        } else {
            this.yarnLotUsageRow = this.yarnLotUsageRowMaster.filter(i=>i.usageMode !== 'xxx');
        }
        this.yarnLotUsageRow.forEach( (item, index) => {
            if (item.balance > 0) {
                this.idxLastLine = index;
            }
        });
    }

    showYarnfilterModal() {
        const showList: string[] = ['yarnID'];
        const ref = this.dialogService.open(SYarnFilterComponent, {
            data: {
                id: 'yarnFilter',
                showList: showList,
                company: this.userService?.getCompany(),
                yarns: this.yarns,
                yarnsCount: this.yarnsCount,
                mode: 'yarn-lists-select',

            },
            header: 'Yarn Filter [ ' + this.customer.customerName+ ' ]',
            width: '80%'
        });

        ref.onClose.subscribe((data: Yarn) => {
            this.orderImagesSelect = [];
            // console.log(data);
            if (data) {
                const yarn1 = this.yarnSelects.filter(i=>(i.yarnID === data.yarnID));
                if (yarn1.length === 0) {
                    this.yarnSelects.push(data);
                }
            } else {
                this.yarnSelects = [];
            }
        });
    }

    // ## mode = orderID-selector
    showStyleSelector(mode: string, idx: number) {
        const ref = this.dialogService.open(SmdSelectOrderComponent, {
            data: {
                id: 'orderIDSelection',
                company: this.userService?.getCompany(),
                orderImages: this.orderImages,
                mode: mode,  // ## mode = orderID-selector
                idx: idx,
                btnCaption: 'choose'

            },
            header: 'orderID Selection',
            width: '80%',
        });

        ref.onClose.subscribe((data: any) => {
            // console.log(data);
            if (!data) {

            } else {
                this.yarnSelects = [];
                this.orderImagesSelect = [];
                this.orderImagesSelect.push(data.orderImage);
                // this.orderImagesSelect[idx] = {orderID: data.orderImage.orderID, imageProfile: data.orderImage.imageProfile};
            }

        });
    }

    showYarnSeasonsList() {
        const ref = this.dialogService.open(SmdYarnSeasonyearComponent, {
            data: {
                id: 'yarnSeasonsSelection',
                company: this.userService?.getCompany(),
                // callfrom: this.formActive,  // ## send to nodejs for choose buckets
                btnCaption: 'choose'

            },
            header: 'Yarn Season Selection',
            width: '80%',
        });

        ref.onClose.subscribe((data: any) => {
            // if (product) {
            //     this.product = product;
            //     // this.style = this.product.productCustomerCode.toUpperCase();
            //     this.style = this.order.orderID;
            //     this.style = this.userService.setAddBackStrLen(this.style, this.userService.styleLen, ' ');
            //     this.userService.setOrderProductSelect(product)
            // }

        });
    }

    showCustomerSelectionModal() {
        const ref = this.dialogService.open(SSelectCustomerComponent, {
            data: {
                id: 'customersSelection',
                company: this.userService?.getCompany(),
                // callfrom: this.formName,  // ## send to nodejs for choose buckets
                btnCaption: 'choose'

            },
            header: 'Customer Selection',
            width: '80%',
        });

        ref.onClose.subscribe((customer: Customer) => {
            // console.log(customer);
            if (customer) {
                // console.log(customer);
                this.customer = {...customer};
                this.userService.setCustomer(customer);
                // this.userService.setDataAroundAppStatusListenerToNext();
            }
        });
    }

    showFactorySelectionModal() {
        const ref = this.dialogService.open(SSelectFactoryComponent, {
            data: {
                id: 'factorySelection-main',
                company: this.userService?.getCompany(),
                // callfrom: this.formName,  // ## send to nodejs for choose buckets
                btnCaption: 'choose'

            },
            header: 'Factory Selection',
            width: '80%',
        });

        ref.onClose.subscribe((factory: Factory) => {
            if (factory) {
                this.factorySelect = {...factory};
                this.userService.factorySelect = this.factorySelect;
                this.userService.setDataAroundAppStatusListenerToNext();
                // this.factorySelectForOrderStyle = {...this.factorySelected};
                // this.userService.setOrderCustomerSelect(customer);
            }
        });
    }

    // yarnSeasonID, yarnID, yarnColorID, yarnLotID, yarnLotUUID
    showYarnLotInfo(factoryIDBox: string, modeArr: string[], yarnID: string, uuid: string, yarnDataUUID: string, yarnSeasonID: string, yarnColorID: string, yarnLotID: string, yarnLotUUID: string, confirmDate: string) {
        if (this.mode === 'yarn-packaging-list-stock-card') {
            factoryIDBox = '*';
        } else if (this.mode === 'fac-lot') {
            factoryIDBox = this.factorySelect.factoryID;
        }
        const ref = this.dialogService.open(SmdYarnLotTransferComponent, {
            data: {
                id: 'yarnBoxTransfer',
                company: this.userService.getCompany(),
                customer: this.customer,
                factorySelect: this.factorySelect,
                factorytransfer: GBC.clrFactory(),
                factoryIDBox: factoryIDBox,
                orderImages: this.orderImages,
                modeArr: modeArr,  //  ## [transfer , divide]
                yarnID: yarnID,
                uuid: uuid,
                yarnSeasonID: yarnSeasonID,
                yarnDataUUID: yarnDataUUID,
                yarnColorID: yarnColorID,
                yarnLotID: yarnLotID,
                yarnLotUUID: yarnLotUUID,
                confirmDate: confirmDate,
                btnCaption: 'choose'

            },
            header: 'Yarn Boxes info',
            width: '80%',
            height: '100%',

        });

        ref.onClose.subscribe((data: any) => {
            // console.log(data);
            if (!data) {

            } else {
                // this.yarnSelects = [];
                // this.orderImagesSelect = [];
                // this.orderImagesSelect.push(data.orderImage);
                // this.orderImagesSelect[idx] = {orderID: data.orderImage.orderID, imageProfile: data.orderImage.imageProfile};
            }

        });
    }

    // ## select  1 date , single date
    showSelectDate1(yarnLotUsageRow1: YarnLotUsageRow) {
        // console.log(mode, idx);
        // console.log(yarnLotUsageRow1);
        const ref = this.dialogService.open(SCcDateSelectComponent, {
            data: {
                callFrom: 'SYarnPlanPackinglistManageComponent',
                id: 'selectSingleDate',
                mode: 'selectSingleDate',  // ## mode = selectSingleDate
                // company: this.userService?.getCompany(),
                // factorySelect: this.factorySelect,
                // customer: this.customer,
                // yarnSeason: this.yarnSeason,
                // colorS: this.colorS,
                // yarnPlan: this.yarnPlan,
                // yarnColorID: this.yarnColorID,
                // orderImagesSelect: this.orderImagesSelect,
                btnCaption: 'choose'

            },
            header: 'Select Date',
            width: '50%',
        });

        ref.onClose.subscribe((data: any) => {
            // console.log(data);
            if (!data) {

            } else {
                const mode = this.mode;
                const datetime = data.date1;
                const yuUUID = yarnLotUsageRow1.yuUUID;
                const yarnLotID = yarnLotUsageRow1.yarnLotID2;
                const invoiceID = yarnLotUsageRow1.invoiceID;
                const usageMode = yarnLotUsageRow1.usageMode;


                const companyID = this.company.companyID;
                const factoryID = this.factorySelect.factoryID; // ## case mode = 'yarn-packaging-list-stock-card'
                const setfactoryID = this.factorySelect.factoryID;  // ## case mode = 'fac-lot'
                const customerID = this.customer.customerID;
                const uuid = this.uuid;
                const yarnID = this.yarnID;
                const status = ['open'];
                const yarnSeasonID = this.yarnSeason;
                const yarnColorID = this.yarnColorID;
                // const yarnDataUUID = this.yarnDataUUID;
                const yarnDataUUID = yarnLotUsageRow1.yarnDataUUID;

                let toFactoryID = '';
                if (this.mode === 'yarn-packaging-list-stock-card') {
                    toFactoryID = '*';
                } else if (this.mode === 'fac-lot') {
                    toFactoryID = setfactoryID;
                }

                // putYarnUsageTransfersDate(companyID: string, setfactoryID: string, toFactoryID: string, customerID: string, yarnSeasonID: string, yarnID: string,
                //     yarnColorID: string, yarnDataUUID: string, status: string[],
                //     mode: string, yuUUID: string, yarnLotID: string, invoiceID: string, usageMode: string, datetime: Date)
                this.yarnService.putYarnUsageTransfersDate( companyID, factoryID, setfactoryID, toFactoryID, customerID, yarnSeasonID, yarnID, yarnColorID, yarnDataUUID, status,
                    mode, yuUUID, yarnLotID, invoiceID, usageMode, datetime
                );
            }

        });
    }

    yarnRemove(idx: number) {
        // array.splice(i, 1);
        this.yarnSelects.splice(idx, 1);
        // this.orderImagesSelect.splice(idx, 1);
        // this.genOrderImagesSelect();
    }

    styleRemove(idx: number) {
        // array.splice(i, 1);
        this.orderImagesSelect.splice(idx, 1);
        // this.orderImagesSelect.splice(idx, 1);
        // this.genOrderImagesSelect();
    }

    // getddmmyyy(uS:YarnLotUsageRow, idx: number) {
    //     // if (idx === 1) {
    //     //     this.yarnLotUsageRowCurrent = GBC.clrYarnLotUsageRow();
    //     // }

    //     // let ddmmyyyy = '';
    //     // if (uS.ddmmyyyy !== this.yarnLotUsageRowCurrent.ddmmyyyy) {
    //     //     ddmmyyyy = uS.ddmmyyyy;
    //     // }

    //     // return ddmmyyyy;

    //     this.yarnLotUsageRowCurrent = uS;
    //     if (idx+1 === this.yarnLotUsageRow.length) {
    //         this.yarnLotUsageRowCurrent = GBC.clrYarnLotUsageRow();
    //     }
    //     return '';
    // }

    // getBalanceLastLine(uS: YarnLotUsageRow, idx: number): boolean {
    //     // yarnLotUsageRow.length === idx+1
    //     if (uS.issueNote === 'transfer') {
    //         return false;
    //     } else if (this.yarnLotUsageRow.length === idx+1 && uS.issueNote === 'transfer') {
    //         return false;
    //     }
    //     return true;
    // }

    getBalance(uS: YarnLotUsageRow, idx: number) {
        // console.log(uS.ddmmyyyyIssue , this.yarnLotUsageRowCurrent.ddmmyyyyIssue);
        this.yarnLotUsageRowCurrent = {...uS};

        // console.log(this.yarnLotUsageRow.length, +idx+1);
        if (this.yarnLotUsageRow.length === +idx+1) { // ## last row
            // console.log('last row');
            this.yarnLotUsageRowCurrent = {...GBC.clrYarnLotUsageRow()};
        }

        // ## yarn-packaging-list-stock-card , fac-lot
        if (this.mode === 'yarn-packaging-list-stock-card') {
            // if (uS.issueNote === 'transfer' && this.yarnLotUsageRow.length === +idx+1) {
            //     this.yarnLotUsageRowCurrent = GBC.clrYarnLotUsageRow();
            //     return '';
            // } else if (uS.issueNote === 'transfer') {
            //     return '';
            // }
            return uS.balance;
        } else if (this.mode === 'fac-lot') {

        }


        return uS.balance;
    }

    closePage() {
        this.closeYarnStockCard.emit('close page');
    }

    // yarnSeasonID, yarnID, yarnColorID, yarnLotID, yarnLotUUID
    setYarnLotMenuPopup(yarnLotID: string, yarnLotUUID: string, confirmDate: string) {
        const factoryIDBox = '';
        const yarnID = this.yarnID;
        const uuid = this.uuid;
        const yarnSeasonID = this.yarnSeason;
        const yarnDataUUID = this.yarnDataUUID;
        const yarnColorID = this.yarnColorID;
        // const modeArr = ['transfer'];

        this.items = [{
            label: 'Yarn Lot ID: ' + yarnLotID,
            visible: true,
            items: [
                {
                    label: 'view only [ Lot ID ]',
                    icon: 'pi pi-fw pi-box',
                    visible: true,
                    command: () => {
                        this.selectYarnLotUsageRow('yarnLotID', yarnLotID);
                        // this.showYarnLotInfo(factoryIDBox, [], yarnID, uuid, yarnDataUUID, yarnSeasonID, yarnColorID, yarnLotID, yarnLotUUID, confirmDate);
                    }
                },
                { separator: true }, { separator: true }, { separator: true },
                {
                    label: 'view box',
                    icon: 'pi pi-fw pi-box',
                    visible: true,
                    command: () => {
                        this.showYarnLotInfo(factoryIDBox, [], yarnID, uuid, yarnDataUUID, yarnSeasonID, yarnColorID, yarnLotID, yarnLotUUID, confirmDate);
                    }
                },
                { separator: true }, { separator: true }, { separator: true },
                {
                    label: 'transfer box',
                    icon: 'pi pi-fw pi-box',
                    visible: true,
                    command: () => {
                        this.showYarnLotInfo(factoryIDBox, ['transfer'], yarnID, uuid, yarnDataUUID, yarnSeasonID, yarnColorID, yarnLotID, yarnLotUUID, confirmDate);
                    }
                },

                // {
                //     label: 'Confirm yarn Lot ID',
                //     icon: 'pi pi-fw pi-check-square',
                //     visible: packageInfo.boxIDAllVerified && packageInfo.state!=='verified',
                //     command: () => {
                //         this.showYarnLotManage(monthShortName, yarnDataInfo, 'confirm', yarnLotUUID);
                //     }
                // },

                // {
                //     label: 'view data',
                //     icon: 'pi pi-fw pi-check-square',
                //     visible: packageInfo.state==='verified',
                //     command: () => {
                //         this.showYarnLotManage(monthShortName, yarnDataInfo, 'view', yarnLotUUID);
                //     }
                // },

                // {
                //     label: 'rewrite order qty',
                //     visible: this.checkMenuVisible('rewrite-order'),
                //     command: () => { this.rewriteOrderQTY(productColor, productSize, targetPlaceID); }
                // },
                // {label: 'Download', icon: 'pi pi-fw pi-download'}
            ]
        }];
    }

    exportPDFStockCard() {
        // console.log('exportPDFStockCard');
        // console.log(this.yarnLotUsageRow);
        // "colorS.color.colorCode +' '+ colorS.color.colorName"

        const blank12 = '            '; // ## blank 12 characters
        const sumaryOrderIDPCS: string[] = this.getSumaryOrderIDPCS();

        // ## headerTxt = 'StoreCenterStockCard01'
        const yarnCardInfo: any = {
            headerTxt: 'StoreCenterStockCard01',
            yarnID: this.yarnID,
            colorTxt: this.colorS.color.colorCode  +' '+this.colorS.color.colorName,
            colorS: this.colorS
        };
        const docDefinition = this.yarnService.exportPDFStockCard(this.yarnLotUsageRow, yarnCardInfo, sumaryOrderIDPCS);
        pdfMake.createPdf(docDefinition).open();
    }

    getSumaryOrderIDPCS(): string[] {
        const blank12 = '            '; // ## blank 12 characters
        const pcsCaption = '   pcs.';
        let sumaryOrderIDPCS: string[] = [];
        // console.log(this.yarnStockCardPCS);
        const orderIDs = Array.from(new Set(this.yarnStockCardPCS.dataPCS.map((item: any) => item.orderID)));
        orderIDs.forEach( (item, index) => {
            const orderIDF = this.yarnStockCardPCS.dataPCS.filter(i=> i.orderID == item);
            if (orderIDF.length > 0) {
                const totalPCS = orderIDF.reduce((prev, cur) => {return prev + cur.pcs;}, 0);
                if (totalPCS > 0) {
                    sumaryOrderIDPCS.push(item + blank12 + totalPCS + pcsCaption);
                }
            }
        });
        // const sumaryOrderIDPCS: string[] = [
        //     'AAAAAAAA' + blank12 + '200',
        //     'BBBBBBBB' + blank12 + '200',
        //     'CCCCCC' + blank12 + '200',
        // ];
        return sumaryOrderIDPCS;
    }

    updateYarnLotUsageRow() {
        // ## clear pcs
        this.yarnLotUsageRow.forEach( (item, index) => {
            item.pcs = 0;
            item.orderID2 = '';
            item.targetPlaceID = '';
        });

        // ## update yarnLotUsageRow "pcs"
        this.yarnStockCardPCS.dataPCS.forEach( (item, index) => {
            const idx = this.yarnLotUsageRow.findIndex( i =>(i.ddmmyyyy == item.ddmmyyyy
                && i.usageMode == item.usageMode
                && i.orderID == item.orderID
                && i.toFactoryID == item.toFactoryID
                && i.invoiceID == item.invoiceID
                && i.yarnBoxInfo.length == item.yarnBoxInfoLen
                && i.yarnLotID2 == item.yarnLotID2
                && i.yarnDataUUID == item.yarnDataUUID
                && i.yarnLotUUID == item.yarnLotUUID
                && i.yuUUID == item.yuUUID));
            if (idx >= 0) {
                this.yarnLotUsageRow[idx].pcs = item.pcs;
            }
        });

        // ## update yarnLotUsageRow "zone"
        this.yarnStockCardPCS.dataZONE.forEach( (item, index) => {
            const idx = this.yarnLotUsageRow.findIndex( i =>(i.ddmmyyyy == item.ddmmyyyy
                && i.usageMode == item.usageMode
                && i.orderID == item.orderID
                && i.toFactoryID == item.toFactoryID
                && i.invoiceID == item.invoiceID
                && i.yarnBoxInfo.length == item.yarnBoxInfoLen
                && i.yarnLotID2 == item.yarnLotID2
                && i.yarnDataUUID == item.yarnDataUUID
                && i.yarnLotUUID == item.yarnLotUUID
                && i.yuUUID == item.yuUUID));
            if (idx >= 0) {
                this.yarnLotUsageRow[idx].targetPlaceID = item.targetPlaceID;
                this.yarnLotUsageRow[idx].orderID2 = item.orderID + ' /' + item.targetPlaceID;
            }
        });
    }

    putYarnStockCardPCS(uS: YarnLotUsageRow, number1: number, type: string) {
        // console.log(uS);
        const companyID = this.company.companyID;
        const yarnID = this.yarnID;
        const yarnSeasonID = this.yarnSeason;;
        const yarnColorID = this.yarnColorID;

        const ddmmyyyy = uS.ddmmyyyy;
        const usageMode = uS.usageMode;
        const orderID = uS.orderID;
        const toFactoryID = uS.toFactoryID;
        const invoiceID = uS.invoiceID;
        const yarnBoxInfoLen = uS.yarnBoxInfo.length;
        const yarnLotID2 = uS.yarnLotID2;
        const yarnDataUUID = uS.yarnDataUUID;
        const yarnLotUUID = uS.yarnLotUUID;
        const yuUUID = uS.yuUUID;
        const pcs = number1;
        const createBy = this.userService.getCreateBy();
        const dataPCS: DataPCS = {
            ddmmyyyy, usageMode, orderID, toFactoryID, invoiceID, yarnBoxInfoLen, yarnLotID2,
            yarnDataUUID, yarnLotUUID, yuUUID, pcs, createBy
        };

        let yarnStockCardPCS: YarnStockCardPCS = GBC.clrYarnStockCardPCS();
        yarnStockCardPCS.companyID = companyID;
        yarnStockCardPCS.yarnID = yarnID;
        yarnStockCardPCS.yarnSeasonID = yarnSeasonID;
        yarnStockCardPCS.yarnColorID = yarnColorID;
        yarnStockCardPCS.type = type;
        yarnStockCardPCS.dataPCS = [dataPCS];

        // putYarnStockCardPCS(yarnStockCardPCS: YarnStockCardPCS)
        this.yarnService.putYarnStockCardPCS(yarnStockCardPCS);
        if (this.yarnStockCardPCSSub) { this.yarnStockCardPCSSub.unsubscribe(); }
        this.yarnStockCardPCSSub = this.yarnService.getYarnStockCardPCSListener().subscribe((data) => {
            // console.log(data);
            this.yarnStockCardPCS = data.yarnStockCardPCS;
            this.updateYarnLotUsageRow();
        });
    }

    showInputNumber1Modal(uS: YarnLotUsageRow) {
        // console.log(uS);

        if (uS.usageMode === 't') {  // ## t= transfer mode
            const ref = this.dialogService.open(SmdInputNumber1Component, {
                data: {
                    id: 'yarnInput1StockCardPCS',
                    mode: 'yarn.input1.stockcard.pcs',
                    uS,
                    yarnID: this.yarnID
                },
                header: 'Input PCS for YARN stock card"',
                width: '50%'
            });

            ref.onClose.subscribe((data: any) => {
                // console.log(data);
                // ## mode === 'cancelOrderQueue'
                if (data) {
                    if (data.data.mode && data.data.mode === 'yarn.input1.stockcard.pcs' && data.success) {
                        // console.log('data.success = ' , data.success);
                        this.putYarnStockCardPCS(uS, data.number1, 'pcs');
                        // this.showFactorySelectionChangeSendToModal(uS);
                        // console.log(data);
                        // console.log(orderProductionQueueList);
                        // this.deleteOrderProductionQueuesCancel(orderProductionQueueList);
                    } else {

                    }
                }
            });
        }
    }



    putYarnStockCardPCSZONE(uS: YarnLotUsageRow, mainZoneList: any, type: string) {
        // console.log(uS);
        // console.log(mainZoneList);
        const companyID = this.company.companyID;
        const yarnID = this.yarnID;
        const yarnSeasonID = this.yarnSeason;;
        const yarnColorID = this.yarnColorID;

        const ddmmyyyy = uS.ddmmyyyy;
        const usageMode = uS.usageMode;
        const orderID = uS.orderID;
        const toFactoryID = uS.toFactoryID;
        const invoiceID = uS.invoiceID;
        const yarnBoxInfoLen = uS.yarnBoxInfo.length;
        const yarnLotID2 = uS.yarnLotID2;
        const yarnDataUUID = uS.yarnDataUUID;
        const yarnLotUUID = uS.yarnLotUUID;
        const yuUUID = uS.yuUUID;
        const targetPlaceID = mainZoneList.targetPlaceID;
        const createBy = this.userService.getCreateBy();
        const dataZONE: DataZONE = {
            ddmmyyyy, usageMode, orderID, toFactoryID, invoiceID, yarnBoxInfoLen, yarnLotID2,
            yarnDataUUID, yarnLotUUID, yuUUID, targetPlaceID, createBy
        };

        let yarnStockCardPCS: YarnStockCardPCS = GBC.clrYarnStockCardPCS();
        yarnStockCardPCS.companyID = companyID;
        yarnStockCardPCS.yarnID = yarnID;
        yarnStockCardPCS.yarnSeasonID = yarnSeasonID;
        yarnStockCardPCS.yarnColorID = yarnColorID;
        yarnStockCardPCS.type = type;
        yarnStockCardPCS.dataZONE = [dataZONE];

        // putYarnStockCardPCS(yarnStockCardPCS: YarnStockCardPCS)
        this.yarnService.putYarnStockCardPCSZONE(yarnStockCardPCS);
        if (this.yarnStockCardPCSSub) { this.yarnStockCardPCSSub.unsubscribe(); }
        this.yarnStockCardPCSSub = this.yarnService.getYarnStockCardPCSListener().subscribe((data) => {
            // console.log(data);
            this.yarnStockCardPCS = data.yarnStockCardPCS;
            this.updateYarnLotUsageRow();
        });
    }

    //
    showSelectionZone1Modal(uS: YarnLotUsageRow) {
        // console.log(uS);

        if (uS.usageMode === 't') {  // ## t= transfer mode
            const ref = this.dialogService.open(SmdSelectZone1Component, {
                data: {
                    id: 'yarnInput1StockCardPCSZONE',
                    mode: 'yarn.select.stockcard.zone',
                    uS,
                    yarnID: this.yarnID
                },
                header: 'Select ZONE for YARN stock card"',
                width: '50%'
            });

            ref.onClose.subscribe((data: any) => {
                // console.log(data);
                // ## mode === 'cancelOrderQueue'
                if (data) {
                    if (data.data.mode && data.data.mode === 'yarn.select.stockcard.zone' && data.success) {
                        // console.log('data.success = ' , data.success);
                        this.putYarnStockCardPCSZONE(uS, data.mainZoneList, 'zone');
                    } else {

                    }
                }
            });
        }
    }

    showStaffImportantConfirmModal(uS: YarnLotUsageRow ) {
        // console.log(uS);

        if (this.mode === 'yarn-packaging-list-stock-card') {
            const ref = this.dialogService.open(SmdConfirmImportantTaskComponent, {
                data: {
                    id: 'staffImportantConfirm',
                    mode: 'yarn.change.sentto',
                },
                header: 'Confirmation for "CHANGE SEND TO .."',
                width: '30%'
            });

            ref.onClose.subscribe((data: any) => {
                // console.log(data);
                // ## mode === 'cancelOrderQueue'
                if (data) {
                    if (data.mode && data.mode === 'yarn.change.sentto' && data.success) {
                        this.showFactorySelectionChangeSendToModal(uS);
                        // console.log(data);
                        // console.log(orderProductionQueueList);
                        // this.deleteOrderProductionQueuesCancel(orderProductionQueueList);
                    } else {

                    }
                }
            });
        }
    }

    showFactorySelectionChangeSendToModal(uS: YarnLotUsageRow) {
        // console.log(uS);
        const companyID = this.company.companyID;
        const factoryID = this.factorySelect.factoryID; // ## case mode = 'yarn-packaging-list-stock-card'
        const customerID = this.customer.customerID;
        const uuid = this.uuid;
        const yarnID = this.yarnID;
        const status = ['open'];
        const yarnSeasonID = this.yarnSeason;
        const yarnColorID = this.yarnColorID;
        const yarnDataUUID = this.yarnDataUUID;

        const yuUUID = uS.yuUUID;
        const invoiceID = uS.invoiceID;
        const usageMode = uS.usageMode;
        const yarnLotID = uS.yarnLotID2;

        const toFactoryID = '*';
        let newFacIDSendTo = '';

        const ref = this.dialogService.open(SSelectFactoryComponent, {
            data: {
                id: 'yarn-change-sendto',
                company: this.userService?.getCompany(),
                // callfrom: this.formName,  // ## send to nodejs for choose buckets
                btnCaption: 'choose'

            },
            header: 'Factory Selection "CHANGE SEND TO .."',
            width: '80%',
        });

        ref.onClose.subscribe((factory: Factory) => {
            // console.log(factory);
            if (factory) {
                newFacIDSendTo = factory.factoryID;
                // console.log(companyID, factoryID, customerID, uuid, yarnID, status, yarnSeasonID, yarnColorID, yarnDataUUID, newFacIDSendTo);
                this.yarnService.editYarnUsageNewFacSendTo(
                    companyID, factoryID, toFactoryID, customerID, yarnSeasonID, yarnID, yarnColorID, yarnDataUUID, status,
                    newFacIDSendTo, yuUUID, invoiceID, usageMode, yarnLotID);
                // this.prepareDate();
            }
        });

    }

    ngOnDestroy(): void {
        if (this.dataAroundAppSub) { this.dataAroundAppSub.unsubscribe(); }
        if (this.yarnUsageListSub) { this.yarnUsageListSub.unsubscribe(); }
        if (this.yarnStockCardPCSSub) { this.yarnStockCardPCSSub.unsubscribe(); }

        // if (this.yarnUsageListSub) { this.yarnUsageListSub.unsubscribe(); }
        // if (this.yarnUsageListSub) { this.yarnUsageListSub.unsubscribe(); }


    }
}
