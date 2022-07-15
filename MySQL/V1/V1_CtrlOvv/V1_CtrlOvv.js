const { insertTemplate, queryTemplate } = require("../../queryData");

const db = "V1_Control";
const ctrlOvvAreaTable = "V1_CtrlOvvArea";
const ctrlOvvDevTable = "V1_CtrlOvvDev";
const gwPaitTable = "V1_CtrlGwPair";

/***********Ctrl Ovv Area*********** */
async function get_V1_ctrlOvvAreaInBd_ctrlPg (bd_id, ctrlPg){
    let sErrTitle = "get_V1_ctrlOvvAreaInBd_ctrlPg";
    try {
        let quertCmd = `SELECT * from ${ctrlOvvAreaTable} WHERE bd_id = ${bd_id} and ctrlPg = ${ctrlPg} and active = 1 and inUse = 1`;
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


/***********Ctrl Ovv Dev*********** */
async function get_V1_ctrlOvvDevInBd_ctrlPg (bd_id, ctrlPg){
    let sErrTitle = "get_V1_ctrlOvvDevInBd_ctrlPg";
    try {
        let quertCmd = `SELECT * from ${ctrlOvvDevTable} WHERE bd_id = ${bd_id} and ctrlPg = ${ctrlPg} and active = 1 and inUse = 1`;
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


/***********Ctrl Gw pair record*********** */
async function get_V1_ctrlGwPair (bdDev_id){
    let sErrTitle = "get_V1_ctrlGwPair";
    try {
        let quertCmd = `SELECT * from ${gwPaitTable} WHERE bdDev_id = ${bdDev_id} and inUse = 1`;
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

async function V1_insertGatewayPair(info) {
    let fnName = "V1_insertGatewayPar";
    try {
        const createTable = `CREATE TABLE IF NOT EXISTS ${gwPaitTable}(	
            _id int NOT NULL AUTO_INCREMENT,
            timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            unix INT(11) NOT NULL,
            bdDev_id int,
            gwid int,
            inUse tinyint default 1,
            PRIMARY KEY (_id)
        );`;

        const insertData = `INSERT INTO ${gwPaitTable} (unix, bdDev_id, gwid)
        VALUES (UNIX_TIMESTAMP(), ${info.bdDev_id}, ${info.gwid});`;        

        let result = await insertTemplate(db, createTable, insertData, `${fnName} Finally`);
        if (!result) return null    // insert error
        if (result.affectedRows > 0 && result.insertId > 0) return { success: true, insertId: result.insertId }

    } catch (error){
        console.log(`${fnName} err : `, error.message);
        return null;
    }
}

async function V1_updateGwPair(bdDev_id, gwid) {
    let sMsg = "V1_updateGwPair";
    try {
        const quertCmd = `UPDATE ${gwPaitTable} SET 
            unix=UNIX_TIMESTAMP(),
            gwid = ${gwid},
            inUse  = 1
            where bdDev_id = ${bdDev_id}`;
        // console.log("quertCmd", quertCmd);

        let result = await queryTemplate(db, quertCmd, `${sMsg} Finally`);
        // console.log(result);
        if (!result || !result.affectedRows) return null;
        if (result.affectedRows > 0) return true;
        return null

    } catch (error) {
        console.log(`Error : ${sMsg}`, error.message);
        return null;
    }
}


exports.get_V1_ctrlOvvAreaInBd_ctrlPg=get_V1_ctrlOvvAreaInBd_ctrlPg;
exports.get_V1_ctrlOvvDevInBd_ctrlPg=get_V1_ctrlOvvDevInBd_ctrlPg;
exports.get_V1_ctrlGwPair=get_V1_ctrlGwPair;
exports.V1_insertGatewayPair=V1_insertGatewayPair;
exports.V1_updateGwPair=V1_updateGwPair;