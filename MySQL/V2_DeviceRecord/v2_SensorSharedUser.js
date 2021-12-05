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
        console.log(ex.message)
        return null;       
    }
}



async function getBuildingByActiveUser_id (user_id){
    try {
        // const quertCmd = `SELECT * from ${bdTableName} WHERE user_id = ${user_id} and active = 1 and accessLevel = 1`;
        const quertCmd = `SELECT * from ${bdTableName} WHERE user_id = ${user_id} and active = 1`;
        // console.log(quertCmd);
        let result = await queryTemplate(db, quertCmd, "getBuildingByActiveUser_id Finally");
        // console.log(result);
        if(!result[0]) return [];     // return empty array
        const rtnResult = result.map(b=>b);
        return rtnResult;       
    } catch (error) {
        console.log(ex.message)
        return null;       
    }
}

async function getSensorSharedBy_TydevID (Info){
    return null;    
    // try {
    //     const quertCmd = `SELECT * from ${tableName} WHERE type = ${Info.type} and devID = ${Info.devID}`;
    //     // console.log(quertCmd);
    //     let result = await queryTemplate(db, quertCmd, "getSensorSharedBy_TydevID Finally");
    //     console.log(result);
    //     if(!result[0]) return [];     // return empty array
    //     const rtnResult = result.map(b=>b);
    //     return rtnResult;       
    // } catch (error) {
    //     console.log(ex.message)
    //     return null;       
    // }
}

async function getSharedBdBy_user_id_bd_id (user_id, bd_id){
    try {
        const quertCmd = `SELECT * from ${bdTableName} WHERE user_id = ${user_id} and active = 1 and buidling_id=${bd_id} `;
        // console.log(quertCmd);
        let result = await queryTemplate(db, quertCmd, "getSharedBdBy_user_id_bd_id Finally");
        // console.log(result);
        const rtnResult = result.map(b=>b);
        return rtnResult;       
    } catch (error) {
        console.log(ex.message)
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


exports.getSharedBdBy_user_id_bd_id=getSharedBdBy_user_id_bd_id;
exports.getAreaByActiveUser_id=getAreaByActiveUser_id;
exports.getBuildingByActiveUser_id=getBuildingByActiveUser_id;
exports.getSensorSharedBy_TydevID = getSensorSharedBy_TydevID;
exports.getSharedevBy_userId_bdId=getSharedevBy_userId_bdId;