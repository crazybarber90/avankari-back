const nodemailer = require("nodemailer");


// EXPORTED FUNCTION 4 DIDGETS FOR MAIL CONFIRM <========= verificationtoken(4563)
exports.generateOTP = () => {
    let otp = ''
    for (let i = 0; i <= 3; i++) {
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
    return `
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

exports.plainEmailTemplate = (heading, message) => {
    return `
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

exports.generatePasswordResetTemplate = url => {
    return `
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
                    <a href="${url}" cursor:"pointer"> Reset password </a>
                        
                </div>
            </div>
        </body>
    </html>
    `
}

exports.plainEmailTemplate = (heading, message) => {
    return `
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

exports.plainEmailTemplate2 = token => {
    return `
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
                    <h1> This is your token</h1>
                        <h3>${token}</h3>
                </div>
            </div>
        </body>
    </html>
    `
}

exports.plainEmailTemplate3 = (email, password) => {
    return `
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
                    <h1> Yoru password is reseted</h1>
                        <h3> New password for user ${email} is ${password}</h3>
                </div>
            </div>
        </body>
    </html>
    `
}


exports.sendSupportEmailTemplate = (text, user) => {
    return `
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
            h3 {
                word-wrap: break-word;
                margin: 20px auto 0;
            }
            </style>
        </head>
        <body>
            <div>
                <div style="max-width: 620px; margin: 0 auto; font-family: sans-serif; color:#272727; text-align: left;">
                    <h1> Poruka stigla od <span style="color: #399BA6"> ${user.email} </span></h1>
                    <h1> Poruka stigla od <span style="color: #399BA6">${user.name}</span></h1>
                        <h3>${text}</h3>
                </div>
            </div>
        </body>
    </html>
    `
}


