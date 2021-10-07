const nodemailer = require('nodemailer');

let transporter = nodemailer.createTransport({
        service: 'gmail',
        host: 'smtp.gmail.com',
        // port: 2525,
        auth: {
            user: "jxdan2@gmail.com",
            pass: "A110676!"
        }
})

message = {
    from: "jxdan2@gmail.com",
    to: "junx130@gmail.com",
    subject: "Subject",
    html: "<h1>Hello SMTP Email</h1>"
    // text: "Hello SMTP Email"
}

function sendEmail(){
    // console.log("Send Email Start");
    transporter.sendMail(message, function(err, info) {
        // if (err) {
        //   console.log(err)
        // } else {
        //   console.log(info);
        // }
    });
}

async function sendPassResetEmail(userEmail, resetLink){
  // console.log("Send Email Start");
  let passResetMessage={
    from: "jxdan2@gmail.com",
    to: userEmail,
    subject: "Aplouds Password Reset",
    html: `<h1>Hi Aplouds user. Please <a href="${resetLink}">click here</a> to reset password.</h1>`
    // text: "Hello SMTP Email"

  }
  await transporter.sendMail(passResetMessage, async function(err, info) {
      if (err) {
        console.log(err)
        return false;
      } else {
        console.log(info);
        return true;
      }
  });
}

exports.sendPassResetEmail=sendPassResetEmail
exports.sendEmail = sendEmail;