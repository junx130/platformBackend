const Joi = require("joi");
const { insertTemplate, queryTemplate } = require("../queryData");
const jwt = require("jsonwebtoken");
// const { pool } = require("./db");

const userDatabase = "UserManagement";

function validateMessage(user){    
    const schema = {        
        username: Joi.string().min(6).max(80).required(),
        email: Joi.string().max(80).email(),
        password: Joi.string().min(8).max(80).required(),
        name: Joi.string().min(3).max(80).required(),
        company: Joi.string().max(80),
        phone: Joi.string().max(80).required(),
        // accessLevel: Joi.number(),
        // active: Joi.number(),
        // teleID: Joi.number(),
    }
    return Joi.validate(user, schema);
}

function validateUpdateUser(user){       
    const schema = {        
        username: Joi.string().min(6).max(80).required(),
        // email: Joi.string().max(80).email(),
        // password: Joi.string().min(8).max(80).required(),
        // name: Joi.string().min(3).max(80).required(),
        // company: Joi.string().max(80),
        // phone: Joi.string().max(80).required(),
        accessLevel: Joi.number(),
        active: Joi.number(),
        // teleID: Joi.number(),
    }
    return Joi.validate(user, schema);
}

async function updateUser(info) {    
    const quertCmd = `UPDATE Users SET accessLevel = ${info.accessLevel}
    , active =${info.active} where username = "${info.username}"`;

    try {
        let result = await queryTemplate(userDatabase, quertCmd, "Update User Finally");
        // console.log("Update: ", result.affectedRows);        
        return result.affectedRows;        
    } catch (ex) {
        console.log(ex.message)
        return null;
    }
}

async function getUser(username) {    
    const quertCmd = `SELECT * from Users WHERE username = "${username}"`;

    try {
        let result = await queryTemplate(userDatabase, quertCmd, "Get User Done");
        return result[0];        
    } catch (ex) {
        console.log(ex.message)
        return null;
    }
}

async function insertUser(user) {    
    const createTable = `CREATE TABLE IF NOT EXISTS Users(	
        _id int NOT NULL AUTO_INCREMENT,
        timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        unix int(11) NOT NULL,
        username varchar(80) NOT NULL,
        email varchar(80),
        password varchar(255) NOT NULL,
        name varchar(80) NOT NULL,
        company varchar(80),
        phone varchar(80),
        accessLevel TINYINT NOT NULL DEFAULT(100),
        active TINYINT default(0),
        teleID BIGINT,
        PRIMARY KEY (_id)
    )`;
    
    const insertData = `INSERT INTO Users(unix, username, email, password, name, company, phone) 
    VALUES (UNIX_TIMESTAMP(), "${user.username}", "${user.email}", "${user.password}", "${user.name}", "${user.company}", "${user.phone}")`;
    
    await insertTemplate(userDatabase, createTable, insertData, "InsertNewUserFinally");
}


function genAuthToken(user) {
    const token = jwt.sign({
        username : user.username,
        accessLevel : user.accessLevel,
        active: user.accessLevel
    }, process.env.jwtPrivateKey);
    return token;
}

exports.valUpdateUser = validateUpdateUser;
exports.updateUser = updateUser;
exports.genAuthToken = genAuthToken;
exports.getUser=getUser;
exports.validateRegUser = validateMessage;
exports.regUser = insertUser;