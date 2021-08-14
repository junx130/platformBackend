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
    
    
    app.use(error);     // caught all unexpected error
}
