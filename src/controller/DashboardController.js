const LoggerUtil = require('../helper/LoggerUtil');
const ResponseUtil = require('../helper/ResponseUtil');
const MessageUtil = require('../helper/MessageUtil');
const Dashboard = require('../model/Dashboard');
const StringUtil = require('../helper/StringUtil')

class DashboardController {
    #logger = new LoggerUtil('DashboardController');

    search = async (req, res) => {
        const param = req.query;
        try {
            const result = await Dashboard.findPaginated(param);
            return ResponseUtil.SearchOk(res, result)
        } catch (err) {
            this.#logger.error('search', err);
            return ResponseUtil.InternalServerErr(res, 'Failed to search dashboards: ' + err.message);
        }
    }

    detail = async (req, res) => {
        const { dashboard_id } = req.query;
        try {
            const result = await Dashboard.findByDashboardId(dashboard_id);

            if (!result) {
                return ResponseUtil.NotFound(res, 'Dashboard not found');
            }

            return ResponseUtil.Ok(res, MessageUtil.GetMsg('found', 'Data'), result)
        } catch (err) {
            this.#logger.error('detail', err);
            return ResponseUtil.InternalServerErr(res, 'Failed to get dashboard: ' + err.message);
        }
    }

    create = async (req, res) => {
        const param = req.body;
        const by = req.user.user_id;

        try {
            // Check if dashboard_id already exists
            const existing = await Dashboard.findByDashboardId(param.dashboard_id);
            if (existing) {
                return ResponseUtil.BadRequest(res, 'Dashboard ID already exists');
            }

            // Validate JSON
            try {
                JSON.parse(param.json);
            } catch (jsonErr) {
                return ResponseUtil.BadRequest(res, 'Invalid JSON format');
            }

            param.dashboard_id = StringUtil.generateUUID();

            const createdDashboard = await Dashboard.create(param, by);
            return ResponseUtil.DataCreated(res, 'Data Created', createdDashboard)
        } catch (err) {
            this.#logger.error('create', err);
            return ResponseUtil.InternalServerErr(res, 'Failed to create dashboard: ' + err.message);
        }
    }

    update = async (req, res) => {
        const param = req.body;
        const by = req.user.user_id;

        try {
            // Check if dashboard exists
            const existing = await Dashboard.findByDashboardId(param.dashboard_id);
            if (!existing) {
                return ResponseUtil.NotFound(res, 'Dashboard not found');
            }

            // Validate JSON
            try {
                JSON.parse(param.json);
            } catch (jsonErr) {
                return ResponseUtil.BadRequest(res, 'Invalid JSON format');
            }

            await Dashboard.update(param, by);
            return ResponseUtil.DataUpdated(res)
        } catch (err) {
            this.#logger.error('update', err);
            return ResponseUtil.InternalServerErr(res, 'Failed to update dashboard: ' + err.message);
        }
    }

    delete = async (req, res) => {
        const { dashboard_id } = req.query;
        const by = req.user.user_id;

        try {
            // Check if dashboard exists
            const existing = await Dashboard.findByDashboardId(dashboard_id);
            if (!existing) {
                return ResponseUtil.NotFound(res, 'Dashboard not found');
            }

            await Dashboard.deleteBy(dashboard_id, by);
            return ResponseUtil.DataDeleted(res)
        } catch (err) {
            this.#logger.error('delete', err);
            return ResponseUtil.InternalServerErr(res, 'Failed to delete dashboard: ' + err.message);
        }
    }

    deleteMany = async (req, res) => {
        const param = req.body;
        const by = req.user.user_id;

        try {
            await Dashboard.deleteManyBy(param, by);
            return ResponseUtil.DataDeleted(res)
        } catch (err) {
            this.#logger.error('deleteMany', err);
            return ResponseUtil.InternalServerErr(res, 'Failed to delete dashboards: ' + err.message);
        }
    }
}

module.exports = new DashboardController();