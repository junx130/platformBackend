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


exports.get_V1_ctrlOvvAreaInBd_ctrlPg=get_V1_ctrlOvvAreaInBd_ctrlPg;
exports.get_V1_ctrlOvvDevInBd_ctrlPg=get_V1_ctrlOvvDevInBd_ctrlPg;
exports.get_V1_ctrlGwPair=get_V1_ctrlGwPair;