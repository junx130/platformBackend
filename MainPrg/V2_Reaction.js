/**
 * Check if 2 gateway send same info together
 * 
 */

const { getBddevBy_idList } = require("../MySQL/V2_DeviceRecord/v2_SensorOwner");
const { v2GetBdDevData_lastN, v2GetBdDevData_T1_T2 } = require("../MySQL/V2_QueryData/v2_QueryBdDevData");
const { getAlgoBy_bdDev_id, getGetCondition_byAlgo_id, getForTemplateBy_id, getForVarBy_condi_id, setFulfillmentCnt, setForVarFulfillmentCnt } = require("../MySQL/V2_Reaction/V2_Reaction");
const { intTimeToTime, checkBetweenTime, intToDOWSelected, getDow_0_6, momentNow, _unixNow } = require("../utilities/timeFn");
const { cvrtDbKeyToRawKey } = require("./sensorKeyDBKeyMapping");

const dataExpiredTime_s = 600;

function Dow_ActiveNow(tStart, tEnd, dowSche){
    let dow = getDow_0_6();
    let DowSel = intToDOWSelected(dowSche);    
    
    if(tStart >= tEnd && momentNow() < tEnd){          // use yesterday schedule
        dow--;
        if(dow<0) dow=6;
    }
    return DowSel[dow];
}

function isNewNode_ByLastData(lastData){
    /**  */
    if(!lastData.hasOwnProperty('ht')) return
    if(!lastData.hasOwnProperty('hi')) return
    if(!lastData.hasOwnProperty('hs')) return
    if(!lastData.hasOwnProperty('hd')) return
    if(!lastData.hasOwnProperty('hf')) return
    if(!lastData.hasOwnProperty('hbs')) return
    if(!lastData.hasOwnProperty('hfs')) return
    if(!lastData.hasOwnProperty('his')) return
    if(!lastData.hasOwnProperty('hns')) return
    if(!lastData.hasOwnProperty('ft')) return
    if(!lastData.hasOwnProperty('fc')) return
    if(lastData.hasOwnProperty('type')) return true
    return true
    // if(lastData.type > 0 && lastData.type < 5) return false;
    // if(lastData.type >= 1001 && lastData.type <= 1002) return false;
    // return true
}

function isNewNode_ByDbData(lastDbData){
    /**  */
    console.log(lastDbData);
    let {type} = lastDbData;
    if(type > 0 && type < 5) return false
    if(type>=1001 &&  type <= 1002) return false
    return true
    // if(lastData.type > 0 && lastData.type < 5) return false;
    // if(lastData.type >= 1001 && lastData.type <= 1002) return false;
    // return true
}



function notArrOrEmptyArr(arr){
    return (!Array.isArray(arr) || arr.length<1);
}

function getLastValue_NewNode(lastData, dataKey){
    // console.log("lastData", lastData);
    // console.log("dataKey", dataKey);
    let a_dataKey = dataKey.split('_');
    // console.log(a_dataKey);
    if(!Array.isArray(a_dataKey) || a_dataKey.length!== 2) return;
    return lastData[a_dataKey[0]][a_dataKey[1]];
}

function getLastValue_DbForm(lastDbData, dataKey){
    if(!dataKey) return;
    return lastDbData[dataKey];
}

function getLastValue_OldNode(lastData, dataKey){
    // console.log("dataKey", dataKey);
    let lastInfo = getDevId_fromLastData(lastData);
    if(!dataKey) return
    let cvrtKey = cvrtDbKeyToRawKey(lastInfo.ht, dataKey);
    // console.log("cvrtKey", cvrtKey);
    if(!cvrtKey) return
    // console.log("Value: ", lastData[cvrtKey]);
    return lastData[cvrtKey];
}

async function increaseConditionFulfillCnt_Var(eachCondi){
    let fulfillCnt = eachCondi.fulfillmentCnt;
    fulfillCnt++;   // 4
    if(fulfillCnt > eachCondi.occurBuffer+1) {      /** more than max +1, set to max + 1 */
        fulfillCnt = eachCondi.occurBuffer+1;
    }
    await setFulfillmentCnt(eachCondi._id, fulfillCnt);    
}
async function clearConditionFulfillCnt_Var(eachCondi){
    await setFulfillmentCnt(eachCondi._id, 0);    
}

async function increaseConditionFulfillCnt_For(condi_id){
    let forVarList = await getForVarBy_condi_id(condi_id);
    let minCnt = 0;
    for (const eachVar of forVarList) {
        if(minCnt<=0){
            minCnt = eachVar.fulfillmentCnt;  
        } else{
            if(eachVar.fulfillmentCnt < minCnt) minCnt=eachVar.fulfillmentCnt;
        }        
    }
    await setFulfillmentCnt(condi_id, minCnt);    
}

async function increaseForVarFulfillCnt(condi_id, bdDev_id, arr_var, occurBuffer){
    let varList_curBdDev = arr_var.filter(c=>c.bdDev_id === bdDev_id);
    // console.log("varList_curBdDev", varList_curBdDev);
    let lowestFulfillCnt = 0;
    for (const eachVar of varList_curBdDev) {
        if(lowestFulfillCnt<=0) lowestFulfillCnt= eachVar.fulfillCnt;
        else if (eachVar.fulfillCnt < lowestFulfillCnt) lowestFulfillCnt = eachVar.fulfillCnt;        
    }

    lowestFulfillCnt++; //increase the fulfill count
    if(lowestFulfillCnt > occurBuffer+1)  return    // skip update
    /** update each db  for each formula var */
    await setForVarFulfillmentCnt(condi_id, bdDev_id, lowestFulfillCnt);
}

async function clearForVarFulfillCnt(condi_id, bdDev_id){
    /** update each db  for each formula var */
    await setForVarFulfillmentCnt(condi_id, bdDev_id, 0);
}

function getDevId_fromLastData(lastData){
    let isNewNode = isNewNode_ByLastData(lastData);
    if(isNewNode)  return {hi: lastData.hi, ht: lastData.ht}
    return {hi: lastData.ID, ht: lastData.Ty}
}


async function handleCondi_Var(eachCondi, lastData, ScheActiveNow){
    /** get bdDev_id */
    try {
        // console.log("handleCondi_Var last data : ", lastData );
        let isNewNode = isNewNode_ByLastData(lastData);
        let bdDev= await getBddevBy_idList([eachCondi.input_id]);
        if(!Array.isArray(bdDev) || bdDev.length < 1 && isNewNode) return {errMsg:"not data or not array"}/** not data or not array */
        // console.log(bdDev[0]);
        let lastInfo = getDevId_fromLastData(lastData);
        if(bdDev[0].devID !== lastInfo.hi || bdDev[0].type !== lastInfo.ht) return {errMsg:"not related"};  /** incoming data not related to this condition */
        
        /** get input value */
        let inputVal;
        if(isNewNode) inputVal = getLastValue_NewNode(lastData, eachCondi.dataKey);
        else inputVal = getLastValue_OldNode(lastData, eachCondi.dataKey)     // old node  
        
        if(!inputVal) return {errMsg:"no input value"};     /** cannot get input value */
        // console.log(inputVal);
        /** handle operator(Variable) here ??? */
        // console.log("Type of : ", typeof(eachCondi.operator));
        if(typeof(eachCondi.operator) !== "string") return {errMsg:"Operator Not Valid"}
        let grdFound = eachCondi.operator.indexOf("grd");
        // console.log("grdFound", grdFound)
        let sEval="";
        if(grdFound<0){     // normal operator
            sEval = `${inputVal} ${eachCondi.operator} ${eachCondi.setpoint}`
            console.log("Var Eval : ", sEval);
            try {
                let bFulfillCondi = Function(`"use strict"; return(${sEval})`)()
                // console.log(bFulfillCondi);
                if(bFulfillCondi){
                    if(ScheActiveNow){
                        await increaseConditionFulfillCnt_Var(eachCondi);
                        return {bTrig:true};
                    }
                }else{
                    await clearConditionFulfillCnt_Var(eachCondi);
                }
                // return {bFulfilled:bFulfillCondi}
            } catch (error) {
                console.log("--- --- V2_Reaction Evaluate Error : ", error.message);            
                return {errMsg:"exc err"}
            }
        }else{          /** gradient changes handle */
            let a_ope=eachCondi.operator.split('_');
            console.log(a_ope); // [ 'grd', 'inc', 'P' ]
            if(a_ope[0]==="grd"){            
                /** get last value of <eachCondi.gradientDuration> time */   
                let aData_LastNMin = await v2GetBdDevData_T1_T2(lastInfo.ht, bdDev[0]._id, _unixNow()-(eachCondi.gradientDuration*60), _unixNow());
                // console.log("setpoint",eachCondi.setpoint );
                // console.log("aData_LastNMin", aData_LastNMin );
                let boundlyVal=0; 
                if(a_ope[2]==="P" && a_ope[1]==="inc")  {
                    boundlyVal = inputVal/(1+(eachCondi.setpoint/100));
                }
                if(a_ope[2]==="P" && a_ope[1]==="dec")  {
                    if(eachCondi.setpoint > 100 ) return {errMsg:"Dec set point over"}
                    if(eachCondi.setpoint === 100 ) boundlyVal=0;
                    else boundlyVal = inputVal/(1-(eachCondi.setpoint/100));
                }
                if(a_ope[2]==="V" && a_ope[1]==="inc")  {
                    boundlyVal=inputVal-eachCondi.setpoint;
                }
                if(a_ope[2]==="V" && a_ope[1]==="dec")  {
                    boundlyVal=inputVal+eachCondi.setpoint;
                }
                
                console.log("inputVal", inputVal );
                console.log("boundlyVal", boundlyVal );
                // console.log("eachCondi.dataKey", eachCondi.dataKey );

                let foundOverBoundary;
                if(a_ope[1]==="inc"){
                    foundOverBoundary = aData_LastNMin.find(c=>c[eachCondi.dataKey]<=boundlyVal)
                }else if(a_ope[1]==="dec"){
                    foundOverBoundary = aData_LastNMin.find(c=>c[eachCondi.dataKey]>=boundlyVal)
                }
                // console.log("foundOverBoundary", foundOverBoundary);
                if(foundOverBoundary) {
                    /** there are some condition fulfilled, increase the counter */
                    await increaseConditionFulfillCnt_Var(eachCondi);
                    return {bTrig:true};
                }else{
                    await clearConditionFulfillCnt_Var(eachCondi);
                }
            }
        }
        return true        
    } catch (error) {
        console.log("--- --- V2_Reaction handleVarCondi Error : ", error.message);        
        return {errMsg:"exc err"}
    }
}

async function handleCondi_For(eachCondi, lastData, ScheActiveNow){
    try {
        let forTemplate = await getForTemplateBy_id(eachCondi.input_id);
        if(notArrOrEmptyArr(forTemplate)) return console.log("Empty formula Template");
        let singleForTemplate = forTemplate[0];
        let forVar = await getForVarBy_condi_id(eachCondi._id);
        // console.log("forVar", forVar);
        if(notArrOrEmptyArr(forVar)) return console.log("Empty formula Var");
        // console.log(forVar);
        let varNameList = singleForTemplate.variable.split(",");
        // console.log("varNameList", varNameList);
        if(notArrOrEmptyArr(varNameList)) return console.log("Empty Var Variable");
        let totallyNotRelated = true;
        let arr_var=[];

        let dataInBdDev_id=null;    // bdDev_id for data in sensor

        for (const eachVar of varNameList) {
            let matchSymbol = forVar.find(c=>c.varSymbol === eachVar);
            /** query or use the latest value */
            // console.log("matchSymbol", matchSymbol);
            if(!matchSymbol || !matchSymbol.bddev_id) return     /** cannot found var link */        
            let bdDev= await getBddevBy_idList([matchSymbol.bddev_id]);
            // console.log("bdDev", bdDev);
            if(notArrOrEmptyArr(bdDev)) return 

            let tempVar = {symbol: eachVar, bdDev_id:bdDev[0]._id, type:bdDev[0].type, dataKey:matchSymbol.dataKey, fulfillCnt : matchSymbol.fulfillmentCnt};
            let lastInfo = getDevId_fromLastData(lastData);
            // console.log("lastInfo",lastInfo);
            if(bdDev[0].devID === lastInfo.hi){     /** last update is realetd to this formula */
                dataInBdDev_id = bdDev[0]._id;
                let isNewNode = isNewNode_ByLastData(lastData);
                let lastValue;
                if(isNewNode) lastValue = getLastValue_NewNode(lastData, matchSymbol.dataKey);
                else lastValue = getLastValue_OldNode(lastData, matchSymbol.dataKey)     // old node  
    
                if(!lastValue) return     /** get last var value failed */
                tempVar.lastValue = lastValue;
                // arr_var.push({symbol: eachVar, bdDev_id:bdDev[0]._id, type:bdDev[0].type, lastValue, dataKey:matchSymbol.dataKey, fulfillCnt : matchSymbol.fulfillmentCnt})
                // console.log("Related");
                totallyNotRelated = false;
            }
            // else{      /** last update is not related to this formula */
            //     arr_var.push({symbol: eachVar, bdDev_id:bdDev[0]._id, type:bdDev[0].type, dataKey:matchSymbol.dataKey, fulfillCnt : matchSymbol.fulfillmentCnt})
            //     console.log("NotRelated");
            // }
            arr_var.push(tempVar);
        }
        // console.log("arr_var", arr_var);
        if(totallyNotRelated) return
        /** query each var last value */
        for (const eachVar of arr_var) {
            if(eachVar.lastValue) continue  //  last value already get, no need query
            let {type, bdDev_id} = eachVar;
            /** query other variable not in this update sensor */
            let _lastDataArr = await v2GetBdDevData_lastN(type, bdDev_id, 1);
            if(notArrOrEmptyArr(_lastDataArr)) return console.log("--- --- Get Last Value Error");
            let lastDbData = _lastDataArr[0];

            // console.log("eachVar", eachVar);
            // console.log("_lastData", _lastData);
            if( _unixNow() - lastDbData.unix > dataExpiredTime_s) return console.log(`Other Sensor Data Expired`);
            /** from lastVal[0], get last var value */
            
            /** no matter old or new node, method to get value is same */
            let _lastValue = getLastValue_DbForm(lastDbData, eachVar.dataKey);
            /** complete the arr_var, insert last data into arr_var */
            if(!_lastValue) return      /** data format invalid */
            eachVar.lastValue = _lastValue; /** insert last value into arr_var */
        }
        // console.log("new arr_var", arr_var);

        /** evaluate the formula */
        // console.log("formula",singleForTemplate.formula); 
        let sEval = singleForTemplate.formula;
        let x=1; let y=1; let z=1; let a=1; let b=1; let c=1;

        for (const eachForVar of arr_var) {
            // eachForVar.symbol = eachForVar.lastValue
            if(!eachForVar.symbol) return
            switch (eachForVar.symbol) {
                case "a": a = eachForVar.lastValue; break;
                case "b": b = eachForVar.lastValue; break;
                case "c": c = eachForVar.lastValue; break;
                case "x": x = eachForVar.lastValue; break;
                case "y": y = eachForVar.lastValue; break;
                case "z": z = eachForVar.lastValue; break;       
            }
        }

        let calcFn = new Function("x", "y", "z", "a", "b", "c", `return (${sEval})`);
        let formulaAns = calcFn(x,y,z,a,b,c);
        // console.log("formulaAns", formulaAns);
        // console.log("eachCondi", eachCondi);
        /** handle operator(formula) here ??? */
        let sCondiEval = `${formulaAns} ${eachCondi.operator} ${eachCondi.setpoint}`
        console.log("Formula Eval : ", sCondiEval);
        try {
            let bFulfillCondi = Function(`"use strict"; return(${sCondiEval})`)()
            // console.log(bFulfillCondi);         
            // console.log("ScheActiveNow", ScheActiveNow);   
            if(bFulfillCondi) {     /** condition pass */
                if(ScheActiveNow){
                    await increaseForVarFulfillCnt(eachCondi._id, dataInBdDev_id, arr_var, eachCondi.occurBuffer);                    
                    await increaseConditionFulfillCnt_For(eachCondi._id);                    
                    return {bTrig:true};
                }
            }else{      /** condition failed */
                await clearForVarFulfillCnt(eachCondi._id, dataInBdDev_id); // clear for var table
                await clearConditionFulfillCnt_Var(eachCondi);          // clear condi table         
            }
            return false
        } catch (error) {
            return console.log("--- --- For Evaluate Error : ", error.message);  
        }
        // return true     // false => error, true => provcess OK
    } catch (error) {
        console.log("handleCondi_For Err: ", error.message);
        return
    }
}

async function EvaluateAlgo(eachAlgo, updatedCondiList){
    // updatedCondiList=["A", "B"]
    let condiList = await getGetCondition_byAlgo_id(eachAlgo._id);
    if(notArrOrEmptyArr(condiList)) return;

    let bTrigAllow=false;
    
    // let A=false; let B=false; let C=false; let X=false; let Y=false; let Z=false;
    let AlgoStatus={
        A:false,
        B:false,
        C:false,
        X:false,
        Y:false,
        Z:false,
    }

    for (const eachCondi of condiList) {
        let currCondiInvolve = updatedCondiList.find(c=>c===eachCondi.condIdx);
        
        if(eachAlgo.triggerMode === 0 || eachAlgo.triggerMode === 2){     /** Rising tirgger mode and trigger once mode */ 
            if(eachCondi.occurBuffer === eachCondi.fulfillmentCnt){
                if(currCondiInvolve) bTrigAllow = true;   /** Occur Buffer = 2, Prevent 3, 3(new in), 2 false alarm*/ 
            }
            /** bug here, if C keep at occurBuffer value, A / B keep come in, will trigger Action also ??? Test 33(new)2 bug*/
        }else if(eachAlgo.triggerMode === 1){   // always trigger mode
            bTrigAllow = true;      
        }
        
        AlgoStatus[eachCondi.condIdx] = eachCondi.fulfillmentCnt >= eachCondi.occurBuffer;        
    }

    console.log('AlgoStatus', AlgoStatus);
    /** evaluate Algo logic */
    try {
        let {A, B, C, X, Y, Z} = AlgoStatus;
        let algoEval = eachAlgo.algo;
        let calcFn = new Function("A", "B", "C", "X", "Y", "Z", `return (${algoEval})`);
        let bAlgoFulfill = calcFn(A, B, C, X, Y, Z);
        console.log(`${algoEval}: ${bAlgoFulfill}`);
        return {bTrigAction : bAlgoFulfill && bTrigAllow};
    } catch (error) {
        console.log("Evaluate Algo Logic Err: ", error.message);
        return
    }
}

async function V2_Reaction(bdDev, lastData){
    try {
        // console.log("lastData", lastData);
        /** check whether sensor involve in trig */
        let algoList = await getAlgoBy_bdDev_id(bdDev._id);
        // console.log("algoList", algoList);
        for (const eachAlgo of algoList) {
            let tStart = intTimeToTime(eachAlgo.starttime);
            let tEnd = intTimeToTime(eachAlgo.endtime);
               
            let timeInBeween = checkBetweenTime(tStart, tEnd);      /** check within time */         
            // console.log("inBeween", timeInBeween);            
            let weekScheActive = Dow_ActiveNow(tStart, tEnd, eachAlgo.repeatWeekly);    /** check weekly schedule active */
            // console.log("weekScheActive", weekScheActive);
            let ScheActiveNow = timeInBeween && weekScheActive;     /** schedule currently is active */
            // console.log("ScheActiveNow", ScheActiveNow);
            let bRefreshDaily = eachAlgo.trigRefreshTime >= 0;

            /** sche not active, refresh on next day, can skip */
            let bSkipQueryConditionTbl = !ScheActiveNow && bRefreshDaily;    
            if(bSkipQueryConditionTbl) continue;
            
            /** Skip check for => Once a day, within time, (refresh daily no matter yes / no, will skip) */
            if(eachAlgo.triggerMode===2 && ScheActiveNow ){
                /** check if trigger today before, skip check logic */
                let todayR_TrigBefore = checkBetweenTime(tStart, tEnd, eachAlgo.lastTriggeredUnix);
                if(todayR_TrigBefore) continue;
            }            
           
            /** query condition list */
            let updatedCondiList=[];
            let conditionList = await getGetCondition_byAlgo_id(eachAlgo._id);
            // console.log("conditionList", conditionList);
            let bCheckAlgoNeeded = false;
            for (const eachCondi of conditionList) {    /** determine each condition */
                let checkCondi;
                if(eachCondi.inputType===1){        /** Variable */
                    checkCondi = await handleCondi_Var(eachCondi, lastData, ScheActiveNow);
                    if(!checkCondi || checkCondi.errMsg) continue;
                    if(checkCondi.bTrig) updatedCondiList.push(eachCondi.condIdx);
                }else{      /** formula */
                    checkCondi= await handleCondi_For(eachCondi, lastData, ScheActiveNow);
                    if(!checkCondi || checkCondi.errMsg) continue;
                    if(checkCondi.bTrig) updatedCondiList.push(eachCondi.condIdx);
                }   
                // console.log(checkCondi);
                if(checkCondi.bTrig)    bCheckAlgoNeeded=true;
            }

            /** check algo  */
            console.log("Check Algo needed: ", bCheckAlgoNeeded);
            if(!bCheckAlgoNeeded) continue

            let objTrigAction = await EvaluateAlgo(eachAlgo, updatedCondiList);
            if(!objTrigAction) return console.log("Evaluate Algo Error");
            console.log("Trigger Action : ", objTrigAction.bTrigAction); 

            /** Trigger Action */
            
        }
    } catch (error) {
        console.log("****checkNotification Err******");
        console.log(error.message);
    }
};

exports.V2_Reaction=V2_Reaction;
