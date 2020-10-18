const Joi = require("joi");
const { pool } = require("./db");
const devType = 2;

const database = "RawDataLog";

async function probeTDbHandlings(message) {
    try {
        const deviceInfo = JSON.parse(message);
        if (deviceInfo.Ty ===devType) {            
            let validateErr = validateMessage(deviceInfo).error;
            if (!validateErr){
                await insertToDb(deviceInfo);
            }else{
                console.log(validateErr);
            }
        }        
    } catch (error) {
        console.log("Node DB handling Err:", error.message);
    }
}

async function insertToDb(Info){
    const createTable = `CREATE TABLE IF NOT EXISTS Device_${Info.Ty}_${Info.ID}(	        
        _id int NOT NULL AUTO_INCREMENT,
        timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        type SMALLINT NOT NULL,  
        devID INT NOT NULL,  
        gwID INT,  
        frequency decimal(19,4),  
        temperature decimal(20,3) NOT NULL,  
        battVoltage decimal(20,3) NOT NULL,  
        lc decimal(20,3) NOT NULL,  
        RSSI INT NOT NULL,  
        SNR INT NOT NULL,  
        PRIMARY KEY (_id)
    )`;

    let data={};
    data.Ty = Info.Ty;
    data.ID = Info.ID;
    data.T = Info.T;
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

    const insertData = `INSERT INTO Device_${Info.Ty}_${Info.ID}(type, devID, gwID, frequency, temperature, battVoltage, lc, RSSI, SNR) 
    VALUES (${data.Ty}, ${data.ID}, ${data.GwID}, ${data.Freq}, ${data.T}, ${data.BV}, ${data.LC}, ${data.RSSI}, ${data.SNR})`;
    
    let connection;
    let result;
    try {
      connection = await pool.getConnection();
      result = await connection.query(`CREATE DATABASE IF NOT EXISTS ${database}`);
      result = await connection.query(`use ${database}`);
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
        T: Joi.number().required(),
        BV: Joi.number().required(),
        BP: Joi.number().required().min(0).max(100),
        LC: Joi.number().required(),
        RSSI: Joi.number().required(),
        SNR: Joi.number().required(),
        GwID: Joi.number(),
        Freq: Joi.number(),
    }
    return Joi.validate(deviceInfo, schema);
}


exports.probeTDbHandlings = probeTDbHandlings;