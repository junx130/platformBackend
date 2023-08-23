const express = require("express");
const router = express.Router();
const auth = require("../../Middleware/auth");
const { getSystemList_byBd_id, getComponentList_byBd_id, getGroupList_byBd_id, getCompAuxList_byComp_id, getCompTiePara_byComp_id } = require("../../MySQL/V2_System/V2_System");


router.post("/getsystemlistbybdid", auth, async (req, res) => {
    let errTopic = "getsystemlist";
    try {
        
        let {bd_id} = req.body;
        let systemList = await getSystemList_byBd_id(bd_id);
        if(!systemList) return res.status(203).send({ errMsg: "Get system list error" });

        let groupList = await getGroupList_byBd_id(bd_id)
        if(!groupList) return res.status(203).send({ errMsg: "Get group list error" });

        let componentList = await getComponentList_byBd_id(bd_id);
        if(!componentList) return res.status(203).send({ errMsg: "Get component list error" });

        return res.status(200).send({systemList, groupList, componentList});
    } catch (error) {
        console.log(`${errTopic} err: `, error.message);
        return res.status(203).send({ errMsg: "Database Error (Exp)" });
    }
});

router.post("/getcomponentauxlistbycompid", auth, async(req, res) =>{
    let errTopic = "getcomponentauxlist";
    try {
        let { comp_id } = req.body;

        let auxList = await getCompAuxList_byComp_id(comp_id);
        if(!auxList) return res.status(203).send({ errMsg: "Get aux list error" });

        let tieParaList = await getCompTiePara_byComp_id(comp_id);
        if(!tieParaList) return res.status(203).send({ errMsg: "Get tie para list error" });

        return res.status(200).send({auxList, tieParaList});
    } catch (error) {
        console.log(`${errTopic} err: `, error.message);
        return res.status(203).send({ errMsg: "Database Error (Exp)" });
    }
});


module.exports = router;