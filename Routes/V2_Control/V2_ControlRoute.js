const express = require("express");
const router = express.Router();
const auth = require("../../Middleware/auth");
const { notArrOrEmptyArr } = require("../../utilities/validateFn");
const { V2_getGwPair, V2_insertGwPair, V2_updateGwPair } = require("../../MySQL/V2_Control/V2_GwPair");


router.post("/getgwpair", auth, async (req, res) => {
    try {
        let {bdDev_id} = req.body;
        let gwPairList = await V2_getGwPair(bdDev_id);
        if(!gwPairList) return res.status(203).send({errMsg:"Get GW info Err(DB)"});    // catch error

        return res.status(200).send({gwPairList});
    } catch (error) {
        console.log("/getgwpair : ", error.message);
        return res.status(203).send({ errMsg: "Database Error (Exp)" });
    }
});


router.post("/setgwpair", auth, async (req, res) => {
    try {
        let {bdDev_id, gwid} = req.body;
        /** check gw pair exist */
        let gwList = await V2_getGwPair(bdDev_id);
        if(notArrOrEmptyArr(gwList)){   /** not exist, insert*/
            let inertRel = await V2_insertGwPair({bdDev_id, gwid});
            if(!inertRel) return res.status(203).send({errMsg:"Set Gw Err (Insert failed)"});    
        }else{      /** exist update */
            let updaterel = await V2_updateGwPair(bdDev_id, gwid);
            if(!updaterel) return res.status(203).send({errMsg:"Set Gw Err (Update failed)"});    
        }

        return res.status(200).send({success:true});
    } catch (error) {
        console.log("/setgwpair err: ", error.message);
        return res.status(203).send({ errMsg: "Database Error (Exp)" });
    }
});





module.exports = router;