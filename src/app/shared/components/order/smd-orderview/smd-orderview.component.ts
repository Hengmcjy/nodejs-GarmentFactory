import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { GBC } from 'src/app/global/const-global';
import { MainZone, Order, SetOrderProperty } from 'src/app/models/order.model';
import { CurrentCompanyOrder, CurrentProductQtyAllC } from 'src/app/models/report.model';
import { OrderService } from 'src/app/services/order.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-smd-orderview',
  templateUrl: './smd-orderview.component.html',
  styleUrls: ['./smd-orderview.component.scss']
})
export class SmdOrderviewComponent implements OnInit, OnDestroy {

    order: Order = GBC.clrOrder();
    orderStyleColorSize: any;
    currentCompanyOrder: CurrentCompanyOrder[] = [];
    currentProductQtyAllC: CurrentProductQtyAllC[] = [];
    menuOrdervisible: string[] = []; // ## ['rewrite-order']
    // ## rewrite-order = edit qty of order

    data: any;

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
        public config: DynamicDialogConfig,
        public ref: DynamicDialogRef,

        // public dialogService: DialogService,
        // public messageService: MessageService,

        public userService: UserService,
        private orderService: OrderService,
    ) {}

    ngOnInit(): void {
        this.data = this.config.data;
        this.order = this.data.order;
        this.orderStyleColorSize = this.data.orderStyleColorSize;
        this.currentCompanyOrder = this.data.currentCompanyOrder;
        this.currentProductQtyAllC = this.data.currentProductQtyAllC;
        this.menuOrdervisible = this.data.menuOrdervisible;

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

    selectProduct(color: string, size: string, targetPlaceID: string, ) {
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

    closeDialog() {
        const data = {};
        this.ref.close(data);
    }

    ngOnDestroy(): void {
        // if (this.nodeFlowsSub) { this.nodeFlowsSub.unsubscribe(); }
        // if (this.postOrderProductionQueueCreateNewSub) { this.postOrderProductionQueueCreateNewSub.unsubscribe(); }
        // if (this.lastProductionQueueBarcodeSub) { this.lastProductionQueueBarcodeSub.unsubscribe(); }
        // if (this.productionQueueBarcodeSumQtySub) { this.productionQueueBarcodeSumQtySub.unsubscribe(); }

        // if (this.screenSub) { this.screenSub.unsubscribe(); }
    }
}
