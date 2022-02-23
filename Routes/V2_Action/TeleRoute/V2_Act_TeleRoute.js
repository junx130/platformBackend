const express = require("express");
const router = express.Router();
const auth = require("../../../Middleware/auth");
const { checkName_ChatID_duplicated, getSingleNotInuse, insertTeleContactList, updateContactList, getInuseGroupbyUser_id, getInuseContactbyUser_id } = require("../../../MySQL/V2_Action/V2_Tele");
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
        console.log("sub_contact", sub_contact);

        /** query group list */
        let sub_group0 = await getInuseGroupbyUser_id(user_id)
        console.log("sub_group0", sub_group0);

        /** send 2 list to user */
        return res.status(200).send({success:true, contactList:sub_contact, groupList:sub_group0});    


    } catch (error) {
        console.log("getsubscriber : ", error.message);
        return res.status(203).send({errMsg: "Database Error (Exp)"});        
    }
});

module.exports = router;