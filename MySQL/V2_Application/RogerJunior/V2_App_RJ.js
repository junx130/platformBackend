const { insertTemplate, queryTemplate } = require("../../queryData");

const db = "V2_Application";
const rjOnlineVarTable = "RJ_OnlineVar";
const rjSceneTable = "RJ_AdvCtrlScene";
const rjRulesTable = "RJ_AdvCtrlRules";
const rjCondiTable = "RJ_AdvCtrlCondi";
const rjScheTable = "RJ_ScheRecord";
const rjAcBrand = "RJ_AcBrand";

// online var
async function insertRjOnlineVar(info, Rj_bdDevId) {
    let fnName = "insertRjOnlineVar";
    try {
        const createTable = `CREATE TABLE IF NOT EXISTS ${rjOnlineVarTable}(	
            _id int NOT NULL AUTO_INCREMENT,
            timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            unix INT(11) NOT NULL,
            varName varchar(80),
            varIdx smallint not null,
            Rj_bdDevId int not null,
            Var_bdDevId int not null,
            sensorType int not null,
            dataType smallint,
            dataIndex smallint,
            active tinyint  default 1,
            PRIMARY KEY (_id)
        );`;

        const insertData = `INSERT INTO ${rjOnlineVarTable} (unix, varName, varIdx, Rj_bdDevId, Var_bdDevId, sensorType, dataType, dataIndex)
        VALUES (UNIX_TIMESTAMP(), "${info.varName}", ${info.varIdx}, ${Rj_bdDevId}, ${info.Var_bdDevId}, ${info.sensorType}, ${info.dataType}, ${info.dataIndex});`;        

        let result = await insertTemplate(db, createTable, insertData, `${fnName} Finally`);
        if (!result) return null    // insert error
        if (result.affectedRows > 0 && result.insertId > 0) return { success: true, insertId: result.insertId }
        return null     //<--- unknown state

    } catch (error){
        console.log(`${fnName} err : `, error.message);
        return null;
    }
}

async function getRjOnineVar_BybdDev_id (bdDev_id){
    let sErrTitle = "getRjOnineVar_BybdDev_id";
    try {
        let quertCmd = `SELECT * from ${rjOnlineVarTable} WHERE Rj_bdDevId = ${bdDev_id} and active = 1 order by Var_bdDevId, _id asc`;
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

async function rjLinkVarSetAllUnUse(Rj_bdDevId) {
    let sMsg = "rjLinkVarSetAllUnUse";
    try {
        const quertCmd = `UPDATE ${rjOnlineVarTable} SET 
            unix=UNIX_TIMESTAMP(),
            active = 0
            where Rj_bdDevId = ${Rj_bdDevId}
            and varIdx in (2,3,4,5,6)`;

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


async function updateRjOnlineVar(info, Rj_bdDevId, _id) {
    let sMsg = "updateRjOnlineVar";
    try {
        const quertCmd = `UPDATE ${rjOnlineVarTable} SET 
            unix=UNIX_TIMESTAMP(),
            varName = "${info.varName}",
            varIdx = ${info.varIdx},
            Rj_bdDevId = ${Rj_bdDevId},
            Var_bdDevId = ${info.Var_bdDevId},
            sensorType = ${info.sensorType},
            dataType = ${info.dataType},
            dataIndex = ${info.dataIndex},
            active = 1
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

async function getRjEmptyLinkVar (){
    let sErrTitle = "getRjEmptyLinkVar";
    try {
        let quertCmd = `SELECT * from ${rjOnlineVarTable} WHERE active = 0 limit 1`;
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


// RJ Scene 
async function insertRjScene(info, sceneIdx, sortIdx) {
    let fnName = "insertRjRule";
    try {
        const createTable = `CREATE TABLE IF NOT EXISTS ${rjSceneTable}(	
            _id int NOT NULL AUTO_INCREMENT,
            timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            unix INT(11) NOT NULL,
            Rj_bdDevId int not null,
            sceneIdx tinyint,
            Name varchar(80),
            sortIdx smallint,
            inUse tinyint default 1,
            PRIMARY KEY (_id)
        );`;

        const insertData = `INSERT INTO ${rjSceneTable} (unix, Rj_bdDevId, sceneIdx, Name, sortIdx)
        VALUES (UNIX_TIMESTAMP(), ${info.Rj_bdDevId}, ${sceneIdx}, "${info.Name}", ${sortIdx});`;        

        let result = await insertTemplate(db, createTable, insertData, `${fnName} Finally`);
        if (!result) return null    // insert error
        if (result.affectedRows > 0 && result.insertId > 0) return { success: true, insertId: result.insertId }
        return null     //<--- unknown state

    } catch (error){
        console.log(`${fnName} err : `, error.message);
        return null;
    }
}

async function getRjScene_BybdDev_id (bdDev_id){
    let sErrTitle = "getRjScene_BybdDev_id";
    try {
        let quertCmd = `SELECT * from ${rjSceneTable} WHERE Rj_bdDevId = ${bdDev_id} and inUse = 1 order by sceneIdx`;
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

async function getRjScene_BybdDev_id_orderSortIdx (bdDev_id){
    let sErrTitle = "getRjScene_BybdDev_id_orderSortIdx";
    try {
        let quertCmd = `SELECT * from ${rjSceneTable} WHERE Rj_bdDevId = ${bdDev_id} and inUse = 1 order by sortIdx`;
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

async function updateRjScene(info, _id) {
    let sMsg = "updateRjScene";
    try {
        const quertCmd = `UPDATE ${rjSceneTable} SET 
            unix=UNIX_TIMESTAMP(),
            Rj_bdDevId = ${info.Rj_bdDevId},
            sceneIdx = ${info.sceneIdx},
            Name = "${info.Name}",
            inUse = 1
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

async function deleteScene_unUse(_id) {
    let sMsg = "deleteScene_unUse";
    try {
        const quertCmd = `UPDATE ${rjSceneTable} SET 
            unix=UNIX_TIMESTAMP(),
            inUse = 0
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

async function updateRjSceneSortIdx(sortIdx, _id) {
    let sMsg = "updateRjSceneSortIdx";
    try {
        const quertCmd = `UPDATE ${rjSceneTable} SET 
            unix=UNIX_TIMESTAMP(),
            sortIdx = ${sortIdx},
            inUse = 1
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

// RJ Rules
async function insertRjRule(info, ruleIdx, sceneIdx) {
    let fnName = "insertRjRule";
    try {
        const createTable = `CREATE TABLE IF NOT EXISTS ${rjRulesTable}(	
            _id int NOT NULL AUTO_INCREMENT,
            timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            unix INT(11) NOT NULL,
            Rj_bdDevId int not null,
            sceneIdx tinyint,
            ruleIdx tinyint,
            AcReq tinyint,
            Setpoint smallint,
            inUse tinyint default 1,
            PRIMARY KEY (_id)
        );`;

        const insertData = `INSERT INTO ${rjRulesTable} (unix, Rj_bdDevId, sceneIdx, ruleIdx, AcReq, Setpoint)
        VALUES (UNIX_TIMESTAMP(), ${info.Rj_bdDevId}, ${sceneIdx}, ${ruleIdx}, ${info.AcReq}, ${info.Setpoint});`;        

        let result = await insertTemplate(db, createTable, insertData, `${fnName} Finally`);
        if (!result) return null    // insert error
        if (result.affectedRows > 0 && result.insertId > 0) return { success: true, insertId: result.insertId }
        return null     //<--- unknown state

    } catch (error){
        console.log(`${fnName} err : `, error.message);
        return null;
    }
}

async function getRjRules_bdDevId_sceneIdx_inUse (bdDev_id, sceneIdx){
    let sErrTitle = "getRjRules_BybdDev_id";
    try {
        let quertCmd = `SELECT * from ${rjRulesTable} WHERE Rj_bdDevId = ${bdDev_id} and sceneIdx =${sceneIdx} and inUse = 1 order by ruleIdx`;
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
async function getRjEmptyRule (){
    let sErrTitle = "getRjEmptyRule";
    try {
        let quertCmd = `SELECT * from ${rjRulesTable} WHERE inUse = 0 limit 1`;
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

async function updateRjRule(info, _id, ruleIdx, sceneIdx) {
    let sMsg = "updateRjRule";
    try {
        const quertCmd = `UPDATE ${rjRulesTable} SET 
            unix=UNIX_TIMESTAMP(),
            Rj_bdDevId = ${info.Rj_bdDevId},
            sceneIdx = ${sceneIdx},
            ruleIdx = ${ruleIdx},
            AcReq = ${info.AcReq},
            Setpoint = ${info.Setpoint},
            inUse = 1
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

async function rulesSetAllUnUse(Rj_bdDevId, sceneIdx) {
    let sMsg = "rulesSetAllUnUse";
    try {
        const quertCmd = `UPDATE ${rjRulesTable} SET 
            unix=UNIX_TIMESTAMP(),
            inUse = 0
            where Rj_bdDevId = ${Rj_bdDevId}
            and sceneIdx =${sceneIdx }`;
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

// RJ condis
async function getRjCondis_bdDevId_sceneIdx_inUse (bdDev_id, sceneIdx){
    let sErrTitle = "getRjRules_BybdDev_id";
    try {
        let quertCmd = `SELECT * from ${rjCondiTable} WHERE Rj_bdDevId = ${bdDev_id} and sceneIdx =${sceneIdx} and inUse = 1`;
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

async function getRjEmptyCondis (){
    let sErrTitle = "getRjEmptyCondis";
    try {
        let quertCmd = `SELECT * from ${rjCondiTable} WHERE inUse = 0 limit 1`;
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

async function updateRjCondi(info, _id, ruleIdx, sceneIdx) {
    let sMsg = "updateRjCondi";
    try {
        const quertCmd = `UPDATE ${rjCondiTable} SET 
            unix=UNIX_TIMESTAMP(),
            Rj_bdDevId = ${info.Rj_bdDevId},
            sceneIdx = ${sceneIdx},
            ruleIdx = ${ruleIdx},
            varIdx = ${info.varIdx},
            condiOpe = ${info.condiOpe},
            targetValue = ${info.targetValue},
            inUse = 1
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

async function condiSetAllUnUse(Rj_bdDevId, sceneIdx) {
    let sMsg = "condiSetAllUnUse";
    try {
        const quertCmd = `UPDATE ${rjCondiTable} SET 
            unix=UNIX_TIMESTAMP(),
            inUse = 0
            where Rj_bdDevId = ${Rj_bdDevId}
            and sceneIdx =${sceneIdx }`;
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

async function insertRjCondi(info, ruleIdx, sceneIdx) {
    let fnName = "insertRjCondi";
    try {
        const createTable = `CREATE TABLE IF NOT EXISTS ${rjCondiTable}(	
            _id int NOT NULL AUTO_INCREMENT,
            timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            unix INT(11) NOT NULL,
            Rj_bdDevId int not null,
            sceneIdx tinyint,
            ruleIdx tinyint,
            varIdx tinyint,
            condiOpe tinyint,
            targetValue float,
            inUse tinyint default 1,
            PRIMARY KEY (_id)
        );`;

        const insertData = `INSERT INTO ${rjCondiTable} (unix, Rj_bdDevId, sceneIdx, ruleIdx, varIdx, condiOpe, targetValue)
        VALUES (UNIX_TIMESTAMP(), ${info.Rj_bdDevId}, ${sceneIdx}, ${ruleIdx}, ${info.varIdx}, ${info.condiOpe}, ${info.targetValue});`;        

        let result = await insertTemplate(db, createTable, insertData, `${fnName} Finally`);
        if (!result) return null    // insert error
        if (result.affectedRows > 0 && result.insertId > 0) return { success: true, insertId: result.insertId }
        return null     //<--- unknown state

    } catch (error){
        console.log(`${fnName} err : `, error.message);
        return null;
    }
}



// Rj schedule
async function insertRjSchedule(info, rj_id) {
    let fnName = "insertRjSchedule";
    try {
        const createTable = `CREATE TABLE IF NOT EXISTS ${rjScheTable}(	
            _id int NOT NULL AUTO_INCREMENT,
            timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            unix INT(11) NOT NULL,
            Rj_bdDevId int not null,
            name varchar(30),
            scheType tinyint,
            startUnix INT(11),
            DOW tinyint,
            Setpoint float,
            Fan tinyint,
            Swing tinyint,
            action tinyint,
            sceneIdx tinyint,
            active tinyint,
            priority tinyint,
            inUse tinyint default 1,
            PRIMARY KEY (_id)
        );`;

        const insertData = `INSERT INTO ${rjScheTable} (unix, Rj_bdDevId, name, scheType, startUnix, DOW, Setpoint, Fan, Swing, action, sceneIdx, active, priority)
        VALUES (UNIX_TIMESTAMP(), ${rj_id}, "${info.name}", ${info.scheType}, ${info.startUnix}, ${info.DOW}, ${info.Setpoint}, ${info.Fan}, ${info.Swing}, ${info.action}, ${info.sceneIdx}, ${info.active}, ${info.priority});`;        

        let result = await insertTemplate(db, createTable, insertData, `${fnName} Finally`);
        if (!result) return null    // insert error
        if (result.affectedRows > 0 && result.insertId > 0) return { success: true, insertId: result.insertId }
        return null     //<--- unknown state

    } catch (error){
        console.log(`${fnName} err : `, error.message);
        return null;
    }
}

async function updateRjSchedule(info, rj_id, _id) {
    let sMsg = "updateRjSchedule";
    try {
        const quertCmd = `UPDATE ${rjScheTable} SET 
            unix=UNIX_TIMESTAMP(),
            Rj_bdDevId = ${rj_id},
            name = "${info.name}",
            scheType = ${info.scheType},
            startUnix = ${info.startUnix},
            DOW = ${info.DOW},
            Setpoint = ${info.Setpoint},
            Fan = ${info.Fan},
            Swing = ${info.Swing},
            action = ${info.action},
            sceneIdx = ${info.sceneIdx},
            active = ${info.active},
            priority = ${info.priority},
            inUse = 1
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



async function getRjSchedule_byRjBdDev_id (Rj_bdDevId){
    let sErrTitle = "getRjSchedule_byRjBdDev_id";
    try {
        let quertCmd = `SELECT * from ${rjScheTable} WHERE inUse = 1 and Rj_bdDevId = ${Rj_bdDevId}`;
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

async function getRjEmptyRjSchedule (){
    let sErrTitle = "getRjEmptyRjSchedule";
    try {
        let quertCmd = `SELECT * from ${rjScheTable} WHERE inUse = 0 limit 1`;
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

async function rjScheduleSetAllUnUse(Rj_bdDevId) {
    let sMsg = "rjScheduleSetAllUnUse";
    try {
        const quertCmd = `UPDATE ${rjScheTable} SET 
            unix=UNIX_TIMESTAMP(),
            inUse = 0
            where Rj_bdDevId = ${Rj_bdDevId}`;
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


// AC brand
async function getRjAcBrands (){
    let sErrTitle = "getRjAcBrands";
    try {
        let quertCmd = `SELECT * from ${rjAcBrand}`;
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




// online var
exports.insertRjOnlineVar=insertRjOnlineVar;
exports.getRjOnineVar_BybdDev_id=getRjOnineVar_BybdDev_id;
exports.rjLinkVarSetAllUnUse=rjLinkVarSetAllUnUse;
exports.getRjEmptyLinkVar=getRjEmptyLinkVar;
exports.updateRjOnlineVar=updateRjOnlineVar;
// Rj Scene 
exports.insertRjScene=insertRjScene;
exports.getRjScene_BybdDev_id=getRjScene_BybdDev_id;
exports.getRjScene_BybdDev_id_orderSortIdx=getRjScene_BybdDev_id_orderSortIdx;
exports.updateRjScene=updateRjScene;
exports.updateRjSceneSortIdx=updateRjSceneSortIdx;
exports.deleteScene_unUse=deleteScene_unUse;
// RJ Rules
exports.insertRjRule=insertRjRule;
exports.getRjRules_bdDevId_sceneIdx_inUse=getRjRules_bdDevId_sceneIdx_inUse;
exports.getRjEmptyRule=getRjEmptyRule;
exports.updateRjRule=updateRjRule;
exports.rulesSetAllUnUse=rulesSetAllUnUse;
// RJ condis
exports.insertRjCondi=insertRjCondi;
exports.getRjCondis_bdDevId_sceneIdx_inUse=getRjCondis_bdDevId_sceneIdx_inUse;
exports.getRjEmptyCondis=getRjEmptyCondis;
exports.updateRjCondi=updateRjCondi;
exports.condiSetAllUnUse=condiSetAllUnUse;
// Rj schedule record
exports.insertRjSchedule=insertRjSchedule;
exports.getRjSchedule_byRjBdDev_id=getRjSchedule_byRjBdDev_id;
exports.getRjEmptyRjSchedule=getRjEmptyRjSchedule;
exports.rjScheduleSetAllUnUse=rjScheduleSetAllUnUse;
exports.updateRjSchedule=updateRjSchedule;
// RJ Ac Brand
exports.getRjAcBrands=getRjAcBrands;