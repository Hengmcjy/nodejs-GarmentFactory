import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Location } from '@angular/common';

import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';

import { DialogService } from 'primeng/dynamicdialog';
import { Subscription } from 'rxjs';
import { GBC } from 'src/app/global/const-global';
import { Company, Factory } from 'src/app/models/app.model';
import { Customer, OrderImage } from 'src/app/models/order.model';
import { ReportService } from 'src/app/services/report.service';
import { UserService } from 'src/app/services/user.service';
import { YarnService } from 'src/app/services/yarn.service';
import { MenuItem } from 'primeng/api';
import { PackageInfo, YarnData, YarnDataInfo, YarnLotUsageList, YarnStockRow, YarnTransferUsageRow } from 'src/app/models/yarn.model';


(pdfMake as any).vfs = pdfFonts.pdfMake.vfs;

@Component({
  selector: 'app-s-yarn-report-fac-stock',
  templateUrl: './s-yarn-report-fac-stock.component.html',
  styleUrls: ['./s-yarn-report-fac-stock.component.scss'],
  providers: [DialogService],
})
export class SYarnReportFacStockComponent implements OnInit, OnDestroy {
    @Input() viewMode = 'yarnReport'; // ## plan , factoryStock, yarnTransferReport yarnReport
    @Input() mode = '';  // ##  yarnReport-list  yarnReport-stock-current
    @Input() yarnSeasonID = '';
    @Input() company: Company = GBC.clrCompany();
    @Input() factorySelect: Factory = GBC.clrFactory();
    @Input() customer: Customer = GBC.clrCustomer();

    @Output() closeYarnReportStock = new EventEmitter<any>();

    productImageProfileGCSPath = GBC.productImageProfileGCSPath;  // ## google storage path
    nulltGCSPath= GBC.nulltGCSPath;

    data1: any[] = []

    items: MenuItem[] = [];

    yarnData: YarnData[] = [];
    yarnDataOld: YarnData[] = [];
    yarnID= '';
    loading = false;
    orderIDs: string[] = [];
    orderImages: OrderImage[] = [];

    yarnTransferUsageRow: YarnTransferUsageRow[] = [];
    yarnStockRow: YarnStockRow[] = [];

    private dataAroundAppSub: Subscription = new Subscription();
    private yarnReportSub: Subscription = new Subscription();
    private yarnDataSub: Subscription = new Subscription();

    constructor(
        // private route: ActivatedRoute,
        // private router: Router,
        private location: Location,

        public dialogService: DialogService,

        public userService: UserService,
        public yarnService: YarnService,
        private repService: ReportService,
    ) {}

    ngOnInit(): void {
        this.location.replaceState('/'); // ## hide loocation

        this.yarnID = this.yarnService.yarnIDReport;  // ## get yarn ID for report
        this.loading = false;
        this.company = this.userService.getCompany();

        this.yarnSeasonID = this.userService.yarnSeason;
        this.customer = this.userService.getCustomer();
        this.factorySelect = this.userService.factorySelect;

        this.dataAroundAppSub = this.userService
            .getDataAroundAppStatusListener()
            .subscribe((dataAroundApp) => {
                // ## declare initial variable from service user

                this.customer = dataAroundApp.customer;
                this.factorySelect = dataAroundApp.factorySelect;
                this.yarnSeasonID = dataAroundApp.yarnSeason;
                // console.log('1');
                this.checkState();
            });
        this.yarnReportSub = this.yarnService.getYarnReportListener().subscribe((data) => {
            // console.log(data);
            this.yarnID = data.yarnID;
            if (this.yarnID === '') {

            } else {
                this.checkState();
            }
        });

        this.orderIDs = this.userService.getOrderIDss();
        this.orderImages = this.userService.getOrderImage(this.orderIDs);
        this.checkState();
    }

    checkState() {
        if (this.customer.customerID !== '' && this.company.companyID !== '' && this.factorySelect.factoryID !== '') {
            this.getYarnRemainCF();
        }
    }

    getYarnRemainCF() {
        // (companyID: string, yarnSeasonID: string, yarnIDArr: string[],
        // uuidArr: string[] , status: string[], type: string[], state: string[], factoryIDBoxArr: string[],
        // used: boolean, weightVerified: boolean)
        const companyID = this.company.companyID;
        const factoryID = this.factorySelect.factoryID;
        const customerID = this.customer.customerID;
        const yarnSeasonID = this.yarnSeasonID;
        const yarnID = this.yarnID;
        // console.log(this.yarnService.getYarnPlans());
        const uuid = this.yarnService.getYarnUUID(yarnID);
        const type = 'receive';
        const status = 'open';
        const state = 'verified';
        const used = false;
        const weightVerified = true;
        // console.log(companyID, yarnSeasonID, [yarnID], [uuid], [status], [type], [state], [factoryID], used, weightVerified);
        this.yarnService.getYarnRemainCF(
            companyID, yarnSeasonID, [yarnID], [uuid], [status], [type], [state], [factoryID], used, weightVerified);
        if (this.yarnDataSub) { this.yarnDataSub.unsubscribe(); }
        this.yarnDataSub = this.yarnService.getYarnDataListener().subscribe((data) => {
            // console.log(data);
            this.yarnData = data.yarnData;
            this.yarnData.sort((a,b)=>{ return a.yarnID >b.yarnID?1:a.yarnID <b.yarnID?-1:0 });
            this.yarnData.forEach( (item, index) => {
                item.yarnDataInfo.sort((a,b)=>{
                    return a.toFactoryID >b.toFactoryID?1:a.toFactoryID <b.toFactoryID?-1:0
                        || a.yarnColorID >b.yarnColorID?1:a.yarnColorID <b.yarnColorID?-1:0
                });
                item.yarnDataInfo.forEach( (item2, index2) => {
                    item2.packageInfo.sort((a,b)=>{ return a.yarnLotID >b.yarnLotID?1:a.yarnLotID <b.yarnLotID?-1:0 });
                    item2.packageInfo.forEach( (item3, index3) => {
                        item3.yarnBoxInfo.sort((a,b)=>{ return a.boxID >b.boxID?1:a.boxID <b.boxID?-1:0 });
                    });
                });
            });

            this.yarnData.forEach( (item, index) => {
                item.yarnDataInfo.forEach( (item2, index2) => {
                    item2.packageInfo.forEach( (item3, index3) => {
                        item3.yarnWeightTotal = +(item3.yarnBoxInfo.reduce((prev, cur) => {return prev + cur.yarnWeight;}, 0).toFixed(2));
                        item3.yarnUseWeightTotal = +(item3.yarnBoxInfo.reduce((prev, cur) => {return prev + cur.useWeight;}, 0).toFixed(2));
                        item3.yarnTransferWeightTotal = +(item3.yarnBoxInfo.reduce((prev, cur) => {return prev + cur.yarnTransferWeight;}, 0).toFixed(2));
                        item3.yarnWeightNetTotal = +(item3.yarnBoxInfo.reduce((prev, cur) => {return prev + cur.yarnWeightNet;}, 0).toFixed(2));
                    });
                });
            });

            this.yarnDataOld = this.yarnData.map(obj => ({...obj})); // copy array object
            // console.log(this.yarnDataOld);
            this.yarnStockRow = [];
            if (this.yarnDataOld.length > 0) {
                this.setYarnTransferUsageRow();
            }
        });
    }

    setYarnTransferUsageRow() {

        function getFullRow(yarnData: YarnData, yarnDataInfo: YarnDataInfo, packageInfo: PackageInfo, getFactoryNameByFactoryID: Function,
            getColorNameByColorCode: Function, factoryName: string, colorName: string) {
            let yarnStock1: YarnStockRow = GBC.clrYarnStockRow();

            const factoryID = packageInfo.yarnBoxInfo[0].factoryID;
            // const factoryName = getFactoryNameByFactoryID(factoryID);
            const color3 = yarnDataInfo.yarnColorID.split(';');
            const setname = color3[0];
            const colorCode = color3[1];
            const colorID = color3[2];
            // const colorName = getColorNameByColorCode(colorID, setname);
            const dataInfo = {
                factoryName: factoryName
            };

            // ## new full row
            yarnStock1.rowState = 'd';// ##  d=full row , sd= sub data, t=total , gt=grand total , b= blank row
            yarnStock1.companyID = yarnData.companyID;
            yarnStock1.factoryID = factoryID;
            yarnStock1.yarnID = yarnData.yarnID;
            yarnStock1.uuid = yarnData.uuid;
            yarnStock1.yarnSeasonID = yarnData.yarnSeasonID;
            yarnStock1.orderID = yarnData.orderID;
            yarnStock1.colorS = yarnData.colorS;

            yarnStock1.yarnColorID = yarnDataInfo.yarnColorID;
            yarnStock1.colorCode = colorCode;
            yarnStock1.colorID = colorID;
            yarnStock1.colorName = colorName;
            yarnStock1.yarnDataUUID = yarnDataInfo.yarnDataUUID;
            yarnStock1.toFactoryID = yarnDataInfo.toFactoryID;

            yarnStock1.invoiceID = packageInfo.invoiceID;
            yarnStock1.yarnLotID = packageInfo.yarnLotID;
            yarnStock1.yarnLotUUID = packageInfo.yarnLotUUID;
            yarnStock1.yarnBoxInfo = packageInfo.yarnBoxInfo;
            yarnStock1.dataInfo = dataInfo;

            yarnStock1.carton = packageInfo.yarnBoxInfo.length;
            yarnStock1.yarnWeightTotal = +(packageInfo.yarnBoxInfo.reduce((prev, cur) => {return prev + cur.yarnWeight;}, 0).toFixed(2));
            yarnStock1.yarnUseWeightTotal = +(packageInfo.yarnBoxInfo.reduce((prev, cur) => {return prev + cur.useWeight;}, 0).toFixed(2));
            yarnStock1.yarnStockWeightTotal = +(packageInfo.yarnBoxInfo.reduce((prev, cur) => {return prev + cur.yarnTransferWeight;}, 0).toFixed(2));
            yarnStock1.yarnWeightNetTotal = +(packageInfo.yarnBoxInfo.reduce((prev, cur) => {return prev + cur.yarnWeightNet;}, 0).toFixed(2));

            cartonTotal = cartonTotal + yarnStock1.carton;
            yarnWeightTotal = yarnWeightTotal + yarnStock1.yarnWeightTotal;
            useWeightTotal = useWeightTotal + yarnStock1.yarnUseWeightTotal;
            yarnStockWeightTotal = yarnStockWeightTotal + yarnStock1.yarnStockWeightTotal;
            yarnWeightNetTotal = yarnWeightNetTotal + yarnStock1.yarnWeightNetTotal;

            cartonGTotal = cartonGTotal + yarnStock1.carton;
            yarnWeightGTotal = yarnWeightGTotal + yarnStock1.yarnWeightTotal;
            useWeightGTotal = useWeightGTotal + yarnStock1.yarnUseWeightTotal;
            yarnStockWeightGTotal = yarnStockWeightGTotal + yarnStock1.yarnStockWeightTotal;
            yarnWeightNetGTotal = yarnWeightNetGTotal + yarnStock1.yarnWeightNetTotal;

            yarnStockRow.push(yarnStock1);
            yarnStockCurrent = {...yarnStock1};
        }

        function getDataSubRow(yarnData: YarnData, yarnDataInfo: YarnDataInfo, packageInfo: PackageInfo, getFactoryNameByFactoryID: Function,
            getColorNameByColorCode: Function, factoryName: string, colorName: string) {
            let yarnStock1: YarnStockRow = GBC.clrYarnStockRow();

            const factoryID = packageInfo.yarnBoxInfo[0].factoryID;
            // const factoryName = getFactoryNameByFactoryID(factoryID);
            const color3 = yarnDataInfo.yarnColorID.split(';');
            const setname = color3[0];
            const colorCode = color3[1];
            const colorID = color3[2];
            // const colorName = getColorNameByColorCode(colorID, setname);
            const dataInfo = {
                factoryName: factoryName
            };

            yarnStock1.rowState = 'sd';// ## rowState =  sd = subbody d=data , t=total , gt= grand total , b=blank row
            yarnStock1.companyID = yarnData.companyID;
            yarnStock1.factoryID = factoryID;
            yarnStock1.yarnID = yarnData.yarnID;
            yarnStock1.uuid = yarnData.uuid;
            yarnStock1.yarnSeasonID = yarnData.yarnSeasonID;
            yarnStock1.orderID = yarnData.orderID;
            yarnStock1.colorS = yarnData.colorS;

            yarnStock1.yarnColorID = yarnDataInfo.yarnColorID;
            yarnStock1.colorCode = colorCode;
            yarnStock1.colorID = colorID;
            yarnStock1.colorName = colorName;
            yarnStock1.yarnDataUUID = yarnDataInfo.yarnDataUUID;
            yarnStock1.toFactoryID = yarnDataInfo.toFactoryID;

            yarnStock1.invoiceID = packageInfo.invoiceID;
            yarnStock1.yarnLotID = packageInfo.yarnLotID;
            yarnStock1.yarnLotUUID = packageInfo.yarnLotUUID;
            yarnStock1.yarnBoxInfo = packageInfo.yarnBoxInfo;
            yarnStock1.dataInfo = dataInfo;

            yarnStock1.carton = packageInfo.yarnBoxInfo.length;
            yarnStock1.yarnWeightTotal = +(packageInfo.yarnBoxInfo.reduce((prev, cur) => {return prev + cur.yarnWeight;}, 0).toFixed(2));
            yarnStock1.yarnUseWeightTotal = +(packageInfo.yarnBoxInfo.reduce((prev, cur) => {return prev + cur.useWeight;}, 0).toFixed(2));
            yarnStock1.yarnStockWeightTotal = +(packageInfo.yarnBoxInfo.reduce((prev, cur) => {return prev + cur.yarnTransferWeight;}, 0).toFixed(2));
            yarnStock1.yarnWeightNetTotal = +(packageInfo.yarnBoxInfo.reduce((prev, cur) => {return prev + cur.yarnWeightNet;}, 0).toFixed(2));

            cartonTotal = cartonTotal + yarnStock1.carton;
            yarnWeightTotal = yarnWeightTotal + yarnStock1.yarnWeightTotal;
            useWeightTotal = useWeightTotal + yarnStock1.yarnUseWeightTotal;
            yarnStockWeightTotal = yarnStockWeightTotal + yarnStock1.yarnStockWeightTotal;
            yarnWeightNetTotal = yarnWeightNetTotal + yarnStock1.yarnWeightNetTotal;

            cartonGTotal = cartonGTotal + yarnStock1.carton;
            yarnWeightGTotal = yarnWeightGTotal + yarnStock1.yarnWeightTotal;
            useWeightGTotal = useWeightGTotal + yarnStock1.yarnUseWeightTotal;
            yarnStockWeightGTotal = yarnStockWeightGTotal + yarnStock1.yarnStockWeightTotal;
            yarnWeightNetGTotal = yarnWeightNetGTotal + yarnStock1.yarnWeightNetTotal;

            yarnStockRow.push(yarnStock1);
            yarnStockCurrent = {...yarnStock1};

        }

        function getTotalRow(yarnData: YarnData, yarnDataInfo: YarnDataInfo) {
            let yarnStock1: YarnStockRow = GBC.clrYarnStockRow();

            yarnStock1.rowState = 't';// ##  d=full row , sd= sub data, t=total , gt=grand total , b= blank row
            yarnStock1.yarnID = yarnData.yarnID;
            yarnStock1.yarnColorID = yarnDataInfo.yarnColorID;

            yarnStock1.yarnLotID = 'Total';
            yarnStock1.carton = +(cartonTotal.toFixed(2));
            yarnStock1.yarnWeightTotal = +(yarnWeightTotal.toFixed(2));
            yarnStock1.yarnUseWeightTotal = +(useWeightTotal.toFixed(2));
            yarnStock1.yarnStockWeightTotal = +(yarnStockWeightTotal.toFixed(2));
            yarnStock1.yarnWeightNetTotal = +(yarnWeightNetTotal.toFixed(2));

            cartonTotal = 0;
            yarnWeightTotal = 0;
            useWeightTotal = 0;
            yarnStockWeightTotal = 0;
            yarnWeightNetTotal = 0;

            yarnStockRow.push(yarnStock1);
            // yarnLotUsageListCurrent = {...GBC.clrYarnLotUsageList()};

        }

        function getGrandTotalRow(yarnData: YarnData, yarnDataInfo: YarnDataInfo) {
            let yarnStock1: YarnStockRow = GBC.clrYarnStockRow();

            yarnStock1.rowState = 'gt';// ##  d=full row , sd= sub data, t=total , gt=grand total , b= blank row
            yarnStock1.yarnID = yarnData.yarnID;
            yarnStock1.yarnColorID = yarnDataInfo.yarnColorID;

            yarnStock1.yarnLotID = 'Grand Total';
            yarnStock1.carton = +(cartonGTotal.toFixed(2));
            yarnStock1.yarnWeightTotal = +(yarnWeightGTotal.toFixed(2));
            yarnStock1.yarnUseWeightTotal = +(useWeightGTotal.toFixed(2));
            yarnStock1.yarnStockWeightTotal = +(yarnStockWeightGTotal.toFixed(2));
            yarnStock1.yarnWeightNetTotal = +(yarnWeightNetGTotal.toFixed(2));

            cartonGTotal = 0;
            yarnWeightGTotal = 0;
            useWeightGTotal = 0;
            yarnStockWeightGTotal = 0;
            yarnWeightNetGTotal = 0;

            yarnStockRow.push(yarnStock1);
            yarnStockCurrent = {...GBC.clrYarnStockRow()};
        }

        function getBlankRow(yarnData: YarnData, yarnDataInfo: YarnDataInfo) {
            let yarnStock1: YarnStockRow = GBC.clrYarnStockRow();

            yarnStock1.rowState = 'b'; // ##  d=full row , sd= sub data, t=total , gt=grand total , b= blank row
            yarnStock1.yarnID = yarnData.yarnID;

            cartonTotal = 0;
            yarnWeightTotal = 0;
            useWeightTotal = 0;
            yarnStockWeightTotal = 0;
            yarnWeightNetTotal = 0;

            cartonGTotal = 0;
            yarnWeightGTotal = 0;
            useWeightGTotal = 0;
            yarnStockWeightGTotal = 0;
            yarnWeightNetGTotal = 0;

            yarnStockRow.push(yarnStock1);
            yarnStockCurrent = {...yarnStock1};
        }

        function getEndOfRow() {
            let yarnStock1: YarnStockRow = GBC.clrYarnStockRow();
            yarnStock1.rowState = 'eof';
            yarnStock1.yarnID = 'End of Data';
            yarnStockRow.push(yarnStock1);
        }

        let yarnStockRow: YarnStockRow[] = [];
        let cartonTotal = 0;
        let yarnWeightTotal = 0;
        let useWeightTotal = 0;
        let yarnStockWeightTotal = 0;
        let yarnWeightNetTotal = 0;

        let cartonGTotal = 0;
        let yarnWeightGTotal = 0;
        let useWeightGTotal = 0;
        let yarnStockWeightGTotal = 0;
        let yarnWeightNetGTotal = 0;

        // let yarnLotUsageListCurrent: YarnLotUsageList = GBC.clrYarnLotUsageList();
        let yarnStockCurrent: YarnStockRow = GBC.clrYarnStockRow();

        // ## find last row index and length
        const yarnDataLen = this.yarnData.length;
        const yarnDataInfoLen = this.yarnData[yarnDataLen - 1].yarnDataInfo.length;
        const packageInfoLen = this.yarnData[yarnDataLen - 1].yarnDataInfo[yarnDataInfoLen - 1].packageInfo.length;

        // ## find factory name
        const factoryID = this.yarnData[0].yarnDataInfo[0].packageInfo[0].yarnBoxInfo[0].factoryID;
        const factoryName = this.userService.getFactoryNameByFactoryID(factoryID);

        this.yarnData.forEach( (item, index) => {
            item.yarnDataInfo.forEach( (item2, index2) => {
                item2.packageInfo.forEach( (item3, index3) => {

                    const color3 = item2.yarnColorID.split(';');
                    const setname = color3[0];
                    const colorCode = color3[1];
                    const colorID = color3[2];
                    const colorName = this.userService.getColorNameByColorCode(colorID, setname);
                    // ## first row
                    if (item.yarnID !== yarnStockCurrent.yarnID && index === 0) {  // ## first row
                        getFullRow(
                            item, item2, item3, this.userService.getFactoryNameByFactoryID, this.userService.getColorNameByColorCode,
                            factoryName, colorName
                        );
                    } else if (item.yarnID !== yarnStockCurrent.yarnID && index > 0) {
                        // ## set total row
                        getTotalRow(item, item2);

                        // ## set grand total row
                        getGrandTotalRow(item, item2);

                        // ## add blank row
                        getBlankRow(item, item2);

                        // ## new row
                        getFullRow(
                            item, item2, item3, this.userService.getFactoryNameByFactoryID, this.userService.getColorNameByColorCode,
                            factoryName, colorName
                        );
                    } else { // ##   item.yarnID === yarnStockCurrent.yarnID

                        // ## check color
                        // ## not the same color
                        if (item2.yarnColorID !== yarnStockCurrent.yarnColorID) {
                            // ## set total row
                            getTotalRow(item, item2);

                            // ## add row sub data
                            getDataSubRow(
                                item, item2, item3, this.userService.getFactoryNameByFactoryID, this.userService.getColorNameByColorCode,
                                factoryName, colorName
                            ); // ## add row sub data

                        } else {  // ## same color
                            // ## add row sub data
                            getDataSubRow(
                                item, item2, item3, this.userService.getFactoryNameByFactoryID, this.userService.getColorNameByColorCode,
                                factoryName, colorName
                            );  // ## add row sub data
                        }

                    }

                    // ## end of row data
                    if (index === yarnDataLen - 1 && index2 === yarnDataInfoLen - 1 && index3 === packageInfoLen - 1) {
                        // ## set total row
                        getTotalRow(item, item2);

                        // ## set grand total row
                        getGrandTotalRow(item, item2);

                        // ## add blank row
                        getBlankRow(item, item2);

                        getEndOfRow();
                    }
                });
            });
        });
        this.yarnStockRow = yarnStockRow.map(obj => ({...obj})); // copy array object
        // console.log(this.yarnStockRow);
    }

    exportPDF(yarnStockRow1: YarnStockRow) {
        // console.log(yarnStockRow);
        const yarnDataOld = this.yarnDataOld.map(obj => ({...obj})); // copy array object
        const yarnData = yarnDataOld.filter(i=>i.yarnID === yarnStockRow1.yarnID)[0];
        // console.log(yarnData);

        const yarnStockRows = this.yarnStockRow.map(obj => ({...obj})); // copy array object
        const yarnStockRow = yarnStockRows.filter(i=>i.yarnID === yarnStockRow1.yarnID);
        // console.log(yarnStockRow);

        const docDefinition = this.yarnService.createYarnStockPDF(yarnData, yarnStockRow);
        // console.log(docDefinition);
        // console.log('createYarnStockPDF.....');
        pdfMake.createPdf(docDefinition).open();
    }

    closePage() {
        this.closeYarnReportStock.emit('close page');
    }

    ngOnDestroy(): void {
        if (this.dataAroundAppSub) { this.dataAroundAppSub.unsubscribe(); }
        if (this.yarnReportSub) { this.yarnReportSub.unsubscribe(); }
        if (this.yarnDataSub) { this.yarnDataSub.unsubscribe(); }

    }
}
