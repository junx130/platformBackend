const { pool } = require("../MySQL/db");
const { _unixNow } = require("../utilities/timeFn");

const db = "Notification";

async function getLastUpdate() {
    const query = "SELECT bdDevID, triggerType, lastUpdate, lastNotifiedTime, StartUnix, EndUnix, Active from Device_Active_Checklist WHERE active = TRUE AND sensorOnline = TRUE;"

    let connection;
    let result;
    try {
      connection = await pool.getConnection();
      result = await connection.query(`use ${db}`);
      result = await connection.query(query);
    } catch (ex) {
      console.log("Maria DB Error", ex.message);
    } finally {
      if (connection) connection.end();
      console.log("DB log complete");
    }
    
    return result;
}

async function checkDevActive() {
    console.log("TEST");
    let devList = await getLastUpdate();
    let currentUnix = _unixNow();
    let devInactive = [];
    
    for (let i = 0; i < devList.length; i++) {
      if (devList[i].Active === true && devList[i].sensorOnline === true
        && (currentUnix - devList[i].lastUpdate) > (30 * 60)
        && (currentUnix > devList[i].startTime) && (currentUnix < devList[i].endTime)) {
        if(devList[i].triggerType === 1 || (devList[i].triggerType === 2 && devList[i].lastNotifiedTime < devList[i].startTime))
          devInactive.push(devList[i].bdDevID);
        }
    }

    return devInactive;
}

exports.checkDevActive = checkDevActive;