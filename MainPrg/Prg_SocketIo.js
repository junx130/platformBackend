const socketIo = require("socket.io");

let io;
function socketIoPrg(server){
    io = socketIo(server, {
        cors: {
            origin: '*',
        }
    });    
    
    io.on("connection", (socket) => {
      console.log("New client connected");      
    //   interval = setInterval(() => getApiAndEmit(socket), 1000);
      socket.on("disconnect", () => {
        console.log("Client disconnected");
      });
    });
}

function ioEmit(topic, data){
    // const response = new Date();
    // console.log("Emit");
    // io.volatile.emit("FromAPI", response);      // no affect on server, if client include volatile, lost data will NOT resend. 
    // io.emit("FromAPI", response);            // no affect on server, if client NOT include volatile, lost data will resend. 
    io.volatile.emit(topic, data);  
}


exports.socketIoPrg = socketIoPrg;
exports.ioEmit = ioEmit;