const express = require("express");
const router = express.Router();
// const Joi = require("joi");
const auth = require("../../Middleware/auth");
const { getLatestThreshold_byDevId, setThreshold } = require("../../MySQL/statusNodeThreshold/statusNodeThreshold");


router.post("/getthresholdbydevid", auth, async (req, res) => {    
    try {
        // console.log(req.params.userid);
        // console.log(req.body.devID);
        
        let result = await getLatestThreshold_byDevId(req.body.devID);
        // console.log(result);
        return res.status(200).send(result);        
    } catch (ex) {
        console.log("Get Status Threshold Error");
        return res.status(404).send(ex.message);        
    }
});

router.post("/setthreshold", auth, async (req, res) => {    
    try {
        // console.log(req.body);
        // console.log(req.params.userid);
        let body = req.body;
        body.userAmmend = req.user.username;
        
        let result = await setThreshold(req.body);
        // console.log(result);
        return res.status(200).send(result);        
    } catch (ex) {
        console.log("Get Status Threshold Error");
        return res.status(404).send(ex.message);        
    }
});




module.exports = router;