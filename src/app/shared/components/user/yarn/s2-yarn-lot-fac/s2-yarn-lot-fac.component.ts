import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import { GBC } from 'src/app/global/const-global';
import { ColorS, Company, Factory } from 'src/app/models/app.model';
import { YarnBoxInfo, YarnData, YarnDataInfo } from 'src/app/models/yarn.model';
import { UserService } from 'src/app/services/user.service';
import { YarnService } from 'src/app/services/yarn.service';
import { SmdYarnLotTransferComponent } from '../smd-yarn-lot-transfer/smd-yarn-lot-transfer.component';
import { Customer } from 'src/app/models/order.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-s2-yarn-lot-fac',
  templateUrl: './s2-yarn-lot-fac.component.html',
  styleUrls: ['./s2-yarn-lot-fac.component.scss'],
  providers: [DialogService],
})
export class S2YarnLotFacComponent implements OnInit, OnDestroy {
    @Input() viewMode = '';
    @Input() yarnSeasonID = '';
    @Input() yarnPlan: YarnData = GBC.clrYarnData();
    @Input() yarnID = '';
    @Input() yarnLot: YarnData[] = [];
    @Input() company: Company = GBC.clrCompany();
    @Input() factorySelect: Factory = GBC.clrFactory();
    @Input() factoryCTSelect: Factory = GBC.clrFactory();
    @Input() customer: Customer = GBC.clrCustomer();
    @Input() isShowStylePanel = false;

    productImageProfileGCSPath = GBC.productImageProfileGCSPath;  // ## google storage path
    nulltGCSPath= GBC.nulltGCSPath;

    items: MenuItem[] = [];

    idxSelect = 0;
    uuid = '';
    factorytransfers: Factory[] = [];
    yarnColorID = '';
    yarnDataUUID = '';
    colorSSelect: ColorS = GBC.clrOrderColor();
    orderImagesSelectArr: any[] = [];
    yarnLotTransform: any[] = [];
    colorWeightTotal: any[] = [];
    yarnDataInfo_Receive: YarnDataInfo[] = [];

    private dataAroundAppSub: Subscription = new Subscription();
    private yarnDataAroudAppSub: Subscription = new Subscription();
    private yarnData1Sub: Subscription = new Subscription();

    constructor(
        public dialogService: DialogService,

        public userService: UserService,
        public yarnService: YarnService,
    ) {}

    ngOnInit(): void {
        console.log(this.yarnLot);
        // console.log(this.yarnLot);
        this.dataAroundAppSub = this.userService
            .getDataAroundAppStatusListener()
            .subscribe((dataAroundApp) => {
                // ## declare initial variable from service user
                // this.viewMode ='yarn-lot-fac';
                this.customer = dataAroundApp.customer;
                this.factorySelect = dataAroundApp.factorySelect;
                this.yarnSeasonID = dataAroundApp.yarnSeason;
                // this.checkMode();

                this.yarnLot[0] = GBC.clrYarnData();
                // this.loading[0] = false;
                // this.finding[0] = false;
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
                console.log('yarnDataAroudAppSub');
            });

        if (this.viewMode === 'yarn-ct-lot-fac') {
            this.getYarnLotCFInfo(this.yarnID, 0);
        }
    }

    getYarnLotCFInfo(yarnID: string, idx: number) {
        this.uuid = '';
        const uuid = this.yarnPlan.uuid;
        // this.yarnID = '';
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
                // this.finding[idx] = true;
                this.yarnLot[idx] = data.yarnData;
                // console.log(this.yarnLot);
                this.yarnLotTransform1(data.yarnData, idx);
                // this.getColorWeightTotal(data.yarnData, idx);
                this.orderImagesSelectArr[idx] = this.userService.getOrderImage(data.yarnData.orderID);
                // this.yarnLot[0].colorS

            } else {
                this.uuid = '';
                this.yarnID = '';
                // this.finding[idx] = false;
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

            // this.loading[idx] = false;
            // console.log(this.yarnLot);
            // console.log(this.loading[idx], this.finding[idx]);
        });
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

    getYarnPackageInfo1(yarnDataUUID: string, packageInfo: any[]) {
        packageInfo.forEach( (item, index) => {
            item.yarnDataUUID = yarnDataUUID;
        });
        return packageInfo;
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

    ngOnDestroy(): void {
        if (this.dataAroundAppSub) { this.dataAroundAppSub.unsubscribe(); }
        if (this.yarnDataAroudAppSub) { this.yarnDataAroudAppSub.unsubscribe(); }
        if (this.yarnData1Sub) { this.yarnData1Sub.unsubscribe(); }

    }
}
