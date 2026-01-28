import { Component, OnInit, OnDestroy, ViewChild, ElementRef, Input } from '@angular/core';
import { Location } from '@angular/common';
import { DialogService } from 'primeng/dynamicdialog';
import { MegaMenuItem, MessageService } from 'primeng/api';
import { Subscription } from 'rxjs';

import { UserService } from 'src/app/services/user.service';
import { OrderService } from 'src/app/services/order.service';
import { ProductService } from 'src/app/services/product.service';
import { NodeStationService } from 'src/app/services/node-station.service';
import { Order, ProductionQueuedQtySum, ProductORInfo, QueueInfo } from 'src/app/models/order.model';
import { ColorS, Company, Factory, SizeS } from 'src/app/models/app.model';
import { FlowSeq, NodeFlow } from 'src/app/models/workstation.model';

import { SSelectFactoryComponent } from 'src/app/shared/components/general/s-select-factory/s-select-factory.component';
import { SProductionQueueInfoComponent } from 'src/app/shared/components/order/s-production-queue-info/s-production-queue-info.component';
import { SProductionQueueManageComponent } from 'src/app/shared/components/order/s-production-queue-manage/s-production-queue-manage.component';
import { threadId } from 'worker_threads';
import { SProductFilterComponent } from 'src/app/shared/components/general/s-product-filter/s-product-filter.component';
import { CurrentCompanyOrder, CurrentOrderStyle, CurrentProductQtyAllC, OrderStyleColorSize } from 'src/app/models/report.model';
import { ReportService } from 'src/app/services/report.service';
import { GBC } from 'src/app/global/const-global';
import { SDepartmentProductionComponent } from 'src/app/shared/components/general/s-department-production/s-department-production.component';

@Component({
    selector: 'app-order-queue-create',
    templateUrl: './order-queue-create.component.html',
    styleUrls: ['./order-queue-create.component.scss'],
    providers: [DialogService, MessageService],
})
export class OrderQueueCreateComponent implements OnInit, OnDestroy {
    @ViewChild('input1', {static: false}) startNumberBox!: ElementRef;
    @ViewChild('input2', {static: false}) endNumberBox!: ElementRef;
    @Input() isOutsource: boolean = false;   // ##  is outsource   or not

    lastProductionQueueBarcodeItem = 0;

    formActive = 'order-queue-production';
    formName = this.formActive;
    pageShow = this.formActive;
    megaMenuItems: MegaMenuItem[] = [];

    order: Order = GBC.clrOrder();
    factory: Factory = GBC.clrFactory();
    company: Company = GBC.clrCompany();

    nodeFlows: NodeFlow[] = [];
    nodeFlow: NodeFlow = GBC.clrNodeFlow();
    flowSeq: FlowSeq[] = [];
    nodeID = '';
    productORInfo: ProductORInfo = GBC.clrProductORInfo();
    tempFullProductORInfo: ProductORInfo[] = [];
    countProductionQueueByBarcode = 0;
    sumProductionQueueByBarcode = 0;
    errCreateProductionQueueErrorBarcodeNoExisted = false;
    productionQueuedQtySum: ProductionQueuedQtySum[] = [];


    currentProductQtyAllC: CurrentProductQtyAllC[] = [];
    orderStyleColorSize: OrderStyleColorSize[] = [];
    currentCompanyOrder: CurrentCompanyOrder[] = [];

    currentOrderStyle: CurrentOrderStyle[] = [];
    currentCompanyOrderStyleGroup: any[] = [];
    sizes: SizeS[] = [];
    colors: ColorS[] = [];
    orderStyleColorSizeF: any;

    styleS: string[] = [];
    targetPlaceS: string[] = [];
    colorS: string[] = [];
    sizeS: string[] = [];

    stateOptions: any[] = [
        { label: 'normal', value: false },
        { label: 'For loss', value: true },
      ];

    maxLockJobQty = 1200;
    rowSelectedIdx = -1;
    numberFrom = 0;
    numberTo = 0;
    bundleNo = this.order.bundleNo;
    qty = 0;
    bundleItems = 12;
    forLoss = false;

    qQty = 0;

    // ## outsource
    flowSeqOutsourceSelect: FlowSeq[] = [];

    private nodeFlowsSub: Subscription = new Subscription();
    private postOrderProductionQueueCreateNewSub: Subscription = new Subscription();
    private lastProductionQueueBarcodeSub: Subscription = new Subscription();
    private productionQueueBarcodeSumQtySub: Subscription = new Subscription();
    private repCompanyOrderSub: Subscription = new Subscription();


    constructor(
        private location: Location,
        public dialogService: DialogService,
        public messageService: MessageService,

        public userService: UserService,
        public orderService: OrderService,
        private productService: ProductService,
        private nsService: NodeStationService,
        private repService: ReportService,
    ) {}

    ngOnInit(): void {
        this.maxLockJobQty = this.userService.maxLockJobQty;
        this.lastProductionQueueBarcodeItem = this.orderService.lastProductionQueueBarcodeItem
        this.order = this.orderService.getOrder();
        this.bundleNo = this.order.bundleNo;
        this.company = this.userService.getCompany();
        this.sizes = this.userService.sizes;
        this.colors = this.userService.colors;
        // console.log(this.order.productOR);
        this.tempFullProductORInfo = this.order.productOR.productORInfo?[...this.order.productOR.productORInfo]:[];
        // console.log(this.tempFullProductORInfo);

        this.setStart();
        // ## load menu
        this.createMenuBar()

        this.getRepCompanyOrder();
    }

    checkSpliterSize(ev: any) {
        console.log(ev);
    }

    async getRepCompanyOrder() {
        // this.lastColor = '';
        // this.orders = [];
        // console.log('getRepCompanyOrder');

        const productStatus = ['normal', 'problem', 'repaired', 'lost', 'complete'];
        const ordertatus = ['open'];
        this.orderService.getCompanyOrderByStyle(this.company.companyID, this.order.productOR.productID, ordertatus, productStatus);
        if (this.repCompanyOrderSub) { this.repCompanyOrderSub.unsubscribe(); }
        this.repCompanyOrderSub = this.orderService.getRepCompanyOrderUpdatedListener().subscribe((data) => {
            // console.log(data);
            // this.orderStyleColorSize = this.repService.setColorSeq(this.sizes, data.orderStyleColorSize);
            this.orderStyleColorSize = data.orderStyleColorSize;
            this.currentCompanyOrder = data.currentCompanyOrder;
            this.currentOrderStyle = data.currentOrderStyle;

            this.currentProductQtyAllC = data.currentProductQtyAllC;

            // console.log(this.currentCompanyOrder);
            // console.log(this.orderStyleColorSize);
            // console.log(this.currentProductQtyAllC);

            this.currentOrderStyle.sort((a,b)=>{
                return a.style >b.style?1:a.style <b.style?-1:0
            });

            this.orderStyleColorSize.forEach( (item, index) => {
                item.productSize = this.userService.strReplaceAll(item.productSize, '-', '');
            });
            this.orderStyleColorSize = this.repService.setSizeSeq(this.sizes, this.orderStyleColorSize);
            this.orderStyleColorSize = this.repService.setColorSeq(this.colors, this.orderStyleColorSize);


            // ## multi sort 2 property
            this.orderStyleColorSize.sort((a,b)=>{
                return a.style >b.style?1:a.style <b.style?-1:0
                    || a.colorSeq >b.colorSeq?1:a.colorSeq <b.colorSeq?-1:0
                    || a.sizeSeq >b.sizeSeq?1:a.sizeSeq <b.sizeSeq?-1:0
            });

            // ## replace - to empty
            this.currentProductQtyAllC.forEach( (item, index) => {
                item.size = this.userService.strReplaceAll(item.size, '-', '');
                item.color = this.userService.strReplaceAll(item.color, '-', '');
                item.targetPlace = this.userService.strReplaceAll(item.targetPlace, '-', '');
            });
            // ## change color text to textComma
            this.currentProductQtyAllC.forEach( (item, index) => {
                item.color = this.userService.changeColorTextToColorTextComma(item.color);
                item.sizeSeq = this.userService.getSizeSeq(item.size);
            });
            // console.log(this.currentProductQtyAllC);

            // this.orderStyleColorSize.sort((a,b)=>{
            //     return a.productColor >b.productColor?1:a.productColor <b.productColor?-1:0
            //         || a.sizeSeq >b.sizeSeq?1:a.sizeSeq <b.sizeSeq?-1:0
            // });


            // console.log(this.orderStyleColorSize);
            // console.log(this.currentOrderStyle, this.orderStyleColorSize, this.currentCompanyOrder);
            // console.log(this.currentCompanyOrder);

            // ## grouping style
            this.currentCompanyOrder.sort((a,b)=>{ return a.style >b.style?1:a.style <b.style?-1:0 });
            // console.log(this.currentCompanyOrder);

            this.currentCompanyOrder.forEach( (item, index) => {
                item.productSize = this.userService.strReplaceAll(item.productSize, '-', '');
            });
            // console.log(this.currentCompanyOrder);

            this.currentCompanyOrderStyleGroup = this.userService.groupBy(this.currentCompanyOrder, (c: any) => c.style);
            // console.log(this.currentCompanyOrderStyleGroup);

            this.currentCompanyOrderStyleGroup = Object.values(this.currentCompanyOrderStyleGroup);
            // console.log(this.currentCompanyOrderStyleGroup);

            this.orderStyleColorSizeF = this.orderStyleColorSizeFilter(0);
            // console.log(this.orderStyleColorSizeF);

        });
    }

    orderStyleColorSizeFilter(idx: number) {
        let orderStyleColorSize = this.orderStyleColorSize.filter(i=>i.style == this.currentCompanyOrderStyleGroup[idx][0].style);
        // console.log(orderStyleColorSize);
        // if (this.orders.length > 0) {
        let colors: ColorS[] = this.order.orderColor;

        // console.log(colors, orderStyleColorSize);
        orderStyleColorSize = this.repService.setColorSeq(colors, orderStyleColorSize);
        orderStyleColorSize.sort((a,b)=>{
            return a.style >b.style?1:a.style <b.style?-1:0
                || a.colorSeq >b.colorSeq?1:a.colorSeq <b.colorSeq?-1:0
                || a.sizeSeq >b.sizeSeq?1:a.sizeSeq <b.sizeSeq?-1:0
        });
        // console.log(orderStyleColorSize);
        return orderStyleColorSize;
    }

    setStart() {
        // console.log('setStart');
        this.location.replaceState('/'); // ## hide loocation
        this.orderService.qColor = '';
        this.orderService.qSize = '';
        this.orderService.qZone = '';
        this.orderService.qQty = 0;
        // this.factory = this.userService.clrFactory();
        this.factory = this.userService.getFactoryIDArrByFactoryID(this.userService.getFactories(), this.order.factoryID);
        // console.log(this.factory);
        this.userService.factoryDialogSelected = this.factory;
        // ## get first node flow
        this.getNodeFlows();
        this.userService.factoryDialogSelected = GBC.clrFactory();
        this.rowSelectedIdx = -1;
        this.numberFrom = 0;
        this.numberTo = 0;
        this.productORInfoFilter();
        this.getProductionQueueBarcodeSumQty();

        if (this.lastProductionQueueBarcodeSub) { this.lastProductionQueueBarcodeSub.unsubscribe(); }
        this.lastProductionQueueBarcodeSub = this.orderService.getLastProductionQueueBarcodeUpdatedListener()
        .subscribe((data) => {
            this.countProductionQueueByBarcode = data.countProductionQueueByBarcode;
            this.sumProductionQueueByBarcode = data.sumProductionQueueByBarcode;
        });
    }

    getProductionQueueBarcodeSumQty() {
        // getProductionQueueBarcodeSumQty(companyID: string, orderID: string, productID: string)
        this.orderService.getProductionQueueBarcodeSumQty(this.company.companyID, this.order.orderID, this.order.productOR.productID);
        if (this.productionQueueBarcodeSumQtySub) { this.productionQueueBarcodeSumQtySub.unsubscribe(); }
        this.productionQueueBarcodeSumQtySub = this.orderService.getProductionQueueBarcodeSumQtyListener()
        .subscribe((data) => {
            // console.log(data);
            this.productionQueuedQtySum = data.productionQueuedQtySum;
        });
    }

    findProductionQueueBarcodeSumQty(mode: string, productBarcode: string, productQty: number, productLossQty: number) { // ## mode = qty , remain
        const totalQty = this.calTotal(productQty, productLossQty);
        const qtySum = this.productionQueuedQtySum.filter(i=>(i.productBarcode === productBarcode));
        if (qtySum.length > 0) {
            if (mode==='qty') {
                // return qtySum[0].sumProductionQueueByBarcode;
                return qtySum.reduce((prev, cur) => {return prev + cur.sumProductionQueueByBarcode;}, 0);
            } else if (mode==='remain') {
                // return +totalQty - +qtySum[0].sumProductionQueueByBarcode;
                return +totalQty - +qtySum.reduce((prev, cur) => {return prev + cur.sumProductionQueueByBarcode;}, 0);
            }
        }
        return '';
    }

    findProductionQueueBarcodeSumQtyGroupForLoss(mode: string, productBarcode: string,
            productQty: number, productLossQty: number, forLoss: boolean) {
        // const totalQty = this.calTotal(productQty, productLossQty);
        const qtySum = this.productionQueuedQtySum.filter(i=>(i.productBarcode === productBarcode && i.forLoss===forLoss));
        if (qtySum.length > 0) {
            if (mode==='qty') {
                // return qtySum[0].sumProductionQueueByBarcode;
                return qtySum.reduce((prev, cur) => {return prev + cur.sumProductionQueueByBarcode;}, 0);
            } else if (mode==='remain') {
                // return +totalQty - +qtySum[0].sumProductionQueueByBarcode;
                return +forLoss?productLossQty:productQty - +qtySum.reduce((prev, cur) => {return prev + cur.sumProductionQueueByBarcode;}, 0);
            }
        } else {
            if (mode==='qty') {
                return 0;
            } else if (mode==='remain') {
                return +forLoss?productLossQty:productQty ;
            }
        }
        return '0';
    }

    checkQtyRemainOK(mode: string, productBarcode: string,
        productQty: number, productLossQty: number, forLoss: boolean): boolean {
        const qtySum = this.productionQueuedQtySum.filter(i=>(i.productBarcode === productBarcode && i.forLoss===forLoss));
        let qtySum1 = 0;
        let QtyOK = true;
        if (qtySum.length > 0) {
            if (mode==='qty') {
                // return qtySum[0].sumProductionQueueByBarcode;
                qtySum1 = qtySum.reduce((prev, cur) => {return prev + cur.sumProductionQueueByBarcode;}, 0);
            } else if (mode==='remain') {
                // return +totalQty - +qtySum[0].sumProductionQueueByBarcode;
                qtySum1 =  +forLoss?productLossQty:productQty - +qtySum.reduce((prev, cur) => {return prev + cur.sumProductionQueueByBarcode;}, 0);
            }
        } else {

            if (mode==='qty') {
                qtySum1 = 0;
            } else if (mode==='remain') {
                qtySum1 =  +forLoss?productLossQty:productQty ;
            }
        }
        const qty = this.qty+''===''?0:this.qty;
        if (qtySum1 >= qty) {
            QtyOK = true;
        } else { QtyOK = false;}

        return QtyOK;
    }

    checkQty0() {
        const qty = this.qty+''===''?0:this.qty;
        if (qty > 0) {
            return true;
        } else { return false;}
    }


    postXXXOrderProductionQueueCreateNew() {
        // public productBarcode: string,
        // public queueDate: Date,
        // public factoryID: string,
        // public toNode: string,
        // public productCount: number,
        // public numberFrom: number,
        // public numberTo: number,
        // public createBy: CreateBy  public userID: string, public userName: string
        // postOrderProductionQueueCreateNew(companyID: string, orderID: string, productID: string, queueInfo: QueueInfo)

        this.errCreateProductionQueueErrorBarcodeNoExisted = false;
        const queueInfo = {
            productBarcode: this.productORInfo.productBarcode,
            queueDate: new Date(),
            factoryID: this.factory.factoryID,
            isOutsource: this.isOutsource,
            forLoss: this.forLoss,
            forLossQty: 0,
            bundleNo: this.bundleNo,
            bundleID: '',
            toNode: this.nodeID,
            productCount: +this.numberTo - +this.numberFrom + 1,
            numberFrom: +this.numberFrom,
            numberTo: +this.numberTo,
            yarnLot: [],
            createBy: {
                userID: this.userService.getUserID(),
                userName: this.userService.getUser().uInfo.userName
            }

        };
        this.orderService.postOrderProductionQueueCreateNew(
            this.company.companyID,
            this.order.orderID,
            this.order.productOR.productID,
            queueInfo
        );
        if (this.postOrderProductionQueueCreateNewSub) { this.postOrderProductionQueueCreateNewSub.unsubscribe(); }
        this.postOrderProductionQueueCreateNewSub = this.orderService.getPostOrderProductionQueueCreateNewUpdatedListener()
            .subscribe((data) => {
                // this.product = data.product;
                // this.style = this.product.productCustomerCode.toUpperCase();
                // console.log(data);
                if (data.success) {
                    this.messageService.add({
                        severity:'success',
                        summary:'Production Queue new Create',
                        detail:'completed'
                    });
                    this.numberFrom = 0;
                    this.numberTo = 0;
                } else {
                    // console.log(data.message);
                    if (data.message.messageID === 'errO007-1') {
                        this.errCreateProductionQueueErrorBarcodeNoExisted = true;
                        this.messageService.add({
                            severity:'error',
                            summary:'Error [ ' +data.message.messageID+ ' ]',
                            detail:'create Production Queue error [ barcodeNo Existed ] '
                        });
                    }
                }
            });
    }

    async getNodeFlows() {
        // getNodeFlows(companyID: string, factoryID: string)
        this.nsService.getNodeFlows(this.userService?.getCompany().companyID, this.factory.factoryID, 1, this.nsService.nodeFlowPageLimit);
        if (this.nodeFlowsSub) { this.nodeFlowsSub.unsubscribe(); }
        this.nodeFlowsSub = this.nsService.getNodeFlowsUpdatedListener().subscribe(async (data) => {
            this.nodeFlows = data.nodeFlows;
            // console.log(this.nodeFlows);
            // findNodeFlowType(nodeFlows: NodeFlow[], flowType: string)
            if (!this.isOutsource) {
                this.nodeFlow = await this.nsService.findNodeFlowType(this.nodeFlows, 'main');
                this.flowSeq = this.nodeFlow.flowSeq;
                // ## order aesc
                this.flowSeq.sort((a,b)=>{
                    return a.seqNo >b.seqNo?1:a.seqNo <b.seqNo?-1:0
                });
                // console.log(this.flowSeq);
                this.nodeID = this.flowSeq[0].nodeID;
            }
        });
    }

    calTotal(productQty: number, productLossQty: number) {
        let total = 0;
        const productQtyF = productQty ? +productQty : 0;
        const productLossQtyF = productLossQty ? +productLossQty : 0;
        return productQtyF + productLossQtyF;
    }

    createMenuBar() {
        this.megaMenuItems = this.userService.getFormActiveMenu(this.formName, 'app-order-queue-create'); // get menu of form active
        this.megaMenuItems[0].command = () => {
            this.pageShow = 'order-queue-production';
            // this.userService.setSelectFactoryDialogSelect(this.factory);
        }
        // this.megaMenuItems[1].command = () => {
        //     this.pageShow = 'XXXX-order-queue-history';
        // }
        this.megaMenuItems[2].command = () => {
            this.pageShow = 'order-queue-set';
        }
        this.megaMenuItems[3].command = () => {
            this.pageShow = 'order-print-jobcard';
        }
        this.megaMenuItems[4].command = () => {
            this.pageShow = 'set-yarn-production';
        }
        this.megaMenuItems[5].command = () => {
            this.pageShow = 'order-maxqty-view';
        }
        // order-print-jobcard
    }

    rowSelect(idx: number, modeRow: string) {
        this.numberFrom = 0;
        this.numberTo = 0;
        this.rowSelectedIdx = idx;
        // this.productORInfo = this.order.productOR.productORInfo[idx];
        this.productORInfo = this.tempFullProductORInfo[idx];
        // tempFullProductORInfo
        // console.log(this.productORInfo);
    }

    getRowClass(idx: number) {
        // let className = '';
        if (idx === this.rowSelectedIdx) { return 'background-color: var(--yellow-50);'}
        return '';
    }

    getBackgroudColor(colorCode: string) {
        const colorValue =  this.userService.getColorByColorCode(colorCode);
        return 'background-color: '+colorValue;
    }

    transformToCountryID(element: string) {
        return element.split("/")[1];
    }

    productORInfoFilter() {
        this.tempFullProductORInfo = this.order.productOR.productORInfo?[...this.order.productOR.productORInfo]:[];
        if (this.styleS.length > 0) {
            this.tempFullProductORInfo = this.tempFullProductORInfo.filter(i=>(this.styleS.includes(i.productBarcode.substr(0, 12).trim())));
        }
        if (this.targetPlaceS.length > 0) {
            const targetPlaceNewS = this.targetPlaceS.map(this.transformToCountryID)
            this.tempFullProductORInfo = this.tempFullProductORInfo.filter(i=>(targetPlaceNewS.includes(i.targetPlace.countryID)));
        }
        if (this.colorS.length > 0) {
            this.tempFullProductORInfo = this.tempFullProductORInfo.filter(i=>(this.colorS.includes(i.productColor)));
        }
        if (this.sizeS.length > 0) {
            this.tempFullProductORInfo = this.tempFullProductORInfo.filter(i=>(this.sizeS.includes(i.productSize)));
        }
    }

    getFactoryShowM(): Factory {

        if (this.isOutsource) {
            if (this.userService.factoryDialogSelected.factoryID !== '') {
                return this.userService.factoryDialogSelected;
            }
            return GBC.clrFactory();
        }
        return this.factory;
    }

    // genProductBarcode(style: string, targetPlaceID: string, countryID: string,
    //     year: string,color: string, size: string, sex: string)
    showProductfilterModal() {


        const ref = this.dialogService.open(SProductFilterComponent, {
            data: {
                id: 'productFilter',
                company: this.userService?.getCompany(),
                order: this.order,
                callfrom: this.formName,  // ## send to nodejs for choose buckets
                styleS: this.styleS,
                targetPlaceS: this.targetPlaceS,
                colorS: this.colorS,
                sizeS: this.sizeS
            },
            header: 'Product Filter [ ' + this.order.productOR.productID + ' ]',
            width: '80%'
        });

        ref.onClose.subscribe((data: any) => {
            // console.log(data);
            if (data) {
                this.styleS = data.styleS;
                this.targetPlaceS = data.targetPlaceS;
                this.colorS = data.colorS;
                this.sizeS = data.sizeS;
                this.productORInfoFilter();
            } else {
                this.tempFullProductORInfo = this.order.productOR.productORInfo;
                this.styleS = [];
                this.targetPlaceS = [];
                this.colorS = [];
                this.sizeS = [];
                this.productORInfoFilter();
            }
        });
    }

    showManageOrderQueueModal() {
        const productBarcode = this.userService.genProductBarcode(
            this.order.productOR.productID,
            this.orderService.qZone,
            '-----',
            this.userService.getInfoFromorder(this.order, 'year'),
            this.orderService.qColor,
            this.orderService.qSize,
            this.userService.getInfoFromorder(this.order, 'sex'));
        // console.log(productBarcode);

        // console.log(this.productORInfo);
        // console.log(this.factory);
        const ref = this.dialogService.open(SProductionQueueManageComponent, {
            data: {
                id: 'orderQueueManage',
                company: this.userService?.getCompany(),
                factory: this.factory,
                nodeID: this.nodeID,
                order: this.order,
                targetPlaceID: this.orderService.qZone,
                productORInfo: this.productORInfo,
                bundleNO: this.bundleNo,
                bundleItems: this.bundleItems,
                isOutsource: this.isOutsource,
                qty: this.qty,
                forLoss: this.forLoss,
                callfrom: this.formName,  // ## send to nodejs for choose buckets
                btnCaption: 'choose',
                productBarcode: productBarcode

            },
            header: 'order queue setting',
            width: '90%',
        });

        ref.onClose.subscribe((data: any) => {
            // console.log(data);
            this.getRepCompanyOrder();
            if (data && data.success) {
                this.messageService.add({
                    severity:'success',
                    summary:'Productions Queue new Create',
                    detail:'completed'
                });
            }
        });
    }

    showFactorySelectionModal() {
        const ref = this.dialogService.open(SSelectFactoryComponent, {
            data: {
                id: 'factorysSelection',
                company: this.userService?.getCompany(),
                callfrom: this.formName,  // ## send to nodejs for choose buckets
                btnCaption: 'choose',
                isOutsource: this.isOutsource,

            },
            header: 'factory Selection',
            width: '80%',
        });

        ref.onClose.subscribe((factory: Factory) => {
            // console.log(factory);
            if (factory) {
                this.factory = factory;
                this.userService.factoryDialogSelected = factory;
                this.isOutsource = factory.fInfo.isOutsource;

                // ## get first node flow
                if (!this.isOutsource) {
                    this.getNodeFlows();
                } else {
                    this.flowSeqOutsourceSelect = [];
                }
            }
        });
    }

    showDepartmentProductionSelectionModal() {
        const ref = this.dialogService.open(SDepartmentProductionComponent, {
            data: {
                id: 'factorysSelection',
                company: this.userService?.getCompany(),
                callfrom: this.formName,  // ## send to nodejs for choose buckets
                btnCaption: 'choose',
                isOutsource: this.isOutsource,
                nodeFlows: this.nodeFlows[0],
                flowSeq: this.nodeFlows[0].flowSeq,
                mode: 'new-create-queue'
            },
            header: 'Node Production Selection',
            width: '50%',
        });

        ref.onClose.subscribe((data: any) => {
            // console.log(data);
            if (!data || data.length === 0) {
                this.flowSeqOutsourceSelect = [];
            } else {
                this.flowSeqOutsourceSelect = data;
                // console.log(this.flowSeqOutsourceSelect);
            }
        });
    }

    // getLastProductionQueueBarcode(companyID: string, factoryID: string, orderID: string,
    //     productID: string, productBarcode: string, limit: number)
    showProductionQueueInfoModal(idx: number, productBarcode: string, productQty: number) {
        // orderID: string,
        //     productID: string, productBarcode: string, limit: number
        const ref = this.dialogService.open(SProductionQueueInfoComponent, {
            data: {
                id: 'ProductionQueueInfo',
                companyID: this.userService?.getCompany().companyID,
                orderID: this.order.orderID,
                productID: this.order.productOR.productID,
                productBarcode: this.order.productOR.productORInfo[idx].productBarcode,  //
                limit: this.lastProductionQueueBarcodeItem,
                productQty: productQty,
                callfrom: this.formName,  // ## send to nodejs for choose buckets
                btnCaption: '',

            },
            header: ' Qty = '+this.sumProductionQueueByBarcode+' / '+productQty,
            width: '70%'
        });

        ref.onClose.subscribe((data) => {
            // console.log(data);
            // if (factory) {
            //     this.factory = factory;

            //     // ## get first node flow
            //     this.getNodeFlows();
            // }
        });
    }

    ngOnDestroy(): void {
        if (this.nodeFlowsSub) { this.nodeFlowsSub.unsubscribe(); }
        if (this.postOrderProductionQueueCreateNewSub) { this.postOrderProductionQueueCreateNewSub.unsubscribe(); }
        if (this.lastProductionQueueBarcodeSub) { this.lastProductionQueueBarcodeSub.unsubscribe(); }
        if (this.productionQueueBarcodeSumQtySub) { this.productionQueueBarcodeSumQtySub.unsubscribe(); }

        if (this.repCompanyOrderSub) { this.repCompanyOrderSub.unsubscribe(); }
    }
}
