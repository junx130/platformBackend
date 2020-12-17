const express = require("express");
const router = express.Router();
const Joi = require("joi");
const {getOffsetByIdnKey} = require("../../MySQL/offset/offset");
const auth = require("../../Middleware/auth");


function validate(data){
    const schema = {        
        _id:Joi.number(),
        type: Joi.number().required().min(1),
        devID: Joi.number().required().min(1),
        DataKey: Joi.string().required().max(80),
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
        console.log("Get User's Building Error");
        return res.status(404).send(ex.message);        
    }

});



module.exports = router;