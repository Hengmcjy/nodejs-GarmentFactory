import { Component, OnDestroy, OnInit } from '@angular/core';
import { MessageService } from 'primeng/api';
import { Subscription } from 'rxjs';
import { OrderService } from 'src/app/services/order.service';
import { UserService } from 'src/app/services/user.service';

@Component({
    selector: 'app-order-set-subproduction',
    templateUrl: './order-set-subproduction.component.html',
    styleUrls: ['./order-set-subproduction.component.scss'],
})
export class OrderSetSubproductionComponent implements OnInit, OnDestroy {

    // private orderZoneSub: Subscription = new Subscription();

    constructor(
        public messageService: MessageService,

        public userService: UserService,
        private orderService: OrderService,
    ) {}

    ngOnInit(): void {

    }

    putOrderSubProduction() {

    }

    ngOnDestroy(): void {
        // if (this.orderZoneSub) { this.orderZoneSub.unsubscribe(); }
        // if (this.orderProductSelectSub) { this.orderProductSelectSub.unsubscribe(); }
        // if (this.errSub) { this.errSub.unsubscribe(); }
        // if (this.langSub) { this.langSub.unsubscribe(); }
        // if (this.screenSub) { this.screenSub.unsubscribe(); }
    }
}
