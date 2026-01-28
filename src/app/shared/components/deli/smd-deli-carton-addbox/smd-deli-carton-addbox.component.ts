import { Component, OnInit } from '@angular/core';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-smd-deli-carton-addbox',
  templateUrl: './smd-deli-carton-addbox.component.html',
  styleUrls: ['./smd-deli-carton-addbox.component.scss']
})
export class SmdDeliCartonAddboxComponent implements OnInit {
    data: any;

    num1: number = 0;

    constructor(
        public config: DynamicDialogConfig,
        public ref: DynamicDialogRef,

        public userService: UserService,
    ) {}

    ngOnInit(): void {
        this.data = this.config.data;
        this.num1 = this.data.numbox;
        // this.cartonIDX = this.data.cartonIDX;
        // this.idx = this.data.idx;
        // console.log(this.data);

        // this.dCartons.sort((a,b)=>{
        //     return +a.seq > +b.seq?1: +a.seq < +b.seq?-1:0
        //     // || a.orderID >b.orderID?1:a.orderID <b.orderID?-1:0
        //     // || a.fromNode >b.fromNode?1:a.fromNode <b.fromNode?-1:0
        //     // || a.factoryID >b.factoryID?1:a.factoryID <b.factoryID?-1:0
        // });
    }

    saveNumber(num: number) {
        if (!this.num1) {
            this.num1 = 0;
        }
        this.ref.close({
            num: this.num1,
            // cartonIDX: this.cartonIDX
        });
    }
}
