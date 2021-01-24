// const { valid } = require("joi");
const {getNotifyListById, updateNotifiedUnix, getNotifyListByIdnType} = require("../MySQL/notification/notification");
const { getTelegramListById } = require("../MySQL/notification/telegramID");
const {getBuildingsByID} = require("../MySQL/aploudSetting/building");
const { sendNotifyMsg } = require("./telegram");
const {nodeKey} =require('./getNodeKeyName');
const {getUnixTodayBaseOnTime, _unixNow, getDate, getTimeTz} = require("../utilities/timeFn");
const {getDataT1ToT2_withOffset} = require('../MySQL/offset/queryDataAfterOffset');

function genAlarmMessage(buildingName, alarmType,keyName, bdDev, value, notifyItem, _unix){
    return `${buildingName}:\n${keyName.toUpperCase()} of ${bdDev.name} ${alarmType}.\nDate: ${getDate(_unix)}\nTime: ${getTimeTz(_unix)}\nSetpoint: ${notifyItem.AlarmSetpoint} ${notifyItem.DataUnit}\nCurrent : ${value} ${notifyItem.DataUnit}`;    
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
    // console.log(notifyItem);
    switch (notifyItem.AlarmRepeat) {            
        case 1:     return await everydayRefresh(notifyItem);  
        case 2:     return await risingTrigger(notifyItem);  
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
    if(!withinTimeRange(notifyItem.StartUnix, notifyItem.EndUnix, _unixNow())) return;
    if(withinTimeRange(notifyItem.StartUnix, notifyItem.EndUnix, notifyItem.NotifiedUnix)) return;
    let OnedayEarlier = (_unixNow()<notifyItem.EndUnix && notifyItem.StartUnix >= notifyItem.EndUnix);
    // let OnedayEarlier = notifyItem.StartUnix == notifyItem.EndUnix || (_unixNow()<notifyItem.EndUnix && notifyItem.StartUnix > notifyItem.EndUnix);
    let result = await getDataT1ToT2_withOffset("Buildings", notifyItem.type, notifyItem.bdDev_id, getUnixTodayBaseOnTime(notifyItem.StartUnix, OnedayEarlier), _unixNow()+60);
    return result;
}

function getLatest(prev, current){
    return (prev.unix > current.unix) ? prev:current;
}

function reduceFn(getLatest, a_found){
    if(!a_found[0]) return null;
    return a_found.reduce(getLatest);
}

risingTrigger=async (notifyItem)=>{
    // console.log(notifyItem);
    // if(notifyItem.bdDev_id == 3) console.log(notifyItem);
    /** No in monitoring time range */
    if(!withinTimeRange(notifyItem.StartUnix, notifyItem.EndUnix, _unixNow())) return;
    /**handle 0900 - 0800 situation */
    let OnedayEarlier = (_unixNow()<notifyItem.EndUnix && notifyItem.StartUnix >= notifyItem.EndUnix);

    /**determine notified time is later or starting time is later */
    let _checkTimeFrom = getUnixTodayBaseOnTime(notifyItem.StartUnix, OnedayEarlier);   // in case today do not happen notification before
    /**Notification not happend today before, handle as normal case */
    // console.log(notifyItem.NotifiedUnix); 
    // console.log(_checkTimeFrom); 
    /**---------Previous coding-----------*/
    // if(notifyItem.NotifiedUnix < _checkTimeFrom){ 
    //     return await getDataT1ToT2_withOffset("Buildings", notifyItem.type, notifyItem.bdDev_id, _checkTimeFrom, _unixNow()+60);
    // }
    // /**Notification happened today before*/
    // _checkTimeFrom = notifyItem.NotifiedUnix;   
    // let result = await getDataT1ToT2_withOffset("Buildings", notifyItem.type, notifyItem.bdDev_id, _checkTimeFrom, _unixNow()+60);
    /**============Previous coding===============*/
    let result = [];
    let todayHappenedBefore=false;
    if(notifyItem.NotifiedUnix < _checkTimeFrom || !notifyItem.NotifiedUnix){ 
        console.log("NotifiedUnix might null");
        result= await getDataT1ToT2_withOffset("Buildings", notifyItem.type, notifyItem.bdDev_id, _checkTimeFrom, _unixNow()+60);
    }else{
        /**Notification happened today before*/
        todayHappenedBefore=true;
        console.log("NotifiedUnix not null");
        _checkTimeFrom = notifyItem.NotifiedUnix;   
        result = await getDataT1ToT2_withOffset("Buildings", notifyItem.type, notifyItem.bdDev_id, _checkTimeFrom, _unixNow()+60);
        // console.log("Check after offset");
        // console.log(result[20]);
    }
    /**-------------------------Replace until here===================== */
    /**Read all since start time, handle  */
    // let result= await getDataT1ToT2_withOffset("Buildings", notifyItem.type, notifyItem.bdDev_id, _checkTimeFrom, _unixNow()+60);

    /**======================New Code======================== */
    
    let found = {};
    let relAfterFallBack=[];
    // console.log(result);
    switch (notifyItem.AlarmType) {
        case "upperLimit":            
            /** check value did fall back, below upper limit */
            a_found = result.filter(c=>c[notifyItem.DataKey] < notifyItem.AlarmSetpoint);
            // console.log("a_found");
            // console.log(a_found);
            if(!a_found[0]) {
                if(todayHappenedBefore) return
                return result;      /**enter new day monitoring range, and no value under monitoring value before, trigger notification if > sensitivity  */
            }
            found = a_found.reduce(getLatest);
            // found = reduceFn(getLatest, a_found);
            if(!found) return ;
            // found = result.find(c=>(c[notifyItem.DataKey] < notifyItem.AlarmSetpoint));
            relAfterFallBack = result.filter(c=>c.unix > found.unix);
            return relAfterFallBack
            break;
    
        case "lowerLimit":      
            // if(notifyItem.bdDev_id == 3) {
            //     console.log("Enter Lower Limit");
            //     console.log(result);
            // }
            /** check value did fall back, above lower limit */
            /**Get all fallback value */
            a_found = result.filter(c=>c[notifyItem.DataKey] > notifyItem.AlarmSetpoint);            
            if(!a_found[0]) {
                if(todayHappenedBefore) return
                return result;      /**enter new day monitoring range, and no value under monitoring value before, trigger notification if > sensitivity  */
            }
            found = a_found.reduce(getLatest);
            // found = reduceFn(getLatest, a_found);
            // found = result.find(c=>(c[notifyItem.DataKey] > notifyItem.AlarmSetpoint));
            // if(notifyItem.bdDev_id == 3) console.log(found);
            if(!found) return ;            
            relAfterFallBack = result.filter(c=>c.unix > found.unix);
            // console.log(relAfterFallBack);
            return relAfterFallBack
        
            break;
    
        default:
            break;
    }
    console.log(result);
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
                msg : `has exceeded UPPER limit`,
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
                msg : `has exceeded LOWER limit`,
                // value: alarmArray[alarmArray.length-1][notifyItem.DataKey],
                // unix: alarmArray[alarmArray.length-1].unix,
                value: alarmArray[0][notifyItem.DataKey],
                unix: alarmArray[0].unix,
            }
            // console.log("line 105");
            // console.log(alarmArray.length);
            // console.log(notifyItem.Sensitivity);
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
    // if(bdDev._id==3) console.log(notifyList);
    if(!notifyList) return console.log("Not in monitoring list");

    for (const notifyItem of notifyList) {
        // console.log("Monitoring List");
        // if(notifyItem.bdDev_id == 3) console.log(notifyItem);
        // check whether need to trigger notification
        if(notifyItem.Active == 0) continue;        // Alarm is active column unchecked
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