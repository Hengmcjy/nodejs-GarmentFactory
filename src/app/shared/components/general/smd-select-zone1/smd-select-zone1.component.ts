import { Component } from '@angular/core';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { GBC } from 'src/app/global/const-global';
import { YarnLotUsageRow } from 'src/app/models/yarn.model';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-smd-select-zone1',
  templateUrl: './smd-select-zone1.component.html',
  styleUrls: ['./smd-select-zone1.component.scss']
})
export class SmdSelectZone1Component {
    data: any;
    mainZoneList: any[] = [];

    mode = ''; // 'yarn.select.stockcard.zone'

    // ## for  mode: 'yarn.select.stockcard.zone'
    uS: YarnLotUsageRow = GBC.clrYarnLotUsageRow();
    yarnID = '';

    constructor(
        public config: DynamicDialogConfig,
        public ref: DynamicDialogRef,

    //     private confirmationService: ConfirmationService,
    //     private messageService: MessageService,

        public userService: UserService,
    //     public yarnService: YarnService,
    ) {}

    ngOnInit(): void {
        this.data = this.config.data;
        this.mode = this.data.mode;
        this.mainZoneList = this.userService.mainZoneList;

        // ## for  mode: 'yarn.select.stockcard.pcs'
        if (this.mode === 'yarn.select.stockcard.zone') {
            this.uS = this.data.uS;
            this.yarnID = this.data.yarnID;
        }
    }

    closeDialog(mainZoneList: any) {
        // if (this.number1.trim() === '') {
        //     this.number1 = '0';
        // }
        const data1: any = {
            data: this.data,
            mainZoneList: mainZoneList,
            success: true
        };
        this.ref.close(data1);
    }
}
