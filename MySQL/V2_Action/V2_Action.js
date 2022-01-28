const { insertTemplate, queryTemplate } = require("../queryData");

const db = "V2_Action";

const ActionTable = "V2_ActionTable";
const Act_TeleTable = "V2_Act_Tele";
const Act_Tele_SubTable = "V2_Act_Tele_Sub";


async function getActiveActionByAlgo_id (algo_id){
    let fnName = "getActiveActionByAlgo_id";
    try {        
        const quertCmd = `SELECT * from ${ActionTable} WHERE algo_id = ${algo_id} and inUse=1`;
        // console.log(quertCmd);
        let result = await queryTemplate(db, quertCmd, `${fnName} Finally`);
        // console.log(result);
        if(!result[0]) return [];     // return empty array
        const rtnResult = result.map(b=>b);
        return rtnResult;       
    } catch (error) {
        console.log(`Error : ${fnName}`);
        console.log(error.message)
        return null;       
    }
}


async function getActiveActTeleByAct_id (act_id){
    let fnName = "getActTeleByAct_id";
    try {        
        const quertCmd = `SELECT * from ${Act_TeleTable} WHERE _id = ${act_id} and inUse=1`;
        // console.log(quertCmd);
        let result = await queryTemplate(db, quertCmd, `${fnName} Finally`);
        // console.log(result);
        if(!result[0]) return [];     // return empty array
        const rtnResult = result.map(b=>b);
        return rtnResult;       
    } catch (error) {
        console.log(`Error : ${fnName}`);
        console.log(error.message)
        return null;       
    }
}

async function getActiveActTeleSubByAct_id (act_tele_id){
    let fnName = "getActiveActTeleSubByAct_id";
    try {        
        const quertCmd = `SELECT * from ${Act_Tele_SubTable} WHERE act_tele_id = ${act_tele_id} and inUse=1`;
        // console.log(quertCmd);
        let result = await queryTemplate(db, quertCmd, `${fnName} Finally`);
        // console.log(result);
        if(!result[0]) return [];     // return empty array
        const rtnResult = result.map(b=>b);
        return rtnResult;       
    } catch (error) {
        console.log(`Error : ${fnName}`);
        console.log(error.message)
        return null;       
    }
}

exports.getActiveActionByAlgo_id=getActiveActionByAlgo_id;
exports.getActiveActTeleByAct_id=getActiveActTeleByAct_id;
exports.getActiveActTeleSubByAct_id=getActiveActTeleSubByAct_id;