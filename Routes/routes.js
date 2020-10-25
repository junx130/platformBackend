const express = require("express");
let cors = require("cors");
const queryRoute= require("./queryData")
const userRoute= require("./users")
const buildingRoute= require("./buildings")
const error= require("../Middleware/error")



module.exports = function (app) {
    app.use(express.json());
    app.use(cors());

    app.use("/api/", queryRoute);
    app.use("/users/", userRoute);
    app.use("/building/", buildingRoute);
    app.use(error);     // caught all unexpected error
}