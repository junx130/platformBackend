const { getSensorParaBy_sensorType } = require("../MySQL/SensorManagement/sensorManagement");

function PxToDbC8Table(pxName, pxData){
    if(!Array.isArray(pxData)) return console.log(`${pxName} is not array`);
    let rtnString= '';
    let dataType='FLOAT';
    switch (pxName) {
        case "pb":  dataType = "TINYINT";    break;
        case "pi":  dataType = "INT";    break;
        case "pn":  dataType = "BIGINT";    break;
        default:    break;
    }
    for (const [idx, pb] of pxData.entries()) {
        //SwitchOn TINYINT,  
        rtnString += `${pxName}_${idx} ${dataType},`        
    }
    return rtnString;
}

function genPxsC8TableString(sensorPara){
    let rtnString='';
    if(Array.isArray(sensorPara.pb)) rtnString += PxToDbC8Table("pb", sensorPara.pb);
    if(Array.isArray(sensorPara.pi)) rtnString += PxToDbC8Table("pi", sensorPara.pi);
    if(Array.isArray(sensorPara.pf)) rtnString += PxToDbC8Table("pf", sensorPara.pf);
    if(Array.isArray(sensorPara.pn)) rtnString += PxToDbC8Table("pn", sensorPara.pn);

    return rtnString;
}



function genPxsInsertTableString(sensorPara){
    let rtnName= '';
    let rtnValue= '';
    for (const key in sensorPara) {
        if (Object.hasOwnProperty.call(sensorPara, key)) {
            if(!Array.isArray(sensorPara[key])) return
            for (const [nIndex, px] of sensorPara[key].entries()) {
                rtnName+= `, ${key}_${nIndex}`;
                if(key === "pb"){
                    rtnValue+= `, ${px.value?1:0}`;
                }else{
                    rtnValue+= `, ${px.value}`;
                }
            }            
        }
    }
    return {rtnName, rtnValue};
}

function genPxPara(sensorKey, px, loraData){
    try {
        let Pxs = []
        let PfKeyList = sensorKey.filter(c=>c.dataType === px);
        for (const dataKey of PfKeyList) {
            let pfPara={
                name : dataKey.dataName,
                value : loraData[px][dataKey.dataIndex],
                unit : dataKey.dataUnit,
            }
            Pxs.push(pfPara);
            // console.log("pfPara", pfPara);
        }
        return Pxs;        
    } catch (error) {
        // console.log(error.message);
        return []
    }
}

async function genSensorPara(sensorType, loraData){
    let sensorKey = await getSensorParaBy_sensorType(sensorType);
    let sensorPara = {
        pb:genPxPara(sensorKey, 'pb', loraData),
        pf:genPxPara(sensorKey, 'pf', loraData),
        pi:genPxPara(sensorKey, 'pi', loraData),
        pn:genPxPara(sensorKey, 'pn', loraData),
    }
    // console.log(sensorPara);
    for (const eachPx of sensorPara.pb) {
        // console.log(`Each Pb : ${eachPx.value}`);
        if(eachPx.value===null) return {err:true}
    }
    for (const eachPx of sensorPara.pf) {
        // console.log(`Each Pb : ${eachPx.value}`);
        // let parsed = parseFloat(eachPx.value);
        // if(isNaN(parsed)) return {err:true} 
        if(isNaN(parseFloat(eachPx.value))) return {err:true}
    }
    for (const eachPx of sensorPara.pi) {
        // console.log(`Each Pb : ${eachPx.value}`);
        // let parsed = parseInt(eachPx.value);
        // if(isNaN(parsed)) return {err:true} 
        if(isNaN(parseInt(eachPx.value))) return {err:true}


    }
    for (const eachPx of sensorPara.pn) {
        // console.log(`Each Pb : ${eachPx.value}`);
        if(isNaN(parseInt(eachPx.value))) return {err:true}
    }

    return sensorPara;
}

exports.genSensorPara=genSensorPara;
exports.genPxsInsertTableString=genPxsInsertTableString;
exports.genPxsC8TableString = genPxsC8TableString;