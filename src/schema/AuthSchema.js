const { Joi } = require('celebrate')
const { RecaptchaBaseSchema } = require('./BaseSchema')

const loginParamsSchema = RecaptchaBaseSchema.keys({
    user_id: Joi.string().max(50).required(),
    password: Joi.string().max(50).required(),
    remember_me: Joi.boolean().allow("",null).required(),
})

const forgotParamsSchema = Joi.object().keys({
    email: Joi.string().max(100).required()
}).unknown(true)

const verifyParamsSchema = Joi.object().keys({
    email: Joi.string().max(100).required(),
    otp: Joi.string().max(4).required()
}).unknown(true)

const resetParamsSchema = Joi.object().keys({
    email: Joi.string().max(100).required(),
    new_password: Joi.string().max(100).required(),
}).unknown(true)

const logoutParamsSchema = Joi.object().keys({
    activity_id: Joi.string().max(50).required(),
    user_id: Joi.string().max(20).required(),
}).unknown(true)


module.exports = { loginParamsSchema, forgotParamsSchema, verifyParamsSchema, resetParamsSchema, logoutParamsSchema }