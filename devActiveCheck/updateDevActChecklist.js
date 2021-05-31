const { updateActiveDevChecklist } = require("../MySQL/notification/devActive");


async function updateDevActChecklist(bdDev_id){
    try {
        /** Skip check device, direct update*/
        let {affectedRows:nUpdated} = await updateActiveDevChecklist(bdDev_id);
        if (nUpdated < 1) return false      // no line updated
        return true
    } catch (error) {
        console.log("checkDeviceActivePrg Error");
        console.log(error.message);
        return false        
    }
}



exports.updateDevActChecklist=updateDevActChecklist;