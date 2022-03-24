const { notArrOrEmptyArr } = require("../../utilities/validateFn");
const { insertTemplate, queryTemplate } = require("../queryData");

const V2_actionDb = "V2_Action";

const contactTable = 'V2_tele_contactList';
const groupTable = 'V2_tele_groupList';
const contactUnderGroupTable = 'V2_tele_contactUnderGroup';
const bdDefSubListTable = 'V2_tele_bdDefaultSubList';
const teleEventSubListTable = 'V2_tele_AlgoSubList';


async function insertTeleContactList(contactInfo, user_id) {    
    try {
        const createTable = `CREATE TABLE IF NOT EXISTS ${contactTable}(	
            _id int NOT NULL AUTO_INCREMENT,
            timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            unix INT(11) NOT NULL,
            name varchar(40),
            chatId varchar(20),
            addByUser_id int,
            inUse tinyint default 1,
            PRIMARY KEY (_id)
        );`;

        const insertData = `INSERT INTO ${contactTable} (unix, name, chatId, addByUser_id)
        VALUES (UNIX_TIMESTAMP(), "${contactInfo.name}", "${contactInfo.chatId}", ${user_id});`;
        // console.log("insertData: ", insertData);
        
        let result = await insertTemplate(V2_actionDb, createTable, insertData, "insertTeleContactList");
        // console.log("insertFormula rel: ", result);
        if(!result) return false    // insert error
        if(result.affectedRows > 0 && result.insertId > 0) return {success:true, insertId:result.insertId}
        // console.log("Insert Error");
        return false;   // insert no row effec
        
    } catch (error) {
        console.log("insertTeleContactList Err : ", error.message);
        return false
    }  
}

async function getTeleContactListBy_IdList(_idList){
    try {
        if(notArrOrEmptyArr(_idList)) return [];
        let sList = '';
        for (const iterator of _idList) {
            if(sList!=='') sList+=', '
            sList+=iterator;
        }        
        const quertCmd = `SELECT * from ${contactTable} WHERE 
        _id in (${sList}) and inUse = 1;
        `;
        // console.log(quertCmd);
        let result = await queryTemplate(V2_actionDb, quertCmd, "getTeleContactListBy_IdList Done");
        if(!result[0]) return [];     // no item found in list
        const rows = result.map(b=>b);
        // console.log(rows);
        return rows;    
    } catch (error) {
        console.log("getTeleContactListBy_IdList Error", error.message);
        return [];
    }
}


/** check duplicated name / chat id belong to same user exist  */
async function checkName_ChatID_duplicated (contact, user_id){
    try {
        const quertCmd = `SELECT * from ${contactTable} WHERE (name = "${contact.name}" or chatId = "${contact.chatId}") and addByUser_id=${user_id} and inUse = 1`;
        // select * from V2_ReactTrigAlgo where bdDevInvolve like "%,6,%";
        // console.log(quertCmd);
        let result = await queryTemplate(V2_actionDb, quertCmd, "checkName_ChatID_duplicated Finally");
        // console.log(result);
        if(!result[0]) return [];     // return empty array
        const rtnResult = result.map(b=>b);
        return rtnResult;       
    } catch (error) {
        console.log("Error : getOneInaciveFormula");
        console.log(error.message)
        return [];       
    }
}

/** get inUse 0, limit 1  */
async function getSingleNotInuse (){
    try {
        const quertCmd = `SELECT * from ${contactTable} WHERE inUse = 0 limit 1`;
        // select * from V2_ReactTrigAlgo where bdDevInvolve like "%,6,%";
        // console.log(quertCmd);
        let result = await queryTemplate(V2_actionDb, quertCmd, "getSingleNotInuse Finally");
        // console.log(result);
        if(!result[0]) return [];     // return empty array
        const rtnResult = result.map(b=>b);
        return rtnResult;       
    } catch (error) {
        console.log("Error : getOneInaciveFormula");
        console.log(error.message)
        return [];       
    }
}

/** get active contact by user_id */
async function getInuseContactbyUser_id (user_id){
    try {
        const quertCmd = `SELECT * from ${contactTable} WHERE inUse = 1 and addByUser_id=${user_id}`;
        // select * from V2_ReactTrigAlgo where bdDevInvolve like "%,6,%";
        // console.log(quertCmd);
        let result = await queryTemplate(V2_actionDb, quertCmd, "getInuseContactbyUser_id Finally");
        // console.log(result);
        if(!result[0]) return [];     // return empty array
        const rtnResult = result.map(b=>b);
        return rtnResult;       
    } catch (error) {
        console.log("Error : getOneInaciveFormula");
        console.log(error.message)
        return [];       
    }
}
async function getInuseContactby_id (_id){
    try {
        const quertCmd = `SELECT * from ${contactTable} WHERE inUse = 1 and _id=${_id}`;
        // select * from V2_ReactTrigAlgo where bdDevInvolve like "%,6,%";
        // console.log(quertCmd);
        let result = await queryTemplate(V2_actionDb, quertCmd, "getInuseContactby_id Finally");
        // console.log(result);
        if(!result[0]) return [];     // return empty array
        const rtnResult = result.map(b=>b);
        return rtnResult;       
    } catch (error) {
        console.log("Error : getInuseContactby_id", error.message);
        return [];       
    }
}

/** get contact group by user_id */
async function getInuseGroupbyUser_id (user_id){
    try {
        const quertCmd = `SELECT * from ${groupTable} WHERE inUse = 1 and addByUser_id=${user_id}`;
        // select * from V2_ReactTrigAlgo where bdDevInvolve like "%,6,%";
        // console.log(quertCmd);
        let result = await queryTemplate(V2_actionDb, quertCmd, "getInuseGroupbyUser_id Finally");
        // console.log(result);
        if(!result[0]) return [];     // return empty array
        const rtnResult = result.map(b=>b);
        return rtnResult;       
    } catch (error) {
        console.log("Error : getOneInaciveFormula");
        console.log(error.message)
        return [];       
    }
}
async function getInuseGroupby_id (_id){
    try {
        const quertCmd = `SELECT * from ${groupTable} WHERE inUse = 1 and _id=${_id}`;
        // select * from V2_ReactTrigAlgo where bdDevInvolve like "%,6,%";
        // console.log(quertCmd);
        let result = await queryTemplate(V2_actionDb, quertCmd, "getInuseGroupby_id Finally");
        // console.log(result);
        if(!result[0]) return [];     // return empty array
        const rtnResult = result.map(b=>b);
        return rtnResult;       
    } catch (error) {
        console.log("Error : getInuseGroupby_id", error.message);
        return [];       
    }
}

async function getTeleGroupListBy_IdList(_idList){
    try {
        if(notArrOrEmptyArr(_idList)) return [];
        let sList = '';
        for (const iterator of _idList) {
            if(sList!=='') sList+=', '
            sList+=iterator;
        }        
        const quertCmd = `SELECT * from ${groupTable} WHERE 
        _id in (${sList}) and inUse = 1;
        `;
        // console.log(quertCmd);
        let result = await queryTemplate(V2_actionDb, quertCmd, "getTeleGroupListBy_IdList Done");
        if(!result[0]) return [];     // no item found in list
        const rows = result.map(b=>b);
        // console.log(rows);
        return rows;    
    } catch (error) {
        console.log("getTeleGroupListBy_IdList Error", error.message);
        return [];
    }
}



async function updateContactList(info, user_id, _id){
    try {
        const quertCmd = `UPDATE ${contactTable} SET 
            unix=UNIX_TIMESTAMP(),
            name = "${info.name}",
            chatId = "${info.chatId}",
            addByUser_id = ${user_id},
            inUse = 1
            where _id = ${_id}`;
        // console.log("quertCmd", quertCmd);
        
        let result = await queryTemplate(V2_actionDb, quertCmd, "updateContactList Finally");
        // console.log(result);
        if(!result || !result.affectedRows) return null;
        if(result.affectedRows > 0 ) return true;
        return null       

    } catch (error) {
        console.log("Error : updateContactList");
        console.log(error.message)
        return null;       
    }
}


async function insertGroupTable(groupName, user_id) {    
    try {
        const createTable = `CREATE TABLE IF NOT EXISTS ${groupTable}(	
            _id int NOT NULL AUTO_INCREMENT,
            timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            unix INT(11) NOT NULL,
            name varchar(40),
            addByUser_id int,
            inUse tinyint default 1,
            PRIMARY KEY (_id)
        );`;
    
        const insertData = `INSERT INTO ${groupTable} (unix, name, addByUser_id)
        VALUES (UNIX_TIMESTAMP(), "${groupName}", ${user_id});`;
        // console.log("insertData: ", insertData);
        
        let result = await insertTemplate(V2_actionDb, createTable, insertData, "insertGroupTable");
        // console.log("insertFormula rel: ", result);
        if(!result) return false    // insert error
        if(result.affectedRows > 0 && result.insertId > 0) return {success:true, insertId:result.insertId}
        // console.log("Insert Error");
        return false;   // insert no row effec
    } catch (error) {
        console.log("insertGroupTable Err : ", error.message);
        return false
    }
    
}

async function insertContactUnderGroup(group_id, contact_id, user_id) {
    try {
        const createTable = `CREATE TABLE IF NOT EXISTS ${contactUnderGroupTable}(	
            _id int NOT NULL AUTO_INCREMENT,
            timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            unix INT(11) NOT NULL,
            teleGroup_id int,
            teleContact_id int,
            addByUser_id int,
            inUse tinyint default 1,
            PRIMARY KEY (_id)
        );`;
    
        const insertData = `INSERT INTO ${contactUnderGroupTable} (unix, teleGroup_id, teleContact_id, addByUser_id)
        VALUES (UNIX_TIMESTAMP(), ${group_id}, ${contact_id}, ${user_id});`;
        // console.log("insertData: ", insertData);
        
        let result = await insertTemplate(V2_actionDb, createTable, insertData, "insertContactUnderGroup");
        // console.log("insertFormula rel: ", result);
        if(!result) return false    // insert error
        if(result.affectedRows > 0 && result.insertId > 0) return {success:true, insertId:result.insertId}
        // console.log("Insert Error");
        return false;   // insert no row effec
    } catch (error) {
        console.log("insertContactUnderGroup Err : ", error.message);
        return false
    }
    
}

async function getContactUnderGroupBy_teleGroup_id (teleGroup_id){
    try {
        const quertCmd = `SELECT * from ${contactUnderGroupTable} WHERE inUse = 1 and teleGroup_id=${teleGroup_id}`;
        // select * from V2_ReactTrigAlgo where bdDevInvolve like "%,6,%";
        // console.log(quertCmd);
        let result = await queryTemplate(V2_actionDb, quertCmd, "getContactUnderGroupBy_teleGroup_id Finally");
        // console.log(result);
        if(!result[0]) return [];     // return empty array
        const rtnResult = result.map(b=>b);
        return rtnResult;       
    } catch (error) {
        console.log("Error : getContactUnderGroupBy_teleGroup_id", error.message);
        return {errMsg:"Load telegram group member error (DB)"};
    }
}


async function getBdDefSubBy_bd_id (bd_id){
    try {
        const quertCmd = `SELECT * from ${bdDefSubListTable} WHERE inUse = 1 and bd_id=${bd_id}`;
        // select * from V2_ReactTrigAlgo where bdDevInvolve like "%,6,%";
        // console.log(quertCmd);
        let result = await queryTemplate(V2_actionDb, quertCmd, "getBdDefSubBy_bd_id Finally");
        // console.log(result);
        if(!result[0]) return [];     // return empty array
        const rtnResult = result.map(b=>b);
        return rtnResult;       
    } catch (error) {
        console.log("Error : getBdDefSubBy_bd_id", error.message);
        return {errMsg:"Load Default Subscribe list error (DB)"};
    }
}

async function setNotInuseDefSub(bd_id, subType, sub_id){
    try {
        const quertCmd = `UPDATE ${bdDefSubListTable} SET 
            unix=UNIX_TIMESTAMP(),
            inUse = 0
            where bd_id = ${bd_id} and
            subType = ${subType} and
            sub_id = ${sub_id} `;
        // console.log("quertCmd", quertCmd);
        
        let result = await queryTemplate(V2_actionDb, quertCmd, "setNotInuseDefSub Finally");
        // console.log(result);
        if(!result || !result.affectedRows) return null;
        if(result.affectedRows > 0 ) return true;
        return null       

    } catch (error) {
        console.log("Error : setNotInuseDefSub", error.message);
        return null;       
    }
}

async function selectNotInuseDefSub (){
    try {
        const quertCmd = `SELECT * from ${bdDefSubListTable} WHERE inUse = 0 limit 1`;
        // select * from V2_ReactTrigAlgo where bdDevInvolve like "%,6,%";
        // console.log(quertCmd);
        let result = await queryTemplate(V2_actionDb, quertCmd, "selectNotInuseDefSub Finally");
        // console.log(result);
        if(!result[0]) return [];     // return empty array
        const rtnResult = result.map(b=>b);
        return rtnResult;       
    } catch (error) {
        console.log("Error : selectNotInuseDefSub", error.message);
        return [];
    }
}

async function insertDefSub(bd_id, subType, sub_id, user_id) {
    try {
        const createTable = `CREATE TABLE IF NOT EXISTS ${bdDefSubListTable}(	
            _id int NOT NULL AUTO_INCREMENT,
            timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            unix INT(11) NOT NULL,
            bd_id int,
            subType smallint,
            sub_id int,
            addByUser_id int,
            inUse tinyint default 1,
            PRIMARY KEY (_id)
        );`;
    
        const insertData = `INSERT INTO ${bdDefSubListTable} (unix, bd_id, subType, sub_id, addByUser_id)
        VALUES (UNIX_TIMESTAMP(), ${bd_id}, ${subType}, ${sub_id}, ${user_id});`;
        // console.log("insertData: ", insertData);
        
        let result = await insertTemplate(V2_actionDb, createTable, insertData, "insertDefSub finally");
        // console.log("insertFormula rel: ", result);
        if(!result) return false    // insert error
        if(result.affectedRows > 0 && result.insertId > 0) return {success:true, insertId:result.insertId}
        // console.log("Insert Error");
        return false;   // insert no row effec
    } catch (error) {
        console.log("insertDefSub Err : ", error.message);
        return false
    }    
}

async function updateAsInUseDefSub(bd_id, subType, sub_id, _id){
    try {
        const quertCmd = `UPDATE ${bdDefSubListTable} SET 
            unix=UNIX_TIMESTAMP(),
            inUse = 1, 
            bd_id = ${bd_id},
            subType = ${subType},
            sub_id = ${sub_id}
            where _id = ${_id}`;
        // console.log("quertCmd", quertCmd);
        
        let result = await queryTemplate(V2_actionDb, quertCmd, "updateAsInUseDefSub Finally");
        // console.log(result);
        if(!result || !result.affectedRows) return null;
        if(result.affectedRows > 0 ) return true;
        return null       

    } catch (error) {
        console.log("Error : updateAsInUseDefSub", error.message);
        return null;       
    }
}

/** Tele event subscribe list  */
async function insertTeleEventSub(info) {
    // console.log("insert info", info);
    try {
        const createTable = `CREATE TABLE IF NOT EXISTS ${teleEventSubListTable}(	
            _id int NOT NULL AUTO_INCREMENT,
            timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            unix INT(11) NOT NULL,
            algo_id int,
            subType smallint,
            sub_id int,
            addByUser_id int,
            inUse tinyint default 1,
            PRIMARY KEY (_id)
        );`;
    
        const insertData = `INSERT INTO ${teleEventSubListTable} (unix, algo_id, subType, sub_id, addByUser_id)
        VALUES (UNIX_TIMESTAMP(), ${info.algo_id}, ${info.subType}, ${info.sub_id}, ${info.addByUser_id});`;
        // console.log("insertData: ", insertData);
        
        let result = await insertTemplate(V2_actionDb, createTable, insertData, "insertTeleEventSub finally");
        // console.log("insertFormula rel: ", result);
        if(!result) return false    // insert error
        if(result.affectedRows > 0 && result.insertId > 0) return {success:true, insertId:result.insertId}
        // console.log("Insert Error");
        return false;   // insert no row effec
    } catch (error) {
        console.log("insertTeleEventSub Err : ", error.message);
        return false
    }    
}

async function updateTeleEventSub(info, _id){    
    // console.log("update info", info);
    try {
        const quertCmd = `UPDATE ${teleEventSubListTable} SET 
            unix=UNIX_TIMESTAMP(),
            inUse = 1, 
            algo_id = ${info.algo_id},
            subType = ${info.subType},
            sub_id = ${info.sub_id},
            addByUser_id = ${info.addByUser_id}
            where _id = ${_id}`;
        // console.log("quertCmd", quertCmd);
        
        let result = await queryTemplate(V2_actionDb, quertCmd, "updateTeleEventSub Finally");
        // console.log(result);
        if(!result || !result.affectedRows) return null;
        if(result.affectedRows > 0 ) return true;
        return null       

    } catch (error) {
        console.log("Error : updateTeleEventSub", error.message);
        return null;       
    }
}

async function updateTeleEventSub_inUse(_id, inUse){
    try {
        const quertCmd = `UPDATE ${teleEventSubListTable} SET inUse = ${inUse} where algo_id = ${_id}`;
        // console.log("quertCmd", quertCmd);
        
        let result = await queryTemplate(V2_actionDb, quertCmd, "updateTeleEventSub_inUse Finally");
        // console.log(result);
        if(!result || !result.affectedRows) return null;
        if(result.affectedRows > 0 ) return true;
        return null       

    } catch (error) {
        console.log("Error : updateTeleEventSub_inUse", error.message);
        return null;       
    }
}

async function getTeleEventSubBy_Algo_id (algo_id){
    try {
        const quertCmd = `SELECT * from ${teleEventSubListTable} WHERE inUse = 1 and algo_id=${algo_id}`;
        // select * from V2_ReactTrigAlgo where bdDevInvolve like "%,6,%";
        // console.log(quertCmd);
        let result = await queryTemplate(V2_actionDb, quertCmd, "getTeleEventSubBy_Algo_id Finally");
        // console.log(result);
        if(!result[0]) return [];     // return empty array
        const rtnResult = result.map(b=>b);
        return rtnResult;       
    } catch (error) {
        console.log("Error : getTeleEventSubBy_Algo_id", error.message);
        return [];
    }
}




/** variable */
exports.teleEventSubListTable=teleEventSubListTable;
exports.V2_actionDb=V2_actionDb;

/** contact list */
exports.updateContactList=updateContactList;
exports.insertTeleContactList =insertTeleContactList;
exports.getTeleContactListBy_IdList=getTeleContactListBy_IdList;
exports.checkName_ChatID_duplicated=checkName_ChatID_duplicated;
exports.getSingleNotInuse=getSingleNotInuse;
exports.getInuseContactbyUser_id=getInuseContactbyUser_id;
exports.getInuseContactby_id=getInuseContactby_id;

/** Tele group */
exports.getInuseGroupby_id=getInuseGroupby_id;
exports.getInuseGroupbyUser_id=getInuseGroupbyUser_id;
exports.insertGroupTable=insertGroupTable;
exports.getTeleGroupListBy_IdList=getTeleGroupListBy_IdList;

/** contact under group */
exports.insertContactUnderGroup=insertContactUnderGroup;
exports.getContactUnderGroupBy_teleGroup_id=getContactUnderGroupBy_teleGroup_id;

/** default sub list */
exports.getBdDefSubBy_bd_id=getBdDefSubBy_bd_id;
exports.setNotInuseDefSub=setNotInuseDefSub;
exports.insertDefSub=insertDefSub;
exports.selectNotInuseDefSub=selectNotInuseDefSub;
exports.updateAsInUseDefSub=updateAsInUseDefSub;

exports.insertTeleEventSub=insertTeleEventSub;
exports.updateTeleEventSub=updateTeleEventSub;
exports.updateTeleEventSub_inUse = updateTeleEventSub_inUse;
exports.getTeleEventSubBy_Algo_id=getTeleEventSubBy_Algo_id;