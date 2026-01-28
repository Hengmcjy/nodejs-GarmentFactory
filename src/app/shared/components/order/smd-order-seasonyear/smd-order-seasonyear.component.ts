import { Component, OnDestroy, OnInit } from '@angular/core';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Subscription } from 'rxjs';
import { GBC } from 'src/app/global/const-global';
import { Company } from 'src/app/models/app.model';
import { OrderService } from 'src/app/services/order.service';
import { UserService } from 'src/app/services/user.service';

@Component({
    selector: 'app-smd-order-seasonyear',
    templateUrl: './smd-order-seasonyear.component.html',
    styleUrls: ['./smd-order-seasonyear.component.scss'],
})
export class SmdOrderSeasonyearComponent implements OnInit, OnDestroy {

    company: Company = GBC.clrCompany();

    private ordersSub: Subscription = new Subscription();

    constructor(
        public config: DynamicDialogConfig,
        public ref: DynamicDialogRef,

        // public translate: TranslateService,
        public userService: UserService,
        private orderService: OrderService,
    ) { }

    ngOnInit(): void {
        this.company = this.userService.getCompany();
        // console.log(this.userService.orderSeasonYears);
    }

    getOrders(page: number, limit: number, seasonYear: string) {
        // ## get orders
        this.orderService.getOrders(this.company.companyID, page, limit, seasonYear);
        this.ordersSub = this.orderService.getCustomersUpdatedListener().subscribe((data) => {
            this.userService.setDataAroundAppStatusListenerToNext();
            this.ref.close(seasonYear);
        });
    }

    closeDialog(seasonYear: string) {
        const data = '';
        this.userService.seasonYear = seasonYear;
        this.getOrders(1, this.orderService.ordersLimit, seasonYear);
    }

    ngOnDestroy(): void {
        if (this.ordersSub) { this.ordersSub.unsubscribe(); }
        // if (this.dataAroundAppSub) { this.dataAroundAppSub.unsubscribe(); }

    }
}
