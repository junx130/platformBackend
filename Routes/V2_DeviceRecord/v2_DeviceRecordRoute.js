const express = require("express");
const router = express.Router();
const Joi = require("joi");
const auth = require("../../Middleware/auth");
const { getUserByEmail, getUserBy_idList } = require("../../MySQL/userManagement_V2/users_V2");
const { getSensorOwnerBy_TydevID, getBuildingByOwner_id, getBdInfoBy_id, getAreaByOwner_id, getAreaInfoBy_id, insertV2_OwnerList_bd, insertV2_OwnerList_area, insertV2_OwnerList_bdDev, getBuildingByOwner_id_bd_id, getBddevBy_userId_bdId, getBddevBy_idList, getBdList_byid } = require("../../MySQL/V2_DeviceRecord/v2_SensorOwner");
const { getSensorSharedBy_TydevID, getBuildingByActiveUser_id, getAreaByActiveUser_id, getSharedBdBy_user_id_bd_id, getSharedevBy_userId_bdId, setSharedBdActive, addSharedBd, setSharedBdDevActiveStatus, addSharedBdDev, getAllSharedevBy_userId_bdId, getSensorSharedBy_user_bd_accesslvl, getCountSharedBdDev_byBd, getUniqueUserIdList_ByBdList, getUniqueBdId_byUserId, getUniqueUserId_byBdId, updateSharedBd, getShareBdInfoGrantByUser_id, updateSharedBd_UserEdit } = require("../../MySQL/V2_DeviceRecord/v2_SensorSharedUser");
const { notArrOrEmptyArr } = require("../../utilities/validateFn");



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
        /** check whether is new BD */
        let bd_id=body.buildingId;  /** Existing Building Will use this */
        if(body.bNewBuilding){   /** new building, */
            /** store into DB, get the return _id */
            let insBdRel = await insertV2_OwnerList_bd(body)
            //{ affectedRows: 1, insertId: 4, warningStatus: 0 }
            if(!insBdRel) return res.status(203).send({errMsg:"Add New Building Not Success(1)"});
            if(insBdRel.affectedRows<1) return res.status(203).send({errMsg:"Add New Building Not Success(2)"});
            bd_id = insBdRel.insertId;
            // console.log(bd_id);
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
        return res.status(404).send(error.message);     
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
        return res.status(404).send(error.message);     
    }
    
});


const getRelBdFn=async (req, res, _accessLevel) =>{
    try {
        let info = req.body;
        // console.log("info", info);
        /** get owned building */
        let ownedBd = await getBuildingByOwner_id(info.user_id);
        if(!ownedBd) return res.status(203).send({msg:'Database Server Invalid'});

        /** get shared building (access level = 1 , co-owned),  */
        let sharedBd = await getBuildingByActiveUser_id(info.user_id, _accessLevel);
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
        return res.status(404).send(ex.message);        
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
        return res.status(404).send(ex.message);        
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
        return res.status(404).send(ex.message);        
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
        let sharedBd = await getSharedBdBy_user_id_bd_id(user_id, bd_id, true);
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
        console.log(result);
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
module.exports = router;