import { Component, OnInit } from '@angular/core';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { GBC } from 'src/app/global/const-global';
import { DCountry } from 'src/app/models/carton.model';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-smd-deli-country-select',
  templateUrl: './smd-deli-country-select.component.html',
  styleUrls: ['./smd-deli-country-select.component.scss']
})
export class SmdDeliCountrySelectComponent implements OnInit {
    data: any;
    dCountries: DCountry[] = [];
    dCountry: DCountry = GBC.clrDCountry();

    constructor(
        public config: DynamicDialogConfig,
        public ref: DynamicDialogRef,

        public userService: UserService,
    ) {}

    ngOnInit(): void {
        this.data = this.config.data;
        this.dCountries = this.data.dCountries;
        // this.idx = this.data.idx;
        // console.log(this.data);
    }

    selectCountry(dCountry: DCountry) {
        this.ref.close({
            dCountry: dCountry,
            // idx: this.idx
        });
    }
}
