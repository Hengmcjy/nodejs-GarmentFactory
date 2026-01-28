import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'app-node-workflow',
    templateUrl: './node-workflow.component.html',
    styleUrls: ['./node-workflow.component.scss'],
})
export class NodeWorkflowComponent implements OnInit {
    isdragdrop = true;
    test: any[] = [
        {id: 1, a: 'aaa', b: 'bbb'},
        {id: 2, a: 'aaa', b: 'bbb'},
        {id: 3, a: 'aaa', b: 'bbb'},
        {id: 4, a: 'aaa', b: 'bbb'},
        {id: 5, a: 'aaa', b: 'bbb'},
        {id: 6, a: 'aaa', b: 'bbb'},
        {id: 7, a: 'aaa', b: 'bbb'},
        {id: 8, a: 'aaa', b: 'bbb'},
        {id: 9, a: 'aaa', b: 'bbb'},
        {id: 10, a: 'aaa', b: 'bbb'},
    ];
    constructor() {}

    ngOnInit(): void {}

    onOrderActivity() {
        // this.test.forEach((a, index) => (a.id = index + 1));
        // this.saveActivity(test);
        // console.log(this.test);
    }

    // sortByActivityOrder(a,b){
    //     a.Order - b.Order
    //    }
}
