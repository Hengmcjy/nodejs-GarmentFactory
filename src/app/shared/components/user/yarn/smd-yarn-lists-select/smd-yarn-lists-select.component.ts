import { Component, OnInit } from '@angular/core';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Yarn } from 'src/app/models/yarn.model';
import { UserService } from 'src/app/services/user.service';
import { YarnService } from 'src/app/services/yarn.service';

@Component({
  selector: 'app-smd-yarn-lists-select',
  templateUrl: './smd-yarn-lists-select.component.html',
  styleUrls: ['./smd-yarn-lists-select.component.scss']
})
export class SmdYarnListsSelectComponent implements OnInit {
    data: any;
    mode = ''; // ## yarn-lists-select ,yarn-lists-select2 , yarnReport
    idx = -1;

    yarns: Yarn[] = [];

    constructor(
        public config: DynamicDialogConfig,
        public ref: DynamicDialogRef,

        public userService: UserService,
        public yarnService: YarnService,
    ) {}

    ngOnInit(): void {
        this.data = this.config.data;
        this.mode = this.data.mode;
        this.idx = this.data.idx;
        this.yarns = this.data.yarns;
        // console.log(this.yarns);
    }

    selectYarn(yarn: Yarn) {
        // console.log(this.subNodeFlowSelect);
        // this.closeDialog(subNodeFlow);
        if (this.mode==='yarn-lists-select2') { // ## from yarn lot fac info  , app-s-yarn-lot-fac
            const data = {
                yarnID: yarn.yarnID,
                idx: this.idx
            };
            this.ref.close(data);
        } else if (this.mode==='yarnReport') {
            this.ref.close(yarn);
        } else {
            this.ref.close(yarn);
        }
    }

    // closeDialog(subNodeFlow: SubNodeFlow) {
    //     const seq = this.seq;
    //     const data = {seq, subNodeFlow};
    //     this.ref.close(data);
    // }
}
