const { insertTemplate, queryTemplate } = require("../queryData");

const db = "Notification";
const tableName = "NotificationList"

async function getNotifyListById(a_BdDevID){
    if(!a_BdDevID[0]) return [];
    let sArrayDev = a_BdDevID.join(",");
    const quertCmd = `SELECT * from ${tableName} where bdDev_id in (${sArrayDev})`;
    // console.log(quertCmd);
    
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
    // console.log(quertCmd);
    
    try {
        let result = await queryTemplate(db, quertCmd, "Notification List Done");
        if(!result[0]) return [];     // no building in list
        // console.log("DB Here");
        const notifyList = result.map(b=>b);
        // console.log(notifyList);
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

async function deleteNotifyItem(body){
    // const quertCmd = `UPDATE ${tableName} SET NotifiedUnix = ${newUnix} where _id = ${_id}`;
    const quertCmd = `DELETE from ${tableName} where _id = ${body._id}`;
    try {
        let result = await queryTemplate(db, quertCmd, "Delete Notification List Finally");
        // console.log("Update: ", result.affectedRows);        
        return result;        
    } catch (ex) {
        console.log(ex.message)
        return null;
    }
}

async function updateNotificatonList(body){
    const quertCmd = `UPDATE ${tableName} SET 
    name = "${body.name}", userID = ${body.userID}, 
    type = ${body.type}, bdDev_id = ${body.bdDev_id}, 
    DataKey = "${body.DataKey}", DataUnit = "${body.DataUnit}", 
    UserSetpoint = ${body.UserSetpoint}, AlarmSetpoint = ${body.AlarmSetpoint}, 
    AlarmType = "${body.AlarmType}", StartUnix = ${body.StartUnix}, 
    EndUnix = ${body.EndUnix}, AlarmRepeat = ${body.AlarmRepeat}, 
    NotifiedUnix = null,
    Sensitivity = ${body.Sensitivity}, Active = ${body.Active},  
    userAmmend = "${body.userAmmend}"   
    where _id = ${body._id}`;

    try {
        let result = await queryTemplate(db, quertCmd, "Update NotificationList Finally");
        // console.log("Update: ", result.affectedRows);        
        return result;        
    } catch (ex) {
        console.log(ex.message)
        return null;
    }
}

async function regNotificatonList(body){

    const quertCmd = `INSERT INTO ${tableName}(unix, name, userID, type, bdDev_id, DataKey, DataUnit, UserSetpoint, AlarmSetpoint, AlarmType, StartUnix, EndUnix, AlarmRepeat, Sensitivity, Active, userAmmend)
    VALUES (UNIX_TIMESTAMP(), "${body.name}", ${body.userID}, ${body.type}, "${body.bdDev_id}", "${body.DataKey}", "${body.DataUnit}", "${body.UserSetpoint}", "${body.AlarmSetpoint}", "${body.AlarmType}", "${body.StartUnix}", "${body.EndUnix}", "${body.AlarmRepeat}", "${body.Sensitivity}", "${body.Active}", "${body.userAmmend}")`;


    try {
        let result = await queryTemplate(db, quertCmd, "Reg NotificationList Finally");
        // console.log("Update: ", result.affectedRows);        
        return result;        
    } catch (ex) {
        console.log(ex.message)
        return null;
    }
}

exports.deleteNotifyItem=deleteNotifyItem;
exports.regNotificatonList=regNotificatonList;
exports.updateNotificatonList = updateNotificatonList;
exports.updateNotifiedUnix=updateNotifiedUnix;
exports.getNotifyListById = getNotifyListById;
exports.getNotifyListByIdnType=getNotifyListByIdnType;