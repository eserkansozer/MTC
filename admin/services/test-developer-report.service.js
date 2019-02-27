'use strict'

const psychometricianReportDataService = require('./data-access/psychometrician-report.data.service')
const azureFileDataService = require('./data-access/azure-file.data.service')

const testDeveloperReportService = {
  /**
   * Return the database record / meta information for the latest psychometrician report
   * @return {Promise<*|Promise<*>>}
   */
  getReportMeta: async function getReportMeta (urlSlug = null) {
    let report
    if (urlSlug) {
      console.log('getting by url slug')
      report = await psychometricianReportDataService.sqlGetByUrlSlug(urlSlug)
    } else {
      console.log('getting latest')
      report = await psychometricianReportDataService.getLatest()
    }
    return report
  },

  /**
   * Get existing psychometrician report file
   * @return {Object}
   */
  downloadFile: async function downloadFile (container, fileName, stream) {
    return azureFileDataService.azureDownloadFileStream(container, fileName, stream)
  }
}

module.exports = testDeveloperReportService
