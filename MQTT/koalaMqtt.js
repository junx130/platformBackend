const mqtt = require("mqtt");
const { mqttNodeHandling } = require("./mqttNodeHandling");

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
        console.log("connected MQTT");
        });
    
        prgMqtt.client.on("message", async (topic, message) => {
          // console.log("message is " + message);
          // console.log("topic is " + topic);    
          // topicHandling(topic, message);
          //   await mqttGetProfiles(topic, message);
          await mqttNodeHandling(topic, message);
          
          // currentNo+=1;
          // console.log("Plus 1");
          prgMqtt.client.publish("AploudBackend/Reply", "Received");
          // client.end();
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
  console.log("Pub MQTT");
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