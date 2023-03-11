const { getRjOnineVar_BybdDev_id, getRjRules_bdDevId_sceneIdx_inUse, getRjCondis_bdDevId_sceneIdx_inUse, getRjScene_BybdDev_id } = require("../../../MySQL/V2_Application/RogerJunior/V2_App_RJ");
const { getSensorOwnerBy_TydevID_inUse, getBddevBy_idList } = require("../../../MySQL/V2_DeviceRecord/v2_SensorOwner");
const { v2GetBdDevData_lastNMin } = require("../../../MySQL/V2_QueryData/v2_QueryBdDevData");
const { getLoraValueKey, genLoRaPackage } = require("../../../utilities/loraFormat");
const { notArrOrEmptyArr, notEmptyArr } = require("../../../utilities/validateFn");

const C_TotalOnlineVar = 7; // 2 iControl + 5 adv control
const blog = false;
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

function genScenePayload(sceneDetails, bSaveEeprom){
    // rule_AcReq = (foundRule[0].ruleIdx << 8) | foundRule[0].AcReq;
    let _sceneIdx = sceneDetails.scene.sceneIdx;
    if(_sceneIdx <= 0) return {errMsg:"SceneInfoErr"};

    let pb=[bSaveEeprom];      // 0= save scene on local
    let pi=[_sceneIdx];
    let pf=[];
    for (let i = 0; i < 5; i++) {
        if(notEmptyArr(sceneDetails.rules)){     
            let found = sceneDetails.rules.find(c=>c.ruleIdx===i+1);
            if(found) {
                let fan_swing_AcReq = (found.Fan << 16) | (found.Swing << 8) | found.AcReq;
                pi.push(fan_swing_AcReq);     
                pi.push(found.Setpoint);    

                /** get condis info */
                if(notEmptyArr(sceneDetails.condis)){
                    let filtered= sceneDetails.condis.filter(c=>c.ruleIdx === i+1);
                    for (let j = 0; j < 3; j++) {
                        if(filtered.length > j){
                            let varIdx_condiOpe = (filtered[j].varIdx << 8) | filtered[j].condiOpe;
                            pi.push(varIdx_condiOpe);
                            pf.push(filtered[j].targetValue);
                        }else{      // no more, push 0
                            pi.push(0);
                            pf.push(0);
                        }
                    }
                }
                continue;
            }
        }
        pi.push(0);         // rule fan_swing_AcReq
        pi.push(0);         // rule setpoint

        pi.push(0);         // condi varIdx_condiOpe
        pi.push(0);         // condi varIdx_condiOpe
        pi.push(0);         // condi varIdx_condiOpe
        pf.push(0);         // condi target value 
        pf.push(0);         // condi target value 
        pf.push(0);         // condi target value 
    }
    return {pb, pi, pf};
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
        if(sceneIdx>10 || sceneIdx<0) return console.log("Err: Scene Idx over range");
    
        /** get RJ bdDev info */
        let RjBdDevInfo = await getSensorOwnerBy_TydevID_inUse({type:deviceInfo.ht, devID:deviceInfo.hi});
        if(notArrOrEmptyArr(RjBdDevInfo)) {
            if(blog) console.log("Get RJ bdDev Info error");
            return 
        }

        let rj_id=RjBdDevInfo[0]._id;

        /** get scene */
        let sceneList = await getRjScene_BybdDev_id(rj_id);
        if(!sceneList) return console.log("Get member device info Err(DB)");
        let scene = sceneList.find(c=>c.sceneIdx === sceneIdx);
        /** get rules */
        let rules = await getRjRules_bdDevId_sceneIdx_inUse(rj_id, sceneIdx);
        if(!rules) return console.log("Get rules Err(DB)");
        
        /** get condi */
        let condis = await getRjCondis_bdDevId_sceneIdx_inUse(rj_id, sceneIdx);
        if(!condis) return console.log("Get condis Err(DB)");
        
        let sceneInfo = {scene, rules, condis};

        let payload = genScenePayload(sceneInfo, false);    
        // let payload ={pf, pi};

        console.log("payload", payload);
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