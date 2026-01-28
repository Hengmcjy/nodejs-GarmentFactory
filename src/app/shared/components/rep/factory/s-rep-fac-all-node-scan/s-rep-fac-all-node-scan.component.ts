import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { MessageService } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import { Subscription } from 'rxjs';
import { GBC } from 'src/app/global/const-global';
import { Company, DataTAbleFAcAllScanNode, DataTAbleFAcAllScanNodeNode, Factory, TargetPlaceS } from 'src/app/models/app.model';
import { MainZone } from 'src/app/models/order.model';
import { NodeScanProduct } from 'src/app/models/report.model';
import { FlowSeq, NodeFlow, NodeStation } from 'src/app/models/workstation.model';
import { NodeStationService } from 'src/app/services/node-station.service';
import { ReportService } from 'src/app/services/report.service';
import { UserService } from 'src/app/services/user.service';
import { SmdScannedProductComponent } from '../../../order/smd-scanned-product/smd-scanned-product.component';

@Component({
  selector: 'app-s-rep-fac-all-node-scan',
  templateUrl: './s-rep-fac-all-node-scan.component.html',
  styleUrls: ['./s-rep-fac-all-node-scan.component.scss']
})
export class SRepFacAllNodeScanComponent implements OnInit, OnDestroy {

    loading = false;
    isShowReport = false;
    stepNumber = 0;
    factories: Factory[] = [];

    reportHeader = 'Scan report';

    factoryIDs: string[] = [];
    orderIDs: string[] = [];
    company: Company = GBC.clrCompany();
    factory: Factory = GBC.clrFactory();
    nodeFlow: NodeFlow = GBC.clrNodeFlow();
    flowSeq: FlowSeq[] = [];
    nodeStations: NodeStation[] = [];
    targetPlaces: TargetPlaceS[] = [];
    mainZone: MainZone[] = [];

    factorySelects: Factory[] = [];

    date12: Date[] = [];
    date1 = '';
    date2 = '';
    dateFormat = 'dd/mm/yy';
    readonlyInput = true;
    dayDiff = -1; // ##  -1 not yet to select date / default

    nodeScanProductStyle: NodeScanProduct[] = [];
    nodeScanProductStyleZone: NodeScanProduct[] = [];
    nodeScanProductStyleZoneColorSize: NodeScanProduct[] = [];

    nodeScanProductStyle2: NodeScanProduct[] = [];
    nodeScanProductStyleZone2: NodeScanProduct[] = [];
    nodeScanProductStyleZoneColorSize2: NodeScanProduct[] = [];

    styles: string[] = [];

    dataTable1: DataTAbleFAcAllScanNode[] = [];
    dataTable2: DataTAbleFAcAllScanNode[] = [];
    dataT: DataTAbleFAcAllScanNode = GBC.clrDataTAbleFAcAllScanNode();

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
        this.factory = this.userService.getFactory();
        this.factories = this.userService.getFactories().filter(i=>i.fInfo.isOutsource == false);
        this.factories.sort((a,b)=>{ return a.factoryID >b.factoryID?1:a.factoryID <b.factoryID?-1:0});
        this.factorySelects = [...this.factories];
        this.factorySelects.sort((a,b)=>{ return a.factoryID >b.factoryID?1:a.factoryID <b.factoryID?-1:0});
        this.factoryIDs = this.userService.getFactoryIDArr(this.factories);
        this.orderIDs = this.userService.getOrderIDs(this.userService.getOrders());
        this.targetPlaces = this.userService.targetPlaces;
        this.mainZone = this.userService.getMainZoneTargetPlace(this.targetPlaces);
        this.getNodeFlow();

        // console.log(this.targetPlaces);
        // console.log(this.mainZone);
        // console.log(this.factoryIDs);

    }

    selectDate() {
        // this.rangeDates = [];
        this.isShowReport = true;
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
        this.loading = true;
        this.stepNumber = 1;
        const infoType = 'staffProduction'; // ##  infoType = call by who {staffOffice, 'staffProduction'}
        this.orderIDs = this.userService.getOrderIDs(this.userService.getOrders());
        // getRepNodeStaffScannedByDate12(
        //     companyID: string, factoryIDs: string[], orderIDs: string[], date12: Date[], infoType: string
        // )
        this.nsService.getRepNodeStaffScannedByDate12(
            this.company.companyID, this.factoryIDs, this.orderIDs, this.date12, infoType
        );
        if (this.repNodeStaffScannedByDate12Sub) { this.repNodeStaffScannedByDate12Sub.unsubscribe(); }
        this.repNodeStaffScannedByDate12Sub = this.nsService.getRepStaffScannedByDate12UpdatedListener().subscribe((data) => {
            // console.log(data);
            this.isShowReport = false;
            this.stepNumber = 2;
            this.nodeScanProductStyle = data.nodeScanProductStyle;
            this.nodeScanProductStyleZone = data.nodeScanProductStyleZone;
            this.nodeScanProductStyleZoneColorSize = data.nodeScanProductStyleZoneColorSize;
            this.getStylesList();

            this.nodeScanProductStyleZone.forEach( (item, index) => {
                item.targetPlace = this.userService.strReplaceAll(item.targetPlace, '-', '');
                item.targetPlaceSeq = this.userService.getTargetPlaceSeq1(this.userService.strReplaceAll(item.targetPlace, '-', ''));
                // targetPlaceSeq
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

            this.prepareData();

        });
    }

    prepareData() {
        this.stepNumber = 3;
        // console.log(this.factoryIDs);
        this.dataTable1 = [];
        this.dataTable2 = [];
        this.nodeScanProductStyle2 = [...this.nodeScanProductStyle];
        this.nodeScanProductStyleZone2 = [...this.nodeScanProductStyleZone];
        this.nodeScanProductStyleZoneColorSize2 = [...this.nodeScanProductStyleZoneColorSize];

        this.nodeScanProductStyle2.sort((a,b)=>{
            return a.companyID >b.companyID?1:a.companyID <b.companyID?-1:0
            || a.orderID >b.orderID?1:a.orderID <b.orderID?-1:0
            || a.fromNode >b.fromNode?1:a.fromNode <b.fromNode?-1:0
            || a.factoryID >b.factoryID?1:a.factoryID <b.factoryID?-1:0
        });
        this.nodeScanProductStyleZone2.sort((a,b)=>{
            return a.companyID >b.companyID?1:a.companyID <b.companyID?-1:0
            || a.orderID >b.orderID?1:a.orderID <b.orderID?-1:0
            || a.fromNode >b.fromNode?1:a.fromNode <b.fromNode?-1:0
            || a.factoryID >b.factoryID?1:a.factoryID <b.factoryID?-1:0
            || a.targetPlaceSeq >b.targetPlaceSeq?1:a.targetPlaceSeq <b.targetPlaceSeq?-1:0
        });
        // console.log(this.nodeScanProductStyle2);
        // console.log(this.nodeScanProductStyleZone2);

        const factoryIDs = this.userService.getFactoryIDArr(this.factorySelects);

        this.styles.forEach( (item, index) => {
            let dataT1: DataTAbleFAcAllScanNode = GBC.clrDataTAbleFAcAllScanNode();
            dataT1.orderID = item;
            let nodeIDs: DataTAbleFAcAllScanNodeNode[] = [];
            this.flowSeq.forEach( (item2, index2) => {
                let nodeID1: DataTAbleFAcAllScanNodeNode = GBC.clrDataTAbleFAcAllScanNodeNode();
                // let fData1: DataTAbleFAcAllScanNodeNode = GBC.clrDataTAbleFAcAllScanNodeNode();
                nodeID1 = {
                    nName: item2.nodeID,
                    nTotal: this.getFacTotalAll(factoryIDs, this.nodeScanProductStyle, item, item2.nodeID),
                    fData: this.getFacTotal(factoryIDs, this.nodeScanProductStyle, item, item2.nodeID)
                };
                nodeIDs.push(nodeID1);
                // dataT1[nodeX].nName = item2.nodeID;
                // dataT1[nodeX].nTotal = this.getFacTotalAll(this.factoryIDs, this.nodeScanProductStyle, item, item2.nodeID);
                // dataT1[nodeX].fData = this.getFacTotal(this.factoryIDs, this.nodeScanProductStyle, item, item2.nodeID);
            });
            dataT1.nodeIDs = nodeIDs;
            this.dataTable1.push(dataT1);
        });
        // console.log(this.dataTable1);
        this.loading = false;
    }


    getFacsNodeIDScannedStyleZone(factoryID: string, orderID: string, fromNode: string): any[] {
        const dataF =  this.nodeScanProductStyleZone2.filter(i=>(
            i.factoryID == factoryID &&
            i.orderID == orderID &&
            i.fromNode == fromNode
        ));
        dataF.sort((a,b)=>{
            return a.companyID >b.companyID?1:a.companyID <b.companyID?-1:0
            || a.orderID >b.orderID?1:a.orderID <b.orderID?-1:0
            || a.fromNode >b.fromNode?1:a.fromNode <b.fromNode?-1:0
            || a.factoryID >b.factoryID?1:a.factoryID <b.factoryID?-1:0
            || a.targetPlaceSeq >b.targetPlaceSeq?1:a.targetPlaceSeq <b.targetPlaceSeq?-1:0
        });
        return dataF;
    }

    getFacsNodeIDScannedStyle(orderID: string, fromNode: string): any[] {
        const dataTable1F =  this.dataTable1.filter(i=>(i.orderID == orderID));
        if (dataTable1F.length > 0) {
            const nodeIDs = [...dataTable1F[0].nodeIDs];
            const dataT2=  nodeIDs.filter(i=>(i.nName == fromNode));
            if (dataT2.length > 0) {
                return dataT2[0].fData;
            }
        }
        return [];
    }

    getFacAllNodeIDScannedStyle(orderID: string, fromNode: string) {
        const dataTable1F =  this.dataTable1.filter(i=>(i.orderID == orderID));
        if (dataTable1F.length > 0) {
            const nodeIDs = [...dataTable1F[0].nodeIDs];
            const dataT2=  nodeIDs.filter(i=>(i.nName == fromNode));
            if (dataT2.length > 0) {
                return dataT2[0].nTotal===0?'': dataT2[0].nTotal;
            }
        }

        // if (nodeScanProductStyleF.length > 0) {
        //     return nodeScanProductStyleF[0].countQty+'';
        // }
        return '';
    }

    getFacTotal(factoryIDs: string[], nodeScanProductStyleX: NodeScanProduct[], orderID: string, nodeID: string): any[] {
        let fData: any[] = [];
        const totalF = nodeScanProductStyleX.filter(i=>
            i.companyID === nodeScanProductStyleX[0].companyID
            && factoryIDs.some(i2 => i2 == i.factoryID)
            && i.orderID === orderID
            && i.fromNode === nodeID
        );
        factoryIDs.forEach( (item3, index) => {
            const f2 = totalF.filter(i=>i.factoryID === item3);
            if (f2.length > 0) {
                const data1 = {
                    factoryID: item3,
                    facName: this.userService.getUserfactoryName(this.factories, item3),
                    fTotalQty: f2.reduce((prev, cur) => {return prev + cur.countQty;}, 0)
                };
                fData.push(data1);
            }
        });
        // getUserfactoryName(factory: Factory[], factoryID: string)
        return fData;
    }

    getFacTotalAll(factoryIDs: string[], nodeScanProductStyleX: NodeScanProduct[], orderID: string, nodeID: string): number {
        const totalF = nodeScanProductStyleX.filter(i=>
            i.companyID === nodeScanProductStyleX[0].companyID
            && factoryIDs.some(i2 => i2 == i.factoryID)
            && i.orderID === orderID
            && i.fromNode === nodeID
        );
        const total = totalF.reduce((prev, cur) => {return prev + cur.countQty;}, 0);
        return total;
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

    selectFactory(factory1: Factory) {
        const idx = this.factorySelects.findIndex( i =>(i.factoryID === factory1.factoryID));
        if (idx >= 0) {
            this.factorySelects.splice(idx, 1);
        } else {
            this.factorySelects.push(factory1);
        }
        this.factorySelects.sort((a,b)=>{ return a.factoryID >b.factoryID?1:a.factoryID <b.factoryID?-1:0});
        // console.log(this.factorySelects);
        this.prepareData();
    }

    checkFactorySelect(factory1: Factory) {
        const facF = this.factorySelects.filter(i=>i.factoryID === factory1.factoryID);
        if (facF.length > 0) {
            // console.log('true');
            return true;
        } else {
            // console.log('false');
            return false;
        }
    }

    ngOnDestroy(): void {
        if (this.nodeFlowSub) { this.nodeFlowSub.unsubscribe(); }
        if (this.repNodeStaffScannedByDate12Sub) { this.repNodeStaffScannedByDate12Sub.unsubscribe(); }
        // if (this.repCurrentProductQtyAllCFNodeSub) { this.repCurrentProductQtyAllCFNodeSub.unsubscribe(); }

        // if (this.langSub) { this.langSub.unsubscribe(); }
        // if (this.dataAroundAppSub) { this.dataAroundAppSub.unsubscribe(); }
    }
}

