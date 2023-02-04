const { insertTemplate, queryTemplate } = require("../../queryData");

const db = "V2_Application";
const rjOnlineVarTable = "RJ_OnlineVar";

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

exports.getRjOnineVar_BybdDev_id=getRjOnineVar_BybdDev_id;