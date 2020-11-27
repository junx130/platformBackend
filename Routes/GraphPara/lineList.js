const express = require("express");
const router = express.Router();
const auth = require("../../Middleware/auth"); 
const Joi = require("joi");
const {insertLineList, getLineListByTy_bdDevID_userID, getLineListByAccountID} = require("../../MySQL/GraphPara/lineList");

function validateInsertNew(body){
    const schema = {        
        _id:Joi.number(),
        type: Joi.number().required(),        
        bdDev_id: Joi.number().required(),
        name: Joi.string().required(),
        scaleTop: Joi.number(),
        scaleBottom: Joi.number(),
        upperLimit: Joi.number(),
        lowerLimit: Joi.number(),
        dataKey: Joi.string().max(80).required(),
        dataUnit: Joi.string().max(80).required(),
        userID: Joi.number().required(),        
        userAmmend: Joi.string().max(80),
        // accessLevel: Joi.number(),
        // active: Joi.number(),
        // teleID: Joi.number(),
    }
    return Joi.validate(body, schema);
}


router.post("/add", auth, async (req, res) => {
    try {
        //validate user access level
        if(req.user.accessLevel > 10 ) return res.status(401).send("Access Level Too Low");
        // validate building info
        // console.log(req.body);
        const{error} = validateInsertNew(req.body);        
        if(error) return res.status(400).send(error.details[0].message);
        // // check database whether building + owner both duplicated
        let exist = await getLineListByTy_bdDevID_userID(req.body);
        if(exist) return res.status(400).send("Line Exist.");
        // insert building into database
        let body = req.body;
        body.userAmmend = req.user.username;
        let result  = await insertLineList(body);
        // Check insert new building result
        // console.log("Result: ",result);
        if(!result) return res.status(400).send("Insert Line List Failed.");
        if(result.affectedRows<1) return res.status(400).send("Insert Failed.");
        //success
        res.status(200).send(`${req.body.name} line insert successful`);
    } catch (ex) {
        console.log("Register Line List Error");
        return res.status(404).send(ex.message);        
    }
});


function validateGet(body){
    const schema = {        
        _id:Joi.number(),
        type: Joi.number(),        
        bdDev_id: Joi.number().required(),
        name: Joi.string(),
        scaleTop: Joi.number(),
        scaleBottom: Joi.number(),
        upperLimit: Joi.number(),
        lowerLimit: Joi.number(),
        dataKey: Joi.string().max(80),
        dataUnit: Joi.string().max(80),
        userID: Joi.number().required().required(),        
        userAmmend: Joi.string().max(80),
        // accessLevel: Joi.number(),
        // active: Joi.number(),
        // teleID: Joi.number(),
    }
    return Joi.validate(body, schema);
}

router.post("/getByTybddevIDuserID", auth, async (req, res) => {
    try {
        // console.log(req.body);
        //validate user access level
        // if(req.user.accessLevel > 10 ) return res.status(401).send("Access Level Too Low");
        // validate building info
        const{error} = validateGet(req.body);        
        if(error) return res.status(400).send(error.details[0].message);
        // building database        
        data = req.body;
        let result = await getLineListByTy_bdDevID_userID(data);        
        return res.status(200).send(result);
        
    } catch (ex) {
        console.log("Update Building Error");
        return res.status(404).send(ex.message);   
    }
});

router.post("/getbyaccountid", auth, async (req, res) => {
    // console.log("Enter, 123");
    try {
        // console.log(req.body);
        //validate user access level
        // if(req.user.accessLevel > 10 ) return res.status(401).send("Access Level Too Low");
        // validate building info
        const{error} = validateGet(req.body);        
        if(error) return res.status(400).send(error.details[0].message);
        // building database        
        data = req.body;
        let result = await getLineListByAccountID(data);        
        return res.status(200).send(result);
        
    } catch (ex) {
        console.log("Update Building Error");
        return res.status(404).send(ex.message);   
    }
});



module.exports = router;