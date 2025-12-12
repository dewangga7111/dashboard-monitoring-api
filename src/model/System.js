const DBUtil = require('../helper/DBUtil');
const StringUtil = require('../helper/StringUtil');

const searchQuery = ""
    + " select                "
    + " 	s.category,       "
    + " 	s.sub_category,   "
    + " 	s.code,           "
    + " 	s.value,          "
    + " 	s.remark,         "
    + " 	s.sequence,       "
    + " 	s.parent          "
    + " from tb_m_system s    "
    + " where 1=1             "

const findPaginated = async (param) => {
    let query = searchQuery

    if(param.category) {
        param.category = StringUtil.addWild(param.category);;
        query += " and lower(s.category) like lower(${category}) ";
    }
    if(param.sub_category) {
        param.sub_category = StringUtil.addWild(param.sub_category);;
        query += " and lower(s.sub_category) like lower(${sub_category}) ";
    }
    if(param.code) {
        param.code = StringUtil.addWild(param.code);;
        query += " and lower(s.code) like lower(${code}) ";
    }
    if(param.value) {
        param.value = StringUtil.addWild(param.value);;
        query += " and lower(s.value) like lower(${value}) ";
    }

    if (param.order_by) {
        // dynamic order (from parameter)
        query += DBUtil.createOrderQuery(param);
    } else {
        // default ordering
        query += " order by s.category, s.sub_category, s.code, s.sequence asc ";
    }

    return await DBUtil.getPaginatedResult(query, param);
}

const getBy = async(param, sort) => {
    let query = searchQuery
    if(param.category) {
        query += " and s.category = ${category} ";
    }
    if(param.sub_category) {
        query += " and s.sub_category = ${sub_category} ";
    }
    if(param.code) {
        query += " and s.code = ${code} ";
    }
    if(param.value) {
        query += " and s.value = ${value} ";
    }
    if(param.valueLike) {
        param.valueLike = StringUtil.addWild(param.valueLike);
        query += " and lower(s.value) like lower(${valueLike}) ";
    }
    if(sort) {
        query += sort
    }
    return await DBUtil.db.manyOrNone(query, param)
}

const getOne = async(param) => {
    let query = searchQuery
    if(param.category) {
        query += " and s.category = ${category} ";
    }
    if(param.sub_category) {
        query += " and s.sub_category = ${sub_category} ";
    }
    if(param.code) {
        query += " and s.code = ${code} ";
    }

    return await DBUtil.db.oneOrNone(query, param)
}

const insert = async(param, by) => {
    let query = ""
        + " insert into tb_m_system ( "
        + "     category, sub_category, code, value, remark, sequence, created_dt, created_by, updated_dt, updated_by "
        + " ) values ( "
        + "     ${category}, ${sub_category}, ${code}, ${value}, ${remark}, ${sequence}, ${created_dt}, ${created_by}, ${updated_dt}, ${updated_by} "
        + " ) "

    StringUtil.addIdentityData(param, new Date(), by)
    await DBUtil.db.none(query, param)
}

const update = async(param, by) => {
    let query = ""
        + " update tb_m_system set  "
        + "     value = ${value},   "
        + "     remark = ${remark},      "
        + "     sequence = ${sequence},  "
        + "     updated_dt = ${updated_dt}, "
        + "     updated_by = ${updated_by}  "
        + " where category = ${category} and sub_category = ${sub_category} and code = ${code} "

    StringUtil.addIdentityData(param, new Date(), by, false)
    await DBUtil.db.none(query, param)
}

const deleteBy = async(param) => {
    let query = ""
        + " delete from tb_m_system where 1=1 "
        
    if(param.category) {
        query += " and category = ${category} "
    }
    if(param.sub_category) {
        query += " and sub_category = ${sub_category} "
    }
    if(param.code) {
        query += " and code = ${code} "
    }    
    await DBUtil.db.none(query, param)
}

module.exports = {
    findPaginated,
    getOne,
    getBy,
    insert,
    update,
    deleteBy
}