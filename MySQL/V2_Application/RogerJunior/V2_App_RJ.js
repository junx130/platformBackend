const { insertTemplate, queryTemplate } = require("../../queryData");

const db = "V2_Application";
const rjOnlineVarTable = "RJ_OnlineVar";
const rjSceneTable = "RJ_AdvCtrlScene";
const rjRulesTable = "RJ_AdvCtrlRules";
const rjCondiTable = "RJ_AdvCtrlCondi";

// online var
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

// RJ Scene 
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

// RJ Rules
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

// online var
exports.getRjOnineVar_BybdDev_id=getRjOnineVar_BybdDev_id;
// Rj Scene 
exports.getRjScene_BybdDev_id=getRjScene_BybdDev_id;
// RJ Rules
exports.getRjRules_bdDevId_sceneIdx_inUse=getRjRules_bdDevId_sceneIdx_inUse;
// RJ condis
exports.getRjCondis_bdDevId_sceneIdx_inUse=getRjCondis_bdDevId_sceneIdx_inUse;