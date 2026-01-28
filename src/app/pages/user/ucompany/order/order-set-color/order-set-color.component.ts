import { Component, OnDestroy, OnInit } from '@angular/core';
import { MessageService } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import { Subscription } from 'rxjs';
import { GBC } from 'src/app/global/const-global';
import { ColorS, Company } from 'src/app/models/app.model';
import { Order } from 'src/app/models/order.model';
import { OrderService } from 'src/app/services/order.service';
import { UserService } from 'src/app/services/user.service';
import { SSelectColorComponent } from 'src/app/shared/components/general/s-select-color/s-select-color.component';

@Component({
    selector: 'app-order-set-color',
    templateUrl: './order-set-color.component.html',
    styleUrls: ['./order-set-color.component.scss'],
    providers: [DialogService, MessageService],
})
export class OrderSetColorComponent implements OnInit, OnDestroy {
    formActive = 'order-set-color';
    formName = this.formActive;

    userID = '';
    company: Company = GBC.clrCompany();
    order: Order = GBC.clrOrder();
    colors: ColorS[] = [];
    orderColor: ColorS[] = [];


    private orderColorSub: Subscription = new Subscription();

    constructor(
        public dialogService: DialogService,
        public messageService: MessageService,

        public userService: UserService,
        private orderService: OrderService,
    ) {}

    ngOnInit(): void {
        this.userID = this.userService.getUserID();
        this.company = this.userService.getCompany();
        this.order = this.orderService.getOrder();
        this.colors = this.userService.colors;
        this.colors.sort((a,b)=>{
            return a.setName >b.setName?1:a.setName <b.setName?-1:0
                || a.seq >b.seq?1:a.seq <b.seq?-1:0
        });

        // console.log(this.colors);
        this.orderColor = this.order.orderColor?[...this.order.orderColor]:[];
    }

    putOrderColorUpdate() {
        // console.log(this.orderColor);
        let idx = 1;
        this.orderColor.forEach( (item, index) => {
            item.seq = idx;
            idx++;
        });
        // console.log(this.orderTargetPlace);
        this.order.orderColor = [...this.orderColor];
        this.orderService.putOrderColorUpdate(this.userID, this.order);
        if (this.orderColorSub) { this.orderColorSub.unsubscribe(); }
        this.orderColorSub = this.orderService.getCustomerUpdatedListener()
        .subscribe((data) => {
            // console.log(data);
            this.order = data.order;
            this.orderColor = [...this.order.orderColor];
            this.messageService.add({
                severity:'success',
                summary:'set Color',
                detail:'completed'
            });
        });
    }

    swapIndex(arr:ColorS[], indexA: number, indexB: number) {
        // console.log(arr[indexA], arr[indexB]);
        const temp = arr[indexA];
        arr[indexA] = arr[indexB];
        arr[indexB] = temp;
        // console.log(arr);
        return [...arr];
    };

    addColorOrder() {
        // console.log('addColorOrder()');
        const orderColor1: ColorS = GBC.clrOrderColor();
        // {
        //     seq:-1,
        //     setName: '',
        //     color: {
        //         colorID: '',
        //         colorName: '',
        //         colorValue: '',
        //         colorCode: '',
        //     }
        // };
        this.orderColor.push(orderColor1);
        // console.log(this.orderColor);
    }

    deleteColor(idx: number) {
        this.orderColor.splice(idx, 1);
    }

    clearColor(idx: number) {
        this.orderColor[idx].color.colorID = '';
    }

    showColorSelectionModal(idx: number) {
        const ref = this.dialogService.open(SSelectColorComponent, {
            data: {
                id: 'colorSelection',
                company: this.userService?.getCompany(),
                callfrom: this.formName,  // ## send to nodejs for choose buckets
                btnCaption: 'choose',
                colorNo: ''

            },
            header: 'Color Selection',
            width: '60%',
        });

        ref.onClose.subscribe((data: any) => {
            if (data) {
                // console.log(data);
                // this.orderColor[idx].color.colorID = this.orderColor[idx].color.colorID + data.color.color.colorID.toUpperCase();
                this.orderColor[idx].color.colorID = data.color.color.colorID;
                this.orderColor[idx].color.colorCode = data.color.color.colorCode;
                this.orderColor[idx].color.colorName = data.color.color.colorName;
                this.orderColor[idx].color.colorValue = data.color.color.colorValue;
                this.orderColor[idx].setName = data.color.setName;
                // this.colorSelected = data.color.color.colorID.toUpperCase();
            }
            // console.log(this.orderColor);
        });
    }

    ngOnDestroy(): void {
        if (this.orderColorSub) { this.orderColorSub.unsubscribe(); }
        // if (this.orderProductSelectSub) { this.orderProductSelectSub.unsubscribe(); }
        // if (this.errSub) { this.errSub.unsubscribe(); }
        // if (this.langSub) { this.langSub.unsubscribe(); }
        // if (this.screenSub) { this.screenSub.unsubscribe(); }
    }
}
