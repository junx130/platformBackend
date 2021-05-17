const { checkDevActive } = require("./checkActive");

function devCheckTimer() {
    const timenow = new Date();
    let preCheckMin = 0;    45
    if ((timenow.getMinutes() === 45 || timenow.getMinutes() === 15) && (timenow.getMinutes() !== preCheckMin)) {
        preCheckMin = timenow.getMinutes();
        checkDevActive();
    }
}


// function devCheckTimer() {
//     const timenow = new Date();
//     let delay;
//     if (timenow.getMinutes() === 45 || timenow.getMinutes() === 15) {
//         if (timenow.getSeconds() !== 0) {
//             delay = 1800 - timenow.getSeconds();
//         }
//         else
//             delay = 0;
//     }
//     else if (timenow.getMinutes() > 45) {
//         delay = 1800 - ((timenow.getMinutes() - 45) * 60) - timenow.getSeconds();
//     }
//     else if (timenow.getMinutes() < 15) {
//         delay = ((15 - timenow.getMinutes()) * 60) - timenow.getSeconds();
//     }
//     else {
//         delay = ((45 - timenow.getMinutes()) * 60) - timenow.getSeconds();
//     }
//     console.log(delay);
//     setTimeout(() => checkDevActive(), delay * 1000);
//     setInterval(() => checkDevActive(), 1800000);
// }

exports.devCheckTimer = devCheckTimer;