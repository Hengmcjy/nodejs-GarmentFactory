import { Component, OnDestroy, OnInit } from '@angular/core';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { GBC } from 'src/app/global/const-global';
import { ColorS, Company, Factory } from 'src/app/models/app.model';
import { Customer, OrderImage } from 'src/app/models/order.model';
import { YarnData } from 'src/app/models/yarn.model';
import { UserService } from 'src/app/services/user.service';
import { YarnService } from 'src/app/services/yarn.service';

@Component({
  selector: 'app-smd-yarn-plan-packinglist-add',
  templateUrl: './smd-yarn-plan-packinglist-add.component.html',
  styleUrls: ['./smd-yarn-plan-packinglist-add.component.scss']
})
export class SmdYarnPlanPackinglistAddComponent implements OnInit, OnDestroy {
    mode = '';  // ## yarn-packaging-list-manage
    yarnSeason = '';
    company: Company = GBC.clrCompany();
    factorySelect: Factory = GBC.clrFactory();
    customer: Customer = GBC.clrCustomer();
    orderImagesSelect: OrderImage[] = [];
    colorS: ColorS = GBC.clrOrderColor();
    yarnColorID = '';
    yarnPlan: YarnData = GBC.clrYarnData();

    productImageProfileGCSPath = GBC.productImageProfileGCSPath;  // ## google storage path
    nulltGCSPath= GBC.nulltGCSPath;

    data: any;

    datetime: Date = new Date();
    // yarnWeight: number = 0.00;

    constructor(
        public config: DynamicDialogConfig,
        public ref: DynamicDialogRef,

        public userService: UserService,
        public yarnService: YarnService,
    ) {}

    ngOnInit(): void {
        this.data = this.config.data;
        this.mode = this.data.mode;
        this.yarnSeason = this.data.yarnSeason;
        this.company = this.data.company;
        this.factorySelect = this.data.factorySelect;
        this.customer = this.data.customer;
        this.orderImagesSelect = this.data.orderImagesSelect;
        this.colorS = this.data.colorS;
        this.yarnColorID = this.data.yarnColorID;
        this.yarnPlan = this.data.yarnPlan;
        // console.log(this.data);
        // genColorSTxt(colorS: ColorS, str: string)
    }

    putAddYarnPackingList1() {
        const userID = this.userService.getUser().userID;
        const companyID = this.data.company.companyID;
        const factoryID = this.data.factorySelect.factoryID;
        const customerID = this.data.customer.customerID;
        const setName = this.data.customer.setName;
        const yarnID = this.data.yarnPlan.yarnID;
        const uuid = this.data.yarnPlan.uuid;
        // const yarnDataUUID = this.data.yarnDataUUID;
        const yarnSeason = this.data.yarnSeason;
        const type = 'receive';
        const yarnColorID = this.data.yarnColorID;
        // const orderIDs = this.userService.getOrderIDss();
        // getYarPlansList(companyID: string, factoryID: string, customerID: string, setName: string, yarnSeason: string)
        this.yarnService.putAddYarnPackingList1(userID, companyID, factoryID, customerID, uuid,
            yarnSeason, yarnID, this.datetime, yarnColorID, type);
        this.ref.close('sendToAddnew');
    }

    selectDate() {

    }

    closeModalPage() {
        this.ref.close();
    }

    ngOnDestroy(): void {
        // if (this.dataAroundAppSub) { this.dataAroundAppSub.unsubscribe(); }
        // if (this.yarnPlanListSub) { this.yarnPlanListSub.unsubscribe(); }

    }
}
