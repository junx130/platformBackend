const express = require("express");
const app = express();
require("dotenv").config();

const {prgMqtt} = require ("./MQTT/koalaMqtt")

prgMqtt();

// let data={Ty, ID,GwID,Freq,T,H,BV,LC,RSSI, SNR};
// let data={Ty:10}; 

const port = process.env.PORT || 3900;
const server = app.listen(port, () =>
  console.log(`Listening on port ${port}...`)
);

module.exports = server;
