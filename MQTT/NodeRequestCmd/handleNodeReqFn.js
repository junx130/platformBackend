const { v2GetBdDevData_lastNMin } = require("../../MySQL/V2_QueryData/v2_QueryBdDevData");
const { verifyCRC, genLoRaPackage } = require("../../utilities/loraFormat");
const { _unixNow } = require("../../utilities/timeFn");
const { notArrOrEmptyArr } = require("../../utilities/validateFn");

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
                    }else if(deviceInfo.ht===2000 && deviceInfo.hf===101){  // condensor loop request DPM reading
                        console.log("deviceInfo", deviceInfo);
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