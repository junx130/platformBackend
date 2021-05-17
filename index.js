const express = require("express");
const app = express();
require("dotenv").config();
const {prgMqtt} = require ("./MQTT/koalaMqtt");
const { prgTelegram } = require("./notification/telegram");
const { devCheckTimer } = require("./devActiveCheck/devCheckTimer");

require("./Routes/routes")(app);

// if(process.env.debugOnLaptop!="true") prgMqtt();
prgMqtt();
prgTelegram();

// interval 0.5 11:59:59.9987  12:00:01.0002
setInterval(() => devCheckTimer(), 1000);

const port = process.env.PORT || 3900;
const server = app.listen(port, () =>
  console.log(`Listening on port ${port}...`)
);

module.exports = server;
