import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-spns-yarn-seasonyear',
  templateUrl: './spns-yarn-seasonyear.component.html',
  styleUrls: ['./spns-yarn-seasonyear.component.scss']
})
export class SpnsYarnSeasonyearComponent implements OnInit, OnDestroy {

    @Input() yarnSeason: string = '';

    private dataAroundAppSub: Subscription = new Subscription();

    constructor(
        // private router: Router,
        // private location: Location,
        public userService: UserService,
    ) {}

    ngOnInit(): void {
        // this.yarnSeason = this.userService.yarnSeason;
        this.dataAroundAppSub = this.userService
            .getDataAroundAppStatusListener()
            .subscribe((dataAroundApp) => {
                // ## declare initial variable from service user

                this.yarnSeason = dataAroundApp.yarnSeason;
            });
    }

    ngOnDestroy(): void {
        if (this.dataAroundAppSub) { this.dataAroundAppSub.unsubscribe(); }
        // if (this.yarnsListSub) { this.yarnsListSub.unsubscribe(); }

    }
}
