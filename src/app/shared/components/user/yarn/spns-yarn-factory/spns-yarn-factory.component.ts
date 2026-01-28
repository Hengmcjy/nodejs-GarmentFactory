import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { GBC } from 'src/app/global/const-global';
import { Factory } from 'src/app/models/app.model';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-spns-yarn-factory',
  templateUrl: './spns-yarn-factory.component.html',
  styleUrls: ['./spns-yarn-factory.component.scss']
})
export class SpnsYarnFactoryComponent implements OnInit, OnDestroy  {
    @Input() factorySelect: Factory = GBC.clrFactory();

    private dataAroundAppSub: Subscription = new Subscription();

    constructor(
        // private router: Router,
        // private location: Location,
        public userService: UserService,
    ) {}

    ngOnInit(): void {
        // this.factorySelect = GBC.clrFactory();
        // this.userService.factorySelect = GBC.clrFactory();
        // this.yarnSeason = this.userService.yarnSeason;
        this.dataAroundAppSub = this.userService
            .getDataAroundAppStatusListener()
            .subscribe((dataAroundApp) => {
                // ## declare initial variable from service user

                this.factorySelect = dataAroundApp.factorySelect;
            });
    }

    ngOnDestroy(): void {
        if (this.dataAroundAppSub) { this.dataAroundAppSub.unsubscribe(); }
        // if (this.yarnsListSub) { this.yarnsListSub.unsubscribe(); }

    }
}
