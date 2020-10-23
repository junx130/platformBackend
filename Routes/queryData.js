const express = require("express");
const { getLastNData, getNMinData, getDataT1ToT2, getNDataAfterT, getNMinAfterT } = require("../MySQL/queryData");
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

router.get("/ttot/:ty/:id/:t1/:t2", async (req, res) => {
    let result= await getDataT1ToT2(req.params.ty, req.params.id, req.params.t1, req.params.t2);
    if (!result) return res.status(400).send("Invalid request");
    return res.status(200).send(result);
});

router.get("/naft/:ty/:id/:t1/:n1", async (req, res) => {
    let result= await getNDataAfterT(req.params.ty, req.params.id, req.params.t1, req.params.n1);
    if (!result) return res.status(400).send("Invalid request");
    return res.status(200).send(result);
});

router.get("/minaft/:ty/:id/:t1/:min1", async (req, res) => {
    let result= await getNMinAfterT(req.params.ty, req.params.id, req.params.t1, req.params.min1);
    if (!result) return res.status(400).send("Invalid request");
    return res.status(200).send(result);
});

module.exports = router;