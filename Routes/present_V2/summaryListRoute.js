const express = require("express");
const router = express.Router();
const auth = require("../../Middleware/auth");
const { getSumlistBy_Bd_Id } = require("../../MySQL/present_V2/summaryList");


router.post("/getsumlistbybdid", auth, async (req, res) => {  
    // console.log('````````````Come in`````````````````');  
    try {
        // buidling.userAmmend = req.user.username;
        let body = req.body;
        // body.owner_Id = req.user._id;
        // body.user_id = req.user._id;
        let setRel = await getSumlistBy_Bd_Id(body);      
        // console.log(setRel);          
        res.status(200).send(setRel); 
    } catch (error) {
        console.log("getsumlistbybdid Error");
        return res.status(404).send(error.message);    
    }
});



module.exports = router;