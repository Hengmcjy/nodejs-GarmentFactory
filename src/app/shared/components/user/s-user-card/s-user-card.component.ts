import { Component, Input, OnInit } from '@angular/core';
// import { Subscription } from 'rxjs';
// import {  DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
// import { MessageService } from 'primeng/api';

import { UserService } from 'src/app/services/user.service';
import { User } from 'src/app/models/user.model';
import { GBC } from 'src/app/global/const-global';


@Component({
    selector: 'app-s-user-card',
    templateUrl: './s-user-card.component.html',
    styleUrls: ['./s-user-card.component.scss'],
    // providers: [DialogService, MessageService],
})
export class SUserCardComponent implements OnInit {
    @Input() user: User = GBC.clrUser();

    // data: any;

    userImageProfileGCSPath = GBC.userImageProfileGCSPath;  // ## google storage path user image profile


    // private nodeFlowsSub: Subscription = new Subscription();

    constructor(
        // public config: DynamicDialogConfig,
        // public ref: DynamicDialogRef,

        // public dialogService: DialogService,
        // public messageService: MessageService,

        public userService: UserService,
    ) {}

    ngOnInit(): void {
        // this.data = this.config.data;
        // if (this.data.user) {
        //     this.user = this.data.user;
        // }
        // console.log(this.user);
        // console.log(this.userService.userSelected);
        if (!this.user) {
            this.user = this.userService.userSelected;
        }
    }

    genImagePath(imgPath: string) {
        if (imgPath) {
            if (imgPath.length > 0) {
                return this.userImageProfileGCSPath + imgPath;
            }
        }

        return GBC.nulltGCSPath;
    }
}
