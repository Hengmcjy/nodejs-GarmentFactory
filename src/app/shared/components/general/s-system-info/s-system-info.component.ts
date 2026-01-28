import { Component, Input, OnInit } from '@angular/core';
import { SysInfo } from 'src/app/models/app.model';
import { UserService } from 'src/app/services/user.service';

@Component({
    selector: 'app-s-system-info',
    templateUrl: './s-system-info.component.html',
    styleUrls: ['./s-system-info.component.scss'],
})
export class SSystemInfoComponent implements OnInit {
    @Input() sysInfo: SysInfo[] = [];

    constructor(
        public userService: UserService,
    ) {}

    ngOnInit(): void {
        this.sysInfo = this.userService.sysInfo;
    }
}
