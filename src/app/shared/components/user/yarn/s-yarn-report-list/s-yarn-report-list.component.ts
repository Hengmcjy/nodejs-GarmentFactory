import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { DialogService } from 'primeng/dynamicdialog';
import { Subscription } from 'rxjs';
import { GBC } from 'src/app/global/const-global';
import { Company, Factory } from 'src/app/models/app.model';
import { Customer, OrderImage } from 'src/app/models/order.model';
import { ReportService } from 'src/app/services/report.service';
import { UserService } from 'src/app/services/user.service';
import { YarnService } from 'src/app/services/yarn.service';

@Component({
  selector: 'app-s-yarn-report-list',
  templateUrl: './s-yarn-report-list.component.html',
  styleUrls: ['./s-yarn-report-list.component.scss'],
  providers: [DialogService],
})
export class SYarnReportListComponent implements OnInit, OnDestroy {
    @Input() viewMode = 'yarnReport'; // ## plan , factoryStock, yarnTransferReport yarnReport
    @Input() mode = '';  // ##  yarnReport-list
    @Input() yarnSeasonID = '';
    @Input() company: Company = GBC.clrCompany();
    @Input() factorySelect: Factory = GBC.clrFactory();
    @Input() customer: Customer = GBC.clrCustomer();

    @Output() closeYarnReportList = new EventEmitter<any>();

    productImageProfileGCSPath = GBC.productImageProfileGCSPath;  // ## google storage path
    nulltGCSPath= GBC.nulltGCSPath;

    yarnID= '';

    loading = false;

    orderIDs: string[] = [];
    orderImages: OrderImage[] = [];

    private dataAroundAppSub: Subscription = new Subscription();
    private yarnReportSub: Subscription = new Subscription();

    constructor(
        // private route: ActivatedRoute,
        // private router: Router,
        // private location: Location,

        public dialogService: DialogService,

        public userService: UserService,
        public yarnService: YarnService,
        private repService: ReportService,
    ) {}

    ngOnInit(): void {
        // console.log('ngOnInit');
        // console.log('app-s-yarn-report-list');
        this.yarnID = this.yarnService.yarnIDReport;  // ## get yarn ID for report
        this.loading = false;
        this.company = this.userService.getCompany();

        this.yarnSeasonID = this.userService.yarnSeason;
        this.customer = this.userService.getCustomer();
        this.factorySelect = this.userService.factorySelect;
        // this.userService.setYarnSeason(this.yarnSeasonID);
        // this.userService.factorySelect = this.factorySelect;
        // this.userService.setCustomer(this.customer);


        this.dataAroundAppSub = this.userService
            .getDataAroundAppStatusListener()
            .subscribe((dataAroundApp) => {
                // ## declare initial variable from service user

                this.customer = dataAroundApp.customer;
                this.factorySelect = dataAroundApp.factorySelect;
                this.yarnSeasonID = dataAroundApp.yarnSeason;
                // console.log('1');
                // this.checkMode('');
            });
        this.yarnReportSub = this.yarnService.getYarnReportListener().subscribe((data) => {
            // console.log(data);
            this.yarnID = data.yarnID;
        });

        this.orderIDs = this.userService.getOrderIDss();
        this.orderImages = this.userService.getOrderImage(this.orderIDs);



        // console.log(this.mode);
        // console.log(this.yarnPlan);
        // this.orderImagesSelect = [];
        // this.orderImagesSelect = this.userService.getOrderImage(this.yarnPlan.orderID);
        // console.log(this.userService.productImageProfiles);

        // this.getYarnPlansList1();
    }

    createContent() {

    }

    closePage() {
        this.closeYarnReportList.emit('close page');
    }

    ngOnDestroy(): void {
        if (this.dataAroundAppSub) { this.dataAroundAppSub.unsubscribe(); }
        if (this.yarnReportSub) { this.yarnReportSub.unsubscribe(); }

    }
}
