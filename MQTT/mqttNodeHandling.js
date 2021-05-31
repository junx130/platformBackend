const { decodeDevType } = require("../MySQL/node/newLoRaFormat/checkLoRaFormat");
const { usfDbHandling } = require("../MySQL/node/ty1001_usf");
const { airFlowDbHandling } = require("../MySQL/node/ty1002_airFlow");
const { rtrhDbHandling } = require("../MySQL/node/ty1_rtrh");
const { probeTDbHandlings } = require("../MySQL/node/ty2_probeT");
const { dpmDbHandling } = require("../MySQL/node/ty3_dpm");
const { pressureDbHandlings } = require("../MySQL/node/ty4_pressure");
const { gatewayHandling } = require("../MySQL/node/ty5_gateway");


async function mqttNodeHandling(topic, message) {
    
    const arr_topic = topic.split("/");
    
    if(arr_topic[1]==="Gateway"&&
        !arr_topic[3]
    ){            
        /**1st version of node handling method */
        await rtrhDbHandling(message);
        await probeTDbHandlings(message);
        await dpmDbHandling(message);
        await usfDbHandling(message);
        await pressureDbHandlings(message);
        await airFlowDbHandling(message);

        // await airFlowDbHandling(message);        // comment out this line before air flow type is confirm
    }

    // handling Gateway
    if(arr_topic[0]==="Gateway"&&
        arr_topic[1]==="Connection"
    ){        
        await gatewayHandling(message);
        
    }    

    if(arr_topic[0]==="Aplouds"&&
        arr_topic[1]==="NodeToServer"
    ){        
        // console.log("Get New LoRa Type");
        await decodeDevType(message);
        
    }    

}

exports.mqttNodeHandling = mqttNodeHandling;