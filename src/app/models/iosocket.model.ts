/* eslint-disable eol-last */


// ## dataMsgIO
export class DataMsgIO {
    constructor(
        public msgTypeID: string,
        public sendIO: SendIO,
        public toForm: ToForm,
        public dataIO: any,
    ) {}
}

// ## sendIO
export class SendIO {
    constructor(
        public userIO: UserIO,
        public companyIO: CompanyIO,
        public factoryIO: FactoryIO,
    ) {}
}

// ## UserIO
export class UserIO {
    constructor(
        public uAll: boolean,
        public userClass: string[],
        public userID: string[],
    ) {}
}

// ## companyIO
export class CompanyIO {
    constructor(
        public comAll: boolean,
        public companyID: string[],
    ) {}
}

// ## factoryIO
export class FactoryIO {
    constructor(
        public facAll: boolean,
        public factoryID: string[],
    ) {}
}

// ## toForm
export class ToForm {
    constructor(
        public frmAll: boolean,
        public formName: string[],
    ) {}
}

// ## userRequestNodeLoginWaiting
export class UserRequestNodeLoginWaiting {
    constructor(
        public mode: string,
        public companyID: string,
        public factoryID: string,
        public nodeID: string,
        public stationID: string,
        public uuidUserNodeLoginWaiting: string,
        public userID: string[],
        public userClass: string[],
        public formName: string[],
        public datetime: Date,
        public expiretime: Date,
    ) {}
}

// ## userResponseNodeLoginWaiting
export class UserResponseNodeLoginWaiting {
    constructor(
        public mode: string,
        public companyID: string,
        public factoryID: string,
        public nodeID: string,
        public stationID: string,
        public uuidUserNodeLoginWaiting: string,
        public action: string,

    ) {}
}






// // ## customer order
// export class CustomerOR {
//     constructor(
//         public customerID: string,
//         public customerName: string,
//     ) {}
// }

// // ## productOR
// export class ProductOR {
//     constructor(
//         public productID: string,
//         public productName: string,
//         public productORDetail: string,
//         public productCustomerCode: string,
//         public productORInfo: ProductORInfo[],
//     ) {}
// }

// // ## productORInfo
// export class ProductORInfo {
//     constructor(
//         public productBarcode: string,
//         public targetPlace: TargetPlace,
//         public productColor: string,
//         public productSize: string,
//         public productQty: number,
//         public productYear: string,
//         public productSex: string,
//     ) {}
// }

// // ## targetPlace
// export class TargetPlace {
//     constructor(
//         public targetPlaceID: string,
//         public targetPlaceName: string,
//     ) {}
// }


// // ## customer
// export class Customer {
//     constructor(
//         public customerID: string,
//         public customerName: string,
//         public companyID: string,
//         public registDate: Date,
//         public imageProfile: string,
//         public cusInfo: CusInfo,

//     ) {}
// }

// // ## cusInfo
// export class CusInfo {
//     constructor(
//         public customerDetail: string,
//         public email: string,
//         public tel: string,
//         public web: string,
//         public pic: string,
//         public createBy: CreateBy
//     ) {}
// }


// // ## labelQRCode
// export class LabelQRCode {
//     constructor(
//         public productBarcode: string,
//         public productBarcodeNumber: string,
//         public runningNumber: number,
//         public style: string,
//         public targetPlaceName: string,
//         public productSize: string,
//         public productColor: string
//     ) {}
// }



// // ## ProductionNode
// export class ProductionNode {
//     constructor(
//         public fromNode: string,
//         public toNode: string,
//         public datetime: Date,
//         public createBy: CreateBy,
//     ) {}
// }


// // ## OrderProductionQueue
// export class OrderProductionQueue {
//     constructor(
//         // public orderProductionQueueID: string,
//         public companyID: string,
//         public orderID: string,
//         public productID: string,
//         public queueInfo: QueueInfo[],
//     ) {}
// }

// // ## QueueInfo
// export class QueueInfo {
//     constructor(
//         public productBarcode: string,
//         public queueDate: Date,
//         public factoryID: string,
//         public toNode: string,
//         public productCount: number,
//         public numberFrom: number,
//         public numberTo: number,
//         public createBy: CreateBy
//     ) {}
// }


