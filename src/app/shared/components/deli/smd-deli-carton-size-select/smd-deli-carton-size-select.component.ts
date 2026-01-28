import { Component, OnInit } from '@angular/core';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { DCarton } from 'src/app/models/carton.model';

@Component({
  selector: 'app-smd-deli-carton-size-select',
  templateUrl: './smd-deli-carton-size-select.component.html',
  styleUrls: ['./smd-deli-carton-size-select.component.scss']
})
export class SmdDeliCartonSizeSelectComponent implements OnInit {
    data: any;
    dCartons: DCarton[] = [];
    // dCountries: DCountry[] = [];
    // dCountry: DCountry = GBC.clrDCountry();

    cartonIDX = -1;

    constructor(
        public config: DynamicDialogConfig,
        public ref: DynamicDialogRef,

        // public userService: UserService,
    ) {}

    ngOnInit(): void {
        this.data = this.config.data;
        this.dCartons = this.data.dCartons;
        this.cartonIDX = this.data.cartonIDX;
        // this.idx = this.data.idx;
        // console.log(this.data);

        this.dCartons.sort((a,b)=>{
            return +a.seq > +b.seq?1: +a.seq < +b.seq?-1:0
            // || a.orderID >b.orderID?1:a.orderID <b.orderID?-1:0
            // || a.fromNode >b.fromNode?1:a.fromNode <b.fromNode?-1:0
            // || a.factoryID >b.factoryID?1:a.factoryID <b.factoryID?-1:0
        });
    }

    selectCarton(dCarton: DCarton) {
        this.ref.close({
            dCarton: dCarton,
            cartonIDX: this.cartonIDX
        });
    }
}
