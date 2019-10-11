'use strict'

const administrationMessageDataService = require('./data-access/administration-message.data.service')
const emptyFieldsValidator = require('../lib/validator/common/empty-fields-validators')
const serviceMessageErrorMessages = require('../lib/errors/service-message')

const administrationMessageService = {}

/**
 * Get the current service message
 * @returns {object}
 */
administrationMessageService.getMessage = async () => {
  return administrationMessageDataService.sqlFindActiveServiceMessage()
}

/**
 * Validates and stores the service message data
 * @param {object} requestData
 * @param {string} userId
 * @returns {Promise<*>}
 */
administrationMessageService.setMessage = async (requestData, userId) => {
  if (!userId) {
    throw new Error('User id not found in session')
  }
  const { serviceMessageTitle, serviceMessageContent } = requestData
  const serviceMessageErrors = emptyFieldsValidator.validate([
    { fieldKey: 'serviceMessageTitle', fieldValue: serviceMessageTitle, errorMessage: serviceMessageErrorMessages.emptyServiceMessageTitle },
    { fieldKey: 'serviceMessageContent', fieldValue: serviceMessageContent, errorMessage: serviceMessageErrorMessages.emptyServiceMessageContent }
  ])
  if (serviceMessageErrors.hasError()) {
    return serviceMessageErrors
  }

  const serviceMessageData = administrationMessageService.prepareSubmissionData(requestData, userId)
  return requestData.isEditView
    ? administrationMessageDataService.sqlUpdate(serviceMessageData) : administrationMessageDataService.sqlCreate(serviceMessageData)
}

/**
 * Prepare the service message data for sql transmission
 * @param {object} requestData
 * @param {string} userId
 * @returns {Object}
 */
administrationMessageService.prepareSubmissionData = (requestData, userId) => {
  const serviceMessageData = {}
  if (requestData.isEditView) {
    serviceMessageData.updatedByUser_id = userId
  } else {
    serviceMessageData.recordedByUser_id = userId
  }
  serviceMessageData.title = requestData.serviceMessageTitle
  serviceMessageData.message = requestData.serviceMessageContent
  return serviceMessageData
}

/**
 * Drops the service message
 * @returns {Promise<*>}
 */
administrationMessageService.dropMessage = async (userId) => {
  if (!userId) {
    throw new Error('User id not found in session')
  }
  const sqlDeleteParams = {}
  sqlDeleteParams['deletedByUser_id'] = userId
  return administrationMessageDataService.sqlDeleteServiceMessage(sqlDeleteParams)
}

module.exports = administrationMessageService