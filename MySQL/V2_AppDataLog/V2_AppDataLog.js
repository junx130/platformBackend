const { insertTemplate, queryTemplate } = require("../queryData");

const db = "V2_AppDataLog";
// const appListTable = "V2_ApplicationList";

async function v2_insertAppDataLog(type, master_id, reading_id, reading, opCode, nInterval_m) {
    let fnName = "v2_insertAppDataLog";
    let tableName = `V2_AppDataLog_${type}_${master_id}_${reading_id}`
    try {
        const createTable = `CREATE TABLE IF NOT EXISTS ${tableName}(	
            _id int NOT NULL AUTO_INCREMENT,
            timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            startLogUnix INT(11) NOT NULL,
            unix INT(11) NOT NULL,
            reading float,
            opCode_inc int,
            PRIMARY KEY (_id)
        );`;

        const insertData = `INSERT INTO ${tableName} (startLogUnix, unix, reading, opCode_inc)
        VALUES (UNIX_TIMESTAMP()-${nInterval_m*60}, UNIX_TIMESTAMP(), ${reading}, ${opCode});`;        

        let result = await insertTemplate(db, createTable, insertData, `${fnName} Finally`);
        if (!result) return null    // insert error
        if (result.affectedRows > 0 && result.insertId > 0) return { success: true, insertId: result.insertId }
        return null     //<--- unknown state

    } catch (error){
        console.log(`${fnName} err : `, error.message);
        return null;
    }
}

async function v2_getAppDataLog_LastN (type, master_id, reading_id, nToGet){
    let sErrTitle = "v2_getAppDataLog_LastN";
    let tableName = `V2_AppDataLog_${type}_${master_id}_${reading_id}`
    try {
        let quertCmd = `SELECT * from ${tableName} order by unix desc limit ${nToGet}`;
        // console.log(quertCmd);
        let result = await queryTemplate(db, quertCmd, `${sErrTitle} Finally`);
        // console.log(result);
        if(!result[0]) return [];     // return empty array
        const rtnResult = result.map(b=>b);
        return rtnResult;       
    } catch (error) {
        console.log(`${sErrTitle}`, error.message)
        return null;       
    }
}



/***************** re-tune var log ********************/
const retuneTableName = "V2_ReTuneVarLog";

async function v2_insertReTuneLog(type, master_id, retune_id, reading, opCode) {
    let fnName = "v2_insertReTuneLog";
    let tableName = `${retuneTableName}_${type}_${master_id}_${retune_id}`
    try {
        const createTable = `CREATE TABLE IF NOT EXISTS ${tableName}(	
            _id int NOT NULL AUTO_INCREMENT,
            timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            unix INT(11) NOT NULL,
            reading float,
            opCode_inc int,
            PRIMARY KEY (_id)
        );`;

        const insertData = `INSERT INTO ${tableName} (unix, reading, opCode_inc)
        VALUES (UNIX_TIMESTAMP(), ${reading}, ${opCode});`;        

        let result = await insertTemplate(db, createTable, insertData, `${fnName} Finally`);
        if (!result) return null    // insert error
        if (result.affectedRows > 0 && result.insertId > 0) return { success: true, insertId: result.insertId }
        return null     //<--- unknown state

    } catch (error){
        console.log(`${fnName} err : `, error.message);
        return null;
    }
}

async function v2_getReTuneVarLog_withOpCode (type, master_id, retune_id, opCode){
    let sErrTitle = "v2_getReTuneVarLog_withOpCode";
    let tableName = `${retuneTableName}_${type}_${master_id}_${retune_id}`
    try {
        let quertCmd = `SELECT * from ${tableName} where opCode_inc = ${opCode} order by unix desc`;
        // console.log(quertCmd);
        let result = await queryTemplate(db, quertCmd, `${sErrTitle} Finally`);
        // console.log(result);
        if(!result[0]) return [];     // return empty array
        const rtnResult = result.map(b=>b);
        return rtnResult;       
    } catch (error) {
        console.log(`${sErrTitle}`, error.message)
        return null;       
    }
}


/********** App Data log *********/
exports.v2_insertAppDataLog=v2_insertAppDataLog;
exports.v2_getAppDataLog_LastN=v2_getAppDataLog_LastN;

/********* retune var log **********/
exports.v2_insertReTuneLog=v2_insertReTuneLog;
exports.v2_getReTuneVarLog_withOpCode=v2_getReTuneVarLog_withOpCode;