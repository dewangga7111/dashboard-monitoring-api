const ms = require('ms')
const LoggerUtil = require('../helper/LoggerUtil');
const ResponseUtil = require('../helper/ResponseUtil');
const MessageUtil = require('../helper/MessageUtil')

const System = require('../model/System');
const Permission = require('../model/Permission');
const Function = require('../model/Function');

class PermissionController {
    #logger = new LoggerUtil('PermissionController');

    roleList = async(req, res) => {
        let param = req.query;
        try {
            let rawRes = await System.getBy({ 
                category: 'SYSTEM', 
                sub_category: 'USER_ROLE', 
                valueLike: param.role_name,
            }, ` order by "value" ` )
            rawRes = rawRes.map(m => ({
                role_id: m.code,
                role_name: m.value,
                role_desc: m.remark
            }))
            return ResponseUtil.Ok(res, MessageUtil.GetMsg('found', 'Data'), rawRes)
        } catch(err) {
            this.#logger.error('roleList', err)
            return ResponseUtil.InternalServerErr(res)
        }
    }

    detail = async(req, res) => {
        let param = req.query;
        try {
            let roleDb = await System.getBy({
                category: 'SYSTEM',
                sub_category: 'USER_ROLE',
                code: param.role_id,
            })
            if(roleDb == null || roleDb.length == 0) {
                return ResponseUtil.BadRequest(res, MessageUtil.GetMsg('not.found', 'Role ID'))
            }

            let result = await Permission.getBy(param)
            let msg = result && result.length > 0 ? 
                MessageUtil.GetMsg('found', 'Data') : 
                MessageUtil.GetMsg('not.found', 'Data')
            
            return ResponseUtil.Ok(res, msg, result)
        } catch(err) {
            this.#logger.error('detail', err)
            return ResponseUtil.InternalServerErr(res)
        }
    }

    save = async(req, res) => {
        let body = req.body;        
        try {
            let loggedUserId = req.user.user_id
            let roleDb = await System.getBy({ 
                category: 'SYSTEM',
                sub_category: 'USER_ROLE',
                code: body.role_id,
            })
            if(roleDb == null || roleDb.length == 0) {
                return ResponseUtil.BadRequest(res, MessageUtil.GetMsg('not.found', 'Role ID'))
            }

            let permissions = body.permissions

            let functionList = await Function.getBy({})
            for(let p of permissions) {
                if(functionList.filter(f => f.function_id == p.function_id).length == 0) {
                    return ResponseUtil.BadRequest(res, MessageUtil.GetMsg('not.found', 'Function ID: ' + p.function_id ))
                }
            }

            for(let p of permissions) {
                p.role_id = body.role_id,
                await Permission.insertOrUpdate(p, loggedUserId)
            }

            return ResponseUtil.DataUpdated(res)
        } catch(err) {
            this.#logger.error('save', err)
            return ResponseUtil.InternalServerErr(res)
        }
    }
}

module.exports = new PermissionController();