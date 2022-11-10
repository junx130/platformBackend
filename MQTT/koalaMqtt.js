const mqtt = require("mqtt");
const { verifyCRC, genLoRaPackage } = require("../utilities/loraFormat");
const { mqttNodeHandling } = require("./mqttNodeHandling");
const { handleNodeReq } = require("./NodeRequestCmd/handleNodeReqFn");

let currentNo=0;

const options = {
  port: 1883,
  host: process.env.mqttHost,
  clientId: "mqttjs_" + Math.random().toString(16).substr(2, 8),
  username: process.env.mqttUsername,
  password: process.env.mqttPassword,
  keepalive: 60,
  reconnectPeriod: 1000,
  protocolId: "MQIsdp",
  protocolVersion: 3,
  clean: true,
  encoding: "utf8",
};

let expClient = mqtt.connect(process.env.mqttHost, options);

function prgMqtt() {

    try {
        // prgMqtt.client = mqtt.connect(process.env.mqttHost, options);
        prgMqtt.client=expClient;

        prgMqtt.client.on("connect", () => {
          prgMqtt.client.subscribe("Mahsing/Gateway/#");
          prgMqtt.client.subscribe("Gateway/Connection");        
          prgMqtt.client.subscribe("Aploud/Gateway/#");       // Aploud gateway standardize
          prgMqtt.client.subscribe("Aplouds/NodeToServer"); 
          prgMqtt.client.subscribe("Aplouds/NodeToServer/#"); 
          console.log("connected MQTT");
        });
    
        prgMqtt.client.on("message", async (topic, message) => {
          try {
            let nodeReqRel = await handleNodeReq(topic, message);
            // console.log("nodeReqRel:", nodeReqRel);
            if(nodeReqRel) {
              if(nodeReqRel.toPublish) publishMqtt(nodeReqRel.topic, nodeReqRel.loraPackage);
            }else{
              await mqttNodeHandling(topic, message);
              prgMqtt.client.publish("AploudBackend/Reply", "Received");
            }

          } catch (error) {
            console.log("kaola mqtt error : ", error);
          }
        });
    } catch (error) {
        console.log("KoalaMqttErr: ", error.message);
    }

  }

// function clientOn(fFunction){
//   prgMqtt.client.on("message", async (topic, message) => {
//     await fFunction(topic, message);
//   });
// }

function publishMqtt(topic, obj){
  // console.log("Pub MQTT");
  prgMqtt.client.publish(topic, JSON.stringify(obj));
  // prgMqtt.client.publish('Aploud/CtrlSetting/20001', JSON.stringify(obj));
}

function subscribeTopic(topic){
  prgMqtt.client.subscribe(topic);
}

function unsubscribeTopic(topic){
  prgMqtt.client.unsubscribe(topic);
}



// exports.clientOn=clientOn;
exports.unsubscribeTopic=unsubscribeTopic;
exports.expClient=expClient;
exports.subscribeTopic=subscribeTopic;
exports.publishMqtt=publishMqtt;
exports.prgMqtt = prgMqtt;