/* eslint-disable eol-last */
import { Company, TokenSet, CreateBy } from './app.model';
import { OutsourceData } from './order.model';

// ## nodeStation
export class NodeStation {
    constructor(
        public companyID: string,
        public factoryID: string,
        public nodeID: string,
        public nodeName: string,
        public status: string,
        public nodeInfo: NodeInfo,
        public userNode: UserNode[],
        public nStation: NStation,
        public nodeProblem: NodeProblem[],
    ) {}
}

export class NStation {
    constructor(
        public stationNo: number,
        public loginList: LoginList[],

    ) {}
}

export class LoginList {
    constructor(
        public stationID: string,
        public userID: string,
        public userName: string,
        public datetime: Date,
    ) {}
}

// ## nodeInfo
export class NodeInfo {
    constructor(
        public nodeType: string,
        public mustBundleScan: boolean,
        public haveSubWorkflow: boolean,
        public scan1ForAll: boolean,
        public location: string,
        public nodeDescription: string,
        public pic: string[],
        public registDate: Date,
        public createBy: CreateBy
    ) {}
}

// ## userNode
export class NodeProblem {
    constructor(
        public problemID: string,
        public problemName: string,
        public problemDetail: string,
    ) {}
}
// [ nodeProblem ]   {
// 	problemID
// 	problemName
// 	problemDetail


// ## userNode
export class UserNode {
    constructor(
        public stationID: string,
        public userNodeID: string,
        public userNodePass: string,
        public uuid: string,
        public canScanNode: boolean,
        public canScanSubNode: boolean,
    ) {}
}


// ## productProblem
export class ProductProblem {
    constructor(
        public productProblemID: string,
        public productProblemName: string,
    ) {}
}

// ## nodeFlow
export class NodeFlow {
    constructor(
        public nodeFlowID: string,
        public companyID: string,
        public factoryID: string,
        public flowType: string,
        public registDate: Date,
        public editDate: Date,
        public flowCondition: FlowCondition,
        public flowSeq: FlowSeq[],
    ) {}
}

export class SubNodeflowC {
    constructor(
        public seq: number,
        public companyID: string,
        public nodeID: string,
        public subNodeID: string,
        public subNodeName: string,
    ) {}
}

// ## flowCondition
export class FlowCondition {
    constructor(
        public isFlowSequence: boolean,
    ) {}
}

// ## flowSeq
export class FlowSeq {
    constructor(
        public seqNo: number,
        public nodeID: string,
        public canScanSubNode: boolean,
    ) {}
}

// ## BundleGroupColorScan
export class BundleGroupColorScan {
    constructor(
        public color: string,
        public bundleNo: number,


    ) {}
}


export class NodeStationLoginRequest {
    constructor(
        public factoryID: string,
        public companyID: string,
        public nodeID: string,
        public stationID: string,
        public uuidUserNodeLoginWaiting: string,
        public msgTypeID: string,
        public userID: string[],
        public userClass: string[],
        public formName: string[],
        public datetime: Date,
        public expiretime: Date,
    ) {}
}


// ## for scan order product barcode
export class OrderProductionScan {
    constructor(
        public companyID: string,
        public factoryID: string,
        public nodeID: string,     // ## current nodeID
        public nodeIDNext: string,  // ## next nodeID
        public stationID: string,
        public productID: string,
        public orderID: string,
        public bundleNo: number,
        public bundleCount: number,
        public scanItem: ScanItem[],
    ) {}
}

export class ScanItem {
    constructor(
        // ## productBarcode+bundleNo+bundleCount
        public productBarcodeNundleCount: string, // ## for check product scan all complete
        public productID: string,
        public productBarcodeNo: string,
        public productBarcodeNoReal: string,
        public orderID: string,
        public isOutsource: boolean,
        public status: string,
        public bundleNo: number,
        public bundleCount: number,
        public serverCheckState: string,  // ## ok, err
    ) {}
}

// ## for scan order product barcode for outsource product barcode
export class OrderProductionReceiveOutsourceScan {
    constructor(
        public companyID: string,
        public factoryID: string,
        public nodeID: string,     // ## current nodeID
        public nodeIDNext: string,  // ## next nodeID
        public stationID: string,
        public productID: string,
        public orderID: string,
        public bundleNo: number,
        public bundleCount: number,
        public scanItemOutsourece: ScanItemOutsourece[],
    ) {}
}

export class ScanItemOutsourece {
    constructor(
        // ## productBarcode+bundleNo+bundleCount
        public factoryIDForm: string,   // ## factory of outsource
        public productBarcodeNundleCount: string, // ## for check product scan all complete
        public productID: string,
        public productBarcodeNo: string,
        public productBarcodeNoReal: string,
        public orderID: string,
        public isOutsource: boolean,
        public outsourceData: OutsourceData[],
        public status: string,
        public bundleNo: number,
        public bundleCount: number,
        public serverCheckState: string,  // ## ok, err
    ) {}
}




// // ## workLoad
// export class WorkLoad {
//     constructor(
//         public companyID: string,
//         public factoryID: string,
//         public orderID: string,
//         public productLoad: ProductLoad[],
//     ) {}
// }

// // ## workLoad
// export class ProductLoad {
//     constructor(
//         public companyID: string,
//         public factoryID: string,
//         public orderID: string,
//         public act: Act[],
//     ) {}
// }

// // ## act
// export class Act {
//     constructor(
//         public datetime: Date,
//         public actID: string,
//         public fromNode: string,
//         public toNode: string,
//         public reason: string,
//         public createBy: CreateBy
//     ) {}
// }



// // ## tokenSet
// export class TokenSet {
//     constructor(
//       public appName: string, public appVer: string,
//       public userID: string, public uuid5: string,
//       public browser: string, public browserVer: string,
//       public deviceType: string,
//       public os: string, public osVer: string
//     ) {}
//   }

// // ## uuid5 data
// export class UUID5Data {
//     constructor(
//         public userID: string,
//         public appName: string,
//         public appVer: string,
//         public browser: string,
//         public browserVer: string,
//         public deviceType: string,
//         public os: string,
//         public osVer: string
//     ) {}
// }

// // ## user
// export class User {
//     constructor(
//         public userID: string,
//         public type: string,
//         public uInfo: UInfo,
//         public uCompany: UCompany[],
//         public uFactory: UFactory[],
//         public status: string,
//         public state: string
//     ) {}
// }

// // ## uinfo
// export class UInfo {
//     constructor(
//         public userName: string,
//         public userPass: string,
//         public pic: string,
//         public tel: string,
//         public email: string,
//         public registDate: Date,
//         public lastLogin: Date
//     ) {}
// }

// // ## ucompany
// export class UCompany {
//     constructor(
//         public companyID: string,
//         public state: string,
//         public userClass: UserClass
//     ) {}
// }

// // ## ufactory
// export class UFactory {
//     constructor(
//         public factoryID: string,
//         public companyID: string, // ## from companyID
//         public state: string,
//         public userClass: UserClass
//     ) {}
// }

// export interface SigupData {
//     userID: string;
//     userPass: string;
// }

// export interface AuthData {
//     // loggingMode: boolean;
//     userID: string;
//     userPass: string;

//     tokenSet: TokenSet;
// }

// export class UserClass {
//     constructor(public userClassID: string, public userClassName: string) {}
// }
