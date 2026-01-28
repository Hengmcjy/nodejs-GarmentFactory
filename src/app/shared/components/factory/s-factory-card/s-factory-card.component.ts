import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { Subscription } from 'rxjs';

import { UserService } from 'src/app/services/user.service';
import { Factory } from 'src/app/models/app.model';
import { GBC } from 'src/app/global/const-global';

@Component({
    selector: 'app-s-factory-card',
    templateUrl: './s-factory-card.component.html',
    styleUrls: ['./s-factory-card.component.scss'],
})
export class SFactoryCardComponent implements OnInit, OnDestroy {
    @Input() factory: Factory = GBC.clrFactory();
    // @Input() mode: string = ''; // ## 'all', 'affiliate', 'outsource'

    // selectOneGCSPath = this.userService.selectOneGCSPath;
    companyFactoryImageProfileGCSPath = GBC.companyFactoryImageProfileGCSPath;  // ## google storage path company image profile
    // factory: Factory = this.userService.factoryDialogSelected;

    private factorySub: Subscription = new Subscription();

    constructor(
        private userService: UserService,
    ) {}

    ngOnInit(): void {
        this.getSelectFactoryDialogSelect();
        // console.log(this.factory);
    }

    getSelectFactoryDialogSelect() {
        if (this.factorySub) { this.factorySub.unsubscribe(); }
        this.factorySub = this.userService.getSelectFactoryDialogSelectUpdatedListener().subscribe((data) => {
            this.factory = data.factory;
            // console.log(this.factory );
            // if (this.mode === 'all') {
            //     this.factory = data.factory;
            // } else if (this.mode === 'affiliate') {

            // } else if (this.mode === 'outsource') {

            // } else {
            //     this.factory = data.factory;
            // }
        });
    }



    genImagePath(imgPath: string) {
        if (imgPath) {
            if (imgPath.length > 0) {
                return this.companyFactoryImageProfileGCSPath + imgPath;
            }
        }

        return GBC.selectOneGCSPath;
    }



    ngOnDestroy(): void {
        if (this.factorySub) { this.factorySub.unsubscribe(); }
    }
}
