/**
 * Check if 2 gateway send same info together
 * 
 */

const { getAlgoBy_bdDev_id } = require("../MySQL/V2_Reaction/V2_Reaction");
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


async function V2_Reaction(bdDev, lastData){
    try {
        // console.log("V2_Reaction", bdDev);
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