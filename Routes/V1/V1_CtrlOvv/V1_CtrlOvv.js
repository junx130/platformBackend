const express = require("express");
const router = express.Router();
const auth = require("../../../Middleware/auth");
const { get_V1_ctrlOvvAreaInBd_ctrlPg, get_V1_ctrlOvvDevInBd_ctrlPg, get_V1_ctrlGwPair, V1_insertGatewayPair, V1_updateGwPair } = require("../../../MySQL/V1/V1_CtrlOvv/V1_CtrlOvv");
const { notArrOrEmptyArr } = require("../../../utilities/validateFn");



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

router.post("/ovv/setgwpair", auth, async (req, res) => {
    try {
        let {bdDev_id, gwid} = req.body;
        // console.log("bdDev_id : ", bdDev_id);
        // console.log("gwid : ", gwid);
        /** check gw pair exist */
        let gwList = await get_V1_ctrlGwPair(bdDev_id);
        if(notArrOrEmptyArr(gwList)){   /** not exist, insert*/
            let inertRel = await V1_insertGatewayPair({bdDev_id, gwid});
            if(!inertRel) return res.status(203).send({errMsg:"Set Gw Err (Insert failed)"});    
        }else{      /** exist update */
            let updaterel = await V1_updateGwPair(bdDev_id, gwid);
            if(!updaterel) return res.status(203).send({errMsg:"Set Gw Err (Update failed)"});    
        }

        return res.status(200).send({success:true});
    } catch (error) {
        console.log("/ovv/setgwpair : ", error.message);
        return res.status(203).send({ errMsg: "Database Error (Exp)" });
    }
});

module.exports = router;