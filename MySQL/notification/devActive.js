const { insertTemplate, queryTemplate } = require("../queryData");

const db = "Notification";
const tableName = "DeviceActiveChecklist"


async function updateDevActList(item){
  const quertCmd = `UPDATE ${tableName} SET 
  active = ${item.active},
  startTime = ${item.startTime},
  endTime = ${item.endTime},
  bufferTime = ${item.bufferTime}
  where bdDevID = ${item.bdDevID}
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

async function getDevActByBd_id(bd_id){
  const quertCmd = `SELECT * from ${tableName} WHERE 
  buildingID = ${bd_id}
  `;
  
  try {
      let result = await queryTemplate(db, quertCmd, "Get getDevActCheck by bd_if Done");
      if(!result[0]) return [];     // no item found in list
      const rows = result.map(b=>b);
      return rows;        
  } catch (ex) {
      console.log(ex.message)
      return [];
  }
}

async function getDevActByBdDev_id(bdDevID){
  const quertCmd = `SELECT * from ${tableName} WHERE 
  bdDevID = ${bdDevID}
  `;
  
  try {
      let result = await queryTemplate(db, quertCmd, "Get getDevActCheck by bd_if Done");
      if(!result[0]) return [];     // no item found in list
      const rows = result.map(b=>b);
      return rows;        
  } catch (ex) {
      console.log(ex.message)
      return [];
  }
}

async function getDevActCheck_Rising(fmt_CurrentTime){
  const quertCmd = `SELECT * from ${tableName} WHERE 
  Active =1
  and triggerType = 1
  and (
    ((UNIX_TIMESTAMP() - lastUpdate) > bufferTime) 
    or lastUpdate is null);
  `;
  
  try {
      let result = await queryTemplate(db, quertCmd, "Get getDevActCheck_Rising Done");
      if(!result[0]) return [];     // no item found in list
      const rows = result.map(b=>b);
      return rows;        
  } catch (ex) {
      console.log(ex.message)
      return [];
  }
}

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
      sensorOnline TINYINT Default 0,
      startTime INT(11),
      endTime INT(11),
      bufferTime int default 1800, 
      userAmmend varchar(80),
      PRIMARY KEY (_id)
  )`;

  const queryCmd = `INSERT INTO ${tableName}(unix, buildingID, bdDevID, triggerType,   startTime, endTime, bufferTime, userAmmend)
      VALUES (UNIX_TIMESTAMP(), 
      ${body.buildingID}, 
      ${body.bdDevID}, 
      ${body.triggerType}, 
      ${body.startTime}, 
      ${body.endTime}, 
      ${body.bufferTime}, 
      "${body.userAmmend}")`;


  try {
    let result = await insertTemplate(db, createTable, queryCmd, "Register DeviceActiveChecklist succesful");
    return result;          
  } catch (ex) {
      console.log(ex.message)
      return null;
  }
}


async function setDeviceToNonActive(bdDevID){
  const quertCmd = `UPDATE ${tableName} SET 
  sensorOnline = 0,
  lastNotifiedTime = UNIX_TIMESTAMP()
  where bdDevID = ${bdDevID}
  `;
  // console.log(quertCmd);
  try {
      let result = await queryTemplate(db, quertCmd, "ActiveDevChecklist Update Finally");
      // console.log("Update: ", result.affectedRows);        
      return result;        
  } catch (ex) {
      console.log(ex.message)
      return null;
  }
}

async function updateActiveDevChecklist(bdDevID){
  const quertCmd = `UPDATE ${tableName} SET 
  lastUpdate = UNIX_TIMESTAMP(),  
  sensorOnline = 1
  where bdDevID = ${bdDevID}
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

exports.getDevActByBdDev_id = getDevActByBdDev_id;
exports.updateDevActList = updateDevActList;
exports.getDevActByBd_id =getDevActByBd_id;
exports.setDeviceToNonActive=setDeviceToNonActive;
exports.getDevActCheck_Rising=getDevActCheck_Rising;
exports.insertActiveDevChecklist = insertActiveDevChecklist;
exports.updateActiveDevChecklist = updateActiveDevChecklist;
