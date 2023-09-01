const nodemailer = require("nodemailer");


// EXPORTED FUNCTION 4 DIDGETS FOR MAIL CONFIRM <========= verificationtoken(4563)
exports.generateOTP = () => { 
    let otp =  ''
      for(let i= 0; i<=3; i++) {
       const randVal = Math.round(Math.random() * 9)
       otp = otp + randVal
    }
    return otp
}

// EXPORTED FUNCTION FOR MAIL SERVICE CREDENTIALS <========= this is mailtrap
exports.mailTransport = () => nodemailer.createTransport({
        host: "sandbox.smtp.mailtrap.io",
        port: 2525,
        auth: {
          user: process.env.MAILSERVICE_USERNAME,
          pass: process.env.MAILSERVICE_PASSWORD
        }
});

exports.generateEmailTemplate = code => {
    return  `
    <!DOCTYPE html>
    <html lang="en">
        <head>
            <meta charset="UTF-8>
            <meta http-equiv='X-UA-Compatabile" content="IE=edge">
            <style>
            @media only screen and (max-width: 620px){
                h1{
                    font-size:20px;
                    padding: 5px;
                }
            }
            </style>
        </head>
        <body>
            <div>
                <div style="max-width: 620px; margin: 0 auto; font-family: sans-serif; color:#272727; text-align: center;">
                    <h1> We are delighted to welcome you to our world! </h1>
                        <p>Please Veryfy your email</p>
                        <h3>${code}</h3>
                </div>
            </div>
        </body>
    </html>
    `
}

exports.plainEmailTemplate = (heading, message ) => {
    return  `
    <!DOCTYPE html>
    <html lang="en">
        <head>
            <meta charset="UTF-8>
            <meta http-equiv='X-UA-Compatabile" content="IE=edge">
            <style>
            @media only screen and (max-width: 620px){
                h1{
                    font-size:20px;
                    padding: 5px;
                }
            }
            </style>
        </head>
        <body>
            <div>
                <div style="max-width: 620px; margin: 0 auto; font-family: sans-serif; color:#272727; text-align: center;">
                    <h1>${heading}</h1>
                        <h3>${message}</h3>
                </div>
            </div>
        </body>
    </html>
    `
}

  