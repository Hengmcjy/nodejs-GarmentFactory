import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { DialogService } from 'primeng/dynamicdialog';
import { Subscription } from 'rxjs';

import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';

import { GBC } from 'src/app/global/const-global';
import { Color, ColorS, Company, Factory, TargetPlaceS } from 'src/app/models/app.model';
import { Customer, MainZone, OrderImage } from 'src/app/models/order.model';
import { CompanyOrderZoneStyleAllSize, CurrentCompanyOrderZoneStyleSize } from 'src/app/models/report.model';
import { DTMainZoneYarn, MainZoneYarn, YarnData, YarnStatCal } from 'src/app/models/yarn.model';
import { OrderService } from 'src/app/services/order.service';
import { UserService } from 'src/app/services/user.service';
import { YarnService } from 'src/app/services/yarn.service';

(pdfMake as any).vfs = pdfFonts.pdfMake.vfs;

@Component({
  selector: 'app-s-yarn-stat',
  templateUrl: './s-yarn-stat.component.html',
  styleUrls: ['./s-yarn-stat.component.scss'],
  providers: [DialogService],
})
export class SYarnStatComponent implements OnInit, OnDestroy {
    @Input() viewMode = '';
    @Input() yarnSeason = '';
    @Input() company: Company = GBC.clrCompany();
    @Input() factorySelect: Factory = GBC.clrFactory();
    @Input() customer: Customer = GBC.clrCustomer();
    @Input() orderImagesSelect: OrderImage[] = [];
    @Input() colorSx: any[] = [];
    @Input() yarnPlan: YarnData = GBC.clrYarnData();
    @Output() closeYarnStat = new EventEmitter<any>();

    loading: boolean = false;

    productImageProfileGCSPath = GBC.productImageProfileGCSPath;  // ## google storage path
    nulltGCSPath= GBC.nulltGCSPath;

    currentCompanyOrderZoneStyleSize: CurrentCompanyOrderZoneStyleSize[] = [];
    companyOrderZoneStyleAllSize: CompanyOrderZoneStyleAllSize[] = [];
    targetPlaces: TargetPlaceS[] = [];
    mainZone: MainZone[] = [];

    dataTable: any[] = [];
    dTMainZoneYarn: DTMainZoneYarn[] = [];
    yarnStatCalOld: YarnStatCal[] = [];
    yarnStatCal: YarnStatCal[] = [];
    yarnStatCalPDF: YarnStatCal[] = [];

    private yarnStatDataSub: Subscription = new Subscription();
    private yarnPlanStattSub: Subscription = new Subscription();

    constructor(
        public dialogService: DialogService,
        // private router: Router,
        // private location: Location,
        public userService: UserService,
        public orderService: OrderService,
        public yarnService: YarnService,
    ) {}

    ngOnInit(): void {
        // console.log(this.viewMode);
        // console.log(this.yarnPlan);
        // console.log(this.yarnSeason, this.company, this.factorySelect, this.customer, this.orderImagesSelect);
        // console.log(this.colorSx);

        this.targetPlaces = this.userService.targetPlaces;
        this.mainZone = this.userService.getMainZoneTargetPlace(this.targetPlaces);
        this.dataTable = [...this.yarnPlan.colorS];
        // console.log(this.dataTable);
        // console.log(this.orderImagesSelect);
        // console.log(this.targetPlaces);
        // console.log(this.mainZone);
        // console.log(this.userService.getOrders());
        // console.log(this.userService.sizes);
        // console.log(this.dataTable);

        this.getOrderIDsSizes();
    }

    getOrderIDsSizes() {
        this.loading = true;
        this.yarnStatCalOld = [];
        this.currentCompanyOrderZoneStyleSize = [];
        this.companyOrderZoneStyleAllSize = [];
        // this.orderIDs = Array.from(new Set(this.currentCompanyOrder.map((item: any) => item.orderID)));
        const orderIDs = Array.from(new Set(this.orderImagesSelect.map((item: any) => item.orderID)));
        const companyID = this.company.companyID;
        const yarnID = this.yarnPlan.yarnID;
        const uuid = this.yarnPlan.uuid;
        const yarnSeason = this.yarnSeason;
        // yarnID, uuid, yarnSeasonID
        // getOrderIDsSizes(companyID: string, orderIDs: string[])
        // getYarnStatData(companyID: string, orderIDs: string[])
        this.yarnService.getYarnStatData(companyID, orderIDs, yarnID, uuid, yarnSeason);
        if (this.yarnStatDataSub) { this.yarnStatDataSub.unsubscribe(); }
        this.yarnStatDataSub = this.yarnService.getYarnyarnStatDataListener().subscribe((data) => {
            // console.log(data);
            this.currentCompanyOrderZoneStyleSize = [];
            this.yarnStatCalOld = [];

            this.yarnStatCalOld = data.yarnStatCal;
            this.currentCompanyOrderZoneStyleSize = data.currentCompanyOrderZoneStyleSize;
            // console.log(this.yarnStatCalOld);
            // this.orderStyleColorSize = this.repService.setColorSeq(this.orders.orderColors, this.orderStyleColorSize);

            // const order1 = this.orders.filter(i=>i.orderID === 'AAOPHA4A');
            // console.log(order1);

            this.currentCompanyOrderZoneStyleSize.sort((a,b)=>{ return a.style >b.style?1:a.style <b.style?-1:0 });
            // console.log(this.currentCompanyOrder);

            this.currentCompanyOrderZoneStyleSize.forEach( (item, index) => {
                item.productSize = this.userService.strReplaceAll(item.productSize, '-', '');
            });
            // console.log(this.currentCompanyOrderZoneStyleSize);

            this.companyOrderZoneStyleAllSize = [];
            this.currentCompanyOrderZoneStyleSize.forEach( (item, index) => {
                const idx = this.companyOrderZoneStyleAllSize.findIndex( fi =>(
                    fi.companyID === item.companyID
                    && fi.orderID === item.orderID
                    && fi.targetPlaceID === item.targetPlaceID
                    && fi.productColor === item.productColor
                ));
                if (idx < 0) {
                    const companyOrderZoneStyleAllSize1 = {
                        companyID: item.companyID,
                        orderID: item.orderID,
                        targetPlaceID: item.targetPlaceID,
                        targetPlaceName: item.targetPlaceName,
                        productColor: item.productColor,
                        sumQty: item.sumQty
                    };
                    this.companyOrderZoneStyleAllSize.push(companyOrderZoneStyleAllSize1);
                } else {
                    this.companyOrderZoneStyleAllSize[idx].sumQty =
                        this.companyOrderZoneStyleAllSize[idx].sumQty + item.sumQty;
                }
            });
            // console.log(this.companyOrderZoneStyleAllSize);

            this.prepareData();
        });
    }

    prepareData() {
        this.dataTable.forEach( (item, index) => {
            let mainZoneYarn: MainZoneYarn[] = [];
            this.orderImagesSelect.forEach( (item2, index2) => {
                let dataTable1: any = {};
                const orderID1 = item2.orderID;
                const sizeStr = this.userService.getSizeStr(orderID1);
                // console.log(orderID1);
                let seq = 1;
                this.mainZone.forEach( (item2, index2) => {
                    const mainZoneYarn1: MainZoneYarn = {
                        seq: seq,
                        seqCut: 1,
                        lineMode: '',
                        orderID: orderID1,
                        color: item.color,
                        sizeStr: sizeStr,
                        targetPlaceID: item2.targetPlaceID,
                        targetPlaceName: item2.targetPlaceName,
                        orderQty: 0,
                        pcWeight: 0.00,
                        totalWeight: 0.00,
                        orderQtyTotal: 0.00,
                        orderWeightTotal: 0.00,
                    }
                    mainZoneYarn.push(mainZoneYarn1);
                    seq++;
                });
                item.mainZoneYarn = mainZoneYarn;
            });
        });



        // ## adjust this.dataTable
        this.dTMainZoneYarn = [];
        this.dataTable.forEach( (item, index) => {
            let dTMainZoneYarn1: DTMainZoneYarn = item;
            dTMainZoneYarn1.lineMode = '';
            this.dTMainZoneYarn.push(dTMainZoneYarn1);
        });

        // ## update total qty
        this.dataTable.forEach( (item, index) => {
            const productColor = item.color.colorID;
            item.mainZoneYarn.forEach( (item2: any, index2: number) => {
                const idx = this.companyOrderZoneStyleAllSize.findIndex( fi =>(
                    fi.orderID === item2.orderID
                    && fi.targetPlaceID === item2.targetPlaceID
                    && fi.productColor === productColor
                ));
                if (idx >= 0) {
                    item2.orderQty = this.companyOrderZoneStyleAllSize[idx].sumQty;
                }
            });
        });

        // console.log(this.dataTable);
        // console.log(this.dTMainZoneYarn);

        this.yarnStatCal = [...this.dataTable];
        this.yarnStatCal.forEach( (item, index) => {
            item.mainZoneYarn = [...item.mainZoneYarn.filter(i=>i.orderQty > 0)];
        });
        // console.log(this.yarnStatCal);

        this.yarnStatCal.forEach( (item, index) => {
            item.mainZoneYarn.sort((a,b)=>{
                return a.orderID >b.orderID?1:a.orderID <b.orderID?-1:0
                    || a.seq >b.seq?1:a.seq <b.seq?-1:0
            });
        });
        // console.log(this.yarnStatCal);

        this.yarnStatCal.forEach( (item, index) => {
            let orderIDOld = '';
            let MainZoneYarnX: MainZoneYarn[] = [];
            let mainZoneYarn0: MainZoneYarn = GBC.clrMainZoneYarn();
            item.mainZoneYarn.forEach( (item2, index2) => {
                // console.log(item2.orderID, index2);
                // item2.color.colorComboID = 'xxxxx'
                // item2.color.colorComboName = 'yyyyy'
                if (index2===0) {
                    MainZoneYarnX.push(item2);
                } else {
                    // console.log(item2.orderID, orderIDOld);
                    if (item2.orderID === orderIDOld) {
                        MainZoneYarnX.push(item2);
                    } else {
                        // console.log(item2.orderID, orderIDOld);
                        // mainZoneYarn0.seq = item2.seq+0.5;
                        mainZoneYarn0.color = item2.color;
                        mainZoneYarn0.orderID = item2.orderID;
                        MainZoneYarnX.push({...mainZoneYarn0});
                        MainZoneYarnX.push(item2);
                    }
                }
                orderIDOld = item2.orderID;
            });
            item.mainZoneYarn = [...MainZoneYarnX];
        });

        this.yarnStatCal.forEach( (item, index) => {
            item.mainZoneYarn.sort((a,b)=>{
                return a.orderID >b.orderID?1:a.orderID <b.orderID?-1:0
                    || a.seq >b.seq?1:a.seq <b.seq?-1:0
            });
        });
        // console.log(this.yarnStatCal);

        if (this.yarnStatCalOld.length > 0) {
            this.yarnStatCalOld.forEach( (item, index) => {
                item.mainZoneYarn.forEach( (item2, index2) => {
                    const orderID = item2.orderID;
                    const colorID = item2.color.colorID;
                    const targetPlaceID = item2.targetPlaceID;
                    const seq = item2.seq;
                    const seqCut = item2.seqCut;
                    const pcWeight = item2.pcWeight;

                    // if (pcWeight > 0) { console.log(orderID, targetPlaceID, pcWeight); }

                    const yarnStatCalF1 = this.yarnStatCal.filter(i=>i.color.colorID === colorID);
                    if (yarnStatCalF1.length > 0 && seq > 0) {

                        const mainZoneYarn1 = yarnStatCalF1[0].mainZoneYarn;
                        // console.log(mainZoneYarn1);
                        let mainZoneYarn1F = mainZoneYarn1.filter(i=>
                            i.orderID == orderID &&
                            i.targetPlaceID == targetPlaceID
                        );
                        if (mainZoneYarn1F.length) {
                            // console.log(orderID, targetPlaceID, pcWeight);
                            mainZoneYarn1F[0].seqCut = seqCut;
                            mainZoneYarn1F[0].pcWeight = pcWeight;
                        }
                    }
                });
            });
            this.reCalculateYarnStat('nosave');
        }

        // console.log(this.yarnStatCal);
        this.loading = false;
    }

    // ## mode1 = save , nosave
    saveAndRefreshData(mode1: string) {
        // console.log(this.yarnStatCal);
        this.reCalculateYarnStat(mode1);
    }

    reCalculateYarnStat(mode1: string) {
        // this.packageInfo.yarnPlanWeightTotal =
        // +this.packageInfo.yarnBoxInfo.reduce((prev, cur) => {return prev + cur.yarnPlanWeight;}, 0).toFixed(2);



        this.yarnStatCal.forEach( (item, index) => {
            item.mainZoneYarn.forEach( (item2, index2) => {
                item2.totalWeight = +(item2.orderQty * item2.pcWeight).toFixed(2);
            });
        });
        // console.log(this.yarnStatCal);
        if (mode1 ==='save') {
            this.saveYarnStat();
        }
    }

    exportPDF() {
        // console.log('exportPDF()');
        // ## prerpate PDF data
        // const yarnStatCal1 = [...this.yarnStatCal.map(obj => ({...obj}))]; // copy array object
        // const yarnStatCal1 = Object.assign([], this.yarnStatCal);
        const yarnStatCal1: YarnStatCal[] = [...Object.assign([], this.yarnStatCal)];

        this.yarnStatCalPDF = []; // ## b=blank d=data t=total tan=totalActualNet s=shortage

        yarnStatCal1.forEach( (item1, index1) => {
            let yarnStatCalPDF1: YarnStatCal = GBC.clrYarnStatCal();
            yarnStatCalPDF1.color = item1.color;
            yarnStatCalPDF1.mainZoneYarn = item1.mainZoneYarn;
            yarnStatCalPDF1.mainZoneYarn.forEach( (item2, index2) => {
                if (item2.seq === 0) {
                    item2.lineMode = 'b'; // ## blank row
                } else {
                    item2.lineMode = 'd'; // ## data row
                }
            });

            let mainZoneYarn1: MainZoneYarn = GBC.clrMainZoneYarn();  // ## total line
            const total1 = +this.findTotalReceive(item1.color, 'orderqty');
            const totalNec1 = +this.findTotalReceive(item1.color, 'neccesary');
            mainZoneYarn1.orderQtyTotal = total1;
            mainZoneYarn1.orderWeightTotal = totalNec1;
            mainZoneYarn1.lineMode = 't'; // ## total row

            let mainZoneYarn2: MainZoneYarn = GBC.clrMainZoneYarn();  // ## totalActualNet line
            const totalActNet1 = +this.findTotalReceive(item1.color, 'receive');
            mainZoneYarn2.orderWeightTotal = totalActNet1;
            mainZoneYarn2.lineMode = 'tan'; // ## totalActualNet row

            let mainZoneYarn3: MainZoneYarn = GBC.clrMainZoneYarn();  // ## shortage line
            const totalPercent1 = this.findTotalReceive(item1.color, 'percent');
            const totalShorttage1 = +this.findTotalReceive(item1.color, 'shortage');
            mainZoneYarn3.targetPlaceName = '( '+totalPercent1+'% )';
            mainZoneYarn3.orderWeightTotal = totalShorttage1;
            mainZoneYarn3.lineMode = 's'; // ## shortage row

            const mainZoneYarnLen = yarnStatCalPDF1.mainZoneYarn.length;
            yarnStatCalPDF1.mainZoneYarn[mainZoneYarnLen] = mainZoneYarn1;
            yarnStatCalPDF1.mainZoneYarn[mainZoneYarnLen+1] = mainZoneYarn2;
            yarnStatCalPDF1.mainZoneYarn[mainZoneYarnLen+2] = mainZoneYarn3;

            this.yarnStatCalPDF.push(yarnStatCalPDF1);

        });
        // console.log(this.yarnStatCalPDF);
        this.createYarnUsagePDF(this.yarnStatCalPDF);
        // console.log(this.yarnStatCal);
    }

    // ## createYarnUsagePDF  YarnUsage #########################################################################################
    createYarnUsagePDF(yarnStatCalPDF: YarnStatCal[]) {
        const docDefinition = this.yarnService.createYarnUsagePDF(this.yarnPlan.yarnID, yarnStatCalPDF);
        // console.log(docDefinition);
        // console.log('createYarnAllReceivePDF.....');
        pdfMake.createPdf(docDefinition).open();
    }

    saveYarnStat() {
        const companyID = this.company.companyID;
        const yarnSeason = this.yarnSeason;
        const yarnID = this.yarnPlan.yarnID;
        const uuid = this.yarnPlan.uuid;

        // putYarnPlanStat(companyID: string, yarnID: string, uuid: string, yarnSeason: string,
        //     yarnStatCal: YarnStatCal[])
        this.yarnService.putYarnPlanStat(companyID, yarnID, uuid, yarnSeason, this.yarnStatCal);
        if (this.yarnPlanStattSub) { this.yarnPlanStattSub.unsubscribe(); }
        this.yarnPlanStattSub = this.yarnService.getYarnPlanStatListener().subscribe((data) => {
            // console.log(data);
        });
    }



    // ## mode = 'receive , orderqty , neccesary, shortage' , 'percent'
    findTotalReceive(color: Color, mode: string) {
        // console.log(color, mode);
        let totalReceive = 0;
        let totalOrderQty = 0;
        let totalNeccesary = 0;
        let totalShortage = 0;
        let percent = 0;
        let result = 0;
        // console.log(typeof(this.yarnStatCal));
        const yarnStatCal1: YarnStatCal[] = [...this.yarnStatCal.map(obj => ({...obj}))];
        // yarnStatCal1 = [];
        // this.yarnStatCal.forEach( (item, index) => {
        //     yarnStatCal1.push(Object.assign({}, item));
        // });
        //  = this.yarnStatCal.map(obj => ({...obj}));
        // console.log(typeof(yarnStatCal1), yarnStatCal1);
        // [...this.yarnStatCal];
        // this.yarnDataInfoOld = this.yarnDataInfo.map(obj => ({...obj}));
        // this.yarnPlanOld = Object.assign({}, this.yarnPlan);

        if (mode === 'receive') {
            const colorSx1 = this.colorSx.filter(i=>i.color.colorID == color.colorID);
            if (colorSx1.length>0) {
                totalReceive =  colorSx1[0].totalReceive;
                result = totalReceive;
            }
        } else if (mode === 'orderqty') {
        // if (mode === 'orderqty') {
            const yarnStatCalF = yarnStatCal1.filter(i=>i.color.colorID == color.colorID);
            if (yarnStatCalF.length > 0) {
                const mainZoneYarnF = [...yarnStatCalF[0].mainZoneYarn];
                totalOrderQty = +(mainZoneYarnF.reduce((prev, cur) => {return prev + (cur.orderQty*100);}, 0) / 100).toFixed(2);
                result = totalOrderQty;
            }
        } else if (mode === 'neccesary') {
            const yarnStatCalF = yarnStatCal1.filter(i=>i.color.colorID == color.colorID);
            if (yarnStatCalF.length > 0) {
                const mainZoneYarnF = [...yarnStatCalF[0].mainZoneYarn];
                totalNeccesary = +(mainZoneYarnF.reduce((prev, cur) => {return prev + (cur.totalWeight*100);}, 0) / 100).toFixed(2);
                result = totalNeccesary;
            }
        } else if (mode === 'shortage' || mode === 'percent') {

            const colorSx1 = this.colorSx.filter(i=>i.color.colorID == color.colorID);
            if (colorSx1.length>0) {
                totalReceive =  colorSx1[0].totalReceive;
            }

            const yarnStatCalF = yarnStatCal1.filter(i=>i.color.colorID == color.colorID);
            if (yarnStatCalF.length > 0) {
                const mainZoneYarnF = [...yarnStatCalF[0].mainZoneYarn];
                totalNeccesary = +(mainZoneYarnF.reduce((prev, cur) => {return prev + (cur.totalWeight*100);}, 0) / 100).toFixed(2);
            }
            totalShortage = +(+totalReceive - +totalNeccesary).toFixed(2);
            percent = +((+totalReceive / +totalNeccesary) * 100).toFixed(2);
            if (mode === 'shortage') {
                result = totalShortage;
            } else if (mode === 'percent') {
                result = percent;
            }

        } else {
            result = 0;
        }

        return result.toFixed(2);
    }




    closePage() {
        this.closeYarnStat.emit('close page');
    }

    ngOnDestroy(): void {
        if (this.yarnStatDataSub) { this.yarnStatDataSub.unsubscribe(); }
        if (this.yarnPlanStattSub) { this.yarnPlanStattSub.unsubscribe(); }

    }
}
