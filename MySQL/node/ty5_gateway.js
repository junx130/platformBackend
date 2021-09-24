const Joi = require("joi");
const { pool } = require("../db");
const { gatewayLogging } = require("../gateway/gateway");
// const { listedInbuildingDevices } = require("../queryData");
// const devType = 5;


const database = "RawDataLog";
const buildingDb = "Buildings";


function validateMessage(deviceInfo){    
    const schema = {        
        Vendor: Joi.string().max(80).allow(null, ''),
        Version: Joi.string().max(80).allow(null, ''),
        Product: Joi.string().max(80).allow(null, ''),
        ID: Joi.number().allow(null, ''),
        Freq: Joi.number().allow(null, ''),
        Desc: Joi.string().max(80).allow(null, ''),
        MQTT: Joi.string().max(80).allow(null, ''),
        GSM: Joi.number().allow(null, ''),
    }
    return Joi.validate(deviceInfo, schema);
}

async function gatewayHandling(message){
    try {
        // console.log(message);
        const deviceInfo = JSON.parse(message);
        // console.log(deviceInfo);
        
        if(!deviceInfo.ID) deviceInfo.ID=null;
        if(!deviceInfo.Freq) deviceInfo.Freq=null;
        if(!deviceInfo.GSM) deviceInfo.GSM=null;

        let validateErr = validateMessage(deviceInfo).error;
        if(validateErr) return console.log(validateErr);
        console.log(deviceInfo);
        let result = await gatewayLogging(deviceInfo);
        console.log(result);
    } catch (error) {
        console.log("Gateway DB handling Err:", error.message);
    }
}




exports.gatewayHandling=gatewayHandling;