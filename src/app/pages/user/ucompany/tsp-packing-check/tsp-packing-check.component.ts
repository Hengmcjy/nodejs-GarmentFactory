import { Component, OnDestroy, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import { DialogService } from 'primeng/dynamicdialog';
import { DeliService } from 'src/app/services/deli.service';
import { UserService } from 'src/app/services/user.service';
import { Subscription } from 'rxjs';
import { GBC } from 'src/app/global/const-global';
import { Company } from 'src/app/models/app.model';
import { DPacking } from 'src/app/models/carton.model';

@Component({
  selector: 'app-tsp-packing-check',
  templateUrl: './tsp-packing-check.component.html',
  styleUrls: ['./tsp-packing-check.component.scss'],
  providers: [DialogService],
})
export class TspPackingCheckComponent implements OnInit, OnDestroy {

    mode = 'delivery-list'; // ##   delivery-list  packing-check

    company: Company = GBC.clrCompany();
    seasonYear: string = '';

    dPackings: DPacking[] = [];
    dPacking1: DPacking = GBC.clrDPacking();

    private dPackingsSub: Subscription = new Subscription();
    // private repCompanyOrderSub: Subscription = new Subscription();
    // private ordersByOrderIDsSub: Subscription = new Subscription();
    // private order1Sub: Subscription = new Subscription();
    // private cartonsSub: Subscription = new Subscription();
    // private dPackingCreateSub: Subscription = new Subscription();
    // private cartonsSub: Subscription = new Subscription();
    // private cartonsSub: Subscription = new Subscription();
    // private cartonsSub: Subscription = new Subscription();
    // private cartonsSub: Subscription = new Subscription();

    constructor(
        private router: Router,
        private location: Location,
        public dialogService: DialogService,

        public userService: UserService,
        // private orderService: OrderService,
        // public yarnService: YarnService,
        public deliService: DeliService,
        // private repService: ReportService,
    ) {}

    ngOnInit(): void {
        this.location.replaceState('/'); // ## hide loocation
        this.company = this.userService.getCompany();
        this.seasonYear = this.userService.seasonYear;

        this.getDPackings(this.seasonYear);
    }

    getDPackings(seasonYear: string) {
        this.dPackings = [];
        const dStatus: string[] = ['hide', 'open', 'close']; // hide, open , close
        this.deliService.getDPackings(seasonYear, dStatus);
        if (this.dPackingsSub) { this.dPackingsSub.unsubscribe(); }
        this.dPackingsSub = this.deliService.getDPackingsListener()
        .subscribe((data) => {
            console.log(data);
            this.dPackings = data.dPackings;

        });
    }

    packingEdit(dPacking1: DPacking) {
        // console.log(this.dPacking1);
        // console.log(this.size1);
        // console.log(this.sizeC);
        // console.log(this.sizeW);
        // this.postDPackingCreateNew(this.dPacking1)
        this.dPacking1 = dPacking1;
        this.mode = 'packing-check';
    }

    changeMode(mode: string) {
        this.mode = mode;
    }

    ngOnDestroy(): void {
        if (this.dPackingsSub) { this.dPackingsSub.unsubscribe(); }
        // if (this.dataAroundAppSub) { this.dataAroundAppSub.unsubscribe(); }
        // if (this.countriesSub) { this.countriesSub.unsubscribe(); }
        // if (this.repCompanyOrderSub) { this.countriesSub.unsubscribe(); }
        // if (this.ordersByOrderIDsSub) { this.ordersByOrderIDsSub.unsubscribe(); }
        // if (this.order1Sub) { this.order1Sub.unsubscribe(); }
        // if (this.cartonsSub) { this.cartonsSub.unsubscribe(); }
        // if (this.dPackingCreateSub) { this.dPackingCreateSub.unsubscribe(); }

        // if (this.dPackingsSub) { this.dPackingsSub.unsubscribe(); }
        // if (this.dPackingsSub) { this.dPackingsSub.unsubscribe(); }
        // if (this.dPackingsSub) { this.dPackingsSub.unsubscribe(); }
        // if (this.dPackingsSub) { this.dPackingsSub.unsubscribe(); }
    }
}
