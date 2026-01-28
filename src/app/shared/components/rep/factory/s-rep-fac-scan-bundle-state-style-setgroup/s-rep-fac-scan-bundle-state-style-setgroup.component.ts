import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { DialogService } from 'primeng/dynamicdialog';
import { Subscription } from 'rxjs';

import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';


import { NodeStationService } from 'src/app/services/node-station.service';
import { OrderService } from 'src/app/services/order.service';
import { ReportService } from 'src/app/services/report.service';
import { UserService } from 'src/app/services/user.service';
import { ColorS, Company, Factory, TargetPlaceS } from 'src/app/models/app.model';
import { GBC } from 'src/app/global/const-global';
import { Product } from 'src/app/models/product.model';
import { SSelectProductComponent } from '../../../general/s-select-product/s-select-product.component';
import { BundleSetGroup, MainZone, Order } from 'src/app/models/order.model';
import { SmdNewBundleSetgroupComponent } from '../../company/smd-new-bundle-setgroup/smd-new-bundle-setgroup.component';
import { SmdSelectColorComponent } from '../../../general/smd-select-color/smd-select-color.component';
import { ConfirmationService } from 'primeng/api';
import { CurrentProductionBundleState } from 'src/app/models/report.model';
import { BundleStatePDF, NodeGroupScanID2 } from 'src/app/models/reportpdf.model';
import { BundleStateBoard, BundleStateTargetPlaceBoard } from 'src/app/models/infoBroard.model';
import { SmdRepFacScanBundleStateStyleSetgroupComponent } from '../smd-rep-fac-scan-bundle-state-style-setgroup/smd-rep-fac-scan-bundle-state-style-setgroup.component';



(pdfMake as any).vfs = pdfFonts.pdfMake.vfs;

@Component({
  selector: 'app-s-rep-fac-scan-bundle-state-style-setgroup',
  templateUrl: './s-rep-fac-scan-bundle-state-style-setgroup.component.html',
  styleUrls: ['./s-rep-fac-scan-bundle-state-style-setgroup.component.scss'],
  providers: [DialogService, ConfirmationService],
})
export class SRepFacScanBundleStateStyleSetgroupComponent implements OnInit, OnDestroy {
    @Input() callFrom: string = ''; // ## nodeID
    @Input() repMode: string = ''; // ##

    formName = 'rep-fac-scan-bundle-state-style-setgroup';
    headerPage = 'Bundle state report [style set group]';

    company: Company = GBC.clrCompany();
    factories: Factory[] = [];
    factory: Factory = GBC.clrFactory();
    targetPlaces: TargetPlaceS[] = [];
    mainZone: MainZone[] = [];
    seasonYear = '';


    bundleSetGroups: BundleSetGroup[] = [];
    product: Product = GBC.clrProduct();
    orderID = ''; // ##
    order: Order = GBC.clrOrder();
    colorS: ColorS[] = [];
    colorSSelect: ColorS = GBC.clrOrderColor();
    // colorCode1 = '#CDC4AA';


    dataFecthing = false; // ## will doing get data from server

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

    private bundleSetGroupListSub: Subscription = new Subscription;
    private repCurrentProductionBundleStateSub: Subscription = new Subscription;
    // private ordersByOrderIDsSub: Subscription = new Subscription;
    // private dataAroundAppSub: Subscription = new Subscription;

    arr1 = ['','','','','','','','','','','','','','',''];

    constructor(
        public dialogService: DialogService,
        private confirmationService: ConfirmationService,

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
        this.seasonYear = this.userService.seasonYear; // ## 2024AW

        this.getBundleSetGroupListener();
    }

    getRepCurrentProductionBundleStateNo(bundleSetGroup: BundleSetGroup) {
        this.dataFecthing = true;
        const productStatus = ['normal', 'problem', 'repaired', 'complete']; // normal , problem, complete
        const orderStatus = ['open'];
        const orderIDArr = [this.orderID];
        // const date12 = this.date12;
        // const userGroupScan1: UserGroupScan = this.userGroupScan1;
        this.currentProductionBundleState = [];
        this.bundleStatePDF = [];
        this.bundleStatePDFCompleted = [];
        this.bundleStatePDFNotCompleted = [];
        this.repService.getRepCurrentProductionBundleStateNo(this.company.companyID, productStatus, orderStatus, orderIDArr, bundleSetGroup);
        if (this.repCurrentProductionBundleStateSub) { this.repCurrentProductionBundleStateSub.unsubscribe(); }
        this.repCurrentProductionBundleStateSub = this.repService.getRepCurrentProductionsBundleStateCUpdatedListener().subscribe((data) => {
            // console.log(data);
            // this.dataFecthing = false;
            // this.showBundleSetgroupBoard(bundleSetGroup);
            this.currentProductionBundleState = data.currentProductionBundleState;
            this.bundleStatePDF = data.bundleStatePDF;
            // this.currentProductionZonePeriod = data.currentProductionZonePeriod;
            // this.currentProductionZoneForLoss = data.currentProductionZoneForLoss;
            // this.orderStyleColorSize = data.orderStyleColorSize;

            if ( this.bundleStatePDF.length > 0) {
                this.prepareGetRepCurrentProductionBundleState(bundleSetGroup);
            }

            // console.log(this.currentProductionBundleState);
        });
    }

    prepareGetRepCurrentProductionBundleState(bundleSetGroup: BundleSetGroup) {
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

        this.prepareDataBundleBoard(bundleSetGroup); // ## prepate data for bundle state board

    }

    checkBundleCompleted(nodeGroupScanID2: NodeGroupScanID2[]) {
        const nodeCompleted = '7.QC';  // 7.QC  ,  completeNode
        const status = 'done';  // ## finish all in bundle
        const nodeGroupScanID2F = nodeGroupScanID2.filter(c => c.nodeID===nodeCompleted && c.status===status);
        if (nodeGroupScanID2F.length > 0) { return true; }
        return false;;
    }

    prepareDataBundleBoard(bundleSetGroup: BundleSetGroup) {
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
        this.dataFecthing = false;
        this.showBundleSetgroupBoard(bundleSetGroup);
    }

    // showDialog() {
    //     this.dataFecthing = true;
    // }

    getBundlesetgroups() {
        // getBundlesetgroups(companyID: string, orderID: string, seasonYear: string)
        const companyID = this.company.companyID;
        this.seasonYear = this.userService.seasonYear; // ## 2024AW
        this.orderService.getBundlesetgroups(companyID, this.orderID, this.seasonYear);
    }

    getBundleSetGroupListener() {
        if (this.bundleSetGroupListSub) { this.bundleSetGroupListSub.unsubscribe(); }
        this.bundleSetGroupListSub = this.orderService.getBundleSetGroupListener().subscribe((data) => {
            // console.log(data);
            this.bundleSetGroups = data.bundleSetGroups;
            // console.log(this.bundleSetGroups);

            this.bundleSetGroups.sort((a,b)=>{
                return a.targetPlaceID >b.targetPlaceID?1:a.targetPlaceID <b.targetPlaceID?-1:0
                || a.completed >b.completed?1:a.completed <b.completed?-1:0 // ##
                || a.seq >b.seq?1:a.seq <b.seq?-1:0
            });

            // this.blockedPanel = false;
            // this.currentProductionBundleState = data.currentProductionBundleState;
            // this.bundleStatePDF = data.bundleStatePDF;
            // // this.currentProductionZonePeriod = data.currentProductionZonePeriod;
            // // this.currentProductionZoneForLoss = data.currentProductionZoneForLoss;
            // // this.orderStyleColorSize = data.orderStyleColorSize;
            // if ( this.bundleStatePDF.length > 0) {
            //     this.prepareGetRepCurrentProductionBundleState();
            // }

            // console.log(this.currentProductionBundleState);
        });
    }

    bundleSetGroupZone(targetPlaceID: string) {
        const bundleSetGroup1 = this.bundleSetGroups.filter(i=>i.targetPlaceID === targetPlaceID);
        return bundleSetGroup1;
    }

    editBundleSetGroupComplete(bundleSetGroup: BundleSetGroup, mode:'complete'|'seq') {
        this.orderService.editBundleSetGroupComplete(bundleSetGroup, mode);
    }

    // deleteBundleSetGroupDel(bundleSetGroup: BundleSetGroup) {
    //     // deleteBundleSetGroupDel(bundleSetGroup: BundleSetGroup)
    //     this.orderService.deleteBundleSetGroupDel(bundleSetGroup);
    // }

    clearData() {
        this.product = GBC.clrProduct();
        this.orderID = '';
        this.order = GBC.clrOrder();
        this.colorS = [];
        this.colorSSelect = GBC.clrOrderColor();

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
                this.order = this.userService.getOrderByID(this.orderID);
                this.colorS = this.order.orderColor;

                // console.log(this.orderID);
                this.product = product;
                this.getBundlesetgroups();
            }

        });

    }

    showColorSelector(mode: string) {
        // console.log(mode, idx);
        const ref = this.dialogService.open(SmdSelectColorComponent, {
            data: {
                id: 'colorSelection',
                company: this.userService?.getCompany(),
                mode: mode,  // ## mode = orderID-selector
                idx: -1,
                colorS: this.colorS,
                btnCaption: 'choose'

            },
            header: 'color Selection',
            width: '80%',
        });

        ref.onClose.subscribe((data: ColorS) => {
            // console.log(data);
            if (!data) {

            } else{
                // orderImagesSelect: OrderImage[] = [];
                // this.orderImagesSelect.push(data.orderImage);
                this.colorSSelect = data;
                // this.colorCode1 = this.colorSSelect.color.colorValue;
                // console.log(this.colorSSelect);
            }

        });
    }

    showAddnewBundleSetgroup(targetPlaceID: string) {
        const ref = this.dialogService.open(SmdNewBundleSetgroupComponent, {
            data: {
                id: 'addnew-bundle-setgroup',
                orderID: this.orderID,
                targetPlaceID: targetPlaceID,
                colorS: this.colorSSelect,
            },
            header: 'add new bundle set group',
            width: '50%',
        });

        ref.onClose.subscribe((data: any) => {
            // console.log(data);
            // if (car) {
            //     this.messageService.add({severity:'info', summary: 'Car Selected', detail:'Vin:' + car.vin});
            // }
        });
    }

    showBundleSetgroupBoard(bundleSetGroup: BundleSetGroup) {
        const ref = this.dialogService.open(SmdRepFacScanBundleStateStyleSetgroupComponent, {
            data: {
                id: 'bundle-setgroup-board-info',
                mode: 'setgroup', // setgroup , bundleNos
                orderID: this.orderID,
                product: this.product,
                colorS: this.colorSSelect,
                bundleSetGroup: bundleSetGroup,
                bundleStatePDFGroup: this.bundleStatePDFGroup,
                bundleStatePDFCompletedGroup: this.bundleStatePDFCompletedGroup,
                bundleStatePDFNotCompletedGroup: this.bundleStatePDFNotCompletedGroup,
                BundleStateBoard: this.BundleStateBoard,
                BundleStateBoardCompleted: this.BundleStateBoardCompleted,
                BundleStateBoardNotCompleted: this.BundleStateBoardNotCompleted,
            },
            header: 'bundle set group board info',
            width: '90%',
        });

        ref.onClose.subscribe((data: any) => {
            // console.log(data);
            // if (car) {
            //     this.messageService.add({severity:'info', summary: 'Car Selected', detail:'Vin:' + car.vin});
            // }
        });
    }


    confirmBundleDelete(bundleSetGroup: BundleSetGroup) {
        const color = '[ '+ bundleSetGroup.targetPlaceID + ' ] '
                        + bundleSetGroup.color.colorCode
                        + ' ' + bundleSetGroup.color.colorName;
        const txt = ' bundle no = ' + bundleSetGroup.bundleNoSet;
        this.confirmationService.confirm({
            message: 'Are you sure that you want to Delete? '+ txt,
            header: 'Delete ' + color,
            icon: 'pi pi-info-circle',
            accept: () => {
                console.log('delete');
                this.orderService.deleteBundleSetGroupDel(bundleSetGroup);
            },
            reject: () => {

            }
        });
    }

    ngOnDestroy(): void {
        if (this.bundleSetGroupListSub) { this.bundleSetGroupListSub.unsubscribe(); }
        if (this.repCurrentProductionBundleStateSub) { this.repCurrentProductionBundleStateSub.unsubscribe(); }
        // if (this.dataAroundAppSub) { this.dataAroundAppSub.unsubscribe(); }

        // if (this.langSub) { this.langSub.unsubscribe(); }
    }
}
