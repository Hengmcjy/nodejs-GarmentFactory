import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';

import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { DynamicDialogConfig } from 'primeng/dynamicdialog';
import { Subscription } from 'rxjs';

import { UserService } from 'src/app/services/user.service';
import { Company, Factory } from 'src/app/models/app.model';
import { User } from 'src/app/models/user.model';
import { GBC } from 'src/app/global/const-global';


@Component({
    selector: 'app-s-select-factory',
    templateUrl: './s-select-factory.component.html',
    styleUrls: ['./s-select-factory.component.scss'],
})
export class SSelectFactoryComponent implements OnInit, OnDestroy {

    companyFactoryImageProfileGCSPath = GBC.companyFactoryImageProfileGCSPath;  // ## google storage path company image profile

    page = 1;
    limit = 0;
    // user: User = this.userService.getUser();
    factories: Factory[] = [];
    company: Company = GBC.clrCompany();
    companyID: string = '';
    isOutsource = false;

    id = '';  // ## factorySelection-main, fin-set-cost-style-subnode, factorySelection-main, yarn-change-sendto
    mode = '';  // ## 'select'=normal step , 'selectForOrderQueue'=for order queue ,
    data: any;

    private getFactorysSub: Subscription = new Subscription();

    constructor(
        // public dialogService: DialogService,
        // public messageService: MessageService,
        public config: DynamicDialogConfig,
        public ref: DynamicDialogRef,

        private location: Location,
        private route: ActivatedRoute,
        private router: Router,
        private userService: UserService,
    ) {}

    ngOnInit(): void {
        this.data = this.config.data
        // console.log(this.data);

        this.id = this.data.id;
        this.isOutsource = this.data.isOutsource;

        this.limit = this.userService.factoryPageLimit;
        this.company = this.userService.getCompany();
        this.companyID = this.userService.getCompany().companyID;
        this.mode = this.userService.factoryMode;  // ## 'select'=normal step , 'selectForOrderQueue'=for order queue ,
        this.isOutsource = this.data.isOutsource?this.data.isOutsource:false;

        // this.companyID = this.route.snapshot.queryParamMap.get('companyID') + '';
        // this.company = this.userService.getUserCompany1(this.companyID);

        this.getUserFactorys();
        this.getUserFactoryUpdatedListener();
    }

    getUserFactoryUpdatedListener() {
        if (this.getFactorysSub) { this.getFactorysSub.unsubscribe(); }
        this.getFactorysSub = this.userService.getUserFactoryUpdatedListener().subscribe((data) => {
            // this.factories = data.factory.filter(i=>i.fInfo.isOutsource == this.isOutsource);
            this.factories = data.factory;
            // console.log(this.factories);
            if (this.id === 'factorySelection-outsource') {
                this.factories = data.factory.filter(i=>(i.fInfo.isOutsource === this.isOutsource));
            } else if (this.id === 'fin-set-cost-style-subnode') {
                this.factories = data.factory.filter(i=>(i.fInfo.isOutsource === false));
            } else if (this.id === 'factorySelection-main') {
                const factories = this.userService.getFactories();
                this.factories = factories.filter(i=>(i.fInfo.isOutsource === false));
            } else if (this.id === 'yarn-change-sendto') {
                const factories = this.userService.getFactories();
                this.factories = factories.filter(i=>(i.fInfo.isOutsource === false));
            }
            // factorySelection-main
            // fin-set-cost-style-subnode
            // yarn-change-sendto
            // const BundleGroupColorScanF = this.bundleGroupColorScan.filter(i=>(i.bundleNo === bundleNo));
        });
    }

    getUserFactorys() {
        if (this.id !== 'factorySelection-outsource') {
            this.userService.getUserFactory('', this.userService.getUserID(), this.companyID, this.page, this.limit);
        } else if (this.id === 'factorySelection-outsource') {
            this.userService.getGNFactoriesByCompanyID(this.companyID);
        }
    }

    setSelectFactoryDialogSelect(factory: Factory) {
        this.userService.setSelectFactoryDialogSelect(factory);
    }

    closeDialog(factory: Factory) {
        const factoryList = ['factorySelection'];
        if (factoryList.includes(this.data.id)) {
            this.setSelectFactoryDialogSelect(factory);
        }
        this.ref.close(factory);
    }

    // setFactory(factory: Factory) {
    //     if (this.mode==='select') {
    //         this.userService.setFactory(factory);
    //         this.goto('/user/ufactory/dashboard');
    //     } else if (this.mode==='selectForOrderQueue') {

    //     }
    // }

    // getUserfactoryState(factoryID: string) {
    //     const state = this.userService.getUserfactoryState(this.user.uFactory, factoryID);
    //     return state;
    // }

    // save(data: any) {
    //     console.log('save');
    //     console.log(data);
    // }



    // goto(path: string) {
    //     const factoryID = 'factory test id';
    //     const params: NavigationExtras = {
    //         queryParams: { factoryID: factoryID },
    //     };
    //     this.router.navigate([path], params);
    // }

    genImagePath(imgPath: string) {
        if (imgPath) {
            if (imgPath.length > 0) {
                return this.companyFactoryImageProfileGCSPath + imgPath;
            }
        }

        return GBC.nulltGCSPath;
    }

    ngOnDestroy(): void {
        if (this.getFactorysSub) { this.getFactorysSub.unsubscribe(); }
    }
}
