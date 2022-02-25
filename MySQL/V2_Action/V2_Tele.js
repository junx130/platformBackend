const { insertTemplate, queryTemplate } = require("../queryData");

const db = "V2_Action";

const contactTable = 'V2_tele_contactList';
const groupTable = 'V2_tele_groupList';
const contactUnderGroupTable = 'V2_tele_contactUnderGroup';

async function insertTeleContactList(contactInfo, user_id) {    
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
    
    let result = await insertTemplate(db, createTable, insertData, "insertTeleContactList");
    // console.log("insertFormula rel: ", result);
    if(!result) return false    // insert error
    if(result.affectedRows > 0 && result.insertId > 0) return {success:true, insertId:result.insertId}
    // console.log("Insert Error");
    return false;   // insert no row effec
}


/** check duplicated name / chat id belong to same user exist  */
async function checkName_ChatID_duplicated (contact, user_id){
    try {
        const quertCmd = `SELECT * from ${contactTable} WHERE (name = "${contact.name}" or chatId = "${contact.chatId}") and addByUser_id=${user_id} and inUse = 1`;
        // select * from V2_ReactTrigAlgo where bdDevInvolve like "%,6,%";
        // console.log(quertCmd);
        let result = await queryTemplate(db, quertCmd, "checkName_ChatID_duplicated Finally");
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
        let result = await queryTemplate(db, quertCmd, "getSingleNotInuse Finally");
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
        let result = await queryTemplate(db, quertCmd, "getInuseContactbyUser_id Finally");
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

/** get contact group by user_id */
async function getInuseGroupbyUser_id (user_id){
    try {
        const quertCmd = `SELECT * from ${groupTable} WHERE inUse = 1 and addByUser_id=${user_id}`;
        // select * from V2_ReactTrigAlgo where bdDevInvolve like "%,6,%";
        // console.log(quertCmd);
        let result = await queryTemplate(db, quertCmd, "getInuseGroupbyUser_id Finally");
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
        
        let result = await queryTemplate(db, quertCmd, "updateContactList Finally");
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
        
        let result = await insertTemplate(db, createTable, insertData, "insertGroupTable");
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
        
        let result = await insertTemplate(db, createTable, insertData, "insertContactUnderGroup");
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

exports.updateContactList=updateContactList;
exports.insertTeleContactList =insertTeleContactList;
exports.checkName_ChatID_duplicated=checkName_ChatID_duplicated;
exports.getSingleNotInuse=getSingleNotInuse;
exports.getInuseContactbyUser_id=getInuseContactbyUser_id;
exports.getInuseGroupbyUser_id=getInuseGroupbyUser_id;
exports.insertGroupTable=insertGroupTable;
exports.insertContactUnderGroup=insertContactUnderGroup;