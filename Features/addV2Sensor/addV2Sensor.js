const { getLeastNoInTable, insertV2Sensor, insertSensorPara } = require("../../MySQL/SensorManagement/sensorManagement");


async function regV2Sensor({SensorInfo, paraList, userAmmend}){
    try {
        /** Get the least unused sensor key */
        let leastTyNo = await getLeastNoInTable("type");
        // console.log(leastTyNo);
        if(!leastTyNo) return //{errMsg:"Find least type key error"}// find least key error
        /** Store sensor key into databases */
        let {affectedRows} = await insertV2Sensor(SensorInfo, leastTyNo, userAmmend);
        if (affectedRows < 1) return //{errMsg:"Add Sensor Error"}// find least key error
        /** Store parameter list */
        let inserParaErr = false;
        for (const para of paraList) {
            let paraRel = await insertSensorPara(para, leastTyNo, userAmmend);
            if(!paraRel.affectedRows || paraRel.affectedRows < 0) inserParaErr = true;
            // console.log(paraRel);
        }
        if(inserParaErr) return //{errMsg:"Add Sensor Error"}
        return true;    // all success        
    } catch (error) {
        console.log(error.message);
        return 
    }
}

exports.regV2Sensor = regV2Sensor;