const config = require('../../../config')

module.exports.generateSql = () => {
  return `GRANT DELETE ON [mtc_admin].[schoolScore] TO ${config.Sql.Application.Username}`
}
