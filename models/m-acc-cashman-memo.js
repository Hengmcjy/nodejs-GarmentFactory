const mongoose = require("mongoose");

// AccCashManMemo - reminder memo for each cash man (prevent forgetting to post daily).
// This memo does NOT affect statement / daily accounting / balance in any way.
//   status: 'pending' = not yet posted to daily · 'done' = accounting posted it
//   delete = soft void (voided=true), strike-through only, not real delete
// comments[]: cash man / accounting can chat on each memo.

const commentSchema = new mongoose.Schema({
  text: { type: String, default: '' },
  by:   { userID: { type: String, default: '' }, userName: { type: String, default: '' } },
  at:   { type: Date, default: Date.now },
}, { _id: false });

const accCashManMemoSchema = new mongoose.Schema({

  memoID:    { type: String, required: true, unique: true },
  companyID: { type: String, required: true },
  factoryID: { type: String, required: true },
  cashManID: { type: String, required: true },

  memoDate:  { type: String, default: '' },
  detail:    { type: String, default: '' },
  amount:    { type: Number, default: 0 },
  images:    [{ baseName: { type: String }, url: { type: String } }],

  status:    { type: String, default: 'pending' },
  voided:    { type: Boolean, default: false },
  voidedAt:  { type: Date },

  comments:  [commentSchema],

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date },
  createBy:  { userID: { type: String } },

});

accCashManMemoSchema.index({ companyID: 1, factoryID: 1, cashManID: 1 });

module.exports = mongoose.model("AccCashManMemo", accCashManMemoSchema);
