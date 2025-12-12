const LogActivity = require("../model/LogActivity");

module.exports = {
  async updateLastLogin(userName) {
    let param = {
      userName,
      lastLogin: new Date(),
    };
    const activityId = await LogActivity.insertLogUser(param, userName);
    return activityId;
  },
  async updateInactive(userName, activityId) {
    let param = {
      activityId,
      userName,
      lastLogout: new Date(),
    };
    await LogActivity.updateLogUser(param, userName);
  },
  async summaryActivity(userName){
    let params = {
      userName
    }
    return await LogActivity.summaryLastActivity(params)
  }
};
