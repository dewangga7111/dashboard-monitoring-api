const { Router } = require('express');
const { celebrate, Joi } = require('celebrate')
const { JwtFilter } = require('../../middleware/RequestFilter');

const ComboController = require('../../controller/ComboController');
const router = Router()

router.all('/*', JwtFilter)
// Combo Controller
router.get('/user-role', ComboController.userRoleList)
router.get('/user-status', ComboController.statusUser)
router.get('/data-source-type', ComboController.dataSourceType)
router.get('/data-source', ComboController.dataSource)
router.get('/function-menu', ComboController.functionMenu)

module.exports = router