const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const orderProductionSchema = mongoose.Schema({
  companyID: { type: String, required: true },
  factoryID: { type: String, required: true },  // ## โรงงานไหน
  orderID: { type: String, required: true}, // ## from orderID
  ver : {type: Number}, // ## version
  open : {type: Boolean},  
  bundleNo : {type: Number},  
  bundleID : {type: String},
  productID : {type: String, required: true},  
  productBarcodeNo : {type: String, required: true},   // ## all product เสื้อทุกตัว barcode
  productBarcodeNoReal : {type: String},  // ## qrcode แท้จิงจะอยู่ที่นี้ ในกรณีใช้ qrcode replacement
  productBarcodeNoReserve : [{       // ## last one @ first element   ตัวล่าสุดเอาไว้ช่องแรก
    productBarcodeNo : {type: String},
    datetime : {type: Date},
    nodeID : {type: String},
    createBy: {
      userID: {type: String},
      userName: {type: String},
    }
  }],  
  targetPlace : {
    targetPlaceID : {type: String},
    targetPlaceName : {type: String},
    countryID : {type: String},
    countryName : {type: String},
  },
  productCount : {type: Number},  
  productionDate : {type: Date, required: true},  // ## วันที่เริ่มต้นผลิต
  productStatus : {type: String},  
  orLost : {
    datetime : {type: Date},
    odpLostID : {type: String},
    lostGroupID : {type: String},
    nodeID : [{type: String}],
    note : {type: String},
    createBy: {
      userID: {type: String},
      userName: {type: String},
    },
  },

  forLoss : {type: Boolean},  
  isOutsourceTracking : {type: Boolean},
  yarnLot: [{   // ## 
    yarnLotID : {type: String},
  }],
  outsourceData: [{   // ## 
    factoryID : {type: String},
    fromFactoryID : {type: String},
    datetime : {type: Date},
  }],
  // ## [เพิ่มใหม่ · Scan Checking] ตรวจงานที่รับคืนจาก outsource (user 2026-07-25)
  //    เปิด/ปิดด้วย config ระดับโรงงาน: station-STATION_CHECK_ENABLE / STATION_CHECK_NODES
  //    ตอนรับคืน (outsource receive) ระบบจะ $set checkPending = node ที่ outsource ทำมา ∩ node ที่ต้องตรวจ (เรียงตาม flow)
  //    เสื้อที่ checkPending ยังไม่ว่าง = สแกนผ่าน node ถัดไปไม่ได้ · สแกนตรวจทีละ node ตามลำดับ → shift ออกทีละตัว
  //    โรงที่ไม่เปิด config = ไม่มีการเขียน field พวกนี้เลย (พฤติกรรมเดิมเป๊ะ)
  checkPending: [{type: String}],   // ## คิว nodeID ที่ยังไม่ได้ตรวจ (เรียงตามลำดับ flow) · ว่าง = ตรวจครบ/ไม่ต้องตรวจ
  checkFactoryID: {type: String},   // ## โรงงานที่รับคืนและเป็นเจ้าของคิวตรวจนี้ (ใช้ scope worklist ไม่ให้ข้ามโรง)
  checkNode: [{   // ## ประวัติการตรวจที่ทำไปแล้ว
    factoryID : {type: String},     // โรงที่ตรวจ
    nodeID : {type: String},        // node ที่ตรวจ เช่น 2.PANAL-INSPECTION
    outFactoryID : {type: String},  // outsource ที่ทำงาน node นี้มา
    datetime : {type: Date},
    sTypeOtus : {type: String},     // b = bundle , 1 = 1by1
    info : {type: String},
    createBy: {
      userID: {type: String},
      userName: {type: String},
    },
  }],
  subNodeFlow: [{   // ##
    factoryID: { type: String},
    nodeID : {type: String},
    subNodeID : {type: String},
    qrCode : {type: String}, // staffID , qrCode of staff
    empState : {type: String}, // PPI = pay per item  / DP = daily pay
    datetime : {type: Date},
    monthlyID: {type: String},  // ## งวด ID  เอาไว้ใช้เวลาทำเกี่ยวกับ บัญชี
    cost : {type: mongoose.Types.Decimal128},
    createBy: {
      userID: {type: String},
      userName: {type: String},
    },
  }],
  productionNode: [{   // ## อยู่ในการผลิตขั้นตอนไหน
    factoryID : {type: String},  // that factory did / ฝีมือโรงงานไหน
    fromNode : {type: String},
    toNode : {type: String},
    datetime : {type: Date},
    status : {type: String},
    info : {type: String},  // ## 
    sTypeOtus : {type: String},  // ## b =bundle , 1= 1by 1 / sType=scanType
    problemID : {type: String},
    problemName : {type: String},
    isTracking : {type: Boolean},  // ## scan by user-office check by themselve
    isOutsource : {type: Boolean}, 
    outsourceData: [{   // ## 
      factoryID : {type: String},
      fromFactoryID : {type: String},
    }],
    createBy: {
      userID: {type: String},
      userName: {type: String},
    },
    // ## [เพิ่มใหม่ · Outsource Cost] ปักธง "คิดเงิน/จ่ายแล้ว" ต่อ node เพื่อกันจ่ายซ้ำ (ไม่แตะ field เดิม)
    outsBilled    : {type: Boolean},   // ตั้งบิลค้างอยู่ (จองแล้ว)
    outsPaid      : {type: Boolean},   // จ่ายจริงแล้ว
    outsBillID    : {type: String},    // อ้างบิล outsource
    outsPayableID : {type: String},    // อ้าง AccPayable
    outsPaidAt    : {type: Date},      // เวลาจ่าย
  }]
});

				


orderProductionSchema.plugin(uniqueValidator);

module.exports = mongoose.model("OrderProduction", orderProductionSchema);
