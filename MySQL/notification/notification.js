const { insertTemplate, queryTemplate } = require("../queryData");

const db = "Notification";
const tableName = "NotificationList"

async function getNotifyListById(a_BdDevID){
    if(!a_BdDevID[0]) return [];
    let sArrayDev = a_BdDevID.join(",");
    const quertCmd = `SELECT * from ${tableName} where bdDev_id in (${sArrayDev})`;
    console.log(quertCmd);
    
    try {
        let result = await queryTemplate(db, quertCmd, "Notification List Done");
        if(!result[0]) return [];     // no building in list
        const notifyList = result.map(b=>b);
        return notifyList;        
    } catch (ex) {
        console.log(ex.message)
        return null;
    }
}

async function getNotifyListByIdnType(type, bdDev_id){
    // if(!a_BdDevID[0]) return ;
    // let sArrayDev = a_BdDevID.join(",");
    const quertCmd = `SELECT * from ${tableName} where type = ${type} and bdDev_id = ${bdDev_id}`;
    console.log(quertCmd);
    
    try {
        let result = await queryTemplate(db, quertCmd, "Notification List Done");
        if(!result[0]) return [];     // no building in list
        const notifyList = result.map(b=>b);
        return notifyList;        
    } catch (ex) {
        console.log(ex.message)
        return [];
        // return null;
    }
}

async function updateNotifiedUnix(_id, newUnix){
    const quertCmd = `UPDATE ${tableName} SET NotifiedUnix = ${newUnix} where _id = ${_id}`;

    try {
        let result = await queryTemplate(db, quertCmd, "Update NotifiedUnix Finally");
        // console.log("Update: ", result.affectedRows);        
        return result;        
    } catch (ex) {
        console.log(ex.message)
        return null;
    }
}

exports.updateNotifiedUnix=updateNotifiedUnix;
exports.getNotifyListById = getNotifyListById;
exports.getNotifyListByIdnType=getNotifyListByIdnType;