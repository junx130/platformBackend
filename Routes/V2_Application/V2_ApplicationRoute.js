const express = require("express");
const router = express.Router();
const auth = require("../../Middleware/auth");
const { notArrOrEmptyArr } = require("../../utilities/validateFn");
const { get_V2AppMember } = require("../../MySQL/V2_Application/V2_ApplicationMysql");
const { getBddevBy_idList } = require("../../MySQL/V2_DeviceRecord/v2_SensorOwner");

router.post("/getappmember", auth, async (req, res) => {
    try {
        // let {app_id} = req.body;
        // let gwPairList = await V2_getGwPair(bdDev_id);
        // if(!gwPairList) return res.status(203).send({errMsg:"Get GW info Err(DB)"});    // catch error
        let {app_id} = req.body;
        let appMemberRel = await get_V2AppMember(app_id);        
        if(!appMemberRel) return res.status(203).send({errMsg:"Get member device info Err(DB)"});    
        for (const eachMember of appMemberRel) {
            let bdDevInfo = await getBddevBy_idList([eachMember.bdDev_id]);
            if(notArrOrEmptyArr(bdDevInfo)) return res.status(203).send({errMsg:"Get member device details info Err(DB)"});    
            eachMember.ht = bdDevInfo[0].type;
            eachMember.hi = bdDevInfo[0].devID;
        }
        return res.status(200).send(appMemberRel);
    } catch (error) {
        console.log("/getappmember : ", error.message);
        return res.status(203).send({ errMsg: "Database Error (Exp)" });
    }
});


module.exports = router;


