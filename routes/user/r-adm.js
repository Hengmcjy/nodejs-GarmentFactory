const express = require("express");

const admController = require("../../controllers/user/c-adm");
// const checkAuth = require('../../middleware/check-auth');
// const checkUUID = require('../../middleware/check-uuid');
const imageFindPath = require('../../middleware/image-find-path');
const imageNameSet = require('../../middleware/image-name-set');

const checkAuthA = require('../../middleware/check-authA');
const checkUUID = require('../../middleware/check-uuid');

const router = express.Router();

// ## update language
// ## http://192.168.1.33:3968/api/a/adm/import-lang
router.put("/import-lang", checkAuthA, checkUUID, admController.putImpotLanguage);


// ## get Lang By ID
// ## http://192.168.1.33:3968/api/a/adm/getLangByID
router.get("/lang/:languageID", checkAuthA, checkUUID, admController.getLangByID);


// ## office users

// ## getOfficeUsers  %text% (ต้องอยู่ก่อน /:companyID/ เพื่อไม่ให้ "lk" ถูก match เป็น companyID)
// ## http://192.168.1.33:3968/api/a/adm/office-users/lk/:companyID/:page/:limit
router.get("/office-users/lk/:companyID/:page/:limit", checkAuthA, checkUUID, admController.getOfficeUsersLK);

// ## getOfficeUsers
// ## http://192.168.1.33:3968/api/a/adm/office-users/:companyID/:page/:limit
router.get("/office-users/:companyID/:page/:limit", checkAuthA, checkUUID, admController.getOfficeUsers);

// ## create OfficeUser
router.post("/create/officeuser", checkAuthA, checkUUID, admController.createOfficeUser);

// ## update OfficeUser Perms
router.put('/user/perms', checkAuthA, checkUUID, admController.updateOfficeUserPerms);

// ## update OfficeUser Report Perms (สิทธิ์ดูรายงาน Production — ระดับบริษัท)
router.put('/user/report-perms', checkAuthA, checkUUID, admController.updateOfficeUserReportPerms);

// ## perm comments
router.get('/perm-comments/:companyID', checkAuthA, checkUUID, admController.getPermComments);
router.put('/perm-comments',            checkAuthA, checkUUID, admController.updatePermComment);


// ## update OfficeUser Info
router.put('/user/info', checkAuthA, checkUUID, admController.updateOfficeUserInfo);

// ## update OfficeUser Password
router.put('/user/password', checkAuthA, checkUUID, admController.updateOfficeUserPassword);



module.exports = router;
