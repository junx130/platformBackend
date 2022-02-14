const express = require("express");
const router = express.Router();
const auth = require("../../Middleware/auth");
const { getOneInaciveFormulaBy_UserId, insertFormulaTemplate, updateFormula, getFormulaBy_UserId } = require("../../MySQL/V2_Reaction/V2_Reaction");

router.post("/formula/savenew", auth, async (req, res) => {    
    try {
        let formula =req.body;
        // console.log("formula", formula);
        /** check whether user got slot with active = 0 */
        let nonActiveSlot = await getOneInaciveFormulaBy_UserId(formula.user_id);
        // console.log("nonActiveSlot", nonActiveSlot);
        let addSuccess = false;
        if(Array.isArray(nonActiveSlot) && nonActiveSlot.length>0){
            /** yes, update active =0 */
            // console.log("yes");
            let updateRel = await updateFormula(formula, nonActiveSlot[0]._id);
            // console.log("updateRel", updateRel);
            addSuccess=updateRel;
        }else{
            /** no, insert new */
            let insertRel = await insertFormulaTemplate(formula)
            // console.log("insertRel", insertRel);
            addSuccess=insertRel;
        }


        /** return true message to user */
        // let rel = await getV2BattList(bdDev_id);
        // console.log(rel);
        if (!addSuccess) return res.status(203).send({errMsg: "Add Formula Error"});   
        return res.status(200).send({success:true});
        
    } catch (error) {
        console.log("/formula/savenew Error");
        console.log(error.message);
        return res.status(203).send({errMsg: "Server Exc Error"});        
    }
});

router.post("/formula/getbyuserid", auth, async (req, res) => {    
    try {
        let {user_id} = req.body;
        let result = await getFormulaBy_UserId(user_id);
        if(!result) return res.status(203).send([]);    // catch error
        return res.status(200).send(result);        
    } catch (error) {
        console.log("getbyuserid : ", error.message);
        return res.status(203).send({errMsg: "Database Error (Exp)"});        
    }
});

module.exports = router;