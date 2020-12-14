const moment = require("moment");
// const moment = require("moment-timezone");

getUnixTodayBaseOnTime=(uTime, bOneDayEarlier)=>{
    // console.log(uTime);    
    let dateNow = moment().format("MM/DD/YYYY");
    if(bOneDayEarlier) dateNow = moment().subtract(1, 'days').format("MM/DD/YYYY");
    let startTime = moment(uTime*1000).format("HH:mm:ss");
    // console.log(startTime);
    // let timeToday = `${dateNow} ${startTime}`;
    // console.log(timeToday);
    return moment(`${dateNow} ${startTime}`, "MM/DD/YYYY HH:mm:ss").unix();
}

getTime=(_unix)=>{
    return moment(_unix*1000).tz("Asia/Kuala_Lumpur").format("HH:mm:ss");
    
}

getTimeTz=(_unix)=>{
    return moment(_unix*1000).tz("Asia/Kuala_Lumpur").format("HH:mm:ss Z");
    
}

getDate=(_unix)=>{
    return moment(_unix*1000).tz("Asia/Kuala_Lumpur").format("DD-MM-YYYY");
}

unixNow=()=>{
    return moment().unix();
}

exports.getTimeTz=getTimeTz;
exports.getDate=getDate;
exports.getTime=getTime;
exports.getUnixTodayBaseOnTime = getUnixTodayBaseOnTime;
exports._unixNow = unixNow;