const LoggerUtil = require('../helper/LoggerUtil');
const ResponseUtil = require('../helper/ResponseUtil');
const PasswordUtil = require('../helper/PasswordUtil');
const MessageUtil = require('../helper/MessageUtil');
const JwtUtil = require('../helper/JwtUtil');
const User = require('../model/User')
const Permission = require('../model/Permission');
const EmailUtil = require('../helper/EmailUtil');
const OtpUtil = require('../helper/OtpUtil');
const LogActivityHelper = require('../helper/LogActivityHelper.js');

class AuthController {
    #logger = new LoggerUtil('AuthController');

    login = async(req, res) => {
        let param = req.body;
        try {            
            const userObj = await User.findByUserId(param.user_id, true)
            
            if(!userObj) {
                return ResponseUtil.Unauthorized(res, MessageUtil.GetMsg('invalid.login')) 
            }

            if(userObj.status != '01') {
                return ResponseUtil.Unauthorized(res, MessageUtil.GetMsg('invalid.login')) 
            } 
            
            let valid = await PasswordUtil.validatePassword(param.password, userObj.password, userObj.salt);
            if(!valid) {
                return ResponseUtil.Unauthorized(res, MessageUtil.GetMsg('invalid.login'))
            }
            
            let rememberMe = param.remember_me
            let token = await JwtUtil.createJwtToken(
                {
                    user_id: userObj.user_id,
                    role_id: userObj.role_id,
                },
                {
                    role_id: userObj.role_id,
                    name: userObj.name,
                    status: userObj.status 
                },
                rememberMe
            )

            await User.updateLastToken({ user_id: userObj.user_id, last_token: token }, userObj.user_id)

            // get permission based on role
            let permissions = await Permission.getBy({ role_id: userObj.role_id })
            permissions.forEach(fe => {
                delete fe.function_name
                delete fe.menu_name 
            })

            // log as active user
            const activityId = await LogActivityHelper.updateLastLogin(userObj.user_id);

            // return data to client
            let result = {
                activity_id: activityId,
                token,
                satker: userObj.satker,
                satker_name: userObj.satker_name,
                user_id: userObj.user_id,
                user_name: userObj.name,
                role_id: userObj.role_id,
                role_name: userObj.role_id_name,
                branch_id: userObj.branch_id,
                branch_name: userObj.branch_name,
                permissions
            }

            return ResponseUtil.Ok(res, "Login berhasil", result)
        } catch(err) {
            this.#logger.error('login', err)
            return ResponseUtil.InternalServerErr(res)
        }
    }

    logout = async(req, res) => {
        const param = req.body;
        try {
            await LogActivityHelper.updateInactive(param.user_id, param.activity_id);
            return ResponseUtil.Ok(res, 'Logout berhasil')
        } catch(err) {
            this.#logger.error('logout', err)
            return ResponseUtil.InternalServerErr(res)
        }
    }

    checkToken = async(req, res) => {
        try {
            return ResponseUtil.Ok(res, 'Token masih bisa digunakan')
        } catch(err) {
            this.#logger.error('logout', err)
            return ResponseUtil.InternalServerErr(res)
        }
    }

    forgot = async(req, res) => {
        const param = req.body
        try {
            const user = await User.getBy(param)
            if (user.length == 0) {
                ResponseUtil.NotFound(res, "User belum terdaftar di sistem")
            } else {
                if(user[0].status != '01') {
                    return ResponseUtil.Unauthorized(res, MessageUtil.GetMsg('invalid.login')) 
                }

                //generate OTP dan kirim email
                const otp = OtpUtil.generateOtp(4, { upperCaseAlphabets: false, lowerCaseAlphabets: false, specialChars: false })
                await EmailUtil.SendEmail(
                    param.email,
                    'Reset Password',
                    MessageUtil.GetMsg('reset', user[0].name, otp),
                    true
                )
                return ResponseUtil.Ok(res, "Kode OTP telah di kirim ke email", {email: param.email})
                
            }
        } catch (err) {
            this.#logger.error('forgot-password', err)
            return ResponseUtil.InternalServerErr(res)
        }
    }

    verify = async(req, res) => {
        const param = req.body
        try {
            return ResponseUtil.Ok(res, "Verifikasi OTP berhasil", {email: param.email})
        } catch (err) {
            this.#logger.error('verify-otp', err)
            return ResponseUtil.InternalServerErr(res)
        }
    }

    reset = async(req, res) => {
        const param = req.body
        try {
            const user = await User.getBy(param)
            if (user.length == 0) {
                ResponseUtil.NotFound(res, "User belum terdaftar di sistem")
            } else {
                if(user[0].status != '01') {
                    return ResponseUtil.Unauthorized(res, MessageUtil.GetMsg('invalid.login')) 
                } else {
                    return ResponseUtil.DataUpdated(res)
                }
            }
        } catch (err) {
            this.#logger.error('reset-password', err)
            return ResponseUtil.InternalServerErr(res)
        }
    }


}

module.exports = new AuthController();