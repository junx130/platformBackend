const { insertTemplate, queryTemplate } = require("../queryData");

const db = "V2_DeviceRecord";
// const tableName = "V2_SensorOwner";
const tableName = "V2_OwnerList_bdDev";
const buildingTableName = 'V2_OwnerList_bd';
const areaTableName = 'V2_OwnerList_area';


/**----------- Get Building related area ---------- */
async function getAreaInfoBy_id (area_id){
    try {
        const quertCmd = `SELECT * from ${areaTableName} WHERE _id = ${area_id} and active = 1`;
        // console.log(quertCmd);
        let result = await queryTemplate(db, quertCmd, "getAreaInfoBy_id Finally");
        // console.log(result);
        if(!result[0]) return [];     // return empty array
        const rtnResult = result.map(b=>b);
        return rtnResult;       
    } catch (error) {
        console.log(error.message)
        return null;       
    }
}
async function getAreaByOwner_id (owner_id, selectedBuilding){
    try {
        const quertCmd = `SELECT * from ${areaTableName} WHERE owner_id = ${owner_id} and buidling_id=${selectedBuilding} and active = 1`;
        // console.log(quertCmd);
        let result = await queryTemplate(db, quertCmd, "getAreaByOwner_id Finally");
        // console.log(result);
        if(!result[0]) return [];     // return empty array
        const rtnResult = result.map(b=>b);
        return rtnResult;       
    } catch (error) {
        console.log(error.message)
        return null;       
    }
}

/**===================================================== */

/**----------- Get Building related building ---------- */
async function getBdInfoBy_id (buidling_id){
    try {
        const quertCmd = `SELECT * from ${buildingTableName} WHERE _id = ${buidling_id} and active = 1`;
        // console.log(quertCmd);
        let result = await queryTemplate(db, quertCmd, "getBdInfoBy_id Finally");
        // console.log(result);
        if(!result[0]) return null;     // return empty array
        const rtnResult = result.map(b=>b);
        return rtnResult;       
    } catch (error) {
        console.log(error.message)
        return null;       
    }
}

async function getBuildingByOwner_id (owner_id){
    try {
        const quertCmd = `SELECT * from ${buildingTableName} WHERE owner_id = ${owner_id} and active = 1`;
        // console.log(quertCmd);
        let result = await queryTemplate(db, quertCmd, "getBuildingByOwner_id Finally");
        // console.log(result);
        if(!result[0]) return [];     // return empty array
        const rtnResult = result.map(b=>b);
        return rtnResult;       
    } catch (error) {
        console.log(error.message)
        return null;       
    }
}
async function getBuildingByOwner_id_bd_id (owner_id, bd_id){
    try {
        const quertCmd = `SELECT * from ${buildingTableName} WHERE _id = ${bd_id} and owner_id = ${owner_id} and active = 1`;
        // console.log(quertCmd);
        let result = await queryTemplate(db, quertCmd, "getBuildingByOwner_id_bd_id Finally");
        // console.log(result);
        if(!result[0]) return [];     // return empty array
        const rtnResult = result.map(b=>b);
        return rtnResult;       
    } catch (error) {
        console.log(error.message)
        return null;       
    }
}
/**======================================== */

async function getSensorOwnerBy_TydevID (Info){
    try {
        const quertCmd = `SELECT * from ${tableName} WHERE type = ${Info.type} and devID = ${Info.devID}`;
        // console.log(quertCmd);
        let result = await queryTemplate(db, quertCmd, "getSensorOwnerBy_TydevID Finally");
        // console.log(result);
        if(!result[0]) return [];     // return empty array
        const rtnResult = result.map(b=>b);
        return rtnResult;       
    } catch (error) {
        console.log(error.message)
        return null;       
    }
}

async function insertV2_OwnerList_bdDev(body, bd_id, area_id){
    try {
        const createTable = `CREATE TABLE IF NOT EXISTS ${tableName}(	
            _id int NOT NULL AUTO_INCREMENT,
            timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            unix INT(11) NOT NULL,
            type int not null,
            devID int not null,
            name varchar(80),
            owner_id int not null,
            buidling_id int not null,
            area_id int not null,
            sortIdx int not null default 65535,
            active tinyint default 1,
            PRIMARY KEY (_id)
        )`;
  
        const queryCmd = `INSERT INTO ${tableName}(unix, type, devID, name, owner_id, buidling_id, area_id)
            VALUES (UNIX_TIMESTAMP(), 
            ${body.type}, 
            ${body.devID}, 
            "${body.devName}", 
            ${body.bdOwner_id}, 
            ${bd_id}, 
            ${area_id}
            )`;

        let result = await insertTemplate(db, createTable, queryCmd, "insertV2_OwnerList_bdDev Finally");
        if(!result) return false;
        if(result.affectedRows > 0) return true;
        return false;      
    } catch (ex) {
        console.log("setSensorOwner Err")
        console.log(ex.message)
        return false;
    }
}


async function insertV2_OwnerList_bd(body){
    try {
        const createTable = `CREATE TABLE IF NOT EXISTS ${buildingTableName}(	
            _id int NOT NULL AUTO_INCREMENT,
            timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            unix INT(11) NOT NULL,
            name varchar(80),
            owner_id int not null,
            sortIdx int not null default 65535,
            active tinyint default 1,
            PRIMARY KEY (_id)
        )`;
  
        const queryCmd = `INSERT INTO ${buildingTableName}(unix, name, owner_id)
            VALUES (UNIX_TIMESTAMP(), 
            "${body.buildingName}", 
            ${body.bdOwner_id}
            )`;

        let result = await insertTemplate(db, createTable, queryCmd, "insertV2_OwnerList_bd Finally");
        if(!result) return false;
        if(result.affectedRows > 0) return result;
        return false;      
    } catch (ex) {
        console.log("insertV2_OwnerList_bd Err")
        console.log(ex.message)
        return false;
    }
}

async function insertV2_OwnerList_area(body, bd_id){
    try {
        const createTable = `CREATE TABLE IF NOT EXISTS ${areaTableName}(	
            _id int NOT NULL AUTO_INCREMENT,
            timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            unix INT(11) NOT NULL,
            name varchar(80),
            owner_id int not null,
            buidling_id int not null,
            sortIdx int not null default 65535,
            active tinyint default 1,
            PRIMARY KEY (_id)
        )`;
  
        const queryCmd = `INSERT INTO ${areaTableName}(unix, name, owner_id, buidling_id)
            VALUES (UNIX_TIMESTAMP(), 
            "${body.bAreaName}", 
            ${body.bdOwner_id},
            ${bd_id}
            )`;

        let result = await insertTemplate(db, createTable, queryCmd, "insertV2_OwnerList_area Finally");
        if(!result) return false;
        if(result.affectedRows > 0) return result;
        return false;      
    } catch (ex) {
        console.log("insertV2_OwnerList_area Err")
        console.log(ex.message)
        return false;
    }
}


async function getBuildingByOwner_id_bd_id (owner_id, bd_id){
    try {
        const quertCmd = `SELECT * from ${buildingTableName} WHERE owner_id = ${owner_id} and active = 1 and _id=${bd_id}`;
        // console.log(quertCmd);
        let result = await queryTemplate(db, quertCmd, "getBuildingByOwner_id_bd_id Finally");
        // console.log(result);
        // if(!result[0]) return [];     
        const rtnResult = result.map(b=>b);
        return rtnResult;       
    } catch (error) {
        console.log(error.message)
        return null;       
    }
}

async function getBddevBy_userId_bdId (user_id, bd_id){
    try {
        const quertCmd = `SELECT * from ${tableName} WHERE owner_id = ${user_id} and active = 1 and buidling_id=${bd_id}`;
        // console.log(quertCmd);
        let result = await queryTemplate(db, quertCmd, "getBddevBy_userId_bdId Finally");
        // console.log(result);
        // if(!result[0]) return [];     
        const rtnResult = result.map(b=>b);
        return rtnResult;       
    } catch (error) {
        console.log(error.message)
        return null;       
    }
}

async function getBddevBy_idList (a_list){
    try {
        let _idList = [...a_list];
        const quertCmd = `SELECT * from ${tableName} WHERE _id in (${_idList.toString()})`;
    
        // const quertCmd = `SELECT * from ${tableName} WHERE owner_id = ${user_id} and active = 1 and buidling_id=${bd_id}`;
        // console.log(quertCmd);
        let result = await queryTemplate(db, quertCmd, "getBddevBy_idList Finally");
        // console.log(result);
        // if(!result[0]) return [];     
        const rtnResult = result.map(b=>b);
        return rtnResult;       
    } catch (error) {
        console.log(error.message)
        return null;       
    }
}

async function getBdList_byid (bd_idList){
    try {
        let bd_id = bd_idList.toString();
        const quertCmd = `SELECT * from ${buildingTableName} WHERE _id IN (${bd_id});`;
        // console.log(quertCmd);
        let result = await queryTemplate(db, quertCmd, "getBdList_byid Finally");
        // console.log(result);
        // if(!result[0]) return [];     
        const rtnResult = result.map(b=>b);
        return rtnResult;       
    } catch (error) {
        console.log(error.message)
        return null;       
    }
}

exports.getBddevBy_idList=getBddevBy_idList;
exports.getBddevBy_userId_bdId=getBddevBy_userId_bdId;
exports.getBuildingByOwner_id_bd_id=getBuildingByOwner_id_bd_id;

exports.insertV2_OwnerList_bd=insertV2_OwnerList_bd;
exports.insertV2_OwnerList_area=insertV2_OwnerList_area;

exports.getAreaInfoBy_id=getAreaInfoBy_id;
exports.getAreaByOwner_id= getAreaByOwner_id;
exports.getBdInfoBy_id = getBdInfoBy_id;
exports.getBuildingByOwner_id=getBuildingByOwner_id;
exports.insertV2_OwnerList_bdDev=insertV2_OwnerList_bdDev;
exports.getSensorOwnerBy_TydevID = getSensorOwnerBy_TydevID;

exports.getBdList_byid = getBdList_byid;