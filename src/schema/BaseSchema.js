const { Joi } = require('celebrate')

const BaseSchema = Joi.object().keys({
    createdDt: Joi.date().required(),
    createdBy: Joi.string().max(20).required(),
    createdDt: Joi.date().required(),
    createdBy: Joi.string().max(20).required(),
})

const PagingBaseSchema = Joi.object().keys({
    page: Joi.number().integer().min(1).optional(),
    per_page: Joi.number().integer().min(1).optional(),
    order_by: Joi.string().allow("").optional(),
    dir: Joi.string().allow("").optional()
})

const RecaptchaBaseSchema = Joi.object().keys({
    recaptcha_token: (process.env.CAPTCHA_ACTIVATE == 'true') ? Joi.string().required(): Joi.string().allow('').optional(),
})

module.exports = { BaseSchema, PagingBaseSchema, RecaptchaBaseSchema }