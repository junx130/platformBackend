
const { insertTemplate, queryTemplate } = require("../queryData");
// const jwt = require("jsonwebtoken");


const userDatabase = "UserManagement";
const tableName = "AssignBuilding";


async function getOwnerBuildings(userID){
    
    const quertCmd = `SELECT * from ${tableName} where userID=${userID}`;
    
    try {
        let result = await queryTemplate(userDatabase, quertCmd, "Get User's Building List Done");
        if(!result[0]) return null;     // no building in list
        const buildings = result.map(b=>b);
        return buildings;        
    } catch (ex) {
        console.log(ex.message)
        return null;
    }
}


async function insertBuildingOwner(body){
    
    const createTable = `CREATE TABLE IF NOT EXISTS ${tableName}(	
        _id int NOT NULL AUTO_INCREMENT,
        timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP(),
        unix INT(11) NOT NULL, 
        userID int not null,
        buildingID int not null,
        userAmmend varchar(80),
        PRIMARY KEY (_id)
    )`;

    const insertData = `INSERT INTO ${tableName}(unix, userID, buildingID, userAmmend) 
    VALUES (UNIX_TIMESTAMP(), ${body.userID}, ${body.buildingID}, "${body.userAmmend}")`;
    
    let result = await insertTemplate(userDatabase, createTable, insertData, "Grant Authorization Finally");
    return result;
}

async function removeAuthorization(body){
    const quertCmd = `DELETE from ${tableName} where userID = ${body.userID} and buildingID=${body.buildingID}`;
    
    try {
        let result = await queryTemplate(userDatabase, quertCmd, "Remove Authorization Finally");
        // console.log("Update: ", result.affectedRows);        
        return result;        
    } catch (ex) {
        console.log(ex.message)
        return null;
    }
}

exports.getOwnerBuildings=getOwnerBuildings;
exports.removeAuthorization=removeAuthorization;
exports.insertBuildingOwner=insertBuildingOwner;