const { queryTemplate } = require("../queryData");



const db = "V2_Dashboard";

const systemListTable = "SystemList";
const groupListTable = "System_GroupList";
const componentListTable = "System_ComponentList";
const compAuxTable = "System_Component_Aux";
const compTieParaTable = "System_Component_TiePara";


/********* System List *********/
async function getSystemList_byBd_id (building_id){
    let sErrTitle = "getTableList_byBd_id";
    try {
        let quertCmd = `SELECT * from ${systemListTable} WHERE building_id = ${building_id} and active = 1`;
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



/********* Component List *********/
async function getComponentList_byBd_id (building_id){
    let sErrTitle = "getGroupList_byBd_id";
    try {
        let quertCmd = `SELECT * from ${componentListTable} WHERE building_id = ${building_id} and active = 1`;
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



/********* Group List *********/
async function getGroupList_byBd_id (building_id){
    let sErrTitle = "getGroupList_byBd_id";
    try {
        let quertCmd = `SELECT * from ${groupListTable} WHERE building_id = ${building_id} and active = 1`;
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

/*********** Component Aux *********** */
async function getCompAuxList_byComp_id (comp_id){
    let sErrTitle = "getCompAuxListbyComp_id";
    try {
        let quertCmd = `SELECT * from ${compAuxTable} WHERE component_id = ${comp_id} and active = 1`;        
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

async function getCompAuxList_byComp_id_StartEndTime (comp_id){
    let sErrTitle = "getCompAuxList_byComp_id_StartEndTime";
    try {
        let quertCmd = `SELECT * from ${compAuxTable} WHERE component_id = ${comp_id} and active = 1 and auxId in(4,5)`;        
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

/*********** Component Tie Para *********** */
async function getCompTiePara_byComp_id (comp_id){
    let sErrTitle = "getCompTiePara_byComp_id";
    try {
        let quertCmd = `SELECT * from ${compTieParaTable} WHERE component_id = ${comp_id} and active = 1`;        
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

/** System */
exports.getSystemList_byBd_id=getSystemList_byBd_id;
/** Group */
exports.getComponentList_byBd_id=getComponentList_byBd_id;
/** Component */
exports.getGroupList_byBd_id=getGroupList_byBd_id;
/** Component Aux */
exports.getCompAuxList_byComp_id = getCompAuxList_byComp_id;
exports.getCompAuxList_byComp_id_StartEndTime=getCompAuxList_byComp_id_StartEndTime;
/** Component Tie Para */
exports.getCompTiePara_byComp_id = getCompTiePara_byComp_id;