import { Component, OnDestroy, OnInit } from '@angular/core';
// import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { Subscription } from 'rxjs';
import { GBC } from 'src/app/global/const-global';
import { Company, Factory } from 'src/app/models/app.model';
import { NodeStation } from 'src/app/models/workstation.model';
import { NodeStationService } from 'src/app/services/node-station.service';
import { ProductService } from 'src/app/services/product.service';
import { SocketIOService } from 'src/app/services/socketio.service';
import { UserService } from 'src/app/services/user.service';

// import { DynamicDialogRef } from 'primeng/dynamicdialog';
// import { DynamicDialogConfig } from 'primeng/dynamicdialog';

// import { MessageService } from 'primeng/api';
// import { DialogService } from 'primeng/dynamicdialog';

@Component({
    selector: 'app-s-show-qrcode',
    templateUrl: './s-show-qrcode.component.html',
    styleUrls: ['./s-show-qrcode.component.scss'],

})
export class SShowQrcodeComponent implements OnInit, OnDestroy {
    nodeMenuActive = 'qrcode-list';

    nodeStation: NodeStation = GBC.clrNodeStation();
    company: Company = GBC.clrCompany();
    factory: Factory = GBC.clrFactory();
    stationID = '';
    companyID = '';
    factoryID = '';
    nodeID = '';

    mode = '';
    productID = '';
    zone = '';
    size = '';
    colorCode = '';
    colorName = '';
    colorCodeSharp = '';

    currentProductStyleQRCodeCFN: any[] = [];
    currentProductStyleCount = 0;

    data: any;
    limit = 20;


    private qrCodeListProductStyleCFNSub: Subscription = new Subscription;
    private dataAroundNodeAppSub: Subscription = new Subscription;

    constructor(
        // public config: DynamicDialogConfig,
        // public ref: DynamicDialogRef,

        public userService: UserService,
        private productService: ProductService,
        private socketService: SocketIOService,
        public nsService: NodeStationService,
    ) {}

    ngOnInit(): void {
        this.nodeStation = this.nsService.nodeStation;
        this.company = this.userService.getCompany();
        this.factory = this.userService.getFactory();
        this.stationID = this.nsService.stationID;

        // this.data = this.config.data
        // console.log(this.data);
        this.companyID = this.company.companyID;
        this.factoryID = this.factory.factoryID;
        this.nodeID = this.nodeStation.nodeID;

        this.dataAroundNodeAppSub = this.nsService.getDataAroundNodeAppStatusListener().subscribe(dataAroundNodeApp => {
            // console.log(dataAroundNodeApp)
            if (this.nodeMenuActive === this.nodeMenuActive) {
                this.getQRCodeListProductStyleCFN(this.nsService.productID, 1);
            }
            // console.log(dataAroundNodeApp.refreshCurrentPage, );
            // console.log(this.nodeMenuActive, dataAroundNodeApp.refreshPage);
            // if (dataAroundNodeApp.refreshCurrentPage && this.nodeMenuActive === dataAroundNodeApp.refreshPage) {
            //     // console.log('this.nodeMenuActive === dataAroundNodeApp.refreshPage');

            //     // this.getRepCurrentProductQtyCFNUpdatedListener();
            // }
        });

        this.mode = this.nsService.mode;
        this.productID = this.nsService.productID;
        this.zone = this.nsService.zone;
        this.size = this.nsService.size;
        this.colorCode = this.nsService.colorCode;

        // this.userService.changeColorArrToColorDash(this.nsService.colorTransformToArray(this.colorCode));
        this.colorName = this.nsService.colorName;
        if (this.mode === 'QRCodeListProductStyleCFN') {
            this.getQRCodeListProductStyleCFN(this.productID, 1);
        } else if (this.mode === 'QRCodeListProductStyleZoneSizeColorCFN') {
            this.colorCodeSharp =
                this.userService.getCodeColorNameByColorCode(
                    this.colorCode.substr(0, 2),
                    this.userService.getSetNameColorByOrderID(this.productID.trim())
                    );
            this.getQRCodeListProductStyleZoneSizeColorCFN(
                this.productID,
                this.zone,
                this.userService.setAddBackStrLen(this.size, 3, '-'),
                this.userService.changeColorArrToColorDash(this.nsService.colorTransformToArray(this.colorCode)),
                1
            );
        }
    }

    getQRCodeListProductStyleZoneSizeColorCFN(productID: string, zone: string, size: string, color: string, page: number) {
        this.currentProductStyleQRCodeCFN = [];
        this.currentProductStyleCount = 0;
        const productStatus = ['normal', 'problem', 'repaired'];
        this.nsService.getQRCodeListProductStyleZoneSizeColorCFN(
            this.companyID, this.factoryID, this.nodeID, productID,
            zone,size,color,
            productStatus, +page, +this.limit
        );
        if (this.qrCodeListProductStyleCFNSub) { this.qrCodeListProductStyleCFNSub.unsubscribe(); }
        this.qrCodeListProductStyleCFNSub = this.nsService.getQRCodeListProductStyleCFNUpdatedListener().subscribe((data) => {
            // console.log(data);
            this.currentProductStyleQRCodeCFN = data.currentProductStyleQRCodeCFN;
            if (data.currentProductStyleCount.length > 0) {
                this.currentProductStyleCount = data.currentProductStyleCount[0].countProductQty;
            }
            // this.mode = '';
            this.nsService.productID = '';
            this.nsService.zone = '';
            this.nsService.size = '';
            this.nsService.colorCode = '';
            this.nsService.colorName = '';
        });
    }

    getQRCodeListProductStyleCFN(productID: string, page: number) {
        // getQRCodeListProductStyleCFN(companyID: string, factoryID: string, nodeID: string,
        //         style: string, productStatus: string[], page: number, limit: number)
        this.currentProductStyleQRCodeCFN = [];
        this.currentProductStyleCount = 0;
        const productStatus = ['normal', 'problem', 'repaired'];
        this.nsService.getQRCodeListProductStyleCFN(
            this.companyID, this.factoryID, this.nodeID, productID,
            productStatus, +page, +this.limit
        );
        if (this.qrCodeListProductStyleCFNSub) { this.qrCodeListProductStyleCFNSub.unsubscribe(); }
            this.qrCodeListProductStyleCFNSub = this.nsService.getQRCodeListProductStyleCFNUpdatedListener().subscribe((data) => {
                // console.log(data);
                this.currentProductStyleQRCodeCFN = data.currentProductStyleQRCodeCFN;
                if (data.currentProductStyleCount.length > 0) {
                    this.currentProductStyleCount = data.currentProductStyleCount[0].countProductQty;
                }
                // this.mode = '';
                this.nsService.productID = '';
                this.nsService.zone = '';
                this.nsService.size = '';
                this.nsService.colorCode = '';
                this.nsService.colorName = '';
            });
    }

    paginate(event: any) {
        // console.log(event.rows, +event.page);
        // console.log(this.mode);
        this.limit = event.rows;
        // this.getRepCurrentProductions(+event.page + 1);

        if (this.mode === 'QRCodeListProductStyleCFN') {
            this.getQRCodeListProductStyleCFN(this.productID, +event.page + 1);
        } else if (this.mode === 'QRCodeListProductStyleZoneSizeColorCFN') {
            this.getQRCodeListProductStyleZoneSizeColorCFN(
                this.productID,
                this.zone,
                this.userService.setAddBackStrLen(this.size, 3, '-'),
                this.userService.changeColorArrToColorDash(this.nsService.colorTransformToArray(this.colorCode)),
                +event.page + 1
            );
        }
    }

    ngOnDestroy(): void {
        if (this.qrCodeListProductStyleCFNSub) { this.qrCodeListProductStyleCFNSub.unsubscribe(); }
        if (this.dataAroundNodeAppSub) { this.dataAroundNodeAppSub.unsubscribe(); }
        // if (this.repCurrentProductQtyCFNSub) { this.repCurrentProductQtyCFNSub.unsubscribe(); }

        // if (this.dataAroundAppSub) { this.dataAroundAppSub.unsubscribe(); }
        // if (this.errSub) { this.errSub.unsubscribe(); }
        // if (this.langSub) { this.langSub.unsubscribe(); }
        // if (this.langListSub) { this.langListSub.unsubscribe(); }
        this.nsService.mode = '';
        this.nsService.productID = '';
        this.nsService.zone = '';
        this.nsService.size = '';
        this.nsService.colorCode = '';
        this.nsService.colorName = '';
    }
}
