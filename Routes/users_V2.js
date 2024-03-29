const express = require("express");
const { getAllUser, deleteUser, valUpdateUser, genAuthToken, getTokenExpiry, validateRegUser, regUser, getUserByUsername, getUserByEmail, setUserActive, updateActToken, verifyToken, genLoginToken, updatePassword, getUserById_email, updateUserActiveStatus, updateUserEmail, getUserByUsername_jx, getUserBy_idList } = require("../MySQL/userManagement_V2/users_V2");
const router = express.Router();
const bcrypt = require("bcrypt");
const _ = require("lodash");
const Joi = require("joi");
const auth = require("../Middleware/auth");
const {_unixNow} = require('../utilities/timeFn');
const { getByRecoveryCode, insertResetPassReq, getByUserName_WithinMins, updateCompletedStatus } = require("../MySQL/userManagement/resetPassRecord");
const { sendPassResetEmail, sendValidationEmail } = require("../EmailServer/email");
const moment = require("moment");
const recaptcha = require("../Middleware/recaptcha");
const { getByUserId, getByEmail, getByToken, insertResetPassword, updateResetStatus } = require("../MySQL/userManagement_V2/user_ResetPassword");
const { notEmptyArr } = require("../utilities/validateFn");


router.post("/register/validation", async (req, res) => {        
    try {
        // console.log(req.body);
        const{error} = validateRegUser(req.body);
    
        if (error) return res.status(203).send(error.details[0].message);
        // check database, no username is not overlap
        let email = await getUserByEmail(req.body.email);
        // console.log("USer :", user);
        if (email) return res.status(203).send("Email exist.");
        // let user = await getUserByUsername(req.body.username);
        // if (user) return res.status(402).send("Username exist.");
        // encrypt password
        const salt = await bcrypt.genSalt(10);
        // console.log("Salt: ", salt);
        let userInfo = req.body;
        userInfo.password = await bcrypt.hash(req.body.password, salt);
        // const { randomBytes } = await import("crypto");
        // userInfo.activationToken = randomBytes(20).toString('hex');
        let activationToken = await genAuthToken(userInfo);
        // console.log(activationToken);
        // insert user into user database 
        // await regUser(userInfo);

        let validationLink = `${process.env.APLOUDSV2_PUBLIC_URL}/register/validation/${activationToken}`;
        let email_rel = await sendValidationEmail(userInfo.email, validationLink);
        console.log(email_rel);
        return res.status(200).send("OK");
        
        // const token = genAuthToken(userInfo);
        // console.log("token", token) ;
        // res.send(token);    
            // .header("aploud-auth-token", token)
            // .send(_.pick(userInfo, ["username"]));    
    } catch (error) {
        console.log("User Register Error");
        return res.status(404).send(error.message);
    }
});

router.post("/register", async (req, res) => {        
    try {
        // console.log(req.body);
        // const{error} = validateRegUser(req.body);
    
        // if (error) return res.status(203).send(error.details[0].message);
        // check database, no username is not overlap
        let {username} = req.body;
        let userList = await getUserByUsername_jx(username.trim());
        // console.log("userList :", userList);
        if(!userList)   return res.status(203).send("Databases error");
        if(notEmptyArr(userList))   return res.status(203).send("Username is taken");
        // console.log("Proceed to create account");
        // return
        // let user = await getUserByUsername(req.body.username);
        // if (user) return res.status(402).send("Username exist.");
        // encrypt password
        const salt = await bcrypt.genSalt(10);
        // console.log("Salt: ", salt);
        let userInfo = req.body;
        userInfo.password = await bcrypt.hash(req.body.password, salt);
        // const { randomBytes } = await import("crypto");
        // userInfo.activationToken = randomBytes(20).toString('hex');
        // let activationToken = await genAuthToken(userInfo);
        // console.log(activationToken);
        // insert user into user database 
        // await regUser(userInfo);

        // let validationLink = `${process.env.APLOUDSV2_PUBLIC_URL}/register/validation/${activationToken}`;
        // let email_rel = await sendValidationEmail(userInfo.email, validationLink);
        // console.log(email_rel);
        await regUser(userInfo);
        return res.status(200).send("OK");
        
        // const token = genAuthToken(userInfo);
        // console.log("token", token) ;
        // res.send(token);    
            // .header("aploud-auth-token", token)
            // .send(_.pick(userInfo, ["username"]));    
    } catch (error) {
        console.log("User Register Error", error.message);
        return res.status(404).send(error.message);
    }
});

router.post("/updateactive", async (req, res) => {
    try {
        let info = req.body;
        let result = await updateUserActiveStatus(info);
        console.log(result);
        res.status(200).send("Active Status Updated");
    } catch (error) {
        console.log("Get Token Expiry Error");
        return res.status(404).send(error.message);
    }
});

router.post("/updateemail", async (req, res) => {
    try {
        let info = req.body;
        let result = await updateUserEmail(info);
        console.log(result);
        res.status(200).send("Email Updated");
    } catch (error) {
        console.log("Get Token Expiry Error");
        return res.status(404).send(error.message);
    }
});

router.post("/setuseractive", async (req, res) => {
    try {
        let info = req.body;
        // let userinfo = await getTokenExpiry(info.actToken);
        let userinfo = verifyToken(info.actToken);
        // console.log(userinfo);
        if (userinfo) {
            // if (userinfo.active) return res.status(202).send("Account already active.");
            let email = await getUserByEmail(userinfo.email);
            if (email) return res.status(203).send("Account already activated.");
            if (userinfo.iat + 7200 > moment().unix() ) {
                // let result = await setUserActive(info.actToken);
                await regUser(userinfo);
                return res.status(200).send("Validate done");
            }
            else return res.status(203).send("Link expired.");
        }
        else return res.status(404).send("Token not found");
    } catch (error) {
        console.log("Get Token Expiry Error");
        return res.status(404).send(error.message);
    }
});

router.post("/resendactlink", async (req, res) => {
    try {
        let info = req.body;
        let user = await getUserByEmail(info.email);
        // console.log("USer :", user);
        if (!user) return res.status(205).send("Email not found");
        // console.log(user);
        if (user.tokenExpire < moment().unix() * 1000) {
            const { randomBytes } = await import("crypto");
            info.actToken = randomBytes(20).toString('hex');
            info.tokenExp = Date.now() + 7200000;
            // console.log(info);
            let result = await updateActToken(info);
            // console.log(result);
            let validationLink = `${process.env.APLOUDSV2_PUBLIC_URL}/register/validation/${info.actToken}`;
            let email_rel = await sendValidationEmail(info.email, validationLink);
            // console.log(email_rel);
            return res.status(200).send("Email sent");
        }
        else return res.status(202).send("Token on CD");
        
    } catch (error) {
        console.log("Resent Link Error");
        return res.status(404).send(error.message);
    }
});

router.post("/recaptcha", async (req, res) => {
    try {
        let info = req.body;
        // console.log(info);
        let result = await recaptcha(info.humanKey);
        // console.log(result);
        if (result)
            return res.status(200).send("User is human");
        else
            return res.status(205).send("User is robot");
    } catch (error) {
        console.log("Get Recaptcha Error");
        return res.status(404).send(error.message);
    }
})

router.post("/login", async (req, res) => {
    try {
        let info = req.body;
        // console.log(info);
        // let user = await getUserByEmail(info.email);
        let user = await getUserByUsername(info.username);
        // console.log(user);
        if (!user) return res.status(204).send('User not exist');
        // check password
        // console.log("User: ",user);
        const validPassword = await bcrypt.compare(info.password, user.password);
        if(!validPassword) return res.status(204).send('Invalid password.');

        const token = genLoginToken(user);
        res.status(200).send(token);
        // res.send(token);
    } catch (error) {
        console.log("Login Error");
        console.log(error.message);
        return res.status(404).send(error.message);
    }
})

router.post("/forgetpassword", async (req, res) => {
    try {
        let info = req.body;
        // console.log(info);
        // if (info.email) {
        let user = await getUserByEmail(info.email);
        if (!user) return res.status(203).send("Email not registered");
        info.user_id = user._id;
            // info.email = user.email;
        // }
        
        // let user = await getUserByEmail(info.email);
        // if (!user) return res.status(402).send("Email not registered");
        // info.user_id = user._id;
        let userReset = await getByUserId(info.user_id);
        if (userReset) {
            if (userReset.sendUnix > (moment().unix() - 7200) * 1000) return res.status(203).send("On Cooldown");
        }
        const { randomBytes } = await import("crypto");
        info.resettoken = randomBytes(20).toString('hex');
        info.sendUnix = moment().unix();
        await insertResetPassword(info);
        let resetLink = `${process.env.APLOUDSV2_PUBLIC_URL}/user/resetpw/${info.resettoken}`;
        let email_rel = await sendPassResetEmail(info.email, resetLink);
        // console.log(email_rel);
        return res.status(200).send("Email sent");
    } catch (error) {
        console.log("Forget Password Error");
        return res.status(404).send(error.message);
    }
})

router.post("/checkrplink", async (req, res) => {
    try {
        let info = req.body;
        // console.log(info);
        let result = await getByToken(info.token);
        // console.log(result);
        if (!result) return res.status(203).send("Invalid Token");
        if (result.sendUnix > (moment().unix() - 7200) * 1000) return res.status(201).send("Token Expired");
        if (result.status) return res.status(202).send("Link has been used");
        return res.status(200).send("Valid Token");
    } catch (error) {
        console.log("Check RP Link Error");
        return res.status(404).send(error.message);
    }
})

router.post("/resetpassword", async (req, res) => {
    try {
        let info = req.body;
        // console.log(info);
        let newInfo = {};
        // console.log(newInfo);
        let resetinfo = await getByToken(info.token);
        newInfo._id = resetinfo.user_id;
        let user = await getUserByEmail(resetinfo.email);
        const validPassword = await bcrypt.compare(info.password, user.password);
        console.log(validPassword);
        if(validPassword) return res.status(203).send("Repeating Password");
        const salt = await bcrypt.genSalt(10);
        newInfo.password = await bcrypt.hash(info.password, salt);
        let result = await updatePassword(newInfo);
        // console.log(result);
        await updateResetStatus(info.token);
        return res.status(200).send("Password reset done");
    } catch (error) {
        console.log("Set Password Error");
        return res.status(404).send(error.message);
    }
})


router.post("/checkactivation", async (req, res) => {
    try {
        let info = req.body;
        // console.log(info);
        let userFound = await getUserById_email(info);
        if(!userFound) return res.status(203).send({errMsg:"User Not Found"});
        // console.log(userFound);        
        return res.status(200).send({active:userFound.active});
        // res.send(token);
    } catch (error) {
        console.log("Check Activation Error");
        console.log(error.message);
        return res.status(203).send({errMsg:"DB Server Invalid"});
    }
})

router.post("/chgpassword", async (req, res) => {
    try {
        let info = req.body;
        console.log(info);
        // let newInfo = {};
        // console.log(newInfo);
        // const validPassword = await bcrypt.compare(info.password, user.password);
        // console.log(validPassword);
        // if(validPassword) return res.status(203).send("Repeating Password");
        const salt = await bcrypt.genSalt(10);
        info.password = await bcrypt.hash(info.password, salt);
        console.log(info);
        let result = await updatePassword(info);
        console.log(result);
        return res.status(200).send("Password reset done");
    } catch (error) {
        console.log("Set Password Error");
        return res.status(404).send(error.message);
    }
})

router.post("/getall", async (req, res) => {
    try {
        // let info = req.body;
        // console.log(info);
        let result = await getAllUser();
        // console.log(result);
        if (result)
            return res.status(200).send(result);
        else
            return res.status(205).send("User List is empty");
    } catch (error) {
        console.log("Get All User Error");
        return res.status(404).send(error.message);
    }
});

router.post("/getuser_byIdList", async (req, res) => {
    try {
        let { idList } = req.body;
        // console.log(info);
        let result = await getUserBy_idList(idList);
        // console.log(result);
        if (result)
            return res.status(200).send(result);
        else
            return res.status(205).send("User List is empty");
    } catch (error) {
        console.log("Get All User Error");
        return res.status(404).send(error.message);
    }
})

module.exports = router;