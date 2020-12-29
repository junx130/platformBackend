const mqtt = require("mqtt");
const { mqttNodeHandling } = require("./mqttNodeHandling");


function prgMqtt() {
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

    try {
        
        prgMqtt.client = mqtt.connect(process.env.mqttHost, options);
    
        prgMqtt.client.on("connect", () => {
        prgMqtt.client.subscribe("Mahsing/Gateway/#");
        prgMqtt.client.subscribe("Gateway/Connection");        
        prgMqtt.client.subscribe("Aploud/Gateway/#");       // Aploud gateway standardize
        console.log("connected MQTT");
        });
    
        prgMqtt.client.on("message", async (topic, message) => {
        // console.log("message is " + message);
        // console.log("topic is " + topic);
    
        // topicHandling(topic, message);
        //   await mqttGetProfiles(topic, message);
        await mqttNodeHandling(topic, message);


        prgMqtt.client.publish("AploudBackend/Reply", "Received");
        // client.end();
        });
    } catch (error) {
        console.log("KoalaMqttErr: ", error.message);
    }

  }

  exports.prgMqtt = prgMqtt;