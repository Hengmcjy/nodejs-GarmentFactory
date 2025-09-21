const app = require("./app");
// const socketio = require("./socketio");
const debug = require("debug")("node-angular");
const http = require("http");

const normalizePort = val => {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
};

const onError = error => {
  if (error.syscall !== "listen") {
    throw error;
  }
  const bind = typeof port === "string" ? "pipe " + port : "port " + port;
  switch (error.code) {
    case "EACCES":
      console.error(bind + " requires elevated privileges");
      process.exit(1);
      break;
    case "EADDRINUSE":
      console.error(bind + " is already in use");
      process.exit(1);
      break;
    default:
      throw error;
  }
};

const onListening = () => {
  const addr = server.address();
  const bind = typeof port === "string" ? "pipe " + port : "port " + port;
  debug("Listening on " + bind);
};

const port = normalizePort(process.env.PORT || "3000");
app.set("port", port);


const server = http.createServer(app);
server.on("error", onError);
server.on("listening", onListening);
server.listen(port);

//############################################
// ## socketIO ###############################

// ## declare route socketIO
const messageIOU = require("./socketio/user/socketioUser");
const messageIOA = require("./socketio/admin/socketioAdmin");

const io = require('./socket').init(server);
io.on('connection', socket => {
  // console.log('Client io connected');
  // console.log(io.engine.clientsCount); // ## user connected count
  // console.log(io.of("/").sockets.size); // ## user connected count

  // ## all socketIO ##################################################################################################
  // ## procedure sent message back to all geust user user-admin 
  socket.on('iomessageall', (msgio) => { messageIOU.onMessageAll(msgio, socket)} );

  // ## user socketIO ##################################################################################################
  // ## procedure sent message back client user
  socket.on(process.env.IOID+'/iomessage/user/test1', (msgIO) => { messageIOU.onMessageUser(msgIO, socket)} );
  // socket.on('iomessage/user/test1', (msgIO) => { messageIOU.onMessageUser(msgIO, socket)} );


  // socket.on('messageuser/test/heng', (msgio) => { messageIOU.onMessageUserTestHeng(msgio, socket)} );
  // socket.on('iomessage/user/test2', (msgIO) => { messageIOU.onMessageUser(msgIO, socket)} );

  // ## admin socketIO ##################################################################################################
  // ## procedure sent message back client admin-user
  socket.on('iomessageadmin', (msgio) => { messageIOA.onMessageAdm(msgio, socket)} );
});

// // ## socketIO ###############################
// //############################################