const { insertTemplate, queryTemplate } = require("../queryData");
const userDatabase = "UserManagement";
const dbTable = "PassResetRecord";


/** update completed status */
async function updateCompletedStatus(_id, completed) {    
    const quertCmd = `update ${dbTable} set completed = ${completed} WHERE _id  = "${_id}"`;
    try {
        let result = await queryTemplate(userDatabase, quertCmd, "updateCompletedStatus Done");
        if(result.affectedRows > 0) return true;
        return false;        
    } catch (ex) {
        console.log(ex.message)
        return null;
    }
}

/** check by username within time */
async function getByUserName_WithinMins(username, nMins) {    
    const quertCmd = `SELECT * from ${dbTable} WHERE unix > UNIX_TIMESTAMP()-${nMins*60} and username = "${username}" and completed < 10`;
    try {
        let result = await queryTemplate(userDatabase, quertCmd, "getByUserName_WithinMins Done");
        return result;        
    } catch (ex) {
        console.log(ex.message)
        return null;
    }
}

/** check recovery code unique */
async function getByRecoveryCode(recoveryCode) {    
    const quertCmd = `SELECT * from ${dbTable} WHERE recoveryCode = "${recoveryCode}" and completed < 10`;

    try {
        let result = await queryTemplate(userDatabase, quertCmd, "getByRecoveryCode Done");
        return result;        
    } catch (ex) {
        console.log(ex.message)
        return null;
    }
}

/** insert reset password request */
async function insertResetPassReq(body) {    
    try {
        const createTable = `CREATE TABLE IF NOT EXISTS ${dbTable}(	
            _id int NOT NULL AUTO_INCREMENT,
            timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            unix INT(11) NOT NULL,
            user_id INT NOT NULL,
            username varchar(80),
            email varchar(80),
            recoveryCode varchar(20),
            completed tinyint default 0,
            PRIMARY KEY (_id)
        )`;
        
        const insertData = `INSERT INTO PassResetRecord(unix, user_id, username, email, recoveryCode)
        VALUES (UNIX_TIMESTAMP(), "${body.user_id}", "${body.username}", "${body.email}", "${body.recoveryCode}")`;
    
        let rel = await insertTemplate(userDatabase, createTable, insertData, "insertResetPassReq Finally");
        // console.log(rel);
        if(false) return null;
        return true;

    } catch (error) {
        console.log("insertResetPassReq Error");
        console.log(error.message);
        return null;
    }
}

exports.updateCompletedStatus = updateCompletedStatus;
exports.getByUserName_WithinMins = getByUserName_WithinMins;
exports.getByRecoveryCode = getByRecoveryCode;
exports.insertResetPassReq = insertResetPassReq;