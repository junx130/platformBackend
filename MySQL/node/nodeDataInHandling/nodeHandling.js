const { updateDevActChecklist } = require("../../../devActiveCheck/updateDevActChecklist");
const { checkNotification } = require("../../../notification/checkNotification");
const { listedInbuildingDevices } = require("../../queryData");
const { checkPid } = require("../../../ControlDevice/checkMapPID");

async function nodeHandlingFn(message, devType, f_InsertDb, validateMessage){    
    const database = "RawDataLog";
    const buildingDb = "Buildings";

    try {
        const deviceInfo = JSON.parse(message);
        if (deviceInfo.Ty ===devType) {            
            let validateErr = validateMessage(deviceInfo).error;
            if (!validateErr){
                await f_InsertDb(deviceInfo, database, deviceInfo.ID);
                // console.log(deviceInfo);
                let CheckListResult = await listedInbuildingDevices(deviceInfo.Ty, deviceInfo.ID);
                if (CheckListResult) {
                    for (const c of CheckListResult) {
                        await f_InsertDb(deviceInfo, buildingDb, c._id);  
                        /**  check notification list here*/
                        await checkNotification(c);
                        /**Check Device Active here */
                        await updateDevActChecklist(c._id);
                        /** Check PID */
                        await checkPid(c, deviceInfo);
                    }   
                }
            }else{
                console.log(validateErr);
            }
        }        
    } catch (error) {
        console.log("Unison Node DB handling Err:", error.message);
        console.log(error.message);
    }
}



exports.nodeHandlingFn = nodeHandlingFn;