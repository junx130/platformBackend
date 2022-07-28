const express = require("express");
const router = express.Router();
const auth = require("../../Middleware/auth"); 
const Joi = require("joi");
const { PDC_insertGroupList, PDC_getGroupList, PDC_updateGroupSortIdx, PDC_deleteGroupList, PDC_insertDevList, PDC_getBdDevListbyGroup_id, PDC_updateBdDevSortIdx, PDC_deleteBdDevByGroupId, PDC_deleteBdDevByBdDevId, PDC_insertSetting, PDC_getSetting, PDC_getSettingByBdDevID, PDC_setSetting } = require("../../MySQL/PDC/PDC_Overview");

router.post("/getgroup", auth, async (req, res) => {    
    try {
        let rel = await PDC_getGroupList();
        if(!rel) return res.status(204).send({errMsg:'Database Query Err'}); 
        return res.status(200).send(rel);        
    } catch (ex) {
        console.log("/getgroup Error");
        return res.status(204).send({errMsg:'Database Server Err'});    
    }
});

router.post("/insertgroup", auth, async (req, res) => {    
    try {
        let info = req.body;
        let rel = await PDC_insertGroupList(info);
        if(!rel) return res.status(204).send({errMsg:'Database Query Err'}); 
        return res.status(200).send(rel);        
    } catch (ex) {
        console.log("/insertgroup Error");
        return res.status(204).send({errMsg:'Database Server Err'});    
    }
});

router.post("/groupupdatesort", auth, async (req, res) => {    
    try {
        let info = req.body;
        let rel = await PDC_updateGroupSortIdx(info);
        if(!rel) return res.status(204).send({errMsg:'Database Query Err'}); 
        return res.status(200).send(rel);        
    } catch (ex) {
        console.log("/groupupdatesort Error");
        return res.status(204).send({errMsg:'Database Server Err'});    
    }
});

router.post("/deletegroup", auth, async (req, res) => {    
    try {
        let info = req.body;
        console.log(info);
        let rel = await PDC_deleteGroupList(info.group_id);
        if(!rel) return res.status(204).send({errMsg:'Database Query Err'});
        let result = await PDC_deleteBdDevByGroupId(info.group_id);
        if(!result) return res.status(204).send({errMsg:'Database Query Err'});
        return res.status(200).send(rel);        
    } catch (ex) {
        console.log("/pdc/deletegroup Error");
        return res.status(204).send({errMsg:'Database Server Err'});    
    }
});

router.post("/getbddevbygid", auth, async (req, res) => {    
    try {
        let { group_id } = req.body;
        let rel = await PDC_getBdDevListbyGroup_id(group_id);
        if(!rel) return res.status(204).send({errMsg:'Database Query Err'}); 
        return res.status(200).send(rel);        
    } catch (ex) {
        console.log("/pdc/getbddev Error");
        return res.status(204).send({errMsg:'Database Server Err'});    
    }
});

router.post("/insertbddev", auth, async (req, res) => {    
    try {
        let info = req.body;
        let rel = await PDC_insertDevList(info);
        if(!rel) return res.status(204).send({errMsg:'Database Query Err'}); 
        return res.status(200).send(rel);        
    } catch (ex) {
        console.log("/pdc/insertgroup Error");
        return res.status(204).send({errMsg:'Database Server Err'});    
    }
});

router.post("/updatebddevsort", auth, async (req, res) => {    
    try {
        let info = req.body;
        let rel = await PDC_updateBdDevSortIdx(info);
        if(!rel) return res.status(204).send({errMsg:'Database Query Err'}); 
        return res.status(200).send(rel);        
    } catch (ex) {
        console.log("/pdc/updatebddevsort Error");
        return res.status(204).send({errMsg:'Database Server Err'});    
    }
});

router.post("/deletebddev", auth, async (req, res) => {    
    try {
        let info = req.body;
        let rel = await PDC_deleteBdDevByBdDevId(info.bdDev_id);
        if(!rel) return res.status(204).send({errMsg:'Database Query Err'}); 
        return res.status(200).send(rel);        
    } catch (ex) {
        console.log("/pdc/deletebddev Error");
        return res.status(204).send({errMsg:'Database Server Err'});    
    }
});

// router.post("/insertsetting", auth, async (req, res) => {    
//     try {
//         let info = req.body;
//         let rel = await PDC_insertSetting(info);
//         if(!rel) return res.status(204).send({errMsg:'Database Query Err'}); 
//         return res.status(200).send(rel);        
//     } catch (ex) {
//         console.log("/pdc/insertsetting Error");
//         return res.status(204).send({errMsg:'Database Server Err'});    
//     }
// });

router.post("/getsetting", auth, async (req, res) => {    
    try {
        let rel = await PDC_getSetting();
        if(!rel) return res.status(204).send({errMsg:'Database Query Err'}); 
        return res.status(200).send(rel);        
    } catch (ex) {
        console.log("/pdc/getsetting Error");
        return res.status(204).send({errMsg:'Database Server Err'});    
    }
});

router.post("/setsetting", auth, async (req, res) => {    
    try {
        let info = req.body;
        let temp = await PDC_getSettingByBdDevID(info.bdDev_id);
        console.log(temp);
        let rel;
        if(temp.length) rel = await PDC_setSetting(info);
        else rel = await PDC_insertSetting(info);
        if(!rel) return res.status(204).send({errMsg:'Database Query Err'}); 
        return res.status(200).send(rel);        
    } catch (ex) {
        console.log("/pdc/setsetting Error");
        return res.status(204).send({errMsg:'Database Server Err'});    
    }
});

module.exports = router;