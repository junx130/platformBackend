const { insertTemplate, queryTemplate } = require("../queryData");

const db = "MonitoringList";
const tableName_Element = "MonitoringElement";


/** Update Ele */
async function updateEleList(data){     
    const quertCmd = `UPDATE ${tableName_Element} SET timestamp = CURRENT_TIMESTAMP(),
    unix = UNIX_TIMESTAMP(),  
    T1_id  = ${data.T1_id}, type  = ${data.type}, 
    bdDev_id  = ${data.bdDev_id}, 
    SortIndex = ${data.SortIndex}, userAmmend = "${data.userAmmend}"    
    where _id = ${data._id}`;

    try {
        let result = await queryTemplate(db, quertCmd, "Element List Update Finally");
        // console.log("Update: ", result.affectedRows);        
        return result;        
    } catch (ex) {
        console.log(ex.message)
        return null;
    }
}

/**Add Ele */
async function regEleList(body){
    const createTable = `CREATE TABLE IF NOT EXISTS MonitoringElement(
        _id int NOT NULL AUTO_INCREMENT,
        timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        unix INT(11) NOT NULL,
        name varchar(80),
        T1_id int,
        T2_id int,
        T3_id int,
        type SMALLINT NOT NULL,  
        bdDev_id int not null,
        SortIndex INT NOT NULL,  
        userAmmend varchar(80),
         PRIMARY KEY (_id)
    )`;

    const insertQry = `INSERT INTO ${tableName_Element}(unix, T1_id, type, bdDev_id, SortIndex, userAmmend)
    VALUES (UNIX_TIMESTAMP(), ${body.T1_id},  ${body.type}, ${body.bdDev_id}, ${body.SortIndex}, "${body.userAmmend}")`;
        // console.log(insertQry);
    let result = await insertTemplate(db, createTable, insertQry, "Insert Element List Finally");
    // console.log("Insert result: ", result);
    return result;
}

/** Delete Ele List */
async function deleteEleList(info){
    const quertCmd = `DELETE from ${tableName_Element} where _id = ${info._id}`;
    try {
        let result = await queryTemplate(db, quertCmd, "Delete Element List Finally");
        // console.log("Update: ", result.affectedRows);        
        return result;        
    } catch (ex) {
        console.log(ex.message)
        return null;
    }
}


exports.updateEleList = updateEleList;
exports.regEleList = regEleList;
exports.deleteEleList=deleteEleList;