/* eslint-disable eol-last */

import { CreateBy } from "./app.model"

// ## DPacking
export class DPacking {
    constructor(
        public companyID: string,
        public factoryID: string[],
        public seasonYear: string,
        public customerID: string,
        public orderID: string,
        public dID: string,
        public dCountryID: string,
        public dStatus: string,  // ## hide, open , close,  delete
        public isLock: boolean,
        public isLockDCarton: boolean,
        public seq: number,
        public dDate: Date,
        public productionDate: Date,
        public dInfo: DPInfo,
        public dCarton: DPCarton[],


        public totalCarton: number,  // ## counting box
        public totalDPQty: number,  // ## total all qty
        public dPackingQTY: DPackingQTY[],
    ) {}
}

// ## DPackingQTY
export class DPackingQTY {
    constructor(
        public productColor: string,
        public productSize: string,
        public totalQty: number,

        public colorSeq: number,
        public sizeSeq: number,

    ) {}
}

// ## DPInfo
export class DPInfo {
    constructor(
        public packingName: string,
        public createDate: Date,
        public createBy: CreateBy

    ) {}
}

// ## DPCarton
export class DPCarton {
    constructor(
        public seq: number,
        public dCartonID: string,
        public dCartonName: string,
        public cartonID: string,  // box size     D55*W28*H25  D37*W37*H20 …
        public dStatus: string,  //  w , c 	waiting  complete
        public isLock: boolean,
        public dOpen: boolean,
        public dShow: boolean,
        public lastEdit: Date,
        public dBox: DBox[],

        public totalQTY: number,
    ) {}
}

// ## DBox
export class DBox {
    constructor(
        // public cartonID: string,  // box size     D55*W28*H25  D37*W37*H20 …
        public productColor: string,
        public productSize: string,
        public productQty: number,

        public colorSeq: number,
        public sizeSeq: number,
    ) {}
}

// ## DCarton
export class DCarton {
    constructor(
        public companyID: string,
        public seq: number,
        public cartonID: string,
        public cartonName: string,
        public cSize: string,
        public show: boolean,
    ) {}
}

export class DCountry {
    constructor(
        public companyID: string,
        public seq: number,
        public dCountryID: string,
        public dCountryName: string,
        public show: boolean,

    ) {}
}






// export class PDPic {
//     constructor(
//         public albumID: string,
//         public albumName: string,
//         public picName: string[],
//     ) {}
// }


