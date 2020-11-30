const { insertTemplate, queryTemplate } = require("../queryData");


const db = "Notification";
const tableName = "TelegramID"

async function getTelegramListById(userID, bdDev_id){
    const quertCmd = `SELECT * from ${tableName} where userID=${userID} and bdDev_id=${bdDev_id}`;
    
    try {
        let result = await queryTemplate(db, quertCmd, "Get TelegramID Done");
        if(!result[0]) return null;     // no building in list
        const notifyList = result.map(b=>b);
        return notifyList;        
    } catch (ex) {
        console.log(ex.message)
        return null;
    }
}

exports.getTelegramListById = getTelegramListById;