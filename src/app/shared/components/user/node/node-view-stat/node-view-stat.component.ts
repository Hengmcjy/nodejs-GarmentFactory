import { Component, OnInit } from '@angular/core';
import { NodeStationService } from 'src/app/services/node-station.service';
import { UserService } from 'src/app/services/user.service';

@Component({
    selector: 'app-node-view-stat',
    templateUrl: './node-view-stat.component.html',
    styleUrls: ['./node-view-stat.component.scss'],
})
export class NodeViewStatComponent implements OnInit {
    pageActive = 'viewstat';
    constructor(
        public userService: UserService,

        public nsService: NodeStationService,
    ) {}

    ngOnInit(): void {
        // console.log(this.nsService.staff);
        this.nsService.setMenuActive(this.pageActive);
    }
}
