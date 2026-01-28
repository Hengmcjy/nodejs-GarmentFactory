import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-yarn-stock-card',
  templateUrl: './yarn-stock-card.component.html',
  styleUrls: ['./yarn-stock-card.component.scss']
})
export class YarnStockCardComponent implements OnInit  {
    formActive = 'yarn-stock-card';
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
