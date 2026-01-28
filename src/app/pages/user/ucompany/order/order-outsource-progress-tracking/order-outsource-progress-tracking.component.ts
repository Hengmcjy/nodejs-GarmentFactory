import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { DialogService } from 'primeng/dynamicdialog';
import { MegaMenuItem, MessageService } from 'primeng/api';
import { UserService } from 'src/app/services/user.service';
import { OrderService } from 'src/app/services/order.service';
import { GBC } from 'src/app/global/const-global';
import { Order, OrderProductBundleNosOutsourceTracking, ProductionNode } from 'src/app/models/order.model';
import { ColorS, Company, Factory, SizeS } from 'src/app/models/app.model';
import { Subscription } from 'rxjs';
import { SmdOrderviewComponent } from 'src/app/shared/components/order/smd-orderview/smd-orderview.component';
import { CurrentCompanyOrder, CurrentOrderStyle, CurrentProductQtyAllC, OrderStyleColorSize } from 'src/app/models/report.model';
import { ReportService } from 'src/app/services/report.service';
import { FlowSeq, NodeStation } from 'src/app/models/workstation.model';
import { NodeStationService } from 'src/app/services/node-station.service';

@Component({
  selector: 'app-order-outsource-progress-tracking',
  templateUrl: './order-outsource-progress-tracking.component.html',
  styleUrls: ['./order-outsource-progress-tracking.component.scss'],
  providers: [DialogService, MessageService],
})
export class OrderOutsourceProgressTrackingComponent implements OnInit, OnDestroy {
    @Input() order: Order = GBC.clrOrder();
    @Input() menuOrdervisible: string[] = []; // ## ['rewrite-order']

    formActive = 'order-outsource-progress-tracking';
    formName = this.formActive;
    pageShow = this.formActive;
    megaMenuItems: MegaMenuItem[] = [];

    // order: Order = GBC.clrOrder();
    factory: Factory = GBC.clrFactory();
    company: Company = GBC.clrCompany();

    bundleNos: number[] = [];
    nodeIDs: string[] = [];
    forbiddenNodeIDs: string[] = []; // ## nodeID no outsource / do ourself
    nodeStations: NodeStation[] = [];
    flowSeq: FlowSeq[] = [];
    orderProductBundleNosOutsourceTracking: OrderProductBundleNosOutsourceTracking[] = [];
    orderProductOutsourceTrackingFlowseqNormal: OrderProductBundleNosOutsourceTracking[] = [];
    orderProductOutsourceTrackingFlowseqTracking: OrderProductBundleNosOutsourceTracking[] = [];

    orderStyleColorSize: OrderStyleColorSize[] = [];
    currentCompanyOrder: CurrentCompanyOrder[] = [];
    currentProductQtyAllC: CurrentProductQtyAllC[] = [];
    currentOrderStyle: CurrentOrderStyle[] = [];

    styleS: string[] = [];
    targetPlaceS: string[] = [];
    colorS: string[] = [];
    sizeS: string[] = [];

    currentCompanyOrderStyleGroup: any[] = [];
    sizes: SizeS[] = [];
    colors: ColorS[] = [];
    orderStyleColorSizeF: any;

    rowZone = '';
    rowColor = '';
    rowSize = '';
    sTypeOtus = 'b';  // ## b =bundle , 1= 1by 1 / sTypeOtus=scanType

    private repCompanyOrderSub: Subscription = new Subscription();
    private orderOutsourceTrackingSub: Subscription = new Subscription();

    constructor(
        private location: Location,
        public dialogService: DialogService,
        public messageService: MessageService,

        public userService: UserService,
        public orderService: OrderService,
        // private productService: ProductService,
        public nsService: NodeStationService,
        private repService: ReportService,
    ) {}

    ngOnInit(): void {
        this.createMenuBar();
        this.setStart();
        this.getOrderOursourceTracking();
        this.getRepCompanyOrder();
    }

    upsertOrderProducctionNodeFlow(bundleNo: number, nodeID: string, productCount: number) {
        const bundleNos = [bundleNo];
        const bundleNosArr = this.bundleNos; // ## old first bundle no(s)
        const orderID = this.order.orderID;
        const companyID = this.company.companyID;
        const open = true;
        const productStatus = ['normal'];
        const isOutsourceTracking = true;

        const nodeIDIDX = this.nodeIDs.findIndex( fi =>(fi === nodeID));
        // console.log(nodeIDIDX);
        const productionNodes = this.genProductionNodes(nodeIDIDX, bundleNo, nodeID);
        // console.log(productionNodes);
        // const productionNode: ProductionNode[] = [{
        //     factoryID: this.factory.factoryID,
        //     fromNode: nodeID,
        //     toNode: this.nsService.findNextNodeID(nodeID, this.flowSeq),
        //     datetime: new Date(),
        //     status: 'normal',
        //     problemID: '',
        //     problemName: '',
        //     isOutsource: false,
        //     outsourceData: [],
        //     createBy: this.userService.getCreateBy()
        // }];


    }

    genProductionNodes(nodeIDIDX: number, bundleNo: number, nodeID: string) {
        let productionNodes: ProductionNode[] = [];
        let loops = [];
        for (let i = nodeIDIDX; i >= 0; i--) {
            loops.push(i);
        }
        loops.sort();

        loops.forEach( (item, index) => {
            const found = this.findEmptyNodIDCheck(+item, bundleNo);
            if (!found) {
                productionNodes.push({
                    factoryID: this.factory.factoryID,
                    fromNode: nodeID,
                    toNode: this.nsService.findNextNodeID(nodeID, this.flowSeq),
                    datetime: new Date(),
                    status: 'normal',
                    info: '',
                    sTypeOtus: this.sTypeOtus,
                    problemID: '',
                    problemName: '',
                    isTracking: true,
                    isOutsource: false,
                    outsourceData: [],
                    createBy: this.userService.getCreateBy()
                });
            }
        });
        return productionNodes;
    }

    findEmptyNodIDCheck(idx: number, bundleNo: number) {
        const found1 = this.orderProductOutsourceTrackingFlowseqNormal.filter(i=>
            i.nodeID == this.nodeIDs[idx] &&
            i.bundleNo == bundleNo
        );
        const found2 = this.orderProductOutsourceTrackingFlowseqTracking.filter(i=>
            i.nodeID == this.nodeIDs[idx] &&
            i.bundleNo == bundleNo
        );
        const found = found1.length>0 || found2.length>0;
        return found;
    }

    async getOrderOursourceTracking() {
        // getOrderOursourceTracking(companyID: string, factoryID: string, orderIDs1: string[], productionNodeStatusArr1: string[])
        const orderIDs = [this.order.orderID];
        const productionNodeStatusArr = ['outsource'];
        this.orderService.getOrderOursourceTracking(
            this.company.companyID, this.factory.factoryID, orderIDs, productionNodeStatusArr
        );
        if (this.orderOutsourceTrackingSub) { this.orderOutsourceTrackingSub.unsubscribe(); }
        this.orderOutsourceTrackingSub = this.orderService.getOrderProductBundleNosOutsourceTrackingUpdatedListener()
        .subscribe((data) => {
            // console.log(data);
            this.orderProductBundleNosOutsourceTracking = data.orderProductBundleNosOutsourceTracking;
            this.orderProductOutsourceTrackingFlowseqNormal = data.orderProductOutsourceTrackingFlowseqNormal;
            this.orderProductOutsourceTrackingFlowseqTracking = data.orderProductOutsourceTrackingFlowseqTracking;
            this.flowSeq = data.flowSeq;
            this.nodeStations = data.nodeStations;
            this.forbiddenNodeIDs = data.forbiddenNodeIDs;
            this.nodeIDs = data.nodeIDs;
            this.bundleNos = data.bundleNos;


            this.orderProductBundleNosOutsourceTracking.forEach( (item, index) => {
                item.targetPlace = this.userService.strReplaceAll(item.targetPlace, '-', '');
                item.color = this.userService.strReplaceAll(item.color, '-', '');
                item.size = this.userService.strReplaceAll(item.size, '-', '');
            });
            this.orderProductOutsourceTrackingFlowseqNormal.forEach( (item, index) => {
                item.targetPlace = this.userService.strReplaceAll(item.targetPlace, '-', '');
                item.color = this.userService.strReplaceAll(item.color, '-', '');
                item.size = this.userService.strReplaceAll(item.size, '-', '');
            });

            this.orderProductBundleNosOutsourceTracking.forEach( (item, index) => {
                item.color = this.userService.changeColorTextToColorTextComma(item.color);
                // item.sizeSeq = this.userService.getSizeSeq(item.size);
                // item.targetPlaceSeq = this.userService.getTargetPlaceSeq1(item.targetPlace);
            });

            this.orderProductOutsourceTrackingFlowseqNormal.forEach( (item, index) => {
                item.color = this.userService.changeColorTextToColorTextComma(item.color);
                // item.sizeSeq = this.userService.getSizeSeq(item.size);
                // item.targetPlaceSeq = this.userService.getTargetPlaceSeq1(item.targetPlace);
            });

            const colors = this.order.orderColor;
            const setName = this.order.orderColor[0]?this.order.orderColor[0].setName:'';
            this.orderProductBundleNosOutsourceTracking.forEach( (item, index) => {
                item.colorCode = this.userService.getCodeColorNameByColorCode(item.color, setName);
                item.colorName = this.userService.getColorNameByColorCode(item.color, setName);
                item.colorSeq = this.userService.getColorSeq1(colors, item.color);
                item.sizeSeq = this.userService.getSizeSeq(item.size);
                item.targetPlaceSeq = this.userService.getTargetPlaceSeq1(item.targetPlace);
            });

            this.orderProductOutsourceTrackingFlowseqNormal.forEach( (item, index) => {
                item.colorCode = this.userService.getCodeColorNameByColorCode(item.color, setName);
                item.colorName = this.userService.getColorNameByColorCode(item.color, setName);
                item.colorSeq = this.userService.getColorSeq1(colors, item.color);
                item.sizeSeq = this.userService.getSizeSeq(item.size);
                item.targetPlaceSeq = this.userService.getTargetPlaceSeq1(item.targetPlace);
            });

            // ## sorting asc
            this.orderProductBundleNosOutsourceTracking.sort((a,b)=>{
                return a.bundleNo >b.bundleNo?1:a.bundleNo <b.bundleNo?-1:0
            });

            // ## sorting asc
            this.flowSeq.sort((a,b)=>{
                return a.seqNo >b.seqNo?1:a.seqNo <b.seqNo?-1:0
            });

            console.log(this.orderProductBundleNosOutsourceTracking);
            console.log(this.orderProductOutsourceTrackingFlowseqNormal);
            console.log(this.flowSeq);
            console.log(this.nodeIDs);
        });
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
        this.company = this.userService.getCompany();
        this.factory = this.userService.getFactory();
        this.sizes = this.userService.sizes;
        this.colors = this.userService.colors;

        // this.orderService.qColor = '';
        // this.orderService.qSize = '';
        // this.orderService.qZone = '';
        // this.orderService.qQty = 0;
        // // this.factory = this.userService.clrFactory();
        // this.factory = this.userService.getFactoryIDArrByFactoryID(this.userService.getFactories(), this.order.factoryID);
        // this.userService.factoryDialogSelected = this.factory;
        // // ## get first node flow
        // this.getNodeFlows();
        // this.userService.factoryDialogSelected = GBC.clrFactory();
        // this.rowSelectedIdx = -1;
        // this.numberFrom = 0;
        // this.numberTo = 0;
        // this.productORInfoFilter();
        // this.getProductionQueueBarcodeSumQty();

        // if (this.lastProductionQueueBarcodeSub) { this.lastProductionQueueBarcodeSub.unsubscribe(); }
        // this.lastProductionQueueBarcodeSub = this.orderService.getLastProductionQueueBarcodeUpdatedListener()
        // .subscribe((data) => {
        //     this.countProductionQueueByBarcode = data.countProductionQueueByBarcode;
        //     this.sumProductionQueueByBarcode = data.sumProductionQueueByBarcode;
        // });
    }

    createMenuBar() {
        this.megaMenuItems = this.userService.getFormActiveMenu(this.formName, 'app-order-outsource-progress-tracking'); // get menu of form active
        this.megaMenuItems[0].command = () => {
            this.pageShow = 'view-order';
            this.showFactorySelectionModal();
            // this.userService.setSelectFactoryDialogSelect(this.factory);
        }
        // this.megaMenuItems[1].command = () => {
        //     this.pageShow = 'order-queue-history';
        // }
        // this.megaMenuItems[2].command = () => {
        //     this.pageShow = 'order-queue-set';
        // }
        // this.megaMenuItems[3].command = () => {
        //     this.pageShow = 'order-print-jobcard';
        // }
        // order-print-jobcard
    }

    getStateNodeID(mode: string, flowSeq: FlowSeq, orderProductBundleNosOutsourceTracking: OrderProductBundleNosOutsourceTracking) {
        // ## check nodeID forbidden
        if (mode === 'forbiddenNodeID') {
            if (this.forbiddenNodeIDs.includes(flowSeq.nodeID)) {
                return 'forbiddenNodeID';
            }

        // ## already done in NOdeID
        } else if (mode === 'doneNodeID'){
            // const uCompanyF = uCompany.filter(i=>i.companyID == companyID);
            const found = this.orderProductOutsourceTrackingFlowseqNormal.filter(i=>
                i.nodeID == flowSeq.nodeID &&
                i.bundleNo == orderProductBundleNosOutsourceTracking.bundleNo
            );
            if (found.length > 0) {
                return 'doneNodeID';
            } else if (found.length === 0 && !this.forbiddenNodeIDs.includes(flowSeq.nodeID)) {
                return 'stillTrack';  // ## still tracking
            } else {
                return '';
            }
        } else{
            return '';
        }
        return '';
    }

    showFactorySelectionModal() {
        const ref = this.dialogService.open(SmdOrderviewComponent, {
            data: {
                id: 'orderViewSelection',
                company: this.userService?.getCompany(),
                callfrom: this.formName,  // ## send to nodejs for choose buckets
                btnCaption: 'choose',
                order: this.order,
                orderStyleColorSize: this.orderStyleColorSizeF,
                currentCompanyOrder: this.currentCompanyOrder,
                currentProductQtyAllC: this.currentProductQtyAllC,

            },
            header: 'order Selection',
            width: '80%',
        });

        ref.onClose.subscribe((data: any) => {
            console.log(data);
            if (data) {

            }
        });
    }

    checkRowDiffData(rowIndex: number, zone: string, colorID: string, size: string): boolean {
        if (rowIndex === 0 ) {
            this.rowZone = zone;
            this.rowColor = colorID;
            this.rowSize = size;
            return false;
        }
        if (this.rowZone !== zone) {
            this.rowZone = zone;
            this.rowColor = colorID;
            this.rowSize = size;
            return true;
        } else if (this.rowColor !== colorID) {
            this.rowZone = zone;
            this.rowColor = colorID;
            this.rowSize = size;
            return true;
        } else if (this.rowSize !== size) {
            this.rowZone = zone;
            this.rowColor = colorID;
            this.rowSize = size;
            return true;
        }
        return false;
    }

    ngOnDestroy(): void {
        if (this.repCompanyOrderSub) { this.repCompanyOrderSub.unsubscribe(); }
        if (this.orderOutsourceTrackingSub) { this.orderOutsourceTrackingSub.unsubscribe(); }
        // if (this.lastProductionQueueBarcodeSub) { this.lastProductionQueueBarcodeSub.unsubscribe(); }
        // if (this.productionQueueBarcodeSumQtySub) { this.productionQueueBarcodeSumQtySub.unsubscribe(); }

        // if (this.repCompanyOrderSub) { this.repCompanyOrderSub.unsubscribe(); }
    }
}
