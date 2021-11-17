const { insertTemplate, queryTemplate } = require("../queryData");

const db = "V2_DeviceRecord";

const BattTable = "V2_bdDevSetting_Batt";
const OvvParaTable = 'V2_bdDevSetting_OvvPara';
const ParaTable = 'V2_bdDevSetting_Para';

/**----------- get display para list ---------- */
async function getV2OvvParaList (user_id, bdDev_id){
    try {
        const quertCmd = `SELECT * from ${OvvParaTable} WHERE user_id = ${user_id} and bdDev_id = ${bdDev_id}`;
        // console.log(quertCmd);
        let result = await queryTemplate(db, quertCmd, "getOvvParaList Finally");
        // console.log(result);
        if(!result[0]) return [];     // return empty array
        const rtnResult = result.map(b=>b);
        return rtnResult;       
    } catch (error) {
        console.log(error.message)
        return null;       
    }
}


/** ------------- get batt list-----------------*/
async function getV2BattList (bdDev_id){
    try {
        const quertCmd = `SELECT * from ${BattTable} WHERE bdDev_id = ${bdDev_id}`;
        // console.log(quertCmd);
        let result = await queryTemplate(db, quertCmd, "getV2BattList Finally");
        // console.log(result);
        if(!result[0]) return [];     // return empty array
        const rtnResult = result.map(b=>b);
        return rtnResult;       
    } catch (error) {
        console.log(error.message)
        return null;       
    }
}


exports.getV2OvvParaList=getV2OvvParaList;
exports.getV2BattList=getV2BattList;
