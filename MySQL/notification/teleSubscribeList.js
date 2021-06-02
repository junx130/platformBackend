const { insertTemplate, queryTemplate } = require("../queryData");

const db = "Notification";
const tableName = "TeleSubscribeList"


async function getTeleSubList(bd_id){
    const quertCmd = `SELECT * from ${tableName} where bd_id = ${bd_id}`;
    try {
        let result = await queryTemplate(db, quertCmd, "getTeleSubList Done");
        if(!result[0]) return [];     // no building in list
        return result.map(b=>b);
    } catch (ex) {
        console.log(ex.message)
        return [];
    }
}


async function insertTeleSubList(body){
    const createTable = `CREATE TABLE IF NOT EXISTS ${tableName}(	
        _id int NOT NULL AUTO_INCREMENT,
        timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        unix INT(11) NOT NULL,
        tele_id INT,
        bd_id INT,
        userAmmend varchar(80),
        PRIMARY KEY (_id)
    )`;

    const queryCmd = `INSERT INTO ${tableName}(unix, tele_id, bd_id, userAmmend)
        VALUES (UNIX_TIMESTAMP(), 
        ${body.tele_id}, 
        ${body.bd_id}, 
        "${body.userAmmend}")`;

    try {
        let result = await insertTemplate(db, createTable, queryCmd, "insertTeleSubList succesful");
        return result;          
    } catch (ex) {
        console.log(ex.message)
        return null;
    }
}
  
async function delTeleSubList(info){    
    // console.log(info);
    const queryCmd = `DELETE from ${tableName} where _id = ${info._id}`;
    
    try {
        let result = await queryTemplate(db, queryCmd, "delTeleSubList Finally");
        // console.log("Update: ", result.affectedRows);        
        return result;        
    } catch (ex) {
        console.log(ex.message)
        return null;
    }
}

async function updateTeleSubList(data){
    const quertCmd = `UPDATE ${tableName} SET timestamp = CURRENT_TIMESTAMP(),
    unix = UNIX_TIMESTAMP(), 
    tele_id = ${data.tele_id}, bd_id = ${data.bd_id}, 
    userAmmend = "${data.userAmmend}"    
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

exports.getTeleSubList=getTeleSubList;
exports.updateTeleSubList=updateTeleSubList;
exports.insertTeleSubList = insertTeleSubList;
exports.delTeleSubList=delTeleSubList;