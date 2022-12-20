const { insertTemplate, queryTemplate } = require("../queryData");

const db = "V2_DeviceRecord";
// const tableName = "V2_SensorOwner";
const tableName = "V2_OwnerList_bdDev";
const buildingTableName = 'V2_OwnerList_bd';
const areaTableName = 'V2_OwnerList_area';
const floorTableName = 'V2_OwnerList_floor';

const shareBuildingTable = 'V2a_ShareBuildingTable';
const sharebdDevTable = 'V2a_ShareDeviceTable';


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
async function getSensorOwnerBy_TydevID_inUse (Info){
    try {
        const quertCmd = `SELECT * from ${tableName} WHERE type = ${Info.type} and devID = ${Info.devID} and active = 1`;
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




async function insertV2_OwnerList_bdDev(info, type, devID, bd_id ,floorId, areaId) {
    let fnName = "insertV2_OwnerList_bdDev";
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
            floor_id int not null,
            area_id int not null,
            sortIdx int not null default 65535,
            active tinyint default 1,
            PRIMARY KEY (_id)
        );`;

        const insertData = `INSERT INTO ${tableName} (unix, type, devID, name, owner_id, buidling_id, floor_id, area_id)
        VALUES (UNIX_TIMESTAMP(), ${type}, ${devID}, "${info.devName}", ${info.bdOwner_id}, ${bd_id}, ${floorId}, ${areaId});`;

        let result = await insertTemplate(db, createTable, insertData, `${fnName} Finally`);
        if (!result) return null    // insert error
        if (result.affectedRows > 0 && result.insertId > 0) return { success: true, insertId: result.insertId }
        return null     //<--- unknown state

    } catch (error){
        console.log(`${fnName} err : `, error.message);
        return null;
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

async function insertV2_OwnerList_area(info){
    try {
        const createTable = `CREATE TABLE IF NOT EXISTS ${areaTableName}(	
            _id int NOT NULL AUTO_INCREMENT,
            timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            unix INT(11) NOT NULL,
            name varchar(80),
            owner_id int not null,
            buidling_id int not null,
            floor_id int not null,
            sortIdx int not null default 65535,
            active tinyint default 1,
            PRIMARY KEY (_id)
        )`;
  
        const queryCmd = `INSERT INTO ${areaTableName}(unix, name, owner_id, buidling_id, floor_id)
            VALUES (UNIX_TIMESTAMP(), 
            "${info.name}", 
            ${info.owner_id},
            ${info.buidling_id},
            ${info.floor_id}
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

async function getBddevBy_id (_id){
    try {
        const quertCmd = `SELECT * from ${tableName} WHERE _id = ${_id}`;
    
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




/*********** V2a get floor in bd *********** */
async function v2a_getFloorinBd (bd_id){
    let sErrTitle = "v2a_getFloorinBd";
    try {
        let quertCmd = `SELECT * from ${floorTableName} WHERE buidling_id = ${bd_id} and active = 1`;        
        // console.log(quertCmd);
        let result = await queryTemplate(db, quertCmd, `${sErrTitle} Finally`);
        // console.log(result);
        if(!result[0]) return [];     // return empty array
        const rtnResult = result.map(b=>b);
        return rtnResult;
    } catch (error) {
        console.log(`${sErrTitle}`, error.message)
        return null;
    }
}

async function v2a_getDeviceInBd (bd_id){
    let sErrTitle = "v2a_getDeviceInBd";
    try {
        let quertCmd = `SELECT * from ${tableName} WHERE buidling_id = ${bd_id} and active = 1`;        
        // console.log(quertCmd);
        let result = await queryTemplate(db, quertCmd, `${sErrTitle} Finally`);
        // console.log(result);
        if(!result[0]) return [];     // return empty array
        const rtnResult = result.map(b=>b);
        return rtnResult;       
    } catch (error) {
        console.log(`${sErrTitle}`, error.message)
        return null;       
    }
}

async function v2a_getAreaRelated (bd_id, floor_id){
    let sErrTitle = "v2a_getAreaRelated";
    try {
        let quertCmd = `SELECT * from ${areaTableName} WHERE buidling_id = ${bd_id} and floor_id = ${floor_id} and active = 1`;
        // console.log(quertCmd);
        let result = await queryTemplate(db, quertCmd, `${sErrTitle} Finally`);
        // console.log(result);
        if(!result[0]) return [];     // return empty array
        const rtnResult = result.map(b=>b);
        return rtnResult;       
    } catch (error) {
        console.log(`${sErrTitle}`, error.message)
        return null;       
    }
}

async function v2a_getAllAreaUnderBd (bd_id){
    let sErrTitle = "v2a_getAllAreaUnderBd";
    try {
        let quertCmd = `SELECT * from ${areaTableName} WHERE buidling_id = ${bd_id} and active = 1`;
        // console.log(quertCmd);
        let result = await queryTemplate(db, quertCmd, `${sErrTitle} Finally`);
        // console.log(result);
        if(!result[0]) return [];     // return empty array
        const rtnResult = result.map(b=>b);
        return rtnResult;       
    } catch (error) {
        console.log(`${sErrTitle}`, error.message)
        return null;       
    }
}

async function v2aInsertFloor(info) {
    let fnName = "v2aInsertFloor";
    try {
        const createTable = `CREATE TABLE IF NOT EXISTS ${floorTableName}(	
            _id int NOT NULL AUTO_INCREMENT,
            timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            unix INT(11) NOT NULL,
            name varchar(80),
            owner_id int not null,
            buidling_id int not null,
            sortIdx int not null default 65535,
            active tinyint default 1,
            PRIMARY KEY (_id)
        );`;

        const insertData = `INSERT INTO ${floorTableName} (unix, name, owner_id, buidling_id)
        VALUES (UNIX_TIMESTAMP(), "${info.name}", ${info.owner_id}, ${info.buidling_id});`;        

        let result = await insertTemplate(db, createTable, insertData, `${fnName} Finally`);
        if (!result) return null    // insert error
        if (result.affectedRows > 0 && result.insertId > 0) return { success: true, insertId: result.insertId }
        return null     //<--- unknown state

    } catch (error){
        console.log(`${fnName} err : `, error.message);
        return null;
    }
}

async function v2aGetBdDevRegBefore (Info){
    let sErrTitle = "v2aGetBdDevRegBefore";
    try {
        let quertCmd = `SELECT * from ${tableName} WHERE 
        type = ${Info.type} and devID = ${Info.devID} and 
        owner_id = ${Info.owner_id} and buidling_id = ${Info.buidling_id} and
        active = 0`;        
        let result = await queryTemplate(db, quertCmd, `${sErrTitle} Finally`);
        // console.log(result);
        if(!result[0]) return [];     // return empty array
        const rtnResult = result.map(b=>b);
        return rtnResult;       
    } catch (error) {
        console.log(`${sErrTitle}`, error.message)
        return null;       
    }
}

async function v2aUpdateOwnerList_bdDev(info, type, devID, _id) {
    let sMsg = "v2aUpdateOwnerList_bdDev";
    try {
        const quertCmd = `UPDATE ${tableName} SET 
            unix=UNIX_TIMESTAMP(),
            type = ${type},
            devID = ${devID},
            name = "${info.devName}",
            owner_id = ${info.bdOwner_id},
            buidling_id  = ${info.buildingId},
            floor_id  = ${info.floorId},
            area_id  = ${info.areaId},
            sortIdx  = 65535,
            active  = 1
            where _id = ${_id}`;

        let result = await queryTemplate(db, quertCmd, `${sMsg} Finally`);
        if (!result || !result.affectedRows) return null;
        if (result.affectedRows > 0) return true;
        return null

    } catch (error) {
        console.log(`Error : ${sMsg}`, error.message);
        return null;
    }
}


async function v2aUpdateSortIdx_bd(sortIdx, _id) {
    let sMsg = "v2aUpdateSortIdx_bd";
    try {
        const quertCmd = `UPDATE ${buildingTableName} SET 
            unix=UNIX_TIMESTAMP(),
            sortIdx = ${sortIdx}
            where _id = ${_id}`;
        // console.log("quertCmd", quertCmd);

        let result = await queryTemplate(db, quertCmd, `${sMsg} Finally`);
        // console.log(result);
        if (!result || !result.affectedRows) return null;
        if (result.affectedRows > 0) return true;
        return null

    } catch (error) {
        console.log(`Error : ${sMsg}`, error.message);
        return null;
    }
}



// const tableName = "V2_OwnerList_bdDev";

// buildingTableName
async function v2aRenameBd(name, _id) {
    let sMsg = "v2aRenameBd";
    try {
        const quertCmd = `UPDATE ${buildingTableName} SET 
            unix=UNIX_TIMESTAMP(),
            name = "${name}"
            where _id = ${_id}`;
        // console.log("quertCmd", quertCmd);

        let result = await queryTemplate(db, quertCmd, `${sMsg} Finally`);
        // console.log(result);
        if (!result || !result.affectedRows) return null;
        if (result.affectedRows > 0) return true;
        return null

    } catch (error) {
        console.log(`Error : ${sMsg}`, error.message);
        return null;
    }
}


async function v2aUpdateSortIdx_floor(sortIdx, _id) {
    let sMsg = "v2aUpdateSortIdx_floor";
    try {
        const quertCmd = `UPDATE ${floorTableName} SET 
            unix=UNIX_TIMESTAMP(),
            sortIdx = ${sortIdx}
            where _id = ${_id}`;
        // console.log("quertCmd", quertCmd);

        let result = await queryTemplate(db, quertCmd, `${sMsg} Finally`);
        // console.log(result);
        if (!result || !result.affectedRows) return null;
        if (result.affectedRows > 0) return true;
        return null

    } catch (error) {
        console.log(`Error : ${sMsg}`, error.message);
        return null;
    }
}

async function v2aRenameFloor(name, _id) {
    let sMsg = "v2aRenameFloor";
    try {
        const quertCmd = `UPDATE ${floorTableName} SET 
            unix=UNIX_TIMESTAMP(),
            name = "${name}"
            where _id = ${_id}`;
        // console.log("quertCmd", quertCmd);

        let result = await queryTemplate(db, quertCmd, `${sMsg} Finally`);
        // console.log(result);
        if (!result || !result.affectedRows) return null;
        if (result.affectedRows > 0) return true;
        return null

    } catch (error) {
        console.log(`Error : ${sMsg}`, error.message);
        return null;
    }
}

async function v2aUpdateSortIdx_area(sortIdx, _id) {
    let sMsg = "v2aUpdateSortIdx_area";
    try {
        const quertCmd = `UPDATE ${areaTableName} SET 
            unix=UNIX_TIMESTAMP(),
            sortIdx = ${sortIdx}
            where _id = ${_id}`;
        // console.log("quertCmd", quertCmd);

        let result = await queryTemplate(db, quertCmd, `${sMsg} Finally`);
        // console.log(result);
        if (!result || !result.affectedRows) return null;
        if (result.affectedRows > 0) return true;
        return null

    } catch (error) {
        console.log(`Error : ${sMsg}`, error.message);
        return null;
    }
}

async function v2aRenameArea(name, _id) {
    let sMsg = "v2aRenameArea";
    try {
        const quertCmd = `UPDATE ${areaTableName} SET 
            unix=UNIX_TIMESTAMP(),
            name = "${name}"
            where _id = ${_id}`;
        // console.log("quertCmd", quertCmd);

        let result = await queryTemplate(db, quertCmd, `${sMsg} Finally`);
        // console.log(result);
        if (!result || !result.affectedRows) return null;
        if (result.affectedRows > 0) return true;
        return null

    } catch (error) {
        console.log(`Error : ${sMsg}`, error.message);
        return null;
    }
}


async function v2aDeleteArea(_id) {
    let sMsg = "v2aDeleteArea";
    try {
        const quertCmd = `UPDATE ${areaTableName} SET 
            unix=UNIX_TIMESTAMP(),
            active = 0
            where _id = ${_id}`;
        // console.log("quertCmd", quertCmd);

        let result = await queryTemplate(db, quertCmd, `${sMsg} Finally`);
        // console.log(result);
        if (!result || !result.affectedRows) return null;
        if (result.affectedRows > 0) return true;
        return null

    } catch (error) {
        console.log(`Error : ${sMsg}`, error.message);
        return null;
    }
}

async function v2aDeleteFloor(_id) {
    let sMsg = "v2aDeleteFloor";
    try {
        const quertCmd = `UPDATE ${floorTableName} SET 
            unix=UNIX_TIMESTAMP(),
            active = 0
            where _id = ${_id}`;
        // console.log("quertCmd", quertCmd);

        let result = await queryTemplate(db, quertCmd, `${sMsg} Finally`);
        // console.log(result);
        if (!result || !result.affectedRows) return null;
        if (result.affectedRows > 0) return true;
        return null

    } catch (error) {
        console.log(`Error : ${sMsg}`, error.message);
        return null;
    }
}

async function v2aClearFloorArea_id(_id) {
    let sMsg = "v2aClearFloorArea_id";
    try {
        const quertCmd = `UPDATE ${tableName} SET 
            unix=UNIX_TIMESTAMP(),
            floor_id = 0,
            area_id = 0
            where _id = ${_id}`;
        // console.log("quertCmd", quertCmd);

        let result = await queryTemplate(db, quertCmd, `${sMsg} Finally`);
        // console.log(result);
        if (!result || !result.affectedRows) return null;
        if (result.affectedRows > 0) return true;
        return null

    } catch (error) {
        console.log(`Error : ${sMsg}`, error.message);
        return null;
    }
}

async function v2aClearArea_id(_id) {
    let sMsg = "v2aClearArea_id";
    try {
        const quertCmd = `UPDATE ${tableName} SET 
            unix=UNIX_TIMESTAMP(),
            area_id = 0
            where _id = ${_id}`;
        // console.log("quertCmd", quertCmd);

        let result = await queryTemplate(db, quertCmd, `${sMsg} Finally`);
        // console.log(result);
        if (!result || !result.affectedRows) return null;
        if (result.affectedRows > 0) return true;
        return null

    } catch (error) {
        console.log(`Error : ${sMsg}`, error.message);
        return null;
    }
}


async function v2a_getInactiveFloor (){
    let sErrTitle = "v2a_getInactiveFloor";
    try {
        let quertCmd = `SELECT * from ${floorTableName} WHERE active =  0 limit 1`;        
        // console.log(quertCmd);
        let result = await queryTemplate(db, quertCmd, `${sErrTitle} Finally`);
        // console.log(result);
        if(!result[0]) return [];     // return empty array
        const rtnResult = result.map(b=>b);
        return rtnResult;
    } catch (error) {
        console.log(`${sErrTitle}`, error.message)
        return null;
    }
}

async function v2aInsertUpdatefloor(info, _id) {
    let sMsg = "v2aUpdateSortIdx_floor";
    try {
        const quertCmd = `UPDATE ${floorTableName} SET 
            unix=UNIX_TIMESTAMP(),
            name = "${info.name}",
            owner_id = ${info.owner_id},
            buidling_id = ${info.buidling_id},
            sortIdx = 65535,
            active = 1
            where _id = ${_id}`;
        // console.log("quertCmd", quertCmd);

        let result = await queryTemplate(db, quertCmd, `${sMsg} Finally`);
        // console.log(result);
        if (!result || !result.affectedRows) return null;
        if (result.affectedRows > 0) return true;
        return null

    } catch (error) {
        console.log(`Error : ${sMsg}`, error.message);
        return null;
    }
}


async function v2a_getInactiveArea (){
    let sErrTitle = "v2a_getInactiveArea";
    try {
        let quertCmd = `SELECT * from ${areaTableName} WHERE active =  0 limit 1`;        
        // console.log(quertCmd);
        let result = await queryTemplate(db, quertCmd, `${sErrTitle} Finally`);
        // console.log(result);
        if(!result[0]) return [];     // return empty array
        const rtnResult = result.map(b=>b);
        return rtnResult;
    } catch (error) {
        console.log(`${sErrTitle}`, error.message)
        return null;
    }
}


async function v2aInsertUpdateArea(info, _id) {
    let sMsg = "v2aInsertUpdateArea";
    try {
        const quertCmd = `UPDATE ${areaTableName} SET 
            unix=UNIX_TIMESTAMP(),
            name = "${info.name}",
            owner_id = ${info.owner_id},
            buidling_id = ${info.buidling_id},
            floor_id = ${info.floor_id},
            sortIdx = 65535,
            active = 1
            where _id = ${_id}`;
        // console.log("quertCmd", quertCmd);

        let result = await queryTemplate(db, quertCmd, `${sMsg} Finally`);
        // console.log(result);
        if (!result || !result.affectedRows) return null;
        if (result.affectedRows > 0) return true;
        return null

    } catch (error) {
        console.log(`Error : ${sMsg}`, error.message);
        return null;
    }
}

async function v2aUpdatebdDevFloor_Area(info) {
    let sMsg = "v2aUpdatebdDevFloor_Area";
    try {
        const quertCmd = `UPDATE ${tableName} SET 
            unix=UNIX_TIMESTAMP(),
            floor_id = ${info.floor_id}, 
            area_id = ${info.area_id},
            sortIdx = 65535
            where _id = ${info._id}`;
        // console.log("quertCmd", quertCmd);

        let result = await queryTemplate(db, quertCmd, `${sMsg} Finally`);
        // console.log(result);
        if (!result || !result.affectedRows) return null;
        if (result.affectedRows > 0) return true;
        return null

    } catch (error) {
        console.log(`Error : ${sMsg}`, error.message);
        return null;
    }
}


async function v2aUpdateSortIdx_device(sortIdx, _id) {
    let sMsg = "v2aUpdateSortIdx_device";
    try {
        const quertCmd = `UPDATE ${tableName} SET 
            unix=UNIX_TIMESTAMP(),
            sortIdx = ${sortIdx}
            where _id = ${_id}`;
        // console.log("quertCmd", quertCmd);

        let result = await queryTemplate(db, quertCmd, `${sMsg} Finally`);
        // console.log(result);
        if (!result || !result.affectedRows) return null;
        if (result.affectedRows > 0) return true;
        return null

    } catch (error) {
        console.log(`Error : ${sMsg}`, error.message);
        return null;
    }
}

async function v2aRenameDev(sNewName, _id) {
    let sMsg = "v2aUpdateSortIdx_device";
    try {
        const quertCmd = `UPDATE ${tableName} SET 
            unix=UNIX_TIMESTAMP(),
            name = "${sNewName}"
            where _id = ${_id}`;
        // console.log("quertCmd", quertCmd);

        let result = await queryTemplate(db, quertCmd, `${sMsg} Finally`);
        // console.log(result);
        if (!result || !result.affectedRows) return null;
        if (result.affectedRows > 0) return true;
        return null

    } catch (error) {
        console.log(`Error : ${sMsg}`, error.message);
        return null;
    }
}

async function v2aDeleteDev(_id) {
    let sMsg = "v2aDeleteDev";
    try {
        const quertCmd = `UPDATE ${tableName} SET 
            unix=UNIX_TIMESTAMP(),
            active = 0
            where _id = ${_id}`;
        // console.log("quertCmd", quertCmd);

        let result = await queryTemplate(db, quertCmd, `${sMsg} Finally`);
        // console.log(result);
        if (!result || !result.affectedRows) return null;
        if (result.affectedRows > 0) return true;
        return null

    } catch (error) {
        console.log(`Error : ${sMsg}`, error.message);
        return null;
    }
}

async function v2aSwapDev(owner_id, devID, _id) {
    let sMsg = "v2aSwapDev";
    try {
        const quertCmd = `UPDATE ${tableName} SET 
            unix=UNIX_TIMESTAMP(),
            owner_id=${owner_id},
            devID = ${devID}
            where _id = ${_id}`;

        let result = await queryTemplate(db, quertCmd, `${sMsg} Finally`);
        if (!result || !result.affectedRows) return null;
        if (result.affectedRows > 0) return true;
        return null
    } catch (error) {
        console.log(`Error : ${sMsg}`, error.message);
        return null;
    }
}

async function v2aDeteachDev(_id) {
    let sMsg = "v2aDeteachDev";
    try {
        const quertCmd = `UPDATE ${tableName} SET 
            unix=UNIX_TIMESTAMP(),
            devID = 0
            where _id = ${_id}`;

        let result = await queryTemplate(db, quertCmd, `${sMsg} Finally`);
        if (!result || !result.affectedRows) return null;
        if (result.affectedRows > 0) return true;
        return null
    } catch (error) {
        console.log(`Error : ${sMsg}`, error.message);
        return null;
    }
}


async function v2a_getShareBuilding_byUser_id (user_id){
    let sErrTitle = "v2a_getShareBuilding_byUser_id";
    try {
        let quertCmd = `SELECT * from ${shareBuildingTable} WHERE shareUser_id = ${user_id} and active =  1 `;        
        // console.log(quertCmd);
        let result = await queryTemplate(db, quertCmd, `${sErrTitle} Finally`);
        // console.log(result);
        if(!result[0]) return [];     // return empty array
        const rtnResult = result.map(b=>b);
        return rtnResult;
    } catch (error) {
        console.log(`${sErrTitle}`, error.message)
        return null;
    }
}

async function v2a_getShareBd_byBdID_UserId (bd_id, user_id){
    let sErrTitle = "v2a_getShareBuilding_byUser_id";
    try {
        let quertCmd = `SELECT * from ${shareBuildingTable} WHERE buidling_id = ${bd_id} and shareUser_id = ${user_id} and active =  1 `;        
        // console.log(quertCmd);
        let result = await queryTemplate(db, quertCmd, `${sErrTitle} Finally`);
        // console.log(result);
        if(!result[0]) return [];     // return empty array
        const rtnResult = result.map(b=>b);
        return rtnResult;
    } catch (error) {
        console.log(`${sErrTitle}`, error.message)
        return null;
    }
}

async function v2a_updateSharedBd(bd_id, shareUser_id, shareLevel) {
    let sMsg = "v2a_updateSharedBd";
    try {
        const quertCmd = `UPDATE ${shareBuildingTable} SET 
            unix=UNIX_TIMESTAMP(),
            shareLevel = ${shareLevel},
            active =1
            where buidling_id = ${bd_id} and shareUser_id = ${shareUser_id}`;
        // console.log("quertCmd", quertCmd);

        let result = await queryTemplate(db, quertCmd, `${sMsg} Finally`);
        // console.log(result);
        if (!result || !result.affectedRows) return null;
        if (result.affectedRows > 0) return true;
        return null

    } catch (error) {
        console.log(`Error : ${sMsg}`, error.message);
        return null;
    }
}



async function v2a_InsertSharedBd(bd_id, shareUser_id, shareLevel) {
    let fnName = "v2a_InsertSharedBd";
    try {
        const createTable = `CREATE TABLE IF NOT EXISTS ${shareBuildingTable}(	
            _id int NOT NULL AUTO_INCREMENT,
            timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            unix INT(11) NOT NULL,
            buidling_id int not null,
            shareUser_id int not null,
            shareLevel smallint not null,
            active tinyint default 1,
            PRIMARY KEY (_id)
        );`;

        const insertData = `INSERT INTO ${shareBuildingTable} (unix, buidling_id, shareUser_id, shareLevel)
        VALUES (UNIX_TIMESTAMP(), ${bd_id}, ${shareUser_id}, ${shareLevel});`;        

        let result = await insertTemplate(db, createTable, insertData, `${fnName} Finally`);
        if (!result) return null    // insert error
        if (result.affectedRows > 0 && result.insertId > 0) return { success: true, insertId: result.insertId }
        return null     //<--- unknown state

    } catch (error){
        console.log(`${fnName} err : `, error.message);
        return null;
    }
}



async function v2a_getShareBddev_byBdID_UserId (bd_id, user_id){
    let sErrTitle = "v2a_getShareBddev_byBdID_UserId";
    try {
        let quertCmd = `SELECT * from ${sharebdDevTable} WHERE buidling_id = ${bd_id} and shareUser_id = ${user_id} and active = 1`;
        // console.log(quertCmd);
        let result = await queryTemplate(db, quertCmd, `${sErrTitle} Finally`);
        // console.log(result);
        if(!result[0]) return [];     // return empty array
        const rtnResult = result.map(b=>b);
        return rtnResult;
    } catch (error) {
        console.log(`${sErrTitle}`, error.message)
        return null;
    }
}

async function v2a_getShareBddev_byBdID_UserId_bdDevId (bd_id, user_id, bdDev_id){
    console.log("bd_id", bd_id);
    console.log("user_id", user_id);
    console.log("bdDev_id", bdDev_id);
    let sErrTitle = "v2a_getShareBddev_byBdID_UserId_bdDevId";
    try {
        let quertCmd = `SELECT * from ${sharebdDevTable} WHERE buidling_id = ${bd_id} and shareUser_id = ${user_id} and bdDev_id = ${bdDev_id}`;
        // console.log(quertCmd);
        let result = await queryTemplate(db, quertCmd, `${sErrTitle} Finally`);
        // console.log(result);
        if(!result[0]) return [];     // return empty array
        const rtnResult = result.map(b=>b);
        return rtnResult;
    } catch (error) {
        console.log(`${sErrTitle}`, error.message)
        return null;
    }
}

async function v2a_updateSharedBdDevAccessLevel(_id, accessLevel) {
    let sMsg = "v2a_updateSharedBdDevAccessLevel";
    try {
        const quertCmd = `UPDATE ${sharebdDevTable} SET 
            unix=UNIX_TIMESTAMP(),
            accessLevel  = ${accessLevel},
            active = 1
            where _id = ${_id}`;
        // console.log("quertCmd", quertCmd);

        let result = await queryTemplate(db, quertCmd, `${sMsg} Finally`);
        // console.log(result);
        if (!result || !result.affectedRows) return null;
        if (result.affectedRows > 0) return true;
        return null

    } catch (error) {
        console.log(`Error : ${sMsg}`, error.message);
        return null;
    }
}

async function v2a_DeactivateShareDev(bd_id, user_id) {
    let sMsg = "v2a_DeactivateShareDev";
    try {
        const quertCmd = `UPDATE ${sharebdDevTable} SET 
            active = 0
            where buidling_id = ${bd_id} and shareUser_id=${user_id}`;
        // console.log("quertCmd", quertCmd);

        let result = await queryTemplate(db, quertCmd, `${sMsg} Finally`);
        // console.log(result);
        if (!result || !result.affectedRows) return null;
        if (result.affectedRows > 0) return true;
        return null

    } catch (error) {
        console.log(`Error : ${sMsg}`, error.message);
        return null;
    }
}

async function v2a_InsertSharedBdDev(bd_id, shareUser_id, bdDev_id, accessLevel) {
    let fnName = "v2a_InsertSharedBdDev";
    try {
        const createTable = `CREATE TABLE IF NOT EXISTS ${sharebdDevTable}(	
            _id int NOT NULL AUTO_INCREMENT,
            timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            unix INT(11) NOT NULL,
            buidling_id int not null,
            shareUser_id int not null,
            bdDev_id int not null,
            accessLevel smallint not null,
            active tinyint default 1,
            PRIMARY KEY (_id)
        );`;

        const insertData = `INSERT INTO ${sharebdDevTable} (unix, buidling_id, shareUser_id, bdDev_id, accessLevel)
        VALUES (UNIX_TIMESTAMP(), ${bd_id}, ${shareUser_id}, ${bdDev_id}, ${accessLevel});`;        

        let result = await insertTemplate(db, createTable, insertData, `${fnName} Finally`);
        if (!result) return null    // insert error
        if (result.affectedRows > 0 && result.insertId > 0) return { success: true, insertId: result.insertId }
        return null     //<--- unknown state

    } catch (error){
        console.log(`${fnName} err : `, error.message);
        return null;
    }
}


async function v2a_getAllFloorInBd (bd_id){
    let sErrTitle = "v2a_getAllFloorInBd";
    try {
        let quertCmd = `SELECT * from ${floorTableName} WHERE buidling_id = ${bd_id} and active = 1`;
        // console.log(quertCmd);
        let result = await queryTemplate(db, quertCmd, `${sErrTitle} Finally`);
        // console.log(result);
        if(!result[0]) return [];     // return empty array
        const rtnResult = result.map(b=>b);
        return rtnResult;
    } catch (error) {
        console.log(`${sErrTitle}`, error.message)
        return null;
    }
}

// async function v2a_getAllAreaInBd (bd_id){
//     let sErrTitle = "v2a_getAllAreaInBd";
//     try {
//         let quertCmd = `SELECT * from ${areaTableName} WHERE buidling_id = ${bd_id} and active = 1`;
//         // console.log(quertCmd);
//         let result = await queryTemplate(db, quertCmd, `${sErrTitle} Finally`);
//         // console.log(result);
//         if(!result[0]) return [];     // return empty array
//         const rtnResult = result.map(b=>b);
//         return rtnResult;
//     } catch (error) {
//         console.log(`${sErrTitle}`, error.message)
//         return null;
//     }
// }


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

/** -----------V2a------------- */
exports.v2a_getFloorinBd=v2a_getFloorinBd;
exports.v2a_getDeviceInBd=v2a_getDeviceInBd;
exports.v2a_getAreaRelated=v2a_getAreaRelated;
exports.getSensorOwnerBy_TydevID_inUse=getSensorOwnerBy_TydevID_inUse;
exports.v2aInsertFloor=v2aInsertFloor;
exports.v2aGetBdDevRegBefore=v2aGetBdDevRegBefore;
exports.v2aUpdateOwnerList_bdDev=v2aUpdateOwnerList_bdDev;
exports.v2aUpdateSortIdx_bd=v2aUpdateSortIdx_bd;
exports.v2aRenameBd=v2aRenameBd;
exports.v2aUpdateSortIdx_floor=v2aUpdateSortIdx_floor;
exports.v2aRenameFloor=v2aRenameFloor;
exports.v2aUpdateSortIdx_area=v2aUpdateSortIdx_area;
exports.v2aRenameArea=v2aRenameArea;
exports.v2aDeleteArea=v2aDeleteArea;
exports.v2aDeleteFloor=v2aDeleteFloor;
exports.v2aClearFloorArea_id=v2aClearFloorArea_id;
exports.v2aClearArea_id=v2aClearArea_id;
exports.v2a_getInactiveFloor=v2a_getInactiveFloor;
exports.v2aInsertUpdatefloor=v2aInsertUpdatefloor;
exports.v2a_getInactiveArea=v2a_getInactiveArea;
exports.v2aInsertUpdateArea=v2aInsertUpdateArea;
exports.v2a_getAllAreaUnderBd=v2a_getAllAreaUnderBd;
exports.v2aUpdatebdDevFloor_Area=v2aUpdatebdDevFloor_Area;
exports.v2aUpdateSortIdx_device=v2aUpdateSortIdx_device;
exports.v2aRenameDev=v2aRenameDev;
exports.v2aDeleteDev=v2aDeleteDev;
exports.v2aSwapDev=v2aSwapDev;
exports.getBddevBy_id=getBddevBy_id;
exports.v2aDeteachDev=v2aDeteachDev;

/** v2a share building */
exports.v2a_getShareBuilding_byUser_id=v2a_getShareBuilding_byUser_id;
exports.v2a_getShareBd_byBdID_UserId=v2a_getShareBd_byBdID_UserId;
exports.v2a_getShareBddev_byBdID_UserId=v2a_getShareBddev_byBdID_UserId;
exports.v2a_getAllFloorInBd=v2a_getAllFloorInBd;
// exports.v2a_getAllAreaInBd=v2a_getAllAreaInBd;
exports.v2a_updateSharedBd=v2a_updateSharedBd;
exports.v2a_InsertSharedBd=v2a_InsertSharedBd;
exports.v2a_getShareBddev_byBdID_UserId_bdDevId=v2a_getShareBddev_byBdID_UserId_bdDevId;
exports.v2a_updateSharedBdDevAccessLevel=v2a_updateSharedBdDevAccessLevel;
exports.v2a_InsertSharedBdDev=v2a_InsertSharedBdDev;
exports.v2a_DeactivateShareDev=v2a_DeactivateShareDev;