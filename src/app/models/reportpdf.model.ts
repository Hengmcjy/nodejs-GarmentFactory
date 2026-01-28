

export class BundleStatePDF {
    constructor(
        public companyID: string,
        public orderID: string,

        public targetPlaceID: string,
        public targetPlaceName: string,
        public targetPlaceSeq: number,

        public color: string,
        public colorName: string,
        public colorSeq: number,

        public bundleNo: number,

        public size: string,
        public sizeSeq: number,

        public nodeIDCurrent: string,  // ## current state nodeID where it is
        public completed: boolean,  // ## y= completed , n= not completed

        public groupNamePDF: string,
        public groupScanID2: string,


        public nodeGroupScanID2: NodeGroupScanID2[],
        public productCount: number,
    ) {}
}

export class NodeGroupScanID2 {
    constructor(
        public nodeID: string, // ## 1.COMPUTER-KNITTING 2.PANAL-INSPECTION 3.LINKING 4.MENDING 5.WASHING 6.PRESSING 7.QC
        public sumProductQty: number,
        public userID: string,  // ## userID scan / who scan
        public groupScanID2: string, // ## TN TL SD S2  S2=boda
        public status: string,  // ## done= finished of this node,  '-'= not finished yet
    ) {}
}

export class BundleStatePDFRow {
    constructor(
        public rowState: string, // ## d=detail
        public groupNamePDF: string,
        public rowNo: number, // ## row number
        public bundleNo: number,
        public size: string,
        public productCount: number,

        public knitting: string,
        public panal: string,
        public linking: string,
        public mending: string,
        public washing: string,
        public pressing: string,
        public qc: string,
    ) {}
}



// export class CurrentProductionBundleState {
//     constructor(
//         public companyID: string,
//         public style: string,
//         public orderID: string,
//         public bundleNo: number,
//         public productCount: number,
//         public targetPlaceID: string,
//         public targetPlaceName: string,
//         public color: string,
//         public size: string,
//         public fromNode: string,
//         public sumProductQty: number,
//         public colorSeq: number,
//         public colorName: string,
//         public sizeSeq: number,
//         public targetPlaceSeq: number,
//         public groupScanID2: string, // ## TL TN SD S2
//     ) {}
// }
