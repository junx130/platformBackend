const { updateDevActChecklist } = require("../../../devActiveCheck/updateDevActChecklist");
const { ioEmit } = require("../../../MainPrg/Prg_SocketIo");
const { V2_Reaction } = require("../../../MainPrg/V2_Reaction");
const { checkNotification } = require("../../../notification/checkNotification");
const { listedInbuildingDevices, listedInbuildingDevicesLite } = require("../../queryData");
const { getSensorOwnerBy_TydevID } = require("../../V2_DeviceRecord/v2_SensorOwner");


async function newNodeHandlingFn(deviceInfo, insertToDb, sensorPara){    
    const database = "RawDataLog";
    const buildingDb = "Buildings";
    const V2_bdDev_BD = "V2_DevDataLog";

    try {
        // await insertToDb(deviceInfo, database, deviceInfo.hi, sensorPara);      // skip store data into raw Data log
        /** V1, check device in bd List */
        let CheckListResult = await listedInbuildingDevicesLite(deviceInfo.ht, deviceInfo.hi);
        // console.log("CheckListResult");
        // console.log(CheckListResult);
        if (CheckListResult) {
            for (const eachList of CheckListResult) {
                await insertToDb(deviceInfo, buildingDb, eachList._id, sensorPara);  
                let topic_v1=`v1_${eachList.type}_${eachList._id}`
                ioEmit(topic_v1, eachList.unix);
                /**  check notification list here*/
                await checkNotification(eachList);
                /**Check Device Active here */
                await updateDevActChecklist(eachList._id);

            }   
        }

        /** V2 check and store to V2_DevDataLog */
        let info ={
            type:deviceInfo.ht,
            devID: deviceInfo.hi
        }
        // console.log(info);
        let bdDevLinked = await getSensorOwnerBy_TydevID(info);
        let linkToBdDev=true;
        if(!bdDevLinked || !bdDevLinked[0]) linkToBdDev=false;
        if(linkToBdDev){    /** proceed to store DB if dev link to bd (valid bdDev)*/
            // console.log(bdDevLinked);
            for (const c of bdDevLinked) {
                /** log data into DB */
                // await f_InsertDb(deviceInfo, V2_bdDev_BD, c._id, 'ForceLog');    // local setting
                // await f_InsertDb(deviceInfo, V2_bdDev_BD, c._id);                   // server setting
                await insertToDb(deviceInfo, V2_bdDev_BD, c._id, sensorPara);  
                // console.log(logDbRel);           
                
                /** v2 reaction */
                // console.log("~~~~~~~~~~~~c new~~~~~~~~~~~~~~~~", c);
                await V2_Reaction(c, deviceInfo);       
                
                /** omit to update frontend */
                let topic=`v2_${c.type}_${c._id}`       // v2_1_100
                ioEmit(topic, c.unix);
            }
        }

    } catch (error) {
        console.log("New Node Handling Error");
        console.log(error.message);
    }
}


exports.newNodeHandlingFn = newNodeHandlingFn;