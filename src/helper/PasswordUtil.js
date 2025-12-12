const bcrypt = require('bcrypt');
const crypto = require('crypto');

const SALT_ROUND = parseInt(process.env.SALT_ROUND)
const SALT_LENGTH = parseInt(process.env.SALT_LENGTH)

const createHashPassword = async (password) => {
    let salt = crypto.randomBytes(SALT_LENGTH).toString('base64');
    let hash_password = await bcrypt.hash(`${salt}${password}`, SALT_ROUND);
    if(hash_password) {
        return {
            salt,
            hash_password,
        }
    } 
    return null;
}

const validatePassword = async(paramPassword, usrPassword, usrSalt) => {
    return await bcrypt.compare(`${usrSalt}${paramPassword}`, usrPassword);
}

module.exports = {
    createHashPassword,
    validatePassword
}