const express = require("express");
const Multer = require("multer");
const { Storage } = require("@google-cloud/storage");

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
router.get("/test/test", userController.getTestTest);

// ## general info / starting data
router.get("/generalinfo/:languageID/:classLimit", userController.getGeneralInfo);

// ## get language  / starting data
router.get("/generalinfo1/langdata/:languageID", userController.getLangData);

// // ## starting data
// router.get("/startinginfo", userController.getStartingInfo);

// ## auth
router.get("/login", checkAuth, checkUUID, userController.getuserLogin);

router.post("/signup", userController.createUser);

router.post("/login", userController.userLogin);

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
let keyFilename = './'+'mykey.json'; // Get this from Google Cloud -> Credentials -> Service Accounts
const storageGCG = new Storage({
  projectId,
  keyFilename,
});

// ## go.garment.mail@gmail.com
let projectIdII = "mystorage-888888"; // Get this from Google Cloud
let keyFilenameII = './'+'mykeyii.json'; // Get this from Google Cloud -> Credentials -> Service Accounts
const storageGCGII = new Storage({
  projectIdII,
  keyFilenameII,
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
          // console.log("File found, trying to upload...");
          // const blob = bucket.file(req.file.originalname);
          const blob = bucket.file(subfolder + req.imageData.imageName+'.jpg');
          const blobStream = blob.createWriteStream({ resumable: false });
          blobStream.on("finish", async () => {
            
            // ## edte image product profile
            if (mydatajson.callfrom === 'productEditImageProfile') {
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
