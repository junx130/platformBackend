const { insertTemplate, queryTemplate } = require("../queryData");


const db = "V2_Control";
const gwPairTable = "V2_CtrlGwPair";

async function V2_insertGwPair(info) {
    let fnName = "insertV2_gwPair";
    try {
        const createTable = `CREATE TABLE IF NOT EXISTS ${gwPairTable}(	
            _id int NOT NULL AUTO_INCREMENT,
            timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            unix INT(11) NOT NULL,	
            bdDev_id int,
            gwid int,
            inUse tinyint default 1,
            PRIMARY KEY (_id)
        );`;

        const insertData = `INSERT INTO ${gwPairTable} (unix, bdDev_id, gwid)
        VALUES (UNIX_TIMESTAMP(), ${info.bdDev_id}, ${info.gwid});`;        

        let result = await insertTemplate(db, createTable, insertData, `${fnName} Finally`);
        if (!result) return null    // insert error
        if (result.affectedRows > 0 && result.insertId > 0) return { success: true, insertId: result.insertId }

    } catch (error){
        console.log(`${fnName} err : `, error.message);
        return null;
    }
}

async function V2_getGwPair (bdDev_id){
    let sErrTitle = "V2_getGwPair";
    try {
        let quertCmd = `SELECT * from ${gwPairTable} WHERE bdDev_id = ${bdDev_id} and inUse = 1`;        
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


async function V2_updateGwPair(bdDev_id, gwid) {
    let sMsg = "V2_updateGwPair";
    try {
        const quertCmd = `UPDATE ${gwPairTable} SET 
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

exports.V2_insertGwPair = V2_insertGwPair;
exports.V2_getGwPair=V2_getGwPair;
exports.V2_updateGwPair=V2_updateGwPair;