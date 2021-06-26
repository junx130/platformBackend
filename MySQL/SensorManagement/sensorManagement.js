const { insertTemplate, queryTemplate } = require("../queryData");


const db = "SensorManagement";
const tableName = "SensorParameter";
const sensorTable = "SensorList";

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
        console.log(ex.message)
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
        console.log(ex.message)
        return [];
    }

}

exports.getSensorParaBy_TypeList=getSensorParaBy_TypeList;
exports.getSensorList_ByVendorId=getSensorList_ByVendorId;
exports.getSensorParaBy_sensorType = getSensorParaBy_sensorType;