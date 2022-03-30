const { insertTemplate, queryTemplate } = require("../queryData");

const db = "ControlDevice";
const tableName = "FeedbackValueMap";


async function insertCtrlDev(device) {
    const createTable = `CREATE TABLE IF NOT EXISTS ${tableName}(		
        _id int NOT NULL AUTO_INCREMENT,
        timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        unix INT(11) NOT NULL, 
        gwID INT NOT NULL,  
        fbNodeType SMALLINT,  
        fbBdDev_id int not null,
        DataKey varchar(80),
        loraFun SMALLINT,
        ctNodeType SMALLINT,  
        ctBdDev_id int not null,
        inUse TINYINT default(1),
        userAmmend varchar(80),
        PRIMARY KEY (_id)
    )`;

    // const insertBuilding = `INSERT INTO kittyMeow(unix, owner, building, country, state, area, postcode, userAmmend) 
    const insertBuilding = `INSERT INTO ${tableName}(unix, gwID, fbNodeType, fbBdDev_id, DataKey, loraFun, ctNodeType, ctBdDev_id, inUse, userAmmend)
    VALUES (UNIX_TIMESTAMP(), 
    ${device.gwID}, 
    ${device.fbNodeType}, 
    ${device.fbBdDev_id}, 
    "${device.DataKey}", 
    ${device.loraFun}, 
    ${device.ctNodeType}, 
    ${device.ctBdDev_id}, 
    ${device.inUse},
    "${device.userAmmend}")`;

    let result = await insertTemplate(db, createTable, insertBuilding, "Insert Ctrl Dev Done");
    // console.log("Insert result: ", result);
    return result;
    
}


async function updateCtrlDev(data){
    const quertCmd = `UPDATE ${tableName} SET timestamp = CURRENT_TIMESTAMP(),
    unix = UNIX_TIMESTAMP(),  
    gwID = ${data.gwID}, fbNodeType = ${data.fbNodeType}, 
    fbBdDev_id = ${data.fbBdDev_id},  DataKey = "${data.DataKey}", 
    loraFun = ${data.loraFun}, ctNodeType = ${data.ctNodeType}, 
    ctBdDev_id = ${data.ctBdDev_id},  inUse = ${data.inUse}, 
    userAmmend = "${data.userAmmend}"    
    where _id = ${data._id}`;

    try {
        let result = await queryTemplate(db, quertCmd, "PID Map Update Finally");
        // console.log("Update: ", result.affectedRows);        
        return result;        
    } catch (ex) {
        console.log(ex.message)
        return null;
    }
}


async function getItemCount(){
    const quertCmd = `SELECT count(*) from ${tableName}`;
    // console.log(quertCmd);
    try {
        let result = await queryTemplate(db, quertCmd, "Get Item Count Done");
        // console.log(result);
        let count = result[0]['count(*)'];
        return count  
    } catch (ex) {
        console.log(ex.message)
        return [];       // return empty array
    }
}

async function getNCtrlDevFromX(Info){      // 
    // console.log(Info);
    const quertCmd = `SELECT * from ${tableName} order by unix desc limit ${Info.x}, ${Info.n}`;
    // console.log(quertCmd);
    try {
        let result = await queryTemplate(db, quertCmd, "Get Ctrl Dev Done");
        if(!result[0]) return [];     // return empty array
        const rtnResult = result.map(b=>b);
        // console.log(rtnResult);
        return rtnResult;        
    } catch (ex) {
        console.log(ex.message)
        return [];       // return empty array
    }
}

async function getCtrlDev(Info){
    const quertCmd = `SELECT * from ${tableName} WHERE ctNodeType = ${Info.ctNodeType} and ctBdDev_id = ${Info.ctBdDev_id}`;
    // console.log(quertCmd);
    try {
        let result = await queryTemplate(db, quertCmd, "Get Ctrl Dev Done");
        if(!result[0]) return [];     // return empty array
        const rtnResult = result.map(b=>b);
        return rtnResult;        
    } catch (ex) {
        console.log(ex.message)
        return [];       // return empty array
    }
}

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

exports.getItemCount=getItemCount;
exports.getNCtrlDevFromX=getNCtrlDevFromX;
exports.insertCtrlDev=insertCtrlDev;
exports.updateCtrlDev=updateCtrlDev;
exports.getCtrlDev=getCtrlDev;
exports.updateOrInsertPidMap=updateOrInsertPidMap;
exports.getPidMap =getPidMap;