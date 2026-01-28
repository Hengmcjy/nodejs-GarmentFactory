

export class BundleStateBoard {
    constructor(
        public companyID: string,
        public orderID: string,

        public bundleAllCount: number,
        public qtyAll: number,

        public bundleStateTargetPlaceBoard: BundleStateTargetPlaceBoard[],

        // public targetPlaceID: string,
        // public targetPlaceName: string,
        // public targetPlaceSeq: number,

        // public bundleCount: number,
        // public qty: number,
    ) {}
}

export class BundleStateTargetPlaceBoard {
    constructor(
        public targetPlaceID: string,
        public targetPlaceName: string,
        public targetPlaceSeq: number,

        public bundleCount: number,
        public qty: number,
    ) {}
}


// export class NodeGroupScanID2 {
//     constructor(
//         public nodeID: string, // ## 1.COMPUTER-KNITTING 2.PANAL-INSPECTION 3.LINKING 4.MENDING 5.WASHING 6.PRESSING 7.QC
//         public sumProductQty: number,
//         public userID: string,  // ## userID scan / who scan
//         public groupScanID2: string, // ## TN TL SD S2  S2=boda
//         public status: string,  // ## done= finished of this node,  '-'= not finished yet
//     ) {}
// }

// export class BundleStatePDFRow {
//     constructor(
//         public rowState: string, // ## d=detail
//         public groupNamePDF: string,
//         public rowNo: number, // ## row number
//         public bundleNo: number,
//         public size: string,
//         public productCount: number,

//         public knitting: string,
//         public panal: string,
//         public linking: string,
//         public mending: string,
//         public washing: string,
//         public pressing: string,
//         public qc: string,
//     ) {}
// }



