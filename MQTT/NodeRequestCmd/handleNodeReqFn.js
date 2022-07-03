const { verifyCRC, genLoRaPackage } = require("../../utilities/loraFormat");

function handleNodeReq(topic, message){
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