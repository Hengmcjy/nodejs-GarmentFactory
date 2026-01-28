import { Component, OnInit, OnDestroy } from '@angular/core';

import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Subscription } from 'rxjs';

import { UserService } from 'src/app/services/user.service';

@Component({
    selector: 'app-factory-new',
    templateUrl: './factory-new.component.html',
    styleUrls: ['./factory-new.component.scss'],
})
export class FactoryNewComponent implements OnInit, OnDestroy {
    page = 1;
    limit = 10;
    factoryName: string = '';
    factoryDesc: string = '';
    companyID: string = '';

    private getUserFactorySub: Subscription = new Subscription();

    constructor(
        public config: DynamicDialogConfig,
        public ref: DynamicDialogRef,
        private userService: UserService
    ) {}

    ngOnInit(): void {
        // console.log('factory new create');
        // console.log(this.config.data);
        this.companyID = this.config.data.companyID;
        // console.log(this.companyID);
        this.getUserFactory();
    }

    getUserFactory() {
        if (this.getUserFactorySub) { this.getUserFactorySub.unsubscribe(); }
        this.getUserFactorySub = this.userService.getUserFactoryUpdatedListener().subscribe((data) => {
            this.closeDialog();
        });
    }

    closeDialog() {
        this.ref.close('button close dialog from ufactory create');
    }

    createUserfactory() {
        this.userService.createUserFactory(
            this.userService.getUserID(),
            this.companyID,
            this.factoryName,
            this.factoryDesc,
            this.page,
            this.limit);
    }

    ngOnDestroy(): void {
        if (this.getUserFactorySub) { this.getUserFactorySub.unsubscribe(); }
    }
}
