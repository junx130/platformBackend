const{getUnixNowForCRC} = require("./timeFn");


function getArrayCount(payload, arrType){   
    try {
        if (Object.hasOwnProperty.call(payload, arrType)){
            /**Check whether it is array */            
            if(Array.isArray(payload[arrType])) {
                /**Count the element in array */   
                // console.log(payload[arrType].length);
                return payload[arrType].length
            }
        }        
        return 0;
    } catch (error) {
        console.log(error.message);
        return 0;
    }
}

function getPackageCount (header){
    let headerSize = 20;
    let footerSize = 8;
    return headerSize + header.hbs + (header.hfs + header.his)*4 + header.hns * 8 + footerSize;
}

function genLoRaPackage(devDetails, payload){
    let header ={             
        ht:devDetails.devType,   // type
        hi:devDetails.id, // ID
        hs:0,      // Size of lora package
        hd:devDetails.dir,     // direction, 1 node to gateway, 2 gateway to node
        hf:devDetails.fun,       // message function
        hbs:getArrayCount(payload, 'pb'),      // Qty of boolean
        hfs:getArrayCount(payload, 'pf'),      // Qty of float
        his:getArrayCount(payload, 'pi'),      // qty of long
        hns:getArrayCount(payload, 'pn'),      // qty of int64_t
        hr1:0,      // reserved 1
        hr2:0,      // reserved 2   
    }
    header.hs = getPackageCount(header);   
    let RH_RF95_MAX_MESSAGE_LEN = 251; 
    if(header.hs > RH_RF95_MAX_MESSAGE_LEN) return {error:true, message:`package size greater than ${RH_RF95_MAX_MESSAGE_LEN}`};

    // console.log(header);
    let footer = {
        ft:getUnixNowForCRC(),
        fc:header.hs +header.hd+ header.hf+header.hbs+ header.hfs+ header.his+ header.hns,
    }

    return {...header, ...payload,...footer};

}

function verifyCRC(deviceInfo){
    return (deviceInfo.fc === deviceInfo.hs + 
                    deviceInfo.hd + 
                    deviceInfo.hf + 
                    deviceInfo.hbs + 
                    deviceInfo.hfs + 
                    deviceInfo.his + 
                    deviceInfo.hns)
}


exports.verifyCRC =verifyCRC;
exports.genLoRaPackage=genLoRaPackage;