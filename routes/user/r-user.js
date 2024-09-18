const express = require("express");
const Multer = require("multer");
const { Storage } = require("@google-cloud/storage");

const mailController = require("../../controllers/user/c-mail");
const reportController = require("../../controllers/user/c-report");
const userController = require("../../controllers/user/c-user");
const checkAuth = require('../../middleware/check-auth');
const checkUUID = require('../../middleware/check-uuid');
const imageFindPath = require('../../middleware/image-find-path');
const imageNameSet = require('../../middleware/image-name-set');
const ShareFunc = require("../../controllers/c-api-app-share-function");



const router = express.Router();

// ## http://localhost:3022/api/user/test/test
// ## http://192.168.1.39:3022/api/user/test/test
// ## test

router.get("/test/explain1/testexplain1", userController.gettestexplain1);
router.get("/test/explain1/testexplain2", userController.gettestexplain2);
router.get("/test/explain1/testexplain3", userController.gettestexplain3);
router.get("/test/explain1/testexplain4", userController.gettestexplain4);
router.get("/test/explain1/testexplain5", userController.gettestexplain5); // ## test node home
router.get("/test/explain1/testexplain6", userController.gettestexplain6); // ## test node scan qrcode
router.get("/test/explain1/testexplain7", userController.gettestexplain7); // ## index state

// ## test object array
router.get("/test/arrayobject/testAO1", userController.getOA1);

router.get("/test/test", userController.getTestTest);
router.get("/test/test2", userController.getTestTest2);

router.get("/test/test4", userController.getTestTest4);
router.get("/test/test4_2", userController.getTestTest4_2); // ## get orderiDs from all a season
router.get("/test/test4_3", userController.getTestTest4_3); // ## get all qty orderProduction by productBarcode
router.get("/test/test4_4", userController.getTestTest4_4); // ## get all qty orderProduction 
router.get("/test/test5", userController.getTestTest5); // ## add productionNode to orderProduction
router.get("/test/test5_1", userController.getTestTest5_1); // ## add productionNode to orderProduction @ position nodeID
router.get("/test/test6", userController.getTestTest6); // ## ## update orderProduction / edit bundleNo
router.get("/test/test7", userController.getTestTest7); // ## cancel queue order all
router.get("/test/test8", userController.getTestTest8); // ## cancel queue order (some)
router.get("/test/test11", userController.getTestTest11); // ## cancel orderProduction (some)
router.get("/test/test11_2", userController.getTestTest11_2); // ## cancel orderProduction by bundleNo(s)
router.get("/test/test9", userController.getTestTest9); // ## cancel queue order (some) 2 , 1 by 1
router.get("/test/test10", userController.getTestTest10); // ## cancel queue order (some) 3 ******************************
router.get("/test/test12", userController.getTestTest12); // ## edit orderProduction forloss --> normal
router.get("/test/test16", userController.getTestTest16);  // delete all orderProduction , orderProductionQueueList , orderProductionQueue


router.get("/test/test14", userController.getTestTest14); // ## cancel orderProduction , queue (all) 100%

router.get("/test/test15", userController.getTestTest15);  // ## view group qty orderProduction / productBarcode
router.get("/test/test17", userController.getTestTest17);  // ##  update ver for orderProduction all
router.get("/test/test18", userController.getTestTest18);  // ##  update ver for order all
router.get("/test/test21", userController.getTestTest21);  // ##  get duplicate fromNode from orderProduction
router.get("/test/test22", userController.getTestTest22);  // ##  delete orderProduction.productionNode array index
router.get("/test/test22_1", userController.getTestTest22_1);  // ##  delete orderProduction.productionNode @ last elemnt
router.get("/test/test22_2", userController.getTestTest22_2);  // ##  delete orderProduction.productionNode @ last elemnt by productBarcodeNoReal(s)
router.get("/test/test23", userController.getTestTest23);  // ## view group qty orderProduction bundle more than 12
router.get("/test/test23_1", userController.getTestTest23_1);  // ## view group qty orderProduction bundleID more than 12

router.get("/test/test19", userController.getTestTest19);  // ##  update ver for orderProductionQueue all
router.get("/test/test20", userController.getTestTest20);  // ##  update ver for orderProductionQueue = queueInfo --> []


// ## staff scan node station
router.get("/test/staffscan/getstat/staffID", userController.getTestStaffScanStatByStaffID);  // ## get StaffScan Stat By StaffID

// ## updateOne - push  , orderProductionQueue-> queueInfo
router.get("/test/orderProductionQueue/01", userController.getOrderProductionQueue01);  // ##  update orderProductionQueue insert queueInfo
router.get("/test/orderProductionQueue/02", userController.getOrderProductionQueue02);  // ## delete element by bundleNo

router.get("/test/orderProductionQueuelist/01", userController.getOrderProductionQueueList01);  // ## update ver

// ## test order queue
router.get("/test/orderqueue/test1", userController.getOrderQueueTest1);

// ## yarn  
// ##  change yarn InvoiceID
router.get("/yarn/edit/change/invoiceid", userController.getYarnChangeInvoiceID);


// ## test get mongodb version
router.get("/test/get/monogdbver/getver", userController.getMonogoDbver1);

// ## test nas
// ## http://192.168.1.36:3968/api/user/test/nas/connect
router.get("/test/nas/connect", userController.nasConnect);


// ## download file text
router.get("/test/download/text", userController.downloadtext);
router.get("/test/download/getlist", userController.fileNameLists);

// ## mail
// ## http://192.168.1.36:3968/api/user/test/mail/test1
router.get("/test/mail/test1", mailController.postSignupSendMail2);



// ## test
// ###########################################################

// ## upload update language 
router.get("/langu/update", userController.languageUpdate);


// ## general info / starting data
router.get("/generalinfo/:languageID/:classLimit", userController.getGeneralInfo);

// ## get language  / starting data
router.get("/generalinfo1/langdata/:languageID", userController.getLangData);

// ## company general info / starting data  getCompanyInfo
router.put("/get/company/data/info", userController.getCompanyInfo);

// // ## starting data
// router.get("/startinginfo", userController.getStartingInfo);

// ## auth
router.get("/login", checkAuth, checkUUID, userController.getuserLogin);

router.post("/signup", userController.createUser);

router.post("/login", userController.userLogin);

router.post("/staffConfirm", userController.staffCheckConfirm);  // ## for confirmation for important case


router.get("/uinfo/:userID", checkAuth, checkUUID, userController.getuserInfo);

router.post("/logout", userController.userLogout);


// ## user company

// ## edit editPassFactoryStaff 
router.put("/useredit1/factory/staff", checkAuth, checkUUID, userController.editPassFactoryStaff);




// ## create new company 
router.post("/create/company", checkAuth, checkUUID, userController.createUserCompany);

// ## get user1 company 
router.get("/getuser1/company/:userID", checkAuth, checkUUID, userController.getUser1Company);

// ## get user company 1 "/get1/company/:companyID"
router.get("/get1/company/:companyID", checkAuth, checkUUID, userController.getCompany1);

// ## edit company 
router.put("/edit/company", checkAuth, checkUUID, userController.editCompany);

// ## get member company 
router.get("/get/member/company/:companyID/:page/:limit", checkAuth, checkUUID, userController.getMemberCompany);

// ## invite member 
router.put("/invite/member/company", checkAuth, checkUUID, userController.putInviteMemberCompany);

// ##  member join company
router.put("/join/user/company", checkAuth, checkUUID, userController.putUserJoinCompany);

// ##  member join company
router.put("/edit/userclass/company", checkAuth, checkUUID, userController.putUserClassCompany);

// ## get user company 
router.get("/get/company/:userID/:page/:limit", checkAuth, checkUUID, userController.getUserCompany);




// ## user factory

// ## create new factory 
router.post("/create/factory", checkAuth, checkUUID, userController.createUserFactory);

// ## get  user  factory by userID companyID
router.get("/get/factory/:userID/:companyID/:page/:limit", checkAuth, checkUUID, userController.getUserFactory);

// ## get  user  factories by  companyID
router.get("/get/factories/by/:userID/:companyID", checkAuth, checkUUID, userController.getFactoriesByCompanyID);

// ## get  gn  factories by  companyID   / gn=general
router.get("/get/gn/factories/by/:companyID", userController.getGNFactoriesByCompanyID);

// ## get  user  factory by  companyID factoryID
router.get("/get1/factory/:companyID/:factoryID", checkAuth, checkUUID, userController.getFactory1);

// ## edit factoery 
router.put("/edit/factory", checkAuth, checkUUID, userController.editFactory);

// ## get  user  factory by userID companyID
router.get("/check/existuserid/:companyID/:factory/:checkuserID", checkAuth, checkUUID, userController.getCheckExistCompanyFactoryUserID);

// ## create company factory user/staff
router.post("/create/companyID/factory/user", checkAuth, checkUUID, userController.createUserCompanyFactory);

// ## get  user member  factory by userID companyID
router.get("/getmembers/factory/:companyID/:factoryID/:state/:page/:limit", checkAuth, checkUUID, userController.getUserMemberFactory);

// ## report 

// ## get node getRepNodeNoScan
router.get("/node/noscan1/rep/CFN/:companyID/:factoryIDArr/:nodeID/:orderIDsArr/:infoTypeArr", checkAuth, checkUUID,
        reportController.getRepNodeNoScan);
// // ##


// ## staff / worker

// ## create company factory staff  createStaffCompanyFactory
router.post("/stf/create/companyID/factory/staff", checkAuth, checkUUID, userController.createStaffCompanyFactory);

// ## edit company factory staff  putEditStaffCompanyFactory
router.post("/stf/edit/companyID/factory/staff", checkAuth, checkUUID, userController.putEditStaffCompanyFactory);

// ## get staff1 company 
router.get("/getstaff1/company/:userID", checkAuth, checkUUID, userController.getStaff1Company);












// #############################################################
// ## image upload

const MIME_TYPE_MAP = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/jpg": "jpg"
};

const storage = Multer.diskStorage({
  destination: (req, file, cb) => {
      // console.log(req.session.pathImapge);
      // console.log(file);
    const isValid = MIME_TYPE_MAP[file.mimetype];
    let error = new Error("Invalid mime type");
    if (isValid) {
      error = null;
    }
    cb(error, req.imageData.tempPath); // where image to store = temp path
  },
  filename: (req, file, cb) => {
    const name = file.originalname
      .toLowerCase()
      .split(" ")
      .join("-");
    const ext = MIME_TYPE_MAP[file.mimetype];
    cb(null, req.imageData.imageName + "." + ext);
  }
});

// ## /api/user/update/upload/images postUpdateUploadImages
router.post('/update/upload/images/',
    checkAuth,
    imageFindPath,
    imageNameSet,
    Multer({ storage: storage, limits: { fileSize: 0.5 * 1024 * 1024 } }).single("image"), 
    userController.postUpdateUploadImages);



// ## image to google cloud storage  #############################################################

const multerGCS = Multer({
  storage: Multer.memoryStorage(),
  limits: {
    fileSize: 1 * 1024 * 1024, // No larger than 1mb, change as you need
  },
});
    
// ## go.garment.com@gmail.com
let projectId = "mystorage-371212"; // Get this from Google Cloud
let keyFilename = './'+'newkey.json'; // Get this from Google Cloud -> Credentials -> Service Accounts
const storageGCG = new Storage({
  projectId,
  // keyFilename,
  credentials: 
  {
    
    "type": "service_account",
    "project_id": "mystorage-371212",
    "private_key_id": "b5a26b9feada14038bde21767a7b0b9757113d37",
    "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDKrWIftkWKoAdt\n4W4YYplH818wbcm7URtHRmlbYSL3Ox6p/gsWMPlj3xdXdjYr8d3GvUZYsAUy4g+E\nZ0+pwEpWqhhNKVdCXcXoj8enaRupGVO+3pwL5JQLZ4vNbyRIgPVx9sNpe4kSab8f\nyqjMWB7DDtC8owpNHDtjdfwLWgyzKDRsmn5HIKUCEBeCiP1C2RNcGQcyJ+Qt9lS2\nw243Ub2x2SmQjVkvVGOcCnFBUyfsxj5u9pZ4Cru5AZ6t29hAi9M3OjQ69caD+9c0\nZVorb8n/xJedMHyAGUWBS0QfqENJCH0UOvlJq4NvvJcTTrf7uns2rVuMsM4xeuLC\nIjt2sarNAgMBAAECggEAY06MHyywq0lZCopj5vfc0gfZ8sFAkJMfkg9ajSctukTR\n9AohhYiOkdRcPAMUbPjQKVJRdyAcE//3CXGTc4HgCtHCIYCpnD+VOqvEcG9MWdEq\nmwG5JQylS2c7dXfJJ+tkGCiIPBWHJqoAt0OV7LYasImAVoVuhTTZlpTXX/qJ8XfX\nfZvIvAKiL4Rk0qAKhdzVe8+bCSkofOpw6y0tVe3iCXa0FBTFEfR868jxbES/LHT7\nWlPQK2iNPTmnKH9i2EjQcXrL6MgTx2KEe7EGOWAxDO6mIjylAD/osvACPLN7KA0F\nqg2noH7j3FXfr8li4kcD8qF3DwaINfTlfZs52MnHwwKBgQD/EUw61NeCTgZjdW5r\nHpBvtNpDeoQjyOspKfO8/dNnOrxuVgmQN0MrgP5GnEXRgBSTpx7+QUrnIgUqWYUz\najDsLWSXgpBK2whq15zkYcFSxldXlKCAQ0V4Wpq7P5viFaVqVT6ZGO+GO/bzczOf\nc4LJiH9SEhkKrwETYv+4KByX1wKBgQDLaw5/t9MOsyPw8V+d+i36Nut63XRPyFF7\ngapVmFJDewxwlhzi6KkVP7mNgrPSbEMkSWrXb5DLC3okMw7c/wxLaQt1HBTIo9mr\nimZpEaW9nz4N1lbWqVBmToRkHho2bvlU+okp6xOwStuTFfRipgbIXkBDlaFAtJ3C\n3f675Mgt+wKBgQDO2ptktsoTve1GaazjqITgYt4DjW9uifnUh1ZI9dylQiggnxvg\nXkDWHiWY5BFnJqUJXaYv8ompSpi/0JvKp5sHXoTOrq8QVfPMmhF90Z1z4LBisYE8\no9HKGkiUBLEJuB5PTtSWWned+DF9G/dIn+f4Qv9mcpDmbijELSxPkBAoPwKBgGep\nuQvRLBeTpz9EYovpUMDwd/R3Iqz90rh0Dc/s/g8xh9dgSHxCQNh5TyAUeXtEfLrj\nRzVev5UZ1jbYZjytJSDQ+WvG0bil92l58FKfEa2el0sJ7dsbEcPxQ3qZ9JXE2/84\nZeocyD3RCDDewVn8bfxyO6G1gSWuZa9G3mf2YSU9AoGBANkCC1jTaCs9YK9IwSLs\nom1sfbA/b1NDvF0Hyz/YtQyem+egVtUoFddRl0pCm78ynm/PbJUOk+a54qbkEO4I\n4key2LGMFgxOpT/311yMfP7otp3cSvNfy/0VFOEovG2owjjj89Lta3wE3RfKN6XF\nQ3C9s4nTNmtA0pROrZBtpylG\n-----END PRIVATE KEY-----\n",
    "client_email": "mystorageimage2@mystorage-371212.iam.gserviceaccount.com",
    "client_id": "102661079380883436477",
    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
    "token_uri": "https://oauth2.googleapis.com/token",
    "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
    "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/mystorageimage2%40mystorage-371212.iam.gserviceaccount.com",
    "universe_domain": "googleapis.com"
    
  }
});

// ## go.garment.mail@gmail.com
let projectIdII = "mystorage-888888"; // Get this from Google Cloud
let keyFilenameII = './'+'mykeyii.json'; // Get this from Google Cloud -> Credentials -> Service Accounts
const storageGCGII = new Storage({
  projectIdII,
  // keyFilenameII,
  credentials: {
    "type": "service_account",
    "project_id": "mystorage-888888",
    "private_key_id": "750c38f58560a92195fbdba960dbc9d491e6a98e",
    "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDarGov8W9rOmvA\n2VCV75nG+APY3RK9o/iQoM2XdV5MRIz1fScJpYus+a4WEtc58Eptl6EWNle9qAfj\n1km7ThvLRTXRcyOYvpDns2dHA7qrgF6e9l72ZbNdGfbrR3oEzHG11ufHcsvGXblD\nKAa/hWIRI9XhLXyX1lHG64pY6Xo6YXqOLkFyu9VyD9Qo9rCnYW3iopDn+/OTMJv7\nGCIOtFh47z/k93nBsPlmLq9O4UYthSVjABFOdXlmm0i0rvSqiqDcrxL/KoFbEBTK\njHbkbbwr8Y17348TxDab6wGNqmbJeKlc+Ee/NZfam8cDnwfhX4BMgwlUNgrksHNg\n9XYM/JqvAgMBAAECggEAH+j0D+3399pNGhW8PDz8IDxV92H/V5wjbBuDFNyEN7Xz\nKemq9i3prYK75C24qZRGkCqFz8N7V0o7aIR/Ou2Bgc6mNVvLcIEyjRUxd3v0VA2G\nAUVrgyJBI89jqF7EUAnzd/kV1pWKZfaMT9/56B3TOzQTBGqKWW/lfBUoGaRseTM2\nJ5xMOnOfP1+9VzwfZGy4Z6Uqd3jPTyOR+aIOuWnnV22QBni41uglqx0JePh/5bH3\nch8voX/l6PKuM0SDaf0gKaWR1NIvt1QTV+3x1nWoNR64laYaw2gOW4AkroEZsDus\ncjf12b9KoxgEClBmd2m0AkBPzxdwDKiymDufSGZUhQKBgQD8fkuYUFHqRn4udbRq\nagEYtBA78jYh1ZoMd54gqC+aDGbSvjI9ljAu1GRYsd+U/j8Da8gmLEejTO7THvxd\n4diEFEFwaH8CyZzeVsjK1q9wrjTQKpDzZslHPiGSxFfsGSW9Vd75pijE4ANdiyDq\n1Pg7pfwQPiXzfdOaS0hiYSCSiwKBgQDdteC1/W/o0I57m4eWfYKuZC/ZCCe+ftUu\nrF1QQtUwh2k3MuBljO1csQKhTAvT2DaW/rXG5b+eo+Pds7ZzweU/3nqvcLmj+gbL\nwMhnJ36mAFDNvlffUbs+7xzaCyo9umR9nFy4M9CSS8erB/kbYWN+9BEcJF0uRdm/\n23ZZLMzQ7QKBgQCuPs4WZ9+P6GPt1gbSpSLqlGDbrbRTtx/fWLFEYiyvh71x1BXB\n0KKhvqsdVmswXCDKUJhIV6h8dnweMDUC6PfNdlkOpN554v6hpYxeBrf98Aq8WZO8\nlYNz6dmreloeseAMgHUnHdbmvp0z8e6egKhqKYsA/pKcLYpY4Xkrg1HCLwKBgEqA\nAUBmJyKuYhJ7Erao+i6rj8B4ExLZ/7ytQrXjn0utVNetiuXU0zXgbSfSK+9FqiJW\n+LIbJaajH8Cx0M9ZCjXKBqPJVzgYngv9fdnb1ZzmYkCgg1qRVkAxjRpfwhP3/CiR\nUD69eoqOWEvKZBSlRw+z58PzHDSeWCs2DbCtcy2JAoGBAJ3zXx1dz6MXvNiWazIs\nqB93tPHKFizWdeoKGDoisDwTS5v2wMwZGkHWsYj8dRYofbqvhilAw3t1VljbDIe3\nW//A05J0oTdCQ7QiZOaCrs9Vo9EU4uVMUlklLKbJHwG7IYphzg5zFZNCaopjQN/g\nbyz3H4doDhTWA09Sxo+PDaJC\n-----END PRIVATE KEY-----\n",
    "client_email": "mystorage8@mystorage-888888.iam.gserviceaccount.com",
    "client_id": "104493806110500049988",
    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
    "token_uri": "https://oauth2.googleapis.com/token",
    "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
    "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/mystorage8%40mystorage-888888.iam.gserviceaccount.com"
  }
});

/*  bucket name
  // ## for email: go.garment.com@gmail.com
  companyfactorygarmentworld1sthighquality / 		company image, factory image
	locationplacegarmentworld1sthighquality / 		company , factory location image
	garmentproductgarmentworld1sthighquality / 		complete product image
	garmentcustomergarmentworld1sthighquality / 		customer image
	garmentusergarmentworld1sthighquality / 		user profile image

  // ## for email: go.garment.mail@gmail.com
	garmentproductionprocessgarmentworld001sthighquality / 		step production image
*/


// ## callfrom  for email: go.garment.com@gmail.com
const callfromI = [
  'productEditImageProfile',
  'userEditImageProfile',
  'staffEditImageProfile',
  'companyEditImageProfile',
  'factoryEditImageProfile',
  'customerEditImageProfile',
];

// ## for step production process image  /   for email: go.garment.mail@gmail.com
const callfromII = [
  
];

// ## /api/user/update/upload/images/gcs postUpdateUploadImagesGCS
router.post('/update/upload/images/gcs',
    checkAuth,
    imageFindPath,
    imageNameSet,
    multerGCS.single("image"), 
    async (req, res) => {
      // console.log("Made it /upload");
      // console.log(req.imageData.imageName );
      // console.log(req.imageData.mydatajson);
      // console.log(JSON.parse(req.imageData.mydatajson));
      const imageMainPath = process.env.GOOGLESTORAGEAPIPATH;
      // console.log(`Current directory: ${process.cwd()}`);
      
      // ## bucket name
      // ##  productEditImageProfile
      const mydatajson = JSON.parse(req.imageData.mydatajson);
      // console.log(mydatajson);
      // console.log('----------------------mydatajson--------------');
      let bucketName = '';
      let bucket = storageGCG.bucket("locationplacegarmentworld1sthighquality");
      if (callfromI.includes(mydatajson.callfrom)) {
        bucketName = await ShareFunc.getBucket(mydatajson.callfrom);
        bucket = storageGCG.bucket(bucketName); // Get this from Google Cloud -> Storage 
      } else if (callfromII.includes(mydatajson.callfrom)) {

      }

      // const bucketI = storageGCG.bucket("companyfactorygarmentworld1sthighquality"); // Get this from Google Cloud -> Storage 
      // const bucketII = storageGCGII.bucket("garmentproductionprocessgarmentworld001sthighquality"); // Get this from Google Cloud -> Storage 

      
      // bucket = bucketI;
      try {
        // console.log(mydatajson);
        
        if (req.file) {
          const companyID = mydatajson.companyID;
          const subfolder =  mydatajson.subfolder;
          // console.log("File found, trying to upload...  000");
          // const blob = bucket.file(req.file.originalname);
          const blob = bucket.file(subfolder + req.imageData.imageName+'.jpg');
          // console.log("File found, trying to upload...  111");
          const blobStream = blob.createWriteStream();
          // const blobStream = blob.createWriteStream({ resumable: false });
          // console.log("File found, trying to upload...  222");
          // console.log(blobStream);
          blobStream.on("finish", async () => {
            // console.log("111111111111111111111111111111111");
            // console.log(mydatajson);
            // ## edte image product profile
            if (mydatajson.callfrom === 'productEditImageProfile') {
              // console.log("mydatajson.callfrom === 'productEditImageProfile'");
              const productID = mydatajson.product.productID;

              const oldImage = await ShareFunc.getProductImageProfile(companyID, productID); // ## delete image old @ google storage
              if (oldImage) {  
                if (oldImage.length > 0) {
                  const file = bucket.file(subfolder + oldImage);
                  file.delete(function(err, apiResponse) {});
                }
              }

              const imageProfile = req.imageData.imageName+'.jpg'
              ShareFunc.editProductImageProfile(companyID, productID, imageProfile); // ## update mongodb for image path

            // ## edit user image profile  
            } else if (mydatajson.callfrom === 'userEditImageProfile') {
              const userID = mydatajson.userID;

              const oldImage = await ShareFunc.getUserImageProfile(userID);  // ## delete image old @ google storage
              if (oldImage) {
                if (oldImage.length > 0) {
                  const file = bucket.file(subfolder + oldImage);
                  file.delete(function(err, apiResponse) {});
                }
              }

              const imageUserProfile = req.imageData.imageName+'.jpg'
              ShareFunc.editUserImageProfile(userID, imageUserProfile);  // ## update mongodb for image path user

            // ## edit staff image profile  , worker , user-office
            } else if (mydatajson.callfrom === 'staffEditImageProfile') {
              const userID = mydatajson.touserID;

              const oldImage = await ShareFunc.getUserImageProfile(userID);  // ## delete image old @ google storage
              if (oldImage) {
                if (oldImage.length > 0) {
                  const file = bucket.file(subfolder + oldImage);
                  file.delete(function(err, apiResponse) {});
                }
              }

              const imageUserProfile = req.imageData.imageName+'.jpg'
              ShareFunc.editUserImageProfile(userID, imageUserProfile);  // ## update mongodb for image path user

            // ## edit company image profile  
            } else if (mydatajson.callfrom === 'companyEditImageProfile') {
              const oldImage = await ShareFunc.getCompanyImageProfile(companyID);  // ## delete image old @ google storage
              if (oldImage) {
                if (oldImage.length > 0) {
                  const file = bucket.file(subfolder + oldImage);
                  file.delete(function(err, apiResponse) {});
                }
              }

              const imageCompanyProfile = req.imageData.imageName+'.jpg'
              ShareFunc.editCompanyImageProfile(companyID, imageCompanyProfile);  // ## update mongodb for image path company

            // ## edit factory image profile  
            } else if (mydatajson.callfrom === 'factoryEditImageProfile') {
              const factoryID = mydatajson.factoryID;
              const oldImage = await ShareFunc.getFactoryImageProfile(companyID, factoryID);  // ## delete image old @ google storage
              if (oldImage) {
                if (oldImage.length > 0) {
                  const file = bucket.file(subfolder + oldImage);
                  file.delete(function(err, apiResponse) {});
                }
              }

              const imageFactoryProfile = req.imageData.imageName+'.jpg'
              ShareFunc.editFactoryImageProfile(companyID, factoryID, imageFactoryProfile);  // ## update mongodb for image path company
          

            // ## edit factory image profile  
            } else if (mydatajson.callfrom === 'customerEditImageProfile') {
              const customerID = mydatajson.customerID;
              const oldImage = await ShareFunc.getCustomerImageProfile(companyID, customerID);  // ## delete image old @ google storage
              if (oldImage) {
                if (oldImage.length > 0) {
                  const file = bucket.file(subfolder + oldImage);
                  file.delete(function(err, apiResponse) {});
                }
              }
              const imageCustomerProfile = req.imageData.imageName+'.jpg'
              ShareFunc.editCustomerImageProfile(companyID, customerID, imageCustomerProfile);  // ## update mongodb for image path company
          


            }

            

            res.status(200).send("Success");
          });
          blobStream.end(req.file.buffer);
        } else throw "error with img";
      } catch (error) {
        res.status(500).send(error);
      }
    });

// ## image upload
// #############################################################

module.exports = router;
