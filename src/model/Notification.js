const { db, getPaginatedResult } = require('../helper/DBUtil')
const StringUtil = require('../helper/StringUtil')
const Constant = require('../helper/Constant')
const table = "tb_r_notification";
const table_id = "notif_id";
const table_cd = "trn";

const searchQuery =  `
    SELECT
        ${table_cd}.${table_id},                       
        ${table_cd}.notif_owner,                    
        u.name as nama_notif_owner,         
        ${table_cd}.notif_type,                     
        ${table_cd}.notif_message,                  
        ${table_cd}.notif_action,                   
        ${table_cd}.notif_action_type,              
        act.value as nama_notif_action_type,
        ${table_cd}.notif_status,                   
        sts.value as nama_notif_status,    
        ${table_cd}.created_dt,                     
        ${table_cd}.created_by,                     
        ${table_cd}.updated_dt,                     
        ${table_cd}.updated_by
    FROM ${table} ${table_cd}                
    LEFT JOIN tb_m_user u on u.user_id = ${table_cd}.notif_owner
    LEFT JOIN tb_m_system sts ON sts.category = 'NOTIFICATION'
                            AND sts.sub_category = 'STATUS'
                            AND sts.code = ${table_cd}.notif_status
    LEFT JOIN tb_m_system act ON act.category = 'NOTIFICATION'
                            AND act.sub_category = 'ACTION_TYPE'
                            AND act.code = ${table_cd}.notif_action_type
    LEFT JOIN tb_m_system nt ON nt.category = 'NOTIFICATION'
                            AND nt.sub_category = 'TYPE'
                            AND nt.code = ${table_cd}.notif_type
    WHERE 1=1
`

module.exports = {
    async search(param, notif_owner) {
        let query = searchQuery

        query += ` AND ${table_cd}.notif_owner = \${notif_owner} `
        param.notif_owner = notif_owner

        // dynamic condition and parameters
        if(param.notif_status && param.notif_status != "") {
            query += ` AND ${table_cd}.notif_status = \${notif_status} `
        }
        if(param.notif_type && param.notif_type != "") {
            query +=    ` AND ${table_cd}.notif_type = \${notif_type} `   
        }
        if(param.notif_action_type && param.notif_action_type != "") {
            query += ` AND ${table_cd}.notif_action_type = \${notif_action_type} `
        }
        
        // dynamic order, bisa multiple column
        if(param.order_by) {
            let columns = param.order_by.split(',')
            let dirs = param.dir.split(',')
    
            query += ' ORDER BY '
            for(let i=0; i<columns.length;i++) {
                if(columns[i]) {
                    if(i>0) {
                        query += ', '
                    }      
                    let dir = dirs[i] || 'asc'
                    query += `"${columns[i]}" ${dir}`
                }
            }
        } else {
            // DEFAULT SORTING
            query = query + ` ORDER BY ${table_cd}.notif_status DESC, ${table_cd}.created_dt DESC `
        }
        return await getPaginatedResult(query, param);
    },
    async get(param) {
        let query = searchQuery
        
        if(param.notif_owner) {
            query += ` AND ${table_cd}.notif_owner = \${notif_owner} `
        }
        query += ` ORDER BY ${table_cd}.notif_status desc, ${table_cd}.updated_dt desc `
        return await db.manyOrNone(query, param)
    },
    async getOne(notif_id) {        
        let query = searchQuery
        query += ` AND ${table_cd}.notif_id = \${notif_id} `
        return await db.oneOrNone(query, {notif_id})
    },
    async updateStatus(param, by) {
        let query = `
            UPDATE ${table} SET
                notif_status = \${notif_status},
                updated_dt = \${updated_dt},    
                updated_by = \${updated_by}
            WHERE ${table_id} = \${notif_id}     
        `
    
        StringUtil.addIdentityData(param, new Date(), by, false)
        await db.none(query, param)
    },

    async updateAllAsRead(by) {
        let query =`
            UPDATE ${table} SET
                notif_status = \${notif_status},
                updated_dt = \${updated_dt},
                updated_by = \${updated_by}
            WHERE notif_owner = \${notif_owner}
        `

        let param = {
            notif_status: Constant.NOTIF.STATUS.READ,
            notif_owner: by
        }
        StringUtil.addIdentityData(param, new Date(), by, false)
        await db.none(query, param)
    },
    async insert(param, by) {
        let query = `
            INSERT INTO ${table} (
                notif_id,
                notif_owner,
                notif_type,
                notif_message,
                notif_action,
                notif_action_type,
                notif_status,
                created_dt,
                created_by,
                updated_dt,
                updated_by 
            ) VALUES (
                \${notif_id},
                \${notif_owner},
                \${notif_type},
                \${notif_message},
                \${notif_action},
                \${notif_action_type},
                \${notif_status},
                \${created_dt},
                \${created_by},
                \${updated_dt},
                \${updated_by} 
            )
        `
        param.notif_id = StringUtil.generateUUID()
        StringUtil.addIdentityData(param, new Date(), by)
        await db.none(query, param) 
    },

    async deleteByData(param) {
        let whereNotifDataId = " LOWER(notif_action) = '' "
        if(param.notif_action_dataid){
            param.notif_action_dataid = StringUtil.addWild(param.notif_action_dataid)
            whereNotifDataId = ` LOWER(notif_action) LIKE LOWER(\${notif_action_dataid}) `
        }

        let whereNotifFunctionId = " LOWER(notif_action) = '' "
        if(param.notif_action_function_id){
            param.notif_action_function_id = StringUtil.addWild(param.notif_action_function_id)
            whereNotifFunctionId = ` LOWER(notif_action) LIKE LOWER(\${notif_action_function_id}) `
        }
        let query = `
            DELETE FROM ${table} WHERE ${whereNotifDataId} AND ${whereNotifFunctionId}
        `
        await db.none(query, param) 
    }
}