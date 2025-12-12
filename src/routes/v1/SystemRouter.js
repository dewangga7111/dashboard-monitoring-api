const { Router } = require('express');
const { celebrate } = require('celebrate');

const Constant = require('../../helper/Constant')
const { JwtFilter, PermissionFilter } = require('../../middleware/RequestFilter');
const Controller = require('../../controller/SystemController');
const Schema = require('../../schema/SystemSchema')
const router = Router()

const FUNCTION_ID = Constant.FUNCTION_ID_SYSTEM_MASTER

router.all('/*', JwtFilter)

router.route('/')
    .get(PermissionFilter(FUNCTION_ID, Constant.ACTION_READ), celebrate({ query: Schema.searchParamsSchema }), Controller.search)
    .post(PermissionFilter(FUNCTION_ID, Constant.ACTION_CREATE), celebrate({ body: Schema.createParamsSchema }), Controller.create)
    .put(PermissionFilter(FUNCTION_ID, Constant.ACTION_UPDATE), celebrate({ body: Schema.updateParamsSchema }), Controller.update)
    .delete(PermissionFilter(FUNCTION_ID, Constant.ACTION_DELETE), celebrate({ body: Schema.deleteParamsSchema }), Controller.delete)

router.delete('/delete-many', PermissionFilter(FUNCTION_ID, Constant.ACTION_DELETE), celebrate({ body: Schema.deleteSystemParamsSchema }), Controller.deleteMany)    

module.exports = router