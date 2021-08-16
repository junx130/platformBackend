const { getSche_byBdDevId, insertAcCtrlSche, updateAcSchedule, deleteAcSchedule} = require("../MySQL/ControlDevice/AcControlSchedule");

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

updateAcSchedule_list=async(body)=>{
    try {
        // console.log(body);
        if(!Array.isArray(body)) return;
        let rel;
        let errCnt = 0;
        for (const sche of body) {
            rel = await updateAcSchedule(sche);        
            // console.log(rel);  
            if(rel >0)  errCnt++;
        }                
        return errCnt;
    } catch (error) {
        console.log(error.message);
    }
}

deleteAcSchedule_list=async(body)=>{
    try {
        // console.log(body);
        if(!Array.isArray(body)) return;
        let rel;
        let errCnt = 0;
        for (const sche of body) {
            rel = await deleteAcSchedule(sche);        
            // console.log(rel);  
            if(rel >0)  errCnt++;
        }                
        return errCnt;
    } catch (error) {
        console.log(error.message);
    }
}

exports.deleteAcSchedule_list = deleteAcSchedule_list;
exports.updateAcSchedule_list = updateAcSchedule_list;
exports.insertAcCtrlScheFn = insertAcCtrlScheFn;
exports.getSche_byBdDevIdFn=getSche_byBdDevIdFn;