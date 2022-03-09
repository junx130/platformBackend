function notArrOrEmptyArr(arr){
    return (!Array.isArray(arr) || arr.length<1);
}

function pushUnique(arr, obj){
    // console.log('``````````````arr````````````', arr);
    if(!Array.isArray(arr)) return [];
    let _arr= [...arr];
    let found = arr.find(c=>c===obj);
    // console.log("found", found);
    if(!found) _arr.push(obj);
    return _arr;
}

exports.notArrOrEmptyArr = notArrOrEmptyArr;
exports.pushUnique=pushUnique;