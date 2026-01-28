import { Component, OnDestroy, OnInit } from '@angular/core';
import { DialogService } from 'primeng/dynamicdialog';
import { Subscription } from 'rxjs';
import { OrderService } from 'src/app/services/order.service';
import { UserService } from 'src/app/services/user.service';
import { SNodeProductRecordComponent } from '../../user/node/s-node-product-record/s-node-product-record.component';
import { Company } from 'src/app/models/app.model';
import { GBC } from 'src/app/global/const-global';
import { Order, OrderProduction } from 'src/app/models/order.model';

@Component({
  selector: 'app-s-order-setlost',
  templateUrl: './s-order-setlost.component.html',
  styleUrls: ['./s-order-setlost.component.scss'],
  providers: [DialogService],
})
export class SOrderSetlostComponent implements OnInit, OnDestroy {

    company: Company = GBC.clrCompany();
    order: Order = GBC.clrOrder();
    orderProductions: OrderProduction[] = [];

    private productionLostSub: Subscription = new Subscription();

    constructor(
        public dialogService: DialogService,
        // public config: DynamicDialogConfig,
        // public ref: DynamicDialogRef,
        // private exportAsService: ExportAsService,

        public userService: UserService,
        private orderService: OrderService,
        // public nsService: NodeStationService,

    ) {}

    ngOnInit(): void {
        this.company = this.userService.getCompany();
        this.order = this.orderService.getOrder();
        // console.log(this.order);

        this.getOrderLostList();
    }

    // // getProductionLostListener()
    // this.productionLostUpdated.next({
    //     orderProduct: data.orderProduct
    getOrderLostList() {
        // getOrderLostList(companyID: string, orderID: string)
        const companyID = this.company.companyID;
        const orderID = this.order.orderID;
        this.orderService.getOrderLostList(companyID, orderID);
        if (this.productionLostSub) { this.productionLostSub.unsubscribe(); }
        this.productionLostSub = this.orderService.getProductionLostListener()
        .subscribe((data) => {
            // console.log(data);
            this.orderProductions = data.orderProduct;
        });
    }


    showSProductRecord_SetLost() {
        const orderID = this.order.orderID;
        const setLost: any = {

        };

        const ref = this.dialogService.open(SNodeProductRecordComponent, {
            data: {
                id: 'showProduct-setLost',
                mode: 'set-lost',
                order: this.order,
            },
            header: 'Set lost for product order [' + orderID + ']',
            width: '90%'
        });

        ref.onClose.subscribe((data: any) => {
            // console.log(data);

        });
    }

    ngOnDestroy(): void {
        if (this.productionLostSub) { this.productionLostSub.unsubscribe(); }
        // if (this.nodeFlowSub) { this.nodeFlowSub.unsubscribe(); }
        // if (this.sockio) { this.sockio.unsubscribe(); }
        // if (this.dataAroundAppSub) { this.dataAroundAppSub.unsubscribe(); }
        // if (this.screenSub) { this.screenSub.unsubscribe(); }
    }
}
