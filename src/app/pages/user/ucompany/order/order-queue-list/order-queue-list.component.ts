import { Component, OnDestroy, OnInit } from '@angular/core';
import { MessageService } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import { Subscription } from 'rxjs';
import { GBC } from 'src/app/global/const-global';
import { Company } from 'src/app/models/app.model';
import { OrderStyles } from 'src/app/models/order.model';
import { CustomerService } from 'src/app/services/customer.service';
import { OrderService } from 'src/app/services/order.service';
import { ProductService } from 'src/app/services/product.service';
import { UserService } from 'src/app/services/user.service';
// import { SProductFilterComponent } from 'src/app/shared/components/general/s-product-filter/s-product-filter.component';

@Component({
    selector: 'app-order-queue-list',
    templateUrl: './order-queue-list.component.html',
    styleUrls: ['./order-queue-list.component.scss'],

})
export class OrderQueueListComponent implements OnInit, OnDestroy {
    formActive = 'order-queue-list';
    formName = this.formActive;

    userID = '';
    company: Company = GBC.clrCompany();

    orderStyles: OrderStyles[] = [];

    styleSelect: string = 'all-style';
    // styleS: string[] = [];
    // targetPlaceS: string[] = [];
    // colorS: string[] = [];
    // sizeS: string[] = [];

    private orderStyleListSub: Subscription = new Subscription();

    constructor(
        public dialogService: DialogService,
        public messageService: MessageService,

        private productService: ProductService,
        public userService: UserService,
        private orderService: OrderService,
        private customerService: CustomerService
    ) {}

    ngOnInit(): void {
        this.userID = this.userService.getUserID();
        this.company = this.userService.getCompany();

        // ## select style
        this.userService.orderStyleSelectListener.next(this.styleSelect);

        this.getOrderStyles();
    }

    getOrderStyles() {
        // getOrderStyles(companyID: string, orderStatus: string[])
        const orderStatus = ['open'];
        this.orderService.getOrderStyles(this.company.companyID, orderStatus);
        if (this.orderStyleListSub) { this.orderStyleListSub.unsubscribe(); }
        this.orderStyleListSub = this.orderService.getOrderStylesListsListener().subscribe((data) => {
            // console.log(data);
            this.orderStyles = data.orderStyles;
            // this.product = data.product;
            // // this.style = this.product.productCustomerCode.toUpperCase();
            // this.style = this.order.orderID;
            // this.style = this.userService.setAddBackStrLen(this.style, this.userService.styleLen, ' ');
            // // console.log(this.product);
            // // this.userService.setAddBackStrLen();
            // // setAddBackStrLen(this.style, this.userService.styleLen, ' ');
        });
    }

    selectStyle(style: string) {
        this.styleSelect = style;
        this.userService.orderStyleSelectListener.next(this.styleSelect);
    }

    // showProductfilterModal() {
    //     const showList: string[] = ['zone', 'color', 'size'];
    //     const ref = this.dialogService.open(SProductFilterComponent, {
    //         data: {
    //             id: 'productFilter',
    //             showList: showList,
    //             company: this.userService?.getCompany(),
    //             // order: this.order,
    //             callfrom: this.formName,  // ## send to nodejs for choose buckets
    //             styleS: this.styleS,
    //             targetPlaceS: this.targetPlaceS,
    //             colorS: this.colorS,
    //             sizeS: this.sizeS
    //         },
    //         header: 'Product Filter [ ' + this.styleSelect + ' ]',
    //         width: '80%'
    //     });

    //     ref.onClose.subscribe((data: any) => {
    //         // console.log(data);
    //         if (data) {
    //             this.styleS = data.styleS;
    //             this.targetPlaceS = data.targetPlaceS;
    //             this.colorS = data.colorS;
    //             this.sizeS = data.sizeS;
    //             // this.productORInfoFilter();
    //         } else {
    //             this.styleS = [];
    //             this.targetPlaceS = [];
    //             this.colorS = [];
    //             this.sizeS = [];
    //             // this.productORInfoFilter();
    //         }
    //         // this.targetPlace =
    //         //     this.userService.setAddBackStrLen(targetPlace.targetPlace.targetPlaceID, 4, '-').toUpperCase();
    //         // console.log(targetPlace);
    //         // editProductORInfo(field: string, value: string, targetPlace: TargetPlace)
    //         // this.editProductORInfo('targetPlace','',targetPlace.targetPlace);
    //     });
    // }

    ngOnDestroy(): void {
        if (this.orderStyleListSub) { this.orderStyleListSub.unsubscribe(); }
        // if (this.orderSub) { this.orderSub.unsubscribe(); }
        // if (this.orderProductSelectSub) { this.orderProductSelectSub.unsubscribe(); }
        // if (this.errSub) { this.errSub.unsubscribe(); }
        // if (this.langSub) { this.langSub.unsubscribe(); }
        // if (this.screenSub) { this.screenSub.unsubscribe(); }
    }
}
