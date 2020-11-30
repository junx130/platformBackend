const { insertTemplate, queryTemplate } = require("../queryData");

const db = "Notification";
const tableName = "NotificationList"

async function getNotifyListById(type, bdDev_id){
    const quertCmd = `SELECT * from ${tableName} where type=${type} and bdDev_id=${bdDev_id}`;
    
    try {
        let result = await queryTemplate(db, quertCmd, "Notification List Done");
        if(!result[0]) return null;     // no building in list
        const notifyList = result.map(b=>b);
        return notifyList;        
    } catch (ex) {
        console.log(ex.message)
        return null;
    }
}

exports.getNotifyListById = getNotifyListById;