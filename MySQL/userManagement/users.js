const Joi = require("joi");
const { insertTemplate, queryTemplate } = require("../queryData");
const jwt = require("jsonwebtoken");
// const { pool } = require("./db");

const userDatabase = "UserManagement";

function validateMessage(user){    
    const schema = {        
        username: Joi.string().max(80).required(),
        email: Joi.string().max(80).email(),
        password: Joi.string().max(80).required(),
        nickanme: Joi.string().max(80).required(),
        company: Joi.string().max(80),
        phone: Joi.string().max(80).required(),
        // accessLevel: Joi.number(),
        // active: Joi.number(),
        // teleID: Joi.number(),
    }
    return Joi.validate(user, schema);
}

async function getUser(username) {    
    const quertCmd = `SELECT * from Users WHERE username = ${username}`;

    let result = await queryTemplate(userDatabase, quertCmd, "Get User Done");
    return result;
}

async function insertUser(user) {    
    const createTable = `CREATE TABLE IF NOT EXISTS Users(	
        _id int NOT NULL AUTO_INCREMENT,
        timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        username varchar(80) NOT NULL,
        email varchar(80),
        password varchar(255) NOT NULL,
        nickName varchar(80) NOT NULL,
        company varchar(80),
        phone varchar(80),
        accessLevel TINYINT NOT NULL DEFAULT(100),
        active TINYINT default(0),
        teleID BIGINT,
        PRIMARY KEY (_id)
    )`;
    
    const insertData = `INSERT INTO Users(unix, username, email, password, nickName, company, phone) 
    VALUES (UNIX_TIMESTAMP(), ${user.username}, ${user.email}, ${user.password}, ${user.nickName}, ${user.company}, ${user.phone})`;
    
    await insertTemplate(userDatabase, createTable, insertData, "InsertNewUserFinally");
}


function genAuthToken(user) {
    const token = jwt.sign({
        username = user.username,
        nickname = user.nickname,
        accessLevel = user.accessLevel
    }, process.env.jwtPrivateKey);
    return token;
}

exports.genAuthToken = genAuthToken;
exports.getUser=getUser;
exports.validateRegUser = validateMessage;
exports.regUser = insertUser;