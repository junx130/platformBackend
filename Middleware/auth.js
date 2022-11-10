const jwt = require("jsonwebtoken");

module.exports = function(req, res, next) {
  // return next();     //  skip auth
  
  try {
    if (!process.env.authRequired) return next();     // process not declared, skip auth
    // console.log("Header", req.header);

    const v2Token = req.header("aploudv2-auth-token");
    const token = req.header("aploud-auth-token");
    // console.log("v2Token", v2Token);
    // console.log("token", token);
    if(v2Token){    // version 2 coding
      // console.log("Come in here");
      // console.log("v2Token", v2Token);
      const decoded = jwt.verify(v2Token, process.env.jwtPrivateKey);
      req.user = decoded;
      // console.log(req.user);
      next();
      return
    }else{      
      // console.log("Come in here2");
      if (!token) return res.status(401).send("Access denied. No token provided.");
  
      const decoded = jwt.verify(token, process.env.jwtPrivateKey);
      req.user = decoded;
      next();
    }
  } catch (ex) {    
    console.log("Auth Err: ",ex.message);
    if(ex.message==="jwt expired"){
      console.log("Got it");
      res.status(403).send(ex.message); 
    } else{
      res.status(400).send(ex.message); 
    }
  }
};
