const { getDevActCheck_Rising, setDeviceToNonActive } = require("../MySQL/notification/devActive");
const { sendNotifyMsg } = require("../notification/telegram");
const { getFmtTime, getDate, getTimeTz, _unixNow, fShiftUnixToEndTime, fGetTimeDiff_InDTMS, getUnixTodayBaseOnTime, fFmtTimeToUnixToday, fUnixOneDayEarlier} = require("../utilities/timeFn");
const { getTelegramListById, getTelegramListBy_Id } = require("../MySQL/notification/telegramID");
const { getBuildingsByID } = require("../MySQL/aploudSetting/building");
const { getBuildingDevicesBy_ID } = require("../MySQL/buildings/buildingDevices");
const { devStrFormat } = require("../utilities/devStringFormat");
const { getTeleSubList } = require("../MySQL/notification/teleSubscribeList");



getBuildingName=async (buildingId)=>{
  let buildings = await getBuildingsByID(buildingId);
  // console.log(buildings);
  return buildings[0];
  // return buildings[0].building;
}

async function genTeleMessage(building_id, devName, sTimeDisconnected){
  /**Get time now */
  let _unix = _unixNow();
  /**Get BuildingName */
  let bd = await getBuildingName(building_id);
  // console.log(bd.building);

  let buildingName=bd.building;
  let disconnectedMsg = `has DISCONNECTED for ${sTimeDisconnected}`;
  if (sTimeDisconnected==='inf') disconnectedMsg = `is NOT CONNECTED`;
  let teleMessage = `${buildingName}:\n${devName} ${disconnectedMsg}.\nDate: ${getDate(_unix)}\nTime: ${getTimeTz(_unix)}`
  // let teleMessage = `${buildingName}:\n${devName} has DISCONNECTED for ${sTimeDisconnected}\nDate: ${getDate(_unix)}\nTime: ${getTimeTz(_unix)}`
  return teleMessage;
}

async function checkDevActive() {
  /** handle rising trigger message */
  try {
    /**Generate fmt_Time */
    let fmtTime  = getFmtTime();
    /**Search inactive device (Rising type configuration) from check list */
    let OT_Devices_Rising = await getDevActCheck_Rising();
    // console.log(OT_Devices_Rising);
    /**Send notification */
    for (const OtDevice of OT_Devices_Rising) {
      /**Filter inactive time */  
      let startUnixToday = fFmtTimeToUnixToday(OtDevice.startTime);
      let endUnixToday = fFmtTimeToUnixToday(OtDevice.endTime);
      if(OtDevice.startTime < OtDevice.endTime){  // normal  condition, didnt cross second day     
        if (fmtTime < OtDevice.startTime || fmtTime > OtDevice.endTime) continue; /** Out of checking Period, skip */
        /** Check whether been triggerd today */
        /**Today been triggered */          
        if (startUnixToday < OtDevice.lastNotifiedTime && endUnixToday > OtDevice.lastNotifiedTime){
          if( OtDevice.lastNotifiedTime > OtDevice.lastUpdate ) continue /**Today sensor no more conenction after last notification, skip triggering */
          /**Proceed to trigger if sensor online after 1st notification and back to offline again*/
        }/** proceed to trigger if not been triggered today */
      }else{    // cross condition        
        /** Same start stop time will under this condition */
        if (fmtTime > OtDevice.endTime && fmtTime < OtDevice.startTime) continue /** Out of checking period, skip */
        /** Check whether been triggered today */
        /** eg. 2200 -> 0200 */
        if(fmtTime >= OtDevice.startTime){   /** Check 2200 -> 0000 , time now is 2100*/
          /**Today been triggered */
          /** Notification happen on 2200 -> 0000 */
          if(startUnixToday < OtDevice.lastNotifiedTime && fFmtTimeToUnixToday(240000) > OtDevice.lastNotifiedTime){
            /**Today sensor no more conenction after last notification, skip triggering */
            if( OtDevice.lastNotifiedTime > OtDevice.lastUpdate ) continue 
          } /** Proceed to trigger if not happened trigger today */
        }else if (fmtTime <= OtDevice.endTime) { /** check 0000 -> 0200*/
          if(fUnixOneDayEarlier(startUnixToday) < OtDevice.lastNotifiedTime && endUnixToday > OtDevice.lastNotifiedTime){
            /**Today sensor no more conenction after last notification, skip triggering */
            if( OtDevice.lastNotifiedTime > OtDevice.lastUpdate ) continue 
          }/** Proceed to trigger if not happened trigger today */
        }
      }

      /**Get telegram id of device */
      let teleList = await getTelegramListById(0, OtDevice.buildingID);   // 0, send message to common group
      let teleSubscribeList = await getTeleSubList(OtDevice.buildingID);
      let subTeleList = [];
      for (const item of teleSubscribeList) {
        let teleInfo = await getTelegramListBy_Id(item.tele_id);
        for (const item of teleInfo) {
          subTeleList.push(item);          
        }
      }
      // console.log(subTeleList);

      let combineTeleList = [...teleList, ...subTeleList];
      /** filter duplicated chatID */
      let uniqueTeleList = Array.from(new Set(combineTeleList.map(a => a.telegramID))).map(telegramID => {
        return combineTeleList.find(a => a.telegramID === telegramID)
      });
      // console.log("Combine unique List");
      // console.log(uniqueTeleList);

      // console.log(teleList);      
      /** Generate telegram Message */
      let sTimeDiff = fGetTimeDiff_InDTMS(_unixNow(), OtDevice.lastUpdate);
      let dev = await getBuildingDevicesBy_ID(OtDevice.bdDevID);
      let devName = '';
      if (dev && dev[0]) devName = devStrFormat(dev[0]);
      let teleMsg = await genTeleMessage(OtDevice.buildingID, devName, sTimeDiff);
      // console.log(teleMsg);
      /**Send Telegram 1 by 1 */
      
      try {        
        for (const teleInfo of uniqueTeleList) {
          await sendNotifyMsg(teleInfo.telegramID, teleMsg);   
          
          /**Update DB after send notification */
          if(process.env.activateTelegram==="true")    {
            await setDeviceToNonActive(OtDevice.bdDevID);
          }  
        }
      } catch (error) {
        console.log("Check Dev Active Send Telegram error");
        console.log(error.message);
      }
    }
    
  } catch (error) {
    console.log("checkDevActive error");
    console.log(error.message);
  }

}

exports.checkDevActive = checkDevActive;