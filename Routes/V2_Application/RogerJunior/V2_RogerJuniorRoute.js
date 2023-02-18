const express = require("express");
const { getRjScene_BybdDev_id, getRjRules_bdDevId_sceneIdx_inUse, getRjCondis_bdDevId_sceneIdx_inUse, getRjOnineVar_BybdDev_id, updateRjScene, updateRjRule, updateRjCondi, getRjEmptyCondis, insertRjCondi, getRjEmptyRule, insertRjRule, condiSetAllUnUse, rulesSetAllUnUse } = require("../../../MySQL/V2_Application/RogerJunior/V2_App_RJ");
const router = express.Router();
const auth = require("../../../Middleware/auth");
const { notArrOrEmptyArr } = require("../../../utilities/validateFn");


router.post("/getscene", auth, async (req, res) => {
    try {
        // let {app_id} = req.body;
        // let gwPairList = await V2_getGwPair(bdDev_id);
        // if(!gwPairList) return res.status(203).send({errMsg:"Get GW info Err(DB)"});    // catch error
        let {rj_id} = req.body;
        let sceneList = await getRjScene_BybdDev_id(rj_id);
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
        if(scene.sceneIdx >0){      /** existing scene, set all to unUse 1st */
            /** set all condi inUse to 0 */
            let setCondiUnUseRel = await condiSetAllUnUse(Rj_id, scene.sceneIdx);
            if(!setCondiUnUseRel)  {
                console.log("setCondiUnUseRel", setCondiUnUseRel);
                ErrCnt ++;
            }
            /** set all rule inUse to 0 */
            let setRulesUnUseRel = await rulesSetAllUnUse(Rj_id, scene.sceneIdx);
            if(!setRulesUnUseRel) {
                console.log("setRulesUnUseRel", setRulesUnUseRel);
                ErrCnt ++;
            } 
        }else{      // check if handle by logic below
        }


        /** check if Rj_bdDevId, and sceneIdx match */
        let sceneList = await getRjScene_BybdDev_id(Rj_id);
        let sceneIdx;
        let matchScene = sceneList.find(c=>c.sceneIdx === scene.sceneIdx && scene.sceneIdx > 0);
        if (matchScene) {   // got match, update
            let updateScene = await updateRjScene(scene, matchScene._id);
            if(!updateScene)  {
                console.log("updateScene", updateScene);
                ErrCnt ++;
            }
            sceneIdx = scene.sceneIdx;
        }else{      // no matching, add new???
            /** no match, insert */
                /** get total scene for RJ_id, set sceneIdx to next number */

            return res.status(203).send({ errMsg: "New scene not handled" });
        }                

        /** handle rules & condi*/
        let ruleIdx = 0;
        for (const eachRule of rules) {
            ruleIdx ++;
            if(eachRule.rule._id > 0){      // existing rule 
                /** update rule */
                // eachRule.rule = 
                let updateRel_Rule = await updateRjRule(eachRule.rule, eachRule.rule._id, ruleIdx);
                if(!updateRel_Rule) {
                    ErrCnt ++;
                    console.log("updateRel_Rule", updateRel_Rule);
                    continue
                }
                // sceneIdx = eachRule.rule.sceneIdx;
            }else{      // new rule, get rule with inUse =0, if got, update, if no, insert???                    
                let newRule = {Rj_bdDevId:Rj_id, sceneIdx, ...eachRule.rule}
                // console.log("newRule", newRule);
                /** get if got empty slot */
                let emptyRule = await getRjEmptyRule();
                if(notArrOrEmptyArr(emptyRule)){        // no slot valid, insert
                    let insertRule_rel = await insertRjRule(newRule, ruleIdx);
                    if(!insertRule_rel)  {
                        console.log("insertRule_rel", insertRule_rel);
                        ErrCnt ++;
                    }
                    if(!insertRule_re.success) continue     // log in failed, skip insert condis
                }else{      // got slot valid, update   ???
                    /** yes, update */
                    console.log("eachRule.rule", eachRule.rule);
                    let updateRel_EmptyRule = await updateRjRule(newRule, emptyRule[0]._id, ruleIdx);
                    if(!updateRel_EmptyRule){
                        console.log("updateRel_EmptyRule", updateRel_EmptyRule);
                        ErrCnt ++;
                    }
                }
                // continue;
            }

            for (const eachCondi of eachRule.condi) {
                if(eachCondi._id > 0){      // existing condi
                    let updateRel_condi = await updateRjCondi(eachCondi, eachCondi._id, ruleIdx);
                    if(!updateRel_condi){
                        console.log("updateRel_condi", updateRel_condi);
                        ErrCnt ++;
                    }
                }else{      // new added condi
                    /** check if any condi is  */
                    let newCondi = {Rj_bdDevId:Rj_id, sceneIdx, ...eachCondi};
                    let emptyCondi = await getRjEmptyCondis();
                    if(notArrOrEmptyArr(emptyCondi)){       // no available slot, insert
                        let insertCondiRel = await insertRjCondi(newCondi, ruleIdx);
                        if(!insertCondiRel){
                            console.log("insertCondiRel", insertCondiRel);
                            ErrCnt ++;
                        }
                    }else{      // got available slot, update   ???
                        let updateRel_condi = await updateRjCondi(newCondi, emptyCondi[0]._id, ruleIdx);
                        if(!updateRel_condi){
                            console.log("update_EmptyCondi", updateRel_condi);
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
    let errTopic = "updatescene";
    try {
        let {rj_id} = req.body;
        console.log("req.body", req.body);
        /** handle scene */
            /** pull all scene, sort the number after this deleted scene */

        // return res.status(200).send(onlineVar);
        return res.status(200).send({Success:true});
    } catch (error) {
        console.log(`${errTopic} : `, error.message);
        return res.status(203).send({ errMsg: "Database Error (Exp)" });
    }
});

module.exports = router;