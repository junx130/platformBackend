const Joi = require("joi");
const { insertTemplate, queryTemplate } = require("../queryData");
const jwt = require("jsonwebtoken");

const userDatabase = "V2_User";
const dbTable = "V2_UserResetPass";
const userTable = "V2_Users";


async function v2a_getUser (user_id){
    let sErrTitle = "v2a_getUser";
    try {
        let quertCmd = `SELECT * from ${userTable} WHERE _id = ${user_id} and active = 1`;
        // console.log(quertCmd);
        let result = await queryTemplate(userDatabase, quertCmd, `${sErrTitle} Finally`);
        // console.log(result);
        if(!result[0]) return [];     // return empty array
        const rtnResult = result.map(b=>b);
        return rtnResult;
    } catch (error) {
        console.log(`${sErrTitle}`, error.message)
        return null;
    }
}

async function getByUserId(userid) {    
    const quertCmd = `SELECT * from ${dbTable} WHERE user_id = "${userid}" ORDER BY _id DESC LIMIT 1;`;

    try {
        let result = await queryTemplate(userDatabase, quertCmd, "Get User Done");
        return result[0];        
    } catch (ex) {
        console.log(ex.message)
        return null;
    }
}

async function getByEmail(email) {    
    const quertCmd = `SELECT * from ${dbTable} WHERE email = "${email}" ORDER BY _id DESC LIMIT 1;`;

    try {
        let result = await queryTemplate(userDatabase, quertCmd, "Get User Done");
        return result[0];        
    } catch (ex) {
        console.log(ex.message)
        return null;
    }
}

async function getByToken(token) {    
    const quertCmd = `SELECT * from ${dbTable} WHERE resettoken = "${token}";`;

    try {
        let result = await queryTemplate(userDatabase, quertCmd, "Get User Done");
        return result[0];        
    } catch (ex) {
        console.log(ex.message)
        return null;
    }
}

async function insertResetPassword(info) {    
    const createTable = `CREATE TABLE IF NOT EXISTS ${dbTable}(	
        _id int NOT NULL AUTO_INCREMENT PRIMARY KEY,
        user_id int NOT NULL,
        email varchar(50) NOT NULL,
        resettoken varchar(100) NOT NULL,
        sendUnix varchar(20) NOT NULL,
        status boolean NOT NULL DEFAULT 0
    );`;
    
    const insertData = `INSERT INTO ${dbTable} (user_id, email, resettoken, sendUnix) 
    VALUES ("${info.user_id}", "${info.email}", "${info.resettoken}", "${info.sendUnix}");`;
    
    await insertTemplate(userDatabase, createTable, insertData, "InsertNewUserFinally");
}

async function updateResetStatus(token) {
    const queryCmd = `UPDATE ${dbTable} SET status = true WHERE resettoken = "${token}";`;
    try {
        let result = await queryTemplate(userDatabase, queryCmd, "Update Status Done");
        return result[0];
    } catch (ex) {
        console.log(ex.message);
        return null;
    }
}

exports.getByUserId = getByUserId;
exports.getByEmail = getByEmail;
exports.insertResetPassword = insertResetPassword;
exports.getByToken = getByToken;
exports.updateResetStatus = updateResetStatus;
exports.v2a_getUser=v2a_getUser;