import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Location } from '@angular/common';

import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';

import { DialogService } from 'primeng/dynamicdialog';
import { Subscription } from 'rxjs';
import { UserService } from 'src/app/services/user.service';
import { YarnService } from 'src/app/services/yarn.service';
import { GBC } from 'src/app/global/const-global';
import { ColorS, Company, Factory } from 'src/app/models/app.model';
import { Customer } from 'src/app/models/order.model';
import { Yarn, YarnData, YarnDataDraft, YarnLotUsage, YarnLotUsageList, YarnTransferUsageGroupRow, YarnTransferUsageRow } from 'src/app/models/yarn.model';
import { MenuItem } from 'primeng/api';
import { ReportService } from 'src/app/services/report.service';
import { SmdConfirmImportantTaskComponent } from '../../../general/smd-confirm-important-task/smd-confirm-important-task.component';


(pdfMake as any).vfs = pdfFonts.pdfMake.vfs;

@Component({
  selector: 'app-s-yarn-transfer-report',
  templateUrl: './s-yarn-transfer-report.component.html',
  styleUrls: ['./s-yarn-transfer-report.component.scss'],
  providers: [DialogService],
})
export class SYarnTransferReportComponent implements OnInit, OnDestroy {
    productImageProfileGCSPath = GBC.productImageProfileGCSPath;  // ## google storage path
    nulltGCSPath= GBC.nulltGCSPath;
    @Input() mode = '';
    @Input() viewMode = '';  // ##  yarn-lot-fac  yarn-packaging-list-stock-card, yarnTransferReport
    @Input() yarnSeasonID = '';
    @Input() company: Company = GBC.clrCompany();
    @Input() factorySelect: Factory = GBC.clrFactory();
    @Input() customer: Customer = GBC.clrCustomer();
    @Input() yarns: Yarn[] = [];
    @Input() yarnsCount: number = 0;
    @Input() yarnPlans: YarnData[] = [];
    @Input() yarnPlansCount: number = 0;

    @Output() closeYarnTransferCard = new EventEmitter<any>();

    yarnID = '';
    uuid = '';
    yarnTransferUsage: YarnLotUsageList[] = [];
    yarnTransferUsageRow: YarnTransferUsageRow[] = [];
    colorS: ColorS = GBC.clrOrderColor();

    content: any[] = [];
    items: MenuItem[] = [];
    loading = false;

    yarnDataDraft: YarnDataDraft = GBC.clrYarnDataDraft();

    private dataAroundAppSub: Subscription = new Subscription();
    private yarnDataAroudAppSub: Subscription = new Subscription();
    private yarnReportSub: Subscription = new Subscription();
    private yarnUsageListSub: Subscription = new Subscription();
    private yarnPlanListSub: Subscription = new Subscription();


    constructor(
        // private router: Router,
        private location: Location,
        public dialogService: DialogService,

        public userService: UserService,
        public yarnService: YarnService,
        private repService: ReportService
    ) {}

    ngOnInit(): void {
        this.location.replaceState('/'); // ## hide loocation
        // console.log('app-s-yarn-transfer-report');

        this.yarnTransferUsageRow = [];
        this.yarnID = this.yarnService.yarnIDReport;  // ## get yarn ID for report
        this.uuid = this.yarnService.getYarnUUID(this.yarnID);
        this.company = this.userService.getCompany();
        this.yarnSeasonID = this.userService.yarnSeason;
        this.customer = this.userService.getCustomer();
        this.factorySelect = this.userService.factorySelect;
        // this.userService.setYarnSeason(this.yarnSeasonID);
        // this.userService.factorySelect = this.factorySelect;
        // this.userService.setCustomer(this.customer);

        this.dataAroundAppSub = this.userService
            .getDataAroundAppStatusListener()
            .subscribe((dataAroundApp) => {
                // ## declare initial variable from service user

                this.customer = dataAroundApp.customer;
                this.factorySelect = dataAroundApp.factorySelect;
                this.yarnSeasonID = dataAroundApp.yarnSeason;
                this.showTransferUsageReport();
                // console.log('1');
                // this.checkMode('');
            });

        this.yarnDataAroudAppSub = this.userService
            .getYarnDataAroudAppStatusListener()
            .subscribe((yranDataAroundApp) => {
                // console.log(yranDataAroundApp);
                // ##
                // this.mode = this.mode==='' ? 'list':this.mode;
                this.viewMode = yranDataAroundApp.viewMode;
                // console.log('2');
                // this.checkMode('');
            });
        this.yarnReportSub = this.yarnService.getYarnReportListener().subscribe((data) => {
            // console.log(data);
            this.yarnID = data.yarnID;
            this.showTransferUsageReport();
        });
        this.showTransferUsageReport();
    }

    showTransferUsageReport() {
        // console.log('showTransferUsageReport()');
        const companyID = this.company.companyID;
        const factoryID = this.factorySelect.factoryID;
        const customerID = this.customer.customerID;
        // const setName = this.customer.setName;
        const yarnSeasonID = this.yarnSeasonID;
        const yarnID = this.yarnID;
        if (companyID !== '' && factoryID !== '' && customerID !== '' && yarnSeasonID !== '' && yarnID !== '' ) {
            this.getYarnTransferUsageList();
        }
    }

    getYarnTransferUsageList()  {
        // getYarnTransferUsageList(companyID: string, toFactoryID: string, customerID: string, yarnSeasonID: string, yarnID: string, usageMode: string)
        this.loading = true;
        this.yarnTransferUsageRow = [];
        const companyID = this.company.companyID;
        const factoryID = this.factorySelect.factoryID;
        const customerID = this.customer.customerID;
        // const setName = this.customer.setName;
        const yarnSeasonID = this.yarnSeasonID;
        const yarnID = this.yarnID;
        const usageMode = 't';
        this.yarnService.getYarnTransferUsageList(companyID, factoryID, customerID, yarnSeasonID, yarnID, usageMode);
        if (this.yarnUsageListSub) { this.yarnUsageListSub.unsubscribe(); }
        this.yarnUsageListSub = this.yarnService.getYarnUsageListener().subscribe((data) => {
            // console.log(data);
            this.yarnTransferUsage = data.yarnLotUsageList;
            // const yarnLotIDStrArr = [...new Set(this.yarnTransferUsage.map((item: any) => item.yarnLotID))];
            // console.log(xx);
            // console.log(this.yarnTransferUsage);
            this.setYarnTransferUsageRow();
            this.getYarPlansList();
            this.loading = false;
        });
    }

    setYarnTransferUsageRow() {
        // export class YarnTransferUsageGroupRow {
        //     constructor(
        //         public ddmmyyyy: string,
        //         public orderID: string,
        //         public fromFactoryID: string,
        //         public toFactoryID: string,
        //     ) {}
        // }

        function getFullRow(dataYarn: any, item: YarnLotUsageList, data1: any, yarnTransferUsageGroupRow: YarnTransferUsageGroupRow) {
            let yarnTransferUsageRow1: YarnTransferUsageRow = GBC.clrYarnTransferUsageRow();

            const factoryName = data1.factoryName;
            const ddmmyyyyB = data1.ddmmyyyyB;
            const colorCode = data1.colorCode;
            const colorID = data1.colorID;
            const colorName = data1.colorName;

            // ## new full row
            yarnTransferUsageRow1._id = dataYarn._id;
            yarnTransferUsageRow1.invoiceID = dataYarn.invoiceID;
            yarnTransferUsageRow1.yarnColorID = dataYarn.yarnColorID;
            yarnTransferUsageRow1.yarnDataUUID = dataYarn.yarnDataUUID;
            yarnTransferUsageRow1.yuUUID = dataYarn.yuUUID;

            yarnTransferUsageRow1.rowState = 'd';// ## rowState =  sd = subbody d=data , t=total , gt= grand total , b=blank row
            yarnTransferUsageRow1.yarnTransferUsageGroupRow = yarnTransferUsageGroupRow;
            yarnTransferUsageRow1.ddmmyyyy = ddmmyyyyB;

            yarnTransferUsageRow1.yarnID = item.yarnID;
            yarnTransferUsageRow1.yarnIDRowSpan = 1;
            yarnTransferUsageRow1.orderID = item.usageInfo.orderID;
            yarnTransferUsageRow1.toFactoryID = item.usageInfo.toFactoryID;
            yarnTransferUsageRow1.factoryName = factoryName;
            yarnTransferUsageRow1.colorCode = colorCode;
            yarnTransferUsageRow1.colorID = colorID;
            yarnTransferUsageRow1.colorName = colorName;

            yarnTransferUsageRow1.yarnLotID = item.yarnLotID;
            yarnTransferUsageRow1.yarnLotUUID = item.yarnLotUUID;
            yarnTransferUsageRow1.yarnBoxInfo = item.yarnBoxInfo;
            yarnTransferUsageRow1.carton = item.yarnBoxInfo.length;

            yarnTransferUsageRow1.yarnWeightTotal = +(item.yarnBoxInfo.reduce((prev, cur) => {return prev + cur.yarnWeight;}, 0).toFixed(2));
            yarnTransferUsageRow1.yarnUseWeightTotal = +(item.yarnBoxInfo.reduce((prev, cur) => {return prev + cur.useWeight;}, 0).toFixed(2));
            yarnTransferUsageRow1.yarnTransferWeightTotal = +(item.yarnBoxInfo.reduce((prev, cur) => {return prev + cur.yarnTransferWeight;}, 0).toFixed(2));
            yarnTransferUsageRow1.yarnWeightNetTotal = +(item.yarnBoxInfo.reduce((prev, cur) => {return prev + cur.yarnWeightNet;}, 0).toFixed(2));

            cartonTotal = cartonTotal + yarnTransferUsageRow1.carton;
            yarnWeightTotal = yarnWeightTotal + yarnTransferUsageRow1.yarnWeightTotal;
            useWeightTotal = useWeightTotal + yarnTransferUsageRow1.yarnUseWeightTotal;
            yarnTransferWeightTotal = yarnTransferWeightTotal + yarnTransferUsageRow1.yarnTransferWeightTotal;
            yarnWeightNetTotal = yarnWeightNetTotal + yarnTransferUsageRow1.yarnWeightNetTotal;

            cartonGTotal = cartonGTotal + yarnTransferUsageRow1.carton;
            yarnWeightGTotal = yarnWeightGTotal + yarnTransferUsageRow1.yarnWeightTotal;
            useWeightGTotal = useWeightGTotal + yarnTransferUsageRow1.yarnUseWeightTotal;
            yarnTransferWeightGTotal = yarnTransferWeightGTotal + yarnTransferUsageRow1.yarnTransferWeightTotal;
            yarnWeightNetGTotal = yarnWeightNetGTotal + yarnTransferUsageRow1.yarnWeightNetTotal;

            yarnTransferUsageRow.push(yarnTransferUsageRow1);
            yarnLotUsageListCurrent = {...item};
        }

        function getDataSubRow(dataYarn: any, item: YarnLotUsageList, data1: any, yarnTransferUsageGroupRow: YarnTransferUsageGroupRow) {
            let yarnTransferUsageRow1: YarnTransferUsageRow = GBC.clrYarnTransferUsageRow();

            yarnTransferUsageRow1._id = dataYarn._id;
            yarnTransferUsageRow1.invoiceID = dataYarn.invoiceID;
            yarnTransferUsageRow1.yarnColorID = dataYarn.yarnColorID;
            yarnTransferUsageRow1.yarnDataUUID = dataYarn.yarnDataUUID;
            yarnTransferUsageRow1.yuUUID = dataYarn.yuUUID;

            yarnTransferUsageRow1.rowState = 'sd';// ## rowState =  sd = subbody d=data , t=total , gt= grand total , b=blank row
            yarnTransferUsageRow1.yarnTransferUsageGroupRow = yarnTransferUsageGroupRow;
            // yarnTransferUsageRow1.yarnID = item.yarnID;
            yarnTransferUsageRow1.yarnIDRowSpan = 1;
            yarnTransferUsageRow1.orderID = item.usageInfo.orderID;
            yarnTransferUsageRow1.colorCode = data1.colorCode;
            yarnTransferUsageRow1.colorID = data1.colorID;
            yarnTransferUsageRow1.colorName = data1.colorName;

            yarnTransferUsageRow1.yarnLotID = item.yarnLotID;
            yarnTransferUsageRow1.yarnLotUUID = item.yarnLotUUID;
            yarnTransferUsageRow1.yarnBoxInfo = item.yarnBoxInfo;
            yarnTransferUsageRow1.carton = item.yarnBoxInfo.length;

            yarnTransferUsageRow1.yarnWeightTotal = +(item.yarnBoxInfo.reduce((prev, cur) => {return prev + cur.yarnWeight;}, 0).toFixed(2));
            yarnTransferUsageRow1.yarnUseWeightTotal = +(item.yarnBoxInfo.reduce((prev, cur) => {return prev + cur.useWeight;}, 0).toFixed(2));
            yarnTransferUsageRow1.yarnTransferWeightTotal = +(item.yarnBoxInfo.reduce((prev, cur) => {return prev + cur.yarnTransferWeight;}, 0).toFixed(2));
            yarnTransferUsageRow1.yarnWeightNetTotal = +(item.yarnBoxInfo.reduce((prev, cur) => {return prev + cur.yarnWeightNet;}, 0).toFixed(2));

            cartonTotal = cartonTotal + yarnTransferUsageRow1.carton;
            yarnWeightTotal = yarnWeightTotal + yarnTransferUsageRow1.yarnWeightTotal;
            useWeightTotal = useWeightTotal + yarnTransferUsageRow1.yarnUseWeightTotal;
            yarnTransferWeightTotal = yarnTransferWeightTotal + yarnTransferUsageRow1.yarnTransferWeightTotal;
            yarnWeightNetTotal = yarnWeightNetTotal + yarnTransferUsageRow1.yarnWeightNetTotal;

            cartonGTotal = cartonGTotal + yarnTransferUsageRow1.carton;
            yarnWeightGTotal = yarnWeightGTotal + yarnTransferUsageRow1.yarnWeightTotal;
            useWeightGTotal = useWeightGTotal + yarnTransferUsageRow1.yarnUseWeightTotal;
            yarnTransferWeightGTotal = yarnTransferWeightGTotal + yarnTransferUsageRow1.yarnTransferWeightTotal;
            yarnWeightNetGTotal = yarnWeightNetGTotal + yarnTransferUsageRow1.yarnWeightNetTotal;

            yarnTransferUsageRow.push(yarnTransferUsageRow1);
            yarnLotUsageListCurrent = {...item};

        }

        function getTotalRow(yarnTransferUsageGroupRow: YarnTransferUsageGroupRow) {
            let yarnTransferUsageRow1: YarnTransferUsageRow = GBC.clrYarnTransferUsageRow();

            yarnTransferUsageRow1.rowState = 't';// ## rowState =  sd = subbody d=data , t=total , gt= grand total , b=blank row
            yarnTransferUsageRow1.yarnTransferUsageGroupRow = yarnTransferUsageGroupRow;
            yarnTransferUsageRow1.yarnLotID = 'Total';
            yarnTransferUsageRow1.carton = +(cartonTotal.toFixed(2));
            yarnTransferUsageRow1.yarnWeightTotal = +(yarnWeightTotal.toFixed(2));
            yarnTransferUsageRow1.yarnUseWeightTotal = +(useWeightTotal.toFixed(2));
            yarnTransferUsageRow1.yarnTransferWeightTotal = +(yarnTransferWeightTotal.toFixed(2));
            yarnTransferUsageRow1.yarnWeightNetTotal = +(yarnWeightNetTotal.toFixed(2));

            cartonTotal = 0;
            yarnWeightTotal = 0;
            useWeightTotal = 0;
            yarnTransferWeightTotal = 0;
            yarnWeightNetTotal = 0;

            yarnTransferUsageRow.push(yarnTransferUsageRow1);
            // yarnLotUsageListCurrent = {...GBC.clrYarnLotUsageList()};

        }

        function getGrandTotalRow(yarnTransferUsageGroupRow: YarnTransferUsageGroupRow) {
            let yarnTransferUsageRow1: YarnTransferUsageRow = GBC.clrYarnTransferUsageRow();

            yarnTransferUsageRow1.rowState = 'gt';// ## rowState =  sd = subbody d=data , t=total , gt= grand total , b=blank row
            yarnTransferUsageRow1.yarnTransferUsageGroupRow = yarnTransferUsageGroupRow;
            yarnTransferUsageRow1.yarnLotID = 'Grand Total';
            yarnTransferUsageRow1.carton = +(cartonGTotal.toFixed(2));
            yarnTransferUsageRow1.yarnWeightTotal = +(yarnWeightGTotal.toFixed(2));
            yarnTransferUsageRow1.yarnUseWeightTotal = +(useWeightGTotal.toFixed(2));
            yarnTransferUsageRow1.yarnTransferWeightTotal = +(yarnTransferWeightGTotal.toFixed(2));
            yarnTransferUsageRow1.yarnWeightNetTotal = +(yarnWeightNetGTotal.toFixed(2));

            cartonGTotal = 0;
            yarnWeightGTotal = 0;
            useWeightGTotal = 0;
            yarnTransferWeightGTotal = 0;
            yarnWeightNetGTotal = 0;

            yarnTransferUsageRow.push(yarnTransferUsageRow1);
            yarnLotUsageListCurrent = {...GBC.clrYarnLotUsageList()};
        }

        function getBlankRow(yarnTransferUsageGroupRow: YarnTransferUsageGroupRow) {
            let yarnTransferUsageRow1: YarnTransferUsageRow = GBC.clrYarnTransferUsageRow();

            yarnTransferUsageRow1.rowState = 'b'; // ## rowState =  sd = subbody d=data , t=total , gt= grand total , b=blank row
            yarnTransferUsageRow1.yarnTransferUsageGroupRow = yarnTransferUsageGroupRow;

            cartonTotal = 0;
            yarnWeightTotal = 0;
            useWeightTotal = 0;
            yarnTransferWeightTotal = 0;
            yarnWeightNetTotal = 0;

            cartonGTotal = 0;
            yarnWeightGTotal = 0;
            useWeightGTotal = 0;
            yarnTransferWeightGTotal = 0;
            yarnWeightNetGTotal = 0;

            yarnTransferUsageRow.push(yarnTransferUsageRow1);
            yarnLotUsageListCurrent = {...GBC.clrYarnLotUsageList()};
        }

        function getEndOfRow(yarnTransferUsageGroupRow: YarnTransferUsageGroupRow) {
            let yarnTransferUsageRow1: YarnTransferUsageRow = GBC.clrYarnTransferUsageRow();
            yarnTransferUsageRow1.rowState = 'eof';
            yarnTransferUsageRow1.yarnID = 'End of Data';
            yarnTransferUsageRow.push(yarnTransferUsageRow1);
        }


        this.yarnTransferUsageRow = [];
        this.yarnTransferUsage.sort((a,b)=>{
            return a.yarnID >b.yarnID?1:a.yarnID <b.yarnID?-1:0
                || a.yyyymmdd2 >b.yyyymmdd2?1:a.yyyymmdd2 <b.yyyymmdd2?-1:0
                || a.usageInfo.orderID >b.usageInfo.orderID?1:a.usageInfo.orderID <b.usageInfo.orderID?-1:0
                || a.yarnColorID >b.yarnColorID?1:a.yarnColorID <b.yarnColorID?-1:0
                || a.yarnLotID >b.yarnLotID?1:a.yarnLotID <b.yarnLotID?-1:0
        });
        const yarnTransferUsage1 = [...this.yarnTransferUsage];
        let yarnLotUsageListCurrent: YarnLotUsageList = GBC.clrYarnLotUsageList();
        // ## rowState =  sd = subbody d=data , t=total , gt= grand total , b=blank row
        let yarnTransferUsageRow: YarnTransferUsageRow[] = [];
        // let yarnTransferUsageRowCurrent: YarnTransferUsageRow = GBC.clrYarnTransferUsageRow();

        let yarnTransferUsageGroupRowBefore: YarnTransferUsageGroupRow = {
            yyyymmdd2: '',
            ddmmyyyy: '',
            orderID: '',
            yarnID: '',
            fromFactoryID: '',
            toFactoryID: '',
        };

        let cartonTotal = 0;
        let yarnWeightTotal = 0;
        let useWeightTotal = 0;
        let yarnTransferWeightTotal = 0;
        let yarnWeightNetTotal = 0;

        let cartonGTotal = 0;
        let yarnWeightGTotal = 0;
        let useWeightGTotal = 0;
        let yarnTransferWeightGTotal = 0;
        let yarnWeightNetGTotal = 0;
        yarnTransferUsage1.forEach( (item, index) => {
            // let yarnTransferUsageRow1: YarnTransferUsageRow = GBC.clrYarnTransferUsageRow();
            const _id = item._id;
            const invoiceID = item.invoiceID;
            const yarnColorID = item.yarnColorID;
            const yarnDataUUID = item.yarnDataUUID;
            const yuUUID = item.yuUUID;

            const dataYarn: any = {_id, invoiceID, yarnColorID, yarnDataUUID, yuUUID};

            const factoryName = this.userService.getFactoryNameByFactoryID(item.usageInfo.toFactoryID);
            const colorCode = item.yarnColorID.split(';')[1];
            const colorID = item.yarnColorID.split(';')[2];
            const colorName = this.userService.getColorNameByColorID1(colorID);
            const ddmmyyyyA = item.yyyymmdd2.split('-');
            const ddmmyyyyB = ddmmyyyyA[2]+'-'+this.userService.getMonthNamebyID(ddmmyyyyA[1], 'short')+'-'+ddmmyyyyA[0];
            const data1 = {factoryName, ddmmyyyyB, colorCode, colorID, colorName};

            // ## data this for filter this.yarnTransferUsage
            const yarnTransferUsageGroupRow: YarnTransferUsageGroupRow = {
                yyyymmdd2: item.yyyymmdd2,
                ddmmyyyy: ddmmyyyyB,
                orderID: item.usageInfo.orderID,
                yarnID: item.yarnID,
                fromFactoryID: item.usageInfo.fromFactoryID,
                toFactoryID: item.usageInfo.toFactoryID,
            };

            // yarnTransferUsageGroupRowBefore
            // ## first row
            if (item.yyyymmdd2 !== yarnLotUsageListCurrent.yyyymmdd2 && index === 0) {  // ## first row
                getFullRow(dataYarn, item, data1, yarnTransferUsageGroupRow)
            } else if (item.yyyymmdd2 !== yarnLotUsageListCurrent.yyyymmdd2 && index > 0) { // ## different date
                // ## set total row
                getTotalRow(yarnTransferUsageGroupRowBefore);

                // ## set grand total row
                getGrandTotalRow(yarnTransferUsageGroupRowBefore);

                // ## add blank row
                getBlankRow(yarnTransferUsageGroupRowBefore);

                // ## new row
                getFullRow(dataYarn, item, data1, yarnTransferUsageGroupRow);

            // ## item.yyyymmdd2 === yarnLotUsageListCurrent.yyyymmdd2
            } else {  // ## item.yyyymmdd2 === yarnLotUsageListCurrent.yyyymmdd2

                // ## check style
                // ## not the same style
                if (item.usageInfo.orderID !== yarnLotUsageListCurrent.usageInfo.orderID) {
                    // ## set total row
                    getTotalRow(yarnTransferUsageGroupRowBefore);

                    // ## set grand total row
                    getGrandTotalRow(yarnTransferUsageGroupRowBefore);

                    // ## add blank row
                    getBlankRow(yarnTransferUsageGroupRowBefore);

                    // ## new full row
                    getFullRow(dataYarn, item, data1, yarnTransferUsageGroupRow);

                // ## stil same style
                } else {  // ## item.usageInfo.orderID === yarnLotUsageListCurrent.usageInfo.orderID

                    // ## check color
                    // ## not the same color
                    if (item.yarnColorID !== yarnLotUsageListCurrent.yarnColorID) {
                        // ## set total row
                        getTotalRow(yarnTransferUsageGroupRow);

                        // ## add row sub data
                        getDataSubRow(dataYarn, item, data1, yarnTransferUsageGroupRow); // ## add row sub data

                    } else {  // ## same color
                        // ## add row sub data
                        getDataSubRow(dataYarn, item, data1, yarnTransferUsageGroupRow);  // ## add row sub data
                    }
                }
            }

            // ## end of row data
            if (index === yarnTransferUsage1.length - 1) {
                // ## set total row
                getTotalRow(yarnTransferUsageGroupRow);

                // ## set grand total row
                getGrandTotalRow(yarnTransferUsageGroupRow);

                // ## add blank row
                getBlankRow(yarnTransferUsageGroupRow);

                getEndOfRow(yarnTransferUsageGroupRow);
            }
            if (index > 0) {
                yarnTransferUsageGroupRowBefore = {...yarnTransferUsageGroupRow};
            }
        });
        this.yarnTransferUsageRow = yarnTransferUsageRow;
        // console.log(this.yarnTransferUsageRow);
    }

    exportPDF(yarnTransferUsageGroupRow: YarnTransferUsageGroupRow) {
        const yarnTransferUsageRow = [...this.yarnTransferUsageRow];
        const yarnTransferUsage = [...this.yarnTransferUsage];
        // console.log(this.yarnTransferUsage);
        // console.log(yarnTransferUsageGroupRow);
        const yarnTransferUsage1 = [...yarnTransferUsage.filter(i=>
            i.yyyymmdd2 == yarnTransferUsageGroupRow.yyyymmdd2 &&
            i.usageInfo.orderID == yarnTransferUsageGroupRow.orderID
        )];
        const yarnTransferUsageGroupRow1 = yarnTransferUsageRow.filter(i=>
            i.yarnTransferUsageGroupRow.yyyymmdd2 == yarnTransferUsageGroupRow.yyyymmdd2 &&
            i.yarnTransferUsageGroupRow.orderID == yarnTransferUsageGroupRow.orderID
        );
        // console.log(yarnTransferUsage1);
        // console.log(yarnTransferUsageGroupRow1);

        const docDefinition = this.yarnService.createYarnTransferPDF(yarnTransferUsage1, yarnTransferUsageGroupRow1);
        // console.log(docDefinition);
        // console.log('createYarnTransferPDF.....');
        pdfMake.createPdf(docDefinition).open();
    }

    getYarPlansList() {
        this.yarnService.setYarns([]);  // ## clear yarn list
        // this.yarnPlan = GBC.clrYarnData();
        this.loading = true;
        // this.ofFactory = false;  // ## plan of factory
        // this.mode = 'list';
        const companyID = this.company.companyID;
        const factoryID = this.factorySelect.factoryID;
        const customerID = this.customer.customerID;
        const setName = this.customer.setName;
        const orderIDs = this.userService.getOrderIDss();
        // getYarPlansList(companyID: string, factoryID: string, customerID: string, setName: string, yarnSeason: string)
        // console.log(companyID, factoryID, customerID, setName, this.yarnSeasonID, orderIDs);
        this.yarnService.getYarPlansList(companyID, factoryID, customerID, setName, this.yarnSeasonID, orderIDs);
        if (this.yarnPlanListSub) { this.yarnPlanListSub.unsubscribe(); }
        this.yarnPlanListSub = this.yarnService.getYarnPlanListListener().subscribe((data) => {
            // console.log(data);
            // this.loading = false;
            // yarnPlans: YarnData[], yarnPlansCount: number,
            this.uuid = this.yarnService.getYarnUUID(this.yarnID);
            // console.log(this.uuid);
            this.yarnPlans = data.yarnPlans;
            this.yarnPlansCount = data.yarnPlansCount;

            this.yarnPlans.sort((a,b)=>{ return a.orderID >b.orderID?1:a.orderID <b.orderID?-1:0 });
            // console.log(this.yarnPlans);
            this.yarns = data.yarns;
            this.yarnsCount = data.yarnsCount;
            // console.log(this.yarns);

            // this.prepateYarnDataDraft(yarnTransferUsage);

        });
    }

    prepateYarnDataDraft(yarnTransferUsage: YarnTransferUsageRow): void {
        // ## draftMode = divide , transfer
        const setName = this.customer.setName;
        this.yarnDataDraft = GBC.clrYarnDataDraft();
        this.yarnDataDraft.companyID = this.company.companyID;
        this.yarnDataDraft.factoryID = this.factorySelect.factoryID;
        this.yarnDataDraft.customerID = this.customer.customerID;
        this.yarnDataDraft.uuid = this.uuid;
        this.yarnDataDraft.yarnSeasonID = this.yarnSeasonID;
        this.yarnDataDraft.status = '';
        this.yarnDataDraft.datetime = new Date();
        this.yarnDataDraft.editDate = new Date();
        this.yarnDataDraft.yarnID = this.yarnID;
        this.yarnDataDraft.orderID = [yarnTransferUsage.yarnTransferUsageGroupRow.orderID];
        this.yarnDataDraft.colorS = this.colorS
        this.yarnDataDraft.yyyymmdd = '';
        this.yarnDataDraft.mmdd = '';
        this.yarnDataDraft.draftName = 'cancel';
        this.yarnDataDraft.draftMode = 'cancel';
        this.yarnDataDraft.createBy.userID = this.userService.getUserID();

        this.yarnDataDraft.yarnDataInfo.datetime = new Date();
        this.yarnDataDraft.yarnDataInfo.editDate = new Date();
        this.yarnDataDraft.yarnDataInfo.yarnDataUUID = yarnTransferUsage.yarnDataUUID;
        this.yarnDataDraft.yarnDataInfo.yarnColorID = yarnTransferUsage.yarnColorID;
        this.yarnDataDraft.yarnDataInfo.setName = setName;

        this.yarnDataDraft.yarnDataInfo.type = 'receive';
        this.yarnDataDraft.yarnDataInfo.mode = '';
        this.yarnDataDraft.yarnDataInfo.yarnUsage_id = yarnTransferUsage._id;

        this.yarnDataDraft.yarnDataInfo.fromFactoryID = yarnTransferUsage.yarnTransferUsageGroupRow.fromFactoryID;
        this.yarnDataDraft.yarnDataInfo.toFactoryID =  yarnTransferUsage.yarnTransferUsageGroupRow.toFactoryID;

        this.yarnDataDraft.yarnDataInfo.packageInfo.invoiceID = yarnTransferUsage.invoiceID;
        this.yarnDataDraft.yarnDataInfo.packageInfo.yarnLotID = yarnTransferUsage.yarnLotID;
        this.yarnDataDraft.yarnDataInfo.packageInfo.yarnLotUUID = yarnTransferUsage.yarnLotUUID;
        this.yarnDataDraft.yarnDataInfo.packageInfo.yuUUID = yarnTransferUsage.yuUUID;
        this.yarnDataDraft.yarnDataInfo.packageInfo.state = 'verified';
        this.yarnDataDraft.yarnDataInfo.packageInfo.yarnBoxInfo = [];
    }

    putYarnLotTransferCFCancelAndBackCenter(yarnTransferUsage: YarnTransferUsageRow) {
        // console.log(yarnTransferUsage);
        // this.yarnDataDraft = GBC.clrYarnDataDraft();
        this.prepateYarnDataDraft(yarnTransferUsage);
        const _id = yarnTransferUsage._id;
        this.yarnService.putYarnLotTransferCFCancelAndBackCenter(_id, this.yarnDataDraft);


        // putYarnLotTransferCFCancelAndBackCenter
        // (_id: string, yarnDataDraft: YarnDataDraft, yarnUsage1: YarnUsage, yarnLotUsage1: YarnLotUsage,
        //      orderIDTransfer: string)
    }

    inputUserPassPopup(yarnTransferUsage: YarnTransferUsageRow) {
        // console.log(yarnTransferUsage);
        // console.log(this.yarnService.getYarns);
        if (this.uuid != ''  && (yarnTransferUsage.rowState === 'd' || yarnTransferUsage.rowState === 'sd')) {
            const ref = this.dialogService.open(SmdConfirmImportantTaskComponent, {
                data: {
                    id: 'yarnCancelAndBAckCenter',
                    mode: 'yarnCancelAndBAckCenter',
                },
                header: 'Confirmation for Yarn cancel & back to yarn center store',
                width: '30%'
            });

            ref.onClose.subscribe((data: any) => {
                // console.log(data);
                // console.log(this.canScanNode);
                // console.log(this.canScanSubNode);

                // console.log('showStaffLoginModal OK'); canScanSubNode

                // ## mode === 'cancelOrderQueue'
                if (data) {
                    if (data.mode && data.mode === 'yarnCancelAndBAckCenter' && data.success) {
                        // console.log(data);
                        this.putYarnLotTransferCFCancelAndBackCenter(yarnTransferUsage);
                        // this.deleteOrderProductionQueuesCancel(orderProductionQueueList);
                    } else {

                    }
                }
            });
        }
    }


    closePage() {
        this.closeYarnTransferCard.emit('close page');
    }

    ngOnDestroy(): void {
        if (this.dataAroundAppSub) { this.dataAroundAppSub.unsubscribe(); }
        if (this.yarnDataAroudAppSub) { this.yarnDataAroudAppSub.unsubscribe(); }
        if (this.yarnReportSub) { this.yarnReportSub.unsubscribe(); }
        if (this.yarnUsageListSub) { this.yarnUsageListSub.unsubscribe(); }
        if (this.yarnPlanListSub) { this.yarnPlanListSub.unsubscribe(); }

    }
}
