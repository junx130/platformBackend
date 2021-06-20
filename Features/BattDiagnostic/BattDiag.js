const { getNDataAfterT, getLastNData } = require("../../MySQL/queryData");
const { _unixNow } = require("../../utilities/timeFn");


async function battDiagnostic(devList, aveCnt, nPeriod_s){
    try {
        console.log("Coming in");
        let diagResultTable = [];
        let diagResult = {
            preUnix:0,
            preBattAve:0,
            curUnix:0,
            curBattAve:0
        }
        for (const dev of devList) {
            /** Get last time info, do average*/
            let preDatas = await getNDataAfterT("Buildings", dev.type, dev._id, (_unixNow() - nPeriod_s), aveCnt);
            // if(!preDatas || !preDatas[0]){  // sensor didnt publish to server before
            //     diagResultTable.push({
            //         preBattAve : 0,
            //         preUnix:_unixNow(),
            //         // curBattAve : 0,
            //         // curUnix:_unixNow(),
            //         _id : dev._id,
            //     });
            //     continue;
            // }

            let Sum=0;
            for (const item of preDatas) {
                Sum+=item.battVoltage;
            }
            // for (let index = 0; index < preDatas.length; index++) {
            //     Sum+=preDatas[index].battVoltage;
            // }
            if(!preDatas || !preDatas[0]){
                diagResult.preBattAve = 0;
                diagResult.preUnix=_unixNow();  
            }else{
                diagResult.preBattAve = Sum/preDatas.length;
                diagResult.preUnix=preDatas[0].unix;                
            }
            
            /** Get curr time info, do average*/
            let curDatas = await getLastNData("Buildings", dev.type, dev._id, aveCnt);
            Sum = 0;
            for (const item of curDatas) {
                Sum += item.battVoltage;
            }
            // for (let index = 0; index < curDatas.length; index++) {
            //     Sum += curDatas[index].battVoltage;
            // }
            if(!curDatas || !curDatas[0]){
                diagResult.curBattAve = 0;
                diagResult.curUnix=_unixNow();  
            }else{
                diagResult.curBattAve = Sum/curDatas.length;
                diagResult.curUnix=curDatas[0].unix;
            }

            diagResult._id = dev._id;
            // if(diagResult.preUnix > diagResult.curUnix) {      // device disconnected long time
            //     /** modify here, to show latest connected voltage */
            //     // diagResult.curUnix= _unixNow();  
            //     // diagResult.curBattAve=null;
            // }
            // console.log(diagResult);
            diagResultTable.push({...diagResult});
        }
        // console.log(diagResultTable);
        return diagResultTable;        
    } catch (error) {
        console.log(error.message);
        return {error:true};
    }
}

exports.battDiagnostic = battDiagnostic;