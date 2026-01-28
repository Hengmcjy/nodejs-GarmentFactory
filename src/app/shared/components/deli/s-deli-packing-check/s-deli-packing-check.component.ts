import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { DialogService } from 'primeng/dynamicdialog';
import { Subscription } from 'rxjs';
import { GBC } from 'src/app/global/const-global';
import { Company } from 'src/app/models/app.model';
import { DPacking, DPackingQTY } from 'src/app/models/carton.model';
import { DeliService } from 'src/app/services/deli.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-s-deli-packing-check',
  templateUrl: './s-deli-packing-check.component.html',
  styleUrls: ['./s-deli-packing-check.component.scss'],
  providers: [DialogService],
})
export class SDeliPackingCheckComponent implements OnInit, OnDestroy {
    @Input() mode = ''; // ## edit
    @Input() dPacking1: DPacking = GBC.clrDPacking();

    company: Company = GBC.clrCompany();

    dPackingCompleted: DPacking = GBC.clrDPacking();
    dPackingWaiting: DPacking = GBC.clrDPacking();
    size1: any[] = [];
    sizeC: any[] = [];
    sizeW: any[] = [];


    dbTest: any[] = [
        {seq: 1 , cartonID: 'AAAAA', cartonName:'1000', cSize:'D55*W28*H25'},
        {seq: 2 , cartonID: 'BBBBB', cartonName:'200', cSize:'D37*W37*H20'},
        {seq: 3 , cartonID: 'CCCCC', cartonName:'10', cSize:'D..*W..*H..'},
        {seq: 4 , cartonID: 'DDDDD', cartonName:'5', cSize:'D--*W--*H--'},
    ];

    // private dPackingsSub: Subscription = new Subscription();
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
        // private router: Router,
        // private location: Location,
        public dialogService: DialogService,

        public userService: UserService,
        // private orderService: OrderService,
        // public yarnService: YarnService,
        public deliService: DeliService,
        // private repService: ReportService,
    ) {}

    ngOnInit(): void {
        console.log('SDeliPackingCheckComponent');
        this.company = this.userService.getCompany();
        // this.seasonYear = this.userService.seasonYear;

        // this.getDPackings(this.seasonYear);
        this.refreshDCarton1();
    }

    refreshDCarton1() {
        // ##

        const dPackingC: DPacking = JSON.parse(JSON.stringify(this.dPacking1));
        const dPackingW: DPacking = JSON.parse(JSON.stringify(this.dPacking1));
        this.dPackingCompleted = JSON.parse(JSON.stringify(this.dPacking1));
        this.dPackingWaiting = JSON.parse(JSON.stringify(this.dPacking1));
        const dCartonC= dPackingC.dCarton.filter(i=>i.dStatus == 'c');
        const dCartonW= dPackingW.dCarton.filter(i=>i.dStatus == 'w');
        this.dPackingCompleted.dCarton = dCartonC;
        this.dPackingWaiting.dCarton = dCartonW;

        this.dPacking1.dCarton.sort((a,b)=>{
            return +a.seq > +b.seq?1: +a.seq < +b.seq?-1:0
            || a.dCartonID >b.dCartonID?1:a.dCartonID <b.dCartonID?-1:0
        });
        this.dPackingCompleted.dCarton.sort((a,b)=>{
            return +a.seq > +b.seq?1: +a.seq < +b.seq?-1:0
            || a.dCartonID >b.dCartonID?1:a.dCartonID <b.dCartonID?-1:0
        });
        this.dPackingWaiting.dCarton.sort((a,b)=>{
            return +a.seq > +b.seq?1: +a.seq < +b.seq?-1:0
            || a.dCartonID >b.dCartonID?1:a.dCartonID <b.dCartonID?-1:0
        });
        // console.log(this.dPacking1.dCarton);
        this.calDCartonQty_All();
        this.calDCartonQty_Completed()
        this.calDCartonQty_Waiting()
        // this.getCartonPage(this.page);
        console.log(this.dPacking1);
    }

    calDCartonQty_All() {
            let totalCarton = 0;  // ##  counting box
            let totalDPQty = 0;  // ##  total all qty

            let dPackingQTY1: DPackingQTY[] = [];
            this.size1 = [];

            this.dPacking1.dCarton.forEach( (item, index) => {
                totalCarton = totalCarton + 1;

                let totalQTY = 0;
                item.dBox.forEach( (item2, index) => {
                    totalDPQty = totalDPQty + +item2.productQty;
                    totalQTY = totalQTY + +item2.productQty;

                    // ## update DPackingQTY[]
                    let dPackingQTY1_: DPackingQTY = {
                        productColor: item2.productColor,
                        productSize: item2.productSize,
                        totalQty: item2.productQty,
                        colorSeq: item2.colorSeq,
                        sizeSeq: item2.sizeSeq,
                    };
                    const idx = dPackingQTY1.findIndex( i =>(
                            i.productColor == item2.productColor
                            && i.productSize == item2.productSize));
                    if (idx < 0) {
                        dPackingQTY1.push(dPackingQTY1_);
                    } else {
                        dPackingQTY1[idx].totalQty = dPackingQTY1[idx].totalQty + item2.productQty;
                    }

                    // ## update size
                    const idxSize = this.size1.findIndex( i =>(i.productSize == item2.productSize));
                    if (idxSize < 0) {
                        this.size1.push({
                            productSize: item2.productSize,
                            sizeSeq: item2.sizeSeq
                        });
                        this.size1.sort((a,b)=>{ return a.sizeSeq >b.sizeSeq?1:a.sizeSeq <b.sizeSeq?-1:0 });
                    } else {

                    }

                });
                item.totalQTY = totalQTY;
            });

            this.dPacking1.dPackingQTY = dPackingQTY1;
            this.dPacking1.totalCarton = totalCarton;
            this.dPacking1.totalDPQty = totalDPQty;
        }

        calDCartonQty_Completed() {
            // this.dPackingCompleted = JSON.parse(JSON.stringify(this.dPacking1));
            // this.dPackingWaiting = JSON.parse(JSON.stringify(this.dPacking1));
            let totalCarton = 0;  // ##  counting box
            let totalDPQty = 0;  // ##  total all qty

            let dPackingQTYC: DPackingQTY[] = [];
            this.sizeC = [];

            this.dPackingCompleted.dCarton.forEach( (item, index) => {
                totalCarton = totalCarton + 1;

                let totalQTY = 0;
                item.dBox.forEach( (item2, index) => {
                    totalDPQty = totalDPQty + +item2.productQty;
                    totalQTY = totalQTY + +item2.productQty;

                    // ## update DPackingQTY[]
                    let dPackingQTY1_: DPackingQTY = {
                        productColor: item2.productColor,
                        productSize: item2.productSize,
                        totalQty: item2.productQty,
                        colorSeq: item2.colorSeq,
                        sizeSeq: item2.sizeSeq,
                    };
                    const idx = dPackingQTYC.findIndex( i =>(
                            i.productColor == item2.productColor
                            && i.productSize == item2.productSize));
                    if (idx < 0) {
                        dPackingQTYC.push(dPackingQTY1_);
                    } else {
                        dPackingQTYC[idx].totalQty = dPackingQTYC[idx].totalQty + item2.productQty;
                    }

                    // ## update size
                    const idxSize = this.sizeC.findIndex( i =>(i.productSize == item2.productSize));
                    if (idxSize < 0) {
                        this.sizeC.push({
                            productSize: item2.productSize,
                            sizeSeq: item2.sizeSeq
                        });
                        this.sizeC.sort((a,b)=>{ return a.sizeSeq >b.sizeSeq?1:a.sizeSeq <b.sizeSeq?-1:0 });
                    } else {

                    }
                });
                item.totalQTY = totalQTY;
            });

            this.dPackingCompleted.totalCarton = totalCarton;
            this.dPackingCompleted.totalDPQty = totalDPQty;
        }

        calDCartonQty_Waiting() {
            // this.dPackingCompleted = JSON.parse(JSON.stringify(this.dPacking1));
            // this.dPackingWaiting = JSON.parse(JSON.stringify(this.dPacking1));
            let totalCarton = 0;  // ##  counting box
            let totalDPQty = 0;  // ##  total all qty

            let dPackingQTYW: DPackingQTY[] = [];
            this.sizeW = [];

            this.dPackingWaiting.dCarton.forEach( (item, index) => {
                totalCarton = totalCarton + 1;

                let totalQTY = 0;
                item.dBox.forEach( (item2, index) => {
                    totalDPQty = totalDPQty + +item2.productQty;
                    totalQTY = totalQTY + +item2.productQty;

                    // ## update DPackingQTY[]
                    let dPackingQTY1_: DPackingQTY = {
                        productColor: item2.productColor,
                        productSize: item2.productSize,
                        totalQty: item2.productQty,
                        colorSeq: item2.colorSeq,
                        sizeSeq: item2.sizeSeq,
                    };
                    const idx = dPackingQTYW.findIndex( i =>(
                            i.productColor == item2.productColor
                            && i.productSize == item2.productSize));
                    if (idx < 0) {
                        dPackingQTYW.push(dPackingQTY1_);
                    } else {
                        dPackingQTYW[idx].totalQty = dPackingQTYW[idx].totalQty + item2.productQty;
                    }

                    // ## update size
                    const idxSize = this.sizeW.findIndex( i =>(i.productSize == item2.productSize));
                    if (idxSize < 0) {
                        this.sizeW.push({
                            productSize: item2.productSize,
                            sizeSeq: item2.sizeSeq
                        });
                        this.sizeW.sort((a,b)=>{ return a.sizeSeq >b.sizeSeq?1:a.sizeSeq <b.sizeSeq?-1:0 });
                    } else {

                    }
                });
                item.totalQTY = totalQTY;
            });

            this.dPackingWaiting.totalCarton = totalCarton;
            this.dPackingWaiting.totalDPQty = totalDPQty;
        }


    ngOnDestroy(): void {
        // if (this.dPackingsSub) { this.dPackingsSub.unsubscribe(); }
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
