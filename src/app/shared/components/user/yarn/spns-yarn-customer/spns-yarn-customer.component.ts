import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { GBC } from 'src/app/global/const-global';
import { Customer } from 'src/app/models/order.model';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-spns-yarn-customer',
  templateUrl: './spns-yarn-customer.component.html',
  styleUrls: ['./spns-yarn-customer.component.scss']
})
export class SpnsYarnCustomerComponent implements OnInit, OnDestroy {
    @Input() customer: Customer = GBC.clrCustomer();

    customerImageProfileGCSPath = GBC.customerImageProfileGCSPath;  // ## google storage path

    selectCustTxt = 'select customer..';

    private dataAroundAppSub: Subscription = new Subscription();

    constructor(
        // private router: Router,
        // private location: Location,
        public userService: UserService,
    ) {}

    ngOnInit(): void {
        // this.customer = GBC.clrCustomer();
        // this.userService.setCustomer(GBC.clrCustomer());
        this.dataAroundAppSub = this.userService
            .getDataAroundAppStatusListener()
            .subscribe((dataAroundApp) => {
                // ## declare initial variable from service user
                // console.log(dataAroundApp);
                this.customer = dataAroundApp.customer;
            });
    }

    genImagePath(imgPath: string) {
        if (imgPath.length > 0) {
            return this.customerImageProfileGCSPath+imgPath;
        }

        return GBC.nulltGCSPath;
    }

    ngOnDestroy(): void {
        if (this.dataAroundAppSub) { this.dataAroundAppSub.unsubscribe(); }
        // if (this.yarnsListSub) { this.yarnsListSub.unsubscribe(); }

    }

}
