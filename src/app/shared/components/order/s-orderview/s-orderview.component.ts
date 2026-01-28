import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { DialogService } from 'primeng/dynamicdialog';
import { MenuItem, MessageService } from 'primeng/api';
import { TargetPlaceS } from 'src/app/models/app.model';
import { MainZone, Order, SetOrderProperty } from 'src/app/models/order.model';
import { CurrentCompanyOrder, CurrentProductQtyAllC } from 'src/app/models/report.model';
import { OrderService } from 'src/app/services/order.service';
import { UserService } from 'src/app/services/user.service';
import { GBC } from 'src/app/global/const-global';
import { SOrderQueueListComponent } from '../s-order-queue-list/s-order-queue-list.component';
// import { SOrderQtyRewriteComponent } from '../s-order-qty-rewrite/s-order-qty-rewrite.component';

@Component({
    selector: 'app-s-orderview',
    templateUrl: './s-orderview.component.html',
    styleUrls: ['./s-orderview.component.scss'],
    providers: [DialogService, MessageService],
})
export class SOrderviewComponent implements OnInit, OnDestroy {
    // orderStyleColorSize
    @Input() order: Order = GBC.clrOrder();
    @Input() orderStyleColorSize: any;
    @Input() currentCompanyOrder: CurrentCompanyOrder[] = [];
    @Input() currentProductQtyAllC: CurrentProductQtyAllC[] = [];
    @Input() menuOrdervisible: string[] = []; // ## ['rewrite-order']
    // ## rewrite-order = edit qty of order

    style = 'style';
    lastColor = '';
    borderSet  = false;
    setName = '';

    headMenuPopup = '';
    productBarcodeNoSelect = '';

    setOrderProperty: SetOrderProperty = {
        targetPlaceID: '',
        productColor: '',
        productSize: '',
    };
    mainZone: MainZone[] = [];

    items: MenuItem[] = [];

    constructor(
        public dialogService: DialogService,
        public messageService: MessageService,

        public userService: UserService,
        private orderService: OrderService,
    ) {}

    ngOnInit(): void {
        // this.order = this.orderService.getOrder();
        this.style = this.order.productOR.productID;
        this.mainZone = this.userService.getMainZoneTargetPlace(this.order.orderTargetPlace);
        if (this.order.orderColor.length > 0) {
            this.setName = this.order.orderColor[0].setName;
        }
        // console.log(this.currentCompanyOrder);
        // console.log(this.currentProductQtyAllC);

        this.items = [{
            label: 'File',
            items: [
                {label: 'New', icon: 'pi pi-fw pi-plus'},
                {label: 'Download', icon: 'pi pi-fw pi-download'}
            ]
        }];

    }

    // checkMenuVisible(menuID: string): boolean {
    //     const canVisible = this.menuOrdervisible.includes(menuID);
    //     return canVisible;
    // }

    // order.productColor, order.productSize,zone1.targetPlaceID
    setMenuPopup(productColor: string, productSize: string, targetPlaceID: string,) {
        this.headMenuPopup = this.style;
        this.items = [{
            label: this.headMenuPopup,
            items: [
                {label: 'show order queue', command: () => { this.selectProductBarcode(); }},
                // {
                //     label: 'rewrite order qty',
                //     visible: this.checkMenuVisible('rewrite-order'),
                //     command: () => { this.rewriteOrderQTY(productColor, productSize, targetPlaceID); }
                // },
                // {label: 'Download', icon: 'pi pi-fw pi-download'}
            ]
        }];
    }

    // rewriteOrderQTY(productColor: string, productSize: string, targetPlaceID: string) {
    //     this.selectProduct(productColor, productSize, targetPlaceID);
    //     this.showRewriteOrderQTYModal();
    // }

    selectProduct(color: string, size: string, targetPlaceID: string, ) {
        // qStyle = '';
        // qZone = '';
        // qColor = '';
        // qSize = '';
        // qQty = 0;
        // export class SetOrderProperty {
        //     constructor(
        //         public targetPlaceID: string,
        //         public productColor: string,
        //         public productSize: string,
        //     ) {}
        // }
        this.productBarcodeNoSelect = '';
        this.setOrderProperty = {
            targetPlaceID: targetPlaceID,
            productColor: color,
            productSize: size,
        };
        this.orderService.qColor = color;
        this.orderService.qSize = size;
        this.orderService.qZone = targetPlaceID;
        this.orderService.qQty = +this.getOrderQty(this.order.companyID, this.style , this.style,
            color, size, targetPlaceID);

        //
        this.productBarcodeNoSelect = this.userService.genProductBarcode(this.order.productOR.productID, this.orderService.qZone, '-----',
            this.userService.getInfoFromorder(this.order, 'year'),
            this.userService.strReplaceAll(this.orderService.qColor,',',''),
            this.orderService.qSize,
            this.userService.getInfoFromorder(this.order, 'sex')
        );
    }

    checkSetOrderPropertySelect(color: string, size: string, targetPlaceID: string) {
        // console.log(color, size, targetPlaceID);
        const checked = this.setOrderProperty.targetPlaceID === targetPlaceID
                        && this.setOrderProperty.productColor === color
                        && this.setOrderProperty.productSize === size;
        if (checked) {
            return 'txt-qty-select';
        }
        return '';
    }

    getOrderQty(companyID: string, productID: string, style: string,
        color: string, size: string, targetPlaceID: string) {
        // console.log(companyID, productID, style, color, size, targetPlaceID);
        // return  targetPlaceID: string, countryID: string,
        // const targetPlaceID = this.mainZone[targetPlaceIndex].targetPlaceID;
        // const countryID = this.targetPlaces[targetPlaceIndex].targetPlace.countryID;
        const currentCompanyOrder = this.currentCompanyOrder.filter(i=>i.companyID == companyID &&
            i.productID == productID  && i.targetPlaceID == targetPlaceID &&
            i.productColor == color && i.productSize == size);
        if (currentCompanyOrder.length>0) {
            return currentCompanyOrder[0].sumQty;
        } else {
            return '';
        }
    }

    getProductionZoneQty(companyID: string, productID: string, style: string,
        color: string, size: string, targetPlaceID: string) {
        // console.log(companyID, productID, style, color, size, targetPlaceIndex);
        // return  targetPlaceID: string, countryID: string,
        // console.log(this.currentProductQtyAllC);
        // const targetPlaceID = this.mainZone[targetPlaceIndex].targetPlaceID;
        // const countryID = this.targetPlaces[targetPlaceIndex].targetPlace.countryID;
        const factoryProductionZone = this.currentProductQtyAllC.filter(i=>i.companyID == companyID &&
            i.productID == productID && i.style == style && i.targetPlace == targetPlaceID &&
            i.color == color && i.size == size);
        if (factoryProductionZone.length>0 && factoryProductionZone[0].countQty > 0) {
            return factoryProductionZone[0].countQty;
        } else {
            return '';
        }
        // return '';
    }

    getProductionZoneQtyRemain(companyID: string, productID: string, style: string,
        color: string, size: string, targetPlaceID: string) {
        // console.log(companyID, productID, style, color, size, targetPlaceID);
        let orderQty = this.getOrderQty(companyID, productID, style, color, size, targetPlaceID);
        let productionZoneQty = this.getProductionZoneQty(companyID, productID, style, color, size, targetPlaceID);
        orderQty = orderQty===''?0:orderQty;
        productionZoneQty = productionZoneQty===''?0:productionZoneQty;

        if (+productionZoneQty > 0) {
            return +orderQty - +productionZoneQty;
        } else {
            return '';
        }
    }



    checkColorShow(color: string, doEdit: boolean, rowIdex: number) {
        if (doEdit && rowIdex === 0) { this.lastColor = '';}
        if (this.lastColor === color) {
            return false;
        } else {
            if (doEdit) {
                this.lastColor = color;
            }
            this.borderSet = true;
            return true;
        }
    }

    selectProductBarcode() {
        // const productBarcode = this.userService.genProductBarcode(this.order.productOR.productID, this.orderService.qZone, '-----',
        //     this.userService.getInfoFromorder(this.order, 'year'),
        //     this.userService.strReplaceAll(this.orderService.qColor,',',''),
        //     this.orderService.qSize,
        //     this.userService.getInfoFromorder(this.order, 'sex')
        // );
        this.showOrderQueueListnModal(this.productBarcodeNoSelect);
    }


    // showRewriteOrderQTYModal() {
    //     const ref = this.dialogService.open(SOrderQtyRewriteComponent, {
    //         data: {
    //             id: 'rewrite-order-qty',
    //             company: this.userService?.getCompany(),
    //             // callfrom: this.formName,  // ## send to nodejs for choose buckets
    //             // productBarcode: productBarcode,
    //             orderID: this.order.orderID,

    //         },
    //         header: 'Rewrite Order QTY',
    //         width: '50%',
    //     });

    //     ref.onClose.subscribe((data: any) => {

    //     });
    // }

    showOrderQueueListnModal(productBarcode: string) {
        const ref = this.dialogService.open(SOrderQueueListComponent, {
            data: {
                id: 'view-order-queue-list',
                company: this.userService?.getCompany(),
                // callfrom: this.formName,  // ## send to nodejs for choose buckets
                productBarcode: productBarcode,
                orderID: this.order.orderID,

            },
            header: 'Order Queue List',
            width: '90%',
        });

        ref.onClose.subscribe((data: any) => {

        });
    }

    ngOnDestroy(): void {
        // if (this.nodeFlowsSub) { this.nodeFlowsSub.unsubscribe(); }
        // if (this.postOrderProductionQueueCreateNewSub) { this.postOrderProductionQueueCreateNewSub.unsubscribe(); }
        // if (this.lastProductionQueueBarcodeSub) { this.lastProductionQueueBarcodeSub.unsubscribe(); }
        // if (this.productionQueueBarcodeSumQtySub) { this.productionQueueBarcodeSumQtySub.unsubscribe(); }

        // if (this.screenSub) { this.screenSub.unsubscribe(); }
    }
}
