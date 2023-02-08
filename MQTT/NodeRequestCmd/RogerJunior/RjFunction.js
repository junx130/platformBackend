const { getRjOnineVar_BybdDev_id, getRjRules_bdDevId_sceneIdx_inUse, getRjCondis_bdDevId_sceneIdx_inUse } = require("../../../MySQL/V2_Application/RogerJunior/V2_App_RJ");
const { getSensorOwnerBy_TydevID_inUse, getBddevBy_idList } = require("../../../MySQL/V2_DeviceRecord/v2_SensorOwner");
const { v2GetBdDevData_lastNMin } = require("../../../MySQL/V2_QueryData/v2_QueryBdDevData");
const { getLoraValueKey, genLoRaPackage } = require("../../../utilities/loraFormat");
const { notArrOrEmptyArr } = require("../../../utilities/validateFn");

const C_TotalOnlineVar = 6; // 1 iControl + 5 adv control
const blog = true;
async function replyOnlineVarReq(deviceInfo){
    try {
        if(blog) console.log("deviceInfo", deviceInfo);
        /** get gateway id */
        let gwId = parseInt(deviceInfo.GwID);
        /** publish fn 3 to node */
        let devDetails={
            devType:deviceInfo.ht,
            id:deviceInfo.hi,
            dir:3,
            fun:deviceInfo.hf
        }
        /** get variable pair to this Rj device */       
        /** get RJ bdDev info */
        let RjBdDevInfo = await getSensorOwnerBy_TydevID_inUse({type:deviceInfo.ht, devID:deviceInfo.hi});
        if(notArrOrEmptyArr(RjBdDevInfo)) {
            if(blog) console.log("Get RJ bdDev Info error");
            return 
        }
        /** Get RJ online var list */
        let onlinVarList = await getRjOnineVar_BybdDev_id(RjBdDevInfo[0]._id);  // this is sorted 
        if(notArrOrEmptyArr(onlinVarList)){
            if(blog) console.log("Empty Online Var List");
            return
        }
        
        let onlineVar=[];
        for (let i = 0; i < C_TotalOnlineVar; i++) {    // 1~6
            let curIdxVar = onlinVarList.filter(c=> c.varIdx === i);
            if(blog) console.log("curIdxVar", curIdxVar);
            if(notArrOrEmptyArr(curIdxVar)){
                if(blog) console.log(`Var idx[${i}] is not configured`);              
                onlineVar.push({inUse: false, value:0});          
                continue;
            }
            /** get pair value sensor type */
            let sensorInfo = await getBddevBy_idList([curIdxVar[0].Var_bdDevId]);
            if(notArrOrEmptyArr(sensorInfo)){
                if(blog) console.log(`Pair sensor is not found`);
                continue;
            }
            /** get last 10 mins data of var */
            let last10minData = await v2GetBdDevData_lastNMin(sensorInfo[0].type, curIdxVar[0].Var_bdDevId, 10);
            if(blog) console.log("last10minData", last10minData);
            if(notArrOrEmptyArr(curIdxVar)){
                if(blog) console.log(`Var idx[${i}] data is empty`);            
                onlineVar.push({inUse: false, value:0});      
                continue;
            }
            /** store the data*/
            let valueKey = getLoraValueKey(curIdxVar[0].dataType, curIdxVar[0].dataIndex);
            let lastValue = last10minData[0][`${valueKey}`];
            if(typeof lastValue==='undefined'){
                if(blog) console.log(`Var idx[${i}] data is undefined`);            
                onlineVar.push({inUse: false, value:0});      
                continue;
            }
            onlineVar.push({inUse: true, value:lastValue});
        }
        if(blog) console.log("onlineVar", onlineVar);
    
        /** prepare LoRa format */
        let pb = [];
        let pf = [];
        for (const eachVar of onlineVar) {
            pb.push(eachVar.inUse);
            pf.push(eachVar.value);
        }
        let payload ={pb, pf};    
        let loraPackage = genLoRaPackage(devDetails, payload, 2);
        if(!loraPackage.error){
            loraPackage.gwid = gwId;
            let _topic=`Gw/ServerCmd/${gwId}`;
            return {
                toPublish:true,
                topic:_topic,
                loraPackage
            }
            // prgMqtt.client.publish(`${_topic}`, loraPackage);
        }
    } catch (error) {
        console.log("replyOnlineVarReq error", error.message);
    }
}

async function replySceneParaReq(deviceInfo){
    try {
        console.log("replySceneParaReq");
        if(blog) console.log("deviceInfo", deviceInfo);
        /** get gateway id */
        let gwId = parseInt(deviceInfo.GwID);
        /** publish fn 3 to node */
        let devDetails={
            devType:deviceInfo.ht,
            id:deviceInfo.hi,
            dir:3,
            fun:deviceInfo.hf
        }
    
        /** get scene idx */
        if(!deviceInfo.pi) return console.log("Err: Pi not configured");
        if(notArrOrEmptyArr(deviceInfo.pi)) return console.log("Err: Pi is empty array");
        let sceneIdx = deviceInfo.pi[0];
        console.log("sceneIdx", sceneIdx);
        if(sceneIdx>5 || sceneIdx<0) return console.log("Err: Scene Idx over range");
    
        /** get RJ bdDev info */
        let RjBdDevInfo = await getSensorOwnerBy_TydevID_inUse({type:deviceInfo.ht, devID:deviceInfo.hi});
        if(notArrOrEmptyArr(RjBdDevInfo)) {
            if(blog) console.log("Get RJ bdDev Info error");
            return 
        }
        /** load rules*/
        let SceRules = await getRjRules_bdDevId_sceneIdx_inUse(RjBdDevInfo[0]._id, sceneIdx);
        console.log("SceRules", SceRules);
        let a_rule_AcReq=[];
        let a_Setpoint=[];
        for (let i = 0; i < 5; i++) {
            let foundRule = SceRules.filter(c=> c.ruleIdx === i+1);
            let rule_AcReq=0;
            let Setpoint = 0;
            if(!notArrOrEmptyArr(foundRule)){
                // console.log("foundRule[0].ruleIdx", foundRule[0].ruleIdx);
                // console.log("foundRule[0].AcReq", foundRule[0].AcReq);
                rule_AcReq = (foundRule[0].ruleIdx << 8) | foundRule[0].AcReq;
                // console.log("rule_AcReq", rule_AcReq);
                Setpoint = foundRule[0].Setpoint;
            }
            a_rule_AcReq.push(rule_AcReq);
            a_Setpoint.push(Setpoint)
        }
    
        /** load condis */
        let SceCondis = await getRjCondis_bdDevId_sceneIdx_inUse(RjBdDevInfo[0]._id, sceneIdx);
        if(blog) console.log("SceCondis", SceCondis);
        let a_rule_var_ope=[];
        let a_TargetValue=[];
        for (let i = 0; i < 5; i++) {
            let foundCondis = SceCondis.filter(c=> c.ruleIdx === i+1);
            if(blog) console.log("foundCondi", foundCondis);        
            for (let j = 0; j < 3; j++) {
                let rule_var_ope=0;
                let _targetValue=0;
                
                // console.log(`foundCondis.length=${foundCondis.length}`);
                if(notArrOrEmptyArr(foundCondis)){
                    rule_var_ope=0;
                    _targetValue=0;
                }else if(j >= foundCondis.length){
                    rule_var_ope=0;
                    _targetValue=0;
                }else{
                    // console.log("foundCondis[j].ruleIdx", foundCondis[j].ruleIdx);
                    // console.log("foundCondis[j].varIdx", foundCondis[j].varIdx);
                    // console.log("foundCondis[j].condiOpe", foundCondis[j].condiOpe);
                    rule_var_ope= (foundCondis[j].ruleIdx << 16) | (foundCondis[j].varIdx << 8) | (foundCondis[j].condiOpe);
                    // console.log("rule_var_ope", rule_var_ope);
                    _targetValue=foundCondis[j].targetValue;
                }
    
                a_rule_var_ope.push(rule_var_ope);
                a_TargetValue.push(_targetValue);
            }
        }
    
        /** prepare lora info */
        let pi=[sceneIdx];
        let pf=[];
        for (const eachInv of a_rule_AcReq) {
            pi.push(eachInv);
        }
        for (const eachInv of a_rule_var_ope) {
            pi.push(eachInv);
        }
        for (const eachInv of a_Setpoint) {
            pf.push(eachInv);
        }
        for (const eachInv of a_TargetValue) {
            pf.push(eachInv);
        }
    
        if(blog) console.log("pf", pf);
        if(blog) console.log("pi", pi);

        let payload ={pf, pi};
        let loraPackage = genLoRaPackage(devDetails, payload, 2);
        if(!loraPackage.error){
            loraPackage.gwid = gwId;
            let _topic=`Gw/ServerCmd/${gwId}`;
            return {
                toPublish:true,
                topic:_topic,
                loraPackage
            }
            // prgMqtt.client.publish(`${_topic}`, loraPackage);
        }
    } catch (error) {
        console.log("replySceneParaReq error", error.message);
    }
}

exports.replyOnlineVarReq=replyOnlineVarReq;
exports.replySceneParaReq=replySceneParaReq;