const express = require("express");
const router = express.Router();
const { getBuildings, getActiveBuildings, getBuildingsByBuildingName, insertNewBuilding, updateBuilding, deleteBuilding,getBuildingsByID } = require("../MySQL/aploudSetting/building");
const Joi = require("joi");
const auth = require("../Middleware/auth");



router.get("/getbyid/:id", auth, async (req, res) => {
    // console.log(req.params.id);
    // console.log("Enter1107");
    let building = await getBuildingsByID(req.params.id);
    return res.status(200).send(building);
})
// get buidling list
router.get("/get", auth, async (req, res) => {
    try {

        //validate user access level
        // if(req.user.accessLevel > 10 ) return res.status(401).send("Access Level Too Low");
        // get building list from database
        let buildingList = await getBuildings(req.user.accessLevel);
        //  send building list
        return res.status(200).send(buildingList);
        
    } catch (ex) {        
        console.log("Get Building Error");
        return res.status(404).send(ex.message);
    }
});

// get active building list
router.get("/getactive", auth, async (req, res) => {
    try {

        //validate user access level
        // if(req.user.accessLevel > 10 ) return res.status(401).send("Access Level Too Low");
        // get building list from database
        let buildingList = await getActiveBuildings(req.user.accessLevel);
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
        owner: Joi.string().min(2).max(80).required(),        
        building: Joi.string().min(2).max(80).required(),
        country: Joi.string().min(2).max(80).required(),
        state: Joi.string().min(2).max(80).required(),
        area: Joi.string().min(2).max(80).required(),
        postcode: Joi.number().required(),
        userAmmend: Joi.string().min(3).max(80),
        accessLevel: Joi.number(),
        active: Joi.boolean(),
        // accessLevel: Joi.number(),
        // active: Joi.number(),
        // teleID: Joi.number(),
    }
    return Joi.validate(building, schema);
}

function validateUpdate(building){
    const schema = {        
        _id:Joi.number().required(),
        owner: Joi.string().min(2).max(80),        
        building: Joi.string().min(2).max(80),
        country: Joi.string().min(2).max(80),
        state: Joi.string().min(2).max(80),
        area: Joi.string().min(2).max(80),
        postcode: Joi.number(),
        userAmmend: Joi.string().min(3).max(80),
        accessLevel: Joi.number(),
        active: Joi.boolean(),
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
        const{error} = validateUpdate(req.body);        
        if(error) {
            console.log(error.details[0].message);
            return res.status(400).send(error.details[0].message);
        }
        // building database
        let data = req.body;
        data.userAmmend = req.user.username;
        console.log(data);
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

router.post("/del", auth, async (req, res) => {
    try {
        // console.log("ComeIn")
        const{error} = validateUpdate(req.body);
        // stop seq if error
        if(error) return res.status(400).send(error.details[0].message);    
        if(req.user.active != 1) return res.status(401).send("Account not active");  
        // prevent admin accidently change own access level            
        if(req.user.username == req.body.username) return res.status(401).send("Not allowed to change self access level");  // prevent admin accidently change own access level
        
        if(req.user.accessLevel > 10) return res.status(401).send("Do Not Have Access Right");     // access level is too low
        
        if(req.user.accessLevel >= req.body.accessLevel) return res.status(401).send("Access Level Too Low");     // access level is too low
        
        let rel = await deleteBuilding(req.body);
        // console.log(`rel : ${rel}`);
        if(rel<1) {return res.status(404).send("Delete Failed")};     // no raw affected, update failed
        // reply fron end
        res.status(200).send("Delete Done");

    } catch (ex) {        
        console.log("User Update Error");
        return res.status(404).send(ex.message);
    }
});

module.exports = router;