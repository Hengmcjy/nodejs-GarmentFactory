import { Component, OnInit } from '@angular/core';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Yarn } from 'src/app/models/yarn.model';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-s-yarn-filter',
  templateUrl: './s-yarn-filter.component.html',
  styleUrls: ['./s-yarn-filter.component.scss']
})
export class SYarnFilterComponent implements OnInit  {
    data: any;

    mode = '';  // ## yarn-lists-select
    showList: string[] = [];
    yarns: Yarn[] = [];
    yarnsCount: number = 0;

    constructor(
        public config: DynamicDialogConfig,
        public ref: DynamicDialogRef,
        public userService: UserService,
    ) {}

    ngOnInit(): void {
        this.data = this.config.data;
        this.mode = this.data.mode;
        this.showList = this.data.showList;
        this.yarns = this.data.yarns;
        this.yarnsCount = this.data.yarnsCount;

        // console.log(this.showList, this.yarns, this.yarnsCount);
    }

    selectYarn(yarn: Yarn) {
        // console.log(this.subNodeFlowSelect);
        // this.closeDialog(subNodeFlow);
        this.ref.close(yarn);
    }
}
