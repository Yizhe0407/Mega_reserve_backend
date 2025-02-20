require('dotenv').config();

module.exports = {
    emailConfig: {
        service: 'gmail',
        auth: {
            user: process.env.Email_User,
            pass: process.env.Email_Password,
        }
    }
};