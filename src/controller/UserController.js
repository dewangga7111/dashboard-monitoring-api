const LoggerUtil = require('../helper/LoggerUtil');
const ResponseUtil = require('../helper/ResponseUtil');
const PasswordUtil = require('../helper/PasswordUtil');
const MessageUtil = require('../helper/MessageUtil')
const Constant = require('../helper/Constant')

const User = require('../model/User');

const duplicateCheck = (res, value, label) =>{    
    return ResponseUtil.BadRequest(res, 
        MessageUtil.GetMsg('found.duplicate', label, value)
    )
}

class UserController {
    #logger = new LoggerUtil('UserController');

    search = async(req, res) => {
        let param = req.query;
        try {
            let searchResult = await User.findPaginated(param)
            return ResponseUtil.SearchOk(res, searchResult)
        } catch(err) {
            this.#logger.error('search', err)
            return ResponseUtil.InternalServerErr(res)
        }
    }

    detail = async(req, res) => {
        let param = req.query;
        try {
            let user = await User.getNonDeletedUserBy({ user_id: param.user_id })
            if(user == null || user.length == 0) {
                return ResponseUtil.Ok(res, MessageUtil.GetMsg('not.found', 'Data'))
            }
            user = user[0]                        
            
            return ResponseUtil.Ok(res, MessageUtil.GetMsg('found', 'Data'), user)
        } catch(err) {
            this.#logger.error('detail', err)
            return ResponseUtil.InternalServerErr(res)
        }
    }

    create = async (req, res) => {
        let param = req.body
        try {
            const loggedUserId = req.user.user_id
            let statusCreate = true
            let whereClause = ""

            //user belum di hapus
            let tmpUser = await User.getNonDeletedUserBy({ user_id: param.user_id }) 
            if(tmpUser && tmpUser.length > 0) {
                return duplicateCheck(res, param.user_id, 'User ID')
            }

            tmpUser = await User.getNonDeletedUserBy({ email: param.email })
            if(tmpUser && tmpUser.length > 0) {
                return duplicateCheck(res, param.email, 'Email')
            }

            tmpUser = await User.getNonDeletedUserBy({ phone: param.phone })
            if(tmpUser && tmpUser.length > 0) {
                return duplicateCheck(res, param.phone, 'Phone')
            }

            //user deleted
            let userDeleted = await User.getDeletedUserBy({ user_id: param.user_id }) 
            if(userDeleted && userDeleted.length > 0) {
                //update user tsb by user_id
                statusCreate = false
                whereClause = "user_id"
            }
            
            userDeleted = await User.getDeletedUserBy({ email: param.email })
            if(userDeleted && userDeleted.length > 0) {
                if(userDeleted[0].user_id == param.user_id){
                    //update user tsb by email
                    statusCreate = false
                    whereClause = "email"
                }else{
                    return duplicateCheck(res, param.email, 'Email')
                }
            }
            
            userDeleted = await User.getDeletedUserBy({ phone: param.phone })
            if(userDeleted && userDeleted.length > 0) {
                if(userDeleted[0].user_id == param.user_id){
                    //update user tsb by phone
                    statusCreate = false
                    whereClause = "phone"
                }else{
                    return duplicateCheck(res, param.phone, 'Phone')
                }
            }

            let hashedPassword = await PasswordUtil.createHashPassword(param.password);
            if(!hashedPassword) {
                return ResponseUtil.InternalServerErr(res)
            }
            
            param.password = hashedPassword.hash_password;
            param.salt = hashedPassword.salt;                                                

            if(statusCreate){
                await User.create(param, loggedUserId)
            }else{
                await User.updateDeletedBy(param, loggedUserId)
            }

            return ResponseUtil.DataCreated(res)
        } catch(err) {
            this.#logger.error('create', err)            
            return ResponseUtil.InternalServerErr(res)
        }
    }

    update = async (req, res) => {
        let param = req.body
        try {
            const loggedUserId = req.user.user_id

            let tmpUser = await User.getNonDeletedUserBy({ user_id: param.user_id }, true)
            if(tmpUser == null || tmpUser.length == 0) {
                return ResponseUtil.BadRequest(res, MessageUtil.GetMsg('not.found', 'User ID'))
            }   
            tmpUser = tmpUser[0]

            if(tmpUser.email != param.email) {
                let tmp = await User.getNonDeletedUserBy({ email: param.email })
                if(tmp && tmp.length > 0) {
                    return duplicateCheck(res, param.email, 'Email')
                }
            }

            if(tmpUser.phone != param.phone) {
                let tmp = await User.getNonDeletedUserBy({ phone: param.phone })
                if(tmp && tmp.length > 0) {
                    return duplicateCheck(res, param.phone, 'Phone')
                } 
            }

            // tidak bisa deaktivasi akun diri sendiri
            if(loggedUserId == param.user_id && (param.status == Constant.STS_USER_DIHAPUS || param.status == Constant.STS_USER_TDK_AKTIF)) {
                return ResponseUtil.BadRequest(res, MessageUtil.GetMsg('invalid.update.owner'))
            }

            await User.update(param, loggedUserId)

            return ResponseUtil.DataUpdated(res)
        } catch(err) {
            this.#logger.error('update', err)            
            return ResponseUtil.InternalServerErr(res)
        }
    }

    changePassword = async (req, res) => {
        let param = req.body
        try {
            const loggedUserId = req.user.user_id

            let tmpUser = await User.getNonDeletedUserBy({ user_id: loggedUserId }, true)
            if(tmpUser == null || tmpUser.length == 0) {
                return ResponseUtil.BadRequest(res, MessageUtil.GetMsg('not.found', 'User ID'))
            }   
            tmpUser = tmpUser[0]

            let valid = await PasswordUtil.validatePassword(param.old_password, tmpUser.password, tmpUser.salt);
            if(!valid) {
                return ResponseUtil.Unauthorized(res, MessageUtil.GetMsg('invalid.oldpassword'))
            }

            let hashedPassword = await PasswordUtil.createHashPassword(param.new_password);
            if(!hashedPassword) {
                return ResponseUtil.InternalServerErr(res)
            }
            
            let updateParam = {
                user_id: loggedUserId,
                salt: hashedPassword.salt,
                password: hashedPassword.hash_password 
            }

            await User.changePassword(updateParam, loggedUserId)
            return ResponseUtil.DataUpdated(res)
        } catch(err) {
            this.#logger.error('changePassword', err)
            return ResponseUtil.InternalServerErr(res)
        }
    }

    delete = async (req, res) => {
        let param = req.query
        try {
            let loggedUserId = req.user.user_id
            if(loggedUserId == param.user_id) {
                return ResponseUtil.BadRequest(res, MessageUtil.GetMsg('invalid.delete.owner'))
            }
            let user = await User.findByUserId(param.user_id, true)

            await User.deleteBy(param.user_id, loggedUserId)

            return ResponseUtil.DataDeleted(res)
        } catch(err) {
            this.#logger.error('delete', err)
            return ResponseUtil.InternalServerErr(res)
        }
    }

    deleteMany = async (req, res) => {
        let params = req.body
        try {
            let loggedUserId = req.user.user_id
            
            for(let i=0; i<params.length; i++){
                let param = params[i];
                if(loggedUserId == param.user_id) {
                    return ResponseUtil.BadRequest(res, MessageUtil.GetMsg('invalid.delete.owner'))
                }

                let user = await User.findByUserId(param.user_id, true)

                await User.deleteBy(param.user_id, loggedUserId)
            }

            return ResponseUtil.DataDeleted(res)
        } catch(err) {
            this.#logger.error('delete', err)
            return ResponseUtil.InternalServerErr(res)
        }
    }

    registerUser = async(req, res) => {
        let param = req.body;
        try {
            let tmpUser = await User.getNonDeletedUserBy({ user_id: param.user_id })
            if(tmpUser && tmpUser.length > 0) {
                return duplicateCheck(param.user_id, 'User ID')
            }

            tmpUser = await User.getNonDeletedUserBy({ email: param.email })
            if(tmpUser && tmpUser.length > 0) {
                return duplicateCheck(param.email, 'Email')
            }

            tmpUser = await User.getNonDeletedUserBy({ phone: param.phone })
            if(tmpUser && tmpUser.length > 0) {
                return duplicateCheck(param.phone, 'Phone')
            }
        
            let hashedPassword = await PasswordUtil.createHashPassword(param.password);
            if(!hashedPassword) {
                return ResponseUtil.InternalServerErr(res)
            }
            
            param.password = hashedPassword.hash_password;
            param.salt = hashedPassword.salt;
            param.status = '00';
            param.role_id = 'guest';
            param.branch_id = '';

            await User.create(param, param.user_id)

            // send email to activate user
            // email ke admin / email ke user nya sendiri
            
            return ResponseUtil.DataCreated(res)
        } catch(err) {
            this.#logger.error('registerUser', err)
            return ResponseUtil.InternalServerErr(res)
        }
    }

    resetPassword = async (req, res) => {
        let param = req.body
        try {
            const loggedUserId = req.user.user_id

            let tmpUser = await User.getNonDeletedUserBy({ user_id: param.user_id }, true)
            if(tmpUser == null || tmpUser.length == 0) {
                return ResponseUtil.BadRequest(res, MessageUtil.GetMsg('not.found', 'User ID'))
            }   
            tmpUser = tmpUser[0]

            let hashedPassword = await PasswordUtil.createHashPassword(param.new_password);
            if(!hashedPassword) {
                return ResponseUtil.InternalServerErr(res)
            }
            
            let updateParam = {
                user_id: param.user_id,
                salt: hashedPassword.salt,
                password: hashedPassword.hash_password 
            }

            await User.changePassword(updateParam, loggedUserId)
            return ResponseUtil.DataUpdated(res)
        } catch(err) {
            this.#logger.error('changePassword', err)
            return ResponseUtil.InternalServerErr(res)
        }
    }
}

module.exports = new UserController();