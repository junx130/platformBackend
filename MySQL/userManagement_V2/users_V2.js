const Joi = require("joi");
const { insertTemplate, queryTemplate } = require("../queryData");
const jwt = require("jsonwebtoken");

const userDatabase = "V2_User";
const dbTable = "V2_Users";

function validateMessage(user){    
    const schema = {       
        username: Joi.string().required().min(6).max(30).label("Username"),
        email: Joi.string().email().max(255).required().label("Email"),
        password: Joi.string().required().min(8).max(255).label("Password"),
    }
    return Joi.validate(user, schema);
}

function validateUpdateUser(user){       
    const schema = {        
        username: Joi.string().min(6).max(80).required(),
        email: Joi.string().max(80).email(),
        // password: Joi.string().min(8).max(80).required(),
    }
    return Joi.validate(user, schema);
}

async function deleteUser(info) {    
    const quertCmd = `DELETE from ${dbTable} where username = "${info.username}"`;

    try {
        let result = await queryTemplate(userDatabase, quertCmd, "Delete User Finally");
        // console.log("Delete: ", result.affectedRows);        
        return result.affectedRows;        
    } catch (ex) {
        console.log(ex.message)
        return null;
    }
}

async function getAllUser() {    
    const quertCmd = `SELECT * from ${dbTable}`;

    try {
        let result = await queryTemplate(userDatabase, quertCmd, "Get All User Done");
        return result;        
    } catch (ex) {
        console.log(ex.message)
        return null;
    }
}

async function getUserByUsername(username) {    
    const quertCmd = `SELECT * from ${dbTable} WHERE username = "${username}"`;

    try {
        let result = await queryTemplate(userDatabase, quertCmd, "Get User Done");
        return result[0];        
    } catch (ex) {
        console.log(ex.message)
        return null;
    }
}

async function getUserByEmail(email) {        
    try {
        const quertCmd = `SELECT * from ${dbTable} WHERE email = "${email}"`;
        let result = await queryTemplate(userDatabase, quertCmd, "Get User Done");
        return result[0];        
    } catch (ex) {
        console.log(ex.message)
        return null;
    }
}

async function getTokenExpiry(actToken) {
    const queryCmd = `SELECT active, tokenExpire from ${dbTable} WHERE activationToken = "${actToken}";`;

    try {
        let result = await queryTemplate(userDatabase, queryCmd, "Get Token Expiry Done");
        return result[0];
    } catch (ex) {
        console.log(ex.message);
        return null;
    }
}

async function setUserActive(actToken) {
    const queryCmd = `UPDATE ${dbTable} SET active = true WHERE activationToken = "${actToken}";`;

    try {
        let result = await queryTemplate(userDatabase, queryCmd, "Set Active Done");
        return result[0];
    } catch (ex) {
        console.log(ex.message);
        return null;
    }
}

async function insertUser(user) {    
    const createTable = `CREATE TABLE IF NOT EXISTS ${dbTable}(	
        _id int NOT NULL AUTO_INCREMENT PRIMARY KEY,
        username varchar(30) NOT NULL,
        email varchar(255) NOT NULL,
        password varchar(255) NOT NULL,
        active smallint default 1
    );`;
    
    const insertData = `INSERT INTO ${dbTable} (username, email, password) 
    VALUES ("${user.username}", "${user.email}", "${user.password}");`;
    
    await insertTemplate(userDatabase, createTable, insertData, "InsertNewUserFinally");
}

async function updatePassword(user) {
    const queryCmd = `UPDATE ${dbTable} SET password = "${user.password}" WHERE _id = "${user._id}";`;
    try {
        let result = await queryTemplate(userDatabase, queryCmd, "Update Password Done");
        return result[0];
    } catch (ex) {
        console.log(ex.message);
        return null;
    }
}

async function updateActToken(info) {
    const queryCmd = `UPDATE ${dbTable} SET activationToken = "${info.actToken}", tokenExpire = "${info.tokenExp}" WHERE email = "${info.email}"`;
    try {
        let result = await queryTemplate(userDatabase, queryCmd, "Update Token Done");
        return result[0];
    } catch (ex) {
        console.log(ex.message);
        return null;
    }
}


function genAuthToken(user) {
    const token = jwt.sign({
        username: user.username,
        email: user.email,
        password: user.password,
    }, process.env.jwtPrivateKey);
    return token;
}

function genLoginToken(user) {
    const token = jwt.sign({
        username: user.username,
        email: user.email,
        active:user.active,
        user_id : user._id,
    }, process.env.jwtPrivateKey, { expiresIn: '60m' });
    return token;
}

function verifyToken(token) {
    try {
        let decoded = jwt.verify(token, process.env.jwtPrivateKey);
        return decoded;
    } catch (err) {
        console.log(err);
        return null;
    }
}


async function getUserById_email_username(user) {
    try {
        const queryCmd = `SELECT * FROM ${dbTable} WHERE _id = "${user._id}" AND username = "${user.username}" AND email = "${user.email}"`;
        let result = await queryTemplate(userDatabase, queryCmd, "Get User By 3 Para Finish");
        if(!Array.isArray(result) || result.length < 1) return null
        return result[0];
    } catch (ex) {
        console.log(ex.message);
        return null;
    }
}

async function getUserBy_idList(user_idList) {
    try {
        let sList = user_idList.toString();
        const queryCmd = `SELECT email, username, _id, active FROM ${dbTable} WHERE _id in (${sList});`;
        let result = await queryTemplate(userDatabase, queryCmd, "getUserBy_idList Finish");
        
        const rtnResult = result.map(b => b);
        return rtnResult;
        
    } catch (ex) {
        console.log(ex.message);
        return null;
    }
}

exports.getUserBy_idList = getUserBy_idList;
exports.deleteUser=deleteUser;
exports.getAllUser=getAllUser;
exports.valUpdateUser = validateUpdateUser;
exports.genAuthToken = genAuthToken;
exports.validateRegUser = validateMessage;
exports.regUser = insertUser;
exports.getUserByUsername = getUserByUsername;
exports.getUserByEmail = getUserByEmail;
exports.getTokenExpiry = getTokenExpiry;
exports.setUserActive = setUserActive;
exports.updateActToken = updateActToken;
exports.verifyToken = verifyToken;
exports.genLoginToken = genLoginToken;
exports.updatePassword = updatePassword;
exports.getUserById_email_username = getUserById_email_username;