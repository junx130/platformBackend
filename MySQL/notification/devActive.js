const { pool } = require("../db");

const db = "Notification";

async function devActiveList(message) {
    try {
        await insertToDb(message);
    }
    catch(error) {
        console.log(error.message);
    }
}

async function insertToDb(message) {
    if(process.env.debugOnLaptop=="true") return console.log("Skip Database Storing");
    const createTable = `CREATE TABLE IF NOT EXISTS Device_Active_Checklist(	        
        _id int NOT NULL AUTO_INCREMENT,
        timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        buildingID INT NOT NULL,
        bdDevID INT NOT NULL,
        triggerType varchar(50),
        active BOOLEAN NOT NULL DEFAULT 1,
        lastUpdate INT(11),
        lastNotifiedTime INT(11),
        sensorOnline BOOLEAN,
        startTime INT(11),
        endTime INT(11),
        PRIMARY KEY (_id)
    )`;

    // data.lastUpdate = Info.pb[0];

    const updateData = `UPDATE Device_Active_Checklist
    SET timestamp = CURRENT_TIMESTAMP, lastUpdate = UNIX_TIMESTAMP(), sensorOnline = true
    WHERE bdDevID = ${message._id}`;
    
    let connection;
    let result;
    try {
      connection = await pool.getConnection();
      result = await connection.query(`CREATE DATABASE IF NOT EXISTS ${db}`);
      result = await connection.query(`use ${db}`);
      result = await connection.query(createTable);
      result = await connection.query(updateData);
      console.log("Insert Data", result);
    } catch (ex) {
      console.log("Maria DB Error", ex.message);
    } finally {
      if (connection) connection.end();
      console.log("DB log complete");
    }    
}

exports.devActiveList = devActiveList;