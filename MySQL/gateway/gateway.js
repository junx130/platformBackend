const { insertTemplate, queryTemplate } = require("../queryData");

const settingDatabase = "RawDataLog";
const tableName = "GatewayLog";

async function gatewayLogging(device) {    
    if(process.env.debugOnLaptop=="true") return //console.log("Skip Database Storing");
    const createTable = `CREATE TABLE IF NOT EXISTS ${tableName}(		
        _id int NOT NULL AUTO_INCREMENT,
        timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        unix INT(11) NOT NULL, 
        Vendor varchar(80),
        Version varchar(80),
        Product varchar(80),
        ID INT,  
        Freq float,  
        Remarks varchar(80),
        MQTT varchar(80),
        GSM INT,  
        PRIMARY KEY (_id)
    )`;

    // const insertBuilding = `INSERT INTO kittyMeow(unix, owner, building, country, state, area, postcode, userAmmend) 
    const insertBuilding = `INSERT INTO ${tableName}(unix, Vendor, Version, Product, ID, Freq, Remarks, MQTT, GSM)
    VALUES (UNIX_TIMESTAMP(), "${device.Vendor}", "${device.Version}", "${device.Product}", ${device.ID}, ${device.Freq}, "${device.Desc}", "${device.MQTT}", ${device.GSM})`;
// console.log(insertBuilding);
    let result = await insertTemplate(settingDatabase, createTable, insertBuilding, "Insert Gateway Log Finally");
    // console.log("Insert result: ", result);
    return result;
    
}

exports.gatewayLogging=gatewayLogging;