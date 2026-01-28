import { Component, OnInit } from '@angular/core';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';

@Component({
  selector: 'app-s-cc-date-select',
  templateUrl: './s-cc-date-select.component.html',
  styleUrls: ['./s-cc-date-select.component.scss']
})
export class SCcDateSelectComponent implements OnInit {
    callFrom = '';  // ## call from  ...  // ## SYarnPlanPackinglistManageComponent
    id = '';  // ## selectSingleDate
    mode = '';  // ## selectSingleDate
    data: any;
    result: any = {
        callFrom: '',
        mode: '',
        date1: '',
        date2: '',
    };

    datetime: Date = new Date();

    constructor(
        public config: DynamicDialogConfig,
        public ref: DynamicDialogRef,
    ) {}

    ngOnInit(): void {
        this.data = this.config.data;
        this.result.callFrom = this.data.callFrom;
        this.result.id = this.data.id;
        this.result.mode = this.data.mode;
    }

    selectDate() {
        // console.log(this.datetime);
        this.result.date1 = this.datetime;
        this.closeModalPage(this.result);
    }

    closeModalPage(result: any): void  {
        this.ref.close(result);
    }
}
