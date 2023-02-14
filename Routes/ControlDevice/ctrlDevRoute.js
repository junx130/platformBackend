const express = require("express");
const { setFeedbackDevice, getFeedbackDeviceMap,getNFeedbackDevFromX,getTotalItemCountFn } = require("../../ControlDevice/updateFeebackMap");
const router = express.Router();
const auth = require("../../Middleware/auth");
const { aws_publishMqtt, aws_subscribeTopic, aws_expClient, aws_unsubscribeTopic } = require("../../MQTT/AwsMqttBroker");
const { publishMqtt, subscribeTopic, expClient, unsubscribeTopic} = require("../../MQTT/koalaMqtt");
const { V2_InsertCrlCmdLog, V2_updateCrlCmdLog, V2_getUnprocessCrlCmdLog_bySubTopic, V2_updateCrlCmdLogBy_id, V2_getCmdLog, V2_getSchedule, V2_updateDevSchedule, V2_getSchedule_includeUnUse, V2_addDevSchedule, V2_devSche_SetUnUse, V2_getUnprocessSlaveCrlCmdLog_bySubTopic, V2_updateSlaveCtrlCmdLog } = require("../../MySQL/V2_Control/V2_Control");
const { ioEmit } = require("../../MainPrg/Prg_SocketIo");
const { notArrOrEmptyArr } = require("../../utilities/validateFn");


let httpResponse;
let subTopic;
let nodeType;
let _nodeID;
let nodeFunction;

function clearCommonVar(){
    subTopic = undefined;
    nodeType = undefined;
    _nodeID = undefined;
    nodeFunction = undefined;
}

// version 2 control, use AWS Mosquitto MQTT 
aws_expClient.on("message", async (topic, message) => {
    let G_MEssage;
    let G_JsonForm;
    try {
        // console.log("Message Lai Liao");
        const a_topic = topic.split("/");
        // console.log(a_topic);
        G_MEssage=message;
        let mqttMsg = JSON.parse(message);
        G_JsonForm = mqttMsg;
        if(a_topic[0]===`Gw`){
            let subTopic = `${a_topic[0]}/+/${a_topic[2]}`;
            let gwid = parseInt(a_topic[2]);
            if(a_topic[1]==='GwAck'){     /** ack by Gw once get command */ 
                // update GwAck => true in DB
                let updateRel = await V2_updateCrlCmdLog(mqttMsg, gwid, subTopic, "GwAck", 1, false, false);
                // console.log("Gw Update: ",updateRel);                
    
            }else if(a_topic[1]==='NodeAck'){    /** Gw ack after get LoRaReply from Node */
                // update NodeAck => true in DB
                let updateRel = await V2_updateCrlCmdLog(mqttMsg, gwid, subTopic, "NodeAck", 1, false, true);
                // console.log("Node Update: ",updateRel);   
                // un subscribe base on topic stored in DB     
                /** node control */
                let unprocessCmdLog = await V2_getUnprocessCrlCmdLog_bySubTopic(subTopic);      // get within 1 mins before
                // console.log("unprocessCmd Cnt", unprocessCmdLog.length);

                /** slave control */
                let unprocessSlaveCmLog = await V2_getUnprocessSlaveCrlCmdLog_bySubTopic(subTopic);      // get within 1 mins before
                // console.log("unprocessSlaveCmLog", unprocessSlaveCmLog);
                if(unprocessCmdLog.length === 0 && unprocessSlaveCmLog.length === 0) {  // this is only active command log
                    // let setProcessed = await V2_updateCrlCmdLogBy_id(recentCmdLog[0]._id, "Processed", 1, false);
                    // console.log("Unsubsribe To (Node): ",subTopic);   
                    aws_unsubscribeTopic(subTopic);
                }
                
                /** do not emit if ctrlType is slave control */
                // console.log("mqttMsg", mqttMsg);
                let logInfo = {...mqttMsg};
                logInfo.gwid = gwid;
                let cmdLog = await V2_getCmdLog(logInfo);
                // console.log("cmdLog", cmdLog);                
                if(notArrOrEmptyArr(cmdLog)) return console.log("aws_expClient NodeAck Err: No log found");
                if(cmdLog[0].ctrlType===1) return;
                // console.log("ioEmit : ", mqttMsg)
                ioEmit("v2_CtrlCmd", mqttMsg);      // update to frontend

                
                // httpResponse.status(200).send(deviceInfo);   // response to frontend
                
            } else if(a_topic[1]==='SlaveAck'){  /** slave reply to server */
                /** node control */
                let updateRel = await V2_updateSlaveCtrlCmdLog(mqttMsg, gwid, subTopic, "SlaveAck", 1, false, true);
                let unprocessCmdLog = await V2_getUnprocessCrlCmdLog_bySubTopic(subTopic);      // get within 1 mins before

                /** slave control */
                let unprocessSlaveCmLog = await V2_getUnprocessSlaveCrlCmdLog_bySubTopic(subTopic);      // get within 1 mins before

                if(unprocessCmdLog.length === 0 && unprocessSlaveCmLog.length === 0) {  // this is only active command log
                    // let setProcessed = await V2_updateCrlCmdLogBy_id(recentCmdLog[0]._id, "Processed", 1, false);
                    // console.log("Unsubsribe To (Slave): ",subTopic);   
                    aws_unsubscribeTopic(subTopic);
                }
                let newMqttInfo = {ctrlType : 1, ...mqttMsg}
                // console.log("ioEmit : ", newMqttInfo)
                ioEmit("v2_CtrlCmd", newMqttInfo);      // update to frontend

            }
        }
               
    } catch (error) {
        console.log("MQTT cmd Subscribe Err: ",error.message);
        console.log("G_MEssage", G_MEssage);
        console.log("G_JsonForm", G_JsonForm);
    }
});

// version 1 control, use CloudMQTT 
expClient.on("message", async (topic, message) => {
    // console.log("Message Lai Liao");
    const a_topic = topic.split("/");
    // console.log(a_topic);
    if(a_topic[0]===`Aplouds` &&
        a_topic[1]===`NodeReply` ){
            // console.log("Topic match");
            let deviceInfo = JSON.parse(message);
            if(nodeType && _nodeID && nodeFunction && 
                deviceInfo.ht == nodeType && deviceInfo.hi == _nodeID && 
                deviceInfo.hd == 3 && deviceInfo.hf == nodeFunction ){
                if(httpResponse){
                    // console.log(deviceInfo);                
                    httpResponse.status(200).send(deviceInfo);
                    // console.log(`Success, Unsubcribe ${subTopic}`);                
                    if(subTopic) unsubscribeTopic(subTopic);
                    clearTimeout(timer);
                    clearCommonVar();
                }
            }
    }
});


router.post("/setctrldev", auth, async (req, res) => {  
    // console.log('````````````Come in`````````````````');  
    try {
        
        // buidling.userAmmend = req.user.username;
        let pidMap = req.body;
        pidMap.userAmmend = req.user.username;
        let setRel = await setFeedbackDevice(pidMap);                
        res.status(200).send(setRel); 
    } catch (error) {
        console.log("setctrldev Error");
        return res.status(404).send(error.message);    
    }
});

router.post("/getnfromx", auth, async (req, res) => {  
    // console.log('````````````Come in Get`````````````````');  
    try {
        // buidling.userAmmend = req.user.username;
        let obj = req.body;
        // pidMap.userAmmend = req.user.username;
        let count = await getTotalItemCountFn();
        // console.log(count);
        let getNRel = await getNFeedbackDevFromX(obj);      
        // getNRel.itemCount = count;
        // console.log(getNRel);          
        let fbData = [{totalCount:count}, ...getNRel]
        res.status(200).send(fbData);       // 
    } catch (error) {
        console.log("Get N Control Dev Error");
        return res.status(404).send(ex.message);    
    }
});

router.post("/getctrldev", auth, async (req, res) => {  
    // console.log('````````````Come in Get`````````````````');  
    try {
        // buidling.userAmmend = req.user.username;
        let pidMap = req.body;
        pidMap.userAmmend = req.user.username;
        let setRel = await getFeedbackDeviceMap(pidMap);      
        // console.log(setRel);          
        res.status(200).send(setRel); 
    } catch (error) {
        console.log("getctrldev Error");
        return res.status(404).send(error.message);    
    }
});

router.post("/send", auth, async (req, res) => {    
    try {
        // console.log(req.params.userid);
        httpResponse = res;
        // console.log(req.body);      
        // console.log(currentNo);                
        publishMqtt(`Aplouds/ServerToNode/${req.body.gwid}`, req.body);
        nodeType = req.body.ht;
        _nodeID = req.body.hi;
        nodeFunction = req.body.hf;
        // console.log(req.body.nodeId);
        // console.log(_nodeID);
        subTopic = `Aplouds/NodeReply/${nodeType}/${_nodeID}`;
        subscribeTopic(subTopic);       /**subscribe topic here*/

        timer = setTimeout(function(){
            //   resp.send(array);
            // console.log("After 5 sec");
            // console.log(`Unsubcribe ${subTopic}`);     
            if(subTopic) unsubscribeTopic(subTopic);     /** unsubscribe topic here*/
            clearCommonVar();
            
            return res.status(203).send("Timeout");  
        }, 15000);

           
    } catch (ex) {
        console.log("send Device Control Error");
        return res.status(203).send({errMsg:"Exp Error"});        
    }
});


router.post("/v2sendcmd", auth, async (req, res) => {    
    try {
        // console.log(req.body);            
        let {topic, loRaPackage, urlSel, ctrlType} = req.body;
        // console.log("ctrlType", ctrlType);
        if(urlSel===1) aws_publishMqtt(`${topic}`, loRaPackage);   // aws server
        else publishMqtt(`${topic}`, loRaPackage);

        let _subTopic = `Gw/+/${loRaPackage.gwid}`;  // "Gw/+/<GwID>"
        aws_subscribeTopic(_subTopic);       /**subscribe topic here*/

        //<----- insert info into database
        let insertRel = await V2_InsertCrlCmdLog(loRaPackage, _subTopic, ctrlType);
        if(!insertRel.success) return res.status(203).send({errMsg:"Insert Cmd Log Error"}); 

        return res.status(200).send({success:true});    

           
    } catch (ex) {
        console.log("send Device Control Error :", ex.message);
        return res.status(203).send({errMsg:"Insert Cmd Log Error(Exp)"});        
    }
});


router.post("/v2getcmdlog", auth, async (req, res) => {
    try {
        let{cmdLog} = req.body;
        let rel = await V2_getCmdLog(cmdLog)

        return res.status(200).send(rel);    

           
    } catch (ex) {
        console.log("send Device Control Error", ex.message);
        return res.status(203).send({errMsg:"Send Device Control Error(Exp)"});     
     
    }
});


router.post("/v2getschedule", auth, async (req, res) => {
    try {
        let devInfo = req.body;
        console.log("devInfo");
        let rel = await V2_getSchedule(devInfo)
        if(!rel) return res.status(203).send({errMsg:"Get Schedule Error(DB)"});   

        return res.status(200).send(rel);    

           
    } catch (ex) {
        console.log("Get Schedule Error", ex.message);
        return res.status(203).send({errMsg:"Get Schedule Error(Exp)"});   
    }
});


router.post("/v2setschedule", auth, async (req, res) => {
    let routeName = "v2setschedule";
    try {
        let getListFailed = false;
        let updateErrCnt = 0;
        let insertErrCnt = 0;
        let setUnUseErrCnt = 0;

        let {scheList, devInfo} = req.body;
        // let {ht, hi} = devInfo;
        // console.log("scheList", scheList);
        // console.log("devInfo", devInfo);
        /** get existing schedule list */
        let existScheList = await V2_getSchedule_includeUnUse(devInfo);
        if(!existScheList) {    // get list exception error
            getListFailed=true;
            existScheList=[];
        }
        
        if(scheList.length > existScheList.length) {
            // console.log("`````````````````````````````Case 1");
            /** update base on existScheList.length */
            /** remaining insert */
            for (let i = 0; i < existScheList.length; i++) {
                let updateRel = await V2_updateDevSchedule(scheList[i], devInfo, existScheList[i]._id, i);
                if(!updateRel)  updateErrCnt++;
            }
            for (let i = existScheList.length; i < scheList.length; i++) {
                let insertRel = await V2_addDevSchedule(scheList[i], devInfo, i)
                if(!insertRel) insertErrCnt++;
            }

        }else if(scheList.length < existScheList.length){
            console.log("`````````````````````````````Case 2");
            /** update base on scheList.length */
            /** remain exist set UnUse */
            for (let i = 0; i < scheList.length; i++) {
                let updateRel = await V2_updateDevSchedule(scheList[i], devInfo, existScheList[i]._id, i);
                if(!updateRel)  updateErrCnt++;
            }
            for (let i = scheList.length; i < existScheList.length; i++) {
                let setUnUseRel = await V2_devSche_SetUnUse(existScheList[i]._id);
                if(!setUnUseRel)    setUnUseErrCnt++;
            }

        }else{      // same length
            // console.log("`````````````````````````````Case 3");
            /** update base on existScheList.length */
            for (let i = 0; i < scheList.length; i++) {
                let updateRel = await V2_updateDevSchedule(scheList[i], devInfo, existScheList[i]._id, i);
                if(!updateRel)  updateErrCnt++;
            }
        }

        let success=true;
        if(getListFailed || updateErrCnt>0 || insertErrCnt>0 || setUnUseErrCnt>0 ) success=false;
        return res.status(200).send({success, updateErrCnt, insertErrCnt, setUnUseErrCnt, getListFailed});

        // let updateErrCnt = 0;

        // for (const eachSche of existScheList) {
        //     let updateRel = await updateDevSchedule(devInfo, eachSche._id);
        //     if(!updateRel) updateErrCnt++;
        //     console.log("updateRel", updateRel);
        // }



        /** update existing schedule list */

        /** insert new schedule if not enough exsiting schedule*/



        // let rel = await V2_getSchedule(devInfo)
        // if(!rel) return res.status(203).send({errMsg:"Get Schedule Error(DB)"});   
        // return res.status(200).send(rel);

        

           
    } catch (error) {
        console.log(`${routeName} Error : `, error.message);
        return res.status(203).send({errMsg:`Set Schedule Error(Exp)`});   
    }
});


module.exports = router;