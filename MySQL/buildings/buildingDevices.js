// const Joi = require("joi");
const { insertTemplate, queryTemplate } = require("../queryData");


// api to insert new buildings

const settingDatabase = "Buildings";
const tableName = "BuildingDevices";


async function registerNewDevice(device) {
    const createTable = `CREATE TABLE IF NOT EXISTS ${tableName}(		
        _id int NOT NULL AUTO_INCREMENT,
        timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        unix INT(11) NOT NULL, 
        type SMALLINT NOT NULL,  
        // devID INT NOT NULL,  
        // battConst INT,  
        // sleepAmp decimal(20,3),  
        // SimNumber varchar(20),
        // buildingID INT,
        PRIMARY KEY (_id)
    )`;

    // const insertBuilding = `INSERT INTO kittyMeow(unix, owner, building, country, state, area, postcode, userAmmend) 
    const insertBuilding = `INSERT INTO ${tableName}(unix, type, devID, battConst, sleepAmp, SimNumber, buildingID) 
    VALUES (UNIX_TIMESTAMP(), ${device.type}, ${device.devID}, ${device.battConst}, ${device.sleepAmp}, "${device.SimNumber}", ${device.buildingID})`;

    let result = await insertTemplate(settingDatabase, createTable, insertBuilding, "RegisterNewDeviceFinally");
    // console.log("Insert result: ", result);
    return result;
    
}

async function getBuildingDevicesList(){
    const quertCmd = `SELECT * from ${tableName}`;
    
    try {
        let result = await queryTemplate(settingDatabase, quertCmd, "Get Building Devices List Done");
        if(!result[0]) return null;     // no building in list
        const buildings = result.map(b=>b);
        return buildings;        
    } catch (ex) {
        console.log(ex.message)
        return null;
    }
}


async function getBuildingDevicesByTypeID(data){
    const quertCmd = `SELECT * from ${tableName} WHERE type = ${data.type} AND devID = ${data.devID}`;
    
    try {
        let result = await queryTemplate(settingDatabase, quertCmd, "Get Building Device Done");
        if(!result[0]) return null;     // no building in list
        const buildings = result.map(b=>b);
        return buildings;        
    } catch (ex) {
        console.log(ex.message)
        return null;
    }
}

async function setIdleBuildingDevices(data){
     
    const quertCmd = `UPDATE ${tableName} SET devID = 0 where _id = ${data._id}`;

    try {
        let result = await queryTemplate(settingDatabase, quertCmd, "Building Device Set Idle Finally");
        // console.log("Update: ", result.affectedRows);        
        return result;        
    } catch (ex) {
        console.log(ex.message)
        return null;
    }
}

exports.setIdleBuildingDevices=setIdleBuildingDevices;
exports.getBuildingDevicesByTypeID=getBuildingDevicesByTypeID;
exports.getBuildingDevicesList=getBuildingDevicesList;
// exports.registerNewDevice=registerNewDevice;