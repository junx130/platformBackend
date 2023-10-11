const express = require("express");
const { v2GetBdDevData_lastN, v2GetBdDevData_durationB4Unix, v2GetBdDevData_T1_T2, v2GetBdDevData_lastN_b4Unix, v2GetBdDevData_lastN_afterUnix, v2GetBdDevData_durationBetweenUnix } = require("../../MySQL/V2_QueryData/v2_QueryBdDevData");
const router = express.Router();
const auth = require("../../Middleware/auth");
const { notArrOrEmptyArr } = require("../../utilities/validateFn");
const { getSensorListBy_typeList } = require("../../MySQL/SensorManagement/sensorManagement");
const moment = require("moment");
require('moment-timezone');
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

// router.post("/bddev/getdailykwh", auth, async (req, res) => {
//     try {
//         let { type, bdDev_id, paraKey, startTime, endTime, ttlDays, cutOffDate } = req.body;
//         let currDate;
//         let ttlDailykWh = [];
//         cutOffDate === null? currDate = moment().format("YYYY-MM-DD") : currDate = cutOffDate;
//         for(let i = 0; i < ttlDays; i++) {
//             let currQuery = await v2GetBdDevData_durationBetweenUnix(type, bdDev_id, moment(currDate + ' ' + startTime).unix(), moment(currDate + ' ' + endTime).unix());
//             if(currQuery.length) {
//                 let currkWh = currQuery[currQuery.length - 1][paraKey] - currQuery[0][paraKey];
//                 ttlDailykWh.unshift({x: i === 0 && cutOffDate === null? `Today (Until ${moment.unix(currQuery[currQuery.length - 1].unix).tz("Asia/Kuala_Lumpur").format("HH:mm")})` : moment(currDate).format("DD/M/YY"), y: currkWh});
//             }
//             currDate = moment(currDate).subtract(1, "days").format("YYYY-MM-DD");
//         };

//         return res.status(200).send(ttlDailykWh);       
//     } catch (error) {
//         console.log("/bddev/getdailykwh Error");
//         return res.status(203).send({errMsg:'Database Server Err'});    
//     }
// });

router.post("/bddev/getdatafordashitem", auth, async(req, res) => {
    try {
        let dashItemQueryList = req.body;
        for (const eachDash of dashItemQueryList) {
            if(eachDash.queryType === "lastN")
                eachDash.data = await v2GetBdDevData_lastN(eachDash.devType, eachDash.bdDev_id, eachDash.qty);
            else if(eachDash.queryType === "dailyAccum") {
                let currTimezone = moment.utc().add(eachDash.timezone, 'hours');
                let currDate = moment(currTimezone.format('YYYY-MM-DD') + ' 00:00:00').unix() + parseInt(eachDash.timeValue);
                eachDash.data = [];
                for(let i = 0; i < eachDash.qty; i++) {
                    let lastNAfterUnix = [];
                    if(currDate > moment().unix()) {
                        lastNAfterUnix = await v2GetBdDevData_lastN_b4Unix(eachDash.devType, eachDash.bdDev_id, moment().unix(), 1);
                    } else {
                        lastNAfterUnix = await v2GetBdDevData_lastN_afterUnix(eachDash.devType, eachDash.bdDev_id, currDate, 1);
                    }
                    eachDash.data.unshift(lastNAfterUnix[0]);
                    currDate = currDate - 86400;
                }
            }
        }

        return res.status(200).send(dashItemQueryList);
    } catch (error) {
        console.log("/bddev/getdatafordashitem Error");
        return res.status(203).send({errMsg:'Database Server Err'});   
    }
})

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