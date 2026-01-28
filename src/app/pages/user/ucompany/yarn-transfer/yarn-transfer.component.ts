import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-yarn-transfer',
  templateUrl: './yarn-transfer.component.html',
  styleUrls: ['./yarn-transfer.component.scss']
})
export class YarnTransferComponent implements OnInit {
    formActive = 'yarn-transfer';
    formName = this.formActive;

    constructor(
        private router: Router,
        private location: Location,
        public userService: UserService,
        // public yarnService: YarnService,
    ) {}


    ngOnInit(): void {
        this.location.replaceState('/'); // ## hide loocation
        // this.userService.setFormActive(this.formActive);
    }
}
