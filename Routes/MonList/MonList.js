const express = require("express");
const router = express.Router();
const Joi = require("joi");
const auth = require("../../Middleware/auth");
//const { getNotifyListById, updateNotificatonList, regNotificatonList, deleteNotifyItem } = require("../../MySQL/notification/notification");
const {getMonListByBuidlingID, getT1ListByMonitoList_id, getElementByMonitoT1_id, updateMonList, deleteMonList, regMonList} = require("../../MySQL/MonList/monList");


function validateAddMonList(data){
    const schema = {        
        _id:Joi.number(),
        name: Joi.string().max(80).allow(null, ''),
        buildingID: Joi.number(),
        SortIndex: Joi.number(),
    }
    return Joi.validate(data, schema);
}

router.post("/addmonlist", auth, async (req, res) => {
    try {
        console.log(req.body);
        const{error} = validateAddMonList(req.body);
        if(error) return res.status(400).send(error.details[0].message);
        // console.log("In Here");
        // Check the inserted id and type, the building id is tally with building id assigned in DevicesList.

        let data = req.body;   
        data.userAmmend = req.user.username;      
        // console.log(req.user.username);  
        let result  = await regMonList(data);    
        
        if(!result) return res.status(400).send("Insert Monitoring List Failed.");
        if(result.affectedRows<1) return res.status(400).send("Insert Monitoring List Failed.");
        //success
        res.status(200).send(`Insert Monitoring List successful.`);
    } catch (ex) {
        console.log("Insert Monitoring List Error");
        return res.status(404).send(ex.message);        
    }
});

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

function validateUpdate(data){
    const schema = {        
        _id:Joi.number().required(),
        name: Joi.string().max(80).allow(null, ''),
        buildingID: Joi.number(),
        SortIndex: Joi.number(),
    }
    return Joi.validate(data, schema);
}

router.post("/updatemonlist", auth, async (req, res) => {
    try {
        // console.log("in here d");
        // console.log(req.body);
        const{error} = validateUpdate(req.body);        
        if(error) return res.status(400).send(error.details[0].message);
        // building database        
        data = req.body;
        data.userAmmend = req.user.username;
        let result = await updateMonList(data);
        if(!result) return res.status(400).send("Update Failed");     // no raw affected, update failed
        if(result.affectedRows <1) return res.status(400).send("Update Failed");     // no raw affected, update failed
        // successful
        res.status(200).send(req.body);
    } catch (ex) {
        console.log("Update Monitoring List Error");
        return res.status(404).send(ex.message);   
    }
})


router.post("/delmonlist", auth, async (req, res) => {
    // console.log(req.body);
    const{error} = validateAddMonList(req.body);
    // stop seq if error
    if(error) return res.status(400).send(error.details[0].message);    
    // console.log(req.user);
    let rel = await deleteMonList(req.body);
    if(rel<1) {return res.status(404).send("Delete Failed")};     // no raw affected, update failed
        // reply fron end
        res.status(200).send("Delete Done");
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


router.post("/gett1bymonlist_id", auth, async (req, res) => {    
    try {
        // console.log(req.params.userid);
        // console.log(req.body);
        let result = await getT1ListByMonitoList_id(req.body.Monitoring_id);
        return res.status(200).send(result);        
    } catch (ex) {
        console.log("Get T1 List Error");
        return res.status(404).send(ex.message);        
    }
});



module.exports = router;