const express = require("express");
const router = express.Router();
const { getBuildings } = require("../MySQL/building/building");

router.post("/get", async (req, res) => {
    try {
        let buildingList = await getBuildings(5);
        // if user accessLevel is < 10;
        // change 5 to user access level
        // add auth into this
        return res.status(200).send(buildingList);
        
    } catch (ex) {        
        console.log("Get Building Error");
        return res.status(404).send(ex.message);
    }
});

module.exports = router;