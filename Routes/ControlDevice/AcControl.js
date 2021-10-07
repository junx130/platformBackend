const express = require("express");
const { insertAcCtrlScheFn, getSche_byBdDevIdFn, getSche_byScheIdFn, updateAcSchedule_list, deleteAcSchedule_list } = require("../../ControlDevice/acControl");
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
        console.log("insertsche Error");
        return res.status(404).send(error.message);    
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
        console.log("getschebyid Error");
        return res.status(404).send(error.message);    
    }
});

router.post("/getschebyscheid", auth, async (req, res) => {
    try {
        // buidling.userAmmend = req.user.username;
        let body = req.body;
        console.log(body);
        // body.userAmmend = req.user.username;
        let setRel = await getSche_byScheIdFn(body);      
        console.log(setRel);          
        res.status(200).send(setRel); 
    } catch (error) {
        console.log("getschebyscheid Error");
        return res.status(404).send(error.message);    
    }
})

router.post("/updateschelist", auth, async (req, res) => {  
    // console.log('````````````Come in`````````````````');  
    try {
        // buidling.userAmmend = req.user.username;
        let body = req.body;
        body[0].userAmmend = req.user.username;
        console.log(body);
        // body.userAmmend = req.user.username;
        let setRel = await updateAcSchedule_list(body);      
        console.log('setRel', setRel);          
        // res.sendStatus(200).send(setRel); 
        res.status(200).send({errorCnt:setRel}); 
    } catch (error) {
        console.log("updateschelist Error");
        return res.status(404).send(error.message);    
    }
});


router.post("/deleteschelist", auth, async (req, res) => {  
    // console.log('````````````Come in`````````````````');  
    try {
        // buidling.userAmmend = req.user.username;
        let body = req.body;
        // body.userAmmend = req.user.username;
        let setRel = await deleteAcSchedule_list(body);      
        // console.log('setRel', setRel);          
        // res.sendStatus(200).send(setRel); 
        res.status(200).send({errorCnt:setRel}); 
    } catch (error) {
        console.log("deleteschelist Error");
        return res.status(404).send(error.message);    
    }
});

module.exports = router;