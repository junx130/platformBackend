

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