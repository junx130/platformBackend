const express = require("express");
const app = express();
const http = require("http");
const socketIo = require("socket.io");

require("dotenv").config();
const {prgMqtt} = require ("./MQTT/koalaMqtt");
// const { prgTelegram } = require("./notification/telegram");
const { devCheckTimer } = require("./devActiveCheck/devCheckTimer");
const {sendEmail} = require('./EmailServer/email');
const { socketIoPrg, ioEmit } = require("./MainPrg/Prg_SocketIo");
// const { v2_prgTelegram } = require("./notification/v2_telegram");
const { aws_prgMqtt } = require("./MQTT/AwsMqttBroker");


require("./Routes/routes")(app);

const server = http.createServer(app);
socketIoPrg(server);


prgMqtt();
aws_prgMqtt();
// prgTelegram();   
// v2_prgTelegram();
// sendEmail();

// setInterval(async() => await devCheckTimer(), 1000);

const port = process.env.PORT || 3900;
server.listen(port, () => console.log(`Listening on port ${port}`));

module.exports = server;
