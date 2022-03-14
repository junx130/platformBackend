const { notArrOrEmptyArr } = require("../../utilities/validateFn");
const { insertTemplate, queryTemplate } = require("../queryData");


async function getSingleNotInuse_Common(db, table){
    try {
        const quertCmd = `SELECT * from ${table} WHERE inUse = 0 limit 1`;
        let result = await queryTemplate(db, quertCmd, "getSingleNotInuse_Common Finally");
        if(!result[0]) return [];     // return empty array
        const rtnResult = result.map(b=>b);
        return rtnResult;       
    } catch (error) {
        console.log("Error : getSingleNotInuse_Common", error.message);
        return [];       
    }
}


const inserOrUpdate_Common = async (Db, Table, insertFn, insertArg, updateFn, updateArg) => {
    try {
        let notInuse = await getSingleNotInuse_Common(Db, Table);
        let queryErr = false;
        if (notArrOrEmptyArr(notInuse)) {
            /** all accupy, insert */
            let insertRel = await insertFn(insertArg);
            console.log("insertRel", insertRel);
            if (!insertRel.success) queryErr = true;
        } else {
            /** some not inuse, update */
            let updatRel = await updateFn(updateArg, notInuse[0]._id);
            console.log("updatRel", updatRel);
            if (!updatRel) queryErr = true;
        }
        return !queryErr;
    } catch (error) {
        console.log(error.message);
        return false
    }
}

exports.inserOrUpdate_Common=inserOrUpdate_Common;
exports.getSingleNotInuse_Common = getSingleNotInuse_Common;