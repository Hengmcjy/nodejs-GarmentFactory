import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { GBC } from 'src/app/global/const-global';
import { OrderProduction, ProductionNode } from 'src/app/models/order.model';
import { NodeStationService } from 'src/app/services/node-station.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-s-product-bundle-info',
  templateUrl: './s-product-bundle-info.component.html',
  styleUrls: ['./s-product-bundle-info.component.scss']
})
export class SProductBundleInfoComponent implements OnInit, OnDestroy {
    orderProducts: OrderProduction[] = [];
    orderProduct: OrderProduction = GBC.clrOrderProduction();
    productBarcodeNo = '';
    productBarcode = '';
    bundleNo = '';
    countQty = '';

    nodeColor: any[] = [];


    private datarecordProductBarcodeNoSub: Subscription = new Subscription;

    constructor(
        public userService: UserService,
        public nsService: NodeStationService,
    ) {}

    ngOnInit(): void {
        this.nodeColor = this.userService.nodeColor;

        this.getDatarecordProductBarcodeNoUpdatedListener();
    }

    getDatarecordProductBarcodeNoUpdatedListener() {
        this.orderProducts = [];
        this.bundleNo = '';
        this.productBarcodeNo = '';
        this.countQty = '';
        this.orderProduct = GBC.clrOrderProduction();
        if (this.datarecordProductBarcodeNoSub) { this.datarecordProductBarcodeNoSub.unsubscribe(); }
        this.datarecordProductBarcodeNoSub = this.nsService.getDatarecordProductBarcodeNoUpdatedListener().subscribe((data) => {
            // console.log(data);
            this.productBarcodeNo = data.productBarcodeNo;
            this.orderProduct = data.orderProduct;
            this.orderProducts = data.orderProducts;

            this.orderProducts.sort((a,b)=>{
                return  a.productBarcodeNoReal >b.productBarcodeNoReal?1:a.productBarcodeNoReal <b.productBarcodeNoReal?-1:0
            });

            if (this.orderProducts.length > 0) {
                this.productBarcode = this.orderProducts[0].productBarcodeNoReal.substr(0, 37);
                this.bundleNo = ''+this.orderProducts[0].bundleNo;
                this.countQty = ''+this.orderProducts.length;
            }
        });
    }

    getFactoryName(productionNode: ProductionNode): string {
        let factoryID = '';
        if (productionNode.isOutsource) {
            if (productionNode.outsourceData.length > 0) {
                factoryID = productionNode.outsourceData[0].factoryID ? productionNode.outsourceData[0].factoryID : '';
            }
        } else {
            factoryID = productionNode.factoryID ? productionNode.factoryID : '';
        }
        if (factoryID === '') {
            return '';
        }

        const factoryName = this.userService.getFactoryNameByFactoryID(factoryID);
        // console.log(factoryID , factoryName);
        return this.userService.strFirstAndDot(factoryName, 5)
        // return factoryName;
    }

    orderProductSelect(orderProduct1: OrderProduction) {
        this.orderProduct = orderProduct1;
        this.userService.setselectBundleLog(orderProduct1);
    }

    findNodeColor(nodeID: string) {
        const nodeColor1 = this.nodeColor.filter(i=>i.nodeID === nodeID);
        if (nodeColor1.length > 0) {
            return nodeColor1[0].color;
        }
        return '';
    }

    ngOnDestroy(): void {
        if (this.datarecordProductBarcodeNoSub) { this.datarecordProductBarcodeNoSub.unsubscribe(); }
        // if (this.repCurrentProductQtyCFNSub) { this.repCurrentProductQtyCFNSub.unsubscribe(); }

        // if (this.dataAroundAppSub) { this.dataAroundAppSub.unsubscribe(); }
        // if (this.errSub) { this.errSub.unsubscribe(); }
        // if (this.langSub) { this.langSub.unsubscribe(); }
        // if (this.langListSub) { this.langListSub.unsubscribe(); }
    }
}
