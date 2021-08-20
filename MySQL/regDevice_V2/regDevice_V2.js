const { insertTemplate, queryTemplate } = require("../queryData");

const db = "DevMgnt_V2";
const tableName = "BdDevOwnerList";



async function regBdDev_V2(device) {
    const createTable = `CREATE TABLE IF NOT EXISTS ${tableName}(	
        _id int NOT NULL AUTO_INCREMENT,
        timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        unix INT(11) NOT NULL,
        devID INT NOT NULL,
        bdDev_id INT NOT NULL,
        displayName varchar(40),
        type INT NOT NULL,
        owner_Id INT NOT NULL,
        secOwner_id INT,
        accessLevel TINYINT default 1,
        PRIMARY KEY (_id)
   );`;

   if(!device.displayName) device.displayName = '';
   if(!device.secOwner_id) device.secOwner_id = null;

    // const insertBuilding = `INSERT INTO kittyMeow(unix, owner, building, country, state, area, postcode, userAmmend) 
    const insertBuilding = `INSERT INTO ${tableName}(unix, devID, bdDev_id, displayName, type, owner_Id, secOwner_id, accessLevel)
    VALUES (UNIX_TIMESTAMP(), 
    ${device.devID},     
    ${device.bdDev_id}, 
    "${device.displayName}", 
    ${device.type}, 
    ${device.owner_Id}, 
    ${device.secOwner_id}, 
    ${device.accessLevel}
    )`;

    let result = await insertTemplate(db, createTable, insertBuilding, "regBdDev_V2 Finally ");
    // console.log("Insert result: ", result);
    return result;    
}


async function checkBeenRegistered(Info){
    const quertCmd = `SELECT * from ${tableName} WHERE secOwner_id is NULL AND bdDev_id = ${Info.bdDev_id}`;
    // console.log(quertCmd);
    try {
        let result = await queryTemplate(db, quertCmd, "getInvolveBdDev Finally");
        if(!result[0]) return [];     // return empty array
        const rtnResult = result.map(b=>b);
        return rtnResult;        
    } catch (ex) {
        console.log(ex.message)
        return [];       // return empty array
    }
}

async function getInvolveBdDev_2(Info){
    const quertCmd = `SELECT * from ${tableName} WHERE secOwner_id = ${Info.owner_Id}`;
    // console.log(quertCmd);
    try {
        let result = await queryTemplate(db, quertCmd, "getInvolveBdDev Finally");
        if(!result[0]) return [];     // return empty array
        const rtnResult = result.map(b=>b);
        return rtnResult;        
    } catch (ex) {
        console.log(ex.message)
        return [];       // return empty array
    }
}

async function getOwnDev_2(Info){
    const quertCmd = `SELECT * from ${tableName} WHERE owner_Id = ${Info.owner_Id} AND secOwner_id is NULL`;
    // console.log(quertCmd);
    try {
        let result = await queryTemplate(db, quertCmd, "getInvolveBdDev Finally");
        if(!result[0]) return [];     // return empty array
        const rtnResult = result.map(b=>b);
        return rtnResult;        
    } catch (ex) {
        console.log(ex.message)
        return [];       // return empty array
    }
}


exports.getOwnDev_2 = getOwnDev_2;
exports.checkBeenRegistered = checkBeenRegistered;
exports.regBdDev_V2 = regBdDev_V2;
exports.getInvolveBdDev_2 = getInvolveBdDev_2;
