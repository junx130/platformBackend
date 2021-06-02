const express = require("express");
const router = express.Router();
const Joi = require("joi");
const auth = require("../../Middleware/auth");
const { getDevActByBd_id, updateDevActList, getDevActByBdDev_id, insertActiveDevChecklist } = require("../../MySQL/notification/devActive");

router.post("/getacklistbybdid", auth, async (req, res) => {    
    try {
        // console.log(req.params.userid);
        // console.log(req.body);
        
        let result = await getDevActByBd_id(req.body.buildingID);
        // console.log(result);
        return res.status(200).send(result);        
    } catch (ex) {
        console.log("Get List Error");
        return res.status(404).send(ex.message);        
    }
});

router.post("/updatelist", auth, async (req, res) => {    
    try {
        // console.log(req.params.userid);
        // console.log(req.user.username);
        let aList = req.body.List;
        let dbError = false;
        for (const item of aList) {
            /** Check item exist */
            let exist = await getDevActByBdDev_id(item.bdDevID);
            if(!exist || !exist[0]) {   // not exist   , insert
                // console.log("Not Exist");
                let itemFmt = {...item};
                itemFmt.buildingID = item.building;
                itemFmt.triggerType =1;     // type 1 is rising trigger
                itemFmt.userAmmend = req.user.username;
                let updateRel = await insertActiveDevChecklist(itemFmt);
                if (updateRel.affectedRows !== 1) dbError = true;
                // console.log(updateRel);
            }else{  // exist, update
                let result = await updateDevActList(item);
                if (result.affectedRows !== 1) dbError = true;
                // console.log(result);
            }
        }

        dbError ? console.log("Update Device Active Checklist Failed"):console.log("Update Device Active Checklist All Pass");

        return res.status(200).send();        
    } catch (ex) {
        console.log("Update Active Checklist Error");
        console.log(ex.message);
        return res.status(404).send(ex.message);        
    }
});



module.exports = router;