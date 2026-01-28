import { Component, OnInit } from '@angular/core';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';

import { UserService } from 'src/app/services/user.service';
import {  SizeS } from 'src/app/models/app.model';

@Component({
    selector: 'app-s-select-size',
    templateUrl: './s-select-size.component.html',
    styleUrls: ['./s-select-size.component.scss'],
})
export class SSelectSizeComponent implements OnInit {
    data: any;
    sizes: SizeS[] = [];

    constructor(
        public config: DynamicDialogConfig,
        public ref: DynamicDialogRef,
        private userService: UserService
    ) {}

    ngOnInit(): void {
        this.data = this.config.data;
        // console.log(this.data);
        this.sizes = this.userService.sizes;
    }

    selectSize(size: SizeS) {
        this.closeDialog(size);
    }

    closeDialog(size: SizeS) {
        this.ref.close(size);
    }
}
