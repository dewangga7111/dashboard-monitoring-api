const { Joi } = require('celebrate')
const Constant = require('../helper/Constant')
const MessageUtil = require('../helper/MessageUtil')
const { PagingBaseSchema, RecaptchaBaseSchema } = require('./BaseSchema')

const password_pattern_msg = {
    'string.pattern.base': MessageUtil.GetMsg('invalid.password.pattern')
}

const searchParamSchema = PagingBaseSchema.keys({
    user_id: Joi.string().allow("").max(50).optional(),
    name: Joi.string().allow("").max(50).optional(),
    email: Joi.string().allow("").max(100).optional(),
    phone: Joi.string().allow("").max(100).optional(),
    role_id: Joi.string().allow("").max(50).optional(),
    status: Joi.string().allow("").max(2).optional(),
})

const createParamSchema = Joi.object().keys({
    user_id : Joi.string().max(50).required(),
    name: Joi.string().max(50).required(),
    email: Joi.string().email().max(100).required(),
    phone: Joi.string().max(100).required(),
    password: Joi.string().pattern(new RegExp(Constant.REGEX_PASSWORD)).required().messages(password_pattern_msg),
    role_id: Joi.string().max(50).required(),
    status: Joi.string().max(2).required(),
})

const updateParamSchema = Joi.object().keys({
    user_id : Joi.string().max(50).required(),
    name: Joi.string().max(50).required(),
    email: Joi.string().email().max(100).required(),
    phone: Joi.string().max(100).required(),
    role_id: Joi.string().max(50).required(),
    status: Joi.string().max(2).required(),
})

const changePasswordParamSchema = Joi.object().keys({
    old_password: Joi.string().pattern(new RegExp(Constant.REGEX_PASSWORD)).required().messages(password_pattern_msg),
    new_password: Joi.string().pattern(new RegExp(Constant.REGEX_PASSWORD)).required().messages(password_pattern_msg),
})

const resetPasswordParamSchema = Joi.object().keys({
    user_id : Joi.string().max(50).required(),
    new_password: Joi.string().pattern(new RegExp(Constant.REGEX_PASSWORD)).required().messages(password_pattern_msg),
})

const registerParamSchema = RecaptchaBaseSchema.keys({
    user_id : Joi.string().max(50).required(),
    name: Joi.string().max(50).required(),
    email: Joi.string().email().max(100).required(),
    phone: Joi.string().max(100).required(),
    password: Joi.string().pattern(new RegExp(Constant.REGEX_PASSWORD)).required().messages(password_pattern_msg),
})

const primaryParamSchema = Joi.object().keys({
    user_id: Joi.string().required()
})

const deleteParamSchema = Joi.array().items(primaryParamSchema).min(1).required()

module.exports = {
    searchParamSchema,
    createParamSchema,
    updateParamSchema,
    changePasswordParamSchema,
    registerParamSchema,
    primaryParamSchema,
    deleteParamSchema,
    resetPasswordParamSchema
}