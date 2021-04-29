const { insertTemplate, queryTemplate } = require("../queryData");

const db = "ControlDevice";
const tableName = "FeedbackValueMap";


async function getPidMap(Info){
    const quertCmd = `SELECT * from ${tableName} WHERE fbNodeType = ${Info.type} and fbBdDev_id = ${Info._id}`;

    // console.log(quertCmd);
    try {
        let result = await queryTemplate(db, quertCmd, "Get PID Map Done");
        if(!result[0]) return [];     // return empty array
        const rtnResult = result.map(b=>b);
        return rtnResult;        
    } catch (ex) {
        console.log(ex.message)
        return [];       // return empty array
    }
}


exports.getPidMap =getPidMap;