
function devStrFormat(dev){
    let devName = '';
    if (dev.location) devName = dev.location + '-';
    devName = devName + `${dev.name}[${dev.devID}]`; 
    return devName
}



exports.devStrFormat = devStrFormat;