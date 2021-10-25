const { insertTemplate, queryTemplate } = require("../queryData");

const db = "V2_DeviceRecord";
const tableName = "V2_SensorSharedUser";
const bdTableName = "V2_ShareList_bd";
const areaTableName = "V2_ShareList_area";

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
        const quertCmd = `SELECT * from ${bdTableName} WHERE user_id = ${user_id} and active = 1 and accessLevel = 1`;
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

exports.getAreaByActiveUser_id=getAreaByActiveUser_id;
exports.getBuildingByActiveUser_id=getBuildingByActiveUser_id;
exports.getSensorSharedBy_TydevID = getSensorSharedBy_TydevID;