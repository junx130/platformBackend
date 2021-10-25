const express = require("express");
const router = express.Router();
// const Joi = require("joi");
const auth = require("../../Middleware/auth");
const { getSensorOwnerBy_TydevID, setSensorOwner, getBuildingByOwner_id, getBdInfoBy_id, getAreaByOwner_id, getAreaInfoBy_id } = require("../../MySQL/V2_DeviceRecord/v2_SensorOwner");
const { getSensorSharedBy_TydevID, getBuildingByActiveUser_id, getAreaByActiveUser_id } = require("../../MySQL/V2_DeviceRecord/v2_SensorSharedUser");



/** register new sensor */
router.post("/sensorowner/regnewsensor", auth, async (req, res) => {    
    /** check bdDev duplication */
    /** if new BD, log new BD, else use _id */
    /** If new Area, log new area, else ud _id */
    /** Check BdDev Exist again */
    /** not exist, log new bdDev*/
    console.log(req.body);

});

/** get InvolvedArea */
router.post("/area/getrelated", auth, async (req, res) => {    
    try {
        // console.log("Come in");
        // console.log(req.body);
        let info = req.body;
        /** get owned building area */
        let ownedArea = await getAreaByOwner_id(info.user_id, info.selectedBuilding);
        // console.log("ownedArea", ownedArea);
        if(!ownedArea) return res.status(203).send({msg:'Database Server Invalid'});

        /** get shared Area  */
        let sharedArea = await getAreaByActiveUser_id(info.user_id, info.selectedBuilding);
        // console.log("sharedArea", sharedArea);
        if(!sharedArea) return res.status(203).send({msg:'Database Server Invalid'});
        
        /** Filter duplicated data */
        let uniqueTable = Array.from(
            new Set(sharedArea.map((a) => a.area_id))
        ).map((area_id) => {
            return sharedArea.find((a) => a.area_id === area_id);
        });
        
        // console.log(uniqueTable);
      
        let relatedArea=[...ownedArea];

        /** convert shared building into own building Form */
        for (const area of uniqueTable) {
            let ownArea = await getAreaInfoBy_id(area.area_id);
            if(ownArea){
                if(Array.isArray(ownArea) && ownArea.length > 0)
                    for (const area of ownArea) {
                        area.isSharedBd = true;
                        let duplicated = ownedArea.find(c=>c._id === area._id);
                        if(!duplicated) relatedArea.push(area);

                    }
                // relatedBuilding=[...relatedBuilding, ...ownBuilding];
            }else{
                return res.status(203).send({msg:'Database Server Invalid'});
            }
        }
        
        // console.log("relatedBuilding", relatedBuilding);
        return res.status(200).send(relatedArea);      
        
    } catch (error) {
        console.log("Error : /area/getrelated");
        console.log(error.message);
        return res.status(404).send(error.message);     
    }
    
});

/** get involved building */
router.post("/building/getrelated", auth, async (req, res) => {    
    try {
        // console.log(req.body);
        let info = req.body;
        /** get owned building */
        let ownedBd = await getBuildingByOwner_id(info.user_id);
        if(!ownedBd) return res.status(203).send({msg:'Database Server Invalid'});

        /** get shared building (access level = 1 , co-owned),  */
        let sharedBd = await getBuildingByActiveUser_id(info.user_id);
        if(!sharedBd) return res.status(203).send({msg:'Database Server Invalid'});
        
        
        /** Filter duplicated data */
        let uniqueSharedBd = Array.from(
            new Set(sharedBd.map((a) => a.buidling_id))
        ).map((buidling_id) => {
            return sharedBd.find((a) => a.buidling_id === buidling_id);
        });
        
        // console.log(uniqueSharedBd);

        let relatedBuilding=[...ownedBd];

        /** convert shared building into own building Form */
        for (const bd of uniqueSharedBd) {
            let ownBuilding = await getBdInfoBy_id(bd.buidling_id);
            if(ownBuilding){
                if(Array.isArray(ownBuilding) && ownBuilding.length > 0)
                    for (const bd of ownBuilding) {
                        bd.isSharedBd = true;
                        let duplicated = ownedBd.find(c=>c._id === bd._id);
                        if(!duplicated) relatedBuilding.push(bd);
                    }
                // relatedBuilding=[...relatedBuilding, ...ownBuilding];
            }else{
                return res.status(203).send({msg:'Database Server Invalid'});
            }
        }
        
        // console.log("relatedBuilding", relatedBuilding);
        return res.status(200).send(relatedBuilding);      
        
    } catch (error) {
        console.log("Error : /building/getrelated");
        return res.status(404).send(error.message);     
    }
    
});

router.post("/sensorowner/getbytyid", auth, async (req, res) => {    
    try {
        // console.log(req.params.userid);
        // console.log(req.body);
        
        let result = await getSensorOwnerBy_TydevID(req.body);
        // console.log(result);
        if(!result) return res.status(204).send(result);    // catch error
        return res.status(200).send(result);        
    } catch (ex) {
        console.log("Get Status Threshold Error");
        return res.status(404).send(ex.message);        
    }
});


router.post("/sensorowner/set", auth, async (req, res) => {    
    try {
        // console.log(req.params.userid);
        // console.log(req.body);
        
        let result = await setSensorOwner(req.body);
        // console.log(result);
        // if(!result) return res.status(204).send(result);    // catch error
        return res.status(200).send(result);        
    } catch (ex) {
        console.log("Get Status Threshold Error");
        return res.status(404).send(ex.message);        
    }
});


router.post("/sensorshared/getbytyid", auth, async (req, res) => {    
    try {
        // console.log(req.params.userid);
        console.log(req.body);
        console.log('sensorshared');
        
        let result = await getSensorSharedBy_TydevID(req.body);
        // console.log(result);
        if(!result) return res.status(204).send(result);    // catch error
        return res.status(200).send(result);        
    } catch (ex) {
        console.log("Get Status Threshold Error");
        return res.status(404).send(ex.message);        
    }
});

module.exports = router;