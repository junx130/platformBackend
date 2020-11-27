const express = require("express");
let cors = require("cors");
const queryRoute= require("./queryData")
const queryBdDev= require("./queryBdDev")
const userRoute= require("./users")
const buildingRoute= require("./buildings")
const assignBuildingRoute= require("./assignBuildingToUser")
const deviceListRoute= require("./deviceList")
const buildingDevicesRoute= require("./buildingDevices")
const lineList= require("./GraphPara/lineList")
const graphList= require("./GraphPara/graphList")
const error= require("../Middleware/error")


module.exports = function (app) {
    app.use(express.json());
    app.use(cors());

    app.use("/api/bddev/", queryBdDev);
    app.use("/api/", queryRoute);
    app.use("/users/", userRoute);
    app.use("/assignbuilding/", assignBuildingRoute);
    app.use("/building/", buildingRoute);
    app.use("/devicelist/", deviceListRoute);
    app.use("/buildingdevices/", buildingDevicesRoute);
    app.use("/linelist/", lineList);
    app.use("/graphList/", graphList);
    app.use(error);     // caught all unexpected error
}