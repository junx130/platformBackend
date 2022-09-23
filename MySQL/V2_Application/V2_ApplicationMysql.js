const { insertTemplate, queryTemplate } = require("../queryData");


const db = "V2_Application";
const appListTable = "V2_ApplicationList";
const appMemberTable = "V2_AppMemberList";
const appInputFactorPairTable = "V2_AppInputFactorPair";
const appErrLogTable = "V2_AppErrLog";
const appRetuneVarTable = "V2_AppReTuneVarPair";



async function get_V2AppMember (app_id){
    let sErrTitle = "get_V2AppMember";
    try {
        let quertCmd = `SELECT * from ${appMemberTable} WHERE app_id = ${app_id} and inUse = 1`;        
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


async function get_V2AppListByBd_id (bd_id){
    let sErrTitle = "get_V2AppListByBd_id";
    try {
        let quertCmd = `SELECT * from ${appListTable} WHERE bd_id = ${bd_id} and inUse = 1`;        
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


/*************** V2_AppInputFactorPair **************/
async function get_V2InputFactorPaired (masterBdDev_id){
    let sErrTitle = "get_V2InputFactorPaired";
    try {
        let quertCmd = `SELECT * from ${appInputFactorPairTable} WHERE masterBdDev_id = ${masterBdDev_id} and inUse = 1`;        
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

/****************Error log**************** */
async function v2_insertAppErrLog(masterBdDev_id, errMsg) {
    let fnName = "v2_insertAppErrLog";
    try {
        const createTable = `CREATE TABLE IF NOT EXISTS ${appErrLogTable}(	
            _id int NOT NULL AUTO_INCREMENT,
            timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            unix INT(11) NOT NULL,
            masterBdDev_id int,
            errMsg varchar(80),
            PRIMARY KEY (_id)
        );`;

        const insertData = `INSERT INTO ${appErrLogTable} (unix, masterBdDev_id, errMsg)
        VALUES (UNIX_TIMESTAMP(), ${masterBdDev_id}, "${errMsg}");`;        

        let result = await insertTemplate(db, createTable, insertData, `${fnName} Finally`);
        if (!result) return null    // insert error
        if (result.affectedRows > 0 && result.insertId > 0) return { success: true, insertId: result.insertId }
        return null     //<--- unknown state

    } catch (error){
        console.log(`${fnName} err : `, error.message);
        return null;
    }
}



/**  Re-Tune var table */
async function getRetuneVar_masterbdDevId (masterBdDev_id){
    let sErrTitle = "getRetuneVar_opCode";
    try {
        let quertCmd = `SELECT * from ${appRetuneVarTable} WHERE masterBdDev_id = ${masterBdDev_id} and inUse = 1`;
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





exports.get_V2AppMember=get_V2AppMember;
exports.get_V2AppListByBd_id=get_V2AppListByBd_id;
/*************** V2_AppInputFactorPair **************/
exports.get_V2InputFactorPaired=get_V2InputFactorPaired;
/************** App Error Log ********************/
exports.v2_insertAppErrLog=v2_insertAppErrLog;
/************** return var **********************/
exports.getRetuneVar_masterbdDevId=getRetuneVar_masterbdDevId;