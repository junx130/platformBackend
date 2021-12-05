const express = require("express");
const router = express.Router();
const Joi = require("joi");
const auth = require("../../Middleware/auth");
const { getUserByEmail } = require("../../MySQL/userManagement_V2/users_V2");
const { getSensorOwnerBy_TydevID, getBuildingByOwner_id, getBdInfoBy_id, getAreaByOwner_id, getAreaInfoBy_id, insertV2_OwnerList_bd, insertV2_OwnerList_area, insertV2_OwnerList_bdDev, getBuildingByOwner_id_bd_id, getBddevBy_userId_bdId, getBddevBy_idList } = require("../../MySQL/V2_DeviceRecord/v2_SensorOwner");
const { getSensorSharedBy_TydevID, getBuildingByActiveUser_id, getAreaByActiveUser_id, getSharedBdBy_user_id_bd_id, getSharedevBy_userId_bdId } = require("../../MySQL/V2_DeviceRecord/v2_SensorSharedUser");



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
        if(!ownedArea) return res.status(203).send({errMsg:'DB(Own) Invalid'});

        /** get shared Area  */
        let sharedArea = await getAreaByActiveUser_id(info.user_id, info.selectedBuilding);
        // console.log("sharedArea", sharedArea);
        if(!sharedArea) return res.status(203).send({errMsg:'DB(Share) Invalid'});
        
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
                return res.status(203).send({errMsg:'Database Server Invalid'});
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
        // console.log("info", info);
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
        
        // console.log("uniqueSharedBd", uniqueSharedBd);

        let relatedBuilding=[...ownedBd];

        /** convert shared building into own building Form */
        for (const bd of uniqueSharedBd) {
            let ownBuilding = await getBdInfoBy_id(bd.buidling_id);
            if(ownBuilding){
                if(Array.isArray(ownBuilding) && ownBuilding.length > 0)
                    for (const owbBd of ownBuilding) {
                        owbBd.isSharedBd = true;
                        owbBd.accessLevel = bd.accessLevel;
                        let duplicated = ownedBd.find(c=>c._id === owbBd._id);
                        if(!duplicated) relatedBuilding.push(owbBd);
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
        // console.log(req.body);
        
        let result = await getSensorSharedBy_TydevID(req.body);
        // console.log(result);
        if(!result) return res.status(204).send(result);    // catch error
        return res.status(200).send(result);        
    } catch (ex) {
        console.log("Get Status Threshold Error");
        return res.status(404).send(ex.message);        
    }
});

router.post("/sensorshared/sharesensor", auth, async (req, res) => {    
    try {
        let {shareInfo} = req.body;
        // console.log("shareInfo", shareInfo);
        /** check email list ??? 211204*/
        let {receiverList, owner_id, devList, buidling_id} = shareInfo;
        // console.log('receiverList', receiverList);
        for (const eachEmail of receiverList) {
            let user = await getUserByEmail(eachEmail);
            // console.log("user" , user);
            if(!user) {
                console.log('User Not valid');
                continue 
            }
            if(user._id === owner_id || user._id === user_id) {
                console.log('Skip share to own account');
                continue
            }
            /*********** Update share building *************/
            let sharedBd = await getSharedBdBy_user_id_bd_id(user._id, buidling_id);
            console.log(sharedBd);
            /** if building already shared, make sure  sharedBd.active is 1*/
                /** if sharedBd.active is not 1, update to 1 */

            /** else, share building is not exist, add to shared building */
            


            /************ update share device list ************/
            for (const eachDev of devList) {
                /** query V2_ShareList_bdDev, by buidling_id, user_id*/
                /** forof eachDev */
                    /** if eachDev.selected, */
                        /** if exist in V2_ShareList_bdDev */
                            /** make sure active is 1 */
                        /** if not exist in V2_ShareList_bdDev */
                            /** insert to V2_ShareList_bdDev */
                    /** else (!eachDev.selected) */    
                        /** if exist in V2_ShareList_bdDev */
                            /** set active to 0 */
                        /** if not exist in V2_ShareList_bdDev */
                            /** no action needed */                
            }
        }
        

        return res.status(200).send();        
    } catch (ex) {
        console.log("sensorshared/sharesensor Error");
        console.log(ex.message);
        return res.status(404).send(ex.message);        
    }
});

router.post("/building/checkvaliduser", auth, async (req, res) => {    
    try {
        // console.log("/building/checkvaliduser");
        // console.log(req.body);
        let {user_id, bd_id} = req.body;
        /** check owner BD */
        // let ownBd = await getBuildingByOwner_id_bd_id(5, body.bd_id);
        let ownBd = await getBuildingByOwner_id_bd_id(user_id, bd_id);
        // console.log(ownBd);
        if(!ownBd || !Array.isArray(ownBd)) return res.status(204).send({errMsg: "Database(Own) Exc Error"});
        if(ownBd.length > 0) return res.status(200).send({bdAccess:true, status:'Owner'});

        /** User Not owner, Check shared building */
        let sharedBd = await getSharedBdBy_user_id_bd_id(user_id, bd_id);
        if(!sharedBd || !Array.isArray(sharedBd)) return res.status(204).send({errMsg: "Database(Share) Exc Error"});
        if(sharedBd.length > 0) return res.status(200).send({bdAccess:true, status:'Shared'});

        return res.status(200).send({bdAccess:false});

    } catch (error) {
        console.log("/building/checkvaliduser Error");
        console.log(error.message);
        return res.status(203).send({errMsg: "Server Exc Error"});        
    }
});

router.post("/building/getbddevby_idlist", auth, async (req, res) => {    
    try {
        let {bdDev_idList} = req.body;
        let bdDev_list = await getBddevBy_idList(bdDev_idList);
        console.log(bdDev_list);
        if(!bdDev_list) return res.status(204).send({errMsg: "Database Error"});
        
        return res.status(200).send(bdDev_list);
        
    } catch (error) {
        console.log("/building/checkvaliduser Error");
        console.log(error.message);
        return res.status(204).send({errMsg: "Server Exc Error"});   
    }
});

router.post("/building/getbddev", auth, async (req, res) => {    
    try {
        // console.log("/building/getbddev");
        // console.log(req.body);
        let {user_id, bd_id} = req.body;
        /** get own device under this building */
        let ownDev= await getBddevBy_userId_bdId(user_id, bd_id);
        if(!ownDev || !Array.isArray(ownDev)) return res.status(204).send({errMsg: "Database(Own) Exc Error"});
        // console.log(ownDev);

        /** get shared device under this building, normally is either 1 */
        let shareDev = await getSharedevBy_userId_bdId(user_id, bd_id);
        if(!shareDev || !Array.isArray(shareDev)) return res.status(204).send({errMsg: "Database(Share) Exc Error"});
        // console.log(shareDev);
        let dev_idList=[];
        for (const dev of shareDev) {
            /** filter multiple shared device  */
            let found = dev_idList.find(c=>c===dev.bdDev_id) > 0 ;
            if(!found) dev_idList.push(dev.bdDev_id);
        }
        // console.log(dev_idList);
        let allDev = [...ownDev];
        let groupSize = 20;
        if(dev_idList.length>0){
            /** loop to query DB part by part */
            for (let i = 0; i < dev_idList.length; i+=groupSize) {
                // console.log("i", i);                
                let sliceArr = dev_idList.slice(i, i+groupSize);
                // console.log(sliceArr);
                let sharedList = await getBddevBy_idList(sliceArr);
                if(!sharedList || !Array.isArray(sharedList)) return res.status(204).send({errMsg: "Database(S.Dev) Exc Error"});
                // console.log(sharedList);
                allDev=[...allDev, ...sharedList];
                // console.log(allDev);
            }
        }        
        
        return res.status(200).send(allDev);
        
    } catch (error) {
        console.log("/building/checkvaliduser Error");
        console.log(error.message);
        return res.status(204).send({errMsg: "Server Exc Error"});        
    }
});

module.exports = router;