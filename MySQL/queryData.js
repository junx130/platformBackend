
const { pool } = require("./db");
const database = "RawDataLog";
// const moment = require("moment");
// var { DateTime } = require('luxon');


async function getNMinData(devType, devID, minute){
    const sqlQuery = `SELECT * FROM (SELECT * FROM Device_${devType}_${devID} WHERE timestamp >= now() - INTERVAL ${minute} MINUTE)Var1 ORDER BY unix DESC ;`
    let connection;
    try {
      connection = await pool.getConnection();
      result = await connection.query(`use ${database}`);
      result = await connection.query(sqlQuery);
      // console.log("Create DB", result);
      return result;
    } catch (ex) {
      console.log("DB Error", ex.message);
    } finally {
      if (connection) connection.end();
      console.log("Get N Minute Data Finally");
    }
}

async function getLastNData(devType, devID, qty){
    const sqlQuery = `SELECT * FROM Device_${devType}_${devID} ORDER BY unix DESC LIMIT ${qty}`;
    let connection;
    try {
      connection = await pool.getConnection();
      result = await connection.query(`use ${database}`);
      result = await connection.query(sqlQuery);
      // console.log("Create DB", result);
      return result;
    } catch (ex) {
      console.log("DB Error", ex.message);
    } finally {
      if (connection) connection.end();
      console.log("Get Last N Data Finally");
    }
}

async function getDataT1ToT2(devType, devID, T1, T2){
  // process.env.TZ = "Asia/Kuala_Lumpur";  
  // let d = DateTime.local();
  // console.log(d.zoneName); //Asia/Saigon
  // process.env.TZ = 'Asia/Kuwait';
  // let tNow = new Date();
  // let offset = tNow.getTimezoneOffset();
  // console.log("tz offset:", tNow.getTimezoneOffset());  
  // console.log((offset>=0?"+":"-")+parseInt(offset/60)+":"+offset%60);
  // console.log("T1: ", sT1);
  // console.log("T2: ", sT2);
  const sqlQuery = `SELECT * FROM Device_${devType}_${devID} WHERE unix >= '${T1}' AND unix <= '${T2}'`;
  let connection;
  try {
    connection = await pool.getConnection();
    result = await connection.query(`use ${database}`);
    result = await connection.query(sqlQuery);
    // console.log("Create DB", result);
    return result;
  } catch (ex) {
    console.log("DB Error", ex.message);
  } finally {
    if (connection) connection.end();
    console.log("Get Last N Data Finally");
  }
}

exports.getDataT1ToT2 = getDataT1ToT2;
exports.getNMinData =getNMinData;
exports.getLastNData =getLastNData;