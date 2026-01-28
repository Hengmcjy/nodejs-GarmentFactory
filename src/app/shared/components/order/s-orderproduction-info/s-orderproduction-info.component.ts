import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { GBC } from 'src/app/global/const-global';
import { OrderProduction } from 'src/app/models/order.model';
import { UserService } from 'src/app/services/user.service';

@Component({
    selector: 'app-s-orderproduction-info',
    templateUrl: './s-orderproduction-info.component.html',
    styleUrls: ['./s-orderproduction-info.component.scss'],
})
export class SOrderproductionInfoComponent implements OnInit, OnDestroy {

    orderProduction: OrderProduction = GBC.clrOrderProduction();

    private dataAroundAppSub: Subscription = new Subscription;

    constructor(
        public userService: UserService,
    ) {}

    ngOnInit(): void {
        this.orderProduction = this.userService.getOrderProduction();
        this.dataAroundAppSub = this.userService.getDataAroundAppStatusListener().subscribe((dataAroundApp) => {
            this.orderProduction = dataAroundApp.orderProductionInfo.orderProduction;
            // this.productBarcodeNoInput = this.orderProduction.productBarcodeNo;
            console.log(this.orderProduction);
        });
    }

    ngOnDestroy(): void {
        if (this.dataAroundAppSub) { this.dataAroundAppSub.unsubscribe(); }
        // if (this.qrCodeListProductStyleCFNSub) { this.qrCodeListProductStyleCFNSub.unsubscribe(); }
        // if (this.dataAroundNodeAppSub) { this.dataAroundNodeAppSub.unsubscribe(); }
        // if (this.repCurrentProductQtyCFNSub) { this.repCurrentProductQtyCFNSub.unsubscribe(); }

        // if (this.errSub) { this.errSub.unsubscribe(); }
        // if (this.langSub) { this.langSub.unsubscribe(); }
        // if (this.langListSub) { this.langListSub.unsubscribe(); }

        // this.userService.setOrderProduction(this.userService.clrOrderProduction());
    }
}
