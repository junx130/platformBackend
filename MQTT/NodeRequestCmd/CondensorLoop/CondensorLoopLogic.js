// const e = require("cors");
const { v2_insertAppDataLog, v2_getAppDataLog_LastN, v2_insertReTuneLog, v2_getReTuneVarLog_withOpCode } = require("../../../MySQL/V2_AppDataLog/V2_AppDataLog");
const { get_V2InputFactorPaired, v2_insertAppErrLog, getRetuneVar_masterbdDevId } = require("../../../MySQL/V2_Application/V2_ApplicationMysql");
const { getSensorOwnerBy_TydevID, getBddevBy_idList } = require("../../../MySQL/V2_DeviceRecord/v2_SensorOwner");
const { v2GetBdDevData_lastNMin, v2GetBdDevData_lastN } = require("../../../MySQL/V2_QueryData/v2_QueryBdDevData");
const { genLoRaPackage } = require("../../../utilities/loraFormat");
const { notArrOrEmptyArr } = require("../../../utilities/validateFn");



async function F_CondensorLoopLogic(deviceInfo){
    let _opCode = deviceInfo.pi[0];
    let _ctrlTrend = deviceInfo.pi[1];
    let ctrlTrend = parseInt(_ctrlTrend);
    if(isNaN(ctrlTrend)) return console.log("ctrlTrend is NaN");

    let localOpCode = parseInt(_opCode);
    if(isNaN(localOpCode)) {
        console.log("localOpCode is NaN");
        localOpCode = 0;    // set opCode to 0
    }

    /** -------------> return if not paired gateway ID */

    /** get master bdDev_id */
    let masterDevice = await getSensorOwnerBy_TydevID({type:deviceInfo.ht, devID:deviceInfo.hi})
    // console.log("masterDevice", masterDevice);
    if(notArrOrEmptyArr(masterDevice)) return console.log("Master device is not valid");

    /** get input factor reading bdDev_id */
    let factorReadingList = await get_V2InputFactorPaired(masterDevice[0]._id);
    if(notArrOrEmptyArr(factorReadingList)) return console.log("Reading device is not valid");

    /** get reading device info */
    let readingDevice = await getBddevBy_idList([factorReadingList[0].readingBdDev_id]);
    if(notArrOrEmptyArr(readingDevice)) return console.log("Reading device info not valid");
    
    /** parameter */
    /** load from Setting DB, logging time, T2, T1, and T3 ???*/
    let firstStartTime_m_T1 = 15;  // log time for 15 mins
    let LoggingTime_m_T2 = 15;  // log time for 15 mins
    let WaitStableTime_m_T3 = 15;  // log time for 15 mins

    let newAveValue;
    let prevAveValue;
    let controllerOpCode;
    let serReply;
    switch (ctrlTrend) {
        case 1, 6, 7:     // started
            console.log("case 1, 6: ctrlTrend => ", ctrlTrend);
            /** get log interval from DB */
            // let logInterval = C_LogginTime;

            /** log last 15 mins data */
            newAveValue = await logLastIntervalAverage(masterDevice[0]._id, readingDevice[0].type, readingDevice[0]._id, LoggingTime_m_T2, factorReadingList[0].readingKey);
            if(newAveValue.errMsg) return      // error

            /** generate opCode */
            let opCode = await getOpCode(deviceInfo.ht, masterDevice[0]._id, readingDevice[0]._id);
            if(opCode.errMsg) return

            let newOpCode = opCode + 1;
            
            /**log data into DB */
            await v2_insertAppDataLog(deviceInfo.ht, masterDevice[0]._id, readingDevice[0]._id, newAveValue, newOpCode, LoggingTime_m_T2);

            /** send command reply to local controller <---- */
            if(ctrlTrend===1)   serReply = await replyLocalServer(deviceInfo, [newOpCode, 2]);   // op code, trend
            if(ctrlTrend===6)   serReply = await replyLocalServer(deviceInfo, [newOpCode, 8]);   // op code, trend
            if(ctrlTrend===7)   serReply = await replyLocalServer(deviceInfo, [newOpCode, 9]);   // op code, trend
            return serReply;

            break;
        case 2, 3, 8, 9:     // up, dn, search up, search dn
            /** get existing op code from local controller ???*/
            controllerOpCode = localOpCode;

            /** log last 15 mins data */
            newAveValue = await logLastIntervalAverage(masterDevice[0]._id, readingDevice[0].type, readingDevice[0]._id, LoggingTime_m_T2, factorReadingList[0].readingKey);
            if(newAveValue.errMsg) return  console.log("newAveValue.errMsg", newAveValue.errMsg);    // error, log error into err log

            /** get previous data */
            prevAveValue = await getPreAppDataLog(deviceInfo.ht, masterDevice[0]._id, readingDevice[0]._id);
            if(prevAveValue.errMsg) return  console.log("prevAveValue.errMsg", prevAveValue.errMsg);    // error, log error into err log

            /** compare with previous log data */
            console.log("newAveValue :", newAveValue);
            console.log("prevAveValue :", prevAveValue);
            
            if(newAveValue < prevAveValue){ // more saving
                /** design pattern to continue trend */
                serReply = await replyLocalServer(deviceInfo, [controllerOpCode, ctrlTrend]);   // continue current trend
                return serReply;
                // continue this trend
            }else{      
                // close prev Ct and stop
                /** generate new opCode */
                let newOpCode = controllerOpCode+1;

                if(ctrlTrend===2) serReply = await replyLocalServer(deviceInfo, [newOpCode, 4]);   // to UpTrend_RevertStop
                if(ctrlTrend===3) serReply = await replyLocalServer(deviceInfo, [newOpCode, 5]);   // to DnTrend_RevertStop
                if(ctrlTrend===8) serReply = await replyLocalServer(deviceInfo, [newOpCode, 3]);   // to DnTrend
                if(ctrlTrend===9) serReply = await replyLocalServer(deviceInfo, [newOpCode, 2]);   // to UpTrend

                return serReply;
            }
            break;

        case 10:    // stable state

            /** get existing op code from local controller ???*/
            controllerOpCode = localOpCode;
            
            /** get re-tune variable */
            let retuneVarPair = await getRetuneVar_masterbdDevId(masterDevice[0]._id);
            if(notArrOrEmptyArr(retuneVarPair)) {   
                await v2_insertAppErrLog(masterDevice[0]._id, "Re-Tune var pair invalid")  // log err into databaes                
                return  console.log("Re-Tune var pair invalid");
            }

            /** get re-retune device */
            let retuneDevice = await getBddevBy_idList([retuneVarPair[0].retuneVarBdDev_id]);
            if(notArrOrEmptyArr(retuneDevice)) {
                await v2_insertAppErrLog(masterDevice[0]._id, "Re-tune device info not valid")  // log err into databaes                
                return console.log("Re-tune device info not valid");
            }

            /** Check re-tune log  with opCode existing value */
            let retuneLog = await v2_getReTuneVarLog_withOpCode(deviceInfo.ht, masterDevice[0]._id, retuneDevice[0]._id, controllerOpCode);

            /** get retune last data */
            let lastRetuneData = await v2GetBdDevData_lastN(retuneDevice[0].type, retuneDevice[0]._id, 1);
            

            /** get retune value */
            let lastRetuneVar = lastRetuneData[0][retuneVarPair[0].varKey];
            // console.log("lastRetuneVar", lastRetuneVar);

            if(notArrOrEmptyArr(retuneLog)){        // never log before, log into data and skip                
                /** insert into retune log */
                let insertRel = await v2_insertReTuneLog(deviceInfo.ht, masterDevice[0]._id, retuneVarPair[0].retuneVarBdDev_id, lastRetuneVar, controllerOpCode);
                if(!insertRel) {    /** if insert log error, will not reply to local controller */
                    await v2_insertAppErrLog(masterDevice[0]._id, "Insert re-tune log err(DB)")  // log err into databaes                
                    return console.log("Insert re-tune log err(DB)");
                }
                /** send stable state */
                console.log("insertRel", insertRel);
                serReply = await replyLocalServer(deviceInfo, [controllerOpCode, 10]);   // revert and stop
                return serReply;
            }else{      // did log before, check condition
                let {diffBand, aboveSearchUp} = retuneVarPair[0];       
                let aboveBand ;
                
                console.log("Cur Val:", lastRetuneVar);
                console.log("Prev Val:", retuneLog[0].reading);
                console.log("diffBand:", diffBand);
                if(lastRetuneVar > retuneLog[0].reading + diffBand){    // above upper band
                    aboveBand = true;
                }else if (lastRetuneVar < retuneLog[0].reading - diffBand){     // below lower band
                    aboveBand = false;
                }else{  // within range, send stable state
                    serReply = await replyLocalServer(deviceInfo, [controllerOpCode, 10]);   // revert and stop
                    return serReply;
                }

                /**     !(a^b)  a = search up above, b = value above band
                 *      a   b
                 *      1   1   1       value above band, setting is search up above => search up
                 *      1   0   0       value below band, setting is search up above => search dn
                 *      0   1   0       value above band, setting is search dn above => search dn
                 *      0   0   1       value below band, setting is search dn above => search up
                 */

                if(!(aboveSearchUp===1 ^ aboveBand)){     
                    serReply = await replyLocalServer(deviceInfo, [controllerOpCode, 6]);   // search up start
                    return serReply;
                }else{
                    serReply = await replyLocalServer(deviceInfo, [controllerOpCode, 7]);   // search down start
                    return serReply;
                }
            }

            break;

        default:
            break;
    }
}

async function replyLocalServer(deviceInfo, piData){

    let gwId = parseInt(deviceInfo.GwID);
    /** publish fn 3 to node */
    let devDetails={
        devType:deviceInfo.ht,
        id:deviceInfo.hi,
        dir:3,
        fun:deviceInfo.hf, // 101
    }

    let payload ={pi:[...piData]};
    let loraPackage = genLoRaPackage(devDetails, payload, 2);
    // console.log("loraPackage [22] : ", loraPackage);
    if(!loraPackage.error){
        loraPackage.gwid = gwId;
        let _topic=`Gw/ServerCmd/${gwId}`;
        // console.log("loraPackage : ", loraPackage);
        return {
            toPublish:true,
            topic:_topic,
            loraPackage
        }
        // prgMqtt.client.publish(`${_topic}`, loraPackage);
    }
    return
}

async function getPreAppDataLog(masterType, master_id, reading_id){
    let lastData = await v2_getAppDataLog_LastN(masterType, master_id, reading_id, 1);
    if(notArrOrEmptyArr(lastData)){
        let msg = "Get last app data log failed";
        console.log(msg);
        await v2_insertAppErrLog(master_id, msg)  // log err into databaes
        return {errMsg:msg}
    }
    return lastData[0].reading;
}

async function getOpCode(masterType, master_id, reading_id){
    /** generate opCode */
    let lastLog = await v2_getAppDataLog_LastN(masterType, master_id, reading_id, 1);
    if(notArrOrEmptyArr(lastLog)){
        console.log("Failed to generate OpCode / 1st Data");
        let msg = "Failed to generate OpCode";
        await v2_insertAppErrLog(master_id, msg)  // log err into databaes
        return 0
    }
    return lastLog[0].opCode_inc;
}

async function logLastIntervalAverage(master_id, ht, hi, nInterval_m, readingKey){
    /** log last 15 mins data */
    let factorData = await v2GetBdDevData_lastNMin(ht, hi, nInterval_m);  // get last 15 mins data
    if(notArrOrEmptyArr(factorData)) {
        let msg = "Input factor value is empty";
        let logErrRel = await v2_insertAppErrLog(master_id, msg)  // log err into databaes
        console.log(logErrRel);
        return ({errMsg : msg});
    }
    // console.log("factorData", factorData);
    // console.log("log last 15 mins data");
    
    let aveReading = getAverageFromRaw(factorData, readingKey);

    /** log err if ave reading is not valid */
    if(aveReading.errMsg) {
        console.log("aveReading.errMsg");  // log err into databaes
        let logErrRel = await v2_insertAppErrLog(master_id, aveReading.errMsg)  // log err into databaes
        console.log(logErrRel);
        return ({errMsg : aveReading.errMsg});
    }
    return aveReading;
}

function getAverageFromRaw(rawDataArray, key){
    let sum =0;
    let nValidNumber = 0;
    for (const eachData of rawDataArray) {
        let fReading = parseFloat(eachData[key]);
        if(isNaN(fReading)) continue;        
        sum += fReading;
        nValidNumber++;
    }
    if(nValidNumber===0) return {errMsg:"No valid input"};    
    return (sum/nValidNumber);
}

exports.F_CondensorLoopLogic=F_CondensorLoopLogic;