const { describe } = require("joi/lib/types/alternatives");
const { insertTemplate, queryTemplate } = require("../queryData");

const v2ReactionDb = "V2_Reaction";

const AlgoTable = "V2_ReactTrigAlgo";
const ConditionTable = "V2_ReactCondition";
const FormulaTable = "V2_ReactFormulaTemplate";
const FormulaVarTable = "V2_ReactFormulaVarTable";


async function setForVarFulfillmentCnt(condi_id, bddev_id, fulfillCnt) {
    try {
        const quertCmd = `UPDATE ${FormulaVarTable} SET 
            lastUpdate_unix=UNIX_TIMESTAMP(),
            fulfillmentCnt = ${fulfillCnt} 
            where condition_id = ${condi_id} and 
            bddev_id =${bddev_id}`;

        let result = await queryTemplate(v2ReactionDb, quertCmd, "increaseForVarFulfillmentCnt Finally");
        // console.log(result);
        if (!result || !result.affectedRows) return null;
        if (result.affectedRows > 0) return true;
        return null
    } catch (error) {
        console.log("Error : increaseFulfillmentCnt");
        console.log(error.message)
        return null;
    }
}

async function setFulfillmentCnt(condi_id, fulfillCnt) {
    try {
        const quertCmd = `UPDATE ${ConditionTable} SET 
            lastUpdate_unix=UNIX_TIMESTAMP(),
            fulfillmentCnt = ${fulfillCnt} 
            where _id = ${condi_id}`;

        let result = await queryTemplate(v2ReactionDb, quertCmd, "increaseFulfillmentCnt Finally");
        // console.log(result);
        if (!result || !result.affectedRows) return null;
        if (result.affectedRows > 0) return true;
        return null

    } catch (error) {
        console.log("Error : increaseFulfillmentCnt");
        console.log(error.message)
        return null;
    }
}


async function getForVarBy_condi_id(condi_id) {
    try {
        const quertCmd = `SELECT * from ${FormulaVarTable} WHERE condition_id = ${condi_id}`;
        // select * from V2_ReactTrigAlgo where bdDevInvolve like "%,6,%";
        // console.log(quertCmd);
        let result = await queryTemplate(v2ReactionDb, quertCmd, "getForVarBy_condi_id Finally");
        // console.log(result);
        if (!result[0]) return [];     // return empty array
        const rtnResult = result.map(b => b);
        return rtnResult;
    } catch (error) {
        console.log("Error : getForVarBy_condi_id");
        console.log(error.message)
        return null;
    }
}

async function getForTemplateBy_id(temp_id) {
    try {
        const quertCmd = `SELECT * from ${FormulaTable} WHERE _id = ${temp_id}`;
        // select * from V2_ReactTrigAlgo where bdDevInvolve like "%,6,%";
        // console.log(quertCmd);
        let result = await queryTemplate(v2ReactionDb, quertCmd, "getForTemplateBy_id Finally");
        // console.log(result);
        if (!result[0]) return [];     // return empty array
        const rtnResult = result.map(b => b);
        return rtnResult;
    } catch (error) {
        console.log("Error : getForTemplateBy_id");
        console.log(error.message)
        return null;
    }
}


/******************* Algo*************** */
/** insert */
async function insertAlgo(info) {
    try {
        const createTable = `CREATE TABLE IF NOT EXISTS ${AlgoTable}(	
            _id int NOT NULL AUTO_INCREMENT,
            timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            unix INT(11) NOT NULL,
            algo varchar(255),
            algoName varchar(80),
            notifyMsg varchar(255),
            user_id int,
            bd_id int,
            bdDevInvolve varchar(255),
            starttime smallint,
            endtime smallint,
            trigRefreshTime smallint default -1,
            repeatWeekly tinyint,
            triggerMode tinyint,
            lastTriggeredUnix INT(11),
            inUse tinyint default 1,
            PRIMARY KEY (_id)
        );`;

        const insertData = `INSERT INTO ${AlgoTable} (unix, algo, algoName, notifyMsg , user_id, bd_id, bdDevInvolve, starttime, endtime, trigRefreshTime, repeatWeekly, triggerMode)
        VALUES (UNIX_TIMESTAMP(), "${info.algo}", "${info.algoName}", "${info.notifyMsg}", ${info.user_id}, ${info.bd_id}, "${info.bdDevInvolve}", "${info.starttime}", "${info.endtime}","${info.trigRefreshTime}", ${info.repeatWeekly}, ${info.triggerMode});`;
        // console.log("insertData: ", insertData);

        let result = await insertTemplate(v2ReactionDb, createTable, insertData, "insertAlgo");
        // console.log("insertFormula rel: ", result);
        if (!result) return false    // insert error
        if (result.affectedRows > 0 && result.insertId > 0) return { success: true, insertId: result.insertId }
        // console.log("Insert Error");
        return false;   // insert no row effec
    } catch (error) {
        console.log("insertAlgo err: ", error.message);
        return false;
    }
}

/** update */
async function updateAlgo(info, _id) {
    try {
        const quertCmd = `UPDATE ${AlgoTable} SET 
            unix=UNIX_TIMESTAMP(),
            algo = "${info.algo}",
            algoName = "${info.algoName}",
            notifyMsg = "${info.notifyMsg}",
            user_id = ${info.user_id},
            bd_id  = ${info.bd_id},
            bdDevInvolve = "${info.bdDevInvolve}",
            starttime = ${info.starttime},
            endtime = ${info.endtime},
            trigRefreshTime = ${info.trigRefreshTime},
            repeatWeekly = ${info.repeatWeekly},
            triggerMode = ${info.triggerMode},
            inUse = 1
            where _id = ${_id}`;
        // console.log("quertCmd", quertCmd);

        let result = await queryTemplate(v2ReactionDb, quertCmd, "updateAlgo Finally");
        // console.log(result);
        if (!result || !result.affectedRows) return null;
        if (result.affectedRows > 0) return true;
        return null

    } catch (error) {
        console.log("Error : updateAlgo", error.message);
        return null;
    }
}






async function getAlgoBy_bdDev_id(bdDev_id) {
    try {
        const quertCmd = `SELECT * from ${AlgoTable} WHERE bdDevInvolve like "%,${bdDev_id},%" and inUse=1`;
        // select * from V2_ReactTrigAlgo where bdDevInvolve like "%,6,%";
        // console.log(quertCmd);
        let result = await queryTemplate(v2ReactionDb, quertCmd, "getAlgoBy_bdDev_id Finally");
        // console.log(result);
        if (!result[0]) return [];     // return empty array
        const rtnResult = result.map(b => b);
        return rtnResult;
    } catch (error) {
        console.log("Error : getAlgoBy_bdDev_id");
        console.log(error.message)
        return null;
    }
}

async function getAlgoActiveByUserAndBd(info) {
    try {
        const quertCmd = `SELECT * from ${AlgoTable} WHERE user_id = ${info.user_id} AND bd_id = ${info.bd_id} AND inUse = 1`;
        // select * from V2_ReactTrigAlgo where bdDevInvolve like "%,6,%";
        // console.log(quertCmd);
        let result = await queryTemplate(v2ReactionDb, quertCmd, "getAlgoActiveByUserAndBd Finally");
        // console.log(result);
        if (!result[0]) return [];     // return empty array
        const rtnResult = result.map(b => b);
        return rtnResult;
    } catch (error) {
        console.log("Error : getAlgoActiveByUserAndBd");
        console.log(error.message)
        return null;
    }
}

async function getAlgoBy_id(algo_id) {
    try {
        const quertCmd = `SELECT * from ${AlgoTable} WHERE _id = ${algo_id} and inUse=1`;
        // select * from V2_ReactTrigAlgo where bdDevInvolve like "%,6,%";
        // console.log(quertCmd);
        let result = await queryTemplate(v2ReactionDb, quertCmd, "getAlgoBy_id Finally");
        // console.log(result);
        if (!result[0]) return [];     // return empty array
        const rtnResult = result.map(b => b);
        return rtnResult;
    } catch (error) {
        console.log("Error : getAlgoBy_id");
        console.log(error.message)
        return null;
    }
}

async function getGetCondition_byAlgo_id(algo_id) {
    try {
        const quertCmd = `SELECT * from ${ConditionTable} WHERE algo_id = ${algo_id} and inUse = 1;`;
        // select * from V2_ReactTrigAlgo where bdDevInvolve like "%,6,%";
        // console.log(quertCmd);
        let result = await queryTemplate(v2ReactionDb, quertCmd, "getGetCondition_byAlgo_id Finally");
        // console.log(result);
        if (!result[0]) return [];     // return empty array
        const rtnResult = result.map(b => b);
        return rtnResult;
    } catch (error) {
        console.log("Error : getGetCondition_byAlgo_id");
        console.log(error.message)
        return null;
    }
}

/****************** formula ******************/
/** insert */
async function insertFormulaTemplate(info) {
    const createTable = `CREATE TABLE IF NOT EXISTS ${FormulaTable}(	
        _id int NOT NULL AUTO_INCREMENT,
        timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        unix INT(11) NOT NULL,
        user_id int not null,
        formula varchar(255),
        variable varchar(80),
        name varchar(80),
        active tinyint default 1,
        PRIMARY KEY (_id)
    );`;

    const insertData = `INSERT INTO ${FormulaTable} (unix, user_id, formula, variable, name)
    VALUES (UNIX_TIMESTAMP(), ${info.user_id}, "${info.formula}", "${info.variable}", "${info.name}");`;
    // console.log("insertData: ", insertData);

    let result = await insertTemplate(v2ReactionDb, createTable, insertData, "InsertNewUserFinally");
    // console.log("insertFormula rel: ", result);
    if (!result) return false    // insert error
    if (result.affectedRows > 0 && result.insertId > 0) return { success: true, insertId: result.insertId }
    // console.log("Insert Error");
    return false;   // insert no row effec
}

/** update */
async function updateFormula(info, _id) {
    try {
        const quertCmd = `UPDATE ${FormulaTable} SET 
            unix=UNIX_TIMESTAMP(),
            formula = "${info.formula}",
            variable = "${info.variable}",
            name = "${info.name}",
            active = 1
            where _id = ${_id}`;
        // console.log("quertCmd", quertCmd);

        let result = await queryTemplate(v2ReactionDb, quertCmd, "updateFormula Finally");
        // console.log(result);
        if (!result || !result.affectedRows) return null;
        if (result.affectedRows > 0) return true;
        return null

    } catch (error) {
        console.log("Error : updateFormula");
        console.log(error.message)
        return null;
    }
}

/** Select   */
async function getOneInaciveFormula() {
    try {
        const quertCmd = `SELECT * from ${FormulaTable} WHERE active = 0 limit 1`;
        // select * from V2_ReactTrigAlgo where bdDevInvolve like "%,6,%";
        // console.log(quertCmd);
        let result = await queryTemplate(v2ReactionDb, quertCmd, "getOneInaciveFormula Finally");
        // console.log(result);
        if (!result[0]) return [];     // return empty array
        const rtnResult = result.map(b => b);
        return rtnResult;
    } catch (error) {
        console.log("Error : getOneInaciveFormula");
        console.log(error.message)
        return null;
    }
}

async function getFormulaBy_UserId(user_id) {
    try {
        const quertCmd = `SELECT * from ${FormulaTable} WHERE user_id = ${user_id} and active=1`;
        // select * from V2_ReactTrigAlgo where bdDevInvolve like "%,6,%";
        // console.log(quertCmd);
        let result = await queryTemplate(v2ReactionDb, quertCmd, "getFormulaBy_UserId Finally");
        // console.log(result);
        if (!result[0]) return [];     // return empty array
        const rtnResult = result.map(b => b);
        return rtnResult;
    } catch (error) {
        console.log("Error : getFormulaBy_UserId");
        console.log(error.message)
        return null;
    }
}

async function getFormulaBy_Id(_id) {
    try {
        const quertCmd = `SELECT * from ${FormulaTable} WHERE _id = ${_id} and active=1`;
        // select * from V2_ReactTrigAlgo where bdDevInvolve like "%,6,%";
        // console.log(quertCmd);
        let result = await queryTemplate(v2ReactionDb, quertCmd, "getFormulaBy_UserId Finally");
        // console.log(result);
        if (!result[0]) return [];     // return empty array
        const rtnResult = result.map(b => b);
        return rtnResult;
    } catch (error) {
        console.log("Error : getFormulaBy_UserId");
        console.log(error.message)
        return null;
    }
}


/******************* condi *************** */
/** insert */
async function insertCondi(info, algo_id) {
    try {
        const createTable = `CREATE TABLE IF NOT EXISTS ${ConditionTable}(	
            _id int NOT NULL AUTO_INCREMENT,
            timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            unix INT(11) NOT NULL,
            inputType smallint default 1,
            input_id int,
            setpoint float,
            spDataKey varchar(80),
            spBdDev_id int,         
            dataKey varchar(80),
            user_id int,
            condIdx varchar(1),
            algo_id int,
            name varchar(40),
            operator varchar(10),
            delayType tinyint default 0,
            occurBuffer smallint default 1,
            gradientDuration smallint default 0,
            lastUpdate_unix INT(11),
            fulfillmentCnt smallint default 0,
            inUse tinyint default 1,
            PRIMARY KEY (_id)
        );`;

        const insertData = `INSERT INTO ${ConditionTable} (unix, inputType, input_id, setpoint, dataKey, spDataKey, spBdDev_id,  user_id, condIdx, algo_id, name, operator, delayType, occurBuffer, gradientDuration)
        VALUES (UNIX_TIMESTAMP(), ${info.inputType}, ${info.input_id}, ${info.setpoint}, "${info.dataKey}", "${info.spDataKey}", ${info.spBdDev_id}, ${info.user_id},"${info.condIdx}", ${algo_id}, "${info.name}", "${info.operator}", ${info.delayType}, ${info.occurBuffer}, ${info.gradientDuration});`;
        // console.log("insertData: ", insertData);

        let result = await insertTemplate(v2ReactionDb, createTable, insertData, "insertCondi");
        // console.log("insertFormula rel: ", result);
        if (!result) return false    // insert error
        if (result.affectedRows > 0 && result.insertId > 0) return { success: true, insertId: result.insertId }
        // console.log("Insert Error");
        return false;   // insert no row effec
    } catch (error) {
        console.log("insertCondi err: ", error.message);
        return false;
    }
}

/** update */
async function updateCondi(info, _id, algo_id) {
    try {
        const quertCmd = `UPDATE ${ConditionTable} SET 
            unix=UNIX_TIMESTAMP(),
            inputType = ${info.inputType},
            input_id = ${info.input_id},
            setpoint = ${info.setpoint},
            dataKey = "${info.dataKey}",
            spDataKey = "${info.spDataKey}",
            spBdDev_id = ${info.spBdDev_id},
            user_id = ${info.user_id},
            condIdx = "${info.condIdx}",
            algo_id  = ${algo_id},
            name = "${info.name}",
            operator  = "${info.operator}",
            delayType = ${info.delayType},
            occurBuffer = ${info.occurBuffer},
            gradientDuration = ${info.gradientDuration},
            inUse = 1
            where _id = ${_id}`;

        let result = await queryTemplate(v2ReactionDb, quertCmd, "updateCondi Finally");
        // console.log(result);
        if (!result || !result.affectedRows) return null;
        if (result.affectedRows > 0) return true;
        return null

    } catch (error) {
        console.log("Error : updateCondi", error.message);
        return null;
    }
}

async function updateCondi_inUse(_id, inUse) {
    try {
        const quertCmd = `UPDATE ${ConditionTable} SET inUse = ${inUse} where _id = ${_id}`;

        let result = await queryTemplate(v2ReactionDb, quertCmd, "updateCondi_inUse Finally");
        // console.log(result);
        if (!result || !result.affectedRows) return null;
        if (result.affectedRows > 0) return true;
        return null

    } catch (error) {
        console.log("Error : updateCondi", error.message);
        return null;
    }
}


/******************* forVar *************** */
/** insert */
async function insertForVar(info) {
    try {
        const createTable = `CREATE TABLE IF NOT EXISTS ${FormulaVarTable}(	
            _id int NOT NULL AUTO_INCREMENT,
            timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            unix INT(11) NOT NULL,
            name varchar(80),
            template_id int,
            condition_id int,
            bddev_id int,
            varSymbol varchar(10),
            dataKey varchar(80),
            lastUpdate_unix INT(11),
            fulfillmentCnt smallint default 0,
            inUse tinyint default 1,
            PRIMARY KEY (_id)
        );`;

        const insertData = `INSERT INTO ${FormulaVarTable} (unix, name, template_id, condition_id, bddev_id, varSymbol, dataKey)
        VALUES (UNIX_TIMESTAMP(), "${info.name}", ${info.template_id}, ${info.condition_id}, ${info.bddev_id}, "${info.varSymbol}", "${info.dataKey}");`;
        // console.log("insertData: ", insertData);

        let result = await insertTemplate(v2ReactionDb, createTable, insertData, "insertForVar");
        // console.log("insertFormula rel: ", result);
        if (!result) return false    // insert error
        if (result.affectedRows > 0 && result.insertId > 0) return { success: true, insertId: result.insertId }
        // console.log("Insert Error");
        return false;   // insert no row effec
    } catch (error) {
        console.log("insertForVar err: ", error.message);
        return false;
    }
}

/** update */
async function updateForVar(info, _id) {
    try {
        const quertCmd = `UPDATE ${FormulaVarTable} SET 
            unix=UNIX_TIMESTAMP(),
            name = "${info.name}",
            template_id = ${info.template_id},
            condition_id = ${info.condition_id},
            bddev_id = ${info.bddev_id},
            varSymbol = "${info.varSymbol}",
            dataKey = "${info.dataKey}",
            inUse = 1
            where _id = ${_id}`;

        let result = await queryTemplate(v2ReactionDb, quertCmd, "updateForVar Finally");
        // console.log(result);
        if (!result || !result.affectedRows) return null;
        if (result.affectedRows > 0) return true;
        return null

    } catch (error) {
        console.log("Error : updateForVar", error.message);
        return null;
    }
}

/** variable */
exports.v2ReactionDb = v2ReactionDb;
exports.AlgoTable = AlgoTable;
exports.ConditionTable = ConditionTable;
exports.FormulaVarTable = FormulaVarTable;


/** algo */
exports.getAlgoBy_bdDev_id = getAlgoBy_bdDev_id;
exports.insertAlgo = insertAlgo;
exports.updateAlgo = updateAlgo;
exports.getAlgoBy_id = getAlgoBy_id;
exports.getAlgoActiveByUserAndBd = getAlgoActiveByUserAndBd;

/** condi */
exports.insertCondi = insertCondi;
exports.updateCondi = updateCondi;
exports.getGetCondition_byAlgo_id = getGetCondition_byAlgo_id;
exports.updateCondi_inUse = updateCondi_inUse;

/** for var */
exports.getForTemplateBy_id = getForTemplateBy_id;
exports.getForVarBy_condi_id = getForVarBy_condi_id;
exports.setFulfillmentCnt = setFulfillmentCnt;
exports.setForVarFulfillmentCnt = setForVarFulfillmentCnt;
exports.insertForVar = insertForVar;
exports.updateForVar = updateForVar;

/** formula */
exports.getOneInaciveFormula = getOneInaciveFormula;
exports.insertFormulaTemplate = insertFormulaTemplate;
exports.updateFormula = updateFormula;
exports.getFormulaBy_UserId = getFormulaBy_UserId;
exports.getFormulaBy_Id = getFormulaBy_Id;
