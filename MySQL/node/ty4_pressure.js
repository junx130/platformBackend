const Joi = require("joi");
const { pool } = require("../db");
const { listedInbuildingDevices } = require("../queryData");
const { checkNotification } = require("../../notification/checkNotification");
const { devActiveList } = require("../notification/devActive");
const devType = 4;
const { nodeHandlingFn } = require("./nodeDataInHandling/nodeHandling");

const database = "RawDataLog";
const buildingDb = "Buildings";


async function pressureDbHandlings(message) {
    
    try {
        await nodeHandlingFn(message, devType, insertToDb, validateMessage);      
    } catch (error) {
        console.log("DPM Handling Error");
        console.log(error.message);
    }
    /*
    try {
        const deviceInfo = JSON.parse(message);
        if (deviceInfo.Ty ===devType) {            
            let validateErr = validateMessage(deviceInfo).error;
            if (!validateErr){
                await insertToDb(deviceInfo, database, deviceInfo.ID);
                let CheckListResult = await listedInbuildingDevices(deviceInfo.Ty, deviceInfo.ID);
                if (CheckListResult) {
                    for (const c of CheckListResult) {
                        await insertToDb(deviceInfo, buildingDb, c._id);     
                        // console.log("c :", c);
                        // check notification list here
                        await checkNotification(c, deviceInfo);
                        // await devActiveList(c);
                    }   
                }
            }else{
                console.log(validateErr);
            }
        }        
    } catch (error) {
        console.log("Node DB handling Err:", error.message);
    }*/
}

async function insertToDb(Info, db, nameID){
    if(process.env.debugOnLaptop=="true") return //console.log("Skip Database Storing");
    const createTable = `CREATE TABLE IF NOT EXISTS Device_${Info.Ty}_${nameID}(	        
        _id int NOT NULL AUTO_INCREMENT,
        timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        unix INT(11) NOT NULL,
        type SMALLINT NOT NULL,  
        devID INT NOT NULL,  
        gwID INT,  
        frequency decimal(19,4),  
        mA decimal(20,3) NOT NULL,  
        pressure decimal(20,3) NOT NULL,  
        battVoltage decimal(20,3) NOT NULL,  
        dcSupply decimal(20,3),  
        lc decimal(20,3) NOT NULL,  
        RSSI INT NOT NULL,  
        SNR INT NOT NULL,  
        PRIMARY KEY (_id)
    )`;

    let data={};
    data.Ty = Info.Ty;
    data.ID = Info.ID;
    data.V1 = Info.V1;
    data.V2 = Info.V2;
    data.BV = Info.BV;
    data.BP = Info.BP;
    data.LC = Info.LC;
    data.RSSI = Info.RSSI;
    data.SNR = Info.SNR;
    data.GwID = Info.GwID;
    data.Freq = Info.Freq;

    for (const key in data) {
        if (!data[key]) {   // key not define
            data[key]=0;
        }
    }

    const insertData = `INSERT INTO Device_${Info.Ty}_${nameID}(unix, type, devID, gwID, frequency, mA, pressure, battVoltage, dcSupply, lc, RSSI, SNR) 
    VALUES (UNIX_TIMESTAMP(), ${data.Ty}, ${data.ID}, ${data.GwID}, ${data.Freq}, ${data.V1}, ${data.V2}, ${data.BV}, ${data.BP}, ${data.LC}, ${data.RSSI}, ${data.SNR})`;
    
    let connection;
    let result;
    try {
      connection = await pool.getConnection();
      result = await connection.query(`CREATE DATABASE IF NOT EXISTS ${db}`);
      result = await connection.query(`use ${db}`);
      result = await connection.query(createTable);
      result = await connection.query(insertData);
      if(!process.env.skipDbLog) console.log("Insert Data", result);
    } catch (ex) {
      console.log("Maria DB Error", ex.message);
    } finally {
      if (connection) connection.end();
      if(!process.env.skipDbLog) console.log(`Device_${Info.Ty}_${nameID} DB log complete`);
    }    
}

function validateMessage(deviceInfo){    
    const schema = {        
        Ty: Joi.number().required().min(0),
        ID: Joi.number().required().min(0),
        V1: Joi.number().required(),
        V2: Joi.number().required(),
        BV: Joi.number().required(),
        BP: Joi.number().required(),
        LC: Joi.number().required(),
        RSSI: Joi.number().required(),
        SNR: Joi.number().required(),
        GwID: Joi.number(),
        Freq: Joi.number(),
    }
    return Joi.validate(deviceInfo, schema);
}

exports.pressureDbHandlings = pressureDbHandlings;