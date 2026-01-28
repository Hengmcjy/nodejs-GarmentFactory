import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { Location } from '@angular/common';
import { MessageService } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
// import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';

import { FactoryNewComponent } from 'src/app/shared/components/user/factory-new/factory-new.component';
import { CompanyJoinComponent } from 'src/app/shared/components/user/company-join/company-join.component';

import { UserService } from 'src/app/services/user.service';
import { Company, Factory } from 'src/app/models/app.model';
import { User } from 'src/app/models/user.model';
import { GBC } from 'src/app/global/const-global';
import { OrderService } from 'src/app/services/order.service';
import { NodeStationService } from 'src/app/services/node-station.service';
import { CustomerService } from 'src/app/services/customer.service';


@Component({
    selector: 'app-ufactory',
    templateUrl: './ufactory.component.html',
    styleUrls: ['./ufactory.component.scss'],
    providers: [DialogService, MessageService],
})
export class UfactoryComponent implements OnInit, OnDestroy {
    formActive = 'ufactory';
    companyFactoryImageProfileGCSPath = GBC.companyFactoryImageProfileGCSPath;  // ## google storage path company image profile

    page = 1;
    limit = 0;
    user: User = GBC.clrUser();
    factories: Factory[] = [];
    company: Company = GBC.clrCompany();
    factory: Factory = GBC.clrFactory();
    companyID: string = '';

    showOutsource = true;

    showBtnEnter = false;
    isAdmin = '';

    // menuItems: MenuItem[] = [];

    private getUserFactorySub: Subscription = new Subscription();
    private getOrdersSub: Subscription = new Subscription();
    private getNodeStationsListSub: Subscription = new Subscription();


    constructor(
        public dialogService: DialogService,
        public messageService: MessageService,
        // public translate: TranslateService,
        private location: Location,
        private route: ActivatedRoute,
        private router: Router,
        public userService: UserService,
        public cusService: CustomerService,
        private orderService: OrderService,
        public nsService: NodeStationService,
    ) {}

    async ngOnInit() {
        // console.log('ufactory');
        this.location.replaceState('/'); // ## hide loocation
        this.userService.setFormActive(this.formActive);
        this.limit = this.userService.factoryPageLimit;
        this.user = this.userService.getUser();
        this.companyID = this.userService.getCompany().companyID;
        this.company = this.userService.getUserCompany1(this.companyID);
        this.userService.setFactory(this.factory);
        this.isAdmin = this.user.uInfo.addr;

        this.orderService.getOrders(this.company.companyID, 1, 200, this.orderService.seasonYear);
        if (this.getOrdersSub) { this.getOrdersSub.unsubscribe(); }
        this.getOrdersSub = this.orderService.getCustomersUpdatedListener().subscribe((data) => {
            // this.factories = data.factory;
            // this.user = this.userService.getUser();
            // console.log(this.factories);
            this.showBtnEnter = true;
        });
        // console.log(this.companyID);
        // console.log(this.company);
        // console.log(this.user);
        // this.factories = await this.userService.getUserfactoryAll(this.user.uFactory);
        // console.log(this.factories);


        // getCustomers(companyID: string, page: number, limit: number)

        // ## get data about company  // ## * = select all for userGroupScan
        this.userService.getCompanyInfo(this.companyID, '*');

        this.cusService.getCustomers(this.companyID, 1, 100);
        this.getUserFactorys();
        this.getUserFactoryUpdatedListener();
    }

    getUserFactoryUpdatedListener() {
        if (this.getUserFactorySub) { this.getUserFactorySub.unsubscribe(); }
        this.getUserFactorySub = this.userService.getUserFactoryUpdatedListener().subscribe((data) => {
            // console.log(data);
            // console.log(this.isAdmin);
            // const orderF = this.orders.filter(fi => fi.orderID === orderID.trim());
            if (this.showOutsource) {
                // console.log(this.isAdmin);
                this.factories = data.factory;
            } else {
                // console.log('noooooooooo',this.isAdmin);
                // this.factories = data.factory;
                this.factories = data.factory.filter(fi => fi.fInfo.isOutsource === false);

            }
            this.user = this.userService.getUser();
            // console.log(this.factories);
        });
        // console.log(this.factories);
    }

    getUserFactorys() {
        // console.log(this.company);
        this.userService.getUserFactory('', this.userService.getUserID(), this.companyID, this.page, this.limit);
    }

    getNodeStationsList(factory: Factory, mode: string) {
        // ## get nodestations
        const status = ['a', 'c'];
        this.nsService.getNodeStationsList(this.companyID, factory.factoryID, status, 1, 100);
        if (this.getNodeStationsListSub) { this.getNodeStationsListSub.unsubscribe(); }
        this.getNodeStationsListSub = this.nsService.getNodeStationsUpdatedListener().subscribe((data) => {
            this.userService.nodeStations = data.nodeStations;
            this.nsService.nodeStations = data.nodeStations;
            if (mode==='enter') {
                this.goto('/user/ufactory/dashboard');
            }
        });

        // // getNodeStationsUpdatedListener()
        // this.nodeStationsListsUpdated
    }

    setFactory(factory: Factory, mode: string) {
        // console.log("mode = " , mode);
        this.userService.factoryDialogSelected = factory;
        this.userService.setFactory(factory);
        this.getNodeStationsList(factory, mode);
    }

    getUserfactoryState(factoryID: string) {
        // const state = this.userService.getUserfactoryState(this.user.uFactory, factoryID);
        // return state;
        return '';
    }

    save(data: any) {
        // console.log('save');
        // console.log(data);
    }

    // showJoinFactoryModal
    showJoinFactoryModal() {
        const ref = this.dialogService.open(CompanyJoinComponent, {
            data: {
                id: '51gF3',
            },
            header: 'Join Factory',
            width: '50%',
        });

        ref.onClose.subscribe((data: any) => {
            // console.log(data);
            // if (car) {
            //     this.messageService.add({severity:'info', summary: 'Car Selected', detail:'Vin:' + car.vin});
            // }
        });
    }

    showCreateFactoryModal() {
        const ref = this.dialogService.open(FactoryNewComponent, {
            data: {
                companyID: this.companyID,
            },
            header: 'Factory Information',
            width: '70%',
        });

        ref.onClose.subscribe((data: any) => {
            // console.log(data);
            // if (car) {
            //     this.messageService.add({severity:'info', summary: 'Car Selected', detail:'Vin:' + car.vin});
            // }
        });
    }

    goto(path: string) {
        const factoryID = 'factory test id';
        const params: NavigationExtras = {
            queryParams: { factoryID: factoryID },
        };
        this.router.navigate([path], params);
    }

    genImagePath(imgPath: string) {
        if (imgPath) {
            if (imgPath.length > 0) {
                return this.companyFactoryImageProfileGCSPath + imgPath;
            }
        }

        return GBC.nulltGCSPath;
    }

    ngOnDestroy(): void {
        if (this.getUserFactorySub) { this.getUserFactorySub.unsubscribe(); }
        if (this.getOrdersSub) { this.getOrdersSub.unsubscribe(); }
        if (this.getNodeStationsListSub) { this.getOrdersSub.unsubscribe(); }

    }
}
