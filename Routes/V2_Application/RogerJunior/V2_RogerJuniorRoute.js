const express = require("express");
const { getRjScene_BybdDev_id, getRjRules_bdDevId_sceneIdx_inUse, getRjCondis_bdDevId_sceneIdx_inUse, getRjOnineVar_BybdDev_id, updateRjScene, updateRjRule, updateRjCondi, getRjEmptyCondis, insertRjCondi, getRjEmptyRule, insertRjRule, condiSetAllUnUse, rulesSetAllUnUse, insertRjScene, getRjScene_BybdDev_id_orderSortIdx, updateRjSceneSortIdx, deleteScene_unUse, getRjEmptyLinkVar, updateRjOnlineVar, insertRjOnlineVar, rjLinkVarSetAllUnUse } = require("../../../MySQL/V2_Application/RogerJunior/V2_App_RJ");
const router = express.Router();
const auth = require("../../../Middleware/auth");
const { notArrOrEmptyArr } = require("../../../utilities/validateFn");

const C_MaxScene = 10;

router.post("/getscene", auth, async (req, res) => {
    try {
        // let {app_id} = req.body;
        // let gwPairList = await V2_getGwPair(bdDev_id);
        // if(!gwPairList) return res.status(203).send({errMsg:"Get GW info Err(DB)"});    // catch error
        let {rj_id} = req.body;
        let sceneList = await getRjScene_BybdDev_id_orderSortIdx(rj_id);
        if(!sceneList) return res.status(203).send({errMsg:"Get member device info Err(DB)"});    
        
        return res.status(200).send(sceneList);
    } catch (error) {
        console.log("/getappmember : ", error.message);
        return res.status(203).send({ errMsg: "Database Error (Exp)" });
    }
});

router.post("/getsceneinfo", auth, async (req, res) => {
    let errTopic = "getsceneinfo_bybddev_id_sceneidx";
    try {
        let {rj_id, sceneIdx} = req.body;
        /** get scene */
        let sceneList = await getRjScene_BybdDev_id(rj_id);
        if(!sceneList) return res.status(203).send({errMsg:"Get member device info Err(DB)"});    
        let scene = sceneList.find(c=>c.sceneIdx === sceneIdx);
        /** get rules */
        let rules = await getRjRules_bdDevId_sceneIdx_inUse(rj_id, sceneIdx);
        if(!rules) return res.status(203).send({errMsg:"Get rules Err(DB)"});    
        
        /** get condi */
        let condis = await getRjCondis_bdDevId_sceneIdx_inUse(rj_id, sceneIdx);
        if(!condis) return res.status(203).send({errMsg:"Get condis Err(DB)"});    

        return res.status(200).send({scene, rules, condis});
    } catch (error) {
        console.log(`${errTopic} : `, error.message);
        return res.status(203).send({ errMsg: "Database Error (Exp)" });
    }
});

router.post("/getonlinevar", auth, async (req, res) => {
    let errTopic = "getonlinevar";
    try {
        let {rj_id} = req.body;
        /** get online var */
        let onlineVar = await getRjOnineVar_BybdDev_id(rj_id);
        if(!onlineVar) return res.status(203).send({errMsg:"Get member device info Err(DB)"});    

        return res.status(200).send(onlineVar);
    } catch (error) {
        console.log(`${errTopic} : `, error.message);
        return res.status(203).send({ errMsg: "Database Error (Exp)" });
    }
});

router.post("/updatescene", auth, async (req, res) => {
    let errTopic = "updatescene";
    let ErrCnt=0;
    try {
        let {Rj_id, scene, rules} = req.body;
        /** handle new scene ??? */


        /** check if Rj_bdDevId, and sceneIdx match */
        let sceneList = await getRjScene_BybdDev_id(Rj_id);
        let sceneIdx;
        let matchScene = sceneList.find(c=>c.sceneIdx === scene.sceneIdx && scene.sceneIdx > 0);
        if (matchScene) {   // got match, update
            let updateScene = await updateRjScene(scene, matchScene._id);
            if(!updateScene)  {
                ErrCnt ++;
            }
            sceneIdx = scene.sceneIdx;
        }else{      // no matching, add new???
            /** no match, insert */
                /** get all scene of RJ_id */
                /** determine which sceneIdx slot is empty, temporary set max scene can set is C_MaxScene = 20 */
                /** determine the max sortIdx of each scene, set the sortIdx to next number*/
            sceneIdx=C_MaxScene;
            let allScene = await getRjScene_BybdDev_id(Rj_id);
            for (let i = 1; i < C_MaxScene+1; i++) {    // 1~20
                let found = allScene.find(c=>c.sceneIdx === i);
                if(!found) {
                    sceneIdx = i;
                    break
                }
            }
            /** get max sortIdx */
            let maxSortIdx=0;
            for (const eachScene of allScene) {
                if(eachScene.sortIdx > maxSortIdx){
                    maxSortIdx= eachScene.sortIdx;
                }
            }
            let sortIdx = maxSortIdx+1;
            /** insert new scene */
            let insertSceneRel = await insertRjScene(scene, sceneIdx, sortIdx);
            if(!insertSceneRel){
                return res.status(203).send({ errMsg: "New scene insert error" });
            }

        }                

        /** delete all rules and condis under scene */
        // if(scene.sceneIdx >0){      /** existing scene, set all to unUse 1st */
            /** set all condi inUse to 0 */
            let setCondiUnUseRel = await condiSetAllUnUse(Rj_id, sceneIdx);
            if(!setCondiUnUseRel)  {
                // ErrCnt ++;
            }
            /** set all rule inUse to 0 */
            let setRulesUnUseRel = await rulesSetAllUnUse(Rj_id, sceneIdx);
            if(!setRulesUnUseRel) {
                // ErrCnt ++;
            } 
        // }else{      // check if handle by logic below
        // }

        /** handle rules & condi*/
        let ruleIdx = 0;
        for (const eachRule of rules) {
            ruleIdx ++;
            if(eachRule.rule._id > 0){      // existing rule 
                /** update rule */
                // eachRule.rule = 
                let updateRel_Rule = await updateRjRule(eachRule.rule, eachRule.rule._id, ruleIdx, sceneIdx);
                if(!updateRel_Rule) {
                    ErrCnt ++;
                    continue
                }
                // sceneIdx = eachRule.rule.sceneIdx;
            }else{      // new rule, get rule with inUse =0, if got, update, if no, insert???                    
                let newRule = {Rj_bdDevId:Rj_id, sceneIdx, ...eachRule.rule}
                /** get if got empty slot */
                let emptyRule = await getRjEmptyRule();
                if(notArrOrEmptyArr(emptyRule)){        // no slot valid, insert
                    let insertRule_rel = await insertRjRule(newRule, ruleIdx, sceneIdx);
                    if(!insertRule_rel)  {
                        // ErrCnt ++;
                    }
                    if(!insertRule_rel.success) continue     // log in failed, skip insert condis
                }else{      // got slot valid, update   ???
                    /** yes, update */
                    let updateRel_EmptyRule = await updateRjRule(newRule, emptyRule[0]._id, ruleIdx, sceneIdx);
                    if(!updateRel_EmptyRule){
                        // ErrCnt ++;
                    }
                }
                // continue;
            }

            for (const eachCondi of eachRule.condi) {
                if(eachCondi._id > 0){      // existing condi
                    let updateRel_condi = await updateRjCondi(eachCondi, eachCondi._id, ruleIdx, sceneIdx);
                    if(!updateRel_condi){
                        ErrCnt ++;
                    }
                }else{      // new added condi
                    /** check if any condi is  */
                    let newCondi = {Rj_bdDevId:Rj_id, sceneIdx, ...eachCondi};
                    let emptyCondi = await getRjEmptyCondis();
                    if(notArrOrEmptyArr(emptyCondi)){       // no available slot, insert
                        let insertCondiRel = await insertRjCondi(newCondi, ruleIdx, sceneIdx);
                        if(!insertCondiRel){
                            ErrCnt ++;
                        }
                    }else{      // got available slot, update   ???
                        let updateRel_condi = await updateRjCondi(newCondi, emptyCondi[0]._id, ruleIdx, sceneIdx);
                        if(!updateRel_condi){
                            ErrCnt ++;
                        }
                    }
                }
            }
        }

        if(ErrCnt>0)    return res.status(203).send({errMsg:`Save err, ErrCnt: ${ErrCnt}`});
        return res.status(200).send({Success:true});
    } catch (error) {
        console.log(`${errTopic} : `, error.message);
        return res.status(203).send({ errMsg: "Database Error (Exp)" });
    }
});


router.post("/deletscene", auth, async (req, res) => {
    let errTopic = "deletscene";
    try {
        let {Rj_id, scene} = req.body;
        let ErrCnt=0;
        /** handle scene */
        /** pull all scene, sort the number after this deleted scene */
        let allScene = await getRjScene_BybdDev_id_orderSortIdx(Rj_id);
        if(!allScene) return res.status(203).send({ errMsg: "Load scene info Err(DB)" });

        /** delete selected scene */
        let delRel = await deleteScene_unUse(scene._id);
        if(!delRel) return res.status(203).send({ errMsg: "Delete scene Err(DB)" });
        
        /** sort other scene idx */
        let remainScene = allScene.filter(c=>c.sceneIdx !== scene.sceneIdx);
        let nIdx = 0;
        for (const eachScene of remainScene) {
            nIdx++;
            if(nIdx!==eachScene.sortIdx){
                /** update sortIdx */
                let sortScene = await updateRjSceneSortIdx(nIdx, eachScene._id);
            }
        }


        /** handle rules, set all rules to unUse */
        let delRuleRel = await rulesSetAllUnUse(Rj_id, scene.sceneIdx);
        if(!delRuleRel) ErrCnt++;
        /** handle condi, set all condis to unUse */
        let delCondiRel = await condiSetAllUnUse(Rj_id, scene.sceneIdx);
        if(!delCondiRel) ErrCnt++;
        if(ErrCnt>0) return res.status(203).send({ errMsg: `Some Error Occur(${ErrCnt})`});

        return res.status(200).send({Success:true});
    } catch (error) {
        console.log(`${errTopic} : `, error.message);
        return res.status(203).send({ errMsg: "Database Error (Exp)" });
    }
});


router.post("/updatevarlist", auth, async (req, res) => {
    let errTopic = "updatevarlist";
    try {
        let {Rj_id, varList} = req.body;

        /** set all RJ Var varIdx 2~7 to unUse = 0 */
        let updateRel = await rjLinkVarSetAllUnUse(Rj_id);
        if(!updateRel) console.log("Update non");

        let InsertErr = 0;
        let UpdateErr = 0;
        /** for each Var insert  */
        for (const eachVar of varList) {
            if(!eachVar.Var_bdDevId) continue;      // empty slot
            let emptySlot = await getRjEmptyLinkVar();
            if(notArrOrEmptyArr(emptySlot)){       
                /** no empty slot, insert */
                let insertRel = await insertRjOnlineVar(eachVar, Rj_id);
                if(!insertRel) InsertErr++;
            }else{      // got empty slot, update.
                /** got empty slot, update */
                let updateRel = await updateRjOnlineVar(eachVar, Rj_id, emptySlot[0]._id);
                if(!updateRel) UpdateErr++;
            }
        }

        if(UpdateErr > 0 || InsertErr > 0 ) {
            return res.status(203).send({errMsg:`Update Err: Update(${UpdateErr}, insert:${InsertErr})`});    
        }

        return res.status(200).send({Success:true});
    } catch (error) {
        console.log(`${errTopic} : `, error.message);
        return res.status(203).send({ errMsg: "Database Error (Exp)" });
    }
});

module.exports = router;