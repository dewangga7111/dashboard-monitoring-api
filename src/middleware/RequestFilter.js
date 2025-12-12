const ms = require('ms')
const ResponseUtil = require("../helper/ResponseUtil");
const JwtUtil = require('../helper/JwtUtil');
const LoggerUtil = require('../helper/LoggerUtil');
const MessageUtil = require('../helper/MessageUtil')
const StringUtil = require('../helper/StringUtil')
const CaptchaHelper = require('../helper/CaptchaHelper')

const Logger = new LoggerUtil('RequestFilter');

const Permission = require('../model/Permission')

const getToken = (req) => {
  let token
  if (req.headers.authorization) {
    token = req.headers.authorization.slice(7, req.headers.authorization.length)
  } else if (req.query.token) {
    token = req.query.token
  }
  return token;
};

const RequestLogFilter = (req, res, next) => {
  Logger.info(`hostname: ${req.hostname}, ip: ${req.ip}`)
  Logger.info(`${req.method} ${req.url}`)
  if (JSON.stringify(req.query) != "{}") {
    Logger.info(`query param: ${JSON.stringify(req.query)}`)
  } 
  if (req.method == 'POST' || req.method == 'PUT' || req.method == 'DELETE') {
    let bd
    if (req.body.password) {
      bd = { ...req.body }
      bd.password = ""
    } else if (req.body.old_password || req.body.new_password) {
      bd = { ...req.body }
      bd.old_password = ""
      bd.new_password = ""
    } else {
      bd = { ...req.body }
    }
    Logger.info(`body param: ${JSON.stringify(bd).substring(0, 100)}...`)
  }
  next()
}

const CaptchaFilter = async(req, res, next) => {
  let recaptcha_token;
  if(req.body.recaptcha_token) {
    recaptcha_token = req.body.recaptcha_token
  }

  if(process.env.CAPTCHA_ACTIVATE != 'true') {
    return next()    
  }

  if(!recaptcha_token) {
    return ResponseUtil.Unauthorized(res, MessageUtil.GetMsg('captcha.failed'))
  }

  const captchaResp = await CaptchaHelper.verifyCaptcha(recaptcha_token)
  if(captchaResp && captchaResp.data && captchaResp.success) {
    return next()
  } else {
    return ResponseUtil.Unauthorized(res, MessageUtil.GetMsg('captcha.failed'))
  }
}

const JwtFilter = async (req, res, next) => {
  let token = getToken(req)

  console.log('token', token)

  if (!token) {
    Logger.info('Token not found')
    return ResponseUtil.Unauthorized(res, MessageUtil.GetMsg("not.found", 'Token'));
  }

  if (!await JwtUtil.verifyJwt(req, token)) {
    Logger.info('Token failed verification: ' + token)
    return ResponseUtil.Unauthorized(res, MessageUtil.GetMsg("invalid", 'Token'));
  }
  
  next();
};

const PermissionFilter = (function_id, action) => {
  return async (req, res, next) => {
    if(!req.user) {
      Logger.info('API not call JwtFilter before PermissionFilter')
      return ResponseUtil.InternalServerErr(res);
    }

    const { role_id } = req.user    
    console.log('role_id', role_id)
    let permissions = await Permission.getBy({ role_id })

    let access = permissions.filter(f => f.function_id == function_id && f[action.toLowerCase()] == 'Y')
    if(access && access.length > 0) {
      next()
    } else {
      return ResponseUtil.Forbidden(res)
    }
  }
};

const StaticFilter = async (req, res, next) => {
  let token = getToken(req)

  if(token) {
    if(JwtUtil.verifyJwt(req, token)) {
      next()
    } else if(token == process.env.STATIC_TOKEN){
      next()
    } else {
      Logger.info('Token failed verification: ' + token)
      return ResponseUtil.Unauthorized(res, MessageUtil.GetMsg("invalid", 'Token'));
    }
  } else {
    Logger.info('Token not found')
    return ResponseUtil.Unauthorized(res, MessageUtil.GetMsg("not.found", 'Token'));
  }
};

const CreateLog = (action, screen) => {
  return (req, res) => {
    const logger = new Log();
    var who;
    if (req.user.username) {
      who = req.user.username;
    } else {
      who = req.body.username;
    }
    let act, param;
    switch (action) {
      case "view":
        param = JSON.stringify(req.query).replace(/[{}]/g, "");
        act = `Viewed list data. `;
        if (param != "") {
          act += `[${param}]`;
        }
        break;
      case "add":
        param = Object.keys(req.body);
        act = `Added data. [${param}]`;
        break;
      case "edit":
        param = Object.keys(req.body);
        act = `Edited data. [${param}]`;
        break;
      case "delete":
        param = JSON.stringify(req.body);
        act = `Deleted data. [${param}]`;
        break;
      case "review":
        param = req.body;
        if (param.reviewStatus == "Approved") {
          act = `Approved data. [${JSON.stringify(param)}]`;
        } else {
          act = `Rejected data. [${JSON.stringify(param)}]`;
        }
        break;
      case "publish":
        param = JSON.stringify(req.body).replace(/[{}]/g, "");
        act = `Published data. [${param}]`;
        break;
      case "download":
        param = JSON.stringify(req.query).replace(/[{}]/g, "");
        act = "Download data. ";
        if (param != "") {
          act += `[${param}]`;
        }
        break;
      case "upload":
        act = "Upload data.";
        break;
      case "login":
        act = "User logged in.";
        break;
      case "logout":
        act = "User manually logged out.";
        break;
      default:
        act = "Log doesn't recorded";
    }
    const logData = {
      logId: StringUtil.generateUUID(),
      action: act,
      screen: screen,
    };
    logger.insertLog(logData, who, (error, result) => {
      return;
    });
  };
};

const SetHeader = () => {
  return (req, res, next) => {
    res.removeHeader("X-Powered-By");
    res.setHeader('X-Content-Type-Options', "nosniff");
    res.setHeader(
      'Content-Security-Policy-Report-Only',
      "default-src 'self'; font-src 'self'; img-src 'self'; script-src 'self'; style-src 'self'; frame-src 'self'"
    );
    next();
  }
}

const SetCORS = () => {
  return (req, callback) => {
    const origins = process.env.ORIGIN.replace(/ /g, '').split(',');
    const corsOptions = (origins.indexOf(req.header('Origin')) !== -1) ? { origin: true } : { origin: false };
    callback(null, corsOptions) // callback expects two parameters: error and options
  }
}

module.exports = { RequestLogFilter, JwtFilter, PermissionFilter, CaptchaFilter, CreateLog, SetHeader, SetCORS, getToken, StaticFilter };
