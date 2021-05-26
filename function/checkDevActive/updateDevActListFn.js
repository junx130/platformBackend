const { updateActiveDevChecklist } = require("../../MySQL/notification/devActive");



async function updateActDevChescklistFn(dev){
    let result = await updateActiveDevChecklist(dev);
    if (!result) return
    console.log(result);
}


exports.updateActDevChescklistFn=updateActDevChescklistFn;