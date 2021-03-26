const { insertTemplate, queryTemplate } = require("../queryData");


const db = "MonitoringList";


const tableName_List = "MonitorList";


async function regMonList(body){
    const createTable = `CREATE TABLE IF NOT EXISTS MonitorList(	
         _id int NOT NULL AUTO_INCREMENT,
         timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
         unix INT(11) NOT NULL,
         name varchar(80),
         buildingID int not null,
         SortIndex INT NOT NULL,  
         userAmmend varchar(80),
         PRIMARY KEY (_id)
    )`;

    const insertQry = `INSERT INTO ${tableName_List}(unix, name, buildingID, SortIndex, userAmmend)
    VALUES (UNIX_TIMESTAMP(), "${body.name}", ${body.buildingID}, ${body.SortIndex}, "${body.userAmmend}")`;
        console.log(insertQry);
    let result = await insertTemplate(db, createTable, insertQry, "InsertMonListFinally");
    // console.log("Insert result: ", result);
    return result;
}

async function getMonListByBuidlingID(buildingID){
    const quertCmd = `SELECT * from ${tableName_List} WHERE buildingID = ${buildingID}`;
    // console.log(quertCmd);
    try {
        let result = await queryTemplate(db, quertCmd, "Get Mon List Done");
        if(!result[0]) return null;     // no building in list
        const buildings = result.map(b=>b);
        return buildings;        
    } catch (ex) {
        console.log(ex.message)
        return null;
    }
}

/**Update Mon List */
async function updateMonList(data){     
    const quertCmd = `UPDATE ${tableName_List} SET timestamp = CURRENT_TIMESTAMP(),
    unix = UNIX_TIMESTAMP(),  
    name = "${data.name}", buildingID = ${data.buildingID}, 
    SortIndex = ${data.SortIndex}, userAmmend = "${data.userAmmend}"    
    where _id = ${data._id}`;

    try {
        let result = await queryTemplate(db, quertCmd, "Mon List Update Finally");
        // console.log("Update: ", result.affectedRows);        
        return result;        
    } catch (ex) {
        console.log(ex.message)
        return null;
    }
}

/** Delete Mon List */
async function deleteMonList(info){
    const quertCmd = `DELETE from ${tableName_List} where _id = ${info._id}`;

    try {
        let result = await queryTemplate(db, quertCmd, "Delete Mon List Finally");
        // console.log("Update: ", result.affectedRows);        
        return result;        
    } catch (ex) {
        console.log(ex.message)
        return null;
    }
}


/**-----------------------     T1 database     ------------------- */
const tableName_T1List = "T1_list";

async function getT1ListByMonitoList_id(Monitoring_id){
    const quertCmd = `SELECT * from ${tableName_T1List} WHERE MonitorList_id = ${Monitoring_id}`;
    console.log(quertCmd);
    try {
        let result = await queryTemplate(db, quertCmd, "Get T1 List Done");
        if(!result[0]) return null;     // no building in list
        const buildings = result.map(b=>b);
        return buildings;        
    } catch (ex) {
        console.log(ex.message)
        return null;
    }
}

/**     ------------------------   Get element ------------------------ */
const tableName_Element = "MonitoringElement";

async function getElementByMonitoT1_id(T1_id){
    const quertCmd = `SELECT * from ${tableName_Element} WHERE T1_id = ${T1_id}`;
    // console.log(quertCmd);
    try {
        let result = await queryTemplate(db, quertCmd, "Get Element List Done");
        if(!result[0]) return null;     // no building in list
        const buildings = result.map(b=>b);
        return buildings;        
    } catch (ex) {
        console.log(ex.message)
        return null;
    }
}

exports.deleteMonList=deleteMonList;
exports.updateMonList=updateMonList;
exports.getElementByMonitoT1_id=getElementByMonitoT1_id;
exports.getT1ListByMonitoList_id=getT1ListByMonitoList_id;
exports.getMonListByBuidlingID = getMonListByBuidlingID;
exports.regMonList = regMonList;