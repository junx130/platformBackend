require("es6-promise").polyfill();
require("isomorphic-fetch");
const axios = require("axios");

module.exports = async function (humanKey) {
    const RECAPTCHA_SERVER_KEY = process.env.RECAPTCHA_SERVER_KEY;
    let url = "https://www.google.com/recaptcha/api/siteverify"
    let headers = {
        Accept: "application/json",
        "Content-Type": "application/x-www-form-urlencoded; charset=utf-8"
    }
    let body = `secret=${RECAPTCHA_SERVER_KEY}&response=${humanKey}`;
    
    let result = await axios.post(url, body, { headers: headers });
    console.log(result);
    return result.data.success;
    // Validate Human
    // const isHuman = await fetch(`https://www.google.com/recaptcha/api/siteverify`, {
    //   method: "post",
    //   headers: {
    //     Accept: "application/json",
    //     "Content-Type": "application/x-www-form-urlencoded; charset=utf-8"
    //   },
    //   body: `secret=${RECAPTCHA_SERVER_KEY}&response=${humanKey}`
    // })
    //   .then(res => res.json())
    //   .then(json => json.success)
    //   .catch(err => {
    //     throw new Error(`Error in Google Siteverify API. ${err.message}`)
    //   })
    
    // if (humanKey === null || !isHuman) {
    //   throw new Error(`YOU ARE NOT A HUMAN.`)
    // }
    
    // The code below will run only after the reCAPTCHA is succesfully validated.
    // console.log("SUCCESS!")
}
