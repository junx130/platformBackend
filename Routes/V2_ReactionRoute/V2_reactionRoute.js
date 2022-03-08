const express = require("express");
const router = express.Router();
const auth = require("../../Middleware/auth");
const { getSingleNotInuse_Common } = require("../../MySQL/V2_DbCommon/V2_dbCommon");
const { getOneInaciveFormula, insertFormulaTemplate, updateFormula, getFormulaBy_UserId, v2ReactionDb, AlgoTable, insertAlgo, updateAlgo, ConditionTable, insertCondi, updateCondi, FormulaVarTable, insertForVar, updateForVar, getAlgoBy_id, getGetCondition_byAlgo_id, getFormulaBy_Id, getAlgoActiveByUserAndBd } = require("../../MySQL/V2_Reaction/V2_Reaction");
const { notArrOrEmptyArr } = require("../../utilities/validateFn");

router.post("/formula/savenew", auth, async (req, res) => {
    try {
        let formula = req.body;
        // console.log("formula", formula);
        /** check whether user got slot with active = 0 */
        let nonActiveSlot = await getOneInaciveFormula();
        // console.log("nonActiveSlot", nonActiveSlot);
        let addSuccess = false;
        let _id;
        if (Array.isArray(nonActiveSlot) && nonActiveSlot.length > 0) {
            /** yes, update active =0 */
            // console.log("yes");
            let updateRel = await updateFormula(formula, nonActiveSlot[0]._id);
            _id = nonActiveSlot[0]._id;
            // console.log("updateRel", updateRel);
            addSuccess = updateRel;
        } else {
            /** no, insert new */
            let insertRel = await insertFormulaTemplate(formula);
            if (insertRel.success) {
                _id = insertRel.insertId;
                addSuccess = true;
            }
        }


        /** return true message to user */
        // let rel = await getV2BattList(bdDev_id);
        // console.log(rel);
        if (!addSuccess) return res.status(203).send({ errMsg: "Add Formula Error" });
        return res.status(200).send({ success: true, for_id: _id });

    } catch (error) {
        console.log("/formula/savenew Error");
        console.log(error.message);
        return res.status(203).send({ errMsg: "Server Exc Error" });
    }
});

router.post("/formula/getbyuserid", auth, async (req, res) => {
    try {
        let { user_id } = req.body;
        let result = await getFormulaBy_UserId(user_id);
        if (!result) return res.status(203).send([]);    // catch error
        return res.status(200).send(result);
    } catch (error) {
        console.log("getbyuserid : ", error.message);
        return res.status(203).send({ errMsg: "Database Error (Exp)" });
    }
});

const handleAlgo = async (Algo_Info) => {
    try {
        /** check whether got slot with 0 inUse */
        let notInuse = await getSingleNotInuse_Common(v2ReactionDb, AlgoTable);
        // console.log("notInuse", notInuse);
        let algo_id;
        let insertAlgoError;
        if (notArrOrEmptyArr(notInuse)) {
            /** no inUse 0, insert */
            let insertAlgoRel = await insertAlgo(Algo_Info);
            if (!insertAlgoRel.success) { insertAlgoError = true; }
            else { algo_id = insertAlgoRel.insertId };
            // console.log("insertAlgoRel to id: ", insertAlgoRel.insertId);
        } else {
            /** if got inUse 0, update */
            let updateAlgoRel = await updateAlgo(Algo_Info, notInuse[0]._id);
            algo_id = notInuse[0]._id;
            if (!updateAlgoRel) insertAlgoError = true;
            // console.log("updateAlgoRel", updateAlgoRel)
        }
        if (insertAlgoError) return { err: true };
        return { algo_id }
    } catch (error) {
        console.log(error.message);
        return { err: true };
    }
}

const C_varList = [
    "x", "y", "z", "a", "b", "c"
];

const handleCondi = async (eachCondi, algo_id) => {
    try {
        let notInuse = await getSingleNotInuse_Common(v2ReactionDb, ConditionTable);
        let dbErr = false;
        let condi_id;
        if (notArrOrEmptyArr(notInuse)) {
            // console.log('Insert');
            let insertRel = await insertCondi(eachCondi, algo_id);
            if (!insertRel.success) { dbErr = true; }
            else {
                condi_id = insertRel.insertId;
            }
        } else {
            // console.log('Update');
            let updateRel = await updateCondi(eachCondi, notInuse[0]._id, algo_id);
            if (!updateRel) { dbErr = true; }
            else {
                condi_id = notInuse[0]._id;
            }
        }
        console.log("eachCondi", eachCondi);


        /** value type skip insert formula variable */
        if (eachCondi.inputType !== 2) return !dbErr;

        /** save into formulaVar */
        for (const eachVarSym of C_varList) {
            let curVar = eachCondi[`cd_var_${eachVarSym}`];
            // console.log(`${eachVarSym} :  ${curVar}`);
            // console.log("curVar.name", curVar.name);
            let forVarInfo = compileForVarInfo(eachVarSym, eachCondi.input_id, condi_id, curVar);
            if (forVarInfo.bddev_id === 0 || !forVarInfo.bddev_id) continue;
            console.log("forVarInfo", forVarInfo);
            /** insert to for var DB ??? */
            let forVarrel = await handleForVar(forVarInfo);
            console.log("forVarrel", forVarrel);
            if (!forVarrel) return false;
            console.log("Reach Here");
        }

        console.log("Goint to be TRUE");
        return true;
    } catch (error) {
        console.log(error.message);
        return false;
    }
}

const handleForVar = async (forVarInfo) => {
    try {
        let notInuse = await getSingleNotInuse_Common(v2ReactionDb, FormulaVarTable);
        let queryErr = false;
        if (notArrOrEmptyArr(notInuse)) {
            /** all accupy, insert */
            let insertRel = await insertForVar(forVarInfo);
            console.log("insertRel", insertRel);
            if (!insertRel.success) queryErr = true;
        } else {
            /** some not inuse, update */
            let updatRel = await updateForVar(forVarInfo, notInuse[0]._id);
            console.log("updatRel", updatRel);
            if (!updatRel) queryErr = true;
        }
        return !queryErr;
    } catch (error) {
        console.log(error.message);
        return false
    }
}

const compileForVarInfo = (varSymbol, template_id, condition_id, var_n) => {
    let forVarInfo = {
        name: var_n.name,
        template_id,
        condition_id: condition_id,
        bddev_id: var_n._id,
        varSymbol,
        dataKey: var_n.paraKey,
    }
    return forVarInfo;
}



router.post("/algo/insert", auth, async (req, res) => {
    try {
        let { Algo_Info, Condi_info } = req.body;
        // console.log("body", Algo_Info);
        // console.log("body", Condi_info);

        // return
        /*************** insert algo **************/
        let { algo_id, err } = await handleAlgo(Algo_Info);
        if (err) return res.status(203).send({ errMsg: 'Insert Event Error (DB)' });

        /***** Inser into V2_ReactCondition ************* */
        console.log("algo_id", algo_id)
        let condiErr = false;
        for (const eachCondi of Condi_info) {
            console.log("~~~~~~~eachCondi counting~~~~", eachCondi);
            let condiRel = await handleCondi(eachCondi, algo_id)
            console.log("*********condiRel****************", condiRel);
            if (!condiRel) condiErr = true;
        }
        console.log();
        if (condiErr) return res.status(203).send({ errMsg: 'Insert Condition Error (DB)' });

        /** Inser into V2_ReactFormulaVarTable; */
        // let result = await getFormulaBy_UserId(user_id);
        // if(!result) return res.status(203).send([]);    // catch error
        return res.status(200).send({ success: true });
    } catch (error) {
        console.log("getbyuserid : ", error.message);
        return res.status(203).send({ errMsg: "Database Error (Exp)" });
    }
});

router.post("/algo/getactivebyuserbd", auth, async (req, res) => {
    try {
        let info = req.body;
        let result = await getAlgoActiveByUserAndBd(info);
        if (!result) return res.status(203).send([]);    // catch error
        return res.status(200).send(result);
    } catch (error) {
        console.log("getactivebyuserbd : ", error.message);
        return res.status(203).send({ errMsg: "Database Error (Exp)" });
    }
});


/** get algo related info by algo_id */
router.post("/algo/getbyalgo_id", auth, async (req, res) => {
    try {
        let { algo_id } = req.body;
        // console.log("body", body);
        /** get algo list by algo_id */
        let algoList = await getAlgoBy_id(algo_id)
        console.log("algoList", algoList);
        if (notArrOrEmptyArr(algoList)) return res.status(203).send({ errMsg: 'Query Event Error (DB)' });
        // if(condiErr) return res.status(203).send({errMsg:'Insert Condition Error (DB)'});
        /** get confition list base on algoList[0] */
        let condiList = await getGetCondition_byAlgo_id(algoList[0]._id);
        if (notArrOrEmptyArr(condiList)) return res.status(203).send({ errMsg: 'Query Condition List Error (DB)' });
        console.log("condiList", condiList);
        let involveSensorList = [];
        let formulaList = [];
        for (const eachCondi of condiList) {
            /** input type is formula */
            if (eachCondi.inputType === 2) {
                /** query formula info  */
                let formulaRel = await getFormulaBy_Id(eachCondi.input_id);
                if (notArrOrEmptyArr(formulaRel)) continue;
                formulaList.push(formulaRel[0]);
            }

        }
        /** for each condition, 
         * 1. if input type is formula, query condition 
         * 2. query input sensor info also (add to sensor list)
         * 2. if output type is sensor, sensor info (add to sensor list)
         * */


        /** query sensor info by list */




        return res.status(200).send({ success: true, algoInfo: algoList[0], condiList, formulaList });
    } catch (error) {
        console.log("getbyuserid : ", error.message);
        return res.status(203).send({ errMsg: "Database Error (Exp)" });
    }
});





module.exports = router;