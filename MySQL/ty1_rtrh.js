const Joi = require("joi");
const { pool } = require("./db");
const devType = 1;

const database = "RawDataLog";


async function rtrhDbHandlings(message) {
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
        unix INT(11) NOT NULL,
        type SMALLINT NOT NULL,  
        devID INT NOT NULL,  
        gwID INT,  
        frequency decimal(19,4),  
        temperature decimal(20,3) NOT NULL,  
        humidity decimal(20,3) NOT NULL,  
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
    data.H = Info.H;
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

    const insertData = `INSERT INTO Device_${Info.Ty}_${Info.ID}(unix, type, devID, gwID, frequency, temperature, humidity, battVoltage, lc, RSSI, SNR) 
    VALUES (UNIX_TIMESTAMP(), ${data.Ty}, ${data.ID}, ${data.GwID}, ${data.Freq}, ${data.T}, ${data.H}, ${data.BV}, ${data.LC}, ${data.RSSI}, ${data.SNR})`;
    
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
        H: Joi.number().required().min(0).max(100),
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

exports.rtrhDbHandling = rtrhDbHandlings;