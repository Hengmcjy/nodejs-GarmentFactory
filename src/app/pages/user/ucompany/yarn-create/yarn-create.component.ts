import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
    selector: 'app-yarn-create',
    templateUrl: './yarn-create.component.html',
    styleUrls: ['./yarn-create.component.scss'],
})
export class YarnCreateComponent implements OnInit {

    yarnMode = '';

    constructor(
        private route: ActivatedRoute,
    ) {}

    ngOnInit(): void {

        this.yarnMode = (this.route.snapshot.queryParamMap.get('yarnMode') + '')?this.route.snapshot.queryParamMap.get('yarnMode') + '':'create-yarn';
        console.log(this.yarnMode);
    }
}
