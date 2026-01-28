import { Component, OnInit } from '@angular/core';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';

import { ColorS } from 'src/app/models/app.model';
import { UserService } from 'src/app/services/user.service';

@Component({
    selector: 'app-s-select-color',
    templateUrl: './s-select-color.component.html',
    styleUrls: ['./s-select-color.component.scss'],
})
export class SSelectColorComponent implements OnInit {
    data: any;
    colors: ColorS[] = [];
    constructor(
        public config: DynamicDialogConfig,
        public ref: DynamicDialogRef,
        public userService: UserService
    ) {}

    ngOnInit(): void {
        this.data = this.config.data
        // console.log(this.data);
        this.colors = this.userService.colors;
        // console.log(this.colors);
        this.colors.sort((a,b)=>{
            return a.setName >b.setName?1:a.setName <b.setName?-1:0
                || a.seq >b.seq?1:a.seq <b.seq?-1:0
        });
    }

    // getClassSetName(setName: string): string {
    //     if (setName === 'gl') {
    //         return 'text-base text-blue-500';
    //     } else if (setName === 'muji') {
    //         return ' text-lg text-green-500';
    //     }
    //     return '';
    // }

    selectColor(color: ColorS) {
        this.closeDialog(color);
    }

    getColor(colorValue: string): string {
        return 'background-color: '+ colorValue +';';
    }

    closeDialog(color: ColorS) {
        const data: any = {
            color: color,
            colorNo: this.data.colorNo
        };
        this.ref.close(data);
    }
}
