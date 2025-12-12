const { Joi } = require('celebrate')
const { PagingBaseSchema } = require('./BaseSchema')

const searchParamsSchema = PagingBaseSchema.keys({
    category: Joi.string().allow("").max(100).optional(),
    sub_category: Joi.string().allow("").max(100).optional(),
    code: Joi.string().allow("").max(100).optional(),
})

const createParamsSchema = Joi.object().keys({
    category: Joi.string().max(100).required(),
    sub_category: Joi.string().max(100).required(),
    code: Joi.string().max(100).required(),
    value: Joi.string().required(),
    remark: Joi.string().allow("").required(),
    sequence: Joi.string().allow("").required(),
})

const updateParamsSchema = Joi.object().keys({
    category: Joi.string().max(100).required(),
    sub_category: Joi.string().max(100).required(),
    code: Joi.string().max(100).required(),
    value: Joi.string().required(),
    remark: Joi.string().allow("").required(),
    sequence: Joi.string().allow("").required(),
})

const deleteParamsSchema = Joi.object().keys({
    category: Joi.string().max(100).required(),
    sub_category: Joi.string().max(100).required(),
    code: Joi.string().max(100).required(),    
})

const deleteSystemParamsSchema = Joi.array().items(deleteParamsSchema).min(1).required()

module.exports = { searchParamsSchema, 
    createParamsSchema,
    updateParamsSchema, 
    deleteParamsSchema,
    deleteSystemParamsSchema
}