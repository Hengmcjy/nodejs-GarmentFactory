import { Component, OnDestroy, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { DialogService } from 'primeng/dynamicdialog';
import { MessageService } from 'primeng/api';
import { Router } from '@angular/router';
import { DeliService } from 'src/app/services/deli.service';
import { Subscription } from 'rxjs';
import { DCountry } from 'src/app/models/carton.model';
import { UserService } from 'src/app/services/user.service';
import { GBC } from 'src/app/global/const-global';

@Component({
  selector: 'app-tsp-setting-destination',
  templateUrl: './tsp-setting-destination.component.html',
  styleUrls: ['./tsp-setting-destination.component.scss']
})
export class TspSettingDestinationComponent implements OnInit, OnDestroy {

    mode = 'destination-list'; // ##
    editMode = false;

    dCountries: DCountry[] = [];
    dCountry: DCountry = GBC.clrDCountry();
    dCountryCreate: DCountry = GBC.clrDCountry();

    // dCountry: any[] = [
    //     {seq: 1 , dCountryID: 'japan-tokyo', dCountryName:'japan-tokyo'},
    //     {seq: 2 , dCountryID: 'japan-kobe', dCountryName:'japan-kobe'},
    //     {seq: 3 , dCountryID: 'thailand', dCountryName:'thailand'},
    //     {seq: 4 , dCountryID: 'china', dCountryName:'china'},
    // ];


    private countriesSub: Subscription = new Subscription();

    constructor(
        public dialogService: DialogService,
        public messageService: MessageService,
        private router: Router,
        private location: Location,

        public userService: UserService,
        private deliService: DeliService,
        // private orderService: OrderService,
        // private productService: ProductService,
        // private cusService: CustomerService,
    ) {}

    ngOnInit(): void {
        this.location.replaceState('/'); // ## hide loocation

        this.getDCountries();
    }

    changeMode(mode: string) {
        this.mode = mode;
    }

    destinationEdit() {
        this.editMode = !this.editMode;
    }

    getDCountries() {
        this.dCountries = [];
        this.deliService.getDCountries();
        if (this.countriesSub) { this.countriesSub.unsubscribe(); }
        this.countriesSub = this.deliService.getDCountriesUpdatedListener()
        .subscribe((data) => {
            // console.log(data);
            this.dCountries = data.dCountries;

        });
    }

    dCountryCartonSelect(dCountry: DCountry) {
        this.dCountry = GBC.clrDCountry();
        this.dCountry = dCountry;
    }


    ngOnDestroy(): void {
        if (this.countriesSub) { this.countriesSub.unsubscribe(); }
        // if (this.dataAroundAppSub) { this.dataAroundAppSub.unsubscribe(); }

    }
}
