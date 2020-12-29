
const { pool } = require("./db");
// const database = "RawDataLog";


async function queryTemplate(db, queryCmd, completeMessage){
  let connection;
  let result;
  try {
    connection = await pool.getConnection();
    result = await connection.query(`use ${db}`);
    result = await connection.query(queryCmd);    // what will happen here if no such database
    // console.log("Query Data: ", result);
    return result;
  } catch (ex) {
    console.log("DB Error", ex.message);
  } finally {
    if (connection) connection.end();
    console.log(completeMessage);
  }   
}

async function insertTemplate(db, createTable, insertData, completeMessage){
  let connection;
  let result;
  try {
    connection = await pool.getConnection();
    result = await connection.query(`CREATE DATABASE IF NOT EXISTS ${db}`);
    result = await connection.query(`use ${db}`);
    result = await connection.query(createTable);
    result = await connection.query(insertData);
    // console.log("Insert Data:", result);
    return result;
  } catch (ex) {
    console.log("Maria DB Error", ex.message);
    return null;
  } finally {
    if (connection) connection.end();
    console.log(completeMessage);
  }   
}

async function getNMinData(database, devType, devID, minute){
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

async function getLastNData(database, devType, devID, qty){
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

async function getDataT1ToT2(database, devType, devID, T1, T2){
  const sqlQuery = `SELECT * FROM Device_${devType}_${devID} WHERE unix >= '${T1}' AND unix <= '${T2}' order by unix desc`;
  // console.log(sqlQuery);
  let connection;
  try {
    connection = await pool.getConnection();
    result = await connection.query(`use ${database}`);
    result = await connection.query(sqlQuery);
    return result;
  } catch (ex) {
    console.log("DB Error", ex.message);
  } finally {
    if (connection) connection.end();
    console.log("T to T Finally");
  }
}

async function getNDataAfterT(database, devType, devID, T1, n1){
  const sqlQuery = `SELECT * FROM Device_${devType}_${devID} WHERE unix >= '${T1}' limit ${n1}`;
  let connection;
  try {
    connection = await pool.getConnection();
    result = await connection.query(`use ${database}`);
    result = await connection.query(sqlQuery);
    return result;
  } catch (ex) {
    console.log("DB Error", ex.message);
  } finally {
    if (connection) connection.end();
    console.log("N After T Finally");
  }
}

async function getNMinAfterT(database, devType, devID, T1, min1){
  const sqlQuery = `SELECT * FROM Device_${devType}_${devID} WHERE unix >= '${T1}' AND unix <= '${T1}' + ${min1}*60 `;
  let connection;
  try {
    connection = await pool.getConnection();
    result = await connection.query(`use ${database}`);
    result = await connection.query(sqlQuery);
    return result;
  } catch (ex) {
    console.log("DB Error", ex.message);
  } finally {
    if (connection) connection.end();
    console.log("N Min After T Finally");
  }
}

// check device id listed on building device list
async function listedInbuildingDevices(devType, devID){
  const sqlQuery = `SELECT * FROM BuildingDevices WHERE type = '${devType}' AND devID = '${devID}'`;
  let connection;
  try {
    connection = await pool.getConnection();
    result = await connection.query(`use Buildings`);
    result = await connection.query(sqlQuery);
    return result;
  } catch (ex) {
    console.log("DB Error", ex.message);
  } finally {
    if (connection) connection.end();
    // console.log("listed In Building Devices Finally");
  }
}

exports.queryTemplate=queryTemplate;
exports.insertTemplate = insertTemplate;
exports.listedInbuildingDevices = listedInbuildingDevices;
exports.getNMinAfterT = getNMinAfterT;
exports.getNDataAfterT = getNDataAfterT;
exports.getDataT1ToT2 = getDataT1ToT2;
exports.getNMinData =getNMinData;
exports.getLastNData =getLastNData;