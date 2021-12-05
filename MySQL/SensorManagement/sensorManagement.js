const { insertTemplate, queryTemplate } = require("../queryData");


const db = "SensorManagement";
const tableName = "SensorParameter";
const sensorTable = "SensorList";


async function insertV2Sensor(body, leastType, user){
    try {
        const createTable = `CREATE TABLE IF NOT EXISTS ${sensorTable}(	
            _id int NOT NULL AUTO_INCREMENT,
            timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            unix INT(11) NOT NULL,
            name varchar(80) NOT NULL,
            type INT NOT NULL,  
            vendor_id INT NOT NULL,  
            sensorVersion INT default 2,
            pb TINYINT default 0,
            pi TINYINT default 0,
            pf TINYINT default 0,
            pn TINYINT default 0,
            battKey char(40),
            thAploudsGw TINYINT default 1,
            userAmmend varchar(80),
            PRIMARY KEY (_id)
        )`;
      
        const queryCmd = `INSERT INTO SensorList(unix, name, type, vendor_id, sensorVersion, pb, pi, pf, pn, battKey, userAmmend)
            VALUES (UNIX_TIMESTAMP(), 
            "${body.name}", 
            ${leastType}, 
            ${body.vendor_id}, 
            ${body.sensorVersion}, 
            ${body.pb}, 
            ${body.pi}, 
            ${body.pf}, 
            ${body.pn}, 
            "${body.battKey}", 
            "${user}")`;

        // console.log(createTable);
        // console.log(queryCmd);
      let result = await insertTemplate(db, createTable, queryCmd, "Add V2 sensor succesful");
      return result;          
    } catch (ex) {
        console.log(ex.message)
        return null;
    }
}

async function insertSensorPara(body, leastType, user){
    try {
        const createTable = `CREATE TABLE IF NOT EXISTS ${tableName}(	
            _id int NOT NULL AUTO_INCREMENT,
            timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            unix INT(11) NOT NULL,
            sensorType INT NOT NULL,  
            dataType varchar(5),
            dataIndex SMALLINT,
            dataName varchar(80),
            dataUnit varchar(40),
            scaleTop float,
            scaleBottom float,
            defaultDisplay TINYINT,
            V2_OvvDisplay TINYINT,
            userAmmend varchar(80),
            PRIMARY KEY (_id)
        )`;
      
        const queryCmd = `INSERT INTO SensorParameter(unix, sensorType, dataType, dataIndex, dataName, dataUnit, scaleTop, scaleBottom, defaultDisplay, userAmmend)
            VALUES (UNIX_TIMESTAMP(), 
            ${leastType}, 
            "${body.dataType}", 
            ${body.dataIndex}, 
            "${body.dataName}", 
            "${body.dataUnit}", 
            ${body.scaleTop}, 
            ${body.scaleBottom}, 
            ${body.defaultDisplay}, 
            "${user}")`;

        // console.log(createTable);
        // console.log(queryCmd);
      let result = await insertTemplate(db, createTable, queryCmd, "Add V2 SensorPara succesful");
      return result;          
    } catch (ex) {
        console.log(ex.message)
        return null;
    }
}



async function getLeastNoInTable(key){
    try {
        const quertCmd = `select tbl1 .${key}+1 AS TypeNotUsedInSensorList
        from ${sensorTable} AS tbl1
        left join ${sensorTable} AS tbl2 ON tbl1.${key}+1 = tbl2.${key}
        WHERE tbl2.${key} IS NULL
        ORDER BY tbl1.${key} LIMIT 1;
        `;
        // const quertCmd = `SELECT t1.${key}+1
        // FROM ${sensorTable} AS t1
        // LEFT JOIN ${sensorTable} AS t2 ON t1.${key}+1 = t2.${key}
        // WHERE t2.${key} IS NULL
        // LIMIT 1;
        // `;
        let result = await queryTemplate(db, quertCmd, "Get getLeastNoInTable Done");
        // console.log(result[0]);
        if(!result[0][`TypeNotUsedInSensorList`]) return null
        return result[0][`TypeNotUsedInSensorList`];      
    } catch (error) {
        console.log(error.message);
        return null;
    }
}

async function getSensorParaBy_sensorType(sensorType){
    try {
        const quertCmd = `SELECT * from ${tableName} WHERE 
        sensorType =${sensorType};
        `;
        let result = await queryTemplate(db, quertCmd, "Get getSensorParaBy_sensorType Done");
        if(!result[0]) return [];     // no item found in list
        const rows = result.map(b=>b);
        return rows;        
    } catch (ex) {
        console.log(ex.message)
        return [];
    }
}

async function getSensorList_ByVendorId(vendor_id){
    try {
        const quertCmd = `SELECT * from ${sensorTable} WHERE 
        vendor_id =${vendor_id};
        `;
        let result = await queryTemplate(db, quertCmd, "getSensorList_ByVendorId Done");
        if(!result[0]) return [];     // no item found in list
        const rows = result.map(b=>b);
        return rows;    
    } catch (error) {
        console.log("getSensorList_ByVendorId Error")        
        console.log(error.message)
        return [];
    }
}

async function getSensorParaBy_TypeList(typeList){
    try {
        let sList = '';
        for (const iterator of typeList) {
            if(sList!=='') sList+=', '
            sList+=iterator;
        }        
        const quertCmd = `SELECT * from ${tableName} WHERE 
        sensorType in (${sList});
        `;
        // console.log(quertCmd);
        let result = await queryTemplate(db, quertCmd, "getSensorParaBy_TypeList Done");
        if(!result[0]) return [];     // no item found in list
        const rows = result.map(b=>b);
        // console.log(rows);
        return rows;    
    } catch (error) {
        console.log("getSensorParaBy_TypeList Error")        
        console.log(error.message)
        return [];
    }

}

/**Update Sensor List */
async function updateSensorList(data){     
    try {
        const quertCmd = `UPDATE ${sensorTable} SET timestamp = CURRENT_TIMESTAMP(),
        unix = UNIX_TIMESTAMP(),  
        name = "${data.name}", 
        battKey = "${data.battKey}"
        where _id = ${data._id}`;
        // console.log(quertCmd);
        let result = await queryTemplate(db, quertCmd, "SensorList Update Finally");
        // console.log("Update: ", result);        
        return result;        
    } catch (ex) {
        console.log(ex.message)
        return null;
    }
}

/**Update Sensor Paramter */
async function updateSensorParameter(data){     
    try {
        const quertCmd = `UPDATE ${tableName} SET timestamp = CURRENT_TIMESTAMP(),
        unix = UNIX_TIMESTAMP(),  
        dataName = "${data.dataName}", 
        dataUnit = "${data.dataUnit}",
        defaultDisplay = ${data.defaultDisplay},
        scaleBottom = ${data.scaleBottom},
        scaleTop = ${data.scaleTop}
        where _id = ${data._id}`;
        // console.log(quertCmd);
        let result = await queryTemplate(db, quertCmd, "SensorParamter Update Finally");
        // console.log("Update: ", result);        
        return result;        
    } catch (ex) {
        console.log(ex.message)
        return null;
    }
}

async function getSensorListBy_typeList(typeList){
    try {
        // console.log(typeList);
        if(!Array.isArray(typeList) || typeList.length < 1) return [];
        let sList = '';
        for (const iterator of typeList) {
            if(sList!=='') sList+=', '
            sList+=iterator;
        }        
        const quertCmd = `SELECT * from ${sensorTable} WHERE 
        type in (${sList});
        `;
        // console.log(quertCmd);
        let result = await queryTemplate(db, quertCmd, "getSensorListBy_typeList Done");
        if(!result[0]) return [];     // no item found in list
        const rows = result.map(b=>b);
        // console.log(rows);
        return rows;    
    } catch (error) {
        console.log("getSensorListBy_typeList Error")        
        console.log(error.message)
        return [];
    }

}

exports.getSensorListBy_typeList=getSensorListBy_typeList;
exports.updateSensorParameter=updateSensorParameter;
exports.updateSensorList=updateSensorList;
exports.insertSensorPara=insertSensorPara;
exports.insertV2Sensor=insertV2Sensor;
exports.getLeastNoInTable=getLeastNoInTable;
exports.getSensorParaBy_TypeList=getSensorParaBy_TypeList;
exports.getSensorList_ByVendorId=getSensorList_ByVendorId;
exports.getSensorParaBy_sensorType = getSensorParaBy_sensorType;