const { insertTemplate, queryTemplate } = require("../queryData");

const db = "V2_Reaction";

const AlgoTable = "V2_ReactTrigAlgo";

/**----------- get display para list ---------- */
async function getAlgoBy_bdDev_id (bdDev_id){
    try {
        const quertCmd = `SELECT * from ${AlgoTable} WHERE bdDevInvolve like "%,${bdDev_id},%"`;
        // select * from V2_ReactTrigAlgo where bdDevInvolve like "%,6,%";
        console.log(quertCmd);
        let result = await queryTemplate(db, quertCmd, "getAlgoBy_bdDev_id Finally");
        // console.log(result);
        if(!result[0]) return [];     // return empty array
        const rtnResult = result.map(b=>b);
        return rtnResult;       
    } catch (error) {
        console.log(error.message)
        return null;       
    }
}

exports.getAlgoBy_bdDev_id = getAlgoBy_bdDev_id;