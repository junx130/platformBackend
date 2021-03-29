const express = require("express");
const router = express.Router();
const Joi = require("joi");
const auth = require("../../Middleware/auth");
//const { getNotifyListById, updateNotificatonList, regNotificatonList, deleteNotifyItem } = require("../../MySQL/notification/notification");
const {getMonListByBuidlingID, getMonListByMonID, getT1ListByMonitoList_id, getElementByMonitoT1_id} = require("../../MySQL/MonList/monList");


router.post("/getbybdID", auth, async (req, res) => {    
    try {
        // console.log(req.params.userid);
        console.log(req.body);
        let result = await getMonListByBuidlingID(req.body.buildingID);
        return res.status(200).send(result);        
    } catch (ex) {
        console.log("Get List Error");
        return res.status(404).send(ex.message);        
    }
});

router.post("/getbymonID", auth, async (req, res) => {
     try {
        // console.log(req.params.userid);
        console.log(req.body);
        let result = await getMonListByMonID(req.body.monID);
        return res.status(200).send(result);        
    } catch (ex) {
        console.log("Get List Error");
        return res.status(404).send(ex.message);        
    }
})

router.post("/gett1bymonlist_id", auth, async (req, res) => {    
    try {
        // console.log(req.params.userid);
        console.log(req.body);
        let result = await getT1ListByMonitoList_id(req.body.Monitoring_id);
        return res.status(200).send(result);        
    } catch (ex) {
        console.log("Get T1 List Error");
        return res.status(404).send(ex.message);        
    }
});

router.post("/getelementbyt1_id", auth, async (req, res) => {    
    try {
        // console.log(req.params.userid);
        console.log(req.body);
        let result = await getElementByMonitoT1_id(req.body.T1_id);
        return res.status(200).send(result);        
    } catch (ex) {
        console.log("Get T1 List Error");
        return res.status(404).send(ex.message);        
    }
});

module.exports = router;