import { Component, OnDestroy, OnInit } from '@angular/core';
import { DialogService } from 'primeng/dynamicdialog';
import { Subscription } from 'rxjs';
import { GBC } from 'src/app/global/const-global';
import { User } from 'src/app/models/user.model';
import { NodeStationService } from 'src/app/services/node-station.service';
import { OrderService } from 'src/app/services/order.service';
import { ReportService } from 'src/app/services/report.service';
import { UserService } from 'src/app/services/user.service';
import { YarnService } from 'src/app/services/yarn.service';
import { STsUploadimgsComponent } from 'src/app/shared/test/s-ts-uploadimgs/s-ts-uploadimgs.component';

@Component({
  selector: 'app-s-test-prg',
  templateUrl: './s-test-prg.component.html',
  styleUrls: ['./s-test-prg.component.scss'],
  providers: [DialogService],
})
export class STestPrgComponent implements OnInit, OnDestroy {

    user: User = GBC.clrUser();

    // ## test get file list from nodejs server
    fileListS: string[] = [];

    private dataAroundAppSub: Subscription = new Subscription();
    private yarnDataAroudAppSub: Subscription = new Subscription();
    private yarnPlanListSub: Subscription = new Subscription();
    private filenameListsSub: Subscription = new Subscription();

    constructor(
        // private router: Router,
        // private location: Location,

        public dialogService: DialogService,

        public userService: UserService,
        public orderService: OrderService,
        public nsService: NodeStationService,
        private repService: ReportService,
        public yarnService: YarnService,
    ) {}


    ngOnInit(): void {

    }

    getUser() {
        this.user = this.userService.getUser();
        console.log(this.user);
    }

    getOrderProductionAPI1() {
        this.repService.getHengtestRep1();

    }

    getOrderProductionAPI2() {

    }

    // ## test get file list from nodejs server
    downloadLogging() {
        this.userService.downloadText();
    }

    // ## test get file list from nodejs server
    getfilenames() {
        this.userService.getfilenames();
        // // getFilenameListsListener
        // this.filenameListsUpdated   filenameListsSub
        if (this.filenameListsSub) { this.filenameListsSub.unsubscribe(); }
        this.filenameListsSub = this.userService.getFilenameListsListener().subscribe((data) => {
            console.log(data);
            this.fileListS = data.fileListS;

        });
    }

    uploadImagesShow() {
        const multiple = true;
        const folder = 'test/c000001/images';
        const ref = this.dialogService.open(STsUploadimgsComponent, {
            data: {
                id: 'fileImgsUpload',
                companyID: this.userService.getCompany()?.companyID,
                multiple: multiple, // ## allow upload multiple file
                callfrom: 'uploadImages',  // ##
                folder: folder,  // ##
            },
            header: 'images upload',
            width: '50%',
        });

        ref.onClose.subscribe((data: any) => {
            console.log(data);
            // if (car) {
            //     this.messageService.add({severity:'info', summary: 'Car Selected', detail:'Vin:' + car.vin});
            // }
        });
    }

    ngOnDestroy(): void {
        if (this.dataAroundAppSub) { this.dataAroundAppSub.unsubscribe(); }
        if (this.yarnDataAroudAppSub) { this.yarnDataAroudAppSub.unsubscribe(); }
        if (this.yarnPlanListSub) { this.yarnPlanListSub.unsubscribe(); }
        if (this.filenameListsSub) { this.filenameListsSub.unsubscribe(); }
    }
}
