import { Component, OnDestroy, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { DialogService } from 'primeng/dynamicdialog';
import { Subscription } from 'rxjs';
import { UserService } from 'src/app/services/user.service';
import { YarnService } from 'src/app/services/yarn.service';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-s-set-yarn-production',
  templateUrl: './s-set-yarn-production.component.html',
  styleUrls: ['./s-set-yarn-production.component.scss'],
  providers: [DialogService],
})
export class SSetYarnProductionComponent implements OnInit, OnDestroy  {


    items: MenuItem[] = [];

    // private dataAroundAppSub: Subscription = new Subscription();
    // private yarnUsageListSub: Subscription = new Subscription();

    constructor(
        // private router: Router,
        private location: Location,
        public dialogService: DialogService,

        public userService: UserService,
        public yarnService: YarnService,
    ) {}

    ngOnInit(): void {

        // ## menu
        this.items = [
            {
                label: 'Yarn set',
                // styleClass: 'text-red-800',
                icon: 'pi pi-fw pi-book',
                command: () => {
                    console.log('000');
                }

            },
            {
                label: 'Yarn stock',
                // styleClass: 'text-red-800',
                icon: 'pi pi-fw pi-paperclip',
                command: () => {
                    console.log('111');
                }
            }
        ];
    }

    ngOnDestroy(): void {
        // if (this.dataAroundAppSub) { this.dataAroundAppSub.unsubscribe(); }
        // if (this.yarnUsageListSub) { this.yarnUsageListSub.unsubscribe(); }

    }
}
