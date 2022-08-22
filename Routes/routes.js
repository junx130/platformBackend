const express = require("express");
let cors = require("cors");
const queryRoute= require("./queryData")
const queryBdDev= require("./queryBdDev")
const userRoute= require("./users")
const buildingRoute= require("./buildings")
const teleIdRoute= require("./notification/telegramId")
const checkDeviceActive= require("./checkDeviceAvtive/checkDeviceActive")
const notificationRoute= require("./notification/notification")
const assignBuildingRoute= require("./assignBuildingToUser")
const deviceListRoute= require("./deviceList")
const buildingDevicesRoute= require("./buildingDevices")
const lineList= require("./GraphPara/lineList")
const graphList= require("./GraphPara/graphList")
const offsetRoute= require("./offset/offsetRoute")
const controlDevRoute= require("./ControlDevice/ctrlDevRoute")
const Monlist= require("./MonList/MonList")
const T1list= require("./MonList/T1_list")
const eleList= require("./MonList/EleList")
const statusNodeThreshold= require("./StatusNodeThreshold/statusNodeThresholdRoute")
const teleSubList= require("./notification/teleSubscribeList")
const battDiag= require("./DiagBattRoute/BattDiagRoute")
const sensorManagement= require("./SensorManagement/SensorManagementRoute")
const acControl= require("./ControlDevice/AcControl")
const devMgnt_V2= require("./devMgnt_V2/regDev_V2")
const areaList_V2= require("./present_V2/areaListRoute")
const sumList_V2= require("./present_V2/summaryListRoute");
const V2_DeviceRecord= require("./V2_DeviceRecord/v2_DeviceRecordRoute");
const V2_Querydata = require("./V2_QueryData/v2_QueryBdDevData");
const V2_bdDevSetting = require('./V2_DeviceRecord/v2_bdDevSetting');
const V2_reactionRoute = require("./V2_ReactionRoute/V2_reactionRoute");
const V2_act_tele = require("./V2_Action/TeleRoute/V2_Act_TeleRoute");
const userRoute_V2 = require("./users_V2");
const V2_actionRoute = require("./V2_Action/V2_Action");
const V1_ctrlRoute = require("./V1/V1_CtrlOvv/V1_CtrlOvv");
const V2_ctrlRoute = require("./V2_Control/V2_ControlRoute");
const V2_appRoute = require("./V2_Application/V2_ApplicationRoute");


const error= require("../Middleware/error")

module.exports = function (app) {
    app.use(express.json());
    app.use(cors());

    app.use("/notify/list", notificationRoute);
    app.use("/notify/teleid", teleIdRoute);
    app.use("/notify/devact", checkDeviceActive);
    app.use("/notify/sublist", teleSubList);    
    app.use("/api/bddev/", queryBdDev);
    app.use("/diag/batt/", battDiag);
    app.use("/present/area/", areaList_V2);
    app.use("/present/sum/", sumList_V2);
    app.use("/action/tele/", V2_act_tele);
    

    app.use("/api/", queryRoute);
    app.use("/users/", userRoute);
    app.use("/assignbuilding/", assignBuildingRoute);
    app.use("/building/", buildingRoute);
    app.use("/devicelist/", deviceListRoute);
    app.use("/buildingdevices/", buildingDevicesRoute);
    app.use("/statusnode/", statusNodeThreshold);
    app.use("/linelist/", lineList);
    app.use("/graphList/", graphList);    
    app.use("/offset/", offsetRoute);    
    app.use("/ctrldev/", controlDevRoute);    
    app.use("/acctrl/", acControl);        
    app.use("/monlist/", Monlist);    
    app.use("/t1list/", T1list);    
    app.use("/eleList/", eleList);    
    app.use("/sensormng/", sensorManagement);   
    app.use("/devmngv2/", devMgnt_V2);    
    app.use("/devrec/", V2_DeviceRecord);  
    app.use("/query/", V2_Querydata);  
    app.use("/v2bddevsetting/", V2_bdDevSetting);  
    app.use("/v2reaction/", V2_reactionRoute);  
    app.use("/v2action/", V2_actionRoute);
    app.use("/v2ctrl/", V2_ctrlRoute);
    app.use("/v2app/", V2_appRoute);

    app.use("/v1ctrl/", V1_ctrlRoute);
    
    
    
    
    app.use("/user/", userRoute_V2);
    
    
    
    app.use(error);     // caught all unexpected error
}
