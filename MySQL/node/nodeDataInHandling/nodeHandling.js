const { updateDevActChecklist } = require("../../../devActiveCheck/updateDevActChecklist");
const { checkNotification } = require("../../../notification/checkNotification");
const { listedInbuildingDevices } = require("../../queryData");
const { checkPid } = require("../../../ControlDevice/checkMapPID");
const { getSensorOwnerBy_TydevID } = require("../../V2_DeviceRecord/v2_SensorOwner");
const { V2_Reaction } = require("../../../MainPrg/V2_Reaction");
const { ioEmit } = require("../../../MainPrg/Prg_SocketIo");

async function nodeHandlingFn(message, devType, f_InsertDb, validateMessage){    
    const database = "RawDataLog";
    const buildingDb = "Buildings";
    const V2_bdDev_BD = "V2_DevDataLog";

    try {
        const deviceInfo = JSON.parse(message);
        if (deviceInfo.Ty ===devType) {            
            let validateErr = validateMessage(deviceInfo).error;
            if (!validateErr){
                // await f_InsertDb(deviceInfo, database, deviceInfo.ID);   // 211030 skip store data to raw table.
                // console.log(deviceInfo);
                /** V1, check and store into DB */
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
                /** V2 check and store to V2_DevDataLog */
                    let info ={
                        type:deviceInfo.Ty,
                        devID: deviceInfo.ID
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
                            await f_InsertDb(deviceInfo, V2_bdDev_BD, c._id);                   // server setting
                            // console.log(logDbRel);                    
                            
                            /** v2 reaction */
                            // console.log("~~~~~~~~~~~~c~~~~~~~~~~~~~~~~", c);
                            await V2_Reaction(c, deviceInfo);     
                            
                            /** omit to update frontend */
                            let topic=`v2_${c.type}_${c._id}`
                            ioEmit(topic, c.unix);
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