const express = require("express");
const router = express.Router();
const auth = require("../../Middleware/auth");
const { getActiveAction } = require("../../MySQL/V2_Action/V2_Action");
const { notArrOrEmptyArr } = require("../../utilities/validateFn");

router.post("/getactive", auth, async (req, res) => {    
    try {
        let result = await getActiveAction();
        if(!result) return res.status(203).send([]);    // catch error
        return res.status(200).send(result);        
    } catch (error) {
        console.log("getbyuserid : ", error.message);
        return res.status(203).send({errMsg: "Database Error (Exp)"});        
    }
});

module.exports = router;