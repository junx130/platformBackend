const { insertTemplate, queryTemplate } = require("../queryData");

const db = "MonitoringList";
const tableName_Element = "T1_list";


/** Update T1 */
async function updateT1List(data){     
    const quertCmd = `UPDATE ${tableName_Element} SET timestamp = CURRENT_TIMESTAMP(),
    unix = UNIX_TIMESTAMP(),  
    name = "${data.name}", MonitorList_id = ${data.MonitorList_id}, 
    SortIndex = ${data.SortIndex}, userAmmend = "${data.userAmmend}"    
    where _id = ${data._id}`;

    try {
        let result = await queryTemplate(db, quertCmd, "T1 List Update Finally");
        // console.log("Update: ", result.affectedRows);        
        return result;        
    } catch (ex) {
        console.log(ex.message)
        return null;
    }
}

/**Add T1 */
async function regT1List(body){
    const createTable = `CREATE TABLE IF NOT EXISTS MonitorList(	
         _id int NOT NULL AUTO_INCREMENT,
         timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
         unix INT(11) NOT NULL,
         name varchar(80),
         MonitorList_id int not null,
         SortIndex INT NOT NULL,  
         userAmmend varchar(80),
         PRIMARY KEY (_id)
    )`;

    const insertQry = `INSERT INTO ${tableName_Element}(unix, name, MonitorList_id, SortIndex, userAmmend)
    VALUES (UNIX_TIMESTAMP(), "${body.name}", ${body.MonitorList_id}, ${body.SortIndex}, "${body.userAmmend}")`;
        // console.log(insertQry);
    let result = await insertTemplate(db, createTable, insertQry, "Insert T1 List Finally");
    // console.log("Insert result: ", result);
    return result;
}

/** Delete T1 List */
async function deleteT1List(info){
    const quertCmd = `DELETE from ${tableName_Element} where _id = ${info._id}`;
    try {
        let result = await queryTemplate(db, quertCmd, "Delete T1 List Finally");
        // console.log("Update: ", result.affectedRows);        
        return result;        
    } catch (ex) {
        console.log(ex.message)
        return null;
    }
}



exports.updateT1List=updateT1List;
exports.regT1List=regT1List;
exports.deleteT1List=deleteT1List;