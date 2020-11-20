const { insertTemplate, queryTemplate } = require("../queryData");


const settingDatabase = "GraphPara";
const tableName = "LineList";

async function insert(body){
    const sqlMCmd = `        
        CREATE TABLE IF NOT EXISTS ${tableName}(	
            _id int NOT NULL AUTO_INCREMENT,
            timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP(),
            unix INT(11) NOT NULL, 
            type SMALLINT NOT NULL,  
            bdDev_id INT NOT NULL,  
            name varchar(80) NOT NULL,
            scaleTop float not null,
            scaleBottom float not null,
            upperLimit float,
            lowerLimit float,
            dataKey varchar(80),
            dataUnit varchar(80),
            userID int not null,
            userAmmend varchar(80),
            PRIMARY KEY (_id)
    )`;

    const insertBuilding = `INSERT INTO ${tableName}(unix, type, bdDev_id, name, scaleTop, scaleBottom, upperLimit, lowerLimit , dataKey, dataUnit, userID, userAmmend)
    VALUES (UNIX_TIMESTAMP(), "${body.type}", "${body.bdDev_id}", "${body.name}", ${body.scaleTop}, ${body.scaleBottom}, ${body.upperLimit}, ${body.lowerLimit}, "${body.dataKey}", "${body.dataUnit}", ${body.userID}, "${body.userAmmend}")`;

    let result = await insertTemplate(settingDatabase, sqlMCmd, insertBuilding, "Inser New Line List");
    // console.log("Insert result: ", result);
    return result;    
}

async function getByTy_bdDevID_userID(data){
    const quertCmd = `SELECT * from ${tableName} WHERE type = ${data.type} AND bdDev_id = ${data.bdDev_id} AND userID = ${data.userID}`;
    
    try {
        let result = await queryTemplate(settingDatabase, quertCmd, "Get Line List Done");
        if(!result[0]) return null;     // no building in list
        const buildings = result.map(b=>b);
        return buildings;        
    } catch (ex) {
        console.log(ex.message)
        return null;
    }
}

async function getByAccountID(data){
    const quertCmd = `SELECT * from ${tableName} WHERE bdDev_id = ${data.bdDev_id} AND userID = ${data.userID}`;
    
    try {
        let result = await queryTemplate(settingDatabase, quertCmd, "Get Line List Done");
        if(!result[0]) return null;     // no building in list
        const buildings = result.map(b=>b);
        return buildings;        
    } catch (ex) {
        console.log(ex.message)
        return null;
    }
}

exports.getLineListByAccountID=getByAccountID;
exports.getLineListByTy_bdDevID_userID=getByTy_bdDevID_userID;
exports.insertLineList=insert;
