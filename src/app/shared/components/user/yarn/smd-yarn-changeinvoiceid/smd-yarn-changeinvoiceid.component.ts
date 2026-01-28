import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-smd-yarn-changeinvoiceid',
  templateUrl: './smd-yarn-changeinvoiceid.component.html',
  styleUrls: ['./smd-yarn-changeinvoiceid.component.scss']
})
export class SmdYarnChangeinvoiceidComponent  implements OnInit, AfterViewInit {
    @ViewChild('input1', { static: false }) scanInputBox!: ElementRef;
    data: any;

    invoiceID1 = '';
    invoiceID2 = '';
    invoiceID3 = '';

    okInvoice = false;

    constructor(
        public config: DynamicDialogConfig,
        public ref: DynamicDialogRef,

        public userService: UserService,
        // public yarnService: YarnService,
    ) {}

    ngOnInit(): void {
        this.data = this.config.data;
        // this.mode = this.data.mode;
        this.invoiceID1 = this.data.invoiceID1;

        // console.log(this.data);

        // // ## for  mode: 'yarn.input1.stockcard.pcs'
        // if (this.mode === 'yarn.input1.stockcard.pcs') {
        //     this.uS = this.data.uS;
        //     this.yarnID = this.data.yarnID;
        // }
    }



    ngAfterViewInit(): void {
        this.scanInputBox.nativeElement.focus(); // ## input setfocus
        this.scanInputBox.nativeElement.select();
    }

    checkEqualString() {
        if (this.invoiceID2.trim() != '' && this.invoiceID3.trim()) {
            if (this.invoiceID2.trim() === this.invoiceID3.trim()) {
                this.okInvoice = true;
            } else {
                this.okInvoice = false;
            }
        } else {
            this.okInvoice = false;
        }

    }

    closeDialog() {
        // if (this.number1.trim() === '') {
        //     this.number1 = '0';
        // }
        const data1: any = {
            data: this.data,
            invoiceID2: this.invoiceID2,
            success: true
        };
        this.ref.close(data1);
    }
}
