const io = require('../../socket');


exports.onMessageAdm = async (msgio, socket) => {
  // const userId = await fetchUserId(socket);
  // console.log(socket.data);
  console.log(socket.id , typeof socket.id);
  io.getIO().emit('Adm message', msgio);
  // io.getIO().emit('message', `${socket.id.substr(0, 2)} said ${message}`);

  // private sent message
  io.getIO().to(socket.id).emit('Adm message', '1234');
};
