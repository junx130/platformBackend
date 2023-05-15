const express = require("express");
const router = express.Router();
const Joi = require("joi");
const { parseConnectionUrl } = require("nodemailer/lib/shared");
const auth = require("../../Middleware/auth");
const { getDevBy_SnRegcode } = require("../../MySQL/aploudSetting/deviceList");
const { getUserByEmail, getUserBy_idList, getUserByUsername } = require("../../MySQL/userManagement_V2/users_V2");
const { getByUserId, v2a_getUser } = require("../../MySQL/userManagement_V2/user_ResetPassword");
const { getSensorOwnerBy_TydevID, getBuildingByOwner_id, getBdInfoBy_id, getAreaByOwner_id, getAreaInfoBy_id, insertV2_OwnerList_bd, insertV2_OwnerList_area, insertV2_OwnerList_bdDev, getBuildingByOwner_id_bd_id, getBddevBy_userId_bdId, getBddevBy_idList, getBdList_byid, v2a_getFloorinBd, v2a_getDeviceInBd, v2a_getAreaRelated, getSensorOwnerBy_TydevID_inUse, v2aInsertFloor, v2aGetBdDevRegBefore, v2aUpdateOwnerList_bdDev, v2aUpdateSortIdx_bd, v2aRenameBd, v2aUpdateSortIdx_floor, v2aRenameFloor, v2aUpdateSortIdx_area, v2aRenameArea, v2aDeleteArea, v2aDeleteFloor, v2aClearFloorArea_id, v2aClearArea_id, v2a_getInactiveFloor, v2aInsertUpdatefloor, v2a_getInactiveArea, v2aInsertUpdateArea, v2a_getAllAreaUnderBd, v2aUpdatebdDevFloor_Area, v2aUpdateSortIdx_device, v2aRenameDev, v2aDeleteDev, v2aSwapDev, getBddevBy_id, v2aDeteachDev, v2a_getShareBuilding_byUser_id, v2a_getShareBd_byBdID_UserId, v2a_getShareBddev_byBdID_UserId, v2a_getAllFloorInBd, v2a_getAllAreaInBd, v2a_updateSharedBd, v2a_InsertSharedBd, v2a_getShareBddev_byBdID_UserId_bdDevId, v2a_updateSharedBdDevAccessLevel, v2a_InsertSharedBdDev, v2a_DeactivateShareDev, v2a_getShareBd_byBdID, v2a_deactivateSharedBd, v2a_getShareBd_byBdID_UserId_IncNonActive, v2a_getAreaInfloor, getFavBd_ByUser_Id, getFavBd_ByUserId_bdId, insertFavBd, updateFavBd, favBdSetEmpty } = require("../../MySQL/V2_DeviceRecord/v2_SensorOwner");
const { getSensorSharedBy_TydevID, getBuildingByActiveUser_id, getAreaByActiveUser_id, getSharedBdBy_user_id_bd_id, getSharedevBy_userId_bdId, setSharedBdActive, addSharedBd, setSharedBdDevActiveStatus, addSharedBdDev, getAllSharedevBy_userId_bdId, getSensorSharedBy_user_bd_accesslvl, getCountSharedBdDev_byBd, getUniqueUserIdList_ByBdList, getUniqueBdId_byUserId, getUniqueUserId_byBdId, updateSharedBd, getShareBdInfoGrantByUser_id, updateSharedBd_UserEdit, v2a_getSharedBdBy_user_id_bd_id } = require("../../MySQL/V2_DeviceRecord/v2_SensorSharedUser");
const { notArrOrEmptyArr, isEmptyObject, notEmptyArr } = require("../../utilities/validateFn");



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
        let body = req.body;
        /** validate Data */
        let {error: valErr} = valRegSenInfo(body);
        if(valErr) return res.status(203).send({errMsg:valErr.details[0].message});

        /** check bdDev duplication */
        let sensorDuplication = await getSensorOwnerBy_TydevID(body);
        if(!Array.isArray(sensorDuplication)) return res.status(203).send({errMsg:"DB server Error"});
        if(sensorDuplication.length > 0) return res.status(203).send({errMsg:"Device Duplicated"});
        /** check whether is new BD */
        let bd_id=body.buildingId;  /** Existing Building Will use this */
        if(body.bNewBuilding){   /** new building, */
            /** store into DB, get the return _id */
            let insBdRel = await insertV2_OwnerList_bd(body)
            //{ affectedRows: 1, insertId: 4, warningStatus: 0 }
            if(!insBdRel) return res.status(203).send({errMsg:"Add New Building Not Success(1)"});
            if(insBdRel.affectedRows<1) return res.status(203).send({errMsg:"Add New Building Not Success(2)"});
            bd_id = insBdRel.insertId;
        }

        let area_id = body.areaId;
        if(body.bNewArea){      /** new area */
            /** store into area db */
            let insAreaRel = await insertV2_OwnerList_area(body, bd_id)
            if(!insAreaRel) return res.status(203).send({errMsg:"Add New Area Not Success(1)"});
            if(insAreaRel.affectedRows<1) return res.status(203).send({errMsg:"Add New Area Not Success(2)"});
            area_id = insAreaRel.insertId;
            // console.log(area_id);
        }

        /** Log into dev DB */
        let insDevRel = await insertV2_OwnerList_bdDev(body, bd_id, area_id);
        if(!insDevRel) return res.status(203).send({errMsg:"Add New Sensor Not Success"});
        
        return res.status(200).send({reqSuccess:true});


    } catch (error) {
        console.log("Error : /sensorowner/regnewsensor");
        console.log(error.message);
        return res.status(203).send(error.message);     
    }
});

/** get InvolvedArea */
router.post("/area/getrelated", auth, async (req, res) => {    
    try {
        let info = req.body;
        /** get owned building area */
        let ownedArea = await getAreaByOwner_id(info.user_id, info.selectedBuilding);        
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
        return res.status(203).send(error.message);     
    }
    
});


const getRelBdFn=async (req, res, _accessLevel) =>{
    try {
        let info = req.body;
        /** get owned building */
        let ownedBd = await getBuildingByOwner_id(info.user_id);
        if(!ownedBd) return res.status(203).send({msg:'Database Server Invalid'});

        /** get shared building (access level = 1 , co-owned),  */
        let shareBdList = await v2a_getShareBuilding_byUser_id(info.user_id)
        let bd_idList = [];
        let share_bdList = [];
        if(!notArrOrEmptyArr(shareBdList)){     /** got some share building */
            /** load share building info  */
            for (const eachBd of shareBdList) {
                let foundIdx = ownedBd.findIndex(c=>c._id === eachBd.buidling_id);
                if(foundIdx < 0) bd_idList.push(eachBd.buidling_id);
            }
            if(!notArrOrEmptyArr(bd_idList)){
                share_bdList = await getBdList_byid(bd_idList);
    
                /** insert shareLevel of each building */
                for (const eachShareBd of share_bdList) {
                    let foundIdx = shareBdList.findIndex(c=>c.buidling_id === eachShareBd._id);
                    if(foundIdx >= 0) eachShareBd.shareLevel = shareBdList[foundIdx].shareLevel;
                }
            }
        }
        /** Filter duplicated data */
        // let uniqueSharedBd = Array.from(
        //     new Set(sharedBd.map((a) => a.buidling_id))
        // ).map((buidling_id) => {
        //     return sharedBd.find((a) => a.buidling_id === buidling_id);
        // });
        
        let relatedBuilding=[...ownedBd, ...share_bdList];
        
        return res.status(200).send(relatedBuilding);  
    } catch (error) {        
        console.log("Error : /building/getrelated", error.message);
        return res.status(203).send(error.message);     
    }
}

router.post("/building/getrelatedownLevel", auth, async (req, res) => {
    await getRelBdFn(req, res, 1);
})


/** get involved building */
router.post("/building/getrelated", auth, async (req, res) => {
    await getRelBdFn(req, res);
});




router.post("/sensorowner/getbytyid", auth, async (req, res) => {    
    try {
        // console.log(req.params.userid);
        // console.log(req.body);
        
        let result = await getSensorOwnerBy_TydevID(req.body);
        // console.log(result);
        if(!result) return res.status(203).send(result);    // catch error
        return res.status(200).send(result);        
    } catch (ex) {
        console.log("Get Status Threshold Error");
        return res.status(203).send(ex.message);        
    }
});


router.post("/sensorshared/getbyuserbdaccesslvl", auth, async (req, res) => {    
    try {        
        let result = await getSensorSharedBy_user_bd_accesslvl(req.body);
        // console.log(result);
        if(!result) return res.status(203).send(result);    // catch error
        return res.status(200).send(result);        
    } catch (ex) {
        console.log("Get Status Threshold Error");
        return res.status(203).send(ex.message);        
    }
});


router.post("/sensorshared/sharesensor", auth, async (req, res) => {    
    try {
        let {shareInfo} = req.body;
        let {receiverList, owner_id, devList, buidling_id, user_id, accessLevel} = shareInfo;
        for (const eachEmail of receiverList) {
            let user = await getUserByEmail(eachEmail);
            if(!user) {
                // console.log('User Not valid');
                continue 
            }
            if(user._id === owner_id || user._id === user_id) {
                // console.log('Skip share to own account');
                continue
            }
            /*********** Update share building *************/
            let sharedBd = await getSharedBdBy_user_id_bd_id(user._id, buidling_id, false);

            if (Array.isArray(sharedBd) &&  sharedBd.length > 0) {    /** check array is not empty */
                if (sharedBd.active !== true || sharedBd.accessLevel !== accessLevel) {
                    // console.log("setbdactive");
                    await setSharedBdActive(user._id, buidling_id, accessLevel);
                } 
            }else {     /** user is in shared bd List */
                await addSharedBd(shareInfo, user._id);
                // console.log("addsharedbd" + result);
            }


            /************ update share device list ************/
            let shareBdDev = await getAllSharedevBy_userId_bdId(user._id, buidling_id);
            // console.log("sharebddev", shareBdDev);
            // console.log("Dev Len",shareBdDev.length);
            for (const eachDev of devList) {
                let found = null;
                if (Array.isArray(shareBdDev) && shareBdDev.length > 0)
                    found = shareBdDev.find(e => e.bdDev_id === eachDev.bdDev_id);
                if (eachDev.selected) {     /** user checked */
                    if (found) {        /** device exist in DB */
                        if (!found.active || found.accessLevel !== accessLevel) {   /** device not active, or access level changed */
                            await setSharedBdDevActiveStatus(found._id , true, accessLevel);
                        }
                    }else {     /** device not exist in DB */
                        shareInfo.bdDev_id = eachDev.bdDev_id;
                        await addSharedBdDev(shareInfo, user._id);
                    }
                }else {      /** user didint check */
                    if (found) {    /** device exist in DB */
                        if (found.active) {     /** set device active to false */
                            await setSharedBdDevActiveStatus(found._id, false, accessLevel);
                        }
                    }
                }
            }
        }        

        return res.status(200).send();        
    } catch (ex) {
        console.log("sensorshared/sharesensor Error");
        console.log(ex.message);
        return res.status(203).send(ex.message);        
    }
});

router.post("/sensorshared/getsharedbddevbyuseridbdid", auth, async (req, res) => {    
    /** get device */
    try {
        let {user_id, bd_id} = req.body;
        let sharedBd = await getSharedevBy_userId_bdId(user_id, bd_id, true);
        if(!sharedBd) return res.status(203).send({errMsg: "Database Error"});
        return res.status(200).send(sharedBd);        
    } catch (error) {
        console.log("getsharedbddevbyuseridbdid err : ",error.message);
        return res.status(203).send({errMsg: "Database Error"});
    }
});

router.post("/sensorshared/getsharedbdbyuseridbdid", auth, async (req, res) => {    
    /** get device */
    try {
        let {user_id, bd_id} = req.body;
        let sharedBd = await getSharedBdBy_user_id_bd_id(user_id, bd_id, true);
        if(!sharedBd) return res.status(203).send({errMsg: "Database Error"});
        return res.status(200).send(sharedBd);        
    } catch (error) {
        console.log("getsharedbdbyuseridbdid err : ",error.message);
        return res.status(203).send({errMsg: "Database Error"});
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
        if(!ownBd || !Array.isArray(ownBd)) return res.status(203).send({errMsg: "Database(Own) Exc Error"});
        if(ownBd.length > 0) return res.status(200).send({bdAccess:true, status:'Owner'});

        /** User Not owner, Check shared building */
        let sharedBd = await v2a_getSharedBdBy_user_id_bd_id(user_id, bd_id, true);
        if(!sharedBd || !Array.isArray(sharedBd)) return res.status(203).send({errMsg: "Database(Share) Exc Error"});
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
        // console.log(bdDev_list);
        if(!bdDev_list) return res.status(203).send({errMsg: "Database Error"});
        
        return res.status(200).send(bdDev_list);
        
    } catch (error) {
        console.log("/building/checkvaliduser Error");
        console.log(error.message);
        return res.status(203).send({errMsg: "Server Exc Error"});   
    }
});

router.post("/building/getbddev", auth, async (req, res) => {    
    try {
        // console.log("/building/getbddev");
        // console.log(req.body);
        let {user_id, bd_id} = req.body;
        let _user_id = user_id;
        /** check whether this is building owner */
        let isOwner = await getBuildingByOwner_id_bd_id(user_id, bd_id);        
        if(notArrOrEmptyArr(isOwner)){  // not building owner
            // check whether is share user            
            let isShareUser = await getSharedBdBy_user_id_bd_id(user_id, bd_id);        
            if(notArrOrEmptyArr(isShareUser)){
                return res.status(200).send([]);    // is not valid user, return null 
            }else{      // is a shared user, modify the user_id
                // console.log("isShareUser", isShareUser);
                _user_id = isShareUser[0].owner_id;
            }
        }
        // [V2_DeviceRecord]> V2_OwnerList_bd;

        
        /** get own device under this building */
        let ownDev= await getBddevBy_userId_bdId(_user_id, bd_id);
        if(!ownDev || !Array.isArray(ownDev)) return res.status(203).send({errMsg: "Database(Own) Exc Error"});
        // console.log(ownDev);

        /************* Temporary remove this *************** */
            // /** get shared device under this building, normally is either 1 */
            // let shareDev = await getSharedevBy_userId_bdId(user_id, bd_id);
            // if(!shareDev || !Array.isArray(shareDev)) return res.status(203).send({errMsg: "Database(Share) Exc Error"});
            // // console.log(shareDev);
            // let dev_idList=[];
            // for (const dev of shareDev) {
            //     /** filter multiple shared device  */
            //     let found = dev_idList.find(c=>c===dev.bdDev_id) > 0 ;
            //     if(!found) dev_idList.push(dev.bdDev_id);
            // }
        /**************************** */

        // console.log(dev_idList);
        let allDev = [...ownDev];
        // let groupSize = 20;
        // if(dev_idList.length>0){
        //     /** loop to query DB part by part */
        //     for (let i = 0; i < dev_idList.length; i+=groupSize) {
        //         // console.log("i", i);                
        //         let sliceArr = dev_idList.slice(i, i+groupSize);
        //         // console.log(sliceArr);
        //         let sharedList = await getBddevBy_idList(sliceArr);
        //         if(!sharedList || !Array.isArray(sharedList)) return res.status(203).send({errMsg: "Database(S.Dev) Exc Error"});
        //         // console.log(sharedList);
        //         allDev=[...allDev, ...sharedList];
        //         // console.log(allDev);
        //     }
        // }        
        
        return res.status(200).send(allDev);
        
    } catch (error) {
        console.log("/building/checkvaliduser Error");
        console.log(error.message);
        return res.status(203).send({errMsg: "Server Exc Error"});        
    }
});

router.post("/building/getcountbddev", auth, async (req, res) => {    
    try {
        let info = req.body
        let count = await getCountSharedBdDev_byBd(info.bd_id);
        // console.log(count);
        if(count === null) return res.status(203).send({errMsg: "Database Error"});
        
        return res.status(200).send({ count });
        
    } catch (error) {
        console.log("/building/getcountbddev Error");
        console.log(error.message);
        return res.status(203).send({errMsg: "Server Exc Error"});   
    }
});

/** Add Share User */
router.post("/building/sharetoemaillist", auth, async (req, res) => {    
    try {
        let info = req.body
        let user = req.user;
        let emailList = [...info.emailList];
        
        /** get building owner */
        let bdInfo = await getBdInfoBy_id(info.bd_id);
        if(notArrOrEmptyArr(bdInfo)) return res.status(203).send({ errMsg: "Invalid Building Info (DB)" });

        let toShareBdInfo={
            buidling_id:info.bd_id, 
            // user_id,        // get by email
            owner_id:bdInfo[0].owner_id,       // 
            grantBy:user.user_id,
            accessLevel:info.accessLevel,
        }

        let bShareDbErr = false;

        for (const eachEmail of emailList) {
            /** get user_id of each email */ 
            let shareUserInfo = await getUserByEmail(eachEmail);
            if(!shareUserInfo) continue            
            // console.log("shareUserInfo",shareUserInfo);

            /** skip if share user is owner*/
            if(shareUserInfo._id === toShareBdInfo.owner_id){
                // console.log("Skip shared to owner");
                continue
            }

            /** check whether user is grant by own before */
            toShareBdInfo.user_id = shareUserInfo._id;            
            let shareRecord = await getSharedBdBy_user_id_bd_id(shareUserInfo._id, toShareBdInfo.buidling_id, false);
            
            /** didnt share before, insert new */            
            let bInsert=true;
            let grantBy_id = 0;
            // let prevHisRecord={};
            if(!notArrOrEmptyArr(shareRecord)){     
                let grantBySamePerson = shareRecord.find((c)=>c.grantBy === user.user_id);
                if(grantBySamePerson){
                        grantBy_id = grantBySamePerson._id;
                        bInsert=false;
                }                
            }

            if(bInsert){        // insert logic
                let inserRel = await addSharedBd(toShareBdInfo);
                // console.log("inserRel", inserRel);
                if(!inserRel.success) bShareDbErr = true;
            }else{      // update logic
                let updateRel = await updateSharedBd(toShareBdInfo, grantBy_id)
                // console.log("updateRel", updateRel);
                if(!updateRel) bShareDbErr = true;
            }     
            /** get user_id and store into database */
        }
        
        if(bShareDbErr) return res.status(203).send({ errMsg: "Share User Error (DB)"});

        return res.status(200).send({success:true});
        
    } catch (error) {
        console.log("/building/sharetoemaillist Error");
        console.log(error.message);
        return res.status(203).send({errMsg: "Server Exc Error"});   
    }
});

router.post("/building/getuniqueuserlistbybdlist", auth, async (req, res) => {    
    try {
        let info = req.body
        let idx = 0;
        let sliceSize = 1;
        let user_idList = [];
        let totalItn = info.bdList.length / sliceSize;
        do {
            let temp = info.bdList.slice(0, sliceSize);
            // console.log("temp", temp);
            info.bdList = info.bdList.slice(sliceSize, info.bdList.length);
            let userinfoList = await getUniqueUserIdList_ByBdList(temp);
            if(!userinfoList) return res.status(203).send({errMsg:"Get User List Error"});
            user_idList = [...user_idList, ...userinfoList];
            // console.log("userlist", user_idList);
            idx++;
        } while (idx < totalItn);
        
        
        idx = 0;
        let userList = [];
        totalItn = user_idList.length / sliceSize;
        
        do {
            let temp = user_idList.slice(0, sliceSize);
            // console.log("temp", temp);
            user_idList = user_idList.slice(sliceSize, user_idList.length);
            let userIdList = [];
            for (const eachUser of temp) {
                userIdList.push(eachUser.user_id);
            }
            // console.log(userIdList);
            let userInfoRel = await getUserBy_idList(userIdList);
            if (!userInfoRel) return res.status(203).send({ errMsg: "Get User Info Error" });
            userList = [...userList, ...userInfoRel];
            idx++;
        } while (idx < totalItn);
        // console.log(userList);

        return res.status(200).send(userList);
        
    } catch (error) {
        console.log("/building/getcountbddev Error");
        console.log(error.message);
        return res.status(203).send({errMsg: "Server Exc Error"});   
    }
});

router.post("/building/getbdlistbyuid", auth, async (req, res) => {    
    /** get shared bd list */
    try {
        let info = req.body
        let result = await getUniqueBdId_byUserId(info.user_id);
        console.log(result);
        // console.log(count);
        if(result === null) return res.status(203).send({errMsg: "Database Error"});
        
        let idx = 0;
        let bdList = [];
        let sliceSize = 50;
        let totalItn = result.length / sliceSize;
        
        do {
            let temp = result.slice(0, sliceSize);
            result = result.slice(sliceSize, result.length);
            let idList = [];
            for (const eachRel of temp) {
                idList.push(eachRel.buidling_id);
            }
            let bd = await getBdList_byid(idList);
            if(bd === null) return res.status(203).send({errMsg: "Database Error"});
            bdList = [...bdList, ...bd];
            idx++;
        } while (idx < totalItn)
        return res.status(200).send(bdList);
        
    } catch (error) {
        console.log("/building/getcountbddev Error");
        console.log(error.message);
        return res.status(203).send({errMsg: "Server Exc Error"});   
    }
});

router.post("/building/getownbdbyuserid_bdid", auth, async (req, res) => {    
    /** get shared bd list */
    try {
        let info = req.body
        let result = await getBuildingByOwner_id_bd_id(info.user_id, info.bd_id);
        // console.log(result);
        // console.log(count);
        if(result === null) return res.status(203).send({errMsg: "Database Error"});

        return res.status(200).send(result);
        
    } catch (error) {
        console.log("/building/getownbdbyuserid_bdid Error");
        console.log(error.message);
        return res.status(203).send({errMsg: "Server Exc Error"});   
    }
});

router.post("/building/getshareduserbybdiduserid", auth, async (req, res) => {    
    try {
        let info = req.body;
        let user = req.user;
        // console.log("info", info);
        // console.log("user", user);
        /** get shared user grant by current user */
        let grantByList = await getShareBdInfoGrantByUser_id(user.user_id, info.bd_id);
        // console.log("grantByList", grantByList);
        if(!grantByList) return res.status(203).send({errMsg: "Database Error"});

        for (const eachGrant of grantByList) {
            /** fill up user email address */
            let userInfo = await getUserBy_idList([eachGrant.user_id]);
            // console.log("userInfo", userInfo);
            if(notArrOrEmptyArr(userInfo)) continue;
            eachGrant.email = userInfo[0].email;
        }

        return res.status(200).send(grantByList);
        
    } catch (error) {
        console.log("/building/getshareduserbybdiduserid Error");
        console.log(error.message);
        return res.status(203).send({errMsg: "Server Exc Error"});   
    }
});

router.post("/building/editshareduser", auth, async (req, res) => {    
    try {
        let {userList} = req.body;
        // let user = req.user;
        // console.log("userList", userList);
        let bUpdateError=false;
        for (const eachSharedUser of userList) {
            let newUserLvl = eachSharedUser.newAccessLvl?eachSharedUser.newAccessLvl:eachSharedUser.accessLevel;
            if(eachSharedUser.bToDelete){
                let updateRel = await updateSharedBd_UserEdit(eachSharedUser._id, newUserLvl ,0);
                if(!updateRel) bUpdateError= true;
                // console.log("updateRel(del): ", updateRel);
                continue
            }
            let updateRel = await updateSharedBd_UserEdit(eachSharedUser._id, newUserLvl ,1);
            if(!updateRel) bUpdateError= true;
            // console.log("updateRel(del): ", updateRel);
        }

        if(bUpdateError) return res.status(203).send({errMsg: "User Edit Interrupted"});
        return res.status(200).send({success:true});
        
    } catch (error) {
        console.log("/building/getshareduserbybdiduserid Error");
        console.log(error.message);
        return res.status(203).send({errMsg: "Server Exc Error"});   
    }
});



/**-------Version 2a---------- */
router.post("/floor/getrelated", auth, async (req, res) => {    
    try {
        let info = req.body;
        /** get owned building area */
        let floorInBd = await v2a_getFloorinBd(info.bd_id);        
        if(!floorInBd) return res.status(203).send({errMsg:'DB Invalid'});

        // console.log("relatedBuilding", relatedBuilding);
        return res.status(200).send(floorInBd);      
        
    } catch (error) {
        console.log("Error : /floor/getrelated");
        console.log(error.message);
        return res.status(203).send(error.message);     
    }
});

router.post("/bd/getdevicesinbd", auth, async (req, res) => {    
    try {
        let info = req.body;
        /** get owned building area */
        let devInBd = await v2a_getDeviceInBd(info.bd_id);        
        if(!devInBd) return res.status(203).send({errMsg:'DB Invalid'});

        return res.status(200).send(devInBd);      
        
    } catch (error) {
        console.log("Error : /bd/getdevicesinbd");
        console.log(error.message);
        return res.status(203).send(error.message);     
    }
});

router.post("/area/v2agetarea", auth, async (req, res) => {    
    try {
        let {bd_id, floor_id} = req.body;
        /** get owned building area */
        let floorInBd = await v2a_getAreaRelated(bd_id, floor_id);
        if(!floorInBd) return res.status(203).send({errMsg:'DB Invalid'});

        return res.status(200).send(floorInBd);      
        
    } catch (error) {
        console.log("Error : /bd/getdevicesinbd");
        console.log(error.message);
        return res.status(203).send(error.message);     
    }
    
});


router.post("/sensorowner/v2aregnewsensor", auth, async (req, res) => {    
    try {
        let {sensorInfo} = req.body;
        /** verify Serial No. and Reg Code */
        let deviceInfo = await getDevBy_SnRegcode({SerialNo:sensorInfo.SerialNo, RegCode:sensorInfo.RegCode});
        if(!deviceInfo) return res.status(203).send({errMsg: "DB Error (Dev)"});
        if(notArrOrEmptyArr(deviceInfo)) return res.status(203).send({errMsg: "Invalid Serial No. or Register Code"});
        /** check device whether been registered */
        let bdDevInfo = await getSensorOwnerBy_TydevID_inUse(deviceInfo[0]);
        if(!bdDevInfo) return res.status(203).send({errMsg: "DB Error (bdDev)"});
        if(!notArrOrEmptyArr(bdDevInfo)) return res.status(203).send({errMsg: "Device been registered"});
        /** insert new Building */
        let buidling_id = 0;
        if(!sensorInfo.bNewBuilding)  buidling_id=sensorInfo.buildingId;
        else{
            let addBdRel = await insertV2_OwnerList_bd(sensorInfo);
            if(!addBdRel) return res.status(203).send({errMsg:"Add New Building Not Success(1)"});
            if(addBdRel.affectedRows<1) return res.status(203).send({errMsg:"Add New Building Not Success(2)"});
            buidling_id = addBdRel.insertId;
        }
        /** insert new floor */
        let floor_id = 0;
        if(!sensorInfo.bNewFloor) floor_id =sensorInfo.floorId;
        else{
            let addFloorRel = await v2aInsertFloor({name:sensorInfo.bFloorName, owner_id:sensorInfo.bdOwner_id, buidling_id});
            if(!addFloorRel) return res.status(203).send({errMsg:"Add New Monitoring List Not Success(1)"});
            if(addFloorRel.affectedRows<1) return res.status(203).send({errMsg:"Add New Monitoring List Not Success(2)"});
            floor_id = addFloorRel.insertId;
        }
        /** insert new area */
        let area_id=0;
        if(!sensorInfo.bNewArea)    area_id = sensorInfo.areaId;
        else{
            let addArearel = await insertV2_OwnerList_area({name:sensorInfo.bAreaName, owner_id:sensorInfo.bdOwner_id, buidling_id, floor_id});
            if(!addArearel) return res.status(203).send({errMsg:"Add New Sub Monitoring List Not Success(1)"});
            if(addArearel.affectedRows<1) return res.status(203).send({errMsg:"Add New Sub Monitoring List Not Success(2)"});
            area_id = addArearel.insertId;
        }
        /** insert bdDev */
        /** find if bd_id, dev, and type same but active is not, update active to 1 */
        let unUsedSlot = await v2aGetBdDevRegBefore({type:deviceInfo[0].type, devID:deviceInfo[0].devID, owner_id:sensorInfo.bdOwner_id, buidling_id});
        if(!notArrOrEmptyArr(unUsedSlot)){  /** found un-used slot, update */
            let updateRel = await v2aUpdateOwnerList_bdDev(sensorInfo, deviceInfo[0].type, deviceInfo[0].devID, unUsedSlot[0]._id);
            if(!updateRel) return res.status(203).send({errMsg:"Insert Device Err(Update)"});
        }else{  /** insert new bdDev slot */
            let insertBdDevRel = await insertV2_OwnerList_bdDev(sensorInfo, deviceInfo[0].type, deviceInfo[0].devID, buidling_id, floor_id, area_id);
            if(!insertBdDevRel) return res.status(203).send({errMsg:"Insert Device Err"});
        }

        return res.status(200).send({Success:true});


    } catch (error) {
        console.log("Error : /sensorowner/regnewsensor");
        console.log(error.message);
        return res.status(203).send({errMsg:error.message});     
    }
});


router.post("/bd/v2aupdatesortidx_bd", auth, async (req, res) => {    
    try {
        let {sortIdx, bd_id} = req.body;
        let updateRel = await v2aUpdateSortIdx_bd(sortIdx, bd_id);
        if(!updateRel) return res.status(203).send({errMsg:"Update DB err"});

        return res.status(200).send({Success:true});


    } catch (error) {
        console.log("Error : /sensorowner/regnewsensor");
        console.log(error.message);
        return res.status(203).send({errMsg:error.message});     
    }
});


router.post("/bd/v2arenamebd", auth, async (req, res) => {    
    try {
        let {name, bd_id} = req.body;
        let updateRel = await v2aRenameBd(name, bd_id);
        if(!updateRel) return res.status(203).send({errMsg:"Update DB err"});

        return res.status(200).send({Success:true});


    } catch (error) {
        console.log("Error : /bd/v2arenamebd", error.message);
        return res.status(203).send({errMsg:error.message});     
    }
});


router.post("/bd/v2aupdatesortidx_floor", auth, async (req, res) => {    
    try {
        let {floorList} = req.body;
        for (const eachFloor of floorList) {
            let updateRel = await v2aUpdateSortIdx_floor(eachFloor.sortIdx, eachFloor._id);
            if(!updateRel) return res.status(203).send({errMsg:"Update DB err"});
        }

        return res.status(200).send({Success:true});


    } catch (error) {
        console.log("Error : /sensorowner/regnewsensor");
        console.log(error.message);
        return res.status(203).send({errMsg:error.message});     
    }
});

router.post("/bd/v2arenamefloor", auth, async (req, res) => {    
    try {
        let {name, floor_id} = req.body;
        let updateRel = await v2aRenameFloor(name,floor_id);
        if(!updateRel) return res.status(203).send({errMsg:"Update DB err"});

        return res.status(200).send({Success:true});


    } catch (error) {
        console.log("Error : /bd/v2arenamebd", error.message);
        return res.status(203).send({errMsg:error.message});     
    }
});

router.post("/bd/v2aupdatesortidx_area", auth, async (req, res) => {    
    try {
        let {areaList} = req.body;
        for (const eachArea of areaList) {
            let updateRel = await v2aUpdateSortIdx_area(eachArea.sortIdx, eachArea._id);
            if(!updateRel) return res.status(203).send({errMsg:"Update DB err"});
        }

        return res.status(200).send({Success:true});


    } catch (error) {
        console.log("Error : /bd/v2aupdatesortidx_area");
        console.log(error.message);
        return res.status(203).send({errMsg:error.message});     
    }
});

router.post("/bd/v2arenamearea", auth, async (req, res) => {    
    try {
        let {name, area_id} = req.body;
        let updateRel = await v2aRenameArea(name,area_id);
        if(!updateRel) return res.status(203).send({errMsg:"Update DB err"});

        return res.status(200).send({Success:true});


    } catch (error) {
        console.log("Error : /bd/v2arenamearea", error.message);
        return res.status(203).send({errMsg:error.message});     
    }
});

router.post("/bd/v2adeletearea", auth, async (req, res) => {    
    try {
        let {area_id} = req.body;
        let updateRel = await v2aDeleteArea(area_id);
        if(!updateRel) return res.status(203).send({errMsg:"Update DB err"});

        return res.status(200).send({Success:true});


    } catch (error) {
        console.log("Error : /bd/v2adeletearea", error.message);
        return res.status(203).send({errMsg:error.message});     
    }
});

router.post("/bd/v2adeletefloor", auth, async (req, res) => {    
    try {
        let {floor_id} = req.body;
        /** get area under floor, delete each area */
        let areaUnderFloor = await v2a_getAreaInfloor(floor_id);
        if(areaUnderFloor){
            for (const eachArea of areaUnderFloor) {
                let updateRel_Area = await v2aDeleteArea(eachArea._id);
            }
        }

        let updateRel = await v2aDeleteFloor(floor_id);
        if(!updateRel) return res.status(203).send({errMsg:"Update DB err"});

        return res.status(200).send({Success:true});


    } catch (error) {
        console.log("Error : /bd/v2adeletearea", error.message);
        return res.status(203).send({errMsg:error.message});     
    }
});

router.post("/bd/v2aclear_floor_area_id", auth, async (req, res) => {    
    try {
        let {devList} = req.body;
        for (const eachDev of devList) {
            let updateRel = await v2aClearFloorArea_id(eachDev._id);
            if(!updateRel) return res.status(203).send({errMsg:"Update DB err"});
        }

        return res.status(200).send({Success:true});


    } catch (error) {
        console.log("Error : /bd/v2adeletearea", error.message);
        return res.status(203).send({errMsg:error.message});     
    }
});

router.post("/bd/v2aclear_area_id", auth, async (req, res) => {    
    try {
        let {devList} = req.body;
        for (const eachDev of devList) {
            let updateRel = await v2aClearArea_id(eachDev._id);
            if(!updateRel) return res.status(203).send({errMsg:"Update DB err"});
        }

        return res.status(200).send({Success:true});


    } catch (error) {
        console.log("Error : /bd/v2adeletearea", error.message);
        return res.status(203).send({errMsg:error.message});     
    }
});


router.post("/floor/insert", auth, async (req, res) => {    
    try {
        let {name, owner_id, buidling_id} = req.body;
        /** find any inactive floor */
        let inactiveRow = await v2a_getInactiveFloor();
        if(inactiveRow.length >= 1){   /** yes, update */   
            let updateRel = await v2aInsertUpdatefloor({name, owner_id, buidling_id}, inactiveRow[0]._id);
            if(!updateRel) return res.status(203).send({errMsg:"Add group error (Update)"});
        }else{     /** no, insert */
            let insertRel = await v2aInsertFloor({name, owner_id, buidling_id});
            if(!insertRel) return res.status(203).send({errMsg:"Add group error (Insert)"});
        }

        return res.status(200).send({Success:true});

    } catch (error) {
        console.log("Error : /bd/v2adeletearea", error.message);
        return res.status(203).send({errMsg:error.message});     
    }
});


router.post("/area/insert", auth, async (req, res) => {    
    try {
        let {name, owner_id, buidling_id, floor_id} = req.body;
        /** find any inactive floor */
        let inactive = await v2a_getInactiveArea();
        if(inactive.length > 0){    /** if got inactive, update */
            let updateRel = await v2aInsertUpdateArea({name, owner_id, buidling_id, floor_id}, inactive[0]._id);
            if(!updateRel) return res.status(203).send({errMsg:"Add subgroup error (Update)"});
        }else{      /** if no inactive, insert */
            let insertRel = await insertV2_OwnerList_area({name, owner_id, buidling_id, floor_id});
            if(!insertRel) return res.status(203).send({errMsg:"Add subugroup error (Insert)"});
        }

        return res.status(200).send({Success:true});

    } catch (error) {
        console.log("Error : /bd/v2adeletearea", error.message);
        return res.status(203).send({errMsg:error.message});     
    }
});

router.post("/area/getall", auth, async (req, res) => {    
    try {
        let {bd_id} = req.body;
        /** find any inactive floor */
        let allArea =  await v2a_getAllAreaUnderBd(bd_id);
        if(!allArea) return res.status(203).send({errMsg:'DB Error'});

        return res.status(200).send(allArea);

    } catch (error) {
        console.log("Error : /area/getall", error.message);
        return res.status(203).send({errMsg:error.message});     
    }
});




router.post("/bdDev/updatefloorarea_id", auth, async (req, res) => {    
    try {
        let {devList} = req.body;
        for (const eachDev of devList) {
            let updateRel = await v2aUpdatebdDevFloor_Area(eachDev);
            if(!updateRel) return res.status(203).send({errMsg:"Update DB err"});
        }

        return res.status(200).send({Success:true});


    } catch (error) {
        console.log("Error : /bdDev/updatefloorarea_id", error.message);
        return res.status(203).send({errMsg:error.message});     
    }
});


router.post("/bdDev/updatedevicesort", auth, async (req, res) => {    
    try {
        let {devList} = req.body;
        for (const eachDev of devList) {
            let updateRel = await v2aUpdateSortIdx_device(eachDev.sortIdx, eachDev._id);
            if(!updateRel) return res.status(203).send({errMsg:"Update DB err"});
        }

        return res.status(200).send({Success:true});

    } catch (error) {
        console.log("Error : /bdDev/updatedevicesort", error.message);
        return res.status(203).send({errMsg:error.message});     
    }
});

router.post("/bdDev/rename", auth, async (req, res) => {    
    try {
        let {newName, _id} = req.body;
        let updateRel = await v2aRenameDev(newName, _id);
        if(!updateRel) return res.status(203).send({errMsg:"Update DB err"});

        return res.status(200).send({Success:true});

    } catch (error) {
        console.log("Error : /bdDev/rename", error.message);
        return res.status(203).send({errMsg:error.message});     
    }
});


router.post("/bdDev/delete", auth, async (req, res) => {    
    try {
        let {_id} = req.body;
        let updateRel = await v2aDeleteDev(_id);
        if(!updateRel) return res.status(203).send({errMsg:"Update DB err"});

        return res.status(200).send({Success:true});

    } catch (error) {
        console.log("Error : /bdDev/delete", error.message);
        return res.status(203).send({errMsg:error.message});     
    }
});


router.post("/bdDev/swap", auth, async (req, res) => {    
    try {
        let {owner_id, _id, SerialNo, RegCode} = req.body;
        /** get bdDev by _id, make sure type are compatible */
        let curDev = await getBddevBy_id(_id);

        let newDev = await getDevBy_SnRegcode({SerialNo, RegCode});

        /** check type are compatible */
        if(curDev[0].type !== newDev[0].type) return res.status(203).send({errMsg:"Device type not match"});

        let swapRel = await v2aSwapDev(owner_id, newDev[0].devID, _id);
        if(!swapRel) return res.status(203).send({errMsg:"Update DB err"});

        return res.status(200).send({Success:true});

    } catch (error) {
        console.log("Error : /bdDev/swap", error.message);
        return res.status(203).send({errMsg:error.message});     
    }
});

router.post("/bdDev/deteach", auth, async (req, res) => {    
    try {
        let {_id} = req.body;

        let newDev = await v2aDeteachDev(_id);
        if(!newDev) return res.status(203).send({errMsg:"Update DB err"});

        return res.status(200).send({Success:true});

    } catch (error) {
        console.log("Error : /bdDev/swap", error.message);
        return res.status(203).send({errMsg:error.message});     
    }
});

router.post("/sharebd/getbyuserid_bdid", auth, async (req, res) => {    
    try {
        let {bd_id, user_id} = req.body;

        let sharedBd = await v2a_getShareBd_byBdID_UserId(bd_id, user_id);
        if(!sharedBd) return res.status(203).send({errMsg:"Update DB err"});

        return res.status(200).send(sharedBd);

    } catch (error) {
        console.log("Error : /sharebd/getbyuserid_bdid", error.message);
        return res.status(203).send({errMsg:error.message});     
    }
});


router.post("/sharebddev/getby_userid_bdid", auth, async (req, res) => {    
    try {
        let {bd_id, user_id} = req.body;
        let sharedDev = await v2a_getShareBddev_byBdID_UserId(bd_id, user_id);
        if(!sharedDev) return res.status(203).send({errMsg:"Update DB err"});

        return res.status(200).send(sharedDev);

    } catch (error) {
        console.log("Error : /sharebddev/getby_userid_bdid", error.message);
        return res.status(203).send({errMsg:error.message});     
    }
});

router.post("/building/getcoowned", auth, async (req, res) => {    
    try {
        // let {user_id} = req.body;
        let info = req.body;
        /** get owned building */
        let ownedBd = await getBuildingByOwner_id(info.user_id);
        if(!ownedBd) return res.status(203).send({msg:'Database Server Invalid'});

        /** get shared building (access level = 1 , co-owned),  */
        let shareBdList = await v2a_getShareBuilding_byUser_id(info.user_id)
        let bd_idList = [];
        let share_bdList = [];
        if(!notArrOrEmptyArr(shareBdList)){     /** got some share building */
            /** load share building info  */
            for (const eachBd of shareBdList) {
                let foundIdx = ownedBd.findIndex(c=>c._id === eachBd.buidling_id);
                if(foundIdx < 0 && eachBd.shareLevel >=0 && eachBd.shareLevel <=2) bd_idList.push(eachBd.buidling_id);
            }
            if(!notArrOrEmptyArr(bd_idList)){
                share_bdList = await getBdList_byid(bd_idList);
    
                /** insert shareLevel of each building */
                for (const eachShareBd of share_bdList) {
                    let foundIdx = shareBdList.findIndex(c=>c.buidling_id === eachShareBd._id);
                    if(foundIdx >= 0) eachShareBd.shareLevel = shareBdList[foundIdx].shareLevel;
                }
            }
        }
        
        let relatedBuilding=[...ownedBd, ...share_bdList];
        
        return res.status(200).send(relatedBuilding);  

    } catch (error) {
        console.log("Error : /building/getcoowned", error.message);
        return res.status(203).send({errMsg:error.message});     
    }
});


router.post("/building/getbdinfo_byBd_id", auth, async (req, res) => {    
    try {
        let {bd_id} = req.body;

        let bdInfo = await getBdInfoBy_id(bd_id);
        if(!bdInfo) return res.status(203).send({errMsg:"Get DB err"});

        return res.status(200).send(bdInfo);

    } catch (error) {
        console.log("Error : /building/getbdinfo_byBd_id", error.message);
        return res.status(203).send({errMsg:error.message});     
    }
});

router.post("/floor/getall", auth, async (req, res) => {    
    try {
        let {bd_id} = req.body;

        let bdInfo = await v2a_getAllFloorInBd(bd_id);
        if(!bdInfo) return res.status(203).send({errMsg:"Update DB err"});

        return res.status(200).send(bdInfo);

    } catch (error) {
        console.log("Error : /floor/getall", error.message);
        return res.status(203).send({errMsg:error.message});     
    }
});



router.post("/share/sharedev", auth, async (req, res) => {    
    try {
        let {bd_id, userList, shareLevel, devList} = req.body;
        /** get valid user list */
        let updateErrCnt = 0;
        for (const eachUser of userList) {
            let validUser = await getUserByUsername(eachUser);
            if(!validUser) continue     /** proceed to next user */
            
            /** check existing access level */
            let shareBd = await v2a_getShareBd_byBdID_UserId_IncNonActive(bd_id, validUser._id);
            if(!shareBd) {  /** DB error */
                console.log("Get share device error");
                // continue
            }
            if(notArrOrEmptyArr(shareBd)){      /** no existing value, insert */ 
                /** insert */
                let insertRel = await v2a_InsertSharedBd(bd_id, validUser._id, shareLevel)
                if(!insertRel) updateErrCnt++;
            }else{       /** got existing value, update */  
                /** update */
                let updateRel = await v2a_updateSharedBd(bd_id, validUser._id, shareLevel)
                if(!updateRel) updateErrCnt++;
            }

            if(shareLevel<=2) continue; /** if co-owner, no need to update share dev table */
            
            /** clear all sharedBdDev */
            let deactivateRel = await v2a_DeactivateShareDev(bd_id, validUser._id);
            // console.log("deactivateRel", deactivateRel);

            /** update each share dev access level */
            for (const eachDev of devList) {
                let existRec = await v2a_getShareBddev_byBdID_UserId_bdDevId(bd_id, validUser._id, eachDev);
                if(!existRec) {
                    updateErrCnt++;
                    // continue
                }
                
                if(notArrOrEmptyArr(existRec)){   /** dont have existing record, insert */
                    let insertRel = await v2a_InsertSharedBdDev(bd_id, validUser._id, eachDev, 2);  // <--- share =2 => view only
                    if(!insertRel) updateErrCnt++;                        
                }else{         /** got existing record, update */
                    let updateRel = await v2a_updateSharedBdDevAccessLevel(existRec[0]._id, 2);   // <--- share =2 => view only
                    if(!updateRel) updateErrCnt++;
                }
            }

        }
        if(updateErrCnt > 0 )   return res.status(203).send({errMsg:`Some update progress failed (Qty:${updateErrCnt})`});
        return res.status(200).send({Success:true});

    } catch (error) {
        console.log("Error : /share/sharedev", error.message);
        return res.status(203).send({errMsg:error.message});     
    }
});


router.post("/bd/getshared", auth, async (req, res) => {    
    try {
        let {bd_id} = req.body;

        let sharedUser = await v2a_getShareBd_byBdID(bd_id);
        if(!sharedUser) return res.status(203).send({errMsg:"Update DB err"});

        let _UserList=[];
        for (const eachUser of sharedUser) {
            let userInfo = await v2a_getUser(eachUser.shareUser_id);
            if(notArrOrEmptyArr(userInfo)) continue;
            eachUser.username = userInfo[0].username;
            _UserList.push(eachUser);            
        }
        return res.status(200).send(_UserList);

    } catch (error) {
        console.log("Error : /bd/getshared", error.message);
        return res.status(203).send({errMsg:error.message});     
    }
});


router.post("/shareuser/deactivate", auth, async (req, res) => {    
    try {
        let {bd_id, shareUser_id} = req.body;

        let newDev = await v2a_deactivateSharedBd(bd_id, shareUser_id);
        if(!newDev) return res.status(203).send({errMsg:"Update DB err"});

        return res.status(200).send({Success:true});

    } catch (error) {
        console.log("Error : /bdDev/swap", error.message);
        return res.status(203).send({errMsg:error.message});     
    }
});

router.post("/building/getfavbd", auth, async (req, res) => {
    try {
        let {user_id} = req.body;

        let newDev = await getFavBd_ByUser_Id(user_id);
        if(!newDev) return res.status(203).send({errMsg:"Update DB err"});

        return res.status(200).send(newDev);

    } catch (error) {
        console.log("Error : /building/getfavbd", error.message);
        return res.status(203).send({errMsg:error.message});     
    }
});

router.post("/building/trigfav", auth, async (req, res) => {
    try {
        let {user_id, bd_id, bFavStatus} = req.body;

        let favExist = await getFavBd_ByUserId_bdId(user_id, bd_id, 0);
        let bFavExist = notEmptyArr(favExist);
        if(bFavStatus){     /** set favarite */
            // check db got fav, if yes, ignore.
            if(!bFavExist){
                // if no, check whether got empty slot
                let emptySlot = await getFavBd_ByUserId_bdId(0,0,1);
                if(notEmptyArr(emptySlot)){ // got empty slot, get _id and update it
                    let updateRel = await updateFavBd(user_id, bd_id, emptySlot[0]._id);
                    if(!updateRel) return res.status(203).send({errMsg:"Add Favorite Failed(Update)"});
                }else{   // no empty slot, insert new slot.
                    let insertRel = await insertFavBd(user_id, bd_id);
                    if(!insertRel) return res.status(203).send({errMsg:"Add Favorite Failed(Insert)"});
                }
            }
        }else{      /** remove favorite */
            if(bFavExist){
                // exist in list. set all to user_id = 0, bd_od = 0;
                let delRel = await favBdSetEmpty(user_id, bd_id);
                if(!delRel) return res.status(203).send({errMsg:"Remove Favorite Failed"});
            }
        }

        return res.status(200).send({Success:true});

    } catch (error) {
        console.log("Error : /building/getfavbd", error.message);
        return res.status(203).send({errMsg:error.message});     
    }
});


module.exports = router;