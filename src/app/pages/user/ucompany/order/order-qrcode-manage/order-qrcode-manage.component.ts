import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { UserService } from 'src/app/services/user.service';

@Component({
    selector: 'app-order-qrcode-manage',
    templateUrl: './order-qrcode-manage.component.html',
    styleUrls: ['./order-qrcode-manage.component.scss'],
})
export class OrderQrcodeManageComponent implements OnInit {
    formActive = 'qrcode-manage';
    formName = this.formActive;
    constructor(
        private location: Location,

        public userService: UserService,
    ) {}

    ngOnInit(): void {
        this.location.replaceState('/'); // ## hide loocation
        this.userService.setFormActive(this.formActive);

    }
}
