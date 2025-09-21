const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const sessionSchema = new Schema({
  user: {
    userID: {type: String, required: true},
    // comID: {type: String, required: true},
    // userClassID: {type: String, required: true},
    // publicIP: {type: String, required: true},
    // localIp: {type: String, required: true},
  } ,
  createdAt: { type: Date, required: true },
});


module.exports = mongoose.model('Session', sessionSchema);