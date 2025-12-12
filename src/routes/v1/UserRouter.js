const { Router } = require('express');
const { celebrate } = require('celebrate');
const { CaptchaFilter, JwtFilter, PermissionFilter } = require('../../middleware/RequestFilter');

const Constant = require('../../helper/Constant')
const Controller = require('../../controller/UserController');
const Schema = require('../../schema/UserSchema')
const router = Router()

const FUNCTION_ID = Constant.FUNCTION_ID_USER_MASTER

router.all('/', JwtFilter)
router.route('/')
    .get(PermissionFilter(FUNCTION_ID, Constant.ACTION_READ), celebrate({ query: Schema.searchParamSchema }), Controller.search)
    .post(PermissionFilter(FUNCTION_ID, Constant.ACTION_CREATE), celebrate({ body: Schema.createParamSchema }), Controller.create)
    .put(PermissionFilter(FUNCTION_ID, Constant.ACTION_UPDATE), celebrate({ body: Schema.updateParamSchema }), Controller.update)
    .delete(PermissionFilter(FUNCTION_ID, Constant.ACTION_DELETE), celebrate({ query: Schema.primaryParamSchema }), Controller.delete)

router.get('/detail', JwtFilter, PermissionFilter(FUNCTION_ID, Constant.ACTION_READ), celebrate({ query: Schema.primaryParamSchema }), Controller.detail)
router.put('/change-password', JwtFilter, celebrate({ body: Schema.changePasswordParamSchema }), Controller.changePassword)
router.put('/reset-password', JwtFilter, celebrate({ body: Schema.resetPasswordParamSchema }), Controller.resetPassword)
router.delete('/delete-many', JwtFilter, PermissionFilter(FUNCTION_ID, Constant.ACTION_DELETE), celebrate({ body: Schema.deleteParamSchema }), Controller.deleteMany)

router.post('/register', celebrate({ body: Schema.registerParamSchema }), CaptchaFilter, Controller.registerUser)

module.exports = router