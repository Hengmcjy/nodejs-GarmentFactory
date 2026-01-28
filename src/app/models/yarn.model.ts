/* eslint-disable eol-last */

import { Color, ColorCombo, ColorS, CreateBy } from "./app.model";
import { OutsourceData } from "./order.model";

// ## YarnLotUsage
export class YarnLotUsage {
    constructor(
        public companyID: string,
        public factoryID: string,
        public customerID: string,
        public yarnSeasonID: string,
        public yarnID: string,
        public yarnDataUUID: string,
        public yarnColorID: string,

        public status: string,
        public yarnUsage: YarnUsage[],
    ) {}
}

// ## YarnData
export class YarnData {
    constructor(
        public companyID: string,
        public factoryID: string,
        public customerID: string,
        public uuid: string,
        public yarnSeasonID: string,
        public status: string,
        public datetime: Date,
        public editDate: Date,
        public yarnID: string,
        public orderID: string[],
        public colorS: ColorS[],
        public yarnDataInfo: YarnDataInfo[],
        public yarnStatCal: YarnStatCal[],
        public yyyymmdd: string,
        public mmdd: string,

    ) {}
}

// // ## color
// export class Color {
//     constructor(
//         public colorID: string,
//         public colorName: string,
//         public colorValue: string,
//         public colorCode: string,
//     ) {}
// }

// ## yarnStatCal
export class YarnStatCal {
    constructor(
        public seq: number,
        public lineMode: string,
        public setName: string,
        public colorCombo: ColorCombo,
        public color: Color,
        public mainZoneYarn: MainZoneYarn[],
    ) {}
}

// // ## colorCombo
// export class ColorCombo {
//     constructor(
//         public seq: number,
//         public colorID: string,  // ## colorID combo / #382 ...
//         public colorName: string,  // ## colorName combo / #382 MOCHABROWNxPTTERN   ...
//         public color: Color[]
//     ) {}
// }

export class MainZoneYarn {
    constructor(
        public seq: number,
        public seqCut: number,
        public lineMode: string,
        public orderID: string,
        public color: ColorCombo,
        public sizeStr: string, // ## xs - 2xl
        public targetPlaceID: string,
        public targetPlaceName: string,
        public orderQty: number,   //
        public pcWeight: number,   // {type: mongoose.Types.Decimal128},  // weight average for  product
        public totalWeight: number,   // {type: mongoose.Types.Decimal128},  //

        public orderQtyTotal: number,
        public orderWeightTotal: number
    ) {}
}

export class DTMainZoneYarn {
    constructor(
        public lineMode: string,
        public seq: number,
        public orderID: string,
        public sizeStr: string, // ## xs - 2xl
        public targetPlaceID: string,
        public targetPlaceName: string,
        public productWeight: number,   // {type: mongoose.Types.Decimal128},
    ) {}
}

// ## YarnDataInfo
export class YarnDataInfo {
    constructor(
        public datetime: Date,
        public editDate: Date,
        public yarnDataUUID: string,
        public yarnColorID: string,
        public type: string,
        public lastEdit: boolean,
        public mode: string,
        public fromFactoryID: string,
        public toFactoryID: string,
        public isOutsource: boolean,
        public outsourceData: OutsourceData[],
        public yarnPlanWeight: number,   // {type: mongoose.Types.Decimal128},
        public yarnWeight: number,     // {type: mongoose.Types.Decimal128},

        public packageInfo: PackageInfo[],
        public yarnInfo: YarnInfo,

        public yyyymmdd: string,
        public mmdd: string,

        public setName: string,
        public colorCode: string, // ## #009
        public colorID: string,  // ## BK

        public yarnPlanWeightTotal: number,
        public yarnWeightTotal: number,
        public yarnWeightNetTotal: number,
        public yarnWeightTotalPercent: string,
        public stateLists: string[],
    ) {}
}

// ## PackageInfo
export class PackageInfo {
    constructor(
        public invoiceID: string,
        public yarnLotID: string,
        public yarnLotUUID: string,
        public coneWeight: number,
        public boxWeight: number,   // {type: mongoose.Types.Decimal128},
        public state: string,  // ## verified , wait
        public yarnBoxInfo: YarnBoxInfo[],

        public carton: number,
        public yarnPlanWeightTotal: number,
        public yarnWeightTotal: number,
        public yarnWeightDifTotal: number,
        public yarnCCWeightTotal: number,
        public yarnUseWeightTotal: number,
        public yarnTransferWeightTotal: number,
        public yarnWeightNetTotal: number,
        public yarnWeightTotalPercent: string,
        public boxIDAllVerified: boolean,

        public boxVerified: number,
        public boxWait: number,

        public yuUUID: string,

    ) {}
}

// ## yarnBoxInfo
export class YarnBoxInfo {
    constructor(
        public boxID: string,
        public boxUUID: string,
        public coneQty: number,
        public factoryID: string,  // ## current factory store
        public yarnPlanWeight: number,   // {type: mongoose.Types.Decimal128},
        public yarnWeight: number,   // {type: mongoose.Types.Decimal128},
        public yarnWeightNet: number,   // {type: mongoose.Types.Decimal128},
        public useWeight: number,   // {type: mongoose.Types.Decimal128},
        public yarnTransferWeight: number,   // {type: mongoose.Types.Decimal128},

        public weightVerified: boolean,
        public used: boolean,

        public yarnWeightTotalDifPercent: string,
        public yarnWeightDif: number,
        public cCWeight: number,  // ## cC = carton & cone weight   yarnWeightTotalDifPercent
        public state: string,  // ## new, old
        public errCode: string,
        public factoryIDBox: string,
    ) {}
}

// ## YarnInfo
export class YarnInfo {
    constructor(
        public orderID: string,
        public productBarcode: string,
        public yarnSupplierID: string,
    ) {}
}

// ## YarnUsage  yuUUID
export class YarnUsage {
    constructor(
        public datetime: Date,
        public datetimeIssue: Date,
        public yuUUID: string,
        public yarnLotID: string,
        public yarnLotUUID: string,
        public invoiceID: string,
        public usageMode: string,
        public yarnWeight: number,
        public yarnWeightNet: number,
        public useWeight: number,
        public yarnBoxInfo: YarnBoxInfo[],
        public usageInfo: UsageInfo,
    ) {}
}

// ## UsageInfo
export class UsageInfo {
    constructor(
        public setFactoryID: string[],
        public fromFactoryID: string,
        public toFactoryID: string,
        public orderID: string,
        public yarnPlanWeight: number,   // {type: mongoose.Types.Decimal128},
        public yarnInvoiceWeight: number,   // {type: mongoose.Types.Decimal128},
    ) {}
}

// ## YarnLotUsageList
export class YarnLotUsageList {
    constructor(
        public _id: string,
        public companyID: string,
        public factoryID: string,
        public customerID: string,
        public yarnSeasonID: string,
        public yarnID: string,
        public yarnColorID: string,
        public yarnDataUUID: string,

        public yyyymmdd: string,
        public mmdd: string,
        public yyyymmdd2: string,   // ## issue date
        public mmdd2: string,       // ## issue date
        public yyyymmdd3: string,   // ## issue date
        public mmdd3: string,       // ## issue date

        public datetime: Date,
        public datetimeIssue: Date,

        public yuUUID: string,
        public yarnLotID: string,
        public yarnLotUUID: string,
        public invoiceID: string,
        public usageMode: string,
        public yarnWeight: number,
        public yarnWeightNet: number,
        public useWeight: number,
        public yarnBoxInfo: YarnBoxInfo[],
        public usageInfo: UsageInfo,
        public setFactoryID: string,
        public usageSeq: number,
    ) {}
}



// ## YarnStockRow
export class YarnStockRow {
    constructor(
        public rowState: string, // ##  d=full row , sd= sub data, t=total , gt=grand total , b= blank row
        public companyID: string,
        public factoryID: string,
        public orderID: string[],
        public colorS: ColorS[],
        public yarnID: string,
        public uuid: string,
        public yarnSeasonID: string,
        public yarnColorID: string,
        public colorCode: string,
        public colorID: string,
        public colorName: string,
        public yarnDataUUID: string,

        public invoiceID: string,
        public yarnLotID: string,
        public yarnLotUUID: string,
        public toFactoryID: string,
        public yarnBoxInfo: YarnBoxInfo[],

        public carton: number,
        public yarnWeightTotal: number,
        public yarnUseWeightTotal: number,
        public yarnStockWeightTotal: number,
        public yarnWeightNetTotal: number,

        public dataInfo: YDataInfo,
    ) {}
}

// ## YDataInfo
export class YDataInfo {
    constructor(
        public factoryName: string,
        // public setFactoryID: string[],
        // public fromFactoryID: string,
        // public toFactoryID: string,
        // public yarnPlanWeight: number,   // {type: mongoose.Types.Decimal128},
        // public yarnInvoiceWeight: number,   // {type: mongoose.Types.Decimal128},
    ) {}
}

// ## Yarn
export class Yarn {
    constructor(
        public companyID: string,
        public yarnSupplierID: string,
        public customerID: string,
        public seq: number,
        public yarnSeasonID: string,
        public yarnID: string,
        public yarnName: string,
        public yarnFullName: string,
        public yarnUUID: string,
        public detail: string,

    ) {}
}

// ## Yarn season
export class YarnSeason {
    constructor(
        public companyID: string,
        public yarnSeasonID: string,
        public yarnSeasonName: string,
        public note: string,
        public show: boolean,
        public status: string,
    ) {}
}

// ## Yarn supplier
export class YarnSupplier {
    constructor(
        public companyID: string,
        public yarnSupplierID: string,
        public yarnSupplierName: string,
        public customerID: string,
        public show: boolean,
        public status: string,
        public note: string,
    ) {}
}

// ## Yarn color
export class YarnColor {
    constructor(
        public companyID: string,
        public customerID: string,
        public yarnColorID: string,
        public yarnColorName: string,
        public yarnColorValue: string,
        public show: boolean,
        public status: string,
        public note: string,
    ) {}
}


export class YarnLot {
    constructor(
        public yarnLotID: string,
        public yarnWeight: number,
    ) {}
}

// ## YarnLotInfo
export class YarnLotInfo {
    constructor(
        public companyID: string,
        public factoryID: string,
        public customerID: string,
        public yarnSeasonID: string,
        public uuid: string,
        public yarnID: string,
        public orderID: string[],
        public colorS: ColorS[],
        public yarnColorID: string,
        public yarnDataUUID: string,
        public type: string,
        public fromFactoryID: string,
        public toFactoryID: string,

        public invoiceID: string,
        public yarnLotID: string,
        public yarnLotUUID: string,
        // public yarnBoxInfo: string,

        public datetime: Date,
        public yyyymmdd: string,
        public mmdd: string,

        public yarnBoxInfo: YarnBoxInfo[],

        // public boxID: string,
        // public boxUUID: string,
        // public factoryIDBox: string,
        // public yarnPlanWeight: number,
        // public yarnWeight: number,
        // public useWeight: number,
        // public weightVerified: boolean,
        // public used: boolean,
    ) {}
}

// ## YarnDataDraft
export class YarnDataDraft {
    constructor(
        public companyID: string,
        public factoryID: string,
        public customerID: string,
        public uuid: string,
        public yarnSeasonID: string,
        public status: string,
        public datetime: Date,
        public editDate: Date,
        public yarnID: string,
        public orderID: string[],
        public colorS: ColorS,
        public yarnDataInfo: YarnDataInfoDraft,

        public yyyymmdd: string,
        public mmdd: string,

        public draftName: string,
        public draftMode: string,  // ## transfer, lockJob
        public datetimeD: Date,
        public createBy: CreateBy
    ) {}
}

// ## YarnDataInfoDraft
export class YarnDataInfoDraft {
    constructor(
        public datetime: Date,
        public editDate: Date,
        public yarnDataUUID: string,
        public yarnColorID: string,
        public type: string,

        public mode: string,
        public fromFactoryID: string,
        public toFactoryID: string,
        public yarnUsage_id: string,
        public setName: string,
        public packageInfo: PackageInfo,
    ) {}
}

// ## YarnInvoiceList
export class YarnInvoiceList {
    constructor(
        public companyID: string,
        public factoryID: string,
        public customerID: string,
        public uuid: string,
        public yarnSeasonID: string,
        public status: string,
        public datetime: Date,
        public editDate: Date,
        public yarnID: string,
        public orderID: string[],
        public colorS: ColorS[],
        // public yarnDataInfo: YarnDataInfo[],

        public yyyymmdd: string,
        public mmdd: string,

        public yarnDataUUID: string,
        public yarnColorID: string,
        public invoiceID: string,
        public yarnLotID: string,
        public yarnLotUUID: string,

        public yarnBoxInfo: YarnBoxInfo[],

        public setName: string,
        public colorCode: string,
        public colorID: string,

        public carton: number,   // ## boxes qty
        public yarnPlanWeightTotal: number,
        public yarnWeightTotal: number,
        public yarnWeightDif: number,

        public coneWeight: number,
        public boxWeight: number,
        public yarnWeightDifTotal: number,
        public yarnCCWeightTotal: number,
        public yarnTransferWeightTotal: number,
        public yarnWeightNetTotal: number,

        public yarnWeightTotalPercent: string,
        public yarnWeightTotalDifPercent: string,

    ) {}
}

// mmddTotalFooter: any[] = []; // ## footer for plan ETD // ## { mmdd: '11-01', total: 0.00}
// colorTotalPlan: any[] = []; // ## total plan by color // ##  { setname: 'muji', colorCode: '#011', colorID: 'IV', total: 0.00}

export class MMDDTotalFooter {
    constructor(
        public mmdd: string,
        public total: number,
        public totalNet: number,
    ) {}
}

export class ColorTotalPlan {
    constructor(
        public setName: string,
        public colorCode: string,
        public colorID: string,
        public total: number,
        public totalNet: number,
    ) {}
}


// ## PDF zone #####################################################################################

// ## YarnReceiveMain
export class YarnReceiveMain {
    constructor(
        public rowState: string, // ## d=data , b  = blank row , t = total row, gt = grand total

        public yyyymmdd: string,  // ## date confirm , verified
        public mmdd: string,
        public toFactoryID: string,

        public yarnColorID: string,
        public yarnDataUUID: string,
        public setName: string,
        public colorCode: string,
        public colorID: string,
        public colorName: string,

        // public packageInfo: PackageInfo[],
        public invoiceID: string,
        public yarnLotID: string,
        public yarnLotUUID: string,

        public carton: number,   // ## boxes qty
        public yarnPlanWeightTotal: number,
        public yarnWeightTotal: number,
        public yarnWeightDif: number,

        public coneWeight: number,
        public boxWeight: number,
        public yarnWeightDifTotal: number,
        public yarnCCWeightTotal: number,
        public yarnTransferWeightTotal: number,
        public yarnWeightNetTotal: number,

        public yarnWeightTotalPercent: string,
    ) {}
}



// ## YarnPacking list , box data
export class YarnPackingList {
    constructor(
        public rowState: string, // ##

        public yyyymmdd: string,  // ## date confirm , verified
        public mmdd: string,
        public toFactoryID: string,

        public yarnID: string,
        public yarnColorID: string,
        public yarnDataUUID: string,
        public setName: string,
        public colorCode: string,
        public colorID: string,

        public invoiceID: string,
        public yarnLotID: string,
        public yarnLotUUID: string,

        public coneWeight: number,
        public boxWeight: number,
        public carton: number,   // ## boxes qty
        public yarnPlanWeightTotal: number,
        public yarnWeightTotal: number,
        public yarnWeightDifTotal: number,
        public yarnCCWeightTotal: number,
        public yarnTransferWeightTotal: number,
        public yarnWeightNetTotal: number,
        public yarnWeightTotalPercent: string,
        public boxIDAllVerified: boolean,

        public yarnBoxInfo: YarnBoxInfo[],

    ) {}
}


// ## YarnInvoiceRow
export class YarnInvoiceRow {
    constructor(
        public rowState: string, // ##
        public yyyymmdd: string,  // ## date confirm , verified , date arrive factory
        public mmdd: string,

        public yarnID: string,
        public toFactoryID: string,
        public invoiceID: string,

        public yarnColorID: string,
        public setName: string,
        public colorCode: string,
        public colorID: string,
        public colorName: string,

        public yarnLotID: string,
        public yarnLotUUID: string,

        public yarnBoxInfo: YarnBoxInfo[],

        public carton: number,   // ## boxes qty
        public yarnPlanWeightTotal: number,
        public yarnWeightTotal: number,
        public yarnWeightDif: number,
        public yarnWeightTotalPercent: string,
        public yarnWeightTotalDifPercent: string,

        public coneWeight: number,
        public boxWeight: number,
        public yarnWeightDifTotal: number,
        public yarnCCWeightTotal: number,
        public yarnTransferWeightTotal: number,
        public yarnWeightNetTotal: number,

    ) {}
}

// ## YarnLotUsageRow
export class YarnLotUsageRow {
    constructor(
        public usageMode: string, // ## ct= fromCustomer , t=transfer , p=produce
        public factoryID: string,
        public ddmmyyyy: string,
        public ddmmyyyyIssue: string,
        public issueNote: string,
        public invoiceID: string,
        public yarnColorID: string,
        public yarnDataUUID: string,
        public yarnSeasonID: string,
        public yuUUID: string,
        public yarnLotID: string,
        public yarnLotUUID: string,
        public yarnInvoiceWeight: number,   //
        public yarnWeight: number,   //
        public yarnWeightNet: number,
        public useWeight: number,
        public usageInfo: UsageInfo,

        public toFactoryID: string,
        public orderID: string,
        public orderID2: string,
        public targetPlaceID: string,
        public yarnLotID2: string,
        public yarnLotUUID2: string,
        public pcs: number,
        public useYarnWeight: number,

        public yarnBoxInfo: YarnBoxInfo[],

        public usageSeq: number,
        public balance: number,

        public yyyymmdd: string,
        public yyyymmddIssue: string,
    ) {}
}

// ## yarnStockCardPCS
export class YarnStockCardPCS {
    constructor(
        public companyID: string,
        public yarnSeasonID: string,
        public yarnID: string,
        public yarnColorID: string,
        public type: string,
        public dataPCS: DataPCS[],
        public dataZONE: DataZONE[],
    ) {}
}

// ## DataPCS
export class DataPCS {
    constructor(
        public ddmmyyyy: string, // ##
        public usageMode: string,
        public orderID: string,
        public toFactoryID: string,
        public invoiceID: string,
        public yarnBoxInfoLen: number,

        public yarnLotID2: string,
        public yarnDataUUID: string,
        public yarnLotUUID: string,
        public yuUUID: string,

        public pcs: number,
        public createBy: CreateBy,
    ) {}
}

// ## DataZONE
export class DataZONE {
    constructor(
        public ddmmyyyy: string, // ##
        public usageMode: string,
        public orderID: string,
        public toFactoryID: string,
        public invoiceID: string,
        public yarnBoxInfoLen: number,

        public yarnLotID2: string,
        public yarnDataUUID: string,
        public yarnLotUUID: string,
        public yuUUID: string,

        public targetPlaceID: string,
        public createBy: CreateBy,
    ) {}
}

// ## YarnTransferUsageRow
export class YarnTransferUsageRow {
    constructor(
        public _id: string,
        public rowState: string, // ##
        public ddmmyyyy: string,
        public yarnID: string,
        public yarnIDRowSpan: number, // ##
        public orderID: string,
        public fromFactoryID: string,
        public toFactoryID: string,
        public factoryName: string,

        public colorCode: string,
        public colorID: string,
        public colorName: string,

        public invoiceID: string,
        public yarnColorID: string,
        public yarnDataUUID: string,
        public yuUUID: string,

        public yarnLotID: string,
        public yarnLotUUID: string,

        public yarnBoxInfo: YarnBoxInfo[],

        public yarnTransferUsageGroupRow: YarnTransferUsageGroupRow,

        public carton: number,   // ## boxes qty
        public yarnWeightTotal: number,
        public yarnUseWeightTotal: number,
        public yarnTransferWeightTotal: number,
        public yarnWeightNetTotal: number,
    ) {}
}

// ## YarnTransferUsageGroupRow
export class YarnTransferUsageGroupRow {
    constructor(
        public yyyymmdd2: string,   // ## issue date
        public ddmmyyyy: string,
        public orderID: string,
        public yarnID: string,
        public fromFactoryID: string,
        public toFactoryID: string,
    ) {}
}


// ## yarn subject

export class YarnReportSubject {
    constructor(
        public yarnID: string,
        public yarnReportID: string,
        // public colorID: string,
        // public total: number,
    ) {}
}
