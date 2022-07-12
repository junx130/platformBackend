const { insertTemplate, queryTemplate } = require("../queryData");

const db = "V2_Control";
const CmdLogTable = "V2_CtrlCmdLog";
const scheduleTable = "V2_DeviceSchedule";

async function V2_InsertCrlCmdLog(info, subTopic) {
    try {
        const createTable = `CREATE TABLE IF NOT EXISTS ${CmdLogTable}(	
            _id int NOT NULL AUTO_INCREMENT,
            timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            unix INT(11) NOT NULL,	
            subTopic varchar(80),
            ft int,
            gwid int,
            hi int,
            ht int, 
            hd int,
            hf int,
            hct int,
            GwAck tinyint default 0,
            NodeAck tinyint default 0,
            PRIMARY KEY (_id)
       );`;
            
        const insertData = `INSERT INTO ${CmdLogTable} (unix, subTopic, ft, gwid, hi, ht, hd, hf, hct)
        VALUES (UNIX_TIMESTAMP(), "${subTopic}", ${info.ft}, ${info.gwid}, ${info.hi}, ${info.ht}, ${info.hd}, ${info.hf}, ${info.hct});`;        

        let result = await insertTemplate(db, createTable, insertData, "V2_InsertCrlCmdLog Finally");
        if (!result) return null    // insert error
        if (result.affectedRows > 0 && result.insertId > 0) return { success: true, insertId: result.insertId }

    } catch (error){
        console.log(error.message);
        return null;
    }
}

async function V2_updateCrlCmdLog(info, gwid, subTopic, sCol, sValue, isString, skipHd) {
    let sMsg = "updateSharedBd";
    let _sValue = sValue;
    if(isString) _sValue = `"${_sValue}"`;
    try {
        let _hd="";
        if(!skipHd) _hd = `hd = ${info.hd} AND `;
        const quertCmd = `UPDATE ${CmdLogTable} SET 
            unix=UNIX_TIMESTAMP(),
            ${sCol} = ${_sValue}
            where ft = ${info.ft} AND 
            subTopic = "${subTopic}" AND 
            gwid = ${gwid} AND 
            hi = ${info.hi} AND 
            ht = ${info.ht} AND 
            hct = ${info.hct} AND 
            ${_hd}
            hf = ${info.hf} ;
            `;
        // console.log("quertCmd", quertCmd);

        let result = await queryTemplate(db, quertCmd, `${sMsg} Finally`);
        // console.log("Update Rel",result);
        if (!result || !result.affectedRows) return null;
        if (result.affectedRows > 0) return true;
        return null

    } catch (error) {
        console.log(`Error : ${sMsg}`, error.message);
        return null;
    }
}


async function V2_getUnprocessCrlCmdLog_bySubTopic (subTopic){
    let sErrTitle = "V2_getCrlCmdLog";
    try {
        let quertCmd = `SELECT * from ${CmdLogTable} WHERE subTopic = "${subTopic}" and NodeAck = 0 and unix > UNIX_TIMESTAMP()-60`;
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

async function V2_updateCrlCmdLogBy_id(_id, sCol, sValue,isString) {
    let sMsg = "V2_updateCrlCmdLogBy_id";
    let _sValue = sValue;
    if(isString) _sValue = `"${_sValue}"`;
    try {
        const quertCmd = `UPDATE ${CmdLogTable} SET 
            unix=UNIX_TIMESTAMP(),
            ${sCol} = ${_sValue}
            where _id = ${_id};
            `;
        // console.log("quertCmd", quertCmd);

        let result = await queryTemplate(db, quertCmd, `${sMsg} Finally`);
        // console.log("Update Rel",result);
        if (!result || !result.affectedRows) return null;
        if (result.affectedRows > 0) return true;
        return null

    } catch (error) {
        console.log(`Error : ${sMsg}`, error.message);
        return null;
    }
}



async function V2_getCmdLog (info){
    let sErrTitle = "V2_getCmdLog";
    try {
        let quertCmd = `SELECT * from ${CmdLogTable} WHERE ht = ${info.ht} and 
        hi = ${info.hi} and hf = ${info.hf} and hct = ${info.hct} and ft = ${info.ft} and 
        gwid = ${info.gwid} `;
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


async function V2_getSchedule (info){
    let sErrTitle = "V2_getSchedule";
    try {
        let quertCmd = `SELECT * from ${scheduleTable} WHERE ht = ${info.ht} and 
        hi = ${info.hi}`;
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

exports.V2_InsertCrlCmdLog=V2_InsertCrlCmdLog;
exports.V2_updateCrlCmdLog=V2_updateCrlCmdLog;
exports.V2_getUnprocessCrlCmdLog_bySubTopic=V2_getUnprocessCrlCmdLog_bySubTopic;
exports.V2_updateCrlCmdLogBy_id=V2_updateCrlCmdLogBy_id;
exports.V2_getCmdLog=V2_getCmdLog;

// schedule 
exports.V2_getSchedule=V2_getSchedule;