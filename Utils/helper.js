const crypto = require("crypto");

// FOR SENDING ERROR MESSAGES
exports.sendError = (res, error, status = 401) => {
    res.status(status).json({ success: false, error })
}

// FOR CREATING RANDOM STRING FOR RESET PASSWORD
exports.createRandomBytes = () => new Promise((resolve, reject) => {
    crypto.randomBytes(30, (err, buff) => {
        if (err) reject(err);

        const token = buff.toString('hex');
        resolve(token)
    });
});

// FOR CREATING 5 DIDGETS IN SENT MAIL FOR RESET PASSWORD
exports.generateCode = (length) => {
    let result = ''
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < length) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
        counter += 1
    }
    return result;
};