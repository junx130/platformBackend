const Joi = require("joi");
const { pool } = require("../../db");
const { listedInbuildingDevices } = require("../../queryData");
const {checkNotification} = require("../../../notification/checkNotification");
const { newNodeHandlingFn } = require("../nodeDataInHandling/newVersionNodeHandling");

const database = "RawDataLog";
const buildingDb = "Buildings";

async function infoHandlings(deviceInfo) {
    try {
        await newNodeHandlingFn(deviceInfo, insertToDb);
    } catch (error) {
        console.log("VFD Node Handling Error");
        console.log(error.message);
    }
    /*try {
        console.log(deviceInfo);
        await insertToDb(deviceInfo, database, deviceInfo.hi);
        let CheckListResult = await listedInbuildingDevices(deviceInfo.ht, deviceInfo.hi);
        if (CheckListResult) {
            for (const c of CheckListResult) {
                await insertToDb(deviceInfo, buildingDb, c._id);  
                // check notification list here
                await checkNotification(c);
            }   
        }
    } catch (error) {
        console.log("Node DB handling Err:", error.message);
    }*/
}

async function insertToDb(Info, db, nameID){        
    if(process.env.debugOnLaptop=="true") return //console.log("Skip Database Storing");
    const createTable = `CREATE TABLE IF NOT EXISTS Device_${Info.ht}_${nameID}(	        
        _id int NOT NULL AUTO_INCREMENT,
        timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        unix INT(11) NOT NULL,
        type SMALLINT NOT NULL,  
        devID INT NOT NULL,  
        gwID INT,  
        frequency decimal(19,4),  
        actHz FLOAT,  
        kW FLOAT,  
        Hz_lowerLimit FLOAT,  
        pidKp FLOAT,  
        pidKi FLOAT,  
        pidKd FLOAT,  
        pidOutMin FLOAT,  
        pidOutMax FLOAT,  
        hzOutput FLOAT,
        pidSetpoint FLOAT,  
        feedbackVal FLOAT,  
        ManualOutput FLOAT,
        modbusId int,
        nodeOpMode int,
        battVoltage decimal(20,3) NOT NULL,  
        RSSI INT NOT NULL,  
        SNR INT NOT NULL,  
        PRIMARY KEY (_id)
    )`;

    let data={};
    data.Ty = Info.ht;
    data.ID = Info.hi;
    
    data.actHz = Info.pf[0];
    data.kW = Info.pf[1];
    data.Hz_lowerLimit = Info.pf[2];
    data.pidKp = Info.pf[3];
    data.pidKi = Info.pf[4];
    data.pidKd = Info.pf[5];
    data.pidOutMin = Info.pf[6];
    data.pidOutMax = Info.pf[7];
    data.hzOutput = Info.pf[8];
    data.pidSetpoint = Info.pf[9];    
    data.BV = Info.pf[10];
    data.feedbackVal = Info.pf[11];
    data.ManualOutput = Info.pf[12];    
    
    data.modbusId = Info.pi[0];
    data.nodeOpMode = Info.pi[1];

    data.RSSI = Info.RSSI;
    data.SNR = Info.SNR;
    data.GwID = Info.GwID;
    data.Freq = Info.Freq;

    // for (const key in data) {
    //     if (!data[key]) {   // key not define
    //         data[key]=null;
    //     }
    // }
    // console.log(data);
    // return console.log('Testing block');

    const insertData = `INSERT INTO Device_${Info.ht}_${nameID}(unix, 
        type, 
        devID, 
        gwID, 
        frequency, 
        actHz, 
        kW, 
        Hz_lowerLimit, 
        pidKp, 
        pidKi, 
        pidKd, 
        pidOutMin, 
        pidOutMax, 
        hzOutput,
        pidSetpoint,
        feedbackVal,
        ManualOutput,
        modbusId,
        nodeOpMode, 
        battVoltage, 
        RSSI, 
        SNR) 
    VALUES (UNIX_TIMESTAMP(), ${data.Ty}, 
    ${data.ID}, 
    ${data.GwID}, 
    ${data.Freq}, 
    ${data.actHz},
    ${data.kW}, 
    ${data.Hz_lowerLimit}, 
    ${data.pidKp},
    ${data.pidKi},
    ${data.pidKd},${data.pidOutMin},${data.pidOutMax}, ${data.hzOutput},
    ${data.pidSetpoint},
    ${data.feedbackVal},    
    ${data.ManualOutput},    
    ${data.modbusId},${data.nodeOpMode},${data.BV}, ${data.RSSI}, ${data.SNR})`;
    // console.log(insertData);
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
      console.log(`Device_${Info.ht}_${nameID} DB log complete`);
    }   
}

exports.ty7_VfdCtrlHandling = infoHandlings;