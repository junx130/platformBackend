const express = require("express");
const router = express.Router();
const auth = require("../../Middleware/auth");
const { getSystemList_byBd_id, getComponentList_byBd_id, getGroupList_byBd_id, getCompAuxList_byComp_id, getCompAuxList_byComp_idList, getCompTiePara_byComp_id, getCompAuxList_byComp_id_StartEndTime } = require("../../MySQL/V2_System/V2_System");

/** the aux id for start end time must be 4(Start) and 5(End) */
const componentWithStartEndTime=[5,6];

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
        /** for each component list.  */
        let comp_idList = [];
        for (const eachComponent of componentList) {
            /** query System_Component_Aux, get by component_id and auxId in(4,5) */
            let foundIdx = componentWithStartEndTime.findIndex(c=> c===eachComponent.componentType);
            if(foundIdx>=0){     // these component with star end time.
                let startEndList = await getCompAuxList_byComp_id_StartEndTime(eachComponent._id);
                let startAux = startEndList.find(c=> c.auxId === 'startTime');
                if (Object.hasOwnProperty.call(startAux, "auxValue")) eachComponent.StartTime = startAux.auxValue;
                let endAux = startEndList.find(c=> c.auxId === 'endTime');
                if (Object.hasOwnProperty.call(endAux, "auxValue")) eachComponent.EndTime = endAux.auxValue;
            }

            /** get related devices in each component. */
            let involvedBdDev = await getCompTiePara_byComp_id(eachComponent._id);
            let bdDevList = []
            for (const eachDev of involvedBdDev) {
                bdDevList.push(eachDev);
                // let findDuplicated = bdDevList.indexOf(eachDev.bdDev_id);
                // if(findDuplicated<0){
                //     bdDevList.push({bdDev_id:eachDev.bdDev_id, devType:eachDev.devType});
                // }else{
                //     console.log("Duplicated");
                // }
            }
            eachComponent.bdDevInvolve_List = bdDevList;
            comp_idList.push(eachComponent._id);
        }

        let auxList = await getCompAuxList_byComp_idList(comp_idList);

        return res.status(200).send({systemList, groupList, componentList, auxList});
    } catch (error) {
        console.log(`${errTopic} err: `, error.message);
        return res.status(203).send({ errMsg: error.message });
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