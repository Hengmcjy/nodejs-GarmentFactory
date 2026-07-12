const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const moment = require('moment-timezone');
const fs=require('fs');
const path = require("path");

// const Synology = require("synology");

const io = require('../../socket');

const ShareFunc = require("../c-api-app-share-function");


const Menu = require("../../models/m-menu");
const MenuAuthor = require("../../models/m-menuAuthor");

const Useracc = require("../../models/m-acc-user");
const User = require("../../models/m-user");
const UserClass = require("../../models/m-userClass");
const UserGroupScan = require("../../models/m-userGroupScan");
const Company = require("../../models/m-company");
const Factory = require("../../models/m-factory");
const NodeStation = require("../../models/m-nodeStation");

const Order = require("../../models/m-order");
const OrderProduction = require("../../models/m-orderProduction");
const OrderProductionQueueList = require("../../models/m-orderProductionQueueList");
const OrderProductionQueue = require("../../models/m-orderProductionQueue");

const YarnData = require("../../models/m-yarnData");
const YarnLotUsage = require("../../models/m-yarnLotUsage");
const YarnStockCardPCS = require("../../models/m-yarnStockCardPCS");


const UnitSize = require("../../models/m-unitSize");
const UnitWeight = require("../../models/m-unitWeight");

const OrderSubNodeFlowSetCost = require("../../models/m-orderSubNodeFlowSetCost");

const Language = require("../../models/m-language");
const PermComment = require("../../models/m-perm-comment");


moment.tz.setDefault('Asia/Bangkok');


exports.asyncForEach= async (array, callback) => {
// async function asyncForEach(array, callback) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
}

exports.asyncForEach2= async (array, callback) => {
// async function asyncForEach2(array, callback) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
}

exports.asyncForEach3= async (array, callback) => {
  // async function asyncForEach2(array, callback) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
}

exports.asyncForEach4= async (array, callback) => {
  // async function asyncForEach2(array, callback) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
}

// #############################################################
// ## import lang


// ## update language
// ## http://192.168.1.33:3968/api/a/adm/import-lang
// router.put("/import-lang", checkAuth, checkUUID, deliController.putImpotLanguage);
exports.putImpotLanguage = async (req, res, next) => {
  // console.log('putImpotLanguage');
  const { languages } = req.body;

    if (!Array.isArray(languages) || languages.length === 0) {
        return res.status(400).json({ success: false, message: 'languages array required' });
    }

    // const ALLOWED = ['en', 'th', 'cn', 'mm'];
    const ALLOWED = ['en', 'th', 'cn'];

    try {
        const results = [];

        for (const lang of languages) {
            const { languageID, languageData } = lang;

            if (!ALLOWED.includes(languageID)) {
                results.push({ languageID, status: 'skipped' });
                continue;
            }

            const updated = await Language.findOneAndUpdate(
                { languageID },
                { $set: { languageData } },
                { new: true, upsert: false }
            );

            if (!updated) {
                results.push({ languageID, status: 'error', reason: 'not found' });
            } else {
                results.push({ languageID, status: 'ok', rows: languageData.length });
            }
        }

        const hasError = results.some(r => r.status === 'error');
        return res.json({ success: !hasError, results });

    } catch (err) {
        console.error('[putImpotLanguage]', err.message);
        return next(err);
    }
}

// ## get language data
// ## GET /api/a/adm/lang/:languageID
exports.getLangByID = async (req, res, next) => {
    // console.log('getLangByID', req.params.languageID);
    try {
        const doc = await Language.findOne(
            { languageID: req.params.languageID },
            { languageData: 1, _id: 0 }
        );
        return res.json(doc ?? { languageData: [] });
    } catch (err) {
        console.error('[getLangByID]', err.message);
        return next(err);
    }
}

// ## import lang
// #############################################################




// #############################################################
// ## office user

// // ## getOfficeUsers
// // ## http://192.168.1.33:3968/api/a/adm/office-users/:companyID/:page/:limit
// router.get("/office-users/:companyID/:page/:limit", checkAuthA, checkUUID, admController.getOfficeUsers);
exports.getOfficeUsers = async (req, res, next) => {
    const { companyID } = req.params;
    const page  = +req.params.page;
    const limit = +req.params.limit;
    const skip  = (page - 1) * limit;

    try {
      const query = {
          type:  'u',
          state: { $in: ['userEmail', 'staff'] },
          'uFactory.companyID': companyID,
      };

      const [users, total] = await Promise.all([
          Useracc.find(query)
              .select('-uInfo.userPass')
              .sort({ 'uInfo.userName': 1 })
              .skip(skip).limit(limit).lean(),
          Useracc.countDocuments(query),
      ]);

      const token = await ShareFunc.genATokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);

      res.status(200).json({
          status: 'get office users',
          token,
          expiresIn: process.env.expiresIn,
          users,
          total,
          page,
          limit,
      });
    } catch (err) {
        console.log(err);
        return res.status(401).json({
            message: {
                messageID: 'erru010',
                mode:      'errgetOfficeUsers',
                value:     'get office users error',
            }
        });
    }
};


// ## getOfficeUsers  %text%
// ## http://192.168.1.33:3968/api/a/adm/office-users/lk/:companyID/:page/:limit
// router.get("/office-users/:companyID/:page/:limit", 
// checkAuthA, checkUUID, admController.getOfficeUsersLK);
exports.getOfficeUsersLK = async (req, res) => {
    try {
        const { companyID, page, limit } = req.params;
        const search = req.query.search?.trim() || '';

        const query = {
            type:  'u',
            state: { $in: ['userEmail', 'staff'] },
            'uFactory.companyID': companyID,         // ← แก้จาก companyID ตรงๆ
        };

        if (search) {
            const regex = new RegExp(search, 'i');
            query.$or = [
                { userID:           { $regex: regex } },
                { 'uInfo.userName': { $regex: regex } },
            ];
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const [users, total] = await Promise.all([
            Useracc.find(query)                      // ← แก้จาก User เป็น Useracc
                .select('-uInfo.userPass')
                .sort({ 'uInfo.userName': 1 })
                .skip(skip).limit(parseInt(limit)).lean(),
            Useracc.countDocuments(query),           // ← แก้จาก User เป็น Useracc
        ]);

        res.json({ users, total });
    } catch (err) {
        console.error('[getOfficeUsersLK]', err);
        res.status(500).json({ message: err.message });
    }
};




exports.createOfficeUser = async (req, res, next) => {
    const { userID, userName, userPass, state, tel, email, uFactory, companyID, createByUserID } = req.body;

    if (!userID || !userName || !userPass) {
        return res.status(400).json({ message: 'userID, userName, userPass required' });
    }

    try {
        const exists = await Useracc.findOne({ userID });
        if (exists) {
            return res.status(400).json({ message: `userID "${userID}" มีอยู่แล้ว` });
        }

        const hashedPass = await bcrypt.hash(userPass + 'pwd' + userPass, 10);
        // const hashedPass = await bcrypt.hash(userPass, 10);  // ← hash ก่อน save

        const user = new Useracc({
            userID,
            qrCode:    userID,
            type:      'u',
            state:     state || 'userEmail',
            uInfo: {
                userName,
                userPass:   hashedPass,   // ← เก็บ hash
                pic:        '',
                tel:        tel   || '',
                email:      email || '',
                registDate: new Date(),
            },
            uCompany:  companyID ? [{ companyID, state: '' }] : [],
            uFactory:  uFactory || [],
            status:    'a',
            uiPerms:   {},
            createdAt: new Date(),
            createBy:  { userID: createByUserID || '' },
        });

        await user.save();

        const saved = user.toObject();
        delete saved.uInfo.userPass;

        res.status(201).json({ success: true, user: saved });

    } catch (err) {
        console.error('[createOfficeUser]', err);
        next(err);
    }
};


// ## update OfficeUser Perms
// router.put('/user/perms', checkAuthA, checkUUID, admController.updateOfficeUserPerms);
exports.updateOfficeUserPerms = async (req, res, next) => {
    const { userID, uiPerms } = req.body;

    if (!userID) {
        return res.status(400).json({ message: 'userID required' });
    }

    try {
        await Useracc.findOneAndUpdate(
            { userID },
            { $set: { uiPerms: uiPerms || {} } },
            { new: true }
        );

        res.json({ success: true });
    } catch (err) {
        console.error('[updateOfficeUserPerms]', err);
        next(err);
    }
};


exports.updateOfficeUserInfo = async (req, res, next) => {
    try {
        const { userID, userName, tel, email, status, uFactory } = req.body;
        if (!userID) return res.status(400).json({ message: 'userID required' });

        await Useracc.findOneAndUpdate(
            { userID },
            { $set: {
                'uInfo.userName': userName || '',
                'uInfo.tel':      tel      || '',
                'uInfo.email':    email    || '',
                status:           status   || 'a',
                uFactory:         uFactory || [],
            }}
        );
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

exports.updateOfficeUserPassword = async (req, res, next) => {
    try {
        const { userID, userPass } = req.body;
        if (!userID || !userPass) return res.status(400).json({ message: 'userID and userPass required' });

        const hashed = await bcrypt.hash(userPass + 'pwd' + userPass, 10);
        await Useracc.findOneAndUpdate(
            { userID },
            { $set: { 'uInfo.userPass': hashed } }
        );
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// ## office user
// #############################################################


// #############################################################
// ## perm comments

// ## GET /api/a/adm/perm-comments/:companyID
exports.getPermComments = async (req, res, next) => {
    try {
        const { companyID } = req.params;
        const doc = await PermComment.findOne({ companyID }).lean();
        // Map ใน mongoose lean() คืนเป็น plain object
        const comments = doc?.comments ? Object.fromEntries(Object.entries(doc.comments)) : {};
        res.json({ comments });
    } catch (err) {
        console.error('[getPermComments]', err);
        next(err);
    }
};

// ## PUT /api/a/adm/perm-comments
// ## body: { companyID, permKey, comment }
exports.updatePermComment = async (req, res, next) => {
    try {
        const { companyID, permKey, comment } = req.body;
        if (!companyID || !permKey) {
            return res.status(400).json({ message: 'companyID and permKey required' });
        }
        const field = `comments.${permKey}`;
        await PermComment.findOneAndUpdate(
            { companyID },
            { $set: { [field]: comment || '' } },
            { upsert: true, new: true }
        );
        res.json({ success: true });
    } catch (err) {
        console.error('[updatePermComment]', err);
        next(err);
    }
};

// ## perm comments
// #############################################################
