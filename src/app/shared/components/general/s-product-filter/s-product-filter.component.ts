import { Component, OnInit } from '@angular/core';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { GBC } from 'src/app/global/const-global';
import { Order } from 'src/app/models/order.model';
import { UserService } from 'src/app/services/user.service';

@Component({
    selector: 'app-s-product-filter',
    templateUrl: './s-product-filter.component.html',
    styleUrls: ['./s-product-filter.component.scss'],
})
export class SProductFilterComponent implements OnInit {
    data: any;
    order: Order = GBC.clrOrder();

    showList: string[] = [];
    styleArr: string[] = [];
    targetPlaceArr: string[] = [];
    colorArr: string[] = [];
    sizeArr: string[] = [];

    styleS: string[] = [];
    targetPlaceS: string[] = [];
    colorS: string[] = [];
    sizeS: string[] = [];
    setName = '';

    constructor(
        public config: DynamicDialogConfig,
        public ref: DynamicDialogRef,
        public userService: UserService,
    ) {}

    ngOnInit(): void {
        this.data = this.config.data;
        this.showList = this.data.showList;
        this.order = this.data.order;
        this.styleS = this.data.styleS;
        this.targetPlaceS = this.data.targetPlaceS;
        this.colorS = this.data.colorS;
        this.sizeS = this.data.sizeS;

        if (this.order.orderColor.length > 0) {
            this.setName = this.order.orderColor[0].setName;
        }
        // console.log(this.order.productOR.productORInfo);

        // getTargetPlaceSeq(targetPlaceID: string, countryID: string)
        let targetPlaceM = this.order.productOR.productORInfo.map(mp => ({
            targetPlace: mp.targetPlace.targetPlaceID +'/'+mp.targetPlace.countryID,
            seq: this.userService.getTargetPlaceSeq(mp.targetPlace.targetPlaceID, mp.targetPlace.countryID)
        }));
        targetPlaceM.sort((a,b)=>{ return a.seq >b.seq?1:a.seq <b.seq?-1:0 });
        // console.log(targetPlaceM);

        let colorM = this.order.productOR.productORInfo.map(mp => ({
            productColor: mp.productColor,
            seq: this.userService.getColorSeq(mp.productColor.substr(0, 2))
        }));
        colorM.sort((a,b)=>{ return a.seq >b.seq?1:a.seq <b.seq?-1:0 });
        // console.log(colorM);

        let sizeM = this.order.productOR.productORInfo.map(mp => ({
            productSize: mp.productSize,
            seq: mp.sizeSeq
        }));
        sizeM.sort((a,b)=>{ return a.seq >b.seq?1:a.seq <b.seq?-1:0 });
        // console.log(sizeM);

        this.styleArr = [...new Set(this.order.productOR.productORInfo.map((item: any) => item.productBarcode.substr(0, 12).trim()))];
        this.targetPlaceArr = [...new Set(targetPlaceM.map((item: any) => item.targetPlace))];
        this.colorArr = [...new Set(colorM.map((item: any) => item.productColor))];
        this.sizeArr = [...new Set(sizeM.map((item: any) => item.productSize))];
        // console.log(this.styleArr, this.targetPlaceArr, this.colorArr, this.sizeArr);

    }

    checkStyleListShow(mode: string) {
        if (this.showList.includes(mode)) {
            return true;
        }
        return false;
    }

    checkItem(type: string, value: string) {
        // const isRunNumberUp = runNumberUpType.includes(lottoBetTypeX);
        if (type === 'style') {
            return this.styleS.includes(value);
        } else if (type === 'targetPlace') {
            return this.targetPlaceS.includes(value);
        } else if (type === 'color') {
            return this.colorS.includes(value);
        } else if (type === 'size') {
            return this.sizeS.includes(value);
        }
        return false;
    }

    selectItem(type: string, value: string) {
        if (type === 'style') {
            const idx = this.styleS.findIndex(i=>(i === value));
            if (idx >= 0) {
                this.styleS.splice(idx, 1);
            } else {
                this.styleS.push(value);
            }
        } else if (type === 'targetPlace') {
            const idx = this.targetPlaceS.findIndex(i=>(i === value));
            if (idx >= 0) {
                this.targetPlaceS.splice(idx, 1);
            } else {
                this.targetPlaceS.push(value);
            }
        } else if (type === 'color') {
            const idx = this.colorS.findIndex(i=>(i === value));
            if (idx >= 0) {
                this.colorS.splice(idx, 1);
            } else {
                this.colorS.push(value);
            }
        } else if (type === 'size') {
            const idx = this.sizeS.findIndex(i=>(i === value));
            if (idx >= 0) {
                this.sizeS.splice(idx, 1);
            } else {
                this.sizeS.push(value);
            }
        }
        // console.log(this.style, this.targetPlace, this.color, this.size);
    }

    clearSelectItem() {
        this.styleS = [];
        this.targetPlaceS = [];
        this.colorS = [];
        this.sizeS = [];
    }

    closeDialog() {
        this.ref.close({
            styleS: this.styleS,
            targetPlaceS: this.targetPlaceS,
            colorS: this.colorS,
            sizeS: this.sizeS
        });
    }
}
