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


/**Update Mon List */
async function updateOrInsertPidMap(data){     
    const quertCmd = `UPDATE ${tableName_List} SET timestamp = CURRENT_TIMESTAMP(),
    unix = UNIX_TIMESTAMP(),  
    name = "${data.name}", buildingID = ${data.buildingID}, 
    SortIndex = ${data.SortIndex}, userAmmend = "${data.userAmmend}"    
    where _id = ${data._id}`;

    try {
        let result = await queryTemplate(db, quertCmd, "Update PID map Finally");
        // console.log("Update: ", result.affectedRows);        
        return result;        
    } catch (ex) {
        console.log(ex.message)
        return null;
    }
}

exports.updateOrInsertPidMap=updateOrInsertPidMap;
exports.getPidMap =getPidMap;