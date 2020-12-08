const express = require("express");
const router = express.Router();
const { getLastNData, getNMinData, getDataT1ToT2, getNDataAfterT, getNMinAfterT } = require("../MySQL/queryData");
const buildingDb = "Buildings";
const auth = require("../Middleware/auth");

router.get("/min/:ty/:id/:minute", auth, async (req, res) => {
    let result= await getNMinData(buildingDb, req.params.ty, req.params.id, req.params.minute);
    // if (!result) return res.status(400).send("Invalid request");
    return res.status(200).send(result);
});

router.get("/n/:ty/:id/:qty", auth, async (req, res) => {
    let result= await getLastNData(buildingDb, req.params.ty, req.params.id, req.params.qty);
    // if (!result) return res.status(400).send("Invalid request");
    return res.status(200).send(result);
});

router.get("/ttot/:ty/:id/:t1/:t2", auth, async (req, res) => {
    console.log(req.params.t1);
    let result= await getDataT1ToT2(buildingDb, req.params.ty, req.params.id, req.params.t1, req.params.t2);
    // console.log(result);
    // if (!result) return res.status(400).send("Invalid request");
    return res.status(200).send(result);
    // return res.status(200).send("result");
});

router.get("/naft/:ty/:id/:t1/:n1", auth, async (req, res) => {
    let result= await getNDataAfterT(buildingDb, req.params.ty, req.params.id, req.params.t1, req.params.n1);
    // if (!result) return res.status(400).send("Invalid request");
    return res.status(200).send(result);
});

router.get("/minaft/:ty/:id/:t1/:min1", auth, async (req, res) => {
    let result= await getNMinAfterT(buildingDb, req.params.ty, req.params.id, req.params.t1, req.params.min1);
    // if (!result) return res.status(400).send("Invalid request");
    return res.status(200).send(result);
});


module.exports = router;