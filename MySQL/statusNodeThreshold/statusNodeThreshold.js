const { insertTemplate, queryTemplate } = require("../queryData");



const db = "NodeSetting";
const tableName = "StatusNodeThreshold"


async function setThreshold(body){
    const createTable = `CREATE TABLE IF NOT EXISTS ${tableName}(	
        _id int NOT NULL AUTO_INCREMENT,
        timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        unix INT(11) NOT NULL,
        devID INT,  
        threshold INT,
        invert tinyint default 1,
        userAmmend varchar(80),
        PRIMARY KEY (_id)
    )`;
  
    const queryCmd = `INSERT INTO StatusNodeThreshold(unix, devID, threshold, invert, userAmmend)
        VALUES (UNIX_TIMESTAMP(), 
        ${body.devID}, 
        ${body.threshold}, 
        ${body.invert}, 
        "${body.userAmmend}")`;

    try {
      let result = await insertTemplate(db, createTable, queryCmd, "Insert Node Threshold succesful");
      return result;          
    } catch (ex) {
        console.log(ex.message)
        return null;
    }
  }

  
async function getLatestThreshold_byDevId(devID){
    //select * from StatusNodeThreshold where devId = 15 order by unix desc limit 1;
    const quertCmd = `SELECT * from ${tableName} WHERE 
    devId =${devID}
    order by unix desc limit 1;
    `;
    
    try {
        let result = await queryTemplate(db, quertCmd, "Get getDevActCheck_Rising Done");
        if(!result[0]) return [];     // no item found in list
        const rows = result.map(b=>b);
        return rows;        
    } catch (ex) {
        console.log(ex.message)
        return [];
    }
  }
  
async function getLatestThreshold_byDevId_Lite(devID){
    //select * from StatusNodeThreshold where devId = 15 order by unix desc limit 1;
    const quertCmd = `SELECT threshold, invert from ${tableName} WHERE 
    devId =${devID}
    order by unix desc limit 1;
    `;
    
    try {
        let result = await queryTemplate(db, quertCmd, "Get getDevActCheck_Rising Done");
        if(!result[0]) return [];     // no item found in list
        const rows = result.map(b=>b);
        return rows;        
    } catch (ex) {
        console.log(ex.message)
        return [];
    }
  }


  exports.getLatestThreshold_byDevId=getLatestThreshold_byDevId;        
  exports.setThreshold = setThreshold;
  exports.getLatestThreshold_byDevId_Lite=getLatestThreshold_byDevId_Lite;