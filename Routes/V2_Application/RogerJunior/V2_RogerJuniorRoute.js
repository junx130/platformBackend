const express = require("express");
const { getRjScene_BybdDev_id, getRjRules_bdDevId_sceneIdx_inUse, getRjCondis_bdDevId_sceneIdx_inUse, getRjOnineVar_BybdDev_id } = require("../../../MySQL/V2_Application/RogerJunior/V2_App_RJ");
const router = express.Router();
const auth = require("../../../Middleware/auth");


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


module.exports = router;