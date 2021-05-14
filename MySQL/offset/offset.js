const { insertTemplate, queryTemplate } = require("../queryData");

const db = "RawDataLog";
const tableName = "RawOffset"

function getSqlSearchCondition(obj){    
    //select * from RawOffset where type = 1 and devID between 1 and 2 and DataKey = "temperature";    
    let prevConditonValid = false;
    if (!obj.type && !obj.DataKey && !obj.devIDStart && !obj.devIDEnd) return '';
    let sCondition = 'where';
    if (obj.type) {
        sCondition=`${sCondition} type=${obj.type}`;
        prevConditonValid = true;
    }
    if (obj.DataKey){
        if(prevConditonValid) sCondition = `${sCondition} and `;
        sCondition=`${sCondition} DataKey ="${obj.DataKey}"`;
        prevConditonValid = true;
    }
    if(obj.devIDStart!=0 && obj.devIDEnd!=0){
        if(prevConditonValid) sCondition = `${sCondition} and `;
        sCondition=`${sCondition} devID between ${obj.devIDStart} and ${obj.devIDEnd}`;
        prevConditonValid = true;
    }
    return sCondition;
}

async function getOffBySearchCriterion(obj){
    sCondition = getSqlSearchCondition(obj);
    // console.log(sCondition);
    const quertCmd = `SELECT * from ${tableName} ${sCondition}`;
        
    try {
        let result = await queryTemplate(db, quertCmd, "Get Offset Done");
        if(!result[0]) return [];     // no building in list
        // console.log(result);
        const offsetList = result.map(b=>b);
        return offsetList;        
    } catch (ex) {
        console.log(ex.message)
        return [];
        // return null;
    }
}

async function getOffsetByIdnKey(obj){
    const quertCmd = `SELECT * from ${tableName} where type = ${obj.type} and devID = ${obj.devID}`;
    // console.log(quertCmd);
    
    try {
        let result = await queryTemplate(db, quertCmd, "Get Offset Done");
        if(!result[0]) return [];     // no building in list
        // console.log(result);
        const offsetList = result.map(b=>b);
        return offsetList;        
    } catch (ex) {
        console.log(ex.message)
        return [];
        // return null;
    }
}

async function updateOffset(data){
    const quertCmd = `UPDATE ${tableName} SET timestamp = CURRENT_TIMESTAMP(),
    unix = UNIX_TIMESTAMP(),  
    offsetValue = ${data.offsetValue}    
    where _id = ${data._id}`;
    
    try {
        let result = await queryTemplate(db, quertCmd, "Offset Update Finally");
        // console.log("Update: ", result.affectedRows);        
        return result;        
    } catch (ex) {
        console.log(ex.message)
        return null;
    }
}


async function addOffset(device){    
    const createTable = `CREATE TABLE IF NOT EXISTS ${tableName}(		
        _id int NOT NULL AUTO_INCREMENT,
        timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        unix INT(11) NOT NULL,
        type SMALLINT NOT NULL,  
        devID INT NOT NULL,  
        DataKey varchar(80),
        offsetValue float,
        userAmmend varchar(80),
        PRIMARY KEY (_id)
    )`;

    // const insertBuilding = `INSERT INTO kittyMeow(unix, owner, building, country, state, area, postcode, userAmmend) 
    const queryCmd = `INSERT INTO ${tableName}(unix, type, devID, DataKey, offsetValue, userAmmend)
    VALUES (UNIX_TIMESTAMP(), ${device.type}, ${device.devID}, "${device.DataKey}", ${device.offsetValue}, "${device.userAmmend}")`;

    let result = await insertTemplate(db, createTable, queryCmd, "Register Offset succesful");
    // console.log("Insert result: ", result);
    return result;
}

async function delOffset(info){    
    // console.log(info);
    const queryCmd = `DELETE from ${tableName} where _id = ${info._id}`;
    
    try {
        let result = await queryTemplate(db, queryCmd, "Delete Offset Finally");
        // console.log("Update: ", result.affectedRows);        
        return result;        
    } catch (ex) {
        console.log(ex.message)
        return null;
    }
}

exports.delOffset=delOffset;
exports.addOffset=addOffset;
exports.updateOffset = updateOffset;
exports.getOffBySearchCriterion= getOffBySearchCriterion;
exports.getOffsetByIdnKey=getOffsetByIdnKey;