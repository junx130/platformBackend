const Joi = require("joi");
const { pool } = require("../../db");
const { listedInbuildingDevices } = require("../../queryData");
const { checkNotification } = require("../../../notification/checkNotification");
const { devActiveList } = require("../../notification/devActive");
const { newNodeHandlingFn } = require("../nodeDataInHandling/newVersionNodeHandling");
const { getLatestThreshold_byDevId } = require("../../statusNodeThreshold/statusNodeThreshold");


const database = "RawDataLog";
const buildingDb = "Buildings";

async function infoHandlings(deviceInfo) {
    // console.log(deviceInfo);
    try {
        /** Modify status value here if threshold set on server */
        let thresholdSet = await getLatestThreshold_byDevId(deviceInfo.hi);
        // console.log(thresholdSet);
        if(thresholdSet && thresholdSet[0]){
            let thres = thresholdSet[0];
            let bBeyond = deviceInfo.pi[0] > thres.threshold;
            deviceInfo.pb[0] = thres.invert===1? !bBeyond : bBeyond;
            // console.log(`pb[0]: ${deviceInfo.pb[0]}`);
        }
        await newNodeHandlingFn(deviceInfo, insertToDb);
    } catch (error) {
        console.log("Status Node Handling Error");
        console.log(error.message);
    }
    /*
    try {
        // console.log(deviceInfo);
        await insertToDb(deviceInfo, database, deviceInfo.hi);
        let CheckListResult = await listedInbuildingDevices(deviceInfo.ht, deviceInfo.hi);
        if (CheckListResult) {
            for (const c of CheckListResult) {
                await insertToDb(deviceInfo, buildingDb, c._id);  
                // check notification list here
                await checkNotification(c);
                // await devActiveList(c);
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
        SwitchOn INT,  
        VoltageLevel INT,  
        battVoltage decimal(20,3) NOT NULL,  
        RSSI INT NOT NULL,  
        SNR INT NOT NULL,  
        PRIMARY KEY (_id)
    )`;

    let data={};
    data.Ty = Info.ht;
    data.ID = Info.hi;
    data.SwitchOn = Info.pb[0];
    data.VoltageLevel = Info.pi[0];
    data.BV = Info.pf[0];
    data.RSSI = Info.RSSI;
    data.SNR = Info.SNR;
    data.GwID = Info.GwID;
    data.Freq = Info.Freq;
    // console.log(Info.pb[0]);
    // console.log(data.SwitchOn);
    // for (const key in data) {
    //     if (!data[key]) {   // key not define
    //         data[key]=null;
    //     }
    // }

    const insertData = `INSERT INTO Device_${Info.ht}_${nameID}(unix, type, devID, gwID, frequency, SwitchOn, VoltageLevel, battVoltage, RSSI, SNR) 
    VALUES (UNIX_TIMESTAMP(), ${data.Ty}, ${data.ID}, ${data.GwID}, ${data.Freq}, ${data.SwitchOn}, ${data.VoltageLevel}, ${data.BV}, ${data.RSSI}, ${data.SNR})`;
    // console.log(insertData);
    let connection;
    let result;
    try {
      connection = await pool.getConnection();
      result = await connection.query(`CREATE DATABASE IF NOT EXISTS ${db}`);
      result = await connection.query(`use ${db}`);
      result = await connection.query(createTable);
      result = await connection.query(insertData);
    //   console.log("Insert Data", result);
    } catch (ex) {
      console.log("Maria DB Error", ex.message);
    } finally {
      if (connection) connection.end();
      console.log("Status node DB log complete");
    }   
}

exports.ty6_switchStatusHandling = infoHandlings;