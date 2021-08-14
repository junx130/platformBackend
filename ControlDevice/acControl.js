const { getSche_byBdDevId, insertAcCtrlSche} = require("../MySQL/ControlDevice/AcControlSchedule");

insertAcCtrlScheFn=async(body)=>{
    try {
        // console.log(body);
        let {affectedRows} = await insertAcCtrlSche(body);
        // console.log('affectedRows', affectedRows);
        return (affectedRows > 0);
    } catch (error) {
        console.log(error.message);
    }
}

getSche_byBdDevIdFn=async(body)=>{
    try {
        // console.log(body);
        let rel = await getSche_byBdDevId(body);
        // console.log(rel);
        return rel;
    } catch (error) {
        console.log(error.message);
    }
}

exports.insertAcCtrlScheFn = insertAcCtrlScheFn;
exports.getSche_byBdDevIdFn=getSche_byBdDevIdFn;