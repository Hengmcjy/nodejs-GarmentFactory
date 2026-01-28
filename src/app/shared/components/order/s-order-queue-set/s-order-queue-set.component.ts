import { Component, OnDestroy, OnInit } from '@angular/core';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import { Subscription } from 'rxjs';
import { GBC } from 'src/app/global/const-global';
import { Factory } from 'src/app/models/app.model';
import { Order, OrderProductionQueueList } from 'src/app/models/order.model';
import { OrderService } from 'src/app/services/order.service';
import { ProductService } from 'src/app/services/product.service';
import { UserService } from 'src/app/services/user.service';
import { SmdConfirmImportantTaskComponent } from '../../general/smd-confirm-important-task/smd-confirm-important-task.component';

@Component({
    selector: 'app-s-order-queue-set',
    templateUrl: './s-order-queue-set.component.html',
    styleUrls: ['./s-order-queue-set.component.scss'],
    providers: [DialogService, MessageService, ConfirmationService],
})
export class SOrderQueueSetComponent implements OnInit, OnDestroy {
    formActive = 'order-queue-set';
    formName = this.formActive;

    // productBarcode = '';
    companyID = '';
    factories: Factory[] = [];
    order: Order = GBC.clrOrder();
    // orderProductionQueue: OrderProductionQueue = GBC.clrOrderProductQueue();
    orderProductionQueueList: OrderProductionQueueList[] = [];
    orderProductionQueueListSelect: OrderProductionQueueList = GBC.clrOrderProductionQueueList();
    setName = '';

    page = 1;
    countOrderQueueSetAll = 0;
    sumOrderQueueSetAll = 0;
    limit = 20;

    headMenuPopup = '';
    items: MenuItem[] = [];


    private orderQueueSetSub: Subscription = new Subscription();

    constructor(
        public dialogService: DialogService,
        public messageService: MessageService,
        private confirmationService: ConfirmationService,

        public userService: UserService,
        private orderService: OrderService,
        private productService: ProductService,
    ) {}

    ngOnInit(): void {
        this.companyID = this.userService.getCompany().companyID;
        this.factories = this.userService.factories;
        this.order = this.orderService.getOrder();
        if (this.order.orderColor.length > 0) {
            this.setName = this.order.orderColor[0].setName;
        }
        this.headMenuPopup = this.order.orderID;
        // this.productBarcode = '';
        this.getOrdersQueueSetList(this.page, this.limit);
    }

    cancelOrderQueue(queue: OrderProductionQueueList) {
        // console.log(queue);
    }

    selectOrderProductionQueueList(orderProductionQueueList: OrderProductionQueueList) {
        this.orderProductionQueueListSelect = orderProductionQueueList;
    }

    setMenuPopup(orderProductionQueueList: OrderProductionQueueList) {
        // this.orderProductionQueueList = data.queueList;
        this.items = [];
        if (orderProductionQueueList === this.orderProductionQueueList[0]) {
            // console.log(orderProductionQueueList);
            this.orderProductionQueueListSelect = orderProductionQueueList;
            this.headMenuPopup = this.order.orderID;
            this.items = [{
                label: this.headMenuPopup,
                items: [
                    {label: 'cancel queue', command: () => {
                        this.showStaffImportantConfirmModal(orderProductionQueueList);
                    }},
                    // {
                    //     label: 'rewrite order qty',
                    //     visible: this.checkMenuVisible('rewrite-order'),
                    //     command: () => { this.rewriteOrderQTY(productColor, productSize, targetPlaceID); }
                    // },
                    // {label: 'Download', icon: 'pi pi-fw pi-download'}
                ]
            }];
        }

    }

    confirmCancelOrderQueue(orderProductionQueueList: OrderProductionQueueList) {
        this.confirmationService.confirm({
            message: 'Are you sure that you want to proceed?',
            header: 'Confirmation',
            icon: 'pi pi-exclamation-triangle',
            accept: () => this.deleteOrderProductionQueuesCancel(orderProductionQueueList),
            reject: () => {}
        });
    }

    deleteOrderProductionQueuesCancel(orderProductionQueueList: OrderProductionQueueList) {
        this.orderService.deleteOrderProductionQueuesCancel(
            orderProductionQueueList,
            this.page, this.limit
        );
        if (this.orderQueueSetSub) { this.orderQueueSetSub.unsubscribe(); }
        this.orderQueueSetSub = this.orderService.getordersQueueListCancelUpdatedListener()
        .subscribe((data) => {
            // queueSetList: queueSetList,
            // queueSetListCount: queueSetListCount,
            // console.log(data);
            this.orderProductionQueueList = data.queueList;
            this.countOrderQueueSetAll = data.queueListCount;

            this.messageService.add({
                severity:'success',
                summary:'cancelled order queue',
                detail:'cancelled completed'
            });

        });

        // // getordersQueueListCancelUpdatedListener()
        // this.ordersQueueListCancelUpdated.next({
        //     queueList: data.queueList,
        //     queueListCount: data.queueListCount,
        //     success: data.success,
        //     message: {}
        // });
    }

    getOrdersQueueSetList(page: number, limit: number): void {
        // getOrdersQueueSetList(companyID: string, orderID: string,
        //     page: number, limit: number)
        this.orderService.getOrdersQueueSetList(this.companyID, this.order.orderID, this.page, this.limit );
        if (this.orderQueueSetSub) { this.orderQueueSetSub.unsubscribe(); }
        this.orderQueueSetSub = this.orderService.getOrdersQueueListUpdatedListener()
        .subscribe((data) => {
            // queueSetList: queueSetList,
            // queueSetListCount: queueSetListCount,
            // console.log(data);
            this.orderProductionQueueList = data.queueList;
            this.countOrderQueueSetAll = data.queueListCount;
            // this.sumProductionQueueAll = data.sumProductionQueueAll;
            // console.log(this.orderProductionQueueList);
        });
    }

    getInfoFromProductBarcode(productBarcode: string, mode: string) {
        let data = this.userService.getInfoFromProductBarcode(productBarcode, mode);
        data = this.userService.strReplaceAll(data, '-', '');
        if (mode === 'color') {
            data = this.userService.getColorNameByColorCode(data, this.setName);
        }
        return data;
    }

    paginate(event: any) {
        // console.log(event.rows, +event.page);
        this.limit = event.rows;
        this.page = +event.page + 1;
        this.getOrdersQueueSetList(+event.page + 1, this.limit);
        //event.first = Index of the first record
        //event.rows = Number of rows to display in new page
        //event.page = Index of the new page
        //event.pageCount = Total number of pages
    }

    getRowClass(isOutsource: boolean): string {
        if (isOutsource) {
            return 'txt-subcontact-cell';
        }
        return '';
    }

    showStaffImportantConfirmModal(orderProductionQueueList: OrderProductionQueueList) {
        const ref = this.dialogService.open(SmdConfirmImportantTaskComponent, {
            data: {
                id: 'staffImportantConfirm',
                mode: 'cancelOrderQueue',
            },
            header: 'Confirmation for cancel order queue',
            width: '30%'
        });

        ref.onClose.subscribe((data: any) => {
            // console.log(data);
            // console.log(this.canScanNode);
            // console.log(this.canScanSubNode);

            // console.log('showStaffLoginModal OK'); canScanSubNode

            // ## mode === 'cancelOrderQueue'
            if (data) {
                if (data.mode && data.mode === 'cancelOrderQueue' && data.success) {
                    // console.log(data);
                    // console.log(orderProductionQueueList);
                    this.deleteOrderProductionQueuesCancel(orderProductionQueueList);
                } else {

                }
            }
        });
    }

    ngOnDestroy(): void {
        if (this.orderQueueSetSub) { this.orderQueueSetSub.unsubscribe(); }

        // if (this.ordersSub) { this.ordersSub.unsubscribe(); }
        // if (this.productImageProfilesSub) { this.productImageProfilesSub.unsubscribe(); }
        // if (this.langSub) { this.langSub.unsubscribe(); }
        // if (this.screenSub) { this.screenSub.unsubscribe(); }
    }
}
