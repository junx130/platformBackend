function splitSensorKey(sKey){
    let arr = sKey.split('_');    
    let validateFail = 
        !arr[0] || 
        !arr[1] || 
        arr[2] ||
        !(arr[0] === "pb" ||
        arr[0] === "pi" ||
        arr[0] === "pn" ||
        arr[0] === "pf") ||
        isNaN(arr[1]); 

    if (validateFail) 
        return ({
            dataType:sKey,
            dataIndex:-1
        })
    let sensorInfo = {
        dataType : arr[0],
        dataIndex : parseInt(arr[1]),
    }
    return sensorInfo;
}

exports.splitSensorKey=splitSensorKey;