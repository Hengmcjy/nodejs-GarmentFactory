import { Component, OnDestroy, OnInit } from '@angular/core';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Subscription } from 'rxjs';
import { GBC } from 'src/app/global/const-global';
import { ColorS, Company, Factory } from 'src/app/models/app.model';
import { MainZone, Order } from 'src/app/models/order.model';
import { NodeScanProduct } from 'src/app/models/report.model';
import { NodeStationService } from 'src/app/services/node-station.service';
import { UserService } from 'src/app/services/user.service';

@Component({
    selector: 'app-smd-scanned-product',
    templateUrl: './smd-scanned-product.component.html',
    styleUrls: ['./smd-scanned-product.component.scss'],
})
export class SmdScannedProductComponent implements OnInit, OnDestroy {

    data: any;

    order: Order = GBC.clrOrder();
    orderColor: ColorS[] = [];
    nodeScanProductStyleZoneColorSize: NodeScanProduct[] = [];

    lastColor = '';

    mode = '';
    page = 1;
    limit = 20;
    companyID = '';
    factoryID = '';
    nodeID = '';  // ## fromNode
    style = '';
    zoneTxtArr: string[] = [];
    mainZone: MainZone[] = [];

    company: Company = GBC.clrCompany();
    factory: Factory = GBC.clrFactory();

    private staffScannedSub: Subscription = new Subscription;

    constructor(
        public config: DynamicDialogConfig,
        public ref: DynamicDialogRef,

        public userService: UserService,
        // private productService: ProductService,
        // private socketService: SocketIOService,
        public nsService: NodeStationService,
    ) {}

    ngOnInit(): void {
        this.data = this.config.data;
        this.mode = this.data.mode;
        this.company = this.userService.getCompany();
        this.factory = this.userService.getFactory();
        this.style = this.data.style;
        this.mainZone = this.data.mainZone;
        // console.log(this.userService.getOrders());
        // console.log(this.data);



        this.order = this.userService.getOrders().filter(i=>(i.orderID === this.style))[0];
        this.orderColor = this.order.orderColor;
        // console.log(this.orderColor)
        if (this.mode === 'getScannedProductCFFNsz') {
            this.getRepNodeStaffScannedByStyleZoneDate12(+this.data.page, +this.data.limit);
        }
    }

    getRepNodeStaffScannedByStyleZoneDate12(page: number, limit: number) {
        // mode: 'getScannedProductCFFNsz', // ## mode = 'getScannedProductCFFNsz'  CFTN = companyID factoryID (fromNode) nodeID , sz= style zone
        //         page: 1,
        //         limit: 20,
        //         companyID: this.company.companyID,
        //         factoryID: this.factory.factoryID,
        //         nodeID: fromNode,  // ## fromNode
        //         style: style,
        //         mainZone: this.mainZone,
        //         zoneTxtArr: zoneTxtArr,

        // getRepNodeStaffScannedByStyleZoneDate12(
        //     companyID: string, factoryIDs: string[], orderIDs: string[],
        //     zones: string[], nodeID: string,
        //     date12: Date[], infoType: string
        // )
        this.nodeScanProductStyleZoneColorSize = [];
        const companyID = this.data.companyID;
        const factoryIDs: string[] = [this.data.factoryID];
        this.limit = +this.data.limit;
        const orderIDs = [this.data.style];
        this.zoneTxtArr = this.data.zoneTxtArr;
        this.nodeID = this.data.nodeID;
        const date12 = this.data.date12;
        const infoType = this.data.infoType;
        // console.log(companyID, factoryIDs, orderIDs, this.zoneTxtArr, this.nodeID, date12, infoType);
        this.nsService.getRepNodeStaffScannedByStyleZoneDate12(
            companyID, factoryIDs, orderIDs, this.zoneTxtArr, this.nodeID, date12, infoType
        );
        if (this.staffScannedSub) { this.staffScannedSub.unsubscribe(); }
        this.staffScannedSub = this.nsService.getRepStaffScannedByDate12StyleZoneUpdatedListener().subscribe((data) => {
            // console.log(data);
            this.nodeScanProductStyleZoneColorSize = data.nodeScanProductStyleZoneColorSize;

            this.nodeScanProductStyleZoneColorSize.forEach( (item, index) => {
                item.targetPlace = this.userService.strReplaceAll(item.targetPlace, '-', '');
                item.size = this.userService.strReplaceAll(item.size, '-', '');
                item.color = this.userService.strReplaceAll(item.color, '-', '');
            });

            // ## change color text to textComma
            this.nodeScanProductStyleZoneColorSize.forEach( (item, index) => {
                item.color = this.userService.changeColorTextToColorTextComma(item.color);
                item.colorSeq = this.userService.getColorSeq1(this.orderColor, item.color);
                item.sizeSeq = this.userService.getSizeSeq(item.size);
            });

            this.nodeScanProductStyleZoneColorSize.sort((a,b)=>{
                return a.style >b.style?1:a.style <b.style?-1:0
                    || a.colorSeq >b.colorSeq?1:a.colorSeq <b.colorSeq?-1:0
                    || a.sizeSeq >b.sizeSeq?1:a.sizeSeq <b.sizeSeq?-1:0
            });

            // console.log(this.nodeScanProductStyleZoneColorSize);
        });
    }

    getNodeIDScannedStyleZoneColorSize(orderID: string, fromNode: string, targetPlace: string, color: string, size: string) {
        // console.log(orderID, fromNode, targetPlace, color , size);
        const nodeScanProductStyleZoneColorSize = [...this.nodeScanProductStyleZoneColorSize];
        const nodeScanProductStyleZoneColorSizeF =  nodeScanProductStyleZoneColorSize.filter(i=>(
            i.companyID == this.company.companyID && i.factoryID == this.factory.factoryID &&
            i.orderID == orderID.trim() && i.fromNode == fromNode && i.targetPlace == targetPlace &&
            i.color == color && i.size == size
        ));
        // console.log(nodeScanProductStyleZoneColorSizeF);
        if (nodeScanProductStyleZoneColorSizeF.length > 0) {
            // const targetPlaceL = this.userService.setAddStrLen(targetPlace, 4, ' ') + ': ';
            return nodeScanProductStyleZoneColorSizeF[0].countQty+'';
        }
        return '';
    }

    checkColorShow(color: string, doEdit: boolean, rowIdex: number) {
        if (doEdit && rowIdex === 0) { this.lastColor = '';}
        if (this.lastColor === color) {
            return false;
        } else {
            if (doEdit) {this.lastColor = color;}
            return true;
        }
    }
    ngOnDestroy(): void {
        if (this.staffScannedSub) { this.staffScannedSub.unsubscribe(); }
        // if (this.ordersByOrderIDsSub) { this.ordersByOrderIDsSub.unsubscribe(); }
        // if (this.orderQtyRewriteSub) { this.orderQtyRewriteSub.unsubscribe(); }
        // if (this.productionQueueBarcodeSumQtySub) { this.productionQueueBarcodeSumQtySub.unsubscribe(); }

        // if (this.screenSub) { this.screenSub.unsubscribe(); }
    }
}
