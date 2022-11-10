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

async function v2GetBdDevData_T1_T2 (type, bdDev_id, T1, T2){
    try {
        // Device_1_10
        let Tb4 = T1;
        let Taft = T2;
        if(Tb4 > Taft){
            Tb4 = T2;
            Taft = T1;
        }
        const quertCmd = `SELECT * from Device_${type}_${bdDev_id} where unix >= ${Tb4} AND unix <= ${Taft} order by unix desc`;
        // select * from Device_1_1 order by unix desc limit 3
        // console.log(quertCmd);
        let result = await queryTemplate(db, quertCmd, "v2GetBdDevData_T1_T2 Finally");
        // console.log(result);
        if(!result[0]) return [];     // return empty array
        const rtnResult = result.map(b=>b);
        return rtnResult;       
    } catch (error) {
        console.log(error.message)
        return null;       
    }
}


async function v2GetBdDevData_lastNMin (type, bdDev_id, nMin){
    try {
        // Device_1_10
        const quertCmd = `SELECT * FROM (SELECT * FROM Device_${type}_${bdDev_id} WHERE timestamp >= now() - INTERVAL ${nMin} MINUTE)Var1 ORDER BY unix DESC ;`
        // const quertCmd = `SELECT * from Device_${type}_${bdDev_id} where unix < ${nMin*60}`;
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

exports.v2GetBdDevData_durationB4Unix=v2GetBdDevData_durationB4Unix;
exports.v2GetBdDevData_lastN =v2GetBdDevData_lastN;
exports.v2GetBdDevData_T1_T2=v2GetBdDevData_T1_T2;
exports.v2GetBdDevData_lastNMin=v2GetBdDevData_lastNMin;
