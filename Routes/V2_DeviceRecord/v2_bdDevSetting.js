const express = require("express");
const router = express.Router();
// const Joi = require("joi");
const auth = require("../../Middleware/auth");
const { getV2OvvParaList, getV2BattList } = require("../../MySQL/V2_DeviceRecord/v2_bdDevSetting");


router.post("/ovvpara/getpara", auth, async (req, res) => {    
    try {
        // console.log("/building/getbddev");
        let {user_id, bdDev_id} =req.body;
        let rel = await getV2OvvParaList(user_id, bdDev_id);
        // console.log(rel);
        
        return res.status(200).send(rel);
        
    } catch (error) {
        console.log("/ovvpara/getpara Error");
        console.log(error.message);
        return res.status(204).send({errMsg: "Server Exc Error"});        
    }
});

router.post("/batt/getbattlist", auth, async (req, res) => {    
    try {
        // console.log("/building/getbddev");
        let {bdDev_id} =req.body;
        let rel = await getV2BattList(bdDev_id);
        // console.log(rel);
        
        return res.status(200).send(rel);
        
    } catch (error) {
        console.log("/batt/getbattlist Error");
        console.log(error.message);
        return res.status(204).send({errMsg: "Server Exc Error"});        
    }
});



module.exports = router;