async function updateSharedBd(info, _id) {
    let sMsg = "updateSharedBd";
    try {
        const quertCmd = `UPDATE ${shareBdTableName} SET 
            unix=UNIX_TIMESTAMP(),
            buidling_id = "${info.buidling_id}",
            user_id = "${info.user_id}",
            owner_id = ${info.owner_id},
            grantBy =${info.grantBy},
            accessLevel  = ${info.accessLevel}
            where _id = ${_id}`;
        // console.log("quertCmd", quertCmd);

        let result = await queryTemplate(db, quertCmd, `${sMsg} Finally`);
        // console.log(result);
        if (!result || !result.affectedRows) return null;
        if (result.affectedRows > 0) return true;
        return null

    } catch (error) {
        console.log(`Error : ${sMsg}`, error.message);
        return null;
    }
}



/*********** get template *********** */
async function getBdGrantByUser_id (user_id){
    let sErrTitle = "getBdGrantByUser_id";
    try {
        let quertCmd = `SELECT * from ${shareBdTableName} WHERE grantBy = ${user_id} and active = 1`;        
        // console.log(quertCmd);
        let result = await queryTemplate(db, quertCmd, `${sErrTitle} Finally`);
        // console.log(result);
        if(!result[0]) return [];     // return empty array
        const rtnResult = result.map(b=>b);
        return rtnResult;       
    } catch (error) {
        console.log(`${sErrTitle}`, error.message)
        return null;       
    }
}


async function addSharedBd(info) {
    let fnName = "addSharedBd";
    try {
        const createTable = `CREATE TABLE IF NOT EXISTS ${shareBdTableName}(	
            _id int NOT NULL AUTO_INCREMENT,
            timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            unix INT(11) NOT NULL,
            buidling_id int not null,
            user_id int not null,
            owner_id int not null,
            grantBy int,
            accessLevel tinyint default 3,
            sortIdx int not null default 65535,
            active tinyint default 1,
            PRIMARY KEY (_id)
        );`;

        const insertData = `INSERT INTO ${shareBdTableName} (unix, buidling_id, user_id, owner_id, grantBy, accessLevel)
        VALUES (UNIX_TIMESTAMP(), ${info.buidling_id}, ${info.user_id}, ${info.owner_id}, ${info.grantBy}, ${info.accessLevel});`;        

        let result = await insertTemplate(db, createTable, insertData, `${fnName} Finally`);
        if (!result) return null    // insert error
        if (result.affectedRows > 0 && result.insertId > 0) return { success: true, insertId: result.insertId }
        return null     //<--- unknown state

    } catch (error){
        console.log(`${fnName} err : `, error.message);
        return null;
    }
}
