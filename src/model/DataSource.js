const DBUtil = require('../helper/DBUtil');
const StringUtil = require('../helper/StringUtil');

const searchQuery = () => {
    let query = ""
        + " SELECT                          "
        + "     ds.data_source_id,          "
        + "     ds.name,                    "
        + "     ds.description,             "
        + "     ds.source,                  "
        + "     ds.is_default,              "
        + "     ds.query_timeout,           "
        + "     ds.url,                     "
        + "     ds.created_dt,              "
        + "     ds.created_by,              "
        + "     ds.updated_dt,              "
        + "     ds.updated_by               "
        + " FROM tb_r_data_source ds        "
        + " WHERE 1=1                       ";

    return query;
};

const findPaginated = async (param) => {
    let query = searchQuery();

    if (param.data_source_id) {
        param.data_source_id = StringUtil.addWild(param.data_source_id);
        query += " AND LOWER(ds.data_source_id) LIKE LOWER(${data_source_id}) ";
    }
    if (param.name) {
        param.name = StringUtil.addWild(param.name);
        query += " AND LOWER(ds.name) LIKE LOWER(${name}) ";
    }
    if (param.source) {
        param.source = StringUtil.addWild(param.source);
        query += " AND LOWER(ds.source) LIKE LOWER(${source}) ";
    }
    if (param.is_default !== undefined && param.is_default !== '') {
        query += " AND ds.is_default = ${is_default} ";
    }

    if (param.order_by) {
        query += DBUtil.createOrderQuery(param);
    } else {
        query += " ORDER BY ds.created_dt DESC ";
    }

    return await DBUtil.getPaginatedResult(query, param);
};

const getBy = async (param) => {
    let query = searchQuery();

    if (param.data_source_id) {
        query += " AND ds.data_source_id = ${data_source_id} ";
    }
    if (param.name) {
        query += " AND ds.name = ${name} ";
    }
    if (param.is_default !== undefined) {
        query += " AND ds.is_default = ${is_default} ";
    }

    return await DBUtil.db.manyOrNone(query, param);
};

const findByDataSourceId = async (data_source_id) => {
    let query = searchQuery();
    query += " AND ds.data_source_id = ${data_source_id} ";
    const dataSource = await DBUtil.db.oneOrNone(query, { data_source_id });

    if (dataSource) {
        // Fetch headers for this data source
        dataSource.headers = await getHeadersByDataSourceId(data_source_id);
    }

    return dataSource;
};

const findDefault = async () => {
    let query = searchQuery();
    query += " AND ds.is_default = true ";
    const dataSource = await DBUtil.db.oneOrNone(query);

    if (dataSource) {
        dataSource.headers = await getHeadersByDataSourceId(dataSource.data_source_id);
    }

    return dataSource;
};

const create = async (param, by) => {
    return await DBUtil.db.tx(async t => {
        // If setting as default, unset other defaults first
        if (param.is_default === true) {
            await t.none("UPDATE tb_r_data_source SET is_default = false WHERE is_default = true");
        }

        // Insert data source
        let query = ""
            + " INSERT INTO tb_r_data_source "
            + " (data_source_id, name, description, source, is_default, query_timeout, url, created_dt, created_by, updated_dt, updated_by) "
            + " VALUES "
            + " (${data_source_id}, ${name}, ${description}, ${source}, ${is_default}, ${query_timeout}, ${url}, ${created_dt}, ${created_by}, ${updated_dt}, ${updated_by}) "
            + " RETURNING data_source_id, name, description, source, is_default, query_timeout, url, created_dt, created_by ";

        StringUtil.addIdentityData(param, new Date(), by);
        const dataSource = await t.one(query, param);

        // Insert headers if provided
        if (param.headers && param.headers.length > 0) {
            const headers = await insertHeaders(t, param.data_source_id, param.headers, by);
            dataSource.headers = headers;
        } else {
            dataSource.headers = [];
        }

        return dataSource;
    });
};

const update = async (param, by) => {
    return await DBUtil.db.tx(async t => {
        // If setting as default, unset other defaults first
        if (param.is_default === true) {
            await t.none("UPDATE tb_r_data_source SET is_default = false WHERE data_source_id != ${data_source_id}", param);
        }

        let query = ""
            + " UPDATE tb_r_data_source SET     "
            + "     name = ${name},             "
            + "     description = ${description}, "
            + "     source = ${source},         "
            + "     is_default = ${is_default}, "
            + "     query_timeout = ${query_timeout}, "
            + "     url = ${url},               "
            + "     updated_dt = ${updated_dt}, "
            + "     updated_by = ${updated_by}  "
            + " WHERE data_source_id = ${data_source_id} ";

        StringUtil.addIdentityData(param, new Date(), by, false);
        await t.none(query, param);

        // Delete existing headers and insert new ones
        await t.none("DELETE FROM tb_r_data_source_header WHERE data_source_id = ${data_source_id}", param);

        if (param.headers && param.headers.length > 0) {
            await insertHeaders(t, param.data_source_id, param.headers, by);
        }
    });
};

const deleteBy = async (data_source_id, by) => {
    return await DBUtil.db.tx(async t => {
        // Delete headers first
        await t.none("DELETE FROM tb_r_data_source_header WHERE data_source_id = ${data_source_id}", { data_source_id });
        // Delete data source
        await t.none("DELETE FROM tb_r_data_source WHERE data_source_id = ${data_source_id}", { data_source_id });
    });
};

const deleteManyBy = async (dataSources, by) => {
    const ids = dataSources.map(d => d.data_source_id);
    const placeholders = ids.map((_, i) => `$${i + 1}`).join(',');

    return await DBUtil.db.tx(async t => {
        // Delete headers first
        await t.none(`DELETE FROM tb_r_data_source_header WHERE data_source_id IN (${placeholders})`, ids);
        // Delete data sources
        await t.none(`DELETE FROM tb_r_data_source WHERE data_source_id IN (${placeholders})`, ids);
    });
};

// Header helper functions
const getHeadersByDataSourceId = async (data_source_id) => {
    let query = ""
        + " SELECT                              "
        + "     data_source_header_id,          "
        + "     data_source_id,                 "
        + "     header,                         "
        + "     value,                          "
        + "     created_dt,                     "
        + "     created_by,                     "
        + "     updated_dt,                     "
        + "     updated_by                      "
        + " FROM tb_r_data_source_header        "
        + " WHERE data_source_id = ${data_source_id} "
        + " ORDER BY created_dt ASC ";

    return await DBUtil.db.manyOrNone(query, { data_source_id });
};

const insertHeaders = async (t, data_source_id, headers, by) => {
    const insertedHeaders = [];
    const now = new Date();

    for (const header of headers) {
        const headerParam = {
            data_source_header_id: StringUtil.generateUUID(),
            data_source_id,
            header: header.header,
            value: header.value
        };
        StringUtil.addIdentityData(headerParam, now, by);

        let query = ""
            + " INSERT INTO tb_r_data_source_header "
            + " (data_source_header_id, data_source_id, header, value, created_dt, created_by, updated_dt, updated_by) "
            + " VALUES "
            + " (${data_source_header_id}, ${data_source_id}, ${header}, ${value}, ${created_dt}, ${created_by}, ${updated_dt}, ${updated_by}) "
            + " RETURNING data_source_header_id, data_source_id, header, value ";

        const inserted = await t.one(query, headerParam);
        insertedHeaders.push(inserted);
    }

    return insertedHeaders;
};

const setDefault = async (data_source_id, by) => {
    return await DBUtil.db.tx(async t => {
        // Unset all defaults
        await t.none("UPDATE tb_r_data_source SET is_default = false, updated_dt = ${updated_dt}, updated_by = ${updated_by}", {
            updated_dt: new Date(),
            updated_by: by
        });
        // Set the specified one as default
        await t.none("UPDATE tb_r_data_source SET is_default = true, updated_dt = ${updated_dt}, updated_by = ${updated_by} WHERE data_source_id = ${data_source_id}", {
            data_source_id,
            updated_dt: new Date(),
            updated_by: by
        });
    });
};

module.exports = {
    findPaginated,
    findByDataSourceId,
    findDefault,
    getBy,
    create,
    update,
    deleteBy,
    deleteManyBy,
    getHeadersByDataSourceId,
    setDefault
};