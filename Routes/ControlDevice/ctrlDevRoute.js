const express = require("express");
const router = express.Router();
const auth = require("../../Middleware/auth");
const { publishMqtt } = require("../../MQTT/koalaMqtt");


router.post("/send", auth, async (req, res) => {    
    try {
        // console.log(req.params.userid);
        console.log(req.body);      
        publishMqtt(`Aploud/CtrlSetting/${req.body.nodeType}`, req.body);
        return res.status(200).send("Temp return");     
    } catch (ex) {
        console.log("Set Device Control Error");
        return res.status(404).send(ex.message);        
    }
});






module.exports = router;