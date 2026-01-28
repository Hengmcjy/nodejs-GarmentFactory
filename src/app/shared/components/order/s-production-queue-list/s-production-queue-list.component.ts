import { Component, OnDestroy, OnInit } from '@angular/core';
import { MessageService } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import { Subscription } from 'rxjs';
import { CustomerService } from 'src/app/services/customer.service';
import { OrderService } from 'src/app/services/order.service';
import { ProductService } from 'src/app/services/product.service';
import { UserService } from 'src/app/services/user.service';
import { SProductFilterComponent } from '../../general/s-product-filter/s-product-filter.component';

@Component({
    selector: 'app-s-production-queue-list',
    templateUrl: './s-production-queue-list.component.html',
    styleUrls: ['./s-production-queue-list.component.scss'],
    providers: [DialogService, MessageService],
})
export class SProductionQueueListComponent implements OnInit, OnDestroy  {

    styleSelect: string = 'all-style';
    styleS: string[] = [];
    targetPlaceS: string[] = [];
    colorS: string[] = [];
    sizeS: string[] = [];

    // private orderSub: Subscription = new Subscription();
    private orderStyleSelectSub: Subscription = new Subscription();

    constructor(
        public dialogService: DialogService,
        public messageService: MessageService,

        private productService: ProductService,
        public userService: UserService,
        private orderService: OrderService,
        private customerService: CustomerService
    ) {}

    ngOnInit(): void {

        // ## listen style select
        // ## observ err
        this.orderStyleSelectSub = this.userService.getOrderStyleSelectListener().subscribe(data => {
            // console.log(data);
            this.styleSelect = data;
        });
    }

    showProductfilterModal() {
        const showList: string[] = ['zone', 'color', 'size'];
        const ref = this.dialogService.open(SProductFilterComponent, {
            data: {
                id: 'productFilter',
                showList: showList,
                company: this.userService?.getCompany(),
                // order: this.order,
                // callfrom: this.formName,  // ## send to nodejs for choose buckets
                styleS: this.styleS,
                targetPlaceS: this.targetPlaceS,
                colorS: this.colorS,
                sizeS: this.sizeS
            },
            header: 'Product Filter [ ' + this.styleSelect + ' ]',
            width: '80%'
        });

        ref.onClose.subscribe((data: any) => {
            // console.log(data);
            if (data) {
                this.styleS = data.styleS;
                this.targetPlaceS = data.targetPlaceS;
                this.colorS = data.colorS;
                this.sizeS = data.sizeS;
                // this.productORInfoFilter();
            } else {
                this.styleS = [];
                this.targetPlaceS = [];
                this.colorS = [];
                this.sizeS = [];
                // this.productORInfoFilter();
            }
            // this.targetPlace =
            //     this.userService.setAddBackStrLen(targetPlace.targetPlace.targetPlaceID, 4, '-').toUpperCase();
            // console.log(targetPlace);
            // editProductORInfo(field: string, value: string, targetPlace: TargetPlace)
            // this.editProductORInfo('targetPlace','',targetPlace.targetPlace);
        });
    }

    ngOnDestroy(): void {
        if (this.orderStyleSelectSub) { this.orderStyleSelectSub.unsubscribe(); }
        // if (this.orderSub) { this.orderSub.unsubscribe(); }
        // if (this.errSub) { this.errSub.unsubscribe(); }
        // if (this.langSub) { this.langSub.unsubscribe(); }
        // if (this.screenSub) { this.screenSub.unsubscribe(); }
    }
}
