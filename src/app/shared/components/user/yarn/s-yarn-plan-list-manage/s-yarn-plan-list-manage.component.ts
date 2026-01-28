import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { DialogService } from 'primeng/dynamicdialog';
import { Subscription } from 'rxjs';
import { GBC } from 'src/app/global/const-global';
import { ColorS, Company, Factory } from 'src/app/models/app.model';
import { Customer, OrderImage } from 'src/app/models/order.model';
import { ColorTotalPlan, MMDDTotalFooter, Yarn, YarnData, YarnDataInfo } from 'src/app/models/yarn.model';
import { UserService } from 'src/app/services/user.service';
import { YarnService } from 'src/app/services/yarn.service';
import { SmdYarnDataInfoManageComponent } from '../smd-yarn-data-info-manage/smd-yarn-data-info-manage.component';

@Component({
  selector: 'app-s-yarn-plan-list-manage',
  templateUrl: './s-yarn-plan-list-manage.component.html',
  styleUrls: ['./s-yarn-plan-list-manage.component.scss'],
  providers: [DialogService],
})
export class SYarnPlanListManageComponent implements OnInit, OnDestroy {
    @Input() mode = '';  // ## list-manage-plan,  list-manage-actual
    @Input() yarnSeason = '';
    @Input() company: Company = GBC.clrCompany();
    @Input() factorySelect: Factory = GBC.clrFactory();
    @Input() customer: Customer = GBC.clrCustomer();
    // @Input() yarns: Yarn[] = [];
    // @Input() yarnsCount: number = 0;
    @Input() yarnPlan: YarnData = GBC.clrYarnData();
    // @Input() yarnPlansCount: number = 0;

    // @Output() selectYarnPlan = new EventEmitter<YarnData>();

    productImageProfileGCSPath = GBC.productImageProfileGCSPath;  // ## google storage path
    nulltGCSPath= GBC.nulltGCSPath;

    factoryCTSelect: Factory = GBC.clrFactory();

    viewMode = 'plan-list';
    yarnPlanSelect: YarnData = GBC.clrYarnData();
    loading = true;
    orderImagesSelect: OrderImage[] = [];
    yarnPlanDateGroup: any[] = [];
    yarnPlanDateGroupPlan: any[] = [];
    yarnPlanDateGroupReceive: any[] = [];
    colorS: ColorS = GBC.clrOrderColor();
    colorSx: any[] = [];
    yarnColorID = '';
    yarnDataUUID = '';
    yarnDataInfo_Receive: YarnDataInfo[] = [];
    uuid = '';
    yarnID = '';

    actualMode = 'actual.net'; // ## actual  , actual.net



    // ## table total additional more
    mmddTotalFooter: MMDDTotalFooter[] = []; // ## footer for plan ETD // ## { mmdd: '11-01', total: 0.00}
    colorTotalPlan: ColorTotalPlan[] = []; // ## total plan by color // ##  { setName: 'muji', colorCode: '#011', colorID: 'IV', total: 0.00}
    totalPlanFooter = 0;
    colorTotalReceive: ColorTotalPlan[] = [];
    mmddTotalReceiveFooter: MMDDTotalFooter[] = [];
    totalReceiveFooter = 0;
    totalNetReceiveFooter = 0;

    private yarnPlanListSub: Subscription = new Subscription();

    constructor(
        // private route: ActivatedRoute,
        // private router: Router,
        // private location: Location,

        public dialogService: DialogService,

        public userService: UserService,
        public yarnService: YarnService,
    ) {}

    ngOnInit(): void {
        // console.log('ngOnInit');
        this.loading = false;
        // console.log(this.mode);
        // console.log(this.yarnPlan);
        this.orderImagesSelect = [];
        this.orderImagesSelect = this.userService.getOrderImage(this.yarnPlan.orderID);
        // console.log(this.userService.productImageProfiles);

        this.getYarnPlansList1();
    }

    getYarnPlansList1() {
        // this.yarnDataInfo_Receive = [];
        this.actualMode = 'actual.net';
        this.loading = true;
        const companyID = this.company.companyID;
        const factoryID = this.factorySelect.factoryID;
        const customerID = this.customer.customerID;
        const uuid = this.yarnPlan.uuid;
        const yarnID = this.yarnPlan.yarnID;
        const type = ['plan', 'receive'];
        // getYarnPlansList1(companyID: string, factoryID: string, customerID: string, uuid: string, yarnSeasonID: string, yarnID: string)
        this.yarnService.getYarnPlansList1(companyID, factoryID, customerID, uuid, this.yarnSeason, yarnID, type);
        if (this.yarnPlanListSub) { this.yarnPlanListSub.unsubscribe(); }
        this.yarnPlanListSub = this.yarnService.getYarnPlanList1Listener().subscribe((data) => {
            // console.log(data);
            this.loading = false;
            this.yarnPlanDateGroup = [];
            this.yarnPlanDateGroupPlan = [];
            this.yarnDataInfo_Receive = [];
            this.yarnPlan = data.yarnPlan;



            // console.log(data.yarnPlanDateGroup);
            this.yarnPlanDateGroup = data.yarnPlanDateGroup;
            this.yarnPlanDateGroupPlan = [...data.yarnPlanDateGroup.filter(i=>i.type == 'plan')];
            this.yarnPlanDateGroupReceive = [...data.yarnPlanDateGroup.filter(i=>i.type == 'receive')];
            this.yarnDataInfo_Receive = [...this.yarnPlan.yarnDataInfo.filter(i=>i.type == 'receive')];
            // console.log(this.yarnPlanDateGroup);

            // console.log(this.yarnPlanDateGroupReceive);
            // console.log(this.yarnPlanDateGroup);

            this.colorSx = [...this.yarnPlan.colorS];


            this.yarnPlanDateGroupPlan.forEach( (item, index) => {
                const mm = item.mmdd.substr(0,2);
                const date1 = item.mmdd.substr(2,3);
                const monthShortName = this.userService.getMonthNamebyID(mm, 'short');
                item.date1 = monthShortName + date1;
            });
            this.yarnPlanDateGroupReceive.forEach( (item, index) => {
                const mm = item.mmdd.substr(0,2);
                const date1 = item.mmdd.substr(2,3);
                const monthShortName = this.userService.getMonthNamebyID(mm, 'short');
                item.date1 = monthShortName + date1;
            });

            this.yarnPlan.yarnDataInfo.forEach( (item, index) => {
                item.yyyymmdd = this.userService.returnDateYYYYMMDDSign(item.datetime, '-');
                item.mmdd = this.userService.returnDateMMDDSign(item.datetime, '-');
                const colorGroup = item.yarnColorID.split(";");  // ## muji;#011;IV
                item.setName = colorGroup[0];   // ## muji
                item.colorCode = colorGroup[1];  // ## #011
                item.colorID = colorGroup[2];   // ## IV
            });
            // returnDateYYYYMMDDSign =  (date: Date, sign: string)
            // returnDateMMDDSign =  (date: Date, sign: string)

            // console.log(this.yarnPlan);
            // console.log(this.yarnPlanDateGroup);


            this.orderImagesSelect = [];
            this.orderImagesSelect = this.userService.getOrderImage(this.yarnPlan.orderID);

            // ## for table view
            this.totalPlanFooter = 0;
            this.mmddTotalFooter = [];
            this.yarnPlanDateGroupPlan.forEach( (item, index) => {
                this.mmddTotalFooter.push({mmdd: item.mmdd, total: 0.00, totalNet: 0.00});
            });
            this.mmddTotalFooter.forEach( (item, index) => {
                const mmddF = this.yarnPlan.yarnDataInfo.filter(i=>i.mmdd == item.mmdd);
                item.total = mmddF.reduce((prev, cur) => {return prev + (cur.yarnWeight*100);}, 0) / 100;
            });
            this.totalPlanFooter = this.mmddTotalFooter.reduce((prev, cur) => {return prev + (cur.total*100);}, 0) / 100;

            // { setName: 'muji', colorCode: '#011', colorID: 'IV', total: 0.00}
            this.colorTotalPlan = [];
            this.yarnPlan.colorS.forEach( (item, index) => {
                this.colorTotalPlan.push({
                    setName: item.setName,
                    colorCode: item.color.colorCode,
                    colorID: item.color.colorID,
                    total: 0.00,
                    totalNet: 0.00
                });
            });
            this.colorTotalPlan.forEach( (item, index) => {
                const mmddF = this.yarnPlan.yarnDataInfo.filter(i=>
                    i.setName == item.setName &&
                    i.colorCode == item.colorCode &&
                    i.colorID == item.colorID
                );
                item.total = mmddF.reduce((prev, cur) => {return prev + (cur.yarnWeight*100);}, 0) / 100;
            });

            // console.log(this.mmddTotalFooter);
            // console.log(this.colorTotalPlan);
            // console.log(this.totalPlanFooter);



            // console.log(this.yarnDataInfo_Receive);
            // public yarnPlanWeightTotal: number,
            // public yarnWeightTotal: number,
            // public yarnWeightTotalPercent: string,
            this.yarnDataInfo_Receive.forEach( (item1, index) => {
                item1.packageInfo.forEach( (item2, index) => {
                    item2.yarnPlanWeightTotal = item2.yarnBoxInfo.reduce((prev, cur) => {return prev + cur.yarnPlanWeight;}, 0);
                    item2.yarnWeightTotal = item2.yarnBoxInfo.reduce((prev, cur) => {return prev + cur.yarnWeight;}, 0);
                    item2.yarnWeightNetTotal = item2.yarnBoxInfo.reduce((prev, cur) => {return prev + cur.yarnWeightNet;}, 0);
                    item2.yarnWeightTotalPercent = this.userService.calDiffPercent(item2.yarnWeightTotal, item2.yarnPlanWeightTotal);
                });
                item1.yarnPlanWeightTotal = item1.packageInfo.reduce((prev, cur) => {return prev + cur.yarnPlanWeightTotal;}, 0);
                item1.yarnWeightTotal = item1.packageInfo.reduce((prev, cur) => {return prev + cur.yarnWeightTotal;}, 0);
                item1.yarnWeightNetTotal = item1.packageInfo.reduce((prev, cur) => {return prev + cur.yarnWeightNetTotal;}, 0);
                item1.yarnWeightTotalPercent = this.userService.calDiffPercent(item1.yarnWeightTotal, item1.yarnPlanWeightTotal);
            });
            this.yarnDataInfo_Receive.forEach( (item1, index) => {
                item1.packageInfo.forEach( (item2, index2) => {
                    item2.boxIDAllVerified = true;
                    item2.yarnBoxInfo.forEach( (item3, index3) => {
                        if (!item3.weightVerified) {
                            item2.boxIDAllVerified = false;
                        }
                    });
                });
            });
            // ## verified , boxIDAllVerified , wait
            this.yarnDataInfo_Receive.forEach( (item1, index) => {
                item1.stateLists = [];
                item1.packageInfo.forEach( (item2, index2) => {
                    // item2.boxIDAllVerified = true;
                    if (item2.state === 'verified') {
                        item1.stateLists.push('verified');
                    } else {
                        if (item2.boxIDAllVerified) {
                            item1.stateLists.push('boxIDAllVerified');
                        } else {
                            item1.stateLists.push('wait');
                        }
                    }
                });
            });

            // console.log(this.yarnPlanDateGroupPlan);
            // console.log(this.yarnPlan.yarnDataInfo);
            // console.log(this.yarnDataInfo_Receive);

            // colorTotalReceive
            this.colorTotalReceive = [];
            this.yarnPlan.colorS.forEach( (item, index) => {
                this.colorTotalReceive.push({
                    setName: item.setName,
                    colorCode: item.color.colorCode,
                    colorID: item.color.colorID,
                    total: 0.00,
                    totalNet: 0.00
                    // item.total = mmddF.reduce((prev, cur) => {return prev + (cur.yarnWeight*100);}, 0) / 100;
                });
            });
            this.colorTotalReceive.forEach( (item, index) => {
                const mmddF = this.yarnDataInfo_Receive.filter(i=>
                    i.setName == item.setName &&
                    i.colorCode == item.colorCode &&
                    i.colorID == item.colorID
                );
                item.total = mmddF.reduce((prev, cur) => {return prev + (cur.yarnWeightTotal*100);}, 0) / 100;
                item.totalNet = mmddF.reduce((prev, cur) => {return prev + (cur.yarnWeightNetTotal*100);}, 0) / 100;
            });

            // mmddTotalReceiveFooter   totalReceiveFooter
            this.totalReceiveFooter = 0;
            this.totalNetReceiveFooter = 0;
            this.mmddTotalReceiveFooter = [];
            this.yarnPlanDateGroupReceive.forEach( (item, index) => {
                this.mmddTotalReceiveFooter.push({mmdd: item.mmdd, total: 0.00, totalNet: 0.00});
            });
            this.mmddTotalReceiveFooter.forEach( (item, index) => {
                const mmddF = this.yarnDataInfo_Receive.filter(i=>i.mmdd == item.mmdd);
                item.total = mmddF.reduce((prev, cur) => {return prev + (cur.yarnWeightTotal*100);}, 0) / 100;
                item.totalNet = mmddF.reduce((prev, cur) => {return prev + (cur.yarnWeightNetTotal*100);}, 0) / 100;
            });
            this.totalReceiveFooter = +(this.mmddTotalReceiveFooter.reduce((prev, cur) => {return prev + (cur.total*100);}, 0) / 100).toFixed(2);
            this.totalNetReceiveFooter = +(this.mmddTotalReceiveFooter.reduce((prev, cur) => {return prev + (cur.totalNet*100);}, 0) / 100).toFixed(2);
            // console.log(this.yarnDataInfo_Receive);

            // ## predata for yarn stat page
            this.colorSx.forEach( (item, index) => {
                item.totalReceive = +this.getColorTotalReceive(item);
            });
            // console.log(this.colorSx);
        });
    }

    gettotalReceiveFooter() {
        if (this.actualMode==='actual') {
            return this.totalReceiveFooter;
        } else if (this.actualMode==='actual.net') {
            return this.totalNetReceiveFooter;
        }
        return 0;
    }

    getColorTotalPlan(colorS: ColorS) {
        const cF = this.colorTotalPlan.filter(i=>
            i.setName == colorS.setName &&
            i.colorCode == colorS.color.colorCode &&
            i.colorID == colorS.color.colorID
        );
        if (cF.length > 0) {
            return cF[0].total;
        } else {
            return 0;
        }
    }

    getColorTotalReceive(colorS: ColorS) {
        const cF = this.colorTotalReceive.filter(i=>
            i.setName == colorS.setName &&
            i.colorCode == colorS.color.colorCode &&
            i.colorID == colorS.color.colorID
        );

        if (this.actualMode==='actual') {
            if (cF.length > 0) {
                return cF[0].total.toFixed(2);
            } else {
                return 0;
            }
        } else if (this.actualMode==='actual.net') {
            if (cF.length > 0) {
                return cF[0].totalNet.toFixed(2);
            } else {
                return 0;
            }
        } else { return 0; }
    }

    getColorTotalReceivePercent(colorS: ColorS) {
        const colorTotalPlan = +this.getColorTotalPlan(colorS);
        const colorTotalReceive = +this.getColorTotalReceive(colorS);
        const percent = +((colorTotalReceive / colorTotalPlan) * 100).toFixed(2);
        return percent > 0 ? percent : '';
    }

    getColorTotalReceiveQty(colorS: ColorS) {
        const colorTotalPlan = +this.getColorTotalPlan(colorS);
        const colorTotalReceive = +this.getColorTotalReceive(colorS);
        const qty = +(colorTotalPlan - colorTotalReceive).toFixed(2);
        return qty > 0 ? qty : '';
    }

    getMMDDTotalFooter(mmdd: string) {
        const mmddF = this.mmddTotalFooter.filter(i=>i.mmdd == mmdd);
        if (mmddF.length > 0) {
            return mmddF[0].total.toFixed(2);
        } else {
            return 0;
        }
    }

    getMMDDTotalReceiveFooter(mmdd: string) {
        const mmddF = this.mmddTotalReceiveFooter.filter(i=>i.mmdd == mmdd);

        if (this.actualMode==='actual') {
            if (mmddF.length > 0) {
                return mmddF[0].total.toFixed(2);
            } else {
                return 0;
            }
        } else if (this.actualMode==='actual.net') {
            if (mmddF.length > 0) {
                return mmddF[0].totalNet.toFixed(2);
            } else {
                return 0;
            }
        } else { return 0; }
    }

    getWeight(color1: ColorS, date2: any, type: string) {
        // ##  date2  { date1: "Nov-01",    mmdd: "11-01",    yyyymmdd: "2023-11-01" }
        const yarnDataInfo =  this.yarnPlan.yarnDataInfo;
        const weightF = yarnDataInfo.filter(i=>(
            i.mmdd == date2.mmdd &&
            i.type == type &&
            i.setName == color1.setName &&
            i.colorCode == color1.color.colorCode &&
            i.colorID == color1.color.colorID
        ));

        // if (date2.mmdd === '11-30') {
        //     console.log(color1, date2);
        //     console.log(weightF);
        // }

        // $numberDecimal
        // console.log(weightF);
        if (weightF.length > 0) {
            // const w1 = weightF[0].yarnWeight['$numberDecimal'].toLocaleString();
            // console.log(w1);
            return weightF[0].yarnWeight;

            // {camp.budget['$numberDecimal'].toLocaleString()}
        } else {
            return '';
        }
    }

    getWeightReceive(color1: ColorS, date2: any) {
        // public yarnPlanWeightTotal: number,
        // public yarnWeightTotal: number,
        // public yarnWeightTotalPercent: string,

        // ##  date2  { date1: "Nov-01",    mmdd: "11-01",    yyyymmdd: "2023-11-01" }
        const yarnDataInfo_Receive =  this.yarnDataInfo_Receive;
        const weightF = yarnDataInfo_Receive.filter(i=>(
            i.mmdd == date2.mmdd &&
            i.setName == color1.setName &&
            i.colorCode == color1.color.colorCode &&
            i.colorID == color1.color.colorID
        ));
        if (this.actualMode==='actual') {

            if (weightF.length > 0) {
                // const w1 = weightF[0].yarnWeight['$numberDecimal'].toLocaleString();
                // console.log(w1);
                return weightF[0].yarnWeightTotal>0?weightF[0].yarnWeightTotal.toFixed(2): '';

                // {camp.budget['$numberDecimal'].toLocaleString()}
            } else {
                return '';
            }
        } else if (this.actualMode==='actual.net') {
            if (weightF.length > 0) {
                return weightF[0].yarnWeightTotal>0?weightF[0].yarnWeightNetTotal.toFixed(2): '';
            } else {
                return '';
            }
        } else { return ''; }
    }

    changeActualMode() {
        if (this.actualMode==='actual.net') {
            this.actualMode = 'actual';
        } else {
            this.actualMode = 'actual.net';
        }
    }

    getStateLists(color1: ColorS, date2: any) {
        const yarnDataInfo_Receive =  this.yarnDataInfo_Receive;
        const weightF = yarnDataInfo_Receive.filter(i=>(
            i.mmdd == date2.mmdd &&
            i.setName == color1.setName &&
            i.colorCode == color1.color.colorCode &&
            i.colorID == color1.color.colorID
        ));
        if (weightF.length > 0) {
            return weightF[0].stateLists;
        }
        return [];
    }

    addYarnDataInfo(colorS: ColorS) {
        // genColorSTxt(colorS: ColorS, str: string)
        const yarnColorID = this.userService.genYarnColorID(colorS, ';');
        this.showYarnDataInfoManage(yarnColorID);
    }



    showYarnDataInfoManage(yarnColorID: string) {
        // console.log(mode, idx);
        const ref = this.dialogService.open(SmdYarnDataInfoManageComponent, {
            data: {
                id: 'yarnDataInfoManage',
                company: this.userService?.getCompany(),
                factorySelect: this.factorySelect,
                customer: this.customer,
                uuid: this.yarnPlan.uuid,
                // yarnDataUUID: this.yarnDataUUID,
                yarnPlan: this.yarnPlan,
                mode: this.mode,  // ## mode = list-manage-plan,  list-manage-actual
                yarnSeason: this.yarnSeason,
                yarnColorID: yarnColorID,
                btnCaption: 'choose'

            },
            header: 'Yarn data info [add new plan]',
            width: '50%',
        });

        ref.onClose.subscribe((data: any) => {
            // console.log(data);
            if (!data) {

            } else {
                // this.getYarnPlansList1();
                // this.yarnSelects = [];
                // this.orderImagesSelect = [];
                // this.orderImagesSelect.push(data.orderImage);
                // this.orderImagesSelect[idx] = {orderID: data.orderImage.orderID, imageProfile: data.orderImage.imageProfile};
            }

        });
    }

    backToPlanList(data: any) {
        this.viewMode = 'plan-list';
        // console.log(this.viewMode);
        if (data) {
            this.getYarnPlansList1();
        }
    }

    yarnWeightStat() {
        // console.log(colorS);
        this.yarnPlanSelect = {...this.yarnPlan};
        this.viewMode = 'yarn-stat';
    }

    yarnPackingListManageSelect(colorS: ColorS) {
        this.yarnColorID = '';
        this.yarnColorID = this.userService.genYarnColorID(colorS, ';');
        this.colorS = colorS;
        this.yarnPlanSelect = {...this.yarnPlan};
        this.viewMode = 'yarn-packaging-list-manage';
    }

    yarnPackingListStockCardSelect(colorS: ColorS) {
        this.yarnColorID = '';
        this.yarnColorID = this.userService.genYarnColorID(colorS, ';');
        this.colorS = colorS;
        this.yarnDataUUID = '';
        this.uuid = this.yarnPlan.uuid;
        this.yarnID = this.yarnPlan.yarnID;
        const yarnDataInfo_Receive =  this.yarnDataInfo_Receive;
        const yarnData1 = yarnDataInfo_Receive.filter(i=>i.yarnColorID == this.yarnColorID);
        if (yarnData1.length > 0) {
            this.yarnDataUUID = yarnData1[0].yarnDataUUID;

        }
        this.factoryCTSelect = {...this.factorySelect};
        this.factoryCTSelect.factoryID = '*';
        this.viewMode = 'yarn-packaging-list-stock-card';
    }

    yarnBoxTransfer(colorS: ColorS) {
        this.factoryCTSelect = {...this.factorySelect};
        this.factoryCTSelect.factoryID = '*';

        this.viewMode = 'yarn-ct-lot-fac';
    }

    ngOnDestroy(): void {
        // if (this.dataAroundAppSub) { this.dataAroundAppSub.unsubscribe(); }
        if (this.yarnPlanListSub) { this.yarnPlanListSub.unsubscribe(); }

    }
}
