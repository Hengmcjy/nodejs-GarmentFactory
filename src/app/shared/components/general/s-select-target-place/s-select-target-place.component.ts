
import { Component, OnInit } from '@angular/core';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';

import { UserService } from 'src/app/services/user.service';
import { TargetPlaceS } from 'src/app/models/app.model';

@Component({
    selector: 'app-s-select-target-place',
    templateUrl: './s-select-target-place.component.html',
    styleUrls: ['./s-select-target-place.component.scss'],
})
export class SSelectTargetPlaceComponent implements OnInit {
    data: any;
    targetPlaces: TargetPlaceS[] = [];

    constructor(
        public config: DynamicDialogConfig,
        public ref: DynamicDialogRef,
        private userService: UserService
    ) {}

    ngOnInit(): void {
        this.data = this.config.data
        this.targetPlaces = this.userService.targetPlaces;
        // console.log(this.data);
        // console.log(this.targetPlaces);
    }

    selectTargetPlace(targetPlace: TargetPlaceS) {
        this.closeDialog(targetPlace);
    }

    closeDialog(targetPlace: TargetPlaceS) {
        this.ref.close(targetPlace);
    }
}
