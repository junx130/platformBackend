const { updateDevActChecklist } = require("../../../devActiveCheck/updateDevActChecklist");
const { checkNotification } = require("../../../notification/checkNotification");
const { listedInbuildingDevices } = require("../../queryData");


async function newNodeHandlingFn(deviceInfo, insertToDb, sensorPara){    
    const database = "RawDataLog";
    const buildingDb = "Buildings";

    try {
        await insertToDb(deviceInfo, database, deviceInfo.hi, sensorPara);
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
    } catch (error) {
        console.log("New Node Handling Error");
        console.log(error.message);
    }
}


exports.newNodeHandlingFn = newNodeHandlingFn;