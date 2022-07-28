const { insertTemplate, queryTemplate } = require("../queryData");

const db = "PDC";
const groupListTable = "PDC_GroupList";
const devListTable = "PDC_bdDevList";
const settingTable = "PDC_Setting";

// group list
async function PDC_insertGroupList(info) {
    try {
        const createTable = `CREATE TABLE IF NOT EXISTS ${groupListTable}(	
            _id int NOT NULL AUTO_INCREMENT,
            timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            unix INT(11) NOT NULL,	
            name varchar(80),
            sortIdx INT,
            PRIMARY KEY (_id)
       );`;
            
        const insertData = `INSERT INTO ${groupListTable} (unix, name, sortIdx)
        VALUES (UNIX_TIMESTAMP(), "${info.name}", ${info.sortIdx});`;        

        let result = await insertTemplate(db, createTable, insertData, "PDC_insertAreaList Finally");
        if (!result) return null    // insert error
        if (result.affectedRows > 0 && result.insertId > 0) return { success: true, insertId: result.insertId }

    } catch (error){
        console.log(error.message);
        return null;
    }
}

async function PDC_getGroupList (){
    let fnName = "PDC_getGroupList";
    try {        
        const queryCmd = `SELECT * from ${groupListTable} ORDER BY sortIdx;`;
        // console.log(quertCmd);
        let result = await queryTemplate(db, queryCmd, `${fnName} Finally`);
        // console.log(result);
        if(!result[0]) return [];     // return empty array
        const rtnResult = result.map(b=>b);
        return rtnResult;       
    } catch (error) {
        console.log(`Error : ${fnName}`);
        console.log(error.message)
        return null;       
    }
}

async function PDC_updateGroupSortIdx(info){
    let fnName = "PDC_updateGroupSortIdx";
    try {        
        const queryCmd = `UPDATE ${groupListTable} SET sortIdx = ${info.sortIdx} where _id = ${info._id};`;
        // console.log(quertCmd);
        let result = await queryTemplate(db, queryCmd, `${fnName} Finally`);
        // console.log(result);
        if(!result[0]) return [];     // return empty array
        const rtnResult = result.map(b=>b);
        return rtnResult;       
    } catch (error) {
        console.log(`Error : ${fnName}`);
        console.log(error.message)
        return null;       
    }
}

async function PDC_deleteGroupList(group_id){
    let fnName = "PDC_deleteGroupList";
    try {        
        const queryCmd = `DELETE from ${groupListTable} WHERE _id = ${group_id};`;
        // console.log(quertCmd);
        let result = await queryTemplate(db, queryCmd, `${fnName} Finally`);
        // console.log(result);
        if(!result[0]) return [];     // return empty array
        const rtnResult = result.map(b=>b);
        return rtnResult;       
    } catch (error) {
        console.log(`Error : ${fnName}`);
        console.log(error.message)
        return null;       
    }
}

// bddev list
async function PDC_insertDevList(info) {
    try {
        const createTable = `CREATE TABLE IF NOT EXISTS ${devListTable}(	
            _id int NOT NULL AUTO_INCREMENT,
            timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            unix INT(11) NOT NULL,	
            bdDev_id INT,
            group_id INT,
            sortIdx INT,
            PRIMARY KEY (_id)
       );`;
            
        const insertData = `INSERT INTO ${devListTable} (unix, bdDev_id, group_id, sortIdx)
        VALUES (UNIX_TIMESTAMP(), "${info.bdDev_id}", ${info.group_id}, ${info.sortIdx});`;        

        let result = await insertTemplate(db, createTable, insertData, "PDC_insertAreaList Finally");
        if (!result) return null    // insert error
        if (result.affectedRows > 0 && result.insertId > 0) return { success: true, insertId: result.insertId }

    } catch (error){
        console.log(error.message);
        return null;
    }
}

async function PDC_getBdDevListbyGroup_id (group_id){
    let fnName = "PDC_getBdDevListbyGroup_id";
    try {        
        const queryCmd = `SELECT * from ${devListTable} WHERE group_id = ${group_id} ORDER BY sortIdx;`;
        // console.log(quertCmd);
        let result = await queryTemplate(db, queryCmd, `${fnName} Finally`);
        // console.log(result);
        if(!result[0]) return [];     // return empty array
        const rtnResult = result.map(b=>b);
        return rtnResult;       
    } catch (error) {
        console.log(`Error : ${fnName}`);
        console.log(error.message)
        return null;       
    }
}

async function PDC_updateBdDevSortIdx(info){
    let fnName = "PDC_updateBdDevSortIdx";
    try {        
        const queryCmd = `UPDATE ${devListTable} SET sortIdx = ${info.sortIdx} where bdDev_id = ${info.bdDev_id};`;
        // console.log(quertCmd);
        let result = await queryTemplate(db, queryCmd, `${fnName} Finally`);
        // console.log(result);
        if(!result[0]) return [];     // return empty array
        const rtnResult = result.map(b=>b);
        return rtnResult;       
    } catch (error) {
        console.log(`Error : ${fnName}`);
        console.log(error.message)
        return null;       
    }
}

async function PDC_deleteBdDevByGroupId(group_id){
    let fnName = "PDC_deleteBdDevByGroupId";
    try {        
        const queryCmd = `DELETE FROM ${devListTable} WHERE group_id = ${group_id};`;
        // console.log(quertCmd);
        let result = await queryTemplate(db, queryCmd, `${fnName} Finally`);
        // console.log(result);
        if(!result[0]) return [];     // return empty array
        const rtnResult = result.map(b=>b);
        return rtnResult;       
    } catch (error) {
        console.log(`Error : ${fnName}`);
        console.log(error.message)
        return null;       
    }
}

async function PDC_deleteBdDevByBdDevId(bdDev_id){
    let fnName = "PDC_deleteBdDevByBdDevId";
    try {        
        const queryCmd = `DELETE FROM ${devListTable} WHERE bdDev_id = ${bdDev_id};`;
        // console.log(quertCmd);
        let result = await queryTemplate(db, queryCmd, `${fnName} Finally`);
        // console.log(result);
        if(!result[0]) return [];     // return empty array
        const rtnResult = result.map(b=>b);
        return rtnResult;       
    } catch (error) {
        console.log(`Error : ${fnName}`);
        console.log(error.message)
        return null;       
    }
}

// upper lower limit setting
async function PDC_insertSetting(info) {
    try {
        const createTable = `CREATE TABLE IF NOT EXISTS ${settingTable}(	
            _id int NOT NULL AUTO_INCREMENT,
            timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            unix INT(11) NOT NULL,	
            bdDev_id INT,
            t_lower FLOAT,
            t_upper FLOAT,
            h_lower FLOAT,
            h_upper FLOAT,
            PRIMARY KEY (_id)
       );`;
            
        const insertData = `INSERT INTO ${settingTable} (unix, bdDev_id, t_lower, t_upper, h_lower, h_upper)
        VALUES (UNIX_TIMESTAMP(), ${info.bdDev_id}, ${info.t_lower}, ${info.t_upper}, ${info.h_lower}, ${info.h_upper});`;        

        let result = await insertTemplate(db, createTable, insertData, "PDC_insertSetting Finally");
        if (!result) return null    // insert error
        if (result.affectedRows > 0 && result.insertId > 0) return { success: true, insertId: result.insertId }

    } catch (error){
        console.log(error.message);
        return null;
    }
}

async function PDC_getSetting(){
    let fnName = "PDC_getSetting";
    try {        
        const queryCmd = `SELECT * from ${settingTable};`;
        // console.log(quertCmd);
        let result = await queryTemplate(db, queryCmd, `${fnName} Finally`);
        // console.log(result);
        if(!result[0]) return [];     // return empty array
        const rtnResult = result.map(b=>b);
        return rtnResult;       
    } catch (error) {
        console.log(`Error : ${fnName}`);
        console.log(error.message)
        return null;       
    }
}

async function PDC_getSettingByBdDevID(bdDev_id){
    let fnName = "PDC_getSettingByBdDevID";
    try {        
        const queryCmd = `SELECT * from ${settingTable} WHERE bdDev_id = ${bdDev_id};`;
        // console.log(quertCmd);
        let result = await queryTemplate(db, queryCmd, `${fnName} Finally`);
        // console.log(result);
        if(!result[0]) return [];     // return empty array
        const rtnResult = result.map(b=>b);
        return rtnResult;       
    } catch (error) {
        console.log(`Error : ${fnName}`);
        console.log(error.message)
        return null;       
    }
}

async function PDC_setSetting(info) {
    try {
        const queryCmd = `UPDATE ${settingTable} SET t_lower = ${info.t_lower}, t_upper = ${info.t_upper},
                            h_lower = ${info.h_lower}, h_upper = ${info.h_upper} WHERE bdDev_id = ${info.bdDev_id};`;
        let result = await queryTemplate(db, queryCmd, "PDC_setSetting Finally");
        return result;
    } catch (error){
        console.log(error.message);
        return null;
    }
}

exports.PDC_insertGroupList = PDC_insertGroupList;
exports.PDC_getGroupList = PDC_getGroupList;
exports.PDC_updateGroupSortIdx = PDC_updateGroupSortIdx;
exports.PDC_deleteGroupList = PDC_deleteGroupList;

exports.PDC_insertDevList = PDC_insertDevList;
exports.PDC_getBdDevListbyGroup_id = PDC_getBdDevListbyGroup_id;
exports.PDC_updateBdDevSortIdx = PDC_updateBdDevSortIdx;
exports.PDC_deleteBdDevByGroupId = PDC_deleteBdDevByGroupId;
exports.PDC_deleteBdDevByBdDevId = PDC_deleteBdDevByBdDevId;

exports.PDC_insertSetting = PDC_insertSetting;
exports.PDC_getSetting = PDC_getSetting;
exports.PDC_getSettingByBdDevID = PDC_getSettingByBdDevID;
exports.PDC_setSetting = PDC_setSetting;
