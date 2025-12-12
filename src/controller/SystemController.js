const LoggerUtil = require('../helper/LoggerUtil');
const ResponseUtil = require('../helper/ResponseUtil');
const MessageUtil = require('../helper/MessageUtil')

const System = require('../model/System');

class SystemController {
    #logger = new LoggerUtil('SystemController');

    search = async(req, res) => {
        let param = req.query;
        try {            
            let searchResult = await System.findPaginated(param)            
            return ResponseUtil.SearchOk(res, searchResult)
        } catch(err) {
            this.#logger.error('search', err)
            return ResponseUtil.InternalServerErr(res)
        }
    }

    create = async (req, res) => {
        let param = req.body
        try {
            const loggedUserId = req.user.user_id

            const system = await System.getBy({ category: param.category, sub_category: param.sub_category, code: param.code })
            if(system && system.length > 0) {
                return ResponseUtil.BadRequest(res, 
                    MessageUtil.GetMsg('found.duplicate.entry', 
                        `Category: ${param.category}, Sub Category: ${param.sub_category}, Code: ${param.code}`)
                )
            }

            if(param.sequence == '') {
                param.sequence = null
            }

            await System.insert(param, loggedUserId)
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

            const system = await System.getBy({ category: param.category, sub_category: param.sub_category, code: param.code })
            if(system == null || system.length == 0) {
                return ResponseUtil.BadRequest(res, 
                    MessageUtil.GetMsg('not.found.in.master', 
                        `Category: ${param.category}, Sub Category: ${param.sub_category}, Code: ${param.code}`)
                )
            }

            if(param.sequence == '') {
                param.sequence = null
            }

            await System.update(param, loggedUserId)
            return ResponseUtil.DataUpdated(res)
        } catch(err) {
            this.#logger.error('update', err)            
            return ResponseUtil.InternalServerErr(res)
        }
    }

    delete = async (req, res) => {
        let param = req.body
        try {            
            const system = await System.getBy({ category: param.category, sub_category: param.sub_category, code: param.code })
            if(system && system.length > 0) {                
                await System.deleteBy({ category: param.category, sub_category: param.sub_category, code: param.code })                
            }
            return ResponseUtil.DataDeleted(res)            
        } catch(err) {
            this.#logger.error('delete', err)            
            return ResponseUtil.InternalServerErr(res)
        }
    }

    deleteMany = async (req, res) => {
        let params = req.body
        try {            
            for(let i=0; i<params.length; i++){
                let param = params[i]
                const system = await System.getBy({ category: param.category, sub_category: param.sub_category, code: param.code })
                if(system && system.length > 0) {                
                    await System.deleteBy({ category: param.category, sub_category: param.sub_category, code: param.code })                
                }
            }
            return ResponseUtil.DataDeleted(res)            
        } catch(err) {
            this.#logger.error('delete', err)            
            return ResponseUtil.InternalServerErr(res)
        }
    }
}

module.exports = new SystemController();