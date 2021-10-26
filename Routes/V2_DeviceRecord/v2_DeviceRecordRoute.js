const express = require("express");
const router = express.Router();
const Joi = require("joi");
const auth = require("../../Middleware/auth");
const { getSensorOwnerBy_TydevID, getBuildingByOwner_id, getBdInfoBy_id, getAreaByOwner_id, getAreaInfoBy_id, insertV2_OwnerList_bd, insertV2_OwnerList_area, insertV2_OwnerList_bdDev } = require("../../MySQL/V2_DeviceRecord/v2_SensorOwner");
const { getSensorSharedBy_TydevID, getBuildingByActiveUser_id, getAreaByActiveUser_id } = require("../../MySQL/V2_DeviceRecord/v2_SensorSharedUser");



function valRegSenInfo(body){
    const schema = {      
        type: Joi.number().required(),
        devID: Joi.number().required(),
        RegCode:Joi.string().required(),
        SerialNo:Joi.string().required(),
        areaId:Joi.number(),
        bAreaName:Joi.string().max(80).required().label("Area"),
        bNewArea:Joi.boolean().required(),
        bNewBuilding:Joi.boolean().required(),
        buildingId: Joi.number(),
        buildingName: Joi.string().max(80).required().label("Building"),
        devName: Joi.string().min(1).max(80).required().label("Name"),
        bdOwner_id: Joi.number(),
    }
    return Joi.validate(body, schema);
}


/** register new sensor */
router.post("/sensorowner/regnewsensor", auth, async (req, res) => {    
    try {
        // console.log(req.body);
        let body = req.body;
        /** validate Data */
        let {error: valErr} = valRegSenInfo(body);
        if(valErr) return res.status(203).send({errMsg:valErr.details[0].message});

        /** check bdDev duplication */
        let sensorDuplication = await getSensorOwnerBy_TydevID(body);
        if(!Array.isArray(sensorDuplication)) return res.status(203).send({errMsg:"DB server Error"});
        if(sensorDuplication.length > 0) return res.status(203).send({errMsg:"Device Duplicated"});
        // console.log(sensorDuplication);
        /** check whether is new BD */
        let bd_id=body.buildingId;  /** Existing Building Will use this */
        if(body.bNewBuilding){   /** new building, */
            /** store into DB, get the return _id */
            let insBdRel = await insertV2_OwnerList_bd(body)
            //{ affectedRows: 1, insertId: 4, warningStatus: 0 }
            if(!insBdRel) return res.status(203).send({errMsg:"Add New Building Not Success(1)"});
            if(insBdRel.affectedRows<1) return res.status(203).send({errMsg:"Add New Building Not Success(2)"});
            bd_id = insBdRel.insertId;
            console.log(bd_id);
        }

        let area_id = body.areaId;
        if(body.bNewArea){      /** new area */
            /** store into area db */
            let insAreaRel = await insertV2_OwnerList_area(body, bd_id)
            if(!insAreaRel) return res.status(203).send({errMsg:"Add New Area Not Success(1)"});
            if(insAreaRel.affectedRows<1) return res.status(203).send({errMsg:"Add New Area Not Success(2)"});
            area_id = insAreaRel.insertId;
            console.log(area_id);
        }

        /** Log into dev DB */
        let insDevRel = await insertV2_OwnerList_bdDev(body, bd_id, area_id);
        if(!insDevRel) return res.status(203).send({errMsg:"Add New Sensor Not Success"});
        
        return res.status(200).send({reqSuccess:true});


    } catch (error) {
        console.log("Error : /sensorowner/regnewsensor");
        console.log(error.message);
        return res.status(404).send(error.message);     
    }
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