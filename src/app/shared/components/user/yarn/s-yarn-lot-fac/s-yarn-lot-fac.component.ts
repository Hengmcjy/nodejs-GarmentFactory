import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { DialogService } from 'primeng/dynamicdialog';
import { UserService } from 'src/app/services/user.service';
import { YarnService } from 'src/app/services/yarn.service';
import { ColorS, Company, Factory } from 'src/app/models/app.model';
import { GBC } from 'src/app/global/const-global';
import { Customer, OrderImage } from 'src/app/models/order.model';
import { PackageInfo, Yarn, YarnBoxInfo, YarnData, YarnDataInfo, YarnLotInfo } from 'src/app/models/yarn.model';
import { SmdYarnListsSelectComponent } from '../smd-yarn-lists-select/smd-yarn-lists-select.component';
import { MenuItem } from 'primeng/api';
import { SmdYarnLotTransferComponent } from '../smd-yarn-lot-transfer/smd-yarn-lot-transfer.component';
// import { SmdYarnLotManageComponent } from '../smd-yarn-lot-manage/smd-yarn-lot-manage.component';

@Component({
  selector: 'app-s-yarn-lot-fac',
  templateUrl: './s-yarn-lot-fac.component.html',
  styleUrls: ['./s-yarn-lot-fac.component.scss'],
  providers: [DialogService],
})
export class SYarnLotFacComponent implements OnInit, OnDestroy {
    productImageProfileGCSPath = GBC.productImageProfileGCSPath;  // ## google storage path
    nulltGCSPath= GBC.nulltGCSPath;
    @Input() mode = '';
    @Input() viewMode = '';  // ##  yarn-lot-fac  yarn-packaging-list-stock-card, yarn-ct-lot-fac
    @Input() yarnSeasonID = '';
    @Input() company: Company = GBC.clrCompany();
    @Input() factorySelect: Factory = GBC.clrFactory();
    @Input() factoryCTSelect: Factory = GBC.clrFactory();
    @Input() customer: Customer = GBC.clrCustomer();
    @Input() yarnPlan: YarnData = GBC.clrYarnData();
    @Input() yarnID = '';
    @Input() yarns: Yarn[] = [];
    @Input() yarnsCount: number = 0;
    @Input() yarnPlans: YarnData[] = [];
    @Input() yarnPlansCount: number = 0;

    @Output() closeYarnStockCard = new EventEmitter<any>();

    factorytransfers: Factory[] = [];

    // viewMode = 'yarn-packaging-list-stock-card';  // ##  yarn-packaging-list-stock-card
    loading: boolean[] = [false];
    finding: boolean[] = [false];
    items: MenuItem[] = [];

    yarnLotManageSlot = 6; // ## tab show .... tab
    yarnLot: YarnData[] = [];
    idxSelect = 0;
    yarnLotTransform: any[] = [];
    orderImagesSelect: OrderImage[] = [];
    orderImagesSelectArr: any[] = [];
    colorWeightTotal: any[] = [];

    uuid = '';
    // yarnID = '';
    yarnColorID = '';
    yarnDataUUID = '';
    colorSSelect: ColorS = GBC.clrOrderColor();
    yarnDataInfo_Receive: YarnDataInfo[] = [];

    // yarnSelect: Yarn = GBC.clrYarn();


    private dataAroundAppSub: Subscription = new Subscription();
    private yarnDataAroudAppSub: Subscription = new Subscription();
    private yarnData1Sub: Subscription = new Subscription();

    constructor(
        private router: Router,
        private location: Location,
        public dialogService: DialogService,

        public userService: UserService,
        public yarnService: YarnService,
    ) {}


    ngOnInit(): void {
        // console.log(this.viewMode);
        this.location.replaceState('/'); // ## hide loocation
        this.yarnLotManageSlot = this.userService.yarnLotManageSlot;  // ## tab show ....
        // this.yarnLotInfo.forEach( (item, index) => {
        // });
        for(let i = 0; i<this.yarnLotManageSlot;i++) {
            this.yarnLot.push(GBC.clrYarnData());
        }
        // console.log(this.factorySelect);
        this.factorytransfers = this.userService.getFactories();
        // && i.factoryID != this.factorySelect.factoryID
        if (this.viewMode === 'yarn-ct-lot-fac') {
            this.factorytransfers = [...this.factorytransfers.filter(i=>i.fInfo.isOutsource == false && i.factoryID != this.factoryCTSelect.factoryID)];
        } else {
            this.factorytransfers = [...this.factorytransfers.filter(i=>i.fInfo.isOutsource == false && i.factoryID != this.factorySelect.factoryID)];
        }
        // console.log(this.factorytransfers);


        this.dataAroundAppSub = this.userService
            .getDataAroundAppStatusListener()
            .subscribe((dataAroundApp) => {
                // ## declare initial variable from service user
                this.viewMode ='yarn-lot-fac';
                this.customer = dataAroundApp.customer;
                this.factorySelect = dataAroundApp.factorySelect;
                this.yarnSeasonID = dataAroundApp.yarnSeason;
                // this.checkMode();

                this.yarnLot[0] = GBC.clrYarnData();
                this.loading[0] = false;
                this.finding[0] = false;
                this.yarnLotTransform[0] = [];
                // this.yarnLot[0].yarnID = yarnID;
                this.orderImagesSelectArr[0] = [];
                this.colorWeightTotal = [];
            });
        this.yarnDataAroudAppSub = this.userService
            .getYarnDataAroudAppStatusListener()
            .subscribe((yranDataAroundApp) => {
                // ##
                // this.viewMode = yranDataAroundApp.viewMode;
                // this.checkMode();
            });

        if (this.viewMode === 'yarn-ct-lot-fac') {
            this.getYarnLotCFInfo(this.yarnID, 0);
        }
        // console.log(this.mode, this.viewMode);
    }

    yarnPackingListStockCardSelect(colorS: ColorS) {
        // this.yarnColorID = '';
        // this.yarnColorID = this.userService.genYarnColorID(colorS, ';');
        // this.colorS = colorS;
        // this.yarnDataUUID = '';
        // const yarnDataInfo_Receive =  this.yarnDataInfo_Receive;
        // const yarnData1 = yarnDataInfo_Receive.filter(i=>i.yarnColorID == this.yarnColorID);
        // if (yarnData1.length > 0) {
        //     this.yarnDataUUID = yarnData1[0].yarnDataUUID;
        // }
        // console.log(colorS);
        const yarnLotTransform1: any[] = this.yarnLotTransform[0];
        const yarnColorID = this.userService.genYarnColorID(colorS, ';');
        const yarnLotTransform1F = yarnLotTransform1.filter(i=>i.yarnColorID === yarnColorID);

        this.yarnColorID = yarnColorID;
        this.yarnDataUUID = yarnLotTransform1F.length>0?yarnLotTransform1F[0].yarnDataUUID:'';
        this.colorSSelect = colorS;
        this.viewMode = 'yarn-packaging-list-stock-card';
    }

    getYarnLotCFInfo(yarnID: string, idx: number) {
        this.uuid = '';
        const uuid = this.yarnPlan.uuid;
        // this.yarnID = '';
        this.idxSelect = idx;
        this.loading[idx] = true;
        this.yarnLot[idx] = GBC.clrYarnData();
        const companyID = this.company.companyID;
        let factoryID = this.factorySelect.factoryID;
        if (this.viewMode === 'yarn-ct-lot-fac') {
            factoryID = this.factoryCTSelect.factoryID;
        }
        const yarnSeasonID = this.yarnSeasonID;
        const type = ['receive'];
        const state = 'verified';
        const weightVerified = true;
        // console.log(companyID, factoryID, yarnSeasonID, yarnID, type, state, weightVerified);
        // getYarnLotCFInfo(companyID: string, factoryID: string, yarnSeasonID: string, yarnID: string, type: string[])
        this.yarnService.getYarnLotCFInfo(companyID, factoryID, yarnSeasonID, yarnID, uuid, type, state, weightVerified);
        if (this.yarnData1Sub) { this.yarnData1Sub.unsubscribe(); }
        this.yarnData1Sub = this.yarnService.getYarnData1Listener().subscribe((data) => {
            // console.log(data);
            if (data.yarnData) {
                this.uuid = data.yarnData.uuid;
                this.yarnID = data.yarnData.yarnID;
                this.finding[idx] = true;
                this.yarnLot[idx] = data.yarnData;
                // console.log(this.yarnLot);
                this.yarnLotTransform1(data.yarnData, idx);
                // this.getColorWeightTotal(data.yarnData, idx);
                this.orderImagesSelectArr[idx] = this.userService.getOrderImage(data.yarnData.orderID);
                // this.yarnLot[0].colorS

            } else {
                this.uuid = '';
                this.yarnID = '';
                this.finding[idx] = false;
                this.yarnLotTransform[idx] = [];
                this.yarnLot[idx] = GBC.clrYarnData();
                this.yarnLot[idx].yarnID = yarnID;
                this.orderImagesSelectArr[idx] = [];
                this.colorWeightTotal = [];
            }
            // orderImagesSelect: OrderImage[] = [];
            // orderImagesSelectArr: any[] = [];

            // this.orderImagesSelect = [];
            // this.orderImagesSelect = this.userService.getOrderImage(this.orderIDsSelect);

            this.loading[idx] = false;
            // console.log(this.yarnLot);
            // console.log(this.loading[idx], this.finding[idx]);
        });
    }



    getYarnLotTransform1(colorS: ColorS, idx: number): any[] {
        const yarnLotTransform1: any[] = [...this.yarnLotTransform[idx]];
        const yarnLotTransform1F = yarnLotTransform1.filter(i=>
            i.colorID == colorS.color.colorID &&
            i.colorCode == colorS.color.colorCode);
        // console.log(yarnLotTransform1);
        if (yarnLotTransform1F.length > 0) {
            return yarnLotTransform1F[0].packageInfo;
        }
        return [];
    }

    yarnLotTransform1(yarnLot: YarnData, idx: number) {
        this.yarnDataInfo_Receive = [];
        this.yarnDataInfo_Receive = [...yarnLot.yarnDataInfo.filter(i=>i.type == 'receive')];

        this.yarnLotTransform[idx] = [];
        let yarnLotTransform1: any = {
            yarnSeasonID: yarnLot.yarnSeasonID,
            yarnID: yarnLot.yarnID,
            uuid: yarnLot.uuid,
            colorID: '',
            colorCode: '',
            yarnColorID: '',
            yarnDataUUID: '',
            packageInfo: []
        };

        //  ## set yarnColorID   this.userService.genYarnColorID(item, ';')
        let  yarnColorIDArr: any[] = [];
        yarnLot.colorS.forEach( (item, index) => {
            let yarnLotTransform1x = {...yarnLotTransform1};
            yarnLotTransform1x.colorID = item.color.colorID;
            yarnLotTransform1x.colorCode = item.color.colorCode;
            yarnLotTransform1x.yarnColorID = this.userService.genYarnColorID(item, ';'),
            yarnLotTransform1x.packageInfo = this.getPackageInfo1(yarnLot, this.userService.genYarnColorID(item, ';'))
            yarnColorIDArr.push(yarnLotTransform1x);
        });
        yarnColorIDArr.forEach( (item, index) => {
            item.yarnDataUUID = this.getYarnDataUUID1(yarnLot, item.yarnColorID, item.packageInfo);
        });
        yarnColorIDArr.forEach( (item, index) => {
            item.packageInfo = this.getYarnPackageInfo1(item.yarnDataUUID, item.packageInfo);
        });

        // console.log(yarnColorIDArr);
        this.yarnLotTransform[idx] = yarnColorIDArr;
        this.setColorWeightTotal(idx);
        // console.log(this.yarnLotTransform);
    }

    setColorWeightTotal(idx: number) {
        this.colorWeightTotal = [];
        const yarnLotTransform1: any[] = this.yarnLotTransform[idx];

        function getTotalPackageInfo(packageInfo: any[]): number {
            const total1 = +packageInfo.reduce((prev, cur) => {return prev + cur.useWeight;}, 0).toFixed(2);
            return total1;
        }

        yarnLotTransform1.forEach( (item, index) => {
            const colorWeightTotal1: any = {
                colorID: item.colorID,
                colorCode: item.colorCode,
                totalYarnWeight: getTotalPackageInfo(item.packageInfo)
            }
            this.colorWeightTotal.push(colorWeightTotal1);
        });
        // console.log(this.colorWeightTotal);
    }

    getColorWeightTotal(colorS: ColorS) {
        const colorWeightTotalF = this.colorWeightTotal.filter(i=>
            i.colorID == colorS.color.colorID &&
            i.colorCode == colorS.color.colorCode
        );
        if (colorWeightTotalF.length > 0) {
            return colorWeightTotalF[0].totalYarnWeight > 0?colorWeightTotalF[0].totalYarnWeight:'';
        } else {
            return '';
        }
    }

    getYarnPackageInfo1(yarnDataUUID: string, packageInfo: any[]) {
        packageInfo.forEach( (item, index) => {
            item.yarnDataUUID = yarnDataUUID;
        });
        return packageInfo;
    }

    getYarnDataUUID1(yarnLot: YarnData, yarnColorID: string, packageInfo: any[]): string {
        let yarnLotUUID = '';
        let yarnDataUUID = '';
        if (packageInfo.length === 0) {
            return '';
        } else {
            yarnLotUUID = packageInfo[0].yarnLotUUID;
        }
        // console.log(yarnLotUUID);
        const yarnDataInfoF = yarnLot.yarnDataInfo.filter(i=>i.yarnColorID == yarnColorID);
        // console.log(yarnDataInfoF);
        yarnDataInfoF.forEach( (item, index) => {
            const packageInfoF = item.packageInfo.filter(i=>i.yarnLotUUID == yarnLotUUID);
            // console.log(packageInfoF);
            if (packageInfoF.length > 0) {
                yarnDataUUID = item.yarnDataUUID;
            }
        });
        // console.log(yarnColorID, packageInfo);
        // console.log(yarnDataUUID);
        return yarnDataUUID;
    }

    getPackageInfo1(yarnLot: YarnData, yarnColorID: string) {
        const yarnDataInfoF = yarnLot.yarnDataInfo.filter(i=>i.yarnColorID == yarnColorID);
        let packageInfo1: any[] = [];
        yarnDataInfoF.forEach( (item, index) => {
            item.packageInfo.forEach( (item2, index2) => {
                packageInfo1.push({
                    yarnLotID: item2.yarnLotID,
                    yarnLotUUID: item2.yarnLotUUID,
                    yarnBoxInfo: item2.yarnBoxInfo,
                    yarnColorID: yarnColorID,
                    uuid: yarnLot.uuid,
                    useWeight: this.getTotalUseWeight(item2.yarnBoxInfo)
                });
            });

        });
        // console.log(yarnDataInfoF);
        return packageInfo1;
    }

    getTotalUseWeight(yarnBoxInfo: YarnBoxInfo[]): number {
        const yarnBoxInfoF = yarnBoxInfo.filter(i=>i.used === false);
        const totalUseWeight = +yarnBoxInfoF.reduce((prev, cur) => {return prev + cur.useWeight;}, 0).toFixed(2);
        return totalUseWeight;
    }

    setYarnLotMenuPopup(idx: number, yarnLotID: string, yarnLotUUID: string, packageInfo1: any) {
        // const factoryIDBox = '';
        const yarnID = this.yarnLot[idx].yarnID;
        const uuid = this.yarnLot[idx].uuid;
        const yarnSeasonID = this.yarnSeasonID;
        const yarnDataUUID = packageInfo1.yarnDataUUID;
        const yarnColorID = packageInfo1.yarnColorID;
        this.yarnDataUUID = this.yarnLotTransform.length>0?this.yarnLotTransform[0].yarnDataUUID:'';

        // viewMode = '';  // ##  yarn-lot-fac  yarn-packaging-list-stock-card, yarn-ct-lot-fac
        let factoryIDBox = '';
        if (this.viewMode === 'yarn-ct-lot-fac') {
            factoryIDBox = this.factoryCTSelect.factoryID;
        } else if (this.viewMode === 'yarn-lot-fac') {
            factoryIDBox = this.factorySelect.factoryID;
        }

        const factorytransferEmpty = GBC.clrFactory();
        let itemFActoryTransfer: any[] = [];
        this.factorytransfers.forEach( (item, index) => {
            itemFActoryTransfer.push({
                label: '-------------------------------> ' + item.fInfo.factoryName,
                visible: true,
                command: () => {
                    this.showYarnLotInfo(item, factoryIDBox, ['transfer'], yarnID, uuid, this.yarnDataUUID, yarnSeasonID, yarnColorID, yarnLotID, yarnLotUUID);
                }
            });
        });
        this.items = [
            {
                label: 'Yarn Lot ID: ' + yarnLotID,
                items: [
                    {
                        label: 'view box',
                        icon: 'pi pi-fw pi-eye',
                        visible: true,
                        command: () => {
                            this.showYarnLotInfo(factorytransferEmpty, factoryIDBox, ['view'], yarnID, uuid, yarnDataUUID, yarnSeasonID, yarnColorID, yarnLotID, yarnLotUUID);
                        }
                    },
                    {
                        label: 'divide box',
                        icon: 'pi pi-fw pi-clone',
                        visible: true,
                        command: () => {
                            this.showYarnLotInfo(factorytransferEmpty, factoryIDBox, ['divide'], yarnID, uuid, yarnDataUUID, yarnSeasonID, yarnColorID, yarnLotID, yarnLotUUID);
                        }
                    },
                ]
            },
            {
                separator: true
            },
            {
                label: this.factorySelect.fInfo.factoryName + ' transfer to ...',
                icon: 'pi pi-fw pi-share-alt',
                items: [...itemFActoryTransfer]
            }
        ];
    }

    showYarnLotInfo(factorytransfer: Factory, factoryIDBox: string, modeArr: string[], yarnID: string, uuid: string, yarnDataUUID: string, yarnSeasonID: string, yarnColorID: string, yarnLotID: string, yarnLotUUID: string) {
        const ref = this.dialogService.open(SmdYarnLotTransferComponent, {
            data: {
                id: 'yarnBoxTransfer',
                company: this.userService.getCompany(),
                customer: this.customer,
                factorySelect: this.factorySelect,
                factorytransfer: factorytransfer?factorytransfer:GBC.clrFactory(),
                factoryIDBox: factoryIDBox,
                orderImages: [],
                modeArr: modeArr,  //  ## [transfer , divide]
                yarnID: yarnID,
                uuid: uuid,
                yarnSeasonID: yarnSeasonID,
                yarnDataUUID: yarnDataUUID,
                yarnColorID: yarnColorID,
                yarnLotID: yarnLotID,
                yarnLotUUID: yarnLotUUID,
                confirmDate: '',
                btnCaption: 'choose'

            },
            header: 'Yarn Boxes info',
            width: '80%',
            height: '100%',

        });

        ref.onClose.subscribe((data: any) => {
            this.getYarnLotCFInfo(yarnID, this.idxSelect);
            // console.log(data);
            if (!data) {

            } else {
                // this.yarnSelects = [];
                // this.orderImagesSelect = [];
                // this.orderImagesSelect.push(data.orderImage);
                // this.orderImagesSelect[idx] = {orderID: data.orderImage.orderID, imageProfile: data.orderImage.imageProfile};
            }

        });
    }

    // setMenuPopup(idx: number, packageInfo1: any, colorS: ColorS) {
    //     const uuid = packageInfo1.uuid;
    //     const yarnDataUUID = packageInfo1.yarnDataUUID;
    //     const yarnLotID = packageInfo1.yarnLotID;
    //     const yarnLotUUID = packageInfo1.yarnLotUUID;
    //     const yarnColorID = packageInfo1.yarnColorID;

    //     this.items = [{
    //         label: 'Yarn Lot ID: ' + yarnLotID,
    //         visible: true,
    //         items: [
    //             {
    //                 label: 'divide box',
    //                 icon: 'pi pi-fw pi-clone',
    //                 visible: true,
    //                 // visible: packageInfo.state!=='verified',
    //                 command: () => {
    //                     this.showYarnLotManage(idx, uuid, yarnDataUUID, 'divide', yarnLotUUID, yarnLotID, colorS, yarnColorID);
    //                 }
    //             },

    //             {
    //                 label: 'transfer to ...',
    //                 icon: 'pi pi-fw pi-share-alt',
    //                 visible: true,
    //                 command: () => {
    //                     this.showYarnLotManage(idx, uuid, yarnDataUUID, 'transfer', yarnLotUUID, yarnLotID, colorS, yarnColorID);
    //                 }
    //             },

    //             // {
    //             //     label: 'view data',
    //             //     icon: 'pi pi-fw pi-check-square',
    //             //     visible: packageInfo.state==='verified',
    //             //     command: () => {
    //             //         this.showYarnLotManage(monthShortName, yarnDataInfo, 'view', yarnLotUUID);
    //             //     }
    //             // },


    //         ]
    //     }];
    // }

    getTAbHeader(yarnData: YarnData, idx: number): string {
        if (yarnData.yarnID !== '') {
            return this.userService.strFirstAndDot(yarnData.yarnID, 30)
        }
        return +idx+1 +'. select ...';
    }

    // // ##  yarnLotMode = add , edit, confirm       , divide
    // showYarnLotManage(idx: number, uuid: string, yarnDataUUID: string, yarnLotMode: string, yarnLotUUID: string, yarnLotID: string, colorS: ColorS, yarnColorID: string) {
    //     const mode = 'divide';
    //     const mmdd = '';
    //     const yarnPlanF = this.yarnLot.filter(i=> i.uuid = uuid);
    //     const yarnPlan = yarnPlanF[0];
    //     console.log(yarnPlan);
    //     const yarnDataInfo = yarnPlan.yarnDataInfo.filter(i=> i.yarnDataUUID == yarnDataUUID)[0];
    //     // console.log(mode, idx);
    //     const ref = this.dialogService.open(SmdYarnLotManageComponent, {
    //         data: {
    //             id: 'yarnLotAdd',
    //             yarnLotMode: yarnLotMode,
    //             yarnLotUUID: yarnLotUUID,
    //             yarnLotID: yarnLotID,
    //             mode: mode,  // ## mode =
    //             mmddSelect: mmdd,
    //             company: this.userService?.getCompany(),
    //             factorySelect: this.factorySelect,
    //             customer: this.customer,
    //             yarnSeason: this.yarnSeasonID,
    //             colorS: colorS,
    //             yarnPlan: yarnPlan,
    //             yarnColorID: yarnColorID,
    //             orderImagesSelect: this.orderImagesSelectArr[idx],
    //             yarnDataInfo: yarnDataInfo,
    //             btnCaption: 'choose'

    //         },
    //         header: 'Yarn Lot [add/edit new Lot]',
    //         width: '80%',
    //     });

    //     ref.onClose.subscribe((data: any) => {
    //         // console.log(data);
    //         if (!data) {

    //         } else {
    //             // this.getYarnPlansList1();
    //             // this.yarnSelects = [];
    //             // this.orderImagesSelect = [];
    //             // this.orderImagesSelect.push(data.orderImage);
    //             // this.orderImagesSelect[idx] = {orderID: data.orderImage.orderID, imageProfile: data.orderImage.imageProfile};
    //         }

    //     });
    // }

    showYarnList(mode: string, idx: number) {
        // this.yarnSelect = GBC.clrYarn();
        const ref = this.dialogService.open(SmdYarnListsSelectComponent, {
            data: {
                id: 'yarnSelection',
                company: this.userService?.getCompany(),
                yarns: this.yarns,
                idx: idx,
                mode: mode,
                btnCaption: 'choose'

            },
            header: 'Yarn Selection',
            width: '80%',
        });

        ref.onClose.subscribe((data: any) => {
            // console.log(data);
            if (!data) {
                // console.log(data);
                // this.yarnLot[idx] = GBC.clrYarnData();
            } else if (mode === 'yarn-lists-select2') {
                // console.log(data , '.........................')
                // console.log(this.yarnLotInfo);
                const yarnLot = [...this.yarnLot];
                const yarnLotF = yarnLot.filter(i => i.yarnID === data.yarnID);
                if (yarnLotF.length <= 0) {
                    // this.yarnLot[idx].yarnID = data.yarnID;
                    // console.log(this.yarnLot);
                    this.getYarnLotCFInfo(data.yarnID, idx)
                }
            }

        });
    }

    closePage() {
        this.closeYarnStockCard.emit('close page');
    }

    backToYarnLotFac(data: any) {
        this.viewMode = 'yarn-lot-fac';
    }

    // backToPlanList(data: any) {
    //     this.viewMode = 'plan-list';
    //     // console.log(this.viewMode);
    //     if (data) {
    //         this.getYarnPlansList1();
    //     }
    // }

    ngOnDestroy(): void {
        if (this.dataAroundAppSub) { this.dataAroundAppSub.unsubscribe(); }
        if (this.yarnDataAroudAppSub) { this.yarnDataAroudAppSub.unsubscribe(); }
        if (this.yarnData1Sub) { this.yarnData1Sub.unsubscribe(); }

    }
}
