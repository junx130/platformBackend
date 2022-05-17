const { insertTemplate, queryTemplate } = require("../queryData");

const db = "V2_DeviceRecord";
const tableName = "V2_SensorSharedUser";
const shareBdTableName = "V2_ShareList_bd";
const areaTableName = "V2_ShareList_area";
const devTableName = "V2_ShareList_bdDev";

async function getAreaByActiveUser_id (user_id, selectedBuilding){
    try {
        const quertCmd = `SELECT * from ${areaTableName} WHERE user_id = ${user_id} and buidling_id=${selectedBuilding} and active = 1 and accessLevel = 1`;
        // console.log(quertCmd);
        let result = await queryTemplate(db, quertCmd, "getAreaByActiveUser_id Finally");
        // console.log(result);
        if(!result[0]) return [];     // return empty array
        const rtnResult = result.map(b=>b);
        return rtnResult;       
    } catch (error) {
        console.log(error.message)
        return null;       
    }
}



async function getBuildingByActiveUser_id (user_id, accessLevel){
    try {
        // const quertCmd = `SELECT * from ${bdTableName} WHERE user_id = ${user_id} and active = 1 and accessLevel = 1`;
        let quertCmd = `SELECT * from ${shareBdTableName} WHERE user_id = ${user_id} and active = 1`;
        if(accessLevel) quertCmd = `SELECT * from ${shareBdTableName} WHERE user_id = ${user_id} and active = 1 and accessLevel = ${accessLevel}`;
        // console.log(quertCmd);
        let result = await queryTemplate(db, quertCmd, "getBuildingByActiveUser_id Finally");
        // console.log(result);
        if(!result[0]) return [];     // return empty array
        const rtnResult = result.map(b=>b);
        return rtnResult;       
    } catch (error) {
        console.log(error.message)
        return null;       
    }
}

async function getShareBdInfoGrantByUser_id (user_id, bd_id){
    let sErrTitle = "getBdGrantByUser_id";
    try {
        let quertCmd = `SELECT * from ${shareBdTableName} WHERE buidling_id = ${bd_id} and grantBy = ${user_id} and active = 1`;        
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

async function getSensorSharedBy_user_bd_accesslvl (Info){    
    try {
        const quertCmd = `SELECT * from ${devTableName} WHERE buidling_id = ${Info.buidling_id} and user_id = ${Info.user_id} and accessLevel = ${Info.accessLevel}`;
        // console.log(quertCmd);
        let result = await queryTemplate(db, quertCmd, "getSensorSharedBy_user_bd_accesslvl Finally");
        // console.log(result);
        if(!result[0]) return [];     // return empty array
        const rtnResult = result.map(b=>b);
        return rtnResult;       
    } catch (error) {
        console.log(error.message)
        return null;       
    }
}

async function getSharedBdBy_user_id_bd_id (user_id, bd_id, bCheckActive){
    try {
        let quertCmd = `SELECT * from ${shareBdTableName} WHERE user_id = ${user_id} and active = 1 and buidling_id=${bd_id} `;
        if(!bCheckActive) quertCmd = `SELECT * from ${shareBdTableName} WHERE user_id = ${user_id} and buidling_id=${bd_id} `;
        // console.log(quertCmd);
        let result = await queryTemplate(db, quertCmd, "getSharedBdBy_user_id_bd_id Finally");
        // console.log(result);
        const rtnResult = result.map(b=>b);
        return rtnResult;       
    } catch (error) {
        console.log(error.message)
        return null;       
    }
}
async function getSharedevBy_userId_bdId (user_id, bd_id){
    try {
        const quertCmd = `SELECT * from ${devTableName} WHERE user_id = ${user_id} and active = 1 and buidling_id=${bd_id}`;
        // console.log(quertCmd);
        let result = await queryTemplate(db, quertCmd, "getSharedevBy_userId_bdId Finally");
        // console.log(result);
        // if(!result[0]) return [];     
        const rtnResult = result.map(b=>b);
        return rtnResult;       
    } catch (error) {
        console.log(error.message)
        return null;       
    }
}

async function getAllSharedevBy_userId_bdId (user_id, bd_id){
    try {
        const quertCmd = `SELECT * from ${devTableName} WHERE user_id = ${user_id} and buidling_id=${bd_id}`;
        // console.log(quertCmd);
        let result = await queryTemplate(db, quertCmd, "getAllSharedevBy_userId_bdId Finally");
        // console.log(result);
        // if(!result[0]) return [];     
        const rtnResult = result.map(b=>b);
        return rtnResult;       
    } catch (error) {
        console.log(error.message)
        return null;       
    }
}

async function setSharedBdActive(user_id, bd_id, accessLevel) {
    try {
        const queryCmd = `UPDATE ${shareBdTableName} SET accessLevel = ${accessLevel}, active = true WHERE user_id = ${user_id} AND buidling_id = ${bd_id};`;
        let result = await queryTemplate(db, queryCmd, "setSharedBdActive Finally");
        return result;
    } catch (error){
        console.log(error.message);
        return null;
    }
}

async function addSharedBd(info) {
    try {
        const createTable = `CREATE TABLE IF NOT EXISTS ${shareBdTableName}(	
            _id int NOT NULL AUTO_INCREMENT,
            timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            unix INT(11) NOT NULL,
            buidling_id int not null,
            user_id int not null,
            owner_id int not null,
            grantBy int,
            accessLevel tinyint default 3,
            sortIdx int not null default 65535,
            active tinyint default 1,
            PRIMARY KEY (_id)
        );`;

        const insertData = `INSERT INTO ${shareBdTableName} (unix, buidling_id, user_id, owner_id, grantBy, accessLevel)
        VALUES (UNIX_TIMESTAMP(), ${info.buidling_id}, ${info.user_id}, ${info.owner_id}, ${info.grantBy}, ${info.accessLevel});`;        

        let result = await insertTemplate(db, createTable, insertData, "addSharedBd Finally");
        if (!result) return null    // insert error
        if (result.affectedRows > 0 && result.insertId > 0) return { success: true, insertId: result.insertId }

    } catch (error){
        console.log(error.message);
        return null;
    }
}

async function updateSharedBd(info, _id) {
    let sMsg = "updateSharedBd";
    try {
        const quertCmd = `UPDATE ${shareBdTableName} SET 
            unix=UNIX_TIMESTAMP(),
            buidling_id = "${info.buidling_id}",
            user_id = "${info.user_id}",
            owner_id = ${info.owner_id},
            grantBy =${info.grantBy},
            accessLevel  = ${info.accessLevel}
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



// async function setSharedBdDevActiveStatus(bdDev_id, active, accessLevel, user_id) {
async function setSharedBdDevActiveStatus(_id, active, accessLevel) {
    try {
        const queryCmd = `UPDATE ${devTableName} SET active = ${active}, accessLevel = ${accessLevel} WHERE _id = ${_id};`;
        // console.log(queryCmd);
        let result = await queryTemplate(db, queryCmd, "setSharedBdDevActive Finally");
        return result;
    } catch (error){
        console.log(error.message);
        return null;
    }
}

async function addSharedBdDev(info, email_user) {
    try {
        const queryCmd = `INSERT INTO ${devTableName} (
            unix, buidling_id, area_id, bdDev_id, user_id, owner_id, accessLevel)
            VALUES (UNIX_TIMESTAMP(),
            ${info.buidling_id}, 
            "0", ${info.bdDev_id}, ${email_user}, ${info.owner_id}, ${info.accessLevel});`;
        let result = await queryTemplate(db, queryCmd, "addSharedBdDev Finally");
        return result;
    } catch (error){
        console.log(error.message);
        return null;
    }
}

async function getCountSharedBdDev_byBd(bd_id) {
    try {
        const queryCmd = `SELECT COUNT(*) as count FROM ${devTableName} WHERE buidling_id = ${bd_id} and active = true;`;
        let result = await queryTemplate(db, queryCmd, "getCountSharedBdDev_byBd Finally");
        // console.log(result);
        const rtnResult = result.map(b => b);
        // console.log(rtnResult[0].count); 
        return rtnResult[0].count;     
    } catch (error){
        console.log(error.message);
        return null;
    }
}

async function getUniqueUserIdList_ByBdList(bdList) {
    try {
        let sBdList = bdList.toString();
        const queryCmd = `select DISTINCT user_id from ${devTableName} where active =1 and buidling_id in (${sBdList});`
        let result = await queryTemplate(db, queryCmd, "getUniqueUserIdList_ByBdList Finally");
        // console.log(result);
        const rtnResult = result.map(b => b);
        return rtnResult;
    } catch (error){
        console.log(error.message);
        return null;
    }
}

async function getUniqueBdId_byUserId(user_id) {
    try {
        const queryCmd = `SELECT DISTINCT buidling_id FROM ${devTableName} WHERE active = 1 AND user_id = ${user_id};`
        let result = await queryTemplate(db, queryCmd, "getUniqueBdId_byUserId Finally");
        // console.log(result);
        const rtnResult = result.map(b => b);
        return rtnResult;
    } catch (error){
        console.log(error.message);
        return null;
    }
}

exports.getUniqueUserIdList_ByBdList=getUniqueUserIdList_ByBdList;
exports.getSharedBdBy_user_id_bd_id=getSharedBdBy_user_id_bd_id;
exports.getAreaByActiveUser_id=getAreaByActiveUser_id;
exports.getBuildingByActiveUser_id=getBuildingByActiveUser_id;
exports.getSensorSharedBy_user_bd_accesslvl = getSensorSharedBy_user_bd_accesslvl;
exports.getSharedevBy_userId_bdId = getSharedevBy_userId_bdId;
exports.getShareBdInfoGrantByUser_id=getShareBdInfoGrantByUser_id;

exports.setSharedBdActive = setSharedBdActive;
exports.addSharedBd = addSharedBd;
exports.updateSharedBd=updateSharedBd;

exports.setSharedBdDevActiveStatus = setSharedBdDevActiveStatus;
exports.addSharedBdDev = addSharedBdDev;
exports.getAllSharedevBy_userId_bdId = getAllSharedevBy_userId_bdId;
exports.getCountSharedBdDev_byBd = getCountSharedBdDev_byBd;
exports.getUniqueBdId_byUserId = getUniqueBdId_byUserId;