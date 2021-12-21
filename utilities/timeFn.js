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


getWeekNo=()=>{
    let weekNo = moment().tz("Asia/Kuala_Lumpur").isoWeek();
    return weekNo;
}

getYY=()=>{
    let YY = moment().tz("Asia/Kuala_Lumpur").format("YY");
    return YY;
}

intTimeToTime=(nTime)=>{
    let time = moment(`${nTime/100}:${nTime%100}`, "hh:mm").tz("Asia/Kuala_Lumpur");
    return time;
}

momentNow = ()=>{
    return moment().tz("Asia/Kuala_Lumpur");
}


// let tStart = intTimeToTime(1800);
// let tEnd = intTimeToTime(1900);
// // let tTest = intTimeToTime(1200);
// let rel = checkBetweenTime(tStart, tEnd);
// console.log(rel);
// let sTime = intTimeToTime(eachAlgo.starttime);
checkBetweenTime=(tStart, tEnd, tTime)=>{
    let _tStart = tStart;
    let _tEnd = tEnd;
    let bBetween = false;
    if (!tTime) tTime = momentNow();
    if(_tEnd > _tStart){
        bBetween =tTime >= _tStart && tTime < _tEnd;
    }else{      // 1800 ~ 0700 , 1800 ~ 1800
        // console.log("Inverse")
        let bInverseBetween = tTime < _tStart && tTime >= _tEnd;
        bBetween = !bInverseBetween;
    }
    return bBetween;
}

intToDOWSelected=(nDow)=>{
    /** [0] => Sunday */
    let arrDow = [];
    for (let i = 0; i < 7; i++) {        
        let dow = (nDow >> i) %2 === 1 ? true: false;
        // console.log(`[${i}]: ${dow}`);
        arrDow.push(dow);
    }
    return arrDow;
}

getDow_0_6=()=>{
    let dow = momentNow().isoWeekday();
    if(dow===7) return 0;
    return dow
}

exports.checkBetweenTime=checkBetweenTime;
exports.intTimeToTime=intTimeToTime;
exports.intToDOWSelected=intToDOWSelected;
exports.getDow_0_6=getDow_0_6;
exports.momentNow=momentNow;

exports.getYY=getYY;
exports.getWeekNo = getWeekNo;
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