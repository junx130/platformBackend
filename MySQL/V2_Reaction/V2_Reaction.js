const { insertTemplate, queryTemplate } = require("../queryData");

const db = "V2_Reaction";

const AlgoTable = "V2_ReactTrigAlgo";
const ConditionTable = "V2_ReactCondition";
const FormulaTable = "V2_ReactFormulaTemplate";
const FormulaVarTable = "V2_ReactFormulaVarTable";


async function setForVarFulfillmentCnt(condi_id, bddev_id, fulfillCnt){
    try {
        const quertCmd = `UPDATE ${FormulaVarTable} SET 
            lastUpdate_unix=UNIX_TIMESTAMP(),
            fulfillmentCnt = ${fulfillCnt} 
            where condition_id = ${condi_id} and 
            bddev_id =${bddev_id}`;
        
        let result = await queryTemplate(db, quertCmd, "increaseForVarFulfillmentCnt Finally");
        // console.log(result);
        if(!result || !result.affectedRows) return null;
        if(result.affectedRows > 0 ) return true;
        return null       
    } catch (error) {
        console.log("Error : increaseFulfillmentCnt");
        console.log(error.message)
        return null;       
    }
}

async function setFulfillmentCnt(condi_id, fulfillCnt){
    try {
        const quertCmd = `UPDATE ${ConditionTable} SET 
            lastUpdate_unix=UNIX_TIMESTAMP(),
            fulfillmentCnt = ${fulfillCnt} 
            where _id = ${condi_id}`;
        
        let result = await queryTemplate(db, quertCmd, "increaseFulfillmentCnt Finally");
        // console.log(result);
        if(!result || !result.affectedRows) return null;
        if(result.affectedRows > 0 ) return true;
        return null       

    } catch (error) {
        console.log("Error : increaseFulfillmentCnt");
        console.log(error.message)
        return null;       
    }
}

async function getForVarBy_condi_id (condi_id){
    try {
        const quertCmd = `SELECT * from ${FormulaVarTable} WHERE condition_id = ${condi_id}`;
        // select * from V2_ReactTrigAlgo where bdDevInvolve like "%,6,%";
        // console.log(quertCmd);
        let result = await queryTemplate(db, quertCmd, "getForVarBy_condi_id Finally");
        // console.log(result);
        if(!result[0]) return [];     // return empty array
        const rtnResult = result.map(b=>b);
        return rtnResult;       
    } catch (error) {
        console.log("Error : getForVarBy_condi_id");
        console.log(error.message)
        return null;       
    }
}

async function getForTemplateBy_id (temp_id){
    try {
        const quertCmd = `SELECT * from ${FormulaTable} WHERE _id = ${temp_id}`;
        // select * from V2_ReactTrigAlgo where bdDevInvolve like "%,6,%";
        // console.log(quertCmd);
        let result = await queryTemplate(db, quertCmd, "getForTemplateBy_id Finally");
        // console.log(result);
        if(!result[0]) return [];     // return empty array
        const rtnResult = result.map(b=>b);
        return rtnResult;       
    } catch (error) {
        console.log("Error : getForTemplateBy_id");
        console.log(error.message)
        return null;       
    }
}

async function getAlgoBy_bdDev_id (bdDev_id){
    try {
        const quertCmd = `SELECT * from ${AlgoTable} WHERE bdDevInvolve like "%,${bdDev_id},%"`;
        // select * from V2_ReactTrigAlgo where bdDevInvolve like "%,6,%";
        // console.log(quertCmd);
        let result = await queryTemplate(db, quertCmd, "getAlgoBy_bdDev_id Finally");
        // console.log(result);
        if(!result[0]) return [];     // return empty array
        const rtnResult = result.map(b=>b);
        return rtnResult;       
    } catch (error) {
        console.log("Error : getAlgoBy_bdDev_id");
        console.log(error.message)
        return null;       
    }
}

async function getGetCondition_byAlgo_id (algo_id){
    try {
        const quertCmd = `SELECT * from ${ConditionTable} WHERE algo_id = ${algo_id}`;
        // select * from V2_ReactTrigAlgo where bdDevInvolve like "%,6,%";
        // console.log(quertCmd);
        let result = await queryTemplate(db, quertCmd, "getGetCondition_byAlgo_id Finally");
        // console.log(result);
        if(!result[0]) return [];     // return empty array
        const rtnResult = result.map(b=>b);
        return rtnResult;       
    } catch (error) {
        console.log("Error : getGetCondition_byAlgo_id");
        console.log(error.message)
        return null;       
    }
}

exports.setForVarFulfillmentCnt=setForVarFulfillmentCnt;
exports.getAlgoBy_bdDev_id = getAlgoBy_bdDev_id;
exports.getGetCondition_byAlgo_id=getGetCondition_byAlgo_id;
exports.getForTemplateBy_id=getForTemplateBy_id;
exports.getForVarBy_condi_id=getForVarBy_condi_id;
exports.setFulfillmentCnt=setFulfillmentCnt;
