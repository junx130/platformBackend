const Joi = require("joi");
const { pool } = require("../db");
const { listedInbuildingDevices } = require("../queryData");
const {checkNotification} = require("../../notification/checkNotification");
const devType = 1001;

const database = "RawDataLog";
const buildingDb = "Buildings";


async function usfDbHandling(message) {

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
                    }   
                }
            }else{
                console.log(validateErr);
            }
        }        
    } catch (error) {
        console.log("Node DB handling Err:", error.message);
    }
}

async function insertToDb(Info, db, nameID){    
    if(process.env.debugOnLaptop=="true") return console.log("Skip Database Storing");
    const createTable = `CREATE TABLE IF NOT EXISTS Device_${Info.Ty}_${nameID}(	        
        _id int NOT NULL AUTO_INCREMENT,
        timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        unix INT(11) NOT NULL,
        type SMALLINT NOT NULL,  
        devID INT NOT NULL,  
        gwID INT,  
        frequency decimal(19,4),  
        FlowPSec FLOAT NOT NULL,  
        FlowPMin FLOAT NOT NULL,  
        FlowPHour FLOAT NOT NULL,  
        Velocity FLOAT NOT NULL,  
        RTD1 FLOAT NOT NULL,  
        RTD2 FLOAT NOT NULL,  
        VeloUnit FLOAT NOT NULL,  
        FlowrateUnit FLOAT NOT NULL,  
        battVoltage decimal(20,3) NOT NULL,  
        lc decimal(20,3) NOT NULL,  
        RSSI INT NOT NULL,  
        SNR INT NOT NULL,  
        PRIMARY KEY (_id)
    )`;

    let data={};
    data.Ty = Info.Ty;
    data.ID = Info.ID;
    data.V = Info.V;
    data.INT64 = Info.INT64;
    data.BV = Info.BV;
    data.LC = Info.LC;
    data.RSSI = Info.RSSI;
    data.SNR = Info.SNR;
    data.GwID = Info.GwID;
    data.Freq = Info.Freq;

    for (const key in data) {
        if (!data[key]) {   // key not define
            data[key]=null;
        }
    }

    const insertData = `INSERT INTO Device_${Info.Ty}_${nameID}(unix, type, devID, gwID, frequency, FlowPSec, FlowPMin, FlowPHour, Velocity, RTD1, RTD2, VeloUnit, FlowrateUnit, battVoltage, lc, RSSI, SNR) 
    VALUES (UNIX_TIMESTAMP(), ${data.Ty}, ${data.ID}, ${data.GwID}, ${data.Freq}, ${data.V[0]}, ${data.V[1]}, ${data.V[2]}, ${data.V[3]}, ${data.V[4]}, ${data.V[5]}, ${data.V[6]}, ${data.V[7]}, ${data.BV}, ${data.LC}, ${data.RSSI}, ${data.SNR})`;
    
    let connection;
    let result;
    try {
      connection = await pool.getConnection();
      result = await connection.query(`CREATE DATABASE IF NOT EXISTS ${db}`);
      result = await connection.query(`use ${db}`);
      result = await connection.query(createTable);
      result = await connection.query(insertData);
      console.log("Insert Data", result);
    } catch (ex) {
      console.log("Maria DB Error", ex.message);
    } finally {
      if (connection) connection.end();
      console.log("DB log complete");
    }    
}

function validateMessage(deviceInfo){    
    const schema = {        
        Ty: Joi.number().required().min(0),
        ID: Joi.number().required().min(0),
        V: Joi.array(),
        INT64: Joi.number().required(),
        BV: Joi.number().required(),
        BP: Joi.number().min(0).max(100),
        LC: Joi.number().required(),
        RSSI: Joi.number().required(),
        SNR: Joi.number().required(),
        GwID: Joi.number(),
        Freq: Joi.number(),
    }
    return Joi.validate(deviceInfo, schema);
}

exports.usfDbHandling = usfDbHandling;