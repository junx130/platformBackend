const { insertTemplate, queryTemplate } = require("../queryData");



const db = "RawDataLog";
const tableName = "RawOffset"


async function getOffsetByIdnKey(obj){
    const quertCmd = `SELECT * from ${tableName} where type = ${obj.type} and devID = ${obj.devID} and DataKey = ${obj.DataKey}`;
    console.log(quertCmd);
    
    try {
        let result = await queryTemplate(db, quertCmd, "Get Offset Done");
        if(!result[0]) return [];     // no building in list
        console.log(result);
        const offsetList = result.map(b=>b);
        return offsetList;        
    } catch (ex) {
        console.log(ex.message)
        return [];
        // return null;
    }
}


exports.getOffsetByIdnKey=getOffsetByIdnKey;