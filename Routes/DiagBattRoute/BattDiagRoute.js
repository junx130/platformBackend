const express = require("express");
const router = express.Router();
const auth = require("../../Middleware/auth");

const {battDiagnostic} = require("../../Features/BattDiagnostic/BattDiag");

router.post("/bydevslist", auth, async (req, res) => {
    let result = await battDiagnostic(req.body.bdDev_List, 10);
    if(result.error) return res.status(400).send("Retrieve Info Error");      
    return res.status(200).send(result);      
    // const{error} = validateMessage(req.body);
    // stop seq if error
    // if(error) return res.status(400).send(error.details[0].message);    
    // console.log(req.user);
    // if(req.user.active != 1) return res.status(401).send("Account not active");  
    
    // try {
    //     let data = req.body;   
    //     data.userAmmend = req.user.username;        
    //     let result  = await removeAuthorization(data);     
    //     if(!result) return res.status(400).send("Remove Auth Failed(DB).");
    //     if(result.affectedRows<1) return res.status(400).send("Remove Auth Failed.");
    //     res.status(200).send(`Remove Auth Succesful`);        
    // } catch (ex) {        
    //     console.log("Remove Auth Error");
    //     return res.status(404).send(ex.message);        
    // }
});








module.exports = router;