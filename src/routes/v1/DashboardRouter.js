const { Router } = require('express');
const { celebrate } = require('celebrate');

const Constant = require('../../helper/Constant');
const { JwtFilter, PermissionFilter } = require('../../middleware/RequestFilter');
const Controller = require('../../controller/DashboardController');
const Schema = require('../../schema/DashboardSchema');
const router = Router();

const FUNCTION_ID = Constant.FUNCTION_ID_DASHBOARD;

router.all('/', JwtFilter);
router.route('/')
    .get(PermissionFilter(FUNCTION_ID, Constant.ACTION_READ), celebrate({ query: Schema.searchParamSchema }), Controller.search)
    .post(PermissionFilter(FUNCTION_ID, Constant.ACTION_CREATE), celebrate({ body: Schema.createParamSchema }), Controller.create)
    .put(PermissionFilter(FUNCTION_ID, Constant.ACTION_UPDATE), celebrate({ body: Schema.updateParamSchema }), Controller.update)
    .delete(PermissionFilter(FUNCTION_ID, Constant.ACTION_DELETE), celebrate({ query: Schema.primaryParamSchema }), Controller.delete);

router.get('/detail', JwtFilter, PermissionFilter(FUNCTION_ID, Constant.ACTION_READ), celebrate({ query: Schema.primaryParamSchema }), Controller.detail);
router.delete('/delete-many', JwtFilter, PermissionFilter(FUNCTION_ID, Constant.ACTION_DELETE), celebrate({ body: Schema.deleteParamSchema }), Controller.deleteMany);

module.exports = router;