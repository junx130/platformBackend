const express = require("express");
const app = express();
const http = require("http");
const socketIo = require("socket.io");

require("dotenv").config();
const {prgMqtt} = require ("./MQTT/koalaMqtt");
const { prgTelegram } = require("./notification/telegram");
const { devCheckTimer } = require("./devActiveCheck/devCheckTimer");
const {sendEmail} = require('./EmailServer/email');
const { socketIoPrg, ioEmit } = require("./MainPrg/Prg_SocketIo");
const { v2_prgTelegram } = require("./notification/v2_telegram");


require("./Routes/routes")(app);

const server = http.createServer(app);
socketIoPrg(server);


// interval = setInterval(() => {
//   console.log("Hello");
//   const response = new Date();
//   console.log("Emit");
//   ioEmit("FromAPI", response);
//   // const response = new Date();
//   // io.emit("FromAPI", response);
// }, 1000);

/** -------------Testing field-------------- *
  // const { getSensorParaBy_sensorType } = require("./MySQL/SensorManagement/sensorManagement");
    const { genSensorPara } = require("./utilities/loraFormatToDatabase");

    async function testPrg(){
      
      let _loraData = {
        pf:[1.123,2.223],
        pb:[1],
        pi:[1024],
        pn:[987654321]
      }

        let rel = await genSensorPara(8,_loraData);
        console.log(rel);
      }
    
    
    testPrg();
/**========================================= */



// if(process.env.debugOnLaptop!="true") prgMqtt();
prgMqtt();
prgTelegram();   
v2_prgTelegram();
// sendEmail();

// interval 0.5 11:59:59.9987  12:00:01.0002
setInterval(async() => await devCheckTimer(), 1000);

const port = process.env.PORT || 3900;
// const server = app.listen(port, () =>
//   console.log(`Listening on port ${port}...`)
// );
server.listen(port, () => console.log(`Listening on port ${port}`));

module.exports = server;
