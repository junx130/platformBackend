const express = require("express");
const router = express.Router();
const Joi = require("joi");
const { regV2Sensor } = require("../../Features/addV2Sensor/addV2Sensor");
const auth = require("../../Middleware/auth");
const { getSensorList_ByVendorId, getSensorParaBy_TypeList, updateSensorList, updateSensorParameter, getSensorListBy_typeList } = require("../../MySQL/SensorManagement/sensorManagement");


router.post("/regnewsensor", auth, async (req, res) => {    
    try {
        // console.log(req.body);
        let body = req.body;
        body.userAmmend = req.user.username;
        // console.log(body.userAmmend);
        let rel = await regV2Sensor(body);
        if(!rel) return res.status(203).send("Add Sensor Err");
        return res.status(200).send("Done");        
    } catch (ex) {
        console.log("Reg Sensor Error");
        console.log(ex.message);
        return res.status(203).send(ex.message);        
    }
});

router.post("/getbyvid", auth, async (req, res) => {    
    try {
        // console.log(req.params.userid);
        // console.log("did COme in");
        // console.log(req.body);
        let vendor_id = req.body.vendor_id;
        let result = await getSensorList_ByVendorId(vendor_id);
        return res.status(200).send(result);        
    } catch (ex) {
        console.log("Get SensorList Error");
        return res.status(203).send(ex.message);        
    }
});

router.post("/getparabytylist", auth, async (req, res) => {    
    try {
        // console.log(req.params.userid);
        // console.log("did COme in");
        // console.log(req.body);
        let typeList = req.body.typeList;
        let result = await getSensorParaBy_TypeList(typeList);
        return res.status(200).send(result);        
    } catch (ex) {
        console.log("Get ParaList Error");
        return res.status(203).send(ex.message);        
    }
});


router.post("/updatesensor", auth, async (req, res) => {    
    try {
        // console.log(req.params.userid);
        // console.log("did COme in");
        // console.log(req.body);
        let sensor = req.body.sensor;
        let result = await updateSensorList(sensor);
        if(!result || result.affectedRows < 1) return res.status(203).send("Update Sensor Err");
        // console.log(result);
        return res.status(200).send("Update Success");        
    } catch (ex) {
        console.log("Update Sensor Error");
        return res.status(203).send(ex.message);        
    }
});

router.post("/updatesensorparameter", auth, async (req, res) => {    
    try {
        // console.log(req.params.userid);
        // console.log("did COme in");
        // console.log(req.body);
        let paraList = req.body.paraList;
        for (const para of paraList) {
            let result = await updateSensorParameter(para);
            
            if(!result || result.affectedRows < 1) return res.status(204).send("Update SensorPara Err");
        }
        return res.status(200).send("Update Success");        
    } catch (ex) {
        console.log("Update ParaList Error");
        return res.status(203).send(ex.message);        
    }
});

router.post("/getsensorlistbytylist", auth, async (req, res) => {    
    try {
        // console.log(req.params.userid);
        // console.log("did COme in");
        // console.log(req.body);
        let typeList = req.body.typeList;
        let result = await getSensorListBy_typeList(typeList);
        if(!result) return res.status(203).send({errMsg:"DB Error"});
        return res.status(200).send(result);        
    } catch (ex) {
        console.log("Get ParaList Error");
        return res.status(203).send(ex.message);        
    }
});



/** Version 2a */
router.post("/determinebattopbytylist", auth, async (req, res) => {    
    try {
        let {tyList} = req.body;
        //????
        let result = await getSensorListBy_typeList(typeList);
        return res.status(200).send(result);        
    } catch (ex) {
        console.log("Get ParaList Error");
        return res.status(203).send(ex.message);        
    }
});

module.exports = router;