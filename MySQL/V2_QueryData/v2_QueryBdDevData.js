const { insertTemplate, queryTemplate } = require("../queryData");

const db = "V2_DevDataLog";


async function v2GetBdDevData_lastN (type, bdDev_id, nNumber){
    try {
        // Device_1_10
        const quertCmd = `SELECT * from Device_${type}_${bdDev_id} order by unix desc limit ${nNumber}`;
        // select * from Device_1_1 order by unix desc limit 3
        // console.log(quertCmd);
        let result = await queryTemplate(db, quertCmd, "v2GetBdDevData_lastN Finally");
        // console.log(result);
        if(!result[0]) return [];     // return empty array
        const rtnResult = result.map(b=>b);
        return rtnResult;       
    } catch (error) {
        console.log(error.message)
        return null;       
    }
}

async function v2GetBdDevData_durationB4Unix (type, bdDev_id, endUnix, nMin){
    try {
        // Device_1_10
        let startUnix = endUnix - (nMin * 60);
        const quertCmd = `SELECT * from Device_${type}_${bdDev_id} where unix > ${startUnix} and unix < ${endUnix} order by unix desc`;
        // select * from Device_1_1 order by unix desc limit 3
        // console.log(quertCmd);
        let result = await queryTemplate(db, quertCmd, "v2GetBdDevData_durationB4Unix Finally");
        // console.log(result);
        if(!result[0]) return [];     // return empty array
        const rtnResult = result.map(b=>b);
        return rtnResult;       
    } catch (error) {
        console.log(error.message)
        return null;       
    }
}

exports.v2GetBdDevData_durationB4Unix=v2GetBdDevData_durationB4Unix;
exports.v2GetBdDevData_lastN =v2GetBdDevData_lastN;