const express = require("express");
const router = express.Router();
const Joi = require("joi");
const {getOffsetByIdnKey, getOffBySearchCriterion, updateOffset, addOffset, delOffset} = require("../../MySQL/offset/offset");
const auth = require("../../Middleware/auth");



/** Add offset to DB */
router.post("/add", auth, async (req, res) => {    
    try {
        console.log("Come in liao lo");
        console.log(req.body);
        const{error} = validate(req.body);
        if(error) return res.status(400).send(error.details[0].message);
        
        data = req.body;
        data.userAmmend = req.user.username;

        let result = await addOffset(data);

        if(!result) return res.status(400).send("Insert Telegram ID Failed.");
        if(result.affectedRows<1) return res.status(400).send("Insert Device Failed.");
        
        return res.status(200).send(`Insert Offset Succesful`);
        
    } catch (ex) {
        console.log("Get Offset By Id and Key Error");
        return res.status(404).send(ex.message);        
    }

});


function validateSearch (data){
    const schema = {        
        _id:Joi.number(),
        type: Joi.number().allow(null, ''),
        devIDStart: Joi.number(),
        devIDEnd: Joi.number(),
        DataKey: Joi.string().max(80).allow(null, ''),
        offsetValue: Joi.number(),
        userAmmend: Joi.string().max(80),
    }
    return Joi.validate(data, schema);
}

router.post("/getbysearch", auth, async (req, res) => {    
    try {
        // console.log("Come in liao lo");
        // console.log(req.body);
        const{error} = validateSearch(req.body);
        if(error) return res.status(400).send(error.details[0].message);
        let result = await getOffBySearchCriterion(req.body);

        // if(!result) return res.status(401).send("Get User's Building Error(DB)");
        return res.status(200).send(result);
        
    } catch (ex) {
        console.log("Get Offset By Id and Key Error");
        return res.status(404).send(ex.message);        
    }

});

router.post("/update", auth, async (req, res) => {    
    try {
        // console.log("Come in liao lo");
        console.log(req.body);
        const{error} = validateSearch(req.body);
        if(error) return res.status(400).send(error.details[0].message);
        data = req.body;
        data.userAmmend = req.user.username;
        let result = await updateOffset(data);
        if(!result) return res.status(400).send("Update Failed");     // no raw affected, update failed
        if(result.affectedRows <1) return res.status(400).send("Update Failed");     // no raw affected, update failed
        // successful
        res.status(200).send(req.body);
    } catch (ex) {
        console.log("Get Offset By Id and Key Error");
        return res.status(404).send(ex.message);        
    }

});


function validate(data){
    const schema = {        
        _id:Joi.number(),
        type: Joi.number().required().min(1),
        devID: Joi.number().required().min(1),
        DataKey: Joi.string().max(80),
        offsetValue: Joi.number(),
        userAmmend: Joi.string().max(80),
    }
    return Joi.validate(data, schema);
}



router.post("/getbyidnkey", auth, async (req, res) => {    
    try {
        const{error} = validate(req.body);
        if(error) return res.status(400).send(error.details[0].message);
        let result = await getOffsetByIdnKey(req.body);

        // if(!result) return res.status(401).send("Get User's Building Error(DB)");
        return res.status(200).send(result);
        
    } catch (ex) {
        console.log("Get Offset By Id and Key Error");
        return res.status(404).send(ex.message);        
    }

});

router.post("/del", auth, async (req, res) => {
    console.log(req.body);
    const{error} = validateSearch(req.body);
    // stop seq if error
    if(error) return res.status(400).send(error.details[0].message);    
    // console.log(req.user);
    let rel = await delOffset(req.body);
    if(rel<1) {return res.status(404).send("Delete Failed")};     // no raw affected, update failed
        // reply fron end
        res.status(200).send("Delete Done");
});


module.exports = router;