'use strict'
const moment = require('moment')
const R = require('ramda')
const ValidationError = require('../../validation-error')
const dateService = require('../../../services/date.service')

const newCheckWindowNameValidator = require('./new-check-window-name-validator')
const checkWindowAdminStartDateValidator = require('./new-check-window-admin-start-date-validator')
const checkWindowAdminEndDateValidator = require('./new-check-window-admin-end-date-validator')
const checkWindowFamiliarisationCheckStartDateValidator = require('./new-check-window-familiarisation-check-start-date-validator')
const checkWindowFamiliarisationCheckEndDateValidator = require('./new-check-window-familiarisation-check-end-date-validator')
const checkWindowLiveCheckStartDateValidator = require('./new-check-window-live-check-start-date-validator')
const checkWindowLiveCheckEndDateValidator = require('./new-check-window-live-check-end-date-validator')

/**
 * Validates check window insertion data
 * @param {Object} checkWindowData
 * @returns {Object}
 */
module.exports.validate = (checkWindowData) => {
  const validationError = new ValidationError()
  const checkWindowName = R.path(['checkWindowName'], checkWindowData)
  newCheckWindowNameValidator.validate(validationError, checkWindowName)

  const adminStartDateData = R.pick(['adminStartDay', 'adminStartMonth', 'adminStartYear'], checkWindowData)
  checkWindowAdminStartDateValidator.validate(validationError, adminStartDateData)

  const adminEndDateData = R.pick(['adminEndDay', 'adminEndMonth', 'adminEndYear'], checkWindowData)
  checkWindowAdminEndDateValidator.validate(validationError, adminEndDateData)

  const familiarisationCheckStartData = R.pick(['familiarisationCheckStartDay', 'familiarisationCheckStartMonth', 'familiarisationCheckStartYear'], checkWindowData)
  checkWindowFamiliarisationCheckStartDateValidator.validate(validationError, familiarisationCheckStartData)

  const familiarisationCheckEndData = R.pick(['familiarisationCheckEndDay', 'familiarisationCheckEndMonth', 'familiarisationCheckEndYear'], checkWindowData)
  checkWindowFamiliarisationCheckEndDateValidator.validate(validationError, familiarisationCheckEndData)

  const liveCheckStartData = R.pick(['liveCheckStartDay', 'liveCheckStartMonth', 'liveCheckStartYear'], checkWindowData)
  checkWindowLiveCheckStartDateValidator.validate(validationError, liveCheckStartData)

  const liveCheckEndData = R.pick(['liveCheckEndDay', 'liveCheckEndMonth', 'liveCheckEndYear'], checkWindowData)
  checkWindowLiveCheckEndDateValidator.validate(validationError, liveCheckEndData)

  const adminStartDate = dateService.createUTCFromDayMonthYear(checkWindowData['adminStartDay'],
    checkWindowData['adminStartMonth'], checkWindowData['adminStartYear'])
  const adminEndDate = dateService.createUTCFromDayMonthYear(checkWindowData['adminEndDay'],
    checkWindowData['adminEndMonth'], checkWindowData['adminEndYear'])
  const familiarisationCheckStartDate = dateService.createUTCFromDayMonthYear(checkWindowData['familiarisationCheckStartDay'],
    checkWindowData['familiarisationCheckStartMonth'], checkWindowData['familiarisationCheckStartYear'])
  const familiarisationCheckEndDate = dateService.createUTCFromDayMonthYear(checkWindowData['familiarisationCheckEndDay'],
    checkWindowData['familiarisationCheckEndMonth'], checkWindowData['familiarisationCheckEndYear'])
  const liveCheckStartDate = dateService.createUTCFromDayMonthYear(checkWindowData['liveCheckStartDay'],
    checkWindowData['liveCheckStartMonth'], checkWindowData['liveCheckStartYear'])
  const liveCheckEndDate = dateService.createUTCFromDayMonthYear(checkWindowData['liveCheckEndDay'],
    checkWindowData['liveCheckEndMonth'], checkWindowData['liveCheckEndYear'])

  // Compare date fields
  // Admin start date
  if (adminStartDate && moment(adminStartDate).isAfter(familiarisationCheckStartDate)) {
    validationError.addError('adminStartDateAfterFamiliarisationCheckStartDate', true)
  }
  if (adminStartDate && moment(adminStartDate).isAfter(liveCheckStartDate)) {
    validationError.addError('adminStartDateAfterLiveCheckStartDate', true)
  }
  // Admin end date
  if (adminEndDate && moment(adminEndDate).isBefore(adminStartDate)) {
    validationError.addError('adminEndDateBeforeAdminStartDate', true)
  }
  if (adminEndDate && moment(adminEndDate).isBefore(liveCheckEndDate)) {
    validationError.addError('adminEndDateBeforeLiveCheckEndDate', true)
  }
  if (adminEndDate && moment(adminEndDate).isBefore(familiarisationCheckEndDate)) {
    validationError.addError('adminEndDateBeforeFamiliarisationCheckEndDate', true)
  }
  // Familiarisation check start date
  if (familiarisationCheckStartDate && moment(familiarisationCheckStartDate).isAfter(liveCheckStartDate)) {
    validationError.addError('familiarisationCheckStartDateAfterLiveCheckStartDate', true)
  }
  if (familiarisationCheckStartDate && moment(familiarisationCheckStartDate).isAfter(familiarisationCheckEndDate)) {
    validationError.addError('familiarisationCheckStartDateAfterFamiliarisationCheckEndDate', true)
  }
  // Familiarisation check end date
  if (familiarisationCheckEndDate && moment(familiarisationCheckEndDate).isBefore(adminStartDate)) {
    validationError.addError('familiarisationCheckEndDateBeforeAdminStartDate', true)
  }
  // Live check start date
  if (liveCheckStartDate && moment(liveCheckStartDate).isAfter(liveCheckEndDate)) {
    validationError.addError('liveCheckStartDateAfterLiveCheckEndDate', true)
  }
  // Live check end date
  if (liveCheckEndDate && moment(liveCheckEndDate).isBefore(adminStartDate)) {
    validationError.addError('liveCheckEndDateBeforeAdminStartDate', true)
  }
  // if (familiarisationCheckStartDate && moment(familiarisationCheckStartDate).isBefore(adminStartDate)) {
  //   validationError.addError('familiarisationCheckStartDateBeforeAdminStartDate', true)
  // }
  // if (familiarisationCheckEndDate && moment(familiarisationCheckEndDate).isAfter(adminEndDate)) {
  //   validationError.addError('familiarisationCheckEndDateAfterAdminEndDate', true)
  // }
  // if (familiarisationCheckEndDate && moment(familiarisationCheckEndDate).isBefore(familiarisationCheckStartDate)) {
  //   validationError.addError('familiarisationCheckEndDateBeforeFamiliarisationCheckStartDate', true)
  // }
  // Live check start date
  // if (liveCheckStartDate && moment(liveCheckStartDate).isBefore(adminStartDate)) {
  //   validationError.addError('liveCheckStartDateBeforeAdminStartDate', true)
  // }
  // if (liveCheckStartDate && moment(liveCheckStartDate).isBefore(familiarisationCheckStartDate)) {
  //   validationError.addError('liveCheckStartDateBeforeFamiliarisationCheckStartDate', true)
  // }
  // if (liveCheckEndDate && moment(liveCheckEndDate).isBefore(liveCheckStartDate)) {
  //   validationError.addError('liveCheckEndDateBeforeLiveCheckStartDate', true)
  // }
  return validationError
}
