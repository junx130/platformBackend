const express = require("express");
const { getLastNData, getNMinData } = require("../MySQL/queryData");
const router = express.Router();

router.get("/min/:ty/:id/:minute", async (req, res) => {
    let result= await getNMinData(req.params.ty, req.params.id, req.params.minute);
    if (!result) return res.status(400).send("Invalid request");
    return res.status(200).send(result);
});

router.get("/n/:ty/:id/:qty", async (req, res) => {
    let result= await getLastNData(req.params.ty, req.params.id, req.params.qty);
    if (!result) return res.status(400).send("Invalid request");
    return res.status(200).send(result);
});

module.exports = router;