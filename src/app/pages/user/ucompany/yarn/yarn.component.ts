import { Component, OnDestroy, OnInit } from '@angular/core';
import { Company } from 'src/app/models/app.model';
import { Location } from '@angular/common';
import { User } from 'src/app/models/user.model';
import { UserService } from 'src/app/services/user.service';
import { Subscription } from 'rxjs';
import { Yarn, YarnSeason } from 'src/app/models/yarn.model';
import { YarnService } from 'src/app/services/yarn.service';
import { NavigationExtras, Router } from '@angular/router';
import { GBC } from 'src/app/global/const-global';
import { ProductService } from 'src/app/services/product.service';

@Component({
    selector: 'app-yarn',
    templateUrl: './yarn.component.html',
    styleUrls: ['./yarn.component.scss'],
})
export class YarnComponent implements OnInit, OnDestroy {
    formActive = 'yarn';
    formName = this.formActive;
    isAuthenticated = false;  // ## logged in ?

    company: Company = GBC.clrCompany();
    user: User = GBC.clrUser();

    yarns: Yarn[] = [];
    yarnsCount = 0;

    yarnSeason = '';
    yarnSeasons: YarnSeason[] = [];

    private dataAroundAppSub: Subscription = new Subscription();
    private yarnsListSub: Subscription = new Subscription();


    constructor(
        private router: Router,
        private location: Location,
        public userService: UserService,
        public prodService: ProductService,
        public yarnService: YarnService,
    ) {}

    ngOnInit(): void {
        this.location.replaceState('/'); // ## hide loocation
        this.userService.setFormActive(this.formActive);
        this.company = this.userService.getCompany();
        this.user = this.userService.getUser();

        // ## get DataAroundApp
        // ## user auth  isAuthenticated / dataAroundApp
        this.isAuthenticated = this.userService.getIsAuth();
        this.dataAroundAppSub = this.userService
            .getDataAroundAppStatusListener()
            .subscribe((dataAroundApp) => {
                // ## declare initial variable from service user
                this.isAuthenticated = dataAroundApp.isAuthenticated;

                this.yarnSeason = dataAroundApp.yarnSeason;

                // console.log('screenSizeInfo : ' , this.screenSize);
                // console.log('isAuthenticated : ' , this.isAuthenticated);
                if (this.isAuthenticated) {
                    // ## user logged in already
                } else {
                    // ## user no login
                }
            });

        this.postGetProductImageProfiles();
        this.getYarnsList();
        // this.postGetProductImageProfiles();
    }

    // postGetProductImageProfiles() {
    //     // postGetProductImageProfiles(companyID: string, productIDs: string[])
    //     const orderIDs = this.userService.getOrderIDss();
    //     this.prodService.postGetProductImageProfiles(this.company.companyID, orderIDs);
    // }

    postGetProductImageProfiles() {
        // postGetProductImageProfiles(companyID: string, productIDs: string[])
        const orderIDs = this.userService.getOrderIDss();
        this.prodService.postGetProductImageProfiles(this.company.companyID, orderIDs);
    }

    getYarnsList() {
        // getYarnsList(companyID: string)
        this.yarnService.getYarnsList(this.company.companyID, this.yarnSeason);
        if (this.yarnsListSub) { this.yarnsListSub.unsubscribe(); }
        this.yarnsListSub = this.yarnService.getYarnsListUpdatedListener().subscribe((data) => {
            // console.log(data);
            this.yarns = data.yarns;
            this.yarnsCount = data.yarnsCount;

        });
    }

    goto(path: string, yarn: Yarn) {
        // console.log(yarn, path);
        this.yarnService.setYarn(yarn);  // ## set order selected
        const mode = 'goto';
        // this.checkGetCustomerID(customerID, mode);
        // this.checkGetProductID(productID, mode)
        const yarnID = yarn.yarnID;
        const params: NavigationExtras = {
            queryParams: { yarnID: yarnID, yarnMode: 'edit-yarn' },
        };
        this.router.navigate([path], params);
    }

    ngOnDestroy(): void {
        if (this.dataAroundAppSub) { this.dataAroundAppSub.unsubscribe(); }
        if (this.yarnsListSub) { this.yarnsListSub.unsubscribe(); }

    }
}
