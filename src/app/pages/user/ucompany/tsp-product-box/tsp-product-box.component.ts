import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { DialogService } from 'primeng/dynamicdialog';
import { MessageService } from 'primeng/api';
import { DeliService } from 'src/app/services/deli.service';
import { Subscription } from 'rxjs';
import { DCarton } from 'src/app/models/carton.model';
import { GBC } from 'src/app/global/const-global';
import { UserService } from 'src/app/services/user.service';

@Component({
    selector: 'app-tsp-product-box',
    templateUrl: './tsp-product-box.component.html',
    styleUrls: ['./tsp-product-box.component.scss'],
})
export class TspProductBoxComponent implements OnInit, OnDestroy {

    mode = 'box-size-list'; // ##
    editMode = false;

    dCartons: DCarton[] = [];
    dCarton: DCarton = GBC.clrDCarton();
    dCartonCreate: DCarton = GBC.clrDCarton();

    // dCarton: any[] = [
    //     {seq: 1 , cartonID: 'D55*W28*H25', cartonName:'D55*W28*H25', cSize:'D55*W28*H25'},
    //     {seq: 2 , cartonID: 'D37*W37*H20', cartonName:'D37*W37*H20', cSize:'D37*W37*H20'},
    //     {seq: 3 , cartonID: 'D..*W..*H..', cartonName:'D..*W..*H..', cSize:'D..*W..*H..'},
    //     {seq: 4 , cartonID: 'D--*W--*H--', cartonName:'D--*W--*H--', cSize:'D--*W--*H--'},
    // ];




    private cartonsSub: Subscription = new Subscription();

    constructor(
        public dialogService: DialogService,
        public messageService: MessageService,
        private router: Router,
        private location: Location,

        public userService: UserService,
        private deliService: DeliService,
        // private orderService: OrderService,
        // private productService: ProductService,
        // private cusService: CustomerService,
    ) {}

    ngOnInit(): void {
        this.location.replaceState('/'); // ## hide loocation



        this.getDCartons();
    }

    changeMode(mode: string) {
        this.mode = mode;
    }

    cartonEdit() {
        this.editMode = !this.editMode;
        // this.dCarton = GBC.clrDCarton();
        // if (this.editMode) {
        //     this.dCarton = dCarton;
        // } else {

        // }
    }

    getDCartons() {
        this.dCartons = [];
        this.deliService.getDCartons();
        if (this.cartonsSub) { this.cartonsSub.unsubscribe(); }
        this.cartonsSub = this.deliService.getDCartonsUpdatedListener()
        .subscribe((data) => {
            // console.log(data);
            this.dCartons = data.dCartons;

        });
    }

    dCartonSelect(dCarton: DCarton) {
        this.dCarton = GBC.clrDCarton();
        this.dCarton = dCarton;
    }


    ngOnDestroy(): void {
        if (this.cartonsSub) { this.cartonsSub.unsubscribe(); }
        // if (this.dataAroundAppSub) { this.dataAroundAppSub.unsubscribe(); }

    }
}
