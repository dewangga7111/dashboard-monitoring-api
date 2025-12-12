const pgp = require('pg-promise')({
    schema: ['public']
})

const opt = {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASS
}
// console.log("DB connection String:", JSON.stringify(opt))

const db = pgp(opt)

const getTotalRows = async (innerQuery, queryParams, dbConn) => {
    let countQuery = 
        ' SELECT count(1) ' +
        ' FROM ( ' + innerQuery + ' ) A '
    // console.log('count query', countQuery)
    let totalRows = { count: 0 }
    if(dbConn) {
        totalRows = await dbConn.one(countQuery, queryParams)        
    } else {
        totalRows = await db.one(countQuery, queryParams)        
    }
    return totalRows.count
}

const createOrderQuery = (param) => {
    let columns = param.order_by.split(',');
    let dirs = param.dir.split(',');
    let queryWithOrder =  ' order by ';
    for (let i = 0; i < columns.length; i++) {
        if (columns[i]) {
            if (i > 0) {
                queryWithOrder += ', ';
            }
            let dir = dirs[i] && (dirs[i].toLowerCase() == 'asc' || dirs[i].toLowerCase() == 'desc') ? dirs[i] : 'asc'
            queryWithOrder += `"${columns[i]}" ${dir}`;
        }
    }
    console.log(queryWithOrder)
    return queryWithOrder
}

const getPaginatedResult = async(query, param, dbConn) => {
    let total_rows = await getTotalRows(query, param, dbConn);

    let paginatedQuery = query

    // limit and paging and such
    let limit = process.env.PAGINATION_LIMIT;
    if (param.per_page) {
        limit = param.per_page;
    }

    let offset = 0;
    if (param.page && param.page != '') {
        offset = limit * (param.page - 1);
    }

    paginatedQuery += ` LIMIT ${limit} OFFSET ${offset} `;

    let result;
    if(dbConn) {
        result = await dbConn.manyOrNone(paginatedQuery, param);
    } else {
        result = await db.manyOrNone(paginatedQuery, param);
    }
    
    let total_pages = Math.ceil(total_rows / param.per_page);

    return {
        page: param.page,
        per_page: param.per_page,
        total_rows,
        total_pages,
        result,
    };
}

module.exports = { db, getTotalRows, getPaginatedResult, createOrderQuery }