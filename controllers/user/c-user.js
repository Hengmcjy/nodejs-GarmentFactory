const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const moment = require('moment-timezone');

const io = require('../../socket');

const ShareFunc = require("../c-api-app-share-function");

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



const UnitSize = require("../../models/m-unitSize");
const UnitWeight = require("../../models/m-unitWeight");


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

// #######################################################################################################
// ## general

// // ## http://172.31.193.5:3968/api/user/test/test12
// router.get("/test/test12", userController.getTestTest12); 
// ## edit orderProduction forloss --> normal
exports.getTestTest12 = async (req, res, next) => {
  const bundleData = [
    {
      companyID: 'c000001',
      factoryID: 'f000001',
      orderID: 'DDE60A4S',
      productBarcode: 'DDE60A4S    UK-------24WH--------F---',
      bundleNo1: 1448199,
      bundleNo2: 1448205,
      no1: 1749,
      no2: 1832,
      productCount: 12,
      forLoss: false
    },
    {
      companyID: 'c000001',
      factoryID: 'f000001',
      orderID: 'DDE60A4S',
      productBarcode: 'DDE60A4S    UK-------24GL--------F---',
      bundleNo1: 1448206,
      bundleNo2: 1448211,
      no1: 1423,
      no2: 1494,
      productCount: 12,
      forLoss: false
    },
    {
      companyID: 'c000001',
      factoryID: 'f000001',
      orderID: 'DDE60A4S',
      productBarcode: 'DDE60A4S    UK-------24LY--------F---',
      bundleNo1: 1448212,
      bundleNo2: 1448213,
      no1: 315,
      no2: 338,
      productCount: 12,
      forLoss: false
    },
  ];

  await this.asyncForEach(bundleData, async (item1) => {
    const result = await ShareFunc.editOrderProductionForloss(
      item1.companyID, 
      item1.factoryID,
      item1.orderID, 
      item1.productBarcode, 
      +item1.bundleNo1, 
      +item1.bundleNo2, 
      +item1.no1, 
      +item1.no2,
      +item1.productCount,
      item1.forLoss
      );
  });

  const result1 = 'OK';

  res.setHeader('Content-Type', 'text/html');
  res.write('<html>');
  res.write('<head><title>cancel queue order  by product barcode</title><head>');
  res.write('<body>');
  res.write('<h1>cancel queue order V2  </h1></br>');
  res.write('<h1>by product barcode</h1>');
  res.write('<h1>'+result1+'</h1>');
  res.write('</body>');
  res.write('</html>');
  return res.end();
}



// // ## http://192.168.1.7:3968/api/user/test/test10
// ## cancel queue order  by product barcode
exports.getTestTest10 = async (req, res, next) => {
  // BA1OPA4S      JAPN-----24OM--------XS--
  // xs
  // 1441399
  // 49 - 54
  const bundleData = [
    {
      companyID: 'c000001',
      orderID: 'BA1OPA4S',
      productBarcode: 'BA1OPA4S    JAPN-----24OM--------XS--',
      bundleNo1: 1441399,
      bundleNo2: 1441399,
      no1: 49,
      no2: 54,
      productCount: 6,
    },
  ];

  // await this.asyncForEach(bundleData, async (item1) => {
  //   const result = await ShareFunc.getDelOrderProductionV3(
  //     item1.companyID, 
  //     item1.orderID, 
  //     item1.productBarcode, 
  //     +item1.bundleNo1, 
  //     +item1.bundleNo2, 
  //     +item1.no1, 
  //     +item1.no2,
  //     +item1.productCount
  //     );
  // });

  const result1 = 'OK';

  res.setHeader('Content-Type', 'text/html');
  res.write('<html>');
  res.write('<head><title>cancel queue order  by product barcode</title><head>');
  res.write('<body>');
  res.write('<h1>cancel queue order V2  </h1></br>');
  res.write('<h1>by product barcode</h1>');
  res.write('<h1>'+result1+'</h1>');
  res.write('</body>');
  res.write('</html>');
  return res.end();

}

// // ## http://172.31.194.9:3968/api/user/test/test16
// router.get("/test/test16", userController.getTestTest16);  // delete all orderProduction , orderProductionQueueList , orderProductionQueue
exports.getTestTest16 = async (req, res, next) => {
  const companyID = 'c000001';
  const orderIDs = 
  [
    '23FRAW-006', 'UR391',
    'JBAD9A3A',   'GL-115B',
    'GL-116B',    '23F-YM505',
    '23F-BP1508', 'GL-92B',
    'AA0Q4A3A',   'BA1OEA3A',
    'DD0ISA3A',   'AA0Q1A3A',
    'BA1O0A3A',   'AA0Q6A3A',
    'BAI13A3A',   'BA1ODA3A',
    'BA1NIA3A',   'AA0PKA3A',
    'AA0PJA3A',   'BA1NWA3A',
    'AA0PVA3A',   'BA1NUA3A'
  ];

  // // ## delete many orderProduction
  // const result01 = await OrderProduction.deleteMany({$and: [
  //   {"companyID":companyID}, 
  //   {"orderID":{$in: orderIDs}},
  // ]});

  // // ## delete many orderProductionQueueList
  // const result02 = await OrderProductionQueueList.deleteMany({$and: [
  //   {"companyID":companyID}, 
  //   {"orderID":{$in: orderIDs}},
  // ]});

  // // ## delete many orderProductionQueue
  // const result03 = await OrderProductionQueue.deleteMany({$and: [
  //   {"companyID":companyID}, 
  //   {"orderID":{$in: orderIDs}},
  // ]});


  const result1 = 'OK';

  res.setHeader('Content-Type', 'text/html');
  res.write('<html>');
  res.write('<head><title>delete many    by orderIDs </title><head>');
  res.write('<body>');
  res.write('<h1>delete  orderProduction  </h1></br>');
  res.write('<h1>delete  orderProductionQueueList  </h1></br>');
  res.write('<h1>delete  orderProductionQueue  </h1></br>');
  res.write('<h1>by orderIDs</h1>');
  res.write('<h1>'+result1+'</h1>');
  res.write('</body>');
  res.write('</html>');
  return res.end();
}

// // ## http://192.168.53.42:3968/api/user/test/test9
// ## cancel queue order  by product barcode
exports.getTestTest9 = async (req, res, next) => {
  // ## cancel queue order all by product barcode

  const bundleData = [
    {
      companyID: 'c000001',
      orderID: 'BA1OPA4S',
      productBarcode: 'BA1OPA4S    UK-------24BK--------XS--',
      bundleNo: 1418125,
      no1: 356,
      no2: 367,
      productCount: 12,
    },
    {
      companyID: 'c000001',
      orderID: 'BA1OPA4S',
      productBarcode: 'BA1OPA4S    UK-------24BK--------S---',
      bundleNo: 1418126,
      no1: 502,
      no2: 513,
      productCount: 12,
    },
    {
      productBarcode: 'BA1OPA4S    UK-------24BK--------M---',
      bundleNo: 1418127,
      no1: 562,
      no2: 573,
      productCount: 12,
    },
    {
      companyID: 'c000001',
      orderID: 'BA1OPA4S',
      productBarcode: 'BA1OPA4S    UK-------24BK--------M---',
      bundleNo: 1418128,
      no1: 574,
      no2: 585,
      productCount: 12,
    },
    {
      companyID: 'c000001',
      orderID: 'BA1OPA4S',
      productBarcode: 'BA1OPA4S    UK-------24BK--------L---',
      bundleNo: 1418129,
      no1: 364,
      no2: 375,
      productCount: 12,
    },
    {
      companyID: 'c000001',
      orderID: 'BA1OPA4S',
      productBarcode: 'BA1OPA4S    UK-------24BK--------XL--',
      bundleNo: 1418130,
      no1: 135,
      no2: 146,
      productCount: 12,
    },
  ];

  // await this.asyncForEach(bundleData, async (item1) => {
  //   const result = await ShareFunc.getDelOrderProductionV2(
  //     item1.companyID, 
  //     item1.orderID, 
  //     item1.productBarcode, 
  //     item1.bundleNo, 
  //     item1.no1, 
  //     item1.no2,
  //     item1.productCount
  //     );
  // });

  const result1 = 'OK';

  res.setHeader('Content-Type', 'text/html');
  res.write('<html>');
  res.write('<head><title>cancel queue order  by product barcode</title><head>');
  res.write('<body>');
  res.write('<h1>cancel queue order V2  </h1></br>');
  res.write('<h1>by product barcode</h1>');
  res.write('<h1>'+result1+'</h1>');
  res.write('</body>');
  res.write('</html>');
  return res.end();
}

// ## http://172.31.195.31:3968/api/user/test/test15
// ## view group qty orderProduction / productBarcode   
// router.get("/test/test15", userController.getTestTest15);  
exports.getTestTest15 = async (req, res, next) => {
  const current = new Date(moment().tz('Asia/Bangkok').format('YYYY/MM/DD HH:mm:ss+07:00'));
  const companyID = 'c000001';
  const orderID = 'AA0QFA4S';
  const productBarcode = 'AA0QFA4S    JAPN-----24GR--------M---';

  let result = [];
  // result = await OrderProduction.aggregate([
  //   { $match: { $and: [
  //     {"companyID":companyID},
  //     // {"factoryID":factoryID},
  //     {"orderID":orderID},
  //     // {"productID":productID},
  //     // {"productBarcodeNoReal":{$in: productBarcodeNoArr}},
  //   ] } },
  //   { $project: {			
  //       _id: 0,	
  //       companyID: 1,
  //       // factoryID: 1,		
  //       // orderID: 1,	
  //       // productID: 1,
  //       productBarcodeNo: 1,
  //       productBarcodeNoReal: 1,
  //       productBarcode: { $toUpper:{ $substr: [ "$productBarcodeNoReal", +process.env.productBarcodePos, +process.env.productBarcodeDigit ] }},
  //       // bundleNo: 1,
  //   }	},
  //   { $match: { $and: [
  //     {"productBarcode":productBarcode},
  //     // {"productBarcodeNoReal":{$in: productBarcodeNoArr}},
  //   ] } },
  //   { $project: {			
  //     _id: 0,	
  //     companyID: 1,
  //     // factoryID: 1,		
  //     // orderID: 1,	
  //     // productID: 1,
  //     // productBarcodeNo: 1,
  //     productBarcodeNoReal: 1,
  //   }	},
  // ]);
  console.log(result.length);
  return res.send(result);
}

// ## http://192.168.1.35:3968/api/user/test/test17
// router.get("/test/test17", userController.getTestTest17);  // ##  update ver for orderProduction all
exports.getTestTest17 = async (req, res, next) => {
  const companyID = 'c000001';
  const ver = 1;

  // const result1 = await OrderProduction.updateMany(
  //   {$and: [
  //     {"companyID":companyID}  ,
  //     // {"factoryID":fromFactoryID}  ,
  //   ]},
  //   {$set: { 
  //     "ver": ver
  //   }}, 
  // );

  console.log('OK update ver for orderProduction all');
  res.setHeader('Content-Type', 'text/html');
  res.write('<html>');
  res.write('<head><title>update ver for orderProduction all</title><head>');
  res.write('<body>');
  res.write('<h1>update ver for orderProduction   </h1></br>');
  res.write('<h1>all</h1>');
  res.write('<h1>'+ ' OK '+'</h1>');
  res.write('</body>');
  res.write('</html>');
  return res.end();

}

// ## http://192.168.1.35:3968/api/user/test/test18
// router.get("/test/test18", userController.getTestTest18);  // ##  update ver for order all
exports.getTestTest18 = async (req, res, next) => {
  const companyID = 'c000001';
  const ver = 1;

  const result1 = await Order.updateMany(
    {$and: [
      {"companyID":companyID}  ,
      // {"factoryID":fromFactoryID}  ,
    ]},
    {$set: { 
      "ver": ver
    }}, 
  );

  console.log('OK update ver for order all');
  res.setHeader('Content-Type', 'text/html');
  res.write('<html>');
  res.write('<head><title>update ver for order all</title><head>');
  res.write('<body>');
  res.write('<h1>update ver for order    </h1></br>');
  res.write('<h1>all</h1>');
  res.write('<h1>'+ ' OK '+'</h1>');
  res.write('</body>');
  res.write('</html>');
  return res.end();

}

// ## http://192.168.1.35:3968/api/user/test/test19
// router.get("/test/test19", userController.getTestTest19);  // ##  update ver for orderProductionQueue all
exports.getTestTest19 = async (req, res, next) => {
  const companyID = 'c000001';
  const ver = 1;

  const result1 = await OrderProductionQueue.updateMany(
    {$and: [
      {"companyID":companyID}  ,
      // {"factoryID":fromFactoryID}  ,
    ]},
    {$set: { 
      "ver": ver
    }}, 
  );

  console.log('OK update ver for orderProductionQueue all');
  res.setHeader('Content-Type', 'text/html');
  res.write('<html>');
  res.write('<head><title>update ver for orderProductionQueue all</title><head>');
  res.write('<body>');
  res.write('<h1>update ver for orderProductionQueue     </h1></br>');
  res.write('<h1>all</h1>');
  res.write('<h1>'+ ' OK '+'</h1>');
  res.write('</body>');
  res.write('</html>');
  return res.end();

}

// ## http://192.168.1.35:3968/api/user/test/test20
// router.get("/test/test20", userController.getTestTest20);  // ##  update ver for orderProductionQueue = queueInfo --> []
exports.getTestTest20 = async (req, res, next) => {
  const companyID = 'c000001';
  const orderID = 'BA1OOA4S';
  const ver = 1;

  const result1 = await OrderProductionQueue.updateMany(
    {$and: [
      {"companyID":companyID},
      {"orderID":orderID},
      // {"factoryID":fromFactoryID}  ,
    ]},
    {$set: { 
      "queueInfo": []
    }}, 
  );

  console.log('OK update ver for orderProductionQueue = queueInfo --> []');
  res.setHeader('Content-Type', 'text/html');
  res.write('<html>');
  res.write('<head><title>update ver for orderProductionQueue = queueInfo --> []</title><head>');
  res.write('<body>');
  res.write('<h1>update ver for orderProductionQueue = queueInfo --> []     </h1></br>');
  res.write('<h1> [] </h1>');
  res.write('<h1>'+ ' OK '+'</h1>');
  res.write('</body>');
  res.write('</html>');
  return res.end();

}

// ## http://192.168.1.35:3968/api/user/test/orderProductionQueue/01
// router.get("/test/orderProductionQueue/01", userController.getOrderProductionQueue01);  // ##  update orderProductionQueue insert queueInfo
exports.getOrderProductionQueue01 = async (req, res, next) => {
  const companyID = 'c000001';
  const orderID = 'BA1P5A4A';
  const ver = 2;
  // const productID = 'AAD05A4A    ';

  const factory = 'f000001';
  const productBarcode = 'BA1P5A4A    UK-------24OM--------L---';
  const bundleNoFrom = 16867;
  const bundleNoTo = 16867;  // 
  const startNo = 507;
  const endNo = 514;
  const productCount = 8;
  const yarnLot = [{yarnLotID: '2315-574-1'}];
  const queueDate = new Date(moment().tz('Asia/Bangkok').format('YYYY/MM/DD HH:mm:ss+07:00'));
  const isOutsource = false;
  const forLoss = false;
  const forLossQty = 0;
  const toNode = '1.COMPUTER-KNITTING';


  let queueInfo = [];

  let round = 1;
  // let startNo0 = startNo;
  let startNo1 = startNo; // ## number start each bundle
  let endNo1 = 0;
  // ## ceate numberFrom , numberTo
  for (let i = bundleNoFrom; i <= bundleNoTo; i++) {
    endNo1 = startNo + (round * productCount) - 1;
    let queueInfo1 = {
      productBarcode: productBarcode,
      factory: factory,
      queueDate: queueDate,
      isOutsource: isOutsource,
      forLoss: forLoss,
      forLossQty: forLossQty,
      toNode: toNode,
      productCount: productCount,
      bundleNo: i,
      bundleID: 'x',
      yarnLot: yarnLot,
      numberFrom: startNo1,
      numberTo: endNo1,
    };
    queueInfo.push(queueInfo1);

    startNo1 = endNo1 + 1;
    round++;
  }
 
  // getOrderProductbundleID= async (companyID, orderID, ver, productBarcodeNoReal)
  // ## find bundleID
  await this.asyncForEach(queueInfo, async (item1) => {
    const num5 = await ShareFunc.setStrLen(5, item1.numberFrom);
    const productBarcodeNoReal = productBarcode+num5;
    const bundleID = await ShareFunc.getOrderProductbundleID(companyID, orderID, ver, productBarcodeNoReal);
    item1.bundleID = bundleID;
  });

  

  const result5 = await OrderProductionQueue.updateOne(
    {$and: [
      {"companyID":companyID},
      {"orderID":orderID},
      {"ver":ver},
    ]}, 
    {
      // "forLossQty": forLossQty,
      $push: {queueInfo: {$each:queueInfo,  $position: 0}}  // ## add new element at the first
    },
    {upsert: true});



  // console.log(queueInfo);
  console.log('OK update insert for orderProductionQueue = insert queueInfo ');
  res.setHeader('Content-Type', 'text/html');
  res.write('<html>');
  res.write('<head><title>OK update insert for orderProductionQueue = insert queueInfo </title><head>');
  res.write('<body>');
  res.write('<h1>OK update insert for orderProductionQueue = insert queueInfo    </h1></br>');
  res.write('<h1> [] </h1>');
  res.write('<h1>'+ ' OK '+'</h1></br>');
  // res.write(queueInfo);
  // res.write('<h1>'+queueInfo+'</h1>');
  res.write('</body>');
  res.write('</html>');
  return res.end();

}

// // ## http://192.168.1.35:3968/api/user/test/test14
// ## ## cancel orderProduction , queue (all) 100%
exports.getTestTest14 = async (req, res, next) => {

  const bundleData = [
    {
      companyID: 'c000001',
      orderID: 'DCB07A4S',
    },
  ];

  // await this.asyncForEach(bundleData, async (item1) => {
  //   const result = await ShareFunc.delAllOrderProduction(
  //     item1.companyID, 
  //     item1.orderID
  //     );
  // });

 const result = true;
  res.setHeader('Content-Type', 'text/html');
  res.write('<html>');
  res.write('<head><title>cancel  order production  by product orderID</title><head>');
  res.write('<body>');
  res.write('<h1>cancel  order production , queue </h1></br>');
  res.write('<h1>by product barcode</h1>');
  res.write('<h1>'+result+'</h1>');
  res.write('</body>');
  res.write('</html>');
  return res.end();
}

// // ## http://192.168.1.60:3968/api/user/test/test11
// ## cancel orderProduction (some)
exports.getTestTest11 = async (req, res, next) => {
  // // ## cancel queue order all by product barcode  (companyID, orderID, productBarcode, no1, no2)
  // const companyID = 'c000001';
  // const orderID = 'AA0QFA4S';
  // const productBarcode = 'AA0QFA4S    UK-------24BK--------M---';
  // const no1 = 0;
  // const no2 = 467;
  // const result = await ShareFunc.getDelOrderProduction2(companyID, orderID, productBarcode, no1, no2);

  res.setHeader('Content-Type', 'text/html');
  res.write('<html>');
  res.write('<head><title>cancel  order production  by product barcode</title><head>');
  res.write('<body>');
  res.write('<h1>cancel  order production  </h1></br>');
  res.write('<h1>by product barcode</h1>');
  res.write('<h1>'+result+'</h1>');
  res.write('</body>');
  res.write('</html>');
  return res.end();
}

// // ## http://192.168.0.181:3968/api/user/test/test8
// ## cancel queue order  by product barcode
exports.getTestTest8 = async (req, res, next) => {

  // ## cancel queue order all by product barcode
  const result = await ShareFunc.getDelOrderProduction1();

  res.setHeader('Content-Type', 'text/html');
  res.write('<html>');
  res.write('<head><title>cancel queue order  by product barcode</title><head>');
  res.write('<body>');
  res.write('<h1>cancel queue order  </h1></br>');
  res.write('<h1>by product barcode</h1>');
  res.write('<h1>'+result+'</h1>');
  res.write('</body>');
  res.write('</html>');
  return res.end();
}

// // ## http://192.168.1.23:3968/api/user/test/test7
// ## cancel queue order all by product barcode
exports.getTestTest7 = async (req, res, next) => {

  // // ## cancel queue order all by product barcode
  // const result = await ShareFunc.cancelOrderQueueAllByProductBarcode();

  res.setHeader('Content-Type', 'text/html');
  res.write('<html>');
  res.write('<head><title>cancel queue order all by product barcode</title><head>');
  res.write('<body>');
  res.write('<h1>cancel queue order all </h1></br>');
  res.write('<h1>by product barcode</h1>');
  res.write('<h1>'+result+'</h1>');
  res.write('</body>');
  res.write('</html>');
  return res.end();
}

// // ## http://192.168.1.50:3968/api/user/test/test6
// router.get("/test/test5", userController.getTestTest6);
exports.getTestTest6 = async (req, res, next) => {
  // // ## update orderProduction / edit bundleNo
  // const result = await ShareFunc.updateOrderProductionForBundleNo();

  res.setHeader('Content-Type', 'text/html');
  res.write('<html>');
  res.write('<head><title>edit orderProduction bundleNo</title><head>');
  res.write('<body>');
  res.write('<h1>update orderProduction / edit bundleNo</h1></br>');
  res.write('<h1>update orderProduction / edit bundleNo</h1>');
  res.write('<h1>'+result+'</h1>');
  res.write('</body>');
  res.write('</html>');
  return res.end();

}



// // ## http://192.168.1.35:3968/api/user/test/test5_1
// router.get("/test/test5_1", userController.getTestTest5_1);
// ## add productionNode to orderProduction @ position nodeID
exports.getTestTest5_1 = async (req, res, next) => {
  const current = new Date(moment().tz('Asia/Bangkok').format('YYYY/MM/DD HH:mm:ss+07:00'));
  const companyID = 'c000001';
  const factoryID = 'f000002';
  const toNode = '2.PANAL-INSPECTION'; // 2.PANAL-INSPECTION
  const productStatus = ['normal'];
  // 1.COMPUTER-KNITTING
  // 2.PANAL-INSPECTION
  // 3.LINKING
  // 4.MENDING
  // 5.WASHING
  // 6.PRESSING
  // 7.QC

  

  // // 5.WASHING
  // const productionNodeArr = [
  //   {
  //     factoryID: factoryID,
  //     fromNode: '5.WASHING',
  //     toNode: '6.PRESSING',
  //     datetime: current,
  //     status: 'normal',
  //     isOutsource: false,
  //     outsourceData: [],
  //     problemID: '',
  //     problemName: '',
  //     createBy: {userID: '1xx1', userName: '1xx1'}
  //   },
    
  // ];


  // 2.PANAL-INSPECTION
  const productionNodeArr = [
    {
      factoryID: factoryID,
      fromNode: '2.PANAL-INSPECTION',
      toNode: '3.LINKING',
      datetime: current,
      status: 'normal',
      isOutsource: false,
      outsourceData: [],
      problemID: '',
      problemName: '',
      createBy: {userID: '1xx1', userName: '1xx1'}
    },
    {
      factoryID: factoryID,
      fromNode: '3.LINKING',
      toNode: '4.MENDING',
      datetime: current,
      status: 'normal',
      isOutsource: false,
      outsourceData: [],
      problemID: '',
      problemName: '',
      createBy: {userID: '1xx1', userName: '1xx1'}
    }
  ];

  const bundleData = [
    {
      companyID: companyID,
      factoryID: factoryID,
      toNode: toNode,
      productStatus: productStatus,
      productionNodeArr: productionNodeArr,
    },
  ];

  // await this.asyncForEach(bundleData, async (item1) => {
  //   const result = await ShareFunc.updateProductionNodeCrossStebPosition(
  //     item1.companyID, 
  //     item1.factoryID,
  //     item1.toNode,
  //     item1.productStatus,
  //     item1.productionNodeArr,
  //     );
  // });

  const result = 'OK';

  res.setHeader('Content-Type', 'text/html');
  res.write('<html>');
  res.write('<head><title>add productionNode @ position nodeID</title><head>');
  res.write('<body>');
  res.write('<h1>add productionNode to orderProduction @ position nodeID</h1></br>');
  res.write('<h1>add push to nodeID we need to</h1>');
  res.write('<h1>'+result+'</h1>');
  res.write('</body>');
  res.write('</html>');
  return res.end();
}

// // ## http://192.168.1.50:3968/api/user/test/test5
// router.get("/test/test5", userController.getTestTest5);
exports.getTestTest5 = async (req, res, next) => {

  // ## for test
  // ## add productionNode to orderProduction
  // const result = await ShareFunc.updateProductionNodeForTest();

  res.setHeader('Content-Type', 'text/html');
  res.write('<html>');
  res.write('<head><title>add productionNode</title><head>');
  res.write('<body>');
  res.write('<h1>add productionNode to orderProduction</h1></br>');
  res.write('<h1>add push to nodeID we need to</h1>');
  res.write('<h1>'+result+'</h1>');
  res.write('</body>');
  res.write('</html>');
  return res.end();

  return res.status(200).json({
    // blankRows: blankRows,
    // targetPlaces: targetPlaces,
    // colors: colors,
    // sizes: sizes,
    // langs: langs,
    // langData: langData,
    // userClass: userClass,
    // controlApp: controlApp,
    // sysInfo: sysInfo,
    // outSourceLocationDepartment: outSourceLocationDepartment
    // updateQrCodeRealOrderProduction: updateQrCodeRealOrderProduction
  });
}

// // ## http://192.168.1.141:3968/api/user/test/test4
exports.getTestTest4 = async (req, res, next) => {
  // const blankRows = await ShareFunc.getBlankRows();

  return res.status(200).json({
    // blankRows: blankRows,
    // targetPlaces: targetPlaces,
    // colors: colors,
    // sizes: sizes,
    // langs: langs,
    // langData: langData,
    // userClass: userClass,
    // controlApp: controlApp,
    // sysInfo: sysInfo,
    // outSourceLocationDepartment: outSourceLocationDepartment
    // updateQrCodeRealOrderProduction: updateQrCodeRealOrderProduction
  });
}

// // ## http://192.168.1.35:3968/api/user/test/test3
// ## update multi langs here
exports.getTestTest3 = async (req, res, next) => {

  // // read xlsx file
  // // import xlsx file
  // // yarn and language

  // ## get lang from excel and update langs in database
  const readXLSXFileForLang = await ShareFunc.readXLSXFileForLang();
  // const readXLSXFileForYarn = await ShareFunc.readXLSXFileForYarn();

  return res.status(200).json({
    readXLSXFileForLang: readXLSXFileForLang,
    // readXLSXFileForYarn: readXLSXFileForYarn,
    // targetPlaces: targetPlaces,
    // colors: colors,
    // sizes: sizes,
    // langs: langs,
    // langData: langData,
    // userClass: userClass,
    // controlApp: controlApp,
    // sysInfo: sysInfo,
    // outSourceLocationDepartment: outSourceLocationDepartment
    // updateQrCodeRealOrderProduction: updateQrCodeRealOrderProduction
  });

}

// // ## http://192.168.1.141:3968/api/user/test/test2
// router.get("/test/test2", userController.getTestTest2);
exports.getTestTest2 = async (req, res, next) => {
  
  // // xxFindCountry2
  // const updateTargetPlaceCountryIDOrder = await ShareFunc.xxFindOrder();

  // updateTargetPlaceOrderProduction
  // const updateTargetPlaceOrderProduction = await ShareFunc.updateTargetPlaceOrderProduction();

  // ## test array filter
  // https://www.mongodb.com/docs/manual/reference/operator/aggregation/filter/
  // productBarcodeNo    productBarcodeNoReserve  []

 
  // // editQueueInfoOfOrderProductionQueue
  // // orderProductionQueue
  // const result01 = await ShareFunc.editQueueInfoOfOrderProductionQueue_CancelOrderProduction01();

  // ## update QRcode real
  // const updateQrCodeRealOrderProduction = await ShareFunc.updateQrCodeRealOrderProduction();
  // console.log(updateQrCodeRealOrderProduction);

  //  edit OrderProduction
  // const editOrderProduction02 = await ShareFunc.editOrderProduction02();


  // // delete OrderProduction
  // const deleteManyOrderProductionbyOrderID = await ShareFunc.deleteManyOrderProductionbyOrderID();
  
  // const editOrderProduction02 = await ShareFunc.getCCurrentProductQtyAllXX();

  
  // // ## test get data
  // const testview2 = await ShareFunc.testview2();
  // console.log(testview2);

  // // ## update colorset name for muji
  // // updateColorSetOrderProductionMuji
  // const result01 = await ShareFunc.updateColorSetOrderProductionMuji();


  // // ## edit order factoryID
  // // updateOrderAboutFactory
  // const result01 = await ShareFunc.updateOrderAboutFactory();

  // ## test socket IO
  io.getIO().emit(process.env.IOID+'/iomessage/user', {
    action: 'sent by socketIO',
    post: { socket: 'IO', creator: { _id: req.body.userID, name: 'namex' } }
  });

  
  const test = await ShareFunc.test1();
  res.setHeader('Content-Type', 'text/html');
  res.write('<html>');
  res.write('<head><title>2.) test command mongodb</title><head>');
  res.write('<body>');
  res.write('<h1>2.) test command mongodb</h1></br>');
  res.write('<h1>Hello from my Node.js Server!</h1>');
  res.write('</body>');
  res.write('</html>');
  return res.end();
}

// gettestexplain1
// ## http://172.31.197.31:3968/api/user/test/explain1/testexplain1
// router.get("/test/explain1/testexplain1", userController.gettestexplain1);
exports.gettestexplain1 = async (req, res, next) => {
  console.log('gettestexplain1');
  const companyID = 'c000001';
  const factoryID = 'f000001';
  const explain = await Factory.aggregate([
    { $match: { $and: [
      {"companyID":companyID},
      {"factoryID":factoryID},
    ] } },
    { $project: {			
        _id: 1,	
        companyID: 1,		
        factoryID: 1,	
        show: 1,
        fDescription: 1,	
        fInfo: 1,
        nodeStationSetting: 1,
    }	}
  ]).explain("executionStats");
  // console.log(explain);
  return res.send(explain);
}

// ## http://192.168.1.25:3968/api/user/test/explain1/testexplain2
// router.get("/test/explain1/testexplain2", userController.gettestexplain2);
exports.gettestexplain2 = async (req, res, next) => {
  console.log('gettestexplain2');
  const companyID = 'c000001';
  const factoryID = 'f000001';
  const orderID = 'AA0QFA4S';
  const productBarcodeNoReal = ['AA0QFA4S    JAPN-----24GR--------M---00476'];
  
  const open = true;
  const productStatusArr = ['complete'];

  const explain = await OrderProduction.aggregate([
    { $match: { $and: [
      {"productStatus":{$in: productStatusArr}},
      {"companyID":companyID},
      {"open":open},
      // {"factoryID":factoryID},
      // {"orderID":orderID},
      // {"productBarcodeNoReal":{$in: productBarcodeNoReal}},
    ] } },
    { $project: {			
        _id: 1,	
        companyID: 1,
        factoryID: 1,		
        orderID: 1,	
        productID: 1,
        productBarcodeNo: 1,
        productBarcodeNoReal: 1,
    }	},
  ]).explain("executionStats");

  
  // console.log(explain);
  return res.send(explain);
}

// ## http://172.31.201.13:3968/api/user/test/explain1/testexplain3
// router.get("/test/explain1/testexplain3", userController.gettestexplain3);
exports.gettestexplain3 = async (req, res, next) => {
  console.log('gettestexplain3');
  const companyID = 'c000001';
  const factoryID = 'f000001';
  const orderID = 'AA0QFA4S';
  const orderIDArr = ['AA0QFA4S'];
  const productBarcodeNoReal = ['AA0QFA4S    JAPN-----24GR--------M---00476'];
  
  const open = true;
  const openArr = [true];
  const productStatusArr = ['complete'];
  const forLossArr = [true];

  const explain = await OrderProduction.aggregate([
    { $match: { $and: [
      {"companyID":companyID},
      // {"factoryID":factoryID},
      {"orderID":{$in: orderIDArr}},
      {"productStatus":{$in: productStatusArr}},
      {"open":{$in: openArr}},
      {"forLoss":{$in: forLossArr}},
    ] } },
    { $project: {			
        _id: 0,	
        companyID: 1,
        // factoryID: 1,		
        orderID: 1,	
        // bundleNo: 1,
        // productID: 1,
        // productBarcodeNo: 1,
        productBarcodeNoReal: 1,
        // productionNode: { $slice: [ "$productionNode", -1]  },  // ## get last 1 element
        // productionNode: 1,
        style: { $toUpper:{ $substr: [ "$productBarcodeNoReal", +process.env.stylePos, +process.env.styleDigit ] }},
        targetPlace: { $toUpper:{ $substr: [ "$productBarcodeNoReal", +process.env.targetIDPos, +process.env.targetIDDigit ] }},
        // countryID: { $toUpper:{ $substr: [ "$productBarcodeNoReal", +process.env.countryIDPos, +process.env.countryIDDigit ] }},
        // year: { $toUpper:{ $substr: [ "$productBarcodeNoReal", +process.env.yearPos, +process.env.yearDigit ] }},
        color: { $toUpper:{ $substr: [ "$productBarcodeNoReal", +process.env.colorPos, +process.env.colorDigit ] }},
        size: { $toUpper:{ $substr: [ "$productBarcodeNoReal", +process.env.sizePos, +process.env.sizeDigit ] }},
    }	},


    { $group: {			
      _id: { 
        companyID: '$companyID',
        orderID: '$orderID',
        style: '$style',
        targetPlace: '$targetPlace',
        color: '$color',
        size: '$size',
        // fromNode: '$fromNode',
    },
      sumProductQty: {$sum: 1} ,
    }}  
  ]).explain("executionStats");

  // console.log(explain);
  return res.send(explain);
}

// ## http://192.168.1.27:3968/api/user/test/explain1/testexplain4
// router.get("/test/explain1/testexplain4", userController.gettestexplain4);
exports.gettestexplain4 = async (req, res, next) => {
  console.log('gettestexplain4');
  const companyID = 'c000001';
  const factoryID = 'f000001';
  const orderID = 'AA0QFA4S';
  const orderIDArr = ['AA0QFA4S'];
  const productBarcodeNoReal = ['AA0QFA4S    JAPN-----24GR--------M---00476'];
  
  const open = true;
  const openArr = [true];
  const productStatusArr = ['complete'];
  const forLossArr = [true];
  const productionNodeStatusArr = ['normal', 'complete'];

  const explain = await OrderProduction.aggregate([
    // { $unwind: "$productionNode" },
    { $match: { $and: [
      {"companyID":companyID},
      // {"factoryID":factoryID},
      {"orderID":{$in: orderIDArr}},
      {"productStatus":{$in: productStatusArr}},

      // {"productionNode.status":{$in: productionNodeStatusArr}}
      // {"productionNode.factoryID": factoryID }

      {"productionNode":  {$elemMatch: {"status":{$in: productionNodeStatusArr}}}},
      // {"productionNode":  {$elemMatch: { "factoryID": factoryID }}},
    ] } },
    // { $project: {			
    //     _id: 0,	
    //     companyID: 1,		
    //     orderID: 1,	
    //     productBarcodeNo: 1,
    //     productBarcodeNoReal: 1,
    //     productionNode: 1,
    // }	},

    { $unwind: "$productionNode" },
    { $project: { 
      _id: 0, 
      companyID: 1,	
      orderID: 1,	
      // productBarcodeNoReal: 1,
      style: { $toUpper:{ $substr: [ "$productBarcodeNoReal", +process.env.stylePos, +process.env.styleDigit ] }},
      // targetPlace: { $toUpper:{ $substr: [ "$productBarcodeNoReal", process.env.targetIDPos, process.env.targetIDDigit ] }},
      // countryID: { $toUpper:{ $substr: [ "$productBarcodeNoReal", process.env.countryIDPos, process.env.countryIDDigit ] }},
      // year: { $toUpper:{ $substr: [ "$productBarcodeNoReal", process.env.yearPos, process.env.yearDigit ] }},
      color: { $toUpper:{ $substr: [ "$productBarcodeNoReal", +process.env.colorPos, +process.env.colorDigit ] }},
      size: { $toUpper:{ $substr: [ "$productBarcodeNoReal", +process.env.sizePos, +process.env.sizeDigit ] }},
      // productCount: 1,
      // productionDate: 1,
      // productStatus: 1,
      fromNode: "$productionNode.fromNode",
      // toNode: "$productionNode.toNode",
      // status: "$productionNode.status",
      // datetime: "$productionNode.datetime",
      // createBy: "$productionNode.createBy",
    }},

    { $match: { $and: [
      {"status":{$in: productionNodeStatusArr}}
    ] } },

    { $project: { 
      _id: 0, 
      companyID: 1,
      // factoryID: 1,		
      orderID: 1,	
      style: 1,
      color: 1,
      size: 1,
      // productProblem: 1,
      // fromNode: 1,
      fromNode: 1,
      // datetime: 1,
      // createBy: 1,
    }},

    { $group: {			
      _id: { 
        companyID: '$companyID',
        orderID: '$orderID',
        style: '$style',
        color: '$color',
        size: '$size',
        fromNode: '$fromNode',
    },
      sumProductQty: {$sum: 1} ,
    }}  
  ]).explain("executionStats");  //  .explain("executionStats")
  console.log('for explain gettestexplain4 -- **');

  // console.log('explain len ==' + explain.length);
  // explain.sort((a,b)=>{
  //   return a._id.companyID >b._id.companyID?1:a._id.companyID <b._id.companyID?-1:0
  //   || a._id.orderID >b._id.orderID?1:a._id.orderID <b._id.orderID?-1:0
  //   || a._id.style >b._id.style?1:a._id.style <b._id.style?-1:0
  //   || a._id.color >b._id.color?1:a._id.color <b._id.color?-1:0
  //   || a._id.size >b._id.size?1:a._id.size <b._id.size?-1:0
  // });

  
  // console.log(explain);
  return res.send(explain);
}

// ## http://192.168.1.25:3968/api/user/test/explain1/testexplain5
// router.get("/test/explain1/testexplain5", userController.gettestexplain5); // ## test node home
exports.gettestexplain5 = async (req, res, next) => {

  console.log('gettestexplain5');
  const companyID = 'c000001';
  const factoryID = 'f000001';  // 
  const factoryIDArr = ['f000001', 'f000002', 'f000003'];
  const orderID = 'BA1OOA4S';
  const orderIDs = ['JBAD9A4S',    'GL-26',    '24S-BP1505',
    '24S-BP1504',  '203-Y24',  'GL-115D',
    'GL-115C',     'BA1OPA4S', 'AA0QEA4S',
    'DAK15A4S',    'DCB08A4S', 'DCB07A4S',
    'DBC33A4S',    'BA1OGA4S', 'UR37-12B005',
    'UR37-12B004', 'BA1OQA4S', 'AA0QFA4S',
    'DCB06A4S',    'BA1ONA4S', 'BA1OOA4S',
    'BA1OFA4S',    'DDB61A4S', 'DDE60A4S',
    '23FRAW-006',  'UR391',    'JBAD9A3A',
    'GL-115B',     'GL-116B',  '23F-YM505',
    '23F-BP1508',  'GL-92B',   'AA0Q4A3A',
    'BA1OEA3A',    'DD0ISA3A', 'AA0Q1A3A',
    'BA1O0A3A',    'AA0Q6A3A', 'BAI13A3A',
    'BA1ODA3A',    'BA1NIA3A', 'AA0PKA3A',
    'AA0PJA3A',    'BA1NWA3A', 'AA0PVA3A',
    'BA1NUA3A'];
  const orderIDArr = orderIDs;
  const productBarcodeNoReal = 'AA0QFA4S    JAPN-----24GR--------M---00476';
  const productBarcodeNoRealArr = ['AA0QFA4S    JAPN-----24GR--------M---00476'];
  const nodeID = '3.LINKING';
  const bundleNo = 1435755;
  const bundleNos = [1435755, 1435756];
  const bundleID = '14089bec-effd-466a-bcd9-529c8880c9c5';
  const open = true;
  const forLoss = false;
  const isOutsourceTracking = false;
  // const openArr = [true];
  const statusArr = ['normal', 'complete'];

  // ## getRepCFNCurrentProductQtyCount  'normal', 'problem', 'repaired'
  const productStatusArr = ['normal', 'problem', 'repaired', 'complete'];  

  const current = new Date(moment().tz('Asia/Bangkok').format('YYYY/MM/DD HH:mm:ss+07:00'));
  const date1 = new Date(moment().tz('Asia/Bangkok').format('2024/01/01 HH:mm:ss+07:00'));
  const date2 = new Date(moment().tz('Asia/Bangkok').format('2024/01/14 HH:mm:ss+07:00'));
  const dateStart = new Date(moment(date1).tz('Asia/Bangkok').format('YYYY/MM/DD 00:00:00+07:00'));
  const dateEnd = new Date(moment(date2).tz('Asia/Bangkok').format('YYYY/MM/DD 23:59:59+07:00'));
  // console.log(dateStart, dateEnd);

  const explain = await OrderProduction.aggregate([
    { $match: { $and: [
      {"companyID":companyID},
      // {"factoryID":factoryID},
      // {"factoryID":{$in: factoryIDArr}},
      {"orderID":{$in: orderIDArr}},
      {"productStatus":{$in: statusArr}},

      {"productionNode":  {$elemMatch: {"factoryID": {$in: factoryIDArr}, "toNode": nodeID }}},
      { $expr: { $in: [{ "$arrayElemAt": ["$productionNode.factoryID", -1] }, factoryIDArr] } },
      { $expr: { $eq: [{ "$arrayElemAt": ["$productionNode.toNode", -1] }, nodeID] } },
      // {"factoryID":{$in: factoryIDArr}},
      // {"toNode":nodeID},

      // .hint( { companyID: 1, orderID: 1, productStatus: 1, productionNode.factoryID: 1, productionNode.toNode: 1 } )
    ] } },
    { $project: {			
        _id: 0,	
        companyID: 1,
        // factoryID: 1,		
        orderID: 1,	
        bundleNo: 1,
        bundleID: 1,
        // productID: 1,
        // targetPlace: 1,
        // productBarcodeNo: 1,
        productBarcodeNoReal: 1,
        productCount: 1,
        // productionDate: 1,
        // productStatus: 1,
        productionNode: { $slice: [ "$productionNode", -1]  },  // ## get last 1 element
    }	},
    { $unwind: "$productionNode" },
    { $project: { 
      _id: 0, 
      companyID: 1,
      // factoryID: 1,		
      orderID: 1,	
      bundleNo: 1,
      bundleID: 1,
      // productID: 1,
      // targetPlaceID: "$targetPlace.targetPlaceID",
      // productBarcodeNo: 1,
      style: { $toUpper:{ $substr: [ "$productBarcodeNoReal", +process.env.stylePos, +process.env.styleDigit ] }},
      targetPlace: { $toUpper:{ $substr: [ "$productBarcodeNoReal", +process.env.targetIDPos, +process.env.targetIDDigit ] }},
      color: { $toUpper:{ $substr: [ "$productBarcodeNoReal", +process.env.colorPos, +process.env.colorDigit ] }},
      size: { $toUpper:{ $substr: [ "$productBarcodeNoReal", +process.env.sizePos, +process.env.sizeDigit ] }},
      productCount: 1,
      // productionDate: 1,
      // productStatus: 1,
      // fromNode: "$productionNode.fromNode",
      factoryID: "$productionNode.factoryID",
      toNode: "$productionNode.toNode",
      // datetime: "$productionNode.datetime",
      // createBy: "$productionNode.createBy",
    }},

    { $match: { $and: [
      {"factoryID":{$in: factoryIDArr}},
      {"toNode":nodeID},
    ] } },
    { $project: { 
      _id: 0, 
      companyID: 1,
      factoryID: 1,		
      orderID: 1,	
      bundleNo: 1,
      bundleID: 1,
      // productID: 1,
      // targetPlaceID: "$targetPlace.targetPlaceID",
      // productBarcodeNo: 1,
      style: 1,
      targetPlace: 1,
      color: 1,
      size: 1,
      productCount: 1,
      // productionDate: 1,
      // productStatus: 1,
      // fromNode: "$productionNode.fromNode",
      // factoryID: "$productionNode.factoryID",
      toNode: 1,
      // datetime: "$productionNode.datetime",
      // createBy: "$productionNode.createBy",
    }},

    { $group: {			
      _id: { 
        companyID: '$companyID',
        factoryID: '$factoryID',
        orderID: '$orderID',
        bundleNo: '$bundleNo',
        bundleID: '$bundleID',
        style: '$style',
        targetPlace: '$targetPlace',
        color: '$color',
        size: '$size',
        toNode: '$toNode',
        productCount: '$productCount',
        // bundleNo: '$bundleNo',
        // mode: '$mode',
      },
      // countQty: {$sum: 1} ,
      // sumProductQty: {$sum:  '$amount'} ,
    }}  
  ])
    .hint( { companyID: 1, orderID: 1, productStatus: 1, "productionNode.factoryID": 1, "productionNode.toNode": 1 } )
    // .hint( { companyID: 1, orderID: 1, productStatus: 1 } )
    // .explain("");  //  .explain("executionStats") queryPlanner , executionStats , allPlansExecution
    ;
    // companyID: 1, orderID: 1 
  // const explain = await OrderProduction.aggregate([
  //   { $match: { $and: [
  //     {"companyID":companyID},
  //     // {"factoryID":factoryID},
  //     {"productStatus":{$in: productStatusArr}}
  //   ] } },
  //   { $project: {			
  //       _id: 0,	
  //       companyID: 1,
  //       productionNode: { $slice: [ "$productionNode", -1]  },  // ## get last 1 element
  //   }	},
  //   { $unwind: "$productionNode" },
  //   { $project: { 
  //     _id: 0, 
  //     companyID: 1,
  //     factoryID: "$productionNode.factoryID",
  //     toNode: "$productionNode.toNode",
  //   }},
  //   { $match: { $and: [
  //     {"factoryID":factoryID},
  //     {"toNode":nodeID},
  //   ] } },
  //   { $project: { 
  //     _id: 0, 
  //     companyID: 1,
  //   }},
  //   { $group: {			
  //     _id: { 
  //       companyID: '$companyID',
  //   },
  //     sumProductQty: {$sum: 1} ,
  //   }} 
  // ]).explain("executionStats");  //  .explain("executionStats")




  console.log('gettestexplain5  *****');



  // console.log(explain);
  return res.send(explain);
}

// ## http://192.168.1.25:3968/api/user/test/explain1/testexplain6
// router.get("/test/explain1/testexplain6", userController.gettestexplain6); // ## test node scan qrcode
exports.gettestexplain6 = async (req, res, next) => {

  console.log('gettestexplain6');
  const companyID = 'c000001';
  const factoryID = 'f000001';  // 
  const factoryIDArr = ['f000001'];
  // const orderID = 'AA0QFA4S';
  const orderIDs = ['JBAD9A4S',    'GL-26',    '24S-BP1505',
    '24S-BP1504',  '203-Y24',  'GL-115D',
    'GL-115C',     'BA1OPA4S', 'AA0QEA4S',
    'DAK15A4S',    'DCB08A4S', 'DCB07A4S',
    'DBC33A4S',    'BA1OGA4S', 'UR37-12B005',
    'UR37-12B004', 'BA1OQA4S', 'AA0QFA4S',
    'DCB06A4S',    'BA1ONA4S', 'BA1OOA4S',
    'BA1OFA4S',    'DDB61A4S', 'DDE60A4S',
    '23FRAW-006',  'UR391',    'JBAD9A3A',
    'GL-115B',     'GL-116B',  '23F-YM505',
    '23F-BP1508',  'GL-92B',   'AA0Q4A3A',
    'BA1OEA3A',    'DD0ISA3A', 'AA0Q1A3A',
    'BA1O0A3A',    'AA0Q6A3A', 'BAI13A3A',
    'BA1ODA3A',    'BA1NIA3A', 'AA0PKA3A',
    'AA0PJA3A',    'BA1NWA3A', 'AA0PVA3A',
    'BA1NUA3A'];
  const orderIDArr = orderIDs;
  const productBarcodeNoReal = 'AA0QFA4S    JAPN-----24GR--------M---00476';
  const productBarcodeNoRealArr = ['AA0QFA4S    JAPN-----24GR--------M---00476'];
  const nodeID = '3.LINKING';
  // const open = true;';
  // const openArr = [true];
  const statusArr = ['normal', 'complete'];

  // ## getRepCFNCurrentProductQtyCount  'normal', 'problem', 'repaired'
  const productStatusArr = ['normal', 'problem', 'repaired'];  

  const current = new Date(moment().tz('Asia/Bangkok').format('YYYY/MM/DD HH:mm:ss+07:00'));
  const dateStart = new Date(moment(current).tz('Asia/Bangkok').format('2023/MM/DD 00:00:00+07:00'));
  const dateEnd = new Date(moment(current).tz('Asia/Bangkok').format('YYYY/MM/DD 23:59:59+07:00'));
  // console.log(dateStart, dateEnd);

  const explain = await OrderProduction.aggregate([
    { $match: { $and: [
      {"companyID":companyID},
      // {"factoryID":factoryID},
      {"productBarcodeNoReal":productBarcodeNoReal},
    ] } },
    { $project: {			
        _id: 1,	
        companyID: 1,
        factoryID: 1,		
        orderID: 1,	
        bundleNo: 1,
        bundleID: 1,
        productID: 1,
        productBarcodeNo: 1,
        productBarcodeNoReal: 1,
        productBarcodeNoReserve: 1,
        productCount: 1,
        productionDate: 1,
        productStatus: 1,
        yarnLot: 1,
        outsourceData: 1,
        productionNode: { $slice: [ "$productionNode", -1]  },  // ## get last 1 element
    }	}
  ]).hint( { companyID: 1, productBarcodeNoReal: 1 } ).explain("executionStats");   //  .explain("executionStats")

  console.log('gettestexplain6  *****');

  // console.log(explain);
  return res.send(explain);
}


// ## http://192.168.1.17:3968/api/user/test/explain1/testexplain7
// router.get("/test/explain1/testexplain7", userController.gettestexplain7);
exports.gettestexplain7 = async (req, res, next) => {

  console.log('gettestexplain7');
  const companyID = 'c000001';
  const factoryID = 'f000001';  // 
  const factoryIDArr = ['f000001'];  // ['f000001', 'f000002', 'f000003'];
  const orderID = 'BA1OOA4S';
  const orderIDs = ['JBAD9A4S',    'GL-26',    '24S-BP1505',
    '24S-BP1504',  '203-Y24',  'GL-115D',
    'GL-115C',     'BA1OPA4S', 'AA0QEA4S',
    'DAK15A4S',    'DCB08A4S', 'DCB07A4S',
    'DBC33A4S',    'BA1OGA4S', 'UR37-12B005',
    'UR37-12B004', 'BA1OQA4S', 'AA0QFA4S',
    'DCB06A4S',    'BA1ONA4S', 'BA1OOA4S',
    'BA1OFA4S',    'DDB61A4S', 'DDE60A4S',
    '23FRAW-006',  'UR391',    'JBAD9A3A',
    'GL-115B',     'GL-116B',  '23F-YM505',
    '23F-BP1508',  'GL-92B',   'AA0Q4A3A',
    'BA1OEA3A',    'DD0ISA3A', 'AA0Q1A3A',
    'BA1O0A3A',    'AA0Q6A3A', 'BAI13A3A',
    'BA1ODA3A',    'BA1NIA3A', 'AA0PKA3A',
    'AA0PJA3A',    'BA1NWA3A', 'AA0PVA3A',
    'BA1NUA3A'];
  const orderIDs2 = ['DDE60A4S'];
  const orderIDArr = orderIDs;
  const productBarcodeNoReal = 'AA0QFA4S    JAPN-----24GR--------M---00476';
  const productBarcodeNoRealArr = ['AA0QFA4S    JAPN-----24GR--------M---00476'];
  const nodeID = '3.LINKING';
  const bundleNo = 1435755;
  const bundleNos = [1435755, 1435756];
  const bundleID = '14089bec-effd-466a-bcd9-529c8880c9c5';
  const open = true;
  const forLoss = false;
  const isOutsourceTracking = false;
  // const openArr = [true];
  const statusArr = ['normal', 'complete'];

  // ## getRepCFNCurrentProductQtyCount  'normal', 'problem', 'repaired'
  const productStatusArr = ['normal', 'problem', 'repaired', 'complete'];  

  const current = new Date(moment().tz('Asia/Bangkok').format('YYYY/MM/DD HH:mm:ss+07:00'));
  const date1 = new Date(moment().tz('Asia/Bangkok').format('2024/01/01 HH:mm:ss+07:00'));
  const date2 = new Date(moment().tz('Asia/Bangkok').format('2024/01/14 HH:mm:ss+07:00'));
  const dateStart = new Date(moment(date1).tz('Asia/Bangkok').format('YYYY/MM/DD 00:00:00+07:00'));
  const dateEnd = new Date(moment(date2).tz('Asia/Bangkok').format('YYYY/MM/DD 23:59:59+07:00'));
  // console.log(dateStart, dateEnd);

  const explain = await OrderProduction.aggregate([
    { $match: { $and: [
      {"companyID":companyID},
      // {"factoryID":factoryID},
      // {"factoryID":{$in: factoryIDArr}},
      {"orderID":{$in: orderIDs2}},
      {"productStatus":{$in: statusArr}},

      {"productionNode":  {$elemMatch: {"factoryID": {$in: factoryIDArr}, "toNode": nodeID }}},
      { $expr: { $in: [{ "$arrayElemAt": ["$productionNode.factoryID", -1] }, factoryIDArr] } },
      { $expr: { $eq: [{ "$arrayElemAt": ["$productionNode.toNode", -1] }, nodeID] } },
      // {"factoryID":{$in: factoryIDArr}},
      // {"toNode":nodeID},

      // .hint( { companyID: 1, orderID: 1, productStatus: 1, productionNode.factoryID: 1, productionNode.toNode: 1 } )
    ] } },
    { $project: {			
        _id: 0,	
        companyID: 1,
        // factoryID: 1,		
        orderID: 1,	
        bundleNo: 1,
        bundleID: 1,
        // productID: 1,
        // targetPlace: 1,
        // productBarcodeNo: 1,
        productBarcodeNoReal: 1,
        productCount: 1,
        // productionDate: 1,
        // productStatus: 1,
        productionNode: { $slice: [ "$productionNode", -1]  },  // ## get last 1 element
    }	},
    { $unwind: "$productionNode" },
    { $project: { 
      _id: 0, 
      companyID: 1,
      // factoryID: 1,		
      orderID: 1,	
      bundleNo: 1,
      bundleID: 1,
      // productID: 1,
      // targetPlaceID: "$targetPlace.targetPlaceID",
      // productBarcodeNo: 1,
      style: { $toUpper:{ $substr: [ "$productBarcodeNoReal", +process.env.stylePos, +process.env.styleDigit ] }},
      targetPlace: { $toUpper:{ $substr: [ "$productBarcodeNoReal", +process.env.targetIDPos, +process.env.targetIDDigit ] }},
      color: { $toUpper:{ $substr: [ "$productBarcodeNoReal", +process.env.colorPos, +process.env.colorDigit ] }},
      size: { $toUpper:{ $substr: [ "$productBarcodeNoReal", +process.env.sizePos, +process.env.sizeDigit ] }},
      productCount: 1,
      // productionDate: 1,
      // productStatus: 1,
      // fromNode: "$productionNode.fromNode",
      factoryID: "$productionNode.factoryID",
      toNode: "$productionNode.toNode",
      // datetime: "$productionNode.datetime",
      // createBy: "$productionNode.createBy",
    }},

    { $match: { $and: [
      {"factoryID":{$in: factoryIDArr}},
      {"toNode":nodeID},
    ] } },
    { $project: { 
      _id: 0, 
      companyID: 1,
      factoryID: 1,		
      orderID: 1,	
      bundleNo: 1,
      bundleID: 1,
      // productID: 1,
      // targetPlaceID: "$targetPlace.targetPlaceID",
      // productBarcodeNo: 1,
      style: 1,
      targetPlace: 1,
      color: 1,
      size: 1,
      productCount: 1,
      // productionDate: 1,
      // productStatus: 1,
      // fromNode: "$productionNode.fromNode",
      // factoryID: "$productionNode.factoryID",
      toNode: 1,
      // datetime: "$productionNode.datetime",
      // createBy: "$productionNode.createBy",
    }},

    { $group: {			
      _id: { 
        companyID: '$companyID',
        factoryID: '$factoryID',
        orderID: '$orderID',
        bundleNo: '$bundleNo',
        bundleID: '$bundleID',
        style: '$style',
        targetPlace: '$targetPlace',
        color: '$color',
        size: '$size',
        toNode: '$toNode',
        productCount: '$productCount',
        // bundleNo: '$bundleNo',
        // mode: '$mode',
      },
      // countQty: {$sum: 1} ,
      // sumProductQty: {$sum:  '$amount'} ,
    }}  
  ])
    // .hint( { companyID: 1, orderID: 1, productStatus: 1, "productionNode.factoryID": 1, "productionNode.toNode": 1 } )
    .hint( { companyID: 1, orderID: 1, productStatus: 1 } )
    .explain("executionStats");  //  .explain("executionStats") queryPlanner , executionStats , allPlansExecution
    ;
    // companyID: 1, orderID: 1 
  // const explain = await OrderProduction.aggregate([
  //   { $match: { $and: [
  //     {"companyID":companyID},
  //     // {"factoryID":factoryID},
  //     {"productStatus":{$in: productStatusArr}}
  //   ] } },
  //   { $project: {			
  //       _id: 0,	
  //       companyID: 1,
  //       productionNode: { $slice: [ "$productionNode", -1]  },  // ## get last 1 element
  //   }	},
  //   { $unwind: "$productionNode" },
  //   { $project: { 
  //     _id: 0, 
  //     companyID: 1,
  //     factoryID: "$productionNode.factoryID",
  //     toNode: "$productionNode.toNode",
  //   }},
  //   { $match: { $and: [
  //     {"factoryID":factoryID},
  //     {"toNode":nodeID},
  //   ] } },
  //   { $project: { 
  //     _id: 0, 
  //     companyID: 1,
  //   }},
  //   { $group: {			
  //     _id: { 
  //       companyID: '$companyID',
  //   },
  //     sumProductQty: {$sum: 1} ,
  //   }} 
  // ]).explain("executionStats");  //  .explain("executionStats")




  console.log('gettestexplain7  *****');
  // ## {$indexStats: {}}


  // console.log(explain);
  return res.send(explain);
}

// // ## http://192.168.1.36:3968/api/user/test/test
// router.get("/test/test", userController.getTestTest);
exports.getTestTest = async (req, res, next) => {
  // console.log('getTestTest');
  // user = await User.updateOne(  
  //   {$and: [
  //     {"userID": "heng067@gmail.com"},

  //   ]},
  //   {$unset: {status: ""} });

  // // updateTargetPlaceOrder
  // const updateTargetPlaceOrder = await ShareFunc.updateTargetPlaceOrder();

  // // updateTargetPlaceCountryIDOrder
  // const updateTargetPlaceCountryIDOrder = await ShareFunc.updateTargetPlaceCountryIDOrder();

  // // xxFindCountry2
  // const updateTargetPlaceCountryIDOrder = await ShareFunc.xxFindOrder();

  // 1376989
  // const result = await ShareFunc.getOrderProductionByBundleNo();
  // console.log(result , result.length);

  // getOrderProduction0001
  // const result = await ShareFunc.getOrderProduction0001();
  // console.log(result , result.length);

  // // delManyOrderProduction
  // const result = await ShareFunc.delManyOrderProduction();

  // // getTestOrderProduction1
  // const result = await ShareFunc.getTestOrderProduction1();
  // // console.log(result , result.length);
  // // console.log('result len = ' , result.length);

  // const result = await ShareFunc.getTestOrderProduction2();
  // console.log(result , result.length);

  // const result = await ShareFunc.getviewGroupBundleNoOrderProductionQueue();
  // // const resultF = result.filter(i=>(i.sumQty > 1));
  // console.log(result , result.length);
  // // hostURL = await hostURLf.filter(i=>(i.status == status));

  // const result = await ShareFunc.setOpenOrderProduction();
  // // console.log(result , result.length);

  // // edit to factory when lock/pay job to knitting
  // // EditOrderProductionFactory 
  // const result = await ShareFunc.editOrderProductionFactory();

  // ## test socket IO
  io.getIO().emit(process.env.IOID+'/iomessage/user', {
    action: 'sent by socketIO',
    post: { socket: 'IO', creator: { _id: req.body.userID, name: 'namex' } }
  });

  
  const test = await ShareFunc.test1();
  res.setHeader('Content-Type', 'text/html');
  res.write('<html>');
  res.write('<head><title>1.) general test</title><head>');
  res.write('<body>');
  res.write('<h1>1.) general test</h1></br>');
  res.write('<h1>Hello from my Node.js Server!</h1>');
  res.write('</body>');
  res.write('</html>');
  return res.end();
}


// // ## http://192.168.1.84:3968/api/user/test/test
// router.get("/test/test", userController.getTestTest);
exports.getTestTest = async (req, res, next) => {
  // console.log('getTestTest');
  // user = await User.updateOne(  
  //   {$and: [
  //     {"userID": "heng067@gmail.com"},

  //   ]},
  //   {$unset: {status: ""} });

  // // updateTargetPlaceOrder
  // const updateTargetPlaceOrder = await ShareFunc.updateTargetPlaceOrder();

  // // updateTargetPlaceCountryIDOrder
  // const updateTargetPlaceCountryIDOrder = await ShareFunc.updateTargetPlaceCountryIDOrder();

  // // xxFindCountry2
  // const updateTargetPlaceCountryIDOrder = await ShareFunc.xxFindOrder();

  // 1376989
  // const result = await ShareFunc.getOrderProductionByBundleNo();
  // console.log(result , result.length);

  // getOrderProduction0001
  // const result = await ShareFunc.getOrderProduction0001();
  // console.log(result , result.length);

  // // delManyOrderProduction
  // const result = await ShareFunc.delManyOrderProduction();

  // // getTestOrderProduction1
  // const result = await ShareFunc.getTestOrderProduction1();
  // // console.log(result , result.length);
  // // console.log('result len = ' , result.length);

  // const result = await ShareFunc.getTestOrderProduction2();
  // console.log(result , result.length);

  // const result = await ShareFunc.getviewGroupBundleNoOrderProductionQueue();
  // // const resultF = result.filter(i=>(i.sumQty > 1));
  // console.log(result , result.length);
  // // hostURL = await hostURLf.filter(i=>(i.status == status));

  // const result = await ShareFunc.setOpenOrderProduction();
  // // console.log(result , result.length);

  // // edit to factory when lock/pay job to knitting
  // // EditOrderProductionFactory 
  // const result = await ShareFunc.editOrderProductionFactory();

  // ## test socket IO
  io.getIO().emit(process.env.IOID+'/iomessage/user', {
    action: 'sent by socketIO',
    post: { socket: 'IO', creator: { _id: req.body.userID, name: 'namex' } }
  });

  
  const test = await ShareFunc.test1();
  res.setHeader('Content-Type', 'text/html');
  res.write('<html>');
  res.write('<head><title>1.) general test</title><head>');
  res.write('<body>');
  res.write('<h1>1.) general test</h1></br>');
  res.write('<h1>Hello from my Node.js Server!</h1>');
  res.write('</body>');
  res.write('</html>');
  return res.end();
}

// BA1OPA4S
// BA1OPA4S    JAPN-----24LY--------L---
// 36054A
// 529  -  1056
// 1447882
// 1447925


// ## http://100.125.192.84:3968/api/user/test/arrayobject/testAO1
// router.get("/test/arrayobject/testAO1", userController.getOA1);
exports.getOA1 = async (req, res, next) => {
  console.log('getOA1');
  const companyID = 'c000001';
  const factoryID = 'f000001';
  const factoryIDArr = ['f000001'];  // ['f000001', 'f000002', 'f000003'];
  const orderIDs = ['JBAD9A4S',    'GL-26',    '24S-BP1505',
    '24S-BP1504',  '203-Y24',  'GL-115D',
    'GL-115C',     'BA1OPA4S', 'AA0QEA4S',
    'DAK15A4S',    'DCB08A4S', 'DCB07A4S',
    'DBC33A4S',    'BA1OGA4S', 'UR37-12B005',
    'UR37-12B004', 'BA1OQA4S', 'AA0QFA4S',
    'DCB06A4S',    'BA1ONA4S', 'BA1OOA4S',
    'BA1OFA4S',    'DDB61A4S', 'DDE60A4S',
    '23FRAW-006',  'UR391',    'JBAD9A3A',
    'GL-115B',     'GL-116B',  '23F-YM505',
    '23F-BP1508',  'GL-92B',   'AA0Q4A3A',
    'BA1OEA3A',    'DD0ISA3A', 'AA0Q1A3A',
    'BA1O0A3A',    'AA0Q6A3A', 'BAI13A3A',
    'BA1ODA3A',    'BA1NIA3A', 'AA0PKA3A',
    'AA0PJA3A',    'BA1NWA3A', 'AA0PVA3A',
    'BA1NUA3A'];
  const orderIDArr = orderIDs;
  const productBarcodeNoReal = 'BA1OOA4S    UK-------24BK--------XS--00001';

  const productionNodeStatusArr = ['normal', 'complete'];
  const productStatusArr = ['normal'];

  const nodeID = '3.LINKING';

  const result = await OrderProduction.aggregate([  //  aggregate  ,  countDocuments
    { $match: { $and: [
      {"companyID":companyID},
      // {"factoryID":factoryID},
      {"productStatus":{$in: productStatusArr}},

      // {"productionNode":  {$elemMatch: {"factoryID": factoryID, "toNode": nodeID }}},
      {"productionNode":  {$elemMatch: {"factoryID":{$in: factoryIDArr}, "toNode": nodeID }}},
      // { $expr: { $eq: [{ "$arrayElemAt": ["$productionNode.factoryID", -1] }, factoryID] } },
      { $expr: { $in: [{ "$arrayElemAt": ["$productionNode.factoryID", -1] }, factoryIDArr] } },
      { $expr: { $eq: [{ "$arrayElemAt": ["$productionNode.toNode", -1] }, nodeID] } },
      // {"factoryID":factoryID},
      // {"toNode":nodeID},
    ] } },
    { $project: {			
        _id: 0,	
        companyID: 1,
        // factoryID: 1,		
        // orderID: 1,	
        // bundleNo: 1,
        // productID: 1,
        // productBarcodeNo: 1,
        // productBarcodeNoReal: 1,
        // productBarcodeNoReserve: 1,
        // productCount: 1,
        // productionDate: 1,
        // productStatus: 1,
        // yarnLot: 1,
        productionNode: { $slice: [ "$productionNode", -1]  },  // ## get last 1 element
    }	},
    { $unwind: "$productionNode" },
    { $project: { 
      _id: 0, 
      companyID: 1,
      // factoryID: 1,		
      // orderID: 1,	
      // bundleNo: 1,
      // productID: 1,
      // productBarcodeNo: 1,
      // productBarcodeNoReal: 1,
      // productBarcodeNoReserve: 1,
      // productCount: 1,
      // productionDate: 1,
      // productStatus: 1,
      // yarnLot: 1,
      factoryID: "$productionNode.factoryID",
      // fromNode: "$productionNode.fromNode",
      toNode: "$productionNode.toNode",
      // status: "$productionNode.status",
      // productProblemID: "$productionNode.productProblemID",
      // datetime: "$productionNode.datetime",
      // createBy: "$productionNode.createBy",
    }},
    { $match: { $and: [
      // {"factoryID":factoryID},
      {"factoryID":{$in: factoryIDArr}} ,
      {"toNode":nodeID},
    ] } },
    { $project: { 
      _id: 0, 
      companyID: 1,
      // factoryID: 1,		
      // orderID: 1,	
      // bundleNo: 1,
      // productID: 1,
      // productBarcodeNo: 1,
      // productBarcodeNoReal: 1,
      // productBarcodeNoReserve: 1,
      // productCount: 1,
      // productionDate: 1,
      // productStatus: 1,
      // yarnLot: 1,

      // fromNode: 1,
      // toNode: 1,
      // status: 1,
      // toNode: 1,
      // productProblemID: 1,
      // createBy: 1,
    }},

    // {$count: "passing_scores"},

    { $group: {			
      _id: { 
        companyID: '$companyID',
      },
      sumProductQty: {$sum: 1} ,
    }} 
  ]);

  // console.log('getOA1', result);
  // console.log(result[0].sumProductQty);
  console.log('getOA1  ***');
  return res.send(result);

  // return res.send(result);
}

// getOrderQueueTest1
// // ## http://192.168.1.35:3968/api/user/test/orderqueue/test1
exports.getOrderQueueTest1 = async (req, res, next) => {
  // // ## cancel queue order all by product barcode  (companyID, factoryID, orderID, productBarcode, no1, no2)
  const companyID = 'c000001';
  const factoryID = 'f000001';
  const orderID = 'BA1OPA4S';
  const productBarcode = 'BA1OPA4S    JAPN-----24LY--------L---';
  const bundleNoFrom = 1451188;
  const bundleNoTo = 1451233;
  const no1 = 1057;
  const no2 = 1608;
  const productCount = 12;
  const createBy = {userID: '1x1', userName: 'xxxx'};
  const yarnLot = [{yarnLotID: '36055A'}];  // [{yarnLotID: '35292'}, {yarnLotID: '35292'}]; 
  // const yarnLot = [{yarnLotID: '35292'}, {yarnLotID: '35292'}];  // [{yarnLotID: '35292'}, {yarnLotID: '35292'}]; 
  const isOutsource = false;
  const forLoss = false;
  const forLossQty = 0;
  const toNode = '1.COMPUTER-KNITTING';
  
  // const result =
  //   await ShareFunc.test1_addnewArrOrderQueue(
  //     companyID, factoryID, orderID, productBarcode, 
  //     productCount, 
  //     bundleNoFrom, bundleNoTo, 
  //     no1, no2,
  //     isOutsource,
  //     forLoss,
  //     forLossQty,
  //     toNode,
  //     yarnLot,
  //     createBy
  //   );

  res.setHeader('Content-Type', 'text/html');
  res.write('<html>');
  res.write('<head><title> add new array order queue  </title><head>');
  res.write('<body>');
  res.write('<h1>cancel  order production  </h1></br>');
  res.write('<h1>by product barcode</h1>');
  res.write('<h1>'+result+'</h1>');
  res.write('</body>');
  res.write('</html>');
  return res.end();
}

// ## http://172.31.194.255:3968/api/user/test/get/monogdbver/getver
// router.get("/test/get/monogdbver/getver", userController.getMonogoDbver1);
exports.getMonogoDbver1 = async (req, res, next) => {

  const result = await ShareFunc.getMongoDBVer1();
  res.setHeader('Content-Type', 'text/html');
  res.write('<html>');
  res.write('<head><title> MongoDB version </title><head>');
  res.write('<body>');
  res.write('<h1>get version  </h1></br>');
  res.write('<h1>.....................</h1>');
  res.write('<h1>'+result+'</h1>');
  res.write('</body>');
  res.write('</html>');
  return res.end();
}

// ## general info
// router.get("/generalinfo", UserController.getGeneralInfo);
exports.getGeneralInfo = async (req, res, next) => {
  // try {} catch (err) {}
  const languageID = req.params.languageID;
  const classLimit = +req.params.classLimit;
  try {
    // controlApp = await ShareFunc.getControlApp();

    // ## 1 appVer , appName, appMail
    const generalInfo = await ShareFunc.generalInfo();

    // ## 2 targetPlace , color , size
    const colors = await ShareFunc.colorInfo();
    const sizes = await ShareFunc.sizeInfo();
    const targetPlaces = await ShareFunc.targetPlaceInfo();

    // ## get languages list
    const langs = await ShareFunc.getLangLists(true);
    // ## get language Data
    const langData = await ShareFunc.getLangData(languageID);
    // console.log(langData);

    // editLangData= async (languageID, lID)
    const editLangData = await ShareFunc.editLangData('th');

    // ## get user class
    const userClass = await ShareFunc.getUserClass(classLimit);

    // ## get client control
    const controlApp = await ShareFunc.getControlAppClientControl();

    // ## get ver control
    const controlAppVer = await ShareFunc.getControlApp();
    const ver = controlAppVer.ver;

    // ## get client control
    const outSourceLocationDepartment = (await ShareFunc.getControlAppOutSourceLocationDepartment()).outSourceLocationDepartment;
    // console.log(outSourceLocationDepartment);

    // // ## get subNodeflow
    // const subNodeflow = await ShareFunc.getSubNodeFlow();

    // const updateQrCodeRealOrderProduction = await ShareFunc.updateQrCodeRealOrderProduction();

    // ## system info'
    const sysInfo = [
      {id: 'mgdb', data: process.env.MGDB},
      {id: 'appVer', data: process.env.APPVER},
      {id: 'appName', data: process.env.APPNAME},
      {id: 'appMail', data: process.env.APPEMAIL},
    ];
    // const sysInfo2 = {
    //   mgdb: process.env.MGDB,
    //   appVer: process.env.APPVER,
    //   appName: process.env.APPNAME,
    //   appMail: process.env.APPEMAIL,

    // };
    // MGDB=nodeGarmentSystem2  APPVER=1.0  APPNAME=go.garment.com APPEMAIL=go.garment.mail@gmail.com

    return res.status(200).json({
      generalInfo: generalInfo,
      targetPlaces: targetPlaces,
      colors: colors,
      sizes: sizes,
      langs: langs,
      langData: langData,
      userClass: userClass,
      controlApp: controlApp,
      ver: ver,
      sysInfo: sysInfo,
      outSourceLocationDepartment: outSourceLocationDepartment
      // updateQrCodeRealOrderProduction: updateQrCodeRealOrderProduction
    });
  } catch (err) {
    console.log(err);
    return res.status(501).json({
      message: {
        messageID: 'erru000', 
        mode:'generalInfo', 
        value: "error general info"
      }
    });
  }
}

// // ## get language  / starting data
// router.get("/generalinfo/langdata/:languageID", userController.getLangData);
exports.getLangData = async (req, res, next) => {
  // try {} catch (err) {}
  const languageID = req.params.languageID;
  try {
    const langData = await ShareFunc.getLangData(languageID);
    res.status(200).json({
      langData: langData
    });
  } catch (err) {
    console.log(err);
    return res.status(501).json({
      message: {
        messageID: 'erru000-1', 
        mode:'generalInfolang', 
        value: "error general info language"
      }
    });
  }
}




// ## general
// #######################################################################################################

// #######################################################################################################
// ## user

// router.get("/get/company/data/info", userController.getCompanyInfo);
exports.getCompanyInfo = async (req, res, next) => {
  // try {} catch (err) {}
  const data = req.body;
  const companyID = data.companyID;
  const groupScanID = data.groupScanID; // ## *=select all
  try {
    let userGroupScan = [];
    if (groupScanID === '*') { // ## select all
      userGroupScan = await ShareFunc.getUserGroupScanAll(companyID);
    } else {
      userGroupScan = await ShareFunc.getUserGroupScan1(companyID);
    }
    // const langData = await ShareFunc.getLangData(languageID);

    res.status(200).json({
      token: '',
      expiresIn: 3600,
      userID: '',
      userGroupScan: userGroupScan
    });
  } catch (err) {
    console.log(err);
    return res.status(501).json({
      message: {
        messageID: 'erru000-1', 
        mode:'generalInfolang', 
        value: "error general info language"
      }
    });
  }
}



// ## auth
//  test getuserLogin
exports.getuserLogin = (req, res, next) => {
  console.log(req.body);
  res.send('<h1>Hello / get login ok</h1>');
}

exports.createUser = async (req, res, next) => {
  const logID= 'usu';  // ## user sign up
  const current = new Date(moment().tz('Asia/Bangkok').format('YYYY/MM/DD HH:mm:ss+07:00'));

  // console.log(req.body);
  // console.log(process.env.JWT_KEY);

  userDocf = await User.findOne({userID: req.body.userID});
  if (userDocf) {
    return res.status(422).json({
      message: {
        messageID: 'erru001-2', 
        mode:'errSignupUserID', 
        value: "already has userID!"
      }
    });
  }

  const createBy = {
    userID: req.body.userID,
    userName: 'xxxx'
  };

  bcrypt.hash(req.body.userPass, 10).then(hash => {
    const user = new User({
      userID: req.body.userID,
      type: 'u',
      uInfo: {
        userName: 'xxxx',
        userPass: hash,
        registDate: current
      },
      status: 'a',
      state: 'userEmail',
      createdAt: current,
      createBy: createBy
    });
    user
    .save()
    .then(result => {

      // ## test socket IO
      io.getIO().emit('messageuser', {
        action: 'sent by socketIO',
        post: { socket: 'IO', creator: { _id: req.body.userID, name: 'namex' } }
      });
      // console.log(req.body.userPass, result);
      res.status(201).json({
        message: "User created!",
        result: result,
        user: user
      });
    })
    .catch(err => {
      // console.log(err.errors);
      res.status(500).json({
        message: {
          messageID: 'erru001', 
          mode:'errsignup', 
          value: "Invalid authentication credentials!"
        }
      });
    });
  });
}

exports.userLogin = async (req, res, next) => {
  // try {  } catch (err) {}
  // console.log(req.body);
  const logID= 'uli';  // ## user log in
  const body = req.body;
  const tokenSet = body.tokenSet;
  const userID = req.body.userID;
  const uuidUserNodeLoginWaiting = body.uuidUserNodeLoginWaiting;
  let fetchedUser;
  const current = new Date(moment().tz('Asia/Bangkok').format('YYYY/MM/DD HH:mm:ss+07:00'));
  try {
    const userf = await User.findOne({ userID: userID });
    if (!userf) {
      // ## check user node station
      // const statusArr = ["a","c","d"];   // ## a = active , c= close,  d= deleted - no use
      const statusArr = ["a"];   // ## a = active , c= close,  d= deleted - no use
      // {"userNode.userNodeID": userID}, 

      let nodeStationUserFF = await NodeStation.aggregate([
        { $match: { $and: [
          {"status":{$in: statusArr}} 
        ] } },
        { $unwind: "$userNode" },
        { $project: { _id: 0, 
          factoryID: 1,		
          companyID: 1,
          nodeID: 1,
          status: 1,
          editDate: 1,
          nodeInfo: 1,
          nStation: 1,
          nodeProblem: 1,
          stationID: "$userNode.stationID",
          userNodeID: "$userNode.userNodeID",
          userNodePass: "$userNode.userNodePass",
          uuid: "$userNode.uuid",
        }},
        { $match: { $and: [
          {"userNodeID":userID}, 
          {"userNodePass":req.body.userPass},
        ] } },
        { $project: {			
          _id: 0,	
          factoryID: 1,		
          companyID: 1,
          nodeID: 1,
          status: 1,
          editDate: 1,
          nodeInfo: 1,
          nStation: 1,
          nodeProblem: 1,
          stationID: 1
        }	},
      ]);
      if (nodeStationUserFF.length>0) {
        // nodeStationUserF[0].userNode ={
        //   userNodeID: '',
        //   userNodeID: '',
        //   userNodePass: '',
        //   uuid: '',
        // };
        const stationID = nodeStationUserFF[0].stationID;
        // console.log(stationID);

        //  ## get nodeStation by companyID factoryID nodeID
        let nodeStation = await ShareFunc.getNodeStation(
                    nodeStationUserFF[0].companyID, 
                    nodeStationUserFF[0].factoryID, 
                    [nodeStationUserFF[0].status], 
                    nodeStationUserFF[0].nodeID);
        nodeStation[0].userNode = [];
        const nodeStationUserF = nodeStation;

        // console.log(nodeStationUserF);

        // ## find user node ok
        const company = await ShareFunc.getCompany1Info(nodeStationUserF[0].companyID);
        const factory = await ShareFunc.getFactory1Info(nodeStationUserF[0].companyID, nodeStationUserF[0].factoryID);

        // ## add request user node login  and send request user node login to owner
        // exports.addNodeStationLoginRequest = async (companyID, factoryID, nodeID, stationID, uuidUserNodeLoginWaiting, minutePlus)
        const addNodeStationLoginRequest = await ShareFunc.addNodeStationLoginRequest(
                                                    nodeStationUserF[0].companyID,
                                                    nodeStationUserF[0].factoryID,
                                                    nodeStationUserF[0].nodeID,
                                                    stationID,
                                                    uuidUserNodeLoginWaiting,
                                                    5
                                                  );
        //
        const nodeStationLoginRequest = await ShareFunc.get1NodeStationLoginRequest(
                                          nodeStationUserF[0].companyID,
                                          nodeStationUserF[0].factoryID,
                                          nodeStationUserF[0].nodeID,
                                          stationID,
                                          uuidUserNodeLoginWaiting
                                        );
        //

        // // ## get subNodeflow
        // const subNodeflow = await ShareFunc.getSubNodeFlow(nodeStationUserF[0].companyID);

        const token = await ShareFunc.genTokenSet(tokenSet, process.env.expire7day);
        return res.status(200).json({
          token: token,
          expiresIn: process.env.expire7day,
          userID: userID,
          user: {},
          mode: 'userNode', // ## user = normal user  , userNode= work station login
          nodeStation: nodeStationUserF[0],
          stationID: stationID,
          nodeStationLoginRequest: nodeStationLoginRequest,
          company: company,
          factory: factory,
          // subNodeflow: subNodeflow
        });
      } else {
        return res.status(401).json({
          message: {
            messageID: 'erru002', 
            mode:'errLoginFound', 
            value: "Auth failed, userID not found"
          }
        });
      }
    }
    // console.log('fetchedUser');
    fetchedUser = userf;
    doMatch = await bcrypt.compare(req.body.userPass, userf.uInfo.userPass);
    // console.log('doMatch');
    if (!doMatch) { 
      return res.status(401).json({
        message: {
          messageID: 'erru003', 
          mode:'errLoginPass', 
          value: "Auth failed, password incorrect"
        }
      });
    }
    // ## update user last login
    const userLastLogin = await User.updateOne({userID: userID} , {"uInfo.lastLogin": current});

    fetchedUser.uInfo.userPass = '';  // ## clear user password before send data to web
    await ShareFunc.upsertUserSession1hr(body.comID, body.userID, tokenSet.userClassID);
    const token = await ShareFunc.genTokenSet(tokenSet, process.env.TOKENExpiresIn);
    res.status(200).json({
      token: token,
      expiresIn: process.env.expiresIn,
      userID: fetchedUser.userID,
      user: fetchedUser,
      mode: 'user', // ## user = normal user  , userNode= work station login
      nodeStation: {},
      stationID: '',
      company: {},
      factory: {}
    });
  } catch (err) {
    // console.log(err);
    return res.status(401).json({
      message: {
        messageID: 'erru004', 
        mode:'errLogin2', 
        value: "Invalid authentication credentials!"
      }
    });
  }
}


// ## check userID , userPass
exports.staffCheckConfirm = async (req, res, next) => {
  // console.log('staffCheckConfirm');
  const data = req.body;
  // console.log(data);
  const userID = data.userID;
  const userPass = data.userPass;
  const companyID = data.companyID;
  const factoryID = data.factoryID;
  const mode = data.mode;

  const current = new Date(moment().tz('Asia/Bangkok').format('YYYY/MM/DD HH:mm:ss+07:00'));

  try {
    // ## get user
    // let userf = await User.findOne({ userID: userID });
    const statusArr = ['a'];
    const state = 'joined';
    const userfS = await ShareFunc.staffLogin(userID, userPass, companyID, factoryID, statusArr, state);
    // console.log(userfS);
    if (!userfS) {
      return res.status(401).json({
        message: {
          messageID: 'erru003-2', 
          mode:'errStaffLoginPassForConfirm', 
          value: "Auth failed,  staff password incorrect for confirm"
        },
        success: false
      });
    } 

    let userf = await User.findOne({ userID: userID });
    // console.log(userf);
    const doMatch = await bcrypt.compare(userPass, userf.uInfo.userPass);
    // console.log('doMatch');
    if (!doMatch) { 
      return res.status(200).json({
        tokenNS: '',
        expiresIn: process.env.expiresIn,
        userID: userID,
        mode: mode,
        success: false
      });
    }

    // console.log('userf');
    // ## update user last login
    // const userLastLogin = await User.updateOne({userID: userID} , {"uInfo.lastLogin": current});
    
    // userf.uInfo.userPass = '';  // ## clear user password before send data to web

    await ShareFunc.upsertUserSession1hr(userID);
    // const token = await ShareFunc.genTokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);
    res.status(200).json({
      tokenNS: '',
      expiresIn: process.env.expiresIn,
      userID: userID,
      mode: mode,
      success: true
    });

  } catch (err) {
    res.status(500).json({
      message: {
        messageID: 'erru003-2', 
        mode:'errStaffLoginPassForConfirm', 
        value: "Auth failed,  staff password incorrect for confirm"
      },
      success: false
    });
  }
}

// router.get("/uinfo", checkAuth , UserController.getuserInfo);
exports.getuserInfo = async (req, res, next) => {
  // try {  } catch (err) {}
  const userID = req.params.userID;
  // console.log(req.body);
  try {
    // exports.delUserSession1hr= async (comID, userID, userClassID)
    // await ShareFunc.delUserSession1hr(body.comID, body.userID, tokenSet.userClassID);
    let userf = await User.findOne({ userID: userID});
    userf.uInfo.userPass = '';
    res.status(200).json({
      status: 'get user info',
      user: userf
    });
  } catch (err) {
    console.log(err);
    return res.status(401).json({
      message: {
        messageID: 'erru005', 
        mode:'errLogout', 
        value: "Log out error"
      }
    });
  }
}

exports.userLogout = async (req, res, next) => {
  // try {  } catch (err) {}
  const logID= 'ulo';  // ## user log out
  const body = req.body;
  const tokenSet = body.tokenSet;
  try {
    // exports.delUserSession1hr= async (comID, userID, userClassID)
    await ShareFunc.delUserSession1hr(body.comID, body.userID, tokenSet.userClassID);
    res.status(200).json({
      status: 'logout completed'
    });
  } catch (err) {
    console.log(err);
    return res.status(401).json({
      message: {
        messageID: 'erru005', 
        mode:'errLogout', 
        value: "Log out error"
      }
    });
  }
}

// UserClass

// // ## edit editPassFactoryStaff 
// router.put("/useredit1/factory/staff", checkAuth, checkUUID, userController.editPassFactoryStaff);
exports.editPassFactoryStaff = async (req, res, next) => {
  // try {  } catch (err) {}
  // console.log('editPassFactoryStaff');
  const userID = req.userData.tokenSet.userID;
  const data = req.body;
  const staffUserID = data.staffUserID;
  const newPass = data.newPass;
  const state = data.state;
  // console.log(staffUserID , newPass , state);
  try {

    // ## 
    const editStaffPassNew = await ShareFunc.editStaffPassNew(staffUserID, newPass, state);

    await ShareFunc.upsertUserSession1hr(userID);
    const token = await ShareFunc.genTokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);
    res.status(200).json({
      token: token,
      expiresIn: process.env.expiresIn,
      userID: userID,
      success: true
    });

  } catch (err) {
    res.status(500).json({
      message: {
        messageID: 'erru012', 
        mode:'errEditStaffPass', 
        value: "error edit staff password"
      }
    });
  }
}


// ## user 
// #######################################################################################################

// #######################################################################################################
// ## user company

// ## create new company 
// router.post("/create/company", UserController.createUserCompany);
exports.createUserCompany = async (req, res, next) => {
  // try {  } catch (err) {}
  // console.log(req.body);
  const data = req.body;
  const userID = data.userID;
  const userClass = {userClassID: 'own', userClassName: 'owner', userType: 'user', seq: 800};
  const createBy = {userID: data.userID, userName: data.userName};
  const current = new Date(moment().tz('Asia/Bangkok').format('YYYY/MM/DD HH:mm:ss+07:00'));
  const page = +data.page;
  const limit = +data.limit;

  try {
    // ## find control app
    const controlApp = await ShareFunc.getControlApp();
    // console.log(controlApp);

    let companyRunID = controlApp.companyRunID + 1;
    let companyID = 'c' + await ShareFunc.setStrLen(process.env.companyIDLen,companyRunID);
    let companyDocf = await Company.findOne({companyID:companyID});
    while (companyDocf){
      companyDocf = await Company.findOne({companyID:companyID});
      companyRunID++;
      companyID = 'c' + await ShareFunc.setStrLen(process.env.companyIDLen,companyRunID);
    }

    // ## create new company
    // const company = {};
    const companyUpsert = await Company.updateOne(
      {companyID:companyID} , 
      {
        cDescription: data.cDescription,
        "cInfo.companyName": data.companyName,
        "cInfo.registDate": current,
        "cInfo.createBy": createBy
      }, {upsert: true}); 

    // ## update company array in User
    const uCompany = {
      companyID: companyID,
      state: 'joined',
      userComClass: userClass
    };
    const userCompany = await User.updateOne({userID:data.userID} , {$push: {uCompany: uCompany}});

    // ## update control app --> companyRunID
    await ShareFunc.updateControlAppCompanyRunID(process.env.APPNAME, +companyRunID);

    // // ## get user company info
    // let userf = await User.findOne({ userID: data.userID });
    // let companyArr = [];
    // // let factoryArr = [];
    // await this.asyncForEach(userf.uCompany , async (item) => {
    //   if(!companyArr.some(i => i == item.companyID)) {
    //     companyArr.push(item.companyID);
    //   }
    // });
    // // await this.asyncForEach(userf.uFactory , async (item) => {
    // //   if(!factoryArr.some(i => i == item.factoryID)) {
    // //     factoryArr.push(item.factoryID);
    // //   }
    // // });
    // // ## getCompanylInfo= async (companyid, page, limit)
    // const company = await ShareFunc.getCompanyInfo(companyArr, +data.page , +data.limit);
    // // // ## getFactoryInfo= async (factoryIDArr, page, limit)
    // // const factory = await ShareFunc.getFactoryInfo(factoryArr, +page , +limit);

    const dataF = await ShareFunc.getCompanys(userID, page, limit);
    const company = dataF.company;
    let userf = dataF.userf;

    userf.uInfo.userPass = '';
    // console.log(company);

    await ShareFunc.upsertUserSession1hr(data.userID);
    const token = await ShareFunc.genTokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);
    res.status(200).json({
      token: token,
      expiresIn: process.env.expiresIn,
      userID: data.userID,
      company: company,
      // factory: factory,
      user: userf
    });

  } catch (err) {
    res.status(500).json({
      message: {
        messageID: 'errc001', 
        mode:'errCompanyCreate', 
        value: "company create error!"
      }
    });
  }
}

// ## get new company 
// router.get("/get/company/:user/:page/:limit", checkAuth, UserController.getUserCompany);
exports.getUserCompany = async (req, res, next) => {
  // try {} catch (err) {}
  const userID = req.params.userID;
  const page = req.params.page;
  const limit = req.params.limit;
  // console.log(userID, page, limit);

  try {
    // // ## get user company info
    // const userf = await User.findOne({ userID: userID });
    // let companyArr = [];
    // // let factoryArr = [];
    // await this.asyncForEach(userf.uCompany , async (item) => {
    //   if(!companyArr.some(i => i == item.companyID)) {
    //     companyArr.push(item.companyID);
    //   }
    // });
    // // await this.asyncForEach(userf.uFactory , async (item) => {
    // //   if(!factoryArr.some(i => i == item.factoryID)) {
    // //     factoryArr.push(item.factoryID);
    // //   }
    // // });

    // // ## getCompanylInfo= async (companyidArr, page, limit)
    // const company = await ShareFunc.getCompanyInfo(companyArr, +page , +limit);
    // // console.log(company);
    // // // ## getFactoryInfo= async (factoryIDArr, page, limit)
    // // const factory = await ShareFunc.getFactoryInfo(factoryArr, +page , +limit);

    const dataF = await ShareFunc.getCompanys(userID, page, limit);
    const company = dataF.company;

    await ShareFunc.upsertUserSession1hr(userID);
    // console.log(req.userData.tokenSet);
    const token = await ShareFunc.genTokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);

    res.status(200).json({
      token: token,
      expiresIn: process.env.expiresIn,
      userID: userID,
      company: company,
      // factory: factory
    });
  } catch (err) {
    return res.status(501).json({
      message: {
        messageID: 'errc002', 
        mode:'errGetCompanyInfo', 
        value: "get company info error"
      }
    });
  }
}

// // ## get user1 company 
// router.get("/getuser1/company/:userID", checkAuth, checkUUID, userController.getUser1Company);
exports.getUser1Company = async (req, res, next) => {
  // try {} catch (err) {}
  const userID = req.params.userID;
  try {
    // // ## get user1 company info
    let userf = await User.findOne({ userID: userID});
    userf.uInfo.userPass = '';

    await ShareFunc.upsertUserSession1hr(userID);
    // console.log(req.userData.tokenSet);
    const token = await ShareFunc.genTokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);

    res.status(200).json({
      token: token,
      expiresIn: process.env.expiresIn,
      userID: userID,
      user: userf,
      // factory: factory
    });
  } catch (err) {
    return res.status(501).json({
      message: {
        messageID: 'erru011', 
        mode:'errGet1UserCompany', 
        value: "error get 1 user company"
      }
    });
  }
}


// // ## get member company 
// router.get("/get/member/company/:companyID/:page/:limit", checkAuth, checkUUID, userController.getMemberCompany);
exports.getMemberCompany = async (req, res, next) => {
  // try {} catch (err) {}
  const userID = req.userData.tokenSet.userID;
  const companyID = req.params.companyID;
  const page = +req.params.page;
  const limit = +req.params.limit;
  // console.log(userID, page, limit);

  try {
    // // ## get members company 
    const membersCompany = await ShareFunc.getCompanyMembers(companyID, page, limit);
    // console.log(membersCompany);

    await ShareFunc.upsertUserSession1hr(userID);
    const token = await ShareFunc.genTokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);

    res.status(200).json({
      token: token,
      expiresIn: process.env.expiresIn,
      userID: userID,
      membersCompany: membersCompany,
      // factory: factory
    });
  } catch (err) {
    return res.status(501).json({
      message: {
        messageID: 'errc004', 
        mode:'errGetCompanyMember', 
        value: "get company member error"
      }
    });
  }
}


// router.get("/get1/company/:companyID", checkAuth, checkUUID, userController.getCompany);
exports.getCompany1 = async (req, res, next) => {
  // try {} catch (err) {}
  const companyID = req.params.companyID;
  try {
    // exports.getCompany1Info= async (companyID) 
    const company = await ShareFunc.getCompany1Info(companyID);
    const token = await ShareFunc.genTokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);

    res.status(200).json({
      token: token,
      expiresIn: process.env.expiresIn,
      company: company,
      // factory: factory
    });
  } catch (err) {
    return res.status(501).json({
      message: {
        messageID: 'errc002', 
        mode:'errGetCompanyInfo', 
        value: "get company info error"
      }
    });
  }
}

// // ## edit company 
// router.put("/edit/company", checkAuth, checkUUID, userController.editCompany);
exports.editCompany = async (req, res, next) => {
  // try {  } catch (err) {}
  // console.log('editCompany');
  const data = req.body;
  // console.log(data);
  const userID = req.userData.tokenSet.userID;
  const companyData = data.company;
  const page = +data.page;
  const limit = +data.limit;

  // const current = new Date(moment().tz('Asia/Bangkok').format('YYYY/MM/DD HH:mm:ss+07:00'));
  try {

    // ## editCompany (company)
    const editCompany = await ShareFunc.editCompany(companyData);
    // console.log('1');
    const dataF = await ShareFunc.getCompanys(userID, page, limit);
    const company = dataF.company;
    // console.log('2');

    await ShareFunc.upsertUserSession1hr(userID);
    const token = await ShareFunc.genTokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);
    res.status(200).json({
      token: token,
      expiresIn: process.env.expiresIn,
      userID: userID,
      company: company,
    });

  } catch (err) {
    res.status(500).json({
      message: {
        messageID: 'errc003', 
        mode:'errCompanyEdit', 
        value: "company edit error"
      }
    });
  }
}

// // ## invite member 
// router.put("/invite/member/company", checkAuth, checkUUID, userController.putInviteMemberCompany);
exports.putInviteMemberCompany = async (req, res, next) => {
  // try {  } catch (err) {}
  // console.log('editCompany');
  const data = req.body;
  const memberUserID = data.memberUserID;
  const companyID = data.companyID;
  const status = 'a'; // ## a = active
  // console.log('putInviteMemberCompany');
  const userID = req.userData.tokenSet.userID;
  const userComClass = {userClassID: 'gst', userClassName: 'guest'};
  // const companyData = data.company;
  // const current = new Date(moment().tz('Asia/Bangkok').format('YYYY/MM/DD HH:mm:ss+07:00'));
  try {

    // ## check exist userID/memberUserID
    // findUserAndStatus= async (userID, status)
    // console.log(memberUserID, status);
    const userf = await ShareFunc.findUserAndStatus(memberUserID, status);
    // console.log(userf);
    if (userf) {
      const findCompany = await userf.uCompany.filter(i => (i.companyID == companyID));
      if (findCompany.length === 0) {
        const uCompany = {
          companyID: companyID,
          state: 'wait',
          userComClass: userComClass
        };
        // ## invite member/userID
        const inviteMember = await ShareFunc.inviteMemberToCompany(memberUserID, uCompany);
      } else {
        return res.status(422).json({
          message: {
            messageID: 'erru006-2', 
            mode:'errInviteMemberAlreadyInvited', 
            value: "error invite member , already invited"
          },
          success: false
        });
      }
    } else {
      // console.log('erru006-1');
      return res.status(422).json({
        message: {
          messageID: 'erru006-1', 
          mode:'errInviteMemberNoHasUserID', 
          value: "error invite member no has userID / not exist"
        },
        success: false
      });
    }
 
    await ShareFunc.upsertUserSession1hr(userID);
    const token = await ShareFunc.genTokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);
    res.status(200).json({
      token: token,
      expiresIn: process.env.expiresIn,
      userID: userID,
      message: {
        messageID: 'complete', 
        mode:'complete', 
        value: "invite member completed"
      },
      success: true
    });

  } catch (err) {
    res.status(500).json({
      message: {
        messageID: 'erru006', 
        mode:'errInviteMember', 
        value: "error invite member"
      }
    });
  }
}

// // ##  member join company
// router.put("/join/member/company", checkAuth, checkUUID, userController.putUserJoinCompany);
exports.putUserJoinCompany = async (req, res, next) => {
  // try {  } catch (err) {}
  // console.log('editCompany');
  const data = req.body;
  // const memberUserID = data.memberUserID;
  const companyID = data.companyID;
  const page = +data.page;
  const limit = +data.limit;

  const userID = req.userData.tokenSet.userID;

  try {

    // ## member join company
    const joinMember = await ShareFunc.userJoinToCompany(userID, companyID);

    // // ## get  user info
    let userf = await User.findOne({ userID: userID});
    userf.uInfo.userPass = '';

    await ShareFunc.upsertUserSession1hr(userID);
    const token = await ShareFunc.genTokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);
    res.status(200).json({
      token: token,
      expiresIn: process.env.expiresIn,
      userID: userID,
      user: userf,
      message: {
        messageID: 'complete', 
        mode:'complete', 
        value: "user/member join company completed"
      },
      success: true
    });

  } catch (err) {
    res.status(500).json({
      message: {
        messageID: 'erru007', 
        mode:'errJoinMember', 
        value: "error member join company"
      }
    });
  }
}

// router.put("/edit/userclass/company", checkAuth, checkUUID, userController.putUserClassCompany);
exports.putUserClassCompany = async (req, res, next) => {
  // try {  } catch (err) {}
  // console.log('editCompany');
  const data = req.body;
  const memberUserID = data.memberUserID;
  const companyID = data.companyID;
  const userComClass = data.userComClass;
  // const companyID = data.companyID;

  const page = +data.page;
  const limit = +data.limit;

  const userID = req.userData.tokenSet.userID;

  try {

    // ## edit member class company
    const editMemberClass = await ShareFunc.editUserClassToCompany(memberUserID, companyID, userComClass);

    // ## get members company 
    const membersCompany = await ShareFunc.getCompanyMembers(companyID, page, limit);

    // // ## get  user info
    let userf = await User.findOne({ userID: memberUserID});
    userf.uInfo.userPass = '';

    await ShareFunc.upsertUserSession1hr(userID);
    const token = await ShareFunc.genTokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);
    res.status(200).json({
      token: token,
      expiresIn: process.env.expiresIn,
      userID: userID,
      user: userf,
      membersCompany: membersCompany,
      message: {
        messageID: 'complete', 
        mode:'complete', 
        value: "user/member edit user class company completed"
      },
      success: true
    });

  } catch (err) {
    res.status(500).json({
      message: {
        messageID: 'erru008', 
        mode:'errEditMemberClassCompany', 
        value: "error edit member class company"
      },
      success: false,
      user: {}
    });
  }
}

// ## user company
// #######################################################################################################


// #######################################################################################################
// ## user factory

// // ## create new factory 
// router.post("/create/factory", checkAuth, UserController.createUserFactory);
exports.createUserFactory = async (req, res, next) => {
  // try {  } catch (err) {}
  // companyID userID page limit
  // console.log(req.body);
  // const factory = [];
  const data = req.body;
  const userFacClass = {userClassID: 'own', userClassName: 'owner', userType: 'user', seq: 800};
  const createBy = {userID: data.userID, userName: data.userName};
  const current = new Date(moment().tz('Asia/Bangkok').format('YYYY/MM/DD HH:mm:ss+07:00'));

  try {

    // ## find control app
    const controlApp = await ShareFunc.getControlApp();
    // console.log(controlApp);

    let factoryRunID = controlApp.factoryRunID + 1;
    let factoryID = 'f' + await ShareFunc.setStrLen(process.env.factoryIDLen,factoryRunID);
    let factoryDocf = await Factory.findOne({$and: [{"factoryID":factoryID}, {"companyID":data.companyID}]});
    while (factoryDocf){
      factoryDocf = await Factory.findOne({$and: [{"factoryID":factoryID}, {"companyID":data.companyID}]});
      factoryRunID++;
      factoryID = 'f' + await ShareFunc.setStrLen(process.env.factoryIDLen,factoryRunID);
    }
    // console.log(factoryID);
    // ## create new factory
    const factoryUpsert = await Factory.updateOne({$and: [
        {"factoryID":factoryID}, 
        {"companyID":data.companyID}
      ]} , 
      {
        fDescription: data.fDescription,
        "fInfo.factoryName": data.factoryName,
        "fInfo.registDate": current,
        "fInfo.createBy": createBy
      }, {upsert: true}); 

    // ## update factory array in User
    const uFactory = {
      factoryID: factoryID,
      companyID: data.companyID,
      state: 'joined',
      userFacClass: userFacClass      
    };
    const userCompany = await User.updateOne({userID:data.userID} , {$push: {uFactory: uFactory}});

    // ## update control app --> companyRunID
    await ShareFunc.updateControlAppFactoryRunID(process.env.APPNAME, +factoryRunID);

    // ## get user factory info
    let userf = await User.findOne({ userID: data.userID });
    const factoryArr = await ShareFunc.getFactoryArr(userf.uFactory);

    // ## getFactoryInfo= async (factoryIDArr, page, limit)
    const factory = await ShareFunc.getFactoryInfo(factoryArr, data.companyID, +data.page , +data.limit);
    userf.uInfo.userPass = '';



    await ShareFunc.upsertUserSession1hr(data.userID);
    const token = await ShareFunc.genTokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);
    res.status(200).json({
      token: token,
      expiresIn: process.env.expiresIn,
      userID: data.userID,
      factory: factory,
      user: userf
    });
  } catch (err) {
    res.status(500).json({
      message: {
        messageID: 'errf001', 
        mode:'errFactoryCreate', 
        value: "factory create error!"
      }
    });
  }

}

// // ## create company factory user/staff
// router.post("/create/companyID/factory/user", checkAuth, checkUUID, userController.createUserCompanyFactory);
exports.createUserCompanyFactory = async (req, res, next) => {
  // try {  } catch (err) {}
  // companyID userID page limit
  // console.log(req.body);
  // const factory = [];
  const data = req.body;
  const user = data.user;
  const companyID = user.uFactory[0].companyID;
  const factoryID = user.uFactory[0].factoryID;
  const checkUserID = user.userID;
  // const userClass = {userClassID: 'own', userClassName: 'owner'};
  const createBy = data.createBy;
  const current = new Date(moment().tz('Asia/Bangkok').format('YYYY/MM/DD HH:mm:ss+07:00'));
  const userID = req.userData.tokenSet.userID;
  // console.log('companyID, factoryID, checkUserID')
  // console.log(companyID, factoryID, checkUserID, userID)
  try {
    await ShareFunc.upsertUserSession1hr(userID);
    const token = await ShareFunc.genTokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);
    // console.log(companyID, factoryID, checkUserID, userID)
    // exports.checkUserIDExisted= async (userID)
    const isExist = await ShareFunc.checkUserIDExisted(companyID, factoryID, checkUserID);
    if (isExist) {
      return res.status(422).json({
        message: {
          messageID: 'erru010-1', 
          mode:'errCreateCompanyFactoryUserExisted', 
          value: "error create company factory user existed"
        },
        success: false,
        user: {}
      });
    } else {
      // ## create user	
      // console.log('1');
      // ## start new user password
      let userPass = '';
      bcrypt.hash(process.env.NEWPASSWORD, 10).then(async (hash) => {
        userPass = hash;
        // console.log('2');
        const uInfo = {
          userName : user.uInfo.userName,
          userPass : userPass,
          pic : '',
          tel : user.uInfo.tel,
          email : user.uInfo.email,
          registDate : current,
          lastLogin : current
        };
        const type = user.type;  // u=user , s=staff/worker , us=userstaff
        const status = user.status;
        const state = user.state;  // ## staff = worker , user office
        const uCompany = [];
        const uFactory = user.uFactory;
        // console.log(uFactory);
  
        const userUpsert = await User.updateOne({$and: [
          {"userID":user.userID},
        ]} , 
        {
          "type": type,
          "uInfo": uInfo,
          "uCompany": uCompany,
          "uFactory": uFactory,
          "status": status,
          "state": state,
          "createBy": createBy,
        }, {upsert: true}); 
  
        // ## get  user info
        let userf = await User.findOne({ userID: user.userID});
        userf.uInfo.userPass = '';
        // console.log(userf);

        res.status(200).json({
          token: token,
          expiresIn: process.env.expiresIn,
          userID: userID,
          user: userf,
          message: {
            messageID: 'complete', 
            mode:'complete', 
            value: "create user/staff completed"
          },
          success: true
        });
      });
    }
  } catch (err) {
    res.status(500).json({
      message: {
        messageID: 'erru010', 
        mode:'errCreateCompanyFactoryUser', 
        value: "error create company factory user!"
      },
      success: false,
      user: {}
    });
  }
}

// // ## get  user  factory by userID companyID
// router.get("/get/factory/:userID/:companyID/:page/:limit", checkAuth, UserController.getUserFactory);
exports.getUserFactory = async (req, res, next) => {
  // try {} catch (err) {}
  // companyID userID page limit
  // console.log(req.params);
  const userID = req.params.userID;
  const companyID = req.params.companyID;
  const page = +req.params.page;
  const limit = +req.params.limit;

  try {
    // ## get user factory info
    let userf = await User.findOne({ userID: userID });
    // const factoryArr = await ShareFunc.getFactoryArr(userf.uFactory);
    // getFactoryArr2
    const factoryArr = await ShareFunc.getFactoryArr2(companyID);
    // console.log(factoryArr);

    // console.log(req.params);
    // ## getFactoryInfo= async (factoryIDArr, page, limit)
    const factory = await ShareFunc.getFactoryInfo(factoryArr, companyID, +page , +limit);

    // ## get subNodeflow
    const subNodeflowC = await ShareFunc.getSubNodeflowC(companyID);

    await ShareFunc.upsertUserSession1hr(userID);
    const token = await ShareFunc.genTokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);
    res.status(200).json({
      token: token,
      expiresIn: process.env.expiresIn,
      userID: userID,
      factory: factory,
      subNodeflowC: subNodeflowC
    });
  } catch (err) {
    return res.status(501).json({
      message: {
        messageID: 'errf002', 
        mode:'errGetFactoryInfo', 
        value: "get company info error"
      }
    });
  }

}

// // ## get  user  factories by  companyID
// router.get("/get/factories/by/:userID/:companyID", checkAuth, checkUUID, userController.getFactoriesByCompanyID);
exports.getFactoriesByCompanyID = async (req, res, next) => {
  // try {} catch (err) {}
  // companyID userID page limit
  // console.log(req.params);
  const userID = req.params.userID;
  const companyID = req.params.companyID;
  // const page = +req.params.page;
  // const limit = +req.params.limit;

  try {
    // ## get user factory info
    // let userf = await User.findOne({ userID: userID });
    const factories = await ShareFunc.getFactoryArrByCompanyID(companyID);
    // console.log(factoryArr);

    // // ## getFactoryInfo= async (factoryIDArr, page, limit)
    // const factory = await ShareFunc.getFactoryInfo(factoryArr, companyID, +page , +limit);

    await ShareFunc.upsertUserSession1hr(userID);
    const token = await ShareFunc.genTokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);
    res.status(200).json({
      token: token,
      expiresIn: process.env.expiresIn,
      userID: userID,
      factories: factories,
    });
  } catch (err) {
    return res.status(501).json({
      message: {
        messageID: 'errf002', 
        mode:'errGetFactoryInfo', 
        value: "get company info error"
      }
    });
  }

}

// // ## get  gn  factories by  companyID   / gn=general
// router.get("/get/gn/factories/by/:companyID", userController.getGNFactoriesByCompanyID);
exports.getGNFactoriesByCompanyID = async (req, res, next) => {
  // try {} catch (err) {}
  const companyID = req.params.companyID;
  try {
    // ## get user factory info
    // let userf = await User.findOne({ userID: userID });
    const factories = await ShareFunc.getFactoryArrByCompanyID(companyID);
    // console.log(factories);

    // // ## get subNodeflow
    // const subNodeflow = await ShareFunc.getSubNodeFlow(companyID);

    // await ShareFunc.upsertUserSession1hr(userID);
    // const token = await ShareFunc.genTokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);
    res.status(200).json({
      factories: factories,
      // subNodeflow: subNodeflow
    });
  } catch (err) {
    return res.status(501).json({
      message: {
        messageID: 'errf002', 
        mode:'errGetFactoryInfo', 
        value: "get company info error"
      }
    });
  }

}

// // ## get  user  factory by  companyID factoryID
// router.get("/get1/factory/:companyID/:factoryID", checkAuth, checkUUID, userController.getFactory1);
exports.getFactory1 = async (req, res, next) => {
  // try {} catch (err) {}
  const companyID = req.params.companyID;
  const factoryID = req.params.factoryID;

  try {
    // exports.getFactory1Info= async (companyID, factoryID)
    const factory = await ShareFunc.getFactory1Info(companyID, factoryID);

    const token = await ShareFunc.genTokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);
    res.status(200).json({
      token: token,
      expiresIn: process.env.expiresIn,
      factory: factory,
    });
  } catch (err) {
    return res.status(501).json({
      message: {
        messageID: 'errf002', 
        mode:'errGetFactoryInfo', 
        value: "get company info error"
      }
    });
  }
}

// // ## get  user member  factory by userID companyID
// router.get("/getmembers/factory/:companyID/:factoryID/:page/:limit", checkAuth, checkUUID, userController.getUserMemberFactory);
exports.getUserMemberFactory = async (req, res, next) => {
  // try {} catch (err) {}
  const companyID = req.params.companyID;
  const factoryID = req.params.factoryID;
  const state = req.params.state;
  const page = +req.params.page;
  const limit = +req.params.limit;

  try {
    // exports.getFactory1Info= async (companyID, factoryID)
    const membersFactory = await ShareFunc.getMembersFactory(companyID, factoryID, state, page, limit);

    const token = await ShareFunc.genTokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);
    res.status(200).json({
      token: token,
      expiresIn: process.env.expiresIn,
      membersFactory: membersFactory,
    });
  } catch (err) {
    return res.status(501).json({
      message: {
        messageID: 'errf004', 
        mode:'errGetFactoryMember', 
        value: "get company member error"
      }
    });
  }
}

// // ## edit factoery 
// router.put("/edit/factory", checkAuth, checkUUID, userController.editFactory);
exports.editFactory = async (req, res, next) => {
  const data = req.body;
  // console.log(data);
  const userID = req.userData.tokenSet.userID;
  const companyID = data.companyID;
  const factoryData = data.factoryData;
  const page = +data.page;
  const limit = +data.limit;

  // const current = new Date(moment().tz('Asia/Bangkok').format('YYYY/MM/DD HH:mm:ss+07:00'));
  try {

    // ## edit factory
    const editFactory = await ShareFunc.editFactory(companyID, factoryData);

    // ## get user factory info
    let userf = await User.findOne({ userID: userID });
    const factoryArr = await ShareFunc.getFactoryArr(userf.uFactory);

    // ## getFactoryInfo= async (factoryIDArr, page, limit)
    const factorys = await ShareFunc.getFactoryInfo(factoryArr, companyID, +page , +limit);

    await ShareFunc.upsertUserSession1hr(userID);
    const token = await ShareFunc.genTokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);
    res.status(200).json({
      token: token,
      expiresIn: process.env.expiresIn,
      userID: userID,
      factorys: factorys,
    });

  } catch (err) {
    res.status(500).json({
      message: {
        messageID: 'errf003', 
        mode:'errFactoryEdit', 
        value: "factory edit error"
      }
    });
  }
}

// router.get("/check/existuserid/:companyID/:factory/:checkuserID", checkAuth, checkUUID, userController.getCheckExistCompanyFactoryUserID);
exports.getCheckExistCompanyFactoryUserID = async (req, res, next) => {
  // try {} catch (err) {}
  const companyID = req.params.companyID;
  const factoryID = req.params.factoryID;
  const userID = req.userData.tokenSet.userID;
  const checkUserID = req.params.checkuserID;
  

  try {
    // exports.checkUserIDExisted= async (userID)
    const isExist = await ShareFunc.checkUserIDExisted(companyID, factoryID, checkUserID);

    await ShareFunc.upsertUserSession1hr(userID);
    const token = await ShareFunc.genTokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);
    res.status(200).json({
      token: token,
      expiresIn: process.env.expiresIn,
      isExist: isExist,
    });
  } catch (err) {
    return res.status(501).json({
      message: {
        messageID: 'erru009', 
        mode:'checkUserIDExist', 
        value: "error check userID exist"
      }
    });
  }
}



// ## user factory
// #######################################################################################################


// #######################################################################################################
// ## staff factory

// router.post("/stf/create/companyID/factory/staff", checkAuth, checkUUID, userController.createStaffCompanyFactory);
exports.createStaffCompanyFactory = async (req, res, next) => {
  // try {  } catch (err) {}
  // companyID userID page limit
  // console.log(req.body);
  // const factory = [];
  // console.log('createStaffCompanyFactory');
  const data = req.body;
  const user = data.user;
  const companyID = user.uFactory[0].companyID;
  const factoryID = user.uFactory[0].factoryID;
  const checkUserID = user.userID;
  // const userClass = {userClassID: 'own', userClassName: 'owner'};
  const createBy = data.createBy;
  const current = new Date(moment().tz('Asia/Bangkok').format('YYYY/MM/DD HH:mm:ss+07:00'));
  const userID = req.userData.tokenSet.userID;
  // console.log('companyID, factoryID, checkUserID')
  // console.log(companyID, factoryID, checkUserID, userID)
  // console.log(user)
  try {
    await ShareFunc.upsertUserSession1hr(userID);
    const token = await ShareFunc.genTokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);
    // console.log(companyID, factoryID, checkUserID, userID)
    // exports.checkUserIDExisted= async (userID)
    const isExist = await ShareFunc.checkUserIDExisted(companyID, factoryID, checkUserID);
    if (isExist) {
      return res.status(422).json({
        message: {
          messageID: 'erru010-1', 
          mode:'errCreateCompanyFactoryUserExisted', 
          value: "error create company factory user existed"
        },
        success: false,
        user: {}
      });
    } else {
      // ## create user	
      // console.log('1');
      // ## start new user password
      // let userPass = '';
      // bcrypt.hash(process.env.NEWPASSWORD, 10).then(async (hash) => {
        // userPass = hash;
        // console.log('2');
        const uInfo = {
          userName : user.uInfo.userName,
          userPass : '',
          pic : '',
          tel : '',
          email : '',
          registDate : current,
          lastLogin : current
        };
        const type = user.type;  // u=user , s=staff/worker , us=userstaff
        const qrCode = user.qrCode;
        const status = user.status;
        const state = user.state;  // ## staff = worker , user office
        const uCompany = [];
        const uFactory = user.uFactory;
        // console.log(uFactory);
  
        const userUpsert = await User.updateOne({$and: [
          {"userID":user.userID},
        ]} , 
        {
          "type": type,
          "qrCode": qrCode,
          "uInfo": uInfo,
          "uCompany": uCompany,
          "uFactory": uFactory,
          "status": status,
          "state": state,
          "createBy": createBy,
        }, {upsert: true}); 
  
        // ## get  user info
        let userf = await User.findOne({ userID: user.userID});
        userf.uInfo.userPass = '';
        // console.log(userf);

        res.status(200).json({
          token: token,
          expiresIn: process.env.expiresIn,
          userID: userID,
          user: userf,
          message: {
            messageID: 'complete', 
            mode:'complete', 
            value: "create user/staff completed"
          },
          success: true
        });
      // });
    }
  } catch (err) {
    res.status(500).json({
      message: {
        messageID: 'erru010', 
        mode:'errCreateCompanyFactoryUser', 
        value: "error create company factory user!"
      },
      success: false,
      user: {}
    });
  }
}


// // ## get staff1 company 
// router.get("/getstaff1/company/:userID", checkAuth, checkUUID, userController.getStaff1Company);
exports.getStaff1Company = async (req, res, next) => {
  // try {} catch (err) {}
  const userID = req.params.userID;
  try {
    // // ## get user1 company info
    // let userf = await User.findOne({ userID: userID});
    let userf = await User.findOne({ $or: [ { userID: userID }, { qrCode: userID } ] });
    
    userf.uInfo.userPass = '';

    await ShareFunc.upsertUserSession1hr(userID);
    // console.log(req.userData.tokenSet);
    const token = await ShareFunc.genTokenSet(req.userData.tokenSet, process.env.TOKENExpiresIn);

    res.status(200).json({
      token: token,
      expiresIn: process.env.expiresIn,
      userID: userID,
      user: userf,
      // factory: factory
    });
  } catch (err) {
    return res.status(501).json({
      message: {
        messageID: 'erru011', 
        mode:'errGet1UserCompany', 
        value: "error get 1 user company"
      }
    });
  }
}

// ## staff factory
// #######################################################################################################


// #############################################################
// ## image upload

// postUpdateUploadImages
exports.postUpdateUploadImages = async (req, res, next) => {
  const file = req.file;
  const filename = file.filename;
  // console.log(file);
  try {

    res.status(201).json({
      message: "postMBUpdateProfileImage",
      status: 'imageProfileUpdated'
    });
  } catch (err) {

  }
}

// // ## /api/user/update/upload/images/gcs postUpdateUploadImagesGCS
// exports.postUpdateUploadImagesGCS = async (req, res, next) => {
//   const file = req.file;
//   const filename = file.filename;
//   // console.log(file);
//   try {

//     if (req.file) {
//       console.log("File found, trying to upload...");
//       const blob = bucket.file(req.file.originalname);
//       const blobStream = blob.createWriteStream();

//       blobStream.on("finish", () => {
//         res.status(200).send("Success");
//         console.log("Success");
//       });
//       blobStream.end(req.file.buffer);
//     } else throw "error with img";
//     res.status(201).json({
//       message: "postMBUpdateProfileImage",
//       status: 'imageProfileUpdated'
//     });
//   } catch (err) {

//   }
// }


// ## image upload
// #############################################################