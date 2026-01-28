import { CreateBy, TargetPlaceS } from "./app.model";
import { CustomerOR, Order, TargetPlace } from "./order.model";
import { Product } from "./product.model";
import { YarnLot } from "./yarn.model";




// ## repDataFormat1
export class RepDataFormat1 {
    constructor(
        public allProductQty: number,
        public orderProductQtyByOrderIDRep: OrderProductQtyByOrderIDRep[],
        public orderProductQtyByOrderIDProductIDRep: OrderProductQtyByOrderIDProductIDRep[],
        public orderProductQtyBundleListRep: OrderProductQtyBundleListRep[],
        public orders: Order[],
        public products: Product[],
        public productStateStyle: ProductStateStyle[],
        public productStateTargetPlace: ProductStateTargetPlace[],
        public productStateColor: ProductStateColor[],
        public productStateSize: ProductStateSize[],
        public productStateStyleTargetPlaceColorSize: ProductStateStyleTargetPlaceColorSize[],
        public queueInfoRep: QueueInfoRep[],
        public currentProductAllDetailCFN: any[],
        public productionRepairCount: ProductionRepairCount[],
        public productionProblemCount: ProductionRepairCount[],
    ) {}
}
// productionRepairCount: ProductionRepairCount[];
        // productionProblemCount: ProductionRepairCount[];

export class OrderProductQtyByOrderIDRep {
    constructor(
        public companyID: string,
        public factoryID: string,
        public orderID: string,
        public sumProductQty: number,
    ) {}
}

// orderProductQtyByOrderIDProductIDRep
export class OrderProductQtyByOrderIDProductIDRep {
    constructor(
        public companyID: string,
        public factoryID: string,
        // public orderID: string,
        public productID: string,
        public sumProductQty: number,
    ) {}
}

// orderProductQtyBundleListRep
export class OrderProductQtyBundleListRep {
    constructor(
        public companyID: string,
        public factoryID: string,
        public orderID: string,
        public productID: string,
        public bundleNo: number,
        public sumProductQty: number,
    ) {}
}

// productStateStyle
export class ProductStateStyle {
    constructor(
        public companyID: string,
        public factoryID: string,
        public style: string,
        public countStyle: number,
    ) {}
}

export class ProductStateTargetPlace {
    constructor(
        public companyID: string,
        public factoryID: string,
        public style: string,
        public targetPlace: string,
        public countTargetPlace: number,
    ) {}
}

export class ProductStateColor {
    constructor(
        public companyID: string,
        public factoryID: string,
        public style: string,
        public color: string,
        public countColor: number,
    ) {}
}

export class ProductStateSize {
    constructor(
        public companyID: string,
        public factoryID: string,
        public style: string,
        public size: string,
        public countSize: number,
    ) {}
}

export class ProductStateStyleTargetPlaceColorSize {
    constructor(
        public companyID: string,
        public factoryID: string,
        public productID: string,
        public style: string,
        public targetPlace: string,
        public color: string,
        public size: string,
        public countStyleTargetPlaceColorSize: number,
        public sizeSeq: number,
    ) {}
}

// ## QueueInfo
export class QueueInfoRep {
    constructor(
        public companyID: string,
        public orderID: string,
        public productID: string,
        public productBarcode: string,
        public queueDate: Date,
        public factoryID: string,
        public bundleNo: number,
        public toNode: string,
        public productCount: number,
        public numberFrom: number,
        public numberTo: number,
        public createBy: CreateBy
    ) {}
}

// ## OrderProductFacOutQTY
export class OrderProductFacOutQTY {
    constructor(
        public companyID: string,
        public orderID: string,
        public outsourcefactoryID: string,
        public sumFactoryOutsQty: number,
    ) {}
}

// OrderProductFacOutStyleColorSizeQTY
export class OrderProductFacOutStyleColorSizeQTY {
    constructor(
        public companyID: string,
        public orderID: string,
        public outsourcefactoryID: string,
        public style: string,
        public targetPlace: string,
        public color: string,
        public size: string,
        public countQty: number,
        public colorSeq: number,
        public sizeSeq: number,
    ) {}
}


// ## currentProductionBundleState  groupScanID2
export class CurrentProductionBundleState {
    constructor(
        public companyID: string,
        public style: string,
        public orderID: string,
        public bundleNo: number,
        public productCount: number,
        public targetPlaceID: string,
        public targetPlaceName: string,
        public color: string,
        public size: string,
        public fromNode: string,
        public sumProductQty: number,
        public colorSeq: number,
        public colorName: string,
        public sizeSeq: number,
        public targetPlaceSeq: number,
        public userID: string,  // ## userID scan
        public groupScanID2: string, // ## TL TN SD S2
    ) {}
}


// orderStyleColorSize: any[];  currentCompanyOrder: any[];
// ## orderStyleColorSize
export class OrderStyleColorSize {
    constructor(
        public companyID: string,
        public orderID: string,
        public productID: string,
        public style: string,
        public productColor: string,
        public colorSeq: number,
        public productSize: string,
        public sizeSeq: number,
    ) {}
}

// ##
export class CurrentCompanyOrder {
    constructor(
        public companyID: string,
        public orderID: string,
        public productID: string,
        public style: string,
        public productBarcode: string,
        public productColor: string,
        public productSize: string,
        public targetPlaceID: string,
        public countryID: string,
        public sumQty: number,
    ) {}
}

export class CurrentCompanyOrderStyleSize {
    constructor(
        public companyID: string,
        public orderID: string,
        public productID: string,
        public style: string,
        public productColor: string,
        public productSize: string,
        public sumQty: number,
    ) {}
}

export class CurrentCompanyOrderZoneStyleSize {
    constructor(
        public companyID: string,
        public orderID: string,
        public productID: string,
        public targetPlaceID: string,
        public targetPlaceName: string,
        public style: string,
        public productColor: string,
        public productSize: string,
        public sumQty: number,
        public zcs: string,
    ) {}
}

export class CompanyOrderZoneStyleAllSize {
    constructor(
        public companyID: string,
        public orderID: string,
        public targetPlaceID: string,
        public targetPlaceName: string,
        public productColor: string,
        public sumQty: number,
    ) {}
}

export class CurrentProductQtyAllC {
    constructor(
        public companyID: string,
        public productID: string,
        public style: string,
        public targetPlace: string,
        public color: string,
        public size: string,
        public countQty: number,
        public colorSeq: number,
        public sizeSeq: number,
    ) {}
}

export class CurrentProductQtyAllCF {
    constructor(
        public companyID: string,
        public factoryID: string,
        public productID: string,
        public style: string,
        public targetPlace: string,
        public color: string,
        public size: string,
        public countQty: number,
        public colorSeq: number,
        public sizeSeq: number,
    ) {}
}

// currentOrderStyle
export class CurrentOrderStyle {
    constructor(
        public companyID: string,
        public orderID: string,
        public productID: string,
        public style: string,
        public customerOR: CustomerOR,
        public sumQty: number,
    ) {}
}

// companyCurrentProductQtyAll
export class CompanyCurrentProductQtyAll {
    constructor(
        public companyID: string,
        public orderID: string,
        public productID: string,
        public style: string,
        public countQty: number,
        public completeQty: number,
        public remainQty: number,
    ) {}
}

// CurrentCompanyProductQtyAll
export class CurrentCompanyProductQtyZoneAll {
    constructor(
        public companyID: string,
        public productID: string,
        public style: string,
        public targetPlace: string,
        public countQty: number,
    ) {}
}

export class CurrentCompanyProductQtyCountryAll {
    constructor(
        public companyID: string,
        public productID: string,
        public style: string,
        public countryID: string,
        public countQty: number,
    ) {}
}

export class CurrentCompanyProductQtyCountryCSAll {
    constructor(
        public companyID: string,
        public productID: string,
        public style: string,
        public color: string,
        public size: string,
        public countryID: string,
        public colorSeq: number,
        public sizeSeq: number,
        public countQty: number,
    ) {}
}

// TotalProductionQueueByBundleNo
export class TotalProductionQueueByBundleNo {
    constructor(
        public companyID: string,
        public orderID: string,
        public countProductionQueueByBundleNo: number,
        public sumProductionQueueByBundleNo: number,
    ) {}
}


// OrderProductCFNodeRep
export class OrderProductCFNodeRep {
    constructor(
        public companyID: string,
        public productID: string,
        public style: string,
        public targetPlaceID: string,
        public color: string,
        public size: string,
        public toNode: string,
        public colorSeq: number,
        public sizeSeq: number,
        public countQty: number,
    ) {}
}


// productionRepairCount: productionRepairCount,
// productionProblemCount: productionProblemCount,
export class ProductionRepairCount {
    constructor(
        public companyID: string,
        public factoryID: string,
        public nodeID: string,
        public countProductQty: number,
    ) {}
}

export class NodeScanProduct {
    constructor(
        public companyID: string,
        public factoryID: string,
        public orderID: string,
        public fromNode: string,
        public dayMonthUTC: string,
        public style: string,
        public targetPlace: string,
        public color: string,
        public size: string,
        public countQty: number,
        public colorSeq: number,
        public sizeSeq: number,
        public targetPlaceSeq: number,
    ) {}
}

// QRCodeList
export class QRCodeList {
    constructor(
        public companyID: string,
        public factoryID: string,
        public orderID: string,
        public bundleNo: number,
        public productBarcodeNo: string,
        public productBarcodeNoReal: string,
        public productBarcodeNoReserve: string,
        public productCount: number,
        public yarnLot: YarnLot[],
        public fromNode: string,
        public toNode: string,
        public status: string,
        public productProblemID: string,
        public datetime: Date,
        public createBy: CreateBy,
    ) {}
}


// qrCodeCount
export class QRCodeCount {
    constructor(
        public companyID: string,
        public factoryID: string,
        public orderID: string,
        public nodeID: string,
        public countQty: number,

    ) {}
}

// subNodeStaffScan
export class SubNodeStaffScan {
    constructor(
        public seq: number,
        public companyID: string,
        public factoryID: string,
        public orderID: string,
        public nodeID: string,
        public subNodeID: string,
        public dayMonthUTC: string,
        public targetPlace: string,
        public color: string,
        public size: string,
        public countQty: number,

        public qrCode: string,
        public userID: string,
        public userName: string,

        public targetPlaceSeq: number,
        public colorSeq: number,
        public sizeSeq: number,

    ) {}
}

// repQTYEdit
export class RepQTYEdit {
    constructor(
        public companyID: string,
        public editType: string,
        public seasonYear: string,
        public orderID: string,
        public setName: string,
        public dataRQTYE: DataRQTYE[],
    ) {}
}

// dataRQTYE
export class DataRQTYE {
    constructor(
        public datetime: Date,
        public orderID: string,
        public color: string,
        public fromNode: string,
        public productColor: string,
        public productSize: string,
        public size: string,
        public sizeSeq: number,
        public sumProductQty: number,
        public targetPlaceID: string,
        public targetPlaceSeq: number,
        public createBy: CreateBy,
    ) {}
}

export class RepQTYEditList {
    constructor(
        public companyID: string,
        public editType: string,
        public seasonYear: string,
        public orderID: string,
        public setName: string,

        public fromNode: string,
        public color: string,
        public productColor: string,
        public productSize: string,
        public size: string,
        public sizeSeq: number,
        public targetPlaceID: string,
        public targetPlaceSeq: number,
        public sumProductQty: number,
    ) {}
}
