const express = require("express");
const router = express.Router();
const auth = require("../../../Middleware/auth");
const { checkName_ChatID_duplicated, getSingleNotInuse, insertTeleContactList, updateContactList, getInuseGroupbyUser_id, getInuseContactbyUser_id, insertGroupTable, insertContactUnderGroup, getBdDefSubBy_bd_id, getInuseContactby_id, getInuseGroupby_id, setNotInuseDefSub, insertDefSub, updateAsInUseDefSub, selectNotInuseDefSub } = require("../../../MySQL/V2_Action/V2_Tele");
const { notArrOrEmptyArr } = require("../../../utilities/validateFn");

router.post("/insertcontact", auth, async (req, res) => {    
    try {
        let body = req.body;
        let {user_id} = req.user;
        // console.log("body", body);
        // console.log("user_id", user_id);
        /** check whether name or chat id belong to this user duplicated */
        let contactDuplicated = await checkName_ChatID_duplicated(body, user_id);        
        if(!notArrOrEmptyArr(contactDuplicated)) return res.status(203).send({errMsg:'duplicated', duplicated:true, dupContact:contactDuplicated});
        /** not duplicated, search for inUse with 0 */
        let notInuseSlot = await getSingleNotInuse();
        // console.log("notInuseSlot", notInuseSlot);
        let insertSuccess = false;
        let add_id ;
        if(notArrOrEmptyArr(notInuseSlot)){
            /** No Empty Slot, use Insert */
            // console.log("No Empty Slot, use Insert");
            insertSuccess = await insertTeleContactList(body, user_id);
            add_id = insertSuccess.insertId;
        }else{
            /** got empty slot, use Update */
            // console.log("Got empty slot, use Update");
            insertSuccess = await updateContactList(body, user_id, notInuseSlot[0]._id);
            add_id = notInuseSlot[0]._id;
        }

        /** return update/insert result */
        if(!insertSuccess) return res.status(200).send({success:false, errMsg:"Insert contact error"}); 
        return res.status(200).send({success:true, _id:add_id});    

    } catch (error) {
        console.log("insertcontact : ", error.message);
        return res.status(203).send({errMsg: "Database Error (Exp)"});        
    }
});

router.post("/getsubscriber", auth, async (req, res) => {    
    try {
        // let body = req.body;
        let {user_id} = req.user;
        /** query contact */
        let sub_contact = await getInuseContactbyUser_id(user_id)
        // console.log("sub_contact", sub_contact);

        /** query group list */
        let sub_group0 = await getInuseGroupbyUser_id(user_id)
        // console.log("sub_group0", sub_group0);

        /** send 2 list to user */
        return res.status(200).send({success:true, contactList:sub_contact, groupList:sub_group0});    


    } catch (error) {
        console.log("getsubscriber : ", error.message);
        return res.status(203).send({errMsg: "Database Error (Exp)"});        
    }
});

router.post("/insertnewgroup", auth, async (req, res) => {    
    try {
        let body = req.body;
        let {user_id} = req.user;
        // console.log("body", body);

        /** check group got same group name */
        let groupList = await getInuseGroupbyUser_id(user_id)
        let nameOccupy = groupList.find(c=>c.name === body.name);
        // console.log("nameOccupy", nameOccupy);
        if(nameOccupy) return res.status(203).send({errMsg: "Group name occupied"});        

        /** insert new group, V2_tele_groupList, get _id */
        let addGroupRel = await insertGroupTable(body.name, user_id);
        if(!addGroupRel) return res.status(203).send({errMsg: "Create group error (DB)"});

        /** insert each contact to V2_tele_contactUnderGroup, use _id above */
        let someContactErr = false;
        for (const eachContact of body.contactList) {
            if(eachContact.subType !==1 ) continue
            let insertCUnderGRel = await insertContactUnderGroup(addGroupRel.insertId, eachContact.sub_id, user_id);
            if(!insertCUnderGRel) {
                someContactErr=true;
                continue
            }            
        }
        if(someContactErr) return res.status(203).send({errMsg:"Some contact insert error"});
        
        return res.status(200).send({success:true, group_id:addGroupRel.insertId});    

    } catch (error) {
        console.log("insertnewgroup : ", error.message);
        return res.status(203).send({errMsg: "Database Error (Exp)"});        
    }
});

router.post("/getdefsublist", auth, async (req, res) => {    
    try {
        let body = req.body;
        let {user_id} = req.user;
        // console.log("body", body);
        /** query V2_tele_bdDefaultSubList by BD */
        let defSubList = await getBdDefSubBy_bd_id(body.bd_id);
        // console.log("defSubList", defSubList);
        if(defSubList.errMsg) return res.status(203).send({errMsg:defSubList.errMsg});    
        /** for of sub list, convert to format as frontend */
        let subscriberList = [];
        for (const eachSubscriber of defSubList) {
            /** get subsriber name */          
            let {subType, sub_id} = eachSubscriber;
            let name = null;
            if(subType===1){    // contact
                let contact = await getInuseContactby_id(sub_id)
                if(contact[0])  name = contact[0].name;
                // console.log("contact", contact);
                // console.log("contact name", contact[0].name);
            }else{      // group
                let group = await getInuseGroupby_id(sub_id)
                if(group[0])  name = group[0].name;
                // console.log("group name", group[0].name);
            }
            subscriberList.push({subType,sub_id,name});
            // subType:2,
            // sub_id:inserRel.group_id,
            // name:groupNameObj.value,
        }

        return res.status(200).send({success:true, subList : subscriberList});    


    } catch (error) {
        console.log("getdefsublist : ", error.message);
        return res.status(203).send({errMsg: "Database Error (Exp)"});        
    }
});


router.post("/updatedefsublist", auth, async (req, res) => {    
    try {
        let body = req.body;
        let {user_id} = req.user;
        // console.log("body", body);
        
        /** handle delete item */
        bSetNotInuseErr=false;
        for (const eachSub of body.deletedList) {
            let setNotInuserel = await setNotInuseDefSub(body.bd_id, eachSub.subType, eachSub.sub_id)
            if(!setNotInuserel) bSetNotInuseErr=true;
        }
        
        /** handle add item */
        /** determine any slot with 0 inuse */
        bInsertErr=false;
        for (const eachAdded of body.addedList) {            
            let notInuse = await selectNotInuseDefSub();
            if(notInuse[0]){
                /** got not inUse slot, execute update */
                let updateRel = await updateAsInUseDefSub(body.bd_id, eachAdded.subType, eachAdded.sub_id, notInuse[0]._id);
                if(!updateRel) bInsertErr = true;
            }else{
                /** dont ahve not inUse slot, execute insert */
                let inserRel = await insertDefSub(body.bd_id, eachAdded.subType, eachAdded.sub_id, user_id);
                if(!inserRel) bInsertErr = true;
            }
        }

        /** handle error for delete and insert */
        if(bSetNotInuseErr) return res.status(203).send({errMsg:"Update Database Interupted(DEL)"});    
        if(bInsertErr) return res.status(203).send({errMsg:"Update Database Interupted(ADD)"});    

        return res.status(200).send({success:true});    


    } catch (error) {
        console.log("updatedefsublist : ", error.message);
        return res.status(203).send({errMsg: "Database Error (Exp)"});        
    }
});



module.exports = router;