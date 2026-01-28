import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { GBC } from 'src/app/global/const-global';
import { Factory } from 'src/app/models/app.model';
import { OrderService } from 'src/app/services/order.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-smd-set-qc-complete',
  templateUrl: './smd-set-qc-complete.component.html',
  styleUrls: ['./smd-set-qc-complete.component.scss']
})
export class SmdSetQcCompleteComponent implements OnInit, OnDestroy {

    blockedPanel: boolean = false;
    factory: Factory = GBC.clrFactory();

    noArr: string[] = [];
    productBarcodeNoArr: string[] = [];

    qty = 0;
    data: any = {
        productBarcode: '',
        orId: '',
        zoneA: '',
        colorA: '',
        sizeA: '',
        no: '',
        toNode: '',
    };
    dataOld: any = {
        productBarcode: '',
        orId: '',
        zoneA: '',
        colorA: '',
        sizeA: '',
        no: '',
        toNode: '',
    };
    btnDisabled = false;

    private qrCodeDataSub: Subscription = new Subscription;
    private qrCodeListsSub: Subscription = new Subscription;
    private qctoCompleteSub: Subscription = new Subscription;

    constructor(
        // public dialogService: DialogService,
        // public messageService: MessageService,

        public userService: UserService,
        private orderService: OrderService,
        // public nsService: NodeStationService,
        // private repService: ReportService,
    ) {}

    ngOnInit(): void {
        // console.log('SmdSetQcCompleteComponent..');
        this.prepareData();
        this.clearQRCodeList();
        this.getQCSettoCompletedListener();
        this.getqrCodeListsListener();
    }

    prepareData(): void {
        this.qty = 0;
        this.data = {
            productBarcode: '',
            orId: '',
            zoneA: '',
            colorA: '',
            sizeA: '',
            no: '',
            toNode: '',
        };
        this.dataOld = {
            productBarcode: '',
            orId: '',
            zoneA: '',
            colorA: '',
            sizeA: '',
            no: '',
            toNode: '',
        };
    }

    clearQRCodeList() {
        this.qty = 0;
        this.noArr = [];
        this.productBarcodeNoArr = [];
    }

    addQRCodeList(data: any) {
        // ## check same orderID , zone , color , size
        // console.log( this.dataOld.productBarcode, data.productBarcode);
        if (this.dataOld.productBarcode === data.productBarcode) {
            // console.log( '==');
            const idx = this.productBarcodeNoArr.findIndex( fi =>(fi === data.productBarcodeNo));
            // console.log(idx,  '==', this.productBarcodeNoArr);
            if (idx < 0) {
                this.noArr.push(data.no);
                this.productBarcodeNoArr.push(data.productBarcodeNo);
            }
        } else {
            // console.log( '!=');
            this.clearQRCodeList();
            this.noArr.push(data.no);
            this.productBarcodeNoArr.push(data.productBarcodeNo);
        }
        this.noArr.sort();
        this.productBarcodeNoArr.sort();
        // console.log(this.productBarcodeNoArr);
        this.qty = this.noArr.length;
        this.dataOld = {...data};
    }

    setQCtoComplete() {
        // console.log(this.noArr);
        // console.log(this.productBarcodeNoArr);
        // console.log(this.data);
        this.btnDisabled = true;
        this.blockedPanel = true;
        const orderID = this.data.orId;
        const nodeIDLast = this.data.toNode;
        const toNode = 'completeNode';
        this.putOrderProductionBarcodeNoQCtoComplete(orderID, this.productBarcodeNoArr, nodeIDLast, toNode);

    }



    putOrderProductionBarcodeNoQCtoComplete(orderID: string,
        productBarcodeNos: string[], nodeIDLast: string, toNode: string) {
        //
        // (companyID: string, factoryID: string, orderID: string,
        // productBarcodeNos: string[], nodeIDLast: string, toNode: string)

        const companyID = this.userService.getCompany().companyID;
        const factoryID = this.factory.factoryID;
        // console.log(this.factory);
        this.orderService.putOrderProductionBarcodeNoQCtoComplete(companyID, factoryID, orderID, productBarcodeNos, nodeIDLast, toNode);
        if (this.qctoCompleteSub) { this.qctoCompleteSub.unsubscribe(); }
        this.qctoCompleteSub = this.orderService.getOrderQCtoCompleteListener().subscribe((data: any) => {
            // console.log( data);
            // if (data.state === 'openModal') {
            //     this.noArr = [];
            //     this.productBarcodeNoArr = [];
            // }
            this.blockedPanel = false;
            this.factory = data.factory;
            this.clearQRCodeList();
            this.prepareData();
        });
    }

    getQCSettoCompletedListener() {
        if (this.qrCodeDataSub) { this.qrCodeDataSub.unsubscribe(); }
        this.qrCodeDataSub = this.userService.getQCSettoCompletedListener().subscribe((data: any) => {
            if (data) {
                // console.log( data);
                // console.log( data.data.proD.productBarcode);
                this.data = {
                    productBarcode: data.data.proD.productBarcode,
                    productBarcodeNo: data.data.qrCode,
                    orId: data.data.orId,
                    zoneA: data.data.zoneA,
                    colorA: data.data.colorA,
                    sizeA: data.data.sizeA,
                    no: data.data.proD.no,
                    toNode: data.data.proD.toNode,
                };
                this.addQRCodeList(this.data);
                // this.repService.getRepCurrentProductionZonePeriod(
                //     this.company.companyID, this.productStatus, this.orderStatus, this.seasonYear);
                // this.closeDialog(data.success);
            }
        });
    }

    getqrCodeListsListener() {
        if (this.qrCodeListsSub) { this.qrCodeListsSub.unsubscribe(); }
        this.qrCodeListsSub = this.userService.getQCListsListener().subscribe((data: any) => {
            // console.log('data..', data);
            // if (data.state === 'openModal') {
            //     this.noArr = [];
            //     this.productBarcodeNoArr = [];
            // }
            this.factory = data.data.factory;
            this.blockedPanel = false;
            this.btnDisabled = false;
            // console.log(this.factory);
            this.clearQRCodeList();
            this.prepareData();
        });
    }

    ngOnDestroy(): void {
        if (this.qrCodeDataSub) { this.qrCodeDataSub.unsubscribe(); }
        if (this.qrCodeListsSub) { this.qrCodeListsSub.unsubscribe(); }
        if (this.qctoCompleteSub) { this.qctoCompleteSub.unsubscribe(); }

        // if (this.langSub) { this.langSub.unsubscribe(); }
        // if (this.dataAroundAppSub) { this.dataAroundAppSub.unsubscribe(); }
    }
}
