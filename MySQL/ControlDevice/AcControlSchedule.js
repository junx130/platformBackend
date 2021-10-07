const { insertTemplate, queryTemplate } = require("../queryData");

const db = "ControlDevice";
const tableName = "AcCtrlSchedule";


async function insertAcCtrlSche(device) {
    const createTable = `CREATE TABLE IF NOT EXISTS AcCtrlSchedule(	
        _id int NOT NULL AUTO_INCREMENT,
        timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        unix INT(11) NOT NULL,
        bdDev_id INT NOT NULL,
        inUse TINYINT default 1, 
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

    let result = await insertTemplate(db, createTable, insertBuilding, "insertAcCtrlSche Finally ");
    // console.log("Insert result: ", result);
    return result;    
}


async function getSche_byBdDevId(Info){
    const quertCmd = `SELECT * from ${tableName} WHERE bdDev_id = ${Info.bdDev_id}`;
    // console.log(quertCmd);
    try {
        let result = await queryTemplate(db, quertCmd, "getSche_byBdDevId Finally");
        if(!result[0]) return [];     // return empty array
        const rtnResult = result.map(b=>b);
        return rtnResult;        
    } catch (ex) {
        console.log(ex.message)
        return [];       // return empty array
    }
}

async function getSche_byScheId(info) {
    console.log(info);
    const quertCmd = `SELECT * from ${tableName} WHERE _id = ${info.scheID}`;
    // console.log(quertCmd);
    try {
        let result = await queryTemplate(db, quertCmd, "getSche_byScheId Finally");
        if(!result[0]) return [];     // return empty array
        const rtnResult = result.map(b=>b);
        return rtnResult;        
    } catch (ex) {
        console.log(ex.message)
        return [];       // return empty array
    } 
}

async function updateAcSchedule(data){
    const quertCmd = `UPDATE ${tableName} SET timestamp = CURRENT_TIMESTAMP(),
    unix = UNIX_TIMESTAMP(),  
    bdDev_id = ${data.bdDev_id}, inUse = ${data.inUse}, 
    repeatWeekly = ${data.repeatWeekly},  startUnix = ${data.startUnix}, 
    endUnix = ${data.endUnix}, Setpoint = ${data.Setpoint}, 
    dataAction = ${data.dataAction}, ndow = ${data.ndow},
    userAmmend = "${data.userAmmend}"    
    where _id = ${data._id}`;

    try {
        let {affectedRows} = await queryTemplate(db, quertCmd, "updateSchedule Finally");
        // console.log('result', affectedRows);      
        let ret = 0;
        if(affectedRows < 1)  ret=1;    // return 1 if error occur
        return ret;        
    } catch (ex) {
        console.log(ex.message)
        return null;
    }
}

/** Delete Schedule */
async function deleteAcSchedule(info){
    const quertCmd = `DELETE from ${tableName} where _id = ${info._id}`;
    try {
        let result = await queryTemplate(db, quertCmd, "deleteAcSchedule Finally");
        // console.log("Update: ", result.affectedRows);        
        return result;        
    } catch (ex) {
        console.log(ex.message)
        return null;
    }
}

exports.deleteAcSchedule=deleteAcSchedule;
exports.updateAcSchedule=updateAcSchedule;
exports.getSche_byBdDevId =getSche_byBdDevId;
exports.insertAcCtrlSche = insertAcCtrlSche;
exports.getSche_byScheId = getSche_byScheId;