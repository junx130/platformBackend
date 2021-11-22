const { updateDevActChecklist } = require("../../../devActiveCheck/updateDevActChecklist");
const { checkNotification } = require("../../../notification/checkNotification");
const { listedInbuildingDevices } = require("../../queryData");
const { getSensorOwnerBy_TydevID } = require("../../V2_DeviceRecord/v2_SensorOwner");


async function newNodeHandlingFn(deviceInfo, insertToDb, sensorPara){    
    const database = "RawDataLog";
    const buildingDb = "Buildings";
    const V2_bdDev_BD = "V2_DevDataLog";

    try {
        // await insertToDb(deviceInfo, database, deviceInfo.hi, sensorPara);      // skip store data into raw Data log
        /** V1, check device in bd List */
        let CheckListResult = await listedInbuildingDevices(deviceInfo.ht, deviceInfo.hi);
        if (CheckListResult) {
            for (const c of CheckListResult) {
                await insertToDb(deviceInfo, buildingDb, c._id, sensorPara);  
                // console.log("Logged to building");
                /**  check notification list here*/
                await checkNotification(c);
                /**Check Device Active here */
                await updateDevActChecklist(c._id);
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
            }
        }

    } catch (error) {
        console.log("New Node Handling Error");
        console.log(error.message);
    }
}


exports.newNodeHandlingFn = newNodeHandlingFn;