import { Component, OnInit, OnDestroy } from '@angular/core';

import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';

import { UserService } from 'src/app/services/user.service';

@Component({
    selector: 'app-company-join',
    templateUrl: './company-join.component.html',
    styleUrls: ['./company-join.component.scss'],
})
export class CompanyJoinComponent implements OnInit, OnDestroy {
    joinToken: string = '';

    constructor(
        public config: DynamicDialogConfig,
        public ref: DynamicDialogRef,
        private userService: UserService
    ) {}

    ngOnInit(): void {

    }

    joinUserCompany() {

    }

    closeDialog() {
        this.ref.close('button close dialog');
    }

    ngOnDestroy(): void {

    }
}
