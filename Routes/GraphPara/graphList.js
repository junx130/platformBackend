const express = require("express");
const router = express.Router();
const auth = require("../../Middleware/auth"); 
const Joi = require("joi");
const { graphListInsert, graphListGetBy2Id } = require("../../MySQL/GraphPara/graphList");


function validateInsertNew(body){
    const schema = {        
        _id:Joi.number(),
        userID: Joi.number().required(),     
        bdDev_id: Joi.number(),     
        pageID: Joi.number().required(),
        orderIdx: Joi.number(),
        name: Joi.string().required(),
        graphType: Joi.number(),
        line1_id: Joi.number(),
        line2_id: Joi.number(),
        line3_id: Joi.number(),     
        userAmmend: Joi.string().max(80),
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
        // let buildings = await getBuildingsByBuildingName(req.body);
        // if(buildings) return res.status(400).send("Building Exist.");
        // insert building into database
        let body = req.body;
        body.userAmmend = req.user.username;
        let result  = await graphListInsert(body);
        // Check insert new building result
        // console.log("Result: ",result);
        if(!result) return res.status(400).send("Insert Graph List Failed.");
        if(result.affectedRows<1) return res.status(400).send("Insert Failed.");
        //success
        res.status(200).send(`${req.body.name} Graph insert successful`);
    } catch (ex) {
        console.log("Register Graph List Error");
        return res.status(404).send(ex.message);        
    }
});


function validateGetBy2id(body){
    const schema = {        
        _id:Joi.number(),
        userID: Joi.number().required(),     
        bdDev_id: Joi.number().required(),     
        pageID: Joi.number(),
        orderIdx: Joi.number(),
        name: Joi.string(),
        graphType: Joi.number(),
        line1_id: Joi.number(),
        line2_id: Joi.number(),
        line3_id: Joi.number(),     
        userAmmend: Joi.string().max(80),
    }
    return Joi.validate(body, schema);

}
router.post("/getby2id", auth, async (req, res) => {
    try {
        console.log(req.body);
        //validate user access level
        // if(req.user.accessLevel > 10 ) return res.status(401).send("Access Level Too Low");
        // validate building info
        const{error} = validateGetBy2id(req.body);        
        if(error) return res.status(400).send(error.details[0].message);
        // building database        
        data = req.body;
        // data.userAmmend = req.user.username;
        let result = await graphListGetBy2Id(data);        
        return res.status(200).send(result);
        
    } catch (ex) {
        console.log("Get  Building Error");
        return res.status(404).send(ex.message);   
    }
});


module.exports = router;