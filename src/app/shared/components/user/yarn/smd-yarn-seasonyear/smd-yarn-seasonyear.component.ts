import { Component, OnDestroy, OnInit } from '@angular/core';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Subscription } from 'rxjs';
import { GBC } from 'src/app/global/const-global';
import { Company } from 'src/app/models/app.model';
import { YarnSeason } from 'src/app/models/yarn.model';
import { OrderService } from 'src/app/services/order.service';
import { UserService } from 'src/app/services/user.service';
import { YarnService } from 'src/app/services/yarn.service';

@Component({
  selector: 'app-smd-yarn-seasonyear',
  templateUrl: './smd-yarn-seasonyear.component.html',
  styleUrls: ['./smd-yarn-seasonyear.component.scss']
})
export class SmdYarnSeasonyearComponent implements OnInit, OnDestroy {

    data: any;
    company: Company = GBC.clrCompany();

    moduleCaption = '';
    yarnSeason = '';
    yarnSeasons: YarnSeason[] = [];

    private yarnSub: Subscription = new Subscription();

    constructor(
        public config: DynamicDialogConfig,
        public ref: DynamicDialogRef,

        // public translate: TranslateService,
        public userService: UserService,
        private orderService: OrderService,
        private yarnService: YarnService,
    ) { }

    ngOnInit(): void {
        this.data = this.config.data;
        this.moduleCaption = this.data.moduleCaption;
        this.company = this.userService.getCompany();
        this.yarnSeasons = this.userService.yarnSeasons;
        // this.yarnSeasons = this.orderService;
        // console.log(this.userService.orderSeasonYears);
        console.log(this.yarnSeasons);
    }

    // getOrders(yarnSeason: string) {
    //     const ordersLimit = 10000;
    //     const seasonYear = yarnSeason.substr(0, 4);
    //     this.orderService.getOrders(this.company.companyID, 1, ordersLimit, seasonYear);
    //     this.closeDialog(yarnSeason);

    // }


    closeDialog(seasonYear: string) {
        const data = '';
        const ordersLimit = 10000;
        // const seasonYear = yarnSeason;  // yarnSeason.substr(0, 4);
        // console.log(seasonYear);
        this.orderService.getOrders(this.company.companyID, 1, ordersLimit, seasonYear);
        // this.userService.yarnSeason= yarnSeason;
        this.userService.setYarnSeason(seasonYear);
        // this.getOrders(1, this.orderService.ordersLimit, seasonYear);
        this.ref.close(seasonYear);
    }

    // closeDialog(yarnSeason: string) {
    //     const data = '';
    //     const ordersLimit = 10000;
    //     const seasonYear = yarnSeason;  // yarnSeason.substr(0, 4);
    //     // console.log(seasonYear);
    //     this.orderService.getOrders(this.company.companyID, 1, ordersLimit, seasonYear);
    //     // this.userService.yarnSeason= yarnSeason;
    //     this.userService.setYarnSeason(yarnSeason);
    //     // this.getOrders(1, this.orderService.ordersLimit, seasonYear);
    //     this.ref.close(yarnSeason);
    // }

    ngOnDestroy(): void {
        if (this.yarnSub) { this.yarnSub.unsubscribe(); }
        // if (this.dataAroundAppSub) { this.dataAroundAppSub.unsubscribe(); }

    }
}
