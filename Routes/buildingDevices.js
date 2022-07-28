const express = require("express");
const router = express.Router();
const { getDevicesList, getDevicesFromList, registerNewDevice } = require("../MySQL/aploudSetting/deviceList");
const Joi = require("joi");
const auth = require("../Middleware/auth");
const { getBuildingDevicesList, registerBuildingDevice, updateBuildingDevices, deleteBdDevice, getBuildingDevice_by_idList, getBuildingDevicesBy_ID} = require("../MySQL/buildings/buildingDevices");

// get buidling devices list
router.get("/get", auth, async (req, res) => {
    try {
        let result = await getBuildingDevicesList();
        return res.status(200).send(result);
    } catch (ex) {        
        console.log("Get Building Error");
        return res.status(404).send(ex.message);
    }
});


router.post("/getbylist", auth, async (req, res) => {
    // console.log("Come in getbylist");
    try {
        let result = await getBuildingDevice_by_idList(req.body);
        return res.status(200).send(result);
    } catch (ex) {        
        console.log("Get Building Error");
        return res.status(404).send(ex.message);
    }
});

router.get("/getbyid/:id", auth, async (req, res) => {
    try {
        let id = req.params.id;
        let result = await getBuildingDevicesBy_ID(id);
        
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
        // console.log(req.body);
        //validate user access level
        if(req.user.accessLevel > 10 ) return res.status(401).send("Access Level Too Low");
        // validate building info
        // console.log("req.body: ", req.body);
        const{error} = validateInsertNew(req.body);
        if(error) return res.status(400).send(error.details[0].message);
        // Check the inserted id and type, the building id is tally with building id assigned in DevicesList.

        if(req.body.devID!=0){
            let deviceList = await getDevicesFromList(req.body);
            if(!deviceList) return res.status(400).send("Device Not Created");
            if(deviceList[0].buildingID != req.body.buildingID) return res.status(400).send("Device Not For This Building");
        }

        //check buidlingID, both buildingID same only can 
        // console.log("devicelist: ", deviceList.buildingID);
        // console.log("body: ", req.body.buildingID);
        // insert building into database
        let data = req.body;   
        data.userAmmend = req.user.username;        
        let result  = await registerBuildingDevice(data);        
        // Check insert new building result
        // console.log("Result: ",result);
        if(!result) return res.status(400).send("Insert Device Failed.");
        if(result.affectedRows<1) return res.status(400).send("Insert Device Failed.");
        //success
        res.status(200).send(`Insert building device successful.`);
    } catch (ex) {
        console.log("Register New Device Error");
        return res.status(404).send(ex.message);        
    }
});

function validateInsertNew(data){
    const schema = {        
        _id:Joi.number(),
        type: Joi.number().required(),
        devID: Joi.number().required(),
        buildingID: Joi.number().required(),
        location: Joi.string().max(80).allow(null, ''),
        name: Joi.string().required().max(80),
        remarks: Joi.string().max(80).allow(null, ''),
        active: Joi.number(),
        userAmmend: Joi.string().max(80),
        // accessLevel: Joi.number(),
        // active: Joi.number(),
        // teleID: Joi.number(),
    }
    return Joi.validate(data, schema);
}


function validateUpdate(data){
    const schema = {        
        _id:Joi.number().required(),
        type: Joi.number(),
        devID: Joi.number(),
        buildingID: Joi.number(),
        location: Joi.string().max(80).allow(null, ''),
        name: Joi.string().max(80),
        remarks: Joi.string().max(80).allow(null, ''),
        active: Joi.number(),
        userAmmend: Joi.string().max(80),
        active: Joi.boolean(),
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
        const{error} = validateUpdate(req.body);        
        if(error) return res.status(400).send(error.details[0].message);
        // building database        
        data = req.body;
        data.userAmmend = req.user.username;
        let result = await updateBuildingDevices(data);
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
    // console.log(req.body);
    const{error} = validateUpdate(req.body);
    // stop seq if error
    if(error) return res.status(400).send(error.details[0].message);    
    // console.log(req.user);
    if(req.user.active != 1) return res.status(401).send("Account not active");  
    // prevent admin accidently change own access level            
    if(req.user.username == req.body.username) return res.status(401).send("Not allowed to change self access level");  // prevent admin accidently change own access level
    
    if(req.user.accessLevel > 10) return res.status(401).send("Do Not Have Access Right");     // access level is too low
    
    if(req.user.accessLevel >= req.body.accessLevel) return res.status(401).send("Access Level Too Low");     // access level is too low
    
    let rel = await deleteBdDevice(req.body);
    if(rel<1) {return res.status(404).send("Delete Failed")};     // no raw affected, update failed
        // reply fron end
        res.status(200).send("Delete Done");
});


module.exports = router;