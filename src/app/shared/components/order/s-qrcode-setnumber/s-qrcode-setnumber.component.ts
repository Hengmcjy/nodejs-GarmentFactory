import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-s-qrcode-setnumber',
    templateUrl: './s-qrcode-setnumber.component.html',
    styleUrls: ['./s-qrcode-setnumber.component.scss'],
})
export class SQrcodeSetnumberComponent implements OnInit, OnDestroy {

    // private ordersQueueListSub: Subscription = new Subscription();

    constructor() {}

    ngOnInit(): void {}

    ngOnDestroy(): void {
        // if (this.ordersQueueListSub) { this.ordersQueueListSub.unsubscribe(); }
        // if (this.orderSub) { this.orderSub.unsubscribe(); }
        // if (this.errSub) { this.errSub.unsubscribe(); }
        // if (this.langSub) { this.langSub.unsubscribe(); }
        // if (this.screenSub) { this.screenSub.unsubscribe(); }
    }
}
