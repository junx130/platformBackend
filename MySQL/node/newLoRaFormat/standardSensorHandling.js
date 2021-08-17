const Joi = require("joi");
const { pool } = require("../../db");
const { listedInbuildingDevices } = require("../../queryData");
const {checkNotification} = require("../../../notification/checkNotification");
const { newNodeHandlingFn } = require("../nodeDataInHandling/newVersionNodeHandling");
const { genPxsC8TableString, genPxsInsertTableString, genSensorPara } = require("../../../utilities/loraFormatToDatabase");


async function infoHandlings(deviceInfo, cusFunction){    
    try {
        // console.log(deviceInfo);
        // if(cusFunction) await cusFunction();   // handling case like adjust status node threshold
        let sensorPara = await genSensorPara(deviceInfo.ht, deviceInfo)
          // console.log(sensorPara);
        await newNodeHandlingFn(deviceInfo, insertToDb, sensorPara);
    } catch (error) {
        console.log("standardSensorHandling Error");
        console.log(error.message);
    }
}


async function insertToDb(Info, db, nameID, sensorPara){
    if(process.env.debugOnLaptop=="true") return //console.log("Skip Database Storing");
    
    let sC8Table = genPxsC8TableString(sensorPara);
    let sRel = genPxsInsertTableString(sensorPara);

    const createTable = `CREATE TABLE IF NOT EXISTS Device_${Info.ht}_${nameID}(	        
        _id int NOT NULL AUTO_INCREMENT,
        timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        unix INT(11) NOT NULL,
        type SMALLINT NOT NULL,  
        devID INT NOT NULL,  
        gwID INT,  
        frequency decimal(19,4),
        ${sC8Table}
        RSSI INT NOT NULL,  
        SNR INT NOT NULL,  
        PRIMARY KEY (_id)
    )`;

    const insertData = `INSERT INTO Device_${Info.ht}_${nameID}(unix, type, devID, gwID, frequency ${sRel.rtnName}, RSSI, SNR) 
    VALUES (UNIX_TIMESTAMP(), ${Info.ht}, ${Info.hi}, ${Info.GwID}, ${Info.Freq} ${sRel.rtnValue}, ${Info.RSSI}, ${Info.SNR})`;
    
    // console.log(createTable);
    // console.log(insertData);

    let connection;
    let result;
    try {
      connection = await pool.getConnection();
      result = await connection.query(`CREATE DATABASE IF NOT EXISTS ${db}`);
      result = await connection.query(`use ${db}`);
      result = await connection.query(createTable);
      result = await connection.query(insertData);
      // console.log("Insert Data", result);
    } catch (ex) {
      console.log("Maria DB Error", ex.message);
    } finally {
      if (connection) connection.end();
      console.log("Status node DB log complete");
    }   
}





exports.standardSensorHandling = infoHandlings;