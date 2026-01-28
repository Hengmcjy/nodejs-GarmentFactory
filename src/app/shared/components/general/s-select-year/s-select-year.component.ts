import { Component, OnInit } from '@angular/core';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';

@Component({
    selector: 'app-s-select-year',
    templateUrl: './s-select-year.component.html',
    styleUrls: ['./s-select-year.component.scss'],
})
export class SSelectYearComponent implements OnInit {
    data: any;
    year = '';
    yearBefore: string[] = [];
    yearNow: string[] = [];
    yearAfter: string[] = [];
    constructor(
        public config: DynamicDialogConfig,
        public ref: DynamicDialogRef,
    ) {}

    ngOnInit(): void {
        this.data = this.config.data
        this.year = new Date().getFullYear()+'';
        // console.log(this.year);
        this.yearNow.push(this.year);

        let yBefore = +this.year - 1;
        for(let i=1; i<=5; i++){
            this.yearBefore.push(yBefore+'');
            yBefore = yBefore - 1;
        }

        let yAfter = +this.year + 1;
        for(let i=1; i<=5; i++){
            this.yearAfter.push(yAfter+'');
            yAfter = yAfter + 1;
        }

        // console.log(this.yearBefore , this.yearAfter);
    }

    selectYear(year: string) {
        if (this.data.id === 'seasonYearSelection') {
            const data = {
                id: this.data.id,
                seasonYear: year
            };
            this.ref.close(data);
        } else {
            this.closeDialog(year);
        }
    }

    closeDialog(year: string) {
        this.ref.close(year);
    }
}
