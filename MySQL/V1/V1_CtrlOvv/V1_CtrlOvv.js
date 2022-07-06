const { insertTemplate, queryTemplate } = require("../../queryData");

const db = "V1_Control";
const ctrlOvvAreaTable = "V1_CtrlOvvArea";
const ctrlOvvDevTable = "V1_CtrlOvvDev";

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


exports.get_V1_ctrlOvvAreaInBd_ctrlPg=get_V1_ctrlOvvAreaInBd_ctrlPg;
exports.get_V1_ctrlOvvDevInBd_ctrlPg=get_V1_ctrlOvvDevInBd_ctrlPg;