const { insertTemplate, queryTemplate } = require("../queryData");

const settingDatabase = "GraphPara";
const tableName = "GraphList";


async function insert(body){
    const sqlMCmd = `        
        CREATE TABLE IF NOT EXISTS ${tableName}(	
            _id int NOT NULL AUTO_INCREMENT,
            timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP(),
            unix INT(11) NOT NULL, 
            userID int not null,
            bdDev_id int not null,
            pageID int not null,
            orderIdx int not null,
            name varchar(80) NOT NULL,
            graphType int not null,
            line1_id int,
            line2_id int,
            line3_id int,
            userAmmend varchar(80),
            PRIMARY KEY (_id)
    )`;

    const insertBuilding = `INSERT INTO ${tableName}(unix, userID, bdDev_id, pageID, orderIdx, name, graphType, line1_id, line2_id , line3_id, userAmmend)
    VALUES (UNIX_TIMESTAMP(), ${body.userID}, ${body.bdDev_id}, ${body.pageID}, ${body.orderIdx}, "${body.name}", ${body.graphType}, ${body.line1_id}, ${body.line2_id}, ${body.line3_id}, "${body.userAmmend}")`;

    let result = await insertTemplate(settingDatabase, sqlMCmd, insertBuilding, "Inser New Line List");
    // console.log("Insert result: ", result);
    return result;    
}

async function getBy2ID(data){
    const quertCmd = `SELECT * from ${tableName} WHERE userID = ${data.userID} AND pageID = ${data.pageID} AND bdDev_id = ${data.bdDev_id}`;
    
    try {
        let result = await queryTemplate(settingDatabase, quertCmd, "Get Line List Done");
        if(!result[0]) return null;     // no building in list
        const buildings = result.map(b=>b);
        return buildings;        
    } catch (ex) {
        console.log(ex.message)
        return null;
    }

}


exports.graphListGetBy2Id=getBy2ID;
exports.graphListInsert=insert;