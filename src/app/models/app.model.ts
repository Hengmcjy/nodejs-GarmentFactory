import { Customer, Order, OrderProduction, TargetPlace } from "./order.model";
import { Product } from "./product.model";
import { User } from "./user.model";

// ## ModeRes from nodejs
export class ModeRes {
    constructor(
        public messageID: string,
        public mode: string,
        public value: string
    ) {}
}


export class ControlApp {
    constructor(
        public clientControl: ClientControl,
        // public outSourceLocationDepartment: OutSourceLocationDepartment[],
    ) {}
}

// ## OutSourceLocationDepartment
export class OutSourceLocationDepartment {
    constructor(
        public companyID: string,
        public factoryID: string,
        public nodeID: string,
        public stationID: string,
        public scanOutsource: boolean,
    ) {}
}

// clientControl
export class ClientControl {
    constructor(
        public ioID: string,
        public washingAndPressingMerge: boolean,

    ) {}
}

export type CommandAroundAppName = 'showUserNodeRequestLogin' | 'getNodeStationLoginRequest' | 'openSystemInfo';
export class CommandAroundApp {
    constructor(
        public showUserNodeRequestLogin: boolean,
        public getNodeStationLoginRequest: boolean,
        public openSystemInfo: boolean,
    ) {}
}

// export type PropDataAppNode = 'refreshCurrentPage' | 'isOutsourceMode';
export class DataAroundNodeApp {
    constructor(
        public refreshCurrentPage: boolean,
        public refreshPage: string,  // ## page name
        public isOutsourceMode: boolean,
        public isFactoryAffiliate: boolean, // ## isFactoryAffiliate
        public isScanSubnode: boolean,
    ) {}
}

// ## DataAroundApp
export class DataAroundApp {
    constructor(

        public iconConfigShow: boolean,
        public isAuthenticated: boolean,
        public ioID: string,
        public user: User,
        public userID: string,
        public langs: Language[],  // ## list languages
        public lang: string,
        public screenWidth: number,
        public screenSize: string,
        public formActive: string,
        public company: Company,
        public factory: Factory,
        public factorySelect: Factory,
        public product: Product,
        public customer: Customer,
        public order: Order,
        public seasonYear: string,
        public yarnSeason: string,

        public orderProductionInfo: OrderProductionInfo,

        public menuTestvisible: boolean,
    ) {}
}

export class OrderProductionInfo {
    constructor(
        public orderProduction: OrderProduction,
        // public cDescription: string,
        // public cInfo: CInfo
    ) {}
}

// ## company
export class Company {
    constructor(
        public companyID: string,
        public seasonYear: string,  // ## current season year
        public cDescription: string,
        public cInfo: CInfo
    ) {}
}

export class CInfo {
    constructor(
        public companyName: string,
        public abbreviation: string,
        public pic: string,
        public tel: string,
        public email: string,
        public registDate: Date,
        public createBy: CreateBy
    ) {}
}

export class CreateBy {
    constructor(public userID: string, public userName: string) {}
}

// ## factory
export class Factory {
    constructor(
        public factoryID: string,
        public fDescription: string,
        public companyID: string,
        public show: boolean,
        public fInfo: FInfo,
        public nodeStationSetting: NodeStationSetting
    ) {}
}

export class FInfo {
    constructor(
        public factoryName: string,
        public factoryName2: string,
        public abbreviation: string,
        public pic: string,
        public tel: string,
        public email: string,
        public registDate: Date,
        public isOutsource: boolean,
        public createBy: CreateBy
    ) {}
}

// nodeStationSetting: {
//     scanNode: [{   // ## for special setting for temp time (computer not ready to use in every node department)
//       nodeID : {type: String},
//       active : {type: Boolean},
//       nodeIDSetting: [{type: String}]
//     }],
//   },
export class NodeStationSetting {
    constructor(
        public scanNode: ScanNode[],
    ) {}
}

export class ScanNode {
    constructor(
        public nodeID: string,
        public lastNodeID: string,
        public active: boolean,
        public nodeIDSetting: string[],
        public stationID: string,
    ) {}
}

// ## tokenSet
export class TokenSet {
    constructor(
        public appName: string,
        public appVer: string,
        public userID: string,
        public uuid5: string,
        public browser: string,
        public browserVer: string,
        public deviceType: string,
        public os: string,
        public osVer: string
    ) {}
}

// ## general info
export class GeneralInfo {
    constructor(
        public appVer: string,
        public appName: string,
        public appMail: string
    ) {}
}

// ## message socket IO
// ## format of massageIO
export class IOSend {
    constructor(
        public userID: string,
        public socketID: string,
        public mode: string,
        public message: IOMessage
    ) {}
}
export class IOMessage {
    // ## messageID = id for do function
    // ## message = value
    constructor(public messageID: string, public message: string) {}
}

// ## screen
export class ScreenInfo {
    constructor(
        public screenWidth: number,
        public screenHeight: number,
        public screenSize: string
    ) {}
}

// ## colorS
export class ColorS {
    constructor(
        public companyID: string,
        public seq: number,
        public setName: string,
        public color: Color
    ) {}
}

// ## color
export class Color {
    constructor(
        public colorID: string,
        public colorName: string,
        public colorValue: string,
        public colorCode: string,
    ) {}
}

// ## colorCombo
export class ColorCombo {
    constructor(
        public colorID: string,
        public colorName: string,
        public colorValue: string,
        public colorCode: string,
        public colorComboID: string,
        public colorComboName: string,
    ) {}
}

// ## sizeS
export class SizeS {
    constructor(
        public seq: number,
        public size: Size
    ) {}
}

// ## size
export class Size {
    constructor(
        public sizeID: string,
        public sizeName: string
    ) {}
}

// ## sizeS
export class TargetPlaceS {
    constructor(
        public seq: number,
        public targetPlace: TargetPlace
    ) {}
}

export class OrderTargetPlaceS {
    constructor(
        public seq: number,
        public deliveryDate: Date,
        public targetPlace: TargetPlace
    ) {}
}

// ## languageData
export class Language {
    constructor(
        public languageID: string,
        public languageName: string,
        public seq: Number,
        public show: Boolean,
        public languageData: LanguageData[],
    ) {}
}

// ## languageData
export class LanguageData {
    constructor(
        public Idno: number,
        public lType: string,
        public lID: string,
        public lText: string,
    ) {}
}

// ## languageType
export class LanguageType {
    constructor(
        public lType: string,
        public lTypeName: string
    ) {}
}







// msgTypeID: '',  // ## msgID = message type
//     sendIO: {
//       userIO: {
//         uAll: false,
//         userClass: [],  //
//         userIDs: [],  //
//       },
//       companyIO: {
//         comAll: false,
//         companyID: []
//       },
//       factoryIO: {
//         facAll: false,
//         factoryID: []
//       }
//     },
//     toFormIO: {
//       frmAll: false,
//       formName: [],
//     },
//     dataIO: {
//       // ## data messagee any
//       // ## data structure depend on function
//     }

// dataMsgIO
export class DataMsgIO {
    constructor(
        public msgTypeID: string,
        public sendIO: SendIO,
        public toFormIO: ToFormIO,
        public dataIO: DataIO,
    ) {}
}

// sendIO
export class SendIO {
    constructor(
        public userIO: UserIO,
        public companyIO: CompanyIO,
        public factoryIO: FactoryIO,
    ) {}
}

// userIO
export class UserIO {
    constructor(
        public uAll: boolean,
        public userClass: string[],
        public userID: string[]
    ) {}
}

// companyIO
export class CompanyIO {
    constructor(
        public comAll: boolean,
        public companyID: string[]
    ) {}
}

// factoryIO
export class FactoryIO {
    constructor(
        public facAll: boolean,
        public factoryID: string[]
    ) {}
}

// toFormIO
export class ToFormIO {
    constructor(
        public frmAll: boolean,
        public formName: string[]
    ) {}
}

// ## data structure depend on function
// ## many format data object
// dataIO
export class DataIO {
    constructor(
        // public frmAll: boolean,
        // public formName: string[]
    ) {}
}

// // systemInfo
// export class SystemInfo {
//     constructor(
//         public mgdb: string,
//         // public formName: string[]
//     ) {}
// }

export class SysInfo {
    constructor(
        public id: string,
        public data: string,
    ) {}
}

// ## UnitSize
export class UnitSize {
    constructor(
        public companyID: string,
        public seq: number,
        public sizeID: string,
        public sizeName: string,
        public sizeFullName: string,
        public detail: string,

    ) {}
}

// ## UnitWeight
export class UnitWeight {
    constructor(
        public companyID: string,
        public seq: number,
        public weightID: string,
        public weightName: string,
        public weightFullName: string,
        public detail: string,

    ) {}
}


// ## ProductBox
export class ProductBox {
    constructor(
        public companyID: string,
        public seq: number,
        public pdBoxID: string,
        public pdBoxName: string,
        public pdBoxFullName: string,
        public dimension: string,
        public sizeID: string,
        public detail: string,

    ) {}
}




// ## DataTAbleFAcAllScanNode
export class DataTAbleFAcAllScanNode {
    constructor(
        public orderID: string,
        public nodeIDs: DataTAbleFAcAllScanNodeNode[],
        // public node2: DataTAbleFAcAllScanNodeNode,
        // public node3: DataTAbleFAcAllScanNodeNode,
        // public node4: DataTAbleFAcAllScanNodeNode,
        // public node5: DataTAbleFAcAllScanNodeNode,
        // public node6: DataTAbleFAcAllScanNodeNode,
        // public node7: DataTAbleFAcAllScanNodeNode,
        // public node8: DataTAbleFAcAllScanNodeNode,
        // public node9: DataTAbleFAcAllScanNodeNode,
        // public node10: DataTAbleFAcAllScanNodeNode,
        // public node11: DataTAbleFAcAllScanNodeNode,
        // public node12: DataTAbleFAcAllScanNodeNode,
    ) {}
}

// ## DataTAbleFAcAllScanNodeNode
export class DataTAbleFAcAllScanNodeNode {
    constructor(
        public nName: string,
        public nTotal: number,
        public fData: DataTAbleFAcAllScanNodeFData[],
    ) {}
}

// ## DataTAbleFAcAllScanNode
export class DataTAbleFAcAllScanNodeFData {
    constructor(
        public factoryID: string,
        public facName: string,
        public fTotalQty: number,
    ) {}
}





//  ########################################################################################################
//  ##  Authorize   ########################################################################################

// ## Authorize
export class Authorize {
    constructor(
        public companyID: string,
        public aUser: string,  // ## web , nodeWeb
        public aPage: string,  // ## adm , user-node , user-office ,
        public authorizeL: AuthorizeL[],
    ) {}
}

// ## AuthorizeL
export class AuthorizeL {
    constructor(
        public position: string,  // ##  top , right , ledt , buttom, body
        public aGroup: string,  // ## menu ,  companyBody , factoryBody , ….
        public authL: AuthL[],
    ) {}
}

// ## AuthL
export class AuthL {
    constructor(
        public seq: number,
        public aName: string,
        public show: boolean,
        public disable: boolean,
    ) {}
}


//  ##  Authorize   ########################################################################################
//  ########################################################################################################


