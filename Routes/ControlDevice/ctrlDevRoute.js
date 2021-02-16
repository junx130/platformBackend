const express = require("express");
const router = express.Router();
const auth = require("../../Middleware/auth");
const { publishMqtt, subscribeTopic, expClient, unsubscribeTopic} = require("../../MQTT/koalaMqtt");


let httpResponse;
let subTopic;
let nodeType;
let _nodeID;

function clearCommonVar(){
    subTopic = undefined;
    nodeType = undefined;
    _nodeID = undefined;
}

expClient.on("message", async (topic, message) => {
    // console.log("Message Lai Liao");
    const a_topic = topic.split("/");
    // console.log(a_topic);
    if(a_topic[0]===`Aploud` &&
        a_topic[1]===`NodeReply` ){
            // console.log("Topic match");
            let deviceInfo = JSON.parse(message);
            // console.log(deviceInfo);
            // console.log(nodeType);
            // console.log(deviceInfo.DevId);
            // console.log(deviceInfo.NodeType);
            // console.log(_nodeID);
            if(nodeType && _nodeID && deviceInfo.NodeType == nodeType && deviceInfo.DevId == _nodeID){
                if(httpResponse){
                    // console.log("Res valid");                
                    httpResponse.status(200).send(deviceInfo);
                    if(subTopic) unsubscribeTopic(subTopic);
                    clearTimeout(timer);
                    clearCommonVar();
                }
            }
        }
  });


router.post("/send", auth, async (req, res) => {    
    try {
        // console.log(req.params.userid);
        httpResponse = res;
        console.log(req.body);      
        // console.log(currentNo);                
        publishMqtt(`Aplouds/BEtoGW/${req.body.ht}`, req.body);
        nodeType = req.body.nodeType;
        _nodeID = req.body.nodeId;
        // console.log("KittyMeow");
        // console.log(req.body.nodeId);
        // console.log(_nodeID);
        subTopic = `Aploud/NodeReply`;
        subscribeTopic(subTopic);       /**subscribe topic here*/

        timer = setTimeout(function(){
            //   resp.send(array);
            // console.log("After 5 sec");
            if(subTopic) unsubscribeTopic(subTopic);     /** unsubscribe topic here*/
            clearCommonVar();
            
            return res.status(204).send("Timeout");  
        }, 10000);

           
    } catch (ex) {
        console.log("Set Device Control Error");
        return res.status(404).send(ex.message);        
    }
});



module.exports = router;