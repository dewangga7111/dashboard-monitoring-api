const jwt = require("jsonwebtoken");
const ms = require('ms')

const secret = process.env.JWT_SECRET;

const verifyJwt = async (req, token) => {
  try {
    var decoded = jwt.verify(token, secret);
    req.user = {
      user_id: decoded.user_id,
      role_id: decoded.role_id,
    };
    return true;
  } catch (err) {    
    return false;
  }
};

const createJwtToken = async (data, additional, rememberMe = false) => {
  let expires = process.env.JWT_EXPIRED;
  let expiresRememberMe = process.env.JWT_EXPIRED_REMEMBER_ME;

  let token = jwt.sign(data, process.env.JWT_SECRET, {
    expiresIn: (rememberMe) ? expiresRememberMe : expires,
  });
  return token
};

module.exports = { verifyJwt, createJwtToken };
