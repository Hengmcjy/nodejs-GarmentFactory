import { AfterViewInit, Component, ElementRef, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Subscription } from 'rxjs';
import { GBC } from 'src/app/global/const-global';

import { Company, Factory } from 'src/app/models/app.model';
import { LostGroup, OPDLost, Order, OrderProduction, ProductionNode } from 'src/app/models/order.model';

import { NodeStationService } from 'src/app/services/node-station.service';
import { UserService } from 'src/app/services/user.service';

@Component({
    selector: 'app-s-node-product-record',
    templateUrl: './s-node-product-record.component.html',
    styleUrls: ['./s-node-product-record.component.scss'],
})
export class SNodeProductRecordComponent implements OnInit, OnDestroy, AfterViewInit {
    @ViewChild('input1', {static: false}) scanInputBox!: ElementRef;
    @Input() productBarcodeNoInput = '';
    @Input() mode = '';  // ## 'set-lost'

    data: any;

    company: Company = GBC.clrCompany();
    factory: Factory = GBC.clrFactory();
    orderProduct: OrderProduction = GBC.clrOrderProduction();

    order: Order = GBC.clrOrder();
    opdLosts: OPDLost[] = [];
    lostGroups: LostGroup[] = [];
    productBarcodeNo = '';


    private datarecordProductBarcodeNoSub: Subscription = new Subscription;

    constructor(
        public config: DynamicDialogConfig,
        public ref: DynamicDialogRef,

        public userService: UserService,
        public nsService: NodeStationService,
    ) {}

    ngOnInit(): void {
        this.data = this.config.data;
        // console.log(this.data);
        this.mode = this.data.mode;
        this.order = this.data.order?this.data.order:GBC.clrOrder();
        this.opdLosts = this.userService.getOPDLosts();
        this.lostGroups = this.userService.getLostGroups();
        // console.log(this.order);
        // console.log(this.opdLosts);
        // console.log(this.lostGroups);

        this.company = this.userService.getCompany();
        this.factory = this.userService.getFactory();
        if (this.productBarcodeNoInput==='') {this.productBarcodeNoInput = this.userService.productBarcodeNoInput;}

        // this.productBarcodeNoInput = '';
        if (this.productBarcodeNoInput === '') {
            this.productBarcodeNoInput = this.userService.productBarcodeNoInput;
        }
    }

    ngAfterViewInit(): void {
        this.scanInputBox.nativeElement.focus(); // ## input setfocus
        this.scanInputBox.nativeElement.select();
    }

    getDatarecordProductBarcodeNo() {
        this.productBarcodeNo = '';
        this.orderProduct = GBC.clrOrderProduction();
        this.nsService.getDatarecordProductBarcodeNo(this.company.companyID, this.factory.factoryID, this.productBarcodeNoInput);
        if (this.datarecordProductBarcodeNoSub) { this.datarecordProductBarcodeNoSub.unsubscribe(); }
        this.datarecordProductBarcodeNoSub = this.nsService.getDatarecordProductBarcodeNoUpdatedListener().subscribe((data) => {
            // console.log(data);
            this.orderProduct = data.orderProduct;
            this.userService.setOrderProduction(this.orderProduct);

            // console.log(this.orderProduct);
            const productionNode: ProductionNode[] = this.orderProduct.productionNode;
            const productionNodeF = productionNode.filter(i=>i.status !== 'fake');
            this.orderProduct.productionNode = productionNodeF;

            this.productBarcodeNo = this.productBarcodeNoInput;

            this.scanInputBox.nativeElement.focus(); // ## input setfocus
            this.scanInputBox.nativeElement.select();

            // this.showDataReport(data.repDataFormat1, data.repListNameArr);
        });
    }

    getFactoryNameX(factoryID: string): string {
        // if (factoryID === '') {
        //     return '';
        // }
        const factoryName = this.userService.getFactoryNameByFactoryID(factoryID);
        // console.log(factoryID , factoryName);
        return this.userService.strFirstAndDot(factoryName, 5)
        // return factoryName;
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

    checkToNode(productionNode: ProductionNode, idx: number): string {
        let result = '';
        result = productionNode.status === 'problem' ? 'font-italic text-red-700' : ''
        // result = result + ' ';

        // bg-yellow-100
        if (this.orderProduct.productionNode.length === +idx + 1) {
            result = result + ' bg-yellow-100';
        }
        return result;
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
