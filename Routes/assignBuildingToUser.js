const express = require("express");
const router = express.Router();
const Joi = require("joi");
const { insertBuildingOwner, removeAuthorization, getOwnerBuildings } = require("../MySQL/userManagement/assignBuilding");
const auth = require("../Middleware/auth");


function validateMessage(user){    
    const schema = {       
        userID: Joi.number().required().min(1).label("User ID"),
        buildingID: Joi.number().required().min(1).label("Building ID"),
        userAmmend: Joi.string().max(80).label("User Ammend"),
    }
    return Joi.validate(user, schema);
}

router.get("/get/:userid", auth, async (req, res) => {    
    try {
        // console.log(req.params.userid);
        let result = await getOwnerBuildings(req.params.userid);

        // if(!result) return res.status(401).send("Get User's Building Error(DB)");
        return res.status(200).send(result);
        
    } catch (ex) {
        console.log("Get User's Building Error");
        return res.status(404).send(ex.message);        
    }

});


router.post("/add", auth, async (req, res) => {
    console.log(req.body);
    const{error} = validateMessage(req.body);
    // stop seq if error
    if(error) return res.status(400).send(error.details[0].message);    
    // console.log(req.user);
    if(req.user.active != 1) return res.status(401).send("Account not active");  
    
    try {
        console.log("req.body");
        let data = req.body;   
        data.userAmmend = req.user.username;        
        console.log(data);
        let result  = await insertBuildingOwner(data);  
        console.log(result);   
        if(!result) return res.status(400).send("Grant Access Failed(DB).");
        if(result.affectedRows<1) return res.status(400).send("Grant Access Failed.");
        res.status(200).send(`Grant Access Succesful`);        
    } catch (ex) {        
        console.log("Grant Access Error");
        return res.status(404).send(ex.message);        
    }
});


router.post("/del", auth, async (req, res) => {
    console.log(req.body);
    const{error} = validateMessage(req.body);
    // stop seq if error
    if(error) return res.status(400).send(error.details[0].message);    
    // console.log(req.user);
    if(req.user.active != 1) return res.status(401).send("Account not active");  
    
    try {
        let data = req.body;   
        data.userAmmend = req.user.username;        
        let result  = await removeAuthorization(data);     
        if(!result) return res.status(400).send("Remove Auth Failed(DB).");
        if(result.affectedRows<1) return res.status(400).send("Remove Auth Failed.");
        res.status(200).send(`Remove Auth Succesful`);        
    } catch (ex) {        
        console.log("Remove Auth Error");
        return res.status(404).send(ex.message);        
    }
});


module.exports = router;