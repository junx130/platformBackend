const { insertTemplate, queryTemplate } = require("../queryData");

const db = "Notification";
const tableName = "DeviceActiveChecklist"


async function insertActiveDevChecklist(body){
  const createTable = `CREATE TABLE IF NOT EXISTS ${tableName}(	
      _id int NOT NULL AUTO_INCREMENT,
      timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      unix INT(11) NOT NULL,
      buildingID INT NOT NULL,
      bdDevID INT NOT NULL,
      triggerType int,
      active TINYINT DEFAULT 1,
      lastUpdate INT(11),
      lastNotifiedTime INT(11),
      sensorOnline TINYINT Default 1,
      startTime INT(11),
      endTime INT(11),
      userAmmend varchar(80),
      PRIMARY KEY (_id)
  )`;

  const queryCmd = `INSERT INTO ${tableName}(unix, buildingID, bdDevID, triggerType,   startTime, endTime, userAmmend)
      VALUES (UNIX_TIMESTAMP(), 
      ${body.buildingID}, 
      ${body.bdDevID}, 
      ${body.triggerType}, 
      ${body.startTime}, 
      ${body.endTime}, 
      "${body.userAmmend}")`;


  try {
    let result = await insertTemplate(db, createTable, queryCmd, "Register DeviceActiveChecklist succesful");
    return result;          
  } catch (ex) {
      console.log(ex.message)
      return null;
  }
}


async function updateActiveDevChecklist(data){
  const quertCmd = `UPDATE ${tableName} SET 
  lastUpdate = UNIX_TIMESTAMP(),  
  sensorOnline = 1
  where buildingID = ${data.buildingID}
  and bdDevID = ${data.bdDevID}
  `;
  
  try {
      let result = await queryTemplate(db, quertCmd, "ActiveDevChecklist Update Finally");
      // console.log("Update: ", result.affectedRows);        
      return result;        
  } catch (ex) {
      console.log(ex.message)
      return null;
  }
}

exports.insertActiveDevChecklist = insertActiveDevChecklist;
exports.updateActiveDevChecklist = updateActiveDevChecklist;


/*
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
    if(process.env.debugOnLaptop=="true") return //console.log("Skip Database Storing");
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

exports.devActiveList = devActiveList;*/