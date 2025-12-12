const StringUtil = require('./StringUtil')

class LoggerUtil {
    #prefix = "";
    constructor(prefix="") {
        this.#prefix = prefix
    }
    info(message) { 
        console.log(StringUtil.formatDateToDbStamp(), 'info  -', this.#prefix, message)
    }
    error(functionName, error) {
        console.log(StringUtil.formatDateToDbStamp(), 'error -', this.#prefix + '.' + functionName, error)
    }    
}

module.exports = LoggerUtil