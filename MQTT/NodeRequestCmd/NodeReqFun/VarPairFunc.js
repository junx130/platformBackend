const { getVarPair } = require("../../../MySQL/V2_Application/V2_ApplicationMysql");
const { getSensorOwnerBy_TydevID, getBddevBy_idList } = require("../../../MySQL/V2_DeviceRecord/v2_SensorOwner");
const { v2GetBdDevData_lastNMin } = require("../../../MySQL/V2_QueryData/v2_QueryBdDevData");
const { notArrOrEmptyArr } = require("../../../utilities/validateFn");

async function F_VarPairHandle(deviceInfo){
    /*
    pf[0] => type
    pf[1] => devID
    pf[2] => pair fnType
    pf[3] => data duration
    pf[4] => data description, min, max, last, first, average
    */
   
    // console.log("Master request paired value");
    // console.log("deviceInfo", deviceInfo);
    let {pi:inPi} = deviceInfo;
    let pairFnType = inPi[2];
    /** get master bdDev_id base on ht and hi */
    let bdDevInfo = await getSensorOwnerBy_TydevID({type:inPi[0], devID:inPi[1]});
    if(notArrOrEmptyArr(bdDevInfo)) return {pairFnType, err:1}
    
    /** get from data info from V2_AppReTuneVarPair */
    let varPairInfo = await getVarPair(bdDevInfo[0]._id, inPi[2]);
    if(notArrOrEmptyArr(varPairInfo)) return {pairFnType, err:2}
    let pairKey = varPairInfo[0].varKey;
    let pairBdDev_id = varPairInfo[0].pairBdDev_id;
    // console.log("pairKey");
    // console.log(pairKey);

    /** get type of pair device */
    let pairDevInfo = await getBddevBy_idList([pairBdDev_id]);
    if(notArrOrEmptyArr(pairDevInfo)) return {pairFnType, err:3}
    // console.log("pairDevInfo");
    // console.log(pairDevInfo);
    let pairType = pairDevInfo[0].type;

    /** get varPair last nMin data*/
    let lastNData = await v2GetBdDevData_lastNMin(pairType, pairBdDev_id, inPi[3]);
    if(notArrOrEmptyArr(lastNData)) return {pairFnType, err:4}
    console.log("lastNData");
    console.log(lastNData);

    /** get the data description base on master request */
    let dataDesc = inPi[4];
    let dataReply = 0;
    if(dataDesc===1){   // min
        let nMin;
        for (let i = 0; i < lastNData.length; i++) {
            if(i===0) {     // 1st loop, set the 1st value as min
                nMin = lastNData[i][pairKey];
            }else{      // 2nd loop onwards, compare and set min if smaller
                if(lastNData[i][pairKey] < nMin) nMin = lastNData[i][pairKey];
            }
        }
        dataReply = nMin;
    }else if(dataDesc===2){   // max
        let nMax;
        for (let i = 0; i < lastNData.length; i++) {
            if(i===0) {     // 1st loop, set the 1st value as min
                nMax = lastNData[i][pairKey];
            }else{      // 2nd loop onwards, compare and set min if smaller
                if(lastNData[i][pairKey] > nMax) nMax = lastNData[i][pairKey];
            }
        }
        dataReply = nMax;
    }else if(dataDesc===3){   // last
        dataReply = lastNData[0][pairKey];
    }else if(dataDesc===4){     // 1st
        dataReply = lastNData[lastNData.length][pairKey];
    }else if(dataDesc===5){     // average
        let sum = 0;
        for (const eachData of lastNData) {
            sum+= eachData[pairKey];
        }
        dataReply = sum/lastNData.length;
    }
    // console.log("dataReply");
    // console.log(dataReply);
    return {dataReply, pairFnType};
}

exports.F_VarPairHandle = F_VarPairHandle;