import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { Location } from '@angular/common';
import { DialogService } from 'primeng/dynamicdialog';
import { MegaMenuItem, MessageService } from 'primeng/api';
import { Subscription } from 'rxjs';
import { UserService } from 'src/app/services/user.service';
import { OrderService } from 'src/app/services/order.service';
import { ProductService } from 'src/app/services/product.service';
import { NodeStationService } from 'src/app/services/node-station.service';
import { ReportService } from 'src/app/services/report.service';
import { GBC } from 'src/app/global/const-global';
import { Order, ProductORInfo, ProductionQueuedQtySum } from 'src/app/models/order.model';
import { ColorS, Company, Factory, SizeS } from 'src/app/models/app.model';
import { FlowSeq, NodeFlow } from 'src/app/models/workstation.model';
import { CurrentCompanyOrder, CurrentOrderStyle, CurrentProductQtyAllC, OrderStyleColorSize } from 'src/app/models/report.model';

@Component({
    selector: 'app-order-queue-create-outsource',
    templateUrl: './order-queue-create-outsource.component.html',
    styleUrls: ['./order-queue-create-outsource.component.scss'],
    providers: [DialogService, MessageService],
})
export class OrderQueueCreateOutsourceComponent implements OnInit, OnDestroy {
    formActive = 'order-queue-subcontactor-production';
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
    isOutsource = false;   // ## not is outsource

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



    rowSelectedIdx = -1;
    numberFrom = 0;
    numberTo = 0;
    bundleNo = this.order.bundleNo;
    qty = 0;
    bundleItems = 12;
    forLoss = false;

    qQty = 0;

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
        // this.lastProductionQueueBarcodeItem = this.orderService.lastProductionQueueBarcodeItem
        // this.order = this.orderService.getOrder();
        // this.bundleNo = this.order.bundleNo;
        // this.company = this.userService.getCompany();
        // this.sizes = this.userService.sizes;
        // this.colors = this.userService.colors;
        // // console.log(this.order.productOR);
        // this.tempFullProductORInfo = this.order.productOR.productORInfo?[...this.order.productOR.productORInfo]:[];
        // // console.log(this.tempFullProductORInfo);

        // this.setStart();
        // // ## load menu
        // this.createMenuBar()

        // this.getRepCompanyOrder();
    }

    checkSpliterSize(ev: any) {
        console.log(ev);
    }

    ngOnDestroy(): void {
        if (this.nodeFlowsSub) { this.nodeFlowsSub.unsubscribe(); }
        // if (this.postOrderProductionQueueCreateNewSub) { this.postOrderProductionQueueCreateNewSub.unsubscribe(); }
        // if (this.lastProductionQueueBarcodeSub) { this.lastProductionQueueBarcodeSub.unsubscribe(); }
        // if (this.productionQueueBarcodeSumQtySub) { this.productionQueueBarcodeSumQtySub.unsubscribe(); }

        // if (this.repCompanyOrderSub) { this.repCompanyOrderSub.unsubscribe(); }
    }
}
