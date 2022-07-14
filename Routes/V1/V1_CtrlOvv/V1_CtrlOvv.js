const express = require("express");
const router = express.Router();
const auth = require("../../../Middleware/auth");
const { get_V1_ctrlOvvAreaInBd_ctrlPg, get_V1_ctrlOvvDevInBd_ctrlPg, get_V1_ctrlGwPair } = require("../../../MySQL/V1/V1_CtrlOvv/V1_CtrlOvv");



router.post("/ovv/getareandevice", auth, async (req, res) => {
    try {
        let {bd_id, ctrlPg} = req.body;
        let getAreaRel = await get_V1_ctrlOvvAreaInBd_ctrlPg(bd_id, ctrlPg);
        if(!getAreaRel) return res.status(203).send({errMsg:"Get Area Db Err"});    // catch error

        let getDevRel = await get_V1_ctrlOvvDevInBd_ctrlPg(bd_id, ctrlPg);
        if(!getDevRel) return res.status(203).send({errMsg:"Get Device Db Err"});    // catch error

        return res.status(200).send({areaList:getAreaRel, devList:getDevRel});
    } catch (error) {
        console.log("/ovv/getareandevice : ", error.message);
        return res.status(203).send({ errMsg: "Database Error (Exp)" });
    }
});

router.post("/ovv/getgwpair", auth, async (req, res) => {
    try {
        let {bdDev_id} = req.body;
        let gwPairList = await get_V1_ctrlGwPair(bdDev_id);
        if(!gwPairList) return res.status(203).send({errMsg:"Get GW info Err(DB)"});    // catch error

        return res.status(200).send({gwPairList});
    } catch (error) {
        console.log("/ovv/getgwpair : ", error.message);
        return res.status(203).send({ errMsg: "Database Error (Exp)" });
    }
});

module.exports = router;