const mqtt = require("mqtt");

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
  
  let mqttClient2nd = mqtt.connect(process.env.mqttHost, options);


  function publish_2ndMqtt(topic, obj){
    console.log("Pub MQTT");
    mqttClient2nd.publish(topic, JSON.stringify(obj));
    // prgMqtt.client.publish('Aploud/CtrlSetting/20001', JSON.stringify(obj));
  }

  function subscribe_2ndMqtt(topic){
    mqttClient2nd.subscribe(topic);
  }

  function unsubscribe_2ndMqtt(topic){
    mqttClient2nd.unsubscribe(topic);
  }

  exports.subscribe_2ndMqtt =subscribe_2ndMqtt;
  exports.unsubscribe_2ndMqtt =unsubscribe_2ndMqtt;
  exports.publish_2ndMqtt =publish_2ndMqtt;
  exports.mqttClient2nd=mqttClient2nd;