const express = require("express");
const router = express.Router();
const auth = require("../../Middleware/auth");
const { notArrOrEmptyArr } = require("../../utilities/validateFn");
const { getCoolingTowerCfg_bybdDev_id, insertCoolingTowerCfg, updateCoolingTowerCfg_by_id, getCoolingTowerCfg_bybdDev_id_incNotInUse } = require("../../MySQL/V2_AppDevice/V2_CoolingTowerCfg");

router.post("/getctcfg", auth, async (req, res) => {
    try {
        // let gwPairList = await V2_getGwPair(bdDev_id);
        // if(!gwPairList) return res.status(203).send({errMsg:"Get GW info Err(DB)"});    // catch error
        let {bdDev_id} = req.body;
        let ctCfg = await getCoolingTowerCfg_bybdDev_id(bdDev_id);
        if(!ctCfg) return res.status(203).send({errMeg:"Server Err (DB)"});

        return res.status(200).send(ctCfg);
    } catch (error) {
        console.log("/getctcfg : ", error.message);
        return res.status(203).send({ errMsg: "Database Error (Exp)" });
    }
});

router.post("/setctcfg", auth, async (req, res) => {
    try {
        let {ctCfg} = req.body;
        // console.log("ctCfg", ctCfg);
        /** check whether current CT is exist by bdDev_id*/
        let ctCfgExist = await getCoolingTowerCfg_bybdDev_id_incNotInUse(ctCfg.bdDev_id);        
        // console.log("ctCfgExist", ctCfgExist);
        if(notArrOrEmptyArr(ctCfgExist)){   
            /** not exist, insert */
            let insertRel = await insertCoolingTowerCfg(ctCfg);
            if(!insertRel) return res.status(203).send({errMeg:"Configuration Insert Err(DB)"});
            return res.status(200).send({success:true});
        }else{
            /** exist update by _id */
            let updateRel = await updateCoolingTowerCfg_by_id(ctCfg, ctCfgExist[0]._id)
            if(!updateRel) return res.status(203).send({errMeg:"Configuration Update Err(DB)"});
            return res.status(200).send({success:true});
        }


    } catch (error) {
        console.log("/setctcfg : ", error.message);
        return res.status(203).send({ errMsg: "Database Error (Exp)" });
    }
});




module.exports = router;