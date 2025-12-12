const { Router } = require('express');

const routes = Router();
routes.use('/auth', require('./AuthRouter'))
routes.use('/user', require('./UserRouter'))
routes.use('/system', require('./SystemRouter'))
routes.use('/combo', require('./ComboRouter'))
routes.use('/permission', require('./PermissionRouter'))

module.exports = routes;