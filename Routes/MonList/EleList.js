const express = require("express");
const router = express.Router();
const Joi = require("joi");
const auth = require("../../Middleware/auth");
const { updateEleList, regEleList, deleteEleList} = require("../../MySQL/MonList/EleList");


function validateUpdate(data){
    const schema = {        
        _id:Joi.number().required(),
        // name: Joi.string().max(80).allow(null, ''),
        T1_id: Joi.number(),
        bdDev_id: Joi.number(),
        type: Joi.number(),
        SortIndex: Joi.number(),
    }
    return Joi.validate(data, schema);
}

router.post("/updateelelist", auth, async (req, res) => {
    try {
        // console.log("in here d");
        // console.log(req.body);
        const{error} = validateUpdate(req.body);        
        if(error) return res.status(400).send(error.details[0].message);
        // building database        
        data = req.body;
        data.userAmmend = req.user.username;
        let result = await updateEleList(data);
        if(!result) return res.status(400).send("Update Failed");     // no raw affected, update failed
        if(result.affectedRows <1) return res.status(400).send("Update Failed");     // no raw affected, update failed
        // successful
        res.status(200).send(req.body);
    } catch (ex) {
        console.log("Update Element List Error");
        return res.status(404).send(ex.message);   
    }
})

/** Add Element List */
function validateAddEleList(data){
    const schema = {            
        _id:Joi.number(),
        // name: Joi.string().max(80).allow(null, ''),
        T1_id: Joi.number(),
        bdDev_id: Joi.number(),
        type: Joi.number(),
        SortIndex: Joi.number(),
    }
    return Joi.validate(data, schema);
}

router.post("/addelelist", auth, async (req, res) => {
    try {
        console.log(req.body);
        const{error} = validateAddEleList(req.body);
        if(error) return res.status(400).send(error.details[0].message);
        // console.log("In Here");
        // Check the inserted id and type, the building id is tally with building id assigned in DevicesList.

        let data = req.body;   
        data.userAmmend = req.user.username;      
        // console.log(req.user.username);  
        let result  = await regEleList(data);    
        
        if(!result) return res.status(400).send("Insert Monitoring List Failed.");
        if(result.affectedRows<1) return res.status(400).send("Insert Monitoring List Failed.");
        //success
        res.status(200).send(`Insert T1 List successful.`);
    } catch (ex) {
        console.log("Insert T1 List Error");
        return res.status(404).send(ex.message);        
    }
});

/** Delete */
router.post("/delelelist", auth, async (req, res) => {
    // console.log(req.body);
    const{error} = validateUpdate(req.body);        // _id is required
    // stop seq if error
    if(error) return res.status(400).send(error.details[0].message);    
    // console.log(req.user);
    let rel = await deleteEleList(req.body);
    if(rel<1) {return res.status(404).send("Delete Failed")};     // no raw affected, update failed
        // reply fron end
        res.status(200).send("Delete Done");
});


module.exports = router;