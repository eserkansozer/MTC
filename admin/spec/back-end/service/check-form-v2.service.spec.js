'use strict'
/* global describe, it, expect, spyOn beforeEach fail */
const fs = require('fs-extra')

const checkFormPresenter = require('../../../helpers/check-form-presenter')
const checkFormV2DataService = require('../../../services/data-access/check-form-v2.data.service')
const checkFormV2Service = require('../../../services/check-form-v2.service')
const checkFormsValidator = require('../../../lib/validator/check-form/check-forms-validator')
const ValidationError = require('../../../lib/validation-error')

describe('check-form-v2.service', () => {
  describe('saveCheckForms', () => {
    let uploadData
    let requestData
    beforeEach(() => {
      spyOn(checkFormV2Service, 'prepareSubmissionData')
      spyOn(checkFormV2DataService, 'sqlInsertCheckForms')
      uploadData = { filename: 'filename' }
      requestData = { checkFormType: 'L' }
    })
    it('calls prepareData and sqlInsertCheckForms when no validation error is detected', async () => {
      spyOn(checkFormV2DataService, 'sqlFindActiveCheckForms').and.returnValue([])
      spyOn(checkFormsValidator, 'validate').and.returnValue(new ValidationError())
      try {
        await checkFormV2Service.saveCheckForms(uploadData, requestData)
      } catch (error) {
        fail()
      }
      expect(checkFormV2DataService.sqlFindActiveCheckForms).toHaveBeenCalled()
      expect(checkFormsValidator.validate).toHaveBeenCalled()
      expect(checkFormV2Service.prepareSubmissionData).toHaveBeenCalled()
      expect(checkFormV2DataService.sqlInsertCheckForms).toHaveBeenCalled()
    })
    it('does not call prepareData and sqlInsertCheckForms when validation error is detected', async () => {
      spyOn(checkFormV2DataService, 'sqlFindActiveCheckForms').and.returnValue([])
      const validationError = new ValidationError()
      validationError.addError('csvFile', 'error')
      spyOn(checkFormsValidator, 'validate').and.returnValue(validationError)
      try {
        await checkFormV2Service.saveCheckForms(uploadData, requestData)
        fail()
      } catch (error) {
        expect(error.name).toBe('ValidationError')
      }
      expect(checkFormV2DataService.sqlFindActiveCheckForms).toHaveBeenCalled()
      expect(checkFormsValidator.validate).toHaveBeenCalled()
      expect(checkFormV2Service.prepareSubmissionData).not.toHaveBeenCalled()
      expect(checkFormV2DataService.sqlInsertCheckForms).not.toHaveBeenCalled()
    })
  })
  describe('prepareSubmissionData', () => {
    it('reads valid csv and extracts submission data', async () => {
      const fileDir = 'spec/back-end/mocks/check-forms/check-form-valid.csv'
      const checkFormType = 'L'
      const uploadedFiles = [
        {
          filename: 'filename1',
          file: fileDir
        }
      ]
      const fileData = fs.readFileSync(fileDir, 'utf8')
      const rows = fileData.split('\n')
      rows.splice(-1, 1)
      const dataRows = rows.map(r => r.split(','))
      const formData = []
      dataRows.forEach(dataRow => {
        const question = {}
        question.f1 = parseInt(dataRow[0], 10)
        question.f2 = parseInt(dataRow[1], 10)
        formData.push(question)
      })
      const submissionData = await checkFormV2Service.prepareSubmissionData(uploadedFiles, checkFormType)
      expect(submissionData).toBeDefined()
      expect(submissionData[0].name).toBe('filename1')
      expect(submissionData[0].isLiveCheckForm).toBe(1)
      expect(submissionData[0].formData).toEqual(JSON.stringify(formData))
    })
  })
  describe('hasExistingFamiliarisationCheckForm', () => {
    it('finds a familiarisation check form and returns true to indicate it exists', async () => {
      spyOn(checkFormV2DataService, 'sqlFindFamiliarisationCheckForm').and.returnValue({ id: 1 })
      const result = await checkFormV2Service.hasExistingFamiliarisationCheckForm()
      expect(result).toBeTruthy()
    })
    it('finds a familiarisation check form and returns true to indicate it exists', async () => {
      spyOn(checkFormV2DataService, 'sqlFindFamiliarisationCheckForm').and.returnValue({})
      const result = await checkFormV2Service.hasExistingFamiliarisationCheckForm()
      expect(result).toBeFalsy()
    })
  })
  describe('getSavedForms', () => {
    it('find non deleted check forms and converts the data for the presentation layer ', async () => {
      spyOn(checkFormV2DataService, 'sqlFindActiveCheckForms')
      spyOn(checkFormPresenter, 'getPresentationListData')
      await checkFormV2Service.getSavedForms()
      expect(checkFormV2DataService.sqlFindActiveCheckForms).toHaveBeenCalled()
      expect(checkFormPresenter.getPresentationListData).toHaveBeenCalled()
    })
  })
  describe('getCheckFormName', () => {
    it('fetches the name of the check form based on urlSlug provided', async () => {
      spyOn(checkFormV2DataService, 'sqlFindCheckFormByUrlSlug').and.returnValue({ id: 1, name: 'name' })
      const result = await checkFormV2Service.getCheckFormName()
      expect(checkFormV2DataService.sqlFindCheckFormByUrlSlug).toHaveBeenCalled()
      expect(result).toBe('name')
    })
  })
  describe('getCheckForm', () => {
    it('fetches view single check form data for the presentation layer ', async () => {
      spyOn(checkFormV2DataService, 'sqlFindCheckFormByUrlSlug')
      spyOn(checkFormPresenter, 'getPresentationCheckFormData')
      await checkFormV2Service.getCheckForm()
      expect(checkFormV2DataService.sqlFindCheckFormByUrlSlug).toHaveBeenCalled()
      expect(checkFormPresenter.getPresentationCheckFormData).toHaveBeenCalled()
    })
  })
})