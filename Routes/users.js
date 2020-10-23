const express = require("express");
const { getUser, regUser, genAuthToken } = require("../MySQL/userManagement/users");
const router = express.Router();
const bcrypt = require("bcrypt");
// const _ = require("lodash");

router.post("/register", async (req, res) => {
    // validate user details
    const{error} = validateRegUser(req.body);

    if(error) return res.status(400).send(error.details[0].message);
    // check database, no username is not overlap
    let user = await getUser(req.body.username);
    if(user) return res.status(400).send("Username exist.");
    // encrypt password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(req.body.password, salt);
    // insert user into user database 
    let insertResult = await regUser(req.body);
    // if (insertResult){...}
    // reply user register details to user
    user.accessLevel = 100;     // for 1st register must be 100(Guest)
    const token = genAuthToken(user);
    res
        .header("aploud-auth-token", token)
        .send(_.pick(user, ["username"]));    
});



module.exports = router;