const { Router } = require('express');
const { celebrate } = require('celebrate');

const { JwtFilter } = require('../../middleware/RequestFilter');
const Controller = require('../../controller/PrometheusController');
const Schema = require('../../schema/PrometheusSchema');
const router = Router();

// Apply JWT filter to all routes
router.all('/*', JwtFilter);

// Prometheus status and health
router.get('/status', Controller.status);
router.get('/health', Controller.healthCheck);

// Targets monitoring
router.get('/targets', Controller.targets);

// Metrics querying
router.get('/query', celebrate({ query: Schema.queryParamsSchema }), Controller.query);
router.get('/query-range', celebrate({ query: Schema.queryRangeParamsSchema }), Controller.queryRange);

// Configuration
router.get('/config', Controller.config);

// Plugins
router.get('/plugins', Controller.plugins);

// Labels - for autocomplete/suggestions
router.get('/labels', Controller.labelNames);
router.get('/label/:label/values', Controller.labelValues);

module.exports = router;