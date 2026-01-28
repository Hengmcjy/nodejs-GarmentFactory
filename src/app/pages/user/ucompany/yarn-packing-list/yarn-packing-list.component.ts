import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { GBC } from 'src/app/global/const-global';
import { Company, Factory } from 'src/app/models/app.model';
import { Customer } from 'src/app/models/order.model';
// import { Location } from '@angular/common';
// import { Router, ActivatedRoute } from '@angular/router';
import { UserService } from 'src/app/services/user.service';
import { YarnService } from 'src/app/services/yarn.service';

@Component({
  selector: 'app-yarn-packing-list',
  templateUrl: './yarn-packing-list.component.html',
  styleUrls: ['./yarn-packing-list.component.scss']
})
export class YarnPackingListComponent implements OnInit, OnDestroy {
    @Input() mode = '';
    @Input() yarnSeason = '';
    @Input() company: Company = GBC.clrCompany();
    @Input() factorySelect: Factory = GBC.clrFactory();
    @Input() customer: Customer = GBC.clrCustomer();

    formActive = 'yarn-packing-list';
    formName = this.formActive;

    // menuMode = '';  // ## yarn-packing-list


    // private yarnPlanListSub: Subscription = new Subscription();

    constructor(
        // private route: ActivatedRoute,
        // private router: Router,
        // private location: Location,
        public userService: UserService,
        public yarnService: YarnService,
    ) {}


    ngOnInit(): void {
        // this.location.replaceState('/'); // ## hide loocation
        // this.userService.setFormActive(this.formActive);

        // this.menuMode = (this.route.snapshot.queryParamMap.get('menuMode') + '')?this.route.snapshot.queryParamMap.get('menuMode') + '':'noMenu';
        console.log(this.mode);
    }

    ngOnDestroy(): void {
        // if (this.dataAroundAppSub) { this.dataAroundAppSub.unsubscribe(); }
        // if (this.yarnsListSub) { this.yarnsListSub.unsubscribe(); }

    }
}
