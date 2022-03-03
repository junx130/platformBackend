const { insertTemplate, queryTemplate } = require("../queryData");


async function getSingleNotInuse_Common(db, table){
    try {
        const quertCmd = `SELECT * from ${table} WHERE inUse = 0 limit 1`;
        let result = await queryTemplate(db, quertCmd, "getSingleNotInuse_Common Finally");
        if(!result[0]) return [];     // return empty array
        const rtnResult = result.map(b=>b);
        return rtnResult;       
    } catch (error) {
        console.log("Error : getSingleNotInuse_Common", error.message);
        return [];       
    }
}

exports.getSingleNotInuse_Common = getSingleNotInuse_Common;