import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { DialogService } from 'primeng/dynamicdialog';
import { Subscription } from 'rxjs';
import { MenuItem } from 'primeng/api';

import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';

import { GBC } from 'src/app/global/const-global';
import { ColorS, Company, Factory } from 'src/app/models/app.model';
import { Customer, OrderImage } from 'src/app/models/order.model';
import { PackageInfo, Yarn, YarnBoxInfo, YarnData, YarnDataInfo, YarnInvoiceList } from 'src/app/models/yarn.model';
import { UserService } from 'src/app/services/user.service';
import { YarnService } from 'src/app/services/yarn.service';

import { SmdYarnPlanPackinglistAddComponent } from '../smd-yarn-plan-packinglist-add/smd-yarn-plan-packinglist-add.component';
import { SmdYarnLotManageComponent } from '../smd-yarn-lot-manage/smd-yarn-lot-manage.component';
import { SCcDateSelectComponent } from '../../../component/s-cc-date-select/s-cc-date-select.component';
import { SmdYarnChangeinvoiceidComponent } from '../smd-yarn-changeinvoiceid/smd-yarn-changeinvoiceid.component';


(pdfMake as any).vfs = pdfFonts.pdfMake.vfs;

@Component({
  selector: 'app-s-yarn-plan-packinglist-manage',
  templateUrl: './s-yarn-plan-packinglist-manage.component.html',
  styleUrls: ['./s-yarn-plan-packinglist-manage.component.scss'],
  providers: [DialogService],
})
export class SYarnPlanPackinglistManageComponent implements OnInit, OnDestroy {
    @Input() mode = '';  // ## yarn-packaging-list-manage
    @Input() yarnSeason = '';
    @Input() company: Company = GBC.clrCompany();
    @Input() factorySelect: Factory = GBC.clrFactory();
    @Input() customer: Customer = GBC.clrCustomer();
    @Input() orderImagesSelect: OrderImage[] = [];
    @Input() colorS: ColorS = GBC.clrOrderColor();
    @Input() yarnColorID = '';
    @Input() yarnPlan: YarnData = GBC.clrYarnData();

    @Output() closeYarnPackingList = new EventEmitter<any>();

    productImageProfileGCSPath = GBC.productImageProfileGCSPath;  // ## google storage path
    nulltGCSPath= GBC.nulltGCSPath;

    loading = true;
    yarnPlanOld: YarnData = GBC.clrYarnData();
    yarnDataInfo: YarnDataInfo[] = [];
    yarnDataInfoOld: YarnDataInfo[] = [];
    yarnInvoiceList: YarnInvoiceList[] = [];
    yarns: Yarn[] = [];

    items: MenuItem[] = [];

    // ##############################################################################################
    // ## PDF zone ##################################################################################
    yarnDataInfoYarnAllReceivePDF: YarnDataInfo[] = [];
    yarnDataInfoInvoicePDF: YarnDataInfo[] = [];
    yarnDataInfoPackingListPDF: YarnDataInfo[] = [];

    content: any[] = [];
    contentYarnAllReceivePDF: any[] = [];
    contentInvoicePDF: any[] = [];
    contentPackingListPDF: any[] = [];

    private yarnPlanListSub: Subscription = new Subscription();
    private yarnPlanInvoiceListSub: Subscription = new Subscription();
    private yarnEditInvoiceIDSub: Subscription = new Subscription();

    constructor(
        // private route: ActivatedRoute,
        // private router: Router,
        // private location: Location,

        public dialogService: DialogService,

        public userService: UserService,
        public yarnService: YarnService,
    ) {}

    ngOnInit(): void {
        // console.log('SYarnPlanPackinglistManageComponent');
        // console.log(this.mode);
        // console.log(this.yarnPlan);

        this.items = [
            { label: 'View', icon: 'pi pi-fw pi-search' },
            { label: 'Delete', icon: 'pi pi-fw pi-trash' }
        ];
        this.getYarnEditInvoiceIDListener();
        this.getYarnPlansList1();
    }



    getYarnPlansList1() {
        this.yarns = [];
        this.loading = true;
        const companyID = this.company.companyID;
        const factoryID = this.factorySelect.factoryID;
        const customerID = this.customer.customerID;
        const uuid = this.yarnPlan.uuid;
        const yarnID = this.yarnPlan.yarnID;
        const type = ['receive'];
        // getYarnPlansList1(companyID: string, factoryID: string, customerID: string, uuid: string, yarnSeasonID: string, yarnID: string)
        this.yarnService.getYarnPlansList1(companyID, factoryID, customerID, uuid, this.yarnSeason, yarnID, type);
        if (this.yarnPlanListSub) { this.yarnPlanListSub.unsubscribe(); }
        this.yarnPlanListSub = this.yarnService.getYarnPlanList1Listener().subscribe((data) => {
            // console.log(data);
            const type = 'receive';
            this.loading = false;
            // this.yarnPlanDateGroup = [];
            this.yarns = data.yarns;
            // console.log(this.yarns);
            // console.log(this.yarnService.getYarnss()); // ## show yarns list
            this.yarnPlan = data.yarnPlan;
            this.yarnDataInfo = this.yarnPlan.yarnDataInfo.filter(i=>i.type == type && i.yarnColorID == this.yarnColorID);
            this.yarnDataInfo.sort((a,b)=>{ return a.yyyymmdd >b.yyyymmdd?1:a.yyyymmdd <b.yyyymmdd?-1:0 });
            this.yarnPlanOld = {...this.yarnPlan};
            // this.yarnDataInfoOld = [...this.yarnDataInfo];
            // console.log(this.yarnDataInfo);

            this.yarnPlanOld = Object.assign({}, this.yarnPlan);  // copy object
            this.yarnDataInfoOld = this.yarnDataInfo.map(obj => ({...obj})); // copy array object

            // this.yarnPlanDateGroup = data.yarnPlanDateGroup;
            // console.log(this.yarnPlanDateGroup);
            // console.log(this.yarnPlan);
            // console.log(this.yarnPlanOld);

            // this.yarnPlanDateGroup.forEach( (item, index) => {
            //     const mm = item.mmdd.substr(0,2);
            //     const date1 = item.mmdd.substr(2,3);
            //     const monthShortName = this.userService.getMonthNamebyID(mm, 'short');
            //     item.date1 = monthShortName + date1;
            // });

            const yarnDevideSign = this.userService.yarnDevideSign;
            this.yarnPlan.yarnDataInfo.forEach( (item, index) => {
                item.yyyymmdd = this.userService.returnDateYYYYMMDDSign(item.datetime, '-');
                item.mmdd = this.userService.returnDateMMDDSign(item.datetime, '-');
                const colorGroup = item.yarnColorID.split(";");  // ## muji;#011;IV
                item.setName = colorGroup[0];   // ## muji
                item.colorCode = colorGroup[1];  // ## #011
                item.colorID = colorGroup[2];   // ## IV

                // public yarnPlanWeightTotal: number,
                // public yarnWeightTotal: number,
                // boxIDAllVerified  boolean
                item.packageInfo.forEach( (item2, index2) => {
                    const yarnWeightNetTotal = +item2.yarnBoxInfo.reduce((prev, cur) => {return prev + cur.yarnWeightNet;}, 0).toFixed(2);
                    item2.yarnBoxInfo.forEach( (item3, index3) => {
                        const yarnPlanWeightTotal = +item2.yarnBoxInfo.reduce((prev, cur) => {return prev + cur.yarnPlanWeight;}, 0).toFixed(2);
                        const yarnWeightTotal = +item2.yarnBoxInfo.reduce((prev, cur) => {return prev + cur.yarnWeight;}, 0).toFixed(2);
                        const yarnWeightDif = +(yarnWeightNetTotal - yarnPlanWeightTotal).toFixed(2);
                        const yarnWeightTotalPercent = this.userService.calDiffPercent(yarnWeightNetTotal, yarnPlanWeightTotal);
                        const yarnWeightTotalDifPercent = (+yarnWeightTotalPercent - 100).toFixed(2);
                        item2.carton = item2.yarnBoxInfo.filter(i=>i.boxID.split(yarnDevideSign).length === 1).length;
                        item2.yarnPlanWeightTotal = yarnPlanWeightTotal;
                        item2.yarnWeightTotal = yarnWeightTotal;
                        item2.yarnWeightTotalPercent = yarnWeightTotalPercent;
                        // item2.yarnWeightDif = yarnWeightDif;
                        // item2.yarnWeightTotalDifPercent = yarnWeightTotalDifPercent;

                        const cCWeight = this.getCCWeight(item3, item2.coneWeight, item2.boxWeight);
                        item3.cCWeight = cCWeight;
                        item3.yarnWeightNet = +(item3.yarnWeight - cCWeight).toFixed(2);

                        item3.yarnWeightDif = +(item3.yarnWeightNet - item3.yarnPlanWeight).toFixed(2);
                        item3.yarnWeightTotalDifPercent = yarnWeightTotalDifPercent;
                    });
                    // const totalCountBet = sumGroupbyMemberBetAllx.reduce((prev, cur) => {return prev + cur.countBet;}, 0);
                    item2.yarnPlanWeightTotal = +item2.yarnBoxInfo.reduce((prev, cur) => {return prev + cur.yarnPlanWeight;}, 0).toFixed(2);
                    item2.yarnWeightTotal = +item2.yarnBoxInfo.reduce((prev, cur) => {return prev + cur.yarnWeight;}, 0).toFixed(2);

                    item2.yarnTransferWeightTotal = +item2.yarnBoxInfo.reduce((prev, cur) => {return prev + cur.yarnTransferWeight;}, 0).toFixed(2);
                    item2.yarnCCWeightTotal = +item2.yarnBoxInfo.reduce((prev, cur) => {return prev + cur.cCWeight;}, 0).toFixed(2);
                    item2.yarnWeightNetTotal = +item2.yarnBoxInfo.reduce((prev, cur) => {return prev + cur.yarnWeightNet;}, 0).toFixed(2);

                    item2.yarnWeightTotalPercent = this.userService.calDiffPercent(item2.yarnWeightNetTotal, item2.yarnPlanWeightTotal);
                    // item2.yarnWeightDifTotal = +(yarnWeightTotal - yarnPlanWeightTotal).toFixed(2);
                    item2.yarnWeightDifTotal = +(item2.yarnWeightNetTotal - item2.yarnPlanWeightTotal).toFixed(2);

                    // const num1 = item2.yarnWeight;
                    // const num2 = this.packageInfo.yarnBoxInfo[idxX].yarnPlanWeight;
                    // const result = +this.userService.calDiffPercent(num1, num2);
                    // this.packageInfo.yarnBoxInfo[idx].yarnWeightDif = result;

                    const boxIDAllVerifiedF = item2.yarnBoxInfo.filter(i=>i.weightVerified === false);
                    if (boxIDAllVerifiedF.length > 0) {
                        item2.boxIDAllVerified = false;
                    } else {
                        item2.boxIDAllVerified = true;
                    }
                });
            });

            // console.log(this.yarnPlan);
            // const yarnDataInfo1 = this.yarnPlan.yarnDataInfo.filter(i=>i.type === 'receive');
            // console.log(yarnDataInfo1);

            // // ## for table view
            // this.totalPlanFooter = 0;
            // this.mmddTotalFooter = [];
            // this.yarnPlanDateGroup.forEach( (item, index) => {
            //     this.mmddTotalFooter.push({mmdd: item.mmdd, total: 0.00});
            // });
            // this.mmddTotalFooter.forEach( (item, index) => {
            //     const mmddF = this.yarnPlan.yarnDataInfo.filter(i=>i.mmdd == item.mmdd);
            //     item.total = mmddF.reduce((prev, cur) => {return prev + (cur.yarnWeight*100);}, 0) / 100;
            // });
            // this.totalPlanFooter = this.mmddTotalFooter.reduce((prev, cur) => {return prev + (cur.total*100);}, 0) / 100;

            // this.colorTotalPlan = [];
            // this.yarnPlan.colorS.forEach( (item, index) => {
            //     this.colorTotalPlan.push({
            //         setName: item.setName,
            //         colorCode: item.color.colorCode,
            //         colorID: item.color.colorID,
            //         total: 0.00
            //     });
            // });
            // this.colorTotalPlan.forEach( (item, index) => {
            //     const mmddF = this.yarnPlan.yarnDataInfo.filter(i=>
            //         i.setName == item.setName &&
            //         i.colorCode == item.colorCode &&
            //         i.colorID == item.colorID
            //     );
            //     item.total = mmddF.reduce((prev, cur) => {return prev + (cur.yarnWeight*100);}, 0) / 100;
            // });


            // console.log(this.mmddTotalFooter);
            // console.log(this.colorTotalPlan);
            // console.log(this.totalPlanFooter);
            // console.log(this.yarnDataInfo);
        });
    }

    // ## cc = carton & cone weight
    getCCWeight(yarnBoxInfo1: YarnBoxInfo, coneWeight: number, boxWeight: number): number {
        const coneQty = yarnBoxInfo1.coneQty;
        if (coneQty === 0 || coneWeight === 0 || boxWeight === 0) {
            return 0.00;
        }
        const ccWeight = +((coneQty * coneWeight) + boxWeight).toFixed(2);
        return ccWeight;
    }

    getYarnPlansInvoiceList2(invoiceID: string, yarnDataInfo1: YarnDataInfo[], state: string) {
        // ## state = normal, blankPackingList
        const yarnDevideSign = this.userService.yarnDevideSign;
        this.yarnInvoiceList = [];
        const companyID = this.company.companyID;
        const factoryID = this.factorySelect.factoryID;
        const customerID = this.customer.customerID;
        // const invoiceID = this.yarnPlan.invoiceID;
        const type = ['receive'];
        this.yarnService.getYarnPlansInvoiceList2(companyID, factoryID, customerID, this.yarnSeason, type, invoiceID);
        if (this.yarnPlanInvoiceListSub) { this.yarnPlanInvoiceListSub.unsubscribe(); }
        this.yarnPlanInvoiceListSub = this.yarnService.getYarnPlanInvoiceListListener().subscribe((data) => {
            // console.log(data);
            const yarnPlans = data.yarnPlans;
            this.yarnInvoiceList = data.yarnInvoiceList;
            // console.log(this.yarnInvoiceList);
            this.yarnInvoiceList.forEach( (item, index) => {
                item.yarnBoxInfo.forEach( (item2, index2) => {
                    const cCWeight = this.getCCWeight(item2, item.coneWeight, item.boxWeight);
                    item2.cCWeight = cCWeight;
                    item2.yarnWeightNet = +(item2.yarnWeight - cCWeight).toFixed(2);
                });
                item.yyyymmdd = this.userService.returnDateYYYYMMDDSign(item.datetime, '-');
                item.mmdd = this.userService.returnDateMMDDSign(item.datetime, '-');
                const colorGroup = item.yarnColorID.split(";");  // ## muji;#011;IV
                item.setName = colorGroup[0];   // ## muji
                item.colorCode = colorGroup[1];  // ## #011
                item.colorID = colorGroup[2];   // ## IV

                const yarnPlanWeightTotal = +item.yarnBoxInfo.reduce((prev, cur) => {return prev + cur.yarnPlanWeight;}, 0).toFixed(2);
                const yarnWeightTotal = +item.yarnBoxInfo.reduce((prev, cur) => {return prev + cur.yarnWeight;}, 0).toFixed(2);
                const yarnWeightNetTotal = +item.yarnBoxInfo.reduce((prev, cur) => {return prev + cur.yarnWeightNet;}, 0).toFixed(2);
                const yarnWeightDif = +(yarnWeightNetTotal - yarnPlanWeightTotal).toFixed(2);
                const yarnWeightTotalPercent = this.userService.calDiffPercent(yarnWeightNetTotal, yarnPlanWeightTotal);
                const yarnWeightTotalDifPercent = (+yarnWeightTotalPercent - 100).toFixed(2);
                item.carton = item.yarnBoxInfo.filter(i=>i.boxID.split(yarnDevideSign).length === 1).length;
                item.yarnPlanWeightTotal = yarnPlanWeightTotal;
                item.yarnWeightTotal = yarnWeightTotal;
                item.yarnWeightDif = yarnWeightDif;
                item.yarnWeightTotalPercent = yarnWeightTotalPercent;
                item.yarnWeightTotalDifPercent = yarnWeightTotalDifPercent;

                item.yarnWeightDifTotal = +(item.yarnWeightDif - item.yarnPlanWeightTotal).toFixed(2);
                item.yarnCCWeightTotal = +item.yarnBoxInfo.reduce((prev, cur) => {return prev + cur.cCWeight;}, 0).toFixed(2);
                item.yarnTransferWeightTotal = +item.yarnBoxInfo.reduce((prev, cur) => {return prev + cur.yarnTransferWeight;}, 0).toFixed(2);
                item.yarnWeightNetTotal = +item.yarnBoxInfo.reduce((prev, cur) => {return prev + cur.yarnWeightNet;}, 0).toFixed(2);
            });

            // public coneWeight: number,
            // public boxWeight: number,
            // public yarnWeightDifTotal: number,
            // public yarnCCWeightTotal: number,
            // public yarnTransferWeightTotal: number,
            // public yarnWeightNetTotal: number,

            // public carton: number,   // ## boxes qty
            // public yarnPlanWeightTotal: number,
            // public yarnWeightTotal: number,
            // public yarnWeightDif: number,
            // public yarnWeightTotalPercent: string,

            this.yarnInvoiceList.sort((a,b)=>{
                return a.yarnID >b.yarnID?1:a.yarnID <b.yarnID?-1:0
                    || a.yarnColorID >b.yarnColorID?1:a.yarnColorID <b.yarnColorID?-1:0
                    || a.yarnLotID >b.yarnLotID?1:a.yarnLotID <b.yarnLotID?-1:0
            });

            // ## get  invoice list from yarnDataInfo  [filter]
            const invoiceID = this.yarnInvoiceList.length > 0 ? this.yarnInvoiceList[0].invoiceID : '';
            const yarnPlans01 = [...yarnPlans];
            // console.log(this.yarnDataInfo);
            const yarnPlansX = this.getInvoiceList(invoiceID, yarnPlans01);

            // console.log(this.yarnInvoiceList, yarnDataInfoX);
            // console.log(this.yarnDataInfo);
            // console.log(this.yarnDataInfoOld);
            this.createInvoicePDF(this.yarnInvoiceList, yarnPlansX, state); // ## state = normal, blankPackingList
            // this.yarnPlan = {...this.yarnPlanOld};
            // this.yarnDataInfo = [...this.yarnDataInfoOld];
        });
    }

    getInvoiceList(invoiceID: string, yarnPlans: YarnData[]) {
        if (invoiceID === '') {
            return [];
        }
        let yarnPlans01 = [...yarnPlans];
        // let yarnDataInfoX: YarnDataInfo[] = [];
        yarnPlans01.forEach( (item, index) => {
            item.yarnDataInfo.forEach( (item2, index2) => {
                item2.packageInfo = [...item2.packageInfo.filter(i=>i.invoiceID===invoiceID)];
            });
        });
        yarnPlans01.forEach( (item, index) => {
            item.yarnDataInfo = item.yarnDataInfo.filter(i=>i.packageInfo.length > 0);
        });

        const yarnDevideSign = this.userService.yarnDevideSign;
        yarnPlans01.forEach( (item0, index0) => {
            item0.yarnDataInfo.forEach( (item, index) => {
                item.yyyymmdd = this.userService.returnDateYYYYMMDDSign(item.datetime, '-');
                item.mmdd = this.userService.returnDateMMDDSign(item.datetime, '-');
                const colorGroup = item.yarnColorID.split(";");  // ## muji;#011;IV
                item.setName = colorGroup[0];   // ## muji
                item.colorCode = colorGroup[1];  // ## #011
                item.colorID = colorGroup[2];   // ## IV

                // public yarnPlanWeightTotal: number,
                // public yarnWeightTotal: number,
                // boxIDAllVerified  boolean
                item.packageInfo.forEach( (item2, index2) => {
                    const yarnWeightNetTotal = +item2.yarnBoxInfo.reduce((prev, cur) => {return prev + cur.yarnWeightNet;}, 0).toFixed(2);
                    item2.yarnBoxInfo.forEach( (item3, index3) => {
                        const yarnPlanWeightTotal = +item2.yarnBoxInfo.reduce((prev, cur) => {return prev + cur.yarnPlanWeight;}, 0).toFixed(2);
                        const yarnWeightTotal = +item2.yarnBoxInfo.reduce((prev, cur) => {return prev + cur.yarnWeight;}, 0).toFixed(2);
                        const yarnWeightDif = +(yarnWeightNetTotal - yarnPlanWeightTotal).toFixed(2);
                        const yarnWeightTotalPercent = this.userService.calDiffPercent(yarnWeightNetTotal, yarnPlanWeightTotal);
                        const yarnWeightTotalDifPercent = (+yarnWeightTotalPercent - 100).toFixed(2);
                        item2.carton = item2.yarnBoxInfo.filter(i=>i.boxID.split(yarnDevideSign).length === 1).length;
                        item2.yarnPlanWeightTotal = yarnPlanWeightTotal;
                        item2.yarnWeightTotal = yarnWeightTotal;
                        item2.yarnWeightTotalPercent = yarnWeightTotalPercent;
                        // item2.yarnWeightDif = yarnWeightDif;
                        // item2.yarnWeightTotalDifPercent = yarnWeightTotalDifPercent;

                        const cCWeight = this.getCCWeight(item3, item2.coneWeight, item2.boxWeight);
                        item3.cCWeight = cCWeight;
                        item3.yarnWeightNet = +(item3.yarnWeight - cCWeight).toFixed(2);

                        item3.yarnWeightDif = +(item3.yarnWeightNet - item3.yarnPlanWeight).toFixed(2);
                        item3.yarnWeightTotalDifPercent = yarnWeightTotalDifPercent;
                    });
                    // const totalCountBet = sumGroupbyMemberBetAllx.reduce((prev, cur) => {return prev + cur.countBet;}, 0);
                    item2.yarnPlanWeightTotal = +item2.yarnBoxInfo.reduce((prev, cur) => {return prev + cur.yarnPlanWeight;}, 0).toFixed(2);
                    item2.yarnWeightTotal = +item2.yarnBoxInfo.reduce((prev, cur) => {return prev + cur.yarnWeight;}, 0).toFixed(2);

                    item2.yarnTransferWeightTotal = +item2.yarnBoxInfo.reduce((prev, cur) => {return prev + cur.yarnTransferWeight;}, 0).toFixed(2);
                    item2.yarnCCWeightTotal = +item2.yarnBoxInfo.reduce((prev, cur) => {return prev + cur.cCWeight;}, 0).toFixed(2);
                    item2.yarnWeightNetTotal = +item2.yarnBoxInfo.reduce((prev, cur) => {return prev + cur.yarnWeightNet;}, 0).toFixed(2);

                    item2.yarnWeightTotalPercent = this.userService.calDiffPercent(item2.yarnWeightNetTotal, item2.yarnPlanWeightTotal);
                    // item2.yarnWeightDifTotal = +(yarnWeightTotal - yarnPlanWeightTotal).toFixed(2);
                    item2.yarnWeightDifTotal = +(item2.yarnWeightNetTotal - item2.yarnPlanWeightTotal).toFixed(2);

                    // const num1 = item2.yarnWeight;
                    // const num2 = this.packageInfo.yarnBoxInfo[idxX].yarnPlanWeight;
                    // const result = +this.userService.calDiffPercent(num1, num2);
                    // this.packageInfo.yarnBoxInfo[idx].yarnWeightDif = result;

                    const boxIDAllVerifiedF = item2.yarnBoxInfo.filter(i=>i.weightVerified === false);
                    if (boxIDAllVerifiedF.length > 0) {
                        item2.boxIDAllVerified = false;
                    } else {
                        item2.boxIDAllVerified = true;
                    }
                });
            });
        });


        return yarnPlans01;
    }


    putCancelYarnPackingList1(yarnDataUUID: string) {
        const userID = this.userService.getUser().userID;
        const companyID = this.company.companyID;
        const factoryID = this.factorySelect.factoryID;
        const customerID = this.customer.customerID;
        const setName = this.customer.setName;
        const yarnID = this.yarnPlan.yarnID;
        const uuid = this.yarnPlan.uuid;
        // const yarnDataUUID = this.data.yarnDataUUID;
        const yarnSeason = this.yarnSeason;
        const type = 'receive';
        const yarnColorID = this.yarnColorID;
        // const yarnDataUUID = yarnDataUUID;
        // const orderIDs = this.userService.getOrderIDss();
        // getYarPlansList(companyID: string, factoryID: string, customerID: string, setName: string, yarnSeason: string)
        this.yarnService.putCancelYarnPackingList1(userID, companyID, factoryID, customerID, uuid,
            yarnSeason, yarnID, yarnDataUUID, yarnColorID, type);
    }

    changeDateYarnDataInfo(yarnDataUUID: string, datetime: Date) {
        const userID = this.userService.getUser().userID;
        const companyID = this.company.companyID;
        const factoryID = this.factorySelect.factoryID;
        const customerID = this.customer.customerID;
        const setName = this.customer.setName;
        const yarnID = this.yarnPlan.yarnID;
        const uuid = this.yarnPlan.uuid;
        // const yarnDataUUID = this.data.yarnDataUUID;
        const yarnSeason = this.yarnSeason;
        const type = 'receive';
        const yarnColorID = this.yarnColorID;
        // const datetime = '';

        // console.log(datetime);
        // console.log(userID, companyID, factoryID, customerID, uuid,
        // yarnSeason, yarnID, yarnDataUUID, yarnColorID, type);
        // this.showSelectDate1();
        this.yarnService.putYarnDataInfoDatetime(userID, companyID, factoryID, customerID, uuid,
            yarnSeason, yarnID, yarnDataUUID, yarnColorID, type, datetime);

        // this.getYarnPlansList1()
    }

    getMonthShortName(mmdd: string) {
        // console.log(mmdd);
        const mm = mmdd.substr(0,2);
        const date1 = mmdd.substr(2,3);
        const monthShortName = this.userService.getMonthNamebyID(mm, 'short');
        const date2 = monthShortName + date1;
        return date2;
    }

    // ## select  1 date , single date
    showSelectDate1(yarnDataUUID: string) {
        // console.log(mode, idx);
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
                const datetime = data.date1;
                this.changeDateYarnDataInfo(yarnDataUUID, datetime);
                // this.getYarnPlansList1();
                // this.yarnSelects = [];
                // this.orderImagesSelect = [];
                // this.orderImagesSelect.push(data.orderImage);
                // this.orderImagesSelect[idx] = {orderID: data.orderImage.orderID, imageProfile: data.orderImage.imageProfile};
            }

        });
    }

    showYarnDataInfoManage() {
        // console.log(mode, idx);
        const ref = this.dialogService.open(SmdYarnPlanPackinglistAddComponent, {
            data: {
                id: 'yarnPackingListAdd',
                mode: this.mode,  // ## mode =
                company: this.userService?.getCompany(),
                factorySelect: this.factorySelect,
                customer: this.customer,
                yarnSeason: this.yarnSeason,
                colorS: this.colorS,
                yarnPlan: this.yarnPlan,
                yarnColorID: this.yarnColorID,
                orderImagesSelect: this.orderImagesSelect,
                btnCaption: 'choose'

            },
            header: 'Yarn packinglist [add new packing list]',
            width: '60%',
        });

        ref.onClose.subscribe((data: any) => {
            // console.log(data);
            if (!data) {

            } else {
                this.getYarnPlansList1();
                // this.yarnSelects = [];
                // this.orderImagesSelect = [];
                // this.orderImagesSelect.push(data.orderImage);
                // this.orderImagesSelect[idx] = {orderID: data.orderImage.orderID, imageProfile: data.orderImage.imageProfile};
            }

        });
    }

    showYarnLotManage(mmdd: string, yarnDataInfo: YarnDataInfo, yarnLotMode: string, yarnLotUUID: string) {
        // console.log(mode, idx);
        const ref = this.dialogService.open(SmdYarnLotManageComponent, {
            data: {
                id: 'yarnLotAdd',
                yarnLotMode: yarnLotMode,
                yarnLotUUID: yarnLotUUID,
                mode: this.mode,  // ## mode =
                mmddSelect: mmdd,
                company: this.userService?.getCompany(),
                factorySelect: this.factorySelect,
                customer: this.customer,
                yarnSeason: this.yarnSeason,
                colorS: this.colorS,
                yarnPlan: this.yarnPlan,
                yarnColorID: this.yarnColorID,
                orderImagesSelect: this.orderImagesSelect,
                yarnDataInfo: {...yarnDataInfo},
                btnCaption: 'choose'

            },
            header: 'Yarn Lot [add/edit new Lot]',
            width: '80%',
        });

        ref.onClose.subscribe((data: any) => {
            // console.log(data);
            if (!data) {

            } else {
                this.getYarnPlansList1();
                // this.yarnSelects = [];
                // this.orderImagesSelect = [];
                // this.orderImagesSelect.push(data.orderImage);
                // this.orderImagesSelect[idx] = {orderID: data.orderImage.orderID, imageProfile: data.orderImage.imageProfile};
            }

        });
    }

    setMenuPopup(from: 'invoice'|'actual', mmdd: string, yarnDataInfo: YarnDataInfo, yarnLotMode: string, yarnLotID: string,
        yarnLotUUID: string, packageInfo: PackageInfo,) {
        // (click)="showYarnLotManage(getMonthShortName(yarnData.mmdd), yarnData, 'edit', yp1.yarnLotUUID)"
        // (click)="showYarnLotManage(getMonthShortName(yarnData.mmdd), yarnData, 'edit', yp2.yarnLotUUID)"
        // yarnData.mmdd, yarnData, 'edit', yp1.yarnLotUUID
        const yarnDataInfoxx = [...this.yarnPlan.yarnDataInfo.filter(i=>i.type === 'receive')];
        const yarnDataInfo1 = [...yarnDataInfoxx];
        // console.log(yarnDataInfo1);
        const monthShortName = this.getMonthShortName(mmdd);
        this.items = [
            {
                label: 'Yarn Lot ID: ' + yarnLotID,
                visible: true,
                items: [
                    {
                        label: 'edit',
                        icon: 'pi pi-fw pi-file-edit',
                        visible: packageInfo.state!=='verified',
                        command: () => {
                            this.showYarnLotManage(monthShortName, yarnDataInfo, yarnLotMode, yarnLotUUID);
                        }
                    },
                    {
                        label: 'Confirm yarn Lot ID',
                        icon: 'pi pi-fw pi-check-square',
                        visible: packageInfo.boxIDAllVerified && packageInfo.state!=='verified',
                        command: () => {
                            this.showYarnLotManage(monthShortName, yarnDataInfo, 'confirm', yarnLotUUID);
                        }
                    },

                    {
                        label: 'view data',
                        icon: 'pi pi-fw pi-check-square',
                        visible: packageInfo.state==='verified',
                        command: () => {
                            this.showYarnLotManage(monthShortName, yarnDataInfo, 'view', yarnLotUUID);
                        }
                    },
                ]
            },
            {
                label: 'export PDF:',
                visible: true,
                items: [
                    {separator: true},{separator: true},{separator: true},
                    {
                        // strFirstAndDot(str: string, len: number)
                        label: 'Yarn ID: '+ this.userService.strFirstAndDot(this.yarnPlan.yarnID, 30),
                        visible: true,
                        command: () => {
                            const yarnDataInfoxx = this.yarnDataInfoOld.map(obj => ({...obj})); // copy array object
                            this.createYarnAllReceivePDF(yarnDataInfoxx);
                        }
                    },
                    {separator: true},{separator: true},{separator: true},
                    {
                        label: 'invoice ID: '+ packageInfo.invoiceID,
                        visible: true,
                        command: () => {
                            // this.createInvoicePDF(yarnDataInfo1);
                            const yarnDataInfoxx = this.yarnDataInfoOld.map(obj => ({...obj})); // copy array object
                            this.getYarnPlansInvoiceList2(packageInfo.invoiceID, [...yarnDataInfoxx], 'normal'); // ## state = normal, blankPackingList
                        }
                    },
                    {separator: true},
                    {
                        label: '__________ [ ' + 'packing list blank form' + ' ]',
                        visible: true,
                        command: () => {
                            // this.createInvoicePDF(yarnDataInfo1);
                            const yarnDataInfoxx = this.yarnDataInfoOld.map(obj => ({...obj})); // copy array object
                            this.getYarnPlansInvoiceList2(packageInfo.invoiceID, [...yarnDataInfoxx], 'blankPackingList'); // ## state = normal, blankPackingList
                        }
                    },
                    {separator: true},{separator: true},{separator: true},
                    // (from: 'invoice'|'actual', mmdd: string, yarnDataInfo: YarnDataInfo, yarnLotMode: string, yarnLotID: string,
                    // yarnLotUUID: string, packageInfo: PackageInfo,)
                    {
                        label: 'Yarn Lot ID:     '+ yarnLotID,
                        visible: true,
                        command: () => {
                            // const yarnDataInfo1 = [...this.yarnPlan.yarnDataInfo.filter(i=>i.type === 'receive')];
                            const yarnDataInfoxx = this.yarnDataInfoOld.map(obj => ({...obj})); // copy array object
                            const yarnDataInfo2 = yarnDataInfoxx.filter(i=>i.yarnDataUUID === yarnDataInfo.yarnDataUUID);
                            const packageInfo2 = yarnDataInfo2[0].packageInfo.filter(i=>i.yarnLotID===yarnLotID && i.yarnLotUUID===yarnLotUUID);
                            let yarnDataInfo01 = {...yarnDataInfo2[0]};
                            yarnDataInfo01.packageInfo = packageInfo2;
                            this.createPackingListPDF([yarnDataInfo01]);
                            // this.yarnPlan = {...this.yarnPlanOld};
                            // this.yarnDataInfo = [...this.yarnDataInfoOld];
                        }
                    },
                    {separator: true},{separator: true},{separator: true},
                    {
                        label: '__________edit change invoice ID: '+ packageInfo.invoiceID,
                        visible: true,
                        command: () => {
                            const info = {
                                invoiceID1: packageInfo.invoiceID
                            };
                            this.showYarnChangeInvoiceIDModal(info);
                            // const yarnDataInfoxx = this.yarnDataInfoOld.map(obj => ({...obj})); // copy array object
                            // this.getYarnPlansInvoiceList2(packageInfo.invoiceID, [...yarnDataInfoxx], 'normal'); // ## state = normal, blankPackingList
                        }
                    },
                ]
            },
        ];
        // this.items = [];  invoiceID
    }

    closePage() {
        this.closeYarnPackingList.emit('close page');
    }



    // ##############################################################################################
    // ## PDF zone ##################################################################################
    prepareDataPDF() {
        // yarnDataInfoYarnAllReceivePDF: YarnDataInfo[] = [];
        // yarnDataInfoInvoicePDF: YarnDataInfo[] = [];
        // yarnDataInfoPackingListPDF: YarnDataInfo[] = [];
        const yarnDataInfo1 = this.yarnPlan.yarnDataInfo.filter(i=>i.type === 'receive');
        this.yarnDataInfoYarnAllReceivePDF = [...yarnDataInfo1];
        this.yarnDataInfoInvoicePDF = [...yarnDataInfo1];
        this.yarnDataInfoPackingListPDF = [...yarnDataInfo1];

    }

    // ## createYarnAllReceivePDF  YarnAllReceive #########################################################################################
    createYarnAllReceivePDF(yarnDataInfo1: YarnDataInfo[]) {
        const docDefinition = this.yarnService.createYarnAllReceivePDF(this.yarnPlan.yarnID, yarnDataInfo1);
        // console.log(docDefinition);
        // console.log('createYarnAllReceivePDF.....');
        pdfMake.createPdf(docDefinition).open();
    }

    // ## createInvoicePDF  Invoice #########################################################################################
    // ## state = normal, blankPackingList
    async createInvoicePDF(yarnInvoiceList: YarnInvoiceList[], yarnPlans: YarnData[], state: string) {
        // console.log(yarnInvoiceList);
        // console.log(yarnDataInfo1);
        // console.log(yarnPlans);

        const yarnIDs = Array.from(new Set(yarnInvoiceList.map((item: any) => item.yarnID))); // ## get yarnID array
        // console.log(yarnIDs);
        let index = 0;
        let myTimeout = setInterval( () => {
            if (index >= yarnIDs.length) {
                clearInterval(myTimeout);
            } else {
                let yarnPlans01 = [...yarnPlans];
                const yarnPlans01F = yarnPlans01.filter(i=>i.yarnID === yarnIDs[index]);
                // const yarnDataInfo1 = yarnPlans01F.length > 0 ? yarnPlans01F[0].yarnDataInfo : [];

                // ## get YarnDataInfo.len  > 0
                let yarnDataInfo1: YarnDataInfo[]= [];
                yarnPlans01F.forEach( (item, index) => {
                    if (item.yarnDataInfo.length > 0) {
                        yarnDataInfo1 = [...item.yarnDataInfo];
                    }
                });
                // createInvoicePDF(yarnID: string, yarnInvoiceList: YarnInvoiceList[], yarnDataInfo1: YarnDataInfo[], state: string)

                // console.log(yarnDataInfo1);
                const yarnInvoiceList1 = yarnInvoiceList.filter(i=>i.yarnID === yarnIDs[index]);
                // console.log(yarnIDs[index]);
                // console.log(yarnDataInfo1);
                // console.log(yarnInvoiceList1);
                const docDefinition = this.yarnService.createInvoicePDF(yarnIDs[index], yarnInvoiceList1, yarnDataInfo1, state);
                pdfMake.createPdf(docDefinition).open();
            }
            index++;
        }, 1500 );

        // const docDefinition = this.yarnService.createInvoicePDF(this.yarnPlan.yarnID, yarnInvoiceList, yarnDataInfo1);
        // // console.log(docDefinition);
        // // console.log('createInvoicePDF.....');
        // pdfMake.createPdf(docDefinition).open();

    }

    // ## createPackingListPDF  PackingList #########################################################################################
    createPackingListPDF(yarnDataInfo1: YarnDataInfo[]) {
        // ## state = normal, blankPackingList
        const docDefinition = this.yarnService.createPackingListPDF('single',this.yarnPlan.yarnID, yarnDataInfo1, 'normal');
        // console.log(docDefinition);
        // console.log('createPackingListPDF.....');
        pdfMake.createPdf(docDefinition).open();
    }



    // // ##  master PDF  #########################################################################################

    // createContent() {
    //     this.content = [];
    //     const contentHeaderTop = this.getHeaderPDF();
    //     const contentTableHeaderAndBody = this.getTableHeaderBodyPDF();

    //     // ## get body pdf
    //     const contentBody = this.getTableBodyPDF();


    //     // ## get footer pdf
    //     const contentFooter = this.getTablefooterPDF();

    //     this.content = [...this.content, ...contentHeaderTop, contentTableHeaderAndBody];
    //     this.generatePDF();
    // }

    // getHeaderPDF() {
    //     // ## header top
    //     const contentHeaderTop = [
    //         { text: 'dd-mm-yyyy', style: ['', ''], alignment: 'center' },
    //         { text: 'packing list....', style: ['', ''], alignment: 'center' },
    //         { text: 'color...', style: ['', ''], alignment: 'center' },
    //     ];
    //     return contentHeaderTop;
    // }

    // getTableHeaderBodyPDF() {
    //     // ## header table
    //     const contentTableHeader = {
    //         margin: [15, 0, 15, 0],
    //         style: 'tableExample',
    //         table: {
    //             // ##  11 columns         60                    /                   40
    //             widths: ['8%', '10%', '13%', '13%', '8%', '8%',      '7%', '7%', '7%', '8%', '11%'],
    //             headerRows: 2,
    //             body: [
    //                     [
    //                         {rowSpan: 2, text: [
    //                             {text: 'Date\n', style: ['txtheadsize', ''], alignment: 'center'},
    //                             {text: 'confirm date', style: ['txtSmall6', ''], color: 'gray', italics: true},
    //                         ], style: ['marginHeadTop3', '']},
    //                         {rowSpan: 2, text: 'Issue', style: ['txtheadsize', 'marginHeadTop7'], alignment: 'center'},
    //                         {rowSpan: 2, text: 'Invoice', style: ['txtheadsize', 'marginHeadTop7'], alignment: 'center'},
    //                         {rowSpan: 2, text: 'Lot no', style: ['txtheadsize', 'marginHeadTop7'], alignment: 'center'},

    //                         {text: 'receive', style: ['txtheadsize'], colSpan: 2, alignment: 'center'},
    //                         {},

    //                         {rowSpan: 2, text: 'Send to', style: ['txtheadsize', 'marginHeadTop7'], alignment: 'center', alignmentVertical: 'center'},
    //                         {rowSpan: 2, text: 'Style', style: ['txtheadsize', 'marginHeadTop7'], alignment: 'center' , alignmentCenter: 'center'},
    //                         {rowSpan: 2, text: 'Lot no', style: ['txtheadsize', 'marginHeadTop7'], alignment: 'center', alignmentVertical: 'center'},
    //                         {rowSpan: 2, text: 'Kgs.', style: ['txtheadsize', 'marginHeadTop7'], alignment: 'center'},
    //                         {rowSpan: 2, text: 'BAlance', style: ['txtheadsize', 'marginHeadTop7'], alignment: 'center'}
    //                     ],
    //                     [
    //                         '', '', '', '',
    //                         {text: 'invoice', style: ['txtheadsize'], alignment: 'center'},
    //                         {text: 'actual', style: ['txtheadsize'], alignment: 'center'},
    //                         '', '', '', '', '',
    //                     ]
    //             ]
    //         }
    //     };
    //     return contentTableHeader;
    // }

    // getTableBodyPDF() {
    //     const contentBody = '';
    // }

    // getTablefooterPDF() {
    //     const contentFooter = '';
    // }

    // generatePDF() {
    //     // this.content = [...this.content, ...content1, content2];
    //     const style = {
    //         marginHeadTop7: {
    //             margin: [0, 7, 0, 0]
    //         },
    //         marginHeadTop3: {
    //             margin: [0, 3, 0, 0]
    //         },
    //         txtheadsize: {
    //             fontSize: 8,
    //             bold: true,
    //         },
    //         txtSmall6: {
    //             fontSize: 6,
    //         },
    //     };
    //     let docDefinition: any = {
    //         pageSize: 'A4',
    //         pageMargins: [ 3, 10, 3, 10 ],
    //         // header: head2,
    //         // pageOrientation: 'portrait',
    //         // pageOrientation: 'portrait',
    //         content: this.content,
    //         // content: content1,
    //         // content: [content1, content1],
    //         // defaultStyle: {font: 'Roboto', fontSize: 10},
    //         defaultStyle: { fontSize: 8},
    //         styles: style,
    //     };

    //     pdfMake.createPdf(docDefinition).open();
    // }

    // // ## PDF zone ##################################################################################
    // // ##############################################################################################

    getYarnEditInvoiceIDListener() {
        if (this.yarnEditInvoiceIDSub) { this.yarnEditInvoiceIDSub.unsubscribe(); }
        this.yarnEditInvoiceIDSub = this.yarnService.getYarnEditInvoiceIDListener().subscribe((data) => {
            // console.log(data);
            if (data.success) {
                this.getYarnPlansList1();
            }
        });
    }

    putYarnChangeInvoiceID(companyID: string, yarnSeasonID: string, invoiceID1: string, invoiceID2: string) {
        // putYarnChangeInvoiceID(companyID: string, yarnSeasonID: string, invoiceID1: string, invoiceID2: string)
        this.yarnService.putYarnChangeInvoiceID(companyID, yarnSeasonID, invoiceID1, invoiceID2);

    }

    showYarnChangeInvoiceIDModal(info: any) {
        const companyID = this.company.companyID;
        const yarnSeasonID = this.yarnSeason;
        const ref = this.dialogService.open(SmdYarnChangeinvoiceidComponent, {
            data: {
                id: 'changeInvoiceID',
                company: this.userService?.getCompany(),
                // callfrom: this.formName,  // ## send to nodejs for choose buckets
                // btnCaption: 'choose'
                invoiceID1: info.invoiceID1,

            },
            header: 'change edit InvoiceID',
            width: '50%',
        });

        ref.onClose.subscribe((data: any) => {
            // console.log('data ', data);
            if (data) {
                if (data.success) {
                    // console.log('ok checnge');
                    this.yarnService.putYarnChangeInvoiceID(companyID, yarnSeasonID, info.invoiceID1, data.invoiceID2);
                }
            }
        });

    }

    ngOnDestroy(): void {
        if (this.yarnPlanInvoiceListSub) { this.yarnPlanInvoiceListSub.unsubscribe(); }
        if (this.yarnPlanListSub) { this.yarnPlanListSub.unsubscribe(); }
        if (this.yarnEditInvoiceIDSub) { this.yarnEditInvoiceIDSub.unsubscribe(); }

    }
}
