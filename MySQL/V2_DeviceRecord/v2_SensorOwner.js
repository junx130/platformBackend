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
        console.log(ex.message)
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
        console.log(ex.message)
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
        console.log(ex.message)
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
        console.log(ex.message)
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
        console.log(ex.message)
        return null;       
    }
}

async function setSensorOwner(body){
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
  
        const queryCmd = `INSERT INTO V2_OwnerList_bdDev(unix, type, devID, name, owner_id, buidling_id, area_id, sortIdx, active)
            VALUES (UNIX_TIMESTAMP(), 
            ${body.type}, 
            ${body.devID}, 
            ${body.name}, 
            ${body.owner_id}, 
            ${body.buidling_id}, 
            ${body.area_id}, 
            ${body.sortIdx}, 
            ${body.active}
            )`;

        let result = await insertTemplate(db, createTable, queryCmd, "setSensorOwner Finally");
        if(!result) return false;
        if(result.affectedRows > 0) return true;
        return false;      
    } catch (ex) {
        console.log("setSensorOwner Err")
        console.log(ex.message)
        return false;
    }
}

exports.getAreaInfoBy_id=getAreaInfoBy_id;
exports.getAreaByOwner_id= getAreaByOwner_id;
exports.getBdInfoBy_id = getBdInfoBy_id;
exports.getBuildingByOwner_id=getBuildingByOwner_id;
exports.setSensorOwner=setSensorOwner;
exports.getSensorOwnerBy_TydevID = getSensorOwnerBy_TydevID;