import { Authorize, ColorS, Company, DataTAbleFAcAllScanNode, DataTAbleFAcAllScanNodeNode, Factory, Language, TokenSet } from "../models/app.model";
import { DBox, DCarton, DCountry, DPacking, DPCarton } from "../models/carton.model";
import { BundleStateBoard } from "../models/infoBroard.model";
import { BundleSetGroup, Customer, OrLost, Order, OrderProduction, OrderProductionQueue, OrderProductionQueueBundleNo, OrderProductionQueueList, OrderSubNodeFlowCost, OutsourceData, ProductORInfo, ProductORRewriteInfo, ProductionZonePeriodRow, QueueInfoList, SubNodeFlow, SubNodeFlowCost, TargetPlace } from "../models/order.model";
import { Product } from "../models/product.model";
import { DataRQTYE, QRCodeCount, RepQTYEdit } from "../models/report.model";
import { BundleStatePDF, BundleStatePDFRow, NodeGroupScanID2 } from "../models/reportpdf.model";
import { StaffList, User, UserGroupScan } from "../models/user.model";
import { NodeFlow, NodeStation, NodeStationLoginRequest, OrderProductionReceiveOutsourceScan, OrderProductionScan, UserNode } from "../models/workstation.model";
import { MainZoneYarn, PackageInfo, Yarn, YarnBoxInfo, YarnData, YarnDataDraft, YarnDataInfo, YarnInvoiceRow, YarnLotInfo, YarnLotUsage, YarnLotUsageList, YarnLotUsageRow, YarnPackingList, YarnReceiveMain, YarnStatCal, YarnStockCardPCS, YarnStockRow, YarnTransferUsageRow, YarnUsage } from "../models/yarn.model";

// ## GBC global constant
export class GBC {

    public static sweaterGCSPath = 'https://storage.googleapis.com/mystoragegarment/sweater.png';
    public static sweaterGCSPath2 = 'https://storage.googleapis.com/mystoragegarment/koj-logo.png';

    public static nulltGCSPath = 'https://storage.googleapis.com/mystoragegarment/wait.png';
    public static selectOneGCSPath = 'https://storage.googleapis.com/mystoragegarment/selectOne.png';

    public static userGCSPath = 'https://storage.googleapis.com/garmentusergarmentworld1sthighquality/';
    public static userImageProfileGCSPath = 'https://storage.googleapis.com/garmentusergarmentworld1sthighquality/imageProfile/';

    public static companyFactoryGCSPath = 'https://storage.googleapis.com/companyfactorygarmentworld1sthighquality/';
    public static companyFactoryImageProfileGCSPath = 'https://storage.googleapis.com/companyfactorygarmentworld1sthighquality/imageProfile/';

    // ## product
    // ## google storage path
    public static productGCSPath = 'https://storage.googleapis.com/garmentproductgarmentworld1sthighquality/';
    public static productImageProfileGCSPath = 'https://storage.googleapis.com/garmentproductgarmentworld1sthighquality/imageProfile/';

    // ## customer
    // ## google storage path
    public static customerGCSPath = 'https://storage.googleapis.com/garmentcustomergarmentworld1sthighquality/';
    public static customerImageProfileGCSPath = 'https://storage.googleapis.com/garmentcustomergarmentworld1sthighquality/imageProfile/';

    // // ## customer
    // // ## google storage path
    // public static customerGCSPath = 'https://storage.googleapis.com/garmentcustomergarmentworld1sthighquality/';
    // public static customerImageProfileGCSPath = 'https://storage.googleapis.com/garmentcustomergarmentworld1sthighquality/imageProfile/';

    // // ## tokenSet
    // public static clrTokenSet() {
    //     const tokenSet: TokenSet = {
    //     appName: this.appName,
    //     appVer: this.appVer,
    //     userID: this.userID,
    //     uuid5: this.uuid5,
    //     browser: '',
    //     browserVer: '',
    //     deviceType: '',
    //     os: '',
    //     osVer: '',
    //     };
    //     return tokenSet;
    // }

    // ## Language
    public static clrLanguage() {
        const language: Language = {
            languageID: '',
            languageName: '',
            seq: -1,
            show: false,
            languageData: []
        };
        return language;
    }

    // ## colors
    public static clrOrderColor() {
        const language: ColorS = {
            companyID: '',
            seq:-1,
            setName: '',
            color: {
                colorID: '',
                colorName: '',
                colorValue: '',
                colorCode: '',
            }
        };
        return language;
    }

    // ## clr UserGroupScan
    public static clrUserGroupScan() {
        const userGroupScan: UserGroupScan = {
            companyID: '',
            factoryID: '',
            groupScanID: '',
            groupScanID2: '',
            seq: 0,
            open: false,
            detail: '',
            userIDGroup: [],

        };
        return userGroupScan;
    }

    // ## clr Authorize
    public static clrAuthorize() {
        const userGroupScan: Authorize = {
            companyID: '',
            aUser: '',
            aPage: '',
            authorizeL: [],

        };
        return userGroupScan;
    }

    // ## clr user
    public static clrUser() {
        const user: User = {
            userID: '',
            qrCode: '',
            type: '',
            uInfo: {
                userName: '',
                userPass: '',
                addr:'',
                pic: '',
                tel: '',
                email: '',
                registDate: new Date(),
                lastLogin: new Date(),
                menuAuthor: []
            },
            uCompany: [],
            uFactory: [],
            status: '',
            state: '',
            createdAt: new Date(),
            createBy: {
                userID: '',
                userName: ''
            }
        };
        return user;
    }


    // clrStaffList
    public static clrStaffList() {
        const user: StaffList = {
            userID: '',
            qrCode: '',
            type: '',
            userName: '',
            pic: '',
        };
        return user;
    }

    public static clrCompany() {
        const company: Company = {
            companyID: '',
            seasonYear: '',
            cDescription: '',
            cInfo: {
                companyName: '',
                abbreviation: '',
                pic: '',
                tel: '',
                email: '',
                registDate: new Date(),
                createBy: {
                    userID: '',
                    userName: ''
                }
            }
        };
        return company;
    }

    public static clrFactory() {
        const factory: Factory = {
            factoryID: '',
            fDescription: '',
            companyID: '',
            show: false,
            fInfo: {
                factoryName: '',
                factoryName2: '',
                abbreviation: '',
                pic: '',
                tel: '',
                email: '',
                registDate: new Date(),
                isOutsource: false,
                createBy: {
                    userID: '',
                    userName: ''
                }
            },
            nodeStationSetting: {
                scanNode: []
            }
        };
        return factory;
    }

    // clrOutsourceData
    public static clrOutsourceData() {
        const outsourceData: OutsourceData = {
            factoryID: '',
            fromFactoryID: '',
            datetime: new Date(),
        };
        return outsourceData;
    }

    public static clrCustomer() {
        // console.log('clrCustomer');
        const customer: Customer = {
            customerID: '',
            customerName: '',
            setName: '',
            companyID: '',
            registDate: new Date(),
            imageProfile: '',
            cusInfo: {
                customerDetail: '',
                email: '',
                tel: '',
                web: '',
                pic: '',
                createBy: {
                    userID: '',
                    userName: ''
                }
            }
        };
        return customer;
    }

    // ## TargetPlace
    public static clrTargetPlace() {
        const targetPlace: TargetPlace = {
            targetPlaceID: '',
            targetPlaceName: '',
            countryID: '',
            countryName: '',
        };
        return targetPlace;
    }

    // ## clrBundleSetGroup
    public static clrBundleSetGroup() {
        const bundleSetGroup: BundleSetGroup = {
            companyID: '',
            uuid: '',
            completed: false,
            seq: 1,
            groupName: '',
            seasonYear: '',
            orderID: '',
            setName: '',
            targetPlaceID: '',
            color: {
                colorID: '',
                colorName: '',
                colorValue: '',
                colorCode: '',
            },
            yarnLotID: '',
            bundleNoSet: '',
            bundleNoQty: 0,
            datetime: new Date(),
            createBy: {
                userID: '',
                userName: ''
            }
        };
        return bundleSetGroup;
    }



    // ## clrOrder
    public static clrOrder() {
        const order: Order = {
            orderID: '',
            seasonYear: '',
            ver: 0,
            orderDetail: '',
            orderDate: new Date(),
            deliveryDate: new Date(),
            companyID: '',
            factoryID: '',
            bundleNo: 1,
            orderstatus: 'close',
            customerOR: {
                customerID: '',
                customerName: ''
            },
            orderTargetPlace: [],
            orderColor: [],
            productOR: {
                productID: '',
                productName: '',
                productORDetail: '',
                productCustomerCode: '',
                productORInfo: [],
                productORRewriteInfo: [],
                subNodeFlowCost: [],
            },
            createBy: {
                userID: '',
                userName: ''
            },
            orderSetting: {
                qtyMaxView: [],
            },
        };
        return order;
    }


    // ## clrOrderProduction
    public static clrOrderProduction() {
        const orderProduction: OrderProduction = {
            companyID: '',
            factoryID: '',
            orderID: '',
            ver: 0,
            open: false,
            bundleNo: 0,
            bundleID: '',
            productID: '',
            productBarcodeNo: '',
            productBarcodeNoReal: '',
            productBarcodeNoReserve: [],
            targetPlace: {
                targetPlaceID: '-',
                targetPlaceName: '-',
                countryID: '-',
                countryName: '-',
            },
            productCount: 0,
            productionDate: new Date(),
            productStatus: '',
            orLost: {
                datetime: new Date(),
                odpLostID: '',
                lostGroupID: '',
                nodeID: [],
                note: '',
                createBy: {
                    userID: '',
                    userName: ''
                }
            },
            forLoss: false,
            isOutsourceTracking: false,
            yarnLot: [],
            outsourceData: [],
            subNodeFlow: [],
            productionNode: [],
        };
        return orderProduction;
    }

    public static clrOrLost() {
        const orLost: OrLost = {
            datetime: new Date(),
                odpLostID: '',
                lostGroupID: '',
                nodeID: [],
                note: '',
                createBy: {
                    userID: '',
                    userName: ''
                }
        };
        return orLost;
    }

    // ## clrOrderProductionScan
    public static clrOrderProductionScan() {
        const orderProductionScan: OrderProductionScan = {
            companyID: '',
            factoryID: '',
            orderID: '',
            productID: '',
            nodeID: '',
            nodeIDNext: '',
            stationID: '',
            bundleNo: 0,
            bundleCount: 0,
            scanItem: [],
        };
        return orderProductionScan;
    }

    // OrderProductionReceiveOutsourceScan
    public static clrOrderProductionReceiveOutsourceScan() {
        const orderProductionScan: OrderProductionReceiveOutsourceScan = {
            companyID: '',
            factoryID: '',
            orderID: '',
            productID: '',
            nodeID: '',
            nodeIDNext: '',
            stationID: '',
            bundleNo: 0,
            bundleCount: 0,
            scanItemOutsourece: [],
        };
        return orderProductionScan;
    }


    // ## clrProduct
    public static clrProduct() {
        const product: Product = {
            productID: '',
            productName: '',
            productDetail: '',
            productGroupCode: '',
            productCustomerCode: '',
            productFeature: [],
            seasonYear: '',
            companyID: '',
            imageProfile: '',
            pdPic: [],
            // productsize: [],
            // productcolorSet: [],

        };
        return product;
    }

    // ## clrProductORInfo
    public static clrProductORInfo() {
        const productORInfo: ProductORInfo = {
            factoryID: '',
            productBarcode: '-',
            targetPlace: {
                targetPlaceID: '-',
                targetPlaceName: '-',
                countryID: '-',
                countryName: '-',
            },
            productColor: '-',
            productSize: '-',
            productQty: 0,
            productLossQty: 0,
            productYear: '-',
            productSex: '-',
            sizeSeq: 0,
        };
        return productORInfo;
    }

    // ## clrProductORRewriteInfo  productORRewriteInfo
    public static clrProductORRewriteInfo() {
        const productORRewriteInfo: ProductORRewriteInfo = {
            datetime: new Date(),
            productBarcode: '-',
            targetPlace: {
                targetPlaceID: '-',
                targetPlaceName: '-',
                countryID: '-',
                countryName: '-',
            },
            productColor: '-',
            productSize: '-',
            productQtyOld: 0,
            productQty: 0,
            productLossQty: 0,
            productYear: '-',
            productSex: '-',
            sizeSeq: 0,
            colorSeq: 0,
            targetPlaceSeq: 0,
            createBy: {
                userID: '',
                userName: ''
            }
        };
        return productORRewriteInfo;
    }

    // ## clrOrderProductQueue
    public static clrOrderProductQueue() {
        const orderProductionQueue: OrderProductionQueue = {
            // orderProductionQueueID: '',
            companyID: '',
            orderID: '',
            productID: '',
            ver: 0,
            queueInfo: [],
        };
        return orderProductionQueue;
    }

    public static clrOrderProductQueueList() {
        const queueInfoList: QueueInfoList = {
            // orderProductionQueueID: '',
            companyID: '',
            orderID: '',
            productBarcode: '',
            bundleNo: 0,
            forLossQty: 0,
            productCount: 0,
            numberFrom: 0,
            numberTo: 0,
            yarnLot: [],
            color: '',
            colorSeq: -1,
            size: '',
            sizeSeq: -1,
        };
        return queueInfoList;
    }


    // clrOrderProductionQueueList
    public static clrOrderProductionQueueList() {
        const orderProductionQueueList: OrderProductionQueueList = {
            // orderProductionQueueID: '',
            companyID: '',
            factoryID: '',
            orderID: '',
            productID: '',
            seasonYear: '',
            ver: 0,
            productBarcode: '',
            isOutsource: false,
            queueDate: new Date(),
            forLossQty: 0,
            productCount: 0,
            toNode: '',
            numberFrom: 0,
            numberTo: 0,
            bundleNoFrom: 0,
            bundleNoTo: 0,
            yarnLot: [],
            outsourceData: [],
            createBy: {
                userID: '',
                userName: ''
            }
        };
        return orderProductionQueueList;
    }

    public static clrRepQTYEdit() {
        const repQTYEdit: RepQTYEdit = {
            // orderProductionQueueID: '',
            companyID: '',
            editType: '',
            seasonYear: '',
            orderID: '',
            setName: '',
            dataRQTYE: []
        };
        return repQTYEdit;
    }

    public static clrDataRQTYE() {
        const dataRQTYE: DataRQTYE = {
            datetime: new Date(),
            orderID: '',
            color: '',
            fromNode: '',
            productColor: '',

            productSize: '',
            size: '',
            sizeSeq: 0,
            sumProductQty: 0,
            targetPlaceID: '',
            targetPlaceSeq: 0,
            createBy: {
                userID: '',
                userName: ''
            }
        };
        return dataRQTYE;
    }

    // ## clrYarn
    public static clrYarn() {
        const yarn: Yarn = {
            companyID: '',
            yarnSupplierID: '',
            customerID: '',
            seq: -1,
            yarnSeasonID: '',
            yarnID: '',
            yarnName: '',
            yarnFullName: '',
            yarnUUID: '',
            detail: '',
        };
        return yarn;
    }

    // ## clrYarnDataDraft
    public static clrYarnDataDraft() {
        const yarnDataDraft: YarnDataDraft = {
            companyID: '',
            factoryID: '',
            customerID: '',
            uuid: '',
            yarnSeasonID: '',
            status: '',
            datetime: new Date(),
            editDate: new Date(),
            yarnID: '',
            orderID: [],
            colorS: {
                companyID: '',
                seq:-1,
                setName: '',
                color: {
                    colorID: '',
                    // colorComboID: '',
                    colorName: '',
                    colorValue: '',
                    colorCode: '',
                }
            },

            yarnDataInfo: {
                datetime: new Date(),
                editDate: new Date(),
                yarnDataUUID: '',
                yarnColorID: '',
                type: '',

                mode: '',
                fromFactoryID: '',
                toFactoryID: '',
                yarnUsage_id: '',
                setName: '',
                packageInfo: {
                    invoiceID: '',
                    yarnLotID: '',
                    yarnLotUUID: '',
                    coneWeight: 0.00,
                    boxWeight: 0.00,
                    state: '',
                    yarnBoxInfo: [],

                    carton: 0,
                    yarnPlanWeightTotal: 0.00,
                    yarnWeightTotal: 0.00,
                    yarnWeightDifTotal: 0.00,
                    yarnCCWeightTotal: 0.00,
                    yarnUseWeightTotal: 0.00,
                    yarnTransferWeightTotal: 0.00,
                    yarnWeightNetTotal: 0.00,
                    yarnWeightTotalPercent: '',
                    boxIDAllVerified: false,

                    boxVerified: 0,
                    boxWait: 0,

                    yuUUID: '',
                }
            },


            yyyymmdd: '',
            mmdd: '',

            draftName: '',
            draftMode: '',
            datetimeD: new Date(),
            createBy: {
                userID: '',
                userName: ''
            }
        };
        return yarnDataDraft;
    }

    // ## clrYarnData
    public static clrYarnData() {
        const yarnData: YarnData = {
            companyID: '',
            factoryID: '',
            customerID: '',
            uuid: '',
            yarnSeasonID: '',
            status: '',
            datetime: new Date(),
            editDate: new Date(),
            yarnID: '',
            orderID: [],
            colorS: [],
            yarnDataInfo: [],
            yarnStatCal: [],
            yyyymmdd: '',
            mmdd: '',
        };
        return yarnData;
    }



    // ## clrYarnStatCal
    public static clrYarnStatCal() {
        const yarnStatCal: YarnStatCal = {
                seq:-1,
                setName: '',
                lineMode: '',
                colorCombo: {
                    colorID: '',
                    colorName: '',
                    colorValue: '',
                    colorCode: '',
                    colorComboID: '',
                    colorComboName: '',
                },
                color: {
                    colorID: '',
                    // colorComboID: '',
                    colorName: '',
                    colorValue: '',
                    colorCode: '',
                },
            mainZoneYarn: [],
        };
        return yarnStatCal;
    }

    // ## MainZoneYarn
    public static clrMainZoneYarn() {
        const mainZoneYarn: MainZoneYarn = {
            seq: 0,
            seqCut: 0,
            lineMode: '',
            orderID: '',
            color: {
                colorID: '',
                colorName: '',
                colorValue: '',
                colorCode: '',
                colorComboID: '',
                colorComboName: '',
            },
            sizeStr:'',
            targetPlaceID:'',
            targetPlaceName:'',
            orderQty: 0,
            pcWeight: 0,
            totalWeight: 0,
            orderQtyTotal: 0,
            orderWeightTotal: 0,
        };
        return mainZoneYarn;
    }


    // ## YarnDataInfo
    public static clrYarnDataInfo() {
        const yarnDataInfo: YarnDataInfo = {
            datetime: new Date(),
            editDate: new Date(),
            yarnDataUUID: '',
            yarnColorID: '',
            type: '',
            lastEdit: false,
            mode: '',
            fromFactoryID: '',
            toFactoryID: '',
            isOutsource: false,
            outsourceData: [],
            yarnPlanWeight: 0.00,
            yarnWeight: 0.00,
            packageInfo: [],
            yarnInfo: {
                orderID: '',
                productBarcode: '',
                yarnSupplierID: '',
            },

            yyyymmdd: '',
            mmdd: '',

            setName: '',
            colorCode: '',
            colorID: '',

            yarnPlanWeightTotal: 0.00,
            yarnWeightTotal: 0.00,
            yarnWeightNetTotal: 0.00,
            yarnWeightTotalPercent: '',
            stateLists: [],

        };
        return yarnDataInfo;
    }

    // ## yarnBoxInfo
    public static clrYarnBoxInfo() {
        const yarnBoxInfo: YarnBoxInfo = {
            boxID: '',
            boxUUID: '',
            coneQty: 0,
            factoryID: '',
            yarnPlanWeight: 0.00,
            yarnWeight: 0.00,
            useWeight: 0.00,
            yarnWeightNet: 0.00,
            yarnTransferWeight: 0.00,
            weightVerified: false,
            used: false,

            yarnWeightTotalDifPercent: '',
            yarnWeightDif: 0.00,
            cCWeight: 0.00,
            state: '',
            errCode: '',
            factoryIDBox: '',
        };
        return yarnBoxInfo;
    }

    // ## YarnLotUsage
    public static clrYarnLotUsage() {
        const yarnLotUsage: YarnLotUsage = {
            companyID: '',
            factoryID: '',
            customerID: '',
            yarnSeasonID: '',
            yarnID: '',
            yarnDataUUID: '',
            yarnColorID: '',
            // invoiceID: '',
            status: '',
            yarnUsage: [],
        };
        return yarnLotUsage;
    }

    // ## YarnUsage
    public static clrYarnUsage() {
        const yarnUsage: YarnUsage = {
            datetime: new Date(),
            datetimeIssue: new Date(),
            yuUUID: '',
            yarnLotID: '',
            yarnLotUUID: '',
            invoiceID: '',
            usageMode: '',
            yarnWeight: 0.00,
            yarnWeightNet: 0.00,
            useWeight: 0.00,
            yarnBoxInfo: [],
            usageInfo: {
                setFactoryID: [],
                fromFactoryID: '',
                toFactoryID: '',
                orderID: '',
                yarnPlanWeight: 0.00,
                yarnInvoiceWeight: 0.00,
            },
        };
        return yarnUsage;
    }

    // ## YarnLotUsageList
    public static clrYarnLotUsageList() {
        const yarnLotUsageList: YarnLotUsageList = {
            _id: '',
            companyID: '',
            factoryID: '',
            customerID: '',
            yarnSeasonID: '',
            yarnID: '',
            yarnDataUUID: '',
            yarnColorID: '',
            yyyymmdd: '',
            mmdd: '',
            yyyymmdd2: '',
            mmdd2: '',
            yyyymmdd3: '',
            mmdd3: '',
            datetime: new Date(),
            datetimeIssue: new Date(),
            invoiceID: '',
            yuUUID: '',
            yarnLotID: '',
            yarnLotUUID: '',
            usageMode: '',
            yarnWeight: 0.00,
            yarnWeightNet: 0.00,
            useWeight: 0.00,
            yarnBoxInfo: [],
            usageInfo: {
                setFactoryID: [],
                fromFactoryID: '',
                toFactoryID: '',
                orderID: '',
                yarnPlanWeight: 0.00,
                yarnInvoiceWeight: 0.00,
            },
            setFactoryID: '',
            usageSeq: -1,

        };
        return yarnLotUsageList;
    }

    // ## YarnLotUsageRow
    public static clrYarnLotUsageRow() {
        const yarnLotUsageRow: YarnLotUsageRow = {
            usageMode: '',
            factoryID: '',
            ddmmyyyy: '',
            ddmmyyyyIssue: '',
            issueNote: '',
            invoiceID: '',
            yarnColorID: '',
            yarnDataUUID: '',
            yarnSeasonID: '',
            yuUUID: '',
            yarnLotID: '',
            yarnLotUUID: '',
            yarnInvoiceWeight: 0.00,
            yarnWeight: 0.00,
            yarnWeightNet: 0.00,
            useWeight: 0.00,
            usageInfo: {
                setFactoryID: [],
                fromFactoryID: '',
                toFactoryID: '',
                orderID: '',
                yarnPlanWeight: 0.00,
                yarnInvoiceWeight: 0.00,
            },

            yarnBoxInfo: [],
            toFactoryID: '',
            orderID: '',
            orderID2: '',
            targetPlaceID: '',
            yarnLotID2: '',
            yarnLotUUID2: '',
            pcs: 0,
            useYarnWeight: 0.00,
            balance: 0.00,
            usageSeq: -1,

            yyyymmdd: '',
            yyyymmddIssue: '',
        };
        return yarnLotUsageRow;
    }

    // ## YarnStockRow
    public static clrYarnStockRow() {
        const yarnStockRow: YarnStockRow = {
            rowState: '',  // ##  d=full row , sd= sub data, t=total , gt=grand total , b= blank row
            companyID: '',
            factoryID: '',
            orderID: [],
            colorS: [],
            uuid: '',
            yarnID: '',
            yarnColorID: '',
            colorCode: '',
            colorID: '',
            colorName: '',
            yarnSeasonID: '',
            invoiceID: '',
            yarnLotID: '',
            yarnLotUUID: '',
            yarnDataUUID: '',
            toFactoryID: '',
            yarnBoxInfo: [],

            carton: 0,
            yarnWeightTotal: 0.00,
            yarnUseWeightTotal: 0.00,
            yarnStockWeightTotal: 0.00,
            yarnWeightNetTotal: 0.00,

            dataInfo: {
                factoryName: '',
            },

        };
        return yarnStockRow;
    }

    public static clrProductionZonePeriodRow() {
        const productionZonePeriodRow: ProductionZonePeriodRow = {
            rowState: '',  // ## 'orderIDHead', 'd', 't' //  d= data detail , t= total line
            dataGroup: '', // ## setName+targetPlaceID+orderID+colorCode
            dataGroupG: '', // ## setName+targetPlaceID+orderID
            setName: '',
            orderID: '',
            targetPlaceID: '',
            factoryID: '',
            factoryName: '',

            colorCode: '',
            colorName: '',
            size: '',
            sizeName: '',

            orderQTY: '',
            knitting: '',
            panal: '',
            linking: '',
            mending: '',
            washing: '',
            pressing: '',
            qc: '',
        };
        return productionZonePeriodRow;
    }

    public static clrBundleStatePDFRow() {
        const bundleStatePDFRow: BundleStatePDFRow = {
            rowState: '',  // ## 'orderIDHead', 'd', 't' //  d= data detail , t= total line
            groupNamePDF: '', // ## orderID+':'+targetPlaceID+':'+color
            rowNo: -1, // ## setName+targetPlaceID+orderID
            bundleNo: -1,
            size: '',
            productCount: -1,

            knitting: '',
            panal: '',
            linking: '',
            mending: '',
            washing: '',
            pressing: '',
            qc: '',
        };
        return bundleStatePDFRow;
    }

    // export class BundleStatePDFRow {
    //     constructor(
    //         public rowState: string, // ## d=detail
    //         public num: number, // ## row number
    //         public bundleNo: number,
    //         public size: string,
    //         public qty: number,

    //         public knitting: string,
    //         public panal: string,
    //         public linking: string,
    //         public mending: string,
    //         public washing: string,
    //         public pressing: string,
    //         public qc: string,
    //     ) {}
    // }

    // ## YarnLotInfo
    public static clrYarnLotInfo() {
        const yarnLotInfo: YarnLotInfo = {
            companyID: '',
            factoryID: '',
            customerID: '',
            yarnSeasonID: '',

            uuid: '',
            yarnID: '',
            orderID: [],
            colorS: [],
            yarnColorID: '',
            yarnDataUUID: '',
            type: '',
            fromFactoryID: '',
            toFactoryID: '',

            invoiceID: '',
            yarnLotID: '',
            yarnLotUUID: '',

            datetime: new Date(),
            yyyymmdd: '',
            mmdd: '',

            yarnBoxInfo: [],

            // boxID: '',
            // boxUUID: '',
            // factoryIDBox: '',

            // yarnPlanWeight: 0.00,
            // yarnWeight: 0.00,
            // useWeight: 0.00,

            // weightVerified: false,
            // used: false,
        };
        return yarnLotInfo;
    }

    // ## PackageInfo
    public static clrPackageInfo() {
        const packageInfo: PackageInfo = {
            invoiceID: '',
            yarnLotID: '',
            yarnLotUUID: '',
            coneWeight: 0.00,
            boxWeight: 0.00,
            state: '',
            yarnBoxInfo: [],

            carton: 0,
            yarnPlanWeightTotal: 0.00,
            yarnWeightTotal: 0.00,
            yarnWeightDifTotal: 0.00,
            yarnCCWeightTotal: 0.00,
            yarnUseWeightTotal: 0.00,
            yarnTransferWeightTotal: 0.00,
            yarnWeightNetTotal: 0.00,
            yarnWeightTotalPercent: '',
            boxIDAllVerified: false,

            boxVerified: 0,
            boxWait: 0,
            // yarnUsage: [],

            yuUUID: '',
        };
        return packageInfo;
    }

    // ## YarnReceiveMain
    public static clrYarnReceiveMain() {
        const yarnReceiveMain: YarnReceiveMain = {
            rowState: '',
            yyyymmdd: '',
            mmdd: '',
            toFactoryID: '',

            yarnColorID: '',
            yarnDataUUID: '',
            setName: '',
            colorCode: '',
            colorID: '',
            colorName: '',

            invoiceID: '',
            yarnLotID: '',
            yarnLotUUID: '',

            carton: 0,
            yarnPlanWeightTotal: 0.00,
            yarnWeightTotal: 0.00,
            yarnWeightDif: 0.00,

            boxWeight: 0.00,
            coneWeight: 0.00,
            yarnWeightDifTotal: 0.00,
            yarnCCWeightTotal: 0.00,
            yarnTransferWeightTotal: 0.00,
            yarnWeightNetTotal: 0.00,

            yarnWeightTotalPercent: '',
        };
        return yarnReceiveMain;
    }

    // ## YarnPackingList
    public static clrYarnPackingList() {
        const yarnPackingList: YarnPackingList = {
            rowState: '',
            yyyymmdd: '',
            mmdd: '',
            toFactoryID: '',

            yarnID: '',
            yarnColorID: '',
            yarnDataUUID: '',
            setName: '',
            colorCode: '',
            colorID: '',

            invoiceID: '',
            yarnLotID: '',
            yarnLotUUID: '',

            carton: 0,
            boxWeight: 0.00,
            coneWeight: 0.00,
            yarnPlanWeightTotal: 0.00,
            yarnWeightTotal: 0.00,
            yarnWeightDifTotal: 0.00,
            yarnCCWeightTotal: 0.00,
            yarnTransferWeightTotal: 0.00,
            yarnWeightNetTotal: 0.00,
            yarnWeightTotalPercent: '',
            boxIDAllVerified: false,

            yarnBoxInfo: [],
        };
        return yarnPackingList;
    }

    // YarnInvoiceRow
    public static clrYarnInvoiceRow() {
        const yarnInvoiceRow: YarnInvoiceRow = {
            rowState: '',
            yyyymmdd: '',
            mmdd: '',
            yarnID: '',
            toFactoryID: '',
            invoiceID: '',

            yarnColorID: '',
            setName: '',
            colorCode: '',
            colorID: '',
            colorName: '',

            yarnLotID: '',
            yarnLotUUID: '',
            yarnBoxInfo: [],

            carton: 0,
            yarnPlanWeightTotal: 0.00,
            yarnWeightTotal: 0.00,
            yarnWeightDif: 0.00,

            coneWeight: 0.00,
            boxWeight: 0.00,
            yarnWeightDifTotal: 0.00,
            yarnCCWeightTotal: 0.00,
            yarnTransferWeightTotal: 0.00,
            yarnWeightNetTotal: 0.00,

            yarnWeightTotalPercent: '',
            yarnWeightTotalDifPercent: '',
        };
        return yarnInvoiceRow;
    }

    // ## YarnTransferUsageRow
    public static clrYarnTransferUsageRow() {
        const yarnTransferUsageRow: YarnTransferUsageRow = {
            _id: '',
            rowState: '',
            ddmmyyyy: '',
            yarnID: '',
            yarnIDRowSpan: 0,
            orderID: '',
            fromFactoryID: '',
            toFactoryID: '',
            factoryName: '',

            colorCode: '',
            colorID: '',
            colorName: '',

            invoiceID: '',
            yarnColorID: '',
            yarnDataUUID: '',

            yarnLotID: '',
            yarnLotUUID: '',
            yuUUID: '',
            yarnBoxInfo: [],
            yarnTransferUsageGroupRow: {
                yyyymmdd2: '',
                ddmmyyyy: '',
                orderID: '',
                yarnID: '',
                fromFactoryID: '',
                toFactoryID: '',
            },

            carton: 0,
            yarnWeightTotal: 0.00,
            yarnUseWeightTotal: 0.00,
            yarnTransferWeightTotal: 0.00,
            yarnWeightNetTotal: 0.00,
        };
        return yarnTransferUsageRow;
    }

    // ## clr YarnStockCardPCS
    public static clrYarnStockCardPCS() {
        const yarnStockCardPCS: YarnStockCardPCS = {
            companyID: '',
            yarnSeasonID: '',
            yarnID: '',
            yarnColorID: '',
            type: '',
            dataPCS: [],
            dataZONE: [],
        };
        return yarnStockCardPCS;
    }

    // ## clr DCarton
    public static clrDCarton() {
        const dCarton: DCarton = {
            companyID: '',
            seq: -1,
            cartonID: '',
            cartonName: '',
            cSize: '',
            show: false
        };
        return dCarton;
    }

    // ## clr DCountry
    public static clrDCountry() {
        const dCountry: DCountry = {
            companyID: '',
            seq: -1,
            dCountryID: '',
            dCountryName: '',
            show: false
        };
        return dCountry;
    }

    // ## clrDPacking
    public static clrDPacking() {
        const dPacking: DPacking = {
            companyID: '',
            factoryID: [],
            seasonYear: '',
            customerID: '',
            orderID: '',
            dID: '',
            dCountryID: '',
            dStatus: '',
            isLock: false,
            isLockDCarton: false,
            seq: 0,
            dDate: new Date(),
            productionDate: new Date(),
            dInfo: {
                packingName: '',
                createDate: new Date(),
                createBy: {
                    userID: '',
                    userName: ''
                }
            },
            dCarton: [],


            totalCarton: 0,
            totalDPQty: 0,
            dPackingQTY: [],
        };
        return dPacking;
    }

    // ## clrDCarton
    public static clrDPCarton() {
        const dCarton: DPCarton = {
            seq: 0,
            dCartonID: '',
            dCartonName: '',
            cartonID: '',
            dStatus: 'w',  // ## w , c 	waiting  complete
            isLock: false,
            dOpen: false,
            dShow: false,
            lastEdit: new Date(),
            dBox: [],

            totalQTY: 0,
        };
        return dCarton;
    }

    // ## clrDBox
    public static clrDBox() {
        const dBox: DBox = {
            productColor: '',
            productSize: '',
            productQty: 0,
            colorSeq: -1,
            sizeSeq: -1,
        };
        return dBox;
    }

    // ## clrNodeStation
    public static clrNodeStation() {
        const nodeStation: NodeStation = {
            companyID: '',
            factoryID: '',
            nodeID: '',
            nodeName: '',
            status: 'c',
            nodeInfo: {
                nodeType: 'main',
                mustBundleScan: false,
                haveSubWorkflow: false,
                scan1ForAll: false,
                location: '',
                nodeDescription: '',
                pic: [],
                registDate: new Date(),
                createBy: {
                    userID: '',
                    userName: ''
                }
            },
            userNode: [],
            nStation: {
                stationNo: 0,
                loginList: []
            },
            nodeProblem: [],
        };
        return nodeStation;
    }

    // ## emptyUserNode
    public static emptyUserNode() {
        const userNode: UserNode = {
            stationID: '',
            userNodeID: '',
            userNodePass: '',
            uuid: '',
            canScanNode: false,
            canScanSubNode: false,

        };
        return userNode;
    }

    public static clrNodeFlow() {
        const nodeFlow: NodeFlow = {
            companyID: '',
            factoryID: '',
            nodeFlowID: '',
            flowType: 'main',
            registDate: new Date(),
            editDate: new Date(),
            flowCondition: {
                isFlowSequence: true,
            },
            flowSeq: [],
        };
        return nodeFlow;
    }

    public static clrSubNodeFlow() {
        const blankSubNodeFlow: SubNodeFlow = {
            seq: 100000,
            factoryID: '',
            nodeID: '',
            subNodeID: 'x',
            subNodeName: '',
            qrCode: '',
            datetime: new Date(),
            monthlyID: '',
            cost: 0,
            createBy: {
                userID: '',
                userName: ''
            }
        };
        return blankSubNodeFlow;
    }

    // OrderSubNodeFlowCost
    public static clrOrderSubNodeFlowCost() {
        const orderSubNodeFlowCost: OrderSubNodeFlowCost = {
            companyID: '',
            orderID: '',
            orderTargetPlace: [],
            orderColor: [],
            subNodeFlowCost: [],
        };
        return orderSubNodeFlowCost;
    }

    // clrOrderProductionQueueBundleNo
    public static clrOrderProductionQueueBundleNo() {
        const orderProductionQueueBundleNo: OrderProductionQueueBundleNo = {
            companyID: '',
            factoryID: '',
            orderID: '',
            productBarcode: '',
            isOutsource: false,
            bundleNo: 0,
            productCount: 0,
            numberFrom: 0,
            numberTo: 0,
        };
        return orderProductionQueueBundleNo;
    }

    public static clrSubNodeFlowCost() {
        const blankSubNodeFlowCost: SubNodeFlowCost = {
            seq: 100000,
            nodeID: '',
            subNodeID: 'x',
            cost: 0.00,
            subNodeFlowTypeID: '',
        };
        return blankSubNodeFlowCost;
    }

    // blankSubNodeFlow: SubNodeFlow = {
    //     seq: 1000,
    //     nodeID: '',
    //     subNodeID: '',
    //     qrCode: '',
    //     datetime: new Date(),
    // }

    public static clrNodeStationLoginRequest() {
        const nodeStationLoginRequest: NodeStationLoginRequest = {
            companyID: '',
            factoryID: '',
            nodeID: '',
            stationID: '',
            uuidUserNodeLoginWaiting: '',
            msgTypeID: '',
            userID: [],
            userClass: [],
            formName: [],
            datetime: new Date(),
            expiretime: new Date(),
        };
        return nodeStationLoginRequest;
    }

    public static clrDataMsgIO() {
        const dataMsgIO = {
            msgTypeID: '',  // ## msgID = message type
            sendIO: {
              userIO: {
                uAll: false,
                userClass: [],  //
                userID: [],  //
              },
              companyIO: {
                comAll: false,
                companyID: []
              },
              factoryIO: {
                facAll: false,
                factoryID: []
              }
            },
            toForm: {  // ## form location alert
              frmAll: false,
              formName: [],
            },
            dataIO: {
              // ## data messagee any
              // ## data structure depend on function

            }
        };
        return dataMsgIO;
    }

    public static clrQRCodeCount() {
        const qrCodeCount: QRCodeCount = {
            companyID: '',  // ##
            factoryID: '',  // ##
            orderID: '',  // ##
            nodeID: '',  // ##
            countQty: 0,  // ##
        };
        return qrCodeCount;
    }

    // export class QRCodeCount {
    //     constructor(
    //         public companyID: string,
    //         public factoryID: string,
    //         public orderID: string,
    //         public nodeID: string,
    //         public countQty: number,

    //     ) {}
    // }

    public static clrDataTAbleFAcAllScanNodeNode() {
        const dataTAbleFAcAllScanNodeNode: DataTAbleFAcAllScanNodeNode = {
            nName: '',  // ##
            nTotal: 0,  // ##
            fData: [],
        };
        return dataTAbleFAcAllScanNodeNode;
    }

    public static clrDataTAbleFAcAllScanNode() {
        const dataTAbleFAcAllScanNode: DataTAbleFAcAllScanNode = {
            orderID: '',  // ##
            nodeIDs: [], // ##
            // node1: {
            //     nName: '',
            //     nTotal: 0,
            //     fData: []
            // },
            // node2: {
            //     nName: '',
            //     nTotal: 0,
            //     fData: []
            // },
            // node3: {
            //     nName: '',
            //     nTotal: 0,
            //     fData: []
            // },
            // node4: {
            //     nName: '',
            //     nTotal: 0,
            //     fData: []
            // },
            // node5: {
            //     nName: '',
            //     nTotal: 0,
            //     fData: []
            // },
            // node6: {
            //     nName: '',
            //     nTotal: 0,
            //     fData: []
            // },
            // node7: {
            //     nName: '',
            //     nTotal: 0,
            //     fData: []
            // },
            // node8: {
            //     nName: '',
            //     nTotal: 0,
            //     fData: []
            // },
            // node9: {
            //     nName: '',
            //     nTotal: 0,
            //     fData: []
            // },
            // node10: {
            //     nName: '',
            //     nTotal: 0,
            //     fData: []
            // },
            // node11: {
            //     nName: '',
            //     nTotal: 0,
            //     fData: []
            // },
            // node12: {
            //     nName: '',
            //     nTotal: 0,
            //     fData: []
            // },

        };
        return dataTAbleFAcAllScanNode;
    }

    // const dataT1 = {
        //     orderID: '',
        //     node1: {
        //         nName: '',
        //         nTotal: 0,
        //         fData: [{
        //             facName: '',
        //             fTotalQty: 0
        //         }]
        //     },
        // };

        // ## DataTAbleFAcAllScanNode
        // export class DataTAbleFAcAllScanNode {
        //     constructor(
        //         public orderID: string,
        //         public node1: DataTAbleFAcAllScanNodeNode,
        //         public node2?: DataTAbleFAcAllScanNodeNode,
        //         public node3?: DataTAbleFAcAllScanNodeNode,
        //         public node4?: DataTAbleFAcAllScanNodeNode,
        //         public node5?: DataTAbleFAcAllScanNodeNode,
        //         public node6?: DataTAbleFAcAllScanNodeNode,
        //         public node7?: DataTAbleFAcAllScanNodeNode,
        //         public node8?: DataTAbleFAcAllScanNodeNode,
        //         public node9?: DataTAbleFAcAllScanNodeNode,
        //         public node10?: DataTAbleFAcAllScanNodeNode,
        //         public node11?: DataTAbleFAcAllScanNodeNode,
        //         public node12?: DataTAbleFAcAllScanNodeNode,
        //     ) {}
        // }


    // ## PDF  ###################################################################################################

    // ## BundleStatePDF
    public static clrBundleStatePDF() {
        const bundleStatePDF: BundleStatePDF = {
            companyID: '',  // ##
            orderID: '',
            targetPlaceID: '',
            targetPlaceName: '',
            targetPlaceSeq: 0,  // ##
            color: '',
            colorName: '',
            colorSeq: 0,
            bundleNo: 0,
            size: '',
            sizeSeq: 0,
            groupNamePDF: '',
            groupScanID2: '',
            nodeIDCurrent: '',
            completed: false,
            nodeGroupScanID2: [],
            productCount: 0,
        };
        return bundleStatePDF;
    }

    // ## NodeGroupScanID2
    public static clrNodeGroupScanID2() {
        const nodeGroupScanID2: NodeGroupScanID2 = {
            nodeID: '',  // ##
            sumProductQty: 0,
            userID: '',
            groupScanID2: '',
            status: '',
        };
        return nodeGroupScanID2;
    }



    // ## info board  ###################################################################################################

    public static clrBundleStateBoard() {
        const bundleStateBoard: BundleStateBoard = {
            companyID: '',  // ##
            orderID: '',

            bundleAllCount: 0,
            qtyAll: 0,

            bundleStateTargetPlaceBoard: []

            // targetPlaceID: '',
            // targetPlaceName: '',
            // targetPlaceSeq: 0,

            // bundleCount: 0,
            // qty: 0,
        };
        return bundleStateBoard;
    }

    // export class BundleStateBoard {
    //     constructor(
    //         public companyID: string,
    //         public orderID: string,

    //         public bundleAllCount: number,
    //         public qtyAll: number,

    //         public targetPlaceID: string,
    //         public targetPlaceName: string,
    //         public targetPlaceSeq: number,

    //         public bundleCount: number,
    //         public qty: number,
    //     ) {}
    // }


}
