const express = require("express");
const router = express.Router();
const auth = require("../../Middleware/auth");
const { notArrOrEmptyArr } = require("../../utilities/validateFn");
const { getCoolingTowerCfg_bybdDev_id } = require("../../MySQL/V2_AppDevice/V2_CoolingTowerCfg");

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


module.exports = router;