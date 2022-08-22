const { insertTemplate, queryTemplate } = require("../queryData");


const db = "V2_Application";
const appListTable = "V2_ApplicationList";
const appMemberTable = "V2_AppMemberList";



async function get_V2AppMember (app_id){
    let sErrTitle = "get_V2AppMember";
    try {
        let quertCmd = `SELECT * from ${appMemberTable} WHERE app_id = ${app_id} and inUse = 1`;        
        // console.log(quertCmd);
        let result = await queryTemplate(db, quertCmd, `${sErrTitle} Finally`);
        // console.log(result);
        if(!result[0]) return [];     // return empty array
        const rtnResult = result.map(b=>b);
        return rtnResult;       
    } catch (error) {
        console.log(`${sErrTitle}`, error.message)
        return null;       
    }
}


async function get_V2AppListByBd_id (bd_id){
    let sErrTitle = "get_V2AppListByBd_id";
    try {
        let quertCmd = `SELECT * from ${appListTable} WHERE bd_id = ${bd_id} and inUse = 1`;        
        // console.log(quertCmd);
        let result = await queryTemplate(db, quertCmd, `${sErrTitle} Finally`);
        // console.log(result);
        if(!result[0]) return [];     // return empty array
        const rtnResult = result.map(b=>b);
        return rtnResult;       
    } catch (error) {
        console.log(`${sErrTitle}`, error.message)
        return null;       
    }
}

exports.get_V2AppMember=get_V2AppMember;
exports.get_V2AppListByBd_id=get_V2AppListByBd_id;