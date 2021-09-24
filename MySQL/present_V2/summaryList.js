const { insertTemplate, queryTemplate } = require("../queryData");

const db = "V2_BuildingRecord";
const tableName = "V2_DevSummaryList";


async function getSumlistBy_Bd_Id (Info){
    const quertCmd = `SELECT * from ${tableName} WHERE Bd_Id = ${Info.Bd_Id}`;
    // console.log(quertCmd);
    try {
        let result = await queryTemplate(db, quertCmd, "getSumlistBy_Bd_Id Finally");
        if(!result[0]) return [];     // return empty array
        const rtnResult = result.map(b=>b);
        return rtnResult;        
    } catch (ex) {
        console.log(ex.message)
        return [];       // return empty array
    }
}

exports.getSumlistBy_Bd_Id = getSumlistBy_Bd_Id;