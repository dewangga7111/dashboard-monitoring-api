const LoggerUtil = require('../helper/LoggerUtil');
const ResponseUtil = require('../helper/ResponseUtil');
const MessageUtil = require('../helper/MessageUtil');
const DataSource = require('../model/DataSource');
const StringUtil = require('../helper/StringUtil');

class DataSourceController {
    #logger = new LoggerUtil('DataSourceController');

    search = async (req, res) => {
        const param = req.query;
        try {
            const result = await DataSource.findPaginated(param);
            return ResponseUtil.SearchOk(res, result);
        } catch (err) {
            this.#logger.error('search', err);
            return ResponseUtil.InternalServerErr(res, 'Failed to search data sources: ' + err.message);
        }
    }

    detail = async (req, res) => {
        const { data_source_id } = req.query;
        try {
            const result = await DataSource.findByDataSourceId(data_source_id);

            if (!result) {
                return ResponseUtil.NotFound(res, 'Data source not found');
            }

            return ResponseUtil.Ok(res, MessageUtil.GetMsg('found', 'Data'), result);
        } catch (err) {
            this.#logger.error('detail', err);
            return ResponseUtil.InternalServerErr(res, 'Failed to get data source: ' + err.message);
        }
    }

    getDefault = async (req, res) => {
        try {
            const result = await DataSource.findDefault();

            if (!result) {
                return ResponseUtil.NotFound(res, 'No default data source configured');
            }

            return ResponseUtil.Ok(res, MessageUtil.GetMsg('found', 'Data'), result);
        } catch (err) {
            this.#logger.error('getDefault', err);
            return ResponseUtil.InternalServerErr(res, 'Failed to get default data source: ' + err.message);
        }
    }

    create = async (req, res) => {
        const param = req.body;
        const by = req.user.user_id;

        try {
            // Check if name already exists
            const existingName = await DataSource.getBy({ name: param.name });
            if (existingName && existingName.length > 0) {
                return ResponseUtil.BadRequest(res, 'Data source name already exists');
            }

            // Generate UUID for data_source_id
            param.data_source_id = StringUtil.generateUUID();

            const createdDataSource = await DataSource.create(param, by);
            return ResponseUtil.DataCreated(res, 'Data Created', createdDataSource);
        } catch (err) {
            this.#logger.error('create', err);
            return ResponseUtil.InternalServerErr(res, 'Failed to create data source: ' + err.message);
        }
    }

    update = async (req, res) => {
        const param = req.body;
        const by = req.user.user_id;

        try {
            // Check if data source exists
            const existing = await DataSource.findByDataSourceId(param.data_source_id);
            if (!existing) {
                return ResponseUtil.NotFound(res, 'Data source not found');
            }

            // Check if name already exists (excluding current record)
            if (param.name !== existing.name) {
                const existingName = await DataSource.getBy({ name: param.name });
                if (existingName && existingName.length > 0) {
                    return ResponseUtil.BadRequest(res, 'Data source name already exists');
                }
            }

            await DataSource.update(param, by);
            return ResponseUtil.DataUpdated(res);
        } catch (err) {
            this.#logger.error('update', err);
            return ResponseUtil.InternalServerErr(res, 'Failed to update data source: ' + err.message);
        }
    }

    delete = async (req, res) => {
        const { data_source_id } = req.query;
        const by = req.user.user_id;

        try {
            // Check if data source exists
            const existing = await DataSource.findByDataSourceId(data_source_id);
            if (!existing) {
                return ResponseUtil.NotFound(res, 'Data source not found');
            }

            // Prevent deletion of default data source
            if (existing.is_default) {
                return ResponseUtil.BadRequest(res, 'Cannot delete default data source. Set another as default first.');
            }

            await DataSource.deleteBy(data_source_id, by);
            return ResponseUtil.DataDeleted(res);
        } catch (err) {
            this.#logger.error('delete', err);
            return ResponseUtil.InternalServerErr(res, 'Failed to delete data source: ' + err.message);
        }
    }

    deleteMany = async (req, res) => {
        const param = req.body;
        const by = req.user.user_id;

        try {
            // Check if any of the data sources is default
            for (const ds of param) {
                const existing = await DataSource.findByDataSourceId(ds.data_source_id);
                if (existing && existing.is_default) {
                    return ResponseUtil.BadRequest(res, `Cannot delete default data source: ${existing.name}`);
                }
            }

            await DataSource.deleteManyBy(param, by);
            return ResponseUtil.DataDeleted(res);
        } catch (err) {
            this.#logger.error('deleteMany', err);
            return ResponseUtil.InternalServerErr(res, 'Failed to delete data sources: ' + err.message);
        }
    }

    setDefault = async (req, res) => {
        const { data_source_id } = req.body;
        const by = req.user.user_id;

        try {
            // Check if data source exists
            const existing = await DataSource.findByDataSourceId(data_source_id);
            if (!existing) {
                return ResponseUtil.NotFound(res, 'Data source not found');
            }

            await DataSource.setDefault(data_source_id, by);
            return ResponseUtil.DataUpdated(res, 'Default data source updated');
        } catch (err) {
            this.#logger.error('setDefault', err);
            return ResponseUtil.InternalServerErr(res, 'Failed to set default data source: ' + err.message);
        }
    }
}

module.exports = new DataSourceController();