import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { MessageService } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import { Subscription } from 'rxjs';
import { GBC } from 'src/app/global/const-global';
import { Company, Factory, TargetPlaceS } from 'src/app/models/app.model';
import { MainZone } from 'src/app/models/order.model';
import { NodeScanProduct } from 'src/app/models/report.model';
import { FlowSeq, NodeFlow, NodeStation } from 'src/app/models/workstation.model';
import { NodeStationService } from 'src/app/services/node-station.service';
import { ReportService } from 'src/app/services/report.service';
import { UserService } from 'src/app/services/user.service';
import { SmdScannedProductComponent } from '../../../order/smd-scanned-product/smd-scanned-product.component';

@Component({
    selector: 'app-s-rep-fac-node-scan',
    templateUrl: './s-rep-fac-node-scan.component.html',
    styleUrls: ['./s-rep-fac-node-scan.component.scss'],
    providers: [DialogService, MessageService],
})
export class SRepFacNodeScanComponent implements OnInit, OnDestroy {
    @Input() factory: Factory = GBC.clrFactory();
    @Input() callFrom: string = ''; // ## nodeID  , 'staff-office'

    reportHeader = 'Scan report';
    loading = false;

    factoryIDs: string[] = [];
    orderIDs: string[] = [];
    company: Company = GBC.clrCompany();
    nodeFlow: NodeFlow = GBC.clrNodeFlow();
    flowSeq: FlowSeq[] = [];
    nodeStations: NodeStation[] = [];
    targetPlaces: TargetPlaceS[] = [];
    mainZone: MainZone[] = [];

    date12: Date[] = [];
    date1 = '';
    date2 = '';
    dateFormat = 'dd/mm/yy';
    readonlyInput = true;
    dayDiff = -1; // ##  -1 not yet to select date / default

    nodeScanProductStyle: NodeScanProduct[] = [];
    nodeScanProductStyleZone: NodeScanProduct[] = [];
    nodeScanProductStyleZoneColorSize: NodeScanProduct[] = [];

    styles: string[] = [];

    isShowReport = false;


    private nodeFlowSub: Subscription = new Subscription;
    private repNodeStaffScannedByDate12Sub: Subscription = new Subscription;


    constructor(
        public dialogService: DialogService,
        public messageService: MessageService,

        public userService: UserService,
        public nsService: NodeStationService,
        private repService: ReportService,
    ) {}

    ngOnInit(): void {
        // console.log('SRepFacNodeScanComponent');
        this.company = this.userService.getCompany();
        this.factoryIDs = this.userService.getFactoryIDArr([this.factory]);
        this.orderIDs = this.userService.getOrderIDs(this.userService.getOrders());
        this.targetPlaces = this.userService.targetPlaces;
        this.mainZone = this.userService.getMainZoneTargetPlace(this.targetPlaces);
        this.getNodeFlow();

        // console.log(this.targetPlaces);
        // console.log(this.mainZone);

    }

    selectDate() {
        this.isShowReport = true;
        // this.rangeDates = [];
        this.dayDiff = -1; // ##  -1 not yet to select date / default
        if (this.date12.length === 2) {
            if (!this.date12[1]) {
                // console.log('this.rangeDates[1] is null');
                this.date12[1] = this.date12[0];
            }
        }
        // let difference = Math.ceil((this.rangeDates[1].getTime() - this.rangeDates[0].getTime() ) /  (1000 * 60 * 60 * 24));
        this.dayDiff = this.userService.getDayDifferent(this.date12[1], this.date12[0]);
        // console.log(this.date12);
        this.date1 = this.userService.returnDateDDMMYYYYHHMMSign(this.date12[0], '/')
        this.date2 = this.userService.returnDateDDMMYYYYHHMMSign(this.date12[1], '/')
        // console.log(this.dayDiff);
        this.getRepNodeStaffScannedByDate12();
    }

    getNodeFlow() {
        // getNodeFlow(companyID: string, factoryID: string, nodeFlowID: string)
        // getNodeFlowUpdatedListener()
        this.nodeFlow = GBC.clrNodeFlow();
        this.flowSeq = [];
        this.nodeStations = [];
        const nodeFlowID = 'main';
        this.nsService.stfGetNodeFlow(this.company.companyID, this.factory.factoryID, nodeFlowID);
        if (this.nodeFlowSub) { this.nodeFlowSub.unsubscribe(); }
        this.nodeFlowSub = this.nsService.getNodeFlowUpdatedListener().subscribe((data) => {
            // console.log(data);
            this.nodeFlow = data.nodeFlow;
            this.flowSeq = this.nodeFlow.flowSeq;
            this.nodeStations = data.nodeStations;
            // getNodeStationName(nodeStations: NodeStation[], nodeID: string)
            // console.log(this.nodeFlow);
            // console.log(this.flowSeq);
            // console.log(this.nodeStations);

            this.flowSeq.sort((a,b)=>{
                return a.seqNo >b.seqNo?1:a.seqNo <b.seqNo?-1:0
            });
        });
    }

    getRepNodeStaffScannedByDate12() {
        this.isShowReport = true;
        this.loading = true;
        const infoType = 'staffProduction'; // ##  infoType = call by who {staffOffice, 'staffProduction'}
        // getRepNodeStaffScannedByDate12(
        //     companyID: string, factoryIDs: string[], orderIDs: string[], date12: Date[], infoType: string
        // )
        this.nsService.getRepNodeStaffScannedByDate12(
            this.company.companyID, this.factoryIDs, this.orderIDs, this.date12, infoType
        );
        if (this.repNodeStaffScannedByDate12Sub) { this.repNodeStaffScannedByDate12Sub.unsubscribe(); }
        this.repNodeStaffScannedByDate12Sub = this.nsService.getRepStaffScannedByDate12UpdatedListener().subscribe((data) => {
            // console.log(data);
            this.nodeScanProductStyle = data.nodeScanProductStyle;
            this.nodeScanProductStyleZone = data.nodeScanProductStyleZone;
            this.nodeScanProductStyleZoneColorSize = data.nodeScanProductStyleZoneColorSize;
            this.getStylesList();

            this.nodeScanProductStyleZone.forEach( (item, index) => {
                item.targetPlace = this.userService.strReplaceAll(item.targetPlace, '-', '');
                // item.size = this.userService.strReplaceAll(item.size, '-', '');
                // item.color = this.userService.strReplaceAll(item.color, '-', '');
            });

            this.nodeScanProductStyleZoneColorSize.forEach( (item, index) => {
                item.targetPlace = this.userService.strReplaceAll(item.targetPlace, '-', '');
                item.size = this.userService.strReplaceAll(item.size, '-', '');
                item.color = this.userService.strReplaceAll(item.color, '-', '');
            });

            // console.log(this.nodeScanProductStyle);
            // console.log(this.nodeScanProductStyleZone);
            // console.log(this.nodeScanProductStyleZoneColorSize);

            this.loading = false;
            this.isShowReport = false;
        });
    }

    getStylesList() {
        this.styles = [];
        this.nodeScanProductStyle.forEach( (item, index) => {
            // const nodeScanProductStyleF = this.styles.find
            // const idx = this.styles.findIndex(i=>(i === item.orderID));
            if (!this.styles.some(i => i == item.orderID)) {
                this.styles.push(item.orderID);
            }
        });
        this.styles.sort();
        // console.log(this.styles);
    }

    getNodeIDScannedStyle(orderID: string, fromNode: string) {
        const nodeScanProductStyleF =  this.nodeScanProductStyle.filter(i=>(
            i.companyID == this.company.companyID && i.factoryID == this.factory.factoryID &&
            i.orderID == orderID && i.fromNode == fromNode
        ));
        if (nodeScanProductStyleF.length > 0) {
            return nodeScanProductStyleF[0].countQty+'';
        }
        return '';
    }

    getNodeIDScannedStyleZone(orderID: string, fromNode: string, targetPlace: string ) {
        const nodeScanProductStyleZoneF =  this.nodeScanProductStyleZone.filter(i=>(
            i.companyID == this.company.companyID && i.factoryID == this.factory.factoryID &&
            i.orderID == orderID && i.fromNode == fromNode && i.targetPlace == targetPlace
        ));
        if (nodeScanProductStyleZoneF.length > 0) {
            // const targetPlaceL = this.userService.setAddStrLen(targetPlace, 4, ' ') + ': ';
            return nodeScanProductStyleZoneF[0].countQty+'';
        }
        return '';
    }

    getZoneName(targetPlace: string) {
        const targetPlaceL = this.userService.setAddStrLen(targetPlace, 4, ' ') + ' : ';
        return targetPlaceL;
    }

    showSMDScannedProduct(fromNode: string, style: string, zone: string) {
        let zoneTxtArr = [zone];
        if (zone === 'all') {
            zoneTxtArr = this.userService.getMainZoneTxtArr(this.mainZone);
        }
        const ref = this.dialogService.open(SmdScannedProductComponent, {
            data: {
                id: 'showScannedProductList',
                // mode: 'getQRListCFTNszcs', // ## mode = 'getQRListCFTNszcs'  CFTN = companyID factoryID (toNode) nodeID , szcs= style zone color size
                mode: 'getScannedProductCFFNsz', // ## mode = 'getScannedProductCFFNsz'  CFTN = companyID factoryID (fromNode) nodeID , sz= style zone
                page: 1,
                limit: 20,
                companyID: this.company.companyID,
                factoryID: this.factory.factoryID,
                nodeID: fromNode,  // ## fromNode
                style: style,
                mainZone: this.mainZone,
                zoneTxtArr: zoneTxtArr,
                infoType: 'staffProduction',  // ##  infoType = call by who {staffOffice, 'staffProduction'}
                date12: this.date12,
                // color: color,
                // size: size,



            },
            header: 'Scanned product',
            width: '80%'
        });

        ref.onClose.subscribe((data: any) => {
            // console.log(data);

        });
    }

    ngOnDestroy(): void {
        if (this.nodeFlowSub) { this.nodeFlowSub.unsubscribe(); }
        if (this.repNodeStaffScannedByDate12Sub) { this.repNodeStaffScannedByDate12Sub.unsubscribe(); }
        // if (this.repCurrentProductQtyAllCFNodeSub) { this.repCurrentProductQtyAllCFNodeSub.unsubscribe(); }

        // if (this.langSub) { this.langSub.unsubscribe(); }
        // if (this.dataAroundAppSub) { this.dataAroundAppSub.unsubscribe(); }
    }
}
