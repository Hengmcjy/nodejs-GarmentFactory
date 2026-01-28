import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { MessageService } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import { Subscription } from 'rxjs';
import { GBC } from 'src/app/global/const-global';
import { ColorS, Company, Factory, SizeS, TargetPlaceS } from 'src/app/models/app.model';
import { MainZone } from 'src/app/models/order.model';
import { FlowSeq, NodeFlow, NodeStation } from 'src/app/models/workstation.model';
import { NodeStationService } from 'src/app/services/node-station.service';
import { ReportService } from 'src/app/services/report.service';
import { UserService } from 'src/app/services/user.service';
import { SmdSelectNodestationComponent } from '../../../general/smd-select-nodestation/smd-select-nodestation.component';
import { User } from 'src/app/models/user.model';
import { OrderService } from 'src/app/services/order.service';

@Component({
  selector: 'app-s-rep-fac-node-bundle',
  templateUrl: './s-rep-fac-node-bundle.component.html',
  styleUrls: ['./s-rep-fac-node-bundle.component.scss']
})
export class SRepFacNodeBundleComponent implements OnInit, OnDestroy  {
    @Input() factory: Factory = GBC.clrFactory();
    @Input() nodeID: string = ''; // ## nodeID
    @Input() callFrom: string = ''; // ## nodeID
    @Input() option: any = {};

    reportHeader = 'Node Station bunble information';


    seasonYear = '';
    nodeIDSelected = '';
    factoryIDs: string[] = [];
    orderIDs: string[] = [];
    orderIDSelected: string[] = [];
    orderIDsNoScan: string[] = [];
    company: Company = GBC.clrCompany();
    targetPlaces: TargetPlaceS[] = [];
    mainZone: MainZone[] = [];
    nodeStations: NodeStation[] = [];
    nodeFlow: NodeFlow = GBC.clrNodeFlow();
    flowSeq: FlowSeq[] = [];

    sizes: SizeS[] = [];
    colors: ColorS[] = [];

    currentAllProductQtyStyleGroup: any[] = [];
    currentAllProductNodeQtyStyleGroup: any[] = [];
    // currentProductionZonePeriodGroup2: any[] = [];
    bundleNoGroup: any[] = [];

    mainDataBundleNoScan: any[] = [];
    dataBundleNoScan: any[] = []; // ## detail

    selectedTabStyleIndex = 0;
    selectedTabZoneIndex = 0;
    selectedTabColorIndex = 0;
    selectedTabSizeIndex = 0;

    headerTabZone = 'zone';
    headerTabZoneColor = 'zone color';
    headerTabZoneColorSize = 'zone color size';

    // tabDataStyle: any[] = [];
    tabDataStyleZone: any[] = [];
    tabDataStyleZoneColor: any[] = [];
    tabDataStyleZoneColorSize: any[] = [];
    firstTabData: any;

    bundleQty = 12; //
    page = 1;
    limit = 50;
    BundlesCount = 0;
    orderIDF: string[] = [];
    zoneF = '';
    colorF = '';
    sizeF = '';

    // ## edit qc -> complete
    nodeIDEdit = '7.QC';  // ## fix nodeID  1.KNITTING 2.PANAL-INSPECTION 3.LINKING 4.MENDING
    nodeSettoCompleted = '7.QC';

    isAdmin: boolean = false;
    user: User = GBC.clrUser();
    userID: string = '';

    visibleQCToCompletedBtn: boolean = false;
    visibleQCToCompleted: boolean = false;
    position: string = 'top-left';

    private dataAroundAppSub: Subscription = new Subscription;
    private nodeFlowSub: Subscription = new Subscription;
    private repNodeNoScanSub: Subscription = new Subscription;
    private repNodeNoScanDetailSub: Subscription = new Subscription;
    private qctoCompleteSub: Subscription = new Subscription;

    constructor(
        public dialogService: DialogService,
        public messageService: MessageService,

        public userService: UserService,
        private orderService: OrderService,
        public nsService: NodeStationService,
        private repService: ReportService,
    ) {}

    ngOnInit(): void {
        if (this.option && this.option.state === 'scan-qctocomplete') {
            // console.log(this.option.state);
            // console.log(this.factory);
        }

        // ## get auth btn for node-bundle-remain-set-qc-complete
        this.isAdmin = this.userService.isAdmin();
        this.user = this.userService.getUser();
        this.userID = this.user.userID;
        this.visibleQCToCompletedBtn =
            this.isAdmin || this.userService.getMenuAutor(this.userID, 'node-bundle-remain-set-qc-complete', 'normal');

        // this.reportHeader = this.userService.translateCode('hd', 'hd-nodestation-production');
        this.bundleQty = this.userService.bundleQty;  // ## get standard qty of bundle
        this.nodeIDSelected  = this.nodeID;
        this.checkCurrentNodeID(this.nodeIDSelected);
        this.company = this.userService.getCompany();
        this.targetPlaces = this.userService.targetPlaces;
        this.mainZone = this.userService.getMainZoneTargetPlace(this.targetPlaces);
        this.sizes = this.userService.sizes;
        this.colors = this.userService.colors;
        this.orderIDs = this.userService.getOrderIDs(this.userService.getOrders()).sort();
        this.orderIDSelected = this.orderIDs.length > 0 ? [this.orderIDs[0]] : [];
        this.seasonYear = this.userService.seasonYear;
        this.nodeStations = this.nsService.nodeStations;
        this.nodeStations.sort((a,b)=>{ return a.nodeID >b.nodeID?1:a.nodeID <b.nodeID?-1:0 });

        // console.log(this.nodeStations);
        // console.log(this.targetPlaces);
        // console.log(this.mainZone);
        // console.log(this.orderIDs);
        // console.log(this.seasonYear);

        // ## get DataAroundApp
        this.dataAroundAppSub = this.userService.getDataAroundAppStatusListener().subscribe((dataAroundApp) => {
            // ## season year
            // console.log(this.userService.seasonYear);
            this.orderIDs = this.userService.getOrderIDs(this.userService.getOrders()).sort();
            if (this.seasonYear !== this.userService.seasonYear) {
                this.seasonYear = this.userService.seasonYear;
                this.getRepNodeNoScan(this.orderIDs, this.nodeIDSelected , ['mainData', 'detailData']); // ## ['mainData', 'detailData']
                // console.log(this.orderIDs);
                // console.log(this.seasonYear);
            }
        });

        // console.log(this.userService.getOrders());
        // console.log('SRepFacNodeBundleComponent');
        // console.log(this.callFrom);
        // this.lastColor = '';
        // this.getSelectFactoryUpdatedListener();
        // console.log(this.nodeIDSelected);

        this.factoryIDs = this.userService.getFactoryIDArr([this.factory]);
        // this.getRepCurrentProductQtyAllCFNode();
        this.getRepNodeNoScan(this.orderIDs, this.nodeIDSelected , ['mainData', 'detailData']); // ## ['mainData', 'detailData']
        this.getOrderQCtoCompleteListener();
    }

    getQCSettoCompletedListener() {
        this.visibleQCToCompleted=!this.visibleQCToCompleted;
        const state = this.visibleQCToCompleted?'openModal':'closeModal';
        const data: any = {
            factory: this.factory,
            state
        };
        this.userService.setQCListsListenerToNext(data);
    }

    getOrderQCtoCompleteListener() {
        if (this.qctoCompleteSub) { this.qctoCompleteSub.unsubscribe(); }
        this.qctoCompleteSub = this.orderService.getOrderQCtoCompleteListener().subscribe((data: any) => {
            // console.log( data);
            this.visibleQCToCompleted = false;
        });
    }

    addQRCode(orId: any, zoneA: any, colorA: any, sizeA: any, proD: any) {
        // console.log(orId, zoneA, colorA, proD);
        // console.log(this.bundleNoGroup);
        // const currentNodeID = '';
        const toNode = proD.toNode;
        if (toNode === this.nodeSettoCompleted && this.visibleQCToCompleted) {;
            const qrCode = '' + proD.productBarcode + proD.no;
            // console.log(qrCode);
            const data: any = {
                orId, zoneA, colorA, proD, sizeA,
                qrCode
            };
            this.userService.setQCSettoCompletedListenerToNext(data);
        }

    }

    async getRepNodeNoScan(orderIDs: string[], nodeID: string, infoTypes: string[]) {
        this.orderIDsNoScan = [];
        // this.tabDataStyle = [];
        this.tabDataStyleZone = [];
        this.tabDataStyleZoneColor = [];
        this.tabDataStyleZoneColorSize = [];

        this.firstTabData = {};
        // console.log(this.company.companyID,[this.factory.factoryID],orderIDs,nodeID,infoTypes);
        this.nsService.getRepNodeNoScan(
            this.company.companyID,
            [this.factory.factoryID],
            orderIDs,
            nodeID,
            infoTypes
        );
        if (this.repNodeNoScanSub) { this.repNodeNoScanSub.unsubscribe(); }
        this.repNodeNoScanSub = this.nsService.getRepNodeNoScanListener().subscribe((data) => {
            // console.log(data)
            this.mainDataBundleNoScan = data.mainDataBundleNoScan; // this
            // console.log(this.mainDataBundleNoScan)

            this.mainDataBundleNoScan.forEach( (item, index) => {
                item.size = this.userService.strReplaceAll(item.size, '-', '');
                item.color = this.userService.strReplaceAll(item.color, '-', '');
                item.targetPlace = this.userService.strReplaceAll(item.targetPlace, '-', '');
                item.targetPlaceSeq = this.userService.getTargetPlaceSeq1(item.targetPlace);
            });
            this.mainDataBundleNoScan = this.repService.setSizeSeqG(this.sizes, this.mainDataBundleNoScan);
            this.mainDataBundleNoScan = this.repService.setColorSeqG(this.colors, this.mainDataBundleNoScan);
            this.mainDataBundleNoScan.forEach( (item, index) => {
                item.colorName = this.userService.getColorNameByColorCode(item.color, this.userService.getSetNameColorByOrderID(item.orderID));
                item.colorCode = this.userService.getCodeColorNameByColorCode(item.color, this.userService.getSetNameColorByOrderID(item.orderID));
            });
            this.mainDataBundleNoScan.forEach( (item, index) => {
                item.colorTabName = item.colorCode + '-' + this.userService.strFirstAndDot(item.colorName, 10);

            });
            // console.log(this.mainDataBundleNoScan);

            // ## get only orderID and sort
            this.orderIDsNoScan = Array.from(new Set(this.mainDataBundleNoScan.map((item: any) => item.orderID))).sort();
            if (this.orderIDsNoScan.length > 0) {
                this.firstTabData = {
                    first: true, // ## start for rendering data
                    orderID: this.orderIDsNoScan[0]
                };
            }
            // console.log(this.orderIDsNoScan);
        });


    }

    async getRepNodeNoScanDatail(orderIDs: string[], nodeID: string,
        targetPlaceID: string, color: string, size: string,
        infoTypes: string[], page: number, limit: number) {
        // async getRepNodeNoScanDatail(
        //     companyID: string, factoryIDs: string[], orderIDs: string[], nodeID: string,
        //     targetPlaceID: string, color: string, size: string,
        //     infoTypes: string[]
        // )
        this.dataBundleNoScan = [];
        this.bundleNoGroup = [];
        this.nsService.getRepNodeNoScanDatail(
            this.company.companyID,
            [this.factory.factoryID],
            orderIDs,
            nodeID,
            targetPlaceID,
            color,
            size,
            infoTypes,
            page,
            limit
        );
        if (this.repNodeNoScanDetailSub) { this.repNodeNoScanDetailSub.unsubscribe(); }
        this.repNodeNoScanDetailSub = this.nsService.getRepNodeNoScanDetailListener().subscribe((data) => {
            // console.log(data);
            // ## group by style-zone
            // currentProductionZonePeriodGroup  group by style-zone
            this.bundleNoGroup = this.userService.groupBy(data.mainDataBundleNoScanNo, (c: any) => c.bundleNo);
            this.bundleNoGroup = Object.values(this.bundleNoGroup);
            // console.log(this.bundleNoGroup);

            const bundleNoGroupOld = [...this.bundleNoGroup];
            let tempBundle1: number[] = [];
            this.bundleNoGroup.forEach( (item, index) => {
                if (item.length < this.bundleQty) {  // ## this.bundleQty = 12
                    tempBundle1.push(index);
                }
            });
            tempBundle1.forEach( (item, index) => {
                this.bundleNoGroup.splice(item, 1);
            });
            tempBundle1.forEach( (item, index) => {
                this.bundleNoGroup.unshift(bundleNoGroupOld[item]);
            });

            // console.log(this.bundleNoGroup);
            // this.bundleQty
        });
    }

    currentOrderIDZone(orderID: string): any[] {
        const mainDataBundleNoScan2 = [...this.mainDataBundleNoScan];
        let orderIDData1 = mainDataBundleNoScan2.filter(i=>i.orderID == orderID);
        orderIDData1.sort((a,b)=>{
            return a.targetPlaceSeq >b.targetPlaceSeq?1:a.targetPlaceSeq <b.targetPlaceSeq?-1:0
        });
        const zone1 = Array.from(new Set(orderIDData1.map((item: any) => item.targetPlace)));
        // console.log(orderID, zone1);

        // ## find first tab data
        if (this.firstTabData.first && zone1.length > 0) {
            this.firstTabData.zone = zone1[0];
        }

        // ## check & add style zone data -->  this.tabDataStyle = [];
        // this.tabDataStyle = [];

        // ## check & add style data -->  this.tabDataStyle = [];
        // this.tabDataStyle = [];
        const idx = this.tabDataStyleZone.findIndex( fi =>(
            fi.orderID == orderID
        ));
        if (idx < 0) { // ## add new element data
            this.tabDataStyleZone.push({
                orderID: orderID,
                targetPlace: zone1
            });
        }

        return zone1;
    }

    currentOrderIDZoneColor(orderID: string,  zone: string): any[] {
        const mainDataBundleNoScan2 = [...this.mainDataBundleNoScan];
        let orderIDData1 = mainDataBundleNoScan2.filter(i=>i.orderID == orderID && i.targetPlace == zone);
        orderIDData1.sort((a,b)=>{
            return a.colorSeq >b.colorSeq?1:a.colorSeq <b.colorSeq?-1:0
        });
        const zoneColor1 = Array.from(new Set(orderIDData1.map((item: any) => item.colorTabName)));

        // ## find first tab data
        if (this.firstTabData.first && zoneColor1.length > 0) {
            this.firstTabData.colorTabName = zoneColor1[0];
        }

        // ## check & add style zone data -->  this.tabDataStyleZone = [];
        // this.tabDataStyleZone = [];
        const idx = this.tabDataStyleZoneColor.findIndex( fi =>(
            fi.orderID == orderID &&
            fi.targetPlace == zone
        ));
        if (idx < 0) { // ## add new element data
            this.tabDataStyleZoneColor.push({
                orderID: orderID,
                targetPlace: zone,
                colorTabName: zoneColor1
            });
        }

        return zoneColor1;
    }

    currentOrderIDZoneColorSize(orderID: string, zone: string, colorTabName: string): any[] {

        const mainDataBundleNoScan2 = [...this.mainDataBundleNoScan];
        let orderIDData1 = mainDataBundleNoScan2.filter(i=>
            i.orderID == orderID &&
            i.targetPlace == zone &&
            i.colorTabName == colorTabName
        );
        orderIDData1.sort((a,b)=>{
            return a.sizeSeq >b.sizeSeq?1:a.sizeSeq <b.sizeSeq?-1:0
        });
        const size1 = Array.from(new Set(orderIDData1.map((item: any) => item.size)));

        // ## check & add data -->  this.tabData = [];
        // const idx = this.colors.findIndex( fi =>(fi.color.colorID === colorCode));
        const idx = this.tabDataStyleZoneColorSize.findIndex( fi =>(
            fi.orderID == orderID &&
            fi.targetPlace == zone &&
            fi.colorTabName == colorTabName
        ));
        if (idx < 0) { // ## add new element data
            this.tabDataStyleZoneColorSize.push({
                orderID: orderID,
                targetPlace: zone,
                colorTabName: colorTabName,
                size: size1,
            });
        }

        // if (orderID === 'DCB06A4S' && zone === 'JAPN') {
        //     console.log(this.tabData);
        // }
        // ## find first tab data
        if (this.firstTabData.first && size1.length > 0) {
            this.firstTabData.size = size1[0];
            this.findTabData(orderID, zone, colorTabName, 0);
        }
        this.firstTabData.first = false;  // ## set to false for no need to check more


        return size1;
    }

    currentProductQtyStyleNodeFilter(idx1: number) {
        // console.log(this.currentAllProductNodeQtyStyleGroup[idx1]);
        return this.currentAllProductNodeQtyStyleGroup[idx1];
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

            this.nodeStations.sort((a,b)=>{ return a.nodeID >b.nodeID?1:a.nodeID <b.nodeID?-1:0 });
            this.flowSeq.sort((a,b)=>{return a.seqNo >b.seqNo?1:a.seqNo <b.seqNo?-1:0});
        });
    }

    showNodeIDSelectionModal() {
        // this.productService.productModeView = true;
        this.visibleQCToCompleted = false;
        const ref = this.dialogService.open(SmdSelectNodestationComponent, {
            data: {
                id: 'productView',
                company: this.userService?.getCompany(),
                modeView: true,
                mode: 'select'


            },
            header: 'NodeID selection',
            width: '80%',
        });

        ref.onClose.subscribe((data: NodeStation) => {
            // this.productService.productModeView = false;
            // console.log(data);
            if (data) {
                this.nodeIDSelected  = data.nodeID;
                this.checkCurrentNodeID(this.nodeIDSelected);
                this.getRepNodeNoScan(this.orderIDs, this.nodeIDSelected , ['mainData', 'detailData']); // ## ['mainData', 'detailData']
            }
        });
    }

    checkCurrentNodeID(nodeID: string) {
        // console.log(nodeID);
    }

    onTabStyleChange($event: any) {
        this.selectedTabStyleIndex = $event.index;
        this.selectedTabZoneIndex = 0;
        this.selectedTabColorIndex = 0;
        this.selectedTabSizeIndex = 0;
        // console.log(this.selectedTabSizeIndex);

        const orderID = this.orderIDsNoScan[this.selectedTabStyleIndex];
        const tabDataStyle1 = this.tabDataStyleZone.filter(i=>i.orderID == orderID);
        const zone = tabDataStyle1.length>0 ? tabDataStyle1[0].targetPlace[this.selectedTabZoneIndex]:'';
        this.findTabData(
            orderID,
            zone,
            this.findColorTabNameStr(orderID, zone, this.selectedTabColorIndex),
            this.selectedTabSizeIndex);
    }

    onTabZoneChange($event: any, orderID: string) {
        this.selectedTabZoneIndex = $event.index;
        this.selectedTabColorIndex = 0;
        this.selectedTabSizeIndex = 0;
        // console.log(this.selectedTabSizeIndex);

        // this.tabDataStyle = [];
        const tabDataStyle1 = this.tabDataStyleZone.filter(i=>i.orderID == orderID);
        const zone = tabDataStyle1.length>0 ? tabDataStyle1[0].targetPlace[this.selectedTabZoneIndex]:'';
        // console.log(zone);
        this.findTabData(
            orderID,
            zone,
            this.findColorTabNameStr(orderID, zone, this.selectedTabColorIndex),
            this.selectedTabSizeIndex
        );
    }

    onTabColorChange($event: any, orderID: string, zone: string) {
        this.selectedTabColorIndex = $event.index;
        this.selectedTabSizeIndex = 0;
        // console.log(this.selectedTabSizeIndex);

        this.findTabData(
            orderID, zone,
            this.findColorTabNameStr(orderID, zone, this.selectedTabColorIndex),
            this.selectedTabSizeIndex
        );
    }

    onTabSizeChange($event: any, orderID: string, zone: string, colorTabName: string) {
        this.selectedTabSizeIndex = $event.index;
        this.findTabData(orderID, zone, colorTabName, this.selectedTabSizeIndex);
    }

    findColorTabNameStr(orderID: string, zone: string, selectedTabColorIndex: number): string {
        const tabDataStyleZone1 = this.tabDataStyleZoneColor.filter(i=>
            i.orderID == orderID &&
            i.targetPlace == zone
        );
        const colorTabNameStr = tabDataStyleZone1.length>0 ? tabDataStyleZone1[0].colorTabName[selectedTabColorIndex]:'';
        return colorTabNameStr;
    }

    findTabData(orderID: string, zone: string, colorTabName: string, sizeIndex: number) {



        let size = '';
        const tabData1 = this.tabDataStyleZoneColorSize.filter(i=>
                i.orderID == orderID &&
                i.targetPlace == zone &&
                i.colorTabName == colorTabName
        );

        const nodeIDSelected = this.nodeIDSelected;
        size = tabData1.length > 0 ? tabData1[0].size[sizeIndex] : '';

        // ## find color data  -->  color colorCode  colorName
        const colorCode = colorTabName.split("-")[0];
        const colorName = colorTabName.split("-")[1];
        const mainDataBundleNoScan2 = [...this.mainDataBundleNoScan];
        let color = '';
        let orderIDData1 = mainDataBundleNoScan2.filter(i=>
            i.orderID == orderID &&
            i.targetPlace == zone &&
            i.colorCode == colorCode
        );
        if (orderIDData1.length > 0) {
            color = orderIDData1[0].color;
        }

        // ## find bundle rows
        this.BundlesCount = 0;
        const mainDataBundleNoScan01 = [...this.mainDataBundleNoScan];
        const orderIDData01 = mainDataBundleNoScan01.filter(i=>
            i.orderID == orderID &&
            i.targetPlace == zone &&
            i.colorTabName == colorTabName &&
            i.size == size
        );
        this.BundlesCount = orderIDData01.length;
        // console.log(
        //     this.company.companyID,
        //     this.factory.factoryID,
        //     nodeIDSelected, orderID, zone, color, colorCode, colorName, size
        // );
        this.orderIDF = [orderID];
        this.zoneF = zone;
        this.colorF = color;
        this.sizeF = size;
        this.getRepNodeNoScanDatail(
            this.orderIDF,
            this.nodeIDSelected,
            this.zoneF, this.colorF, this.sizeF,
            ['detailData'],
            this.page, this.limit
        ); // ## ['detailData']
        // (orderIDs: string[], nodeID: string,
        //     targetPlaceID: string, color: string, size: string,
        //     infoTypes: string[], page: number, limit: number)
    }

    paginate(event: any) {
        // console.log(event.rows, +event.page);
        // this.limit = event.rows;
        this.page = +event.page + 1;
        // this.getOrders(+event.page + 1, this.limit, this.orderService.seasonYear);

        this.getRepNodeNoScanDatail(
            this.orderIDF,
            this.nodeIDSelected,
            this.zoneF, this.colorF, this.sizeF,
            ['detailData'],
            this.page, this.limit
        ); // ## ['detailData']

        //event.first = Index of the first record
        //event.rows = Number of rows to display in new page
        //event.page = Index of the new page
        //event.pageCount = Total number of pages
    }

    ngOnDestroy(): void {
        if (this.dataAroundAppSub) { this.dataAroundAppSub.unsubscribe(); }
        if (this.nodeFlowSub) { this.nodeFlowSub.unsubscribe(); }
        if (this.repNodeNoScanSub) { this.repNodeNoScanSub.unsubscribe(); }
        if (this.repNodeNoScanDetailSub) { this.repNodeNoScanDetailSub.unsubscribe(); }
        if (this.qctoCompleteSub) { this.qctoCompleteSub.unsubscribe(); }

    }
}
