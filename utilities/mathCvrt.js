


function roundDecimalPoint(num, decimalPoint){
    let ePower = (Math.pow(10,decimalPoint));
    if (ePower==0) return num;
    return Math.round((num + Number.EPSILON) * ePower) / ePower;
}

exports.roundDecimalPoint = roundDecimalPoint ;