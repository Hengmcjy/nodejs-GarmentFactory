const mongoose = require("mongoose");

// ## เก็บ comment ของแต่ละ perm key ระดับ company
// ## 1 doc ต่อ 1 companyID
// ## comments: { "acc__menu-panel__daily-acc": "คืออะไร...", ... }
const permCommentSchema = mongoose.Schema({
    companyID: { type: String, required: true, unique: true },
    comments:  { type: Map, of: String, default: {} },
});

module.exports = mongoose.model("PermComment", permCommentSchema);
