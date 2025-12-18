const axios = require('axios');
const LoggerUtil = require('./LoggerUtil');
const DataSource = require('../model/DataSource');

class PrometheusHelper {
    #logger = new LoggerUtil('PrometheusHelper');

    /**
     * Get DataSource configuration by ID or default
     * @param {string} data_source_id - Optional data source ID
     */
    async getDataSource(data_source_id = null) {
        try {
            let dataSource;

            if (data_source_id) {
                dataSource = await DataSource.findByDataSourceId(data_source_id);
                if (!dataSource) {
                    throw new Error(`Data source with ID '${data_source_id}' not found`);
                }
            } else {
                dataSource = await DataSource.findDefault();
                if (!dataSource) {
                    throw new Error('No default data source configured');
                }
            }

            return dataSource;
        } catch (err) {
            this.#logger.error('getDataSource', err);
            throw err;
        }
    }

    /**
     * Get Prometheus URL from datasource config
     * @param {string} data_source_id - Optional data source ID
     */
    async getPrometheusUrl(data_source_id = null) {
        try {
            const dataSource = await this.getDataSource(data_source_id);

            if (!dataSource.url) {
                throw new Error('Prometheus URL not configured in data source');
            }

            return dataSource.url;
        } catch (err) {
            this.#logger.error('getPrometheusUrl', err);
            throw err;
        }
    }

    /**
     * Get Prometheus timeout from datasource config (default 5000ms)
     * Converts Prometheus time format to milliseconds for axios
     * @param {string} data_source_id - Optional data source ID
     */
    async getPrometheusTimeout(data_source_id = null) {
        try {
            const dataSource = await this.getDataSource(data_source_id);

            if (dataSource.query_timeout) {
                // Parse timeout with Prometheus time units (y, M, w, d, h, m, s)
                const match = dataSource.query_timeout.match(/^(\d+)(y|M|w|d|h|m|s)$/);
                if (match) {
                    const value = parseInt(match[1]);
                    const unit = match[2];

                    // Convert to milliseconds for axios timeout
                    const conversions = {
                        's': 1000,              // seconds
                        'm': 60 * 1000,         // minutes
                        'h': 60 * 60 * 1000,    // hours
                        'd': 24 * 60 * 60 * 1000, // days
                        'w': 7 * 24 * 60 * 60 * 1000, // weeks
                        'M': 30 * 24 * 60 * 60 * 1000, // months (approximate)
                        'y': 365 * 24 * 60 * 60 * 1000 // years (approximate)
                    };

                    return value * conversions[unit];
                }
            }

            return 5000; // default timeout
        } catch (err) {
            this.#logger.error('getPrometheusTimeout', err);
            return 5000; // default timeout
        }
    }

    /**
     * Get request headers from datasource config
     * @param {string} data_source_id - Optional data source ID
     */
    async getHeaders(data_source_id = null) {
        try {
            const dataSource = await this.getDataSource(data_source_id);
            const headers = {};

            if (dataSource.headers && dataSource.headers.length > 0) {
                dataSource.headers.forEach(h => {
                    headers[h.header] = h.value;
                });
            }

            return headers;
        } catch (err) {
            this.#logger.error('getHeaders', err);
            return {};
        }
    }

    /**
     * Check if Prometheus is ready
     * @param {string} data_source_id - Optional data source ID
     */
    async checkReady(data_source_id = null) {
        try {
            const baseUrl = await this.getPrometheusUrl(data_source_id);
            const timeout = await this.getPrometheusTimeout(data_source_id);
            const headers = await this.getHeaders(data_source_id);

            const response = await axios.get(`${baseUrl}/-/ready`, {
                timeout,
                headers,
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
     * @param {string} data_source_id - Optional data source ID
     */
    async checkHealthy(data_source_id = null) {
        try {
            const baseUrl = await this.getPrometheusUrl(data_source_id);
            const timeout = await this.getPrometheusTimeout(data_source_id);
            const headers = await this.getHeaders(data_source_id);

            const response = await axios.get(`${baseUrl}/-/healthy`, {
                timeout,
                headers,
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
     * @param {string} data_source_id - Optional data source ID
     */
    async getBuildInfo(data_source_id = null) {
        try {
            const baseUrl = await this.getPrometheusUrl(data_source_id);
            const timeout = await this.getPrometheusTimeout(data_source_id);
            const headers = await this.getHeaders(data_source_id);

            const response = await axios.get(`${baseUrl}/api/v1/status/buildinfo`, {
                timeout,
                headers
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
     * @param {string} data_source_id - Optional data source ID
     */
    async getTargets(data_source_id = null) {
        try {
            const baseUrl = await this.getPrometheusUrl(data_source_id);
            const timeout = await this.getPrometheusTimeout(data_source_id);
            const headers = await this.getHeaders(data_source_id);

            const response = await axios.get(`${baseUrl}/api/v1/targets`, {
                timeout,
                headers
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
     * @param {string} queryString - PromQL query
     * @param {number} time - Optional evaluation timestamp
     * @param {string} timeout - Optional query timeout
     * @param {string} data_source_id - Optional data source ID
     */
    async query(queryString, time = null, timeout = null, data_source_id = null) {
        try {
            const baseUrl = await this.getPrometheusUrl(data_source_id);
            const defaultTimeout = await this.getPrometheusTimeout(data_source_id);
            const headers = await this.getHeaders(data_source_id);

            const params = { query: queryString };
            if (time) params.time = time;
            if (timeout) params.timeout = timeout;

            const response = await axios.get(`${baseUrl}/api/v1/query`, {
                params,
                timeout: defaultTimeout,
                headers,
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
     * @param {string} queryString - PromQL query
     * @param {number} start - Start timestamp
     * @param {number} end - End timestamp
     * @param {string} step - Query resolution step
     * @param {string} timeout - Optional query timeout
     * @param {string} data_source_id - Optional data source ID
     */
    async queryRange(queryString, start, end, step = '15s', timeout = null, data_source_id = null) {
        try {
            const baseUrl = await this.getPrometheusUrl(data_source_id);
            const defaultTimeout = await this.getPrometheusTimeout(data_source_id);
            const headers = await this.getHeaders(data_source_id);

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
                headers,
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
     * @param {string} data_source_id - Optional data source ID
     */
    async getConfig(data_source_id = null) {
        try {
            const baseUrl = await this.getPrometheusUrl(data_source_id);
            const timeout = await this.getPrometheusTimeout(data_source_id);
            const headers = await this.getHeaders(data_source_id);

            const response = await axios.get(`${baseUrl}/api/v1/status/config`, {
                timeout,
                headers
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
     * @param {string} data_source_id - Optional data source ID
     */
    async getLabelNames(data_source_id = null) {
        try {
            const baseUrl = await this.getPrometheusUrl(data_source_id);
            const timeout = await this.getPrometheusTimeout(data_source_id);
            const headers = await this.getHeaders(data_source_id);

            const response = await axios.get(`${baseUrl}/api/v1/labels`, {
                timeout,
                headers
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
     * @param {string} data_source_id - Optional data source ID
     */
    async getLabelValues(labelName, data_source_id = null) {
        try {
            const baseUrl = await this.getPrometheusUrl(data_source_id);
            const timeout = await this.getPrometheusTimeout(data_source_id);
            const headers = await this.getHeaders(data_source_id);

            const response = await axios.get(`${baseUrl}/api/v1/label/${labelName}/values`, {
                timeout,
                headers
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
     * @param {number} limit - Optional limit
     * @param {string} data_source_id - Optional data source ID
     */
    async getMetadata(metric = null, limit = null, data_source_id = null) {
        try {
            const baseUrl = await this.getPrometheusUrl(data_source_id);
            const timeout = await this.getPrometheusTimeout(data_source_id);
            const headers = await this.getHeaders(data_source_id);

            const params = {};
            if (metric) params.metric = metric;
            if (limit) params.limit = limit;

            const response = await axios.get(`${baseUrl}/api/v1/metadata`, {
                params,
                timeout,
                headers
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