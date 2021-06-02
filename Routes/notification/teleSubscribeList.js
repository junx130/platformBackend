const express = require("express");
const router = express.Router();
const Joi = require("joi");
const auth = require("../../Middleware/auth");
//const { getAllTelegramID, updateTelegramID, delTelegramID, addTelegramID } = require("../../MySQL/notification/telegramID");
const { insertTeleSubList, delTeleSubList, getTeleSubList, updateTeleSubList } = require("../../MySQL/notification/teleSubscribeList");


router.post("/register", auth, async (req, res) => {
    try {
        let data = req.body;   
        data.userAmmend = req.user.username;        
        let result  = await insertTeleSubList(data);        
        // Check insert new building result
        // console.log("Result: ",result);
        if(!result) return res.status(400).send("insertTeleSubList Failed.");
        if(result.affectedRows<1) return res.status(400).send("insertTeleSubList Failed.");
        //success
        res.status(200).send(`insertTeleSubList successful.`);
    } catch (ex) {
        console.log("insertTeleSubList Error");
        return res.status(404).send(ex.message);        
    }
});

router.post("/del", auth, async (req, res) => {
    let data = req.body;
    data.userAmmend = req.user.username;        
    let rel = await delTeleSubList(req.body);

    if(rel<1) {return res.status(404).send("Delete Failed")};     // no raw affected, update failed
        // reply fron end
        res.status(200).send("Delete Done");
});


router.post("/getbybd_id", auth, async (req, res) => {    
    try {
        console.log(req.body);
        let bd_id = req.body.bd_id;
        let result = await getTeleSubList(bd_id);
        // console.log(result);
        return res.status(200).send(result);        
    } catch (ex) {
        console.log("Get TeleList Error");
        return res.status(404).send(ex.message);        
    }
});

router.post("/update", auth, async (req, res) => {
    try {
        data = req.body;
        data.userAmmend = req.user.username;
        let result = await updateTeleSubList(data);
        if(!result) return res.status(400).send("Update Tele SubList Failed");     // no raw affected, update failed
        if(result.affectedRows <1) return res.status(400).send("Update Tele SubList Failed");     // no raw affected, update failed
        // successful
        res.status(200).send(req.body);
    } catch (ex) {
        console.log("Update Tele List Error");
        return res.status(404).send(ex.message);   
    }
})

module.exports = router;