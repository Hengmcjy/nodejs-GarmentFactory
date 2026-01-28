import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { MessageService } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import { Subscription } from 'rxjs';
import { GBC } from 'src/app/global/const-global';

import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';

import { Color, ColorS, Company, Factory, SizeS, TargetPlaceS } from 'src/app/models/app.model';
import { BundleStateBoard, BundleStateTargetPlaceBoard } from 'src/app/models/infoBroard.model';
import { BundleSetGroup, MainZone, Order } from 'src/app/models/order.model';
import { CurrentProductionBundleState } from 'src/app/models/report.model';
import { BundleStatePDF, NodeGroupScanID2 } from 'src/app/models/reportpdf.model';
import { OrderService } from 'src/app/services/order.service';
import { ReportService } from 'src/app/services/report.service';
import { UserService } from 'src/app/services/user.service';
import { SmdRepFacScanBundleStateStyleSetgroupComponent } from '../../factory/smd-rep-fac-scan-bundle-state-style-setgroup/smd-rep-fac-scan-bundle-state-style-setgroup.component';
import { Product } from 'src/app/models/product.model';
import { ProductService } from 'src/app/services/product.service';
import { SmdConfirmImportantTaskComponent } from '../../../general/smd-confirm-important-task/smd-confirm-important-task.component';

(pdfMake as any).vfs = pdfFonts.pdfMake.vfs;

@Component({
  selector: 'app-s-rep-outs-state',
  templateUrl: './s-rep-outs-state.component.html',
  styleUrls: ['./s-rep-outs-state.component.scss'],
  providers: [DialogService, MessageService],
})
export class SRepOutsStateComponent implements OnInit, OnDestroy {
    @Input() callFrom: string = ''; // ## nodeID  , 'staff-office'

    formActive = 'repOutSourceState';
    pageActive = this.formActive;
    formName = this.formActive;

    isAdmin: boolean = false;

    blockedPanel: boolean = false;
    seasonYear = '';

    reportHeader = 'Outsource state';

    factoryIDOuts = '';
    company: Company = GBC.clrCompany();
    orders: Order[] = [];
    orderIDs: string[] = [];
    sizes: SizeS[] = [];
    colors: ColorS[] = [];
    colorSSelect: ColorS = GBC.clrOrderColor();
    targetPlaces: TargetPlaceS[] = [];
    mainZone: MainZone[] = [];


    factories: Factory[] = [];
    factoryIDs: string[] = [];
    orderProductFacOut: any[] = [];
    orderProductFacReceive: any[] = [];
    orderProductFac1BY1Out: any[] = [];
    orderProductFac1BY1Receive: any[] = [];
    product: Product = GBC.clrProduct();

    dataOutsState: any[] = [];

    orderID = '';
    dataFecthing = false; // ## will doing get data from server

    currentProductionBundleState: CurrentProductionBundleState[] = [];
    bundleStatePDF: BundleStatePDF[] = [];
    bundleStatePDFCompleted: BundleStatePDF[] = [];
    bundleStatePDFNotCompleted: BundleStatePDF[] = [];
    bundleStatePDFGroup: any[] = [];
    bundleStatePDFCompletedGroup: any[] = [];
    bundleStatePDFNotCompletedGroup: any[] = [];

    BundleStateBoard: BundleStateBoard = GBC.clrBundleStateBoard();  // ## all
    BundleStateBoardCompleted: BundleStateBoard = GBC.clrBundleStateBoard();  // ## Completed
    BundleStateBoardNotCompleted: BundleStateBoard = GBC.clrBundleStateBoard();  // ## not Completed

    isLoading = false;

    private repCompanyOutsSub: Subscription = new Subscription;
    private repCurrentProductionBundleStateSub: Subscription = new Subscription;
    // private repCompanyOutsSub: Subscription = new Subscription;
    // private repCompanyOutsSub: Subscription = new Subscription;

    constructor(
        public dialogService: DialogService,
        public messageService: MessageService,

        public userService: UserService,
        private orderService: OrderService,
        private prodService: ProductService,
        // private cusService: CustomerService,
        private repService: ReportService,
    ) {}

    ngOnInit(): void {
        // console.log(this.prodService.getProductsArr());
        // console.log('SRepOutsStateComponent');
        // this.reportHeader = this.userService.translateCode('nu', 'nu-outsource');
        this.company = this.userService.getCompany();
        // this.factories = this.userService.getFactories();
        this.orders = this.orderService.getOrdersArr();
        this.orderIDs = this.userService.getOrderIDs(this.orders);
        this.sizes = this.userService.sizes;
        this.colors = this.userService.colors;
        this.targetPlaces = this.userService.targetPlaces;
        this.mainZone = this.userService.getMainZoneTargetPlace(this.targetPlaces);

        // this.factoryIDs = [];

        // console.log(this.factories);

        this.getRepCompanyOrderOutsourceState('dt');
        // if (this.callFrom === 'staff-office') {
        // } else if (this.callFrom === 'nodeID') {

        // }
    }

    // ## type = 'dt' , 'refresh'
    // ## dt = data temp
    getRepCompanyOrderOutsourceState(type: string) {
        // console.log('getRepCompanyOrderOutsourceState()');
        this.blockedPanel = true;
        this.isLoading = true;

        const seasonYear = this.userService.seasonYear;
        const ordertatus = ['open'];
        const companyID = this.company.companyID;
        // getRepCompanyOrderOutsourceState(companyID: string, ordertatus: string[], orderIDArrr: string[])

        // console.log(companyID, ordertatus, this.orderIDs, seasonYear);
        // console.log(this.callFrom);
        if (this.callFrom === 'staff-office') {
            this.repService.getRepCompanyOrderOutsourceState(companyID, ordertatus, this.orderIDs, seasonYear, type);
        } else if (this.callFrom === 'nodeID') {
            this.repService.getRepCompanyOrderOutsourceState2(companyID, ordertatus, this.orderIDs, seasonYear, type);
        }
        if (this.repCompanyOutsSub) { this.repCompanyOutsSub.unsubscribe(); }
        this.repCompanyOutsSub = this.repService.getRepCompanyOrderOutsourceStateUpdatedListener().subscribe((data) => {
            // console.log(data);
            this.blockedPanel = false;
            this.isLoading = false;
            this.factories = [];
            this.factoryIDs = [];
            this.orderProductFacOut = [];
            this.orderProductFacReceive = [];
            this.dataOutsState = [];

            this.orderProductFacOut = data.orderProductFacOut;
            this.orderProductFacReceive = data.orderProductFacReceive;
            this.orderProductFac1BY1Out = data.orderProductFac1BY1Out;
            this.orderProductFac1BY1Receive = data.orderProductFac1BY1Receive;
            this.dataOutsState = data.dataOutsState;
            this.factoryIDs = Array.from(new Set(this.orderProductFacOut.map((item: any) => item.factoryID)));
            this.factoryIDs.sort();  // ## sort asc

            this.factoryIDs.forEach( (item, index) => {
                const fac = this.userService.getFactoryByFactoryID(item);
                this.factories.push(fac);
            });

            // console.log(this.dataOutsState);
            // console.log(this.orderProductFacOut);
            // console.log(this.orderProductFacReceive);
            // console.log(this.orderProductFac1BY1Out);
            // console.log(this.orderProductFac1BY1Receive);
            if (type === 'refresh') { this.prepareData(); }
        });
    }

    prepareData() {
        this.dataOutsState = [];

        this.orderProductFacOut.forEach( (item, index) => {
            const sTypeOtus = 'b';
            const setName = this.userService.getSetNameColorByOrderID(item.orderID);
            const color = this.userService.strReplaceAll(item.color, '-', '');
            item.color = color;
            const targetPlace = this.userService.strReplaceAll(item.targetPlace, '-', '');
            item.targetPlace = targetPlace;
            item.setname = setName;
            const colorCode = this.userService.getColorCodeByColorIDSetName(color, setName);
            const colorName = this.userService.getColorNameByColorCode(color, setName);
            const colorValue = this.userService.getColorValueByColorCode(color, setName);
            item.colorCode = colorCode;
            item.colorName = colorName;
            item.colorValue = colorValue;
            item.setGroup = item.orderID
                            +':'+setName
                            +':'+targetPlace
                            +':'+colorName+':'+colorCode+':'+color+':'+colorValue
                            +':'+item.factoryID
                            +':'+item.yyyymmdd
                            +':'+item.fromFactoryID  // ## factory who scan send out
                            +':'+sTypeOtus;
        });
        this.orderProductFacReceive.forEach( (item, index) => {
            const sTypeOtus = 'b';  // ## b = bundle mode
            const setName = this.userService.getSetNameColorByOrderID(item.orderID);
            const color = this.userService.strReplaceAll(item.color, '-', '');
            item.color = color;
            const targetPlace = this.userService.strReplaceAll(item.targetPlace, '-', '');
            item.targetPlace = targetPlace;
            item.setname = setName;
            const colorCode = this.userService.getColorCodeByColorIDSetName(color, setName);
            const colorName = this.userService.getColorNameByColorCode(color, setName);
            const colorValue = this.userService.getColorValueByColorCode(color, setName);
            item.colorCode = colorCode;
            item.colorName = colorName;
            item.colorValue = colorValue;
            item.setGroup = item.orderID
                            +':'+setName
                            +':'+targetPlace
                            +':'+colorName+':'+colorCode+':'+color+':'+colorValue
                            +':'+item.factoryID
                            +':'+item.yyyymmdd
                            +':'+item.fromFactoryID // ## factory who scan received
                            +':'+sTypeOtus; // ## b = bundle mode
        });
        this.orderProductFac1BY1Out.forEach( (item, index) => {
            const sTypeOtus = '1';  // ## 1 = 1by1scan
            const setName = this.userService.getSetNameColorByOrderID(item.orderID);
            const color = this.userService.strReplaceAll(item.color, '-', '');
            item.color = color;
            const targetPlace = this.userService.strReplaceAll(item.targetPlace, '-', '');
            item.targetPlace = targetPlace;
            item.setname = setName;
            const colorCode = this.userService.getColorCodeByColorIDSetName(color, setName);
            const colorName = this.userService.getColorNameByColorCode(color, setName);
            const colorValue = this.userService.getColorValueByColorCode(color, setName);
            item.colorCode = colorCode;
            item.colorName = colorName;
            item.colorValue = colorValue;
            item.setGroup = item.orderID
                            +':'+setName
                            +':'+targetPlace
                            +':'+colorName+':'+colorCode+':'+color+':'+colorValue
                            +':'+item.factoryID
                            +':'+item.yyyymmdd
                            +':'+item.fromFactoryID  // ## factory who scan send out
                            +':'+sTypeOtus;  // ## 1 = 1by1scan
        });
        this.orderProductFac1BY1Receive.forEach( (item, index) => {
            const sTypeOtus = '1';  // ## 1 = 1by1scan
            const setName = this.userService.getSetNameColorByOrderID(item.orderID);
            const color = this.userService.strReplaceAll(item.color, '-', '');
            item.color = color;
            const targetPlace = this.userService.strReplaceAll(item.targetPlace, '-', '');
            item.targetPlace = targetPlace;
            item.setname = setName;
            const colorCode = this.userService.getColorCodeByColorIDSetName(color, setName);
            const colorName = this.userService.getColorNameByColorCode(color, setName);
            const colorValue = this.userService.getColorValueByColorCode(color, setName);
            item.colorCode = colorCode;
            item.colorName = colorName;
            item.colorValue = colorValue;
            item.setGroup = item.orderID
                            +':'+setName
                            +':'+targetPlace
                            +':'+colorName+':'+colorCode+':'+color+':'+colorValue
                            +':'+item.factoryID
                            +':'+item.yyyymmdd
                            +':'+item.fromFactoryID  // ## factory who scan send out
                            +':'+sTypeOtus;  // ## 1 = 1by1scan
        });

        // ## find  date  list
        this.factoryIDs.forEach( (item1, index1) => {
            let dateL: any[] = [];
            let dateList: string[] = [];
            let dataOutsState1: any = {};


            // ## 1 by 1 scan case
            const orderProductFac1BY1OutF = this.orderProductFac1BY1Out.filter(i=>i.factoryID==item1);
            const orderProductFac1BY1ReceiveF = this.orderProductFac1BY1Receive.filter(i=>i.factoryID==item1);
            let date1BY1Out = Array.from(new Set(orderProductFac1BY1OutF.map((item: any) => item.yyyymmdd)));
            let date1BY1Receive = Array.from(new Set(orderProductFac1BY1ReceiveF.map((item: any) => item.yyyymmdd)));
            date1BY1Out.sort();  // ## sort asc
            date1BY1Receive.sort();  // ## sort asc

            const orderProductFacOutF = this.orderProductFacOut.filter(i=>i.factoryID==item1);
            const orderProductFacReceiveF = this.orderProductFacReceive.filter(i=>i.factoryID==item1);
            let dateOut = Array.from(new Set(orderProductFacOutF.map((item: any) => item.yyyymmdd)));
            let dateReceive = Array.from(new Set(orderProductFacReceiveF.map((item: any) => item.yyyymmdd)));
            dateOut.sort();  // ## sort asc
            dateReceive.sort();  // ## sort asc
            dateList = [...dateOut];

            dateReceive.forEach( (item2, index2) => {
                const dateListF = dateList.filter(i=>i==item2);
                if (dateListF.length === 0) {
                    dateList.push(item2);
                }
            });
            date1BY1Out.forEach( (item2, index2) => {
                const dateListF = dateList.filter(i=>i==item2);
                if (dateListF.length === 0) {
                    dateList.push(item2);
                }
            });
            date1BY1Receive.forEach( (item2, index2) => {
                const dateListF = dateList.filter(i=>i==item2);
                if (dateListF.length === 0) {
                    dateList.push(item2);
                }
            });
            dateList.sort();  // ## sort asc

            dateList.forEach( (item3, index3) => {
                let date1: any = {
                    yyyymmdd: item3,
                    dateName: this.userService.getDateShortByYYYYMMDD(item3, 'ddMMMyyyy', 'short', '-')
                };
                dateL.push(date1);
            });
            dataOutsState1.factoryID = item1;
            dataOutsState1.factoryName = this.userService.getFactoryNameByFactoryID(item1);
            dataOutsState1.factoryName2 = this.userService.getFactoryName2ByFactoryID(item1);
            // dataOutsState1.factoryID2 = item1;
            dataOutsState1.dateList = dateL;
            this.dataOutsState.push(dataOutsState1);
        });

        // console.log(this.dataOutsState);
        // ## get data detail by factoryID by date
        this.dataOutsState.forEach( (item1, index1) => {
            const factoryID = item1.factoryID; // ## to factory , outsource factory
            item1.dateList.forEach( (item2: any, index2: number) => {
                const yyyymmdd = item2.yyyymmdd;

                // ## bundle
                const orderProductFacOutF = this.orderProductFacOut.filter(i=>i.factoryID==factoryID && i.yyyymmdd==yyyymmdd);
                const orderProductFacReceiveF = this.orderProductFacReceive.filter(i=>i.factoryID==factoryID && i.yyyymmdd==yyyymmdd);
                const setGroupOutArr = Array.from(new Set(orderProductFacOutF.map((item: any) => item.setGroup)));
                const setGroupReceiveArr = Array.from(new Set(orderProductFacReceiveF.map((item: any) => item.setGroup)));

                // ## 1by1 scan
                const orderProductFac1BY1OutF = this.orderProductFac1BY1Out.filter(i=>i.factoryID==factoryID && i.yyyymmdd==yyyymmdd);
                const orderProductFac1BY1ReceiveF = this.orderProductFac1BY1Receive.filter(i=>i.factoryID==factoryID && i.yyyymmdd==yyyymmdd);
                const setGroup1BY1OutArr = Array.from(new Set(orderProductFac1BY1OutF.map((item: any) => item.setGroup)));
                const setGroup1BY1ReceiveArr = Array.from(new Set(orderProductFac1BY1ReceiveF.map((item: any) => item.setGroup)));


                let setGroupInfoOut: any[] = [];
                // ## b = bundle mode
                setGroupOutArr.forEach( (item3: any, index3: number) => {
                    const qty = this.getQty(item3, this.orderProductFacOut);
                    const bundleNos = this.getBundleNos(item3, this.orderProductFacOut);
                    const setGroupInfo = item3.split(':'); // BA1P4A4A:muji:JAPN:OATMEAL:#013:OM:f000004:20240327
                    const orderID = setGroupInfo[0];
                    const setName = setGroupInfo[1];
                    const targetPlaceID = setGroupInfo[2];
                    const colorName = setGroupInfo[3];
                    const colorCode = setGroupInfo[4];
                    const color = setGroupInfo[5];
                    const colorValue = setGroupInfo[6];
                    const factoryID1 = this.userService.getFactoryName2ByFactoryID( setGroupInfo[7]); // ## factory outsource
                    const factoryID2 = this.userService.getFactoryName2ByFactoryID( setGroupInfo[9]); // ## factory who scan send out
                    const sTypeOtus = setGroupInfo[10];  // ## b = bundle mode , 1 = 1by1
                    const setGroupInfo1: any = {
                        setGroup: item3,
                        qty, bundleNos, orderID, setName, targetPlaceID, colorName, colorCode, color, colorValue,
                        factoryID1, factoryID2, sTypeOtus
                    };
                    setGroupInfoOut.push(setGroupInfo1);
                });

                // ## 1 = 1by1
                setGroup1BY1OutArr.forEach( (item3: any, index3: number) => {
                    const qty = this.getQty(item3, this.orderProductFacOut);
                    const bundleNos: any[] = [];
                    const setGroupInfo = item3.split(':'); // BA1P4A4A:muji:JAPN:OATMEAL:#013:OM:f000004:20240327
                    const orderID = setGroupInfo[0];
                    const setName = setGroupInfo[1];
                    const targetPlaceID = setGroupInfo[2];
                    const colorName = setGroupInfo[3];
                    const colorCode = setGroupInfo[4];
                    const color = setGroupInfo[5];
                    const colorValue = setGroupInfo[6];
                    const factoryID1 = this.userService.getFactoryName2ByFactoryID( setGroupInfo[7]); // ## factory outsource
                    const factoryID2 = this.userService.getFactoryName2ByFactoryID( setGroupInfo[9]); // ## factory who scan send out
                    const sTypeOtus = setGroupInfo[10];  // ## b = bundle mode , 1 = 1by1
                    const setGroupInfo1: any = {
                        setGroup: item3,
                        qty, bundleNos, orderID, setName, targetPlaceID, colorName, colorCode, color, colorValue,
                        factoryID1, factoryID2, sTypeOtus
                    };
                    setGroupInfoOut.push(setGroupInfo1);
                });

                let setGroupInfoReceive: any[] = [];
                // ## b = bundle mode
                setGroupReceiveArr.forEach( (item3: any, index3: number) => {
                    const qty = this.getQty(item3, this.orderProductFacReceive);
                    const bundleNos = this.getBundleNos(item3, this.orderProductFacReceive);
                    const setGroupInfo = item3.split(':'); // BA1P4A4A:muji:JAPN:OATMEAL:#013:OM:f000004:20240327
                    const orderID = setGroupInfo[0];
                    const setName = setGroupInfo[1];
                    const targetPlaceID = setGroupInfo[2];
                    const colorName = setGroupInfo[3];
                    const colorCode = setGroupInfo[4];
                    const color = setGroupInfo[5];
                    const colorValue = setGroupInfo[6];
                    const factoryID1 = this.userService.getFactoryName2ByFactoryID( setGroupInfo[7]); // ## factory outsource
                    const factoryID2 = this.userService.getFactoryName2ByFactoryID( setGroupInfo[9]); // ## factory who scan receice back
                    const sTypeOtus = setGroupInfo[10];  // ## b = bundle mode , 1 = 1by1
                    const setGroupInfo1: any = {
                        setGroup: item3,
                        qty, bundleNos, orderID, setName, targetPlaceID, colorName, colorCode, color, colorValue,
                        factoryID1, factoryID2, sTypeOtus
                    };
                    setGroupInfoReceive.push(setGroupInfo1);
                });

                // ## 1 = 1by1
                setGroup1BY1ReceiveArr.forEach( (item3: any, index3: number) => {
                    const qty = this.getQty(item3, this.orderProductFacReceive);
                    const bundleNos: any[] = [];
                    const setGroupInfo = item3.split(':'); // BA1P4A4A:muji:JAPN:OATMEAL:#013:OM:f000004:20240327
                    const orderID = setGroupInfo[0];
                    const setName = setGroupInfo[1];
                    const targetPlaceID = setGroupInfo[2];
                    const colorName = setGroupInfo[3];
                    const colorCode = setGroupInfo[4];
                    const color = setGroupInfo[5];
                    const colorValue = setGroupInfo[6];
                    const factoryID1 = this.userService.getFactoryName2ByFactoryID( setGroupInfo[7]); // ## factory outsource
                    const factoryID2 = this.userService.getFactoryName2ByFactoryID( setGroupInfo[9]); // ## factory who scan receice back
                    const sTypeOtus = setGroupInfo[10];  // ## b = bundle mode , 1 = 1by1
                    const setGroupInfo1: any = {
                        setGroup: item3,
                        qty, bundleNos, orderID, setName, targetPlaceID, colorName, colorCode, color, colorValue,
                        factoryID1, factoryID2, sTypeOtus
                    };
                    setGroupInfoReceive.push(setGroupInfo1);
                });


                item2.out = setGroupInfoOut;
                item2.receive = setGroupInfoReceive;
            });
        });

        this.dataOutsState.sort((a,b)=>{ return a.factoryID >b.factoryID?1:a.factoryID <b.factoryID?-1:0 });
        this.dataOutsState.forEach( (item1, index1) => {
            ((item1.dateList) as any[]).sort((a,b)=>{ return a.yyyymmdd <b.yyyymmdd?1:a.yyyymmdd >b.yyyymmdd?-1:0 }); // sort desc
        });
        // ((((this.megaMenuItems[0].items) as MenuItem[][])[0][0].items) as MenuItem[])[0].command

        // console.log(this.orderProductFacOut);
        // console.log(this.orderProductFacReceive);
        // console.log(this.factoryIDs);
        // console.log(this.factories);
        // console.log(this.dataOutsState);

        // ## update dataOutsState to  Dtorderoutsourcefac, Schedule
        this.putEditSchedule(this.dataOutsState);

    }

    putEditSchedule(dataOutsState: any[]) {
        // console.log(dataOutsState);
        const companyID = this.company.companyID;
        const seasonYear = this.userService.seasonYear;
        const scheduleData = {
            seasonYear: seasonYear,
            companyID: companyID,
            sGroup: 'report',
            sName: 'auto_getCurrentCompanyOrderOutsourceFac',
            sMode: 'every30mn',
            sDatetimeDiff: 30,
            sNote: '',
        };
        // putEditSchedule(companyID: string, dataOutsState: any[], scheduleData: any)
        this.repService.putEditSchedule(companyID, dataOutsState, scheduleData);
    }

    getQty(setGroup: string, facOutArr: any[]): number {
        const facOutF = facOutArr.filter(i=> i.setGroup == setGroup);
        if (facOutF.length > 0) {
            const facOutTotalQTY = +facOutF.reduce((prev, cur) => {return prev + cur.productCount;}, 0);
            return facOutTotalQTY;
        }
        return 0;
    }

    getBundleNos(setGroup: string, facOutArr: any[]): string[] {
        const facOutF = facOutArr.filter(i=> i.setGroup == setGroup);
        if (facOutF.length > 0) {
            const bundleNos = Array.from(new Set(facOutF.map((item: any) => item.bundleNo)));
            return bundleNos;
        }
        return [];
    }

    getsTypeOtus(setGroup: string): string {
        const setGroupArr = setGroup.split(':');
        if (setGroupArr.length > 0 && setGroupArr[10]) {
            return setGroupArr[10];
        }
        return 'b'; // ## b=bundle
    }

    getIconsTypeOtus(setGroup: string): string {
        const setGroupArr = setGroup.split(':');
        if (setGroupArr.length > 0 && setGroupArr[10]) {
            const sTypeOtus = setGroupArr[10];
            if (sTypeOtus === 'b') {
                return 'pi-file-pdf';
            } else if (sTypeOtus === '1') {
                return 'pi-th-large';
            }
        }
        return 'pi-file-pdf'; // ##
    }

    // export class ColorS {
    //     constructor(
    //         public companyID: string,
    //         public seq: number,
    //         public setName: string,
    //         public color: Color
    //     ) {}
    // }

    // // ## color
    // export class Color {
    //     constructor(
    //         public colorID: string,
    //         public colorName: string,
    //         public colorValue: string,
    //         public colorCode: string,
    //     ) {}
    // }

    // getProduct1(orderID: string) {
    //     this.product = GBC.clrProduct();
    // }

    // outsMode = 'receive', 'out'
    getRepCurrentProductionBundleStateNo2(facOuts: any, factoryName: string, orderID: string, bundleNos: number[], outSData: any, outS: any, outsMode: string) {
        this.factoryIDOuts = facOuts.factoryID;
        // console.log(bundleNos);

        // console.log(outSData);
        // console.log(outS);
        // AA0QYA4A:muji:ASIA:BLACK:#009:BK:#000000:f000011:20240821:f000001:1
        const sTypeOtus = outSData.setGroup.split(':')[10]; // ## b = bundle mode , 1 = 1by1
        if (sTypeOtus === '1') {  // ##  1 = 1by1
            this.print1BY1PDF(factoryName, outS, outsMode);
        } else if (sTypeOtus === 'b') {  // ## b = bundle mode ,

            this.dataFecthing = true;
            this.colorSSelect = GBC.clrOrderColor();
            this.colorSSelect.companyID = this.company.companyID;
            this.colorSSelect.setName = outSData.setName;
            this.colorSSelect.seq = 0;
            const color: Color = {
                colorID: outSData.color,
                colorName: outSData.colorName,
                colorValue: outSData.colorValue,
                colorCode: outSData.colorCode,
            };
            this.colorSSelect.color = color;

            // this.getProduct1(orderID);
            // const productID = this.userService.setAddStrLen(orderID, 12, ' ');

            const productStatus = ['normal', 'problem', 'repaired', 'complete']; // normal , problem, complete
            const orderStatus = ['open'];
            const orderIDArr = [orderID];
            this.orderID = orderID;

            // this.product = this.userService.get1ProductInfoByOrderID(orderID);
            // console.log(orderID, this.product);
            // const date12 = this.date12;
            // const userGroupScan1: UserGroupScan = this.userGroupScan1;
            this.currentProductionBundleState = [];
            this.bundleStatePDF = [];
            this.bundleStatePDFCompleted = [];
            this.bundleStatePDFNotCompleted = [];
            this.repService.getRepCurrentProductionBundleStateNo2(this.company.companyID, productStatus, orderStatus, orderIDArr, bundleNos, orderID);
            if (this.repCurrentProductionBundleStateSub) { this.repCurrentProductionBundleStateSub.unsubscribe(); }
            this.repCurrentProductionBundleStateSub = this.repService.getRepCurrentProductionsBundleStateCUpdatedListener().subscribe((data) => {
                // console.log(data);
                this.dataFecthing = false;
                // this.showBundleSetgroupBoard(bundleSetGroup);
                this.currentProductionBundleState = data.currentProductionBundleState;
                this.bundleStatePDF = data.bundleStatePDF;
                this.product = data.product;
                // this.currentProductionZonePeriod = data.currentProductionZonePeriod;
                // this.currentProductionZoneForLoss = data.currentProductionZoneForLoss;
                // this.orderStyleColorSize = data.orderStyleColorSize;


                if ( this.bundleStatePDF.length > 0) {
                    let bundleSetGroup: BundleSetGroup = GBC.clrBundleSetGroup();
                    this.prepareGetRepCurrentProductionBundleState(bundleSetGroup, outsMode);
                }

                // console.log(this.currentProductionBundleState);
            });
        }

    }

    prepareGetRepCurrentProductionBundleState(bundleSetGroup: BundleSetGroup, outsMode: string) {
        // console.log(this.userService.userGroupScan);
        this.bundleStatePDF.forEach( (item, index) => {
            item.size = this.userService.strReplaceAll(item.size, '-', '');
            item.color = this.userService.strReplaceAll(item.color, '-', '');
        });
        this.bundleStatePDF.forEach( (item, index) => {
            item.targetPlaceSeq = this.userService.getTargetPlaceSeq1(item.targetPlaceID);
            item.sizeSeq = this.userService.getSizeSeq(item.size);
            item.colorName = this.userService.getColorNameByColorID1(item.color);
            item.colorSeq = this.userService.getColorSeqByOrderID(this.orderID, item.color);
            // item.groupScanID2 = this.userService.getGroupScanID2(item.userID);
            item.groupNamePDF = item.orderID+':'+item.targetPlaceID+':'+item.color;
            item.completed = this.checkBundleCompleted(item.nodeGroupScanID2);
        });
        this.bundleStatePDF.sort((a,b)=>{
            return a.targetPlaceSeq >b.targetPlaceSeq?1:a.targetPlaceSeq <b.targetPlaceSeq?-1:0
            || a.colorSeq >b.colorSeq?1:a.colorSeq <b.colorSeq?-1:0
            || a.sizeSeq >b.sizeSeq?1:a.sizeSeq <b.sizeSeq?-1:0
            || a.bundleNo >b.bundleNo?1:a.bundleNo <b.bundleNo?-1:0
            // || a.fromNode >b.fromNode?1:a.fromNode <b.fromNode?-1:0
        });
        // console.log(this.bundleStatePDF);

        this.bundleStatePDFCompleted = [];
        this.bundleStatePDFNotCompleted = [];

        this.bundleStatePDFGroup = [];
        this.bundleStatePDFCompletedGroup = [];
        this.bundleStatePDFNotCompletedGroup = [];


        const bundleStatePDFCompleted = [...this.bundleStatePDF];
        this.bundleStatePDFCompleted = bundleStatePDFCompleted.filter(c => c.completed===true);
        // console.log(this.bundleStatePDFCompleted);

        const bundleStatePDFNotCompleted = [...this.bundleStatePDF];
        this.bundleStatePDFNotCompleted  = bundleStatePDFNotCompleted.filter(c => c.completed===false);
        // console.log(this.bundleStatePDFNotCompleted);

        this.bundleStatePDFGroup = this.userService.groupBy(this.bundleStatePDF, (c: any) => c.groupNamePDF);
        this.bundleStatePDFGroup = Object.values(this.bundleStatePDFGroup);
        // console.log(this.bundleStatePDFGroup);

        this.bundleStatePDFCompletedGroup = this.userService.groupBy(this.bundleStatePDFCompleted, (c: any) => c.groupNamePDF);
        this.bundleStatePDFCompletedGroup = Object.values(this.bundleStatePDFCompletedGroup);
        // console.log(this.bundleStatePDFCompletedGroup);

        this.bundleStatePDFNotCompletedGroup = this.userService.groupBy(this.bundleStatePDFNotCompleted, (c: any) => c.groupNamePDF);
        this.bundleStatePDFNotCompletedGroup = Object.values(this.bundleStatePDFNotCompletedGroup);
        // console.log(this.bundleStatePDFNotCompletedGroup);

        this.prepareDataBundleBoard(bundleSetGroup, outsMode); // ## prepate data for bundle state board

    }

    checkBundleCompleted(nodeGroupScanID2: NodeGroupScanID2[]) {
        const nodeCompleted = '7.QC';  // 7.QC  ,  completeNode
        const status = 'done';  // ## finish all in bundle
        const nodeGroupScanID2F = nodeGroupScanID2.filter(c => c.nodeID===nodeCompleted && c.status===status);
        if (nodeGroupScanID2F.length > 0) { return true; }
        return false;;
    }

    prepareDataBundleBoard(bundleSetGroup: BundleSetGroup, outsMode: string) {
        this.BundleStateBoard = GBC.clrBundleStateBoard();  // ## all
        this.BundleStateBoardCompleted = GBC.clrBundleStateBoard();  // ## Completed
        this.BundleStateBoardNotCompleted = GBC.clrBundleStateBoard();  // ## not Completed

        // ## all  this.bundleStatePDF
        const qtyAll1 = this.bundleStatePDF.reduce((prev, cur) => {return prev + cur.productCount;}, 0);
        const bundleAllCount1 = this.bundleStatePDF.length;
        this.BundleStateBoard.companyID = this.company.companyID;
        this.BundleStateBoard.orderID = this.orderID;
        this.BundleStateBoard.bundleAllCount = bundleAllCount1;
        this.BundleStateBoard.qtyAll =qtyAll1;
        this.BundleStateBoard.bundleStateTargetPlaceBoard = [];
        this.mainZone.forEach( (item, index) => {
            const bundleStatePDF1 = [...this.bundleStatePDF];
            const bundleStatePDF1F = bundleStatePDF1.filter(i=>i.targetPlaceID == item.targetPlaceID);
            const bundleCount = bundleStatePDF1F.length;
            const qty = bundleStatePDF1F.reduce((prev, cur) => {return prev + cur.productCount;}, 0);
            const bundleStateTargetPlaceBoard1: BundleStateTargetPlaceBoard = {
                targetPlaceID: item.targetPlaceID,
                targetPlaceName: item.targetPlaceName,
                targetPlaceSeq: 0,
                bundleCount: bundleCount,
                qty: qty,
            };
            this.BundleStateBoard.bundleStateTargetPlaceBoard.push(bundleStateTargetPlaceBoard1);
        });

        // ## Completed  this.bundleStatePDFCompleted
        const qtyAll2 = this.bundleStatePDFCompleted.reduce((prev, cur) => {return prev + cur.productCount;}, 0);
        const bundleAllCount2 = this.bundleStatePDFCompleted.length;
        this.BundleStateBoardCompleted.companyID = this.company.companyID;
        this.BundleStateBoardCompleted.orderID = this.orderID;
        this.BundleStateBoardCompleted.bundleAllCount = bundleAllCount2;
        this.BundleStateBoardCompleted.qtyAll = qtyAll2;
        this.BundleStateBoardCompleted.bundleStateTargetPlaceBoard = [];
        this.mainZone.forEach( (item, index) => {
            const bundleStatePDF1 = [...this.bundleStatePDFCompleted];
            const bundleStatePDF1F = bundleStatePDF1.filter(i=>i.targetPlaceID == item.targetPlaceID);
            const bundleCount = bundleStatePDF1F.length;
            const qty = bundleStatePDF1F.reduce((prev, cur) => {return prev + cur.productCount;}, 0);
            const bundleStateTargetPlaceBoard1: BundleStateTargetPlaceBoard = {
                targetPlaceID: item.targetPlaceID,
                targetPlaceName: item.targetPlaceName,
                targetPlaceSeq: 0,
                bundleCount: bundleCount,
                qty: qty,
            };
            this.BundleStateBoardCompleted.bundleStateTargetPlaceBoard.push(bundleStateTargetPlaceBoard1);
        });


        // ## not Completed  this.bundleStatePDFNotCompleted
        const qtyAll3 = this.bundleStatePDFNotCompleted.reduce((prev, cur) => {return prev + cur.productCount;}, 0);
        const bundleAllCount3 = this.bundleStatePDFNotCompleted.length;
        this.BundleStateBoardNotCompleted.companyID = this.company.companyID;
        this.BundleStateBoardNotCompleted.orderID = this.orderID;
        this.BundleStateBoardNotCompleted.bundleAllCount = bundleAllCount3;
        this.BundleStateBoardNotCompleted.qtyAll = qtyAll3;
        this.BundleStateBoardNotCompleted.bundleStateTargetPlaceBoard = [];
        this.mainZone.forEach( (item, index) => {
            const bundleStatePDF1 = [...this.bundleStatePDFNotCompleted];
            const bundleStatePDF1F = bundleStatePDF1.filter(i=>i.targetPlaceID == item.targetPlaceID);
            const bundleCount = bundleStatePDF1F.length;
            const qty = bundleStatePDF1F.reduce((prev, cur) => {return prev + cur.productCount;}, 0);
            const bundleStateTargetPlaceBoard1: BundleStateTargetPlaceBoard = {
                targetPlaceID: item.targetPlaceID,
                targetPlaceName: item.targetPlaceName,
                targetPlaceSeq: 0,
                bundleCount: bundleCount,
                qty: qty,
            };
            this.BundleStateBoardNotCompleted.bundleStateTargetPlaceBoard.push(bundleStateTargetPlaceBoard1);
        });

        // console.log(this.BundleStateBoard);
        // console.log(this.BundleStateBoardCompleted);
        // console.log(this.BundleStateBoardNotCompleted);
        this.dataFecthing = false;
        this.showBundleSetgroupBoard(bundleSetGroup, outsMode);
    }

    showBundleSetgroupBoard(bundleSetGroup: BundleSetGroup, outsMode: string) {
        // ## receive , out
        const ref = this.dialogService.open(SmdRepFacScanBundleStateStyleSetgroupComponent, {
            data: {
                id: 'bundle-setgroup-board-info',
                whoCall: this.callFrom,
                outsMode: outsMode,
                mode: 'bundleNos', // setgroup , bundleNos
                orderID: this.orderID,
                factoryIDOuts: this.factoryIDOuts,
                product: this.product,
                colorS: this.colorSSelect,
                bundleSetGroup: bundleSetGroup,
                bundleStatePDFGroup: this.bundleStatePDFGroup,
                bundleStatePDFCompletedGroup: this.bundleStatePDFCompletedGroup,
                bundleStatePDFNotCompletedGroup: this.bundleStatePDFNotCompletedGroup,
                BundleStateBoard: this.BundleStateBoard,
                BundleStateBoardCompleted: this.BundleStateBoardCompleted,
                BundleStateBoardNotCompleted: this.BundleStateBoardNotCompleted,
            },
            header: 'bundle set group board info',
            width: '90%',
        });

        ref.onClose.subscribe((data: any) => {
            // console.log(data);
            // if (car) {
            //     this.messageService.add({severity:'info', summary: 'Car Selected', detail:'Vin:' + car.vin});
            // }
        });
    }

    // outsMode = 'receive', 'out'
    print1BY1PDF(factoryName: string, outS: any, outsMode: string) {
        // console.log(outsMode, outS);
        const out: any[] = outS.out;
        const receive: any[] = outS.receive;
        // console.log(out, receive);

        let data: any[] = [];
        if (outsMode === 'out') {
            data = [...out];
        } else if (outsMode === 'receive') {
            data = [...receive];
        }
        // console.log(outsMode, data);

        // ## prepare Data  , sTypeOtus
        let dmy = '';
        data.forEach( (item, index) => {
            // console.log(item);
            const setGroupS = item.setGroup.split(':');
            item.sTypeOtus = setGroupS[10];
            item.dmy = this.userService.getDateShortByYYYYMMDD(setGroupS[8], 'ddMMMyyyy', 'short', '-');
            dmy = item.dmy;
            item.color1 = setGroupS[4]+ ' ' + setGroupS[3];
        });
        //  AA0QYA4A:muji:ASIA:BLACK:#009:BK:#000000:f000011:20240821:f000001:1
        // console.log(data);
        let dataF = data.filter(i=>i.sTypeOtus === '1');
        // console.log(outsMode, dataF);
        dataF.sort((a,b)=>{
            return a.orderID >b.orderID?1:a.orderID <b.orderID?-1:0
                || a.targetPlaceID >b.targetPlaceID?1:a.targetPlaceID <b.targetPlaceID?-1:0
                || a.color1 >b.color1?1:a.color1 <b.color1?-1:0
        });

        let dataGroup = this.userService.groupBy(dataF, (c: any) => c.orderID);
        dataGroup = Object.values(dataGroup);

        const dataPrint: any = {
            repID: 'OutS-1BY1-rep10',
            factoryName,
            dmy,
            seasonYear: this.userService.seasonYear,
        };
        const docDefinition = this.orderService.productionOutS1BY1PDF(outsMode, dataGroup, dataPrint);
        pdfMake.createPdf(docDefinition).open();
    }

    inputUserPassPopup() {
        const ref = this.dialogService.open(SmdConfirmImportantTaskComponent, {
            data: {
                id: 'staffRefreshoutsourceFac',
                mode: 'RefreshoutsourceFac',
            },
            header: 'Confirmation for Refresh outsource by Factory-outsource',
            width: '30%'
        });

        ref.onClose.subscribe((data: any) => {
            // console.log(data);
            // console.log(this.canScanNode);
            // console.log(this.canScanSubNode);

            // console.log('showStaffLoginModal OK'); canScanSubNode

            // ## mode === 'cancelOrderQueue'
            if (data) {
                if (data.mode && data.mode === 'RefreshoutsourceFac' && data.success) {
                    // console.log(data);
                    this.getRepCompanyOrderOutsourceState('refresh');
                    // this.deleteOrderProductionQueuesCancel(orderProductionQueueList);
                } else {

                }
            }
        });
    }


    ngOnDestroy(): void {
        if (this.repCompanyOutsSub) { this.repCompanyOutsSub.unsubscribe(); }
        if (this.repCurrentProductionBundleStateSub) { this.repCurrentProductionBundleStateSub.unsubscribe(); }
        // if (this.customer1CompanySub) { this.customer1CompanySub.unsubscribe(); }
        // if (this.dataAroundAppSub) { this.dataAroundAppSub.unsubscribe(); }

        // if (this.langSub) { this.langSub.unsubscribe(); }
    }
}
