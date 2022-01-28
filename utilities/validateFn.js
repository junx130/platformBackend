function notArrOrEmptyArr(arr){
    return (!Array.isArray(arr) || arr.length<1);
}

exports.notArrOrEmptyArr = notArrOrEmptyArr;