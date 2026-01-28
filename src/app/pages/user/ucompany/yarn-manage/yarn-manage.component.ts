import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-yarn-manage',
  templateUrl: './yarn-manage.component.html',
  styleUrls: ['./yarn-manage.component.scss']
})
export class YarnManageComponent implements OnInit {


    menuMode = '';


    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private location: Location,
        // public userService: UserService,
        // public yarnService: YarnService,
    ) {}


    ngOnInit(): void {
        this.location.replaceState('/'); // ## hide loocation

        this.menuMode = (this.route.snapshot.queryParamMap.get('menuMode') + '')?this.route.snapshot.queryParamMap.get('menuMode') + '':'noMenu';
        console.log(this.menuMode);
    }
}
