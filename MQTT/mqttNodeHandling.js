const { usfDbHandling } = require("../MySQL/ty1001_usf");
const { airFlowDbHandling } = require("../MySQL/ty1002_airFlow");
const { rtrhDbHandling } = require("../MySQL/ty1_rtrh");
const { probeTDbHandlings } = require("../MySQL/ty2_probeT");
const { dpmDbHandling } = require("../MySQL/ty3_dpm");
const { pressureDbHandlings } = require("../MySQL/ty4_pressure");


 async function mqttNodeHandling(topic, message) {
    const arr_topic = topic.split("/");
    
    if(arr_topic[1]==="Gateway"&&
        !arr_topic[3]
    ){            
        // console.log(arr_topic);     // testing purpose
        await rtrhDbHandling(message);
        await probeTDbHandlings(message);
        await dpmDbHandling(message);
        await usfDbHandling(message);
        await pressureDbHandlings(message);

        // await airFlowDbHandling(message);        // comment out this line before air flow type is confirm
    }

}

exports.mqttNodeHandling = mqttNodeHandling;