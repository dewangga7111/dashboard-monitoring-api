const LoggerUtil = require('../helper/LoggerUtil')
const ResponseUtil = require('../helper/ResponseUtil')
const MessageUtil = require('../helper/MessageUtil')
const StringUtil = require('../helper/StringUtil')

const System = require('../model/System')
const User = require('../model/User')
const Function = require('../model/Function')
const DataSource = require('../model/DataSource')
const Constant = require('../helper/Constant')

const createMsg = (data)=>{
    return data && data.length > 0 ? MessageUtil.GetMsg('found', 'Data') : MessageUtil.GetMsg('not.found', 'Data')
}

class ComboController {
    #logger = new LoggerUtil('ComboController');

    getFromSystem = async (category, sub_category, sort = ' order by "category", "sub_category", "sequence" ') => {
        let rawResult = await System.getBy({
            category,
            sub_category
        }, sort)

        return rawResult.map(m => ({ value: m.code, label: m.value, remark: m.remark, sequence: m.sequence }))
    }

    userRoleList = async(req, res) => {
        const loggedUserRole = req.user.role_id
        try {
            let data = await this.getFromSystem('SYSTEM', 'USER_ROLE')  

            const loggedUserRoleSequence = data.find(role => role.value == loggedUserRole)?.sequence;
            const filteredData = data.filter(role => role.sequence >= loggedUserRoleSequence);

            return ResponseUtil.Ok(res, createMsg(filteredData), filteredData)
        } catch(err) {
            this.#logger.error('userRoleList', err)
            return ResponseUtil.InternalServerErr(res)
        }
    }

    statusUser = async(req, res) => {
        try {
            let data = await this.getFromSystem('SYSTEM', 'USER_STATUS')
            // exclude status 'Dihapus'
            data = data.filter(v => v.value !== '99')
            return ResponseUtil.Ok(res, createMsg(data), data)
        } catch(err) {
            this.#logger.error('statusUser', err)
            return ResponseUtil.InternalServerErr(res)
        }
    }

    functionMenu = async(req, res) => {
        try {
            let data = await Function.getBy({})
            return ResponseUtil.Ok(res, createMsg(data), data)
        } catch (err) {
            this.#logger.error('functionMenu', err)
            return ResponseUtil.InternalServerErr(res)
        }
    }

    dataSourceType = async(req, res) => {
        try {
            let data = await this.getFromSystem('DATASOURCE', 'TYPE')
            // exclude status 'Dihapus'
            data = data.filter(v => v.value !== '99')
            return ResponseUtil.Ok(res, createMsg(data), data)
        } catch(err) {
            this.#logger.error('dataSourceType', err)
            return ResponseUtil.InternalServerErr(res)
        }
    }

    dataSource = async(req, res) => {
        try {
            let rawResult = await DataSource.getBy({})
            let data = rawResult.map(m => ({
                value: m.data_source_id,
                label: m.name,
                source: m.source,
                source_name: m.source_name,
                is_default: m.is_default
            }))
            return ResponseUtil.Ok(res, createMsg(data), data)
        } catch(err) {
            this.#logger.error('dataSource', err)
            return ResponseUtil.InternalServerErr(res)
        }
    }
}

module.exports = new ComboController();