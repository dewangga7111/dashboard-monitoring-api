const axios = require('axios');
const LoggerUtil = require('./LoggerUtil');
const System = require('../model/System');

class PrometheusHelper {
    #logger = new LoggerUtil('PrometheusHelper');

    /**
     * Get Prometheus URL from database config
     */
    async getPrometheusUrl() {
        try {
            const config = await System.getOne({
                category: 'MONITORING',
                sub_category: 'PROMETHEUS',
                code: 'url'
            });

            if (!config || !config.value) {
                throw new Error('Prometheus URL not configured in system master');
            }

            return config.value;
        } catch (err) {
            this.#logger.error('getPrometheusUrl', err);
            throw err;
        }
    }

    /**
     * Get Prometheus timeout from database config (default 5000ms)
     */
    async getPrometheusTimeout() {
        try {
            const config = await System.getOne({
                category: 'MONITORING',
                sub_category: 'PROMETHEUS',
                code: 'timeout'
            });

            return config && config.value ? parseInt(config.value) : 5000;
        } catch (err) {
            this.#logger.error('getPrometheusTimeout', err);
            return 5000; // default timeout
        }
    }

    /**
     * Check if Prometheus is ready
     */
    async checkReady() {
        try {
            const baseUrl = await this.getPrometheusUrl();
            const timeout = await this.getPrometheusTimeout();

            const response = await axios.get(`${baseUrl}/-/ready`, {
                timeout,
                validateStatus: function (status) {
                    return status >= 200 && status < 500;
                }
            });

            return {
                ready: response.status === 200,
                status: response.status,
                statusText: response.statusText
            };
        } catch (err) {
            this.#logger.error('checkReady', err);
            return {
                ready: false,
                error: err.message
            };
        }
    }

    /**
     * Check if Prometheus is healthy
     */
    async checkHealthy() {
        try {
            const baseUrl = await this.getPrometheusUrl();
            const timeout = await this.getPrometheusTimeout();

            const response = await axios.get(`${baseUrl}/-/healthy`, {
                timeout,
                validateStatus: function (status) {
                    return status >= 200 && status < 500;
                }
            });

            return {
                healthy: response.status === 200,
                status: response.status,
                statusText: response.statusText
            };
        } catch (err) {
            this.#logger.error('checkHealthy', err);
            return {
                healthy: false,
                error: err.message
            };
        }
    }

    /**
     * Get Prometheus build info
     */
    async getBuildInfo() {
        try {
            const baseUrl = await this.getPrometheusUrl();
            const timeout = await this.getPrometheusTimeout();

            const response = await axios.get(`${baseUrl}/api/v1/status/buildinfo`, {
                timeout
            });

            if (response.data && response.data.status === 'success') {
                return response.data.data;
            }

            return null;
        } catch (err) {
            this.#logger.error('getBuildInfo', err);
            return null;
        }
    }

    /**
     * Get all targets from Prometheus
     */
    async getTargets() {
        try {
            const baseUrl = await this.getPrometheusUrl();
            const timeout = await this.getPrometheusTimeout();

            const response = await axios.get(`${baseUrl}/api/v1/targets`, {
                timeout
            });

            if (response.data && response.data.status === 'success') {
                return response.data.data;
            }

            throw new Error('Failed to fetch targets from Prometheus');
        } catch (err) {
            this.#logger.error('getTargets', err);
            throw err;
        }
    }

    /**
     * Query Prometheus metrics
     */
    async query(queryString, time = null, timeout = null) {
        try {
            const baseUrl = await this.getPrometheusUrl();
            const defaultTimeout = await this.getPrometheusTimeout();

            const params = { query: queryString };
            if (time) params.time = time;
            if (timeout) params.timeout = timeout;

            const response = await axios.get(`${baseUrl}/api/v1/query`, {
                params,
                timeout: defaultTimeout,
                validateStatus: function (status) {
                    // Accept any status code to handle Prometheus errors
                    return status >= 200 && status < 500;
                }
            });

            // Check if Prometheus returned an error
            if (response.data && response.data.status === 'error') {
                return {
                    success: false,
                    error: response.data.error,
                    errorType: response.data.errorType,
                    warnings: response.data.warnings || []
                };
            }

            if (response.data && response.data.status === 'success') {
                return {
                    success: true,
                    data: response.data.data,
                    warnings: response.data.warnings || []
                };
            }

            throw new Error('Unexpected response from Prometheus');
        } catch (err) {
            this.#logger.error('query', err);
            // Return connection/network errors
            return {
                success: false,
                error: err.message,
                errorType: 'client_error'
            };
        }
    }

    /**
     * Query Prometheus metrics over a time range
     */
    async queryRange(queryString, start, end, step = '15s', timeout = null) {
        try {
            const baseUrl = await this.getPrometheusUrl();
            const defaultTimeout = await this.getPrometheusTimeout();

            const params = {
                query: queryString,
                start,
                end,
                step
            };
            if (timeout) params.timeout = timeout;

            const response = await axios.get(`${baseUrl}/api/v1/query_range`, {
                params,
                timeout: defaultTimeout,
                validateStatus: function (status) {
                    // Accept any status code to handle Prometheus errors
                    return status >= 200 && status < 500;
                }
            });

            // Check if Prometheus returned an error
            if (response.data && response.data.status === 'error') {
                return {
                    success: false,
                    error: response.data.error,
                    errorType: response.data.errorType,
                    warnings: response.data.warnings || []
                };
            }

            if (response.data && response.data.status === 'success') {
                return {
                    success: true,
                    data: response.data.data,
                    warnings: response.data.warnings || []
                };
            }

            throw new Error('Unexpected response from Prometheus');
        } catch (err) {
            this.#logger.error('queryRange', err);
            // Return connection/network errors
            return {
                success: false,
                error: err.message,
                errorType: 'client_error'
            };
        }
    }

    /**
     * Get Prometheus configuration
     */
    async getConfig() {
        try {
            const baseUrl = await this.getPrometheusUrl();
            const timeout = await this.getPrometheusTimeout();

            const response = await axios.get(`${baseUrl}/api/v1/status/config`, {
                timeout
            });

            if (response.data && response.data.status === 'success') {
                return response.data.data;
            }

            return null;
        } catch (err) {
            this.#logger.error('getConfig', err);
            return null;
        }
    }

    /**
     * Get all label names
     */
    async getLabelNames() {
        try {
            const baseUrl = await this.getPrometheusUrl();
            const timeout = await this.getPrometheusTimeout();

            const response = await axios.get(`${baseUrl}/api/v1/labels`, {
                timeout
            });

            if (response.data && response.data.status === 'success') {
                return response.data.data;
            }

            throw new Error('Failed to fetch label names');
        } catch (err) {
            this.#logger.error('getLabelNames', err);
            throw err;
        }
    }

    /**
     * Get all values for a specific label
     * Useful for autocomplete/suggestions in query builder
     * 
     * @param {string} labelName - Label name (e.g., '__name__', 'job', 'instance')
     */
    async getLabelValues(labelName) {
        try {
            const baseUrl = await this.getPrometheusUrl();
            const timeout = await this.getPrometheusTimeout();

            const response = await axios.get(`${baseUrl}/api/v1/label/${labelName}/values`, {
                timeout
            });

            if (response.data && response.data.status === 'success') {
                return response.data.data;
            }

            throw new Error(`Failed to fetch values for label: ${labelName}`);
        } catch (err) {
            this.#logger.error('getLabelValues', err);
            throw err;
        }
    }

    /**
     * Get metadata about metrics (TYPE, HELP)
     * 
     * @param {string} metric - Optional metric name to filter
     */
    async getMetadata(metric = null, limit = null) {
        try {
            const baseUrl = await this.getPrometheusUrl();
            const timeout = await this.getPrometheusTimeout();

            const params = {};
            if (metric) params.metric = metric;
            if (limit) params.limit = limit;

            const response = await axios.get(`${baseUrl}/api/v1/metadata`, {
                params,
                timeout
            });

            if (response.data && response.data.status === 'success') {
                return response.data.data;
            }

            throw new Error('Failed to fetch metadata');
        } catch (err) {
            this.#logger.error('getMetadata', err);
            throw err;
        }
    }
}

module.exports = new PrometheusHelper();