import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { GBC } from 'src/app/global/const-global';
import { YarnLotUsageRow } from 'src/app/models/yarn.model';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-smd-input-number1',
  templateUrl: './smd-input-number1.component.html',
  styleUrls: ['./smd-input-number1.component.scss']
})
export class SmdInputNumber1Component implements OnInit, AfterViewInit {
    @ViewChild('input1', { static: false }) scanInputBox!: ElementRef;
    data: any;
    number1: string = '';

    mode = ''; // 'yarn.input1.stockcard.pcs'

    // ## for  mode: 'yarn.input1.stockcard.pcs'
    uS: YarnLotUsageRow = GBC.clrYarnLotUsageRow();
    yarnID = '';

    constructor(
        public config: DynamicDialogConfig,
        public ref: DynamicDialogRef,

    //     private confirmationService: ConfirmationService,
    //     private messageService: MessageService,

        public userService: UserService,
    //     public yarnService: YarnService,
    ) {}

    ngOnInit(): void {
        this.data = this.config.data;
        this.mode = this.data.mode;

        // ## for  mode: 'yarn.input1.stockcard.pcs'
        if (this.mode === 'yarn.input1.stockcard.pcs') {
            this.uS = this.data.uS;
            this.yarnID = this.data.yarnID;
        }
    }

    ngAfterViewInit(): void {
        this.scanInputBox.nativeElement.focus(); // ## input setfocus
        this.scanInputBox.nativeElement.select();
    }

    confirmNumber1() {
        this.closeDialog();
    }

    checkNumber() {
        // this.number1 = +this.number1 + '';
    }

    closeDialog() {
        if (this.number1.trim() === '') {
            this.number1 = '0';
        }
        const data1: any = {
            data: this.data,
            number1: +this.number1,
            success: true
        };
        this.ref.close(data1);
    }
}
