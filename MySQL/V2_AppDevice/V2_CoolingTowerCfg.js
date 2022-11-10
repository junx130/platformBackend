const { insertTemplate, queryTemplate } = require("../queryData");

const db = "V2_AppDevice";
const coolingTowerTable = "V2_CoolingTowerCfg";

async function getCoolingTowerCfg_bybdDev_id (bdDev_id){
    let sErrTitle = "getCoolingTowerCfg_bybdDev_id";
    try {
        let quertCmd = `SELECT * from ${coolingTowerTable} WHERE bdDev_id = ${bdDev_id} and inUse = 1`;        
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

async function getCoolingTowerCfg_bybdDev_id_incNotInUse (bdDev_id){
    let sErrTitle = "getCoolingTowerCfg_bybdDev_id";
    try {
        let quertCmd = `SELECT * from ${coolingTowerTable} WHERE bdDev_id = ${bdDev_id}`;        
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

async function insertCoolingTowerCfg(info) {
    let fnName = "insertCoolingTowerCfg";
    try {
        const createTable = `CREATE TABLE IF NOT EXISTS ${coolingTowerTable}(	
            _id int NOT NULL AUTO_INCREMENT,
            timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            unix INT(11) NOT NULL,
            bdDev_id int,
            opMode smallint,
            FO_Avtive smallint,
            FO_Value smallint,
            inUse tinyint default 1,
            PRIMARY KEY (_id)
        );`;

        const insertData = `INSERT INTO ${coolingTowerTable} (unix, bdDev_id, opMode, FO_Avtive, FO_Value)
        VALUES (UNIX_TIMESTAMP(), ${info.bdDev_id}, ${info.opMode}, ${info.FO_Avtive}, ${info.FO_Value});`;        

        let result = await insertTemplate(db, createTable, insertData, `${fnName} Finally`);
        if (!result) return null    // insert error
        if (result.affectedRows > 0 && result.insertId > 0) return { success: true, insertId: result.insertId }
        return null     //<--- unknown state
    } catch (error){
        console.log(`${fnName} err : `, error.message);
        return null;
    }
}

async function updateCoolingTowerCfg_by_id(info, _id) {
    let sMsg = "updateCoolingTowerCfg_by_id";
    try {
        const quertCmd = `UPDATE ${coolingTowerTable} SET 
            unix=UNIX_TIMESTAMP(),
            bdDev_id = ${info.bdDev_id},
            opMode = ${info.opMode},
            FO_Avtive = ${info.FO_Avtive},
            FO_Value =${info.FO_Value},
            inUse  = 1
            where _id = ${_id}`;
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


exports.insertCoolingTowerCfg=insertCoolingTowerCfg;
exports.getCoolingTowerCfg_bybdDev_id=getCoolingTowerCfg_bybdDev_id;
exports.getCoolingTowerCfg_bybdDev_id_incNotInUse=getCoolingTowerCfg_bybdDev_id_incNotInUse;
exports.updateCoolingTowerCfg_by_id=updateCoolingTowerCfg_by_id;