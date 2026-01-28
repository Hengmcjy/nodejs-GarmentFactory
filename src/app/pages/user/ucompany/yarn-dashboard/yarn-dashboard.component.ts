import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-yarn-dashboard',
  templateUrl: './yarn-dashboard.component.html',
  styleUrls: ['./yarn-dashboard.component.scss']
})
export class YarnDashboardComponent implements OnInit {
    formActive = 'yarn-dashboard';
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
