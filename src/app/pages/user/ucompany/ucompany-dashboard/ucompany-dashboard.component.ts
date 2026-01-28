import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { MegaMenuItem, MenuItem } from 'primeng/api';
import { Subscription } from 'rxjs';
import { GBC } from 'src/app/global/const-global';

import { Company, Factory } from 'src/app/models/app.model';

import { UserService } from 'src/app/services/user.service';
import { DialogService } from 'primeng/dynamicdialog';
import { SmdOrderSeasonyearComponent } from 'src/app/shared/components/order/smd-order-seasonyear/smd-order-seasonyear.component';
import { User } from 'src/app/models/user.model';

@Component({
    selector: 'app-ucompany-dashboard',
    templateUrl: './ucompany-dashboard.component.html',
    styleUrls: ['./ucompany-dashboard.component.scss'],
    providers: [DialogService],
})
export class UcompanyDashboardComponent implements OnInit, OnDestroy {
    @Input() callFrom: string = '';  // ##  rep-exclusive-user

    formActive = 'companyDashboardMenu';
    // ## overall = first rep page
    repActive = 'overall';

    companies: Company[] = [];
    factoris: Factory[] = [];
    factory: Factory = GBC.clrFactory();
    factoryCurrent: Factory = GBC.clrFactory();
    factoryIDArr: string[] = [];
    factorySelect = '';

    megaMenuItems: MegaMenuItem[] = [];

    langSelected: string = 'en';
    isAdmin: boolean = false;
    user: User = GBC.clrUser();
    userID: string = '';

    factorySelect1: Factory = GBC.clrFactory();
    nodeIDSelect = '7.QC';
    option: any = {};

    private dataAroundAppSub: Subscription = new Subscription;
    // private langSub: Subscription = new Subscription;
    private langsListSub: Subscription = new Subscription;


    constructor(
        private location: Location,
        public dialogService: DialogService,

        public userService: UserService,
    ) {}

    ngOnInit(): void {
        this.location.replaceState('/'); // ## hide loocation
        // this.formActive = this.formActive;

        this.megaMenuItems = this.userService.getFormActiveMenu(this.formActive, 'app-ucompany-dashboard 1'); // get menu of form active
        this.companies = this.userService.getCompanies();
        this.factoris = this.userService.getFactories();
        this.factoryCurrent = this.userService.getFactory();

        this.megaMenuItems[1].label = 'All Factory';
        this.factorySelect = 'All Factory';
        this.genMenu();

        this.megaMenuItems[0].label = '';
        this.dataAroundAppSub = this.userService.getDataAroundAppStatusListener().subscribe(dataAroundApp => {
            // ## declare initial variable from service user
            // this.formActive = dataAroundApp.formActive;
            this.megaMenuItems = this.userService.getFormActiveMenu(this.formActive, 'app-ucompany-dashboard 2');
            this.megaMenuItems[0].label = '';
            this.genMenu();
        });

        this.isAdmin = this.userService.isAdmin();
        // console.log(this.isAdmin);
        this.user = this.userService.getUser();
        this.userID = this.user.userID;
        // console.log(this.user);
        this.genMenu();

        this.getLangsListUpdatedListener();

        // // ## get current lang and set app language
        // this.langSub = this.userService.getLang.subscribe(langu => {
        //     // console.log(langu);
        //     if (langu) {
        //         this.setLang(langu);
        //         this.megaMenuItems = this.userService.getFormActiveMenu(this.formActive);
        //         this.megaMenuItems[0].label = '';
        //         this.genMenu();
        //     }
        // });

    }

    getLangsListUpdatedListener() {
        if (this.langsListSub) { this.langsListSub.unsubscribe(); }
        this.langsListSub = this.userService.getLangsListUpdatedListener().subscribe((data) => {
            this.megaMenuItems = this.userService.getFormActiveMenu(this.formActive, 'app-ucompany-dashboard 3');
            this.megaMenuItems[0].label = '';
            this.genMenu();
        });
    }

    setLang(lang: string) {
        // console.log('SetLang = ' ,lang);
        this.langSelected = lang;
        // this.translate.use(lang);
        // this.setLangList(lang);

        if (this.userService.langData.languageID) {
            if (this.userService.langData.languageID !== lang) {
                this.userService.getLangData(lang);
            }
        }
    }

    getMenuVisible(menuID: string, state: string): boolean {
        // getMenuAutor(userID: string, menuID: string, state: string)
        if (this.isAdmin) { return true;}
        const visible = this.userService.getMenuAutor(this.userID, menuID, state);
        return visible;
    }

    genMenu() {
        // this.reportHeader = this.userService.translateCode('hd', 'hd-fac-production');
        // console.log(this.companies);
        // console.log(this.factoris);
        this.megaMenuItems = this.userService.getFormActiveMenu(this.formActive, 'app-s-rep-workload-overall 1'); // get menu of form active
        this.megaMenuItems[0].label = '';
        this.megaMenuItems[0].visible = false;
        if (this.factory.factoryID !== '') {
            this.megaMenuItems[1].label = this.factory.fInfo.factoryName;
        } else {
            this.megaMenuItems[1].label = this.userService.translateCode('hd', 'hd-all-fac');
        }
        this.factoryIDArr = [];
        let factoryIDArrAll: string[] = [];


        let items: MenuItem[] = [];
        this.factoris.forEach((item, index) => {
            factoryIDArrAll.push(this.factory.factoryID);
        });
        items.push({
            label: 'All Factory',
            visible: true,
            command: () => {
                this.factory = GBC.clrFactory();
                this.megaMenuItems[1].label = this.userService.translateCode('hd', 'hd-all-fac');
                this.factoryIDArr = factoryIDArrAll;
                this.factorySelect = 'All Factory';
                this.repActive = 'overall';
                // console.log(this.factorySelect);
                this.genMenu();
            }
        });
        this.factoris.forEach((item, index) => {
            items.push({
                label: item.fInfo.factoryName,
                visible: true,
                command: () => {
                    this.factory = item;
                    this.userService.setSelectFactory(this.factory);
                    this.megaMenuItems[1].label = item.fInfo.factoryName;
                    this.factoryIDArr = [item.factoryID];
                    this.factorySelect = item.fInfo.factoryName;
                    this.repActive = 'fac';
                    // console.log(this.factorySelect);
                    this.genMenu();
                }
            });
        });

        const factorySelection = [
            {
                label: this.userService.translateCode('hd', 'hd-fac-selection'),
                items: items
            },
        ];
        this.megaMenuItems[0].items?.push(factorySelection);

        // ## report menu
        this.megaMenuItems[2] = {
            label: this.userService.seasonYear,
            styleClass: 'text-lg font-bold',
            command: () => { this.showSeasonYearsList(); }
        };

        // ## report menu
        this.megaMenuItems[3] = {
            label: this.userService.translateCode('hd', 'hd-report-all'),
            icon: 'pi pi-fw pi-desktop',
            visible: this.factorySelect === 'All Factory',
            // visible: false,
            items: [
                [
                    {
                        label: this.userService.translateCode('nu', 'nu-overall'),
                        // visible: false,
                        visible: this.userService.getAuthMenu(this.userService.companyState, 'overall'),
                        items: [
                            {
                                label: '1. overview',
                                visible: this.userService.getAuthMenu(this.userService.companyState, 'overview'),
                                command: () => { this.selectMenu('overview',{}); }
                            },

                            {
                                label: '2. '+this.userService.translateCode('mn', 'mn-order'),
                                visible: this.userService.getAuthMenu(this.userService.companyState, 'order'),
                                command: () => { this.selectMenu('overall',{}); }
                            },

                            {
                                label: '3. scan overview',
                                visible: this.userService.getAuthMenu(this.userService.companyState, 'scan-overview'),
                                command: () => { this.selectMenu('scan-overview',{}); }
                            },

                            {
                                label: '4. '+this.userService.translateCode('nu', 'nu-production'),
                                // visible: this.userService.getAuthMenu(this.userService.companyState, 'production'),
                                visible: false,
                                command: () => { this.selectMenu('production-all',{}); }
                            }
                        ]
                    },

                    {
                        // label: this.userService.translateCode('mn', 'mn-factory'),
                        label: this.isAdmin?this.userService.translateCode('mn', 'mn-factory'):'',
                        // visible: this.user.uInfo.addr === this.userService.adminADDR,
                        // visible: false,
                        // visible: this.userService.getAuthMenu(this.userService.companyState, 'factory'),
                        items: [
                            {
                                label: 'xx. '+this.userService.translateCode('hd', 'hd-fac-production'),
                                visible: this.isAdmin,
                                // visible: false,
                                // visible: this.userService.getAuthMenu(this.userService.companyState, 'factory-production'),
                                command: () => { this.selectMenu('overall-fac',{}); }
                            },

                            // {
                            //     label: 'production scan',
                            //     // label: this.userService.translateCode('hd', 'hd-fac-production'),
                            //     // visible: false,
                            //     visible: this.userService.getAuthMenu(this.userService.companyState, 'factory-production-scan'),
                            //     command: () => { this.selectMenu('factory-production-scan',{}); }
                            // },

                            // { label: 'work in process by period', command: () => { this.selectMenu('rep-fac-process-period');}}
                            // { label: 'Camcorder Item' },
                            // { label: 'Camcorder Item' }
                        ]
                    },




                    // {
                    //     label: 'Outsource',
                    //     items: [
                    //         { label: 'Overall', command: () => { this.selectMenu('overall-outsource',{}); } },
                    //         { label: 'Production', command: () => { this.selectMenu('production-outsource',{}); } },
                    //         { label: 'Production detail', command: () => { this.selectMenu('production-detail-outsource',{}); } },
                    //         // { label: 'work in process by period', command: () => { this.selectMenu('rep-fac-process-period');}}
                    //         // { label: 'Camcorder Item' },
                    //         // { label: 'Camcorder Item' }
                    //     ]
                    // },

                    // {
                    //     label: 'Period',
                    //     items: [
                    //         // { label: 'Factory Production', command: () => { this.selectMenu('overall-fac'); } },
                    //         { label: 'work in process by period', command: () => { this.selectMenu('rep-fac-process-period');}}
                    //         // { label: 'Camcorder Item' },
                    //         // { label: 'Camcorder Item' }
                    //     ]
                    // },
                ],

                // nu	nu-working-period-style   nu-working-period-zone

                [
                    {
                        label: this.userService.translateCode('nu', 'nu-processing-period'),
                        visible: this.userService.getAuthMenu(this.userService.companyState, 'Processing-Period'),
                        items: [
                            // { label: 'Factory Production', command: () => { this.selectMenu('overall-fac'); } },
                            {
                                label: 'xx. '+this.userService.translateCode('nu', 'nu-working-period-style'),
                                // visible: this.userService.getAuthMenu(this.userService.companyState, 'work-in-process-by-period[style]'),
                                visible: false,
                                command: () => { this.selectMenu('rep-fac-process-period',{});}
                            },
                            {
                                label: '11. '+this.userService.translateCode('nu', 'nu-working-period-zone'),
                                visible: this.userService.getAuthMenu(this.userService.companyState, 'work-in-process-by-period[zone]'),
                                command: () => { this.selectMenu('rep-fac-process-period-zone',{});}
                            }
                        ]
                    },
                    {
                        label: '% ' + this.userService.translateCode('nu', 'nu-processing-period'),
                        visible: this.userService.getAuthMenu(this.userService.companyState, '%Processing-Period'),
                        items: [
                            {
                                label: 'xx. '+ this.userService.translateCode('nu', 'nu-working-period-style'),
                                // visible: this.userService.getAuthMenu(this.userService.companyState, '%work-in-process-by-period[style]'),
                                visible: false,
                                command: () => { this.selectMenu('rep-fac-process-period-percent',{});}
                            },
                            {
                                label: '12. '+ this.userService.translateCode('nu', 'nu-working-period-zone'),
                                visible: this.userService.getAuthMenu(this.userService.companyState, '%work-in-process-by-period[zone]'),
                                command: () => { this.selectMenu('rep-fac-process-period-zone-percent',{});}
                            }
                        ]
                    },

                    // getMenuAutor(userID: string, menuID: string, state: string)
                    {
                        label: this.getMenuVisible('rep-head-white', 'normal')?'WHITE Corner':'',
                        items: [

                            {
                                label: '111. '+'Production period (QTY plan adjust)',
                                visible: this.isAdmin || this.userService.getMenuAutor(this.userID, 'rep-plan-adjust', 'normal'),
                                command: () => { this.selectMenu('rep-fac-production-period-qty-plan-adjust',{});}
                            },
                            {
                                label: '119. '+'QC --> Complete edit',
                                visible: this.isAdmin || this.userService.getMenuAutor(this.userID, 'scan-qctocomplete', 'normal'),
                                command: () => { this.selectMenu('scan-qctocomplete',{state: 'scan-qctocomplete'});}
                            },
                        ]
                    },
                    {
                        label: this.getMenuVisible('rep-head-dark', 'normal')?'DARK Trick Corner':'',
                        items: [

                            {
                                label: '113. '+'Production period (edit QTY)',
                                visible: this.isAdmin || this.userService.getMenuAutor(this.userID, 'rep-edit-qty', 'normal'),
                                command: () => { this.selectMenu('rep-fac-production-period-edit-qty',{});}
                            },
                        ]
                    },

                ],

                [
                    // ## for create report to customer
                    // ## not show forloss qty
                    {
                        label: 'Production period',
                        // visible: true,
                        visible: this.userService.getAuthMenu(this.userService.companyState, 'rep-fac-production-period'),
                        items: [
                            {
                                label: '21. '+'Production period',
                                visible: true,
                                command: () => { this.selectMenu('rep-fac-production-period',{});}
                            },

                        ],
                    },
                    {
                        label: 'Factory Scan report',
                        visible: this.userService.getAuthMenu(this.userService.companyState, 'rep-fac-production-period'),
                        items: [
                            {
                                label: '22. '+'Factory Scan Production Period',
                                visible: true,
                                command: () => { this.selectMenu('rep-fac-scan-production-period',{});}
                            },
                        ],
                    },
                    {
                        label: this.isAdmin?'Bundle state report':'',
                        // visible: false,
                        // visible: this.user.uInfo.addr === this.userService.adminADDR,
                        // visible: this.userService.getAuthMenu(this.userService.companyState, 'rep-fac-production-period'),
                        items: [
                            {
                                label: 'xx. '+'Factory User Scan',
                                visible: this.isAdmin,
                                command: () => { this.selectMenu('rep-fac-scan-bundle-state',{});}
                            },
                            {
                                label: 'xx. '+'Style',
                                visible: this.isAdmin,
                                command: () => { this.selectMenu('rep-fac-scan-bundle-state-style',{});}
                            },
                            {
                                label: 'xx. '+'Style [set group]',
                                visible: this.isAdmin,
                                command: () => { this.selectMenu('rep-fac-scan-bundle-state-style-setgroup',{});}
                            },
                        ],
                    },
                ],

                [
                    {
                        label: this.userService.translateCode('nu', 'nu-outsource'),
                        visible: this.userService.getAuthMenu(this.userService.companyState, 'Outsource'),
                        items: [
                            {
                                label: '31. '+this.userService.translateCode('nu', 'nu-overall'),
                                visible: this.userService.getAuthMenu(this.userService.companyState, 'Outsource-overall'),
                                command: () => { this.selectMenu('overall-outsource',{}); }
                            },
                            // { label: 'Production', command: () => { this.selectMenu('production-outsource-current',{}); } },
                            // { label: 'Production detail', command: () => { this.selectMenu('production-detail-outsource-current',{}); } },
                            // { label: 'work in process by period', command: () => { this.selectMenu('rep-fac-process-period');}}
                            // { label: 'Camcorder Item' },
                            // { label: 'Camcorder Item' }
                        ]
                    },
                    {
                        label: 'Out source report',
                        visible: this.userService.getAuthMenu(this.userService.companyState, 'Outsource'),
                        items: [
                            {
                                label: '35. send out and receive report',
                                visible: true,
                                command: () => { this.selectMenu('Outsource-state',{}); }
                            },
                            // { label: 'Production', command: () => { this.selectMenu('production-outsource-current',{}); } },
                            // { label: 'Production detail', command: () => { this.selectMenu('production-detail-outsource-current',{}); } },
                            // { label: 'work in process by period', command: () => { this.selectMenu('rep-fac-process-period');}}
                            // { label: 'Camcorder Item' },
                            // { label: 'Camcorder Item' }
                        ]
                    },

                ],
            ]
        };

        this.megaMenuItems[4] = {
            label: this.userService.translateCode('nu', 'nu-report-factory'),
            icon: 'pi pi-fw pi-desktop',
            visible: this.factorySelect != 'All Factory',
            items: [
                [
                    {
                        label: this.userService.translateCode('mn', 'mn-factory'),
                        items: [
                            {
                                // hd	hd-fac-production
                                label: this.userService.translateCode('hd', 'hd-fac-production'),
                                command: () => {
                                    this.userService.setSelectFactory(this.factory);
                                    // this.megaMenuItems[1].label = item.fInfo.factoryName;
                                    this.factoryIDArr = [this.factory.factoryID];
                                    this.factorySelect = this.factory.fInfo.factoryName;
                                    this.repActive = 'fac';
                                }
                            },
                            {
                                label: this.userService.translateCode('nu', 'nu-node-station-production'),
                                command: () => {
                                    this.userService.setSelectFactory(this.factory);
                                    // this.megaMenuItems[1].label = item.fInfo.factoryName;
                                    this.factoryIDArr = [this.factory.factoryID];
                                    this.factorySelect = this.factory.fInfo.factoryName;
                                    this.repActive = 'node-station-production-info';
                                }
                            },

                            {
                                label: 'production scan',
                                // label: this.userService.translateCode('hd', 'hd-fac-production'),
                                // visible: false,
                                visible: this.userService.getAuthMenu(this.userService.companyState, 'factory-production-scan'),
                                command: () => { this.selectMenu('factory-production-scan',{}); }
                            },

                            // {
                            //     label: 'Queued Production',
                            //     command: () => {
                            //         this.userService.setSelectFactory(this.factory);
                            //         // this.megaMenuItems[1].label = item.fInfo.factoryName;
                            //         this.factoryIDArr = [this.factory.factoryID];
                            //         this.factorySelect = this.factory.fInfo.factoryName;
                            //         this.repActive = 'fac-queued-production';
                            //     }
                            // }
                        ]
                    },
                ],
            ]
        };

        // // ## false = need to hide sub head menu 'factory'
        // if (!this.userService.getAuthMenu(this.userService.companyState, 'factory')) {
        //     // ## this.megaMenuItems[2].items[0][1]
        //     // ((this.megaMenuItems[2].items) as MenuItem[][])[0][1] = {};
        //     ((this.megaMenuItems[2].items) as MenuItem[][])[0].splice(1, 1);  // ## delete 1 element by index
        // }

        // ## false = need to hide sub head menu 'Processing-Period'
        if (!this.userService.getAuthMenu(this.userService.companyState, 'Processing-Period')) {
            // ## this.megaMenuItems[2].items[1][0]
            // ((this.megaMenuItems[2].items) as MenuItem[][])[1][0] = undefined;
            ((this.megaMenuItems[3].items) as MenuItem[][])[1].shift();  // ## delete 1 @ first element
        }

        // // ## false = need to hide sub head menu 'production period'
        // if (!this.userService.getAuthMenu(this.userService.companyState, '')) {
        //     // ## this.megaMenuItems[2].items[2][0]
        //     // ((this.megaMenuItems[2].items) as MenuItem[][])[2][0] = {};
        //     ((this.megaMenuItems[3].items) as MenuItem[][])[2].splice(0, 1);  // ## delete 1 element by index
        // }
    }

    selectMenu(menu: string, option: any) {
        this.repActive = menu;
        this.option = option;
        if (this.repActive === 'scan-qctocomplete') {
            this.factorySelect1 = this.userService.getFactory();
        }
    }

    showSeasonYearsList() {
        const ref = this.dialogService.open(SmdOrderSeasonyearComponent, {
            data: {
                id: 'productsSelection',
                company: this.userService?.getCompany(),
                callfrom: this.formActive,  // ## send to nodejs for choose buckets
                btnCaption: 'choose'

            },
            header: 'Season year Selection',
            width: '80%',
        });

        ref.onClose.subscribe((data: any) => {
            // if (product) {
            //     this.product = product;
            //     // this.style = this.product.productCustomerCode.toUpperCase();
            //     this.style = this.order.orderID;
            //     this.style = this.userService.setAddBackStrLen(this.style, this.userService.styleLen, ' ');
            //     this.userService.setOrderProductSelect(product)
            // }

        });

    }

    ngOnDestroy(): void {
        // if (this.langSub) { this.langSub.unsubscribe(); }
        if (this.langsListSub) { this.langsListSub.unsubscribe(); }
        if (this.dataAroundAppSub) { this.dataAroundAppSub.unsubscribe(); }

        // if (this.langSub) { this.langSub.unsubscribe(); }
        // if (this.dataAroundAppSub) { this.dataAroundAppSub.unsubscribe(); }
    }
}
