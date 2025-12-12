const moment = require('moment')
const DBUtil = require('../helper/DBUtil');
const StringUtil = require('../helper/StringUtil');
const Constant = require('../helper/Constant')
const table = 'tb_l_activity'
const table_cd = 'la'

const searchQuery = () => {
    let query = ""
        + "  select                                        "
        + "  	la.activity_id,                            "
        + "  	la.username,                               "
        + "  	to_char(la.last_logout, 'DD MM YYYY hh:mm:ss') as last_login,               "
        + "  	to_char(la.last_login, 'DD MM YYYY hh:mm:ss') as last_logout,               "
        + "  	to_char(la.created_dt, 'DD MM YYYY hh:mm:ss') as request_dt,               "
        + "  	la.created_by as request_by                "
        + "  from tb_l_activity la                         "
        + "  where 1=1                                     "
    return query
}

const findPaginated = async (param) => {
    let query = searchQuery()

    if(param.date_from) {
        param.date_from = moment(param.date_from).format('YYYY-MM-DD')
        query += " AND to_char(la.created_dt, 'YYYY-MM-DD') >= ${date_from} "
    }
    if(param.date_to) {
        param.date_to = moment(param.date_to).format('YYYY-MM-DD')
        query += " AND to_char(la.created_dt, 'YYYY-MM-DD') <= ${date_to} "
    }

    if (param.order_by) {
        // dynamic order (from parameter)
        query += DBUtil.createOrderQuery(param);
    } else {
        // default ordering
        query += " order by la.created_dt desc ";
    }

    return await DBUtil.getPaginatedResult(query, param);
}

const insertLogUser = async (param, by) => {
    let query =
        `	INSERT INTO ${table} ( ` +
        '		activity_id,                ' +
        '		username,                ' +
        '		last_login,             ' +
        '		created_dt,             ' +
        '		created_by,             ' +
        '		updated_dt,             ' +
        '		updated_by              ' +
        '	) VALUES (                  ' +
        '		${activityId},             ' +
        '		${userName},             ' +
        '		${lastLogin},          ' +
        '		${dt},              ' +
        '		${by},              ' +
        '		${dt},              ' +
        '		${by}               ' +
        '	)                       ' +
        '	RETURNING activity_id; ' 

    param.activityId = StringUtil.generateUUID()
    param.dt = new Date()
    param.by = by
    const result = await DBUtil.db.one(query, param)

    return result.activity_id
}

const updateLogUser = async (param, by) => {
    let query = `
        update ${table} set
            last_logout = \${lastLogout},
            updated_by = \${updated_by},
            updated_dt = \${updated_dt}
        where activity_id = \${activityId}        
    `
    StringUtil.addIdentityData(param, new Date(), by, false)

    await DBUtil.db.none(query, param)
}

const summaryLastActivity = async (params) => {
    let query =
        '	SELECT                      '
        + '		COUNT(*) AS active_session                '
        + `	FROM ${table} ${table_cd}         `
        + '	LEFT JOIN                                       '
        + `		tb_m_user mu ON mu.username = ${table_cd}.username     `
        + '	WHERE 1=1                   '

    let { activityId, userName, lastLoginFrom, lastLoginTo } = params

    if (activityId && activityId != "") {
        query += ` AND ${table_cd}.activity_id = \${activityId} `
    }
    if (userName && userName != "") {
        query += ` AND ${table_cd}.username = \${userName} `
    }
    if (lastLoginFrom && lastLoginFrom != "") {
        lastLoginFrom = moment(lastLoginFrom).format('YYYY-MM-DD')
        query += ` AND to_char(${table_cd}.last_login, 'YYYY-MM-DD') >= \${lastLoginFrom} `
    }
    if (lastLoginTo && lastLoginTo != "") {
        lastLoginTo = moment(lastLoginTo).format('YYYY-MM-DD')
        query += ` AND to_char(${table_cd}.last_login, 'YYYY-MM-DD') <= \${lastLoginTo} `
    }

    query += '	AND last_logout IS NULL  '

    return await DBUtil.db.oneOrNone(query, { activityId, userName, lastLoginFrom, lastLoginTo })
}

module.exports = {
    findPaginated,
    insertLogUser,
    updateLogUser,
    summaryLastActivity
}