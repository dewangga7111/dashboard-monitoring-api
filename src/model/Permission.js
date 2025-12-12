const DBUtil = require('../helper/DBUtil');
const StringUtil = require('../helper/StringUtil');

const searchQuery = ""
    + " select                                      "    
    + " 	m.function_id,                          "
    + " 	m.function_name,                        "
    + " 	men.value as menu_name,                 "
    + " 	coalesce(prm.create, 'N') as create,    "
    + " 	coalesce(prm.read, 'N') as read,        "
    + " 	coalesce(prm.update, 'N') as update,    "
    + " 	coalesce(prm.delete, 'N') as delete,    "
    + " 	coalesce(prm.approve, 'N') as approve	"
    + " from (                                      "
    + " 	select                                  "
    + " 		rol.code as role_id,                "    
    + " 		fun.function_id,                    "
    + " 		fun.function_name,                  "
    + " 		fun.menu_id,                        "
    + " 		rol.sequence                        "
    + " 	from tb_m_system rol, tb_m_function fun "
    + " 	where rol.category = 'SYSTEM'           "
    + " 	  and rol.sub_category = 'USER_ROLE'    "
    + " ) m                                         "
    + " left join tb_m_permission prm               "
    + " 	on prm.role_id = m.role_id              "
    + " 	and prm.function_id = m.function_id     "
    + " left join tb_m_system men                   "
    + " 	on men.category = 'SYSTEM'              "
    + " 	and men.sub_category = 'MENU'           "
    + " 	and men.code = m.menu_id                "
    + " where 1=1                                   "    

const getBy = async(param) => {
    let query = searchQuery
    if(param.role_id) {
        query += " and m.role_id = ${role_id} ";
    }
    query += " order by m.sequence, men.sequence, m.function_id "    
    return await DBUtil.db.manyOrNone(query, param)
}

const insertOrUpdate = async(param, by) => {
    let query = ""
        + " insert into tb_m_permission (  "
        + " 	role_id,                   "
        + " 	function_id,     "
        + ' 	"create",        '
        + " 	update,          "
        + " 	read,            "
        + " 	delete,          "
        + " 	approve,         "
        + " 	created_dt,      "
        + " 	created_by,      "
        + " 	updated_dt,      "
        + " 	updated_by       "
        + " ) values (           "
        + " 	${role_id},      "
        + " 	${function_id},  "
        + " 	${create},       "
        + " 	${update},       "
        + " 	${read},         "
        + " 	${delete},       "
        + " 	${approve},      "
        + " 	${created_dt},   "
        + " 	${created_by},   "
        + " 	${updated_dt},   "
        + " 	${updated_by}    "
        + " )                    "    
        + " on conflict (role_id, function_id) do update set   "
        + '     "create" = ${create},     '
        + "     update = ${update},       "
        + "     read = ${read},           "
        + "     delete = ${delete},       "
        + "     approve = ${approve},     "
        + "     updated_dt = ${updated_dt},         "
        + "     updated_by = ${updated_by}          "

    StringUtil.addIdentityData(param, new Date(), by)    
    await DBUtil.db.none(query, param)
}

module.exports = {
    getBy,
    insertOrUpdate,
}