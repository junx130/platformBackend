const express = require("express");
let cors = require("cors");
const queryRoute= require("./queryData")


module.exports = function (app) {
    app.use(express.json());
    app.use(cors());

    app.use("/api/", queryRoute);
}