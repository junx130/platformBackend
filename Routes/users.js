const express = require("express");
const { getUser, regUser, genAuthToken, validateRegUser, valUpdateUser, updateUser, getAllUser, deleteUser, getUserByUsername, setNewPassword } = require("../MySQL/userManagement/users");
const router = express.Router();
const bcrypt = require("bcrypt");
const _ = require("lodash");
const Joi = require("joi");
const auth = require("../Middleware/auth");
const {_unixNow} = require('../utilities/timeFn');
const { getByRecoveryCode, insertResetPassReq, getByUserName_WithinMins, updateCompletedStatus } = require("../MySQL/userManagement/resetPassRecord");
const { sendPassResetEmail } = require("../EmailServer/email");


// register new user
router.post("/register", async (req, res) => {        
    try {
        // console.log(req.body);
        const{error} = validateRegUser(req.body);
    
        if(error) return res.status(400).send(error.details[0].message);
        // check database, no username is not overlap
        let user = await getUser(req.body.username);
        // console.log("USer :", user);
        if(user) return res.status(400).send("Username exist.");
        // encrypt password
        const salt = await bcrypt.genSalt(10);
        // console.log("Salt: ", salt);
        let userInfo = req.body;
        userInfo.password = await bcrypt.hash(req.body.password, salt);
        // insert user into user database 
        let insertResult = await regUser(userInfo);

        userInfo.accessLevel = 100,
        userInfo.active= 1;

        const token = genAuthToken(userInfo);       
        // console.log("token", token) ;
        res
            .send(token);    
            // .header("aploud-auth-token", token)
            // .send(_.pick(userInfo, ["username"]));    
    } catch (error) {
        console.log("User Register Error");
        return res.status(404).send(error.message);
    }
});


router.post("/getbyrecoverycode", async (req, res) => {
    try {
        let body = req.body;
        // console.log(body);
        let rel = await getByRecoveryCode(body.recoveryCode);
        // console.log(rel);
        if(rel[0]) return res.status(200).send(rel[0]);
        return res.status(200).send(null);

    } catch (ex) {
        console.log("getbyrecoverycode Error");
        return res.status(404).send(ex.message);
    }
});


router.post("/setnewpass", async (req, res) => {
    // console.log("setnewpass");
    try {
        let body = req.body;
        // console.log(body);
        // update user 
        let PR_rel = await getByRecoveryCode(body.recoveryCode);
        if(!PR_rel[0]) return res.status(200).send({msg:"Invalid Recovery Link"});

        let userInfo = PR_rel[0]
        // if(userInfo.completed >= 10) return res.status(200).send({msg:"Invalid Recovery Link (ID:1)"});

        const salt = await bcrypt.genSalt(10);
        // console.log("Salt: ", salt);
        
        /** Encrypted password */
        userInfo.saltpassword = await bcrypt.hash(body.password, salt);
        // console.log(userInfo);
        let insertResult = await setNewPassword(userInfo);
        if(!insertResult) res.status(200).send({msg:"Set Password Not Success (DB)"});
        
        /** Update Completed Status */
        let rel = await updateCompletedStatus(body._id, 10);
        if(!rel)  res.status(200).send({msg:"Set Password Not Success (PR Link)"});
        // if(rel[0]) res.status(200).send(rel[0]);
        return res.status(200).send('OK');

    } catch (ex) {
        console.log("setnewpass Error");
        return res.status(404).send(ex.message);
    }
});

router.post("/changepassreq", async (req, res) => {    
    try {
        // console.log(req.body);
        let rel = await getUserByUsername(req.body);
        // console.log(rel);
        /**Ensure email is valid */
        if(!rel[0]) return res.status(200).send({msg:"Email Invalid"});     // no raw affected, update failed
        let userInfo = rel[0];
        // console.log(userInfo);
        /** check Password reset record, resend max 3 times*/        
        let reqColdDown = 10; // 10 mins
        let didRequest = await getByUserName_WithinMins(userInfo.username , reqColdDown);
        // console.log(didRequest);

        /** generate recovery code */
        let unixNow = _unixNow();
        let randNo = Math.floor(Math.random() * 1000000);
        let existCode = [];
        let recoveryCode = `${unixNow}-${randNo}`;        

        if(!didRequest[0]){      // not record found
            // console.log("No record found");
    
            let retyrCnt = 0;
            let codeDuplicated = false;
            /**Check make sure recovery code is unique */
            do{
                unixNow = _unixNow();
                randNo = Math.floor(Math.random() * 1000000);
                recoveryCode = `${userInfo._id}-${unixNow}-${randNo}`;        
                // recoveryCode = "1-1632804175-723815";
                existCode = await getByRecoveryCode(recoveryCode);
                // console.log(existCode);
                if(!existCode) return res.status(200).send({msg:"Access Databases Error"});
                codeDuplicated = false;
                if(existCode[0]) codeDuplicated = true;
    
                retyrCnt++;
                // console.log(`Cnt : ${retyrCnt}`);
            }
            while(retyrCnt <= 3 && codeDuplicated);
    
            if(codeDuplicated) return res.status(200).send({msg:"Recovery Code Generate Failed"});
            /** after make sure recovery code is unique, insert to reqeust record */
            let  reserPassInfo={
                user_id:userInfo._id,
                username:userInfo.username,
                email:userInfo.email,
                recoveryCode:recoveryCode,
            }

            // console.log(reserPassInfo);
            
            let insertRel = await insertResetPassReq(reserPassInfo);
            
            if(!insertRel) return res.status(200).send({msg:"Insert Reset Reqeust Failed"});        
            
        }else{      // record found, if retry cont not more than 3, send same recovery code
            // console.log("Record Found");
            if(didRequest[0].completed >= 2) return res.status(200).send({msg:`Request Too Frequent. Retry after: ${reqColdDown - Math.floor((_unixNow()-didRequest[0].unix)/60)} min`});
            /** update completed status */
            let rel = await updateCompletedStatus(didRequest[0]._id, didRequest[0].completed+1);
            // console.log(rel);
            // console.log(rel.affectedRows);
            recoveryCode = didRequest[0].recoveryCode;
            // console.log(recoveryCode);
        }

        /** trigger send email here */
        let recoveryLink = `http://localhost:3000/passwordrecovery/rstpassword/${recoveryCode}`;
        // let recoveryLink = `http://aplouds.com/passwordrecovery/rstpassword/${recoveryCode}`;
        // console.log(recoveryLink);
        let email_rel = await sendPassResetEmail(userInfo.email, recoveryLink);
        console.log(email_rel);
        console.log("Send Done");
        return res.status(200).send("OK");
        
        return res.status(200).send(didRequest);
    } catch (ex) {
        console.log("getbyemail Error");
        return res.status(200).send(ex.message);
    }
});


router.get("/all", auth, async (req, res) => {
    
    try {
        // console.log("Enter");
        
        if(req.user.active == 0) return res.status(401).send("Account not active");  // prevent admin accidently change own access level
        
        if(req.user.accessLevel > 10) return res.status(401).send("Do Not Have Access Right");     // access level is too low
        
        if(req.user.accessLevel >= req.body.accessLevel) return res.status(401).send("Access Level Too Low");     // access level is too low
        
        // get all user 
        let rel = await getAllUser(req.body);
        if(!rel[0]) return res.status(401).send("User List Empty");     // no raw affected, update failed
        // reply fron end
        res.status(200).send(rel);

    } catch (ex) {
        console.log("User Update Error");
        return res.status(404).send(ex.message);
    }
});


router.post("/del", auth, async (req, res) => {
    try {
        const{error} = valUpdateUser(req.body);
        // stop seq if error
        if(error) return res.status(400).send(error.details[0].message);
    
        if(req.user.active != 1) return res.status(401).send("Account not active");  // prevent admin accidently change own access level
            
        if(req.user.username == req.body.username) return res.status(401).send("Not allowed to change self access level");  // prevent admin accidently change own access level
        
        if(req.user.accessLevel > 10) return res.status(401).send("Do Not Have Access Right");     // access level is too low
        
        if(req.user.accessLevel >= req.body.accessLevel) return res.status(401).send("Access Level Too Low");     // access level is too low
        
        let rel = await deleteUser(req.body);
        console.log(`rel : ${rel}`);
        if(rel<1) {return res.status(404).send("Delete Failed")};     // no raw affected, update failed
        // reply fron end
        res.status(200).send(_.pick(req.body, ["username"]));

    } catch (ex) {        
        console.log("User Update Error");
        return res.status(404).send(ex.message);
    }
});

router.post("/update", auth, async (req, res) => {
    
    try {
        //validate USer
        // console.log(`Enter1120: ${req.body}`);
        const{error} = valUpdateUser(req.body);
        // stop seq if error
        if(error) return res.status(400).send(error.details[0].message);
        // console.log("User",req.user);
        if(req.user.active != 1) return res.status(401).send("Account not active");  // prevent admin accidently change own access level
        
        if(req.user.username == req.body.username) return res.status(401).send("Not allowed to change self access level");  // prevent admin accidently change own access level
        
        if(req.user.accessLevel > 10) return res.status(401).send("Do Not Have Access Right");     // access level is too low
        
        if(req.user.accessLevel >= req.body.accessLevel) return res.status(401).send("Access Level Too Low");     // access level is too low
        
        // update user 
        let rel = await updateUser(req.body);
        console.log(`rel : ${rel}`);
        if(rel<1) {return res.status(404).send("Update Failed")};     // no raw affected, update failed
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