const { publish_2ndMqtt, mqttClient2nd, subscribe_2ndMqtt, unsubscribe_2ndMqtt } = require("../MQTT/mqttSend");
const { getBuildingDevicesBy_ID } = require("../MySQL/buildings/buildingDevices");
const {getPidMap} = require("../MySQL/ControlDevice/PidMap");
// const { getNotifyListByIdnType } = require("../MySQL/notification/notification");
const { getOffsetByIdnKey } = require("../MySQL/offset/offset");
const{genLoRaPackage} = require("../utilities/loraFormat");


// mqttClient2nd.on('message', async (topic, message) => {
//     const a_topic = topic.split("/");
//     if(a_topic[0]===`Aplouds` &&
//         a_topic[1]===`ServerToNode` ){
//             let deviceInfo = JSON.parse(message);
//             console.log(topic);
//             console.log(deviceInfo);
//             unsubscribe_2ndMqtt(topic)
//     }

// })

checkPid=async(bdDev, sensorData)=>{
    // console.log(bdDev);
    pidMapList = await getPidMap(bdDev);
    // publish_2ndMqtt(`Aplouds/ServerToNode/10`, "Hello");

    if(!pidMapList[0]) return //console.log('Not In Monitoring List');
    //console.log('In PID list');
    // Send mqtt to gateway
    let devDetails={};
    let payload={};
    for (const pidMap of pidMapList) {
        /** Generate loRa message */
        console.log(sensorData);
        console.log(pidMap);
        
        let bdDev = await getBuildingDevicesBy_ID(pidMap.ctBdDev_id);
        let info = {
            type:sensorData.Ty,
            devID:sensorData.ID
        }
        console.log(info);
        let offsetList = await getOffsetByIdnKey(info);
        console.log("~~~~~~~~~~~~~~Notify List ~~~~~~~~~~~~~~~~~~");
        console.log(offsetList);
        let tempOffset = offsetList.filter(c=>c.DataKey === "temperature");
        let offset = 0;
        if (tempOffset[0]) offset = tempOffset[0].offsetValue;

        console.log(tempOffset);
        console.log(bdDev);
        if (!bdDev[0]) return 
        devDetails = {
            devType: pidMap.ctNodeType,
            id: bdDev[0].devID ,      // from here get actual ID from buidling dev id
            dir: 2, // from gateway to node
            fun: pidMap.loraFun, // function code, 1=> set parameter 1
        };
        console.log(devDetails);
        payload = {
            // pb:[1,1],
            pf: [sensorData[pidMap.DataKey]+offset],
            // pi:[123456789, 987654321],
            // pn:[1612669989]
        }

        let package_ = genLoRaPackage(devDetails, payload)
        package_.gwid = pidMap.gwID;
        // console.log(package_);
        /** MQTT Send PID feedback to gateway to sensor*/
        
        // subscribe_2ndMqtt(`Aplouds/ServerToNode/${package_.gwid}`);
        console.log(package_);
        publish_2ndMqtt(`Aplouds/ServerToNode/${package_.gwid}`, package_);
    }
    
    
}



exports.checkPid = checkPid;