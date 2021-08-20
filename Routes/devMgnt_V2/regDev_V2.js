const express = require("express");
const router = express.Router();
const auth = require("../../Middleware/auth");
const { regBdDev_V2, getInvolveBdDev_2, checkBeenRegistered, getOwnDev_2 } = require("../../MySQL/regDevice_V2/regDevice_V2");

router.post("/regbddev", auth, async (req, res) => {  
    // console.log('````````````Come in`````````````````');  
    try {
        // buidling.userAmmend = req.user.username;
        let body = req.body;
        body.owner_Id = req.user._id;
        
        /** Check wheter device been registered */
        let devBeenRegistered = await checkBeenRegistered(body);
        // console.log(devBeenRegistered);
        if(devBeenRegistered[0]) return res.status(200).send("Device Been Registered"); 

        let setRel = await regBdDev_V2(body);      
        // console.log(setRel);          
        res.status(200).send("OK"); 
    } catch (error) {
        console.log("regbddev Error");
        console.log(error.message);
        return res.status(404).send(error.message);    
    }
});


router.post("/getinvolvedev", auth, async (req, res) => {  
    // console.log('````````````Come in`````````````````');  
    try {
        // buidling.userAmmend = req.user.username;
        let body = req.body;
        body.owner_Id = req.user._id;
        // body.user_id = req.user._id;
        let setRel = await getInvolveBdDev_2(body);      
        // console.log(setRel);          
        res.status(200).send(setRel); 
    } catch (error) {
        console.log("getinvolvedev Error");
        return res.status(404).send(error.message);    
    }
});

router.post("/getowndev", auth, async (req, res) => {  
    // console.log('````````````Come in`````````````````');  
    try {
        // buidling.userAmmend = req.user.username;
        let body = req.body;
        body.owner_Id = req.user._id;
        // body.user_id = req.user._id;
        let setRel = await getOwnDev_2(body);      
        // console.log(setRel);          
        res.status(200).send(setRel); 
    } catch (error) {
        console.log("getowndev Error");
        return res.status(404).send(error.message);    
    }
});

module.exports = router;