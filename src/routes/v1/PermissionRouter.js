const { Router } = require('express');
const { celebrate, Joi } = require('celebrate');

const Constant = require('../../helper/Constant')
const { JwtFilter, PermissionFilter } = require('../../middleware/RequestFilter');
const Controller = require('../../controller/PermissionController');
const Schema = require('../../schema/PermissionSchema')
const router = Router()

const FUNCTION_ID = Constant.FUNCTION_ID_ROLE_PERMISSION

router.all('/*', JwtFilter)

router.get('/detail', PermissionFilter(FUNCTION_ID, Constant.ACTION_READ), celebrate({ query: Schema.primaryParamSchema}), Controller.detail)
router.get('/role-list', PermissionFilter(FUNCTION_ID, Constant.ACTION_READ), celebrate({ query: Schema.searchParamsSchema}), Controller.roleList)
router.post('/save', PermissionFilter(FUNCTION_ID, Constant.ACTION_CREATE), celebrate({ body: Schema.saveParamSchema }), Controller.save)

module.exports = router