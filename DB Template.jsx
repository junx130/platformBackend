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