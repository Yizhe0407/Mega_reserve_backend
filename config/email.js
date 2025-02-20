require('dotenv').config();

module.exports = {
    emailConfig: {
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD,
        }
    }
};