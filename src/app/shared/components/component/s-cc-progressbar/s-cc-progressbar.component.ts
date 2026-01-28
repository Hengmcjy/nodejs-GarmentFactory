import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-s-cc-progressbar',
  templateUrl: './s-cc-progressbar.component.html',
  styleUrls: ['./s-cc-progressbar.component.scss']
})
export class SCcProgressbarComponent implements OnInit {
    @Input() data: any[] = [];  // ##
    @Input() colorBArTxt: any[] = [];

    ngOnInit(): void {

    }

    checkBarPositon(barPosition: string): string {
        if (barPosition == 'l') {
            return 'l-radius10';
        } else  if (barPosition == 'r') {
            return 'r-radius10';
        }
        return 'm-radius10';
    }

}
