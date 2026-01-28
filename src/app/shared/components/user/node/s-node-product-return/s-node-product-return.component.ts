import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ConfirmationService, Message, MessageService } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import { Subscription } from 'rxjs';
import { Company, Factory } from 'src/app/models/app.model';
import { OrderProduction, ProductionNode } from 'src/app/models/order.model';
import { ProductionRepairCount } from 'src/app/models/report.model';
import { User } from 'src/app/models/user.model';
import { NodeFlow, NodeStation } from 'src/app/models/workstation.model';
import { NodeStationService } from 'src/app/services/node-station.service';
import { UserService } from 'src/app/services/user.service';
import { SNodeProductSelectProblemComponent } from '../s-node-product-select-problem/s-node-product-select-problem.component';
import { GBC } from 'src/app/global/const-global';

@Component({
    selector: 'app-s-node-product-return',
    templateUrl: './s-node-product-return.component.html',
    styleUrls: ['./s-node-product-return.component.scss'],
    providers: [ConfirmationService]
})
export class SNodeProductReturnComponent implements OnInit, OnDestroy {
    pageActive = 'production-return';
    @ViewChild('input1', {static: false}) scanInputBox!: ElementRef;
    @ViewChild('input2', {static: false}) scanInputBox2!: ElementRef;

    formActive = 'nodeProductReturn';
    formName = this.formActive;

    scan1ForAll = false;
    staff: User = GBC.clrUser();
    nodeStation: NodeStation = GBC.clrNodeStation();
    company: Company = GBC.clrCompany();
    factory: Factory = GBC.clrFactory();
    stationID = '';
    nodeFlows: NodeFlow[] = [];
    nodeFlow: NodeFlow = GBC.clrNodeFlow();
    toNode = '';
    sTypeOtus = ''; // ## b =bundle , 1= 1by 1 / sTypeOtus=scanType
    orderProduction: OrderProduction = GBC.clrOrderProduction();

    currentProductAllDetailCFN: any[] = [];
    productionProblemCount: ProductionRepairCount[] = [];
    // currentProductReturn: any[] = [];
    productBarcodeNoInput = '';
    productBarcodeNoInput2 = '';
    limit = 20;
    countProductionsReturn = 0;

    msgs: Message[] = [];

    private scanOrderProductionBarcodeNoSub: Subscription = new Subscription;
    private orderProductionProblemSub: Subscription = new Subscription;
    private getProblemProductCFNSub: Subscription = new Subscription;
    private orderProductionRepairedSub: Subscription = new Subscription;

    constructor(
        public dialogService: DialogService,
        public messageService: MessageService,
        private confirmationService: ConfirmationService,

        public userService: UserService,
        public nsService: NodeStationService,
    ) {}

    ngOnInit(): void {
        this.nsService.setMenuActive(this.pageActive);
        this.nsService.setDataAroundNodeApp('isOutsourceMode', false);

        this.staff = this.nsService.staff;
        this.nodeStation = this.nsService.nodeStation;
        this.company = this.userService.getCompany();
        this.factory = this.userService.getFactory();
        this.stationID = this.nsService.stationID;
        this.nodeFlows = this.nsService.nodeFlows;
        this.nodeFlow = this.nsService.nodeFlow;

        this.scan1ForAll = this.nodeStation.nodeInfo.scan1ForAll; // ## y= สแกน1ตัวแล้วดึงทั้งหมด

        // console.log(this.nsService.staff);
        // console.log(this.nodeFlows);
        // console.log(this.nodeFlow);
        this.getProblemProductCFN(1);
    }

    confirmProductRetuen() {
        this.confirmationService.confirm({
            message: 'Are you sure that you want to proceed?',
            header: 'Confirmation',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.set1ProductRepaired();
                this.msgs = [{severity:'info', summary:'Confirmed', detail:'You have accepted'}];
            },
            reject: () => {
                this.msgs = [{severity:'info', summary:'Rejected', detail:'You have rejected'}];
            }
        });
    }

    onDialogHide() {
        // console.log('onDialogHide()');
        this.productBarcodeNoInput2 = '';
        this.scanInputBox2.nativeElement.focus(); // ## input setfocus
        this.scanInputBox2.nativeElement.select();
    }


    getProblemProductCFN(page: number) {
        const productStatus = ['problem'];
        // getProblemProductCFN(companyID: string, factoryID: string, nodeID: string, productStatus: string[], page: number, limit: number)
        this.nsService.getProblemProductCFN(
            this.company.companyID, this.factory.factoryID, this.nodeStation.nodeID, productStatus, page, this.limit
        );
        if (this.getProblemProductCFNSub) { this.getProblemProductCFNSub.unsubscribe(); }
        this.getProblemProductCFNSub = this.nsService.getProblemProductCFNUpdatedListener().subscribe((data) => {
            // console.log(data);
            this.currentProductAllDetailCFN = data.currentProductAllDetailCFN;
            this.productionProblemCount = data.productionCount;
            if (this.productionProblemCount.length > 0) {
                this.countProductionsReturn = this.productionProblemCount[0].countProductQty;
            } else { this.countProductionsReturn = 0;}
            // this.countProductionsAll = data.countProductionsAll;

        });
    }

    getDatarecordProductBarcodeNo(mode: string) {
        const productBarcodeNoInput = mode==='sendtorepair'?this.productBarcodeNoInput:this.productBarcodeNoInput2;
        if (productBarcodeNoInput !== '') {
            this.putScanOrderProductionBarcodeNo(productBarcodeNoInput, mode);
        }
    }

    putScanOrderProductionBarcodeNo(productBarcodeNo: string, mode: string) {
        this.scanInputBox.nativeElement.focus(); // ## input setfocus
        this.scanInputBox.nativeElement.select();
        // putScanOrderProductionBarcodeNo(userID: string, companyID: string, factoryID: string,
        //                                  productBarcodeNo: string, nodeID: string, stationID: string)
        // console.log(productBarcodeNo);
        this.orderProduction = GBC.clrOrderProduction();
        this.nsService.putScanOrderProductionBarcodeNo(
            this.staff.userID, this.company.companyID, this.factory.factoryID, productBarcodeNo,
            this.nodeStation.nodeID, this.stationID, mode, false
        );
        if (this.scanOrderProductionBarcodeNoSub) { this.scanOrderProductionBarcodeNoSub.unsubscribe(); }
        this.scanOrderProductionBarcodeNoSub = this.nsService.getScanOrderProductionBarcodeNoUpdatedListener().subscribe((data) => {
            // console.log(data);
            this.orderProduction = data.orderProduction;
            if (data.success && data.mode === 'sendtorepair' && mode === data.mode) {
                // this.addOrderProductionBarcodeNoToTemp(data.orderProduction);
                this.showNodeProductionProblemModal();
            } else if (data.success && data.mode === 'backfromrepair' && mode === data.mode) {
                // console.log('backfromrepair');
                this.confirmProductRetuen();
            } else {
                // this.addOrderProductionBarcodeNoToTemp(data.orderProduction);
                this.productBarcodeNoInput = '';
                // const scanItem: ScanItem = {
                //     orderID: '',
                //     productBarcodeNundleCount: '',
                //     productID: '',
                //     bundleNo: 0,
                //     bundleCount: 0,
                //     productBarcodeNo: productBarcodeNo,
                //     status: 'err',
                //     serverCheckState: ''
                // };

                // // ## add to orderProductionScanAll
                // this.orderProductionScanAll.scanItem.unshift(scanItem); // ## add to position first
                // this.orderProductionScanAll.scanItem = this.orderProductionScanAll.scanItem.slice(0, this.scanLimit);

                this.messageService.add({
                    severity: 'error',
                    summary: 'Error [ ' + data.message.messageID + ' ]',
                    detail: data.message.value + ' [ '+data.message.mode+' ] ',
                    sticky: false,
                });
            }
        });
    }

    set1ProductProblem(toNode: string, problemID: string, problemName: string, isOutsource: boolean) {
        const productionNode: ProductionNode = {
            factoryID: this.factory.factoryID,
            fromNode: this.nodeStation.nodeID,
            toNode: toNode,
            datetime: new Date(),
            status: 'problem',
            info: '',
            sTypeOtus: this.sTypeOtus,
            problemID: problemID,
            problemName: problemName,
            isTracking: false,
            isOutsource: isOutsource,
            outsourceData: [],
            createBy: {
                userID: this.nsService.staff.userID,
                userName: this.nsService.staff.uInfo.userName
            }
        }
        this.putOrderProductionProblem(productionNode, 1);
    }

    putOrderProductionProblem(productionNode: ProductionNode, page: number) {
        // putOrderProductionProblem(
        //     companyID: string, factoryID: string, orderID: string, productID: string,
        //     productBarcodeNo: string, productionNode: ProductionNode
        // )
        // this.productBarcodeNoInput
        const productStatus = ['problem'];
        this.nsService.putOrderProductionProblem(
            this.company.companyID, this.factory.factoryID,
            this.orderProduction.orderID, this.orderProduction.productID, this.orderProduction.bundleID,
            this.productBarcodeNoInput, productionNode,
            productStatus, page, this.limit
        );
        if (this.orderProductionProblemSub) { this.orderProductionProblemSub.unsubscribe(); }
        this.orderProductionProblemSub = this.nsService.getOrderProductionProblemUpdatedListener().subscribe((data) => {
            // console.log(data);
            this.currentProductAllDetailCFN = data.currentProductAllDetailCFN;
            // this.currentProductAllDetailCFN = data.currentProductAllDetailCFN;
            // this.countProductionsAll = data.countProductionsAll;

        });
    }

    set1ProductRepaired() {
        const productionNode: ProductionNode = {
            factoryID: this.factory.factoryID,
            fromNode: '',
            toNode: this.nodeStation.nodeID,
            datetime: new Date(),
            status: 'normal',
            info: '',
            sTypeOtus: this.sTypeOtus,
            problemID: '',
            problemName: '',
            isTracking: false,
            isOutsource: false,
            outsourceData: [],
            createBy: {
                userID: this.nsService.staff.userID,
                userName: this.nsService.staff.uInfo.userName
            }
        }
        this.putOrderProductionRepaired(productionNode, 1);
    }

    putOrderProductionRepaired(productionNode: ProductionNode, page: number) {
        // putOrderProductionProblem(
        //     companyID: string, factoryID: string, orderID: string, productID: string,
        //     productBarcodeNo: string, productionNode: ProductionNode
        // )
        // this.productBarcodeNoInput
        const productStatus = ['problem'];
        this.nsService.putOrderProductionRepaired(
            this.company.companyID, this.factory.factoryID,
            this.orderProduction.orderID, this.orderProduction.productID, this.nodeStation.nodeID,
            this.orderProduction.bundleID,
            this.productBarcodeNoInput2, productionNode,
            productStatus, page, this.limit
        );
        if (this.orderProductionRepairedSub) { this.orderProductionRepairedSub.unsubscribe(); }
        this.orderProductionRepairedSub = this.nsService.getOrderProductionProblemUpdatedListener().subscribe((data) => {
            // console.log(data);
            this.currentProductAllDetailCFN = data.currentProductAllDetailCFN;
            // this.currentProductAllDetailCFN = data.currentProductAllDetailCFN;
            // this.countProductionsAll = data.countProductionsAll;
        });
    }

    paginate(event: any) {
        // console.log(event.rows, +event.page);
        this.limit = event.rows;
        this.getProblemProductCFN(+event.page + 1);

        //event.first = Index of the first record
        //event.rows = Number of rows to display in new page
        //event.page = Index of the new page
        //event.pageCount = Total number of pages
    }

    showNodeProductionProblemModal() {

        const ref = this.dialogService.open(SNodeProductSelectProblemComponent, {
            data: {
                id: 'selectNodeProductionProblem',
                companyID: this.userService.getCompany()?.companyID,
                productBarcodeNo: this.productBarcodeNoInput,
                callfrom: this.formName,  // ## send to nodejs for choose buckets
                nodeStation: this.nodeStation,
                nodeStations: this.nsService.nodeStations
            },
            header: 'Production Problem   ' + this.productBarcodeNoInput,
            width: '80%',
        });

        ref.onClose.subscribe((data: any) => {
            // console.log(data);
            if (data.selected) {
                const isOutsource = false;
                const toNode = data.nodeID;
                const problemID = data.nodeProblem.problemID;
                const problemName = data.nodeProblem.problemName;
                this.set1ProductProblem(toNode, problemID, problemName, isOutsource);
            }
            // if (car) {
            //     this.messageService.add({severity:'info', summary: 'Car Selected', detail:'Vin:' + car.vin});
            // }
        });
    }

    ngOnDestroy(): void {
        if (this.scanOrderProductionBarcodeNoSub) { this.scanOrderProductionBarcodeNoSub.unsubscribe(); }
        if (this.getProblemProductCFNSub) { this.getProblemProductCFNSub.unsubscribe(); }
        if (this.orderProductionRepairedSub) { this.orderProductionRepairedSub.unsubscribe(); }

        // if (this.errSub) { this.errSub.unsubscribe(); }
        // if (this.langSub) { this.langSub.unsubscribe(); }
        // if (this.langListSub) { this.langListSub.unsubscribe(); }
    }
}
