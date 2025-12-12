const { Joi } = require('celebrate')
const { PagingBaseSchema } = require('./BaseSchema')

const searchParamsSchema = PagingBaseSchema.keys({
    role_name: Joi.string().allow("").max(100).optional(),    
})

const primaryParamSchema = Joi.object().keys({
    role_id: Joi.string().max(50).required(),    
})

const saveParamSchema = Joi.object().keys({
    role_id: Joi.string().max(100).required(),
    permissions: Joi.array().items(
        Joi.object().keys({
            function_id: Joi.string().max(50).required(),
            function_name: Joi.string().max(100).optional(),
            menu_name: Joi.string().max(100).optional(),
            create: Joi.string().allow('Y', 'N').max(1).required(),
            read: Joi.string().allow('Y', 'N').max(1).required(),
            update: Joi.string().allow('Y', 'N').max(1).required(),
            delete: Joi.string().allow('Y', 'N').max(1).required(),
            approve: Joi.string().allow('Y', 'N').max(1).required(),
        })
    ).min(1).required()    
})

module.exports = { 
    searchParamsSchema, 
    primaryParamSchema,
    saveParamSchema
}