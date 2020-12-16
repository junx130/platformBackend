// const { valid } = require("joi");
const {getNotifyListById, updateNotifiedUnix, getNotifyListByIdnType} = require("../MySQL/notification/notification");
const { getTelegramListById } = require("../MySQL/notification/telegramID");
const {getBuildingsByID} = require("../MySQL/aploudSetting/building");
const { sendNotifyMsg } = require("./telegram");
const {nodeKey} =require('./getNodeKeyName');
const {getUnixTodayBaseOnTime, _unixNow, getDate, getTimeTz} = require("../utilities/timeFn");
const {getDataT1ToT2} = require('../MySQL/queryData');

function genAlarmMessage(buildingName, alarmType,keyName, bdDev, value, notifyItem, _unix){
    return `${buildingName}:\n${keyName.toUpperCase()} of ${bdDev.name} ${alarmType}.\nDate: ${getDate(_unix)}\nTime: ${getTimeTz(_unix)}\nCurrent : ${value} ${notifyItem.DataUnit}\nSetpoint: ${notifyItem.AlarmSetpoint} ${notifyItem.DataUnit}`;    
}

getNodeKey=(key, type)=>{
    // console.log(key);
    let node=nodeKey.find(c=>(c.key === key && c.type ===type));    // check non common type
    if(!node) node = nodeKey.find(c=>(c.key === key ));             // check common type, type = 0
    if(!node) return

    return node.name;    
}

getBuildingName=async (buildingId)=>{
    let buildings = await getBuildingsByID(buildingId);
    // console.log(buildings);
    return buildings[0];
    // return buildings[0].building;
}

handleAlarmRepeat=async (notifyItem)=>{
    switch (notifyItem.AlarmRepeat) {            
        case 1:     return await everydayRefresh(notifyItem);  
        default:    return null;
    }
}

withinTimeRange=(startUnix, endUnix, setUnix)=>{
    let _startUnix = getUnixTodayBaseOnTime(startUnix);
    let _endUnix = getUnixTodayBaseOnTime(endUnix);
    // console.log(_startUnix);
    // console.log(_endUnix);
    // console.log(_unixNow());

    if (_startUnix >= _endUnix){
        if(_unixNow()<_endUnix){
            _startUnix-= 86400; // 86400 = 24*60*60
        }else{
            _endUnix+= 86400; 
        }
    }
    
    bWithin = (setUnix >= _startUnix && setUnix < _endUnix);
    // console.log(bWithin);
    return bWithin;
}

everydayRefresh=async (notifyItem)=>{
    // if not within range, skip    
    // console.log("Come In");
    if(!withinTimeRange(notifyItem.StartUnix, notifyItem.EndUnix, _unixNow())) return;
    // console.log("Within Time");
    // if been triggered within range, skip    
    if(withinTimeRange(notifyItem.StartUnix, notifyItem.EndUnix, notifyItem.NotifiedUnix)) return;
    // check database   
    // let result = await getBuildingDevicesByTypeID(req);    
    // console.log(notifyItem.StartUnix);
    // if(notifyItem.StartUnix > notifyItem.EndUnix) notifyItem.StartUnix-= 86400; 
    // console.log(notifyItem.StartUnix);
    // console.log(_unixNow());
    let OnedayEarlier = notifyItem.StartUnix == notifyItem.EndUnix || (_unixNow()<notifyItem.EndUnix && notifyItem.StartUnix > notifyItem.EndUnix);
    let result = await getDataT1ToT2("Buildings", notifyItem.type, notifyItem.bdDev_id, getUnixTodayBaseOnTime(notifyItem.StartUnix, OnedayEarlier), _unixNow()+60);
    // console.log(result);

    return result;
}



notificationHandling=async (notifyItem)=>{
    let alarmPattern =await handleAlarmRepeat(notifyItem);  // here will return one bunch of arry
    if(!alarmPattern) return null;
    let alarmArray = [];      
    let rtnValue ={};  
    switch (notifyItem.AlarmType) {
        case "upperLimit":            
            alarmArray = alarmPattern.filter(c=>(c[notifyItem.DataKey] > notifyItem.AlarmSetpoint));  
            if(!alarmArray[0]) return null
            rtnValue = {
                msg : `is exceeded UPPER limit`,
                // value: alarmArray[alarmArray.length-1][notifyItem.DataKey],
                // unix: alarmArray[alarmArray.length-1].unix,
                value: alarmArray[0][notifyItem.DataKey],
                unix: alarmArray[0].unix,
            }
            if(alarmArray.length >= notifyItem.Sensitivity) return rtnValue;
            break;
    
        case "lowerLimit":
            alarmArray = alarmPattern.filter(c=>(c[notifyItem.DataKey] < notifyItem.AlarmSetpoint));  
            if(!alarmArray[0]) return null
            rtnValue = {
                msg : `is exceeded LOWER limit`,
                // value: alarmArray[alarmArray.length-1][notifyItem.DataKey],
                // unix: alarmArray[alarmArray.length-1].unix,
                value: alarmArray[0][notifyItem.DataKey],
                unix: alarmArray[0].unix,
            }
            console.log("line 105");
            console.log(alarmArray.length);
            console.log(notifyItem.Sensitivity);
            if(alarmArray.length >= notifyItem.Sensitivity) return rtnValue;
            break;

        default:
            return null;
    }
}


async function checkNotification(bdDev, devData){
    // let type = [bdDev.type]
    let notifyList = await getNotifyListByIdnType(bdDev.type, bdDev._id);
    // console.log("Enter");
    // console.log(notifyList);
    if(!notifyList) return console.log("Not in monitoring list");

    for (const notifyItem of notifyList) {
        // check whether need to trigger notification
        let triggerAlarm = await notificationHandling(notifyItem);
        if(!triggerAlarm) continue
        // get telegram ID
        let building= await getBuildingName(bdDev.buildingID);
        let teleDB = await getTelegramListById(notifyItem.userID, building._id);
        console.log(teleDB);
        if(!teleDB[0]) {console.log("Telegram ID record empty"); continue}             
        
        console.log("building");
        let keyName = getNodeKey(notifyItem.DataKey, notifyItem.type);
        let notifyMsg = genAlarmMessage(building.building, triggerAlarm.msg, keyName, bdDev, triggerAlarm.value, notifyItem, triggerAlarm.unix);
        for (const singleTeleID of teleDB) {
            let teleID = singleTeleID.telegramID;
            sendNotifyMsg(teleID, notifyMsg);            
        }
        // write into database, update NotifiedUnix to timenow    
        if(process.env.activateTelegram==="true")    {
            await updateNotifiedUnix(notifyItem._id, _unixNow());
        }
    }


    return notifyList;
}


exports.checkNotification = checkNotification;