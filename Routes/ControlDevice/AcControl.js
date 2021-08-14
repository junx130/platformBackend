const express = require("express");
const { insertAcCtrlScheFn, getSche_byBdDevIdFn } = require("../../ControlDevice/acControl");
const router = express.Router();
const auth = require("../../Middleware/auth");

router.post("/insertsche", auth, async (req, res) => {  
    // console.log('````````````Come in`````````````````');  
    try {
        // buidling.userAmmend = req.user.username;
        let body = req.body;
        body.userAmmend = req.user.username;
        let setRel = await insertAcCtrlScheFn(body);      
        // console.log(setRel);          
        res.status(200).send(setRel); 
    } catch (error) {
        console.log("Set Device Control Error");
        return res.status(404).send(ex.message);    
    }
});

router.post("/getschebyid", auth, async (req, res) => {  
    // console.log('````````````Come in`````````````````');  
    try {
        // buidling.userAmmend = req.user.username;
        let body = req.body;
        // body.userAmmend = req.user.username;
        let setRel = await getSche_byBdDevIdFn(body);      
        // console.log(setRel);          
        res.status(200).send(setRel); 
    } catch (error) {
        console.log("Set Device Control Error");
        return res.status(404).send(ex.message);    
    }
});

module.exports = router;