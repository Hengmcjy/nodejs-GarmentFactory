import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { GBC } from 'src/app/global/const-global';
import { Company, Factory } from 'src/app/models/app.model';
import { ReportService } from 'src/app/services/report.service';
import { UserService } from 'src/app/services/user.service';

@Component({
    selector: 'app-s-rep-fac-queued-production',
    templateUrl: './s-rep-fac-queued-production.component.html',
    styleUrls: ['./s-rep-fac-queued-production.component.scss'],
})
export class SRepFacQueuedProductionComponent implements OnInit, OnDestroy {
    @Input() factory: Factory = GBC.clrFactory();

    reportHeader = 'Queued Production';

    factoryIDs: string[] = [];
    company: Company = GBC.clrCompany();

    private selectFactorySub: Subscription = new Subscription;

    constructor(
        public userService: UserService,
        private repService: ReportService,
    ) {}

    ngOnInit(): void {
        this.company = this.userService.getCompany();
        this.getSelectFactoryUpdatedListener();

        this.factoryIDs = this.userService.getFactoryIDArr([this.factory]);
    }

    getSelectFactoryUpdatedListener() {
        if (this.selectFactorySub) { this.selectFactorySub.unsubscribe(); }
        this.selectFactorySub = this.userService.getSelectFactoryUpdatedListener().subscribe((data) => {
            // console.log(data);
            this.factory = data.factory;
            this.factoryIDs = this.userService.getFactoryIDArr([this.factory]);
        });
    }

    ngOnDestroy(): void {
        if (this.selectFactorySub) { this.selectFactorySub.unsubscribe(); }
        // if (this.repCurrentProductQtyAllCFSub) { this.repCurrentProductQtyAllCFSub.unsubscribe(); }

        // if (this.langSub) { this.langSub.unsubscribe(); }
        // if (this.dataAroundAppSub) { this.dataAroundAppSub.unsubscribe(); }
    }
}
