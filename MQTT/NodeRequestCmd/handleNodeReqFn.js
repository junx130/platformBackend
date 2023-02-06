const { getVarPair } = require("../../MySQL/V2_Application/V2_ApplicationMysql");
const { getSensorOwnerBy_TydevID, getBddevBy_idList } = require("../../MySQL/V2_DeviceRecord/v2_SensorOwner");
const { v2GetBdDevData_lastNMin } = require("../../MySQL/V2_QueryData/v2_QueryBdDevData");
const { verifyCRC, genLoRaPackage } = require("../../utilities/loraFormat");
const { _unixNow } = require("../../utilities/timeFn");
const { notArrOrEmptyArr } = require("../../utilities/validateFn");
const { F_CondensorLoopLogic } = require("./CondensorLoop/CondensorLoopLogic");
const { F_VarPairHandle } = require("./NodeReqFun/VarPairFunc");
const { replyOnlineVarReq } = require("./RogerJunior/RjFunction");

async function handleNodeReq(topic, message){
    try {        
        let arr_topic = topic.split("/");
        if(arr_topic[0] === "Aplouds" && arr_topic[1] === "NodeToServer"){
        const deviceInfo = JSON.parse(message);            
            if(verifyCRC(deviceInfo)) {
                if(deviceInfo.hd===1){
                    if(deviceInfo.hf===20003){  // node request sync time
                        // console.log("deviceInfo.GwID", deviceInfo.GwID);
                        let gwId = parseInt(deviceInfo.GwID);
                        /** publish fn 3 to node */
                        let devDetails={
                            devType:deviceInfo.ht,
                            id:deviceInfo.hi,
                            dir:3,
                            fun:20003
                        }
                        let payload ={pi:[gwId]};
                        let loraPackage = genLoRaPackage(devDetails, payload, 2);
                        // console.log("loraPackage [22] : ", loraPackage);
                        if(!loraPackage.error){
                            loraPackage.gwid = gwId;
                            let _topic=`Gw/ServerCmd/${gwId}`;
                            // console.log("loraPackage : ", loraPackage);
                            return {
                                toPublish:true,
                                topic:_topic,
                                loraPackage
                            }
                            // prgMqtt.client.publish(`${_topic}`, loraPackage);
                        }
                    }else if(deviceInfo.ht===39 && deviceInfo.hf===101){  // condensor loop request DPM reading
                        // console.log("deviceInfo", deviceInfo);
                        let gwId = parseInt(deviceInfo.GwID);
                        /** publish fn 3 to node */
                        let devDetails={
                            devType:deviceInfo.ht,
                            id:deviceInfo.hi,
                            dir:3,
                            fun:deviceInfo.hf
                        }

                        /** get DPM reading, base on deviceInfo.pis[0] */
                        let _bdDev_id = deviceInfo.pi[0];
                        let _Dev_id = deviceInfo.pi[1];
                        let _type = deviceInfo.pi[2];
                        let _nMins = deviceInfo.pi[3];
                        let dpmData = await v2GetBdDevData_lastNMin(_type, _bdDev_id, _nMins);
                        // console.log(dpmData);                        
                        /** pf[15], 
                         *      if nMins = 15, pf[1] ~ pf[2] is 1 mins, 
                         *      if nMins = 30, pf[1] ~ pf[2] is 2 mins, 
                         * */                        
                        let pf = [];
                        let tUnixNow =  _unixNow();
                        let timeInterval_s = _nMins * 60 / 15;
                        for (let i = 0; i < 15; i++) {
                            let dataInRange = dpmData.filter(c=> c.unix <= tUnixNow-(i*timeInterval_s) && c.unix > tUnixNow - ((i+1)*timeInterval_s));
                            if(notArrOrEmptyArr(dataInRange)){
                                pf.push(0);
                            }else{
                                pf.push(dataInRange[0].ActivePower_Total);
                            }
                        }
                        // console.log(pf);

                        let payload ={pi:[gwId], pf};
                        let loraPackage = genLoRaPackage(devDetails, payload, 2);
                        // console.log("loraPackage [22] : ", loraPackage);
                        if(!loraPackage.error){
                            loraPackage.gwid = gwId;
                            let _topic=`Gw/ServerCmd/${gwId}`;
                            // console.log("loraPackage : ", loraPackage);
                            return {
                                toPublish:true,
                                topic:_topic,
                                loraPackage
                            }
                            // prgMqtt.client.publish(`${_topic}`, loraPackage);
                        }
                    }else if(deviceInfo.ht===39 && deviceInfo.hf===102){    // CL logic
                        let CL_rel = await F_CondensorLoopLogic(deviceInfo);
                        return CL_rel;
                        if(!CL_rel) return
                        if(CL_rel.toPublish) return CL_rel;
                    }else if(deviceInfo.hf===20010){    // request var pair value
                        
                        let gwId = parseInt(deviceInfo.GwID);

                        let dataReply=0;
                        let errCode = 0;
                        let fnType=0;
                        let dataRel = await F_VarPairHandle(deviceInfo);
                        if(dataRel.err) {
                            errCode = dataRel.err;
                            // console.log("errCode: ", dataRel.err);
                        }else{
                            dataReply = parseFloat(dataRel.dataReply);
                            // console.log("dataRel: ", dataRel);
                        }
                        fnType = parseInt(dataRel.pairFnType);

                        let devDetails={
                            devType:deviceInfo.ht,
                            id:deviceInfo.hi,
                            dir:3,
                            fun:20010
                        }
                        let payload ={pi:[errCode, fnType], pf:[dataReply]};
                        let loraPackage = genLoRaPackage(devDetails, payload, 2);
                        // console.log("loraPackage [22] : ", loraPackage);
                        if(!loraPackage.error){
                            loraPackage.gwid = gwId;
                            let _topic=`Gw/ServerCmd/${gwId}`;
                            // console.log("loraPackage : ", loraPackage);
                            return {
                                toPublish:true,
                                topic:_topic,
                                loraPackage
                            }
                            // prgMqtt.client.publish(`${_topic}`, loraPackage);
                        }

                    }else if(deviceInfo.ht===47 && deviceInfo.hf===101){    // request online pair value                        
                        let reqOutput = await replyOnlineVarReq(deviceInfo);
                        return reqOutput;
                    }else if(deviceInfo.ht===47 && deviceInfo.hf===102){    // request scene parameter
                        let reqOutput = await replyOnlineVarReq(deviceInfo);
                        return reqOutput;
                    }
                }
            }  
        }
        return
    } catch (error) {
        console.log("handleNodeReq err : ", error.message); 
        return
    }
}


exports.handleNodeReq=handleNodeReq;