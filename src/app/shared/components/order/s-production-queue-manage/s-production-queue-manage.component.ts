import { Component, OnDestroy, OnInit } from '@angular/core';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Subscription } from 'rxjs';

import { OrderService } from 'src/app/services/order.service';
import { ProductService } from 'src/app/services/product.service';
import { UserService } from 'src/app/services/user.service';

import { Company, Factory } from 'src/app/models/app.model';
import { Order, OrderProductionQueue, OutsourceData, ProductORInfo, QueueInfo, TargetPlace } from 'src/app/models/order.model';
import { MessageService } from 'primeng/api';
import { YarnLot } from 'src/app/models/yarn.model';
import { GBC } from 'src/app/global/const-global';

@Component({
    selector: 'app-s-production-queue-manage',
    templateUrl: './s-production-queue-manage.component.html',
    styleUrls: ['./s-production-queue-manage.component.scss'],
    providers: [MessageService],
})
export class SProductionQueueManageComponent implements OnInit, OnDestroy {

    data: any;
    errCode: any = {};
    verArr = [1];
    bundleNoboxReadOnly = true;

    blockUI = false;

    order: Order = GBC.clrOrder();
    company: Company = GBC.clrCompany();
    factory: Factory = GBC.clrFactory();
    factoryFrom: Factory = GBC.clrFactory();
    // factorySelect: Factory = GBC.clrFactory();
    productORInfo: ProductORInfo = GBC.clrProductORInfo();
    nodeID = '';
    showBtnSave = false;
    seasonYear = '';

    factories: Factory[] = [];

    orderProductionQueue: OrderProductionQueue = GBC.clrOrderProductQueue();
    queueInfo: QueueInfo[] = [];
    outsourceData: OutsourceData = GBC.clrOutsourceData();
    countProductionQueueByBarcode = 0;
    sumProductionQueueByBarcode = 0;



    // yarnLotID1 = '';
    // yarnLotID2 = '';
    yarnLots: YarnLot[] = [this.genYarnLot()];

    productBarcode = '';
    targetPlaceID = '';
    bundleItems = 0;
    qty = 0;
    bundleNo = 0;
    startNo = 1;
    toNo = 0;
    countBundle = 0;
    runningNo = 0;
    runningNoRun = 0;
    forLoss = false;
    isOutsource = false;

    qQty = 0;
    bundleNoFrom = 0;
    bundleNoTo = 0;


    private lastRunningNoOrderProductionSub: Subscription = new Subscription();
    private orderProductionsQueuesCreateNewSub: Subscription = new Subscription();


    constructor(
        public config: DynamicDialogConfig,
        public ref: DynamicDialogRef,
        public messageService: MessageService,

        public userService: UserService,
        public orderService: OrderService,
        private productService: ProductService,
    ) {}

    ngOnInit(): void {
        this.seasonYear = this.userService.seasonYear;
        this.order = this.orderService.getOrder();
        this.company = this.userService.getCompany();
        this.factories = this.userService.factories;
        // console.log(this.yarnLots);
        this.data = this.config.data;
        // console.log(this.data);
        this.order = this.data.order;
        this.factory = this.data.factory;
        this.company = this.data.company;
        this.nodeID = this.data.nodeID;
        this.productBarcode = this.data.productBarcode;
        this.productORInfo = this.data.productORInfo;
        this.bundleItems = this.data.bundleItems;
        this.qty = this.data.qty;
        this.countBundle = this.qty / this.bundleItems;
        this.forLoss = this.data.forLoss;
        this.toNo = +this.startNo + +this.qty -1;
        this.targetPlaceID = this.data.targetPlaceID;
        this.isOutsource = this.data.isOutsource;

        this.qQty = this.orderService.qQty;
        // console.log(this.qQty);

        // console.log(this.productORInfo);
        // console.log(this.productBarcode);

        // console.log(this.factory);
        // console.log(this.userService.getFactory());
        // console.log(this.userService.getFactories());

        // ## check factory is outsource or not
        if (this.factory.fInfo.isOutsource) {
            this.outsourceData.factoryID = this.factory.factoryID;
            this.outsourceData.fromFactoryID = this.userService.getFactory().factoryID;
            this.outsourceData.datetime = new Date();
            this.factoryFrom = {...this.userService.getFactory()};
        } else {  // ## not outsource
            this.factoryFrom = {...this.factory};
            this.outsourceData = GBC.clrOutsourceData();
        }
        // console.log(this.factory);
        // console.log(this.factoryFrom);

        this.setStart();
        this.createQueueInfo();
    }

    calQtyNo() {
        this.toNo = +this.startNo + +this.qty -1;
    }

    setStart() {
        this.getLastNoOrderProductionBarcode();

    }

    async createQueueInfo() {
        this.errCode = {};
        this.queueInfo = [];
        this.runningNoRun = this.runningNo;
        let bundleNoRun = this.bundleNo;
        const endBundleNo = +this.bundleNo + this.countBundle - 1;
        for (let i = this.bundleNo; i<= endBundleNo; i++) {
            // console.log(i);
            const queueInfoL = await this.genQueueInfo(+bundleNoRun, +this.runningNoRun, +this.runningNoRun + +this.bundleItems - 1);
            this.queueInfo.push(queueInfoL);  // ## add last position
            bundleNoRun = +bundleNoRun + 1;
            this.runningNoRun = +this.runningNoRun + +this.bundleItems ;
        }
        // console.log(this.queueInfo);
        this.bundleNoFrom = this.bundleNo;
        this.bundleNoTo = +this.bundleNo + +this.countBundle - 1;
    }

    async genQueueInfo(bundleNo: number, numberFrom: number, numberTo: number) {
        const queueInfo: QueueInfo = {
            productBarcode: this.productBarcode,
            queueDate: new Date(),
            factoryID: this.factoryFrom.factoryID,
            isOutsource: this.isOutsource,
            forLoss: this.forLoss,
            forLossQty: 0,
            bundleNo: bundleNo,
            bundleID: '',
            toNode: this.nodeID,
            productCount: +numberTo - +numberFrom + 1,
            numberFrom: +numberFrom,
            numberTo: +numberTo,
            yarnLot: this.yarnLots,
            createBy: {
                userID: this.userService.getUserID(),
                userName: this.userService.getUser().uInfo.userName
            }

        };
        return queueInfo;
    }

    // ## backup  genQueueInfo()
    // async genQueueInfo(bundleNo: number, numberFrom: number, numberTo: number) {
    //     const queueInfo: QueueInfo = {
    //         productBarcode: this.productBarcode,
    //         queueDate: new Date(),
    //         factoryID: this.factory.factoryID,
    //         isOutsource: this.isOutsource,
    //         forLoss: this.forLoss,
    //         forLossQty: 0,
    //         bundleNo: bundleNo,
    //         bundleID: '',
    //         toNode: this.nodeID,
    //         productCount: +numberTo - +numberFrom + 1,
    //         numberFrom: +numberFrom,
    //         numberTo: +numberTo,
    //         yarnLot: this.yarnLots,
    //         createBy: {
    //             userID: this.userService.getUserID(),
    //             userName: this.userService.getUser().uInfo.userName
    //         }

    //     };
    //     return queueInfo;
    // }

    getYarnLot() {
        let idxs: number[] = [];
        this.yarnLots.forEach( (item, index) => {
            if (item.yarnLotID.trim() === '') {
                item.yarnLotID = item.yarnLotID.trim();
                idxs.push(index);
            }
        });
        idxs.forEach( (item, index) => {
            this.yarnLots.splice(item, 1);
        });
        return this.yarnLots;
    }

    genYarnLot() {
        return { yarnLotID: '', yarnWeight: 0 };
    }

    plusYarnLot() {
        this.yarnLots.push(this.genYarnLot());
    }

    deleteYarnLot(idx: number) {
        this.yarnLots.splice(idx, 1);
        if (this.yarnLots.length === 0 ) { this.plusYarnLot(); }
    }

    checkYarnLot(): boolean {
        let idxs: number[] = [];
        let yarnLots1 = [...this.yarnLots];
        yarnLots1.forEach( (item, index) => {
            if (item.yarnLotID.trim() === '') {
                item.yarnLotID = item.yarnLotID.trim();
                idxs.push(index);
            }
        });
        idxs.forEach( (item, index) => {
            yarnLots1.splice(item, 1);
        });
        if (yarnLots1.length > 0) { return true; }
        return false;
    }

    getLastNoOrderProductionBarcode() {
        // getLastNoOrderProductionBarcode(companyID: string, orderID: string,
        // productID: string, productBarcode: string)
        this.blockUI = true;
        const ver = this.userService.ver;
        this.orderService.getLastNoOrderProductionBarcode(
            ver,
            this.company.companyID,
            this.order.orderID,
            this.order.productOR.productID,
            // this.productORInfo.productBarcode
            this.productBarcode
        );
        if (this.lastRunningNoOrderProductionSub) { this.lastRunningNoOrderProductionSub.unsubscribe(); }
        this.lastRunningNoOrderProductionSub = this.orderService.getLastRunningNoOrderProductionUpdatedListener()
        .subscribe((data) => {
            this.blockUI = false;
            // console.log(data);
            this.getBundleNoboxState(ver);
            this.runningNo = data.runningNo + 1;
            // this.runningNo = 2401;
            this.runningNoRun = this.runningNo;
            this.bundleNo = +data.lastBundleNo + 1;
            this.createQueueInfo();
        });

        // this.createQueueInfo();

    }

    getBundleNoboxState(ver: number) {
        this.bundleNoboxReadOnly = true;
        if(this.verArr.some(i => i == ver)) {
            this.bundleNoboxReadOnly = false;
          }
    }

    postOrderProductionQueuesCreateNew() {
        // postOrderProductionQueuesCreateNew(companyID: string, orderID: string, productID: string, queueInfo: QueueInfo[], qty: number)
        // console.log(this.productORInfo);
        // console.log(this.productORInfo.targetPlace);
        // console.log(this.queueInfo);
        const seasonYear = this.seasonYear;
        this.errCode = {};
        this.showBtnSave = false; // ## hice btn save
        this.blockUI = true; // block ui
        this.getYarnLot();
        //

        const queueInfo: QueueInfo[] = [];
        const createBy = {
            userID: this.userService.getUserID(),
            userName: this.userService.getUser().uInfo.userName
        };
        const startNo = +this.runningNo;
        const toNo = startNo + +this.qty - 1;

        const targetPlace: TargetPlace = {
            targetPlaceID: this.targetPlaceID,
            targetPlaceName: this.userService.getTargetPlaceName(this.targetPlaceID),
            countryID: '-',
            countryName: '-',
        };

        const bundleItems = this.bundleItems;
        const bundleNoFrom = this.bundleNoFrom;
        const bundleNoTo = this.bundleNoTo;
        const toNode1 =this.nodeID;
        const ver = +this.order.ver;

        // console.log(this.company.companyID, this.factoryFrom.factoryID,
        //     this.order.orderID,
        //     this.order.productOR.productID,
        //     this.forLoss,
        //     targetPlace,
        //     queueInfo,
        //     this.qty, this.qQty, this.yarnLots,
        //     startNo, toNo, this.productBarcode, this.isOutsource,
        //     bundleItems, bundleNoFrom, bundleNoTo, toNode1,
        //     this.outsourceData,
        //     createBy);

        this.orderService.postOrderProductionQueuesCreateNew(
            this.company.companyID, this.factoryFrom.factoryID,
            this.order.orderID,
            this.order.productOR.productID,
            this.forLoss,
            targetPlace,
            queueInfo,
            this.qty, this.qQty, this.yarnLots,
            startNo, toNo, this.productBarcode, this.isOutsource,
            bundleItems, bundleNoFrom, bundleNoTo, toNode1,
            this.outsourceData,
            createBy,
            ver,
            seasonYear
        );
        if (this.orderProductionsQueuesCreateNewSub) { this.orderProductionsQueuesCreateNewSub.unsubscribe(); }
        this.orderProductionsQueuesCreateNewSub = this.orderService.getLastRunningNoOrderProductionsUpdatedListener()
        .subscribe((data) => {
            // console.log(data);
            this.blockUI = false;  // no block ui
            if (!data.success) {
                // console.log(data);
                this.errCode = data.message;
                this.messageService.add({
                    severity:'error',
                    summary:'Error [ ' +data.message.messageID+ ' ]',
                    detail:'create Production Queue error [ some barcodeNo Existed ] '
                });
            } else {
                this.ref.close({success: true});
            }
        });
    }

    ngOnDestroy(): void {
        if (this.lastRunningNoOrderProductionSub) { this.lastRunningNoOrderProductionSub.unsubscribe(); }
        if (this.orderProductionsQueuesCreateNewSub) { this.orderProductionsQueuesCreateNewSub.unsubscribe(); }
        // if (this.lastProductionQueueBarcodeSub) { this.lastProductionQueueBarcodeSub.unsubscribe(); }

        // if (this.screenSub) { this.screenSub.unsubscribe(); }
    }
}
