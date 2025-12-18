const { Joi } = require('celebrate');
const { PagingBaseSchema } = require('./BaseSchema')

// Header schema for nested array (create)
const headerSchema = Joi.object({
    header: Joi.string().max(50).required(),
    value: Joi.string().max(50).required()
});

// Header schema for update (includes optional ID for existing headers)
const updateHeaderSchema = Joi.object({
    data_source_header_id: Joi.string().max(50).optional(),
    header: Joi.string().max(50).required(),
    value: Joi.string().max(50).required()
});

// Prometheus timeout format: number followed by time unit (y, M, w, d, h, m, s)
const queryTimeoutPattern = /^\d+(y|M|w|d|h|m|s)$/;

const searchParamSchema = PagingBaseSchema.keys({
    name: Joi.string().max(50).allow('', null),
    source: Joi.string().max(50).allow('', null),
    is_default: Joi.boolean().allow('', null)
});

const primaryParamSchema = Joi.object({
    data_source_id: Joi.string().max(50).required()
});

const createParamSchema = Joi.object({
    name: Joi.string().max(50).required(),
    description: Joi.string().max(200).allow('', null),
    source: Joi.string().max(50).required(),
    is_default: Joi.boolean().default(false),
    query_timeout: Joi.string().pattern(queryTimeoutPattern).max(10).optional()
        .messages({
            'string.pattern.base': 'Value is not valid, you can use number with time unit specifier: y, M, w, d, h, m, s'
        }),
    url: Joi.string().max(100).required(),
    headers: Joi.array().items(headerSchema).default([])
});

const updateParamSchema = Joi.object({
    data_source_id: Joi.string().max(50).required(),
    name: Joi.string().max(50).required(),
    description: Joi.string().max(200).allow('', null),
    is_default: Joi.boolean().default(false),
    query_timeout: Joi.string().pattern(queryTimeoutPattern).max(10).optional()
        .messages({
            'string.pattern.base': 'Value is not valid, you can use number with time unit specifier: y, M, w, d, h, m, s'
        }),
    url: Joi.string().max(100).required(),
    headers: Joi.array().items(updateHeaderSchema).default([])
});

const deleteParamSchema = Joi.array().items(
    Joi.object({
        data_source_id: Joi.string().max(50).required()
    })
).min(1);

const setDefaultParamSchema = Joi.object({
    data_source_id: Joi.string().max(50).required()
});

module.exports = {
    searchParamSchema,
    primaryParamSchema,
    createParamSchema,
    updateParamSchema,
    deleteParamSchema,
    setDefaultParamSchema
};