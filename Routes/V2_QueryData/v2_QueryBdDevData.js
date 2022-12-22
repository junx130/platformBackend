const express = require("express");
const { v2GetBdDevData_lastN, v2GetBdDevData_durationB4Unix, v2GetBdDevData_T1_T2 } = require("../../MySQL/V2_QueryData/v2_QueryBdDevData");
const router = express.Router();
const auth = require("../../Middleware/auth");
const { notArrOrEmptyArr } = require("../../utilities/validateFn");
const { getSensorListBy_typeList } = require("../../MySQL/SensorManagement/sensorManagement");
// const Joi = require("joi");



router.post("/bddev/getlastndata", auth, async (req, res) => {    
    try {
        let {type, _id, nCnt} = req.body;
        let rel = await v2GetBdDevData_lastN(type, _id, nCnt);
        if(!rel) return res.status(204).send({errMsg:'Database Query Err'}); 
        return res.status(200).send(rel);        
    } catch (ex) {
        console.log("/bddev/getlastndata Error");
        return res.status(204).send({errMsg:'Database Server Err'});    
    }
});

router.post("/bddev/getnMinb4nUnix", auth, async (req, res) => {    
    try {
        // console.log(req.body);
        let {type, _id, endUnix, nMin} = req.body;
        let rel = await v2GetBdDevData_durationB4Unix(type, _id, endUnix, nMin);
        // console.log("endUnix", endUnix);
        if(!rel) return res.status(204).send({errMsg:'Database Query Err'}); 
        return res.status(200).send(rel);        
    } catch (ex) {
        console.log("/bddev/getnMinb4nUnix Error");
        return res.status(204).send({errMsg:'Database Server Err'});    
    }
});

router.post("/bddev/gett1t2data", auth, async (req, res) => {
    try {
        let {type, _id, t1, t2} = req.body;
        let rel = await v2GetBdDevData_T1_T2(type, _id, t1, t2);
        if(!rel) return res.status(204).send({errMsg:'Database Query Err'}); 
        return res.status(200).send(rel); 
    } catch {
        console.log("/bddev/gett1t2data Error");
        return res.status(204).send({errMsg:'Database Server Err'});    
    }
})


router.post("/bddev/getlastndata_bylist", auth, async (req, res) => {    
    try {
        let {devList} = req.body;
        if(notArrOrEmptyArr(devList)) return res.status(203).send({errMsg:'Devices list input error'}); 
        let tyList = [];
        for (const eachDev of devList) {
            let found = tyList.find(c=>c === eachDev.type);
            if(!found) tyList.push(eachDev.type);
        }

        let sensorInfoList = await getSensorListBy_typeList(tyList);
        if(!sensorInfoList) return res.status(203).send({errMsg:"Get sensor list info error"});         

        let groupLastData =[];
        // [{type, bdDev_id, SNR, RSSI, unix}]
        for (const eachDev of devList) {
            let battVolt = null;
            let rel = await v2GetBdDevData_lastN(eachDev.type, eachDev.bdDev_id, 1);
            if(!rel){
                groupLastData.push({type:eachDev.type, bdDev_id:eachDev.bdDev_id, SNR:null, RSSI:null, unix:null, battVolt})
                continue;
            }            
            let {SNR, RSSI, unix} = rel[0];
            /** determine batt of sensor */
            let curSensorInfo = sensorInfoList.find(c=> c.type === eachDev.type);
            if(curSensorInfo) battVolt = getBatteryValue(curSensorInfo, rel[0]);

            groupLastData.push({type:eachDev.type, bdDev_id: eachDev.bdDev_id, SNR, RSSI, unix, battVolt})
        }
        return res.status(200).send(groupLastData);       
        // return res.status(200).send(rel);        
    } catch (ex) {
        console.log("/bddev/getlastndata Error");
        return res.status(203).send({errMsg:'Database Server Err'});    
    }
});

function getBatteryValue(sensorInfo, devLastData){
    if(sensorInfo.sensorVersion == 1){   
        if(sensorInfo.type === 1 || sensorInfo.type === 2){
            lastBattLvl = devLastData.battVoltage;
            return lastBattLvl;
        }
    }else if(sensorInfo.sensorVersion == 2){
        if(sensorInfo.battKey.trim() !== ""){
            lastBattLvl = devLastData[sensorInfo.battKey.trim()];
            return lastBattLvl;
        }
    }
}


module.exports = router;