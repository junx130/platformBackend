const express = require("express");
const router = express.Router();
const { getBuildings, getBuildingsByBuildingName, insertNewBuilding, updateBuilding } = require("../MySQL/aploudSetting/building");
const Joi = require("joi");
const auth = require("../Middleware/auth");

// get buidling list
router.post("/get", auth, async (req, res) => {
    try {
        //validate user access level
        if(req.user.accessLevel > 10 ) return res.status(401).send("Access Level Too Low");
        // get building list from database
        let buildingList = await getBuildings(req.user.accessLevel);
        //  send building list
        return res.status(200).send(buildingList);
        
    } catch (ex) {        
        console.log("Get Building Error");
        return res.status(404).send(ex.message);
    }
});

//register new building
router.post("/register", auth, async (req, res) => {
    try {
        //validate user access level
        if(req.user.accessLevel > 10 ) return res.status(401).send("Access Level Too Low");
        // validate building info
        const{error} = validateInsertNew(req.body);        
        if(error) return res.status(400).send(error.details[0].message);
        // check database whether building + owner both duplicated
        let buildings = await getBuildingsByBuildingName(req.body);
        if(buildings) return res.status(400).send("Building Exist.");
        // insert building into database
        let buidling = req.body;
        buidling.userAmmend = req.user.username;
        let result  = await insertNewBuilding(buidling);
        // Check insert new building result
        // console.log("Result: ",result);
        if(!result) return res.status(400).send("Insert Building Failed.");
        if(result.affectedRows<1) return res.status(400).send("Insert Building Failed.");
        //success
        res.status(200).send(`${req.body.building} insert successful`);
    } catch (ex) {
        console.log("Register New Building Error");
        return res.status(404).send(ex.message);        
    }
});

function validateInsertNew(building){
    const schema = {        
        _id:Joi.number(),
        owner: Joi.string().min(3).max(80).required(),        
        building: Joi.string().min(3).max(80).required(),
        country: Joi.string().min(3).max(80).required(),
        state: Joi.string().min(3).max(80).required(),
        area: Joi.string().min(3).max(80).required(),
        postcode: Joi.number().required(),
        userAmmend: Joi.string().min(3).max(80),
        accessLevel: Joi.number(),
        // accessLevel: Joi.number(),
        // active: Joi.number(),
        // teleID: Joi.number(),
    }
    return Joi.validate(building, schema);
}

router.post("/update", auth, async (req, res) => {
    try {
        //validate user access level
        if(req.user.accessLevel > 10 ) return res.status(401).send("Access Level Too Low");
        // validate building info
        const{error} = validateInsertNew(req.body);        
        if(error) return res.status(400).send(error.details[0].message);
        // building database
        let data = req.body;
        data.userAmmend = req.user.username;
        let result = await updateBuilding(data);
        // no changes on database
        if(!result) return res.status(400).send("Update Failed");     // no raw affected, update failed
        if(result.affectedRows <1) return res.status(400).send("Update Failed");     // no raw affected, update failed
        // successful
        res.status(200).send(req.body);
    } catch (ex) {
        console.log("Update Building Error");
        return res.status(404).send(ex.message);   
    }
});

module.exports = router;