import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { Subscription } from 'rxjs';

import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';

import { GBC } from 'src/app/global/const-global';
import { ColorS, Company, Factory, SizeS, TargetPlaceS } from 'src/app/models/app.model';
import { MainZone } from 'src/app/models/order.model';
import { UserGroupScan } from 'src/app/models/user.model';
import { FlowSeq, NodeFlow, NodeStation } from 'src/app/models/workstation.model';
import { NodeStationService } from 'src/app/services/node-station.service';
import { OrderService } from 'src/app/services/order.service';
import { ReportService } from 'src/app/services/report.service';
import { UserService } from 'src/app/services/user.service';
import { SSelectProductComponent } from '../../../general/s-select-product/s-select-product.component';
import { DialogService } from 'primeng/dynamicdialog';
import { Product } from 'src/app/models/product.model';
import { CurrentProductionBundleState } from 'src/app/models/report.model';
import { BundleStatePDF, NodeGroupScanID2 } from 'src/app/models/reportpdf.model';

(pdfMake as any).vfs = pdfFonts.pdfMake.vfs;

@Component({
  selector: 'app-s-rep-fac-scan-bundle-state',
  templateUrl: './s-rep-fac-scan-bundle-state.component.html',
  styleUrls: ['./s-rep-fac-scan-bundle-state.component.scss'],
  providers: [DialogService],
})
export class SRepFacScanBundleStateComponent implements OnInit, OnDestroy {
    @Input() callFrom: string = ''; // ## nodeID
    @Input() repMode: string = ''; // ##

    formName = 'rep-fac-scan-bundle-state';
    headerPage = 'Bundle state report [factory user scan]';

    company: Company = GBC.clrCompany();
    factories: Factory[] = [];
    factory: Factory = GBC.clrFactory();
    nodeFlow: NodeFlow = GBC.clrNodeFlow();
    flowSeq: FlowSeq[] = [];
    nodeStations: NodeStation[] = [];
    targetPlaces: TargetPlaceS[] = [];
    mainZone: MainZone[] = [];
    sizes: SizeS[] = [];
    colors: ColorS[] = [];
    userGroupScan: UserGroupScan[] = [];
    userGroupScan1: UserGroupScan = GBC.clrUserGroupScan();
    items: MenuItem[] = [];

    readonlyInput = true;
    date12: Date[] = [];
    dateFormat = 'dd/mm/yy';
    date1 = '';
    date2 = '';
    dayDiff = -1; // ##  -1 not yet to select date / default

    product: Product = GBC.clrProduct();
    orderID = ''; // ##

    blockedPanel: boolean = false;
    seasonYear = '';

    currentProductionBundleState: CurrentProductionBundleState[] = [];

    bundleStatePDF: BundleStatePDF[] = [];
    bundleStatePDFGroup: any[] = [];

    private repCurrentProductionBundleStateSub: Subscription = new Subscription;
    // private nodeFlowSub: Subscription = new Subscription;
    // private ordersByOrderIDsSub: Subscription = new Subscription;
    // private dataAroundAppSub: Subscription = new Subscription;

    constructor(
        public dialogService: DialogService,

        public userService: UserService,
        private orderService: OrderService,
        public nsService: NodeStationService,
        private repService: ReportService
    ) {}

    ngOnInit(): void {
        // console.log('Zone');

        this.company = this.userService.getCompany();
        this.factories = this.userService.getFactories();
        this.factory = this.factories.length>0?this.factories[0]:GBC.clrFactory();
        this.targetPlaces = this.userService.targetPlaces;
        this.mainZone = this.userService.getMainZoneTargetPlace(this.targetPlaces);
        this.sizes = this.userService.sizes;
        this.colors = this.userService.colors;
        this.seasonYear = this.userService.seasonYear;

        this.userGroupScan = [...this.userService.userGroupScan];
        // let userGroupScanAll: UserGroupScan = GBC.clrUserGroupScan();
        // userGroupScanAll.companyID = this.company.companyID;
        // userGroupScanAll.groupScanID = '*';
        // this.userGroupScan.unshift(userGroupScanAll);

        this.addItemsMenuScanGroup();

        this.date12[0] = new Date();
        this.date12[1] = new Date();
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
    }

    clearData() {
        this.currentProductionBundleState = [];
        this.bundleStatePDF = [];
        this.bundleStatePDFGroup = [];
        // this.currentCompanyOrderZoneStyleSize = [];
        // this.currentProductionZoneForLoss = [];
        // this.currentProductionZonePeriod2 = [];
        // this.currentProductionZonePeriodGroup = [];
        // this.currentProductionZonePeriodGroupZone = [];
        // this.currentProductionZonePeriodGroup2 = [];
        // this.productionZonePeriod = [];
    }

    dateChange() {
        // console.log('dateChange');
        this.clearData();
    }

    selectDate() {
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

        this.getRepCurrentProductionBundleStateDate12();
    }

    getRepCurrentProductionBundleStateDate12() {
        this.clearData();
        this.blockedPanel = true;
        const productStatus = ['normal', 'problem', 'repaired', 'complete']; // normal , problem, complete
        const orderStatus = ['open'];
        const orderIDArr = [this.orderID];
        const date12 = this.date12;
        const userGroupScan1: UserGroupScan = this.userGroupScan1;
        this.currentProductionBundleState = [];
        this.repService.getRepCurrentProductionBundleStateDate12(this.company.companyID, productStatus, orderStatus, orderIDArr, date12, userGroupScan1);
        if (this.repCurrentProductionBundleStateSub) { this.repCurrentProductionBundleStateSub.unsubscribe(); }
        this.repCurrentProductionBundleStateSub = this.repService.getRepCurrentProductionsBundleStateCUpdatedListener().subscribe((data) => {
            // console.log(data);
            this.blockedPanel = false;
            this.currentProductionBundleState = data.currentProductionBundleState;
            // this.currentProductionZonePeriod = data.currentProductionZonePeriod;
            // this.currentProductionZoneForLoss = data.currentProductionZoneForLoss;
            // this.orderStyleColorSize = data.orderStyleColorSize;
            if ( this.currentProductionBundleState.length > 0) {
                this.prepareGetRepCurrentProductionBundleState();
            }

            // console.log(this.currentProductionBundleState);
        });
    }

    prepareGetRepCurrentProductionBundleState() {
        // console.log(this.userService.userGroupScan);
        this.currentProductionBundleState.forEach( (item, index) => {
            item.size = this.userService.strReplaceAll(item.size, '-', '');
            item.color = this.userService.strReplaceAll(item.color, '-', '');
        });
        this.currentProductionBundleState.forEach( (item, index) => {
            item.targetPlaceSeq = this.userService.getTargetPlaceSeq1(item.targetPlaceID);
            item.sizeSeq = this.userService.getSizeSeq(item.size);
            item.colorName = this.userService.getColorNameByColorID1(item.color);
            item.colorSeq = this.userService.getColorSeqByOrderID(this.orderID, item.color);
            item.groupScanID2 = this.userService.getGroupScanID2(item.userID);
        });
        this.currentProductionBundleState.sort((a,b)=>{
            return a.targetPlaceSeq >b.targetPlaceSeq?1:a.targetPlaceSeq <b.targetPlaceSeq?-1:0
            || a.colorSeq >b.colorSeq?1:a.colorSeq <b.colorSeq?-1:0
            || a.sizeSeq >b.sizeSeq?1:a.sizeSeq <b.sizeSeq?-1:0
            || a.bundleNo >b.bundleNo?1:a.bundleNo <b.bundleNo?-1:0
            || a.fromNode >b.fromNode?1:a.fromNode <b.fromNode?-1:0
        });
        // console.log(this.currentProductionBundleState);

        this.prepareDataBundleStatePDF();

    }

    prepareDataBundleStatePDF() {
        // console.log(this.currentProductionBundleState);
        this.bundleStatePDF = [];

        const companyID = this.company.companyID;
        // const orderID = this.orderID
        this.currentProductionBundleState.forEach( (item, index) => {
            // const bundleStatePDFF = [...this.bundleStatePDF];
            let bundleStateF = this.bundleStatePDF.filter(i=>
                i.orderID == item.orderID
                && i.bundleNo == item.bundleNo
            );
            // if (index < 6) {console.log(item, bundleStateF, [...this.bundleStatePDF]);}
            if (bundleStateF.length === 0) {
                let bundleStatePDF1: BundleStatePDF = GBC.clrBundleStatePDF();
                bundleStatePDF1.companyID = companyID;
                bundleStatePDF1.orderID = item.orderID;
                bundleStatePDF1.targetPlaceID = item.targetPlaceID;
                bundleStatePDF1.targetPlaceName = item.targetPlaceName;
                bundleStatePDF1.targetPlaceSeq = item.targetPlaceSeq;
                bundleStatePDF1.color = item.color;
                bundleStatePDF1.colorName = item.colorName;
                bundleStatePDF1.bundleNo = item.bundleNo;
                bundleStatePDF1.size = item.size;
                bundleStatePDF1.sizeSeq = item.sizeSeq;
                bundleStatePDF1.productCount = item.productCount;
                bundleStatePDF1.groupScanID2 = item.groupScanID2;
                bundleStatePDF1.groupNamePDF = item.orderID+':'+item.targetPlaceID+':'+item.color;


                let nodeGroupScanID2_1: NodeGroupScanID2 = GBC.clrNodeGroupScanID2();
                nodeGroupScanID2_1.nodeID = item.fromNode;
                nodeGroupScanID2_1.sumProductQty = item.sumProductQty;
                nodeGroupScanID2_1.userID = item.userID;
                nodeGroupScanID2_1.groupScanID2 = item.groupScanID2;
                nodeGroupScanID2_1.status = item.productCount===item.sumProductQty?'done':'-'; // ## done= finished of this node,  '-'= not finished yet
                bundleStatePDF1.nodeGroupScanID2 = [nodeGroupScanID2_1];

                this.bundleStatePDF.push(bundleStatePDF1);
            } else { // ## bundleState1.length > 0
                let nodeGroupScanID2_1: NodeGroupScanID2 = GBC.clrNodeGroupScanID2();
                nodeGroupScanID2_1.nodeID = item.fromNode;
                nodeGroupScanID2_1.sumProductQty = item.sumProductQty;
                nodeGroupScanID2_1.userID = item.userID;
                nodeGroupScanID2_1.groupScanID2 = item.groupScanID2;
                nodeGroupScanID2_1.status = item.productCount===item.sumProductQty?'done':'-'; // ## done= finished of this node,  '-'= not finished yet
                bundleStateF[0].nodeGroupScanID2.push(nodeGroupScanID2_1);
            }
        });
        // console.log(this.bundleStatePDF);

        this.bundleStatePDFGroup = this.userService.groupBy(this.bundleStatePDF, (c: any) => c.groupNamePDF);
        this.bundleStatePDFGroup = Object.values(this.bundleStatePDFGroup);
        // console.log(this.bundleStatePDFGroup);

    }

    bundleStatePDFPrint() {
        const date12 = this.date1 + ' - ' + this.date2;
        const groupScanID = this.userGroupScan1.groupScanID;
        let dataPrint: any = {
            repID: 'bundle-state-rep08',
            date12: date12,
            groupScanID: groupScanID, // ## *, tailin, tai-an, sd, sd2
            orderID: this.orderID,

        };
        const docDefinition = this.orderService.productionBundleStatePDF(this.bundleStatePDFGroup, dataPrint);
        pdfMake.createPdf(docDefinition).open();
    }

    // export class BundleStatePDF {
    //     constructor(
    //         public companyID: string,
    //         public orderID: string,
    //         public targetPlaceID: string,
    //         public targetPlaceName: string,
    //         public targetPlaceSeq: number,
    //         public color: string,
    //         public colorName: string,
    //         public colorSeq: number,
    //         public bundleNo: number,
    //         public size: string,
    //         public sizeSeq: number,
    //         public nodeGroupScanID2: NodeGroupScanID2[],
    //         public productCount: number,
    //     ) {}
    // }

    // export class NodeGroupScanID2 {
    //     constructor(
    //         public nodeID: string, // ## 1.COMPUTER-KNITTING 2.PANAL-INSPECTION 3.LINKING 4.MENDING 5.WASHING 6.PRESSING 7.QC
    //         public sumProductQty: number,
    //         public userID: string,  // ## userID scan / who scan
    //         public groupScanID2: string, // ## TN TL SD S2 S2=boda
    //         public status: string,  // ## done= finished of this node,  '-'= not finished yet
    //     ) {}
    // }


    showProductSelectionModal() {
        this.clearData();
        const ref = this.dialogService.open(SSelectProductComponent, {
            data: {
                id: 'productsSelection',
                company: this.userService?.getCompany(),
                callfrom: this.formName,  // ## send to nodejs for choose buckets
                btnCaption: 'choose'

            },
            header: 'Product Selection',
            width: '80%',
        });

        ref.onClose.subscribe((product: Product) => {
            if (product) {
                this.orderID = product.productID.trim();
                // console.log(this.orderID);
                this.product = product;
                // this.style = this.product.productCustomerCode.toUpperCase();
                // this.style = this.order.orderID;
                // this.style = this.userService.setAddBackStrLen(this.style, this.userService.styleLen, ' ');
                // this.userService.setOrderProductSelect(product)
            }

        });

    }

    ngOnDestroy(): void {
        if (this.repCurrentProductionBundleStateSub) { this.repCurrentProductionBundleStateSub.unsubscribe(); }
        // if (this.nodeFlowSub) { this.nodeFlowSub.unsubscribe(); }
        // if (this.dataAroundAppSub) { this.dataAroundAppSub.unsubscribe(); }

        // if (this.langSub) { this.langSub.unsubscribe(); }
    }
}
