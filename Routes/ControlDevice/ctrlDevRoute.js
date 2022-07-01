const express = require("express");
const { setFeedbackDevice, getFeedbackDeviceMap,getNFeedbackDevFromX,getTotalItemCountFn } = require("../../ControlDevice/updateFeebackMap");
const router = express.Router();
const auth = require("../../Middleware/auth");
const { aws_publishMqtt, aws_subscribeTopic, aws_expClient, aws_unsubscribeTopic } = require("../../MQTT/AwsMqttBroker");
const { publishMqtt, subscribeTopic, expClient, unsubscribeTopic} = require("../../MQTT/koalaMqtt");
const { V2_InsertCrlCmdLog, V2_updateCrlCmdLog, V2_getUnprocessCrlCmdLog_bySubTopic, V2_updateCrlCmdLogBy_id, V2_getCmdLog } = require("../../MySQL/V2_Control/V2_Control");
const { ioEmit } = require("../../MainPrg/Prg_SocketIo");


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
    try {
        // console.log("Message Lai Liao");
        const a_topic = topic.split("/");
        // console.log(a_topic);
        let mqttMsg = JSON.parse(message);
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
                let unprocessCmdLog = await V2_getUnprocessCrlCmdLog_bySubTopic(subTopic);      // get within 1 mins before
                // console.log("unprocessCmd Cnt", unprocessCmdLog.length);

                if(unprocessCmdLog.length === 0) {  // this is only active command log
                    // let setProcessed = await V2_updateCrlCmdLogBy_id(recentCmdLog[0]._id, "Processed", 1, false);
                    // console.log("Unsubsribe To: ",subTopic);   
                    aws_unsubscribeTopic(subTopic);
                }
                
                ioEmit("v2_CtrlCmd", mqttMsg);      // update to frontend

                
                // httpResponse.status(200).send(deviceInfo);   // response to frontend
                
            } 
        }
               
    } catch (error) {
        console.log("MQTT cmd Subscribe Err: ",error.message);
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
        return res.status(203).send(ex.message);        
    }
});


router.post("/v2sendcmd", auth, async (req, res) => {    
    try {
        // console.log(req.body);            
        let {topic, loRaPackage, urlSel} = req.body;
        if(urlSel===1) aws_publishMqtt(`${topic}`, loRaPackage);   // aws server
        else publishMqtt(`${topic}`, loRaPackage);

        let _subTopic = `Gw/+/${loRaPackage.gwid}`;  // "Gw/+/<GwID>"
        aws_subscribeTopic(_subTopic);       /**subscribe topic here*/

        //<----- insert info into database
        let insertRel = await V2_InsertCrlCmdLog(loRaPackage, _subTopic);
        if(!insertRel.success) return res.status(203).send({errMsg:"Insert Cmd Log Error"}); 

        return res.status(200).send({success:true});    

           
    } catch (ex) {
        console.log("send Device Control Error");
        return res.status(203).send(ex.message);        
    }
});


router.post("/v2getcmdlog", auth, async (req, res) => {
    try {
        let{cmdLog} = req.body;
        let rel = await V2_getCmdLog(cmdLog)

        return res.status(200).send(rel);    

           
    } catch (ex) {
        console.log("send Device Control Error");
        return res.status(203).send(ex.message);        
    }
});

module.exports = router;