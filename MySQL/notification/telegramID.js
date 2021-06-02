const { insertTemplate, queryTemplate } = require("../queryData");


const db = "Notification";
const tableName = "TelegramID"

async function getAllTelegramID(){
    const quertCmd = `SELECT * from ${tableName}`;    
    try {
        let result = await queryTemplate(db, quertCmd, "Get All TelegramID Done");
        if(!result[0]) return null;     // no building in list
        return result.map(b=>b);
    } catch (ex) {
        console.log(ex.message)
        return null;
    }
}


async function addTelegramID(device){    
    const createTable = `CREATE TABLE IF NOT EXISTS ${tableName}(		
        _id int NOT NULL AUTO_INCREMENT,
        timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        unix INT(11) NOT NULL,
        name varchar(80),
        userID int not null,
        bd_id INT NOT NULL,
        telegramID varchar(80),
        userAmmend varchar(80),
        PRIMARY KEY (_id)
    )`;

    // const insertBuilding = `INSERT INTO kittyMeow(unix, owner, building, country, state, area, postcode, userAmmend) 
    const queryCmd = `INSERT INTO ${tableName}(unix, name, userID, bd_id, telegramID, userAmmend)
    VALUES (UNIX_TIMESTAMP(), "${device.name}", ${device.userID}, ${device.bd_id}, "${device.telegramID}", "${device.userAmmend}")`;

    try {
        let result = await insertTemplate(db, createTable, queryCmd, "Register Telegram ID succesful");
        return result;        
    } catch (error) {
        console.log(error.message)
        return null;
    }
    // console.log("Insert result: ", result);
}

async function delTelegramID(info){    
    // console.log(info);
    const queryCmd = `DELETE from ${tableName} where _id = ${info._id}`;
    
    try {
        let result = await queryTemplate(db, queryCmd, "Delete Telegram ID Finally");
        // console.log("Update: ", result.affectedRows);        
        return result;        
    } catch (ex) {
        console.log(ex.message)
        return null;
    }
}

async function getTelegramListById(userID, bd_id){
    // const quertCmd = `SELECT * from ${tableName} where bd_id=${bd_id}`;
    let quertCmd = `SELECT * from ${tableName} where userID in (${userID}) and bd_id in (0,${bd_id})`;
    // if(userID==0 && bd_id==0) `SELECT * from ${tableName}`;
    // else if(bd_id===0) quertCmd = `SELECT * from ${tableName} where userID=${userID}`;
    // if(userID!=0) quertCmd = `SELECT * from ${tableName} where userID in (0,${userID}) and bd_id in (0,${bd_id})`;

    // console.log(quertCmd);
    
    try {
        let result = await queryTemplate(db, quertCmd, "Get TelegramID Done");
        if(!result[0]) return [];     // no building in list
        return result.map(b=>b);
    } catch (ex) {
        console.log(ex.message)
        return [];
    }
}

async function updateTelegramID(data){
    const quertCmd = `UPDATE ${tableName} SET timestamp = CURRENT_TIMESTAMP(),
    unix = UNIX_TIMESTAMP(), name = "${data.name}",
    userID = ${data.userID}, bd_id = ${data.bd_id}, 
    telegramID = ${data.telegramID}, userAmmend = "${data.userAmmend}"    
    where _id = ${data._id}`;
    
    try {
        let result = await queryTemplate(db, quertCmd, "Telegram ID Update Finally");
        // console.log("Update: ", result.affectedRows);        
        return result;        
    } catch (ex) {
        console.log(ex.message)
        return null;
    }
}

exports.delTelegramID=delTelegramID;
exports.addTelegramID=addTelegramID;
exports.updateTelegramID = updateTelegramID;
exports.getAllTelegramID=getAllTelegramID;
exports.getTelegramListById = getTelegramListById;