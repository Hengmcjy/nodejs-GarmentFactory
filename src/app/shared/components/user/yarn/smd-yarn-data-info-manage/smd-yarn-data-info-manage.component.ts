import { Component, OnDestroy, OnInit } from '@angular/core';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { GBC } from 'src/app/global/const-global';
import { UserService } from 'src/app/services/user.service';
import { YarnService } from 'src/app/services/yarn.service';

@Component({
  selector: 'app-smd-yarn-data-info-manage',
  templateUrl: './smd-yarn-data-info-manage.component.html',
  styleUrls: ['./smd-yarn-data-info-manage.component.scss']
})
export class SmdYarnDataInfoManageComponent implements OnInit, OnDestroy {
    data: any;

    productImageProfileGCSPath = GBC.productImageProfileGCSPath;  // ## google storage path
    nulltGCSPath= GBC.nulltGCSPath;

    datetime: Date = new Date();
    yarnWeight: number = 0.00;


    constructor(
        public config: DynamicDialogConfig,
        public ref: DynamicDialogRef,

        public userService: UserService,
        public yarnService: YarnService,
    ) {}


    ngOnInit(): void {
        this.data = this.config.data;
        // console.log(this.data);
        // genColorSTxt(colorS: ColorS, str: string)
    }

    putYarnPlanDataInfo() {
        // putYarnPlanDataInfo(userID: string, companyID: string, factoryID: string, customerID: string, uuid: string,
        //     yarnSeasonID: string, yarnID: string,
        // yarnDataUUID: string,
        //     datetime: Date, yarnColorID: string, type: string, yarnWeight: number)

        // this.yarnPlan = GBC.clrYarnData();
        // this.loading = true;
        // this.mode = 'list-manage-plan';
        const userID = this.userService.getUser().userID;
        const companyID = this.data.company.companyID;
        const factoryID = this.data.factorySelect.factoryID;
        const customerID = this.data.customer.customerID;
        const setName = this.data.customer.setName;
        const yarnID = this.data.yarnPlan.yarnID;
        const uuid = this.data.uuid;
        // const yarnDataUUID = this.data.yarnDataUUID;
        const yarnSeason = this.data.yarnSeason;
        const type = 'plan';
        const type2 = ['plan', 'receive'];
        const yarnColorID = this.data.yarnColorID;
        // const orderIDs = this.userService.getOrderIDss();
        // getYarPlansList(companyID: string, factoryID: string, customerID: string, setName: string, yarnSeason: string)
        this.yarnService.putYarnPlanDataInfo(userID, companyID, factoryID, customerID, uuid,
            yarnSeason, yarnID, this.datetime, yarnColorID, type, this.yarnWeight, type2);
        this.ref.close('sendToUpdate');
    }

    selectDate() {
        this.yarnWeight = +this.yarnWeight.toFixed(2);
        // console.log(this.date1.length);
        // console.log(this.datetime);
        // console.log(+this.yarnWeight.toFixed(2));
    }

    ngOnDestroy(): void {
        // if (this.dataAroundAppSub) { this.dataAroundAppSub.unsubscribe(); }
        // if (this.yarnPlanListSub) { this.yarnPlanListSub.unsubscribe(); }

    }
}
