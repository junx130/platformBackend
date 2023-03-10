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

function isEmptyObject(obj){
    for (const key in obj) {
        if (Object.hasOwnProperty.call(obj, key)) {
            return false
        }
    }
    return true;
}

function notEmptyArr(arr){
    if(!Array.isArray(arr)) return false;
    if(arr.length<1) return false;
    return true;
  }

exports.isEmptyObject=isEmptyObject;
exports.notArrOrEmptyArr = notArrOrEmptyArr;
exports.pushUnique=pushUnique;
exports.notEmptyArr=notEmptyArr;