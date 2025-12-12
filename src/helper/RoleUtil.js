const Constant = require("./Constant")
const LoggerUtil = require('./LoggerUtil')

class RoleUtil {
    #logger = new LoggerUtil("RoleUtil");
    async allowedAccess(req, param){
        const { user_id, role_id } = req.user

        if(role_id == Constant.ROLE_PEMOHON){
            if(param.created_by && param.created_by != user_id ){
                return false
            }

            param.created_by = user_id
        }

        this.#logger.info(`usr : ${user_id}, role : ${role_id}, param : ${param.created_by}`)

        return true
    }
}

module.exports = new RoleUtil();