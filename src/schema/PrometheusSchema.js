const { Joi } = require('celebrate')

const queryParamsSchema = Joi.object().keys({
    query: Joi.string().required(),
    time: Joi.number().optional(),
    timeout: Joi.string().optional()
})

const queryRangeParamsSchema = Joi.object().keys({
    query: Joi.string().required(),
    start: Joi.number().required(),
    end: Joi.number().required(),
    step: Joi.string().optional(),
    timeout: Joi.string().optional()
})

const pluginPathParamsSchema = Joi.object().keys({
    plugin_path: Joi.string().optional()
})

const metadataParamsSchema = Joi.object().keys({
    metric: Joi.string().optional(),
    limit: Joi.number().optional()
})

module.exports = {
    queryParamsSchema,
    queryRangeParamsSchema,
    pluginPathParamsSchema,
    metadataParamsSchema
}