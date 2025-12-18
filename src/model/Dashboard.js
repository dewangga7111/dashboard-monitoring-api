const DBUtil = require('../helper/DBUtil');
const StringUtil = require('../helper/StringUtil');

const searchQuery = () => {
    let query = ""
        + " SELECT                     "
        + "     dashboard_id,          "
        + "     name,                  "
        + "     json,                  "
        + "     created_dt,            "
        + "     created_by,            "
        + "     updated_dt,            "
        + "     updated_by             "
        + " FROM tb_r_dashboard        "
        + " WHERE 1=1                  ";

    return query;
};

const findPaginated = async (param) => {
    let query = searchQuery();

    if (param.dashboard_id) {
        param.dashboard_id = StringUtil.addWild(param.dashboard_id);
        query += " AND LOWER(dashboard_id) LIKE LOWER(${dashboard_id}) ";
    }
    if (param.name) {
        param.name = StringUtil.addWild(param.name);
        query += " AND LOWER(name) LIKE LOWER(${name}) ";
    }
    if (param.created_by) {
        param.created_by = StringUtil.addWild(param.created_by);
        query += " AND LOWER(created_by) LIKE LOWER(${created_by}) ";
    }
    if (param.data_source_id) {
        query += " AND (json::jsonb ->> 'data_source_id' = ${data_source_id} OR json::text LIKE '%' || ${data_source_id} || '%') ";
    }

    if (param.order_by) {
        query += DBUtil.createOrderQuery(param);
    } else {
        query += " ORDER BY created_dt DESC ";
    }

    return await DBUtil.getPaginatedResult(query, param);
};

const getBy = async (param) => {
    let query = searchQuery();
    
    if (param.dashboard_id) {
        query += " AND dashboard_id = ${dashboard_id} ";
    }
    if (param.name) {
        query += " AND name = ${name} ";
    }
    if (param.created_by) {
        query += " AND created_by = ${created_by} ";
    }

    return await DBUtil.db.manyOrNone(query, param);
};

const findByDashboardId = async (dashboard_id) => {
    let query = searchQuery();
    query += " AND dashboard_id = ${dashboard_id} ";
    return await DBUtil.db.oneOrNone(query, { dashboard_id });
};

const create = async (param, by) => {
    let query = ""
        + " INSERT INTO tb_r_dashboard "
        + " (dashboard_id, name, json, created_dt, created_by, updated_dt, updated_by) "
        + " VALUES "
        + " (${dashboard_id}, ${name}, ${json}, ${created_dt}, ${created_by}, ${updated_dt}, ${updated_by}) "
        + " RETURNING dashboard_id, name, json, created_dt, created_by, updated_dt, updated_by ";

    StringUtil.addIdentityData(param, new Date(), by);
    return await DBUtil.db.one(query, param);
};

const update = async (param, by) => {
    let query = ""
        + " UPDATE tb_r_dashboard SET      "
        + "     name = ${name},            "
        + "     json = ${json},            "
        + "     updated_dt = ${updated_dt},"
        + "     updated_by = ${updated_by} "
        + " WHERE dashboard_id = ${dashboard_id} ";

    StringUtil.addIdentityData(param, new Date(), by, false);
    await DBUtil.db.none(query, param);
};

const deleteBy = async (dashboard_id, by) => {
    let query = ""
        + " DELETE FROM tb_r_dashboard "
        + " WHERE dashboard_id = ${dashboard_id} ";

    await DBUtil.db.none(query, { dashboard_id });
};

const deleteManyBy = async (dashboards, by) => {
    const ids = dashboards.map(d => d.dashboard_id);
    const placeholders = ids.map((_, i) => `$${i + 1}`).join(',');
    
    let query = `DELETE FROM tb_r_dashboard WHERE dashboard_id IN (${placeholders})`;
    
    await DBUtil.db.none(query, ids);
};

module.exports = {
    findPaginated,
    findByDashboardId,
    getBy,
    create,
    update,
    deleteBy,
    deleteManyBy
};