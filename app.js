const path = require("path");
const express = require('express');
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

// const os = require('os');
// console.log(os.cpus());

// const Ddos = require('ddos')
// 
const cors = require('cors');
const moment = require('moment-timezone');
// const nodemailer = require('nodemailer');
const errorController = require('./controllers/c-api-error');

require('dotenv').config({ path: './config.env' });
require('dotenv').config({ path: './config2.env' });
// require('dotenv').config({});
// const ddos = new Ddos({burst:10, limit:15});

// console.log(process.env.MGDB === 'nodeGarmentSystem', process.env.MGDB);
// console.log(process.env.PRODUCTION === 'false', process.env.PRODUCTION);

// ## declare routes
const scheduleUserRoutes = require("./routes/user/r-schedule");
const userUserRoutes = require("./routes/user/r-user");
const mailUserRoutes = require("./routes/user/r-mail");
const productUserRoutes = require("./routes/user/r-product");
const orderUserRoutes = require("./routes/user/r-order");
const yarnUserRoutes = require("./routes/user/r-yarn");
const cusRoutes = require("./routes/user/r-customer");
const nsRoutes = require("./routes/user/r-node-station");
const repRoutes = require("./routes/user/r-report");
const deliRoutes = require("./routes/user/r-deli");

mongoose.set('strictQuery', false);

moment.tz.setDefault('Asia/Bangkok');
const app = express();

const maxRequestBodySize = '50mb';
app.use(express.json({limit: maxRequestBodySize}));
// app.use(express.urlencoded({limit: maxRequestBodySize}));

// app.use(ddos.express)
app.use(cors());


// console.log(process.env.MGUSER , process.env.MGPWD);



app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));



// app.use(express.json({limit: '50mb'}));
// app.use(express.urlencoded({limit: '50mb'}));

// app.use("/images", express.static(path.join("backend/images"))); //## allow access images in here
app.use(express.static(path.join(__dirname, 'public'))); // set folder to use  -->  rootDir/public

// ## set header
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    // "Origin, X-Requested-With, Content-Type, Accept"   // Authorization
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PATCH, PUT, DELETE, OPTIONS"
  );
  next();
});

// "GET, POST, PATCH, PUT, DELETE, OPTIONS"
// GET, PUT, POST, DELETE, HEAD, OPTIONS, PATCH, PROPFIND, PROPPATCH, MKCOL, COPY, MOVE, LOCK

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

//## mongodb MGDB ....

mongoose
  .connect(
    `mongodb+srv://`
    + `${process.env.MGUSER}:${process.env.MGPWD}`
    + `${process.env.MGSVR1}/${process.env.MGDB}`
    + `?retryWrites=true&w=majority&appName=Cluster0`
  )
  .then((data) => {
    console.log("Connected to database!");
    console.log('mongoDB ver. = ??');
    console.log('mongoose ver. = '+data.version);
    console.log('nodeJs version =  '+process.version+'----------------------------------------------');
  })
  .catch(() => {
    console.log("Connection failed!");
  });

//## route user   


app.use("/api/schedule", scheduleUserRoutes);
app.use("/api/user", userUserRoutes);
app.use("/api/mail", mailUserRoutes);
app.use("/api/product", productUserRoutes);
app.use("/api/order", orderUserRoutes);
app.use("/api/yarn", yarnUserRoutes);
app.use("/api/cus", cusRoutes);
app.use("/api/ns", nsRoutes);
app.use("/api/rep", repRoutes);
app.use("/api/deli", deliRoutes);

// // ## test downloading logging
// app.get("/dl/log", async (req, res) => {
//   res.download("logging.txt");
  
// }); 

app.get('/500', errorController.get500);

app.use(errorController.get404);

app.use((error, req, res, next) => {
  // console.log('err 500-1');
  // console.log(error);
  res.status(500).json({
    errMessage: "Error Occurred! 500....."
  });
});


//##

module.exports = app;
