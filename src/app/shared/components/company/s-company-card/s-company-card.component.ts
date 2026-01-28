import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';

import { UserService } from 'src/app/services/user.service';
import { Company } from 'src/app/models/app.model';
import { GBC } from 'src/app/global/const-global';

@Component({
    selector: 'app-s-company-card',
    templateUrl: './s-company-card.component.html',
    styleUrls: ['./s-company-card.component.scss'],
})
export class SCompanyCardComponent implements OnInit, OnDestroy {

    companyFactoryImageProfileGCSPath = GBC.companyFactoryImageProfileGCSPath;  // ## google storage path company image profile
    company: Company = GBC.clrCompany();

    private dataAroundAppSub: Subscription = new Subscription();

    constructor(
        private userService: UserService,
    ) {}

    ngOnInit(): void {
        this.company = this.userService.getCompany();
        this.getSelectCompanySelect();
    }

    getSelectCompanySelect() {
        if (this.dataAroundAppSub) { this.dataAroundAppSub.unsubscribe(); }
        this.dataAroundAppSub = this.userService
            .getDataAroundAppStatusListener()
            .subscribe((dataAroundApp) => {
                this.company = dataAroundApp.company;
            });
    }

    genImagePath(imgPath: string) {
        if (imgPath) {
            if (imgPath.length > 0) {
                return this.companyFactoryImageProfileGCSPath + imgPath;
            }
        }

        return GBC.selectOneGCSPath;
    }

    ngOnDestroy(): void {
        if (this.dataAroundAppSub) { this.dataAroundAppSub.unsubscribe(); }
    }
}
