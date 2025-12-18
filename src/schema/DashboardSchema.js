const { Joi } = require('celebrate');
const { PagingBaseSchema } = require('./BaseSchema');

const searchParamSchema = PagingBaseSchema.keys({
    name: Joi.string().allow("").max(50).optional(),
    created_by: Joi.string().allow("").max(50).optional(),
    data_source_id: Joi.string().allow("").max(50).optional()
});

const createParamSchema = Joi.object().keys({
    name: Joi.string().max(50).required(),
    json: Joi.string().required(), // JSON stored as text
});

const updateParamSchema = Joi.object().keys({
    dashboard_id: Joi.string().max(50).required(),
    name: Joi.string().max(50).required(),
    json: Joi.string().required(),
});

const primaryParamSchema = Joi.object().keys({
    dashboard_id: Joi.string().required()
});

const deleteParamSchema = Joi.array().items(primaryParamSchema).min(1).required();

module.exports = {
    searchParamSchema,
    createParamSchema,
    updateParamSchema,
    primaryParamSchema,
    deleteParamSchema
};