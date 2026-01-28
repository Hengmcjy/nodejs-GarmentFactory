import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { DialogService } from 'primeng/dynamicdialog';
import { Subscription } from 'rxjs';
import { GBC } from 'src/app/global/const-global';
import { ColorS, Company, Factory } from 'src/app/models/app.model';
import { Customer, OrderImage } from 'src/app/models/order.model';
import { Yarn, YarnColor, YarnData, YarnSupplier } from 'src/app/models/yarn.model';
import { UserService } from 'src/app/services/user.service';
import { YarnService } from 'src/app/services/yarn.service';
import { SmdYarnListsSelectComponent } from '../smd-yarn-lists-select/smd-yarn-lists-select.component';
import { SmdSelectOrderComponent } from '../../../general/smd-select-order/smd-select-order.component';
import { SmdSelectColorComponent } from '../../../general/smd-select-color/smd-select-color.component';

@Component({
  selector: 'app-smd-yarn-plan-manage',
  templateUrl: './smd-yarn-plan-manage.component.html',
  styleUrls: ['./smd-yarn-plan-manage.component.scss'],
  providers: [DialogService],
})
export class SmdYarnPlanManageComponent implements OnInit, OnDestroy{
    productImageProfileGCSPath = GBC.productImageProfileGCSPath;  // ## google storage path
    nulltGCSPath= GBC.nulltGCSPath;
    @Input() mode = '';
    @Input() yarnSeason = '';
    @Input() company: Company = GBC.clrCompany();
    @Input() factorySelect: Factory = GBC.clrFactory();
    @Input() customer: Customer = GBC.clrCustomer();
    @Input() yarnPlan: YarnData = GBC.clrYarnData();

    @Output() selectEvent = new EventEmitter<string>();

    checkSaveStatus = '';

    uuid = '';
    yarns: Yarn[] = [];
    yarnsCount = 0;
    orderIDs: string[] = [];
    yarnSuppliers: YarnSupplier[] = [];
    yarnColors: YarnColor[] = [];
    orderImages: OrderImage[] = [];
    colorS: ColorS[] = [];
    blankColor: ColorS = GBC.clrOrderColor();


    yarnSelect: Yarn = GBC.clrYarn();
    orderIDsSelect: string[] = [];
    orderImagesSelect: OrderImage[] = [];
    colorSSelect: ColorS[] = [];

    saveCaption = '';

    // uuid: string,
    //     yarns: Yarn[], yarnsCount: number,
    //     orderIDs: String[], yarnSuppliers: YarnSupplier[], yarnColors: YarnColor[]

    private dataAroundAppSub: Subscription = new Subscription();
    private yarnsInfo1Sub: Subscription = new Subscription();
    // private yarnSub: Subscription = new Subscription();

    constructor(
        public dialogService: DialogService,
        // private router: Router,
        // private location: Location,
        public userService: UserService,
        public yarnService: YarnService,
    ) {}


    ngOnInit(): void {
        // console.log(this.mode);
        // console.log(this.company, this.customer, this.factorySelect, this.yarnSeason, this.mode);
        this.getYarnInfo1();
        this.getSaveBtnCaption();

        this.dataAroundAppSub = this.userService
            .getDataAroundAppStatusListener()
            .subscribe((dataAroundApp) => {
                // ## declare initial variable from service user

                this.customer = dataAroundApp.customer;
                this.factorySelect = dataAroundApp.factorySelect;
                this.yarnSeason = dataAroundApp.yarnSeason;
                //
                this.getYarnInfo1();
            });
    }

    getSaveBtnCaption() {
        this.saveCaption = '';
        if (this.mode === 'create') {
            this.saveCaption = 'create new plan';
        } else if (this.mode === 'edit') {
            this.saveCaption = 'edit plan';
            this.yarnSelect = this.yarnService.get1YarnInfo(this.yarnPlan.yarnID, this.company.companyID);

            this.orderIDsSelect = [];
            this.orderIDsSelect = this.yarnPlan.orderID;
            this.genOrderImagesSelect();

            this.colorSSelect = this.yarnPlan.colorS;

            this.uuid =this.yarnPlan.uuid
        }
        // console.log(this.yarnPlan);
    }

    // ## list , create
    btnAction(mode: string) {
        if (mode === 'create') {
            this.createYarnNewPlan(mode);
        } else if (mode === 'edit') {
            this.createYarnNewPlan(mode);
        } else if (mode === 'list') {
            this.selectEvent.emit(mode);
        }
    }

    // editYarnPlan(mode: string) {
    //     console.log('mode = edit');
    // }

    createYarnNewPlan(mode: string) {
        this.orderImagesSelect = this.orderImagesSelect.filter(i=>(i.orderID !== ''));
        this.colorSSelect = this.colorSSelect.filter(i=>(i.seq >= 0));

        this.orderImagesSelect.sort((a,b)=>{ return a.orderID >b.orderID?1:a.orderID <b.orderID?-1:0 });
        this.colorSSelect.sort((a,b)=>{ return a.seq >b.seq?1:a.seq <b.seq?-1:0 });

        this.orderIDsSelect = [];
        this.orderImagesSelect.forEach( (item, index) => {
            this.orderIDsSelect.push(item.orderID);
        });
        this.checkDataForSave(mode);
    }

    checkDataForSave(mode: string) {
        // "yarnSelect.yarnID !== '' && orderIDsSelect.length > 0 && colorSSelect.length > 0"
        if (this.yarnSelect.yarnID === '' || this.orderIDsSelect.length <= 0 || this.colorSSelect.length <= 0) {
            this.checkSaveStatus = 'no';
        } else {
            this.checkSaveStatus = '';
            if (mode==='create') {
                this.postYarnPlanCreateNew(mode);
            } else if (mode==='edit') {
                this.putYarnPlan(mode);
            }
        }
    }

    putYarnPlan(mode: string) {
        const uuid = this.uuid =this.yarnPlan.uuid;
        this.yarnService.putYarnPlan(
            this.userService.getUserID(),
            this.company.companyID,
            this.factorySelect.factoryID,
            this.customer.customerID,
            uuid,
            this.yarnSeason,
            this.yarnSelect.yarnID,
            this.orderIDsSelect,
            this.colorSSelect
        );
        this.selectEvent.emit(mode);  // ## mode = 'create'
    }

    postYarnPlanCreateNew(mode: string) {
        // postYarnPlanCreateNew(userID: string, companyID: string, factoryID: string, customerID: string, uuid: string,
        //     yarnSeasonID: string, yarnID: string, orderID: string[], colorS: ColorS[] )
        this.yarnService.postYarnPlanCreateNew(
            this.userService.getUserID(),
            this.company.companyID,
            this.factorySelect.factoryID,
            this.customer.customerID,
            this.uuid,
            this.yarnSeason,
            this.yarnSelect.yarnID,
            this.orderIDsSelect,
            this.colorSSelect
        );
        this.selectEvent.emit(mode);  // ## mode = 'create'
    }

    addNewStyle() {
        this.orderIDsSelect.push('');
        this.genOrderImagesSelect();
    }

    genOrderImagesSelect() {
        this.orderImagesSelect = [];
        this.orderImagesSelect = this.userService.getOrderImage(this.orderIDsSelect);
    }

    styleRemove(idx: number) {
        // array.splice(i, 1);
        this.orderIDsSelect .splice(idx, 1);
        // this.orderImagesSelect.splice(idx, 1);
        this.genOrderImagesSelect();
    }

    addNewColor() {
        // colorSSelect: ColorS[] = [];
        // blankColor: ColorS = GBC.clrOrderColor();
        this.colorSSelect.push(this.blankColor);
    }

    colorRemove(idx: number) {
        // array.splice(i, 1);
        this.colorSSelect .splice(idx, 1);
    }

    getYarnInfo1() {
        const companyID = this.company.companyID;
        const factoryID = this.factorySelect.factoryID;
        const customerID = this.customer.customerID;
        const setName = this.customer.setName;
        // console.log(setName , customerID);
        // const yarnSeason = this.company.companyID;
        // getYarnInfo1(companyID: string, factoryID: string, customerID: string, yarnSeason: string)
        this.yarnService.getYarnInfo1(companyID, factoryID, customerID, setName, this.yarnSeason);
        // getYarnsInfo1UpdatedListener
        if (this.yarnsInfo1Sub) { this.yarnsInfo1Sub.unsubscribe(); }
        this.yarnsInfo1Sub = this.yarnService.getYarnsInfo1UpdatedListener().subscribe((data) => {
            // console.log(data);
            this.uuid = data.uuid;
            // this.orderIDs = data.orderIDs;
            this.orderIDs = this.userService.getOrderIDss();
            this.yarns = data.yarns;
            this.yarnsCount = data.yarnsCount;
            this.yarnSuppliers = data.yarnSuppliers;
            this.yarnColors = data.yarnColors;
            this.colorS = data.colorS;

            // console.log(this.orderIDs);
            this.orderImages = this.userService.getOrderImage(this.orderIDs);
            // console.log(this.UUID, this.orderIDs, this.yarns, this.yarnsCount, this.yarnSuppliers, this.yarnColors);
            // console.log(this.colorS);
            // console.log(this.orderImages);
        });
    }



    showYarnList(mode: string) {
        this.yarnSelect = GBC.clrYarn();
        const ref = this.dialogService.open(SmdYarnListsSelectComponent, {
            data: {
                id: 'yarnSelection',
                company: this.userService?.getCompany(),
                yarns: this.yarns,
                mode: mode,
                btnCaption: 'choose'

            },
            header: 'Yarn Selection',
            width: '80%',
        });

        ref.onClose.subscribe((data: any) => {
            // console.log(data);
            if (!data) {
                this.yarnSelect = GBC.clrYarn();
            } else if (mode === 'yarn-lists-select') {
                this.yarnSelect = data;
            }

        });
    }


    // ## mode = orderID-selector
    showStyleSelector(mode: string, idx: number) {
        // console.log(mode, idx);
        const ref = this.dialogService.open(SmdSelectOrderComponent, {
            data: {
                id: 'orderIDSelection',
                company: this.userService?.getCompany(),
                orderImages: this.orderImages,
                mode: mode,  // ## mode = orderID-selector
                idx: idx,
                btnCaption: 'choose'

            },
            header: 'orderID Selection',
            width: '80%',
        });

        ref.onClose.subscribe((data: any) => {
            // console.log(data);
            if (!data) {

            } else{
                // orderImagesSelect: OrderImage[] = [];
                // this.orderImagesSelect.push(data.orderImage);
                this.orderImagesSelect[idx] = {orderID: data.orderImage.orderID, imageProfile: data.orderImage.imageProfile};
            }

        });
    }


    showColorSelector(mode: string, idx: number) {
        // console.log(mode, idx);
        const ref = this.dialogService.open(SmdSelectColorComponent, {
            data: {
                id: 'colorSelection',
                company: this.userService?.getCompany(),
                mode: mode,  // ## mode = orderID-selector
                idx: idx,
                colorS: this.colorS,
                btnCaption: 'choose'

            },
            header: 'color Selection',
            width: '80%',
        });

        ref.onClose.subscribe((data: ColorS) => {
            // console.log(data);
            if (!data) {

            } else{
                // orderImagesSelect: OrderImage[] = [];
                // this.orderImagesSelect.push(data.orderImage);
                this.colorSSelect[idx] = data;
            }

        });
    }

    ngOnDestroy(): void {
        if (this.yarnsInfo1Sub) { this.yarnsInfo1Sub.unsubscribe(); }
        if (this.dataAroundAppSub) { this.dataAroundAppSub.unsubscribe(); }

    }
}
