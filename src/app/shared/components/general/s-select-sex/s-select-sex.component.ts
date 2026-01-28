import { Component, OnInit } from '@angular/core';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';

@Component({
    selector: 'app-s-select-sex',
    templateUrl: './s-select-sex.component.html',
    styleUrls: ['./s-select-sex.component.scss'],
})
export class SSelectSexComponent implements OnInit {
    constructor(
        public config: DynamicDialogConfig,
        public ref: DynamicDialogRef,
    ) {}

    ngOnInit(): void {}

    selectSex(sex: string) {
        this.closeDialog(sex);
    }

    closeDialog(sex: string) {
        this.ref.close(sex);
    }
}
