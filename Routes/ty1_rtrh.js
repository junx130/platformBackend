const express = require("express");
const { getNMinData_ty1, getLastNData_ty1 } = require("../MySQL/ty1_rtrh");
const router = express.Router();

router.get("/min/:id/:minute", async (req, res) => {
    let result= await getNMinData_ty1(req.params.id, req.params.minute);
    if (!result) return res.status(400).send("Invalid request");
    return res.status(200).send(result);
});

router.get("/n/:id/:qty", async (req, res) => {
    let result= await getLastNData_ty1(req.params.id, req.params.qty);
    if (!result) return res.status(400).send("Invalid request");
    return res.status(200).send(result);
});

module.exports = router;