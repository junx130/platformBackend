const express = require("express");
const { setFeedbackDevice, getFeedbackDeviceMap,getNFeedbackDevFromX,getTotalItemCountFn } = require("../../ControlDevice/updateFeebackMap");
const router = express.Router();
const auth = require("../../Middleware/auth");
const { publishMqtt, subscribeTopic, expClient, unsubscribeTopic} = require("../../MQTT/koalaMqtt");


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

expClient.on("message", async (topic, message) => {
    // console.log("Message Lai Liao");
    const a_topic = topic.split("/");
    // console.log(a_topic);
    if(a_topic[0]===`Aplouds` &&
        a_topic[1]===`NodeReply` ){
            // console.log("Topic match");
            let deviceInfo = JSON.parse(message);
            console.log(deviceInfo);
            // console.log(nodeType);
            // console.log(deviceInfo.DevId);
            // console.log(deviceInfo.NodeType);
            // console.log(_nodeID);
            if(nodeType && _nodeID && nodeFunction && 
                deviceInfo.ht == nodeType && deviceInfo.hi == _nodeID && 
                deviceInfo.hd == 3 && deviceInfo.hf == nodeFunction ){
                if(httpResponse){
                    console.log(deviceInfo);                
                    httpResponse.status(200).send(deviceInfo);
                    console.log(`Success, Unsubcribe ${subTopic}`);                
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
        res.status(200).send(fbData);       // ??? 
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
        console.log(req.body);      
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
            console.log(`Unsubcribe ${subTopic}`);     
            if(subTopic) unsubscribeTopic(subTopic);     /** unsubscribe topic here*/
            clearCommonVar();
            
            return res.status(204).send("Timeout");  
        }, 10000);

           
    } catch (ex) {
        console.log("send Device Control Error");
        return res.status(404).send(ex.message);        
    }
});



module.exports = router;