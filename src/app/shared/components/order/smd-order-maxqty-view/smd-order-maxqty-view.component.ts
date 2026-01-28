import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { MegaMenuItem, MenuItem, MessageService } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import { Subscription } from 'rxjs';
import { GBC } from 'src/app/global/const-global';
import { MainZone, Order, QtyMaxView, SetOrderProperty } from 'src/app/models/order.model';
import { CurrentCompanyOrder, CurrentProductQtyAllC } from 'src/app/models/report.model';
import { OrderService } from 'src/app/services/order.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-smd-order-maxqty-view',
  templateUrl: './smd-order-maxqty-view.component.html',
  styleUrls: ['./smd-order-maxqty-view.component.scss'],
  providers: [DialogService, MessageService],
})
export class SmdOrderMaxqtyViewComponent implements OnInit, OnDestroy {
    @Input() order: Order = GBC.clrOrder();
    @Input() orderStyleColorSize: any[] = [];
    @Input() currentCompanyOrder: CurrentCompanyOrder[] = [];
    @Input() currentProductQtyAllC: CurrentProductQtyAllC[] = [];
    @Input() menuOrdervisible: string[] = []; // ## ['rewrite-order']

    // order-maxqty-view
    formActive = 'order-maxqty-view';
    formName = this.formActive;
    pageShow = this.formActive;

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
    qtyMaxView: QtyMaxView[] = [];
    qtyMaxViews: QtyMaxView[] = [];


    items: MenuItem[] = [];
    megaMenuItems: MegaMenuItem[] = [];

    header = '';
    zcsSelect = '';
    value1 = 0;
    visible: boolean = false;


    private orderSub: Subscription = new Subscription();

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
        // console.log(this.orderStyleColorSize);
        // console.log(this.order);
        // console.log(this.mainZone);

        this.items = [{
            label: 'File',
            items: [
                {label: 'New', icon: 'pi pi-fw pi-plus'},
                {label: 'Download', icon: 'pi pi-fw pi-download'}
            ]
        }];

        // this.createMenuBar()
        this.getCustomerUpdatedListener();

        this.genOrderMaxQty();

    }

    updateOrderMaxQtyView() {
        this.qtyMaxViews = [];
        // console.log(this.qtyMaxView);
        this.qtyMaxViews = [...this.qtyMaxView.filter(i=>i.maxQty>0)];



        const userID = this.userService.getUserID();
        const companyID = this.userService.getCompany().companyID;
        const orderID = this.order.orderID;
        const seasonYear = this.userService.seasonYear;
        // updateOrderMaxQtyView(userID: string, orderID: string, seasonYear: string, qtyMaxView: QtyMaxView)
        // console.log(this.qtyMaxViews);
        this.orderService.updateOrderMaxQtyView(userID, companyID, orderID, seasonYear, this.qtyMaxViews);
    }

    getCustomerUpdatedListener() {
        if (this.orderSub) { this.orderSub.unsubscribe(); }
        this.orderSub = this.orderService.getCustomerUpdatedListener()
        .subscribe((data) => {
            // console.log(data);
            this.order = data.order;
            this.messageService.add({
                severity:'success',
                summary:'order max qty view updated.',
                detail:'Updated'
            });
        });
    }


    showDialog(colorID: string, size: string, zone: string) {
        this.visible = true;
        const maxQty = this.getMaxQTY(colorID, size, zone);
        this.header = colorID+' '+size+' ' + zone;
        this.zcsSelect = colorID+';'+size+';' + zone;
        this.value1 = maxQty;
    }

    MaxQTYChange(colorID: string, size: string, zone: string) {
        // console.log('MaxQTYChange');
        // const zcs = colorID + ';' + size + ';' + zone;
        // const idx = this.qtyMaxView.findIndex( fi =>(fi.zcs === zcs));
        // if (idx >= 0) {
        //     this.qtyMaxView[idx].maxQty;
        // }
    }

    editMaxQTY() {
        // console.log('MaxQTYChange', this.zcsSelect);
        // const maxQty = this.getMaxQTY(colorID, size, zone);
        // this.value1 = maxQty;
        const idx = this.qtyMaxView.findIndex( fi =>(fi.zcs === this.zcsSelect));
        // console.log(idx);
        if (idx >= 0) {
            this.qtyMaxView[idx].maxQty = this.value1;
        }
        // console.log(this.qtyMaxView);
        this.visible = false;
    }

    set0OrderMaxQtyAll() {
        this.qtyMaxView = [];  // ## colorID ; size ; zone
        // ## gen blank order max quantity
        this.orderStyleColorSize.forEach( (item, index) => {
            const colorID = item.productColor;
            const size = item.productSize;
            this.mainZone.forEach( (item2, index2) => {
                const zone = item2.targetPlaceID
                const zcs = colorID + ';' + size + ';' + zone;
                const maxQty = 0;
                this.qtyMaxView.push({zcs, maxQty});
            });

        });
    }

    genOrderMaxQty() {
        this.qtyMaxView = [];  // ## colorID ; size ; zone
        // ## gen blank order max quantity
        this.orderStyleColorSize.forEach( (item, index) => {
            const colorID = item.productColor;
            const size = item.productSize;
            this.mainZone.forEach( (item2, index2) => {
                const zone = item2.targetPlaceID
                const zcs = colorID + ';' + size + ';' + zone;
                const maxQty = 0;
                this.qtyMaxView.push({zcs, maxQty});
            });

        });

        // ## get old data from order.orderSetting
        // ## and update to this.qtyMaxView
        if (this.order.orderSetting && this.order.orderSetting.qtyMaxView
            && this.order.orderSetting.qtyMaxView.length > 0) {
            this.order.orderSetting.qtyMaxView.forEach( (item, index) => {
                const idx = this.qtyMaxView.findIndex( fi =>(fi.zcs === item.zcs));
                if (idx >= 0) {
                    this.qtyMaxView[idx].maxQty =  item.maxQty;
                }
            });
        }

        // this.qtyMaxView[0].maxQty = 10;
        // console.log(this.qtyMaxView);
    }

    getMaxQTY(colorID: string, size: string, zone: string) {  // ## colorID ; size ; zone
        const zcs = colorID + ';' + size + ';' + zone;
        const idx = this.qtyMaxView.findIndex( fi =>(fi.zcs === zcs));
        if (idx >= 0) {
            if (this.qtyMaxView[idx].maxQty > 0) {
                return this.qtyMaxView[idx].maxQty;
            }
        }
        return 0;
    }

    getClass(value1: number) {
        if (value1 > 0) {
            return 'text-red-500';
        }
        return '';
    }

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

        // this.productBarcodeNoSelect = '';
        // this.setOrderProperty = {
        //     targetPlaceID: targetPlaceID,
        //     productColor: color,
        //     productSize: size,
        // };
        // this.orderService.qColor = color;
        // this.orderService.qSize = size;
        // this.orderService.qZone = targetPlaceID;
        // this.orderService.qQty = +this.getOrderQty(this.order.companyID, this.style , this.style,
        //     color, size, targetPlaceID);

        // //
        // this.productBarcodeNoSelect = this.userService.genProductBarcode(this.order.productOR.productID, this.orderService.qZone, '-----',
        //     this.userService.getInfoFromorder(this.order, 'year'),
        //     this.userService.strReplaceAll(this.orderService.qColor,',',''),
        //     this.orderService.qSize,
        //     this.userService.getInfoFromorder(this.order, 'sex')
        // );
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

    // createMenuBar() {
    //     this.megaMenuItems = this.userService.getFormActiveMenu(this.formName, 'app-order-queue-create'); // get menu of form active
    //     this.megaMenuItems[0].command = () => {
    //         this.pageShow = 'order-queue-production';
    //         // this.userService.setSelectFactoryDialogSelect(this.factory);
    //     }
    //     this.megaMenuItems[1].command = () => {
    //         this.pageShow = 'order-queue-history';
    //     }
    //     this.megaMenuItems[2].command = () => {
    //         this.pageShow = 'order-queue-set';
    //     }
    //     this.megaMenuItems[3].command = () => {
    //         this.pageShow = 'order-print-jobcard';
    //     }
    //     this.megaMenuItems[4].command = () => {
    //         this.pageShow = 'set-yarn-production';
    //     }
    //     this.megaMenuItems[5].command = () => {
    //         this.pageShow = 'order-maxqty-view';
    //     }
    //     // order-print-jobcard
    // }

    ngOnDestroy(): void {
        if (this.orderSub) { this.orderSub.unsubscribe(); }
        // if (this.postOrderProductionQueueCreateNewSub) { this.postOrderProductionQueueCreateNewSub.unsubscribe(); }
        // if (this.lastProductionQueueBarcodeSub) { this.lastProductionQueueBarcodeSub.unsubscribe(); }
        // if (this.productionQueueBarcodeSumQtySub) { this.productionQueueBarcodeSumQtySub.unsubscribe(); }

        // if (this.screenSub) { this.screenSub.unsubscribe(); }
    }
}
