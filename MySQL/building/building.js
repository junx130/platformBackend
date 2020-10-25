const Joi = require("joi");
const { insertTemplate, queryTemplate } = require("../queryData");


// api to insert new buildings

const settingDatabase = "AploudSetting";
const tableName = "BuildingList";

// function validateInsertNew(building){
//     const schema = {        
//         owner: Joi.string().min(3).max(80).required(),        
//         building: Joi.string().min(3).max(80).required(),
//         country: Joi.string().min(3).max(80).required(),
//         state: Joi.string().min(3).max(80).required(),
//         area: Joi.string().min(3).max(80).required(),
//         postcode: Joi.number().required(),
//         // accessLevel: Joi.number().required(),
//         // accessLevel: Joi.number(),
//         // active: Joi.number(),
//         // teleID: Joi.number(),
//     }
//     return Joi.validate(building, schema);
// }

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
        postcode int NOT NULL,
        accessLevel int NOT NULL DEFAULT 10,
        PRIMARY KEY (_id)
    )`;

    const insertBuilding = `INSERT INTO ${tableName}(unix, owner, building, country, state, area, postcode) 
    VALUES (UNIX_TIMESTAMP(), "${building.owner}", "${building.building}", "${building.country}", "${building.state}", "${building.area}", "${building.postcode}")`;

    await insertTemplate(settingDatabase, createTable, insertBuilding, "InsertNewBuildingFinally")
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

async function updateBuilding(userAccessLevel){

}

exports.updateBuilding=updateBuilding;
exports.getBuildings=getBuildings;
exports.insertNewBuilding = insertNewBuilding;