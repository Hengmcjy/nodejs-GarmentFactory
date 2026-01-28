import { AfterViewInit, Component, ElementRef, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Subscription } from 'rxjs';
import { GBC } from 'src/app/global/const-global';
import { Company, Factory } from 'src/app/models/app.model';
import { LostGroup, OPDLost, Order, OrderProduction, ProductionNode } from 'src/app/models/order.model';
import { NodeStationService } from 'src/app/services/node-station.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-smd-product-bundle-record',
  templateUrl: './smd-product-bundle-record.component.html',
  styleUrls: ['./smd-product-bundle-record.component.scss']
})
export class SmdProductBundleRecordComponent implements OnInit, OnDestroy, AfterViewInit {

    @ViewChild('input1', {static: false}) scanInputBox!: ElementRef;
    @Input() productBarcodeNoInput = '';
    @Input() mode = '';  // ## 'set-lost'

    data: any;

    company: Company = GBC.clrCompany();
    factory: Factory = GBC.clrFactory();
    orderProduct: OrderProduction = GBC.clrOrderProduction();
    orderProducts: OrderProduction[] = [];

    order: Order = GBC.clrOrder();
    opdLosts: OPDLost[] = [];
    lostGroups: LostGroup[] = [];
    productBarcodeNo = '';

    private selectBundleSub: Subscription = new Subscription;
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

        this.getSelectBundleLogListener();
    }

    ngAfterViewInit(): void {
        this.scanInputBox.nativeElement.focus(); // ## input setfocus
        this.scanInputBox.nativeElement.select();
    }

    getDatarecordProductBarcodeNo() {
        this.productBarcodeNo = '';
        this.orderProduct = GBC.clrOrderProduction();
        this.orderProducts = [];
        this.nsService.getDatarecordProductBarcodeNo(this.company.companyID, this.factory.factoryID, this.productBarcodeNoInput);
        if (this.datarecordProductBarcodeNoSub) { this.datarecordProductBarcodeNoSub.unsubscribe(); }
        this.datarecordProductBarcodeNoSub = this.nsService.getDatarecordProductBarcodeNoUpdatedListener().subscribe((data) => {
            // console.log(data);
            this.orderProduct = data.orderProduct;
            this.orderProducts = data.orderProducts;
            this.userService.setOrderProduction(this.orderProduct);
            // console.log(this.orderProduct);

            this.orderProducts.sort((a,b)=>{
                return  a.productBarcodeNoReal >b.productBarcodeNoReal?1:a.productBarcodeNoReal <b.productBarcodeNoReal?-1:0
            });

            this.productBarcodeNo = this.productBarcodeNoInput;

            this.scanInputBox.nativeElement.focus(); // ## input setfocus
            this.scanInputBox.nativeElement.select();

            // this.showDataReport(data.repDataFormat1, data.repListNameArr);

            const productionNode: ProductionNode[] = this.orderProduct.productionNode;
            const productionNodeF = productionNode.filter(i=>i.status !== 'fake');
            this.orderProduct.productionNode = productionNodeF;


            this.orderProducts.forEach( (item, index) => {
                const productionNode: ProductionNode[] = item.productionNode;
                const productionNodeF = productionNode.filter(i=>i.status !== 'fake');
                item.productionNode = productionNodeF;
            });

        });
    }

    getSelectBundleLogListener() {
        if (this.selectBundleSub) { this.selectBundleSub.unsubscribe(); }
        this.selectBundleSub = this.userService.getselectBundleLogListener().subscribe((data) => {
            // console.log(data);
            this.orderProduct = data.orderProduct;
            this.userService.setOrderProduction(this.orderProduct);

            this.scanInputBox.nativeElement.focus(); // ## input setfocus
            this.scanInputBox.nativeElement.select();
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
        if (this.selectBundleSub) { this.selectBundleSub.unsubscribe(); }

        // if (this.dataAroundAppSub) { this.dataAroundAppSub.unsubscribe(); }
        // if (this.errSub) { this.errSub.unsubscribe(); }
        // if (this.langSub) { this.langSub.unsubscribe(); }
        // if (this.langListSub) { this.langListSub.unsubscribe(); }
    }
}
