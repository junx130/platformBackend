const { verifyCRC } = require("../../../utilities/loraFormat");
const { standardSensorHandling } = require("./standardSensorHandling");
const { ty6_switchStatusHandling } = require("./ty6_statusSwitch");
const { ty7_VfdCtrlHandling } = require("./ty7_VfdControl");

async function decodeDevType(message) {
    try {
        const deviceInfo = JSON.parse(message);
        // console.log(deviceInfo);
        /**Check whether CRC valid */
        // verifyCRC(deviceInfo)?console.log("CRC Tally"):console.log("CRC Not Tally");
        if(!verifyCRC(deviceInfo)) return ;
        
        switch (deviceInfo.ht) {
            case 6:
                await ty6_switchStatusHandling(deviceInfo);
                break;
            case 7: 
                await ty7_VfdCtrlHandling(deviceInfo);
                break;
            default:
                await standardSensorHandling(deviceInfo);
                break;
        }

    } catch (error) {
        console.log(error.message);
    }
        
}


exports.decodeDevType=decodeDevType;