const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const session3mnSchema = new Schema({
  user: {
    userID: {type: String, required: true},
    companyID: {type: String, required: true},
    userClassID: {type: String, required: true}
  } ,
  createdAt: { type: Date, required: true },
});


module.exports = mongoose.model('Session3mn', session3mnSchema);