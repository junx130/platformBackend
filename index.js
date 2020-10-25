const express = require("express");
const app = express();
require("dotenv").config();
const {prgMqtt} = require ("./MQTT/koalaMqtt")

require("./Routes/routes")(app);

if(process.env.debugOnLaptop!="true") prgMqtt();

const port = process.env.PORT || 3900;
const server = app.listen(port, () =>
  console.log(`Listening on port ${port}...`)
);

module.exports = server;
