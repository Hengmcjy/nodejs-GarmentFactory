import { Component, OnInit, OnDestroy } from '@angular/core';
import { Location } from '@angular/common';

import { UserService } from 'src/app/services/user.service';
import { Company, Factory } from 'src/app/models/app.model';
import { GBC } from 'src/app/global/const-global';
import { OrderService } from 'src/app/services/order.service';
import { User } from 'src/app/models/user.model';

@Component({
  selector: 'app-ufactory-dashboard',
  templateUrl: './ufactory-dashboard.component.html',
  styleUrls: ['./ufactory-dashboard.component.scss']
})
export class UfactoryDashboardComponent implements OnInit, OnDestroy {
    formActive = 'factory-dashboard';
    company: Company = GBC.clrCompany();
    factory: Factory = GBC.clrFactory();
    user: User = GBC.clrUser();

    bundleNodeID = '';

    constructor(
        private location: Location,
        public userService: UserService,
        private orderService: OrderService,
    ) {}

  ngOnInit(): void {
    this.bundleNodeID = this.userService.bundleNodeID;
    this.location.replaceState('/'); // ## hide loocation
    this.userService.setFormActive(this.formActive);
    this.company = this.userService.getCompany();
    this.factory = this.userService.getFactory();
    this.user = this.userService.getUser();

    const ordersLimit = 10000;
    this.orderService.getOrders(this.company.companyID, 1, ordersLimit, this.orderService.seasonYear);
    // this.orderService.getOrders(this.company.companyID, page, limit, seasonYear);
  }

  ngOnDestroy(): void {

  }
}
