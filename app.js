const path = require("path");
const express = require('express');
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
// const Ddos = require('ddos')
const cors = require('cors');
const moment = require('moment-timezone');
// const nodemailer = require('nodemailer');
const errorController = require('./controllers/c-api-error');

require('dotenv').config({ path: './config.env' });
// require('dotenv').config({});
// const ddos = new Ddos({burst:10, limit:15});

// ## declare routes
const userUserRoutes = require("./routes/user/r-user");
const mailUserRoutes = require("./routes/user/r-mail");
const productUserRoutes = require("./routes/user/r-product");
const orderUserRoutes = require("./routes/user/r-order");
const cusRoutes = require("./routes/user/r-customer");
const nsRoutes = require("./routes/user/r-node-station");
const repRoutes = require("./routes/user/r-report");

mongoose.set('strictQuery', false);

moment.tz.setDefault('Asia/Bangkok');
const app = express();
// app.use(ddos.express)
app.use(cors());


// console.log(process.env.MGUSER , process.env.MGPWD);



app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
// app.use("/images", express.static(path.join("backend/images"))); //## allow access images in here
app.use(express.static(path.join(__dirname, 'public'))); // set folder to use  -->  rootDir/public

// ## set header
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    // "Origin, X-Requested-With, Content-Type, Accept"
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PATCH, PUT, DELETE, OPTIONS"
  );
  next();
});

// ## check req.body have database location for change or not
// ## logging --> go to localhost mongoDB server
// ## not logging --> go to real mongoDB server
app.use((req, res, next) => {
  // console.log(req.body);
  if (req.body.loggingMode) {
    console.log('req.body.loggingMode : ' , req.body.loggingMode);
    // ## change mongoDB connect string go to logging server
    
  }
  next();
});

//## mongodb MGDB

mongoose
  .connect(
    `mongodb+srv://`
    + `${process.env.MGUSER}:${process.env.MGPWD}`
    + `${process.env.MGSVR1}/${process.env.MGDB}`
    + `?retryWrites=true`
  )
  .then(() => {
    console.log("Connected to database!");
  })
  .catch(() => {
    console.log("Connection failed!");
  });

//## route user   
app.use("/api/user", userUserRoutes);
app.use("/api/mail", mailUserRoutes);
app.use("/api/product", productUserRoutes);
app.use("/api/order", orderUserRoutes);
app.use("/api/cus", cusRoutes);
app.use("/api/ns", nsRoutes);
app.use("/api/rep", repRoutes);

app.get('/500', errorController.get500);

app.use(errorController.get404);

app.use((error, req, res, next) => {
  // console.log(error);
  res.status(500).json({
    errMessage: "Error Occurred! 500....."
  });
});


//##

module.exports = app;
