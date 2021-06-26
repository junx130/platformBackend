const express = require("express");
const router = express.Router();
const Joi = require("joi");
const auth = require("../../Middleware/auth");
const { getSensorList_ByVendorId, getSensorParaBy_TypeList } = require("../../MySQL/SensorManagement/sensorManagement");


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
        return res.status(404).send(ex.message);        
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
        console.log("Get SensorList Error");
        return res.status(404).send(ex.message);        
    }
});


module.exports = router;