/* eslint-disable eol-last */


// ## Product
export class Product {
    constructor(
        public productID: string,
        public productName: string,
        public productDetail: string,
        public productGroupCode: string,
        public productCustomerCode: string,
        public productFeature: ProductFeature[],
        public seasonYear: string,
        public companyID: string,
        public imageProfile: string,
        public pdPic: string[],
        // public productsize: string[],
        // public productcolorSet: string[],

    ) {}
}

// ## ProductImageProfiles
export class ProductImageProfiles {
    constructor(
        public productID: string,
        public imageProfile: string,
    ) {}
}

export class ProductFeature {
    constructor(
        public featureName: string,
        public featureDetail: string,
    ) {}
}



// export class PDPic {
//     constructor(
//         public albumID: string,
//         public albumName: string,
//         public picName: string[],
//     ) {}
// }


