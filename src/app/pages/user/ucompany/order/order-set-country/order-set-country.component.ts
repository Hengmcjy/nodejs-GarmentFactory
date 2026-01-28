import { Component, OnDestroy, OnInit } from '@angular/core';
import { MessageService } from 'primeng/api';
import { Subscription } from 'rxjs';
import { GBC } from 'src/app/global/const-global';

import { Company, OrderTargetPlaceS, TargetPlaceS } from 'src/app/models/app.model';
import { Order } from 'src/app/models/order.model';

import { OrderService } from 'src/app/services/order.service';
import { UserService } from 'src/app/services/user.service';

@Component({
    selector: 'app-order-set-country',
    templateUrl: './order-set-country.component.html',
    styleUrls: ['./order-set-country.component.scss'],
    providers: [MessageService],
})
export class OrderSetCountryComponent implements OnInit, OnDestroy {

    userID = '';
    company: Company = GBC.clrCompany();
    order: Order = GBC.clrOrder();
    targetPlaces: TargetPlaceS[] = [];
    orderTargetPlace: OrderTargetPlaceS[] = [];

    private orderZoneSub: Subscription = new Subscription();

    constructor(
        public messageService: MessageService,

        public userService: UserService,
        private orderService: OrderService,
    ) {}

    ngOnInit(): void {
        this.userID = this.userService.getUserID();
        this.company = this.userService.getCompany();
        this.order = this.orderService.getOrder();
        this.targetPlaces = this.userService.targetPlaces;

        // console.log(this.order);
        // this.swapIndex([...this.targetPlaces], 0, 1);
        this.orderTargetPlace = this.order.orderTargetPlace?[...this.order.orderTargetPlace]:[];
    }

    putOrderZoneUpdate() {
        // putOrderZoneUpdate(userID: string, order: Order)
        let idx = 1;
        this.orderTargetPlace.forEach( (item, index) => {
            item.seq = idx;
            idx++;
        });
        // console.log(this.orderTargetPlace);
        this.order.orderTargetPlace = [...this.orderTargetPlace];
        this.orderService.putOrderZoneUpdate(this.userID, this.order);
        if (this.orderZoneSub) { this.orderZoneSub.unsubscribe(); }
        this.orderZoneSub = this.orderService.getCustomerUpdatedListener()
        .subscribe((data) => {
            this.order = data.order;
            this.orderTargetPlace = [...this.order.orderTargetPlace];
            this.messageService.add({
                severity:'success',
                summary:'set zone/country',
                detail:'completed'
            });
        });
    }

    addZone(targetPlace: TargetPlaceS) {
        // console.log(targetPlace);
        // const size = sizes.filter(i=>i.size.sizeID == item.productSize)[0];
        let orderTargetPlace: OrderTargetPlaceS = {
            seq: targetPlace.seq,
            deliveryDate: new Date(),
            targetPlace: targetPlace.targetPlace
        };
        const orderTargetPlaceF = this.orderTargetPlace.filter(i=>i.targetPlace.countryID == targetPlace.targetPlace.countryID);
        if (orderTargetPlaceF.length === 0) {
            this.orderTargetPlace.push(orderTargetPlace);
        }
        // console.log(this.orderTargetPlace);
    }

    deleteZone(targetPlace: TargetPlaceS, idx: number) {
        this.orderTargetPlace.splice(idx, 1);
    }

    swapIndex(arr:TargetPlaceS[], indexA: number, indexB: number) {
        // console.log(arr[indexA], arr[indexB]);
        const temp = arr[indexA];
        arr[indexA] = arr[indexB];
        arr[indexB] = temp;
        // console.log(arr);
        return [...arr];
    };

    ngOnDestroy(): void {
        if (this.orderZoneSub) { this.orderZoneSub.unsubscribe(); }
        // if (this.orderProductSelectSub) { this.orderProductSelectSub.unsubscribe(); }
        // if (this.errSub) { this.errSub.unsubscribe(); }
        // if (this.langSub) { this.langSub.unsubscribe(); }
        // if (this.screenSub) { this.screenSub.unsubscribe(); }
    }
}
