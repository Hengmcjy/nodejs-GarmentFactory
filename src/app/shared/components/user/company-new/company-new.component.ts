import { Component, OnInit, OnDestroy } from '@angular/core';

import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Subscription } from 'rxjs';

import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-company-new',
  templateUrl: './company-new.component.html',
  styleUrls: ['./company-new.component.scss']
})
export class CompanyNewComponent implements OnInit, OnDestroy {

    page = 1;
    limit = 10;
    companyName: string = '';
    companyDesc: string = '';
    abbreviation: string = '';  // ## ตัวย่อ

    private getUserCompanySub: Subscription = new Subscription();

    constructor(
        public config: DynamicDialogConfig,
        public ref: DynamicDialogRef,
        private userService: UserService
    ) { }

    ngOnInit(): void {
        // ## get user company
        this.getUserCompany();
    }

    getUserCompany() {
        if (this.getUserCompanySub) { this.getUserCompanySub.unsubscribe(); }
        this.getUserCompanySub = this.userService.getUserCompanyUpdatedListener()
            .subscribe((data) => {
                this.closeDialog();
            });
    }

    createUserCompany() {
        this.userService.createUserCompany(this.userService.getUserID(), this.companyName, this.companyDesc, this.page, this.limit);
    }

    closeDialog() {
        this.ref.close('button close dialog');
    }

    ngOnDestroy(): void {
        if (this.getUserCompanySub) { this.getUserCompanySub.unsubscribe(); }
    }
}
