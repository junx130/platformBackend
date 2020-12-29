const { getBuildingDevicesBy_ID } = require("../buildings/buildingDevices");
const { getDataT1ToT2 } = require("../queryData");
const { getOffsetByIdnKey } = require("./offset");

async function getDataT1ToT2_withOffset(database, devType, devID, T1, T2){
    let result = await getDataT1ToT2(database, devType, devID, T1, T2);
    /** Get Building Device */
    let bdDevice = await getBuildingDevicesBy_ID(devID);
    if(!bdDevice[0].devID) return result;

    /**  */
    let devOffset = {type:devType, devID:bdDevice[0].devID};
    // console.log(devOffset);
    let offsetList = await getOffsetByIdnKey(devOffset);
    // console.log("Enter query offset");
    // console.log(offsetList);
    // console.log(result[0]);
    let newDatas = [];
    for (const data of result) {
        let _data = {...data};
        for (const offsetItem of offsetList) {
            if(data.hasOwnProperty(offsetItem.DataKey)){
                // _data[offsetItem.DataKey] += offsetItem.offsetValue;     // previous coding
                let valueAfterOffset = _data[offsetItem.DataKey] + offsetItem.offsetValue;
                _data[offsetItem.DataKey] = valueAfterOffset.tofixed(2);
            }
        }
        newDatas.push(_data);
    }
    return newDatas;

//   return result;
}




exports.getDataT1ToT2_withOffset=getDataT1ToT2_withOffset;