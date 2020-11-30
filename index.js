const express = require("express");
const app = express();
require("dotenv").config();
const {prgMqtt} = require ("./MQTT/koalaMqtt");
const { prgTelegram } = require("./notification/telegram");

require("./Routes/routes")(app);

// if(process.env.debugOnLaptop!="true") prgMqtt();
prgMqtt();
prgTelegram();

const port = process.env.PORT || 3900;
const server = app.listen(port, () =>
  console.log(`Listening on port ${port}...`)
);

module.exports = server;
