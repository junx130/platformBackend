
const { pool } = require("./db");
const database = "RawDataLog";


async function getNMinData(devType, devID, minute){
    const sqlQuery = `SELECT * FROM Device_${devType}_${devID} WHERE timestamp >= now() - INTERVAL ${minute} MINUTE;`
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
    const sqlQuery = `SELECT * FROM Device_${devType}_${devID} ORDER BY TIMESTAMP DESC LIMIT ${qty}`;
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


exports.getNMinData =getNMinData;
exports.getLastNData =getLastNData;