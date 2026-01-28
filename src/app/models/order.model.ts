/* eslint-disable eol-last */
import { FLOAT } from 'html2canvas/dist/types/css/property-descriptors/float';
import { Color, ColorS, CreateBy, OrderTargetPlaceS, TargetPlaceS } from './app.model';
import { ProductProblem } from './workstation.model';
import { YarnLot } from './yarn.model';

// ## order
export class Order {
    constructor(
        public orderID: string,
        public seasonYear: string,
        public ver: number,
        public orderDetail: string,
        public orderDate: Date,
        public deliveryDate: Date,
        public companyID: string,
        public factoryID: string,
        public bundleNo: number,
        public orderstatus: string,

        public customerOR: CustomerOR,
        public orderTargetPlace: OrderTargetPlaceS[],
        public orderColor: ColorS[],
        public productOR: ProductOR,
        public createBy: CreateBy,
        public orderSetting: OrderSetting,
    ) {}
}

export class OrderSetting {
    constructor(
        public qtyMaxView: QtyMaxView[],
    ) {}
}

export class QtyMaxView {
    constructor(
        public zcs: string, // ## colorID ; size ; zone
        public maxQty: number,
    ) {}
}



export class SetOrderProperty {
    constructor(
        public targetPlaceID: string,
        public productColor: string,
        public productSize: string,
    ) {}
}

// ## customer order
export class CustomerOR {
    constructor(
        public customerID: string,
        public customerName: string,
    ) {}
}

// ## productOR
export class ProductOR {
    constructor(
        public productID: string,
        public productName: string,
        public productORDetail: string,
        public productCustomerCode: string,
        public productORInfo: ProductORInfo[],
        public productORRewriteInfo: ProductORRewriteInfo[],
        public subNodeFlowCost: SubNodeFlowCost[],
    ) {}
}

// ## productORInfo
export class ProductORInfo {
    constructor(
        public factoryID: string,
        public productBarcode: string,
        public targetPlace: TargetPlace,
        public productColor: string,
        public productSize: string,
        public productQty: number,
        public productLossQty: number,
        public productYear: string,
        public productSex: string,
        public sizeSeq: number,
    ) {}
}

// ## ProductORRewriteInfo
export class ProductORRewriteInfo {
    constructor(
        public datetime: Date,
        public productBarcode: string,
        public targetPlace: TargetPlace,
        public productColor: string,
        public productSize: string,
        public productQtyOld: number,
        public productQty: number,
        public productLossQty: number,
        public productYear: string,
        public productSex: string,
        public sizeSeq: number,
        public colorSeq: number,
        public targetPlaceSeq: number,
        public createBy: CreateBy
    ) {}
}

// ## targetPlace
export class TargetPlace {
    constructor(
        public targetPlaceID: string,
        public targetPlaceName: string,
        public countryID: string,
        public countryName: string,
    ) {}
}

export class MainZone {
    constructor(
        public targetPlaceID: string,
        public targetPlaceName: string,
    ) {}
}

// ## customer
export class OrderImage {
    constructor(
        public orderID: string,
        public imageProfile: string,

    ) {}
}


// ## customer
export class Customer {
    constructor(
        public customerID: string,
        public customerName: string,
        public setName: string,
        public companyID: string,
        public registDate: Date,
        public imageProfile: string,
        public cusInfo: CusInfo,

    ) {}
}

// ## cusInfo
export class CusInfo {
    constructor(
        public customerDetail: string,
        public email: string,
        public tel: string,
        public web: string,
        public pic: string,
        public createBy: CreateBy
    ) {}
}

// ## labelQRCode
export class LabelQRCode {
    constructor(
        public productBarcode: string,
        public productBarcodeNumber: string,
        public runningNumber: number,
        public style: string,
        public targetPlaceName: string,
        public countryID: string,
        public productSize: string,
        public productColor: string
    ) {}
}

// ## orderProduction / workload
export class OrderProduction {
    constructor(
        public companyID: string,
        public factoryID: string,
        public orderID: string,
        public ver: number,
        public open: boolean,
        public bundleNo: number,
        public bundleID: string,
        public productID: string,
        public productBarcodeNo: string,
        public productBarcodeNoReal: string,
        public productBarcodeNoReserve: ProductBarcodeNoReserve[],
        public targetPlace: TargetPlace,
        public productCount: number,
        public productionDate: Date,
        public productStatus: string,
        public orLost: OrLost,
        public forLoss: boolean,
        public isOutsourceTracking: boolean,

        public yarnLot: YarnLot[],
        public outsourceData: OutsourceData[],
        public subNodeFlow: SubNodeFlow[],
        public productionNode: ProductionNode[],
    ) {}
}

export class OrLost {
    constructor(
        public datetime: Date,
        public odpLostID: string,
        public lostGroupID: string,
        public nodeID: string[],
        public note: string,
        public createBy: CreateBy
    ) {}
}

// OrderSeasonYears
export class OrderSeasonYears {
    constructor(
        public companyID: string,
        public seasonYear: string,
        public sumSeasonYearQty: number,
    ) {}
}

// subNodeFlowCost
export class SubNodeFlowCost {
    constructor(
        public seq: number,
        public nodeID: string,
        public subNodeID: string,
        public cost: number,   // {type: mongoose.Types.Decimal128},
        public subNodeFlowTypeID: string,  // ##  1 , 60 , 120 , kg    ||  1 = 1 by 1 /  60 or 120 = 5 or 10 bundle / kg = kilogram
    ) {}
}

// subNodeFlowType
export class SubNodeFlowType {
    constructor(
        public companyID: string,
        public seq: number,
        public subNodeFlowTypeID: string,
        public subNodeFlowTypeName: string,
    ) {}
}

// orderSubNodeFlowCost
export class OrderSubNodeFlowCost {
    constructor(
        public companyID: string,
        public orderID: string,
        public orderTargetPlace: OrderTargetPlaceS[],
        public orderColor: ColorS[],
        public subNodeFlowCost: SubNodeFlowCost[],
    ) {}
}


export class OrderProductionQueueBundleNo {
    constructor(
        public companyID: string,
        public factoryID: string,
        public orderID: string,
        public productBarcode: string,
        public isOutsource: boolean,
        public bundleNo: number,
        public productCount: number,
        public numberFrom: number,
        public numberTo: number,
    ) {}
}

export class SubNodeFlow {
    constructor(
        public seq: number,
        public factoryID: string,
        public nodeID: string,
        public subNodeID: string,
        public subNodeName: string,
        public qrCode: string,  // ## staffID , qrCode of staff
        public datetime: Date,
        public monthlyID: string,  // ## งวด ID  เอาไว้ใช้เวลาทำเกี่ยวกับ บัญชี
        public cost: number,
        public createBy: CreateBy,
    ) {}
}

// OrderProductBundleNosOutsourceTracking
export class OrderProductBundleNosOutsourceTracking {
    constructor(
        public companyID: string,
        public factoryID: string,
        public orderID: string,
        public bundleNo: number,
        public productCount: number,
        public nodeID: string,
        public isOutsourceTracking: boolean,
        // public bundleNo1: Date,
        public targetPlace: string,
        public color: string,
        public size: string,
        public status: string,
        public isTracking: boolean,
        public targetPlaceSeq: number,
        public colorSeq: number,
        public sizeSeq: number,
        public colorCode: string,
        public colorName: string,
    ) {}
}

export class OrderBundleList {
    constructor(
        public companyID: string,
        public orderID: string,
        public bundleNo: number,
        public productCount: number,
        public targetPlace: string,
        public color: string,
        public size: string,
        public yarnLot: YarnLot[],


        public targetPlaceSeq: number,
        public colorSeq: number,
        public sizeSeq: number,
        public colorCode: string,
        public colorName: string,
    ) {}
}



export class OutsourceData {
    constructor(
        public factoryID: string,
        public fromFactoryID: string,
        public datetime: Date,
    ) {}
}

// productBarcodeNoReserve : [{       // ## last one @ first element   ตัวล่าสุดเอาไว้ช่องแรก
//     productBarcodeNo : {type: String},
//     datetimeReserve : {type: Date}
//   }],
export class ProductBarcodeNoReserve {
    constructor(
        public productBarcodeNo: string,
        public datetime: Date,
        public nodeID: string,
        public createBy: CreateBy,
    ) {}
}

// ## ProductionNode
export class ProductionNode {
    constructor(
        public factoryID: string,
        public fromNode: string,
        public toNode: string,
        public datetime: Date,
        public status: string,
        public info: string,
        public sTypeOtus: string,  // ## b =bundle , 1= 1by 1 / sTypeOtus=scanTypeOutsource
        public problemID: string,
        public problemName: string,
        public isTracking: boolean,
        public isOutsource: boolean,
        public outsourceData: OutsourceData[],
        public createBy: CreateBy,
    ) {}
}


// ## OrderProductionQueue
export class OrderProductionQueue {
    constructor(
        // public orderProductionQueueID: string,
        public companyID: string,
        public orderID: string,
        public productID: string,
        public ver: number,
        public queueInfo: QueueInfo[],
    ) {}
}

// ## QueueInfo
export class QueueInfo {
    constructor(
        public productBarcode: string,
        public queueDate: Date,
        public factoryID: string,
        public isOutsource: boolean,
        public forLoss: boolean,
        public forLossQty: number,
        public bundleNo: number,
        public bundleID: string,
        public toNode: string,
        public productCount: number,
        public numberFrom: number,
        public numberTo: number,
        public yarnLot: YarnLot[],
        public createBy: CreateBy
    ) {}
}

// ## QueueInfo
export class QueueInfoList {
    constructor(
        public companyID: string,
        public orderID: string,
        public productBarcode: string,
        public bundleNo: number,
        public forLossQty: number,
        public productCount: number,
        public numberFrom: number,
        public numberTo: number,
        public yarnLot: YarnLot[],
        public color: string,
        public colorSeq: number,
        public size: string,
        public sizeSeq: number,
    ) {}
}

// orderProductionQueueList
export class OrderProductionQueueList {
    constructor(
        public companyID: string,
        public orderID: string,
        public productID: string,
        public seasonYear: string,
        public ver: number,
        public factoryID: string,
        public productBarcode: string,
        public isOutsource: boolean,
        public queueDate: Date,
        public forLossQty: number,
        public productCount: number,
        public toNode: string,
        public numberFrom: number,
        public numberTo: number,
        public bundleNoFrom: number,
        public bundleNoTo: number,
        public yarnLot: YarnLot[],
        public outsourceData: OutsourceData[],
        public createBy: CreateBy
    ) {}
}

// ProductionQueuedQtySum
export class ProductionQueuedQtySum {
    constructor(
        public productBarcode: string,
        public forLoss: boolean,
        public countProductionQueueByBarcode: number,
        public sumProductionQueueByBarcode: number,
    ) {}
}


// OrderStyles
export class OrderStyles {
    constructor(
        public companyID: string,
        public factoryID: string,
        public orderID: string,
        public productID: string,
    ) {}
}



// ## PDF ###############################################################################
// ## ProductionZonePeriodRow
export class ProductionZonePeriodRow {
    constructor(
        public rowState: string, // ## 'orderIDHead', 'd', 't' //  d= data detail , t= total line, gt= grand total of orderID
        public dataGroup: string, // ## setName+targetPlaceID+orderID+colorCode
        public dataGroupG: string, // ## setName+targetPlaceID+orderID
        public setName: string,
        public orderID: string,
        public targetPlaceID: string,
        public factoryID: string,
        public factoryName: string,

        public colorCode: string,
        public colorName: string,
        public size: string,
        public sizeName: string,

        public orderQTY: string,
        public knitting: string,
        public panal: string,
        public linking: string,
        public mending: string,
        public washing: string,
        public pressing: string,
        public qc: string,
    ) {}
}


export class BundleSetGroup {
    constructor(
        public companyID: string,
        public uuid: string,
        public completed: boolean,
        public groupName: string,
        public seq: number,
        public seasonYear: string,
        public orderID: string,
        public setName: string,
        public targetPlaceID: string,
        public color: Color,
        public yarnLotID: string,
        public bundleNoSet: string,
        public bundleNoQty: number,
        public datetime: Date,
        public createBy: CreateBy
    ) {}
}



export class OPDLost {
    constructor(
        public companyID: string,
        public opdLostID: string,
        public opdLostName: string,
        public lostGroupID: string,
        public show: boolean,
        public seq: number,
    ) {}
}

export class LostGroup {
    constructor(
        public companyID: string,
        public lostGroupID: string,
        public lostGroupName: string,
        public show: boolean,
        public seq: number,
    ) {}
}
