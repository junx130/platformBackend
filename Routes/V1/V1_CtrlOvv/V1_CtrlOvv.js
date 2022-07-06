const express = require("express");
const router = express.Router();
const auth = require("../../../Middleware/auth");
const { get_V1_ctrlOvvAreaInBd_ctrlPg, get_V1_ctrlOvvDevInBd_ctrlPg } = require("../../../MySQL/V1/V1_CtrlOvv/V1_CtrlOvv");



router.post("/ovv/getareandevice", auth, async (req, res) => {
    try {
        let {bd_id, ctrlPg} = req.body;
        let getAreaRel = await get_V1_ctrlOvvAreaInBd_ctrlPg(bd_id, ctrlPg);
        if(!getAreaRel) return res.status(203).send({errMsg:"Get Area Db Err"});    // catch error

        let getDevRel = await get_V1_ctrlOvvDevInBd_ctrlPg(bd_id, ctrlPg);
        if(!getDevRel) return res.status(203).send({errMsg:"Get Device Db Err"});    // catch error

        return res.status(200).send({areaList:getAreaRel, devList:getDevRel});
    } catch (error) {
        console.log("getactivebyuserbd : ", error.message);
        return res.status(203).send({ errMsg: "Database Error (Exp)" });
    }
});



module.exports = router;