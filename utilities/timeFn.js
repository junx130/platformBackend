const moment = require("moment");
// const moment = require("moment-timezone");

getUnixTodayBaseOnTime=(uTime, bOneDayEarlier)=>{
    // console.log(uTime);    
    let dateNow = moment().tz("Asia/Kuala_Lumpur").format("MM/DD/YYYY");
    if(bOneDayEarlier) dateNow = moment().tz("Asia/Kuala_Lumpur").subtract(1, 'days').format("MM/DD/YYYY");
    let startTime = moment(uTime*1000).tz("Asia/Kuala_Lumpur").format("HH:mm:ss");
    // console.log(startTime);
    // console.log("!!!!!!!!!!!!!!!!!!!!");
    // let timeToday = `${dateNow} ${startTime}`;
    // console.log(timeToday);
    return moment(`${dateNow} ${startTime}`, "MM/DD/YYYY HH:mm:ss").tz("Asia/Kuala_Lumpur").unix();
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
    return moment().tz("Asia/Kuala_Lumpur").unix();
}

getUnixNowForCRC=()=>{
    return (moment().unix() - 1600000000);
}


getFmtTime=()=>{
    let time = moment().tz("Asia/Kuala_Lumpur");
    let h = time.hour()*10000 + time.minute()*100 + time.second();
    return h;
}

fShiftUnixToEndTime=(_Unix, fmtTime)=>{
    let tTime = moment(_Unix*1000).tz("Asia/Kuala_Lumpur");
    let trigUnix = moment(_Unix*1000).tz("Asia/Kuala_Lumpur");
    let _h = fmtTime/10000;
    let _m = (fmtTime%10000)/100;
    let _s = fmtTime%100;
    tTime.hour(_h);
    tTime.minute(_m);
    tTime.second(_s);
    // console.log(tTime);
    // console.log("Hello");
    // console.log(trigUnix);
    // console.log(tTime);
    if (trigUnix > tTime) return tTime.add(1, 'days');
    return tTime.unix();
}

fGetTimeDiff_InDTMS=(_start, _end)=>{
    let start ;
    let end ;
    if(_start > _end){
        start = _end;
        end = _start;
    }else{
        start = _start;
        end = _end;
    }
    if(start == null) return "inf";
    let tDiff = end - start;
    let sTime = '';
    let _d = parseInt(tDiff/86400);
    let _remain = tDiff%86400;
    let _h = parseInt((_remain)/3600);
    _remain = _remain%3600;
    let _m = parseInt((_remain/60));
    _remain = _remain%60;
    let _s = _remain;

    if (_d>0) sTime = `${_d}day `;
    // if (_d>1) sTime = sTime+`${_d}days `;
    if (_h>0) sTime = sTime+`${_h}hour `;
    if (_m>0) sTime = sTime+`${_m}min `;
    if(sTime ==='') sTime = '1min';
    // if (_s>0) sTime = sTime+`${_s}s `;
    // console.log(sTime);
    return sTime

}


fFmtTimeToUnixToday=(fmtTime)=>{
    let tTime = moment(unixNow()*1000).tz("Asia/Kuala_Lumpur");
    let _h = 0;
    let _m = 0;
    let _s = 0;
    if (fmtTime!==240000){
        _h = parseInt(fmtTime/10000);
        _m = parseInt((fmtTime%10000)/100);
        _s = parseInt(fmtTime%100);
        // console.log(fmtTime);
        // console.log(`_h:${_h}`);
        // console.log(`_m:${_m}`);
        // console.log(`_s:${_s}`);
    }
    // console.log(`tTime:${tTime}`);
    tTime.hour(_h);
    tTime.minute(_m);
    tTime.second(_s);
    if(fmtTime!==240000) return tTime.unix(); 
    return tTime.add(1, 'days').unix();
}

fUnixOneDayEarlier=(unix)=>{
    let tTime = moment(unix*1000).tz("Asia/Kuala_Lumpur");
    // console.log(tTime);
    return tTime.subtract(1, 'days').unix();
}

exports.fUnixOneDayEarlier=fUnixOneDayEarlier;
exports.fFmtTimeToUnixToday =fFmtTimeToUnixToday;
exports.getUnixNowForCRC=getUnixNowForCRC;
exports.fGetTimeDiff_InDTMS=fGetTimeDiff_InDTMS;
exports.fShiftUnixToEndTime =fShiftUnixToEndTime;
exports.getFmtTime=getFmtTime;
exports.getTimeTz=getTimeTz;
exports.getDate=getDate;
exports.getTime=getTime;
exports.getUnixTodayBaseOnTime = getUnixTodayBaseOnTime;
exports._unixNow = unixNow;