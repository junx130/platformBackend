const express = require("express");
const router = express.Router();
const { getDevicesList, getDevicesFromList, registerNewDevice, updateDevicesList, deleteDevice } = require("../MySQL/aploudSetting/deviceList");
const Joi = require("joi");
const auth = require("../Middleware/auth");
const { getBuildingDevicesByTypeID, setIdleBuildingDevices } = require("../MySQL/buildings/buildingDevices");

// get device list
router.get("/all", auth, async (req, res) => {
    try {
        //validate user access level
        if(req.user.accessLevel > 10 ) return res.status(401).send("Access Level Too Low");
        // get building list from database
        let result = await getDevicesList();
        
        //  send building list
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
        data.userAmmend = req.user.username;
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
        userAmmend: Joi.string().max(80),
        // accessLevel: Joi.number(),
        // active: Joi.number(),
        // teleID: Joi.number(),
    }
    return Joi.validate(data, schema);
}

router.post("/update", auth, async (req, res) => {
    try {
        // console.log(req.body);
        //validate user access level
        if(req.user.accessLevel > 10 ) return res.status(401).send("Access Level Too Low");
        // validate info
        const{error} = validateUpdate(req.body);        
        if(error) return res.status(400).send(error.details[0].message);
        // update database
        let data= req.body;
        data.userAmmend = req.user.username;    // mark down user who change the database
        let result = await updateDevicesList(data);
        // no changes on database
        if(!result) return res.status(400).send("Update Failed");     // no raw affected, update failed
        if(result.affectedRows <1) return res.status(400).send("Update Failed");     // no raw affected, update failed
        // successful
        // after update building, check BuildingDevices, if BuildingID not identical, set the BuildingDevices to 0(idle);
        let buidingDevices = await getBuildingDevicesByTypeID(data);
        if(buidingDevices){     // not an empty array
            // console.log("buildingDevices",buidingDevices);    
            for (b of buidingDevices) {
                // console.log("b: ",b);
                if((b.buildingID != data.buildingID)){
                    console.log("ID changed");
                    // change the BuildingDevices devID here;
                    let setIdle = await setIdleBuildingDevices(b);
                    if(setIdle.affectedRows<1) return res.status(400).send("Set Idle Failed");
                    // console.log(setIdle);
                }
            }     
        }

        // console.log(buidingDevices);
        res.status(200).send(req.body);
    } catch (ex) {
        console.log("Update Building Error");
        return res.status(404).send(ex.message);   
    }
});

router.post("/del", auth, async (req, res) => {
    const{error} = validateUpdate(req.body);
    // stop seq if error
    if(error) return res.status(400).send(error.details[0].message);    
    console.log(req.user);
    if(req.user.active != 1) return res.status(401).send("Account not active");  
    // prevent admin accidently change own access level            
    if(req.user.username == req.body.username) return res.status(401).send("Not allowed to change self access level");  // prevent admin accidently change own access level
    
    if(req.user.accessLevel > 10) return res.status(401).send("Do Not Have Access Right");     // access level is too low
    
    if(req.user.accessLevel >= req.body.accessLevel) return res.status(401).send("Access Level Too Low");     // access level is too low
    
    let rel = await deleteDevice(req.body);
    if(rel<1) {return res.status(404).send("Delete Failed")};     // no raw affected, update failed
        // reply fron end
        res.status(200).send("Delete Done");
});

function validateUpdate(data){
    const schema = {        
        _id:Joi.number().required(),
        type: Joi.number().required().min(1),
        devID: Joi.number().required().min(1),
        battConst: Joi.number(),
        sleepAmp: Joi.number(),
        SimNumber: Joi.string().max(80),
        buildingID: Joi.number(),        
        userAmmend: Joi.string().max(80),
        // accessLevel: Joi.number(),
        // active: Joi.number(),
        // teleID: Joi.number(),
    }
    return Joi.validate(data, schema);
}

module.exports = router;