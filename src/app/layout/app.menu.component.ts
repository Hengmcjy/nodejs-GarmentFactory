import { OnDestroy, OnInit } from '@angular/core';
import { Component } from '@angular/core';
import { Subscription } from 'rxjs';
import { LayoutService } from './service/app.layout.service';
import { Company, Factory } from '../models/app.model';
import { UserService } from '../services/user.service';
import { GBC } from '../global/const-global';

@Component({
    selector: 'app-menu',
    templateUrl: './app.menu.component.html'
})
export class AppMenuComponent implements OnInit, OnDestroy {

    lang: string = '';
    isAuthenticated = false;  // ## logged in ?
    screenSize = '';
    menuTestvisible = false;

    company: Company = GBC.clrCompany();
    factory: Factory = GBC.clrFactory();
    companySelected = false;
    factorySelected = false;
    isAdmin: boolean = false;
    userID: string = '';

    // menuItems: MenuItem[] = [];

    private langListSub: Subscription = new Subscription;
    private langSub: Subscription = new Subscription;
    private dataAroundAppSub: Subscription = new Subscription;

    model: any[] = [];

    constructor(
        public layoutService: LayoutService,

        private userService: UserService
    ) { }

    async ngOnInit() {
        this.menuTestvisible = this.userService.menuTestvisible;
        this.company = GBC.clrCompany();
        this.factory = GBC.clrFactory();
        this.companySelected = false;
        this.company = GBC.clrCompany();
        this.isAdmin = this.userService.isAdmin();
        this.userID = this.userService.getUserID();

        // ## get DataAroundApp
        // ## user auth  isAuthenticated / dataAroundApp
        this.isAuthenticated = this.userService.getIsAuth();
        this.dataAroundAppSub = this.userService.getDataAroundAppStatusListener().subscribe(dataAroundApp => {
            // ## declare initial variable from service user
            this.isAuthenticated = dataAroundApp.isAuthenticated;
            this.screenSize = dataAroundApp.screenSize;
            this.menuTestvisible = dataAroundApp.menuTestvisible;
            this.company = dataAroundApp.company;
            this.factory = dataAroundApp.factory;
            this.isAdmin = this.userService.isAdmin();
            this.userID = this.userService.getUserID();
            // console.log('screenSizeInfo : ' , this.screenSize);
            // console.log('isAuthenticated : ' , this.isAuthenticated);
            if (this.isAuthenticated) { // ## user logged in already

            } else {  // ## user no login

            }

            // console.log('company : ' , this.company);
            // console.log('companySelected : ' , this.companySelected);
            // if (this.company.companyID !== '') { this.companySelected = true; }
            // else { this.companySelected = false; }

            if (this.factory.factoryID !== '') {
                this.companySelected = true;
                this.factorySelected = true;
            }
            else { this.factorySelected = false; }

            // ## refresh menu
            this.setMenu();
        });

        this.langListSub = this.userService.getLangsListUpdatedListener().subscribe((data) => {
            // ## refresh menu
            this.setMenu();
        });

        // ## get current lang and set app language
        this.langSub = this.userService.getLang.subscribe(langu => {
            if (langu) {
                this.setLang(langu);
                this.lang = langu;
            }
        });
        const langg = await this.userService.getLangCurrent();
        if (langg !== '' || langg != null) {
            this.setLang(langg);
            this.lang = langg;
        }
        else {
            this.setLang('en');
            this.lang = 'en';
        }

        // ## set menu
        this.setMenu();

        // this.model = [
        //     {
        //         label: 'Home',
        //         items: [
        //             { label: 'Dashboard', icon: 'pi pi-fw pi-home', routerLink: ['/'] }
        //         ]
        //     },
        //     {
        //         label: 'UI Components',
        //         items: [
        //             { label: 'Form Layout', icon: 'pi pi-fw pi-id-card', routerLink: ['/uikit/formlayout'] },
        //             { label: 'Input', icon: 'pi pi-fw pi-check-square', routerLink: ['/uikit/input'] },
        //             { label: 'Float Label', icon: 'pi pi-fw pi-bookmark', routerLink: ['/uikit/floatlabel'] },
        //             { label: 'Invalid State', icon: 'pi pi-fw pi-exclamation-circle', routerLink: ['/uikit/invalidstate'] },
        //             { label: 'Button', icon: 'pi pi-fw pi-box', routerLink: ['/uikit/button'] },
        //             { label: 'Table', icon: 'pi pi-fw pi-table', routerLink: ['/uikit/table'] },
        //             { label: 'List', icon: 'pi pi-fw pi-list', routerLink: ['/uikit/list'] },
        //             { label: 'Tree', icon: 'pi pi-fw pi-share-alt', routerLink: ['/uikit/tree'] },
        //             { label: 'Panel', icon: 'pi pi-fw pi-tablet', routerLink: ['/uikit/panel'] },
        //             { label: 'Overlay', icon: 'pi pi-fw pi-clone', routerLink: ['/uikit/overlay'] },
        //             { label: 'Media', icon: 'pi pi-fw pi-image', routerLink: ['/uikit/media'] },
        //             { label: 'Menu', icon: 'pi pi-fw pi-bars', routerLink: ['/uikit/menu'], routerLinkActiveOptions: { paths: 'subset', queryParams: 'ignored', matrixParams: 'ignored', fragment: 'ignored' } },
        //             { label: 'Message', icon: 'pi pi-fw pi-comment', routerLink: ['/uikit/message'] },
        //             { label: 'File', icon: 'pi pi-fw pi-file', routerLink: ['/uikit/file'] },
        //             { label: 'Chart', icon: 'pi pi-fw pi-chart-bar', routerLink: ['/uikit/charts'] },
        //             { label: 'Misc', icon: 'pi pi-fw pi-circle', routerLink: ['/uikit/misc'] }
        //         ]
        //     },
        //     {
        //         label: 'Prime Blocks',
        //         items: [
        //             { label: 'Free Blocks', icon: 'pi pi-fw pi-eye', routerLink: ['/blocks'], badge: 'NEW' },
        //             { label: 'All Blocks', icon: 'pi pi-fw pi-globe', url: ['https://www.primefaces.org/primeblocks-ng'], target: '_blank' },
        //         ]
        //     },
        //     {
        //         label: 'Utilities',
        //         items: [
        //             { label: 'PrimeIcons', icon: 'pi pi-fw pi-prime', routerLink: ['/utilities/icons'] },
        //             { label: 'PrimeFlex', icon: 'pi pi-fw pi-desktop', url: ['https://www.primefaces.org/primeflex/'], target: '_blank' },
        //         ]
        //     },
        //     {
        //         label: 'Pages',
        //         icon: 'pi pi-fw pi-briefcase',
        //         items: [
        //             {
        //                 label: 'Landing',
        //                 icon: 'pi pi-fw pi-globe',
        //                 routerLink: ['/landing']
        //             },
        //             {
        //                 label: 'Auth',
        //                 icon: 'pi pi-fw pi-user',
        //                 items: [
        //                     {
        //                         label: 'Login',
        //                         icon: 'pi pi-fw pi-sign-in',
        //                         routerLink: ['/auth/login']
        //                     },
        //                     {
        //                         label: 'Error',
        //                         icon: 'pi pi-fw pi-times-circle',
        //                         routerLink: ['/auth/error']
        //                     },
        //                     {
        //                         label: 'Access Denied',
        //                         icon: 'pi pi-fw pi-lock',
        //                         routerLink: ['/auth/access']
        //                     }
        //                 ]
        //             },
        //             {
        //                 label: 'Crud',
        //                 icon: 'pi pi-fw pi-pencil',
        //                 routerLink: ['/pages/crud']
        //             },
        //             {
        //                 label: 'Timeline',
        //                 icon: 'pi pi-fw pi-calendar',
        //                 routerLink: ['/pages/timeline']
        //             },
        //             {
        //                 label: 'Not Found',
        //                 icon: 'pi pi-fw pi-exclamation-circle',
        //                 routerLink: ['/notfound']
        //             },
        //             {
        //                 label: 'Empty',
        //                 icon: 'pi pi-fw pi-circle-off',
        //                 routerLink: ['/pages/empty']
        //             },
        //         ]
        //     },
        //     {
        //         label: 'Hierarchy',
        //         items: [
        //             {
        //                 label: 'Submenu 1', icon: 'pi pi-fw pi-bookmark',
        //                 items: [
        //                     {
        //                         label: 'Submenu 1.1', icon: 'pi pi-fw pi-bookmark',
        //                         items: [
        //                             { label: 'Submenu 1.1.1', icon: 'pi pi-fw pi-bookmark' },
        //                             { label: 'Submenu 1.1.2', icon: 'pi pi-fw pi-bookmark' },
        //                             { label: 'Submenu 1.1.3', icon: 'pi pi-fw pi-bookmark' },
        //                         ]
        //                     },
        //                     {
        //                         label: 'Submenu 1.2', icon: 'pi pi-fw pi-bookmark',
        //                         items: [
        //                             { label: 'Submenu 1.2.1', icon: 'pi pi-fw pi-bookmark' }
        //                         ]
        //                     },
        //                 ]
        //             },
        //             {
        //                 label: 'Submenu 2', icon: 'pi pi-fw pi-bookmark',
        //                 items: [
        //                     {
        //                         label: 'Submenu 2.1', icon: 'pi pi-fw pi-bookmark',
        //                         items: [
        //                             { label: 'Submenu 2.1.1', icon: 'pi pi-fw pi-bookmark' },
        //                             { label: 'Submenu 2.1.2', icon: 'pi pi-fw pi-bookmark' },
        //                         ]
        //                     },
        //                     {
        //                         label: 'Submenu 2.2', icon: 'pi pi-fw pi-bookmark',
        //                         items: [
        //                             { label: 'Submenu 2.2.1', icon: 'pi pi-fw pi-bookmark' },
        //                         ]
        //                     },
        //                 ]
        //             }
        //         ]
        //     },
        //     {
        //         label: 'Get Started',
        //         items: [
        //             {
        //                 label: 'Documentation', icon: 'pi pi-fw pi-question', routerLink: ['/documentation']
        //             },
        //             {
        //                 label: 'View Source', icon: 'pi pi-fw pi-search', url: ['https://github.com/primefaces/sakai-ng'], target: '_blank'
        //             }
        //         ]
        //     }
        // ];
    }

    translateCode(lType: string, lID: string) {
        const languageDataText = this.userService.translateCode(lType, lID);
        // console.log('languageDataText : ' , languageDataText);
        return languageDataText;
    }

    setMenu() {
        // console.log('aaaaa', this.companySelected, this.factorySelected);
        this.model = [
            {
                label: this.translateCode('mn', 'mn-mainSystem'),
                visible: this.userService.getAuthMenu('normal', 'company-sideBar'),
                // label: 'uCompany', visible: false,
                items: [
                    {
                        label: this.translateCode('mn', 'mn-company'),
                        icon: 'pi pi-fw pi-home', routerLink: ['/user/ucompany'],

                        command: () => {
                            // console.log('mn-company1');
                            this.company = GBC.clrCompany();
                            this.factory = GBC.clrFactory();
                            this.companySelected = false;
                            this.factorySelected = false;
                            // console.log('mn-company2', this.companySelected, this.factorySelected);
                        }
                    },
                    {
                        label: this.translateCode('mn', 'mn-factory'),
                        icon: 'pi pi-fw pi-building', routerLink: ['/user/ufactory'], visible: this.companySelected,
                        command: () => {
                            // console.log('mn-factory1');
                            this.factory = GBC.clrFactory();
                            this.companySelected = false;
                            this.factorySelected = false;
                            // console.log('mn-factory2', this.companySelected, this.factorySelected);
                        }
                    },
                    {
                        label: this.translateCode('mn', 'mn-product'),
                        icon: 'pi pi-fw pi-prime', routerLink: ['/user/ucompany/product'], visible: this.factorySelected
                    },
                    {
                        label: this.translateCode('mn', 'mn-order'),
                        icon: 'pi pi-fw pi-book', routerLink: ['/user/ucompany/order'], visible: this.factorySelected
                    },
                    {
                        label: this.translateCode('mn', 'mn-yarn'),
                        icon: 'pi pi-fw pi-paperclip', routerLink: ['/user/ucompany/yarn'], visible: this.factorySelected
                    },
                    {
                        label: this.translateCode('mn', 'mn-delivery'), // ## delivery product
                        icon: 'pi pi-fw pi-truck', routerLink: ['/user/ucompany/transport'],
                        visible: this.factorySelected,
                        // visible:
                        //     (this.isAdmin && this.factorySelected)
                        //     || (this.factorySelected && this.userService.getMenuAutor(this.userID, 'au-mu-transport', 'normal'))
                    },
                    // { label: 'uFactory', icon: 'pi pi-fw pi-home', routerLink: ['/user/ufactory'] }
                    {
                        label: this.translateCode('mn', 'mn-financial'), // ## financial
                        icon: 'pi pi-fw pi-money-bill', routerLink: ['/user/ucompany/financial'],
                        visible:
                            (this.isAdmin && this.factorySelected)
                            || (this.factorySelected && this.userService.getMenuAutor(this.userID, 'au-mu-financial', 'normal'))
                    },

                    // visible: this.isAdmin || this.userService.getMenuAutor(this.userID, 'rep-plan-adjust', 'normal'),


                    {
                        label: this.translateCode('mn', 'mn-hr'), // ## hr human resource
                        icon: 'pi pi-fw pi-users', routerLink: ['/user/ucompany/hr'], visible: this.factorySelected
                    },
                ]
            },
            {
                label: this.translateCode('mn', 'mn-factory'),
                visible: this.factorySelected && this.userService.getAuthMenu('normal', 'factory-sideBar'),
                items: [
                    {
                        label: this.translateCode('mn', 'mn-com-dash'),
                        icon: 'pi pi-fw pi-home', routerLink: ['/user/ucompany/dashboard']
                    },
                    {
                        label: this.translateCode('mn', 'mn-fac-dash'),
                        icon: 'pi pi-fw pi-home', routerLink: ['/user/ufactory/dashboard']
                    },
                    {   label: this.translateCode('mn', 'mn-product-log'),
                        icon: 'pi pi-fw pi-pencil', routerLink: ['/user/ucompany/order/qrcode/manage']
                    },

                    // { label: 'Node Station', icon: 'pi pi-fw pi-sign-in', routerLink: ['/user/ufactory/station'] },

                    // { label: 'Product', icon: 'pi pi-fw pi-user',
                    //     items: [
                    //         { label: 'Product', icon: 'pi pi-fw pi-sign-in', routerLink: ['/user/ufactory/product'] },
                    //         { label: 'Create Product', icon: 'pi pi-fw pi-times-circle', routerLink: ['/user/ufactory/product/create'] },
                    //     ]
                    // },

                    // { label: 'Order', icon: 'pi pi-fw pi-user',
                    //     items: [
                    //         { label: 'order', icon: 'pi pi-fw pi-sign-in', routerLink: ['/user/ufactory/order'] },
                    //         { label: 'Create Order', icon: 'pi pi-fw pi-times-circle', routerLink: ['/user/ufactory/order/create'] },
                    //     ]
                    // },

                ]
            },
            {
                // label: '',
                label: this.translateCode('mn', 'mn-auth'),
                items: [
                    {
                        label: this.translateCode('mn', 'mn-report'),
                        visible: this.userService.getAuthMenu(this.userService.companyState, 'report-sideBar'),
                        icon: 'pi pi-fw pi-chart-bar',
                        routerLink: ['/user/ucompany/rep/exclusive']
                        // command: () => {  }
                    },
                    {
                        label: 'order',
                        visible: this.userService.getAuthMenu(this.userService.companyState, 'order-qrcode'),
                        icon: 'pi pi-fw pi-chart-bar',
                        routerLink: ['/user/ucompany/order']
                        // command: () => {  }
                    },
                    {
                        label: this.translateCode('mn', 'mn-password'),
                        visible: this.userService.getAuthMenu(this.userService.companyState, 'password-sideBar'),
                        icon: 'pi pi-fw pi-key',
                        routerLink: ['/user/ucompany/rep/exclusive/password']
                        // command: () => {  }
                    },
                    // { label: '' , visible: this.userService.getAuthMenu(this.userService.companyState, 'password-sideBar')},
                    {
                        separator: true,
                        disabled: false,
                        visible: this.userService.getAuthMenu(this.userService.companyState, 'password-sideBar')
                    },
                    {
                        label: this.translateCode('mn', 'mn-logout'),
                        icon: 'pi pi-fw pi-home',
                        command: () => { this.userService.logout(); }
                    },
                    // { label: 'uFactory', icon: 'pi pi-fw pi-home' }
                ]
            },
            {
                label: 'Home',visible: this.menuTestvisible,
                items: [
                    { label: 'Dashboard', icon: 'pi pi-fw pi-home', routerLink: ['/user'] }
                ]
            },
            {
                label: 'UI Components', visible: this.menuTestvisible,
                items: [
                    { label: 'Form Layout', icon: 'pi pi-fw pi-id-card', routerLink: ['/user/uikit/formlayout'] },
                    { label: 'Input', icon: 'pi pi-fw pi-check-square', routerLink: ['/user/uikit/input'] },
                    { label: 'Float Label', icon: 'pi pi-fw pi-bookmark', routerLink: ['/user/uikit/floatlabel'] },
                    { label: 'Invalid State', icon: 'pi pi-fw pi-exclamation-circle', routerLink: ['/user/uikit/invalidstate'] },
                    { label: 'Button', icon: 'pi pi-fw pi-box', routerLink: ['/user/uikit/button'] },
                    { label: 'Table', icon: 'pi pi-fw pi-table', routerLink: ['/user/uikit/table'] },
                    { label: 'List', icon: 'pi pi-fw pi-list', routerLink: ['/user/uikit/list'] },
                    { label: 'Tree', icon: 'pi pi-fw pi-share-alt', routerLink: ['/user/uikit/tree'] },
                    { label: 'Panel', icon: 'pi pi-fw pi-tablet', routerLink: ['/user/uikit/panel'] },
                    { label: 'Overlay', icon: 'pi pi-fw pi-clone', routerLink: ['/user/uikit/overlay'] },
                    { label: 'Media', icon: 'pi pi-fw pi-image', routerLink: ['/user/uikit/media'] },
                    { label: 'Menu', icon: 'pi pi-fw pi-bars', routerLink: ['/user/uikit/menu'], routerLinkActiveOptions: { paths: 'subset', queryParams: 'ignored', matrixParams: 'ignored', fragment: 'ignored' } },
                    { label: 'Message', icon: 'pi pi-fw pi-comment', routerLink: ['/user/uikit/message'] },
                    { label: 'File', icon: 'pi pi-fw pi-file', routerLink: ['/user/uikit/file'] },
                    { label: 'Chart', icon: 'pi pi-fw pi-chart-bar', routerLink: ['/user/uikit/charts'] },
                    { label: 'Misc', icon: 'pi pi-fw pi-circle', routerLink: ['/user/uikit/misc'] }
                ]
            },
            {
                label: 'Prime Blocks', visible: this.menuTestvisible,
                items: [
                    { label: 'Free Blocks', icon: 'pi pi-fw pi-eye', routerLink: ['/user/blocks'], badge: 'NEW' },
                    { label: 'All Blocks', icon: 'pi pi-fw pi-globe', url: ['https://www.primefaces.org/primeblocks-ng'], target: '_blank' },
                ]
            },
            {
                label: 'Utilities', visible: this.menuTestvisible,
                items: [
                    { label: 'PrimeIcons', icon: 'pi pi-fw pi-prime', routerLink: ['/user/utilities/icons'] },
                    { label: 'PrimeFlex', icon: 'pi pi-fw pi-desktop', url: ['https://www.primefaces.org/primeflex/'], target: '_blank' },
                ]
            },
            {
                label: 'Pages', visible: this.menuTestvisible,
                icon: 'pi pi-fw pi-briefcase',
                items: [
                    {
                        label: 'Landing',
                        icon: 'pi pi-fw pi-globe',
                        routerLink: ['/landing']
                    },
                    {
                        label: 'Auth',
                        icon: 'pi pi-fw pi-user',
                        items: [
                            {
                                label: 'Login',
                                icon: 'pi pi-fw pi-sign-in',
                                routerLink: ['']
                            },
                            {
                                label: 'Error',
                                icon: 'pi pi-fw pi-times-circle',
                                routerLink: ['/auth/error']
                            },
                            {
                                label: 'Access Denied',
                                icon: 'pi pi-fw pi-lock',
                                routerLink: ['/auth/access']
                            }
                        ]
                    },
                    {
                        label: 'Crud',
                        icon: 'pi pi-fw pi-pencil',
                        routerLink: ['/user/pages/crud']
                    },
                    {
                        label: 'Timeline',
                        icon: 'pi pi-fw pi-calendar',
                        routerLink: ['/user/pages/timeline']
                    },
                    {
                        label: 'Not Found',
                        icon: 'pi pi-fw pi-exclamation-circle',
                        routerLink: ['/notfound']
                    },
                    {
                        label: 'Empty',
                        icon: 'pi pi-fw pi-circle-off',
                        routerLink: ['/user/pages/empty']
                    },
                ]
            },
            {
                label: 'Hierarchy', visible: this.menuTestvisible,
                items: [
                    {
                        label: 'Submenu 1', icon: 'pi pi-fw pi-bookmark',
                        items: [
                            {
                                label: 'Submenu 1.1', icon: 'pi pi-fw pi-bookmark',
                                items: [
                                    { label: 'Submenu 1.1.1', icon: 'pi pi-fw pi-bookmark' },
                                    { label: 'Submenu 1.1.2', icon: 'pi pi-fw pi-bookmark' },
                                    { label: 'Submenu 1.1.3', icon: 'pi pi-fw pi-bookmark' },
                                ]
                            },
                            {
                                label: 'Submenu 1.2', icon: 'pi pi-fw pi-bookmark',
                                items: [
                                    { label: 'Submenu 1.2.1', icon: 'pi pi-fw pi-bookmark' }
                                ]
                            },
                        ]
                    },
                    {
                        label: 'Submenu 2', icon: 'pi pi-fw pi-bookmark',
                        items: [
                            {
                                label: 'Submenu 2.1', icon: 'pi pi-fw pi-bookmark',
                                items: [
                                    { label: 'Submenu 2.1.1', icon: 'pi pi-fw pi-bookmark' },
                                    { label: 'Submenu 2.1.2', icon: 'pi pi-fw pi-bookmark' },
                                ]
                            },
                            {
                                label: 'Submenu 2.2', icon: 'pi pi-fw pi-bookmark',
                                items: [
                                    { label: 'Submenu 2.2.1', icon: 'pi pi-fw pi-bookmark' },
                                ]
                            },
                        ]
                    }
                ]
            },
            {
                label: 'Get Started', visible: this.menuTestvisible,
                items: [
                    {
                        label: 'Documentation', icon: 'pi pi-fw pi-question', routerLink: ['/user/documentation']
                    },
                    {
                        label: 'View Source', icon: 'pi pi-fw pi-search', url: ['https://github.com/primefaces/sakai-ng'], target: '_blank'
                    }
                ]
            }
        ];
        // console.log('zzzz', this.companySelected, this.factorySelected);
    }

    setLang(lang: string) {
        // console.log('SetLang = ' ,lang);
        // this.translate.use(lang);
        // this.setLangList(lang);

        // // ## refresh menu
        // this.setMenu();
    }

    ngOnDestroy(): void {
        if (this.langSub) { this.langSub.unsubscribe(); }
        if (this.dataAroundAppSub) { this.dataAroundAppSub.unsubscribe(); }
        if (this.langListSub) { this.langListSub.unsubscribe(); }

        // if (this.langSub) { this.langSub.unsubscribe(); }
        // if (this.langSub) { this.langSub.unsubscribe(); }
        // if (this.langSub) { this.langSub.unsubscribe(); }
        // if (this.langSub) { this.langSub.unsubscribe(); }

    }
}
