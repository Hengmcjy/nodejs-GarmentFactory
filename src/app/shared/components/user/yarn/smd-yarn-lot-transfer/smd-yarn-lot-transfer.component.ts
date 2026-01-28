import { Component, OnDestroy, OnInit } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Subscription } from 'rxjs';
import { GBC } from 'src/app/global/const-global';
import { ColorS, Company, Factory } from 'src/app/models/app.model';
import { Customer, OrderImage } from 'src/app/models/order.model';
import { YarnBoxInfo, YarnData, YarnDataDraft, YarnLotInfo, YarnLotUsage, YarnUsage } from 'src/app/models/yarn.model';
import { UserService } from 'src/app/services/user.service';
import { YarnService } from 'src/app/services/yarn.service';

@Component({
  selector: 'app-smd-yarn-lot-transfer',
  templateUrl: './smd-yarn-lot-transfer.component.html',
  styleUrls: ['./smd-yarn-lot-transfer.component.scss'],
  providers: [ConfirmationService,MessageService]
})
export class SmdYarnLotTransferComponent implements OnInit, OnDestroy {

    productImageProfileGCSPath = GBC.productImageProfileGCSPath;  // ## google storage path
    nulltGCSPath= GBC.nulltGCSPath;

    // test1 = 0;
    test1ErrCode = '';

    data: any;
    loading = false;
    modeArr = [];  // ## [transfer , divide]
    dateSign = '-';
    yarnDevideSign = '';  // ## yarnDevideSign

    company: Company = GBC.clrCompany();
    factorySelect: Factory = GBC.clrFactory();
    customer: Customer = GBC.clrCustomer();
    factorytransfer: Factory = GBC.clrFactory();

    yarnSeasonID = '';  // ## 2023SS
    yarnID = '';
    uuid = '';
    yarnDataUUID = '';
    yarnColorID= '';
    yarnLotID = '';
    yarnLotUUID = '';
    confirmDate = '';
    factoryIDBox = '';


    orderID: string[] = [];
    yarnLotInfo: YarnLotInfo = GBC.clrYarnLotInfo();
    yarnBoxInfo: YarnBoxInfo[] = [];
    yarnBoxInfoSelected: YarnBoxInfo = GBC.clrYarnBoxInfo();
    yarnBoxInfoDevide: YarnBoxInfo[] = [];
    orderImagesSelect: OrderImage[] = [];
    colorS: ColorS = GBC.clrOrderColor();
    mmddSelect = '';
    yarnWeightNew = 0.00;
    isValidate = false;

    kgAll = 0.00;
    kgUsed = 0.00;
    kgRemain = 0.00;

    draftName = '';
    yarnBoxInfoTransfer: YarnBoxInfo[] = [];
    orderIDTransfer = '';

    yarnDataDraft: YarnDataDraft = GBC.clrYarnDataDraft();


    page = 0;
    first: number = 0;
    rows: number = 100;
    totalRecords = 0;
    rowsPerPageOptions = [100];

    private finishedSub: Subscription = new Subscription();
    private yarnLotInfoSub: Subscription = new Subscription();
    private yarnLotBoxLastStrSub: Subscription = new Subscription();

    constructor(
        public config: DynamicDialogConfig,
        public ref: DynamicDialogRef,

        private confirmationService: ConfirmationService,
        private messageService: MessageService,

        public userService: UserService,
        public yarnService: YarnService,
    ) {}

    ngOnInit(): void {
        // modeArr.some(i => i == 'divide')
        // const  txt1 = 'xxxx::yyyyy';
        // console.log(txt1.split('::') , txt1.split('::').length);
        this.yarnDevideSign = this.userService.yarnDevideSign;
        this.data = this.config.data;
        this.modeArr = this.data.modeArr; // ## [transfer , divide]
        this.yarnSeasonID = this.data.yarnSeasonID;
        this.yarnID = this.data.yarnID;
        this.uuid = this.data.uuid;
        this.yarnDataUUID = this.data.yarnDataUUID;
        this.yarnColorID = this.data.yarnColorID;
        this.yarnLotID = this.data.yarnLotID;
        this.yarnLotUUID = this.data.yarnLotUUID;
        this.confirmDate  = this.data.confirmDate;
        this.company = this.userService.getCompany();
        this.customer = this.data.customer;
        this.factorySelect = this.data.factorySelect;
        this.factoryIDBox = this.data.factoryIDBox;
        this.factorytransfer = this.data.factorytransfer;  // ## transfer mode
        this.loading = false;

        this.draftName = '';
        if (this.modeArr.some(i => i == 'divide')) {
            this.draftName = 'Divide-' + this.userService.returnYYYYMMDDHHMMSS();
        } else if (this.modeArr.some(i => i == 'transfer')) {
            this.draftName = 'Transfer-' + this.userService.returnYYYYMMDDHHMMSS();
        }

        // this.factorySelect = this.data.factorySelect;
        // this.customer = this.data.customer;
        // this.yarnPlan = this.data.yarnPlan;
        // this.colorS = this.data.colorS;
        // this.orderImagesSelect = this.data.orderImagesSelect;

        // console.log(this.factoryIDBox, this.factorySelect);
        // console.log(this.yarnDataUUID);

        this.getYarnLotInfo();
    }

    getYarnLotInfo() {
        this.yarnDataDraft = GBC.clrYarnDataDraft();
        this.yarnBoxInfoTransfer = [];
        this.yarnBoxInfo = [];
        const companyID = this.company.companyID;
        const factoryIDBox = this.factoryIDBox;
        const yarnSeasonID = this.yarnSeasonID;
        const yarnID = this.yarnID;
        const yarnColorID = this.yarnColorID;
        const yarnLotID = this.yarnLotID;
        const yarnLotUUID = this.yarnLotUUID;
        const type = ['receive'];
        // getYarnLotInfo(companyID: string, yarnSeasonID: string, yarnID: string,
        //      yarnColorID: string, yarnLotID: string, yarnLotUUID: string, type: string[])

        this.yarnService.getYarnLotInfo(
            companyID, factoryIDBox, yarnSeasonID, yarnID, yarnColorID, yarnLotID, yarnLotUUID, type
        );
        if (this.yarnLotInfoSub) { this.yarnLotInfoSub.unsubscribe(); }
        this.yarnLotInfoSub = this.yarnService.getYarnlotInfoListener().subscribe((data) => {
            // console.log(data);

            // ## clr new box
            this.yarnBoxInfoSelected = GBC.clrYarnBoxInfo();
            this.removeYarnBoxInfoDevide1();
            this.yarnWeightNew = 0.00;
            this.isValidate = false;

            this.yarnLotInfo = data.yarnLotInfo;
            this.yarnDataUUID = this.yarnLotInfo.yarnDataUUID;
            // // ## 0   0 , 100
            // // ## 1   100 , 200
            // // ## 3   200, 300
            const  startIndex = this.page * this.rows;
            const  endIndex = (this.page + 1) * this.rows;
            // return this.packageInfo.yarnBoxInfo.slice(startIndex, endIndex);
            this.yarnBoxInfo = this.yarnLotInfo.yarnBoxInfo.slice(startIndex, endIndex);

            // this.yarnLotID = this.yarnLotInfo.yarnColorID;
            this.yarnBoxInfo.sort((a,b)=>{ return +a.boxID > +b.boxID?1: +a.boxID < +b.boxID?-1:0 });
            // this.factoryIDBox = this.factorySelect.factoryID;
            // this.factoryIDBox = this.yarnBoxInfo.length > 0 ? this.yarnBoxInfo[0].factoryIDBox: '';
            this.colorS = this.userService.genColorS1(companyID, this.yarnLotInfo.yarnColorID, this.yarnLotInfo.colorS);
            this.orderID = this.yarnLotInfo.orderID;

            const s = this.dateSign;
            const dateArr = this.yarnLotInfo.mmdd.split('-');
            const monthName = this.userService.getMonthNamebyID(dateArr[0], 'short')
            this.mmddSelect = monthName + s + dateArr[1];

            this.orderImagesSelect = [];
            this.orderImagesSelect = this.userService.getOrderImage(this.orderID);

            this.calculateQty();  // ## show qty all @ bar
            this.prepateYarnDataDraft(this.draftName, this.modeArr[0]);

            // console.log(this.yarnDataDraft);
            // console.log(this.factoryIDBox);
            // console.log(this.yarnColorID, this.yarnDataUUID, this.uuid);
            // console.log(this.yarnLotInfo);
            // console.log(this.orderImagesSelect);
        });
    }

    selectStyleTransfer(orderID: string) {
        this.orderIDTransfer = orderID;
    }

    calculateWeight() {
        this.isValidate = false;
        const newWeight = this.yarnBoxInfoDevide[0].useWeight;
        this.yarnWeightNew = +(this.yarnBoxInfoSelected.useWeight - newWeight).toFixed(2);
        if (this.yarnWeightNew > 0) {
            this.validateWeight();
        } else {
            this.yarnBoxInfoDevide[0].useWeight = 0.00;
            this.yarnWeightNew = this.yarnBoxInfoSelected.useWeight;
        }
    }

    validateWeight() {
        this.isValidate = false;
        if (this.yarnBoxInfoDevide[0].useWeight > 0
            && this.yarnBoxInfoDevide[0].useWeight < this.yarnBoxInfoSelected.useWeight) {
            const weightOld =  +(this.yarnWeightNew + this.yarnBoxInfoDevide[0].useWeight).toFixed(2);
            if (weightOld == this.yarnBoxInfoSelected.useWeight) {
                this.isValidate = true;
            }
        }

    }

    removeYarnBoxInfoDevide1() {
        this.yarnBoxInfoDevide = [];
    }

    putEditYarnLotIDDevide() {
        // const strs = this.yarnBoxInfoSelected.boxID.split(this.yarnDevideSign);
        const boxID = this.yarnBoxInfoSelected.boxID;
        const boxUUID = this.yarnBoxInfoSelected.boxUUID;

        const userID = this.userService.getUser().userID;
        const companyID = this.company.companyID;
        const yarnSeasonID = this.yarnSeasonID;
        const yarnID = this.yarnID;
        const uuid = this.uuid;
        const yarnDataUUID = this.yarnDataUUID;
        const yarnColorID = this.yarnColorID;
        const yarnLotID = this.yarnLotID;
        const yarnLotUUID = this.yarnLotUUID;
        const type = ['receive'];

        let factoryIDBox = this.factorySelect.factoryID;
        if (this.factoryIDBox === '') {
            factoryIDBox = this.factorySelect.factoryID;
        } else {
            factoryIDBox = this.factoryIDBox;
        }
        const boxIDNew = this.yarnBoxInfoDevide[0].boxID;
        const weightDevide = this.yarnBoxInfoDevide[0].useWeight;
        const yarnWeightNew = this.yarnWeightNew;
        const boxNew = {boxIDNew, weightDevide,  yarnWeightNew};

        this.yarnService.putEditYarnLotIDDevide(
            companyID, yarnSeasonID, yarnID, uuid, yarnDataUUID, yarnColorID, yarnLotID, yarnLotUUID, type, boxID, boxUUID, this.yarnDevideSign,
            boxNew, factoryIDBox
        );
        // if (this.yarnLotBoxLastStrSub) { this.yarnLotBoxLastStrSub.unsubscribe(); }
        // this.yarnLotBoxLastStrSub = this.yarnService.getYarnlotBoxLastStrListener().subscribe((data) => {
        //     // console.log(data);
        //     const lastStr = data.charE;
        //     const nextStr = this.userService.getCharENext(lastStr);
        //     // console.log('nextStr = ' + nextStr);

        //     yarnBoxInfo1.boxID = this.yarnBoxInfoSelected.boxID + this.yarnDevideSign + nextStr;
        //     yarnBoxInfo1.factoryIDBox = this.yarnBoxInfoSelected.factoryIDBox;
        //     yarnBoxInfo1.used = false;
        //     yarnBoxInfo1.weightVerified = true;
        //     this.yarnBoxInfoDevide.push(yarnBoxInfo1);
        //     console.log(this.yarnBoxInfoDevide);
        // });
    }

    addYarnBoxInfoDevide1() {
        this.isValidate = false;
        this.yarnWeightNew = this.yarnBoxInfoSelected.useWeight;
        this.yarnBoxInfoDevide = [];
        let yarnBoxInfo1: YarnBoxInfo = GBC.clrYarnBoxInfo();
        const strs = this.yarnBoxInfoSelected.boxID.split(this.yarnDevideSign);

        const userID = this.userService.getUser().userID;
        const companyID = this.company.companyID;
        const yarnSeasonID = this.yarnSeasonID;
        const yarnID = this.yarnID;
        const yarnColorID = this.yarnColorID;
        const yarnLotID = this.yarnLotID;
        const yarnLotUUID = this.yarnLotUUID;
        const type = ['receive'];
        this.yarnService.getYarnLotBoxLastStr(
            companyID, yarnSeasonID, yarnID, yarnColorID, yarnLotID, yarnLotUUID, type, strs[0], this.yarnDevideSign
        );
        if (this.yarnLotBoxLastStrSub) { this.yarnLotBoxLastStrSub.unsubscribe(); }
        this.yarnLotBoxLastStrSub = this.yarnService.getYarnlotBoxLastStrListener().subscribe((data) => {
            // console.log(data);
            const lastStr = data.charE;
            const nextStr = this.userService.getCharENext(lastStr);
            // console.log('lastStr = ' + lastStr);
            // console.log('nextStr = ' + nextStr);

            yarnBoxInfo1.boxID = this.yarnBoxInfoSelected.boxID.split(this.yarnDevideSign)[0] + this.yarnDevideSign + nextStr;
            yarnBoxInfo1.factoryIDBox = this.yarnBoxInfoSelected.factoryIDBox;
            yarnBoxInfo1.used = false;
            yarnBoxInfo1.weightVerified = true;
            this.yarnBoxInfoDevide.push(yarnBoxInfo1);
            // console.log(this.yarnBoxInfoDevide);
        });

    }

    yarnBoxSelect(yarnBoxInfo: YarnBoxInfo) {
        // console.log(yarnBoxInfo);
        this.yarnBoxInfoDevide = [];
        this.yarnBoxInfoSelected = {...yarnBoxInfo};
        this.yarnBoxInfoSelected.yarnPlanWeight = 0.00;
        this.yarnBoxInfoSelected.yarnWeight = 0.00;
        // this.yarnBoxInfoSelected.useWeight = 0.00;
        // this.yarnBoxInfoSelected.used = false;
        // this.yarnBoxInfoSelected.weightVerified = true;

        this.isValidate = false;
        this.yarnWeightNew = this.yarnBoxInfoSelected.useWeight;
        // console.log(this.yarnBoxInfoSelected);

    }

    checkSaveTransfer(mode: string): boolean {
        const boxLen = this.yarnDataDraft.yarnDataInfo.packageInfo.yarnBoxInfo.length > 0;
        const selectedOrderID = this.orderIDTransfer !== '';
        return this.modeArr.some(i => i == mode) && boxLen && selectedOrderID;
    }

    checkModeArr(mode: string): boolean {
        // modeArr = [];  // ## [transfer , divide]
        // mode = transfer , divide
        return this.modeArr.some(i => i == mode);
    }

    calculateQty() {
        this.kgAll = 0.00;
        this.kgUsed = 0.00;
        this.kgRemain = 0.00;
        const yarnBoxInfo1 = [...this.yarnLotInfo.yarnBoxInfo];
        const yarnBoxInfo2 = [...this.yarnLotInfo.yarnBoxInfo];
        const yarnBoxInfo3 = [...this.yarnLotInfo.yarnBoxInfo];

        this.kgAll = +yarnBoxInfo1.reduce((prev, cur) => {return prev + cur.useWeight;}, 0).toFixed(2);

        const yarnBoxInfoF2 = yarnBoxInfo2.filter(i=>i.used === true);
        this.kgUsed = +yarnBoxInfoF2.reduce((prev, cur) => {return prev + cur.useWeight;}, 0).toFixed(2);

        const yarnBoxInfoF3 = yarnBoxInfo3.filter(i=>i.used === false);
        this.kgRemain = +yarnBoxInfoF3.reduce((prev, cur) => {return prev + cur.useWeight;}, 0).toFixed(2);
    }

    // ## mode = 'transfer',
    save(mode: string) {
        if (mode === 'transfer') {
            this.confirmationService.confirm({
                message: 'Are you sure that you want transfer to ... ?',
                acceptLabel: 'Transfer',
                rejectLabel: 'No',
                accept: () => {
                    this.messageService.add({severity:'info', summary:'Confirmed', detail:'You have accepted'});
                    // this.putOrderProductionQrcodeReplacement();
                    // console.log(mode, this.yarnDataDraft.yarnDataInfo.packageInfo.yarnBoxInfo);
                    // console.log(this.yarnDataDraft);
                    this.saveYarnTransfer();
                }
            });
        }
    }



    getTotalTransferboxSelected(): number {
        const yarnBoxInfoT = [...this.yarnDataDraft.yarnDataInfo.packageInfo.yarnBoxInfo];
        const totalTransferboxSelected = +yarnBoxInfoT.reduce((prev, cur) => {return prev + cur.useWeight;}, 0).toFixed(2);

        return totalTransferboxSelected;
    }

    checkTransferboxSelected(yarnBoxInfo: YarnBoxInfo): boolean {
        const yarnBoxInfoT = [...this.yarnDataDraft.yarnDataInfo.packageInfo.yarnBoxInfo];
        const yarnBoxInfoF = yarnBoxInfoT.filter(i=>i.boxUUID == yarnBoxInfo.boxUUID);
        if (yarnBoxInfoF.length > 0) {
            return true;
        }
        return false;
    }

    yarnBoxTransferRemove(idx: number) {
        this.yarnDataDraft.yarnDataInfo.packageInfo.yarnBoxInfo.splice(idx, 1);
        this.yarnDataDraft.yarnDataInfo.packageInfo.yarnBoxInfo
            .sort((a,b)=>{ return a.boxID >b.boxID?1:a.boxID <b.boxID?-1:0 });
    }

    yarnBoxTransferSelect(yarnBoxInfo: YarnBoxInfo) {
        // console.log(yarnBoxInfo);
        if (!yarnBoxInfo.used) {
            const idx = this.yarnDataDraft.yarnDataInfo.packageInfo.yarnBoxInfo.findIndex(i=>i.boxUUID == yarnBoxInfo.boxUUID);
            if (idx < 0) {
                this.yarnDataDraft.yarnDataInfo.packageInfo.yarnBoxInfo.push(yarnBoxInfo);
            } else {
                this.yarnDataDraft.yarnDataInfo.packageInfo.yarnBoxInfo.splice(idx, 1);
            }
        }
        this.yarnDataDraft.yarnDataInfo.packageInfo.yarnBoxInfo
            .sort((a,b)=>{ return a.boxID >b.boxID?1:a.boxID <b.boxID?-1:0 });
        // console.log(this.yarnDataDraft.yarnDataInfo.packageInfo.yarnBoxInfo);
    }



    saveYarnTransfer() {

        // ## create yarn Usage
        let yarnLotUsage1: YarnLotUsage = GBC.clrYarnLotUsage();
        yarnLotUsage1.companyID = this.yarnDataDraft.companyID;
        yarnLotUsage1.factoryID = this.yarnDataDraft.factoryID;
        yarnLotUsage1.customerID = this.yarnDataDraft.customerID;
        yarnLotUsage1.yarnSeasonID = this.yarnDataDraft.yarnSeasonID;
        yarnLotUsage1.yarnID = this.yarnDataDraft.yarnID;
        yarnLotUsage1.yarnDataUUID = this.yarnDataDraft.yarnDataInfo.yarnDataUUID;
        yarnLotUsage1.yarnColorID = this.yarnDataDraft.yarnDataInfo.yarnColorID;
        yarnLotUsage1.status = 'open';
        yarnLotUsage1.yarnUsage = [];

        let yarnUsage1: YarnUsage = GBC.clrYarnUsage();
        yarnUsage1.datetime = new Date();
        yarnUsage1.datetimeIssue = new Date();
        yarnUsage1.yuUUID = '';
        yarnUsage1.yarnLotID = this.yarnDataDraft.yarnDataInfo.packageInfo.yarnLotID;
        yarnUsage1.yarnLotUUID = this.yarnDataDraft.yarnDataInfo.packageInfo.yarnLotUUID;
        yarnUsage1.invoiceID = this.yarnDataDraft.yarnDataInfo.packageInfo.invoiceID;
        yarnUsage1.usageMode = 't';
        yarnUsage1.yarnWeight = 0.00;
        yarnUsage1.useWeight = this.getTotalTransferboxSelected();
        yarnUsage1.usageInfo.fromFactoryID = this.yarnDataDraft.yarnDataInfo.fromFactoryID ;
        yarnUsage1.usageInfo.toFactoryID = this.yarnDataDraft.yarnDataInfo.toFactoryID ;
        // putYarnLotTransferCF(yarnDataDraft: YarnDataDraft, yarnUsage1: YarnUsage, yarnLotUsage1: YarnLotUsage)
        // console.log(this.yarnDataDraft.yarnDataInfo.packageInfo.yarnBoxInfo);
        // console.log(this.yarnDataDraft);
        this.yarnService.putYarnLotTransferCF(this.yarnDataDraft, yarnUsage1, yarnLotUsage1, this.orderIDTransfer);
        if (this.finishedSub) { this.finishedSub.unsubscribe(); }
        this.finishedSub = this.yarnService.getYarnUpdateFinishedListener().subscribe((data) => {
            // console.log(data);
            this.ref.close();
        });
    }

    prepateYarnDataDraft(draftName: string, draftMode: string): void {
        // ## draftMode = divide , transfer
        this.yarnDataDraft = GBC.clrYarnDataDraft();
        this.yarnDataDraft.companyID = this.company.companyID;
        this.yarnDataDraft.factoryID = this.factorySelect.factoryID;
        this.yarnDataDraft.customerID = this.customer.customerID;
        this.yarnDataDraft.uuid = this.uuid;
        this.yarnDataDraft.yarnSeasonID = this.yarnSeasonID;
        this.yarnDataDraft.status = '';
        this.yarnDataDraft.datetime = new Date();
        this.yarnDataDraft.editDate = new Date();
        this.yarnDataDraft.yarnID = this.yarnID;
        this.yarnDataDraft.orderID = this.orderID;
        this.yarnDataDraft.colorS = this.colorS
        this.yarnDataDraft.yyyymmdd = '';
        this.yarnDataDraft.mmdd = '';
        this.yarnDataDraft.draftName = draftName;
        this.yarnDataDraft.draftMode = draftMode;
        this.yarnDataDraft.createBy.userID = this.userService.getUserID();

        this.yarnDataDraft.yarnDataInfo.datetime = new Date();
        this.yarnDataDraft.yarnDataInfo.editDate = new Date();
        this.yarnDataDraft.yarnDataInfo.yarnDataUUID = this.yarnDataUUID;
        this.yarnDataDraft.yarnDataInfo.yarnColorID = this.yarnColorID;
        this.yarnDataDraft.yarnDataInfo.type = 'receive';
        this.yarnDataDraft.yarnDataInfo.mode = '';
        this.yarnDataDraft.yarnDataInfo.fromFactoryID = this.factoryIDBox;
        this.yarnDataDraft.yarnDataInfo.toFactoryID =  this.factorytransfer.factoryID?this.factorytransfer.factoryID:'';

        this.yarnDataDraft.yarnDataInfo.packageInfo.invoiceID = this.yarnLotInfo.invoiceID;
        this.yarnDataDraft.yarnDataInfo.packageInfo.yarnLotID = this.yarnLotID;
        this.yarnDataDraft.yarnDataInfo.packageInfo.yarnLotUUID = this.yarnLotUUID;
        this.yarnDataDraft.yarnDataInfo.packageInfo.state = 'verified';
        this.yarnDataDraft.yarnDataInfo.packageInfo.yarnBoxInfo = [];
    }

    onPageChange(event: any) {
        // console.log(event);
        this.page = event.page;
        this.rows = event.rows;
        this.first = event.first;
        this.rows = event.rows;

        // // ## 0   0 , 100
        // // ## 1   100 , 200
        // // ## 3   200, 300
        const  startIndex = this.page * this.rows;
        const  endIndex = (this.page + 1) * this.rows;
        // return this.packageInfo.yarnBoxInfo.slice(startIndex, endIndex);
        this.yarnBoxInfo = this.yarnLotInfo.yarnBoxInfo.slice(startIndex, endIndex);
    }

    ngOnDestroy(): void {
        if (this.finishedSub) { this.finishedSub.unsubscribe(); }
        if (this.yarnLotInfoSub) { this.yarnLotInfoSub.unsubscribe(); }
        if (this.yarnLotBoxLastStrSub) { this.yarnLotBoxLastStrSub.unsubscribe(); }

    }
}
