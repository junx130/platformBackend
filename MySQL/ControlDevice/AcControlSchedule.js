const { insertTemplate, queryTemplate } = require("../queryData");

const db = "ControlDevice";
const tableName = "AcCtrlSchedule";


async function insertAcCtrlSche(device) {
    const createTable = `CREATE TABLE IF NOT EXISTS AcCtrlSchedule(	
        _id int NOT NULL AUTO_INCREMENT,
        timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        unix INT(11) NOT NULL,
        bdDev_id INT NOT NULL,
        repeatWeekly TINYINT, 
        startUnix INT(11),
        endUnix INT(11),
        Setpoint float,
        dataAction TINYINT,
        ndow TINYINT, 
        userAmmend varchar(80),
        PRIMARY KEY (_id)
   );`;

    // const insertBuilding = `INSERT INTO kittyMeow(unix, owner, building, country, state, area, postcode, userAmmend) 
    const insertBuilding = `INSERT INTO ${tableName}(unix, bdDev_id, repeatWeekly, startUnix, endUnix, Setpoint, dataAction, ndow, userAmmend)
    VALUES (UNIX_TIMESTAMP(), 
    ${device.bdDev_id}, 
    ${device.repeatWeekly}, 
    ${device.startUnix}, 
    ${device.endUnix}, 
    ${device.Setpoint}, 
    ${device.dataAction}, 
    ${device.ndow}, 
    "${device.userAmmend}")`;

    let result = await insertTemplate(db, createTable, insertBuilding, "insertAcCtrlSche Done ");
    // console.log("Insert result: ", result);
    return result;    
}


async function getSche_byBdDevId(Info){
    const quertCmd = `SELECT * from ${tableName} WHERE bdDev_id = ${Info.bdDev_id}`;
    // console.log(quertCmd);
    try {
        let result = await queryTemplate(db, quertCmd, "getSche_byBdDevId Done");
        if(!result[0]) return [];     // return empty array
        const rtnResult = result.map(b=>b);
        return rtnResult;        
    } catch (ex) {
        console.log(ex.message)
        return [];       // return empty array
    }
}

exports.getSche_byBdDevId =getSche_byBdDevId;
exports.insertAcCtrlSche = insertAcCtrlSche;