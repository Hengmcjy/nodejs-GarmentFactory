import {  Component, OnDestroy, OnInit } from '@angular/core';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { GBC } from 'src/app/global/const-global';
import { ColorS, Company, Factory } from 'src/app/models/app.model';
import { Customer, OrderImage } from 'src/app/models/order.model';
import { PackageInfo, YarnBoxInfo, YarnData, YarnDataInfo } from 'src/app/models/yarn.model';
import { UserService } from 'src/app/services/user.service';
import { YarnService } from 'src/app/services/yarn.service';

@Component({
  selector: 'app-smd-yarn-lot-manage',
  templateUrl: './smd-yarn-lot-manage.component.html',
  styleUrls: ['./smd-yarn-lot-manage.component.scss']
})
export class SmdYarnLotManageComponent implements OnInit, OnDestroy {
    yarnLotMode = '';  // ##  add , edit, confirm
    mode = '';  // ## yarn-packaging-list-manage
    yarnSeason = '';
    company: Company = GBC.clrCompany();
    factorySelect: Factory = GBC.clrFactory();
    customer: Customer = GBC.clrCustomer();
    mmddSelect = '';
    orderImagesSelect: OrderImage[] = [];
    colorS: ColorS = GBC.clrOrderColor();
    yarnColorID = '';
    yarnPlan: YarnData = GBC.clrYarnData();
    yarnDataInfo: YarnDataInfo = GBC.clrYarnDataInfo();
    yarnDataUUID = '';
    yarnLotUUID = '';

    invoiceIDInputShow = false;
    cartonWeightShow = false;
    coneWeightShow = false;


    productImageProfileGCSPath = GBC.productImageProfileGCSPath;  // ## google storage path
    nulltGCSPath= GBC.nulltGCSPath;

    yarnDevideSign = '';
    data: any;
    buttonPressed = false;
    btnLabel = 'add new Yarn Lot ID';

    yarnLotIDSelect = '';
    invoiceIDSelect = '';
    packageInfo: PackageInfo = GBC.clrPackageInfo();
    // yarnBoxInfo: YarnBoxInfo[]= [];
    yarnBoxInfoEmpty1: YarnBoxInfo = GBC.clrYarnBoxInfo(); // ## empty
    yarnBoxInfo: YarnBoxInfo[] = [];
    yarnBoxInfoShow: YarnBoxInfo[] = [];

    yarnLotIDSelectErrCode = '';
    invoiceIDSelectErrCode = '';
    dataValidateOK = false;
    countingDel = 0;
    boxQty = 1;

    // datetime: Date = new Date();
    // yarnWeight: number = 0.00;

    page = 0;
    first: number = 0;
    rows: number = 100;
    totalRecords = 0;
    rowsPerPageOptions = [100];

    boxIDIDXSelect = -1;

    constructor(
        public config: DynamicDialogConfig,
        public ref: DynamicDialogRef,

        public userService: UserService,
        public yarnService: YarnService,
    ) {}

    ngOnInit(): void {
        this.data = this.config.data;
        this.yarnLotMode = this.data.yarnLotMode;
        this.mode = this.data.mode;
        this.mmddSelect = this.data.mmddSelect;
        this.yarnSeason = this.data.yarnSeason;
        this.company = this.data.company;
        this.factorySelect = this.data.factorySelect;
        this.customer = this.data.customer;
        this.orderImagesSelect = this.data.orderImagesSelect;
        this.colorS = this.data.colorS;
        this.yarnColorID = this.data.yarnColorID;
        this.yarnPlan = this.data.yarnPlan;
        this.yarnDataInfo = this.data.yarnDataInfo;
        this.yarnDataUUID = this.yarnDataInfo.yarnDataUUID;
        this.yarnLotUUID = this.data.yarnLotUUID;
        this.yarnDevideSign = this.userService.yarnDevideSign;

        if (this.yarnLotMode === 'edit') {
            this.invoiceIDInputShow = false;
        }

        // console.log(this.mode);
        // console.log(this.yarnLotMode);
        this.yarnBoxInfoShow = [];
        // console.log(this.data);
        // console.log(this.yarnDataInfo);
        // console.log(this.yarnLotUUID);
        if (this.yarnLotMode === 'edit' || this.yarnLotMode === 'confirm'|| this.yarnLotMode === 'view') {
            // this.btnLabel = 'edit Yarn Lot ID';
            // this.btnLabel = 'Confirm Yarn Lot ID';
            this.btnLabel = this.yarnLotMode === 'edit'?'edit Yarn Lot ID'
                :this.yarnLotMode === 'confirm'?'edit Yarn Lot ID':'';
            // const yarnBoxInfo1 = this.yarnDataInfo.packageInfo.filter(i=>i.yarnLotUUID === this.yarnLotUUID);
            this.packageInfo = this.yarnDataInfo.packageInfo.filter(i=>i.yarnLotUUID === this.yarnLotUUID)[0];
            // this.boxCounting(); // ## new calculation box counting
            this.yarnBoxInfo = this.packageInfo.yarnBoxInfo.filter(i=>i.boxID.split(this.yarnDevideSign).length === 1);



            this.packageInfo.yarnBoxInfo = this.packageInfo.yarnBoxInfo.filter(i=>i.boxID.split(this.yarnDevideSign).length === 1);
            // this.yarnBoxInfoShow = [...this.packageInfo.yarnBoxInfo];
            // this.packageInfo.yarnBoxInfo = [];

            // const packageInfo1 = [...this.packageInfo.yarnBoxInfo];
            // this.packageInfo.yarnBoxInfo = [];
            // const len1 = packageInfo1.length;
            // let round1 = 0;
            // setTimeout(() => {
            //     let packageInfoX: YarnBoxInfo[] = [];
            //     const start1 = (round1 * 100) + 1;
            //     const end1 = ((round1 + 1) * 100) - 1;
            //     for (let i = start1; i <= end1; i++) {
            //         if (i <= len1) {
            //             packageInfoX.push(packageInfo1[i]);
            //         }
            //     }
            //     // let loadedProducts = this.products.slice(event.first, event.first + event.rows);
            //     // Array.prototype.splice.apply(this.virtualProducts, [...[event.first, event.rows], ...loadedProducts]);
            //     // event.forceUpdate();
            //     if (this.packageInfo.yarnBoxInfo.length < len1) {
            //         this.packageInfo.yarnBoxInfo = [...this.packageInfo.yarnBoxInfo, ...packageInfoX];
            //     }
            //     round1++;
            // }, 1000);




            // this.yarnBoxInfo.forEach( (item, index) => {
            //     item.useWeight = +item.useWeight.toFixed(2);
            //     item.yarnPlanWeight = +item.yarnPlanWeight.toFixed(2);
            //     item.yarnWeight = +item.yarnWeight.toFixed(2);
            // });
            // this.yarnBoxInfo = this.packageInfo.yarnBoxInfo;
            this.yarnLotIDSelect = this.packageInfo.yarnLotID;
            this.invoiceIDSelect = this.packageInfo.invoiceID;
            this.packageInfo.yarnBoxInfo.forEach( (item, index) => {
                item.state = 'old';
            });
            this.validateData();
        }
        // boxVerified: 0,
        //     boxWait: 0,
    }

    // getYarnBoxInfo(yarnBoxInfo: YarnBoxInfo[]): YarnBoxInfo[] {
    //     const yarnBoxInfo1 = yarnBoxInfo.filter(i=>i.boxID.split(this.yarnDevideSign).length == 1);
    //     return yarnBoxInfo1;
    // }

    setInvoiceIDInputShow() {
        if (this.yarnLotMode === 'edit') {
            this.invoiceIDInputShow = !this.invoiceIDInputShow;
        }
    }

    setCartonWeightShow() {
        if (this.yarnLotMode === 'edit') {
            this.cartonWeightShow = !this.cartonWeightShow;
        }
    }

    setConeWeightShow() {
        if (this.yarnLotMode === 'edit') {
            this.coneWeightShow = !this.coneWeightShow;
        }
    }
    // cartonWeightShow = false;
    // coneWeightShow = false;

    clickCountingDelete() {
        if (this.yarnLotMode === 'edit') {
            this.countingDel++;
            if (this.countingDel >= 5) {
                this.putDelYarnPackingList1();
            }
        }
    }

    putDelYarnPackingList1() {
        // putDelYarnPackingList1(userID: string, companyID: string, factoryID: string, customerID: string, uuid: string,
        //     yarnSeasonID: string, yarnID: string,
        //     yarnDataUUID: string, yarnColorID: string, type: string,
        //     invoiceID: string, yarnLotID: string, yarnLotUUID: string)

        const userID = this.userService.getUser().userID;
        const companyID = this.company.companyID;
        const factoryID = this.factorySelect.factoryID;
        const customerID = this.customer.customerID;
        const setName = this.customer.setName;
        const yarnID = this.yarnPlan.yarnID;
        const uuid = this.yarnPlan.uuid;
        // const yarnDataUUID = this.data.yarnDataUUID;
        const yarnSeason = this.yarnSeason;
        const type = 'receive';
        const yarnColorID = this.yarnColorID;
        // const yarnDataUUID = yarnDataUUID;
        // const orderIDs = this.userService.getOrderIDss(); invoiceID

        const yarnLotID = this.yarnLotIDSelect;
        const invoiceID = this.invoiceIDSelect;
        const yarnLotUUID = this.packageInfo.yarnLotUUID;

        this.yarnService.putDelYarnPackingList1(userID, companyID, factoryID, customerID, uuid,
            yarnSeason, yarnID, this.yarnDataUUID, yarnColorID, type,
            invoiceID, yarnLotID, yarnLotUUID);

        this.ref.close('DeleteYarnLotID');
    }

    updateYarnLot() {
        const validated =  this.validateData();
        if (validated) {
            // console.log('validated = ' + validated);
            if (this.yarnLotMode === 'add') {
                this.putAddYarnLotID1();
            } else if (this.yarnLotMode === 'edit') {
                this.putEditYarnLotID1();
            } else if (this.yarnLotMode === 'confirm') {
                this.putEditYarnLotIDState2();
            }
        } else {
            // console.log('validated = ' + validated);
        }
    }

    confirmYarnLot() {
        // console.log('confirm = ');
        if (this.yarnLotMode === 'confirm') {
            this.putEditYarnLotIDState2();
        }
    }

    putAddYarnLotID1() {
        // putAddYarnLotID1(userID: string, companyID: string, factoryID: string, customerID: string, uuid: string,
        //     yarnSeasonID: string, yarnID: string,
        //     yarnDataUUID: string, yarnColorID: string, type: string)
        const userID = this.userService.getUser().userID;
        const companyID = this.company.companyID;
        const factoryID = this.factorySelect.factoryID;
        const customerID = this.customer.customerID;
        const setName = this.customer.setName;
        const yarnID = this.yarnPlan.yarnID;
        const uuid = this.yarnPlan.uuid;
        // const yarnDataUUID = this.data.yarnDataUUID;
        const yarnSeason = this.yarnSeason;
        const type = 'receive';
        const yarnColorID = this.yarnColorID;
        // const yarnDataUUID = yarnDataUUID;
        // const orderIDs = this.userService.getOrderIDss(); invoiceID

        const yarnLotID = this.yarnLotIDSelect;
        const invoiceID = this.invoiceIDSelect;
        const coneWeight = this.packageInfo.coneWeight;
        const boxWeight = this.packageInfo.boxWeight;


        this.yarnService.putAddYarnLotID1(userID, companyID, factoryID, customerID, uuid,
            yarnSeason, yarnID, this.yarnDataUUID, yarnColorID, type,
            invoiceID, yarnLotID, coneWeight, boxWeight,
            this.packageInfo.yarnBoxInfo);
        this.ref.close('addnewYarnLotID');
    }

    putEditYarnLotID1() {
        // putAddYarnLotID1(userID: string, companyID: string, factoryID: string, customerID: string, uuid: string,
        //     yarnSeasonID: string, yarnID: string,
        //     yarnDataUUID: string, yarnColorID: string, type: string)
        const userID = this.userService.getUser().userID;
        const companyID = this.company.companyID;
        const factoryID = this.factorySelect.factoryID;
        const customerID = this.customer.customerID;
        const setName = this.customer.setName;
        const yarnID = this.yarnPlan.yarnID;
        const uuid = this.yarnPlan.uuid;
        // const yarnDataUUID = this.data.yarnDataUUID;
        const yarnSeason = this.yarnSeason;
        const type = 'receive';
        const yarnColorID = this.yarnColorID;
        // const yarnDataUUID = yarnDataUUID;
        // const orderIDs = this.userService.getOrderIDss();

        const yarnLotID = this.yarnLotIDSelect;
        const yarnLotUUID = this.yarnLotUUID;
        const invoiceID = this.invoiceIDSelect;
        const coneWeight = this.packageInfo.coneWeight;
        const boxWeight = this.packageInfo.boxWeight;

        this.yarnService.putEditYarnLotID1(userID, companyID, factoryID, customerID, uuid,
            yarnSeason, yarnID, this.yarnDataUUID, yarnColorID, type,
            yarnLotID, this.packageInfo.yarnBoxInfo,
            yarnLotUUID, invoiceID, coneWeight, boxWeight);
        this.ref.close('editYarnLotID');
    }

    putEditYarnLotIDState2() {
        // putAddYarnLotID1(userID: string, companyID: string, factoryID: string, customerID: string, uuid: string,
        //     yarnSeasonID: string, yarnID: string,
        //     yarnDataUUID: string, yarnColorID: string, type: string)
        const userID = this.userService.getUser().userID;
        const companyID = this.company.companyID;
        const factoryID = this.factorySelect.factoryID;
        const customerID = this.customer.customerID;
        const setName = this.customer.setName;
        const yarnID = this.yarnPlan.yarnID;
        const uuid = this.yarnPlan.uuid;
        // const yarnDataUUID = this.data.yarnDataUUID;
        const yarnSeason = this.yarnSeason;
        const type = 'receive';
        const yarnColorID = this.yarnColorID;
        // const yarnDataUUID = yarnDataUUID;
        // const orderIDs = this.userService.getOrderIDss();

        const yarnLotID = this.yarnLotIDSelect;
        const yarnLotUUID = this.yarnLotUUID;
        const state = 'verified';

        const packageInfo = this.packageInfo;
        const usageMode = 'ct';  // ## ct= fromCustomer , t=transfer , p=produce

        this.yarnService.putEditYarnLotIDState2(userID, companyID, factoryID, customerID, uuid,
            yarnSeason, yarnID, this.yarnDataUUID, yarnColorID, type,
            yarnLotID, this.packageInfo.yarnBoxInfo, yarnLotUUID, state , packageInfo, usageMode);
        this.ref.close('editYarnLotIDState');
    }

    // export class YarnBoxInfo {
    //     constructor(
    //         public boxID: string,
    //         public boxUUID: string,
    //         public coneQty: number,
    //         public factoryID: string,  // ## current factory store
    //         public yarnPlanWeight: number,   // {type: mongoose.Types.Decimal128},
    //         public yarnWeight: number,   // {type: mongoose.Types.Decimal128},
    //         public yarnWeightNet: number,   // {type: mongoose.Types.Decimal128},
    //         public useWeight: number,   // {type: mongoose.Types.Decimal128},
    //         public yarnTransferWeight: number,   // {type: mongoose.Types.Decimal128},

    //         public weightVerified: boolean,
    //         public used: boolean,

    //         public yarnWeightTotalDifPercent: string,
    //         public yarnWeightDif: number,
    //         public cCWeight: number,  // ## cC = carton & cone weight   yarnWeightTotalDifPercent
    //         public state: string,  // ## new, old
    //         public errCode: string,
    //         public factoryIDBox: string,
    //     ) {}
    // }

    invHeadCopyW() {
        // console.log('invHeadCopyW');
        const yarnPlanWeight = this.packageInfo.yarnBoxInfo[0].yarnPlanWeight;
        if (this.yarnLotMode !== 'confirm' && this.yarnLotMode !== 'view') {
            this.packageInfo.yarnBoxInfo.forEach( (item, index) => {
                item.yarnPlanWeight = yarnPlanWeight;
            });
        }
    }

    coneHeadCopyW() {
        // console.log('coneHeadCopyW');
        const coneQty = this.packageInfo.yarnBoxInfo[0].coneQty;
        if (this.yarnLotMode !== 'confirm' && this.yarnLotMode !== 'view') {
            this.packageInfo.yarnBoxInfo.forEach( (item, index) => {
                item.coneQty = coneQty;
            });
        }
    }

    verifiedAll() {
        // *ngIf="yarnLotMode !== 'confirm' && yarnLotMode !== 'view'"
        const weightVerified = !this.packageInfo.yarnBoxInfo[0].weightVerified;
        if (this.yarnLotMode !== 'confirm' && this.yarnLotMode !== 'view') {
            this.packageInfo.yarnBoxInfo.forEach( (item, index) => {
                item.weightVerified = weightVerified;
            });
        }
    }


    autoNumber() {
        // console.log('autoNumber()');
        // getAutoNumber(loop: number, numberStart: number, digitMin: number, numFirst: string)
        // const loop = this.packageInfo.yarnBoxInfo.length;
        // const numberStart = +this.packageInfo.yarnBoxInfo[0].boxID;
        // const digitMin = this.packageInfo.yarnBoxInfo[0].boxID.length;
        // const numFirst = '0';
        // // console.log(loop, numberStart, digitMin, numFirst);
        // const numArr: string[] = this.userService.getAutoNumber(loop, numberStart, digitMin, numFirst);
        // numArr.forEach( (item, index) => {
        //     this.packageInfo.yarnBoxInfo[index].boxID = item;
        // });

        // const str3 = "k-1";
        // console.log(str3.match(/\D+|\d+/g));
        // console.log(this.boxIDIDXSelect);

        const loop = this.packageInfo.yarnBoxInfo.length;
        let startIdx = 0;
        let endIdx = 0;
        if (this.boxIDIDXSelect >= 0) {
            startIdx = this.boxIDIDXSelect;
            endIdx = loop - 1;

            const boxNo = ''+this.packageInfo.yarnBoxInfo[startIdx].boxID;
            // console.log(boxNo.match(/\D+|\d+/g));
            const boxInfo: string[]|null = boxNo.match(/\D+|\d+/g);
            // console.log(boxInfo);
            let boxPreName = '';
            const numberStart = (boxInfo && boxInfo.length>0) ? boxInfo[boxInfo.length-1] : NaN;
            if (boxInfo && boxInfo.length>1 && !isNaN(+numberStart)) {
                const loopx = boxInfo.length - 1;
                for (let i = 0; i < loopx; i++) {
                    boxPreName = boxPreName + boxInfo[i];
                }
            }

            if (isNaN(+numberStart)) {
                console.log('isNaN');
            } else {
                if (typeof +numberStart === "number") {
                    // console.log('Number', numberStart, +numberStart );
                    const round1 = endIdx - startIdx + 1;
                    const numArr: string[] = this.userService.getAutoNumber2(loop, +numberStart);
                    let j=0;
                    for (let i = startIdx; i < numArr.length; i++) {
                        this.packageInfo.yarnBoxInfo[i].boxID = boxPreName + numArr[j];
                        j++;
                    }
                } else  {
                    console.log('not a number');
                }
            }

            // // const numberStart = +this.packageInfo.yarnBoxInfo[startIdx].boxID;
            // const round1 = endIdx - startIdx + 1;
            // const numArr: string[] = this.userService.getAutoNumber2(loop, numberStart);
            // let j=0;
            // for (let i = startIdx; i < numArr.length; i++) {
            //     this.packageInfo.yarnBoxInfo[i].boxID = numArr[j];
            //     j++;
            // }
        }
        // this.boxIDIDXSelect = -1;
    }

    addnewBoxID(state: string, boxQty: number) { // new ,
        //  unshift
        // let yarnBoxInfo1 = {...this.yarnBoxInfoEmpty1};
        // yarnBoxInfo1.state = state;
        // yarnBoxInfo1.factoryID = this.factorySelect.factoryID;
        // this.packageInfo.yarnBoxInfo.unshift(yarnBoxInfo1);
        // console.log(yarnBoxInfo1.boxID.split(this.yarnDevideSign).length);
        // console.log(this.packageInfo.yarnBoxInfo);
        for (let i = 1; i <= boxQty; i++) {
            let yarnBoxInfo1 = {...this.yarnBoxInfoEmpty1};
            yarnBoxInfo1.state = state;
            yarnBoxInfo1.boxID = i+'';
            yarnBoxInfo1.factoryID = this.factorySelect.factoryID;
            this.packageInfo.yarnBoxInfo.unshift(yarnBoxInfo1);
        }
        // console.log(this.packageInfo.yarnBoxInfo);
        this.boxCounting(); // ## new calculation box counting
    }

    getBox() {
        // ## 0   0 , 100
        // ## 1   100 , 200
        // ## 3   200, 300
        const  startIndex = this.page * this.rows;
        const  endIndex = (this.page + 1) * this.rows;
        return this.packageInfo.yarnBoxInfo.slice(startIndex, endIndex);
    }

    viewdata() {
        // console.log(this.packageInfo.yarnBoxInfo);
    }

    updateBoxVerify(idx: number, verified: boolean) { // update
        const idxX = idx + (this.page * this.rows);
        if (this.packageInfo.boxWeight <= 0 || this.packageInfo.coneWeight <= 0) {
            this.packageInfo.yarnBoxInfo[idxX].weightVerified = false;
        } else {
            if (this.packageInfo.yarnBoxInfo[idxX].yarnPlanWeight <= 0 || this.packageInfo.yarnBoxInfo[idxX].yarnWeight <= 0
                || this.packageInfo.yarnBoxInfo[idxX].coneQty <= 0 || this.packageInfo.yarnBoxInfo[idxX].yarnWeightNet <= 0) {
                this.packageInfo.yarnBoxInfo[idxX].weightVerified = false;
            }
            if (this.packageInfo.yarnBoxInfo[idxX].yarnPlanWeight > 0 && this.packageInfo.yarnBoxInfo[idxX].yarnWeight > 0
                && this.packageInfo.yarnBoxInfo[idxX].coneQty > 0 && this.packageInfo.yarnBoxInfo[idxX].yarnWeightNet > 0) {
                this.packageInfo.yarnBoxInfo[idxX].weightVerified = verified;
            }
        }
        this.boxCounting(); // ## new calculation box counting
    }

    delYarnBoxInfo1(idx: number) {
        // arr.splice(0,1);
        const idxX = idx + (this.page * this.rows);
        this.packageInfo.yarnBoxInfo.splice(idxX,1);
        this.boxCounting(); // ## new calculation box counting
    }



    addnewYarnLotID() {
        this.yarnLotMode = 'add';
    }

    closeModalPage() {
        this.ref.close();
    }



    boxCounting() {
        this.countingDel = 0;
        this.packageInfo.boxVerified = this.packageInfo.yarnBoxInfo.filter(i=>i.weightVerified === true).length;
        this.packageInfo.boxWait = this.packageInfo.yarnBoxInfo.filter(i=>i.weightVerified === false).length;


        // const totalCountBet = sumGroupbyMemberBetAllx.reduce((prev, cur) => {return prev + cur.countBet;}, 0);
        this.packageInfo.yarnPlanWeightTotal = +this.packageInfo.yarnBoxInfo.reduce((prev, cur) => {return prev + cur.yarnPlanWeight;}, 0).toFixed(2);
        this.packageInfo.yarnWeightTotal = +this.packageInfo.yarnBoxInfo.reduce((prev, cur) => {return prev + cur.yarnWeight;}, 0).toFixed(2);

        this.packageInfo.yarnCCWeightTotal = +this.packageInfo.yarnBoxInfo.reduce((prev, cur) => {return prev + cur.cCWeight;}, 0).toFixed(2);
        this.packageInfo.yarnWeightNetTotal = +this.packageInfo.yarnBoxInfo.reduce((prev, cur) => {return prev + cur.yarnWeightNet;}, 0).toFixed(2);

        this.packageInfo.yarnWeightDifTotal = +(this.packageInfo.yarnWeightNetTotal - this.packageInfo.yarnPlanWeightTotal).toFixed(2);
        this.packageInfo.yarnWeightTotalPercent = this.userService.calDiffPercent(this.packageInfo.yarnWeightNetTotal, this.packageInfo.yarnPlanWeightTotal);
        // yarnCCWeightTotal: 0.00,  // yarnWeightNetTotal: 0.00,
        // this.yarnBoxInfo = this.packageInfo.yarnBoxInfo.filter(i=>i.boxID.split(this.yarnDevideSign).length == 1);
        // const percent = (num1 / num2 * 100);
    }

    // ## cc = carton & cone weight
    getCCWeight(yarnBoxInfo1: YarnBoxInfo, coneWeight: number, boxWeight: number): number {
        const coneQty = yarnBoxInfo1.coneQty;
        if (coneQty === 0 || coneWeight === 0 || boxWeight === 0) {
            return 0.00;
        }
        const ccWeight = +((coneQty * coneWeight) + boxWeight).toFixed(2);
        return ccWeight;
    }

    validateData() {
        // this.buttonPressed = true;
        // this.countingDel = 0;
        this.packageInfo.yarnBoxInfo = this.packageInfo.yarnBoxInfo.filter(i=>i.boxID.split(this.yarnDevideSign).length === 1);
        // this.yarnBoxInfo = this.packageInfo.yarnBoxInfo.filter(i=>i.boxID.split(this.yarnDevideSign).length === 1);
        this.sortYarnBoxInfo();
        const coneWeight = this.packageInfo.coneWeight;
        const boxWeight = this.packageInfo.boxWeight;
        this.packageInfo.yarnBoxInfo.forEach( (item, index) => {
            item.boxID = item.boxID.trim();

            if (item.yarnPlanWeight <= 0 || item.yarnWeight <= 0 || item.coneQty <= 0 || item.yarnWeightNet <= 0
                || this.packageInfo.coneWeight <= 0 || this.packageInfo.boxWeight <= 0) {
                item.weightVerified = false;
            }

            const yarnBoxInfoF = this.packageInfo.yarnBoxInfo.filter(i=>i.boxID.trim() == item.boxID.trim());
            if (yarnBoxInfoF.length > 1) {
                item.errCode = 'err';
            } else {
                item.errCode = '';
            }

            // ## calculate for dif
            const num1 = item.yarnWeight;
            const num2 = item.yarnPlanWeight;
            const result = +this.userService.calDiffPercent(num1, num2);
            item.yarnWeightDif = result;

            // ## calculate cC weight  and net weight
            const cCWeight = this.getCCWeight(item, coneWeight, boxWeight);
            item.cCWeight = cCWeight;
            item.yarnWeightNet = +(item.yarnWeight - cCWeight).toFixed(2);
            item.useWeight = +(item.yarnWeight - cCWeight).toFixed(2);

        });
        // console.log(this.packageInfo);
        const errCount = this.packageInfo.yarnBoxInfo.filter(i=>i.errCode !== '').length;
        this.dataValidateOK = false;
        this.yarnLotIDSelectErrCode = this.yarnLotIDSelect.trim()===''?'err':'';
        this.invoiceIDSelectErrCode = this.invoiceIDSelect.trim()===''?'err':'';
        // const mmddF = this.yarnPlan.yarnDataInfo.filter(i=>i.mmdd == item.mmdd);

        this.boxCounting(); // ## new calculation box counting

        if (this.yarnLotIDSelectErrCode === '' &&
            this.invoiceIDSelectErrCode === '' &&
            this.packageInfo.yarnBoxInfo.length > 0 &&
            errCount === 0) {
            this.dataValidateOK = true;
            return this.dataValidateOK;
        }
        return  this.dataValidateOK;
    }

    sortYarnBoxInfo() {
        // this.countingDel = 0;
        this.boxCounting(); // ## new calculation box counting
        this.packageInfo.yarnBoxInfo.sort((a,b)=>{
            return a.state >b.state?1:a.state <b.state?-1:0
                || +a.boxID >+b.boxID?1:+a.boxID <+b.boxID?-1:0
        });
    }

    onInput(idx: number) {
        // console.log("onInput", idx);
        // console.log(this.packageInfo.yarnBoxInfo[idx].yarnWeight);
    }

    calDiffPercent(idx: number) {
        const idxX = idx + (this.page * this.rows);
        // calDiffPercent(num1: number, num2: number)
        const num1 = this.packageInfo.yarnBoxInfo[idxX].yarnWeight;
        const num2 = this.packageInfo.yarnBoxInfo[idxX].yarnPlanWeight;
        const result = +this.userService.calDiffPercent(num1, num2);

        // const percent = (this.yarnBoxInfo[idx].yarnWeight / this.yarnBoxInfo[idx].yarnPlanWeight * 100);
        // let result = '';
        // if (percent === 0 || this.yarnBoxInfo[idx].yarnPlanWeight === 0) { result = ''; }
        // else { result = percent.toFixed(2); }
        // yarnWeightDif
        this.packageInfo.yarnBoxInfo[idx].yarnWeightDif = result;

        // return result;
    }

    onPageChange(event: any) {
        // console.log(event);
        this.page = event.page;
        this.rows = event.rows;
        this.first = event.first;
        this.rows = event.rows;
    }

    getIdx(event: any, idx: number) {
        // console.log(event);
        // console.log(idx, ' ,  this.page - ', this.page);
        // this.page = event.page;
        // this.rows = event.rows;
        // this.first = event.first;
        // this.rows = event.rows;
        this.boxIDIDXSelect = idx + (this.page * this.rows);
    }



    ngOnDestroy(): void {
        // if (this.dataAroundAppSub) { this.dataAroundAppSub.unsubscribe(); }
        // if (this.yarnPlanListSub) { this.yarnPlanListSub.unsubscribe(); }

    }
}
