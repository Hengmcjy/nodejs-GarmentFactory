import { Component, OnDestroy, OnInit, Renderer2, ViewChild } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter, Subscription } from 'rxjs';
import { LayoutService } from "./service/app.layout.service";
import { AppSidebarComponent } from "./app.sidebar.component";
import { AppTopBarComponent } from './app.topbar.component';
import { DialogService } from 'primeng/dynamicdialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { UserService } from '../services/user.service';
import { SocketIOService } from '../services/socketio.service';
import { NodeStationService } from '../services/node-station.service';
import { StorageService } from '../services/storage.service';
import { SSystemInfoComponent } from '../shared/components/general/s-system-info/s-system-info.component';
import { SNodeLoginAllowComponent } from '../shared/components/user/node/s-node-login-allow/s-node-login-allow.component';

@Component({
    selector: 'app-layout',
    templateUrl: './app.layout.component.html',
    providers: [MessageService, ConfirmationService, DialogService],
})
export class AppLayoutComponent implements OnInit, OnDestroy {

    overlayMenuOpenSubscription: Subscription;

    menuOutsideClickListener: any;

    profileMenuOutsideClickListener: any;

    @ViewChild(AppSidebarComponent) appSidebar!: AppSidebarComponent;

    @ViewChild(AppTopBarComponent) appTopbar!: AppTopBarComponent;

    // iconConfigShow = false;
    closable = false;
    screenSize = 'sm';
    screenWidth = 0;

    private ioRequestLoginNode: Subscription = new Subscription;
    private langListSub: Subscription = new Subscription;
    private dataAroundAppSub: Subscription = new Subscription;
    private commandAroundAppSub: Subscription = new Subscription;
    private nodeStationLoginRequestSub: Subscription = new Subscription;

    constructor(
        public layoutService: LayoutService,
        public renderer: Renderer2,
        public router: Router,

        public dialogService: DialogService,
        private confirmationService: ConfirmationService,
        public messageService: MessageService,

        public userService: UserService,
        private socketService: SocketIOService,
        private nsService: NodeStationService,
        private storageService: StorageService,
    ) {
        this.overlayMenuOpenSubscription = this.layoutService.overlayOpen$.subscribe(() => {
            if (!this.menuOutsideClickListener) {
                this.menuOutsideClickListener = this.renderer.listen('document', 'click', event => {
                    const isOutsideClicked = !(this.appSidebar.el.nativeElement.isSameNode(event.target) || this.appSidebar.el.nativeElement.contains(event.target)
                        || this.appTopbar.menuButton.nativeElement.isSameNode(event.target) || this.appTopbar.menuButton.nativeElement.contains(event.target));

                    if (isOutsideClicked) {
                        this.hideMenu();
                    }
                });
            }

            if (!this.profileMenuOutsideClickListener) {
                this.profileMenuOutsideClickListener = this.renderer.listen('document', 'click', event => {
                    const isOutsideClicked = !(this.appTopbar.menu.nativeElement.isSameNode(event.target) || this.appTopbar.menu.nativeElement.contains(event.target)
                        || this.appTopbar.topbarMenuButton.nativeElement.isSameNode(event.target) || this.appTopbar.topbarMenuButton.nativeElement.contains(event.target));

                    if (isOutsideClicked) {
                        this.hideProfileMenu();
                    }
                });
            }

            if (this.layoutService.state.staticMenuMobileActive) {
                this.blockBodyScroll();
            }
        });

        this.router.events.pipe(filter(event => event instanceof NavigationEnd))
            .subscribe(() => {
                this.hideMenu();
                this.hideProfileMenu();
            });
    }

    async ngOnInit() {
        this.screenSize = this.userService.screenSize;
        this.screenWidth = this.userService.screenWidth;
        // console.log('AppLayoutComponent');

        // this.getIORequestLoginNode();
        // this.langListSub = this.userService.getLangsListUpdatedListener().subscribe((data) => {
        //     this.getIORequestLoginNode();
        // });

        // ## when login have to clear storage for node station login uuid
        this.storageService.clearData('nUUIDL');  // ## nUUIDL = key for node workstation login

        this.dataAroundAppSub = this.userService.getDataAroundAppStatusListener().subscribe(dataAroundApp => {
            // console.log('AppLayoutComponent   dataAroundAppSub');
            // ## declare initial variable from service user
            // this.screenSize = dataAroundApp.screenSize;
            // this.screenWidth = dataAroundApp.screenWidth;
            // this.iconConfigShow = dataAroundApp.iconConfigShow;
        });

        this.commandAroundAppSub = this.userService.getCommandAroundAppStatusListener().subscribe(commandAroundApp => {
            // console.log('commandAroundApp');
            // console.log(commandAroundApp);
            if (commandAroundApp.showUserNodeRequestLogin) {
                // console.log('showAllowUserNodeLoginModal');
                this.showAllowUserNodeLoginModal();
            }
            if (commandAroundApp.getNodeStationLoginRequest) {
                // console.log('getNodeStationLoginRequest');
                this.nsService.getNodeStationLoginRequest();
            }
            if (commandAroundApp.openSystemInfo) {
                // console.log('showAllowUserNodeLoginModal');
                this.showOpenSystemInfoModal();
            }
        });

        this.screenWidth = window.innerWidth;  // ## get current screen width
        this.userService.screenWidth = this.screenWidth;

        // this.getNodeStationLoginRequest();
        // this.userService.setCommandAroundAppStatusListenerToNext('propName');
        // this.userService.setDataAroundAppStatusListenerToNext();

    }

    hideMenu() {
        this.layoutService.state.overlayMenuActive = false;
        this.layoutService.state.staticMenuMobileActive = false;
        this.layoutService.state.menuHoverActive = false;
        if (this.menuOutsideClickListener) {
            this.menuOutsideClickListener();
            this.menuOutsideClickListener = null;
        }
        this.unblockBodyScroll();
    }

    hideProfileMenu() {
        this.layoutService.state.profileSidebarVisible = false;
        if (this.profileMenuOutsideClickListener) {
            this.profileMenuOutsideClickListener();
            this.profileMenuOutsideClickListener = null;
        }
    }

    blockBodyScroll(): void {
        if (document.body.classList) {
            document.body.classList.add('blocked-scroll');
        }
        else {
            document.body.className += ' blocked-scroll';
        }
    }

    unblockBodyScroll(): void {
        if (document.body.classList) {
            document.body.classList.remove('blocked-scroll');
        }
        else {
            document.body.className = document.body.className.replace(new RegExp('(^|\\b)' +
                'blocked-scroll'.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
        }
    }

    get containerClass() {
        return {
            'layout-theme-light': this.layoutService.config.colorScheme === 'light',
            'layout-theme-dark': this.layoutService.config.colorScheme === 'dark',
            'layout-overlay': this.layoutService.config.menuMode === 'overlay',
            'layout-static': this.layoutService.config.menuMode === 'static',
            'layout-static-inactive': this.layoutService.state.staticMenuDesktopInactive && this.layoutService.config.menuMode === 'static',
            'layout-overlay-active': this.layoutService.state.overlayMenuActive,
            'layout-mobile-active': this.layoutService.state.staticMenuMobileActive,
            'p-input-filled': this.layoutService.config.inputStyle === 'filled',
            'p-ripple-disabled': !this.layoutService.config.ripple
        }
    }

    showAllowUserNodeLoginModal() {
        // console.log(this.screenWidth);
        const ref = this.dialogService.open(SNodeLoginAllowComponent, {
            data: {
                id: 'allowUserNodeLogin',
                // companyID: this.userService.getCompany()?.companyID,

            },
            position: 'right',
            header: 'allow user node login',
            width: this.screenWidth <= 767 ? '100%':'50%' ,
            baseZIndex: 6000,

            // closable: false,

        });

        ref.onClose.subscribe((data: any) => {
            // console.log(data);
            // if (car) {
            //     this.messageService.add({severity:'info', summary: 'Car Selected', detail:'Vin:' + car.vin});
            // }
        });
    }

    // openSystemInfo
    showOpenSystemInfoModal() {
        // console.log(this.screenWidth);
        const ref = this.dialogService.open(SSystemInfoComponent, {
            data: {
                id: 'openSystemInfo',
                // companyID: this.userService.getCompany()?.companyID,

            },
            position: 'right',
            header: 'system information',
            width: this.screenWidth <= 767 ? '100%':'50%' ,
            baseZIndex: 6000,

            // closable: false,

        });

        ref.onClose.subscribe((data: any) => {
            // console.log(data);
            // if (car) {
            //     this.messageService.add({severity:'info', summary: 'Car Selected', detail:'Vin:' + car.vin});
            // }
        });
    }

    ngOnDestroy() {
        if (this.overlayMenuOpenSubscription) {
            this.overlayMenuOpenSubscription.unsubscribe();
        }

        if (this.menuOutsideClickListener) {
            this.menuOutsideClickListener();
        }

        if (this.ioRequestLoginNode) { this.ioRequestLoginNode.unsubscribe(); }
        if (this.langListSub) { this.langListSub.unsubscribe(); }
        if (this.dataAroundAppSub) { this.dataAroundAppSub.unsubscribe(); }
        if (this.commandAroundAppSub) { this.commandAroundAppSub.unsubscribe(); }
    }
}
