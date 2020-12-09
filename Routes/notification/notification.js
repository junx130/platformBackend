const express = require("express");
const router = express.Router();
const Joi = require("joi");
const auth = require("../../Middleware/auth");
const { getNotifyListById, updateNotificatonList, regNotificatonList, deleteNotifyItem } = require("../../MySQL/notification/notification");


// function validate(data){
//     const schema = {        
//         _id:Joi.number(),
//         name: Joi.string().max(80).allow(null, ''),
//         userID: Joi.number(),
//         bd_id: Joi.number(),
//         telegramID:  Joi.string().max(80).allow(null, ''),
//         userAmmend: Joi.string().max(80),
//     }
//     return Joi.validate(data, schema);
// }

function validateReg(data){
    const schema = {        
        _id:Joi.number(),
        name: Joi.string().max(80).allow(null, ''),
        userID: Joi.number(),
        type: Joi.number(),
        bdDev_id: Joi.number(),
        DataKey: Joi.string().max(80),
        DataUnit: Joi.string().max(80),
        UserSetpoint: Joi.number(),
        AlarmSetpoint: Joi.number(),
        AlarmType: Joi.string().max(80),
        StartUnix: Joi.number(),
        EndUnix: Joi.number(),
        AlarmRepeat: Joi.number(),
        Sensitivity: Joi.number(),
        Active: Joi.number(),
    }
    return Joi.validate(data, schema);
}

router.post("/register", auth, async (req, res) => {
    try {
        const{error} = validateReg(req.body);
        if(error) return res.status(400).send(error.details[0].message);
        // Check the inserted id and type, the building id is tally with building id assigned in DevicesList.

        let data = req.body;   
        data.userAmmend = req.user.username;        
        let result  = await regNotificatonList(data);        
        // Check insert new building result
        // console.log("Result: ",result);
        if(!result) return res.status(400).send("Insert Telegram ID Failed.");
        if(result.affectedRows<1) return res.status(400).send("Insert Device Failed.");
        //success
        res.status(200).send(`Insert building device successful.`);
    } catch (ex) {
        console.log("Register New Telegram ID Error");
        return res.status(404).send(ex.message);        
    }
});


router.post("/del", auth, async (req, res) => {
    // console.log(req.body);
    const{error} = validateUpdate(req.body);
    // stop seq if error
    if(error) return res.status(400).send(error.details[0].message);    
    // console.log(req.user);
    let rel = await deleteNotifyItem(req.body);
    if(rel<1) {return res.status(404).send("Delete Failed")};     // no raw affected, update failed
        // reply fron end
        res.status(200).send("Delete Done");
});


router.post("/get", auth, async (req, res) => {    
    try {
        // console.log(req.params.userid);
        console.log(req.body);
        let result = await getNotifyListById(req.body.a_BdDevID);
        return res.status(200).send(result);        
    } catch (ex) {
        console.log("Get User's Building Error");
        return res.status(404).send(ex.message);        
    }
});


function validateUpdate(data){
    const schema = {        
        _id:Joi.number().required(),
        name: Joi.string().max(80).allow(null, ''),
        userID: Joi.number(),
        type: Joi.number(),
        bdDev_id: Joi.number(),
        DataKey: Joi.string().max(80),
        DataUnit: Joi.string().max(80),
        UserSetpoint: Joi.number(),
        AlarmSetpoint: Joi.number(),
        AlarmType: Joi.string().max(80),
        StartUnix: Joi.number(),
        EndUnix: Joi.number(),
        AlarmRepeat: Joi.number(),
        Sensitivity: Joi.number(),
        Active: Joi.number(),
    }
    return Joi.validate(data, schema);
}

router.post("/update", auth, async (req, res) => {
    try {
        // console.log("in here d");
        // console.log(req.body);
        const{error} = validateUpdate(req.body);        
        if(error) return res.status(400).send(error.details[0].message);
        // building database        
        data = req.body;
        data.userAmmend = req.user.username;
        let result = await updateNotificatonList(data);
        if(!result) return res.status(400).send("Update Failed");     // no raw affected, update failed
        if(result.affectedRows <1) return res.status(400).send("Update Failed");     // no raw affected, update failed
        // successful
        res.status(200).send(req.body);
    } catch (ex) {
        console.log("Update Building Error");
        return res.status(404).send(ex.message);   
    }
})

module.exports = router;