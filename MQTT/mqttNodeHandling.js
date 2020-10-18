const { usfDbHandling } = require("../MySQL/ty1001_usf");
const { rtrhDbHandling } = require("../MySQL/ty1_rtrh");
const { dpmDbHandling } = require("../MySQL/ty3_dpm");


 async function mqttNodeHandling(topic, message) {
    const arr_topic = topic.split("/");
    
    if(arr_topic[1]==="Gateway"&&
        !arr_topic[3]
    ){            
        // console.log(arr_topic);     // testing purpose
        await rtrhDbHandling(message);
        await dpmDbHandling(message);
        await usfDbHandling(message);
    }

}

exports.mqttNodeHandling = mqttNodeHandling;