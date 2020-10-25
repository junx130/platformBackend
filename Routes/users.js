const express = require("express");
const { getUser, regUser, genAuthToken, validateRegUser, valUpdateUser, updateUser } = require("../MySQL/userManagement/users");
const router = express.Router();
const bcrypt = require("bcrypt");
const _ = require("lodash");
const Joi = require("joi");
const auth = require("../Middleware/auth");



// register new user
router.post("/register", async (req, res) => {        
    try {
        const{error} = validateRegUser(req.body);
    
        if(error) return res.status(400).send(error.details[0].message);
        // check database, no username is not overlap
        let user = await getUser(req.body.username);
        // console.log("USer :", user);
        if(user) return res.status(400).send("Username exist.");
        // encrypt password
        const salt = await bcrypt.genSalt(10);
        console.log("Salt: ", salt);
        let userInfo = req.body;
        userInfo.password = await bcrypt.hash(req.body.password, salt);
        // insert user into user database 
        let insertResult = await regUser(userInfo);
        const token = genAuthToken(userInfo);
        res.status(200)
            // .header("aploud-auth-token", token)
            .send(_.pick(userInfo, ["username"]));    
    } catch (error) {
        console.log("User Register Error");
        return res.status(404).send(error.message);
    }
});

router.post("/update", auth, async (req, res) => {
    
    try {
        //validate USer
        const{error} = valUpdateUser(req.body);
        // stop seq if error
        if(error) return res.status(400).send(error.details[0].message);
        // console.log("User",req.user);
        if(req.user.active == 0) return res.status(401).send("Account not active");  // prevent admin accidently change own access level
        
        if(req.user.username == req.body.username) return res.status(401).send("Not allowed to change self access level");  // prevent admin accidently change own access level
        
        if(req.user.accessLevel > 10) return res.status(401).send("Do Not Have Access Right");     // access level is too low
        
        if(req.user.accessLevel >= req.body.accessLevel) return res.status(401).send("Access Level Too Low");     // access level is too low
        
        // update user 
        let rel = await updateUser(req.body);
        if(rel<1) return res.status(401).send("Update Failed");     // no raw affected, update failed
        // reply fron end
        res.status(200).send(_.pick(req.body, ["username","active","accessLevel"]));

    } catch (ex) {
        console.log("User Update Error");
        return res.status(404).send(ex.message);
    }
});

// log in user
router.post("/login", async (req, res) => {    
    try {    
        // console.log("Body: ", req.body);
        const{error} = validateLogin(req.body);
        if(error) return res.status(400).send(error.details[0].message);
        // Get user from database
        let user = await getUser(req.body.username);
        if(!user) return res.status(400).send('Invalid email or password.');
        // check password
        // console.log("User: ",user);
        const validPassword = await bcrypt.compare(req.body.password, user.password);
        if(!validPassword) return res.status(400).send('Invalid email or password.');

        const token = genAuthToken(user);
        res.send(token);

    } catch (ex) {
        console.log("User Login Error");
        return res.status(404).send(ex.message);
    }

});

function validateLogin(body){
    const schema = {        
        username: Joi.string().min(6).max(80).required(),
        // email: Joi.string().max(80).email(),
        password: Joi.string().min(8).max(80).required(),
        // name: Joi.string().min(3).max(80).required(),
        // company: Joi.string().max(80),
        // phone: Joi.string().max(80).required(),
        // accessLevel: Joi.number(),
        // active: Joi.number(),
        // teleID: Joi.number(),
    }
    return Joi.validate(body, schema);
}

module.exports = router;