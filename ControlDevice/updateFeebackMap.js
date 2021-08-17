const { getBuildingDevicesBy_ID } = require("../MySQL/buildings/buildingDevices");
const {getCtrlDev, updateCtrlDev, insertCtrlDev, getNCtrlDevFromX, getItemCount} = require("../MySQL/ControlDevice/PidMap");

getFeedbackDeviceMap=async(ctDev)=>{
    try {
        let ctrlDev = await getCtrlDev(ctDev);  // check feedback map exist
        if (!ctrlDev || !ctrlDev[0]) return
        return ctrlDev[0];
    } catch (error) {
        console.log(error.message);
        return 
    }
}   


getTotalItemCountFn = async()=>{
    try {
        let itemCount = await getItemCount();  // check feedback map exist        
        // console.log("itemCount");
        // console.log(itemCount);
        return itemCount;
        // if (!ctrlDev || !ctrlDev[0]) return
        // return ctrlDev;
    } catch (error) {
        console.log(error.message);
    }
}

getNFeedbackDevFromX=async(ctDev)=>{
    try {
        let ctrlDev = await getNCtrlDevFromX(ctDev);  // check feedback map exist        
        if (!ctrlDev || !ctrlDev[0]) return []
        return ctrlDev;
    } catch (error) {
        console.log(error.message);
        return []
    }
}   

setFeedbackDevice=async(ctDev)=>{
    try {
        let ctrlDev = await getCtrlDev(ctDev);  // check feedback map exist
        // console.log(ctrlDev);
        let newFbDev = await getBuildingDevicesBy_ID(ctDev.fbBdDev_id)
        if (!newFbDev || !newFbDev[0]) return console.log("FB device not available");
        // console.log(ctDev);
        if (ctrlDev[0]) {      // exist, update
            // console.log("Exist");
            ctDev.fbNodeType = newFbDev[0].type;
            ctDev._id=ctrlDev[0]._id;
            let updateRel = await updateCtrlDev(ctDev)
            if(updateRel) return {update:true}
            return false
        }else{      // not exist, insert
            // console.log("Not exist");
            ctDev.fbNodeType = newFbDev[0].type;
            let insertRel = await insertCtrlDev(ctDev);
            if(insertRel) return {insert:true}
            return false
        }

    } catch (error) {
        console.log(error.message);
    }
}

exports.getTotalItemCountFn=getTotalItemCountFn;
exports.getNFeedbackDevFromX=getNFeedbackDevFromX;
exports.getFeedbackDeviceMap=getFeedbackDeviceMap;
exports.setFeedbackDevice =setFeedbackDevice;