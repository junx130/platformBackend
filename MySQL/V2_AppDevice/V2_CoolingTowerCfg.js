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


exports.getCoolingTowerCfg_bybdDev_id=getCoolingTowerCfg_bybdDev_id;