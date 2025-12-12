const axios = require('axios')
const FormData = require('form-data')
const LoggerUtil = require('../helper/LoggerUtil')

const logger = new LoggerUtil('CaptchaHelper')

module.exports = {
    verifyCaptcha: async (recaptcha_token) => {
        const formData = new FormData()
        formData.append('secret', process.env.CAPTCHA_BE_SECRET)
        formData.append('response', recaptcha_token)
        const options = {
            method: 'POST',
            headers: formData.getHeaders(),
            data: formData,
            url: `${process.env.CAPTCHA_VERIFY_URL}`
        }
    
        logger.info('Verify Captcha: ' + recaptcha_token)
        return await axios(options)
    }
}