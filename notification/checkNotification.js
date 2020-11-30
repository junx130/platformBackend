const { valid } = require("joi");
const {getNotifyListById} = require("../MySQL/notification/notification");
const { getTelegramListById } = require("../MySQL/notification/telegramID");
const {getBuildingsByID} = require("../MySQL/aploudSetting/building");
const { sendNotifyMsg } = require("./telegram");
const {nodeKey} =require('./getNodeKeyName');

function notifyMessagePattern(buildingName, condition,keyName, bdDev, value, notifyItem){
    return `${buildingName}:\n${keyName} of ${bdDev.name} is exceeded ${condition} limit.\nCurrent : ${value} ${notifyItem.DataUnit}\nSetpoint: ${notifyItem.UpperLimit} ${notifyItem.DataUnit}`;    
}

getNodeKey=(key)=>{
    let node=nodeKey.find(c=>(c.key === key));
    if(!node) return
    return node.name;    
}

getBuildingName=async (buildingId)=>{
    let buildings = await getBuildingsByID(buildingId);
    // console.log(buildings);
    return buildings[0].building;
}

async function checkNotification(bdDev, devData){
    // console.log("Check Notify");
    let notifyList = await getNotifyListById(bdDev.type, bdDev._id);
    if(!notifyList) return console.log("Not in monitoring list");
    // console.log(bdDev);
    // console.log(notifyList);
    // console.log(devData);

    for (const notifyItem of notifyList) {
        let value = devData[notifyItem.DataKey];        
        // console.log(value);
        let teleDB = await getTelegramListById(notifyItem.userID, notifyItem.bdDev_id);
        // console.log(teleDB);
        if(!teleDB[0]) return console.log("Telegram ID record empty");
        let teleID = teleDB[0].telegramID;
        // console.log(teleID);
        let keyName = getNodeKey(notifyItem.DataKey);
        let buildingName= await getBuildingName(bdDev.buildingID);
        // let keyName = "Temperature";
        // let buildingName = "Ipoh Home";
        if(value > notifyItem.UpperLimit) {
            let notifyMsg = notifyMessagePattern(buildingName, "UPPER", keyName, bdDev, value, notifyItem);
            sendNotifyMsg(teleID, notifyMsg);
        }
        if(value < notifyItem.LowerLimit) {
            let notifyMsg = notifyMessagePattern(buildingName, "LOWER", keyName, bdDev, value, notifyItem);
            sendNotifyMsg(teleID, notifyMsg);
        }
    }

    // 1. check whether temp is above upper limit


    // 2. check whether temp is below lower limit


    return notifyList;
}


exports.checkNotification = checkNotification;