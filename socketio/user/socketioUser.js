const io = require('../../socket');


const dataMsgIO = {
  msgTypeID: '',  // ## msgID = message type
  sendIO: {
    userIO: {
      uAll: false,
      userClass: [],  //
      userID: [],  //
    },
    companyIO: {
      comAll: false,
      companyID: []
    },
    factoryIO: {
      facAll: false,
      factoryID: []
    }
  },
  toForm: {  // ## form location alert
    frmAll: false,
    formName: [],
  },
  dataIO: {
    // ## data messagee any
    // ## data structure depend on function

  }
};

exports.onSendMessageUser = async (dataMsgIO, path) => {
  // const userId = await fetchUserId(socket);
  // console.log(dataMsgIO);
  // console.log(path);
  dataMsgIO.server = 'Server Reply';
  // msgIO.socketID = socket.id;
  io.getIO().emit(process.env.IOID + path, dataMsgIO);
  // io.getIO().emit('message', `${socket.id.substr(0, 2)} said ${message}`);  

  // private sent message
  // io.getIO().to(socket.id).emit(process.env.IOID+'/iomessage/user', 'server reply only socket.id from user-sender');
};

exports.onMessageAll = async (msgio, socket) => {
  // const userId = await fetchUserId(socket);
  // console.log(message);
  console.log(socket.id , typeof socket.id);
  msgio.server = 'Server Reply';
  io.getIO().emit('messageall', msgio);
  // io.getIO().emit('message', `${socket.id.substr(0, 2)} said ${message}`);  

};

exports.onMessageUser = async (msgIO, socket) => {
  // const userId = await fetchUserId(socket);
  // console.log(msgIO);
  // console.log(socket.id , typeof socket.id);
  msgIO.server = 'Server Reply';
  msgIO.socketID = socket.id;
  io.getIO().emit(process.env.IOID+'/iomessage/user', msgIO);
  // io.getIO().emit('message', `${socket.id.substr(0, 2)} said ${message}`);  

  // private sent message
  io.getIO().to(socket.id).emit(process.env.IOID+'/iomessage/user', 'server reply only socket.id from user-sender');
};

// exports.onMessageUserTestHeng = async (msgio, socket) => {
//   const token = req.headers.authorization.split(" ")[1];

//   console.log(socket.id , typeof socket.id);
//   msgio.server = 'Server Reply';
//   io.getIO().emit('messageuser', msgio);
//   // io.getIO().emit('message', `${socket.id.substr(0, 2)} said ${message}`);  

//   // private sent message
//   io.getIO().to(socket.id).emit('messageuser', 'server reply only socket.id from user-sender');
// };
