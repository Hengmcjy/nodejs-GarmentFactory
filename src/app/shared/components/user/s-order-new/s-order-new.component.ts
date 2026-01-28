import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'app-s-order-new',
    templateUrl: './s-order-new.component.html',
    styleUrls: ['./s-order-new.component.scss'],
})
export class SOrderNewComponent implements OnInit {
    orderID = '';
    orderDesc = '';

    constructor() {}

    ngOnInit(): void {}

    createOrder() {

    }
}
