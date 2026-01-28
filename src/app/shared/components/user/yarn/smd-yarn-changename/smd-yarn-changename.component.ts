import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { GBC } from 'src/app/global/const-global';
import { Yarn } from 'src/app/models/yarn.model';
import { UserService } from 'src/app/services/user.service';
import { YarnService } from 'src/app/services/yarn.service';

@Component({
  selector: 'app-smd-yarn-changename',
  templateUrl: './smd-yarn-changename.component.html',
  styleUrls: ['./smd-yarn-changename.component.scss']
})
export class SmdYarnChangenameComponent implements OnInit, AfterViewInit {
    @ViewChild('input1', { static: false }) scanInputBox!: ElementRef;
    data: any;

    companyID = '';
    yarn: Yarn = GBC.clrYarn();
    yarnID = '';
    yarnFullName = ''
    yarnFullName2 = ''

    conditionOK = false;

    constructor(
        public config: DynamicDialogConfig,
        public ref: DynamicDialogRef,

        public userService: UserService,
        public yarnService: YarnService,
    ) {}

    ngOnInit(): void {
        this.data = this.config.data;
        // console.log(this.data);
        // this.mode = this.data.mode;
        this.companyID = this.data.companyID;
        this.yarnID = this.data.yarnID;
        this.yarn = this.yarnService.get1YarnInfo(this.yarnID, this.companyID);
        this.yarnFullName = this.yarnService.getYarnfullName(this.yarnID);
        // get1YarnInfo(yarnID: string, companyID: string)


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

    // checkEqualString() {
    //     if (this.invoiceID2.trim() != '' && this.invoiceID3.trim()) {
    //         if (this.invoiceID2.trim() === this.invoiceID3.trim()) {
    //             this.okInvoice = true;
    //         } else {
    //             this.okInvoice = false;
    //         }
    //     } else {
    //         this.okInvoice = false;
    //     }

    // }

    closeDialog() {
        // if (this.number1.trim() === '') {
        //     this.number1 = '0';
        // }
        const data1: any = {
            data: this.data,
            yarnID: this.yarnID,
            yarnFullName2: this.yarnFullName2,
            success: true
        };
        this.ref.close(data1);
    }
}
