/* eslint-disable eol-last */
import { Company, CreateBy, TokenSet } from './app.model';

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

// ## uuid5 data
export class UUID5Data {
    constructor(
        public userID: string,
        public appName: string,
        public appVer: string,
        public browser: string,
        public browserVer: string,
        public deviceType: string,
        public os: string,
        public osVer: string
    ) {}
}

// ## user
export class User {
    constructor(
        public userID: string,
        public qrCode: string,
        public type: string,
        public uInfo: UInfo,
        public uCompany: UCompany[],
        public uFactory: UFactory[],
        public status: string,
        public state: string,
        public createdAt: Date,
        public createBy: CreateBy
    ) {}
}

// ## uinfo
export class UInfo {
    constructor(
        public userName: string,
        public userPass: string,
        public addr: string,
        public pic: string,
        public tel: string,
        public email: string,
        public registDate: Date,
        public lastLogin: Date,
        public menuAuthor: MenuAuthor[],
    ) {}
}


// ## menuAuthor
export class MenuAuthor {
    constructor(
        public menuID: string,
        public menuName: string,
        public visible: boolean,
        public enable: boolean,
        public state: string,


    ) {}
}

// ## staffList
export class StaffList {
    constructor(
        public userID: string,
        public qrCode: string,
        public type: string,
        public userName: string,
        public pic: string,
        // public uFactory: UFactory[],
        // public status: string,
        // public state: string,
        // public createdAt: Date,
        // public createBy: CreateBy
    ) {}
}

// ## ucompany
export class UCompany {
    constructor(
        public companyID: string,
        public state: string,
        public userComClass: UserClass
    ) {}
}

// ## ufactory
export class UFactory {
    constructor(
        public factoryID: string,
        public companyID: string, // ## from companyID
        public state: string,
        public userFacClass: UserClass
    ) {}
}

export interface SigupData {
    userID: string;
    userPass: string;
}

export interface AuthData {
    // loggingMode: boolean;
    userID: string;
    userPass: string;

    tokenSet: TokenSet;
    uuidUserNodeLoginWaiting: string;
}

export class UserClass {
    constructor(
        public userClassID: string,
        public userClassName: string,
        public userType: string,
        public seq: number
    ) {}
}


// ## userGroupScan
export class UserGroupScan {
    constructor(
        public companyID: string,
        public factoryID: string,
        public groupScanID: string,
        public groupScanID2: string,
        public seq: number,
        public open: boolean,
        public detail: string,
        public userIDGroup: string[],
    ) {}
}

