const DBUtil = require('../helper/DBUtil');
const StringUtil = require('../helper/StringUtil');
const Constant = require('../helper/Constant')

const searchQuery = (withSecurity = false) => {
    let query = ""
        + " select             "
        + " 	us.user_id,    "
        + " 	us.name,       "
        + " 	us.email,      "
        + " 	us.phone,      "
        + (withSecurity ? " us.password, " : "")
        + (withSecurity ? " us.salt, " : "")
        + (withSecurity ? " us.last_token, " : "")
        + " 	us.role_id,    "
        + "     r.value as role_id_name, "
        + " 	us.status,	    "
        + " 	s.value as status_name	    "
        + " from tb_m_user us   "
        + " left join tb_m_system r on r.category = 'SYSTEM' "
        + "                        and r.sub_category = 'USER_ROLE' "
        + "                        and r.code = us.role_id "
        + " left join tb_m_system s on s.category = 'SYSTEM' "
        + "                        and s.sub_category = 'USER_STATUS' "
        + "                        and s.code = us.status "
        + " where 1=1          ";

    return query;
};

const findPaginated = async (param) => {
    let query = searchQuery();
    query += ` and us.status != '${Constant.STS_USER_DIHAPUS}' `;

    if(param.user_id) {
        query += " and us.user_id = ${user_id} ";
    }
    if(param.name) {
        param.name = StringUtil.addWild(param.name);
        query += " and lower(us.name) like lower(${name}) ";
    }
    if(param.email) {
        param.email = StringUtil.addWild(param.email);
        query += " and lower(us.email) like lower(${email}) ";
    }
    if(param.phone) {
        param.phone = StringUtil.addWild(param.phone);;
        query += " and lower(us.phone) like lower(${phone}) ";
    }
    if(param.role_id) {
        query += " and us.role_id = ${role_id} ";
    }
    if(param.status) {
        query += " and us.status = ${status} ";
    }

    if (param.order_by) {
        // dynamic order (from parameter)
        query += DBUtil.createOrderQuery(param);
    } else {
        // default ordering
        query += " order by us.user_id asc ";
    }

    return await DBUtil.getPaginatedResult(query, param);    
};

const getBy = async(param, withSecurity = false) => {
    let query = searchQuery(withSecurity)
    if(param.user_id) {
        query += " and us.user_id = ${user_id} ";
    }
    if(param.email) {
        query += " and us.email = ${email} ";
    }
    if(param.phone) {
        query += " and us.phone = ${phone} ";
    }    
    if(param.status) {
        query += " and us.status = ${status} ";
    }
    if(param.role_id) {
        query += " and us.role_id = ${role_id} ";
    }    

    return await DBUtil.db.manyOrNone(query, param)
}

const getNonDeletedUserBy = async(param, withSecurity = false) => {
    let query = searchQuery(withSecurity)
    query += ` and us.status != '${Constant.STS_USER_DIHAPUS}' `;

    if(param.user_id) {
        query += " and us.user_id = ${user_id} ";
    }
    if(param.email) {
        query += " and us.email = ${email} ";
    }
    if(param.phone) {
        query += " and us.phone = ${phone} ";
    }    
    return await DBUtil.db.manyOrNone(query, param)
}

const getDeletedUserBy = async(param, withSecurity = false) => {
    let query = searchQuery(withSecurity)
    query += ` and us.status = '${Constant.STS_USER_DIHAPUS}' `;

    if(param.user_id) {
        query += " and us.user_id = ${user_id} ";
    }
    if(param.email) {
        query += " and us.email = ${email} ";
    }
    if(param.phone) {
        query += " and us.phone = ${phone} ";
    }    
    return await DBUtil.db.manyOrNone(query, param)
}

const create = async (param, by) => {
    let query = ""
        + ' INSERT INTO tb_m_user ' 
        + ' (user_id, name, email, phone, salt, password, role_id, status, created_dt, created_by, updated_dt, updated_by) '
        + ' VALUES ' 
        + ' (${user_id}, ${name}, ${email}, ${phone}, ${salt}, ${password}, ${role_id}, ${status}, ${created_dt}, ${created_by}, ${updated_dt}, ${updated_by}) ';
    StringUtil.addIdentityData(param, new Date(), by);
    await DBUtil.db.none(query, param);
};

const update = async(param, by) => {
    let query = ""
        + " update tb_m_user set             "
        + " 	name = ${name},              "
        + " 	email = ${email},            "
        + " 	phone = ${phone},            "
        + " 	role_id = ${role_id},        "
        + " 	status = ${status},          "
        + " 	updated_dt = ${updated_dt},  "
        + " 	updated_by = ${updated_by}   "
        + " where user_id = ${user_id}       "

    StringUtil.addIdentityData(param, new Date(), by, false)
    await DBUtil.db.none(query, param)
}

const updateDeletedBy = async(param, by) => {
    let query = ""
        + " update tb_m_user set             "
        + " 	name = ${name},              "
        + " 	email = ${email},            "
        + " 	phone = ${phone},            "
        + " 	salt = ${salt},              "
        + " 	password = ${password},      "
        + " 	role_id = ${role_id},        "
        + " 	status = ${status},          "
        + " 	updated_dt = ${updated_dt},  "
        + " 	updated_by = ${updated_by}   "
        + " where user_id = ${user_id}       "

    param.status = Constant.STS_USER_AKTIF
    StringUtil.addIdentityData(param, new Date(), by, false)
    await DBUtil.db.none(query, param)
}

const updateLastToken = async(param, by) => {
    let query = ""
        + " update tb_m_user set             "
        + " 	last_token = ${last_token},  "
        + " 	updated_dt = ${updated_dt},  "
        + " 	updated_by = ${updated_by}   "
        + " where user_id = ${user_id}       "

    StringUtil.addIdentityData(param, new Date(), by, false)
    await DBUtil.db.none(query, param)
}

const changePassword = async(param, by) => {
    let query = ""
        + " update tb_m_user set            "
        + " 	salt = ${salt},             "
        + " 	password = ${password},     "
        + " 	updated_dt = ${updated_dt}, "
        + " 	updated_by = ${updated_by}  "
        + " where user_id = ${user_id}      "

    StringUtil.addIdentityData(param, new Date(), by, false)
    await DBUtil.db.none(query, param)
}

const deleteBy = async(user_id, by) => {
    let query = ""
        + " update tb_m_user set            "
        + " 	status = ${status},         "        
        + " 	updated_dt = ${updated_dt}, "
        + " 	updated_by = ${updated_by}  "
        + " where user_id = ${user_id}      "

    let param = { user_id, status: Constant.STS_USER_DIHAPUS }

    StringUtil.addIdentityData(param, new Date(), by, false)
    await DBUtil.db.none(query, param)
}

const softDeleteBy = async(param, by) => {
    let query = ""
        + " update tb_m_user set            "
        + " 	email = ${email},         "
        + " 	phone = ${phone},         "        
        + " 	status = ${status},         "        
        + " 	updated_dt = ${updated_dt}, "
        + " 	updated_by = ${updated_by}  "
        + " where user_id = ${user_id}      "

    param.status = Constant.STS_USER_DIHAPUS

    StringUtil.addIdentityData(param, new Date(), by, false)
    await DBUtil.db.none(query, param)
}

const findByUserId = async(user_id, withSecurity = false) => {
    let query = searchQuery(withSecurity)
    query += " and user_id = ${user_id} "
    query += ` and us.status != '${Constant.STS_USER_DIHAPUS}' `;
    return await DBUtil.db.oneOrNone(query, {user_id})
}

module.exports = {
    findPaginated,
    findByUserId,
    changePassword,
    getBy,
    create,
    update,
    deleteBy,
    updateLastToken,
    softDeleteBy,
    getNonDeletedUserBy,
    getDeletedUserBy,
    updateDeletedBy
};
