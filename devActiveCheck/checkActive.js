const { getDevActCheck_Rising, setDeviceToNonActive } = require("../MySQL/notification/devActive");
const { sendNotifyMsg } = require("../notification/telegram");
const { getFmtTime, getDate, getTimeTz, _unixNow, fShiftUnixToEndTime, fGetTimeDiff_InDTMS} = require("../utilities/timeFn");
const { getTelegramListById } = require("../MySQL/notification/telegramID");
const { getBuildingsByID } = require("../MySQL/aploudSetting/building");
const { getBuildingDevicesBy_ID } = require("../MySQL/buildings/buildingDevices");
const { devStrFormat } = require("../utilities/devStringFormat");



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
      if(OtDevice.startTime < OtDevice.endTime){  // normal  condition, didnt cross second day  
        if (fmtTime < OtDevice.startTime || fmtTime > OtDevice.endTime) continue // jump over one itteration
      }else{    // cross condition
        if (fmtTime > OtDevice.endTime && fmtTime < OtDevice.startTime) continue // jump over one itteration
      }

      /** Check if today already been triggered */
      // console.log(_unixNow());
      // console.log(fShiftUnixToEndTime(_unixNow(), OtDevice.endTime));
      if (OtDevice.lastNotifiedTime > OtDevice.lastUpdate) {  // if last triggered null, proceed to send notification
      // if (OtDevice.lastNotifiedTime && OtDevice.lastNotifiedTime > OtDevice.lastUpdate) {  // is last triggered null, proceed to send notification
        if (_unixNow() < fShiftUnixToEndTime(OtDevice.lastNotifiedTime, OtDevice.endTime)) continue;          
      }
      // console.log(`_id: ${OtDevice._id}, Proceed trig next day`);

      /**Get telegram id of device */
      let teleList = await getTelegramListById(0, OtDevice.buildingID);   // 0, send message to common group
      let teleID ;
      if (teleList && teleList[0]) teleID = teleList[0].telegramID;
      // console.log(teleList);      
      /** Generate telegram Message */
      let sTimeDiff = fGetTimeDiff_InDTMS(_unixNow(), OtDevice.lastUpdate);
      
      // get bddev  name
      let dev = await getBuildingDevicesBy_ID(OtDevice.bdDevID);
      // console.log(dev);      
      let devName = '';
      if (dev && dev[0]) devName = devStrFormat(dev[0]);

      let teleMsg = await genTeleMessage(OtDevice.buildingID, devName, sTimeDiff);
      // console.log(teleMsg);
      try {
        /** send telegram message */
        if (teleID) await sendNotifyMsg(teleID, teleMsg);   

        /**Update DB after send notification */
        // if(process.env.activateTelegram==="true")    {
          await setDeviceToNonActive(OtDevice.bdDevID);
        // }  

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