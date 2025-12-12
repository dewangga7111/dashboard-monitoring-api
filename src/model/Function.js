const DBUtil = require('../helper/DBUtil');

const searchQuery = ""
    + " select                              "
    + " 	f.function_id,                  "
    + " 	f.function_name,                "
    + " 	f.menu_id,                      "
    + " 	men.value as menu_id_name,      "
    + " 	men.sequence as menu_sequence,  "
    + " 	men.parent as menu_parent       "
    + " from tb_m_function f                "
    + " left join tb_m_system men           "
    + " 	on men.category = 'SYSTEM'      "
    + " 	and men.sub_category = 'MENU'   "
    + " 	and men.code = f.menu_id        "
    + " where 1=1                           "

const getBy = async(param) => {
    let query = searchQuery
    if(param.function_id) {
        query += " and f.function_id = ${function_id} "
    }
    return await DBUtil.db.manyOrNone(query, param)
}

module.exports = {
    getBy,    
}