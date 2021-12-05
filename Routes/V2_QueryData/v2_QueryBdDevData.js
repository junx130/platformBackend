const express = require("express");
const { v2GetBdDevData_lastN, v2GetBdDevData_durationB4Unix } = require("../../MySQL/V2_QueryData/v2_QueryBdDevData");
const router = express.Router();
const auth = require("../../Middleware/auth");
// const Joi = require("joi");



router.post("/bddev/getlastndata", auth, async (req, res) => {    
    try {
        let {type, _id, nCnt} = req.body;
        let rel = await v2GetBdDevData_lastN(type, _id, nCnt);
        if(!rel) return res.status(204).send({errMsg:'Database Query Err'}); 
        return res.status(200).send(rel);        
    } catch (ex) {
        console.log("/bddev/getlastndata Error");
        return res.status(204).send({errMsg:'Database Server Err'});    
    }
});

router.post("/bddev/getnMinb4nUnix", auth, async (req, res) => {    
    try {
        // console.log(req.body);
        let {type, _id, endUnix, nMin} = req.body;
        let rel = await v2GetBdDevData_durationB4Unix(type, _id, endUnix, nMin);
        // console.log("endUnix", endUnix);
        if(!rel) return res.status(204).send({errMsg:'Database Query Err'}); 
        return res.status(200).send(rel);        
    } catch (ex) {
        console.log("/bddev/getnMinb4nUnix Error");
        return res.status(204).send({errMsg:'Database Server Err'});    
    }
});




module.exports = router;