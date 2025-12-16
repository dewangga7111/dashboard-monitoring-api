const LoggerUtil = require('../helper/LoggerUtil');
const ResponseUtil = require('../helper/ResponseUtil');
const MessageUtil = require('../helper/MessageUtil');
const PrometheusHelper = require('../helper/PrometheusHelper');
const PluginHelper = require('../helper/PluginHelper');

class PrometheusController {
    #logger = new LoggerUtil('PrometheusController');

    /**
     * Get Prometheus status (health, ready, build info)
     */
    status = async (req, res) => {
        try {
            const [ready, healthy, buildInfo] = await Promise.all([
                PrometheusHelper.checkReady(),
                PrometheusHelper.checkHealthy(),
                PrometheusHelper.getBuildInfo()
            ]);

            const prometheusUrl = await PrometheusHelper.getPrometheusUrl();

            const result = {
                url: prometheusUrl,
                ready: ready.ready,
                healthy: healthy.healthy,
                version: buildInfo?.version || 'unknown',
                buildInfo: buildInfo || null,
                status: (ready.ready && healthy.healthy) ? 'UP' : 'DOWN'
            };

            return ResponseUtil.Ok(res, 'Prometheus status retrieved', result);
        } catch (err) {
            this.#logger.error('status', err);
            return ResponseUtil.InternalServerErr(res, 'Failed to get Prometheus status: ' + err.message);
        }
    }

    /**
     * Get all Prometheus targets
     */
    targets = async (req, res) => {
        try {
            const targetsData = await PrometheusHelper.getTargets();

            const activeTargets = targetsData.activeTargets || [];
            const droppedTargets = targetsData.droppedTargets || [];

            // Format active targets
            const formattedActiveTargets = activeTargets.map(target => ({
                scrapePool: target.scrapePool,
                scrapeUrl: target.scrapeUrl,
                globalUrl: target.globalUrl,
                health: target.health,
                lastError: target.lastError || '',
                lastScrape: target.lastScrape,
                lastScrapeDuration: target.lastScrapeDuration,
                labels: target.labels || {},
                discoveredLabels: target.discoveredLabels || {}
            }));

            // Group by scrape pool (job)
            const groupedByJob = {};
            formattedActiveTargets.forEach(target => {
                const job = target.labels.job || 'unknown';
                if (!groupedByJob[job]) {
                    groupedByJob[job] = [];
                }
                groupedByJob[job].push(target);
            });

            // Calculate summary
            const summary = {
                total: activeTargets.length,
                up: activeTargets.filter(t => t.health === 'up').length,
                down: activeTargets.filter(t => t.health === 'down').length,
                unknown: activeTargets.filter(t => t.health === 'unknown').length,
                dropped: droppedTargets.length,
                jobs: Object.keys(groupedByJob).length
            };

            const result = {
                summary,
                targets: formattedActiveTargets,
                targetsByJob: groupedByJob,
                droppedTargetsCount: droppedTargets.length
            };

            return ResponseUtil.Ok(res, 'Targets retrieved successfully', result);
        } catch (err) {
            this.#logger.error('targets', err);
            return ResponseUtil.InternalServerErr(res, 'Failed to get targets: ' + err.message);
        }
    }

    /**
     * Query Prometheus metrics
     */
    query = async (req, res) => {
        const param = req.query;
        try {
            const result = await PrometheusHelper.query(
                param.query,
                param.time ? parseInt(param.time) : null,
                param.timeout
            );

            // Check if query failed
            if (!result.success) {
                return ResponseUtil.BadRequest(res, result.error, {
                    errorType: result.errorType,
                    query: param.query,
                    warnings: result.warnings
                });
            }

            // Success - return data with warnings if any
            const response = {
                ...result.data,
                query: param.query
            };

            if (result.warnings && result.warnings.length > 0) {
                response.warnings = result.warnings;
            }

            return ResponseUtil.Ok(res, 'Query executed successfully', response);
        } catch (err) {
            this.#logger.error('query', err);
            return ResponseUtil.InternalServerErr(res, 'Query failed: ' + err.message);
        }
    }

    /**
     * Query Prometheus metrics over time range
     */
    queryRange = async (req, res) => {
        const param = req.query;
        try {
            const result = await PrometheusHelper.queryRange(
                param.query,
                parseInt(param.start),
                parseInt(param.end),
                param.step || '15s',
                param.timeout
            );

            // Check if query failed
            if (!result.success) {
                return ResponseUtil.BadRequest(res, result.error, {
                    errorType: result.errorType,
                    query: param.query,
                    start: param.start,
                    end: param.end,
                    step: param.step || '15s',
                    warnings: result.warnings
                });
            }

            // Success - return data with warnings if any
            const response = {
                ...result.data,
                query: param.query,
                start: param.start,
                end: param.end,
                step: param.step || '15s'
            };

            if (result.warnings && result.warnings.length > 0) {
                response.warnings = result.warnings;
            }

            return ResponseUtil.Ok(res, 'Range query executed successfully', response);
        } catch (err) {
            this.#logger.error('queryRange', err);
            return ResponseUtil.InternalServerErr(res, 'Range query failed: ' + err.message);
        }
    }

    /**
     * Get Prometheus configuration
     */
    config = async (req, res) => {
        try {
            const configData = await PrometheusHelper.getConfig();

            if (!configData) {
                return ResponseUtil.NotFound(res, 'Configuration not available');
            }

            return ResponseUtil.Ok(res, 'Configuration retrieved', configData);
        } catch (err) {
            this.#logger.error('config', err);
            return ResponseUtil.InternalServerErr(res, 'Failed to get configuration: ' + err.message);
        }
    }

    /**
     * Get installed plugins (Grafana/Perses)
     */
    plugins = async (req, res) => {
        try {
            const plugins = await PluginHelper.getAllPlugins();
            const summary = await PluginHelper.getPluginSummary();

            const result = {
                summary,
                plugins
            };

            return ResponseUtil.Ok(res, 'Plugins retrieved successfully', result);
        } catch (err) {
            this.#logger.error('plugins', err);
            return ResponseUtil.InternalServerErr(res, 'Failed to get plugins: ' + err.message);
        }
    }

    /**
     * Health check endpoint - combines Prometheus status and plugin info
     */
    healthCheck = async (req, res) => {
        try {
            const [prometheusReady, prometheusHealthy, buildInfo, plugins] = await Promise.all([
                PrometheusHelper.checkReady(),
                PrometheusHelper.checkHealthy(),
                PrometheusHelper.getBuildInfo(),
                PluginHelper.getAllPlugins()
            ]);

            const prometheusUrl = await PrometheusHelper.getPrometheusUrl();

            const result = {
                prometheus: {
                    url: prometheusUrl,
                    ready: prometheusReady.ready,
                    healthy: prometheusHealthy.healthy,
                    version: buildInfo?.version || 'unknown',
                    status: (prometheusReady.ready && prometheusHealthy.healthy) ? 'UP' : 'DOWN'
                },
                plugins: {
                    total: plugins.length,
                    installed: plugins.map(p => ({
                        name: p.name,
                        version: p.version,
                        type: p.type
                    }))
                },
                overall_status: (prometheusReady.ready && prometheusHealthy.healthy) ? 'HEALTHY' : 'UNHEALTHY',
                timestamp: new Date().toISOString()
            };

            return ResponseUtil.Ok(res, 'Health check completed', result);
        } catch (err) {
            this.#logger.error('healthCheck', err);
            return ResponseUtil.InternalServerErr(res, 'Health check failed: ' + err.message);
        }
    }

    /**
     * Get all label names from Prometheus
     */
    labelNames = async (req, res) => {
        try {
            const labels = await PrometheusHelper.getLabelNames();
            return ResponseUtil.Ok(res, 'Label names retrieved successfully', labels);
        } catch (err) {
            this.#logger.error('labelNames', err);
            return ResponseUtil.InternalServerErr(res, 'Failed to get label names: ' + err.message);
        }
    }

    /**
     * Get all values for a specific label
     * Useful for autocomplete/suggestions in query builder UI
     */
    labelValues = async (req, res) => {
        const { label } = req.params;
        try {
            const values = await PrometheusHelper.getLabelValues(label);

            return ResponseUtil.Ok(res, `Values for label '${label}' retrieved successfully`, values);
        } catch (err) {
            this.#logger.error('labelValues', err);
            return ResponseUtil.InternalServerErr(res, `Failed to get values for label '${label}': ` + err.message);
        }
    }

    /**
     * Get metric metadata (TYPE, HELP descriptions)
     */
    metadata = async (req, res) => {
        const { metric, limit } = req.query;

        try {
            const metadataInfo = await PrometheusHelper.getMetadata(
                metric,
                limit ? parseInt(limit) : null
            );

            const result = {
                count: Object.keys(metadataInfo).length,
                metadata: metadataInfo
            };

            return ResponseUtil.Ok(res, 'Metadata retrieved successfully', result);
        } catch (err) {
            this.#logger.error('metadata', err);
            return ResponseUtil.InternalServerErr(res, 'Failed to get metadata: ' + err.message);
        }
    }
}

module.exports = new PrometheusController();