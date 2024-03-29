// const Joi = require("joi");
const { insertTemplate, queryTemplate } = require("../queryData");


const settingDatabase = "Buildings";
const tableName = "BuildingDevices";


async function registerBuildingDevice(device) {
    const createTable = `CREATE TABLE IF NOT EXISTS ${tableName}(		
        _id int NOT NULL AUTO_INCREMENT,
        timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        unix INT(11) NOT NULL, 
        type SMALLINT NOT NULL,  
        devID INT,  
        buildingID INT NOT NULL,
        location varchar(80),
        name varchar(80),
        remarks varchar(80) NOT NULL,
        active TINYINT default(1),
        userAmmend varchar(80),
        PRIMARY KEY (_id)
    )`;

    // const insertBuilding = `INSERT INTO kittyMeow(unix, owner, building, country, state, area, postcode, userAmmend) 
    const insertBuilding = `INSERT INTO ${tableName}(unix, type, devID, buildingID, location, name, remarks, active, userAmmend)
    VALUES (UNIX_TIMESTAMP(), ${device.type}, ${device.devID}, ${device.buildingID}, "${device.location}", "${device.name}", "${device.remarks}", ${device.active}, "${device.userAmmend}")`;

    let result = await insertTemplate(settingDatabase, createTable, insertBuilding, "RegisterBuildingDeviceFinally");
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
    // console.log(quertCmd);
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

async function getBuildingDevice_by_idList(a_list){
    // select * from BuildingDevices where _id in (1,2,3);
    let _idList = [...a_list];
    // for (const item of a_list) {
    //     _idList.push(item._id);
    // }
    // let s_idList = _idList.toString();
    const quertCmd = `SELECT * from ${tableName} WHERE _id in (${_idList.toString()})`;
    // console.log(quertCmd);
    try {
        let result = await queryTemplate(settingDatabase, quertCmd, "Get Building Device By List Done");
        if(!result[0]) return null;     // no building in list
        const buildings = result.map(b=>b);
        return buildings;        
    } catch (ex) {
        console.log(ex.message)
        return null;
    }
}

async function getBuildingDevicesBy_ID(_id){
    const quertCmd = `SELECT * from ${tableName} WHERE _id = ${_id}`;
    
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

async function updateBuildingDevices(data){     
    const quertCmd = `UPDATE ${tableName} SET timestamp = CURRENT_TIMESTAMP(),
    unix = UNIX_TIMESTAMP(),  
    type = ${data.type}, devID = ${data.devID}, 
    buildingID = ${data.buildingID}, location = "${data.location}", 
    name = "${data.name}", remarks = "${data.remarks}", 
    active = ${data.active}, userAmmend = "${data.userAmmend}"    
    where _id = ${data._id}`;

    try {
        let result = await queryTemplate(settingDatabase, quertCmd, "Building Device Update Finally");
        // console.log("Update: ", result.affectedRows);        
        return result;        
    } catch (ex) {
        console.log(ex.message)
        return null;
    }
}

async function deleteBdDevice(info){
    // console.log(info);
    const quertCmd = `DELETE from ${tableName} where _id = ${info._id}`;
    
    try {
        let result = await queryTemplate(settingDatabase, quertCmd, "Delete Building Device Finally");
        // console.log("Update: ", result.affectedRows);        
        return result;        
    } catch (ex) {
        console.log(ex.message)
        return null;
    }
}

exports.getBuildingDevice_by_idList=getBuildingDevice_by_idList;
exports.getBuildingDevicesBy_ID=getBuildingDevicesBy_ID;
exports.deleteBdDevice=deleteBdDevice;
exports.updateBuildingDevices=updateBuildingDevices;
exports.registerBuildingDevice=registerBuildingDevice;
exports.setIdleBuildingDevices=setIdleBuildingDevices;
exports.getBuildingDevicesByTypeID=getBuildingDevicesByTypeID;
exports.getBuildingDevicesList=getBuildingDevicesList;
// exports.registerNewDevice=registerNewDevice;