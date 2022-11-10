const { insertTemplate, queryTemplate } = require("../queryData");


const db = "V2_Application";
const appListTable = "V2_ApplicationList";
const appMemberTable = "V2_AppMemberList";
const appInputFactorPairTable = "V2_AppInputFactorPair";
const appErrLogTable = "V2_AppErrLog";
const appRetuneVarTable = "V2_AppReTuneVarPair";
const appPairVarTable = "V2_AppVarPair";


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
// to be removed
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
// to be removed
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
// to be removed
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



/************Code Within - Start************ */
async function getVarPair (masterBdDev_id, fnType){
    let sErrTitle = "getVarPair";
    try {
        let quertCmd = `SELECT * from ${appPairVarTable} WHERE masterBdDev_id = ${masterBdDev_id} and fnType = ${fnType} and inUse = 1`;
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

/** insert V2_AppVarPair 
 * 
 *  requirement
 * 1. insert function follow DB Template.jsx
 * 1.1 change the fnName follow "function name"
 * 2. make sure able to create V2_AppVarPair table if table not exist 
 * 
 * 
*/




/************Code Within - End************ */







exports.get_V2AppMember=get_V2AppMember;
exports.get_V2AppListByBd_id=get_V2AppListByBd_id;
/*************** V2_AppInputFactorPair **************/
exports.get_V2InputFactorPaired=get_V2InputFactorPaired;
/************** App Error Log ********************/
exports.v2_insertAppErrLog=v2_insertAppErrLog;
/************** return var **********************/
exports.getRetuneVar_masterbdDevId=getRetuneVar_masterbdDevId;

/********var pair ***********/
exports.getVarPair=getVarPair;