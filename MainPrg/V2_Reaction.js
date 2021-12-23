/**
 * Check if 2 gateway send same info together
 * 
 */

const { getBddevBy_idList } = require("../MySQL/V2_DeviceRecord/v2_SensorOwner");
const { v2GetBdDevData_lastN } = require("../MySQL/V2_QueryData/v2_QueryBdDevData");
const { getAlgoBy_bdDev_id, getGetCondition_byAlgo_id, getForTemplateBy_id, getForVarBy_condi_id } = require("../MySQL/V2_Reaction/V2_Reaction");
const { intTimeToTime, checkBetweenTime, intToDOWSelected, getDow_0_6, momentNow } = require("../utilities/timeFn");

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

async function handleCondi_Var(eachCondi, lastData, newNode){
    /** get bdDev_id */
    try {
        let bdDev= await getBddevBy_idList([eachCondi.input_id]);
        if(!Array.isArray(bdDev) || bdDev.length < 1 ) return   /** not data or not array */
        if(bdDev[0].devID !== lastData.hi) return;  /** incoming data not related to this condition */
        /** get input value */
        let inputVal;
        if(newNode) inputVal = getLastValue_NewNode(lastData, eachCondi.dataKey);
        else{}      // ???
        
        if(!inputVal) return;     /** cannot get input value */
        // console.log(inputVal);
        let sEval = `${inputVal} ${eachCondi.operator} ${eachCondi.setpoint}`
        // console.log(sEval);
        try {
            let bFulfillCondi = Function(`"use strict"; return(${sEval})`)()
            console.log(bFulfillCondi);
            /** pending Logic here, update database ???*/
        } catch (error) {
            return console.log("--- --- V2_Reaction Evaluate Error : ", error.message);            
        }
        return true        
    } catch (error) {
        return console.log("--- --- V2_Reaction handleVarCondi Error : ", error.message);        
    }
}

function notArrOrEmptyArr(arr){
    return (!Array.isArray(arr) || arr.length<1);
}

function getLastValue_NewNode(lastData, dataKey){
    let a_dataKey = dataKey.split('_');
    // console.log(a_dataKey);
    if(!Array.isArray(a_dataKey) || a_dataKey.length!== 2) return;
    return lastData[a_dataKey[0]][a_dataKey[1]];
}
function getLastValue_OldNode(lastData, dataKey){
    // let a_dataKey = dataKey;
    // console.log(a_dataKey);
    // console.log("getLastValue_OldNode lastData: ", lastData);
    // console.log("getLastValue_OldNode dataKey: ", dataKey);
    if(!dataKey) return
    // if(!Array.isArray(a_dataKey) || a_dataKey.length!== 2) return;
    return lastData[dataKey];
}

async function handleCondi_For(eachCondi, lastData, newNode){
    try {
        let forTemplate = await getForTemplateBy_id(eachCondi.input_id);
        if(notArrOrEmptyArr(forTemplate)) return 
        let singleForTemplate = forTemplate[0];
        // console.log(forTemplate);
        let forVar = await getForVarBy_condi_id(eachCondi._id);
        if(notArrOrEmptyArr(forVar)) return 
        // console.log(forVar);
        let varNameList = singleForTemplate.variable.split(",");
        // console.log("varNameList", varNameList);
        if(notArrOrEmptyArr(varNameList)) return 
        let totallyNotRelated = true;
        let arr_var=[];
        for (const eachVar of varNameList) {
            let matchSymbol = forVar.find(c=>c.varSymbol === eachVar);
            /** query or use the latest value */
            console.log("matchSymbol", matchSymbol);
            if(!matchSymbol || !matchSymbol.bddev_id) return     /** cannot found var link */        
            let bdDev= await getBddevBy_idList([matchSymbol.bddev_id]);
            console.log("bdDev", bdDev);
            if(notArrOrEmptyArr(bdDev)) return 
            if(bdDev[0].devID === lastData.hi){     /** last update is realetd to this formula */
                let lastValue;
                if(newNode) lastValue = getLastValue_NewNode(lastData, matchSymbol.dataKey);
                else{ }     // old node    ???
    
                if(!lastValue) return     /** get last var value failed */
    
                arr_var.push({symbol: eachVar, bdDev_id:bdDev[0]._id, type:bdDev[0].type, lastValue, dataKey:matchSymbol.dataKey})
                console.log("Related");
                totallyNotRelated = false;
            }else{      /** last update is not related to this formula */
                arr_var.push({symbol: eachVar, bdDev_id:bdDev[0]._id, type:bdDev[0].type, dataKey:matchSymbol.dataKey})
                console.log("NotRelated");
            }
        }
        console.log("arr_var", arr_var);
        if(totallyNotRelated) return
        /** query each var last value */
        for (const eachVar of arr_var) {
            if(eachVar.lastValue) continue  //  last value already get, no need query
            let {type, bdDev_id} = eachVar;
            let _lastDataArr = await v2GetBdDevData_lastN(type, bdDev_id, 1);
            if(notArrOrEmptyArr(_lastDataArr)) return console.log("--- --- Get Last Value Error");
            let _lastData = _lastDataArr[0];
            console.log("eachVar", eachVar);
            console.log("_lastData", _lastData);

            /** from lastVal[0], get last var value */
            let _lastValue;
            let isNewNode = isNewNode_ByLastData(_lastData);
            if(isNewNode) _lastValue = getLastValue_NewNode(_lastData, eachVar.dataKey);
            else _lastValue = getLastValue_OldNode(_lastData, eachVar.dataKey)     // old node  
            console.log("_lastValue", _lastValue);
            /** complete the arr_var, insert last data into arr_var */
            if(!_lastValue) return      /** data format invalid */
            eachVar.lastValue = _lastValue; /** insert last value into arr_var */
        }
        console.log("new arr_var", arr_var);

        /** evaluate the formula */
        console.log("formula",singleForTemplate.formula); 
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
        console.log("formulaAns", formulaAns);

        console.log("eachCondi", eachCondi);
        let sCondiEval = `${formulaAns} ${eachCondi.operator} ${eachCondi.setpoint}`
        console.log("Formula Eval : ", sCondiEval);
        try {
            let bFulfillCondi = Function(`"use strict"; return(${sCondiEval})`)()
            console.log(bFulfillCondi);     
            /** update condition table database ??? */       
        } catch (error) {
            return console.log("--- --- For Evaluate Error : ", error.message);  
        }
        return true     // false => error, true => provcess OK
    } catch (error) {
        console.log("handleCondi_For Err: ", error.message);
        return
    }
}

async function V2_Reaction(bdDev, lastData, newNode){
    try {
        // console.log("V2_Reaction", bdDev);
        console.log("lastData", lastData);
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

            let bSkipQueryConditionTbl = !ScheActiveNow && eachAlgo.trigRefreshTime >= 0;    /** sche not active, refresh on next day, can skip */
            if(bSkipQueryConditionTbl) continue;
           
            /** query condition list */
            let conditionList = await getGetCondition_byAlgo_id(eachAlgo._id);
            console.log(conditionList);
            
            for (const eachCondi of conditionList) {    /** determine each condition */
                if(eachCondi.inputType===1){        /** Variable */
                    let goodHandling_Var = await handleCondi_Var(eachCondi, lastData, newNode);
                    if(!goodHandling_Var) continue;
                }else{      /** formula */
                    let goodHandling_For= await handleCondi_For(eachCondi, lastData, newNode);
                    if(!goodHandling_For) continue;
                }   
            }

        }

    } catch (error) {
        console.log("****checkNotification Err******");
        console.log(error.message);
    }
};

exports.V2_Reaction=V2_Reaction;
/*
    check V2_ReactTrigAlgo;
        where bdDevInvolve like <bdDev_id>,     // sensor involve

    foreach trigAlgo
        
        check within start end time, return if not fulfill
        within weekly schedule, return if not fulfill

        bRefreshDaily = trigRefreshTime  < 0;
        if (!within){
            if(bRefreshDaily){
                ** check condition, reset fulfillmentCnt if condition not fulfill
            }else{
                continue
            }
        }

        // query each bdDev involve in logic 
        xxxxxxxxxxxxxxxxxxxxxx



        foreach algo
            select V2_ReactCondition where algo_id  = algo._id
            check condition in Condition:
                algo trigmode = rising
                    refresh everyday

                    non refresh everyday



                algo trigmode = always
                    check the ligic





        trigger mode 
            rising 
                refresh everyday


                not refresh everyday

            always
                check condition, if yes, trigger


    data in, get bdDev_id of sensor.
        check on V2_ReactCondition
            input type 1    (variable)
                if fulfillment count > 
                

            input type 2    (Formula)



 */