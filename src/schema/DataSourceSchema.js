const { Joi } = require('celebrate');
const BaseSchema = require('./BaseSchema');

// Header schema for nested array
const headerSchema = Joi.object({
    header: Joi.string().max(50).required(),
    value: Joi.string().max(50).required()
});

const searchParamSchema = Joi.object({
    ...BaseSchema.paginationSchema,
    data_source_id: Joi.string().max(50).allow('', null),
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
    query_timeout: Joi.string().max(10).allow('', null),
    url: Joi.string().max(100).required(),
    headers: Joi.array().items(headerSchema).default([])
});

const updateParamSchema = Joi.object({
    data_source_id: Joi.string().max(50).required(),
    name: Joi.string().max(50).required(),
    description: Joi.string().max(200).allow('', null),
    source: Joi.string().max(50).required(),
    is_default: Joi.boolean().default(false),
    query_timeout: Joi.string().max(10).allow('', null),
    url: Joi.string().max(100).required(),
    headers: Joi.array().items(headerSchema).default([])
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