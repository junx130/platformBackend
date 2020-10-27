const Joi = require("joi");
const { insertTemplate, queryTemplate } = require("../queryData");


// api to insert new buildings

const settingDatabase = "AploudSetting";
const tableName = "BuildingList";


async function insertNewBuilding(building) {
    const createTable = `CREATE TABLE IF NOT EXISTS ${tableName}(		
        _id int NOT NULL AUTO_INCREMENT,
        timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        unix INT(11) NOT NULL, 
        owner varchar(80) NOT NULL,
        building varchar(80) NOT NULL,
        country varchar(80) NOT NULL,
        state varchar(80) NOT NULL,
        area varchar(80) NOT NULL,
        postcode varchar(10) NOT NULL,
        accessLevel int NOT NULL DEFAULT 10,
        userAmmend varchar(80),
        PRIMARY KEY (_id)
    )`;

    // const insertBuilding = `INSERT INTO kittyMeow(unix, owner, building, country, state, area, postcode, userAmmend) 
    const insertBuilding = `INSERT INTO ${tableName}(unix, owner, building, country, state, area, postcode, userAmmend) 
    VALUES (UNIX_TIMESTAMP(), "${building.owner}", "${building.building}", "${building.country}", "${building.state}", "${building.area}", "${building.postcode}", "${building.userAmmend}")`;

    let result = await insertTemplate(settingDatabase, createTable, insertBuilding, "InsertNewBuildingFinally");
    // console.log("Insert result: ", result);
    return result;
    
}

async function getBuildings(userAccessLevel){
    const quertCmd = `SELECT * from ${tableName} WHERE accessLevel > ${userAccessLevel}`;
    
    try {
        let result = await queryTemplate(settingDatabase, quertCmd, "Get Building Done");
        if(!result[0]) return null;     // no building in list
        const buildings = result.map(b=>b);
        return buildings;        
    } catch (ex) {
        console.log(ex.message)
        return null;
    }
}


async function getBuildingsByBuildingName(building){
    const quertCmd = `SELECT * from ${tableName} WHERE building = "${building.building}" AND owner = "${building.owner}"`;
    
    try {
        let result = await queryTemplate(settingDatabase, quertCmd, "Get Building Done");
        if(!result[0]) return null;     // no building in list
        const buildings = result.map(b=>b);
        return buildings;        
    } catch (ex) {
        console.log(ex.message)
        return null;
    }
}

async function updateBuilding(building){
     
    const quertCmd = `UPDATE ${tableName} SET timestamp = CURRENT_TIMESTAMP(),
    unix = UNIX_TIMESTAMP(), owner = "${building.owner}",
    building = "${building.building}", country = "${building.country}",
    state = "${building.state}",area = "${building.area}", 
    postcode = "${building.postcode}", userAmmend = "${building.userAmmend}"
    where _id = ${building._id}`;

    try {
        let result = await queryTemplate(settingDatabase, quertCmd, "Update Building Finally");
        // console.log("Update: ", result.affectedRows);        
        return result;        
    } catch (ex) {
        console.log(ex.message)
        return null;
    }
}

exports.updateBuilding=updateBuilding;
exports.getBuildings=getBuildings;
exports.getBuildingsByBuildingName=getBuildingsByBuildingName;
exports.insertNewBuilding = insertNewBuilding;