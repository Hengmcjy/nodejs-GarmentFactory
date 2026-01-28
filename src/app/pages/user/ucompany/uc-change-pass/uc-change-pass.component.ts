import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { GBC } from 'src/app/global/const-global';
import { User } from 'src/app/models/user.model';
import { UserService } from 'src/app/services/user.service';

@Component({
    selector: 'app-uc-change-pass',
    templateUrl: './uc-change-pass.component.html',
    styleUrls: ['./uc-change-pass.component.scss'],
})
export class UcChangePassComponent implements OnInit {

    user: User = GBC.clrUser();

    constructor(
        private location: Location,
        // private confirmationService: ConfirmationService,
        // private messageService: MessageService,

        public userService: UserService,
        // private orderService: OrderService,
    ) {}

    ngOnInit(): void {
        this.user = this.userService.getUser();
    }
}
