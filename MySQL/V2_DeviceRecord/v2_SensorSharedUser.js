const { insertTemplate, queryTemplate } = require("../queryData");

const db = "V2_DeviceRecord";
const tableName = "V2_SensorSharedUser";
const bdTableName = "V2_ShareList_bd";
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
        let quertCmd = `SELECT * from ${bdTableName} WHERE user_id = ${user_id} and active = 1`;
        if(accessLevel) quertCmd = `SELECT * from ${bdTableName} WHERE user_id = ${user_id} and active = 1 and accessLevel = ${accessLevel}`;
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
        let quertCmd = `SELECT * from ${bdTableName} WHERE user_id = ${user_id} and active = 1 and buidling_id=${bd_id} `;
        if(!bCheckActive) quertCmd = `SELECT * from ${bdTableName} WHERE user_id = ${user_id} and buidling_id=${bd_id} `;
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
        const queryCmd = `UPDATE ${bdTableName} SET accessLevel = ${accessLevel}, active = true WHERE user_id = ${user_id} AND buidling_id = ${bd_id};`;
        let result = await queryTemplate(db, queryCmd, "setSharedBdActive Finally");
        return result;
    } catch (error){
        console.log(error.message);
        return null;
    }
}

async function addSharedBd(info, user_id) {
    try {
        const queryCmd = `INSERT INTO ${bdTableName} (
            unix, buidling_id, user_id, owner_id, accessLevel)
            VALUES (UNIX_TIMESTAMP(), ${info.buidling_id}, ${user_id}, ${info.owner_id}, ${info.accessLevel});`;
        let result = await queryTemplate(db, queryCmd, "addSharedBd Finally");
        return result;
    } catch (error){
        console.log(error.message);
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
        console.log(rtnResult[0].count); 
        return rtnResult[0].count;     
    } catch (error){
        console.log(error.message);
        return null;
    }
}

exports.getSharedBdBy_user_id_bd_id=getSharedBdBy_user_id_bd_id;
exports.getAreaByActiveUser_id=getAreaByActiveUser_id;
exports.getBuildingByActiveUser_id=getBuildingByActiveUser_id;
exports.getSensorSharedBy_user_bd_accesslvl = getSensorSharedBy_user_bd_accesslvl;
exports.getSharedevBy_userId_bdId = getSharedevBy_userId_bdId;
exports.setSharedBdActive = setSharedBdActive;
exports.addSharedBd = addSharedBd;
exports.setSharedBdDevActiveStatus = setSharedBdDevActiveStatus;
exports.addSharedBdDev = addSharedBdDev;
exports.getAllSharedevBy_userId_bdId = getAllSharedevBy_userId_bdId;
exports.getCountSharedBdDev_byBd = getCountSharedBdDev_byBd;