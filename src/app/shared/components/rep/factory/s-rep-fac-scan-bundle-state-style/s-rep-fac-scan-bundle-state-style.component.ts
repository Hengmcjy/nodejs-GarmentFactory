import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { DialogService } from 'primeng/dynamicdialog';
import { Subscription } from 'rxjs';

import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';


import { NodeStationService } from 'src/app/services/node-station.service';
import { OrderService } from 'src/app/services/order.service';
import { ReportService } from 'src/app/services/report.service';
import { UserService } from 'src/app/services/user.service';
import { Company, Factory, TargetPlaceS } from 'src/app/models/app.model';
import { GBC } from 'src/app/global/const-global';
import { Product } from 'src/app/models/product.model';
import { SSelectProductComponent } from '../../../general/s-select-product/s-select-product.component';
import { CurrentProductionBundleState } from 'src/app/models/report.model';
import { BundleStatePDF, NodeGroupScanID2 } from 'src/app/models/reportpdf.model';
import { MainZone } from 'src/app/models/order.model';
import { BundleStateBoard, BundleStateTargetPlaceBoard } from 'src/app/models/infoBroard.model';


(pdfMake as any).vfs = pdfFonts.pdfMake.vfs;

@Component({
  selector: 'app-s-rep-fac-scan-bundle-state-style',
  templateUrl: './s-rep-fac-scan-bundle-state-style.component.html',
  styleUrls: ['./s-rep-fac-scan-bundle-state-style.component.scss'],
  providers: [DialogService],
})
export class SRepFacScanBundleStateStyleComponent implements OnInit, OnDestroy {
    @Input() callFrom: string = ''; // ## nodeID
    @Input() repMode: string = ''; // ##

    formName = 'rep-fac-scan-bundle-state-style';
    headerPage = 'Bundle state report [style]';

    company: Company = GBC.clrCompany();
    factories: Factory[] = [];
    factory: Factory = GBC.clrFactory();
    targetPlaces: TargetPlaceS[] = [];
    mainZone: MainZone[] = [];

    blockedPanel: boolean = false;
    product: Product = GBC.clrProduct();
    orderID = ''; // ##

    currentProductionBundleState: CurrentProductionBundleState[] = [];
    bundleStatePDF: BundleStatePDF[] = [];
    bundleStatePDFCompleted: BundleStatePDF[] = [];
    bundleStatePDFNotCompleted: BundleStatePDF[] = [];
    bundleStatePDFGroup: any[] = [];
    bundleStatePDFCompletedGroup: any[] = [];
    bundleStatePDFNotCompletedGroup: any[] = [];

    BundleStateBoard: BundleStateBoard = GBC.clrBundleStateBoard();  // ## all
    BundleStateBoardCompleted: BundleStateBoard = GBC.clrBundleStateBoard();  // ## Completed
    BundleStateBoardNotCompleted: BundleStateBoard = GBC.clrBundleStateBoard();  // ## not Completed

    private repCurrentProductionBundleStateSub: Subscription = new Subscription;
    // private nodeFlowSub: Subscription = new Subscription;
    // private ordersByOrderIDsSub: Subscription = new Subscription;
    // private dataAroundAppSub: Subscription = new Subscription;

    // arr1 = ['','',''];

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
        // console.log('Zone', this.mainZone);
    }

    getRepCurrentProductionBundleState() {
        // this.clearData();
        this.blockedPanel = true;
        const productStatus = ['normal', 'problem', 'repaired', 'complete']; // normal , problem, complete
        const orderStatus = ['open'];
        const orderIDArr = [this.orderID];
        // const date12 = this.date12;
        // const userGroupScan1: UserGroupScan = this.userGroupScan1;
        this.currentProductionBundleState = [];
        this.bundleStatePDF = [];
        this.bundleStatePDFCompleted = [];
        this.bundleStatePDFNotCompleted = [];
        this.repService.getRepCurrentProductionBundleState(this.company.companyID, productStatus, orderStatus, orderIDArr);
        if (this.repCurrentProductionBundleStateSub) { this.repCurrentProductionBundleStateSub.unsubscribe(); }
        this.repCurrentProductionBundleStateSub = this.repService.getRepCurrentProductionsBundleStateCUpdatedListener().subscribe((data) => {
            // console.log(data);
            this.blockedPanel = false;
            this.currentProductionBundleState = data.currentProductionBundleState;
            this.bundleStatePDF = data.bundleStatePDF;
            // this.currentProductionZonePeriod = data.currentProductionZonePeriod;
            // this.currentProductionZoneForLoss = data.currentProductionZoneForLoss;
            // this.orderStyleColorSize = data.orderStyleColorSize;
            if ( this.bundleStatePDF.length > 0) {
                this.prepareGetRepCurrentProductionBundleState();
            }

            // console.log(this.currentProductionBundleState);
        });
    }

    prepareGetRepCurrentProductionBundleState() {
        // console.log(this.userService.userGroupScan);
        this.bundleStatePDF.forEach( (item, index) => {
            item.size = this.userService.strReplaceAll(item.size, '-', '');
            item.color = this.userService.strReplaceAll(item.color, '-', '');
        });
        this.bundleStatePDF.forEach( (item, index) => {
            item.targetPlaceSeq = this.userService.getTargetPlaceSeq1(item.targetPlaceID);
            item.sizeSeq = this.userService.getSizeSeq(item.size);
            item.colorName = this.userService.getColorNameByColorID1(item.color);
            item.colorSeq = this.userService.getColorSeqByOrderID(this.orderID, item.color);
            // item.groupScanID2 = this.userService.getGroupScanID2(item.userID);
            item.groupNamePDF = item.orderID+':'+item.targetPlaceID+':'+item.color;
            item.completed = this.checkBundleCompleted(item.nodeGroupScanID2);
        });
        this.bundleStatePDF.sort((a,b)=>{
            return a.targetPlaceSeq >b.targetPlaceSeq?1:a.targetPlaceSeq <b.targetPlaceSeq?-1:0
            || a.colorSeq >b.colorSeq?1:a.colorSeq <b.colorSeq?-1:0
            || a.sizeSeq >b.sizeSeq?1:a.sizeSeq <b.sizeSeq?-1:0
            || a.bundleNo >b.bundleNo?1:a.bundleNo <b.bundleNo?-1:0
            // || a.fromNode >b.fromNode?1:a.fromNode <b.fromNode?-1:0
        });
        // console.log(this.bundleStatePDF);

        this.bundleStatePDFCompleted = [];
        this.bundleStatePDFNotCompleted = [];

        this.bundleStatePDFGroup = [];
        this.bundleStatePDFCompletedGroup = [];
        this.bundleStatePDFNotCompletedGroup = [];


        const bundleStatePDFCompleted = [...this.bundleStatePDF];
        this.bundleStatePDFCompleted = bundleStatePDFCompleted.filter(c => c.completed===true);
        // console.log(this.bundleStatePDFCompleted);

        const bundleStatePDFNotCompleted = [...this.bundleStatePDF];
        this.bundleStatePDFNotCompleted  = bundleStatePDFNotCompleted.filter(c => c.completed===false);
        // console.log(this.bundleStatePDFNotCompleted);

        this.bundleStatePDFGroup = this.userService.groupBy(this.bundleStatePDF, (c: any) => c.groupNamePDF);
        this.bundleStatePDFGroup = Object.values(this.bundleStatePDFGroup);
        // console.log(this.bundleStatePDFGroup);

        this.bundleStatePDFCompletedGroup = this.userService.groupBy(this.bundleStatePDFCompleted, (c: any) => c.groupNamePDF);
        this.bundleStatePDFCompletedGroup = Object.values(this.bundleStatePDFCompletedGroup);
        // console.log(this.bundleStatePDFCompletedGroup);

        this.bundleStatePDFNotCompletedGroup = this.userService.groupBy(this.bundleStatePDFNotCompleted, (c: any) => c.groupNamePDF);
        this.bundleStatePDFNotCompletedGroup = Object.values(this.bundleStatePDFNotCompletedGroup);
        // console.log(this.bundleStatePDFNotCompletedGroup);

        this.prepareDataBundleBoard(); // ## prepate data for bundle state board

    }

    bundleStatePDFPrint(mode: string) {
        let bundleStatePDFGroup: any[] = [];
        let repID = 'bundle-state-rep09';
        if (mode === 'all') {
            bundleStatePDFGroup = [...this.bundleStatePDFGroup];
            repID = 'bundle-state-rep09';
        } else if (mode === 'Completed') {
            bundleStatePDFGroup = [...this.bundleStatePDFCompletedGroup];
            repID = 'bundle-state-rep10';
        } else if (mode === 'notCompleted') {
            bundleStatePDFGroup = [...this.bundleStatePDFNotCompletedGroup];
            repID = 'bundle-state-rep11';
        }
        // const date12 = this.date1 + ' - ' + this.date2;
        // const groupScanID = this.userGroupScan1.groupScanID;
        let dataPrint: any = {
            repID: repID,
            date12: '',
            groupScanID: '', // ## *, tailin, tai-an, sd, sd2
            orderID: this.orderID,

        };
        const docDefinition = this.orderService.productionBundleStatePDF(bundleStatePDFGroup, dataPrint);
        pdfMake.createPdf(docDefinition).open();
    }

    checkBundleCompleted(nodeGroupScanID2: NodeGroupScanID2[]) {
        const nodeCompleted = '7.QC';  // 7.QC  ,  completeNode
        const status = 'done';  // ## finish all in bundle
        const nodeGroupScanID2F = nodeGroupScanID2.filter(c => c.nodeID===nodeCompleted && c.status===status);
        if (nodeGroupScanID2F.length > 0) { return true; }
        return false;;
    }

    prepareDataBundleBoard() {
        this.BundleStateBoard = GBC.clrBundleStateBoard();  // ## all
        this.BundleStateBoardCompleted = GBC.clrBundleStateBoard();  // ## Completed
        this.BundleStateBoardNotCompleted = GBC.clrBundleStateBoard();  // ## not Completed

        // ## all  this.bundleStatePDF
        const qtyAll1 = this.bundleStatePDF.reduce((prev, cur) => {return prev + cur.productCount;}, 0);
        const bundleAllCount1 = this.bundleStatePDF.length;
        this.BundleStateBoard.companyID = this.company.companyID;
        this.BundleStateBoard.orderID = this.orderID;
        this.BundleStateBoard.bundleAllCount = bundleAllCount1;
        this.BundleStateBoard.qtyAll =qtyAll1;
        this.BundleStateBoard.bundleStateTargetPlaceBoard = [];
        this.mainZone.forEach( (item, index) => {
            const bundleStatePDF1 = [...this.bundleStatePDF];
            const bundleStatePDF1F = bundleStatePDF1.filter(i=>i.targetPlaceID == item.targetPlaceID);
            const bundleCount = bundleStatePDF1F.length;
            const qty = bundleStatePDF1F.reduce((prev, cur) => {return prev + cur.productCount;}, 0);
            const bundleStateTargetPlaceBoard1: BundleStateTargetPlaceBoard = {
                targetPlaceID: item.targetPlaceID,
                targetPlaceName: item.targetPlaceName,
                targetPlaceSeq: 0,
                bundleCount: bundleCount,
                qty: qty,
            };
            this.BundleStateBoard.bundleStateTargetPlaceBoard.push(bundleStateTargetPlaceBoard1);
        });

        // ## Completed  this.bundleStatePDFCompleted
        const qtyAll2 = this.bundleStatePDFCompleted.reduce((prev, cur) => {return prev + cur.productCount;}, 0);
        const bundleAllCount2 = this.bundleStatePDFCompleted.length;
        this.BundleStateBoardCompleted.companyID = this.company.companyID;
        this.BundleStateBoardCompleted.orderID = this.orderID;
        this.BundleStateBoardCompleted.bundleAllCount = bundleAllCount2;
        this.BundleStateBoardCompleted.qtyAll = qtyAll2;
        this.BundleStateBoardCompleted.bundleStateTargetPlaceBoard = [];
        this.mainZone.forEach( (item, index) => {
            const bundleStatePDF1 = [...this.bundleStatePDFCompleted];
            const bundleStatePDF1F = bundleStatePDF1.filter(i=>i.targetPlaceID == item.targetPlaceID);
            const bundleCount = bundleStatePDF1F.length;
            const qty = bundleStatePDF1F.reduce((prev, cur) => {return prev + cur.productCount;}, 0);
            const bundleStateTargetPlaceBoard1: BundleStateTargetPlaceBoard = {
                targetPlaceID: item.targetPlaceID,
                targetPlaceName: item.targetPlaceName,
                targetPlaceSeq: 0,
                bundleCount: bundleCount,
                qty: qty,
            };
            this.BundleStateBoardCompleted.bundleStateTargetPlaceBoard.push(bundleStateTargetPlaceBoard1);
        });


        // ## not Completed  this.bundleStatePDFNotCompleted
        const qtyAll3 = this.bundleStatePDFNotCompleted.reduce((prev, cur) => {return prev + cur.productCount;}, 0);
        const bundleAllCount3 = this.bundleStatePDFNotCompleted.length;
        this.BundleStateBoardNotCompleted.companyID = this.company.companyID;
        this.BundleStateBoardNotCompleted.orderID = this.orderID;
        this.BundleStateBoardNotCompleted.bundleAllCount = bundleAllCount3;
        this.BundleStateBoardNotCompleted.qtyAll = qtyAll3;
        this.BundleStateBoardNotCompleted.bundleStateTargetPlaceBoard = [];
        this.mainZone.forEach( (item, index) => {
            const bundleStatePDF1 = [...this.bundleStatePDFNotCompleted];
            const bundleStatePDF1F = bundleStatePDF1.filter(i=>i.targetPlaceID == item.targetPlaceID);
            const bundleCount = bundleStatePDF1F.length;
            const qty = bundleStatePDF1F.reduce((prev, cur) => {return prev + cur.productCount;}, 0);
            const bundleStateTargetPlaceBoard1: BundleStateTargetPlaceBoard = {
                targetPlaceID: item.targetPlaceID,
                targetPlaceName: item.targetPlaceName,
                targetPlaceSeq: 0,
                bundleCount: bundleCount,
                qty: qty,
            };
            this.BundleStateBoardNotCompleted.bundleStateTargetPlaceBoard.push(bundleStateTargetPlaceBoard1);
        });

        // console.log(this.BundleStateBoard);
        // console.log(this.BundleStateBoardCompleted);
        // console.log(this.BundleStateBoardNotCompleted);

    }

    clearData() {
        this.orderID = '';
        this.product = GBC.clrProduct();

        this.currentProductionBundleState = [];

        this.bundleStatePDF = [];
        this.bundleStatePDFCompleted = [];
        this.bundleStatePDFNotCompleted = [];

        this.bundleStatePDFGroup = [];
        this.bundleStatePDFCompletedGroup = [];
        this.bundleStatePDFNotCompletedGroup = [];

        this.BundleStateBoard = GBC.clrBundleStateBoard();  // ## all
        this.BundleStateBoardCompleted = GBC.clrBundleStateBoard();  // ## Completed
        this.BundleStateBoardNotCompleted = GBC.clrBundleStateBoard();  // ## not Completed
    }

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
