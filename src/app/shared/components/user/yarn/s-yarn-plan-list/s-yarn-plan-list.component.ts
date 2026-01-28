import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { DialogService } from 'primeng/dynamicdialog';
import { Subscription } from 'rxjs';
import { GBC } from 'src/app/global/const-global';
import { Company, Factory } from 'src/app/models/app.model';
import { Customer, OrderImage } from 'src/app/models/order.model';
import { UserService } from 'src/app/services/user.service';
import { YarnService } from 'src/app/services/yarn.service';
import { SYarnFilterComponent } from '../../../general/s-yarn-filter/s-yarn-filter.component';
import { Yarn, YarnData } from 'src/app/models/yarn.model';
import { SmdSelectOrderComponent } from '../../../general/smd-select-order/smd-select-order.component';
import { SmdYarnChangenameComponent } from '../smd-yarn-changename/smd-yarn-changename.component';

@Component({
  selector: 'app-s-yarn-plan-list',
  templateUrl: './s-yarn-plan-list.component.html',
  styleUrls: ['./s-yarn-plan-list.component.scss'],
  providers: [DialogService],
})
export class SYarnPlanListComponent implements OnInit, OnDestroy {
    @Input() mode = '';
    @Input() yarnSeason = '';
    @Input() company: Company = GBC.clrCompany();
    @Input() factorySelect: Factory = GBC.clrFactory();
    @Input() customer: Customer = GBC.clrCustomer();
    @Input() yarns: Yarn[] = [];
    @Input() yarnsCount: number = 0;
    @Input() yarnPlans: YarnData[] = [];
    @Input() yarnPlansCount: number = 0;

    @Output() selectYarnPlan = new EventEmitter<any>();

    productImageProfileGCSPath = GBC.productImageProfileGCSPath;  // ## google storage path
    nulltGCSPath= GBC.nulltGCSPath;

    // ofFactory = false;  // ## plan of factory

    yarnSelects: Yarn[] = [];
    orderIDs: string[] = [];
    orderImages: OrderImage[] = [];
    orderImagesSelect: OrderImage[] = [];

    yarnPlanSelected: YarnData = GBC.clrYarnData();
    planMode = '';
    loading = false;

    private yarnPlanListSub: Subscription = new Subscription();
    private yarnEditNameSub: Subscription = new Subscription();

    constructor(
        public dialogService: DialogService,
        // private router: Router,
        // private location: Location,
        public userService: UserService,
        public yarnService: YarnService,
    ) {}

    ngOnInit(): void {
        // console.log(this.company, this.customer, this.factorySelect, this.yarnSeason, this.mode);
        // console.log(this.yarnSeason);
        // console.log(this.company);
        // console.log(this.factorySelect);
        // console.log(this.customer);
        // console.log(this.yarns);
        // console.log(this.yarnPlans);

        // console.log(this.userService.getOrderIDss());
        // console.log(this.userService.productImageProfiles, this.orderIDs);
        this.orderIDs = this.userService.getOrderIDss();
        this.orderImages = this.userService.getOrderImage(this.orderIDs);
        // console.log(this.orderImages);

    }

    getYarPlansList() {
        this.yarnService.setYarns([]);  // ## clear yarn list
        // this.yarnPlan = GBC.clrYarnData();
        this.loading = true;
        // this.ofFactory = false;  // ## plan of factory
        // this.mode = 'list';
        const companyID = this.company.companyID;
        const factoryID = this.factorySelect.factoryID;
        const customerID = this.customer.customerID;
        const setName = this.customer.setName;
        const orderIDs = this.userService.getOrderIDss();
        // getYarPlansList(companyID: string, factoryID: string, customerID: string, setName: string, yarnSeason: string)
        // console.log(companyID, factoryID, customerID, setName, this.yarnSeason);
        this.yarnService.getYarPlansList(companyID, factoryID, customerID, setName, this.yarnSeason, orderIDs);
        if (this.yarnPlanListSub) { this.yarnPlanListSub.unsubscribe(); }
        this.yarnPlanListSub = this.yarnService.getYarnPlanListListener().subscribe((data) => {
            // console.log(data);
            this.loading = false;
            // yarnPlans: YarnData[], yarnPlansCount: number,
            this.yarnPlans = data.yarnPlans;
            this.yarnPlansCount = data.yarnPlansCount;

            this.yarnPlans.sort((a,b)=>{ return a.orderID >b.orderID?1:a.orderID <b.orderID?-1:0 });
            // console.log(this.yarnPlans);
            this.yarns = data.yarns;
            this.yarnsCount = data.yarnsCount;
            // console.log(this.yarns);
        });
    }

    selectYarnPlan1(yarnPlan: YarnData, mode: string) {
        const data = {yarnPlan , mode}
        this.selectYarnPlan.emit(data);
    }

    yarnRemove(idx: number) {
        // array.splice(i, 1);
        this.yarnSelects .splice(idx, 1);
        // this.orderImagesSelect.splice(idx, 1);
        // this.genOrderImagesSelect();
    }

    styleRemove(idx: number) {
        // array.splice(i, 1);
        this.orderImagesSelect.splice(idx, 1);
        // this.orderImagesSelect.splice(idx, 1);
        // this.genOrderImagesSelect();
    }

    putYarnFullName(yarnID: string, yarnFullName2: string) {
        // putYarnFullName(companyID: string, yarnID: string, yarnFullName2: string)
        const companyID = this.company.companyID;
        this.yarnService.putYarnFullName(companyID, yarnID, yarnFullName2);
        if (this.yarnEditNameSub) { this.yarnEditNameSub.unsubscribe(); }
        this.yarnEditNameSub = this.yarnService.getYarnEditNameListener().subscribe((data) => {
            // console.log(data);
            if (data.success) {
                this.getYarPlansList();
            }
        });
    }

    // ## mode = orderID-selector
    showYarnEditNameModal(mode: string, yarnID: string) {
        // console.log(mode, idx);
        const ref = this.dialogService.open(SmdYarnChangenameComponent, {
            data: {
                id: 'EditYarnName',
                company: this.userService?.getCompany(),
                yarnID: yarnID,
                mode: mode,  // ## mode = orderID-selector
                // orderImages: this.orderImages,
                // btnCaption: 'choose'

            },
            header: 'Yarn name change',
            width: '80%',
        });

        ref.onClose.subscribe((data: any) => {
            // console.log(data);
            if (!data) {

            } else {
                // console.log(data);
                this.putYarnFullName(data.yarnID, data.yarnFullName2);
            }
        });
    }

    showYarnfilterModal() {
        const showList: string[] = ['yarnID'];
        const ref = this.dialogService.open(SYarnFilterComponent, {
            data: {
                id: 'yarnFilter',
                showList: showList,
                company: this.userService?.getCompany(),
                yarns: this.yarns,
                yarnsCount: this.yarnsCount,
                mode: 'yarn-lists-select',

            },
            header: 'Yarn Filter [ ' + this.customer.customerName+ ' ]',
            width: '80%'
        });

        ref.onClose.subscribe((data: Yarn) => {
            this.orderImagesSelect = [];
            // console.log(data);
            if (data) {
                const yarn1 = this.yarnSelects.filter(i=>(i.yarnID === data.yarnID));
                if (yarn1.length === 0) {
                    this.yarnSelects.push(data);
                }
            } else {
                this.yarnSelects = [];
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

            } else {
                this.yarnSelects = [];
                this.orderImagesSelect = [];
                this.orderImagesSelect.push(data.orderImage);
                // this.orderImagesSelect[idx] = {orderID: data.orderImage.orderID, imageProfile: data.orderImage.imageProfile};
            }

        });
    }

    getImage(orderID: string): string {
        const imgPath = this.userService.getOrderImage1(orderID);
        if (imgPath.length > 0) {
            return this.productImageProfileGCSPath+imgPath;
        }

        return GBC.nulltGCSPath;
    }

    createEditPlanEvent(planMode: string) {
        // console.log(planMode, ' createEditPlanEvent');
        this.planMode = '';
        if (planMode === 'edit') {
            this.getYarPlansList();
        } else if (planMode === 'list') {
            this.getYarPlansList();
        }
    }

    editPlan(yarnPlan1: YarnData) {
        this.yarnPlanSelected = GBC.clrYarnData();
        this.yarnPlanSelected = {...yarnPlan1};
        this.planMode = 'edit';
    }

    ngOnDestroy(): void {
        if (this.yarnPlanListSub) { this.yarnPlanListSub.unsubscribe(); }
        if (this.yarnEditNameSub) { this.yarnEditNameSub.unsubscribe(); }

    }
}
