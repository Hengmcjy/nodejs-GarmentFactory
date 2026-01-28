import { Component, OnInit } from '@angular/core';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';

import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';


import { GBC } from 'src/app/global/const-global';
import { Company } from 'src/app/models/app.model';
import { BundleSetGroup } from 'src/app/models/order.model';
import { Product } from 'src/app/models/product.model';
import { OrderService } from 'src/app/services/order.service';
import { ProductService } from 'src/app/services/product.service';
import { ReportService } from 'src/app/services/report.service';
import { UserService } from 'src/app/services/user.service';
import { BundleStateBoard } from 'src/app/models/infoBroard.model';


(pdfMake as any).vfs = pdfFonts.pdfMake.vfs;

@Component({
  selector: 'app-smd-rep-fac-scan-bundle-state-style-setgroup',
  templateUrl: './smd-rep-fac-scan-bundle-state-style-setgroup.component.html',
  styleUrls: ['./smd-rep-fac-scan-bundle-state-style-setgroup.component.scss']
})
export class SmdRepFacScanBundleStateStyleSetgroupComponent implements OnInit {

    isAdmin: boolean = false;
    factoryIDOuts = '';

    data: any;
    company: Company = GBC.clrCompany();
    product: Product = GBC.clrProduct();


    whoCall = '';  // ## nodeID  , 'staff-office'
    outsMode = ''; // ## out , receive
    mode= ''; // ## setgroup , bundleNos
    viewMode = ''; // ## order-outsource-progress-tracking
    orderID = '';
    bundleStatePDFGroup: any[] = [];
    bundleStatePDFCompletedGroup: any[] = [];
    bundleStatePDFNotCompletedGroup: any[] = [];

    bundleNos: number[] = [];

    BundleStateBoard: BundleStateBoard = GBC.clrBundleStateBoard();  // ## all
    BundleStateBoardCompleted: BundleStateBoard = GBC.clrBundleStateBoard();  // ## Completed
    BundleStateBoardNotCompleted: BundleStateBoard = GBC.clrBundleStateBoard();  // ## not Completed

    bundleSetGroup: BundleSetGroup = GBC.clrBundleSetGroup();

    editProgress = false;

    constructor(
        public config: DynamicDialogConfig,
        public ref: DynamicDialogRef,

        public userService: UserService,
        private orderService: OrderService,
        private productService: ProductService,
        // private socketService: SocketIOService,
        // public nsService: NodeStationService,
        private repService: ReportService
    ) {}

    ngOnInit(): void {
        this.isAdmin = this.userService.isAdmin();
        this.data = this.config.data;
        this.company = this.userService.getCompany();
        // console.log(this.data);
        this.whoCall = this.data.whoCall;
        this.outsMode = this.data.outsMode;
        this.bundleSetGroup = GBC.clrBundleSetGroup();
        this.mode = this.data.mode; // ## setgroup , bundleNos
        this.factoryIDOuts = this.data.factoryIDOuts;
        this.product = this.data.product;
        this.orderID = this.data.orderID;
        this.productService.setProduct(this.product);
        this.bundleSetGroup = this.data.bundleSetGroup;
        this.bundleStatePDFGroup = this.data.bundleStatePDFGroup;
        this.bundleStatePDFCompletedGroup = this.data.bundleStatePDFCompletedGroup;
        this.bundleStatePDFNotCompletedGroup = this.data.bundleStatePDFNotCompletedGroup;
        this.BundleStateBoard = this.data.BundleStateBoard;
        this.BundleStateBoardCompleted = this.data.BundleStateBoardCompleted;
        this.BundleStateBoardNotCompleted = this.data.BundleStateBoardNotCompleted;

        this.viewMode = '';
        this.bundleNos = Array.from(new Set(this.bundleStatePDFGroup[0].map((item: any) => item.bundleNo)));
        // console.log(this.bundleNos);
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

    showOutsTracking() {

        if (this.viewMode === 'order-outsource-progress-tracking') {
            this.viewMode = '';
        } else {
            this.viewMode = 'order-outsource-progress-tracking';
        }
    }


    closeDialog() {
        // const data: any = {
        //     color: color,
        //     colorNo: this.data.colorNo
        // };
        this.ref.close(true);
    }
}
