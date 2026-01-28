import { Component, OnDestroy, OnInit } from '@angular/core';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Subscription } from 'rxjs';
import { GBC } from 'src/app/global/const-global';
import { Company, Factory } from 'src/app/models/app.model';
import { QRCodeCount, QRCodeList } from 'src/app/models/report.model';
import { NodeStationService } from 'src/app/services/node-station.service';
import { UserService } from 'src/app/services/user.service';

@Component({
    selector: 'app-smd-productbarcodeno',
    templateUrl: './smd-productbarcodeno.component.html',
    styleUrls: ['./smd-productbarcodeno.component.scss'],
})
export class SmdProductbarcodenoComponent implements OnInit, OnDestroy {

    data: any;

    company: Company = GBC.clrCompany();
    factory: Factory = GBC.clrFactory();

    // ## mode = 'getQRListCFTNszcs'  CFTN = companyID factoryID (toNode) nodeID , szcs= style zone color size
    mode = '';
    // headMenuPopup = '';
    orderID = '';

    qrCodeList: QRCodeList[] = [];
    qrCodeCount: QRCodeCount = GBC.clrQRCodeCount();
    limit = 20;

    private qrListSub: Subscription = new Subscription;

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
        this.company = this.userService.getCompany();
        this.factory = this.userService.getFactory();
        // console.log(this.data);

        this.mode = this.data.mode;
        // ## mode = 'getQRListCFTNszcs'  CFTN = companyID factoryID (toNode) nodeID , szcs= style zone color size
        if (this.mode === 'getQRListCFTNszcs') {
            this.getQRListCFTNszcs(+this.data.page, +this.data.limit)
        }
    }

    // ## mode = 'getQRListCFTNszcs'  CFTN = companyID factoryID (toNode) nodeID , szcs= style zone color size
    getQRListCFTNszcs(page: number, limit: number) {
        this.qrCodeList = [];
        this.qrCodeCount = GBC.clrQRCodeCount();
        const companyID = this.data.companyID;
        const factoryID = this.data.factoryID;
        const nodeID = this.data.nodeID;
        const style = this.data.style;
        this.orderID = style;
        const zone = this.data.zone;
        const color = this.data.color;
        const size = this.data.size;
        // const page = this.data.page;
        this.limit = limit;
        // getQRListCFTNszcs(companyID: string, factoryID: string, nodeID: string,
        //     style: string, zone: string, color: string, size: string,
        //     page: number, limit: number)
        this.nsService.getQRListCFTNszcs(companyID, factoryID, nodeID, style, zone, color, size, page, this.limit);
        if (this.qrListSub) { this.qrListSub.unsubscribe(); }
        this.qrListSub = this.nsService.getQRCodeListUpdatedListener().subscribe((data) => {
            // console.log(data);
            this.qrCodeList = data.qrCodeList;
            this.qrCodeCount = data.qrCodeCount;
        });

    }

    paginate(event: any) {
        // console.log(event.rows, +event.page);
        // console.log(this.mode);
        this.limit = event.rows;
        // this.getRepCurrentProductions(+event.page + 1);

        if (this.mode === 'getQRListCFTNszcs') {
            this.getQRListCFTNszcs( +event.page + 1, this.limit);
        }
    }


    closeDialog() {
        const data = {};
        this.ref.close(data);
    }

    ngOnDestroy(): void {
        if (this.qrListSub) { this.qrListSub.unsubscribe(); }
        // if (this.ordersByOrderIDsSub) { this.ordersByOrderIDsSub.unsubscribe(); }
        // if (this.orderQtyRewriteSub) { this.orderQtyRewriteSub.unsubscribe(); }
        // if (this.productionQueueBarcodeSumQtySub) { this.productionQueueBarcodeSumQtySub.unsubscribe(); }

        // if (this.screenSub) { this.screenSub.unsubscribe(); }
    }
}
