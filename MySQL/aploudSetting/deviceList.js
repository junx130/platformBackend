// const Joi = require("joi");
const { insertTemplate, queryTemplate } = require("../queryData");


// api to insert new buildings

const settingDatabase = "AploudSetting";
const tableName = "DevicesList";


async function registerNewDevice(device) {
    const createTable = `CREATE TABLE IF NOT EXISTS ${tableName}(		
        _id int NOT NULL AUTO_INCREMENT,
        timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        unix INT(11) NOT NULL, 
        type SMALLINT NOT NULL,  
        devID INT NOT NULL,  
        battConst INT,  
        sleepAmp decimal(20,3),  
        SimNumber varchar(20),
        buildingID INT,
        userAmmend varchar(80),
        PRIMARY KEY (_id)
    )`;

    // const insertBuilding = `INSERT INTO kittyMeow(unix, owner, building, country, state, area, postcode, userAmmend) 
    const insertBuilding = `INSERT INTO ${tableName}(unix, type, devID, battConst, sleepAmp, SimNumber, buildingID, userAmmend) 
    VALUES (UNIX_TIMESTAMP(), ${device.type}, ${device.devID}, ${device.battConst}, ${device.sleepAmp}, "${device.SimNumber}", ${device.buildingID}, ${device.userAmmend})`;

    let result = await insertTemplate(settingDatabase, createTable, insertBuilding, "RegisterNewDeviceFinally");
    // console.log("Insert result: ", result);
    return result;
    
}

async function getDevicesList(){
    const quertCmd = `SELECT * from ${tableName}`;
    
    try {
        let result = await queryTemplate(settingDatabase, quertCmd, "Get Devices List Done");
        if(!result[0]) return null;     // no building in list
        const buildings = result.map(b=>b);
        return buildings;        
    } catch (ex) {
        console.log(ex.message)
        return null;
    }
}


async function getDevicesFromList(data){
    const quertCmd = `SELECT * from ${tableName} WHERE type = ${data.type} AND devID = ${data.devID}`;
    
    try {
        let result = await queryTemplate(settingDatabase, quertCmd, "Get Device Done");
        if(!result[0]) return null;     // no building in list
        const buildings = result.map(b=>b);
        return buildings;        
    } catch (ex) {
        console.log(ex.message)
        return null;
    }
}

async function updateDevicesList(data){
     
    const quertCmd = `UPDATE ${tableName} SET timestamp = CURRENT_TIMESTAMP(),
    unix = UNIX_TIMESTAMP(), battConst = ${data.battConst},
    sleepAmp = ${data.sleepAmp}, SimNumber = "${data.SimNumber}",
    buildingID = ${data.buildingID},userAmmend = "${data.userAmmend}"
    where _id = ${data._id}`;

    try {
        let result = await queryTemplate(settingDatabase, quertCmd, "Update Devices List Finally");
        // console.log("Update: ", result.affectedRows);        
        return result;        
    } catch (ex) {
        console.log(ex.message)
        return null;
    }
}

exports.updateDevicesList=updateDevicesList;
exports.getDevicesFromList=getDevicesFromList;
exports.getDevicesList=getDevicesList;
exports.registerNewDevice=registerNewDevice;
// exports.updateBuilding=updateBuilding;
// exports.getBuildings=getBuildings;
// exports.getBuildingsByBuildingName=getBuildingsByBuildingName;
// exports.insertNewBuilding = insertNewBuilding;