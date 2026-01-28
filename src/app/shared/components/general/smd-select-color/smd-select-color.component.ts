import { Component, OnInit } from '@angular/core';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ColorS } from 'src/app/models/app.model';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-smd-select-color',
  templateUrl: './smd-select-color.component.html',
  styleUrls: ['./smd-select-color.component.scss']
})
export class SmdSelectColorComponent implements OnInit {

    data: any;
    colorS: ColorS[] = [];
    constructor(
        public config: DynamicDialogConfig,
        public ref: DynamicDialogRef,
        public userService: UserService
    ) {}

    ngOnInit(): void {
        this.data = this.config.data
        // console.log(this.data);
        this.colorS = this.data.colorS;
        // console.log(this.colors);
        this.colorS.sort((a,b)=>{
            return a.setName >b.setName?1:a.setName <b.setName?-1:0
                || a.seq >b.seq?1:a.seq <b.seq?-1:0
        });
    }

    selectColor(color: ColorS) {
        this.closeDialog(color);
    }

    getColor(colorValue: string): string {
        return 'background-color: '+ colorValue +';';
    }

    closeDialog(color: ColorS) {
        // const data: any = {
        //     color: color,
        //     colorNo: this.data.colorNo
        // };
        this.ref.close(color);
    }
}
