const { Router } = require('express');
const { celebrate } = require('celebrate');
const { CaptchaFilter, JwtFilter } = require('../../middleware/RequestFilter');
const AuthController = require('../../controller/AuthController');
const AuthSchema = require('../../schema/AuthSchema')
const router = Router()

router.post('/login', celebrate({ body: AuthSchema.loginParamsSchema }), CaptchaFilter, AuthController.login)
router.post('/logout', celebrate({body : AuthSchema.logoutParamsSchema}), AuthController.logout)
router.get('/check-token', JwtFilter, AuthController.checkToken)
router.post('/forgot-password', celebrate({ body: AuthSchema.forgotParamsSchema}), AuthController.forgot)
router.post('/verify-otp', celebrate({ body: AuthSchema.verifyParamsSchema}), AuthController.verify)
router.post('/reset-password', celebrate({ body: AuthSchema.resetParamsSchema}), AuthController.reset)

module.exports = router