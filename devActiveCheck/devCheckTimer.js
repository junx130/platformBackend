const { checkDevActive } = require("./checkActive");

let preCheckMin;    

async function devCheckTimer() {
    let timenow = new Date();
    if ((timenow.getMinutes() === 45 || timenow.getMinutes() === 15) && (timenow.getMinutes() !== preCheckMin)) {
        console.log(`~~~~~Ticking Every Sec~~~~~ ${timenow}`);
        preCheckMin = timenow.getMinutes();
        await checkDevActive();
    }
}

exports.devCheckTimer = devCheckTimer;