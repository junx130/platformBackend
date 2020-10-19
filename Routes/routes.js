const express = require("express");
let cors = require("cors");
const ty1_Route= require("./ty1_rtrh")


module.exports = function (app) {
    app.use(express.json());
    app.use(cors());

    app.use("/api/ty1", ty1_Route);
}