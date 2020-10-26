const express = require("express");
const router = express.Router();
const { getDevicesList, getDevicesFromList, registerNewDevice } = require("../MySQL/aploudSetting/deviceList");
const Joi = require("joi");
const auth = require("../Middleware/auth");
const { getBuildingDevicesList } = require("../MySQL/buildings/buildingDevices");

// get buidling devices list
router.post("/get", auth, async (req, res) => {
    try {
        //validate user access level
        if(req.user.accessLevel > 10 ) return res.status(401).send("Access Level Too Low");
        // get building devices list from database
        let result = await getBuildingDevicesList();
        
        //  send building devices list
        return res.status(200).send(result);
        
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
        // console.log("req.body: ", req.body);
        const{error} = validateInsertNew(req.body);
        if(error) return res.status(400).send(error.details[0].message);
        // check database whether building + owner both duplicated
        let exist = await getDevicesFromList(req.body);
        if(exist) return res.status(400).send("Device Exist.");
        // insert building into database
        let data = req.body;
        if(!data.SimNumber) data.SimNumber = "";
        if(!data.buildingID) data.buildingID = 0;        

        let result  = await registerNewDevice(data);
        
        // Check insert new building result
        // console.log("Result: ",result);
        if(!result) return res.status(400).send("Insert Device Failed.");
        if(result.affectedRows<1) return res.status(400).send("Insert Device Failed.");
        //success
        res.status(200).send(`Device type: ${data.type}, ID: ${data.devID} insert successful`);
    } catch (ex) {
        console.log("Register New Device Error");
        return res.status(404).send(ex.message);        
    }
});

function validateInsertNew(data){
    const schema = {        
        _id:Joi.number(),
        type: Joi.number().required().min(1),
        devID: Joi.number().required().min(1),
        battConst: Joi.number(),
        sleepAmp: Joi.number(),
        SimNumber: Joi.string().max(80),
        buildingID: Joi.number(),
        accessLevel: Joi.number(),
        // accessLevel: Joi.number(),
        // active: Joi.number(),
        // teleID: Joi.number(),
    }
    return Joi.validate(data, schema);
}

router.post("/update", auth, async (req, res) => {
    try {
        //validate user access level
        if(req.user.accessLevel > 10 ) return res.status(401).send("Access Level Too Low");
        // validate building info
        const{error} = validateInsertNew(req.body);        
        if(error) return res.status(400).send(error.details[0].message);
        // building database
        let result = await updateBuilding(req.body);
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